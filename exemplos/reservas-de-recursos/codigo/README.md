# Código de domínio

[regras.mjs](regras.mjs) recebe instantes em milissegundos UTC e pedidos já normalizados. O chamador fornece o papel e os recursos atribuídos ao responsável. A função de decisão devolve uma cópia alterada ou um erro de domínio.

```sh
node --test exemplos/reservas-de-recursos/codigo/regras.test.mjs
```

A detecção de sobreposição usa as confirmações já observadas. A garantia de concorrência depende da persistência transacional descrita no [ADR](../adr-001-confirmacao.md). Veja a [matriz de testes](../especificacao.md#plano-de-testes) para o restante da cobertura planejada.
