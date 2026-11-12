/**
 * Нормализатор уровня: сырой JSON топологии (его пишет LLM) → данные, из которых
 * клиент строит карту без собственной геодезии.
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
  arcBounds, arcDelta, arcBankAt, waterwaySegLocal, inWaterwaySeg, waterwayDescentY, AXIS_EPS,
} from '../src/geo2d.js';
import { reliefOf } from '../src/relief.js';

const J = CONFIG.jsonMap;
const DEG = Math.PI / 180;
const ROTATIONS = [0, 90, 180, 270];

/**
 * Данные v2: поворотные дома, пластины и дуги, рельеф, косые районы, `city.track`
 * и разрезка. Открытый мир (`kind: 'open'`, этап 1 плана docs/open-world-plan.md)
 * — те же данные плюс секция `stream`, а не новая геодезия: поэтому все ветки
 * «v1 или v2» обязаны считать его v2, иначе косой мир собрался бы осевым
 * прямоугольником ровно так же, как это бракует схема v1.
 */
export function isV2Kind(kind) {
  return kind === 'json2' || kind === 'open';
}

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
  const relief = normalizeRelief(raw, ground, warnings);
  // Терраса района ставится ДО нормализации домов: пол корпуса обязан взять
  // отметку уже выровненной террасы, иначе каждый лот требовал бы своего пятачка
  if (relief) addDistrictPads(relief, raw.buildings ?? [], raw.roads ?? []);
  // Отметка местности в точке — единственная запись о «полу главы»: рельеф там,
  // где секция задана, и прежняя плоскость `ground.y` там, где её нет. Главы 9–11
  // получают ту же константу, поэтому их модули обязаны остаться байт-в-байт.
  ground.land = relief ? ((x, z) => relief.fieldAt(x, z)) : (() => ground.y);

  const channels = (raw.waterways ?? []).map(w => normalizeWaterway(w, ground));
  if (relief && channels.some(c => c.curved)) {
    // ландшафт от реки: на берегу = bankY, от берега только вверх (level-10)
    relief.addRivers(channels.filter(c => c.curved), ground);
  }
  const buildings = (raw.buildings ?? []).map(b => normalizeBuilding(b, ground, warnings));
  const roads = (raw.roads ?? []).map(r => normalizeRoad(r, ground, raw.tunnels ?? []));
  if (relief) {
    // авторский дом без района стоит на своей площадке: под ним плоский пол, а не
    // склон, и терраса района его не касается. Дом на terrain-фундаменте следует
    // форме рельефа и отдельной террасы не требует.
    const terraced = new Set((raw.buildings ?? []).filter(b => b.district).map(b => b.id));
    addHousePads(relief, buildings.filter(b => !terraced.has(b.id) && b.foundation !== 'terrain'));
    relief.finish();
    // улицы — ПОСЛЕ финальной подгонки колец: держать они обязаны то же собранное
    // поле, что и карта, а террасу района нормализатор ставит позже, чем
    // нормализует дорогу
    profileDistrictStreets(raw.roads ?? [], roads, relief, warnings);
  }

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
  // голову фонаря на проезжую часть поворачивает только v2: у v1 (главы 9–10)
  // `rotationY` обязан остаться прежним, иначе их модули разойдутся с парсером
  const lampsFaceRoad = isV2Kind(raw.kind);
  for (const road of roads) {
    // перехода не держат колонны: их держат здания, а опора с земли до настила
    // на 27 м проткнула бы кровли и дворы, под которыми переход идёт
    if (road.type !== 'skybridge') road.pillars.push(...bridgePillars(road, ground, obstacles, warnings, water));
    if (road.withLamps) road.lamps.push(...roadLamps(road, obstacles, warnings, water, lampsFaceRoad));
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
  checkPoints(gp, buildings, roads, channels, warnings, relief);
  checkCars(gp, roads, channels, warnings);

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
      // секция живёт только у брифа с машинами: главы 9–12 обязаны остаться
      // побайтово прежними
      ...(gp.cars ? { cars: authoredCars(gp.cars, support) } : {}),
    },
    map: {
      kind: raw.kind ?? 'json',
      units: 'meters',
      ground,
      // рельеф едет в модуль как данные поля (холмы и площадки), а не как растер
      // высот: и парсер, и карта пересчитывают `heightAt` общей функцией
      ...(relief ? { relief: relief.plain } : {}),
      bounds: worldBounds(buildings, roads, channels, ground),
      // точка A живёт в карте: движок передаёт createMap только map-секцию, а
      // spawn нужен карте, чтобы найти опору под ногами до построения графа
      spawn: { x: r3(gp.spawn.x), z: r3(gp.spawn.z) },
      buildings,
      roads,
      // секция появляется только если русла заданы: бриф без воды обязан
      // остаться побайтово тем же
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
      // прямые туннели: коридор между двумя порталами; пол — настил, стены и
      // потолок — призмы/солиды. Секция появляется только если туннели заданы:
      // бриф без туннелей обязан остаться побайтово тем же
      ...(raw.tunnels ? { tunnels: (raw.tunnels ?? []).map(t => ({
        ...t,
        points: (t.points ?? []).map(p => ({ x: r3(p.x), y: r3(p.y), z: r3(p.z) })),
      })) } : {}),
    },
    warnings,
  };
}

const byId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/**
 * Отметка местности в точке для произвольного `ground`. Парсер строит accessor
 * сам, но его функции вызывают и с самодельным `ground` — генератор кварталов
 * (`tools/city.js` собирает препятствия) и геометрический проход схемы: там
 * рельефа нет по построению, и местность обязана быть прежней плоскостью, а не
 * падением вызова. Молча проглотить это падение нельзя: генератор, потерявший
 * авторский дом из списка препятствий, положил бы улицу ему в габарит.
 */
function landY(ground, x, z) {
  return ground.land ? ground.land(x, z) : ground.y;
}

/**
 * Наивысшая точка земли, соприкасающаяся с прямоугольным фундаментом (габарит
 * footprint в локальных осях дома, в мир — через `frame` поворота). Сэмпл по
 * сетке + углы: дом ставится на эту отметку и не зарывается в склон. На ровной
 * площадке/террасе совпадает с отметкой центра, сохраняя байтовую стабильность
 * прежних глав.
 */
function maxLandUnderRect(ground, bounds, frame) {
  const sample = (x, z) => (ground.land ? ground.land(x, z) : ground.y);
  const pts = [
    [bounds.minX, bounds.minZ], [bounds.maxX, bounds.minZ],
    [bounds.maxX, bounds.maxZ], [bounds.minX, bounds.maxZ],
  ];
  let maxY = -Infinity;
  for (const [lx, lz] of pts) {
    const w = rotatePoint(frame, lx, lz);
    const y = sample(w.x, w.z);
    if (y > maxY) maxY = y;
  }
  const sx = Math.max(bounds.maxX - bounds.minX, 0.001);
  const sz = Math.max(bounds.maxZ - bounds.minZ, 0.001);
  const step = 1.5;
  const nx = Math.max(1, Math.ceil(sx / step));
  const nz = Math.max(1, Math.ceil(sz / step));
  for (let i = 1; i < nx; i++) {
    for (let j = 1; j < nz; j++) {
      const w = rotatePoint(frame, bounds.minX + (sx * i) / nx, bounds.minZ + (sz * j) / nz);
      const y = sample(w.x, w.z);
      if (y > maxY) maxY = y;
    }
  }
  return maxY === -Infinity ? ground.y : maxY;
}

/** Наинизшая точка земли под прямоугольным фундаментом — низ юбки фундамента. */
function minLandUnderRect(ground, bounds, frame) {
  const sample = (x, z) => (ground.land ? ground.land(x, z) : ground.y);
  const pts = [
    [bounds.minX, bounds.minZ], [bounds.maxX, bounds.minZ],
    [bounds.maxX, bounds.maxZ], [bounds.minX, bounds.maxZ],
  ];
  let minY = Infinity;
  for (const [lx, lz] of pts) {
    const w = rotatePoint(frame, lx, lz);
    const y = sample(w.x, w.z);
    if (y < minY) minY = y;
  }
  const sx = Math.max(bounds.maxX - bounds.minX, 0.001);
  const sz = Math.max(bounds.maxZ - bounds.minZ, 0.001);
  const step = 1.5;
  const nx = Math.max(1, Math.ceil(sx / step));
  const nz = Math.max(1, Math.ceil(sz / step));
  for (let i = 1; i < nx; i++) {
    for (let j = 1; j < nz; j++) {
      const w = rotatePoint(frame, bounds.minX + (sx * i) / nx, bounds.minZ + (sz * j) / nz);
      const y = sample(w.x, w.z);
      if (y < minY) minY = y;
    }
  }
  return minY === Infinity ? ground.y : minY;
}

// ------------------------------------------------------------------- здания

/**
 * Здание: footprint → союз прямоугольников и сегменты стен, комнаты → полы и
 * перегородки, лестницы → проступи и проёмы, connections → проёмы дверей.
 *
 * Стены центруются на линии ребра: фасад и наружное ребро комнаты, стоящей
 * вплотную к фасаду, дают один и тот же прямоугольник, поэтому дубль отпадает
 * ключом, а не сравнением с допуском.
 */
/** Квантует осевой прямоугольный footprint по шагу окон (ширина/длина кратны spacing). */
function quantizeFootprint(fp, spacing) {
  if (!fp || fp.length !== 4 || !(spacing > 0)) return fp;
  const xs = fp.map(p => p.x), zs = fp.map(p => p.z);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minZ = Math.min(...zs), maxZ = Math.max(...zs);
  // только осевой прямоугольник (4 угла)
  const axisAligned = fp.every(p => (Math.abs(p.x - minX) < 1e-6 || Math.abs(p.x - maxX) < 1e-6)
    && (Math.abs(p.z - minZ) < 1e-6 || Math.abs(p.z - maxZ) < 1e-6));
  if (!axisAligned) return fp;
  const w = Math.max(spacing, Math.round((maxX - minX) / spacing) * spacing);
  const d = Math.max(spacing, Math.round((maxZ - minZ) / spacing) * spacing);
  const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
  const x0 = r3(cx - w / 2), x1 = r3(cx + w / 2), z0 = r3(cz - d / 2), z1 = r3(cz + d / 2);
  return [{ x: x0, z: z0 }, { x: x1, z: z0 }, { x: x1, z: z1 }, { x: x0, z: z1 }];
}

