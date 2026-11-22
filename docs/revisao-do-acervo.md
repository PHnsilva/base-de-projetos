# Verificação desta revisão

| Solicitação do mantenedor | Artefato para revisar |
| --- | --- |
| README como apresentação com navegação, tecnologias, autoria e licença | [README](../README.md) e [modelo](../templates/projeto/readme-projeto.md) |
| Objetivos, visão e limites do MVP em documento próprio | [Visão de reservas](../exemplos/reservas-de-recursos/visao.md) |
| Casos de uso, requisitos, RAS, histórias, cenários, wireframe e acesso | [Percurso do exemplo](../exemplos/reservas-de-recursos/README.md) |
| Diagramas por mini-escopo e tipos distintos | [Catálogo](../diagramas/README.md), [reservas](../exemplos/reservas-de-recursos/diagramas.md), [UML complementar](../diagramas/exemplos-complementares.md) e [dados](../diagramas/modelagem-de-dados.md) |
| Guias de arquitetura com decisões concretas | [Cenários](../arquitetura/README.md), [frontend](../arquitetura/frontend.md) e [backend](../arquitetura/backend-servicos.md) |
| Sprints, campos coloridos, marcos e bloqueios | [Plano e views](github-project.md) e [configuração](../tools/github-project/README.md) |
| Índices para pessoas e assistentes diferentes | [Guia de consulta](../AGENTS.md), [templates](../templates/projeto/README.md), [ferramentas](../tools/README.md) e [referências](../referencias/README.md) |

## Evidências verificadas localmente

Os testes executáveis cobrem regras de domínio e o plano de configuração do Project com API simulada, incluindo repetição, retomada após falha e preservação de andamento. A validação de conteúdo confere links, âncoras e coerência do calendário de dependências. O exportador inclui o wireframe SVG e fontes PlantUML e mantém a saída reproduzível com as mesmas entradas.

## Verificações que dependem de outro ambiente

A execução com GitHub autenticado é necessária para confirmar tipos, campos, milestones, bloqueios e valores persistidos. A aplicação das abas, cores e faixas precisa de inspeção no Project. A configuração do script não altera as views existentes. As fontes Mermaid e PlantUML ainda precisam de conferência visual renderizada. Os testes de API, interface e concorrência no banco do produto fictício permanecem planejados no exemplo.

Os itens acima descrevem o limite da evidência atual. A revisão do PR pode ser feita pelos links, sem interpretar uma configuração preparada como alteração do quadro.
