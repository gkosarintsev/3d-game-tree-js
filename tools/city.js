/**
 * Генератор кварталов (plan: docs/level10-city-plan.md, этап 4): секция `city`
 * брифа разворачивается в записи `roads` и `buildings` — ровно те же, что пишет
 * рука. Поэтому `JsonMap` не узнаёт о существовании генератора: клиент ест
 * нормализованные данные, как и остальные типы карт (AGENTS.md).
 *
 * Четыре правила, без которых разворот превратился бы в шум:
 *
 * 1. Детерминизм. Случайность одна — mulberry32 от `city.seed`, вызовы идут в
 *    фиксированном порядке (район → улицы → суперквартал → лот → часть лота),
 *    поэтому два прогона одного JSON дают побайтово равный модуль и `--check`
 *    работает как прежде. Форма, не влезшая в лот, тоже расходует свои вызовы
 *    ГПСЧ и честно уступает место коробке.
 * 2. Автор важнее генератора. Запись брифа с тем же id вытесняет
 *    сгенерированную ВМЕСТЕ с надстройками того же лота (`<id>_top`, `<id>_a`):
 *    иначе автор, поправивший подиум, оставил бы башню висеть на отметке
 *    снесённой кровли. Владелец правит один дом из четырёхсот, не трогая сид.
 * 3. Препятствия считаются не своей копией арифметики, а нормализатором: планы
 *    русла отдаёт `normalizeWaterway`, габариты авторских домов — `normalizeBuilding`,
 *    полосы улиц — `normalizeRoad`. Своя копия берега разъехалась бы с парсером
 *    при первой же правке, и генератор поставил бы дом в воду, которую схема
 *    уже умеет браковать.
 * 4. Дверь — только на фасад, смотрящий на улицу. Решётка узлов ставится на
 *    свободном грунте, а в узкий двор между лотами она не заходит (соседний дом
 *    стоит в трёх метрах): дверь там осталась бы островом, и `_pruneToSpawn`
 *    отрезала бы весь дом вместе с этажами.
 */
import { CONFIG } from '../src/config.js';
import { makeRng } from '../src/rng.js';
import {
  AXIS_EPS, pointInPoly, polyEdges, polyRects, r3, rectsIntersect,
  frameAt, rotatePoint, unrotatePoint, rotatedBounds, obbHitsRect, obbHitsObb, obbOf, signedArea,
} from '../src/geo2d.js';
import { normalizeBuilding, normalizeRoad, normalizeWaterway, bridgeNoses, districtTerraces } from './normalize-level.mjs';
import { reliefOf } from '../src/relief.js';

const J = CONFIG.jsonMap;

/** Шаг сетки генератора: 0,5 м держит рёбра параллельными осям и делает формы читаемыми. */
const GRID = 0.5;
/**
 * Верга между бортом улицы и лотом: в неё встаёт фонарь автогенерации
 * (`J.lampOffset` за краем настила), иначе каждый второй фонарь попадал бы в
 * габарит дома и парсер пропускал бы его с предупреждением.
 */
const VERGE = r3(J.lampOffset + 0.7);
/** Коротче — сегмент улицы, в который не встанет ни решётка узлов, ни дверь. */
const MIN_RUN = 8;
/** Запас, на который настил улицы не доезжает до препятствия: торец впритык к берегу слился бы с его стенкой. */
const STREET_CLEAR = 1;
/** Минимальная сторона дома: уже — ни маршу не встать, ни комнате не отделиться от стены. */
const MIN_SIDE = 5;
/** Минимальная толщина крыла дворовой формы: тоньше — лента, а не дом. */
const MIN_ARM = 2.6;
/** Минимальная ширина двора: уже — вместо двора щель, в которую не зайти. */
const MIN_COURT = 3;
/**
 * Запас пола за габаритом марша с каждой стороны: посадка `_landing` пробует
 * точку в `CONFIG.radius + 0,1` за планом марша, а проба тела берёт радиус
 * вокруг неё, поэтому ближайшая ступень обязана стоять не ближе
 * `0,55 + 0,45 + допуск`, иначе посадка бракуется и этаж остаётся без маршрута.
 */
const LANDING = 1.3;
/** Глубина проступи, ниже которой ступень превращается в приставную лесенку. */
const TREAD_MIN = 0.28;
/** Ширина марша и шахты: меньше — телу Чужого (два радиуса) не развернуться. */
const STAIR_DEPTH = 1.9;
/** Дальше этого портал от настила улицы не ищется: см. правило 4 в шапке. */
const MOUTH_REACH = r3(VERGE + 1);
/**
 * Джиттер угла корпуса в косом районе: ±6° к углу района. Меньше — квартал
 * читается одной пластиной, больше — угол 12-метрового корпуса уходит с фасада на
 * 0,8 м, и дверь, поставленная по локальной улице, перестаёт смотреть на её
 * настил. Дрожь одна на лот: части стека («башня на подиуме») при разных углах
 * перестали бы быть соосными, а валидатор v2 бракует пересечение планов
 * именно у не-соосных домов.
 */
const YAW_JITTER = 6;

/**
 * Как далеко ось улиц района готова уехать к носу подъёма, вместо того чтобы
 * ставить под него новый ряд. Смысл предела — не портить квартал: сдвинутый ряд
 * оставляет соседние клетки не уже `2 · edge + MIN_SIDE` (при шаге 40 м и борте
 * 8,1 м это 21,2 м, то есть сдвиг до 18,8 м), а новый ряд режет прогон пополам,
 * и половину лотов в получившейся щели генератор отбраковывает. Ближе половины
 * ширины улицы (`hW`) ряд обслуживает нос и так — он уже под ним, и передвигать
 * его не за чем.
 */
const NOSE_SHIFT = 12;

/** Стиль района — палитра фасадов, доля высотных и типы помещений (plan §3.3). */
export const CITY_STYLES = {
  mixed: {
    materials: ['concrete', 'painted_brick', 'glass_and_concrete', 'panel_block'],
    tall: 1, groundRoom: 'hall', upperRooms: ['office', 'room', 'utility'],
  },
  corporate: {
    materials: ['glass_steel', 'glass_and_concrete', 'stone_base', 'panel_block'],
    tall: 2.4, groundRoom: 'hall', upperRooms: ['office', 'corridor', 'utility'],
  },
  slum: {
    materials: ['painted_brick', 'concrete', 'rusted_metal', 'glass_and_concrete'],
    tall: 0.3, groundRoom: 'cafe', upperRooms: ['room', 'utility', 'corridor'],
  },
  industrial: {
    materials: ['concrete', 'rusted_metal', 'panel_block'],
    tall: 0.5, groundRoom: 'utility', upperRooms: ['utility', 'corridor', 'room'],
  },
  kitsch: {
    materials: ['neon_panel', 'painted_brick', 'glass_and_concrete', 'rusted_metal'],
    tall: 0.8, groundRoom: 'cafe', upperRooms: ['room', 'office', 'utility'],
  },
};

// ------------------------------------------------------------------ хелперы

const snap = v => r3(Math.round(v / GRID) * GRID);
const rand = (rng, lo, hi) => lo + (hi - lo) * rng();
const rint = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
const chance = (rng, p) => rng() < p;
const pick = (rng, list) => list[Math.floor(rng() * list.length)];
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const rectPoly = r => [
  { x: r.minX, z: r.minZ }, { x: r.maxX, z: r.minZ },
  { x: r.maxX, z: r.maxZ }, { x: r.minX, z: r.maxZ },
];
const boundsOf = poly => {
  const xs = poly.map(p => p.x), zs = poly.map(p => p.z);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minZ: Math.min(...zs), maxZ: Math.max(...zs) };
};
const usable = r => r.maxX - r.minX >= MIN_SIDE && r.maxZ - r.minZ >= MIN_SIDE;
const planOf = r => ({ minX: r3(r.minX), maxX: r3(r.maxX), minZ: r3(r.minZ), maxZ: r3(r.maxZ) });
const blocked = (rect, obstacles) => obstacles.some(o => (o.obb
  ? obbHitsRect(o.obb, rect, 0.05)
  : rectsIntersect(rect, o.rect, 0.05)));

/** Прямоугольник, сдвинутый с каждой стороны на свой запас. */
const insetRect = (r, x0, x1, z0, z1) => ({
  minX: snap(r.minX + x0), maxX: snap(r.maxX - x1),
  minZ: snap(r.minZ + z0), maxZ: snap(r.maxZ - z1),
});

/**
 * Часть лота: полигон плюс то, как распределить этажи (`mul`) и стоит ли блок
 * на кровле предыдущего (`stacked`). Поэтому «башня на подиуме» и «ступени» —
 * обычные записи брифа: нового поля клиенту не нужно.
 */
const part = (poly, opts = {}) => ({ poly, ...opts });

/**
 * Форма задаётся в локальных метрах: `u` — вдоль длинной стороны лота, `v` —
 * поперёк. `place` переносит их в мировые координаты и зеркалит по любой из
 * осей (двор, открытый на другую сторону, — тот же полигон, отражённый, значит
 * тоже простой и с осевыми рёбрами), разрывая координаты по сетке 0,5 м.
 */
function place(cell, alongX, pts, flip = 0) {
  const lu = alongX ? cell.maxX - cell.minX : cell.maxZ - cell.minZ;
  const lv = alongX ? cell.maxZ - cell.minZ : cell.maxX - cell.minX;
  return pts.map(([u, v]) => {
    const a = snap(flip & 1 ? lu - u : u);
    const b = snap(flip & 2 ? lv - v : v);
    return alongX
      ? { x: snap(cell.minX + a), z: snap(cell.minZ + b) }
      : { x: snap(cell.minX + b), z: snap(cell.minZ + a) };
  });
}

/** Рамка лота: длинная сторона — `u`. */
function frame(cell) {
  const w = cell.maxX - cell.minX, d = cell.maxZ - cell.minZ;
  const alongX = w >= d;
  return { alongX, lu: alongX ? w : d, lv: alongX ? d : w };
}

/**
 * Архетипы плана лота. Функция отдаёт список частей или `null`, если форма в
 * этот лот не влезает, — генератор тогда берёт коробку, не пытаясь сжать крылья.
 */
export const CITY_ARCHETYPES = {
  /** Коробка: самый частый дом района и единственно возможная форма узкого лота. */
  box: cell => [part(rectPoly(cell))],

  /**
   * Полоса вдоль длинной стороны, сдвинутая к одному из бортов: за фасадом
   * остаётся либо двор, либо теневой проулок — то, чего у равномерной решётки
   * коробок нет.
   */
  slab: (cell, rng) => {
    const { alongX, lu, lv } = frame(cell);
    const t = snap(clamp(rint(rng, 7, 11), MIN_ARM, lv));
    const off = t >= lv - GRID ? 0 : snap(rand(rng, 0, lv - t));
    const uv = [[0, off], [lu, off], [lu, off + t], [0, off + t]];
    return [part(place(cell, alongX, uv, rint(rng, 0, 3)))];
  },

  /** Г-образный: срез одного из четырёх углов — тот же лот выглядит разным от квартала к кварталу. */
  l: (cell, rng) => {
    const { alongX, lu, lv } = frame(cell);
    if (lu < 2 * MIN_ARM || lv < 2 * MIN_ARM) return null;
    const nu = snap(rand(rng, MIN_ARM, lu - MIN_ARM));
    const nv = snap(rand(rng, MIN_ARM, lv - MIN_ARM));
    const uv = [[0, 0], [lu, 0], [lu, nv], [nu, nv], [nu, lv], [0, lv]];
    return [part(place(cell, alongX, uv, rint(rng, 0, 3)))];
  },

  /** П-образный: двор, открытый на одну из сторон, — форма, где маршруты сворачивают в глухой угол. */
  u: (cell, rng) => {
    const { alongX, lu, lv } = frame(cell);
    if (lu < 2 * MIN_ARM + MIN_COURT || lv < 2 * MIN_ARM + MIN_COURT) return null;
    const wa = snap(rand(rng, MIN_ARM, lu * 0.42));
    const wb = snap(rand(rng, MIN_ARM, lu * 0.42));
    const cv0 = snap(rand(rng, MIN_ARM, lv - MIN_ARM));
    const cu0 = wa, cu1 = lu - wb;
    if (cu1 - cu0 < MIN_COURT || lv - cv0 < MIN_ARM) return null;
    const uv = [[0, 0], [lu, 0], [lu, lv], [cu1, lv], [cu1, cv0], [cu0, cv0], [cu0, lv], [0, lv]];
    // flip по v обязана быть: двор, открытый в сторону улицы, был бы проулком
    return [part(place(cell, alongX, uv, 2 | rint(rng, 0, 1)))];
  },

  /** Т-образный: поперечина у улицы и корпус во двор — двор получается отрезанным от шума. */
  t: (cell, rng) => {
    const { alongX, lu, lv } = frame(cell);
    if (lv < 2 * MIN_ARM || lu < 2 * MIN_ARM + MIN_COURT) return null;
    const bt = snap(rand(rng, MIN_ARM, lv - MIN_ARM));
    const su0 = snap(rand(rng, MIN_ARM, Math.max(MIN_ARM, lu * 0.42)));
    const su1 = snap(clamp(su0 + rand(rng, MIN_COURT, lu * 0.45), su0 + MIN_COURT, lu - MIN_ARM));
    const uv = [[0, 0], [lu, 0], [lu, bt], [su1, bt], [su1, lv], [su0, lv], [su0, bt], [0, bt]];
    return [part(place(cell, alongX, uv, rint(rng, 0, 3)))];
  },

  /** Крест: два корпуса в одной коробке — самая дорогая по числу рёбер форма, и ставится она только на крупном лоте. */
  cross: (cell, rng) => {
    const { alongX, lu, lv } = frame(cell);
    if (lu < 2 * MIN_ARM + MIN_COURT || lv < 2 * MIN_ARM + MIN_COURT) return null;
    const xa = snap(rand(rng, MIN_ARM, lu * 0.42));
    const xb = snap(clamp(lu - rand(rng, MIN_ARM, lu * 0.42), xa + MIN_COURT, lu - MIN_ARM));
    const za = snap(rand(rng, MIN_ARM, lv * 0.42));
    const zb = snap(clamp(lv - rand(rng, MIN_ARM, lv * 0.42), za + MIN_COURT, lv - MIN_ARM));
    if (xb - xa < MIN_COURT || zb - za < MIN_COURT) return null;
    const uv = [
      [xa, 0], [xb, 0], [xb, za], [lu, za], [lu, zb], [xb, zb],
      [xb, lv], [xa, lv], [xa, zb], [0, zb], [0, za], [xa, za],
    ];
    return [part(place(cell, alongX, uv, rint(rng, 0, 3)))];
  },

  /** Два корпуса через двор: два разных дома на одном лоте — и по высоте, и по фасаду. */
  bar_pair: (cell, rng) => {
    const { alongX, lu, lv } = frame(cell);
    if (lu < 2 * MIN_SIDE + MIN_COURT || lv < MIN_SIDE) return null;
    const gap = snap(rand(rng, MIN_COURT, Math.min(8, lu - 2 * MIN_SIDE)));
    const cut = snap(rand(rng, MIN_SIDE + gap / 2, lu - MIN_SIDE - gap / 2));
    const a = { u0: 0, u1: snap(cut - gap / 2) }, b = { u0: snap(cut + gap / 2), u1: lu };
    const rect = s => (alongX
      ? { minX: snap(cell.minX + s.u0), maxX: snap(cell.minX + s.u1), minZ: cell.minZ, maxZ: cell.maxZ }
      : { minX: cell.minX, maxX: cell.maxX, minZ: snap(cell.minZ + s.u0), maxZ: snap(cell.minZ + s.u1) });
    const parts = [
      part(rectPoly(rect(a)), { tag: 'a', hMul: r3(rand(rng, 0.6, 1)) }),
      part(rectPoly(rect(b)), { tag: 'b' }),
    ];
    return parts.every(p => usable(boundsOf(p.poly))) ? parts : null;
  },

  /** Ступени: два яруса с отступом — кровля нижнего становится террасным силуэтом. */
  stepped2: (cell, rng) => stepped(cell, rng, 2),

  /** Три яруса — силуэт делового квартала; верхний всегда тоньше нижнего. */
  stepped3: (cell, rng) => stepped(cell, rng, 3),

  /**
   * Башня на подиуме: основание во весь лот, башня — в нём на отметке кровли
   * основания. Тот же приём, что в полигоне этапа 3: подиум держит фасад у
   * улицы, башня — силуэт района.
   */
  podium_tower: (cell, rng) => {
    const w = cell.maxX - cell.minX, d = cell.maxZ - cell.minZ;
    const side = Math.min(w, d);
    if (side < MIN_SIDE + 2) return null;
    const tw = snap(rand(rng, MIN_SIDE, side - 1.5));
    const ox = snap(rand(rng, 0.75, w - tw - 0.75));
    const oz = snap(rand(rng, 0.75, d - tw - 0.75));
    const tower = {
      minX: snap(cell.minX + ox), maxX: snap(cell.minX + ox + tw),
      minZ: snap(cell.minZ + oz), maxZ: snap(cell.minZ + oz + tw),
    };
    return [
      part(rectPoly(cell), { mul: 0.25 }),
      part(rectPoly(tower), { tag: 'top', mul: 0.75, stacked: true }),
    ];
  },
};

