/* Авторские дороги главы 12 (этап 8a, docs/level12-relief-plan.md).
   Отметки берутся из СОБРАННОГО поля (probe/level12-field.mjs тот же источник):
   наземные улицы идут хордами по профилю (Дуглас—Пекер), подъёмные — висящей
   нитью (нижняя выпуклая оболочка профиля + зазор), так что пластина нигде не
   закапывается в склон и не горбится над ним. */
import fs from 'node:fs';
import { reliefOf } from '../src/relief.js';
import { LEVEL_12 } from '../src/levels/level-12.js';

const PATH = 'src/levels/level-12.json';
const raw = JSON.parse(fs.readFileSync(PATH, 'utf8'));
const query = reliefOf({ ...LEVEL_12.map.relief });
const F = (x, z) => query.heightAt(x, z);
const RISE = 0.12;   // CONFIG.jsonMap.streetRise: верх асфальта над полем
const r3 = v => Math.round(v * 1000) / 1000;
const DEG = Math.PI / 180;
const wrap = a => ((a % 360) + 540) % 360 - 180;

const PROTECTED = [
  { id: 'rd_quay_s', z0: -174, z1: -164 },
  { id: 'rd_quay_n', z0: -75, z1: -65 },
  { id: 'rd_bank_ave', z0: -86.5, z1: -79.5 },
  { id: 'wall_s', z0: -150.35, z1: -150 },
  { id: 'wall_n', z0: -90, z1: -89.65 },
  { id: 'hole', z0: -150, z1: -90 },
  { id: 'plate_ave', z0: 113, z1: 123 },
];

/**
 * Нижняя выпуклая оболочка профиля подъёма: отрезки, идущие над полем с зазором
 `clear` и соединяющие закреплённые концы. У вогнутого склона хорда «низ ↔ верх»
 ушла бы под рельеф, поэтому профиль строится по точкам (s, поле + зазор), а
 уже на него ложится разбивка на пластины с нужной фазой опор.
 */
function suspendedRun({ x, zFrom, zTo, width, yFrom, yTo, clear, boundaries, gradeWarn }) {
  const samples = [];
  for (let z = zFrom; z <= zTo + 1e-9; z += 1) samples.push({ z, y: F(x, z) + clear });
  samples.push({ z: zTo, y: F(x, zTo) + clear });
  // цепочка отрезков: узел на высоте yFrom, затем касательные к оболочке, узел yTo
  const nodes = [{ z: zFrom, y: yFrom }];
  let cur = nodes[0];
  for (;;) {
    let best = { slope: -Infinity };
    for (const p of samples) {
      if (p.z <= cur.z + 1e-9 || p.z > zTo) continue;
      const slope = (p.y - cur.y) / (p.z - cur.z);
      let above = true;
      for (const q of samples) {
        if (q.z <= cur.z || q.z >= p.z) continue;
        if (cur.y + slope * (q.z - cur.z) < q.y - 1e-9) { above = false; break; }
      }
      if (!above) continue;
      const s = { slope, z: p.z, y: p.y };
      if (best.z === undefined || slope > best.slope || (Math.abs(slope - best.slope) < 1e-12 && p.z > best.z)) best = s;
    }
    if (best.z === undefined) { nodes.push({ z: zTo, y: yTo }); break; }
    if (best.z >= zTo - 1e-9) { nodes.push({ z: zTo, y: yTo }); break; }
    nodes.push({ z: best.z, y: best.y });
    cur = best;
  }
  if (nodes[nodes.length - 1].y !== yTo) throw new Error(`${x}: профиль не доехал до узла ${yTo}`);
  const chain = chainBoundaries(zFrom, zTo, boundaries);
  for (const [p, q] of [[nodes.length - 2, 0], [1, nodes.length], [2, nodes.length]]) {
    const brk = nodes[p]?.z;
    if (brk !== undefined && brk > zFrom && brk < zTo && !chain.includes(brk)) chain.push(brk);
  }
  chain.sort((a, b) => a - b);
  const yAt = z => {
    for (let i = 0; i + 1 < nodes.length; i++) {
      if (z <= nodes[i + 1].z + 1e-9) {
        const t = (z - nodes[i].z) / (nodes[i + 1].z - nodes[i].z);
        return nodes[i].y + t * (nodes[i + 1].y - nodes[i].y);
      }
    }
    return nodes[nodes.length - 1].y;
  };
  const plates = [];
  let worstSlope = 0, worstClear = Infinity;
  for (let i = 0; i + 1 < chain.length; i++) {
    const z0 = chain[i], z1 = chain[i + 1], L = r3(z1 - z0);
    const y0 = r3(yAt(z0) + (z0 <= -164 ? RISE - clear : 0));
    const y1 = r3(yAt(z1));
    if (i + 1 === chain.length - 1) { /* последний узел обязан встать в yTo */ }
    plates.push({ plate: { x, z: r3((z0 + z1) / 2), yaw: 90, length: L, width, y: y0, rise: r3(y1 - y0), rails: true } });
    worstSlope = Math.max(worstSlope, Math.abs(y1 - y0) / L);
    for (let z = z0; z <= z1 + 1e-9; z += 1) worstClear = Math.min(worstClear, yAt(z) - F(x, z));
  }
  plates[plates.length - 1].plate.y = yAt(chain[chain.length - 2]);
  plates[plates.length - 1].plate.rise = r3(yTo - plates[plates.length - 1].plate.y);
  const out = { plates, chain, slope: worstSlope, clear: worstClear };
  if (gradeWarn && worstSlope > gradeWarn) console.log(`  ! уклон подъёма в ${x} ${worstSlope.toFixed(3)} м/м — больше замысла 0,06`);
  return out;
}