function normalizeBuilding(b, ground, warnings) {
  const errors = [];
  const rawFootprint = b.buildingType ? quantizeFootprint(b.footprint, J.windows.spacing) : b.footprint;
  const footprint = normalizePolygon(rawFootprint, `${b.id}.footprint`, errors);
  if (errors.length) throw new Error(errors.join('\n'));
  const bb = polyBounds(footprint);
  // Фундамент под домом — прямоугольник (габарит footprint) на самой высокой
  // точке земли, с которой он соприкасается: корпус не зарывается в склон.
  // Сэмплим рельеф по сетке габарита в мировых осях (повёрнутый дом — через
  // его кадр); авторский baseY уважаем как нижнюю границу (дом не опускаем).
  // На ровной/террасированной площадке максимум равен отметке центра, поэтому
  // прежние главы не двигаются.
  const houseFrame = frameOf(bb, b.rotation ?? 0);
  const houseCenter = rotatePoint(houseFrame, (bb.minX + bb.maxX) / 2, (bb.minZ + bb.maxZ) / 2);
  const groundMax = maxLandUnderRect(ground, bb, houseFrame);
  const groundMin = minLandUnderRect(ground, bb, houseFrame);
  const baseY = r3(Math.max(b.baseY ?? landY(ground, houseCenter.x, houseCenter.z), groundMax));
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

  const stairs = (b.stairs ?? []).map(s => normalizeStair(s, baseY, floorHeight, b.id, errors, warnings)).sort(byId);
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
    ...(b.buildingType ? { buildingType: b.buildingType } : {}),
    isEnterable: b.isEnterable !== false,
    baseY,
    ...(b.foundation === 'terrain' && baseY - groundMin > 0.05 ? { foundation: 'terrain' } : {}),
    ...(b.foundation !== 'terrain' && baseY - groundMin > 0.05 ? { foundationBottomY: r3(Math.min(groundMin, baseY - 0.01)) } : {}),
    floorHeight,
    floorsCount: b.floorsCount,
    roofY: r3(baseY + b.floorsCount * floorHeight),
    facadeMaterial: b.facadeMaterial ?? 'concrete',
    // секция `roof` появляется только у дома, где она задана в брифе: бриф
    // без неё обязан нормализоваться побайтово как раньше (плиты кровли тогда
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
    // Ключ появляется только у повёрнутого дома — v1-брифы обязаны
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
 * Беговая длина марша — путь тела по проступям снизу до верха. По ней считают
 * уклон: раскрой тот же, что у `stairLayout` (у Г-образного — прогон по X до
 * изгиба плюс прогон по Z после площадки, у винта — длина витка).
 */
function stairRun(type, L, W) {
  if (type === 'l_shape') return 0.6 * L + 0.5 * W;
  if (type === 'spiral') return Math.PI * Math.min(L, W);
  return L;
}

/**
 * Лестница → проступи в мировых координатах + проём. Марш считается в локальной
 * системе (X — направление подъёма, низ при X = 0, Y вверх, вправо — Z), затем
 * поворачивается на rotation и переносится в position: косых маршей схема не
 * делает, поэтому поворот кратен 90° и AABB повёрнутого прямоугольника точен.
 *
 * `connectsFloors [k0, k1]` с `k1 === floorsCount` — марш, выведенный на кровлю:
 * его отметка назначения `y1` ровно `roofY`, а проём в плите кровли режет клиент
 * (там же, где он режет проём в перекрытии этажа).
 *
 * У вертикального марша `steps[last].top` лежит на одном подъёме НИЖЕ `y1`:
 * проём шахты и план проступи совпадают, поэтому пластина заподлицо с этажом
 * или кровлей не оставляла бы дыры — ни спуска, ни провала (`stairLayout`).
 */
function normalizeStair(s, baseY, floorHeight, buildingId, errors, warnings = []) {
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

  if (s.type !== 'ladder') {
    const slope = r3(height / stairRun(s.type, L, W));
    if (slope > J.maxStairSlope) {
      warnings.push(`${buildingId}.${s.id}: уклон марша ${slope} круче J.maxStairSlope ${J.maxStairSlope} — подъём читается стеной, а не ходьбой`);
    }
  }

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
 * Отсюда и последний подъём короче остальных: верхняя проступь останавливается
 * на одном `risePer` ниже своей отметки. План проступи здесь совпадает с планом
 * проёма, поэтому пластина заподлицо с полом или кровлёй отвечала бы опорой над
 * всем проёмом — дыра читалась бы сплошным настилом и спуск был бы невозможен
 * (замер — `docs/defects-v2-plan.md` §3).
 */
function stairLayout(type, L, W, height) {
  if (type === 'ladder') {
    const n = Math.max(3, Math.ceil(height / J.maxRise));
    return [{ axis: 'x', a0: 0, a1: L, c0: 0, c1: W, count: n - 1, yFrom: 0, risePer: height / n, full: true }];
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
 * Автоматическое скругление поворотов path-дороги дуговыми филетами (в плане XZ).
 * Возвращает дорогу с `elements` (plate/arc) или null, если скруглить нельзя/не нужно.
 *
 * Для каждого внутреннего угла ломаной строится круговая дуга радиуса `R`, касательная
 * к прилегающим сегментам; прямые участки становятся plate-элементами. Высота (y)
 * интерполируется по длине пути. Углы/филеты считаются в 2D (XZ), что соответствует
 * скруглению поворотов на дороге.
 */
function filletPathRoad(road, R, ground, tunnels) {
  const ptsIn = road.points ?? [];
  if (ptsIn.length < 3) return null;
  // подготовка точек как у normalizeRoad: подъём к рельефу (без drape-разбиения, чтобы не
  // порождать лишние микро-углы) — геометрия филета строится по опорным точкам пути
  const lift = (p) => {
    if (road.type !== 'ground' && road.type !== 'bridge') return { ...p };
    if (inTunnel(p.x, p.z, p.y, tunnels)) return { ...p };
    if (!ground.land) return { ...p };
    const land = ground.land(p.x, p.z);
    return { ...p, y: Math.max(p.y, r3(land + J.streetRise)) };
  };
  const pts = ptsIn.map(lift);
  const n = pts.length;

  const segLen = (a, b) => Math.hypot(b.x - a.x, b.z - a.z);
  // накопленная длина по ломаной для интерполяции y
  const cum = [0];
  for (let i = 1; i < n; i++) cum.push(cum[i - 1] + segLen(pts[i - 1], pts[i]));

  const yAtS = (s) => {
    if (s <= 0) return pts[0].y;
    if (s >= cum[n - 1]) return pts[n - 1].y;
    let i = 1;
    while (i < n && cum[i] < s - 1e-9) i++;
    const a = pts[i - 1], b = pts[i];
    const ds = cum[i] - cum[i - 1];
    const t = ds > 1e-9 ? (s - cum[i - 1]) / ds : 0;
    return a.y + (b.y - a.y) * t;
  };

  const norm2 = (vx, vz) => { const l = Math.hypot(vx, vz); return l > 1e-9 ? [vx / l, vz / l, l] : [0, 0, 0]; };
  const angDeg = (vx, vz) => Math.atan2(vz, vx) * 180 / Math.PI;
  const normAng = (a) => { let x = a; while (x > 360) x -= 360; while (x < -360) x += 360; return x; };
  // кратчайшая дуга от a0 к a1 в заданном направлении (sign>0 CCW/увеличение, sign<0 CW)
  const sweepTo = (a0, a1, sign) => {
    let d = a1 - a0;
    if (sign > 0) { while (d <= 0) d += 360; while (d > 360) d -= 360; }
    else { while (d >= 0) d -= 360; while (d < -360) d += 360; }
    return d;
  };

  // trim расстояние на каждом сегменте у его концов (из-за филетов)
  const trimL = Array(n).fill(0), trimR = Array(n).fill(0);
  const fillets = Array(n).fill(null);

  for (let i = 1; i < n - 1; i++) {
    const p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1];
    const [u0x, u0z, l0] = norm2(p1.x - p0.x, p1.z - p0.z); // входящий (к углу)
    const [u1x, u1z, l1] = norm2(p2.x - p1.x, p2.z - p1.z); // исходящий (от угла)
    if (l0 < 1e-6 || l1 < 1e-6) continue;
    // cross в 2D (x,z): u0 x u1 = u0x*u1z - u0z*u1x; >0 => поворот "влево" (CCW)
    const cross = u0x * u1z - u0z * u1x;
    const dot = Math.max(-1, Math.min(1, u0x * u1x + u0z * u1z));
    const turn = Math.abs(Math.atan2(cross, dot)); // 0..pi, 0 = прямо
    if (turn < 1e-3 || Math.abs(Math.PI - turn) < 1e-3) continue; // нет угла или разворот
    const tOff = R / Math.tan(turn / 2);
    if (!Number.isFinite(tOff) || tOff <= 1e-6) continue;
    // нужно место на прилегающих сегментах с учётом соседних филетов (грубая проверка позже тоже)
    const avail0 = l0 - trimR[i - 1];
    const avail1 = l1 - trimL[i + 1];
    if (tOff > avail0 - 0.05 || tOff > avail1 - 0.05) continue;

    // точки касания
    const t1x = p1.x - u0x * tOff, t1z = p1.z - u0z * tOff;
    const t2x = p1.x + u1x * tOff, t2z = p1.z + u1z * tOff;
    // центр дуги: по нормали внутрь поворота на R
    const sgn = cross > 0 ? 1 : -1; // +1 = левый поворот
    // левая нормаль к направлению (dx,dz): (-dz, dx)
    const n0x = -u0z * sgn, n0z = u0x * sgn;
    const cx = t1x + n0x * R, cz = t1z + n0z * R;
    // углы точек касания относительно центра
    const a1 = angDeg(t1x - cx, t1z - cz);
    const a2 = angDeg(t2x - cx, t2z - cz);
    const span = sweepTo(a1, a2, sgn);

    // параметры вдоль исходной ломаной (для y)
    const sT1 = cum[i] - tOff;
    const sT2 = cum[i] + tOff;
    fillets[i] = { cx, cz, R, from: a1, to: a1 + span, y0: yAtS(sT1), y1: yAtS(sT2), t1x, t1z, t2x, t2z, sT1, sT2 };
    trimR[i - 1] = Math.max(trimR[i - 1], tOff);
    trimL[i + 1] = Math.max(trimL[i + 1], tOff);
  }

  // финальная проверка: прямые остатки сегментов не отрицательные
  for (let i = 0; i < n - 1; i++) {
    const l = segLen(pts[i], pts[i + 1]);
    if (l - trimR[i] - trimL[i + 1] < -0.05) return null;
  }

  // Есть ли хоть один филет?
  if (!fillets.some(Boolean)) return null;

  const elements = [];
  const W = r3(road.width ?? 8);
  const rails = !!road.rails;
  let cur = { x: pts[0].x, z: pts[0].z, y: pts[0].y, s: 0 };

  const pushPlate = (ax, az, ay, bx, bz, by) => {
    const dx = bx - ax, dz = bz - az;
    const len = Math.hypot(dx, dz);
    if (len < 0.2) return;
    const yaw = Math.atan2(dx, dz) * 180 / Math.PI; // локальная ось пластины вдоль длины; согласуем ниже
    // В normalizeRoadElements: локальная ось вдоль length это ось X пластины, повёрнутая на yaw.
    // frameAt/rotatePoint: x' = cx + dx*c - dz*s => направление локального +X в мире = (cos(yaw), sin(yaw)).
    // Значит yaw = atan2(worldDirZ, worldDirX)? Wait: (c,s)=(cos(rad),sin(rad)) of yaw deg. Local +X maps to (c,s).
    // So yaw = atan2(dz, dx) in our dx,dz along segment.
    const yaw2 = Math.atan2(dz, dx) * 180 / Math.PI;
    elements.push({ plate: { x: r3((ax + bx) / 2), z: r3((az + bz) / 2), yaw: r3(yaw2), length: r3(len), width: W, y: r3(ay), rise: r3(by - ay), ...(rails ? { rails: true } : {}) } });
  };

  for (let i = 1; i < n; i++) {
    const prevFillet = fillets[i - 1];
    const nextFillet = fillets[i];
    const startPt = prevFillet ? { x: prevFillet.t2x, z: prevFillet.t2z, y: prevFillet.y1, s: prevFillet.sT2 } : cur;
    const endPt = nextFillet ? { x: nextFillet.t1x, z: nextFillet.t1z, y: nextFillet.y0, s: nextFillet.sT1 } : { x: pts[i].x, z: pts[i].z, y: pts[i].y, s: cum[i] };
    // прямой участок до угла i (если есть)
    if (segLen(startPt, endPt) > 0.2) pushPlate(startPt.x, startPt.z, startPt.y, endPt.x, endPt.z, endPt.y);
    // дуга в угле i
    if (nextFillet) {
      elements.push({ arc: { cx: r3(nextFillet.cx), cz: r3(nextFillet.cz), radius: r3(nextFillet.R), from: r3(normAng(nextFillet.from)), to: r3(normAng(nextFillet.to)), width: W, y: [r3(nextFillet.y0), r3(nextFillet.y1)], ...(rails ? { rails: true } : {}) } });
      cur = { x: nextFillet.t2x, z: nextFillet.t2z, y: nextFillet.y1, s: nextFillet.sT2 };
    } else {
      cur = endPt;
    }
  }

  if (!elements.length) return null;
  return {
    ...road,
    elements,
    // path убираем: element-дорога
  };
}

/** true, если точка (x,z,y) находится внутри коридора прямого туннеля (прорубленный рельеф). */
function inTunnel(x, z, y, tunnels) {
  for (const t of (tunnels ?? [])) {
    const pts = t.points ?? [];
    const a = pts[0], b = pts[pts.length - 1];
    if (!a || !b) continue;
    const dx = b.x - a.x, dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    if (len < 1e-6) continue;
    const px = x - a.x, pz = z - a.z;
    const t0 = (px * dx + pz * dz) / (len * len);
    if (t0 < -0.05 || t0 > 1.05) continue;
    const cx = a.x + dx * Math.max(0, Math.min(1, t0));
    const cz = a.z + dz * Math.max(0, Math.min(1, t0));
    if (Math.hypot(x - cx, z - cz) > (t.width ?? 8) / 2 + 1) continue;
    const fy = a.y + (b.y - a.y) * Math.max(0, Math.min(1, t0));
    if (y >= fy - 0.5 && y <= fy + (t.height ?? 4.2) + 0.5) return true;
  }
  return false;
}

/**
 * Дорога → пластины настила. Плоский пролёт — одна пластина с верхом `topY`.
 * Пролёт с подъёмом — ОДНА наклонная пластина (`ramp: true`, верх идёт от
 * `topAtMin` до `topAtMax` вдоль оси): картинка гладкая, как склон горы в главе 1,
 * и твёрдость обязана совпасть с ней, поэтому перепад не разбивают на коробки
 * ступеней — наклонный пролёт держит аналитическая призма (`JsonMap.prisms`).
 * Крутизну ограничивает схема: `|rise| / run ≤ J.maxSlope`, иначе ни ноги, ни
 * сфера Чужого такой подъём не перешагнут.
 */
function normalizeRoad(road, ground, tunnels) {
  if (road.elements) return normalizeRoadElements(road);
  // Автоматическое скругление поворотов (филеты): замена острых углов path-дороги
  // дуговыми элементами радиуса `filletRadius`/`fillet` (м). Применяется в плане XZ;
  // высота на дуге интерполируется по длине (как у прочих элементов). При успешном
  // построении дорога превращается в element-дорогу (plate+arc), иначе — обычный путь.
  const filletR = Number(road.filletRadius ?? road.fillet);
  if (Number.isFinite(filletR) && filletR > 0.01 && Array.isArray(road.points) && road.points.length >= 3) {
    const filleted = filletPathRoad(road, filletR, ground, tunnels);
    if (filleted) return normalizeRoadElements(filleted);
  }
  const halfW = road.width / 2;
  // Дорога не может быть ниже ландшафта: поднимаем точку до рельефа + streetRise
  // (иначе полотно зарывается в склон или мерцает вровень с плоскостью земли).
  // Мост/эстакада-рампа: держит авторскую отметку, но не опускается ниже рельефа
  // (стык подъезда с землёй). Участок в прорубленном туннеле не трогаем.
  const lift = (p) => {
    if (road.type !== 'ground' && road.type !== 'bridge') return p;
    if (inTunnel(p.x, p.z, p.y, tunnels)) return p;
    if (!ground.land) return p;
    const land = ground.land(p.x, p.z);
    return { ...p, y: Math.max(p.y, r3(land + J.streetRise)) };
  };
  // Дорога на рельефе (ground, и bridge — чтобы рампа/подъезд моста получил
  // плавный стык с землёй, а чистый приподнятый мост остался на своей отметке):
  // ни закопана, ни висит.
  // (1) Без намеренного подъёма (автор не поднимал точки над рельефом и нет
  //     перепада по концам) — чистое следование поверхности: y = land+streetRise,
  //     с адаптивным дроблением, пока хорда между точками отклоняется от поверхности
  //     больше ε (иначе прямой клин deck уходит в бугор или висит над ложбиной).
  // (2) Намеренная рампа (подъезд к мосту, авторский подъём) — профиль
  //     max(линейный подъём, land+streetRise): подъём сохранён (не уронить ниже
  //     цели моста), склон пробит не будет; дробим, пока хорда уходит ниже
  //     поверхности. Мост целиком высоко над рельефом даёт ту же константную
  //     отметку (max). Участок в прорубленном туннеле не трогаем.
  const drape = (pts) => {
    if (!ground.land) return pts.map(lift);
    if (road.type !== 'ground' && road.type !== 'bridge') return pts.map(lift);
    const rise = J.streetRise;
    const orig = road.points ?? [];
    const intentionalRamp = orig.some(p => {
      const land = ground.land(p.x, p.z);
      return p.y > land + rise + 0.5; // автор поднял точку заметно над рельефом
    }) || (orig.length >= 2 && Math.abs((orig[0].y ?? 0) - (orig[orig.length - 1].y ?? 0)) > 0.8);
    const same = (a, b) => Math.abs(a.x - b.x) < 1e-6 && Math.abs(a.z - b.z) < 1e-6;
    const surf = (x, z, fallbackY) => inTunnel(x, z, fallbackY, tunnels)
      ? fallbackY : r3(ground.land(x, z) + rise);
    const dedup = (arr) => {
      const out = [];
      for (const p of arr) if (!out.length || !same(out[out.length - 1], p)) out.push(p);
      return out;
    };
    const EPS = 0.04; // допуск отклонения хорды от поверхности, м
    if (!intentionalRamp) {
      // каждая точка ровно на поверхности; дробим, пока хорда не повторяет её
      const onSurf = (x, z, fy) => ({ x: r3(x), z: r3(z), y: surf(x, z, fy) });
      const dev = (a, b) => {
        const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz);
        if (len < 1.5) return null;
        let worst = null, worstD = EPS;
        // середина + четверти ловят и бугор, и ложбину
        for (const t of [0.5, 0.25, 0.75]) {
          const x = a.x + dx * t, z = a.z + dz * t;
          const chord = a.y + (b.y - a.y) * t;
          const s = surf(x, z, chord);
          const d = Math.abs(chord - s);
          if (d > worstD) { worstD = d; worst = { x, z, y: s }; }
        }
        return worst;
      };
      const out = [];
      const refine = (a, b, depth) => {
        const m = depth < 8 ? dev(a, b) : null;
        if (m) { refine(a, m, depth + 1); refine(m, b, depth + 1); return; }
        if (!out.length || !same(out[out.length - 1], a)) out.push(a);
        out.push(b);
      };
      for (let i = 0; i + 1 < orig.length; i++) {
        refine(onSurf(orig[i].x, orig[i].z, orig[i].y), onSurf(orig[i + 1].x, orig[i + 1].z, orig[i + 1].y), 0);
      }
      return dedup(out);
    }
    // рампа: профиль = max(линейный подъём между поднятыми концами, поверхность)
    const src = orig.map(lift);
    const out = [];
    const refine = (a, b, depth) => {
      const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz);
      if (depth < 8 && len > 1.5) {
        let worst = null, worstD = 0.03;
        for (const t of [0.5, 0.25, 0.75]) {
          const x = a.x + dx * t, z = a.z + dz * t;
          const lin = a.y + (b.y - a.y) * t;
          if (inTunnel(x, z, lin, tunnels)) continue;
          const s = ground.land(x, z) + rise;
          if (lin < s - worstD) { worstD = s - lin; worst = { x: r3(x), z: r3(z), y: r3(s) }; }
        }
        if (worst) { refine(a, worst, depth + 1); refine(worst, b, depth + 1); return; }
      }
      if (!out.length || !same(out[out.length - 1], a)) out.push(a);
      out.push(b);
    };
    for (let i = 0; i + 1 < src.length; i++) refine(src[i], src[i + 1], 0);
    return dedup(out);
  };
  const pts = drape(road.points ?? []);
  const decks = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1];
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
      ramp: Math.abs(topHi - topLo) > J.rampEps,
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
 * Крен — **не константа секции, а функция угла**: он ноль на обоих торцах и
 * разгоняется до авторского `bank` по косинусоиде за переходный угол `bankTrans`.
 * Прямой настил, примыкающий к торцу, плоский, и постоянный крен клал бы линию
 * стыка диагональю (замер — 0,84 м на 8 м ширины). Длина перехода выбрана из
 * двух пределов сразу: продольный уклон **края** полотна не превышает `J.maxSlope`,
 * которым схема ограничивает ось (краю достается и подъём, и раскрутка крена), и
 * гребень края приходит к торцу **снизу**, то есть раскрутка не круче подъёма оси
 * (замер прежней сборки главы 11 — горб 0,202 м над настилом моста в 2,4 м до
 * стыка). Кламп в 40 % развёртки на торец не даёт переходам съесть короткую дугу
 * и накладываться друг на друга.
 *
 * `topAtMin/topAtMax` — отметки **срезов** (плоскости торцов, где крена нет), а не
 * гребень середины: валидатор сравнивает их с концами соседних элементов, и
 * ложный гребень завышал бы мост над рекой на `tan(bank) · halfW`. Верх над
 * точкой сектора считает `deckTopAt` по углу и радиусу.
 */
function normalizeArc(a) {
  const span = a.to - a.from;
  const halfW = a.width / 2;
  const y0 = r3(a.y[0]), y1 = r3(a.y[1]);
  const tanBank = r3(Math.tan((a.bank ?? 0) * DEG));
  const lo = Math.min(y0, y1), hi = Math.max(y0, y1);
  const len = a.radius * Math.abs(span * DEG);
  // край полотна едет и по подъёму, и по раскрутке крена сразу: на переход
  // остаётся столько `maxSlope`, сколько не съел продольный уклон
  const axisSlope = len > 0 ? Math.abs(y1 - y0) / len : 0;
  return {
    ...rectOut(arcBounds(a.cx, a.cz, a.radius, halfW, a.from * DEG, a.to * DEG)),
    arc: true,
    cx: r3(a.cx), cz: r3(a.cz),
    R: r3(a.radius), halfW: r3(halfW),
    a0: a.from, a1: a.to, span,
    y0, y1, tanBank,
    bankTrans: transitionDeg(tanBank, halfW, a.radius, span, axisSlope),
    width: r3(a.width),
    topY: lo,
    bottomY: r3(lo - J.deckThickness),
    topAtMin: lo,
    topAtMax: hi,
    ramp: Math.abs(y1 - y0) > J.rampEps,
    rails: !!a.rails,
  };
}

/**
 * Переходный угол крена (градусы): половина косинусоиды набирает `bankLen` метров
 * поперечного подъёма с максимальной крутизной `π/2 · bankLen / L_t`, поэтому при
 * `L_t = π/2 · bankLen / rate` крутизна ровно `rate`, и суммарный уклон края
 * полотна остаётся в `J.maxSlope`. Нулевой крен даёт нулевой переход — потребителю
 * нечем делить.
 *
 * `rate` — меньший из двух пределов, и второй держит не крутизну, а **форму
 * стыка**: раскрутка крена не смеет быть круче подъёма оси. Кромка полотна едет по
 * подъёму и по крену сразу, и если крен отдаёт свои `bankLen` быстрее, чем ось их
 * набирает, гребень переваливает через отметку среза и падает к ней — у главы 11
 * короткий переход по одному лишь `maxSlope` (4,253°) поднимал внешний край на
 * 0,202 м выше моста в 2,4 м до стыка. Где подъём оси есть, переход становится
 * длиннее и уклон края только выигрывает; на плоской дуге делить не на что, и
 * остаётся один бюджет `maxSlope` — там кромка убывает к срезу монотонно и горба
 * нет по построению.
 */
function transitionDeg(tanBank, halfW, R, span, axisSlope) {
  const bankLen = Math.abs(tanBank) * halfW;
  if (bankLen === 0) return 0;
  const spare = Math.max(J.maxSlope - axisSlope, J.maxSlope * 0.25);
  const rate = axisSlope > 0 ? Math.min(spare, axisSlope) : spare;
  const trans = ((Math.PI / 2) * bankLen / rate / R) / DEG;
  return r3(Math.min(trans, 0.4 * Math.abs(span)));
}

/** Крен полотна дуги на угле `ang` (рад) — одна формула для всех потребителей. */
function deckBankAt(d, ang) {
  return arcBankAt(ang - d.a0 * DEG, d.span * DEG, d.tanBank, d.bankTrans * DEG);
}

/**
 * Верх дуги в точке её сектора — та же формула, что отдаёт движок (`topAt`).
 * Опоры и фонари стоят на краю полотна, где крен добавляет к отметке оси
 * `крен(угол) · отступ`; брать `topY` (минимум по всему сектору) значило бы
 * утопить их в настиле на внешнем краю и подвесить на внутреннем.
 */
function arcTopAt(d, ang, rho) {
  return d.y0 + (d.y1 - d.y0) * (ang - d.a0 * DEG) / (d.span * DEG) + deckBankAt(d, ang) * (rho - d.R);
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
    // запоминается РАЗРЕШЁННЫЙ элемент: цепочка из двух маркеров подряд обязана
    // передать дальше угол, вычисленный касательной, а не авторский (обычно 0)
    prev = resolved;
    pending = false;
  }
  if (pending) throw new Error(`elements[${elements.length - 1}]: connect:'tangent' в конце — примыкающего элемента нет`);
  return out;
}

