import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runCitygen } from './citygen/index.mjs';
import { compileCityforge } from './cityforge-compile.mjs';
import { createReport, finalizeReport, reportToJson } from './citygen/diagnostics.mjs';
import { makeRng, mix, hashString } from './citygen/rng.mjs';
import { stableId, stageSubseed, byId } from './citygen/ids.mjs';
import { createSpatialIndex } from './citygen/spatial.mjs';
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

test('citygen stage 1: warns on steep river profile and bed above terrain without carving', () => {
  const raw = v4Base();
  raw.cityforge.hydrology.rivers = [
    { id: 'steep', path: [[-20,0,0],[0,20,0],[20,0,0]], width: 8, depth: 2, carveTerrain: true },
    { id: 'floating', path: [[-30,5,-30],[-10,5,-30]], width: 8, depth: 1, carveTerrain: false },
  ];
  const out = runCitygen(raw);
  assert.ok(out.report.diagnostics.some(d => d.code === 'river_steep_profile' && d.severity === 'warn' && d.id === 'steep'));
  assert.ok(out.report.diagnostics.some(d => d.code === 'river_bed_above_terrain' && d.severity === 'warn' && d.id === 'floating'));
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
  // Original 2 segments + repair connectors (spawn-exit + remaining components) now added with easements.
  assert.equal(a.ctx.masks.easement.roads.length, 5);
});

test('citygen stage 2: procedural transport generation is deterministic (emission deferred pending engine-valid geometry)', () => {
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
  const st2 = a.report.stages.find(s => s.id === '2_transport');
  assert.equal(st2?.status, 'ok');
  assert.ok(!a.report.diagnostics.some(d => d.code === 'stage_error' && d.stage === '2_transport'));
  assert.ok(a.report.diagnostics.some(d => d.code === 'transport_generated' && d.stage === '2_transport'));
  // Emission is gated: valid axis/slope-safe networks are emitted, otherwise deferred.
  const segs = a.engine.cityforge.networks.roads.segments;
  const deferred = a.report.diagnostics.some(d => d.code === 'transport_emit_deferred' && d.stage === '2_transport');
  if (deferred) {
    assert.deepEqual(segs, []);
  } else {
    assert.ok(segs.length >= 1);
    assert.ok(segs.every(s => Array.isArray(s.path) && s.path.length >= 2));
    assert.ok(segs.every(s => {
      for (let i = 0; i + 1 < s.path.length; i++) {
        const p = s.path[i], q = s.path[i + 1];
        if (Math.abs(p[0] - q[0]) > 0.01 && Math.abs(p[2] - q[2]) > 0.01) return false;
        const run = Math.hypot(q[0]-p[0], q[2]-p[2]);
        if (run > 1e-9 && Math.abs(q[1]-p[1]) / run > 0.3005) return false;
      }
      return true;
    }));
  }
});

test('citygen stage 3: auto-generates deterministic districts and parcels with diverse types', () => {
  const base = () => {
    const raw = v4Base();
    raw.ground.size = 1280;
    raw.gameplay.spawn = { x: -260, z: 160 };
    raw.gameplay.exit = { x: 560, z: 560 };
    raw.generator.seed = 15;
    return raw;
  };
  const a = runCitygen(base());
  const b = runCitygen(base());
  assert.equal(a.reportJson, b.reportJson);
  assert.ok(a.ctx.districts.length >= 9); // 4x4 grid for >=1024
  assert.ok(a.ctx.parcels.length > a.ctx.districts.length);
  const types = new Set(a.ctx.districts.map(d => d.type));
  assert.ok(types.size >= 4, 'expected several district types');
  assert.ok(a.report.diagnostics.some(d => d.code === 'districts_generated'));
  assert.ok(a.report.diagnostics.some(d => d.code === 'parcels_generated'));
  const districtStage = a.report.stages.find(s => s.id === '3_districts_parcels');
  assert.ok(districtStage && districtStage.status === 'ok');
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
  const report = JSON.parse(out.generationReport);
  // Crossing conflicts in generated transport should be detected and handled safely (repaired or degraded).
  assert.ok(report.diagnostics.some(d => d.code === 'road_same_level_conflict' && d.stage === '6_finalize_emit'));
  assert.ok(
    report.diagnostics.some(d => (d.code === 'road_crossing_repaired' || d.code === 'road_crossing_repair_skipped') && d.stage === '6_finalize_emit'),
    'expected safe crossing repair or skip diagnostics in generated e2e case'
  );
  assert.ok(
    report.diagnostics.some(d => (d.code === 'road_conflicts_resolved' || d.code === 'road_conflicts_unresolved') && d.stage === '6_finalize_emit'),
    'expected post-repair crossing conflict summary diagnostic'
  );
});

test('citygen stage 5: generates capped street lights and deterministic district props with provided roads', () => {
  const base = () => {
    const raw = v4Base();
    raw.ground.size = 512;
    raw.gameplay.spawn = { x: -200, z: -200 };
    raw.gameplay.exit = { x: 200, z: 200 };
    raw.stream = { chunk: 256, keep: 1, aheadMin: 80, aheadMax: 200, budgetMs: 40 };
    raw.generator.seed = 33;
    raw.cityforge.networks.roads = {
      nodes: [
        { id: 'n1', position: [-200, 0, -200], layer: 'ground' },
        { id: 'n2', position: [200, 0, -200], layer: 'ground' },
        { id: 'n3', position: [200, 0, 200], layer: 'ground' },
      ],
      segments: [
        { id: 'r1', from: 'n1', to: 'n2', type: 'local', layer: 'ground', path: [[-200, 0, -200], [200, 0, -200]], lanes: [{ id: 'l1', direction: 'forward', width: 8, type: 'vehicle' }] },
        { id: 'r2', from: 'n2', to: 'n3', type: 'local', layer: 'ground', path: [[200, 0, -200], [200, 0, 200]], lanes: [{ id: 'l1', direction: 'forward', width: 8, type: 'vehicle' }] },
      ],
      junctions: [],
    };
    return raw;
  };
  const a = runCitygen(base());
  const b = runCitygen(base());
  assert.equal(a.reportJson, b.reportJson);
  const lights = a.ctx.infrastructure?.lights ?? [];
  const props = a.ctx.infrastructure?.props ?? [];
  assert.ok(lights.length >= 1 && lights.length <= 8, `expected 1..8 lights, got ${lights.length}`);
  assert.ok(lights.every(l => l.type === 'point' && l.position && Number.isFinite(l.position.x)));
  assert.ok(props.length > 0, 'expected district props to be generated');
  assert.ok(props.every(p => p.id && p.model && p.position && p.rotation));
  assert.ok(a.report.diagnostics.some(d => d.code === 'street_lights_generated' && d.stage === '5_infrastructure_props'));
  const propsDiag = a.report.diagnostics.find(d => d.code === 'props_generated' && d.stage === '5_infrastructure_props');
  assert.ok(propsDiag, 'props_generated diagnostic missing');
  assert.ok(propsDiag.byDistrictType && typeof propsDiag.byDistrictType === 'object', 'props_generated.byDistrictType missing');
  assert.ok(Object.keys(propsDiag.byDistrictType).length >= 1, 'props_generated.byDistrictType should have at least one district type');
  const byTypeSum = Object.values(propsDiag.byDistrictType).reduce((s, n) => s + n, 0);
  assert.ok(byTypeSum <= props.length, `byDistrictType sum ${byTypeSum} should not exceed props count ${props.length}`);
  const st5 = a.report.stages.find(s => s.id === '5_infrastructure_props');
  assert.equal(st5?.status, 'ok');
});

