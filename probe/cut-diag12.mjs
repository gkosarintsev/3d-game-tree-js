/**
 * Диагност 12: первая сборка главы против второй на СВЕЖЕЙ странице.
 *
 * Сюита главы 13 на первом сборе карты в странице теряла шлюз северного съезда
 * (узлов на полотне 144, но ни одного с соседом вне ленты севернее z=100), а на
 * втором сборе в той же странице тот же код давал 42 таких узла. Значит либо
 * сборка правит бриф на месте, либо граф строится недетерминированно. Сюда и
 * смотрим: хеш специи до первой сборки, после неё и после второй, плюс шлюзы
 * каждой сборки.
 *
 * Запуск на СВЕЖЕЙ странице:
 *   const p = await import('/probe/cut-diag12.mjs?v=1'); window.__d12 = await p.run();
 */
import * as THREE from 'three';
import { createJsonMap } from '../src/json-map.js';
import { LEVEL_13 } from '../src/levels/level-13.js';
import { frameAt, unrotatePoint } from '../src/geo2d.js';

const DEG = Math.PI / 180;

function coverFactory(spec) {
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

function gates(map, spec) {
  const cover = coverFactory(spec);
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
  // сколько узлов графа стоит севернее z=150 (северный квартал) — проба на то,
  // что сеть северного берега вообще доживает до конца сборки
  let northGround = 0;
  for (const p of nav.pos) if (p.z > 150) northGround++;
  return { nodes: nav.pos.length, ribbon, north, south, northGround };
}

export function run() {
  const spec = LEVEL_13.map;
  const hash = (o) => {
    const s = JSON.stringify(o);
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return `${h.toString(16)}/${s.length}`;
  };
  const h0 = hash(spec);
  const a = createJsonMap(spec);
  a.build(new THREE.Scene());
  const ga = gates(a, spec);
  const h1 = hash(spec);
  const b = createJsonMap(spec);
  b.build(new THREE.Scene());
  const gb = gates(b, spec);
  const h2 = hash(spec);
  return { hashes: { beforeFirst: h0, afterFirst: h1, afterSecond: h2 }, first: ga, second: gb };
}