/**
 * Ступенчатый силуэт: каждый следующий ярус вложен в предыдущий и сдвинут к
 * одному борту (симметричная пирамида читалась бы как одна и та же ёлка).
 */
function stepped(cell, rng, tiers) {
  const shares = tiers === 2 ? [0.6, 0.4] : [0.5, 0.3, 0.2];
  const parts = [];
  let cur = { ...cell };
  for (let i = 0; i < tiers; i++) {
    if (!usable(cur)) break;
    parts.push(part(rectPoly(cur), {
      tag: i ? `t${i}` : '',
      mul: shares[i],
      stacked: i > 0,
    }));
    const w = cur.maxX - cur.minX, d = cur.maxZ - cur.minZ;
    if (w < MIN_SIDE + 2 || d < MIN_SIDE + 2) break;
    const ix = snap(rand(rng, 1, (w - MIN_SIDE) / 2)), iz = snap(rand(rng, 1, (d - MIN_SIDE) / 2));
    const lx = snap(rand(rng, 0.5, ix - 0.5)), tz = snap(rand(rng, 0.5, iz - 0.5));
    cur = {
      minX: snap(cur.minX + lx), maxX: snap(cur.maxX - (ix - lx)),
      minZ: snap(cur.minZ + tz), maxZ: snap(cur.maxZ - (iz - tz)),
    };
  }
  return parts.length > 1 ? parts : null;
}

export const ARCHETYPE_NAMES = Object.keys(CITY_ARCHETYPES);
export const STYLE_NAMES = Object.keys(CITY_STYLES);
/** Дворовые формы: лот, помеченный на двор, обязан замкнуться вокруг пустыря, а не встать коробкой. */
const COURTYARD_NAMES = ['u', 't', 'l', 'bar_pair'];

// ------------------------------------------------------------- разворот секции

/** Значения по умолчанию: район описывает геометрию квартала и стиль, остальное — допущения. */
const DISTRICT_DEFAULTS = {
  style: 'mixed',
  street: { pitch: 46, width: 14 },
  lot: { pitch: 12, inset: 1.6, merge: 0.3 },
  height: { minFloors: 2, maxFloors: 9, floorHeight: 3.4 },
  tower: { chance: 0.05, floors: [18, 44], floorHeight: 4 },
  archetypes: ARCHETYPE_NAMES,
  enterableEvery: 18,
  skip: 0.1,
  courtyard: 0.12,
  roofs: { walkable: true, access: 0.45, parapet: J.parapetHeight },
};

function districtSpec(d) {
  const out = { ...DISTRICT_DEFAULTS, ...d };
  for (const key of ['street', 'lot', 'height', 'tower', 'roofs']) {
    out[key] = { ...DISTRICT_DEFAULTS[key], ...(d[key] ?? {}) };
  }
  return out;
}

/**
 * Кадр района: поворот вокруг центра его блока. `yaw` 0 или нет — кадра нет
 * (`frameAt` отдаёт null), и весь район идёт прежним осевым путём без единой
 * лишней операции: главы 10 это обязаны касаться побайтово.
 */
const districtFrame = d => frameAt(
  r3((d.block.minX + d.block.maxX) / 2), r3((d.block.minZ + d.block.maxZ) / 2), d.yaw ?? 0,
);

/**
 * Ключи, которые генератор действительно читает. Неизвестный ключ — ошибка ещё
 * до первого вызова ГПСЧ: секция `city` разворачивается в улицы и дома, и
 * проигнорированное поле означает, что автор получил НЕ то, что написал. Так
 * «косой район» (`yaw`), его граница-многоугольник и профиль улицы по рельефу
 * (`street.grade`) не соберутся молча прямым городом на плоскости — поле
 * добавляется в этот список только вместе с его реализацией.
 */
const CITY_KEYS = ['seed', 'districts', 'track'];
const DISTRICT_KEYS = ['id', 'name', 'style', 'block', 'street', 'lot', 'height',
  'tower', 'archetypes', 'enterableEvery', 'skip', 'courtyard', 'roofs', 'yaw', 'polygon'];
const DISTRICT_SECTION_KEYS = {
  street: ['pitch', 'width', 'grade'],
  lot: ['pitch', 'inset', 'merge'],
  height: ['minFloors', 'maxFloors', 'floorHeight'],
  tower: ['chance', 'floors', 'floorHeight'],
  roofs: ['walkable', 'access', 'parapet'],
};
/** Поля секций района, живущие только в v2 (см. `V2_DISTRICT_KEYS`). */
const V2_DISTRICT_SECTION_KEYS = { street: ['grade'] };

const unknownIn = (obj, allowed) => Object.keys(obj ?? {}).filter(k => !allowed.includes(k));

/**
 * Поля v2 в секции `city`. Глава 10 (`kind: 'json'`) их принять не обязана:
 * заморозка v1 держится не только схемой уровней, но и здесь, потому что `city`
 * разворачивается **до** валидатора — схема просто не увидела бы район, которого
 * больше нет. Молчание генератора опаснее ошибки: косой район собрался бы осевым.
 */
const V2_DISTRICT_KEYS = ['yaw', 'polygon'];

/**
 * Что запрещено ещё до первого вызова ГПСЧ. Ошибки копятся списком: правка
 * конфигурации района — это цифры, и владелец обязан увидеть все несостыковки
 * за один прогон, а не по одной.
 */
function cityConfigErrors(city, ground, districts, v2) {
  const errors = [];
  const half = ground.size / 2;
  if (!Number.isInteger(city.seed)) errors.push(`city.seed ${city.seed} — не целое: ГПСЧ mulberry32 работает с 32-битным сидом`);
  for (const k of unknownIn(city, CITY_KEYS)) {
    errors.push(`city: ключ '${k}' генератор не читает — район с ним собрался бы без этого поля`);
  }
  if (city.track) errors.push(...trackConfigErrors(city.track, ground, v2));
  const seen = new Set();
  for (const d of districts) {
    if (!d.id) { errors.push('city.districts: у района нет id — его улицы и лоты не получат имён'); continue; }
    if (seen.has(d.id)) errors.push(`city.districts: id района '${d.id}' уже занят`);
    seen.add(d.id);
    for (const k of unknownIn(d, DISTRICT_KEYS)) {
      errors.push(`city.districts (${d.id}): ключ '${k}' генератор не читает — район собрался бы без него`);
    }
    for (const k of V2_DISTRICT_KEYS) {
      if (!v2 && d[k] !== undefined) {
        errors.push(`city.districts (${d.id}): '${k}' — поле v2, а глава 'json': район с ним собрался бы осевым. kind 'json2'`);
      }
    }
    for (const [section, allowed] of Object.entries(DISTRICT_SECTION_KEYS)) {
      for (const k of unknownIn(d[section], allowed)) {
        errors.push(`city.districts (${d.id}).${section}: ключ '${k}' генератор не читает — ${section} собрался бы без него`);
      }
      for (const k of V2_DISTRICT_SECTION_KEYS[section] ?? []) {
        if (!v2 && d[section]?.[k] !== undefined) {
          errors.push(`city.districts (${d.id}).${section}: '${k}' — поле v2, а глава 'json': улица района `
            + 'собиралась бы плоской и на одной отметке. kind \'json2\'');
        }
      }
    }
    const spec = districtSpec(d);
    // предел уклона настила — число профиля улицы (этап 6); 0 значит «плоско»,
    // круче предела схемы нога не держит, а 0,3 м/м и есть `J.maxSlope`
    if (spec.street.grade !== undefined && !(spec.street.grade > 0 && spec.street.grade <= J.maxSlope)) {
      errors.push(`city.districts (${d.id}).street.grade ${spec.street.grade} вне (0; ${J.maxSlope}] — `
        + `схема и так бракует настил круче ${J.maxSlope} м/м, а нулевой уклон означает плоскую улицу`);
    }
    const b = d.block;
    if (!b) { errors.push(`city.districts (${d.id}): нет блока — генератору негде встать`); continue; }
    // косой район стоит весь в своих осях, поэтому в землю вписывается его
    // ПОВЁРНУТЫЙ габарит: блок 120 м под 45° занимает около 170 м, и проверка
    // одних лишь `minX..maxZ` пропустила бы район за краем уровня
    const frame = districtFrame(d);
    const world = rotatedBounds(b, frame);
    for (const [k, v] of [['minX', world.minX], ['maxX', world.maxX], ['minZ', world.minZ], ['maxZ', world.maxZ]]) {
      if (Math.abs(v) > half) {
        errors.push(`city.districts (${d.id}): ${frame ? 'габарит повёрнутого блока' : 'блок'} ${k} = ${r3(v)} `
          + `вне земли ${ground.size} м (±${half})`);
      }
    }
    if (d.yaw !== undefined && !(Math.abs(d.yaw) <= 180)) {
      errors.push(`city.districts (${d.id}): yaw ${d.yaw}° вне [−180; 180] — угол района обязан быть одним поворотом, а не числом оборотов`);
    }
    if (d.polygon !== undefined) {
      if (!Array.isArray(d.polygon)) {
        errors.push(`city.districts (${d.id}).polygon: нужен список вершин {x, z}, а не '${typeof d.polygon}'`);
      } else {
        const poly = d.polygon.map(p => ({ x: r3(p.x), z: r3(p.z) }));
        if (poly.length < 3) errors.push(`city.districts (${d.id}).polygon: меньше трёх вершин — границей района служит замкнутый контур`);
        else {
          const area = Math.abs(signedArea(poly));
          if (!(area > MIN_SIDE * MIN_SIDE)) {
            errors.push(`city.districts (${d.id}).polygon: площадь ${r3(area)} м² — контур вырожден или тоньше дома (${MIN_SIDE} м)`);
          }
          const pb = boundsOf(poly);
          if (pb.minX < b.minX - 1e-6 || pb.maxX > b.maxX + 1e-6 || pb.minZ < b.minZ - 1e-6 || pb.maxZ > b.maxZ + 1e-6) {
            errors.push(`city.districts (${d.id}).polygon: выходит за свой блок (${r3(pb.minX)}…${r3(pb.maxX)} × `
              + `${r3(pb.minZ)}…${r3(pb.maxZ)} против ${b.minX}…${b.maxX} × ${b.minZ}…${b.maxZ}) — `
              + 'блок остаётся габаритом полигона, по нему считают сетку улиц, и лоты за его краем не появились бы');
          }
        }
      }
    }
    const sw = spec.street.width / 2 + VERGE;
    for (const s of ['X', 'Z']) {
      const span = b[`max${s}`] - b[`min${s}`];
      if (span < spec.street.pitch + 2 * sw) {
        errors.push(`city.districts (${d.id}): блок по ${s} = ${r3(span)} м не вмещает ни одного ряда кварталов: `
          + `нужно не меньше ${r3(spec.street.pitch + 2 * sw)} м (шаг улиц, два борта и верга)`);
      }
      if (span < 2 * MIN_SIDE) errors.push(`city.districts (${d.id}): блок по ${s} = ${r3(span)} м уже двух домов`);
    }
    if (spec.street.pitch <= spec.street.width + 2 * VERGE) {
      errors.push(`city.districts (${d.id}): street.pitch ${spec.street.pitch} не больше настила ${spec.street.width} плюс две верги — параллельные улицы пересеклись бы настилами`);
    }
    if (spec.lot.pitch <= 2 * spec.lot.inset + MIN_SIDE) {
      errors.push(`city.districts (${d.id}): lot.pitch ${spec.lot.pitch} при двух отступах ${spec.lot.inset} даёт лот тоньше ${MIN_SIDE} м — дома не будет`);
    }
    if (!CITY_STYLES[spec.style]) errors.push(`city.districts (${d.id}): стиль '${spec.style}' не описан (есть ${STYLE_NAMES.join('|')})`);
    for (const a of d.archetypes ?? []) {
      if (!CITY_ARCHETYPES[a]) errors.push(`city.districts (${d.id}): архетип '${a}' не описан (есть ${ARCHETYPE_NAMES.join('|')})`);
    }
    const h = spec.height;
    if (h.minFloors > h.maxFloors) errors.push(`city.districts (${d.id}): minFloors ${h.minFloors} больше maxFloors ${h.maxFloors}`);
    if (h.floorHeight < 2.6 || h.floorHeight > 5.5) errors.push(`city.districts (${d.id}): floorHeight ${h.floorHeight} вне [2.6; 5.5] — генератор всё равно бы её сжал`);
    const t = spec.tower;
    if (t.floors[0] > t.floors[1]) errors.push(`city.districts (${d.id}): tower.floors [${t.floors[0]}, ${t.floors[1]}] — нижняя граница выше верхней`);
    if (t.floors[1] > J.shellFloorsMax) errors.push(`city.districts (${d.id}): tower.floors ${t.floors[1]} больше ${J.shellFloorsMax} этажей башни`);
    for (const [k, v] of [['skip', spec.skip], ['courtyard', spec.courtyard], ['tower.chance', t.chance], ['roofs.access', spec.roofs.access]]) {
      if (!(v >= 0 && v <= 1)) errors.push(`city.districts (${d.id}): ${k} = ${v} — это вероятность, ей место в [0; 1]`);
    }
    if (spec.roofs.parapet > 1.5) errors.push(`city.districts (${d.id}): парапет ${spec.roofs.parapet} выше допуска схемы (1,5 м)`);
  }
  // блоки районов обязаны не пересекаться: у каждого свои улицы, и два квартала
  // в одном месте дали бы два настила в одной плоскости (мигающий z-buffer).
  // Косой блок сравнивается своим ориентированным планом, а не габаритом:
  // квадрат вокруг района под 45° накрывает полкарты, и по габариту легально
  // вписанный в его угол сосед считался бы столкновением
  for (let i = 0; i < districts.length; i++) {
    for (let k = i + 1; k < districts.length; k++) {
      const a = districts[i].block, b = districts[k].block;
      if (!a || !b) continue;
      const A = obbOf(a, districtFrame(districts[i])), B = obbOf(b, districtFrame(districts[k]));
      if (obbHitsObb(A, B, 0.05)) {
        errors.push(`city.districts: блоки '${districts[i].id}' и '${districts[k].id}' пересекаются — улицы обоих районов легли бы одна на другую`);
      }
    }
  }
  return errors;
}

// ------------------------------------------------------------- трасса (глава 13)

/**
 * Кольцо гоночной трассы (`city.track`) — хребет маршрута: наземные улицы
 * главы 13 под ним, подъезд по съезду, обход петли, спуск вторым съездом.
 * Форма задаётся числами и сидом, а не списком координат (решение владельца,
 * plan §2.2): правка `radius` не требует переписывать дюжину дуг рукой, как это
 * делает автор в `level-12`.
 *
 * Профиль кривизны собирается **скруглением вершин звездообразного полигона**,
 * а не интегрированием кривизны вдоль оси. Причина — замкнутость: сумма
 * внешних углов замкнутой петли обязана быть ровно 2π, и интегрированием это
 * доводится численно, отчего шов кольца расходится на доли градуса (а `arc`
 * в данных — это `from`/`to`, и нестыкующийся шов нормализатор увидит как
 * разрыв полотна). У скруглённого полигона и замкнутость, и касательность
 * стыков следуют из построения: дуга касается обоих своих рёбер по определению
 * `T = R·tan(|δ|/2)`, а прямая — это остаток ребра между точками касания.
 */
export const TRACK_DEFAULTS = {
  id: 'ring',
  center: [0, 0],
  radius: 120,
  turns: 12,
  minRadius: 60,
  curvatureJitter: 0.35,
  width: 10,
  bank: 6,
  grade: 0.08,
  clearance: 3,
  amplitude: 4,
  waves: 2,
  rails: true,
  lamps: true,
  entries: 2,
};
const TRACK_KEYS = Object.keys(TRACK_DEFAULTS);

