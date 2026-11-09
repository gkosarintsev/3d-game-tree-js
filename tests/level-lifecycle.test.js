/**
 * Жизненный цикл каждой главы — движком, а не собранной картой:
 * `await import('/tests/level-lifecycle.test.js')`
 * и `await runLevelLifecycleTests()` из консоли `http://localhost:8124/3d-game.html`.
 * Отдельная глава: `await runLevelLifecycleTests(12)` или `TEST_LEVEL=12; await runLevelLifecycleTests()`.
 *
 * `tests/level-contract.test.js` мерит собранную карту, но не игру. Здесь же —
 * то, что может показать только `Game._loadLevel`: глава доходит до состояния
 * `'chapter'`, сущности соответствуют брифу (число врагов, цель, монеты, машины),
 * заспавненные враги стоят ровно на узлах графа и на своих опорах, а
 * возвращение к главе после полного круга не оставляет в памяти буферов
 * предыдущей. Новая глава
 * попадает в сюиту сама — она в реестре `src/levels/index.js`, и цикл проходит по
 * нему, а не по списку номеров.
 *
 * Движок здесь вызывается напрямую (`window.game._loadLevel`), и это осознанно:
 * `_buildLevel` — единственный путь, где `createMap` встречается с HUD, целью,
 * монетами, врагами и кузовами. Ошибку в этой склейке автотест карты не увидит:
 * например, глава без `gameplay.exit` при `goal: 'exit'` даёт маяк `null`, и
 * пройти её нельзя, а карта при этом безупречна.
 *
 * Симуляция не крутится: `_tick` ведёт врагов и игрока только при
 * `state === 'playing'` (src/game.js:414), а до захвата курсора глава стоит на
 * интертитре. Значит, позиции врагов — ровно те, что им дал `Enemies` при сборке,
 * и допуск «нога на опоре» здесь строгий (в сюите главы с ходом он
 * краснеет на транзите через ступень именно потому, что там 600 кадров хода).
 */
import { LEVELS, LEVEL_NUMBERS } from '../src/levels/index.js';
import { CONFIG } from '../src/config.js';
import { AlienEnemy } from '../src/enemies.js';
import { parseLevelFilter, selectedIndices, filterLabel } from './level-filter.js';

/** Обязательные члены контракта — те же, что мерит `level-contract`. */
const METHODS = ['groundHeightAt', 'isBlocked', 'openPositions', 'worldToNormalized',
  'build', 'drawMinimap', 'raySolid', 'resolveSphere', 'rayHitDistance', 'findPath', 'randomNavPoint'];
const DATA = ['width', 'depth', 'spawn', 'bounds', 'solids'];

/** Рост тела врага — то же число, с которым `isBlocked` зовёт проба колонок ночного макета. */
const BODY_H = 1.9;

/** Допуск «нога на опоре»: шов картинки пола, больше на стоящем теле нечего. */
const SUPPORT_TOL = Math.max(CONFIG.jsonMap.floorRise, 0.05);

/**
 * «Враг стоит на своей опоре» меряется не абсолютным допуском, а **максимумом
 * опоры среди узлов графа самой главы**: решётка стоит шагом 6 м и берёт y узла
 * со своей опоры, но клетка колонок шажнее решётки, поэтому у марша лестницы
 * узел законно стоит на нижней ступени, а `groundHeightAt` отвечает верх
 * колонки. Замер по главам реестра (полный обход узлов): карты из брифа дают
 * 35…534 узла с отклонением 0,05…0,633 м при нулевых отклонениях у карт с
 * плоской опорой — то есть абсолютный порог «0,05» краснел бы на законных картах,
 * а «0,7» не краснел бы ни на одной. Сравнение с собственным графом ловит именно
 * то, ради чего сюжетка написана: тело глубже любой опоры, которую карта
 * предлагает.
 */

/** Зазор «враг стоит ровно на узле графа»: `respawn` берёт узел без округления. */
const NODE_GAP = 0.02;

const errors = [];
let pass = null;
let indices = null;
let label = '';
let probeIndex = 0;

