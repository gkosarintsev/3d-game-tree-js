/**
 * Сюита контракта карты по всему реестру глав: `await import('/tests/level-contract.test.js')`
 * и `await runLevelContractTests()` из консоли `http://localhost:8124/3d-game.html`.
 *
 * В отличие от `tests/json2-level.test.js` и `tests/track-city.test.js`, которые
 * знают одну главу и её числа, здесь проверяется свойство **любой** главы реестра:
 * собранная карта держит члены контракта, спавн и точка B лежат на плите, маршрут
 * A→B стоит на своих опорах, сеть одна связная, врагам хватает узлов для респавна,
 * а `build`/`dispose` не оставляет в сцене мусора. Новая глава (`level-14`) попадает
 * в сюиту сама — достаточно строки в `src/levels/index.js`, правки здесь не нужны.
 *
 * Maps собираются тем же выбором `kind`, что и движок (`window.game.createMap`),
 * потому что ловить здесь нужно в том числе опечатку в `kind`: при неизвестном
 * значении `Game.createMap` берёт `createTownMap` (src/game.js:94) и глава
 * собралась бы улицей без геометрии — молча.
 */
import * as THREE from 'three';
import { LEVELS } from '../src/levels/index.js';
import { CONFIG } from '../src/config.js';
import { preloadMapAsset } from '../src/glb.js';

/** Обязательные методы контракта (AGENTS.md, «Контракт карты»). */
const METHODS = ['groundHeightAt', 'isBlocked', 'openPositions', 'worldToNormalized',
  'build', 'drawMinimap', 'raySolid', 'resolveSphere', 'rayHitDistance', 'findPath', 'randomNavPoint'];

/** Обязательные данные контракта: плита, спавн, габарит содержимого, солиды. */
const DATA = ['width', 'depth', 'spawn', 'bounds', 'solids'];

/** Опциональные члены — движок отличает их по наличию, а не по `map.kind`. */
const OPTIONAL = ['updateStreaming', 'debugIds'];

/**
 * Дальность выбора точки респавна — ровно то число, с которым работает движок:
 * `randomNavPoint(player.x, player.z, 180)` и приём узла при `d ≥ spawnDistance`
 * (src/enemies.js:228…231). Сюита требует, чтобы такой узел вообще существовал в
 * достаточном числе, иначе возрождённый враг стоит на месте.
 */
const RESPAWN_MAX = 180;
const RESPAWN_MIN = CONFIG.enemies.spawnDistance;

/** Допуск «узел стоит на своей опоре»: шов картинки пола плюс slack пробы. */
const SUPPORT_TOL = Math.max(CONFIG.jsonMap.floorRise, 0.05);

/** Рост тела, с которым движок мерит колонки (`isBlocked` в src/enemies.js). */
const BODY_H = 1.9;

/**
 * Мера «узлов респавна»: `need = врагов × 3` — та же тройка, что стояла здесь
 * и раньше: узел нужен каждому врагу на возрождение и два в запасе на дрожь
 * выбора (`randomNavPoint` берёт узел случайно и промахивается мимо аннулова).
 */
const ROOM_PER_ENEMY = 3;

/** Узел A→B обязан дойти до маяка: радиус цели из определения главы. */
const exitRadiusOf = level => level.gameplay?.exitRadius ?? CONFIG.terrain.exitRadius;

const errors = [];
const cache = new Map();

/**
 * Карта и сцена главы, собранные один раз на сюиту. Строится напрямую через
 * фабрику движка, без `Game`: здесь не нужны ни HUD, ни персонаж, ни pointer
 * lock, а `console.error` по ходу сборки собирается в общий список (его проверяет
 * последняя сюжетка).
 */
async function chapter(index) {
  if (cache.has(index)) return cache.get(index);
  const level = LEVELS[index];
  const factory = window.game?.createMap?.bind(window.game);
  if (!factory) throw new Error('сюита собирает главы фабрикой движка; откройте 3d-game.html, где main.js создал window.game');
  const realError = console.error;
  console.error = (...a) => { errors.push(`глава ${index + 1}: ${a.map(String).join(' ')}`); realError(...a); };
  try {
    await preloadMapAsset(level.map); // единственный await — правило «загрузка ассета» в AGENTS.md
    const map = factory(level.map);
    const scene = new THREE.Scene();
    map.build(scene);
    const ctx = { level, map, scene };
    cache.set(index, ctx);
    return ctx;
  } finally {
    console.error = realError;
  }
}

