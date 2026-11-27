import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildRecord, normalizeWork, recordPath, stable } from './core.mjs';
import { fingerprint, GitHub, PREFIX, renderPR } from './github.mjs';

const policy = JSON.parse(readFileSync(new URL('./policy.json', import.meta.url)));
const day = '2026-11-26', branch = PREFIX + day;
const identity = { name: 'Maintainer', email: '166767898+PHnsilva@users.noreply.github.com' };
const metadata = normalizeWork({ DOI: '10.1234/example', title: ['Software engineering survey'],
  author: [{ family: 'Researcher' }], published: { 'date-parts': [[2026]] }, 'container-title': ['Journal'],
  publisher: 'Society', type: 'journal-article', source: 'Crossref', member: '1' }, day, policy);
const record = buildRecord(metadata, null, ['REFERENCIAS.md'], [], policy);
const change = { path: recordPath(record.doi), record, before: null, reason: 'Index existing metadata.' };
const plan = { day, changes: [change], warnings: [] };
const context = { defaultBranch: 'main', baseSha: 'BASE', pendingFingerprint: fingerprint([]), identity };

function harness({ createPrFails = false, emptyTree = false, pending = [], movedBase = false } = {}) {
  const calls = [], refs = new Map(), prs = [];
  const client = {
    pages: async (url) => { calls.push(['GET', url]); return url.includes('head=') ? prs : pending; },
    request: async (url, options = {}) => {
      calls.push([options.method ?? 'GET', url, options.body]);
      const path = url.replace('https://api.github.com/repos/' + policy.repository, '');
      if (url.endsWith('/user')) return { login: policy.owner, type: 'User', name: identity.name, id: 166767898 };
      if (path === '') return { full_name: policy.repository, private: false, fork: false, default_branch: 'main' };
      if (path === '/git/ref/heads/main') return { object: { sha: movedBase ? 'MOVED' : 'BASE' } };
      if (path === '/git/commits/BASE') return { tree: { sha: 'TREE0' } };
      if (path === '/git/trees') return { sha: emptyTree ? 'TREE0' : 'TREE1' };
      if (path === '/git/commits' && options.method === 'POST') return { sha: 'COMMIT1' };
      if (path === '/git/refs') {
        if (refs.has(options.body.ref)) throw new Error('ref already exists');
        refs.set(options.body.ref, options.body.sha); return {};
      }
      if (path === '/pulls' && options.method === 'POST') {
        if (createPrFails) throw new Error('ambiguous connection loss');
        const pr = { html_url: 'https://github.com/' + policy.repository + '/pull/99', head: { ref: branch, repo: { full_name: policy.repository } }, state: 'open' };
        prs.push(pr); return pr;
      }
      throw new Error('Unexpected API request ' + path);
    }
  };
  return { github: new GitHub(client, policy, () => day), client, calls, refs, prs };
}

