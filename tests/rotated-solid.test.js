/**
 * Автотесты ориентированной коробки в общем механизме твёрдых объёмов
 * (`src/solids.js`, `obb`) — фундамент v2 генератора города
 * (`docs/city-v2-plan.md`).
 *
 * Проверяется ровно то, из-за чего OBB вообще заводился: дом остаётся
 * прямоугольником **в своих осях**, а в мир ставится под углом к северу, и
 * коллизия обязана решать по его собственным граням, а не по габариту. Габарит
 * (AABB повёрнутой коробки) остаётся только broadphase'ом сетки-индекса: если
 * узкая фаза начнёт мерить им, вокруг косого дома вырастут невидимые башни —
 * тот самый фантом, который AGENTS запрещает для внешнего ассета.
 *
 * Запуск в браузере (через консоль страницы игры, где есть importmap):
 *   const m = await import('/tests/rotated-solid.test.js?v=1');
 *   m.runRotatedSolidTests();
 *
 * Независимая арифметика (расстояние до коробки и «точка внутри» считаются в
 * тесте сами, не вызывая метод карты) — единственная защита от того, чтобы
 * ошибочный знак поворота не проверялся самим же собой.
 *
 * Проверяются сценарии:
 *   1. yaw = 0 совпадает с обычным AABB (луч, опора, выталкивание) в пределах 1e-9;
 *   2. луч к косой стене с 24 азимутов попадает на аналитическое расстояние;
 *   3. нормаль удара — одна из локальных осей стены, повёрнутых на её же угол;
 *   4. сфера у косой стены выталкивается вдоль её нормали, а не по оси мира;
 *   5. сфера внутри коробки выходит через ближайшую **локальную** грань;
 *   6. после выталкивания сфера не пересекает точную коробку (30 посадок);
 *   7. точка в габарите, но вне повёрнутой плиты — не опора (фантома нет);
 *   8. опорная плита под 30° держит ногу внутри и отпускает снаружи;
 *   9. `rayHitDistance` тормозит о косую стену в интервале пробы габарита
 *      (0,18 м) и шага марша (0,6 м) от точного входа;
 *  10. `bodyClearLine` бракует отрезок сквозь косую стену и отпускает вдоль неё.
 */
import {
  SolidField, circleHitsBox, pointHitsBox,
} from '../src/solids.js';
import { CONFIG } from '../src/config.js';
import { parseLevelFilter, SKIPPED } from './level-filter.js';

const DEG = Math.PI / 180;
const YAW = 30 * DEG;

/** Плита/стена 10 × 6 м (полуоси 5 × 3) с центром в (cx, cz), повёрнута на yaw. */
function obox(cx, cz, hx, hz, yaw, y0, y1) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  return {
    minX: cx - (hx * Math.abs(c) + hz * Math.abs(s)),
    maxX: cx + (hx * Math.abs(c) + hz * Math.abs(s)),
    minZ: cz - (hx * Math.abs(s) + hz * Math.abs(c)),
    maxZ: cz + (hx * Math.abs(s) + hz * Math.abs(c)),
    minY: y0, maxY: y1,
    obb: { cx, cz, hx, hz, c, s },
  };
}

/** Та же коробка без поворота — обычный AABB-путь. */
function aabb(cx, cz, hx, hz, y0, y1) {
  return {
    minX: cx - hx, maxX: cx + hx, minZ: cz - hz, maxZ: cz + hz, minY: y0, maxY: y1,
  };
}

/** Поле из готовых солидов и опор: индексы те, что у настоящих карт. */
function field(solids, surfaces, bucket = 4) {
  const f = new SolidField(bucket);
  for (const s of solids) f.solids.push(s);
  for (const s of surfaces) f.surfaces.push(s);
  f.indexSolids();
  f._indexSurfaces();
  return f;
}

// --------------------------------------------- независимая арифметика для сверки

