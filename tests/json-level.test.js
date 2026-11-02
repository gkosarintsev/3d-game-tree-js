/**
 * Автотесты карты, собранной из брифа (JsonMap, глава 9).
 *
 * Проверяют то, чего в данных уровня не видно: опора обязана совпадать с
 * картинкой, перекрытие — иметь проём ровно там, где идёт марш, дверной проём —
 * быть свободным для габарита, а ребро графа — держаться ногами, а не только
 * лучом. Отдельная группа — марши: у каждого есть посадка на этаже, и ни одно
 * ребро не ведёт через проём перекрытия.
 *
 * Запуск в браузере (через консоль страницы игры, где есть importmap):
 *   const m = await import('/tests/json-level.test.js?v=1');
 *   await m.runJsonTests();
 *
 * Проверяются сценарии:
 *   1. Контракт карты закрыт полностью;
 *   2. Каркас из данных: дома, дороги, солиды, опоры, блокеры, граф непустые;
 *   3. Плита пола комнаты — опора своей отметки, а над маршем в ней проём;
 *   4. Стена держит габарит, дверной проём свободен, перемычка над проёмом — стена;
 *   5. Крыша — солид, но не опора: точка B лежит на полу последнего этажа;
 *   6. У каждого марша есть посадка внизу и вверху, и она связана с полом;
 *   7. Маршрут от точки A до точки B существует и кончается на этаже B;
 *   8. Маршрут физически проходим ногами: ни подъёма-стены, ни провала в проём;
 *   9. Каждое ребро графа держит опора вдоль всего отрезка;
 *  10. Граф — одна связная сеть без изолированных узлов;
 *  11. Настил эстакады твёрдый сверху и проходимый снизу, сход с него в графе;
 *  12. Подъём на эстакаду — единая наклонная плоскость: опора, луч, сфера и меш
 *      сходятся на ней, AABB внутри пролёта нет;
 *  13. Сфера тела входит на пролёт у его пятки и сходит с верхнего края: оба
 *      самоходных прогона доходят до цели и дают перепад больше метра;
 *  14. Со-плоскостных граней нет: пол комнаты выше своей отметки, картинка стены
 *      ниже кровли, а её коллизия достаёт до кровли;
 *  15. Насыпь держит габарит своим грунтом, а её откос — проходимый склон без
 *      невидимой коробки;
 *  16. Меш собирается без NaN-вершин, свет глав — из данных и в пределах пула;
 *  17. Миникарта рисует план без исключений;
 *  18. Свободные точки для объектов действительно свободны и опираются;
 *  19. Детерминизм: два сбора дают побитово равные отметки узлов.
 */
import * as THREE from 'three';
import { createJsonMap } from '../src/json-map.js';
import { LEVEL_09 } from '../src/levels/level-09.js';
import { CONFIG } from '../src/config.js';

const J = CONFIG.jsonMap;
const STEP = CONFIG.building.stepUp;
const PLAYER_H = CONFIG.eyeHeight + 0.35;

let built = null;

/** Карта с построенной геометрией: солиды, опоры и граф собраны (как в игре). */
function builtMap() {
  if (!built) {
    built = createJsonMap(LEVEL_09.map);
    built.build(new THREE.Scene());
  }
  return built;
}

function exitPoint(map) {
  const e = LEVEL_09.gameplay.exit;
  return { x: e.x, y: map.groundHeightAt(e.x, e.z, 500), z: e.z };
}

/**
 * Шагает по опорам от узла до узла шагом navEdgeProbe. Возвращает причину тупика
 * или null: подъём больше stepUp — стена, провал глубже navEdgeDrop — под ногой
 * пустота перекрытия, задержка габарита — перегородка.
 */
function walkEdge(map, from, to) {
  const len = Math.hypot(to.x - from.x, to.z - from.z);
  const steps = Math.max(1, Math.ceil(len / J.navEdgeProbe));
  let feet = from.y;
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const x = from.x + (to.x - from.x) * t;
    const z = from.z + (to.z - from.z) * t;
    const g = map.groundHeightAt(x, z, Math.max(feet, from.y));
    if (g - feet > STEP) return { x, z, reason: `подъём ${feet.toFixed(2)}→${g.toFixed(2)} — стена` };
    if (feet - g > J.navEdgeDrop) return { x, z, reason: `провал ${feet.toFixed(2)}→${g.toFixed(2)} — пустота под ребром` };
    feet = g;
    if (map.isBlocked(x, z, CONFIG.radius, feet + 0.02, PLAYER_H)) return { x, z, reason: 'габарит задерживает' };
  }
  if (to.y - feet > STEP) return { x: to.x, z: to.z, reason: `узел ${to.y.toFixed(2)} выше опоры ${feet.toFixed(2)}` };
  return null;
}

