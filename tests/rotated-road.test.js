/**
 * Автотесты косых настилов — v2 генератора города (`docs/city-v2-plan.md`, этап 3).
 *
 * Пластина дороги задана центром, длиной, шириной и углом к северу; наклонная
 * пластина добавляет `rise` и держится той же аналитической призмой, что и
 * осевой пролёт v1, только повёрнутой. Проверяется ровно то, из-за чего этап и
 * заводился: план, опора, луч, сфера, опоры-колонны, фонари и узлы графа живут в
 * осях полотна, а мировой габарит остаётся только фильтром сетки-индекса.
 *
 * Арифметика сверки здесь своя (косинус и синус угла в лоб, без
 * `geo2d.rotatePoint`): общее выражение не поймало бы ошибку знака или центра
 * поворота — оно бы её только повторяло.
 *
 * Запуск в браузере (через консоль страницы игры, где есть importmap):
 *   const m = await import('/tests/rotated-road.test.js?v=1');
 *   await m.runRotatedRoadTests();
 *
 * Проверяются сценарии:
 *   1. Бриф v2 проходит схему и нормализатор без предупреждений, угол доходит до
 *      данных карты, у пластины есть `obb`, а модуль несёт её размеры;
 *   2. Плоская косая пластина держит ногу внутри своих осей и не держит в пустом
 *      углу габарита: фантома, запрещённого правилом AGENTS, нет;
 *   3. Сфера на косой плите выталкивается вверх по её настоящей грани, а в
 *      пустом углу габарита её не трогают вовсе;
 *   4. Луч бьёт в кромку косой плиты на аналитическом расстоянии с 8 азимутов и
 *      проходит мимо угла габарита, которого плита не занимает;
 *   5. Верх наклонной косой пластины совпадает с её плоскостью по всей длине, а
 *      вертикальный луч возвращает ту же отметку и нормаль наклона;
 *   6. Тело-сфера самоходом входит на наклонную косую пластину и сходит с неё,
 *      не упираясь в её торец;
 *   7. Перила настила — стенка-призма по кромке: её верх идёт параллельно подъёму
 *      полотна (луч сходится с формулой по всей длине), бракует край, но не
 *      осевую, не поднимает опору и выталкивает сферу поперёк полотна;
 *   8. Опоры и фонари стоят вдоль полотна и повёрнуты вместе с ним;
 *   9. Цепочка узлов вдоль косой эстакады связна: маршрут с земли на верхний
 *      настил существует и проходим ногами на каждом ребре;
 *  10. Миникарта рисует косую пластину четырёхугольником, а не её габаритом;
 *  11. Метки id различают пластины суффиксом `· yaw N°`;
 *  12. Главы 9 и 10 не вошли в поворотную ветку: ни одной пластины с углом или
 *      `obb`, ни одной повёрнутой призмы.
 */
import * as THREE from 'three';
import { createJsonMap } from '../src/json-map.js';
import { LEVEL_09 } from '../src/levels/level-09.js';
import { LEVEL_10 } from '../src/levels/level-10.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { validateLevel, LEVEL_SPEC_V2 } from '../tools/level-schema.mjs';
import { CONFIG } from '../src/config.js';

const J = CONFIG.jsonMap;
const STEP = CONFIG.building.stepUp;
const PLAYER_H = CONFIG.eyeHeight + 0.35;

// ------------------------------------------------------------------ бриф v2

const YAW = 20 * Math.PI / 180;
const RC = Math.cos(YAW), RS = Math.sin(YAW);

/**
 * Развязка из двух пластин одной дороги: косой подъём с земли (уклон 0,15) и
 * плоский верхний настил, который начинается ровно там, где кончился подъём, —
 * цепочка узлов графа собирается внутри одной дороги, а конец подъёма совпадает
 * с началом настила. Косая наземная улица с фонарями стоит в стороне.
 */
const RAMP = { x: 10, z: 20, yaw: 20, length: 40, width: 8, y: 0.12, rise: 6, rails: true };
const FLAT = { x: RAMP.x + 45 * RC, z: RAMP.z + 45 * RS, yaw: 20, length: 50, width: 8, y: 6.12, rails: true };
const STREET = { x: -30, z: -30, yaw: 30, length: 60, width: 8, y: 0.12 };

