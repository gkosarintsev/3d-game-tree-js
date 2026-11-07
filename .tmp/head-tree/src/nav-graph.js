import { CONFIG } from './config.js';

/**
 * Граф навигации врагов — общий для всех типов карты (улица, город, рельеф).
 *
 * Узел — проходимая точка мира {x, y, z}; ребро — пару узлов карта признала
 * связанными (соседство по клеткам, марш, сход с эстакады). Поиск маршрута
 * одинаковый: ближайший узел + поиск в ширину, поэтому враги на любом уровне
 * ходят по одним и тем же правилам, а различается только построение графа.
 *
 * Узел получает необязательный флаг (meta) — рельеф помечает им клетки, чья
 * высота взята из аналитической поверхности, и связывает их по уклону.
 *
 * Узлы лежат в пространственной сетке (`this._cells`): на районе 600 × 600 м
 * решётка шагом 6 м даёт 10 201 узел, а `nearestNode` и `randomPoint` движок
 * зовёт на каждый маршрут и на каждый выбор цели блуждания — проход по всему
 * списку (20 тыс. вызовов в минуту на отряд врагов) это тот же прогон, что
 * держала глава 9 на 1235 узлах, только в 8 раз дольше.
 */
export class NavGraph {
  constructor() {
    /** @type {{x:number,y:number,z:number}[]} */
    this.pos = [];
    /** @type {number[][]} */
    this.adj = [];
    /** служебный флаг узла (у рельефа — «стоим на поверхности») */
    this.meta = [];
    /** ключ → индекс узла: повторный add того же ключа возвращает существующий узел */
    this.byKey = new Map();
    this._seen = new Uint8Array(0);
    this._prev = new Int32Array(0);
    this.cell = CONFIG.nav.cell;
    /** клетка плана → индексы узлов; дополняется на каждом add */
    this._cells = new Map();
    this._span = 0; // наибольшее число клеток от индекса узла до края индекса
  }

  /** Индекс узла по ключу (для связывания на следующем проходе). */
  id(key) {
    return this.byKey.get(key);
  }

  _cellKey(i, j) {
    return (i + 4096) * 8192 + (j + 4096);
  }

  /** Добавляет узел (или возвращает уже добавленный с этим ключом). */
  add(x, y, z, key, meta = 0) {
    const known = this.byKey.get(key);
    if (known !== undefined) return known;
    const idx = this.pos.length;
    this.pos.push({ x, y, z });
    this.adj.push([]);
    this.meta.push(meta);
    const ci = Math.floor(x / this.cell), ck = Math.floor(z / this.cell);
    const k = this._cellKey(ci, ck);
    let list = this._cells.get(k);
    if (!list) this._cells.set(k, list = []);
    list.push(idx);
    this._span = Math.max(this._span, ci + 1, ck + 1, -ci, -ck);
    if (key !== undefined) this.byKey.set(key, idx);
    return idx;
  }

  /** Двустороннее ребро; отсутствующий узел (undefined) и саморебро игнорируются. */
  link(a, b) {
    if (a === undefined || b === undefined || a === b) return;
    this.adj[a].push(b);
    this.adj[b].push(a);
  }

  /** Готовит буферы поиска; вызывать после построения всех узлов. */
  seal() {
    this._seen = new Uint8Array(this.pos.length);
    this._prev = new Int32Array(this.pos.length);
    return this;
  }

  /**
   * Индексы узлов, чья клетка попала в прямоугольник плана вокруг точки.
   * Возвращает кандидатов, а не отфильтрованный список: радиус проверяет
   * вызывающий (ему нужна своя метрика расстояния).
   */
  nearby(x, z, radius) {
    const c = this.cell;
    const out = [];
    const i0 = Math.floor((x - radius) / c), i1 = Math.floor((x + radius) / c);
    const k0 = Math.floor((z - radius) / c), k1 = Math.floor((z + radius) / c);
    for (let k = k0; k <= k1; k++) {
      for (let i = i0; i <= i1; i++) {
        const list = this._cells.get(this._cellKey(i, k));
        if (list) for (const idx of list) out.push(idx);
      }
    }
    return out;
  }