/** Все марши уровня парой (здание, марш). */
function allStairs(map) {
  const out = [];
  for (const b of map.buildings) for (const s of b.stairs) out.push([b, s]);
  return out;
}

/**
 * Индекс узла графа, ближайшего к точке (по плану). По вертикали допускается
 * шов плиты пола: узел стоит на её верху, а не на отметке комнаты.
 */
function nodeNear(map, p, radius = 0.6, vTol = J.floorRise + 0.02) {
  for (let i = 0; i < map.nav.pos.length; i++) {
    const q = map.nav.pos[i];
    if (Math.hypot(q.x - p.x, q.z - p.z) <= radius && Math.abs(q.y - p.y) <= vTol) return i;
  }
  return -1;
}

function testContract() {
  const map = builtMap();
  const fields = ['width', 'depth', 'spawn', 'bounds', 'solids'];
  const methods = ['groundHeightAt', 'isBlocked', 'openPositions', 'worldToNormalized',
    'build', 'drawMinimap', 'raySolid', 'resolveSphere', 'rayHitDistance', 'findPath',
    'randomNavPoint'];
  const missing = [...fields.filter(f => map[f] === undefined),
    ...methods.filter(m => typeof map[m] !== 'function')];
  return {
    name: 'Контракт карты закрыт (движок знает только его члены)',
    passed: missing.length === 0,
    info: missing.length ? `нет членов: ${missing.join(', ')}` : `${fields.length + methods.length} членов на месте`,
  };
}

function testBasics() {
  const map = builtMap();
  const b = LEVEL_09.map.buildings.length, r = LEVEL_09.map.roads.length;
  const ok = map.width === LEVEL_09.map.ground.size
    && map.buildings.length === b && map.roads.length === r
    && map.solids.length > 0 && map.surfaces.length > 0
    && map.blockers.length > 0 && map.nav.pos.length > 0
    && map.spawn.y === map.groundHeightAt(map.spawn.x, map.spawn.z, map.groundY);
  return {
    name: 'Каркас из данных: дома, дороги, солиды, опоры, блокеры, граф',
    passed: ok,
    info: `${b} домов, ${r} дорог, ${map.solids.length} солидов, ${map.surfaces.length} опор, `
      + `${map.blockers.length} блокирующих, ${map.nav.pos.length} узлов`,
  };
}

function testFloorPlateAndHole() {
  const map = builtMap();
  const hall = map.buildings.find(x => x.id === 'building_l').rooms.find(r => r.id === 'l_hall');
  const cx = (hall.rect.minX + hall.rect.maxX) / 2;
  const onFloor = Math.abs(map.groundHeightAt(cx, hall.rect.minZ + 2, hall.y) - (hall.y + J.floorRise)) <= 0.02;
  const bad = [];
  for (const [, s] of allStairs(map)) {
    const mx = (s.rect.minX + s.rect.maxX) / 2, mz = (s.rect.minZ + s.rect.maxZ) / 2;
    // плита верхнего этажа не имеет лежать на марше: над его серединой опоры
    // своего уровня нет (есть только ступени ниже)
    if (map.groundHeightAt(mx, mz, s.y1) >= s.y1 - 0.02) bad.push(s.id);
  }
  return {
    name: 'Плита пола — опора своей отметки, а над маршем в перекрытии проём',
    passed: onFloor && bad.length === 0,
    info: onFloor ? `пол на месте, проём без ${allStairs(map).length} маршей нарушен: ${bad.join(', ') || 'нет'}`
      : `пол комнаты не опирает свою отметку (её верх — ${(hall.y + J.floorRise).toFixed(2)})`,
  };
}

function testWallDoorLintel() {
  const map = builtMap();
  const door = map.buildings.flatMap(b => b.doors).find(d => d.linkType === 'main_entrance')
    ?? map.buildings.flatMap(b => b.doors)[0];
  const cx = (door.rect.minX + door.rect.maxX) / 2;
  const cz = (door.rect.minZ + door.rect.maxZ) / 2;
  // та же полоса стены в 1,5 м вдоль её оси — там проёма нет
  const [wx, wz] = door.axis === 'x' ? [cx + 1.5, cz] : [cx, cz + 1.5];
  const gap = map.isBlocked(cx, cz, CONFIG.radius, door.y, CONFIG.eyeHeight);
  const wall = map.isBlocked(wx, wz, CONFIG.radius, door.y, CONFIG.eyeHeight);
  const lintel = map.isBlocked(cx, cz, CONFIG.radius,
    door.y + (door.height ?? J.doorHeight) + 0.2, CONFIG.eyeHeight);
  return {
    name: 'Стена держит габарит, дверной проём свободен, перемычка над ним — стена',
    passed: !gap && wall && lintel,
    info: `проём ${gap ? 'задержан' : 'свободен'}, стена в 1,5 м ${wall ? 'держит' : 'не держит'}, `
      + `перемычка ${lintel ? 'держит' : 'простаивает'}`,
  };
}

