/**
 * Схема уровня (JSON, который выдаёт LLM) и её проверка — бэкенд-валидатор
 * пайплайна из docs/editor-plan.md.
 *
 * Ajv в проект не ставится (правило «новых npm-зависимостей» в AGENTS.md),
 * поэтому поля описаны декларативно и обходятся руками. Проверка делится на
 * два прохода: структура (типы, обязательность, enum, диапазоны) и геометрия
 * (осевые рёбра, замкнутость, «комната внутри footprint», пересечения, уклоны
 * дорог, опоры в плане дороги, лимит настоящих источников света).
 */
import { CONFIG } from '../src/config.js';
import {
  AXIS_EPS, cellKey, normalizePolygon, polyBounds, polyEdges, polyRects,
  r3, rasterPoly, rasterRect, rectsIntersect, cellsIntersect,
} from '../src/geo2d.js';
import { normalizeBuilding, normalizeWaterway, toWorld } from './normalize-level.mjs';
import { ARCHETYPE_NAMES } from './city.js';

const J = CONFIG.jsonMap;
// тип комнаты — подпись назначения: парсер и JsonMap его не читают (пол, солид и
// граф от него не зависят), но автору главы 10 он нужен, чтобы по id и типу
// различать вестибюль, рынок и склад — и чтобы этап неона мог вешать витрины
// на торговые, а не на первые попавшиеся
const ROOM_TYPES = ['office', 'corridor', 'hall', 'room', 'cafe', 'utility', 'lobby', 'market', 'warehouse'];
// skybridge — не-наземный настил без опор: его держат здания, поэтому у каждого
// его торца обязана быть дверь или ходовая кровля на той же отметке
const ROAD_TYPES = ['ground', 'bridge', 'embankment', 'skybridge'];
// ladder — вертикальный марш: план шахты не меняется с высотой, подъём одной
// проступи тот же, что у ступени (J.maxRise), поэтому нога идёт им, как лестницей
const STAIR_TYPES = ['straight', 'l_shape', 'spiral', 'ladder'];
const BANK_TYPES = ['quay', 'slope'];
const LIGHT_TYPES = ['point', 'spot', 'directional'];
const LINK_TYPES = ['main_entrance', 'door', 'back_entrance'];

// ------------------------------------------------------------- описание полей

const num = (opts = {}) => ({ kind: 'number', ...opts });
const str = (opts = {}) => ({ kind: 'string', ...opts });
const bool = (opts = {}) => ({ kind: 'boolean', ...opts });
const color = (opts = {}) => ({ kind: 'color', ...opts });
const obj = (fields, opts = {}) => ({ kind: 'object', fields, ...opts });
const arr = (items, opts = {}) => ({ kind: 'array', items, ...opts });
const V2XZ = obj({ x: num({ req: true }), z: num({ req: true }) });
const V3XYZ = obj({ x: num({ req: true }), y: num({ req: true }), z: num({ req: true }) });

