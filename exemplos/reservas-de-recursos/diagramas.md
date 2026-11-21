# Diagramas de reservas

As visões abaixo representam o caso fictício. Contêineres, componentes e implantação descrevem a solução proposta. Compare com a [especificação](especificacao.md) e o [ADR de concorrência](adr-001-confirmacao.md).

## Contexto

Quem participa e qual sistema tem a responsabilidade pela reserva?

```mermaid
flowchart LR
    A[Associado] -->|Solicita e consulta| S[Aplicação de reservas]
    R[Responsável] -->|Confirma ou recusa| S
```

## Contêineres

Que unidades de execução compõem a solução proposta?

```mermaid
flowchart LR
    W[Frontend web] -->|HTTPS e JSON| A[API de reservas]
    A -->|Consulta e transação| B[(Banco relacional)]
```

## Componentes do backend

Onde ficam autorização, regra de domínio e persistência?

```mermaid
flowchart LR
    C[Controlador] --> U[Casos de uso]
    U --> D[Regras de domínio]
    U --> P[Porta de persistência]
    P --> A[Adaptador relacional]
```

## Casos de uso

Que objetivos pertencem a cada ator? A representação usa Mermaid.

```mermaid
flowchart LR
    A[Associado] --> U1([UC-01 Solicitar reserva])
    A --> U3([UC-03 Consultar próprio histórico])
    R[Responsável] --> U2([UC-02 Decidir pedido])
```

## Fluxo de solicitação

O UC-01 distingue entrada inválida, falha de gravação e sucesso.

```mermaid
flowchart TD
    I[Enviar solicitação] --> V{Entrada válida?}
    V -->|Sim| G{Gravou?}
    V -->|Não| E[Preservar campos e indicar erro]
    G -->|Sim| S[Mostrar ID e estado pendente]
    G -->|Não| F[Orientar a conferir o estado]
```

## Sequência de decisão

O UC-02 mostra a transação na confirmação e a preservação do estado nos erros.

```mermaid
sequenceDiagram
    actor R as Responsável
    participant A as Aplicação
    participant D as Persistência
    R->>A: Decidir pedido pendente
    alt Acesso ou estado inválido
        A-->>R: Rejeitar e preservar estado
    else Confirmação autorizada
        A->>D: Confirmar atomicamente se a faixa estiver livre
        alt Faixa disponível
            D-->>A: Confirmação persistida
            A-->>R: Mostrar confirmado
        else Sobreposição
            D-->>A: Conflito
            A-->>R: Mostrar pendente
        end
    else Recusa com motivo válido
        A->>D: Persistir recusa e autoria
        D-->>A: Recusa persistida
        A-->>R: Mostrar recusado
    end
```

## Estados da reserva

Quais transições a aplicação permite a partir de pendente?

```mermaid
stateDiagram-v2
    [*] --> Pendente : Criar pedido válido
    Pendente --> Confirmada : Confirmar faixa livre
    Pendente --> Recusada : Recusar com motivo
    Pendente --> Pendente : Conflito na confirmação
    Confirmada --> [*]
    Recusada --> [*]
```

## Modelo de dados

Como pedidos, equipamentos e autorização por equipamento se relacionam?

```mermaid
erDiagram
    ASSOCIADO ||--o{ PEDIDO : solicita
    EQUIPAMENTO ||--o{ PEDIDO : recebe
    RESPONSAVEL ||--o{ RESPONSABILIDADE : possui
    EQUIPAMENTO ||--o{ RESPONSABILIDADE : permite
    RESPONSAVEL o|--o{ PEDIDO : decide
    PEDIDO {
        string id PK
        datetime inicio_utc
        datetime fim_utc
        string estado
        datetime decidido_em
    }
```

## Implantação

Qual é a fronteira proposta entre cliente, aplicação e dados?

```mermaid
flowchart TD
    B[Navegador] -->|HTTPS| W[Servidor web]
    B -->|HTTPS| A[Servidor de aplicação]
    A -->|Conexão privada| D[(Banco de dados)]
```

## Processo de trabalho

Como uma descoberta vira artefato e evidência no repositório de destino?

```mermaid
flowchart LR
    E[Escopo acordado] --> R[Requisito e caso de uso]
    R --> I[Issue com critérios]
    I --> P[Pull request e teste]
    P --> V[Revisão e evidência]
```
