/**
 * Браузерная сюита улиц генератора по рельефу (этап 6 плана
 * `docs/level12-relief-plan.md`).
 *
 * Сюита отвечает на вопрос, который нельзя задать Node-парсеру: видит ли ДВИЖОК
 * то, что насчитал парсер. Улица района обязана быть дорогой — то есть опорой
 * ноги, препятствием для луча и ребром графа ровно на своей отметке, — а не
 * лентой, лежащей то под грунтом, то горбом над ним. Здесь поле пересчитывается
 * независимым кодом (свой smoothstep, свои веса площадок, свой кадр поворота)
 * против собранной карты, а не вызовом `src/relief.js`: общий код подтверждал бы
 * сам себя.
 *
 * Фикстура та же, что в `tools/level-parser.test.mjs`: два района на склоне
 * (косой под 18° с пятиугольной границей и соосный), терраса на каждый район и
 * авторский цоколь, чья площадка — единственная легитимная причина, по которой
 * полотно внутри террасы вообще имеет подъём.
 *
 * Запуск в браузере (через консоль страницы игры, где есть importmap):
 *   const m = await import('/tests/relief-city.test.js?v=1');
 *   await m.runReliefCityTests();
 *
 * Проверяются сценарии:
 *   1. Бриф: схема и парсер молчат, террас по району, служебные поля генератора
 *      не доехали в модуль;
 *   2. Терраса держит квартал: пол каждого лота — отметка района, асфальт целиком
 *      в её ядре;
 *   3. Полотно улицы = поле + подъём борта: расхождение в обе стороны в допуске,
 *      настил нигде не под грунтом;
 *   4. Опора ноги на пластине отвечает настил, а не склон (0 пластин без опоры на
 *      своей отметке);
 *   5. Перекрёсток — одна плоскость: крен вдоль большей оси поля, торцы прогонов
 *      сходятся с ней без ступени;
 *   6. Со-плоскостных наложений точных планов нет;
 *   7. Тело самоходом идёт по улице и не задерживается на её швах;
 *   8. Граф — одна связная сеть, и каждый узел стоит на своей опоре;
 *   9. Маршрут спавн → выход и маршрут между ярусами существуют, и опора под
 *      каждым ребром не уходит в проём глубже `navEdgeDrop` и не горбит выше
 *      шага ноги;
 *  10. Метки id подписывают перекрёстки их отметкой;
 *  11. Бюджет фикстуры: узлы, пластины, опора и луч;
 *  12. Бюджет собранного модуля главы 12 (600 × 600 м): узлы как плотность к
 *      решётке, пластины и четыре пробы (опора, два забоя луча, сфера) — каждая
 *      на карте с полем и на той же карте без поля, чтобы пункт 6 («рельеф не
 *      дороже вдвое») мерился отношением, а не плавающими микросекундами;
 *  13. Свет главы 12: улица держится луны, летающего пула огней в данных нет,
 *      грунт и полотно одной яркости;
 *  14. Главы 9–11 не вошли в рельефную ветку.
 */
import * as THREE from 'three';
import { createJsonMap } from '../src/json-map.js';
import { LEVEL_09 } from '../src/levels/level-09.js';
import { LEVEL_10 } from '../src/levels/level-10.js';
import { LEVEL_11 } from '../src/levels/level-11.js';
import { LEVEL_12 } from '../src/levels/level-12.js';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { validateLevel, LEVEL_SPEC_V2 } from '../tools/level-schema.mjs';
import { CONFIG } from '../src/config.js';
import { frameAt, unrotatePoint } from '../src/geo2d.js';

const J = CONFIG.jsonMap;
const STEP = CONFIG.building.stepUp;
const PLAYER_H = CONFIG.eyeHeight + 0.35;

// ------------------------------------------------------------------- фикстура

const DISTRICT_A = {
  id: 'a', block: { minX: -140, maxX: -20, minZ: -140, maxZ: -20 }, style: 'corporate',
  street: { pitch: 40, width: 12 }, lot: { pitch: 10, inset: 1.5, merge: 0.4 },
  height: { minFloors: 2, maxFloors: 8, floorHeight: 3.4 }, enterableEvery: 5,
  yaw: 18,
  polygon: [
    { x: -126, z: -78 }, { x: -82, z: -129 }, { x: -31, z: -123 },
    { x: -37, z: -51 }, { x: -78, z: -34 },
  ],
};
const DISTRICT_B = {
  id: 'b', block: { minX: 20, maxX: 140, minZ: 20, maxZ: 140 }, style: 'kitsch',
  street: { pitch: 34, width: 12 }, lot: { pitch: 9, inset: 1.5, merge: 0.45 },
  height: { minFloors: 2, maxFloors: 6, floorHeight: 3.2 }, enterableEvery: 6,
  roofs: { walkable: true, access: 0.5, parapet: 0.9 },
};

const baseRaw = () => ({
  kind: 'json2',
  metadata: { levelName: 'reliefCity', name: 'Кварталы на склоне', hint: '—', units: 'meters' },
  ground: { y: 0, size: 320, color: '#23262c' },
  relief: {
    baseY: 0,
    hills: [
      { id: 'hrub', x: -80, z: -80, radius: 400, height: 3 },
      { id: 'lon', x: 90, z: 90, radius: 400, height: -2 },
    ],
  },
  city: { seed: 70707, districts: [structuredClone(DISTRICT_A), structuredClone(DISTRICT_B)] },
  roads: [], buildings: [], landscapeObjects: [], lights: [],
  gameplay: {
    goal: 'exit', spawn: { x: -100, z: -100 }, exit: { x: 100, z: 100 }, exitRadius: 4,
    enemies: { count: 2 }, alienEnemies: { count: 1 },
  },
});

/**
 * Авторский цоколь: не районный лот, поэтому его площадка добавляется ПОСЛЕ
 * террасы, и переходное кольцо гнёт полотно соседних прогонов. Отметка считается
 * от террасы района 'b' (замер позиции и подъёма — 12×12 м в (56, 60) при +0,55 м
 * над районом): ниже — подъём тонет в допуске `streetFit`, выше — перекрёсток
 * перестаёт держать поле.
 */
let cachedRaw = null;
function raw() {
  if (cachedRaw) return structuredClone(cachedRaw);
  const plain = baseRaw();
  const terraceY = normalizeLevel(expandCity(structuredClone(plain)))
    .map.relief.pads.find(p => p.id === 'b:терраса').y;
  const withPlinth = baseRaw();
  withPlinth.buildings = [{
    id: 'plinth', isEnterable: false, floorsCount: 3, floorHeight: 3.4,
    baseY: +(terraceY + 0.55).toFixed(3),
    footprint: [{ x: 56, z: 54 }, { x: 68, z: 54 }, { x: 68, z: 66 }, { x: 56, z: 66 }],
    rooms: [],
  }];
  cachedRaw = withPlinth;
  return structuredClone(cachedRaw);
}

// ------------------------------------------------- независимое поле (свой код)

const ease = (t) => t * t * (3 - 2 * t);

function segDist(x, z, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  const l2 = dx * dx + dz * dz;
  const t = l2 > 0 ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2)) : 0;
  return Math.hypot(x - (ax + t * dx), z - (az + t * dz));
}

