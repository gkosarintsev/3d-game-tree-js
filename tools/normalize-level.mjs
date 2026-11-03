/**
 * Нормализатор уровня: сырой JSON топологии (его пишет LLM) → данные, из которых
 * клиент строит карту без собственной геодезии. План — docs/json-pipeline-plan.md.
 *
 * Здесь считается всё, что должно быть посчитано один раз и одинаково всегда:
 * замкнутые полигоны против часовой стрелки, союз прямоугольников из footprint,
 * абсолютные высоты этажей, проступи лестниц (подъём ступени никогда не больше
 * CONFIG.building.stepUp — иначе ни ноги, ни сфера Чужого её не перешагнут) и их
 * проёмы в перекрытиях, настилы дорог со ступенчатыми уклонами, автогенерированные
 * опоры эстакады и фонари вдоль дорог, проёмы дверей, отметка опоры под каждым
 * предметом.
 *
 * ГПСЧ не используется: одинаковый вход даёт побайтово одинаковый выход.
 */
import { CONFIG } from '../src/config.js';
import {
  normalizePolygon, pointInPoly, polyBounds, polyEdges, polyRects, r3, rectsIntersect,
  subtractRect, unionBounds, frameOf, frameAt, obbHitsRect, obbHitsObb, obbOf, unrotatePoint, rotatePoint,
  arcBounds, arcDelta,
} from '../src/geo2d.js';

const J = CONFIG.jsonMap;
const DEG = Math.PI / 180;
const ROTATIONS = [0, 90, 180, 270];

/**
 * @param {object} raw уровень, прошедший validateLevel
 * @returns {{name:string, hint:string, sky:object, gameplay:object, map:object, warnings:string[]}}
 */
export function normalizeLevel(raw) {
  // секцию `city` обязан развернуть вызывающий (tools/build-level.mjs зовёт
  // expandCity): нормализатор ГПСЧ не знает, и молча пройдя мимо живой секции,
  // он выдал бы главу без единого генераторного дома
  if (raw.city) throw new Error('normalizeLevel: секция city не развёрнута — вызовите expandCity');
  const warnings = [];
  const ground = {
    y: r3(raw.ground?.y ?? 0),
    size: r3(raw.ground?.size ?? 176),
    color: raw.ground?.color ?? J.asphalt,
  };

  const buildings = (raw.buildings ?? []).map(b => normalizeBuilding(b, ground, warnings));
  const roads = (raw.roads ?? []).map(r => normalizeRoad(r, ground));
  const channels = (raw.waterways ?? []).map(w => normalizeWaterway(w, ground));

  // препятствия для автогенерации: план наземных улиц, габариты зданий и планы
  // береговых стенок со сходами — опора или фонарь, выросшие посреди асфальта,
  // в стенке или сквозь пандус, не объект уровня
  const obstacles = [
    ...roads.filter(r => r.type === 'ground').flatMap(r => r.decks.map(d => ({ id: r.id, kind: 'road', rect: d }))),
    ...buildings.map(b => ({ id: b.id, kind: 'building', rect: buildingBox(b) })),
    ...channels.flatMap(c => [
      ...c.walls.map(w => ({ id: `${c.id}:берег`, kind: 'waterway', rect: w.rect })),
      ...c.descents.filter(d => d.kind === 'ramp')
        .map(d => ({ id: `${c.id}:сход`, kind: 'waterway', rect: d.plan })),
    ]),
  ];
  const water = waterwayFoot(channels);
  for (const road of roads) {
    // перехода не держат колонны: их держат здания, а опора с земли до настила
    // на 27 м проткнула бы кровли и дворы, под которыми переход идёт
    if (road.type !== 'skybridge') road.pillars.push(...bridgePillars(road, ground, obstacles, warnings, water));
    if (road.withLamps) road.lamps.push(...roadLamps(road, obstacles, warnings, water));
  }

  const support = makeSupport(ground, roads, buildings, water);
  const props = [
    ...(raw.landscapeObjects ?? []).map(o => authoredProp(o, support, obstacles, warnings)),
    ...roads.flatMap(r => r.pillars),
    ...roads.flatMap(r => r.lamps),
  ].filter(Boolean).sort(byId);

  // directional-свет главы становится «солнцем» неба: второй directional сцене не нужен
  const dir = (raw.lights ?? []).find(l => l.type === 'directional');
  const lights = (raw.lights ?? []).filter(l => l.type !== 'directional').map(l => ({
    id: l.id,
    type: l.type,
    position: { x: r3(l.position.x), y: r3(l.position.y), z: r3(l.position.z) },
    // у точечного источника направления нет; у прожектора без цели луч смотрит
    // вдоль −Y, поэтому цель держат данные главы
    target: l.target
      ? { x: r3(l.target.x), y: r3(l.target.y), z: r3(l.target.z) }
      : undefined,
    color: l.color ?? 0xffcf9a,
    intensity: l.intensity ?? CONFIG.night.intensity,
    distance: r3(l.distance ?? CONFIG.night.reach),
    angle: l.angle ?? 0.7,
  })).sort(byId);

  const sky = { ...(raw.sky ?? {}) };
  if (dir) {
    sky.sun = {
      color: dir.color ?? 0xbcd0ff,
      intensity: dir.intensity ?? 0.5,
      position: [r3(dir.position.x), r3(dir.position.y), r3(dir.position.z)],
    };
  }

  const gp = raw.gameplay ?? {};
  checkPoints(gp, buildings, roads, channels, warnings);

  return {
    name: raw.metadata.name,
    hint: raw.metadata.hint,
    sky,
    gameplay: {
      goal: 'exit',
      exit: { x: r3(gp.exit.x), z: r3(gp.exit.z) },
      exitRadius: gp.exitRadius ?? CONFIG.terrain.exitRadius,
      enemies: gp.enemies ?? {},
      alienEnemies: gp.alienEnemies ?? {},
    },
    map: {
      kind: raw.kind ?? 'json',
      units: 'meters',
      ground,
      bounds: worldBounds(buildings, roads, channels, ground),
      // точка A живёт в карте: движок передаёт createMap только map-секцию, а
      // spawn нужен карте, чтобы найти опору под ногами до построения графа
      spawn: { x: r3(gp.spawn.x), z: r3(gp.spawn.z) },
      buildings,
      roads,
      // секция появляется только если русла заданы: глава 9 без воды обязана
      // остаться побайтово той же
      ...(channels.length ? { channels } : {}),
      props,
      lights,
      // переопределение ритма окон (src/json-map.js `_windowItems`): числа едут в
      // модуль как есть, потому что позиции считает карта, а не парсер, — список
      // из 34 тыс. квадов удвоил бы файл главы
      ...(raw.windows ? { windows: raw.windows } : {}),
      // тот же порядок у мусора кровель и тротуаров и у неона фасадов
      ...(raw.clutter ? { clutter: raw.clutter } : {}),
      ...(raw.signage ? { signage: raw.signage } : {}),
    },
    warnings,
  };
}

const byId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

// ------------------------------------------------------------------- здания

/**
 * Здание: footprint → союз прямоугольников и сегменты стен, комнаты → полы и
 * перегородки, лестницы → проступи и проёмы, connections → проёмы дверей.
 *
 * Стены центруются на линии ребра: фасад и наружное ребро комнаты, стоящей
 * вплотную к фасаду, дают один и тот же прямоугольник, поэтому дубль отпадает
 * ключом, а не сравнением с допуском.
 */
