# Refinamento bibliográfico

Ferramenta Node.js 24, sem pacotes npm, modelos de IA, serviços pagos ou execução de código recebido de fontes externas. [Requisitos, decisões, ativação e operação](../../docs/knowledge-refinement.md).

```sh
node --test tools/knowledge/*.test.mjs
node tools/knowledge/validate.mjs
node tools/knowledge/run.mjs
```

O último comando consulta o repositório público e o Crossref em modo somente leitura. Precisa de rede; `GITHUB_TOKEN` é opcional para evitar o limite anônimo do GitHub. Não informe credenciais na linha de comando. `--output caminho.json` salva o plano em um arquivo local fora do catálogo; esse arquivo não deve ser commitado. As simulações não enviam branches ou PRs.

`--publish` está reservado ao workflow na branch padrão do repositório configurado e exige `KNOWLEDGE_SYNC_TOKEN`. A ferramenta confirma a identidade do token, visibilidade e origem do repositório, inventaria PRs pendentes, valida os dados e publica somente arquivos bibliográficos por DOI. Não altera branches existentes.

| Arquivo | Responsabilidade |
| --- | --- |
| `policy.json` | Domínios, sinais de seleção, cotas e referências protegidas/excluídas |
| `core.mjs` | Normalização, validação, classificação, relações e regras de seleção |
| `http.mjs` | Origem permitida, timeout, limites de tamanho, retries, paginação e orçamento |
| `refine.mjs` | Inventário local, consultas Crossref e plano de alterações substantivas |
| `github.mjs` | Inventário de PRs, identidade, publicação atômica e recuperação de branch |
| `run.mjs` | Coordenação, limites e resumo de execução |
| `catalog.mjs` | Consulta JSON do catálogo sem rede |

Testes usam dados sintéticos e APIs simuladas para cenários destrutivos e de falha. A [validação da entrega](../../docs/knowledge-refinement-validation.md) distingue esses testes das consultas reais. Para publicar, o workflow usa a REST API do GitHub; não usa credenciais Git persistidas, shell com conteúdo remoto, checkout de branches de PRs ou ações de terceiros para abrir PRs.