/** Локальные координаты точки плана относительно коробки (тот же поворот, что в тесте). */
function local(b, x, z) {
  const o = b.obb, dx = x - o.cx, dz = z - o.cz;
  return [dx * o.c + dz * o.s, -dx * o.s + dz * o.c];
}

/** Точка внутри повёрнутой коробки? — своим ходом, без методов карты. */
function inside(b, x, y, z) {
  const [lx, lz] = local(b, x, z);
  return Math.abs(lx) <= b.obb.hx && Math.abs(lz) <= b.obb.hz && y >= b.minY && y <= b.maxY;
}

/** Расстояние от точки до поверхности повёрнутой коробки. */
function distTo(b, x, y, z) {
  const o = b.obb;
  const [lx, lz] = local(b, x, z);
  const qx = Math.max(Math.abs(lx) - o.hx, 0);
  const qz = Math.max(Math.abs(lz) - o.hz, 0);
  const qy = Math.max(y - b.maxY, b.minY - y, 0);
  if (qx === 0 && qz === 0 && qy === 0) return -Math.min(o.hx - Math.abs(lx), o.hz - Math.abs(lz), b.maxY - y, y - b.minY);
  return Math.hypot(qx, qz, qy);
}

/**
 * Аналитическое расстояние вдоль луча до повёрнутой коробки: перенос луча в
 * локальные оси и решение трёх пар слэбов — но независимо от `_slabs` карты,
 * чтобы проверка не сводилась к «сравнили функцию с самой собой».
 */
function rayToBox(b, ox, oy, oz, dx, dy, dz) {
  const o = b.obb;
  const lox = (ox - o.cx) * o.c + (oz - o.cz) * o.s;
  const loz = -(ox - o.cx) * o.s + (oz - o.cz) * o.c;
  const ldx = dx * o.c + dz * o.s, ldz = -dx * o.s + dz * o.c;
  const slab = (p, d, lo, hi) => {
    if (Math.abs(d) < 1e-12) return p >= lo && p <= hi ? [-Infinity, Infinity] : null;
    let t1 = (lo - p) / d, t2 = (hi - p) / d;
    if (t1 > t2) [t1, t2] = [t2, t1];
    return [t1, t2];
  };
  const X = slab(lox, ldx, -o.hx, o.hx);
  const Y = slab(oy, dy, b.minY, b.maxY);
  const Z = slab(loz, ldz, -o.hz, o.hz);
  if (!X || !Y || !Z) return null;
  const tmin = Math.max(X[0], Y[0], Z[0]), tmax = Math.min(X[1], Y[1], Z[1]);
  if (tmax < tmin || tmax < 0) return null;
  return tmin > 0 ? tmin : 0;
}

// ------------------------------------------------------------------- сценарии

/** 1. yaw = 0 обязан совпасть с обычным AABB: та же карта, разные записи поля. */
function testYawZeroEqualsAabb() {
  const rot = field([obox(20, 20, 5, 3, 0, 0, 4)], [], 4);
  const axis = field([aabb(20, 20, 5, 3, 0, 4)], [], 4);
  let maxRay = 0, maxPush = 0;
  for (let a = 0; a < 16; a++) {
    const t = a / 16 * Math.PI * 2;
    const ox = 20 + Math.cos(t) * 40, oz = 20 + Math.sin(t) * 40;
    const dx = (20 - ox) / Math.hypot(20 - ox, 20 - oz), dz = (20 - oz) / Math.hypot(20 - ox, 20 - oz);
    const r1 = rot.raySolid(ox, 2, oz, dx, 0, dz, 60);
    const r2 = axis.raySolid(ox, 2, oz, dx, 0, dz, 60);
    maxRay = Math.max(maxRay, Math.abs(r1.dist - r2.dist), Math.abs(r1.nx - r2.nx), Math.abs(r1.nz - r2.nz));
  }
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * Math.PI * 2;
    const c1 = { x: 20 + Math.cos(a) * 6.2, y: 2, z: 20 + Math.sin(a) * 4.4 };
    const c2 = { ...c1 };
    rot.resolveSphere(c1, 0.4);
    axis.resolveSphere(c2, 0.4);
    maxPush = Math.max(maxPush, Math.abs(c1.x - c2.x), Math.abs(c1.y - c2.y), Math.abs(c1.z - c2.z));
  }
  const passed = maxRay < 1e-9 && maxPush < 1e-9;
  return {
    name: 'yaw = 0 совпадает с обычным AABB: луч, выталкивание',
    passed,
    info: `расхождение луча ${maxRay.toExponential(1)} м, выталкивания ${maxPush.toExponential(1)} м (порог 1e-9)`,
  };
}

