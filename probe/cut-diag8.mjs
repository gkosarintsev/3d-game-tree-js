/**
 * Диагност 8: шлюз северного съезда. Что происходит с цепочкой узлов `ring_e0`
 * от кольца до улицы — какие из них сюжет считает «на полотне» (`onRibbon`), где
 * обрывается ребро, ведущее с подъёма на улицу, и кто соседи у последнего узла.
 *
 * Запуск: const p = await import('/probe/cut-diag8.mjs?v=1'); window.__d8 = p.run();
 */
import * as THREE from 'three';
import { JsonMap } from '../src/json-map.js';
import { CONFIG } from '../src/config.js';
import { LEVEL_13 } from '../src/levels/level-13.js';

export function run() {
  const spec = LEVEL_13.map;
  let cap = null;
  const orig = JsonMap.prototype._pruneToSpawn;
  JsonMap.prototype._pruneToSpawn = function (nav) {
    cap = { pos: nav.pos.slice(), adj: nav.adj.map((a) => a.slice()), keys: [...nav.byKey.keys()] };
    return orig.call(this, nav);
  };
  const map = new JsonMap(JSON.parse(JSON.stringify(spec)));
  JsonMap.prototype._pruneToSpawn = orig;
  map.build(new THREE.Scene());

  const onTrack = (x, z) => {
    for (const road of spec.roads) {
      if (!/^ring/.test(road.id)) continue;
      for (const d of road.decks) {
        if (d.arc) {
          const rho = Math.hypot(x - d.cx, z - d.cz);
          if (Math.abs(rho - d.R) > d.halfW) continue;
          let da = (Math.atan2(z - d.cz, x - d.cx) * 180 / Math.PI - d.a0 + 540) % 360 - 180;
          if (d.span >= 0 ? da >= -1e-9 && da <= d.span + 1e-9 : da <= 1e-9 && da >= d.span - 1e-9) return true;
          continue;
        }
        const rad = (d.yaw ?? 0) * Math.PI / 180;
        const dx = x - d.cx, dz = z - d.cz;
        const u = dx * Math.cos(rad) + dz * Math.sin(rad);
        const v = -dx * Math.sin(rad) + dz * Math.cos(rad);
        if (Math.abs(u) <= d.length / 2 + 1e-9 && Math.abs(v) <= d.width / 2 + 1e-9) return true;
      }
    }
    return false;
  };
  const ribbon = (p) => onTrack(p.x, p.z) && p.y - map.relief.heightAt(p.x, p.z) > 0.5;

  const ramp = [];
  cap.keys.forEach((key, i) => {
    if (!/^d:ring_e0/.test(key)) return;
    const p = cap.pos[i];
    ramp.push({
      key, z: +p.z.toFixed(1), x: +p.x.toFixed(1), y: +p.y.toFixed(2),
      field: +map.relief.heightAt(p.x, p.z).toFixed(2),
      support: +map.groundHeightAt(p.x, p.z, 500).toFixed(2),
      rib: ribbon(p),
      nb: (cap.adj[i] || []).map((j) => cap.keys[j] + (ribbon(cap.pos[j]) ? '*' : '')),
    });
  });
  return { ramp, count: ramp.length, ribbonCount: ramp.filter((r) => r.rib).length };
}
