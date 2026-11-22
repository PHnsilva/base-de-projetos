# Backend e serviços · fronteiras, dados e execução

Comece pelos dados que precisam permanecer consistentes, pelas mudanças que a equipe consegue operar e pelo resultado quando uma dependência falhar.

| Situação | Opção inicial e alternativa | Prova útil |
| --- | --- | --- |
| Regras de um domínio e uma equipe que publica em conjunto | Aplicação única com módulos por capacidade. Use divisão por processo quando uma fronteira de operação justificar | Testar regras sem acesso a detalhes de outro módulo e identificar qual processo escreve cada dado |
| Regra importante precisa sobreviver à troca de fornecedor | Separe o contrato de integração com porta e adaptador onde houver uma fronteira real | Testar o caso de uso isolado e executar teste de contrato com o adaptador efetivo |
| Ações rápidas precisam de uma confirmação consistente | Uma transação no componente que possui o dado. Compare processamento assíncrono somente se o produto aceitar conclusão posterior | Rodar concorrência com duas conexões e verificar estado e autoria após ambas as respostas |
| Trabalho lento ou sujeito a reprocessamento | API e worker do mesmo domínio com fila ou outbox. Considere serviço autônomo se houver dados e responsabilidade próprios | Simular reinício, duplicidade, indisponibilidade e mensagens fora de ordem |
| Capacidades mudam e escalam com ritmos realmente diferentes | Serviço independente com contrato, propriedade dos dados e equipe responsável | Publicar, reverter e operar isoladamente. Provar como funciona a consistência entre serviços |
| Legado precisa continuar disponível durante substituição | Extrair uma capacidade por vez mantendo roteamento previsível | Comparar paridade, estado transferido e reversão de rota ou dados |

## Quando separar a execução

No MVP de reservas, a confirmação responde com o estado gravado. O [ADR](../exemplos/reservas-de-recursos/adr-001-confirmacao.md) mantém a consistência em uma operação atômica.

No piloto de notificações, o e-mail tem prazo e recuperação próprios. A API pode gravar a alteração e a outbox na mesma transação. Um worker separado processa a entrega. Isso cria duas unidades de execução que ainda colaboram no mesmo domínio. A decisão depende do que deve persistir durante uma falha, de quem opera o worker e do contrato de duplicidade com o provedor. [Fluxo de eventos](../diagramas/exemplos-complementares.md#fluxo-de-eventos) · [Implantação](../exemplos/reservas-de-recursos/diagramas.md#implantação)

Referências [Parnas, modularização](../resenhas/criteria-for-modularization/criteria_for_modularization.md) · [Portas e adaptadores](https://alistair.cockburn.us/hexagonal-architecture) · [Monolith First](https://martinfowler.com/bliki/MonolithFirst.html) · [Microservices](https://martinfowler.com/articles/microservices.html) · [Strangler Fig](https://martinfowler.com/bliki/StranglerFigApplication.html)
