import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildRecord, brazilDay, canDiscover, classify, doi, editorialNotices, extractDois, normalizeWork,
  publicationDate, recordPath, relatedVersions, sameTitle, selection, stable, validateRecord } from './core.mjs';
import { refine } from './refine.mjs';
import { Budget } from './http.mjs';

export const policy = JSON.parse(readFileSync(new URL('./policy.json', import.meta.url)));
export const today = '2026-11-26';
export const work = (overrides = {}) => ({ DOI: '10.1234/example', title: ['Software engineering: a systematic review'],
  author: [{ given: 'A', family: 'Researcher' }], published: { 'date-parts': [[2026, 1, 2]] },
  'container-title': ['Independent Engineering Journal'], publisher: 'Small Society', source: 'Crossref', member: '123', type: 'journal-article', ...overrides });
const emptyPending = () => ({ dois: [], paths: [], records: [], texts: [] });
const inventory = (documents = [], records = []) => ({ documents: new Map(documents), records: new Map(records.map(r => [r.doi, r])) });
const source = (works, notices = []) => ({ lookup: async id => works.find(w => doi(w.DOI) === id) ?? null,
  notices: async () => notices, discover: async () => works });
const options = overrides => ({ inventory: inventory(), pending: emptyPending(), source: source([]), policy: { ...policy,
  topics: { 'software-engineering': ['software engineering'] } }, today, budget: new Budget(), ...overrides });

