/**
 * Автотесты карты-рельефа (TerrainMap, глава 1 «Перевал»).
 *
 * Проверяют проходовость рельефа, описанного данными уровня: маршрут от точки
 * A до точки B, пещерный ход, отвесные стенки пропасти, настил моста и пологий
 * откос-выход из неё. Рельеф берётся из LEVEL_01.map — тесты следят за данными.
 *
 * Запуск в браузере (через консоль страницы игры, где есть importmap):
 *   const m = await import('/tests/terrain-traverse.test.js');
 *   await m.runTerrainTests();
 *
 * Проверяются сценарии:
 *   1. Карта строится: солиды, индексы и граф навигации непустые;
 *   2. По графу навигации есть путь от спавна до точки B;
 *   3. Маршрут движка физически проходим ногами на всём протяжении (граф и
 *      физика меряют подъём одинаково);
 *   4. В центре туннеля — плоский пол, игрока не задерживает, потолок за
 *     держивает поднятую руку (высота больше прохода);
 *   5. Туннель проходной ногами: от устья до захода на мост шаг за шагом, без
 *     подъёма больше шага — так ловится «тупик за краем rect'а пещеры»;
 *   6. Ответвление в зал тоже проходной;
 *   7. С края пропасти можно сойти вниз (это обрыв, а не стена), а из неё —
 *      нет: отвесная стенка задерживает;
 *   8. Настил моста — опора на заданной высоте, по нему можно идти;
 *   9. Откос внутри пропасти проходной ногами снизу доверху (в том числе под
 *      настилом моста) и связан с верхом графом: с дна пропасти есть путь наверх;
 *  10. Рейкаст raySolid сверху вниз по горе попадает в скалу, а не в «пол мира»
 *      (у рельефа нет плоскости земли) и бьёт ровно в рисованную поверхность;
 *  11. Склон горы гладкий: опора меняется непрерывно, а не ступеньками колонок;
 *      пологий склон при этом проходной, а отвесный держится как стена (предел
 *      climbSlope), и меш рельефа собирается без NaN-вершин;
 *  12. Гряда над туннелем: клетки со сводом отдают вершину аналитической
 *      поверхности (меш, опора, маршруты), через хребет можно идти сверху, а
 *      ход под сводом остаётся ходом;
 *  13. Твёрдость рельефа = картинка: порода кончается там же, где сетка, луч
 *      сверху бьёт в склон с малой ошибкой, а сфера тела опирается на наклонный
 *      край, а не на спрятанную ступень колонки (иначе Чужому и пулям под
 *      гладкой горой доступна только лестница);
 *  14. Детерминизм: две карты с одним сидом дают одинаковые высоты опоры.
 */
import { TerrainMap } from '../src/terrain-map.js';
import { LEVEL_01 } from '../src/levels/level-01.js';
import { CONFIG } from '../src/config.js';

const STEP = CONFIG.building.stepUp;
const PLAYER_H = CONFIG.eyeHeight + 0.35;

function makeMap() {
  return new TerrainMap(LEVEL_01.map);
}

/** Точка B из определения главы, опираясь на поверхность рельефа. */
function exitPoint(map) {
  const e = LEVEL_01.gameplay.exit;
  return { x: e.x, y: map.groundHeightAt(e.x, e.z, 500), z: e.z };
}

function testBasics() {
  const map = makeMap();
  const passed = map.solids.length > 100 && map.nav.pos.length > 100 &&
    !map.groundPlane;
  return {
    name: 'Карта рельефа строится (солиды, навигация, нет плоскости земли)',
    passed,
    info: `солидов ${map.solids.length}, узлов навигации ${map.nav.pos.length}, bounds y ${map.bounds.minX}..${map.bounds.maxX}`,
  };
}

function testPathAtoB() {
  const map = makeMap();
  const path = map.findPath(map.spawn, exitPoint(map));
  const passed = Array.isArray(path) && path.length > 2;
  return {
    name: 'Маршрут от точки A до точки B существует',
    passed,
    info: passed ? `путь из ${path.length} узлов` : 'пути нет — рельеф непроходим',
  };
}