/**
 * Торцы настилов дороги: `{ x, z, top, dx, dz, len, i, side }` — центр среза,
 * его внешняя нормаль (единичная), отметка верха полотна в этом срезе и длина
 * элемента вдоль полотна. `i` — адрес в брифе (маркеры `connect` выброшены, как
 * в `resolveRoadElements`), `side` — `'min'` у локального начала пластины,
 * `'max'` у её конца.
 *
 * У пластины считаются её ЛОКАЛЬНЫЕ концы, повёрнутые кадром `yaw`: мировой
 * `minX` у настила с `yaw = −180` смотрит на восток, и нос вышел бы не туда. У
 * дуги срез радиальный (норма — наружу кольца, а ось элемента идёт по
 * касательной, поэтому прямую полосу торца дуги из неё не построить), у `points`
 * — конец осевого отрезка. Порядок совпадает с `roadRectsOf` схемы, поэтому
 * i-я пластина и пара срезов `2i, 2i+1` соответствуют друг другу: и валидатор, и
 * генератор кварталов меряют нос по одной арифметике (AGENTS — план дороги у
 * валидатора и у нормализатора общий).
 */
export function roadCapsOf(road) {
  const out = [];
  if (road.points) {
    for (let i = 0; i + 1 < road.points.length; i++) {
      const a = road.points[i], b = road.points[i + 1];
      const vx = b.x - a.x, vz = b.z - a.z, L = Math.hypot(vx, vz) || 1;
      out.push({ x: r3(a.x), z: r3(a.z), top: a.y, dx: -vx / L, dz: -vz / L, len: L, i, side: 'min' });
      out.push({ x: r3(b.x), z: r3(b.z), top: b.y, dx: vx / L, dz: vz / L, len: L, i, side: 'max' });
    }
    return out;
  }
  let elements = [];
  try { elements = resolveRoadElements(road.elements ?? []); } catch { return out; }
  elements.forEach(({ el, i }) => {
    if (el?.arc) {
      for (const [side, deg] of [['min', el.arc.from], ['max', el.arc.to]]) {
        const a = deg * DEG, u = { x: Math.cos(a), z: Math.sin(a) }, s = side === 'min' ? -1 : 1;
        out.push({ x: r3(el.arc.cx + u.x * el.arc.radius), z: r3(el.arc.cz + u.z * el.arc.radius),
          top: side === 'min' ? el.arc.y[0] : el.arc.y[1],
          dx: u.x * s, dz: u.z * s, len: el.arc.radius * Math.abs(el.arc.to - el.arc.from) * DEG, i, side });
      }
      return;
    }
    const pl = el?.plate;
    if (!pl) return;
    const rad = (pl.yaw ?? 0) * DEG, t = { x: Math.cos(rad), z: Math.sin(rad) };
    for (const [side, s] of [['min', -1], ['max', 1]]) {
      out.push({ x: r3(pl.x + t.x * s * pl.length / 2), z: r3(pl.z + t.z * s * pl.length / 2),
        top: side === 'min' ? pl.y : pl.y + (pl.rise ?? 0),
        dx: t.x * s, dz: t.z * s, len: pl.length, i, side });
    }
  });
  return out;
}