/** Индексы глав для прогона: все или отфильтрованные по номеру. */
function chapters() {
  return indices ?? LEVEL_NUMBERS.map((_, i) => i);
}

/** Кадр (точнее два) — чтобы `renderer.info` досчитал буферы свежей сцены. */
const twoFrames = () => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done)));

/**
 * Один проход по всему реестру: загрузили главу, сняли наблюдения, идём дальше.
 * Движок при каждой загрузке сам выгружает предыдущую карту (`_initScene` →
 * `map.dispose()`), поэтому в памяти живёт одна игровая сцена, а пройденный круг
 * служит вторым визитом: главу 1 потом загружаем ещё раз и сверяем бюджет.
 */
async function runPass() {
  const game = window.game;
  if (!game) throw new Error('сюита гоняет жизненный цикл движком; откройте 3d-game.html, где main.js создал window.game');
  const realError = console.error;
  console.error = (...a) => { errors.push(String(a.map(String).join(' '))); realError(...a); };
  const visits = [];
  const list = chapters();
  try {
    for (const index of list) {
      const t0 = performance.now();
      await game._loadLevel(index);
      await twoFrames();
      visits.push(observe(index, game, Math.round(performance.now() - t0)));
    }
    // два захода пробной главы подряд: сравнение «до круга» и «после
    // круга» ловит не течь, а общий кэш — кэш `.glb` (`src/glb.js` по URL) и
    // модульные материалы/геометрии `src/props.js` переживают выгрузку главы по
    // правилу AGENTS.md, поэтому после круга глава 1 законно тяжелее самой себя
    // до него. Соседние заходы одной главы при прогретых кэшах обязаны совпасть.
    // При фильтре: проба — глава 1, если она в выборке, иначе первая выбранная.
    probeIndex = list.includes(0) ? 0 : list[0];
    for (let round = 0; round < 2; round++) {
      await game._loadLevel(probeIndex);
      await twoFrames();
      visits.push(observe(probeIndex, game, null));
    }
  } finally {
    console.error = realError;
  }
  return visits;
}

/**
 * Мерки опоры по графу главы: худшее отклонение узла от своей опоры и сколько
 * узлов свободно телом человека. Обе нужны сюжетке как **собственный предел
 * карты**, а не как выдуманный порог, — см. комментарий у `SUPPORT_TOL`.
 *
 * У открытого мира считаются только **годные** узлы (`navFit`): граф append-only,
 * и в списке остаётся свес решётки за край загруженной клетки (замер главы 14
 * сразу после `_loadLevel` — 10 узлов из 3 959). Их опора — «пол мира» под
 * незастроенной клеткой, и отклонение в 4 м раздуло бы предел главы настолько,
 * что проверка «враг не глубже любого узла карты» перестала бы ловить хоть
 * что-нибудь.
 */
function nodeSupportStats(map) {
  const fit = typeof map.navFit === 'function' ? map.navFit : null;
  let worstOff = 0;
  let blockedNodes = 0;
  let nodes = 0;
  for (let k = 0; k < map.nav.pos.length; k++) {
    if (fit && !fit(k)) continue;
    const n = map.nav.pos[k];
    nodes++;
    const off = Math.abs(map.groundHeightAt(n.x, n.z, n.y + SUPPORT_TOL) - n.y);
    if (off > worstOff) worstOff = off;
    if (map.isBlocked(n.x, n.z, CONFIG.radius, n.y + 0.02, BODY_H)) blockedNodes++;
  }
  return { nodes, worstOff, blockedNodes };
}

