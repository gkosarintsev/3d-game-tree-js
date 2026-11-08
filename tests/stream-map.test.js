/**
 * Автотесты стриминга всего макета города (StreamedModelMap, глава 4).
 *
 * Проверяют: корзины граней по тайлам покрывают файл
 * без дублей и пропусков, активное окно собирается из них детерминированно и
 * совпадает с несстримящейся картой того же окна, **стык двух соседних окон даёт
 * тот же верх колонки клетка в клетку** (это и решено двойной точностью сырых
 * координат файла), класс грани «стена или плоскость» не зависит от центра окна,
 * `updateStreaming` держит игрока в центральном тайле, переставляет окно при
 * выходе и отказывает там, где за покрышкой макета нет улиц, а пешеходный
 * маршрут через границу окна существует и проходится ногами. Плюс контракт
 * главы: 16 обязательных членов и опциональный `updateStreaming`, и отсутствие
 * утечки мешей при десяти перестановках подряд.
 *
 * Запуск в браузере (через консоль страницы игры, где есть importmap):
 *   const t = await import('/tests/stream-map.test.js?v=1');
 *   await t.runStreamTests();
 */
import * as THREE from 'three';
import { StreamedModelMap } from '../src/stream-map.js';
import { ModelMap } from '../src/model-map.js';
import { preloadMapAsset, getGltfScene, trianglesFromScene, tileBuckets } from '../src/glb.js';
import { CONFIG } from '../src/config.js';

const STEP = CONFIG.building.stepUp;
const PLAYER_H = CONFIG.eyeHeight + 0.35;
const ASSET = 'src/assets/cyberpunk_2077_night_city_map.glb';

/**
 * Данные главы 4: первое окно — точка A (центр 2457,375; −1457,036 в метрах
 * масштабированного файла), окно 780 м = 3 тайла по 260 м, точка B — (−520, 520)
 * относительно центра первого окна.
 * Данные ниже повторяют окно и точку B главы 4: тест держит те же числа,
 * что и её определение.
 */
const SPEC = {
  kind: 'stream',
  asset: ASSET,
  window: { x: 2457.375, z: -1457.036, size: 780 },
  spawn: { x: 0, z: 0 },
  albedo: 0.45,
};
const EXIT_LOCAL = { x: -520, z: 520 };
const TILE = CONFIG.model.tile;

let map = null;

/** Локальные метры активного окна → метры масштабированного файла. */
const toFile = (m, x, z) => ({ x: x + m.window.x, z: z + m.window.z });
/** Метры файла → локальные метры текущего окна. */
const toLocal = (m, fx, fz) => ({ x: fx - m.window.x, z: fz - m.window.z });

async function makeMap(spec = SPEC) {
  await preloadMapAsset({ asset: ASSET });
  return new StreamedModelMap(spec);
}

/** Снимок сетки верха колонок — чтобы сравнивать окна до и после перестановки. */
const snapshot = (m) => ({ cells: m.cells, top: Float32Array.from(m.top) });

/**
 * Обход маршрута ногами с перестановкой активного окна: как только шагающий
 * переходит границу центрального тайла, карта перестраивается, а позиция
 * шагающего и цель уезжают на `-(dx, dz)` — ровно так же, как делает движок
 * (`Game._streamWindow`). После сдвига оставшийся маршрут не годится (граф
 * другой), поэтому нога начинается заново.
 */
function walkStreamed(m, from, to) {
  let feet = m.groundHeightAt(from.x, from.z, 0);
  let pos = { x: from.x, z: from.z };
  let target = { x: to.x, z: to.z };
  let distance = 0, recenters = 0, stuck = null;
  leg: for (let leg = 0; leg < 40; leg++) {
    const path = m.findPath(
      { x: pos.x, y: feet, z: pos.z },
      { x: target.x, y: m.groundHeightAt(target.x, target.z, 0), z: target.z },
    );
    if (!path || path.length < 2) { stuck = { x: pos.x, z: pos.z, reason: 'маршрута нет' }; break; }
    for (let i = 1; i < path.length; i++) {
      const a = { x: pos.x, z: pos.z }, b = path[i];
      const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 0.5));
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t;
        const g = m.groundHeightAt(x, z, feet);
        if (g - feet > STEP) { stuck = { x, z, reason: 'подъём — стена' }; break leg; }
        feet = g;
        if (m.isBlocked(x, z, CONFIG.radius, feet + 0.02, PLAYER_H)) {
          stuck = { x, z, reason: 'габарит задерживает' }; break leg;
        }
        distance += Math.hypot(x - pos.x, z - pos.z);
        pos = { x, z };
        const sh = m.updateStreaming(x, z);
        if (sh) {
          recenters++;
          pos = { x: pos.x - sh.dx, z: pos.z - sh.dz };
          target = { x: target.x - sh.dx, z: target.z - sh.dz };
          continue leg;
        }
      }
    }
    if (Math.hypot(pos.x - target.x, pos.z - target.z) <= m.cfg.navStep) break;
  }
  return { pos, distance, recenters, stuck, rest: Math.hypot(pos.x - target.x, pos.z - target.z) };
}

