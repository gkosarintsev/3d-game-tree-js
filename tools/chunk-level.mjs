/**
 * Разрезка уровня на чанки — этапы 1 и 3 плана открытого мира
 * (docs/open-world-plan.md, § 4.1, § 5.8, § 6.3.1).
 *
 * Режет парсер, а не движок: детерминизм, побайтовость и «одна правда о числах»
 * уже обеспечены пайплайном JSON → Node → движок, а разрезка в браузере была бы
 * второй реализацией геодезии. Вход — **нормализованная** карта, а не бриф:
 * нормализатор считает опоры пролётов, фонари, проёмы дверей, планы русл и
 * отметки поля по всему миру, поэтому резать бриф и нормализовать каждый чанк
 * отдельно значило бы получить на швах другие высоты.
 *
 * Каждый чанк держит **мировые** оси: координаты копий равны координатам
 * нормализованного мира слово в слово, а не смещены на центр клетки. Местные
 * оси (форма этапа 1) стоили второго переводчика координат — движку, собирающему
 * чанк, пришлось бы знать `origin` клетки в каждой из 12+ коллекций выводимой
 * геометрии, где пропущенное сложение молчит, а не бросает, — и оказались
 * дороже на байтах: вычитание центра печатается 17-значащим двойным (§ 5.8).
 * Это не перенос мира, как у главы 4 (`src/stream-map.js` держит центр окна и
 * требует сдвига `-(dx, dz)` и пропуска кадра): мировой кадр один и он в
 * `index.js`, и координаты игрока не правятся никогда. Клеточная цена решётки
 * навигации при этом не теряется: её держит обход прямоугольников загруженных
 * клеток (`cells[].rect` в `src/world-map.js`), а не размер плиты чанка (§ 4.3).
 *
 * Мировое живёт в `index.js` один раз: плита (`ground`), габарит содержимого,
 * спавн, `relief` и три секции выводимой картинки (`windows`, `clutter`,
 * `signage`) — последние потому, что это настройки механизма, а не геометрия
 * клетки, и в чанках их просто негде было держать (§ 6.3.1).
 *
 * Правило владельца/ссылки (§ 4.1): картинку и свет объекта строит владеющий
 * чанк — из тех его клеток, чей прямоугольник пересекает план объекта (без
 * маргина), ближайшая к центру его плана; твёрдость, опору и проходы объект
 * отдаёт **всем** чанкам, чей план он пересекает с маргином `chunkOverlap()`.
 * Без маргина проба на шве видела бы половину стены, а ребро через шов
 * браузовалось бы молча. Дубликаты участников по id НЕ вычитаются: выгрузка
 * обязана оставаться монотонной (§ 4.1, цена ×1,065…1,091 записей).
 */
import { CONFIG } from '../src/config.js';
import { CHUNK_EXT } from '../src/level-bin.js';

const J = CONFIG.jsonMap;

/** м: пределы стороны клетки, которые принимает схема (`stream.chunk`). */
export const CHUNK_MIN = 100;
export const CHUNK_MAX = 600;

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

/** План прямоугольника в мировых осях — разрезка его не перекладывает. */
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
 * план клетки и план объекта — две разные функции, и пропущенное поле видно как
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

/** Коллекции, которые разрезка умеет размещать по клеткам, — он же список для сюиты. */
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
 *
 * Второй гейт — кратность `J.relief.meshCell`: грунт режется сеткой 8 м по
 * плите (`_groundGeo` в `src/json-map.js`), и при клетке, не кратной этому
 * шагу, вершины нарезки соседних клеток не сошлись бы — на каждом шве лёг бы
 * T-стык, который на рельефе читается световой полосой.
 */
export function cellGrid(size, chunk) {
  const mesh = J.relief.meshCell;
  if (!Number.isInteger(chunk) || chunk <= 0) {
    throw new Error(`stream.chunk: ${chunk} — сторона клетки обязана быть целым числом метров`);
  }
  if (chunk % mesh !== 0) {
    throw new Error(`stream.chunk ${chunk} не кратно ${mesh} (\`J.relief.meshCell\`): `
      + `нарезка грунта соседних клеток сошлась бы по вершинам только при клетке, кратной шагу сетки, `
      + `а иначе на каждом шве остаётся T-стык; подходящие стороны клетки: ${cellChoices(size).join(', ')}`);
  }
  if (size % chunk !== 0) {
    throw new Error(`stream.chunk ${chunk} не делит плиту ${size} нацело; `
      + `подходящие стороны клетки: ${cellChoices(size).join(', ')}`);
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
        file: `chunk-${i}-${j}${CHUNK_EXT}`,
        rect: { minX, maxX: minX + chunk, minZ, maxZ: minZ + chunk },
        origin: { x: minX + chunk / 2, z: minZ + chunk / 2 },
      });
    }
  }
  return { n, cells };
}