function normalizeBuilding(b, ground, warnings) {
  const errors = [];
  const footprint = normalizePolygon(b.footprint, `${b.id}.footprint`, errors);
  if (errors.length) throw new Error(errors.join('\n'));
  const bb = polyBounds(footprint);
  const baseY = r3(b.baseY ?? ground.y);
  const floorHeight = r3(b.floorHeight);

  const walls = new Map();
  const putWall = (edge, facade) => {
    const r = edgeRect(edge, J.wallThickness);
    const key = `${r.axis}|${r.minX}|${r.maxX}|${r.minZ}|${r.maxZ}`;
    const prev = walls.get(key);
    walls.set(key, prev ? { ...prev, facade: prev.facade || facade } : { ...r, facade });
  };
  for (const edge of polyEdges(footprint)) putWall(edge, true);

  const rooms = b.rooms.map(room => {
    const rp = normalizePolygon(room.polygon, `${b.id}.${room.id}.polygon`, errors);
    if (errors.length) throw new Error(errors.join('\n'));
    for (const edge of polyEdges(rp)) putWall(edge, false);
    return {
      id: room.id,
      type: room.type,
      floor: room.floor,
      rect: planOf(rp),
      y: r3(baseY + room.floor * floorHeight),
    };
  }).sort(byId);

  const stairs = (b.stairs ?? []).map(s => normalizeStair(s, baseY, floorHeight, b.id, errors)).sort(byId);
  if (errors.length) throw new Error(errors.join('\n'));

  const doors = [];
  // Точки портала живут в мире, а план проёма — в осях дома: движок ставит
  // наружный узел двери на улицу (мировой граф) и режет им стену (локальный
  // прямоугольник). Кадр считается по тем же округлённым `bounds` и `rotation`,
  // что уезжают в модуль, — карта восстанавливает его из них же и обязана
  // получить тот же центр поворота до миллиметра, иначе порог разъедётся с фасадом.
  const boundsOut = { minX: r3(bb.minX), maxX: r3(bb.maxX), minZ: r3(bb.minZ), maxZ: r3(bb.maxZ) };
  const doorFrame = frameOf(boundsOut, r3(b.rotation ?? 0));
  const worldPt = p => {
    if (!doorFrame) return p;
    const w = rotatePoint(doorFrame, p.x, p.z);
    return { x: r3(w.x), z: r3(w.z) };
  };
  for (const raw of b.rooms) {
    const room = rooms.find(r => r.id === raw.id);
    if (!raw.connections?.length) continue;
    const rp = normalizePolygon(raw.polygon, `${b.id}.${room.id}.polygon`, errors);
    for (const c of raw.connections) {
      const edge = nearestEdge(polyEdges(rp), c.portalPosition.x, c.portalPosition.z);
      const span = edge.axis === 'x' ? [edge.x0, edge.x1] : [edge.z0, edge.z1];
      const fixed = edge.axis === 'x' ? edge.z0 : edge.x0;
      const along = edge.axis === 'x' ? c.portalPosition.x : c.portalPosition.z;
      const center = clamp(r3(along), Math.min(...span) + J.doorWidth / 2, Math.max(...span) - J.doorWidth / 2);
      const rect = edge.axis === 'x'
        ? { minX: r3(center - J.doorWidth / 2), maxX: r3(center + J.doorWidth / 2), minZ: r3(fixed - J.wallThickness / 2 - 0.01), maxZ: r3(fixed + J.wallThickness / 2 + 0.01) }
        : { minX: r3(fixed - J.wallThickness / 2 - 0.01), maxX: r3(fixed + J.wallThickness / 2 + 0.01), minZ: r3(center - J.doorWidth / 2), maxZ: r3(center + J.doorWidth / 2) };
      const mid = { x: r3((rect.minX + rect.maxX) / 2), z: r3((rect.minZ + rect.maxZ) / 2) };
      // «наружу» считается от полигона комнаты, а не здания: для двери в фасаде
      // это одно и то же, а для внутренней перегородки — выход в соседнюю комнату
      const out = outward(rp, mid);
      doors.push({
        id: `${room.id}→${c.target}`,
        room: room.id,
        target: c.target,
        linkType: c.linkType ?? 'door',
        axis: edge.axis,
        y: room.y,
        height: r3(Math.min(J.doorHeight, floorHeight - J.slabThickness - 0.1)),
        rect,
        inside: worldPt({ x: mid.x - out.x * 1.4, z: mid.z - out.z * 1.4 }),
        outside: worldPt({ x: mid.x + out.x * 1.4, z: mid.z + out.z * 1.4 }),
      });
    }
  }

  return {
    id: b.id,
    name: b.name ?? b.id,
    isEnterable: b.isEnterable !== false,
    baseY,
    floorHeight,
    floorsCount: b.floorsCount,
    roofY: r3(baseY + b.floorsCount * floorHeight),
    facadeMaterial: b.facadeMaterial ?? 'concrete',
    // секция `roof` появляется только у дома, где она задана в брифе: глава 9
    // без неё обязана нормализоваться побайтово как раньше (плиты кровли тогда
    // не опоры, а просто солиды)
    ...(b.roof ? {
      roof: {
        walkable: b.roof.walkable === true,
        // парапет по умолчанию держит идущего в полуметре от края; нулевой —
        // кровля без ограждения (и тогда сход с края не бракуется ничем)
        parapet: r3(b.roof.parapet ?? (b.roof.walkable === true ? J.parapetHeight : 0)),
      },
    } : {}),
    footprint: footprint.map(p => ({ x: r3(p.x), z: r3(p.z) })),
    bounds: { minX: r3(bb.minX), maxX: r3(bb.maxX), minZ: r3(bb.minZ), maxZ: r3(bb.maxZ) },
    // поворот дома в плане — единственное, что уезжает в модуль из v2: всё
    // остальное (footprint, стены, комнаты, марши, двери) остаётся в локальных
    // осях, поэтому союз прямоугольников, проёмы и решётки полов считаются
    // прежней арифметикой, а в мир ставятся одним углом вокруг центра габарита.
    // Ключ появляется только у повёрнутого дома — главы 9 и 10 обязаны
    // нормализоваться побайтово как раньше
    ...(b.rotation ? { rotation: r3(b.rotation) } : {}),
    rects: polyRects(footprint).map(r => rectOut(r)).sort(byRect),
    walls: [...walls.values()].sort((a, c) => keyOfRect(a) < keyOfRect(c) ? -1 : 1),
    rooms,
    stairs,
    doors: doors.sort(byId),
  };
}

const keyOfRect = r => `${r.minX}|${r.maxX}|${r.minZ}|${r.maxZ}`;
const byRect = (a, b) => (keyOfRect(a) < keyOfRect(b) ? -1 : 1);
const rectOut = r => ({ minX: r3(r.minX), maxX: r3(r.maxX), minZ: r3(r.minZ), maxZ: r3(r.maxZ) });

/**
 * Дом в мировом плане: OBB, если у него есть `rotation` (v2), и тот же
 * прямоугольник, что и раньше, при угле 0. Автогенерация (опоры, фонари,
 * отметки опоры под предметом) ставит вещи в мир, поэтому обязана видеть
 * повёрнутый корпус повёрнутым: габарит косого дома торчит за его фасады
 * углами, и фонарь, пропущенный из-за такого охвата, был бы молчаливой дырой
 * в освещении улицы.
 */
const buildingBox = b => obbOf(b.bounds, frameOf(b.bounds, b.rotation ?? 0));

/** Точка в плане дома — тот же OBB, что и выше, а не его охватывающий rect. */
const inBox = (x, z, box) => obbHitsRect(box,
  { minX: x - 1e-6, maxX: x + 1e-6, minZ: z - 1e-6, maxZ: z + 1e-6 }, -1e-6);

/** Ребро полигона → план стены толщиной thickness, центрованный на ребре. */
function edgeRect(edge, thickness) {
  const half = thickness / 2;
  if (edge.axis === 'x') {
    return {
      axis: 'x',
      minX: r3(Math.min(edge.x0, edge.x1)), maxX: r3(Math.max(edge.x0, edge.x1)),
      minZ: r3(edge.z0 - half), maxZ: r3(edge.z0 + half),
    };
  }
  return {
    axis: 'z',
    minX: r3(edge.x0 - half), maxX: r3(edge.x0 + half),
    minZ: r3(Math.min(edge.z0, edge.z1)), maxZ: r3(Math.max(edge.z0, edge.z1)),
  };
}