/**
 * Поле из НОРМАЛИЗОВАНных данных: сумма капсул плюс последовательное смешение
 * площадок `h ← h + (y − h) · вес`, вес — smoothstep от расстояния до rect'а в
 * его собственных осях.
 */
function makeField(relief) {
  const hills = relief.hills.map(h => ({ ...h, bx: h.bx ?? h.x, bz: h.bz ?? h.z }));
  const pads = relief.pads.map(p => ({
    minX: p.minX, maxX: p.maxX, minZ: p.minZ, maxZ: p.maxZ, y: p.y, blend: p.blend,
    rad: (p.yaw ?? 0) * Math.PI / 180,
    cx: (p.minX + p.maxX) / 2, cz: (p.minZ + p.maxZ) / 2,
  }));
  const padWeight = (p, x, z) => {
    let lx = x, lz = z;
    if (p.rad) {
      const dx = x - p.cx, dz = z - p.cz;
      const c = Math.cos(p.rad), s = Math.sin(p.rad);
      lx = p.cx + dx * c + dz * s;
      lz = p.cz - dx * s + dz * c;
    }
    const dx = Math.max(lx - p.maxX, p.minX - lx, 0);
    const dz = Math.max(lz - p.maxZ, p.minZ - lz, 0);
    const d = Math.hypot(dx, dz);
    return d >= p.blend ? 0 : ease(1 - d / p.blend);
  };
  const heightAt = (x, z) => {
    let y = relief.baseY;
    for (const h of hills) {
      const d = segDist(x, z, h.x, h.z, h.bx, h.bz);
      if (d < h.radius) y += h.height * ease(1 - d / h.radius);
    }
    for (const p of pads) y += (p.y - y) * padWeight(p, x, z);
    return y;
  };
  return { heightAt, pads, hills };
}

// ------------------------------------------------------------------- геометрия

/**
 * План и оси пластины настила: центр, полуоси вдоль `yaw`, отметки торцов и
 * РИСУНОК. Про `ramp` здесь не для полноты: подъём короче `J.rampEps` движок
 * не рисует наклоном и держит пластину плоской коробкой по `topY`, поэтому
 * читатель, который интерполирует `topAtMin/topAtMax` и не смотрит на `ramp`,
 * требует от опоры плоскости, которой в картинке нет (замер сюиты: лист 11 м с
 * подъёмом 0,008 м отвечал −0,649 там, где тест ждал −0,645).
 */
function plateOf(d) {
  const rad = (d.yaw ?? 0) * Math.PI / 180;
  return {
    cx: d.cx ?? (d.minX + d.maxX) / 2, cz: d.cz ?? (d.minZ + d.maxZ) / 2,
    c: Math.cos(rad), s: Math.sin(rad),
    half: (d.length ?? (d.maxX - d.minX)) / 2, w: (d.width ?? (d.maxZ - d.minZ)) / 2,
    y0: d.topAtMin, y1: d.topAtMax,
    ramp: !!d.ramp, topY: d.topY,
  };
}

/** Объявленная плоскость полотна в точке своих осей `u`. */
const planeTop = (p, u) => p.y0 + (p.y1 - p.y0) * ((u + p.half) / (2 * p.half));

/** Верх, который движок и рисует, и держит ногой: призма — плоскостью, коробка — `topY`. */
const drawnTop = (p, u) => (p.ramp ? planeTop(p, u) : p.topY);

/** Отметка полотна в мировой точке плана (или null — точка вне пластины). */
function deckTop(p, x, z, margin = 0) {
  const dx = x - p.cx, dz = z - p.cz;
  const u = dx * p.c + dz * p.s, v = -dx * p.s + dz * p.c;
  if (Math.abs(u) > p.half + margin || Math.abs(v) > p.w + margin) return null;
  return drawnTop(p, u);
}

/** Тот же план, но по объявленной плоскости: им меряется точность стыков в данных. */
function plateTopAt(p, x, z, margin = 0) {
  const dx = x - p.cx, dz = z - p.cz;
  const u = dx * p.c + dz * p.s, v = -dx * p.s + dz * p.c;
  if (Math.abs(u) > p.half + margin || Math.abs(v) > p.w + margin) return null;
  return planeTop(p, u);
}

/** Четыре угла плана пластины в мире. */
function plateCorners(p) {
  const out = [];
  for (const su of [-1, 1]) for (const sv of [-1, 1]) {
    const u = su * p.half, v = sv * p.w;
    out.push({ x: p.cx + u * p.c - v * p.s, z: p.cz + u * p.s + v * p.c });
  }
  return [out[0], out[1], out[3], out[2]];
}

/** Площади пересечения двух выпуклых планов: Sutherland–Hodgman по своим осям. */
function clipArea(aPts, bPts) {
  let poly = aPts;
  for (let i = 0; i < bPts.length && poly.length; i++) {
    const A = bPts[i], B = bPts[(i + 1) % bPts.length];
    const inside = (q) => ((B.x - A.x) * (q.z - A.z) - (B.z - A.z) * (q.x - A.x)) >= -1e-9;
    const out = [];
    for (let k = 0; k < poly.length; k++) {
      const P = poly[k], Q = poly[(k + 1) % poly.length];
      const pi = inside(P), qi = inside(Q);
      if (pi) out.push(P);
      if (pi !== qi) {
        const t = ((A.x - P.x) * (B.z - A.z) - (A.z - P.z) * (B.x - A.x))
          / (((Q.x - P.x) * (B.z - A.z) - (Q.z - P.z) * (B.x - A.x)) || 1e-12);
        out.push({ x: P.x + (Q.x - P.x) * t, z: P.z + (Q.z - P.z) * t });
      }
    }
    poly = out;
  }
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const A = poly[i], B = poly[(i + 1) % poly.length];
    s += A.x * B.z - B.x * A.z;
  }
  return Math.abs(s) / 2;
}

let built = null;

function builtMap() {
  if (!built) {
    const level = normalizeLevel(expandCity(raw()));
    const map = createJsonMap(level.map);
    map.build(new THREE.Scene());
    const plates = [];
    for (const r of level.map.roads) {
      for (const d of r.decks) {
        if (d.length === undefined) continue;
        plates.push({ id: r.id, crossing: /_x\d+_\d+$/.test(r.id), d, p: plateOf(d) });
      }
    }
    built = { level, map, field: makeField(level.map.relief), plates };
  }
  return built;
}

/** Прогоны района (перекрёстки — отдельная ветка): у них есть сосед по торцу. */
const runs = ctx => ctx.plates.filter(x => !x.crossing);
const crossings = ctx => ctx.plates.filter(x => x.crossing);

// ------------------------------------------------------------------- проверки