function testRoofIsSolidNotSurface() {
  const map = builtMap();
  const exit = exitPoint(map);
  const b = map.buildings.find(x => x.id === 'building_l');
  const roof = map.raySolid(exit.x, 40, exit.z, 0, -1, 0, 60);
  const topFloor = b.baseY + b.floorHeight * (b.floorsCount - 1);
  const ok = !!roof && Math.abs(roof.y - b.roofY) < 0.05
    && exit.y > topFloor && exit.y - topFloor <= J.floorRise + 0.02 && exit.y < b.roofY;
  return {
    name: 'Крыша — солид, но не опора: точка B стоит на полу последнего этажа',
    passed: ok,
    info: `луч сверху бьёт в ${roof ? roof.y.toFixed(2) : 'пустоту'} м (крыша ${b.roofY}), `
      + `опора под B — ${exit.y.toFixed(2)} м (пол ${topFloor} + шов ${J.floorRise})`,
  };
}

function testStairLandings() {
  const map = builtMap();
  const bad = [];
  for (const [, s] of allStairs(map)) {
    for (const [end, level] of [[s.bottom, s.y0], [s.top, s.y1]]) {
      const tread = nodeNear(map, end, 1.2);
      // у крайней проступи должен быть сосед вне плана марша на отметке этажа —
      // это и есть посадка; без неё ребро ведёт через весь веер нижних ступеней
      const outside = tread < 0 ? [] : map.nav.adj[tread].filter(i => {
        const p = map.nav.pos[i];
        return Math.abs(p.y - level) <= J.floorRise + 0.02
          && (p.x < s.rect.minX || p.x > s.rect.maxX || p.z < s.rect.minZ || p.z > s.rect.maxZ);
      });
      if (!outside.length) bad.push(`${s.id} ${level === s.y0 ? 'низ' : 'верх'}`);
    }
  }
  const all = allStairs(map).length * 2;
  return {
    name: 'У каждого марша есть посадка внизу и вверху, и она связана с полом',
    passed: bad.length === 0,
    info: bad.length ? `нет посадки у: ${bad.join(', ')}` : `${all} концов маршей имеют сосед на этаже`,
  };
}

function testPathAtoB() {
  const map = builtMap();
  const exit = exitPoint(map);
  const path = map.findPath(map.spawn, exit);
  if (!Array.isArray(path)) return { name: 'Маршрут от точки A до точки B существует', passed: false, info: 'маршрута нет' };
  const last = path[path.length - 1];
  return {
    name: 'Маршрут от точки A до точки B существует',
    passed: Math.hypot(last.x - exit.x, last.z - exit.z) <= LEVEL_09.gameplay.exitRadius + 4
      && Math.abs(last.y - exit.y) <= 0.02,
    info: `${path.length} узлов, конец ${last.x.toFixed(1)}, ${last.y.toFixed(2)}, ${last.z.toFixed(1)}`,
  };
}

function testPathWalkable() {
  const map = builtMap();
  const exit = exitPoint(map);
  const path = map.findPath(map.spawn, exit);
  if (!Array.isArray(path)) return { name: 'Маршрут физически проходим ногами', passed: false, info: 'нет маршрута' };
  const pts = [map.spawn, ...path];
  for (let i = 0; i + 1 < pts.length; i++) {
    const fail = walkEdge(map, pts[i], pts[i + 1]);
    if (fail) {
      return {
        name: 'Маршрут физически проходим ногами: подъём и провал в пределах шага',
        passed: false,
        info: `ребро ${i} → ${i + 1} в ${fail.x.toFixed(2)}, ${fail.z.toFixed(2)}: ${fail.reason}`,
      };
    }
  }
  return {
    name: 'Маршрут физически проходим ногами: подъём и провал в пределах шага',
    passed: true,
    info: `${path.length} рёбер пройдены шагом по 0,5 м без тупиков`,
  };
}

function testEveryEdgeSupported() {
  const map = builtMap();
  const nav = map.nav;
  let edges = 0;
  const bad = [];
  for (let i = 0; i < nav.pos.length; i++) {
    for (const j of nav.adj[i]) {
      if (j <= i) continue;
      edges++;
      if (!map._edgeSupported(nav.pos[i], nav.pos[j])) {
        bad.push(`${i}→${j} (${nav.pos[i].y.toFixed(2)}→${nav.pos[j].y.toFixed(2)})`);
      }
    }
  }
  return {
    name: 'Каждое ребро графа держит опора вдоль всего отрезка',
    passed: bad.length === 0,
    info: bad.length ? `${bad.length} из ${edges} без опоры: ${bad.slice(0, 4).join(', ')}`
      : `${edges} рёбер имеют опору под каждой пробой`,
  };
}

