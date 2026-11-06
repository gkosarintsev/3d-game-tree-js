/**
 * Скелет улиц открытого мира — § 4.2 плана `docs/open-world-plan.md`.
 *
 * Строит парсер и кладёт в `index.js`: браузер не перебирает плиту мира, а
 * читает готовые узлы и рёбра. Цена — **протяжённость содержимого, а не
 * площадь**: узлы идут вдоль осей дорог, сходов и наружных дверей, а не по
 * решётке всей плиты (шаг 6 м на плите 1400 м — 234² = 54 756 клеток против
 * 3 864 узлов скелета на той же плите; первые растут с площадью, второй — с
 * километражом содержимого).
 *
 * Что попадает в скелет (решение владельца «только магистрали»): оси дорог и
 * настилов шагом `J.navStep × 4`, берега русел и сходы в них, наружные двери
 * первого этажа. Интерьеры, марши, кровли-опоры и подвесные переходы остаются
 * локальными решётками чанка — у скелета одна обязанность: быть одной связной
 * сетью, через которую видно каждый чанк, каждую дверь наземного уровня и
 * каждый настил дороги.
 *
 * Почему переходы (`type: 'skybridge'`) вне скелета: по AGENTS их торцы
 * совпадают с полом комнаты или с ходовой кровлей — с тем, что правило выше
 * уже отдал чанку. Снаружи такой настил не соединён ни с чем, и включённый в
 * скелет он висел бы отдельной компонентой: гейт «одна сеть» краснел бы не из-за
 * брифа, а из-за примитива без наружного входа. Сюита § 7.1 п. 5 мерит эту
 * цену списком, а не молчанием.
 *
 * Одна арифметика с движком — `SurfaceField` (three-free): цепочки точек
 * (`deckChain`, `descentChain`), отбор наружной двери (`_inPlan`) и проверка
 * ребра (`bodyClearLine` + `_edgeSupported`) те же, что держат собранный граф
 * главы. Вторая реализация сделала бы скелет правдой, которой карта не
 * делится, — ровно то, из-за чего проба опоры уехала в `src/surfaces.js`.
 */
import { CONFIG } from '../src/config.js';
import { SurfaceField } from '../src/surfaces.js';
import { r3 } from '../src/geo2d.js';

const J = CONFIG.jsonMap;

/** Шаг осевых точек — `J.navStep × 4` (§ 4.2): 24 м при решёточном шаге 6 м. */
export const SKELETON_STEP = J.navStep * 4;
/**
 * Предел длинного ребра. Число — не «шире квартала», а замер на фикстуре
 * 1,96 км² (после её правки этим этапом): всё, что склеивает сеть в одну,
 * укладывается в 90,87 м (`meta.longestJoin`), предел 60 м уже режет сеть на
 * **5 компонент** и оставляет **1 214 элемента** вне покрытия, а 96 и 120 м
 * дают тот же граф. Верхняя граница — только деньги: 240 м дают ровно те же
 * 3 863 ребра за 1 433 мс вместо 940, 480 м — за 2 254 мс, потому что
 * кандидатов в сетке становится 708 тыс. и 1,36 млн против 275 тыс. Цена
 * длинного ребра — длина × проба `J.navEdgeProbe` (0,5 м), и на каждом шаге
 * запаса её платят все кандидаты. 120 м = `SKELETON_STEP × 5` — запас над
 * замеренным худшим стыком, а не оптимум по времени (числа — план, § 6 этап 2).
 */
export const SKELETON_GAP = SKELETON_STEP * 5;
/**
 * Дверь наземная, если её пол совпадает с `baseY` дома в пределах шва плит.
 * Экспорт — потому что гейт § 7.1 п. 5 («скелет проходит каждую дверь») обязан
 * брать тот же отбор, что и фаза 3: «наружная наземная дверь» без общего числа
 * означала бы два разных списка, и красный гейт показал бы меру, а не дыру.
 */
export const GROUND_FIT = 0.02;

