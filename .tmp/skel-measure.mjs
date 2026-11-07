// Мера скелета по фикстуре — временный файл, в репозиторий не едет.
import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { skeletonOf } from '../tools/skeleton.mjs';
import { stringifyStable } from '../tools/chunk-level.mjs';

const file = process.env.SK_FIXTURE ?? 'probe/open-2km.json';
const raw = JSON.parse(readFileSync(file, 'utf8'));
let t = Date.now();
const map = normalizeLevel(expandCity(structuredClone(raw))).map;
const tNorm = Date.now() - t;
t = Date.now();
const sk = skeletonOf(map, {
  step: process.env.SK_STEP ? Number(process.env.SK_STEP) : undefined,
  gap: process.env.SK_GAP ? Number(process.env.SK_GAP) : undefined,
});
const tSkel = Date.now() - t;
const code = stringifyStable({ nodes: sk.nodes, edges: sk.edges });
const m = sk.meta;
console.log(JSON.stringify({
  file, plate: map.ground.size, ...m.ms, step: m.step, gap: m.gap,
  nodes: m.nodes, edges: m.edges, cands: m.cands, checks: m.checks, rejected: m.rejected,
  joined: m.joined, longestJoin: m.longestJoin, comps: m.components,
  missingCount: m.covered.missingCount, coveredTotal: m.covered.total,
}, null, 1));
console.log('islands:', JSON.stringify(m.islands.map(v => ({
  size: v.size, y: v.y, top: v.top, nearest: v.nearest,
}))));
console.log('index.js skeleton bytes:', code.length);
