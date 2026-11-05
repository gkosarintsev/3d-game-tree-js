/**
 * Диагност 16: порядок сборки относительно сюиты.
 *
 * Сюита главы 13 на 9-м сценарии видит граф в 6093 узла, где северного квартала
 * нет вовсе (узлов севернее z=150 — ноль), а тот же `createJsonMap(LEVEL_13.map)`
 * + `build()`, вызванный в этой же странице руками, даёт 10148 узлов и 2567
 * северных. Здесь один и тот же порядок measured трижды: сборка ДО сюиты, сборка
 * ПОСЛЕ сюиты и результат внутри самой сюиты (через её же числа).
 *
 * Запуск на СВЕЖЕЙ странице:
 *   const p = await import('/probe/cut-diag16.mjs?v=1'); window.__d16 = await p.run();
 */
import * as THREE from 'three';
import { createJsonMap } from '../src/json-map.js';
import { LEVEL_13 } from '../src/levels/level-13.js';

function fingerprint(map) {
  const nav = map.nav;
  let north = 0, edges = 0;
  for (let i = 0; i < nav.pos.length; i++) {
    edges += (nav.adj[i] || []).length;
    if (nav.pos[i].z > 150) north++;
  }
  // доходит ли сеть до точки B: узел, ближайший к exits, и расстояние до неё
  const exit = LEVEL_13.gameplay.exit;
  let best = Infinity;
  for (const p of nav.pos) best = Math.min(best, Math.hypot(p.x - exit.x, p.z - exit.z));
  return { nodes: nav.pos.length, edges, northNodes: north, nearExit: +best.toFixed(1) };
}

export async function run() {
  const before = fingerprint((() => { const m = createJsonMap(LEVEL_13.map); m.build(new THREE.Scene()); return m; })());
  const suite = await import('../tests/track-city.test.js?v=16');
  const r = await suite.runTrackCityTests();
  const failed = r.results.filter((x) => !x.passed).map((x) => `${x.name} :: ${String(x.info).slice(0, 260)}`);
  const after = fingerprint((() => { const m = createJsonMap(LEVEL_13.map); m.build(new THREE.Scene()); return m; })());
  return { buildBeforeSuite: before, buildAfterSuite: after, suite: `${r.passed}/${r.total}`, failed };
}