const RAW = {
  kind: 'json2',
  metadata: { levelName: 'V2SlantRoad', name: 'Косые настилы', hint: '—', units: 'meters' },
  ground: { y: 0, size: 200, color: '#23262c' },
  roads: [
    { id: 'st_diag', type: 'ground', width: 8, lamps: true, elements: [{ plate: STREET }] },
    { id: 'rp_chain', type: 'bridge', elements: [{ plate: RAMP }, { plate: FLAT }] },
  ],
  buildings: [], landscapeObjects: [], lights: [],
  gameplay: { goal: 'exit', spawn: { x: 0, z: 0 }, exit: { x: FLAT.x, z: FLAT.z }, exitRadius: 4 },
};

// -------------------------------------------------- независимая арифметика теста

/** Полотна с углом: (c, s) — свой косинус и синус, не из карты. */
function cs(d) {
  const a = d.yaw * Math.PI / 180;
  return { c: Math.cos(a), s: Math.sin(a) };
}

/** Локальное смещение от центра полотна → мир. */
function W(d, du, dv) {
  const { c, s } = cs(d);
  return { x: d.x + du * c - dv * s, z: d.z + du * s + dv * c };
}

/** Мир → локальное смещение от центра полотна. */
function L(d, x, z) {
  const { c, s } = cs(d);
  const dx = x - d.x, dz = z - d.z;
  return { x: dx * c + dz * s, z: -dx * s + dz * c };
}

/** Отметка верха полотна на расстоянии `along` от его начала (s = 0). */
const topAt = (d, along) => d.y + (d.rise ?? 0) * along / d.length;

/** Точка внутри плана полотна (по его собственным осям, а не по габариту). */
function holds(d, x, z) {
  const l = L(d, x, z);
  return Math.abs(l.x) <= d.length / 2 + 1e-6 && Math.abs(l.z) <= d.width / 2 + 1e-6;
}

let built = null;

function builtMap() {
  if (!built) {
    const level = normalizeLevel(structuredClone(RAW));
    built = { level, map: createJsonMap(level.map) };
  }
  return built.map;
}

function deck(map, roadId, index) {
  return map.roads.find(r => r.id === roadId).decks[index];
}

/**
 * Шагает по опорам от узла до узла: подъём больше stepUp — стена, провал глубже
 * navEdgeDrop — пустота под ребром, задержка габарита — перегородка.
 */
function walkEdge(map, from, to) {
  const len = Math.hypot(to.x - from.x, to.z - from.z);
  const steps = Math.max(1, Math.ceil(len / J.navEdgeProbe));
  let feet = from.y;
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const x = from.x + (to.x - from.x) * t;
    const z = from.z + (to.z - from.z) * t;
    const g = map.groundHeightAt(x, z, Math.max(feet, from.y));
    if (g - feet > STEP) return { x, z, why: `подъём ${feet.toFixed(2)}→${g.toFixed(2)} — стена` };
    if (feet - g > J.navEdgeDrop) return { x, z, why: `провал ${feet.toFixed(2)}→${g.toFixed(2)} — пустота` };
    feet = g;
    if (map.isBlocked(x, z, CONFIG.radius, feet + 0.02, PLAYER_H)) return { x, z, why: 'габарит задерживает' };
  }
  if (to.y - feet > STEP) return { x: to.x, z: to.z, why: `узел ${to.y.toFixed(2)} выше опоры ${feet.toFixed(2)}` };
  return null;
}

// ------------------------------------------------------------------- проверки