/**
 * Скелет нормализованной карты мира.
 *
 * @param {object} map нормализованная карта (`normalizeLevel(...).map`)
 * @param {{step?:number, gap?:number, field?:SurfaceField}} opts
 *   `step` — шаг осевых точек, `gap` — предел длинного ребра, `field` —
 *   готовое поле опоры: сюита § 7.1 берёт его, чтобы мерить цену рёбер без
 *   второго `collectData`, а парсер зовёт без него.
 * @returns {{nodes:number[][], edges:number[][], meta:object}}
 */
export function skeletonOf(map, opts = {}) {
  const step = opts.step ?? SKELETON_STEP;
  const gap = opts.gap ?? SKELETON_GAP;
  const field = opts.field ?? new SurfaceField(map);
  // Фазы мерятся отдельно: «15,8 с на парсере» не говорит, что из них — поле
  // опоры (которое этап 1 уже считает на разрезке), а что — перебор пар.
  const laps = {};
  let lap = performance.now();
  const mark = (name) => { laps[name] = +(performance.now() - lap).toFixed(0); lap = performance.now(); };
  if (!opts.field) field.collectData();
  mark('field');

  /** @type {{x:number,y:number,z:number}[]} мировые узлы; ключи остаются здесь, в файл едут числа */
  const nodes = [];
  /** @type {number[][]} */
  const adj = [];
  const byKey = new Map();
  const add = (p, key) => {
    const known = byKey.get(key);
    if (known !== undefined) return known;
    const i = nodes.length;
    // Числа идут без квантования. Квант в миллиметр (`r3`) сдвигал узел стыка
    // за торец ленты: замер на шве `ring_ring:17→18` фикстуры — опора вместо
    // 10,381 м отвечает 1,255 м, то есть узел повисает в 9,13 м над грунтом,
    // ребро бракует `_edgeSupported`, и кольцо рвётся на две компоненты. Границы
    // пластин сходятся с допуском 1e-9 м (AGENTS, «собственный срез»), поэтому
    // в `index.js` едет ровно та двойная точность, на которой сходится опора.
    nodes.push({ x: p.x, y: p.y, z: p.z, key });
    adj.push([]);
    byKey.set(key, i);
    return i;
  };

  /**
   * Вердикт отдаёт `edgeOk` — единственная правда о проходимости. Причины
   * считаются только на бракованных рёбрах: их большинство, а разбор на всех
   * удвоил бы цену прогона, к правде ничего не добавив.
   */
  const stats = { linked: 0, stepDown: 0, dropClear: 0, dropSupport: 0 };
  const edges = [];
  const accept = (a, b) => {
    if (a === b) return false;
    const pa = nodes[a], pb = nodes[b];
    if (field.edgeOk(pa, pb)) {
      edges.push(a < b ? [a, b] : [b, a]);
      adj[a].push(b);
      adj[b].push(a);
      stats.linked++;
      return true;
    }
    if (Math.abs(pa.y - pb.y) > field.stepUp) stats.stepDown++;
    else if (!field.bodyClearLine(pa, pb)) stats.dropClear++;
    else stats.dropSupport++;
    return false;
  };

  // Покрытие мерится всеми узлами каждого элемента, а не «есть ли рядом узел»:
  // цепочка с отвергнутым ребром внутри себя даёт половину настила в сети, а
  // половину — нет, и «3 842 узла» об этом не скажут ни слова.
  const covered = [];
  // Торцы цепочек. Это НЕ «узлы с одной связью»: торец пластины, состыкованной
  // с соседней по оси той же дороги, имеет степень 2, и именно в него упирается
  // нос съезда (`ring_e1:0:0` на фикстуре — 0,000 м до `ring_ring:16:1`, пробы
  // «linked», а компоненты разрозненны). Кандидат на длинное ребро —
  // геометрический конец цепочки, а не её степень: флаг ставится при эмиссии.
  const ends = new Set();

  /** Одна цепочка: узлы, рёбра между соседями, торцы в `ends`, элемент в покрытии. */
  const emitChain = (pts, keyOf, what, id) => {
    const made = [];
    let prev;
    for (const [k, p] of pts.entries()) {
      const node = add(p, keyOf(k));
      made.push(node);
      if (prev !== undefined) accept(prev, node);
      prev = node;
    }
    if (!made.length) return null;
    ends.add(made[0]);
    ends.add(made[made.length - 1]);
    covered.push({ what, id, nodes: made });
    return made;
  };

  // -- 1. Оси дорог и настилов. Стык соседних пластин одной дороги связывается
  //    тем же `accept`, что и всё остальное: пролёт, через который нога не
  //    проходит, не становится ребром скелета, и гейт «каждый настил» это видит.
  let skybridges = 0;
  for (const road of field.roads) {
    if (road.type === 'skybridge') { skybridges++; continue; }
    let prevEnd;
    for (const [di, d] of (road.decks ?? []).entries()) {
      const made = emitChain(field.deckChain(d, step),
        k => `k:d:${road.id}:${di}:${k}`, 'deck', `${road.id}:${di}`);
      if (!made) continue;
      if (prevEnd !== undefined) accept(prevEnd, made[0]);
      prevEnd = made[made.length - 1];
    }
  }

  // -- 2. Берега русел и сходы: тот же подбор шага по перепаду, что у настилов.
  for (const d of field.descents) {
    const pts = field.descentChain(d, step);
    if (pts) emitChain(pts, k => `k:f:${d.id}:${k}`, 'bank', d.id);
  }

  // -- 3. Наружные двери первого этажа: узел стоит ровно там, где его ставит
  //    движок (`_navDoors` — та же проба опоры от `d.y`), а отбор наружной —
  //    тот же фильтр `_inPlan`, что и у связывания двери с решёткой улицы.
  for (const b of field.buildings) {
    for (const d of b.doors ?? []) {
      if (field._inPlan(b, d.outside)) continue;
      if (Math.abs(d.y - b.baseY) > GROUND_FIT) continue;
      const node = add(
        { x: d.outside.x, z: d.outside.z, y: field.groundHeightAt(d.outside.x, d.outside.z, d.y) },
        `k:e:${d.id}:o`,
      );
      ends.add(node);
      covered.push({ what: 'door', id: d.id, nodes: [node] });
    }
  }

  mark('chains');
  const before = components(adj);

  // -- 4. Длинные рёбра. Кандидат — пара, где хотя бы один конец является
  //    торцом цепочки или дверью: уличная сеть — граф пролётов, и все её
  //    соединения лежат на торцах. Середина пролёта соседом быть может —
  //    например, полотно петли над проспектом, — поэтому сетка держит ВСЕ
  //    узлы, а обходят её только торцы.
  const grid = new Map();
  for (let i = 0; i < nodes.length; i++) {
    const p = nodes[i];
    const key = `${Math.floor(p.x / gap)}:${Math.floor(p.z / gap)}`;
    let list = grid.get(key);
    if (!list) grid.set(key, list = []);
    list.push(i);
  }
  const cands = [];
  const tried = new Set();
  for (const i of ends) {
    const p = nodes[i];
    const ci = Math.floor(p.x / gap), ck = Math.floor(p.z / gap);
    for (let dj = -1; dj <= 1; dj++) {
      for (let di = -1; di <= 1; di++) {
        const list = grid.get(`${ci + di}:${ck + dj}`);
        if (!list) continue;
        for (const j of list) {
          if (j === i) continue;
          const q = nodes[j];
          // Перепад больше шага ноги отсекается до `hypot` и до сетки: на
          // фикстуре это 89 % пар (54 790 из 61 775 проверок), и все они —
          // террасы соседних районов. Тот же первый член `edgeOk`, только
          // досрочно; вердикт всё равно отдаёт `edgeOk`.
          if (Math.abs(q.y - p.y) > field.stepUp) continue;
          const d = Math.hypot(q.x - p.x, q.z - p.z);
          // Нижней границы нет намеренно: узлы двух цепочек сходятся в стыке и
          // на 0,000 м (разные арифметики — `rotatePoint` у пластины и `cos`/
          // `sin` у дуги — дают одно и то же число). Защита от `d < 0,01`
          // роняла именно их: `describeIslands` показывала пару в 0,000 м со
          // словом «linked», а компоненты оставались разрозненными — 2 из 7 на
          // фикстуре. От самого себя узел уже отсекает `j === i`.
          if (d > gap) continue;
          const key = (i < j ? i : j) * nodes.length + (i < j ? j : i);
          if (tried.has(key)) continue;
          tried.add(key);
          cands.push({ a: i, b: j, d });
        }
      }
    }
  }
  // Крускал: по расстоянию, при равных — по индексам. Порядок принятия рёбер
  // не должен зависеть от обхода хеш-сетки, иначе `index.js` не сойдётся
  // побайтово на двух прогонах одного брифа.
  mark('cands');
  cands.sort((x, y) => (x.d - y.d) || (x.a - y.a) || (x.b - y.b));
  const uf = Int32Array.from({ length: before.count }, (_, i) => i);
  const find = (v) => { while (uf[v] !== v) v = uf[v] = uf[uf[v]]; return v; };
  let joined = 0;
  let longestJoin = 0;
  for (const c of cands) {
    const ra = find(before.of[c.a]), rb = find(before.of[c.b]);
    if (ra === rb) continue;
    if (!accept(c.a, c.b)) continue;
    uf[ra] = rb;
    if (c.d > longestJoin) longestJoin = c.d;
    if (++joined === before.count - 1) break;
  }
  mark('join');

  const after = components(adj);
  const main = after.list[0];
  const missing = [];
  for (const c of covered) if (!c.nodes.every(i => main.has(i))) missing.push(`${c.what}:${c.id}`);
  const islands = describeIslands(after, nodes, field, gap);
  mark('report');

  return {
    nodes: nodes.map(n => [n.x, n.y, n.z]),
    edges,
    meta: {
      step,
      gap,
      nodes: nodes.length,
      edges: edges.length,
      ends: ends.size,
      cands: cands.length,
      checks: stats.linked + stats.stepDown + stats.dropClear + stats.dropSupport,
      linked: stats.linked,
      rejected: { step: stats.stepDown, clear: stats.dropClear, support: stats.dropSupport },
      joined,
      longestJoin: r3(longestJoin),
      skybridges,
      ms: laps,
      components: { before: before.count, after: after.count, sizes: after.sizes.slice(0, 12) },
      covered: { total: covered.length, missing: missing.slice(0, 20), missingCount: missing.length },
      // Почему сеть не сошлась: для каждой оставшейся компоненты — кратчайшее
      // расстояние до другой и вердикт проб на нём. Без этого красная сюита
      // сказала бы «11 компонент», а что править в брифе — нет.
      islands,
    },
  };
}

