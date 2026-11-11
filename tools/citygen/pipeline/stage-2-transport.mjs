/**
 * Stage 2: transport graph (TASK-004, incremental).
 * Validates/repairs road network segments/nodes, computes connectivity hints,
 * records road easements, and emits sanitized networks. Deterministic.
 */
import { warn, info } from '../diagnostics.mjs';
import { makeRng, mix } from '../rng.mjs';
import { reliefOf } from '../../../src/relief.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, t) => a + (b - a) * t;
const EPS = 1e-9;
const MAX_ROAD_SLOPE = 0.3; // align with jsonMap.maxSlope intent for generated roads
const BRIDGE_CLEARANCE = 2.0; // m above ground/river bed corridor for underpass readability
const BRIDGE_DECK_MIN = 1.2; // compiler warns below this over groundY
const SAMPLE_STEP = 4; // m for terrain/river profiling samples

function pathPoints(seg) {
  if (Array.isArray(seg.elements) && seg.elements.length) return null; // element-based, skip point slope checks
  const pts = Array.isArray(seg.path) ? seg.path.filter(p => Array.isArray(p) && p.length >= 3) : [];
  return pts.length >= 2 ? pts : null;
}

function segSlopeWarn(seg, maxSlope) {
  const pts = pathPoints(seg);
  if (!pts) return [];
  const out = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1];
    const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
    const h = Math.hypot(dx, dz);
    if (h < EPS) continue;
    const slope = Math.abs(dy) / h;
    if (slope > maxSlope) out.push({ i, slope });
  }
  return out;
}

function uniqById(items, kind, ctx, stageId) {
  const seen = new Set();
  const out = [];
  for (const it of items ?? []) {
    if (!it || typeof it !== 'object') continue;
    let cur = { ...it };
    let id = String(cur.id ?? kind);
    if (seen.has(id)) {
      let k = 2; while (seen.has(`${id}_${k}`)) k++;
      const nid = `${id}_${k}`;
      ctx.report.repairs.push({ stage: stageId, id, code: 'duplicate_id_renamed', to: nid });
      ctx.report.diagnostics.push(warn('duplicate_id', stageId, `${kind} '${id}' renamed to '${nid}'`, { id, to: nid }));
      id = nid; cur.id = nid;
    }
    seen.add(id);
    out.push(cur);
  }
  return out;
}

function distXZ(ax, az, bx, bz) { return Math.hypot(ax - bx, az - bz); }
function pointSegDistXZ(px, pz, ax, az, bx, bz) {
  const abx = bx - ax, abz = bz - az, apx = px - ax, apz = pz - az;
  const ab2 = abx * abx + abz * abz;
  const t = ab2 > EPS ? clamp((apx * abx + apz * abz) / ab2, 0, 1) : 0;
  return Math.hypot(px - (ax + abx * t), pz - (az + abz * t));
}

function segmentNearPoint(seg, x, z, radius) {
  if (Array.isArray(seg.elements) && seg.elements.length) return false; // unknown geometry here
  const pts = seg.path ?? [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1];
    if (pointSegDistXZ(x, z, a[0], a[2], b[0], b[2]) <= radius) return true;
  }
  return false;
}

function shouldGenerateTransport(ctx) {
  const tc = ctx.input?.generator?.transport;
  if (!tc || typeof tc !== 'object') return false;
  if (tc.generate === true) return true;
  if (tc.generate === false) return false;
  const has = (ctx.networks.roads.segments?.length ?? 0) > 0;
  return !has;
}

function modifiersToHills(mods = [], groundY = 0) {
  const hills = [];
  mods.forEach((m, i) => {
    if (!m || typeof m !== 'object') return;
    if (m.type !== 'mountain' && m.type !== 'valley') return;
    const center = Array.isArray(m.center) ? m.center : [Number(m.center?.x) || 0, Number(m.center?.z) || 0];
    const path = Array.isArray(m.path) && m.path.length >= 2 ? m.path : null;
    const ax = path ? (Array.isArray(path[0]) ? path[0][0] : center[0]) : center[0];
    const az = path ? (Array.isArray(path[0]) ? path[0][1] : center[1]) : center[1];
    const bx = path ? (Array.isArray(path[path.length - 1]) ? path[path.length - 1][0] : center[0]) : center[0];
    const bz = path ? (Array.isArray(path[path.length - 1]) ? path[path.length - 1][1] : center[1]) : center[1];
    const radius = Number.isFinite(m.radius) ? m.radius : 0;
    const height = Number.isFinite(m.height) ? m.height : 0;
    if (!(radius > 0) || !Number.isFinite(ax)) return;
    const signed = m.operation === 'subtract' ? -height : height;
    hills.push({ id: m.id ?? `hill_${i}`, x: ax, z: az, bx, bz, radius, height: signed });
  });
  // reliefOf needs a spec; baseY is ground reference.
  return { baseY: groundY, hills, pads: [], rivers: [], roadCorridors: [] };
}

