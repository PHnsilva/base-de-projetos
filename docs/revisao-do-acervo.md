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

## Verificações executadas

Validação em Windows, em 22/11/2026, com Node.js 24.22.3.

A [issue #17](https://github.com/PHnsilva/base-de-projetos/issues/17) concentra o aceite desta entrega. A mudança está no [PR #16](https://github.com/PHnsilva/base-de-projetos/pull/16), aberto para revisão do mantenedor.

| Área | Método e resultado |
| --- | --- |
| Domínio e configuração | 14 testes aprovados: regras, calendário, repetição, retomada de falha, identidade da conta e preservação de andamento |
| GitHub autenticado | Aplicação do plano com início em 23/11/2026 e leitura dos valores persistidos das 12 issues; tipos Task/Feature/Bug, dois milestones e 16 bloqueios nativos conferidos |
| Cartões | Sprint, prioridade, tamanho, peso, funcionalidade, início e entrega preenchidos. Três itens em cada sprint; pesos totais 8, 11, 8 e 11 |
| Views | Kanban por Status e Sprint; Sprints e carga por iteração; Por funcionalidade por capacidade; Roadmap com datas; Dependências com filtro de bloqueio; Evolução do acervo para o trabalho real. Seis perspectivas, fundamentadas em referências públicas |
| Diagramas | Fontes Mermaid e PlantUML renderizadas e inspecionadas. Pacotes e componentes UML têm SVG disponível diretamente no documento e conservam suas fontes |
| Exportação | Dois ZIPs padrão comparados por hash. Exportação opcional de reservas com Pandoc 3.14 e Typst 0.15.1 gerou nove PDFs, totalizando 20 páginas; páginas renderizadas e inspecionadas, incluindo o wireframe SVG |
| Links | Verificador de destinos locais executado após a inclusão dos SVGs |
| Autoria e revisão | Autor e committer dos commits de trabalho vinculados a PHnsilva. Revisão automática do Codex desativada apenas neste repositório; PR permanece sujeito à avaliação do mantenedor |

A renderização usou Mermaid CLI 12.2.0 e PlantUML 1.2026.10 com Temurin 21. As ferramentas foram executadas localmente. A exportação padrão preserva Markdown, imagens e fontes; o PDF opcional conserva blocos Mermaid como código, conforme o [contrato do exportador](../tools/documentacao/README.md#incluir-pdf).

## Limites do exemplo executável

O acervo implementa funções puras de domínio. O sistema fictício de reservas não inclui frontend, API, autenticação ou adaptador de banco executáveis. CT-04, CT-07 e CT-08 descrevem a validação que o projeto de destino deve implementar. A renderização dos diagramas e os testes do acervo não demonstram concorrência transacional, isolamento por sessão ou recuperação de rede do produto.

O configurador preenche campos e relações do Project, mas não reorganiza suas views. A organização visual é uma configuração persistida do quadro, descrita no [guia](github-project.md) e no [roteiro de reprodução](../tools/github-project/README.md#ajustar-as-abas-existentes).
