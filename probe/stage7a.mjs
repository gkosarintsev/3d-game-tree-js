/**
 * Замер этапа 7 (план `docs/level12-relief-plan.md`, п. 4.5 и 4.6).
 *
 * A) Куда смотрит голова фонаря. Голова `lamp_post` вынесена по локальной +Z
 *    ([src/props.js:59]), а `rotationY` — угол `Object3D.rotation.y`, поэтому
 *    мировое направление головы `h = (sin θ, cos θ)`. Считаем `h · d`, где `d` —
 *    единичный вектор от столба к ближайшей точке ОСЕВОЙ полотна: `+1` — фонарь
 *    светит на дорогу, `0` — вдоль проезжей части, `−1` — прочь с неё.
 * B) Носы подъёмов. У каждой авторской дороги с `type !== 'ground'` и
 *    `type !== 'skybridge'` берём свободные концы цепочки элементов (тот, у кого
 *    нет соседа по торцу) и меряем расстояние до плана ближайшей наземной улицы,
 *    а также разницу отметок.
 *
 * Запуск: node probe/stage7a.mjs
 */
import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { CONFIG } from '../src/config.js';

const J = CONFIG.jsonMap;
const DEG = Math.PI / 180;

const load = (path) => {
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  return normalizeLevel(raw.city ? expandCity(raw) : raw).map;
};

/** Ближайшая точка осевой линии/дуги полотна и отметка полотна там. */
function nearestOnAxis(d, x, z) {
  if (d.arc) {
    const a = Math.atan2(z - d.cz, x - d.cx);
    let t = a - d.a0 * DEG;
    const span = d.span * DEG;
    while (t > Math.PI) t -= 2 * Math.PI;
    while (t < -Math.PI) t += 2 * Math.PI;
    const clamped = Math.max(Math.min(span, 0), Math.min(0, span)) === 0
      ? Math.max(0, Math.min(t, 0))
      : t;
    const u = span >= 0 ? Math.max(0, Math.min(t, span)) : Math.min(0, Math.max(t, span));
    const am = d.a0 * DEG + u;
    const p = { x: d.cx + Math.cos(am) * d.R, z: d.cz + Math.sin(am) * d.R };
    return { ...p, y: d.topAtMin + (d.topAtMax - d.topAtMin) * (u / (span || 1)) };
  }
  const rad = (d.yaw ?? 0) * DEG;
  const c = Math.cos(rad), s = Math.sin(rad);
  if (d.yaw !== undefined && d.length !== undefined && d.cx !== undefined) {
    const dx = x - d.cx, dz = z - d.cz;
    let u = dx * c + dz * s;
    u = Math.max(-d.length / 2, Math.min(d.length / 2, u));
    const t = (u + d.length / 2) / d.length;
    return {
      x: d.cx + u * c, z: d.cz + u * s,
      y: d.topAtMin + (d.topAtMax - d.topAtMin) * t,
    };
  }
  const along = d.axis === 'x' ? [d.minX, d.maxX] : [d.minZ, d.maxZ];
  const cross = d.axis === 'x' ? (d.minZ + d.maxZ) / 2 : (d.minX + d.maxX) / 2;
  let a = Math.max(along[0], Math.min(along[1], d.axis === 'x' ? x : z));
  const t = (a - along[0]) / ((along[1] - along[0]) || 1);
  return {
    x: d.axis === 'x' ? a : cross,
    z: d.axis === 'x' ? cross : a,
    y: d.topAtMin + (d.topAtMax - d.topAtMin) * t,
  };
}

/** Принадлежит ли точка плану пластины (для поиска «своего» настила фонаря). */
function onPlan(d, x, z, margin) {
  const n = nearestOnAxis(d, x, z);
  return Math.hypot(n.x - x, n.z - z) <= d.width / 2 + margin;
}