function planOf(poly) {
  const b = polyBounds(poly);
  return { minX: r3(b.minX), maxX: r3(b.maxX), minZ: r3(b.minZ), maxZ: r3(b.maxZ) };
}

/** Наружу от полигона — проба в 1,2 м по четырём осям: где вне полигона, туда и наружу. */
function outward(poly, p) {
  const probes = [{ x: 1, z: 0 }, { x: -1, z: 0 }, { x: 0, z: 1 }, { x: 0, z: -1 }];
  let fallback = probes[0];
  for (const d of probes) {
    const out = !pointInPoly(poly, p.x + d.x * 1.2, p.z + d.z * 1.2);
    if (!out) continue;
    if (pointInPoly(poly, p.x - d.x * 1.2, p.z - d.z * 1.2)) return d;
    fallback = fallback ?? d;
  }
  return fallback;
}

function nearestEdge(edges, x, z) {
  let best = null, bestD = Infinity;
  for (const e of edges) {
    const d = edgeDistance(e, x, z);
    if (d < bestD - 1e-9) { bestD = d; best = e; }
  }
  return best;
}

function edgeDistance(e, x, z) {
  if (e.axis === 'x') {
    const min = Math.min(e.x0, e.x1), max = Math.max(e.x0, e.x1);
    return Math.hypot(Math.max(min - x, 0, x - max), Math.abs(z - e.z0));
  }
  const min = Math.min(e.z0, e.z1), max = Math.max(e.z0, e.z1);
  return Math.hypot(Math.abs(x - e.x0), Math.max(min - z, 0, z - max));
}

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

/**
 * Лестница → проступи в мировых координатах + проём. Марш считается в локальной
 * системе (X — направление подъёма, низ при X = 0, Y вверх, вправо — Z), затем
 * поворачивается на rotation и переносится в position: косых маршей схема не
 * делает, поэтому поворот кратен 90° и AABB повёрнутого прямоугольника точен.
 *
 * `connectsFloors [k0, k1]` с `k1 === floorsCount` — марш, выведенный на кровлю:
 * его верхняя отметка ровно `roofY`, а проём в плите кровли режет клиент (там же,
 * где он режет проём в перекрытии этажа).
 */
function normalizeStair(s, baseY, floorHeight, buildingId, errors) {
  const [k0, k1] = s.connectsFloors;
  const y0 = r3(baseY + k0 * floorHeight);
  const y1 = r3(baseY + k1 * floorHeight);
  const height = r3(y1 - y0);
  const rotation = s.rotation ?? 0;
  if (!ROTATIONS.includes(rotation)) {
    errors.push(`${buildingId}.${s.id}: rotation ${rotation}° — допустимы только 0/90/180/270 (косой марш дал бы ступенчатую коллизию)`);
  }
  // у вертикального марша план — шахта постоянного сечения: width/length в брифе
  // не нужны, их берёт J.ladderShaft (схема это разрешает, и только для ladder)
  const dims = s.dimensions ?? { width: J.ladderShaft, length: J.ladderShaft };
  const L = r3(Math.max(dims.width, dims.length));
  const W = r3(Math.min(dims.width, dims.length));
  const cx = r3(s.position.x), cz = r3(s.position.z);
  const world = rect => toWorld(rect, rotation, cx, cz, L, W);

  const steps = s.type === 'spiral'
    ? spiralSteps(cx, cz, Math.min(L, W) / 2, y0, height, rotation)
    : stairSteps(s.type, L, W, y0, height, world);

  const first = steps[0], last = steps[steps.length - 1];
  return {
    id: s.id,
    type: s.type,
    connectsFloors: [k0, k1],
    y0, y1, height,
    rotation,
    rect: world({ minX: 0, maxX: L, minZ: 0, maxZ: W }),
    steps,
    bottom: { x: r3((first.minX + first.maxX) / 2), z: r3((first.minZ + first.maxZ) / 2), y: first.top },
    top: { x: r3((last.minX + last.maxX) / 2), z: r3((last.minZ + last.maxZ) / 2), y: last.top },
  };
}

/**
 * Раскладка марша в локальных координатах (X — направление подъёма, низ при
 * X = 0). Прямой — один прогон по всей длине. Г-образный: прогон по X до
 * изгиба, плоская площадка на уровне последнего шага, прогон по Z от ближней
 * полосы ширины к дальней. Подъём одной проступи никогда не больше J.maxRise,
 * иначе ни ноги, ни сфера Чужого её не перешагнут.
 *
 * Вертикальный марш (`full`) устроен иначе: план проступи не делит длину шахты,
 * а покрывает её целиком — подъём держит не горизонтальный шаг, а отметка
 * пластины, поэтому `stairSteps` по `full` кладёт все проступи в один план.
 */
function stairLayout(type, L, W, height) {
  if (type === 'ladder') {
    const n = Math.max(2, Math.ceil(height / J.maxRise));
    return [{ axis: 'x', a0: 0, a1: L, c0: 0, c1: W, count: n, yFrom: 0, risePer: height / n, full: true }];
  }
  if (type !== 'l_shape') {
    const n = Math.max(2, Math.ceil(height / J.maxRise));
    const rise = height / n;
    return [{ axis: 'x', a0: 0, a1: L, c0: 0, c1: W, count: n, yFrom: 0, risePer: rise }];
  }
  const n = Math.max(4, Math.ceil(height / J.maxRise));
  const rise = height / n;
  const nA = Math.ceil(n / 2), nB = n - nA;
  const bendX = r3(L * 0.6), midZ = r3(W / 2);
  return [
    { axis: 'x', a0: 0, a1: bendX, c0: 0, c1: midZ, count: nA, yFrom: 0, risePer: rise },
    { axis: 'x', a0: bendX, a1: L, c0: 0, c1: midZ, count: 1, yFrom: rise * nA, risePer: 0 },
    { axis: 'z', a0: midZ, a1: W, c0: bendX, c1: L, count: nB, yFrom: rise * nA, risePer: rise },
  ];
}

/** Проступи марша: локальные прямоугольники снизу вверх → мировые AABB с отметкой верха. */
function stairSteps(type, L, W, y0, height, world) {
  const out = [];
  for (const run of stairLayout(type, L, W, height)) {
    for (let i = 1; i <= run.count; i++) {
      // у вертикального марша все проступи лежат в одном плане шахты: их различает
      // только отметка верха, а низ каждой — на своей толщине (клиент)
      const [lo, hi] = run.full
        ? [Math.min(run.a0, run.a1), Math.max(run.a0, run.a1)]
        : [run.a0 + (run.a1 - run.a0) * ((i - 1) / run.count), run.a0 + (run.a1 - run.a0) * (i / run.count)];
      const [from, to] = [Math.min(lo, hi), Math.max(lo, hi)];
      const local = run.axis === 'x'
        ? { minX: from, maxX: to, minZ: run.c0, maxZ: run.c1 }
        : { minX: run.c0, maxX: run.c1, minZ: from, maxZ: to };
      out.push({ ...rectOut(world(local)), top: r3(y0 + run.yFrom + run.risePer * i) });
    }
  }
  return out;
}

/**
 * Проступи винта: AABB секторов круга. Поворот задаёт начальный угол, поэтому
 * лестница вписана в rect здания; радиус — половина меньшей стороны пролёта.
 */
function spiralSteps(cx, cz, radius, y0, height, rotation) {
  const n = Math.max(
    Math.ceil(height / J.maxRise),
    Math.ceil((2 * Math.PI) / J.spiralAngle),
  );
  const rise = height / n, dphi = (2 * Math.PI) / n;
  const inner = radius * 0.2;
  const phi0 = (rotation * Math.PI) / 180;
  const out = [];
  for (let i = 1; i <= n; i++) {
    const a0 = phi0 + (i - 1) * dphi, a1 = phi0 + i * dphi;
    const pts = [];
    for (const phi of [a0, a1]) {
      pts.push([cx + Math.cos(phi) * radius, cz + Math.sin(phi) * radius]);
      pts.push([cx + Math.cos(phi) * inner, cz + Math.sin(phi) * inner]);
    }
    const xs = pts.map(p => p[0]), zs = pts.map(p => p[1]);
    out.push({
      minX: r3(Math.min(...xs)), maxX: r3(Math.max(...xs)),
      minZ: r3(Math.min(...zs)), maxZ: r3(Math.max(...zs)),
      top: r3(y0 + rise * i),
    });
  }
  return out.filter(s => s.top - y0 > 0.02);
}

