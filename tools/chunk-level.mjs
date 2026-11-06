/**
 * Разрезка уровня на чанки — этап 1 плана открытого мира
 * (docs/open-world-plan.md, § 4.1).
 *
 * Режет парсер, а не движок: детерминизм, побайтовость и «одна правда о числах»
 * уже обеспечены пайплайном JSON → Node → движок, а разрезка в браузере была бы
 * второй реализацией геодезии. Вход — **нормализованная** карта, а не бриф:
 * нормализатор считает опоры пролётов, фонари, проёмы дверей, планы русл и
 * отметки поля по всему миру, поэтому резать бриф и нормализовать каждый чанк
 * отдельно значило бы получить на швах другие высоты.
 *
 * Каждый чанк — законные данные `JsonMap` в **своих местных осях**: центр клетки
 * становится (0, 0), `ground.size` — стороной клетки. Это не перенос мира, как у
 * главы 4 (`src/stream-map.js` держит центр окна и требует сдвига `-(dx, dz)` и
 * пропуска кадра): мировой кадр остаётся в `index.js` (`cells[].origin`), и
 * координаты игрока не правятся никогда. Местные оси нужны затем, что решётка
 * навигации ставит узлы **по площади плиты** (§ 2.2) — плита чанка обязана быть
 * маленькой, иначе стриминг не спасает от цены всего мира.
 *
 * Правило владельца/ссылки (§ 4.1): картинку и свет объекта строит владеющий
 * чанк — из тех его клеток, чей прямоугольник пересекает план объекта (без
 * маргина), ближайшая к центру его плана; твёрдость, опору и проходы объект
 * отдаёт **всем** чанкам, чей план он пересекает с маргином `chunkOverlap()`.
 * Без маргина проба на шве видела бы половину стены, а ребро через шов
 * браузовалось бы молча.
 */
import { CONFIG } from '../src/config.js';

const J = CONFIG.jsonMap;

/**
 * м: маргин, на который план объекта должен перерасти границу клетки, чтобы
 * объект в неё попал. Та же арифметика, что у отступа решётки от грани стены
 * (AGENTS: `CONFIG.radius + J.wallThickness / 2 + 0,05`), плюс проба опоры
 * ребра: вместе это расстояние, на котором нога ещё обязана видеть чужую
 * твёрдость, чтобы не шагнуть через шов в воздух.
 */
export function chunkOverlap() {
  return CONFIG.radius + J.wallThickness / 2 + 0.05 + J.navEdgeProbe;
}

// ------------------------------------------------------------- геометрия плана

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

/** Прямоугольник плана целиком: все четыре стороны — числа. */
const isRect = (r) => isNum(r.minX) && isNum(r.maxX) && isNum(r.minZ) && isNum(r.maxZ);

/** Прямоугольник плана (мировые оси, локализатор его не трогает). */
const rectOf = (o) => (o ? { minX: o.minX, maxX: o.maxX, minZ: o.minZ, maxZ: o.maxZ } : {});

/** План точечного объекта — вырожденный прямоугольник в его центре. */
const pointRect = (p) => ({ minX: p.x, maxX: p.x, minZ: p.z, maxZ: p.z });

/**
 * План откоса насыпи: `axis` — вдоль полотна, уклон идёт поперёк, поэтому полоса
 * занимает поперечную координату от борта `cross` до носка `cross + dir·run`.
 */
function apronRect(a) {
  const toe = a.cross + a.dir * Math.abs(a.run);
  return a.axis === 'x'
    ? { minX: a.minX, maxX: a.maxX, minZ: Math.min(a.cross, toe), maxZ: Math.max(a.cross, toe) }
    : { minX: Math.min(a.cross, toe), maxX: Math.max(a.cross, toe), minZ: a.minZ, maxZ: a.maxZ };
}

/**
 * Планы объекта по коллекции. Отсюда разрезка берёт и владение, и участие:
 * план и локализация — две разные функции, и пропущенное поле видно как
 * расхождение меры (§ 7.1 п. 3), а не молчанием.
 */
const PLANS = {
  buildings: (b) => [rectOf(b.bounds)],
  roads: (r) => [
    ...(r.decks ?? []).map(rectOf),
    ...(r.fill ?? []).map(rectOf),
    ...(r.aprons ?? []).map(apronRect),
  ],
  channels: (c) => [
    ...(c.segments ?? []).map((s) => rectOf(s.bed)),
    ...(c.walls ?? []).map((w) => rectOf(w.rect)),
    ...(c.descents ?? []).map((d) => rectOf(d.plan)),
    ...(c.holes ?? []).map(rectOf),
  ],
  props: (p) => [pointRect(p.position)],
  lights: (l) => [pointRect(l.position)],
};

