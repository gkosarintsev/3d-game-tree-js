/**
 * Диагност 5: (1) может ли наземный обход пересечь русло `cut` — узлы внутри
 * полосы z 50…70 и рёбра, вводящие их в сеть; (2) насколько близко перила съезда
 * стоят к узлу шва кольца (точный `d` в осях стенки).
 *
 * Запуск: const p = await import('/probe/cut-diag5.mjs?v=1'); window.__d5 = await p.run();
 */
import * as THREE from 'three';
import { JsonMap } from '../src/json-map.js';
import { CONFIG } from '../src/config.js';
import { LEVEL_13 } from '../src/levels/level-13.js';
import { unrotatePoint } from '../src/geo2d.js';

const J = CONFIG.jsonMap;

function clone(o) { return JSON.parse(JSON.stringify(o)); }

export function run() {
  const spec = LEVEL_13.map;
  let cap = null;
  const orig = JsonMap.prototype._pruneToSpawn;
  JsonMap.prototype._pruneToSpawn = function (nav) {
    cap = { pos: nav.pos.slice(), adj: nav.adj.map((a) => a.slice()), keys: [...nav.byKey.keys()] };
    return orig.call(this, nav);
  };
  const map = new JsonMap(clone(spec));
  JsonMap.prototype._pruneToSpawn = orig;
  map.build(new THREE.Scene());

  // (1) все узлы внутри полосы русла: что за узел, чем держится, проходит ли тело
  const band = [];
  cap.keys.forEach((key, i) => {
    const p = cap.pos[i];
    if (!(p.z > 48 && p.z < 72)) return;
    if (/^d:/.test(key)) return; // настилы — не «наземный» обход
    band.push({
      key, x: +p.x.toFixed(1), z: +p.z.toFixed(1), y: +p.y.toFixed(2),
      deg: (cap.adj[i] || []).length,
      g: +map.groundHeightAt(p.x, p.z, p.y).toFixed(2),
      blk: map.isBlocked(p.x, p.z, CONFIG.radius, p.y, CONFIG.eyeHeight),
      inCh: map._inChannel(p.x, p.z),
    });
  });

  // (2) перила: расстояние от узла шва до каждой стенки в её собственных осях
  const seam = (key) => {
    const i = cap.keys.indexOf(key);
    const p = cap.pos[i];
    const rows = map.rails.map((rail, ri) => {
      if (rail.kind !== 'wedge') return null;
      const w = rail.w;
      const q = w.frame ? unrotatePoint(w.frame, p.x, p.z) : p;
      const isX = w.axis === 'x';
      const u = isX ? q.x : q.z, v = isX ? q.z : q.x;
      const d = Math.hypot(Math.max(0, w.lo - u, u - w.hi), Math.max(0, w.v0 - v, v - w.v1));
      if (d > 3) return null;
      const top = w.topAt ? +w.topAt(Math.min(w.hi, Math.max(w.lo, u))).toFixed(2) : null;
      return { ri, d: +d.toFixed(3), u: +u.toFixed(2), v: +v.toFixed(2), lo: w.lo, hi: w.hi, v0: w.v0, v1: w.v1, top, feet: +p.y.toFixed(2) };
    }).filter(Boolean).sort((a, b) => a.d - b.d);
    return { key, x: +p.x.toFixed(2), z: +p.z.toFixed(2), y: +p.y.toFixed(2), rails: rows };
  };

  return {
    bandCount: band.length,
    band: band.slice(0, 40),
    seams: [seam('d:ring_ring:6:0'), seam('d:ring_ring:23:0')],
    groundY: map.groundY,
    hasRelief: !!map.relief,
  };
}