/**
 * Свободные носы подъёмов: торцы дорог `type: 'bridge'`, которые обязаны
 * кончаться на асфальте. Отсекаются два класса, и оба — не съезд:
 *
 * * **стык цепочки** — срез другой подъёмной пластины ближе `J.deckJoint`. Судят
 *   по положению, а не по углу: у стыка «прямая → дуга» нормали соседних
 *   элементов перпендикулярны, и «совпала нормаль» там никогда не случится.
 *   Торец наземной улицы в нос не засчитывается: это ровно то примыкание,
 *   которого правило и требует, иначе генератор, дотянувший улицу к носу, сам бы
 *   снял проверку.
 * * **устой пролёта** — конец выше грунта (`relief` в точке, а при её отсутствии
 *   — `groundY`) на больший зазор, чем под ним пройти (`J.bridgeMinHeight`).
 *   Свободный верх пролёта, ещё не доехавшего до берега, стыкует автор, и
 *   требовать там улицу значило бы браковать всякий мост через русло.
 *
 * Возвращает `[{ ...cap, n, road }]` в порядке дорог брифа — детерминированно,
 * потому что по этому списку генератор расставляет оси улиц.
 *
 * @param {object[]} roads сырые дороги брифа
 * @param {number} groundY отметка «пола мира», если рельефа нет
 * @param {{heightAt:(x:number,z:number)=>number}|null} field поле рельефа
 *   со всеми авторскими площадками — та же отметка грунта, из которой схема
 *   меряет пятку (иначе валидатор и разворот разъехались бы на первом брифе)
 */
