import { execFileSync } from 'node:child_process';

export const dailyPath = day => `reports/daily/${day}.json`;
export function validateDaily(record, path) {
  if (record?.kind !== 'daily-validation' || record.schemaVersion !== 1 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(record.day) || path !== dailyPath(record.day) ||
      !/^[a-f0-9]{40}$/.test(record.baseSha) || !Array.isArray(record.checks) ||
      record.checks.length !== 4 || record.checks.some(c => !['passed', 'failed'].includes(c.status) || typeof c.command !== 'string') ||
      !Array.isArray(record.pendingPRs)) throw new Error('Invalid daily validation report');
  return record;
}
export function dailyChange({ root, day, baseSha, prs, runner = execFileSync }) {
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/TOKEN|SECRET|PASSWORD|CREDENTIAL/i.test(key)));
  const checks = [
    ['node', ['--test', ...runner('git', ['ls-files', 'tools/knowledge/*.test.mjs', 'tools/github-project/*.test.mjs', 'exemplos/reservas-de-recursos/codigo/*.test.mjs'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean)]],
    ['node', ['tools/documentacao/validar.mjs']],
    ['node', ['tools/knowledge/validate.mjs']],
    ['git', ['diff', '--check']]
  ].map(([command, args]) => {
    try {
      const output = runner(command, args, { cwd: root, encoding: 'utf8', env, timeout: 120_000, maxBuffer: 1_000_000 });
      return { command: [command, ...args].join(' '), status: 'passed', output: output.trim() };
    } catch (error) {
      return { command: [command, ...args].join(' '), status: 'failed', output: String(error.stdout ?? '').trim(), exitCode: error.status ?? null };
    }
  });
  const record = { schemaVersion: 1, kind: 'daily-validation', day, baseSha,
    run: process.env.GITHUB_RUN_ID ? `https://github.com/PHnsilva/base-de-projetos/actions/runs/${process.env.GITHUB_RUN_ID}` : null,
    checks, pendingPRs: prs.map(p => ({ number: p.number, sha: p.head.sha, url: p.html_url })),
    nextAction: checks.some(c => c.status === 'failed') ? 'Corrigir as verificações que falharam antes de integrar.' :
      prs.length ? 'Revisar os PRs pendentes e consolidar as alterações aprovadas.' : 'Verificações concluídas; nenhuma pendência aberta na consulta.' };
  validateDaily(record, dailyPath(day));
  return { path: dailyPath(day), record, before: null, reason: 'Registrar evidências reproduzíveis de validação e pendências do projeto.' };
}
export function dailyPR(change) {
  const r = change.record;
  return `## Validação diária — ${r.day}\n\nBase verificada: ${r.baseSha}.\n\n${r.checks.map(c => `- ${c.status === 'passed' ? 'PASSOU' : 'FALHOU'}: \`${c.command}\``).join('\n')}\n\nPRs pendentes: ${r.pendingPRs.map(p => '#' + p.number).join(', ') || 'nenhum'}.\n\nPróxima ação: ${r.nextAction}\n\nO relatório em \`${change.path}\` contém os resultados executados. Não representa uma melhoria de código nem avaliação científica. Revisão e merge permanecem com o mantenedor.`;
}