/** 2. Луч к косой стене с разных азимутов — на аналитическое расстояние. */
function testRayHitsRotatedWall() {
  const b = obox(0, 0, 5, 3, YAW, 0, 4);
  const f = field([b], [], 4);
  let worst = 0, misses = 0;
  for (let a = 0; a < 24; a++) {
    const t = a / 24 * Math.PI * 2;
    const ox = Math.cos(t) * 30, oz = Math.sin(t) * 30;
    const dx = -ox / 30, dz = -oz / 30;
    const hit = f.raySolid(ox, 2, oz, dx, 0, dz, 40);
    const want = rayToBox(b, ox, 2, oz, dx, 0, dz);
    if (!hit || want === null) { if ((hit ? 1 : 0) !== (want === null ? 0 : 1)) misses++; continue; }
    worst = Math.max(worst, Math.abs(hit.dist - want));
  }
  const passed = misses === 0 && worst < 1e-6;
  return {
    name: 'Луч к косой стене попадает на аналитическое расстояние',
    passed,
    info: `24 азимута, наибольшее расхождение ${worst.toExponential(1)} м, промахов ${misses}`,
  };
}

/** 3. Нормаль удара — локальная ось стены, повёрнутая на её же угол. */
function testNormalIsWallAxis() {
  const b = obox(0, 0, 5, 3, YAW, 0, 4);
  const f = field([b], [], 4);
  const axes = [[Math.cos(YAW), Math.sin(YAW)], [-Math.sin(YAW), Math.cos(YAW)]];
  let bad = 0, unit = 0;
  const hits = [];
  for (let a = 0; a < 24; a++) {
    const t = a / 24 * Math.PI * 2;
    const ox = Math.cos(t) * 30, oz = Math.sin(t) * 30;
    const hit = f.raySolid(ox, 2, oz, -ox / 30, 0, -oz / 30, 40);
    if (!hit) continue;
    hits.push([+hit.nx.toFixed(2), +hit.nz.toFixed(2)]);
    if (Math.abs(Math.hypot(hit.nx, hit.ny, hit.nz) - 1) > 1e-9) unit++;
    // луч целился в центр, поэтому попал в ближайшую грань: угол между ним и
    // нормалью ≤ 45°, иначе это не нормаль той грани, что держит удар
    const dot = Math.abs(hit.nx * (-ox / 30) + hit.nz * (-oz / 30));
    if (dot < 0.5) bad++;
    // нормаль обязана лежать НА одной из локальных осей, повёрнутых на yaw
    const onAxis = axes.some(([ax, az]) => Math.abs(hit.nx * az - hit.nz * ax) < 1e-9);
    if (!onAxis) bad++;
  }
  const passed = hits.length >= 20 && bad === 0 && unit === 0 && new Set(hits.map(h => h.join(','))).size >= 4;
  return {
    name: 'Нормаль удара — локальная ось стены, повёрнутая на её угол',
    passed,
    info: `ударов ${hits.length}, разных нормалей ${new Set(hits.map(h => h.join(','))).size}, вне локальной оси ${bad}, не единичные ${unit}`,
  };
}

