import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { decodeChunk, decodeSkeleton } from '../../src/level-bin.js';
import {
  levelFileName,
  parseLevelNumbers,
  collectCompiled,
  buildSourceIndex,
  applyProvenance,
  classifyEntity,
  normalizeDistrictGeometry,
  buildModel,
  planLabels,
} from './model.js';
import { nice125 } from './grid.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

function loadLevelData(n) {
  const nn = String(n).padStart(2, '0');
  const dir = path.join(ROOT, 'src', 'levels', `level-${nn}`);
  const source = readJson(path.join(ROOT, 'src', 'levels', `level-${nn}.json`));
  const indexModPath = path.join(dir, 'index.js');
  const idxText = fs.readFileSync(indexModPath, 'utf8');
  // minimal parse of catalog from index.js text (cells/rect/file/objects) is hard; easier: use source-of-truth by importing? can't easily in node due to top-level await/fetch in browser path sometimes,
  // but index.js supports node path. We'll dynamic import.
  return { nn, dir, source, idxText };
}

async function importCatalog(n) {
  const nn = String(n).padStart(2, '0');
  const mod = await import(`../../src/levels/level-${nn}/index.js`);
  return mod[`LEVEL_${nn}`];
}

function decodeCellsFromCatalog(levelDef, dir) {
  return (levelDef.map.cells || []).map(cell => {
    const file = cell.file;
    const buf = fs.readFileSync(path.join(dir, file));
    return { id: cell.id, file, rect: cell.rect, objects: cell.objects, decoded: decodeChunk(buf) };
  });
}

test('levelFile zero-pad', () => {
  assert.equal(levelFileName(7), 'level-07');
  assert.equal(levelFileName(9), 'level-09');
  assert.equal(levelFileName(10), 'level-10');
  assert.equal(levelFileName(15), 'level-15');
  assert.equal(levelFileName(19), 'level-19');
});

test('parseLevelNumbers from real index.js', () => {
  const text = fs.readFileSync(path.join(ROOT, 'src', 'levels', 'index.js'), 'utf8');
  assert.deepEqual(parseLevelNumbers(text), [7, 8, 9, 10, 15, 16, 17, 18, 19]);
});

test('nice125', () => {
  assert.equal(nice125(7), 10);
  assert.equal(nice125(23), 25);
  assert.equal(nice125(61), 100);
  assert.equal(nice125(0.3), 0.5);
});

test('districtGeometry rect/missing', () => {
  const rect = normalizeDistrictGeometry({ geometry: { rect: { minX: -1, maxX: 2, minZ: -3, maxZ: 4 } } });
  assert.equal(rect.type, 'rect');
  assert.equal(rect.inferred, false);
  assert.equal(rect.points.length, 4);
  const missing = normalizeDistrictGeometry({ id: 'd' });
  assert.equal(missing.type, 'none');
  assert.equal(missing.reason, 'geometry-not-persisted');
});

test('labelPlan priority/budget/selected/safe-area', () => {
  const candidates = [
    { id: 'a', text: 'A', priority: 10, areaPx: 100, screenX: 100, screenY: 100 },
    { id: 'b', text: 'B', priority: 90, areaPx: 100, screenX: 110, screenY: 100 },
    { id: 'c', text: 'C', priority: 50, areaPx: 100, screenX: 300, screenY: 100 },
    { id: 'sel', text: 'SEL', priority: 1, areaPx: 1, screenX: 5, screenY: 5, selected: true },
  ];
  const placed = planLabels(candidates, { budget: 2, widthOf: t => t.length * 8, safeArea: { minX: 0, minY: 0, maxX: 1000, maxY: 1000 } });
  assert.ok(placed.some(p => p.id === 'b'));
  assert.ok(placed.some(p => p.id === 'sel')); // selected override budget/position clamp
  // overlap: b and a close, only higher priority should survive
  const ids = new Set(placed.filter(p => p.id !== 'sel').map(p => p.id));
  assert.ok(ids.has('b'));
  assert.ok(!ids.has('a'));
});

