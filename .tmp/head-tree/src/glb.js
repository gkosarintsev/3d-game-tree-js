import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Внешние GLB-ассеты уровня: загрузка, кэш и разбор чужого меша в треугольники.
 *
 * Главу 3 приносит готовым макетом города, а не геометрией, которую движок
 * построил сам, поэтому здесь сосредоточено всё, что связывает проект с этим
 * файлом: GLTFLoader из importmap (npm-зависимостей правило не допускает), кэш
 * по URL — один и тот же файл читается один раз за забег, — и плоское
 * представление треугольников в мировых координатах файла (типизированные
 * массивы). Из них карта строит и сетку колонок твёрдости, и видимый меш, так
 * что картинка и коллизия берут начало в одних и тех же числах (см. AGENTS.md,
 * «Внешние ассеты уровня (GLB)»). Плюс раскладку тех же треугольников по тайлам
 * — она нужна стримингу твёрдости по всему макету (см. `tileBuckets`).
 *
 * Слушателей модуль не вешает, состояний игры не знает — dispose не нужен.
 */

/** url → запись кэша: промис загрузки и сцена, когда промис исполнился. */
const cache = new Map();
/** сцена → треугольники: разбор дорогой, а сцена в кэше одна на url */
const triCache = new WeakMap();

/** Читает .glb по URL. Повторный вызов не качает и не разбирает файл заново. */
export function loadGltfScene(url) {
  let entry = cache.get(url);
  if (!entry) {
    entry = { scene: null };
    entry.promise = new Promise((resolve, reject) => {
      new GLTFLoader().load(
        url,
        gltf => {
          entry.scene = gltf.scene;
          resolve(gltf.scene);
        },
        undefined,
        e => reject(new Error(`Не удалось загрузить ассет уровня ${url}: ${e?.message ?? e}`)),
      );
    });
    cache.set(url, entry);
  }
  return entry.promise;
}

/**
 * Синхронный доступ к уже загруженному ассету: контракт карты (createMap)
 * асинхронным быть не может, поэтому движок обязан дождаться preloadMapAsset
 * перед созданием карты. Ошибка — внятная, а не «undefined is not a scene».
 */
export function getGltfScene(url) {
  const entry = cache.get(url);
  if (!entry?.scene) {
    throw new Error(`Ассет ${url} ещё не загружен: дождитесь preloadMapAsset перед createMap`);
  }
  return entry.scene;
}

/**
 * Готовит ассет, указанный в map-секции главы. Без asset ничего не делает и
 * возвращает завершившийся промис — главы, которые строят геометрию сами,
 * грузятся как раньше, без ожидания.
 */
export function preloadMapAsset(spec = {}) {
  return spec.asset ? loadGltfScene(spec.asset) : Promise.resolve(null);
}

/**
 * Разбирает сцену в плоский список треугольников: `pos` — девять координат
 * вершин на треугольник в мировых координатах файла (матрицы узлов уже умножены,
 * поэтому разворот Z-up макета в Y-up происходит здесь же), `nh` — доля
 * горизонтальности его нормали (1 = пол/крыша, 0 = отвесная стена), `mid` —
 * индекс материала той же сцены, чтобы из этих же треугольников собрать меш.
 *
 * Возврат кэшируется по сцене: районы одного макета растеризуются из одних и
 * тех же треугольников, и повторный вход в главу не перебирает 150k граней.
 */
