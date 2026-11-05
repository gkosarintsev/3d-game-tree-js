/**
 * Замер этапа 6b: насколько поле вообще требует профиля улиц генератора.
 *
 * Для каждой пластины — продольный перепад поля вдоль её оси, углы, которые
 * придётся держать, и провал настила под поле (тогда опорой отвечает грунт, а не
 * асфальт). Считается по СЫРЫМ дорогам: нормализатор служебные поля (`district`,
 * `crossing`, `grade`) срезает, и по модулю главы генераторную улицу не отличить.
 */
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { reliefOf } from '../src/relief.js';
import { CONFIG } from '../src/config.js';
import { CITY_RAW } from './city-fixture.mjs';

const J = CONFIG.jsonMap;
const raw = structuredClone(CITY_RAW);
raw.city.districts[0].polygon = [
  { x: -140, z: -140 }, { x: -20, z: -140 }, { x: -20, z: -20 }, { x: -140, z: -20 }];
const expanded = expandCity(raw);
const level = normalizeLevel(structuredClone(expanded));
const field = reliefOf(level.map.relief);

/** Концы оси пластины в мире: `yaw` есть у косой, иначе локальная X = мировая X. */
function ends(p) {
  const half = p.length / 2;
  const rad = (p.yaw ?? 0) * Math.PI / 180;
  const c = Math.cos(rad), s = Math.sin(rad);
  return [
    { x: p.x - half * c, z: p.z - half * s },
    { x: p.x + half * c, z: p.z + half * s },
  ];
}

const runs = [], cross = [];
for (const r of expanded.roads) {
  if (r.district === undefined) continue;
  for (const el of r.elements ?? []) {
    const p = el.plate;
    (r.crossing ? cross : runs).push({ id: r.id, p, a: ends(p)[0], b: ends(p)[1] });
  }
}

/** Перепад поля между концами и провал хорды под поле (хорда — поле по концам). */
function profile(a, b) {
  const run = Math.hypot(b.x - a.x, b.z - a.z);
  const k = Math.max(2, Math.round(run / step));
  const ys = [];
  for (let i = 0; i <= k; i++) {
    const t = i / k;
    ys.push(field.heightAt(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t));
  }
  const yA = ys[0], yB = ys[ys.length - 1];
  let sag = 0; // поле выше хорды
  let high = 0; // хорда выше поля (настил «гуляет» над грунтом)
  for (let i = 0; i <= k; i++) {
    const chord = yA + (yB - yA) * (i / k);
    sag = Math.max(sag, ys[i] - chord);
    high = Math.max(high, chord - ys[i]);
  }
  return { run, d: yB - yA, slope: Math.abs(yB - yA) / Math.max(run, 1e-6), sag, high,
    lo: Math.min(...ys), hi: Math.max(...ys) };
}
const step = J.navStep;

const pr = runs.map(x => ({ ...x, ...profile(x.a, x.b) }));
const pc = cross.map(x => ({ ...x, ...profile(x.a, x.b) }));

const grade = J.streetGrade ?? 0.06;
const fmt = v => +v.toFixed(3);
console.log(JSON.stringify({
  прогонов: runs.length, перекрёстков: cross.length, шагпробы: step,
  'перепад поля > 0,02 м': pr.filter(x => Math.abs(x.d) > 0.02).length,
  'уклон поля круче grade': pr.filter(x => x.slope > grade).length,
  'хорда под полем (sag > 0,02)': pr.filter(x => x.sag > 0.02).length,
  'хорда над полем (high > 0,02)': pr.filter(x => x.high > 0.02).length,
  'перекрёсток не на плато (hi−lo > 0,02)': pc.filter(x => x.hi - x.lo > 0.02).length,
  худшиеуклоны: pr.map(x => fmt(x.slope)).sort((a, b) => b - a).slice(0, 6),
  худшиеперепады: pr.map(x => fmt(x.d)).sort((a, b) => Math.abs(b) - Math.abs(a)).slice(0, 6),
  худшиеsag: pr.map(x => fmt(x.sag)).sort((a, b) => b - a).slice(0, 6),
  худшиеперекрёстки: pc.map(x => fmt(x.hi - x.lo)).sort((a, b) => b - a).slice(0, 6),
}, null, 1));
console.log('низкие места поля под прогонами:',
  pr.filter(x => x.sag > 0.02).slice(0, 5).map(x => `${x.id} sag=${fmt(x.sag)} d=${fmt(x.d)} y=${fmt(x.lo)}–${fmt(x.hi)}`).join(' / '));
console.log('отметка настила сейчас:', fmt(runs[0].p.y), '| поле под ним:',
  fmt(field.heightAt(runs[0].p.x, runs[0].p.z)));