function testCave() {
  const map = makeMap();
  const cx = 0, cz = -2; // внутри туннеля LEVEL_01
  const floor = LEVEL_01.map.caves[0].floor;
  // пол прощупываем «с высоты пола»: сверху над пещерой — ещё и гора
  const ground = map.groundHeightAt(cx, cz, floor);
  const walkOk = Math.abs(ground - floor) < 0.01 &&
    !map.isBlocked(cx, cz, CONFIG.radius, floor, PLAYER_H);
  // рука над головой игрока выше потолка пещеры — должна задержаться породой
  const tallBlocked = map.isBlocked(cx, cz, CONFIG.radius, floor, CONFIG.terrain.caveHeight + 0.5);
  const passed = walkOk && tallBlocked;
  return {
    name: 'Пещера: пол по данным, в проходе свободно, выше потолка — задержка',
    passed,
    info: passed
      ? `пол y=${ground.toFixed(2)}, обычный рост проходит, потолок ловит руку`
      : `ground=${ground.toFixed(2)} (ожидался ${floor}), walkOk=${walkOk}, tallBlocked=${tallBlocked}`,
  };
}

/**
 * Шагает по поверхности от {x,z} до {x,z} шагом 0.5: подъём больше шага или
 * задержка габарита — это тупик. Возвращает null, если прошли, иначе точку
 * сбоя с причиной.
 */
function walkAlong(map, from, to, feet) {
  const len = Math.hypot(to.x - from.x, to.z - from.z);
  const steps = Math.ceil(len / 0.5);
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const x = from.x + (to.x - from.x) * t;
    const z = from.z + (to.z - from.z) * t;
    const g = map.groundHeightAt(x, z, feet);
    if (g - feet > STEP) {
      return { x, z, reason: `подъём ${feet.toFixed(2)}→${g.toFixed(2)} — стена` };
    }
    feet = g;
    if (map.isBlocked(x, z, CONFIG.radius, feet + 0.02, PLAYER_H)) {
      return { x, z, reason: 'габарит задерживает' };
    }
  }
  return null;
}

function testTunnelThrough() {
  const map = makeMap();
  const c = LEVEL_01.map.caves[0];
  const z = (c.z0 + c.z1) / 2;
  const from = { x: c.x0 + 4, z };
  const to = { x: map.cfg.bridge.x0 - 2, z }; // до западного захода на мост
  const fail = walkAlong(map, from, to, map.groundHeightAt(from.x, from.z, 500));
  return {
    name: 'Туннель проходной: от устья до захода на мост без тупика',
    passed: !fail,
    info: fail
      ? `тупик на x=${fail.x.toFixed(1)}: ${fail.reason}`
      : `прошли x=${from.x}..${to.x.toFixed(0)} по y≈${c.floor}`,
  };
}

function testBranchToHall() {
  const map = makeMap();
  const tunnel = LEVEL_01.map.caves[0];
  const corridor = LEVEL_01.map.caves[2];
  const hall = LEVEL_01.map.caves[1];
  const x = (corridor.x0 + corridor.x1) / 2;
  const from = { x, z: tunnel.z1 + 2 };
  const to = { x, z: (hall.z0 + hall.z1) / 2 }; // центр зала: до его стенки не идём намеренно
  const fail = walkAlong(map, from, to, map.groundHeightAt(from.x, from.z, 500));
  return {
    name: 'Ответвление в зал проходной: коридор соединяет туннель и зал',
    passed: !fail,
    info: fail
      ? `тупик на z=${fail.z.toFixed(1)}: ${fail.reason}`
      : `прошли z=${from.z}..${to.z} по коридору`,
  };
}

function testPathWalkable() {
  const map = makeMap();
  const path = map.findPath(map.spawn, exitPoint(map));
  if (!Array.isArray(path) || path.length < 2) {
    return { name: 'Маршрут движка физически проходим', passed: false, info: 'пути нет' };
  }
  for (let k = 1; k < path.length; k++) {
    const fail = walkAlong(map, path[k - 1], path[k], path[k - 1].y);
    if (fail) {
      return {
        name: 'Маршрут движка физически проходим',
        passed: false,
        info: `тупик на шаге ${k}/${path.length - 1} у x=${fail.x.toFixed(1)}, z=${fail.z.toFixed(1)}: ${fail.reason}`,
      };
    }
  }
  return {
    name: 'Маршрут движка физически проходим',
    passed: true,
    info: `${path.length} узлов пройдены ногами без тупика`,
  };
}