export function trianglesFromScene(scene) {
  const known = triCache.get(scene);
  if (known) return known;

  scene.updateMatrixWorld(true);
  const meshes = [];
  scene.traverse(o => {
    if (o.isMesh && o.geometry?.attributes?.position) meshes.push(o);
  });

  const materials = [];
  const matIndex = new Map();
  let total = 0;
  for (const o of meshes) {
    const g = o.geometry;
    total += (g.index ? g.index.count : g.attributes.position.count) / 3;
    if (!matIndex.has(o.material)) {
      matIndex.set(o.material, materials.length);
      materials.push(o.material);
    }
  }

  const pos = new Float32Array(total * 9);
  const nh = new Float32Array(total);
  const mid = new Int16Array(total);
  const bbox = {
    minX: Infinity, maxX: -Infinity, minY: Infinity,
    maxY: -Infinity, minZ: Infinity, maxZ: -Infinity,
  };

  const v = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // x0,y0,z0, x1,y1,z1, x2,y2,z2
  let tri = 0;
  for (const o of meshes) {
    const g = o.geometry;
    const attr = g.attributes.position;
    const index = g.index;
    const m = o.matrixWorld.elements;
    const mIdx = matIndex.get(o.material);
    const faces = Math.floor((index ? index.count : attr.count) / 3);

    for (let t = 0; t < faces; t++) {
      for (let k = 0; k < 3; k++) {
        const s = index ? index.getX(t * 3 + k) : t * 3 + k;
        const x = attr.getX(s), y = attr.getY(s), z = attr.getZ(s);
        const o3 = k * 3;
        v[o3] = m[0] * x + m[4] * y + m[8] * z + m[12];
        v[o3 + 1] = m[1] * x + m[5] * y + m[9] * z + m[13];
        v[o3 + 2] = m[2] * x + m[6] * y + m[10] * z + m[14];
      }
      const b = tri * 9;
      for (let k = 0; k < 9; k++) pos[b + k] = v[k];
      for (let k = 0; k < 3; k++) {
        const x = v[k * 3], y = v[k * 3 + 1], z = v[k * 3 + 2];
        if (x < bbox.minX) bbox.minX = x;
        if (x > bbox.maxX) bbox.maxX = x;
        if (y < bbox.minY) bbox.minY = y;
        if (y > bbox.maxY) bbox.maxY = y;
        if (z < bbox.minZ) bbox.minZ = z;
        if (z > bbox.maxZ) bbox.maxZ = z;
      }
      nh[tri] = horizontalness(v);
      mid[tri] = mIdx;
      tri++;
    }
  }

  const result = { pos, nh, mid, count: tri, materials, bbox };
  triCache.set(scene, result);
  return result;
}

/**
 * Доля вертикали в нормали треугольника: |n·Y| / |n| для n = AB × AC.
 * Вырожденная грань (нулевая площадь) считается плоской: точная растерка по её
 * барицентрикам ничего не запишет, а консервативная запись стены поставила бы
 * колонку произвольной высоты там, где геометрии нет.
 */
function horizontalness(v) {
  const abx = v[3] - v[0], aby = v[4] - v[1], abz = v[5] - v[2];
  const acx = v[6] - v[0], acy = v[7] - v[1], acz = v[8] - v[2];
  const nx = aby * acz - abz * acy;
  const ny = abz * acx - abx * acz;
  const nz = abx * acy - aby * acx;
  const len = Math.hypot(nx, ny, nz);
  return len < 1e-12 ? 1 : Math.abs(ny) / len;
}

/** сцена-результат разбора → «масштаб:тайл» → корзины */
const bucketCache = new WeakMap();

/**
 * Раскладывает грани макета по тайлам сетки, в которой глава стримит твёрдость
 * (этап F): грань записывается в **каждый** тайл, чей XZ-габарит она задевает,
 * поэтому растерка окна, покрывающего несколько тайлов, берёт ровно те грани,
 * чей габарит пересекает окно, — ни одной лишней и ни одной пропущенной у
 * границы тайла. Проверено автотестом: список из `gather()` = множество граней,
 * которое отбирает конструктор `ModelMap`.
 *
 * Грани индексируются **координатами файла**, а не метрами окна: перестановка
 * окна не имеет права заново округлять вершины до float32, потому что класс
 * грани «стена-лента или обычная грань» решается по площади её XZ-проекции
 * (`wallArea` 0,005 м²), а на координатах ~2 000 м шаг float32 — 0,12 мм. Замер
 * на всём макете: 6 граней из 156 508 сидят у этого порога так близко, что при
 * другом центре окна переходят его в другую сторону, и на стыке двух окон
 * стена высотой 32 м то появляется, то исчезает (13 клеток из 405 600
 * перекрытия). Если же окно только вычитает свой центр из файловых чисел в
 * двойной точности, проекция грани одинакова для всех окон, и стык тайлов
 * становится побитово тем же.
 *
 * `gather` отдаёт индексы граней прямоугольника тайлов без повторов (грань,
 * задевающая четыре тайла, нужна растерке один раз).
 *
 * @param {object} tris результат `trianglesFromScene`
 * @param {number} scale масштаб: файловые единицы → метры главы
 * @param {number} tile сторона тайла в метрах главы
 * @param {{x:number, z:number}} [origin] угол сетки тайлов в метрах главы; по
 *   умолчанию — нижний левый угол габарита файла. Глава задаёт его минимальным
 *   углом первого окна: тогда окно из `2r+1` тайлов покрывает ровно свои тайлы
 *   (смещённая сетка заставила бы растерку разбирать и соседние тайлы — на замере
 *   окна 780 м это 93 тыс. граней вместо 39 тыс.)
 * @returns {{tile:number, originX:number, originZ:number, cols:number,
 *   rows:number, shiftX:number, shiftZ:number, starts:Int32Array,
 *   indices:Int32Array, gather:Function}}
 */