/**
 * Локальный прямоугольник марша → мировой при повороте на rotation и переносе
 * в центр position. Формулы — поворот вокруг центра локального box L×W.
 */
function toWorld(rect, rotation, cx, cz, L, W) {
  switch (rotation) {
    case 90: return {
      minX: cx + W / 2 - rect.maxZ, maxX: cx + W / 2 - rect.minZ,
      minZ: cz - L / 2 + rect.minX, maxZ: cz - L / 2 + rect.maxX,
    };
    case 180: return {
      minX: cx + L / 2 - rect.maxX, maxX: cx + L / 2 - rect.minX,
      minZ: cz + W / 2 - rect.maxZ, maxZ: cz + W / 2 - rect.minZ,
    };
    case 270: return {
      minX: cx - W / 2 + rect.minZ, maxX: cx - W / 2 + rect.maxZ,
      minZ: cz + L / 2 - rect.maxX, maxZ: cz + L / 2 - rect.minX,
    };
    default: return {
      minX: cx - L / 2 + rect.minX, maxX: cx - L / 2 + rect.maxX,
      minZ: cz - W / 2 + rect.minZ, maxZ: cz - W / 2 + rect.maxZ,
    };
  }
}

// ------------------------------------------------------------------- дороги

/**
 * Дорога → пластины настила. Плоский пролёт — одна пластина с верхом `topY`.
 * Пролёт с подъёмом — ОДНА наклонная пластина (`ramp: true`, верх идёт от
 * `topAtMin` до `topAtMax` вдоль оси): картинка гладкая, как склон горы в главе 1,
 * и твёрдость обязана совпасть с ней, поэтому перепад не разбивают на коробки
 * ступеней — наклонный пролёт держит аналитическая призма (`JsonMap.prisms`).
 * Крутизну ограничивает схема: `|rise| / run ≤ J.maxSlope`, иначе ни ноги, ни
 * сфера Чужого такой подъём не перешагнут.
 */
function normalizeRoad(road, ground) {
  if (road.elements) return normalizeRoadElements(road);
  const halfW = road.width / 2;
  const decks = [];
  for (let i = 0; i + 1 < road.points.length; i++) {
    const a = road.points[i], b = road.points[i + 1];
    const axis = Math.abs(a.x - b.x) >= Math.abs(a.z - b.z) ? 'x' : 'z';
    const aAlong = axis === 'x' ? a.x : a.z;
    const bAlong = axis === 'x' ? b.x : b.z;
    const along0 = Math.min(aAlong, bAlong), along1 = Math.max(aAlong, bAlong);
    // отметки верха на ближней и дальней по оси границах плана
    const topLo = aAlong <= bAlong ? a.y : b.y;
    const topHi = aAlong <= bAlong ? b.y : a.y;
    const cross = axis === 'x' ? a.z : a.x;
    // низ пролёта, а не его верх: на нижней отметке пластина сходится с соседней
    // (или с землёй). Взять верх — первая пластина ramps встала бы на 0,525 м
    // выше асфальта (7,88/15 при stepUp 0,6), и вход на эстакаду, и сход с неё
    // перестали бы быть перешагиваемыми
    const top = r3(Math.min(topLo, topHi));
    const plan = axis === 'x'
      ? { minX: along0, maxX: along1, minZ: cross - halfW, maxZ: cross + halfW }
      : { minX: cross - halfW, maxX: cross + halfW, minZ: along0, maxZ: along1 };
    decks.push({
      ...rectOut(plan), axis,
      topY: top,
      bottomY: r3(top - J.deckThickness),
      topAtMin: r3(topLo),
      topAtMax: r3(topHi),
      ramp: Math.abs(topHi - topLo) > 0.01,
    });
  }

  const fill = [], aprons = [];
  if (road.type === 'embankment') {
    for (const d of decks) {
      if (d.ramp || d.bottomY - ground.y <= 0.05) continue;
      // пластина стоит на грунте: опоры ей не нужны, они ушли бы в тело насыпи
      d.grounded = true;
      fill.push({ ...rectOut(d), topY: d.bottomY, bottomY: ground.y });
      // откос поднимается до ВЕРХА настила, а не до его подошвы: иначе с полотна
      // на склон и обратно приходится делать шаг ровно на толщину плиты (0,6 м при
      // stepUp 0,6), и на границе плана опоры нет ни там, ни там — сошедший
      // проваливается в грунт насыпи и застревает в её блокере
      const run = r3(J.apronRun * (d.topY - ground.y));
      if (d.axis === 'x') {
        aprons.push({ axis: 'x', minX: d.minX, maxX: d.maxX, cross: d.minZ, dir: -1, run, topY: d.topY, groundY: ground.y });
        aprons.push({ axis: 'x', minX: d.minX, maxX: d.maxX, cross: d.maxZ, dir: 1, run, topY: d.topY, groundY: ground.y });
      } else {
        aprons.push({ axis: 'z', minZ: d.minZ, maxZ: d.maxZ, cross: d.minX, dir: -1, run, topY: d.topY, groundY: ground.y });
        aprons.push({ axis: 'z', minZ: d.minZ, maxZ: d.maxZ, cross: d.maxX, dir: 1, run, topY: d.topY, groundY: ground.y });
      }
    }
  }

  return {
    id: road.id,
    type: road.type,
    width: r3(road.width),
    withLamps: !!road.lamps,
    decks,
    fill,
    aprons,
    pillars: [],
    lamps: [],
  };
}

/**
 * Дуга полотна (v2): кольцевой сектор с продольным уклоном и поперечным креном.
 *
 * Углы остаются в **градусах** — в тех же единицах, что `yaw` пластины: поворот
 * с округлением до 1/1000 рад сдвинул бы конец дуги на 4 см при R = 40 м, а
 * авторские градусы переживают запись в модуль без потерь. Косинусы углов никто
 * не хранит: их считает потребитель по той же паре чисел.
 *
 * `topAtMin/topAtMax` — крайние отметки **верхней** поверхности с учётом крена:
 * внешний край выше среднего на `tan(bank) · halfW`, и валидатор обязан видеть
 * именно его, иначе мост над рекой проходил бы проверку по заниженной отметке.
 * Сам верх над точкой считает `deckTopAt` по углу и радиусу.
 */
function normalizeArc(a) {
  const span = a.to - a.from;
  const halfW = a.width / 2;
  const y0 = r3(a.y[0]), y1 = r3(a.y[1]);
  const tanBank = r3(Math.tan((a.bank ?? 0) * DEG));
  const bank = Math.abs(tanBank) * halfW;
  const lo = Math.min(y0, y1), hi = Math.max(y0, y1);
  return {
    ...rectOut(arcBounds(a.cx, a.cz, a.radius, halfW, a.from * DEG, a.to * DEG)),
    arc: true,
    cx: r3(a.cx), cz: r3(a.cz),
    R: r3(a.radius), halfW: r3(halfW),
    a0: a.from, a1: a.to, span,
    y0, y1, tanBank,
    width: r3(a.width),
    topY: r3(lo - bank),
    bottomY: r3(lo - bank - J.deckThickness),
    topAtMin: r3(lo - bank),
    topAtMax: r3(hi + bank),
    ramp: Math.abs(y1 - y0) > 0.01,
    rails: !!a.rails,
  };
}