/**
 * Хорда, на которую коридор набивается в препятствия. Меньше — больше коробок
 * в `ctx.obstacles` (сравнение лота с каждой стоит `obbHitsRect`), больше —
 * коробка дугой накрывает соседний лот, который от полотна далеко. 8 м при
 * ширине полотна 10 м держит ошибку «прямоугольник вместо сектора» в единицах
 * десятых долей метра.
 */
const TRACK_CHORD = 8;

/**
 * Верх дрожи вершины: при `curvatureJitter ≥ 0,5` звезду можно свернуть так,
 * что соседняя вершина залезет за центр, и кольцо перестанет быть выпуклым
 * контуром. Предел проверяется гейтом, а не клампом: тихая правка числа
 * означала бы, что автор получил форму не из брифа.
 */
const TRACK_MAX_JITTER = 0.5;

/**
 * Минимальный радиус дуги, который ещё можно записать в данные: `V2_ARC.radius`
 * схемы начинается с 2 м. Скругление тоньше — это угол, а не дуга, и его
 * эмиссия (этап 3) отдаёт две пластины с общим торцом.
 */
export const TRACK_ARC_MIN = 2;

/**
 * Наименьшая **длина** дуги, которую ещё есть смысл писать в данные. Отметки
 * полотна округляются до миллиметра, и на пролёте короче метра это округление
 * само по себе меняет уклон больше, чем `grade`; кроме того, на такой дуге
 * переход крена (`J.sweepRibbonTwist`) не помещается. Сброс в ноль делает
 * вершину углом — см. комментарий в `trackCenterline`.
 */
export const TRACK_ARC_SLIVER = 1;

export const trackSpec = t => {
  const out = { ...TRACK_DEFAULTS, ...t };
  const c = Array.isArray(t?.center) ? t.center : TRACK_DEFAULTS.center;
  out.center = { x: r3(c[0] ?? 0), z: r3(c[1] ?? 0) };
  return out;
};

/**
 * Что бракуется в секции `track` до первого вызова ГПСЧ. Числа здесь — единое
 * место, где предел связывается с причиной: `grade` сравнивается с `J.maxSlope`
 * (тот же предел, что у схемы для продольного уклона оси), а подъём волны — с
 * **наименьшей длиной петли**, потому что `amplitude·(1 − cos(waves·2π·s/L))/2`
 * круче всего на её нулевом пересечении, где тангенс ровно
 * `amplitude·waves·π/L`, а `L` до дрожи вершин неизвестен. Нижняя граница
 * регулярна: хорда между двумя вершинами с шагом угла `2π/turns` и радиусами не
 * меньше `radius·(1 − jitter)` не короче `2·ρ_min·sin(π/turns)`, отсюда
 * `L ≥ 2·turns·ρ_min·sin(π/turns)`.
 */
function trackConfigErrors(track, ground, v2) {
  const errors = [];
  const t = trackSpec(track);
  if (!v2) {
    errors.push('city.track: трасса — поле v2, а глава `kind: \'json\'`: кольцо из дуг и повёрнутых '
      + 'пластин схема v1 не примет. kind \'json2\'');
  }
  for (const k of unknownIn(track, TRACK_KEYS)) {
    errors.push(`city.track: ключ '${k}' генератор не читает — кольцо собралось бы без него`);
  }
  if (typeof t.id !== 'string' || !t.id) {
    errors.push(`city.track.id '${t.id}' — нужен префикс id дорог полотна ('ring_ring', 'ring_e0')`);
  }
  if (!Number.isInteger(t.turns) || t.turns < 3) {
    errors.push(`city.track.turns ${track.turns} — нужно целое ≥ 3: у двух вершин петля вырождается в прямую туда и обратно`);
  }
  if (!(t.radius > 0)) {
    errors.push(`city.track.radius ${track.radius} — обязателен и больше нуля: по нему задаётся и размер кольца, и предел высот (подъём волны меряется его длиной)`);
  }
  if (!(t.minRadius > 0)) errors.push(`city.track.minRadius ${track.minRadius} — должен быть больше нуля: это радиус самого крутого поворота`);
  if (t.radius < t.minRadius) {
    errors.push(`city.track: radius ${t.radius} меньше minRadius ${t.minRadius} — скругление не может быть шире, чем сама петля`);
  }
  if (!(t.width >= 2 && t.width <= 30)) {
    errors.push(`city.track.width ${t.width} вне [2; 30] — за тем пределом схема бракует настил`);
  }
  if (!(t.minRadius - t.width / 2 > 0.5)) {
    errors.push(`city.track: minRadius ${t.minRadius} при ширине ${t.width} оставляет внутреннюю кромку на ${r3(t.minRadius - t.width / 2)} м от оси дуги — нужно больше 0,5 м, иначе полотно на повороте сложится в себя`);
  }
  if (!(t.grade > 0 && t.grade <= J.maxSlope)) {
    errors.push(`city.track.grade ${t.grade} вне (0; ${J.maxSlope}] — круче ${J.maxSlope} м/м схема бракует ось настила, а нулевой уклон означает плоское кольцо`);
  }
  if (!(Math.abs(t.bank) <= 30)) {
    errors.push(`city.track.bank ${t.bank}° вне [−30; 30] — за этим пределом крен дуги не принимает схема`);
  }
  if (!(t.clearance > J.streetRise)) {
    errors.push(`city.track.clearance ${t.clearance} — зазор полотна над корытом поля обязан превышать подъём улицы над грунтом (${J.streetRise} м): при меньшем съезд стартует с отметки ниже асфальта, который он принимает, а при нуле полотно ляжет на грунт и под кольцом не останется улицы`);
  }
  if (!(t.amplitude >= 0)) errors.push(`city.track.amplitude ${t.amplitude} — собственная высотная волна не бывает отрицательной (для провала задай рельеф)`);
  if (!Number.isInteger(t.waves) || t.waves < 1) errors.push(`city.track.waves ${track.waves} — нужно целое ≥ 1: это число волн на петле`);
  if (typeof t.rails !== 'boolean' || typeof t.lamps !== 'boolean') {
    errors.push('city.track: rails и lamps — переключатели (true/false), а не числа');
  }
  if (!Number.isInteger(t.entries) || t.entries < 0 || t.entries > 8) {
    errors.push(`city.track.entries ${track.entries} — нужно целое в [0; 8]: съезды расставляются по слотам длины, и больше восьми на кольцо не встанет`);
  }
  if (!(t.curvatureJitter >= 0 && t.curvatureJitter < TRACK_MAX_JITTER)) {
    errors.push(`city.track.curvatureJitter ${t.curvatureJitter} вне [0; ${TRACK_MAX_JITTER}) — при большей дрожи вершину звезды можно свернуть за центр, и перестанет быть выпуклым контуром (а вместе с ним — и коридор)`);
  }
  if (t.radius > 0 && t.turns >= 3) {
    // самая короткая хорда звезды: две вершины на минимальном радиусе,
    // разделённые шагом угла (теорема косинусов ⇒ d ≥ 2·ρmin·sin(π/turns))
    const minEdge = 2 * t.radius * (1 - t.curvatureJitter) * Math.sin(Math.PI / t.turns);
    if (minEdge < MIN_RUN) {
      errors.push(`city.track: при turns ${t.turns} и дрожи ${t.curvatureJitter} самое короткое ребро выходит ${r3(minEdge)} м — прямая короче ${MIN_RUN} м, в неё не встанет ни решётка узлов, ни фонарь`);
    }
    // длина петли не меньше `turns` таких хорд — на ней и меряется волна
    const minLoop = t.turns * minEdge;
    if (t.amplitude * t.waves * Math.PI > t.grade * minLoop) {
      errors.push(`city.track: волна ${t.amplitude} м × ${t.waves} не влезает в уклон ${t.grade} м/м на петле не короче ${r3(minLoop)} м `
        + `(нужно amplitude·waves·π ≤ grade·L, то есть ≤ ${r3(t.grade * minLoop / Math.PI)} м·волн): её подъём круче предела,`
        + ' и мажоранте ничего не остаётся, кроме как поднять полотно над полем');
    }
    const reach = t.radius * (1 + t.curvatureJitter) + t.width / 2 + VERGE;
    const cx = Math.abs(t.center.x), cz = Math.abs(t.center.z);
    if (cx + reach > ground.size / 2 || cz + reach > ground.size / 2) {
      errors.push(`city.track: кольцо с центром (${cx}, ${cz}) и вылетом ${r3(reach)} м не влезает в землю ${ground.size} м `
        + `(нужно ≤ ${r3(ground.size / 2)} м с каждой стороны) — полотно за краем уровня не имеет ни опоры, ни картинки`);
    }
  }
  return errors;
}

/**
 * Ось кольца: вершины → рёбра → скругления → элементы, и коридор над ними.
 * Ничего не эмитит в дороги (это этап 3): на выходе профиль кривизны, длина,
 * коробка коридора для отбраковки лотов и точки съездов.
 *
 * Расход ГПСЧ фиксирован и не зависит от того, что получилось: **две ноты на
 * вершину** (доля, на которую радиус звезды уходит от правильного многоугольника,
 * и доля между `minRadius` и `radius` для скругления) и **три ноты на съезд**
 * (место в своём слоте, сторона ухода, удлинение пролёта). Отказов здесь нет,
 * поэтому сжигать «несостоявшиеся» вызовы нечем — число вызовов равно
 * `turns·2 + entries·3` (план обещал `turns + entries·3`; вторая нота на
 * вершину появилась, когда скругление стало независимым параметром).
 */
export function trackCenterline(spec, ctx) {
  const rng = ctx.rng;
  const n = spec.turns;
  const step = (Math.PI * 2) / n;
  const verts = [];
  for (let i = 0; i < n; i++) {
    const th = i * step;
    const rho = spec.radius * (1 + spec.curvatureJitter * (2 * rng() - 1));
    verts.push({
      x: r3(spec.center.x + Math.cos(th) * rho),
      z: r3(spec.center.z + Math.sin(th) * rho),
    });
  }
  const edges = verts.map((v, i) => {
    const w = verts[(i + 1) % n];
    const dx = w.x - v.x, dz = w.z - v.z, L = Math.hypot(dx, dz);
    return { x0: v.x, z0: v.z, x1: w.x, z1: w.z, L, ux: dx / L, uz: dz / L };
  });
  // знак угла — сторона поворота, величина — раствор дуги в вершине
  const turn = verts.map((_, i) => {
    const p = edges[(i - 1 + n) % n], q = edges[i];
    return Math.atan2(p.ux * q.uz - p.uz * q.ux, p.ux * q.ux + p.uz * q.uz);
  });

  // скругление: радиус из сида, урезанный так, чтобы касания соседних дуг не
  // съели прямую короче `MIN_RUN`. Предел — половина запаса каждого из двух
  // прилежащих рёбер, делённая на `tan(|δ|/2)`: тогда `T_i + T_{i+1} ≤ L − MIN_RUN`
  // выполняется гарантированно и за один проход, без итераций.
  //
  // Дуга тоньше `TRACK_ARC_MIN` (2 м — нижний предел `V2_ARC.radius` схемы) не
  // просто не эмитится, а **сбрасывается в ноль вместе с касаниями**: иначе
  // соседние прямые кончались бы в A_i и B_i, разнесённых на `2·T_i`, и в оси
  // появилась бы дыра (замер первой пробы этого этапа: разрыв 0,0127 м в шве и
  // в середине кольца, а коридор над ней — две щели по полотно шириной).
  //
  // Тоньше `TRACK_ARC_SLIVER` по **длине** сбрасывается по той же причине и с
  // той же операцией: раствор почти прямой вершины (дрожь радиуса делает её
  // 0,2°) даёт дугу в 0,104 м при радиусе 30 м, а отметки полотна пишутся
  // миллиметрами — на такой длине округление само по себе даёт уклон 0,0868
  // при обещанном `grade` 0,08 (замер этапа 3). Вершина без скругления — угол,
  // зато две прямые сходятся в ней в одну точку, а излом в 0,2° глаз не видит.
  const R = [], T = [], A = [], B = [];
  for (let i = 0; i < n; i++) {
    const t = Math.tan(Math.abs(turn[i]) / 2);
    const drawn = spec.minRadius + (spec.radius - spec.minRadius) * rng();
    const cap = t > 0
      ? Math.min((edges[(i - 1 + n) % n].L - MIN_RUN) / (2 * t), (edges[i].L - MIN_RUN) / (2 * t))
      : 0;
    let r = t > 0 ? clamp(Math.min(drawn, cap), 0, spec.radius) : 0;
    if (r < TRACK_ARC_MIN || r * Math.abs(turn[i]) < TRACK_ARC_SLIVER) r = 0;
    R[i] = r;
    T[i] = r * t;
    A[i] = { x: verts[i].x - edges[(i - 1 + n) % n].ux * T[i], z: verts[i].z - edges[(i - 1 + n) % n].uz * T[i] };
    B[i] = { x: verts[i].x + edges[i].ux * T[i], z: verts[i].z + edges[i].uz * T[i] };
  }

  // обход от точки касания A вершины 0: дуга_i, прямая по ребру i, дуга_{i+1}…
  // последняя прямая кончается ровно в A_0 (те же числа, те же точки), поэтому
  // шов кольца замкнут построением, а не подгонкой
  const elements = [];
  let s = 0;
  for (let i = 0; i < n; i++) {
    if (R[i] > 0) {
      const p = edges[(i - 1 + n) % n], q = edges[i];
      // центр — на биссектрисе угла вершины: `V + (b − a)·R / sin|δ|`. Вектор
      // `(b − a)` имеет длину ровно `2·sin(|δ|/2)`, поэтому смещение выходит
      // `R / cos(|δ|/2)` — ровно столько, чтобы окружность коснулась обеих
      // прямых. Знак δ учитывать не надо: вогнутую вершину (а при дрожи радиуса
      // их бывает несколько на кольцо) `(b − a)` разворачивает наружу сам
      const k = R[i] / Math.abs(Math.sin(turn[i]));
      const cx = verts[i].x + (q.ux - p.ux) * k, cz = verts[i].z + (q.uz - p.uz) * k;
      const a0 = Math.atan2(A[i].z - cz, A[i].x - cx);
      const len = R[i] * Math.abs(turn[i]);
      elements.push({ kind: 'arc', i, cx, cz, radius: R[i], a0, span: turn[i],
        x0: A[i].x, z0: A[i].z, x1: B[i].x, z1: B[i].z, s0: s, len });
      s += len;
    }
    const j = (i + 1) % n;
    const len = edges[i].L - T[i] - T[j];
    if (len > 1e-9) {
      elements.push({ kind: 'line', i, x0: B[i].x, z0: B[i].z, x1: A[j].x, z1: A[j].z,
        ux: edges[i].ux, uz: edges[i].uz, s0: s, len });
      s += len;
    }
  }
  const track = { spec, verts, edges, turn, R, T, elements, length: s, band: [], entries: [] };

  // коридор: полотно плюс верга, набитое хордами по элементам. Он только для
  // лотов (`streets: false`) — под кольцом идти можно, строить нельзя, и улицы
  // района обязаны продолжать ехать под подъёмным настилом
  for (const el of track.elements) {
    if (el.kind === 'line') { pushBand(track, el.x0, el.z0, el.x1, el.z1); continue; }
    const k = Math.max(1, Math.ceil(el.len / TRACK_CHORD));
    for (let j = 0; j < k; j++) {
      const a = el.a0 + el.span * (j / k), b = el.a0 + el.span * ((j + 1) / k);
      pushBand(track, el.cx + Math.cos(a) * el.radius, el.cz + Math.sin(a) * el.radius,
        el.cx + Math.cos(b) * el.radius, el.cz + Math.sin(b) * el.radius);
    }
  }

  // съезды: слоты длины с дрожью, сторона ухода (внутрь кольца или наружу) и
  // удлинение пролёта. Профиль высот и сам настил — этапы 2 и 3; здесь только
  // точка ухода с петли и её направление
  for (let k = 0; k < spec.entries; k++) {
    const pos = (k + 0.5 + (rng() - 0.5) * 0.7) / spec.entries;
    const at = trackAxisAt(track, pos * track.length);
    let nx = -at.tz, nz = at.tx;
    if ((nx * (spec.center.x - at.x) + nz * (spec.center.z - at.z) < 0) === (rng() < 0.5)) {
      nx = -nx; nz = -nz;
    }
    track.entries.push({
      // `s` остаётся двойным: это параметр оси, а не число брифа (полотно по
      // нему пишется на этапе 3, и там оно округляется до миллиметра)
      id: `${spec.id}_e${k}`, n: k, s: at.s, x: at.x, z: at.z, dx: nx, dz: nz,
      inward: nx * (spec.center.x - at.x) + nz * (spec.center.z - at.z) > 0,
      runFactor: r3(0.85 + rng() * 0.3),
    });
  }
  return track;
}