function chainBoundaries(zFrom, zTo, boundaries) {
  const sorted = [...new Set([zFrom, zTo, ...boundaries.filter(z => z > zFrom && z < zTo)])].sort((a, b) => a - b);
  return sorted;
}

/** Фазы опор: станция `t` пластины — на 6 м от её начала и далее каждые 12 м. */
function stationsOf(pl, halfInset) {
  const L = pl.plate.length, y0 = pl.plate.y, rise = pl.plate.rise ?? 0;
  const out = [];
  for (let s = 6; s < L - 0.01; s += 12) {
    const z = pl.plate.z - L / 2 + s;
    out.push({ z, x: pl.plate.x, rows: [-halfInset, halfInset], y: y0 + rise * (s / L) });
  }
  return out;
}

function stationFree(z, halfW) {
  const inset = halfW - 0.8 - 0.4;
  const offs = inset >= 1.6 ? [-inset, inset] : [0];
  return offs.every(o => !PROTECTED.some(p => Math.abs(z) > 0 /* x коридора фиксирован */ && p.z0 - 0.9 <= z && z <= p.z1 + 0.9));
}

/** Наземная улица: хорда по профилю поля с допуском (Дуглас—Пекер по высоте). */
function groundRun(id, axis, at, from, to, width, { lamps = true } = {}) {
  const N = Math.round(Math.abs(to - from));
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const t = from + (to - from) * (i / N);
    pts.push(axis === 'x' ? { x: t, z: at, y: r3(F(t, at) + RISE) } : { x: at, z: t, y: r3(F(at, t) + RISE) });
  }
  const keep = decimate(pts, 0.02);
  return { id, type: 'ground', width, lamps, points: keep.map(p => ({ x: r3(p.x), y: p.y, z: r3(p.z) })) };
}

function decimate(pts, eps) {
  if (pts.length < 3) return pts;
  const a = pts[0], b = pts[pts.length - 1];
  let worst = -1, idx = -1;
  for (let i = 1; i < pts.length - 1; i++) {
    const t = ((pts[i].x - a.x) * (b.x - a.x) + (pts[i].z - a.z) * (b.z - a.z))
      / ((b.x - a.x) ** 2 + (b.z - a.z) ** 2 || 1);
    const cx = a.x + t * (b.x - a.x), cz = a.z + t * (b.z - a.z);
    const chord = a.y + t * (b.y - a.y);
    const dev = Math.abs(pts[i].y - chord) * Math.hypot(pts[i].x - cx, pts[i].z - cz) / (Math.hypot(b.x - a.x, b.z - a.z) || 1);
    if (dev > worst) { worst = dev; idx = i; }
  }
  if (worst <= eps) return [a, b];
  const left = decimate(pts.slice(0, idx + 1), eps);
  const right = decimate(pts.slice(idx), eps);
  return [...left.slice(0, -1), ...right];
}

