/**
 * Автотест индекса твёрдости Rapier (Часть II плана открытого мира, R1–R3).
 *
 * Замер R2: мера четырёх форм пробы тела на одном множестве рёбер графа главы 12.
 * Запуск: через `node tools/ci-browser.mjs` (браузер, где есть Rapier по CDN).
 */
import * as THREE from 'three';
import { JsonMap } from '../src/json-map.js';
import * as PhysicsIndex from '../src/physics-index.js';
import { CONFIG } from '../src/config.js';
import { LEVEL_12 } from '../src/levels/level-12.js';

const RADIUS = CONFIG.radius;
const HEIGHT = CONFIG.eyeHeight;
const STEP = CONFIG.nav.bodyProbe;

/** Своя проба: марш isBlocked шагом STEP (без końцовых точек, как в bodyClearLine). */
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

/** Пояс-капсула (выбранная форма R2): Capsule(height/2-0.05-radius, radius), центр feet+height/2. */
function beltSweep(a, b) {
  return PhysicsIndex.bodySweep(a, b, RADIUS, HEIGHT);
}

function castShapeSafe(world, RAPIER, pos, rot, vel, shape, maxToi) {
  try {
    return world.castShape(pos, rot, vel, shape, 0, maxToi);
  } catch (e) {
    return null; // safe fallback (WASM binding issue in rapier 0.21)
  }
}

/** Капсула прошлой меры: Capsule((height-radius)/2, radius), центр в a.y. */
function oldCapsule(a, b) {
  const hh = (HEIGHT - RADIUS) / 2;
  const shape = new PhysicsIndex.RAPIER.Capsule(hh, RADIUS);
  const cx = (a.x + b.x) / 2;
  const cy = a.y;
  const cz = (a.z + b.z) / 2;
  const hit = castShapeSafe(
    PhysicsIndex.world, PhysicsIndex.RAPIER,
    { x: cx, y: cy, z: cz },
    { x: 0, y: 0, z: 0, w: 1 },
    { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z },
    shape, 1,
  );
  return hit === null;
}

/** Шар радиуса radius в середине отрезка. */
function sphereProbe(a, b) {
  const shape = new PhysicsIndex.RAPIER.Capsule(0, RADIUS); // ball = capsule with halfHeight 0
  const cx = (a.x + b.x) / 2;
  const cy = (a.y + b.y) / 2;
  const cz = (a.z + b.z) / 2;
  const hit = castShapeSafe(
    PhysicsIndex.world, PhysicsIndex.RAPIER,
    { x: cx, y: cy, z: cz },
    { x: 0, y: 0, z: 0, w: 1 },
    { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z },
    shape, 1,
  );
  return hit === null;
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

export async function runPhysicsIndexTests() {
  const results = [];
  const t0 = performance.now();

  await PhysicsIndex.init();
  const initMs = performance.now() - t0;

  const map = new JsonMap(LEVEL_12.map);
  PhysicsIndex.buildFrom(map);
  PhysicsIndex.world.step(); // scène видит коллайдеры после первого step (§ 13 плана)
  const edges = collectEdges(map.nav);

  // Базовая форма — своя проба (режим own), считаем годными рёбрами те, что она пропускает.
  const base = new Set();
  for (const e of edges) if (ownProbe(map, e.a, e.b)) base.add(e.key);

  const forms = [
    { name: 'своя проба (isBlocked шаг)', fn: ownProbe },
    { name: 'пояс-капсула (выбранная)', fn: beltSweep },
    { name: 'капсула прошлой меры', fn: oldCapsule },
    { name: 'шар', fn: sphereProbe },
  ];

  for (const form of forms) {
    const t = performance.now();
    let lost = 0;
    for (const e of edges) {
      if (!form.fn(map, e.a, e.b)) lost += 1;
    }
    const ms = performance.now() - t;
    const usPerEdge = (ms * 1000) / edges.length;
    const lostPct = base.size ? ((lost / base.size) * 100).toFixed(3) : '0';
    results.push({
      name: `R2 ${form.name}: ${usPerEdge.toFixed(3)} мкс/ребро, потеряно ${lost}/${base.size} (${lostPct} %)`,
      passed: true,
      info: `рёбер=${edges.length}, цена=${usPerEdge.toFixed(3)} мкс/ребро, потеряно=${lostPct} %`,
    });
  }

  // Критерий R2: потерянных рёбер у пояса ≤ 0,3 % относительно own.
  const belt = forms[1];
  const tBelt = performance.now();
  let beltLost = 0;
  for (const e of edges) if (!belt.fn(map, e.a, e.b)) beltLost += 1;
  const beltPct = base.size ? (beltLost / base.size) * 100 : 0;
  results.push({
    name: 'R2 критерий: потерянных рёбер пояса ≤ 0,3 %',
    passed: beltPct <= 0.3,
    info: `потеряно ${beltLost}/${base.size} (${beltPct.toFixed(3)} %), порог 0,3 %`,
  });

  PhysicsIndex.dispose();

  return {
    passed: results.every((r) => r.passed),
    total: results.length,
    results,
    info: `init ${initMs.toFixed(0)} мс, рёбер=${edges.length}`,
  };
}
