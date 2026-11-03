/**
 * Автотесты косого дома — v2 генератора города (`docs/city-v2-plan.md`, этап 2).
 *
 * Дом остаётся прямоугольником **в своих осях** (footprint, стены, комнаты,
 * шахты маршей, проёмы дверей), а в мир ставится углом вокруг центра габарита.
 * Проверяется ровно то, из-за чего это разделение и заводилось: весь расчёт
 * парсера и карты идёт в неразвёрнутых осях, а в мир выходят только границы, и
 * расойти они могут лишь в одном месте — если знак или центр поворота в
 * картинке, коллизии, опорах и навигации окажутся разными соглашениями.
 *
 * Арифметика сверки в этом файле своя (тригонометрия угла 30° в лоб, без
 * `geo2d.rotatePoint`): общее выражение не поймало бы ошибку знака, оно бы её
 * только повторяло.
 *
 * Запуск в браузере (через консоль страницы игры, где есть importmap):
 *   const m = await import('/tests/rotated-house.test.js?v=1');
 *   await m.runRotatedHouseTests();
 *
 * Проверяются сценарии:
 *   1. Бриф v2 проходит схему без ошибок и предупреждений парсера, угол доходит
 *      до данных карты, а plan проёма остаётся локальным, его точки — мировыми;
 *   2. Каркас косого дома собирается: солиды, опоры, блокеры и плиты несут
 *      `obb`, а их габарит — только фильтр (обязан накрывать коробку);
 *   3. В пустом углу габарита фантома нет: тело проходит, опоры нет, а на
 *      фасадной линии габарит держит стену;
 *   4. Луч бьёт в косой фасад на аналитическом расстоянии и отдаёт его же
 *      нормаль (8 азимутов по граням);
 *   5. Марши косого дома: каждая проступь стоит в своём плане и на своей опоре,
 *      посадки внизу и вверху есть, и марш связан;
 *   6. Кровля — опора своей отметки над корпусом, её решётка узлов жива и
 *      достижима от точки A, парапет держит идущего и бракует сход у края;
 *   7. Двери: наружный узел главной двери вне плана дома и связан с решёткой
 *      улицы, проём свободен для габарита, внутренняя дверь ведёт в соседнюю
 *      комнату;
 *   8. Окна, неон и мусор косого дома висят снаружи своих стен (рейкаст назад
 *      даёт стену, вперёд — воздух) и стоят над своими плитами;
 *   9. Метки id (`debugIds`) лежат над своими планами в МИРЕ, а не над габаритом;
 *  10. Миникарта рисует косую плиту четырёхугольником: центр кровли — чернила,
 *      пустой угол габарита — фон;
 *  11. Маршрут A→B через косой дом существует и проходим ногами на каждом ребре;
 *  12. Главы 9 и 10 не вошли в поворотную ветку: ни одной `obb`-записи и ни
 *      одного угла в их данных.
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

// --------------------------------------------------------------- бриф v2

/**
 * Компактный авторский бриф: дом 24 × 8 м под 30° с двумя комнатами первого
 * этажа, офисом на втором, маршем и люком на ходовую кровлю, улица южнее.
 * Центр габарита намеренно НЕ в начале координат (20, 12) — поворот вокруг нуля
 * не проверяет, что картинка и коллизия используют один центр.
 */
