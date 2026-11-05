/**
 * Диагност 4: кто именно бракует тело на узле цепочки полотна — блокер (и чей
 * прямоугольник) или перила (и чей пояс).
 *
 * Запуск: const p = await import('/probe/cut-diag4.mjs?v=1'); window.__d4 = await p.run();
 */
import * as THREE from 'three';
import { JsonMap } from '../src/json-map.js';
import { CONFIG } from '../src/config.js';
import { circleHitsBox } from '../src/solids.js';
import { LEVEL_13 } from '../src/levels/level-13.js';

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

  const R = CONFIG.radius, H = CONFIG.eyeHeight;
  const out = [];
  cap.keys.forEach((key, i) => {
    if (!/^d:ring/.test(key) || cap.adj[i].length) return;
    const p = cap.pos[i];
    const hits = [];
    for (const b of map.blockers) {
      if (b.y1 <= p.y + 0.05 || b.y0 >= p.y + H - 0.05) continue;
      if (circleHitsBox(p.x, p.z, b, R)) hits.push({ what: 'blocker', rect: fmt(b), y: [+b.y0.toFixed(2), +b.y1.toFixed(2)] });
    }
    map.rails.forEach((rail, ri) => {
      const before = map._railsBlock(p.x, p.z, R, p.y, H);
      const saved = map.rails;
      map.rails = [rail];
      const alone = map._railsBlock(p.x, p.z, R, p.y, H);
      map.rails = saved;
      if (alone) hits.push({ what: 'rail', i: ri, kind: rail.kind, geo: railShape(rail) });
      void before;
    });
    out.push({ key, x: +p.x.toFixed(2), z: +p.z.toFixed(2), y: +p.y.toFixed(2), hits });
  });
  return { nodes: out, railImpl: map.rails.length, blockers: map.blockers.length };
}

function fmt(b) {
  return `${b.minX.toFixed(1)}…${b.maxX.toFixed(1)} × ${b.minZ.toFixed(1)}…${b.maxZ.toFixed(1)}${b.obb ? ' [obb]' : ''}`;
}

function railShape(rail) {
  if (rail.kind === 'arc') {
    const s = rail.s;
    return { road: s.road, cx: +s.cx.toFixed(1), cz: +s.cz.toFixed(1), R: +s.R.toFixed(1), a0: +s.a0.toFixed(1), span: +s.span.toFixed(1), halfW: s.halfW };
  }
  const w = rail.w;
  return {
    axis: w.axis, lo: +w.lo.toFixed(2), hi: +w.hi.toFixed(2), v0: +w.v0.toFixed(2), v1: +w.v1.toFixed(2),
    frame: w.frame ? { cx: +w.frame.cx.toFixed(2), cz: +w.frame.cz.toFixed(2), rad: +w.frame.rad.toFixed(3) } : null,
  };
}
