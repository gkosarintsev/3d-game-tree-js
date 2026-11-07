import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CONFIG } from '../src/config.js';
import { circleHitsRect } from '../src/solids.js';
import { generateCatalog } from '../tools/build-level.mjs';
import { splitLevel, chunkOverlap, planOf, localize, CHUNK_COLLECTIONS } from '../tools/chunk-level.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const R = CONFIG.radius, OVERLAP = chunkOverlap(), CHUNK = 350;
const base = JSON.parse(readFileSync(resolve(ROOT, 'probe/open-2km.json'), 'utf8'));
base.kind = 'open';
base.stream = { chunk: CHUNK, keep: 1, aheadMin: 300, aheadMax: 900, budgetMs: 8 };
const full = generateCatalog(structuredClone(base), 'probe/open-2km.json');
const world = full.worldMap;
const size = world.ground.size, half = size / 2;
const borders = [];
for (let c = CHUNK; c < size; c += CHUNK) borders.push(-half + c);

// планы мира в мировых осях
const rects = [];
for (const coll of CHUNK_COLLECTIONS) {
  for (const o of world[coll] ?? []) {
    for (const r of planOf(coll, o).rects) rects.push({ coll, id: o.id, r });
  }
}
// классификация: пересекает границу / обрывается в маргине / далеко
let crossing = 0, nearMiss = 0;
const nearList = [];
for (const { coll, id, r } of rects) {
  let cross = false, near = false;
  for (const b of borders) {
    for (const [lo, hi] of [[r.minX, r.maxX], [r.minZ, r.maxZ]]) {
      if (lo < b && b < hi) cross = true;
      else if (b - hi > 0 && b - hi <= OVERLAP) near = true;
      else if (lo - b > 0 && lo - b <= OVERLAP) near = true;
    }
  }
  if (cross) crossing++;
  if (near) { nearMiss++; if (nearList.length < 12) nearList.push(`${coll}:${id} ${JSON.stringify(r)}`); }
}
console.log(`планов ${rects.length}, пересекающих границу ${crossing}, обрывающихся в маргине ${OVERLAP} м — ${nearMiss}`);
for (const s of nearList) console.log('  ' + s);

for (const ov of [OVERLAP, 0]) {
  const split = ov === 0 ? splitLevel(world, base.stream, { overlap: 0 }) : full.split ?? splitLevel(world, base.stream);
  const worldIdx = rectIndex(rects.map(x => x.r));
  const idx = new Map(split.chunks.map(c => [c.id, rectIndex(chunkWorldRects(c, worldIdx, split))]));
  let probes = 0, mm = 0; const samples = [];
  for (const b of innerBorders(split)) {
    const step = (b.to - b.from) / 20;
    for (let k = 1; k * step < (b.to - b.from); k++) {
      const along = b.from + k * step;
      for (const depth of [0.05, 0.25, R, OVERLAP - R - 0.01]) {
        for (const [at, cell] of [[b.at - depth, b.left], [b.at + depth, b.right]]) {
          const p = b.axis === 'x' ? { x: at, z: along } : { x: along, z: at };
          const w = blocked(worldIdx, p.x, p.z, R);
          const c = blocked(idx.get(cell.id), p.x, p.z, R);
          probes++;
          if (w !== c) { mm++; if (samples.length < 4) samples.push(`${cell.id} (${p.x.toFixed(2)},${p.z.toFixed(2)}) мир ${w} чанк ${c}`); }
        }
      }
    }
  }
  console.log(`overlap ${ov}: пробы ${probes} расхождений ${mm} участников ${split.meta.participants}`);
  for (const s of samples) console.log('   ' + s);
}

function rectIndex(rs) {
  const BUCKET = 100, idx = new Map();
  for (const r of rs) {
    const i0 = Math.floor(r.minX / BUCKET), i1 = Math.floor(r.maxX / BUCKET);
    const j0 = Math.floor(r.minZ / BUCKET), j1 = Math.floor(r.maxZ / BUCKET);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const key = `${i}_${j}`; let l = idx.get(key); if (!l) idx.set(key, l = []); l.push(r);
    }
  }
  return idx;
}
function blocked(idx, x, z, radius) {
  const BUCKET = 100;
  const i0 = Math.floor((x - radius) / BUCKET), i1 = Math.floor((x + radius) / BUCKET);
  const j0 = Math.floor((z - radius) / BUCKET), j1 = Math.floor((z + radius) / BUCKET);
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++)
    for (const r of idx.get(`${i}_${j}`) ?? []) if (circleHitsRect(x, z, r.minX, r.maxX, r.minZ, r.maxZ, radius)) return true;
  return false;
}
function chunkWorldRects(chunk) {
  const { x: ox, z: oz } = chunk.cell.origin;
  const out = [];
  for (const coll of CHUNK_COLLECTIONS) for (const o of chunk.map[coll] ?? [])
    for (const r of planOf(coll, o).rects)
      out.push({ minX: r.minX + ox, maxX: r.maxX + ox, minZ: r.minZ + oz, maxZ: r.maxZ + oz });
  return out;
}
function innerBorders(split) {
  const byIJ = new Map(split.chunks.map(c => [`${c.cell.i}_${c.cell.j}`, c]));
  const out = [];
  for (const c of split.chunks) for (const [di, dj, axis] of [[1, 0, 'x'], [0, 1, 'z']]) {
    const right = byIJ.get(`${c.cell.i + di}_${c.cell.j + dj}`); if (!right) continue;
    out.push({ axis, at: axis === 'x' ? c.cell.rect.maxX : c.cell.rect.maxZ,
      from: axis === 'x' ? c.cell.rect.minZ : c.cell.rect.minX,
      to: axis === 'x' ? c.cell.rect.maxZ : c.cell.rect.maxX, left: c, right });
  }
  return out;
}
