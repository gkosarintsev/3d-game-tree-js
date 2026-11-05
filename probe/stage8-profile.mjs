/* Профили поля для авторских дорог главы 12: линии, по которым ложатся
   набережные, плато-авеню и подъёмы. Печатает минимум/максимум и отметки на
   границах пластин, чтобы хорду можно было выбрать одним взглядом. */
import { reliefOf } from '../src/relief.js';
import { LEVEL_12 } from '../src/levels/level-12.js';

const q = reliefOf({ ...LEVEL_12.map.relief });
const F = (x, z) => q.heightAt(x, z);
const r3 = v => Math.round(v * 1000) / 1000;

function alongX(z, from, to, step = 20) {
  const ys = [];
  for (let x = from; x <= to + 1e-9; x += step) ys.push(F(x, z));
  ys.push(F(to, z));
  console.log(`z=${z} x ${from}..${to}: мин ${r3(Math.min(...ys))} макс ${r3(Math.max(...ys))}`);
  console.log('   ' + ys.map((y, i) => `${from + i * step}:${r3(y)}`).join('  '));
}
function alongZ(x, from, to, step = 10) {
  const ys = [];
  for (let z = from; z <= to + 1e-9; z += step) ys.push(F(x, z));
  if ((to - from) % step) ys.push(F(x, to));
  console.log(`x=${x} z ${from}..${to}: мин ${r3(Math.min(...ys))} макс ${r3(Math.max(...ys))}`);
  console.log('   ' + ys.map((y, i) => `${from + i * step}:${r3(y)}`).join('  '));
}

console.log('=== линии вдоль X (набережные, улицы, авеню) ===');
for (const z of [-290, -250, -169, -83, -70, 118, 140]) alongX(z, -280, 280);

console.log('\n=== линии вдоль Z (коридоры подъёмов и поперёчные улицы) ===');
for (const x of [-250, -192, -58, -20, 60, 170, 226, 260]) alongZ(x, -300, 290);