function makeTerrainSampler(ctx) {
  const groundY = ctx.input?.ground?.y ?? 0;
  const mods = ctx.terrain?.modifiers ?? ctx.input?.cityforge?.terrain?.modifiers ?? [];
  const spec = modifiersToHills(mods, groundY);
  try {
    const relief = reliefOf(spec);
    return {
      groundY,
      heightAt: (x, z) => relief.heightAt(x, z),
      relief,
    };
  } catch {
    return { groundY, heightAt: () => groundY, relief: null };
  }
}

function riverMinDistXZAt(x, z, rivers = []) {
  let best = Infinity, river = null;
  for (const rv of rivers) {
    const path = rv?.path ?? [];
    for (let i = 0; i + 1 < path.length; i++) {
      const a = path[i], b = path[i + 1];
      const d = pointSegDistXZ(x, z, a[0], a[2], b[0], b[2]);
      if (d < best) { best = d; river = rv; }
    }
  }
  return { d: best, river };
}

function segCrossesRiver(ax, az, bx, bz, rivers) {
  for (const river of rivers ?? []) {
    const margin = (river.width ?? 10) * 0.5 + 2;
    const len = Math.hypot(bx - ax, bz - az);
    const steps = Math.max(2, Math.ceil(len / SAMPLE_STEP));
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const px = ax + (bx - ax) * t, pz = az + (bz - az) * t;
      const d = riverMinDistXZAt(px, pz, [river]).d;
      if (d < margin) return { river, tHit: t };
    }
  }
  return null;
}

function enforceSlope(path, maxSlope, stageId, segId, report) {
  if (!Array.isArray(path) || path.length < 2) return path;
  const out = [path[0].slice()];
  let repairs = 0;
  for (let i = 0; i + 1 < path.length; i++) {
    let a = out[out.length - 1];
    const b = path[i + 1].slice();
    const dx = b[0] - a[0], dz = b[2] - a[2];
    const dy = b[1] - a[1];
    const h = Math.hypot(dx, dz);
    if (h < EPS) { out.push(b); continue; }
    const slope = Math.abs(dy) / h;
    if (slope <= maxSlope + EPS) { out.push(b); continue; }
    // Split segment and clamp intermediate elevation to max slope from a toward b.
    const n = Math.ceil(slope / maxSlope);
    for (let k = 1; k <= n; k++) {
      const t = k / n;
      const x = a[0] + dx * t;
      const z = a[2] + dz * t;
      const targetLinear = a[1] + dy * t;
      const maxUp = a[1] + maxSlope * h * t;
      const maxDown = a[1] - maxSlope * h * t;
      const y = clamp(targetLinear, maxDown, maxUp);
      if (Math.abs(y - targetLinear) > 1e-6) repairs++;
      const p = [Math.round(x * 100) / 100, Math.round(y * 100) / 100, Math.round(z * 100) / 100];
      out.push(p);
      a = p;
    }
  }
  if (repairs && report) {
    report.repairs.push({ stage: stageId, id: segId, code: 'clamp_segment_slope', count: repairs });
    report.diagnostics.push(warn('segment_slope_repaired', stageId, `segment '${segId}' slope clamped/smoothed (${repairs} point adjustments)`, { id: segId, count: repairs }));
  }
  // remove tiny duplicates
  const dedup = [out[0]];
  for (let i = 1; i < out.length; i++) {
    const p = out[i], l = dedup[dedup.length - 1];
    if (Math.hypot(p[0]-l[0], p[1]-l[1], p[2]-l[2]) > 0.05) dedup.push(p);
  }
  return dedup.length >= 2 ? dedup : out;
}