const RAW = {
  kind: 'json2',
  metadata: { levelName: 'V2SlantHouse', name: 'Косой квартал', hint: '—', units: 'meters' },
  ground: { y: 0, size: 120, color: '#23262c' },
  windows: { lit: 0.5 },
  clutter: { roof: { perHouse: 4 }, street: { every: 26 } },
  signage: { minFloors: 2, panelFloors: 1, keep: 1, width: [3.5, 6.5] },
  roads: [
    { id: 'st_main', type: 'ground', width: 8, lamps: true,
      points: [{ x: -50, y: 0.12, z: 30 }, { x: 50, y: 0.12, z: 30 }] },
  ],
  buildings: [{
    id: 'h_slant', name: 'Косой дом', isEnterable: true,
    floorsCount: 2, floorHeight: 4, rotation: 30, facadeMaterial: 'concrete',
    footprint: [{ x: 8, z: 8 }, { x: 32, z: 8 }, { x: 32, z: 16 }, { x: 8, z: 16 }],
    roof: { walkable: true, parapet: 0.9 },
    rooms: [
      { id: 'hs_lobby', floor: 0, type: 'lobby',
        polygon: [{ x: 20, z: 8 }, { x: 32, z: 8 }, { x: 32, z: 16 }, { x: 20, z: 16 }],
        connections: [
          { target: 'st_main', portalPosition: { x: 26, y: 0, z: 16 }, linkType: 'main_entrance' },
          { target: 'hs_store', portalPosition: { x: 20, y: 0, z: 10 }, linkType: 'door' },
        ] },
      { id: 'hs_store', floor: 0, type: 'warehouse',
        polygon: [{ x: 8, z: 8 }, { x: 20, z: 8 }, { x: 20, z: 16 }, { x: 8, z: 16 }] },
      { id: 'hs_office', floor: 1, type: 'office',
        polygon: [{ x: 8, z: 8 }, { x: 32, z: 8 }, { x: 32, z: 16 }, { x: 8, z: 16 }] },
    ],
    stairs: [
      { id: 'hs_stair', type: 'straight', connectsFloors: [0, 1],
        position: { x: 14, z: 12 }, rotation: 0, dimensions: { width: 4, length: 6 } },
      { id: 'hs_ladder', type: 'ladder', connectsFloors: [1, 2], position: { x: 27, z: 10 } },
    ],
  }],
  landscapeObjects: [
    { id: 'tree_1', model: 'tree', position: { x: -20, y: 0, z: 40 }, scale: { x: 1, y: 1.2, z: 1 } },
    { id: 'bench_1', model: 'bench', position: { x: 6, y: 0, z: 25.5 }, scale: { x: 1, y: 1, z: 1 } },
  ],
  lights: [
    { id: 'sun_light', type: 'directional', position: { x: 120, y: 220, z: 80 }, color: '#bcd0ff', intensity: 0.55 },
    { id: 'lobby_light', type: 'point', position: { x: 26, y: 2.9, z: 12 }, color: '#ffe6c0', intensity: 70, distance: 30 },
  ],
  sky: {
    sky: '#0b1020',
    fog: { color: '#0e1424', near: 40, far: 260 },
    hemi: { sky: '#1b2a44', ground: '#0a0d12', intensity: 0.4 },
    lights: { count: 4, reach: 55, height: 5.4, spacing: 20, intensity: 70 },
  },
  gameplay: {
    goal: 'exit', spawn: { x: 18, z: 30 }, exit: { x: 23, z: 15 }, exitRadius: 4,
    enemies: { count: 2 }, alienEnemies: { count: 1 },
  },
};

// -------------------------------------------------- независимая арифметика теста

const YAW = 30 * Math.PI / 180;
const TC = Math.cos(YAW), TS = Math.sin(YAW);
/** Центр габарита footprint из брифа — вокруг него и поворачивает v2. */
const HOUSE = { cx: 20, cz: 12, hx: 12, hz: 4 };

/** Локальная точка дома → мир (world = c + R(local − c), R = [[c,−s],[s,c]]). */
function W(x, z) {
  const dx = x - HOUSE.cx, dz = z - HOUSE.cz;
  return { x: HOUSE.cx + dx * TC - dz * TS, z: HOUSE.cz + dx * TS + dz * TC };
}

/** Мир → локальные оси дома. */
function L(x, z) {
  const dx = x - HOUSE.cx, dz = z - HOUSE.cz;
  return { x: HOUSE.cx + dx * TC + dz * TS, z: HOUSE.cz - dx * TS + dz * TC };
}

const inRect = (p, r, m = 0) => p.x >= r.minX - m && p.x <= r.maxX + m
  && p.z >= r.minZ - m && p.z <= r.maxZ + m;

/**
 * Точка на внешней грани фасада: план стены стоит серединой на линии полигона,
 * поэтому корпус в мире — это повёрнутая коробка с полуосями на половину
 * толщины стены больше footprint.
 */
const OUTER = { hx: HOUSE.hx + J.wallThickness / 2, hz: HOUSE.hz + J.wallThickness / 2 };

/**
 * Расстояние от мировой точки до поверхности внешней коробки (своя арифметика:
 * разворот в локальные оси и прямоугольный расчёт) — для сверки удара луча.
 */
function distToHouse(x, z, y, y0, y1) {
  const p = L(x, z);
  const qx = Math.max(Math.abs(p.x - HOUSE.cx) - OUTER.hx, 0);
  const qz = Math.max(Math.abs(p.z - HOUSE.cz) - OUTER.hz, 0);
  const qy = Math.max(y - y1, y0 - y, 0);
  return Math.hypot(qx, qz, qy);
}

let built = null;

/** Косой дом целиком: карта из брифа + сцена с картинкой. */
function builtMap() {
  if (!built) {
    const level = normalizeLevel(structuredClone(RAW));
    built = { level, map: createJsonMap(level.map) };
    built.scene = new THREE.Scene();
    built.map.build(built.scene);
  }
  return built.map;
}

function house(map) {
  return map.buildings.find(b => b.id === 'h_slant');
}

/** Принадлежит ли мировая точка плану записи: у косой — по её собственным осям. */
function holdsPoint(rec, x, z) {
  if (!rec.obb) return inRect({ x, z }, rec, 1e-6);
  const o = rec.obb, dx = x - o.cx, dz = z - o.cz;
  return Math.abs(dx * o.c + dz * o.s) <= o.hx + 1e-6 && Math.abs(-dx * o.s + dz * o.c) <= o.hz + 1e-6;
}

