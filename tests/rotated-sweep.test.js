/**
 * Автотесты дуг полотна — v2 генератора города (`docs/city-v2-plan.md`, этап 4).
 *
 * Дуга — кольцевой сектор с продольным уклоном и поперечным креном: дорога
 * поднимается и одновременно поворачивает. Проверяется ровно то, из-за чего этап
 * и заводился: верх полотна считается по углу и радиусу (а не по AABB), несущая
 * способность и выталкивание сферы живут в секторе, тело самоходом проходит
 * подъём и спуск, а пустой угол габарита и внутреннее отверстие кольца остаются
 * пустыми — фантома, запрещённого правилом AGENTS, нет.
 *
 * Арифметика сверки здесь своя (косинус, синус и atan2 в лоб, без `geo2d`):
 * общее выражение не поймало бы ошибку знака или центра развёртки — оно бы её
 * только повторяло. Сверяется она с **константами модуля**, а не с брифом: парсер
 * пишет их через `r3` (миллиметры), и крен 6° лежит в модуле как 0,105, а не
 * 0,105104. Поэтому сначала проверяется, что модуль несёт именно округлённый
 * бриф (допуск 0,5 мм), а уже потом формула сверяется с этими числами впритык.
 *
 * Запуск в браузере (через консоль страницы игры, где есть importmap):
 *   const m = await import('/tests/rotated-sweep.test.js?v=1');
 *   await m.runRotatedSweepTests();
 *
 * Проверяются сценарии:
 *   1. Бриф v2 с дугой проходит схему и нормализатор без предупреждений, сектор
 *      доходит до данных карты, карта держит sweep и отдаёт его верх через topAt;
 *   2. Верх дуги совпадает с независимой формулой по всему сектору, включая крен;
 *   3. Опора есть только в секторе: за бортом, во внутреннем отверстии и вне
 *      развёртки — земля, хотя габарит эти точки накрывает;
 *   4. Полотно выше шага ноги не прячет асфальт под собой: с земли опора — грунт,
 *      с отметки полотна — сама дуга;
 *   5. Сфера на дуге выходит по точной грани, в плите — по наименьшей глубине, а
 *      в пустом углу габарита и в отверстии кольца её не трогают;
 *   6. Тело-сфера самоходом проходит подъём и спуск дуги, не уходя с полотна;
 *   7. Главы 9 и 10 не вошли в ветку дуг: sweeps пуст, topAt отвечает null.
 */
import { createJsonMap } from '../src/json-map.js';
import { LEVEL_09 } from '../src/levels/level-09.js';
import { LEVEL_10 } from '../src/levels/level-10.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { validateLevel, LEVEL_SPEC_V2 } from '../tools/level-schema.mjs';
import { CONFIG } from '../src/config.js';

const J = CONFIG.jsonMap;
const DEG = Math.PI / 180;

// ------------------------------------------------------------------ бриф v2

/**
 * Развязка одной дугой: подъём с земли на 12 м за 215°, крен 6°, перила. Радиус
 * 40 м и полотно 8 м — те же числа, что у развязки главы 11. Точка B стоит на
 * полотне посередине развёртки, спавн — на земле в стороне.
 */
const ARC = {
  cx: 0, cz: 0, radius: 40, from: 0, to: 215,
  width: 8, y: [0.12, 12], bank: 6, rails: true,
};

/** Точка сектора в мире: своя тригонометрия, без `geo2d`. */
const P = (arc, deg, rho = arc.radius) => ({
  x: arc.cx + Math.cos(deg * DEG) * rho,
  z: arc.cz + Math.sin(deg * DEG) * rho,
});

/** Верх полотна на угле `deg` и радиусе `rho`: уклон по углу, крен по отступу. */
const surface = (arc, deg, rho = arc.radius) => {
  const t = (deg - arc.from) / (arc.to - arc.from);
  return arc.y[0] + (arc.y[1] - arc.y[0]) * t + Math.tan(arc.bank * DEG) * (rho - arc.radius);
};

const EXIT = P(ARC, (ARC.from + ARC.to) / 2);

/** Округление парсера `r3`: модуль несёт константы дуги в миллиметрах. */
const R3 = v => Math.round(v * 1000) / 1000;

/** Верх дуги по константам данных карты: та же независимая формула, но на `d`. */
const surfaceOf = (d, deg, rho = d.R) =>
  d.y0 + (d.y1 - d.y0) * (deg - d.a0) / (d.a1 - d.a0) + d.tanBank * (rho - d.R);

