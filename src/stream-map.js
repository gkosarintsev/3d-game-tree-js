import { ModelMap, columnsFromTriangles } from './model-map.js';
import { tileBuckets } from './glb.js';

/**
 * Глава из макета города, которая стримит его твёрдость (этап F): для движка
 * карта остаётся районом размером `(2r+1) · tile` метров, но когда игрок
 * переходит границу центрального тайла, окно переставляется — колонки, граф
 * улиц и меш собираются заново из корзин треугольников (`tileBuckets`,
 * src/glb.js). Весь макет при этом остаётся в памяти только как списки граней по
 * тайлам: колонки клеткой 1 м на 4,3 км дали бы 74 МБ и полмиллиона узлов
 * навигации, которые никто не ходит дальше одного района (замер).
 *
 * Наследник `ModelMap`, ничего не дублирующий: перестановка вызывает те же
 * `columnsFromTriangles`, `_buildNav`, `_minimapBlocks` и `build`. Два отличия,
 * ради которых этап и затевался:
 *
 * - растерка берёт **сырые координаты файла** и вычитает центр окна в двойной
 *   точности. Прежний путь (пересчитать вершины в локальные float32 на каждое
 *   окно) на стыке тайлов давал 13 клеток из 405 600 с разным вердиктом «стена»:
 *   у 6 граней из 156 508 площадь XZ-проекции сидит в шаге float32 от порога
 *   `wallArea`, и при другом центре окна она переходит порог в другую сторону —
 *   стена высотой 32 м то появляется, то исчезает;
 * - перестановка кратна тайлу: сетка колонок обязана сохранять фазу в масштабе
 *   файла, иначе два окна сравнивают разные клетки. Замер: сдвиг на целое число
 *   клеток (100 м) — 0 различий из 530 400, сдвиг на полклетки — 13 667 (2,2 %).
 *   Тайл 260 м — целое число клеток, а окно из нечётного их числа покрывает ровно
 *   3×3 корзины, поэтому лишние грани в растерку не попадают.
 *
 * Для контракта карты город = активное окно: `width`/`depth`/`bounds`/
 * `worldToNormalized` остаются размером `window` и переставляются вместе с ним
 * (обзорная камера, карта теней и миникарта продолжают работать в масштабе
 * района, а не 4,3 км). Габарит всего макета открыт полем `cityBounds` — метры
 * масштабированной модели с тем же началом координат, что у файла; поле нужно
 * данным главы и границам стриминга, движку оно не требуется.
 *
 * Центр окна — он же (0, 0) мира главы, поэтому перестановка сдвигает начало
 * координат: `updateStreaming` возвращает метры `(dx, dz)`, на которые ушло
 * окно, и движок обязан на `-(dx, dz)` сдвинуть всё, что держит позицию, иначе
 * игрок после перестановки окажется в другой части города, не там, где стоял.
 * Сама карта пересчитывает своё `spawn`.
 *
 * Слушателей модуль не вешает; меши старого окна снимаются со сцены и
 * `dispose()`-нятся при каждой перестановке, поэтому за главу их число не растёт.
 */
export class StreamedModelMap extends ModelMap {
  /**
   * @param {object} spec map-секция главы: asset, `window` первого окна
   *   { x, z, size } в метрах масштабированной модели (его центр — (0, 0) мира
   *   главы), `cell`, `tile` — сторона тайла стриминга; `size` обязан быть
   *   нечётным числом тайлов
   */
  constructor(spec = {}) {
    super(spec);
    const per = Math.round(this.size / this.cfg.tile);
    if (per < 1 || per % 2 === 0 || Math.abs(this.size - per * this.cfg.tile) > 1e-6) {
      throw new Error(`StreamedModelMap: окно ${this.size} м — не нечётное число тайлов по ${this.cfg.tile} м`);
    }
    this.tilesPerSide = per;
    const bb = this.tris.bbox, s = this.scale;
    this.cityBounds = { minX: bb.minX * s, maxX: bb.maxX * s, minZ: bb.minZ * s, maxZ: bb.maxZ * s };
  }

