import { readFileSync } from 'node:fs';
import { normalizeBuilding } from '../tools/normalize-level.mjs';
import { expandCity } from '../tools/city.js';
const raw = expandCity(JSON.parse(readFileSync('src/levels/level-10.json', 'utf8')));
const b = raw.buildings[0];
try { normalizeBuilding(b, { y: 0, size: 300 }, []); console.log('ok без land'); }
catch (e) { console.log('ПАДЕНИЕ:', e.message); }