function sampleMaxTerrainOnSegment(ax, az, bx, bz, sampler) {
  const len = Math.hypot(bx - ax, bz - az);
  const steps = Math.max(1, Math.ceil(len / SAMPLE_STEP));
  let maxY = -Infinity;
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const y = sampler.heightAt(ax + (bx - ax) * t, az + (bz - az) * t);
    if (y > maxY) maxY = y;
  }
  return Number.isFinite(maxY) ? maxY : sampler.groundY;
}

function buildRoutePath(points2d, sampler, rivers, stageId, report) {
  // points2d: [{x,z}, ...] in order. Profile on terrain and add bridge spans over rivers.
  const out = [];
  const pushPt = (x, y, z) => {
    const p = [Math.round(x * 100) / 100, Math.round(y * 100) / 100, Math.round(z * 100) / 100];
    const last = out[out.length - 1];
    if (!last || Math.hypot(last[0]-p[0], last[1]-p[1], last[2]-p[2]) > 0.05) out.push(p);
  };
  for (let i = 0; i + 1 < points2d.length; i++) {
    const a = points2d[i], b = points2d[i + 1];
    const dx = b.x - a.x, dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    if (len < EPS) continue;
    const ux = dx / len, uz = dz / len;
    const crossing = segCrossesRiver(a.x, a.z, b.x, b.z, rivers ?? []);
    const ya = sampler.heightAt(a.x, a.z);
    const yb = sampler.heightAt(b.x, b.z);
    if (!crossing) {
      // sample terrain-following polyline for on-ground segment
      const steps = Math.max(1, Math.ceil(len / 12));
      for (let s = (i === 0 ? 0 : 1); s <= steps; s++) {
        const t = s / steps;
        const x = a.x + dx * t, z = a.z + dz * t;
        const y = sampler.heightAt(x, z);
        pushPt(x, y, z);
      }
      continue;
    }
    // Bridge profile: ensure clearance above sampled terrain and river corridor bed estimate.
    const river = crossing.river;
    const maxTerrain = sampleMaxTerrainOnSegment(a.x, a.z, b.x, b.z, sampler);
    const riverBed = sampler.groundY - (Number.isFinite(river?.depth) ? river.depth : 2);
    const minDeckByGround = sampler.groundY + BRIDGE_DECK_MIN;
    const minDeckByClearance = Math.max(maxTerrain, riverBed) + BRIDGE_CLEARANCE;
    let deckH = Math.max(ya, yb, minDeckByGround, minDeckByClearance);
    // ramp length limited by segment and by slope
    const riseNeed = Math.max(deckH - ya, deckH - yb, 0);
    const rampMin = riseNeed / Math.max(MAX_ROAD_SLOPE, 0.05);
    const rampMax = Math.max(6, len * 0.35);
    let ramp = clamp(Math.max(10, rampMin), 6, rampMax);
    if (ramp * 2 >= len) ramp = Math.max(4, len * 0.25);
    // if still too steep for available length, raise deck (longer effective slope over same rise impossible, so increase deck? no)
    // ensure end ramps feasible by allowing slightly higher deck
    const feasibleRise = Math.max(MAX_ROAD_SLOPE * ramp, riseNeed);
    deckH = Math.max(deckH, ya + feasibleRise, yb + feasibleRise, minDeckByGround, minDeckByClearance);
    const a1x = a.x + ux * ramp, a1z = a.z + uz * ramp;
    const b1x = b.x - ux * ramp, b1z = b.z - uz * ramp;
    const deckMidX = (a1x + b1x) / 2, deckMidZ = (a1z + b1z) / 2;
    // refine deck by terrain at mid
    const midTerrain = sampler.heightAt(deckMidX, deckMidZ);
    deckH = Math.max(deckH, midTerrain + BRIDGE_CLEARANCE, sampler.groundY + BRIDGE_DECK_MIN);
    if (i === 0) pushPt(a.x, ya, a.z);
    pushPt(a1x, lerp(ya, deckH, 0.85), a1z);
    pushPt(deckMidX, deckH, deckMidZ);
    pushPt(b1x, lerp(yb, deckH, 0.85), b1z);
    pushPt(b.x, yb, b.z);
    report?.diagnostics.push(info('transport_bridge_profiled', stageId, `segment crossing river '${river?.id ?? '?'}' bridged (deck ${deckH.toFixed(2)}m)`, { river: river?.id ?? null, deckH }));
  }
  return out;
}

