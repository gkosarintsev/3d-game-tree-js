/**
 * Автотесты главы 11 — маленького уровня v2 со всеми элементами города
 * (`docs/city-v2-plan.md`, этап 7).
 *
 * Глава проверяется как она лежит в репозитории: `LEVEL_11.js` собран парсером из
 * `level-11.json`, поэтому расхождение схемы, нормализатора и движка роняет не
 * отдельную ветку, а маршрут, опору или интерьер. Здесь сходятся все механизмы
 * v2 сразу: дом и улица под углом к северу, дуга развязки с подъёмом и креном,
 * переход между домами, русла с бродом и без, три вывода картинки.
 *
 * Запуск в браузере (через консоль страницы игры, где есть importmap):
 *   const m = await import('/tests/json2-level.test.js?v=1');
 *   await m.runJson2Tests();
 *
 * Проверяются сценарии:
 *   1. Бриф главы 11: `kind: 'json2'`, углы и дуга дошли до данных, секции
 *      картинок включены, глава зарегистрирована;
 *   2. Контракт карты закрыт полностью;
 *   3. Каркас: дома, дороги, дуги, русла, опоры и граф непустые;
 *   4. Маршрут A→B существует, проходим ногами и кончается на настиле моста;
 *   5. Каждое ребро графа держит опора, граф — одна связная сеть;
 *   6. Развязка: дуга принимает улицу у земли и вливается в мост без ступени, а
 *      мост перекрывает реку и не мешает идти под собой;
 *   7. Дуга: верх по углу и крену, опора только в секторе, луч по ленте, перила
 *      на кромке, тело самоходом поднимается и спускается;
 *   8. Косые дома: косой фасад, пустой угол габарита и кровля в своих осях, в
 *      плане дома нет узлов графа;
 *   9. Косые улицы: опора и луч в осях полотна, пустой угол габарита пуст, фонари
 *      повёрнуты вместе с улицей;
 *  10. Переход твёрдый, без опор с земли, оба торца в дверях своего этажа;
 *  11. Русла: канал переходится вброд, река без брода не пускает, опоры моста
 *      опускаются на дно;
 *  12. Интерьеры: все этажи и ходовые кровли вводимых домов достижимы от A, а
 *      наружный узел каждой наземной двери связан с улицей;
 *  13. Косые марши: каждый шов соседних проступей держит опору и связан ребром
 *      (на повороте проба опоры стоит ровно на общей грани коробок);
 *  14. Люк кровли: плита над шахтой не опора, с кровли можно сойти, подъём
 *      остаётся, и выход из шахты ведёт на пол этажа;
 *  15. Окна, мусор и неон — счётчики есть, а твёрдость, опоры и маршрут те же,
 *      что без секций;
 *  16. Метки id (`?debug=1`) покрывают объекты данных, различают дугу, угол и
 *      кровлю; миникарта печатает дугу кольцом и не падает;
 *  17. Детерминизм и бюджет сцены: узлы и солиды совпадают, NaN нет, свет — из
 *      данных и в пределах пула.
 */
import * as THREE from 'three';
import { createJsonMap } from '../src/json-map.js';
import { LEVEL_11 } from '../src/levels/level-11.js';
import { LEVELS } from '../src/levels/index.js';
import { CONFIG } from '../src/config.js';
import { parseLevelFilter, SKIPPED, filteredOut } from './level-filter.js';

const J = CONFIG.jsonMap;
const STEP = CONFIG.building.stepUp;
const PLAYER_H = CONFIG.eyeHeight + 0.35;
const DEG = Math.PI / 180;

let cached = null;

/** Глава 11 целиком: карта с построенной геометрией и сцена с картинкой. */
function chapter() {
  if (!cached) {
    const map = createJsonMap(LEVEL_11.map);
    const scene = new THREE.Scene();
    map.build(scene);
    cached = { map, scene };
  }
  return cached;
}

const map11 = () => chapter().map;

/** Точка B — на верхнем настиле моста везде, где бы ни стояла цель в брифе. */
function exitPoint(map) {
  const e = LEVEL_11.gameplay.exit;
  return { x: e.x, y: map.groundHeightAt(e.x, e.z, 500), z: e.z };
}

/**
 * Шагает по опорам от узла до узла шагом navEdgeProbe: подъём больше stepUp —
 * стена, провал глубже navEdgeDrop — пустота под ребром, задержка габарита —
 * перегородка. Тупик возвращается причиной, иначе null.
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
    if (g - feet > STEP) return { x, z, reason: `подъём ${feet.toFixed(2)}→${g.toFixed(2)} — стена` };
    if (feet - g > J.navEdgeDrop) return { x, z, reason: `провал ${feet.toFixed(2)}→${g.toFixed(2)} — пустота под ребром` };
    feet = g;
    if (map.isBlocked(x, z, CONFIG.radius, feet + 0.02, PLAYER_H)) return { x, z, reason: 'габарит задерживает' };
  }
  if (to.y - feet > STEP) return { x: to.x, z: to.z, reason: `узел ${to.y.toFixed(2)} выше опоры ${feet.toFixed(2)}` };
  return null;
}

/** Узлы графа, достижимые от точки появления (как `_pruneToSpawn` оставил их). */
function reachableFromSpawn(map) {
  const nav = map.nav;
  const start = nav.nearestNode(map.spawn.x, map.spawn.y, map.spawn.z);
  const seen = new Uint8Array(nav.pos.length);
  if (start < 0) return seen;
  const q = [start];
  seen[start] = 1;
  for (let h = 0; h < q.length; h++) for (const nb of nav.adj[q[h]]) if (!seen[nb]) { seen[nb] = 1; q.push(nb); }
  return seen;
}

/** Дуга развязки в данных модуля: центр, радиус, углы, отметки и крен. */
function arcDeck(map) {
  return map.roads.find(r => r.id === 'rd_interchange').decks.find(d => d.arc);
}

/** Точка на дуге: своя тригонометрия, без общих помощников карты. */
function arcPoint(d, deg, rho = d.R) {
  return { x: d.cx + Math.cos(deg * DEG) * rho, z: d.cz + Math.sin(deg * DEG) * rho };
}

/**
 * Доля авторского крена на угле `deg`: ноль у обоих торцов, единица в середине
 * развёртки. Переход держит уклон края полотна в `maxSlope` и делает линию стыка
 * с прямым настилом горизонталью — здесь он повторяется своей арифметикой, потому
 * что сверять ленту с той же функцией, что её рисует, значит не мерить ничего.
 */
function arcBankFrac(d, deg) {
  if (!d.bankTrans) return 1;
  const e = Math.max(0, Math.min(Math.abs(deg - d.a0), Math.abs(d.a1 - deg)));
  return e >= d.bankTrans ? 1 : (1 - Math.cos((Math.PI * e) / d.bankTrans)) / 2;
}

/** Верх полотна дуги по её константам: уклон по углу, крен по отступу от оси. */
function arcSurface(d, deg, rho = d.R) {
  return d.y0 + (d.y1 - d.y0) * (deg - d.a0) / (d.a1 - d.a0)
    + d.tanBank * arcBankFrac(d, deg) * (rho - d.R);
}

/** Косая запись карты (дом, плита): мировая точка внутри её собственных осей. */
function inObb(o, x, z, m = 1e-6) {
  const dx = x - o.cx, dz = z - o.cz;
  return Math.abs(dx * o.c + dz * o.s) <= o.hx + m && Math.abs(-dx * o.s + dz * o.c) <= o.hz + m;
}

/** Косой дом: его локальный план как OBB в мире — центр поворота общий. */
function houseObb(b, pad = 0) {
  const cx = (b.bounds.minX + b.bounds.maxX) / 2;
  const cz = (b.bounds.minZ + b.bounds.maxZ) / 2;
  const t = (b.rotation ?? 0) * DEG;
  return {
    cx, cz,
    hx: (b.bounds.maxX - b.bounds.minX) / 2 + pad,
    hz: (b.bounds.maxZ - b.bounds.minZ) / 2 + pad,
    c: Math.cos(t), s: Math.sin(t),
  };
}

