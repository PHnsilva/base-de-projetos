# Especificação de reservas

O [documento de visão](visao.md) concentra objetivo, escopo, fronteiras e hipóteses. Use a especificação para comportamento e requisitos.

## Visão e limites

O recorte inclui solicitação, decisão e histórico. A [visão](visao.md) registra o contexto, os limites do MVP e as hipóteses. A [matriz de acesso](perfis-de-acesso.md) detalha quem realiza cada ação.

## Casos de uso

### UC-01 · Solicitar reserva

O associado autenticado escolhe um recurso elegível, informa início e fim e envia. A aplicação valida a entrada e persiste o pendente. A interface exibe ID e estado somente após sucesso. Em erro de campo, mantém os valores digitados e indica a correção. Em falha de gravação, orienta a conferir o estado antes de reenviar.

### UC-02 · Decidir pedido

O responsável seleciona confirmar ou recusar. A aplicação confere autorização e estado. Na confirmação, a verificação de faixa e a escrita formam uma operação atômica. Em conflito, devolve o motivo e mantém o pendente. Na recusa, exige motivo e grava a decisão. Tentativa sobre pedido decidido devolve o estado vigente.

### UC-03 · Consultar próprios pedidos

A aplicação filtra pedidos pelo identificador autenticado. Uma conta sem pedidos recebe lista vazia. Sem sessão, pede autenticação.

## Requisitos e regras

| ID | Comportamento verificável |
| --- | --- |
| RF-01 | Registrar um pedido pendente com ID para recurso elegível e faixa futura válida |
| RF-02 | Permitir que o responsável confirme ou recuse pedido pendente e registrar autoria e horário |
| RF-03 | Garantir no máximo uma confirmação para faixas sobrepostas do mesmo recurso |
| RF-04 | Retornar somente os pedidos pertencentes ao associado autenticado |
| RNF-01 | Preservar o estado vigente nas falhas e rastrear cada decisão persistida pelo ID do pedido |

- **RN-01** A interface exibe horários em `America/Sao_Paulo`. A aplicação usa instantes UTC. Início estritamente futuro e fim posterior ao início.
- **RN-02** Intervalos seguem `[início, fim)`. Faixas adjacentes e recursos distintos podem ser confirmados independentemente.
- **RN-03** A aplicação confere papel, vínculo com o recurso e estado pendente. A recusa exige motivo. Conflito mantém o pedido pendente.
- **RN-04** Confirmações e recusas bem-sucedidas registram autor e horário. Nova tentativa sobre pedido decidido preserva a decisão anterior.

## Requisitos arquiteturalmente significativos (RAS)

Os RAS são os requisitos que condicionam decisões caras de modificar, como a origem da autorização ou a forma de persistir. Cada item aponta para o requisito original e explicita como verificar a resposta.

| RAS | Origem e cenário | Resposta verificável | Decisão influenciada |
| --- | --- | --- | --- |
| RAS-01 · Consistência | RF-03, UC-02. Dois responsáveis confirmam reservas sobrepostas do mesmo recurso simultaneamente | Uma confirmação persistida. A outra retorna conflito e mantém o pedido pendente | Verificação e escrita atômicas no armazenamento, conforme CT-04 e o [ADR](adr-001-confirmacao.md) |
| RAS-02 · Autorização | RF-02 e RF-04. Conta sem vínculo tenta decidir e dois associados consultam seus próprios históricos | Tentativa indevida não altera estado. Cada histórico contém só os pedidos da sessão | Autorização na API, consulta por proprietário e vínculo por recurso, conforme CT-05 e CT-07 |
| RAS-03 · Recuperação | RNF-01 e RF-01. A criação perde a confirmação de gravação | Interface evita afirmar sucesso e orienta conferência. Após recuperação, o estado real pode ser consultado | Contrato explícito entre interface, API e persistência, conforme CT-08 |

## Arquitetura e operação

Proposta com frontend web, um único backend modular e armazenamento relacional. O frontend representa estados de entrada, carregamento, sucesso, vazio e erro. O backend aplica autorização e regras de negócio. A persistência garante concorrência por recurso. O [ADR](adr-001-confirmacao.md) registra a decisão e os [diagramas](diagramas.md) mostram as fronteiras.

## Matriz de rastreabilidade

| Requisito | Caso | Testes | Issue didática |
| --- | --- | --- | --- |
| RF-01 | UC-01 | CT-01, CT-02, CT-08 | [#5](https://github.com/PHnsilva/base-de-projetos/issues/5) |
| RF-02 | UC-02 | CT-03, CT-05, CT-09 | [#3 · Documentação da decisão](https://github.com/PHnsilva/base-de-projetos/issues/3) |
| RF-03 | UC-02 | CT-04, CT-06 | [#4](https://github.com/PHnsilva/base-de-projetos/issues/4) |
| RF-04 | UC-03 | CT-07 | [#8](https://github.com/PHnsilva/base-de-projetos/issues/8) |
| RNF-01 | UC-01 e UC-02 | CT-05, CT-08, CT-09 | [#3](https://github.com/PHnsilva/base-de-projetos/issues/3) |

A [#2](https://github.com/PHnsilva/base-de-projetos/issues/2) investiga integração de agenda fora do MVP.

## Plano de testes

| ID | Cenário | Resultado esperado | Cobertura |
| --- | --- | --- | --- |
| CT-01 | Associado envia faixa válida | Pendente com ID | Regra de faixa no domínio. Fluxo e gravação planejados |
| CT-02 | Faixa inválida ou recurso inelegível | Erro, campos preservados, zero novos pedidos | Faixa no domínio. Interface e cadastro planejados |
| CT-03 | Responsável confirma ou recusa | Estado, autoria, horário e motivo quando aplicável | Regra no domínio. Persistência planejada |
| CT-04 | Duas confirmações simultâneas e sobrepostas | Exatamente uma confirmada. A outra permanece pendente | Integração planejada |
| CT-05 | Papel ou vínculo inválido | Ação negada e estado preservado | Regra no domínio. API e identidade planejadas |
| CT-06 | Faixas adjacentes ou recursos diferentes | Ambas podem ser confirmadas | Regra no domínio. Persistência planejada |
| CT-07 | Dois associados consultam histórico | Cada um vê somente seus pedidos | Integração planejada |
| CT-08 | Armazenamento falha durante a criação | Sem sucesso falso. Estado pode ser conferido após recuperação | Integração planejada |
| CT-09 | Outra tentativa após decisão persistida | Estado e trilha anteriores preservados | Regra no domínio. Concorrência no banco planejada |

Para CT-04, use duas transações, uma barreira de início, equipamentos sintéticos e consulta final ao armazenamento. Registre a versão, o cenário, as respostas e o estado efetivamente persistido.