function pinEndpoints(path, start, end, maxSlope, stageId, segId, report) {
  if (!Array.isArray(path) || path.length < 2) return path;
  const p = path.map(pt => pt.slice());
  p[0] = start.slice();
  p[p.length - 1] = end.slice();
  // Adjust points adjacent to endpoints to satisfy slope constraints, inserting if needed.
  const fixEnd = (fromIdx, toIdx, fixed) => {
    let guard = 0;
    while (guard++ < 20) {
      const a = p[fromIdx], b = p[toIdx];
      const dx = b[0] - a[0], dz = b[2] - a[2], dy = b[1] - a[1];
      const h = Math.hypot(dx, dz);
      const slope = h < EPS ? 0 : Math.abs(dy) / h;
      if (slope <= maxSlope + EPS || h < 0.2) return;
      // move/insert intermediate point closer to fixed end to reduce slope
      if (Math.abs(toIdx - fromIdx) === 1) {
        const mid = [(a[0]+b[0])/2, (a[1]+b[1])/2, (a[2]+b[2])/2];
        if (fixed === 'to') {
          // keep b fixed, adjust mid from b side
          const dirX = a[0]-b[0], dirZ = a[2]-b[2];
          const len = Math.hypot(dirX, dirZ) || 1;
          const needH = Math.abs(a[1]-b[1]) / maxSlope;
          const hh = Math.max(0.5, Math.min(needH, len - 0.1));
          mid[0] = b[0] + dirX/len*hh; mid[2] = b[2] + dirZ/len*hh;
          mid[1] = b[1] + Math.sign(a[1]-b[1]) * Math.min(Math.abs(a[1]-b[1]), maxSlope*hh);
        } else {
          const dirX = b[0]-a[0], dirZ = b[2]-a[2];
          const len = Math.hypot(dirX, dirZ) || 1;
          const needH = Math.abs(b[1]-a[1]) / maxSlope;
          const hh = Math.max(0.5, Math.min(needH, len - 0.1));
          mid[0] = a[0] + dirX/len*hh; mid[2] = a[2] + dirZ/len*hh;
          mid[1] = a[1] + Math.sign(b[1]-a[1]) * Math.min(Math.abs(b[1]-a[1]), maxSlope*hh);
        }
        p.splice(Math.max(fromIdx,toIdx), 0, mid.map(v => Math.round(v*100)/100));
        report?.diagnostics.push(warn('endpoint_slope_repaired', stageId, `segment '${segId}' adjusted near endpoint for slope`, { id: segId }));
        return;
      } else {
        // pull adjacent interior toward feasible y
        const dir = toIdx > fromIdx ? 1 : -1;
        const adj = fromIdx + dir;
        const fixedPt = p[toIdx];
        const inner = p[adj];
        const dx2 = inner[0]-fixedPt[0], dz2 = inner[2]-fixedPt[2];
        const h2 = Math.hypot(dx2,dz2);
        if (h2 < EPS) return;
        const maxDy = maxSlope * h2;
        const dy2 = clamp(inner[1]-fixedPt[1], -maxDy, maxDy);
        if (Math.abs(dy2 - (inner[1]-fixedPt[1])) > 1e-6) {
          inner[1] = Math.round((fixedPt[1] + dy2) * 100) / 100;
          report?.diagnostics.push(warn('endpoint_slope_repaired', stageId, `segment '${segId}' adjusted near endpoint for slope`, { id: segId }));
        } else return;
      }
    }
  };
  fixEnd(1, 0, 'to');
  fixEnd(p.length - 2, p.length - 1, 'to');
  let out = enforceSlope(p, maxSlope, stageId, segId, report);
  // enforceSlope may move endpoints; restore and locally re-fix adjacent slopes.
  out[0] = start.slice();
  out[out.length - 1] = end.slice();
  fixEnd(1, 0, 'to');
  // recompute indices after possible inserts? fixEnd mutates in-place but indices for end side
  fixEnd(out.length - 2, out.length - 1, 'to');
  return out;
}

