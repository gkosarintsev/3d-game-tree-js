/**
 * Браузерная сюита плавного рельефа в движке (этапы 3–4 плана
 * `docs/level12-relief-plan.md`).
 *
 * Проверяется ровно то, за чем в проекте следят всегда: опора ноги, луч, сфера,
 * картинка грунта и навигация обязаны быть ОДНОЙ поверхностью. Поле здесь
 * пересчитывается в тесте независимо (свой smoothstep, свои вес площадки и свой
 * кадр поворота) против данных главы, а не вызовом `src/relief.js`, — иначе
 * тест подтверждал бы сам себя и не поймал бы, например, что карта где-то всё ещё
 * считает «полом мира» ноль.
 */
import * as THREE from 'three';
import { createJsonMap } from '../src/json-map.js';
import { LEVEL_11 } from '../src/levels/level-11.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { validateLevel, LEVEL_SPEC_V2 } from '../tools/level-schema.mjs';
import { CONFIG } from '../src/config.js';
import { parseLevelFilter, SKIPPED, filteredOut } from './level-filter.js';

const J = CONFIG.jsonMap;
const STEP = CONFIG.building.stepUp;
const PLAYER_H = CONFIG.eyeHeight + 0.35;

// ------------------------------------------------------------------ бриф главы

/**
 * Два яруса на 240 м: гряда (+9 м) на севере, левица (−5 м) на юго-западе,
 * терраса района 5,8 м на её южном склоне, косой дом на террасе, дом в низине,
 * улица по террасе, улица по дну низины и пролёт-эстакада (косая пластина под 90°)
 * над склоном: его плоскость держится выше поля на 0,3 м по всей длине — ровно
 * в пределах шага ноги, чтобы узел под пролётом и узел на пролёте не расходились
 * стеной. Это ровно то, что надо проверить отдельно от «голого» поля.
 */
export const RAW = {
  kind: 'json2',
  metadata: { levelName: 'ReliefTerrain', name: 'Холм, терраса и подъём', hint: '—', units: 'meters' },
  ground: { y: 0, size: 240, color: '#23262c' },
  relief: {
    baseY: 0,
    hills: [
      { id: 'gryada', x: -30, z: 60, bx: 60, bz: 60, radius: 320, height: 9 },
      { id: 'lovchina', x: -80, z: -70, radius: 320, height: -5 },
    ],
    pads: [{ id: 'terrace', minX: -20, maxX: 40, minZ: 20, maxZ: 68, y: 5.8 }],
  },
  roads: [
    { id: 'st_high', type: 'ground', width: 8, lamps: true,
      points: [{ x: -20, y: 5.8, z: 60 }, { x: 40, y: 5.8, z: 60 }] },
    { id: 'st_low', type: 'ground', width: 8, lamps: true,
      points: [{ x: -100, y: -0.3, z: -70 }, { x: -40, y: 1.9, z: -70 }] },
    { id: 'rp_climb', type: 'bridge', width: 8,
      elements: [{ plate: { x: 0, z: -20, yaw: 90, length: 40, width: 8, y: 3.1, rise: 1.7 } }] },
    // Оба торца съезда — свободные носы (`bridgeNoses`: не стык цепочки и ниже
    // `bridgeMinHeight` над грунтом), и схема v2 требует под ними асфальт, а не
    // поле: «подъём обязан кончаться на полотне улицы». Улицы поперёк оси съезда
    // (тот бежит вдоль Z) и на его же отметках, поэтому шов выходит без ступени.
    { id: 'st_land_low', type: 'ground', width: 8,
      points: [{ x: -20, y: 3.1, z: -40 }, { x: 20, y: 3.1, z: -40 }] },
    { id: 'st_land_high', type: 'ground', width: 8,
      points: [{ x: -20, y: 4.8, z: 0 }, { x: 20, y: 4.8, z: 0 }] },
  ],
  buildings: [
    { id: 'h_high', isEnterable: false, floorsCount: 2, floorHeight: 3.4, rotation: 20,
      footprint: [{ x: -10, z: 28 }, { x: 20, z: 28 }, { x: 20, z: 44 }, { x: -10, z: 44 }],
      rooms: [] },
    { id: 'h_low', isEnterable: false, floorsCount: 2, floorHeight: 3.4,
      footprint: [{ x: -110, z: -95 }, { x: -86, z: -95 }, { x: -86, z: -75 }, { x: -110, z: -75 }],
      rooms: [] }],
  gameplay: { goal: 'exit', spawn: { x: -100, z: -60 }, exit: { x: 30, z: 30 }, exitRadius: 4 },
};

// -------------------------------------------------- независимая арифметика теста

const ease = (t) => t * t * (3 - 2 * t);

/** Расстояние от точки до отрезка в плане (тот же критерий, что у капсулы). */
function segDist(x, z, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  const l2 = dx * dx + dz * dz;
  const t = l2 > 0 ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2)) : 0;
  return Math.hypot(x - (ax + t * dx), z - (az + t * dz));
}

