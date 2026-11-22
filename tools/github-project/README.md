# Configurar o exemplo de reservas no GitHub Projects

[reservas.json](reservas.json) descreve 12 issues do repositório público e o Project 13 de `PHnsilva`. O arquivo traz cores, janelas, intervalos de entrega e as 16 relações esperadas. O script usa a API do GitHub e a sessão autenticada do GitHub CLI. A data de início usada abaixo é ilustrativa.

## Revisar e aplicar

Na raiz da branch, use Node.js 22.2 ou superior. Gere o plano, confira início e fim de cada sprint e revise as dependências.

```sh
node tools/github-project/configurar.mjs --inicio 2027-01-11
```

Para aplicar, use uma sessão do GitHub CLI do proprietário, com acesso de escrita ao repositório e ao Project pessoal. Se a sessão precisar do escopo `project`, o GitHub CLI solicita autorização no navegador com `gh auth refresh -h github.com -s project`.

```sh
node tools/github-project/configurar.mjs --inicio 2027-01-11 --aplicar
```

Combine uma data inicial antes de aplicar. A ferramenta verifica o proprietário, confirma que as 12 issues levam a label `exemplo`, reaproveita campos e milestones compatíveis e confirma os valores dos cartões após as escritas. Cartões sem Status recebem Backlog. O andamento já preenchido é preservado. O campo Status deve existir com a opção Backlog antes da aplicação. Uma repetição com a mesma data verifica o estado e preenche as lacunas. A aplicação termina ao encontrar incompatibilidade. Operações já aceitas pelo GitHub podem ser retomadas com a mesma data. Para registrar autoria de trabalho, use assignees com pessoas reais quando o dono for acordado.

## Verificação local

```sh
node --test tools/github-project/configurar.test.mjs
```

O teste simula a API, verifica a precedência, valida os valores enviados e confirma que repetir o mesmo plano não duplica campos, cartões, milestones ou dependências.

## Ajustar as abas existentes

1. Na primeira aba do quadro, salve o nome **Kanban por sprints**. Em **View**, escolha **Column field → Status** e **Group by → Sprint**. Deixe filtro de itens abertos. Selecione Tipo, Prioridade, Tamanho e Funcionalidade para aparecer nos cartões e salve. Confira que o cabeçalho de S1 aparece atravessando as colunas.
2. Aproveite uma tabela existente para **Sprints**. Agrupe por Sprint. Exiba início, entrega, Tipo, Prioridade, Tamanho, Peso, Status e milestone. Use ordem por começo da janela.
3. Use a aba de cronograma para **Roadmap** quando os cartões tiverem datas. Em configuração de datas, selecione **Início planejado** e **Entrega planejada**. Confirme que #10, #5 e #15 aparecem nas janelas esperadas.
4. Aproveite outra tabela para **Por funcionalidade**. Agrupe por Funcionalidade e exiba Sprint, Tipo, Status e Prioridade. Solicitação deve mostrar #9 e #5 em sprints distintas. Defeitos e itens de uma pessoa podem ser acessados por filtros.
5. Inspecione as quatro abas, confirme a ordem e revise as antigas com o mantenedor. No Kanban, confira que Backlog não mostra limite de coluna; em #4, confira o tipo Bug, o milestone do MVP e os dois **Blocked by**.

O script não renomeia nem remove abas existentes. [Quadro do GitHub](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/customizing-the-board-layout) · [Roadmap](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/customizing-the-roadmap-layout)