export const LEVEL_SPEC = obj({
  metadata: obj({
    levelName: str({ req: true }),
    name: str({ req: true }),
    hint: str({ req: true }),
    engine: str(),
    units: str({ enum: ['meters'], req: true }),
  }, { req: true }),
  ground: obj({ y: num(), size: num({ min: 20, req: true }), color: color() }),
  roads: arr(obj({
    id: str({ req: true }),
    type: str({ enum: ROAD_TYPES, req: true }),
    width: num({ min: 2, max: 30, req: true }),
    lamps: bool(),
    points: arr(V3XYZ, { minItems: 2, req: true }),
  }), { req: true }),
  // река, канал, сточная канава: осевые рёбра в плане, дно ниже уровня земли;
  // берег — отвесная набережная (quay) или откос (slope), брод — сходы в русло
  waterways: arr(obj({
    id: str({ req: true }),
    width: num({ min: 2, max: 120, req: true }),
    bedY: num({ req: true }),
    surfaceY: num({ req: true }),
    bank: str({ enum: BANK_TYPES, req: true }),
    bankRun: num({ min: 1 }),
    wade: bool(),
    ramps: arr(obj({
      at: obj({ x: num({ req: true }), z: num({ req: true }) }, { req: true }),
      width: num({ min: 2, max: 12 }),
    })),
    points: arr(V2XZ, { minItems: 2, req: true }),
  })),
  buildings: arr(obj({
    id: str({ req: true }),
    name: str(),
    // «чем построен этот корпус» — поле брифа и генератора (tools/city.js);
    // нормализатор его не читает, в модуль главы он не доезжает
    archetype: str({ enum: ARCHETYPE_NAMES }),
    isEnterable: bool(),
    // потолок этажей — J.shellFloorsMax только для невводимых башен (их этажи —
    // ритм фасада, плит нет); вводимый дом ограничен J.enterableFloors — проверется геометрией
    floorsCount: num({ min: 1, max: J.shellFloorsMax, req: true }),
    floorHeight: num({ min: 2.4, max: 8, req: true }),
    baseY: num(),
    facadeMaterial: str(),
    roof: obj({
      walkable: bool(),
      parapet: num({ min: 0, max: 1.5 }),
    }),
    footprint: arr(V2XZ, { minItems: 4, req: true }),
    rooms: arr(obj({
      id: str({ req: true }),
      floor: num({ min: 0, req: true }),
      type: str({ enum: ROOM_TYPES, req: true }),
      polygon: arr(V2XZ, { minItems: 4, req: true }),
      connections: arr(obj({
        target: str({ req: true }),
        portalPosition: V3XYZ,
        linkType: str({ enum: LINK_TYPES }),
      })),
    }), { req: true }),
    stairs: arr(obj({
      id: str({ req: true }),
      connectsFloors: arr(num({ min: 0 }), { minItems: 2, maxItems: 2, req: true }),
      type: str({ enum: STAIR_TYPES, req: true }),
      position: V2XZ,
      rotation: num(),
      dimensions: obj({ width: num({ min: 1, req: true }), length: num({ min: 1, req: true }), height: num() }),
    })),
  })),
  landscapeObjects: arr(obj({
    id: str({ req: true }),
    model: str({ enum: J.models, req: true }),
    position: V3XYZ,
    rotation: obj({ x: num(), y: num(), z: num() }),
    scale: obj({ x: num({ min: 0.05 }), y: num({ min: 0.05 }), z: num({ min: 0.05 }) }),
  })),
  lights: arr(obj({
    id: str({ req: true }),
    type: str({ enum: LIGHT_TYPES, req: true }),
    position: V3XYZ,
    target: V3XYZ,
    color: color(),
    intensity: num({ min: 0, max: 400 }),
    distance: num({ min: 0 }),
    angle: num({ min: 0, max: 1.57 }),
  })),
  // светящиеся окна фасадов: само наличие секции включает ритм, числа — это
  // переопределение `CONFIG.jsonMap.windows` (включатель по той же причине, что у
  // `waterways`: глава 9 обязана собраться ровно как раньше)
  windows: obj({
    spacing: num({ min: 0, max: 12 }),   // 0 — дому окна не рисуются вовсе
    width: num({ min: 0.2, max: 6 }),
    height: num({ min: 0.2, max: 6 }),
    sill: num({ min: 0, max: 3 }),
    offset: num({ min: 0.01, max: 1 }),
    lit: num({ min: 0, max: 1 }),
  }),
  // мусор кровель и тротуаров: наличие секции включает вывод, ритмы —
  // переопределение `CONFIG.jsonMap.clutter` (картинка считается картой, как окна)
  clutter: obj({
    tall: num({ min: 3, max: 200 }),
    head: num({ min: 1.5, max: 12 }),     // м: свободный зазор над предметом
    roof: obj({
      edge: num({ min: 0.4, max: 8 }),    // м: отступ предмета от борта кровли
      step: num({ min: 1, max: 20 }),     // м: шаг сетки на кровле
      keep: num({ min: 0, max: 1 }),      // доля слотов, занятая мусором
      perHouse: num({ min: 0, max: 12 }), // штук: не больше этого на дом
    }),
    street: obj({
      every: num({ min: 4, max: 60 }),    // м: шаг вдоль настила
      inset: num({ min: 0.3, max: 6 }),   // м: насколько предмет уйдёт с полотна к борту
      minLamp: num({ min: 0, max: 12 }),  // м: не ближе этого к уже поставленному предмету
      keep: num({ min: 0, max: 1 }),
    }),
  }),
  sky: obj({
    sky: color(),
    fog: obj({ color: color(), near: num({ min: 1 }), far: num({ min: 2 }) }),
    sun: obj({ color: color(), intensity: num({ min: 0, max: 10 }), position: arr(num({}), { minItems: 3, maxItems: 3 }) }),
    hemi: obj({ sky: color(), ground: color(), intensity: num({ min: 0, max: 10 }) }),
    // пул огней, переставляемых на опорные точки рядом с камерой (src/night-lights.js)
    lights: obj({
      count: num({ min: 0, max: 8 }), reach: num({ min: 1 }), height: num({ min: 0 }),
      spacing: num({ min: 1 }), intensity: num({ min: 0, max: 400 }),
    }),
  }),
  gameplay: obj({
    goal: str({ enum: ['exit'], req: true }),
    spawn: V2XZ,
    exit: V2XZ,
    exitRadius: num({ min: 1, max: 40 }),
    enemies: obj({ count: num({ min: 0, max: 30 }) }),
    alienEnemies: obj({ count: num({ min: 0, max: 30 }) }),
  }, { req: true }),
});

