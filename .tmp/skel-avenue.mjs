/**
 * Подбор авторских проспектов через межквартальные плазы: конец обязан лечь
 * ровно на торец улицы района (сварка нулевой длины честнее «поиска ближайшего»),
 * середина — идти по собранному полю. Временный файл.
 */
import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { SurfaceField } from '../src/surfaces.js';
import { skeletonOf } from '../tools/skeleton.mjs';
import { CONFIG } from '../src/config.js';
import { r3 } from '../src/geo2d.js';

const J = CONFIG.jsonMap;
const step = J.navStep * 4;
const raw0 = JSON.parse(readFileSync('probe/open-2km.json', 'utf8'));

/** Торцы улиц районов + верх сходов: то, к чему приваривается проспект. */
function anchors(map) {
  const field = new SurfaceField(map); field.collectData();
  const list = [];
  for (const r of field.roads) {
    if (r.type !== 'ground' || !/^q\d/.test(r.id)) continue;
    const pts = (r.decks ?? []).flatMap(d => field.deckChain(d, step));
    if (!pts.length) continue;
    list.push({ id: r.id, end: 'a', p: pts[0] });
    list.push({ id: r.id, end: 'b', p: pts[pts.length - 1] });
  }
  for (const d of field.descents) {
    const pts = field.descentChain(d, step);
    if (!pts) continue;
    const top = pts.reduce((u, v) => (v.y > u.y ? v : u), pts[0]);
    list.push({ id: d.id, end: 'top', p: top });
  }
  return { field, list };
}

const near = (list, x, z, tol = 8) => list
  .filter(a => Math.hypot(a.p.x - x, a.p.z - z) <= tol)
  .sort((u, v) => Math.hypot(u.p.x - x, u.p.z - z) - Math.hypot(v.p.x - x, v.p.z - z))[0];

/** Один проспект: точные концы с анкеров, середина — по полю каждые `every` метров. */
function avenue(anchors, name, width, ax, az, bx, bz, every = 24, tol = 8) {
  const field = anchors.field;
  const A = near(anchors.list, ax, az, tol), B = near(anchors.list, bx, bz, tol);
  if (!A || !B) throw new Error(`${name}: анкер не найден (${ax},${az}) / (${bx},${bz})`);
  const run = Math.hypot(B.p.x - A.p.x, B.p.z - A.p.z);
  const k = Math.max(1, Math.round(run / every));
  const pts = [{ x: r3(A.p.x), y: r3(A.p.y), z: r3(A.p.z) }];
  for (let i = 1; i < k; i++) {
    const t = i / k;
    const x = A.p.x + (B.p.x - A.p.x) * t, z = A.p.z + (B.p.z - A.p.z) * t;
    pts.push({ x: r3(x), y: r3(field.floorAt(x, z) + J.streetRise), z: r3(z) });
  }
  pts.push({ x: r3(B.p.x), y: r3(B.p.y), z: r3(B.p.z) });
  let maxGrade = 0;
  for (let i = 1; i < pts.length; i++) {
    maxGrade = Math.max(maxGrade, Math.abs(pts[i].y - pts[i - 1].y)
      / Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z));
  }
  console.log(`-- ${name}: ${A.id}[${A.end}] y=${A.p.y.toFixed(3)} → ${B.id}[${B.end}] y=${B.p.y.toFixed(3)}, прогон ${run.toFixed(1)} м, ${pts.length} точек, худший уклон ${maxGrade.toFixed(3)} (предел ${J.maxSlope})`);
  return { id: name, type: 'ground', width, points: pts };
}

const SPECS = [
  ['rd_plaza_q0_q1', 10, -340, -487, -237.94, -479.5],
  ['rd_plaza_q3_q4', 10, -341.9, -66.2, -238, -51],
  ['rd_quay_w', 8, -300, 140.7, -193.4, 193.7],
];

const base = normalizeLevel(expandCity(structuredClone(raw0))).map;
const probe = anchors(base);
const roads = SPECS.map(([id, width, ax, az, bx, bz]) => avenue(probe, id, width, ax, az, bx, bz));

// контрольный прогон: тот же бриф с добавленными проспектами
const raw1 = structuredClone(raw0);
raw1.roads = roads;
const n1 = normalizeLevel(expandCity(structuredClone(raw1)));
const map1 = n1.map;
const sk1 = skeletonOf(map1);
console.log('\nкомпоненты после правки:', JSON.stringify(sk1.meta.components), 'missing:', sk1.meta.covered.missingCount);
for (const isl of sk1.meta.islands) console.log(' ', JSON.stringify({ size: isl.size, box: isl.box, top: isl.top, nearest: isl.nearest }));
console.log('предупреждения:', n1.warnings.length, n1.warnings.slice(0, 6).join(' | '));
console.log('\nJSON для брифа:\n' + JSON.stringify(roads, null, 2));