/** Индекс узла под точкой (тот же `nearestNode`, что использует движок). */
const nodeAt = (map, x, y, z) => map.nav.nearestNode(x, y, z);

/** Опора под узлом: проба с самой отметки узла с запасом на шов картинки. */
function supportUnder(map, x, y, z) {
  return map.groundHeightAt(x, z, y + SUPPORT_TOL);
}

/**
 * Индекс узла по ссылке: `NavGraph.findPath` возвращает элементы `nav.pos`
 * (src/nav-graph.js:159, 176…), поэтому узел маршрута опознаётся по идентичности
 * объекта. Повторный `nearestNode` по координате для этого не годится: у двух
 * совпадающих в плане узлов (решётка улицы и палуба) он отвечает другой индекс, и
 * законное ребро выглядит прыжком.
 */
function nodeIndexByRef(map) {
  const byRef = new Map();
  map.nav.pos.forEach((p, i) => byRef.set(p, i));
  return byRef;
}

/** Узлы графа, достижимые от точки появления, — как их оставил `_pruneToSpawn`. */
function reachableFrom(map, start) {
  const seen = new Uint8Array(map.nav.pos.length);
  if (start < 0) return seen;
  const queue = [start];
  seen[start] = 1;
  for (let h = 0; h < queue.length; h++) {
    for (const nb of map.nav.adj[queue[h]]) if (!seen[nb]) { seen[nb] = 1; queue.push(nb); }
  }
  return seen;
}

/** Точка B на своей опоре — по тому же приёму, что в `tests/json2-level.test.js`. */
function exitNode(ctx) {
  const e = ctx.level.gameplay.exit;
  const map = ctx.map;
  return { x: e.x, y: map.groundHeightAt(e.x, e.z, 500), z: e.z };
}

/** Главы-переходы A→B: у них есть `gameplay.exit`. */
const exitChapters = () => LEVELS
  .map((level, i) => ({ level, i }))
  .filter(({ level }) => level.gameplay?.goal === 'exit' && level.gameplay?.exit);

// --------------------------------------------------------------------- сюжетки

/** Члены контракта на месте и правильной формы — по каждой главе реестра. */
async function testContractMembers() {
  const bad = [];
  for (let i = 0; i < LEVELS.length; i++) {
    const { map } = await chapter(i);
    for (const m of METHODS) if (typeof map[m] !== 'function') bad.push(`${i + 1}: метода ${m} нет`);
    for (const d of DATA) if (map[d] === undefined) bad.push(`${i + 1}: члена данных ${d} нет`);
    if (!Number.isFinite(map.width) || !Number.isFinite(map.depth)) bad.push(`${i + 1}: плита не числа`);
    if (!Array.isArray(map.solids)) bad.push(`${i + 1}: solids не массив`);
    if (!Number.isFinite(map.spawn?.x)) bad.push(`${i + 1}: спавна без координат нет`);
    for (const b of ['minX', 'maxX', 'minZ', 'maxZ']) {
      if (!Number.isFinite(map.bounds?.[b])) bad.push(`${i + 1}: bounds.${b} не число`);
    }
  }
  return { name: 'contract-members', passed: bad.length === 0, info: bad.slice(0, 6).join(' | ') || `${LEVELS.length} глав держат ${METHODS.length + DATA.length} членов контракта` };
}

/**
 * Неизвестный `kind` у главы собрался бы улицей без геометрии (src/game.js:94),
 * поэтому проверяется вывод фабрики, а не только наличие методов. Опциональные
 * члены при этом сверяются именно по `typeof`: правила AGENTS.md запрещают
 * движку различать их по `map.kind`.
 */
async function testKindSelectsImplementation() {
  const bad = [];
  for (let i = 0; i < LEVELS.length; i++) {
    const { map } = await chapter(i);
    const name = map.constructor.name;
    const kind = LEVELS[i].map?.kind;
    if (!kind && name !== 'TownMap') bad.push(`${i + 1}: без kind ожидался TownMap, получен ${name}`);
    if (kind && kind !== 'town' && name === 'TownMap') {
      bad.push(`${i + 1}: kind '${kind}' дал TownMap — опечатка в kind или в таблице фабрики`);
    }
    for (const m of OPTIONAL) {
      const present = typeof map[m] === 'function';
      if (kind === 'stream' && m === 'updateStreaming' && !present) bad.push(`${i + 1}: стримящая карта без updateStreaming`);
      if (['json', 'json2'].includes(kind) && m === 'debugIds' && !present) bad.push(`${i + 1}: карта из брифа без debugIds`);
    }
  }
  return { name: 'kind-and-optional-members', passed: bad.length === 0, info: bad.slice(0, 5).join(' | ') || 'фабрика выбирает реализацию по kind, опциональные члены различаются по typeof' };
}