/**
 * Верх дуги в точке её сектора — та же формула, что отдаёт движок (`topAt`).
 * Опоры и фонари стоят на краю полотна, где крен добавляет к отметке оси
 * `tanBank · отступ`; брать `topY` (минимум по всему сектору) значило бы утопить
 * их в настиле на внешнем краю и подвесить на внутреннем.
 */
function arcTopAt(d, ang, rho) {
  return d.y0 + (d.y1 - d.y0) * (ang - d.a0 * DEG) / (d.span * DEG) + d.tanBank * (rho - d.R);
}

/** Угол в (−180, 180]: производная касательная не обязана попадать в тот же круг. */
const wrapDeg = d => {
  const w = ((d + 180) % 360 + 360) % 360 - 180;
  return Math.abs(w) < 1e-9 ? 0 : w;
};

/**
 * Касательная в конце элемента — угол оси, которую обязан принять следующий
 * элемент после `connect: 'tangent'`. У пластины это её собственный `yaw`
 * (локальная +X идёт вдоль полотна), у дуги — радиус, повёрнутый на 90° в
 * сторону обхода: при развёртке назад касательная смотрит противоположно.
 */
export function endTangentDeg(el) {
  if (!el.arc) return wrapDeg(el.plate.yaw ?? 0);
  const sign = Math.sign(el.arc.to - el.arc.from) || 1;
  return wrapDeg(el.arc.to + sign * 90);
}

/**
 * Разворот маркеров `connect: 'tangent'`: маркер угла не несёт, он велит
 * следующей пластине принять касательную предыдущего элемента. Позицию
 * следующей пластины автор задаёт сам — парсер доводит только угол (G1 по
 * направлению), а не переносит центр: у маркера нет координат, и выдумывать их
 * значило бы строить геометрию из ничего.
 *
 * `i` в результате — адрес в брифе: маркеры из списка выброшены, и без него
 * сообщение валидатора указывало бы на соседнюю строку.
 *
 * @param {object[]} elements сырые элементы полотна
 * @returns {{el:object, i:number}[]}
 */
export function resolveRoadElements(elements) {
  const out = [];
  let prev = null;
  let pending = false;
  for (const [i, el] of elements.entries()) {
    if (el.connect !== undefined) {
      if (el.plate || el.arc) throw new Error(`elements[${i}]: connect и элемент одновременно — маркер только велит, а форму задаёт сосед`);
      if (pending) throw new Error(`elements[${i}]: connect:'tangent' дважды подряд`);
      if (!prev) throw new Error(`elements[${i}]: connect:'tangent' первым — примыкать не к чему`);
      pending = true;
      continue;
    }
    if (pending && el.arc) {
      throw new Error(`elements[${i}]: connect:'tangent' перед дугой — у дуги углы заданы центром и развёрткой`);
    }
    let resolved = el;
    if (pending) {
      if (el.plate.yaw !== undefined) {
        throw new Error(`elements[${i}].plate: yaw и connect:'tangent' одновременно — угол даёт касательная`);
      }
      resolved = { ...el, plate: { ...el.plate, yaw: endTangentDeg(prev) } };
    }
    out.push({ el: resolved, i });
    prev = el;
    pending = false;
  }
  if (pending) throw new Error(`elements[${elements.length - 1}]: connect:'tangent' в конце — примыкающего элемента нет`);
  return out;
}

/**
 * Дорога из прямых пластин и дуг (v2): полотно под углом к северу, а значит и
 * твёрдость, и меш живут в собственных осях элемента.
 *
 * Пластина задана центром, длиной и шириной; `y` — верх на её начале (локальное
 * `u = -length/2`), `rise` — перепад до конца. Отметки верха пишутся теми же
 * `topAtMin/topAtMax`, что у осевой пластины v1, поэтому наклон по-прежнему
 * держит одна аналитическая призма, а не лестница коробок. Мировой габарит и
 * `obb` — только для сеток-индексов и миникарты; решение о высоте и твёрдости
 * принимает узкая фаза по осям полотна.
 */
function normalizeRoadElements(road) {
  const decks = [];
  for (const { el } of resolveRoadElements(road.elements)) {
    if (el.arc) {
      decks.push(normalizeArc(el.arc));
      continue;
    }
    const pl = el.plate;
    const halfL = pl.length / 2, halfW = pl.width / 2;
    // кадр поворачивает вокруг центра пластины; при yaw 0 его нет вовсе, и
    // пластина идёт прежним быстрым путём AABB. План в её осях — тот же
    // прямоугольник, что и до поворота (центр `(x, z)`), потому что кадр, как и у
    // домов, принимает мировые до поворота координаты
    const frame = frameAt(pl.x, pl.z, pl.yaw ?? 0);
    const local = {
      minX: pl.x - halfL, maxX: pl.x + halfL, minZ: pl.z - halfW, maxZ: pl.z + halfW,
    };
    const topLo = r3(pl.y), topHi = r3(pl.y + (pl.rise ?? 0));
    const top = Math.min(topLo, topHi);
    const world = frame ? obbOf(local, frame) : {
      minX: pl.x - halfL, maxX: pl.x + halfL, minZ: pl.z - halfW, maxZ: pl.z + halfW,
    };
    decks.push({
      ...rectOut(world),
      ...(world.obb ? {
        obb: {
          cx: r3(world.obb.cx), cz: r3(world.obb.cz),
          hx: r3(world.obb.hx), hz: r3(world.obb.hz), c: world.obb.c, s: world.obb.s,
        },
      } : {}),
      ...(frame ? { cx: r3(frame.cx), cz: r3(frame.cz), yaw: pl.yaw } : {}),
      length: r3(pl.length), width: r3(pl.width),
      axis: 'x',
      topY: top,
      bottomY: r3(top - J.deckThickness),
      topAtMin: topLo,
      topAtMax: topHi,
      ramp: Math.abs(topHi - topLo) > 0.01,
    });
  }
  const width = road.width ?? Math.max(...decks.map(d => d.width));
  return {
    id: road.id,
    type: road.type,
    width: r3(width),
    withLamps: !!road.lamps,
    decks,
    fill: [],
    aprons: [],
    pillars: [],
    lamps: [],
  };
}

/**
 * Опоры эстакады: два ряда ПОД настилом с шагом J.pillarSpacing, сечением
 * J.pillarSection, от грунта до низа настила. Наружная грань опоры отступлена от
 * края плиты на J.pillarEdge — стойка обязана держать полотно, а не стоять в
 * метре рядом с ним. Если настил уже, чем два ряда с таким отступом, ряд один
 * по оси полотна. Пластина, стоящая на грунте (`grounded` — насыпь уже отсыпана
 * под ней), опор не имеет вовсе. Позиция в плане наземной улицы, внутри здания
 * или в береговой стенке — опора пропускается с предупреждением: её не видно, а
 * правила о декоре не дают ей стать стеной.
 *
 * `water` — отметка дна там, где пролёт идёт над руслом: пятка обязана встать на
 * него, иначе колонна кончалась бы на «нуле пола мира» и висела бы над водой.
 */