function testBrief() {
  const expanded = expandCity(raw());
  const { errors } = validateLevel(structuredClone(expanded), LEVEL_SPEC_V2);
  const level = normalizeLevel(expanded);
  const bad = [];
  if (errors.length) bad.push(`схема: ${errors.slice(0, 2).join(' | ')}`);
  if (level.warnings.length) bad.push(`предупреждения парсера: ${level.warnings.slice(0, 2).join(' | ')}`);
  const pads = level.map.relief.pads;
  const terraces = pads.filter(p => p.id.endsWith(':терраса'));
  if (terraces.length !== 2) bad.push(`террас ${terraces.length}, а районов два`);
  if (!pads.some(p => p.id === 'plinth:площадка')) bad.push('авторский цоколь остался без своей площадки');
  for (const key of ['district', 'grade', 'crossing', 'districtFrame']) {
    const leaked = JSON.stringify(level.map).includes(`"${key}"`);
    if (leaked) bad.push(`служебное поле ${key} доехало в модуль`);
  }
  const skew = level.map.roads.filter(r => r.id.startsWith('a_') && r.decks.length);
  if (!skew.length) bad.push('косой район остался без пластин');
  return {
    name: 'Бриф двух районов на склоне: схема и парсер молчат, террас по району, служебных полей в модуле нет',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${terraces.length} террасы (+${pads.length - terraces.length} площадок), ${builtMap().plates.length} пластин, `
        + `${level.map.buildings.length} корпусов, предупреждений 0`,
  };
}

function testTerraceHoldsTheQuarter() {
  const ctx = builtMap();
  const bad = [];
  const terraces = ctx.level.map.relief.pads.filter(p => p.id.endsWith(':терраса'));
  for (const t of terraces) {
    const id = t.id.split(':')[0];
    const frame = t.yaw ? frameAt((t.minX + t.maxX) / 2, (t.minZ + t.maxZ) / 2, t.yaw) : null;
    // 1) пол каждого лота района — отметка террасы: район выравнивается ОДНОЙ
    //    площадкой, а не островком под каждым домом
    const lots = ctx.level.map.buildings.filter(b => b.id.startsWith(`${id}_`) && !/_\d\d\d_/.test(b.id));
    if (lots.length < 5) bad.push(`район ${id}: одиночных лотов ${lots.length} — проверке не на чем стоять`);
    const off = lots.filter(b => Math.abs(b.baseY - t.y) > 1e-6);
    if (off.length) bad.push(`${off.length} лотов района ${id} не на террасе (первый baseY=${off[0].baseY}, терраса ${t.y})`);
    // 2) асфальт обязан лежать в ЯДРЕ террасы (вес 1 → поле там ровно плоское);
    //    на переходном кольце плоскость перекрёстка либо зарыта, либо горбит
    const plates = ctx.plates.filter(x => x.id.startsWith(`${id}_`));
    let outside = 0;
    for (const x of plates) {
      for (const q of plateCorners(x.p)) {
        const l = frame ? unrotatePoint(frame, q.x, q.z) : q;
        outside = Math.max(outside, t.minX - l.x, l.x - t.maxX, t.minZ - l.z, l.z - t.maxZ);
      }
    }
    if (outside > 2e-3) bad.push(`район ${id}: асфальт вышел за ядро террасы на ${outside.toFixed(4)} м`);
    if (!plates.length) bad.push(`район ${id}: пластин улиц 0`);
  }
  return {
    name: 'Терраса держит квартал: пол лотов — отметка района, асфальт целиком в её ядре',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : terraces.map(t => `${t.id}: ${t.y} м, ядро ${t.maxX - t.minX}×${t.maxZ - t.minZ} м`).join(' | '),
  };
}

function testAsphaltRidesTheField() {
  const ctx = builtMap();
  const bad = [];
  let worstDev = 0, worstBurial = 0, tilted = 0, probed = 0;
  // корыто: поле ПОД широкой пластиной не обязано быть равным полю на осевой, и
  // настил обязан накрывать именно его (замер главы 12: проспект 10 м на склоне
  // 0,048 м/м уходил берегом под грунт на 0,24 м, а в кольце террасы — на 0,456)
  let bedProbed = 0, bedBurial = 0, bedDev = 0, bedWhere = '';
  for (const x of runs(ctx)) {
    const p = x.p;
    const k = Math.max(2, Math.round((2 * p.half) / J.navStep));
    for (let i = 1; i < k; i++) {
      const t = i / k, u = -p.half + 2 * p.half * t;
      // меряется РИСУНОК: под ногой и под колесом именно он, а не объявленная
      // плоскость листа, чей подъём короче `rampEps` движок не рисует наклоном
      const want = drawnTop(p, u);
      const f = ctx.field.heightAt(p.cx + u * p.c, p.cz + u * p.s);
      probed++;
      // провал: грунт выше асфальта — опорой отвечает склон, и улица становится
      // канавой; горб: пластина стоит в воздухе, и под ней видна дыра
      worstBurial = Math.max(worstBurial, f - want);
      worstDev = Math.max(worstDev, Math.abs(f + J.streetRise - want));
      const hv = Math.max(0.05, p.w - 0.05);
      let fBed = -Infinity;
      for (const v of [-hv, 0, hv]) {
        const bx = p.cx + u * p.c - v * p.s, bz = p.cz + u * p.s + v * p.c;
        fBed = Math.max(fBed, ctx.field.heightAt(bx, bz));
      }
      bedProbed += 3;
      if (fBed - want > bedBurial) {
        bedBurial = fBed - want;
        bedWhere = `${x.id} при u=${u.toFixed(1)}: корыто ${fBed.toFixed(3)} против полотна ${want.toFixed(3)}`;
      }
      bedDev = Math.max(bedDev, Math.abs(fBed + J.streetRise - want));
    }
    if (p.ramp) tilted++;
  }
  if (worstBurial > 1e-3) bad.push(`${probed} проб: настил провалился под поле на ${worstBurial.toFixed(4)} м`);
  if (worstDev > J.streetFit + 1e-3) bad.push(`полотно разошлось с полем на ${worstDev.toFixed(4)} м при допуске ${J.streetFit}`);
  if (bedBurial > 1e-3) bad.push(`${bedProbed} проб по корыту: настил провалился под грунт на ${bedBurial.toFixed(4)} м (${bedWhere})`);
  if (bedDev > J.streetFit + 1e-3) bad.push(`полотно разошлось с корытом на ${bedDev.toFixed(4)} м при допуске ${J.streetFit}`);
  if (tilted < 5) bad.push(`наклонных пластин ${tilted}: улицы легли плоской лентой, а не профилем`);
  return {
    name: 'Полотно улицы = поле + streetRise И ПО КОРЫТУ (максимум поперёк ширины), провала нет',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${probed} проб по ${runs(ctx).length} прогонам, худшее расхождение ${worstDev.toFixed(4)} м (допуск ${J.streetFit}), `
        + `провал ${worstBurial.toExponential(1)} м, наклонных пластин ${tilted}; `
        + `корыто: ${bedProbed} проб, горб ${bedDev.toFixed(4)} м, провал ${bedBurial.toExponential(1)} м`,
  };
}

