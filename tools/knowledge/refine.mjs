import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { CATALOG, buildRecord, canDiscover, doi, editorialNotices, extractDois, isRecordPath, normalizeWork,
  recordPath, relatedVersions, sameTitle, selection, stable, titleKey, validateRecord } from './core.mjs';
import { Deadline } from './http.mjs';

export function localInventory(root) {
  const files = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
  const documents = new Map(), records = new Map();
  for (const file of files) {
    if (isRecordPath(file)) {
      const record = validateRecord(JSON.parse(readFileSync(root + '/' + file, 'utf8')), file);
      records.set(record.doi, record);
    } else if (/\.md$/i.test(file) && !file.startsWith('docs/knowledge-refinement') &&
        /^(REFERENCIAS\.md|resenhas\/|referencias\/|arquitetura\/|docs\/|exemplos\/)/.test(file)) {
      documents.set(file, readFileSync(root + '/' + file, 'utf8'));
    }
  }
  return { documents, records };
}
export function inventoryIndex(documents) {
  const index = new Map();
  for (const [path, content] of documents) for (const id of extractDois(content)) {
    index.set(id, [...(index.get(id) ?? []), path]);
  }
  return index;
}
export class Crossref {
  constructor(client) { this.client = client; }
  async list(params) {
    const response = await this.client.request('https://api.crossref.org/works?' + new URLSearchParams(params));
    if (response?.status !== 'ok' || !Array.isArray(response.message?.items)) throw new Error('Invalid Crossref work list');
    return response.message;
  }
  async lookup(id) {
    const response = await this.client.request('https://api.crossref.org/works/' + encodeURIComponent(id), { allow404: true });
    if (!response) return null;
    if (response.status !== 'ok' || doi(response.message?.DOI) !== id) throw new Error('Crossref DOI mismatch');
    return response.message;
  }
  async notices(id) {
    const response = await this.list({ filter: 'updates:' + id, rows: '100' });
    if (response['total-results'] > 100) throw new Error('Editorial notice query truncated');
    return editorialNotices(response.items, id);
  }
  async discover(topic, policy, today) {
    const response = await this.list({ 'query.title': policy.topics[topic][0] + ' survey',
      filter: `from-pub-date:${Number(today.slice(0, 4)) - 3}-01-01,until-pub-date:${today}`, rows: String(policy.discoveryRows), sort: 'relevance' });
    return response.items;
  }
}