/** Локальная точка повёрнутого дома в мире (обратный ход `toLocal`). */
function toWorld(b, x, z) {
  const cx = (b.bounds.minX + b.bounds.maxX) / 2;
  const cz = (b.bounds.minZ + b.bounds.maxZ) / 2;
  const t = (b.rotation ?? 0) * DEG, c = Math.cos(t), s = Math.sin(t);
  const dx = x - cx, dz = z - cz;
  return { x: cx + dx * c - dz * s, z: cz + dx * s + dz * c };
}

/** Габарит повёрнутого корпуса в мире — своей арифметикой, по локальному плану. */
function rotatedAabb(b) {
  const cx = (b.bounds.minX + b.bounds.maxX) / 2;
  const cz = (b.bounds.minZ + b.bounds.maxZ) / 2;
  const hx = (b.bounds.maxX - b.bounds.minX) / 2;
  const hz = (b.bounds.maxZ - b.bounds.minZ) / 2;
  const t = (b.rotation ?? 0) * DEG;
  const ex = hx * Math.abs(Math.cos(t)) + hz * Math.abs(Math.sin(t));
  const ez = hx * Math.abs(Math.sin(t)) + hz * Math.abs(Math.cos(t));
  return { cx, cz, minX: cx - ex, maxX: cx + ex, minZ: cz - ez, maxZ: cz + ez };
}

/** Мир → локальные оси корпуса (поворот вокруг центра габарита). */
function toLocal(b, x, z) {
  const cx = (b.bounds.minX + b.bounds.maxX) / 2;
  const cz = (b.bounds.minZ + b.bounds.maxZ) / 2;
  const t = (b.rotation ?? 0) * DEG, c = Math.cos(t), s = Math.sin(t);
  const dx = x - cx, dz = z - cz;
  return { x: cx + dx * c + dz * s, z: cz - dx * s + dz * c };
}

// ------------------------------------------------------------------ проверки

function testBrief() {
  const map = map11();
  const L = LEVEL_11.map;
  const bad = [];
  if (L.kind !== 'json2') bad.push(`kind карты ${L.kind}`);
  if (typeof map.topAt !== 'function') bad.push('карты v2 нет: topAt отсутствует');
  // элементы разрешены парсером: в модуле живут готовые пластины с углом и дуга,
  // а `elements`/`connect` остались в брифе
  if (L.roads.some(r => r.elements)) bad.push('в модуль попали неразрешённые elements');
  const yawRoads = L.roads.filter(r => r.decks.some(d => d.yaw));
  if (yawRoads.length < 2) bad.push(`улиц под углом ${yawRoads.length}`);
  const houses = L.buildings.filter(b => b.rotation);
  if (houses.length < 2) bad.push(`домов под углом ${houses.length}`);
  if (!L.buildings.some(b => b.rotation === 30)) bad.push('нет дома под 30°');
  if (!L.buildings.some(b => b.rotation === 22.5)) bad.push('нет дома под 22,5°');
  if (map.sweeps.length !== 1) bad.push(`дуг в карте ${map.sweeps.length}`);
  if (!L.windows || !L.clutter || !L.signage) bad.push('секции картинок не дошли до данных');
  if (!LEVELS.includes(LEVEL_11)) bad.push('глава 11 не зарегистрирована в LEVELS');
  // все типы дороги из инвентаря: наземная, мост, переход
  const types = new Set(L.roads.map(r => r.type));
  for (const t of ['ground', 'bridge', 'skybridge']) if (!types.has(t)) bad.push(`нет дороги типа ${t}`);
  const need = { straight: 0, spiral: 0, ladder: 0 };
  for (const b of L.buildings) for (const s of b.stairs ?? []) need[s.type] = (need[s.type] ?? 0) + 1;
  for (const [t, n] of Object.entries(need)) if (!n) bad.push(`марша ${t} нет`);
  return {
    name: 'Бриф главы 11: json2, углы домов и улиц, дуга и все три вида маршей дошли до данных',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ')
      : `${L.buildings.length} домов (${houses.length} под углом), ${L.roads.length} дорог `
        + `(${yawRoads.length} под углом, дуга ${arcDeck(map).span}°), марши straight/spiral/ladder`,
  };
}

function testContract() {
  const map = map11();
  const fields = ['width', 'depth', 'spawn', 'bounds', 'solids'];
  const methods = ['groundHeightAt', 'isBlocked', 'openPositions', 'worldToNormalized',
    'build', 'drawMinimap', 'raySolid', 'resolveSphere', 'rayHitDistance', 'findPath',
    'randomNavPoint'];
  const missing = [...fields.filter(f => map[f] === undefined),
    ...methods.filter(m => typeof map[m] !== 'function')];
  const optional = ['debugIds', 'updateStreaming'].filter(o => typeof map[o] === 'function');
  return {
    name: 'Контракт карты закрыт (движок знает только его члены)',
    passed: missing.length === 0,
    info: missing.length ? `нет членов: ${missing.join(', ')}`
      : `${fields.length + methods.length} членов на месте, опциональные: ${optional.join(', ') || 'нет'}`,
  };
}

function testBasics() {
  const map = map11();
  const L = LEVEL_11.map;
  const bad = [];
  if (map.width !== L.ground.size || map.depth !== L.ground.size) bad.push(`площадь ${map.width}×${map.depth}`);
  if (!map.solids.length) bad.push('солидов нет');
  if (!map.surfaces.length) bad.push('опор нет');
  if (!map.blockers.length) bad.push('блокеров нет');
  if (!map.nav.pos.length) bad.push('узлов нет');
  if (!map.prisms.length) bad.push('призм нет');
  if (!map.channels.length) bad.push('русел нет');
  if (!map.waterRects.length) bad.push('воды нет');
  if (map.spawn.y !== map.groundHeightAt(map.spawn.x, map.spawn.z, map.groundY)) bad.push('спавн не на опоре');
  return {
    name: 'Каркас главы: дома, дороги, дуга, призмы, русла, опоры и граф собраны',
    passed: bad.length === 0,
    info: bad.length ? bad.join('; ')
      : `${L.buildings.length} домов, ${L.roads.length} дорог, ${map.solids.length} солидов, `
        + `${map.surfaces.length} опор, ${map.blockers.length} блокеров, ${map.prisms.length} призм, `
        + `${map.nav.pos.length} узлов`,
  };
}

function testRoute() {
  const map = map11();
  const exit = exitPoint(map);
  const name = 'Маршрут A→B существует, проходим ногами и кончается на настиле моста';
  const bad = [];
  if (Math.abs(exit.y - 12) > 0.05) bad.push(`точка B на ${exit.y.toFixed(2)} м вместо настила 12`);
  const path = map.findPath(map.spawn, exit);
  if (!Array.isArray(path) || path.length < 6) {
    return { name, passed: false, info: `маршрута нет или он короче ${path ? path.length : 0} узлов` };
  }
  for (let i = 0; i + 1 < path.length; i++) {
    const f = walkEdge(map, path[i], path[i + 1]);
    if (f) { bad.push(`ребро ${i} в ${f.x.toFixed(1)}, ${f.z.toFixed(1)}: ${f.reason}`); break; }
  }
  const last = path[path.length - 1];
  const off = Math.hypot(last.x - exit.x, last.z - exit.z);
  if (off > LEVEL_11.gameplay.exitRadius) bad.push(`маршрут кончается в ${off.toFixed(1)} м от B`);
  if (Math.abs(last.y - exit.y) > 0.02) bad.push(`конец маршрута на ${last.y.toFixed(2)} м`);
  // подъём обязан быть дугой: другого пути на мост в главе нет
  const d = arcDeck(map);
  const onArc = path.filter(p => map.topAt(p.x, p.z) !== null
    && Math.abs(p.y - map.topAt(p.x, p.z)) < 0.2);
  if (onArc.length < 5) bad.push(`по дуге прошли ${onArc.length} узлов`);
  const meters = path.reduce((s, p, i) => i ? s + Math.hypot(p.x - path[i - 1].x, p.z - path[i - 1].z) : 0, 0);
  return {
    name,
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${path.length} узлов, ${Math.round(meters)} м, ${onArc.length} на дуге ${d.span.toFixed(2)}°, `
        + `конец ${last.x.toFixed(1)}, ${last.y.toFixed(2)}, ${last.z.toFixed(1)}`,
  };
}

function testGraph() {
  const map = map11();
  const nav = map.nav;
  const bad = [];
  let edges = 0;
  for (let i = 0; i < nav.pos.length; i++) {
    for (const j of nav.adj[i]) {
      if (j <= i) continue;
      edges++;
      if (!map._edgeSupported(nav.pos[i], nav.pos[j])) {
        bad.push(`ребро ${i}→${j} без опоры (${nav.pos[i].y.toFixed(2)}→${nav.pos[j].y.toFixed(2)})`);
        if (bad.length >= 3) break;
      }
    }
    if (bad.length >= 3) break;
  }
  const seen = reachableFromSpawn(map);
  const dead = seen.reduce((n, v) => n + (v ? 0 : 1), 0);
  if (dead) bad.push(`узлов вне сети из A: ${dead}`);
  const isolated = nav.adj.filter(a => !a.length).length;
  if (isolated) bad.push(`висящих без рёбер: ${isolated}`);
  return {
    name: 'Каждое ребро графа держит опора, а сам граф — одна связная сеть из точки A',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${edges} рёбер с опорой, ${nav.pos.length - dead} из ${nav.pos.length} узлов достижимы`,
  };
}

