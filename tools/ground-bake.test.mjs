/**
 * Автотест бинарного кодека и запечённой геометрии грунта (TASK-004).
 *
 * `node tools/ground-bake.test.mjs`.
 *
 * Поводом стала реальная ошибка: теги `F64A`/`U32A` писались, но в таблице
 * тегов отсутствовали — декодер читал тег 0 (null) и терял индексы буфера, а
 * хвост файла просто не читался. Поэтому первая проверка — полный обход всех
 * typed arrays кодека, вторая — что декодер падает на несоответствии длины.
 *
 * Дальше проверяется компактная упаковка грунта (`src/ground-bake.js`):
 * позиции обязаны совпасть побитово, индексы — дать те же треугольники, а
 * нормали уложиться в квантование Int8. И закоммиченные артефакты гл.17:
 * chunk содержит `groundBaked`, sidecar совпадает с ним, индексы в диапазоне.
 *
 * Three.js не нужен: кодек и упаковка — чистые ES-модули, как `surfaces.js`.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { decodeChunk, encodeChunk } from '../src/level-bin.js';
import { packGroundData, unpackGroundData } from '../src/ground-bake.js';

const ROOT = resolve(import.meta.dirname, '..');
let passed = 0;
const failures = [];
const notes = [];

function check(name, fn) {
  try {
    fn();
    passed++;
    notes.push(`  ✔ ${name}`);
  } catch (e) {
    failures.push(`${name}: ${e.message}`);
    notes.push(`  ✖ ${name}: ${e.message}`);
  }
}
function eq(a, b, what = '') {
  if (a !== b) throw new Error(`${what}ожидалось ${b}, получено ${a}`);
}
function close(a, b, tol, what = '') {
  if (!(Math.abs(a - b) <= tol)) throw new Error(`${what}|${a} - ${b}| > ${tol}`);
}

// ---------------------------------------------------------------- кодек

check('кодек: typed arrays переживают round-trip', () => {
  const src = {
    f32: new Float32Array([0.5, -1.25, 3]),
    f64: new Float64Array([1e-9, 2.5]),
    u32: new Uint32Array([0, 65535, 4000000000]),
    i8: new Int8Array([-127, 0, 127]),
    u8: new Uint8Array([0, 1, 255, 128]),
    nested: { list: [{ v: new Float32Array([7]) }] },
  };
  const back = decodeChunk(encodeChunk(src));
  for (const k of ['f32', 'f64', 'u32', 'i8', 'u8']) {
    eq(back[k].constructor, src[k].constructor, `${k}.constructor `);
    eq(back[k].length, src[k].length, `${k}.length `);
    for (let i = 0; i < src[k].length; i++) eq(back[k][i], src[k][i], `${k}[${i}] `);
  }
  eq(back.nested.list[0].v[0], 7, 'nested ');
});

check('кодек: хвост после значения — ошибка, а не тихая потеря', () => {
  const bytes = encodeChunk({ a: 1 });
  const bad = new Uint8Array(bytes.length + 1);
  bad.set(bytes);
  let threw = false;
  try { decodeChunk(bad); } catch { threw = true; }
  eq(threw, true, 'лишний байт должен ловиться ');
});

// ---------------------------------------------------------------- упаковка

/** Неиндексированная сетка из двух треугольников с общим ребром. */
function probeMesh() {
  const pos = new Float32Array([
    0, 0, 0, 1, 0, 0, 0, 1, 0,
    0, 0, 0, 0, 1, 0, -1, 0, 0,
  ]);
  const nrm = new Float32Array([
    0, 0, 1, 0, 0, 1, 0, 0, 1,
    0, 0, 1, 0, 0, 1, 0, 0, 1,
  ]);
  return { pos, nrm };
}

check('упаковка: позиции побитово, треугольники те же', () => {
  const src = probeMesh();
  const packed = packGroundData(src);
  const back = unpackGroundData(packed);
  eq(back.idx.length, src.pos.length / 3, 'число индексов ');
  eq(back.pos.length / 3, 4, 'уникальных вершин (две общие схлопнуты) ');
  for (let i = 0; i < back.idx.length; i++) {
    const v = back.idx[i] * 3;
    const o = i * 3;
    eq(back.pos[v], src.pos[o], `pos[${i}].x `);
    eq(back.pos[v + 1], src.pos[o + 1], `pos[${i}].y `);
    eq(back.pos[v + 2], src.pos[o + 2], `pos[${i}].z `);
  }
});

check('упаковка: нормали в пределах квантования Int8', () => {
  const src = probeMesh();
  src.nrm[0] = 0.6; src.nrm[1] = 0.8; src.nrm[2] = 0;
  const back = unpackGroundData(packGroundData(src));
  for (let i = 0; i < back.idx.length; i++) {
    const v = back.idx[i] * 3;
    const o = i * 3;
    close(back.nrm[v], src.nrm[o], 0.5 / 127 + 1e-6, `nrm[${i}].x `);
    close(back.nrm[v + 1], src.nrm[o + 1], 0.5 / 127 + 1e-6, `nrm[${i}].y `);
    close(back.nrm[v + 2], src.nrm[o + 2], 0.5 / 127 + 1e-6, `nrm[${i}].z `);
  }
});

check('упаковка: сырой вид проходит без изменений', () => {
  const raw = probeMesh();
  const back = unpackGroundData(raw);
  eq(back, raw, 'тот же объект ');
});

// ---------------------------------------------------------------- артефакты

const L17 = join(ROOT, 'src/levels/level-17');
const CHUNKS = ['chunk-0-0', 'chunk-0-1', 'chunk-1-0', 'chunk-1-1'];

check('гл.17: groundBaked в чанках и sidecar сходится', () => {
  for (const name of CHUNKS) {
    const chunkFile = join(L17, `${name}.l14b`);
    const sideFile = join(L17, `${name}.ground.l14b`);
    if (!existsSync(chunkFile)) throw new Error(`нет ${name}.l14b`);
    if (!existsSync(sideFile)) throw new Error(`нет ${name}.ground.l14b`);
    const chunk = decodeChunk(readFileSync(chunkFile));
    const baked = chunk.groundBaked;
    if (!baked) throw new Error(`${name}: нет groundBaked`);
    for (const k of ['pos', 'nrmq', 'idxq']) {
      if (!baked[k] || !baked[k].length) throw new Error(`${name}: пустой ${k}`);
    }
    eq(baked.ic % 3, 0, `${name}: ic кратен 3 `);
    const side = decodeChunk(readFileSync(sideFile)).groundBaked;
    eq(side.pos.length, baked.pos.length, `${name}: pos sidecar `);
    eq(side.ic, baked.ic, `${name}: ic sidecar `);
    for (let i = 0; i < baked.idxq.length; i++) {
      if (side.idxq[i] !== baked.idxq[i]) throw new Error(`${name}: idxq sidecar расходится на ${i}`);
    }
    const back = unpackGroundData(baked);
    const uniq = back.pos.length / 3;
    for (let i = 0; i < back.idx.length; i++) {
      if (back.idx[i] >= uniq) throw new Error(`${name}: индекс ${back.idx[i]} ≥ ${uniq}`);
    }
    for (let i = 0; i < back.pos.length; i++) {
      if (!Number.isFinite(back.pos[i])) throw new Error(`${name}: pos[${i}] не число`);
    }
  }
});

console.log(notes.join('\n'));
if (failures.length) {
  console.error(`\nпровалено ${failures.length} из ${passed + failures.length}`);
  for (const f of failures) console.error(`  — ${f}`);
  process.exitCode = 1;
} else {
  console.log(`\nвсе ${passed} проверок прошли`);
}
