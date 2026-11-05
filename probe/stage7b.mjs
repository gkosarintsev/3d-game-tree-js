/**
 * Замер B этапа 7 (план `docs/level12-relief-plan.md`, п. 4.6) — ЧЕСТНОЙ геометрией.
 *
 * Нос дороги = торец элемента цепочки (средина отрезка среза в мировых осях) и
 * сам срез как отрезок. Два элемента соединены, если их срезы совпадают (середины
 * сходятся в 5 см, нормали параллельны). Свободный нос обязан лежать ВНУТРИ плана
 * наземной улицы (расстояние до плана, а не до осевой: нос в полуметре от борта —
 * это уже не настил) и совпадать с её полотном по отметке. Отдельно меряется,
 * что стоит под носом: дом, русло или пустота — это и есть жалоба владельца
 * «подъём к мосту соприкасается с домами».
 *
 * Запуск: node probe/stage7b.mjs
 */
import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { CONFIG } from '../src/config.js';
import { obbHitsRect, obbHitsObb } from '../src/geo2d.js';

const J = CONFIG.jsonMap;
const DEG = Math.PI / 180;

const load = (path) => {
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  return normalizeLevel(raw.city ? expandCity(raw) : raw).map;
};

/** Срез пластины: середина и направление нормали (вдоль оси элемента). */
function capOf(d, which) {
  if (d.arc) {
    const a = (which === 'min' ? d.a0 : d.a0 + d.span) * DEG;
    const u = { x: Math.cos(a), z: Math.sin(a) };
    const c = { x: d.cx + u.x * d.R, z: d.cz + u.z * d.R };
    return { c, n: which === 'min' ? { x: -u.x, z: -u.z } : u, halfW: d.halfW, u: { x: -u.z, z: u.x } };
  }
  if (d.cx !== undefined && d.length !== undefined) {
    const rad = (d.yaw ?? 0) * DEG;
    const t = { x: Math.cos(rad), z: Math.sin(rad) };
    const s = which === 'min' ? -1 : 1;
    return {
      c: { x: d.cx + t.x * s * d.length / 2, z: d.cz + t.z * s * d.length / 2 },
      n: { x: t.x * s, z: t.z * s },
      halfW: d.width / 2,
      u: { x: -t.z, z: t.x },
    };
  }
  const along = d.axis === 'x' ? [d.minX, d.maxX] : [d.minZ, d.maxZ];
  const cross = d.axis === 'x' ? (d.minZ + d.maxZ) / 2 : (d.minX + d.maxX) / 2;
  const a = which === 'min' ? along[0] : along[1];
  const s = which === 'min' ? -1 : 1;
  return {
    c: d.axis === 'x' ? { x: a, z: cross } : { x: cross, z: a },
    n: d.axis === 'x' ? { x: s, z: 0 } : { x: 0, z: s },
    halfW: Math.abs(along[1] - along[0]) > 0 ? (d.axis === 'x' ? (d.maxZ - d.minZ) : (d.maxX - d.minX)) / 2 : 0,
    u: d.axis === 'x' ? { x: 0, z: 1 } : { x: 1, z: 0 },
  };
}

const topOf = (d, which) => (which === 'min' ? d.topAtMin : d.topAtMax);

/** Расстояние точки до плана пластины (0 — внутри) и отметка полотна там. */
function toPlan(d, x, z) {
  if (d.obb) {
    const o = d.obb;
    const u = (x - o.cx) * o.c + (z - o.cz) * o.s;
    const v = -(x - o.cx) * o.s + (z - o.cz) * o.c;
    const du = Math.max(Math.abs(u) - (d.length !== undefined ? d.length / 2 : o.hx), 0);
    const dv = Math.max(Math.abs(v) - o.hz, 0);
    return { dist: Math.hypot(du, dv), inside: du === 0 && dv === 0, u };
  }
  const du = Math.max(d.minX - x, x - d.maxX, 0);
  const dv = Math.max(d.minZ - z, z - d.maxZ, 0);
  return { dist: Math.hypot(du, dv), inside: du === 0 && dv === 0, u: x };
}

function deckAt(map, x, z, filter) {
  for (const r of map.roads) {
    if (filter && !filter(r)) continue;
    for (const d of r.decks) {
      if (toPlan(d, x, z).inside) return { road: r, deck: d };
    }
  }
  return null;
}

