/**
 * Диагност 6: наземный обход без настилов — доходит ли он до северной половины.
 * Обход идёт по графу ДО отсечения карманов, с запрещёнными всеми узлами
 * настилов (`d:` — кольцо и оба съезда), и отвечает: какой максимальный z достигнут,
 * какие узлы полосы русла в компоненте спавна, и достижима ли точка B.
 *
 * Запуск: const p = await import('/probe/cut-diag6.mjs?v=1'); window.__d6 = await p.run();
 */
import * as THREE from 'three';
import { JsonMap } from '../src/json-map.js';
import { CONFIG } from '../src/config.js';
import { LEVEL_13 } from '../src/levels/level-13.js';
import { LEVEL_13 as SPEC } from '../src/levels/level-13.js';

function clone(o) { return JSON.parse(JSON.stringify(o)); }

export function run() {
  const cap = {};
  const orig = JsonMap.prototype._pruneToSpawn;
  JsonMap.prototype._pruneToSpawn = function (nav) {
    cap.pos = nav.pos.slice(); cap.adj = nav.adj.map((a) => a.slice()); cap.keys = [...nav.byKey.keys()];
    return orig.call(this, nav);
  };
  const map = new JsonMap(clone(SPEC.map));
  JsonMap.prototype._pruneToSpawn = orig;
  map.build(new THREE.Scene());

  const near = (p) => (p.x - map.spawn.x) ** 2 + (p.z - map.spawn.z) ** 2;
  const ai = cap.pos.reduce((b, p, i) => (near(p) < near(cap.pos[b]) ? i : b), 0);
  const banned = new Set();
  cap.keys.forEach((k, i) => { if (/^d:/.test(k)) banned.add(i); });
  const seen = new Set([ai]); const q = [ai];
  while (q.length) {
    const cur = q.pop();
    for (const nb of cap.adj[cur] || []) if (!seen.has(nb) && !banned.has(nb)) { seen.add(nb); q.push(nb); }
  }
  let maxZ = -1e9, maxAt = null;
  for (const i of seen) { const p = cap.pos[i]; if (p.z > maxZ) { maxZ = p.z; maxAt = { key: cap.keys[i], x: +p.x.toFixed(1), z: +p.z.toFixed(1), y: +p.y.toFixed(2) }; } }
  const inBand = [...seen].filter((i) => cap.pos[i].z > 50 && cap.pos[i].z < 70)
    .map((i) => ({ key: cap.keys[i], x: +cap.pos[i].x.toFixed(1), z: +cap.pos[i].z.toFixed(1), y: +cap.pos[i].y.toFixed(2), deg: cap.adj[i].length }));
  const exit = LEVEL_13.gameplay.exit;
  const bi = cap.pos.reduce((b, p, i) => (((p.x - exit.x) ** 2 + (p.z - exit.z) ** 2) < (((cap.pos[b].x - exit.x) ** 2 + (cap.pos[b].z - exit.z) ** 2)) ? i : b), 0);
  return {
    groundNodes: seen.size,
    bannedDeckNodes: banned.size,
    maxZ, maxAt,
    bandReached: inBand,
    exitNode: { key: cap.keys[bi], x: +cap.pos[bi].x.toFixed(1), z: +cap.pos[bi].z.toFixed(1), y: +cap.pos[bi].y.toFixed(2) },
    groundReachesExit: seen.has(bi),
  };
}