function bridgePillars(road, ground, obstacles, warnings, water) {
  const out = [];
  for (const d of road.decks) {
    // У дуги нет прямой оси: ряды идут по её собственной (tangent) рамке, шаг
    // отмеряется по длине осевой, а низ колонны — по верхней плоскости дуги в её
    // точке. Уклон не повод пропускать опоры: подъём на 12 м держат именно они, а
    // `ramp` у пластин остаётся прежним правилом (пролёт опирается торцами).
    if (d.arc) {
      const spanr = d.span * DEG;
      const len = d.R * Math.abs(spanr);
      if (len < 0.01) continue;
      const inset = d.halfW - J.pillarSection / 2 - J.pillarEdge;
      const offs = inset >= J.pillarSection ? [-inset, inset] : [0];
      const half = J.pillarSection / 2;
      for (let s = J.pillarSpacing / 2; s < len - 0.01; s += J.pillarSpacing) {
        const am = d.a0 * DEG + spanr * (s / len);
        // касательная к осевой: ось колонны смотрит вдоль полотна, как у пластины
        const yaw = am / DEG + 90;
        for (const o of offs) {
          const rho = d.R + o;
          const px = d.cx + Math.cos(am) * rho;
          const pz = d.cz + Math.sin(am) * rho;
          const bottom = arcTopAt(d, am, rho) - J.deckThickness;
          const footY = water ? (water(px, pz) ?? ground.y) : ground.y;
          // у начала подъёма настил ещё у земли: колонны там некуда расти
          if (bottom - footY <= 1.0) continue;
          const plan = obbOf({
            minX: px - half, maxX: px + half, minZ: pz - half, maxZ: pz + half,
          }, frameAt(px, pz, yaw));
          const hit = obstacles.find(ob => obbHitsObb(ob.rect, plan, 0.05));
          if (hit) {
            warnings.push(`${road.id}: опора в ${r3(px)}, ${r3(pz)} попала в ${hit.id} — пропущена`);
            continue;
          }
          out.push(makeProp(`pillar_${road.id}_${r3(px)}_${r3(pz)}`, 'concrete_pillar',
            px, footY, pz,
            { x: J.pillarSection, y: r3(bottom - footY), z: J.pillarSection }, 'bridge_pillar',
            -yaw));
        }
      }
      continue;
    }
    if (d.ramp || d.grounded || d.bottomY - ground.y <= 1.0) continue;
    // у повёрнутой пластины опоры стоят в её осях: ряд идёт вдоль полотна, а не
    // вдоль мировой оси, иначе колонны выстроились бы поперёк косой эстакады
    const frame = deckFrame(d);
    const from = frame ? d.cx - d.length / 2 : (d.axis === 'x' ? d.minX : d.minZ);
    const to = frame ? d.cx + d.length / 2 : (d.axis === 'x' ? d.maxX : d.maxZ);
    const cross = frame ? d.cz : (d.axis === 'x' ? (d.minZ + d.maxZ) / 2 : (d.minX + d.maxX) / 2);
    const halfW = frame ? d.width / 2 : (d.axis === 'x' ? d.maxZ - d.minZ : d.maxX - d.minX) / 2;
    const inset = halfW - J.pillarSection / 2 - J.pillarEdge;
    const offs = inset >= J.pillarSection ? [-inset, inset] : [0];
    for (let t = from + J.pillarSpacing / 2; t < to - 0.01; t += J.pillarSpacing) {
      for (const o of offs) {
        const p = frame
          ? rotatePoint(frame, t, cross + o)
          : (d.axis === 'x' ? { x: t, z: r3(cross + o) } : { x: r3(cross + o), z: t });
        // план опоры — тоже в осях полотна: квадрат сечения, повёрнутый с ним
        const half = J.pillarSection / 2;
        const plan = frame
          ? obbOf({ minX: t - half, maxX: t + half, minZ: cross + o - half, maxZ: cross + o + half }, frame)
          : {
            minX: p.x - half, maxX: p.x + half,
            minZ: p.z - half, maxZ: p.z + half,
          };
        const hit = frame
          ? obstacles.find(ob => obbHitsObb(ob.rect, plan, 0.05))
          : obstacles.find(ob => obbHitsRect(ob.rect, plan, 0.05));
        if (hit) {
          warnings.push(`${road.id}: опора в ${r3(p.x)}, ${r3(p.z)} попала в ${hit.id} — пропущена`);
          continue;
        }
        const footY = water ? (water(p.x, p.z) ?? ground.y) : ground.y;
        out.push(makeProp(`pillar_${road.id}_${r3(p.x)}_${r3(p.z)}`, 'concrete_pillar',
          p.x, footY, p.z,
          { x: J.pillarSection, y: r3(d.bottomY - footY), z: J.pillarSection }, 'bridge_pillar',
          frame ? -d.yaw : 0));
      }
    }
  }
  return out;
}

/** Фонари вдоль настила: шаг J.lampSpacing, по обе стороны на J.lampOffset за краем. */
function roadLamps(road, obstacles, warnings, water) {
  const out = [];
  for (const d of road.decks) {
    // Фонари дуги — по tangent-рамке: на кривой борт поворачивается, и столб,
    // поставленный в мировых осях, «уходил» бы из-под края полотна. Уклонный
    // настил фонарей не носит — то же правило, что у пластин.
    if (d.arc) {
      if (d.ramp) continue;
      const spanr = d.span * DEG;
      const len = d.R * Math.abs(spanr);
      for (let s = J.lampSpacing / 2; s < len - 0.01; s += J.lampSpacing) {
        const am = d.a0 * DEG + spanr * (s / len);
        const yaw = am / DEG + 90;
        for (const side of [-1, 1]) {
          const rho = d.R + side * (d.halfW + J.lampOffset);
          const p = { x: d.cx + Math.cos(am) * rho, z: d.cz + Math.sin(am) * rho };
          const hit = obstacles.find(o => o.kind === 'building' && obbHitsRect(o.rect, pointRect(p), 0.05));
          if (hit) {
            warnings.push(`${road.id}: фонарь в ${r3(p.x)}, ${r3(p.z)} попал в ${hit.id} — пропущен`);
            continue;
          }
          if (water && road.type === 'ground' && water(p.x, p.z) !== null) {
            warnings.push(`${road.id}: фонарь в ${r3(p.x)}, ${r3(p.z)} встал в русло — пропущен`);
            continue;
          }
          out.push(makeProp(`lamp_${road.id}_${r3(p.x)}_${r3(p.z)}`, 'lamp_post',
            p.x, arcTopAt(d, am, rho), p.z, { x: 1, y: 1, z: 1 }, 'road_lamp', -yaw));
        }
      }
      continue;
    }
    if (d.ramp) continue;
    const frame = deckFrame(d);
    const from = frame ? d.cx - d.length / 2 : (d.axis === 'x' ? d.minX : d.minZ);
    const to = frame ? d.cx + d.length / 2 : (d.axis === 'x' ? d.maxX : d.maxZ);
    for (let t = from + J.lampSpacing / 2; t < to - 0.01; t += J.lampSpacing) {
      // фонари стоят по бортам полотна: у косой улицы борта тоже косые, поэтому
      // смещение берётся в её осях и поворачивается вместе с настилом
      const sides = frame
        ? [
          rotatePoint(frame, t, d.cz - d.width / 2 - J.lampOffset),
          rotatePoint(frame, t, d.cz + d.width / 2 + J.lampOffset),
        ]
        : d.axis === 'x'
          ? [{ x: t, z: d.minZ - J.lampOffset }, { x: t, z: d.maxZ + J.lampOffset }]
          : [{ x: d.minX - J.lampOffset, z: t }, { x: d.maxX + J.lampOffset, z: t }];
      for (const p of sides) {
        const hit = obstacles.find(o => o.kind === 'building' && obbHitsRect(o.rect, pointRect(p), 0.05));
        if (hit) {
          warnings.push(`${road.id}: фонарь в ${r3(p.x)}, ${r3(p.z)} попал в ${hit.id} — пропущен`);
          continue;
        }
        // в воду уходит только фонарь наземной улицы: настил моста и эстакады сам
        // держит свою опору света над руслом, и сбрасывать такие фонари значило бы
        // темнить на переправе — самом нужном для ночного перехода месте
        if (water && road.type === 'ground' && water(p.x, p.z) !== null) {
          warnings.push(`${road.id}: фонарь в ${r3(p.x)}, ${r3(p.z)} встал в русло — пропущен`);
          continue;
        }
        out.push(makeProp(`lamp_${road.id}_${r3(p.x)}_${r3(p.z)}`, 'lamp_post', p.x, d.topY, p.z,
          { x: 1, y: 1, z: 1 }, 'road_lamp', frame ? -d.yaw : 0));
      }
    }
  }
  return out;
}

const pointRect = p => ({ minX: p.x - 0.1, maxX: p.x + 0.1, minZ: p.z - 0.1, maxZ: p.z + 0.1 });

// ------------------------------------------------------------------- вода