function testDeckIsTheSupport() {
  const ctx = builtMap();
  const map = ctx.map;
  const bad = [];
  let checked = 0, flattened = 0, worstFlat = 0;
  for (const x of ctx.plates) {
    const p = x.p;
    // лист с ненулевым подъёмом, который движок кладёт плоской коробкой: сам
    // факт легитимен (порог `rampEps`), но без замера он остался бы тем, что
    // сюжет путает картинку с объявленной плоскостью
    if (!p.ramp && Math.abs(p.y1 - p.y0) > 1e-9) {
      flattened++;
      worstFlat = Math.max(worstFlat, Math.abs(planeTop(p, 0) - p.topY));
    }
    for (const frac of [-0.35, 0, 0.35]) {
      const u = frac * 2 * p.half;
      const px = p.cx + u * p.c, pz = p.cz + u * p.s;
      const want = drawnTop(p, u);
      // взгляд сверху: опорой обязан быть настил, а не поле под ним
      const g = map.groundHeightAt(px, pz, 500);
      checked++;
      if (Math.abs(g - want) > 1e-3) {
        bad.push(`${x.id} при u=${u.toFixed(1)}: опора ${g.toFixed(3)} вместо полотна ${want.toFixed(3)} `
          + `(поле ${ctx.field.heightAt(px, pz).toFixed(3)}, ramp=${p.ramp})`);
      }
    }
  }
  if (worstFlat > J.rampEps + 1e-3) {
    bad.push(`плоская коробка держит поле на ${worstFlat.toFixed(4)} м ниже объявленного среза при пороге ${J.rampEps}`);
  }
  return {
    name: 'Опора ноги на пластине отвечает её РИСУНОК (призма — плоскость, коробка — topY), а не склон',
    passed: bad.length === 0,
    info: bad.length ? `${bad.length} пробы из ${checked}: ${bad.slice(0, 2).join('; ')}`
      : `${checked} проб по ${ctx.plates.length} пластинам сошлись с полотном до миллиметра; `
        + `подпороговых подъёмов, сглаженных в коробку, ${flattened} (худшее расхождение ${worstFlat.toFixed(4)} м)`,
  };
}

function testCrossingOnePlane() {
  const ctx = builtMap();
  const bad = [];
  let joints = 0, worstJoint = 0, drawnJoints = 0, worstDrawn = 0;
  for (const x of crossings(ctx)) {
    const p = x.p;
    // крен вдоль той оси квадрата, где перепад поля больше: у пластины один
    // подъём, и поперёк она остаётся горизонтальной
    const along = ctx.field.heightAt(p.cx + p.c * p.half, p.cz + p.s * p.half)
      - ctx.field.heightAt(p.cx - p.c * p.half, p.cz - p.s * p.half);
    const across = ctx.field.heightAt(p.cx - p.s * p.w, p.cz + p.c * p.w)
      - ctx.field.heightAt(p.cx + p.s * p.w, p.cz - p.c * p.w);
    if (Math.abs(along) < Math.abs(across) - 1e-3) {
      bad.push(`${x.id}: крен вдоль оси ${along.toFixed(3)} м меньше перепада поперёк ${across.toFixed(3)} м`);
    }
    // торцы прогонов, вставшие к её борту, обязаны лежать в ЕЁ плоскости:
    // расхождение = ступень на всю ширину проезда. Меряется дважды: по
    // объявленным срезам (стык в данных обязан быть точен) и по рисуноку
    // (коробка вместо призмы имеет право отойти не дальше `rampEps`)
    for (const y of runs(ctx)) {
      if (y.id === x.id) continue;
      for (const q of [plateCorners(y.p)[0], plateCorners(y.p)[2]]) {
        for (const [scan, key] of [[plateTopAt, 'declared'], [deckTop, 'drawn']]) {
          const onX = scan(p, q.x, q.z, 0.02);
          if (onX === null) continue;
          const mine = scan(y.p, q.x, q.z, 0.02);
          if (mine === null) continue;
          if (key === 'declared') {
            joints++;
            worstJoint = Math.max(worstJoint, Math.abs(onX - mine));
          } else {
            drawnJoints++;
            worstDrawn = Math.max(worstDrawn, Math.abs(onX - mine));
          }
        }
      }
    }
  }
  if (!crossings(ctx).length) bad.push('перекрёстков в фикстуре нет');
  if (joints < 40) bad.push(`стыков «прогон → перекрёсток» ${joints}: прогоны не сходятся с площадкой`);
  if (worstJoint > 2e-3) bad.push(`худший стык по срезам ${worstJoint.toFixed(5)} м — плоскости в данных разошлись`);
  if (worstDrawn > J.rampEps + 1e-3) {
    bad.push(`стык по рисуноку разошёлся на ${worstDrawn.toFixed(5)} м при пороге плоской коробки ${J.rampEps}`);
  }
  return {
    name: 'Перекрёсток держит поле одной плоскостью: крен вдоль большей оси, торцы прогонов в её отметке',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${crossings(ctx).length} площадок, ${joints} стыков: по срезам ${worstJoint.toExponential(1)} м, `
        + `по рисуноку ${worstDrawn.toFixed(5)} м (${drawnJoints} стыков)`,
  };
}

function testNoCoplanarOverlaps() {
  const ctx = builtMap();
  const plates = ctx.plates;
  const pairs = [];
  let area = 0;
  for (let i = 0; i < plates.length; i++) {
    for (let k = i + 1; k < plates.length; k++) {
      const a = plates[i].p, b = plates[k].p;
      // быстрый фильтр по центрам: пересечение планов искать дорого, а лежат
      // пластины рядом или нет — видно по дистанции центров
      if (Math.hypot(a.cx - b.cx, a.cz - b.cz) > a.half + a.w + b.half + b.w) continue;
      const cornersA = plateCorners(a), cornersB = plateCorners(b);
      const inter = clipArea(cornersA, cornersB);
      if (inter <= 1e-4) continue;
      // со-плоскостные — те, чьи отметки в общей точке различаются на шум шва:
      // мигание в z-buffer там, где нога стоит ровно
      const mid = { x: (a.cx + b.cx) / 2, z: (a.cz + b.cz) / 2 };
      const ta = deckTop(a, mid.x, mid.z, 0.5), tb = deckTop(b, mid.x, mid.z, 0.5);
      if (ta === null || tb === null) continue;
      if (Math.abs(ta - tb) > 0.02) continue;
      pairs.push(`${plates[i].id}×${plates[k].id}`);
      area += inter;
    }
  }
  return {
    name: 'Со-плоскостных наложений точных планов нет (мера — Sutherland–Hodgman, не мировой габарит)',
    passed: pairs.length === 0,
    info: pairs.length ? `${pairs.length} пар на ${area.toFixed(1)} м²: ${pairs.slice(0, 4).join(', ')}`
      : `${plates.length} пластин → 0 пар наложений (${(plates.length * (plates.length - 1) / 2) | 0} проверок)`,
  };
}

function testBodyWalksTheStreet() {
  const ctx = builtMap();
  const map = ctx.map;
  const bad = [];
  const r = Math.max(CONFIG.radius, J.navEdgeProbe);
  let walked = 0;
  for (const x of runs(ctx).filter(y => y.p.half > 4)) {
    const p = x.p;
    for (let s = 1; s < 4; s++) {
      const t = s / 4, u = -p.half + 2 * p.half * t;
      const px = p.cx + u * p.c, pz = p.cz + u * p.s;
      const feet = map.groundHeightAt(px, pz, 500);
      walked++;
      if (map.isBlocked(px, pz, r, feet + 0.02, PLAYER_H)) {
        bad.push(`${x.id} при u=${u.toFixed(1)}: полотно ${feet.toFixed(2)} м держит блокаду`);
      }
      // сфера на пластине выталкивается по её нормали: вертикальный зазор —
      // r / cos уклона, поэтому «нога стоит» проверяется с тем же допуском, что
      // и у уклона улицы
      const c = new THREE.Vector3(px, feet + r, pz);
      // `resolveSphere` возвращает флаг и двигает тело на месте: `moved.y` вместо
      // `c.y` давал NaN, и «сфера не проваливается» не проверялось ни разу
      map.resolveSphere(c, r);
      const sink = feet + r - c.y;
      if (sink > r + 1e-3) bad.push(`${x.id}: сфера провалилась под полотно на ${sink.toFixed(2)} м`);
    }
  }
  if (walked < 40) bad.push(`пробегом проверено ${walked} точек улицы`);
  return {
    name: 'Тело самоходом идёт по полотну: блокады нет, сфера не проваливается под асфальт',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ') : `${walked} точек по ${runs(ctx).filter(y => y.p.half > 4).length} прогонам`,
  };
}

function testOneNetwork() {
  const ctx = builtMap();
  const map = ctx.map, nav = map.nav;
  const n = nav.adj.length;
  const sp = map.spec.spawn;
  const start = nav.nearestNode(sp.x, map.groundHeightAt(sp.x, sp.z, 500), sp.z);
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const cur = queue.pop();
    for (const nb of nav.adj[cur] || []) if (!seen.has(nb)) { seen.add(nb); queue.push(nb); }
  }
  const offSupport = [];
  for (let i = 0; i < n; i++) {
    const p = nav.pos[i];
    const g = map.groundHeightAt(p.x, p.z, 500);
    if (Math.abs(g - p.y) > 0.02) offSupport.push(`(${p.x.toFixed(1)}, ${p.z.toFixed(1)}) узел ${p.y.toFixed(2)}, опора ${g.toFixed(2)}`);
  }
  const bad = [];
  if (seen.size !== n) bad.push(`связных узлов ${seen.size} из ${n}: граф рассыпался на карманы`);
  if (offSupport.length) bad.push(`${offSupport.length} узлов вне своей опоры (первый ${offSupport[0]})`);
  return {
    name: 'Граф — одна связная сеть, и каждый узел стоит ровно на своей опоре',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${seen.size}/${n} узлов достижимы от спавна, 0 узлов не на своей опоре`,
  };
}

