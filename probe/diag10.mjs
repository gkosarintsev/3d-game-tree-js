import { readFileSync } from 'node:fs';
import { validateLevel, LEVEL_SPEC } from '../tools/level-schema.mjs';
import { expandCity } from '../tools/city.js';
const raw = expandCity(JSON.parse(readFileSync('src/levels/level-10.json', 'utf8')));
for (const b of raw.buildings.slice(0, 2)) console.log('id', b.id, JSON.stringify(b.footprint), 'baseY', b.baseY);
const { errors } = validateLevel(raw, LEVEL_SPEC);
console.log('errors', errors.length);
console.log(errors.slice(0, 2).join('\n'));
