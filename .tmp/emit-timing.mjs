import { readFileSync } from 'node:fs';
import { generateCatalog } from '../tools/build-level.mjs';
const base = JSON.parse(readFileSync('probe/open-2km.json', 'utf8'));
base.kind = 'open';
base.stream = { chunk: 350, keep: 1, aheadMin: 300, aheadMax: 900, budgetMs: 8 };
let back;
for (const r of [1, 2]) {
  const t0 = performance.now();
  const g = generateCatalog(structuredClone(base), 'probe/open-2km.json', r === 2 ? { reverse: true } : {});
  const ms = Math.round(performance.now() - t0);
  console.log(`прогон ${r}${r === 2 ? ' (reverse)' : ''}: ${ms} мс, файлов ${g.files.length}, index ${g.files[0].code.length} Б, узлов ${g.meta.skeleton.nodes}, рёбер ${g.meta.skeleton.edges}, компонент ${g.meta.skeleton.components.before}→${g.meta.skeleton.components.after}`);
  if (r === 1) global.f = g; else back = g;
}
const diff = back.files.filter((f, i) => f.code !== global.f.files[i].code).map(f => f.path);
console.log('разошедшихся файлов при обратном обходе:', diff.length, diff.slice(0, 4).join(', '));
