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
 *   7. Главы 9 и 10 не вошли в ветку дуг: sweeps пуст, topAt отвечает null;
 *   8. Луч бьёт в ту же ленту, что нарисована: вертикальные пробы сверху
 *      сходятся с аналитическим верхом в пределах хорды нарезки (≤ 0,05 м);
 *      подземные пробы у начала (крен топит внутренний край) не сверяются;
 *   9. Луч снизу попадает в низ плиты, а не проваливается сквозь полотно;
 *  10. Перила `rails` бракуют край полотна, но не мешают идти по осевой;
 *  11. Миникарта печатает дугу кольцевым сектором (два `ctx.arc`), а не габаритом;
 *  12. Граф навигации идёт по осевой дуги: маршрут с земли доводит до точки B на
 *      полотне, а узлы на нём стоят на плоскости дуги и не выброшены как карман.
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
  if (!map.sweeps[0]?.tris?.length) bad.push('лента дуги не построена');
  if (map.geo.decks.length !== 1) bad.push(`мешей настила: ${map.geo.decks.length}`);
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

/**
 * Луч против ленты: 200 проб сверху сходятся с аналитическим верхом в пределах
 * хорды нарезки (5° при R 40 м — 3,8 см), потому что меш и луч — одни и те же
 * треугольники; проба на осевой в стороне от перил.
 */
