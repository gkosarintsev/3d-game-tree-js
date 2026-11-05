import fs from 'node:fs';
import { makeRng } from '../src/rng.js';
import { reliefOf } from '../src/relief.js';
import { TRACK_DEFAULTS, trackSpec, trackCenterline, trackProfile, trackToes, trackDeckAt, trackAxisAt } from '../tools/city.js';

const ring = (over = {}, seed = 20261105) => trackCenterline(trackSpec({ ...TRACK_DEFAULTS, ...over }), { rng: makeRng(seed), bump: () => {} });
const lvl12 = JSON.parse(fs.readFileSync('src/levels/level-12.json', 'utf8'));
const field12 = reliefOf({ ...lvl12.relief, baseY: 0 });

const show = (label, tr, field, groundY) => {
  const t0 = performance.now();
  let p;
  try {
    p = trackProfile(tr, field, groundY);
  } catch (e) {
    console.log(`${label}: ОШИБКА — ${e.message}`);
    return null;
  }
  const ms = performance.now() - t0;
  console.log(`${label}: проб ${p.n} шаг ${p.step.toFixed(3)} м | разброс ${p.spread.toFixed(2)} м`
    + ` | уклон ≤ ${p.maxSlope.toFixed(4)} | зазор ≥ ${p.minClear.toFixed(2)}`
    + ` | подвес ≤ ${p.hang.toFixed(2)} | профиль ${ms.toFixed(2)} мс`);
  return p;
};

show('равнина, дефолты', ring(), null, 0);
show('поле главы 12, центр (0,0)', ring(), field12, 0);
show('поле главы 12, смещённое к северу', ring({ center: [0, 150], radius: 90, turns: 10 }), field12, 0);

// одна сопка поперёк петли: предел крутизны поля 1,5·h/r
const hill = reliefOf({ baseY: 0, hills: [{ x: -300, z: 0, bx: 300, bz: 0, radius: 120, height: 14 }] });
show('сопка 14 м через ось петли', ring(), hill, 0);
const steep = reliefOf({ baseY: 0, hills: [{ x: -300, z: 0, bx: 300, bz: 0, radius: 60, height: 30 }] });
show('сопка 30 м на радиусе 60 м', ring(), steep, 0);

// носы съездов
const ctx12 = { field: field12, ground: { y: 0, size: 600 } };
const tr = ring();
trackProfile(tr, field12, 0);
for (const e of trackToes(tr, ctx12)) {
  console.log(`съезд ${e.id}: с петли (отметка ${e.toe.ringTop.toFixed(3)}, уклон ${e.toe.slope.toFixed(4)})`
    + ` пролёт ${e.toe.reach.toFixed(1)} м до (${e.toe.x}, ${e.toe.z}) на отметке ${e.toe.top}`
    + ` | уровень улицы под носом ${e.toe.level} | поле ${field12.heightAt(e.toe.x, e.toe.z).toFixed(3)}`);
}
const trs = ring({ radius: 60, minRadius: 20, turns: 10, amplitude: 1 });
show('мелкое кольцо на крутой сопке', trs, steep, 0);
const trFar = ring({ radius: 280, width: 20, amplitude: 1 });
try {
  trackProfile(trFar, null, 0);
  trackToes(trFar, { field: null, ground: { y: 0, size: 600 } });
  console.log(' кольцо на 280 м: носы влезли в плитку');
} catch (e) {
  console.log('кольцо на 280 м: ОШИБКА —', e.message);
}
