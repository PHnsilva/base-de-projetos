# Contribuir

1. Consulte as [issues](https://github.com/PHnsilva/base-de-projetos/issues). Registre público, objetivo, artefato afetado e critério observável.
2. Faça a mudança com dados fictícios e preserve a autoria de fontes externas. Registre se a mudança é uma proposta ou resultado executado.
3. Na revisão, percorra os links, compare os diagramas à especificação e execute os testes e ferramentas aplicáveis. Informe ambiente, comando e resultado.
4. Envie material que possa ser disponibilizado sob os [termos do acervo](LICENSE). Para trabalhos de terceiros, prefira link, atribuição e análise própria.

## Refinamento bibliográfico automatizado

A [rotina diária](docs/knowledge-refinement.md) propõe fichas de metadados e candidatas à leitura com fontes explícitas, limites de crescimento e revisão humana. Consulte o [catálogo estruturado](referencias/catalogo/README.md) e execute `node --test tools/knowledge/*.test.mjs` ao alterar a curadoria.

Aprovação científica, mudanças em resenhas, consolidação quinzenal e merge pertencem ao mantenedor. A autoria automatizada aparece no título, commit e corpo dos PRs; metadados não substituem leitura crítica. O [registro de validação](docs/knowledge-refinement-validation.md) distingue testes simulados e verificações reais.
