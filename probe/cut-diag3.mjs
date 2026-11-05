/**
 * Диагност 3: почему узлы цепочки полотна имеют степень 0 и где рвётся ребро на
 * границе двух настилов. Для каждого узла — точные (не округлённые) координаты,
 * все ответы движка о опоре и по каждому соседу по цепочке — какой из трёх
 * гейтов `_linkOk` бракует ребро.
 *
 * Запуск в консоли страницы игры:
 *   const p = await import('/probe/cut-diag3.mjs?v=1'); window.__d3 = await p.run();
 */
import * as THREE from 'three';
import { JsonMap } from '../src/json-map.js';
import { CONFIG } from '../src/config.js';
import { LEVEL_13 } from '../src/levels/level-13.js';

const J = CONFIG.jsonMap;

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

  const byKey = new Map();
  cap.keys.forEach((k, i) => byKey.set(k, i));
  const decks = spec.roads.filter((r) => /^ring/.test(r.id))
    .flatMap((r) => r.decks.map((d, di) => Object.assign({ road: r.id, di }, d)));

  const probe = (p) => ({
    sweep: nf(map.topAt(p.x, p.z)),
    prism: nf(map._prismTopAt(p.x, p.z)),
    relief: nf(map.relief ? map.relief.heightAt(p.x, p.z) : null),
    plate: nf(map.plateHeightAt(p.x, p.z, p.y)),
    g: nf(map.groundHeightAt(p.x, p.z, p.y)),
    y: nf(p.y),
    inCh: map._inChannel(p.x, p.z),
    blk: map.isBlocked(p.x, p.z, CONFIG.radius, p.y, CONFIG.eyeHeight),
  });

  // по каждому ребру «последний узел настила → первый узел следующего» — какой
  // гейт бракует и с какими числами
  const seamGate = (a, b) => {
    const pa = cap.pos[a], pb = cap.pos[b];
    const dy = Math.abs(pa.y - pb.y);
    const clear = map.bodyClearLine(pa, pb);
    const there = map._edgeWalk(pa, pb), back = map._edgeWalk(pb, pa);
    return {
      key: cap.keys[a], to: cap.keys[b],
      dist: +Math.hypot(pb.x - pa.x, pb.z - pa.z).toFixed(4),
      dy: +dy.toFixed(3),
      bodyClear: clear, walk: there, walkBack: back,
      at: probe(pb), from: probe(pa),
    };
  };

  const zero = [];
  for (let i = 0; i < cap.pos.length; i++) {
    if (cap.adj[i].length) continue;
    const key = cap.keys[i];
    if (!/^d:ring/.test(key)) continue;
    zero.push({ key, x: cap.pos[i].x, z: cap.pos[i].z, why: probe(cap.pos[i]) });
  }

  const seams = [];
  for (const d of decks) {
    for (let k = 0; ; k++) {
      const a = byKey.get(`d:${d.road}:${d.di}:${k}`);
      const b = byKey.get(`d:${d.road}:${d.di}:${k + 1}`);
      if (a === undefined || b === undefined) break;
      if (!cap.adj[a].includes(b)) seams.push(Object.assign({ deck: `${d.road}:${d.di}`, k }, seamGate(a, b)));
      break; // интересует только первое бракованное ребро настила
    }
    // ребро «конец предыдущего настила → начало этого»
    const prev = byKey.get(`d:${d.road}:${d.di - 1}:` + lastK(decks, d.di - 1));
    const first = byKey.get(`d:${d.road}:${d.di}:0`);
    if (prev !== undefined && first !== undefined && !cap.adj[prev].includes(first)) {
      seams.push(Object.assign({ deck: `↦${d.road}:${d.di}`, k: 'seam' }, seamGate(prev, first)));
    }
  }

  return {
    zeroCount: zero.length,
    zero,
    seamCount: seams.length,
    seams: seams.slice(0, 14),
    planGrid: J.planGrid,
    navEdgeProbe: J.navEdgeProbe,
    stepUp: map.stepUp,
  };
}

function lastK(decks, di) {
  const d = decks.find((x) => x.di === di);
  if (!d) return -1;
  const DEG = Math.PI / 180;
  let len, span, y0, y1;
  if (d.arc) { len = d.R * Math.abs(d.span * DEG); y0 = d.y0; y1 = d.y1; span = len; }
  else { span = d.length; y0 = d.topAtMin; y1 = d.topAtMax; len = d.length; }
  const rise = Math.abs(y1 - y0);
  const perNode = rise > 0.01 ? Math.min(CONFIG.jsonMap.navStep, 0.6 * 0.8 * len / rise) : CONFIG.jsonMap.navStep;
  return Math.max(1, Math.ceil(len / perNode));
}

const nf = (v) => (v === null || v === undefined ? null : +v.toFixed(3));