function testBrief() {
  const { errors } = validateLevel(structuredClone(RAW), LEVEL_SPEC_V2);
  const level = normalizeLevel(structuredClone(RAW));
  const bad = [];
  if (errors.length) bad.push(`схема: ${errors.join(' | ')}`);
  if (level.warnings.length) bad.push(`предупреждения парсера: ${level.warnings.join(' | ')}`);
  const st = level.map.roads.find(r => r.id === 'st_diag').decks[0];
  const chain = level.map.roads.find(r => r.id === 'rp_chain').decks;
  if (st.yaw !== 30) bad.push(`угла улицы нет в данных (${st.yaw})`);
  if (!st.obb) bad.push('у косой улицы нет obb');
  if (chain.length !== 2) bad.push(`у развязки ${chain.length} пластин вместо 2`);
  if (chain[0].ramp !== true || chain[1].ramp !== false) bad.push('подъём и настил не различились');
  if (!chain[0].obb || !chain[1].obb) bad.push('у пластин развязки нет obb');
  if (Math.abs(chain[0].topAtMax - 6.12) > 1e-6) bad.push(`верх подъёма ${chain[0].topAtMax}`);
  if (Math.abs(chain[1].topAtMin - 6.12) > 1e-6) bad.push(`низ настила ${chain[1].topAtMin}`);
  // угол живёт в каждой пластине: дублировать ширину полотна в секции дороги
  // значило бы дать двум записям разойтись при первой правке
  const code = JSON.stringify(level.map);
  if (!code.includes('"yaw":20')) bad.push('модуль главы не донёс угол пластины');
  return {
    name: 'Бриф v2: косая цепочка пластин принята, угол и obb дошли до данных карты',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ')
      : `2 пластины развязки (${chain[0].topAtMin}→${chain[0].topAtMax} м), улица под 30°, предупреждений 0`,
  };
}


function testDeckSupportAndPhantom() {
  const map = builtMap();
  const flat = deck(map, 'rp_chain', 1);
  const bad = [];
  // внутри полотна: три точки по длине и ширине
  for (const [u, v] of [[-24, 0], [0, 3], [24, -3]]) {
    const p = W(FLAT, u, v);
    const g = map.groundHeightAt(p.x, p.z, 500);
    if (Math.abs(g - FLAT.y) > 1e-6) bad.push(`внутри полотна (${u}, ${v}) опора ${g}, а не ${FLAT.y}`);
  }
  // за бортом: габарит ещё накрывает точку, полотна там нет
  for (const [u, v] of [[0, 5], [0, -5], [-20, 5.5]]) {
    const p = W(FLAT, u, v);
    const g = map.groundHeightAt(p.x, p.z, 500);
    if (g >= FLAT.y - 1) bad.push(`за бортом (${u}, ${v}) опора ${g} — фантом габарита`);
  }
  // пустой угол габарита: точка внутри AABB, но снаружи повёрнутой плиты.
  // Габарит считается независимо — проекциями полуосей, а не `d.obb`
  const corner = W(FLAT, 24, -5);
  const dx = 24 * RC + 5 * RS, dz = 24 * RS - 5 * RC;
  const aabbX = 25 * Math.abs(RC) + 4 * Math.abs(RS);
  const aabbZ = 25 * Math.abs(RS) + 4 * Math.abs(RC);
  if (Math.abs(dx) > aabbX - 0.2 || Math.abs(dz) > aabbZ - 0.2) {
    bad.push('контрольная точка угла не внутри габарита — проверка бессмысленна');
  }
  const gCorner = map.groundHeightAt(corner.x, corner.z, 500);
  if (gCorner >= FLAT.y - 1) bad.push(`в углу габарита опора ${gCorner} — плита держит вне своих осей`);
  return {
    name: 'Косая плита держит ногу в своих осях и не держит в пустом углу габарита',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ')
      : `полотно ${FLAT.length}×${FLAT.width} под 20°: внутри ${FLAT.y} м, за бортом и в углу — земля`,
  };
}

function testSphereOnDeck() {
  const map = builtMap();
  const r = 0.4;
  const bad = [];
  // сфера, сидящая в плите на 0,2 м, выталкивается вверх по верхней грани
  const p = W(FLAT, 0, 0);
  const c = { x: p.x, y: FLAT.y + 0.2, z: p.z };
  map.resolveSphere(c, r);
  if (Math.abs(c.y - (FLAT.y + r)) > 0.01) bad.push(`сфера поднята на ${c.y}, а не ${(FLAT.y + r).toFixed(2)}`);
  if (Math.hypot(c.x - p.x, c.z - p.z) > 1e-6) bad.push('сфера уехала вбок с верхней грани');
  // та же высота в пустом углу габарита: плиты там нет, сферу трогать нечем
  const q = W(FLAT, 24, -5);
  const qc = { x: q.x, y: FLAT.y, z: q.z };
  const before = { ...qc };
  map.resolveSphere(qc, r);
  if (Math.hypot(qc.x - before.x, qc.z - before.z, qc.y - before.y) > 1e-9) {
    bad.push('сферу вытолкнуло в пустом углу габарита — узкая фаза мерит охватом');
  }
  return {
    name: 'Сфера на косой плите выходит по её грани, а в пустом углу габарита её не трогают',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ') : 'верхняя грань подняла сферу ровно на радиус, угол габарита пуст',
  };
}

