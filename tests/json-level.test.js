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
 *  16. Русло прорезает грунт: дно ниже «нуля пола мира» отдаёт свою отметку, берег
 *      держит землю, вода — отдельный меш, а плита земли не один квад;
 *  17. Луч над каналом идёт к дну сквозь плиту земли, настил моста и карниз
 *      береговой стенки (его верх ровно на отметке земли) остаются твёрдью;
 *  18. Сфера тела сходится вниз и поднимается вверх по каждому склону берега и
 *      каждому пандусу схода — без застреваний и с перепадом больше метра;
 *  19. Граф ведёт вброд через канал (русло держат узлы ниже земли) и не ведёт
 *      через реку без брода; всё, что добавлено, достижимо из точки A;
 *  20. Опоры моста над руслом опускаются пяткой на дно, метки id и миникарта
 *      русло видят;
 *  21. Меш собирается без NaN-вершин, свет глав — из данных и в пределах пула;
 *  22. Миникарта рисует план без исключений;
 *  23. Свободные точки для объектов действительно свободны и опираются;
 *  24. Метки id для `?debug=1` покрывают все объекты данных и стоят над своими
 *      планами;
 *  25. Детерминизм: два сбора дают побитово равные отметки узлов;
 *  26. Квартал генератора (`tools/city.js`): все этажи вводимых домов и ходовые
 *      кровли достижимы, недостижимых узлов нет;
 *  27. Наружный узел двери связан с решёткой улицы, а не только с полом дома;
 *  28. Глава 10 целиком (`level-10.js`): маршрут A→B через русло — по мосту или
 *      вброд, и каждое его ребро проходимо шагом;
 *  29. Глава 10: авторские доминанты открыты на всех этажах и кровлях, а
 *      генератор дал кварталы с достижимыми интерьерами на обоих берегах.
 *  30. Окна фасадов (секция `windows`): без неё окон нет, с ней — инстансы
 *      палитры, собранные детерминированно;
 *  31. Окна — только картинка: солиды, блокеры, опоры, узлы графа и маршрут
 *      A→B совпадают с картой без окон;
 *  32. Каждый квад висит снаружи своей стены и смотрит наружу: рейкаст назад
 *      даёт стену на ≤ 0,12 м, вперёд — воздух не ближе 0,5 м;
 *  33. Доля горящих окон держит настройку `lit`, все цвета палитры в сцене;
 *  34. Бюджет района с окнами и мусором: отрисовки, экземпляры и треугольники
 *      в пределах замера главы 10;
 *  35. `dispose()` убирает меши окон и их материалы, общие материалы пропов
 *      остаются живыми;
 *  36. Мусор кровель и тротуаров (секция `clutter`): каждый предмет стоит на
 *      своей опоре, над ним есть запас по высоте, а оба прохода — и кровли, и
 *      улицы — действительно что-то ставят типами из списка моделей;
 *  37. Детерминизм мусора: два сбора дают совпадающие списки предметов и
 *      побитово равные матрицы экземпляров пропов.
 */
