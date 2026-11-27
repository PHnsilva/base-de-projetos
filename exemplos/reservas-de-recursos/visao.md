# Visão do produto de reservas

## Problema atual

O laboratório recebe pedidos em um formulário avulso e confirma horários por mensagens. Associados têm dificuldade para saber se um pedido está pendente. Responsáveis podem decidir a mesma faixa sem ver a decisão anterior.

## Objetivo e sucesso

Receber pedidos com identificador, apresentar o histórico individual e evitar duas confirmações sobrepostas para o mesmo equipamento. O piloto deve demonstrar três jornadas com contas sintéticas, solicitação, decisão e consulta. A avaliação de concorrência exige transações reais.

## Pessoas e responsabilidades

- **Associado** solicita e acompanha suas reservas.
- **Responsável pelo equipamento** avalia pedidos dos recursos que administra.
- **Coordenação** valida os critérios do piloto e mantém o catálogo pelo processo atual. Administração de catálogo pelo portal fica para depois.

## Escopo do MVP

Inclui solicitação, aprovação ou recusa e histórico individual. Cadastro administrativo, notificações, agenda externa, expiração e cancelamento ficam para evolução. Restrições iniciais incluem horários locais na interface, isolamento por responsável e preservação do estado na recuperação de falhas.

## Hipóteses e riscos

A prioridade é saber se o pedido foi recebido e se houve uma decisão. Se a jornada de consulta não resolver o acompanhamento, investigar notificações com quem usa o laboratório. Se as gravações simultâneas falharem em homologação, corrigir a consistência antes do piloto.

[Casos de uso e requisitos](especificacao.md) · [Histórias e cenários](historias-e-cenarios.md) · [Perfis de acesso](perfis-de-acesso.md)
