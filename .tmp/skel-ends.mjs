// Торцы улиц районов у межквартальных плаз. Временный файл.
import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { SurfaceField } from '../src/surfaces.js';
import { CONFIG } from '../src/config.js';

const raw = JSON.parse(readFileSync(process.env.F || 'probe/open-2km.json', 'utf8'));
const map = normalizeLevel(expandCity(structuredClone(raw))).map;
const field = new SurfaceField(map); field.collectData();
const step = CONFIG.jsonMap.navStep * 4;
const f = (v) => Math.round(v * 100) / 100;
const fy = (v) => Math.round(v * 1000) / 1000;

// торцы каждой дороги: первая и последняя точка первой и последней пластины
const ends = [];
for (const r of field.roads) {
  if (r.type !== 'ground' || !/^q\d/.test(r.id)) continue;
  const chains = (r.decks ?? []).flatMap(d => field.deckChain(d, step));
  if (!chains.length) continue;
  ends.push({ id: r.id, a: chains[0], b: chains[chains.length - 1] });
}
const band = (v, lo, hi) => v >= lo && v <= hi;
for (const [name, test] of [
  ['плаза x -340..-240 (между колонками 1 и 2)', p => band(p.x, -360, -220)],
  ['плаза x 60..160 (между колонками 2 и 3)', p => band(p.x, 40, 180)],
  ['плаза z -340..-240', p => band(p.z, -360, -220)],
  ['плаза z 60..220', p => band(p.z, 40, 240)],
]) {
  const sel = ends.flatMap(e => [e.a, e.b]).filter(test);
  const byLine = new Map();
  for (const p of sel) {
    const k = `${Math.round(p.x / 4)}:${Math.round(p.z / 4)}`;
    if (!byLine.has(k)) byLine.set(k, p);
  }
  const list = [...byLine.values()].sort((u, v) => u.x - v.x || u.z - v.z);
  console.log(`\n== ${name}: ${sel.length} торцов, ${list.length} позиций`);
  for (const p of list) console.log(`   x=${fy(p.x)} z=${fy(p.z)} y=${fy(p.y)} поле=${fy(field.floorAt(p.x, p.z))}`);
}
