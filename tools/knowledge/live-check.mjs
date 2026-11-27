// Explicit read-only integration check. Not part of offline CI or scheduled publication.
import { readFileSync, writeFileSync } from 'node:fs';
import { Budget, Client } from './http.mjs';
import { brazilDay, normalizeWork, selection, stable } from './core.mjs';
import { Crossref } from './refine.mjs';
const policy = JSON.parse(readFileSync(new URL('./policy.json', import.meta.url)));
const source = new Crossref(new Client({ budget: new Budget({ searchMs: 90_000, totalMs: 100_000 }) }));
const day = brazilDay();
const original = '10.1177/1758835919874651'; // Outside selection domains; integrity fixture only, never catalogued.
const notices = await source.notices(original);
if (!notices.some(n => n.type === 'retraction' && n.doi === '10.1177/17588359211061903')) throw new Error('Known reverse retraction lookup did not return expected notice');
const candidates = await source.discover('software-engineering', policy, day);
const eligible = candidates.map(w => ({ w, m: normalizeWork(w, day, policy) }))
  .filter(x => x.m && selection(x.w, x.m, policy));
const result = { checkedAt: new Date().toISOString(), mode: 'read-only-integration-check', reverseRetractionLookup: { original, notices },
  discovery: { topic: 'software-engineering', returned: candidates.length, eligibleByTitleRules: eligible.length,
    sampleDois: eligible.slice(0, 3).map(x => x.m.doi) } };
if (process.argv[2]) writeFileSync(process.argv[2], stable(result));
console.log(stable(result));