/**
 * Есть ли опора ровно на отметке `y` под мировой точкой. `groundHeightAt`
 * отвечает высшую опору в пределах шага ноги, поэтому у вертикального марша с
 * рунгами в полуметре он спрашивает следующую ступень, а не ту, где стоит нога.
 */
function hasSupportAt(map, x, z, y) {
  return map.surfaces.some(s => Math.abs(s.y - y) < 0.005 && holdsPoint(s, x, z));
}

/**
 * Узел графа у мировой точки. Искать по ключу нельзя: `_pruneToSpawn` переносит
 * выжившие узлы в новый граф без ключей, поэтому точка ищется геометрически —
 * как это делают и остальные сюиты уровня.
 */
function nodeAt(map, x, y, z, tol = 0.2) {
  const i = map.nav.nearestNode(x, y, z);
  if (i < 0) return null;
  const p = map.nav.pos[i];
  return Math.hypot(p.x - x, p.z - z) <= tol && Math.abs(p.y - y) <= 0.12 ? { i, p } : null;
}

/** Внеплановое расстояние от точки до прямоугольника (0 — внутри). */
function distToRect(p, r) {
  const dx = Math.max(r.minX - p.x, 0, p.x - r.maxX);
  const dz = Math.max(r.minZ - p.z, 0, p.z - r.maxZ);
  return Math.hypot(dx, dz);
}

/** Посадка марша: узел на плите этажа сразу за его габаритом, у данного конца. */
function landingNear(map, s, level, endIdx) {
  const pad = CONFIG.radius + 0.1;
  const cands = [];
  map.nav.pos.forEach((p, i) => {
    if (i === endIdx) return;
    if (Math.abs(p.y - (level + J.floorRise)) > J.floorRise + 0.02) return;
    const l = L(p.x, p.z);
    if (inRect(l, s.rect, -0.05)) return;
    if (distToRect(l, s.rect) > pad + 0.35) return;
    cands.push({ i, p });
  });
  // связана с проступью за один-два хода: посадка и её крайняя ступень —
  // соседи, а сосед соседа покрывает случай, когда ребро держит решётка комнаты
  for (const c of cands) {
    if (map.nav.adj[c.i].includes(endIdx)) return c;
    if (map.nav.adj[c.i].some(j => map.nav.adj[j].includes(endIdx))) return c;
  }
  return null;
}

