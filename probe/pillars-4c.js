// Замеры 4c: сколько опор отдаёт текущее правило и что даёт «опоры под наклонной
// пластиной v2» (та же арифметика, что в bridgePillars, но без скипа ramp).
import { readFileSync } from 'node:fs';
import { CONFIG } from '../src/config.js';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { frameAt, rotatePoint, obbOf, obbHitsObb, obbHitsRect, frameOf } from '../src/geo2d.js';

const J = CONFIG.jsonMap;
const raw = JSON.parse(readFileSync(new URL('../src/levels/level-11.json', import.meta.url), 'utf8'));
const L = normalizeLevel(expandCity(raw));
const ground = L.map.ground.y;

for (const r of L.map.roads) {
  const counts = r.decks.map((d, i) => `${i}:${d.arc ? 'arc' : (d.ramp ? 'ramp' : 'flat')}${d.grounded ? 'g' : ''}`);
  console.log(r.id, r.type, 'decks', counts.join(' '), 'pillars', r.pillars.length, 'lamps', r.lamps.length);
}

const road = L.map.roads.find(r => r.id === 'rd_interchange');
const obstacles = [
  ...L.map.roads.filter(r => r.type === 'ground').flatMap(r => r.decks.map(d => ({ id: r.id, rect: d }))),
  ...L.map.buildings.map(b => ({ id: b.id, rect: obbOf(b.bounds, frameOf(b.bounds, b.rotation ?? 0)) })),
];
console.log('\n-- препятствия (наземные улицы и габариты зданий) --');
for (const o of obstacles) console.log(o.id, [o.rect.minX, o.rect.maxX, o.rect.minZ, o.rect.maxZ].join(' '), o.rect.obb ? 'obb' : '');

for (const [i, d] of road.decks.entries()) {
  if (d.arc || !d.ramp) continue;
  const frame = d.yaw ? frameAt(d.cx, d.cz, d.yaw) : null;
  const from = frame ? d.cx - d.length / 2 : d.minX;
  const to = frame ? d.cx + d.length / 2 : d.maxX;
  const cross = frame ? d.cz : (d.minZ + d.maxZ) / 2;
  const halfW = frame ? d.width / 2 : (d.maxZ - d.minZ) / 2;
  const inset = halfW - J.pillarSection / 2 - J.pillarEdge;
  const offs = inset >= J.pillarSection ? [-inset, inset] : [0];
  console.log(`\n-- съезд #${i}: from ${from} to ${to} halfW ${halfW} rows ${JSON.stringify(offs)} --`);
  for (let t = from + J.pillarSpacing / 2; t < to - 0.01; t += J.pillarSpacing) {
    for (const o of offs) {
      const p = frame ? rotatePoint(frame, t, cross + o) : { x: t, z: cross + o };
      const u = t;
      const top = d.topAtMin + (d.topAtMax - d.topAtMin) * (u - from) / (to - from);
      const bottom = top - J.deckThickness;
      const half = J.pillarSection / 2;
      const plan = frame
        ? obbOf({ minX: t - half, maxX: t + half, minZ: cross + o - half, maxZ: cross + o + half }, frame)
        : { minX: p.x - half, maxX: p.x + half, minZ: p.z - half, maxZ: p.z + half };
      const hit = frame
        ? obstacles.find(ob => obbHitsObb(ob.rect, plan, 0.05))
        : obstacles.find(ob => obbHitsRect(ob.rect, plan, 0.05));
      console.log(`u=${t} мир (${p.x.toFixed(2)}, ${p.z.toFixed(2)}) soffit ${bottom.toFixed(2)} h ${(bottom - ground).toFixed(2)} ${bottom - ground <= 1.0 ? 'низкий' : ''} ${hit ? 'В ' + hit.id : ''}`);
    }
  }
}
