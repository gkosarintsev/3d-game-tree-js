import { makeRng } from '../src/rng.js';
import { TRACK_DEFAULTS, trackSpec, trackCenterline } from '../tools/city.js';

const ring = (over = {}, seed = 1) => trackCenterline(trackSpec({ ...TRACK_DEFAULTS, ...over }), { rng: makeRng(seed), bump: () => {} });
const SEEDS = [1, 7, 20261105, 42, 99991, 555, 2024, 31337];

for (const jitter of [0, 0.2, 0.35, 0.49]) {
  for (const turns of [3, 5, 12, 14, 21]) {
    let dropped = 0, worst = 0, arcs = 0, minR = Infinity, els = 0, len = 0;
    for (const seed of SEEDS) {
      const tr = ring({ turns, curvatureJitter: jitter }, seed);
      els += tr.elements.length; len += tr.length;
      for (let i = 0; i < turns; i++) {
        worst = Math.max(worst, Math.abs(tr.turn[i]));
        if (tr.R[i] === 0) dropped++; else minR = Math.min(minR, tr.R[i]);
        if (tr.elements.some(e => e.kind === 'arc' && e.i === i)) arcs++;
      }
    }
    console.log(`jitter ${jitter} turns ${turns}: дуг ${(arcs / SEEDS.length).toFixed(1)}/${turns} на кольцо,`
      + ` сброшено ${dropped}, макс поворот ${(worst * 180 / Math.PI).toFixed(1)}°, мин R ${minR.toFixed(1)} м,`
      + ` элементов ${els}, длина ${(len / SEEDS.length).toFixed(0)} м`);
  }
}
