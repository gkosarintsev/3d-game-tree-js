/**
 * Чем именно дорожает проба из-за гряды: те же точки, два поля, измерения
 * перемешаны парами (медиана) — порядковый протокол relief11-attrib.mjs
 * перекручивал результат (проверено relief11-order.mjs: при обратном порядке
 * «гряда дешевле HEAD» разворачивается).
 */
import { reliefOf } from '../src/relief.js';
import { LEVEL_12 as HEAD } from './bak/level-12-head.js';
import { LEVEL_12 as NOW } from '../src/levels/level-12.js';

const half = NOW.map.ground.size / 2;
const pts = [];
for (let i = 0; i < 2000; i++) pts.push([-half + (i * 7.13) % (2 * half), -half + (i * 11.77) % (2 * half)]);

const mk = (spec) => { const f = reliefOf(spec); return () => { let acc = 0; for (const p of pts) acc += f.heightAt(p[0], p[1]); return acc === -1 ? 1 : pts.length; }; };
const headSpec = HEAD.map.relief, nowSpec = NOW.map.relief;
const headRun = mk(headSpec), nowRun = mk(nowSpec);

const median = (xs) => xs.slice().sort((a, b) => a - b)[xs.length >> 1];
const head = [], now = [];
for (let k = 0; k < 3; k++) { headRun(); nowRun(); }
for (let i = 0; i < 15; i++) {
  for (const [fn, out] of [[headRun, head], [nowRun, now]]) {
    const t0 = process.hrtime.bigint(); const calls = fn();
    out.push(Number(process.hrtime.bigint() - t0) / 1e3 / calls);
  }
}
const a = median(head), b = median(now);
console.log(`поле HEAD (холмов ${headSpec.hills.length}): ${a.toFixed(3)} мкс/проба медианой из 15`);
console.log(`поле с грядой (холмов ${nowSpec.hills.length}):  ${b.toFixed(3)} мкс/проба медианой из 15`);
console.log(`данные стоят ×${(b / a).toFixed(2)} (разброс HEAD ${(Math.max(...head) / Math.min(...head)).toFixed(2)}, гряды ${(Math.max(...now) / Math.min(...now)).toFixed(2)})`);
