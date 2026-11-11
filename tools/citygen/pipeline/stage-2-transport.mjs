/**
 * Stage 2: transport graph (TASK-004, incremental).
 * Validates/repairs road network segments/nodes, computes connectivity hints,
 * records road easements, and emits sanitized networks. Deterministic.
 */
import { warn, info } from '../diagnostics.mjs';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const EPS = 1e-9;

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
      ctx.report.diagnostics.push(info('transport_passthrough', '2_transport', 'stage 2 using provided road network (procedural generation pending)', {
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