  /**
   * Ближайший узел к точке; вертикаль весит вдвое — этаж важнее смещения в плане.
   * Клетки перебираются кольцами от клетки точки, поэтому на городе в 10 тыс.
   * узлов поиск стоит десятки проверок, а не полный список.
   */
  nearestNode(x, y, z) {
    const c = this.cell;
    const ci = Math.floor(x / c), ck = Math.floor(z / c);
    let best = -1, bestD = Infinity;
    for (let ring = 0; ring <= this._span + 1; ring++) {
      if (ring > 0 && best >= 0 && (ring - 1) * c > Math.sqrt(bestD)) break;
      const visit = (i, k) => {
        const list = this._cells.get(this._cellKey(i, k));
        if (!list) return;
        for (const idx of list) {
          const p = this.pos[idx];
          const dy = (p.y - y) * 2;
          const d = (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z) + dy * dy;
          // равная дистанция разрешается в пользу меньшего индекса — как в
          // прежнем полном проходе по списку: кольца обходят клетки не по
          // порядку узлов, и при равных узлах у двери выбирался другой, а с ним
          // и другой последний шаг маршрута
          if (d < bestD || (d === bestD && idx < best)) { bestD = d; best = idx; }
        }
      };
      if (ring === 0) { visit(ci, ck); continue; }
      for (let a = -ring; a <= ring; a++) { visit(ci + a, ck - ring); visit(ci + a, ck + ring); }
      for (let b = -ring + 1; b <= ring - 1; b++) { visit(ci - ring, ck + b); visit(ci + ring, ck + b); }
    }
    return best;
  }

  /**
   * Случайный узел в радиусе от точки (блуждание врага); null — не нашлось.
   *
   * Узлы собираются одним проходом по клеткам круга, а не «60 раз угадаем
   * случайный»: на большой карте доля узлов рядом с точкой мала (в районе
   * 700×700 м с 8,4 тыс. узлов в круг 55 м попадает ~2% списка), и отгадка почти
   * всегда мимо. Тогда `Enemy._pickWander` получает null, целью блуждания
   * становится собственная позиция, маршрут выходит длиной в один узел — и
   * патруль стоит на месте.
   */
  randomPoint(x, z, radius) {
    const r2 = radius * radius;
    let count = 0, pick = -1;
    for (const idx of this.nearby(x, z, radius)) {
      const p = this.pos[idx];
      const dx = p.x - x, dz = p.z - z;
      if (dx * dx + dz * dz > r2) continue;
      // reservoir-выбор: один проход, равномерный по всем подходящим узлам
      count++;
      if (Math.random() < 1 / count) pick = idx;
    }
    return pick < 0 ? null : this.pos[pick];
  }

  /** Маршрут по узлам (поиск в ширину) от from до to; null — пути нет. */
  findPath(from, to) {
    const a = this.nearestNode(from.x, from.y, from.z);
    const b = this.nearestNode(to.x, to.y, to.z);
    if (a < 0 || b < 0) return null;
    if (a === b) return [this.pos[b]];

    const seen = this._seen, prev = this._prev;
    const queue = [a];
    seen[a] = 1;
    prev[a] = -1; // источник: возврат по prev должен на нём остановиться

    for (let head = 0; head < queue.length; head++) {
      const cur = queue[head];
      if (cur === b) break;
      for (const nb of this.adj[cur]) {
        if (seen[nb]) continue;
        seen[nb] = 1;
        prev[nb] = cur;
        queue.push(nb);
      }
    }

    const found = seen[b] === 1;
    for (const i of queue) seen[i] = 0; // буферы переиспользуются
    if (!found) return null;

    const path = [];
    for (let cur = b; cur !== -1; cur = prev[cur]) path.push(this.pos[cur]);
    return path.reverse();
  }
}