function testChasmWalls() {
  const map = makeMap();
  const ch = LEVEL_01.map.chasm;
  const edge = ch.x0;        // граница пропасти с западной стороны
  const z = -40;             // подальше от моста и откоса
  const wallX = edge - 2;    // центр клетки-стенки (до обрыва)
  const rimFeet = map.groundHeightAt(wallX, z, 500);
  const bottomFeet = map.groundHeightAt(edge + 2, z, 500);

  // сходить с края можно: дно ниже — это обрыв, а не стена
  const stepOff = !map.isBlocked(edge + 2, z, CONFIG.radius, rimFeet, PLAYER_H);
  // выбраться вверх по отвесной стенке нельзя: габарит задерживает
  const climbOut = map.isBlocked(edge + 0.2, z, CONFIG.radius, bottomFeet, PLAYER_H);
  const deep = rimFeet - bottomFeet >= 3; // это обрыв, а не перепад
  const passed = stepOff && climbOut && deep;
  return {
    name: 'Пропасть: с края сходим, из неё отвесная стенка не выпускает',
    passed,
    info: passed
      ? `край y=${rimFeet.toFixed(2)}, дно y=${bottomFeet.toFixed(2)} (глубина ${(rimFeet - bottomFeet).toFixed(2)})`
      : `stepOff=${stepOff}, climbOut=${climbOut}, глубина=${(rimFeet - bottomFeet).toFixed(2)}`,
  };
}

function testBridge() {
  const map = makeMap();
  const br = LEVEL_01.map.bridge;
  const x = (br.x0 + br.x1) / 2, z = (br.z0 + br.z1) / 2;
  const ground = map.groundHeightAt(x, z, 500);
  const passed = Math.abs(ground - br.y) < 0.01 &&
    !map.isBlocked(x, z, CONFIG.radius, ground, PLAYER_H);
  return {
    name: 'Мост: настил — опора на заданной высоте, по нему можно идти',
    passed,
    info: passed ? `настил y=${ground.toFixed(2)}` : `ground=${ground.toFixed(2)}, ожидался настил y=${br.y}`,
  };
}

function testRampEscape() {
  const map = makeMap();
  const r = LEVEL_01.map.ramps[0];
  const x = (r.x0 + r.x1) / 2;
  const from = { x, z: r.z0 + 2 };
  const to = { x, z: r.z1 - 2 };
  // Откос проходим ногами снизу доверху: перепад клетки, габарита и запас над
  // головой под настилом моста — часть одного маршрута, поэтому меряем шагом, а
  // не центрами колонок «с неба» (там над откосом лежит пролёт моста).
  const fail = walkAlong(map, from, to, map.groundHeightAt(x, from.z, 500));
  const path = map.findPath(
    { x, y: map.groundHeightAt(x, from.z, 500), z: from.z },
    { x: r.x1 + 4, y: r.to, z: r.z1 + 4 });
  const passed = !fail && Array.isArray(path) && path.length > 2;
  return {
    name: 'Откос из пропасти проходной и связан с верхом маршрутом',
    passed,
    info: passed
      ? `дно y=${map.groundHeightAt(x, from.z, 500).toFixed(2)} → верх y=${map.groundHeightAt(x, to.z, 500).toFixed(2)}, маршрут из ${path.length} узлов`
      : (fail ? `тупик на z=${fail.z.toFixed(1)}: ${fail.reason}` : 'маршрута наверх нет'),
  };
}

