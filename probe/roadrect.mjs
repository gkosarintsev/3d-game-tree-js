// одноразовый зонд: печатает rect улицы, на который валлидатор жалуется «дом стоит в улице»
import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { roadRectsOf } from '../tools/level-schema.mjs';

const raw = JSON.parse(readFileSync(new URL('../src/levels/level-10.json', import.meta.url), 'utf8'));
const ex = expandCity(structuredClone(raw));
const b = ex.buildings.find(x => x.id === 'corp_podium');
for (const r of ex.roads.filter(x => /^ncc_s_v5/.test(x.id))) {
  console.log(r.id, JSON.stringify(roadRectsOf(r).map(x => x.rect)), '→', JSON.stringify(b.footprint));
}