test('citygen stage 3: guarantees core MVP district types on 1280m pilot grid', () => {
  const raw = v4Base();
  raw.ground.size = 1280;
  raw.gameplay.spawn = { x: -520, z: -520 };
  raw.gameplay.exit = { x: 520, z: 520 };
  raw.stream = { chunk: 256, keep: 2, aheadMin: 200, aheadMax: 1200, budgetMs: 80 };
  raw.generator.seed = 15;
  const out = runCitygen(raw);
  const types = new Set(out.ctx.districts.map(d => d.type));
  for (const t of ['office', 'residential', 'park', 'industrial', 'slums', 'forest']) {
    assert.ok(types.has(t), `missing core district type: ${t}`);
  }
  assert.ok(types.size >= 6);
});

test('citygen stage 2: errors when road crosses river without bridge', () => {
  const raw = v4Base();
  raw.gameplay.spawn = { x: -50, z: 0 };
  raw.gameplay.exit = { x: 50, z: 0 };
  raw.cityforge.hydrology.rivers = [
    { id: 'r', path: [[0, 0, -40], [0, 0, 40]], width: 12, depth: 3 },
  ];
  raw.cityforge.networks.roads = {
    nodes: [
      { id: 'a', position: [-40, 0, 0], layer: 'ground' },
      { id: 'b', position: [40, 0, 0], layer: 'ground' },
    ],
    segments: [
      { id: 'bad_cross', from: 'a', to: 'b', type: 'local', layer: 'ground', path: [[-40, 0, 0], [40, 0, 0]], lanes: [{ id: 'l1', direction: 'forward', width: 8, type: 'vehicle' }] },
    ],
    junctions: [],
  };
  const out = runCitygen(raw);
  assert.ok(out.report.diagnostics.some(d => d.code === 'road_crosses_river_without_bridge' && d.stage === '2_transport' && d.severity === 'error'));
});

test('citygen v4 build: fails on road crossing river without bridge', () => {
  const raw = v4Base();
  raw.ground.size = 256;
  raw.gameplay.spawn = { x: -80, z: 0 };
  raw.gameplay.exit = { x: 80, z: 0 };
  raw.cityforge.terrain.modifiers = [
    { id: 'm1', type: 'mountain', center: [0, 80], radius: 40, height: 10, falloff: 'smooth', operation: 'add', sourceRef: 'terrain.base', parameters: {} },
  ];
  raw.cityforge.hydrology.rivers = [
    { id: 'r', path: [[0, 0, -40], [0, 0, 40]], width: 12, depth: 3 },
  ];
  raw.cityforge.networks.roads = {
    nodes: [
      { id: 'a', position: [-60, 0, 0], layer: 'ground' },
      { id: 'b', position: [60, 0, 0], layer: 'ground' },
    ],
    segments: [
      { id: 'bad_cross', from: 'a', to: 'b', type: 'local', layer: 'ground', path: [[-60, 0, 0], [60, 0, 0]], lanes: [{ id: 'l1', direction: 'forward', width: 8, type: 'vehicle' }] },
    ],
    junctions: [],
  };
  assert.throws(
    () => generateOutput(structuredClone(raw), 'src/levels/v4-bad-river.json'),
    (e) => String(e?.message ?? '').includes('road_crosses_river_without_bridge')
      || (e?.errors ?? []).some(x => String(x).includes('road_crosses_river_without_bridge'))
  );
});

test('cityforge v3 build: fails on road crossing river without bridge', () => {
  const raw = {
    $schema: './level-v3.schema.json',
    kind: 'cityforge',
    metadata: { levelName: 't', name: 't', hint: 't', units: 'meters' },
    ground: { y: 0, size: 256 },
    gameplay: { goal: 'exit', spawn: { x: -80, z: 0 }, exit: { x: 80, z: 0 }, exitRadius: 4 },
    stream: { chunk: 256, keep: 1, aheadMin: 50, aheadMax: 100, budgetMs: 20 },
    cityforge: {
      format: 'cityforge', version: '0.1',
      world: { units: 'meters', coordinateSystem: { type: 'local', handedness: 'right', up: 'Z' }, origin: [0,0,0], bounds: { min: [-128,-128,-50], max: [128,128,50] } },
      generation: { seed: 1, generatorVersion: '0.1', deterministic: true },
      assets: [{ id: 'ground.placeholder', kind: 'procedural', generator: 'placeholder.flat', bounds: [256,256,1] }],
      districts: [], blocks: [], parcels: [], instances: [],
      terrain: { base: { type: 'heightfield', source: 'procedural', resolution: 4 }, modifiers: [{ id: 'm1', type: 'mountain', center: [0,80], radius: 40, height: 10, falloff: 'smooth', operation: 'add', sourceRef: 'terrain.base', parameters: {} }] },
      hydrology: { rivers: [{ id: 'r', path: [[-40,0,0],[40,0,0]], width: 12, depth: 3, flow: 'start_to_end', carveTerrain: false }], lakes: [] },
      networks: {
        roads: {
          nodes: [{ id: 'a', position: [0,0,-60], layer: 'ground' }, { id: 'b', position: [0,0,60], layer: 'ground' }],
          segments: [{ id: 'bad', from: 'a', to: 'b', type: 'local', layer: 'ground', path: [[0,0,-60],[0,0,60]], lanes: [{ id: 'l', direction: 'forward', width: 8, type: 'vehicle' }], shoulderWidth: 1, sidewalk: false, surface: 'asphalt' }],
          junctions: [],
        },
        railways: { nodes: [], segments: [], junctions: [] },
        paths: { nodes: [], segments: [], junctions: [] },
      },
      structures: { bridges: [], tunnels: [] },
    },
  };
  assert.throws(
    () => generateOutput(structuredClone(raw), 'src/levels/v3-bad-river.json'),
    (e) => String(e?.message ?? '').includes('без моста') || (e?.errors ?? []).some(x => String(x).includes('без моста'))
  );
});

