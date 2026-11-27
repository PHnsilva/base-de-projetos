import test from 'node:test';
import assert from 'node:assert/strict';
import { Crossref } from './refine.mjs';

test('notices use the reverse update filter and retain only the target original', async () => {
  let request;
  const source = new Crossref({ request: async url => { request = new URL(url); return { status: 'ok', message: { 'total-results': 2, items: [
    { DOI: '10.1234/notice', 'update-to': [{ DOI: '10.1234/original', type: 'retraction', source: 'publisher' }] },
    { DOI: '10.1234/irrelevant', 'update-to': [{ DOI: '10.1234/another', type: 'correction' }] }
  ] } }; } });
  const result = await source.notices('10.1234/original');
  assert.equal(request.searchParams.get('filter'), 'updates:10.1234/original'); assert.equal(result.length, 1);
  assert.equal(result[0].doi, '10.1234/notice');
});
test('refuses truncated editorial notices and lookup responses with a different DOI', async () => {
  const source = new Crossref({ request: async () => ({ status: 'ok', message: { 'total-results': 101, items: [] } }) });
  await assert.rejects(source.notices('10.1234/original'), /truncated/);
  source.client.request = async () => ({ status: 'ok', message: { DOI: '10.1234/different' } });
  await assert.rejects(source.lookup('10.1234/original'), /mismatch/);
});
test('validates source response shape and treats absent DOI as absent metadata', async () => {
  const source = new Crossref({ request: async () => null });
  assert.equal(await source.lookup('10.1234/missing'), null); await assert.rejects(source.list({}));
});