/** Спавн, точка B и точки объектов — в плите уровня и со своей опорой. */
async function testPointsOnPlate() {
  const bad = [];
  for (let i = 0; i < LEVELS.length; i++) {
    const { map, level } = await chapter(i);
    // для движка стримящий уровень = активное окно (`width`/`depth`), а габарит
    // макета открыт только в `cityBounds` (AGENTS.md, «Внешние ассеты уровня»),
    // поэтому точка B главы 4 лежит «за окном» законно: до неё движок доходит
    // перестановкой окна, и это сюжетка tests/stream-map.test.js
    const plate = typeof map.updateStreaming === 'function' && map.cityBounds
      ? { x: (map.cityBounds.maxX - map.cityBounds.minX) / 2, z: (map.cityBounds.maxZ - map.cityBounds.minZ) / 2 }
      : { x: map.width / 2, z: map.depth / 2 };
    const check = (label, p) => {
      if (!Number.isFinite(p?.x) || !Number.isFinite(p?.z)) { bad.push(`${i + 1}: ${label} без координат`); return; }
      if (Math.abs(p.x) > plate.x || Math.abs(p.z) > plate.z) {
        bad.push(`${i + 1}: ${label} (${p.x.toFixed(1)}, ${p.z.toFixed(1)}) за пределами ±${plate.x.toFixed(0)}/${plate.z.toFixed(0)} — там isBlocked истинен`);
      }
      const y = map.groundHeightAt(p.x, p.z, 500);
      if (!Number.isFinite(y)) bad.push(`${i + 1}: ${label} — groundHeightAt дал ${y}`);
    };
    check('spawn', map.spawn);
    if (level.gameplay?.goal === 'exit' && level.gameplay.exit) check('gameplay.exit', level.gameplay.exit);
    // `openPositions` кормит расстановку объектов и пул огней — значит, у точки
    // обязана быть опора. То, что в габарите тела там не пройти (лампа под
    // эстакадой, фонарь на наклоне), законно и сюда не входит: замер глав 12–13
    // дал 254 и 111 опорных отметок, расходящихся с точкой объекта на 0,11…0,53 м,
    // — это наклонные настилы и верхняя проступь марша, а не висящий в воздухе
    // предмет, поэтому пределом здесь служит подъём ноги `CONFIG.building.stepUp`
    let floating = 0;
    for (const p of map.openPositions()) {
      const g = map.groundHeightAt(p.x, p.z, 500);
      if (!Number.isFinite(g)) { bad.push(`${i + 1}: openPositions отдала точку без опоры`); break; }
      if (p.y - g > CONFIG.building.stepUp) floating++;
    }
    if (floating) bad.push(`${i + 1}: точек объектов выше высшей опоры больше чем на подъём ноги — ${floating}`);
  }
  return { name: 'points-on-plate', passed: bad.length === 0, info: bad.slice(0, 5).join(' | ') || 'спавн, B и точки объектов лежат в плите и имеют опору' };
}

/**
 * Маршрут A→B по главам-переходам: существует, идёт по рёбрам графа (а не
 * телепортируется узлами), кончается у маяка, стоит на опорах и не длиннее
 * прямой в десять раз.
 *
 * Предел «узел на опоре» — `CONFIG.building.stepUp` (0,6 м), а не шов картинки
 * пола: замер дал узлы, расходящиеся со своей опорой на 0,466…0,534 м в главах
 * 9, 12 и 13, — это верхняя проступь марша, которая по правилу AGENTS.md
 * останавливается на один подъём ниже своей отметки, и узлы наклонных настилов.
 * Порог тоньше подъёма ноги краснеет на легальной геометрии.
 *
 * Стримящая глава (4) пропущена: для движка её уровень = активное окно, и маршрут
 * за пределы окна не строится — это проверяет `tests/stream-map.test.js`.
 */