/** Число граней, у которых вердикт «стена-лента» зависит от центра окна. */
function classFlips(tris, s, winA, winB, float32) {
  const wallArea = CONFIG.model.wallArea;
  const f = float32 ? Math.fround : (v => v);
  const den = (ox, oz, b) => {
    const ax = f(tris.pos[b] * s - ox), az = f(tris.pos[b + 2] * s - oz);
    const bx = f(tris.pos[b + 3] * s - ox), bz = f(tris.pos[b + 5] * s - oz);
    const cx = f(tris.pos[b + 6] * s - ox), cz = f(tris.pos[b + 8] * s - oz);
    return (bx - ax) * (cz - az) - (bz - az) * (cx - ax);
  };
  let flips = 0;
  for (let t = 0; t < tris.count; t++) {
    const b = t * 9;
    if ((Math.abs(den(winA.x, winA.z, b)) < wallArea) !== (Math.abs(den(winB.x, winB.z, b)) < wallArea)) flips++;
  }
  return flips;
}

function testContract() {
  const fields = ['width', 'depth', 'spawn', 'bounds', 'solids'];
  const methods = ['groundHeightAt', 'isBlocked', 'openPositions', 'worldToNormalized',
    'build', 'drawMinimap', 'raySolid', 'resolveSphere', 'rayHitDistance', 'findPath',
    'randomNavPoint'];
  const missing = [...fields.filter(f => map[f] === undefined),
    ...methods.filter(mm => typeof map[mm] !== 'function')];
  const streamOk = typeof map.updateStreaming === 'function';
  // опциональный член: несстримящаяся карта того же окна его не даёт — и права не имеет
  const plainOptional = typeof new ModelMap(SPEC).updateStreaming === 'undefined';
  return {
    name: 'Контракт: 16 обязательных членов + опциональный updateStreaming',
    passed: missing.length === 0 && Array.isArray(map.solids) && streamOk && plainOptional,
    info: missing.length ? `нет членов: ${missing.join(', ')}`
      : `${fields.length + methods.length} обязательных на месте, updateStreaming у стрима есть=${streamOk}, у ModelMap его нет (допустимо)=${plainOptional}`,
  };
}

function testBuckets() {
  const tris = trianglesFromScene(getGltfScene(ASSET));
  const origin = { x: SPEC.window.x - SPEC.window.size / 2, z: SPEC.window.z - SPEC.window.size / 2 };
  const bk = tileBuckets(tris, map.scale, TILE, origin);
  const countDupes = (list, mark) => {
    let dupes = 0;
    for (let p = 0; p < list.length; p++) if (mark[list[p]]++) dupes++;
    return dupes;
  };
  // объединение всех тайлов сетки: каждая грань файла ровно по разу
  const all = bk.gather(-bk.shiftX, -bk.shiftZ, bk.cols - 1 - bk.shiftX, bk.rows - 1 - bk.shiftZ);
  const allDupes = countDupes(all, new Uint8Array(tris.count));
  // окно 3×3 тайла: без повторов и ровно то, что взяла бы несстримящаяся карта
  const per = Math.round(SPEC.window.size / TILE);
  const win = bk.gather(0, 0, per - 1, per - 1);
  const winDupes = countDupes(win, new Uint8Array(tris.count));
  const records = bk.starts[bk.cols * bk.rows];
  const passed = all.length === tris.count && allDupes === 0 && winDupes === 0 &&
    win.length === map.triCount && records > tris.count;
  return {
    name: 'Корзины тайлов покрывают файл без дублей и пропусков',
    passed,
    info: `граней ${tris.count}, объединение ${all.length} (дублей ${allDupes}), окно ${per}×${per} тайлов — ${win.length} граней (дублей ${winDupes}) = растерка окна ${map.triCount}, записей по тайлам ${records} (+${((records / tris.count - 1) * 100).toFixed(1)} % граней задевают соседний тайл)`,
  };
}

