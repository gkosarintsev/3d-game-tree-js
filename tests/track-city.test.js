/**
 * Браузерная сюита трассы генератора (этап 5 плана `docs/level13-track-plan.md`).
 *
 * Сюита отвечает на вопрос, который нельзя задать Node-парсеру: видит ли ДВИЖОК
 * то, что насчитал генератор. Полотно главы 13 — не картинка над городом: оно
 * обязано быть дорогой, то есть опорой ноги, препятствием для луча и ребром графа
 * ровно на своей отметке, — а съезд приводить на наземную улицу без ступени.
 * Обязательность петли для маршрута A→B держат ДАННЫЕ (вопрос § 10.6 закрыт):
 * коридор между кварталами перерзан руслом `cut` с `wade: false`, и 9-й сценарий
 * бракует сюжет, если до B доходит обход без полотна. До русла замер был
 * 115 узлов / 374 м по грунту против 637 м через кольцо — то есть трасса висела
 * бы в главе декорацией к маршруту, а не его хребтом.
 *
 * Фикстура — НЕ синтетическая: собранный модуль `LEVEL_13` и его же бриф
 * `src/levels/level-13.json`, развёрнутый парсером прямо в браузере. Так сюжет
 * проверяет ровно ту главу, которая играется, а Node-тест `tools/track.test.mjs`
 * остаётся там, где ему место, — на геометрии профиля и счётчиках.
 *
 * Запуск в браузере (через консоль страницы игры, где есть importmap):
 *   const m = await import('/tests/track-city.test.js?v=1');
 *   await m.runTrackCityTests();
 *
 * Проверяются сценарии:
 *   1. Бриф: схема и парсер молчат, служебные поля генератора не доехали в модуль;
 *   2. Кольцо — одна bridge-дорога с замкнутым швом (28 элементов, разрыв 0 м);
 *   3. Полотно держит зазор над полем и уклон в пределе (`clearance`, `grade`);
 *   4. Опора ноги на полотне отвечает полотно, а не терраса квартала под ним;
 *   5. Крен дуги ведёт кромку: на середине дуги край = осевая ± tanBank·halfW,
 *      на срезах крен ноль (швы горизонтальны);
 *   6. Перила бракуют сход с кромки, но не держат блокаду на осевой;
 *   7. Нос съезда встаёт вровень с крышкой перекрёстка (ступени нет);
 *   8. Граф — одна связная сеть, и каждый узел стоит на своей опоре;
 *   9. Маршрут A→B существует и проходим по рёбрам; шлюзы обоих съездов в сети,
 *      коридор перерзан руслом — обход без полотна бракует сюжет;
 *  10. Луч и сфера на ленте сходятся с опорой (картинка = нога);
 *  11. Света на петле нет — страж закрытого вопроса § 10.5 (флага `lamps` в
 *      секции тоже нет: «уклонный настил фонарей не носит» снимал их со всей
 *      петли, и флаг обещал то, чего эмиссия не делает);
 *  12. Свет главы — луна: пула летающих огней нет, яркость не ниже порога,
 *      грунт в цвет полотна;
 *  13. Бюджет собранной главы 13: узлы, пластины, дуги, опоры и четыре пробы —
 *      каждая на карте с полем и на той же карте без поля (отношение, а не
 *      абсолютные микросекунды);
 *  14. Главы 9–12 не получили трассу, а схема v1 её бракует.
 */
import * as THREE from 'three';
import { createJsonMap } from '../src/json-map.js';
import { LEVEL_09 } from '../src/levels/level-09.js';
import { LEVEL_10 } from '../src/levels/level-10.js';
import { LEVEL_11 } from '../src/levels/level-11.js';
import { LEVEL_12 } from '../src/levels/level-12.js';
import { LEVEL_13 } from '../src/levels/level-13.js';
import { LEVELS } from '../src/levels/index.js';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { validateLevel, LEVEL_SPEC_V2 } from '../tools/level-schema.mjs';
import { CONFIG } from '../src/config.js';
import { frameAt, rotatePoint, unrotatePoint } from '../src/geo2d.js';

const J = CONFIG.jsonMap;
const DEG = Math.PI / 180;
const STEP = CONFIG.building.stepUp;
const PLAYER_H = CONFIG.eyeHeight + 0.35;

// Числа брифа главы 13 — они же держат пределы сюиты (пределы не выдумываются
// здесь, а читаются из того же JSON, что собран в модуль).
const TRACK = { radius: 120, turns: 12, width: 10, bank: 6, grade: 0.08, clearance: 3, amplitude: 4, waves: 2, entries: 2 };
const RING_ID = `ring_ring`;

// --------------------------------------------------------------------- фикстура

let ctxCache = null;

/** Собранная карта главы 13 + её полотна трассы (строится один раз на сюиту). */
function built() {
  if (ctxCache) return ctxCache;
  const map = createJsonMap(LEVEL_13.map);
  map.build(new THREE.Scene());
  ctxCache = { map, ring: trackDecks(LEVEL_13.map), spec: LEVEL_13.map };
  return ctxCache;
}

/**
 * Все настил-элементы трассы (кольцо + съезды) с id дороги и длиной оси.
 *
 * `len` считается здесь, а не в `axisPoint`: пробы по элементу идут шагом по
 * длине, и без неё цикл пробы не выполняет ни одной итерации, о чём
 * сюита молчала бы «0 проб».
 */
function trackDecks(spec) {
  return spec.roads
    .filter((r) => /^ring/.test(r.id))
    .flatMap((r) => r.decks.map((d) => ({
      ...d, road: r.id, roadType: r.type,
      len: d.arc ? d.R * Math.abs(d.span * DEG) : d.length,
    })));
}

/**
 * Точка осевой полотна на доле `f` элемента и её отметка. Дуга — по углу
 * `a0 + span·f` на радиусе `R`; пластина — по локальной `u` в кадре поворота
 * (тот же кадр, что у домов: мировая точка = `rotatePoint(frame, cx+du, cz+dv)`).
 */
function axisPoint(d, f) {
  if (d.arc) {
    const a = (d.a0 + d.span * f) * DEG;
    return {
      x: d.cx + Math.cos(a) * d.R, z: d.cz + Math.sin(a) * d.R,
      y: d.y0 + (d.y1 - d.y0) * f, ang: a, rho: d.R,
      len: d.R * Math.abs(d.span * DEG),
    };
  }
  const yaw = d.yaw ?? 0;
  const du = -d.length / 2 + d.length * f;
  const p = rotatePoint(frameAt(d.cx, d.cz, yaw), d.cx + du, d.cz);
  return {
    x: p.x, z: p.z, y: d.topAtMin + (d.topAtMax - d.topAtMin) * f,
    ang: yaw * DEG, rho: d.R ?? 0, len: d.length,
  };
}

/**
 * Пробы по элементу идут от `INSET` до `1 − INSET`, а не от торца до торца.
 *
 * Причина — луч, а не опора. Опора на самом срезе теперь отвечает полотно:
 * разрез дуги входит в её сектор (допуск `arcDelta`), а грань пластины принимает
 * локальную `u` на торце (`_prismTopAt`) — замер главы 13 при f=0 и f=1 даёт
 * расхождение 0 м. Нисходящий **луч** на точном разрезе ленты промахивается: он
 * бьёт по треугольникам меша, а не по аналитической поверхности, — замер тех же
 * двух точек: 0,561 м против полотна 4,409 м и 4,712 м против 11,402 м. Стоит
 * отойти на `1e-9` доли развёртки — луч сходится с опорой. Мерить же крен, перила
 * и луч на самой границе нельзя: она красит сюиту без изменения геометрии, а шов
 * по отметке держит сюжет 2.
 */