test('citygen report: deterministic structure with all stages and summary', () => {
  const raw = v4Base();
  const a = runCitygen(structuredClone(raw));
  const b = runCitygen(structuredClone(raw));
  assert.equal(a.reportJson, b.reportJson);
  const r = a.report;
  assert.equal(r.version, 1);
  assert.ok(r.generator && r.generator.seed === raw.generator.seed);
  assert.ok(Array.isArray(r.stages));
  assert.deepEqual(r.stages.map(s => s.id), ['0_input_space','1_landscape_hydrology','2_transport','3_districts_parcels','4_buildings_structures','5_infrastructure_props','6_finalize_emit']);
  assert.ok(r.summary && typeof r.summary.errors === 'number' && typeof r.summary.warnings === 'number');
  assert.ok(Array.isArray(r.diagnostics) && Array.isArray(r.repairs) && Array.isArray(r.drops));
});

test('citygen diagnostics: finalizeReport/reportToJson sort deterministically and summarize', () => {
  const r = createReport({ generatorVersion: '0.1.0', seed: 7, deterministic: true });
  r.stages = [{ id: '2_transport', status: 'ok' }, { id: '1_landscape_hydrology', status: 'ok' }];
  r.diagnostics = [
    { severity: 'info', code: 'b', stage: '2_transport', message: 'm2' },
    { severity: 'error', code: 'a', stage: '1_landscape_hydrology', message: 'm1' },
    { severity: 'warn', code: 'c', stage: '1_landscape_hydrology', message: 'm0' },
  ];
  r.repairs = [{ stage: '2_transport', code: 'z' }, { stage: '1_landscape_hydrology', code: 'a' }];
  r.drops = [{ stage: '2_transport', id: 'b' }, { stage: '1_landscape_hydrology', id: 'a' }];
  const j1 = reportToJson(structuredClone(r));
  const j2 = reportToJson(structuredClone(r));
  assert.equal(j1, j2);
  const out = JSON.parse(j1);
  assert.deepEqual(out.stages.map(s => s.id), ['1_landscape_hydrology', '2_transport']);
  assert.deepEqual(out.diagnostics.map(d => [d.severity, d.code]), [['error','a'], ['warn','c'], ['info','b']]);
  assert.deepEqual(out.repairs.map(x => [x.stage, x.code]), [['1_landscape_hydrology','a'], ['2_transport','z']]);
  assert.deepEqual(out.drops.map(x => [x.stage, x.id]), [['1_landscape_hydrology','a'], ['2_transport','b']]);
  assert.deepEqual(out.summary, { errors: 1, warnings: 1, repairs: 2, drops: 2 });
  assert.equal(out.generator.seed, 7);
});

test('citygen rng/ids: deterministic seeds, rng sequence and stable ids', () => {
  assert.equal(mix(42, '1_landscape_hydrology', 'd1', 0, 0, '', 0), mix(42, '1_landscape_hydrology', 'd1', 0, 0, '', 0));
  assert.notEqual(mix(42, 'stage', 1), mix(42, 'stage', 2));
  assert.equal(hashString('abc'), hashString('abc'));
  assert.equal(stageSubseed(42, '2_transport', 'd1', 1, 2, 'slot', 3), mix(42, '2_transport', 'd1', 1, 2, 'slot', 3));
  const a = makeRng(123), b = makeRng(123);
  const seqA = [a(), a(), a(), a(), a()], seqB = [b(), b(), b(), b(), b()];
  assert.deepEqual(seqA, seqB);
  assert.ok(seqA.every(v => v >= 0 && v < 1));
  assert.equal(stableId('stage', 1, 'x'), 'stage_1_x');
  assert.deepEqual([{ id: 'b' }, { id: 'a' }, { id: 'c' }].sort(byId).map(x => x.id), ['a', 'b', 'c']);
});

test('citygen pipeline: all stages complete with status ok on base v4 input', () => {
  const out = runCitygen(v4Base());
  assert.deepEqual(out.report.stages.map(s => ({ id: s.id, status: s.status })), [
    { id: '0_input_space', status: 'ok' },
    { id: '1_landscape_hydrology', status: 'ok' },
    { id: '2_transport', status: 'ok' },
    { id: '3_districts_parcels', status: 'ok' },
    { id: '4_buildings_structures', status: 'ok' },
    { id: '5_infrastructure_props', status: 'ok' },
    { id: '6_finalize_emit', status: 'ok' },
  ]);
});

test('citygen spatial index: inserts and queries AABBs deterministically', () => {
  const idx = createSpatialIndex({ size: 256 }, 64);
  assert.equal(idx.size, 0);
  assert.ok(idx.insert({ id: 'a', minX: -10, maxX: 10, minZ: -10, maxZ: 10 }));
  assert.ok(idx.insert({ id: 'b', minX: 100, maxX: 120, minZ: 100, maxZ: 120 }));
  assert.ok(idx.insert({ id: 'c', minX: 5, maxX: 15, minZ: 5, maxZ: 15 }));
  assert.equal(idx.size, 3);
  const q1 = idx.query({ minX: -5, maxX: 6, minZ: -5, maxZ: 6 }).map(x => x.id).sort();
  assert.deepEqual(q1, ['a', 'c']);
  const q2 = idx.query({ minX: 90, maxX: 110, minZ: 90, maxZ: 110 }).map(x => x.id).sort();
  assert.deepEqual(q2, ['b']);
  const q3 = idx.query({ minX: -200, maxX: -150, minZ: -200, maxZ: -150 });
  assert.equal(q3.length, 0);
  idx.clear();
  assert.equal(idx.size, 0);
});

test('citygen stage 2: clamps road path points outside world bounds (warn + repair)', () => {
  const raw = v4Base();
  raw.cityforge.networks.roads = {
    nodes: [
      { id: 'a', position: [-50, 0, 0], layer: 'ground' },
      { id: 'b', position: [50, 0, 0], layer: 'ground' },
    ],
    segments: [
      { id: 'oob_seg', from: 'a', to: 'b', type: 'local', layer: 'ground', path: [[-50, 0, 0], [150, 0, 0]], lanes: [{ id: 'l1', direction: 'forward', width: 8, type: 'vehicle' }] },
    ],
    junctions: [],
  };
  const out = runCitygen(raw);
  assert.ok(out.report.diagnostics.some(d => d.code === 'road_point_out_of_bounds' && d.stage === '2_transport'));
  assert.ok(out.report.repairs.some(r => r.code === 'clamp_road_path_bounds' && r.stage === '2_transport' && r.id === 'oob_seg'));
  const seg = out.engine.cityforge.networks.roads.segments.find(s => s.id === 'oob_seg');
  assert.ok(seg);
  assert.equal(seg.path[1][0], 128);
});