/** Коллекции, которые разрезка знает как размещать в мире, — он же список для сюиты. */
export const CHUNK_COLLECTIONS = Object.keys(PLANS);

/** Союз прямоугольников — габарит плана объекта. */
function unionRect(rects) {
  if (!rects.length) return null;
  return {
    minX: Math.min(...rects.map((r) => r.minX)),
    maxX: Math.max(...rects.map((r) => r.maxX)),
    minZ: Math.min(...rects.map((r) => r.minZ)),
    maxZ: Math.max(...rects.map((r) => r.maxZ)),
  };
}

/**
 * План объекта: прямоугольники частей, габарит и его центр.
 *
 * Прямоугольник без координат — не «пустой план», а дырка: `Object.values({})`
 * пуст, и `every` на нём истинен, поэтому проверка обязана звать `isRect`, а не
 * «все значения числа». Пропущенная часть плана у длинного объекта (дом без
 * `bounds`, русло без `bed` у одного из звеньев) иначе дала бы чанк с половиной
 * геометрии, и на шве её наличие зависело бы от того, какая половина куда попала.
 */
export function planOf(collection, obj) {
  const all = PLANS[collection](obj);
  const rects = all.filter(isRect);
  if (rects.length && rects.length !== all.length) {
    throw new Error(`${collection}: '${obj.id}' — часть плана без координат (${all.length - rects.length} из ${all.length} прямоугольников): чанк получил бы половину объекта`);
  }
  const bounds = unionRect(rects);
  return {
    rects,
    bounds,
    center: bounds && { x: (bounds.minX + bounds.maxX) / 2, z: (bounds.minZ + bounds.maxZ) / 2 },
  };
}

const grown = (rect, m) => ({
  minX: rect.minX - m, maxX: rect.maxX + m, minZ: rect.minZ - m, maxZ: rect.maxZ + m,
});

const hits = (a, b) => a.minX <= b.maxX && b.minX <= a.maxX && a.minZ <= b.maxZ && b.minZ <= a.maxZ;

// ------------------------------------------------------------- сетка клеток

/**
 * Квадратные клетки, плита делится **нацело**: окно `keep` и упреждение `ahead`
 * считаются в клетках, и клетка другого размера на краю означала бы, что у
 * одного и того же `keep` в разных местах мира разный запас времени достройки.
 * Делитель, который не делит, — ошибка брифа, а не остаток в последней клетке.
 */
export function cellGrid(size, chunk) {
  if (!Number.isInteger(chunk) || chunk <= 0) {
    throw new Error(`stream.chunk: ${chunk} — сторона клетки обязана быть целым числом метров`);
  }
  if (size % chunk !== 0) {
    throw new Error(`stream.chunk ${chunk} не делит плиту ${size} нацело; подходящие стороны клетки: ${cellDivisors(size).join(', ')}`);
  }
  const n = size / chunk;
  const half = size / 2;
  const cells = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const minX = -half + i * chunk, minZ = -half + j * chunk;
      cells.push({
        i,
        j,
        id: `${i}_${j}`,
        file: `chunk-${i}-${j}.json`,
        rect: { minX, maxX: minX + chunk, minZ, maxZ: minZ + chunk },
        origin: { x: minX + chunk / 2, z: minZ + chunk / 2 },
      });
    }
  }
  return { n, cells };
}

/** Делители плиты в пределах schema-диапазона `chunk` — подсказка в тексте ошибки. */
function cellDivisors(size) {
  const out = [];
  for (let d = 100; d <= 600; d += 50) if (size % d === 0) out.push(d);
  return out.length ? out : [size];
}

// ------------------------------------------------------------- локализация

/**
 * Ключи, которые локализатор обязан сдвинуть. Координатный ключ вне правила —
 * бросок, а не тихий пропуск: несдвинутое поле дало бы чанк, у которого стена
 * стоит не там, где её рисует владеющий чанк, и в браузере это выглядело бы
 * дефектом геометрии, а не забытой строчкой в парсере.
 */
const COORD_KEYS = ['x', 'z', 'minX', 'maxX', 'minZ', 'maxZ', 'cx', 'cz', 'bx', 'bz',
  'lo', 'hi', 'cross', 'u0', 'u1', 'v0', 'v1'];

/**
 * Числа, похожие на координату, но размер или угол: их сдвигать нельзя, и
 * локализатор обязан видеть их своими глазами (иначе `hx` из `obb` уехал бы
 * вместе с центром, и повёрнутая пластина потеряла бы половину ширины).
 */
