# Reserva de recursos compartilhados

Caso fictício de um laboratório comunitário. Associados solicitam e acompanham seus pedidos. Responsáveis decidem reservas dos equipamentos sob sua responsabilidade.

1. Leia a [especificação](especificacao.md) e acompanhe um requisito pela [matriz de rastreabilidade](especificacao.md#matriz-de-rastreabilidade).
2. Consulte os [diagramas](diagramas.md) e o [ADR sobre concorrência](adr-001-confirmacao.md).
3. Compare as [issues didáticas](../../docs/github-project.md#issues-didáticas) e execute os [testes de domínio](codigo/README.md).

O código implementa as regras puras de faixa, autorização e decisão. Frontend, API e persistência transacional são propostas de arquitetura. O plano de testes indica o que exigiria essas integrações.
