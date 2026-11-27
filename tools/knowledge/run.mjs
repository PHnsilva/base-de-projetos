import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { brazilDay, stable } from './core.mjs';
import { Budget, Client } from './http.mjs';
import { GitHub, PREFIX } from './github.mjs';
import { Crossref, localInventory, refine } from './refine.mjs';
import { readFileSync } from 'node:fs';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const policy = JSON.parse(readFileSync(new URL('./policy.json', import.meta.url), 'utf8'));
const args = process.argv.slice(2), publish = args.includes('--publish');
if (args.some((arg, i) => !['--publish', '--output'].includes(arg) && args[i - 1] !== '--output')) throw new Error('Unknown argument');
const budget = new Budget(), today = brazilDay();
const token = publish ? process.env.KNOWLEDGE_SYNC_TOKEN : process.env.GITHUB_TOKEN;
if (publish && !token) throw new Error('Configure KNOWLEDGE_SYNC_TOKEN; no bot fallback is allowed');
if (publish && (process.env.GITHUB_REPOSITORY !== policy.repository || process.env.GITHUB_REF !== 'refs/heads/main')) throw new Error('Publication only from the configured repository default branch');
const github = new GitHub(new Client({ token, budget }), policy);
const source = new Crossref(new Client({ budget })); // Never send GitHub credentials to scientific APIs.
const summary = message => {
  console.log(message);
  if (process.env.GITHUB_STEP_SUMMARY) writeFileSync(process.env.GITHUB_STEP_SUMMARY, message + '\n', { flag: 'a' });
};
try {
  const repo = await github.metadata();
  if (await github.dayPR(today)) { summary(`A daily PR already exists for ${today}; no changes (including if closed or merged).`); process.exit(0); }
  const prs = await github.pulls();
  if (prs.filter(p => p.head.repo?.full_name === policy.repository && p.head.ref.startsWith(PREFIX)).length >= policy.maxPendingDailyPRs) {
    summary('Daily PR backlog limit reached; awaiting human consolidation.'); process.exit(0);
  }
  const baseRef = await github.get('/git/ref/heads/' + repo.default_branch);
  const pending = await github.snapshot(prs);
  const identity = publish ? await github.identity() : null;
  const recovered = publish ? await github.recover(PREFIX + today, repo.default_branch, prs, identity) : null;
  const plan = recovered ? { schemaVersion: 1, day: today, changes: recovered.changes, warnings: ['Recovered an interrupted branch; no new searches.'], stats: {} }
    : await refine({ inventory: localInventory(root), pending, source, policy, today, budget });
  const output = args.indexOf('--output');
  if (output !== -1) {
    if (!args[output + 1]) throw new Error('--output requires a path');
    writeFileSync(resolve(args[output + 1]), stable(plan));
  }
  summary(`Knowledge refinement ${today}: ${plan.changes.length} substantive changes; mode=${publish ? 'publish' : 'dry-run'}.\nChecks: ${JSON.stringify(plan.stats)}\nWarnings: ${plan.warnings.join(' | ') || 'none'}`);
  if (publish && plan.changes.length) {
    budget.check('publish', 60_000);
    const pr = await github.publish(plan, { defaultBranch: repo.default_branch, baseSha: baseRef.object.sha,
      pendingFingerprint: pending.fingerprint, identity, recoveredSha: recovered?.sha });
    if (pr) summary('Created automated pull request: ' + pr.html_url);
  }
} catch (error) {
  // Do not log raw API payloads, headers, environment variables, tokens, or untrusted PR data.
  summary('Knowledge refinement stopped safely: ' + error.message);
  process.exitCode = 1;
}