/** 4. Сфера у косой стены выталкивается вдоль нормали стены, а не по оси мира. */
function testPushOutAlongWallNormal() {
  const b = obox(0, 0, 5, 3, YAW, 0, 4);
  const f = field([b], [], 4);
  const r = CONFIG.radius;
  // точка снаружи у грани, у которой локальная нормаль — ось X коробки
  const o = b.obb;
  const [wx, wz] = [o.cx + o.hx * o.c, o.cz + o.hx * o.s];
  const start = { x: wx + (r - 0.1) * o.c, y: 2, z: wz + (r - 0.1) * o.s };
  const c = { ...start };
  const moved = f.resolveSphere(c, r);
  const shift = Math.hypot(c.x - start.x, c.z - start.z);
  // направление сдвига обязано совпасть с нормалью стены (0,0): косинус ≈ 1
  const dot = shift > 1e-9
    ? ((c.x - start.x) * o.c + (c.z - start.z) * o.s) / shift : 0;
  const d = distTo(b, c.x, c.y, c.z);
  const passed = moved && Math.abs(d - r) < 1e-6 && dot > 0.999;
  return {
    name: 'Сфера у косой стены выталкивается вдоль её нормали, а не по оси мира',
    passed,
    info: `сдвиг ${shift.toFixed(3)} м, расстояние до стены после ${d.toFixed(3)} м (радиус ${r}), совпадение с нормалью ${dot.toFixed(4)}`,
  };
}

/** 5. Сфера внутри коробки выходит через ближайшую локальную грань. */
function testPushOutInsideNearestFace() {
  const b = obox(0, 0, 5, 3, YAW, 0, 4);
  const f = field([b], [], 4);
  // центр придавлен к грани +Z (0,25 м породы до неё), а до пола, потолка и
  // стены X дальше — значит выйти обязан именно туда, по нормали своей оси
  const [lx, lz] = [0.5, 2.75];
  const o = b.obb;
  const [wx, wz] = [o.cx + lx * o.c - lz * o.s, o.cz + lx * o.s + lz * o.c];
  const c = { x: wx, y: 2, z: wz };
  const moved = f.resolveSphere(c, 0.4);
  const [nlx, nlz] = local(b, c.x, c.z);
  const d = distTo(b, c.x, c.y, c.z);
  // сдвиг в мире обязан лечь на повёрнутую нормаль локальной Z-грани: (-s, c)
  const shiftX = c.x - wx, shiftZ = c.z - wz;
  const shift = Math.hypot(shiftX, shiftZ);
  const alongNormal = shift > 1e-9 ? (shiftX * -o.s + shiftZ * o.c) / shift : 0;
  const passed = moved && inside(b, wx, 2, wz) === true && Math.abs(d - 0.4) < 1e-6
    && Math.abs(nlz - (o.hz + 0.4)) < 1e-6 && Math.abs(nlx - lx) < 1e-6 && c.y === 2
    && alongNormal > 0.999;
  return {
    name: 'Сфера внутри коробки выходит через ближайшую локальную грань',
    passed,
    info: `вышла ${moved}, локальные (${nlx.toFixed(2)}, ${nlz.toFixed(2)}) при полуосях (${o.hx}, ${o.hz}) и y ${c.y}, расстояние ${d.toFixed(3)} м, совпадение с нормалью грани ${alongNormal.toFixed(4)}`,
  };
}

/** 6. После выталкивания сфера не пересекает точную коробку — 30 посадок вокруг. */
function testSphereNeverInside() {
  const b = obox(0, 0, 5, 3, YAW, 0, 4);
  const f = field([b], [], 4);
  let overlap = 0, worstPen = 0;
  for (let i = 0; i < 30; i++) {
    const t = i / 30 * Math.PI * 2;
    const rad = 0.5 + (i % 5) * 0.7;
    const c = { x: Math.cos(t) * rad * 6, y: 2, z: Math.sin(t) * rad * 4 };
    f.resolveSphere(c, 0.4);
    const d = distTo(b, c.x, c.y, c.z);
    if (d < 0.4 - 1e-6) { overlap++; worstPen = Math.max(worstPen, 0.4 - d); }
  }
  const passed = overlap === 0;
  return {
    name: 'После выталкивания сфера не пересекает точную коробку (30 посадок)',
    passed,
    info: `пересечений ${overlap}, худшее погружение ${worstPen.toFixed(4)} м`,
  };
}