const INSET_F = (d) => Math.min(0.02, 0.25 / d.len);

/** Шаг проб `h` от внутреннего края до внутреннего края элемента. */
function insideSteps(d, h) {
  const i0 = INSET_F(d), i1 = 1 - INSET_F(d);
  const n = Math.max(2, Math.round((i1 - i0) * d.len / h));
  const out = [];
  for (let s = 0; s <= n; s++) out.push(i0 + (i1 - i0) * s / n);
  return out;
}

/** Точка кромки дуги (ρ = R ± halfW) на доле развёртки. */
function edgePoint(d, f, side) {
  const a = (d.a0 + d.span * f) * DEG;
  const rho = d.R + side * d.halfW;
  return { x: d.cx + Math.cos(a) * rho, z: d.cz + Math.sin(a) * rho, ang: a, rho };
}

/** Конец элемента в мировых координатах (для швов). */
function deckEnds(d) {
  return [axisPoint(d, 0), axisPoint(d, 1)];
}

/**
 * Съезды как ДОРОГИ, а не как настилы: подъём разрезан под стык с петлёй — окно
 * без периль у кольца и пластина с перилами до улицы, — поэтому у одного съезда
 * настилов два. «Стык с петлёй» у него начало первого, «нос» — конец последнего;
 * считать съезды по настилам значило бы искать нос в середине подъёма, в воздухе.
 */
function rampRoads() {
  const byRoad = new Map();
  for (const d of built().ring) {
    if (d.road === RING_ID) continue;
    if (!byRoad.has(d.road)) byRoad.set(d.road, []);
    byRoad.get(d.road).push(d);
  }
  return [...byRoad.entries()].map(([road, decks]) => ({
    road,
    decks,
    ringEnd: axisPoint(decks[0], 0),
    toeEnd: axisPoint(decks[decks.length - 1], 1),
  }));
}

/**
 * Какие элементы полотна накрывают точку плана: дуга — сектором (габарит ρ и
 * угол), пластина — локальным прямоугольником в кадре поворота.
 *
 * Узлы графа и пробы опоры ищутся именно так, а не через `map.topAt`: `topAt`
 * держит дуги, и прямые участки кольца — наклонные пластины (`prisms`) —
 * остались бы невидимы, то есть «узел на полотне» мерил бы половину петли.
 *
 * Список, а не флаг, потому что съезд стартует **на оси кольца** и его пластина
 * перекрывает полосу петли: над таким пересечением движок правомерно отвечает
 * высшим настилом, и проба, требовавшая отметку именно своего элемента, красила
 * бы сюжет без дефекта главы.
 */
function trackCover(x, z) {
  const out = [];
  for (const d of built().ring) {
    if (d.arc) {
      const dx = x - d.cx, dz = z - d.cz;
      if (Math.abs(Math.hypot(dx, dz) - d.R) > d.halfW) continue;
      let da = Math.atan2(dz, dx) / DEG - d.a0;
      da = ((da + 540) % 360) - 180;
      if (d.span >= 0 ? da >= -1e-9 && da <= d.span + 1e-9 : da <= 1e-9 && da >= d.span - 1e-9) out.push(d);
      continue;
    }
    const l = unrotatePoint(frameAt(d.cx, d.cz, d.yaw ?? 0), x, z);
    if (Math.abs(l.x - d.cx) <= d.length / 2 + 1e-9 && Math.abs(l.z - d.cz) <= d.width / 2 + 1e-9) out.push(d);
  }
  return out;
}

const onTrack = (x, z) => trackCover(x, z).length > 0;

/**
 * Узел стоит именно НА полотне, а не под ним: план полотна накрывает и улицы
 * нижнего яруса, и поле под кольцом.
 */
function onRibbon(p) {
  if (!onTrack(p.x, p.z)) return false;
  return p.y - built().map.relief.heightAt(p.x, p.z) > 0.5;
}

const lampCount = (roads) => roads.reduce((a, r) => a + (r.lamps || []).length, 0);
const pillarCount = (roads) => roads.reduce((a, r) => a + (r.pillars || []).length, 0);

// ---------------------------------------------------------------------- тесты 1…

function testBriefPipeline() {
  return fetch('/src/levels/level-13.json')
    .then((res) => res.json())
    .then((raw) => {
      const bad = [];
      const expanded = expandCity(structuredClone(raw));
      const { errors, warnings } = validateLevel(expanded, LEVEL_SPEC_V2);
      if (errors.length) bad.push(`схема: ${errors.slice(0, 3).join('; ')}`);
      if (warnings.length) bad.push(`предупреждений парсера ${warnings.length}: ${warnings.slice(0, 2).join('; ')}`);
      const norm = normalizeLevel(expanded).map;
      // служебные поля генератора в модуль не едут: движок обязан видеть обычные
      // пластины и дуги, иначе он начал бы различать «трассу» кодом
      for (const r of norm.roads) {
        for (const k of ['trackRole', 'trackId', 'grade', 'district']) {
          if (k in r) bad.push(`дорога ${r.id} везёт служебное поле ${k} в модуль`);
        }
      }
      if (norm.relief === undefined) bad.push('модуль без секции relief — трасса опиралась бы на «пол мира — ноль»');
      if (norm.kind !== 'json2') bad.push(`kind '${norm.kind}' — трасса это поле v2`);
      const ring = norm.roads.find((r) => r.id === RING_ID);
      if (!ring) bad.push(`полотно не эмитировано дорогой ${RING_ID}`);
      else if (ring.type !== 'bridge') bad.push(`${RING_ID}: type '${ring.type}' — кольцо обязано быть настилом без опоры грунта`);
      return {
        name: 'Бриф главы 13: схема и парсер молчат, служебных полей в модуле нет, кольцо — bridge-дорога',
        passed: bad.length === 0,
        info: bad.length ? bad.slice(0, 3).join('; ')
          : `ошибок 0, предупреждений 0; дорог ${norm.roads.length}, настилов ${norm.roads.reduce((a, r) => a + r.decks.length, 0)}, трасса: ${norm.roads.filter((r) => /^ring/.test(r.id)).map((r) => r.id).join(', ')}`,
      };
    });
}

