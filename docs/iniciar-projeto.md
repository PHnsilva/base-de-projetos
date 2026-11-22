# Iniciar um projeto de software

Comece ouvindo quem usa, opera ou decide sobre o processo. Forme um entendimento comum do problema, escolha a primeira entrega e revise documentos à medida que as dúvidas mudarem.

## Do problema ao primeiro incremento

1. **Descoberta e visão.** Entenda processo atual, atores, problema, objetivos, resultado, restrições e hipótese de valor. Registre visão, escopo e fronteira do MVP no [documento de visão](../templates/projeto/visao.md).
2. **Casos de uso.** Converse com usuários para identificar objetivos, gatilhos, pré-condições, caminho principal e alternativas. Veja o [modelo de caso de uso](../templates/projeto/casos-de-uso.md).
3. **Requisitos e RAS.** Derive requisitos funcionais e não funcionais dos casos de uso, regras, restrições e riscos identificados. Dê ID, origem, medida e aceite. Destaque os RAS que mudam a arquitetura. Use a [especificação](../templates/projeto/especificacao.md).
4. **Histórias e cenários.** Fatie o comportamento em resultados para o usuário e descreva exemplos de sucesso, falha e fronteira. As histórias também podem ser esboçadas na descoberta e refinadas junto com casos de uso e requisitos. Use [histórias e cenários](../templates/projeto/historias-e-cenarios.md).
5. **Wireframes e perfis de acesso.** Valide a jornada, estados da interface e como pessoas com papéis distintos atuam sobre recursos. Registre no [modelo de interface e acesso](../templates/projeto/interface-e-acesso.md).
6. **Desenho e decisão.** Prototipe riscos decisivos, compare alternativas, escolha [diagramas por escopo](../diagramas/README.md) e registre decisões em [ADR](../templates/projeto/adr.md).
7. **Backlog e entrega.** Ordene dependências, escolha sprint ou objetivo de entrega e verifique o incremento com testes, revisão e demonstração. Use o [guia do Project](github-project.md).
8. **Publicação e aprendizado.** Prepare observação e recuperação. Use feedback para revisar recorte, requisitos, decisões e próximas entregas.

As etapas podem voltar e se sobrepor. Para equipes que adotam Scrum, o refinamento é contínuo e Review e Retrospectiva apoiam inspeção e adaptação. [Manifesto Ágil](https://agilemanifesto.org/iso/ptbr/principles.html) · [Scrum Guide](https://scrumguides.org/scrum-guide.html)

## Onde registrar cada informação

| Preciso registrar | Documento adequado |
| --- | --- |
| Problema, objetivo, visão do produto, escopo e limite do MVP | Documento de visão |
| O que os atores fazem e em que condições | Casos de uso, regras e casos alternativos |
| Comportamento, restrições de qualidade e evidência de aceite | Especificação de requisitos e RAS |
| Valor de uma fatia de trabalho e exemplos verificáveis | Histórias de usuário, cenários e critérios na issue |
| Acesso por papel, vínculo ou propriedade | Matriz de perfis de acesso |
| Decisões sobre telas, estados e navegação | Wireframes e roteiro de avaliação |
| Estrutura, integração e decisões de alto impacto | Diagramas, contratos e ADR |
| Descoberta de informações sobre o repositório e primeiro uso | README com apresentação, tecnologia, execução, testes, autoria e licença |
| Passos completos de instalação, publicação, diagnóstico ou reversão | Guia de execução, implantação ou runbook conforme o público |

O README apresenta o projeto e aponta para as fontes de detalhe. A [visão de reservas](../exemplos/reservas-de-recursos/visao.md) e o [README do exemplo](../exemplos/reservas-de-recursos/README.md) mostram as duas finalidades.