/**
 * Шагает по опорам от узла до узла. Подъём больше stepUp — стена, провал глубже
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
  const b = level.map.buildings[0];
  const door = b.doors.find(d => d.linkType === 'main_entrance');
  const bad = [];
  if (errors.length) bad.push(`схема: ${errors.join(' | ')}`);
  if (level.warnings.length) bad.push(`предупреждения парсера: ${level.warnings.join(' | ')}`);
  if (level.map.kind !== 'json2') bad.push(`kind карты ${level.map.kind}`);
  if (b.rotation !== 30) bad.push(`угла нет в данных карты (${b.rotation})`);
  // проём остаётся в осях дома (им режут стену), а точки портала — в мире (ими
  // ставят узел графа): проверка ровно на этом разделении и держится
  const local = { minX: 8, maxX: 32, minZ: 8, maxZ: 16 };
  if (Object.keys(local).some(k => b.bounds[k] !== local[k])) bad.push(`габарит уехал из локальных осей: ${JSON.stringify(b.bounds)}`);
  const want = W(26, 17.4);
  if (!door) bad.push('главной двери нет в данных');
  else if (Math.hypot(door.outside.x - want.x, door.outside.z - want.z) > 0.002) {
    bad.push(`наружная точка двери ${JSON.stringify(door.outside)} не в мире (${want.x.toFixed(3)}, ${want.z.toFixed(3)})`);
  }
  return {
    name: 'Бриф v2 принят схемой: угол в данных, план проёма локальный, его точки мировые',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ')
      : `${b.doors.length} дверей, кровля ${b.roof.walkable}, ${level.map.props.length} автопропов, предупреждений 0`,
  };
}

function testFrameEmitted() {
  const map = builtMap();
  const bad = [];
  let obb = 0;
  // габарит обязан накрывать ВСЕ ЧЕТЫРЕ угла своей коробки, а не «полуоси по
  // осям мира»: у тонкой стены (hx=12, hz=0,175) проекция косой полуоси hx на X
  // меньше самой hx, и наивная проверка забраковала бы корректный габарит
  const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  const seen = (r) => {
    if (!r.obb) return;
    obb++;
    const o = r.obb;
    for (const [lx, lz] of corners) {
      const x = o.cx + lx * o.hx * o.c - lz * o.hz * o.s;
      const z = o.cz + lx * o.hx * o.s + lz * o.hz * o.c;
      if (x < r.minX - 1e-6 || x > r.maxX + 1e-6 || z < r.minZ - 1e-6 || z > r.maxZ + 1e-6) {
        bad.push('габарит не накрывает угол своей коробки');
      }
    }
    // поворот — всегда вокруг центра плана: габарит косой коробки центрован по
    // её же центру, и разъезд здесь значит «картинка крутится не вокруг того же
    // узла, что коллизия»
    if (Math.abs((r.minX + r.maxX) / 2 - o.cx) > 0.01 || Math.abs((r.minZ + r.maxZ) / 2 - o.cz) > 0.01) {
      bad.push('центр габарита не совпал с центром коробки');
    }
  };
  for (const s of map.solids) seen(s);
  for (const s of map.surfaces) seen(s);
  for (const w of map.blockers) seen(w);
  for (const p of map.floorPlates) seen(p);
  for (const p of map.roofPlates) seen(p);
  for (const c of map.stairCells) seen(c);
  if (!obb) bad.push('ни одна запись уровня не несет obb — косый дом не выводился');
  // косой дом обязан дать и узкую фазу, и широкого фильтра: плиты полов
  // повёрнуты, а не разложены габаритом
  const plates = map.floorPlates.filter(p => p.building === 'h_slant');
  if (!plates.every(p => p.obb)) bad.push(`плиты пола косого дома без obb (${plates.length})`);
  // (22, 12) — зал, а не шахта марша: над проёмом перекрытия плиты пола нет
  const center = W(22, 12);
  if (!map.groundHeightAt(center.x, center.z, 0)) bad.push('под центром комнат нет опоры');
  return {
    name: 'Каркас косого дома: солиды, опоры, блокеры и плиты несут свою коробку',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ')
      : `${obb} записей с obb, ${map.solids.length} солидов, ${map.surfaces.length} опор, `
        + `${map.blockers.length} блокирующих, ${map.nav.pos.length} узлов`,
  };
}

function testNoPhantom() {
  const map = builtMap();
  const bad = [];
  // пустой угол габарита: внутри охватывающего прямоугольника, снаружи корпуса.
  // Если узкая фаза мерит габаритом — здесь встанет невидимая башня
  const corners = [[8, 21], [32, 3], [8, 3], [32, 21]];
  const bounds = rotatedBoundsOfHouse();
  for (const [x, z] of corners) {
    // смысл пробы ровно в этом: клетка внутри охватывающего прямоугольника, но
    // снаружи повёрнутого корпуса — если узкая фаза мерит габаритом, здесь
    // встанет невидимая башня
    if (!inRect({ x, z }, bounds)) { bad.push(`точка (${x}, ${z}) вне габарита — тест ничего не доказывает`); continue; }
    if (distToHouse(x, z, 1, 0, 8) < 0.2) { bad.push(`точка (${x}, ${z}) внутри корпуса — тест ничего не доказывает`); continue; }
    if (map.isBlocked(x, z, CONFIG.radius, 0.05, PLAYER_H)) bad.push(`фантом в пустом углу (${x}, ${z})`);
    if (map.groundHeightAt(x, z, 0) !== map.groundY) bad.push(`опора ${map.groundHeightAt(x, z, 0)} в пустом углу (${x}, ${z})`);
  }
  // а на фасадной линии стена есть: тело в 0,1 м от грани не проходит
  for (const [lx, lz, nx, nz] of [[20, 16, 0, 1], [20, 8, 0, -1], [8, 12, -1, 0], [32, 12, 1, 0]]) {
    const p = W(lx + nx * (J.wallThickness / 2 + 0.1), lz + nz * (J.wallThickness / 2 + 0.1));
    if (!map.isBlocked(p.x, p.z, CONFIG.radius, 1, PLAYER_H)) bad.push(`габарит проходит сквозь фасад у (${lx}, ${lz})`);
  }
  return {
    name: 'Габарит косого дома — только фильтр: в пустом углу фантома нет, на фасаде стена есть',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ') : `${corners.length} пустых углов свободны и без опоры, 4 фасада держат тело`,
  };
}

/** Габарит повёрнутого корпуса в мире — своей арифметикой (тот же rotatedBounds). */
function rotatedBoundsOfHouse() {
  const ex = HOUSE.hx * Math.abs(TC) + HOUSE.hz * Math.abs(TS);
  const ez = HOUSE.hx * Math.abs(TS) + HOUSE.hz * Math.abs(TC);
  return { minX: HOUSE.cx - ex, maxX: HOUSE.cx + ex, minZ: HOUSE.cz - ez, maxZ: HOUSE.cz + ez };
}