test('provenance classification cases', () => {
  const src = {
    cityforge: { networks: { roads: { segments: [{ id: 'eb_1' }, { id: 'eb_5' }], nodes: [] } } },
    buildings: [{ id: 'house1' }],
    props: [], lights: [], gameplay: { spawn: { x: 0, z: 0 }, exit: { x: 1, z: 1 } },
    generator: { districts: [{ id: 'd0', geometry: { rect: { minX: 0, maxX: 1, minZ: 0, maxZ: 1 } } }] },
  };
  const idx = buildSourceIndex(src);
  const roadIds = new Set(['eb_1', 'eb_5_a', 'eb_5_b_a', 'spawn_pad', 'tr_gb_1', 'tunnel_tunnel_mountain_p0']);
  assert.equal(classifyEntity('eb_1', 'road', idx, null, roadIds).origin, 'authored');
  const split = classifyEntity('eb_5_a', 'road', idx, null, roadIds);
  assert.equal(split.origin, 'authored');
  assert.equal(split.parentId, 'eb_5');
  const split2 = classifyEntity('lt1_s2_b_b', 'road', idx, null, roadIds);
  // base lt1_s2 not in idx so unknown in this synthetic case? check with custom
  const idx2 = buildSourceIndex({ cityforge: { networks: { roads: { segments: [{ id: 'lt1_s2' }], nodes: [] } } } });
  const split2b = classifyEntity('lt1_s2_b_b', 'road', idx2, null, new Set(['lt1_s2_b_b']));
  assert.equal(split2b.origin, 'authored');
  assert.equal(split2b.parentId, 'lt1_s2');
  assert.equal(classifyEntity('spawn_pad', 'road', idx, null, roadIds).origin, 'derived');
  assert.equal(classifyEntity('tr_gb_1', 'road', idx, null, roadIds).origin, 'generated');
  assert.equal(classifyEntity('b_d0_12', 'building', idx, null, roadIds).origin, 'generated');
  assert.equal(classifyEntity('prop_111', 'prop', idx, null, roadIds).origin, 'generated');
  assert.equal(classifyEntity('pillar_eb_1_-10_20', 'prop', idx, null, roadIds).origin, 'derived');
  assert.equal(classifyEntity('tunnel_tunnel_mountain_p0', 'road', idx, null, roadIds).origin, 'derived');
  assert.equal(classifyEntity('unknown_42', 'road', idx, null, roadIds).origin, 'unknown');
});

test('integration: level 19 counts/dedupe/split matching', async () => {
  const n = 19;
  const nn = '19';
  const dir = path.join(ROOT, 'src', 'levels', `level-${nn}`);
  const source = readJson(path.join(ROOT, 'src', 'levels', `level-${nn}.json`));
  const report = readJson(path.join(dir, 'generation-report.json'));
  const levelDef = await importCatalog(n);
  const decodedCells = decodeCellsFromCatalog(levelDef, dir);
  const model = buildModel({ level: n, mode: 'compiled', source, compiledIndex: levelDef.map, decodedCells, report });

  assert.equal(model.entities.buildings.size, 28);
  assert.equal(model.entities.roads.size, 122);
  assert.equal(model.entities.props.size, 2626);
  assert.equal(model.stats.duplicates, 54);
  assert.equal(model.skeleton.nodes.length, 1936);
  assert.equal(model.skeleton.edges.length, 1832);

  // instances
  assert.equal(model.stats.instances.buildings, 35);
  assert.equal(model.stats.instances.roads, 169);
  assert.equal(model.stats.instances.props, 2626);

  // split matching
  const srcRoads = new Set((source.cityforge.networks.roads.segments || []).map(s => s.id));
  const compiledRoads = [...model.entities.roads.keys()];
  const strip = id => { let x = id; while (/_[ab]$/.test(x)) x = x.slice(0, -2); return x; };
  const exact = compiledRoads.filter(id => srcRoads.has(id));
  const pads = compiledRoads.filter(id => /^spawn_pad$|^exit_pad$/.test(id));
  const splits = compiledRoads.filter(id => !srcRoads.has(id) && !pads.includes(id) && srcRoads.has(strip(id)));
  const unknown = compiledRoads.filter(id => !srcRoads.has(id) && !pads.includes(id) && !srcRoads.has(strip(id)));
  assert.equal(exact.length, 58);
  assert.equal(splits.length, 62);
  assert.equal(pads.length, 2);
  assert.equal(unknown.length, 0);
  const represented = new Set([...exact, ...splits.map(strip)]);
  const missing = [...srcRoads].filter(id => !represented.has(id));
  assert.equal(missing.length, 0);

  // provenance
  const roadOrigins = {};
  for (const r of model.entities.roads.values()) roadOrigins[r.origin] = (roadOrigins[r.origin] || 0) + 1;
  assert.equal(roadOrigins.authored, 120); // 58 exact + 62 split
  assert.equal(roadOrigins.derived, 2);
  for (const b of model.entities.buildings.values()) assert.equal(b.origin, 'generated');
  for (const p of model.entities.props.values()) assert.equal(p.origin, 'derived');
});