function testRayHitsRibbon() {
  const map = builtMap();
  const d = deckInfo();
  const bad = [];
  let probes = 0, worst = 0;
  for (let i = 0; i < 200; i++) {
    const deg = 3 + (207 * i) / 199;
    // крайние 0,35 м — под перилами: луч сверху попадёт в отбойник, а не в настил
    const rho = d.R - d.halfW + 0.35 + ((d.halfW * 2 - 0.7) * ((i * 37) % 199)) / 199;
    const p = P(ARC, deg, rho);
    const want = surfaceOf(d, deg, rho);
    // у самого начала крен 6° кладёт внутренний край полотна ниже улицы: там
    // первым луч встречает асфальт земли, и это свойство данных (bриф задаёт
    // y0 = 0,12), а не ошибка ленты. Подземные пробы не сверяются
    if (want < 0.25) continue;
    const hit = map.raySolid(p.x, want + 5, p.z, 0, -1, 0, 12);
    if (!hit) { bad.push(`угол ${deg.toFixed(1)}, радиус ${rho.toFixed(1)}: луч не попал`); continue; }
    const err = Math.abs(hit.y - want);
    worst = Math.max(worst, err);
    probes++;
    if (err > 0.05) bad.push(`угол ${deg.toFixed(1)}: ${hit.y.toFixed(3)} вместо ${want.toFixed(3)} (${err.toFixed(3)} м)`);
    if (hit.ny < 0.9) bad.push(`угол ${deg.toFixed(1)}: нормаль вниз (ny ${hit.ny.toFixed(2)})`);
  }
  if (probes < 150) bad.push(`сверено всего ${probes} проб`);
  return {
    name: 'Луч бьёт в нарисованную ленту: вертикальные пробы сходятся с опорой ≤ 0,05 м',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${probes} проб, худшее расхождение ${worst.toFixed(3)} м — в пределах хорды 5°`,
  };
}

function testRayUnderside() {
  const map = builtMap();
  const d = deckInfo();
  const p = P(ARC, 90);
  const top = surfaceOf(d, 90);
  const bad = [];
  const hit = map.raySolid(p.x, 0.4, p.z, 0, 1, 0, 20);
  if (!hit) bad.push('луч снизу не нашёл низ плиты');
  else {
    const want = top - J.deckThickness;
    if (Math.abs(hit.y - want) > 0.05) bad.push(`низ ${hit.y.toFixed(3)} вместо ${want.toFixed(3)}`);
    if (hit.ny > -0.9) bad.push(`нормаль низа смотрит вверх (ny ${hit.ny.toFixed(2)})`);
  }
  return {
    name: 'Луч снизу попадает в низ плиты: полотно не прозрачно для выстрела',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ')
      : `низ ${hit.y.toFixed(3)} м (верх ${top.toFixed(3)} − ${J.deckThickness})`,
  };
}

function testRailsBlockEdge() {
  const map = builtMap();
  const d = deckInfo();
  const bad = [];
  const mid = 90;
  const top = surfaceOf(d, mid);
  const r = CONFIG.radius;
  const edge = P(ARC, mid, d.R + d.halfW - 0.15);
  const centerP = P(ARC, mid, d.R);
  if (!map.isBlocked(edge.x, edge.z, r, top, CONFIG.eyeHeight)) {
    bad.push('на краю полотна тело не встречает перила');
  }
  if (map.isBlocked(centerP.x, centerP.z, r, top, CONFIG.eyeHeight)) {
    bad.push('перила перекрыли осевую полотна');
  }
  // перила идут вдоль всей дуги: та же проверка на другом угле
  const e2 = P(ARC, 180, d.R - d.halfW + 0.15);
  const t2 = surfaceOf(d, 180);
  if (!map.isBlocked(e2.x, e2.z, r, t2, CONFIG.eyeHeight)) bad.push('на внутренней кромке 180° перил нет');
  return {
    name: 'Перила бракуют край полотна, но не перекрывают осевую',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ')
      : `кромки ${(d.R + d.halfW).toFixed(1)} и ${(d.R - d.halfW).toFixed(1)} м перекрыты, осевая ${d.R} м свободна`,
  };
}

function testMinimapArc() {
  const map = builtMap();
  const d = deckInfo();
  const bad = [];
  const arcs = [];
  const ctx = new Proxy({}, {
    get: (o, key) => {
      if (key === 'arc') return (...a) => arcs.push(a);
      return o[key] ?? (() => {});
    },
    set: (o, key, v) => { o[key] = v; return true; },
  });
  const size = 200;
  map.drawMinimap(ctx, size, { x: EXIT.x, y: 6, z: EXIT.z });
  if (arcs.length < 2) bad.push(`ctx.arc вызван ${arcs.length} раз`);
  else {
    const [xo, zo, ro, a0, a1] = arcs[0];
    const [xi, zi, ri] = arcs[1];
    if (Math.abs(xo - xi) > 1e-9 || Math.abs(zo - zi) > 1e-9) bad.push('центры колец разъехались');
    const k = size / (2 * Math.min(J.minimapRange, Math.max(map.width, map.depth) / 2));
    if (Math.abs((ro - ri) - (d.halfW * 2) * k) > 1e-9) {
      bad.push(`ширина кольца ${(ro - ri).toFixed(2)} px вместо ${(d.halfW * 2 * k).toFixed(2)}`);
    }
    if (Math.abs(a0) > 1e-9 || Math.abs(a1 - d.a0r - d.spanr) > 1e-9) bad.push('углы дуги на плане не те');
  }
  return {
    name: 'Миникарта печатает дугу кольцевым сектором, а не габаритом',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ')
      : `два ctx.arc: ширина кольца ${(d.halfW * 2 * (size / (2 * Math.min(J.minimapRange, Math.max(map.width, map.depth) / 2)))).toFixed(1)} px`,
  };
}

/**
 * Навигация по дуге: граф обязан подняться на полотно с земли и довести до точки
 * B по осевой. Проверяется маршрут, а не наличие узлов: `_pruneToSpawn` выбрасывает
 * изолированные карманы, и цепочка, оторванная от улицы, исчезла бы из графа
 * вместе с целью. Отметка узла — плоскость дуги (на осевой крен нулевой).
 */
function testNavAlongArc() {
  const map = builtMap();
  const d = deckInfo();
  const bad = [];
  const exitY = surfaceOf(d, 107.5);
  const path = map.findPath(
    { x: RAW.gameplay.spawn.x, y: 0, z: RAW.gameplay.spawn.z },
    { x: EXIT.x, y: exitY, z: EXIT.z },
  );
  if (!path) bad.push('маршрута с земли до точки B на полотне нет');
  else {
    // точка B стоит на середине развёртки: маршрут обязан подняться до неё, а не
    // до верхнего конца дуги — там его никто не ждёт
    const top = Math.max(...path.map(p => p.y));
    if (top < exitY - 1) bad.push(`маршрут поднялся только на ${top.toFixed(2)} м из ${exitY.toFixed(2)}`);
    const last = path[path.length - 1];
    if (Math.hypot(last.x - EXIT.x, last.z - EXIT.z) > J.navStep) {
      bad.push(`маршрут кончился в ${last.x.toFixed(1)}, ${last.z.toFixed(1)} — не у точки B`);
    }
  }
  let onDeck = 0;
  for (const p of map.nav.pos) {
    const rho = Math.hypot(p.x, p.z);
    if (Math.abs(rho - d.R) > 0.05) continue;
    const deg = (Math.atan2(p.z, p.x) / DEG + 360) % 360;
    if (deg < d.a0 || deg > d.a1) continue;
    if (Math.abs(p.y - surfaceOf(d, deg)) > 0.02) continue;
    onDeck++;
  }
  if (onDeck < 20) bad.push(`узлов на полотне ${onDeck}, ожидалось ≥ 20`);
  const lastNode = map.nav.pos
    .filter(p => Math.abs(Math.hypot(p.x, p.z) - d.R) < 0.05)
    .reduce((a, p) => (a === null || p.y > a.y ? p : a), null);
  if (!lastNode || lastNode.y < d.y1 - 0.5) {
    bad.push(`верхний узел полотна на ${lastNode ? lastNode.y.toFixed(2) : '—'} м, а не у ${d.y1}`);
  }
  return {
    name: 'Граф идёт по осевой дуги: маршрут с земли доводит до полотна, узлы не отрезаны',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ')
      : `${onDeck} узлов на полотне, маршрут с земли до точки B ${path.length} узлов, верх ${lastNode.y.toFixed(2)} м`,
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
    testRayHitsRibbon,
    testRayUnderside,
    testRailsBlockEdge,
    testMinimapArc,
    testNavAlongArc,
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