function testRayAgainstWalls() {
  const map = builtMap();
  const bad = [];
  let checked = 0;
  const faces = [[20, 16, 0, 1], [20, 8, 0, -1], [8, 12, -1, 0], [32, 12, 1, 0]];
  for (const y of [1.5, 5.5]) {
    for (const [lx, lz, nx, nz] of faces) {
      const from = W(lx + nx * 15, lz + nz * 15);
      const dir = { x: W(lx, lz).x - from.x, z: W(lx, lz).z - from.z };
      const len = Math.hypot(dir.x, dir.z);
      const hit = map.raySolid(from.x, y, from.z, dir.x / len, 0, dir.z / len, 30);
      checked++;
      if (!hit) { bad.push(`луч к (${lx}, ${lz}) на y=${y} ничего не нашёл`); continue; }
      // нормаль грани — локальная ось, повёрнутая вместе с домом
      const wantNx = nx * TC - nz * TS, wantNz = nx * TS + nz * TC;
      // старт луча — в 15 м от ЛИНИИ полигона, а бьёт он во внешнюю грань стены,
      // стоящей серединой на этой линии: половина толщины вычитается
      const wantDist = 15 - J.wallThickness / 2;
      if (Math.abs(hit.dist - wantDist) > 0.06) {
        bad.push(`(${lx}, ${lz}) y=${y}: удар на ${hit.dist.toFixed(2)} м, ждали ${wantDist.toFixed(2)} `
          + `(${(15 - hit.dist).toFixed(2)} м до грани)`);
      }
      if (Math.hypot(hit.nx - wantNx, hit.nz - wantNz) > 0.02) {
        bad.push(`(${lx}, ${lz}) y=${y}: нормаль (${hit.nx.toFixed(2)}, ${hit.nz.toFixed(2)}) не грань дома `
          + `(${wantNx.toFixed(2)}, ${wantNz.toFixed(2)})`);
      }
      if (distToHouse(hit.x, hit.z, y, 0, 8) > 0.05) bad.push(`удач (${hit.x.toFixed(2)}, ${hit.z.toFixed(2)}) вне поверхности корпуса`);
    }
  }
  return {
    name: 'Луч бьёт в косой фасад на аналитическом расстоянии и отдаёт его же нормаль',
    passed: bad.length === 0,
    info: bad.length ? `${bad.length} из ${checked}: ${bad.slice(0, 3).join('; ')}`
      : `${checked} лучей: вход в пределах 0,06 м от грани, нормали — оси корпуса`,
  };
}

function testStairsHold() {
  const map = builtMap();
  const b = house(map);
  const bad = [];
  let treads = 0;
  for (const s of b.stairs) {
    let first = null, last = null;
    s.steps.forEach((st, k) => {
      const c = W((st.minX + st.maxX) / 2, (st.minZ + st.maxZ) / 2);
      const n = nodeAt(map, c.x, st.top, c.z);
      if (!n) { bad.push(`${s.id}: проступи ${k} нет узла в её мировом центре`); return; }
      treads++;
      if (k === 0) first = n;
      if (k === s.steps.length - 1) last = n;
      if (!hasSupportAt(map, n.p.x, n.p.z, st.top)) bad.push(`${s.id} ${k}: проступь ${st.top} не держит опору в своём центре`);
    });
    if (!first || !last) continue;
    for (const [sign, level, node] of [['низ', s.y0, first], ['верх', s.y1, last]]) {
      const land = landingNear(map, s, level, node.i);
      if (!land) { bad.push(`${s.id}: посадки (${sign}, пол на ${level}) у габарита марша нет`); continue; }
      if (map.nav.adj[land.i].length < 2) bad.push(`${s.id}: посадка ${sign} висит на ${map.nav.adj[land.i].length} ребре`);
    }
    const path = map.findPath(first.p, last.p);
    if (!path || path.length < s.steps.length) bad.push(`${s.id}: цепочка проступей не читается маршрутом`);
  }
  return {
    name: 'Марши косого дома: проступи в своих планах и на своих опорах, посадки связаны',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${treads} проступей двух маршей, по две посадки, каждая цепочка проходима`,
  };
}

function testRoofAndParapet() {
  const map = builtMap();
  const b = house(map);
  const bad = [];
  const plates = map.roofPlates.filter(p => p.building === 'h_slant');
  if (!plates.length) bad.push('ходовая кровля не отдала ни одной плиты');
  const goal = W(20, 12);
  if (Math.abs(map.groundHeightAt(goal.x, goal.z, b.roofY) - b.roofY) > 0.02) {
    bad.push(`центр кровли (${goal.x.toFixed(2)}, ${goal.z.toFixed(2)}) даёт опору ${map.groundHeightAt(goal.x, goal.z, b.roofY)}`);
  }
  const nodes = map.nav.pos.map((p, i) => ({ i, p }))
    .filter(({ p }) => Math.abs(p.y - b.roofY) <= J.floorRise + 0.02
      && b.rects.some(r => inRect(L(p.x, p.z), r, -0.05)));
  if (!nodes.length) bad.push('решётки узлов кровли нет');
  for (const n of nodes) {
    const l = L(n.p.x, n.p.z);
    if (!b.rects.some(r => inRect(l, r, 0.05))) bad.push(`узел кровли вне планов дома (${l.x.toFixed(2)}, ${l.z.toFixed(2)})`);
    if (Math.abs(map.groundHeightAt(n.p.x, n.p.z, n.p.y) - n.p.y) > 0.02) bad.push(`узел на ${n.p.y.toFixed(2)} не на своей плите`);
  }
  const from = map.spawn;
  for (const n of nodes.slice(0, 3)) {
    const path = map.findPath(from, n.p);
    if (!path) bad.push(`от точки A не дойти до узла кровли на (${n.p.x.toFixed(1)}, ${n.p.z.toFixed(1)})`);
    else if (Math.abs(path[path.length - 1].y - b.roofY) > 0.05) bad.push(`маршрут кончается на ${path[path.length - 1].y.toFixed(2)}`);
  }
  // парапет: решётка стоит на отступе `radius + толщина/2 + 0,05` от линии
  // полигона — на нём идущего держит, а ближе к грани начинается ограждение
  const inset = CONFIG.radius + J.wallThickness / 2 + 0.05;
  const inside = W(20, 16 - inset);
  const outside = W(20, 16 + CONFIG.radius);
  if (map.isBlocked(inside.x, inside.z, CONFIG.radius, b.roofY, PLAYER_H)) bad.push('парапет не оставляет места идущему на кровле');
  if (!map.isBlocked(outside.x, outside.z, CONFIG.radius, b.roofY, PLAYER_H)) bad.push('сход с края кровли не бракуется парапетом');
  return {
    name: 'Кровля косого дома — опора своей отметки, достижима, а парапет держит и бракует сход',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${plates.length} плит, ${nodes.length} узлов, три маршрута с улицы, парапет ${b.roof.parapet} м`,
  };
}