function testRingIsOneSealedRibbon() {
  const { ring } = built();
  const loop = ring.filter((d) => d.road === RING_ID);
  const entries = rampRoads();
  const bad = [];
  const arcs = loop.filter((d) => d.arc);
  const plates = loop.filter((d) => !d.arc);
  // дуг и прямых не меньше, чем поворотов: разрыв периль режет элемент там, где
  // окно стыка попало внутрь него, и кусков становится больше
  if (arcs.length < TRACK.turns) bad.push(`дуг ${arcs.length} при turns ${TRACK.turns}`);
  if (plates.length < TRACK.turns) bad.push(`прямых ${plates.length} при turns ${TRACK.turns}`);
  if (entries.length !== TRACK.entries) bad.push(`съездов ${entries.length} при entries ${TRACK.entries}`);
  // шов: конец элемента обязан совпасть с началом следующего — и позицией, и
  // отметкой, иначе на стыке ступень, а её держит нормализатор, а не генератор.
  // Предел — 1,5 мм: один и тот же узел шва в модуле записан в двух
  // представлениях (дуга — `cx/cz/R/a0`, пластина — `cx/cz/yaw/length`), и
  // каждое округлено до `r3`; по отметке расхождения нет вовсе (замер — 0 м)
  const SEAM = 1.5e-3;
  let worstPos = 0, worstY = 0, seam = '';
  for (let i = 0; i < loop.length; i++) {
    const a = deckEnds(loop[i])[1], b = deckEnds(loop[(i + 1) % loop.length])[0];
    const dp = Math.hypot(a.x - b.x, a.z - b.z), dy = Math.abs(a.y - b.y);
    if (dp > worstPos || dy > worstY) { worstPos = Math.max(worstPos, dp); worstY = Math.max(worstY, dy); }
    if (dp > SEAM || dy > SEAM) seam = seam || `${loop[i].road}[${i}]→[${(i + 1) % loop.length}] позиция ${dp.toFixed(5)} м, отметка ${dy.toFixed(5)} м`;
  }
  if (seam) bad.push(`шов кольца расходится сильнее округления модуля: ${seam}`);
  for (const d of loop) {
    if (d.arc && !(d.tanBank > 0)) bad.push(`дуга ${d.road} с tanBank ${d.tanBank} — крен брифа ${TRACK.bank}° не дошёл`);
  }
  // перила есть везде, кроме окон у съездов, и окна ровно там, где съезд
  // входит в полосу петли: иначе разрыв — дыра в ограждении на пустом месте, а
  // не стык. Точка входа съезда — начало его собственной оси (первый настил
  // подъёма стартует на осевой петли), и она обязана накрываться элементом без
  // периль
  const railless = loop.filter((d) => !d.rails);
  if (railless.length < TRACK.entries || railless.length > 2 * TRACK.entries) {
    bad.push(`элементов без периль ${railless.length} — при ${TRACK.entries} съездах их бывает от одного до двух на съезд (окно стыка режет один элемент или два соседних)`);
  }
  for (const e of entries) {
    const j = e.ringEnd;
    const cover = trackCover(j.x, j.z);
    if (!cover.some((d) => d.road === RING_ID && !d.rails)) {
      bad.push(`стык съезда ${e.road} (петля в ${j.x.toFixed(1)}, ${j.z.toFixed(1)}, ${j.y.toFixed(2)} м) накрыт элементом с перилами — кольцо не расступается, и ребро съезд→петля бракуется`);
    }
    // расступается и сам съезд: его стенка, начатая от носа, стояла в 0,440 м от
    // узла шва петли — ближе `radius 0,45`, и `bodyClearLine` бракуют ребро
    // «съезд → петля» по той же причине, что и стенка кольца
    if (e.decks[0].rails) {
      bad.push(`${e.road}: подъём начат пластиной с перилами — стенка съезда встаёт в ${TRACK.width / 2} м от оси петли, то есть над её узлами шва`);
    }
    const winLen = e.decks[0].arc ? e.decks[0].R * Math.abs(e.decks[0].span * DEG) : e.decks[0].length;
    if (winLen < TRACK.width / 2 + 0.5 - 1e-3) {
      bad.push(`${e.road}: окно без периль ${winLen.toFixed(3)} м — не перекрывает полотно петли с запасом 0,5 м у шва`);
    }
    if (!e.decks[e.decks.length - 1].rails) {
      bad.push(`${e.road}: борт улицы остался без ограждения`);
    }
  }
  const reach = TRACK.width / 2 + 0.5 + 0.1;
  for (const d of railless) {
    const p = axisPoint(d, 0.5);
    const nearest = Math.min(...entries.map((e) => Math.hypot(p.x - e.ringEnd.x, p.z - e.ringEnd.z)));
    if (nearest > reach) bad.push(`элемент без периль (${p.x.toFixed(1)}, ${p.z.toFixed(1)}) в ${nearest.toFixed(1)} м от ближайшего съезда — разрыв ограждения не у стыка`);
  }
  return {
    name: 'Кольцо — одна дорога из дуг и прямых с замкнутым швом (перемычка 0 м), перила везде кроме окон съездов',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${loop.length} элементов (дуг ${arcs.length}, прямых ${plates.length}) + съездов ${entries.length}; без периль ${railless.length} (окна стыков); худший шов ${worstPos.toExponential(1)} м по позиции и ${worstY.toExponential(1)} м по отметке`,
  };
}

function testDeckRidesAboveField() {
  const { map, ring } = built();
  const bad = [];
  let worstGap = Infinity, worstSlope = 0, where = '', samples = 0, gapChecked = 0;
  for (const d of ring) {
    for (const f of insideSteps(d, 4)) {
      const p = axisPoint(d, f);
      const field = map.relief.heightAt(p.x, p.z);
      const gap = p.y - field;
      samples++;
      // зазор `clearance` держит кольцо: съезд по построению приходит на землю и
      // на наземную улицу, где поля под ним нет, — его мерит сюжет про нос
      if (d.road === RING_ID && gap < worstGap) {
        worstGap = gap; gapChecked++;
        where = `${d.road} при f=${f.toFixed(2)} (${p.x.toFixed(1)}, ${p.z.toFixed(1)})`;
      }
    }
    // уклон меряется по длине оси элемента: у дуги это дуга, у пластины — хорда,
    // и та и другая не короче подъёма, поэтому предел `grade` держится строго.
    // Сравнивается подъём, а не отношение: отметки концов пишутся с округлением
    // `r3` (миллиметр), и у короткого элемента это поднимает дробь выше предела
    // при точном значении в лимите (замер: 0,0800 при пределе 0,08 на 15 м пролёта)
    const rise = Math.abs(d.arc ? d.y1 - d.y0 : d.topAtMax - d.topAtMin);
    const slope = rise / d.len;
    const limit = d.road === RING_ID ? TRACK.grade : J.maxSlope;
    if (slope > worstSlope) worstSlope = slope;
    if (rise > limit * d.len + 0.002) bad.push(`${d.road}: уклон ${slope.toFixed(4)} м/м (подъём ${rise.toFixed(3)} м на ${d.len.toFixed(1)} м) при пределе ${limit}`);
  }
  // съезды держат `grade / runFactor` — они круче кольца по построению, но не
  // круче предела настила дороги
  if (worstGap < TRACK.clearance - 0.01) {
    bad.push(`полотно в ${where} всего на ${worstGap.toFixed(3)} м выше поля при clearance ${TRACK.clearance} м`);
  }
  return {
    name: 'Полотно держит зазор над полем (≥ clearance) и уклон в пределе (кольцо — grade, съезды — maxSlope)',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${samples} проб по ${ring.length} элементам (зазор меряется на ${gapChecked} проб кольца): худший зазор ${worstGap.toFixed(3)} м (предел ${TRACK.clearance}), худший уклон ${worstSlope.toFixed(4)} м/м (кольцо ${TRACK.grade}, настил ${J.maxSlope})`,
  };
}

