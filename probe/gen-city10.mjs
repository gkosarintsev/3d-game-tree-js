// Зонд генератора кварталов (этап 4): разворачивает секцию `city` на 600 × 600 м,
// считает формы и уникальность, прогоняет валидатор с нормализатором и печатает
// время каждого шага. Результат — probe/city-600.json (тот же бриф с `city`), из
// которого tools/build-level.mjs собирает модуль для браузерной проверки графа.
import { writeFileSync } from 'node:fs';
import { expandCity, ARCHETYPE_NAMES } from '../tools/city.js';
import { validateLevel } from '../tools/level-schema.mjs';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { polyRects, r3 } from '../src/geo2d.js';

const ms = t => `${Math.round(t)} мс`;
const timed = label => {
  const t0 = process.hrtime.bigint();
  return () => { const d = Number(process.hrtime.bigint() - t0) / 1e6; console.log(`  ${label}: ${ms(d)}`); return d; };
};

const districts = [
  {
    id: 'ncc', block: { minX: -292, maxX: 26, minZ: 60, maxZ: 292 }, style: 'corporate',
    street: { pitch: 44, width: 14 }, lot: { pitch: 10, inset: 1.5, merge: 0.5 },
    height: { minFloors: 4, maxFloors: 16, floorHeight: 3.8 },
    tower: { chance: 0.14, floors: [24, 52], floorHeight: 4.4 },
    archetypes: ['box', 'slab', 'l', 'u', 't', 'cross', 'stepped2', 'stepped3', 'podium_tower'],
    enterableEvery: 7, skip: 0.02, courtyard: 0.16,
  },
  {
    id: 'nkab', block: { minX: 44, maxX: 292, minZ: 60, maxZ: 292 }, style: 'slum',
    street: { pitch: 32, width: 10 }, lot: { pitch: 9, inset: 1.5, merge: 0.5 },
    height: { minFloors: 2, maxFloors: 7, floorHeight: 3.1 },
    tower: { chance: 0.03, floors: [10, 18], floorHeight: 3.4 },
    archetypes: ['box', 'l', 'u', 'bar_pair', 'stepped2', 'podium_tower'],
    enterableEvery: 6, skip: 0.03, courtyard: 0.2,
  },
  {
    id: 'sind', block: { minX: -292, maxX: -44, minZ: -292, maxZ: -60 }, style: 'industrial',
    street: { pitch: 50, width: 16 }, lot: { pitch: 13, inset: 2, merge: 0.45 },
    height: { minFloors: 1, maxFloors: 5, floorHeight: 4.6 },
    tower: { chance: 0.05, floors: [12, 20], floorHeight: 5 },
    archetypes: ['box', 'slab', 'bar_pair', 'cross', 'stepped2'],
    enterableEvery: 7, skip: 0.05, courtyard: 0.1,
    roofs: { walkable: true, access: 0.3, parapet: 0.9 },
  },
  {
    id: 'skit', block: { minX: 26, maxX: 292, minZ: -292, maxZ: -60 }, style: 'kitsch',
    street: { pitch: 38, width: 12 }, lot: { pitch: 10, inset: 1.5, merge: 0.5 },
    height: { minFloors: 3, maxFloors: 12, floorHeight: 3.4 },
    tower: { chance: 0.08, floors: [16, 34], floorHeight: 3.9 },
    archetypes: ARCHETYPE_NAMES,
    enterableEvery: 5, skip: 0.02, courtyard: 0.14,
  },
];

const bridge = (id, x) => ({
  id, type: 'bridge', width: 8,
  points: [{ x, y: 0.12, z: -80 }, { x, y: 6, z: -46 }, { x, y: 6, z: 46 }, { x, y: 0.12, z: 80 }],
});

const raw = {
  metadata: { levelName: 'City10Probe', name: 'Зонд города', hint: '—', units: 'meters' },
  ground: { y: 0, size: 600, color: '#1a1d22' },
  waterways: [{
    id: 'river', width: 70, bedY: -4, surfaceY: -1.5, bank: 'quay', wade: true,
    ramps: [{ at: { x: -220, z: 0 }, width: 6 }, { at: { x: 230, z: 0 }, width: 6 }],
    points: [{ x: -300, z: 0 }, { x: 300, z: 0 }],
  }],
  roads: [bridge('bridge_west', -120), bridge('bridge_east', 150)],
  buildings: [],
  city: { seed: 20261103, districts },
  landscapeObjects: [],
  lights: [{ id: 'moon', type: 'directional', position: { x: 120, y: 220, z: 80 }, color: '#bcd0ff', intensity: 0.55 }],
  sky: {
    sky: '#0b1020', fog: { color: '#0e1424', near: 40, far: 320 },
    hemi: { sky: '#1b2a44', ground: '#0a0d12', intensity: 0.4 },
    lights: { count: 8, reach: 60, height: 5.4, spacing: 20, intensity: 70 },
  },
  gameplay: {
    goal: 'exit', spawn: { x: -120, z: 96 }, exit: { x: 150, z: -96 },
    exitRadius: 4, enemies: { count: 6 }, alienEnemies: { count: 2 },
  },
};

const tExpand = timed('expandCity');
let expanded;
const stats = {};
try {
  expanded = expandCity(raw, stats);
} catch (e) {
  console.error('разворот не удался:\n' + e.message);
  process.exit(1);
}
const expandMs = tExpand();
console.log(`  счётчики: ${Object.entries(stats).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ')}`);