import * as THREE from 'three';
import { createJsonMap } from '../src/json-map.js';
import { LEVEL_09 } from '../src/levels/level-09.js';
import { LEVEL_10 } from '../src/levels/level-10.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { expandCity } from '../tools/city.js';
import { CONFIG } from '../src/config.js';
import { propModels } from '../src/props.js';

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
  // необязательные члены: карта из брифа подписывает свои объекты (метки id в
  // ?debug=1), но не стримит — окно у неё одно
  const optional = ['debugIds', 'updateStreaming'].filter(o => typeof map[o] === 'function');
  return {
    name: 'Контракт карты закрыт (движок знает только его члены)',
    passed: missing.length === 0,
    info: missing.length ? `нет членов: ${missing.join(', ')}`
      : `${fields.length + methods.length} членов на месте, опциональные: ${optional.join(', ') || 'нет'}`,
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

// ---------------------------------------------------------------- вода: полигон русла
//
// Глав с руслом в реестре ещё нет, а клиентскую механику — дно ниже «нуля пола
// мира», луч сквозь плиту земли, брод и блокировка незаброженной реки — проверять
// иначе как не на чем. Поэтому глава-полигон живёт здесь: те же данные, что
// прогоняет Node-проверка парсера, но собранные в карту и прочитанные ногами.

const WATER_RAW = {
  metadata: { levelName: 'water', name: 'Полигон воды', hint: '—', units: 'meters' },
  ground: { size: 160 },
  waterways: [
    {
      id: 'canal', width: 20, bedY: -3, surfaceY: -1, bank: 'quay', wade: true,
      ramps: [{ at: { x: -12, z: 24 } }, { at: { x: -12, z: 56 }, width: 6 }],
      points: [{ x: -60, z: 40 }, { x: 60, z: 40 }],
    },
    {
      id: 'river', width: 16, bedY: -2.5, surfaceY: -0.7, bank: 'slope', bankRun: 10, wade: false,
      // русло до самих краёв земли: иначе у главы остаётся полоса грунта,
      // обойти реку по которой — маршрут, и проверка «не ведёт» становится ложью
      points: [{ x: -80, z: -50 }, { x: 80, z: -50 }],
    },
  ],
  roads: [
    { id: 'bank_rd', type: 'ground', width: 8, points: [{ x: -60, y: 0, z: 0 }, { x: 60, y: 0, z: 0 }] },
    {
      id: 'bridge_rd', type: 'bridge', width: 6,
      points: [{ x: 0, y: 0, z: 16 }, { x: 0, y: 4.8, z: 33 }, { x: 0, y: 4.8, z: 47 }, { x: 0, y: 0, z: 64 }],
    },
  ],
  buildings: [],
  landscapeObjects: [],
  lights: [],
  gameplay: { goal: 'exit', spawn: { x: -30, z: 8 }, exit: { x: 30, z: 8 } },
};

let waterBuilt = null;

/** Карта русла с построенной геометрией: призмы, блокеры и граф собраны. */
function waterMap() {
  if (!waterBuilt) {
    waterBuilt = createJsonMap(normalizeLevel(WATER_RAW).map);
    waterBuilt.build(new THREE.Scene());
  }
  return waterBuilt;
}

const inRect$ = (x, z, r) => x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ;

function testWaterFrame() {
  const map = waterMap();
  const canal = map.channels.find(c => c.id === 'canal');
  const river = map.channels.find(c => c.id === 'river');
  const bad = [];
  if (map.channels.length !== 2) bad.push(`каналов ${map.channels.length}`);
  // дно обязано отдавать СВОЮ отметку: «пол мира — ноль» над каналом был бы
  // невидимым настилом, по котором шли бы вместо воды
  const bedY = map.groundHeightAt(-30, canal.segments[0].cross, map.groundY);
  if (Math.abs(bedY - canal.bedY) > 1e-3) bad.push(`опора над дном канала ${bedY} вместо ${canal.bedY}`);
  if (map.isBlocked(-30, canal.segments[0].cross, CONFIG.radius, bedY, CONFIG.eyeHeight)) {
    bad.push('вброд проходимое дно задерживает габарит');
  }
  const riverBed = map.groundHeightAt(-30, river.segments[0].cross, map.groundY);
  if (Math.abs(riverBed - river.bedY) > 1e-3) bad.push(`опора над дном реки ${riverBed} вместо ${river.bedY}`);
  if (!map.isBlocked(-30, river.segments[0].cross, CONFIG.radius, riverBed, CONFIG.eyeHeight)) {
    bad.push('река без брода проходима по дну');
  }
  // берег остаётся берегом: нулём земли
  if (Math.abs(map.groundHeightAt(-30, 20, map.groundY) - map.groundY) > 1e-6) bad.push('берег потерял опору земли');
  // грунт прорезан: плоскость земли больше одного квада, а вода — отдельный меш
  const ground = map.sceneObjects[0];
  if (ground.geometry.attributes.position.count <= 4) bad.push('плита земли не прорезана руслом');
  if (!map.waterRects.length) bad.push('пластин воды нет');
  return {
    name: 'Русло прорезает грунт: дно ниже нуля своё, берег держит землю, вода — меш',
    passed: bad.length === 0 && map.holes.length >= 7,
    info: bad.length ? `${bad.length}: ${bad.slice(0, 3).join('; ')}`
      : `${map.holes.length} прорезей, дно канала ${bedY} проходимо, дно реки ${riverBed} забраковано блокером, `
      + `вода — ${map.waterRects.length} пластин`,
  };
}

function testWaterRay() {
  const map = waterMap();
  const canal = map.channels.find(c => c.id === 'canal');
  const bad = [];
  // нисходящий луч над каналом обязан пройти отметку земли и упереться в дно:
  // плита мира, лежащая выше воды, была бы фантомным настилом для стрельбы
  const hit = map.raySolid(20, 6, canal.segments[0].cross, 0, -1, 0, 20);
  if (!hit || Math.abs(hit.y - canal.bedY) > 0.05) bad.push(`луч над каналом дал ${hit ? hit.y.toFixed(2) : 'ничего'} вместо дна ${canal.bedY}`);
  // ...а луч, вошедший в русло под углом, тоже обязан давать дно, а не землю
  const slant = map.raySolid(20, 6, canal.segments[0].cross - 20, 0, -0.6, 0.8, 40);
  if (slant && Math.abs(slant.y) < 0.01 && inRect$(slant.x, slant.z, canal.segments[0].bed)) {
    bad.push('косой луч остановился на плите земли внутри русла');
  }
  // верх береговой стенки лежит ровно на отметке земли — его отбрасывать нельзя
  const wallZ = canal.segments[0].cross - canal.segments[0].halfW - J.wallThickness / 2;
  const onWall = map.raySolid(20, 6, wallZ, 0, -1, 0, 20);
  if (!onWall || Math.abs(onWall.y - map.groundY) > 0.05) bad.push('луч сквозь карниз стенки ушёл в землю');
  // настил моста над руслом остаётся ближайшей твердью
  const deck = map.roads.find(r => r.id === 'bridge_rd').decks.find(d => !d.ramp);
  const over = map.raySolid(0, 12, (deck.minZ + deck.maxZ) / 2, 0, -1, 0, 20);
  if (!over || Math.abs(over.y - deck.topY) > 0.05) bad.push(`луч над мостом дал ${over ? over.y.toFixed(2) : 'ничего'} вместо настила ${deck.topY}`);
  return {
    name: 'Луч над руслом идёт к дну, а настил и береговая стенка остаются твёрдью',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `дно ${hit.y.toFixed(2)}, карниз стенки ${onWall.y.toFixed(2)}, настил ${over.y.toFixed(2)} — луч бьёт в своё`,
  };
}

function testWaterSlopes() {
  const map = waterMap();
  const r = CONFIG.radius;
  const step = 0.05;
  const bad = [];
  let done = 0;
  for (const d of map.descents) {
    if (!map.prisms.some(p => p.descentId === d.id)) { bad.push(`${d.id}: схода нет в призмах`); continue; }
    // у любого уклона `u0` — у воды (y0 = дно), `u1` — на берегу (y1 = земля)
    const along = d.axis;                       // ось, вдоль которой отложен профиль
    const vMid = (d.v0 + d.v1) / 2;
    const at = u => ({ x: along === 'x' ? u : vMid, z: along === 'x' ? vMid : u });
    const s = Math.sign(d.u1 - d.u0);
    // прогон начинается и кончается в метре от концов: у носика схода и у кромки
    // дна опору держит соседняя призма, и тело цеплялось бы за стык, а не за склон
    const water = d.u0 + s * 1.0;
    const shore = d.u1 - s * 1.0;
    for (const [label, from, to] of [['спуск', shore, water], ['подъём', water, shore]]) {
      const dir = Math.sign(to - from);
      const c = at(from);
      c.y = map.groundHeightAt(c.x, c.z, dir > 0 ? map.groundY : 500) + r;
      const firstY = c.y;
      const uOf = () => (along === 'x' ? c.x : c.z);
      const guard = Math.ceil(Math.abs(to - from) / step) * 4 + 40;
      let iter = 0;
      while (Math.abs(to - uOf()) > 0.02 && iter < guard) {
        if (along === 'x') c.x += dir * step; else c.z += dir * step;
        c.y -= step;
        map.resolveSphere(c, r);
        const g = map.groundHeightAt(c.x, c.z, c.y);
        if (g !== null && c.y - r < g) c.y = g + r;
        iter++;
      }
      if (Math.abs(to - uOf()) > 0.02) {
        bad.push(`${d.id} ${label}: тело встало на u=${uOf().toFixed(2)} (нужно ${to.toFixed(2)})`);
        continue;
      }
      const travel = Math.abs(c.y - firstY);
      if (travel < 1) bad.push(`${d.id} ${label}: перепад всего ${travel.toFixed(2)} м`);
      else done++;
    }
  }
  return {
    name: 'Тело на сфере сходится по каждому склону и сходу вниз и вверх',
    passed: map.descents.length >= 4 && bad.length === 0 && done === map.descents.length * 2,
    info: bad.length ? `${bad.length}: ${bad.slice(0, 3).join('; ')}`
      : `${map.descents.length} уклонов × 2 прогона, перепад > 1 м, застреваний нет`,
  };
}

function testWaterNav() {
  const map = waterMap();
  const canal = map.channels.find(c => c.id === 'canal');
  const river = map.channels.find(c => c.id === 'river');
  const riverBed = river.segments[0].bed;
  const bad = [];
  const nodeAt = (x, z, y) => nodeNear(map, { x, y, z }, 2.5);
  // брод: с берега на берег через дно — маршрут обязан существовать и идти по воде
  const from = { x: -12, y: map.groundHeightAt(-12, 20, map.groundY), z: 20 };
  const to = { x: -12, y: map.groundHeightAt(-12, 62, map.groundY), z: 62 };
  const path = map.findPath(from, to);
  if (!Array.isArray(path) || path.length < 3) bad.push('маршрута через брод нет');
  else {
    const wet = path.filter(p => inRect$(p.x, p.z, canal.segments[0].bed) && p.y < map.groundY - 0.5).length;
    if (!wet) bad.push('маршрут через брод не зашёл в русло');
    for (let i = 0; i + 1 < path.length; i++) {
      const f = walkEdge(map, i === 0 ? from : path[i], path[i + 1]);
      if (f) { bad.push(`ребро ${i}: ${f.reason} в ${f.x.toFixed(1)}, ${f.z.toFixed(1)}`); break; }
    }
  }
  if (nodeAt(-12, canal.segments[0].cross, canal.bedY) < 0) bad.push('дна канала нет в графе — брод не куда положить');
  // река без брода: дно забраковано, за дальний берег граф не выходит и маршрут
  // туда не доходит. Проверять надо не «маршрута нет»: `findPath` прибивает цель
  // к ближайшему узлу, поэтому путь вернётся до самого уреза воды — важна сама
  // координата, пересёк ли путь русло
  // (ниже `riverBed.minZ` — то есть за дальним берегом — узлов быть не должно)
  if (map.nav.pos.some(p => inRect$(p.x, p.z, riverBed))) bad.push('узел стоит на дне незаброженной реки');
  const beyond = map.nav.pos.filter(p => p.z < riverBed.minZ).length;
  if (beyond) bad.push(`${beyond} узлов за рекой — её перешли или обошли`);
  const across = map.findPath({ x: 0, y: map.groundY, z: -20 }, { x: 0, y: map.groundY, z: -74 });
  if (Array.isArray(across) && Math.min(...across.map(p => p.z)) < riverBed.minZ) {
    bad.push('маршрут перешёл реку без брода');
  }
  // одна связная сеть: всё, что добавлено, достижимо из точки A
  const start = map.nav.nearestNode(map.spawn.x, map.spawn.y, map.spawn.z);
  const seen = new Uint8Array(map.nav.pos.length);
  const q = [start];
  seen[start] = 1;
  for (let h = 0; h < q.length; h++) for (const nb of map.nav.adj[q[h]]) if (!seen[nb]) { seen[nb] = 1; q.push(nb); }
  if (q.length !== map.nav.pos.length) bad.push(`узлов вне сети из точки A: ${map.nav.pos.length - q.length}`);
  return {
    name: 'Граф ведёт вброд через канал и не ведёт через реку без брода',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${path.length} узлов через брод (русло держат ${map.nav.pos.filter(p => p.y < map.groundY - 0.5).length} подводных), `
      + `${map.nav.pos.length} узлов достижимы из точки A, за рекой без брода — ${beyond}`,
  };
}

function testWaterPillarsAndIds() {
  const map = waterMap();
  const canal = map.channels.find(c => c.id === 'canal');
  const bed = canal.segments[0].bed;
  const bad = [];
  const pillars = map.props.filter(p => p.source === 'bridge_pillar');
  const inBed = pillars.filter(p => p.position.y < map.groundY - 0.5);
  // опора над руслом обязана встать на дно, а не кончаться на «нуле пола мира»:
  // иначе колонна висела бы над водой, не держа настил
  if (inBed.length === 0) bad.push('ни одна опора моста не опустилась к дну');
  for (const p of inBed) {
    if (!inRect$(p.position.x, p.position.z, bed)) bad.push(`${p.id}: опора ниже земли вне русла`);
    if (Math.abs(p.position.y - canal.bedY) > 1e-3) bad.push(`${p.id}: пятка ${p.position.y} вместо дна ${canal.bedY}`);
  }
  for (const p of pillars.filter(x => x.position.y > map.groundY - 0.5)) {
    if (Math.abs(p.position.y - map.groundY) > 1e-3) bad.push(`${p.id}: пятка ${p.position.y} не на земле`);
  }
  // метки id: у каждого русла, стенки и схода своя метка под своей отметкой
  const ids = map.debugIds();
  const texts = new Set(ids.map(l => l.text.split(' · ')[0]));
  for (const id of [canal.id, 'river']) if (!texts.has(id)) bad.push(`метки русла «${id}» нет`);
  const bedLabel = ids.find(l => l.text.startsWith('canal · русло'));
  if (!bedLabel || Math.abs(bedLabel.y - (canal.surfaceY + 1.2)) > 0.01) bad.push('метка дна не над водой');
  const wallLabel = ids.find(l => l.text.includes('береговая стенка'));
  if (!wallLabel) bad.push('метки береговой стенки нет');
  // миникарта обязана нарисовать план с руслом без исключений
  const canvas = document.createElement('canvas');
  canvas.width = 336;
  canvas.height = 336;
  try { map.drawMinimap(canvas.getContext('2d'), { x: 0, z: 0 }, 336, 336); } catch (e) { bad.push(`миникарта: ${e.message}`); }
  return {
    name: 'Опоры моста опускаются на дно, метки id и миникарта русло видят',
    passed: bad.length === 0 && inBed.length >= 2,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${inBed.length} опор на дне (пятка ${inBed[0].position.y}), ${pillars.length - inBed.length} на земле, `
      + `${ids.length} меток, миникарта ${336} px без исключений`,
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
 * Метки id для `?debug=1`: `debugIds()` обязан покрыть каждый объект данных, у
 * которого есть `id`, ставить метку на уже посчитанную геометрию (точка в плане
 * своего объекта и в границах уровня) и отвечать одинаково на повторный вызов.
 * Проверка держит именно это: если метка врёт или id пропущен, человек по ней
 * найдёт в `level-09.json` не то, что видит перед собой.
 */
function testDebugIds() {
  const map = builtMap();
  const ids = map.debugIds();
  const again = map.debugIds();
  const bad = [];
  const texts = new Set(ids.map(l => l.text.split(' · ')[0]));
  const want = [];
  for (const b of map.buildings) {
    want.push(b.id);
    for (const r of b.rooms) want.push(r.id);
    for (const s of b.stairs) want.push(s.id);
    for (const d of b.doors) want.push(d.id);
  }
  for (const road of map.roads) want.push(road.id);
  for (const p of map.props) want.push(p.id);
  for (const l of map.lightSpecs) want.push(l.id);
  for (const id of want) if (!texts.has(id)) bad.push(`метки нет для id «${id}»`);

  const bb = map.bounds;
  // нижняя граница — дно самого глубокого русла: метка дна или береговой стенки
  // лежит ниже «пола мира» по определению, и прежний допуск в 1 м браковал бы её
  const low = map.channels.reduce((y, c) => Math.min(y, c.bedY), map.groundY - 1);
  for (const l of ids) {
    if (!l.text || !Number.isFinite(l.x + l.y + l.z)) bad.push(`метка «${l.text}» без текста или с негодными координатами`);
    if (l.x < bb.minX || l.x > bb.maxX || l.z < bb.minZ || l.z > bb.maxZ) bad.push(`«${l.text}» вне границ уровня`);
    if (l.y < low || l.y > 40) bad.push(`«${l.text}» на отметке ${l.y.toFixed(1)} м`);
  }
  // метка здания обязана стоять над его же планом, а не над соседним домом
  for (const b of map.buildings) {
    const l = ids.find(x => x.text === b.id);
    if (l && !(l.x > b.bounds.minX && l.x < b.bounds.maxX && l.z > b.bounds.minZ && l.z < b.bounds.maxZ)) {
      bad.push(`${b.id}: метка вне габарита дома`);
    }
  }
  const same = again.length === ids.length
    && again.every((l, i) => l.text === ids[i].text && l.x === ids[i].x && l.y === ids[i].y && l.z === ids[i].z);
  if (!same) bad.push('повторный вызов дал другой список');

  return {
    name: 'Метки id покрывают все объекты данных и стоят на своей геометрии',
    passed: bad.length === 0 && ids.length >= want.length,
    info: bad.length ? `${bad.length}: ${bad.slice(0, 3).join('; ')}`
      : `${ids.length} меток на ${want.length} id из данных, все в границах уровня и над своими планами`,
  };
}

// ---------------------------------------------------------------- вертикаль: кровли, марши, переходы
//
// Тот же полигон, что прогоняет Node-проверка парсера (`vertLevel` в
// tools/level-parser.test.mjs), но собранный в карту: ходовая кровля как опора,
// проём марша в её плите, вертикальный марш, переход без опор и дверь на его
// отметке — проверить «ногами и маршрутом» больше негде.

const VERT_RAW = {
  metadata: { levelName: 'vertical', name: 'Полигон вертикали', hint: '—', units: 'meters' },
  ground: { size: 160 },
  roads: [
    { id: 'street_0', type: 'ground', width: 8, lamps: true,
      points: [{ x: -70, y: 0.12, z: -44 }, { x: 70, y: 0.12, z: -44 }] },
    { id: 'sb_podium', type: 'skybridge', width: 3.4, lamps: true,
      points: [{ x: -10, y: 8, z: 0 }, { x: 20, y: 8, z: 0 }] },
    { id: 'br_0', type: 'bridge', width: 6,
      points: [{ x: 55, y: 5, z: 10 }, { x: 55, y: 5, z: 60 }] },
  ],
  buildings: [
    {
      id: 'podium', name: 'Подиум', floorsCount: 2, floorHeight: 4,
      footprint: [{ x: -60, z: -30 }, { x: -10, z: -30 }, { x: -10, z: 30 }, { x: -60, z: 30 }],
      roof: { walkable: true },
      rooms: [
        {
          id: 'pod_r0', floor: 0, type: 'hall',
          polygon: [{ x: -60, z: -30 }, { x: -10, z: -30 }, { x: -10, z: 30 }, { x: -60, z: 30 }],
          connections: [{ target: 'street_0', portalPosition: { x: -35, y: 0, z: -30 }, linkType: 'main_entrance' }],
        },
        {
          id: 'pod_r1', floor: 1, type: 'office',
          polygon: [{ x: -60, z: -30 }, { x: -10, z: -30 }, { x: -10, z: 30 }, { x: -60, z: 30 }],
        },
      ],
      stairs: [
        { id: 'pod_s01', type: 'straight', connectsFloors: [0, 1], position: { x: -52, z: 24 },
          dimensions: { width: 6, length: 4 } },
        { id: 'pod_roof', type: 'straight', connectsFloors: [1, 2], position: { x: -16, z: 0 },
          dimensions: { width: 6, length: 4 } },
      ],
    },
    {
      id: 'tower', name: 'Башня', baseY: 8, floorsCount: 4, floorHeight: 4,
      footprint: [{ x: -45, z: -10 }, { x: -25, z: -10 }, { x: -25, z: 10 }, { x: -45, z: 10 }],
      roof: { walkable: true },
      rooms: [
        {
          id: 'tw_r0', floor: 0, type: 'hall',
          polygon: [{ x: -45, z: -10 }, { x: -25, z: -10 }, { x: -25, z: 10 }, { x: -45, z: 10 }],
          connections: [{ target: 'street_0', portalPosition: { x: -45, y: 8, z: 0 }, linkType: 'door' }],
        },
        { id: 'tw_r1', floor: 1, type: 'office',
          polygon: [{ x: -45, z: -10 }, { x: -25, z: -10 }, { x: -25, z: 10 }, { x: -45, z: 10 }] },
        { id: 'tw_r2', floor: 2, type: 'office',
          polygon: [{ x: -45, z: -10 }, { x: -25, z: -10 }, { x: -25, z: 10 }, { x: -45, z: 10 }] },
        { id: 'tw_r3', floor: 3, type: 'utility',
          polygon: [{ x: -45, z: -10 }, { x: -25, z: -10 }, { x: -25, z: 10 }, { x: -45, z: 10 }] },
      ],
      stairs: [
        { id: 'tw_ladder', type: 'ladder', connectsFloors: [0, 2], position: { x: -35, z: 0 } },
        { id: 'tw_roof', type: 'ladder', connectsFloors: [2, 4], position: { x: -35, z: 0 } },
      ],
    },
    {
      id: 'annex', name: 'Ангар', floorsCount: 3, floorHeight: 4,
      footprint: [{ x: 20, z: -15 }, { x: 50, z: -15 }, { x: 50, z: 15 }, { x: 20, z: 15 }],
      rooms: [
        {
          id: 'an_r2', floor: 2, type: 'office',
          polygon: [{ x: 20, z: -15 }, { x: 50, z: -15 }, { x: 50, z: 15 }, { x: 20, z: 15 }],
          connections: [{ target: 'sb_podium', portalPosition: { x: 20, y: 8, z: 0 }, linkType: 'door' }],
        },
      ],
    },
  ],
  landscapeObjects: [],
  lights: [],
  gameplay: { goal: 'exit', spawn: { x: 0, z: -44 }, exit: { x: -50, z: 0 } },
};

let vertBuilt = null;

/** Карта вертикали с построенной геометрией: плиты кровель, блокеры-парапеты и граф собраны. */
function vertMap() {
  if (!vertBuilt) {
    vertBuilt = createJsonMap(normalizeLevel(VERT_RAW).map);
    vertBuilt.build(new THREE.Scene());
  }
  return vertBuilt;
}

function testVertRoofSupport() {
  const map = vertMap();
  const podium = map.buildings.find(b => b.id === 'podium');
  const tower = map.buildings.find(b => b.id === 'tower');
  const annex = map.buildings.find(b => b.id === 'annex');
  const bad = [];
  if (!podium.roof?.walkable || !tower.roof?.walkable) bad.push('ходовые кровли пропали');
  if (annex.roof) bad.push('у дома без секции roof кровля появилась');
  // ходовая кровля — опора своей отметки, а не «пол мира»: пробу с высоты самой
  // плиты, потому что groundHeightAt отдаёт высшую опору в пределах шага ноги
  for (const b of [podium, tower]) {
    const x = (b.bounds.minX + b.bounds.maxX) / 2;
    const z = b.bounds.minZ + 5;
    const y = map.groundHeightAt(x, z, b.roofY);
    if (Math.abs(y - b.roofY) > 1e-6) bad.push(`${b.id}: опора на кровле ${y} вместо ${b.roofY}`);
  }
  // невходимой кровли в опорах нет: плита ангара — солид, но ноги на неё не ставятся
  if (Math.abs(map.groundHeightAt(35, 0, annex.roofY) - annex.roofY) <= 1e-6) {
    bad.push('кровля ангара стала опорой');
  }
  // парапет держит край на отметке кровли: у края бракуется и сход, и узел
  const edge = { x: podium.bounds.maxX, z: 20 };
  if (!map.isBlocked(edge.x, edge.z, CONFIG.radius, podium.roofY, CONFIG.eyeHeight)) {
    bad.push('парапет не бракует сход с края кровли');
  }
  // где к кровле примыкает настил, в паравете проём: иначе переход упёрся в ограждение
  const gate = { x: podium.bounds.maxX, z: 0 };
  if (map.isBlocked(gate.x, gate.z, CONFIG.radius, podium.roofY, CONFIG.eyeHeight)) {
    bad.push('парапет не расступился перед настилом перехода');
  }
  // коллизия ограждения — полоса ровно от кровли до кровли + parapet: у фасадной
  // линии не должно быть блокера, который залезает в эту полосу снизу (тогда
  // идущий этажом ниже упёрся бы в невидимую стену) или кончается выше её верха
  const onFacade = w => podium.walls.some(f => w.minX >= f.minX - 1e-6 && w.maxX <= f.maxX + 1e-6
    && w.minZ >= f.minZ - 1e-6 && w.maxZ <= f.maxZ + 1e-6);
  const over = map.blockers.filter(w => onFacade(w) && w.y1 > podium.roofY + 1e-6);
  const par = over.filter(w => Math.abs(w.y0 - podium.roofY) < 1e-6
    && Math.abs(w.y1 - (podium.roofY + podium.roof.parapet)) < 1e-6);
  if (!par.length) bad.push('блокеров парагета нет');
  const stray = over.filter(w => !par.includes(w));
  if (stray.length) {
    bad.push(`у фасада подиума торчит блокер ${stray[0].y0}…${stray[0].y1} вне полосы парагета`);
  }
  // решётка узлов кровли не лезет за парапет и стоит на своей плите
  const roofNodes = map.nav.pos.filter(p => Math.abs(p.y - podium.roofY) <= J.floorRise + 0.02
    && inRect$(p.x, p.z, podium.bounds));
  if (roofNodes.length < 4) bad.push(`узлов на кровле подиума ${roofNodes.length}`);
  for (const p of roofNodes) {
    if (map.isBlocked(p.x, p.z, CONFIG.radius, p.y, CONFIG.eyeHeight)) bad.push(`узел ${p.x}, ${p.z} задержан габаритом`);
    if (Math.abs(map.groundHeightAt(p.x, p.z, p.y - 0.5) - p.y) > 0.06) bad.push(`узел ${p.x}, ${p.z} не на опоре`);
  }
  return {
    name: 'Ходовая кровля — опора, парапет держит край и расступается перед настилом',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `кровли ${podium.roofY} и ${tower.roofY} держат, узлов на кровле подиума ${roofNodes.length}, `
      + `плиток ограждения ${par.length} высотою ${podium.roof.parapet}, у края габариту тесно, а в проёме настила свободно`,
  };
}

function testVertRoofHoles() {
  const map = vertMap();
  const podium = map.buildings.find(b => b.id === 'podium');
  const tower = map.buildings.find(b => b.id === 'tower');
  const shaft = tower.stairs.find(s => s.id === 'tw_roof').rect;
  const stair = podium.stairs.find(s => s.id === 'pod_roof').rect;
  const bad = [];
  const covered = (b, x, z) => map.roofPlates.some(p => p.building === b.id && inRect$(x, z, p));
  // проём марша: над шахтой своей плиты кровли нет, но марш там и держит
  if (covered(podium, (stair.minX + stair.maxX) / 2, (stair.minZ + stair.maxZ) / 2)) {
    bad.push('плита кровли легла на проём марша');
  }
  if (!covered(podium, podium.bounds.minX + 5, 0)) bad.push('плита кровли не покрывает footprint');
  // башня, выросшая из кровли, вырезает её своим габаритом: держит пол её первого этажа
  if (covered(podium, -35, 0)) bad.push('плита подиума осталась внутри первого этажа башни');
  const towerFloor0 = tower.baseY + J.floorRise;
  if (Math.abs(map.groundHeightAt(-35, -5, towerFloor0) - towerFloor0) > 1e-6) {
    bad.push(`пол башни над кровлей не отдаёт свою отметку: ${map.groundHeightAt(-35, -5, towerFloor0)}`);
  }
  // верхний марш приходит ровно на кровлю: последняя проступь держит, плиты над ней нет
  const last = tower.stairs.find(s => s.id === 'tw_roof').steps.slice(-1)[0];
  const cx = (last.minX + last.maxX) / 2, cz = (last.minZ + last.maxZ) / 2;
  if (Math.abs(map.groundHeightAt(cx, cz, tower.roofY - J.maxRise) - tower.roofY) > 1e-6) {
    bad.push('верхняя проступь не даёт отметку кровли');
  }
  if (covered(tower, cx, cz)) bad.push('плита кровли башни не прорезана шахтой');
  if (Math.abs(last.top - tower.roofY) > 1e-6) bad.push(`верх марша ${last.top} вместо кровли ${tower.roofY}`);
  // щели в перекрытии нет: проём ровно во план шахты, а рядом плита держит
  if (covered(tower, shaft.maxX + 0.5, (shaft.minZ + shaft.maxZ) / 2)) {
    if (!covered(tower, shaft.minX - 0.5, (shaft.minZ + shaft.maxZ) / 2)) bad.push('плита кровли прорезана шире шахты');
  }
  return {
    name: 'Проём марша в плите кровли: над шахтой плиты нет, соседняя плита цела',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${map.roofPlates.length} плит кровли, проёмы над маршами и под башней, верх марша на ${tower.roofY}`,
  };
}

function testVertLadderClimb() {
  const map = vertMap();
  const tower = map.buildings.find(b => b.id === 'tower');
  const s = tower.stairs.find(x => x.id === 'tw_ladder');
  const bad = [];
  // все проступи в одном плане шахты
  for (const st of s.steps) {
    if (Math.abs(st.minX - s.rect.minX) > 1e-6 || Math.abs(st.maxZ - s.rect.maxZ) > 1e-6) {
      bad.push('проступь вертикального марша не в плане шахты');
      break;
    }
  }
  // проступь — пластина на своём подъёме, а не столб от пола шахты
  const r = map.solids.find(x => Math.abs(x.maxY - s.steps[1].top) < 1e-6 && inRect$(x.minX + 0.1, x.minZ + 0.1, s.rect));
  if (!r || r.minY < s.steps[1].top - J.ladderRung - 1e-6) {
    bad.push(`проступь держит тело от ${r ? r.minY : '—'} вместо толщины ${J.ladderRung}`);
  }
  // шаг по проступям: от пола до пола, каждый подъём перешагиваем, провала нет
  const cx = (s.rect.minX + s.rect.maxX) / 2, cz = (s.rect.minZ + s.rect.maxZ) / 2;
  let feet = map.groundHeightAt(cx, cz, s.y0);
  const rises = [];
  for (let guard = 0; guard < 64 && feet < s.y1 - 1e-6; guard++) {
    const next = map.groundHeightAt(cx, cz, feet);
    if (next <= feet + 1e-6) { bad.push(`ступор на ${feet}`); break; }
    if (next - feet > STEP) { bad.push(`подъём ${feet}→${next} круче шага ${STEP}`); break; }
    rises.push(next - feet);
    feet = next;
  }
  if (Math.abs(feet - s.y1) > 1e-6) bad.push(`по проступлям пришли на ${feet}, ожидалось ${s.y1}`);
  return {
    name: 'Вертикальный марш поднимает нога: шаг по проступям от пола до пола',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${rises.length} шагов подъёмом ${Math.max(...rises).toFixed(2)} м (предел ${J.maxRise}), ${feet} = верх ${s.y1}`,
  };
}

function testVertSkybridgeSolid() {
  const map = vertMap();
  const road = map.roads.find(r => r.id === 'sb_podium');
  const deck = road.decks[0];
  const bad = [];
  if (road.pillars.length) bad.push('под переходом выросли колонны');
  const pillars = map.props.filter(p => p.source === 'bridge_pillar');
  if (pillars.some(p => inRect$(p.position.x, p.position.z, deck))) bad.push('опора моста стоит в плане перехода');
  if (!pillars.length) bad.push('мост br_0 остался без опор');
  const onDeck = map.solids.find(s => Math.abs(s.maxY - deck.topY) < 1e-6 && inRect$(5, 0, s));
  if (!onDeck) bad.push('настила перехода нет в солидах');
  else if (Math.abs(onDeck.minY - (deck.topY - J.deckThickness)) > 1e-6) bad.push(`настил толщиной ${onDeck.maxY - onDeck.minY}`);
  if (Math.abs(map.groundHeightAt(5, 0, deck.topY) - deck.topY) > 1e-6) bad.push('настил перехода не держит опору');
  if (map.isBlocked(5, 0, CONFIG.radius, deck.topY, CONFIG.eyeHeight)) bad.push('настил перехода задерживает габарит');
  // дверь ангара обязана выходить прямо на настил: её наружная точка стоит на нём
  const door = map.buildings.find(b => b.id === 'annex').doors[0];
  if (!inRect$(door.outside.x, door.outside.z, deck)) bad.push('дверь ангара не в плане настила');
  if (Math.abs(map.groundHeightAt(door.outside.x, door.outside.z, deck.topY) - deck.topY) > 1e-6) {
    bad.push('под дверью перехода нет настила');
  }
  return {
    name: 'Переход твёрдый, без опор с земли, а его торец ведёт в дверь на своей отметке',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `настил ${deck.topY} м толщиной ${J.deckThickness}, опор перехода ${road.pillars.length}, `
      + `опор моста ${pillars.length}, дверь ${door.id} на своём плане`,
  };
}

function testVertPaths() {
  const map = vertMap();
  const podium = map.buildings.find(b => b.id === 'podium');
  const tower = map.buildings.find(b => b.id === 'tower');
  const bad = [];
  const street = { x: 0, y: map.groundY, z: -44 };
  const walk = (from, to, label) => {
    const path = map.findPath(from, to);
    if (!Array.isArray(path) || path.length < 2) { bad.push(`${label}: маршрута нет`); return []; }
    for (let i = 0; i + 1 < path.length; i++) {
      const f = walkEdge(map, i === 0 ? from : path[i], path[i + 1]);
      if (f) { bad.push(`${label}: ребро ${i} — ${f.reason} в ${f.x.toFixed(1)}, ${f.z.toFixed(1)}`); break; }
    }
    return path;
  };
  // улица → кровля подиума: через дверь, два марша и решётку кровли
  const roof = walk(street, { x: -50, y: podium.roofY, z: 10 }, 'кровля подиума');
  const onRoof = roof.filter(p => Math.abs(p.y - podium.roofY) <= J.floorRise + 0.02 && inRect$(p.x, p.z, podium.bounds));
  if (roof.length && onRoof.length < 2) bad.push(`по кровле подиума прошли ${onRoof.length} узлов`);
  // кровля подиума → дверь ангара через настил перехода
  const bridge = walk({ x: -50, y: podium.roofY, z: 10 }, { x: 25, y: 8, z: 0 }, 'дверь ангара');
  const deck = map.roads.find(r => r.id === 'sb_podium').decks[0];
  if (bridge.length && !bridge.some(p => inRect$(p.x, p.z, deck) && Math.abs(p.y - deck.topY) < 0.02)) {
    bad.push('маршрут в ангар не шёл по настилу перехода');
  }
  // кровля подиума → кровля башни: дверь на уровне кровли, вертикальные марши
  const top = walk({ x: -50, y: podium.roofY, z: 10 }, { x: -32.5, y: tower.roofY, z: 2.5 }, 'кровля башни');
  if (top.length) {
    if (!top.some(p => Math.abs(p.y - tower.roofY) <= J.floorRise + 0.02)) bad.push('маршрут не встал на кровлю башни');
    if (!top.some(p => p.y > podium.roofY + 1 && p.y < tower.roofY - 1 && inRect$(p.x, p.z, tower.bounds))) {
      bad.push('на кровлю башни не поднимались по её маршам');
    }
  }
  // одна связная сеть: всё вертикальное достижимо из точки A
  const start = map.nav.nearestNode(map.spawn.x, map.spawn.y, map.spawn.z);
  const seen = new Uint8Array(map.nav.pos.length);
  const q = [start];
  seen[start] = 1;
  for (let h = 0; h < q.length; h++) for (const nb of map.nav.adj[q[h]]) if (!seen[nb]) { seen[nb] = 1; q.push(nb); }
  if (q.length !== map.nav.pos.length) bad.push(`узлов вне сети из точки A: ${map.nav.pos.length - q.length}`);
  return {
    name: 'Маршрут идёт по кровле, через переход и вверх по вертикальным маршам',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `кровля подиума ${roof.length} узлов (${onRoof.length} на плите), переход ${bridge.length}, `
      + `башня ${top.length}, сеть ${q.length} из ${map.nav.pos.length}`,
  };
}

function testVertIdsAndMinimap() {
  const map = vertMap();
  const ids = map.debugIds();
  const bad = [];
  for (const b of map.buildings) {
    if (!b.roof) continue;
    const label = ids.find(l => l.text === `${b.id} · кровля · ходовая`);
    if (!label) bad.push(`метки кровли ${b.id} нет`);
    else if (Math.abs(label.y - (b.roofY + 1.8)) > 1e-6) bad.push(`${b.id}: метка кровли на ${label.y}`);
    const parapets = ids.filter(l => l.text.startsWith(`${b.id} · парапет`));
    if (parapets.length !== b.walls.filter(w => w.facade).length) {
      bad.push(`${b.id}: меток парагета ${parapets.length} при фасадах ${b.walls.filter(w => w.facade).length}`);
    }
    for (const l of parapets) if (Math.abs(l.y - (b.roofY + b.roof.parapet + 0.4)) > 1e-6) bad.push(`${l.text} не над ограждением`);
  }
  const bridge = ids.find(l => l.text === 'sb_podium · skybridge');
  if (!bridge) bad.push('метки перехода нет');
  const ladder = ids.find(l => l.text === 'tw_ladder · ladder');
  if (!ladder) bad.push('метки вертикального марша нет');
  // миникарта считает этажом и кровлю: план на отметке игрока-на-крыше даёт «Отметка 8.0 м»
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const texts = [];
  const realText = ctx.fillText.bind(ctx);
  ctx.fillText = (s, x, y) => { texts.push(s); realText(s, x, y); };
  try {
    map.drawMinimap(ctx, 256, { x: -50, y: map.roofPlates.find(p => p.building === 'podium').y, z: 0 });
  } catch (e) { bad.push(`миникарта: ${e.message}`); }
  if (!texts.some(s => s.includes('8.0'))) bad.push(`план кровли не найден: ${texts.join(' / ')}`);
  return {
    name: 'Метки id и миникарта видят кровли, парапеты, марши и переход',
    passed: bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${ids.filter(l => l.text.includes('кровля')).length} метки кровель, `
      + `${ids.filter(l => l.text.includes('парапет')).length} парапетов, план «${texts[0]}»`,
  };
}

function testVertDeterminism() {
  const a = createJsonMap(normalizeLevel(VERT_RAW).map);
  const b = createJsonMap(normalizeLevel(VERT_RAW).map);
  let diff = 0;
  if (a.nav.pos.length !== b.nav.pos.length) diff = Infinity;
  else {
    for (let i = 0; i < a.nav.pos.length; i++) {
      if (a.nav.pos[i].x !== b.nav.pos[i].x || a.nav.pos[i].y !== b.nav.pos[i].y
        || a.nav.pos[i].z !== b.nav.pos[i].z) diff++;
    }
  }
  return {
    name: 'Детерминизм вертикали: два сбора дают одинаковые узлы и плиты',
    passed: diff === 0 && a.solids.length === b.solids.length && a.roofPlates.length === b.roofPlates.length,
    info: diff === 0 ? `${a.nav.pos.length} узлов совпали, солидов ${a.solids.length}, плит кровли ${a.roofPlates.length}`
      : `различий — ${diff}`,
  };
}

/**
 * Полигон генератора кварталов (`tools/city.js`): один район, земля 300 м, сид
 * фиксирован. Взят dense (`lot.pitch` 10 при `inset` 1,5) намеренно — редкие
 * кварталы дают широкие комнаты, где решётка пола живёт и без мельчающего
 * прохода, и тест ничего не проверял бы. Сид 4242 даёт 95 лотов, 10 вводимых
 * домов и 5 ходовых кровель.
 */
const CITY_RAW = {
  metadata: { levelName: 'cityGen', name: 'Кварталы', hint: '—', units: 'meters' },
  ground: { y: 0, size: 300 },
  city: {
    seed: 4242,
    districts: [{
      id: 'k', block: { minX: -130, maxX: 130, minZ: -130, maxZ: 130 }, style: 'kitsch',
      street: { pitch: 38, width: 12 }, lot: { pitch: 10, inset: 1.5, merge: 0.5 },
      height: { minFloors: 2, maxFloors: 6, floorHeight: 3.4 },
      tower: { chance: 0.05, floors: [16, 30], floorHeight: 3.9 },
      enterableEvery: 4, skip: 0.05, courtyard: 0.14,
      roofs: { walkable: true, access: 0.5, parapet: 0.9 },
    }],
  },
  roads: [], buildings: [], landscapeObjects: [], lights: [],
  gameplay: { goal: 'exit', spawn: { x: 0, z: 0 }, exit: { x: 10, z: 10 }, exitRadius: 4 },
};

let cityBuilt = null;

/** Карта квартала генератора: тот же путь, что у главы 10 — `expandCity` → нормализатор → `JsonMap`. */
function cityMap() {
  if (!cityBuilt) {
    cityBuilt = createJsonMap(normalizeLevel(expandCity(structuredClone(CITY_RAW), {})).map);
    cityBuilt.build(new THREE.Scene());
  }
  return cityBuilt;
}

/** Узлы графа, до которых можно дойти от точки появления. */
function reachableFromSpawn(map) {
  const nav = map.nav;
  const start = nav.nearestNode(map.spawn.x, map.spawn.y, map.spawn.z);
  const seen = new Uint8Array(nav.pos.length);
  if (start < 0) return seen;
  const q = [start];
  seen[start] = 1;
  for (let h = 0; h < q.length; h++) for (const nb of nav.adj[q[h]]) if (!seen[nb]) { seen[nb] = 1; q.push(nb); }
  return seen;
}

function testCityHousesReachable() {
  const map = cityMap();
  const nav = map.nav;
  const seen = reachableFromSpawn(map);
  const bad = [];
  let houses = 0, roofed = 0;
  for (const b of map.buildings) {
    if (!b.isEnterable) continue;
    houses++;
    const own = [];
    for (let i = 0; i < nav.pos.length; i++) {
      const p = nav.pos[i];
      if (p.x >= b.bounds.minX - 0.01 && p.x <= b.bounds.maxX + 0.01
        && p.z >= b.bounds.minZ - 0.01 && p.z <= b.bounds.maxZ + 0.01) own.push(i);
    }
    // этаж без узла — это не «дом без верхних этажей», а отрезанный интерьер:
    // картинка и дверь обещают лестницу, а ногами по ней никто не ходит
    for (const room of b.rooms) {
      if (!own.some(i => Math.abs(nav.pos[i].y - room.y) < 0.35 && seen[i])) {
        bad.push(`${b.id}: этаж ${room.floor} (${room.y} м) без достижимых узлов`);
      }
    }
    if (b.roof?.walkable) {
      roofed++;
      if (!own.some(i => Math.abs(nav.pos[i].y - b.roofY) < 0.35 && seen[i])) {
        bad.push(`${b.id}: ходовая кровля на ${b.roofY} м недостижима`);
      }
    }
    if (!own.some(i => seen[i])) bad.push(`${b.id}: дом целиком отрезан (${own.length} узлов)`);
  }
  const dead = nav.pos.filter((_, i) => !seen[i]).length;
  return {
    name: 'Кварталы генератора: каждый этаж вводимого дома и каждая ходовая кровля достижимы',
    passed: houses >= 8 && roofed >= 3 && dead === 0 && bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${houses} вводимых домов, ${roofed} кровель, узлов ${nav.pos.length}, недостижимых ${dead}`,
  };
}

function testCityDoorReachesStreet() {
  const map = cityMap();
  const nav = map.nav;
  const bad = [];
  let doors = 0;
  for (const b of map.buildings) {
    for (const d of b.doors) {
      doors++;
      // наружный узел двери обязан иметь соседа ВНЕ плана дома: три самых
      // ближих кандидата легко оказываются полом той же комнаты (решётка стоит
      // в 0,5 м от стены, а фасад — ближе всего), и тогда дом связен внутри,
      // но отрезан от улицы
      const out = nav.nearestNode(d.outside.x, d.y, d.outside.z);
      if (out < 0) { bad.push(`${d.id}: у наружной точки нет узла вообще`); continue; }
      const outsidePlan = nav.adj[out].filter(i => !b.rects.some(r => {
        const p = nav.pos[i];
        return p.x >= r.minX && p.x <= r.maxX && p.z >= r.minZ && p.z <= r.maxZ;
      }));
      if (!outsidePlan.length) bad.push(`${d.id}: у наружного узла только ${nav.adj[out].length} соседей, все в плане дома`);
    }
  }
  return {
    name: 'Наружный узел каждой двери ведёт на решётку улицы, а не только в пол своей комнаты',
    passed: doors >= 8 && bad.length === 0,
    info: bad.length ? bad.slice(0, 3).join('; ') : `${doors} дверей генератора, у всех есть сосед снаружи плана`,
  };
}

// ----------------------------------------------------------- глава 10: город из брифа

let city10 = null;
/** Сцена, в которую собран глава-10-`JsonMap`: меши окон нужны живьём, а не только счётчик. */
let city10Scene = null;

/**
 * Глава 10 целиком: `LEVEL_10.js` взят как он лежит в репозитории, поэтому тест
 * проверяет и генератор, и схему, и нормализатор разом — расходится любой из
 * трёх, и маршрут или интерьер перестанет быть достижимым.
 */
function chapter10() {
  if (!city10) {
    city10 = createJsonMap(LEVEL_10.map);
    city10Scene = new THREE.Scene();
    city10.build(city10Scene);
  }
  return city10;
}

const AUTHORED_10 = ['corp_podium', 'corp_spire', 'kab_market', 'kab_tower', 'sind_depot', 'skit_stack'];

function testChapter10Route() {
  const map = chapter10();
  const e = LEVEL_10.gameplay.exit;
  const exit = { x: e.x, y: map.groundHeightAt(e.x, e.z, 500), z: e.z };
  const path = map.findPath(map.spawn, exit);
  const name = 'Глава 10: маршрут A→B существует, проходим ногами и пересекает русло';
  if (!Array.isArray(path)) return { name, passed: false, info: 'маршрута нет' };
  const last = path[path.length - 1];
  for (let i = 0; i + 1 < path.length; i++) {
    const fail = walkEdge(map, path[i], path[i + 1]);
    if (fail) return { name, passed: false, info: `ребро ${i} в ${fail.x.toFixed(1)}, ${fail.z.toFixed(1)}: ${fail.reason}` };
  }
  const ch = map.channels.find(c => c.id === 'river');
  const half = ch.width / 2;
  const inBed = path.filter(p => Math.abs(p.z) <= half);
  // переправа обязана быть видна по отметкам: либо настил моста выше земли, либо
  // дно брода ниже — узел «на уровне берега» посреди русла означал бы, что маршрут
  // идёт по воде
  const onDeck = inBed.some(p => p.y > 1);
  const wading = inBed.some(p => p.y < -0.5);
  return {
    name,
    passed: Math.hypot(last.x - exit.x, last.z - exit.z) <= LEVEL_10.gameplay.exitRadius + 4
      && Math.abs(last.y - exit.y) <= 0.02 && inBed.length > 0 && (onDeck || wading),
    info: `${path.length} узлов, ${Math.round(path.reduce((s, p, i) => i ? s + Math.hypot(p.x - path[i - 1].x, p.z - path[i - 1].z) : 0, 0))} м, `
      + `в русле ${inBed.length} узлов (мост ${onDeck ? 'есть' : 'нет'}, вброд ${wading ? 'есть' : 'нет'})`,
  };
}

function testChapter10Interiors() {
  const map = chapter10();
  const nav = map.nav;
  const seen = reachableFromSpawn(map);
  const bad = [];
  let enterable = 0, roofed = 0, generated = 0;
  const authored = new Set(AUTHORED_10);
  for (const b of map.buildings) {
    if (!authored.has(b.id)) generated++;
    if (!b.isEnterable) continue;
    enterable++;
    const own = [];
    for (let i = 0; i < nav.pos.length; i++) {
      const p = nav.pos[i];
      if (p.x >= b.bounds.minX - 0.01 && p.x <= b.bounds.maxX + 0.01
        && p.z >= b.bounds.minZ - 0.01 && p.z <= b.bounds.maxZ + 0.01) own.push(i);
    }
    for (const room of b.rooms) {
      if (!own.some(i => Math.abs(nav.pos[i].y - room.y) < 0.35 && seen[i])) {
        bad.push(`${b.id}: этаж ${room.floor} (${room.y} м) без достижимых узлов`);
      }
    }
    if (b.roof?.walkable) {
      roofed++;
      if (!own.some(i => Math.abs(nav.pos[i].y - b.roofY) < 0.35 && seen[i])) {
        bad.push(`${b.id}: кровля на ${b.roofY} м недостижима`);
      }
    }
  }
  const missAuthor = AUTHORED_10.filter(id => {
    const b = map.buildings.find(x => x.id === id);
    return !b || !b.isEnterable;
  });
  const dead = nav.pos.filter((_, i) => !seen[i]).length;
  return {
    name: 'Глава 10: авторские доминанты и все вводимые дома открыты ногами на своих берегах',
    passed: missAuthor.length === 0 && generated >= 250 && enterable >= 25 && roofed >= 10
      && dead === 0 && bad.length === 0,
    info: bad.length || missAuthor.length
      ? [...missAuthor.map(id => `${id}: нет вводимого дома`), ...bad].slice(0, 3).join('; ')
      : `${generated} домов генератора, ${enterable} вводимых (${roofed} с кровлей), авторских ${AUTHORED_10.length}, `
        + `узлов ${nav.pos.length}, недостижимых ${dead}`,
  };
}

// ----------------------------------------------- окна фасадов и мусор района

/**
 * Светящиеся окна и мусор кровель-тротуаров — картинка, собранная картой из её
 * же данных (`spec.windows` и `spec.clutter` включают механизм). Проверяется
 * ровно то, из-за чего иначе пострадал бы геймплей или загрузка: главы без
 * секций обязаны остаться как раньше, картинки не смеют трогать твёрдость и
 * граф, квад обязан висеть снаружи своей стены и смотреть наружу (иначе стекло
 * прячется в солид или торчит в соседний дом), предмет обязан стоять на реальной
 * опоре с запасом над головой (иначе вентляционная коробка висит над проёмом), а
 * `dispose()` — убрать меши и материалы окон, но не общие материалы пропов.
 */

/** Меши окон в сцене: инстансы с `MeshBasicMaterial` — окно не освещается, оно и есть свет. */
function windowMeshes(scene) {
  return scene.children.filter(o => o.isInstancedMesh && o.material.isMeshBasicMaterial);
}

let winBuilt = null;

/** Глава 10 в своей сцене: нужны не только счётчики, но и буферы экземпляров. */
function windowsInScene() {
  if (!winBuilt) {
    winBuilt = { map: chapter10(), scene: city10Scene, meshes: windowMeshes(city10Scene) };
  }
  return winBuilt;
}

function testWindowsNeedSection() {
  const scene = new THREE.Scene();
  const map = createJsonMap(LEVEL_09.map);
  map.build(scene);
  const win = windowMeshes(scene);
  const ok = map.winCfg === null && map.windowCount === 0
    && map.clutterCfg === null && map.clutterCount === 0 && win.length === 0;
  map.dispose();
  return {
    name: 'Без секций `windows` и `clutter` картинок нет: глава 9 собирается как раньше',
    passed: ok,
    info: ok ? `глава 9: окон ${map.windowCount}, мусора ${map.clutterCount}, `
      + `мешей картинок ${win.length}, солидов ${map.solids.length}`
      : `окон ${map.windowCount}, мусора ${map.clutterCount}, мешей ${win.length} при отсутствующих секциях`,
  };
}

function testWindowMeshes() {
  const { map, meshes } = windowsInScene();
  const cfg = map.winCfg;
  const palette = new Set([...cfg.litColors, cfg.darkColor]);
  const offPalette = meshes.filter(m => !palette.has(m.material.color.getHex()));
  const instances = meshes.reduce((n, m) => n + m.count, 0);
  const nan = meshes.filter(m => Array.from(m.instanceMatrix.array).some(v => !Number.isFinite(v))).length;
  return {
    name: 'Окна — инстансы палитры: счётчик, меши и матрицы без NaN',
    passed: map.windowCount >= 20000 && instances === map.windowCount && meshes.length <= 4
      && offPalette.length === 0 && nan === 0,
    info: `${map.windowCount} окон на ${meshes.length} мешах палитры (инстансов ${instances}), `
      + `вне палитры ${offPalette.length}, матриц с NaN ${nan}`,
  };
}

function testWindowDeterminism() {
  const scenes = [new THREE.Scene(), new THREE.Scene()];
  const maps = scenes.map(s => {
    const m = createJsonMap(LEVEL_10.map);
    m.build(s);
    return m;
  });
  const lists = scenes.map(s => windowMeshes(s)
    .sort((a, b) => a.material.color.getHex() - b.material.color.getHex()));
  let diff = 0;
  if (maps[0].windowCount !== maps[1].windowCount || lists[0].length !== lists[1].length) {
    diff = Infinity;
  } else {
    for (let i = 0; i < lists[0].length; i++) {
      const A = lists[0][i].instanceMatrix.array;
      const B = lists[1][i].instanceMatrix.array;
      if (A.length !== B.length) { diff = Infinity; break; }
      for (let k = 0; k < A.length; k++) if (A[k] !== B[k]) diff++;
    }
  }
  for (const m of maps) m.dispose();
  return {
    name: 'Детерминизм окон: два сбора дают побитово равные матрицы экземпляров',
    passed: diff === 0 && maps[0].windowCount > 0,
    info: diff === 0 ? `${maps[0].windowCount} окон, ${lists[0].length} меша — матрицы совпали побитово`
      : `различий в матрицах — ${diff}`,
  };
}

function testWindowNeutral() {
  const withW = windowsInScene().map;
  const raw = structuredClone(LEVEL_10.map);
  delete raw.windows;
  delete raw.clutter;
  const plain = createJsonMap(raw);
  plain.build(new THREE.Scene());
  const e = LEVEL_10.gameplay.exit;
  const target = { x: e.x, y: plain.groundHeightAt(e.x, e.z, 500), z: e.z };
  const a = withW.findPath(withW.spawn, target);
  const b = plain.findPath(plain.spawn, target);
  const same = (u, v) => u.length === v.length && u.every((p, i) => p.x === v[i].x && p.y === v[i].y && p.z === v[i].z);
  const bad = [];
  if (!a || !b) bad.push(`маршрута нет: ${a ? 'есть' : 'нет'} против ${b ? 'есть' : 'нет'}`);
  else if (!same(a, b)) bad.push(`маршрут A→B разный: ${a.length} шагов против ${b.length}`);
  if (plain.winCfg || plain.clutterCfg) bad.push('секций нет, а настройки остались');
  if (plain.windowCount || plain.clutterCount) bad.push(`без секций собрано ${plain.windowCount} окон и ${plain.clutterCount} предметов`);
  if (withW.solids.length !== plain.solids.length) bad.push(`солидов ${withW.solids.length} против ${plain.solids.length}`);
  if (withW.blockers.length !== plain.blockers.length) bad.push(`блокиров ${withW.blockers.length} против ${plain.blockers.length}`);
  if (withW.surfaces.length !== plain.surfaces.length) bad.push(`опор ${withW.surfaces.length} против ${plain.surfaces.length}`);
  if (withW.nav.pos.length !== plain.nav.pos.length) bad.push(`узлов ${withW.nav.pos.length} против ${plain.nav.pos.length}`);
  plain.dispose();
  return {
    name: 'Окна и мусор — только картинка: твёрдость, опоры, граф и маршрут A→B не меняются',
    passed: bad.length === 0 && !!a && a.length > 10,
    info: bad.length ? bad.slice(0, 3).join('; ')
      : `${withW.windowCount} окон + ${withW.clutterCount} предметов против нуля: солидов ${withW.solids.length}, `
        + `опор ${withW.surfaces.length}, узлов ${withW.nav.pos.length}, маршрут ${a.length} шагов — совпали`,
  };
}

function testWindowFacesOutward() {
  const { map, meshes } = windowsInScene();
  const step = Math.max(1, Math.floor(meshes.reduce((n, m) => n + m.count, 0) / 200));
  let checked = 0, bad = 0;
  const first = [];
  for (const m of meshes) {
    const a = m.instanceMatrix.array;
    for (let i = 0; i < m.count; i += step) {
      const o = i * 16;
      // колонка 2 матрицы — нормаль квада (s, 0, c), колонка 3 — его центр
      const nx = a[o + 8], nz = a[o + 10];
      const x = a[o + 12], y = a[o + 13], z = a[o + 14];
      const inward = map.raySolid(x, y, z, -nx, 0, -nz, 0.5);
      const outward = map.raySolid(x, y, z, nx, 0, nz, 1.5);
      checked++;
      // стекло висит на `offset` наружу от грани стены: позади него обязана быть
      // именно эта стена, а спереди — воздух хотя бы в полметра
      const why = !inward ? 'за стеклом нет стены'
        : inward.dist > 0.12 ? `стена в ${inward.dist.toFixed(2)} м за стеклом`
        : outward && outward.dist < 0.5 ? `стена в ${outward.dist.toFixed(2)} м перед стеклом` : null;
      if (why) {
        bad++;
        if (first.length < 3) first.push(`${why} (${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)})`);
      }
    }
  }
  return {
    name: 'Квад окна сидит снаружи своей стены и смотрит наружу',
    passed: checked > 150 && bad === 0,
    info: bad ? `${bad} из ${checked}: ${first.join('; ')}`
      : `${checked} квадов: стена за каждым на ≤ 0,12 м, перед каждым — воздух ≥ 0,5 м`,
  };
}

function testWindowLitRatio() {
  const { map, meshes } = windowsInScene();
  const cfg = map.winCfg;
  const lit = new Set(cfg.litColors);
  let litCount = 0;
  const seenLit = new Set();
  for (const m of meshes) {
    const hex = m.material.color.getHex();
    if (!lit.has(hex)) continue;
    litCount += m.count;
    seenLit.add(hex);
  }
  const ratio = litCount / map.windowCount;
  return {
    name: 'Доля горящих окон держит настройку `lit`, цвета палитры используются все',
    passed: ratio > 0.35 && ratio < 0.55 && seenLit.size === cfg.litColors.length,
    info: `горящих ${litCount} из ${map.windowCount} (${(ratio * 100).toFixed(1)} % при базе ${cfg.lit}), `
      + `цветов палитры в сцене ${seenLit.size} из ${cfg.litColors.length}`,
  };
}

/**
 * Бюджет района: узкое место — не треугольники геометрии, а число отрисовок и
 * экземпляров (один меш на цвет палитры + один на тип пропа), поэтому окна и
 * мусор инстансятся. Верхние границы — замер главы 10 с запасом: геометрия района
 * даёт 10 мешей, окна добавляют 4, пропы с мусором — 13.
 */
function testDistrictBudget() {
  const { map, scene } = windowsInScene();
  let meshes = 0, geoTris = 0, instTris = 0, instances = 0;
  for (const o of scene.children) {
    if (!o.isMesh && !o.isInstancedMesh) continue;
    meshes++;
    const g = o.geometry;
    const t = (g.index ? g.index.count : g.getAttribute('position').count) / 3;
    geoTris += t;
    const n = o.isInstancedMesh ? o.count : 1;
    instances += n;
    instTris += t * n;
  }
  const ok = meshes <= 34 && map.windowCount <= 40000 && instTris <= 280000 && instances <= 45000;
  return {
    name: 'Бюджет района: отрисовки, экземпляры и треугольники с окнами и мусором',
    passed: ok,
    info: `${meshes} мешей (отрисовок), ${map.windowCount} окон и ${map.clutterCount} предметов `
      + `мусора, ${instances} экземпляров, ${(Math.round(instTris) / 1000).toFixed(1)} тыс. треугов `
      + `с инстансами (сумма геометрий — ${(Math.round(geoTris) / 1000).toFixed(1)} тыс.)`,
  };
}

function testWindowDispose() {
  const scene = new THREE.Scene();
  const map = createJsonMap(LEVEL_10.map);
  map.build(scene);
  const win = windowMeshes(scene);
  const shared = scene.children.filter(o => o.isInstancedMesh && o.userData.sharedMaterial);
  let winDisposed = 0, sharedDisposed = 0;
  for (const m of win) {
    const d = m.material.dispose.bind(m.material);
    m.material.dispose = () => { winDisposed++; d(); };
  }
  for (const m of shared) {
    const d = m.material.dispose.bind(m.material);
    m.material.dispose = () => { sharedDisposed++; d(); };
  }
  map.dispose();
  const leftMeshes = scene.children.filter(o => o.isMesh || o.isInstancedMesh).length;
  return {
    name: 'dispose() убирает меши окон и их материалы, но не общие материалы пропов',
    passed: win.length > 0 && shared.length > 0 && leftMeshes === 0
      && winDisposed === win.length && sharedDisposed === 0,
    info: `${win.length} мешей окон убрано из сцены, их материалов disposed — ${winDisposed}, `
      + `общих материалов пропов тронуто ${sharedDisposed} из ${shared.length}; меши в сцене: ${leftMeshes}`,
  };
}

/** Меши пропов в сцене: инстансы, помеченные картой как носящие общий материал. */
function propMeshes(scene) {
  return scene.children.filter(o => o.isInstancedMesh && o.userData.sharedMaterial);
}

/**
 * Мусор ставится по тем же правилам, что и опоры ног: под предметом обязана быть
 * поверхность уровня его основания, а над ним — свободное место по высоте самого
 * предмета. Проверяются оба прохода отдельно: кровля без улицы (или наоборот)
 * выглядела бы как квартал, заставленный кондиционерами только на крышах.
 */
function testClutterPlacement() {
  const map = windowsInScene().map;
  const C = map.clutterCfg;
  const items = map._clutterItems();
  const models = new Set(propModels());
  const unknown = items.filter(i => !models.has(i.model));
  const kinds = new Set(items.map(i => i.model));
  // мусор кровли берётся и из списка обычных крыш, и из списка высоких зданий,
  // поэтому улица считается по своему списку, а всё остальное легло на крыши
  const street = items.filter(i => C.streetModels.includes(i.model)).length;
  const roof = items.length - street;

  const step = Math.max(1, Math.floor(items.length / 200));
  let checked = 0, failed = 0;
  const first = [];
  for (let i = 0; i < items.length; i += step) {
    const { x, y, z } = items[i].position;
    // вниз — опора под основанием: основание ставится на кровлю или на грунт,
    // поэтому луч от 0,8 м над ним обязан упереться в геометрию в этом же метре,
    // а не в пустоту (предмет висит над проёмом) и не в далёкое дно (торчит из
    // солида, из которого луч выходит снизу)
    const down = map.raySolid(x, y + 0.8, z, 0, -1, 0, 1.6);
    const up = map.raySolid(x, y + 0.2, z, 0, 1, 0, C.head);
    checked++;
    const why = !down ? 'под основанием нет опоры'
      : down.dist < 0.5 ? `опора в ${down.dist.toFixed(2)} м под основанием — предмет провалилён в геометрию`
      : down.dist > 1.1 ? `опора в ${(0.8 - down.dist).toFixed(2)} м под основанием`
      : up ? `над предметом потолок в ${up.dist.toFixed(2)} м` : null;
    if (why) {
      failed++;
      if (first.length < 3) first.push(`${why} (${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)})`);
    }
  }

  return {
    name: 'Мусор стоит на своей опоре и под свободным потолком, типы — из списка моделей',
    passed: items.length >= 500 && unknown.length === 0 && roof > 50 && street > 50
      && checked > 150 && failed === 0 && map.clutterCount === items.length,
    info: failed ? `${failed} из ${checked}: ${first.join('; ')}`
      : `${items.length} предметов (${roof} на кровлях, ${street} на улицах), типов ${kinds.size}, `
        + `${checked} проб: опора под каждой, потолок свободен`,
  };
}

function testClutterDeterminism() {
  const scenes = [new THREE.Scene(), new THREE.Scene()];
  const maps = scenes.map(s => {
    const m = createJsonMap(LEVEL_10.map);
    m.build(s);
    return m;
  });
  const lists = scenes.map(propMeshes);
  // сравниваются матрицы, а не сумма `count`: тип из двух частей (дерево, фонарь,
  // авиатерраса) даёт два меша с одним и тем же счётчиком, и по экземплярам
  // число предметов не восстанавливается
  let diff = 0;
  if (lists[0].length !== lists[1].length) diff = Infinity;
  else {
    for (let i = 0; i < lists[0].length; i++) {
      const A = lists[0][i].instanceMatrix.array;
      const B = lists[1][i].instanceMatrix.array;
      if (A.length !== B.length) { diff = Infinity; break; }
      for (let k = 0; k < A.length; k++) if (A[k] !== B[k]) diff++;
    }
  }
  const items = maps.map(m => m._clutterItems());
  const same = items[0].length === items[1].length
    && items[0].every((it, i) => {
      const o = items[1][i];
      return it.model === o.model && it.rotationY === o.rotationY
        && it.position.x === o.position.x && it.position.y === o.position.y && it.position.z === o.position.z
        && it.scale.x === o.scale.x && it.scale.y === o.scale.y && it.scale.z === o.scale.z;
    });
  for (const m of maps) m.dispose();
  return {
    name: 'Детерминизм мусора: два сбора дают равные предметы и побитово равные матрицы',
    passed: diff === 0 && same && items[0].length === maps[0].clutterCount && items[0].length > 0,
    info: diff === 0 && same
      ? `${items[0].length} предметов совпали по всем полям, ${lists[0].length} мешей пропов — `
        + 'матрицы экземпляров совпали побитово'
      : `различий в матрицах — ${diff}, списки предметов ${same ? 'совпали' : 'разошлись'}`,
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
    testWaterFrame,
    testWaterRay,
    testWaterSlopes,
    testWaterNav,
    testWaterPillarsAndIds,
    testVertRoofSupport,
    testVertRoofHoles,
    testVertLadderClimb,
    testVertSkybridgeSolid,
    testVertPaths,
    testVertIdsAndMinimap,
    testVertDeterminism,
    testCityHousesReachable,
    testCityDoorReachesStreet,
    testChapter10Route,
    testChapter10Interiors,
    testWindowsNeedSection,
    testWindowMeshes,
    testWindowDeterminism,
    testWindowNeutral,
    testWindowFacesOutward,
    testWindowLitRatio,
    testDistrictBudget,
    testWindowDispose,
    testClutterPlacement,
    testClutterDeterminism,
    testMeshAndLights,
    testMinimap,
    testOpenPositions,
    testDebugIds,
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