/**
 * Поле главы, собранное из НОРМАЛИЗОВАННЫХ данных брифа (округлённых парсером до
 * миллиметра) независимым кодом: сумма капсул плюс последовательное смешение
 * площадок `h ← h + (y − h) · вес`.
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
  const eps = J.relief.normalEps;
  const slopeAt = (x, z) => ({
    dx: (heightAt(x + eps, z) - heightAt(x - eps, z)) / (2 * eps),
    dz: (heightAt(x, z + eps) - heightAt(x, z - eps)) / (2 * eps),
  });
  const normalAt = (x, z) => {
    const s = slopeAt(x, z);
    const len = Math.hypot(s.dx, 1, s.dz);
    return { x: -s.dx / len, y: 1 / len, z: -s.dz / len, dx: s.dx, dz: s.dz };
  };
  return { heightAt, normalAt, slopeAt, hills, pads };
}

/** План пластины настила: свои оси, если есть obb, иначе мировой прямоугольник. */
function deckHolds(d, x, z, margin = 0) {
  const hx = (d.length ?? (d.maxX - d.minX)) / 2 + margin;
  const hz = (d.width ?? (d.maxZ - d.minZ)) / 2 + margin;
  if (d.obb) {
    const dx = x - d.obb.cx, dz = z - d.obb.cz;
    const u = dx * d.obb.c + dz * d.obb.s;
    const v = -dx * d.obb.s + dz * d.obb.c;
    return Math.abs(u) <= hx && Math.abs(v) <= hz;
  }
  const cx = (d.minX + d.maxX) / 2, cz = (d.minZ + d.maxZ) / 2;
  if (d.axis === 'z') return Math.abs(x - cx) <= hz && Math.abs(z - cz) <= hx;
  return Math.abs(x - cx) <= hx && Math.abs(z - cz) <= hz;
}

/** Верх настила в точке его плана: линейно между отметками торцов. */
function deckTop(d, field, x, z) {
  if (!deckHolds(d, x, z)) return null;
  const span = d.length ?? (d.axis === 'z' ? d.maxZ - d.minZ : d.maxX - d.minX);
  let u = 0;
  if (d.obb) {
    const dx = x - d.obb.cx, dz = z - d.obb.cz;
    u = dx * d.obb.c + dz * d.obb.s + span / 2;
  } else if (d.axis === 'z') {
    u = z - d.minZ;
  } else {
    u = x - d.minX;
  }
  return d.topAtMin + (d.topAtMax - d.topAtMin) * (u / span);
}

/** План дома в его собственных осях (повёрнут на `rotation` вокруг центра). */
function houseHolds(b, x, z, margin = 0) {
  const cx = (b.bounds.minX + b.bounds.maxX) / 2, cz = (b.bounds.minZ + b.bounds.maxZ) / 2;
  let lx = x, lz = z;
  if (b.rotation) {
    const rad = b.rotation * Math.PI / 180;
    const dx = x - cx, dz = z - cz;
    const c = Math.cos(rad), s = Math.sin(rad);
    lx = cx + dx * c + dz * s;
    lz = cz - dx * s + dz * c;
  }
  return lx >= b.bounds.minX - margin && lx <= b.bounds.maxX + margin
    && lz >= b.bounds.minZ - margin && lz <= b.bounds.maxZ + margin;
}

let built = null;

function builtMap() {
  if (!built) {
    const level = normalizeLevel(structuredClone(RAW));
    const map = createJsonMap(level.map);
    built = { level, map, field: makeField(level.map.relief), decks: level.map.roads.flatMap(r => r.decks) };
  }
  return built;
}

/** Точка «голого» поля: вне планов настилов (с запасом на их призмы) и домов. */
function barePoints(map, ctx, n, step = 5.3, origin = -117.7) {
  const out = [];
  let x = origin;
  while (x <= 118 && out.length < n) {
    let z = origin;
    while (z <= 118 && out.length < n) {
      if (isBare(map, ctx, x, z)) out.push({ x, z });
      z += step;
    }
    x += step;
  }
  return out;
}

/**
 * Самые крутые bare-точки поля: пробы по сетке 5,3 м дают в основном пологие
 * склоны (предел 0,12 м/м живёт в узком кольце перехода площадки), а проверяемое
 * выталкивание и нормаль интересны именно там, где уклон у предела.
 */
function steepPoints(map, ctx, n, min = 0.08) {
  const all = [];
  for (let x = -112; x <= 112; x += 1.3) {
    for (let z = -112; z <= 112; z += 1.3) {
      if (!isBare(map, ctx, x, z)) continue;
      const s = ctx.field.slopeAt(x, z);
      const mag = Math.hypot(s.dx, s.dz);
      if (mag >= min) all.push({ x, z, mag });
    }
  }
  all.sort((a, b) => b.mag - a.mag);
  // берём каждое седьмое: иначе все точки лягут в одно кольцо одного перехода
  return all.filter((_, i) => i % 7 === 0).slice(0, n);
}

