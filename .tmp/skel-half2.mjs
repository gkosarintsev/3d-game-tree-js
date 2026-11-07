import { readFileSync } from 'node:fs';
import { generateCatalog } from '../tools/build-level.mjs';
import { skeletonOf } from '../tools/skeleton.mjs';
import { SurfaceField } from '../src/surfaces.js';

function axis(field) {
  let km = 0, decks = 0;
  for (const road of field.roads) {
    if (road.type === 'skybridge') continue;
    for (const d of road.decks ?? []) {
      km += d.arc ? Math.abs(d.R * d.span * Math.PI / 180) : (typeof d.length === 'number' ? d.length
        : d.axis === 'z' ? d.maxZ - d.minZ : d.maxX - d.minX);
      decks++;
    }
  }
  for (const d of field.descents) { km += d.axis === 'z' ? d.plan.maxZ - d.plan.minZ : d.plan.maxX - d.plan.minX; decks++; }
  return { km: km / 1000, decks };
}
const base = JSON.parse(readFileSync('probe/open-2km.json', 'utf8'));
base.kind = 'open';
base.stream = { chunk: 350, keep: 1, aheadMin: 300, aheadMax: 900, budgetMs: 8 };
const world = generateCatalog(structuredClone(base), 'probe/open-2km.json').worldMap;
const west = {
  ...world,
  roads: world.roads.map(r => ({ ...r, decks: (r.decks ?? []).filter(d => d.minX < 0) })).filter(r => r.decks.length),
  buildings: world.buildings.filter(b => (b.bounds?.minX ?? 0) < 0),
};
const f = new SurfaceField(world); f.collectData();
const fw = new SurfaceField(west); fw.collectData();
const a = axis(f), b = axis(fw);
const sk = skeletonOf(world), skw = skeletonOf(west);
console.log(`осей ${a.km.toFixed(2)} км в ${a.decks} настилаx → узлов ${sk.meta.nodes}`);
console.log(`осей ${b.km.toFixed(2)} км (${(b.km / a.km).toFixed(3)}) в ${b.decks} настилов → узлов ${skw.meta.nodes} (${(skw.meta.nodes / sk.meta.nodes).toFixed(3)})`);
console.log(`двери: ${fw.buildings.reduce((s, x) => s + (x.doors?.length ?? 0), 0)} против ${f.buildings.reduce((s, x) => s + (x.doors?.length ?? 0), 0)}`);
