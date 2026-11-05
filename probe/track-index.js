/**
 * Браузерный зонд этапа 0 (`docs/level13-track-plan.md`): индекс дуг в пробе
 * опоры обязан отдать **то же число**, что полный перебор `sweeps`, и стоить не
 * дороже. Три части, и первая из них — проверка предпосылки индекса: габарит
 * дуги (`minX…maxZ`) обязан накрывать весь её сектор, иначе бакеты плана теряют
 * кандидата и расхождение не «шум», а дыра в правиле.
 *
 * Узлы графа для проверки не годятся: `_pruneToSpawn` перестраивает NavGraph
 * без ключей (src/json-map.js:2158), так что `byKey` пуст. Вместо них — dense
 * пробы НА полотне каждой дуги (и внутри, и снаружи осевой), где попадание
 * гарантировано геометрией.
 *
 * Протокол замера — тот же, что постановила глава 12 на этапе 11a: длинные
 * итерации 5…10 мс, пары «с индексом / без» вперёмешку, медиана.
 *
 * Запуск в консоли страницы игры (свежий порт = свежий origin):
 *   const m = await import('/probe/track-index.js'); window.p = await m.run();
 */
import * as THREE from 'three';
import { createJsonMap } from '../src/json-map.js';
import { LEVEL_12 } from '../src/levels/level-12.js';
import { arcDelta, arcBankAt } from '../src/geo2d.js';

/** Полный перебор всех дуг — «как было до этапа 0». */
const bruteTopAt = (sweeps, x, z) => {
  let best = null;
  for (const s of sweeps) {
    const dx = x - s.cx, dz = z - s.cz;
    const delta = arcDelta(Math.atan2(dz, dx), s.a0r, s.spanr);
    if (delta === null) continue;
    const rho = Math.hypot(dx, dz);
    if (Math.abs(rho - s.R) > s.halfW + 1e-9) continue;
    const d = Math.abs(delta);
    const e = Math.max(0, Math.min(d, Math.abs(s.spanr) - d));
    const bank = arcBankAt(e, Math.abs(s.spanr), s.tanBank, s.transr);
    const y = s.y0 + (s.y1 - s.y0) * delta / s.spanr + bank * (rho - s.R);
    if (best === null || y > best) best = y;
  }
  return best;
};

