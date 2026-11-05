/**
 * Диагност 13: шлюзы северного съезда плывут от того, что в странице СБОРКА
 * главы 13 следует не за первой сборкой. Сюита `relief-city` (глава 12),
 * запущенная раньше `track-city`, лишает 9-й сценарий шлюзов: узлов на полотне
 * те же 144, а соседей вне ленты — ноль. Здесь проверяется ровно это: одна и та
 * же глава собирается три раза, между вторым и третьим собирается глава 12.
 *
 * Запуск на СВЕЖЕЙ странице:
 *   const p = await import('/probe/cut-diag13.mjs?v=1'); window.__d13 = await p.run();
 */
import * as THREE from 'three';
import { createJsonMap } from '../src/json-map.js';
import { LEVEL_12 } from '../src/levels/level-12.js';
import { LEVEL_13 } from '../src/levels/level-13.js';
import { frameAt, unrotatePoint } from '../src/geo2d.js';

const DEG = Math.PI / 180;

function makeGates(map, spec) {
  const decks = spec.roads
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
      } else {
        const l = unrotatePoint(frameAt(d.cx, d.cz, d.yaw ?? 0), x, z);
        if (Math.abs(l.x - d.cx) <= d.length / 2 + 1e-9 && Math.abs(l.z - d.cz) <= d.width / 2 + 1e-9) out.push(d);
      }
    }
    return out;
  };
  const nav = map.nav;
  const rib = (p) => cover(p.x, p.z).length > 0 && p.y - map.relief.heightAt(p.x, p.z) > 0.5;
  let ribbon = 0, north = 0, south = 0, edges = 0;
  for (let i = 0; i < nav.pos.length; i++) {
    edges += (nav.adj[i] || []).length;
    const p = nav.pos[i];
    if (!rib(p)) continue;
    ribbon++;
    if ((nav.adj[i] || []).some((j) => !rib(nav.pos[j]))) {
      if (p.z > 100) north++; else if (p.z < 0) south++;
    }
  }
  return {
    nodes: nav.pos.length, edges, ribbon, north, south,
    fieldNorth: +map.relief.heightAt(6.7, 206.7).toFixed(3),
    fieldToe: +map.relief.heightAt(6.7, 208.6).toFixed(3),
    supportToe: +map.groundHeightAt(6.7, 208.6, 500).toFixed(3),
    reliefSameObject: map.relief === SAME_RELIEF,
  };
}

let SAME_RELIEF = null;

export function run() {
  const spec = LEVEL_13.map;
  const m1 = createJsonMap(spec);
  m1.build(new THREE.Scene());
  SAME_RELIEF = m1.relief;
  const g1 = makeGates(m1, spec);
  const m2 = createJsonMap(spec);
  m2.build(new THREE.Scene());
  const g2 = makeGates(m2, spec);
  // между сборками — глава 12: ровно то, что делает сюжет `relief-city`
  const c12 = createJsonMap(LEVEL_12.map);
  c12.build(new THREE.Scene());
  const m3 = createJsonMap(spec);
  m3.build(new THREE.Scene());
  const g3 = makeGates(m3, spec);
  return {
    chapter12: { nodes: c12.nav.pos.length, reliefIsSharedWith13: c12.relief === m3.relief },
    first: g1, second: g2, thirdAfterChapter12: g3,
  };
}