/**
 * Стороны клетки, которые принимает эта плита: делители в пределах схемы,
 * кратные `J.relief.meshCell`. Подсказка в тексте ошибки, а не разрешение —
 * пустой список означал бы, что плиту вообще нельзя разрезать законно.
 */
export function cellChoices(size) {
  const mesh = J.relief.meshCell;
  const out = [];
  for (let d = CHUNK_MIN; d <= CHUNK_MAX; d++) {
    if (size % d === 0 && d % mesh === 0) out.push(d);
  }
  if (out.length) return out;
  const loose = [];
  for (let d = CHUNK_MIN; d <= CHUNK_MAX; d++) if (size % d === 0) loose.push(d);
  return loose.length ? loose : [size];
}

// ------------------------------------------------------------- разрезка

/**
 * Режет нормализованную карту на чанки.
 *
 * Чанк держит **мировые** оси (§ 4.1, § 5.8 плана docs/open-world-plan.md):
 * координаты копий равны координатам нормализованного мира слово в слово,
 * потому что перевод в местные оси клетки стоил бы второго переводчика в
 * движке (выводимая геометрия считается фазами из 12+ коллекций, и пропущенное
 * сложение там молчит), а на байтах он же и дорожал: вычитание центра клетки
 * печатается 17-значащим двойным. Мировые настройки карты — плита, `relief`,
 * спавн, габарит и секции выводимой картинки — лежат один раз в `index.js`.
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

  const chunks = cells.map((cell) => buildChunk(map, cell, members.get(cell.id)));

  return {
    indexMap: {
      // Кадр мира — здесь один раз: чанк на мировых осях не несёт ни плиты, ни
      // рельефа, ни спавна, и у движка нет второй копии этих чисел, которая
      // могла бы разойтись с файлом клетки.
      kind: 'open',
      units: map.units ?? 'meters',
      ground: map.ground,
      bounds: map.bounds,
      spawn: map.spawn,
      ...(map.relief ? { relief: map.relief } : {}),
      // Три секции выводимой картинки — настройки механизма, а не геометрия
      // клетки: позиции рядов считает карта по своим стенам и кровлям, поэтому
      // в чанке им негде было лежать и формат этапа 1 их терял (§ 6.3.1).
      ...(map.windows ? { windows: map.windows } : {}),
      ...(map.clutter ? { clutter: map.clutter } : {}),
      ...(map.signage ? { signage: map.signage } : {}),
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
        objects: chunks.find((k) => k.id === c.id).counts,
      })),
    },
    chunks,
    meta: {
      grid: n,
      cells: cells.length,
      chunk: stream.chunk,
      size: map.ground.size,
      overlap,
      participants,
      owners: ownerOf.size,
      ownerOf,
    },
  };
}

/**
 * Один чанк: копии его участников в мировых осях.
 *
 * Копия обязана быть **своей** только верхним слоем: флаг `owner` отличает
 * владеющую клетку от ссылающейся, и запись его в общий объект нормализованной
 * карты сделала бы владельца повсюду. Вложенные планы при этом не дублируются —
 * разрезка их не правит, а `stringifyStable` печатает сколько угодно раз.
 */
function buildChunk(map, cell, bucket) {
  const chunkMap = {
    kind: map.kind === 'open' ? 'json2' : (map.kind ?? 'json'),
    units: map.units ?? 'meters',
  };
  const counts = {};
  for (const collection of Object.keys(PLANS)) {
    const items = (bucket.get(collection) ?? []).slice().sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    if (!items.length) continue;
    counts[collection] = items.length;
    chunkMap[collection] = items.map(({ obj, owner }) => (owner ? { ...obj, owner: true } : { ...obj }));
  }
  return { id: cell.id, file: cell.file, cell, map: chunkMap, counts };
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