const SIZE_KEYS = ['hx', 'hz', 'radius', 'a0', 'a1', 'span', 'halfW'];

/** Родительские ключи, чьи `x`/`z` — масштаб экземпляра, а не место в мире. */
const SIZE_PARENTS = ['scale'];

/**
 * Правила сдвига: каждое либо съедает свои ключи, либо возвращает `null`.
 * Один и тот же ключ не может быть съеден дважды — за этим следит `localize`.
 */
const RULES = [
  // плоский прямоугольник в мировых осях: плита пола, стена, проём, проступь,
  // настил, площадка, дыра в грунте
  (o, dx, dz) => {
    if (!(isNum(o.minX) && isNum(o.maxX) && isNum(o.minZ) && isNum(o.maxZ))) return null;
    o.minX -= dx; o.maxX -= dx; o.minZ -= dz; o.maxZ -= dz;
    return ['minX', 'maxX', 'minZ', 'maxZ'];
  },
  // центр вращения и центр OBB: вместе с ним уезжает весь сектор дуги или вся
  // повёрнутая коробка, а углы и полуоси остаются своими
  (o, dx, dz) => {
    if (!(isNum(o.cx) && isNum(o.cz))) return null;
    o.cx -= dx; o.cz -= dz;
    return ['cx', 'cz'];
  },
  // второй конец капсулы холма (первый — правилом точки)
  (o, dx, dz) => {
    if (!(isNum(o.bx) && isNum(o.bz))) return null;
    o.bx -= dx; o.bz -= dz;
    return ['bx', 'bz'];
  },
  // точка плана: полигон footprint, узел двери, опора света, предмет
  (o, dx, dz) => {
    if (!(isNum(o.x) && isNum(o.z))) return null;
    o.x -= dx; o.z -= dz;
    return ['x', 'z'];
  },
  // ось-зависимые поля: `axis` говорит, вдоль чего лежат `lo`/`hi` (у откоса —
  // борт `minX`/`maxX`), а `cross` и `v` — поперёк; `u` у схода идёт по своей оси
  (o, dx, dz) => {
    if (o.axis !== 'x' && o.axis !== 'z') return null;
    if (!(isNum(o.cross) || isNum(o.lo) || isNum(o.u0))) return null;
    const along = o.axis === 'x' ? dx : dz;
    const across = o.axis === 'x' ? dz : dx;
    const eaten = [];
    for (const k of o.axis === 'x' ? ['minX', 'maxX'] : ['minZ', 'maxZ']) {
      if (isNum(o[k])) { o[k] -= along; eaten.push(k); }
    }
    for (const k of ['lo', 'hi']) if (isNum(o[k])) { o[k] -= along; eaten.push(k); }
    for (const k of ['u0', 'u1']) if (isNum(o[k])) { o[k] -= along; eaten.push(k); }
    for (const k of ['v0', 'v1']) if (isNum(o[k])) { o[k] -= across; eaten.push(k); }
    if (isNum(o.cross)) { o.cross -= across; eaten.push('cross'); }
    return eaten;
  },
];

/**
 * Копирует узел данных в местные оси клетки.
 *
 * `claimed` — карта «путь в данных → почему сдвинут (или почему нет)»; её
 * сверяет с обходом всех координатных ключей сюита § 7.1 п. 3, поэтому список
 * правил не может разойтись с фактическим содержимым нормализатора.
 */
export function localize(value, origin, claimed = new Map(), path = '') {
  if (Array.isArray(value)) return value.map((v) => localize(v, origin, claimed, `${path}[]`));
  if (!value || typeof value !== 'object') return value;

  const keyName = path.slice(path.lastIndexOf('.') + 1);
  if (SIZE_PARENTS.includes(keyName)) {
    for (const k of Object.keys(value)) {
      if (isNum(value[k]) && COORD_KEYS.includes(k)) claimed.set(`${path}.${k}`, 'size');
    }
    return { ...value };
  }

  const { x: dx, z: dz } = origin;
  const out = { ...value };
  const eaten = new Set();
  for (const rule of RULES) {
    for (const k of rule(out, dx, dz) ?? []) {
      if (eaten.has(k)) throw new Error(`${path}.${k}: координата попала в два правила локализации — правила разошлись по форме объекта`);
      eaten.add(k);
      claimed.set(`${path}.${k}`, 'shift');
    }
  }
  for (const k of Object.keys(out)) {
    if (!isNum(out[k])) continue;
    if (COORD_KEYS.includes(k) && !eaten.has(k)) {
      throw new Error(`${path}.${k}: координата без правила локализации — чанк получил бы геометрию не там, где её рисует владелец`);
    }
    if (SIZE_KEYS.includes(k)) claimed.set(`${path}.${k}`, 'size');
  }
  // вложенные узлы идут тем же путём: план дома, настила и русла живёт вглубь
  for (const [k, v] of Object.entries(out)) {
    if (v && typeof v === 'object') out[k] = localize(v, origin, claimed, `${path}.${k}`);
  }
  return out;
}

