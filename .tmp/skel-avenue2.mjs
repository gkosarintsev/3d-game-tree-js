/**
 * Проспекты в v2-форме (цепочка пластин с yaw) + перебор позиции западного
 * схода: HEAD схода всегда на y=0 (`ground.y`), а плаза западного угла лежит в
 * провале `bench_west`, поэтому от торца улицы его развод ноги и не пускает.
 * Временный файл.
 */
import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { validateLevel, LEVEL_SPEC_V2 } from '../tools/level-schema.mjs';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { SurfaceField } from '../src/surfaces.js';
import { skeletonOf } from '../tools/skeleton.mjs';
import { CONFIG } from '../src/config.js';
import { r3 } from '../src/geo2d.js';

const J = CONFIG.jsonMap;
const step = J.navStep * 4;
const raw0 = JSON.parse(readFileSync('probe/open-2km.json', 'utf8'));
delete raw0.roads;                     // база: фикстура без проспектов
raw0.waterways[0].ramps = [{ at: { x: -300, z: 120 }, width: 6 }, { at: { x: 300, z: 120 }, width: 6 }];

const norm = (raw) => normalizeLevel(expandCity(structuredClone(raw)));
const base = norm(raw0);
const probeField = new SurfaceField(base.map); probeField.collectData();

/** Торцы улиц районов + головы сходов — к ним приваривается проспект. */
const anchors = [];
for (const r of probeField.roads) {
  if (r.type !== 'ground' || !/^q\d/.test(r.id)) continue;
  const pts = (r.decks ?? []).flatMap(d => probeField.deckChain(d, step));
  if (!pts.length) continue;
  anchors.push(pts[0], pts[pts.length - 1]);
}
for (const d of probeField.descents) {
  const pts = probeField.descentChain(d, step);
  if (pts) anchors.push(pts.reduce((u, v) => (v.y > u.y ? v : u), pts[0]));
}
const near = (x, z, tol = 8) => anchors
  .filter(a => Math.hypot(a.x - x, a.z - z) <= tol)
  .sort((u, v) => Math.hypot(u.x - x, u.z - z) - Math.hypot(v.x - x, v.z - z))[0];

/** Цепочка пластин: i-я пластина от P[i] до P[i+1], yaw — её собственная ось. */
function plates(name, width, ax, az, bx, bz, every = 24) {
  const A = near(ax, az), B = near(bx, bz);
  if (!A || !B) throw new Error(`${name}: анкер не найден`);
  const run = Math.hypot(B.x - A.x, B.z - A.z);
  const k = Math.max(1, Math.round(run / every));
  const pts = [A];
  for (let i = 1; i < k; i++) {
    const t = i / k;
    const x = A.x + (B.x - A.x) * t, z = A.z + (B.z - A.z) * t;
    pts.push({ x, y: probeField.floorAt(x, z) + J.streetRise, z });
  }
  pts.push(B);
  const elements = [];
  let maxGrade = 0;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], q = pts[i];
    const len = Math.hypot(q.x - p.x, q.z - p.z);
    const yaw = Math.atan2(q.z - p.z, q.x - p.x) * 180 / Math.PI;
    maxGrade = Math.max(maxGrade, Math.abs(q.y - p.y) / len);
    elements.push({
      plate: {
        x: r3((p.x + q.x) / 2), z: r3((p.z + q.z) / 2), length: r3(len), width,
        yaw: r3(yaw), y: r3(p.y), rise: r3(q.y - p.y),
      },
    });
  }
  console.log(`-- ${name}: ${r3(A.x)},${r3(A.z)} y=${A.y.toFixed(3)} → ${r3(B.x)},${r3(B.z)} y=${B.y.toFixed(3)}, ${elements.length} пластин, худший уклон ${maxGrade.toFixed(3)}`);
  return { id: name, type: 'ground', width, elements };
}

const roads = [
  plates('rd_plaza_q0_q1', 10, -340, -487, -237.94, -479.5),
  plates('rd_plaza_q3_q4', 10, -341.9, -66.2, -238, -51),
];

/** Сход1 в кандидате X + проспекты: сварка головы с торцом улицы без нового полотна. */
for (const x of [-300, -260, -220, -180, -140, -100, -60, 20, 100, 180]) {
  const raw = structuredClone(raw0);
  raw.roads = roads;
  raw.waterways[0].ramps[0].at = { x, z: 120 };
  const { errors } = validateLevel(expandCity(structuredClone(raw)), LEVEL_SPEC_V2);
  const m = norm(raw).map;
  const sk = skeletonOf(m);
  console.log(`сход1 x=${x}: компонент ${sk.meta.components.after}, ошибок ${errors.length}`);
}
console.log('\nJSON проспектов:\n' + JSON.stringify(roads));
