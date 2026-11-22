import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { crc32 } from "node:zlib";

const mermaidBlock = /^ {0,3}(\x60{3,}|~{3,})mermaid[ \t]*\r?\n([\s\S]*?)^ {0,3}\1[ \t]*\r?$/gm;
const maxZipSize = 0xffffffff;
const utf8Names = 0x0800;
const dosDate = 33;

const assetExtension = /\.(?:svg|png|jpe?g|gif|webp|puml|mmd)$/i;

function collectAssets(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
      return collectAssets(path);
    }
    return entry.isFile() && assetExtension.test(entry.name) ? [path] : [];
  });
}

function checkImagePaths(file, source) {
  const text = readFileSync(file, "utf8");
  for (const [, angle, plain] of text.matchAll(/!\[[^\]]*\]\(\s*(?:<([^>]+)>|([^\s)]+))[^)]*\)/g)) {
    const url = angle ?? plain;
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url)) continue;
    const target = resolve(dirname(file), decodeURI(url.split(/[?#]/, 1)[0]));
    const path = relative(source, target);
    if (isAbsolute(path) || path.split(/[\\/]/).includes("..") || !assetExtension.test(target)) {
      throw new Error("Imagem fora do pacote ou formato sem suporte: " + url);
    }
    readFileSync(target);
  }
}

function collectMarkdown(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
      return collectMarkdown(path);
    }
    return entry.isFile() && /\.md$/i.test(entry.name) ? [path] : [];
  });
}

function makeZip(entries) {
  const localParts = [];
  const directoryParts = [];
  let offset = 0;
  let directorySize = 0;

  if (entries.size > 0xfffe) throw new Error("Quantidade de entradas acima do limite ZIP.");

  for (const name of [...entries.keys()].sort()) {
    const file = entries.get(name);
    const zipName = Buffer.from(name);
    const checksum = crc32(file);
    const localHeader = Buffer.alloc(30);
    const directoryHeader = Buffer.alloc(46);

    if (zipName.length > 0xffff || file.length >= maxZipSize || offset >= maxZipSize) {
      throw new Error("Entrada acima do limite ZIP.");
    }

    // Registros ZIP com método 0, sem compactação. O carimbo fixo permite reproduzir o arquivo.
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(utf8Names, 6);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(file.length, 18);
    localHeader.writeUInt32LE(file.length, 22);
    localHeader.writeUInt16LE(zipName.length, 26);

    directoryHeader.writeUInt32LE(0x02014b50, 0);
    directoryHeader.writeUInt16LE(20, 4);
    localHeader.copy(directoryHeader, 6, 4, 28);
    directoryHeader.writeUInt32LE(offset, 42);

    localParts.push(localHeader, zipName, file);
    directoryParts.push(directoryHeader, zipName);
    offset += localHeader.length + zipName.length + file.length;
    directorySize += directoryHeader.length + zipName.length;
  }

  if (offset + directorySize + 22 >= maxZipSize) throw new Error("Tamanho acima do limite ZIP.");

  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.size, 8);
  end.writeUInt16LE(entries.size, 10);
  end.writeUInt32LE(directorySize, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...localParts, ...directoryParts, end]);
}

function renderPdf(file) {
  const temporary = mkdtempSync(join(tmpdir(), "documentacao-"));
  const output = join(temporary, "documento.pdf");
  try {
    execFileSync("pandoc", [file, "--pdf-engine=typst", "-o", output], {
      cwd: dirname(file),
      stdio: "inherit",
    });
    return readFileSync(output);
  } finally {
    rmSync(temporary, { recursive: true });
  }
}

function exportDocs(source, output, exportPdf) {
  const files = collectMarkdown(source);
  if (!files.length) throw new Error("Nenhum arquivo Markdown encontrado na origem.");
  const entries = new Map();

  function add(name, content) {
    if (entries.has(name)) throw new Error("Nome de saída duplicado: " + name);
    entries.set(name, content);
  }

  for (const file of files) {
    checkImagePaths(file, source);
    const name = relative(source, file).split(sep).join("/");
    const stem = name.replace(/\.md$/i, "");
    const content = readFileSync(file);
    add(name, content);

    const diagrams = content.toString("utf8").matchAll(mermaidBlock);
    let number = 0;
    for (const [, , diagram] of diagrams) {
      number += 1;
      add(stem + "-" + number + ".mmd", Buffer.from(diagram));
    }

    if (exportPdf) add(stem + ".pdf", renderPdf(file));
  }

  for (const file of collectAssets(source)) {
    add(relative(source, file).split(sep).join("/"), readFileSync(file));
  }

  writeFileSync(output, makeZip(entries), { flag: "wx" });
  console.log("Gerado " + output + " com " + entries.size + " arquivos.");
}

const [source, output, flag, ...extra] = process.argv.slice(2);
try {
  if (!source || !output?.toLowerCase().endsWith(".zip") || (flag && flag !== "--pdf") || extra.length) {
    throw new Error("Uso: node tools/documentacao/exportar.mjs pasta-origem saida.zip [--pdf]");
  }
  exportDocs(resolve(source), resolve(output), flag === "--pdf");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
