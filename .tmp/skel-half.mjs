import { readFileSync } from 'node:fs';
import { generateCatalog } from '../tools/build-level.mjs';
import { skeletonOf } from '../tools/skeleton.mjs';

const base = JSON.parse(readFileSync('probe/open-2km.json', 'utf8'));
base.kind = 'open';
base.stream = { chunk: 350, keep: 1, aheadMin: 300, aheadMax: 900, budgetMs: 8 };
const world = generateCatalog(structuredClone(base), 'probe/open-2km.json').worldMap;
const full = skeletonOf(world);
const t0 = performance.now();
const west = {
  ...world,
  roads: world.roads.map(r => ({ ...r, decks: (r.decks ?? []).filter(d => d.minX < 0) })).filter(r => r.decks.length),
  buildings: world.buildings.filter(b => (b.bounds?.minX ?? 0) < 0),
};
const half = skeletonOf(west);
console.log(`целый мир: ${full.meta.nodes} узлов, ${full.meta.edges} рёбер, компонент ${full.meta.components.after}`);
console.log(`запад той же плиты: ${half.meta.nodes} узлов (${(half.meta.nodes / full.meta.nodes).toFixed(3)} от целого),`
  + ` рёбер ${half.meta.edges}, компонент ${half.meta.components.after}, построение ${Math.round(performance.now() - t0)} мс`);
