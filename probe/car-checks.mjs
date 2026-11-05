/**
 * Прогон новых проверок `gameplay.cars`: каждый бракуемый случай обязан быть
 * назван так, чтобы по тексту ошибки было видно, что править.
 */
import { readFileSync } from 'node:fs';
import { validateLevel, LEVEL_SPEC_V2 } from '../tools/level-schema.mjs';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { expandCity } from '../tools/city.js';

const DEG = Math.PI / 180;
const source = () => JSON.parse(readFileSync('src/levels/level-13.json', 'utf8'));
const spot = j => j.gameplay.cars.spots[0];

const good = expandCity(source());
const built = normalizeLevel(good);
console.log('исходные точки:', JSON.stringify(built.gameplay.cars));
console.log('предупреждений нормализатора на чистом брифе:', built.warnings.length);

// точка внутри плана первого дома — чтобы «корпус в доме» мерился по фактческим
// данным главы, а не по памяти о координатах
const house = built.map.buildings.find(b => b.bounds);
const hx = (house.bounds.minX + house.bounds.maxX) / 2;
const hz = (house.bounds.minZ + house.bounds.maxZ) / 2;
// русло: первая дыра дна — по ней вода, и машина встала бы в неё
const hole = built.map.channels?.[0]?.holes?.[0];
const wx = hole ? (hole.minX + hole.maxX) / 2 : 0;
const wz = hole ? (hole.minZ + hole.maxZ) / 2 : 0;
console.log(`дом ${house.id} центр (${hx}, ${hz}); русло ${built.map.channels?.[0]?.id} (${wx}, ${wz})`);

const cases = {
  'count не совпал с точками': j => { j.gameplay.cars.count = 3; },
  'точка вне земли': j => { spot(j).x = 400; spot(j).z = 400; },
  'корпус в плане дома': j => { const s = spot(j); s.x = hx; s.z = hz; s.yaw = 0; },
  'две машины внахлёст': j => { j.gameplay.cars.spots[1] = { x: 99.9, z: -19.1, yaw: 31.9 }; },
  'корпус за кромкой полотна': j => {
    const s = spot(j), a = s.yaw * DEG;
    s.x -= 4.5 * Math.sin(a); s.z += 4.5 * Math.cos(a);
    s.x = +s.x.toFixed(3); s.z = +s.z.toFixed(3);
  },
  'нос на грунте, не на настиле': j => { const s = spot(j); s.x = 6.23; s.z = -78.47; },
  'машина в русле': j => { const s = spot(j); s.x = wx; s.z = wz; s.yaw = 0; },
};

for (const [name, mutate] of Object.entries(cases)) {
  const j = source();
  mutate(j);
  let expanded;
  try {
    expanded = expandCity(j);
  } catch (e) {
    console.log(`\n${name}: ✖ разворот — ${e.message}`);
    continue;
  }
  const { errors, warnings } = validateLevel(expanded, LEVEL_SPEC_V2);
  let norm = [];
  if (!errors.length) {
    try {
      norm = normalizeLevel(expanded).warnings;
    } catch (e) {
      norm = [`исключение: ${e.message}`];
    }
  }
  console.log(`\n${name}:`);
  for (const e of errors.slice(0, 3)) console.log(`  ✖ ${e}`);
  for (const w of warnings.slice(0, 3)) console.log(`  ⚠ схема: ${w}`);
  for (const w of norm.slice(0, 3)) console.log(`  ⚠ нормализатор: ${w}`);
  if (!errors.length && !warnings.length && !norm.length) console.log('  — молчит');
}