// ------------------------------------------------------------- обход схемы

function typeOf(v) {
  if (Array.isArray(v)) return 'array';
  if (v === null) return 'null';
  return typeof v;
}

function checkValue(value, spec, path, errors) {
  switch (spec.kind) {
    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        errors.push(`${path}: ожидалось число, получено ${JSON.stringify(value)}`);
        return;
      }
      if (spec.min !== undefined && value < spec.min) errors.push(`${path}: ${value} меньше минимума ${spec.min}`);
      if (spec.max !== undefined && value > spec.max) errors.push(`${path}: ${value} больше максимума ${spec.max}`);
      return;
    case 'string':
      if (typeof value !== 'string') { errors.push(`${path}: ожидалась строка`); return; }
      if (spec.enum && !spec.enum.includes(value)) {
        errors.push(`${path}: '${value}' вне перечисления ${spec.enum.join('|')}`);
      }
      return;
    case 'boolean':
      if (typeof value !== 'boolean') errors.push(`${path}: ожидалось true|false`);
      return;
    case 'color':
      if (typeof value === 'number') return;
      if (typeof value !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(value)) {
        errors.push(`${path}: цвет — число 0x… или строка '#rrggbb'`);
      }
      return;
    case 'array': {
      if (!Array.isArray(value)) { errors.push(`${path}: ожидался массив`); return; }
      if (spec.minItems !== undefined && value.length < spec.minItems) {
        errors.push(`${path}: элементов меньше ${spec.minItems}`);
      }
      if (spec.maxItems !== undefined && value.length > spec.maxItems) {
        errors.push(`${path}: элементов больше ${spec.maxItems}`);
      }
      value.forEach((v, i) => checkValue(v, spec.items, `${path}[${i}]`, errors));
      return;
    }
    case 'object': {
      if (typeOf(value) !== 'object') { errors.push(`${path}: ожидался объект`); return; }
      for (const [key, sub] of Object.entries(spec.fields)) {
        if (value[key] === undefined) {
          if (sub.req) errors.push(`${path}.${key}: обязательное поле отсутствует`);
          continue;
        }
        checkValue(value[key], sub, `${path}.${key}`, errors);
      }
      for (const key of Object.keys(value)) {
        if (!(key in spec.fields)) errors.push(`${path}.${key}: поле не описано в схеме`);
      }
      return;
    }
    default:
      errors.push(`${path}: спецификация сломана (kind=${spec.kind})`);
  }
}

/** Проверка структуры: только типы, обязательность, enum и диапазоны. */
export function validateSpec(raw, spec = LEVEL_SPEC) {
  const errors = [];
  checkValue(raw, spec, '', errors);
  return errors;
}

// ------------------------------------------------------------- проверка геометрии

/**
 * Второй проход — то, что видно только по всей картине: комнаты внутри
 * footprint, пересечения комнат, лестницы в комнатах, осевые рёбра дорог,
 * уклоны, опоры под настилом, лимит огней.
 * @returns {{errors:string[], warnings:string[]}}
 */
