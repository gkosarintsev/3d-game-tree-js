/**
 * Компактное представление запечённой геометрии грунта (TASK-004).
 *
 * Зачем отдельный модуль: bake пишется из браузера (`tools/bake-ground.mjs`), а
 * читается рантаймом (`src/json-map.js`), и обе стороны обязаны понимать один
 * формат. Кодек `.l14b` (`src/level-bin.js`) хранит typed arrays как есть, но
 * буферы грунта в сыром виде слишком велики: у тяжёлой клетки гл.17 это
 * ~112 тыс. уникальных вершин и ~219 тыс. треугольников (≈4 МБ на клетку).
 *
 * Что сжимаем, не теряя эквивалентности:
 * - **индексы** — delta-varint: соседние треугольники ссылаются на близкие
 *   вершины (сетка обходится по порядку), поэтому дельта почти всегда влезает в
 *   один байт. Кодирование обратимо побитово, треугольники и их обход не меняются.
 * - **нормали** — Int8: ошибка ≤0.5/127 на компоненту (≈0.22° по углу),
 *   визуально неотличима на плавном рельефе; позиции остаются Float32 без потерь.
 *
 * Позиции не квантуются: это те же числа, что строит генератор, и `pos` в
 * запечённых данных совпадает с рантайм-версией до бита. Дубли вершин
 * схлопываются по точному значению (позиция + нормаль), поэтому индексы
 * ссылаются ровно на одну запись каждого уникального узла.
 */

/** Версия раскладки `groundBaked`. Меняется вместе с форматом полей. */
export const GROUND_BAKE_VERSION = 1;

/** Квантование нормали: [-1, 1] → [-127, 127]. */
function quantNormal(v) {
  const q = Math.round(v * 127);
  return q < -127 ? -127 : q > 127 ? 127 : q;
}

/**
 * Delta-varint (zigzag + LEB128). Вход — Uint32Array индексов, выход — байты.
 * Дельты считаются по возрастанию: локальность обхода сетки даёт 1–2 байта на
 * индекс вместо 4.
 */
function packIndices(src) {
  const out = new Uint8Array(src.length * 5);
  let o = 0;
  let prev = 0;
  for (let i = 0; i < src.length; i++) {
    const v = src[i] >>> 0;
    let d = v - prev; // int32 в пределах буфера вершин
    prev = v;
    let z = (d << 1) ^ (d >> 31); // zigzag
    z >>>= 0;
    while (z >= 0x80) {
      out[o++] = (z & 0x7f) | 0x80;
      z >>>= 7;
    }
    out[o++] = z;
  }
  return out.subarray(0, o);
}

/** Обратное к `packIndices`: ровно `count` индексов. */
function unpackIndices(bytes, count) {
  const out = new Uint32Array(count);
  let p = 0;
  let prev = 0;
  for (let i = 0; i < count; i++) {
    let z = 0;
    let shift = 0;
    let b;
    do {
      b = bytes[p++];
      z += (b & 0x7f) * (2 ** shift);
      shift += 7;
    } while (b & 0x80);
    const d = (z >>> 1) ^ -(z & 1);
    prev += d;
    out[i] = prev >>> 0;
  }
  return out;
}

/**
 * Упаковка неиндексированной геометрии грунта в компактный вид.
 *
 * @param {{pos: Float32Array|number[], nrm: Float32Array|number[], idx?: Uint32Array|number[]|null}} data
 *   результат генератора (`_groundGeoData`): вершины треугольников подряд;
 *   `idx` — если геометрия уже индексирована.
 * @returns {{version:number, pos:Float32Array, nrmq:Int8Array, idxq:Uint8Array, ic:number}}
 */
export function packGroundData(data) {
  const pos = data.pos;
  const nrm = data.nrm;
  const srcIdx = data.idx ?? null;
  const indexCount = srcIdx ? srcIdx.length : pos.length / 3;
  const vcap = pos.length / 3;
  const map = new Map();
  const uniqPos = new Float32Array(vcap * 3);
  const uniqNrm = new Int8Array(vcap * 3);
  const outIdx = new Uint32Array(indexCount);
  let uniq = 0;
  for (let i = 0; i < indexCount; i++) {
    const vi = srcIdx ? srcIdx[i] : i;
    const o = vi * 3;
    // Точное значение float32 в ключе: дедуп не должен склеивать разные узлы
    // (toFixed округлял бы координаты и менял позиции на стыках).
    const key = `${pos[o]},${pos[o + 1]},${pos[o + 2]},${nrm[o]},${nrm[o + 1]},${nrm[o + 2]}`;
    let id = map.get(key);
    if (id === undefined) {
      id = uniq++;
      map.set(key, id);
      const u = id * 3;
      uniqPos[u] = pos[o];
      uniqPos[u + 1] = pos[o + 1];
      uniqPos[u + 2] = pos[o + 2];
      uniqNrm[u] = quantNormal(nrm[o]);
      uniqNrm[u + 1] = quantNormal(nrm[o + 1]);
      uniqNrm[u + 2] = quantNormal(nrm[o + 2]);
    }
    outIdx[i] = id;
  }
  return {
    version: GROUND_BAKE_VERSION,
    pos: uniqPos.subarray(0, uniq * 3),
    nrmq: uniqNrm.subarray(0, uniq * 3),
    idxq: packIndices(outIdx),
    ic: indexCount,
  };
}

/**
 * Разбор `groundBaked` для `_geoFromGroundData`. Понимает и сырой вид
 * `{pos, nrm[, idx]}` — так читаются старые/временные артефакты и генератор.
 *
 * @returns {{pos:Float32Array, nrm:Float32Array, idx:Uint32Array|undefined}}
 */
export function unpackGroundData(baked) {
  if (!baked) return baked;
  if (!baked.nrmq && !baked.idxq) return baked;
  const pos = baked.pos;
  const nrmq = baked.nrmq;
  const nrm = new Float32Array(nrmq.length);
  for (let i = 0; i < nrmq.length; i++) nrm[i] = nrmq[i] / 127;
  const idx = baked.ic != null && baked.idxq ? unpackIndices(baked.idxq, baked.ic)
    : (baked.idx ?? undefined);
  return { pos, nrm, idx };
}

/** Счётчики для отчёта bake: вершины/уникальные/треугольники/байты. */
export function groundBakeStats(packed) {
  return {
    verts: (packed.ic ?? 0) / 3,
    uniq: packed.pos.length / 3,
    posBytes: packed.pos.byteLength,
    nrmBytes: packed.nrmq.byteLength,
    idxBytes: packed.idxq.byteLength,
  };
}
