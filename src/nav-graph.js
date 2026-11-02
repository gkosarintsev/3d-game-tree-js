/**
 * Граф навигации врагов — общий для всех типов карты (улица, город, рельеф).
 *
 * Узел — проходимая точка мира {x, y, z}; ребро — пару узлов карта признала
 * связанными (соседство по клеткам, марш, сход с эстакады). Поиск маршрута
 * одинаковый: ближайший узел к точке + поиск в ширину, поэтому враги на любом
 * уровне ходят по одним и тем же правилам, а различается только построение графа.
 *
 * Узел получает необязательный флаг (meta) — рельеф помечает им клетки, чья
 * высота взята из аналитической поверхности, и связывает их по уклону.
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
  }

  /** Индекс узла по ключу (для связывания на следующем проходе). */
  id(key) {
    return this.byKey.get(key);
  }

  /** Добавляет узел (или возвращает уже добавленный с этим ключом). */
  add(x, y, z, key, meta = 0) {
    const known = this.byKey.get(key);
    if (known !== undefined) return known;
    const idx = this.pos.length;
    this.pos.push({ x, y, z });
    this.adj.push([]);
    this.meta.push(meta);
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

  /** Ближайший узел к точке; вертикаль весит вдвое — этаж важнее смещения в плане. */
  nearestNode(x, y, z) {
    let best = -1, bestD = Infinity;
    for (let i = 0; i < this.pos.length; i++) {
      const p = this.pos[i];
      const dy = (p.y - y) * 2;
      const d = (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z) + dy * dy;
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  /**
   * Случайный узел в радиусе от точки (блуждание врага); null — не нашлось.
   *
   * Узлы собираются одним проходом по графу, а не «60 раз угадаем случайный»:
   * на большой карте доля узлов рядом с точкой мала (в районе 700×700 м с 8,4
   * тыс. узлов в круг 55 м попадает ~2% списка), и отгадка почти всегда мимо.
   * Тогда `Enemy._pickWander` получает null, целью блуждания становится собственная
   * позиция, маршрут выходит длиной в один узел — и патруль стоит на месте.
   */
  randomPoint(x, z, radius) {
    const r2 = radius * radius;
    let count = 0, pick = -1;
    for (let i = 0; i < this.pos.length; i++) {
      const p = this.pos[i];
      const dx = p.x - x, dz = p.z - z;
      if (dx * dx + dz * dz > r2) continue;
      // reservoir-выбор: один проход, равномерный по всем подходящим узлам
      count++;
      if (Math.random() < 1 / count) pick = i;
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