export function validateLevel(raw) {
  const errors = validateSpec(raw);
  const warnings = [];
  if (errors.length) return { errors, warnings, geometryOnly: false };

  const size = raw.ground?.size ?? 176;
  const half = size / 2;
  const groundY = raw.ground?.y ?? 0;
  const cell = J.probeCell;

  // --- дороги: осевые последовательные точки и разумные уклоны ---
  const roadRects = [];
  for (const [n, road] of (raw.roads ?? []).entries()) {
    const label = `roads[${n}] (${road.id})`;
    for (let i = 0; i + 1 < road.points.length; i++) {
      const a = road.points[i], b = road.points[i + 1];
      const dx = Math.abs(a.x - b.x), dz = Math.abs(a.z - b.z);
      if (dx > AXIS_EPS && dz > AXIS_EPS) {
        errors.push(`${label}: отрезок ${i}→${i + 1} косой — настил дороги обязан идти по оси X или Z`);
        continue;
      }
      const run = Math.max(dx, dz);
      const rise = Math.abs(b.y - a.y);
      if (run < 0.01) errors.push(`${label}: отрезок ${i}→${i + 1} нулевой длины`);
      // настил с подъёмом — одна наклонная пластина (не лестница коробок), и её
      // крутизна ограничена тем, что перешагивает нога и что берёт сфера Чужого
      if (run > 0.01 && rise / run > J.maxSlope + 1e-9) {
        errors.push(`${label}: отрезок ${i}→${i + 1} даёт уклон ${(rise / run).toFixed(2)} м/м — `
          + `круче ${J.maxSlope} (подъём ${rise.toFixed(2)} м на ${run.toFixed(2)} м неперешагиваем)`);
      }
      if (road.type !== 'ground' && Math.max(a.y, b.y) - groundY < J.bridgeMinHeight) {
        warnings.push(`${label}: настил на ${road.id} ниже ${J.bridgeMinHeight} м над землёй — под ним не пройти`);
      }
    }
    if (road.type !== 'ground') {
      const top = Math.max(...road.points.map(p => p.y));
      if (top - groundY < J.bridgeMinHeight) {
        errors.push(`${label}: ${road.type} с верхом ${top} не поднимается над землёй на ${J.bridgeMinHeight} м`);
      }
    }
    roadRects.push(...roadRectsOf(road));
  }

  // --- вода: русло, берега, сходы ---
  // Планы берёт нормализатор: проверять «дом не в русле» по своей копии
  // арифметики берега значило бы держать её в двух местах и разъезжаться с
  // парсером при первой же правке.
  const channelRects = [];
  for (const [n, w] of (raw.waterways ?? []).entries()) {
    const label = `waterways[${n}] (${w.id})`;
    for (let i = 0; i + 1 < w.points.length; i++) {
      const a = w.points[i], b = w.points[i + 1];
      const dx = Math.abs(a.x - b.x), dz = Math.abs(a.z - b.z);
      if (dx > AXIS_EPS && dz > AXIS_EPS) {
        errors.push(`${label}: отрезок ${i}→${i + 1} косой — ось русла обязана идти по X или Z`);
        continue;
      }
      if (dx < AXIS_EPS && dz < AXIS_EPS) errors.push(`${label}: отрезок ${i}→${i + 1} нулевой длины`);
    }
    for (const [i, p] of w.points.entries()) {
      if (Math.abs(p.x) > half || Math.abs(p.z) > half) {
        errors.push(`${label}: точка русла ${i} (${p.x}, ${p.z}) вне земли ${size} м`);
      }
    }
    const rise = groundY - w.bedY;
    if (rise < 0.2) {
      errors.push(`${label}: дно ${w.bedY} мельче 0,2 м под землёй ${groundY} — русла нет, есть канава в полшага`);
    }
    if (w.bedY >= w.surfaceY) errors.push(`${label}: surfaceY ${w.surfaceY} не выше дна ${w.bedY} — воде негде лечь`);
    if (w.surfaceY > groundY) {
      errors.push(`${label}: surfaceY ${w.surfaceY} выше земли ${groundY} — вода стояла бы поверх улиц`);
    }

    let ch = null;
    try {
      ch = normalizeWaterway(w, { y: groundY });
    } catch (e) {
      errors.push(`${label}: ${e.message}`);
    }
    if (!ch) continue;

    const seg0 = ch.segments[0];
    if (w.bank === 'slope' && rise > 0 && seg0.run > 0 && rise / seg0.run > J.maxSlope + 1e-9) {
      errors.push(`${label}: bankRun ${seg0.run} при перепаде ${rise} даёт уклон берега `
        + `${(rise / seg0.run).toFixed(2)} м/м — круче ${J.maxSlope}, нога и сфера Чужого склон не возьмут`);
    }
    if (w.bank === 'quay' && ch.wade && (w.ramps ?? []).length < 2) {
      errors.push(`${label}: набережная с бродом и ${(w.ramps ?? []).length} сходами — в русло войти можно,`
        + ' а стенка карниза не отпускает обратно: сходов нужно не меньше двух');
    }
    for (const [i, r] of (w.ramps ?? []).entries()) {
      const rlabel = `${label}.ramps[${i}]`;
      const reach = Math.max(...ch.segments.map(s => s.halfW + s.depth + s.rampRun + 2));
      const d = Math.min(...ch.segments.map(s => {
        const along = s.axis === 'x' ? r.at.x : r.at.z;
        const cross = s.axis === 'x' ? r.at.z : r.at.x;
        const outAlong = Math.max(s.lo - along, along - s.hi, 0);
        return Math.hypot(outAlong, Math.abs(cross - s.cross));
      }));
      if (d > reach) {
        errors.push(`${rlabel}: сход ${r.at.x}, ${r.at.z} в ${d.toFixed(1)} м от русла — дальше, чем `
          + `${reach.toFixed(1)} м (полширины + берег + длина пандуса); пандус ушёл бы в никуда`);
      }
    }
    for (const h of ch.holes) channelRects.push({ id: w.id, rect: h });
  }
  // наземная улица в русле — асфальт лег бы на воду: опоры у настила нет, и
  // ни ноги, ни маршруты через такое место не проходят
  for (const rr of roadRects) {
    if (!rr.ground) continue;
    for (const c of channelRects) {
      if (rectsIntersect(rr.rect, c.rect, 0.05)) {
        errors.push(`roads (${rr.id}): план наземной улицы пересёкся с руслом ${c.id} — дорогу через воду делает мост`);
      }
    }
  }

  // --- здания: footprint, комнаты, лестницы, двери ---
  const roadIds = new Set((raw.roads ?? []).map(r => r.id));
  // наземная улица под домом — дом посреди проезжей части: маршруты идут по
  // настилу, а габарит стоит в нём, поэтому такое здание бракуется
  const groundRects = roadRects.filter(r => r.ground);
  // нормализованные копии зданий: торцы переходов проверяются по тем же отметкам
  // полов, кровель и дверей, что считает парсер, — своя копия этой арифметики
  // разъехалась бы с ним при первой же правке
  const normBuildings = [];
  for (const [n, b] of (raw.buildings ?? []).entries()) {
    const label = `buildings[${n}] (${b.id})`;
    const enterable = b.isEnterable !== false;
    if (enterable && b.floorsCount > J.enterableFloors) {
      errors.push(`${label}: ${b.floorsCount} этажей во вводимом доме — максимум ${J.enterableFloors}`
        + ' (механизм маршей: посадка и проёмы перекрытий считаются по этажам)');
    }
    if (b.roof && b.roof.walkable !== true && (b.roof.parapet ?? 0) > 0) {
      warnings.push(`${label}: парапет ${b.roof.parapet} при невходимой кровле — по ней никто не ходит, ограждения парсер не ставит`);
    }
    try {
      normBuildings.push(normalizeBuilding(b, { y: groundY, size }, []));
    } catch {
      // разбор полигона упадёт уже в ошибках ниже — проверять торцы перехода не по чему
    }
    const fp = normalizePolygon(b.footprint, `${label}.footprint`, errors);
    if (!fp) continue;
    const fpCells = rasterPoly(fp, cell);
    if (fpCells.size === 0) { errors.push(`${label}: footprint не покрывает ни одной клетки — здания нет`); continue; }
    const bounds = polyBounds(fp);
    for (const rect of polyRects(fp)) {
      for (const rr of groundRects) {
        if (rectsIntersect(rect, rr.rect, 0.05)) {
          errors.push(`${label}: часть footprint ${fmtRect(rect)} легла на план наземной дороги ${rr.id} — дом стоит в улице`);
        }
      }
      // план русла включает дно, берега, сходы и стенки: дом, вставший в него,
      // отнял бы у воды суши, а игрок — дорогу вброд
      for (const c of channelRects) {
        if (rectsIntersect(rect, c.rect, 0.05)) {
          errors.push(`${label}: часть footprint ${fmtRect(rect)} легла в русло ${c.id} — дом стоит в воде`);
        }
      }
    }
    for (const v of [[bounds.minX, bounds.minZ], [bounds.maxX, bounds.maxZ]]) {
      if (Math.abs(v[0]) > half || Math.abs(v[1]) > half) {
        errors.push(`${label}: выходит за землю (${size} м): точка ${v[0]}, ${v[1]}`);
      }
    }

    const used = [];
    // цель двери может быть только улицей, комнатой этого же дома или лестницей:
    // на несуществующий адрес карта повесила бы проём, ведущий в никуда
    const roomIds = new Set(b.rooms.map(r => r.id));
    const stairIds = new Set((b.stairs ?? []).map(s => s.id));
    for (const [k, room] of b.rooms.entries()) {
      const rlabel = `${label}.rooms[${k}] (${room.id})`;
      if (room.floor >= b.floorsCount) {
        errors.push(`${rlabel}: этаж ${room.floor} при floorsCount ${b.floorsCount}`);
      }
      const rp = normalizePolygon(room.polygon, `${rlabel}.polygon`, errors);
      if (!rp) continue;
      const rc = rasterPoly(rp, cell);
      for (const key of rc) {
        if (!fpCells.has(key)) { errors.push(`${rlabel}: комната выходит за периметр footprint (клетка ${key})`); break; }
      }
      for (const prev of used) {
        if (prev.floor !== room.floor) continue;
        if (cellsIntersect(rc, prev.cells)) {
          errors.push(`${rlabel}: пересекается с комнатой ${prev.id} того же этажа`);
        }
      }
      used.push({ id: room.id, floor: room.floor, cells: rc, rect: boundsOf(rp) });
      for (const c of (room.connections ?? [])) {
        if (!roadIds.has(c.target) && !roomIds.has(c.target) && !stairIds.has(c.target)) {
          errors.push(`${rlabel}: target '${c.target}' — не улица, не комната и не лестница этого дома`);
        }
        const onEdge = polyEdges(rp).some(e => distToEdge(e, c.portalPosition.x, c.portalPosition.z) <= 0.25);
        if (!onEdge) {
          errors.push(`${rlabel}: portalPosition ${c.portalPosition.x}, ${c.portalPosition.z} не на ребре комнаты —`
            + ' дверь не прорежет стену');
        }
      }
    }

    for (const [k, st] of (b.stairs ?? []).entries()) {
      const slabel = `${label}.stairs[${k}] (${st.id})`;
      const [k0, k1] = st.connectsFloors;
      // верх марша обязан совпасть с чем-то: перекрытием этажа (k1 < floorsCount)
      // или кровлей (k1 === floorsCount — люк на крышу). Глубже кровли марша нет:
      // плита её не пропустит, а на отметке выше roofY опоры не существует
      const toRoof = k1 === b.floorsCount;
      if (k1 <= k0) errors.push(`${slabel}: connectsFloors [${k0}, ${k1}] — вниз лестница не ведёт`);
      if (k1 > b.floorsCount) {
        errors.push(`${slabel}: верхний этаж ${k1} при floorsCount ${b.floorsCount} — марш ушёл выше кровли (отметка ${b.baseY ?? 0} + ${k1}·${b.floorHeight})`);
      }
      if (toRoof && b.roof?.walkable !== true) {
        errors.push(`${slabel}: марш выведен на кровлю (этаж ${k1}), а она не ходкая — roof.walkable: true`
          + ' иначе поднявшийся встанет на плиту, по которой парсер не ведёт маршруты, и упрётся в парапет');
      }
      // план по умолчанию имеет только вертикальный марш (шахта J.ladderShaft):
      // у остальных размеров нет, и марш встал бы в точку
      const d = st.dimensions ?? (st.type === 'ladder' ? { width: J.ladderShaft, length: J.ladderShaft } : null);
      if (!d) {
        errors.push(`${slabel}: ${st.type} без dimensions — план марша обязана задавать схема, по умолчанию его держит только ladder`);
      }
      const dd = d ?? { width: J.ladderShaft, length: J.ladderShaft };
      const along = Math.max(dd.width, dd.length), across = Math.min(dd.width, dd.length);
      // план марша поворачивает тот же toWorld, что и парсер: своя арифметика
      // «габарит вдоль X» проверила бы не тот проём, который режется в плите
      const rect = toWorld({ minX: 0, maxX: along, minZ: 0, maxZ: across },
        st.rotation ?? 0, st.position.x, st.position.z, along, across);
      const sc = rasterRect(rect, cell);
      for (const key of sc) {
        if (!fpCells.has(key)) { errors.push(`${slabel}: лестница вне footprint (клетка ${key})`); break; }
      }
      if (st.type === 'spiral' && across < 2 * (CONFIG.alien.radius + CONFIG.radius)) {
        errors.push(`${slabel}: винтовая лестница уже ${2 * (CONFIG.alien.radius + CONFIG.radius)} м — тело Чужого не впишется`);
      }
      // перекрытие и крыша вокруг марша режутся проёмом на клиенте, поэтому
      // соседство комнаты с лестницей — норма. Норма обязана быть с обеих сторон:
      // без комнаты внизу марш стоит над ямой, без комнаты наверху поднявшийся
      // выходит в плиту перекрытия
      const roomAt = floor => used.find(r => r.floor === floor && cellsIntersect(sc, r.cells));
      if (!roomAt(k0)) {
        errors.push(`${slabel}: низ марша не попадает ни в одну комнату этажа ${k0} — под ступенями нет пола`);
      }
      if (!toRoof && !roomAt(k1)) {
        errors.push(`${slabel}: верх марша не попадает ни в одну комнату этажа ${k1} — поднявшийся выйдет в перекрытие`);
      }
    }

    // вход обязан лежать на фасадном ребре: парсер знает только комнату,
    // поэтому проверяем, что портал на ребре и footprint тоже (иначе это
    // внутренняя перегородка, и с улицы в дом не попасть)
    for (const room of used) {
      for (const c of (room.connections ?? [])) {
        const onFp = polyEdges(fp).some(e => distToEdge(e, c.portalPosition.x, c.portalPosition.z) <= 0.25);
        if (!onFp) warnings.push(`${label}: вход ${c.linkType ?? 'door'} комнаты ${room.id} на внутренней перегородке, не на фасаде`);
      }
    }
  }

  // --- переходы (skybridge): у пластины нет опор с земли, её держат здания ---
  // Каждый торец обязан совпасть с отметкой пола комнаты (тогда в переход ведёт
  // её дверь) или с ходовой кровлей (тогда настил примыкает к плите). Без этого
  // парсер выдал бы пластину в воздухе: нога на неё встанет из узла настила, а
  // маршруту негде было бы на неё войти и с неё выйти.
  // Проверяется не вся пластина, а её конец глубиной в ширину настила: прямолинейный
  // переход — одна пластина на оба торца, и проверка ею целиком пропускала бы
  // висячий конец, стоило бы другому концу зацепить здание.
  // Конец отпускается на J.skybridgeFit и в плане, как по высоте: плита кровли и
  // фасад приходят ровно в черту торца, и строгая пересечённость браковала бы
  // примыкание в ноль.
  for (const [n, road] of (raw.roads ?? []).entries()) {
    if (road.type !== 'skybridge') continue;
    const label = `roads[${n}] (${road.id})`;
    const plans = roadRectsOf(road);
    const ends = [[0, road.points[0], 'начальный'], [plans.length - 1, road.points[road.points.length - 1], 'конечный']];
    for (const [pi, p, name] of ends) {
      const plate = plans[pi]?.rect;
      if (!plate) { errors.push(`${label}: настил не разложен на пластины — торцу негде проверять опору`); continue; }
      const cap = grown(endCap(plate, p, road.width), J.skybridgeFit);
      const elabel = `${label}: торец ${name} (${p.x}, ${p.z}) на отметке ${p.y}`;
      // примыкание меряется проёмом двери, а не её наружным узлом: узел парсер
      // выносит на 1,4 м за фасад (там нога входит в дверь), а пластина кончается
      // у стены — проверять по узлу значило бы требовать перехода длиннее дома
      const door = normBuildings.some(b => b.doors.some(d => Math.abs(d.y - p.y) <= J.skybridgeFit
        && rectsIntersect(cap, d.rect, 0.05)));
      const roof = normBuildings.some(b => b.roof?.walkable === true
        && Math.abs(b.roofY - p.y) <= J.skybridgeFit
        && rectsIntersect(cap, b.bounds, 0.05));
      if (!door && !roof) {
        errors.push(`${elabel}: не имеет опоры в плане — ни двери комнаты, ни ходовой кровли на своей отметке `
          + `(допуск ${J.skybridgeFit} м): настил перехода висит в воздухе`);
      }
    }
  }

  // --- уникальность идентификаторов ---
  const ids = new Set();
  const addId = (v, where) => {
    if (ids.has(v)) errors.push(`${where}: id '${v}' уже занят`);
    ids.add(v);
  };
  for (const r of raw.roads ?? []) addId(r.id, 'roads');
  for (const w of raw.waterways ?? []) addId(w.id, 'waterways');
  for (const b of raw.buildings ?? []) {
    addId(b.id, 'buildings');
    for (const r of b.rooms ?? []) addId(r.id, `buildings/${b.id}/rooms`);
    for (const s of b.stairs ?? []) addId(s.id, `buildings/${b.id}/stairs`);
  }
  for (const o of raw.landscapeObjects ?? []) addId(o.id, 'landscapeObjects');
  for (const l of raw.lights ?? []) addId(l.id, 'lights');

  // --- настоящие источники: лимит и опоры моста вне планов дорог ---
  const real = (raw.lights ?? []).filter(l => l.type !== 'directional');
  if (real.length > J.maxRealLights) {
    errors.push(`lights: ${real.length} источников point/spot — максимум ${J.maxRealLights}`
      + ' (каждый умножает свет во все фрагменты сцены)');
  }
  if ((raw.lights ?? []).filter(l => l.type === 'directional').length > 1) {
    errors.push('lights: больше одного directional — второй складывать в sky.sun некуда');
  }
  for (const o of raw.landscapeObjects ?? []) {
    if (o.model !== 'concrete_pillar') continue;
    const rect = rectAround(o.position.x, o.position.z, J.pillarSection, J.pillarSection);
    for (const rr of roadRects) {
      if (rr.ground && rectsIntersect(rect, rr.rect, 0.05)) {
        errors.push(`landscapeObjects (${o.id}): опора стоит в плане наземной дороги ${rr.id} — по улице она преградой не станет, но визуально закопана в асфальт`);
      }
    }
  }

  // --- спавн и точка B внутри земли ---
  for (const [key, pos] of [['gameplay.spawn', raw.gameplay?.spawn], ['gameplay.exit', raw.gameplay?.exit]]) {
    if (!pos) continue;
    if (Math.abs(pos.x) > half || Math.abs(pos.z) > half) {
      errors.push(`${key}: точка ${pos.x}, ${pos.z} вне земли ${raw.ground?.size} м`);
    }
  }

  return { errors, warnings, geometryOnly: true };
}

