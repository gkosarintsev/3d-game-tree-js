/** Число пластин и резов при штатном и тугом допуске. */
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { reliefOf } from '../src/relief.js';
import { CONFIG } from '../src/config.js';
import { r3 } from '../src/geo2d.js';
import { CITY_RAW } from './city-fixture.mjs';
const J = CONFIG.jsonMap;
const base = () => { const raw = structuredClone(CITY_RAW); raw.kind = 'json2';
  raw.relief = { baseY: 0, hills: [ { id: 'hrub', x: -80, z: -80, radius: 400, height: 3 }, { id: 'lon', x: 90, z: 90, radius: 400, height: -2 }] };
  raw.city.districts[0].yaw = 18;
  raw.city.districts[0].polygon = [ { x: -126, z: -78 }, { x: -82, z: -129 }, { x: -31, z: -123 }, { x: -37, z: -51 }, { x: -78, z: -34 }];
  raw.ground.size = 320;
  return raw; };
const terraceY = normalizeLevel(expandCity(base())).map.relief.pads.find(p => p.id === 'b:терраса').y;
function mk() { const raw = base();
  raw.buildings.push({ id: 'plinth', isEnterable: false, floorsCount: 3, floorHeight: 3.4,
    baseY: r3(terraceY + 0.55),
    footprint: [{ x: 56, z: 54 }, { x: 68, z: 54 }, { x: 68, z: 66 }, { x: 56, z: 66 }], rooms: [] });
  return raw; }
function ends(d) { if (d.yaw === undefined) { const cz = (d.minZ + d.maxZ)/2; return [{x:d.minX,z:cz},{x:d.maxX,z:cz}]; }
  const rad = d.yaw*Math.PI/180, c=Math.cos(rad), s=Math.sin(rad), h=d.length/2;
  return [{x:d.cx-c*h,z:d.cz-s*h},{x:d.cx+c*h,z:d.cz+s*h}]; }
function joints(decks) { let n=0,w=0;
  const at=(d,x,z)=>{const rad=(d.yaw??0)*Math.PI/180,c=Math.cos(rad),s=Math.sin(rad),h=d.length/2;
    const cx=d.yaw===undefined?(d.minX+d.maxX)/2:d.cx, cz=d.yaw===undefined?(d.minZ+d.maxZ)/2:d.cz;
    const u=(x-cx)*c+(z-cz)*s; return {u,half:h,y:d.topAtMin+(d.topAtMax-d.topAtMin)*((u+h)/(2*h))};};
  for (const A of decks) for (const p of ends(A.d)) { const ya=at(A.d,p.x,p.z).y;
    for (const B of decks) { if (B===A) continue; const q=at(B.d,p.x,p.z); if (Math.abs(q.u)>q.half+0.02) continue; n++; w=Math.max(w,Math.abs(ya-q.y)); } }
  return {n,w}; }
for (const fit of [J.streetFit, 0.005, 0.002]) {
  J.streetFit = fit;
  const l = normalizeLevel(expandCity(mk()));
  const decks = l.map.roads.flatMap(r => r.decks.filter(d => d.length !== undefined).map(d => ({id:r.id, d})));
  const field = reliefOf(l.map.relief);
  let dev = 0, tilted = 0, slope = 0;
  for (const {d} of decks) { const [a,b]=ends(d); const run=Math.hypot(b.x-a.x,b.z-a.z);
    if (Math.abs(d.topAtMax-d.topAtMin)>0.01) tilted++;
    slope=Math.max(slope,Math.abs(d.topAtMax-d.topAtMin)/Math.max(run,1e-6));
    const k=Math.max(2,Math.round(run/J.navStep));
    for (let i=1;i<k;i++){const t=i/k;dev=Math.max(dev,Math.abs(field.heightAt(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t)+J.streetRise-(d.topAtMin+(d.topAtMax-d.topAtMin)*t)));}}
  const j = joints(decks);
  console.log('fit', fit, 'пластин', decks.length, 'резано дорог', l.map.roads.filter(r=>r.decks.length>1).length,
    'tilted', tilted, 'slope', slope.toFixed(4), 'dev', dev.toFixed(4), 'стыков', j.n, 'худший', j.w.toFixed(6),
    'предупр', l.warnings.length, l.warnings.slice(0,3).map(w=>w.slice(0,55)).join(' | '));
}
