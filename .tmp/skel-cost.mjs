import { readFileSync } from 'node:fs';
import { generateCatalog } from '../tools/build-level.mjs';
import { skeletonOf, SKELETON_STEP } from '../tools/skeleton.mjs';
import { SurfaceField } from '../src/surfaces.js';

const base = JSON.parse(readFileSync('probe/open-2km.json', 'utf8'));
base.kind = 'open';
base.stream = { chunk: 350, keep: 1, aheadMin: 300, aheadMax: 900, budgetMs: 8 };

function axisLength(field) {
  let km = 0, chains = 0;
  for (const road of field.roads) {
    if (road.type === 'skybridge') continue;
    for (const d of road.decks ?? []) {
      const chain = field.deckChain(d, SKELETON_STEP) ?? [];
      if (chain.length < 2) { km += SKELETON_STEP / 2; chains++; continue; }
      let len = 0;
      for (let i = 1; i < chain.length; i++) len += Math.hypot(chain[i].x - chain[i - 1].x, chain[i].z - chain[i - 1].z);
      km += len; chains++;
    }
  }
  for (const d of field.descents) {
    const chain = field.descentChain(d, SKELETON_STEP);
    if (!chain || chain.length < 2) continue;
    let len = 0;
    for (let i = 1; i < chain.length; i++) len += Math.hypot(chain[i].x - chain[i - 1].x, chain[i].z - chain[i - 1].z);
    km += len; chains++;
  }
  return { km: km / 1000, chains };
}

const full = generateCatalog(structuredClone(base), 'probe/open-2km.json');
for (const size of [1400, 2000]) {
  const map = full.worldMap;
  map.ground.size = size;
  const t0 = performance.now();
  const sk = skeletonOf(map);
  const ms = Math.round(performance.now() - t0);
  const f = new SurfaceField(map); f.collectData();
  const ax = axisLength(f);
  console.log(`плита ${size} м (${(size * size / 1e6).toFixed(2)} км²): узлов ${sk.meta.nodes} рёбер ${sk.meta.edges} компонент ${sk.meta.components.after}`
    + ` | осей ${ax.km.toFixed(2)} км в ${ax.chains} цепочках | узлов/км ${(sk.meta.nodes / ax.km).toFixed(0)}`
    + ` | построение ${ms} мс (фазы ${JSON.stringify(sk.meta.ms)})`);
}