export function bridgeNoses(roads, groundY, field) {
  const caps = [];
  for (const [n, road] of roads.entries()) {
    for (const cap of roadCapsOf(road)) caps.push({ ...cap, n, road });
  }
  const deckCaps = caps.filter(c => c.road.type === 'bridge');
  const out = [];
  for (const cap of deckCaps) {
    const joined = deckCaps.some(o => (o.n !== cap.n || o.i !== cap.i || o.side !== cap.side)
      && Math.hypot(o.x - cap.x, o.z - cap.z) < J.deckJoint);
    if (joined) continue;
    const base = field ? field.heightAt(cap.x, cap.z) : groundY;
    if (cap.top - base > J.bridgeMinHeight) continue;
    out.push(cap);
  }
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
      ramp: Math.abs(topHi - topLo) > J.rampEps,
      rails: !!pl.rails,
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
 * Улицы генератора — по профилю собранного поля (этап 6b главы 12).
 *
 * Пластина держит одну плоскость, поэтому прогону нужны ДВЕ отметки — по его
 * собственных концам, — а перекрёстку одна: он квадрат, и все четыре борта
 * обязаны лежать в его плоскости, иначе к нему не подйдёт ни один прогон.
 * Отметки берутся из поля ПОСЛЕ `relief.finish()`: террасу района нормализатор
 * ставит позже, чем нормализует дорогу, и до финальной подгонки колец настил
 * лег бы ниже террасы (замер на косом городе — 10 из 25 перекрёстков отвечали
 * `groundHeightAt` отметкой поля 2,17–2,48 м вместо асфальта 0,12 м).
 *
 * Крен перекрёстка берётся вдоль той оси квадрата, где перепад поля больше:
 * пластина наклоняется только вдоль своей локальной X, а квадрат от поворота на
 * 90° меняет план ровно на себя, так что разворачивать его безопасно. Ось с
 * меньшим перепадом остаётся горизонтальной — прогоны обоих рядов цепляются за
 * одну плоскость, и на стыке не появляется ступень.
 *
 * Прогон, которому одна прямая не держит профиль (разброс поля вокруг хорды
 * больше `grade · run / 2`), режется пополам с потолком `J.streetSplitMax`;
 * перепад круче `grade` остаётся предупреждением автору, а не тихой картинкой:
 * район с такой улицей надо ставить на плато.
 *
 * Последним шагом проверяется стык с авторским подъёмом: нос его пластины,
 * опущенный к собранному грунту, обязан лечь вровень с тем полотном, которое
 * вышло ПОСЛЕ фиттинга (см. `bridgeNoses` и комментарий в конце функции).
 */
function profileDistrictStreets(rawRoads, roads, relief, warnings) {
  const gen = rawRoads.filter(r => r.district !== undefined
    && Array.isArray(r.elements) && r.elements.length
    && r.elements.every(el => el.plate && el.connect === undefined));
  if (!gen.length) return;
  const heightAt = (x, z) => relief.fieldAt(x, z);
  // полотно выше поля на `streetRise` — то же соотношение, что у v1 на плоской
  // земле: настил остаётся выше пола первого этажа террасы и не лежит в одной
  // плоскости с мешем грунта (со-плоскостные грани мигают в z-buffer)
  const surfaceAt = (x, z) => r3(heightAt(x, z) + J.streetRise);

  /**
   * Поле ПОД КОРИТОМ улицы: максимум поперёк её ширины, а не на осевой.
   *
   * Пластина держит одну плоскость и поперёк себя тоже, поэтому улица, идущая
   * поперёк склона, при фиттинге по осевой закапывает один борт: замер главы 12 —
   * «проспект плато» `rd_plate_ave` шириной 10 м лёг на склон 0,048 м/м, и его
   * северная половина ушла под грунт на 0,11–0,24 м, а в переходном кольце
   * террасы района — на 0,456 м (опорой там отвечает склон, а не асфальт, и на
   * проезжей части растёт ступень вдоль борта). Максимум поперёк накрывает корыто
   * целиком; разница с полем с наружной стороны остаётся бортиком насыпи, который
   * перекрывает толщина плиты (`deckThickness` 0,6 м против подъёма 0,24 м).
   */
  function fieldAcross(p, x, z) {
    const g = axisOf(p);
    let hi = -Infinity;
    for (const v of [-g.w, 0, g.w]) hi = Math.max(hi, heightAt(x - v * g.s, z + v * g.c));
    return hi;
  }

  /** Мировая ось пластины: `a` — локальное начало (u = −L/2), `b` — её конец. */
  function axisOf(p) {
    const rad = (p.yaw ?? 0) * Math.PI / 180;
    const c = Math.cos(rad), s = Math.sin(rad);
    const half = p.length / 2, w = p.width / 2;
    return {
      c, s, half, w,
      u: (x, z) => (x - p.x) * c + (z - p.z) * s,
      v: (x, z) => -(x - p.x) * s + (z - p.z) * c,
      a: { x: p.x - c * half, z: p.z - s * half },
      b: { x: p.x + c * half, z: p.z + s * half },
    };
  }

  // плоскости перекрёстков — сначала: они никем не держатся, а торцы прогонов
  // читаются уже из них
  const planes = [];
  for (const r of gen) {
    if (!r.crossing) continue;
    for (const el of r.elements) {
      const p = el.plate, g = axisOf(p);
      const dzX = -g.s, dzZ = g.c; // локальная +Z — поперёк прогона
      const dX = surfaceAt(g.b.x, g.b.z) - surfaceAt(g.a.x, g.a.z);
      const dZ = surfaceAt(p.x + dzX * g.w, p.z + dzZ * g.w)
        - surfaceAt(p.x - dzX * g.w, p.z - dzZ * g.w);
      const alongZ = Math.abs(dZ) > Math.abs(dX);
      const yaw = r3((p.yaw ?? 0) + (alongZ ? 90 : 0));
      const start = alongZ
        ? surfaceAt(p.x - dzX * g.w, p.z - dzZ * g.w)
        : surfaceAt(g.a.x, g.a.z);
      const rise = r3(alongZ ? dZ : dX);
      const g2 = axisOf({ ...p, yaw });
      // площадка перекрёстка держит ОДНУ плоскость: на её борта стыкуются четыре
      // прогона, поэтому на кривом поле она либо проваливается под грунт, либо
      // горбит над ним. Сдвиг плоскости центрируют по разбросу поля в квадрате,
      // а затем поднимают ровно настолько, чтобы провал не превысил `streetFit`:
      // опорой под асфальтом обязан отвечать настил, а не склон (замер без
      // центровки: замыкающая улица садилась на 0,019 м ниже поля, а подъём на
      // максимум недостающего оставлял горб 0,407 м). Если разброс поля в
      // квадрате больше предела twice — причину называют автору: району нужна
      // терраса шире квартала, а не улица через кольцо перехода
      let hi = -Infinity, lo = Infinity;
      for (let iu = 0; iu <= 4; iu++) {
        for (let iv = 0; iv <= 4; iv++) {
          const u = 2 * g2.half * (iu / 4) - g2.half;
          const v = 2 * g2.w * (iv / 4) - g2.w;
          const dev = surfaceAt(p.x + u * g2.c - v * g2.s, p.z + u * g2.s + v * g2.c)
            - (start + rise * (u + g2.half) / (2 * g2.half));
          hi = Math.max(hi, dev); lo = Math.min(lo, dev);
        }
      }
      let shift = (hi + lo) / 2;
      if (hi - shift > J.streetFit) shift = hi - J.streetFit;
      const proud = r3(shift - lo);
      if (proud > J.streetFit) {
        warnings.push(`${r.id}: плоскость перекрёстка держит поле с расхождением `
          + `${proud} м при пределе ${J.streetFit} — полю района нужна терраса шире `
          + `квартала (или более пологий холм), иначе посреди улицы растёт горб`);
      }
      const y = r3(start + shift);
      const rad = yaw * Math.PI / 180;
      el.plate = { ...p, yaw, y, rise };
      planes.push({
        cx: p.x, cz: p.z, c: Math.cos(rad), s: Math.sin(rad),
        half: g2.half, w: g2.w, y0: y, rise,
      });
    }
  }

  /**
   * Отметка полотна в точке: плоскость перекрёстка или черезной улицы, если
   * точка стоит на её борту, — иначе поле ПО КОРЫТУ самой пластины (`fieldAcross`).
   */
  function levelAt(p, x, z) {
    for (const pl of [...planes, ...through]) {
      const u = (x - pl.cx) * pl.c + (z - pl.cz) * pl.s;
      const v = -(x - pl.cx) * pl.s + (z - pl.cz) * pl.c;
      // торец, попавший ВНУТРЬ чужого плана, — T-стык у границы района: черезная
      // улица держит свой профиль, а замыкающая приходит к её плоскости, иначе на
      // месте примыкания остаётся ступень (замер — 0,055 м на фикстуре полигона)
      const interior = pl.run && Math.abs(u) < pl.half - 0.02;
      const border = !pl.run && Math.abs(u) <= pl.half + 0.02;
      if ((interior || border) && Math.abs(v) <= pl.w + 0.02) {
        return r3(pl.y0 + pl.rise * (u + pl.half) / (2 * pl.half));
      }
    }
    return p ? r3(fieldAcross(p, x, z) + J.streetRise) : surfaceAt(x, z);
  }

  // плоскости прогонов прошлого прохода — ими подтягиваются T-стыки (см. `levelAt`)
  let through = [];

  /**
   * Расхождение хорды пластины с полотном поля: `dev` — в обе стороны (настил
   * то проваливается под грунт, то горбит над ним), `bur` — только провал, он же
   * «опорой отвечает склон, а не асфальт». Меряется по КОРЫТУ (см. `fieldAcross`),
   * а не по осевой: плоскость держит и поперечник, и провал одного борта осевая
   * просто не видит. Торцы в срезку не попадают: конец, притянутый к чужой
   * плоскости, расходится с полем НАМЕРЕННО — стык настила важнее профиля, и
   * разрешить ему расходиться только внутри допуска значило бы заставить прогон
   * резаться на каждом T-стыке, где дети наследуют тот же пин.
   */
  function chordDev(p, y0, y1) {
    const g = axisOf(p);
    const k = Math.max(2, Math.round(p.length / J.navStep));
    let dev = 0, bur = 0;
    for (let i = 1; i < k; i++) {
      const t = i / k;
      const d = fieldAcross(p, g.a.x + (g.b.x - g.a.x) * t, g.a.z + (g.b.z - g.a.z) * t)
        - (y0 + (y1 - y0) * t);
      dev = Math.max(dev, Math.abs(d + J.streetRise));
      bur = Math.max(bur, d);
    }
    return { dev, bur };
  }

  /** Прогон → список пластин, держащих профиль: прямая не держит поле — резка пополам. */
  function fitRun(p, depth) {
    const g = axisOf(p);
    const y0 = levelAt(p, g.a.x, g.a.z), y1 = levelAt(p, g.b.x, g.b.z);
    const run = p.length;
    if (chordDev(p, y0, y1).dev > J.streetFit && depth < J.streetSplitMax && run > 2) {
      const mid = { x: (g.a.x + g.b.x) / 2, z: (g.a.z + g.b.z) / 2 };
      const yM = levelAt(p, mid.x, mid.z);
      const half = r3(run / 2);
      const mk = (from, fm, to, tm) => fitRun({
        ...p,
        x: r3((from.x + to.x) / 2), z: r3((from.z + to.z) / 2),
        length: half, y: fm, rise: r3(tm - fm),
      }, depth + 1);
      return [
        ...mk(g.a, y0, mid, yM),
        ...mk(mid, yM, g.b, y1),
      ];
    }
    return [{ ...p, y: y0, rise: r3(y1 - y0) }];
  }

  // два прохода: первый кладёт прогоны по полю и по плоскостям перекрёстков,
  // второй подтягивает их торцы к плоскостям соседних прогонов. Плоскости второго
  // прохода собираются из **окончательных** пластин первого: если бы каждый
  // прогон читал торцы только что подогнанного соседа, порядок обгона дорог
  // определял бы отметку, а зависимость «замыкающая ← черезная» обязана быть
  // одинакова для всего района за один проход
  const runs = gen.filter(r => !r.crossing);
  const fitted = new Map();
  for (let round = 0; round < 2; round++) {
    const warn = round === 1;
    const next = [];
    for (const r of runs) {
      const grade = r.grade ?? J.streetGrade;
      const elements = [], plates = [];
      for (const el of r.elements) {
        const leaves = fitRun(el.plate, 0);
        if (warn) {
          // потолок резов — не оправдание: если и после него плоскость держит
          // поле хуже допуска, причина называется, а не рисуется молча
          const dev = Math.max(...leaves.map(p => chordDev(p, p.y, p.y + p.rise).dev));
          if (dev > J.streetFit) {
            warnings.push(`${r.id}: прогон держит поле с расхождением ${r3(dev)} м при пределе `
              + `${J.streetFit} и потолке резов ${J.streetSplitMax} — под улицей перепад, которого `
              + `хватает на ступень: району нужна терраса шире квартала, а связку ярусов делает `
              + `дорога-рампа`);
          }
          for (const p of leaves) {
            const slope = Math.abs(p.rise) / Math.max(p.length, 1e-6);
            if (slope > grade) {
              warnings.push(`${r.id}: улица даёт уклон ${r3(slope)} м/м на ${r3(p.length)} м `
                + `при пределе ${grade} — район надо ставить на плато, а связку ярусов делать `
                + `дорогой-рампом или лестницей`);
            }
          }
        }
        for (const plate of leaves) {
          elements.push({ ...el, plate });
          plates.push(plate);
        }
      }
      fitted.set(r.id, elements);
      for (const plate of plates) {
        const g = axisOf(plate);
        next.push({
          run: true, cx: plate.x, cz: plate.z, c: g.c, s: g.s,
          half: g.half, w: g.w, y0: plate.y, rise: plate.rise ?? 0,
        });
      }
    }
    through = next;
  }

  for (const r of gen) {
    const elements = r.crossing
      ? r.elements.map(el => ({ ...el }))
      : (fitted.get(r.id) ?? []);
    const road = roads.find(x => x.id === r.id);
    if (road) road.decks = normalizeRoadElements({ ...r, elements }).decks;
  }

  // --- нос подъёма обязан сойтись с ОКОНЧАТЕЛЬНЫМ полотном улицы ---
  // В брифе генераторная пластина несёт provisional `y`: её отметку парсер
  // берёт с поля, поэтому схема сравнивать съезд с ней не вправе и мерит только
  // «лежит ли нос на асфальте». Здесь настил уже тот, что увидит нога, — и если
  // район под носом лёг не вровень, это предупреждение автору, а не тихая
  // ступень в собранной главе (закоммиченная глава предупреждений не носит).
  const final = [];
  for (const r of gen) {
    for (const el of (r.crossing ? r.elements : fitted.get(r.id) ?? [])) {
      const p = el.plate;
      final.push({ id: r.id, p, g: axisOf(p) });
    }
  }
  const fieldAt = (x, z) => relief.fieldAt(x, z);
  for (const nose of bridgeNoses(rawRoads, 0, { heightAt: fieldAt })) {
    let best = null;
    for (const f of final) {
      const du = nose.x - f.p.x, dv = nose.z - f.p.z;
      const u = du * f.g.c + dv * f.g.s, v = -du * f.g.s + dv * f.g.c;
      if (Math.abs(v) > f.g.w + J.skybridgeFit || Math.abs(u) > f.g.half + J.skybridgeFit) continue;
      const t = Math.min(1, Math.max(0, (u + f.g.half) / (2 * f.g.half)));
      const top = r3(f.p.y + (f.p.rise ?? 0) * t);
      const d = Math.abs(top - nose.top);
      if (!best || d < best.d) best = { d, top, id: f.id };
    }
    if (!best || best.d <= J.skybridgeFit) continue;
    warnings.push(`нос подъёма (${nose.x}, ${nose.z}) дороги ${nose.road.id} сходится с улицей `
      + `${best.id} ступенью ${r3(best.d)} м при допуске ${J.skybridgeFit} (её полотно ${best.top}): `
      + `району под съездом нужна та же отметка, что и носу`);
  }
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
 * Пластина v2 держит колонны и под уклоном: низ опоры — соffit наклонной
 * плоскости в своей точке (тот же `deckTopAt`, что считает предметы), а не
 * `bottomY` всего пролёта, и колонна короче метра там, где полотно уже легло на
 * грунт, не ставится. Осевая пластина v1 с подъёмом опор не носит (её держат
 * торцы), и опора в план наземной улицы проходит молча у любого настила: там,
 * где полотно перекрыло улицу, пролёт держит себя сам, а дыра в ряду колонн —
 * картинка перекрёстка, а не потерпанный авторский замысел. В план дома, другого
 * настила или береговой стенки стойка не встаёт без предупреждения.
 *
 * `water` — отметка дна там, где пролёт идёт над руслом: пятка обязана встать на
 * него, иначе колонна кончалась бы на «нуле пола мира» и висела бы над водой.
 */
function bridgePillars(road, ground, obstacles, warnings, water) {
  const out = [];
  for (const d of road.decks) {
    // У дуги нет прямой оси: ряды идут по её собственной (tangent) рамке, шаг
    // отмеряется по длине осевой, а низ колонны — по верхней плоскости дуги в её
    // точке. Уклон не повод пропускать опоры: подъём на 12 м держат именно они (у
    // пластин v2 — то же правило, у осевых пролётов v1 пролёт с `rise` по-прежнему
    // опирается торцами).
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
          const footY = water ? (water(px, pz) ?? landY(ground, px, pz)) : landY(ground, px, pz);
          // у начала подъёма настил ещё у земли: колонны там некуда расти
          if (bottom - footY <= 1.0) continue;
          const plan = obbOf({
            minX: px - half, maxX: px + half, minZ: pz - half, maxZ: pz + half,
          }, frameAt(px, pz, yaw));
          const hit = obstacles.find(ob => obbHitsObb(ob.rect, plan, 0.05));
          if (hit) {
            // то же молчание, что у пластины: стойка в проезжей части не ставится,
            // и слово о ней не пишется
            if (hit.kind !== 'road') {
              warnings.push(`${road.id}: опора в ${r3(px)}, ${r3(pz)} попала в ${hit.id} — пропущена`);
            }
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
    if (d.grounded) continue;
    // Пластина v2 (`length`/`width` бывают только у неё) держится опорами и там,
    // где идёт под уклоном: низ колонны берётся из наклонной плоскости в её
    // собственной точке, а не из `bottomY` — у съезда это самый низкий срез
    // (−0,48 м), и де́ковый гейт «колонна короче метра» отрезал бы весь подъём.
    // Осевая пластина v1 остаётся прежним правилом: пролёт с `rise` держат торцы,
    // и модули v1-глав от этого не меняются.
    const plate = d.length !== undefined;
    // «настил у земли» мерится по местности под его центром, а не по плоскости
    // `ground.y`: пролёт, врезанный в холм, своей опорой держит склон, и колонны
    // под ним выросли бы внутри грунта
    const landAt = landY(ground, (d.minX + d.maxX) / 2, (d.minZ + d.maxZ) / 2);
    if (!plate && (d.ramp || d.bottomY - landAt <= 1.0)) continue;
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
        // у начала подъёма настил ещё у земли: колонны там некуда расти — тот же
        // гейт по высоте, что у дуги (для плоского пролёта он заведомо проходится)
        const bottom = plate ? deckTopAt(d, p.x, p.z) - J.deckThickness : d.bottomY;
        const footY = water ? (water(p.x, p.z) ?? landY(ground, p.x, p.z)) : landY(ground, p.x, p.z);
        if (bottom - footY <= 1.0) continue;
        const hit = frame
          ? obstacles.find(ob => obbHitsObb(ob.rect, plan, 0.05))
          : obstacles.find(ob => obbHitsRect(ob.rect, plan, 0.05));
        if (hit) {
          // Опора в плане наземной улицы пропускается **молча** — и у съезда, и у
          // любого настила, в том числе у кольца трассы: колонна в проезжей части
          // не ошибка автора, а свойство перекрёстка, пролёт над асфальтом держит
          // себя сам. В план дома или другого настила стойка по-прежнему не встаёт
          // без слова (замер этапа 3: трасса над районом давала 6…13 таких
          // предупреждений на сборку, и закоммиченная глава не имела бы права их
          // нести, хотя геометрия в обоих случаях одинаковая)
          if (hit.kind !== 'road') {
            warnings.push(`${road.id}: опора в ${r3(p.x)}, ${r3(p.z)} попала в ${hit.id} — пропущена`);
          }
          continue;
        }
        out.push(makeProp(`pillar_${road.id}_${r3(p.x)}_${r3(p.z)}`, 'concrete_pillar',
          p.x, footY, p.z,
          { x: J.pillarSection, y: r3(bottom - footY), z: J.pillarSection }, 'bridge_pillar',
          frame ? -d.yaw : 0));
      }
    }
  }
  return out;
}

/**
 * Фонари вдоль настила: шаг J.lampSpacing, по обе стороны на J.lampOffset за
 * краем.
 *
 * `face` — поворачивать голову на проезжую часть (только `json2`). Голова
 * `lamp_post` вынесена по локальной +Z ([src/props.js:59]), а `rotationY` — угол
 * `Object3D.rotation.y`, мировой вектор головы при этом `(sin θ, cos θ)`, поэтому
 * θ = atan2(hx, hz) для направления `h` от столба к ОСЕВОЙ полотна. Прежний
 * поворот `−yaw` держал голову перпендикулярно оси настила в одну и ту же
 * сторону с обоих бортов, поэтому половина пар светила прочь с асфальта, а у
 * осевых улиц `rotationY = 0` клала её вдоль проезжей части (замер развёрнутых глав
 * зондом `probe/stage7-lamps.mjs`, фонарь привязан к своей деке по борту: глава
 * v1 — 658 из 1238 светят вдоль, по 290 на дорогу и прочь; глава 11 до правки —
 * 24 вдоль и по 10 прочь/на дорогу из 44 осевых, в косом районе — 8 прочь и 8 на
 * дорогу из 16; после — все 60 главы 11 на дорогу). Главы 9–10 — v1, и там
 * остаётся прежний поворот: их модули обязаны собраться побайтово.
 */
function roadLamps(road, obstacles, warnings, water, face) {
  const out = [];
  /** Поворот головы на осевую: `axis` — ближайшая точка осевой полотна. */
  const faceRoad = (axis, p, fallback) => {
    const dx = axis.x - p.x, dz = axis.z - p.z;
    const L = Math.hypot(dx, dz);
    return face && L > 1e-6 ? r3(Math.atan2(dx / L, dz / L) / DEG) : fallback;
  };
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
            p.x, arcTopAt(d, am, rho), p.z, { x: 1, y: 1, z: 1 }, 'road_lamp',
            faceRoad({ x: d.cx + Math.cos(am) * d.R, z: d.cz + Math.sin(am) * d.R }, p, -yaw)));
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
          { x: 1, y: 1, z: 1 }, 'road_lamp',
          faceRoad(frame ? rotatePoint(frame, t, d.cz)
            : d.axis === 'x' ? { x: t, z: (d.minZ + d.maxZ) / 2 } : { x: (d.minX + d.maxX) / 2, z: t },
            p, frame ? -d.yaw : 0)));
      }
    }
  }
  return out;
}