/** План полосы дороги (для проверки «опора не посреди улицы»). */
function roadRectsOf(road) {
  const out = [];
  const halfW = road.width / 2;
  for (let i = 0; i + 1 < road.points.length; i++) {
    const a = road.points[i], b = road.points[i + 1];
    const horiz = Math.abs(a.x - b.x) >= Math.abs(a.z - b.z);
    // вдоль оси план кончается концом пластины, как его считает нормализатор:
    // наращивать его на полwidth «на случай стыка» значило бы браковать дом,
    // вставший в метре от торца улицы, — генератор как раз обрывает её у его фасада
    const minX = horiz ? Math.min(a.x, b.x) : a.x - halfW;
    const maxX = horiz ? Math.max(a.x, b.x) : a.x + halfW;
    const minZ = horiz ? a.z - halfW : Math.min(a.z, b.z);
    const maxZ = horiz ? a.z + halfW : Math.max(a.z, b.z);
    out.push({ id: road.id, ground: road.type === 'ground', rect: { minX, maxX, minZ, maxZ } });
  }
  return out;
}

/** Прямоугольник, отпущенный во все стороны на `d` — допуск примыкания в плане. */
function grown(rect, d) {
  return { minX: rect.minX - d, maxX: rect.maxX + d, minZ: rect.minZ - d, maxZ: rect.maxZ + d };
}

