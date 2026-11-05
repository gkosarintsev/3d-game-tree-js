import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { frameAt, rotatePoint, unrotatePoint } from '../src/geo2d.js';
import { CONFIG } from '../src/config.js';
import { CITY_RAW } from './city-fixture.mjs';

const J = CONFIG.jsonMap;
const VERGE = J.lampOffset + 0.7;

const raw = structuredClone(CITY_RAW);
const expanded = expandCity(raw, {});
const norm = normalizeLevel(expanded);
const decks = norm.map.roads.filter(r => r.type === 'ground')
  .flatMap(r => r.decks.map(d => ({ id: r.id, d })));

/**
 * Точка внутри плана настила: у повёрнутого — своя рамка, у осевого — AABB.
 * Вдоль оси (`length`) граница строгая: стык пластины впритык к соседке лежит
 * ровно на общем торце, и инклюзивная проба считала бы его наложением.
 */
function hitsDeck(d, x, z) {
  // допуск 1 мм: координаты пластин округлены до 0,001 м, и торец впритык к
  // соседке может отличаться на миллиметр — это не наложение улицы на улицу
  if (d.yaw !== undefined) {
    const p = unrotatePoint(frameAt(d.cx, d.cz, d.yaw), x, z);
    return Math.abs(p.x - d.cx) < d.length / 2 - 0.002 && Math.abs(p.z - d.cz) <= d.width / 2 + 0.002;
  }
  return x > d.minX + 0.002 && x < d.maxX - 0.002 && z >= d.minZ - 0.002 && z <= d.maxZ + 0.002;
}

for (const dist of raw.city.districts) {
  const f = frameAt((dist.block.minX + dist.block.maxX) / 2, (dist.block.minZ + dist.block.maxZ) / 2, dist.yaw ?? 0);
  const hW = dist.street.width / 2;
  const edge = hW + VERGE;
  const lines = (min, max) => {
    const out = [];
    for (let v = Math.round((min + edge) * 2) / 2; v <= max - edge + 1e-6; v = Math.round((v + dist.street.pitch) * 2) / 2) out.push(v);
    return out;
  };
  const report = [];
  for (const [axis, linesMain, linesCross] of [['x', lines(dist.block.minZ, dist.block.maxZ), 'z'], ['z', lines(dist.block.minX, dist.block.maxX), 'x']]) {
    for (const cross of linesMain) {
      const lo = axis === 'x' ? dist.block.minX : dist.block.minZ;
      const hi = axis === 'x' ? dist.block.maxX : dist.block.maxZ;
      let gaps = [], runs = 0, doubles = 0;
      const dbl = new Set();
      let from = null;
      for (let t = lo; t <= hi + 1e-9; t = Math.round((t + 1) * 1000) / 1000) {
        const w = axis === 'x' ? rotatePoint(f, t, cross) : rotatePoint(f, cross, t);
        const here = decks.filter(({ d }) => hitsDeck(d, w.x, w.z));
        const n = here.length;
        if (n === 1) runs++;
        if (n > 1) { doubles++; dbl.add(`${t}: ${here.map(h => h.id).join(' + ')}`); }
        if (n === 0 && from === null) from = t;
        if (n !== 0 && from !== null) { gaps.push([from, t]); from = null; }
      }
      if (from !== null) gaps.push([from, hi]);
      const gapLen = gaps.reduce((a, g) => a + (g[1] - g[0]), 0);
      report.push(`${axis}@${cross}: покрытие ${runs} м, наложений ${doubles}, разрывы ${gaps.length} (${gapLen.toFixed(0)} м)`
        + (gaps.length && gaps.length > 3 ? ` ${JSON.stringify(gaps)}` : '')
        + (dbl.size ? `\n      doubles: ${[...dbl].slice(0, 3).join(' | ')}` : ''));
    }
  }
  console.log(`район ${dist.id} (yaw ${dist.yaw ?? 0}):`);
  console.log('  ' + report.join('\n  '));
}

function doubleCount(n) { return n; }
