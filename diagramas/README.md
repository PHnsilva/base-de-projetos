# Diagramas

Comece pela pergunta que o desenho precisa responder. Inclua título, escopo, público e referência ao documento explicativo. Abra o [exemplo com Mermaid](../exemplos/reservas-de-recursos/diagramas.md) para ver dois níveis de detalhe no mesmo projeto.

| Tipo | Pergunta | Quando documentar |
| --- | --- | --- |
| Contexto | Quem usa a solução, quais sistemas integram e onde estão as fronteiras? | Há dependências, públicos ou equipes com interpretações diferentes |
| Contêineres no C4 | Quais aplicações e armazenamentos executam e como colaboram? | Há unidades de execução e implantação que precisam ser entendidas |
| Componentes | Como se dividem as responsabilidades de uma unidade? | A decomposição influencia mudanças ou testes |
| Fluxograma | Quais caminhos e responsáveis existem em um processo? | Há alternativas, devoluções ou passagens entre equipes |
| Sequência | Em que ordem os participantes interagem? | Tempo, concorrência, chamadas externas ou falhas importam |
| Estados | Quais transições são válidas e quem pode iniciá-las? | O domínio tem ciclo de vida com regras |
| Entidade e relacionamento | Quais dados são persistidos e como se relacionam? | Integridade, cardinalidade, migração ou retenção precisam de acordo |
| Implantação | O que roda em cada ambiente e por onde trafega? | A operação depende de isolamento, redes ou serviços distintos |
| Wireframe anotado | O que o usuário vê e pode fazer em cada estado? | O fluxo ainda precisa de validação com usuários |

Mantenha a fonte versionada perto do conteúdo que ela explica. Use Mermaid para diagramas que podem ser lidos no Markdown. Considere PlantUML ou Structurizr se o projeto já usa UML ou mantém um modelo C4 reutilizável. Confira a renderização, os textos e a coerência com os requisitos antes de publicar.

[C4 Model](https://c4model.com/) · [Mermaid](https://mermaid.js.org/) · [PlantUML](https://plantuml.com/) · [Structurizr](https://structurizr.com/)