function testFootStandsOnDeck() {
  const { map, ring } = built();
  const bad = [];
  let checked = 0, worst = 0, crossed = 0;
  for (const d of ring) {
    // шаг 1 м: полотно кольца ~700 м, и нижний порог в 800 проб сюита держит
    // сама геометрия, а не редко поставленные пробы
    for (const f of insideSteps(d, 1)) {
      const p = axisPoint(d, f);
      const support = map.groundHeightAt(p.x, p.z, 500);
      const field = map.relief.heightAt(p.x, p.z);
      checked++;
      const diff = support - p.y;
      // съезд стартует на оси кольца, и его пластина перекрывает полосу петли:
      // над пересечением отвечает высший настил — это правило движка, а не ступень
      if (trackCover(p.x, p.z).length > 1) {
        crossed++;
        if (diff < -0.02) bad.push(`${d.road} при f=${f.toFixed(3)}: опора ${support.toFixed(3)} м ниже настила ${p.y.toFixed(3)} м на пересечении полотен`);
        continue;
      }
      worst = Math.max(worst, Math.abs(diff));
      if (Math.abs(diff) > 0.02) {
        bad.push(`${d.road} при f=${f.toFixed(3)}: полотно ${p.y.toFixed(3)} м, опора ${support.toFixed(3)} м (поле ${field.toFixed(3)})`);
      }
      if (p.y - field > 0.5 && support <= field + 0.5) {
        bad.push(`${d.road}: опора отвечает террасу (${support.toFixed(2)} м), а не настил на ${p.y.toFixed(2)} м — нога провалится под полотно`);
      }
    }
  }
  if (checked < 800) bad.push(`пробегом проверено ${checked} точек полотна`);
  return {
    name: 'Нога стоит на полотне: groundHeightAt отвечает отметку настила, а не террасу квартала под ним',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${checked} точек по ${ring.length} элементам, худшее расхождение опоры с полотном ${worst.toExponential(1)} м; ${crossed} проб над пересечением съезда и кольца (там отвечает высший настил — правило движка)`,
  };
}

function testBankRidesTheEdge() {
  const { map } = built();
  const arcs = built().ring.filter((d) => d.arc);
  const bad = [];
  let worstMid = 0, worstCut = 0, overlap = 0;
  for (const d of arcs) {
    // середина дуги — полный крен: парсер клампит переходный угол `bankTrans`
    // значением `0,4·|span|`, поэтому два пояса перехода не перекрываются и при
    // середине остаётся авторский угол — край обязан уйти от осевой ровно на
    // `tanBank·halfW`, и это верно для куска, отрезанного окном стыка, тоже
    const mid = axisPoint(d, 0.5);
    const axisMid = map.groundHeightAt(mid.x, mid.z, 500);
    for (const side of [-1, 1]) {
      const e = edgePoint(d, 0.5, side);
      // точка под двумя настилами (плоскость съезда входит в полосу петли):
      // движок правомерно отвечает высшим из них, и сравнение с кромкой именно
      // этой дуги красило бы сюжет без дефекта — тот же случай, что и в сюжете
      // про ногу (замер: у внутреннего края окна стыка опора 5,024 м против
      // кромки 4,966 м — это пластина съезда, нависающая над краем петли)
      if (trackCover(e.x, e.z).length > 1) { overlap++; continue; }
      const y = map.groundHeightAt(e.x, e.z, 500);
      const expect = axisMid + side * d.tanBank * d.halfW;
      const dev = Math.abs(y - expect);
      worstMid = Math.max(worstMid, dev);
      if (dev > 0.02) {
        bad.push(`дуга ${d.road} в середине: край ${side > 0 ? 'наружу' : 'внутрь'} отвечает ${y.toFixed(3)} м, ждём ${expect.toFixed(3)} м (осевая ${axisMid.toFixed(3)}, tanBank ${d.tanBank.toFixed(4)}, halfW ${d.halfW})`);
      }
      // срез — крен ноль: торец ленты обязан быть вертикалью с горизонтальным
      // верхом, иначе стык с прямой пластиной даёт диагональ на всю ширину.
      // Меряется с внутренним отступом (`INSET_F`): на самом шве опоры нет ни у
      // дуги, ни у пластины; при 0,25 м отступа крен ещё 0,0007 м на край, то
      // есть проверка не «смазывается» отступом
      for (const f of [INSET_F(d), 1 - INSET_F(d)]) {
        const a0 = edgePoint(d, f, side), a1 = edgePoint(d, f, -side);
        const ya = map.groundHeightAt(a0.x, a0.z, 500), yb = map.groundHeightAt(a1.x, a1.z, 500);
        worstCut = Math.max(worstCut, Math.abs(ya - yb));
        if (Math.abs(ya - yb) > 0.02) {
          bad.push(`дуга ${d.road}: срез при f=${f} наклонён на ${Math.abs(ya - yb).toFixed(3)} м — шов с пластиной даёт диагональ`);
        }
      }
    }
  }
  return {
    name: 'Крен ведёт кромку: на середине дуги край = осевая ± tanBank·halfW, на обоих срезах крен ноль',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${arcs.length} дуг (кроме ${overlap} проб края под пластиной съезда — там отвечает высший настил), худшее отклонение края от формулы ${worstMid.toFixed(4)} м, худший перекос среза ${worstCut.toFixed(4)} м (крен ${TRACK.bank}°, tanBank ${(Math.tan(TRACK.bank * DEG)).toFixed(4)})`,
  };
}

