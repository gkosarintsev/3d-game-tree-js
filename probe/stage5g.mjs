import { expandCity } from '../tools/city.js';
import { frameAt, unrotatePoint, pointInPoly } from '../src/geo2d.js';
import { CITY_RAW } from './city-fixture.mjs';
const POLY = [{x:-126,z:-78},{x:-82,z:-129},{x:-31,z:-123},{x:-37,z:-51},{x:-78,z:-34}];
const DEG = Math.PI/180;
function segDist(a,b,x,z){const dx=b.x-a.x,dz=b.z-a.z,L2=dx*dx+dz*dz;const t=L2>0?Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/L2)):0;return Math.hypot(x-(a.x+t*dx),z-(a.z+t*dz));}
function polyDist(poly,x,z){let m=Infinity;for(let i=0;i<poly.length;i++)m=Math.min(m,segDist(poly[i],poly[(i+1)%poly.length],x,z));return m;}
const raw = structuredClone(CITY_RAW);
raw.city.districts[0].polygon = POLY;
const f = frameAt(-80,-80,18);
const e = expandCity(raw, {});
const roots = e.buildings.filter(b => /^a_\d\d\d$/.test(b.id));
for (const b of roots) {
  const cx=(Math.min(...b.footprint.map(p=>p.x))+Math.max(...b.footprint.map(p=>p.x)))/2;
  const cz=(Math.min(...b.footprint.map(p=>p.z))+Math.max(...b.footprint.map(p=>p.z)))/2;
  const l=unrotatePoint(f,cx,cz);
  console.log(b.id, 'in', pointInPoly(POLY,l.x,l.z), 'dist', polyDist(POLY,l.x,l.z).toFixed(2));
}
for (const r of e.roads.filter(r=>r.id.startsWith('a_'))) {
  const p = r.elements[0].plate;
  const hW=p.width/2, k=p.yaw*DEG, dx=Math.cos(k)*p.length/2, dz=Math.sin(k)*p.length/2;
  const ux=-Math.sin(k)*hW, uz=Math.cos(k)*hW;
  const corners=[[p.x+dx+ux,p.z+dz+uz],[p.x+dx-ux,p.z+dz-uz],[p.x-dx+ux,p.z-dz+uz],[p.x-dx-ux,p.z-dz-uz]];
  const out = corners.map(([x,z])=>{const l=unrotatePoint(f,x,z);return pointInPoly(POLY,l.x,l.z)?null:+polyDist(POLY,l.x,l.z).toFixed(2)}).filter(v=>v!==null);
  console.log(r.id, 'yaw',p.yaw,'len',p.length, out.length?('ВНЕ на '+out.join(',')):'внутри');
}