function testOneConnectedNetwork() {
  const map = builtMap();
  const nav = map.nav;
  const start = nav.nearestNode(map.spawn.x, map.spawn.y, map.spawn.z);
  const seen = new Uint8Array(nav.pos.length);
  const q = [start];
  seen[start] = 1;
  for (let h = 0; h < q.length; h++) {
    for (const nb of nav.adj[q[h]]) if (!seen[nb]) { seen[nb] = 1; q.push(nb); }
  }
  const isolated = nav.adj.filter(a => !a.length).length;
  return {
    name: 'Граф — одна связная сеть без изолированных узлов',
    passed: q.length === nav.pos.length && isolated === 0,
    info: `${q.length} достижимо из ${nav.pos.length}, висящих без рёбер — ${isolated}`,
  };
}

function testBridgeDeck() {
  const map = builtMap();
  const bridge = map.roads.find(r => r.type === 'bridge');
  const deck = bridge.decks.find(d => d.topY > 6 && !d.ramp);
  const cx = (deck.minX + deck.maxX) / 2, cz = (deck.minZ + deck.maxZ) / 2;
  const top = map.raySolid(cx, 30, cz, 0, -1, 0, 40);
  const underPassable = !map.isBlocked(cx, cz, CONFIG.radius, map.groundY, CONFIG.eyeHeight);
  const climb = map.nav.pos.filter(p => Math.abs(p.y - deck.topY) < 0.02).length;
  return {
    name: 'Настил эстакады твёрдый сверху, под пролётом ходят, подъём есть в графе',
    passed: !!top && Math.abs(top.y - deck.topY) < 0.05 && underPassable && climb > 0,
    info: `луч сверху бьёт в ${top ? top.y.toFixed(2) : 'пустоту'} (настил ${deck.topY}), `
      + `под ним ${underPassable ? 'свободно' : 'задержано'}, узлов на его отметке — ${climb}`,
  };
}

/**
 * Наклонный пролёт: картинка (призма), опора (`groundHeightAt`), луч (`raySolid`)
 * и сфера обязаны лежать на ОДНОЙ поверхности. Это и есть требование «твёрдость
 * совпадает с картинкой»: если бы подъём остался лестницей коробок, опора шла бы
 * ступенями, а глаз видел бы гладкий склон.
 */