function testDoorsReachStreet() {
  const map = builtMap();
  const b = house(map);
  const bad = [];
  for (const d of b.doors) {
    const oy = map.groundHeightAt(d.outside.x, d.outside.z, d.y);
    const outNode = nodeAt(map, d.outside.x, oy, d.outside.z, 0.3);
    const inNode = nodeAt(map, d.inside.x, map.groundHeightAt(d.inside.x, d.inside.z, d.y), d.inside.z, 0.3);
    if (!outNode || !inNode) { bad.push(`${d.id}: узла порога нет (наружный ${JSON.stringify(d.outside)})`); continue; }
    const outer = L(d.outside.x, d.outside.z);
    const interior = b.rects.some(r => inRect(outer, r, 0.05));
    const exterior = d.target === 'st_main';
    if (exterior === interior) bad.push(`${d.id}: наружная точка ${interior ? 'внутри' : 'вне'} плана, а дверь ${exterior ? 'на улицу' : 'внутренняя'}`);
    if (!map.nav.adj[outNode.i].includes(inNode.i)) bad.push(`${d.id}: порог не связан с полом комнаты`);
    if (exterior) {
      const far = map.nav.adj[outNode.i].map(i => map.nav.pos[i]).filter(p => {
        const l = L(p.x, p.z);
        return !b.rects.some(r => inRect(l, r, 0.05));
      });
      if (!far.length) bad.push(`${d.id}: наружный узел не связан ни с одной точкой вне плана дома`);
    }
    // проём свободен для тела: порог — единственное место, где габарит обязан пройти
    if (!map.bodyClearLine({ x: d.inside.x, y: d.y, z: d.inside.z },
      { x: d.outside.x, y: d.y, z: d.outside.z }, CONFIG.radius, CONFIG.eyeHeight)) {
      bad.push(`${d.id}: габариту не пройти через проём`);
    }
    const path = map.findPath(map.spawn, outNode.p);
    if (!path) bad.push(`${d.id}: от точки A не дойти до наружного узла`);
  }
  return {
    name: 'Двери косого дома: наружный узел на улице, внутренняя — в соседнюю комнату, проём свободен',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ') : `${b.doors.length} дверей: пороги связаны, проёмы проходят габаритом, маршруты есть`,
  };
}

