# Frontend

| Abordagem | Quando considerar | O que validar |
| --- | --- | --- |
| Página estática ou renderizada no servidor | Conteúdo, formulários simples ou rapidez de chegada ao conteúdo | Navegação, tempo até o conteúdo, acessibilidade e envio |
| SPA coesa | Sessão com interações ricas ou estado compartilhado entre rotas | Carga inicial, cache, estados de falha e navegação por teclado |
| BFF | Clientes têm necessidades de dados diferentes ou agregação excessiva na interface | Contrato, latência, autenticação e custo de manter outra unidade |
| Microfrontends | Times autônomos precisam publicar áreas bem delimitadas de forma independente | Integração, dependências duplicadas, identidade visual, desempenho e responsabilidade por incidentes |

Escolha a partir da jornada e dos requisitos. Em cada fluxo, descreva carregamento, estado vazio, sucesso, erro e recuperação quando fizerem diferença. Valide com dados de teste, tamanhos de tela relevantes e navegação por teclado. Use a análise de custos operacionais do backend antes de acrescentar um BFF ou outra camada de publicação.

[Patterns.dev](https://www.patterns.dev/) · [Micro Frontends, Cam Jackson](https://martinfowler.com/articles/micro-frontends.html) · [Backends for Frontends, Microsoft](https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends) · [WCAG, W3C](https://www.w3.org/WAI/standards-guidelines/wcag/)
