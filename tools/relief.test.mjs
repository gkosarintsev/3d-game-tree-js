/**
 * Автотест математики рельефа на Node: `node tools/relief.test.mjs`.
 *
 * Проверяет то, что должно быть верно до появления любой главы с холмами:
 * форма поля (монотонность, симметрия, ноль вне радиуса), его гладкость (нет
 * излома на краю холма и на границе площадки) и главный предел — крутизна
 * холма, из которой автор выбирает радиус.
 *
 * Сюита без браузера и без Three.js: `src/relief.js` — чистая арифметика, и её
 * же зовут парсер (Node) и карта (браузер). Отдельный прогон здесь дёшев, а
 * в браузерной сюите тот же модуль проверяется уже как опора, луч и сфера.
 */
import { reliefOf } from '../src/relief.js';
import { CONFIG } from '../src/config.js';

const J = CONFIG.jsonMap;
let passed = 0;
const failures = [];

function t(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ok  ${name}`);
  } catch (e) {
    failures.push(name);
    console.log(`FAIL  ${name}\n      ${e.message}`);
  }
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

function near(actual, expected, tol, message) {
  if (!(Math.abs(actual - expected) <= tol)) {
    throw new Error(`${message}: ожидалось ${expected} ± ${tol}, получено ${actual}`);
  }
}

const HILL = { x: 0, z: 0, radius: 200, height: 14 };
const flat = reliefOf({});
const hill = reliefOf({ baseY: 0, hills: [HILL] });

t('пустая секция — поле константно и не «присутствует»', () => {
  assert(!flat.present, 'поле без холмов и площадок помечено присутствующим');
  for (const [x, z] of [[0, 0], [300, -250], [-7, 12]]) {
    near(flat.heightAt(x, z), 0, 1e-12, `heightAt (${x}, ${z})`);
  }
  near(reliefOf({ baseY: 6 }).heightAt(1, 1), 6, 1e-12, 'baseY без холмов');
});

t('холм: плато на вершине, ноль за радиусом, ровно height между', () => {
  near(hill.heightAt(0, 0), 14, 1e-9, 'вершина');
  near(hill.heightAt(HILL.radius, 0), 0, 1e-12, 'за краем радиуса');
  near(hill.heightAt(HILL.radius / 2, 0), 7, 1e-9, 'середина радиуса — половина высоты (ease(0,5) = 0,5)');
});

t('холм симметричен и монотонен: чем ближе к вершине, тем выше', () => {
  for (const d of [10, 60, 120, 199]) {
    for (const k of [1, -1, 90, 180, 270]) {
      const a = Math.PI * k / 180;
      near(hill.heightAt(d * Math.cos(a), d * Math.sin(a)), hill.heightAt(d, 0), 1e-9, `отступ ${d} м, сектор ${k}°`);
    }
  }
  let prev = hill.heightAt(199, 0);
  for (let d = 198; d >= 0; d -= 2) {
    const h = hill.heightAt(d, 0);
    assert(h >= prev, `уклон назад на ${d} м: ${h} < ${prev}`);
    prev = h;
  }
});

t('край холма без излома: производная на плато, у границы и снаружи — ноль', () => {
  near(hill.slopeAt(0, 0).mag, 0, 1e-6, 'уклон на вершине');
  // за 0,5 м до края радиуса 200 м производная `ease` уже 1,5·(0,5/200)²·… ≈ 1e-3:
  // сравниваем с нулём в том же порядке, а не бесконечно малым допуском
  near(hill.slopeAt(HILL.radius - 0.5, 0).mag, 0, 5e-3, 'уклон у самого края');
  near(hill.slopeAt(HILL.radius + 5, 0).mag, 0, 1e-12, 'уклон за холмом');
  const jump = Math.abs(hill.heightAt(HILL.radius + 1e-3, 0) - hill.heightAt(HILL.radius - 1e-3, 0));
  assert(jump < 1e-6, `ступенька на границе радиуса: ${jump} м`);
});

t('гряда (капсула с двумя концами) не даёт седла между концами', () => {
  const ridge = reliefOf({ hills: [{ x: -150, z: 0, bx: 150, bz: 0, radius: 120, height: 10 }] });
  near(ridge.heightAt(0, 0), 10, 1e-9, 'середина гряды — полная высота');
  near(ridge.heightAt(-150, 0), 10, 1e-9, 'левый конец');
  near(ridge.heightAt(150, 0), 10, 1e-9, 'правый конец');
  assert(ridge.heightAt(0, 120) === 0, 'за боковой границей гряды холм не ноль');
});

t('долина — тот же холм с отрицательной высотой', () => {
  const r = reliefOf({ hills: [{ x: 0, z: 0, radius: 150, height: -4 }] });
  near(r.heightAt(0, 0), -4, 1e-9, 'дно провала');
  near(r.heightAt(150, 0), 0, 1e-12, 'край провала — уровень земли');
  assert(r.heightAt(60, 0) < 0, 'склон провала выше нуля');
});

t('площадка: ядро — ровно её отметка, переходная зона — между, за ней — природа', () => {
  const pad = { minX: -20, maxX: 20, minZ: -10, maxZ: 10, y: 8 };
  const r = reliefOf({
    baseY: 3,
    hills: [{ x: 400, z: 0, radius: 120, height: 6 }],
    pads: [pad],
    blend: 10,
  });
  near(r.heightAt(0, 0), 8, 1e-12, 'в ядре площадки');
  // за кольцом blend поле обязано остаться природой: сравниваем с её же
  // отметкой в той же точке, а не с числом — холм рядом наклоняет природу
  near(r.heightAt(0, 20), r.reliefHeightAt(0, 20), 1e-12, 'за пределами blend — природа');
  const nature = r.reliefHeightAt(0, 15);
  const mid = r.heightAt(0, 15);
  assert(mid > nature && mid < 8, `в переходной зоне expected (${nature}; 8), получено ${mid}`);
  assert(r.padsAt(0, 0)[0].weight === 1, 'вес в ядре площадки не 1');
  assert(r.padsAt(0, 40).length === 0, 'далеко от площадки есть влияние');
});

t('повёрнутая площадка держит отметку в мировых координатах', () => {
  const r = reliefOf({
    pads: [{ minX: -30, maxX: 30, minZ: -10, maxZ: 10, y: 5, yaw: 45 }],
    blend: 4,
  });
  near(r.heightAt(0, 0), 5, 1e-12, 'центр повёрнутой площадки');
  const tip = 30 * Math.cos(Math.PI / 4);
  near(r.heightAt(tip, tip), 5, 1e-9, 'дальний угол повёрнутого ядра');
  assert(r.heightAt(tip + 3, tip + 3) < 5 - 1e-6, `за углом площадки (${tip + 3}, ${tip + 3}) всё ещё её отметка`);
});

t('высшая площадка не тонет в низкой: ни провала, ни седла', () => {
  const r = reliefOf({
    pads: [
      { minX: -40, maxX: 40, minZ: -40, maxZ: 40, y: 2 },
      { minX: -5, maxX: 5, minZ: -5, maxZ: 5, y: 9 },
    ],
    blend: 6,
  });
  near(r.heightAt(0, 0), 9, 1e-12, 'в ядре высшей площадки');
  near(r.heightAt(-30, 0), 2, 1e-12, 'в ядре низшей площадки');
  let prev = r.heightAt(-30, 0);
  for (let x = -29; x <= 0; x++) {
    const h = r.heightAt(x, 0);
    assert(h >= prev - 1e-9, `провал профиля между площадками на x = ${x}: ${h} < ${prev}`);
    prev = h;
  }
});

t('нормаль поля — единичная, вверх, и согласована с уклоном', () => {
  const at = hill.normalAt(HILL.radius / 2, 0);
  near(Math.hypot(at.x, at.y, at.z), 1, 1e-9, 'длина нормали');
  assert(at.y > 0, 'нормаль смотрит вниз');
  const s = hill.slopeAt(HILL.radius / 2, 0);
  near(-s.dx, at.x / at.y, 1e-9, 'наклон нормали против dx поля');
  near(hill.normalAt(0, 0).y, 1, 1e-12, 'нормаль на плато — вертикаль');
});

t('крутизна холма = 1,5 · height / radius на половине радиуса', () => {
  // из этого предела автор выбирает радиус: 14 м холму при J.relief.maxSlope 0,12
  // нужно не меньше 1,5 · 14 / 0,12 = 175 м, иначе валидатор бракает поле
  const want = 1.5 * HILL.height / HILL.radius;
  near(hill.slopeAt(HILL.radius / 2, 0).mag, want, 0.01, 'предельный уклон холма');
  assert(want <= J.relief.maxSlope, `холм ${HILL.height} м при r ${HILL.radius} м круче предела рельефа ${J.relief.maxSlope}`);
});

console.log(`\n${passed}/${passed + failures.length} проверок зелёные`);
if (failures.length) {
  console.log(`провалено: ${failures.join(', ')}`);
  process.exitCode = 1;
}
