import { readFileSync } from 'node:fs';
import { generateCatalog } from '../tools/build-level.mjs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';

const raw = JSON.parse(readFileSync('probe/open-2km.json', 'utf8'));
const area = (raw.ground.size / 1000) ** 2;

const norm = normalizeLevel(expandCity(structuredClone(raw))).map;
const normCompact = JSON.stringify(norm).length;

const open = structuredClone(raw);
open.kind = 'open';
open.stream = { chunk: 350, keep: 1, aheadMin: 300, aheadMax: 900, budgetMs: 8 };
const cat = generateCatalog(open, 'probe/open-2km.json');

console.log(`площадь, км2        ${area.toFixed(2)}`);
console.log(`бриф, символы       ${JSON.stringify(raw).length}`);
console.log(`бриф, байт на диске ${readFileSync('probe/open-2km.json', 'utf8').length}`);
console.log(`норм. compact       ${normCompact} Б = ${(normCompact / 1e6).toFixed(2)} МБ, ${(normCompact / area / 1e6).toFixed(2)} МБ/км2`);
console.log(`норм. indent2       ${JSON.stringify(norm, null, 2).length} Б = ${(JSON.stringify(norm, null, 2).length / 1e6).toFixed(2)} МБ`);
console.log(`ключи cat           ${Object.keys(cat).join(',')}`);
console.log(`worldMap compact    ${JSON.stringify(cat.worldMap).length} Б`);
console.log(`worldMap indent2    ${JSON.stringify(cat.worldMap, null, 2).length} Б`);
for (const [k, v] of Object.entries(cat)) {
  if (Array.isArray(v)) console.log(`  ${k}: массив из ${v.length}`);
  else if (typeof v === 'string') console.log(`  ${k}: строка ${v.length} Б`);
}