/**
 * Коробка коридора над отрезком оси: полотно плюс верга. Общий для петли и
 * съездов — и там, и там под настилом строить нельзя, а идти можно.
 */
function pushBand(track, x0, z0, x1, z1) {
  const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz);
  if (!(L > 1e-9)) return;
  const ux = dx / L, uz = dz / L;
  const bandHalf = r3(track.spec.width / 2 + VERGE);
  const obb = { cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, hx: L / 2, hz: bandHalf, c: ux, s: uz };
  // `obb` хранится коробкой в соглашении `obbFigure` (её же читает
  // `obbHitsRect`), а `rect` — габарит: препятствие без него нельзя ни
  // отбраковать лот косого района, ни посчитать пересечение с его блоком
  track.band.push({ rect: obbRect(obb), obb: { obb }, why: `коридор ${track.spec.id}`,
    streets: false, band: true });
}

/** Габарит ориентированной коробки (по нему косой район пересчитывает препятствие). */
function obbRect(o) {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const x = o.cx + sx * o.hx * o.c - sz * o.hz * o.s;
      const z = o.cz + sx * o.hx * o.s + sz * o.hz * o.c;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }
  }
  return { minX: r3(minX), maxX: r3(maxX), minZ: r3(minZ), maxZ: r3(maxZ) };
}

/**
 * Точка оси на пройденном расстоянии `s` (обход — modulo длины) и её
 * касательная. По ней меряются корыто поля (этап 2), установка съезда и
 * разметка полотна (этап 3): всякий, кто читает ось, обязан делать это этой
 * функцией, иначе профиль высот и эмиссия разойдутся по фазе.
 */
export function trackAxisAt(track, s) {
  const L = track.length;
  let u = L > 0 ? s % L : 0;
  if (u < 0) u += L;
  const els = track.elements;
  for (let i = 0; i < els.length; i++) {
    const el = els[i];
    const last = i + 1 === els.length;
    if (u > el.s0 + el.len && !last) continue;
    const f = el.len > 0 ? clamp((u - el.s0) / el.len, 0, 1) : 0;
    if (el.kind === 'line') {
      return { s: u, x: el.x0 + (el.x1 - el.x0) * f, z: el.z0 + (el.z1 - el.z0) * f,
        tx: el.ux, tz: el.uz, el };
    }
    const a = el.a0 + el.span * f, w = Math.sign(el.span);
    return { s: u, x: el.cx + Math.cos(a) * el.radius, z: el.cz + Math.sin(a) * el.radius,
      tx: -Math.sin(a) * w, tz: Math.cos(a) * w, el };
  }
  return { s: u, x: track.verts[0].x, z: track.verts[0].z, tx: 1, tz: 0, el: null };
}

/**
 * Шаг, с которого требование читается по петле. 2 м — это и вчетверо мельче
 * решёточного шага навигации (`J.navStep` 6), и короче любой хорды коридора,
 * поэтому перелом профиля внутри шага не может скрыться от гейта уклона; при
 * 8 м мажоранта на петле 750 м стоила бы 94² операций вместо 375².
 */
const TRACK_PROFILE_STEP = 2;

/**
 * Поле под осью трассы — по **корыту**, а не по осевой: тот же приём, что
 * `fieldAcross` у улиц района (правило главы 12 — пластина держит одну
 * плоскость и поперёк себя, и фит «по оси» закапал поднятый борт проспекта на
 * 0,24 м). Для трассы корыто важнее: полотно поднято над грунтом, и под него
 * смотрит не нога, а опоры, но требование одно — плита не смеет быть ниже
 * грунта ни одним бортом.
 */
function trackFieldAcross(track, field, groundY, at) {
  const half = track.spec.width / 2;
  let hi = -Infinity;
  for (const v of [-half, 0, half]) {
    const h = field ? field.heightAt(at.x - v * at.tz, at.z + v * at.tx) : groundY;
    if (h > hi) hi = h;
  }
  return hi;
}

/**
 * Профиль высот петли: **наименьшая g-липшицева мажоранта требования**.
 *
 * Требование `need(s) = корыто поля + clearance + волна`, полотно
 * `deck(s) = max_j (need(j) − grade · d(s, j))` с `d` — коротким расстоянием
 * вдоль петли. Это ровно та функция, что (а) нигде не ниже требования и (б) ни
 * на каком прогоне не круче `grade`, и при этом наименьшая из таких: подвес над
 * требованием появляется только там, где поле падает быстрее, чем полотно
 * успевает подняться, — то есть там, где иначе был бы обрыв.
 *
 * Альтернатива «взять поле + зазор», как делают улицы района, отвергнута: она
 * нарушает предел уклона на каждом склоне круче `grade`, а нормализатор потом
 * бракует настил схемой (`|rise| / run ≤ J.maxSlope` — и это только потолок,
 * `grade` трассы вчетверо строже).
 *
 * Волна — формула демо (`amplitude` на `waves` периодов по петле), но **над
 * требованием поля**, а не вокруг средней отметки: как в демо, полотно обязано
 * иметь подъём и на равнине. Первая версия звала волну от `mean` и сравнивала с
 * полом (`max(поле + clearance, mean + amplitude·sin)`) — на главе с
 * `clearance 3` и `amplitude 4` это давало разброс требования 1,00 м вместо
 * авторских 8: волна целиком съедалась зазором, и `amplitude`/`waves` были бы
 * мёртвыми числами брифа. Половинная косинус-волна не опускается под пол, а
 * `waves` целое (гейт схемы) — значит профиль сходится в шве без подгонки.
 */
export function trackProfile(track, field, groundY) {
  const spec = track.spec;
  const L = track.length;
  const n = Math.max(8, Math.round(L / TRACK_PROFILE_STEP));
  const step = L / n;
  const floor = [];
  for (let i = 0; i < n; i++) floor.push(trackFieldAcross(track, field, groundY, trackAxisAt(track, i * step)));
  const need = [];
  let needLo = Infinity, needHi = -Infinity;
  for (let i = 0; i < n; i++) {
    const v = floor[i] + spec.clearance
      + spec.amplitude * (1 - Math.cos((2 * Math.PI * spec.waves * i * step) / L)) / 2;
    need.push(v);
    if (v < needLo) needLo = v;
    if (v > needHi) needHi = v;
  }
  const deck = [];
  let maxSlope = 0, minClear = Infinity, hang = 0;
  for (let i = 0; i < n; i++) {
    let y = need[i];
    for (let j = 0; j < n; j++) {
      let d = Math.abs(i - j) * step;
      if (d > L / 2) d = L - d;
      const v = need[j] - spec.grade * d;
      if (v > y) y = v;
    }
    deck.push(y);
    if (y - floor[i] < minClear) minClear = y - floor[i];
    if (y - need[i] > hang) hang = y - need[i];
  }
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const slope = Math.abs(deck[j] - deck[i]) / step;
    if (slope > maxSlope) maxSlope = slope;
  }
  // разброс **требования**, а не полотна: мажоранта по построению не круче
  // `grade`, а на петле это значит, что её собственный разброс всегда
  // ≤ `grade·L/2` и сравнивать с этим бюджетом нечего (первая версия этапа
  // меряла здесь `deck` и ветка никогда не наступала). Смысл имеет только
  // вопрос, перепадает ли требование больше, чем петля успевает взять своим
  // уклоном: тогда полотну остаётся поднять ВЕСЬ круг, и под столбами растёт
  // этаж, которого никто не просил. Это конфиг, а не случайность сида, —
  // значит ошибка
  const spread = needHi - needLo;
  if (spread > spec.grade * (L / 2) + 1e-9) {
    throw new Error(`city.track «${spec.id}»: петля ${r3(L)} м коротка для разброса требования`
      + ` ${r3(spread)} м при grade ${spec.grade} м/м — нужно не менее ${r3(2 * spread / spec.grade)} м`
      + ` (больше радиус / круче grade / меньше amplitude)`);
  }
  const out = { n, step, floor, need, deck, spread, maxSlope, minClear, hang };
  track.profile = out;
  trackFit(track);
  return out;
}

/**
 * Отметки полотна **на стыках элементов**, а не на пробном шаге профиля.
 *
 * Пластина и дуга держат ОДНУ прямую на всю свою длину, а мажоранта — ломаная с
 * переломами каждые 2 м: хорда по концам пролёта проваливается под ломаную
 * ровно на её выпуклость. Замер первой версии этапа (глава 12 как поле,
 * `grade 0,08`, дефолтная петля) — худший прогиб 0,957 м, то есть асфальт
 * закапывался в требование на целый метр. Подъём каждого пролёта на его же
 * прогиб проблему решает только для него: отметка стыка принадлежит двум
 * пролётам, и у короткой дуги подъём один, у длинной прямой — другой; замер той
 * же версии — ступень 0,931 м на стыке элементов 5 и 6, то есть стена в
 * проезжей части, которую нога не берёт (`CONFIG.jsonMap.stepUp` меньше).
 *
 * Поэтому подгоняется сама ломаная: сначала стыки берут отметку полотна, потом
 * каждый поднятый прогиб добавляется **обоим своим концам** (уклон пролёта не
 * меняется), и поскольку узел общий, сосед получает подъём не меньше своего.
 * Один такой проход снимает все прогибы сразу — правки только прибавляют. Затем
 * уклон приводится к `grade`: узел, опущенный относительно соседа больше, чем
 * на `grade · длину`, поднимается (relaxation по кругу), и это тоже только
 * прибавка, поэтому прогибы не возвращаются.
 *
 * Разница с профилем — в бюджете: мажоранта на шаге 2 м обязана держать
 * разброс `need`, а здесь разброс готового fit'а сравнивается с тем же
 * `grade · L / 2` и перерасход называется ошибкой, а не тихим подъёмом всего
 * круга.
 */
export function trackFit(track) {
  const spec = track.spec, p = track.profile, els = track.elements;
  const m = els.length, g = spec.grade;
  const sNode = [];
  for (let k = 0, acc = 0; k < m; k++) { sNode.push(acc); acc += els[k].len; }
  const v = sNode.map(s => trackDeckAt(track, s));
  // подъём по прогибу хорды: узел получает максимум из прогибов двух своих
  // пролётов, поэтому каждый пролёт поднимается обоими концами не меньше, чем
  // на собственный прогиб
  let liftMax = 0;
  for (let round = 0; round < 4; round++) {
    const lift = new Array(m).fill(0);
    for (let k = 0; k < m; k++) {
      const s0 = sNode[k], len = els[k].len;
      const a = v[k], b = v[(k + 1) % m];
      for (let i = 0; i < p.n; i++) {
        const s = i * p.step;
        if (s <= s0 + 1e-9 || s >= s0 + len - 1e-9) continue;
        const d = p.deck[i] - (a + (b - a) * (s - s0) / len);
        if (d > lift[k]) lift[k] = d;
      }
    }
    let worst = 0;
    for (const l of lift) if (l > worst) worst = l;
    if (worst > liftMax) liftMax = worst;
    if (worst <= 1e-12) break;
    for (let k = 0; k < m; k++) v[k] += Math.max(lift[k], lift[(k - 1 + m) % m]);
  }
  // предел уклона на стыках: подъём пролёта меняет уклон соседа, и низший конец
  // пары поднимается до `grade · длину` пролёта. Это тоже прибавка, поэтому
  // снятые прогибы обратно не возвращаются
  let changed = true, sweeps = 0;
  while (changed && sweeps++ < 4 * m) {
    changed = false;
    for (let k = 0; k < m; k++) {
      const j = (k + 1) % m, budget = g * els[k].len;
      if (v[k] > v[j] + budget + 1e-12) { v[j] = v[k] - budget; changed = true; }
      else if (v[j] > v[k] + budget + 1e-12) { v[k] = v[j] - budget; changed = true; }
    }
  }
  const lo = Math.min(...v), hi = Math.max(...v), spread = hi - lo;
  if (spread > g * track.length / 2 + 1e-9) {
    throw new Error(`city.track «${spec.id}»: петля ${r3(track.length)} м коротка для разброса полотна`
      + ` ${r3(spread)} м после подгонки хорд (требование ${r3(p.spread)} м, подъём хорд ${r3(liftMax)} м)`
      + ` при grade ${g} м/м — нужно не менее ${r3(2 * spread / g)} м`);
  }
  let maxSlope = 0, dip = 0;
  for (let k = 0; k < m; k++) {
    const s0 = sNode[k], len = els[k].len;
    const a = v[k], b = v[(k + 1) % m];
    maxSlope = Math.max(maxSlope, Math.abs(b - a) / len);
    for (let i = 0; i < p.n; i++) {
      const s = i * p.step;
      if (s <= s0 + 1e-9 || s >= s0 + len - 1e-9) continue;
      dip = Math.max(dip, p.deck[i] - (a + (b - a) * (s - s0) / len));
    }
  }
  track.fit = { m, s: sNode, len: els.map(e => e.len), v, spread, liftMax, maxSlope, dip };
  return track.fit;
}

/** Отметка **подогнанного** полотна на пройденном расстоянии — та, что уйдёт в данные. */
export function trackFittedAt(track, s) {
  const f = track.fit;
  if (!f) throw new Error('trackFittedAt: подгонка не посчитана — трассе нужен trackProfile до эмиссии');
  let u = s % track.length;
  if (u < 0) u += track.length;
  let k = 0;
  while (k + 1 < f.m && f.s[k + 1] <= u) k++;
  const a = f.v[k], b = f.v[(k + 1) % f.m];
  return a + (b - a) * ((u - f.s[k]) / f.len[k]);
}

/** Отметка полотна на пройденном расстоянии (линейно между пробами профиля). */
export function trackDeckAt(track, s) {
  const p = track.profile;
  if (!p) throw new Error('trackDeckAt: профиль не посчитан — трассе нужен trackProfile до эмиссии');
  const L = p.n * p.step;
  let u = s % L;
  if (u < 0) u += L;
  const i = Math.floor(u / p.step) % p.n;
  const j = (i + 1) % p.n;
  const f = (u - i * p.step) / p.step;
  return p.deck[i] + (p.deck[j] - p.deck[i]) * f;
}

/**
 * Шаг поиска носа: 2 м — вдвое короче `J.navStep`, поэтому пересечение плоскости
 * подъёма с полем не проскочить, и линейная интерполяция на таком шаге ошибается
 * на сотые доли метра (замер — в журнале этапа 2).
 */
const TRACK_TOE_STEP = 2;

/**
 * Нос съезда: где плоскость подъёма, идущая от полотна петли вниз по уклону,
 * пересекает уровень наземной улицы (`поле + J.streetRise` — та отметка, на
 * которую нормализатор потом кладёт пластину района).
 *
 * Ищется **ходом вдоль носа**, а не решением `run = (верх − поле) / уклон` в
 * лоб: поле под носом само зависит от `run`, и фиксированная итерация по этой
 * формуле расходилась не всегда — замер первой версии этого этапа: пролёт 189 м
 * с торцом на 3,14 м над грунтом (нос уехал за край холма) и второй съезд — нос
 * на 0,12 м там, где поле 2,97 м, то есть подъём закапывался в грунт на 2,8 м.
 * Ход с интерполяцией пересечения даёт ровно ту отметку, где плоскость
 * *коснулась* уровня, и не перескакивает через долину, потому что идёт шагом
 * `TRACK_TOE_STEP`.
 *
 * `runFactor` из сида множит **уклон**, а не длину: при `0,85` подъём круче
 * (`grade / 0,85`), при `1,15` — пологий, и торец всегда лежит ровно на
 * асфальте. Множить длину было бы хуже: нос, уехавший дальше точки касания,
 * висел бы над улицей больше чем на `J.skybridgeFit`, но меньше чем на
 * `J.bridgeMinHeight`, — то есть схема не назвала бы его свободным носом вовсе,
 * и подъём кончался бы в воздухе молча.
 */
