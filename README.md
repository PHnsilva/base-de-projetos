# Base de Projetos

Acervo brasileiro de engenharia de software para transformar uma ideia em escopo, decisões de arquitetura e entregas verificáveis. Reúne modelos, um projeto fictício com código e diagramas, ferramentas de documentação e leituras para estudantes, equipes e assistentes de IA.

[Começar](#comece-por-aqui) · [Exemplo](#exemplo-de-ponta-a-ponta) · [Estrutura](#estrutura) · [Executar](#executar-e-verificar) · [Contribuir](#contribuir) · [Licença](#licença)

## Comece por aqui

| Quero | Percurso |
| --- | --- |
| Iniciar ou revisar um projeto | [Guia de início](docs/iniciar-projeto.md) → [modelos](templates/projeto/README.md) |
| Fazer uma escolha de arquitetura | [Frontend, backend e serviços](arquitetura/README.md) → [ADR](templates/projeto/adr.md) |
| Definir o que desenhar | [Catálogo de diagramas](diagramas/README.md) → [diagramas preenchidos](exemplos/reservas-de-recursos/diagramas.md) |
| Estruturar issues e acompanhar trabalho | [Guia do Project](docs/github-project.md) → [modelos de issue](https://github.com/PHnsilva/base-de-projetos/issues/new/choose) |
| Buscar uma referência | [Curadoria do Aramuni](referencias/aramuni.md) · [Livros](referencias/livros.md) · [Resenhas](resenhas/README.md) |

## Exemplo de ponta a ponta

Um laboratório comunitário precisa receber pedidos de reserva, permitir que responsáveis decidam cada pedido e evitar duas confirmações sobrepostas. Comece pelo [caso fictício de reservas](exemplos/reservas-de-recursos/README.md) e siga a cadeia:

1. [Caso de uso e requisito](exemplos/reservas-de-recursos/especificacao.md) descrevem o que deve acontecer.
2. [Questão de arquitetura](exemplos/reservas-de-recursos/adr-001-confirmacao.md) registra por que a confirmação precisa de atomicidade.
3. [Diagramas](exemplos/reservas-de-recursos/diagramas.md) mostram contexto, comportamento, dados e implantação.
4. [Issue de concorrência](https://github.com/PHnsilva/base-de-projetos/issues/4) transforma o requisito em critérios de aceite e roteiro de integração.
5. [Código executável](exemplos/reservas-de-recursos/codigo/README.md) verifica as regras de domínio. A corrida entre transações pertence a uma implementação de persistência e consta no plano de testes.

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

## Licença

© 2026 **Pedro Henrique Silva Vargas**. A documentação e os materiais autorais são disponibilizados sob **CC BY-NC 4.0**. O código autoral tem uma licença própria para uso não comercial. Uso comercial fora das permissões legais requer autorização do titular. Consulte o [arquivo de licença](LICENSE) para escopo e condições.