function testRayAgainstDeck() {
  const map = builtMap();
  // опорная точка — запись карты: её центр округлён до миллиметра нормализатором,
  // и сверка с «идеальным» литералом ловила бы округление, а не ошибку геометрии
  const dFlat = deck(map, 'rp_chain', 1);
  const ox0 = dFlat.cx, oz0 = dFlat.cz;
  const hx = FLAT.length / 2, hz = FLAT.width / 2;
  const y0 = FLAT.y - J.deckThickness, y1 = FLAT.y;
  const midY = FLAT.y - J.deckThickness / 2;
  const bad = [];
  // горизонтальный луч с 8 азимутов в бок плиты: своя аналитика — слэбы в осях
  // полотна, без вызова методов карты
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    const dist = 60;
    const ox = ox0 + Math.cos(a) * dist, oz = oz0 + Math.sin(a) * dist;
    const dx = (ox0 - ox) / dist, dz = (oz0 - oz) / dist;
    const lox = (ox - ox0) * RC + (oz - oz0) * RS;
    const loz = -(ox - ox0) * RS + (oz - oz0) * RC;
    const ldx = dx * RC + dz * RS, ldz = -dx * RS + dz * RC;
    const slab = (p, d, lo, hi) => {
      if (Math.abs(d) < 1e-12) return p >= lo && p <= hi ? [-Infinity, Infinity] : null;
      let t1 = (lo - p) / d, t2 = (hi - p) / d;
      if (t1 > t2) [t1, t2] = [t2, t1];
      return [t1, t2];
    };
    const X = slab(lox, ldx, -hx, hx), Y = slab(midY, 0, y0, y1), Z = slab(loz, ldz, -hz, hz);
    if (!X || !Y || !Z) continue;
    const tmin = Math.max(X[0], Y[0], Z[0]), tmax = Math.min(X[1], Y[1], Z[1]);
    if (tmax < tmin || tmax < 0) continue;
    const hit = map.raySolid(ox, FLAT.y - J.deckThickness / 2, oz, dx, 0, dz, dist * 2);
    if (!hit) { bad.push(`азимут ${i}: луч не нашёл плиту`); continue; }
    if (Math.abs(hit.dist - tmin) > 1e-6) bad.push(`азимут ${i}: ${hit.dist.toFixed(4)} вместо ${tmin.toFixed(4)}`);
  }
  // луч вдоль борта снаружи (локальное v = 5) проходит мимо плиты: габарит его
  // пересекает, а сама плита — нет
  const a = W(FLAT, -40, 5), b = W(FLAT, 40, 5);
  const len = Math.hypot(b.x - a.x, b.z - a.z);
  const miss = map.raySolid(a.x, FLAT.y - J.deckThickness / 2, a.z, (b.x - a.x) / len, 0, (b.z - a.z) / len, len);
  if (miss) bad.push(`луч вдоль борта попал в плиту на ${miss.dist.toFixed(2)} м`);
  // вертикально сверху — верхняя грань
  const top = W(FLAT, 3, 1);
  const down = map.raySolid(top.x, FLAT.y + 20, top.z, 0, -1, 0, 60);
  if (!down || Math.abs(down.y - FLAT.y) > 1e-6) bad.push(`вертикальный луч попал на ${down && down.y}`);
  else if (Math.abs(down.ny - 1) > 1e-9) bad.push(`нормаль верха (${down.nx}, ${down.ny}, ${down.nz}) не вертикальна`);
  return {
    name: 'Луч бьёт в кромку косой плиты на аналитическом расстоянии и проходит мимо борта',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ') : '8 азимутов совпали с независимыми слэбами, борт пуст',
  };
}

