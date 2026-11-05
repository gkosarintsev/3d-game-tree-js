/**
 * Размер квантования «плоской коробки» на улицах генератора.
 *
 * Движок (src/json-map.js:551) кладёт пластину призмой только при
 * `|topAtMax − topAtMin| > 0,01`; всё остальное рисуется плоской коробкой по
 * `topY = min(topAtMin, topAtMax)`. Значит лист подпорогового подъёма теряет
 * declared-плоскость: асфальт опускается на нижний срез. Метрика считает,
 * сколько таких листов, насколько они уходят под поле и насколько расходятся
 * стыки, если сравнивать РИСУНОК, а не объявленную плоскость.
 *
 * Запуск: `node probe/stage6aa.mjs`.
 */
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { reliefOf } from '../src/relief.js';
import { CONFIG } from '../src/config.js';

const J = CONFIG.jsonMap;
const EPS = 0.01; // порог `_incline` в движке

const DISTRICT_A = {
  id: 'a', block: { minX: -140, maxX: -20, minZ: -140, maxZ: -20 }, style: 'corporate',
  street: { pitch: 40, width: 12 }, lot: { pitch: 10, inset: 1.5, merge: 0.4 },
  height: { minFloors: 2, maxFloors: 8, floorHeight: 3.4 }, enterableEvery: 5,
  yaw: 18,
  polygon: [
    { x: -126, z: -78 }, { x: -82, z: -129 }, { x: -31, z: -123 },
    { x: -37, z: -51 }, { x: -78, z: -34 },
  ],
};
const DISTRICT_B = {
  id: 'b', block: { minX: 20, maxX: 140, minZ: 20, maxZ: 140 }, style: 'kitsch',
  street: { pitch: 34, width: 12 }, lot: { pitch: 9, inset: 1.5, merge: 0.45 },
  height: { minFloors: 2, maxFloors: 6, floorHeight: 3.2 }, enterableEvery: 6,
  roofs: { walkable: true, access: 0.5, parapet: 0.9 },
};

function baseRaw() {
  return {
    kind: 'json2',
    metadata: { levelName: 'probe', name: '—', hint: '—', units: 'meters' },
    ground: { y: 0, size: 320, color: '#23262c' },
    relief: {
      baseY: 0,
      hills: [
        { id: 'hrub', x: -80, z: -80, radius: 400, height: 3 },
        { id: 'lon', x: 90, z: 90, radius: 400, height: -2 },
      ],
    },
    city: { seed: 70707, districts: [structuredClone(DISTRICT_A), structuredClone(DISTRICT_B)] },
    roads: [], buildings: [], landscapeObjects: [], lights: [],
    gameplay: {
      goal: 'exit', spawn: { x: -100, z: -100 }, exit: { x: 100, z: 100 }, exitRadius: 4,
      enemies: { count: 2 }, alienEnemies: { count: 1 },
    },
  };
}

const terraceY = normalizeLevel(expandCity(baseRaw()))
  .map.relief.pads.find(p => p.id === 'b:терраса').y;
const withPlinth = baseRaw();
withPlinth.buildings = [{
  id: 'plinth', isEnterable: false, floorsCount: 3, floorHeight: 3.4,
  baseY: +(terraceY + 0.55).toFixed(3),
  footprint: [{ x: 56, z: 54 }, { x: 68, z: 54 }, { x: 68, z: 66 }, { x: 56, z: 66 }],
  rooms: [],
}];

const level = normalizeLevel(expandCity(withPlinth));
const field = reliefOf(level.map.relief);

const plateOf = (d) => {
  const rad = (d.yaw ?? 0) * Math.PI / 180;
  return {
    cx: d.cx ?? (d.minX + d.maxX) / 2, cz: d.cz ?? (d.minZ + d.maxZ) / 2,
    c: Math.cos(rad), s: Math.sin(rad),
    half: (d.length ?? (d.maxX - d.minX)) / 2, w: (d.width ?? (d.maxZ - d.minZ)) / 2,
    y0: d.topAtMin, y1: d.topAtMax,
  };
};
/** Объявленная плоскость полотна в мировой точке. */
const planeAt = (p, x, z) => {
  const dx = x - p.cx, dz = z - p.cz;
  const u = dx * p.c + dz * p.s;
  return p.y0 + (p.y1 - p.y0) * ((u + p.half) / (2 * p.half));
};

