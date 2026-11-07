import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { splitLevel, stringifyStable, chunkOverlap } from '../tools/chunk-level.mjs';

const raw = JSON.parse(readFileSync(new URL('../probe/open-2km.json', import.meta.url), 'utf8'));
const map = normalizeLevel(expandCity(raw)).map;
console.log('overlap', chunkOverlap(), 'size', map.ground.size);
for (const chunk of [350, 200, 100]) {
  const t0 = Date.now();
  const { chunks, meta, indexMap } = splitLevel(map, { chunk, keep: 1, aheadMin: 40, aheadMax: 120, budgetMs: 8 });
  const ms = Date.now() - t0;
  const texts = chunks.map((c) => stringifyStable(c.map));
  const bytes = texts.reduce((s, t) => s + t.length, 0);
  const worldBytes = JSON.stringify(map).length;
  const empty = chunks.filter((c) => !Object.keys(c.counts).length).length;
  console.log(`chunk ${chunk}: клеток ${meta.cells} (пустых ${empty}), участников ${meta.participants}/${meta.owners} объектов, ` +
    `данных ${bytes} Б против мира ${worldBytes} Б (дубль ×${(bytes / worldBytes).toFixed(2)}), среднее ${Math.round(bytes / meta.cells)} Б, ` +
    `макс ${Math.max(...texts.map((t) => t.length))} Б, разрезка ${ms} мс`);
  const ownerCells = new Set(meta.ownerOf.values());
  console.log('   клеток-владельцев', ownerCells.size, '| index', stringifyStable(indexMap).length, 'Б | skeleton', indexMap.skeleton.nodes.length);
  const sample = chunks.find((c) => c.counts.buildings);
  console.log('   пример чанка', sample.id, 'bounds', JSON.stringify(sample.map.bounds), 'ground.size', sample.map.ground.size,
    'relief hills', sample.map.relief?.hills.length, 'spawn', JSON.stringify(sample.map.spawn));
}