function testRampSurface() {
  const map = builtMap();
  const bad = [];
  const k = RAMP.rise / RAMP.length;
  const wl = Math.hypot(k, 1);
  for (let s = 2; s <= RAMP.length - 2; s += 4) {
    const p = W(RAMP, -RAMP.length / 2 + s, 0);
    const want = topAt(RAMP, s);
    const g = map.groundHeightAt(p.x, p.z, 500);
    if (Math.abs(g - want) > 1e-6) bad.push(`s=${s}: опора ${g.toFixed(4)} вместо ${want.toFixed(4)}`);
    const hit = map.raySolid(p.x, 40, p.z, 0, -1, 0, 80);
    if (!hit || Math.abs(hit.y - want) > 1e-6) bad.push(`s=${s}: луч на ${hit && hit.y.toFixed(4)} вместо ${want.toFixed(4)}`);
    else {
      const nx = -k * RC / wl, nz = -k * RS / wl, ny = 1 / wl;
      if (Math.hypot(hit.nx - nx, hit.ny - ny, hit.nz - nz) > 1e-9) {
        bad.push(`s=${s}: нормаль (${hit.nx.toFixed(4)}, ${hit.ny.toFixed(4)}, ${hit.nz.toFixed(4)}) `
          + `не наклона (${nx.toFixed(4)}, ${ny.toFixed(4)}, ${nz.toFixed(4)})`);
      }
    }
  }
  // за бортом наклонной пластины опоры нет
  const side = W(RAMP, 0, 6);
  const g = map.groundHeightAt(side.x, side.z, 500);
  if (g > 0.5) bad.push(`за бортом подъёма опора ${g} — призма шире полотна`);
  return {
    name: 'Верх косого подъёма совпадает с плоскостью, луч отдаёт её нормаль',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `уклон ${(k * 100).toFixed(0)} %, ${Math.floor((RAMP.length - 4) / 4) + 1} проб опоры и луча сошлись`,
  };
}

function testSphereClimbsRamp() {
  const map = builtMap();
  const r = CONFIG.radius;
  const STEP_MOVE = 0.05;
  const dir = { x: RC, z: RS };
  const run = (s0, dirSign, span) => {
    const start = W(RAMP, -RAMP.length / 2 + s0, 0);
    const c = { x: start.x, y: topAt(RAMP, s0) + r, z: start.z };
    const before = c.y;
    const steps = Math.ceil(span / STEP_MOVE) * 4 + 40;
    let travelled = 0;
    for (let i = 0; i < steps && travelled < span; i++) {
      c.x += dir.x * dirSign * STEP_MOVE;
      c.z += dir.z * dirSign * STEP_MOVE;
      c.y -= STEP_MOVE;
      travelled += STEP_MOVE;
      map.resolveSphere(c, r);
      const g = map.groundHeightAt(c.x, c.z, c.y);
      if (g !== null && c.y - r < g) c.y = g + r;
    }
    const axis = L(RAMP, c.x, c.z);
    return { dh: (c.y - before) * dirSign, off: Math.abs(axis.z), s: axis.x + RAMP.length / 2 };
  };
  const bad = [];
  const up = run(2, 1, 12);
  if (up.dh < 1) bad.push(`подъём: тело набрало ${up.dh.toFixed(2)} м`);
  if (up.off > 0.5) bad.push(`подъём: тело ушло с оси на ${up.off.toFixed(2)} м`);
  const down = run(RAMP.length - 2, -1, 12);
  if (down.dh < 1) bad.push(`спуск: тело сбросило ${down.dh.toFixed(2)} м`);
  if (down.off > 0.5) bad.push(`спуск: тело ушло с оси на ${down.off.toFixed(2)} м`);
  return {
    name: 'Тело-сфера самоходом входит на косой подъём и сходит с него',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ')
      : `вверх +${up.dh.toFixed(1)} м до s=${up.s.toFixed(1)}, вниз −${down.dh.toFixed(1)} м, боковой снос ≤ 0,5 м`,
  };
}

/**
 * Перила косого настила — стенка-призма по каждой кромке, чей верх параллелен
 * подъёму полотна. Проверяется именно это: луч над стенкой и её грань берутся из
 * одной аналитики, поэтому расхождение с независимой формулой — микроны, а
 * лесенка коробок (прежний механизм) давала бы ступень на каждом шаге секции и
 * проём между низом перил и асфальтом там, где полотно ушло вверх.
 */
