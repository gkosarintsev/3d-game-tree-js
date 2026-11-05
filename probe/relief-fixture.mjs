import { reliefOf } from '../src/relief.js';
const hills = [
  { id: 'gryada', x: -30, z: 60, bx: 60, bz: 60, radius: 200, height: 10 },
  { id: 'lovchina', x: -80, z: -70, radius: 240, height: -6 },
];
const f = reliefOf({ baseY: 0, hills });
const pts = {
  'гребень (0,60)': [0, 60], 'гребень (60,60)': [60, 60], 'дом верх (0,84)': [0, 84],
  'низ (-80,-60)': [-80, -60], 'мост (-60,-40)': [-60, -40], 'мост (20,-40)': [20, -40],
  'спавн (-120,-110)': [-120, -110], 'выход (100,120)': [100, 120], 'площадка (0,20)': [0, 20],
};
for (const [k, [x, z]] of Object.entries(pts)) {
  console.log(k, 'y=', f.heightAt(x, z).toFixed(3), 'slope=', f.slopeAt(x, z).mag.toFixed(3));
}
