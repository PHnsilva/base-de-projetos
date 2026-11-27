import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { localInventory } from './refine.mjs';
import { stable } from './core.mjs';
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== '--topic')) throw new Error('Usage: node tools/knowledge/catalog.mjs [--topic architecture]');
const inventory = localInventory(resolve(fileURLToPath(new URL('../..', import.meta.url))));
console.log(stable([...inventory.records.values()].filter(r => !args.length || r.topics.includes(args[1])).sort((a, b) => a.doi.localeCompare(b.doi))));
