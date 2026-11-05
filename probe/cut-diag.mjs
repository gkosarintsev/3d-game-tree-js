/**
 * Диагност: почему русло `cut` отрезает северную половину главы 13.
 *
 * Зонд снимает граф ДО `_pruneToSpawn` (подменяя метод на прототипе), и по каждому
 * узлу цепочки полотна отвечает: есть ли соседи, что отвечает опора, и что именно
 * бракует ребро — блокер, перила или габарит солида.
 *
 * Запуск в консоли страницы игры:
 *   const p = await import('/probe/cut-diag.mjs?v=1'); window.__diag = await p.run();
 */
import * as THREE from 'three';
import { JsonMap } from '../src/json-map.js';
import { CONFIG } from '../src/config.js';
import { LEVEL_13 } from '../src/levels/level-13.js';

const J = CONFIG.jsonMap;

function clone(o) { return JSON.parse(JSON.stringify(o)); }

/** Узлы цепочки полотна и их числа, снятые до отсечения карманов. */
export function run() {
  const spec = LEVEL_13.map;
  let cap = null;
  const orig = JsonMap.prototype._pruneToSpawn;
  JsonMap.prototype._pruneToSpawn = function (nav) {
    cap = { pos: nav.pos.map(p => ({ x: p.x, y: p.y, z: p.z })), adj: nav.adj.map(a => a.slice()), keys: [...nav.byKey.keys()] };
    return orig.call(this, nav);
  };
  const map = new JsonMap(clone(spec));
  JsonMap.prototype._pruneToSpawn = orig;
  map.build(new THREE.Scene());

  const idx = new Map();
  cap.keys.forEach((k, i) => idx.set(k, i));

  const decks = spec.roads.filter(r => /^ring/.test(r.id))
    .flatMap(r => r.decks.map((d, di) => Object.assign({ road: r.id, di }, d)));

  // чем именно бракуется ребро: опора, габарит, перила
  const why = (p) => {
    const g = map.groundHeightAt(p.x, p.z, p.y);
    const blk = map.isBlocked(p.x, p.z, CONFIG.radius, p.y, CONFIG.eyeHeight);
    let blocker = null, rail = null;
    for (const b of map.blockers) {
      if (p.x >= b.minX - CONFIG.radius && p.x <= b.maxX + CONFIG.radius
        && p.z >= b.minZ - CONFIG.radius && p.z <= b.maxZ + CONFIG.radius
        && b.y1 > p.y + 0.05 && b.y0 < p.y + CONFIG.eyeHeight - 0.05) { blocker = b; break; }
    }
    for (const r of map.rails) {
      const hit = r.kind === 'arc'
        ? sweepBlocks(r.s, p.x, p.z) : wedgeBlocks(r.w, p.x, p.z);
      if (hit) { rail = { kind: r.kind, deck: r.deckId || r.id || '' }; break; }
    }
    return { g: +g.toFixed(2), delta: +(g - p.y).toFixed(2), blk, blocker, rail };
  };

  const zero = [];
  for (let i = 0; i < cap.pos.length; i++) {
    if (cap.adj[i].length) continue;
    const key = cap.keys[i];
    if (!/^d:ring/.test(key)) continue;
    const p = cap.pos[i];
    zero.push({ key, x: +p.x.toFixed(1), y: +p.y.toFixed(2), z: +p.z.toFixed(1), why: why(p) });
  }

  // где рвутся рёбра внутри цепочки: пары соседних узлов одной дороги без ребра
  const severed = [];
  for (const d of decks) {
    const n = cap.keys.filter(k => k === `d:${d.road}:${d.di}:0`).length;
    if (!n) continue;
    for (let k = 0; ; k++) {
      const a = idx.get(`d:${d.road}:${d.di}:${k}`);
      const b = idx.get(`d:${d.road}:${d.di}:${k + 1}`);
      if (a === undefined || b === undefined) break;
      if (!cap.adj[a].includes(b)) severed.push({ road: d.road, di: d.di, k, a: +cap.pos[a].y.toFixed(2) });
    }
  }

  return {
    preNodes: cap.pos.length,
    afterNodes: map.nav.pos.length,
    zeroRing: zero.length,
    zero,
    severed: severed.length,
    severedWhere: severed.slice(0, 20),
    channels: (spec.channels || []).map(c => ({ id: c.id, wade: c.wade, segs: c.segments.length, walls: c.walls.length })),
    stepUp: map.stepUp,
    limits: { navEdgeDrop: J.navEdgeDrop, navEdgeProbe: J.navEdgeProbe, railHeight: J.railHeight },
  };
}

function sweepBlocks(s, x, z) {
  const dx = x - s.cx, dz = z - s.cz;
  const rho = Math.hypot(dx, dz);
  return Math.abs(rho - s.R) <= s.halfW + CONFIG.radius;
}

function wedgeBlocks(w, x, z) {
  if (!w || w.minX === undefined) return false;
  return x >= w.minX - CONFIG.radius && x <= w.maxX + CONFIG.radius
    && z >= w.minZ - CONFIG.radius && z <= w.maxZ + CONFIG.radius;
}