// ---- статистика разворота
const byArchetype = new Map();
for (const b of expanded.buildings) byArchetype.set(b.archetype, (byArchetype.get(b.archetype) ?? 0) + 1);
const shapeKeys = b => {
  const rs = polyRects(b.footprint);
  const bx = Math.min(...rs.map(r => r.minX)), bz = Math.min(...rs.map(r => r.minZ));
  const bw = Math.max(...rs.map(r => r.maxX)) - bx, bd = Math.max(...rs.map(r => r.maxZ)) - bz;
  const cell = (r, fx, fz) => {
    const rx = r.minX - bx, rz = r.minZ - bz, w = r.maxX - r.minX, d = r.maxZ - r.minZ;
    return [fx ? rx : bw - rx - w, fz ? rz : bd - rz - d, w, d].map(v => r3(v)).join(',');
  };
  // четыре отражения рамки: форма, поставленная зеркально, — та же форма руками автора
  const variants = [];
  for (const fx of [1, 0]) {
    for (const fz of [1, 0]) {
      variants.push(rs.map(r => cell(r, fx, fz)).sort().join('|'));
    }
  }
  return { exact: variants[0], upToMirror: variants.sort()[0] };
};
const by = (b, key) => shapeKeyCache.get(b.id)[key];
const shapeKeyCache = new Map();
for (const b of expanded.buildings) shapeKeyCache.set(b.id, shapeKeys(b));
const uniq = key => {
  const counts = new Map();
  for (const b of expanded.buildings) counts.set(by(b, key), (counts.get(by(b, key)) ?? 0) + 1);
  return [...counts.values()].filter(v => v === 1).length;
};
const uniqueShapes = uniq('exact');
const uniqueMirrored = uniq('upToMirror');
const enterable = expanded.buildings.filter(b => b.isEnterable).length;
const roofed = expanded.buildings.filter(b => b.roof?.walkable).length;

// ни одно здание не должно лежать в полосе улицы или в русле
const streetBands = expanded.roads.filter(r => r.type === 'ground')
  .map(r => ({ id: r.id, rect: { minX: Math.min(r.points[0].x, r.points[1].x) - r.width / 2, maxX: Math.max(r.points[0].x, r.points[1].x) + r.width / 2, minZ: Math.min(r.points[0].z, r.points[1].z) - r.width / 2, maxZ: Math.max(r.points[0].z, r.points[1].z) + r.width / 2 } }));
const inStreet = expanded.buildings.filter(b => {
  const r = { minX: b.footprint[0].x, maxX: b.footprint[0].x, minZ: b.footprint[0].z, maxZ: b.footprint[0].z };
  for (const p of b.footprint) {
    r.minX = Math.min(r.minX, p.x); r.maxX = Math.max(r.maxX, p.x);
    r.minZ = Math.min(r.minZ, p.z); r.maxZ = Math.max(r.maxZ, p.z);
  }
  return streetBands.some(s => r.minX < s.rect.maxX - 0.05 && r.maxX > s.rect.minX + 0.05
    && r.minZ < s.rect.maxZ - 0.05 && r.maxZ > s.rect.minZ + 0.05);
});
const ids = new Set();
const dupIds = [];
for (const b of expanded.buildings) { if (ids.has(b.id)) dupIds.push(b.id); ids.add(b.id); }

console.log(`зданий ${expanded.buildings.length}, улиц ${expanded.roads.length}, архетипов ${byArchetype.size} из ${ARCHETYPE_NAMES.length}`);
console.log(`  форм уникальных ${uniqueShapes} из ${expanded.buildings.length} (${Math.round(uniqueShapes / expanded.buildings.length * 100)} %),`
  + ` с точностью до зеркала ${uniqueMirrored} (${Math.round(uniqueMirrored / expanded.buildings.length * 100)} %),`
  + ` вводимых ${enterable}, с ходовой кровлей ${roofed}`);
console.log(`  представителей архетипов: ${[...byArchetype].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ')}`);
console.log(`  зданий в полосе улицы ${inStreet.length}${inStreet.length ? `: ${inStreet.slice(0, 5).map(b => b.id).join(', ')}` : ''}, повторяющихся id ${dupIds.length}`);

// ---- детерминизм: второй прогон обязан дать те же байты
const again = expandCity(raw);
const same = JSON.stringify(again) === JSON.stringify(expanded);
console.log(`  второй разворот побайтово равен первому: ${same}`);

// ---- схема + нормализатор
const tValidate = timed('validateLevel');
const { errors, warnings } = validateLevel(expanded);
tValidate();
const tNorm = timed('normalizeLevel');
let level = null;
try {
  level = normalizeLevel(expanded);
} catch (e) {
  console.error('нормализатор бросил: ' + e.message);
}
const normMs = tNorm();
console.log(`  ошибок ${errors.length}, предупреждений ${warnings.length}`);
for (const msg of errors.slice(0, 12)) console.error(`    ✖ ${msg}`);
for (const msg of warnings.slice(0, 8)) console.log(`    ⚠ ${msg}`);
if (level) {
  const nodes = level.map.nav?.nodes?.length ?? 0;
  console.log(`  данных нормализовано: зданий ${level.map.buildings.length}, улиц ${level.map.roads.length}, узлов графа ${nodes}, модуль ${(JSON.stringify(level).length / 1024).toFixed(0)} КиБ`);
}
void normMs;

writeFileSync('probe/city-600.json', JSON.stringify(raw, null, 1));
console.log(`бриф записан: probe/city-600.json (разворот ${ms(expandMs)})`);