/**
 * Ребро графа проходимо ногами, если опора вдоль него не уходит глубже
 * `J.navEdgeDrop` (иначе нога падает в проём) и не горбит выше конца ребра на
 * шаг ноги. Сравнивать её с прямой между узлами нельзя: опора кусочная — настил,
 * потом плоскость террасы, и прямая между их отметками по средине просто
 * висит над тем, что под ногой (замер: 0,06–0,07 м на ребре «улица → терраса»
 * при провале, которого нет вовсе).
 */
function testRoutesBetweenTiers() {
  const ctx = builtMap();
  const map = ctx.map, nav = map.nav;
  const node = (x, z) => nav.pos[nav.nearestNode(x, map.groundHeightAt(x, z, 500), z)];
  const pairs = [
    ['спавн → выход (терраса a → терраса b)', node(-100, -100), node(100, 100)],
    ['центр косого района → рынок осевого', node(-80, -80), node(80, 80)],
  ];
  const bad = [];
  const info = [];
  for (const [name, a, b] of pairs) {
    const path = nav.findPath(a, b);
    if (!path || path.length < 4) { bad.push(`${name}: маршрут не найден (${path ? path.length : 0} узлов)`); continue; }
    let worstRise = 0, worstDrop = 0, worstHump = 0, where = '';
    for (let i = 1; i < path.length; i++) {
      const from = path[i - 1], to = path[i];
      worstRise = Math.max(worstRise, Math.abs(to.y - from.y));
      const len = Math.hypot(to.x - from.x, to.z - from.z);
      const steps = Math.max(1, Math.ceil(len / J.navEdgeProbe));
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = from.x + (to.x - from.x) * t, z = from.z + (to.z - from.z) * t;
        const edge = from.y + (to.y - from.y) * t;
        const g = map.groundHeightAt(x, z, Math.max(from.y, to.y));
        const drop = edge - g, hump = g - Math.max(from.y, to.y);
        if (drop > worstDrop || hump > worstHump) {
          worstDrop = Math.max(worstDrop, drop);
          worstHump = Math.max(worstHump, hump);
          where = `(${x.toFixed(1)}, ${z.toFixed(1)})`;
        }
      }
    }
    if (worstDrop > J.navEdgeDrop) bad.push(`${name}: ребро уходит под опору на ${worstDrop.toFixed(2)} м при пределе ${J.navEdgeDrop} — ${where}`);
    if (worstHump > STEP) bad.push(`${name}: опора горбит над ребром на ${worstHump.toFixed(2)} м при шаге ноги ${STEP} — ${where}`);
    if (worstRise > STEP) bad.push(`${name}: подъём соседних узлов ${worstRise.toFixed(2)} м выше шага ноги ${STEP}`);
    info.push(`${name}: ${path.length} узлов, худший провал ${worstDrop.toFixed(2)} м (предел ${J.navEdgeDrop}), `
      + `горб ${worstHump.toFixed(2)} м, подъём ребра ${worstRise.toFixed(2)} м при шаге ноги ${STEP.toFixed(2)}`);
  }
  return {
    name: 'Маршрут A→B и маршрут между ярусами существуют, и опора под каждым ребром в пределах ноги',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ') : info.join(' | '),
  };
}