/** Конец пластины в плане: полоса глубиной `depth` у той границы, к которой ближе точка. */
function endCap(rect, p, depth) {
  const alongX = rect.maxX - rect.minX >= rect.maxZ - rect.minZ;
  const lo = alongX ? p.x : p.z, min = alongX ? rect.minX : rect.minZ, max = alongX ? rect.maxX : rect.maxZ;
  const d = Math.min(depth, max - min);
  const [a0, a1] = Math.abs(lo - min) <= Math.abs(lo - max) ? [min, min + d] : [max - d, max];
  return alongX
    ? { minX: r3(a0), maxX: r3(a1), minZ: rect.minZ, maxZ: rect.maxZ }
    : { minX: rect.minX, maxX: rect.maxX, minZ: r3(a0), maxZ: r3(a1) };
}

/** Расстояние от точки до отрезка в плане (отрезок — по оси). */
function distToEdge(e, x, z) {
  const lo = e.axis === 'x' ? Math.min(e.x0, e.x1) : Math.min(e.z0, e.z1);
  const hi = e.axis === 'x' ? Math.max(e.x0, e.x1) : Math.max(e.z0, e.z1);
  const t = e.axis === 'x' ? x : z;
  const cross = e.axis === 'x' ? z : x;
  const fixed = e.axis === 'x' ? e.z0 : e.x0;
  return Math.hypot(Math.max(lo - t, 0, t - hi), Math.abs(cross - fixed));
}

/** Прямоугольник заданного размера вокруг точки (длина — по X, ширина — по Z). */
function rectAround(cx, cz, length, width) {
  return {
    minX: r3(cx - length / 2), maxX: r3(cx + length / 2),
    minZ: r3(cz - width / 2), maxZ: r3(cz + width / 2),
  };
}

/** Габарит полигона как rect. */
function boundsOf(poly) {
  const b = polyBounds(poly);
  return { minX: r3(b.minX), maxX: r3(b.maxX), minZ: r3(b.minZ), maxZ: r3(b.maxZ) };
}

/** Прямоугольник в текст ошибки — чтобы по координатам было видно, где именно. */
const fmtRect = r => `[${r3(r.minX)}…${r3(r.maxX)} × ${r3(r.minZ)}…${r3(r.maxZ)}]`;

export { ROOM_TYPES, ROAD_TYPES, STAIR_TYPES, LIGHT_TYPES, LINK_TYPES, cellKey };