function testRaySolidMountain() {
  const map = makeMap();
  const m = LEVEL_01.map.mountains[0];
  const hit = map.raySolid(m.x, 60, m.z, 0, -1, 0, 100);
  // нормаль верха склона больше не строго +Y (кровля колонок ушла): важны знак
  // и то, что удар пришёл в рисованную поверхность, а не в её центр-ступеньку
  const surface = map._surface(m.x, m.z);
  const passed = !!hit && hit.ny > 0.5 && Math.abs(hit.y - surface) < 0.15 && hit.y > m.h * 0.5;
  return {
    name: 'Рейкаст по горе: raySolid попадает в скалу (плоскости земли нет)',
    passed,
    info: passed
      ? `удар y=${hit.y.toFixed(2)} при поверхности ${surface.toFixed(2)}, ny=${hit.ny.toFixed(2)}`
      : `hit=${hit ? `y=${hit.y.toFixed(2)}, ny=${hit.ny.toFixed(2)}` : 'null'}, поверхность=${surface.toFixed(2)}`,
  };
}

/**
 * Твёрдость рельефа = нарисованная поверхность. Раньше солиды были вершинами
 * колонок по центру клетки: под гладкой сеткой пряталась лестница, и тело Чужого
 * (raySolid/resolveSphere) с пулями опирались не на склон, а на ступени.
 * Прощупываем массивный квадрат горы сеткой точек: порода обязана кончаться
 * ровно там, где рисунка, а луч сверху — бить в неё с ошибкой меньше ладони и
 * без скачков по высоте.
 */
function testRockMatchesSkin() {
  const map = makeMap();
  const m = LEVEL_01.map.mountains[0];
  const cap = CONFIG.terrain.roofCap;
  let checked = 0, badOccupancy = 0, worstRay = 0, tilted = 0;

  for (let z = m.z - 45; z <= m.z + 45; z += 1.5) {
    for (let x = m.x - 45; x <= m.x + 45; x += 1.5) {
      const idx = map._cellIndex(x, z);
      if (idx < 0) continue;
      // колонки фичей (прорез хода, площадки) остаются коробками — их проверяет
      // тест туннеля; здесь меряем только клетки, чей верх держит поверхность
      if (!map.smoothFlags[idx] && !map.roofFlags[idx]) continue;
      const s = map._surface(x, z);
      checked++;
      if (map._rockAt(x, s - 0.2, z) !== true) badOccupancy++;
      if (map._rockAt(x, s + 0.2, z) !== false) badOccupancy++;
      // над сводом панцирь обязан быть толще человека, иначе под сеткой пустота
      if (map.roofFlags[idx] && s - map.caveCeil[idx] < cap - 0.05) badOccupancy++;
      const hit = map.raySolid(x, s + 20, z, 0, -1, 0, 25);
      if (!hit || hit.ny < 0.5) { badOccupancy++; continue; }
      const err = Math.abs(hit.y - s);
      if (err > worstRay) worstRay = err;
      if (hit.ny < 0.9) tilted++;
    }
  }
  const passed = checked > 500 && badOccupancy === 0 && worstRay < 0.15 && tilted > 0;
  return {
    name: 'Твёрдость рельефа = рисованная поверхность: луч и порода без ступеней',
    passed,
    info: passed
      ? `${checked} точек, ошибка луча ≤ ${worstRay.toFixed(3)}, наклонных нормалей ${tilted}`
      : `точек=${checked}, расхождений=${badOccupancy}, ошибка=${worstRay.toFixed(3)}`,
  };
}

/**
 * Сфера тела Чужого должна опираться на наклонённый край, а не на невидимый
 * уступ колонки: роняем сферу на склон по линии и меряем расстояние вдоль
 * нормали поверхности. Внутри хода тело держат пол и перекрытие (они остаются
 * коробками), а сфера, угодившая в каменный панцирь над ходом, обязана вернуться
 * в ход, а не прыгнуть на гряду сквозь перекрытие.
 */