async function testRouteAtoB() {
  const bad = [];
  const stats = [];
  const skipped = [];
  for (const { i } of exitChapters()) {
    const { map, level } = await chapter(i);
    if (typeof map.updateStreaming === 'function') { skipped.push(i + 1); continue; }
    const from = map.spawn;
    const to = exitNode({ map, level });
    const path = map.findPath(from, to);
    if (!path || path.length < 2) { bad.push(`${i + 1}: маршрута A→B нет`); continue; }
    const last = path[path.length - 1];
    const toExit = Math.hypot(last.x - to.x, last.z - to.z);
    if (toExit > exitRadiusOf(level) + 4) {
      bad.push(`${i + 1}: конец маршрута в ${toExit.toFixed(1)} м от B — дальше допуска цели`);
    }
    let len = 0;
    let off = 0;
    let worst = 0;
    let brokenEdge = 0;
    const byRef = nodeIndexByRef(map);
    let prev = byRef.get(path[0]);
    for (let k = 1; k < path.length; k++) {
      const p = path[k];
      len += Math.hypot(p.x - path[k - 1].x, p.y - path[k - 1].y, p.z - path[k - 1].z);
      const g = supportUnder(map, p.x, p.y, p.z);
      const delta = Math.abs(g - p.y);
      if (delta > worst) worst = delta;
      if (delta > CONFIG.building.stepUp) off++;
      const here = byRef.get(p);
      if (prev === undefined || here === undefined || !map.nav.adj[prev].includes(here)) brokenEdge++;
      prev = here;
    }
    if (off > 0) bad.push(`${i + 1}: узлов вне опоры ${off} из ${path.length}, худшее расхождение ${worst.toFixed(3)} м`);
    if (brokenEdge > 0) bad.push(`${i + 1}: шагов вне рёбер графа ${brokenEdge} из ${path.length - 1} — маршрут телепортируется`);
    const straight = Math.hypot(to.x - from.x, to.z - from.z);
    const budget = straight * 10 + 50;
    if (len > budget) bad.push(`${i + 1}: маршрут ${len.toFixed(0)} м против прямой ${straight.toFixed(0)} м — бюджет ${budget.toFixed(0)} м`);
    stats.push(`${i + 1}: ${path.length} узлов / ${len.toFixed(0)} м, опора ±${worst.toFixed(2)} м`);
  }
  const note = skipped.length ? ` (главы ${skipped.join(', ')} — стриминг, вне окна)` : '';
  return { name: 'route-ato-b', passed: bad.length === 0, info: bad.slice(0, 5).join(' | ') || `маршруты${note}: ${stats.join('; ')}` };
}

/** Одна связная сеть: узел, до которого человек не дойдёт, врагу не нужен. */
async function testSingleConnectedNetwork() {
  const bad = [];
  for (let i = 0; i < LEVELS.length; i++) {
    const { map } = await chapter(i);
    const total = map.nav.pos.length;
    if (!total) { bad.push(`${i + 1}: графа навигации нет`); continue; }
    const seen = reachableFrom(map, nodeAt(map, map.spawn.x, map.spawn.y, map.spawn.z));
    let orphan = 0;
    for (let k = 0; k < total; k++) if (!seen[k]) orphan++;
    if (orphan) bad.push(`${i + 1}: изолированных узлов ${orphan} из ${total}`);
  }
  return { name: 'one-connected-network', passed: bad.length === 0, info: bad.slice(0, 5).join(' | ') || 'каждая глава держит одну связную сеть от спавна' };
}