/**
 * Протяжённость осей содержимого — знаменатель цены скелета.
 *
 * Экспортируется потому, что мерить «узлов ∝ километраж, а не площадь» должны
 * два потребителя одним числом: гейт § 7.1 п. 5 (`tools/chunk.test.mjs`) и
 * таблица `probe/skeleton-cost.mjs`. Формула — геометрическая (длина пластины,
 * `R·Δφ` у дуги), а не длина цепочки `deckChain`: второе дало бы отношение
 * узлов к обратному шагу и ничего не доказывало бы. Переходы (`skybridge`) не
 * входят — их скелет сознательно не ведёт, и их километраж был бы мнимым
 * знаменателем.
 *
 * @param {SurfaceField} field собранное поле (`collectData()` уже вызван)
 * @returns {{km:number, decks:number, skyDecks:number}}
 */
export function axisLength(field) {
  let m = 0, decks = 0, skyDecks = 0;
  for (const road of field.roads) {
    if (road.type === 'skybridge') {
      skyDecks += (road.decks ?? []).length;
      continue;
    }
    for (const d of road.decks ?? []) {
      m += d.arc ? Math.abs(d.R * d.span * Math.PI / 180)
        : typeof d.length === 'number' ? d.length
        : d.axis === 'z' ? d.maxZ - d.minZ : d.maxX - d.minX;
      decks++;
    }
  }
  // сходы в русло — те же оси, по которым скелет кладёт узлы (фаза 2)
  for (const d of field.descents) {
    m += d.axis === 'z' ? d.plan.maxZ - d.plan.minZ : d.plan.maxX - d.plan.minX;
    decks++;
  }
  return { km: m / 1000, decks, skyDecks };
}

