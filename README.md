# Base de Projetos

Acervo brasileiro de engenharia de software para transformar uma ideia em escopo, decisões de arquitetura e entregas verificáveis. Reúne modelos, um projeto fictício com código e diagramas, ferramentas de documentação e leituras para estudantes, equipes e assistentes de IA.

[Começar](#comece-por-aqui) · [Exemplo](#exemplo-de-ponta-a-ponta) · [Estrutura](#estrutura) · [Executar](#executar-e-verificar) · [Contribuir](#contribuir) · [Autoria](#autoria) · [Licença](#licença)

## Comece por aqui

| Quero | Percurso |
| --- | --- |
| Iniciar ou revisar um projeto | [Guia de início](docs/iniciar-projeto.md) → [modelos](templates/projeto/README.md) |
| Fazer uma escolha de arquitetura | [Guia de decisões por cenário](arquitetura/README.md) → [ADR](templates/projeto/adr.md) |
| Definir o que desenhar | [Catálogo de diagramas](diagramas/README.md) → [diagramas preenchidos](exemplos/reservas-de-recursos/diagramas.md) |
| Estruturar issues e acompanhar trabalho | [Guia do Project](docs/github-project.md) → [modelos de issue](https://github.com/PHnsilva/base-de-projetos/issues/new/choose) |
| Buscar uma referência | [Referências](referencias/README.md) · [Livros](referencias/livros.md) · [Resenhas](resenhas/README.md) |

## Exemplo de ponta a ponta

Um laboratório comunitário quer substituir um formulário avulso por um portal de reservas. O [caso fictício](exemplos/reservas-de-recursos/README.md) acompanha o trabalho da descoberta à entrega e ao feedback.

1. **Entenda o problema.** Observe o fluxo atual, identifique partes interessadas e defina o resultado a melhorar.
2. **Delimite o MVP.** Escolha a primeira jornada de valor, explicite o que fica para depois e registre hipóteses.
3. **Elabore casos de uso e requisitos.** Inclua pré-condições, fluxo principal, alternativas, RF, RNF, regras e critérios de aceite.
4. **Identifique os RAS.** Priorize os requisitos arquiteturalmente significativos. No exemplo, concorrência, autorização e recuperação afetam fronteiras e persistência.
5. **Prototipe e reduza riscos.** Revise a jornada e seus erros. Faça uma investigação técnica quando um requisito decisivo estiver incerto.
6. **Desenhe apenas o necessário.** Escolha diagramas e compare alternativas. Registre no ADR decisões que têm consequência duradoura.
7. **Refine e organize o backlog.** Fatie incrementos, explicite dependências e critérios e selecione o próximo objetivo de entrega.
8. **Implemente e verifique.** Entregue em fatias pequenas, revise código e execute os testes de domínio, integração e jornada pertinentes.
9. **Demonstre, publique e observe.** Valide com quem usa, faça o piloto com condições de recuperação e acompanhe evidências.
10. **Aprenda e replaneje.** Use feedback e resultados para revisar requisitos, decisões, prioridade e o modo de trabalhar.

Consulte a [visão](exemplos/reservas-de-recursos/visao.md), os [perfis de acesso](exemplos/reservas-de-recursos/perfis-de-acesso.md) e os [wireframes](exemplos/reservas-de-recursos/wireframes.md) para ver os artefatos preenchidos. A ordem ajuda a entender o exemplo. Descoberta, refinamento, desenho e validação podem se repetir ou ocorrer em paralelo. Veja [como cada etapa aparece no caso](exemplos/reservas-de-recursos/README.md#percurso-iterativo).

## Estrutura

| Caminho | Conteúdo |
| --- | --- |
| [docs/](docs/) | Início, organização e acompanhamento |
| [templates/](templates/projeto/) | README, requisitos, decisão, diagramas e testes |
| [exemplos/](exemplos/) | Documentação, código e testes de um caso fictício |
| [arquitetura/](arquitetura/) | Abordagens de frontend, backend e serviços e seus trade-offs |
| [diagramas/](diagramas/) | Escolha de tipo, nível e público, com links para exemplos |
| [referencias/](referencias/) e [resenhas/](resenhas/) | Leituras, materiais didáticos e dez resenhas autorais |
| [tools/](tools/) | Verificação de links e exportação de documentação |

## Tecnologias

| Tecnologia | Uso no acervo |
| --- | --- |
| Markdown | Documentos, especificações e templates |
| Mermaid e SVG | Diagramas que acompanham os exemplos e wireframe de baixa fidelidade |
| Node.js | Ferramentas locais e testes do código de domínio |
| GitHub | Versionamento, revisão, issues e Project |

Os serviços sugeridos na arquitetura pertencem aos cenários fictícios. A [página do exemplo de reservas](exemplos/reservas-de-recursos/README.md) indica quais partes são executáveis.

## Executar e verificar

Para executar as ferramentas do acervo, use **Node.js 22.2 ou superior**. A consulta aos documentos funciona diretamente pelo GitHub.

```sh
git clone https://github.com/PHnsilva/base-de-projetos.git
cd base-de-projetos
node tools/documentacao/validar.mjs
node --test exemplos/reservas-de-recursos/codigo/regras.test.mjs
node tools/documentacao/exportar.mjs exemplos/reservas-de-recursos reservas.zip
```

O [guia das ferramentas](tools/documentacao/README.md) explica a exportação de Markdown, fontes Mermaid e PDF opcional. O ZIP de exemplo reúne os documentos e diagramas-fonte do recorte selecionado.

## Usar com um assistente de IA

Informe o escopo e o destino. Passe a URL pública, o caminho do clone ou os arquivos, de acordo com o acesso do assistente.

> Leia o AGENTS.md de PHnsilva/base-de-projetos e as instruções aplicáveis no projeto de destino. Selecione os modelos que respondem ao escopo abaixo. Adapte os artefatos, mostre a rastreabilidade e indique como verificar cada entrega.

Alguns ambientes leem `AGENTS.md` quando ele está no projeto ativo. Nos demais, informe o arquivo no pedido. As issues públicas e o [guia do Project](docs/github-project.md) servem de referência mesmo sem acesso ao quadro.

## Contribuir

Descreva o problema, para quem ele importa e como a mudança pode ser revisada. O [guia de contribuição](CONTRIBUTING.md) apresenta o fluxo e a validação. Acompanhe as [issues do acervo](https://github.com/PHnsilva/base-de-projetos/issues) e o [Project](https://github.com/users/PHnsilva/projects/13).

## Autoria

O acervo é mantido por [Pedro Henrique Silva Vargas](https://github.com/PHnsilva). O [guia de contribuição](CONTRIBUTING.md) explica como participar e preservar a autoria de fontes.

## Licença

© 2026 **Pedro Henrique Silva Vargas**. A documentação e os materiais autorais são disponibilizados sob **CC BY-NC 4.0**. O código autoral tem uma licença própria para uso não comercial. Uso comercial fora das permissões legais requer autorização do titular. Consulte o [arquivo de licença](LICENSE) para escopo e condições.