// ------------------------------------------------------------- разрезка

/**
 * Режет нормализованную карту на чанки.
 *
 * @param {object} map нормализованная карта (`normalizeLevel(...).map`)
 * @param {object} stream секция `stream` брифа: `{chunk, keep, aheadMin, aheadMax, budgetMs}`
 * @param {{reverse?:boolean, overlap?:number}} opts `reverse` — обход клеток и
 *   объектов задом наперёд; knob нужен только сюите § 7.1 п. 2, и результат
 *   обязан совпасть с прямым обходом, потому что порядок здесь канонизируется
 *   сортировкой по id. `overlap` подменяет маргин: § 7.1 п. 4 мерит, что он
 *   даёт, подменив его нулём.
 * @returns {{indexMap:object, chunks:Array, meta:object}}
 */
export function splitLevel(map, stream, opts = {}) {
  const overlap = opts.overlap ?? chunkOverlap();
  const { n, cells } = cellGrid(map.ground.size, stream.chunk);
  const reverse = opts.reverse === true;
  const order = reverse ? [...cells].reverse() : cells;

  const members = new Map(cells.map((c) => [c.id, new Map()]));
  const ownerOf = new Map();   // `collection:id` → id клетки-владельца
  let participants = 0;

  for (const collection of Object.keys(PLANS)) {
    const source = map[collection] ?? [];
    const byId = new Map();
    for (const obj of source) {
      // id обязателен: без него «ровно один владелец» нечем проверить, а
      // молча пропущенный объект стал бы «потерянным» в смысле § 7.1 п. 3
      if (!obj?.id) throw new Error(`${collection}: объект без id — разрезка не может гарантировать одного владельца`);
      if (byId.has(obj.id)) throw new Error(`${collection}: id '${obj.id}' встречается дважды — владение было бы неопределённым`);
      byId.set(obj.id, obj);
    }
    for (const id of [...byId.keys()].sort()) {
      const obj = byId.get(id);
      const plan = planOf(collection, obj);
      if (!plan.rects.length) throw new Error(`${collection}: '${id}' не имеет плана — чанк не смог бы ни владеть им, ни дать опору`);
      const inside = order.filter((c) => plan.rects.some((r) => hits(grown(c.rect, overlap), r)));
      if (!inside.length) continue;   // объект целиком за пределами плиты мира
      const owner = pickOwner(plan, inside);
      ownerOf.set(`${collection}:${id}`, owner.id);
      for (const cell of inside) {
        const bucket = members.get(cell.id);
        if (!bucket.has(collection)) bucket.set(collection, []);
        bucket.get(collection).push({ id, obj, owner: cell.id === owner.id });
        participants++;
      }
    }
  }

  const chunks = cells.map((cell) => buildChunk(map, cell, stream.chunk, members.get(cell.id)));
  const worldCells = cells.length;

  return {
    indexMap: {
      kind: 'open',
      units: map.units ?? 'meters',
      world: { size: map.ground.size, y: map.ground.y, color: map.ground.color, bounds: map.bounds },
      spawn: map.spawn,
      // `overlap` — выведенное парсером число, и в `index.js` оно лежит ровно
      // по той же причине, по какой в модуле главы лежат выведенные отметки:
      // движок не должен второй раз считать арифметику маргина по CONFIG
      stream: { ...stream, overlap },
      // Скелета здесь нет намеренно: он свойство ВСЕГО мира, а не разрезки, и
      // кладёт его эмиссия (`generateCatalog`), где нормализованная карта есть
      // целиком. Здесь же остаётся только то, что зависит от клеток.
      cells: cells.map((c) => ({
        id: c.id,
        file: c.file,
        rect: c.rect,
        origin: c.origin,
        objects: chunks.find((k) => k.id === c.id).counts,
      })),
    },
    chunks,
    meta: {
      grid: n,
      cells: worldCells,
      chunk: stream.chunk,
      size: map.ground.size,
      overlap,
      participants,
      owners: ownerOf.size,
      ownerOf,
    },
  };
}

