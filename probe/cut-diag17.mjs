/**
 * Диагност 17: что именно меняет первая сборка карты главы 13 в её же брифе.
 *
 * Замер (порт 8241, страница только что загружена): сборка №1 даёт граф 10148
 * узлов, в нём есть северный квартал (2567 узлов севернее z=150) и узел точки B,
 * но шлюзов съездов ноль и узлов на полотне 141. Сборка №2 в той же странице —
 * 6093 узла, севера нет вовсе (до B ближайший узел в 360 м), но шлюзов 42+19 и
 * узлов на полотне 144. Различаются и `cover()`-покрытия, то есть данные настилов
 * правятся на месте. Здесь: снимок полей трассы до сборки, после сборки №1 и
 * после сборки №2 + отпечатки графов.
 *
 * Запуск на СВЕЖЕЙ странице:
 *   const p = await import('/probe/cut-diag17.mjs?v=1'); window.__d17 = await p.run();
 */
import * as THREE from 'three';
import { createJsonMap } from '../src/json-map.js';
import { LEVEL_13 } from '../src/levels/level-13.js';

const FIELDS = ['id', 'type', 'width', 'lamps', 'rails', 'cx', 'cz', 'length', 'yaw', 'axis',
  'minX', 'maxX', 'minZ', 'maxZ', 'topAtMin', 'topAtMax', 'topY', 'bottomY', 'grounded', 'rise', 'y'];

function snap(spec) {
  const rows = [];
  for (const r of spec.roads) {
    for (const d of (r.decks || [])) {
      const o = { road: r.id };
      for (const k of FIELDS) if (k in d) o[k] = d[k];
      if (d.arc) o.arc = JSON.stringify(d.arc);
      rows.push(o);
    }
  }
  return rows;
}

function diffRows(a, b) {
  const out = [];
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const x = a[i] || {}, y = b[i] || {};
    for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) {
      if (JSON.stringify(x[k]) !== JSON.stringify(y[k])) out.push(`${i} ${x.road} ${k}: ${JSON.stringify(x[k])} → ${JSON.stringify(y[k])}`);
    }
  }
  return out;
}

function fp(map) {
  const nav = map.nav;
  let north = 0, edges = 0;
  for (let i = 0; i < nav.pos.length; i++) {
    edges += (nav.adj[i] || []).length;
    if (nav.pos[i].z > 150) north++;
  }
  const exit = LEVEL_13.gameplay.exit;
  let best = Infinity;
  for (const p of nav.pos) best = Math.min(best, Math.hypot(p.x - exit.x, p.z - exit.z));
  return { nodes: nav.pos.length, edges, northNodes: north, nearExit: +best.toFixed(1) };
}

export function run() {
  const spec = LEVEL_13.map;
  const s0 = snap(spec);
  const reliefKeys0 = Object.keys(spec.relief).join(',');
  const m1 = createJsonMap(spec);
  m1.build(new THREE.Scene());
  const f1 = fp(m1);
  const s1 = snap(spec);
  const reliefKeys1 = Object.keys(spec.relief).join(',');
  const m2 = createJsonMap(spec);
  m2.build(new THREE.Scene());
  const f2 = fp(m2);
  const s2 = snap(spec);
  const m3 = createJsonMap(JSON.parse(JSON.stringify(spec)));
  m3.build(new THREE.Scene());
  const f3 = fp(m3);
  return {
    decks: { count0: s0.length, count1: s1.length, count2: s2.length },
    diffAfterFirst: diffRows(s0, s1).slice(0, 14),
    diffAfterSecond: diffRows(s1, s2).slice(0, 14),
    reliefKeys: { before: reliefKeys0, after: reliefKeys1 },
    first: f1, second: f2, clonedSpec: f3,
  };
}
