// Диагноз оставшихся компонент: координаты торцов, отметки, поле под ними. Временный файл.
import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { skeletonOf } from '../tools/skeleton.mjs';
import { SurfaceField } from '../src/surfaces.js';
import { CONFIG } from '../src/config.js';

const raw = JSON.parse(readFileSync(process.env.F || 'probe/open-2km.json', 'utf8'));
const map = normalizeLevel(expandCity(structuredClone(raw))).map;
const field = new SurfaceField(map); field.collectData();
const sk = skeletonOf(map, { field });
const f = (v) => Math.round(v * 1000) / 1000;

// состав компонент: узлы из meta.islands не несут индексов, поэтому соберём по ключам заново
console.log('after comps:', JSON.stringify(sk.meta.components));
for (const isl of sk.meta.islands) {
  console.log(JSON.stringify({ size: isl.size, box: isl.box, y: isl.y, top: isl.top, nearest: isl.nearest }));
}

// ближайшие пары между компонентами с числами
const groups = sk.meta.islands.map(() => null);
console.log('--- поле под торцами');
const keyOf = {
  'k:d:q0_s_h7_7:0:2': null, 'k:d:q1_s_v0_7:0:2': null,
  'k:d:q4_s_h6_7:0:2': null, 'k:d:ring_ring:13:3': null,
  'k:f:cut:сход1:0': null, 'k:d:q4_s_v0_7:0:2': null,
};
// узлы лежат в sk.nodes в порядке добавления, ключи — только внутри модуля; восстанавливаем по тем же цепочкам
const roadById = new Map(field.roads.map(r => [r.id, r]));
function nodeByKey(key) {
  const p = key.split(':');
  if (p[1] === 'd') {
    const road = roadById.get(p[2]);
    const deck = road.decks[Number(p[3])];
    const pts = field.deckChain(deck, CONFIG.jsonMap.navStep * 4);
    return { pt: pts[Number(p[4])], road: p[2], type: road.type };
  }
  if (p[1] === 'f') {
    const id = key.slice('k:f:'.length).split(':').slice(0, 2).join(':');
    const d = field.descents.find(x => x.id === id);
    const pts = field.descentChain(d, CONFIG.jsonMap.navStep * 4);
    return { pt: pts[Number(p[p.length - 1])], desc: id };
  }
  return null;
}
for (const key of Object.keys(keyOf)) {
  const n = nodeByKey(key);
  if (!n) { console.log(key, 'НЕ НАЙДЕН'); continue; }
  const { pt } = n;
  console.log(JSON.stringify({ key, at: [f(pt.x), f(pt.y), f(pt.z)], field: f(map.relief.fieldAt(pt.x, pt.z)), ...n }));
}