/** Точка вне планов настилов и домов — на ней опора обязана быть полем. */
function isBare(map, ctx, x, z) {
  return !ctx.decks.some(d => deckHolds(d, x, z, 1.2))
    && !map.buildings.some(b => houseHolds(b, x, z, 1.2));
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
  const r = level.map.relief;
  if (!r || r.hills.length !== 2 || r.pads.length < 1) bad.push(`секция relief дошла криво: ${JSON.stringify(r && { h: r.hills.length, p: r.pads.length })}`);
  const map = builtMap().map;
  if (!map.relief) bad.push('карта не построила поле');
  if (map.groundPlane !== null) bad.push('с рельефом земля-плоскость осталась: луч и опора имели бы два пола');
  if (map.floorAt !== null && typeof map.floorAt !== 'function') bad.push('floorAt не стал опорой');
  // опоры и фонари из данных обязаны встать на поле, а не на ноль
  const props = level.map.props.filter(p => p.model === 'lamp_post');
  const off = props.filter(p => Math.abs(p.position.y - builtMap().field.heightAt(p.position.x, p.position.z)) > 1e-6);
  if (off.length) bad.push(`${off.length} фонарей не на отметке поля (первый y=${off[0].position.y})`);
  return {
    name: 'Бриф с секцией relief: схема молчит, поле дошло до карты, земля-плоскость отменена',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${r.hills.length} капсулы, ${r.pads.length} площадки, ${props.length} фонарей на своих отметках поля`,
  };
}

function testFieldIsTheFloor() {
  const ctx = builtMap();
  const map = ctx.map;
  const pts = barePoints(map, ctx, 400);
  const bad = [];
  let worst = 0, wr = pts.length ? { ...pts[0] } : null;
  for (const p of pts) {
    const want = ctx.field.heightAt(p.x, p.z);
    // fromY = 0 (нога на нуле) и fromY = 500 (взгляд сверху) обязаны дать одну
    // отметку: местность не фильтруется пределом шага
    for (const fromY of [0, 500]) {
      const g = map.groundHeightAt(p.x, p.z, fromY);
      const dev = Math.abs(g - want);
      if (dev > worst) { worst = dev; wr = { ...p, fromY, g }; }
      if (dev > 1e-6) bad.push(`(${p.x.toFixed(1)}, ${p.z.toFixed(1)}) fromY=${fromY}: опора ${g.toFixed(6)}, поле ${want.toFixed(6)}`);
    }
  }
  if (pts.length < 200) bad.push(`сверено всего ${pts.length} проб поля`);
  const below = pts.filter(p => ctx.field.heightAt(p.x, p.z) < 0).length;
  return {
    name: 'Опора ноги в 400 точках «голого» поля совпадает с полем, в том числе ниже нуля',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${pts.length} проб (из них ${below} ниже нуля), худшее расхождение ${worst.toExponential(1)} м в (${wr.x.toFixed(1)}, ${wr.z.toFixed(1)})`,
  };
}

function testPlateRidesTheField() {
  const ctx = builtMap();
  const map = ctx.map;
  const climb = ctx.decks.find(d => d.obb && d.ramp);
  const bad = [];
  if (!climb) return { name: 'Настил держит опору над полем, а за бортом поля не трогает', passed: false, info: 'косой пластины над склоном нет в данных' };
  const c = climb.obb;
  const dir = { x: c.c, z: c.s };
  const side = { x: -c.s, z: c.c };
  // Полоса в 4 м от каждого торца — план принимающей улицы (`st_land_low` у
  // нижнего срезa, `st_land_high` у верхнего): правило §4.6 не даёт пролёту
  // кончаться в поле, поэтому «за бортом снова поле» честно мерить только на
  // внутренних пробах, а у торцев проверяется сам шов «нос → полотно улицы».
  const LAND = [
    { s: 4, top: 3.1 },
    { s: climb.length - 4, top: 4.8 },
  ];
  const landAt = s => LAND.find(l => l.s === s);
  for (let s = 4; s <= climb.length - 4; s += 5) {
    const u = -climb.length / 2 + s;
    const p = { x: c.cx + u * dir.x, z: c.cz + u * dir.z };
    const want = climb.topAtMin + (climb.topAtMax - climb.topAtMin) * s / climb.length;
    const f = ctx.field.heightAt(p.x, p.z);
    const g = map.groundHeightAt(p.x, p.z, 500);
    if (Math.abs(g - want) > 1e-6) bad.push(`s=${s}: опора ${g.toFixed(3)} вместо настила ${want.toFixed(3)}`);
    if (want - f < 0.05) bad.push(`s=${s}: настил ${want.toFixed(2)} не выше поля ${f.toFixed(2)} — проба не о настиле`);
    const q = { x: p.x + side.x * 5, z: p.z + side.z * 5 };
    const fq = ctx.field.heightAt(q.x, q.z);
    const gq = map.groundHeightAt(q.x, q.z, 500);
    const land = landAt(s);
    if (land) {
      // за бортом у торца — асфальт принимающей улицы той же отметки, что нос:
      // съезд handит поток полотну, а не склону
      if (Math.abs(gq - land.top) > 1e-6) {
        bad.push(`s=${s}: за бортом у торца опора ${gq.toFixed(3)}, а не полотно улицы ${land.top}`);
      }
      if (Math.abs(gq - fq) <= 1e-6) bad.push(`s=${s}: проба за торцом не на улице (поле ${fq})`);
    } else if (Math.abs(gq - fq) > 1e-6) {
      bad.push(`s=${s}: за бортом опора ${gq.toFixed(3)}, а поле ${fq.toFixed(3)} — призма шире полотна`);
    }
  }
  // торец пролёта: сразу за ним нога встаёт на полотно своей улицы, и ступени
  // «настил → съезд» нет вовсе (допуск тот же, что у схемы: `J.skybridgeFit`)
  const head = { x: c.cx + (climb.length / 2 + 1) * dir.x, z: c.cz + (climb.length / 2 + 1) * dir.z };
  const gHead = map.groundHeightAt(head.x, head.z, climb.topAtMax);
  if (Math.abs(gHead - LAND[1].top) > 1e-6) {
    bad.push(`за торцом: опора ${gHead.toFixed(3)} вместо полотна принимающей улицы ${LAND[1].top}`);
  }
  if (Math.abs(climb.topAtMax - gHead) > J.skybridgeFit) {
    bad.push(`сход с пролёта даёт ступень ${(climb.topAtMax - gHead).toFixed(3)} м при допуске ${J.skybridgeFit}`);
  }
  const fHead = ctx.field.heightAt(head.x, head.z);
  if (climb.topAtMax - fHead > STEP + J.skybridgeFit) {
    bad.push(`с улицы на грунт подъём ${(climb.topAtMax - fHead).toFixed(2)} м — нога не перешагнёт`);
  }
  return {
    name: 'Настил держит опору над полем, а за бортом и за торцом поля не трогает',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `полотно ${climb.length}×${climb.width} под ${climb.yaw}°: от ${climb.topAtMin.toFixed(2)} до ${climb.topAtMax.toFixed(2)} м, ${Math.floor((climb.length - 8) / 5) + 1} проб, за бортом — поле`,
  };
}