function testCrossingMarks() {
  const ctx = builtMap();
  const marks = ctx.map.debugIds();
  const list = crossings(ctx);
  const bad = [];
  // площадка асфальта — объект данных: у неё своя запись дороги и своя метка,
  // а не следствие перекрытия двух полос, которое панель не подписывает
  const missing = list.filter(x => !marks.some(m => m.text.startsWith(`${x.id} ·`)));
  if (missing.length) bad.push(`${missing.length} площадок без метки id (первые ${missing.slice(0, 3).map(x => x.id).join(', ')})`);
  let above = 0;
  for (const x of list) {
    const m = marks.find(mm => mm.text.startsWith(`${x.id} · пл`));
    if (!m) continue;
    const f = ctx.field.heightAt(m.x, m.z);
    if (m.y < f) bad.push(`${x.id}: метка «${m.text}» под полем (${f.toFixed(2)} м)`);
    else above++;
    // квадрат w × w, а не две перекрывающиеся полосы: на косом районе мировой
    // габарит раскололся бы на четыре прямоугольника
    if (Math.abs(x.d.length - x.d.width) > 1e-3) {
      bad.push(`${x.id}: пластина ${x.d.length}×${x.d.width} м — площадка перекрёстка не квадрат`);
    }
  }
  return {
    name: 'Метки id подписывают перекрёстки: у площадки своя запись, она квадратная и метка стоит над полем',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${marks.length} меток, ${list.length} перекрёстков подписаны и квадратны, ${above} меток над полем`,
  };
}

/**
 * Разогрев и лучшее из трёх окон по 60 мс. Одиночное окно на холодном JIT
 * ловит компиляцию и GC-паузу: на пороге 2 мкс это красит сюжет без изменения
 * геометрии (замер одного и того же графа в одной странице — 1,52 / 1,85 /
 * 3,54 мкс/вызов, а первым прогоном на свежем документе и 2,09).
 */
function bestWindow(measure) {
  let best = { per: Infinity, calls: 0 };
  for (let k = 0; k < 4; k++) {
    const t0 = performance.now();
    let calls = 0;
    while (performance.now() - t0 < 60) calls += measure();
    const per = (performance.now() - t0) * 1000 / calls;
    // первое окно — разогрев, оно не идёт в verdict
    if (k > 0 && per < best.per) best = { per, calls };
  }
  return best;
}

function testBudget() {
  const ctx = builtMap();
  const map = ctx.map;
  const nodes = map.nav.adj.length;
  const plates = ctx.plates.length;
  const bad = [];
  if (nodes > 9000) bad.push(`узлов графа ${nodes} при бюджете 9 000`);
  if (plates > 400) bad.push(`пластин ${plates} при бюджете 400`);
  const support = bestWindow(() => {
    for (let i = 0; i < 2000; i++) {
      const x = -150 + (i * 7.13) % 300;
      const z = -150 + (i * 11.77) % 300;
      map.groundHeightAt(x, z, ctx.field.heightAt(x, z));
    }
    return 2000;
  });
  const ray = bestWindow(() => {
    for (let i = 0; i < 200; i++) {
      const x = -150 + (i * 17.3) % 300;
      const z = -150 + (i * 7.7) % 300;
      map.raySolid(x, 60, z, 0, -1, 0, 120);
    }
    return 200;
  });
  const perSupport = support.per, perRay = ray.per;
  if (perSupport > 2) bad.push(`опора ${perSupport.toFixed(2)} мкс/вызов (бюджет 2 мкс)`);
  if (perRay > 200) bad.push(`луч ${perRay.toFixed(1)} мкс/вызов (бюджет 200 мкс)`);
  return {
    name: 'Бюджет фикстуры (300 × 300 м): узлы ≤ 9 000, пластины ≤ 400, опора ≤ 2 мкс, луч ≤ 200 мкс',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ')
      : `${nodes} узлов, ${plates} пластин, опора ${perSupport.toFixed(3)} мкс × ${support.calls}, луч ${perRay.toFixed(1)} мкс × ${ray.calls}`,
  };
}

/**
 * Бюджет **собранного модуля главы 12** — 600 × 600 м, рельеф, косые районы,
 * 220 пластин настила.
 *
 * Предыдущая проверка мерит фикстуру сюиты 300 × 300 м, то есть ровно то, из-за
 * чего вопрос о бюджетах главы 12 и оставался открытым: зелёный сюжет не видел
 * настоящего графа. Здесь тот же протокол времени (разогрев и лучшее из трёх
 * окон по 60 мс), но на зарегистрированной главе, и пробы взяты те, которые
 * движок действительно делает:
 *  • `groundHeightAt(x, z, 500)` — нога и маяк точки B;
 *  • `relief.heightAt` — одна проба поля (нога платит её вместе с опорой, а
 *    решётка навигации и картинка грунта — на каждую клетку);
 *  • нисходящий луч 120 м и выстрел на всю дальность (`CONFIG.weapon.range`) —
 *    худшие случаи `raySolid`;
 *  • `resolveSphere` — тело Чужого, вызов на каждый кадр.
 *
 * Пределы = число пункта 6 плана плюс 25 % на разброс машины. Без запаса сюжет
 * краснеет на неизменном графе: окно 60 мс ловит GC и компиляцию, и на этом же
 * модуле опора уже читалась от 1,67 до 3,54 мкс (этап 7 — сюиту бюджетов
 * переводили на разогрев и лучшее из окон именно поэтому).
 *
 * Узлы меряются **плотностью к решётке**, а не абсолютным числом. Исходное
 * «≤ 9 000 при 600 м» сравнивало главу 12 с главой 10, у которой решётку съели
 * дома (2 420 узла значили «проходима только улица», а не «рельеф дёшев»;
 * у самой главы 10 узлов 13 881). Смысл ограничения «рельеф не должен удвоить
 * узлы» — в том, сколько промежуточных узлов добавляет склон (`_linkRise`) и
 * сколько кладут сверху решётки кровли и настилы: ≤ 1,5 решёточной точки на
 * клетку шага `J.navStep`.
 *
 * До индекса планов (луч и сферы перебирали ВСЕ призмы, перила и дуги) эти же
 * пробы на главе 12 стоили 208 мкс на луче в 2,7 м, 256 мкс на 120 м вниз,
 * 358 мкс на выстреле 180 м и 21,7 мкс на сфере — то есть цену вызова определяло
 * число настилов во всём городе, а не то, куда летит луч (тот же v2-движок без
 * поля: 123 / 147 / 193 / 5,8). Поле после правки без аллокаций на пробу было
 * 0,76…0,90 мкс; этап 11 проиндексировал и холмы (перебор всех записей брифа
 * дорожал с каждой новой сопкой — тот же дефект, что у луча) и снял пробу до
 * 0,40…0,51 мкс. Замеры по главам и таблица — в docs/architecture-json-levels.md.
 */
function testChapterBudget() {
  const map = createJsonMap(LEVEL_12.map);
  map.build(new THREE.Scene());
  // та же глава, но без поля: `groundPlane` возвращается, `relief`-ветки (`_reliefRay`,
  // `_reliefPush`, опора от отметки поля) не идут, а солиды, настилы, призмы и дуги
  // остаются те же. Отношение двух замеров одного прогона и есть пункт 6 («поле не
  // дороже вдвое против той же карты без поля») — абсолютные микросекунды от машины
  // плавают в полтора раза (выстрел на 180 м: 175 мкс на свежем документе и 302 мкс
  // в сюжете, где уже собраны другие карты), отношение — нет.
  const plainSpec = { ...LEVEL_12.map, relief: null };
  const plain = createJsonMap(plainSpec);
  plain.build(new THREE.Scene());
  const nodes = map.nav.adj.length;
  const lattice = (Math.floor(map.width / J.navStep) + 1) ** 2;
  const plates = LEVEL_12.map.roads.flatMap(r => r.decks).filter(d => d.length !== undefined).length;
  const range = CONFIG.weapon.range;
  const half = map.width / 2 - 1;
  const bad = [];
  if (nodes > lattice * 1.5) {
    bad.push(`узлов ${nodes} — это ${(nodes / lattice).toFixed(2)}× решётки ${lattice} при пределе 1,5×`);
  }
  if (plates > 400) bad.push(`пластин ${plates} при бюджете 400`);
  /**
   * Протокол замера — **итерациями фиксированной длины, вперемешку парами, и
   * медиана; итерация длинная (5…10 мс), потому что часы браузера квантованы**.
   *
   * Хронометраж двух больших карт в одной странице шумит на ±50 %, и перестановка
   * harness-а шум не убирает (замеры одной и той же собранной главы подряд):
   *  • этап 10 (лучшее из трёх окон по 60 мс, сначала сторона «с полем», потом
   *    «без») — опора 1,76× и 2,18× на пороге 2,0: стороны меряются в разные
   *    моменты, и сюжет краснила или маскировала правку без всякой правки;
   *  • пачки по 2 мс тем же чередованием — луч вниз 0,74× / 2,43× / 2,38×:
   *    число вызовов в пачке «плывёт», а короткие пачки не успевают прогреть IC;
   *  • девять пар по 1000 вызовов опоры (первая версия здесь) — в свежем документе
   *    1,25…1,60×, а при третьем подряд прогоне сюита в том же документе (в нём
   *    уже живут четыре собранные главы 12) 1,82× и **2,11×**: 1000 вызовов по
   *    2 мкс — это 2 мс на итерацию при кванте `performance.now()` 0,1 мс, то
   *    есть ±5 % только на часах, а GC-пауза целиком съедает короткую итерацию
   *    одной стороны пары. Граф при этом не менялся: прогон в свежем документе
   *    снова даёт 1,56…1,60×.
   *  • здесь: итерация удлинена до 5…10 мс (опора 8000 вызовов, луч 64, выстрел
   *    48, сфера 600, поле 8000), пар 12, в вердикт — медиана. Квант часов теперь
   *    ≤ 2 % итерации, а единичная пауза не переносит медиану.
   * Абсолютные пределы (п. 6: 1 / 2 мкс, 200 / 20 мкс + 25 %) меряются окном в
   * 60 мс, а не медианой: числа этапа 10 (опора 1,86, луч 102, сфера 13,7)
   * получены окном, и перекалибровка порогов из-за смены часов не входила в
   * правку. В вердикт идут оба протокола, и журнал обязан показывать, чем
   * именно они расходятся: на коротких итерациях медиана двух больших карт в одном
   * документе отвечала дороже лучшего окна в 2,5…3 раза (поле 1,25…1,30 против
   * 0,44…0,47, опора 3,90…4,00 против 1,36…1,57) — это была плата за квант
   * часов, а не свойство поля; на длинных итерациях протоколы сходятся (поле
   * 0,57…0,99 против 0,47…0,51, опора 1,55…1,66 против 1,30…1,67).
   */
  const ITER = 12;
  const median = (xs) => xs.slice().sort((a, b) => a - b)[xs.length >> 1];
  const paired = (onFn, offFn) => {
    const on = [], off = [];
    for (let k = 0; k < 3; k++) { onFn(); offFn(); }
    for (let i = 0; i < ITER; i++) {
      for (const [fn, out] of [[onFn, on], [offFn, off]]) {
        const t0 = performance.now();
        const calls = fn();
        out.push((performance.now() - t0) * 1000 / calls);
      }
    }
    const a = median(on), b = median(off);
    return { on: a, off: b, ratio: b > 0 ? a / b : Infinity };
  };
  /** То же для одной стороны: «поля без поля» не бывает, отношения нет. */
  const solo = (fn) => {
    const xs = [];
    for (let k = 0; k < 3; k++) fn();
    for (let i = 0; i < ITER; i++) {
      const t0 = performance.now();
      const calls = fn();
      xs.push((performance.now() - t0) * 1000 / calls);
    }
    return median(xs);
  };
  // одна и та же работа на обеих картах: `map` с полем и `plain` без него;
  // частные случайные точки — те же, что со времён этапа 6, только повторений
  // больше (см. протокол выше: итерация обязана стоить 5…10 мс, а не 1…2)
  const work = (m) => ({
    field: () => {
      for (let i = 0; i < 8000; i++) m.relief.heightAt(-half + (i * 7.13) % (2 * half), -half + (i * 11.77) % (2 * half));
      return 8000;
    },
    support: () => {
      for (let i = 0; i < 8000; i++) m.groundHeightAt(-half + (i * 7.13) % (2 * half), -half + (i * 11.77) % (2 * half), 500);
      return 8000;
    },
    down: () => {
      for (let i = 0; i < 64; i++) m.raySolid(-half + (i * 17.3) % (2 * half), 60, -half + (i * 7.7) % (2 * half), 0, -1, 0, 120);
      return 64;
    },
    shot: () => {
      for (let i = 0; i < 48; i++) m.raySolid(-half + (i * 13.1) % (2 * half), 1.6, -half + (i * 5.9) % (2 * half), 1, 0, 0, range);
      return 48;
    },
    sphere: () => {
      const body = { x: 0, y: 0, z: 0 };
      for (let i = 0; i < 600; i++) {
        const x = -half + (i * 3.7) % (2 * half), z = -half + (i * 9.1) % (2 * half);
        body.x = x; body.z = z; body.y = m.groundHeightAt(x, z, 500) + 0.5;
        m.resolveSphere(body, CONFIG.alien.radius);
      }
      return 600;
    },
  });
  const onW = work(map), offW = work(plain);
  const field = solo(onW.field);
  const support = paired(onW.support, offW.support);
  const down = paired(onW.down, offW.down);
  const shot = paired(onW.shot, offW.shot);
  const sphere = paired(onW.sphere, offW.sphere);
  // окно этапа 10 — для абсолютных пределов, чтобы числа были сравнимы с журналом
  const win = {
    field: bestWindow(onW.field).per,
    support: bestWindow(onW.support).per,
    down: bestWindow(onW.down).per,
    shot: bestWindow(onW.shot).per,
    sphere: bestWindow(onW.sphere).per,
  };
  if (win.field > 1.25) bad.push(`поле ${win.field.toFixed(2)} мкс/проба окном (предел 1 мкс + 25 %)`);
  if (win.support > 2.5) bad.push(`опора ${win.support.toFixed(2)} мкс/вызов окном (пункт 6: 2 мкс, предел 2,5)`);
  if (win.down > 250) bad.push(`луч нисходящий ${win.down.toFixed(0)} мкс/вызов окном (пункт 6: 200 мкс, предел 250)`);
  if (win.sphere > 25) bad.push(`сфера ${win.sphere.toFixed(1)} мкс/вызов окном (20 мкс, предел 25)`);
  for (const [name, r] of [['опора', support], ['луч вниз', down], ['выстрел', shot], ['сфера', sphere]]) {
    if (r.ratio > 2) bad.push(`${name}: с полем ${r.on.toFixed(1)} мкс против ${r.off.toFixed(1)} мкс без поля — это ${r.ratio.toFixed(2)}× (пункт 6: не дороже вдвое)`);
  }
  return {
    name: 'Бюджет собранной главы 12: узлы ≤ 1,5 решётки, пластины ≤ 400, опора ≤ 2,5 мкс, луч ≤ 250 мкс и всё это не дороже вдвое против той же карты без поля',
    passed: bad.length === 0,
    // числа прогона обязательны и в красной строке: без них провал нечем
    // задокументировать и не с чем сравнить после правки. «против» и «×» —
    // медиана пар (один протокол на обе стороны), «окном» — абсолютные пределы
    info: (bad.length ? bad.join('; ') + ' — ' : '')
      + `${nodes} узлов на решётке ${lattice} (${(nodes / lattice).toFixed(2)}×), ${plates} пластин; `
        + `поле ${field.toFixed(2)} медианой / ${win.field.toFixed(2)} окном; `
        + `опора ${support.on.toFixed(2)} против ${support.off.toFixed(2)} (${support.ratio.toFixed(2)}×), окном ${win.support.toFixed(2)}; `
        + `луч 120 м ${down.on.toFixed(0)} против ${down.off.toFixed(0)} (${down.ratio.toFixed(2)}×), окном ${win.down.toFixed(0)}; `
        + `выстрел ${range} м ${shot.on.toFixed(0)} против ${shot.off.toFixed(0)} (${shot.ratio.toFixed(2)}×), окном ${win.shot.toFixed(0)}; `
        + `сфера ${sphere.on.toFixed(1)} против ${sphere.off.toFixed(1)} (${sphere.ratio.toFixed(2)}×), окном ${win.sphere.toFixed(1)}`,
  };
}

/**
 * Свет главы 12 — луна, и больше ничего летающего. Числа сняты фотометрией на
 * странице игры (рендер в `WebGLRenderTarget(FloatType)`, линейные пиксели →
 * sRGB, медиана кадра 200 × 200 с камерой в 3 м над отметкой настила):
 *  • пул `sky.lights` (главы 3–11) даёт «улицу под фонарём» 68, но это 8
 *    настоящих источников, следующих за камерой, — в пешеходном городе они
 *    летают вокруг игрока; без пула и луне брифа 0,55 асфальт читается 32…39,
 *    грунт (#1a1d22) — 23…31, фасад 49…62 на свету, 5 в тени, небо 16;
 *  • ambient улицу не делает: hemi, поднятый до 1,8, даёт асфальту 36, а
 *    теневой фасад 5 → 14, то есть съедает ночь, не освещая дорогу;
 *  • луна 3,5: асфальт 42 — порог «улица без огней 40» из
 *    docs/architecture-glb.md, фасад на свету 62 остаётся в поясе 39…65;
 *  • цвет грунта — тот же асфальт (#2a2d33): при #1a1d22 склон читался 31
 *    против 42 на полотне, хотя и то и другое одна и та же опора под ногой.
 * Сюита второго GL-контекста не заводит и пиксели не меряет, поэтому проверяет
 * договор, который эти числа держит: пула нет, луна не ниже замеренного предела,
 * ambient не выше него, статичные подсветки светят вверх (полотно делают не они),
 * грунт и полотно одного цвета.
 */
function testMoonLight() {
  const sky = LEVEL_12.sky;
  const spec = LEVEL_12.map;
  const bad = [];
  if (sky.lights !== undefined) bad.push('пул летающих огней вернулся в `sky.lights`');
  const moon = sky.sun?.intensity ?? 0;
  if (moon < 3.5) bad.push(`луна ${moon}: при 0,55 улица читается 32, а порог «без огней» — 40`);
  const hemi = sky.hemi?.intensity ?? 9;
  if (hemi > 1) bad.push(`hemi ${hemi}: ambient поднимает теневой фасад (5 → 14), а не улицу (32 → 36)`);
  const wash = (spec.lights ?? []).filter(l => l.type !== 'directional');
  const atPavement = wash.filter(l => !l.target || l.target.y <= l.position.y);
  if (atPavement.length) {
    bad.push(`подсветка ${atPavement.map(l => l.id).join(', ')} светит не вверх — она освещает полотно, а не фасад`);
  }
  const color = spec.ground.color;
  const hex = typeof color === 'string' ? parseInt(color.replace('#', ''), 16) : color;
  if (hex !== J.asphalt) {
    bad.push(`грунт ${(color ?? '').toString()} не в цвет полотна ${J.asphalt.toString(16)}: тот же склон читался 31 против асфальта 42`);
  }
  return {
    name: 'Свет главы 12: луна тянет улицу (≥ 40), летающих огней нет, грунт и полотно одной яркости',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ')
      : `луна ${moon}, hemi ${hemi}, статичных подсветок ${wash.length} (все вверх), грунт #${hex.toString(16)} = асфальт; `
        + 'замеры: асфальт/склон 42/40…41, фасад 62 на свету и 5 в тени, небо 16 (sRGB)',
  };
}