function testSmoothIncline() {
  const map = builtMap();
  const ramps = map.roads.flatMap(r => r.decks).filter(d => d.ramp);
  const bad = [];
  let nodes = 0;
  for (const d of ramps) {
    const w = map.prisms.find(x => x.minX === d.minX && x.maxX === d.maxX && x.minZ === d.minZ);
    if (!w) { bad.push(`${d.id ?? ''}: пролёт не попал в prisms`); continue; }
    const lo = d.axis === 'x' ? d.minX : d.minZ;
    const hi = d.axis === 'x' ? d.maxX : d.maxZ;
    const cross = d.axis === 'x' ? (d.minZ + d.maxZ) / 2 : (d.minX + d.maxX) / 2;
    for (let s = 0; s <= 20; s++) {
      const u = lo + ((hi - lo) * s) / 20;
      const x = d.axis === 'x' ? u : cross;
      const z = d.axis === 'x' ? cross : u;
      const plane = w.topAt(u);
      // 1. опора под ногами — ровно плоскость, без ступеней
      const g = map.groundHeightAt(x, z, plane + 0.1);
      if (Math.abs(g - plane) > 1e-4) bad.push(`${w.axis}${u.toFixed(1)}: опора ${g.toFixed(3)} против профиля ${plane.toFixed(3)}`);
      // 2. луч сверху бьёт в ту же плоскость
      const hit = map.raySolid(x, plane + 5, z, 0, -1, 0, 20);
      if (!hit || Math.abs(hit.y - plane) > 1e-4) bad.push(`${w.axis}${u.toFixed(1)}: луч в ${hit ? hit.y.toFixed(3) : 'пустоту'}`);
      // 3. в плане пролёта нет тела, чей верх прячется между плоскостью склона и
      //    шагом ноги: это была бы невидимая ступень под гладкой картинкой. Тело
      //    ПОД пролётом (уличная плита, по которой склон переезжает) легально.
      const buried = map.solids.filter(o => o.minX < x && o.maxX > x && o.minZ < z && o.maxZ > z
        && o.maxY > plane + 1e-3 && o.maxY < plane + STEP);
      if (buried.length) bad.push(`${w.axis}${u.toFixed(1)}: ${buried.length} невидимых ступеней над профилем`);
    }
    // 4. сфера катится по склону: выталкивание идёт вдоль нормали плоскости
    const uMid = (lo + hi) / 2;
    const planeMid = w.topAt(uMid);
    const c = { x: d.axis === 'x' ? uMid : cross, y: planeMid + 0.05, z: d.axis === 'x' ? cross : uMid };
    const r = CONFIG.radius;
    map.resolveSphere(c, r);
    const k = (w.topAt(hi) - w.topAt(lo)) / (hi - lo);
    const wl = Math.hypot(k, 1);
    const uc = w.axis === 'x' ? c.x : c.z;
    const dist = (c.y - w.topAt(uc)) / wl;
    if (Math.abs(dist - r) > 0.02) bad.push(`сфера на склоне на ${dist.toFixed(3)} м вместо ${r}`);
    if (Math.hypot(c.x - uMid, c.z - cross) > 0.5) bad.push('склон сдвинул тело вбок дальше чем на половину тела');
    // 5. уклон в пределе: по полметра подъёма меньше шага ноги
    if (Math.abs(k) * J.navEdgeProbe > STEP) bad.push(`уклон ${k.toFixed(2)} м/м неперешагиваем`);
    nodes += map.nav.pos.filter(p => map.prisms.some(w2 => p.x >= w2.minX && p.x <= w2.maxX
      && p.z >= w2.minZ && p.z <= w2.maxZ
      && Math.abs(p.y - w2.topAt(w2.axis === 'x' ? p.x : p.z)) < 1e-6)).length;
  }
  const topDeck = map.roads.flatMap(r => r.decks).find(d => !d.ramp && d.topY > 6);
  const slopePct = (Math.abs((map.prisms[0].topAt(map.prisms[0].hi) - map.prisms[0].topAt(map.prisms[0].lo))
    / (map.prisms[0].hi - map.prisms[0].lo)) * 100).toFixed(0);
  const flatTop = map.nav.pos.filter(p => Math.abs(p.y - topDeck.topY) < 0.02
    && p.x >= topDeck.minX && p.x <= topDeck.maxX && p.z >= topDeck.minZ && p.z <= topDeck.maxZ).length;
  return {
    name: 'Подъём на эстакаду — гладкий пролёт: опора, луч и меш на одной плоскости',
    passed: ramps.length >= 2 && bad.length === 0 && flatTop > 0,
    info: bad.length ? `${bad.length} расхождений: ${bad.slice(0, 3).join('; ')}`
      : `${ramps.length} наклонных пластин, ${slopePct} % подъёма, `
      + `узлов на склоне ${nodes}, узлов на верхнем пролёте ${flatTop}`,
  };
}

/**
 * Тело Чужого (сфера `resolveSphere` с шагом вниз, как в `AlienBody._integrate`)
 * обязано Входить на наклонный пролёт и сходить с него. раньше на шаге вперёд его
 * выталкивало назад: расстояния до граней призмы мерились от бесконечных
 * плоскостей, и у пятки подъёма ближайшей оказывалась вертикальная грань торца
 * — тело упиралось в невидимую стену там, где глаз видит начало склона. Прогон
 * самоходный (шаг вперёд, шаг вниз, затем выталкивание): острый угол плиты по
 * правилам выталкивает и назад тоже, важно, чтобы это не останавливало движение.
 * Шаг вниз обязателен — без него тело шло бы по горизонтали и сход с полотна
 * выглядел бы полётом над склоном, а не съём по нему.
 */
