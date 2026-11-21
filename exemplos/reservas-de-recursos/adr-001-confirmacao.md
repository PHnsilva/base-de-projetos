# ADR 001 · Confirmar reservas sem sobreposição

**Estado** Decisão fictícia para o exemplo  
**Rastreabilidade** UC-02, RF-03, CT-04 e CT-06

## Contexto

Duas pessoas podem tentar confirmar reservas para o mesmo recurso e intervalo ao mesmo tempo. Uma consulta antes da gravação pode observar disponibilidade para ambas as operações.

## Opções

- Serializar a verificação e a confirmação por recurso no armazenamento.
- Usar uma fila única para todas as aprovações. Simplifica ordenação, acrescenta uma dependência operacional e serializa confirmações de recursos independentes.

## Decisão

Garantir no armazenamento que a confirmação é atômica por recurso. Tratar conflito como resultado esperado e manter pendente qualquer pedido cuja confirmação não persistir.

## Consequências e validação

O mecanismo de isolamento depende da tecnologia selecionada no destino. Valide a concorrência no armazenamento real e teste intervalos adjacentes e recursos distintos. Reavalie o mecanismo se a tecnologia de persistência ou a carga por recurso mudar.
