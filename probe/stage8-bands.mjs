import { LEVEL_12 } from '../src/levels/level-12.js';
const g = new Map();
for (const r of LEVEL_12.map.roads) {
  const d = (r.id ?? '').split('_')[0];
  const e = g.get(d) ?? { xs: [], zs: [], n: 0, other: 0 };
  g.set(d, e);
  for (const dk of r.decks) {
    e.n++;
    if (dk.axis === 'x') e.zs.push([dk.minZ, dk.maxZ]);
    else e.xs.push([dk.minX, dk.maxX]);
  }
}
for (const [d, e] of g) {
  const band = a => a.map(b => `${b[0].toFixed(1)}…${b[1].toFixed(1)}`).join(' ');
  console.log(`${d}: настилов ${e.n}`);
  console.log(`  улицы вдоль X (полосы по Z): ${band(e.zs)}`);
  console.log(`  улицы вдоль Z (полосы по X): ${band(e.xs)}`);
}
