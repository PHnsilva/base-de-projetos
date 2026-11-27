import { createHash } from 'node:crypto';

export const CATALOG = 'referencias/catalogo/';
export const stable = value => JSON.stringify(value, null, 2) + '\n';
export const text = value => String(value ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
export const titleKey = value => text(value).normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
export function doi(value) {
  let result = String(value ?? '').trim().replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '').replace(/^doi:\s*/i, '');
  try { result = decodeURIComponent(result); } catch { return null; }
  return /^10\.\d{4,9}\/[^\s<>"?#]+$/i.test(result) ? result.toLowerCase() : null;
}
export const recordPath = id => CATALOG + createHash('sha256').update(id).digest('hex') + '.json';
export const isRecordPath = path => /^referencias\/catalogo\/[a-f0-9]{64}\.json$/.test(path);
export function extractDois(value) {
  return [...new Set([...String(value).matchAll(/10\.\d{4,9}\/(?:[^\s<>"\[\]{}]|%[\da-f]{2})+/gi)]
    .map(x => {
      let candidate = x[0].replace(/[.,;:]+$/, '');
      // Strip Markdown link delimiters while preserving balanced DOI parentheses.
      while (candidate.endsWith(')') && (candidate.match(/\)/g)?.length ?? 0) > (candidate.match(/\(/g)?.length ?? 0)) candidate = candidate.slice(0, -1);
      return doi(candidate);
    }).filter(Boolean))];
}
export function publicationDate(work, today) {
  const parts = (work.published ?? work.issued)?.['date-parts']?.[0];
  if (!Array.isArray(parts) || parts.length < 1 || parts.length > 3 || parts.some(x => !Number.isInteger(x))) return null;
  const [year, month = 1, day = 1] = parts;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (year < 1600 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  const value = parts.map((x, i) => String(x).padStart(i ? 2 : 4, '0')).join('-');
  return value > today.slice(0, value.length) ? null : value;
}
export function classify(title, policy) {
  const normalized = titleKey(title);
  return Object.entries(policy.topics).filter(([, terms]) => terms.some(term => normalized.includes(titleKey(term))))
    .map(([topic]) => topic).sort();
}

// update-to belongs to the NOTICE and identifies the ORIGINAL work. Never reverse it.
export function editorialNotices(notices, originalDoi) {
  return notices.flatMap(notice => (notice['update-to'] ?? [])
    .filter(update => doi(update.DOI) === originalDoi)
    .map(update => ({ type: text(update.type), doi: doi(notice.DOI), source: text(update.source || 'publisher'),
      evidence: 'https://api.crossref.org/works/' + encodeURIComponent(doi(notice.DOI) ?? '') })))
    .filter(x => x.doi && x.type).sort((a, b) => stable(a).localeCompare(stable(b)))
    .filter((x, i, all) => i === 0 || stable(x) !== stable(all[i - 1]));
}
export function normalizeWork(work, today, policy) {
  const id = doi(work.DOI), title = text(work.title?.[0]), venue = text(work['container-title']?.[0]);
  const authors = (work.author ?? []).map(a => text(a.name || [a.given, a.family].filter(Boolean).join(' '))).filter(Boolean);
  const published = publicationDate(work, today);
  if (!id || !title || !authors.length || !venue || !text(work.publisher) || !published ||
      work.source !== 'Crossref' || !/^\d+$/.test(String(work.member ?? '')) || !text(work.type)) return null;
  return { doi: id, title, authors, published, venue, publisher: text(work.publisher), type: text(work.type),
    topics: classify(title, policy), provenance: { registry: 'Crossref', member: String(work.member),
      metadata: 'https://api.crossref.org/works/' + encodeURIComponent(id), resolver: 'https://doi.org/' + id } };
}
export function selection(work, metadata, policy) {
  const normalized = titleKey(metadata.title);
  const terms = policy.evidenceTerms.filter(term => normalized.includes(titleKey(term)));
  // These are selection signals, never a claim of methodological quality or peer review.
  return metadata.topics.length && terms.length && ['journal-article', 'proceedings-article'].includes(metadata.type) &&
    !(work['update-to']?.length) && !/\b(retraction|withdrawn|correction|erratum|corrigendum)\b/i.test(metadata.title)
    ? { matchedTerms: terms, rule: 'title-topic-and-evidence-term-v1' } : null;
}
export function buildRecord(metadata, previous, locations, notices, policy) {
  const origin = previous?.origin ?? (locations.length ? 'existing' : 'discovery');
  const protectedReference = previous?.protected === true || policy.protectedDois.includes(metadata.doi) || locations.some(x => x.startsWith('resenhas/'));
  // A later missing deposit must not silently erase a previously observed warning.
  notices = [...new Map([...(previous?.notices ?? []), ...notices].map(n => [stable(n), n])).values()]
    .sort((a, b) => stable(a).localeCompare(stable(b)));
  const actions = [];
  if (notices.length) actions.push('review-editorial-notice');
  if (notices.some(x => /retraction|withdrawal/i.test(x.type))) actions.push(protectedReference ? 'review-context-preserving-warning' : 'consider-removal-or-replacement');
  if (notices.some(x => /correction|erratum|corrigendum/i.test(x.type))) actions.push('review-correction');
  const versions = previous?.relatedVersions ?? [];
  if (versions.length) actions.push('compare-related-version');
  return { schemaVersion: 1, origin, ...metadata, locations: [...new Set(locations)].sort(),
    protected: protectedReference, notices, relatedVersions: versions,
    review: { status: previous?.review?.status ?? (origin === 'existing' ? 'bibliographic-record' : 'needs-human-reading'),
      actions: actions.sort(), limitation: 'Registry metadata and title rules do not establish scientific quality, relevance in context, or absence of retractions.' },
    ...(previous?.selection ? { selection: previous.selection } : {}) };
}
export function relatedVersions(work) {
  return Object.entries(work.relation ?? {}).filter(([kind]) => /version|replaced|replaces|preprint/i.test(kind))
    .flatMap(([relation, targets]) => targets.filter(x => x['id-type'] === 'doi' && doi(x.id)).map(x => ({ relation, doi: doi(x.id) })))
    .sort((a, b) => stable(a).localeCompare(stable(b)));
}
export function validateRecord(record, path = recordPath(record.doi)) {
  const strings = list => Array.isArray(list) && list.every(x => typeof x === 'string' && x.trim().length > 0);
  const validDate = value => typeof value === 'string' && /^\d{4}(?:-\d{2}){0,2}$/.test(value) &&
    publicationDate({ published: { 'date-parts': [value.split('-').map(Number)] } }, '9999-12-31') === value;
  if (record.schemaVersion !== 1 || doi(record.doi) !== record.doi || path !== recordPath(record.doi) ||
      !['existing', 'discovery'].includes(record.origin) || !strings([record.title, record.venue, record.publisher, record.type]) ||
      !strings(record.authors) || !record.authors.length || !validDate(record.published) || !strings(record.topics) ||
      typeof record.protected !== 'boolean' || !Array.isArray(record.notices) || !Array.isArray(record.relatedVersions) ||
      !strings(record.locations) || record.locations.some(x => !x.endsWith('.md') || /(^\/|\\|:|(^|\/)\.\.(\/|$))/.test(x)) ||
      !['bibliographic-record', 'needs-human-reading', 'human-reviewed', 'rejected'].includes(record.review?.status) ||
      !strings(record.review?.actions) || record.provenance?.registry !== 'Crossref' ||
      record.provenance.metadata !== 'https://api.crossref.org/works/' + encodeURIComponent(record.doi)) throw new Error('Invalid catalog record: ' + path);
  if (record.provenance.resolver !== 'https://doi.org/' + record.doi || !/^\d+$/.test(record.provenance.member) ||
      record.notices.some(n => doi(n.doi) !== n.doi || !strings([n.type, n.source]) || n.evidence !== 'https://api.crossref.org/works/' + encodeURIComponent(n.doi)) ||
      record.relatedVersions.some(r => doi(r.doi) !== r.doi || !strings([r.relation])) ||
      (record.possibleDuplicates && (!strings(record.possibleDuplicates) || record.possibleDuplicates.some(d => doi(d) !== d)))) throw new Error('Invalid evidence: ' + path);
  if (record.origin === 'discovery' && (!strings(record.selection?.matchedTerms) || !record.selection.matchedTerms.length ||
      !strings([record.selection.rule]) || !validDate(record.selectedOn) || record.selectedOn.length !== 10)) throw new Error('Missing selection evidence or selection date');
  return record;
}
export function sameTitle(a, b) {
  if (titleKey(a) === titleKey(b)) return true;
  const x = new Set(titleKey(a).split(' ')), y = new Set(titleKey(b).split(' '));
  return x.size >= 5 && y.size >= 5 && [...x].filter(t => y.has(t)).length / new Set([...x, ...y]).size >= 0.9;
}
export function canDiscover(records, pending, today, policy) {
  const discoveries = [...records, ...pending].filter(x => x.origin === 'discovery');
  const weekStart = new Date(today + 'T00:00:00Z'); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
  return discoveries.length < policy.maxNewTotal && discoveries.filter(x => x.selectedOn >= weekStart.toISOString().slice(0, 10)).length < policy.maxNewPerWeek;
}
export function brazilDay(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