/**
 * Русло → сегменты осевой ломаной (plan: docs/level10-city-plan.md, этап 2).
 *
 * Считается один раз здесь, валидатор импортирует этот же экспорт: проверка
 * «сход попадает в своё русло» и нормализация не имеют права разойтись в
 * арифметике, иначе парсер поставил бы пандус там, где схема его не ждала.
 *
 * `depth` — насколько берег отходит от русла: толщина стенки у карниза (`quay`)
 * и заложение склона у откоса (`slope`). `rampRun` — длина схода в русло: крутизну
 * держит тот же `J.maxSlope`, что и у настилов дорог, иначе ни ноги, ни сфера
 * Чужого подъём не перешагнут.
 */
export function waterwaySegments(w, groundY) {
  const halfW = w.width / 2;
  const isSlope = w.bank === 'slope';
  const run = isSlope ? r3(w.bankRun ?? (groundY - w.bedY) / J.maxSlope) : 0;
  const depth = isSlope ? run : J.wallThickness;
  const out = [];
  for (let i = 0; i + 1 < w.points.length; i++) {
    const a = w.points[i], b = w.points[i + 1];
    const axis = Math.abs(a.x - b.x) >= Math.abs(a.z - b.z) ? 'x' : 'z';
    const aAlong = axis === 'x' ? a.x : a.z;
    const bAlong = axis === 'x' ? b.x : b.z;
    const from = Math.min(aAlong, bAlong), to = Math.max(aAlong, bAlong);
    const cross = axis === 'x' ? a.z : a.x;
    out.push({
      axis, cross: r3(cross), halfW: r3(halfW), run: r3(run), depth: r3(depth),
      // русло по длине продлено на полширины: на повороте два соседних русла
      // закрывают угол квадрата, а не оставляют в нём сухую клетку
      lo: r3(from - halfW), hi: r3(to + halfW),
      rampRun: r3(Math.max((groundY - w.bedY) / J.maxSlope, depth + 1)),
      bed: axis === 'x'
        ? { minX: r3(from - halfW), maxX: r3(to + halfW), minZ: r3(cross - halfW), maxZ: r3(cross + halfW) }
        : { minX: r3(cross - halfW), maxX: r3(cross + halfW), minZ: r3(from - halfW), maxZ: r3(to + halfW) },
    });
  }
  return out;
}

/**
 * Русло: дно, берега и сходы в плане.
 *
 * Дно и берег — не коробки, а призма профиля: у дна верх — горизонталь на
 * `bedY`, у откоса — наклонная от кромки дна до земли, у схода — наклонная
 * от дна до земли поперёк берега. Коробка по низу русла стала бы невидимой
 * стеной там, где глаз видит склон (правило AGENTS «твёрдость обязана совпадать
 * с картинкой»), а «пол мира — ноль» не дал бы ноге встать ниже нуля.
 *
 * Сходы считаются раньше берегов: план пандуса вырезает дыру в стенке карниза,
 * иначе сход упирался бы в неё носом, а не проходил сквозь проём.
 */
function normalizeWaterway(w, ground) {
  const segs = waterwaySegments(w, ground.y);
  const channel = {
    id: w.id,
    bank: w.bank,
    wade: w.wade !== false,
    width: r3(w.width),
    bedY: r3(w.bedY),
    surfaceY: r3(w.surfaceY),
    segments: segs,
    walls: [],
    descents: [],
    holes: [],
  };
  const t = J.wallThickness;

  for (const r of (w.ramps ?? [])) {
    const seg = nearestSegment(segs, r.at);
    const descAxis = seg.axis === 'x' ? 'z' : 'x';
    const atCross = seg.axis === 'x' ? r.at.z : r.at.x;
    const atAlong = seg.axis === 'x' ? r.at.x : r.at.z;
    const side = atCross >= seg.cross ? 1 : -1;
    const width = r3(r.width ?? J.rampWidth);
    const v0 = r3(atAlong - width / 2), v1 = r3(atAlong + width / 2);
    const u0 = r3(seg.cross + side * (seg.halfW - J.rampNose));
    const u1 = r3(u0 + side * seg.rampRun);
    const plan = seg.axis === 'x'
      ? { minX: v0, maxX: v1, minZ: Math.min(u0, u1), maxZ: Math.max(u0, u1) }
      : { minX: Math.min(u0, u1), maxX: Math.max(u0, u1), minZ: v0, maxZ: v1 };
    channel.descents.push({
      id: `${w.id}:сход${channel.descents.length + 1}`, kind: 'ramp', seg: segs.indexOf(seg),
      axis: descAxis, u0, u1, v0, v1, y0: channel.bedY, y1: r3(ground.y), plan,
    });
  }

  for (const [i, s] of segs.entries()) {
    const descAxis = s.axis === 'x' ? 'z' : 'x';
    if (channel.bank === 'quay') {
      for (const side of [-1, 1]) {
        const inner = s.cross + side * s.halfW;
        const outer = s.cross + side * (s.halfW + t);
        const along = [s.lo - t, s.hi + t];
        const rect = s.axis === 'x'
          ? { minX: r3(along[0]), maxX: r3(along[1]), minZ: Math.min(inner, outer), maxZ: Math.max(inner, outer) }
          : { minX: Math.min(inner, outer), maxX: Math.max(inner, outer), minZ: r3(along[0]), maxZ: r3(along[1]) };
        // стенка прорезается в каждом месте, где к ней примыкает сход
        const pieces = channel.descents
          .filter(d => d.kind === 'ramp' && d.seg === i)
          .reduce((list, d) => list.flatMap(p => subtractRect(p, d.plan)), [rect]);
        for (const p of pieces) channel.walls.push({ rect: rectOut(p) });
      }
    } else {
      for (const side of [-1, 1]) {
        const u0 = r3(s.cross + side * s.halfW);
        const u1 = r3(u0 + side * s.run);
        channel.descents.push({
          id: `${w.id}:берег${channel.descents.length + 1}`, kind: 'bank', seg: i,
          axis: descAxis, u0, u1, v0: s.lo, v1: s.hi, y0: channel.bedY, y1: r3(ground.y),
          plan: s.axis === 'x'
            ? { minX: s.bed.minX, maxX: s.bed.maxX, minZ: Math.min(u0, u1), maxZ: Math.max(u0, u1) }
            : { minX: Math.min(u0, u1), maxX: Math.max(u0, u1), minZ: s.bed.minZ, maxZ: s.bed.maxZ },
        });
      }
    }
  }

  for (const s of segs) channel.holes.push(s.bed);
  for (const d of channel.descents) channel.holes.push(d.plan);
  for (const w2 of channel.walls) channel.holes.push(w2.rect);
  return channel;
}

/** Сегмент, чей план ближе всего к точке поперёк русла; бросает, если русла нет вовсе. */
function nearestSegment(segs, at) {
  const alongOf = s => (s.axis === 'x' ? at.x : at.z);
  const crossOf = s => (s.axis === 'x' ? at.z : at.x);
  let best = null, bestD = Infinity;
  for (const s of segs) {
    const a = alongOf(s);
    if (a < s.lo || a > s.hi) continue;
    const d = Math.abs(crossOf(s) - s.cross);
    if (d < bestD) { bestD = d; best = s; }
  }
  if (!best) {
    throw new Error(`сход ${at.x}, ${at.z}: вне длины русла — пандус не на что опереть`);
  }
  return best;
}

/**
 * Отметка грунта под точкой плана там, где уровень прорезан руслом: дно, склон
 * берега или сход; null — точку касаются обычные опоры. Нужна обоим берегам
 * пайплайна: парсер опускает на неё пятки опор моста, иначе колонна кончалась бы
 * на «нуле пола мира» и висела бы над водой.
 */