/**
 * Компоненты связности по `adj`. Обход — по индексам узлов, он детерминирован;
 * `sizes` сортируются по убыванию, поэтому `list[0]` — всегда большая сеть, а
 * покрытие меряется относительно неё, а не относительно «первой найденной».
 */
function components(adj) {
  const n = adj.length;
  const of = Int32Array.from({ length: n }, () => -1);
  const list = [];
  let c = 0;
  for (let s = 0; s < n; s++) {
    if (of[s] >= 0) continue;
    const q = [s];
    of[s] = c;
    for (let h = 0; h < q.length; h++) {
      for (const nb of adj[q[h]]) if (of[nb] < 0) { of[nb] = c; q.push(nb); }
    }
    list.push(new Set(q));
    c++;
  }
  const order = list.map((set, i) => [i, set.size]).sort((a, b) => b[1] - a[1] || a[0] - b[0]);
  return { of, count: c, sizes: order.map(e => e[1]), list: order.map(e => list[e[0]]) };
}

/**
 * Оставшиеся компоненты: габарит, отметка узла и ближайшее расстояние до
 * другой компоненты с вердиктом проб на нём. Перебор идёт по узлам пары
 * компонент, а не по всему миру, и только когда их больше одной: зелёный
 * прогон за эту ветку не платит.
 */
