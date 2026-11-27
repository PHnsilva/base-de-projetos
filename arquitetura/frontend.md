# Frontend · escolher pelo fluxo e pela operação

Rendering, estado, composição de clientes e autonomia de entrega são decisões diferentes. Uma interface pode combinar conteúdo renderizado no servidor com interações locais e usar a mesma API.

| Se o produto tem… | Ponto de partida razoável | Verifique antes de mudar |
| --- | --- | --- |
| Página institucional, documentação ou catálogo público com pouco estado | Conteúdo estático ou renderizado no servidor. Acrescente JavaScript às interações necessárias | Conteúdo visível em rede lenta, navegação por teclado e envio de formulário com falhas |
| Formulário autenticado com solicitação, histórico e confirmação | Uma interface coesa e rotas por tarefa. Retenha estado onde o fluxo precisa recuperar dados | Retorno ao formulário, preservação de campos, foco em erro, sessão expirada e gravação incerta |
| Editor com várias operações locais, atalhos e estado entre etapas | Considere SPA ou componentes cliente no trecho interativo | Persistência de rascunho, entrada inicial, navegação, atualização e recuperação de falha |
| Clientes web e móvel pedem respostas com formatos e ritmos de evolução diferentes | Compare contrato comum com um BFF por experiência | Quantas chamadas e transformações sumiriam em cada cliente, custo de latência e quem mantém o BFF |
| Várias equipes precisam entregar áreas independentes no mesmo produto | Comece por limites de código. Considere microfrontends se a publicação independente for requisito | Responsabilidade por rotas, sessão, acessibilidade, dependências duplicadas, observabilidade e reversão por área |

## Exemplo · portal de reservas

A solicitação, o histórico e a fila de decisão podem partir de uma interface única. O requisito decisivo é dar retorno correto ao associado quando o envio falha. O formulário deve manter os valores, informar se a criação foi confirmada e orientar a consulta ao histórico quando a resposta for incerta. A API continua responsável por autorização e estado persistido.

Teste as jornadas com teclado, campos inválidos, sessão expirada, nenhuma reserva e perda da resposta depois do envio. Registre quais resultados dependem da persistência. [Fluxo de solicitação](../exemplos/reservas-de-recursos/diagramas.md#fluxo-de-solicitação) · [Backend e serviços](backend-servicos.md)

Referências [WCAG, W3C](https://www.w3.org/WAI/standards-guidelines/wcag/) · [Micro Frontends](https://martinfowler.com/articles/micro-frontends.html) · [Backends for Frontends](https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends)
