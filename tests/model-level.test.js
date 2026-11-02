/**
 * Автотесты карты района из GLB-макета (ModelMap, глава 3 «Ночной район»).
 *
 * Проверяют этапы A–E плана (docs/plan.md): ассет прочитан и разобран, район
 * пересчитан в метры и перецентрован, твёрдость извлечена из тех же
 * треугольников, что и картинка (сетка колонок), улица — опора, башня — стена,
 * маршрут главы существует и физически проходим ногами, меш и миникарта
 * собираются, всё детерминированно; маршевый луч и сфера тела видят ровно тот
 * же фасад и ту же крышу, что рисует меш; навигация — одна связная сеть улиц,
 * случайная точка блуждания находится и ведёт к маршруту, а враги главы стоят на
 * опоре и ходят.
 *
 * Запуск в браузере (через консоль страницы игры, где есть importmap):
 *   const m = await import('/tests/model-level.test.js?v=1');
 *   await m.runModelTests();
 *
 * Проверяются сценарии:
 *   1. Контракт карты закрыт полностью (движок знает только его члены);
 *   2. Ассет в кэше: треугольники и нормали без NaN, габарит — как у файла;
 *   3. Пешеходный масштаб и окно района: bounds = размер окна, центр — (0, 0);
 *   4. Колонки непустые: доля занятых клеток в диапазоне, верх = высота башни;
 *   5. Плита макета — опора улицы, спавн на ней и проходим;
 *   6. Стена башни держит габарит, а метр снаружи — свободен;
 *   7. Крыша даёт опору на своей высоте (туда залезает Чужой);
 *   8. Рейкаст вниз над улицей — плита, луч в башню — преграда до стены;
 *   9. Луч по колонкам = рисованный фасад (этап B: нормаль отвесная, дистанция
 *      как у картинки); крыша — на рисованной высоте; сфера у стены
 *      выталкивается наружу; клетку сверху держит грань её квадрата, снизу —
 *      картинка над центром (фантомов и ям нет);
 *  9b. Лазанье Чужого по колонкам (этап D): тело с «вперёд» и взглядом вверх
 *      переходит на стену башни, поднимается и встаёт на крышу её рисованной
 *      высоты, после перевала на крыше удерживается; без взгляда вверх (ниже
 *      climbPitch) в фасад не залазит;
 *  10. Граф улиц: узлы на опоре, рёбра держат пробу габарита;
 *  11. Маршрут от точки A до точки B существует и проходим ногами;
 *  12. Навигация главы: район одной сетью (маршрут из любой точки), случайный
 *      узел в радиусе находится и проходим, враги (2 человека + 2 Чужого) стоят
 *      на опоре, не попадают в колонку и двигаются;
 *  13. Свободные точки для объектов действительно оперты;
 *  14. Меш района собирается, вершин много, NaN нет, вызовы в бюджете;
 *  15. Миникарта рисует план и подписывает режим;
 *  16. Детерминизм: тот же ассет и окно — бит-в-бит те же колонки;
 *  17. Ночной вид района (этап E): `map.albedo` затемняет диффузию ассета,
 *      правка идемпотентна (второй сбор меша не затемняет дальше); здесь же
 *      замеряется доля материалов, несущих поверхность, — эмиссия окон по
 *      материалу этому ассету не даётся, отделка макета линии нулевой площади.
 */
import * as THREE from 'three';
import { ModelMap, columnsFromTriangles } from '../src/model-map.js';
import { preloadMapAsset, getGltfScene, trianglesFromScene } from '../src/glb.js';
import { Enemy, Enemies, AlienEnemy } from '../src/enemies.js';
import { Alien } from '../src/alien.js';
import { LEVEL_03 } from '../src/levels/level-03.js';
import { CONFIG } from '../src/config.js';

const STEP = CONFIG.building.stepUp;
const PLAYER_H = CONFIG.eyeHeight + 0.35;
/** высота тела человека-врага (приватная константа `src/enemies.js`) */
const ENEMY_H = 1.9;
const DT = 1 / 60; // фиксированный шаг физики — прогон врагов детерминирован
// запас кадров подъёма: 2400 — это 40 с по стене (6,5 м/с), хватает на башню
// максимальной высоты района (150 м) с переходом на неё с улицы
const CLIMB_FRAMES = 2400;
/** доля занятых строением клеток в районе: ниже — пустышка, выше — сплошной бетон */
const OCC_MIN = 0.2, OCC_MAX = 0.5;
/** допуск сверки луча с картинкой: в клетках — грань стены стоит где-то внутри
 *  своей клетки, а колонка отпускает её по границе, раньше рисунка */
const RAY_TOL_CELLS = 1;
/** клеток района для сверки с картинкой (занятых и свободных, на каждый вид) */
const SURFACE_CELLS = 150;

let map = null;

async function makeMap() {
  await preloadMapAsset(LEVEL_03.map);
  return new ModelMap(LEVEL_03.map);
}

async function sharedMap() {
  if (!map) {
    map = await makeMap();
    map.build(new THREE.Scene());
  }
  return map;
}

/** Точка B из определения главы, с опорой района под ней. */
function exitPoint(m) {
  const e = LEVEL_03.gameplay.exit;
  return { x: e.x, y: m.groundHeightAt(e.x, e.z, 500), z: e.z };
}

/**
 * Случайные клетки района по сиду: расхождения «твёрдости и картинки» обязаны
 * повторяться от прогона к прогону (см. AGENTS.md, детерминизм). Берём и
 * занятые, и свободные клетки: первые проверяют на фантомы, вторые — на ямы.
 */
function seededCells(m, seed, count) {
  let a = seed >>> 0;
  const rnd = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const wall = [], free = [];
  const limit = m.groundY + STEP;
  // в 10 м от края: меш там обрезан окном района, и картинка не полная
  const edge = Math.ceil(10 / m.cfg.cell);
  for (let j = edge; j < m.cells - edge; j++) {
    for (let i = edge; i < m.cells - edge; i++) {
      (m.top[j * m.cells + i] > limit ? wall : free).push([i, j]);
    }
  }
  const pick = (arr, k) => {
    const out = [];
    for (let q = 0; q < k && arr.length; q++) out.push(arr[Math.floor(rnd() * arr.length)]);
    return out;
  };
  return { wall: pick(wall, count), free: pick(free, count), wallTotal: wall.length, freeTotal: free.length };
}

/**
 * Высота картинки над клеткой — наивысшая точка граней ВНУТРИ квадрата клетки.
 * Вертикальный луч для этого не годится: фасад макета не имеет толщины, и луч,
 * попавший мимо плоскости, видит асфальт. Максимум считается по вершинам
 * пересечения прямоугольника и проекции грани (вершины грани в квадрате, углы
 * клетки в грани, точки пересечения сторон) — линейная функция плоскости
 * максимум достигает именно там. Вырожденную грань (стену-ленту) берём целиком
 * по её верху: вертикальная плоскость держит над своей осью всю высоту.
 */
