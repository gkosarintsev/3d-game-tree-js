/**
 * Измеритель R2: мера четырёх форм пробы тела на одном множестве рёбер графа.
 *
 * Запуск: открыть 3d-game.html, в консоли:
 *   const m = await import('/probe/rapier-r2-measure.mjs');
 *   await m.runR2Measure(LEVEL_12);   // или LEVEL_13
 *
 * Выводит для каждой формы: цена пробы (мкс/ребро) и число потерянных рёбер
 * относительно режима `own`. Выбранная форма — пояс (Capsule(height/2-0.05-radius,
 * radius), центр на feet+height/2).
 */
import { JsonMap } from '../src/json-map.js';
import * as PhysicsIndex from '../src/physics-index.js';
import { CONFIG } from '../src/config.js';

const RADIUS = CONFIG.radius;      // 0.45
const HEIGHT = CONFIG.eyeHeight;   // 1.7
const STEP = CONFIG.nav.bodyProbe; // шаг своей пробы (0.5 м)

/** Своя проба: марш isBlocked шагом STEP, без końцовых точек (как в bodyClearLine). */
function ownProbe(map, a, b) {
  const dx = b.x - a.x, dz = b.z - a.z;
  const feet = Math.max(a.y, b.y);
  const steps = Math.max(2, Math.ceil(Math.hypot(dx, dz) / STEP));
  for (let s = 1; s < steps; s++) {
    const t = s / steps;
    if (map.isBlocked(a.x + dx * t, a.z + dz * t, RADIUS, feet, HEIGHT)) return false;
  }
  return true;
}

/** Пояс-капсула через Rapier (выбранная форма R2). */
function beltSweep(map, a, b) {
  return PhysicsIndex.bodySweep(a, b, RADIUS, HEIGHT);
}

/** Капсула прошлой меры: Capsule((height-radius)/2, radius), центр в a.y (ниже стоп). */
function oldCapsule(map, a, b) {
  if (!PhysicsIndex.isReady()) return true;
  const hh = (HEIGHT - RADIUS) / 2;
  const shape = PhysicsIndex.RAPIER ? PhysicsIndex.RAPIER.ColliderDesc.capsule(hh, RADIUS) : null;
  const cx = (a.x + b.x) / 2;
  const cy = a.y;
  const cz = (a.z + b.z) / 2;
  const vel = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
  const hit = PhysicsIndex.RAPIER.world.castShape(
    { translation: { x: cx, y: cy, z: cz }, rotation: { x: 0, y: 0, z: 0, w: 1 } },
    vel, shape, 0, 1,
  );
  return hit === null;
}

/** Шар радиуса radius в середине отрезка (упрощённая форма). */
function sphereProbe(map, a, b) {
  if (!PhysicsIndex.isReady()) return true;
  const shape = PhysicsIndex.RAPIER.ColliderDesc.ball(RADIUS);
  const cx = (a.x + b.x) / 2;
  const cy = (a.y + b.y) / 2;
  const cz = (a.z + b.z) / 2;
  const vel = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
  const hit = PhysicsIndex.RAPIER.world.castShape(
    { translation: { x: cx, y: cy, z: cz }, rotation: { x: 0, y: 0, z: 0, w: 1 } },
    vel, shape, 0, 1,
  );
  return hit === null;
}

export async function runR2Measure(level) {
  await PhysicsIndex.init();
  const map = new JsonMap(level.map);
  const edges = collectEdges(map.nav);
  console.log(`R2: рёбер графа=${edges.length}, уровень ${level.name ?? 'без названия'}`);

  const forms = [
    { name: 'своя проба (isBlocked шаг)', fn: ownProbe },
    { name: 'пояс-капсула (выбранная)', fn: beltSweep },
    { name: 'капсула прошлой меры', fn: oldCapsule },
    { name: 'шар', fn: sphereProbe },
  ];

  const base = new Set();
  for (const e of edges) if (ownProbe(map, e.a, e.b)) base.add(e.key);

  for (const form of forms) {
    const t0 = performance.now();
    let lost = 0;
    for (const e of edges) {
      if (!form.fn(map, e.a, e.b)) lost += 1;
    }
    const ms = performance.now() - t0;
    const usPerEdge = (ms * 1000) / edges.length;
    const lostPct = ((lost / base.size) * 100).toFixed(3);
    console.log(
      `R2 ${form.name}: ${usPerEdge.toFixed(3)} мкс/ребро, потеряно ${lost}/${base.size} (${lostPct} %)`,
    );
  }
  PhysicsIndex.dispose();
}

function collectEdges(nav) {
  const edges = [];
  const seen = new Set();
  for (let i = 0; i < nav.pos.length; i++) {
    for (const j of nav.adj[i] ?? []) {
      if (j <= i) continue;
      const key = `${i}:${j}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const pi = nav.pos[i], pj = nav.pos[j];
      edges.push({ key, a: { x: pi.x, y: pi.y, z: pi.z }, b: { x: pj.x, y: pj.y, z: pj.z } });
    }
  }
  return edges;
}