function testQuadsOutsideWalls() {
  const { map, scene } = { map: builtMap(), scene: built.scene };
  const quads = scene.children.filter(o => o.isInstancedMesh && o.userData.quad);
  if (!quads.length) return { name: 'Окна и неон косого дома висят снаружи своих стен', passed: false, info: 'квадов в сцене нет' };
  const bad = [];
  let checked = 0, windows = 0, signs = 0;
  for (const m of quads) {
    const a = m.instanceMatrix.array;
    for (let i = 0; i < m.count; i++) {
      const o = i * 16;
      // колонка 2 матрицы — нормаль квада (s, 0, c), колонка 3 — его центр
      const nx = a[o + 8], nz = a[o + 10];
      const x = a[o + 12], y = a[o + 13], z = a[o + 14];
      checked++;
      // вынос квада за грань стены — настройка ряда: окно 0,06 м, панель 0,14 м
      const off = m.userData.quad === 'windows' ? J.windows.offset : J.signage.offset;
      if (m.userData.quad === 'windows') windows++; else signs++;
      const inward = map.raySolid(x, y, z, -nx, 0, -nz, off + 0.2);
      const outward = map.raySolid(x, y, z, nx, 0, nz, 1.5);
      const why = !inward ? 'за квадом нет стены'
        : Math.abs(inward.dist - off) > 0.02 ? `стена в ${inward.dist.toFixed(2)} м за квадом, ждали ${off}`
        : outward && outward.dist < 0.5 ? `стена в ${outward.dist.toFixed(2)} м перед квадом` : null;
      if (why) bad.push(`${m.userData.quad} (${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)}): ${why}`);
    }
  }
  // мусор: каждый предмет кровли стоит над СВОЕЙ плитой, а не над габаритом
  const map2 = map, roofY = house(map2).roofY;
  let roofProps = 0;
  for (const it of map2._clutterItems()) {
    if (Math.abs(it.position.y - roofY) > 0.05) continue;
    roofProps++;
    const l = L(it.position.x, it.position.z);
    if (!house(map2).rects.some(r => inRect(l, r, 0.05))) bad.push(`проп кровли (${l.x.toFixed(2)}, ${l.z.toFixed(2)}) вне планов дома`);
    if (Math.abs(map2.groundHeightAt(it.position.x, it.position.z, roofY) - roofY) > 0.02) bad.push('проп кровли не на своей опоре');
  }
  return {
    name: 'Окна, неон и мусор косого дома висят снаружи стен и стоят над своими плитами',
    passed: checked > 20 && roofProps > 0 && bad.length === 0,
    info: bad.length ? `${bad.length}: ${bad.slice(0, 3).join('; ')}`
      : `${windows} окон + ${signs} панелей проверено рейкастом, ${roofProps} props на кровле`,
  };
}

function testDebugIdsWorld() {
  const map = builtMap();
  const ids = map.debugIds();
  const bad = [];
  const want = [
    [house(map).id, W(20, 12)],
    ['hs_lobby · эт 0', W(26, 12)],
    ['hs_store · эт 0', W(14, 12)],
    ['hs_office · эт 1', W(20, 12)],
    ['hs_stair · straight', W(14, 12)],
    ['h_slant · кровля · ходовая', W(20, 12)],
  ];
  for (const [text, p] of want) {
    const l = ids.find(x => x.text === text);
    if (!l) { bad.push(`метки «${text}» нет`); continue; }
    if (Math.hypot(l.x - p.x, l.z - p.z) > 0.01) {
      bad.push(`«${text}» в (${l.x.toFixed(2)}, ${l.z.toFixed(2)}), ждали (${p.x.toFixed(2)}, ${p.z.toFixed(2)})`);
    }
  }
  // метка дома лежит в центре поворота, поэтому её собственная проверка —
  // не смещение, а то, что она вообще есть; сдвиг несовпадения с локальными
  // осями держат метки комнат и марша выше (их центры от центра корпуса далёки)
  const doors = house(map).doors.length;
  const doorMarks = ids.filter(l => /· (door|main_entrance)$/.test(l.text)).length;
  if (doorMarks !== doors) bad.push(`меток дверей ${doorMarks}, а их ${doors}`);
  return {
    name: 'Метки id косого дома стоят над своими планами в мире (?debug=1)',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ') : `${ids.length} меток, ${doorMarks} дверных, центр дома — повёрнутый`,
  };
}

function testMinimapPolygon() {
  const map = builtMap();
  const b = house(map);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  let error = null;
  const roofPos = { x: W(20, 12).x, y: b.roofY, z: W(20, 12).z };
  try { map.drawMinimap(ctx, 256, roofPos); } catch (e) { error = e.message; }
  const px = ctx.getImageData(0, 0, 256, 256).data;
  const range = Math.min(J.minimapRange, Math.max(map.width, map.depth) / 2);
  const k = 256 / (2 * range);
  const at = (x, z) => {
    const i = Math.round((z - roofPos.z + range) * k), j = Math.round((x - roofPos.x + range) * k);
    if (i < 0 || i > 255 || j < 0 || j > 255) return null;
    const o = (i * 256 + j) * 4;
    return [px[o], px[o + 1], px[o + 2]];
  };
  const center = at(W(20, 12).x, W(20, 12).z);
  // пустой угол ГАБАРИТА в мире: мировой прямоугольник вокруг косой плиты
  // доходит сюда, а сам корпус — нет. Квадрат по габариту закрасил бы этот
  // угол светлым, и миникарта рисовала бы плиту там, где её нет
  const rb = rotatedBoundsOfHouse();
  const corner = at(rb.minX + 0.4, rb.minZ + 0.4);
  const inked = c => c && (c[0] + c[1] + c[2] > 150);
  const bad = [];
  if (error) bad.push(`исключение: ${error}`);
  if (!inked(center)) bad.push(`центр косой кровли не закрашен (${center})`);
  if (inked(corner)) bad.push(`пустой угол габарита закрашен — миникарта печатает охват (${corner})`);
  return {
    name: 'Миникарта рисует косую плиту четырёхугольником, а не его габаритом',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ') : `чернила в центре кровли, фон в пустом углу (окно ${range} м)`,
  };
}