const RAW = {
  kind: 'json2',
  metadata: { levelName: 'V2Sweep', name: 'Дуга развязки', hint: '—', units: 'meters' },
  ground: { y: 0, size: 200, color: '#23262c' },
  roads: [{ id: 'rp_arc', type: 'bridge', width: 8, elements: [{ arc: ARC }] }],
  buildings: [], landscapeObjects: [], lights: [],
  gameplay: { goal: 'exit', spawn: { x: 0, z: 60 }, exit: { x: EXIT.x, z: EXIT.z }, exitRadius: 4 },
};

let built = null;

function builtMap() {
  if (!built) {
    const level = normalizeLevel(structuredClone(RAW));
    built = { level, map: createJsonMap(level.map) };
  }
  return built.map;
}

/** Дуга в данных модуля: константы, по которым карта отвечает. */
function deckInfo() {
  builtMap();
  return built.level.map.roads[0].decks[0];
}

// ------------------------------------------------------------------- проверки

function testBrief() {
  const { errors, warnings } = validateLevel(structuredClone(RAW), LEVEL_SPEC_V2);
  const level = normalizeLevel(structuredClone(RAW));
  const map = builtMap();
  const bad = [];
  if (errors.length) bad.push(`схема: ${errors.join(' | ')}`);
  if (warnings.length) bad.push(`предупреждения схемы: ${warnings.join(' | ')}`);
  if (level.warnings.length) bad.push(`предупреждения парсера: ${level.warnings.join(' | ')}`);
  const d = level.map.roads[0].decks[0];
  if (!d.arc) bad.push('дуга не помечена в данных карты');
  if (d.R !== ARC.radius || d.span !== ARC.to - ARC.from) bad.push(`сектор ${d.R}/${d.span}`);
  // константы модуля — округлённый бриф: по ним и сверяется формула в следующих тестах
  const wantTan = R3(Math.tan(ARC.bank * DEG));
  if (d.y0 !== R3(ARC.y[0]) || d.y1 !== R3(ARC.y[1])) bad.push(`отметки ${d.y0}→${d.y1}`);
  if (d.tanBank !== wantTan) bad.push(`крен ${d.tanBank} вместо ${wantTan}`);
  if (d.halfW !== ARC.width / 2) bad.push(`полуширина ${d.halfW}`);
  if (d.a0 !== ARC.from || d.a1 !== ARC.to) bad.push(`углы ${d.a0}→${d.a1}`);
  if (map.sweeps.length !== 1) bad.push(`sweeps: ${map.sweeps.length}`);
  const mid = P(ARC, 90);
  const top = map.topAt(mid.x, mid.z);
  if (top === null || Math.abs(top - surfaceOf(d, 90)) > 1e-9) bad.push(`topAt на середине: ${top}`);
  if (map.topAt(200, 200) !== null) bad.push('topAt ответил вне дуги');
  return {
    name: 'Бриф v2: дуга принята, сектор дошёл до карты, sweep отдаёт верх через topAt',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ')
      : `дуга R ${ARC.radius} м, ${d.span}°, верх 0,12→12 м, крен 6°; отметка середины ${top.toFixed(3)} м`,
  };
}