function lampsWhere(map, label) {
  const rows = [];
  for (const road of map.roads) {
    for (const l of road.lamps) {
      if (l.model !== 'lamp_post') continue;
      let best = null, bestDist = Infinity;
      for (const d of road.decks) {
        const n = nearestOnAxis(d, l.position.x, l.position.z);
        const dist = Math.hypot(n.x - l.position.x, n.z - l.position.z);
        if (dist < bestDist) { bestDist = dist; best = { n, d }; }
      }
      if (!best) continue;
      const { n, d } = best;
      const L = Math.hypot(n.x - l.position.x, n.z - l.position.z) || 1;
      const dx = (n.x - l.position.x) / L, dz = (n.z - l.position.z) / L;
      const th = l.rotationY * DEG;
      const dot = Math.sin(th) * dx + Math.cos(th) * dz;
      rows.push({ id: l.id, road: road.id, type: road.type, dot, dist: bestDist, topY: n.y });
    }
  }
  const onto = rows.filter(r => r.dot > 0.7).length;
  const along = rows.filter(r => Math.abs(r.dot) <= 0.7).length;
  const away = rows.filter(r => r.dot < -0.7).length;
  console.log(`${label}: фонарей ${rows.length} → на дорогу ${onto}, вдоль ${along}, прочь ${away}`);
  const byRoad = new Map();
  for (const r of rows) {
    const k = `${r.road} (${r.type})`;
    const a = byRoad.get(k) ?? { onto: 0, along: 0, away: 0 };
    a[r.dot > 0.7 ? 'onto' : Math.abs(r.dot) <= 0.7 ? 'along' : 'away']++;
    byRoad.set(k, a);
  }
  for (const [k, a] of byRoad) {
    if (a.onto === 0 || a.away + a.along === 0) console.log(`   ${k}: ${JSON.stringify(a)}`);
  }
  return rows;
}

console.log('=== A. куда смотрит голова фонаря ===');
lampsWhere(load('src/levels/level-10.json'), 'гл. 10 (v1)');
lampsWhere(load('src/levels/level-11.json'), 'гл. 11 (v2)');
lampsWhere(load('probe/city-relief-12.json'), 'фикстура рельефа (v2)');

console.log('\n=== B. свободные носы подъёмов ===');
for (const path of ['src/levels/level-10.json', 'src/levels/level-11.json', 'probe/city-relief-12.json']) {
  const map = load(path);
  const ground = map.roads.filter(r => r.type === 'ground');
  const up = map.roads.filter(r => r.type !== 'ground' && r.type !== 'skybridge' && r.type !== 'embankment');
  let free = 0, off = 0;
  const lines = [];
  for (const road of up) {
    for (let i = 0; i < road.decks.length; i++) {
      const d = road.decks[i];
      for (const end of ['min', 'max']) {
        // сосед по торцу — пластина той же дороги, чей план касается этого конца
        const neighbour = road.decks.some((o, k) => k !== i && Math.abs(
          (o.axis === 'x' ? o.cx ?? (o.minX + o.maxX) / 2 : o.cz ?? (o.minZ + o.maxZ) / 2)
          - (end === 'min'
            ? (d.axis === 'x' ? d.minX : d.minZ)
            : (d.axis === 'x' ? d.maxX : d.maxZ))) < 0.6);
        if (neighbour) continue;
        free++;
        const cap = {
          x: d.axis === 'x' ? (end === 'min' ? d.minX : d.maxX) : (d.minX + d.maxX) / 2,
          z: d.axis === 'x' ? (d.minZ + d.maxZ) / 2 : (end === 'min' ? d.minZ : d.maxZ),
        };
        let best = null, bestD = Infinity;
        for (const g of ground) {
          for (const gd of g.decks) {
            const n = nearestOnAxis(gd, cap.x, cap.z);
            const dist = Math.hypot(n.x - cap.x, n.z - cap.z);
            if (dist < bestD) { bestD = dist; best = { g, n }; }
          }
        }
        const yNose = end === 'min' ? d.topAtMin : d.topAtMax;
        const dy = best ? Math.abs(best.n.y - yNose) : NaN;
        const ok = bestD <= 1.0 && dy <= J.skybridgeFit + 0.05;
        if (!ok) off++;
        lines.push(`   ${road.id}[${i}].${end} @ ${cap.x}, ${cap.z}: ближайшая улица `
          + `${best ? best.g.id : '—'} в ${bestD.toFixed(2)} м, отметки ${yNose} vs ${best ? best.n.y : '—'}`
          + ` (Δ ${Number.isFinite(dy) ? dy.toFixed(3) : '—'}) → ${ok ? 'сходится' : 'ВНЕ улицы'}`);
      }
    }
  }
  console.log(`${path}: подъёмов ${up.length}, свободных носов ${free}, из них вне улицы ${off}`);
  for (const l of lines) console.log(l);
}
