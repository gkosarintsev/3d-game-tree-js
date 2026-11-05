/**
 * Разведка падения «Опора ноги на пластине»: пластина `b_s_v1_1` отдаёт
 * groundHeightAt −0,649 (это поле + streetRise, т. е. плоскость соседней
 * площадки), а её собственное полотно −0,642. Нужно увидеть сами записи: deck,
 * призмы и поверхности, которые накрывают точку пробы.
 *
 * Запуск: страница игры, `await import('/probe/stage6z.mjs')`.
 */
import * as THREE from 'three';
import { createJsonMap } from '../src/json-map.js';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { CONFIG } from '../src/config.js';

const J = CONFIG.jsonMap;

function fixture() {
  return {
    kind: 'json2',
    metadata: { levelName: 'probe', name: '—', hint: '—', units: 'meters' },
    ground: { y: 0, size: 320, color: '#23262c' },
    relief: {
      baseY: 0,
      hills: [
        { id: 'hrub', x: -80, z: -80, radius: 400, height: 3 },
        { id: 'lon', x: 90, z: 90, radius: 400, height: -2 },
      ],
    },
    city: {
      seed: 70707,
      districts: [{
        id: 'b', block: { minX: 20, maxX: 140, minZ: 20, maxZ: 140 }, style: 'kitsch',
        street: { pitch: 34, width: 12 }, lot: { pitch: 9, inset: 1.5, merge: 0.45 },
        height: { minFloors: 2, maxFloors: 6, floorHeight: 3.2 }, enterableEvery: 6,
        roofs: { walkable: true, access: 0.5, parapet: 0.9 },
      }],
    },
    roads: [], buildings: [], landscapeObjects: [], lights: [],
    gameplay: {
      goal: 'exit', spawn: { x: -100, z: -100 }, exit: { x: 100, z: 100 }, exitRadius: 4,
      enemies: { count: 2 }, alienEnemies: { count: 1 },
    },
  };
}

const terraceY = normalizeLevel(expandCity(fixture()))
  .map.relief.pads.find(p => p.id === 'b:терраса').y;
const withPlinth = fixture();
withPlinth.buildings = [{
  id: 'plinth', isEnterable: false, floorsCount: 3, floorHeight: 3.4,
  baseY: +(terraceY + 0.55).toFixed(3),
  footprint: [{ x: 56, z: 54 }, { x: 68, z: 54 }, { x: 68, z: 66 }, { x: 56, z: 66 }],
  rooms: [],
}];

const level = normalizeLevel(expandCity(withPlinth));
const map = createJsonMap(level.map);
map.build(new THREE.Scene());

const road = level.map.roads.find(r => r.decks.some(d => d.id === undefined && false) || /^b_s_v1_/.test(r.id));
console.log('терраса', terraceY, 'район b дорог', level.map.roads.length);

for (const r of level.map.roads) {
  for (const [i, d] of r.decks.entries()) {
    if (!r.id.startsWith('b_s_v1')) continue;
    const rise = d.topAtMax - d.topAtMin;
    console.log(`${r.id}[${i}] axis=${d.axis} yaw=${d.yaw} len=${d.length} w=${d.width}`,
      `cx=${d.cx} cz=${d.cz}`, `minX=${d.minX}..${d.maxX} minZ=${d.minZ}..${d.maxZ}`,
      `topAtMin=${d.topAtMin} topAtMax=${d.topAtMax} topY=${d.topY} rise=${rise.toFixed(4)}`,
      `ramp=${d.ramp} |rise|>0.01?${Math.abs(rise) > 0.01}`);
  }
}

// точка пробы: центр пластины b_s_v1_1 вдоль её оси
const target = level.map.roads.filter(r => r.id.startsWith('b_s_v1')).flatMap(r =>
  r.decks.map(d => ({ id: r.id, d }))).find(x => x.id.endsWith('_1'));
if (target) {
  const { d, id } = target;
  const rad = (d.yaw ?? 0) * Math.PI / 180;
  const c = Math.cos(rad), s = Math.sin(rad);
  const cx = d.cx ?? (d.minX + d.maxX) / 2, cz = d.cz ?? (d.minZ + d.maxZ) / 2;
  for (const u of [-0.35, 0, 0.35]) {
    const uu = u * d.length;
    const x = cx + uu * c, z = cz + uu * s;
    const t = (uu / d.length) + 0.5;
    const want = d.topAtMin + (d.topAtMax - d.topAtMin) * t;
    const g = map.groundHeightAt(x, z, 500);
    const plate = map.plateHeightAt(x, z, 500);
    const prism = map._prismTopAt(x, z);
    console.log(`${id} при u=${uu.toFixed(1)}: опора ${g} != полотно ${want.toFixed(3)}`,
      `plateHeightAt=${plate} prismTopAt=${prism} поле=${map.relief.heightAt(x, z)}`,
      `поле+rise=${map.relief.heightAt(x, z) + J.streetRise}`);
  }
}

// что именно лежит над этой точкой: призмы и поверхности, накрывающие её
const dd = target?.d;
if (dd) {
  const rad = (dd.yaw ?? 0) * Math.PI / 180;
  const x = (dd.cx ?? (dd.minX + dd.maxX) / 2), z = (dd.cz ?? (dd.minZ + dd.maxZ) / 2);
  const hits = map.prisms.map((w, i) => ({ i, w, l: w.frame ? { x: x, z: z } : null }))
    .filter(h => h.w.topAt ? true : false);
  console.log('призм всего', map.prisms.length, 'поверхностей', map.surfaces.length);
  for (const [i, w] of map.prisms.entries()) {
    const l = w.frame ? { x, z } : null;
    const u = w.frame ? (x - w.frame.cx) * Math.cos(w.frame.rad) + (z - w.frame.cz) * Math.sin(w.frame.rad) : (w.axis === 'x' ? x : z);
    const v = w.frame ? -(x - w.frame.cx) * Math.sin(w.frame.rad) + (z - w.frame.cz) * Math.cos(w.frame.rad) : (w.axis === 'x' ? z : x);
    if (u >= w.lo && u <= w.hi && v >= w.v0 && v <= w.v1) {
      console.log(`призма ${i}: axis=${w.axis} u∈[${w.lo},${w.hi}] v∈[${w.v0},${w.v1}] frame=${!!w.frame} topAt(u)=${w.topAt(u)} topAt(lo)=${w.topAt(w.lo)} topAt(hi)=${w.topAt(w.hi)}`);
    }
  }
  for (const [i, sp] of map.surfaces.entries()) {
    if (x >= sp.minX - 0.01 && x <= sp.maxX + 0.01 && z >= sp.minZ - 0.01 && z <= sp.maxZ + 0.01) {
      console.log(`поверхность ${i}: y=${sp.y} план ${sp.minX}..${sp.maxX} × ${sp.minZ}..${sp.maxZ} obb=${!!sp.obb}`);
    }
  }
}
void THREE;
