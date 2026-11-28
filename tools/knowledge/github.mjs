import { validateDaily, dailyPR } from './daily.mjs';
import { brazilDay, isRecordPath, recordPath, stable, validateRecord, extractDois } from './core.mjs';

export const PREFIX = 'automation/knowledge/';
const GH = 'https://api.github.com';
export class GitHub {
  constructor(client, policy, day = brazilDay) { this.client = client; this.policy = policy; this.day = day; this.base = `${GH}/repos/${policy.repository}`; }
  get(path, options) { return this.client.request(this.base + path, options); }
  post(path, body) { return this.get(path, { method: 'POST', body, phase: 'publish' }); }
  async pulls(options = {}) { return this.client.pages(this.base + '/pulls?state=open', options); }
  async dayPR(day, options = {}) {
    const prs = await this.client.pages(this.base + '/pulls?state=all&head=' + encodeURIComponent(this.policy.owner + ':' + PREFIX + day), options);
    return prs.find(p => p.head.repo?.full_name === this.policy.repository && p.head.ref === PREFIX + day) ?? null;
  }
  async metadata(options = {}) {
    const repo = await this.get('', options);
    if (repo.full_name !== this.policy.repository || repo.private || repo.fork || repo.archived) throw new Error('Requires the configured public standalone active repository');
    return repo;
  }
  async snapshot(prs, options = {}) {
    const paths = [], dois = [], records = [], texts = [];
    for (const pr of prs) {
      const detail = await this.get('/pulls/' + pr.number, options);
      const files = await this.client.pages(this.base + `/pulls/${pr.number}/files`, options);
      if (files.length !== detail.changed_files) throw new Error('Incomplete pending PR inventory');
      for (const file of files) {
        paths.push(file.filename);
        dois.push(...extractDois(file.patch ?? ''));
        if (!/\.(md|json)$/i.test(file.filename) || file.status === 'removed') continue;
        // Git blobs from PRs are DATA. Never checkout, import, execute, or follow URLs from PR content.
        const blob = await this.get('/git/blobs/' + file.sha, options);
        if (blob.encoding !== 'base64' || blob.size > 1_000_000) throw new Error('Unsupported pending text blob');
        const content = Buffer.from(blob.content, 'base64').toString('utf8');
        texts.push(content); dois.push(...extractDois(content));
        if (isRecordPath(file.filename)) records.push(validateRecord(JSON.parse(content), file.filename));
      }
    }
    return { paths, dois: [...new Set(dois)], records, texts, fingerprint: fingerprint(prs) };
  }
  async assertUnchanged(expected, defaultBranch, baseSha) {
    const options = { phase: 'publish' };
    const current = await this.pulls(options);
    const ref = await this.get('/git/ref/heads/' + defaultBranch, options);
    if (fingerprint(current) !== expected || ref.object.sha !== baseSha) throw new Error('Base or pending PRs changed; retry next run');
  }
  async identity() {
    const user = await this.client.request(GH + '/user', { phase: 'publish' });
    if (user.login !== this.policy.owner || user.type !== 'User') throw new Error('KNOWLEDGE_SYNC_TOKEN must belong to ' + this.policy.owner);
    return { name: user.name || user.login, email: `${user.id}+${user.login}@users.noreply.github.com` };
  }
  async recover(branch, defaultBranch, prs, identity) {
    const ref = await this.get('/git/ref/heads/' + branch, { phase: 'publish', allow404: true });
    if (!ref) return null;
    const compare = await this.get(`/compare/${defaultBranch}...${branch}`, { phase: 'publish' });
    const commit = await this.get('/git/commits/' + ref.object.sha, { phase: 'publish' });
    if (commit.message !== `chore(knowledge): refine references for ${branch.slice(PREFIX.length)} [automated]` || commit.parents.length !== 1 ||
        commit.author.email !== identity.email || commit.committer.email !== identity.email ||
        compare.ahead_by !== 1 || compare.behind_by !== 0 || compare.commits?.[0]?.sha !== ref.object.sha ||
        !compare.files?.length || compare.files.length > this.policy.maxChanges ||
        prs.some(p => p.head.ref === branch)) throw new Error('Unrecognized or outdated orphan branch; requires maintainer inspection');
    const changes = [];
    const pending = await this.snapshot(prs, { phase: 'publish' });
    for (const file of compare.files) {
      if ((!isRecordPath(file.filename) && !/^reports\/daily\/\d{4}-\d{2}-\d{2}\.json$/.test(file.filename)) || !['added', 'modified'].includes(file.status) || pending.paths.includes(file.filename)) throw new Error('Unsafe orphan branch diff');
      const blob = await this.get('/git/blobs/' + file.sha, { phase: 'publish' });
      const parsed = JSON.parse(Buffer.from(blob.content, 'base64').toString('utf8'));
      const record = parsed.kind === 'daily-validation' ? validateDaily(parsed, file.filename) : validateRecord(parsed, file.filename);
      if (pending.dois.includes(record.doi) || (record.locations ?? []).some(p => pending.paths.includes(p))) throw new Error('Orphan conflicts with a pending PR');
      changes.push({ path: file.filename, record, before: null, reason: 'Recover a completed bibliographic change after interrupted publication; inspect the branch diff.' });
    }
    return { sha: ref.object.sha, changes };
  }
  async publish(plan, { defaultBranch, baseSha, pendingFingerprint, identity, recoveredSha }) {
    if (!plan.changes.length) return null;
    if (this.day() !== plan.day) throw new Error('Brasília date changed during execution; retry next run');
    if (await this.dayPR(plan.day, { phase: 'publish' })) return null;
    await this.assertUnchanged(pendingFingerprint, defaultBranch, baseSha);
    if (this.day() !== plan.day) throw new Error('Brasília date changed before PR publication');
    const branch = PREFIX + plan.day;
    for (const change of plan.changes) {
      if (change.record.kind === 'daily-validation') {
        validateDaily(change.record, change.path);
        if (change.record.day !== plan.day || (!recoveredSha && change.record.baseSha !== baseSha)) throw new Error('Daily report does not match publication base');
      } else validateRecord(change.record, change.path);
    }
    if (plan.changes.length > this.policy.maxChanges) throw new Error('Too many changes');
    if (!recoveredSha) {
      const baseCommit = await this.get('/git/commits/' + baseSha, { phase: 'publish' });
      const tree = await this.post('/git/trees', { base_tree: baseCommit.tree.sha,
        tree: plan.changes.map(c => ({ path: c.path, mode: '100644', type: 'blob', content: stable(c.record) })) });
      if (tree.sha === baseCommit.tree.sha) return null; // No empty commits.
      const commit = await this.post('/git/commits', { message: `chore(knowledge): refine references for ${plan.day} [automated]`,
        tree: tree.sha, parents: [baseSha], author: identity, committer: identity });
      await this.assertUnchanged(pendingFingerprint, defaultBranch, baseSha);
      // Atomic reservation. Never update a ref, force push, or write to the default branch.
      await this.post('/git/refs', { ref: 'refs/heads/' + branch, sha: commit.sha });
    }
    await this.assertUnchanged(pendingFingerprint, defaultBranch, baseSha);
    if (this.day() !== plan.day) throw new Error('Brasília date changed before PR publication');
    return this.post('/pulls', { title: `chore: contribuição diária de ${plan.day} [automated]`,
      head: branch, base: defaultBranch, body: renderPR(plan), maintainer_can_modify: false });
  }
}
export function fingerprint(prs) {
  return stable(prs.map(p => [p.number, p.head.sha, p.base.ref, p.base.sha]).sort((a, b) => a[0] - b[0]));
}
export function renderPR(plan) {
  const audit = plan.changes.find(c => c.record.kind === 'daily-validation');
  const entries = plan.changes.filter(c => c.record.kind !== 'daily-validation').map(c => `- **${c.record.doi}** — ${c.reason}\n  - Metadata: ${c.record.provenance.metadata}\n  - DOI: ${c.record.provenance.resolver}\n  - Fields: ${changedFields(c.before, c.record).join(', ')}\n  - Topics (title rules): ${c.record.topics.join(', ') || 'unclassified'}\n  - Editorial notices: ${c.record.notices.map(n => `${n.type}: ${n.evidence}`).join('; ') || 'none returned by Crossref; absence is not proof'}\n  - Human actions: ${c.record.review.actions.join(', ') || 'verify metadata and read before endorsement'}`).join('\n');
  return (audit ? dailyPR(audit) + '\n\n' : '') + `Automated, deterministic bibliographic refinement for ${plan.day} (America/Sao_Paulo). No AI or scientific interpretation was used.\n\n${entries}\n\nValidation: exact DOI lookup; required authors, date, venue, publisher and Crossref member; reverse editorial-update query; schema, quotas and pending-PR conflict checks.\n\nSearch warnings: ${plan.warnings.length ? plan.warnings.join(' | ') : 'none'}.\n\nReview the sources and diff. Metadata does not establish methodological quality, peer review, completeness of retraction coverage, or contextual suitability. Authored reviews and classics are preserved.\n\nThe maintainer alone reviews and merges. Consolidate with other daily PRs during the fortnightly review; this automation never merges, approves or closes PRs.\n\nSee [operating guide](https://github.com/PHnsilva/base-de-projetos/blob/${PREFIX + plan.day}/docs/knowledge-refinement.md).`;
}
export function changedFields(before, after) {
  return Object.keys(after).filter(key => stable(before?.[key]) !== stable(after[key]));
}