for (const path of ['src/levels/level-10.json', 'src/levels/level-11.json']) {
  const map = load(path);
  const ground = map.roads.filter(r => r.type === 'ground');
  const up = map.roads.filter(r => !['ground', 'skybridge', 'embankment'].includes(r.type));
  console.log(`\n### ${path}: наземных улиц ${ground.length}, подъёмов ${up.length}`);
  let free = 0, bad = 0;
  for (const road of up) {
    for (let i = 0; i < road.decks.length; i++) {
      const d = road.decks[i];
      for (const which of ['min', 'max']) {
        const cap = capOf(d, which);
        // соединён ли торец: чужой срез в полуметре — это стык, каким бы он
        // ни был (прямой, поворот дугой, чужая дорога). Считается ПО ПОЛОЖЕНИЮ,
        // потому что у поворота нормали соседних элементов перпендикулярны
        const joined = map.roads.some((o) => {
          for (let k = 0; k < o.decks.length; k++) {
            if (o === road && k === i) continue;
            for (const w of ['min', 'max']) {
              const c2 = capOf(o.decks[k], w);
              if (Math.hypot(c2.c.x - cap.c.x, c2.c.z - cap.c.z) < 0.5) return true;
            }
          }
          return false;
        });
        if (joined) continue;
        free++;
        let best = null, bestD = Infinity;
        for (const g of ground) {
          for (const gd of g.decks) {
            const t = toPlan(gd, cap.c.x, cap.c.z);
            if (t.dist < bestD) { bestD = t.dist; best = { g, gd, t }; }
          }
        }
        const yNose = topOf(d, which);
        const yStreet = best ? yTopAt(best.gd, cap.c.x, cap.c.z) : NaN;
        const under = deckAt(map, cap.c.x, cap.c.z, r => r.type === 'ground');
        const house = map.buildings.find(b => pointInBuilding(map, b, cap.c.x, cap.c.z));
        const onStreet = bestD <= J.skybridgeFit;
        const level = Math.abs(yStreet - yNose) <= J.skybridgeFit;
        const ok = onStreet && (level || yNose - yStreet < J.stepUpSafe);
        if (!ok) bad++;
        console.log(`  ${road.id}[${i}].${which} (${cap.c.x}, ${cap.c.z}) верх ${yNose}`
          + `: улица ${best ? best.g.id : '—'} в ${bestD.toFixed(3)} м, её полотно ${yStreet}`
          + ` → ${ok ? 'НА УЛИЦЕ' : 'ПЛОХО'}${house ? ` | под носом дом ${house.id}` : ''}`
          + `${under && !house ? ` | под носом настил ${under.road.id}` : ''}`);
      }
    }
  }
  console.log(`  свободных носов ${free}, из них плохо ${bad}`);
}

function yTopAt(d, x, z) {
  const t = toPlan(d, x, z);
  const half = d.length !== undefined ? d.length / 2 : (d.axis === 'x' ? (d.maxX - d.minX) / 2 : (d.maxZ - d.minZ) / 2);
  const cx = d.cx !== undefined ? d.cx : (d.axis === 'x' ? (d.minX + d.maxX) / 2 : (d.minX + d.maxX) / 2);
  void cx;
  const frac = (t.u + half) / (2 * half || 1);
  return d.topAtMin + (d.topAtMax - d.topAtMin) * Math.max(0, Math.min(1, frac));
}

function pointInBuilding(map, b, x, z) {
  const rects = b.rects ?? b.footprintRects ?? [];
  const pad = 0;
  for (const r of rects) {
    if (x >= r.minX - pad && x <= r.maxX + pad && z >= r.minZ - pad && z <= r.maxZ + pad) {
      if (!r.obb) return true;
      const u = (x - r.obb.cx) * r.obb.c + (z - r.obb.cz) * r.obb.s;
      const v = -(x - r.obb.cx) * r.obb.s + (z - r.obb.cz) * r.obb.c;
      if (Math.abs(u) <= r.obb.hx && Math.abs(v) <= r.obb.hz) return true;
    }
  }
  return b.rects === undefined && obbHitsRect({ ...b.bounds, obb: null }, { minX: x, maxX: x, minZ: z, maxZ: z });
}