function testSameWindowAsModelMap() {
  const model = new ModelMap(SPEC);
  const sameTris = model.triCount === map.triCount && model.tris.count === map.tris.count;
  const sameGrid = model.cells === map.cells && model.occupiedCells === map.occupiedCells;
  const sameGround = model.groundY === map.groundY;
  const sameNav = model.nav.pos.length === map.nav.pos.length;
  // растерка стрима берёт файловые числа, ModelMap — float32 вершины окна,
  // поэтому клетки могут разойтись не больше чем на один шаг float32 высоты
  let diff = 0, worst = 0;
  for (let k = 0; k < map.top.length; k++) {
    const d = Math.abs(map.top[k] - model.top[k]);
    if (d > 0) { diff++; if (d > worst) worst = d; }
  }
  const tol = Math.max(1, map.maxTop) * 2 ** -23;
  const passed = sameTris && sameGrid && sameGround && sameNav && worst <= tol &&
    diff / map.top.length < 0.005;
  return {
    name: 'То же окно через ModelMap: грани, опора, колонки и граф совпадают',
    passed,
    info: `грани ${map.triCount}=${model.triCount}, занятых клеток ${map.occupiedCells}=${model.occupiedCells}, узлов графа ${map.nav.pos.length}=${model.nav.pos.length}, groundY побитово=${sameGround}, разошлось клеток ${diff} из ${map.top.length}, максимум расхождения ${worst.toExponential(1)} м (шаг float32 ${tol.toExponential(1)})`,
  };
}

async function testDeterminism() {
  const b = await makeMap();
  let sameTop = b.cells === map.cells && Math.abs(b.groundY - map.groundY) < 1e-12;
  for (let k = 0; sameTop && k < b.top.length; k++) if (b.top[k] !== map.top[k]) sameTop = false;
  const passed = sameTop && b.triCount === map.triCount &&
    b.occupiedCells === map.occupiedCells && b.nav.pos.length === map.nav.pos.length &&
    b.spawn.x === map.spawn.x && b.spawn.z === map.spawn.z;
  return {
    name: 'Детерминизм окна: тот же ассет и центр — бит-в-бит те же колонки',
    passed,
    info: `верх колонок совпал=${sameTop}, граней ${map.triCount}, занятых клеток ${map.occupiedCells}, узлов графа ${map.nav.pos.length}, спавн (${map.spawn.x.toFixed(2)}, ${map.spawn.z.toFixed(2)})`,
  };
}

function testSeam() {
  const shift = Math.round(TILE / map.cfg.cell);
  const a = snapshot(map), n = a.cells;
  const first = map.updateStreaming(TILE / 2 + 1, 0);
  const b = snapshot(map);
  // окно уехало на +TILE: клетка (i, j) нового окна — это (i − shift, j) прежнего
  let diffX = 0, worstX = 0;
  for (let j = 0; j < n; j++) {
    for (let i = shift; i < n; i++) {
      const d = Math.abs(a.top[j * n + i] - b.top[j * n + (i - shift)]);
      if (d > 0) { diffX++; if (d > worstX) worstX = d; }
    }
  }
  const back = map.updateStreaming(-TILE / 2 - 1, 0);
  const restored = Math.abs(map.window.x - SPEC.window.x) < 1e-9 &&
    map.top.every((v, k) => v === a.top[k]);
  const c = snapshot(map);
  map.updateStreaming(0, TILE / 2 + 1);
  const d = snapshot(map);
  let diffZ = 0, worstZ = 0;
  for (let j = shift; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const v = Math.abs(c.top[j * n + i] - d.top[(j - shift) * n + i]);
      if (v > 0) { diffZ++; if (v > worstZ) worstZ = v; }
    }
  }
  map.updateStreaming(0, -TILE / 2 - 1);
  const overlap = (n - shift) * n;
  const passed = !!first && !!back && restored && diffX === 0 && diffZ === 0 &&
    Math.abs(first.dx - TILE) < 1e-9 && first.dz === 0;
  return {
    name: 'Стык тайлов: перекрытие соседних окон даёт тот же верх клетка в клетку',
    passed,
    info: `перекрытие ${overlap} клеток по каждой оси: различий по X ${diffX} (макс ${worstX.toExponential(1)} м), по Z ${diffZ} (макс ${worstZ.toExponential(1)} м), возврат в первое окно бит-в-бит=${restored}`,
  };
}