function drawnCellTop(m, i, j) {
  const cell = m.cfg.cell, half = m.half;
  const x0 = -half + i * cell, x1 = x0 + cell, z0 = -half + j * cell, z1 = z0 + cell;
  const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2; // для ленты точка не важна: берём всю её высоту
  const pos = m.pos;
  const inSquare = (x, z) => x >= x0 && x <= x1 && z >= z0 && z <= z1;
  const CORNERS = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
  const EDGES = [[x0, z0, x1, z0], [x1, z0, x1, z1], [x1, z1, x0, z1], [x0, z1, x0, z0]];
  const inTri = (px, pz, ax, az, bx, bz, cx, cz) => {
    const d1 = (bx - ax) * (pz - az) - (bz - az) * (px - ax);
    const d2 = (cx - bx) * (pz - bz) - (cz - bz) * (px - bx);
    const d3 = (ax - cx) * (pz - cz) - (az - cz) * (px - cx);
    const neg = (d1 < 0) || (d2 < 0) || (d3 < 0), pos3 = (d1 > 0) || (d2 > 0) || (d3 > 0);
    return !(neg && pos3);
  };
  /** точка пересечения отрезков ab и cd или null */
  const cross = (ax, az, bx, bz, cx, cz, dx, dz) => {
    const rx = bx - ax, rz = bz - az, sx = dx - cx, sz = dz - cz;
    const den = rx * sz - rz * sx;
    if (Math.abs(den) < 1e-12) return null;
    const qx = cx - ax, qz = cz - az;
    const t = (qx * sz - qz * sx) / den, u = (qx * rz - qz * rx) / den;
    if (t < 0 || t > 1 || u < 0 || u > 1) return null;
    return [ax + t * rx, az + t * rz];
  };
  let best = m.groundY, bestTri = -1;
  for (let t = 0; t < m.triCount; t++) {
    const b = t * 9;
    const ax = pos[b], ay = pos[b + 1], az = pos[b + 2];
    const bx = pos[b + 3], by = pos[b + 4], bz = pos[b + 5];
    const cx = pos[b + 6], cy = pos[b + 7], cz = pos[b + 8];
    const maxY = Math.max(ay, by, cy);
    if (maxY <= best) continue; // дальше не интересно
    if (Math.max(ax, bx, cx) < x0 || Math.min(ax, bx, cx) > x1 ||
        Math.max(az, bz, cz) < z0 || Math.min(az, bz, cz) > z1) continue;
    const den = (bx - ax) * (cz - az) - (bz - az) * (cx - ax);
    const ribbon = Math.abs(den) < m.cfg.wallArea;
    const take = (px, pz) => {
      const y = ribbon ? maxY : ay + ((px - ax) * (cz - az) - (pz - az) * (cx - ax)) / den * (by - ay) +
        ((bx - ax) * (pz - az) - (bz - az) * (px - ax)) / den * (cy - ay);
      if (y > best) { best = y; bestTri = t; }
    };
    const meets = (ax, az, bx, bz, cx, cz) => {
      if (inSquare(ax, az) || inSquare(bx, bz) || inSquare(cx, cz)) return true;
      for (const [px, pz] of CORNERS) if (inTri(px, pz, ax, az, bx, bz, cx, cz)) return true;
      for (const [ex0, ez0, ex1, ez1] of EDGES) {
        if (cross(ax, az, bx, bz, ex0, ez0, ex1, ez1) ||
            cross(bx, bz, cx, cz, ex0, ez0, ex1, ez1) ||
            cross(cx, cz, ax, az, ex0, ez0, ex1, ez1)) return true;
      }
      return false;
    };
    if (ribbon) {
      // ленте достаточно пересечь квадрат — над осью стены стоит вся её высота
      if (meets(ax, az, bx, bz, cx, cz)) take(mx, mz);
      continue;
    }
    if (inSquare(ax, az)) take(ax, az);
    if (inSquare(bx, bz)) take(bx, bz);
    if (inSquare(cx, cz)) take(cx, cz);
    for (const [px, pz] of CORNERS) if (inTri(px, pz, ax, az, bx, bz, cx, cz)) take(px, pz);
    for (const [ex0, ez0, ex1, ez1] of EDGES) {
      const p = cross(ax, az, bx, bz, ex0, ez0, ex1, ez1);
      if (p) take(p[0], p[1]);
      const q = cross(bx, bz, cx, cz, ex0, ez0, ex1, ez1);
      if (q) take(q[0], q[1]);
      const r = cross(cx, cz, ax, az, ex0, ez0, ex1, ez1);
      if (r) take(r[0], r[1]);
    }
  }
  return { y: best, tri: bestTri };
}

/** Меш района (те же треугольники, что дали колонки) для сверки рейкастом. */
function raycastScene(m) {
  const scene = new THREE.Scene();
  m.build(scene);
  // рейкаст по картинке обязан видеть грань с любой стороны: у стен макета
  // нет толщины, и с «парниковой» стороны она осталась бы невидимой для луча
  for (const mesh of scene.children) {
    mesh.material = mesh.material.clone();
    mesh.material.side = THREE.DoubleSide;
  }
  return scene;
}

/**
 * Отрисованная высота в точке: `THREE.Raycaster` сверху вниз по видимому мешу.
 * Это независимый источник «где картинка», поэтому расхождение с колонками и
 * означает расхождение твёрдости с видом.
 */
function drawnHeight(scene, x, z, fromY) {
  const rc = new THREE.Raycaster(
    new THREE.Vector3(x, fromY, z), new THREE.Vector3(0, -1, 0), 0, fromY + 10);
  const hits = rc.intersectObjects(scene.children, true);
  return hits.length ? hits[0].point.y : null;
}

/** Клетка фасада, идущего вдоль Z вплотную к улице: слева два асфальта,
 *  справа — верх выше 40 м, и граница «свободно/стена» прямая на 5 клеток
 *  подряд. Прямой участок нужен, чтобы луч шёл перпендикулярно стене: вдоль
 *  фасада (плоскость параллельна лучу) картинка мерит соседний дом, а не стену.
 */
