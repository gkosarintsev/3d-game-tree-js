/**
 * Зонд сетки улиц главы 10 (этап 0 плана `docs/level12-relief-plan.md`).
 *
 * Три вещи, которые по этому зонду проектируются, а не угадываются:
 *
 * 1. **наложения со-плоскостных настилов** — нарушение правила AGENTS про
 *    со-плоскостные грани и одновременно доказательство, что перекрёстка как
 *    объекта нет: `emitStreet` кладёт полосу на всю длину линии, и встречная её
 *    не режет;
 * 2. **сетка осей района** — где законный перекрёсток (этап 6 отдаёт туда одну
 *    пластину вместо двух пересекающихся полос);
 * 3. **носы подъёмов** — куда приходит низ рампы и есть ли там наземный настил
 *    (этап 7 делает это правилом валидатора).
 *
 * Запуск: `node probe/street-grid.mjs`. Ничего не пишет.
 */
import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';

const EPS = 0.01;

const raw = JSON.parse(readFileSync(new URL('../src/levels/level-10.json', import.meta.url), 'utf8'));
const level = normalizeLevel(expandCity(structuredClone(raw)));
const groundY = level.map.ground.y;
const roads = level.map.roads;
const decks = roads.flatMap(r => r.decks.map(d => ({ ...d, road: r })));

// ------------------------------------------------ 1. отметки настилов и наложения

const byLevel = new Map();
for (const d of decks) {
  const key = Math.abs(d.topY - groundY) < EPS ? groundY : d.topY;
  byLevel.set(key, (byLevel.get(key) ?? 0) + 1);
}
console.log(`настилов — ${decks.length}, дорог — ${roads.length}, отметок верха — ${byLevel.size}`);
for (const [y, n] of [...byLevel].sort((a, b) => a[0] - b[0])) {
  console.log(`  y = ${String(y).padStart(7)}: ${n}`);
}

let pairs = 0;
let area = 0;
const overlaps = [];
for (let i = 0; i < decks.length; i++) {
  for (let j = i + 1; j < decks.length; j++) {
    const a = decks[i];
    const b = decks[j];
    if (Math.abs(a.topY - b.topY) > EPS) continue;
    const dx = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX);
    const dz = Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ);
    if (dx <= EPS || dz <= EPS) continue;
    pairs++;
    area += dx * dz;
    overlaps.push(`${a.road.id} x ${b.road.id} — ${dx.toFixed(1)} x ${dz.toFixed(1)} m`);
  }
}
console.log(`\nпар перекрывающихся со-плоскостных настилов — ${pairs}, площадь — ${area.toFixed(0)} m2`);
for (const line of overlaps.slice(0, 8)) console.log(`  ${line}`);
if (overlaps.length > 8) console.log(`  ... и ещё ${overlaps.length - 8}`);

// --------------------------------------------------- 2. сетка осей по брифу района

console.log('\nоси районов (бриф):');
for (const dist of raw.city.districts) {
  const bl = dist.block;
  const pitch = dist.street.pitch;
  const linesZ = Math.floor((bl.maxX - bl.minX) / pitch) + 1;
  const linesX = Math.floor((bl.maxZ - bl.minZ) / pitch) + 1;
  console.log(
    `  ${dist.id.padEnd(5)}: ${linesZ} x ${linesX}, перекрёстков внутри — `
    + `${(linesZ - 1) * (linesX - 1)}, шаг ${pitch} м, ширина ${dist.street.width} м`,
  );
}

// --------------------------------------------- 3. носы подъёмов против наземных улиц

const streetDecks = decks.filter(d => d.road.type === 'ground');
/** Расстояние от точки до плана настила; ноль — точка лежит на настиле. */
function gapTo(x, z, list) {
  let best = Infinity;
  for (const d of list) {
    const dx = Math.max(d.minX - x, 0, x - d.maxX);
    const dz = Math.max(d.minZ - z, 0, z - d.maxZ);
    best = Math.min(best, Math.hypot(dx, dz));
  }
  return best;
}

console.log('\nносы подъёмов (низ рампы) и ближайший наземный настил:');
for (const road of roads.filter(r => r.type !== 'ground' && r.type !== 'skybridge')) {
  for (const d of road.decks) {
    if (!d.ramp) continue;
    const upAtMax = d.topAtMax > d.topAtMin;
    const x = d.axis === 'x' ? (upAtMax ? d.minX : d.maxX) : (d.minX + d.maxX) / 2;
    const z = d.axis === 'z' ? (upAtMax ? d.minZ : d.maxZ) : (d.minZ + d.maxZ) / 2;
    const gap = gapTo(x, z, streetDecks);
    console.log(
      `  ${road.id.padEnd(12)} низ у (${x.toFixed(0)}, ${z.toFixed(0)})`
      + `, до улицы — ${gap === Infinity ? '-' : `${gap.toFixed(1)} м`}${gap > 1 ? '  << не на дороге' : ''}`,
    );
  }
}
