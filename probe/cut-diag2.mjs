/**
 * Диагност 2: где именно обход проходит сквозь русло `cut` и почему опора
 * под настилом полотна над руслом отвечает дном, а не асфальтом петли.
 *
 * Запуск в консоли страницы игры:
 *   const p = await import('/probe/cut-diag2.mjs?v=1'); window.__d2 = await p.run();
 */
import * as THREE from 'three';
import { JsonMap } from '../src/json-map.js';
import { CONFIG } from '../src/config.js';
import { LEVEL_13 } from '../src/levels/level-13.js';

const J = CONFIG.jsonMap;

function clone(o) { return JSON.parse(JSON.stringify(o)); }

export function run() {
  const spec = LEVEL_13.map;
  let cap = null, self = null;
  const orig = JsonMap.prototype._pruneToSpawn;
  JsonMap.prototype._pruneToSpawn = function (nav) {
    self = this;
    cap = { pos: nav.pos.slice(), adj: nav.adj.map((a) => a.slice()), keys: [...nav.byKey.keys()] };
    return orig.call(this, nav);
  };
  const map = new JsonMap(clone(spec));
  JsonMap.prototype._pruneToSpawn = orig;
  map.build(new THREE.Scene());

  const ribbonIdx = new Set();
  cap.keys.forEach((k, i) => { if (/^d:ring/.test(k)) ribbonIdx.add(i); });

  // (1) где наземный обход пересекает коридор: рёбра, у которых концы по разные
  // стороны русла (z < 52 и z > 68), но ленты среди них нет
  const seen = new Set();
  const near = (p) => (p.x - map.spawn.x) ** 2 + (p.z - map.spawn.z) ** 2;
  const ai = cap.pos.reduce((best, p, i) => (near(p) < near(cap.pos[best]) ? i : best), 0);
  seen.add(ai);
  const q = [ai];
  while (q.length) {
    const cur = q.pop();
    for (const nb of cap.adj[cur] || []) if (!seen.has(nb) && !ribbonIdx.has(nb)) { seen.add(nb); q.push(nb); }
  }
  const crossing = [];
  for (const i of seen) {
    for (const j of cap.adj[i]) {
      if (!seen.has(j) || ribbonIdx.has(j)) continue;
      const a = cap.pos[i], b = cap.pos[j];
      if ((a.z < 52 && b.z > 68) || (b.z < 52 && a.z > 68)) {
        crossing.push({
          a: [+a.x.toFixed(1), +a.y.toFixed(2), +a.z.toFixed(1)],
          b: [+b.x.toFixed(1), +b.y.toFixed(2), +b.z.toFixed(1)],
          ka: cap.keys[i], kb: cap.keys[j],
          ga: +map.groundHeightAt(a.x, a.z, a.y).toFixed(2),
          gb: +map.groundHeightAt(b.x, b.z, b.y).toFixed(2),
          chA: map._inChannel(a.x, a.z), chB: map._inChannel(b.x, b.z),
          blockedA: map.isBlocked(a.x, a.z, CONFIG.radius, a.y, CONFIG.eyeHeight),
          blockedB: map.isBlocked(b.x, b.z, CONFIG.radius, b.y, CONFIG.eyeHeight),
        });
      }
    }
  }

  // (2) опора под настилом там, где петля идёт над руслом
  const overBed = [];
  for (const i of ribbonIdx) {
    const p = cap.pos[i];
    if (!map._inChannel(p.x, p.z)) continue;
    overBed.push({
      key: cap.keys[i], x: +p.x.toFixed(1), z: +p.z.toFixed(1), y: +p.y.toFixed(2),
      sweep: p.sweep === undefined ? null : null,
      sTop: (() => { const v = map.topAt(p.x, p.z); return v === null ? null : +v.toFixed(2); })(),
      pTop: (() => { const v = map._prismTopAt(p.x, p.z); return v === null ? null : +v.toFixed(2); })(),
      g: +map.groundHeightAt(p.x, p.z, p.y).toFixed(2),
      deg: (cap.adj[i] || []).length,
    });
  }

  return {
    start: { idx: ai, key: cap.keys[ai], pos: cap.pos[ai] },
    crossingCount: crossing.length,
    crossing: crossing.slice(0, 6),
    overBedCount: overBed.length,
    overBed: overBed.slice(0, 8),
    channelLimits: { bedY: spec.waterways ? null : null, navEdgeProbe: J.navEdgeProbe, navEdgeDrop: J.navEdgeDrop },
    waterways: (spec.waterways || []).map((w) => ({ id: w.id, width: w.width, bedY: w.bedY, wade: w.wade, pts: w.points.length })),
  };
}
