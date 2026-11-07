// Разбор одиночных узлов скелета — временный файл, в репозиторий не едет.
import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { SurfaceField } from '../src/surfaces.js';
import { CONFIG } from '../src/config.js';

const raw = JSON.parse(readFileSync('probe/open-2km.json', 'utf8'));
const map = normalizeLevel(expandCity(structuredClone(raw))).map;
const f = new SurfaceField(map);
f.collectData();

const targets = JSON.parse(process.env.SK_PTS ?? '[[157.474,-95.094,10.381],[157.475,-95.094,10.381]]');
for (const [x, z, y] of targets) {
  const sup = f.groundHeightAt(x, z, y);
  const supLow = f.groundHeightAt(x, z, -1e9);
  const ray = f.raySolid ? null : null;
  console.log(JSON.stringify({ p: [x, y, z], groundHeightAt: sup, fromBelow: supLow,
    blocked: f.isBlocked(x, z, CONFIG.radius, sup, CONFIG.eyeHeight) }));
  // чьи пластины вообще накрывают эту точку
  const decks = [];
  for (const road of map.roads) {
    for (const [di, d] of (road.decks ?? []).entries()) {
      if (x >= d.minX - 0.001 && x <= d.maxX + 0.001 && z >= d.minZ - 0.001 && z <= d.maxZ + 0.001) {
        decks.push(`${road.id}:${di}`);
      }
    }
  }
  console.log('  plates(AABB) covering:', decks.slice(0, 6));
}
// ребро между ними — где именно рвётся
const a = { x: targets[0][0], y: targets[0][2], z: targets[0][1] };
const b = { x: targets[1][0], y: targets[1][2], z: targets[1][1] };
console.log('edgeOk', f.edgeOk(a, b), 'clear', f.bodyClearLine(a, b), 'supported', f._edgeSupported(a, b));
for (const [p, q] of [[a, b], [b, a]]) {
  const dx = q.x - p.x, dz = q.z - p.z;
  const dist = Math.hypot(dx, dz);
  const steps = Math.max(1, Math.ceil(dist / CONFIG.jsonMap.navEdgeProbe));
  let feet = p.y;
  const trace = [];
  for (let s = 1; s <= steps; s++) {
    const t = s / steps;
    const y = f.groundHeightAt(p.x + dx * t, p.z + dz * t, Math.max(feet, p.y));
    trace.push([+t.toFixed(3), +y.toFixed(3), +(feet - y).toFixed(3)]);
    feet = Math.min(y, Math.max(p.y, q.y));
  }
  console.log(' walk', JSON.stringify(trace), 'endGap', +(q.y - feet).toFixed(3));
}