function describeIslands(after, nodes, field, gap) {
  if (after.count <= 1) return [];
  const groups = after.list.map(set => [...set]);
  const out = [];
  for (let a = 0; a < groups.length; a++) {
    const ids = groups[a];
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity, minY = Infinity;
    for (const i of ids) {
      const p = nodes[i];
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.z < minZ) minZ = p.z;
      if (p.z > maxZ) maxZ = p.z;
      if (p.y < minY) minY = p.y;
    }
    let best = null;
    const hist = new Map();
    for (const i of ids) {
      const parts = String(nodes[i].key).split(':');
      const tag = parts[1] === 'd' ? `дорога ${String(parts[2]).split('_')[0]}`
        : parts[1] === 'f' ? `сход ${parts[2]}` : parts[1] === 'e' ? 'дверь' : parts[1];
      hist.set(tag, (hist.get(tag) ?? 0) + 1);
    }
    for (let b = 0; b < groups.length; b++) {
      if (b === a) continue;
      for (const i of ids) {
        const p = nodes[i];
        for (const j of groups[b]) {
          const q = nodes[j];
          if (Math.abs(q.x - p.x) > gap || Math.abs(q.z - p.z) > gap) continue;
          const d = Math.hypot(q.x - p.x, q.z - p.z);
          if (d > gap || (best && d >= best.d)) continue;
          best = { d, to: b, why: verdict(field, p, q), at: p.key, over: q.key };
        }
      }
    }
    out.push({
      size: ids.length,
      top: [...hist].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).slice(0, 3)
        .map(([tag, n]) => `${tag}×${n}`),
      box: [r3(minX), r3(minZ), r3(maxX), r3(maxZ)],
      y: r3(minY),
      nearest: best ? { d: r3(best.d), to: best.to, why: best.why, at: best.at, over: best.over } : null,
    });
  }
  return out;
}

/** Тот же порядок проб, что у `accept`, но как слово, а не как счётчик. */
function verdict(field, a, b) {
  if (Math.abs(a.y - b.y) > field.stepUp) return 'step';
  if (!field.bodyClearLine(a, b)) return 'clear';
  if (!field._edgeSupported(a, b)) return 'support';
  return 'linked';
}
