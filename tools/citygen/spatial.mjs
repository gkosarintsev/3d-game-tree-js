/**
 * Simple uniform-grid spatial index for citygen (TASK-002, MVP).
 * Deterministic insertion/query given deterministic inputs and order.
 * Supports axis-aligned items with { id, minX, maxX, minZ, maxZ, ... }.
 */

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

export function createSpatialIndex(bounds, cellSize = 64) {
  const size = Number(bounds?.size) || 256;
  const half = size / 2;
  const cs = Math.max(1, Number(cellSize) || 64);
  const cols = Math.max(1, Math.ceil(size / cs));
  const rows = Math.max(1, Math.ceil(size / cs));
  const cells = Array.from({ length: cols * rows }, () => []);
  const items = new Map();

  function idx(cx, cz) { return cz * cols + cx; }
  function cellOf(x, z) {
    const cx = clamp(Math.floor((x + half) / cs), 0, cols - 1);
    const cz = clamp(Math.floor((z + half) / cs), 0, rows - 1);
    return { cx, cz };
  }
  function rangeFor(aabb) {
    const a = cellOf(aabb.minX ?? aabb.x ?? 0, aabb.minZ ?? aabb.z ?? 0);
    const b = cellOf(aabb.maxX ?? aabb.x ?? 0, aabb.maxZ ?? aabb.z ?? 0);
    return {
      minCx: Math.min(a.cx, b.cx), maxCx: Math.max(a.cx, b.cx),
      minCz: Math.min(a.cz, b.cz), maxCz: Math.max(a.cz, b.cz),
    };
  }
  function intersects(a, b) {
    return !(a.maxX < b.minX || a.minX > b.maxX || a.maxZ < b.minZ || a.minZ > b.maxZ);
  }

  function insert(item) {
    if (!item || item.id == null) return false;
    const aabb = {
      minX: Number(item.minX ?? item.x ?? 0),
      maxX: Number(item.maxX ?? item.x ?? 0),
      minZ: Number(item.minZ ?? item.z ?? 0),
      maxZ: Number(item.maxZ ?? item.z ?? 0),
    };
    if (aabb.maxX < aabb.minX || aabb.maxZ < aabb.minZ) return false;
    const rec = { ...item, _aabb: aabb };
    items.set(item.id, rec);
    const r = rangeFor(aabb);
    for (let cz = r.minCz; cz <= r.maxCz; cz++) {
      for (let cx = r.minCx; cx <= r.maxCx; cx++) cells[idx(cx, cz)].push(rec);
    }
    return true;
  }

  function query(aabb) {
    const q = {
      minX: Number(aabb.minX ?? aabb.x ?? 0),
      maxX: Number(aabb.maxX ?? aabb.x ?? 0),
      minZ: Number(aabb.minZ ?? aabb.z ?? 0),
      maxZ: Number(aabb.maxZ ?? aabb.z ?? 0),
    };
    const r = rangeFor(q);
    const out = [];
    const seen = new Set();
    for (let cz = r.minCz; cz <= r.maxCz; cz++) {
      for (let cx = r.minCx; cx <= r.maxCx; cx++) {
        for (const it of cells[idx(cx, cz)]) {
          if (seen.has(it.id)) continue;
          if (intersects(it._aabb, q)) { seen.add(it.id); out.push(it); }
        }
      }
    }
    return out;
  }

  function clear() {
    for (const c of cells) c.length = 0;
    items.clear();
  }

  return { insert, query, clear, get size() { return items.size; }, _meta: { cols, rows, cellSize: cs, bounds: { size, half } } };
}
