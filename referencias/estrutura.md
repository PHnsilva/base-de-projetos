# Estrutura do acervo

## Referências comparadas

| Referência em uso | Organização observada | Aplicação nesta base |
| --- | --- | --- |
| [Diátaxis](https://diataxis.fr/) | Separa aprender, executar, consultar e compreender | O README atende à intenção do leitor. Exemplos, guias e catálogos têm entradas próprias |
| [arc42](https://docs.arc42.org/) | Referência por pergunta de arquitetura, com dicas e exemplos | A especificação organiza decisões e artefatos por finalidade. Equipes escolhem as seções que precisam |
| [Backstage Software Templates](https://backstage.io/docs/features/software-templates/) | Catálogo de modelos, parâmetros e configuração por caso de uso | Os templates têm índice e exemplos associados. A automação de geração de projetos pode ser avaliada quando houver repetições verificadas |
| [Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/) e [AWS Architecture Center](https://aws.amazon.com/architecture/) | Estilos, padrões e arquiteturas de referência com contexto | Os guias de arquitetura organizam decisões por frontend, backend e serviços, com critérios e custos de adoção |
| [C4 Model](https://c4model.com/) | Níveis de abstração para públicos e perguntas diferentes | O catálogo indica quando usar contexto, contêineres e componentes, além de outras representações |

## Organização adotada

| Diretório | Pergunta que responde | Conteúdo |
| --- | --- | --- |
| [docs/](../docs/) | Como iniciar e organizar o trabalho? | Escolha de documentos e uso do GitHub Project |
| [templates/](../templates/projeto/) | Que estrutura posso preencher? | Moldes em branco com instruções |
| [exemplos/](../exemplos/) | Como um caso completo liga esses artefatos? | Estudos fictícios com documentos, diagramas e validação |
| [arquitetura/](../arquitetura/) | Que opções devo comparar? | Guias por área, condições de adoção e limites |
| [diagramas/](../diagramas/) | Que visual responde à pergunta? | Índice por finalidade, com links para exemplos próximos ao domínio |
| [resenhas/](../resenhas/) | O que já foi lido e analisado? | Resenhas autorais e mapa temático |
| [referencias/](README.md) | Que fonte buscar para conhecer ou justificar algo? | Catálogos externos, leituras e fila de resenhas |
| [tools/](../tools/) | Que ferramenta executa a tarefa? | Código reutilizável, entradas, dependências e saídas |

A base usa Markdown e links, com navegação por intenção no README. Os índices ligam o mesmo conteúdo por caminhos diferentes. Mantenha uma fonte principal por artefato e ligue por referência sempre que ele servir a mais de uma área. O `AGENTS.md` reúne os pontos de entrada para agentes e deixa o detalhe nos guias. Se a busca por tema deixar de funcionar com os índices, avalie metadados estruturados depois de observar os termos e filtros usados de verdade.