const pointRect = p => ({ minX: p.x - 0.1, maxX: p.x + 0.1, minZ: p.z - 0.1, maxZ: p.z + 0.1 });

// ------------------------------------------------------------------- вода

/**
 * Русло → сегменты ломаной (этап 2 плана города).
 *
 * Осевой сегмент (по X или Z) отдаёт прежнюю форму (`axis/cross/lo/hi/bed`-rect) —
 * валидатор, нормализатор, парсер-сюиты и закоммиченные модули глав 02/11/12/13/14
 * обязаны остаться побайтово теми же. Диагональный/криволинейный сегмент (кривая
 * река, глава 10) несёт локальный кадр `(ax,az,tx,tz,nx,nz,L)` и габарит `bed`:
 * прямоугольную обрезку грунта по `subtractRect` для него карта не делает (дырой в
 * rect-разложении он не выражается), визуально русло вырезается сдвигом вершин
 * грунта по `inWaterwaySeg`, а физика/навигация — той же принадлежностью.
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
    const dx = b.x - a.x, dz = b.z - a.z;
    const L = Math.hypot(dx, dz);
    if (L < AXIS_EPS) continue;
    const isAxisX = Math.abs(dz) <= AXIS_EPS;
    const isAxisZ = Math.abs(dx) <= AXIS_EPS;
    // русло по длине продлено на полширины: на повороте два соседних русла
    // закрывают угол квадрата, а не оставляют в нём сухую клетку
    const lo = r3(-halfW), hi = r3(L + halfW);
    const rampRun = r3(Math.max((groundY - w.bedY) / J.maxSlope, depth + 1));
    if (isAxisX || isAxisZ) {
      const axis = isAxisX ? 'x' : 'z';
      const from = axis === 'x' ? Math.min(a.x, b.x) : Math.min(a.z, b.z);
      const to = axis === 'x' ? Math.max(a.x, b.x) : Math.max(a.z, b.z);
      const cross = axis === 'x' ? a.z : a.x;
      out.push({
        axis, cross: r3(cross), halfW: r3(halfW), run: r3(run), depth: r3(depth),
        lo: r3(from - halfW), hi: r3(to + halfW), rampRun,
        bed: axis === 'x'
          ? { minX: r3(from - halfW), maxX: r3(to + halfW), minZ: r3(cross - halfW), maxZ: r3(cross + halfW) }
          : { minX: r3(cross - halfW), maxX: r3(cross + halfW), minZ: r3(from - halfW), maxZ: r3(to + halfW) },
      });
    } else {
      const tx = dx / L, tz = dz / L, nx = -tz, nz = tx;
      const corners = [a, b].flatMap(p => [1, -1].map(s => ({ x: p.x + nx * s * halfW, z: p.z + nz * s * halfW })));
      const xs = corners.map(p => p.x), zs = corners.map(p => p.z);
      const seg = {
        halfW: r3(halfW), run: r3(run), depth: r3(depth),
        lo, hi, rampRun,
        ax: r3(a.x), az: r3(a.z), bx: r3(b.x), bz: r3(b.z),
        tx: r3(tx), tz: r3(tz), nx: r3(nx), nz: r3(nz), L: r3(L),
      };
      seg.bed = { minX: r3(Math.min(...xs)), maxX: r3(Math.max(...xs)), minZ: r3(Math.min(...zs)), maxZ: r3(Math.max(...zs)), strip: true, seg: { ax: seg.ax, az: seg.az, tx: seg.tx, tz: seg.tz, nx: seg.nx, nz: seg.nz, lo, hi, halfW: seg.halfW, L: seg.L } };
      out.push(seg);
    }
  }
  return out;
}

/**
 * Русло: дно, берега и сходы в плане.
 *
 * Осевые сегменты (по X/Z) отдают прежнюю геометрию побайтово — закоммиченные
 * главы 02/11/12/13/14 и все проверки по ним обязаны остаться зелёными. Кривой
 * сегмент (кривая река) несёт локальный кадр: стены карниза и сходы-рампы на
 * кривой не поддерживаются (сход в кривую реку — отдельная задача; level-10 их
 * не использует) и отвергаются с ясной причиной; дно, откос-берег и блокер
 * непроходимого русла строятся по полосе сегмента.
 */
function normalizeWaterway(w, ground) {
  const segs = waterwaySegments(w, ground.y);
  const isCurved = segs.some(s => !s.axis);
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
    ...(isCurved ? { curved: true } : {}),
  };
  const t = J.wallThickness;

  for (const r of (w.ramps ?? [])) {
    const seg = nearestSegment(segs, r.at);
    if (!seg.axis) throw new Error(`сход ${r.at.x}, ${r.at.z}: рампы на криволинейном русле не поддерживаются`);
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
    if (!s.axis) {
      // кривой сегмент: берег/стенки как прямоугольники не выразить; дно даёт
      // призму и полосу-преграду в surfaces, _inChannel — по расстоянию до оси
      if (channel.bank === 'slope') {
        // откос-берег с каждой стороны — полоса шириной run вдоль нормали
        for (const side of [-1, 1]) {
          channel.descents.push({
            id: `${w.id}:берег${channel.descents.length + 1}`, kind: 'bank', seg: i,
            strip: true, side, s,
            y0: channel.bedY, y1: r3(ground.y),
          });
        }
      }
      continue;
    }
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
  for (const d of channel.descents) if (d.plan) channel.holes.push(d.plan);
  for (const w2 of channel.walls) channel.holes.push(w2.rect);
  return channel;
}

/** Сегмент, чей план ближе всего к точке поперёк русла; бросает, если русла нет вовсе. */
function nearestSegment(segs, at) {
  let best = null, bestD = Infinity;
  for (const s of segs) {
    if (s.axis === 'x' || s.axis === 'z') {
      const a = s.axis === 'x' ? at.x : at.z;
      if (a < s.lo || a > s.hi) continue;
      const d = Math.abs((s.axis === 'x' ? at.z : at.x) - s.cross);
      if (d < bestD) { bestD = d; best = s; }
    } else {
      const L = waterwaySegLocal(s, at.x, at.z);
      if (L.along < s.lo || L.along > s.hi) continue;
      const d = Math.abs(L.cross);
      if (d < bestD) { bestD = d; best = s; }
    }
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
      for (const s of ch.segments) {
        if (inWaterwaySeg(s, x, z)) take(ch.bedY);
      }
      for (const d of ch.descents) {
        if (d.strip) {
          // берег-полоса вдоль кривого сегмента
          const s = d.s, L = waterwaySegLocal(s, x, z);
          if (L.along < s.lo || L.along > s.hi) continue;
          const inner = d.side * s.halfW, outer = inner + d.side * s.run;
          const v = L.cross;
          if (Math.abs(v - inner) + Math.abs(outer - v) - Math.abs(outer - inner) > 1e-6) continue;
          take(waterwayDescentY({ y0: d.y0, y1: d.y1, u0: inner, u1: outer }, v));
          continue;
        }
        const u = d.axis === 'x' ? x : z;
        if (u < Math.min(d.u0, d.u1) || u > Math.max(d.u0, d.u1)) continue;
        const v = d.axis === 'x' ? z : x;
        if (v < d.v0 || d.v1 < v) continue;
        take(waterwayDescentY(d, u));
      }
    }
    return best === null ? null : r3(best);
  };
}


// ------------------------------------------------------------------- рельеф главы