export async function run() {
  const map = createJsonMap(LEVEL_12.map);
  map.build(new THREE.Scene());
  const sweeps = map.sweeps;
  const half = map.width / 2;
  const out = {};

  // 1. предпосылка индекса: габарит дуги должен накрывать её настоящий сектор
  out.габариты = sweeps.map((s, i) => {
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (let k = 0; k <= 720; k++) {
      const t = k / 720;
      const ang = s.a0r + s.spanr * t;
      for (const rho of [s.R - s.halfW, s.R + s.halfW]) {
        const x = s.cx + Math.cos(ang) * rho, z = s.cz + Math.sin(ang) * rho;
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
      }
    }
    return {
      id: `${s.road}:${i}`, span: +(s.spanr * 180 / Math.PI).toFixed(1),
      rect: [s.minX, s.maxX, s.minZ, s.maxZ].map(v => +v.toFixed(2)),
      true_: [+minX.toFixed(2), +maxX.toFixed(2), +minZ.toFixed(2), +maxZ.toFixed(2)],
      провал: +Math.max(minX - s.minX, s.maxX - maxX, minZ - s.minZ, s.maxZ - maxZ).toFixed(3),
    };
  });

  // 2. равенство на полотне: поперёк каждой дуги, включая крен
  let on = 0, onBad = 0, onWorst = 0, onWhere = null;
  for (const s of sweeps) {
    const steps = Math.max(8, Math.round(Math.abs(s.spanr) * s.R / 0.5));
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      const ang = s.a0r + s.spanr * t;
      for (let v = -s.halfW; v <= s.halfW + 1e-9; v += 0.5) {
        const rho = s.R + v;
        const x = s.cx + Math.cos(ang) * rho, z = s.cz + Math.sin(ang) * rho;
        on++;
        const a = map.topAt(x, z), b = bruteTopAt(sweeps, x, z);
        if ((a === null) !== (b === null)) { onBad++; continue; }
        if (a !== null && Math.abs(a - b) > onWorst) { onWorst = Math.abs(a - b); onWhere = { x: +x.toFixed(2), z: +z.toFixed(2), a: +a.toFixed(4), b: +b.toFixed(4) }; }
      }
    }
  }
  out.наПолотне = { проб: on, провалов: onBad, худшее: +onWorst.toFixed(6), где: onWhere };

  // 3. равенство по всей карте сеткой (ловит «индекс молчал, а перебор нашёл»)
  let grid = 0, gridHit = 0, gridBad = 0, gridWorst = 0, gridWhere = null;
  for (let x = -half + 1; x < half; x += 3) {
    for (let z = -half + 1; z < half; z += 3) {
      grid++;
      const a = map.topAt(x, z), b = bruteTopAt(sweeps, x, z);
      if ((a === null) !== (b === null)) { gridBad++; continue; }
      if (a !== null) {
        gridHit++;
        if (Math.abs(a - b) > gridWorst) { gridWorst = Math.abs(a - b); gridWhere = { x: +x.toFixed(1), z: +z.toFixed(1), a: +a.toFixed(4), b: +b.toFixed(4) }; }
      }
    }
  }
  out.сетка = { точек: grid, попаданий: gridHit, провалов: gridBad, худшее: +gridWorst.toFixed(6), где: gridWhere };

  // 4. цена пробы: индекс против перебора, парами вперёмешку, медиана
  const points = [];
  for (let x = -half + 1; x < half; x += 7) for (let z = -half + 1; z < half; z += 7) points.push([x, z]);
  const timeIt = (fn) => {
    const t0 = performance.now();
    let n = 0;
    while (performance.now() - t0 < 7) { for (const [x, z] of points) fn(x, z); n += points.length; }
    return (performance.now() - t0) * 1000 / n;
  };
  const med = xs => xs.slice().sort((a, b) => a - b)[xs.length >> 1];
  const savedTop = map.topAt;
  const withBrute = (f) => {
    map.topAt = (x, z) => bruteTopAt(sweeps, x, z);
    try { return f(); } finally { map.topAt = savedTop; }
  };
  const tIdx = [], tBru = [], gIdx = [], gBru = [];
  const probe = (x, z) => map.relief ? map.groundHeightAt(x, z, map.relief.heightAt(x, z)) : map.groundHeightAt(x, z, 0);
  for (let k = 0; k < 9; k++) {
    tIdx.push(timeIt((x, z) => savedTop.call(map, x, z)));
    tBru.push(withBrute(() => timeIt((x, z) => map.topAt(x, z))));
    gIdx.push(timeIt(probe));
    gBru.push(withBrute(() => timeIt(probe)));
  }
  map.topAt = savedTop;
  const cand = (() => {
    let sum = 0;
    for (const [x, z] of points) sum += map._planAt(map._sweepCells, x, z, 0).length;
    return sum / points.length;
  })();
  out.topAt = { индекс: +med(tIdx).toFixed(3), перебор: +med(tBru).toFixed(3),
    'во сколько раз дешевле': +(med(tBru) / med(tIdx)).toFixed(2), кандидатовНаПробу: +cand.toFixed(3) };
  out.опора = { индекс: +med(gIdx).toFixed(3), перебор: +med(gBru).toFixed(3),
    отношение: +(med(gIdx) / med(gBru)).toFixed(3) };

  // 5. экстраполяция на кольцо главы 13: тот же перебор по списку из 14 дуг
  const many = [];
  for (let i = 0; i < 7; i++) for (const s of sweeps) many.push(s);
  const cost = (list) => timeIt((x, z) => bruteTopAt(list, x, z));
  const t2 = med([cost(sweeps), cost(sweeps), cost(sweeps)]);
  const t14 = med([cost(many), cost(many), cost(many)]);
  out.переборБудущего = { дуг: sweeps.length, мкс: +t2.toFixed(3), дуг14: many.length, мкс14: +t14.toFixed(3),
    'во сколько раз': +(t14 / t2).toFixed(2) };
  return out;
}