function testRailsBlockTheDrop() {
  const { map } = built();
  const arcs = built().ring.filter((d) => d.arc);
  const bad = [];
  let blocked = 0, free = 0, gapFree = 0;
  const r = Math.max(CONFIG.radius, J.navEdgeProbe);
  for (const d of arcs) {
    for (const f of [0.25, 0.5, 0.75]) {
      for (const side of [-1, 1]) {
        const e = edgePoint(d, f, side);
        const feet = map.groundHeightAt(e.x, e.z, 500);
        const holds = map.isBlocked(e.x, e.z, r * 0.4, feet + 0.2, PLAYER_H);
        // стенка стоит НА кромке и уходит в полотно на railSink: тело, вставшее
        // ровно на краю, обязана удержать, а не пустить вниз с 6-метрового
        // перепада. В окне стыка периль нет — там кромка обязана быть свободна,
        // иначе разрыв не работает и съезд не вливается в петлю
        if (d.rails) {
          if (holds) blocked++;
          else bad.push(`дуга ${d.road} при f=${f}, край ${side > 0 ? '+' : '−'}: перила не держат (опора ${feet.toFixed(2)} м)`);
        } else if (!holds) gapFree++;
        else bad.push(`дуга ${d.road} без периль при f=${f}, край ${side > 0 ? '+' : '−'}: кромка всё равно блокирована — окно стыка не расступилось`);
      }
      const a = axisPoint(d, f);
      const feet = map.groundHeightAt(a.x, a.z, 500);
      if (!map.isBlocked(a.x, a.z, r, feet + 0.02, PLAYER_H)) free++;
      else bad.push(`${d.road} при f=${f}: осевая полотна блокирована — по трассе нельзя идти`);
    }
  }
  return {
    name: 'Перила бракуют сход с кромки, окно съезда свободно, осевая не перекрыта ни на одной пробе',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${blocked} кромок держат блокаду, ${gapFree} кромок в окнах стыков свободны, ${free} осевых проб свободны (радиус тела ${r.toFixed(2)} м, стенка ${J.railHeight} м с посадкой ${J.railSink} м)`,
  };
}

function testNoseLandsOnStreet() {
  const { map } = built();
  const bad = [];
  const info = [];
  for (const rv of rampRoads()) {
    const nose = rv.ringEnd.y <= rv.toeEnd.y ? rv.ringEnd : rv.toeEnd;
    // крышка перекрёстка или пластина улицы, чей план накрывает нос
    let hit = null;
    for (const road of LEVEL_13.map.roads) {
      if (/^ring/.test(road.id)) continue;
      for (const o of road.decks) {
        if (o.arc) continue;
        const fr = frameAt(o.cx ?? (o.minX + o.maxX) / 2, o.cz ?? (o.minZ + o.maxZ) / 2, o.yaw ?? 0);
        // мировая точка → локальный прямоугольник пластины (тот же кадр, что и у
        // движка: сравнение мировых координат с косой пластиной дало бы промах)
        const l = unrotatePoint(fr, nose.x, nose.z);
        const cx = o.cx ?? (o.minX + o.maxX) / 2, cz = o.cz ?? (o.minZ + o.maxZ) / 2;
        const u = l.x - cx, v = l.z - cz;
        if (Math.abs(u) > o.length / 2 || Math.abs(v) > o.width / 2) continue;
        const t = (u + o.length / 2) / o.length;
        const y = (o.topAtMin ?? o.topY) + ((o.topAtMax ?? o.topY) - (o.topAtMin ?? o.topY)) * t;
        hit = { id: road.id, y };
      }
    }
    if (!hit) { bad.push(`${rv.road}: нос ${nose.x.toFixed(1)}, ${nose.z.toFixed(1)} не накрыт планом наземной улицы`); continue; }
    const step = Math.abs(nose.y - hit.y);
    if (step > 1e-6) bad.push(`${rv.road}: ступень на носу ${step.toFixed(4)} м (полотно ${nose.y.toFixed(3)}, ${hit.id} ${hit.y.toFixed(3)})`);
    const support = map.groundHeightAt(nose.x, nose.z, 500);
    if (Math.abs(support - hit.y) > 0.02) bad.push(`${rv.road}: опора на носе ${support.toFixed(3)} м против улицы ${hit.y.toFixed(3)} м`);
    if (map.isBlocked(nose.x, nose.z, Math.max(CONFIG.radius, J.navEdgeProbe), support + 0.02, PLAYER_H)) {
      bad.push(`${rv.road}: нос ${hit.id} заблокирован — с съезда на улицу не войти`);
    }
    info.push(`${rv.road}: нос ${nose.x.toFixed(1)}, ${nose.z.toFixed(1)} на ${nose.y.toFixed(3)} м = ${hit.id} (${hit.y.toFixed(3)} м), ступень ${step.toExponential(1)} м`);
  }
  return {
    name: 'Съезд приводит на наземную улицу: нос вровень с крышкой перекрёстка, ступени и блокады нет',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ') : info.join(' | '),
  };
}

function testOneNetwork() {
  const { map } = built();
  const nav = map.nav;
  const n = nav.adj.length;
  const sp = map.spec.spawn;
  // спавн мерится с нуля, а не с 500 м: над южным носом висит полотно, и проба
  // с 500 м привела бы обход к узлу на съезде вместо асфальта под ним
  const start = nav.nearestNode(sp.x, map.groundHeightAt(sp.x, sp.z, 0), sp.z);
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const cur = queue.pop();
    for (const nb of nav.adj[cur] || []) if (!seen.has(nb)) { seen.add(nb); queue.push(nb); }
  }
  // Опора меряется с отметки самого узла, а не «с 500 м»: под полотном трассы
  // высшая опора — настил в семи метрах над асфальтом, и проба с 500 м честный
  // наземный узел записала бы не на свою опору (глава 12 так и проверялась,
  // потому что настилов над улицами у неё было меньше)
  let buried = 0, worstBuried = 0, hang = [];
  for (let i = 0; i < n; i++) {
    const p = nav.pos[i];
    const g = map.groundHeightAt(p.x, p.z, p.y);
    if (p.y - g > 0.02) hang.push(`(${p.x.toFixed(1)}, ${p.z.toFixed(1)}) узел ${p.y.toFixed(2)}, опора ${g.toFixed(2)}`);
    // узел ниже опоры — это ступень марша в одной шахте или откос насыпи над
    // улицей; опасное направление — только «висит»: тело на узле тогда падает
    if (g - p.y > 0.02) { buried++; worstBuried = Math.max(worstBuried, g - p.y); }
  }
  const bad = [];
  if (seen.size !== n) bad.push(`связных узлов ${seen.size} из ${n}: граф рассыпался на карманы (трасса отрезана от улиц?)`);
  if (hang.length) bad.push(`${hang.length} узлов висят над своей опорой (первый ${hang[0]})`);
  if (worstBuried > STEP) bad.push(`${buried} узлов ниже опоры, худший на ${worstBuried.toFixed(2)} м при шаге ноги ${STEP} — нога встанет не туда, где узел`);
  // узлы именно полотна обязаны быть в сети: без них хребта маршрута нет
  const onRing = nav.pos.filter(onRibbon).length;
  if (onRing < 20) bad.push(`узлов на полотне ${onRing} — петля не вошла в решётку навигации`);
  return {
    name: 'Граф — одна связная сеть от спавна, и каждый узел стоит ровно на своей опоре (полотно в решётке)',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${seen.size}/${n} узлов достижимы от спавна, ${onRing} из них стоят на полотне трассы, 0 узлов не на своей опоре`,
  };
}

/**
 * Проходимость маршрута по рёбрам: проба опоры в шаге `navEdgeProbe` вдоль
 * каждого ребра. Возвращает числа, а не вердикт — пределы называет вызывающий,
 * потому что их три (провал, горб, подъём) и они одинаковы для наземного
 * маршрута и для маршрута по петле.
 */