/** 7. Точка в габарите, но вне повёрнутой плиты — не опора: фантома нет. */
function testNoPhantomSupportFromBounds() {
  const b = obox(0, 0, 5, 3, YAW, 0, 0.2);
  b.y = 0.2;
  const f = field([], [b], 4);
  // угол габарита: внутрь AABB попадает, наружу OBB — нет
  const corner = { x: b.minX + 0.05, z: b.minZ + 0.05 };
  const inBounds = corner.x >= b.minX && corner.x <= b.maxX && corner.z >= b.minZ && corner.z <= b.maxZ;
  const yCorner = f.groundHeightAt(corner.x, corner.z, 0);
  const center = f.groundHeightAt(0, 0, 0);
  const passed = inBounds && yCorner === 0 && center === 0.2 && !pointHitsBox(corner.x, corner.z, b);
  return {
    name: 'Точка в габарите, но вне повёрнутой плиты — не опора',
    passed,
    info: `угол габарита (${corner.x.toFixed(2)}, ${corner.z.toFixed(2)}): опора ${yCorner} при центре ${center}`,
  };
}

/** 8. Опорная плита под 30° держит ногу внутри и отпускает снаружи. */
function testRotatedPlateSupport() {
  const b = obox(0, 0, 5, 3, YAW, 0, 0.2);
  b.y = 0.2;
  const f = field([], [b], 4);
  // сетка по всему **габариту** плиты: каждая точка попадает в broadphase
  // сетки-индекса, поэтому решение отдаёт только узкая фаза. Точка внутри
  // габарита, но снаружи повёрнутой плиты, обязана остаться без опоры —
  // иначе косой дом окружит невидимая площадка (запрещённый фантом).
  let insideOk = 0, insideWant = 0, outsideOk = 0, outsideBad = 0;
  const N = 21;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const x = b.minX + (i / (N - 1)) * (b.maxX - b.minX);
      const z = b.minZ + (j / (N - 1)) * (b.maxZ - b.minZ);
      const want = pointHitsBox(x, z, b);
      const got = f.groundHeightAt(x, z, 0);
      if (want) { insideWant++; if (Math.abs(got - 0.2) < 1e-9) insideOk++; } else if (got === 0) outsideOk++; else outsideBad++;
    }
  }
  const edge = f.groundHeightAt(Math.cos(YAW) * 5, Math.sin(YAW) * 5, 0);
  const passed = insideOk === insideWant && insideWant >= 100 && outsideBad === 0 && edge === 0.2;
  return {
    name: 'Опорная плита под 30° держит ногу внутри и отпускает снаружи',
    passed,
    info: `сетка ${N}×${N} по габариту: внутри ${insideOk}/${insideWant} с опорой, снаружи габарита без неё ${outsideOk}, ложных опор ${outsideBad}, на ребре ${edge}`,
  };
}

