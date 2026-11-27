import test from 'node:test';
import assert from 'node:assert/strict';
import { Budget, Client, Deadline, HttpError } from './http.mjs';

test('GitHub credentials never reach Crossref and redirects are disabled', async () => {
  const requests = [];
  const client = new Client({ token: 'TEST_ONLY', wait: async () => {}, fetcher: async (url, options) => { requests.push({ url, options }); return new Response('{}'); } });
  await client.request('https://api.crossref.org/works'); await client.request('https://api.github.com/user');
  assert.equal(requests[0].options.headers.Authorization, undefined);
  assert.equal(requests[1].options.headers.Authorization, 'Bearer TEST_ONLY');
  assert.equal(requests[0].options.redirect, 'error');
  await assert.rejects(client.request('https://untrusted.example/'), /Disallowed/);
});
test('bounded retries recover from 429 and honor Retry-After', async () => {
  let count = 0; const waits = [];
  const client = new Client({ wait: async n => waits.push(n), fetcher: async () => ++count === 1 ? new Response('', { status: 429, headers: { 'Retry-After': '2' } }) : new Response('{"ok":true}') });
  assert.deepEqual(await client.request('https://api.github.com/test'), { ok: true }); assert.deepEqual(waits, [2000]);
});
test('long rate-limit reset fails safely instead of retrying too early', async () => {
  const client = new Client({ fetcher: async () => new Response('', { status: 429, headers: { 'Retry-After': '120' } }) });
  await assert.rejects(client.request('https://api.github.com/test'), HttpError);
});
test('does not retry unauthorized requests or ambiguous POST failures', async () => {
  for (const method of ['GET', 'POST']) {
    let count = 0; const client = new Client({ wait: async () => {}, fetcher: async () => { count++; return new Response('', { status: method === 'POST' ? 500 : 401 }); } });
    await assert.rejects(client.request('https://api.github.com/test', { method }), HttpError); assert.equal(count, 1);
  }
});
test('stops after three unavailable-source attempts', async () => {
  let count = 0; const client = new Client({ wait: async () => {}, fetcher: async () => { count++; throw new Error('network'); } });
  await assert.rejects(client.request('https://api.github.com/test')); assert.equal(count, 3);
});
test('Crossref request pacing respects dynamic rate headers and remains sequential', async () => {
  let time = 0; const waits = [];
  const client = new Client({ clock: () => time, wait: async n => { waits.push(n); time += n; },
    fetcher: async () => new Response('{}', { headers: { 'x-rate-limit-limit': '1', 'x-rate-limit-interval': '4s' } }) });
  await client.request('https://api.crossref.org/works'); await client.request('https://api.crossref.org/works');
  assert.deepEqual(waits, [4000]);
});
test('search deadline preserves a separate publication reserve', async () => {
  let time = 0; const budget = new Budget({ now: () => time, searchMs: 1000, totalMs: 6000 }); time = 2000;
  assert.throws(() => budget.check(), Deadline); budget.check('publish');
  let count = 0; const client = new Client({ budget, fetcher: async () => { count++; return new Response('{}'); } });
  await assert.rejects(client.request('https://api.github.com/test'), Deadline); assert.equal(count, 0);
  await client.request('https://api.github.com/test', { phase: 'publish' });
});
test('paginated inventory includes all pages and rejects non-arrays', async () => {
  const client = new Client(); let count = 0; client.request = async () => ++count === 1 ? Array(100).fill({}) : [{ last: true }];
  assert.equal((await client.pages('https://api.github.com/test')).length, 101);
  client.request = async () => ({}); await assert.rejects(client.pages('https://api.github.com/test'));
});
test('rejects truncated inventories, excessive response bodies and malformed JSON', async () => {
  const client = new Client({ wait: async () => {}, fetcher: async () => new Response('x'.repeat(8_000_001)) });
  await assert.rejects(client.request('https://api.github.com/test'), /size limit/);
  client.request = async () => Array(100).fill({}); await assert.rejects(client.pages('https://api.github.com/test'), /Pagination limit/);
  const invalid = new Client({ wait: async () => {}, fetcher: async () => new Response('not JSON') });
  await assert.rejects(invalid.request('https://api.github.com/test'), SyntaxError);
});