function testRayFindsTheField() {
  const ctx = builtMap();
  const map = ctx.map;
  const pts = [...steepPoints(map, ctx, 6), ...barePoints(map, ctx, 90).filter((_, i) => i % 4 === 0).slice(0, 24)];
  const bad = [];
  let worst = 0;
  for (const p of pts) {
    const want = ctx.field.heightAt(p.x, p.z);
    const n = ctx.field.normalAt(p.x, p.z);
    const hit = map.raySolid(p.x, want + 25, p.z, 0, -1, 0, 60);
    if (!hit) { bad.push(`(${p.x.toFixed(1)}, ${p.z.toFixed(1)}): луч сверху ничего не нашёл — грунту некуда упасть`); continue; }
    worst = Math.max(worst, Math.abs(hit.y - want));
    if (Math.abs(hit.y - want) > 1e-3) bad.push(`(${p.x.toFixed(1)}, ${p.z.toFixed(1)}): луч на ${hit.y.toFixed(4)}, поле ${want.toFixed(4)}`);
    else if (Math.hypot(hit.nx - n.x, hit.ny - n.y, hit.nz - n.z) > 1e-4) {
      bad.push(`(${p.x.toFixed(1)}, ${p.z.toFixed(1)}): нормаль (${hit.nx.toFixed(3)}, ${hit.ny.toFixed(3)}, ${hit.nz.toFixed(3)}) поля (${n.x.toFixed(3)}, ${n.y.toFixed(3)}, ${n.z.toFixed(3)})`);
    }
  }
  if (pts.length < 25) bad.push(`сверено всего ${pts.length} лучей`);
  return {
    name: 'Луч сверху падает ровно на аналитическое поле и отдаёт его нормаль',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ') : `${pts.length} вертикальных лучей, худшее расхождение ${worst.toExponential(1)} м`,
  };
}

