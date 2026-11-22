# Ferramentas de documentação

Requer Node.js 22.2 ou superior. Os comandos abaixo usam o exemplo fictício da base e podem ser executados na raiz de um clone.

## Verificar links locais

```sh
node tools/documentacao/validar.mjs
```

O verificador percorre arquivos Markdown versionáveis. Ele confere os destinos relativos em links com sintaxe inline, incluindo imagens, e retorna erro se um arquivo ou diretório estiver ausente ou fora da raiz. Âncoras, URLs remotas e links por referência pedem conferência separada.

## Exportar Markdown e fontes Mermaid

```sh
node tools/documentacao/exportar.mjs exemplos/reservas-de-recursos relatorio-reservas.zip
```

O ZIP mantém os caminhos relativos à pasta de origem e extrai os blocos Mermaid como arquivos `.mmd`. As mesmas entradas geram os mesmos bytes na exportação padrão. O pacote inclui Markdown, fontes Mermaid extraídas e imagens SVG, PNG, JPEG, GIF, WebP e fontes PlantUML/Mermaid encontradas na pasta de origem. Imagens locais referenciadas precisam estar nessa pasta ou em subpastas. Links para documentos fora do recorte continuam dependentes do repositório. Use uma pasta contendo apenas os documentos e assets que serão distribuídos. O wireframe SVG de reservas acompanha sua página no pacote. Consulte a [documentação oficial do Mermaid CLI](https://github.com/mermaid-js/mermaid-cli) para renderizar os arquivos `.mmd` como SVG ou PNG quando o público precisar da imagem offline.

## Incluir PDF

Instale [Pandoc](https://pandoc.org/installing.html) e [Typst](https://typst.app/open-source/) e disponibilize ambos no PATH.

```sh
node tools/documentacao/exportar.mjs exemplos/reservas-de-recursos relatorio-reservas.zip --pdf
```

Essa opção gera um PDF para cada Markdown com Pandoc e Typst. Blocos Mermaid aparecem como código nos PDFs. Para incluir diagramas renderizados, gere as imagens e inclua as referências no Markdown antes da conversão, mantendo os assets disponíveis na pasta de origem. A aparência dos PDFs depende das fontes e versões instaladas. Confira visualmente a saída antes de distribuí-la.
