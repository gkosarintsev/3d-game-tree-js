import test from 'node:test';
import assert from 'node:assert/strict';
import { runCitygen } from './citygen/index.mjs';

function v4Base(over = {}) {
  return {
    $schema: './level-v4.schema.json',
    kind: 'cityforge',
    schemaVersion: 4,
    metadata: { levelName: 't', name: 't', hint: 't', units: 'meters' },
    ground: { y: 0, size: 256 },
    gameplay: { goal: 'exit', spawn: { x: 0, z: 0 }, exit: { x: 10, z: 10 } },
    stream: { chunk: 256, keep: 1, aheadMin: 50, aheadMax: 100, budgetMs: 20 },
    cityforge: {
      format: 'cityforge', version: '0.1',
      world: { units: 'meters', coordinateSystem: { type: 'local', handedness: 'right', up: 'Z' }, bounds: { min: [-128,-128,0], max: [128,128,50] } },
      terrain: { base: { type: 'heightfield', source: 'procedural', resolution: 4 }, modifiers: [] },
      hydrology: { rivers: [], lakes: [] },
      networks: { roads: { nodes: [], segments: [], junctions: [] }, railways: { nodes: [], segments: [], junctions: [] }, paths: { nodes: [], segments: [], junctions: [] } },
      structures: { bridges: [], tunnels: [] },
    },
    generator: { generatorVersion: '0.1.0', seed: 42, deterministic: true, stages: [], layers: [], budgets: {}, districts: [], profiles: {}, catalogs: {}, refs: {}, policies: {} },
    ...over,
  };
}

test('citygen v4: deterministic report for same input', () => {
  const a = runCitygen(v4Base());
  const b = runCitygen(v4Base());
  assert.equal(a.reportJson, b.reportJson);
  assert.equal(a.report.summary.errors, 0);
  assert.equal(a.report.stages.length, 7);
});

test('citygen stage 1: clamps terrain modifiers and records repair', () => {
  const raw = v4Base();
  raw.cityforge.terrain.modifiers = [
    { id: 'm1', type: 'mountain', center: [999, -999], radius: 9999, height: 999 },
  ];
  const out = runCitygen(raw);
  const mods = out.engine.cityforge.terrain.modifiers;
  assert.equal(mods.length, 1);
  assert.equal(mods[0].height, 300);
  assert.equal(mods[0].radius, 512);
  assert.equal(mods[0].center[0], 128);
  assert.equal(mods[0].center[1], -128);
  assert.ok(out.report.repairs.some(r => r.code === 'clamp_height'));
  assert.ok(out.report.repairs.some(r => r.code === 'clamp_radius'));
  assert.ok(out.report.repairs.some(r => r.code === 'clamp_center'));
});

test('citygen stage 1: drops invalid river and renames duplicate ids deterministically', () => {
  const raw = v4Base();
  raw.cityforge.hydrology.rivers = [
    { id: 'r', path: [[0,0,0]], width: 10, depth: 2 }, // too short
    { id: 'dup', path: [[0,0,0],[10,0,10]], width: 5, depth: 1 },
    { id: 'dup', path: [[20,0,0],[30,0,10]], width: 5, depth: 1 },
  ];
  const a = runCitygen(structuredClone(raw));
  const b = runCitygen(structuredClone(raw));
  assert.equal(a.reportJson, b.reportJson);
  const rivers = a.engine.cityforge.hydrology.rivers;
  assert.equal(rivers.length, 2);
  assert.deepEqual(rivers.map(r => r.id), ['dup', 'dup_2']);
  assert.ok(a.report.drops.some(d => d.reason === 'river_too_short'));
  assert.ok(a.report.repairs.some(r => r.code === 'duplicate_id_renamed'));
});

test('citygen stage 1: easement mask records river corridors', () => {
  const raw = v4Base();
  raw.cityforge.hydrology.rivers = [
    { id: 'river1', path: [[-10,0,0],[10,0,0]], width: 12, depth: 2 },
  ];
  const out = runCitygen(raw);
  assert.equal(out.ctx.masks.easement.rivers.length, 1);
  assert.equal(out.ctx.masks.easement.rivers[0].id, 'river1');
  assert.equal(out.ctx.masks.easement.rivers[0].width, 12);
});

test('citygen stage 1: procedural landscape generation is deterministic', () => {
  const base = () => {
    const raw = v4Base();
    raw.generator.seed = 123;
    raw.generator.landscape = {
      generate: true,
      hills: { count: 5, minHeight: 10, maxHeight: 30, minRadius: 60, maxRadius: 120 },
      river: { enabled: true, width: 20, depth: 3, points: 5, axis: 'z' },
    };
    return raw;
  };
  const a = runCitygen(base());
  const b = runCitygen(base());
  assert.equal(a.engine.cityforge.terrain.modifiers.length, 5);
  assert.equal(a.engine.cityforge.hydrology.rivers.length, 1);
  assert.deepEqual(a.engine.cityforge.terrain.modifiers, b.engine.cityforge.terrain.modifiers);
  assert.deepEqual(a.engine.cityforge.hydrology.rivers, b.engine.cityforge.hydrology.rivers);
  assert.equal(a.reportJson, b.reportJson);
  assert.ok(a.report.diagnostics.some(d => d.code === 'landscape_generated'));
});

test('citygen stage 1: clamps river path to bounds and drops self-intersecting river', () => {
  const raw = v4Base();
  raw.cityforge.hydrology.rivers = [
    { id: 'oob', path: [[-200,0,0],[200,0,0],[200,0,50]], width: 8, depth: 2 },
    { id: 'bow', path: [[0,0,0],[20,0,20],[20,0,0],[0,0,20]], width: 8, depth: 2 },
  ];
  const out = runCitygen(raw);
  const rivers = out.engine.cityforge.hydrology.rivers;
  assert.deepEqual(rivers.map(r => r.id), ['oob']);
  assert.equal(rivers[0].path[0][0], -128);
  assert.equal(rivers[0].path[1][0], 128);
  assert.ok(out.report.repairs.some(r => r.code === 'clamp_river_path_bounds' && r.id === 'oob'));
  assert.ok(out.report.drops.some(d => d.id === 'bow' && d.reason === 'river_self_intersection'));
});

test('citygen stage 1: warns on river-anchor conflict', () => {
  const raw = v4Base(); // spawn 0,0 exit 10,10
  raw.cityforge.hydrology.rivers = [
    { id: 'r', path: [[-20,0,-5],[20,0,5]], width: 10, depth: 2 },
  ];
  const out = runCitygen(raw);
  assert.equal(out.engine.cityforge.hydrology.rivers.length, 1);
  assert.ok(out.report.diagnostics.some(d => d.code === 'river_anchor_conflict' && d.severity === 'warn'));
});