test('pilot level-16 v4: generateOutput deterministic (report and catalog contents)', () => {
  const raw = JSON.parse(readFileSync(resolve(import.meta.dirname, '../src/levels/level-16.json'), 'utf8'));
  const a = generateOutput(structuredClone(raw), 'src/levels/level-16.json');
  const b = generateOutput(structuredClone(raw), 'src/levels/level-16.json');
  assert.equal(a.kind, 'catalog');
  assert.equal(a.sourceFormat, 'cityforge-v4');
  assert.equal(a.generationReport, b.generationReport);
  assert.deepEqual(a.files.map(f => f.path), b.files.map(f => f.path));
  assert.deepEqual(
    a.files.map(f => f.code ?? Buffer.from(f.bytes).toString('base64')),
    b.files.map(f => f.code ?? Buffer.from(f.bytes).toString('base64'))
  );
  const report = JSON.parse(a.generationReport);
  assert.equal(report.summary.errors, 0);
  assert.equal(raw.windows?.spacing, 12, 'pilot source should keep windows spacing perf tuning');
  assert.ok(report.diagnostics.some(d => d.code === 'anchors_connected_network' && d.stage === '6_finalize_emit'), 'pilot should report anchors connected to road network');
  assert.ok(report.diagnostics.some(d => d.code === 'road_conflicts_none' && d.stage === '6_finalize_emit'), 'pilot finalize should report no same-layer road crossing conflicts');
  assert.ok(report.diagnostics.some(d => d.code === 'interchange_junction_candidates' && d.stage === '6_finalize_emit' && (d.count ?? 0) >= 1), 'pilot finalize should identify junction grade-separation candidates (M3 B2 groundwork)');
  assert.ok(!report.diagnostics.some(d => d.code === 'district_type_poor_road_access' && d.stage === '6_finalize_emit'), 'pilot should not have poor road access by district type');
  const fin = report.diagnostics.find(d => d.code === 'finalize_counts' && d.stage === '6_finalize_emit');
  assert.ok(fin?.propsByDistrictType && typeof fin.propsByDistrictType === 'object', 'pilot finalize_counts should include propsByDistrictType');
  assert.ok(fin?.roadAccessByType && typeof fin.roadAccessByType === 'object', 'pilot finalize_counts should include roadAccessByType');
  assert.equal(fin?.roadComponents, 1, 'pilot road graph should be connected');
  assert.equal(fin?.roadSegments, 146);
  assert.equal(fin?.roadNodes, 119);
  assert.equal(fin?.buildings, 401);
  assert.equal(fin?.props, 360);
  assert.equal(fin?.lights, 8);
  // M1/M2 expansion: pilot should include expanded district/building variety and building coverage across buildable districts.
  const expectedNewTypes = ['commercial', 'suburb', 'old_town', 'campus', 'market'];
  for (const t of expectedNewTypes) {
    assert.ok(fin?.districtTypes?.includes(t), `pilot should include district type ${t}`);
    assert.ok((fin?.buildingsByDistrictType?.[t] ?? 0) > 0, `pilot should place buildings in ${t}`);
    assert.ok((fin?.propsByDistrictType?.[t] ?? 0) > 0, `pilot should place props in ${t}`);
  }
  assert.ok(fin?.buildingsByDistrictType?.residential > 0 && fin?.buildingsByDistrictType?.slums > 0);
  assert.ok(!report.diagnostics.some(d => d.code === 'district_without_buildings' && d.stage === '6_finalize_emit'), 'pilot buildable districts should have building coverage');
  assert.ok(!report.diagnostics.some(d => d.severity === 'warn' && d.stage === '3_districts_parcels'), 'pilot district assignment should avoid adjacency/representation warnings');
  // M3 B2/B3 prototype: deterministic overpass interchanges on pilot transport network.
  const overpasses = report.diagnostics.filter(d => d.code === 'transport_interchange_overpass' && d.stage === '2_transport');
  assert.equal(overpasses.length, 5, 'pilot should apply five deterministic overpass interchange prototypes');
  assert.deepEqual(overpasses.map(d => d.segmentId), ['tr_sp1_r', 'tr_sp2_r', 'tr_gb_29', 'tr_gb_35', 'tr_gb_80']);
  for (const o of overpasses) {
    assert.ok(Number.isFinite(o.deckH) && o.deckH > 0);
    assert.ok(Number.isFinite(o.rampLen) && o.rampLen > 0);
    assert.ok(!report.diagnostics.some(d => d.code === 'interchange_clearance_low' && d.stage === '6_finalize_emit' && d.segmentId === o.segmentId),
      `pilot interchange ${o.segmentId} should meet required clearance (no interchange_clearance_low)`);
  }
  assert.ok(report.diagnostics.some(d => d.code === 'interchange_validated' && d.stage === '6_finalize_emit' && d.count >= 11), 'pilot finalize should validate interchange segments (overpasses + junction ramps)');
  assert.ok(!report.diagnostics.some(d => d.code === 'interchange_endpoint_missing' && d.stage === '6_finalize_emit'), 'pilot interchange segments should have valid endpoint nodes');
  assert.ok(!report.diagnostics.some(d => d.code === 'interchange_elevated_node_degree' && d.stage === '6_finalize_emit'), 'pilot elevated interchange nodes should have valid connectivity degree');
  assert.ok(!report.diagnostics.some(d => d.code === 'interchange_junction_integrity' && d.stage === '6_finalize_emit'), 'pilot junction interchange prototype references must remain valid');
  assert.ok(!report.diagnostics.some(d => d.code === 'interchange_overpass_integrity' && d.stage === '6_finalize_emit'), 'pilot overpass interchange prototype segment must remain valid');

  // M3 B2/B4: junction grade-separation prototypes on pilot (deterministic, 4-way + T-junctions, with ground connectors).
  const junctions = report.diagnostics.filter(d => d.code === 'transport_interchange_junction' && d.stage === '2_transport');
  assert.equal(junctions.length, 3, 'pilot should apply deterministic junction grade-separation prototypes');
  assert.deepEqual(junctions.map(j => j.nodeId), ['tr_gn_53', 'tr_gn_60', 'tr_gn_63']);
  const j53 = junctions.find(j => j.nodeId === 'tr_gn_53');
  const j60 = junctions.find(j => j.nodeId === 'tr_gn_60');
  const j63 = junctions.find(j => j.nodeId === 'tr_gn_63');
  assert.deepEqual(j53?.elevatedPair, ['tr_gb_77', 'tr_gb_88']);
  assert.deepEqual(j53?.ramps, ['tr_jr_tr_gn_53_a', 'tr_jr_tr_gn_53_b']);
  assert.equal(j53?.kind, 'tee3');
  assert.deepEqual(j60?.elevatedPair, ['tr_gb_84', 'tr_gb_85']);
  assert.deepEqual(j60?.ramps, ['tr_jr_tr_gn_60_a', 'tr_jr_tr_gn_60_b']);
  assert.equal(j60?.kind, 'tee3');
  assert.deepEqual(j63?.elevatedPair, ['tr_gb_87', 'tr_gb_111']);
  assert.deepEqual(j63?.ramps, ['tr_jr_tr_gn_63_a', 'tr_jr_tr_gn_63_b']);
  assert.equal(j63?.kind, 'cross4');
  for (const j of junctions) {
    assert.ok(Number.isFinite(j.clearance) && j.clearance >= 1.5, `junction interchange ${j.nodeId} should have sufficient clearance`);
  }

  // M3 B4: interchange segment invariants in generated road network (deterministic).
  const { ctx } = runCitygen(structuredClone(raw));
  const roads = ctx.networks?.roads;
  assert.ok(roads && Array.isArray(roads.segments) && Array.isArray(roads.nodes), 'pilot should produce road network');
  const byNodeId = new Map(roads.nodes.map(n => [n.id, n]));
  const checkInterchangeSeg = (segId, expect) => {
    const seg = roads.segments.find(s => s.id === segId);
    assert.ok(seg, `interchange segment ${segId} should exist`);
    assert.equal(seg.bridge, true);
    assert.equal(seg.layer, 'elevated');
    assert.equal(seg.interchange, expect.interchange);
    assert.ok(Array.isArray(seg.path) && seg.path.length >= 2, 'interchange segment should have path');
    const nFrom = byNodeId.get(seg.from), nTo = byNodeId.get(seg.to);
    assert.ok(nFrom && nTo, 'interchange endpoints should reference existing nodes');
    const p0 = seg.path[0], pN = seg.path[seg.path.length - 1];
    assert.ok(Math.abs(p0[0] - nFrom.position[0]) < 1e-6 && Math.abs(p0[1] - nFrom.position[1]) < 1e-6 && Math.abs(p0[2] - nFrom.position[2]) < 1e-6, `${segId} start should match from-node`);
    assert.ok(Math.abs(pN[0] - nTo.position[0]) < 1e-6 && Math.abs(pN[1] - nTo.position[1]) < 1e-6 && Math.abs(pN[2] - nTo.position[2]) < 1e-6, `${segId} end should match to-node`);
    const maxSlope = seg.path.slice(1).reduce((m, p, i) => {
      const a = seg.path[i], dx = (p[0]-a[0]), dz = (p[2]-a[2]), dy = (p[1]-a[1]);
      const run = Math.hypot(dx,dz);
      return Math.max(m, run > 1e-9 ? Math.abs(dy)/run : 0);
    }, 0);
    assert.ok(maxSlope <= 0.31, `${segId} slope should be within validated limit`);
    if (expect.interchange === 'junction_ramp') {
      const lf = nFrom.layer ?? 'ground', lt = nTo.layer ?? 'ground';
      assert.ok((lf === 'ground' && lt === 'elevated') || (lf === 'elevated' && lt === 'ground'), `${segId} should connect ground and elevated nodes`);
    }
    return seg;
  };
  for (const overId of ['tr_sp1_r', 'tr_sp2_r', 'tr_gb_29', 'tr_gb_35', 'tr_gb_80']) {
    const segOver = checkInterchangeSeg(overId, { interchange: 'overpass' });
    const endMaxY = Math.max(segOver.path[0][1] ?? 0, segOver.path.at(-1)[1] ?? 0);
    const midMaxY = segOver.path.reduce((m, p) => Math.max(m, p[1] ?? -Infinity), -Infinity);
    assert.ok(midMaxY > endMaxY + 1.0, `overpass ${overId} path should be elevated above endpoints`);
  }

  for (const j of junctions) for (const rid of j.ramps) checkInterchangeSeg(rid, { interchange: 'junction_ramp' });
  // Ground connectors preserve connectivity at junction interchanges.
  for (const nid of junctions.map(j => j.nodeId)) {
    assert.ok(roads.segments.some(s => s.id === `tr_jc_${nid}_a` && s.layer === 'ground'), `junction ${nid} ground connector A should exist`);
    assert.ok(roads.segments.some(s => s.id === `tr_jc_${nid}_b` && s.layer === 'ground'), `junction ${nid} ground connector B should exist`);
  }

  // Compiled engine map: interchange segments become bridge roads with decks (nav/geometry semantics).
  const interchangeBridgeIds = [...overpasses.map(o => o.segmentId), ...junctions.flatMap(j => j.ramps)];
  const compiledInter = (a.worldMap?.roads ?? []).filter(r => interchangeBridgeIds.includes(r.id));
  assert.equal(compiledInter.length, 11, 'pilot compiled map should include interchange bridge roads');
  for (const r of compiledInter) {
    assert.equal(r.type, 'bridge', `${r.id} should compile as bridge road`);
    assert.ok(Array.isArray(r.decks) && r.decks.length > 0, `${r.id} should have decks`);
  }
});