test('publication creates one independent branch and one marked PR with maintainer identity', async () => {
  const h = harness(); const pr = await h.github.publish(plan, context);
  assert.ok(pr.html_url.endsWith('/99')); assert.deepEqual([...h.refs.keys()], ['refs/heads/' + branch]);
  const commit = h.calls.find(([method, url]) => method === 'POST' && url.endsWith('/git/commits'))[2];
  assert.deepEqual(commit.author, identity); assert.deepEqual(commit.committer, identity);
  assert.match(commit.message, /^chore\(knowledge\):.*\[automated\]$/);
  assert.equal(h.calls.filter(c => c[0] === 'POST' && c[1].endsWith('/pulls')).length, 1);
  assert.ok(h.calls.every(c => !['PATCH', 'PUT', 'DELETE'].includes(c[0])));
});
test('repeat and contingency skip a daily PR even after it is closed', async () => {
  const h = harness(); await h.github.publish(plan, context); h.prs[0].state = 'closed';
  const before = h.calls.length; assert.equal(await h.github.publish(plan, context), null);
  assert.equal(h.calls.slice(before).filter(c => c[0] === 'POST').length, 0);
});
test('empty plan or identical tree produces neither commit nor PR', async () => {
  const h = harness({ emptyTree: true });
  assert.equal(await h.github.publish({ ...plan, changes: [] }, context), null);
  assert.equal(await h.github.publish(plan, context), null);
  assert.ok(!h.calls.some(c => c[1].endsWith('/git/commits') && c[0] === 'POST'));
});
test('midnight crossing stops publication without creating a second day identity', async () => {
  const h = harness(); h.github.day = () => '2026-11-27';
  await assert.rejects(h.github.publish(plan, context), /date changed/);
  assert.ok(!h.calls.some(c => c[0] === 'POST'));
});
test('moving base or pending heads stops publication before any write', async () => {
  for (const options of [{ movedBase: true }, { pending: [{ number: 1, head: { sha: 'NEW' }, base: { ref: 'main', sha: 'BASE' } }] }]) {
    const h = harness(options); await assert.rejects(h.github.publish(plan, context), /changed/);
    assert.ok(!h.calls.some(c => c[0] === 'POST'));
  }
});
test('unsafe paths and excessive plan size are rejected', async () => {
  const h = harness(); await assert.rejects(h.github.publish({ ...plan, changes: [{ ...change, path: 'AGENTS.md' }] }, context));
  await assert.rejects(h.github.publish({ ...plan, changes: Array(4).fill(change) }, context), /Too many/);
});
test('interrupted PR creation preserves branch and is not blindly retried', async () => {
  const h = harness({ createPrFails: true });
  await assert.rejects(h.github.publish(plan, context), /ambiguous/);
  assert.equal(h.refs.size, 1); assert.equal(h.calls.filter(c => c[0] === 'POST' && c[1].endsWith('/pulls')).length, 1);
});
test('token must belong to the configured human account; private repos fail closed', async () => {
  const h = harness(); assert.deepEqual(await h.github.identity(), identity); await h.github.metadata();
  h.client.request = async () => ({ login: 'other-user', type: 'User' }); await assert.rejects(h.github.identity());
  h.client.request = async () => ({ full_name: policy.repository, private: true }); await assert.rejects(h.github.metadata());
});
test('pending inventory reads data blobs only and rejects truncated files', async () => {
  const calls = [];
  const client = { pages: async () => [{ filename: 'referencias/pending.md', status: 'modified', sha: 'BLOB', patch: '+10.1234/example' }],
    request: async url => { calls.push(url); return url.endsWith('/pulls/1') ? { changed_files: 1 }
      : { encoding: 'base64', size: 40, content: Buffer.from('Pending 10.1234/another').toString('base64') }; } };
  const github = new GitHub(client, policy);
  const pending = await github.snapshot([{ number: 1, head: { sha: 'H' }, base: { ref: 'main', sha: 'B' } }]);
  assert.deepEqual(pending.dois, ['10.1234/example', '10.1234/another']); assert.ok(calls.some(c => c.endsWith('/git/blobs/BLOB')));
  client.pages = async () => []; await assert.rejects(github.snapshot([{ number: 1 }]), /Incomplete/);
});
test('recovery verifies commit identity, single-parent diff and pending conflicts', async () => {
  let unsafe = false;
  const client = { pages: async () => [], request: async url => {
    if (url.includes('/git/ref/heads/')) return { object: { sha: 'ORPHAN' } };
    if (url.includes('/compare/')) return { ahead_by: 1, behind_by: 0, commits: [{ sha: 'ORPHAN' }], files: [{ filename: unsafe ? 'README.md' : change.path, status: 'added', sha: 'BLOB' }] };
    if (url.includes('/git/commits/')) return { message: `chore(knowledge): refine references for ${day} [automated]`, parents: [{}], author: identity, committer: identity };
    if (url.includes('/git/blobs/')) return { content: Buffer.from(stable(record)).toString('base64') };
    throw new Error('Unexpected request');
  } };
  const github = new GitHub(client, policy);
  const result = await github.recover(branch, 'main', [], identity); assert.equal(result.sha, 'ORPHAN');
  await assert.rejects(github.recover(branch, 'main', [], { email: 'other' }), /Unrecognized/);
  unsafe = true; await assert.rejects(github.recover(branch, 'main', [], identity), /Unsafe/);
});
test('PR rationale links evidence, changed fields and limits without claiming scientific conclusions', () => {
  const body = renderPR(plan); assert.match(body, /api.crossref.org/); assert.match(body, /Fields:/);
  assert.match(body, /maintainer alone/); assert.match(body, /does not establish/);
});
test('workflow uses public standard runner, pinned actions, no secrets on PR CI and hard deadlines', () => {
  const daily = readFileSync(new URL('../../.github/workflows/daily-knowledge-refinement.yml', import.meta.url), 'utf8');
  const ci = readFileSync(new URL('../../.github/workflows/knowledge-refinement-ci.yml', import.meta.url), 'utf8');
  assert.match(daily, /cron: '35 7/); assert.match(daily, /cron: '35 17/); assert.match(daily, /timeout-minutes: 15/);
  assert.match(daily, /cancel-in-progress: false/); assert.match(daily, /persist-credentials: false/);
  assert.match(daily, /visibility == 'public'/); assert.match(daily, /KNOWLEDGE_REFINEMENT_ENABLED/);
  assert.doesNotMatch(ci, /secrets\.|pull_request_target|contents: write|upload-artifact/);
  for (const match of (daily + ci).matchAll(/uses: (\S+)/g)) assert.match(match[1], /@[a-f0-9]{40}$/);
});
