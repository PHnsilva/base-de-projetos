# Especificação de reservas

O [documento de visão](visao.md) concentra objetivo, escopo, fronteiras e hipóteses. Use a especificação para comportamento e requisitos.

## Visão e limites

O recorte inclui solicitação, decisão e histórico. A [visão](visao.md) registra o contexto, os limites do MVP e as hipóteses. A [matriz de acesso](perfis-de-acesso.md) detalha quem realiza cada ação.

## Casos de uso

### UC-01 · Solicitar reserva

**Ator e objetivo** · Associado registra uma faixa para acompanhar o pedido pelo identificador.  
**Gatilho** · Seleciona Solicitar reserva.  
**Pré-condições** · Sessão válida e catálogo disponível.

1. A interface mostra recursos elegíveis e campos de início e fim.
2. O associado seleciona um recurso e envia a faixa em horário local.
3. A API identifica o solicitante pela sessão, normaliza instantes e valida elegibilidade e faixa.
4. A persistência grava um novo pedido pendente para a operação bem-sucedida.
5. A resposta e a interface mostram identificador e estado persistido.

**Alternativas.** Sem sessão, pede autenticação antes de criar. Recurso inelegível ou faixa inválida preserva campos e retorna erro sem gravar. Falha ou resposta incerta da gravação evita sucesso falso e orienta consultar o histórico antes de outro envio. Se a consulta não permitir identificar a tentativa com segurança, informa a incerteza. Reenvio idempotente depende de contrato específico.

**Resultado** · Pendente verificável ou erro com o estado preservado. RF-01, RN-01, RNF-01 e CT-01/02/08.

### UC-02 · Decidir pedido

**Ator e objetivo** · Responsável decide um pedido do equipamento sob seu vínculo.  
**Gatilho** · Seleciona confirmar ou recusar.  
**Pré-condições** · Sessão válida, vínculo ativo e pedido pendente.

1. A API verifica identidade, papel, vínculo e estado atual do pedido.
2. O responsável envia a decisão e, na recusa, o motivo.
3. A aplicação valida a decisão. Para confirmar, solicita verificação de faixa e escrita numa operação atômica.
4. A persistência registra estado, autor e horário. Na recusa, registra também o motivo.
5. A aplicação retorna a decisão persistida.

**Alternativas.** Falta de papel ou vínculo retorna acesso negado. Motivo vazio retorna erro de entrada. Sobreposição mantém pendente e retorna conflito sem decisão final. Tentativa sobre pedido decidido devolve o estado vigente e preserva a trilha. Falha de armazenamento evita afirmar sucesso e permite conferir o estado após recuperação.

**Resultado** · Uma decisão válida persiste ou o estado anterior é preservado. RF-02/03, RN-02/03/04 e CT-03/04/05/06/09.

### UC-03 · Consultar próprios pedidos

**Ator e objetivo** · Associado acompanha seus pedidos.  
**Gatilho** · Abre Meus pedidos.  
**Pré-condição** · Conta autenticada.

1. A API obtém o identificador da sessão.
2. Consulta o armazenamento filtrando pelo proprietário autenticado.
3. Retorna identificador, recurso, faixa e estado atual.
4. A interface mostra os pedidos e permite abrir seu detalhe.

**Alternativas.** Sem sessão, pede autenticação. Sem registros, mostra lista vazia. Identificador de outro proprietário na entrada não muda o filtro da sessão. Falha de consulta mostra indisponibilidade, distinguindo-a da lista vazia.

**Resultado** · Retorno restrito ao associado autenticado. RF-04, RAS-02 e CT-07.

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