/**
 * Развязка целиком: дуга начинается у земли, заканчивается ровно на отметке
 * моста, мост идёт до съезда, а съезд возвращается на землю. Ступени в стыке
 * быть не может — нога перешагивает только 0,6 м, и машина на таком стыке
 * «прыгала» бы. Стык проверяется по `groundHeightAt` вокруг точки касания, а не
 * по константам брифа: важна опора, которую получит тело.
 */
function testInterchange() {
  const map = map11();
  const d = arcDeck(map);
  const road = map.roads.find(r => r.id === 'rd_interchange');
  const flat = road.decks.find(x => !x.arc && !x.ramp);
  const descent = road.decks.find(x => !x.arc && x.ramp);
  const bad = [];
  // конец дуги и начало моста — одна точка в плане и одна отметка
  const end = arcPoint(d, d.a1);
  const topEnd = map.groundHeightAt(end.x, end.z, 12);
  if (Math.abs(topEnd - 12) > 0.02) bad.push(`на стыке дуги и моста опора ${topEnd.toFixed(3)}`);
  for (const dx of [-0.4, 0, 0.4]) {
    const g = map.groundHeightAt(end.x + dx, end.z, 12);
    if (Math.abs(g - 12) > 0.05) bad.push(`стык ${dx > 0 ? '+' : ''}${dx}: опора ${g.toFixed(3)} — ступень`);
  }
  // мост ровный: середина и края на одной отметке
  for (const x of [flat.minX + 1, (flat.minX + flat.maxX) / 2, flat.maxX - 1]) {
    const g = map.groundHeightAt(x, (flat.minZ + flat.maxZ) / 2, 12);
    if (Math.abs(g - 12) > 0.02) bad.push(`мост x=${x.toFixed(1)}: опора ${g.toFixed(3)}`);
  }
  // съезд — одна наклонная плоскость 12 → 0,12, крутизна в пределе схемы.
  // `topAtMin/topAtMax` относятся к концам пластины в её осях, а не к сторонам
  // мирового габарита: у пластины с yaw −180 начало смотрит на восток, и без
  // пересчёта тест требовал мост там, где земля
  const run = descent.length;
  const cos = Math.cos(descent.yaw * DEG), sin = Math.sin(descent.yaw * DEG);
  const half = run / 2;
  const wMin = { x: descent.cx - half * cos, z: descent.cz - half * sin };
  const wMax = { x: descent.cx + half * cos, z: descent.cz + half * sin };
  const high = descent.topAtMin >= descent.topAtMax
    ? { p: wMin, y: descent.topAtMin } : { p: wMax, y: descent.topAtMax };
  const low = descent.topAtMin >= descent.topAtMax
    ? { p: wMax, y: descent.topAtMax } : { p: wMin, y: descent.topAtMin };
  if (Math.abs(high.y - 12) > 1e-6) bad.push(`съезд высоким концом на ${high.y} вместо моста 12`);
  if (Math.abs(low.y - 0.12) > 1e-6) bad.push(`съезд низким концом на ${low.y} вместо земли 0,12`);
  // высокий конец обязан примыкать к мосту, низкий — стоять на земле: перевёрнутый
  // уклон отрезает мост от западного района, и тот целиком уходит из графа
  if (high.p.x < flat.minX - 0.5 || high.p.x > flat.maxX + 0.5
    || high.p.z < flat.minZ - 0.5 || high.p.z > flat.maxZ + 0.5) {
    bad.push(`высокий конец съезда (${high.p.x.toFixed(1)}, ${high.p.z.toFixed(1)}) не у моста`);
  }
  const slope = Math.abs(high.y - low.y) / run;
  if (slope > J.maxSlope) bad.push(`уклон съезда ${slope.toFixed(2)} больше ${J.maxSlope}`);
  let prev = null;
  const steps = Math.ceil(run / J.navEdgeProbe);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = wMin.x + (wMax.x - wMin.x) * t;
    const z = wMin.z + (wMax.z - wMin.z) * t;
    const want = descent.topAtMin + (descent.topAtMax - descent.topAtMin) * t;
    const g = map.groundHeightAt(x, z, want + 0.2);
    if (Math.abs(g - want) > 0.05) {
      bad.push(`съезд x=${x.toFixed(1)}: ${g.toFixed(2)} вместо ${want.toFixed(2)}`);
    }
    if (prev !== null && Math.abs(prev - g) > STEP) bad.push(`съезд: перепад ${(prev - g).toFixed(2)} м за пробу`);
    prev = g;
  }
  // низ съезда стыкуется с землёй без ступени (сдвиг внутрь пластины)
  const foot = map.groundHeightAt(low.p.x + (high.p.x - low.p.x) * 0.001,
    low.p.z + (high.p.z - low.p.z) * 0.001, 0.3);
  if (Math.abs(foot - 0.12) > 0.05) bad.push(`пятка съезда на ${foot.toFixed(2)}`);
  // мост перекрывает реку: сверху бьёт настил, снизу — дно; под мостом ходят
  const river = map.channels.find(c => c.id === 'river');
  const overRiver = map.raySolid(0, 30, 62, 0, -1, 0, 40);
  if (!overRiver || Math.abs(overRiver.y - 12) > 0.05) bad.push(`луч сверху над рекой дал ${overRiver ? overRiver.y.toFixed(2) : 'ничего'}`);
  const under = map.raySolid(0, 10, 62, 0, -1, 0, 20);
  if (!under || Math.abs(under.y - river.bedY) > 0.05) bad.push(`под мостом луч дал ${under ? under.y.toFixed(2) : 'ничего'} вместо дна ${river.bedY}`);
  // под мостом вне русла: в самом русле без брода тело держит вода, и это
  // свойство данных, а не пролёта — проверяется свободная земля под настилом
  if (map.isBlocked(-30, 62, CONFIG.radius, map.groundY, CONFIG.eyeHeight)) bad.push('под мостом тело задержано');
  return {
    name: 'Развязка: дуга вливается в мост без ступени, съезд возвращает на землю, под мостом ходят',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `дуга ${d.span.toFixed(2)}° 0,12→12 м, мост ${run.toFixed(0)} м, съезд ${(slope * 1000).toFixed(0)} ‰, `
        + `луч над рекой ${overRiver.y.toFixed(1)} м, под мостом дно ${under.y.toFixed(1)} м`,
  };
}

/**
 * Дуга: верх по константам данных, опора только в секторе, луч по нарисованной
 * ленте, перила на кромке, тело самоходом проходит подъём и спуск.
 */