function wallEdge(m, wantTop = 40) {
  const limit = m.groundY + STEP;
  const hi = m.groundY + wantTop;
  const topAt = (i, j) => m.top[j * m.cells + i];
  for (let j = 3; j < m.cells - 3; j++) {
    for (let i = 3; i < m.cells - 3; i++) {
      if (topAt(i, j) <= hi) continue;
      if (topAt(i - 1, j) > limit || topAt(i - 2, j) > limit) continue;
      let straight = true;
      for (let d = -2; d <= 2; d++) {
        if (topAt(i, j + d) <= hi || topAt(i - 1, j + d) > limit) { straight = false; break; }
      }
      if (!straight) continue;
      const x = -m.half + (i - 0.5), z = -m.half + (j + 0.5);
      if (m.isBlocked(x, z, CONFIG.radius, m.groundY, PLAYER_H)) continue;
      return { x, z, faceX: -m.half + i, wallX: -m.half + (i + 0.5), top: topAt(i, j) };
    }
  }
  return null;
}

/**
 * Клетка внутри крыши: верх выше 40 м и у самой клетки, и у четырёх соседей,
 * да ещё с одинаковой отметкой — иначе это уступ или гребень, а не кровля, и
 * вертикальный луч по картинке мерит не её.
 */
function roofCell(m, wantTop = 40) {
  const hi = m.groundY + wantTop;
  const edge = Math.ceil(12 / m.cfg.cell); // у борта окна район обрезан, там крыша неполная
  const topAt = (i, j) => m.top[j * m.cells + i];
  for (let j = edge; j < m.cells - edge; j++) {
    for (let i = edge; i < m.cells - edge; i++) {
      const t = topAt(i, j);
      if (t <= hi) continue;
      const nb = [topAt(i - 1, j), topAt(i + 1, j), topAt(i, j - 1), topAt(i, j + 1)];
      if (nb.some((v) => v <= hi || Math.abs(v - t) > 0.5)) continue;
      return { x: -m.half + (i + 0.5), z: -m.half + (j + 0.5), top: t, i, j };
    }
  }
  return null;
}

/**
 * Шагает по опорным поверхностям от узла до узла шагом 0.5: подъём больше шага
 * или задержка габарита — тупик. Возвращает null, если прошли.
 */
function walkAlong(m, from, to, feet) {
  const len = Math.hypot(to.x - from.x, to.z - from.z);
  const steps = Math.max(1, Math.ceil(len / 0.5));
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const x = from.x + (to.x - from.x) * t;
    const z = from.z + (to.z - from.z) * t;
    const g = m.groundHeightAt(x, z, feet);
    if (g - feet > STEP) return { x, z, reason: `подъём ${feet.toFixed(2)}→${g.toFixed(2)} — стена` };
    feet = g;
    if (m.isBlocked(x, z, CONFIG.radius, feet + 0.02, PLAYER_H)) {
      return { x, z, reason: 'габарит задерживает' };
    }
  }
  return null;
}

function testContract() {
  const fields = ['width', 'depth', 'spawn', 'bounds', 'solids'];
  const methods = ['groundHeightAt', 'isBlocked', 'openPositions', 'worldToNormalized',
    'build', 'drawMinimap', 'raySolid', 'resolveSphere', 'rayHitDistance', 'findPath',
    'randomNavPoint'];
  const missing = [...fields.filter(f => map[f] === undefined),
    ...methods.filter(mm => typeof map[mm] !== 'function')];
  return {
    name: 'Контракт карты закрыт (движок знает только его члены)',
    passed: missing.length === 0 && Array.isArray(map.solids),
    info: missing.length ? `нет членов: ${missing.join(', ')}`
      : `${fields.length + methods.length} членов на месте, solids массив (${map.solids.length})`,
  };
}

function testAsset() {
  const scene = getGltfScene(LEVEL_03.map.asset);
  const tris = trianglesFromScene(scene);
  let nan = 0;
  for (let k = 0; k < tris.count * 9; k++) if (!Number.isFinite(tris.pos[k])) nan++;
  for (let k = 0; k < tris.count; k++) if (!(tris.nh[k] >= 0 && tris.nh[k] <= 1)) nan++;
  const extX = tris.bbox.maxX - tris.bbox.minX, extZ = tris.bbox.maxZ - tris.bbox.minZ;
  const extY = tris.bbox.maxY - tris.bbox.minY;
  const passed = tris.count > 100000 && nan === 0 && extX > 500000 && extX < 700000 &&
    extZ > 350000 && extY > 18000 && extY < 24000;
  return {
    name: 'Ассет разобран: треугольники, горизонтали нормалей и габарит файла',
    passed,
    info: `треугольников ${tris.count}, материалов ${tris.materials.length}, габарит ${Math.round(extX)}×${Math.round(extY)}×${Math.round(extZ)}, NaN ${nan}`,
  };
}

function testDistrict() {
  const w = LEVEL_03.map.window;
  const sizeOk = Math.abs(map.width - w.size) < 1e-6 && map.depth === map.width;
  const centered = Math.abs(map.bounds.minX + w.size / 2) < 1e-6 &&
    Math.abs(map.bounds.maxZ - w.size / 2) < 1e-6;
  // пешеходный масштаб: верх сетки не выше заявленной высоты башни
  const tallest = LEVEL_03.map.scaleFrom.tallestTower;
  const scaleOk = Math.abs(map.maxTop - tallest) < 0.01 && map.scale > 0;
  const [u, v] = map.worldToNormalized(0, 0);
  const passed = sizeOk && centered && scaleOk && Math.abs(u - 0.5) < 0.01 && Math.abs(v - 0.5) < 0.01;
  return {
    name: 'Район из данных: размер окна, центр в (0, 0), масштаб по башне',
    passed,
    info: `район ${map.width}×${map.depth}, масштаб ${map.scale.toExponential(3)}, верх ${map.maxTop.toFixed(1)} м (башня ${tallest} м), центр нормализован (${u.toFixed(3)}, ${v.toFixed(3)})`,
  };
}

function testColumns() {
  const share = map.occupiedCells / (map.cells * map.cells);
  const passed = map.cells === Math.round(map.size / map.cfg.cell) &&
    map.top.length === map.cells * map.cells &&
    map.triCount > 1000 && share >= OCC_MIN && share <= OCC_MAX;
  return {
    name: 'Сетка колонок непустая: район, треугольники и доля занятых клеток',
    passed,
    info: `сетка ${map.cells}×${map.cells} (клетка ${map.cfg.cell} м), треугольников района ${map.triCount}, занято ${(share * 100).toFixed(1)}% (ожидалось ${OCC_MIN * 100}–${OCC_MAX * 100}%)`,
  };
}

