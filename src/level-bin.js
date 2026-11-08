/**
 * Бинарный кодек данных открытой главы (level-14): чанки и скелет.
 *
 * Зачем свой формат, а не JSON: чанки читаются `fetch`ом по ходу игры, и цена
 * загрузки — это и байты по сети, и разбор в CPU. Текст JSON несёт кавычки,
 * запятые, пробелы и имена ключей в каждом объекте; здесь значения упакованы в
 * байты, повторяющиеся имена ключей интернируются в таблицу на файл, а частые
 * формы (`{x,z}`, `{x,y,z}`, прямоугольник плана/шага) получают отдельные теги.
 * Скелет — чистые числа, поэтому он лежит плоскими typed arrays (узлы
 * Float64 × 3, рёбра Uint32 × 2) без объектной оболочки вовсе.
 *
 * Ограничения: ES-модуль без зависимостей (браузер и Node читают один файл).
 * Формат версионирован заголовком: несовместимая правка поднимает версию и
 * требует перегенерации каталога (`node tools/build-level.mjs …`). Числа,
 * которые в JSON были целыми индексами/флагами, остаются точными; координаты и
 * отметки — IEEE 754 double, как в исходных данных.
 */

const MAGIC_CHUNK = 0x4c313443; // 'L14C'
const MAGIC_INDEX = 0x4c313449; // 'L14I'
const MAGIC_SKEL = 0x4c313453;  // 'L14S'
const VERSION = 1;

// Теги значений. Однобайтовые, чтобы поток оставался плотным; редкие формы не
// экономят тег, частые — экономят и имя формы.
const T = {
  NULL: 0,
  FALSE: 1,
  TRUE: 2,
  I32: 3,      // знаковое 32, little-endian
  U32: 4,      // беззнаковое 32
  F64: 5,      // double
  F32: 6,      // float (для плотных массивов, где точности хватает; чтение всё равно даёт number)
  STR: 7,      // utf-8: u32 длина + байты
  ARR: 8,      // u32 длина + значения
  OBJ: 9,      // u32 число пар + (ключ, значение)*
  XZ: 10,      // {x, z} — две f64
  XYZ: 11,     // {x, y, z} — три f64
  RECT4: 12,   // {minX, maxX, minZ, maxZ} — четыре f64 в фиксированном порядке
  STEP5: 13,   // ступень лестницы {minX,maxX,minZ,maxZ,top} — пять f64
  WALL: 14,    // стена {axis,minX,maxX,minZ,maxZ,facade} — axis intern ref + 4*f64 + bool
  KREF: 15,    // ссылка на ключ из таблицы файла: u32 индекс
  EMPTY_ARR: 16,
  EMPTY_OBJ: 17,
  I16: 18,
  NEG1: 19,
  ZERO: 20,
  ONE: 21,
  STR_EMPTY: 22,
};

const te = new TextEncoder();
const td = new TextDecoder();

function isXZ(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
  const k = Object.keys(v);
  return k.length === 2 && k[0] === 'x' && k[1] === 'z'
    && typeof v.x === 'number' && typeof v.z === 'number';
}
function isXYZ(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
  const k = Object.keys(v);
  return k.length === 3 && k[0] === 'x' && k[1] === 'y' && k[2] === 'z'
    && typeof v.x === 'number' && typeof v.y === 'number' && typeof v.z === 'number';
}
function isRect4(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
  const k = Object.keys(v);
  return k.length === 4 && k[0] === 'maxX' && k[1] === 'maxZ' && k[2] === 'minX' && k[3] === 'minZ'
    && typeof v.minX === 'number' && typeof v.maxX === 'number'
    && typeof v.minZ === 'number' && typeof v.maxZ === 'number';
}
function isStep5(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
  const k = Object.keys(v);
  return k.length === 5 && k[0] === 'maxX' && k[1] === 'maxZ' && k[2] === 'minX' && k[3] === 'minZ' && k[4] === 'top'
    && typeof v.minX === 'number' && typeof v.maxX === 'number'
    && typeof v.minZ === 'number' && typeof v.maxZ === 'number' && typeof v.top === 'number';
}
// Стена чанка: axis + 4 границы + facade (см. chunk-0-0 buildings[].walls).
function isWall(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
  const k = Object.keys(v);
  return k.length === 6 && k[0] === 'axis' && k[1] === 'facade' && k[2] === 'maxX' && k[3] === 'maxZ'
    && k[4] === 'minX' && k[5] === 'minZ'
    && typeof v.axis === 'string' && typeof v.facade === 'boolean'
    && typeof v.minX === 'number' && typeof v.maxX === 'number'
    && typeof v.minZ === 'number' && typeof v.maxZ === 'number';
}

