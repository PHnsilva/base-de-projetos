import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";

const root = resolve(process.argv[2] ?? ".");
const ignored = new Set([".git", ".venv", "node_modules"]);
const inlineLink = /!?\[[^\]\r\n]*\]\(\s*(?:<([^>\r\n]+)>|([^\s)]+))[^)\r\n]*\)/g;
const external = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

function inspectLinks(file) {
  const markdown = readFileSync(file, "utf8").replace(/^ {0,3}(\x60{3,}|~{3,}).*[\r\n]+[\s\S]*?^ {0,3}\1\s*$/gm, "");
  let errors = 0;
  for (const [, angleLink, plainLink] of markdown.matchAll(inlineLink)) {
    const link = angleLink ?? plainLink;
    if (external.test(link)) continue;

    const target = resolve(dirname(file), decodeURI(link.split(/[?#]/, 1)[0]));
    const destination = relative(root, target);
    if (!destination.split(/[\\/]/).includes("..") && !isAbsolute(destination) && existsSync(target)) continue;

    console.error(relative(root, file) + " → " + link);
    errors += 1;
  }
  return errors;
}

function inspectDirectory(directory) {
  let errors = 0;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) errors += inspectDirectory(path);
    if (entry.isFile() && /\.md$/i.test(entry.name)) errors += inspectLinks(path);
  }
  return errors;
}

const errors = inspectDirectory(root);
if (errors) {
  console.error(errors + " link(s) local(is) inválido(s).");
  process.exitCode = 1;
} else {
  console.log("Links locais válidos.");
}