function testArc() {
  const map = map11();
  const d = arcDeck(map);
  const bad = [];
  // 1. верх — по углу и крену, точная формула данных
  let worst = 0;
  for (let i = 0; i <= 24; i++) {
    const deg = d.a0 + 4 + ((d.span - 8) * i) / 24;
    for (const rho of [d.R - 3, d.R, d.R + 3]) {
      const p = arcPoint(d, deg, rho);
      const got = map.topAt(p.x, p.z);
      const want = arcSurface(d, deg, rho);
      if (got === null) { bad.push(`угол ${deg.toFixed(1)}, радиус ${rho}: опоры нет`); continue; }
      worst = Math.max(worst, Math.abs(got - want));
      if (Math.abs(got - want) > 1e-9) bad.push(`угол ${deg.toFixed(1)}, радиус ${rho}: ${got.toFixed(6)} вместо ${want.toFixed(6)}`);
    }
  }
  // 2. опора только в секторе: отверстие кольца и пустой угол габарита — земля
  for (const [label, p] of [
    ['в отверстии', { x: d.cx + 8, z: d.cz + 8 }],
    ['за бортом', arcPoint(d, (d.a0 + d.a1) / 2, d.R + d.halfW + 3)],
    ['вне развёртки', arcPoint(d, d.a1 + 40, d.R)],
  ]) {
    if (map.topAt(p.x, p.z) !== null) bad.push(`${label}: topAt ответил`);
    const g = map.groundHeightAt(p.x, p.z, 500);
    if (Math.abs(g - map.groundY) > 0.05) bad.push(`${label}: опора ${g} — фантом габарита`);
  }
  // 3. луч бьёт в ту же ленту, что нарисована (хорда нарезки 5°)
  let probes = 0, rayWorst = 0;
  for (let i = 0; i < 120; i++) {
    const deg = d.a0 + 8 + ((d.span - 16) * i) / 119;
    const rho = d.R - d.halfW + 0.45 + ((d.halfW * 2 - 0.9) * ((i * 37) % 119)) / 119;
    const p = arcPoint(d, deg, rho);
    const want = arcSurface(d, deg, rho);
    if (want < 0.3) continue;
    const hit = map.raySolid(p.x, want + 5, p.z, 0, -1, 0, 12);
    if (!hit) { bad.push(`угол ${deg.toFixed(1)}: луч не попал`); continue; }
    rayWorst = Math.max(rayWorst, Math.abs(hit.y - want));
    probes++;
    if (Math.abs(hit.y - want) > 0.05) bad.push(`угол ${deg.toFixed(1)}: ${hit.y.toFixed(3)} вместо ${want.toFixed(3)}`);
  }
  if (probes < 80) bad.push(`сверено всего ${probes} проб`);
  // 4. перила бракуют кромку, но не осевую
  const mid = (d.a0 + d.a1) / 2;
  const top = arcSurface(d, mid);
  const edge = arcPoint(d, mid, d.R + d.halfW - 0.15);
  if (!map.isBlocked(edge.x, edge.z, CONFIG.radius, top, CONFIG.eyeHeight)) bad.push('перила не держат внешнюю кромку');
  const axis = arcPoint(d, mid, d.R);
  if (map.isBlocked(axis.x, axis.z, CONFIG.radius, top, CONFIG.eyeHeight)) bad.push('перила перекрыли осевую');
  // 5. тело самоходом по осевой: шаг по углу, шаг вниз, выталкивание, прижатие
  const follow = (fromDeg, dir, span) => {
    const r = CONFIG.radius, step = 0.05;
    let a = fromDeg * DEG, moved = 0, maxOff = 0, maxSurface = 0;
    const c = { x: d.cx + Math.cos(a) * d.R, y: arcSurface(d, fromDeg) + r, z: d.cz + Math.sin(a) * d.R };
    const y0 = c.y;
    while (moved < span) {
      a += (dir * step) / d.R;
      c.x = d.cx + Math.cos(a) * d.R;
      c.z = d.cz + Math.sin(a) * d.R;
      c.y -= step;
      moved += step;
      map.resolveSphere(c, r);
      const g = map.groundHeightAt(c.x, c.z, c.y);
      if (g !== null && c.y - r < g) c.y = g + r;
      maxOff = Math.max(maxOff, Math.abs(Math.hypot(c.x - d.cx, c.z - d.cz) - d.R));
      maxSurface = Math.max(maxSurface, Math.abs(c.y - (arcSurface(d, a / DEG) + r)));
    }
    return { dh: (c.y - y0) * dir, maxOff, maxSurface };
  };
  const up = follow(d.a0 + 30, 1, 16);
  const down = follow(d.a1 - 29, -1, 16);
  if (up.dh < 1) bad.push(`подъём: тело набрало ${up.dh.toFixed(2)} м`);
  if (down.dh < 1) bad.push(`спуск: тело сбросило ${down.dh.toFixed(2)} м`);
  if (Math.max(up.maxOff, down.maxOff) > 1e-6) bad.push('тело снесло с осевой');
  if (Math.max(up.maxSurface, down.maxSurface) > 0.01) bad.push('тело отошло от плоскости полотна');
  return {
    name: 'Дуга: верх по углу и крену, опора в секторе, луч по ленте, перила, самоход тела',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${worst.toExponential(1)} м расхождения верха, ${probes} проб луча (≤ ${rayWorst.toFixed(3)} м), `
        + `самоход +${up.dh.toFixed(1)} м вверх и −${down.dh.toFixed(1)} м вниз`,
  };
}

/**
 * Свободен ли коридор от точки старта до фасада: пробы тела на высоте луча
 * (1,5 м) по всей длине, кроме последних 0,3 м перед самой стеной. Так тест
 * отличает «свой фасад» от чужого объёма по пути, не зная, что это за объём.
 */
function corridorBlocked(map, from, to, run) {
  const dx = to.x - from.x, dz = to.z - from.z;
  const len = Math.hypot(dx, dz);
  if (len < 1e-6) return false;
  const ux = dx / len, uz = dz / len;
  for (let t = 0.3; t <= run; t += 0.25) {
    if (map.isBlocked(from.x + ux * t, from.z + uz * t, 0.05, 1.45, 0.1)) return true;
  }
  return false;
}

/**
 * Косые дома главы: фасад, кровля и пустой угол габарита. Корпус стоит в своих
 * осях, поэтому луч снаружи обязан упереться ровно на аналитическом расстоянии,
 * кровля — быть твёрдой над корпусом, а в углу охватывающего прямоугольника, куда
 * корпус не достаёт, не должно быть ни опоры, ни узла графа.
 */
function testRotatedHouses() {
  const map = map11();
  const bad = [];
  const checked = [];
  for (const b of map.buildings.filter(x => x.rotation)) {
    const t = b.rotation * DEG, c = Math.cos(t), s = Math.sin(t);
    const cx = (b.bounds.minX + b.bounds.maxX) / 2;
    const cz = (b.bounds.minZ + b.bounds.maxZ) / 2;
    const hx = (b.bounds.maxX - b.bounds.minX) / 2;
    const hz = (b.bounds.maxZ - b.bounds.minZ) / 2;
    // луч к каждой из четырёх граней из 15 м снаружи. Грань, к которой в этих
    // 15 м лежит чужой объём (дом, перила настила), не проверяется: луч мерил бы
    // чужую стену, а не свою, и вердикт «фасад на аналитическом расстоянии»
    // зависел бы от того, что поблизости поставили развязку
    let faces = 0;
    for (const [lx, lz, nx, nz] of [[cx + hx, cz, 1, 0], [cx, cz + hz, 0, 1],
      [cx - hx, cz, -1, 0], [cx, cz - hz, 0, -1]]) {
      const face = { x: cx + (lx - cx) * c - (lz - cz) * s, z: cz + (lx - cx) * s + (lz - cz) * c };
      const dn = { x: nx * c - nz * s, z: nx * s + nz * c };
      const from = { x: face.x + dn.x * 15, z: face.z + dn.z * 15 };
      if (map.buildings.some(o => o !== b && map._inPlan(o, from))) continue;
      if (corridorBlocked(map, from, face, 15 - J.wallThickness / 2 - 0.3)) continue;
      const hit = map.raySolid(from.x, 1.5, from.z, -dn.x, 0, -dn.z, 30);
      if (!hit) { bad.push(`${b.id}: луч к грани (${lx}, ${lz}) ничего не нашёл`); continue; }
      faces++;
      if (Math.abs(hit.dist - (15 - J.wallThickness / 2)) > 0.05) {
        bad.push(`${b.id}: стена на ${hit.dist.toFixed(2)} м вместо ${(15 - J.wallThickness / 2).toFixed(2)}`);
      }
    }
    if (faces < 2) bad.push(`${b.id}: проверено граней ${faces}`);
    // кровля: луч сверху бьёт в roofY, а не в землю
    const roof = map.raySolid(cx, 30, cz, 0, -1, 0, 40);
    if (!roof || Math.abs(roof.y - b.roofY) > 0.05) bad.push(`${b.id}: кровля ${roof ? roof.y.toFixed(2) : '—'} вместо ${b.roofY}`);
    // пустой угол габарита: снаружи корпуса, но внутри мирового AABB
    const aabb = rotatedAabb(b);
    const corner = { x: aabb.minX + 0.6, z: aabb.minZ + 0.6 };
    const lc = toLocal(b, corner.x, corner.z);
    if (Math.abs(lc.x - cx) <= hx + 0.2 && Math.abs(lc.z - cz) <= hz + 0.2) {
      bad.push(`${b.id}: точка угла попала в корпус — тест ничего не доказывает`);
    } else {
      if (map.isBlocked(corner.x, corner.z, CONFIG.radius, 0.05, PLAYER_H)) bad.push(`${b.id}: фантом в пустом углу`);
      const g = map.groundHeightAt(corner.x, corner.z, 500);
      if (Math.abs(g - map.groundY) > 0.05) bad.push(`${b.id}: опора ${g} в пустом углу`);
      const fromTop = map.raySolid(corner.x, 30, corner.z, 0, -1, 0, 40);
      if (!fromTop || Math.abs(fromTop.y - map.groundY) > 0.05) bad.push(`${b.id}: луч сверху в пустом углу дал ${fromTop ? fromTop.y.toFixed(2) : '—'}`);
    }
    // в плане корпуса нет наземных узлов УЛИЧНОЙ решётки: дом либо непроходим
    // (решётка идёт вокруг), либо вводимый — и тогда на его грунтовом уровне
    // стоят только клетки собственного пола, приподнятые на `J.floorRise`
    const obb = houseObb(b, J.wallThickness);
    const inside = map.nav.pos.filter(p => p.y < 1 && inObb(obb, p.x, p.z));
    if (!b.isEnterable) {
      if (inside.length) bad.push(`${b.id}: ${inside.length} узлов внутри плана`);
    } else {
      const street = inside.filter(p => p.y < J.floorRise / 2);
      if (street.length) bad.push(`${b.id}: ${street.length} узлов уличной решётки в плане дома`);
    }
    // метка дома стоит над его центром в мире
    const label = map.debugIds().find(l => l.text === b.id);
    if (!label || Math.hypot(label.x - cx, label.z - cz) > 0.01) bad.push(`${b.id}: метка не над центром`);
    checked.push(`${b.id} ${b.rotation}°`);
  }
  return {
    name: 'Косые дома: фасад и кровля в своих осях, пустой угол габарита без фантома',
    passed: bad.length === 0 && checked.length >= 2,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${checked.join(', ')}: фасады на аналитике, кровля, пустой угол свободен, `
        + 'уличных узлов в плане 0 (у вводимого — только свой пол)',
  };
}

