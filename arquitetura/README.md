# Decisões de arquitetura por cenário

Comece com uma situação que tenha consequência observável. Uma decisão pode envolver interface, fronteira do backend, processamento assíncrono ou implantação. Analise essas dimensões separadamente antes de compor a solução.

| Cenário de decisão | Alternativas a comparar | Evidência que ajudaria a escolher |
| --- | --- | --- |
| Portal simples com páginas públicas e um formulário | HTML renderizado no servidor, páginas estáticas com formulário ou interface cliente | Primeira jornada navegável, validação, envio e erro em dispositivo representativo. Veja [frontend](frontend.md) |
| Área autenticada com edição frequente e estado compartilhado | Interface única, navegação de servidor com componentes interativos ou SPA | Provar se o fluxo precisa preservar estado local entre etapas e medir o custo da primeira carga. Veja [frontend](frontend.md) |
| Duas operações disputam o mesmo recurso | Uma transação no backend, fila por recurso ou outra estratégia de coordenação | Repetir a disputa em ambiente real e verificar o resultado persistido. Veja [backend e serviços](backend-servicos.md) |
| Tarefa lenta pode terminar depois da resposta web | Resposta síncrona, worker no mesmo domínio ou serviço autônomo | Medir tempo aceitável e provar recuperação após falha. Veja [backend e serviços](backend-servicos.md#quando-separar-a-execução) |
| Aplicação sofre com fila de publicações entre equipes | Unidades compartilhadas com fronteiras de código ou unidades independentes | Histórico de dependências, responsáveis por incidentes e capacidade de publicar e reverter separadamente |

## Como fechar uma decisão

1. Registre jornada, contexto, restrições e [RAS do caso](../exemplos/reservas-de-recursos/especificacao.md#requisitos-arquiteturalmente-significativos-ras).
2. Compare ao menos a solução mais simples disponível e a opção que trata a restrição. Identifique como dados, falhas e operação mudariam.
3. Use critérios observáveis, como os [atributos de qualidade](atributos-de-qualidade.md). Rode uma prova curta quando a evidência estiver faltando.
4. Registre escolha, alternativas, consequências e condição de reavaliação no [ADR](../templates/projeto/adr.md).

O [ADR de reservas](../exemplos/reservas-de-recursos/adr-001-confirmacao.md) mostra uma decisão motivada pela concorrência. O [catálogo](../diagramas/README.md) ajuda a documentar a visão adequada.