/** Что сюжетка наблюдает в главе сразу после `_loadLevel`. */
function observe(index, game, ms) {
  const level = LEVELS[index];
  const gp = level.gameplay ?? {};
  const map = game.map;
  const nodeStats = map ? nodeSupportStats(map) : null;
  // узел ищется тем же предикатом, каким его ищет движок (`randomNavPoint` и
  // `respawn` зовут `nearestNode` с `navFit`): без него ближайшим к телу мог бы
  // оказаться свес решётки за край загруженной клетки, и зазор «враг на узле»
  // мерился бы до узла, которым карта не разрешает пользоваться
  const fit = map && typeof map.navFit === 'function' ? map.navFit : null;
  const enemies = (map ? game.enemies?.items ?? [] : []).map(e => {
    const alien = e instanceof AlienEnemy;
    const feet = alien ? e.position.y - CONFIG.alien.radius : e.feetY;
    const radius = e.cfg?.radius ?? CONFIG.radius;
    const node = map.nav.nearestNode(e.position.x, feet, e.position.z, fit);
    const np = map.nav.pos[node];
    return {
      alien,
      finite: Number.isFinite(feet + e.position.x + e.position.z),
      nodeGap: np ? Math.hypot(np.x - e.position.x, np.y - feet, np.z - e.position.z) : Infinity,
      off: Math.abs(map.groundHeightAt(e.position.x, e.position.z, feet + SUPPORT_TOL) - feet),
      blocked: map.isBlocked(e.position.x, e.position.z, radius, feet + 0.02, BODY_H),
    };
  });
  return {
    index,
    name: level.name,
    ms,
    state: game.state,
    levelIndex: game.levelIndex,
    mapHere: !!map && game.level === level,
    missing: map ? [...METHODS, ...DATA].filter(k => map[k] === undefined) : ['нет this.map'],
    optional: map ? Object.fromEntries(['updateStreaming', 'debugIds', 'streamStep', 'isBuiltAt']
      .map(k => [k, typeof map[k] === 'function'])) : {},
    exit: { want: gp.goal === 'exit', has: !!game.exit },
    coins: { want: gp.goal === 'exit' ? 0 : (gp.totalCoins ?? CONFIG.totalCoins), has: game.coins?.total ?? -1 },
    cars: { want: gp.cars?.count ?? 0, has: game.cars?.count ?? 0 },
    enemies: {
      want: (gp.enemies?.count ?? CONFIG.enemies.count) + (gp.alienEnemies?.count ?? CONFIG.alienEnemies.count),
      items: enemies,
    },
    nodeStats,
    sceneChildren: game.scene?.children.length ?? -1,
    geometries: game.renderer?.info.memory.geometries ?? -1,
    textures: game.renderer?.info.memory.textures ?? -1,
  };
}

/** Проход откладывается на первый запрос и переиспользуется всеми сюжетками. */
async function visits() {
  if (!pass) pass = runPass();
  return pass;
}

/** Глава обязана дойти до интертитра: `_loadLevel` при ошибке остаётся на `'loading'`. */
async function testEveryChapterLoads() {
  const v = await visits();
  const bad = [];
  for (const x of v) {
    if (x.state !== 'chapter') bad.push(`${LEVEL_NUMBERS[x.index]}: состояние '${x.state}' вместо 'chapter' (ошибка сборки)`);
    if (x.levelIndex !== x.index) bad.push(`${LEVEL_NUMBERS[x.index]}: levelIndex ${x.levelIndex}`);
    if (!x.mapHere) bad.push(`${LEVEL_NUMBERS[x.index]}: движок держит не ту главу или не держит карту`);
    if (x.missing.length) bad.push(`${LEVEL_NUMBERS[x.index]}: карте игры не хватает ${x.missing.join(', ')}`);
  }
  const slowest = v.filter(x => x.ms !== null).sort((a, b) => b.ms - a.ms)[0];
  return {
    name: 'every-chapter-loads',
    passed: bad.length === 0,
    info: bad.slice(0, 5).join(' | ')
      || `${chapters().length} глав${label} загружаются до 'chapter' без ошибок консоли${slowest ? `; дороже всех ${slowest.name} — ${slowest.ms} мс` : ''}`,
  };
}