function walkNumbers(map, path) {
  let meters = 0, onRibbonNodes = 0, worstRise = 0, worstDrop = 0, worstHump = 0, where = '';
  for (let i = 1; i < path.length; i++) {
    const from = path[i - 1], to = path[i];
    meters += Math.hypot(to.x - from.x, to.z - from.z);
    worstRise = Math.max(worstRise, Math.abs(to.y - from.y));
    if (onRibbon(to)) onRibbonNodes++;
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
  return { meters, onRibbonNodes, worstRise, worstDrop, worstHump, where };
}

/** Худшие числа двух маршрутов, свёрнутые в одну строку для вердикта. */
function worseOf(a, b) {
  return {
    worstDrop: Math.max(a.worstDrop, b.worstDrop),
    worstHump: Math.max(a.worstHump, b.worstHump),
    worstRise: Math.max(a.worstRise, b.worstRise),
    where: a.worstDrop >= b.worstDrop ? a.where : b.where,
  };
}

function testRoutePassesOverTrackAndGround() {
  const { map } = built();
  const nav = map.nav;
  const NAME = 'Маршрут A→B проходим по рёбрам и идёт по петле; шлюзы съездов в сети, коридор перерзан (§ 10.6 закрыт)';
  const sp = map.spec.spawn, exit = LEVEL_13.gameplay.exit;
  // индексы узлов: `findPath` зовёт `nearestNode` сам и ждёт ТОЧКУ, а обход без
  // полотна меряется обходом по индексам
  const ai = nav.nearestNode(sp.x, map.groundHeightAt(sp.x, sp.z, 0), sp.z);
  // точка B — на ходовой кровле: маяк цели движок ищет пробой «с 500 м»
  // (`ExitGoal` → `groundHeightAt(x, z, 500)`), и узел берётся с той же отметки
  const bi = nav.nearestNode(exit.x, map.groundHeightAt(exit.x, exit.z, 500), exit.z);
  if (ai < 0 || bi < 0) return { name: NAME, passed: false, info: `узла нет в решётке: A ${ai}, B ${bi}` };
  const bad = [];
  const path = nav.findPath(nav.pos[ai], nav.pos[bi]);
  if (!path || path.length < 4) {
    return { name: NAME, passed: false, info: `маршрут не найден (${path ? path.length : 0} узлов)` };
  }
  // конец маршрута обязан быть узлом у B, а не просто «что-то нашёл»: `findPath`
  // возвращает цепочку от точки до точки, и сюжет, меряющий только `length ≥ 4`,
  // пропускал сеть, где северного квартала нет вовсе (замер на устаревшем
  // прогоне: 6093 узлов, ни одного севернее z=150, ближайший к B — в 360 м, а
  // маршрут из 115 узлов оставался «зелёным»)
  const end = path[path.length - 1];
  const endOff = Math.hypot(end.x - nav.pos[bi].x, end.y - nav.pos[bi].y, end.z - nav.pos[bi].z);
  const biOff = Math.hypot(nav.pos[bi].x - exit.x, nav.pos[bi].z - exit.z);
  if (endOff > 1e-6) bad.push(`маршрут кончается не в узле B — ${endOff.toFixed(1)} м от него`);
  if (biOff > J.navStep) bad.push(`ближайший к B узел в ${biOff.toFixed(1)} м от точки B (решётка ${J.navStep} м) — до выхода ноге не дойти`);
  const ground = walkNumbers(map, path);
  // узлы полотна и их разбивка по дорогам: вершина маршрута берётся с кольца, а
  // гистограмма нужна, чтобы «узла на кольце нет» не выглядело молчанием
  const ribbon = [];
  const byRoad = {};
  for (let i = 0; i < nav.pos.length; i++) {
    if (!onRibbon(nav.pos[i])) continue;
    ribbon.push(i);
    for (const d of trackCover(nav.pos[i].x, nav.pos[i].z)) byRoad[d.road] = (byRoad[d.road] || 0) + 1;
  }
  const roads = Object.entries(byRoad).map(([k, v]) => `${k} ${v}`).join(', ');
  // задуманный путь главы: взойти по южному съезду, проехать по кольцу и сойти
  // северным. Узел-вершина — дальний от спавна узел именно `ring_ring` (не
  // съезда), чтобы второй отрезок шёл по петле, а не разворачивался на
  // площадке носа
  let apex = -1, apexDist = -1;
  for (const i of ribbon) {
    const p = nav.pos[i];
    if (!trackCover(p.x, p.z).some((d) => d.road === RING_ID)) continue;
    const dist = Math.hypot(p.x - sp.x, p.z - sp.z);
    if (dist > apexDist) { apexDist = dist; apex = i; }
  }
  if (apex < 0) return { name: NAME, passed: false, info: `на кольце нет ни одного узла графа (узлов на полотне ${ribbon.length}: ${roads || 'нет'})` };
  const leg1 = nav.findPath(nav.pos[ai], nav.pos[apex]);
  const leg2 = nav.findPath(nav.pos[apex], nav.pos[bi]);
  if (!leg1 || !leg2) {
    return { name: NAME, passed: false, info: `путь через кольцо не собирается: A→вершина ${leg1 ? leg1.length : 'нет'}, вершина→B ${leg2 ? leg2.length : 'нет'}` };
  }
  const up = walkNumbers(map, leg1), down = walkNumbers(map, leg2);
  const viaTrack = {
    meters: up.meters + down.meters,
    onRibbonNodes: up.onRibbonNodes + down.onRibbonNodes,
    ...worseOf(up, down),
  };
  const w = worseOf(ground, viaTrack);
  if (w.worstDrop > J.navEdgeDrop) bad.push(`ребро уходит под опору на ${w.worstDrop.toFixed(2)} м при пределе ${J.navEdgeDrop} — ${w.where}`);
  if (w.worstHump > STEP) bad.push(`опора горбит над ребром на ${w.worstHump.toFixed(2)} м при шаге ноги ${STEP} — ${w.where}`);
  if (w.worstRise > STEP) bad.push(`подъём соседних узлов ${w.worstRise.toFixed(2)} м выше шага ноги ${STEP}`);
  // шлюзы съездов: узел полотна обязан иметь соседа вне ленты — и на севере
  // (ring_e0 уходит в квартал d0), и на юге (ring_e1 к спавну)
  let gateN = 0, gateS = 0;
  for (const i of ribbon) {
    const p = nav.pos[i];
    if ((nav.adj[i] || []).some(nb => !onRibbon(nav.pos[nb]))) {
      if (p.z > 100) gateN++; else if (p.z < 0) gateS++;
    }
  }
  if (!gateN) bad.push(`с полотна нет ни одного наземного узла севернее z=100 — съезд ring_e0 не влился в квартал d0 (узлов на полотне ${ribbon.length}, шлюзов юг ${gateS}, узлов ${nav.pos.length}, рёбер ${nav.adj.reduce((a, x) => a + x.length, 0)})`);
  if (!gateS) bad.push('с полотна нет ни одного наземного узла южнее z=0 — съезд ring_e1 не влился к спавну');
  // обязательность держат данные: русло `cut` с `wade: false` перерезает коридор
  // между кварталами, поэтому обход графа с запрещёнными узлами ленты обязан до B
  // НЕ доходить. Пока вопрос § 10.6 был открыт, сюжет только мерил и называл
  // число (374 м по грунту против 637 м петлёй); закрыт — и молчание стало бы
  // регрессией, а не цифрой
  const banned = new Set(ribbon);
  const seen = new Set([ai]);
  const queue = [ai];
  while (queue.length) {
    const cur = queue.pop();
    for (const nb of nav.adj[cur] || []) if (!seen.has(nb) && !banned.has(nb)) { seen.add(nb); queue.push(nb); }
  }
  const bypass = seen.has(bi);
  if (bypass) bad.push(`до B доходит обход без полотна (${seen.size} наземных узлов) — коридор проходим, трасса снова альтернатива, а не хребет`);
  // и кратчайший маршрут обязан идти по ленте: если русло перерезал коридор, но
  // путь всё равно наземный, значит сеть замкнулась в обход русла по краю плитки
  if (!ground.onRibbonNodes) bad.push(`кратчайший путь A→B не встаёт на полотно (${ground.meters.toFixed(0)} м, узлов на ленте 0)`);
  return {
    name: NAME,
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `A→B ${path.length} узлов / ${ground.meters.toFixed(0)} м, из них ${ground.onRibbonNodes} стоят на полотне (конец маршрута в ${biOff.toFixed(2)} м от B, сеть ${nav.pos.length} узлов); сверка с отдельным маршрутом через кольцо ${viaTrack.meters.toFixed(0)} м; `
        + `шлюзов съездов ${gateN} (север) и ${gateS} (юг); узлов на полотне ${ribbon.length} (${roads}); `
        + `обход A→B без полотна ${bypass ? `найден (${seen.size} наземных узлов)` : 'не найден — коридор держит русло'}; `
        + `худший провал ${w.worstDrop.toFixed(2)} м (предел ${J.navEdgeDrop}), горб ${w.worstHump.toFixed(2)} м, подъём ребра ${w.worstRise.toFixed(2)} м при шаге ноги ${STEP.toFixed(2)}`,
  };
}

function testRayAndSphereOnRibbon() {
  const { map, ring } = built();
  const bad = [];
  let rayChecked = 0, sphereChecked = 0, worstRay = 0, worstSphere = 0, worstTol = 0;
  const r = CONFIG.alien.radius;
  const body = new THREE.Vector3();
  for (const d of ring) {
    for (const f of insideSteps(d, 3)) {
      // точка внутри полотна (не у кромки): луч и сфера меряются там, где нога
      // реально стоит, а кромку держит сюжет про перила
      const p = axisPoint(d, f);
      const support = map.groundHeightAt(p.x, p.z, 500);
      const hit = map.raySolid(p.x, support + 10, p.z, 0, -1, 0, 20);
      rayChecked++;
      if (!hit) { bad.push(`${d.road} при f=${f.toFixed(2)}: луч вниз с 10 м над полотном не нашёл настил`); }
      else {
        const diff = Math.abs(hit.y - support);
        worstRay = Math.max(worstRay, diff);
        // лента нарезается шагом `sweepSlice` (5°), и хорда этого шага отклоняется
        // от точной поверхности на R·(1 − cos 2,5°): при R 135 м это 0,13 м. Предел
        // берётся от радиуса самого элемента, а не одной константой на сюиту,
        // иначе дуги малого радиуса проверялись бы вчетверо слабее, чем могут
        // провалить
        const tol = Math.max(J.sweepRibbonTwist, d.arc ? d.R * (1 - Math.cos((J.sweepSlice / 2) * DEG)) : 0.01);
        worstTol = Math.max(worstTol, diff - tol);
        if (diff > tol + 1e-6) {
          bad.push(`${d.road} при f=${f.toFixed(2)}: луч ударил на ${hit.y.toFixed(3)} м, опора ${support.toFixed(3)} м (расхождение ${diff.toFixed(3)} м при пределе ${tol.toFixed(3)} м)`);
        }
      }
      body.set(p.x, support + r, p.z);
      sphereChecked++;
      // `resolveSphere` возвращает флаг и двигает тело на месте, а не отдаёт
      // новый вектор: `moved.y` на его месте — это NaN, и проверка провалилась
      // бы молча (глава 12 меряла именно так)
      map.resolveSphere(body, r);
      const sink = support + r - body.y;
      if (!Number.isFinite(sink)) { bad.push(`${d.road}: сфера после выталкивания вне числа`); continue; }
      worstSphere = Math.max(worstSphere, sink);
      if (sink > r + 1e-3) bad.push(`${d.road}: сфера провалилась под полотно на ${sink.toFixed(2)} м`);
      // на наклоне сфера выталкивается по нормали, поэтому её центр не выше, чем
      // r / cos уклона: больше — значит её вытолкнуло чужой гранью
      const over = body.y - (support + r);
      if (over > 0.05) bad.push(`${d.road}: сфера подскочила на ${over.toFixed(3)} м над покоем — выталкивает не настил`);
    }
  }
  return {
    name: 'Луч и сфера на ленте сходятся с опорой: удар в картинку в пределе нарезки, сфера не проваливается и не выпрыгивает',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${rayChecked} лучей (худшее расхождение с опорой ${worstRay.toFixed(4)} м, перебор предела нарезки ${worstTol.toFixed(4)} м), ${sphereChecked} сфер радиуса ${r} м (худший провал ${worstSphere.toFixed(3)} м)`,
  };
}

function testTrackHoldsNoLamps() {
  const spec = LEVEL_13.map;
  const bad = [];
  const track = spec.roads.filter((r) => /^ring/.test(r.id));
  const street = spec.roads.filter((r) => !/^ring/.test(r.id));
  // Вопрос § 10.5 закрыт решением владельца: флаг снят с секции. Правило
  // нормализатора «уклонный настил фонарей не носит» выключал свет на всей
  // петле, потому что высотная волна делает наклонным каждый её настил, — а
  // `withLamps: true` при пустом `lamps` читался бы как обещание в данных.
  // Теперь бриф и эмиссия говорят одно. Если правило про уклон пересмотрят,
  // второй красной строкой тест скажет, что света у петли теперь столько, что
  // фотометрия и README требуют перемеры.
  for (const r of track) {
    if (r.withLamps) bad.push(`${r.id}: withLamps true — секция снова обещает фонари, которых эмиссия не ставит (§ 10.5 закрыт снятием флага)`);
    if ((r.lamps || []).length !== 0) bad.push(`${r.id}: фонарей ${r.lamps.length} — правьте план, README и пороги фотометрии`);
  }
  if (lampCount(spec.roads) === 0) bad.push('в главе нет ни одного фонаря — улица вообще не освещена источниками брифа');
  const ramp = track.flatMap((r) => r.decks).filter((d) => d.ramp).length;
  const decks = track.reduce((a, r) => a + r.decks.length, 0);
  if (ramp !== decks) bad.push(`наклонных элементов ${ramp} из ${decks} — волна не сделала кольцом все ${decks}`);
  return {
    name: 'Страж § 10.5 (закрыт): фонарей на петле нет ни в брифе, ни в данных — волна делает наклонным каждый настил, и правило снимает их целиком',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `дорог трассы ${track.length} (все с withLamps: false), настилов ${decks}, из них наклонных ${ramp}, фонарей на трассе 0; на улицах ${lampCount(street)}`,
  };
}

function testMoonLight() {
  const spec = LEVEL_13.map;
  const sky = LEVEL_13.sky;
  const bad = [];
  if (sky.lights) bad.push(`пул летающих огней в данных есть (${sky.lights.count} источников) — в пешеходном масштабе они читаются светильниками над игроком`);
  if (!(spec.lights.length === 0)) {
    const wash = spec.lights.filter((l) => !(l.direction?.[1] > 0.5 || l.angle?.up === true));
    if (wash.length) bad.push(`${wash.length} статичных подсветок светят не вверх — они освещали бы полотно, а не фасад`);
  }
  const moon = sky.sun?.intensity ?? CONFIG.sun.intensity;
  if (moon < 3.5) bad.push(`«луна» ${moon} ниже замеренного предела 3,5: асфальт главы 12 при 3,5 читается 42, а порог «улица без огней» — 40 (sRGB)`);
  const hemi = sky.hemi?.intensity ?? CONFIG.hemi.intensity;
  if (hemi > 0.9) bad.push(`ambient ${hemi} выше 0,9: hemi 1,8 даёт асфальту 36, а теневому фасаду 5 → 14, то есть съедает ночь, не освещая дорогу`);
  const hex = typeof spec.ground.color === 'string' ? parseInt(spec.ground.color.replace('#', ''), 16) : spec.ground.color;
  if (hex !== J.asphalt) bad.push(`грунт ${(spec.ground.color ?? '').toString()} не в цвет полотна ${J.asphalt.toString(16)}: тот же склон читался 31 против асфальта 42`);
  return {
    name: 'Свет главы 13: улица держится луны (≥ 3,5), летающих огней нет, грунт и полотно одной яркости',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `луна ${moon}, hemi ${hemi}, статичных подсветок ${spec.lights.length}, грунт #${hex.toString(16)} = асфальт; фотометрия петли и улиц — в журнале этапа 5 (порог «улица под фонарём 80» на главе не держится)`,
  };
}

/**
 * Разогрев и лучшее из трёх окон по 60 мс — протокол главы 12, дословно:
 * одиночное окно на холодном JIT ловит компиляцию и GC-паузу.
 */
function bestWindow(measure) {
  let best = { per: Infinity, calls: 0 };
  for (let k = 0; k < 4; k++) {
    const t0 = performance.now();
    let calls = 0;
    while (performance.now() - t0 < 60) calls += measure();
    const per = (performance.now() - t0) * 1000 / calls;
    if (k > 0 && per < best.per) best = { per, calls };
  }
  return best;
}

function testChapterBudget() {
  const map = createJsonMap(LEVEL_13.map);
  map.build(new THREE.Scene());
  // та же глава без поля: `groundPlane` возвращается, relief-ветки не идут, а
  // солиды, настилы, призмы и дуги остаются те же. Отношение двух замеров одного
  // прогона и есть пункт 6 («рельеф не дороже вдвое»): абсолютные микросекунды
  // от машины плавают в полтора раза, отношение — нет.
  const plain = createJsonMap({ ...LEVEL_13.map, relief: null });
  plain.build(new THREE.Scene());
  const nodes = map.nav.adj.length;
  const lattice = (Math.floor(map.width / J.navStep) + 1) ** 2;
  const decks = LEVEL_13.map.roads.reduce((a, r) => a + r.decks.length, 0);
  const arcs = LEVEL_13.map.roads.flatMap((r) => r.decks).filter((d) => d.arc).length;
  const pillars = pillarCount(LEVEL_13.map.roads);
  const range = CONFIG.weapon.range;
  const half = map.width / 2 - 1;
  const bad = [];
  if (nodes > lattice * 1.5) bad.push(`узлов ${nodes} — это ${(nodes / lattice).toFixed(2)}× решётки ${lattice} при пределе 1,5×`);
  if (decks > 300) bad.push(`настилов ${decks} при бюджете главы 13 «≤ 300»`);
  if (arcs > 16) bad.push(`дуг ${arcs} при бюджете «12…16»`);
  if (pillars > 160) bad.push(`опор ${pillars} (прогноз плана — 70 главы 12 + ~60 новых)`);
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
    name: 'Бюджет собранной главы 13: узлы ≤ 1,5 решётки, настилов ≤ 300, дуг ≤ 16, опоры ≤ 160, пробы в пределах главы 12 и не дороже вдвое против той же карты без поля',
    passed: bad.length === 0,
    info: (bad.length ? bad.join('; ') + ' — ' : '')
      + `${nodes} узлов на решётке ${lattice} (${(nodes / lattice).toFixed(2)}×), настилов ${decks} (дуг ${arcs}), опор ${pillars}, фонарей ${lampCount(LEVEL_13.map.roads)}; `
        + `поле ${field.toFixed(2)} медианой / ${win.field.toFixed(2)} окном; `
        + `опора ${support.on.toFixed(2)} против ${support.off.toFixed(2)} (${support.ratio.toFixed(2)}×), окном ${win.support.toFixed(2)}; `
        + `луч 120 м ${down.on.toFixed(0)} против ${down.off.toFixed(0)} (${down.ratio.toFixed(2)}×), окном ${win.down.toFixed(0)}; `
        + `выстрел ${range} м ${shot.on.toFixed(0)} против ${shot.off.toFixed(0)} (${shot.ratio.toFixed(2)}×), окном ${win.shot.toFixed(0)}; `
        + `сфера ${sphere.on.toFixed(1)} против ${sphere.off.toFixed(1)} (${sphere.ratio.toFixed(2)}×), окном ${win.sphere.toFixed(1)}`,
  };
}