test('citygen stage 1: clamps river width/depth and repairs steep terrain modifier', () => {
  const raw = v4Base();
  raw.cityforge.hydrology.rivers = [
    { id: 'wide', path: [[-20, 0, 0], [20, 0, 0]], width: 999, depth: 999 },
  ];
  raw.cityforge.terrain.modifiers = [
    { id: 'steep', type: 'mountain', center: [0, 0], radius: 10, height: 100 },
  ];
  const out = runCitygen(raw);
  const river = out.engine.cityforge.hydrology.rivers[0];
  assert.equal(river.width, 200);
  assert.equal(river.depth, 100);
  assert.ok(out.report.repairs.some(r => r.id === 'wide' && r.code === 'clamp_river_width'));
  assert.ok(out.report.repairs.some(r => r.id === 'wide' && r.code === 'clamp_river_depth'));
  const mod = out.engine.cityforge.terrain.modifiers.find(m => m.id === 'steep');
  assert.ok(mod);
  assert.ok(Math.abs(mod.height) / mod.radius <= 0.8 + 1e-9);
  assert.ok(out.report.repairs.some(r => r.id === 'steep' && (r.code === 'repair_steep_modifier_radius' || r.code === 'repair_steep_modifier_height')));
  assert.ok(out.report.diagnostics.some(d => d.code === 'terrain_steep_modifier_repaired' && d.stage === '1_landscape_hydrology'));
});