function testClassIndependence() {
  const tris = map.tris, s = map.scale;
  const w0 = { x: SPEC.window.x, z: SPEC.window.z };
  const w1 = { x: SPEC.window.x + TILE, z: SPEC.window.z };
  const doubleFlips = classFlips(tris, s, w0, w1, false);
  const floatFlips = classFlips(tris, s, w0, w1, true);
  const passed = doubleFlips === 0;
  return {
    name: 'Класс грани «стена или плоскость» не зависит от центра окна',
    passed,
    info: `граней ${tris.count}: смен класса при другом центре окна в двойной точности ${doubleFlips}, при float32-вершинах окна (прежний путь) — ${floatFlips}; порог wallArea ${CONFIG.model.wallArea} м²`,
  };
}

function testUpdateStreaming() {
  const inside = map.updateStreaming(0, 0) === null &&
    map.updateStreaming(TILE / 2, TILE / 2) === null &&
    Math.abs(map.window.x - SPEC.window.x) < 1e-9;
  const spawnBefore = toFile(map, map.spawn.x, map.spawn.z);
  const step = map.updateStreaming(TILE / 2 + 0.1, 0);
  const oneTile = !!step && Math.abs(step.dx - TILE) < 1e-9 && step.dz === 0;
  const jump = map.updateStreaming(4 * TILE + 5, 0);
  const spawnAfterJump = toFile(map, map.spawn.x, map.spawn.z);
  const multi = !!jump && Math.abs(jump.dx - 4 * TILE) < 1e-9 &&
    Math.abs(spawnAfterJump.x - spawnBefore.x) < 1e-6 && Math.abs(spawnAfterJump.z - spawnBefore.z) < 1e-6;
  // возврат: запрос на разницу центров ставит окно ровно на первое положение
  const home = map.updateStreaming(SPEC.window.x - map.window.x, 0);
  const returned = !!home && Math.abs(map.window.x - SPEC.window.x) < 1e-9;
  const spawnHome = toFile(map, map.spawn.x, map.spawn.z);
  const spawnKept = Math.abs(spawnHome.x - spawnBefore.x) < 1e-6 && Math.abs(spawnHome.z - spawnBefore.z) < 1e-6;
  // за покрышкой макета улиц нет — окно туда не ставится
  const beyond = map.updateStreaming(30000, 0);
  const refused = beyond === null && Math.abs(map.window.x - SPEC.window.x) < 1e-9;
  const passed = inside && oneTile && multi && returned && spawnKept && refused;
  return {
    name: 'updateStreaming: null в центральном тайле, сдвиг на выходе, отказ за плитой',
    passed,
    info: `внутри=null=${inside}, шаг +${TILE} м=${oneTile}, длинный прыжок за раз на ${4 * TILE} м=${multi}, возврат в первое окно=${returned}, спавн всё там же=${spawnKept}, окно за покрышкой=${JSON.stringify(beyond)}=${refused}`,
  };
}

function testOpenPositions() {
  const shifted = map.updateStreaming(TILE / 2 + 1, 0);
  const pts = map.openPositions();
  const half = map.half, p = map.plateRect;
  let outsideWindow = 0, outsidePlate = 0, noSupport = 0;
  for (const q of pts) {
    if (Math.abs(q.x) > half || Math.abs(q.z) > half) outsideWindow++;
    if (q.x < p.minX || q.x > p.maxX || q.z < p.minZ || q.z > p.maxZ) outsidePlate++;
    if (Math.abs(map.groundHeightAt(q.x, q.z, q.y) - q.y) > 0.02) noSupport++;
  }
  const nodes = map.nav.pos.length;
  const passed = !!shifted && pts.length > 1000 && nodes > 1000 &&
    outsideWindow === 0 && outsidePlate === 0 && noSupport === 0;
  map.updateStreaming(-TILE / 2 - 1, 0);
  return {
    name: 'Свободные точки после перестановки — в новом окне, на плите и оперты',
    passed,
    info: `окно сдвинуто на ${shifted ? shifted.dx : '—'} м, точек ${pts.length}, узлов графа ${nodes}, за краем окна ${outsideWindow}, за покрышкой ${outsidePlate}, без опоры ${noSupport}`,
  };
}

function testPlateBlocks() {
  const r = CONFIG.radius;
  const p = map.plateRect;
  const outside = map.isBlocked(p.maxX + 0.5, 0, r, map.groundY + 0.02, PLAYER_H) &&
    map.isBlocked(0, p.minZ - 0.5, r, map.groundY + 0.02, PLAYER_H);
  const spawnFree = !map.isBlocked(map.spawn.x, map.spawn.z, r, map.spawn.y + 0.02, PLAYER_H);
  const passed = outside && spawnFree;
  return {
    name: 'За покрышкой макета не пройти, на улице спавна — пройти',
    passed,
    info: `за краем плиты заблокировано=${outside}, спавн свободен=${spawnFree}; плита в метрах текущего окна (${p.minX.toFixed(0)}…${p.maxX.toFixed(0)})×(${p.minZ.toFixed(0)}…${p.maxZ.toFixed(0)}), окно ±${map.half} м — плита шире, её край важен у границы города`,
  };
}