function trackEntryToe(track, ctx, entry) {
  const spec = track.spec;
  // Отметка ухода — **подогнанного** полотна, а не ломаной профиля: съезд
  // прикладывается к кольцу торцом, и если его начало взято с ломаной, на стыке
  // остаётся ступень ровно в половину прогиба хорды (замер — в комментарии
  // `trackFit`)
  const top = trackFittedAt(track, entry.s);
  const slope = spec.grade / entry.runFactor;
  // `ctx.streetField` — поле СО ВСЕМИ террасами районов (до цикла — оценёнными по
  // блокам, после — по `districtTerraces`): отметка асфальта под носом и есть та,
  // что отдаст нормализатор. Естественное поле под террасой района на 2…3 м ниже
  // её ядра, и съезд, найденный по нему, кончался бы в воздухе над кварталом
  const field = ctx.streetField ?? ctx.field;
  const level = (x, z) => (field ? field.heightAt(x, z) : ctx.ground.y) + J.streetRise;
  const half = ctx.ground.size / 2;
  // `clearance > J.streetRise` — гейт схемы, поэтому первая проба заведомо
  // выше уровня улицы: спуск есть всегда, и отдельная ветка «съезд стартует из
  // ямы» была бы кодом, который не наступает
  let prev = top - level(entry.x, entry.z);
  // `clearance > J.streetRise` — гейт схемы для ЕСТЕСТВЕННОГО поля, но терраса
  // района под кольцом обязана держаться тем же гейтом: если нос стартует уже на
  // асфальте, спуска нет, и пластина съезда короче минимальных 1 м схемы
  if (prev < 0.05) {
    throw new Error(`city.track «${spec.id}»: съезд ${entry.id} начинается с полотна ${r3(top)} м`
      + ` там, где уровень улицы ${r3(level(entry.x, entry.z))} м — спускаться нечему`
      + ' (району под кольцом нужна терраса ниже полотна, а кольцу — больший clearance)');
  }
  // ниже дна плитки полотно уже не встретит грунт: за этот предел считать нечего
  const limit = (top - (ctx.ground.y - 1)) / slope;
  for (let t = TRACK_TOE_STEP; t <= limit + TRACK_TOE_STEP; t += TRACK_TOE_STEP) {
    const x = entry.x + entry.dx * t, z = entry.z + entry.dz * t;
    if (Math.abs(x) > half || Math.abs(z) > half) {
      throw new Error(`city.track «${spec.id}»: съезд ${entry.id} за ${r3(t)} м уходит за плитку`
        + ` ${ctx.ground.size} м, не дотянувшись до грунта — нос обязан встать на улицу, а не на край мира`);
    }
    const d = (top - slope * t) - level(x, z);
    if (d <= 0) {
      // доля шага до пересечения: между пробами разность меняется линейно, и
      // интерполяция держит торец в сотых долях метра от уровня улицы
      const f = prev / (prev - d);
      const u = t - TRACK_TOE_STEP + f * TRACK_TOE_STEP;
      return {
        x: r3(entry.x + entry.dx * u), z: r3(entry.z + entry.dz * u),
        top: r3(top - slope * u), level: r3(level(entry.x + entry.dx * u, entry.z + entry.dz * u)),
        ringTop: top, reach: r3(u), slope,
      };
    }
    prev = d;
  }
  throw new Error(`city.track «${spec.id}»: съезд ${entry.id} за ${r3(limit)} м пролёта не дотянулся`
    + ` до уровня улицы (перепад от полотна ${r3(top - ctx.ground.y)} м при уклоне ${r3(slope)})`);
}

/**
 * Носы всех съездов: отметка, пролёт и коридор подъезда. Отдельно от сборки —
 * их читают проб и автотест без районов, а в `ctx.noses` их кладёт `buildTrack`.
 *
 * Коридор подъезда нужен по той же причине, что и полоса петли: без него лот
 * встаёт под съезд, и дом ложится наклонной плитой поперёк улицы, которая нос
 * принимает.
 */
export function trackToes(track, ctx) {
  for (const e of track.entries) {
    e.toe = trackEntryToe(track, ctx, e);
    const k = Math.max(1, Math.ceil(e.toe.reach / TRACK_CHORD));
    for (let j = 0; j < k; j++) {
      pushBand(track, e.x + e.dx * e.toe.reach * (j / k), e.z + e.dz * e.toe.reach * (j / k),
        e.x + e.dx * e.toe.reach * ((j + 1) / k), e.z + e.dz * e.toe.reach * ((j + 1) / k));
    }
  }
  return track.entries;
}

/**
 * Сборка трассы: ось, профиль высот, коридор (полотно плюс верга, и по съездам
 * тоже), носы съездов в `ctx.noses` и счётчик районов, которым петля пересекла
 * блок. Сопровождается до цикла районов — иначе лоты успели бы встать под
 * полотном, а сетка улиц не успела бы податься под нос.
 */
function buildTrack(city, ctx) {
  const track = trackCenterline(trackSpec(city.track), ctx);
  ctx.streetField = terracedField(ctx, estimateTerraces(city.districts ?? [], ctx));
  // Профиль читает поле СО ВСЕМИ террасами: район на склоне поднимает площадку
  // на 2…3 м над естественным полем, и полотно, посчитанное по нему, уходило бы
  // в тело террасы (замер этапа 3: 9…29 проб из ~400 лежали под террасой меньше
  // чем на зазор, то есть кольцо проваливалось в насыпь кварталов). Отметка
  // ядра террасы — та же, что кормит нос съезда, поэтому и там, и здесь поле
  // одно: `ctx.streetField`
  trackProfile(track, ctx.streetField ?? ctx.field, ctx.ground.y);
  trackToes(track, ctx);
  // коридор — своим списком, не в `ctx.obstacles`: лот отбраковывается
  // `d.trackBand` со своим счётчиком, а общий список звал бы `lot_blocked` и
  // прятал причину отказа
  for (const e of track.entries) {
    if (ctx.v2) {
      e.nose = {
        x: e.toe.x, z: e.toe.z, top: e.toe.top, dx: e.dx, dz: e.dz,
        len: e.toe.reach, i: e.n, side: 'min', n: -1,
        // id, которым съезд будет записан в дороги: район читает из носа только
        // его (в `serveX/serveZ` счётчики), а валидатор получит настоящую
        // запись вместе с эмиссией (`trackDecks`)
        road: { id: e.id, type: 'bridge' },
      };
      ctx.noses.push(e.nose);
    }
  }
  for (const d of city.districts ?? []) {
    if (!d.block) continue;
    const box = obbOf(d.block, districtFrame(d));
    if (track.band.some(o => obbHitsObb(o.obb, box, 0.05))) ctx.bump('district_crossed_by_track');
  }
  return track;
}

/**
 * Оценка террас района ДО цикла районов: блок района и отметка его центра.
 * Настоящая терраса — союз планов лотов и полотен улиц (её считает
 * `districtTerraces` в нормализаторе, той же функцией, что и парсер), то есть
 * квартал чуть уже блока, а её ядро — плоское. Для носа съезда важна именно
 * отметка ядра, а ошибка «центр блока против центра союза» — сотни долей метра
 * на поле в 0,05 м/м; без оценки нос искал бы уровень естественного поля под
 * кварталом и уходил бы на 20…30 м дальше по лучу (терраса выше него ровно на
 * столько, на сколько район стоит на склоне).
 */
function estimateTerraces(districts, ctx) {
  if (!ctx.reliefSpec) return [];
  return districts.filter(d => d.block).map(d => {
    const f = districtFrame(d);
    const hx = (d.block.maxX - d.block.minX) / 2, hz = (d.block.maxZ - d.block.minZ) / 2;
    const c = { x: (d.block.minX + d.block.maxX) / 2, z: (d.block.minZ + d.block.maxZ) / 2 };
    const w = f ? rotatePoint(f, c.x, c.z) : c;
    return {
      id: `${d.id}:терраса-оценка`,
      minX: r3(w.x - hx), maxX: r3(w.x + hx), minZ: r3(w.z - hz), maxZ: r3(w.z + hz),
      y: r3(ctx.field.heightAt(w.x, w.z)),
      yaw: f ? r3(f.deg) : undefined,
    };
  });
}

/**
 * Поле со всеми террасами — тем, по которому нормализатор кладёт асфальт района.
 * Площадки передаются в `reliefOf` теми же записями, что и в `relief.plain`,
 * поэтому вес ядра (`padWeight` = 1 внутри rect'а) даёт ровно отметку террасы, а
 * переходное кольцо — тот же ease, что у собранной главы.
 */
function terracedField(ctx, terraces) {
  if (!ctx.reliefSpec) return null;
  return reliefOf({
    ...ctx.reliefSpec,
    pads: [...(ctx.reliefSpec.pads ?? []), ...terraces],
  });
}

/** Пластина наземной улицы, в чей план попадает точка (null — ни одна не накрывает). */
function streetPlanAt(roads, x, z) {
  for (const r of roads) {
    if (r.type !== 'ground') continue;
    for (const el of r.elements ?? []) {
      const p = el.plate;
      if (!p) continue;
      const rad = (p.yaw ?? 0) * Math.PI / 180;
      const dx = x - p.x, dz = z - p.z;
      const u = dx * Math.cos(rad) + dz * Math.sin(rad);
      const v = -dx * Math.sin(rad) + dz * Math.cos(rad);
      if (Math.abs(u) <= p.length / 2 && Math.abs(v) <= p.width / 2) return { road: r, plate: p };
    }
  }
  return null;
}

/**
 * Полотно трассы в дорогах брифа (этап 3): кольцо — одна дорога `type: 'bridge'`
 * из дуг скруглений и пластин прямых, съезды — отдельные дороги, чей нос кладёт
 * на полотно наземной улицы. Отметки пишутся готовые (`y`/`rise`, `y: [y0, y1]`):
 * `profileDistrictStreets` берёт только улицы района, у которых все элементы —
 * `plate` без `connect`, поэтому трасса в фит по полю не попадает и второй раз
 * подгонять её некому. Опоры и фонари считает нормализатор (`bridgePillars`,
 * `roadLamps`) — те же механизмы, что у глав 11–12.
 *
 * Второй проход носа — здесь, а не в `buildTrack`: до цикла районов терраса
 * квартала только оценена по блоку, а нос обязан встать на ОТМЕТКУ СОБРАННОГО
 * асфальта, которую парсер возьмёт из настоящей террасы (`districtTerraces`).
 * Оценкой держится только сетка улиц (ей нужно, куда подавать ряд), и обе отметки
 * сходятся внутри `J.skybridgeFit`, пока блок района не уехал от носа далеко.
 *
 * @param {object} ctx контекст `expandCity` с собранной `track`
 * @param {object[]} roadsOut сюда ложатся новые записи дорог (те же, что у
 *   районов)
 * @param {object[]} allRoads все дороги развёрнутого уровня — авторские плюс
 *   генерированные: по ним считается терраса района и по ним нос проверяется на
 *   план улицы, потому что именно этот список увидит схема
 * @param {object[]} allBuildings то же для корпусов
 * @param {object[]} districts сырые районы секции `city` — ими нос узнаёт,
 *   обслужен ли он после второго прохода
 */
export function trackDecks(ctx, roadsOut, allRoads, allBuildings, districts) {
  const track = ctx.track;
  if (!track) return;
  const spec = track.spec;
  const terraces = districtTerraces(allBuildings, allRoads,
    (x, z) => (ctx.field ? ctx.field.heightAt(x, z) : ctx.ground.y));
  ctx.streetField = terracedField(ctx, terraces);
  // блоки районов — по ним нос узнаёт, обслужен ли он (сетка уже отработала, и
  // второй проход носа мог сдвинуть пятку за квартал)
  const blocks = districts.filter(d => d.block).map(d => ({
    box: obbOf(d.block, districtFrame(d)),
  }));

  for (const e of track.entries) {
    const before = e.toe.reach;
    e.toe = trackEntryToe(track, ctx, e);
    if (Math.abs(e.toe.reach - before) > 0.5) ctx.bump('track_toe_moved');
    if (e.nose) {
      e.nose.x = e.toe.x; e.nose.z = e.toe.z; e.nose.top = e.toe.top; e.nose.len = e.toe.reach;
      e.nose.claimed = blocks.some(b => obbHitsRect(b.box,
        { minX: e.toe.x, maxX: e.toe.x, minZ: e.toe.z, maxZ: e.toe.z }, 0));
    }
    if (!streetPlanAt(allRoads, e.toe.x, e.toe.z)) ctx.bump('track_nose_off_street');
  }

  // полотно обязано держать зазор НЕ только над естественным полем: терраса
  // района, вставшая под кольцо, поднимает грунт под настилом выше, чем мерил
  // `trackProfile`, и тогда под столбами растёт стена, а не улица
  const p = track.profile;
  for (let i = 0; i < p.n; i++) {
    const at = trackAxisAt(track, i * p.step);
    const ground = ctx.streetField ? ctx.streetField.heightAt(at.x, at.z) : ctx.ground.y;
    if (trackFittedAt(track, i * p.step) - ground < spec.clearance - 1e-6) ctx.bump('track_deck_under_terrace');
  }

  roadsOut.push({
    id: `${spec.id}_ring`, type: 'bridge', width: r3(spec.width), lamps: !!spec.lamps,
    trackRole: 'ring', trackId: spec.id,
    elements: trackElements(track),
  });
  for (const e of track.entries) {
    const dx = e.toe.x - e.x, dz = e.toe.z - e.z;
    roadsOut.push({
      id: e.id, type: 'bridge', width: r3(spec.width), lamps: !!spec.lamps,
      trackRole: 'entry', trackId: spec.id,
      elements: [{
        plate: {
          x: r3(e.x + dx / 2), z: r3(e.z + dz / 2),
          // угол — в тех же градусах, что `yaw` у пластины района и у поворотного
          // дома; `unrotatePoint` требует объект кадра, а разворот одной пары
          // синусов здесь стоит дешевле, чем лишняя аллокация на каждый съезд
          yaw: r3(Math.atan2(dz, dx) * 180 / Math.PI),
          length: r3(Math.hypot(dx, dz)), width: r3(spec.width),
          // `y` — верх на НАЧАЛЕ оси, то есть на петле: съезд всегда идёт под
          // уклон, и `rise` остаётся отрицательным
          y: r3(e.toe.ringTop), rise: r3(e.toe.top - e.toe.ringTop), rails: !!spec.rails,
        },
      }],
    });
  }
}

/**
 * Запас от кромки съезда до конца разрыва периль петли. `CONFIG.radius` (0,45 м)
 * — минимальный, при котором тело ещё проходит в стык; 0,5 м взят с шагом
 * нормализатора (сотые доли метра на торце не оставляют телу сомнений).
 */
const TRACK_RAIL_MARGIN = 0.5;

/**
 * Окна, в которых перила петли расступаются перед съездом, — в пройденных
 * метрах петли.
 *
 * Без разрыва стык съезда с кольцом **невидим для графа**: пластина съезда
 * выходит из оси петли и проходит сквозь стенку 1,1 м, `bodyClearLine` бракует
 * именно то ребро, которым цепочка съезда должна вливаться в цепочку кольца, и
 * `_pruneToSpawn` выбрасывает петлю целиком (замер главы 13 до правки: 168
 * узлов кольца и головка южного съезда отрезаны, уцелевшими остались 26 узлов
 * нижних цепочек — тест называл это «на кольце нет ни одного узла графа»).
 *
 * Окно шире съезда на запас с каждой стороны, а не равно его ширине: стенка
 * имеет толщину, и торец окна вровень с кромкой съезда оставил бы телу щель в
 * ноль.
 */
function trackRailWindows(track) {
  const half = track.spec.width / 2 + TRACK_RAIL_MARGIN;
  const L = track.length;
  const out = [];
  for (const e of track.entries) {
    const lo = ((e.s - half) % L + L) % L, hi = ((e.s + half) % L + L) % L;
    // окно через шов кольца — два интервала: иначе у стартового элемента
    // разрыв оказался бы только с одной стороны стыка
    if (lo < hi) out.push([lo, hi]); else out.push([lo, L], [0, hi]);
  }
  return out;
}

/**
 * Элементы полотна петли: дуга скругления и пластина прямой, каждая — со своей
 * парой отметок из подгонки `trackFit`.
 *
 * Отметки берутся с **узлов подгонки**, а не с ломаной профиля: узел принадлежит
 * обоим своим пролётам, поэтому полотно непрерывно в каждом стыке, а хорда
 * каждого пролёта держит требование (иначе плита проваливается под ломаную на
 * 0,96 м — замер в комментарии `trackFit`). Подъём и разброс после подгонки
 * меряются заново и здесь же: `rise / length` пролёта не смеет превысить
 * `grade`, которым обещана петля.
 *
 * Полотно режется ещё и по **окнам разрыва периль** (`trackRailWindows`): у
 * настила флаг `rails` покрывной, поэтому единственный способ расступиться
 * стенке перед съездом — отдать под стык отдельный элемент без ограждения.
 */
