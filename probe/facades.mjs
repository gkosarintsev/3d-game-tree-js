// одноразовый зонд: для каждого авторского дома — какие наземные улицы проходят у фасада
import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeRoad } from '../tools/normalize-level.mjs';

const raw = JSON.parse(readFileSync(new URL('../src/levels/level-10.json', import.meta.url), 'utf8'));
const ex = expandCity(structuredClone(raw));
const ground = { y: ex.ground.y, size: ex.ground.size };
const decks = [];
for (const r of ex.roads.filter(r => r.type === 'ground')) {
  for (const d of normalizeRoad(r, ground).decks) decks.push({ id: r.id, ...d });
}
const authored = new Set(raw.buildings.map(b => b.id));
for (const b of ex.buildings.filter(b => authored.has(b.id))) {
  const fp = b.footprint.map(p => [p.x, p.z]);
  const xs = fp.map(p => p[0]), zs = fp.map(p => p[1]);
  const bounds = { minX: Math.min(...xs), maxX: Math.max(...xs), minZ: Math.min(...zs), maxZ: Math.max(...zs) };
  const near = decks.filter(d => d.minX < bounds.maxX + 2 && d.maxX > bounds.minX - 2
    && d.minZ < bounds.maxZ + 2 && d.maxZ > bounds.minZ - 2);
  console.log(b.id, JSON.stringify(bounds), '→', near.map(d => `${d.id}[${d.minX}..${d.maxX} × ${d.minZ}..${d.maxZ}]`).join(' ') || 'НЕТ');
}