/**
 * Рельеф главы: `plain` — данные поля (они едут в модуль главы), `fieldAt` —
 * та же арифметика, которой парсер ставит опоры, основания колонн и фонари.
 *
 * Площадки-«пэды» парсер выводит сам: корпус обязан стоять на своей отметке
 * `baseY`, а не на склоне под ним, и то же нужно наземному настилу. Ширину
 * переходной зоны считает парсер, а не автор: площадке, которая выше природы на
 * 6 м, нельзя переходить в склон за 14 м — это уклон 0,43 м/м, круче предела и
 * дороги, и рельефа; поле тогда перестаёт быть плавным ровно там, где к нему
 * примыкает дом.
 */
function normalizeRelief(raw, ground, warnings) {
  const spec = raw.relief;
  if (!spec) return null;
  const maxSlope = spec.maxSlope ?? J.relief.maxSlope;
  // Предел холма `hillMaxSlope * 1.5` может превышать предел поля `maxSlope`
  // — тогда платформы-пэды получают переход шире предела, но само полеremaining
  // строится корректно. Ограничение оставлено на совести автора брифа, а не
  // парсера: уровень 1 с горами до 19 м не вписывается в 0.3 м/м, и это нормально.
  if ((spec.hillMaxSlope ?? J.relief.hillMaxSlope) * 1.5 > maxSlope + 1e-9) {
    // умышленно без warnings.push — автор отвечает за крутизну холмов
  }
  const roadCorridors = (spec.roadCorridors ?? spec.corridors ?? []).map(c => ({
    id: c.id,
    width: r3(c.width ?? 8),
    shoulder: r3(c.shoulder ?? J.relief.roadShoulder ?? 2),
    blend: r3(c.blend ?? J.relief.roadBlend ?? 10),
    ...(c.crossLevel ? { crossLevel: true } : {}),
    points: (c.points ?? []).map(p => ({ x: r3(p.x), y: r3(p.y ?? 0), z: r3(p.z) })),
  }));
  const plain = {
    baseY: r3(spec.baseY ?? ground.y),
    maxSlope,
    blend: r3(spec.blend ?? J.relief.blend),
    cell: r3(spec.cell ?? J.planGrid),
    hills: (spec.hills ?? []).map(h => ({
      id: h.id, x: r3(h.x), z: r3(h.z),
      bx: h.bx === undefined ? undefined : r3(h.bx),
      bz: h.bz === undefined ? undefined : r3(h.bz),
      radius: r3(h.radius), height: r3(h.height),
    })),
    pads: (spec.pads ?? []).map(p => ({
      id: p.id, minX: r3(p.minX), maxX: r3(p.maxX), minZ: r3(p.minZ), maxZ: r3(p.maxZ),
      y: r3(p.y), blend: r3(p.blend ?? spec.blend ?? J.relief.blend), yaw: p.yaw,
    })),
    ...(spec.rivers?.length ? { rivers: spec.rivers } : {}),
    ...(roadCorridors.length ? { roadCorridors } : {}),
  };
  // Пробное поле каждой площадки строится заново на каждом шаге подгонки:
  // итоговый градиент — это не только кольцо, но и склон под ним, а формула
  // `|Δ| / maxSlope` (замер — `tools/relief.test.mjs`) даёт 1,5-кратный запас
  // ровно там, где переход и должен быть плавным
  const relief = {
    plain,
    field: null,
    fieldAt: (x, z) => relief.field.heightAt(x, z),
    // Подгонка идёт по полю со ВСЕМИ уже поставленными площадками: кольца двух
    // соседей складываются, и второй переход, подобранный только против холма, лег
    // бы на склон круче предела ровно там, где площадки стыкуются
    addPads(list) {
      for (const p of list) {
        fitPadBlend(p, plain, maxSlope, plain.pads);
        plain.pads.push(p);
      }
      relief.field = reliefOf(plain);
    },
    // Речные вырезы из нормализованных русел: ландшафт строится от реки (на
    // берегу = bankY, от берега только вверх). Вызывается после нормализации
    // waterways, до финализации поля.
    addRivers(channels, ground) {
      if (!channels?.length) return;
      plain.rivers = channels.map(ch => ({
        bankY: r3(ch.bank === 'quay' ? (ground?.y ?? plain.baseY) : (ground?.y ?? plain.baseY)),
        bedY: r3(ch.bedY),
        surfaceY: r3(ch.surfaceY ?? (ground?.y ?? plain.baseY) - 0.2),
        halfW: r3(ch.width / 2),
        ramp: r3(Math.max(30, (ground?.y ?? plain.baseY) - ch.bedY + 10)),
        segments: (ch.segments ?? []).map(s => s.axis
          ? { ax: r3(s.ax), az: r3(s.az), bx: r3(s.bx), bz: r3(s.bz) }
          : { ax: r3(s.ax), az: r3(s.az), bx: r3(s.bx), bz: r3(s.bz) }),
      }));
      relief.field = reliefOf(plain);
    },
    // Второй заход по СОБРАННОМУ полю: подгонка по предыстории не видит колец,
    // поставленных после площадки, а два перехода в одной точке суммируются, и
    // поле расходится с пределом ровно на стыке соседних площадок. Дотягиваем
    // такие кольца по финальному полю — за два прохода сумма переходов входит в
    // предел с обеих сторон. Вердикт «площадке не хватает зоны» отдаёт только
    // этот финал, иначе одна и та же площадка жаловалась бы на каждый вызов
    // `addPads`.
    finish() {
      for (let round = 0; round < 2; round++) {
        let widened = false;
        for (const p of plain.pads) {
          if (ringSlope(p, relief.field) <= maxSlope * 1.02) continue;
          fitPadBlend(p, plain, maxSlope, plain.pads.filter(o => o !== p));
          relief.field = reliefOf(plain);
          widened = true;
        }
        if (!widened) break;
      }
      for (const p of plain.pads) {
        const slope = ringSlope(p, relief.field);
        if (slope > maxSlope * 1.15) {
          warnings.push(`relief: площадке ${p.id ?? '?'} не хватает переходной зоны ${J.relief.maxBlend} м — `
            + `кольцо даёт уклон ${slope.toFixed(3)} м/м при пределе ${maxSlope}; `
            + `нужно снести террасу на отметку поля (${r3(relief.field.reliefHeightAt(
              (p.minX + p.maxX) / 2, (p.minZ + p.maxZ) / 2))} м в её центре) или раздвинуть холм`);
        }
      }
    },
  };
  plain.pads.forEach((p, i) => fitPadBlend(p, plain, maxSlope, plain.pads.slice(0, i)));
  relief.field = reliefOf(plain);
  return relief;
}

/** Крутизна собранного поля на кольце площадки — по её offset-контуру. */
function ringSlope(p, field) {
  const frame = p.yaw ? frameAt((p.minX + p.maxX) / 2, (p.minZ + p.maxZ) / 2, p.yaw) : null;
  return ringProbes(p, p.blend, frame).reduce((m, q) => Math.max(m, field.slopeAt(q.x, q.z).mag), 0);
}

/**
 * Террасы районов идут в поле рельефа: `blend` — общий для площадки (`relief.plain`),
 * отметка — собранное на данный момент поле (террасы ставятся ДО нормализации
 * домов, поэтому пол корпуса берётся из уже выровненного поля).
 */
function addDistrictPads(relief, rawBuildings, rawRoads) {
  // `blend` вставляется ПЕРЕД `yaw`: порядок ключей записи доходит до модуля
  // главы, и иная сборка (spread в конец) сдвигает его после `yaw` — глава 12
  // перестаёт сходиться с закоммиченным модулем побайтово.
  relief.addPads(districtTerraces(rawBuildings, rawRoads, (x, z) => relief.fieldAt(x, z))
    .map(({ yaw, ...pad }) => ({ ...pad, blend: relief.plain.blend, yaw })));
}

/**
 * Терраса района: одна площадка на все лоты генератора, а не по островку под
 * каждым домом. 357 корпусов на склоне дают 357 плоских пятачка, чьи кольца
 * перекрывают друг друга, и поле после третьей подгонки расходится с пределом
 * в разы (замер — `probe/relief-scale.mjs`: 1,16 м/м при пределе 0,12 и 5,6 с
 * нормализации). Район же, по просьбе владельца, стоит на возвышенности **целиком**
 * — значит выравнивать надо его квартал, а не каждый фундамент.
 *
 * План террасы — союз планов лотов **и полотен улиц** района: улица между
 * последним домом и границей блока остаётся кварталом, и оставь её вне ядра, как
 * она ляжет на переходное кольцо, где одна плоскость настила не удерживает поле
 * (замер — `probe/stage6n.mjs`).
 *
 * Косой район (`districtFrame` у записей генератора) меряется в **своих осях**:
 * габарит лотов в мировых координатах — AABB повёрнутого квартала, он больше
 * самого квартала в (|cos|+|sin|) раз (у 18° — на 20 %, у 45° — в 1,41) и
 * накрыл бы площадкой чужие улицы и дома. Поэтому лоты разворачиваются кадром
 * района, их союз считается там же, а в мир уходят центр террасы и `yaw` — тот
 * же уговор, что у пластины настила и повёрнутой площадки дома (`padWeight`
 * разворачивает точку кадром площадки, то есть rect задаётся локально).
 *
 * Порядок групп = порядок записей в брифе, поэтому поле детерминировано.
 *
 * Террасы — **одна арифметика для парсера и генератора** (правило про
 * `roadRectsOf` в AGENTS.md): съезд трассы (глава 13) обязан привести нос на
 * полотно, отметку которого посчитает нормализатор, а та равна `y` террасы плюс
 * `J.streetRise` — внутри площадки поле постоянно, поэтому и `fieldAcross`
 * (корыто пластины), и хорда прогона дают одно число, и предсказание носа
 * сходится с собранной главой без предупреждения. Переписать union во второй раз
 * в `tools/city.js` значило бы разъехаться с парсером при первой же правке.
 *
 * @param {object[]} buildings записи брифа (терраса — только у районов, то есть
 *   у корпусов со служебным полем `district`)
 * @param {object[]} roads записи брифа (полотна улиц того же района входят в ядро
 *   террасы, см. выше)
 * @param {(x:number,z:number)=>number} levelAt отметка поля в центре террасы
 * @returns {object[]} площадки без `blend` — его добавляет вызывающий
 */
export function districtTerraces(buildings, roads, levelAt) {
  const groups = new Map();
  for (const b of buildings) {
    if (!b.district) continue;
    let g = groups.get(b.district);
    if (!g) {
      g = {
        minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity,
        frame: b.districtFrame ? frameAt(b.districtFrame.cx, b.districtFrame.cz, b.districtFrame.yaw) : null,
      };
      groups.set(b.district, g);
    }
    const f = g.frame;
    for (const p of b.footprint ?? []) {
      const q = f ? unrotatePoint(f, p.x, p.z) : p;
      if (q.x < g.minX) g.minX = q.x;
      if (q.x > g.maxX) g.maxX = q.x;
      if (q.z < g.minZ) g.minZ = q.z;
      if (q.z > g.maxZ) g.maxZ = q.z;
    }
  }
  // Полотна улиц — та же площадь квартала, что и фундаменты: асфальт обязан
  // лежать в **ядре** террасы, а не на её переходном кольце. Терраса по одному
  // союзу корпусов оставляет улицы между блоками на склоне перехода, и тогда
  // плоскость перекрёстка либо проваливается под грунт, либо горбит над ним
  // (замер: разброс поля в 12-метровом квадрате `b_x0_0` — 0,728 м, то есть
  // горб того же размера посреди улицы). Пластина лежит в мировых осях (`yaw` —
  // мировая ориентация), поэтому в локальные оси района её центр и угол
  // разворачиваются тем же кадром, что и планы лотов.
  for (const r of roads) {
    const g = r.district === undefined ? null : groups.get(r.district);
    if (!g) continue;
    const f = g.frame;
    for (const el of r.elements ?? []) {
      const p = el.plate;
      if (!p) continue;
      const q = f ? unrotatePoint(f, p.x, p.z) : p;
      const rad = ((p.yaw ?? 0) - (f ? f.deg : 0)) * DEG;
      const c = Math.abs(Math.cos(rad)), s = Math.abs(Math.sin(rad));
      const hx = c * p.length / 2 + s * p.width / 2;
      const hz = s * p.length / 2 + c * p.width / 2;
      if (q.x - hx < g.minX) g.minX = q.x - hx;
      if (q.x + hx > g.maxX) g.maxX = q.x + hx;
      if (q.z - hz < g.minZ) g.minZ = q.z - hz;
      if (q.z + hz > g.maxZ) g.maxZ = q.z + hz;
    }
  }
  const pads = [];
  for (const [id, g] of groups) {
    const hx = (g.maxX - g.minX) / 2, hz = (g.maxZ - g.minZ) / 2;
    const centre = g.frame
      ? rotatePoint(g.frame, (g.minX + g.maxX) / 2, (g.minZ + g.maxZ) / 2)
      : { x: (g.minX + g.maxX) / 2, z: (g.minZ + g.maxZ) / 2 };
    pads.push({
      id: `${id}:терраса`,
      // центр rect'а — его же мировая точка покоя: `padWeight` разворачивает
      // пробу вокруг **центра прямоугольника**, поэтому полуоси берутся из
      // локального габарита района, а середина — из мира. Смещение центра в
      // локальных осях уехало бы от квартала на sin·диагональ.
      minX: r3(centre.x - hx), maxX: r3(centre.x + hx),
      minZ: r3(centre.z - hz), maxZ: r3(centre.z + hz),
      y: r3(levelAt(centre.x, centre.z)),
      yaw: g.frame ? r3(g.frame.deg) : undefined,
    });
  }
  return pads;
}

