# Histórias de usuário e cenários

As histórias dão valor e tamanho à entrega. Os casos de uso descrevem o comportamento e as alternativas. Os cenários tornam verificáveis as condições de aceite.

| História | Valor para a pessoa | Contexto |
| --- | --- | --- |
| HU-01 | Como associado, quero solicitar um horário e receber um identificador para acompanhar o envio | UC-01, RF-01 e CT-01/02/08 |
| HU-02 | Como responsável, quero decidir pedidos do meu equipamento com segurança para evitar horários incompatíveis | UC-02, RF-02/03 e CT-03/04/05/06/09 |
| HU-03 | Como associado, quero ver somente meus pedidos para acompanhar o estado sem expor reservas de outras pessoas | UC-03, RF-04 e CT-07 |

| Cenário | Dado | Quando | Então |
| --- | --- | --- | --- |
| HU-01 · Solicitação válida | Conta autenticada, recurso elegível e faixa futura | Envia o formulário | Vê ID e pendente após gravação |
| HU-01 · Retorno incerto | A resposta da tentativa se perde | O formulário recebe falha de comunicação | Informa que a criação não foi confirmada e indica conferir o histórico |
| HU-02 · Corrida | Dois pendentes sobrepostos do mesmo recurso | Dois responsáveis confirmam em paralelo | Uma confirmação persiste e o outro pedido segue pendente |
| HU-02 · Sem vínculo | Conta autenticada por outro equipamento | Tenta decidir o pedido | A API rejeita e preserva estado e trilha |
| HU-03 · Leitura isolada | Contas A1 e A2 têm pedidos distintos | Cada conta consulta seu histórico | Cada uma vê somente os próprios pedidos |

[Especificação e testes](especificacao.md#plano-de-testes) · [Wireframes da solicitação](wireframes.md)