export function waterwayFoot(channels) {
  return (x, z) => {
    let best = null;
    const take = y => { if (best === null || y > best) best = y; };
    for (const ch of channels) {
      for (const s of ch.segments) if (inRect(x, z, s.bed)) take(ch.bedY);
      for (const d of ch.descents) {
        const u = d.axis === 'x' ? x : z;
        if (u < Math.min(d.u0, d.u1) || u > Math.max(d.u0, d.u1)) continue;
        const v = d.axis === 'x' ? z : x;
        if (v < d.v0 || v > d.v1) continue;
        const t = d.u1 === d.u0 ? 0 : (u - d.u0) / (d.u1 - d.u0);
        take(d.y0 + (d.y1 - d.y0) * t);
      }
    }
    return best === null ? null : r3(best);
  };
}


// ------------------------------------------------------------------- предметы и опоры

/**
 * Функция опоры по плану: верх настила дороги, если точка в его прямоугольнике
 * (у наклонного пролёта — отметка наклонной плоскости под этой точкой), иначе низ
 * перекрытия первого этажа здания (baseY), иначе дно русла, иначе земля. Предмет,
 * поставленный на отметку ниже своей опоры, утонул бы в асфальте, а выше — висел.
 */
function makeSupport(ground, roads, buildings, water) {
  const plates = roads.flatMap(r => r.decks);
  const plots = buildings.map(b => ({ box: buildingBox(b), y: b.baseY }));
  return (x, z) => {
    let y = water ? (water(x, z) ?? ground.y) : ground.y;
    for (const d of plates) {
      if (!deckHolds(d, x, z)) continue;
      const top = deckTopAt(d, x, z);
      if (top > y) y = top;
    }
    for (const p of plots) if (inBox(x, z, p.box) && p.y > y) y = p.y;
    return r3(y);
  };
}

/**
 * Кадр повёрнутой пластины. В модуль главы пишутся только `cx/cz/yaw`, а
 * косинус с синусом восстанавливаются здесь: второй копии угла в файле не нужно,
 * а расходиться с ним ей негде.
 */
const deckFrame = d => (d.yaw ? frameAt(d.cx, d.cz, d.yaw) : null);

/**
 * Точка в плане настила: у повёрнутой пластины — по её осям, а не по габариту.
 * Габарит здесь ошибся бы в углу, где асфальта нет: предмет, поставленный по
 * нему, висел бы над землёй, а точка B в «настиле» не имела бы опоры.
 */
function deckHolds(d, x, z) {
  if (d.arc) {
    const dx = x - d.cx, dz = z - d.cz;
    // угол берётся тем же `atan2(dz, dx)`, что у потребителей, а обход сектора
    // умеет считать назад (span < 0): развязка права и лева — одна арифметика
    const delta = arcDelta(Math.atan2(dz, dx), d.a0 * DEG, d.span * DEG);
    return delta !== null && Math.abs(Math.hypot(dx, dz) - d.R) <= d.halfW + 1e-9;
  }
  const frame = deckFrame(d);
  if (!frame) return inRect(x, z, d);
  const l = unrotatePoint(frame, x, z);
  return Math.abs(l.x - d.cx) <= d.length / 2 + 1e-9
    && Math.abs(l.z - d.cz) <= d.width / 2 + 1e-9;
}

/** Верх настила над мировой точкой: у наклонной пластины — её плоскость. */
function deckTopAt(d, x, z) {
  if (d.arc) {
    const dx = x - d.cx, dz = z - d.cz;
    const delta = arcDelta(Math.atan2(dz, dx), d.a0 * DEG, d.span * DEG) ?? 0;
    const span = d.span * DEG;
    // подъём линеен по длине дуги, то есть по углу; крен — по отступу от осевой
    return d.y0 + (d.y1 - d.y0) * delta / span + d.tanBank * (Math.hypot(dx, dz) - d.R);
  }
  if (d.topAtMax === d.topAtMin) return d.topAtMin;
  let u, lo, hi;
  const frame = deckFrame(d);
  if (frame) {
    u = unrotatePoint(frame, x, z).x;
    [lo, hi] = [d.cx - d.length / 2, d.cx + d.length / 2];
  } else {
    u = d.axis === 'x' ? x : z;
    [lo, hi] = d.axis === 'x' ? [d.minX, d.maxX] : [d.minZ, d.maxZ];
  }
  return d.topAtMin + (d.topAtMax - d.topAtMin) * (u - lo) / (hi - lo);
}

const inRect = (x, z, r) => x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ;

function authoredProp(o, support, obstacles, warnings) {
  const y = o.position.y ?? support(o.position.x, o.position.z);
  const snapped = support(o.position.x, o.position.z);
  if (Math.abs(y - snapped) > 0.05) {
    warnings.push(`landscapeObjects (${o.id}): position.y ${y} не совпадает с опорой ${snapped} — предмет поставлен на неё`);
  }
  const hit = obstacles.find(ob => ob.kind === 'building' && obbHitsRect(ob.rect, pointRect(o.position), 0.05));
  if (hit && o.model !== 'bollard') warnings.push(`landscapeObjects (${o.id}): внутри плана ${hit.id} — предмет не виден из улиц`);
  return makeProp(o.id, o.model, o.position.x, snapped, o.position.z,
    { x: o.scale?.x ?? 1, y: o.scale?.y ?? 1, z: o.scale?.z ?? 1 }, 'authored', o.rotation?.y ?? 0);
}

function makeProp(id, model, x, y, z, scale, source, rotationY = 0) {
  return {
    id, model, source, rotationY,
    position: { x: r3(x), y: r3(y), z: r3(z) },
    scale: { x: r3(scale.x), y: r3(scale.y), z: r3(scale.z) },
  };
}

/** Проверка точек главы: спавн не в стене, точка B на чём-то стоит. */
function checkPoints(gp, buildings, roads, channels, warnings) {
  // стены и план дома лежат в его собственных осях, поэтому мировая точка
  // сначала разворачивается в них: иначе проба косого корпуса давала бы
  // «внутри габарита» там, где фасад только смотрит углом
  const frames = buildings.map(b => frameOf(b.bounds, b.rotation ?? 0));
  const insideWall = (x, z) => buildings.some((b, i) => {
    const p = unrotatePoint(frames[i], x, z);
    return b.walls.some(w => inRect(p.x, p.z, w));
  });
  const onSomething = (x, z) => buildings.some(b => inBox(x, z, buildingBox(b))) ||
    roads.some(r => r.decks.some(d => deckHolds(d, x, z)));
  // русло режет грунт, поэтому точка над ним стоит только если её держит
  // настил моста или здание: иначе маяк или игрок повиснут над водой
  const inWater = (x, z) => channels.some(c => c.holes.some(h => inRect(x, z, h)));
  if (gp.spawn && insideWall(gp.spawn.x, gp.spawn.z)) {
    warnings.push(`gameplay.spawn ${gp.spawn.x}, ${gp.spawn.z}: внутри стены — игрок родится запертым`);
  }
  for (const [key, p] of [['gameplay.spawn', gp.spawn], ['gameplay.exit', gp.exit]]) {
    if (!p || onSomething(p.x, p.z)) continue;
    if (inWater(p.x, p.z)) {
      warnings.push(`${key} ${p.x}, ${p.z}: в русле, вне настила и здания — точка встанет на дно`);
    }
  }
  if (gp.exit && !onSomething(gp.exit.x, gp.exit.z)) {
    warnings.push(`gameplay.exit ${gp.exit.x}, ${gp.exit.z}: не над зданием и не над настилом — маяк повиснет`);
  }
}

function worldBounds(buildings, roads, channels, ground) {
  let out = { minX: -ground.size / 2, maxX: ground.size / 2, minZ: -ground.size / 2, maxZ: ground.size / 2 };
  for (const b of buildings) out = unionBounds(out, buildingBox(b));
  for (const r of roads) for (const d of r.decks) out = unionBounds(out, d);
  for (const c of channels) for (const h of c.holes) out = unionBounds(out, h);
  return rectOut(out);
}

export { normalizeBuilding, normalizeRoad, normalizeStair, normalizeWaterway, toWorld, edgeRect, inRect };
