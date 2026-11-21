# Atributos de qualidade e decisões

Registre o que precisa acontecer sob uma condição verificável antes de escolher uma arquitetura. Use uma medida compatível com o risco e com o que a equipe consegue observar.

| Atributo | Pergunta para decidir | Exemplo de verificação |
| --- | --- | --- |
| Consistência | Que invariante precisa sobreviver a concorrência e retries? | Duas aprovações simultâneas e leitura final da persistência |
| Resiliência | Que falhas o usuário precisa conseguir recuperar? | Indisponibilidade simulada, confirmação do estado e nova tentativa |
| Segurança | Que ator atua sobre quais recursos? | Conta de outro recurso tenta decidir pedido e não altera o estado |
| Acessibilidade | Que operações precisam funcionar pelo teclado? | Percorrer pedido, mensagens de erro e confirmação sem mouse |
| Evolução | Qual decisão tende a mudar com maior frequência? | Testar substituição de adaptador mantendo contratos de domínio |
| Operação | Quem detecta, diagnostica e reverte uma falha? | Identificador rastreável e roteiro de recuperação em ambiente de teste |

Compare opções, registre consequências e defina o que justificaria reavaliar. Veja o [ADR de exemplo](../exemplos/reservas-de-recursos/adr-001-confirmacao.md) e o [plano de testes](../templates/projeto/plano-testes.md).