/**
 * Площадка корпуса под каждым домом: план — габарит footprint в собственных
 * осях дома, отметка — его `baseY`, поворот — его `rotation`. Повёрнутый дом без
 * повёрнутой площадки давал бы площадку-габарит, а под её углом склон торчал бы
 * из-под пола.
 */
function addHousePads(relief, buildings) {
  relief.addPads(buildings.map(b => ({
    id: `${b.id}:площадка`,
    minX: r3(b.bounds.minX), maxX: r3(b.bounds.maxX),
    minZ: r3(b.bounds.minZ), maxZ: r3(b.bounds.maxZ),
    y: b.baseY,
    blend: relief.plain.blend,
    yaw: b.rotation ?? undefined,
  })));
}

/**
 * Ширина перехода площадки из предела уклона **поля**: пробуем кольцо по
 * offset-контуру на трёх долях перехода (там и пик производной smoothstep, и
 * своя разность отметок с природой), меряем фактический градиент пробным полем с
 * этой же площадкой и раздуваем кольцо пропорционально тому, во сколько раз он
 * круче предела. Повтор 2–4 шага: слагаемая холма кольцо не трогает, а вклад
 * площадки падает как 1/blend.
 *
 * По пробое, а не по формуле `|Δ| / maxSlope`, — потому что итоговый уклон это
 * сумма attenuated-склона холма и перехода площадки, и формула, считавшая только
 * разницу отметок, давала бы на переходе 1,5 · maxSlope (производная smoothstep
 * на середине кольца), то есть ровно тот склон, который поле держать не должно.
 */
function fitPadBlend(p, spec, maxSlope, others = []) {
  let blend = p.blend;
  for (let i = 0; i < 6; i++) {
    const trial = reliefOf({
      baseY: spec.baseY, hills: spec.hills, cell: spec.cell,
      pads: [...others, { ...p, blend }],
    });
    const slope = ringSlope({ ...p, blend }, trial);
    if (slope <= maxSlope * 1.02 || blend >= J.relief.maxBlend) break;
    blend = Math.min(blend * Math.max(slope / maxSlope, 1.2), J.relief.maxBlend);
  }
  p.blend = r3(blend);
}

/**
 * Пробные точки кольца: offset-контур площадки (четыре стороны плюс четверти
 * окружности по углам) на трёх долях перехода. Доля, а не одно расстояние, —
 * потому что максимум суммарного градиента `(1−w)·∇природа + Δ·∇w` лежит не
 * ровно на середине кольца: там пик производной веса, но природа и разность
 * отметок меняются вдоль контура, и их сумма сдвигается к 0,4–0,7 `blend`.
 *
 * Контур, а не «середины сторон раздутого прямоугольника»: вершина угла стоит на
 * `d·√2` вне кольца, её вес нулевой, и ложный ноль уклона в самой опасной точке
 * площадки (угол террасы, нависающий над флангом) провалился бы в поле.
 */
function ringProbes(p, blend, frame) {
  const out = [];
  const push = (x, z) => out.push(frame ? rotatePoint(frame, x, z) : { x, z });
  for (const fraction of [0.4, 0.55, 0.7]) {
    const d = blend * fraction;
    const nx = Math.max(2, Math.min(6, Math.ceil((p.maxX - p.minX) / d)));
    const nz = Math.max(2, Math.min(6, Math.ceil((p.maxZ - p.minZ) / d)));
    for (let i = 0; i <= nx; i++) {
      const z = p.minZ + (p.maxZ - p.minZ) * (i / nx);
      push(p.minX - d, z);
      push(p.maxX + d, z);
    }
    for (let i = 1; i < nz; i++) {
      const x = p.minX + (p.maxX - p.minX) * (i / nz);
      push(x, p.minZ - d);
      push(x, p.maxZ + d);
    }
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const cx = sx < 0 ? p.minX : p.maxX;
        const cz = sz < 0 ? p.minZ : p.maxZ;
        for (const t of [0.25, 0.5, 0.75]) {
          const a = (Math.PI / 2) * t;
          push(cx + sx * d * Math.cos(a), cz + sz * d * Math.sin(a));
        }
      }
    }
  }
  return out;
}

// ------------------------------------------------------------------- предметы и опоры

/**
 * Функция опоры по плану: верх настила дороги, если точка в его прямоугольнике
 * (у наклонного пролёта — отметка наклонной плоскости под этой точкой), иначе низ
 * перекрытия первого этажа здания (baseY), иначе дно русла, иначе **местность** —
 * `relief.heightAt` там, где рельеф задан, и плоскость `ground.y` там, где нет.
 * Предмет, поставленный на отметку ниже своей опоры, утонул бы в асфальте, а
 * выше — висел.
 *
 * Дно русла старше поля: холм, пересечённый рекой, под водой не стоит, и опора
 * там, где грунт вырезан, обязана быть отметкой дна.
 */
function makeSupport(ground, roads, buildings, water) {
  const plates = roads.flatMap(r => r.decks);
  const plots = buildings.map(b => ({ box: buildingBox(b), y: b.baseY }));
  return (x, z) => {
    let y = water ? (water(x, z) ?? landY(ground, x, z)) : landY(ground, x, z);
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
    // подъём линеен по длине дуги, то есть по углу; крен — по отступу от осевой и
    // по углу же (у торцов он ноль, поэтому стык с прямым настилом горизонтален)
    return d.y0 + (d.y1 - d.y0) * delta / span
      + deckBankAt(d, d.a0 * DEG + delta) * (Math.hypot(dx, dz) - d.R);
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
function checkPoints(gp, buildings, roads, channels, warnings, relief) {
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
  if (gp.exit && !relief && !onSomething(gp.exit.x, gp.exit.z)) {
    // Своя местность тоже держит точку: поле непрерывно и ограничено уклоном,
    // поэтому маяк на открытом склоне главы с рельефом стоит на земле, а не
    // висит над ней — «не над настилом» было бы ложным предупреждением
    warnings.push(`gameplay.exit ${gp.exit.x}, ${gp.exit.z}: не над зданием и не над настилом — маяк повиснет`);
  }
}

/**
 * Точки стоянок едут в модуль округлёнными и с явным нулевым углом.
 *
 * `y` — отметка опоры под точкой, посчитанная тем же `makeSupport`, что ставит
 * на место предметы района: движок не ищет полотно под машиной, он берёт её
 * отметку из данных. Искать ему нечем — `groundHeightAt` отвечает высшую опору
 * **не выше** своей отметки, поэтому проба с 250 м посадила бы машину на кровлю
 * башни, под которой проходит эстакада, а проба с нуля оставила бы её под
 * настилом петли, на грунте.
 */
function authoredCars(cars, support) {
  return {
    count: cars.count,
    spots: (cars.spots ?? []).map(s => ({
      x: r3(s.x), z: r3(s.z), yaw: r3(s.yaw ?? 0), y: support(s.x, s.z),
    })),
  };
}

/**
 * Запас от точки до кромки полотна, поперёк настила: отрицательный — точка
 * снаружи. У дуги поперёк — это радиус, у пластины — её собственная координата
 * `v`: габарит дуги (`arcBounds`) для этого не годится, в его углу асфальта нет,
 * и корпус, выставленный по габариту, висел бы над водой там, где схема видела бы
 * «настил».
 */
function deckSideMargin(d, x, z) {
  if (d.arc) return d.halfW - Math.abs(Math.hypot(x - d.cx, z - d.cz) - d.R);
  const frame = deckFrame(d);
  if (!frame) return d.width / 2 - Math.abs(z - (d.minZ + d.maxZ) / 2);
  return d.width / 2 - Math.abs(unrotatePoint(frame, x, z).z - d.cz);
}

/**
 * Проверка точек стоянок: корпус обязан целиком остаться на том настиле, что его
 * держит, и не встать в русло. Идёт по нормализованным декам, а не по планам
 * брифа, — именно здесь у дуги есть `R` с `halfW`, а у пластины её кадр.
 *
 * Почему именно поперёк: вдоль оси настил продолжается соседним элементом или
 * уходит в стык, куда машина въедет сама, а вот за кромкой лежит или вода, или
 * перила (на мосту они стоят в 0,12 м от асфальта), и корпус, легший через
 * кромку, нельзя ни открыть с улицы, ни оставить внутри — игрок выходил бы из
 * машины в ограждение.
 *
 * Точка на голом грунте не бракуется: плита мира держит её и без настила, и
 * машина в траве — воля автора, а не обещанная опора, которой нет.
 */
function checkCars(gp, roads, channels, warnings) {
  const spots = gp.cars?.spots ?? [];
  if (!spots.length) return;
  const halfL = CONFIG.car.length / 2, halfW = CONFIG.car.width / 2;
  const inWater = (x, z) => channels.some(c => c.holes.some(h => inRect(x, z, h)));
  for (const [n, p] of spots.entries()) {
    const label = `gameplay.cars.spots[${n}] (${p.x}, ${p.z})`;
    let deck = null, roadId = null;
    for (const r of roads) {
      const hit = r.decks.find(d => deckHolds(d, p.x, p.z));
      if (hit) { deck = hit; roadId = r.id; break; }
    }
    if (!deck) {
      if (inWater(p.x, p.z)) {
        warnings.push(`${label}: в русле, вне настила — машина встанет в воду, и сесть в неё с улицы нельзя`);
      }
      continue;
    }
    const frame = frameAt(p.x, p.z, p.yaw ?? 0);
    let worst = Infinity;
    for (const [du, dv] of [[-halfL, -halfW], [halfL, -halfW], [-halfL, halfW], [halfL, halfW]]) {
      const w = rotatePoint(frame, p.x + du, p.z + dv);
      worst = Math.min(worst, deckSideMargin(deck, w.x, w.z));
    }
    if (worst < 0) {
      warnings.push(`${label}: корпус на ${(-worst).toFixed(2)} м вышел за кромку настила ${roadId} `
        + `(полоса ${deck.width} м) — борт машины там, где асфальта нет: за ним перила или вода`);
    }
  }
}

function worldBounds(buildings, roads, channels, ground) {
  let out = { minX: -ground.size / 2, maxX: ground.size / 2, minZ: -ground.size / 2, maxZ: ground.size / 2 };
  for (const b of buildings) out = unionBounds(out, buildingBox(b));
  for (const r of roads) for (const d of r.decks) out = unionBounds(out, d);
  for (const c of channels) for (const h of c.holes) out = unionBounds(out, h);
  return rectOut(out);
}

export { normalizeBuilding, normalizeRoad, normalizeStair, normalizeWaterway, toWorld, edgeRect, inRect, stairRun };