test('citygen stage 1: renames duplicate terrain modifier ids deterministically', () => {
  const raw = v4Base();
  raw.cityforge.terrain.modifiers = [
    { id: 'm', type: 'mountain', center: [-20, 0], radius: 20, height: 10 },
    { id: 'm', type: 'valley', center: [20, 0], radius: 20, height: -8 },
  ];
  const a = runCitygen(structuredClone(raw));
  const b = runCitygen(structuredClone(raw));
  assert.equal(a.reportJson, b.reportJson);
  assert.deepEqual(a.engine.cityforge.terrain.modifiers.map(m => m.id), ['m', 'm_2']);
  assert.ok(a.report.repairs.some(r => r.code === 'duplicate_id_renamed' && r.stage === '1_landscape_hydrology' && r.id === 'm' && r.to === 'm_2'));
});

test('citygen stage 3: repairs unknown district profile to fallback', () => {
  const raw = v4Base();
  raw.generator.districts = [
    { id: 'd1', type: 'unknown_weird_type', geometry: { rect: { minX: -64, minZ: -64, maxX: 64, maxZ: 64 } } },
  ];
  const out = runCitygen(raw);
  assert.ok(out.report.diagnostics.some(d => d.code === 'unknown_district_profile' && d.stage === '3_districts_parcels'));
  assert.ok(out.report.repairs.some(r => r.code === 'district_profile_fallback' && r.id === 'd1'));
  const d = out.ctx.districts.find(x => x.id === 'd1');
  assert.ok(d);
  assert.equal(d.type || d.profileId, 'forest');
});

test('citygen stage 3: warns on incompatible adjacent declared districts', () => {
  const raw = v4Base();
  raw.generator.districts = [
    { id: 'd1', type: 'office', geometry: { rect: { minX: -128, minZ: -128, maxX: 0, maxZ: 128 } }, cells: [{ cx: 0, cy: 0 }] },
    { id: 'd2', type: 'forest', geometry: { rect: { minX: 0, minZ: -128, maxX: 128, maxZ: 128 } }, cells: [{ cx: 1, cy: 0 }] },
  ];
  const out = runCitygen(raw);
  assert.ok(out.report.diagnostics.some(d => d.code === 'district_adjacency_fallback' && d.stage === '3_districts_parcels'));
  assert.ok(out.report.diagnostics.some(d => d.code === 'districts_passthrough' && d.stage === '3_districts_parcels'));
});

test('citygen stage 6: emits finalize summary and status', () => {
  const out = runCitygen(v4Base());
  const st6 = out.report.stages.find(s => s.id === '6_finalize_emit');
  assert.equal(st6?.status, 'ok');
  assert.ok(out.report.diagnostics.some(d => d.code === 'finalize_counts' && d.stage === '6_finalize_emit'));
  assert.ok(out.report.diagnostics.some(d => d.code === 'finalize_no_roads' && d.severity === 'warn' && d.stage === '6_finalize_emit'));
  assert.ok(out.report.summary && typeof out.report.summary.errors === 'number');
});

test('citygen stage 4: repairs duplicate building ids in declared buildings', () => {
  const raw = v4Base();
  raw.buildings = [
    { id: 'dup_b', type: 'residential', isEnterable: false, position: { x: 0, y: 0, z: 0 }, footprint: [{ x: -4, z: -4 }, { x: 4, z: -4 }, { x: 4, z: 4 }, { x: -4, z: 4 }], floors: 1, floorHeight: 3, material: 'concrete' },
    { id: 'dup_b', type: 'office', isEnterable: false, position: { x: 20, y: 0, z: 0 }, footprint: [{ x: 16, z: -4 }, { x: 24, z: -4 }, { x: 24, z: 4 }, { x: 16, z: 4 }], floors: 2, floorHeight: 3, material: 'glass' },
  ];
  const out = runCitygen(raw);
  assert.ok(out.report.diagnostics.some(d => d.code === 'buildings_passthrough' && d.stage === '4_buildings_structures'));
  assert.ok(out.report.repairs.some(r => r.code === 'duplicate_building_id' && r.stage === '4_buildings_structures'));
  const ids = (out.engine.buildings ?? []).map(b => b.id);
  assert.deepEqual(ids, ['dup_b', 'dup_b_2']);
});

test('citygen stage 2: repairs spawn-exit connectivity by adding connector segment', () => {
  const raw = v4Base();
  raw.gameplay.spawn = { x: -100, z: -100 };
  raw.gameplay.exit = { x: 100, z: 100 };
  raw.cityforge.networks.roads = {
    nodes: [
      { id: 'n1', position: [-100, 0, -100], layer: 'ground' },
      { id: 'n2', position: [-80, 0, -100], layer: 'ground' },
      { id: 'n3', position: [80, 0, 100], layer: 'ground' },
      { id: 'n4', position: [100, 0, 100], layer: 'ground' },
    ],
    segments: [
      { id: 's1', from: 'n1', to: 'n2', type: 'local', layer: 'ground', path: [[-100, 0, -100], [-80, 0, -100]], lanes: [{ id: 'l1', direction: 'forward', width: 8, type: 'vehicle' }] },
      { id: 's2', from: 'n3', to: 'n4', type: 'local', layer: 'ground', path: [[80, 0, 100], [100, 0, 100]], lanes: [{ id: 'l1', direction: 'forward', width: 8, type: 'vehicle' }] },
    ],
    junctions: [],
  };
  const out = runCitygen(raw);
  assert.ok(out.report.diagnostics.some(d => d.code === 'road_graph_disconnected' && d.stage === '2_transport'));
  assert.ok(out.report.repairs.some(r => r.code === 'connect_spawn_exit_components' && r.stage === '2_transport'));
  assert.ok(out.report.diagnostics.some(d => d.code === 'transport_repaired_connectivity' && d.stage === '2_transport'));
  const segs = out.engine.cityforge.networks.roads.segments;
  assert.ok(segs.length >= 3);
  assert.ok(segs.some(s => s.id === 'tr_repair_connect'));
});

test('citygen: stages build spatial indices (river/road/building) for downstream queries', () => {
  const raw = v4Base();
  raw.cityforge.hydrology.rivers = [
    { id: 'river1', path: [[-10, 0, 0], [10, 0, 0]], width: 12, depth: 2 },
  ];
  raw.cityforge.networks.roads = {
    nodes: [
      { id: 'a', position: [-40, 0, 20], layer: 'ground' },
      { id: 'b', position: [40, 0, 20], layer: 'ground' },
    ],
    segments: [
      { id: 's1', from: 'a', to: 'b', type: 'local', layer: 'ground', path: [[-40, 0, 20], [40, 0, 20]], lanes: [{ id: 'l1', direction: 'forward', width: 8, type: 'vehicle' }] },
    ],
    junctions: [],
  };
  raw.generator.districts = [
    { id: 'd1', type: 'residential', geometry: { rect: { minX: -60, minZ: -60, maxX: 60, maxZ: -5 } } },
  ];
  raw.generator.buildings = { generate: true, budget: 8 };
  const out = runCitygen(raw);
  assert.ok(out.ctx.spatial?.riverSegments, 'riverSegments index missing');
  assert.ok(out.ctx.spatial.riverSegments.query({ minX: -5, maxX: 5, minZ: -20, maxZ: 20 }).length >= 1, 'river index query near river should hit');
  assert.ok(out.ctx.spatial?.roadEasements, 'roadEasements index missing');
  assert.ok(out.ctx.spatial.roadEasements.query({ minX: -5, maxX: 5, minZ: 10, maxZ: 30 }).length >= 1, 'road index query near road should hit');
  assert.ok(out.ctx.spatial?.buildings, 'buildings index missing');
  if ((out.ctx.buildings?.length ?? 0) > 0) {
    const b = out.ctx.buildings[0];
    const xs = b.footprint.map(p => p.x), zs = b.footprint.map(p => p.z);
    const q = out.ctx.spatial.buildings.query({ minX: Math.min(...xs), maxX: Math.max(...xs), minZ: Math.min(...zs), maxZ: Math.max(...zs) });
    assert.ok(q.length >= 1, 'building index query over footprint should hit');
  }
});

