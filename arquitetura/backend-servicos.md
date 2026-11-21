# Backend e serviços

| Abordagem | Quando considerar | O que validar |
| --- | --- | --- |
| Aplicação única com módulos explícitos | Equipe pequena, fronteiras em evolução ou deploy e transação compartilhados | Contratos internos, isolamento de decisões e teste das regras |
| Portas e adaptadores | Regras relevantes precisam ser testadas isoladamente ou integrações podem mudar | Semântica das portas, responsabilidade pelos mapeamentos e testes com provedor real |
| Serviços independentes | Capacidades com ritmo de deploy, responsabilidade ou escala realmente independentes | Contratos, propriedade dos dados, falhas, observabilidade e custo de operação distribuída |
| Fila e eventos | Há processamento lento, necessidade de desacoplar publicação ou picos de carga | Idempotência, duplicidade, ordem, retentativas, recuperação e consistência |
| Extração incremental | O legado precisa continuar operando durante a troca de uma capacidade | Paridade funcional, limites de tráfego, estratégia de dados e reversão |

Comece pelas decisões que podem mudar, invariantes do domínio e falhas com impacto. Documente os atributos de qualidade que orientam a escolha e transforme-os em cenários verificáveis. Registre proprietário dos dados, dependências externas e quem responde por incidentes.

[Modularização, Parnas](../resenhas/criteria-for-modularization/criteria_for_modularization.md) · [Arquitetura hexagonal, Cockburn](https://alistair.cockburn.us/hexagonal-architecture) · [Microservices, Lewis e Fowler](https://martinfowler.com/articles/microservices.html) · [Monolith First](https://martinfowler.com/bliki/MonolithFirst.html) · [Strangler Fig](https://martinfowler.com/bliki/StranglerFigApplication.html)
