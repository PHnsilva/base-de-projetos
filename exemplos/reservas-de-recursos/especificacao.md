# Especificação de reservas

## Visão e limites

Associados precisam pedir e acompanhar horários de uso de equipamentos. Responsáveis avaliam pedidos e evitam aprovar intervalos sobrepostos para o mesmo equipamento. Cadastro de equipamentos, notificações externas e sincronização de agenda ficam para outra fase.

## Requisitos

| ID | Comportamento | Caso de uso | Testes | Issue |
| --- | --- | --- | --- | --- |
| RF-01 | Associado envia faixa futura para recurso elegível e recebe identificador de pedido pendente | UC-01 | CT-01, CT-02 | [#5](https://github.com/PHnsilva/base-de-projetos/issues/5) |
| RF-02 | Responsável confirma ou recusa um pedido pendente | UC-02 | CT-03, CT-05 | [#3](https://github.com/PHnsilva/base-de-projetos/issues/3) |
| RF-03 | Só uma confirmação pode ocupar o mesmo intervalo para o mesmo recurso | UC-02 | CT-04, CT-06 | [#4](https://github.com/PHnsilva/base-de-projetos/issues/4) |
| RF-04 | Associado consulta os próprios pedidos com estado atualizado | UC-03 | CT-07 | Entrega futura a detalhar |

## Casos de uso

### UC-01 · Solicitar reserva

O associado autenticado escolhe o recurso, informa início e fim e envia o pedido. O sistema verifica elegibilidade, faixa futura e início anterior ao fim, e exibe o identificador com o estado pendente. Se houver erro nos campos, mantém as informações inseridas, indica o erro e deixa o armazenamento sem novo pedido.

### UC-02 · Decidir pedido

O responsável abre um pedido pendente e seleciona confirmar ou recusar. Confirmar exige autorização e verificação de sobreposição na mesma transação que persiste a decisão. Se ocorrer conflito, o pedido permanece pendente. Recusar exige motivo e registra quem tomou a decisão.

### UC-03 · Consultar próprios pedidos

O associado abre seu histórico. A aplicação filtra os pedidos pelo usuário autenticado e mostra seu estado atual.

## Arquitetura e operação

A interface envia a intenção à aplicação de reservas. A aplicação valida identidade, autorização, regras de faixa e transições. O armazenamento mantém o estado e garante a restrição de concorrência. A tecnologia é uma decisão do projeto que implementar o caso. Veja o [ADR 001](adr-001-confirmacao.md).

Para validar em um destino, use duas contas de teste, um equipamento sintético e um armazenamento equivalente ao ambiente publicado. Registre horário, tentativa, estado retornado e estado persistido. Evite guardar dados pessoais nas evidências.

## Plano de testes

| ID | Cenário | Resultado esperado |
| --- | --- | --- |
| CT-01 | Associado envia faixa válida e futura | Um pedido pendente com identificador |
| CT-02 | Envia fim igual ou anterior ao início, ou faixa passada | Erro de validação e nenhum novo pedido |
| CT-03 | Responsável decide pedido pendente | Estado acompanha a ação e a recusa guarda motivo |
| CT-04 | Duas tentativas simultâneas aprovam faixas sobrepostas do mesmo recurso | Uma confirmação persiste. A outra retorna conflito e mantém o pedido pendente |
| CT-05 | Associado tenta usar a ação reservada ao responsável | Acesso recusado e estado preservado |
| CT-06 | Uma faixa começa no fim de outra, ou envolve recurso diferente | Ambas podem ser confirmadas |
| CT-07 | Associado consulta com duas contas de teste | Cada conta só vê os próprios pedidos |

Todos os cenários estão planejados neste exemplo.