  /**
   * Окно из корзин тайлов, а не из пересобранных под него вершин. Первый вызов
   * заодно выбирает решётку стриминга (её угол — минимальный угол первого окна) и
   * измеряет плиту макета: её отметка становится опорой улицы для всех окон
   * главы, а её прямоугольник — пределами проходимости.
   */
  _loadWindow() {
    if (!this._grid) {
      this._grid = { x: this.window.x - this.half, z: this.window.z - this.half };
      this._bk = tileBuckets(this.tris, this.scale, this.cfg.tile, this._grid);
      this._measurePlate();
    }
    const bk = this._bk, s = this.scale, tris = this.tris, m = this.cfg, half = this.half;
    const win = this.window;
    const oy = tris.bbox.minY * s;
    const i = Math.round((win.x - half - bk.originX) / bk.tile);
    const j = Math.round((win.z - half - bk.originZ) / bk.tile);
    const per = this.tilesPerSide ?? Math.round(this.size / bk.tile);
    const idx = bk.gather(i, j, i + per - 1, j + per - 1);

    const col = columnsFromTriangles(tris.pos, tris.nh, idx.length, {
      half, cell: m.cell, groundY: this.groundY,
      horizonNormal: m.horizonNormal, skipSpan: m.skipSpan, wallArea: m.wallArea,
      idx, scale: s, ox: win.x, oz: win.z, oy,
    });
    this.cells = col.n;
    this.top = col.top;
    this.occupiedCells = col.occupied;
    this.maxTop = col.maxTop;

    // Вершины для меша — те же грани, но округлённые до float32 и уже в метрах
    // окна: рендеру нельзя стоять на координатах ~2 000 м (шаг float32 там
    // 0,12 мм, и камера начинает видеть дрожание граней), а твёрдость считается
    // из файловых чисел и от этого округления не зависит.
    const pos = new Float32Array(idx.length * 9);
    const nh = new Float32Array(idx.length);
    const mid = new Int16Array(idx.length);
    for (let q = 0; q < idx.length; q++) {
      const t = idx[q], fb = t * 9, gb = q * 9;
      for (let k = 0; k < 3; k++) {
        const o3 = k * 3;
        pos[gb + o3] = tris.pos[fb + o3] * s - win.x;
        pos[gb + o3 + 1] = tris.pos[fb + o3 + 1] * s - oy;
        pos[gb + o3 + 2] = tris.pos[fb + o3 + 2] * s - win.z;
      }
      nh[q] = tris.nh[t];
      mid[q] = tris.mid[t];
    }
    this.pos = pos;
    this.nh = nh;
    this.mid = mid;
    this.triCount = idx.length;

    // плита в метрах активного окна: за её краем асфальта нет, и ходить там нельзя
    const p = this.plate;
    this.plateRect = {
      minX: p.minX - win.x, maxX: p.maxX - win.x,
      minZ: p.minZ - win.z, maxZ: p.maxZ - win.z,
    };
  }