function testSphereClimbsPrisms() {
  const map = builtMap();
  const r = CONFIG.radius;
  const STEP = 0.05;
  const bad = [];
  let climbed = 0, descended = 0;
  for (const [wi, w] of map.prisms.entries()) {
    const vMid = (w.v0 + w.v1) / 2;
    const yLo = w.topAt(w.lo + 1e-6), yHi = w.topAt(w.hi - 1e-6);
    const up = yHi > yLo ? 1 : -1;   // направление подъёма вдоль оси призмы
    const groundAt = (u, fromY) => map.groundHeightAt(
      w.axis === 'x' ? u : vMid, w.axis === 'x' ? vMid : u, fromY);
    const span = Math.min(12, (w.hi - w.lo) * 0.8);
    // два прогона: с грунта вверх к середине склона и с верхнего края вниз
    for (const [dir, start, stop, fromY] of [
      [up, (up > 0 ? w.lo : w.hi) - up * 2, (up > 0 ? w.lo : w.hi) + up * span, 0],
      [-up, (up > 0 ? w.hi : w.lo) + up * 2, (up > 0 ? w.hi : w.lo) - up * span, 500],
    ]) {
      const c = { x: vMid, y: groundAt(start, fromY) + r, z: vMid };
      if (w.axis === 'x') c.x = start; else c.z = start;
      const firstY = c.y;
      const uOf = () => (w.axis === 'x' ? c.x : c.z);
      const guard = Math.ceil(Math.abs(stop - start) / STEP) * 4 + 40;
      let iter = 0;
      while (dir * (stop - uOf()) > 0.02 && iter < guard) {
        if (w.axis === 'x') c.x += dir * STEP; else c.z += dir * STEP;
        c.y -= STEP;
        map.resolveSphere(c, r);
        // нога встаёт на опору того же уровня, что и в `Player._integrate`:
        // без этого шага тело свободно падало бы в грунт (его держит поверхность,
        // а не соль), и прогон мерил бы падение, а не сход по склону
        const g = map.groundHeightAt(c.x, c.z, c.y);
        if (g !== null && c.y - r < g) c.y = g + r;
        iter++;
      }
      const label = dir === up ? 'подъём' : 'спуск';
      if (dir * (stop - uOf()) > 0.02) {
        bad.push(`призма ${wi} ${label}: тело дошло только до u=${uOf().toFixed(2)} (нужно ${stop.toFixed(2)})`);
        continue;
      }
      const travel = (c.y - firstY) * dir * up;
      if (travel < 1) bad.push(`призма ${wi} ${label}: перепад всего ${travel.toFixed(2)} м`);
      else if (dir === up) climbed++;
      else descended++;
    }
  }
  return {
    name: 'Тело на сфере доходит по наклонному пролёту и вниз, и вверх',
    passed: map.prisms.length >= 2 && bad.length === 0
      && climbed === map.prisms.length && descended === map.prisms.length,
    info: bad.length ? `${bad.length}: ${bad.slice(0, 3).join('; ')}`
      : `${map.prisms.length} призм: с грунта вверх и с верхнего края вниз дошли до цели, перепад > 1 м в обоих прогонах`,
  };
}

/**
 * Со-плоскостные грани (верх плиты пола и плита земли, верх стены и верх плиты
 * кровли) мигают в z-buffer. Проверка держит сами швы: пол комнаты обязан быть
 * выше её отметки, картинка стены — ниже кровли, к которой примыкает, а коллизия
 * стены — по-прежнему доставать до кровли, иначе с крыши провалились бы сквозь
 * парапет.
 */
function testSeams() {
  const map = builtMap();
  const bad = [];
  const roomLevel = new Map();
  for (const b of map.buildings) for (const r of b.rooms) roomLevel.set(r.id, r.y);
  // 1. ни одна плита пола не лежит в одной плоскости со своей отметкой: у комнат
  //    первого этажа отметка равна земле, и верх плиты совпал бы с mesh земли
  for (const p of map.floorPlates) {
    const lvl = roomLevel.get(p.room);
    if (lvl === undefined || Math.abs(p.y - (lvl + J.floorRise)) > 1e-6) bad.push(`${p.room}: плита не на шве ${J.floorRise}`);
  }
  const groundRooms = map.floorPlates.filter(p => Math.abs(roomLevel.get(p.room) - map.groundY) < 1e-6);
  if (!groundRooms.length) bad.push('нет ни одной плиты первого этажа — проверке нечего ловить');
  // 2. картинка стены ниже кровли СВОЕГО здания (у чужой крыши та же отметка —
  //    это не со-плоскостные грани, они в разных планах)
  for (const g of map.geo.walls) {
    g.computeBoundingBox();
    const bb = g.boundingBox;
    const cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2;
    const owner = map.buildings.find(b => cx >= b.bounds.minX - 0.01 && cx <= b.bounds.maxX + 0.01
      && cz >= b.bounds.minZ - 0.01 && cz <= b.bounds.maxZ + 0.01);
    if (owner && Math.abs(bb.max.y - owner.roofY) < 1e-4) bad.push(`${owner.id}: стена с верхом ровно на кровле`);
  }
  for (const b of map.buildings) {
    // именно полоса стены (ниже подошвы плиты кровли), а не сама плита кровли
    if (!map.solids.some(s => Math.abs(s.maxY - b.roofY) < 1e-6
      && s.minY < b.roofY - J.slabThickness - 0.01)) {
      bad.push(`${b.id}: коллизия стены не достает до кровли`);
    }
  }
  return {
    name: 'Швы полов и кровли: ни одной со-плоскостной грани, коллизия на месте',
    passed: bad.length === 0 && groundRooms.length > 0 && J.floorRise > 1e-3 && J.roofSeam > 1e-3,
    info: bad.length ? `${bad.length}: ${[...new Set(bad)].slice(0, 3).join('; ')}`
      : `${map.floorPlates.length} плит пола подняты на ${J.floorRise} м (${groundRooms.length} из них на земле), `
      + 'стены опущены на кровельный шов, солиды достают до кровли',
  };
}

