/**
 * Куда уходит цена пробы поля на тех же точках, что берёт бюджет главы в
 * браузере (рассыпной шаг `i · 7,13`). Разложение нужно, чтобы решать не
 * «поднять порог», а «что именно дорого»: индекс (два хеш-поиска), холмы или
 * площадки с их кольцами blend.
 */
import { reliefOf } from '../src/relief.js';
import { LEVEL_12 } from '../src/levels/level-12.js';

const spec = LEVEL_12.map.relief;
const half = LEVEL_12.map.ground.size / 2;
const pts = [];
for (let i = 0; i < 2000; i++) {
  pts.push([-half + (i * 7.13) % (2 * half), -half + (i * 11.77) % (2 * half)]);
}

function time(label, fn) {
  let best = Infinity;
  for (let pass = 0; pass < 8; pass++) {
    const t0 = process.hrtime.bigint();
    let acc = 0;
    for (const [x, z] of pts) acc += fn(x, z);
    // `acc` обязан дожить до конца прогона: иначе V8 выбросит весь цикл как
    // бесполезный. Сравнение с заведомо недостижимым значением — наблюдатель,
    // а не проверка результата
    if (acc === -1) throw new Error('!');
    best = Math.min(best, Number(process.hrtime.bigint() - t0) / 1e3 / pts.length);
  }
  console.log(`  ${label}: ${best.toFixed(3)} мкс/проба`);
  return best;
}

const full = reliefOf(spec);
const hillsOnly = reliefOf({ ...spec, pads: [] });
const padsOnly = reliefOf({ ...spec, hills: [] });
const empty = reliefOf({ baseY: spec.baseY, hills: [], pads: [] });

console.log('поле главы 12 на точках бюджета (холмов ' + spec.hills.length + ', площадок ' + (spec.pads ?? []).length + '):');
const a = time('heightAt (полное)', (x, z) => full.heightAt(x, z));
time('только холмы (без площадок)', (x, z) => hillsOnly.reliefHeightAt(x, z));
time('только площадки (без холмов)', (x, z) => padsOnly.heightAt(x, z));
time('пустое поле: вызов + два хеш-поиска + baseY', (x, z) => empty.heightAt(x, z));
const zero = time('пустой вызов (только вызов функции)', () => 1);
console.log(`  стоимость поля над пустым вызовом: ${(a - zero).toFixed(3)} мкс`);