function generateTransport(ctx) {
  const stageId = '2_transport';
  const tc = ctx.input.generator.transport || {};
  const gp = ctx.input?.gameplay ?? {};
  const spawn = { x: gp.spawn?.x ?? 0, z: gp.spawn?.z ?? 0 };
  const exit = { x: gp.exit?.x ?? 0, z: gp.exit?.z ?? 0 };
  const seed = mix(ctx.meta.seed ?? 0, stageId, tc.seedOffset ?? 0);
  const rng = makeRng(seed);
  const groundY = ctx.input?.ground?.y ?? 0;
  const sampler = makeTerrainSampler(ctx);
  const rivers = (ctx.hydrology?.rivers ?? ctx.input?.cityforge?.hydrology?.rivers ?? []);
  // L-shaped route with deterministic bend choice; keep bend inside bounds-ish by anchors.
  const bend = rng() < 0.5
    ? { x: exit.x, z: spawn.z }
    : { x: spawn.x, z: exit.z };
  const pts2d = [spawn, bend, exit].filter((p, i, arr) => i === 0 || Math.hypot(p.x - arr[i-1].x, p.z - arr[i-1].z) > 1);
  let path = buildRoutePath(pts2d, sampler, rivers, stageId, ctx.report);
  if (path.length < 2) return;
  path = enforceSlope(path, MAX_ROAD_SLOPE, stageId, 'tr_main', ctx.report);
  // Pin endpoints to terrain/anchors and re-enforce slope while preserving them.
  const start = [Math.round(spawn.x * 100) / 100, Math.round(sampler.heightAt(spawn.x, spawn.z) * 100) / 100, Math.round(spawn.z * 100) / 100];
  const end = [Math.round(exit.x * 100) / 100, Math.round(sampler.heightAt(exit.x, exit.z) * 100) / 100, Math.round(exit.z * 100) / 100];
  path = pinEndpoints(path, start, end, MAX_ROAD_SLOPE, stageId, 'tr_main', ctx.report);
  if (path.length < 2) return;
  const width = clamp(Number.isFinite(tc.width) ? tc.width : 8, 4, 20);
  const nodes = [
    { id: 'tr_n_spawn', position: path[0].slice(), layer: 'ground' },
    { id: 'tr_n_exit', position: path[path.length - 1].slice(), layer: 'ground' },
  ];
  const segments = [{
    id: 'tr_main',
    from: 'tr_n_spawn',
    to: 'tr_n_exit',
    type: 'local',
    layer: 'ground',
    path,
    lanes: [{ id: 'lane_1', direction: 'forward', width, type: 'vehicle' }],
    shoulderWidth: 1,
    sidewalk: false,
    surface: 'asphalt',
  }];
  ctx.networks.roads.nodes = nodes;
  ctx.networks.roads.segments = segments;
  ctx.networks.roads.junctions = [];
  ctx.report.diagnostics.push(info('transport_generated', stageId, 'stage 2 generated base route spawn↔exit', { nodes: nodes.length, segments: segments.length, seed, points: path.length, profiled: true }));
}