function testTopAccuracy() {
  const map = builtMap();
  const d = deckInfo();
  const bad = [];
  let probes = 0, worst = 0;
  for (let deg = 2; deg <= 213; deg += 7) {
    for (const rho of [36.2, 38, 40, 42.4, 43.8]) {
      const p = P(ARC, deg, rho);
      const got = map.topAt(p.x, p.z);
      const want = surfaceOf(d, deg, rho);
      if (got === null) { bad.push(`угол ${deg}, радиус ${rho}: опоры нет`); continue; }
      const err = Math.abs(got - want);
      worst = Math.max(worst, err);
      probes++;
      if (err > 1e-9) bad.push(`угол ${deg}, радиус ${rho}: ${got.toFixed(6)} вместо ${want.toFixed(6)}`);
    }
  }
  // крен обязан поднимать внешний край: на одном угле разница радиусов 6 м
  const pi = P(ARC, 90, 37), po = P(ARC, 90, 43);
  const inner = map.topAt(pi.x, pi.z);
  const outer = map.topAt(po.x, po.z);
  const wantBank = d.tanBank * 6;
  if (Math.abs((outer - inner) - wantBank) > 1e-9) {
    bad.push(`крен по ширине ${(outer - inner).toFixed(4)} вместо ${wantBank.toFixed(4)}`);
  }
  return {
    name: 'Верх дуги совпадает с независимой формулой по всему сектору, включая крен',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${probes} проб, худшее расхождение ${worst.toExponential(1)} м; крен ${wantBank.toFixed(3)} м на 6 м`,
  };
}

function testSupportSectorOnly() {
  const map = builtMap();
  const d = deckInfo();
  const bad = [];
  // внутри сектора опора — плоскость полотна
  for (const [deg, rho] of [[10, 40], [90, 36.5], [150, 43.5], [210, 40]]) {
    const p = P(ARC, deg, rho);
    const g = map.groundHeightAt(p.x, p.z, 500);
    const want = surfaceOf(d, deg, rho);
    if (Math.abs(g - want) > 1e-9) bad.push(`в секторе (${deg}°, ${rho}): ${g} вместо ${want.toFixed(3)}`);
  }
  // пустые места, которые габарит накрывает: за бортом, в отверстии и вне развёртки
  for (const [label, x, z] of [
    ['за бортом', P(ARC, 90, 45).x, P(ARC, 90, 45).z],
    ['в отверстии', 0, 20],
    ['вне развёртки', 30, -20],
  ]) {
    const g = map.groundHeightAt(x, z, 500);
    if (g > 0.01) bad.push(`${label} (${x}, ${z}): опора ${g} — фантом габарита`);
  }
  return {
    name: 'Опора есть только в секторе; за бортом, в отверстии и вне развёртки — земля',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ')
      : '4 точки в секторе на плоскости, 3 пустые точки внутри габарита — на грунте',
  };
}

function testOverpassBelow() {
  const map = builtMap();
  const p = P(ARC, 90);
  const top = surface(ARC, 90);
  const bad = [];
  // под мостом идущий стоит на асфальте: 5 м полотна выше шага ноги
  const under = map.groundHeightAt(p.x, p.z, 0);
  if (Math.abs(under) > 1e-9) bad.push(`с земли под мостом опора ${under}, а не 0`);
  // с отметки полотна (шаг 0,6 м) опора — сама дуга
  const onDeck = map.groundHeightAt(p.x, p.z, top);
  if (Math.abs(onDeck - top) > 1e-6) bad.push(`с полотна опора ${onDeck}, а не ${top.toFixed(3)}`);
  // на полшага ниже полотна ещё не держит: это не «высшая опора», а высшая в шаге
  const below = map.groundHeightAt(p.x, p.z, top - J.deckThickness - 0.1);
  if (below > 0.01) bad.push(`за шаг до полотна опора ${below} — дуга держит сквозь пролёт`);
  return {
    name: 'Полотно выше шага ноги не прячет асфальт: опора выбирается в пределах stepUp',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ')
      : `с земли ${under} м, с полотна ${onDeck.toFixed(3)} м, за шаг до него — грунт`,
  };
}

function testSphereOnSweep() {
  const map = builtMap();
  const r = 0.4;
  const bad = [];
  const p = P(ARC, 90);
  const top = surface(ARC, 90);
  // центр на 0,2 м в плите — выталкивается вверх по верхней грани
  const c = { x: p.x, y: top + 0.2, z: p.z };
  map.resolveSphere(c, r);
  if (Math.abs(c.y - (top + r)) > 1e-6) bad.push(`сфера над плитой поднята на ${c.y}, а не ${(top + r).toFixed(3)}`);
  if (Math.hypot(c.x - p.x, c.z - p.z) > 1e-9) bad.push('сферу увело вбок с верхней грани');
  // центр внутри толщины — разводится по наименьшей глубине (вверх)
  const mid = { x: p.x, y: top - J.deckThickness / 2, z: p.z };
  map.resolveSphere(mid, r);
  if (Math.abs(mid.y - (top + r)) > 1e-6) bad.push(`сфера из плиты вышла на ${mid.y}, а не ${(top + r).toFixed(3)}`);
  // высоко над полотном и в пустом углу габарита — её не трогают
  for (const [label, q] of [
    ['над полотном', { x: p.x, y: top + 3, z: p.z }],
    ['в пустом углу габарита', { x: 30, y: 0.3, z: -20 }],
    ['в отверстии кольца', { x: 0, y: top - 1, z: 20 }],
  ]) {
    const before = { ...q };
    map.resolveSphere(q, r);
    if (Math.hypot(q.x - before.x, q.y - before.y, q.z - before.z) > 1e-9) {
      bad.push(`${label}: сферу сдвинуло на ${Math.hypot(q.x - before.x, q.y - before.y, q.z - before.z).toFixed(3)}`);
    }
  }
  return {
    name: 'Сфера на дуге выходит по грани, а пустой угол габарита и отверстие кольца не трогает',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ')
      : 'верхняя грань подняла сферу на радиус, из плиты вытолкнуло вверх, три пустые точки не тронуты',
  };
}

/**
 * Самоход вдоль дуги: шаг по углу (машина едет по окружности), гравитация шагом,
 * выталкивание сферы и прижатие к опоре. Проверяется и подъём, и спуск, и то, что
 * тело не уходит с полотна: отклонение по радиусу и от плоскости — мало.
 */
function follow(map, fromDeg, dir, span) {
  const r = CONFIG.radius;
  const step = 0.05;
  const a0 = fromDeg * DEG;
  const c = {
    x: ARC.cx + Math.cos(a0) * ARC.radius,
    y: surface(ARC, fromDeg) + r,
    z: ARC.cz + Math.sin(a0) * ARC.radius,
  };
  const before = c.y;
  let a = a0, moved = 0, maxOff = 0, maxSurface = 0;
  while (moved < span) {
    a += dir * step / ARC.radius;
    c.x = ARC.cx + Math.cos(a) * ARC.radius;
    c.z = ARC.cz + Math.sin(a) * ARC.radius;
    c.y -= step;
    moved += step;
    map.resolveSphere(c, r);
    const g = map.groundHeightAt(c.x, c.z, c.y);
    if (g !== null && c.y - r < g) c.y = g + r;
    maxOff = Math.max(maxOff, Math.abs(Math.hypot(c.x - ARC.cx, c.z - ARC.cz) - ARC.radius));
    maxSurface = Math.max(maxSurface, Math.abs(c.y - (surface(ARC, a / DEG) + r)));
  }
  return { dh: (c.y - before) * dir, maxOff, maxSurface };
}

function testSphereTravels() {
  const map = builtMap();
  const bad = [];
  const up = follow(map, 20, 1, 20);
  if (up.dh < 1) bad.push(`подъём: тело набрало ${up.dh.toFixed(2)} м`);
  if (up.maxOff > 1e-6) bad.push(`подъём: снос с осевой ${up.maxOff.toFixed(4)} м`);
  if (up.maxSurface > 0.01) bad.push(`подъём: отход от плоскости ${up.maxSurface.toFixed(3)} м`);
  const down = follow(map, 200, -1, 20);
  if (down.dh < 1) bad.push(`спуск: тело сбросило ${down.dh.toFixed(2)} м`);
  if (down.maxOff > 1e-6) bad.push(`спуск: снос с осевой ${down.maxOff.toFixed(4)} м`);
  if (down.maxSurface > 0.01) bad.push(`спуск: отход от плоскости ${down.maxSurface.toFixed(3)} м`);
  return {
    name: 'Тело-сфера самоходом проходит подъём и спуск дуги, не уходя с полотна',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ')
      : `вверх +${up.dh.toFixed(2)} м, вниз −${down.dh.toFixed(2)} м, снос 0, отход ≤ ${Math.max(up.maxSurface, down.maxSurface).toExponential(1)} м`,
  };
}

function testFrozenChapters() {
  const bad = [];
  for (const [name, spec] of [['глава 9', LEVEL_09.map], ['глава 10', LEVEL_10.map]]) {
    const map = createJsonMap(spec);
    if (map.sweeps.length) bad.push(`${name}: ${map.sweeps.length} дуг`);
    if (map.topAt(0, 0) !== null) bad.push(`${name}: topAt ответил на карте без дуг`);
    if (!map.nav.pos.length) bad.push(`${name}: карта не собралась`);
    map.dispose?.();
  }
  return {
    name: 'Главы 9 и 10 не вошли в ветку дуг: sweeps пуст, topAt отвечает null',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ')
      : 'обе главы собраны прежней арифметикой: sweeps пуст, groundHeightAt идёт по призмам',
  };
}

export async function runRotatedSweepTests() {
  const tests = [
    testBrief,
    testTopAccuracy,
    testSupportSectorOnly,
    testOverpassBelow,
    testSphereOnSweep,
    testSphereTravels,
    testFrozenChapters,
  ];
  const results = [];
  for (const fn of tests) {
    try { results.push(await fn()); }
    catch (e) { results.push({ name: fn.name, passed: false, info: `ошибка: ${e && e.message}` }); }
  }
  const passed = results.filter(r => r.passed).length;

  if (typeof console !== 'undefined') {
    console.group('Автотесты дуг настила (v2)');
    for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'} — ${r.name}: ${r.info}`);
    console.log(`Итого: ${passed}/${results.length}`);
    console.groupEnd();
  }
  return { passed, total: results.length, results };
}