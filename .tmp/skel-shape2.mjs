// Разведка данных для tools/skeleton.mjs — временный файл, в репозиторий не едет.
import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { SurfaceField } from '../src/surfaces.js';

const raw = JSON.parse(readFileSync('probe/open-2km.json', 'utf8'));
const map = normalizeLevel(expandCity(structuredClone(raw))).map;
const f = new SurfaceField(map);
f.collectData();

const types = {};
let decks = 0, arcs = 0, plateYaw = 0, plateAxis = 0;
for (const r of map.roads) {
  types[r.type] = (types[r.type] ?? 0) + 1;
  for (const d of r.decks ?? []) {
    decks++;
    if (d.arc) arcs++;
    else if (d.yaw) plateYaw++;
    else plateAxis++;
  }
}
const step = 24;
let chainNodes = 0;
const perType = {};
for (const r of map.roads) {
  let c = 0;
  for (const d of r.decks ?? []) c += (f.deckChain(d, step).length);
  perType[r.type] = (perType[r.type] ?? 0) + c;
  chainNodes += c;
}
let desc = 0, descNodes = 0;
for (const d of f.descents) { const ch = f.descentChain(d, step); if (ch) { desc++; descNodes += ch.length; } }

const doors = { total: 0, outdoor: 0, ground: 0, groundOutdoor: 0, linkTypes: {} };
for (const b of map.buildings) {
  for (const d of b.doors ?? []) {
    doors.total++;
    doors.linkTypes[d.linkType] = (doors.linkTypes[d.linkType] ?? 0) + 1;
    const out = !f._inPlan(b, d.outside);
    if (out) doors.outdoor++;
    if (Math.abs(d.y - b.baseY) < 0.02) doors.ground++;
    if (out && Math.abs(d.y - b.baseY) < 0.02) doors.groundOutdoor++;
  }
}
const sky = map.roads.filter(r => r.type === 'skybridge');
console.log(JSON.stringify({
  plate: map.ground.size, roads: map.roads.length, types, decks, arcs, plateYaw, plateAxis,
  chainNodes, perType, descents: desc, descentNodes: descNodes,
  channels: map.channels?.length, beds: f.waterways?.length,
  buildings: map.buildings.length, doors,
  skybridgeDecks: sky.map(r => (r.decks ?? []).length),
}, null, 1));