test('citygen report: districts include reservedParcels and finalize includes road graph components', () => {
  const raw = v4Base();
  raw.generator.districts = [
    { id: 'd1', type: 'residential', geometry: { rect: { minX: -64, minZ: -64, maxX: 64, maxZ: 64 } } },
  ];
  raw.cityforge.networks.roads = {
    nodes: [
      { id: 'a', position: [-40, 0, 0], layer: 'ground' },
      { id: 'b', position: [40, 0, 0], layer: 'ground' },
    ],
    segments: [
      { id: 's1', from: 'a', to: 'b', type: 'local', layer: 'ground', path: [[-40, 0, 0], [40, 0, 0]], lanes: [{ id: 'l1', direction: 'forward', width: 8, type: 'vehicle' }] },
    ],
    junctions: [],
  };
  const out = runCitygen(raw);
  assert.ok(Array.isArray(out.report.districts) && out.report.districts.length >= 1);
  for (const d of out.report.districts) {
    assert.equal(typeof d.reservedParcels, 'number');
    assert.ok(d.reservedParcels >= 0 && d.reservedParcels <= d.parcels);
  }
  const fin = out.report.diagnostics.find(d => d.code === 'finalize_counts' && d.stage === '6_finalize_emit');
  assert.ok(fin, 'finalize_counts missing');
  assert.equal(typeof fin.roadComponents, 'number');
  assert.equal(typeof fin.roadGraphNodes, 'number');
  assert.ok(fin.roadComponents >= 1);
  if ((fin.props ?? 0) > 0) {
    assert.ok(fin.propsByDistrictType && typeof fin.propsByDistrictType === 'object', 'finalize_counts.propsByDistrictType missing when props generated');
  }
  assert.ok(fin.roadAccessByType && typeof fin.roadAccessByType === 'object', 'finalize_counts.roadAccessByType missing');
});

test('citygen stage 2/6: repair connects spawn-exit and remaining road components (no disconnected finalize)', () => {
  const raw = v4Base();
  raw.gameplay.spawn = { x: -100, z: -100 };
  raw.gameplay.exit = { x: 100, z: 100 };
  raw.cityforge.networks.roads = {
    nodes: [
      { id: 'n1', position: [-100, 0, -100], layer: 'ground' },
      { id: 'n2', position: [-80, 0, -100], layer: 'ground' },
      { id: 'n3', position: [80, 0, 100], layer: 'ground' },
      { id: 'n4', position: [100, 0, 100], layer: 'ground' },
      { id: 'n5', position: [0, 0, 0], layer: 'ground' },
      { id: 'n6', position: [10, 0, 0], layer: 'ground' },
    ],
    segments: [
      { id: 's1', from: 'n1', to: 'n2', type: 'local', layer: 'ground', path: [[-100, 0, -100], [-80, 0, -100]], lanes: [{ id: 'l1', direction: 'forward', width: 8, type: 'vehicle' }] },
      { id: 's2', from: 'n3', to: 'n4', type: 'local', layer: 'ground', path: [[80, 0, 100], [100, 0, 100]], lanes: [{ id: 'l1', direction: 'forward', width: 8, type: 'vehicle' }] },
      { id: 's3', from: 'n5', to: 'n6', type: 'local', layer: 'ground', path: [[0, 0, 0], [10, 0, 0]], lanes: [{ id: 'l1', direction: 'forward', width: 8, type: 'vehicle' }] },
    ],
    junctions: [],
  };
  const out = runCitygen(raw);
  assert.ok(out.report.repairs.some(r => r.code === 'connect_spawn_exit_components' && r.stage === '2_transport'));
  assert.ok(out.report.repairs.some(r => r.code === 'connect_road_component' && r.stage === '2_transport'));
  const fin = out.report.diagnostics.find(d => d.code === 'finalize_counts' && d.stage === '6_finalize_emit');
  assert.ok(fin);
  assert.equal(fin.roadComponents, 1);
  assert.ok(!out.report.diagnostics.some(d => d.code === 'road_graph_disconnected_final' && d.stage === '6_finalize_emit'));
});

test('citygen stage 2 helpers: axis-aligned terrain path rejects diagonal and river-proximate paths', async () => {
  const { buildAxisAlignedTerrainPath, isValidAxisAlignedTerrainPath } = await import('./citygen/pipeline/stage-2-transport.mjs');
  const flat = { heightAt: () => 0 };
  const diag = buildAxisAlignedTerrainPath(0, 0, 10, 10, flat, [], 4);
  assert.equal(diag, null, 'diagonal path must be rejected');
  const straight = buildAxisAlignedTerrainPath(0, 0, 24, 0, flat, [], 12);
  assert.ok(Array.isArray(straight) && straight.length >= 2);
  assert.equal(isValidAxisAlignedTerrainPath(straight, []), true);
  const river = [{ path: [[12, 0, -40], [12, 0, 40]], width: 12 }];
  const nearRiver = buildAxisAlignedTerrainPath(0, 0, 24, 0, flat, river, 12);
  assert.ok(Array.isArray(nearRiver));
  assert.equal(isValidAxisAlignedTerrainPath(nearRiver, river), false, 'path crossing/near river corridor must be rejected');
});

