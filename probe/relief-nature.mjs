import { reliefOf } from '../src/relief.js';

const hills = [
  { id: 'gryada', x: -30, z: 60, bx: 60, bz: 60, radius: 250, height: 10 },
  { id: 'lovchina', x: -80, z: -70, radius: 300, height: -6 },
];
const f = reliefOf({ baseY: 0, hills });
console.log('макс уклон природы', (() => {
  let m = 0, at = null;
  for (let x = -148; x <= 148; x += 4) for (let z = -148; z <= 148; z += 4) {
    const s = f.slopeAt(x, z).mag;
    if (s > m) { m = s; at = [x, z]; }
  }
  return `${m.toFixed(3)} в ${at}`;
})());
for (const [x, z] of [[0, 55], [0, 75], [10, 60], [-20, 40], [40, 40], [-20, 70], [40, 70],
  [0, 100], [-80, -60], [-60, -40], [20, -40], [0, 20], [0, 30], [-10, 10], [10, 30], [100, 120], [-120, -110]]) {
  console.log(`nature(${x},${z}) = ${f.heightAt(x, z).toFixed(2)}  slope ${f.slopeAt(x, z).mag.toFixed(3)}`);
}