function testWalkAcrossSeam() {
  const startFile = toFile(map, map.spawn.x, map.spawn.z);
  const exitFile = { x: SPEC.window.x + EXIT_LOCAL.x, z: SPEC.window.z + EXIT_LOCAL.z };
  const to = toLocal(map, exitFile.x, exitFile.z);
  const res = walkStreamed(map, { x: map.spawn.x, z: map.spawn.z }, to);
  const endFile = toFile(map, res.pos.x, res.pos.z);
  const near = Math.hypot(endFile.x - exitFile.x, endFile.z - exitFile.z);
  const spawnFile = toFile(map, map.spawn.x, map.spawn.z);
  const passed = !res.stuck && res.recenters >= 2 && res.distance > 700 &&
    res.distance < 1800 && near <= map.cfg.navStep &&
    Math.abs(spawnFile.x - startFile.x) < 1e-6 && Math.abs(spawnFile.z - startFile.z) < 1e-6;
  return {
    name: 'Пешеходный маршрут A → B через границу окна проходится',
    passed,
    info: `${res.distance.toFixed(0)} м, перестановок ${res.recenters}, тупик=${res.stuck ? `${res.stuck.reason} в (${res.stuck.x.toFixed(0)}, ${res.stuck.z.toFixed(0)})` : 'нет'}, финиш в ${near.toFixed(1)} м от B, спавн в рамке файла (${spawnFile.x.toFixed(1)}, ${spawnFile.z.toFixed(1)}) против (${startFile.x.toFixed(1)}, ${startFile.z.toFixed(1)}), тайл ${TILE} м`,
  };
}

function testMeshRecycles() {
  const scene = new THREE.Scene();
  map.build(scene);
  const children0 = scene.children.length;
  const proto = THREE.BufferGeometry.prototype;
  const origDispose = proto.dispose;
  let disposed = 0;
  const counts = [];
  proto.dispose = function counting() { disposed++; return origDispose.call(this); };
  try {
    for (let k = 0; k < 5; k++) { map.updateStreaming(TILE / 2 + 1, 0); counts.push(scene.children.length); }
    for (let k = 0; k < 5; k++) { map.updateStreaming(-(TILE / 2 + 1), 0); counts.push(scene.children.length); }
  } finally {
    proto.dispose = origDispose;
  }
  const maxSeen = Math.max(...counts);
  const passed = disposed >= 10 && maxSeen <= children0 + 40 &&
    scene.children.length <= children0 + 40 && map.modelMeshes.length <= maxSeen + 40;
  return {
    name: 'Меши старого окна снимаются и dispose()-нятся (нет утечки на 10 перестановках)',
    passed,
    info: `объектов на сцене при первом build ${children0}, разброс после 10 перестановок ${counts.join(', ')}, максимум ${maxSeen}, вызовов geometry.dispose ${disposed}, мешей карты сейчас ${map.modelMeshes.length}`,
  };
}

/**
 * Прогоняет автотесты стриминга и печатает отчёт в консоль.
 * @returns {Promise<{passed:number, total:number, results:Array<{name:string,passed:boolean,info:string}>}>}
 */
export async function runStreamTests() {
  const t0 = performance.now();
  map = await makeMap();
  const buildMs = performance.now() - t0;
  const tests = [
    testContract,
    testBuckets,
    testSameWindowAsModelMap,
    testDeterminism,
    testSeam,
    testClassIndependence,
    testUpdateStreaming,
    testOpenPositions,
    testPlateBlocks,
    testWalkAcrossSeam,
    testMeshRecycles,
  ];
  const results = [];
  for (const fn of tests) {
    const s = performance.now();
    try {
      const r = await fn();
      results.push({ ...r, info: `${r.info} [${Math.round(performance.now() - s)} мс]` });
    } catch (e) {
      results.push({ name: fn.name, passed: false, info: `ошибка: ${e && e.message}` });
    }
  }
  const passed = results.filter(r => r.passed).length;
  if (typeof console !== 'undefined') {
    console.group('Автотесты стриминга города (StreamedModelMap)');
    console.log(`первое окно ${Math.round(buildMs)} мс`);
    for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'} — ${r.name}: ${r.info}`);
    console.log(`Итого: ${passed}/${results.length}`);
    console.groupEnd();
  }
  return { passed, total: results.length, results };
}