function testStreetSupport() {
  const s = map.spawn;
  const ground = map.groundHeightAt(s.x, s.z, map.groundY);
  const walkable = !map.isBlocked(s.x, s.z, CONFIG.radius, ground, PLAYER_H);
  const inside = Math.abs(s.x) < map.half && Math.abs(s.z) < map.half;
  // спавн стоит на улице: опора в шаг от плиты и совпадает с отметкой узла
  const passed = Math.abs(ground - s.y) < 1e-6 && ground - map.groundY <= STEP + 1e-6 &&
    walkable && inside && Math.abs(map.groundPlane.y - map.groundY) < 1e-6;
  return {
    name: 'Плита макета — опора улицы: спавн на её отметке и проходим',
    passed,
    info: `спавн (${s.x.toFixed(1)}, ${s.z.toFixed(1)}) y=${ground.toFixed(2)}, плита ${map.groundY.toFixed(2)}, свободно=${walkable}`,
  };
}

function testWallHolds() {
  const e = wallEdge(map);
  if (!e) return { name: 'Стена башни держит габарит, метр снаружи — свободен', passed: false, info: 'нет клетки улицы у стены' };
  const wallHolds = map.isBlocked(e.wallX, e.z, CONFIG.radius, map.groundY, PLAYER_H);
  const streetFree = !map.isBlocked(e.x - 1, e.z, CONFIG.radius, map.groundY, PLAYER_H);
  const passed = wallHolds && streetFree;
  return {
    name: 'Стена башни держит габарит, метр снаружи — свободен',
    passed,
    info: `фасад x=${e.faceX.toFixed(1)} (верх ${e.top.toFixed(1)} м) держит=${wallHolds}, улица (${(e.x - 1).toFixed(1)}, ${e.z.toFixed(1)}) свободна=${streetFree}`,
  };
}

function testRoofSupport() {
  const e = wallEdge(map, 40);
  if (!e) return { name: 'Крыша даёт опору на своей высоте', passed: false, info: 'нет высокой колонки' };
  const roof = map.top[map._cellIndex(e.wallX, e.z)];
  const supports = Math.abs(map.groundHeightAt(e.wallX, e.z, roof) - roof) < 1e-6;
  // со стороны плиты на крышу не влезть: это стена, а не ступенька
  const wallFromStreet = map.groundHeightAt(e.wallX, e.z, map.groundY) <= map.groundY + 1e-6;
  const passed = roof > map.groundY + 40 && supports && wallFromStreet;
  return {
    name: 'Крыша даёт опору на своей высоте, с улицы она — стена',
    passed,
    info: `крыша y=${roof.toFixed(1)}, опора с неё=${supports}, с плиты не перешагнуть=${wallFromStreet}`,
  };
}

function testRayAndHit() {  const s = map.spawn;
  const plate = map.raySolid(s.x, map.groundY + 6, s.z, 0, -1, 0, 12);
  const e = wallEdge(map);
  // луч от улицы в башню обязан упираться до её толщины, а маршевый — раньше maxDist
  const hit = e ? map.rayHitDistance(e.x, map.groundY + 1.7, e.z, 1, 0, 0, 20) : Infinity;
  const passed = !!plate && !!e && Math.abs(plate.y - map.groundY) < 1e-6 &&
    Math.abs(plate.ny - 1) < 1e-6 && hit < 20 && hit <= e.faceX - e.x + 0.6;
  return {
    name: 'Луч: над улицей — плита, в башню — преграда до фасада',
    passed,
    info: `плита y=${plate?.y.toFixed(2)} (нормаль ${plate?.ny}), дистанция до стены ${hit.toFixed(2)} м от фасада ${(e ? (e.faceX - e.x).toFixed(2) : '—')}`,
  };
}

/**
 * Этап B: маршевый луч по колонкам обязан дать тот же фасад, что и картинка,
 * и с той же нормалью — иначе Чужой встаёт «в стену», которой не видит игрок.
 *
 * Расхождение мерится directional: колонка отпускает стену по границе клетки,
 * поэтому она может стоять раньше рисунка (максимум на клетку), но никогда не
 * должна проходить сквозь нарисованную грань — это и есть запрещённый
 * невидимый зазор.
 */
function testColumnRayMatchesPicture(scene) {
  const e = wallEdge(map, 40);
  if (!e) return { name: 'Луч по колонкам = рисованный фасад', passed: false, info: 'нет прямого фасада у улицы' };
  const y = map.groundY + 1.7;
  const col = map.raySolid(e.x, y, e.z, 1, 0, 0, 60);
  const rc = new THREE.Raycaster(new THREE.Vector3(e.x, y, e.z), new THREE.Vector3(1, 0, 0), 0, 60);
  const hits = rc.intersectObjects(scene.children, true);
  if (!col || !hits.length) {
    return { name: 'Луч по колонкам = рисованный фасад', passed: false, info: `колонок ${col ? col.dist.toFixed(2) : 'нет'}, картинка ${hits.length ? hits[0].distance.toFixed(2) : 'нет'}` };
  }
  const vertical = Math.abs(col.ny) < 0.1;
  const dCol = col.x - e.x, dPic = hits[0].distance;
  const early = dPic - dCol; // насколько колонка опережает рисунок
  const within = early >= -0.05 && early <= map.cfg.cell * RAY_TOL_CELLS;
  return {
    name: 'Луч по колонкам = рисованный фасад (горизонтальная нормаль, дистанция как у картинки)',
    passed: vertical && within,
    info: `нормаль (${col.nx.toFixed(1)}, ${col.ny.toFixed(1)}, ${col.nz.toFixed(1)}), колонка ${dCol.toFixed(2)} м против картинки ${dPic.toFixed(2)}, впереди на ${early.toFixed(2)} м (допуск ${(map.cfg.cell * RAY_TOL_CELLS).toFixed(2)} м)`,
  };
}

/** Луч вниз по клетке крыши обязан кончаться на её рисованной высоте. */
function testRoofHeightMatchesPicture(scene) {
  const r = roofCell(map, 40);
  if (!r) return { name: 'Крыша на рисованной высоте', passed: false, info: 'нет кровли 5 клеток вдали от борта окна' };
  const from = map.maxTop + 20;
  const col = map.raySolid(r.x, from, r.z, 0, -1, 0, from - map.groundY + 5);
  const drawn = drawnHeight(scene, r.x, r.z, from);
  if (!col || drawn === null) {
    return { name: 'Крыша на рисованной высоте', passed: false, info: `колонок ${col ? col.y.toFixed(2) : 'нет'}, картинка ${drawn === null ? 'нет' : drawn.toFixed(2)}` };
  }
  const roofNormal = Math.abs(col.ny - 1) < 1e-6;
  // горизонтальная грань пишет в колонку высоту своей плоскости в центре клетки —
  // ровно там, куда идёт луч, поэтому расхождение должно быть долей клетки
  const agrees = Math.abs(col.y - drawn) <= map.cfg.cell;
  // опора сверяется с допуском бисекции: маршевый луч останавливается у грани
  // с точностью до доли шага, а groundHeightAt знает точную отметку колонки
  const support = Math.abs(map.groundHeightAt(r.x, r.z, col.y) - col.y) <= 0.01;
  return {
    name: 'Крыша на рисованной высоте',
    passed: roofNormal && agrees && support,
    info: `крыша колонок ${col.y.toFixed(2)} (клетка ${r.i}, ${r.j}, нормаль ${col.ny}), картинка ${drawn.toFixed(2)}, опора с неё=${support}`,
  };
}

