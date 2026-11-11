/**
 * Deterministic RNG for citygen (ADR-001, TASK-002).
 * Uses mulberry32 seeded from 32-bit integers; no Math.random.
 */
export function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mix integers into a 32-bit seed (stable subseed namespace). */
export function mix(...parts) {
  let h = 2166136261 >>> 0;
  for (const p of parts) {
    const v = typeof p === 'string' ? hashString(p) : (Number(p) | 0);
    h ^= v >>> 0;
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export function hashString(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export function makeRng(seed) {
  return mulberry32(seed >>> 0);
}