/**
 * На осевую ли своего полотна смотрит голова фонаря. `rotationY` — угол
 * `Object3D.rotation.y`, голова вынесена по локальной +Z ([src/props.js:59]),
 * поэтому направление головы в плане — (sin θ, cos θ).
 */
function lampFacesRoad(lamp, road) {
  const o0 = { x: lamp.position.x, z: lamp.position.z };
  for (const d of road.decks) {
    const o = d.obb;
    if (!o) continue;
    const u = (o0.x - o.cx) * o.c + (o0.z - o.cz) * o.s;
    const v = -(o0.x - o.cx) * o.s + (o0.z - o.cz) * o.c;
    if (Math.abs(u) > d.length / 2 + 1 || Math.abs(v) > d.width / 2 + 3) continue;
    const th = lamp.rotationY * Math.PI / 180;
    const ix = v * o.s, iz = -v * o.c;
    const L = Math.hypot(ix, iz);
    return L > 1e-6 && (Math.sin(th) * ix + Math.cos(th) * iz) / L > 0.999;
  }
  return true;
}

/** Косые улицы: верх и луч живут в осях пластины, пустой угол габарита пуст. */
function testRotatedRoads() {
  const map = map11();
  const bad = [];
  const roads = map.roads.filter(r => r.decks.some(d => d.yaw));
  let lamps = 0;
  for (const road of roads) {
    for (const d of road.decks) {
      if (!d.yaw || !d.obb) continue;
      const o = d.obb;
      // `topY` наклонной пластины — её низший конец, а под серединой габарита
      // лежит середина плоскости: проба по низу требовала землю под центром моста
      const mid = (d.topAtMin + d.topAtMax) / 2;
      const center = map.groundHeightAt(o.cx, o.cz, mid);
      if (Math.abs(center - mid) > 1e-6) bad.push(`${road.id}: опора ${center} вместо ${mid}`);
      const hit = map.raySolid(o.cx, mid + 5, o.cz, 0, -1, 0, 10);
      if (!hit || Math.abs(hit.y - mid) > 1e-6) bad.push(`${road.id}: луч дал ${hit ? hit.y.toFixed(3) : '—'}`);
      // угол мира вне пластины: там опора — земля, а не полотно
      const aabb = { minX: d.minX, maxX: d.maxX, minZ: d.minZ, maxZ: d.maxZ };
      const corner = { x: aabb.minX + 0.5, z: aabb.maxZ - 0.5 };
      if (!inObb(o, corner.x, corner.z, 0)) {
        const g = map.groundHeightAt(corner.x, corner.z, 500);
        if (Math.abs(g - map.groundY) > 0.05) bad.push(`${road.id}: опора ${g} в пустом углу габарита`);
      }
      // сфера на пластине выталкивается по нормали: на наклонном полотне центр
      // отстоит от плоскости ровно на радиус, а по вертикали — на r/cos угла
      const c = { x: o.cx, y: mid + 0.2, z: o.cz };
      map.resolveSphere(c, CONFIG.radius);
      if (d.ramp) {
        const k = Math.abs(d.topAtMax - d.topAtMin) / d.length;
        const cos = 1 / Math.sqrt(1 + k * k);
        const plane = map.groundHeightAt(c.x, c.z, c.y);
        if (Math.abs((c.y - plane) * cos - CONFIG.radius) > 1e-6) {
          bad.push(`${road.id}: сфера на ${c.y.toFixed(3)}, до плоскости ${((c.y - plane) * cos).toFixed(3)}`);
        }
      } else if (Math.abs(c.y - (mid + CONFIG.radius)) > 1e-6) {
        bad.push(`${road.id}: сфера на ${c.y.toFixed(3)}`);
      }
    }
    lamps += road.lamps.length;
    // фонарь смотрит на осевую СВОЕГО полотна: голова `lamp_post` вынесена по
    // локальной +Z, поэтому её мировое направление — (sin θ, cos θ), а вектор к
    // осевой из точки (u, v) в осях пластины равен (v·s, −v·c). Прежний единый
    // `−yaw` держал голову перпендикулярно оси в однаковую сторону с обоих
    // бортов, и половина пар светила мимо асфальта.
    for (const l of road.lamps) {
      if (!lampFacesRoad(l, road)) {
        bad.push(`${l.id}: фонарь светит мимо полотна (θ=${l.rotationY})`);
      }
    }
  }
  if (roads.length < 2) bad.push(`косых улиц ${roads.length}`);
  if (!lamps) bad.push('у косых улиц нет фонарей — нечего проверять на поворот');
  for (const l of map.props.filter(p => p.source === 'road_lamp' && p.id.includes('_yaw'))) {
    if (!Number.isFinite(l.rotationY) || l.rotationY === 0) bad.push(`${l.id}: фонарь не повёрнут`);
  }
  return {
    name: 'Косые улицы: опора и луч в осях пластины, пустой угол габарита пуст, фонари повёрнуты',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${roads.length} улиц под углом, ${lamps} фонарей повёрнуты вместе с полотном`,
  };
}

/** Переход между домами: твёрдый, без опор с земли, торцы — в дверях этажа 1. */
function testSkybridge() {
  const map = map11();
  const road = map.roads.find(r => r.id === 'sb_west');
  const deck = road.decks[0];
  const bad = [];
  if (road.pillars.length) bad.push('под переходом выросли колонны');
  const pillars = map.props.filter(p => p.source === 'bridge_pillar'
    && p.position.x >= deck.minX && p.position.x <= deck.maxX
    && p.position.z >= deck.minZ && p.position.z <= deck.maxZ);
  if (pillars.length) bad.push('опора моста стоит в плане перехода');
  const onDeck = map.solids.find(s => Math.abs(s.maxY - deck.topY) < 1e-6
    && s.minX <= deck.minX + 0.1 && s.maxX >= deck.maxX - 0.1
    && s.minZ <= deck.minZ + 0.1 && s.maxZ >= deck.maxZ - 0.1);
  if (!onDeck) bad.push('настила перехода нет в солидах');
  if (Math.abs(map.groundHeightAt((deck.minX + deck.maxX) / 2, (deck.minZ + deck.maxZ) / 2, deck.topY) - deck.topY) > 1e-6) {
    bad.push('настил не держит опору');
  }
  // оба торца — в дверях своего дома на той же отметке. Точка портала вынесена
  // за фасад на 1,4 м и лежит уже над настилом, поэтому сверяется она с концом
  // пластины, а не середина двери
  const doors = map.buildings.flatMap(b => b.doors).filter(d => d.id.endsWith('→sb_west')
    && Math.abs(d.y - deck.topY) < 0.01);
  if (doors.length !== 2) bad.push(`дверей на переход ${doors.length}`);
  for (const door of doors) {
    const end = door.outside.z < (deck.minZ + deck.maxZ) / 2 ? deck.minZ : deck.maxZ;
    if (Math.abs(door.outside.z - end) > 1.4 + J.skybridgeFit + 0.05) {
      bad.push(`${door.id}: портал в ${door.outside.z.toFixed(1)}, торец ${end}`);
    }
    if (door.outside.x <= deck.minX || door.outside.x >= deck.maxX) bad.push(`${door.id}: портал мимо настила`);
    if (Math.abs(map.groundHeightAt(door.outside.x, door.outside.z, deck.topY) - deck.topY) > 1e-6) {
      bad.push(`${door.id}: под дверью нет настила`);
    }
  }
  // маршрут этаж 1 west → этаж 1 west_b идёт по настилу, а не по земле
  const ends = doors.map(d => d.outside).sort((p, q) => p.z - q.z);
  const path = ends.length === 2
    ? map.findPath({ ...ends[0], y: deck.topY }, { ...ends[1], y: deck.topY })
    : null;
  if (!Array.isArray(path)) bad.push('маршрута между домами по переходу нет');
  else {
    const on = path.filter(p => Math.abs(p.y - deck.topY) < 0.1
      && p.z > deck.minZ - 0.1 && p.z < deck.maxZ + 0.1);
    if (!on.length) bad.push('маршрут не шёл по настилу');
    // и не провалился на землю посередине
    const mid = path.filter(p => p.z > deck.minZ && p.z < deck.maxZ);
    if (mid.some(p => p.y < deck.topY - 0.5)) bad.push('маршрут спустился на землю между домами');
  }
  return {
    name: 'Переход твёрдый, без опор с земли, оба торца в дверях своего этажа, маршрут по настилу',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `настил ${deck.topY} м ${(deck.maxZ - deck.minZ).toFixed(0)} м, опор ${road.pillars.length}, `
        + `маршрут между домами ${path ? path.length : 0} узлов`,
  };
}

/** Русла главы: брод через канал, река без брода, пятки опор моста на дне. */
function testWaterways() {
  const map = map11();
  const river = map.channels.find(c => c.id === 'river');
  const canal = map.channels.find(c => c.id === 'canal');
  const bad = [];
  // канал: оба схода стоят на одном берегу, и вброд ходят от схода до схода
  // через дно — иначе канал остаётся декоративной ямой, в которую можно войти
  // и откуда не выйти
  const ramps = (canal.descents ?? []).filter(d => d.kind === 'ramp');
  const bedZ = (canal.segments[0].bed.minZ + canal.segments[0].bed.maxZ) / 2;
  const rampTop = d => ({ x: (d.v0 + d.v1) / 2, y: d.y1, z: d.u1 });
  const canalBed = ramps.length
    ? { x: (ramps[0].v0 + ramps[0].v1) / 2, y: canal.bedY, z: bedZ }
    : null;
  let wetNodes = 0;
  if (ramps.length < 2) bad.push(`сходов в канал ${ramps.length}`);
  else {
    const g = map.groundHeightAt(canalBed.x, canalBed.z, 0.2);
    if (Math.abs(g - canal.bedY) > 0.05) bad.push(`дно на ${g.toFixed(2)} вместо ${canal.bedY}`);
    for (const [label, from, to] of [['вход', rampTop(ramps[0]), canalBed], ['выход', canalBed, rampTop(ramps[1])]]) {
      const p = map.findPath(from, to);
      if (!Array.isArray(p)) { bad.push(`маршрута «${label}» в канал нет`); continue; }
      wetNodes += p.filter(q => q.y < map.groundY - 0.5).length;
      const pts = [from, ...p];
      for (let i = 0; i + 1 < pts.length; i++) {
        const f = walkEdge(map, pts[i], pts[i + 1]);
        if (f) { bad.push(`брод (${label}), ребро ${i}: ${f.reason}`); break; }
      }
    }
    if (!wetNodes) bad.push('маршрут в канал не зашёл в русло');
  }
  // река без брода: дна нет в графе, тело там задержано, вода нарисована
  const bed = river.segments[0].bed;
  const inBed = map.nav.pos.filter(p => p.y < map.groundY - 0.5
    && p.x >= bed.minX && p.x <= bed.maxX && p.z >= bed.minZ && p.z <= bed.maxZ);
  if (inBed.length) bad.push(`узлов на дне реки ${inBed.length}`);
  if (!map.isBlocked(0, 40, CONFIG.radius, river.bedY, CONFIG.eyeHeight)) bad.push('дно реки без брода проходимо');
  if (map.waterRects.length < 2) bad.push(`пластин воды ${map.waterRects.length}`);
  // пятки опор над руслом — на дне, а не на «нуле пола мира»
  const pillars = map.props.filter(p => p.source === 'bridge_pillar');
  const wetFeet = pillars.filter(p => p.position.y < map.groundY - 0.5);
  if (wetFeet.length < 2) bad.push(`опор на дне ${wetFeet.length}`);
  for (const p of wetFeet) {
    if (p.position.x < bed.minX || p.position.x > bed.maxX) bad.push(`${p.id}: опора ниже земли вне русла`);
    if (Math.abs(p.position.y - river.bedY) > 1e-3) bad.push(`${p.id}: пятка ${p.position.y} вместо дна ${river.bedY}`);
  }
  return {
    name: 'Русла: канал переходится вброд, река без брода не пускает, опоры моста стоят на дне',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${wetNodes} узлов на дне ${canal.bedY} м по сходам, за рекой без брода узлов нет, `
        + `${wetFeet.length} опор на дне ${river.bedY} м`,
  };
}