function testRayAlongTheSlope() {
  const ctx = builtMap();
  const map = ctx.map;
  const bad = [];
  // луч, выпущенный из точки в 2 м над полем под наклоном −0,05, обязан встать в
  // склон: расстояние считает независимый марш по тому же полю (шаг 0,25 м +
  // бисекция), а не `_reliefRay` карты
  const dy = -0.05;
  let done = 0, worst = 0;
  for (const [x0, z0, az] of [[-60, 0, 0], [-40, 30, 0], [20, -60, Math.PI / 2], [-20, -30, Math.PI / 4], [40, 80, Math.PI], [-90, -30, Math.PI / 3]]) {
    const h = ctx.field.heightAt(x0, z0) + 2;
    const dx = Math.cos(az), dz = Math.sin(az);
    const len = Math.hypot(dx, dy, dz);
    const ux = dx / len, uy = dy / len, uz = dz / len;
    const gap = (t) => h + uy * t - ctx.field.heightAt(x0 + ux * t, z0 + uz * t);
    let lo = null;
    for (let t = 0.25; t <= 120; t += 0.25) {
      if (gap(t) < 0) { lo = [t - 0.25, t]; break; }
    }
    if (!lo) { bad.push(`(${x0}, ${z0}) азимут ${az.toFixed(2)}: луч за 120 м не встретил склон — проверка бессмысленна`); continue; }
    let a = lo[0], b = lo[1];
    for (let k = 0; k < 40 && b - a > 1e-5; k++) {
      const m = (a + b) / 2;
      if (gap(m) < 0) b = m; else a = m;
    }
    const want = (a + b) / 2;
    const hit = map.raySolid(x0, h, z0, ux, uy, uz, 140);
    if (!hit) { bad.push(`(${x0}, ${z0}): луч вдоль склона прошёл сквозь склон`); continue; }
    done++;
    worst = Math.max(worst, Math.abs(hit.dist - want));
    if (Math.abs(hit.dist - want) > 0.05) {
      bad.push(`(${x0}, ${z0}) азимут ${az.toFixed(2)}: удар на ${hit.dist.toFixed(3)} м, склон на ${want.toFixed(3)} м`);
    }
  }
  // луч, выпущенный вниз с пролёта-эстакады, обязан упереться в настил, а не в поле
  const climb = ctx.decks.find(d => d.obb && d.ramp);
  if (climb) {
    const c = climb.obb;
    const u = -climb.length / 2 + 15;
    const p = { x: c.cx + u * c.c, z: c.cz + u * c.s };
    const want = climb.topAtMin + (climb.topAtMax - climb.topAtMin) * 15 / climb.length;
    const hit = map.raySolid(p.x, 40, p.z, 0, -1, 0, 80);
    if (!hit || Math.abs(hit.y - want) > 1e-3) {
      bad.push(`луч над пролётом дал ${hit ? hit.y.toFixed(3) : 'ничего'}, а настил на ${want.toFixed(3)}`);
    }
    done++;
  }
  return {
    name: 'Луч вдоль склона встаёт в поле на независимом расстоянии, над настилом — в настил',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${done} лучей, худшее расхождение ${worst.toFixed(3)} м (марш карты шагом ${J.relief.meshCell / 2} м против шага 0,25 м)`,
  };
}

function testPictureIsTheSupport() {
  const ctx = builtMap();
  const map = ctx.map;
  const scene = new THREE.Scene();
  map.build(scene);
  const ground = map.sceneObjects.find(o => o.isMesh && Math.abs(o.rotation.x + Math.PI / 2) < 1e-9 && o.geometry.attributes.normal);
  const bad = [];
  if (!ground) return { name: 'Картинка грунта — то же поле, что опора и луч: вершины сетки точны, хорда в бюджете', passed: false, info: 'меш грунта не найден' };
  const pos = ground.geometry.attributes.position;
  const nrm = ground.geometry.attributes.normal;
  const gy = ground.position.y;
  if (pos.count <= 4) bad.push(`грунт нарезан ${pos.count} вершинами — сетки рельефа нет`);
  let worstV = 0, worstN = 0;
  for (let k = 0; k < pos.count; k++) {
    // локальные (x, y, z) → мировые (x, groundY + z, −y): меш повёрнут на −90° вокруг X
    const x = pos.getX(k), z = -pos.getY(k), y = gy + pos.getZ(k);
    const want = ctx.field.heightAt(x, z);
    worstV = Math.max(worstV, Math.abs(y - want));
    if (Math.abs(y - want) > 1e-6) bad.push(`вершина (${x.toFixed(1)}, ${z.toFixed(1)}) на ${y.toFixed(4)}, поле ${want.toFixed(4)}`);
    const n = ctx.field.normalAt(x, z);
    const wx = nrm.getX(k), wy = nrm.getZ(k), wz = -nrm.getY(k);
    worstN = Math.max(worstN, Math.hypot(wx - n.x, wy - n.y, wz - n.z));
  }
  if (worstN > 1e-6) bad.push(`нормаль меша ушла от аналитической на ${worstN.toFixed(6)}`);
  // хорда: средняя точка ребра треугольника против поля — картинка не обязана
  // быть точной между узлами сетки, но её прогиб открыт и лимитирован
  const idx = ground.geometry.index;
  let worstC = 0, atC = null;
  const tri = (i) => ({ x: pos.getX(i), y: pos.getY(i), z: pos.getZ(i) });
  for (let t = 0; t < idx.count; t += 3) {
    const a = tri(idx.getX(t)), b = tri(idx.getX(t + 1)), c = tri(idx.getX(t + 2));
    for (const [p, q] of [[a, b], [b, c], [c, a]]) {
      const mx = (p.x + q.x) / 2, mz = -(p.y + q.y) / 2;
      const chord = gy + (p.z + q.z) / 2;
      const dev = Math.abs(chord - ctx.field.heightAt(mx, mz));
      if (dev > worstC) { worstC = dev; atC = [mx.toFixed(1), mz.toFixed(1)]; }
    }
  }
  if (worstC > 0.15) bad.push(`хорда сетки ${J.relief.meshCell} м провисает на ${worstC.toFixed(3)} м в (${atC}) — картинка разошлась с опорой`);
  return {
    name: 'Картинка грунта — то же поле, что опора и луч: вершины сетки точны, хорда в бюджете',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${pos.count} вершин точно (≤ 1e-6 м), нормали аналитические, худшая хорда ${worstC.toFixed(3)} м в (${atC}) при шаге ${J.relief.meshCell} м`,
  };
}