function testSphereRestsOnSkin() {
  const map = makeMap();
  const m = LEVEL_01.map.mountains[0];
  const r = CONFIG.alien.radius;
  // расстояние от центра сферы до опоры вдоль нормали поверхности
  const clearance = (c) => {
    const g = map._gradient(c.x, c.z);
    return (c.y - map._surface(c.x, c.z)) / Math.hypot(g.x, 1, g.z);
  };
  const z = m.z - 14;
  let worst = 0, samples = 0, sunk = 0;
  for (let x = m.x - m.r * 1.3; x <= m.x - m.r * 0.3; x += 0.7) {
    const c = { x, y: map._surface(x, z) + 0.05, z }; // центр чуть ниже рисунка: сфера обязана вылезти
    map.resolveSphere(c, r);
    const dist = clearance(c);
    if (dist < r - 0.02) sunk++;
    if (Math.abs(dist - r) > worst) worst = Math.abs(dist - r);
    samples++;
  }
  // в туннеле сферу держит пол хода (коробка), а не аналитическая гряда
  const floor = LEVEL_01.map.caves[0].floor;
  const inCave = { x: 0, y: floor + r - 0.1, z: -2 };
  map.resolveSphere(inCave, r);
  const floorOk = Math.abs(inCave.y - (floor + r)) < 0.05;

  // перекрытие хода: луч снизу бьёт в горизонтальную грань (нормаль вниз), а
  // сфера, угодившая в каменный панцирь, возвращается в ход, а не выпрыгивает
  // на гряду сквозь перекрытие
  let roofIdx = -1;
  for (let i = 0; i < map.roofFlags.length; i++) if (map.roofFlags[i]) { roofIdx = i; break; }
  const rx = -map.half + (roofIdx % map.N + 0.5) * map.cell;
  const rz = -map.half + (Math.floor(roofIdx / map.N) + 0.5) * map.cell;
  const ceil = map.caveCeil[roofIdx];
  const up = map.raySolid(rx, floor + 0.5, rz, 0, 1, 0, 20);
  const ceilOk = !!up && up.ny === -1 && Math.abs(up.y - ceil) < 0.1;
  const inCap = { x: rx, y: ceil + 0.2, z: rz };
  map.resolveSphere(inCap, r);
  const pushedBack = inCap.y <= ceil - r + 0.02 && inCap.y > floor &&
    inCap.y < map._surface(rx, rz);

  const passed = samples > 20 && sunk === 0 && worst < 0.05 && floorOk &&
    roofIdx >= 0 && ceilOk && pushedBack;
  return {
    name: 'Сфера тела опирается на наклонный край: без провалов под склон',
    passed,
    info: passed
      ? `${samples} позиций на склоне, отклонение от радиуса ≤ ${worst.toFixed(4)}, пол хода держит (y=${inCave.y.toFixed(2)}), свод: удар y=${up && up.y.toFixed(2)} при ceil=${ceil.toFixed(2)}, тело возвращено в ход (y=${inCap.y.toFixed(2)})`
      : `образцов=${samples}, провалов=${sunk}, отклонение=${worst.toFixed(3)}, пол хода=${floorOk}, свод=${ceilOk} (${up ? `${up.y.toFixed(2)}/${up.ny}` : 'null'}, ceil=${ceil.toFixed(2)}), в ход=${pushedBack} (y=${inCap.y.toFixed(2)})`,
  };
}

/**
 * Опора на склоне горы не должна меняться «ступеньками» по 4 юнита: идём вдоль
 * линии мелкими шагами и смотрим, что рост высоты происходит непрерывно, а не
 * скачком на границе колонки.
 */
function testSmoothSlope() {
  const map = makeMap();
  const m = LEVEL_01.map.mountains[0];
  // по склону с запада горы, не задевая пещеры (они на z≈-6..2)
  const z = m.z - 14;
  const x0 = m.x - m.r * 1.4, x1 = m.x - m.r * 0.35;
  const steps = Math.round((x1 - x0) / 0.1);
  let prev = map.groundHeightAt(x0, z, 500), maxJump = 0, rise = 0;
  for (let s = 1; s <= steps; s++) {
    const x = x0 + (x1 - x0) * (s / steps);
    const y = map.groundHeightAt(x, z, 500);
    if (Math.abs(y - prev) > maxJump) maxJump = Math.abs(y - prev);
    rise += y - prev;
    prev = y;
  }
  // колонка давала бы нулевой рост внутри клетки и прыжок на её границе
  const passed = rise > 4 && maxJump < 0.05;
  return {
    name: 'Склон горы гладкий: опора растёт непрерывно, без ступеней колонки',
    passed,
    info: passed
      ? `подъём ${rise.toFixed(2)} юнита, максимальный скачок ${maxJump.toFixed(4)} на 0.1 юнита`
      : `rise=${rise.toFixed(2)}, maxJump=${maxJump.toFixed(3)} — ступени по ${CONFIG.terrain.cell} юнита`,
  };
}