test('normalizes DOI prefixes, case and percent encoding; rejects unsafe IDs', () => {
  assert.equal(doi('https://doi.org/10.1234%2FExAmPle'), '10.1234/example');
  for (const value of ['x', '10.1234/x y', '10.1234/x?token=secret', '<10.1234/x>']) assert.equal(doi(value), null);
});
test('extracts and deduplicates DOI links in legacy Markdown', () => {
  assert.deepEqual(extractDois('[x](https://doi.org/10.1234/EXAMPLE). DOI: 10.1234/example'), ['10.1234/example']);
  assert.deepEqual(extractDois('[x](https://doi.org/10.1234/example(1)).'), ['10.1234/example(1)']);
});
test('rejects absent provenance, authors, venue, publisher, source or member', () => {
  for (const field of ['author', 'container-title', 'publisher', 'source', 'member']) assert.equal(normalizeWork(work({ [field]: undefined }), today, policy), null);
});
test('validates partial dates and calendar boundaries without replacing publication with index date', () => {
  assert.equal(publicationDate(work({ published: { 'date-parts': [[1972]] } }), today), '1972');
  for (const parts of [[2026, 2, 30], [2026, 0], [2027], [2026, 11, 27], [2026.5]]) assert.equal(publicationDate(work({ published: { 'date-parts': [parts] } }), today), null);
});
test('classifies by explicit title evidence and accepts independent publishers', () => {
  assert.deepEqual(classify('A survey of software architecture', policy), ['architecture']);
  const metadata = normalizeWork(work(), today, policy);
  assert.ok(selection(work(), metadata, policy));
  assert.equal(selection(work(), { ...metadata, title: 'Software engineering views' }, policy), null);
});
test('excludes notices and unsupported content types from discovery', () => {
  for (const w of [work({ 'update-to': [{}] }), work({ type: 'posted-content' }), work({ title: ['Retraction: software engineering survey'] })]) {
    assert.equal(selection(w, normalizeWork(w, today, policy), policy), null);
  }
});
test('editorial notices point from notice DOI to original DOI and preserve source', () => {
  const notices = editorialNotices([{ DOI: '10.1234/notice', 'update-to': [{ DOI: '10.1234/example', type: 'retraction', source: 'retraction-watch' }] }], '10.1234/example');
  assert.equal(notices[0].doi, '10.1234/notice'); assert.equal(notices[0].source, 'retraction-watch');
  assert.equal(editorialNotices([{ DOI: '10.1234/example', 'update-to': [{ DOI: '10.1234/other', type: 'correction' }] }], '10.1234/example').length, 0);
});
test('protects authored reviews and classics while surfacing retraction evidence', () => {
  const meta = normalizeWork(work({ DOI: policy.protectedDois[0] }), today, policy);
  const record = buildRecord(meta, null, ['resenhas/a.md'], [{ type: 'retraction', doi: '10.1234/notice' }], policy);
  assert.equal(record.protected, true); assert.ok(record.review.actions.includes('review-context-preserving-warning'));
  assert.ok(!record.review.actions.includes('consider-removal-or-replacement'));
});
test('preserves human review status and does not infer obsolete from age', () => {
  const record = buildRecord(normalizeWork(work({ published: { 'date-parts': [[1972]] } }), today, policy), { origin: 'existing', review: { status: 'human-reviewed' } }, ['REFERENCIAS.md'], [], policy);
  assert.equal(record.review.status, 'human-reviewed'); assert.deepEqual(record.review.actions, []);
});
test('a missing later notice deposit cannot erase a recorded retraction', () => {
  const meta = normalizeWork(work(), today, policy), notice = { type: 'retraction', doi: '10.1234/notice' };
  const first = buildRecord(meta, null, ['REFERENCIAS.md'], [notice], policy);
  const next = buildRecord(meta, first, ['REFERENCIAS.md'], [], policy);
  assert.deepEqual(next.notices, [notice]); assert.ok(next.review.actions.includes('consider-removal-or-replacement'));
});
test('captures DOI version relationships for human comparison', () => {
  assert.deepEqual(relatedVersions(work({ relation: { 'is-version-of': [{ id: '10.1234/older', 'id-type': 'doi' }] } })), [{ relation: 'is-version-of', doi: '10.1234/older' }]);
});
test('uses a stable per-DOI filename and rejects wrong paths', () => {
  const record = buildRecord(normalizeWork(work(), today, policy), null, ['REFERENCIAS.md'], [], policy);
  assert.equal(validateRecord(record), record);
  assert.throws(() => validateRecord(record, '../escape.json'));
  assert.equal(recordPath(record.doi), recordPath(record.doi));
});
test('detects normalized and near-identical titles across different DOIs', () => {
  assert.ok(sameTitle('A systematic review of Software Engineering', 'A systematic review of software engineering!'));
  assert.ok(!sameTitle('Engineering algorithms', 'Software security survey'));
});
test('uses Brasília date across UTC midnight', () => {
  assert.equal(brazilDay(new Date('2026-11-27T02:59:59Z')), today);
  assert.equal(brazilDay(new Date('2026-11-27T03:00:00Z')), '2026-11-27');
});
test('weekly and global quotas include pending records', () => {
  const records = Array.from({ length: 3 }, () => ({ origin: 'discovery', selectedOn: today }));
  assert.equal(canDiscover([], records, today, policy), false);
  assert.equal(canDiscover([], [], today, policy), true);
  assert.equal(canDiscover(Array.from({ length: 60 }, () => ({ origin: 'discovery', selectedOn: '2020-01-01' })), [], today, policy), false);
});
test('indexes a legacy reference without changing authored Markdown', async () => {
  const docs = [['REFERENCIAS.md', '[ref](https://doi.org/10.1234/example)']];
  const input = inventory(docs); const result = await refine(options({ inventory: input, source: source([work()]) }));
  assert.equal(result.changes.length, 1); assert.equal(result.changes[0].record.origin, 'existing');
  assert.deepEqual([...input.documents], docs);
});
test('stable metadata yields no commit; citation count and indexed timestamp do not churn', async () => {
  const first = await refine(options({ inventory: inventory([['REFERENCIAS.md', '10.1234/example']]), source: source([work()]) }));
  const second = await refine(options({ inventory: inventory([['REFERENCIAS.md', '10.1234/example']], [first.changes[0].record]), source: source([work({ 'is-referenced-by-count': 999, indexed: { timestamp: 100 } })]) }));
  assert.equal(second.changes.length, 0);
});
test('updates corrected metadata, classification and editorial notices', async () => {
  const previous = buildRecord(normalizeWork(work(), today, policy), null, ['REFERENCIAS.md'], [], policy);
  const result = await refine(options({ inventory: inventory([['REFERENCIAS.md', '10.1234/example']], [previous]),
    source: source([work({ publisher: 'Corrected Society' })], [{ type: 'correction', doi: '10.1234/notice', source: 'publisher', evidence: 'https://api.crossref.org/works/10.1234%2Fnotice' }]) }));
  assert.equal(result.changes[0].record.publisher, 'Corrected Society');
  assert.ok(result.changes[0].record.review.actions.includes('review-correction'));
});
test('pending DOI, path and entire changed legacy document block conflicting maintenance', async () => {
  for (const pending of [{ ...emptyPending(), dois: ['10.1234/example'] }, { ...emptyPending(), paths: ['REFERENCIAS.md'] },
    { ...emptyPending(), paths: [recordPath('10.1234/example')] }]) {
    const result = await refine(options({ inventory: inventory([['REFERENCIAS.md', '10.1234/example']]), source: source([work()]), pending }));
    assert.equal(result.changes.length, 0);
  }
});
test('does not remove a reference on 404, malformed metadata, or unavailable notice source', async () => {
  for (const src of [source([]), source([work({ author: [] })]), { ...source([work()]), notices: async () => { throw new Error('offline'); } }]) {
    const result = await refine(options({ inventory: inventory([['REFERENCIAS.md', '10.1234/example']]), source: src }));
    assert.equal(result.changes.length, 0);
  }
});
test('source outage returns warnings and no artificial report changes', async () => {
  const result = await refine(options({ source: { ...source([]), discover: async () => { throw new Error('offline'); } } }));
  assert.equal(result.changes.length, 0); assert.equal(result.warnings.length, 1);
});
test('adds at most one new candidate with selection evidence and pending human reading', async () => {
  const result = await refine(options({ source: source([work(), work({ DOI: '10.1234/second' })]) }));
  assert.equal(result.changes.length, 1); assert.equal(result.changes[0].record.review.status, 'needs-human-reading');
  assert.ok(result.changes[0].record.selection.matchedTerms.length);
});
test('discovery rejects title duplicates, pending titles and retracted candidates', async () => {
  const meta = normalizeWork(work({ DOI: '10.1234/another' }), today, policy);
  for (const input of [options({ inventory: inventory([], [{ ...buildRecord(meta, null, ['REFERENCIAS.md'], [], policy) }]), source: source([work()]) }),
    options({ pending: { ...emptyPending(), texts: [work().title[0]] }, source: source([work()]) }),
    options({ source: source([work()], [{ type: 'retraction', doi: '10.1234/notice' }]) })]) {
    assert.equal((await refine(input)).changes.length, 0);
  }
});
test('exclusion and per-topic capacity suppress rediscovery', async () => {
  assert.equal((await refine(options({ policy: { ...policy, excludedDois: ['10.1234/example'] }, source: source([work()]) }))).changes.length, 0);
  const records = Array.from({ length: 8 }, (_, i) => ({ ...buildRecord(normalizeWork(work({ DOI: `10.1234/${i}`, title: [`Different topic ${i}`] }), today, policy), null, [], [], policy), topics: ['software-engineering'], selectedOn: '2020-01-01' }));
  assert.equal((await refine(options({ inventory: inventory([], records), source: source([work()]) }))).changes.length, 0);
});
test('deadline preserves previously validated work and stops new lookups', async () => {
  let time = 0, calls = 0; const budget = new Budget({ now: () => time, searchMs: 5000 });
  const works = [work({ DOI: '10.1234/a' }), work({ DOI: '10.1234/b' })];
  const src = { ...source(works), lookup: async id => { calls++; return works.find(w => doi(w.DOI) === id); }, notices: async () => { time = 6000; return []; } };
  const result = await refine(options({ budget, source: src, inventory: inventory([['REFERENCIAS.md', '10.1234/a 10.1234/b']]) }));
  assert.equal(result.changes.length, 1); assert.equal(calls, 1); assert.ok(result.warnings.length);
});