  /**
   * Отметка и прямоугольник плиты макета — по крупным горизонтальным граням
   * всего файла, один раз за главу: покрышка улиц в макете — одна плоскость на
   * весь город, поэтому и её высота, и её границы не зависят от окна.
   * Прямоугольник берётся только от граней с тем же верхом, что у плиты, —
   * иначе широкая крыша расширила бы «улицу» за её край.
   */
  _measurePlate() {
    const tris = this.tris, s = this.scale, m = this.cfg;
    const oy = tris.bbox.minY * s; // низ модели — её собственный minY, как в ModelMap
    const big = [];
    let top = -Infinity;
    for (let t = 0; t < tris.count; t++) {
      if (tris.nh[t] < m.horizonNormal) continue;
      const b = t * 9;
      const x0 = tris.pos[b] * s, x1 = tris.pos[b + 3] * s, x2 = tris.pos[b + 6] * s;
      const z0 = tris.pos[b + 2] * s, z1 = tris.pos[b + 5] * s, z2 = tris.pos[b + 8] * s;
      const minX = Math.min(x0, x1, x2), maxX = Math.max(x0, x1, x2);
      const minZ = Math.min(z0, z1, z2), maxZ = Math.max(z0, z1, z2);
      if (Math.max(maxX - minX, maxZ - minZ) <= m.skipSpan) continue;
      const maxY = Math.max(tris.pos[b + 1] * s, tris.pos[b + 4] * s, tris.pos[b + 7] * s) - oy;
      if (maxY > top) top = maxY;
      big.push({ minX, maxX, minZ, maxZ, maxY });
    }
    if (!Number.isFinite(top)) {
      // плиты нет: опора остаётся на усмотрение главы, а проходимость не режется
      this.groundY = m.groundY ?? 0;
      this.plate = { minX: -Infinity, maxX: Infinity, minZ: -Infinity, maxZ: Infinity };
      return;
    }
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const f of big) {
      if (Math.abs(f.maxY - top) > m.cell) continue;
      if (f.minX < minX) minX = f.minX;
      if (f.maxX > maxX) maxX = f.maxX;
      if (f.minZ < minZ) minZ = f.minZ;
      if (f.maxZ > maxZ) maxZ = f.maxZ;
    }
    this.groundY = m.groundY ?? top;
    this.plate = { minX, maxX, minZ, maxZ };
  }

  /**
   * Габарит плиты в метрах активного окна — наружу не выпускает ни человека, ни
   * маршруты врагов: асфальта за покрышкой макета нет, а колонки там пустые, так
   * что без этой проверки улица продолжилась бы в несуществующий район.
   */
  isBlocked(x, z, radius, feetY = 0, height = 2) {
    const p = this.plateRect;
    if (x - radius < p.minX || x + radius > p.maxX || z - radius < p.minZ || z + radius > p.maxZ) return true;
    return super.isBlocked(x, z, radius, feetY, height);
  }

  /**
   * Опциональный член контракта карты: движок вызывает его каждый кадр до
   * физики. Пока игрок внутри центрального тайла — `null`, ничего не строится.
   * Как только вышел — окно переставляется в ближайший узел решётки (~0,25 с) и
   * возвращаются метры, на которые оно сдвинулось в масштабе файла: мир главы
   * привязан к центру окна, поэтому движок обязан сдвинуть на `-(dx, dz)` всё,
   * что держит позицию (игрока, врагов, точку B), переставить пул огней и поднять
   * `shadowMap.needsUpdate`. Оверлей `'loading'` на перестановку не ставится:
   * `hud.showLoading` откладывает карточку на 300 мс, а перестройка укладывается
   * в 132–188 мс — карточка не успела бы отрисоваться ни разу. Вместо неё
   * `Game._streamWindow` возвращает «был сдвиг», и `_tick` на этом кадре
   * симуляцию не ведёт.
   */
  updateStreaming(x, z) {
    const tile = this._bk.tile;
    if (Math.abs(x) <= tile / 2 && Math.abs(z) <= tile / 2) return null;
    // окно ставится в ближайший узел решётки тайлов: шаг мог бы быть и несколько
    // тайлов (телепорт после смерти в начало маршрута), а вне решётки сетка
    // колонок меняет фазу и перекрытие окон перестаёт совпадать клетка в клетку
    const dx = Math.round(x / tile) * tile;
    const dz = Math.round(z / tile) * tile;
    const nx = this.window.x + dx, nz = this.window.z + dz;
    const p = this.plate, half = this.half;
    // окно, которое целиком за плитой, не на что опереть: улиц там нет
    if (nx + half < p.minX || nx - half > p.maxX || nz + half < p.minZ || nz - half > p.maxZ) return null;
    this._recenter(dx, dz);
    return { dx, dz };
  }

  /**
   * Перестройка окна: колонки, миникарта, граф улиц и меш. `dx`/`dz` — метры
   * файла, на которые окно сдвинулось; точка появления пересчитывается здесь,
   * потому что она принадлежит карте (движок зовёт `respawn` по `map.spawn`), а
   * физически A остаётся там же, где была.
   */
  _recenter(dx, dz) {
    this.window = { x: this.window.x + dx, z: this.window.z + dz, size: this.size };
    this._loadWindow();
    this._minimapBlocks();
    this.nav = this._buildNav();
    this.spawn = { x: this.spawn.x - dx, y: this.spawn.y, z: this.spawn.z - dz };
    this._remesh();
  }

  /** Меш активного окна; сцена запоминается, чтобы переставлять меш без движка. */
  build(scene) {
    this._scene = scene;
    super.build(scene);
  }

  _remesh() {
    const scene = this._scene;
    if (!scene) return; // preview-сцена меню и автотесты строят карту и без меша
    for (const mesh of this.modelMeshes ?? []) {
      scene.remove(mesh);
      mesh.geometry.dispose();
    }
    this.build(scene);
  }
}

/**
 * Создаёт стримящуюся карту по определению уровня (см. src/levels/level-04.js).
 * Ассет обязан быть предзагружен (preloadMapAsset в game.js): контракт карты
 * синхронный.
 */
export function createStreamedMap(spec = {}) {
  return new StreamedModelMap(spec);
}
