// Разбор шва кольца в фикстуре — временный файл, в репозиторий не едет.
import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { SurfaceField } from '../src/surfaces.js';

const raw = JSON.parse(readFileSync('probe/open-2km.json', 'utf8'));
const map = normalizeLevel(expandCity(structuredClone(raw))).map;
const f = new SurfaceField(map);
f.collectData();

const road = map.roads.find(r => String(r.id).startsWith('ring'));
console.log('road', road.id, road.type, 'decks', road.decks.length);
for (const di of [16, 17, 18, 19]) {
  const d = road.decks[di];
  if (!d) continue;
  const chain = f.deckChain(d, 24);
  const ends = [chain[0], chain[chain.length - 1]];
  console.log(JSON.stringify({
    di, arc: !!d.arc, R: d.R, a0: d.a0, span: d.span, cx: d.cx, cz: d.cz,
    yaw: d.yaw, length: d.length, width: d.width, y0: d.y0, y1: d.y1,
    topMin: d.topAtMin, topMax: d.topAtMax,
    box: [d.minX, d.minZ, d.maxX, d.maxZ].map(v => +v.toFixed(3)),
    ends: ends.map(p => [p.x, p.y, p.z].map(v => +v.toFixed(4))),
    supportAtEnds: ends.map(p => +f.groundHeightAt(p.x, p.z, p.y).toFixed(3)),
  }));
}