function trackElements(track) {
  const spec = track.spec, fit = track.fit, out = [];
  if (!fit) throw new Error('trackElements: подгонка не посчитана — трассе нужен trackProfile до эмиссии');
  const windows = trackRailWindows(track);
  for (let k = 0; k < track.elements.length; k++) {
    const el = track.elements[k];
    // разрезы элемента: границы окон, лежащие строго внутри него. Элемент,
    // целиком попавший под окно или целиком вне его, не режется — лишний шов
    // в перилах без причины сдвигает счётчик элементов и добавляет ступеньку
    // на стыке там, где её не просили
    const cuts = [0, el.len];
    for (const [lo, hi] of windows) {
      for (const c of [lo - el.s0, hi - el.s0]) if (c > 1e-6 && c < el.len - 1e-6) cuts.push(c);
    }
    cuts.sort((a, b) => a - b);
    for (let c = 0; c + 1 < cuts.length; c++) {
      const c0 = cuts[c], c1 = cuts[c + 1];
      if (c1 - c0 <= 1e-6) continue;
      const mid = el.s0 + (c0 + c1) / 2;
      const rails = !!spec.rails && !windows.some(([lo, hi]) => mid >= lo && mid <= hi);
      // отметки швов, не тронутых разрезом, берутся с тех же `fit.v`, что и
      // до правки: интерполяция на узле даёт то же число с шумом обратного
      // хода, а модуль главы обязан сходиться побайтово
      const a = c0 === 0 ? r3(fit.v[k]) : r3(trackFittedAt(track, el.s0 + c0));
      const b = c1 === el.len ? r3(fit.v[(k + 1) % fit.m]) : r3(trackFittedAt(track, el.s0 + c1));
      if (el.kind === 'arc') {
        out.push({
          arc: {
            cx: r3(el.cx), cz: r3(el.cz), radius: r3(el.radius),
            from: r3((el.a0 + el.span * (c0 / el.len)) * 180 / Math.PI),
            to: r3((el.a0 + el.span * (c1 / el.len)) * 180 / Math.PI),
            width: r3(spec.width), y: [a, b], bank: spec.bank, rails,
          },
        });
        continue;
      }
      const dx = el.x1 - el.x0, dz = el.z1 - el.z0;
      const ux = dx / el.len, uz = dz / el.len;
      out.push({
        plate: {
          x: r3(el.x0 + ux * (c0 + c1) / 2), z: r3(el.z0 + uz * (c0 + c1) / 2),
          yaw: r3(Math.atan2(dz, dx) * 180 / Math.PI),
          length: r3(c1 - c0), width: r3(spec.width), y: a, rise: r3(b - a), rails,
        },
      });
    }
  }
  return out;
}

/**
 * Разворот `city` в записи брифа. Без секции возвращает вход без изменений —
 * глава 9 обязана собраться побайтово как раньше.
 *
 * @param {object} raw сырой уровень (может содержать `city`)
 * @param {object} [stats] сюда генератор кладёт счётчики (лоты, отказы формы,
 *   вводимые дома) — они нужны зонду и правке конфигурации района; в пайплайне
 *   модуля их не собирают, поэтому build-level аргумент не передаёт
 * @returns {object} тот же уровень с развёрнутыми `roads` и `buildings` и снятой секцией `city`
 * @throws {Error} если конфигурация районов геометрически невозможна
 */
export function expandCity(raw, stats) {
  const city = raw.city;
  if (!city) return raw;
  const ground = { y: r3(raw.ground?.y ?? 0), size: r3(raw.ground?.size ?? 176) };
  const districts = city.districts ?? [];
  const errors = cityConfigErrors(city, ground, districts, raw.kind === 'json2');
  if (errors.length) throw new Error(errors.join('\n'));
  if (!districts.length) throw new Error('city.districts пуст: генератор не дал бы ни улицы, ни дома');

  // тот же грунт, что и у схемы: пятку носа (`bridgeNoses`) валидатор и разворот
  // обязаны мерить одной арифметикой, иначе район на холме браковался бы по
  // чужой отметке
  const reliefField = raw.relief
    ? reliefOf({ ...raw.relief, baseY: raw.relief.baseY ?? ground.y })
    : null;
  const ctx = {
    ground,
    // то же аналитическое поле, что у схемы и у нормализатора: трасса обязана
    // брать корыто поля, а не «пол — ноль» (решение владельца, план §2.4).
    // Без секции `relief` — null, и потребители читают `ground.y`
    field: reliefField,
    // секция `relief` как есть: по ней трасса пересобирает поле С террасами
    // районов (`terracedField`) — той же функцией, что и нормализатор
    reliefSpec: raw.relief ? { ...raw.relief, baseY: raw.relief.baseY ?? ground.y } : null,
    // улицы v2 — пластины с перекрёстками и профилем по рельефу; v1 (глава 10)
    // остаётся полосой `points` на одной отметке, поэтому ей нужен явный флаг
    v2: raw.kind === 'json2',
    rng: makeRng(city.seed ?? 0),
    obstacles: obstacleRects(raw, ground, city.avoid ?? []),
    // свободные носы авторских подъёмов: сетка улиц v2 обязана дать им асфальт
    // под срезом (правило валидатора «нос кончается на улице» мерит ровно этот
    // же список — `bridgeNoses`). Во v1 пуст: глава 10 со своими тремя
    // недотянутыми носами собирается побайтово
    noses: raw.kind === 'json2' ? bridgeNoses(raw.roads ?? [], ground.y, reliefField) : [],
    state: { lots: 0 },
    bump: key => { if (stats) stats[key] = (stats[key] ?? 0) + 1; },
  };
  // трасса — до цикла районов: её коридор обязан успеть отбраковать лоты, а
  // районы позже попросит сдвинуть оси улиц под нос своих съездов (этап 2)
  ctx.track = city.track ? buildTrack(city, ctx) : null;
  const roads = [], buildings = [];
  for (const d of districts) {
    generateDistrict(districtSpec(d), ctx, roads, buildings);
  }
  // полотно трассы — ПОСЛЕ районов: съезд ищет нос по настоящей террасе
  // квартала, и её план (`districtTerraces`) считается по уже выпущенным лотам и
  // улицам. До районов тот же нос стоял на оценке по блоку — ею сетка подавала
  // ряды под пятку. Списки дорог и корпусов берутся развёрнутыми (авторские +
  // генерированные): террасу нормализатор считает именно по ним
  const genRoads = mergeAuthored(raw.roads, roads);
  const genBuildings = mergeAuthored(raw.buildings, buildings);
  if (ctx.track) trackDecks(ctx, roads, genRoads, genBuildings, districts);
  // нос, не попавший ни в один блок, обслуживает авторскую улицу (или не
  // обслуживается никем, и валидатор это скажет) — считается один раз, а не
  // «каждым районом, до которого носу далеко»
  for (const nose of ctx.noses) if (!nose.claimed) ctx.bump('nose_no_district');

  const { city: _drop, ...rest } = raw;
  return {
    ...rest,
    roads: mergeAuthored(raw.roads, roads),
    buildings: genBuildings,
  };
}

/**
 * Авторская запись вытесняет сгенерированную с тем же id и все надстройки её
 * лота: id генератора строится как `<лот>` и `<лот>_<tag>`, поэтому достаточно
 * проверки префикса.
 */
function mergeAuthored(authored, generated) {
  const out = [...(authored ?? [])];
  const ids = new Set(out.map(o => o.id));
  for (const g of generated) {
    let displaced = ids.has(g.id);
    for (const a of ids) if (!displaced && g.id.startsWith(`${a}_`)) { displaced = true; break; }
    if (!displaced) out.push(g);
  }
  return out;
}

/**
 * Что генератору нельзя перекрывать. Блокировка только для лотов (`streets:
 * false`) — под эстакадой и переходом идти можно, а строить в их габарите
 * нельзя; наземная улица автора остаётся проезжей частью и для улиц, и для лотов.
 */
function obstacleRects(raw, ground, avoid) {
  const out = [];
  const push = (rect, why, streets = true) => rect && out.push({ rect, why, streets });
  for (const r of raw.roads ?? []) {
    let road;
    try { road = normalizeRoad(r, ground); } catch { continue; }
    for (const d of road.decks) push(planOf(d), `улица ${r.id}`, r.type === 'ground');
  }
  for (const w of raw.waterways ?? []) {
    let ch;
    try { ch = normalizeWaterway(w, ground); } catch { continue; }
    for (const h of ch.holes) push(h, `русло ${w.id}`);
  }
  for (const b of raw.buildings ?? []) {
    try { push(normalizeBuilding(b, ground, []).bounds, `здание ${b.id}`); } catch { continue; }
  }
  for (const a of avoid) push(planOf(a), 'avoid');
  return out;
}

// ------------------------------------------------------------- район

function generateDistrict(spec, ctx, roadsOut, buildingsOut) {
  const style = CITY_STYLES[spec.style];
  const hW = r3(spec.street.width / 2);
  const edge = r3(hW + VERGE);
  const frame = districtFrame(spec);
  /**
   * Район считается целиком в **своих осях** (`u` вдоль `minX`, `v` вдоль
   * `minZ`), а в мир выходит кадром `frameAt` — тем же соглашением, что у
   * поворотного дома и пластины настила: данные записи остаются неразвёрнутыми,
   * поворот дописывается одним углом. Поэтому весь код ниже не знает, косой
   * район или нет, и соосный (кадры нет) собирается побайтово как прежде.
   *
   * `poly` — граница района в тех же локальных осях: она режет улицы по краю и
   * отбраковывает лоты, чей центр вне контура.
   */
  const d = {
    ...spec,
    frame,
    poly: spec.polygon ? spec.polygon.map(p => ({ x: r3(p.x), z: r3(p.z) })) : null,
    // препятствия мира (русло, авторские улицы, дома и `avoid`) в осях района:
    // у соосного района это те же прямоугольники, у косого — повёрнутые коробки,
    // и сравнивать их с локальным лотом габаритом нельзя (замер — этап 5: квадрат
    // вокруг повёрнутого на 45° блока на 1,41 раза больше самого блока)
    obstacles: frame ? ctx.obstacles.map(o => ({ ...o, obb: localObb(o.rect, frame) })) : ctx.obstacles,
    // коридор трассы — те же препятствия, но своим списком: отказ лота inside
    // обязан называться (`lot_in_track_band`), а не раствориться в `lot_blocked`.
    // Поле `obb` — обёртка `{ obb: коробка }`, как его отдаёт `localObb`: `blocked`
    // зовёт `obbHitsRect(o.obb, …)`, а тот читает `box.obb` — сырая коробка без
    // обёртки превращается в `rectFigure` с `minX = undefined`, все оси дают NaN,
    // «разделения» не находит ни одна, и список бракует ВЕСЬ район (замер первой
    // версии этого этапа: три лота из четырёх в блоке, до коридора 120 м)
    trackBand: (ctx.track?.band ?? []).map(o => ({
      obb: frame ? { obb: localObbOf(o.obb.obb, frame) } : o.obb,
    })),
    // служебные поля уличных записей v2: по ним нормализатор отличает настил
    // генератора (его профиль — дело парсера) от авторской дороги (её отметки
    // правит рука) и берёт предел уклона района; в модуль главы не доезжают,
    // как `district` и `archetype` у домов
    svc: ctx.v2
      ? { district: spec.id, ...(spec.street.grade !== undefined ? { grade: r3(spec.street.grade) } : {}) }
      : null,
  };
  const linesX = gridLines(d.block.minX, d.block.maxX, d.street.pitch, edge);
  const linesZ = gridLines(d.block.minZ, d.block.maxZ, d.street.pitch, edge);
  // съезд авторского моста обязан прийти на асфальт: ряды сетки передвигаются к
  // носу (или новый ряд вставляется под него) ДО `crossingNodes` и до эмиссии,
  // иначе перекрёстки посчитаются по старым осям и под носом встанет дыра
  const noses = ctx.v2 ? districtNoses(d, ctx) : [];
  if (noses.length) {
    const at = key => noses.map(n => n[key]).filter(v => v !== null);
    alignNoseLines(linesZ, at('serveZ'), d.block.minZ, d.block.maxZ, edge, hW, ctx);
    alignNoseLines(linesX, at('serveX'), d.block.minX, d.block.maxX, edge, hW, ctx);
  }
  const deckY = r3(ctx.ground.y + J.streetRise);
  const streets = [];
  // в v2 прогон обрывается у борта перекрёстка, а сам перекрёсток — отдельная
  // пластина (см. `crossingNodes`); в v1 (`kind: 'json'`) улиц режут только
  // препятствия и граница района, поэтому глава 10 собирается побайтово
  const nodes = ctx.v2 ? crossingNodes(d, linesX, linesZ, hW) : null;

  // имя улицы — по направлению настила, чтобы дверь ссылалась на тот id,
  // который автор видит в брифе
  for (const [i, z] of linesZ.entries()) {
    emitStreet(d, ctx, roadsOut, streets, `s_h${i}`, 'x', snap(z), d.block.minX, d.block.maxX, hW, deckY,
      nodes && nodes.filter(n => n.z === z).map(n => n.x));
  }
  for (const [i, x] of linesX.entries()) {
    emitStreet(d, ctx, roadsOut, streets, `s_v${i}`, 'z', snap(x), d.block.minZ, d.block.maxZ, hW, deckY,
      nodes && nodes.filter(n => n.x === x).map(n => n.z));
  }
  if (nodes) {
    for (const n of nodes) {
      if (!n.ok) continue;   // узаконенный надрез без площадки: см. `crossingNodes`
      roadsOut.push({
        ...d.svc, crossing: true,
        id: `${d.id}_x${n.i}_${n.j}`, type: 'ground', width: d.street.width, lamps: false,
        elements: [{ plate: plateOf(d, 'x', n.z, r3(n.x - hW), r3(n.x + hW), hW, deckY) }],
      });
    }
  }

  for (let j = 0; j + 1 < linesZ.length; j++) {
    for (let i = 0; i + 1 < linesX.length; i++) {
      generateSuperblock(d, style, {
        minX: snap(linesX[i] + edge), maxX: snap(linesX[i + 1] - edge),
        minZ: snap(linesZ[j] + edge), maxZ: snap(linesZ[j + 1] - edge),
      }, ctx, buildingsOut, streets, ctx.state);
    }
  }
}

/** Оси улиц: от первого борта до последнего, ровно `pitch` друг от друга. */
function gridLines(min, max, pitch, edge) {
  const out = [];
  for (let v = snap(min + edge); v <= max - edge + 1e-6; v = snap(v + pitch)) out.push(v);
  return out;
}

/**
 * Носы подъёмов, приходящиеся на этот район, — в его локальных осях и в виде
 * двух чисел: `serveZ` — ряд вдоль X, полотно которого обязана пересечь пятку
 * (так мост садится на набережную), `serveX` — ряд вдоль Z. У подъёма, идущего
 * вдоль одной из осей района, заполнено одно из них; у косого — оба, и нос
 * попадает в перекрёсток: диагональный ряд район не построит (его сетка
 * осевая), а площадь узла накроет срез целиком.
 *
 * Район, в чьём блоке носа нет, его не обслуживает — такие считает один раз
 * `expandCity` (`nose_no_district`), а не каждый район по кругу.
 */
function districtNoses(d, ctx) {
  const out = [];
  const f = d.frame;
  for (const nose of ctx.noses) {
    const p = f ? unrotatePoint(f, nose.x, nose.z) : { x: nose.x, z: nose.z };
    if (p.x < d.block.minX || p.x > d.block.maxX || p.z < d.block.minZ || p.z > d.block.maxZ) continue;
    if (d.poly && !pointInPoly(d.poly, p.x, p.z)) { ctx.bump('nose_outside_polygon'); continue; }
    nose.claimed = true;
    // вектор разворачивается обратным ходом кадра, но без переноса центра
    const n = f
      ? { x: nose.dx * f.c + nose.dz * f.s, z: -nose.dx * f.s + nose.dz * f.c }
      : { x: nose.dx, z: nose.dz };
    // ось подъёма вдоль локальной X ⇒ улица, принимающая нос, идёт вдоль Z, и
    // наоборот: полотно должно пересекать мост поперёк, а не продолжать его
    const deckZ = Math.abs(n.x) < AXIS_EPS;
    const deckX = Math.abs(n.z) < AXIS_EPS;
    if (!deckX && !deckZ) ctx.bump('nose_skew_at_crossing');
    out.push({
      id: nose.road.id,
      serveX: deckZ ? null : r3(p.x),
      serveZ: deckX ? null : r3(p.z),
    });
  }
  return out;
}