/** Сфера тела у стены: выталкивание наружу, а не внутрь здания. */
function testSpherePushedOut() {
  const e = wallEdge(map, 40);
  if (!e) return { name: 'Сфера тела у стены выталкивается наружу', passed: false, info: 'нет башни' };
  const r = CONFIG.alien.radius;
  const c = { x: e.faceX + r * 0.5, y: map.groundY + 1, z: e.z };
  const insideBefore = map._columnAt(c.x, c.y, c.z);
  const moved = map.resolveSphere(c, r);
  // касание стены — это уже «не внутри»: тело вышло на r от грани и стоит снаружи
  const outside = !map._columnAt(c.x, c.y, c.z);
  const outward = c.x < e.faceX; // наружу = в сторону улицы (−x)
  const tangent = Math.abs(Math.abs(c.x - e.faceX) - r) < 1e-6 && Math.abs(c.y - (map.groundY + 1)) < 1e-6;
  return {
    name: 'Сфера тела у стены выталкивается наружу',
    passed: insideBefore && moved && outside && outward && tangent,
    info: `центр в стене=${insideBefore}, сдвинут=${moved}, на (${c.x.toFixed(2)}, ${c.y.toFixed(2)}, ${c.z.toFixed(2)}) снаружи=${outside}, наружу=${outward}, касание зазора ${(Math.abs(c.x - e.faceX)).toFixed(2)}/${r}`,
  };
}

/**
 * Этап D: Чужой берёт башню макета ногами, а не графом. Тело заведено телом
 * (`Alien` с клавишей «вперёд» и взглядом вверх), поэтому проверяется вся цепочка
 * механики на сетке колонок 1 м — порог `climbPitch`, переход «пол → стена»,
 * подъём в пределах `alien.stepUp` от верха колонки и перевал `_tryMantle` на
 * крышу. На коробках сгенерированных домов это уже покрыто `alien-climb.test.js`;
 * здесь тот же механизм обязан работать по колонкам, выточенным из чужого меша.
 */
function testAlienClimbsTower() {
  const name = 'Чужой залезает по стене башни макета на её крышу';
  const e = wallEdge(map, 40);
  if (!e) return { name, passed: false, info: 'нет прямого фасада у улицы' };
  const r = CONFIG.alien.radius;
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 2000);
  const body = new Alien(camera, document.createElement('canvas'), map, () => null, null);
  try {
    body.spawnAt({ x: e.x - 1, y: map.groundY, z: e.z });
    body.fwd.set(1, 0, 0);
    // выше порога лазанья, но в пределах PITCH_LIMIT движка (66°)
    body.pitch = 1.1;
    body.keys.add('KeyW');
    let wallFrames = 0, roofFrame = -1, finite = true;
    for (let f = 0; f < CLIMB_FRAMES && roofFrame < 0; f++) {
      body.update(DT);
      if (!Number.isFinite(body.pos.x + body.pos.y + body.pos.z)) { finite = false; break; }
      if (Math.abs(body.up.y) <= 0.5) wallFrames++;
      if (Math.abs(body.up.y) >= 0.9 && body.pos.y >= e.top + r - 0.05) roofFrame = f;
    }
    if (!finite || roofFrame < 0) {
      return {
        name, passed: false,
        info: finite
          ? `не влез за ${CLIMB_FRAMES} кадров: y=${body.pos.y.toFixed(2)}, нормаля (${body.up.x.toFixed(2)}, ${body.up.y.toFixed(2)}, ${body.up.z.toFixed(2)}), фасад x=${e.faceX.toFixed(1)} верх ${e.top.toFixed(1)}`
          : `NaN в позиции тела на кадре подъёма`,
      };
    }
    const roofUnder = map.top[map._cellIndex(body.pos.x, body.pos.z)];
    const standing = Math.abs(body.pos.y - (roofUnder + r)) < 0.06;
    // крыша обязана держать ровно свою отметку колонки — иначе тело висит над
    // нарисованной кровлей или проваливается под неё
    const support = map.groundHeightAt(body.pos.x, body.pos.z, roofUnder) === roofUnder;
    // перевал не должен тут же сбросить тело со стены: с зажатым «вперёд» Чужой
    // уходит вглубь строения, а не сходит с кромки назад по стене
    for (let f = 0; f < 60; f++) body.update(DT);
    const stays = Math.abs(body.up.y) > 0.9 && body.pos.y >= roofUnder - 0.1;
    const passed = wallFrames > 30 && standing && support && stays;
    return {
      name,
      passed,
      info: `фасад x=${e.faceX.toFixed(1)}, верх ${e.top.toFixed(1)}: на стене ${wallFrames} кадров, крыша на кадре ${roofFrame} (y=${body.pos.y.toFixed(2)} при колонке ${roofUnder.toFixed(2)} + ${r}), опора=${support}, держится после 60 кадров «вперёд»=${stays}`,
    };
  } finally {
    body.dispose();
  }
}

/**
 * Лазанье gated взглядом: при ровном взгляде (`pitch < climbPitch`) тело упирается
 * в фасад и остаётся на плите — иначе Чужой залезал бы на стену против воли
 * игрока, в том числе после прыжка с крыши на улицу.
 */
function testClimbNeedsLookUp() {
  const name = 'Без взгляда вверх Чужой в фасад не залазит (порог climbPitch)';
  const e = wallEdge(map, 40);
  if (!e) return { name, passed: false, info: 'нет прямого фасада у улицы' };
  const r = CONFIG.alien.radius;
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 2000);
  const body = new Alien(camera, document.createElement('canvas'), map, () => null, null);
  try {
    body.spawnAt({ x: e.x - 1, y: map.groundY, z: e.z });
    body.fwd.set(1, 0, 0);
    body.pitch = 0.1; // ниже порога climbPitch
    body.keys.add('KeyW');
    let wall = 0;
    for (let f = 0; f < 300; f++) {
      body.update(DT);
      if (Math.abs(body.up.y) <= 0.5) wall++;
    }
    const flat = Math.abs(body.up.y - 1) < 1e-6;
    const onPlate = Math.abs(body.pos.y - (map.groundY + r)) < 0.06;
    const stoppedAtFacade = body.pos.x <= e.faceX - r + 0.02;
    const passed = wall === 0 && flat && onPlate && stoppedAtFacade;
    return {
      name,
      passed,
      info: `кадров на стене ${wall} (порог ${CONFIG.alien.climbPitch}°), итог y=${body.pos.y.toFixed(2)} при плите ${map.groundY.toFixed(2)}, нормаль (${body.up.x.toFixed(2)}, ${body.up.y.toFixed(2)}), остановлен в ${(e.faceX - body.pos.x).toFixed(2)} м от фасада`,
    };
  } finally {
    body.dispose();
  }
}