function testFrozenChapters() {
  const bad = [];
  const info = [];
  for (const [name, spec] of [['глава 9', LEVEL_09.map], ['глава 10', LEVEL_10.map], ['глава 11', LEVEL_11.map], ['глава 12', LEVEL_12.map]]) {
    const ring = spec.roads.filter((r) => /^ring/.test(r.id));
    if (ring.length) bad.push(`${name}: дороги трассы приехали в прежнюю главу (${ring.map((r) => r.id).join(', ')})`);
    const arcs = spec.roads.flatMap((r) => r.decks).filter((d) => d.arc);
    const rails = spec.roads.flatMap((r) => r.decks).filter((d) => d.rails);
    info.push(`${name}: настилов ${spec.roads.reduce((a, r) => a + r.decks.length, 0)}, дуг ${arcs.length}, с перилами ${rails.length}`);
  }
  if (LEVELS.length !== 13) bad.push(`в реестре ${LEVELS.length} глав — глава 13 не зарегистрирована`);
  if (LEVELS[LEVELS.length - 1] !== LEVEL_13) bad.push('глава 13 не последняя в порядке прохождения');
  // схема v1 обязана браковать секцию `track`: иначе косой бриф собрался бы молча
  const withTrack = {
    kind: 'json',
    metadata: { levelName: 'x', name: '—', hint: '—', units: 'meters' },
    ground: { y: 0, size: 300 },
    city: {
      seed: 1,
      districts: [{ id: 'd', block: { minX: -100, maxX: 100, minZ: -100, maxZ: 100 } }],
      track: { radius: 120, turns: 12 },
    },
    roads: [], buildings: [], landscapeObjects: [], lights: [],
    gameplay: { goal: 'exit', spawn: { x: 0, z: 0 }, exit: { x: 50, z: 50 }, exitRadius: 4, enemies: { count: 1 }, alienEnemies: { count: 1 } },
  };
  let rejected = '';
  try { expandCity(structuredClone(withTrack)); } catch (e) { rejected = String(e.message).split('\n')[0]; }
  if (!rejected) bad.push('v1-бриф с секцией `track` развернулся — схема не бережёт замороженные главы');
  return {
    name: 'Заморозка: главы 9–12 не получили дорог трассы, v1-бриф с `city.track` отвергается, реестр — 13 глав',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ') : `${info.join(' | ')} | v1 с track отвергнут: «${rejected.slice(0, 90)}»`,
  };
}

// --------------------------------------------------------------------- запуск

export async function runTrackCityTests() {
  const tests = [
    testBriefPipeline,
    testRingIsOneSealedRibbon,
    testDeckRidesAboveField,
    testFootStandsOnDeck,
    testBankRidesTheEdge,
    testRailsBlockTheDrop,
    testNoseLandsOnStreet,
    testOneNetwork,
    testRoutePassesOverTrackAndGround,
    testRayAndSphereOnRibbon,
    testTrackHoldsNoLamps,
    testMoonLight,
    testChapterBudget,
    testFrozenChapters,
  ];
  const results = [];
  for (const fn of tests) {
    try { results.push(await fn()); }
    catch (e) { results.push({ name: fn.name, passed: false, info: `ошибка: ${e && e.message} | ${e && e.stack && e.stack.split('\n')[1]}` }); }
  }
  const passed = results.filter(r => r.passed).length;

  if (typeof console !== 'undefined') {
    console.group('Автотесты трассы генератора (json2, city.track, этап 5)');
    for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'} — ${r.name}: ${r.info}`);
    console.log(`Итого: ${passed}/${results.length}`);
    console.groupEnd();
  }
  return { passed, total: results.length, results };
}