test('citygen stage 6: detects and safely repairs flat same-layer road crossing', () => {
  const raw = v4Base();
  raw.gameplay.spawn = { x: -80, z: -80 };
  raw.gameplay.exit = { x: 80, z: 80 };
  raw.cityforge.networks.roads = {
    nodes: [
      { id: 'a1', position: [-40, 0, 0], layer: 'ground' },
      { id: 'a2', position: [40, 0, 0], layer: 'ground' },
      { id: 'b1', position: [0, 0, -40], layer: 'ground' },
      { id: 'b2', position: [0, 0, 40], layer: 'ground' },
    ],
    segments: [
      { id: 'sx', from: 'a1', to: 'a2', type: 'local', layer: 'ground', path: [[-40, 0, 0], [40, 0, 0]], lanes: [{ id: 'l1', direction: 'forward', width: 8, type: 'vehicle' }] },
      { id: 'sz', from: 'b1', to: 'b2', type: 'local', layer: 'ground', path: [[0, 0, -40], [0, 0, 40]], lanes: [{ id: 'l1', direction: 'forward', width: 8, type: 'vehicle' }] },
    ],
    junctions: [],
  };
  const out = runCitygen(raw);
  assert.ok(out.report.diagnostics.some(d => d.code === 'road_same_level_conflict' && d.stage === '6_finalize_emit'), 'crossing without shared junction should be detected');
  assert.ok(out.report.repairs.some(r => r.code === 'resolve_road_crossing' && r.stage === '6_finalize_emit'), 'safe flat crossing should be repaired');
  assert.ok(out.report.diagnostics.some(d => d.code === 'road_crossing_repaired' && d.stage === '6_finalize_emit'));
  assert.ok(!out.report.diagnostics.some(d => d.code === 'road_crossing_repair_skipped' && d.stage === '6_finalize_emit'));
});

test('citygen stage 6: skips unsafe crossing repair when no shared junction height is slope-safe', () => {
  const raw = v4Base();
  raw.gameplay.spawn = { x: -80, z: -80 };
  raw.gameplay.exit = { x: 80, z: 80 };
  // Flat segments cross at different elevations with short runs: either shared Y forces >0.3 slope on one pair.
  raw.cityforge.networks.roads = {
    nodes: [
      { id: 'a1', position: [-4, 0, 0], layer: 'ground' },
      { id: 'a2', position: [4, 0, 0], layer: 'ground' },
      { id: 'b1', position: [0, 5, -4], layer: 'ground' },
      { id: 'b2', position: [0, 5, 4], layer: 'ground' },
    ],
    segments: [
      { id: 'sx', from: 'a1', to: 'a2', type: 'local', layer: 'ground', path: [[-4, 0, 0], [4, 0, 0]], lanes: [{ id: 'l1', direction: 'forward', width: 8, type: 'vehicle' }] },
      { id: 'sb', from: 'b1', to: 'b2', type: 'local', layer: 'ground', path: [[0, 5, -4], [0, 5, 4]], lanes: [{ id: 'l1', direction: 'forward', width: 8, type: 'vehicle' }] },
    ],
    junctions: [],
  };
  const out = runCitygen(raw);
  assert.ok(out.report.diagnostics.some(d => d.code === 'road_same_level_conflict' && d.stage === '6_finalize_emit'), 'crossing should be detected');
  assert.ok(!out.report.repairs.some(r => r.code === 'resolve_road_crossing' && r.stage === '6_finalize_emit' && Array.isArray(r.segments) && r.segments.includes('sx') && r.segments.includes('sb')), 'unsafe crossing repair for sx/sb must not be applied');
  assert.ok(out.report.diagnostics.some(d => d.code === 'road_crossing_repair_skipped' && d.stage === '6_finalize_emit' && Array.isArray(d.segments) && d.segments.includes('sx') && d.segments.includes('sb')), 'unsafe crossing repair should be skipped with diagnostic');
});

test('citygen stage 6: warns when junction ramp does not connect ground and elevated nodes', () => {
  const raw = v4Base();
  raw.gameplay.spawn = { x: -80, z: -80 };
  raw.gameplay.exit = { x: 80, z: 80 };
  raw.cityforge.networks.roads = {
    nodes: [
      { id: 'g1', position: [-20, 0, 0], layer: 'ground' },
      { id: 'g2', position: [20, 4, 0], layer: 'ground' },
    ],
    segments: [
      { id: 'jr_bad', from: 'g1', to: 'g2', type: 'local', layer: 'elevated', bridge: true, interchange: 'junction_ramp', path: [[-20, 0, 0], [0, 2, 0], [20, 4, 0]], lanes: [{ id: 'l1', direction: 'forward', width: 8, type: 'vehicle' }] },
    ],
    junctions: [],
  };
  const out = runCitygen(raw);
  assert.ok(out.report.diagnostics.some(d => d.code === 'interchange_ramp_layers' && d.stage === '6_finalize_emit' && d.segmentId === 'jr_bad'), 'junction ramp with invalid endpoint layers should be warned');
});

test('citygen M3 B4: multi-level interchange compiles with correct road types and roadCorridors semantics (pilot level-16)', () => {
  const raw = JSON.parse(readFileSync(resolve('src/levels/level-16.json'), 'utf8'));
  const out = runCitygen(structuredClone(raw));
  const source = out.ctx?.engine ?? out.ctx?.input ?? out.input ?? raw;
  const compiled = compileCityforge(source);
  const roads = compiled.engine?.roads ?? [];
  const byId = new Map(roads.map(r => [r.id, r]));
  // Overpass and junction ramps are elevated bridge segments; ground connectors remain ground.
  assert.equal(byId.get('tr_sp1_r')?.type, 'bridge');
  assert.equal(byId.get('tr_sp2_r')?.type, 'bridge');
  assert.equal(byId.get('tr_gb_29')?.type, 'bridge');
  assert.equal(byId.get('tr_gb_35')?.type, 'bridge');
  assert.equal(byId.get('tr_gb_80')?.type, 'bridge');
  assert.equal(byId.get('tr_jr_tr_gn_63_a')?.type, 'bridge');
  assert.equal(byId.get('tr_jr_tr_gn_63_b')?.type, 'bridge');
  assert.equal(byId.get('tr_jc_tr_gn_63_a')?.type, 'ground');
  assert.equal(byId.get('tr_jc_tr_gn_63_b')?.type, 'ground');
  // Terrain cross-leveling corridors apply to ground roads only: connectors included, elevated interchange segments excluded.
  const corridors = compiled.engine?.relief?.roadCorridors ?? [];
  const corridorIds = new Set(corridors.map(c => c.id));
  assert.ok(corridorIds.has('tr_jc_tr_gn_63_a'));
  assert.ok(corridorIds.has('tr_jc_tr_gn_63_b'));
  assert.ok(!corridorIds.has('tr_sp1_r'));
  assert.ok(!corridorIds.has('tr_sp2_r'));
  assert.ok(!corridorIds.has('tr_gb_29'));
  assert.ok(!corridorIds.has('tr_gb_35'));
  assert.ok(!corridorIds.has('tr_gb_80'));
  assert.ok(!corridorIds.has('tr_jr_tr_gn_63_a'));
  assert.ok(!corridorIds.has('tr_jr_tr_gn_63_b'));
});