/**
 * Пологий склон теперь проходен ногами: подъём к вершине горы не должен
 * упираться в невидимую грань колонки.
 */
function testGentleSlopeWalkable() {
  const map = makeMap();
  const m = LEVEL_01.map.mountains[0];
  const z = m.z + 20;
  const from = { x: m.x, z: z + m.r * 0.9 };
  const to = { x: m.x, z };
  const fail = walkAlong(map, from, to, map.groundHeightAt(from.x, from.z, 500));
  return {
    name: 'Пологий склон горы проходной: подъём без невидимой стены',
    passed: !fail,
    info: fail
      ? `стена на z=${fail.z.toFixed(1)}: ${fail.reason}`
      : `взошли от z=${from.z.toFixed(0)} до z=${z} (y≈${map.groundHeightAt(to.x, to.z, 500).toFixed(1)})`,
  };
}

/**
 * Предел уклона работает: отвесную стенку (крутая гаусова гора из данных)
 * физика держит как стену, даже когда соседние клетки «гладкие».
 */
function testCliffBlocks() {
  const steep = new TerrainMap({ ...LEVEL_01.map, mountains: [{ x: 0, z: 0, r: 5, h: 30 }] });
  const from = { x: -26, z: 26 };
  const to = { x: -4, z: -4 }; // к самой вершине: уклон у d≈8 уже за пределом
  const fail = walkAlong(steep, from, to, steep.groundHeightAt(from.x, from.z, 500));
  return {
    name: 'Крутой склон остаётся стеной: предел climbSlope держит отвес',
    passed: !!fail,
    info: fail
      ? `остановка на x=${fail.x.toFixed(1)}, z=${fail.z.toFixed(1)}: ${fail.reason}`
      : `отвес проходной до x=${to.x} — лимит уклона сломан`,
  };
}

/** Гладкие клетки дают непустой меш без NaN-вершин; features остаются колонками. */
async function testSmoothMesh() {
  const map = makeMap();
  const THREE = await import('three');
  const scene = new THREE.Scene();
  map.build(scene);
  let verts = 0, bad = 0, meshes = 0;
  scene.traverse((o) => {
    const p = o.geometry?.attributes?.position;
    if (!p) return;
    meshes++;
    verts += p.count;
    for (let k = 0; k < p.count; k++) if (!Number.isFinite(p.getY(k))) bad++;
  });
  // сетка одной клетки = sub²·6 вершин, их на карте заведомо много
  const passed = meshes > 0 && bad === 0 && verts > 10000;
  return {
    name: 'Меш рельефа собирается: вершины конечны, гладкая сетка не пуста',
    passed,
    info: passed ? `${meshes} меш(ей), ${verts} вершин, NaN нет` : `meshes=${meshes}, verts=${verts}, NaN=${bad}`,
  };
}

/**
 * Гряда над туннелем: клетки со сводом отдают свою вершину аналитической
 * поверхности — и мешу, и опоре, и маршрутам. Без этого весь главный хребет
 * (сквозь него идёт туннель) оставался колоночным: ступени и на вид, и на шаг.
 * Проверяем непрерывность опоры через полосу свода, подъём через хребет поверх
 * хода, что граф это тоже видит и что сам ход под грядой остаётся ходом.
 */