// Писатель с ростом буфера: чанки кодируются в один проход, размер заранее не
// известен, а аллокация «с запасом» + slice в конце дешевле конкатенации кусков.
class W {
  constructor(cap = 1 << 20) {
    this.buf = new Uint8Array(cap);
    this.dv = new DataView(this.buf.buffer);
    this.pos = 0;
  }
  need(n) {
    if (this.pos + n <= this.buf.length) return;
    let c = this.buf.length;
    while (c < this.pos + n) c *= 2;
    const b = new Uint8Array(c);
    b.set(this.buf);
    this.buf = b;
    this.dv = new DataView(b.buffer);
  }
  u8(v) { this.need(1); this.buf[this.pos++] = v & 255; }
  u16(v) { this.need(2); this.dv.setUint16(this.pos, v, true); this.pos += 2; }
  i16(v) { this.need(2); this.dv.setInt16(this.pos, v, true); this.pos += 2; }
  u32(v) { this.need(4); this.dv.setUint32(this.pos, v >>> 0, true); this.pos += 4; }
  i32(v) { this.need(4); this.dv.setInt32(this.pos | 0, v, true); this.pos += 4; }
  f64(v) { this.need(8); this.dv.setFloat64(this.pos, v, true); this.pos += 8; }
  bytes(src) { this.need(src.length); this.buf.set(src, this.pos); this.pos += src.length; }
  done() { return this.buf.slice(0, this.pos); }
}

class R {
  constructor(buf) {
    // Принимаем ArrayBuffer/Uint8Array/DataView: fetch даёт ArrayBuffer, Node —
    // Buffer (Uint8Array). Копия не нужна, читаем по месту.
    this.buf = buf instanceof Uint8Array ? buf : new Uint8Array(buf.buffer ?? buf, buf.byteOffset ?? 0, buf.byteLength ?? buf.length);
    this.dv = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    this.pos = 0;
  }
  u8() { return this.buf[this.pos++]; }
  u16() { const v = this.dv.getUint16(this.pos, true); this.pos += 2; return v; }
  i16() { const v = this.dv.getInt16(this.pos, true); this.pos += 2; return v; }
  u32() { const v = this.dv.getUint32(this.pos, true); this.pos += 4; return v; }
  i32() { const v = this.dv.getInt32(this.pos, true); this.pos += 4; return v; }
  f64() { const v = this.dv.getFloat64(this.pos, true); this.pos += 8; return v; }
  bytes(n) { const v = this.buf.subarray(this.pos, this.pos + n); this.pos += n; return v; }
}

function collectKeys(v, set) {
  if (v == null || typeof v !== 'object') return;
  if (Array.isArray(v)) { for (const x of v) collectKeys(x, set); return; }
  // Спец-формы ключей объекта не интернируют отдельно — у них фиксированный набор.
  if (isXZ(v) || isXYZ(v) || isRect4(v) || isStep5(v) || isWall(v)) return;
  for (const k of Object.keys(v)) { set.add(k); collectKeys(v[k], set); }
}