function testRouteAtoB() {
  const map = builtMap();
  const b = house(map);
  const exit = { x: RAW.gameplay.exit.x, y: map.groundHeightAt(RAW.gameplay.exit.x, RAW.gameplay.exit.z, 500), z: RAW.gameplay.exit.z };
  const bad = [];
  if (Math.abs(exit.y - b.roofY) > 0.02) bad.push(`точка B на ${exit.y.toFixed(2)} м, а кровля на ${b.roofY}`);
  const path = map.findPath(map.spawn, exit);
  if (!path || path.length < 6) return {
    name: 'Маршрут A→B через косой дом существует и проходим ногами',
    passed: false, info: `маршрута нет или он короче марша: ${path ? path.length : 0} узлов`,
  };
  for (let i = 0; i + 1 < path.length; i++) {
    const why = walkEdge(map, path[i], path[i + 1]);
    if (why) bad.push(`ребро ${i} (${why.x.toFixed(1)}, ${why.z.toFixed(1)}): ${why.why}`);
  }
  const last = path[path.length - 1];
  if (Math.hypot(last.x - exit.x, last.z - exit.z) > RAW.gameplay.exitRadius) bad.push(`маршрут кончается в ${Math.hypot(last.x - exit.x, last.z - exit.z).toFixed(1)} м от B`);
  // и через дом: хотя бы один узел маршрута лежит внутри его плана
  const insideHouse = path.filter(p => inRect(L(p.x, p.z), b.bounds, -0.2)
    && b.rects.some(r => inRect(L(p.x, p.z), r, -0.2)));
  if (insideHouse.length < 3) bad.push(`маршрут прошёл мимо интерьера дома (${insideHouse.length} узлов)`);
  return {
    name: 'Маршрут A→B через косой дом существует и проходим ногами на каждом ребре',
    passed: bad.length === 0,
    info: bad.length ? `${bad.length}: ${bad.slice(0, 2).join('; ')}`
      : `${path.length} узлов, ${insideHouse.length} внутри дома, конец на ${last.y.toFixed(2)} м`,
  };
}

function testFrozenChapters() {
  const bad = [];
  for (const [name, spec] of [['глава 9', LEVEL_09.map], ['глава 10', LEVEL_10.map]]) {
    const map = createJsonMap(spec);
    const lists = [map.solids, map.surfaces, map.blockers, map.floorPlates, map.roofPlates, map.stairCells];
    const withObb = lists.reduce((n, l) => n + l.filter(r => r.obb).length, 0);
    const angles = map.buildings.filter(b => b.rotation).length;
    if (withObb) bad.push(`${name}: ${withObb} записей с obb при нулевых углах`);
    if (angles) bad.push(`${name}: ${angles} домов с rotation`);
    if (!map.nav.pos.length || !map.solids.length) bad.push(`${name}: карта не собралась`);
    map.dispose?.();
  }
  return {
    name: 'Главы 9 и 10 не вошли в поворотную ветку: ни одной obb-записи',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ')
      : 'обе главы собраны прежней арифметикой: frame === null ведёт каждый путь как в v1',
  };
}

export async function runRotatedHouseTests() {
  const tests = [
    testBrief,
    testFrameEmitted,
    testNoPhantom,
    testRayAgainstWalls,
    testStairsHold,
    testRoofAndParapet,
    testDoorsReachStreet,
    testQuadsOutsideWalls,
    testDebugIdsWorld,
    testMinimapPolygon,
    testRouteAtoB,
    testFrozenChapters,
  ];
  const results = [];
  for (const fn of tests) {
    try { results.push(await fn()); }
    catch (e) { results.push({ name: fn.name, passed: false, info: `ошибка: ${e && e.message}` }); }
  }
  const passed = results.filter(r => r.passed).length;

  if (typeof console !== 'undefined') {
    console.group('Автотесты косого дома (v2)');
    for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'} — ${r.name}: ${r.info}`);
    console.log(`Итого: ${passed}/${results.length}`);
    console.groupEnd();
  }
  return { passed, total: results.length, results };
}