/**
 * Дотянуть ряд сетки к носу: линия, чья полоса уже накрывает пятку, остаётся;
 * ближайшая передвигается, если уезжает не дальше `NOSE_SHIFT`; иначе ряд
 * вставляется. Точка ставится на шаг сетки (`snap`) и не выпускается за борты
 * блока — за `edge` асфальта район не кладёт, и нос, вставший в вергу, остаётся
 * делом авторской улицы (счётчик `nose_at_edge` называет его, а не молчит).
 */
function alignNoseLines(lines, targets, min, max, edge, hW, ctx) {
  const lo = snap(min + edge), hi = snap(max - edge);
  for (const target of targets) {
    const at = snap(target);
    if (lines.some(v => Math.abs(v - at) <= hW)) continue;
    if (at < lo || at > hi) { ctx.bump('nose_at_edge'); continue; }
    let bi = -1, bd = Infinity;
    for (const [i, v] of lines.entries()) {
      const dd = Math.abs(v - at);
      if (dd < bd) { bd = dd; bi = i; }
    }
    if (bi >= 0 && bd <= NOSE_SHIFT) {
      lines[bi] = at;
      ctx.bump('nose_line_shifted');
    } else {
      lines.push(at);
      lines.sort((a, b) => a - b);
      ctx.bump('nose_line_added');
    }
  }
}

/**
 * Улица района: линия с разрезами по препятствиям, по границе района и по
 * бортам перекрёстков; каждый оставшийся прогон — своя запись.
 *
 * `crossings` — координаты осей встречных улиц, по которым прогон обрывается
 * (v2). Их нет в v1, и тогда улица остаётся полосой от борта до борта: глава 10
 * обязана собраться побайтово.
 */
function emitStreet(d, ctx, roadsOut, streets, base, axis, cross, lo, hi, hW, deckY, crossings) {
  const cuts = [];
  for (const o of d.obstacles) {
    if (!o.streets) continue;
    const reach = hW + STREET_CLEAR;
    const span = o.obb ? obbBandSpan(o.obb, axis, cross, reach) : cutBand(o.rect, axis, cross, reach);
    if (span) cuts.push(span);
  }
  if (d.poly) cuts.push(...polyOutsideCuts(d.poly, axis, cross, lo, hi, hW));
  // борт перекрёстка — граница прогона без запаса: пластина перекрёстка стоит
  // ровно в этом интервале, и стык впритык (нулевая площадь наложения) — как
  // раз то, чего не хватало главе 10 с её 158 парами со-плоскостных наложений
  if (crossings) for (const t of crossings) cuts.push([r3(t - hW), r3(t + hW)]);
  const runs = freeRuns(lo, hi, cuts);
  runs.forEach(([a, b], k) => {
    const id = `${d.id}_${runs.length === 1 ? base : `${base}_${k}`}`;
    const [p, q] = [snap(a), snap(b)];
    roadsOut.push(ctx.v2 || d.frame
      // прогон v2 — пластина: только так его полотно получает `y` и `rise` на
      // каждый элемент, а значит и профиль по рельефу (этап 6), и поворот
      // вместе с косым районом; `points` схемы требуют осевых отрезков
      ? {
        ...d.svc, id, type: 'ground', lamps: true,
        elements: [{ plate: plateOf(d, axis, cross, p, q, hW, deckY) }],
      }
      : {
        id, type: 'ground', width: d.street.width, lamps: true,
        points: axis === 'x'
          ? [{ x: p, y: deckY, z: cross }, { x: q, y: deckY, z: cross }]
          : [{ x: cross, y: deckY, z: p }, { x: cross, y: deckY, z: q }],
      });
    // план для дверей остаётся локальным: дом и его дверь считаются в осях
    // района, а в мир уезжает уже вся запись целиком (`rotateRecord`)
    streets.push({ id, rect: plateRect(axis, cross, p, q, hW) });
  });
}

/**
 * Перекрёстки района: все пары осей встречных улиц с признанием узла (`ok`).
 * Прогон обрывается у борта **каждой** пары, а квадрат `w × w` становится
 * отдельной записью только у узаконенной: иначе встречные полосы лежат в одной
 * плоскости и мигают в z-buffer (замер главы 10: 158 пар, 24 367 м² наложений).
 *
 * Узел не узаконен, если квадрат целиком не влезает в границу района (полотно
 * торчало бы за косым углом квартала) или если его накрывает препятствие с
 * проезжей частью: там прогон и так оборван, и площадка асфальта посреди русла
 * осталась бы островом. Надрез при этом остаётся — убирать его значит пустить
 * обе улицы через центр узла, где их полосы перекрывают друг друга (замер
 * фикстуры полигона: `a_s_h2` и `a_s_v2_1` легли планами друг на друга и дали
 * T-стык в обе стороны, то есть ступень 0,081 м, которую нормализатор не может
 * разрешить, потому что ни одна из плоскостей не главная). Угловой надрез
 * оставляет в границе района неотсыпанный уголок `w × w` — что и должно быть на
 * срезанном косым контуром углу квартала.
 */
function crossingNodes(d, linesX, linesZ, hW) {
  const out = [];
  for (const [j, z] of linesZ.entries()) {
    for (const [i, x] of linesX.entries()) {
      const square = { minX: r3(x - hW), maxX: r3(x + hW), minZ: r3(z - hW), maxZ: r3(z + hW) };
      let ok = true;
      if (d.poly) {
        const corners = [[square.minX, square.minZ], [square.maxX, square.minZ],
          [square.maxX, square.maxZ], [square.minX, square.maxZ]];
        ok = corners.every(([cx, cz]) => pointInPoly(d.poly, cx, cz));
      }
      const reach = {
        minX: r3(x - hW - STREET_CLEAR), maxX: r3(x + hW + STREET_CLEAR),
        minZ: r3(z - hW - STREET_CLEAR), maxZ: r3(z + hW + STREET_CLEAR),
      };
      if (ok && d.obstacles.some(o => o.streets
        && (o.obb ? obbHitsRect(o.obb, reach, 0) : rectsIntersect(reach, o.rect)))) ok = false;
      out.push({ i, j, x, z, ok });
    }
  }
  return out;
}

/** Пластина улицы: центр — повёрнутая середина прогона, длина — вдоль локальной оси. */
function plateOf(d, axis, cross, a, b, hW, deckY) {
  const mid = (a + b) / 2;
  const f = d.frame;
  const c = f
    ? rotatePoint(f, axis === 'x' ? mid : cross, axis === 'x' ? cross : mid)
    : { x: axis === 'x' ? mid : cross, z: axis === 'x' ? cross : mid };
  return {
    x: r3(c.x), z: r3(c.z),
    // пластина всегда тянется вдоль своей локальной оси X (`length`), поэтому
    // прогон вдоль `z` разворачивается на 90° сверх угла района: без этого его
    // настил лёг бы поперёк улицы, а дом на лоте — «в дорогу»
    yaw: r3((f ? f.deg : 0) + (axis === 'x' ? 0 : 90)),
    length: r3(b - a), width: r3(2 * hW), y: deckY,
  };
}

const plateRect = (axis, cross, a, b, hW) => (axis === 'x'
  ? { minX: a, maxX: b, minZ: r3(cross - hW), maxZ: r3(cross + hW) }
  : { minX: r3(cross - hW), maxX: r3(cross + hW), minZ: a, maxZ: b });

/** Интервал вдоль улицы, который перекрывает препятствие (с запасом на торце); null — оно в стороне от оси. */
function cutBand(rect, axis, cross, reach) {
  if (axis === 'x') {
    if (rect.minZ > cross + reach || rect.maxZ < cross - reach) return null;
    return [r3(rect.minX - STREET_CLEAR), r3(rect.maxX + STREET_CLEAR)];
  }
  if (rect.minX > cross + reach || rect.maxX < cross - reach) return null;
  return [r3(rect.minZ - STREET_CLEAR), r3(rect.maxZ + STREET_CLEAR)];
}

/**
 * Мировой прямоугольник в осях повёрнутого района: тот же прямоугольник,
 * повёрнутый на −`yaw` вокруг центра блока. Хранится как ориентированная
 * коробка (`{cx, cz, hx, hz, c, s}` — соглашение `obb` из `src/geo2d.js`),
 * поэтому и отбраковка лота (`obbHitsRect`), и разрез улицы (`obbBandSpan`)
 * меряют точный план, а не габарит: габарит повёрнутого на 45° русла перекрыл
 * бы полрайона, и квартал молча остался бы без домов.
 */
function localObb(rect, f) {
  return {
    obb: localObbOf({
      cx: (rect.minX + rect.maxX) / 2, cz: (rect.minZ + rect.maxZ) / 2,
      hx: (rect.maxX - rect.minX) / 2, hz: (rect.maxZ - rect.minZ) / 2,
      c: 1, s: 0,
    }, f),
  };
}

/**
 * Та же операция для коробки, которая уже повёрнута в мире: трассовый коридор
 * лежит хордами под своим углом, и пересчитывать его по **габариту** (как
 * `localObb`) значило бы раздуть каждую хорду до квадрата — на районе с `yaw`
 * 45° в 1,41 раза, то есть лоты, до полотна далёкие, отказывались бы молча.
 */
function localObbOf(box, f) {
  const c = unrotatePoint(f, box.cx, box.cz);
  return {
    cx: c.x, cz: c.z, hx: box.hx, hz: box.hz,
    // обратный поворот вектора оси: косинус тот же, синус — с противоположным знаком
    c: box.c * f.c + box.s * f.s,
    s: box.s * f.c - box.c * f.s,
  };
}

/**
 * Интервал вдоль оси, на котором повёрнутая коробка закрывает полосу улицы
 * `[cross − reach, cross + reach]`; null — коробка полосы не касается.
 * Для осевого прямоугольника это ровно `cutBand`, но у косого района русло
 * лежит под углом, и его пересечение с полосой — уже не проекция габарита.
 * Полигон коробочки выпуклый, поэтому сечение полосой по одной оси — один
 * интервал: собираем вершины внутри полосы и точки пересечения рёбер с её
 * границами, берём крайние проекции.
 */
function obbBandSpan(o, axis, cross, reach) {
  const pts = [];
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      pts.push({
        x: o.cx + o.hx * sx * o.c - o.hz * sz * o.s,
        z: o.cz + o.hx * sx * o.s + o.hz * sz * o.c,
      });
    }
  }
  return polyBandSpan(pts, axis, cross, reach);
}

function polyBandSpan(poly, axis, cross, reach) {
  const across = axis === 'x' ? 'z' : 'x';
  const along = axis === 'x' ? 'x' : 'z';
  const lo = cross - reach, hi = cross + reach;
  const at = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const ain = a[across] >= lo && a[across] <= hi;
    const bin = b[across] >= lo && b[across] <= hi;
    if (ain) at.push(a[along]);
    if (ain === bin) continue;
    // ребро пересекло границу полосы — точка пересечения тоже конец интервала
    for (const v of [lo, hi]) {
      if ((a[across] - v) * (b[across] - v) <= 0 && a[across] !== b[across]) {
        const t = (v - a[across]) / (b[across] - a[across]);
        at.push(a[along] + t * (b[along] - a[along]));
      }
    }
  }
  if (!at.length) return null;
  return [r3(Math.min(...at) - STREET_CLEAR), r3(Math.max(...at) + STREET_CLEAR)];
}

/**
 * Запретные интервалы улицы по границе района: полотно обязано лежать внутри
 * полигона целиком, поэтому пробуются оба его борта. Шаг пробы — сетка
 * генератора (0,5 м): граница района — не стена и не коллизия, а лишь
 * выключатель, и точность в полметра для неё избыточна, а вот пропустить
 * настил, торчащий за косой угол квартала, — значит дать главе мигать
 * со-плоскостными грани.
 */
function polyOutsideCuts(poly, axis, cross, lo, hi, hW) {
  const at = t => (axis === 'x'
    ? pointInPoly(poly, t, cross - hW) && pointInPoly(poly, t, cross + hW)
    : pointInPoly(poly, cross - hW, t) && pointInPoly(poly, cross + hW, t));
  const cuts = [];
  let from = null;
  for (let t = snap(lo); t <= hi + 1e-9; t = snap(t + GRID)) {
    if (!at(t)) {
      if (from === null) from = t;
    } else if (from !== null) {
      cuts.push([r3(from), r3(t)]);
      from = null;
    }
  }
  if (from !== null) cuts.push([r3(from), r3(hi)]);
  return cuts;
}

function freeRuns(lo, hi, cuts) {
  const out = [];
  let from = lo;
  for (const [c0, c1] of cuts.sort((a, b) => a[0] - b[0] || a[1] - b[1])) {
    if (c1 <= from || c0 >= hi) continue;
    if (c0 - from >= MIN_RUN) out.push([from, c0]);
    if (c1 > from) from = c1;
  }
  if (hi - from >= MIN_RUN) out.push([from, hi]);
  return out;
}

// ------------------------------------------------------------- суперквартал

/**
 * Суперквартал: пространство между осями улиц за вычетом борта и верги.
 * Клетки лотов сливаются по `lot.merge` — без слияния архетипы вроде креста и
 * подиума с башней физически не куда ставить, а город превращается в решётку
 * одинаковых пятиэтажек.
 */
function generateSuperblock(d, style, interior, ctx, buildings, streets, state) {
  if (!usable(interior)) { ctx.bump('superblock_narrow'); return; }
  const rng = ctx.rng;
  // шаг лота дрожит по кварталам: равномерная решётка одинаковых лотов читается
  // как завод, а кварталу под башню нужен глубокий лот, и слободе — мелкий.
  // Дрожь делит сторону суперквартала, поэтому крупный лот никогда не шире него
  const px = r3(d.lot.pitch * rand(rng, 0.9, 1.45)), py = r3(d.lot.pitch * rand(rng, 0.9, 1.45));
  const cols = Math.max(1, Math.round((interior.maxX - interior.minX) / px));
  const rows = Math.max(1, Math.round((interior.maxZ - interior.minZ) / py));
  const cw = r3((interior.maxX - interior.minX) / cols), ch = r3((interior.maxZ - interior.minZ) / rows);
  const cellRect = (c, r) => ({
    minX: snap(interior.minX + c * cw), maxX: snap(interior.minX + (c + 1) * cw),
    minZ: snap(interior.minZ + r * ch), maxZ: snap(interior.minZ + (r + 1) * ch),
  });
  const taken = Array.from({ length: rows }, () => new Array(cols).fill(false));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (taken[r][c]) continue;
      taken[r][c] = true;
      let rect = cellRect(c, r);
      // слияние только вправо и вниз: обход клеток слева направо иначе взял бы
      // уже занятую клетку второй раз
      if (d.lot.merge > 0 && chance(rng, d.lot.merge) && c + 1 < cols && !taken[r][c + 1]) {
        const wide = { ...rect, maxX: cellRect(c + 1, r).maxX };
        let use = wide;
        taken[r][c + 1] = true;
        if (chance(rng, d.lot.merge) && r + 1 < rows && !taken[r + 1][c] && !taken[r + 1][c + 1]) {
          use = { ...wide, maxZ: cellRect(c, r + 1).maxZ };
          taken[r + 1][c] = true;
          taken[r + 1][c + 1] = true;
        }
        if (usable(insetRect(use, d.lot.inset, d.lot.inset, d.lot.inset, d.lot.inset))) rect = use;
        else taken[r][c + 1] = false;
      }
      generateLot(d, style, rect, ctx, buildings, streets, state);
    }
  }
}