function writeValue(w, v, keyIndex) {
  if (v === null) { w.u8(T.NULL); return; }
  const tp = typeof v;
  if (tp === 'boolean') { w.u8(v ? T.TRUE : T.FALSE); return; }
  if (tp === 'number') {
    if (v === 0) { w.u8(T.ZERO); return; }
    if (v === 1) { w.u8(T.ONE); return; }
    if (v === -1) { w.u8(T.NEG1); return; }
    if (Number.isInteger(v) && v >= -32768 && v <= 32767) { w.u8(T.I16); w.i16(v); return; }
    if (Number.isInteger(v) && v >= 0 && v <= 0xffffffff) { w.u8(T.U32); w.u32(v); return; }
    if (Number.isInteger(v) && v >= -2147483648 && v <= 2147483647) { w.u8(T.I32); w.i32(v); return; }
    w.u8(T.F64); w.f64(v); return;
  }
  if (tp === 'string') {
    if (v.length === 0) { w.u8(T.STR_EMPTY); return; }
    w.u8(T.STR);
    const b = te.encode(v);
    w.u32(b.length);
    w.bytes(b);
    return;
  }
  if (Array.isArray(v)) {
    if (v.length === 0) { w.u8(T.EMPTY_ARR); return; }
    w.u8(T.ARR); w.u32(v.length);
    for (const x of v) writeValue(w, x, keyIndex);
    return;
  }
  if (tp === 'object') {
    if (isXZ(v)) { w.u8(T.XZ); w.f64(v.x); w.f64(v.z); return; }
    if (isXYZ(v)) { w.u8(T.XYZ); w.f64(v.x); w.f64(v.y); w.f64(v.z); return; }
    if (isRect4(v)) { w.u8(T.RECT4); w.f64(v.minX); w.f64(v.maxX); w.f64(v.minZ); w.f64(v.maxZ); return; }
    if (isStep5(v)) { w.u8(T.STEP5); w.f64(v.minX); w.f64(v.maxX); w.f64(v.minZ); w.f64(v.maxZ); w.f64(v.top); return; }
    if (isWall(v)) {
      // axis кодируем строкой через общий путь значения (редко, но без отдельного словаря осей).
      w.u8(T.WALL);
      writeValue(w, v.axis, keyIndex);
      w.u8(v.facade ? 1 : 0);
      w.f64(v.minX); w.f64(v.maxX); w.f64(v.minZ); w.f64(v.maxZ);
      return;
    }
    const keys = Object.keys(v);
    if (keys.length === 0) { w.u8(T.EMPTY_OBJ); return; }
    w.u8(T.OBJ); w.u32(keys.length);
    for (const k of keys) {
      const idx = keyIndex.get(k);
      if (idx !== undefined) { w.u8(T.KREF); w.u32(idx); }
      else writeValue(w, k, keyIndex);
      writeValue(w, v[k], keyIndex);
    }
    return;
  }
  // undefined/функции в данных уровня не встречаются; в JSON они бы пропали —
  // здесь пишем null, чтобы поведение чтения совпало с данными, прошедшими JSON.
  w.u8(T.NULL);
}

function readValue(r, keys) {
  const tag = r.u8();
  switch (tag) {
    case T.NULL: return null;
    case T.FALSE: return false;
    case T.TRUE: return true;
    case T.ZERO: return 0;
    case T.ONE: return 1;
    case T.NEG1: return -1;
    case T.I16: return r.i16();
    case T.U32: return r.u32();
    case T.I32: return r.i32();
    case T.F64: return r.f64();
    case T.STR_EMPTY: return '';
    case T.STR: return td.decode(r.bytes(r.u32()));
    case T.EMPTY_ARR: return [];
    case T.ARR: {
      const n = r.u32(); const a = new Array(n);
      for (let i = 0; i < n; i++) a[i] = readValue(r, keys);
      return a;
    }
    case T.EMPTY_OBJ: return {};
    case T.OBJ: {
      const n = r.u32(); const o = {};
      for (let i = 0; i < n; i++) {
        const k = readValue(r, keys);
        o[k] = readValue(r, keys);
      }
      return o;
    }
    case T.XZ: return { x: r.f64(), z: r.f64() };
    case T.XYZ: return { x: r.f64(), y: r.f64(), z: r.f64() };
    case T.RECT4: {
      const minX = r.f64(), maxX = r.f64(), minZ = r.f64(), maxZ = r.f64();
      return { maxX, maxZ, minX, minZ }; // порядок ключей как в stringifyStable/исходных данных
    }
    case T.STEP5: {
      const minX = r.f64(), maxX = r.f64(), minZ = r.f64(), maxZ = r.f64(), top = r.f64();
      return { maxX, maxZ, minX, minZ, top };
    }
    case T.WALL: {
      const axis = readValue(r, keys); const facade = r.u8() !== 0;
      const minX = r.f64(), maxX = r.f64(), minZ = r.f64(), maxZ = r.f64();
      return { axis, facade, maxX, maxZ, minX, minZ };
    }
    case T.KREF: return keys[r.u32()];
    default: throw new Error(`level-bin: неизвестный тег 0x${tag.toString(16)} на смещении ${r.pos - 1}`);
  }
}

