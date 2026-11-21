# GitHub Project de referência

Abra [Base de Projetos · Referência Codex](https://github.com/users/PHnsilva/projects/13). O acesso ao quadro depende da visibilidade do Project. As issues e as instruções deste guia podem ser consultadas separadamente. As views mostram perspectivas sobre o mesmo conjunto de itens. Crie as que ajudem a equipe a decidir ou se coordenar.

| View | Use quando | O que olhar |
| --- | --- | --- |
| Backlog | Acompanhar o fluxo geral e detectar acúmulo | Status e quantidade de itens em cada etapa |
| Priority board | Tomar decisões sobre ordem de execução | Prioridade e entregas concorrentes |
| Team items | Coordenar responsáveis e repartir trabalho | Tabela do time, responsáveis e itens sem atribuição |
| Roadmap | Visualizar sequência de marcos e entregas com datas | Dependências e datas confirmadas |
| My items | Preparar o dia ou revisar atribuições pessoais | Itens atribuídos ao usuário |
| Defeitos | Triar falhas e escolher o próximo diagnóstico | Itens com a label `bug`, cenário, impacto e evidência |

As colunas do Kanban de referência são **Backlog**, **Ready**, **In progress**, **In review** e **Done**. Um item entra em **Ready** quando escopo, aceite e dependências estão disponíveis. Use **In review** ao apresentar a evidência para revisão. Feche quando a entrega estiver aceita. Ajuste estados e limites de trabalho ao tamanho e às decisões da equipe.

| Tipo de issue | Use quando | Exemplo |
| --- | --- | --- |
| Funcionalidade | Entregar um comportamento rastreável a requisito e caso de uso | [#5](https://github.com/PHnsilva/base-de-projetos/issues/5) |
| Defeito | Corrigir ou impedir regressão reproduzível | [#4](https://github.com/PHnsilva/base-de-projetos/issues/4) |
| Documentação | Atualizar um artefato com público, finalidade e critérios claros | [#3](https://github.com/PHnsilva/base-de-projetos/issues/3) |
| Investigação | Reduzir uma incerteza antes de decidir | [#2](https://github.com/PHnsilva/base-de-projetos/issues/2) |

## Tamanho, dependências e sub-issues

Uma boa issue representa uma entrega que alguém consiga revisar e aceitar. Use [o modelo de issue](../.github/ISSUE_TEMPLATE/entrega.md) para documentar objetivo, escopo, rastreabilidade, planejamento, critérios, dependências, insumos, validação e entrega. Adapte as seções ao risco e ao tipo da tarefa. As labels classificam o tipo de trabalho.

- Se os passos compartilham a mesma revisão e o mesmo aceite, use um checklist na issue.
- Se duas entregas têm critérios próprios e uma condiciona a outra, use issues independentes ligadas por dependência.
- Use sub-issues se houver um objetivo comum e partes com critérios, responsáveis ou entregas próprios, e se acompanhar o progresso agregado ajudar a equipe. Exemplo hipotético: uma migração por três ambientes, com validação e responsável por ambiente.
- Um requisito pode gerar várias issues. Uma issue também pode cobrir mais de um requisito quando todos compõem a mesma entrega verificável. Preserve os vínculos com casos de uso e testes.

Na base, as quatro issues de reservas são independentes e estão abertas como exemplos. O caso é fictício. Use os vínculos para entender o formato e reescreva o backlog para o seu escopo.
