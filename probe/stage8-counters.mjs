/* Счётчики генератора главы 12: почему кварталы получились редкими. Читает бриф,
   разворачивает city и печатает отказы плюс итоговые планы улиц/домов по районам. */
import fs from 'node:fs';
import { expandCity } from '../tools/city.js';

const raw = JSON.parse(fs.readFileSync(process.argv[2] ?? 'src/levels/level-12.json', 'utf8'));
const stats = {};
const city = expandCity(raw, stats);
console.log('lot/building счётчики:', JSON.stringify(stats, null, 1));
const by = (list) => list.reduce((a, o) => {
  const k = String(o.district ?? (o.id.match(/^[a-z]+/) || ['?'])[0]);
  a[k] = (a[k] || 0) + 1; return a;
}, {});
console.log('зданий по районам:', JSON.stringify(by(city.buildings ?? [])));
console.log('улиц по районам:', JSON.stringify(by(city.roads ?? [])));