/**
 * Насыпь: её тело держит габарит (идти сквозь грунт нельзя), а откос — проходимый
 * склон. Откос обязан опираться (у коробки во всю высоту опоры не было: шаг за
 * край полотна превращался в падение внутрь грунта, где тот же блокер запирал
 * тело) и не иметь внутри ни солида, ни блокера — иначе под наклоненной картинкой
 * остаётся невидимый прямоугольник, а с полотна на склон и обратно ведёт скачок
 * в толщину плиты.
 */
function testEmbankment() {
  const map = builtMap();
  const bank = map.roads.find(r => r.type === 'embankment');
  const fill = bank.fill[0];
  const cx = (fill.minX + fill.maxX) / 2, cz = (fill.minZ + fill.maxZ) / 2;
  const inEarth = map.isBlocked(cx, cz, CONFIG.radius, map.groundY + 0.05, PLAYER_H);
  const bad = [];
  for (const a of bank.aprons) {
    const toe = a.cross + a.dir * a.run;
    const plan = a.axis === 'x'
      ? { minX: a.minX, maxX: a.maxX, minZ: Math.min(a.cross, toe), maxZ: Math.max(a.cross, toe) }
      : { minX: Math.min(a.cross, toe), maxX: Math.max(a.cross, toe), minZ: a.minZ, maxZ: a.maxZ };
    const w = map.prisms.find(p => p.minX === plan.minX && p.maxX === plan.maxX
      && p.minZ === plan.minZ && p.maxZ === plan.maxZ);
    if (!w) { bad.push(`откос ${a.axis} ${a.cross} не попал в prisms`); continue; }
    if (w.poly.length !== 3) bad.push(`профиль откоса не треугольник (${w.poly.length} вершин)`);
    const vMid = a.axis === 'x' ? (a.minX + a.maxX) / 2 : (a.minZ + a.maxZ) / 2;
    const at = u => (a.axis === 'x' ? { x: vMid, z: u } : { x: u, z: vMid });
    let prev = null;
    for (let s = 0; s <= 12; s++) {
      const u = a.cross + (toe - a.cross) * (s / 12);
      const p = at(u);
      const plane = w.topAt(u);
      const feet = map.groundHeightAt(p.x, p.z, plane + 0.1);
      if (Math.abs(feet - plane) > 1e-4) bad.push(`u=${u.toFixed(2)}: опора ${feet.toFixed(3)} против профиля ${plane.toFixed(3)}`);
      if (map.isBlocked(p.x, p.z, CONFIG.radius, plane + 0.02, PLAYER_H)) bad.push(`u=${u.toFixed(2)}: склон задерживает тело`);
      const crossed = list => list.filter(o => o.minX < p.x && o.maxX > p.x && o.minZ < p.z && o.maxZ > p.z
        && o.minY < plane - 0.05 && o.maxY > plane + 0.05);
      if (crossed(map.solids).length) bad.push(`u=${u.toFixed(2)}: солид пересекает склон (невидимый прямоугольник)`);
      if (crossed(map.blockers).length) bad.push(`u=${u.toFixed(2)}: блокер пересекает склон`);
      if (prev !== null && Math.abs(feet - prev) > STEP + 1e-6) bad.push(`u=${u.toFixed(2)}: перепад опоры ${(feet - prev).toFixed(2)} м`);
      prev = feet;
    }
    // тот же прогон снизу вверх: с полотна на склон и обратно — ногами, не прыжком
  }
  const deck = bank.decks.find(d => d.grounded);
  const edge = map.groundHeightAt(cx, deck.minZ - 0.01, deck.topY);
  const ontoDeck = map.groundHeightAt(cx, deck.minZ + 0.01, edge);
  if (ontoDeck - edge > STEP + 1e-6) bad.push(`склон ${edge.toFixed(2)} → полотно ${ontoDeck.toFixed(2)} — не перешагнуть`);
  return {
    name: 'Насыпь держит габарит грунтом, а её откос — проходимый склон без коробки',
    passed: inEarth && bank.aprons.length >= 2 && bad.length === 0,
    info: bad.length ? `${bad.length}: ${bad.slice(0, 3).join('; ')}`
      : `тело насыпи ${inEarth ? 'блокирует' : 'проходимо'}, ${bank.aprons.length} откоса по ${bank.aprons[0].run} м `
      + `держат опору (уклон ${(bank.aprons[0].topY / bank.aprons[0].run).toFixed(3)} м/м), `
      + `подъём со склона на полотно ${ontoDeck.toFixed(2)} м`,
  };
}