function testFrozenChapters() {
  const bad = [];
  const info = [];
  for (const [name, spec] of [['глава 9', LEVEL_09.map], ['глава 10', LEVEL_10.map], ['глава 11', LEVEL_11.map]]) {
    const map = createJsonMap(spec);
    if (map.relief !== null) bad.push(`${name}: поле рельефа построено у замороженной главы`);
    const decks = spec.roads.flatMap(r => r.decks).filter(d => d.length !== undefined);
    const crossing = spec.roads.filter(r => /_x\d+_\d+$/.test(r.id));
    if (crossing.length) bad.push(`${name}: перекрёстки генератора приехали в замороженную главу`);
    const profiled = decks.filter(d => Math.abs((d.topAtMax ?? d.topAtMin) - d.topAtMin) > 1e-9);
    info.push(`${name}: ${decks.length} пластин, ${profiled.length} с подъёмом`);
    if (name !== 'глава 11' && profiled.length && spec.relief === undefined) {
      // у глав без рельефа настил обязан лежать ровно на `ground.y + streetRise`
      const off = decks.filter(d => Math.abs(d.topAtMin - (spec.ground.y + J.streetRise)) > 1e-9);
      if (off.length) bad.push(`${name}: ${off.length} пластин не на «ground.y + streetRise» (первая ${off[0].topAtMin})`);
    }
  }
  const v1 = expandCity(structuredClone(baseRawNoRelief()));
  if (!v1.roads.every(r => r.points && !r.crossing)) bad.push('генератор v1 поехал в пластины и перекрёстки');
  return {
    name: 'Заморозка: главы 9–11 не получили ни поля рельефа, ни перекрёстков, улицы v1 — полоса points',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ') : info.join(' | '),
  };
}