function writeKeyTable(w, keys) {
  w.u32(keys.length);
  for (const k of keys) {
    const b = te.encode(k); w.u32(b.length); w.bytes(b);
  }
}
function readKeyTable(r) {
  const n = r.u32(); const keys = new Array(n);
  for (let i = 0; i < n; i++) keys[i] = td.decode(r.bytes(r.u32()));
  return keys;
}

function encodeBlob(magic, value) {
  const keySet = new Set();
  collectKeys(value, keySet);
  const keys = [...keySet].sort(); // стабильный порядок → детерминированные байты
  const keyIndex = new Map(keys.map((k, i) => [k, i]));
  const w = new W();
  w.u32(magic);
  w.u16(VERSION);
  w.u16(0); // флаги/резерв
  writeKeyTable(w, keys);
  writeValue(w, value, keyIndex);
  return w.done();
}

function decodeBlob(magic, buf) {
  const r = new R(buf);
  const m = r.u32();
  if (m !== magic) throw new Error(`level-bin: ожидался magic 0x${magic.toString(16)}, получен 0x${m.toString(16)}`);
  const ver = r.u16();
  if (ver !== VERSION) throw new Error(`level-bin: версия ${ver}, поддерживается ${VERSION} — перегенерируйте каталог`);
  r.u16(); // резерв
  const keys = readKeyTable(r);
  return readValue(r, keys);
}

export function encodeChunk(obj) { return encodeBlob(MAGIC_CHUNK, obj); }
export function decodeChunk(buf) { return decodeBlob(MAGIC_CHUNK, buf); }
export function encodeIndex(obj) { return encodeBlob(MAGIC_INDEX, obj); }
export function decodeIndex(buf) { return decodeBlob(MAGIC_INDEX, buf); }

/**
 * Скелет: плоские массивы. Узлы — `[[x,y,z], ...]` в исходных данных; в файле
 * лежат как Float64LE подряд (x0,y0,z0,x1,…), рёбра — Uint32LE парами (a0,b0,…).
 * Это ровно то, что рисует `drawMinimap` и что хранит `WorldMap`: форма
 * `nodes[i][0..2]` восстанавливается при чтении (3073 узла — дёшево), а выигрыш
 * по размеру/разбору дают отсутствие имён полей и текста чисел.
 */
export function encodeSkeleton(skeleton) {
  const nodes = skeleton?.nodes ?? [];
  const edges = skeleton?.edges ?? [];
  const w = new W(8 + 8 + nodes.length * 24 + edges.length * 8);
  w.u32(MAGIC_SKEL); w.u16(VERSION); w.u16(0);
  w.u32(nodes.length); w.u32(edges.length);
  for (const n of nodes) { w.f64(n[0]); w.f64(n[1]); w.f64(n[2]); }
  for (const e of edges) { w.u32(e[0] >>> 0); w.u32(e[1] >>> 0); }
  return w.done();
}

export function decodeSkeleton(buf) {
  const r = new R(buf);
  const m = r.u32();
  if (m !== MAGIC_SKEL) throw new Error(`level-bin: ожидался скелет (0x${MAGIC_SKEL.toString(16)}), получен 0x${m.toString(16)}`);
  const ver = r.u16(); if (ver !== VERSION) throw new Error(`level-bin: версия скелета ${ver}, поддерживается ${VERSION}`);
  r.u16();
  const nodeCount = r.u32(); const edgeCount = r.u32();
  const nodes = new Array(nodeCount);
  for (let i = 0; i < nodeCount; i++) nodes[i] = [r.f64(), r.f64(), r.f64()];
  const edges = new Array(edgeCount);
  for (let i = 0; i < edgeCount; i++) edges[i] = [r.u32(), r.u32()];
  return { nodes, edges };
}

/** Сравнение байтовых выводов без привязки к Node `Buffer`. */
export function bytesEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** Расширение бинарных файлов чанка открытой главы. */
export const CHUNK_EXT = '.l14b';
/** Имя бинарного файла скелета в каталоге главы. */
export const SKELETON_FILE = 'skeleton.l14b';