test('integration: level 18 counts/matching', async () => {
  const n = 18, nn = '18';
  const dir = path.join(ROOT, 'src', 'levels', `level-${nn}`);
  const source = readJson(path.join(ROOT, 'src', 'levels', `level-${nn}.json`));
  const report = readJson(path.join(dir, 'generation-report.json'));
  const levelDef = await importCatalog(n);
  const decodedCells = decodeCellsFromCatalog(levelDef, dir);
  const model = buildModel({ level: n, mode: 'compiled', source, compiledIndex: levelDef.map, decodedCells, report });
  assert.equal(model.entities.buildings.size, 15);
  assert.equal(model.entities.roads.size, 12);
  assert.equal(model.entities.props.size, 152);
  assert.equal(model.skeleton.nodes.length, 498);
  assert.equal(model.skeleton.edges.length, 497);
  const srcRoads = new Set((source.cityforge.networks.roads.segments || []).map(s => s.id));
  const compiledRoads = [...model.entities.roads.keys()];
  assert.equal(compiledRoads.filter(id => srcRoads.has(id)).length, 10);
  assert.equal(compiledRoads.filter(id => /^spawn_pad$|^exit_pad$/.test(id)).length, 2);
});

test('integration: level 16 counts and auto-districts', async () => {
  const n = 16, nn = '16';
  const dir = path.join(ROOT, 'src', 'levels', `level-${nn}`);
  const source = readJson(path.join(ROOT, 'src', 'levels', `level-${nn}.json`));
  const report = readJson(path.join(dir, 'generation-report.json'));
  const levelDef = await importCatalog(n);
  const decodedCells = decodeCellsFromCatalog(levelDef, dir);
  const model = buildModel({ level: n, mode: 'compiled', source, compiledIndex: levelDef.map, decodedCells, report });
  assert.equal(model.entities.buildings.size, 392);
  assert.equal(model.entities.roads.size, 174);
  assert.equal(model.entities.props.size, 562);
  assert.equal((model.entities.lights || new Map()).size, 8);
  assert.equal((model.entities.channels || new Map()).size, 1);
  assert.equal(model.skeleton.nodes.length, 4388);
  assert.equal(model.skeleton.edges.length, 4384);
  assert.equal(model.entities.districts.size, 16);
  for (const d of model.entities.districts.values()) assert.equal(d.origin, 'generated');
});

test('integration: level 07 v3 authored', async () => {
  const n = 7, nn = '07';
  const dir = path.join(ROOT, 'src', 'levels', `level-${nn}`);
  const source = readJson(path.join(ROOT, 'src', 'levels', `level-${nn}.json`));
  const levelDef = await importCatalog(n);
  const decodedCells = decodeCellsFromCatalog(levelDef, dir);
  const model = buildModel({ level: n, mode: 'compiled', source, compiledIndex: levelDef.map, decodedCells, report: null });
  assert.equal(model.entities.buildings.size, 1);
  assert.equal(model.entities.roads.size, 10);
  assert.equal(model.entities.props.size, 146);
  assert.equal((model.entities.tunnels || new Map()).size, 1);
  assert.equal(model.skeleton.nodes.length, 360);
  assert.equal(model.skeleton.edges.length, 358);
  for (const b of model.entities.buildings.values()) assert.equal(b.origin, 'authored');
  // roads: 6 exact + 2 pad + 2 tunnel derived
  let derived = 0, authored = 0;
  for (const r of model.entities.roads.values()) { if (r.origin === 'derived') derived++; if (r.origin === 'authored') authored++; }
  assert.equal(derived, 4);
  assert.equal(authored, 6);
});

test('integration: level 09 big', async () => {
  const n = 9, nn = '09';
  const dir = path.join(ROOT, 'src', 'levels', `level-${nn}`);
  const source = readJson(path.join(ROOT, 'src', 'levels', `level-${nn}.json`));
  const levelDef = await importCatalog(n);
  const decodedCells = decodeCellsFromCatalog(levelDef, dir);
  const model = buildModel({ level: n, mode: 'compiled', source, compiledIndex: levelDef.map, decodedCells, report: null });
  assert.equal(model.entities.buildings.size, 892);
  assert.equal(model.entities.roads.size, 10);
  assert.equal(model.skeleton.nodes.length, 2211);
  assert.equal(model.skeleton.edges.length, 2210);
});
