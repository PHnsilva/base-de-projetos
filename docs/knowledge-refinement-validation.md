# Validação do refinamento bibliográfico

Issue de entrega: [#18](https://github.com/PHnsilva/base-de-projetos/issues/18). Verificação iniciada em 26/11 e continuada em **27/11/2026**, horário de Brasília. Base inspecionada: `b156c6d35a19349fecdd5d2a7ac97e51a74ace3e`. O [PR #16](https://github.com/PHnsilva/base-de-projetos/pull/16) foi inventariado e preservado. A licença, instruções, templates de issues, catálogos, resenhas, documentação de arquitetura/Project e ferramentas existentes orientaram o recorte.

## Testes locais

Windows/PowerShell, Node.js **24.22.3**, Git **2.56.0.windows.4**. Comandos executados:

```sh
node --test tools/knowledge/*.test.mjs exemplos/reservas-de-recursos/codigo/*.test.mjs
node tools/knowledge/validate.mjs
node tools/documentacao/validar.mjs
git diff --check
```

São **49 testes da curadoria** e **8 testes existentes do domínio de reservas**, total de **57**. Os cenários cobrem:

- DOI normalizado, respostas de DOI diferente, metadados incompletos, datas parciais/inválidas/futuras e fontes fora da origem permitida.
- Classificação por título, ausência de avaliação científica inventada, editora independente e tipos excluídos.
- Duplicação por DOI/título, limites semanais/globais/por tema, referências em PRs pendentes e preservação de textos autorais.
- Retratação/correção na direção correta, relações de versão, proteção de clássicos e preservação de aviso histórico ausente numa resposta posterior.
- Erros 401/403/429/5xx, Retry-After, indisponibilidade, prazo de busca, reserva de publicação, tamanho de resposta e paginação incompleta.
- Commit útil, PR marcado, identidade humana, zero commits vazios, repetição/contingência, PR fechado, mudança de data, mudanças de base/heads e branch após interrupção.
- Validação de identidade e diff para recuperação; caminhos permitidos, nenhum endpoint de merge/review/fechamento, secrets separados das fontes e CI sem secrets de usuário.

APIs são simuladas nesses cenários. Em especial, os testes de publicação e recuperação não constituem um envio real usando PAT.

## Consultas reais

1. `node tools/knowledge/run.mjs --output ../dry-run.json`: terminou com **três propostas**, **três DOI conferidos**, zero metadados rejeitados e nenhum aviso de falha. Inventariou o PR #16 aberto. As propostas indexavam referências já citadas (Brooks, Garlan e Parnas) e não alteravam resenhas; nenhuma branch, commit ou PR diário foi criado. Os dados permaneceram fora do catálogo versionado.
2. `node tools/knowledge/live-check.mjs ../live-check.json`: executado em **2026-11-27T03:02:58Z**, somente leitura. A consulta reversa do DOI [original](https://doi.org/10.1177/1758835919874651) encontrou o [aviso de retratação](https://doi.org/10.1177/17588359211061903), tanto da editora como de Retraction Watch. Esse caso é apenas um controle de integração, fora do domínio selecionado e nunca incluído no catálogo. A [consulta de avisos](https://api.crossref.org/works?filter=updates%3A10.1177%2F1758835919874651&rows=100) pode ser repetida, sujeita a mudança na fonte.
3. No mesmo comando, a busca real de engenharia de software retornou **15 resultados**, dos quais **10** satisfizeram os requisitos de metadados e as regras de título. Isso comprova consulta/triagem, não inclusão, leitura crítica ou relevância científica de cada resultado. A seleção final ainda exige consulta exata, ausência de avisos retornados, cotas e comparação com o acervo/PRs.
4. Uma segunda execução local completa, após mais consultas, encontrou **HTTP 403 no GitHub anônimo** e interrompeu antes de publicar. Não foi tratada como sucesso. O workflow usa token efêmero de leitura no modo simulado para evitar essa limitação anônima; não usa esse token para publicar em nome do mantenedor.

Os documentos operacionais deste refinamento são excluídos do inventário bibliográfico local, evitando que DOI de controles de teste sejam transformados em referências do acervo.

## GitHub, segurança e custos

- API confirmou `PHnsilva/base-de-projetos` público, ativo, independente de fork e com `main` como branch padrão; perfil conectado PHnsilva. Nenhuma configuração de faturamento foi alterada.
- Regras de cobrança de Actions e condições de acesso do Crossref consultadas em fontes oficiais; execução restrita a runners Linux padrão de repositório público, sem artifacts/cache. [GitHub](https://docs.github.com/en/billing/concepts/product-billing/github-actions) · [Crossref](https://www.crossref.org/documentation/retrieve-metadata/rest-api/)
- Pins das actions oficiais consultados via API em 27/11/2026: checkout v6 `d23441a48e516b6c34aea4fa41551a30e30af803`; setup-node v6 `249970729cb0ef3589644e2896645e5dc5ba9c38`.
- Rulesets retornaram lista vazia. A leitura da proteção clássica da main retornou 403 por limite do conector; proteção não foi presumida nem alterada.
- Critérios de contribuição e permissões REST/PAT conferidos na documentação oficial. Autoria de PR real pelo PAT ainda precisa de verificação após a configuração pelo mantenedor.

## CI e ativação

O workflow `Knowledge refinement checks` executa os testes e validadores em Ubuntu/Node 24. Um job separado consulta fontes em modo somente leitura, com token efêmero limitado a leitura, timeout de dois minutos do processo e três minutos do job. Esse smoke check é tolerante à indisponibilidade: o resultado real deve ser lido nos logs/resumo e não inferido de um check verde. Não acessa `KNOWLEDGE_SYNC_TOKEN`.

O PR de implementação contém o resultado do CI correspondente ao commit publicado. As configurações manuais e os critérios de aceite do primeiro PR diário estão no [guia de ativação](knowledge-refinement.md#ativação-pelo-mantenedor-após-integrar-o-pr).

**Ainda não verificado nesta fase:** agendamento na main, publicação por KNOWLEDGE_SYNC_TOKEN, atribuição efetiva do primeiro PR diário no perfil, comportamento de quinze dias e consolidação real. Dependem da revisão/integração pelo mantenedor e da credencial configurada. Não houve merge, aprovação, fechamento de PRs ou ativação antecipada da rotina.