/**
 * Твёрдость колонки зажата картинкой с двух сторон, и стороны эти разные:
 *
 * - сверху колонку оправдывает ЛЮБАЯ грань, чья проекция попала в клетку: если
 *   верх колонки выше наивысшей точки этих граней, в клетке стоит невидимый
 *   объём (стена-фантом);
 * - снизу опорой клетке служит то, что луч, спущенный в её центр, находит над
 *   нею. Стена-лента вертикальному лучу не видна (он параллелен её плоскости) —
 *   поэтому мерить колонку по центру нельзя, но и навес в 69 м над открытой
 *   клеткой колонку не обязан держать: единственная высота на клетку не умеет
 *   «пол сверху и воздух снизу» одновременно, и здесь она обязана держать пол.
 */
function testColumnsMatchPicture(scene) {
  const cells = seededCells(map, 20261102, SURFACE_CELLS);
  const from = map.maxTop + 20;
  let phantom = 0, worstPhantom = 0, worstPhantomAt = null, pit = 0, worstPit = 0, worstPitAt = null;
  const check = (i, j) => {
    const idx = j * map.cells + i;
    const top = map.top[idx];
    const over = drawnCellTop(map, i, j);
    const d = top - over.y;
    if (d > map.cfg.cell * 1e-3) { // колонка выше картинки — невидимый объём
      phantom++;
      if (d > worstPhantom) {
        worstPhantom = d;
        worstPhantomAt = [i, j, +top.toFixed(1), +over.y.toFixed(1), over.tri];
      }
    }
    const x = -map.half + (i + 0.5) * map.cfg.cell, z = -map.half + (j + 0.5) * map.cfg.cell;
    const under = drawnHeight(scene, x, z, from);
    const gap = under === null ? 0 : under - top; // картинка висит над опорой
    if (gap > map.cfg.cell + 0.5) {
      pit++;
      if (gap > worstPit) { worstPit = gap; worstPitAt = [i, j, +top.toFixed(1), +under.toFixed(1)]; }
    }
  };
  for (const [i, j] of cells.wall) check(i, j);
  for (const [i, j] of cells.free) check(i, j);
  const passed = phantom === 0 && pit === 0;
  return {
    name: `${SURFACE_CELLS * 2} клеток: колонку сверху держит грань клетки, снизу — картинка над центром`,
    passed,
    info: `фантомных ${phantom}, ям ${pit}` +
      (worstPhantomAt ? `; наихудший фантом ${worstPhantom.toFixed(1)} м в (${worstPhantomAt[0]}, ${worstPhantomAt[1]}): колонка ${worstPhantomAt[2]} против грани ${worstPhantomAt[3]} (t=${worstPhantomAt[4]})` : '') +
      (worstPitAt ? `; наихудшая яма ${worstPit.toFixed(1)} м в (${worstPitAt[0]}, ${worstPitAt[1]}): опора ${worstPitAt[2]} против ${worstPitAt[3]}` : '') +
      `; занятых клеток в районе ${cells.wallTotal}`,
  };
}

function testGraph() {
  let offSupport = 0, badEdge = 0, edges = 0;
  for (const p of map.nav.pos) {
    if (Math.abs(map.groundHeightAt(p.x, p.z, p.y) - p.y) > 0.02) offSupport++;
  }
  for (let a = 0; a < map.nav.pos.length; a += 37) {
    for (const b of map.nav.adj[a] || []) {
      edges++;
      if (!map.bodyClearLine(map.nav.pos[a], map.nav.pos[b])) badEdge++;
    }
  }
  const passed = map.nav.pos.length > 500 && offSupport === 0 && edges > 0 && badEdge === 0;
  return {
    name: 'Граф улиц: узлы на опоре, рёбра держат пробу габарита',
    passed,
    info: `узлов ${map.nav.pos.length}, рёбер проверено ${edges}, без опоры ${offSupport}, дефектных рёбер ${badEdge}`,
  };
}

function testPathWalkable() {
  const to = exitPoint(map);
  const path = map.findPath(map.spawn, to);
  if (!Array.isArray(path)) {
    return { name: 'Маршрут главы существует и проходим ногами', passed: false, info: `пути нет: спавн (${map.spawn.x}, ${map.spawn.z}) → точка B (${to.x}, ${to.z})` };
  }
  let feet = map.groundHeightAt(path[0].x, path[0].z, 0);
  for (let i = 1; i < path.length; i++) {
    const fail = walkAlong(map, path[i - 1], path[i], feet);
    if (fail) {
      return {
        name: 'Маршрут главы существует и проходим ногами',
        passed: false,
        info: `тупик на ребре ${i - 1}→${i} в (${fail.x.toFixed(1)}, ${fail.z.toFixed(1)}): ${fail.reason}`,
      };
    }
    feet = map.groundHeightAt(path[i].x, path[i].z, feet);
  }
  const last = path[path.length - 1];
  const passed = path.length >= 20 && Math.hypot(last.x - to.x, last.z - to.z) < map.cfg.navStep;
  return {
    name: 'Маршрут главы существует и проходим ногами',
    passed,
    info: `${path.length} узлов, финал в (${last.x.toFixed(0)}, ${last.z.toFixed(0)}) — точка B на улице, пешком без тупика`,
  };
}

/**
 * Этап C: район — одна связная сеть улиц. Дворы-карманы макета проходимы внутри
 * себя (проба габарита их не отсеивает), но маршрута наружу не имеют: враг,
 * возрождённый в кармане, стоит на месте, а точка объекта легла бы туда, куда
 * человек не дойдёт. Компоненты считаются здесь же, независимо от того, как
 * карта их отсекает, — иначе тест подтверждал бы собственную реализацию.
 */
function testOneStreetNetwork() {
  const nav = map.nav, n = nav.pos.length;
  const start = nav.nearestNode(map.spawn.x, map.spawn.y, map.spawn.z);
  const seen = new Uint8Array(n);
  const queue = [start];
  seen[start] = 1;
  for (let head = 0; head < queue.length; head++) {
    for (const b of nav.adj[queue[head]]) if (!seen[b]) { seen[b] = 1; queue.push(b); }
  }
  let unreached = 0;
  for (let i = 0; i < n; i++) if (!seen[i]) unreached++;

  const to = exitPoint(map);
  const stride = Math.max(1, Math.floor(n / 200));
  let checked = 0, noRoute = 0;
  for (let i = 0; i < n; i += stride) {
    checked += 2;
    if (!map.findPath(nav.pos[i], map.spawn)) noRoute++;
    if (!map.findPath(nav.pos[i], to)) noRoute++;
  }
  const passed = n > 5000 && unreached === 0 && noRoute === 0;
  return {
    name: 'Навигация: район одной сетью — маршрут есть из любой точки',
    passed,
    info: `узлов ${n}, достижимо из точки A ${n - unreached}, без маршрута к A/B ${noRoute} из ${checked}`,
  };
}