/** Сущности главы = данные брифа: цель, монеты, кузова, число врагов. */
async function testEntitiesMatchBrief() {
  const v = await visits();
  const bad = [];
  for (const x of v) {
    if (x.exit.want !== x.exit.has) {
      bad.push(`${LEVEL_NUMBERS[x.index]}: цель exit=${x.exit.want}, маяк в игре ${x.exit.has ? 'есть' : 'нет'}`);
    }
    if (x.coins.want !== x.coins.has) bad.push(`${LEVEL_NUMBERS[x.index]}: монет ${x.coins.has} при замысле ${x.coins.want}`);
    if (x.cars.want !== x.cars.has) bad.push(`${LEVEL_NUMBERS[x.index]}: кузовов ${x.cars.has} при данных ${x.cars.want}`);
    if (x.enemies.items.length !== x.enemies.want) {
      bad.push(`${LEVEL_NUMBERS[x.index]}: врагов ${x.enemies.items.length} при данных ${x.enemies.want}`);
    }
  }
  return { name: 'entities-match-brief', passed: bad.length === 0, info: bad.slice(0, 5).join(' | ') || 'цель, монеты, кузова и число врагов совпадают с брифом во всех главах' };
}

/**
 * Заспавненные враги: тела конечны, каждый стоит ровно на узле графа, и нога ни
 * глубже опоры, чем худший узел **этой** карты (см. `SUPPORT_TOL`). Строже, чем
 * проба ночного макета, — здесь никто никуда не шёл, и транзита через ступень, который
 * тот сюжет ловит в 600 кадрах хода, быть не может. Маршрут человека сюда не
 * входит: `Enemy` берёт точку блуждания на первом `update`, а до интертитра
 * симуляция не идёт (src/game.js:414) — проходовому маршруту место в
 * `tests/level-contract.test.js`.
 *
 * Тело внутри колонки сюжеткой **не** бракуется поштучно: решётка навигации
 * отступает от стены на `CONFIG.radius + J.wallThickness / 2 + 0,05` — то есть
 * на радиус человека, — и узел, свободный для `Enemy` (0,45), законно задевает
 * стену телом Чужого (0,5). Замер по узлам карт из брифа: свободных радиусом
 * 0,45 — 1356 из 1356, 13881 из 13881 и 12507 из 12509, а свободных радиусом
 * 0,5 — 1233, 12713 и 12049 соответственно, то есть 111…1168 узлов тесны
 * Чужому; точки респавна между ними выбирает ГПСЧ. Бракется только случай, когда
 * глава посадила в колонку **всю** свою команду: это уже не дрожь выбора, а
 * разошедшиеся blockers и навигация.
 */
async function testEnemiesStandOnSupport() {
  const v = await visits();
  const bad = [];
  let worstOff = 0;
  let worstGap = 0;
  let worstNode = 0;
  let buried = 0;
  for (const x of v) {
    const items = x.enemies.items;
    const limit = x.nodeStats.worstOff + SUPPORT_TOL;
    const nan = items.filter(e => !e.finite).length;
    const offNode = items.filter(e => e.nodeGap > NODE_GAP);
    const floating = items.filter(e => e.off > limit);
    const inColumn = items.filter(e => e.blocked).length;
    worstOff = Math.max(worstOff, ...items.map(e => e.off), 0);
    worstGap = Math.max(worstGap, ...items.map(e => e.nodeGap), 0);
    worstNode = Math.max(worstNode, x.nodeStats.worstOff);
    buried += inColumn;
    if (nan) bad.push(`${LEVEL_NUMBERS[x.index]}: тел с нечисловыми координатами ${nan}`);
    if (offNode.length) {
      bad.push(`${LEVEL_NUMBERS[x.index]}: ${offNode.length} врагов не на узле графа `
        + `(худший зазор ${offNode[0].nodeGap.toFixed(3)} м)`);
    }
    if (floating.length) {
      bad.push(`${LEVEL_NUMBERS[x.index]}: ${floating.length} врагов глубже опоры, чем любой узел карты `
        + `(худшее ${floating[0].off.toFixed(3)} м при пределе главы ${limit.toFixed(3)} м)`);
    }
    if (items.length && inColumn === items.length) {
      bad.push(`${LEVEL_NUMBERS[x.index]}: вся команда из ${inColumn} тел в колонке `
        + `(свободных узлов графа ${x.nodeStats.nodes - x.nodeStats.blockedNodes} из ${x.nodeStats.nodes})`);
    }
  }
  return {
    name: 'enemies-stand-on-support',
    passed: bad.length === 0,
    info: bad.slice(0, 5).join(' | ')
      || `все враги стоят на своих узлах (худший зазор ${worstGap.toFixed(3)} м) и на опоре `
        + `(худшее отклонение ${worstOff.toFixed(3)} м при худшем узле среди глав ${worstNode.toFixed(3)} м); `
        + `в колонке ${buried} тел — там, где узел тесен радиусу Чужого`,
  };
}