function testRidgeOverTunnel() {
  const map = makeMap();
  const t = LEVEL_01.map.caves[0];
  const m = LEVEL_01.map.mountains[0];
  const floor = t.floor;

  let roofed = 0, unskinned = 0;
  for (let idx = 0; idx < map.roofFlags.length; idx++) {
    if (!map.roofFlags[idx]) continue;
    roofed++;
    if (!map.renderFlags[idx]) unskinned++;
  }

  // опора над сводом — та же поверхность, что вокруг: без ступени на границе
  const zAxis = (t.z0 + t.z1) / 2;
  let maxJump = 0, overCeil = true;
  let prev = map.groundHeightAt(m.x, t.z0 - 2, 500);
  for (let z = t.z0 - 2; z <= t.z1 + 2; z += 0.1) {
    const y = map.groundHeightAt(m.x, z, 500);
    if (Math.abs(y - prev) > maxJump) maxJump = Math.abs(y - prev);
    if (y < map.caveCeil[map._cellIndex(m.x, z)] - 0.01) overCeil = false;
    prev = y;
  }

  // через хребет поперёк туннеля — по гребню, ноги выше перекрытия
  const from = { x: m.x, z: m.z - 25 };
  const to = { x: m.x, z: m.z + 25 };
  const fail = walkAlong(map, from, to, map.groundHeightAt(from.x, from.z, 500));
  const overRidge = map.findPath({ x: m.x, y: map.groundHeightAt(m.x, from.z, 500), z: from.z },
    { x: m.x, y: map.groundHeightAt(m.x, to.z, 500), z: to.z });

  // и под грядой ход не сломан: пол по данным, габарит человека проходит
  const inner = map.groundHeightAt(m.x, zAxis, floor);
  const innerOk = Math.abs(inner - floor) < 0.01 &&
    !map.isBlocked(m.x, zAxis, CONFIG.radius, floor, PLAYER_H);

  const passed = roofed > 0 && unskinned === 0 && maxJump < 0.05 && overCeil &&
    !fail && Array.isArray(overRidge) && overRidge.length > 2 && innerOk;
  return {
    name: 'Гряда над туннелем гладкая и проходная: свод держит поверхность',
    passed,
    info: passed
      ? `клеток со сводом ${roofed}, опора над ними непрерывна (скачок ${maxJump.toFixed(4)}), хребет пройден ногами, ход под ним свободен (пол y=${inner.toFixed(2)})`
      : `roofed=${roofed}, без сетки=${unskinned}, скачок=${maxJump.toFixed(3)}, выше свода=${overCeil}, пешком=${fail ? fail.reason : 'ok'}, граф=${!!overRidge}, ход=${innerOk}`,
  };
}

function testDeterminism() {
  const a = makeMap();
  const b = makeMap();
  let same = true;
  for (const [x, z] of [[-100, 4], [0, -2], [70, -30], [104, 0]]) {
    if (a.groundHeightAt(x, z, 500) !== b.groundHeightAt(x, z, 500)) same = false;
  }
  return {
    name: 'Детерминизм: один сид — одна и та же высота опоры',
    passed: same,
    info: same ? '4 контрольные точки совпали' : 'высоты разошлись — рельеф не детерминирован',
  };
}

/**
 * Прогоняет тесты рельефа и печатает отчёт в консоль.
 * @returns {{passed:number, total:number, results:Array<{name:string,passed:boolean,info:string}>}}
 */
export async function runTerrainTests() {
  const tests = [
    testBasics,
    testPathAtoB,
    testPathWalkable,
    testCave,
    testTunnelThrough,
    testBranchToHall,
    testChasmWalls,
    testBridge,
    testRampEscape,
    testSmoothSlope,
    testGentleSlopeWalkable,
    testRidgeOverTunnel,
    testCliffBlocks,
    testSmoothMesh,
    testRaySolidMountain,
    testRockMatchesSkin,
    testSphereRestsOnSkin,
    testDeterminism,
  ];
  const results = [];
  for (const fn of tests) {
    try { results.push(await fn()); }
    catch (e) { results.push({ name: fn.name, passed: false, info: `ошибка: ${e && e.message}` }); }
  }
  const passed = results.filter(r => r.passed).length;

  if (typeof console !== 'undefined') {
    console.group('Автотесты карты-рельефа');
    for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'} — ${r.name}: ${r.info}`);
    console.log(`Итого: ${passed}/${results.length}`);
    console.groupEnd();
  }
  return { passed, total: results.length, results };
}