function testPlateRails() {
  const map = builtMap();
  const bad = [];
  const t = J.railThickness, H = J.railHeight, sink = J.railSink;
  const r = CONFIG.radius;
  const halfV = RAMP.width / 2;
  let worst = 0, probes = 0;
  for (let along = 2; along <= RAMP.length - 2; along += 3) {
    const du = along - RAMP.length / 2;
    const want = topAt(RAMP, along) + H - sink;
    for (const side of [-1, 1]) {
      // проба по средней линии стенки: полоса `[halfV − t/2, halfV + t/2]`
      const p = W(RAMP, du, side * halfV);
      const hit = map.raySolid(p.x, want + 3, p.z, 0, -1, 0, 6);
      if (!hit) { bad.push(`${along} м: над перилами луч ничего не нашёл`); continue; }
      probes++;
      const dev = Math.abs(hit.y - want);
      worst = Math.max(worst, dev);
      if (dev > 0.01) bad.push(`${along} м: верх перил ${hit.y.toFixed(3)} вместо ${want.toFixed(3)} — стенка ступенит`);
    }
  }
  if (probes < 20) bad.push(`сверено всего ${probes} проб`);
  // выстрел к борту встаёт в наружную грань стенки, нормаль — поперёк полотна
  const mid = RAMP.length / 2;
  const foot = topAt(RAMP, mid);
  const vd = { x: -RS, z: RC };
  const from = W(RAMP, 0, 0);
  const shot = map.raySolid(from.x, foot + H / 2, from.z, vd.x, 0, vd.z, halfV + 1);
  if (!shot) bad.push('выстрел к борту прошёл сквозь перила');
  else {
    const stop = (shot.x - from.x) * vd.x + (shot.z - from.z) * vd.z;
    if (Math.abs(stop - (halfV - t / 2)) > 0.02) bad.push(`выстрел встал на ${stop.toFixed(3)} м вместо ${(halfV - t / 2).toFixed(3)} м`);
    const radial = Math.abs(shot.nx * vd.x + shot.nz * vd.z);
    if (radial < 0.99) bad.push(`нормаль стенки не перпендикулярна борту (${radial.toFixed(3)})`);
  }
  // край полотна занят стенкой, осевая — нет; опорой перила не становятся
  const edgeP = W(RAMP, 0, halfV - 0.1);
  if (!map.isBlocked(edgeP.x, edgeP.z, r, foot, CONFIG.eyeHeight)) bad.push('у борта подъёма тело не встречает перила');
  if (map.isBlocked(from.x, from.z, r, foot, CONFIG.eyeHeight)) bad.push('перила перекрыли осевую подъёма');
  const sup = map.groundHeightAt(edgeP.x, edgeP.z, 500);
  if (Math.abs(sup - foot) > 0.02) bad.push(`опора у борта ${sup.toFixed(2)} м вместо ${foot}: перила стали плитой пола`);
  // сфера в сечении стенки: глубина до грани (0,06) меньше, чем до верха (0,55),
  // поэтому выталкивание идёт поперёк полотна, а не через ограждение
  const c = W(RAMP, 0, halfV);
  c.y = foot + H / 2;
  const start = { ...c };
  map.resolveSphere(c, r);
  const moved = Math.hypot(c.x - start.x, c.y - start.y, c.z - start.z);
  if (moved < 1e-6) bad.push('сфера в стенке перил не вытолкнута');
  const loc = L(RAMP, c.x, c.z);
  if (Math.abs(Math.abs(loc.z) - halfV) < t / 2 + r - 1e-6) bad.push(`сфера осталась в стенке: отступ ${Math.abs(loc.z)}`);
  if (Math.abs(c.y - start.y) > 0.02) bad.push(`выталкивание ушло по вертикали на ${(c.y - start.y).toFixed(3)} м`);
  const again = { x: c.x, y: c.y, z: c.z };
  map.resolveSphere(again, r);
  const rest = Math.hypot(again.x - c.x, again.y - c.y, again.z - c.z);
  if (rest > 1e-6) bad.push(`второй вызов сдвинул ещё на ${rest.toFixed(3)} м`);
  return {
    name: 'Перила косого настила — гладкая стенка по кромке: верх по подъёму, луч, блокер края и выталкивание',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${probes} проб вдоль подъёма 0,15, худшее расхождение ${worst.toFixed(4)} м; осевая ${(halfV).toFixed(1)} м свободна`,
  };
}

function testPillarsAndLamps() {
  const level = normalizeLevel(structuredClone(RAW));
  const bad = [];
  const pillars = level.map.props.filter(p => p.model === 'concrete_pillar');
  const lamps = level.map.props.filter(p => p.model === 'lamp_post');
  // развязка: J.pillarSpacing = 12 ⇒ t ∈ {−19, −7, 5, 17}, два ряда (отступ 2,8 м)
  if (pillars.length !== 8) bad.push(`опор ${pillars.length}, ожидалось 8`);
  const inset = FLAT.width / 2 - J.pillarSection / 2 - J.pillarEdge;
  for (const p of pillars) {
    const l = L(FLAT, p.position.x, p.position.z);
    if (Math.abs(l.x) > FLAT.length / 2 + 1e-3) bad.push(`опора за торцом настила: u=${l.x.toFixed(2)}`);
    if (Math.abs(Math.abs(l.z) - inset) > 2e-3) bad.push(`опора не на борту настила: v=${l.z.toFixed(3)}`);
    if (p.rotationY !== -20) bad.push(`опора повёрнута на ${p.rotationY}° вместо −20°`);
    if (Math.abs(p.position.y) > 1e-9) bad.push(`пятка опоры на ${p.position.y} вместо земли`);
    if (Math.abs(p.scale.y - (FLAT.y - J.deckThickness)) > 1e-3) bad.push(`высота опоры ${p.scale.y}`);
  }
  // улица: J.lampSpacing = 20 ⇒ t ∈ {−20, 0, 20}, по бортам на 4 + 1,4 м
  if (lamps.length !== 6) bad.push(`фонарей ${lamps.length}, ожидалось 6`);
  for (const l of lamps) {
    const p = L(STREET, l.position.x, l.position.z);
    if (Math.abs(Math.abs(p.z) - (STREET.width / 2 + J.lampOffset)) > 2e-3) {
      bad.push(`фонарь не на борту улицы: v=${p.z.toFixed(3)}`);
    }
    if (Math.abs(p.x) > STREET.length / 2 + 1e-3) bad.push('фонарь за торцом улицы');
    if (l.rotationY !== -30) bad.push(`фонарь повёрнут на ${l.rotationY}° вместо −30°`);
  }
  return {
    name: 'Опоры и фонари стоят вдоль полотна и повёрнуты вместе с ним',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${pillars.length} опор под настилом и ${lamps.length} фонарей на бортах косой улицы`,
  };
}