/**
 * Точка блуждания врага: `randomNavPoint` обязан находить узел, когда он есть
 * (в радиусе стоит сам узел-якорь), а не возвращать null из-за неудачной угадки
 * — тогда целью патруля становится собственная позиция и враг стоит на месте.
 * Выборка тоже проверяется: не задержана габаритом, опирается, в радиусе, есть
 * маршрут к точке A и это не сам якорь.
 */
function testWanderPoints() {
  const nav = map.nav, n = nav.pos.length;
  const stride = Math.max(1, Math.floor(n / 12));
  let nulls = 0, bad = 0, offSupport = 0, noRoute = 0, far = 0, sameAnchor = 0, picks = 0;
  for (let a = 0; a < n; a += stride) {
    const anchor = nav.pos[a];
    for (let t = 0; t < 25; t++) {
      const p = map.randomNavPoint(anchor.x, anchor.z, 55);
      if (!p) { nulls++; continue; }
      picks++;
      if (Math.hypot(p.x - anchor.x, p.z - anchor.z) > 55.01) far++;
      if (p.x === anchor.x && p.z === anchor.z) sameAnchor++;
      if (map.isBlocked(p.x, p.z, CONFIG.radius, p.y + 0.02, PLAYER_H)) bad++;
      if (Math.abs(map.groundHeightAt(p.x, p.z, p.y) - p.y) > 0.02) offSupport++;
      if (!map.findPath(p, map.spawn)) noRoute++;
    }
  }
  const passed = nulls === 0 && far === 0 && bad === 0 && offSupport === 0 && noRoute === 0 &&
    sameAnchor / Math.max(1, picks) < 0.05;
  return {
    name: 'Блуждание: случайный узел в радиусе находится всегда и проходим',
    passed,
    info: `выборок ${picks}, пустых ${nulls}, вне радиуса ${far}, задержанных ${bad}, ` +
      `без опоры ${offSupport}, без маршрута ${noRoute}, совпало с якорем ${(100 * sameAnchor / Math.max(1, picks)).toFixed(1)}%`,
  };
}

/**
 * Враги в районе: два человека и два Чужого стоят на опоре, не оказываются
 * внутри колонки и проходят за прогон больше метра. Люди идут по графу (точка
 * блуждания + маршрут), Чужой — телом прямо к игроку, поэтому оба вида
 * проверяются одним менеджером: и тем, и другим нужны узлы улиц, а человеку —
 * ещё и маршрут.
 */
function testEnemiesWalkTheDistrict() {
  const scene = new THREE.Scene();
  const player = {
    position: new THREE.Vector3(map.spawn.x, map.groundY + CONFIG.eyeHeight, map.spawn.z),
    feetY: map.groundY, health: CONFIG.health.max, maxHealth: CONFIG.health.max,
    dead: false, takeDamage() {},
  };
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const tracers = { spawn() {} };
  const enemies = new Enemies(scene, map, player, camera, tracers, { count: 2, alienCount: 2 });
  const start = enemies.items.map(e => ({ x: e.position.x, z: e.position.z }));

  let insideColumn = 0, nan = 0, offSupport = 0;
  for (let f = 0; f < 600; f++) {
    for (const e of enemies.items) {
      e.update(DT, player, camera, tracers);
      const alien = e instanceof AlienEnemy;
      const feet = alien ? e.position.y - CONFIG.alien.radius : e.feetY;
      if (!Number.isFinite(feet + e.position.x + e.position.z)) { nan++; continue; }
      if (map.isBlocked(e.position.x, e.position.z, e.cfg.radius, feet + 0.02, ENEMY_H)) insideColumn++;
      // опора проверяется у стоящих: в прыжке Чужой законно висит над улицей
      if ((!alien || e.grounded) &&
          Math.abs(map.groundHeightAt(e.position.x, e.position.z, feet) - feet) > 0.05) offSupport++;
    }
  }

  let still = 0, noPath = 0;
  const moves = [];
  for (let i = 0; i < enemies.items.length; i++) {
    const e = enemies.items[i];
    moves.push(+Math.hypot(e.position.x - start[i].x, e.position.z - start[i].z).toFixed(1));
    if (Math.hypot(e.position.x - start[i].x, e.position.z - start[i].z) < 1) still++;
    if (e instanceof Enemy && !e.path) noPath++;
  }
  const passed = enemies.items.length === 4 && nan === 0 && insideColumn === 0 &&
    offSupport === 0 && still === 0 && noPath === 0;
  return {
    name: 'Враги главы: стоят на опоре, не в колонках и двигаются',
    passed,
    info: `смещения за 600 кадров ${moves.join(' / ')} м, в колонке ${insideColumn} кадров, ` +
      `без опоры ${offSupport}, NaN ${nan}, человек без маршрута ${noPath}`,
  };
}

function testOpenPositions() {
  const pts = map.openPositions();
  let bad = 0, noSupport = 0;
  for (const p of pts) {
    if (map.isBlocked(p.x, p.z, CONFIG.radius, p.y + 0.02, PLAYER_H)) bad++;
    if (Math.abs(map.groundHeightAt(p.x, p.z, p.y) - p.y) > 0.02) noSupport++;
  }
  const passed = pts.length > 500 && bad === 0 && noSupport === 0;
  return {
    name: 'Свободные точки для объектов: не задержаны габаритом и опираются',
    passed,
    info: `точек ${pts.length}, задержанных ${bad}, без опоры ${noSupport}`,
  };
}

async function testMesh() {
  const fresh = await makeMap();
  const scene = new THREE.Scene();
  fresh.build(scene);
  let verts = 0, bad = 0, meshes = 0;
  scene.traverse(o => {
    const p = o.geometry?.attributes?.position;
    if (!p) return;
    meshes++;
    verts += p.count;
    for (let k = 0; k < p.count * 3; k++) if (!Number.isFinite(p.array[k])) bad++;
  });
  const budget = verts / 3 <= fresh.triCount + 1;
  const passed = meshes >= 4 && meshes <= 40 && bad === 0 && verts > 50000 && budget;
  return {
    name: 'Меш района собирается: вызовы в бюджете, вершины конечны',
    passed,
    info: `${meshes} меш(ей) (было ${fresh.triCount} треугольников района), ${verts} вершин, NaN ${bad}`,
  };
}

