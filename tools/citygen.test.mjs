import test from 'node:test';
import assert from 'node:assert/strict';
import { runCitygen } from './citygen/index.mjs';
import { generateOutput } from './build-level.mjs';

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

test('citygen stage 2: drops degenerate segment and warns on steep slope', () => {
  const raw = v4Base();
  raw.cityforge.networks.roads = {
    nodes: [
      { id: 'a', position: [0,0,0], layer: 'ground' },
      { id: 'b', position: [100,0,0], layer: 'ground' },
    ],
    segments: [
      { id: 'bad', from: 'a', to: 'b', type: 'local', layer: 'ground', path: [[0,0,0]] },
      { id: 'steep', from: 'a', to: 'b', type: 'local', layer: 'ground', path: [[0,0,0],[10,20,0]], lanes: [{ id: 'l1', direction: 'forward', width: 8, type: 'vehicle' }] },
    ],
    junctions: [],
  };
  const out = runCitygen(raw);
  const segs = out.engine.cityforge.networks.roads.segments;
  assert.deepEqual(segs.map(s => s.id), ['steep']);
  assert.ok(out.report.drops.some(d => d.id === 'bad' && d.reason === 'segment_degenerate'));
  assert.ok(out.report.diagnostics.some(d => d.code === 'segment_steep' && d.stage === '2_transport'));
});

test('citygen stage 2: reports disconnected road graph and anchor distance warning', () => {
  const raw = v4Base();
  raw.gameplay.spawn = { x: -100, z: -100 };
  raw.gameplay.exit = { x: 100, z: 100 };
  raw.cityforge.networks.roads = {
    nodes: [
      { id: 'n1', position: [0,0,0], layer: 'ground' },
      { id: 'n2', position: [10,0,0], layer: 'ground' },
      { id: 'n3', position: [0,0,50], layer: 'ground' },
      { id: 'n4', position: [10,0,50], layer: 'ground' },
    ],
    segments: [
      { id: 's1', from: 'n1', to: 'n2', type: 'local', layer: 'ground', path: [[0,0,0],[10,0,0]], lanes: [{ id: 'l1', direction: 'forward', width: 8, type: 'vehicle' }] },
      { id: 's2', from: 'n3', to: 'n4', type: 'local', layer: 'ground', path: [[0,0,50],[10,0,50]], lanes: [{ id: 'l1', direction: 'forward', width: 8, type: 'vehicle' }] },
    ],
    junctions: [],
  };
  const a = runCitygen(structuredClone(raw));
  const b = runCitygen(structuredClone(raw));
  assert.equal(a.reportJson, b.reportJson);
  assert.ok(a.report.diagnostics.some(d => d.code === 'road_graph_disconnected'));
  assert.ok(a.report.diagnostics.some(d => d.code === 'anchor_far_from_roads'));
  assert.equal(a.ctx.masks.easement.roads.length, 2);
});

test('citygen stage 2: procedural transport generation is deterministic and connects spawn↔exit', () => {
  const base = () => {
    const raw = v4Base();
    raw.gameplay.spawn = { x: -100, z: -80 };
    raw.gameplay.exit = { x: 100, z: 90 };
    raw.generator.seed = 77;
    raw.generator.transport = { generate: true, width: 8 };
    return raw;
  };
  const a = runCitygen(base());
  const b = runCitygen(base());
  assert.equal(a.reportJson, b.reportJson);
  const segs = a.engine.cityforge.networks.roads.segments;
  const nodes = a.engine.cityforge.networks.roads.nodes;
  assert.equal(segs.length, 1);
  assert.equal(nodes.length, 2);
  assert.equal(segs[0].from, 'tr_n_spawn');
  assert.equal(segs[0].to, 'tr_n_exit');
  assert.ok(segs[0].path.length >= 2);
  assert.deepEqual(segs, b.engine.cityforge.networks.roads.segments);
  assert.ok(a.report.diagnostics.some(d => d.code === 'transport_generated'));
  assert.ok(!a.report.diagnostics.some(d => d.code === 'anchor_far_from_roads'));
  assert.ok(!a.report.diagnostics.some(d => d.code === 'road_graph_disconnected'));
});

test('citygen v4 end-to-end: generated landscape+transport compiles to open catalog', () => {
  const raw = {
    $schema: './level-v4.schema.json', kind: 'cityforge', schemaVersion: 4,
    metadata: { levelName: 'v4-gen', name: 'V4 gen test', hint: 'reach B', units: 'meters' },
    ground: { y: 0, size: 256, color: 0x6f8f4e },
    gameplay: { goal: 'exit', spawn: { x: -100, z: -100 }, exit: { x: 100, z: 100 }, exitRadius: 4, enemies: { count: 0 }, alienEnemies: { count: 0 } },
    stream: { chunk: 256, keep: 1, aheadMin: 80, aheadMax: 200, budgetMs: 40 },
    cityforge: {
      format: 'cityforge', version: '0.1',
      world: { units: 'meters', coordinateSystem: { type: 'local', handedness: 'right', up: 'Z' }, origin:[0,0,0], bounds: { min: [-128,-128,-50], max: [128,128,100] } },
      assets: [{ id: 'ground.placeholder', kind: 'procedural', generator: 'placeholder.flat', bounds: [256,256,1] }],
      hydrology: { rivers: [], lakes: [] },
      networks: { roads: { nodes: [], segments: [], junctions: [] }, railways: { nodes: [], segments: [], junctions: [] }, paths: { nodes: [], segments: [], junctions: [] } },
      structures: { bridges: [], tunnels: [] },
      instances: [], chunks: []
    },
    generator: {
      generatorVersion: '0.1.0', seed: 16, deterministic: true, stages: [], layers: [], budgets: {}, districts: [], profiles: {}, catalogs: {}, refs: {}, policies: {},
      landscape: { generate: true, hills: { count: 3, minHeight: 8, maxHeight: 20, minRadius: 50, maxRadius: 90 }, river: { enabled: true, width: 16, depth: 3, points: 5, axis: 'z' } },
      transport: { generate: true, width: 8 }
    }
  };
  const out = generateOutput(structuredClone(raw), 'src/levels/v4-gen.json');
  assert.equal(out.kind, 'catalog');
  assert.equal(out.sourceFormat, 'cityforge-v4');
  assert.ok(out.generationReport && out.generationReport.includes('"generatorVersion"'));
  assert.ok(Array.isArray(out.files) && out.files.length >= 2);
  const out2 = generateOutput(structuredClone(raw), 'src/levels/v4-gen.json');
  assert.equal(out.generationReport, out2.generationReport);
  assert.deepEqual(out.files.map(f => f.path), out2.files.map(f => f.path));
});
