/**
 * Диагност 7: узел шва пластины и её призма — точные u/v против lo/hi и проба
 * со сдвигом на миллиметр внутрь настила. Отвечает, где кончается допуск
 * обратного хода и начинается настоящий выход за план.
 *
 * Запуск: const p = await import('/probe/cut-diag7.mjs?v=1'); window.__d7 = await p.run();
 */
import * as THREE from 'three';
import { JsonMap } from '../src/json-map.js';
import { CONFIG } from '../src/config.js';
import { LEVEL_13 } from '../src/levels/level-13.js';
import { unrotatePoint } from '../src/geo2d.js';

function clone(o) { return JSON.parse(JSON.stringify(o)); }

export function run() {
  const cap = {};
  const orig = JsonMap.prototype._pruneToSpawn;
  JsonMap.prototype._pruneToSpawn = function (nav) {
    cap.pos = nav.pos.slice(); cap.adj = nav.adj.map((a) => a.slice()); cap.keys = [...nav.byKey.keys()];
    return orig.call(this, nav);
  };
  const map = new JsonMap(clone(LEVEL_13.map));
  JsonMap.prototype._pruneToSpawn = orig;
  map.build(new THREE.Scene());

  const report = (key, dir) => {
    const i = cap.keys.indexOf(key);
    const p = cap.pos[i];
    const rows = map.prisms.map((w, idx) => {
      const l = w.frame ? unrotatePoint(w.frame, p.x, p.z) : { x: p.x, z: p.z };
      const isX = w.axis === 'x';
      const u = isX ? l.x : l.z, v = isX ? l.z : l.x;
      if (Math.abs(u - w.lo) > 1.2 && Math.abs(u - w.hi) > 1.2) return null;
      const du = Math.min(Math.abs(u - w.lo), Math.abs(u - w.hi));
      return {
        idx, near: +(u - w.lo).toFixed(4), far: +(u - w.hi).toFixed(4),
        dv0: +(v - w.v0).toFixed(4), dv1: +(v - w.v1).toFixed(4),
        top: +(w.topAt(Math.min(w.hi, Math.max(w.lo, u))) ?? -99).toFixed(3),
        inside: map._prismTopAt(p.x, p.z) !== null,
        nudged: +(map._prismTopAt(p.x + dir.x, p.z + dir.z) ?? -99).toFixed(3),
        du: +du.toFixed(4),
      };
    }).filter(Boolean);
    // узел на 1 мм глубже в свою пластину: что отвечает опора
    const back = { x: p.x - dir.x * 0.001, z: p.z - dir.z * 0.001 };
    return {
      key, y: +p.y.toFixed(3), x: +p.x.toFixed(4), z: +p.z.toFixed(4),
      prismHere: map._prismTopAt(p.x, p.z),
      prism1mm: map._prismTopAt(back.x, back.z),
      sweepHere: map.topAt(p.x, p.z),
      sweep1mm: map.topAt(back.x, back.z),
      rows,
    };
  };

  // направление вдоль оси настила, в которое уходит «наружу» (для пластины — к её
  // началу, для дуги — за срез); берём по соседу цепочки
  const dirOf = (key) => {
    const i = cap.keys.indexOf(key);
    const nb = (cap.adj[i].length ? cap.adj[i] : [i + 1])[0];
    const p = cap.pos[i], q = cap.pos[nb];
    const L = Math.hypot(q.x - p.x, q.z - p.z) || 1;
    return { x: (p.x - q.x) / L, z: (p.z - q.z) / L };
  };

  const keys = ['d:ring_ring:9:0', 'd:ring_ring:9:4', 'd:ring_ring:0:0', 'd:ring_ring:4:0', 'd:ring_ring:12:0'];
  return { nodes: keys.map((k) => Object.assign({ dir: dirOf(k) }, report(k, dirOf(k)))) };
}