function baseRawNoRelief() {
  const raw = baseRaw();
  delete raw.relief;
  delete raw.city.districts[0].yaw;
  delete raw.city.districts[0].polygon;
  raw.kind = 'json';
  raw.ground.size = 300;
  return raw;
}

// --------------------------------------------------------------------- запуск

export async function runReliefCityTests() {
  const tests = [
    testBrief,
    testTerraceHoldsTheQuarter,
    testAsphaltRidesTheField,
    testDeckIsTheSupport,
    testCrossingOnePlane,
    testNoCoplanarOverlaps,
    testBodyWalksTheStreet,
    testOneNetwork,
    testRoutesBetweenTiers,
    testCrossingMarks,
    testBudget,
    testChapterBudget,
    testMoonLight,
    testFrozenChapters,
  ];
  const results = [];
  for (const fn of tests) {
    try { results.push(await fn()); }
    catch (e) { results.push({ name: fn.name, passed: false, info: `ошибка: ${e && e.message}` }); }
  }
  const passed = results.filter(r => r.passed).length;

  if (typeof console !== 'undefined') {
    console.group('Автотесты улиц генератора по рельефу (json2, этап 6)');
    for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'} — ${r.name}: ${r.info}`);
    console.log(`Итого: ${passed}/${results.length}`);
    console.groupEnd();
  }
  return { passed, total: results.length, results };
}
