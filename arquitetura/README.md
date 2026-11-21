# Arquitetura para projetos de software

Use os guias para elaborar hipóteses e compará-las com o problema, a equipe e a operação. Registre a decisão com [ADR](../templates/projeto/adr.md) quando a escolha tiver consequências duradouras.

| Área | Onde começar | Critérios para discutir |
| --- | --- | --- |
| Frontend | [Interfaces e composição](frontend.md) | UX, acessibilidade, latência, publicação e autonomia |
| Backend | [Aplicações, integrações e serviços](backend-servicos.md) | Fronteiras, dados, consistência, operação e capacidade da equipe |
| Diagramas | [Catálogo de diagramas](../diagramas/README.md) | Público, pergunta e nível de detalhe |
| Evidência e leituras | [Catálogo](../referencias/README.md) | Contexto da fonte, método e condições para aplicar |

## Da hipótese à decisão

1. Identifique limites do domínio, dependências e restrições da equipe.
2. Compare opções pelos [atributos de qualidade](atributos-de-qualidade.md) que o projeto realmente precisa medir.
3. Registre a decisão e os limites da evidência em um ADR. O [exemplo de reservas](../exemplos/reservas-de-recursos/README.md) mostra esse percurso.