/** Интерьеры и кровли всех вводимых домов достижимы, наземные двери — на улицу. */
function testInteriors() {
  const map = map11();
  const nav = map.nav;
  const seen = reachableFromSpawn(map);
  const bad = [];
  let houses = 0, roofs = 0, rooms = 0, slant = 0;
  for (const b of map.buildings) {
    if (!b.isEnterable) continue;
    houses++;
    if (b.rotation) slant++;
    // узлы дома ищем в его СОБСТВЕННЫХ осях: для косого корпуса мировые клетки
    // пола поворачиваются, и локальный прямоугольник их не накрывает
    const obb = houseObb(b, 0.01);
    const own = [];
    for (let i = 0; i < nav.pos.length; i++) {
      const p = nav.pos[i];
      if (inObb(obb, p.x, p.z)) own.push(i);
    }
    for (const room of b.rooms) {
      rooms++;
      if (!own.some(i => Math.abs(nav.pos[i].y - room.y) < 0.35 && seen[i])) {
        bad.push(`${b.id}: этаж ${room.floor} (${room.y} м) без достижимых узлов`);
      }
    }
    if (b.roof?.walkable) {
      roofs++;
      if (!own.some(i => Math.abs(nav.pos[i].y - b.roofY) < 0.35 && seen[i])) {
        bad.push(`${b.id}: кровля ${b.roofY} м недостижима`);
      }
    }
    // наземная дверь: у наружного узла есть сосед вне плана дома (иначе дом
    // связен внутри, но отрезан от улицы)
    for (const d of b.doors.filter(x => x.y < 0.5)) {
      const out = nav.nearestNode(d.outside.x, d.y, d.outside.z);
      if (out < 0) { bad.push(`${d.id}: у наружной точки нет узла`); continue; }
      const outside = nav.adj[out].filter(i => !inObb(houseObb(b), nav.pos[i].x, nav.pos[i].z));
      if (!outside.length) bad.push(`${d.id}: наружный узел связан только с полом дома`);
    }
  }
  return {
    name: 'Интерьеры: все этажи и кровли вводимых домов достижимы от A, двери выводят на улицу',
    passed: bad.length === 0 && houses >= 3 && roofs >= 3 && slant >= 1,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${houses} вводимых домов (${slant} под углом), ${rooms} этажей, ${roofs} кровель — все в сети из A`,
  };
}

/**
 * Шов между соседними проступями повёрнутого марша. Ребро «ступень → ступень»
 * держит опора: проба идёт по мировому отрезку между центрами проступей, и его
 * середина лежит ровно на ОБЩЕЙ грани двух коробок. Обратный ход мир → свои оси
 * даёт на такой грани шум порядка 1e-14 м, и точечная проверка «в коробке» без
 * допуска выбрасывает её из обеих проступей — под ногой оказывается плита этажа
 * (провал 1,417 м глубже `J.navEdgeDrop`), ребро бракуется, и верхний этаж вместе
 * с кровлей отрезаются `_pruneToSpawn` (замер на `hy_s1`: 2 ребра из 6, при этом
 * `bodyClearLine` и подъём 0,486 м ≤ шага — всё в порядке, терялось ровно то,
 * чего не видно). У плоского марша те же швы не пропадают: там сравнение
 * инклюзивно и без шума.
 */
function testRotatedStairChain() {
  const map = map11();
  const nav = map.nav;
  const bad = [];
  let runs = 0, joined = 0;
  for (const b of map.buildings.filter(x => x.rotation && x.isEnterable)) {
    for (const s of b.stairs) {
      if (s.steps.length < 2) continue;
      runs++;
      const nodes = s.steps.map(st => {
        const w = toWorld(b, (st.minX + st.maxX) / 2, (st.minZ + st.maxZ) / 2);
        return nav.nearestNode(w.x, st.top, w.z);
      });
      for (let k = 0; k + 1 < nodes.length; k++) {
        if (nodes[k] < 0 || nodes[k + 1] < 0) { bad.push(`${s.id}: проступь ${k} потеряла узел`); continue; }
        joined++;
        if (!nav.adj[nodes[k]].includes(nodes[k + 1])) {
          bad.push(`${s.id}: шов ${k}→${k + 1} (${s.steps[k].top}→${s.steps[k + 1].top} м) без ребра`);
        }
      }
    }
  }
  return {
    name: 'Косые марши: каждый шов соседних проступей держит опору и связан ребром',
    passed: bad.length === 0 && runs >= 3,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${runs} маршей под углом, ${joined} швов прочитаны рёбрами (подъём проступей ≤ ${STEP} м)`,
  };
}