function testSphereOnSlope() {
  const ctx = builtMap();
  const map = ctx.map;
  const r = CONFIG.radius;
  const pts = [...steepPoints(map, ctx, 8), ...barePoints(map, ctx, 60).filter((_, i) => i % 11 === 0)];
  const bad = [];
  /** Наименьшее расстояние от центра до поля: перебор локальной сетки 0,1 м. */
  const nearest = (c) => {
    let best = Infinity;
    for (let dx = -1; dx <= 1; dx += 0.1) {
      for (let dz = -1; dz <= 1; dz += 0.1) {
        const y = ctx.field.heightAt(c.x + dx, c.z + dz);
        best = Math.min(best, Math.hypot(dx, c.y - y, dz));
      }
    }
    return best;
  };
  let steepest = 0;
  for (const p of pts) {
    const h = ctx.field.heightAt(p.x, p.z);
    const n = ctx.field.normalAt(p.x, p.z);
    const slope = Math.hypot(n.dx, n.dz);
    steepest = Math.max(steepest, slope);
    // (1) центр на радиусе по нормали поля: до поверхности ровно r, выталкивать
    // почти нечем. Дрейф в микроны остаётся: карта берёт касательную плоскость в
    // точке ПОД центром, а на кривом склоне она чуть ниже самой поверхности
    const c = { x: p.x + n.x * r, y: h + n.y * r, z: p.z + n.z * r };
    const before = { ...c };
    map.resolveSphere(c, r);
    const drift = Math.hypot(c.x - before.x, c.y - before.y, c.z - before.z);
    if (drift > 2e-3) {
      bad.push(`(${p.x.toFixed(1)}, ${p.z.toFixed(1)}): стоящая на склоне сфера сдвинута на ${drift.toFixed(4)} м`);
    }
    // вертикальный зазор центра над полем под ним — r / cos уклона (AGENTS о сфере
    // на наклонной плоскости), а не r: на склоне 0,12 это +0,7 %
    const wantVert = r * Math.hypot(n.dx, 1, n.dz);
    const gotVert = c.y - ctx.field.heightAt(c.x, c.z);
    if (Math.abs(gotVert - wantVert) > 0.005) {
      bad.push(`(${p.x.toFixed(1)}, ${p.z.toFixed(1)}): вертикаль ${gotVert.toFixed(4)} вместо r/cos ${(wantVert).toFixed(4)}`);
    }
    // (2) сфера, опущенная на половину радиуса, обязана выйти по нормали поля
    const d = { x: p.x, y: h + r / 2, z: p.z };
    map.resolveSphere(d, r);
    const dist = nearest(d);
    if (Math.abs(dist - r) > 0.03) {
      bad.push(`(${p.x.toFixed(1)}, ${p.z.toFixed(1)}): после выталкивания до поля ${dist.toFixed(3)} м, а радиус ${r}`);
    }
    const shift = { x: d.x - p.x, z: d.z - p.z };
    const rho = Math.hypot(n.x, n.z);
    if (rho > 1e-6) {
      const ux = n.x / rho, uz = n.z / rho;
      const along = shift.x * ux + shift.z * uz;
      const perp = Math.hypot(shift.x - along * ux, shift.z - along * uz);
      if (perp > 1e-6) bad.push(`(${p.x.toFixed(1)}, ${p.z.toFixed(1)}): сферу снесло поперёк нормали на ${perp.toFixed(4)} м`);
      if (along < 0) bad.push(`(${p.x.toFixed(1)}, ${p.z.toFixed(1)}): сфера ушла вверх по склону, а не по нормали наружу`);
    }
    // (3) второй вызов почти ничего не добавляет: поле за метр не уходит
    const again = { ...d };
    map.resolveSphere(again, r);
    const rest = Math.hypot(again.x - d.x, again.y - d.y, again.z - d.z);
    if (rest > 0.02) bad.push(`(${p.x.toFixed(1)}, ${p.z.toFixed(1)}): второй вызов сдвинул ещё на ${rest.toFixed(3)} м`);
  }
  if (pts.length < 6) bad.push(`сверено всего ${pts.length} склонов`);
  return {
    name: 'Сфера на склоне держит радиус по нормали поля, r/cos по вертикали и не сносится поперёк',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${pts.length} точек поля (крутизна до ${steepest.toFixed(3)} м/м): стоячая не сдвинулась, погружённая вышла по нормали`,
  };
}

function testNavOverSlope() {
  const ctx = builtMap();
  const map = ctx.map;
  const nav = map.nav;
  const bad = [];
  const half = Math.max(map.width, map.depth) / 2;
  const grid = J.navStep;
  const onLattice = (p) => {
    const fx = Math.abs(((p.x + half) % grid + grid) % grid);
    const fz = Math.abs(((p.z + half) % grid + grid) % grid);
    return (fx < 1e-6 || Math.abs(fx - grid) < 1e-6) && (fz < 1e-6 || Math.abs(fz - grid) < 1e-6);
  };
  // узел вне решётки, стоящий ровно на поле, — это вставка внутри ребра склона
  const mid = nav.pos.filter(p => !onLattice(p) && Math.abs(p.y - ctx.field.heightAt(p.x, p.z)) < 1e-6);
  if (mid.length === 0) bad.push('ни одного промежуточного узла на склоне: решётка дала разрыв там, где |Δy| > stepUp');
  // всякий узел стоит на своей опоре: отсчёт от отметки самого узла (так же мерит
  // нога, вставшая на узел), а узел на настиле обязан быть выше поля
  let offSupport = 0, buried = null;
  for (const p of nav.pos) {
    const f = ctx.field.heightAt(p.x, p.z);
    if (Math.abs(p.y - map.groundHeightAt(p.x, p.z, p.y)) > 1e-6) offSupport++;
    if (f - p.y > 1e-6 && (!buried || Math.abs(f - p.y) > Math.abs(buried.d))) buried = { x: p.x, z: p.z, y: p.y, f, d: f - p.y };
  }
  if (offSupport) bad.push(`${offSupport} узлов не на своей опоре`);
  if (buried) bad.push(`узел (${buried.x.toFixed(1)}, ${buried.z.toFixed(1)}) на ${buried.y.toFixed(2)} м погребён под полем ${buried.f.toFixed(2)} м`);
  // одно связное множество + и низина, и терраса в нём
  const start = nav.nearestNode(map.spawn.x, map.spawn.y, map.spawn.z);
  if (start < 0) bad.push('спавн не нашёл узла');
  const seen = new Uint8Array(nav.pos.length);
  const queue = [start];
  seen[start] = 1;
  for (let head = 0; head < queue.length; head++) {
    for (const nb of nav.adj[queue[head]]) if (!seen[nb]) { seen[nb] = 1; queue.push(nb); }
  }
  if (queue.length !== nav.pos.length) bad.push(`от спавна достижимо ${queue.length} узлов из ${nav.pos.length} — карман не отсекался, а рассыпался`);
  const terrace = nav.pos.filter(p => p.y > 5.7 && p.y < 5.85 && p.x > -20 && p.x < 40 && p.z > 20 && p.z < 68).length;
  if (terrace < 10) bad.push(`узлов на террасе ${terrace} — склон отрезал верхний ярус`);
  const low = nav.pos.filter(p => p.y < 1.5 && p.z < -50).length;
  if (low < 5) bad.push(`узлов в низине ${low}`);
  // маршрут через склон: из низины на террасу, каждое ребро проходимо по опорам
  const exitNode = nav.pos[nav.nearestNode(RAW.gameplay.exit.x, 5.8, RAW.gameplay.exit.z)];
  const path = map.findPath(map.spawn, exitNode);
  if (!path || path.length < 8) bad.push(`маршрута через склон нет: ${path ? path.length : 0} узлов`);
  else {
    for (let i = 0; i + 1 < path.length; i++) {
      const why = walkEdge(map, path[i], path[i + 1]);
      if (why) bad.push(`ребро ${i} (${why.x.toFixed(1)}, ${why.z.toFixed(1)}): ${why.why}`);
    }
    const last = path[path.length - 1];
    if (last.y < 5.5) bad.push(`маршрут кончился на ${last.y.toFixed(2)} м, а терраса на 5,8`);
  }
  return {
    name: 'Навигация по склону: рёбра мельчат, граф один, маршрут из низины на террасу проходим',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${nav.pos.length} узлов, ${mid.length} вставок внутри рёбер, ${terrace} на террасе и ${low} в низине в одном множестве, маршрут ${path.length} узлов`,
  };
}