/** Врагам хватает узлов для возрождения (число врагов — данные главы). */
async function testRespawnRoom() {
  const bad = [];
  for (let i = 0; i < LEVELS.length; i++) {
    const { map, level } = await chapter(i);
    const gp = level.gameplay ?? {};
    const humans = gp.enemies?.count ?? CONFIG.enemies.count;
    const aliens = gp.alienEnemies?.count ?? CONFIG.alienEnemies.count;
    let room = 0;
    let roomHuman = 0;
    let roomAlien = 0;
    for (const p of map.nav.pos) {
      const d = Math.hypot(p.x - map.spawn.x, p.z - map.spawn.z);
      if (d < RESPAWN_MIN || d >= RESPAWN_MAX) continue;
      room++;
      // Узел считается пригодным, если на нём помещается тело того размера,
      // который движок подставит в `isBlocked`: решётка отступает от стены на
      // радиус человека, поэтому узлы, тесные для Чужого (0,5), — не редкость,
      // и общая мера для обеих ролей браковала бы законные карты.
      if (!map.isBlocked(p.x, p.z, CONFIG.radius, p.y + 0.02, BODY_H)) roomHuman++;
      if (!map.isBlocked(p.x, p.z, CONFIG.alien.radius, p.y + 0.02, BODY_H)) roomAlien++;
    }
    const need = (humans + aliens) * ROOM_PER_ENEMY;
    if (room < need) {
      bad.push(`${i + 1}: узлов респавна ${room} при нужде ${need} (врагов ${humans + aliens})`);
    }
    if (roomHuman < humans * ROOM_PER_ENEMY) {
      bad.push(`${i + 1}: узлов, свободных человеком (r ${CONFIG.radius}), ${roomHuman} `
        + `при нужде ${humans * ROOM_PER_ENEMY}`);
    }
    if (roomAlien < aliens * ROOM_PER_ENEMY) {
      bad.push(`${i + 1}: узлов, свободных Чужим (r ${CONFIG.alien.radius}), ${roomAlien} `
        + `при нужде ${aliens * ROOM_PER_ENEMY}`);
    }
  }
  return {
    name: 'respawn-room',
    passed: bad.length === 0,
    info: bad.slice(0, 5).join(' | ')
      || `всем главам хватает узлов в ${RESPAWN_MIN}…${RESPAWN_MAX} м от спавна, `
        + 'и каждый из них по отдельности свободен телом своей роли',
  };
}

/**
 * Утечки: карта, построенная в свежую сцену, обязана оставить её пустой после
 * `dispose()`, иначе перезагрузка главы накапливает меши предыдущей. Проверяется
 * и то, что повторная сборка даёт столько же объектов, сколько первая, — рост
 * числа мешей от прогона к прогону и есть течь.
 */
async function testNoLeaks() {
  const bad = [];
  for (let i = 0; i < LEVELS.length; i++) {
    const level = LEVELS[i];
    const factory = window.game.createMap.bind(window.game);
    await preloadMapAsset(level.map);
    const counts = [];
    for (let round = 0; round < 2; round++) {
      const scene = new THREE.Scene();
      const map = factory(level.map);
      map.build(scene);
      counts.push(scene.children.length);
      if (typeof map.dispose !== 'function') { bad.push(`${i + 1}: у карты нет dispose()`); break; }
      map.dispose();
      if (scene.children.length !== 0) {
        bad.push(`${i + 1}: после dispose() в сцене осталось ${scene.children.length} объектов`);
      }
    }
    if (counts.length === 2 && counts[0] !== counts[1]) {
      bad.push(`${i + 1}: вторая сборка дала ${counts[1]} объектов против ${counts[0]} — схема зависит от порядка прогонов`);
    }
  }
  return { name: 'no-leaks', passed: bad.length === 0, info: bad.slice(0, 5).join(' | ') || 'build/dispose/build: сцена возвращается к пустоте, число объектов не растёт' };
}

/** Сборка любой главы не должна печатать console.error. */
function testNoConsoleErrors() {
  return {
    name: 'no-console-errors',
    passed: errors.length === 0,
    info: errors.length ? errors.slice(0, 3).join(' | ') : 'ошибок консоли при сборке глав нет',
  };
}

// ----------------------------------------------------------------------- запуск

const tests = [
  testContractMembers,
  testKindSelectsImplementation,
  testPointsOnPlate,
  testRouteAtoB,
  testSingleConnectedNetwork,
  testRespawnRoom,
  testNoLeaks,
];

/**
 * Гоняет все сюжетки и возвращает `{ passed, total, results }` — тот же формат,
 * что у остальных файлов каталога `tests/`.
 */
export async function runLevelContractTests() {
  const results = [];
  for (const fn of tests) {
    try {
      results.push(await fn());
    } catch (e) {
      results.push({ name: fn.name, passed: false, info: `ошибка: ${e.message}` });
    }
  }
  results.push(testNoConsoleErrors());

  const passed = results.filter(r => r.passed).length;
  console.group('Контракт карты по всем главам');
  for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'} — ${r.name}: ${r.info}`);
  console.log(`Итого: ${passed}/${results.length}`);
  console.groupEnd();
  return { passed, total: results.length, results };
}