function testMeshAndLights() {
  const map = builtMap();
  const scene = new THREE.Scene();
  map.build(scene);
  let nan = 0, meshes = 0, triangles = 0;
  for (const o of scene.children) {
    if (!o.isMesh && !o.isInstancedMesh) continue;
    meshes++;
    const g = o.geometry;
    const arr = g.getAttribute('position').array;
    for (let i = 0; i < arr.length; i++) if (!Number.isFinite(arr[i])) nan++;
    triangles += (g.index ? g.index.count : g.getAttribute('position').count) / 3;
  }
  const wantLights = map.lightSpecs.filter(l => l.type !== 'directional').length;
  return {
    name: 'Меш без NaN-вершин, свет главы — из данных и в пределах пула',
    passed: nan === 0 && meshes > 0 && map.realLights.length === wantLights
      && wantLights <= J.maxRealLights,
    info: `${meshes} мешей, ${(Math.round(triangles) / 1000).toFixed(1)} тыс. треугов, NaN — ${nan}, `
      + `источников ${map.realLights.length} из ${map.lightSpecs.length}`,
  };
}

function testMinimap() {
  const map = builtMap();
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  let error = null;
  try {
    map.drawMinimap(ctx, 256, map.spawn);
    map.drawMinimap(ctx, 256, exitPoint(map));
  } catch (e) { error = e.message; }
  const px = ctx.getImageData(0, 0, 256, 256).data;
  let ink = 0;
  for (let i = 0; i < px.length; i += 4) if (px[i] + px[i + 1] + px[i + 2] > 120) ink++;
  return {
    name: 'Миникарта рисует план этажа и не падает на точке B',
    passed: !error && ink > 400,
    info: error ? `исключение: ${error}` : `пикселей плана — ${ink} из 65536`,
  };
}

function testOpenPositions() {
  const map = builtMap();
  const pts = map.openPositions();
  // точка обязана стоять на своей опоре: плите пола, настиле, плите земли или
  // наклонном пролёте (его нет в `surfaces` — он аналитический), и не быть
  // задержанной габаритом; узел под настилом эстакады держится на нуле, и это
  // правильно — `groundHeightAt` с запасом на шаг схватил бы плиту сверху
  const bad = pts.filter(p => {
    const onSupport = p.y === map.groundY
      || map.surfaces.some(s => Math.abs(s.y - p.y) <= 0.02
        && p.x >= s.minX && p.x <= s.maxX && p.z >= s.minZ && p.z <= s.maxZ)
      || Math.abs(map.groundHeightAt(p.x, p.z, p.y) - p.y) < 1e-6;
    return !onSupport || map.isBlocked(p.x, p.z, CONFIG.radius, p.y, CONFIG.eyeHeight);
  });
  return {
    name: 'Свободные точки для объектов свободны для габарита и опираются',
    passed: pts.length > 0 && bad.length === 0,
    info: bad.length ? `${bad.length} из ${pts.length} не опираются: ${JSON.stringify(bad[0])}`
      : `${pts.length} точек, все на своей опоре`,
  };
}

function testDeterminism() {
  const a = createJsonMap(LEVEL_09.map);
  const b = createJsonMap(LEVEL_09.map);
  let diff = 0;
  if (a.nav.pos.length !== b.nav.pos.length) diff = Infinity;
  else {
    for (let i = 0; i < a.nav.pos.length; i++) {
      if (a.nav.pos[i].y !== b.nav.pos[i].y
        || a.nav.pos[i].x !== b.nav.pos[i].x
        || a.nav.pos[i].z !== b.nav.pos[i].z) diff++;
    }
  }
  return {
    name: 'Детерминизм: два сбора дают одинаковые узлы и высоты',
    passed: diff === 0 && a.solids.length === b.solids.length,
    info: diff === 0 ? `${a.nav.pos.length} узлов совпали, солидов ${a.solids.length}` : `различий — ${diff}`,
  };
}

/**
 * Прогоняет тесты JSON-главы и печатает отчёт в консоль.
 * @returns {{passed:number, total:number, results:Array<{name:string,passed:boolean,info:string}>}}
 */
export async function runJsonTests() {
  const tests = [
    testContract,
    testBasics,
    testFloorPlateAndHole,
    testWallDoorLintel,
    testRoofIsSolidNotSurface,
    testStairLandings,
    testPathAtoB,
    testPathWalkable,
    testEveryEdgeSupported,
    testOneConnectedNetwork,
    testBridgeDeck,
    testSmoothIncline,
    testSphereClimbsPrisms,
    testSeams,
    testEmbankment,
    testMeshAndLights,
    testMinimap,
    testOpenPositions,
    testDeterminism,
  ];
  const results = [];
  for (const fn of tests) {
    try { results.push(await fn()); }
    catch (e) { results.push({ name: fn.name, passed: false, info: `ошибка: ${e && e.message}` }); }
  }
  const passed = results.filter(r => r.passed).length;

  if (typeof console !== 'undefined') {
    console.group('Автотесты JSON-главы');
    for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'} — ${r.name}: ${r.info}`);
    console.log(`Итого: ${passed}/${results.length}`);
    console.groupEnd();
  }
  return { passed, total: results.length, results };
}