function generateLot(d, style, cell, ctx, buildings, streets, state) {
  const rng = ctx.rng;
  state.lots++;
  ctx.bump('lots');
  if (chance(rng, d.skip)) return;
  // отступ от борта улицы дрожит по сторонам света: фасад одной линии стоит то
  // в трёх, то в трёх с половиной метрах от асфальта, и одинаковые лоты перестают
  // давать одинаковые коробки. Потолок дрожи — дальность портала: дальше этого
  // фасад уже не смотрит на улицу, и entranceOf вернул бы отказ
  const extra = Math.max(0, r3(MOUTH_REACH + 1 - VERGE - d.lot.inset));
  const setback = () => d.lot.inset + (extra > 0 ? snap(rand(rng, 0, extra)) : 0);
  const lot = insetRect(cell, setback(), setback(), setback(), setback());
  if (!usable(lot)) { ctx.bump('lot_too_narrow'); return; }
  // граница района режет и лоты: центр вне контура — квартал там не строится.
  // Отказ считается счётчиком: «район стал меньше» без причины нельзя ни
  // проверить, ни починить (то же правило, что у `house_not_rect`)
  if (d.poly && !pointInPoly(d.poly, (lot.minX + lot.maxX) / 2, (lot.minZ + lot.maxZ) / 2)) {
    ctx.bump('lot_outside_polygon'); return;
  }
  if (blocked(lot, d.trackBand)) { ctx.bump('lot_in_track_band'); return; }
  if (blocked(lot, d.obstacles)) { ctx.bump('lot_blocked'); return; }

  const courtyard = chance(rng, d.courtyard);
  let name = courtyard ? pick(rng, COURTYARD_NAMES) : pick(rng, d.archetypes);
  let parts = (CITY_ARCHETYPES[name] ?? CITY_ARCHETYPES.box)(lot, rng);
  if (!parts) {
    // форма не влезла в узкий лот: коробка — единственный честный отказ,
    // и вызовы ГПСЧ формы уже израсходованы (детерминизм от этого не меняется)
    ctx.bump(`fallback_${name}`);
    name = 'box';
    parts = CITY_ARCHETYPES.box(lot, rng);
  }

  const tower = chance(rng, d.tower.chance * style.tall);
  let total = tower
    ? rint(rng, d.tower.floors[0], d.tower.floors[1])
    : rint(rng, d.height.minFloors, d.height.maxFloors);
  total = Math.min(tower ? J.shellFloorsMax : d.height.maxFloors, Math.max(total, parts.length));
  const stacked = parts.length > 1 && parts.every(p => p.mul) && parts[1].stacked === true;
  const floors = stacked ? stackFloors(total, parts.map(p => p.mul)) : parts.map(p => Math.max(1, Math.round(total * (p.hMul ?? 1))));
  // вводимым делает одиночный блок: у двора или башни на подиуме комната во весь
  // footprint немыслима, а резать этаж пополам стенами парсер не умеет
  const enterable = !tower && parts.length === 1 && d.enterableEvery >= 1 && state.lots % d.enterableEvery === 0;

  let topY = ctx.ground.y;
  // угол корпуса косого района: угол квартала плюс дрожь до `YAW_JITTER`. Дрожь
  // ОДНА на лот и достаётся всем его частям: «башня на подиуме» при разных углах
  // перестала бы быть соосной, а пересечение планов не-соосных домов валидатор
  // v2 бракует. Расход ГПСЧ здесь только в косой ветке, поэтому соосный район
  // (глава 10) остаётся побайтовым
  const yawDeg = d.frame ? r3(d.frame.deg + rand(rng, -YAW_JITTER, YAW_JITTER)) : null;
  parts.forEach((p, i) => {
    let f = floors[i];
    if (enterable) f = Math.min(f, J.genEnterableFloors);
    const tall = p.stacked === true || tower;
    const fh = snap(clamp(rand(rng, d[tall ? 'tower' : 'height'].floorHeight - 0.15,
      d[tall ? 'tower' : 'height'].floorHeight + 0.25), 2.6, 5.5));
    const id = lotId(d, state);
    const rec = {
      id: p.tag ? `${id}_${p.tag}` : id,
      archetype: name,
      // «к какому району относится лот» — служебное поле генератора: по нему
      // нормализатор собирает ОДНУ террасу на район (docs/level12-relief-plan.md,
      // п. 4.1), а не площадку под каждым корпусом. В модуль главы не доезжает,
      // как и `archetype`.
      district: d.id,
      isEnterable: false,
      floorsCount: f,
      floorHeight: fh,
      facadeMaterial: pick(rng, style.materials),
      footprint: p.poly,
      rooms: [],
    };
    // отметка пола части: ярус стека стоит на кровле предыдущего, одиночный блок — на грунте
    const floorY = p.stacked ? topY : ctx.ground.y;
    if (p.stacked) rec.baseY = r3(floorY);
    buildings.push(rec);
    if (enterable) fitEnterable(rec, d, style, ctx, streets);
    if (d.frame) rotateRecord(rec, d.frame, yawDeg);
    topY = r3(floorY + f * fh);
  });
}

const lotId = (d, state) => `${d.id}_${String(state.lots).padStart(3, '0')}`;

/**
 * Запись лота в мир косого района — по тому же соглашению, что у поворотного
 * дома в брифе: координаты остаются **неразвёрнутыми** (их поворачивает парсер
 * своим `rotation`), поэтому корпус переводится параллельным переносом — центр
 * его габарита ставится в повёрнутую точку района, а размеры и взаимные отступы
 * комнат, маршей и портала не меняются. Поворачивать полигон здесь значило бы
 * дать косые рёбра плана, которые схема комнат и валидатор фасадов бракует.
 *
 * `districtFrame` — служебное поле генератора (в модуль главы не доезжает, как
 * `archetype` и `district`): по нему нормализатор собирает террасу района в его
 * собственных осях. Без него габарит повёрнутого квартала стал бы квадратом
 * вокруг ромба, и подкос склон торчал бы из-под пола угловых домов.
 */
function rotateRecord(rec, f, yawDeg) {
  const b = boundsOf(rec.footprint);
  const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
  const c = rotatePoint(f, cx, cz);
  const dx = c.x - cx, dz = c.z - cz;
  const move = p => ({ x: r3(p.x + dx), z: r3(p.z + dz) });
  rec.footprint = rec.footprint.map(move);
  for (const room of rec.rooms ?? []) {
    room.polygon = room.polygon.map(move);
    for (const link of room.connections ?? []) {
      if (!link.portalPosition) continue;
      link.portalPosition = {
        x: r3(link.portalPosition.x + dx), y: link.portalPosition.y, z: r3(link.portalPosition.z + dz),
      };
    }
  }
  for (const st of rec.stairs ?? []) {
    if (st.position) st.position = { x: r3(st.position.x + dx), z: r3(st.position.z + dz) };
  }
  rec.rotation = yawDeg;
  rec.districtFrame = { cx: f.cx, cz: f.cz, yaw: r3(f.deg) };
}

/** Этажи по долям частей: последней отдаётся остаток, чтобы сумма совпала с `total`. */
function stackFloors(total, muls) {
  const sum = muls.reduce((a, b) => a + b, 0);
  const out = muls.map(m => Math.max(1, Math.round(total * m / sum)));
  out[out.length - 1] = Math.max(1, out[out.length - 1] + (total - out.reduce((a, b) => a + b, 0)));
  return out;
}

// ------------------------------------------------------------- вводимый дом

/**
 * Дом, в который можно войти: комната во весь footprint на каждом этаже (плиты
 * пола тогда покрывают этаж без дыр), марш в самом крупном прямоугольнике плана
 * и дверь на фасадном ребре, обращённом к улице. Всё, что не влезло, — отказ:
 * дом остаётся коробкой, потому что недостижимый этаж парсер отрезал бы при
 * построении графа, а проём двери без фасада вёл бы в никуда.
 */
function fitEnterable(rec, d, style, ctx, streets) {
  const rng = ctx.rng;
  const floors = Math.min(rec.floorsCount, J.enterableFloors);
  // плита пола комнаты парсер режет по её AABB, поэтому двор, вырезанный
  // Г-образной формой, остался бы залитым полом: вводимым бывает прямоугольный блок
  const rects = polyRects(rec.footprint);
  if (rects.length !== 1) { ctx.bump('house_not_rect'); return false; }
  const home = rects[0];
  const plan = stairPlan(home, rec.floorHeight, rng);
  if (!plan) { ctx.bump('house_no_stair'); return false; }
  const entrance = entranceOf(rec, streets, ctx.ground.y);
  if (!entrance) { ctx.bump('house_no_entrance'); return false; }

  ctx.bump('enterable');
  rec.isEnterable = true;
  rec.floorsCount = floors;
  rec.rooms = [];
  for (let k = 0; k < floors; k++) {
    const room = {
      id: `${rec.id}_r${k}`,
      floor: k,
      type: k === 0 ? style.groundRoom : pick(rng, style.upperRooms),
      polygon: rec.footprint.map(p => ({ x: p.x, z: p.z })),
    };
    if (k === 0) room.connections = [entrance];
    rec.rooms.push(room);
  }
  rec.stairs = [];
  for (let k = 0; k + 1 < floors; k++) {
    rec.stairs.push({
      id: `${rec.id}_s${k}`, type: plan.type, connectsFloors: [k, k + 1],
      position: plan.position, rotation: plan.rotation,
      dimensions: { width: plan.width, length: plan.length },
    });
  }
  // марш на кровлю только у одиночного блока: над подиумом стоит башня, и её
  // габарит прорезает плиту кровли целиком — подниматься было бы некуда.
  // Размер плиты не ограничиваем: на доме 7 × 7 м обе линии решётки кровли
  // (`J.navStep` с отступом парапета) попадают в габарит ограждения, и
  // reachable-узел наружу от люка дотягивает `_roofChain` в `src/json-map.js`
  if (d.roofs.walkable && chance(rng, d.roofs.access)) {
    const shaft = ladderPlan(home, plan);
    if (shaft) {
      ctx.bump('roofed');
      rec.roof = { walkable: true, parapet: d.roofs.parapet };
      rec.stairs.push({ id: `${rec.id}_roof`, type: 'ladder', connectsFloors: [floors - 1, floors], position: shaft });
    }
  }
  return true;
}

/**
 * Марш между этажами: тип берётся из тех, что влезают в комнату с запасом под
 * посадку, — прямой в узком доме, Г-образный в среднем, винт в крупном. Разворот
 * (rotation) 0 или 90: схема не делает косых маршей, потому что ступенчатая
 * коллизия косого марша расходится с его картинкой.
 */
function stairPlan(home, fh, rng) {
  const pad = r3(J.wallThickness + 0.4);
  const room = { minX: home.minX + pad, maxX: home.maxX - pad, minZ: home.minZ + pad, maxZ: home.maxZ - pad };
  const w = room.maxX - room.minX, dep = room.maxZ - room.minZ;
  const n = Math.max(4, Math.ceil(fh / J.maxRise));
  const alongX = w >= dep;
  const long = Math.max(w, dep), short = Math.min(w, dep);
  const cands = [];
  // подъём марша парсер считает вдоль большей из сторон (L = max(width,length)),
  // поэтому беговая длина никогда не должна становиться меньше поперечной:
  // иначе при низком потолке «прямой» марш развернётся на 90° и встанет поперёк дома
  const minRun = r3(fh / J.maxStairSlope);
  const straightL = r3(Math.max(n * TREAD_MIN, STAIR_DEPTH, minRun));
  if (long >= straightL + 2 * LANDING && short >= STAIR_DEPTH + 2 * LANDING) {
    cands.push({ type: 'straight', width: straightL, length: STAIR_DEPTH, weight: 3 });
  }
  const lL = r3(Math.max(2 * STAIR_DEPTH, (TREAD_MIN * Math.ceil(n / 2)) / 0.6, (minRun - STAIR_DEPTH) / 0.6));
  if (long >= lL + 2 * LANDING && short >= 2 * STAIR_DEPTH + 2 * LANDING) {
    cands.push({ type: 'l_shape', width: lL, length: 2 * STAIR_DEPTH, weight: 2 });
  }
  const d = r3(Math.min(long, short) - 2 * LANDING);
  if (d >= Math.max(2.2, minRun / Math.PI)) cands.push({ type: 'spiral', width: d, length: d, weight: 1 });
  if (!cands.length) {
    // расход ГПСЧ обязан совпасть с удачным подбором (выбор из пула и два
    // сдвига позиции), иначе отказ одного лота сдвигает счётчик всех
    // последующих районов и город пересобирается целиком
    for (let k = 0; k < 3; k++) rng();
    return null;
  }

  const pool = [];
  for (const c of cands) for (let k = 0; k < c.weight; k++) pool.push(c);
  const chosen = pool[Math.floor(rng() * pool.length)];
  // марш по возможности в середине комнаты и сдвинут на случайный шаг сетки:
  // посадке нужен пол за габаритом с обеих сторон подъёма
  const L = alongX ? chosen.width : chosen.length;
  const Wd = alongX ? chosen.length : chosen.width;
  const slackX = Math.max(0, (w - L) / 2 - LANDING), slackZ = Math.max(0, (dep - Wd) / 2 - LANDING);
  const ox = snap(rand(rng, -slackX, slackX)), oz = snap(rand(rng, -slackZ, slackZ));
  const cx = snap((room.minX + room.maxX) / 2 + ox), cz = snap((room.minZ + room.maxZ) / 2 + oz);
  return {
    type: chosen.type,
    rotation: alongX ? 0 : 90,
    position: { x: cx, z: cz },
    width: chosen.width,
    length: chosen.length,
    // план марша в мировых координатах — чтобы шахту кровли поставить в
    // противоположный угол, а не в тот же самый
    rect: alongX
      ? { minX: cx - L / 2, maxX: cx + L / 2, minZ: cz - Wd / 2, maxZ: cz + Wd / 2 }
      : { minX: cx - Wd / 2, maxX: cx + Wd / 2, minZ: cz - L / 2, maxZ: cz + L / 2 },
  };
}

/**
 * Шахта вертикального марша на кровлю — в углу дома, противоположном тому, где
 * стоит марш между этажами: две лестницы в одном плане режут плиту кровли и
 * плиту этажа одним и тем же проёмом, и верхняя ступень теряет посадку.
 */
function ladderPlan(home, plan) {
  const pad = r3(J.wallThickness + 0.4);
  const shaft = J.ladderShaft;
  const room = { minX: home.minX + pad, maxX: home.maxX - pad, minZ: home.minZ + pad, maxZ: home.maxZ - pad };
  if (room.maxX - room.minX < shaft + 2 || room.maxZ - room.minZ < shaft + 2) return null;
  const farX = plan.rect.minX + plan.rect.maxX >= room.minX + room.maxX ? room.minX + shaft / 2 : room.maxX - shaft / 2;
  const farZ = plan.rect.minZ + plan.rect.maxZ >= room.minZ + room.maxZ ? room.minZ + shaft / 2 : room.maxZ - shaft / 2;
  const at = { x: snap(farX), z: snap(farZ) };
  const rect = { minX: at.x - shaft / 2, maxX: at.x + shaft / 2, minZ: at.z - shaft / 2, maxZ: at.z + shaft / 2 };
  if (rectsIntersect(rect, plan.rect)) return null;
  return at;
}

/**
 * Вход: самое длинное ребро фасада у ближайшей улицы. Портал обязан лежать на
 * ребре комнаты (схема это проверяет), а якорь `outside` парсер считает на 1,4 м
 * наружу — и далеко от настила он повиснет над двором между лотами, где решётка
 * узлов не стоит (правило 4 в шапке), поэтому фасад вглубь квартала не годится.
 */
function entranceOf(rec, streets, groundY) {
  if (!streets.length) return null;
  let best = null;
  for (const e of polyEdges(rec.footprint)) {
    const len = Math.hypot(e.x1 - e.x0, e.z1 - e.z0);
    if (len < J.doorWidth + 1.2) continue;
    const mid = { x: (e.x0 + e.x1) / 2, z: (e.z0 + e.z1) / 2 };
    const out = outwardDir(rec.footprint, e);
    if (!out) continue;
    const mouth = { x: mid.x + out.x, z: mid.z + out.z };
    const street = nearestStreet(mouth, streets);
    if (!street) continue;
    const dist = distToRect(mouth, street.rect);
    if (dist > MOUTH_REACH) continue;
    if (!best || len > best.len + 1e-9) best = { len, mid, street };
  }
  if (!best) return null;
  return {
    target: best.street.id,
    portalPosition: { x: r3(best.mid.x), y: r3(groundY), z: r3(best.mid.z) },
    linkType: 'main_entrance',
  };
}

function nearestStreet(p, streets) {
  let best = null, bestD = Infinity;
  for (const s of streets) {
    const d = distToRect(p, s.rect);
    if (d < bestD - 1e-9) { bestD = d; best = s; }
  }
  return best;
}

function distToRect(p, r) {
  const dx = Math.max(r.minX - p.x, 0, p.x - r.maxX);
  const dz = Math.max(r.minZ - p.z, 0, p.z - r.maxZ);
  return Math.hypot(dx, dz);
}

/** Наружу ребра: проба по обеим сторонам — где вне полигона, туда и смотрит фасад. */
function outwardDir(poly, e) {
  const mid = { x: (e.x0 + e.x1) / 2, z: (e.z0 + e.z1) / 2 };
  const dirs = e.axis === 'x' ? [{ x: 0, z: 1 }, { x: 0, z: -1 }] : [{ x: 1, z: 0 }, { x: -1, z: 0 }];
  for (const d of dirs) {
    if (!pointInPoly(poly, mid.x + d.x * 1.2, mid.z + d.z * 1.2)) return d;
  }
  return null;
}