/** 9. Маршевый луч тормозит о косую стену там же, где точный луч. */
function testMarchDistanceMatches() {
  const b = obox(0, 0, 5, 3, YAW, 0, 4);
  class Blocked extends SolidField {
    constructor() { super(4); this.solids.push(b); this.indexSolids(); }
    isBlocked(x, z, radius = CONFIG.radius, feetY = 0) {
      if (circleHitsBox(x, z, b, radius)) return true;
      return feetY < b.minY || feetY > b.maxY ? false : pointHitsBox(x, z, b);
    }
    groundHeightAt() { return 0; }
  }
  const f = new Blocked();
  // марш тормозит по пробе габарита 0,18 м, а не по самой поверхности: он
  // обязан остановиться не раньше, чем тело радиуса 0,18 коснулось бы стены
  // (для луча, целившегося в центр, угол к грани ≥ 45°, поэтому запас
  // 0,18/sin45° = 0,255 м), и не позже одного шага марша за входом.
  const early = 0.18 / Math.SQRT1_2;
  const step = 0.6;
  let worst = 0;
  for (let a = 0; a < 12; a++) {
    const t = a / 12 * Math.PI * 2;
    const ox = Math.cos(t) * 24, oz = Math.sin(t) * 24;
    const dirx = -ox / 24, dirz = -oz / 24;
    const march = f.rayHitDistance(ox, 2, oz, dirx, 0, dirz, 24);
    const want = rayToBox(b, ox, 2, oz, dirx, 0, dirz);
    if (want === null) continue;
    worst = Math.max(worst, want - early - march, march - (want + step));
  }
  const passed = worst < 1e-9;
  return {
    name: 'rayHitDistance тормозит о косую стену там же, где точный луч',
    passed,
    info: `12 азимутов, наибольшее отклонение от интервала [вход − ${early.toFixed(3)}, вход + ${step.toFixed(1)}] = ${worst.toExponential(1)} м`,
  };
}

/** 10. Отрезок сквозь косую стену бракуется, вдоль стены — свободен. */
function testBodyClearLineAgainstWall() {
  const b = obox(0, 0, 5, 3, YAW, 0, 4);
  class Blocked extends SolidField {
    constructor() { super(4); }
    isBlocked(x, z, radius = CONFIG.radius) { return circleHitsBox(x, z, b, radius); }
  }
  const f = new Blocked();
  const r = CONFIG.radius;
  // сквозь стену по нормали её локальной X-грани
  const o = b.obb;
  const through = f.bodyClearLine(
    { x: o.cx + 8 * o.c, y: 0, z: o.cz + 8 * o.s },
    { x: o.cx - 8 * o.c, y: 0, z: o.cz - 8 * o.s }, r, 1.7);
  // вдоль той же грани, снаружи на шаг ноги
  const along = f.bodyClearLine(
    { x: o.cx + o.hx * o.c - (o.hz + 1) * o.s, y: 0, z: o.cz + o.hx * o.s + (o.hz + 1) * o.c },
    { x: o.cx - o.hx * o.c - (o.hz + 1) * o.s, y: 0, z: o.cz - o.hx * o.s + (o.hz + 1) * o.c }, r, 1.7);
  const passed = through === false && along === true;
  return {
    name: 'bodyClearLine бракует отрезок сквозь косую стену и отпускает вдоль',
    passed,
    info: `сквозь стену ${through}, вдоль стены ${along} (радиус тела ${r})`,
  };
}

/**
 * Прогон сюиты: все проверки синхронные — чистая геометрия, без сцены и кадров.
 * @returns {{passed:number, total:number, results:Array<{name:string,passed:boolean,info:string}>}}
 */
export function runRotatedSolidTests(arg) {
  const filter = parseLevelFilter(arg);
  if (filter) return SKIPPED;
  const tests = [
    testYawZeroEqualsAabb, testRayHitsRotatedWall, testNormalIsWallAxis,
    testPushOutAlongWallNormal, testPushOutInsideNearestFace, testSphereNeverInside,
    testNoPhantomSupportFromBounds, testRotatedPlateSupport, testMarchDistanceMatches,
    testBodyClearLineAgainstWall,
  ];
  const results = [];
  for (const fn of tests) {
    try { results.push(fn()); }
    catch (e) { results.push({ name: fn.name, passed: false, info: `ошибка: ${e && e.message}` }); }
  }
  const passed = results.filter(r => r.passed).length;

  if (typeof console !== 'undefined') {
    console.group('Автотесты ориентированной коробки (v2)');
    for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'} — ${r.name}: ${r.info}`);
    console.log(`Итого: ${passed}/${results.length}`);
    console.groupEnd();
  }
  return { passed, total: results.length, results };
}