/** Один чанк: localized-копии участников в местных осях клетки. */
function buildChunk(map, cell, chunk, bucket) {
  const claimed = new Map();
  const chunkMap = {
    kind: map.kind === 'open' ? 'json2' : (map.kind ?? 'json'),
    units: map.units ?? 'meters',
    ground: { ...map.ground, size: chunk },
    // рельеф — аналитическое поле, и каждый чанк обязан держать его ЦЕЛИКОМ
    // (сдвинутым): на шве нога должна стоять на том же поле, что в середине
    // клетки, а не на «другом холме» (AGENTS: одно поле кормит всех)
    ...(map.relief ? { relief: localize(map.relief, cell.origin, claimed, '.relief') } : {}),
    ...(map.spawn ? { spawn: { x: 0, z: 0 } } : {}),
  };
  const counts = {};
  for (const collection of Object.keys(PLANS)) {
    const items = (bucket.get(collection) ?? []).slice().sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    if (!items.length) continue;
    counts[collection] = items.length;
    chunkMap[collection] = items.map(({ obj, owner }) => {
      const copy = localize(obj, cell.origin, claimed, `.${collection}[]`);
      // флаг владения: картинку и свет рисует этот чанк, остальные дают только
      // твёрдость и опору — иначе дом на шве нарисовался бы дважды
      if (owner) copy.owner = true;
      return copy;
    });
  }
  chunkMap.bounds = boundsOf(chunkMap, cell, chunk);
  return { id: cell.id, file: cell.file, cell, map: chunkMap, counts, claimed };
}

/**
 * Владеющая клетка: из тех участников, чей прямоугольник клетки **пересекает**
 * часть плана (без маргина), — ближайшая к центру плана; при равных — с меньшими
 * `(i, j)`. Две оговорки, и обе стоят картишки:
 *
 * - «ближайшая из пересекающих», а не «клетка, в которой центр»: центр длинной
 *   дуги лежит в пустоте между её концами, владение тогда досталось бы чанку, у
 *   которого объекта в данных нет, и картинка исчезла бы молча;
 * - маргин на владение не распространяется: соседняя клетка, попавшая в список
 *   только благодаря 1,175 м, обязана дать твёрдость и опору, но не права рисовать.
 *
 * Пересекающая клетка находится всегда: клетки покрывают плиту, а объект вне
 * плиты не участвует ни в одной и отсекается выше по списку.
 */
function pickOwner(plan, inside) {
  let best = null;
  for (const cell of inside) {
    if (!plan.rects.some((r) => hits(cell.rect, r))) continue;
    const d = Math.hypot(cell.origin.x - plan.center.x, cell.origin.z - plan.center.z);
    if (!best) { best = { d, cell }; continue; }
    const tied = Math.abs(d - best.d) <= 1e-9;
    if (d < best.d - 1e-9
      || (tied && (cell.i < best.cell.i || (cell.i === best.cell.i && cell.j < best.cell.j)))) {
      best = { d, cell };
    }
  }
  return best.cell;
}

/**
 * Габарит содержимого чанка, клампованный к его плите: движок держит по
 * `bounds` снятие врагов и кламп машины (§ 4.3), поэтому честный габарит —
 * содержимое, а не клетка целиком.
 */
function boundsOf(chunkMap, cell, chunk) {
  const rects = [];
  for (const collection of Object.keys(PLANS)) {
    for (const obj of chunkMap[collection] ?? []) rects.push(...planOf(collection, obj).rects);
  }
  const plate = { minX: -chunk / 2, maxX: chunk / 2, minZ: -chunk / 2, maxZ: chunk / 2 };
  if (!rects.length) return plate;
  const b = unionRect(rects);
  const r6 = (v) => Math.round(v * 1e6) / 1e6;
  return {
    minX: Math.max(plate.minX, r6(b.minX)),
    maxX: Math.min(plate.maxX, r6(b.maxX)),
    minZ: Math.max(plate.minZ, r6(b.minZ)),
    maxZ: Math.min(plate.maxZ, r6(b.maxZ)),
  };
}

/**
 * Побайтово устойчивая печать: ключи сортируются, поэтому байты файла не
 * зависят от порядка, в котором нормализатор расставил поля объекта.
 */
export function stringifyStable(value) {
  return `${JSON.stringify(sortKeys(value), null, 2)}\n`;
}

function sortKeys(v) {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (!v || typeof v !== 'object') return v;
  const out = {};
  for (const k of Object.keys(v).sort()) out[k] = sortKeys(v[k]);
  return out;
}