function testMinimap() {
  const calls = { rect: 0, text: '' };
  const ctx = {
    fillStyle: '', font: '', textAlign: '', textBaseline: '',
    fillRect: () => { calls.rect++; },
    fillText: (t) => { calls.text = t; },
  };
  map.drawMinimap(ctx, 256, { x: map.spawn.x, y: map.groundY, z: map.spawn.z });
  const streetLabel = calls.text === 'Улица';
  calls.rect = 0;
  map.drawMinimap(ctx, 256, { x: map.spawn.x, y: map.maxTop, z: map.spawn.z });
  const roofLabel = calls.text === 'Крыша';
  const passed = streetLabel && roofLabel && calls.rect > 200 && map.minimapBlocks.length > 100;
  return {
    name: 'Миникарта: план района, подписи «Улица» и «Крыша»',
    passed,
    info: `блоков плана ${map.minimapBlocks.length / 4}, клеток за прогон ${calls.rect}, подписи «${streetLabel ? 'Улица' : '?'}»/«${roofLabel ? 'Крыша' : '?'}»`,
  };
}

/**
 * Ночной вид района (этап E) собирается из данных главы: `map.albedo` затемняет
 * диффузию материалов ассета. Правка обязана быть идемпотентной — материалы
 * лежат в кэше GLTF и переживают повторные сборы меша, поэтому вторичный
 * `build` не имеет права затемнять дальше. Здесь же замеряется, сколько
 * материалов вообще несёт поверхность: эмиссия окон по материалу невозможна,
 * потому что именная отделка макета — линии нулевой площади.
 */
function testNightAlbedo() {
  const albedo = LEVEL_03.map.albedo;
  map.build(new THREE.Scene());

  let applied = 0, wrong = 0, dayKept = true;
  for (const m of map.materials) {
    if (!m.color) continue;
    const day = m.userData.dayColor;
    if (!day) { dayKept = false; continue; }
    const ref = day.clone().multiplyScalar(albedo);
    if (m.color.getHex() === ref.getHex()) applied++; else wrong++;
  }

  // второй сбор меша не должен затемнять дальше
  const before = map.materials.map(m => (m.color ? m.color.getHex() : -1));
  map.build(new THREE.Scene());
  const idempotent = map.materials.every((m, i) => (m.color ? m.color.getHex() : -1) === before[i]);

  // сколько материалов держат поверхность (порог — квадратный метр района)
  const p = map.pos, area = new Float64Array(map.materials.length);
  for (let t = 0; t < map.triCount; t++) {
    const o = t * 9;
    const ax = p[o + 3] - p[o], ay = p[o + 4] - p[o + 1], az = p[o + 5] - p[o + 2];
    const bx = p[o + 6] - p[o], by = p[o + 7] - p[o + 1], bz = p[o + 8] - p[o + 2];
    area[map.mid[t]] += Math.hypot(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx) / 2;
  }
  const solid = area.filter(a => a >= 1).length;

  const passed = dayKept && wrong === 0 && applied > 0 && idempotent && albedo > 0 && albedo <= 1;
  return {
    name: 'Ночной вид: map.albedo затемняет диффузию ассета идемпотентно',
    passed,
    info: `albedo ${albedo}, затемнено материалов ${applied}, несовпадений ${wrong}, эталонный цвет сохранён=${dayKept}, второй build идемпотентен=${idempotent}; материалов с поверхностью ≥1 м² — ${solid} из ${map.materials.length}`,
  };
}

async function testDeterminism() {
  const b = await makeMap();
  let same = b.cells === map.cells && Math.abs(b.groundY - map.groundY) < 1e-9 &&
    b.triCount === map.triCount && b.occupiedCells === map.occupiedCells;
  for (const [x, z] of [[-300, -300], [0, 0], [127, -41], [148, -348]]) {
    if (b.groundHeightAt(x, z, 0) !== map.groundHeightAt(x, z, 0)) same = false;
    if (b.groundHeightAt(x, z, 100) !== map.groundHeightAt(x, z, 100)) same = false;
  }
  // растерка той же выборки граней даёт тот же верх
  const opts = {
    half: map.half, cell: map.cfg.cell, groundY: map.groundY,
    horizonNormal: map.cfg.horizonNormal, skipSpan: map.cfg.skipSpan,
    wallArea: map.cfg.wallArea,
  };
  const a = columnsFromTriangles(map.pos, map.nh, Math.min(4000, map.triCount), opts);
  const c = columnsFromTriangles(map.pos, map.nh, Math.min(4000, map.triCount), opts);
  let sameGrid = true;
  for (let k = 0; k < a.top.length; k++) if (a.top[k] !== c.top[k]) { sameGrid = false; break; }
  const passed = same && sameGrid;
  return {
    name: 'Детерминизм: тот же ассет и окно — бит-в-бит те же колонки',
    passed,
    info: `карты совпали=${same}, растерка из 4000 граней совпала=${sameGrid} (${a.top.length} клеток)`,
  };
}

/**
 * Прогоняет тесты района из макета и печатает отчёт в консоль.
 * @returns {Promise<{passed:number, total:number, results:Array<{name:string,passed:boolean,info:string}>}>}
 */
export async function runModelTests() {
  await preloadMapAsset(LEVEL_03.map);
  map = await makeMap();
  const scene = raycastScene(map); // тот же меш, что видит игрок, — эталон картинки

  const tests = [
    testContract,
    testAsset,
    testDistrict,
    testColumns,
    testStreetSupport,
    testWallHolds,
    testRoofSupport,
    testRayAndHit,
    () => testColumnRayMatchesPicture(scene),
    () => testRoofHeightMatchesPicture(scene),
    testSpherePushedOut,
    testAlienClimbsTower,
    testClimbNeedsLookUp,
    () => testColumnsMatchPicture(scene),
    testGraph,
    testPathWalkable,
    testOneStreetNetwork,
    testWanderPoints,
    testEnemiesWalkTheDistrict,
    testOpenPositions,
    testMesh,
    testMinimap,
    testNightAlbedo,
    testDeterminism,
  ];
  const results = [];
  for (const fn of tests) {
    try { results.push(await fn()); }
    catch (e) { results.push({ name: fn.name, passed: false, info: `ошибка: ${e && e.message}` }); }
  }
  const passed = results.filter(r => r.passed).length;

  if (typeof console !== 'undefined') {
    console.group('Автотесты района из GLB-макета (ModelMap)');
    for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'} — ${r.name}: ${r.info}`);
    console.log(`Итого: ${passed}/${results.length}`);
    console.groupEnd();
  }
  return { passed, total: results.length, results };
}