let quantized = 0, total = 0, worstRise = 0, worstBurialPlane = 0, worstBurialFlat = 0;
const offenders = [];
for (const r of level.map.roads) {
  for (const d of r.decks) {
    if (d.length === undefined) continue;
    total++;
    const p = plateOf(d);
    const rise = Math.abs(p.y1 - p.y0);
    if (rise <= EPS) {
      if (rise > 1e-9) { quantized++; worstRise = Math.max(worstRise, rise); }
    }
    let bp = 0, bf = 0;
    const k = Math.max(2, Math.round((2 * p.half) / J.navStep));
    for (let i = 1; i < k; i++) {
      const u = -p.half + 2 * p.half * (i / k);
      const x = p.cx + u * p.c, z = p.cz + u * p.s;
      const f = field.heightAt(x, z);
      bp = Math.max(bp, f - planeAt(p, x, z));
      // плоская коробка держит опору на topY = min(срезов), движок её и отдаст
      bf = Math.max(bf, f - Math.min(p.y0, p.y1));
    }
    worstBurialPlane = Math.max(worstBurialPlane, bp);
    if (rise <= EPS && bf > 1e-9) {
      worstBurialFlat = Math.max(worstBurialFlat, bf);
      if (bf > 0.001) offenders.push(`${r.id} rise=${rise.toFixed(4)} провал ${bf.toFixed(4)} м`);
    }
  }
}

console.log(`пластин ${total}, из них подпороговых с ненулевым подъёмом ${quantized} (худший подъём ${worstRise.toFixed(4)} м)`);
console.log(`провал по объявленной плоскости ${worstBurialPlane.toFixed(4)} м`);
console.log(`провал по рисунку плоской коробки ${worstBurialFlat.toFixed(4)} м`);
console.log(`листов, где рисунок уходит под поле глубже миллиметра: ${offenders.length}`);
for (const o of offenders.slice(0, 12)) console.log('  ', o);

// стыки: торцы прогонов против плоскости перекрёстка — по рисунку, не по данным
const decks = [];
for (const r of level.map.roads) {
  for (const d of r.decks) {
    if (d.length === undefined) continue;
    decks.push({ id: r.id, crossing: /_x\d+_\d+$/.test(r.id), d, p: plateOf(d) });
  }
}
const corners = (p) => [[-1, -1], [-1, 1], [1, 1], [1, -1]].map(([su, sv]) => ({
  x: p.cx + su * p.half * p.c - sv * p.w * p.s,
  z: p.cz + su * p.half * p.s + sv * p.w * p.c,
}));
const deckTop = (p, x, z, flat) => {
  const dx = x - p.cx, dz = z - p.cz;
  const u = dx * p.c + dz * p.s, v = -dx * p.s + dz * p.c;
  if (Math.abs(u) > p.half + 0.02 || Math.abs(v) > p.w + 0.02) return null;
  return Math.abs(p.y1 - p.y0) > EPS && !flat ? planeAt(p, x, z) : Math.min(p.y0, p.y1);
};
for (const mode of ['plane', 'rendered']) {
  const flat = mode === 'rendered';
  let joints = 0, worst = 0, where = '';
  for (const x of decks.filter(q => q.crossing)) {
    for (const y of decks.filter(q => !q.crossing)) {
      for (const q of corners(y.p)) {
        const a = deckTop(x.p, q.x, q.z, flat);
        if (a === null) continue;
        const b = deckTop(y.p, q.x, q.z, flat);
        if (b === null) continue;
        joints++;
        const dev = Math.abs(a - b);
        if (dev > worst) { worst = dev; where = `${y.id} × ${x.id}`; }
      }
    }
  }
  console.log(`стыки «прогон → перекрёсток» (${mode}): ${joints}, худший ${worst.toFixed(5)} м @ ${where}`);
}