/**
 * Люк кровли односторонним делит план проступи: все пластины вертикального
 * марша лежат в одном плане, а `groundHeightAt` отвечает самую высокую опору не
 * выше feet + stepUp. Верхняя пластина заподлицо с плитой кровли — и над шахтой
 * опорой становится сам марш: с кровли не сойти (парапет не выпускает за край,
 * и кровля превращается в ловушку). Поэтому верхняя проступь останавливается на
 * подъём ниже `roofY`; проём в плите остаётся полным планом шахты.
 */
function testRoofHatch() {
  const map = map11();
  const bad = [];
  let hatches = 0;
  let lastDrop = 0, firstDrop = 0;
  for (const b of map.buildings) {
    if (!b.roof?.walkable) continue;
    for (const s of b.stairs) {
      if (s.type !== 'ladder' || s.connectsFloors[1] !== b.floorsCount) continue;
      hatches++;
      // шахта марша живёт в осях дома, а опору и тело меряют в мире: для
      // невёрнутого корпуса это один и тот же прямоугольник, для косого — нет
      const shaft = toWorld(b, (s.rect.minX + s.rect.maxX) / 2, (s.rect.minZ + s.rect.maxZ) / 2);
      const cx = shaft.x, cz = shaft.z;
      const top = s.steps[s.steps.length - 1].top;
      // 1) над шахтой плитой кровли не отвечает: опора — верхняя проступь
      const over = map.groundHeightAt(cx, cz, b.roofY);
      if (over >= b.roofY - 1e-9) bad.push(`${s.id}: над шахтой опора ${over} = кровля, проёма нет`);
      if (Math.abs(over - top) > 0.02) bad.push(`${s.id}: над шахтой ${over} вместо верхней проступи ${top}`);
      // 2) зазор между плитой и верхней проступью — в обе стороны шаг ноги:
      //    с плиты вниз в люк и с проступи вверх на плиту
      if (b.roofY - top > STEP) bad.push(`${s.id}: спуск в люк ${(b.roofY - top).toFixed(3)} м круче шага ${STEP}`);
      firstDrop = Math.max(firstDrop, b.roofY - top);
      // 3) подъём цел: цепочка от пола шагами ≤ stepUp доходит до верхней проступи
      let feet = map.groundHeightAt(cx, cz, s.y0);
      for (let guard = 0; guard < 64 && feet < top - 1e-6; guard++) {
        const next = map.groundHeightAt(cx, cz, feet);
        if (next <= feet + 1e-6) { bad.push(`${s.id}: подъём стал на ${feet}`); break; }
        if (next - feet > STEP) { bad.push(`${s.id}: подъём ${feet}→${next} круче шага ${STEP}`); break; }
        feet = next;
      }
      if (Math.abs(feet - top) > 1e-3) bad.push(`${s.id}: подъём дошёл до ${feet}, верхняя проступь ${top}`);
      // 4) сойти из шахты есть куда: под нижней пластиной пол этажа (проём
      //    режет только плиту прибытия), а телу над верхней пластиной свободно
      const base = map.groundHeightAt(cx, cz, s.y0 - 0.3);
      if (Math.abs(base - (s.y0 + J.floorRise)) > 0.02) {
        bad.push(`${s.id}: под шахтой опора ${base} вместо пола этажа ${(s.y0 + J.floorRise).toFixed(2)}`);
      }
      if (map.isBlocked(cx, cz, CONFIG.radius, top, PLAYER_H)) bad.push(`${s.id}: в люке нет места телу`);
      lastDrop = Math.max(lastDrop, top - base);
    }
  }
  return {
    name: 'Люк кровли: над шахтой плита не опора, с кровли сойти можно, подъём цел',
    passed: bad.length === 0 && hatches >= 3 && firstDrop > 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${hatches} люка: шаг с плиты в люк ${firstDrop.toFixed(3)} м, из шахты до пола этажа падение ${lastDrop.toFixed(2)} м, подъём по проступям ≤ ${STEP} м`,
  };
}

/**
 * Окна, мусор и неон — картинка: счётчики есть, а твёрдость, опоры, узлы и
 * маршрут A→B совпадают с картой без секций. Иначе визуальный шум менял бы
 * прохождение, чего правила проекта не допускают.
 */
function testPicture() {
  const withAll = map11();
  const raw = structuredClone(LEVEL_11.map);
  delete raw.windows;
  delete raw.clutter;
  delete raw.signage;
  const plain = createJsonMap(raw);
  plain.build(new THREE.Scene());
  const bad = [];
  if (!withAll.windowCount) bad.push('окон нет');
  if (!withAll.clutterCount) bad.push('мусора нет');
  if (!withAll.signageCount) bad.push('панелей нет');
  if (plain.winCfg || plain.clutterCfg || plain.signCfg) bad.push('секций нет, а настройки остались');
  if (plain.windowCount || plain.clutterCount || plain.signageCount) bad.push('без секций картинка осталась');
  if (withAll.solids.length !== plain.solids.length) bad.push(`солидов ${withAll.solids.length} против ${plain.solids.length}`);
  if (withAll.blockers.length !== plain.blockers.length) bad.push(`блокеров ${withAll.blockers.length} против ${plain.blockers.length}`);
  if (withAll.surfaces.length !== plain.surfaces.length) bad.push(`опор ${withAll.surfaces.length} против ${plain.surfaces.length}`);
  if (withAll.nav.pos.length !== plain.nav.pos.length) bad.push(`узлов ${withAll.nav.pos.length} против ${plain.nav.pos.length}`);
  const a = withAll.findPath(withAll.spawn, exitPoint(withAll));
  const b = plain.findPath(plain.spawn, exitPoint(plain));
  if (!a || !b) bad.push(`маршрут: ${a ? 'есть' : 'нет'} против ${b ? 'есть' : 'нет'}`);
  else if (a.length !== b.length || !a.every((p, i) => p.x === b[i].x && p.y === b[i].y && p.z === b[i].z)) {
    bad.push(`маршрут A→B разный: ${a.length} против ${b.length}`);
  }
  plain.dispose();
  return {
    name: 'Окна, мусор и неон — только картинка: твёрдость, опоры, граф и маршрут A→B те же',
    passed: bad.length === 0 && !!a && a.length > 10,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${withAll.windowCount} окон + ${withAll.clutterCount} предметов + ${withAll.signageCount} панелей; `
        + `солидов ${withAll.solids.length}, опор ${withAll.surfaces.length}, узлов ${withAll.nav.pos.length}, `
        + `маршрут ${a.length} шагов — совпали`,
  };
}

