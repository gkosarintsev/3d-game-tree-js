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
import { pointInPoly, polyEdges, polyRects, r3, rectsIntersect } from '../src/geo2d.js';
import { normalizeBuilding, normalizeRoad, normalizeWaterway } from './normalize-level.mjs';

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
const blocked = (rect, obstacles) => obstacles.some(o => rectsIntersect(rect, o.rect, 0.05));

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
 * Что запрещено ещё до первого вызова ГПСЧ. Ошибки копятся списком: правка
 * конфигурации района — это цифры, и владелец обязан увидеть все несостыковки
 * за один прогон, а не по одной.
 */
function cityConfigErrors(city, ground, districts) {
  const errors = [];
  const half = ground.size / 2;
  if (!Number.isInteger(city.seed)) errors.push(`city.seed ${city.seed} — не целое: ГПСЧ mulberry32 работает с 32-битным сидом`);
  const seen = new Set();
  for (const d of districts) {
    if (!d.id) { errors.push('city.districts: у района нет id — его улицы и лоты не получат имён'); continue; }
    if (seen.has(d.id)) errors.push(`city.districts: id района '${d.id}' уже занят`);
    seen.add(d.id);
    const spec = districtSpec(d);
    const b = d.block;
    if (!b) { errors.push(`city.districts (${d.id}): нет блока — генератору негде встать`); continue; }
    for (const [k, v] of [['minX', b.minX], ['maxX', b.maxX], ['minZ', b.minZ], ['maxZ', b.maxZ]]) {
      if (Math.abs(v) > half) errors.push(`city.districts (${d.id}): блок ${k} = ${v} вне земли ${ground.size} м (±${half})`);
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
  // в одном месте дали бы два настила в одной плоскости (мигающий z-buffer)
  for (let i = 0; i < districts.length; i++) {
    for (let k = i + 1; k < districts.length; k++) {
      const a = districts[i].block, b = districts[k].block;
      if (a && b && rectsIntersect(a, b, 0.05)) {
        errors.push(`city.districts: блоки '${districts[i].id}' и '${districts[k].id}' пересекаются — улицы обоих районов легли бы одна на другую`);
      }
    }
  }
  return errors;
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
  const errors = cityConfigErrors(city, ground, districts);
  if (errors.length) throw new Error(errors.join('\n'));
  if (!districts.length) throw new Error('city.districts пуст: генератор не дал бы ни улицы, ни дома');

  const ctx = {
    ground,
    rng: makeRng(city.seed ?? 0),
    obstacles: obstacleRects(raw, ground, city.avoid ?? []),
    state: { lots: 0 },
    bump: key => { if (stats) stats[key] = (stats[key] ?? 0) + 1; },
  };
  const roads = [], buildings = [];
  for (const d of districts) {
    generateDistrict(districtSpec(d), ctx, roads, buildings);
  }

  const { city: _drop, ...rest } = raw;
  return {
    ...rest,
    roads: mergeAuthored(raw.roads, roads),
    buildings: mergeAuthored(raw.buildings, buildings),
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

function generateDistrict(d, ctx, roadsOut, buildingsOut) {
  const style = CITY_STYLES[d.style];
  const hW = r3(d.street.width / 2);
  const edge = r3(hW + VERGE);
  const linesX = gridLines(d.block.minX, d.block.maxX, d.street.pitch, edge);
  const linesZ = gridLines(d.block.minZ, d.block.maxZ, d.street.pitch, edge);
  const deckY = r3(ctx.ground.y + J.streetRise);
  const streets = [];

  // имя улицы — по направлению настила, чтобы дверь ссылалась на тот id,
  // который автор видит в брифе
  for (const [i, z] of linesZ.entries()) {
    emitStreet(d, ctx, roadsOut, streets, `s_h${i}`, 'x', snap(z), d.block.minX, d.block.maxX, hW, deckY);
  }
  for (const [i, x] of linesX.entries()) {
    emitStreet(d, ctx, roadsOut, streets, `s_v${i}`, 'z', snap(x), d.block.minZ, d.block.maxZ, hW, deckY);
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

/** Улица района: линия с разрезами по препятствиям, каждый оставшийся прогон — своя запись. */
function emitStreet(d, ctx, roadsOut, streets, base, axis, cross, lo, hi, hW, deckY) {
  const cuts = [];
  for (const o of ctx.obstacles) {
    if (!o.streets) continue;
    const span = cutBand(o.rect, axis, cross, hW + STREET_CLEAR);
    if (span) cuts.push(span);
  }
  const runs = freeRuns(lo, hi, cuts);
  runs.forEach(([a, b], k) => {
    const id = `${d.id}_${runs.length === 1 ? base : `${base}_${k}`}`;
    const points = axis === 'x'
      ? [{ x: snap(a), y: deckY, z: cross }, { x: snap(b), y: deckY, z: cross }]
      : [{ x: cross, y: deckY, z: snap(a) }, { x: cross, y: deckY, z: snap(b) }];
    roadsOut.push({ id, type: 'ground', width: d.street.width, lamps: true, points });
    streets.push({ id, rect: plateRect(axis, cross, snap(a), snap(b), hW) });
  });
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
  if (blocked(lot, ctx.obstacles)) { ctx.bump('lot_blocked'); return; }

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
    topY = r3(floorY + f * fh);
  });
}

const lotId = (d, state) => `${d.id}_${String(state.lots).padStart(3, '0')}`;

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
  const straightL = r3(Math.max(n * TREAD_MIN, STAIR_DEPTH));
  if (long >= straightL + 2 * LANDING && short >= STAIR_DEPTH + 2 * LANDING) {
    cands.push({ type: 'straight', width: straightL, length: STAIR_DEPTH, weight: 3 });
  }
  const lL = r3(Math.max(2 * STAIR_DEPTH, (TREAD_MIN * Math.ceil(n / 2)) / 0.6));
  if (long >= lL + 2 * LANDING && short >= 2 * STAIR_DEPTH + 2 * LANDING) {
    cands.push({ type: 'l_shape', width: lL, length: 2 * STAIR_DEPTH, weight: 2 });
  }
  const d = r3(Math.min(long, short) - 2 * LANDING);
  if (d >= 2.2) cands.push({ type: 'spiral', width: d, length: d, weight: 1 });
  if (!cands.length) return null;

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