export async function refine({ inventory, pending, source, policy, today, budget }) {
  const index = inventoryIndex(inventory.documents), changes = [], warnings = [], stats = { checked: 0, invalid: 0, candidates: 0 };
  const occupied = new Set(pending.dois);
  const records = [...inventory.records.values()];
  const allRecords = [...records, ...pending.records];
  const blockedPaths = new Set(pending.paths);
  const dayNumber = Math.floor(Date.parse(today + 'T00:00:00Z') / 86_400_000);
  const ids = [...new Set([...index.keys(), ...inventory.records.keys()])].sort();
  // Stateless rotating window revisits every DOI without committing check timestamps.
  const offset = ids.length ? (dayNumber * policy.maintenanceBatch) % ids.length : 0;
  const batch = [...ids.slice(offset), ...ids.slice(0, offset)].slice(0, policy.maintenanceBatch);
  const stage = record => {
    const path = recordPath(record.doi); validateRecord(record, path);
    if (blockedPaths.has(path)) return;
    const previous = inventory.records.get(record.doi);
    if (stable(previous) !== stable(record)) changes.push({ path, record, before: previous ?? null,
      reason: previous ? 'Update substantive bibliographic metadata, classification, relations or editorial notices.' : record.origin === 'existing'
        ? 'Index an existing reference as structured bibliographic metadata for traceable reuse; preserve the authored text.'
        : 'Add a bounded reading candidate based on explicit title signals; scientific assessment remains pending.' });
  };
  for (const id of batch) {
    if (changes.length >= policy.maxChanges) break;
    if (occupied.has(id) || policy.excludedDois.includes(id)) continue;
    try {
      budget.check();
      const work = await source.lookup(id); stats.checked++;
      if (!work) { warnings.push(`DOI not found at Crossref: ${id}; no removal inferred.`); continue; }
      const metadata = normalizeWork(work, today, policy);
      if (!metadata) { stats.invalid++; continue; }
      const notices = await source.notices(id); // Required for any proposed record, including updates.
      const previous = inventory.records.get(id);
      const locations = [...new Set([...(index.get(id) ?? []), ...(previous?.locations ?? [])])].filter(x => !x.startsWith(CATALOG));
      const record = buildRecord(metadata, previous, locations, notices, policy);
      record.relatedVersions = [...new Map([...(previous?.relatedVersions ?? []), ...relatedVersions(work)].map(x => [stable(x), x])).values()]
        .sort((a, b) => stable(a).localeCompare(stable(b)));
      if (record.relatedVersions.length) record.review.actions = [...new Set([...record.review.actions, 'compare-related-version'])].sort();
      if (previous?.selectedOn) record.selectedOn = previous.selectedOn;
      const duplicates = allRecords.filter(r => r.doi !== id && sameTitle(r.title, metadata.title)).map(r => r.doi).sort();
      if (duplicates.length) {
        record.possibleDuplicates = duplicates;
        record.review.actions.push('review-possible-duplicate'); record.review.actions.sort();
      }
      // Preserve authorial interpretation. Conflicting legacy edits are deferred as a whole.
      if (!locations.some(x => blockedPaths.has(x))) stage(record);
    } catch (error) {
      if (error instanceof Deadline) { warnings.push('Search deadline reached; retaining completed valid changes.'); break; }
      warnings.push(`Maintenance unavailable for ${id}: ${error.message}`);
    }
  }
  if (changes.length < policy.maxChanges && canDiscover(records, pending.records, today, policy)) {
    const topics = Object.keys(policy.topics), topic = topics[dayNumber % topics.length];
    try {
      budget.check();
      const candidates = await source.discover(topic, policy, today);
      for (const candidate of candidates) {
        budget.check(); stats.candidates++;
        const metadata = normalizeWork(candidate, today, policy);
        if (!metadata || !metadata.topics.includes(topic) || index.has(metadata.doi) || inventory.records.has(metadata.doi) ||
            occupied.has(metadata.doi) || policy.excludedDois.includes(metadata.doi) ||
            allRecords.some(x => sameTitle(x.title, metadata.title)) ||
            [...inventory.documents.values(), ...pending.texts].some(content => titleKey(content).includes(titleKey(metadata.title)))) continue;
        const signals = selection(candidate, metadata, policy);
        if (!signals || metadata.topics.some(t => allRecords.filter(x => x.origin === 'discovery' && x.topics.includes(t)).length >= policy.maxNewPerTopic)) continue;
        // Re-fetch the exact DOI rather than trusting a search result's metadata snapshot.
        const work = await source.lookup(metadata.doi);
        if (!work) continue;
        const confirmed = normalizeWork(work, today, policy), confirmedSignals = confirmed && selection(work, confirmed, policy);
        if (!confirmed || !confirmedSignals || !confirmed.topics.includes(topic) || stable(confirmed) !== stable(metadata)) continue;
        const notices = await source.notices(metadata.doi);
        if (notices.length || relatedVersions(work).some(x => occupied.has(x.doi) || index.has(x.doi) || inventory.records.has(x.doi))) continue;
        const record = buildRecord(confirmed, null, [], [], policy);
        record.selection = confirmedSignals; record.selectedOn = today; record.relatedVersions = relatedVersions(work);
        stage(record);
        break; // Hard cap: one discovery per run. Maintenance uses remaining slots.
      }
    } catch (error) { warnings.push(error instanceof Deadline ? 'Discovery deadline reached.' : 'Discovery unavailable: ' + error.message); }
  }
  return { schemaVersion: 1, day: today, changes, warnings, stats };
}