function testNavChain() {
  const map = builtMap();
  const bad = [];
  const topP = W(FLAT, 0, 0);
  const topY = map.groundHeightAt(topP.x, topP.z, 500);
  if (Math.abs(topY - FLAT.y) > 1e-6) bad.push(`верх настила ${topY}, а не ${FLAT.y}`);
  const path = map.findPath(map.spawn, { x: topP.x, y: topY, z: topP.z });
  if (!path || path.length < 8) {
    return {
      name: 'Цепочка узлов вдоль косой эстакады связна, маршрут с земли на настил есть',
      passed: false, info: `маршрута нет или он короче: ${path ? path.length : 0} узлов`,
    };
  }
  for (let i = 0; i + 1 < path.length; i++) {
    const why = walkEdge(map, path[i], path[i + 1]);
    if (why) bad.push(`ребро ${i} (${why.x.toFixed(1)}, ${why.z.toFixed(1)}): ${why.why}`);
  }
  const onRamp = path.filter(p => p.y > 0.5 && p.y < FLAT.y - 0.5);
  if (onRamp.length < 4) bad.push(`узлов на подъёме ${onRamp.length} — маршрут обошёл развязку`);
  const last = path[path.length - 1];
  if (Math.hypot(last.x - topP.x, last.z - topP.z) > 3.5) {
    bad.push(`маршрут кончается в ${Math.hypot(last.x - topP.x, last.z - topP.z).toFixed(1)} м от середины настила`);
  }
  if (Math.abs(last.y - FLAT.y) > 0.05) bad.push(`маршрут кончается на ${last.y.toFixed(2)} м, а настил на ${FLAT.y}`);
  return {
    name: 'Цепочка узлов вдоль косой эстакады связна, маршрут с земли на настил есть',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${path.length} узлов, ${onRamp.length} на подъёме, конец на ${last.y.toFixed(2)} м`,
  };
}

function testMinimapPolygon() {
  const map = builtMap();
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const pos = { x: FLAT.x, y: FLAT.y, z: FLAT.z };
  let error = null;
  try { map.drawMinimap(ctx, 256, pos); } catch (e) { error = e.message; }
  const px = ctx.getImageData(0, 0, 256, 256).data;
  const range = Math.min(J.minimapRange, Math.max(map.width, map.depth) / 2);
  const k = 256 / (2 * range);
  const at = (x, z) => {
    const i = Math.round((z - pos.z + range) * k), j = Math.round((x - pos.x + range) * k);
    if (i < 0 || i > 255 || j < 0 || j > 255) return null;
    const o = (i * 256 + j) * 4;
    return [px[o], px[o + 1], px[o + 2]];
  };
  const center = at(FLAT.x, FLAT.z);
  // угол габарита: мировой прямоугольник доходит сюда, полотно — нет
  const cornerPt = W(FLAT, 24, -5);
  const corner = at(cornerPt.x, cornerPt.z);
  const inked = c => c && (c[0] + c[1] + c[2] > 150);
  const bad = [];
  if (error) bad.push(`исключение: ${error}`);
  if (!inked(center)) bad.push(`центр косого настила не закрашен (${center})`);
  if (inked(corner)) bad.push(`пустой угол габарита закрашен — миникарта печатает охват (${corner})`);
  return {
    name: 'Миникарта рисует косой настил четырёхугольником, а не его габаритом',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ') : `чернила в центре настила, фон в пустом углу (окно ${range} м)`,
  };
}

function testDebugIds() {
  const map = builtMap();
  const marks = map.debugIds();
  const bad = [];
  const street = marks.filter(m => m.text.startsWith('st_diag · пл 1'));
  const chain = marks.filter(m => m.text.startsWith('rp_chain · пл'));
  if (street.length !== 1 || !street[0].text.includes('· yaw 30°')) {
    bad.push(`метка косой улицы: ${street.map(m => m.text).join(' | ') || '(нет)'}`);
  }
  if (chain.length !== 2) bad.push(`у развязки ${chain.length} меток пластин`);
  if (!chain.some(m => m.text.includes('· yaw 20°') && m.text.includes('· наклон'))) {
    bad.push('метка наклонной пластины не различает угол и наклон');
  }
  // метка пластины стоит в её осях, а не в углу габарита
  const flatMark = chain.find(m => !m.text.includes('наклон'));
  if (flatMark) {
    const l = L(FLAT, flatMark.x, flatMark.z);
    if (Math.abs(l.x) > 2 || Math.abs(l.z) > 2) bad.push('метка настила не над его центром');
  }
  return {
    name: 'Метки id различают пластины суффиксом `· yaw N°`',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ') : 'улица подписана `· yaw 30°`, подъём — `· yaw 20° · наклон`',
  };
}

function testFrozenChapters() {
  const bad = [];
  for (const [name, spec] of [['глава 9', LEVEL_09.map], ['глава 10', LEVEL_10.map]]) {
    const map = createJsonMap(spec);
    const decks = map.roads.flatMap(r => r.decks);
    const yawed = decks.filter(d => d.yaw || d.cx !== undefined || d.obb).length;
    const framed = map.prisms.filter(w => w.frame).length;
    if (yawed) bad.push(`${name}: ${yawed} пластин с углом или obb`);
    if (framed) bad.push(`${name}: ${framed} повёрнутых призм`);
    if (!map.nav.pos.length || !decks.length) bad.push(`${name}: карта не собралась`);
    map.dispose?.();
  }
  return {
    name: 'Главы 9 и 10 не вошли в поворотную ветку настилов',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ')
      : 'обе главы собраны прежней арифметикой: frame === null ведёт каждую пластину как в v1',
  };
}

export async function runRotatedRoadTests() {
  const tests = [
    testBrief,
    testDeckSupportAndPhantom,
    testSphereOnDeck,
    testRayAgainstDeck,
    testRampSurface,
    testSphereClimbsRamp,
    testPlateRails,
    testPillarsAndLamps,
    testNavChain,
    testMinimapPolygon,
    testDebugIds,
    testFrozenChapters,
  ];
  const results = [];
  for (const fn of tests) {
    try { results.push(await fn()); }
    catch (e) { results.push({ name: fn.name, passed: false, info: `ошибка: ${e && e.message}` }); }
  }
  const passed = results.filter(r => r.passed).length;

  if (typeof console !== 'undefined') {
    console.group('Автотесты косых настилов (v2)');
    for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'} — ${r.name}: ${r.info}`);
    console.log(`Итого: ${passed}/${results.length}`);
    console.groupEnd();
  }
  return { passed, total: results.length, results };
}