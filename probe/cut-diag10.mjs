/**
 * Диагност 10: шлюз северного съезда на ОДНОЙ сборке и на ДВУХ сборках из того
 * же объекта брифа. Плюс размер `LEVEL_13.map` до и после первой сборки — если
 * движок правит специю на месте, вторая сборка главы обязана дать тот же граф,
 * иначе повторная загрузка главы в игре его ломает.
 *
 * Запуск: const p = await import('/probe/cut-diag10.mjs?v=1'); window.__d10 = await p.run();
 */
import * as THREE from 'three';
import { createJsonMap } from '../src/json-map.js';
import { LEVEL_13 } from '../src/levels/level-13.js';
import { frameAt, unrotatePoint } from '../src/geo2d.js';

const DEG = Math.PI / 180;

function coverOf(spec) {
  const decks = spec.roads
    .filter((r) => /^ring/.test(r.id))
    .flatMap((r) => r.decks.map((d) => ({ ...d, road: r.id })));
  return (x, z) => {
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
}

function numbers(map, spec) {
  const cover = coverOf(spec);
  const nav = map.nav;
  const ribbon = (p) => cover(p.x, p.z).length > 0 && p.y - map.relief.heightAt(p.x, p.z) > 0.5;
  let gates = 0, north = 0, south = 0, ribCount = 0;
  const northRows = [];
  for (let i = 0; i < nav.pos.length; i++) {
    const p = nav.pos[i];
    if (!ribbon(p)) continue;
    ribCount++;
    const free = (nav.adj[i] || []).filter((j) => !ribbon(nav.pos[j]));
    if (!free.length) continue;
    gates++;
    if (p.z > 100) { north++; northRows.push({ x: +p.x.toFixed(1), z: +p.z.toFixed(1), y: +p.y.toFixed(2), gap: +(p.y - map.relief.heightAt(p.x, p.z)).toFixed(2), free: free.map((j) => `${nav.pos[j].x.toFixed(1)},${nav.pos[j].z.toFixed(1)} gap${(nav.pos[j].y - map.relief.heightAt(nav.pos[j].x, nav.pos[j].z)).toFixed(2)} настилов ${cover(nav.pos[j].x, nav.pos[j].z).length}`) }); }
    if (p.z < 0) south++;
  }
  // есть ли в сети узлы северного квартала вообще и сколько их
  let n = 0;
  for (const p of nav.pos) if (p.z > 150) n++;
  return { nodes: nav.pos.length, ribbon: ribCount, gates, north, south, northQuarterNodes: n, northRows: northRows.slice(0, 5) };
}

export function run() {
  const before = JSON.stringify(LEVEL_13.map).length;
  const a = createJsonMap(LEVEL_13.map);
  a.build(new THREE.Scene());
  const afterA = JSON.stringify(LEVEL_13.map).length;
  const na = numbers(a, LEVEL_13.map);
  const b = createJsonMap(LEVEL_13.map);
  b.build(new THREE.Scene());
  const nb = numbers(b, LEVEL_13.map);
  return { specSize: { before, afterA, changed: before !== afterA }, first: na, second: nb };
}