export function makeStage2() {
  return {
    id: '2_transport',
    prepare(ctx) {
      const net = ctx.input?.cityforge?.networks ?? {};
      ctx.networks = {
        roads: {
          nodes: Array.isArray(net.roads?.nodes) ? structuredClone(net.roads.nodes) : [],
          segments: Array.isArray(net.roads?.segments) ? structuredClone(net.roads.segments) : [],
          junctions: Array.isArray(net.roads?.junctions) ? structuredClone(net.roads.junctions) : [],
        },
      };
      if (!ctx.masks.easement) ctx.masks.easement = { rivers: [], roads: [] };
      ctx.masks.easement.roads = [];
    },
    generate(ctx) {
      const stageId = '2_transport';
      if (shouldGenerateTransport(ctx)) {
        generateTransport(ctx);
        return;
      }
      ctx.report.diagnostics.push(info('transport_passthrough', stageId, 'stage 2 using provided road network (procedural generation pending)', {
        nodes: ctx.networks.roads.nodes.length,
        segments: ctx.networks.roads.segments.length,
      }));
    },
    validate(ctx) {
      const stageId = '2_transport';
      const nodes = uniqById(ctx.networks.roads.nodes, 'node', ctx, stageId);
      const nodeIds = new Set(nodes.map(n => n.id));
      const segmentsIn = uniqById(ctx.networks.roads.segments, 'segment', ctx, stageId);
      const segments = [];
      const maxSlope = 0.8; // permissive upper bound; ramps/bridges can be steep but warn
      for (const s of segmentsIn) {
        const pts = pathPoints(s);
        const hasElements = Array.isArray(s.elements) && s.elements.length > 0;
        if (!pts && !hasElements) {
          ctx.report.diagnostics.push(warn('segment_degenerate', stageId, `segment '${s.id ?? '?'}' dropped: needs path(>=2) or elements`));
          ctx.report.drops.push({ stage: stageId, id: s.id ?? null, reason: 'segment_degenerate' });
          continue;
        }
        if (s.from && !nodeIds.has(s.from)) ctx.report.diagnostics.push(warn('segment_missing_node', stageId, `segment '${s.id}' references missing from node '${s.from}'`, { id: s.id, node: s.from }));
        if (s.to && !nodeIds.has(s.to)) ctx.report.diagnostics.push(warn('segment_missing_node', stageId, `segment '${s.id}' references missing to node '${s.to}'`, { id: s.id, node: s.to }));
        const steep = segSlopeWarn(s, maxSlope);
        if (steep.length) ctx.report.diagnostics.push(warn('segment_steep', stageId, `segment '${s.id}' has ${steep.length} steep sub-segment(s) (max ${(Math.max(...steep.map(x=>x.slope))*100).toFixed(0)}%)`, { id: s.id }));
        // road easement mask (approx by path bbox/width)
        if (pts) {
          let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;
          for (const p of pts) { minX=Math.min(minX,p[0]); maxX=Math.max(maxX,p[0]); minZ=Math.min(minZ,p[2]); maxZ=Math.max(maxZ,p[2]); }
          const w = (Array.isArray(s.lanes) && s.lanes[0]?.width) ? s.lanes[0].width : 8;
          ctx.masks.easement.roads.push({ id: s.id ?? null, minX, maxX, minZ, maxZ, width: w });
        }
        segments.push(s);
      }
      ctx.networks.roads.nodes = nodes;
      ctx.networks.roads.segments = segments;
      ctx.networks.roads.junctions = uniqById(ctx.networks.roads.junctions, 'junction', ctx, stageId);

      // connectivity hint: spawn/exit near any road segment?
      const gp = ctx.input?.gameplay ?? {};
      const anchors = [{ name: 'spawn', x: gp.spawn?.x ?? 0, z: gp.spawn?.z ?? 0 }, { name: 'exit', x: gp.exit?.x ?? 0, z: gp.exit?.z ?? 0 }];
      for (const a of anchors) {
        const near = segments.some(s => segmentNearPoint(s, a.x, a.z, 30));
        if (!near && segments.length) ctx.report.diagnostics.push(warn('anchor_far_from_roads', stageId, `${a.name} is >30m from any road path segment`, { anchor: a.name }));
      }

      // simple connectivity over declared from/to graph
      const adj = new Map();
      for (const n of nodes) adj.set(n.id, new Set());
      for (const s of segments) {
        if (s.from && s.to && adj.has(s.from) && adj.has(s.to)) {
          adj.get(s.from).add(s.to); adj.get(s.to).add(s.from);
        }
      }
      let components = 0;
      const seen = new Set();
      for (const id of adj.keys()) {
        if (seen.has(id)) continue;
        components++; const q=[id]; seen.add(id);
        while (q.length) { const cur=q.shift(); for (const nb of (adj.get(cur)||[])) if(!seen.has(nb)){seen.add(nb); q.push(nb);} }
      }
      if (components > 1) ctx.report.diagnostics.push(warn('road_graph_disconnected', stageId, `road graph has ${components} connected components`, { components }));
      ctx.report.diagnostics.push(info('road_graph', stageId, 'road graph summary', { nodes: nodes.length, segments: segments.length, components }));
    },
    repair(_ctx) {},
    emit(ctx) {
      if (ctx.input?.cityforge) {
        if (!ctx.input.cityforge.networks) ctx.input.cityforge.networks = {};
        ctx.input.cityforge.networks.roads = ctx.networks.roads;
      }
      ctx.engine = ctx.input;
    },
  };
}