/** Метки id: весь объект данных, суффиксы дуги/угла/кровли, миникарта с кольцом. */
function testIdsAndMinimap() {
  const map = map11();
  const ids = map.debugIds();
  const again = map.debugIds();
  const bad = [];
  const texts = new Set(ids.map(l => l.text.split(' · ')[0]));
  const want = [];
  for (const b of map.buildings) {
    want.push(b.id);
    for (const r of b.rooms) want.push(r.id);
    for (const s of b.stairs) want.push(s.id);
    for (const d of b.doors) want.push(d.id);
  }
  for (const r of map.roads) want.push(r.id);
  for (const p of map.props) want.push(p.id);
  for (const l of map.lightSpecs) want.push(l.id);
  for (const c of map.channels) want.push(c.id);
  for (const id of want) if (!texts.has(id)) bad.push(`метки нет для «${id}»`);
  // суффиксы, по которым в мире отличают дугу, угол и кровлю
  if (!ids.some(l => l.text.startsWith('rd_interchange · дуга') && /°$/.test(l.text))) bad.push('метки дуги с развёрткой нет');
  if (!ids.some(l => l.text.includes('· yaw 30°'))) bad.push('метки улицы под 30° нет');
  if (!ids.some(l => l.text === 'b_west · кровля · ходовая')) bad.push('метки ходовой кровли нет');
  if (!ids.some(l => l.text === 'tower · кровля · ходовая')) bad.push('метки кровли башни нет');
  // точка каждой метки в границах уровня и на реальной отметке
  const bb = map.bounds;
  const low = map.channels.reduce((y, c) => Math.min(y, c.bedY), map.groundY - 1);
  for (const l of ids) {
    if (!l.text || !Number.isFinite(l.x + l.y + l.z)) bad.push(`метка «${l.text}» без текста или с негодными числами`);
    if (l.x < bb.minX || l.x > bb.maxX || l.z < bb.minZ || l.z > bb.maxZ) bad.push(`«${l.text}» вне границ`);
    if (l.y < low || l.y > 40) bad.push(`«${l.text}» на отметке ${l.y.toFixed(1)} м`);
  }
  const same = again.length === ids.length
    && again.every((l, i) => l.text === ids[i].text && l.x === ids[i].x && l.y === ids[i].y && l.z === ids[i].z);
  if (!same) bad.push('повторный вызов дал другой список');
  // миникарта: дуга — кольцевым сектором, а не габаритом
  const arcs = [];
  const proxy = new Proxy({}, {
    get: (o, key) => {
      if (key === 'arc') return (...a) => arcs.push(a);
      return o[key] ?? (() => {});
    },
    set: (o, key, v) => { o[key] = v; return true; },
  });
  const d = arcDeck(map);
  const mid = arcPoint(d, (d.a0 + d.a1) / 2);
  map.drawMinimap(proxy, 256, { x: mid.x, y: 6, z: mid.z });
  if (arcs.length < 2) bad.push(`миникарта: ctx.arc ${arcs.length} раз`);
  else if (Math.abs(arcs[0][0] - arcs[1][0]) > 1e-9 || Math.abs(arcs[0][1] - arcs[1][1]) > 1e-9) {
    bad.push('центры колец миникарты разъехались');
  }
  // canvas-прогон у точки A не падает и рисует план
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  let error = null;
  try {
    map.drawMinimap(canvas.getContext('2d'), 256, map.spawn);
  } catch (e) { error = e.message; }
  if (error) bad.push(`миникарта: ${error}`);
  return {
    name: 'Метки id покрывают объекты и различают дугу, угол и кровлю; миникарта рисует кольцо',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${ids.length} меток на ${want.length} id, дуга и угол подписаны, миникарта — ${arcs.length} ctx.arc`,
  };
}

/** Детерминизм и бюджет: два сбора совпадают, сцена без NaN, свет из данных. */
function testDeterminismAndBudget() {
  const map = map11();
  const a = createJsonMap(LEVEL_11.map);
  const b = createJsonMap(LEVEL_11.map);
  let diff = 0;
  if (a.nav.pos.length !== b.nav.pos.length) diff = Infinity;
  else {
    for (let i = 0; i < a.nav.pos.length; i++) {
      if (a.nav.pos[i].x !== b.nav.pos[i].x || a.nav.pos[i].y !== b.nav.pos[i].y
        || a.nav.pos[i].z !== b.nav.pos[i].z) diff++;
    }
  }
  const { scene } = chapter();
  let nan = 0, meshes = 0, triangles = 0, instances = 0;
  for (const o of scene.children) {
    if (!o.isMesh && !o.isInstancedMesh) continue;
    meshes++;
    const g = o.geometry;
    const arr = g.getAttribute('position').array;
    for (let i = 0; i < arr.length; i++) if (!Number.isFinite(arr[i])) nan++;
    const t = (g.index ? g.index.count : arr.length / 3) / 3;
    triangles += t;
    instances += o.isInstancedMesh ? o.count : 1;
  }
  const wantLights = map.lightSpecs.filter(l => l.type !== 'directional').length;
  const bad = [];
  if (diff) bad.push(`узлы разошлись: ${diff}`);
  if (a.solids.length !== b.solids.length) bad.push(`солиды ${a.solids.length}/${b.solids.length}`);
  if (nan) bad.push(`NaN-вершин ${nan}`);
  if (map.realLights.length !== wantLights) bad.push(`источников ${map.realLights.length} вместо ${wantLights}`);
  if (wantLights > J.maxRealLights) bad.push(`источников ${wantLights} больше пула ${J.maxRealLights}`);
  if (meshes > 40) bad.push(`мешей ${meshes}`);
  if (instances > 45000) bad.push(`экземпляров ${instances}`);
  if (triangles > 280000) bad.push(`треугольников ${triangles}`);
  a.dispose?.();
  b.dispose?.();
  return {
    name: 'Детерминизм и бюджет: узлы и солиды совпадают, NaN нет, свет из данных в пределах пула',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${a.nav.pos.length} узлов совпали, ${meshes} мешей, ${(Math.round(triangles) / 1000).toFixed(1)} тыс. треугов, `
        + `${instances} экземпляров, источников ${map.realLights.length}/${wantLights}`,
  };
}

export async function runJson2Tests(arg) {
  const filter = parseLevelFilter(arg);
  if (filteredOut(filter, [11])) return SKIPPED;
  const tests = [
    testBrief,
    testContract,
    testBasics,
    testRoute,
    testGraph,
    testInterchange,
    testArc,
    testRotatedHouses,
    testRotatedRoads,
    testSkybridge,
    testWaterways,
    testInteriors,
    testRotatedStairChain,
    testRoofHatch,
    testPicture,
    testIdsAndMinimap,
    testDeterminismAndBudget,
  ];
  const results = [];
  for (const fn of tests) {
    try { results.push(await fn()); }
    catch (e) { results.push({ name: fn.name, passed: false, info: `ошибка: ${e && e.message}` }); }
  }
  const passed = results.filter(r => r.passed).length;

  if (typeof console !== 'undefined') {
    console.group('Автотесты главы 11 (v2: углы, дуги, развязка)');
    for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'} — ${r.name}: ${r.info}`);
    console.log(`Итого: ${passed}/${results.length}`);
    console.groupEnd();
  }
  return { passed, total: results.length, results };
}