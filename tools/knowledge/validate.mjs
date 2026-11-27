import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { localInventory } from './refine.mjs';
const inventory = localInventory(resolve(fileURLToPath(new URL('../..', import.meta.url))));
console.log(`${inventory.records.size} catalog records valid.`);
