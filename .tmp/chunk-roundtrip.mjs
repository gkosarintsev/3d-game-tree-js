import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { splitLevel, planOf, chunkOverlap } from '../tools/chunk-level.mjs';

const raw = JSON.parse(readFileSync(new URL('../probe/open-2km.json', import.meta.url), 'utf8'));
const map = normalizeLevel(expandCity(raw)).map;
const { chunks, meta } = splitLevel(map, { chunk: 350, keep: 1, aheadMin: 40, aheadMax: 120, budgetMs: 8 });
const overlap = chunkOverlap();

// координатные пути в мире vs заявленные локализатором
const COORD = /^(x|z|minX|maxX|minZ|maxZ|cx|cz|bx|bz|lo|hi|cross|u0|u1|v0|v1)$/;
const paths = new Set();
(function walk(v, path) {
  if (Array.isArray(v)) return v.forEach((x) => walk(x, path.replace(/\[]$/, '[]')));
  if (!v || typeof v !== 'object') return;
  for (const [k, val] of Object.entries(v)) {
    if (typeof val === 'number' && COORD.test(k)) paths.add(`${path}.${k}`);
    else if (val && typeof val === 'object') walk(val, `${path}.${k}`);
  }
})(map, '');
const claimed = new Map();
for (const c of chunks) for (const [p, why] of c.claimed) claimed.set(p, why);
const unclaimed = [...paths].filter((p) => !claimed.has(p) && !p.includes('.scale.'));
console.log('координатных путей в мире', paths.size, '| заявлено', claimed.size, '| без правила:', unclaimed.join(', ') || 'нет');

// круг: планы участника в чанке +origin == планы мира
let bad = 0, checked = 0, missing = 0;
for (const collection of ['buildings', 'roads', 'channels', 'props', 'lights']) {
  const world = new Map((map[collection] ?? []).map((o) => [o.id, o]));
  for (const [id, obj] of world) {
    const want = planOf(collection, obj).rects;
    checked++;
    const got = [];
    let ownerFlags = 0;
    for (const c of chunks) {
      const copy = (c.map[collection] ?? []).find((o) => o.id === id);
      if (!copy) continue;
      if (copy.owner) ownerFlags++;
      const origin = c.cell.origin;
      for (const r of planOf(collection, copy).rects) {
        got.push({ minX: r.minX + origin.x, maxX: r.maxX + origin.x, minZ: r.minZ + origin.z, maxZ: r.maxZ + origin.z });
      }
    }
    if (ownerFlags !== 1) { console.log(`! ${collection}/${id}: флагов владения ${ownerFlags}`); bad++; continue; }
    for (const w of want) {
      // каждая часть плана мира обязана быть покрыта копиями с точностью 1e-6
      const cover = got.some((g) => Math.abs(g.minX - w.minX) < 1e-5 && Math.abs(g.maxX - w.maxX) < 1e-5
        && Math.abs(g.minZ - w.minZ) < 1e-5 && Math.abs(g.maxZ - w.maxZ) < 1e-5);
      if (!cover) { console.log(`! ${collection}/${id}: часть ${JSON.stringify(w)} не воспроизведена ни в одной копии`, JSON.stringify(got.slice(0, 3))); bad++; break; }
    }
    // участие: клетка обязана быть в списке тогда и только тогда, когда её
    // вырощенный прямоугольник пересекает план
    const grownCells = chunks.filter((c) => want.some((r) => overlapHits(c.cell.rect, r, overlap))).map((c) => c.id).sort();
    const gotCells = chunks.filter((c) => (c.map[collection] ?? []).some((o) => o.id === id)).map((c) => c.id).sort();
    if (grownCells.join() !== gotCells.join()) { console.log(`! ${collection}/${id}: участие ${gotCells.join()} != ожидаемое ${grownCells.join()}`); bad++; }
    missing += got.length ? 0 : 1;
  }
}
function overlapHits(a, b, m) {
  return a.minX - m <= b.maxX && b.minX <= a.maxX + m && a.minZ - m <= b.maxZ && b.minZ <= a.maxZ + m;
}
console.log(`объектов ${checked}, расхождений ${bad}`);
