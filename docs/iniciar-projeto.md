# Iniciar ou revisar um projeto

Comece pelo problema, pelo público e pela entrega acordada. Leia o que já existe antes de propor arquivos novos. Decida com base no tamanho da equipe, nos riscos e no custo de manter a documentação atualizada.

| Quando aparece no escopo | Artefato que costuma ajudar |
| --- | --- |
| Todo início com instalação ou operação própria | README com objetivo, comandos verificados e limites |
| Divergência sobre objetivos, público ou fronteira do MVP | Visão e escopo |
| Comportamento de usuários, fluxos alternativos ou regras de negócio | Requisitos numerados e casos de uso |
| Dependências externas, ambientes ou fronteiras de responsabilidade | Documento de arquitetura e diagrama de contexto |
| Ordem dos passos, transferência de responsabilidade ou concorrência | Fluxograma, sequência ou diagrama de estados, conforme a pergunta |
| Decisão técnica de impacto duradouro | ADR com contexto, opções, decisão, consequências e gatilho de revisão |
| Entregas com dependências e validação por pessoas diferentes | Issues com aceite, dependências e Project quando útil |
| Falhas relevantes, mudanças em dados, permissões ou operação | Plano de testes, matriz de acesso, contrato, runbook ou procedimento de recuperação |
| Alinhamento de navegação ou estados da interface | Wireframes anotados e cenários de erro, carregamento e confirmação |
| Distribuição para leitura offline | Pacote gerado com fontes e artefatos versionáveis |

## Aplicar

1. Identifique o que precisa ser decidido, explicado, implementado ou verificado nesta fase.
2. Use o menor conjunto de artefatos suficiente. Em trabalho pequeno, reúna visão, uso e validação no README. Separe arquivos quando público, ciclo de revisão ou tamanho justificar.
3. Escreva a partir das evidências do destino. Marque decisões, pendências e limites com clareza. Use identificadores estáveis quando forem úteis para ligar caso de uso, requisito, issue e teste.
4. Separe entregas que possam ser verificadas. Use o [guia de issues e views](github-project.md) se houver trabalho para acompanhar.
5. Valide pelo caminho normal de quem vai usar a entrega. Registre comando ou procedimento, cenário, resultado e pendências.

Consulte o [índice dos modelos](../templates/projeto/README.md), o [exemplo aplicado](../exemplos/reservas-de-recursos/README.md) e o [catálogo de referências](../referencias/README.md).
