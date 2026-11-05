/**
 * Диагност 9: шлюзы по числам сюиты, но на СОБРАННОМ графе (после `_pruneToSpawn`).
 * Для каждого узла полотна — `y − поле`, свободные соседи и к какому съезду узел
 * ближе всего. Это тот же `onRibbon`, что в 9-м сценарии `tests/track-city.test.js`.
 *
 * Запуск: const p = await import('/probe/cut-diag9.mjs?v=1'); window.__d9 = p.run();
 */
import * as THREE from 'three';
import { createJsonMap } from '../src/json-map.js';
import { LEVEL_13 } from '../src/levels/level-13.js';
import { frameAt, unrotatePoint } from '../src/geo2d.js';

const DEG = Math.PI / 180;
const RING_ID = 'ring_ring';

export function run() {
  const map = createJsonMap(LEVEL_13.map);
  map.build(new THREE.Scene());
  const decks = LEVEL_13.map.roads
    .filter((r) => /^ring/.test(r.id))
    .flatMap((r) => r.decks.map((d) => ({ ...d, road: r.id })));

  const cover = (x, z) => {
    const out = [];
    for (const d of decks) {
      if (d.arc) {
        const dx = x - d.cx, dz = z - d.cz;
        if (Math.abs(Math.hypot(dx, dz) - d.R) > d.halfW) continue;
        let da = Math.atan2(dz, dx) / DEG - d.a0;
        da = ((da + 540) % 360) - 180;
        if (d.span >= 0 ? da >= -1e-9 && da <= d.span + 1e-9 : da <= 1e-9 && da >= d.span - 1e-9) out.push(d);
        continue;
      }
      const l = unrotatePoint(frameAt(d.cx, d.cz, d.yaw ?? 0), x, z);
      if (Math.abs(l.x - d.cx) <= d.length / 2 + 1e-9 && Math.abs(l.z - d.cz) <= d.width / 2 + 1e-9) out.push(d);
    }
    return out;
  };
  const onRibbon = (p) => cover(p.x, p.z).length > 0 && p.y - map.relief.heightAt(p.x, p.z) > 0.5;

  const nav = map.nav;
  const ribbon = [];
  for (let i = 0; i < nav.pos.length; i++) if (onRibbon(nav.pos[i])) ribbon.push(i);

  const rows = [];
  for (const i of ribbon) {
    const p = nav.pos[i];
    const free = (nav.adj[i] || []).filter((nb) => !onRibbon(nav.pos[nb]));
    if (!free.length) continue;
    rows.push({
      x: +p.x.toFixed(1), z: +p.z.toFixed(1), y: +p.y.toFixed(2),
      field: +map.relief.heightAt(p.x, p.z).toFixed(2),
      roads: cover(p.x, p.z).map((d) => d.road).join('+'),
      free: free.map((j) => {
        const q = nav.pos[j];
        return `${q.x.toFixed(1)},${q.z.toFixed(1)},${q.y.toFixed(2)} на полотне ${cover(q.x, q.z).map((d) => d.road).join('+') || 'нет'} зазор ${(q.y - map.relief.heightAt(q.x, q.z)).toFixed(2)}`;
      }),
    });
  }
  const north = rows.filter((r) => r.z > 100);
  const south = rows.filter((r) => r.z < 0);
  // ближайшие узлы к северному носу: есть ли они в сети вообще
  const nose = { x: 6.7, z: 208.6 };
  let near = null, best = Infinity;
  for (let i = 0; i < nav.pos.length; i++) {
    const p = nav.pos[i];
    const d = Math.hypot(p.x - nose.x, p.z - nose.z);
    if (d < best) { best = d; near = { i, x: +p.x.toFixed(2), y: +p.y.toFixed(3), z: +p.z.toFixed(2), rib: onRibbon(p), field: +map.relief.heightAt(p.x, p.z).toFixed(2), deg: (nav.adj[i] || []).length }; }
  }
  // узлы в 25 м от северного носа: чем они держатся и почему не дают шлюз
  const around = [];
  for (let i = 0; i < nav.pos.length; i++) {
    const p = nav.pos[i];
    if (Math.hypot(p.x - nose.x, p.z - nose.z) > 25) continue;
    around.push({
      x: +p.x.toFixed(1), z: +p.z.toFixed(1), y: +p.y.toFixed(2),
      gap: +(p.y - map.relief.heightAt(p.x, p.z)).toFixed(2),
      roads: cover(p.x, p.z).map((d) => d.road).join('+') || null,
      nb: (nav.adj[i] || []).filter((j) => Math.hypot(nav.pos[j].x - p.x, nav.pos[j].z - p.z) > 0.5)
        .map((j) => `${nav.pos[j].x.toFixed(1)},${nav.pos[j].z.toFixed(1)} y${nav.pos[j].y.toFixed(2)} gap${(nav.pos[j].y - map.relief.heightAt(nav.pos[j].x, nav.pos[j].z)).toFixed(2)} ${cover(nav.pos[j].x, nav.pos[j].z).map((d) => d.road).join('+') || 'земля'}`),
    });
  }
  return {
    ribbon: ribbon.length,
    gates: rows.length,
    northGates: north.length,
    southGates: south.length,
    sampleNorth: north.slice(0, 6),
    sampleSouth: south.slice(0, 3),
    aroundNose: around,
    nearNose: { best: +best.toFixed(2), near },
  };
}
