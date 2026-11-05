// проба этапа 2: числа для журнала — нос против уровня улицы, уклон съезда,
// длина пролёта и цена профиля на сидах брифа
import fs from 'node:fs';
import { makeRng } from '../src/rng.js';
import { CONFIG } from '../src/config.js';
import { reliefOf } from '../src/relief.js';
import { TRACK_DEFAULTS, trackSpec, trackCenterline, trackProfile, trackToes, trackDeckAt } from '../tools/city.js';

const JJ = CONFIG.jsonMap;
const ring = (over = {}, seed = 20261105) => trackCenterline(trackSpec({ ...TRACK_DEFAULTS, ...over }), { rng: makeRng(seed), bump: () => {} });
const lvl12 = JSON.parse(fs.readFileSync('src/levels/level-12.json', 'utf8'));
const field12 = reliefOf({ ...lvl12.relief, baseY: 0 });
const SEEDS = [1, 7, 20261105, 42, 99991, 555, 2024, 31337];

let worstFit = 0, worstLabel = '', minSlope = Infinity, maxSlope = 0, minReach = Infinity, maxReach = 0;
let t0 = performance.now();
for (const seed of SEEDS) {
  const tr = ring({ entries: 3 }, seed);
  trackProfile(tr, field12, 0);
  for (const e of trackToes(tr, { field: field12, ground: { y: 0, size: 600 } })) {
    const fit = Math.abs(e.toe.top - (field12.heightAt(e.toe.x, e.toe.z) + JJ.streetRise));
    if (fit > worstFit) { worstFit = fit; worstLabel = `${seed}/${e.id}`; }
    minSlope = Math.min(minSlope, e.toe.slope); maxSlope = Math.max(maxSlope, e.toe.slope);
    minReach = Math.min(minReach, e.toe.reach); maxReach = Math.max(maxReach, e.toe.reach);
  }
}
const ms = performance.now() - t0;
console.log(`24 съезда на 8 сидах: ступень носа против улицы худшая ${worstFit.toFixed(4)} м (${worstLabel})`
  + ` | уклон ${minSlope.toFixed(4)}…${maxSlope.toFixed(4)} (grade ${JJ.maxSlope} — предел схемы)`
  + ` | пролёт ${minReach.toFixed(1)}…${maxReach.toFixed(1)} м`
  + ` | профиль+носы ${ms.toFixed(1)} мс на все 8 колец`);

// цена одного профиля и отметка полотна на шве
const tr = ring();
let p0 = performance.now();
const prof = trackProfile(tr, field12, 0);
const cost = performance.now() - p0;
console.log(`профиль: проб ${prof.n}, шаг ${prof.step.toFixed(3)} м, ${cost.toFixed(2)} мс, разброс требования ${prof.spread.toFixed(2)} м`
  + ` (бюджет grade·L/2 = ${(tr.spec.grade * tr.length / 2).toFixed(2)} м), уклон ≤ ${prof.maxSlope.toFixed(4)},`
  + ` зазор ≥ ${prof.minClear.toFixed(2)}, подвес ≤ ${prof.hang.toFixed(2)}`);
console.log('шов trackDeckAt:', trackDeckAt(tr, 0).toFixed(6), trackDeckAt(tr, tr.length).toFixed(6),
  trackDeckAt(tr, -0.5).toFixed(6), trackDeckAt(tr, tr.length * 2 + 0.25).toFixed(6));