/** Хордовый нос: отметка наземной дороги (её же `points`, тот же пересчёт). */
function groundTopAt(road, x, z) {
  const pts = road.points;
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1];
    if ((a.x <= x + 1e-9 && x <= b.x + 1e-9) && Math.abs(z - a.z) < 1e-9) return a.y + (b.y - a.y) * (x - a.x) / (b.x - a.x || 1);
    if ((a.z <= z + 1e-9 && z <= b.z + 1e-9) && Math.abs(x - a.x) < 1e-9) return a.y + (b.y - a.y) * (z - a.z) / (b.z - a.z || 1);
  }
  throw new Error(`${road.id}: нос ${x},${z} вне осевой`);
}

function hump(id, x, w, lamps = true) {
  const P = (z0, z1, y, rise) => ({ plate: { x, z: r3((z0 + z1) / 2), yaw: 90, length: r3(z1 - z0), width: w, y, rise, rails: true } });
  return { id, type: 'bridge', lamps, elements: [P(-164, -134, 0.12, 2.88), P(-134, -105, 3, 0), P(-105, -75, 3, -2.88)] };
}

// ------------------------------------------------------------- сеть

const roads = [];
const notes = [];

// — ярус 0: набережные и портовая сетка (поле ровно 0,000)
const quayS = groundRun('rd_quay_s', 'x', -169, -280, 280, 10);
const quayN = groundRun('rd_quay_n', 'x', -70, -280, 280, 10);
const bankAve = groundRun('rd_bank_ave', 'x', -83, -200, 200, 7);
roads.push(quayS, quayN, bankAve);
roads.push(groundRun('rd_low_link', 'x', -250, -90, 50, 8));
roads.push(groundRun('rd_port_ave', 'z', -20, -290, -174, 8));
roads.push({
  id: 'rd_x_port', type: 'ground', lamps: false,
  elements: [{ plate: { x: -20, z: -250, yaw: 0, length: 12, width: 12, y: 0.12 } }],
});

// — переправы (горбатые пролёты: подъём, пролёт, сход)
roads.push(hump('br_west', -192, 12), hump('br_east', 170, 12));

// — эстакада: связка ярусов, идёт над берегом и набережной
const fly = suspendedRun({
  x: 60, zFrom: -164, zTo: 113, width: 8, yFrom: 0.12, yTo: 13.184,
  clear: 0.1, boundaries: [-88.5, -82.5, -69.5, -57],
});
roads.push({ id: 'rd_fly_e', type: 'bridge', lamps: true, elements: fly.plates });
notes.push(`rd_fly_e: уклон ${fly.slope.toFixed(3)} м/м, минимальный зазор над полем ${fly.clear.toFixed(2)} м, пластин ${fly.plates.length}`);

// — ярус 1: плато и склон
const plateAve = groundRun('rd_plate_ave', 'x', 118, -280, 280, 10);
roads.push(plateAve);
roads.push(groundRun('rd_scarp_ave', 'z', -58, -65, 113, 10));

// — развязка: кривой подъём с креном от набережной на плато
const x = 226, r = 28;
const zArcEnd = 108.5 - 2 * r;            // узел дуги обязан лечь в пластину с опорой
const climb = suspendedRun({
  x, zFrom: -65, zTo: zArcEnd, width: 8, yFrom: 0.12, yTo: r3(groundTopAt(plateAve, x, 113)),
  clear: 0.1, boundaries: [-61, -43.5, -30.5, -10.5, 13.5, 42, 55],
});
const byZ = z => climb.plates.find(p => Math.abs(p.plate.z - z) < 0.01);
const el = [];
for (const p of climb.plates) {
  if (Math.abs(p.plate.z + 6.5) < 0.01) {          // этот отрезок кончается дугой
    el.push({ plate: { ...p.plate, length: r3(13 - 2 * r / 2 - 1.5) } });
    continue;
  }
  el.push(p);
}
notes.push(`rd_x_east: уклон ${climb.slope.toFixed(3)} м/м, зазор ${climb.clear.toFixed(2)} м, пластин ${climb.plates.length}`);
console.log(JSON.stringify(climb.plates, null, 1));
console.log(JSON.stringify(fly.plates, null, 1));
console.log(notes.join('\n'));