function testEveryEdgeWalkable() {
  const map = builtMap().map;
  const nav = map.nav;
  const bad = [];
  let edges = 0, maxRise = 0;
  for (let a = 0; a < nav.pos.length; a++) {
    for (const b of nav.adj[a]) {
      if (b < a) continue;
      edges++;
      maxRise = Math.max(maxRise, Math.abs(nav.pos[a].y - nav.pos[b].y));
      const why = walkEdge(map, nav.pos[a], nav.pos[b]);
      if (why) bad.push(`ребро ${a}→${b} (${why.x.toFixed(1)}, ${why.z.toFixed(1)}): ${why.why}`);
    }
  }
  return {
    name: 'Каждое ребро графа проходимо по опорам: перепад в шаге ноги, габарит свободен',
    passed: bad.length === 0 && edges > 500,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${edges} рёбер, худший перепад ${maxRise.toFixed(3)} м при шаге ${STEP} м`,
  };
}

function testDebugReliefMarks() {
  const ctx = builtMap();
  const marks = ctx.map.debugIds();
  const bad = [];
  const hills = marks.filter(m => m.text.startsWith('рельеф '));
  const pads = marks.filter(m => m.text.startsWith('площадка '));
  if (hills.length !== ctx.level.map.relief.hills.length) bad.push(`меток холмов ${hills.length} при ${ctx.level.map.relief.hills.length} капсулах`);
  if (pads.length !== ctx.level.map.relief.pads.length) bad.push(`меток площадок ${pads.length} при ${ctx.level.map.relief.pads.length}`);
  for (const m of [...hills, ...pads]) {
    const g = ctx.field.heightAt(m.x, m.z);
    if (!m.text.includes(' м')) bad.push(`метка «${m.text}» без отметки`);
    if (m.y < g) bad.push(`метка «${m.text}» под поверхностью поля (${g.toFixed(2)} м)`);
  }
  return {
    name: 'Метки id подписывают холмы и площадки их фактической отметкой',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ') : `${hills.length} меток капсул и ${pads.length} меток площадок над полем`,
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

function testPerfBudget() {
  const ctx = builtMap();
  const map = ctx.map;
  const bad = [];
  const support = bestWindow(() => {
    for (let i = 0; i < 2000; i++) {
      const x = -120 + (i * 7.13) % 240;
      const z = -120 + (i * 11.77) % 240;
      map.groundHeightAt(x, z, ctx.field.heightAt(x, z));
    }
    return 2000;
  });
  const ray = bestWindow(() => {
    for (let i = 0; i < 200; i++) {
      const x = -120 + (i * 17.3) % 240;
      const z = -120 + (i * 7.7) % 240;
      map.raySolid(x, 60, z, 0, -1, 0, 120);
    }
    return 200;
  });
  const perSupport = support.per, perRay = ray.per;
  if (perSupport > 2) bad.push(`опора ${perSupport.toFixed(2)} мкс/вызов (бюджет 2 мкс)`);
  if (perRay > 200) bad.push(`луч ${perRay.toFixed(1)} мкс/вызов (бюджет 200 мкс)`);
  return {
    name: 'Бюджет кадра: опора ≤ 2 мкс, луч ≤ 200 мкс на собранном рельефе',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ')
      : `опора ${perSupport.toFixed(3)} мкс × ${support.calls}, луч ${perRay.toFixed(1)} мкс × ${ray.calls} (машинный замер, не эталон)`,
  };
}

function testFrozenChapters() {
  const bad = [];
  const info = [];
  for (const [name, spec] of [['глава 11', LEVEL_11.map]]) {
    const map = createJsonMap(spec);
    if (map.relief !== null) bad.push(`${name}: поле рельефа построено у замороженной главы`);
    if (map.floorAt !== null) bad.push(`${name}: floorAt переопределён без секции relief`);
    if (!map.groundPlane) bad.push(`${name}: земля-плоскость пропала — лучу некуда упасть`);
    const scene = new THREE.Scene();
    map.build(scene);
    const ground = map.sceneObjects.find(o => o.isMesh && Math.abs(o.rotation.x + Math.PI / 2) < 1e-9);
    if (!ground) bad.push(`${name}: грунта нет в сцене`);
    else {
      // без секции relief грунт обязан остаться плоскостью на отметке ground.y:
      // число вершин не эталон (у глав с руслом он нарезан прямоугольниками),
      // эталон — что ни одна вершина не смещена по высоте
      const pos = ground.geometry.attributes.position;
      let lifted = 0;
      for (let k = 0; k < pos.count; k++) if (Math.abs(pos.getZ(k)) > 1e-9) lifted++;
      if (lifted) bad.push(`${name}: ${lifted} вершин грунта смещены по высоте — без relief пол мира обязан оставаться нулём`);
      info.push(`${name}: ${pos.count} вершин грунта при ${map.nav.pos.length} узлах`);
    }
    map.dispose?.();
  }
  return {
    name: 'Глава 11 не вошла в рельеф: пол — ноль, грунт — плоскость',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ') : info.join(' | '),
  };
}

export async function runReliefTerrainTests(arg) {
  const filter = parseLevelFilter(arg);
  if (filteredOut(filter, [11])) return SKIPPED;
  const tests = [
    testBrief,
    testFieldIsTheFloor,
    testPlateRidesTheField,
    testRayFindsTheField,
    testRayAlongTheSlope,
    testPictureIsTheSupport,
    testSphereOnSlope,
    testNavOverSlope,
    testEveryEdgeWalkable,
    testDebugReliefMarks,
    testPerfBudget,
    testFrozenChapters,
  ];
  const results = [];
  for (const fn of tests) {
    try { results.push(await fn()); }
    catch (e) { results.push({ name: fn.name, passed: false, info: `ошибка: ${e && e.message}` }); }
  }
  const passed = results.filter(r => r.passed).length;

  if (typeof console !== 'undefined') {
    console.group('Автотесты рельефа в движке (json2)');
    for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'} — ${r.name}: ${r.info}`);
    console.log(`Итого: ${passed}/${results.length}`);
    console.groupEnd();
  }
  return { passed, total: results.length, results };
}
