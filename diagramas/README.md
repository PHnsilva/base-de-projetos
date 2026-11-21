# Catálogo de diagramas

Comece pela pergunta. Cada desenho precisa de público, fronteira e fonte verificável. Em trabalho pequeno, contexto e um fluxo podem ser suficientes.

| Pergunta | Tipo e exemplo preenchido |
| --- | --- |
| Quem participa e qual sistema tem a responsabilidade pela reserva? | [Contexto](../exemplos/reservas-de-recursos/diagramas.md#contexto) |
| Que unidades de execução compõem a solução proposta? | [Contêineres](../exemplos/reservas-de-recursos/diagramas.md#contêineres) |
| Onde ficam autorização, regra de domínio e persistência? | [Componentes do backend](../exemplos/reservas-de-recursos/diagramas.md#componentes-do-backend) |
| Que objetivos pertencem a cada ator? A representação usa Mermaid. | [Casos de uso](../exemplos/reservas-de-recursos/diagramas.md#casos-de-uso) |
| O UC-01 distingue entrada inválida, falha de gravação e sucesso. | [Fluxo de solicitação](../exemplos/reservas-de-recursos/diagramas.md#fluxo-de-solicitação) |
| O UC-02 mostra a transação na confirmação e a preservação do estado nos erros. | [Sequência de decisão](../exemplos/reservas-de-recursos/diagramas.md#sequência-de-decisão) |
| Quais transições a aplicação permite a partir de pendente? | [Estados da reserva](../exemplos/reservas-de-recursos/diagramas.md#estados-da-reserva) |
| Como pedidos, equipamentos e autorização por equipamento se relacionam? | [Modelo de dados](../exemplos/reservas-de-recursos/diagramas.md#modelo-de-dados) |
| Qual é a fronteira proposta entre cliente, aplicação e dados? | [Implantação](../exemplos/reservas-de-recursos/diagramas.md#implantação) |
| Como uma descoberta vira artefato e evidência no repositório de destino? | [Processo de trabalho](../exemplos/reservas-de-recursos/diagramas.md#processo-de-trabalho) |

Use o [modelo de diagrama](../templates/projeto/diagrama.md) para registrar escopo, propósito e verificação. Em projetos com hierarquia C4, contexto mostra atores e sistemas, contêineres mostram unidades de execução e componentes mostram responsabilidades dentro de um contêiner. Para UML formal, escolha uma notação ou ferramenta adequada ao público.

Inclua fonte editável, explique abreviações, cheque a renderização e confira caminhos alternativos contra os requisitos. O código dos diagramas usa [Mermaid no GitHub](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams). Consulte também o [C4 Model](https://c4model.com/), [PlantUML](https://plantuml.com/) e [Structurizr](https://structurizr.com/).