export function tileBuckets(tris, scale, tile, origin) {
  const perScale = bucketCache.get(tris) ?? new Map();
  bucketCache.set(tris, perScale);
  const s = scale;
  const originX = origin?.x ?? tris.bbox.minX * s;
  const originZ = origin?.z ?? tris.bbox.minZ * s;
  const key = `${s}:${tile}:${originX}:${originZ}`;
  const known = perScale.get(key);
  if (known) return known;

  // Тайловые координаты считаются от origin и бывают отрицательными: грань левее
  // угла сетки попадает в тайл -1, поэтому в плоском массиве им правее на сдвиг.
  // Сдвиг и размер считаем по краям габарита, а не по разнице origin−lo: иначе
  // узкая полоса слева от origin (меньше тайла) ушла бы в индекс -1 и пропала
  const minIX = Math.floor((Math.min(tris.bbox.minX * s, originX) - originX) / tile);
  const maxIX = Math.floor((tris.bbox.maxX * s - originX) / tile);
  const minJZ = Math.floor((Math.min(tris.bbox.minZ * s, originZ) - originZ) / tile);
  const maxJZ = Math.floor((tris.bbox.maxZ * s - originZ) / tile);
  const shiftX = -Math.min(0, minIX);
  const shiftZ = -Math.min(0, minJZ);
  const cols = maxIX + shiftX + 1;
  const rows = maxJZ + shiftZ + 1;

  const spans = new Int32Array(tris.count * 4);
  const counts = new Int32Array(cols * rows);
  for (let k = 0; k < tris.count; k++) {
    const b = k * 9;
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (let v = 0; v < 3; v++) {
      const x = tris.pos[b + v * 3] * s, z = tris.pos[b + v * 3 + 2] * s;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }
    const i0 = Math.max(0, Math.floor((minX - originX) / tile) + shiftX);
    const i1 = Math.min(cols - 1, Math.floor((maxX - originX) / tile) + shiftX);
    const j0 = Math.max(0, Math.floor((minZ - originZ) / tile) + shiftZ);
    const j1 = Math.min(rows - 1, Math.floor((maxZ - originZ) / tile) + shiftZ);
    const o4 = k * 4;
    spans[o4] = i0; spans[o4 + 1] = i1; spans[o4 + 2] = j0; spans[o4 + 3] = j1;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) counts[j * cols + i]++;
  }

  // CSR: starts[n] … starts[n+1] — индексы граней тайла n
  const starts = new Int32Array(cols * rows + 1);
  for (let n = 0; n < cols * rows; n++) starts[n + 1] = starts[n] + counts[n];
  const indices = new Int32Array(starts[cols * rows]);
  const cursor = starts.slice(0, cols * rows);
  for (let k = 0; k < tris.count; k++) {
    const o4 = k * 4;
    for (let j = spans[o4 + 2]; j <= spans[o4 + 3]; j++) {
      for (let i = spans[o4]; i <= spans[o4 + 1]; i++) indices[cursor[j * cols + i]++] = k;
    }
  }

  const seen = new Uint8Array(tris.count);
  let gen = 0;
  /**
   * Индексы граней, чей габарит задевает прямоугольник тайлов (координаты от
   * origin, как их считает окно), без повторов: грань, попавшая в четыре тайла,
   * нужна растерке один раз.
   */
  const gather = (i0, j0, i1, j1) => {
    i0 = Math.max(-shiftX, i0) + shiftX; j0 = Math.max(-shiftZ, j0) + shiftZ;
    i1 = Math.min(cols - 1 - shiftX, i1) + shiftX; j1 = Math.min(rows - 1 - shiftZ, j1) + shiftZ;
    if (i1 < i0 || j1 < j0) return new Int32Array(0);
    let cap = 0;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      cap += starts[j * cols + i + 1] - starts[j * cols + i];
    }
    const out = new Int32Array(cap);
    // повторы снимаются меткой поколения, а не обнулением 156 тыс. байт перед
    // каждым вызовом; поколение обязано оставаться в пределах байта, иначе
    // метка перестанет совпадать с записанной и дубли пойдут в список
    gen = gen >= 255 ? 1 : gen + 1;
    let n = 0;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      for (let p = starts[j * cols + i]; p < starts[j * cols + i + 1]; p++) {
        const k = indices[p];
        if (seen[k] === gen) continue;
        seen[k] = gen;
        out[n++] = k;
      }
    }
    return out.subarray(0, n);
  };

  const result = {
    scale: s, tile, originX, originZ, cols, rows, shiftX, shiftZ, starts, indices, gather,
  };
  perScale.set(key, result);
  return result;
}
