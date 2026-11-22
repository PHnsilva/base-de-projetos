# Catálogo de diagramas

Escolha a situação de revisão e o menor conjunto que ajuda a decidir. Mantenha visões diferentes quando o público ou a pergunta mudar. Variantes arquiteturais precisam de legenda, recorte e fonte.

## Escolher pelo escopo

| Situação de projeto | Comece com | Acrescente quando… |
| --- | --- | --- |
| MVP que substitui um formulário manual | [Contexto](../exemplos/reservas-de-recursos/diagramas.md#contexto) e [casos de uso](../exemplos/reservas-de-recursos/diagramas.md#casos-de-uso) | Use [fluxo de solicitação](../exemplos/reservas-de-recursos/diagramas.md#fluxo-de-solicitação) quando erro, recuperação ou passagem entre etapas mudar a experiência |
| Portal web com equipe pequena e uma API | [Contêineres](../exemplos/reservas-de-recursos/diagramas.md#contêineres) | Use [componentes](../exemplos/reservas-de-recursos/diagramas.md#componentes-do-backend) para explicar limites de teste e responsabilidade dentro da API |
| Decisão com disputa de gravação ou falhas externas | [Sequência](../exemplos/reservas-de-recursos/diagramas.md#sequência-de-decisão) | Use [dados](../exemplos/reservas-de-recursos/diagramas.md#modelo-de-dados) para cardinalidade e restrições. Use [estados](../exemplos/reservas-de-recursos/diagramas.md#estados-da-reserva) se o resultado muda o ciclo de vida |
| Sistema com vários módulos de código | [Pacotes](exemplos-complementares.md#pacotes) | Use [componentes UML](exemplos-complementares.md#componentes-uml) quando contratos e interfaces entre partes precisarem de revisão |
| Interação com muitos colaboradores, focada nos vínculos entre eles | [Comunicação](exemplos-complementares.md#comunicação) | Use sequência quando o ponto mais importante for o tempo e a ordem das mensagens |
| Banco novo ou migração de dados | [Modelo conceitual, lógico e físico](modelagem-de-dados.md) | Acrescente esquema, restrições e índices quando o armazenamento escolhido afetar integridade ou consulta |
| Regras e tipos do domínio difíceis de explicar | [Classes](exemplos-complementares.md#classes-do-domínio) | Use a visão entidade-relacionamento quando a equipe estiver discutindo chaves e persistência |
| Integração assíncrona que precisa se recuperar | [Fluxo de eventos](exemplos-complementares.md#fluxo-de-eventos) e [implantação](../exemplos/reservas-de-recursos/diagramas.md#implantação) | Use sequência para esclarecer a ordem de ACK, timeout ou retentativa |
| Produto com relatórios e fontes sensíveis | [Linhagem de dados](exemplos-complementares.md#linhagem-de-dados) | Use implantação quando armazenamento, rede e operação precisarem de ambientes ou donos diferentes |
| Revisão com várias equipes e entregas dependentes | [Processo por responsabilidade](../exemplos/reservas-de-recursos/diagramas.md#processo-de-trabalho) | Use o [mapa de dependências](../docs/github-project.md#camadas-do-backlog) para distinguir ordem de entrega de andamento atual |

## Distinguir as visões

- **Contexto** mostra pessoas, o sistema como unidade e integrações relevantes no escopo.
- **Contêineres** mostra aplicações e armazenamentos e como colaboram. Aqui, contêiner é o nível de abstração, mesmo quando nenhuma unidade usa Docker.
- **Componentes** abre um contêiner e mostra responsabilidades internas.
- **Implantação** mapeia o que roda em cada serviço, host ou zona de rede e o que deve permanecer operacional em uma falha.
- **Sequência, fluxo e estados** explicam, respectivamente, ordem das interações, caminhos de execução e transições válidas de uma entidade.

Pacotes descrevem organização e dependências de código. Componentes UML mostram contratos e interfaces. A visão de componentes do C4 usa outro foco e depende do contêiner aberto. Comunicação UML enfatiza os vínculos entre participantes e numera mensagens. Para trabalho que exige notação formal, consulte a [especificação UML da OMG](https://www.omg.org/spec/UML/).

Use a [ficha de diagrama](../templates/projeto/diagrama.md). Confira a notação, a visualização no ambiente do leitor e sua coerência com requisitos, casos de uso ou ADR.

Referências de notação e visualização [C4 Model](https://c4model.com/diagrams) · [Mermaid](https://mermaid.js.org/) · [PlantUML](https://plantuml.com/) · [Structurizr](https://structurizr.com/).
