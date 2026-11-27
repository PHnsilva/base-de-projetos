# Reserva de recursos compartilhados

Caso fictício de um laboratório comunitário. Associados solicitam e acompanham seus pedidos. Responsáveis decidem reservas dos equipamentos sob sua responsabilidade.

[Visão](visao.md) · [Especificação](especificacao.md) · [Histórias e cenários](historias-e-cenarios.md) · [Wireframes](wireframes.md) · [Perfis de acesso](perfis-de-acesso.md)

## Percurso iterativo

| Etapa de trabalho | Como aparece no caso | Evidência ou resultado esperado |
| --- | --- | --- |
| 1. Descobrir | Observar a solicitação manual e levantar dúvidas de associado e responsável | Mapa de atores, problema e hipótese de reduzir conflitos |
| 2. Delimitar o MVP | Selecionar solicitação, decisão e histórico. Adiar agenda externa e notificações | [Documento de visão](visao.md) |
| 3. Detalhar comportamento | Especificar jornadas, regras, pré-condições, alternativas, RF, RNF e aceite | [Casos de uso e requisitos](especificacao.md) · [Histórias e cenários](historias-e-cenarios.md) |
| 4. Selecionar RAS | Examinar consistência de faixa, autorização por recurso e resposta após falha de gravação | [Cenários e medidas](especificacao.md#requisitos-arquiteturalmente-significativos-ras) |
| 5. Prototipar e investigar | Percorrer formulário com teclado e mensagem incerta. Preparar cenário transacional antes de fechar a abordagem | [Wireframes](wireframes.md) · [Fluxo](diagramas.md#fluxo-de-solicitação) |
| 6. Desenhar e decidir | Delimitar frontend, API e persistência. Registrar por que confirmação e verificação devem ser atômicas | [Diagramas](diagramas.md) e [ADR](adr-001-confirmacao.md) |
| 7. Planejar | Fatiar primeiro incremento, regressão, piloto e evolução. Registrar dependências | [Backlog didático](../../docs/github-project.md#camadas-do-backlog) |
| 8. Implementar e verificar | Testar faixa, autorização e decisão no domínio. Planejar cenários de API e banco em ambiente representativo | [Código](codigo/README.md) e [matriz de testes](especificacao.md#plano-de-testes) |
| 9. Demonstrar, publicar e observar | Revisar a jornada em ambiente de teste. Ensaiar recuperação antes do piloto | Roteiro de homologação, evidência de aceite e runbook planejados |
| 10. Inspecionar e adaptar | Usar feedback do piloto para decidir sobre prazo, cancelamento ou notificações | Backlog revisado, decisão ou hipótese para o próximo incremento |

Descoberta, prototipação, refinamento e validação voltam quando surge informação que muda o trabalho. O código atual cobre regras puras. Frontend, API, implantação e persistência transacional são propostas do exemplo.