/**
 * Два соседних захода одной главы после круга по всему реестру обязаны дать один
 * бюджет сцены: растёт число объектов или геометрий в `renderer.info` — значит,
 * `dispose()` какой-то карты не отдал буферы, и перезагрузка главы копирует район
 * поверх района (правило «Перестановка окна — это перестройка, а не накопление»).
 *
 * Сюжетка держит два конкретных dispose, появившихся из её же замера: до правки
 * каждый заход главы добавлял ровно одну геометрию (снятый с камеры, но не
 * отпущенный меш viewmodel — `Weapon.dispose`) и одну текстуру (теневая карта
 * 2048² прошлого солнца, перезаписанного в `_initScene`); после — нули на четырёх
 * заходах подряд. Без этих двух строк проверка краснеет, и краснеет одинаково во
 * всех главах, поэтому она не флейк, а гейт.
 */
async function testReloadKeepsSceneBudget() {
  const v = await visits();
  const first = v[v.length - 2];
  const again = v[v.length - 1];
  const bad = [];
  if (!first || !again || first.index !== probeIndex || again.index !== probeIndex) {
    return { name: 'reload-scene-budget', passed: false, info: `сюита ожидала двух подряд идущих заходов главы ${LEVEL_NUMBERS[probeIndex]}` };
  }
  const probeName = LEVEL_NUMBERS[probeIndex];
  if (again.sceneChildren !== first.sceneChildren) {
    bad.push(`объектов в сцене ${again.sceneChildren} против ${first.sceneChildren} в предыдущем заходе`);
  }
  if (again.geometries !== first.geometries) {
    bad.push(`геометрий в renderer.info ${again.geometries} против ${first.geometries}`);
  }
  if (again.textures !== first.textures) {
    bad.push(`текстур ${again.textures} против ${first.textures}`);
  }
  return {
    name: 'reload-scene-budget',
    passed: bad.length === 0,
    info: bad.join(' | ')
      || `глава ${probeName} дважды после круга из ${v.length - 2} глав: ${again.sceneChildren} объектов, `
        + `${again.geometries} геометрий, ${again.textures} текстур — второй заход не тяжелее первого`,
  };
}

/** Ни одна загрузка не должна печатать console.error (так движок докладывает о сборке). */
function testNoConsoleErrors() {
  return {
    name: 'no-console-errors',
    passed: errors.length === 0,
    info: errors.length ? errors.slice(0, 3).join(' | ') : 'ошибок консоли при загрузке глав нет',
  };
}

// ----------------------------------------------------------------------- запуск

const tests = [
  testEveryChapterLoads,
  testEntitiesMatchBrief,
  testEnemiesStandOnSupport,
  testReloadKeepsSceneBudget,
];

/**
 * @returns {Promise<{passed:number, total:number, results:Array<{name:string,passed:boolean,info:string}>}>}
 */
export async function runLevelLifecycleTests(arg) {
  errors.length = 0;
  pass = null;
  const filter = parseLevelFilter(arg);
  indices = selectedIndices(filter);
  label = filterLabel(filter);
  if (filter && (!indices || !indices.length)) {
    return { passed: 0, total: 1, results: [{ name: 'level-filter', passed: false, info: `нет глав с номерами ${[...filter].join(', ')} (есть ${LEVEL_NUMBERS.join(', ')})` }] };
  }
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
  console.group(`Жизненный цикл глав движком${label}`);
  for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'} — ${r.name}: ${r.info}`);
  console.log(`Итого: ${passed}/${results.length}`);
  console.groupEnd();
  return { passed, total: results.length, results };
}
