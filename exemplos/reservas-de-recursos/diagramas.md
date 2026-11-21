# Diagramas de reservas

## Contexto

Quem usa a aplicação e onde o estado das reservas é guardado?

```mermaid
flowchart TD
    associado["Associado"] -->|"Pede e consulta reservas"| app["Aplicação de reservas"]
    responsavel["Responsável pelo equipamento"] -->|"Confirma ou recusa pedidos"| app
    app -->|"Persiste pedidos e decisões"| dados["Armazenamento de reservas"]
```

## Sequência de decisão no UC-02

Em que momento a aplicação aplica a autorização e verifica a concorrência?

```mermaid
sequenceDiagram
    actor R as Responsável
    participant A as Aplicação
    participant D as Armazenamento
    R->>A: Decidir pedido pendente
    A->>A: Verificar autorização e decisão
    alt Confirmar
        A->>D: Confirmar se livre em uma transação
        alt Faixa livre
            D-->>A: Confirmação persistida
            A-->>R: Pedido confirmado
        else Sobreposição
            D-->>A: Conflito
            A-->>R: Pedido segue pendente
        end
    else Recusar
        A->>D: Persistir recusa e motivo
        D-->>A: Recusa persistida
        A-->>R: Pedido recusado
    end
```

O diagrama supõe ator autorizado e entrada válida. Os cenários de acesso recusado e de fronteiras de horário estão no [plano de testes](especificacao.md#plano-de-testes).
