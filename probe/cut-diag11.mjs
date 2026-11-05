/**
 * Диагност 11: правит ли сборка карты бриф на месте, и как от этого меняются
 * шлюзы съездов. Считает `gateN`/`gateS` дважды: по копиям настилов, снятым ДО
 * `build`, и по специи ПОСЛЕ него. Различие чисел значит, что 9-й сценарь сюиты
 * мерит покрытие одним состоянием данных, а граф — другим.
 *
 * Запуск на СВЕЖЕЙ странице:
 *   const p = await import('/probe/cut-diag11.mjs?v=1'); window.__d11 = await p.run();
 */
import * as THREE from 'three';
import { createJsonMap } from '../src/json-map.js';
import { LEVEL_13 } from '../src/levels/level-13.js';
import { frameAt, unrotatePoint } from '../src/geo2d.js';

const DEG = Math.PI / 180;

function coverFactory(decks) {
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

const flat = (spec) => spec.roads
  .filter((r) => /^ring/.test(r.id))
  .flatMap((r) => r.decks.map((d) => ({ ...d, road: r.id })));

export function run() {
  const spec = LEVEL_13.map;
  const beforeJson = JSON.stringify(spec.roads.filter((r) => /^ring/.test(r.id)));
  const decksBefore = flat(spec);
  const map = createJsonMap(spec);
  map.build(new THREE.Scene());
  const decksAfter = flat(spec);
  const afterJson = JSON.stringify(spec.roads.filter((r) => /^ring/.test(r.id)));

  const gates = (decks) => {
    const cover = coverFactory(decks);
    const nav = map.nav;
    const rib = (p) => cover(p.x, p.z).length > 0 && p.y - map.relief.heightAt(p.x, p.z) > 0.5;
    let ribbon = 0, north = 0, south = 0;
    for (let i = 0; i < nav.pos.length; i++) {
      const p = nav.pos[i];
      if (!rib(p)) continue;
      ribbon++;
      if ((nav.adj[i] || []).some((j) => !rib(nav.pos[j]))) {
        if (p.z > 100) north++; else if (p.z < 0) south++;
      }
    }
    return { ribbon, north, south };
  };

  // где именно расходятся копии: поле за полем по первому отличию
  let diff = null;
  if (beforeJson !== afterJson) {
    for (let i = 0; i < decksBefore.length; i++) {
      const a = decksBefore[i], b = decksAfter[i];
      for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
        if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) { diff = diff || []; diff.push(`${i}#${a.road} ${k}: ${JSON.stringify(a[k])} → ${JSON.stringify(b[k])}`); }
      }
    }
  }
  // тот же счёт после проходов `findPath`: 9-й сценарий сюиты вызывает их несколько
  // раз ДО шлюзов, и если поиск правит сеть, счёт меняется под рукой
  const nav0 = map.nav;
  const ai = nav0.nearestNode(map.spec.spawn.x, map.groundHeightAt(map.spec.spawn.x, map.spec.spawn.z, 0), map.spec.spawn.z);
  const bi = nav0.nearestNode(-42.63, map.groundHeightAt(-42.63, 176.15, 500), 176.15);
  const paths = [];
  for (const [a, b] of [[ai, bi], [ai, bi], [bi, ai]]) paths.push(nav0.findPath(nav0.pos[a], nav0.pos[b])?.length ?? -1);
  const gatesAfterFind = gates(decksAfter);
  return {
    specMutated: beforeJson !== afterJson,
    diffs: (diff || []).slice(0, 12),
    gatesBeforeCopies: gates(decksBefore),
    gatesAfterSpec: gates(decksAfter),
    findPaths: paths,
    nodes: nav0.pos.length,
    gatesAfterFindPath: gatesAfterFind,
  };
}
