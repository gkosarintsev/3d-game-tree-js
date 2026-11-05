import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { reliefOf } from '../src/relief.js';
import { CONFIG } from '../src/config.js';
import { CITY_RAW } from './city-fixture.mjs';
const J = CONFIG.jsonMap;
const mk = () => { const raw = structuredClone(CITY_RAW); raw.kind = 'json2';
  raw.relief = { baseY: 0, hills: [ { id: 'hrub', x: -80, z: -80, radius: 400, height: 3 }, { id: 'lon', x: 90, z: 90, radius: 400, height: -2 }] };
  raw.city.districts[0].yaw = 18;
  raw.city.districts[0].polygon = [ { x: -126, z: -78 }, { x: -82, z: -129 }, { x: -31, z: -123 }, { x: -37, z: -51 }, { x: -78, z: -34 }];
  return raw; };
const exp = expandCity(mk());
const level = normalizeLevel(expandCity(mk()));
const F = reliefOf(level.map.relief);
const rows = [];
for (const r of level.map.roads) {
  for (const d of r.decks.filter(x => x.length !== undefined)) {
    const rad = (d.yaw ?? 0) * Math.PI / 180, c = Math.cos(rad), s = Math.sin(rad), half = d.length / 2;
    const a = { x: d.cx - c * half, z: d.cz - s * half }, b = { x: d.cx + c * half, z: d.cz + s * half };
    const k = Math.max(2, Math.round(d.length / J.navStep));
    let dev = 0, bur = 0, at = null;
    for (let i = 0; i <= k; i++) { const t = i / k;
      const x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t;
      const dsv = F.heightAt(x, z) + J.streetRise - (d.topAtMin + (d.topAtMax - d.topAtMin) * t);
      if (Math.abs(dsv) > dev) { dev = Math.abs(dsv); at = t; }
      if (F.heightAt(x, z) - (d.topAtMin + (d.topAtMax - d.topAtMin) * t) > bur)
        bur = F.heightAt(x, z) - (d.topAtMin + (d.topAtMax - d.topAtMin) * t); }
    rows.push({ id: r.id, len: d.length, dev: +dev.toFixed(3), at, bur: +bur.toFixed(3), y: d.topAtMin, y1: d.topAtMax });
  }
}
rows.sort((x, y) => y.dev - x.dev);
console.log(rows.slice(0, 8).map(r => JSON.stringify(r)).join('\n'));
