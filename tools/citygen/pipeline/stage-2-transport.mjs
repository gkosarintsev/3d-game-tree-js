/**
 * Stage 2: transport graph (TASK-004, incremental).
 * Validates/repairs road network segments/nodes, computes connectivity hints,
 * records road easements, and emits sanitized networks. Deterministic.
 */
import { warn, info } from '../diagnostics.mjs';
import { makeRng, mix } from '../rng.mjs';
import { createSpatialIndex } from '../spatial.mjs';
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

function orient(ax, az, bx, bz, cx, cz) {
  return (bx - ax) * (cz - az) - (bz - az) * (cx - ax);
}
function onSeg(ax, az, bx, bz, cx, cz) {
  return Math.min(ax, bx) - EPS <= cx && cx <= Math.max(ax, bx) + EPS
    && Math.min(az, bz) - EPS <= cz && cz <= Math.max(az, bz) + EPS;
}
function segsIntersect(a1, a2, b1, b2) {
  const o1 = orient(a1[0], a1[2], a2[0], a2[2], b1[0], b1[2]);
  const o2 = orient(a1[0], a1[2], a2[0], a2[2], b2[0], b2[2]);
  const o3 = orient(b1[0], b1[2], b2[0], b2[2], a1[0], a1[2]);
  const o4 = orient(b1[0], b1[2], b2[0], b2[2], a2[0], a2[2]);
  if ((o1 > EPS && o2 < -EPS || o1 < -EPS && o2 > EPS) && (o3 > EPS && o4 < -EPS || o3 < -EPS && o4 > EPS)) return true;
  if (Math.abs(o1) <= EPS && onSeg(a1[0], a1[2], a2[0], a2[2], b1[0], b1[2])) return true;
  if (Math.abs(o2) <= EPS && onSeg(a1[0], a1[2], a2[0], a2[2], b2[0], b2[2])) return true;
  if (Math.abs(o3) <= EPS && onSeg(b1[0], b1[2], b2[0], b2[2], a1[0], a1[2])) return true;
  if (Math.abs(o4) <= EPS && onSeg(b1[0], b1[2], b2[0], b2[2], a2[0], a2[2])) return true;
  return false;
}
function polylineSelfIntersectsXZ(pts) {
  const n = pts.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 2; j < n - 1; j++) {
      if (i === 0 && j === n - 2) continue; // ignore closed-ish touch of endpoints chain in degenerate cases
      if (segsIntersect(pts[i], pts[i + 1], pts[j], pts[j + 1])) return true;
    }
  }
  return false;
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

export function makeTerrainSampler(ctx) {
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
    // Conservative: avoid curved-channel bbox/validation conflicts for ground roads.
    const margin = (river.width ?? 10) * 0.5 + 30;
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
  const fixEnd = (arr, fromIdx, toIdx) => {
    if (!Array.isArray(arr) || arr.length < 2) return;
    let guard = 0;
    while (guard++ < 20) {
      if (fromIdx < 0 || toIdx < 0 || fromIdx >= arr.length || toIdx >= arr.length) return;
      const a = arr[fromIdx], b = arr[toIdx];
      if (!a || !b) return;
      const dx = b[0] - a[0], dz = b[2] - a[2], dy = b[1] - a[1];
      const h = Math.hypot(dx, dz);
      const slope = h < EPS ? 0 : Math.abs(dy) / h;
      if (slope <= maxSlope + EPS || h < 0.2) return;
      // move/insert intermediate point closer to fixed end to reduce slope
      if (Math.abs(toIdx - fromIdx) === 1) {
        const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
        // keep b fixed (endpoint side = toIdx), adjust mid from b side toward a
        const dirX = a[0] - b[0], dirZ = a[2] - b[2];
        const len = Math.hypot(dirX, dirZ) || 1;
        const needH = Math.abs(a[1] - b[1]) / maxSlope;
        const hh = Math.max(0.5, Math.min(needH, len - 0.1));
        mid[0] = b[0] + (dirX / len) * hh; mid[2] = b[2] + (dirZ / len) * hh;
        mid[1] = b[1] + Math.sign(a[1] - b[1]) * Math.min(Math.abs(a[1] - b[1]), maxSlope * hh);
        const insAt = Math.max(fromIdx, toIdx);
        arr.splice(insAt, 0, mid.map(v => Math.round(v * 100) / 100));
        report?.diagnostics.push(warn('endpoint_slope_repaired', stageId, `segment '${segId}' adjusted near endpoint for slope`, { id: segId }));
        return;
      } else {
        // pull adjacent interior toward feasible y
        const dir = toIdx > fromIdx ? 1 : -1;
        const adj = fromIdx + dir;
        if (adj < 0 || adj >= arr.length) return;
        const fixedPt = arr[toIdx];
        const inner = arr[adj];
        if (!fixedPt || !inner) return;
        const dx2 = inner[0] - fixedPt[0], dz2 = inner[2] - fixedPt[2];
        const h2 = Math.hypot(dx2, dz2);
        if (h2 < EPS) return;
        const maxDy = maxSlope * h2;
        const dy2 = clamp(inner[1] - fixedPt[1], -maxDy, maxDy);
        if (Math.abs(dy2 - (inner[1] - fixedPt[1])) > 1e-6) {
          inner[1] = Math.round((fixedPt[1] + dy2) * 100) / 100;
          report?.diagnostics.push(warn('endpoint_slope_repaired', stageId, `segment '${segId}' adjusted near endpoint for slope`, { id: segId }));
        } else return;
      }
    }
  };

  let p = path.map(pt => pt.slice());
  p[0] = start.slice();
  p[p.length - 1] = end.slice();
  fixEnd(p, 1, 0);
  fixEnd(p, p.length - 2, p.length - 1);

  let out = enforceSlope(p, maxSlope, stageId, segId, report);
  if (!Array.isArray(out) || out.length < 2) out = p;
  // enforceSlope may move endpoints; restore and locally re-fix adjacent slopes.
  out[0] = start.slice();
  out[out.length - 1] = end.slice();
  fixEnd(out, 1, 0);
  fixEnd(out, out.length - 2, out.length - 1);
  return out;
}

export function makeRoadSegment(id, from, to, path, width, type = 'local', layer = 'ground') {
  return {
    id, from, to, type, layer, path,
    lanes: [{ id: `${id}_lane_1`, direction: 'forward', width, type: 'vehicle' }],
    shoulderWidth: 1, sidewalk: false, surface: 'asphalt',
  };
}

export function buildProfiledSegment(ctx, segId, a2, b2, width, viaPoints = null) {
  const stageId = '2_transport';
  const sampler = makeTerrainSampler(ctx); // cheap to rebuild; deterministic
  const rivers = (ctx.hydrology?.rivers ?? ctx.input?.cityforge?.hydrology?.rivers ?? []);
  const pts2d = viaPoints && viaPoints.length ? [a2, ...viaPoints, b2] : [a2, b2];
  const filtered = pts2d.filter((p, i, arr) => i === 0 || Math.hypot(p.x - arr[i-1].x, p.z - arr[i-1].z) > 1);
  let path = buildRoutePath(filtered, sampler, rivers, stageId, ctx.report);
  if (path.length < 2) return null;
  path = enforceSlope(path, MAX_ROAD_SLOPE, stageId, segId, ctx.report);
  const start = [Math.round(a2.x * 100) / 100, Math.round(sampler.heightAt(a2.x, a2.z) * 100) / 100, Math.round(a2.z * 100) / 100];
  const end = [Math.round(b2.x * 100) / 100, Math.round(sampler.heightAt(b2.x, b2.z) * 100) / 100, Math.round(b2.z * 100) / 100];
  path = pinEndpoints(path, start, end, MAX_ROAD_SLOPE, stageId, segId, ctx.report);
  return path && path.length >= 2 ? path : null;
}

function subdivideAxisSegment(a, b, maxSlope) {
  // a,b: [x,y,z], axis-aligned in XZ. Returns array of points including a and b.
  const dx = b[0] - a[0], dz = b[2] - a[2], dy = b[1] - a[1];
  const run = Math.hypot(dx, dz);
  if (run < EPS) return [a.slice(), b.slice()];
  const lim = Math.max(maxSlope - 0.005, 0.05);
  const slope = Math.abs(dy) / run;
  const n = Math.max(1, Math.ceil(slope / lim - 1e-9));
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const y = a[1] + dy * t;
    // round y toward reducing slope relative to previous to stay within limit
    let yr = Math.round(y * 100) / 100;
    if (i > 0) {
      const prev = out[i - 1];
      const segRun = Math.hypot((a[0] + dx * t) - prev[0], (a[2] + dz * t) - prev[2]) || 1e-9;
      if (Math.abs(yr - prev[1]) / segRun > maxSlope - 1e-6) {
        yr = prev[1] + Math.sign(y - prev[1]) * (maxSlope - 0.002) * segRun;
        yr = Math.round(yr * 100) / 100;
      }
    }
    out.push([
      Math.round((a[0] + dx * t) * 100) / 100,
      yr,
      Math.round((a[2] + dz * t) * 100) / 100,
    ]);
  }
  // ensure last matches target y without violating slope
  const last = out[out.length - 1];
  const prev = out[out.length - 2];
  if (prev) {
    const segRun = Math.hypot(last[0]-prev[0], last[2]-prev[2]) || 1e-9;
    const want = Math.round(b[1] * 100) / 100;
    if (Math.abs(want - prev[1]) / segRun <= maxSlope - 1e-6) last[1] = want;
  } else {
    last[1] = Math.round(b[1] * 100) / 100;
  }
  return out;
}

function densifyAxisPolyline(points, maxSlope) {
  if (!Array.isArray(points) || points.length < 2) return points ?? [];
  const out = [points[0].slice()];
  for (let i = 0; i + 1 < points.length; i++) {
    const seg = subdivideAxisSegment(points[i], points[i + 1], maxSlope);
    for (let j = 1; j < seg.length; j++) out.push(seg[j]);
  }
  // remove near-duplicates
  const dedup = [out[0]];
  for (let i = 1; i < out.length; i++) {
    const p = out[i], l = dedup[dedup.length - 1];
    if (Math.hypot(p[0]-l[0], p[1]-l[1], p[2]-l[2]) > 0.01) dedup.push(p);
  }
  return dedup;
}

function isAxisAlignedPath(pts) {
  if (!Array.isArray(pts) || pts.length < 2) return false;
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1];
    if (Math.abs(a[0]-b[0]) > 0.01 && Math.abs(a[2]-b[2]) > 0.01) return false;
  }
  return true;
}

function pathMaxSlope(pts) {
  let m = 0;
  for (let i = 0; i + 1 < (pts?.length ?? 0); i++) {
    const a = pts[i], b = pts[i + 1];
    const run = Math.hypot(b[0]-a[0], b[2]-a[2]);
    if (run > EPS) m = Math.max(m, Math.abs(b[1]-a[1]) / run);
  }
  return m;
}

export function buildAxisAlignedTerrainPath(ax, az, bx, bz, sampler, rivers, step = 12) {
  const dx = bx - ax, dz = bz - az;
  const len = Math.hypot(dx, dz);
  if (len < EPS) return null;
  // Only axis-aligned in XZ for engine-valid road segments.
  if (Math.abs(dx) > 0.01 && Math.abs(dz) > 0.01) return null;
  const n = Math.max(1, Math.ceil(len / step));
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = ax + dx * t, z = az + dz * t;
    const y = sampler?.heightAt ? sampler.heightAt(x, z) : 0;
    pts.push([Math.round(x * 100) / 100, Math.round(y * 100) / 100, Math.round(z * 100) / 100]);
  }
  return enforceSlope(pts, MAX_ROAD_SLOPE, '2_transport', 'terrain_path', null);
}

export function isValidAxisAlignedTerrainPath(path, rivers = []) {
  if (!Array.isArray(path) || path.length < 2) return false;
  if (!isAxisAlignedPath(path)) return false;
  if (pathMaxSlope(path) > 0.3005) return false;
  for (let i = 0; i + 1 < path.length; i++) {
    const a = path[i], b = path[i + 1];
    if (segCrossesRiver(a[0], a[2], b[0], b[2], rivers)) return false;
  }
  // Conservative pointwise clearance against river corridors/channels (compiler-safe margin).
  for (const pt of path) {
    const near = riverMinDistXZAt(pt[0], pt[2], rivers);
    const rv = near.river;
    const margin = ((rv?.width ?? 10) * 0.5) + 35;
    if (near.d < margin) return false;
  }
  return true;
}

function riverCrossingsOnAxisLeg(ax, az, bx, bz, rivers, sampler, groundY) {
  // returns sorted list of {s (0..1), river, deckH}
  const out = [];
  const len = Math.hypot(bx - ax, bz - az);
  if (len < EPS) return out;
  for (const rv of rivers ?? []) {
    const path = rv?.path ?? [];
    if (path.length < 2) continue;
    const halfW = (Number.isFinite(rv.width) ? rv.width : 10) * 0.5;
    // find closest approach of this straight axis leg to river polyline
    let bestT = null, bestD = Infinity;
    const steps = Math.max(8, Math.ceil(len / 4));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = ax + (bx - ax) * t, pz = az + (bz - az) * t;
      const d = riverMinDistXZAt(px, pz, [rv]).d;
      if (d < bestD) { bestD = d; bestT = t; }
    }
    if (bestD <= halfW + 2.5 && bestT !== null) {
      const bed = groundY - (Number.isFinite(rv.depth) ? rv.depth : 2);
      const deckH = Math.max(groundY + 1.25, bed + 2.0);
      out.push({ s: bestT, river: rv, deckH });
    }
  }
  out.sort((a,b) => a.s - b.s);
  // merge close crossings
  const merged = [];
  for (const c of out) {
    const last = merged[merged.length - 1];
    if (last && Math.abs(c.s - last.s) * len < (c.river?.width ?? 10) + 8) {
      last.deckH = Math.max(last.deckH, c.deckH);
    } else merged.push({ ...c });
  }
  return merged;
}

function buildAxisRoutePath(pts2d, sampler, rivers, groundY, stageId, report) {
  // pts2d: [{x,z},...] with consecutive points axis-aligned in XZ.
  const maxSlope = Math.min(MAX_ROAD_SLOPE, 0.298);
  const out = [];
  const push = (x,y,z) => {
    const p = [Math.round(x*100)/100, Math.round(y*100)/100, Math.round(z*100)/100];
    const last = out[out.length - 1];
    if (!last || Math.hypot(last[0]-p[0], last[1]-p[1], last[2]-p[2]) > 0.01) out.push(p);
  };
  for (let i = 0; i + 1 < pts2d.length; i++) {
    const a = pts2d[i], b = pts2d[i + 1];
    const dx = b.x - a.x, dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    if (len < 0.5) continue;
    const yA = sampler.heightAt(a.x, a.z);
    const yB = sampler.heightAt(b.x, b.z);
    const crossings = riverCrossingsOnAxisLeg(a.x, a.z, b.x, b.z, rivers, sampler, groundY);
    // build key points along this leg
    const keys = [{ s: 0, y: yA }];
    for (const cr of crossings) {
      const halfSpan = clamp((cr.river.width ?? 10) * 0.5 + 30, 24, Math.max(24, len * 0.45));
      const ds = halfSpan / len;
      const s1 = clamp(cr.s - ds, 0.02, 0.98);
      const s2 = clamp(cr.s + ds, s1 + 0.02, 0.99);
      // ensure deck clears local terrain and river (terrain-following landscape)
      let maxTerrain = -Infinity;
      const steps = Math.max(2, Math.ceil(((s2 - s1) * len) / 4));
      for (let si = 0; si <= steps; si++) {
        const ts = s1 + (s2 - s1) * (si / steps);
        maxTerrain = Math.max(maxTerrain, sampler.heightAt(a.x + dx * ts, a.z + dz * ts));
      }
      const deckH = Math.max(cr.deckH, maxTerrain + BRIDGE_CLEARANCE, groundY + BRIDGE_DECK_MIN);
      keys.push({ s: s1, y: sampler.heightAt(a.x + dx*s1, a.z + dz*s1) });
      keys.push({ s: (s1 + cr.s) / 2, y: deckH });
      keys.push({ s: cr.s, y: deckH });
      keys.push({ s: (cr.s + s2) / 2, y: deckH });
      keys.push({ s: s2, y: sampler.heightAt(a.x + dx*s2, a.z + dz*s2) });
      report?.diagnostics.push(info('transport_bridge_profiled', stageId, `segment crossing river '${cr.river?.id ?? '?'}' bridged (deck ${deckH.toFixed(2)}m)`, { river: cr.river?.id ?? null, deckH }));
    }
    keys.push({ s: 1, y: yB });
    keys.sort((p,q)=>p.s-q.s);
    // dedupe/simplify by s
    const uniq = [keys[0]];
    for (let k=1;k<keys.length;k++){ if (keys[k].s - uniq[uniq.length-1].s > 1e-6) uniq.push(keys[k]); else uniq[uniq.length-1].y = Math.max(uniq[uniq.length-1].y, keys[k].y); }
    // enforce slope feasibility between consecutive keys by adjusting intermediate y (raise if needed)
    for (let k=0;k+1<uniq.length;k++){
      const ka=uniq[k], kb=uniq[k+1];
      const segRun = (kb.s-ka.s)*len;
      if (segRun < EPS) continue;
      const dy = kb.y-ka.y;
      const sl = Math.abs(dy)/segRun;
      if (sl > maxSlope + 1e-6) {
        // raise the lower endpoint locally by redistributing (prefer raising middle/deck/ends minimally)
        // simple: if going up too steep, raise kb? endpoints of whole route fixed; internal can be raised
        if (kb.s < 1 - 1e-6) kb.y = ka.y + Math.sign(dy || 1) * maxSlope * segRun;
        else if (ka.s > 1e-6) ka.y = kb.y - Math.sign(dy || 1) * maxSlope * segRun;
      }
    }
    // second pass forward/backward
    for (let k=0;k+1<uniq.length;k++){
      const ka=uniq[k], kb=uniq[k+1]; const segRun=(kb.s-ka.s)*len; if(segRun<EPS) continue;
      const maxUp=ka.y + maxSlope*segRun, maxDn=ka.y - maxSlope*segRun;
      if (kb.y>maxUp+1e-6 && kb.s < 1-1e-6) kb.y=maxUp;
      if (kb.y<maxDn-1e-6 && kb.s < 1-1e-6) kb.y=maxDn;
    }
    for (let k=uniq.length-1;k>0;k--){
      const ka=uniq[k-1], kb=uniq[k]; const segRun=(kb.s-ka.s)*len; if(segRun<EPS) continue;
      const minFromB=kb.y - maxSlope*segRun, maxFromB=kb.y + maxSlope*segRun;
      if (ka.y<minFromB-1e-6 && ka.s>1e-6) ka.y=minFromB;
      if (ka.y>maxFromB+1e-6 && ka.s>1e-6) ka.y=maxFromB;
    }
    for (let k=0;k+1<uniq.length;k++){
      const ka=uniq[k], kb=uniq[k+1]; const segRun=(kb.s-ka.s)*len; if(segRun<EPS) continue;
      const maxUp=ka.y + maxSlope*segRun, maxDn=ka.y - maxSlope*segRun;
      if (kb.y>maxUp+1e-6) kb.y=maxUp;
      if (kb.y<maxDn-1e-6) kb.y=maxDn;
    }
    // emit subdivided axis segment for each key interval
    for (let k=0;k+1<uniq.length;k++){
      const ka=uniq[k], kb=uniq[k+1];
      const axk=a.x+dx*ka.s, azk=a.z+dz*ka.s, bxk=a.x+dx*kb.s, bzk=a.z+dz*kb.s;
      const sub = densifyAxisPolyline([[axk,ka.y,azk],[bxk,kb.y,bzk]], maxSlope);
      for (let j=(out.length===0?0:1); j<sub.length; j++) push(sub[j][0],sub[j][1],sub[j][2]);
    }
  }
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
  const sampler = makeTerrainSampler(ctx);
  const width = clamp(Number.isFinite(tc.width) ? tc.width : 8, 4, 20);
  const groundY = ctx.input?.ground?.y ?? 0;
  const rivers = ctx.hydrology?.rivers ?? ctx.input?.cityforge?.hydrology?.rivers ?? [];

  // Main arterial spawn↔exit (axis-aligned L-shaped route, deterministic bend)
  const bend = rng() < 0.5 ? { x: exit.x, z: spawn.z } : { x: spawn.x, z: exit.z };
  const pts2d = [{ x: spawn.x, z: spawn.z }];
  if (Math.hypot(bend.x - spawn.x, bend.z - spawn.z) > 1 && Math.hypot(bend.x - exit.x, bend.z - exit.z) > 1) pts2d.push(bend);
  pts2d.push({ x: exit.x, z: exit.z });

  const densifyTerrainFollowing = (path) => {
    if (!Array.isArray(path) || path.length < 2) return path;
    const out = [path[0].slice()];
    for (let i = 0; i + 1 < path.length; i++) {
      const a = path[i], b = path[i + 1];
      const dx = b[0] - a[0], dz = b[2] - a[2], dy = b[1] - a[1];
      const len = Math.hypot(dx, dz);
      if (len < 0.5) { out.push(b.slice()); continue; }
      const ca = a[1] - sampler.heightAt(a[0], a[2]);
      const cb = b[1] - sampler.heightAt(b[0], b[2]);
      const isBridgeLike = ca >= 0.8 || cb >= 0.8;
      if (isBridgeLike) {
        // keep profiled bridge/ramp grade, but densify long segments for shape
        const n = Math.max(1, Math.ceil(len / 20));
        for (let k = 1; k <= n; k++) {
          const t = k / n;
          out.push([
            Math.round((a[0] + dx * t) * 100) / 100,
            Math.round((a[1] + dy * t) * 100) / 100,
            Math.round((a[2] + dz * t) * 100) / 100,
          ]);
        }
      } else {
        // terrain-following ground: sample relief along path
        const n = Math.max(1, Math.ceil(len / 12));
        for (let k = 1; k <= n; k++) {
          const t = k / n;
          const x = a[0] + dx * t, z = a[2] + dz * t;
          const y = sampler.heightAt(x, z);
          out.push([Math.round(x * 100) / 100, Math.round(y * 100) / 100, Math.round(z * 100) / 100]);
        }
      }
    }
    const smoothed = enforceSlope(out, MAX_ROAD_SLOPE, stageId, 'tr_main_densified', null);
    // preserve original endpoints
    if (smoothed.length >= 2) {
      smoothed[0] = path[0].slice();
      smoothed[smoothed.length - 1] = path[path.length - 1].slice();
    }
    return smoothed;
  };

  let mainPath = buildAxisRoutePath(pts2d, sampler, rivers, groundY, stageId, ctx.report);
  if (!mainPath || mainPath.length < 2) return;
  mainPath = densifyTerrainFollowing(mainPath);

  const splitMainSegments = (path) => {
    if (!Array.isArray(path) || path.length < 2) return [{ bridge: false, path: path ?? [] }];
    const terrainClear = (p) => p[1] - sampler.heightAt(p[0], p[2]);
    const riverSpan = (p) => {
      for (const rv of rivers ?? []) {
        // include full channel-hole bounding influence conservatively so ground segments don't clip river bbox in validation
        if (riverMinDistXZAt(p[0], p[2], [rv]).d <= (Number(rv.width) || 10) * 0.5 + 45) return true;
      }
      return false;
    };
    // Mark bridge spans: elevated above terrain, including ramp approaches near river crossings.
    const mark = path.map((p, i) => {
      const c = terrainClear(p);
      if (c >= 0.9) return true;
      if (riverSpan(p)) return true; // river crossing span (including ramps/approaches) must be bridge segment
      if (c >= 0.35) return true;
      return false;
    });
    // Expand to cover contiguous crossing ramps adjacent to marked span
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 1; i < path.length - 1; i++) {
        if (mark[i]) continue;
        if (!(mark[i - 1] || mark[i + 1])) continue;
        const c = terrainClear(path[i]);
        if (c >= 0.2 || riverSpan(path[i])) mark[i] = true;
      }
    }
    const parts = [];
    let cur = [path[0].slice()];
    let curBridge = !!mark[0];
    for (let i = 1; i < path.length; i++) {
      const b = !!mark[i];
      const p = path[i].slice();
      if (b === curBridge) {
        cur.push(p);
      } else {
        if (cur.length < 2) cur.push(p.slice());
        parts.push({ bridge: curBridge, path: cur });
        cur = [path[i - 1].slice(), p];
        curBridge = b;
      }
    }
    if (cur.length >= 2) parts.push({ bridge: curBridge, path: cur });
    else if (parts.length) parts[parts.length - 1].path.push(path[path.length - 1].slice());
    // merge tiny segments into neighbors
    const merged = [];
    const segLen = (pth) => { let l = 0; for (let i=1;i<pth.length;i++) l += Math.hypot(pth[i][0]-pth[i-1][0], pth[i][2]-pth[i-1][2]); return l; };
    for (const part of parts) {
      if (!merged.length) { merged.push(part); continue; }
      const prev = merged[merged.length - 1];
      if (part.bridge !== prev.bridge && segLen(part.path) < 6) {
        prev.path.push(...part.path.slice(1));
      } else merged.push(part);
    }
    return merged.length ? merged : [{ bridge: false, path: path.map(p=>p.slice()) }];
  };

  // M3 B2 prototype: deterministic overpass (эстакада + пандусы) on one suitable
  // straight ground segment of the main route. Elevates middle span with ramps
  // while preserving endpoints/connectivity; degrades (no-op) if infeasible.
  const tryApplyOverpassPrototype = (parts) => {
    const INTERCHANGE_CLEARANCE = 4.0;
    const RAMP_SLOPE = Math.min(MAX_ROAD_SLOPE, 0.12); // prototype ramp limit (validated < 0.31)
    const totalLen = (pth) => { let l = 0; for (let i=1;i<pth.length;i++) l += Math.hypot(pth[i][0]-pth[i-1][0], pth[i][2]-pth[i-1][2]); return l; };
    let chosen = null;
    for (let pi = 0; pi < parts.length; pi++) {
      const part = parts[pi];
      if (!part || part.bridge) continue;
      const path = part.path;
      if (!Array.isArray(path) || path.length < 2) continue;
      const len = totalLen(path);
      if (len < 90) continue;
      // Straight axis-aligned segment only (simple, robust profile).
      let straight = true;
      for (let i = 1; i < path.length; i++) {
        if (Math.abs(path[i][0] - path[0][0]) > 0.5 && Math.abs(path[i][2] - path[0][2]) > 0.5) { straight = false; break; }
      }
      if (!straight) continue;
      const a = path[0].slice(), b = path[path.length - 1].slice();
      const run = Math.hypot(b[0] - a[0], b[2] - a[2]);
      if (run < 90) continue;
      const ux = (b[0] - a[0]) / run, uz = (b[2] - a[2]) / run;
      // Skip if near/crossing rivers (bridge logic handles rivers separately).
      let nearRiver = false;
      for (let i = 0; i + 1 < path.length && !nearRiver; i++) {
        if (segCrossesRiver(path[i][0], path[i][2], path[i+1][0], path[i+1][2], rivers)) nearRiver = true;
      }
      if (nearRiver) continue;

      const aY = a[1] ?? sampler.heightAt(a[0], a[2]);
      const bY = b[1] ?? sampler.heightAt(b[0], b[2]);
      if (Math.abs(aY - bY) > 1.5) continue; // keep prototype simple/flat endpoints
      const endMaxY = Math.max(aY, bY);
      let midTerrain = -Infinity;
      const steps = Math.max(8, Math.ceil(run / 8));
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = a[0] + (b[0] - a[0]) * t, z = a[2] + (b[2] - a[2]) * t;
        midTerrain = Math.max(midTerrain, sampler.heightAt(x, z));
      }
      if (!Number.isFinite(midTerrain)) midTerrain = sampler.groundY;
      let deckH = Math.max(midTerrain + INTERCHANGE_CLEARANCE, endMaxY + 3.0, sampler.groundY + BRIDGE_DECK_MIN);
      let applied = null;
      let best = null;
      for (let iter = 0; iter < 6; iter++) {
        const riseA = Math.max(deckH - aY, 0);
        const riseB = Math.max(deckH - bY, 0);
        const baseA = clamp(Math.max(24, riseA / Math.max(RAMP_SLOPE, 0.05)), 24, run * 0.36);
        const baseB = clamp(Math.max(24, riseB / Math.max(RAMP_SLOPE, 0.05)), 24, run * 0.36);
        const shiftMax = Math.min(12, run * 0.12);
        const shifts = [0, -4, 4, -8, 8, -12, 12].filter(d => Math.abs(d) <= shiftMax + 1e-9);
        for (const shift of shifts) {
          let rampLenA = clamp(baseA + shift, 24, run * 0.4);
          let rampLenB = clamp(baseB - shift, 24, run * 0.4);
          if (run - rampLenA - rampLenB < 20) continue;
          if ((deckH - aY) > RAMP_SLOPE * rampLenA + 1e-6) rampLenA = clamp((deckH - aY) / Math.max(RAMP_SLOPE, 0.05), 24, run * 0.4);
          if ((deckH - bY) > RAMP_SLOPE * rampLenB + 1e-6) rampLenB = clamp((deckH - bY) / Math.max(RAMP_SLOPE, 0.05), 24, run * 0.4);
          if (run - rampLenA - rampLenB < 20) continue;
          if ((deckH - aY) / Math.max(rampLenA, 1e-6) > RAMP_SLOPE + 1e-6) continue;
          if ((deckH - bY) / Math.max(rampLenB, 1e-6) > RAMP_SLOPE + 1e-6) continue;

          const r1 = [a[0] + ux * rampLenA, a[2] + uz * rampLenA];
          const r2 = [b[0] - ux * rampLenB, b[2] - uz * rampLenB];
          const yR1 = aY + Math.sign(deckH - aY) * Math.min(Math.abs(deckH - aY), RAMP_SLOPE * rampLenA);
          const yR2 = bY + Math.sign(deckH - bY) * Math.min(Math.abs(deckH - bY), RAMP_SLOPE * rampLenB);
          const pts = [
            [a[0], aY, a[2]],
            [Math.round(r1[0]*100)/100, Math.round(yR1*100)/100, Math.round(r1[1]*100)/100],
            [Math.round(((r1[0]+r2[0])/2)*100)/100, Math.round(deckH*100)/100, Math.round(((r1[1]+r2[1])/2)*100)/100],
            [Math.round(r2[0]*100)/100, Math.round(yR2*100)/100, Math.round(r2[1]*100)/100],
            [b[0], bY, b[2]],
          ];
          // Trial without polluting report; apply only if clean/valid.
          let prof = enforceSlope(pts.map(p => p.slice()), RAMP_SLOPE, stageId, 'tr_interchange_overpass', null);
          prof = pinEndpoints(prof, [a[0], aY, a[2]], [b[0], bY, b[2]], RAMP_SLOPE, stageId, 'tr_interchange_overpass', null);
          if (!Array.isArray(prof) || prof.length < 2) continue;
          if (pathMaxSlope(prof) > RAMP_SLOPE + 0.015) continue;
          const midProfY = prof.reduce((m, p) => Math.max(m, p[1] ?? -Infinity), -Infinity);
          if (!(midProfY > endMaxY + 1.5)) continue;

          // Best-effort clearance repair: keep feasible candidate, try to raise deck if span too close to terrain.
          let minClear = Infinity, checked = 0;
          for (let i = 0; i + 1 < prof.length; i++) {
            const pa = prof[i], pb = prof[i + 1];
            const dxs = (pb[0] ?? 0) - (pa[0] ?? 0), dzs = (pb[2] ?? 0) - (pa[2] ?? 0);
            const segLen = Math.hypot(dxs, dzs);
            const st = Math.max(1, Math.ceil(segLen / 6));
            for (let ss = 0; ss <= st; ss++) {
              const tt = ss / st;
              const sx = (pa[0] ?? 0) + dxs * tt, sz = (pa[2] ?? 0) + dzs * tt;
              const sy = (pa[1] ?? 0) + ((pb[1] ?? 0) - (pa[1] ?? 0)) * tt;
              if (sy <= endMaxY + 1.0) continue;
              minClear = Math.min(minClear, sy - sampler.heightAt(sx, sz));
              checked++;
            }
          }
          const candProf = { prof, deckH: midProfY, rampLen: +(Math.max(rampLenA, rampLenB).toFixed(2)), minClear: (checked > 0 && Number.isFinite(minClear)) ? minClear : Infinity };
          if (!best || candProf.minClear > best.minClear + 1e-6) best = candProf;
          if (candProf.minClear >= 1.5) { applied = candProf; break; }
        }
        if (applied) break;
        if (!best) break;
        const nextDeck = Math.round((deckH + Math.max(0.2, 1.5 - best.minClear)) * 100) / 100;
        if (nextDeck <= deckH + 1e-9) break;
        deckH = nextDeck;
      }
      if (!applied) continue; // require sufficient clearance (>=1.5m) to avoid low-clearance interchanges
      const cand = { pi, part, applied, run };
      if (!chosen
        || (cand.applied.minClear >= 1.5 && !(chosen.applied.minClear >= 1.5))
        || ((cand.applied.minClear >= 1.5) === (chosen.applied.minClear >= 1.5) && cand.applied.minClear > chosen.applied.minClear + 1e-6)) {
        chosen = cand;
      }
    }
    if (!chosen) return false;
    const { pi, part, applied, run } = chosen;
    part.path = applied.prof.map(p => p.slice());
    part.bridge = true;
    part.interchange = 'overpass';
    ctx.report.diagnostics.push(info('transport_interchange_overpass', stageId, 'applied overpass interchange prototype on main route segment', {
      segmentIndex: pi, deckH: +applied.deckH.toFixed(2), rampLen: +applied.rampLen.toFixed(2), len: +run.toFixed(2),
    }));
    return true; // one prototype per generation (deterministic, low risk)
  };

  const mainParts = splitMainSegments(mainPath);
  tryApplyOverpassPrototype(mainParts);
  const nodes = [
    { id: 'tr_n_spawn', position: mainPath[0].slice(), layer: 'ground' },
  ];
  const segments = [];
  let exitNode = null;
  for (let i = 0; i < mainParts.length; i++) {
    const part = mainParts[i];
    const fromId = i === 0 ? 'tr_n_spawn' : `tr_n_m${i}`;
    let toId;
    if (i === mainParts.length - 1) {
      toId = 'tr_n_exit';
      exitNode = { id: 'tr_n_exit', position: part.path[part.path.length - 1].slice(), layer: 'ground' };
      nodes.push(exitNode);
    } else {
      toId = `tr_n_m${i + 1}`;
      nodes.push({ id: toId, position: part.path[part.path.length - 1].slice(), layer: part.bridge ? 'elevated' : 'ground' });
    }
    const segId = mainParts.length === 1 ? 'tr_main' : (part.bridge ? `tr_main_br_${i + 1}` : `tr_main_g_${i + 1}`);
    segments.push(makeRoadSegment(segId, fromId, toId, part.path.map(p => p.slice()), width, 'arterial', part.bridge ? 'elevated' : 'ground'));
  }
  if (!exitNode) {
    exitNode = { id: 'tr_n_exit', position: mainPath[mainPath.length - 1].slice(), layer: 'ground' };
    nodes.push(exitNode);
  }
  const spawnNode = nodes.find(n => n.id === 'tr_n_spawn');

  const requested = clamp(Number.isInteger(tc.branches) ? tc.branches : 2, 0, 4);
  let made = 0;
  const tryAddSpur = (idBase, fromNode, fromPos2, toPos2, type = 'local') => {
    if (made >= requested) return false;
    const dx = toPos2.x - fromPos2.x, dz = toPos2.z - fromPos2.z;
    if (Math.abs(dx) > 0.5 && Math.abs(dz) > 0.5) return false; // axis-aligned only
    const path = buildAxisRoutePath([fromPos2, toPos2], sampler, rivers, groundY, stageId, ctx.report);
    if (!path || path.length < 2) return false;
    if (!isAxisAlignedPath(path) || pathMaxSlope(path) > 0.3005) return false;
    // avoid overlapping main path except endpoint
    const crossesRiver = !!segCrossesRiver(fromPos2.x, fromPos2.z, toPos2.x, toPos2.z, rivers);
    if (crossesRiver) return false;
    const toId = `${idBase}_n`;
    const segId = `${idBase}_r`;
    nodes.push({ id: toId, position: path[path.length - 1].slice(), layer: 'ground' });
    segments.push(makeRoadSegment(segId, fromNode.id, toId, path, Math.max(6, width - 2), type));
    made++;
    return true;
  };

  const buildTerrainPath = (ax, az, bx, bz, step = 12) => {
    const dx = bx - ax, dz = bz - az;
    const len = Math.hypot(dx, dz);
    if (len < EPS) return null;
    const n = Math.max(1, Math.ceil(len / step));
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = ax + dx * t, z = az + dz * t;
      const y = sampler.heightAt(x, z);
      pts.push([Math.round(x * 100) / 100, Math.round(y * 100) / 100, Math.round(z * 100) / 100]);
    }
    return enforceSlope(pts, MAX_ROAD_SLOPE, stageId, 'terrain_path', null);
  };
  const isTerrainPathValid = (path) => {
    if (!Array.isArray(path) || path.length < 2) return false;
    if (!isAxisAlignedPath(path)) return false;
    if (pathMaxSlope(path) > 0.3005) return false;
    for (let i = 0; i + 1 < path.length; i++) {
      const a = path[i], b = path[i + 1];
      if (segCrossesRiver(a[0], a[2], b[0], b[2], rivers)) return false;
    }
    // Conservative pointwise clearance against river corridors/channels to stay compiler-safe.
    for (const pt of path) {
      const near = riverMinDistXZAt(pt[0], pt[2], rivers);
      const rv = near.river;
      if (!rv) continue;
      const margin = ((rv?.width ?? 10) * 0.5) + 35;
      if (near.d < margin) return false;
    }
    return true;
  };

  // Deterministic terrain-following spurs from route endpoints (best-effort, engine-valid).
  const half = (ctx.meta.worldBounds?.size ?? ctx.input?.ground?.size ?? 256) / 2;
  const spurLen = clamp(Math.round(half * 0.15), 50, 96);
  const s0 = { x: spawnNode.position[0], z: spawnNode.position[2], y: spawnNode.position[1] };
  const s1 = { x: exitNode.position[0], z: exitNode.position[2], y: exitNode.position[1] };
  const candSpurs = [
    { base: 'tr_sp1', from: spawnNode, a: s0, b: { x: s0.x + Math.sign(0 - s0.x || 1) * spurLen, z: s0.z } },
    { base: 'tr_sp2', from: spawnNode, a: s0, b: { x: s0.x, z: s0.z + Math.sign(0 - s0.z || 1) * spurLen } },
    { base: 'tr_sp3', from: exitNode, a: s1, b: { x: s1.x + Math.sign(0 - s1.x || 1) * spurLen, z: s1.z } },
    { base: 'tr_sp4', from: exitNode, a: s1, b: { x: s1.x, z: s1.z + Math.sign(0 - s1.z || 1) * spurLen } },
  ];
  for (let i = candSpurs.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [candSpurs[i], candSpurs[j]] = [candSpurs[j], candSpurs[i]]; }
  for (const c of candSpurs) {
    if (made >= requested) break;
    if (Math.abs(c.b.x) > half - 2 || Math.abs(c.b.z) > half - 2) continue;
    const path = buildTerrainPath(c.a.x, c.a.z, c.b.x, c.b.z, 12);
    if (!isTerrainPathValid(path)) continue;
    const toId = `${c.base}_n`;
    const segId = `${c.base}_r`;
    nodes.push({ id: toId, position: path[path.length - 1].slice(), layer: 'ground' });
    segments.push(makeRoadSegment(segId, c.from.id, toId, path, Math.max(6, width - 2), 'local'));
    made++;
  }

  // Try to connect two terrain-following spurs from the same node into a local block (axis-aligned L via corner).
  if (made >= 2) {
    const spurSegs = segments.filter(s => /^tr_sp\d+_r$/.test(s.id) && s.from === 'tr_n_spawn');
    if (spurSegs.length >= 2) {
      const a = spurSegs[0], b = spurSegs[1];
      const na = nodes.find(n => n.id === a.to), nb = nodes.find(n => n.id === b.to);
      if (na && nb) {
        const pa = { x: na.position[0], z: na.position[2] }, pb = { x: nb.position[0], z: nb.position[2] };
        const corners = [
          { id: 'tr_spc1_n', x: pa.x, z: pb.z },
          { id: 'tr_spc2_n', x: pb.x, z: pa.z },
        ];
        for (const c of corners) {
          if (segments.some(s => s.id === 'tr_spc_a' || s.id === 'tr_spc_b')) break;
          if (Math.abs(c.x) > half - 2 || Math.abs(c.z) > half - 2) continue;
          const legs = [
            buildTerrainPath(pa.x, pa.z, c.x, c.z, 12),
            buildTerrainPath(pb.x, pb.z, c.x, c.z, 12),
          ];
          if (!isTerrainPathValid(legs[0]) || !isTerrainPathValid(legs[1])) continue;
          const cPos = legs[0][legs[0].length - 1].slice();
          const existing = nodes.find(n => Math.hypot(n.position[0] - cPos[0], n.position[2] - cPos[2]) < 0.5);
          const cornerNodeId = existing ? existing.id : c.id;
          if (!existing) nodes.push({ id: cornerNodeId, position: cPos, layer: 'ground' });
          const mk = (id, from, to, path) => makeRoadSegment(id, from, to, path, Math.max(6, width - 2), 'local');
          segments.push(mk('tr_spc_a', na.id, cornerNodeId, legs[0]));
          segments.push(mk('tr_spc_b', nb.id, cornerNodeId, legs[1]));
          made += 2;
          ctx.report.diagnostics.push(info('transport_spur_loop', stageId, 'added local spur connector block', { corner: cornerNodeId }));
          break;
        }
      }
    }
  }

  // Expand connected network with terrain-following branches from existing ground nodes.
  const branchBudget = Math.min(Math.max(requested + 40, 40), 64);
  const tryAddTerrainSeg = (fromNode, dx, dz, tag) => {
    if (made >= branchBudget) return false;
    const fx = fromNode.position[0], fz = fromNode.position[2];
    const tx = Math.round((fx + dx) * 100) / 100;
    const tz = Math.round((fz + dz) * 100) / 100;
    if (Math.abs(tx) > half - 2 || Math.abs(tz) > half - 2) return false;
    const path = buildTerrainPath(fx, fz, tx, tz, 12);
    if (!isTerrainPathValid(path)) return false;
    const end = path[path.length - 1];
    if (Math.hypot(end[0] - fx, end[2] - fz) < 8) return false;
    // avoid duplicate edge
    let toNode = nodes.find(n => Math.hypot(n.position[0] - end[0], n.position[2] - end[2]) < 0.5);
    if (toNode && segments.some(s => (s.from === fromNode.id && s.to === toNode.id) || (s.from === toNode.id && s.to === fromNode.id))) return false;
    // avoid close overlaps with unrelated segments
    const segTooClose = segments.some(s => {
      if (s.from === fromNode.id || s.to === fromNode.id) return false;
      const sp = pathPoints(s); if (!sp) return false;
      for (let i = 0; i + 1 < sp.length; i++) {
        const mx = (end[0] + fx) / 2, mz = (end[2] + fz) / 2;
        const ax = sp[i][0], az = sp[i][2], bx = sp[i+1][0], bz = sp[i+1][2];
        const abx = bx-ax, abz=bz-az, apx=mx-ax, apz=mz-az;
        const ab2 = abx*abx+abz*abz || 1e-12;
        const t = Math.max(0, Math.min(1, (apx*abx+apz*abz)/ab2));
        const d = Math.hypot(mx-(ax+abx*t), mz-(az+abz*t));
        if (d < 5) return true;
      }
      return false;
    });
    if (segTooClose) return false;
    if (!toNode) {
      const nid = `tr_gn_${nodes.length + 1}`;
      toNode = { id: nid, position: end.slice(), layer: 'ground' };
      nodes.push(toNode);
    }
    const sid = `tr_gb_${segments.length + 1}`;
    segments.push(makeRoadSegment(sid, fromNode.id, toNode.id, path, Math.max(6, width - 2), 'local'));
    made++;
    ctx.report.diagnostics.push(info('transport_branch', stageId, 'added connected terrain-following branch', { id: sid, from: fromNode.id, to: toNode.id, tag }));
    return true;
  };

  const tryAddTerrainL = (fromNode, dx, dz, tag) => {
    if (made + 1 >= branchBudget) return false;
    const fx = fromNode.position[0], fz = fromNode.position[2];
    const tx = Math.round((fx + dx) * 100) / 100;
    const tz = Math.round((fz + dz) * 100) / 100;
    if (Math.abs(tx) > half - 2 || Math.abs(tz) > half - 2) return false;
    if (Math.abs(dx) < 1 || Math.abs(dz) < 1) return false;
    const corners = [
      { x: tx, z: fz },
      { x: fx, z: tz },
    ];
    for (const c of corners) {
      if (made + 1 >= branchBudget) return false;
      if (Math.abs(c.x) > half - 2 || Math.abs(c.z) > half - 2) continue;
      const pathA = buildTerrainPath(fx, fz, c.x, c.z, 12);
      const pathB = buildTerrainPath(c.x, c.z, tx, tz, 12);
      if (!isTerrainPathValid(pathA) || !isTerrainPathValid(pathB)) continue;
      const cEnd = pathA[pathA.length - 1];
      const tEnd = pathB[pathB.length - 1];
      if (Math.hypot(tEnd[0] - fx, tEnd[2] - fz) < 12) continue;
      // avoid duplicate edges and close overlaps
      let cNode = nodes.find(n => Math.hypot(n.position[0] - cEnd[0], n.position[2] - cEnd[2]) < 0.5);
      let tNode = nodes.find(n => Math.hypot(n.position[0] - tEnd[0], n.position[2] - tEnd[2]) < 0.5);
      const edgeExists = (aId, bId) => segments.some(s => (s.from === aId && s.to === bId) || (s.from === bId && s.to === aId));
      if (cNode && tNode && (edgeExists(fromNode.id, cNode.id) || edgeExists(cNode.id, tNode.id))) continue;
      const midx = (fx + tx) / 2, midz = (fz + tz) / 2;
      const tooClose = segments.some(s => {
        if (s.from === fromNode.id || s.to === fromNode.id) return false;
        const sp = pathPoints(s); if (!sp) return false;
        for (let i = 0; i + 1 < sp.length; i++) {
          const ax = sp[i][0], az = sp[i][2], bx = sp[i + 1][0], bz = sp[i + 1][2];
          const abx = bx - ax, abz = bz - az, apx = midx - ax, apz = midz - az;
          const ab2 = abx * abx + abz * abz || 1e-12;
          const tt = Math.max(0, Math.min(1, (apx * abx + apz * abz) / ab2));
          const d = Math.hypot(midx - (ax + abx * tt), midz - (az + abz * tt));
          if (d < 4.5) return true;
        }
        return false;
      });
      if (tooClose) continue;
      if (!cNode) { cNode = { id: `tr_gn_${nodes.length + 1}`, position: cEnd.slice(), layer: 'ground' }; nodes.push(cNode); }
      if (!tNode) { tNode = { id: `tr_gn_${nodes.length + 1}`, position: tEnd.slice(), layer: 'ground' }; nodes.push(tNode); }
      if (!edgeExists(fromNode.id, cNode.id)) {
        const sidA = `tr_gb_${segments.length + 1}`;
        segments.push(makeRoadSegment(sidA, fromNode.id, cNode.id, pathA, Math.max(6, width - 2), 'local'));
        made++;
      }
      if (made >= branchBudget) return true;
      if (!edgeExists(cNode.id, tNode.id)) {
        const sidB = `tr_gb_${segments.length + 1}`;
        segments.push(makeRoadSegment(sidB, cNode.id, tNode.id, pathB, Math.max(6, width - 2), 'local'));
        made++;
      }
      ctx.report.diagnostics.push(info('transport_branch_l', stageId, 'added connected terrain-following L branch', { from: fromNode.id, to: tNode.id, via: cNode.id, tag }));
      return true;
    }
    return false;
  };

  const stepLens = [96, 80, 64, 48, 40];
  const dirs4 = [[1,0],[-1,0],[0,1],[0,-1]];
  for (let pass = 0; pass < 6 && made < branchBudget; pass++) {
    const groundNodes = nodes.filter(n => n.layer !== 'elevated');
    // stable order by id for determinism
    groundNodes.sort((a,b)=>String(a.id).localeCompare(String(b.id)));
    for (const n of groundNodes) {
      if (made >= branchBudget) break;
      for (const len of stepLens) {
        if (made >= branchBudget) break;
        for (const [dx,dz] of dirs4) {
          if (made >= branchBudget) break;
          tryAddTerrainSeg(n, dx*len, dz*len, `p${pass}`);
        }
      }
      // try L-branches to reach farther/diagonal areas
      if (made >= branchBudget) break;
      for (const len of [112, 96, 80, 64]) {
        if (made >= branchBudget) break;
        for (const [dx, dz] of [[1,1],[1,-1],[-1,1],[-1,-1]]) {
          if (made >= branchBudget) break;
          tryAddTerrainL(n, dx * len, dz * len, `lp${pass}`);
        }
      }
    }
  }

  // Try to connect nearby nodes/leaves with axis-aligned terrain-following segments (improves mesh connectivity).
  const connectBudget = 24;
  let connected = 0;
  const degNow = () => {
    const d = Object.create(null);
    for (const n of nodes) d[n.id] = 0;
    for (const s of segments) { d[s.from] = (d[s.from] || 0) + 1; d[s.to] = (d[s.to] || 0) + 1; }
    return d;
  };
  const candidatesNodes = () => nodes.filter(n => n.layer !== 'elevated').sort((a,b)=>String(a.id).localeCompare(String(b.id)));
  for (let pass = 0; pass < 3 && connected < connectBudget; pass++) {
    const deg = degNow();
    const list = candidatesNodes();
    for (let i = 0; i < list.length && connected < connectBudget; i++) {
      const a = list[i];
      if ((deg[a.id] || 0) > 5) continue;
      for (let j = i + 1; j < list.length && connected < connectBudget; j++) {
        const b = list[j];
        if (a.id === b.id) continue;
        if (segments.some(s => (s.from === a.id && s.to === b.id) || (s.from === b.id && s.to === a.id))) continue;
        const dx = b.position[0] - a.position[0];
        const dz = b.position[2] - a.position[2];
        const manhattan = Math.abs(dx) + Math.abs(dz);
        if (manhattan < 24 || manhattan > 200) continue;
        // prefer axis-aligned direct or L-shape via corner if aligned
        const tryPath = (pts2) => {
          let path = [];
          if (pts2.length === 2) {
            path = buildTerrainPath(pts2[0].x, pts2[0].z, pts2[1].x, pts2[1].z, 12);
          } else {
            const p1 = buildTerrainPath(pts2[0].x, pts2[0].z, pts2[1].x, pts2[1].z, 12);
            const p2 = buildTerrainPath(pts2[1].x, pts2[1].z, pts2[2].x, pts2[2].z, 12);
            if (!p1 || !p2) return null;
            path = p1.concat(p2.slice(1));
            path = enforceSlope(path, MAX_ROAD_SLOPE, stageId, 'tr_conn', null);
          }
          if (!isTerrainPathValid(path)) return null;
          // avoid close overlaps with unrelated segments
          const midx = (a.position[0] + b.position[0]) / 2, midz = (a.position[2] + b.position[2]) / 2;
          const tooClose = segments.some(s => {
            if (s.from === a.id || s.to === a.id || s.from === b.id || s.to === b.id) return false;
            const sp = pathPoints(s); if (!sp) return false;
            for (let k = 0; k + 1 < sp.length; k++) {
              const ax = sp[k][0], az = sp[k][2], bx = sp[k+1][0], bz = sp[k+1][2];
              const abx = bx-ax, abz=bz-az, apx=midx-ax, apz=midz-az;
              const ab2 = abx*abx+abz*abz || 1e-12;
              const t = Math.max(0, Math.min(1, (apx*abx+apz*abz)/ab2));
              const d = Math.hypot(midx-(ax+abx*t), midz-(az+abz*t));
              if (d < 4.5) return true;
            }
            return false;
          });
          if (tooClose) return null;
          return path;
        };
        let path = null;
        if (Math.abs(dx) < 0.01 || Math.abs(dz) < 0.01) {
          path = tryPath([{ x: a.position[0], z: a.position[2] }, { x: b.position[0], z: b.position[2] }]);
        } else {
          // try L connections via corners, deterministic order
          const c1 = { x: b.position[0], z: a.position[2] };
          const c2 = { x: a.position[0], z: b.position[2] };
          path = tryPath([{ x: a.position[0], z: a.position[2] }, c1, { x: b.position[0], z: b.position[2] }])
            || tryPath([{ x: a.position[0], z: a.position[2] }, c2, { x: b.position[0], z: b.position[2] }]);
        }
        if (!path) continue;
        const sid = `tr_gc_${segments.length + 1}`;
        segments.push(makeRoadSegment(sid, a.id, b.id, path, Math.max(6, width - 2), 'local'));
        made++;
        connected++;
        deg[a.id] = (deg[a.id] || 0) + 1;
        deg[b.id] = (deg[b.id] || 0) + 1;
        ctx.report.diagnostics.push(info('transport_connector', stageId, 'added terrain-following connector between existing nodes', { id: sid, from: a.id, to: b.id }));
      }
    }
  }

  // Edge outreach: extend network toward map bounds where uncovered.
  const edgeBudget = 16;
  let edgeAdded = 0;
  const edgeTargets = [
    { dx: -1, dz: 0, edge: -half + 8, axis: 'x' },
    { dx: 1, dz: 0, edge: half - 8, axis: 'x' },
    { dx: 0, dz: -1, edge: -half + 8, axis: 'z' },
    { dx: 0, dz: 1, edge: half - 8, axis: 'z' },
  ];
  for (const et of edgeTargets) {
    if (edgeAdded >= edgeBudget) break;
    const groundNodes = nodes.filter(n => n.layer !== 'elevated').slice().sort((a, b) => {
      const av = et.axis === 'x' ? a.position[0] : a.position[2];
      const bv = et.axis === 'x' ? b.position[0] : b.position[2];
      return et.dx + et.dz < 0 ? (av - bv) : (bv - av);
    });
    for (const n of groundNodes.slice(0, 12)) {
      if (edgeAdded >= edgeBudget) break;
      const fx = n.position[0], fz = n.position[2];
      const cur = et.axis === 'x' ? fx : fz;
      if ((et.dx + et.dz < 0 && cur <= et.edge + 20) || (et.dx + et.dz > 0 && cur >= et.edge - 20)) continue;
      const len = 96;
      const tx = Math.round((fx + et.dx * len) * 100) / 100;
      const tz = Math.round((fz + et.dz * len) * 100) / 100;
      if (Math.abs(tx) > half - 2 || Math.abs(tz) > half - 2) continue;
      // try straight, else L toward edge
      let added = false;
      const path = buildTerrainPath(fx, fz, tx, tz, 12);
      if (isTerrainPathValid(path)) {
        const end = path[path.length - 1];
        if (Math.hypot(end[0] - fx, end[2] - fz) >= 8) {
          let toNode = nodes.find(nn => Math.hypot(nn.position[0] - end[0], nn.position[2] - end[2]) < 0.5);
          const edgeExists = toNode && segments.some(s => (s.from === n.id && s.to === toNode.id) || (s.from === toNode.id && s.to === n.id));
          if (!edgeExists) {
            if (!toNode) { toNode = { id: `tr_gn_${nodes.length + 1}`, position: end.slice(), layer: 'ground' }; nodes.push(toNode); }
            const sid = `tr_gb_${segments.length + 1}`;
            segments.push(makeRoadSegment(sid, n.id, toNode.id, path, Math.max(6, width - 2), 'local'));
            made++; edgeAdded++; added = true;
            ctx.report.diagnostics.push(info('transport_edge_branch', stageId, 'added edge outreach branch', { id: sid, from: n.id, to: toNode.id }));
          }
        }
      }
      if (!added && edgeAdded < edgeBudget) {
        // try small L toward edge
        const perp = et.axis === 'x' ? [[0, 1], [0, -1]] : [[1, 0], [-1, 0]];
        for (const [px, pz] of perp) {
          if (edgeAdded >= edgeBudget) break;
          const cx = fx + et.dx * 64 + px * 48;
          const cz = fz + et.dz * 64 + pz * 48;
          if (Math.abs(cx) > half - 2 || Math.abs(cz) > half - 2) continue;
          const pathA = buildTerrainPath(fx, fz, cx, cz, 12);
          const pathB = buildTerrainPath(cx, cz, Math.round((cx + et.dx * 48) * 100) / 100, Math.round((cz + et.dz * 48) * 100) / 100, 12);
          if (!isTerrainPathValid(pathA) || !isTerrainPathValid(pathB)) continue;
          const cEnd = pathA[pathA.length - 1], tEnd = pathB[pathB.length - 1];
          let cNode = nodes.find(nn => Math.hypot(nn.position[0] - cEnd[0], nn.position[2] - cEnd[2]) < 0.5);
          let tNode = nodes.find(nn => Math.hypot(nn.position[0] - tEnd[0], nn.position[2] - tEnd[2]) < 0.5);
          const edgeExists = (aId, bId) => segments.some(s => (s.from === aId && s.to === bId) || (s.from === bId && s.to === aId));
          if (!cNode) { cNode = { id: `tr_gn_${nodes.length + 1}`, position: cEnd.slice(), layer: 'ground' }; nodes.push(cNode); }
          if (!tNode) { tNode = { id: `tr_gn_${nodes.length + 1}`, position: tEnd.slice(), layer: 'ground' }; nodes.push(tNode); }
          if (edgeExists(n.id, cNode.id) && edgeExists(cNode.id, tNode.id)) continue;
          if (!edgeExists(n.id, cNode.id)) { segments.push(makeRoadSegment(`tr_gb_${segments.length + 1}`, n.id, cNode.id, pathA, Math.max(6, width - 2), 'local')); made++; edgeAdded++; }
          if (edgeAdded < edgeBudget && !edgeExists(cNode.id, tNode.id)) { segments.push(makeRoadSegment(`tr_gb_${segments.length + 1}`, cNode.id, tNode.id, pathB, Math.max(6, width - 2), 'local')); made++; edgeAdded++; }
          ctx.report.diagnostics.push(info('transport_edge_branch', stageId, 'added edge outreach L branch', { from: n.id, to: tNode.id }));
          added = true;
          break;
        }
      }
      if (added) break; // one extension per edge direction per pass attempt
    }
  }

  // Coverage pass: extend network toward underserved interior areas (improves district road access).
  const roadDistAt = (x, z) => {
    let best = Infinity;
    for (const s of segments) {
      const pts = pathPoints(s); if (!pts) continue;
      for (let i = 0; i + 1 < pts.length; i++) best = Math.min(best, pointSegDistXZ(x, z, pts[i][0], pts[i][2], pts[i + 1][0], pts[i + 1][2]));
    }
    return best;
  };
  const nearestGroundNode = (x, z) => {
    let best = null, bestD = Infinity;
    for (const n of nodes) {
      if (n.layer === 'elevated') continue;
      const p = n.position || [0, 0, 0];
      const d = Math.hypot((p[0] ?? 0) - x, (p[2] ?? 0) - z);
      if (d < bestD) { bestD = d; best = n; }
    }
    return best ? { node: best, d: bestD } : null;
  };
  const tryAddCoverageToward = (tx, tz, tag) => {
    const txx = Math.round(clamp(tx, -half + 12, half - 12) * 100) / 100;
    const tzz = Math.round(clamp(tz, -half + 12, half - 12) * 100) / 100;
    if (roadDistAt(txx, tzz) < 110) return false;
    // Try several nearest ground nodes (greedy frontier), deterministic order.
    const candidates = nodes
      .filter(n => n.layer !== 'elevated')
      .map(n => {
        const p = n.position || [0, 0, 0];
        return { node: n, d: Math.hypot((p[0] ?? 0) - txx, (p[2] ?? 0) - tzz) };
      })
      .sort((a, b) => a.d - b.d || String(a.node.id).localeCompare(String(b.node.id)))
      .slice(0, 12);
    for (const near of candidates) {
      if (near.d < 20) continue;
      const fx = near.node.position[0], fz = near.node.position[2];
      const dx = txx - fx, dz = tzz - fz;
      const adx = Math.abs(dx), adz = Math.abs(dz);
      const steps = near.d > 220 ? [80, 64, 48, 40] : near.d > 140 ? [64, 48, 40, 32] : [48, 40, 32];
      // Prefer axis-aligned moves (and diagonal fallback) that reduce distance to target.
      const dirOptions = [];
      if (adx >= adz) {
        dirOptions.push([Math.sign(dx) || 1, 0], [0, Math.sign(dz) || 1], [Math.sign(dx) || 1, Math.sign(dz) || 1]);
      } else {
        dirOptions.push([0, Math.sign(dz) || 1], [Math.sign(dx) || 1, 0], [Math.sign(dx) || 1, Math.sign(dz) || 1]);
      }
      const trySingle = (sx, sz, ex, ez) => {
        if (Math.hypot(ex - sx, ez - sz) < 16) return null;
        const path = buildTerrainPath(sx, sz, ex, ez, 12);
        if (!isTerrainPathValid(path)) return null;
        const end = path[path.length - 1];
        if (roadDistAt(end[0], end[2]) < 8) return null;
        const endD = Math.hypot(end[0] - txx, end[2] - tzz);
        return { path, end, endD };
      };
      const addEdge = (fromNode, toPosArr, kind) => {
        let toNode = nodes.find(n => n.layer !== 'elevated' && Math.hypot(n.position[0] - toPosArr[0], n.position[2] - toPosArr[2]) < 0.5);
        const edgeExists = toNode && segments.some(s => (s.from === fromNode.id && s.to === toNode.id) || (s.from === toNode.id && s.to === fromNode.id));
        if (edgeExists) return null;
        if (!toNode) { toNode = { id: `tr_gn_${nodes.length + 1}`, position: toPosArr.slice(), layer: 'ground' }; nodes.push(toNode); }
        return toNode;
      };
      for (const len of steps) {
        for (const [ux, uz] of dirOptions) {
          const mag = (ux !== 0 && uz !== 0) ? Math.SQRT2 : 1;
          const ex = Math.round(clamp(fx + ux * (len / mag), -half + 6, half - 6) * 100) / 100;
          const ez = Math.round(clamp(fz + uz * (len / mag), -half + 6, half - 6) * 100) / 100;
          const single = trySingle(fx, fz, ex, ez);
          if (single && single.endD <= near.d - 6) {
            const toNode = addEdge(near.node, single.end, 's');
            if (!toNode) continue;
            const sid = `tr_gb_${segments.length + 1}`;
            segments.push(makeRoadSegment(sid, near.node.id, toNode.id, single.path, Math.max(6, width - 2), 'local'));
            made++;
            ctx.report.diagnostics.push(info('transport_coverage_branch', stageId, 'added coverage branch toward underserved area', { id: sid, target: { x: txx, z: tzz }, tag, from: near.node.id }));
            return true;
          }
          // L-shaped fallback (two axis-aligned legs) when straight/diagonal step is invalid
          if (ux === 0 || uz === 0) continue;
          const corners = [
            { cx: fx + ux * (len / mag), cz: fz },
            { cx: fx, cz: fz + uz * (len / mag) },
          ];
          for (const c of corners) {
            const cxp = Math.round(clamp(c.cx, -half + 6, half - 6) * 100) / 100;
            const czp = Math.round(clamp(c.cz, -half + 6, half - 6) * 100) / 100;
            const leg1 = trySingle(fx, fz, cxp, czp);
            if (!leg1) continue;
            const leg2 = trySingle(leg1.end[0], leg1.end[2], ex, ez);
            if (!leg2 || leg2.endD > near.d - 6) continue;
            // add corner and end nodes/segments (ensure no duplicate edges)
            let cNode = nodes.find(n => n.layer !== 'elevated' && Math.hypot(n.position[0] - leg1.end[0], n.position[2] - leg1.end[2]) < 0.5);
            let eNode = nodes.find(n => n.layer !== 'elevated' && Math.hypot(n.position[0] - leg2.end[0], n.position[2] - leg2.end[2]) < 0.5);
            const edgeExists = (aId, bId) => segments.some(s => (s.from === aId && s.to === bId) || (s.from === bId && s.to === aId));
            if (edgeExists(near.node.id, cNode?.id) || (cNode && eNode && edgeExists(cNode.id, eNode.id))) continue;
            if (!cNode) { cNode = { id: `tr_gn_${nodes.length + 1}`, position: leg1.end.slice(), layer: 'ground' }; nodes.push(cNode); }
            if (edgeExists(near.node.id, cNode.id)) continue;
            if (!eNode) { eNode = { id: `tr_gn_${nodes.length + 1}`, position: leg2.end.slice(), layer: 'ground' }; nodes.push(eNode); }
            if (edgeExists(cNode.id, eNode.id)) continue;
            const sid1 = `tr_gb_${segments.length + 1}`;
            segments.push(makeRoadSegment(sid1, near.node.id, cNode.id, leg1.path, Math.max(6, width - 2), 'local'));
            made++;
            const sid2 = `tr_gb_${segments.length + 1}`;
            segments.push(makeRoadSegment(sid2, cNode.id, eNode.id, leg2.path, Math.max(6, width - 2), 'local'));
            made++;
            ctx.report.diagnostics.push(info('transport_coverage_branch', stageId, 'added L-shaped coverage branch toward underserved area', { id: sid2, target: { x: txx, z: tzz }, tag, from: near.node.id, via: cNode.id }));
            return true;
          }
        }
      }
    }
    return false;
  };
  const coverageBudget = 44;
  let coverageAdded = 0;
  const size = half * 2;
  const grid = size >= 1024 ? 4 : 3;
  const ccell = size / grid;
  const centers = [];
  for (let iz = 0; iz < grid; iz++) {
    for (let ix = 0; ix < grid; ix++) {
      centers.push({ x: -half + ccell * (ix + 0.5), z: -half + ccell * (iz + 0.5), ix, iz });
    }
  }
  // prioritize farthest-from-road centers (deterministic)
  centers.sort((a, b) => roadDistAt(b.x, b.z) - roadDistAt(a.x, a.z) || a.iz - b.iz || a.ix - b.ix);
  const subOffs = [[-0.25,-0.25],[0.25,-0.25],[-0.25,0.25],[0.25,0.25],[0,0],[-0.375,0],[0.375,0],[0,-0.375],[0,0.375]];
  for (let pass = 0; pass < 7 && coverageAdded < coverageBudget; pass++) {
    for (const c of centers) {
      if (coverageAdded >= coverageBudget) break;
      const cd = roadDistAt(c.x, c.z);
      // allow chained steps toward the same center per pass (more for far targets)
      const chainSteps = cd > 250 ? 5 : cd > 150 ? 4 : 3;
      for (let step = 0; step < chainSteps && coverageAdded < coverageBudget; step++) {
        if (roadDistAt(c.x, c.z) < 110) break;
        if (!tryAddCoverageToward(c.x, c.z, `c${pass}`)) break;
        coverageAdded++;
      }
    }
    // also try subcell points for still-far areas
    for (const c of centers) {
      if (coverageAdded >= coverageBudget) break;
      for (const [ox, oz] of subOffs) {
        if (coverageAdded >= coverageBudget) break;
        const tx = c.x + ox * ccell, tz = c.z + oz * ccell;
        if (roadDistAt(tx, tz) < 110) continue;
        if (tryAddCoverageToward(tx, tz, `c${pass}s`)) coverageAdded++;
      }
    }
  }

  if (requested > 0 && made < Math.min(requested, clamp(Number.isInteger(tc.branches) ? tc.branches : 2, 0, 4))) {
    ctx.report.diagnostics.push(info('transport_branches_partial', stageId, `added ${made}/${clamp(Number.isInteger(tc.branches) ? tc.branches : 2, 0, 4)} procedural spur(s)`, { requested: clamp(Number.isInteger(tc.branches) ? tc.branches : 2, 0, 4), made }));
  }

  // M3 B2 prototype fallback: try to convert suitable existing ground segments
  // into overpasses if main-route prototype was not applied. Picks best feasible
  // candidate deterministically per pass (prefer sufficient clearance, else highest clearance).
  if (!mainParts.some(p => p && p.interchange === 'overpass')) {
    const OVERPASS_FALLBACK_LIMIT = 5;
    const totalLen = (pth) => { let l = 0; for (let i=1;i<pth.length;i++) l += Math.hypot(pth[i][0]-pth[i-1][0], pth[i][2]-pth[i-1][2]); return l; };
    const INTERCHANGE_CLEARANCE = 3.8;
    const RAMP_SLOPE = Math.min(MAX_ROAD_SLOPE, 0.13); // prototype ramp limit (validated < 0.31)
    for (let overpassPass = 0; overpassPass < OVERPASS_FALLBACK_LIMIT; overpassPass++) {
      const incidentGround = new Map();
      for (const s of segments) {
        if (!s || s.bridge || s.layer === 'elevated') continue;
        if (s.from) incidentGround.set(s.from, (incidentGround.get(s.from) || 0) + 1);
        if (s.to) incidentGround.set(s.to, (incidentGround.get(s.to) || 0) + 1);
      }
      let chosen = null;
      for (let si = 0; si < segments.length; si++) {
        const seg = segments[si];
        if (!seg || seg.layer === 'elevated' || seg.type === 'arterial' || seg.interchange) continue; // keep main arterial profile stable unless prototype targeted it
        const path = Array.isArray(seg.path) ? seg.path : null;
        if (!path || path.length < 2) continue;
        // Bridge/ramp noses must land on ground roads: both endpoints need another incident ground segment.
        if ((incidentGround.get(seg.from) || 0) < 2 || (incidentGround.get(seg.to) || 0) < 2) continue;
        const len = totalLen(path);
        if (len < 64) continue;
        // axis-aligned straight check (tolerant)
        const dxSpan = Math.abs(path[path.length - 1][0] - path[0][0]);
        const dzSpan = Math.abs(path[path.length - 1][2] - path[0][2]);
        if (dxSpan > 1.0 && dzSpan > 1.0) continue;
        let straight = true;
        for (let i = 1; i < path.length; i++) {
          if (dxSpan <= dzSpan) { if (Math.abs(path[i][0] - path[0][0]) > 1.0) { straight = false; break; } }
          else { if (Math.abs(path[i][2] - path[0][2]) > 1.0) { straight = false; break; } }
        }
        if (!straight) continue;
        const a = path[0].slice(), b = path[path.length - 1].slice();
        const run = Math.hypot(b[0] - a[0], b[2] - a[2]);
        if (run < 64) continue;
        const ux = (b[0] - a[0]) / run, uz = (b[2] - a[2]) / run;
        let nearRiver = false;
        for (let i = 0; i + 1 < path.length && !nearRiver; i++) {
          if (segCrossesRiver(path[i][0], path[i][2], path[i+1][0], path[i+1][2], rivers)) nearRiver = true;
        }
        if (nearRiver) continue;
        const aY = a[1] ?? sampler.heightAt(a[0], a[2]);
        const bY = b[1] ?? sampler.heightAt(b[0], b[2]);
        if (Math.abs(aY - bY) > 2.5) continue;
        const endMaxY = Math.max(aY, bY);
        let midTerrain = -Infinity;
        const steps = Math.max(8, Math.ceil(run / 8));
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          midTerrain = Math.max(midTerrain, sampler.heightAt(a[0] + (b[0]-a[0])*t, a[2] + (b[2]-a[2])*t));
        }
        if (!Number.isFinite(midTerrain)) midTerrain = sampler.groundY;
        let deckH = Math.max(midTerrain + INTERCHANGE_CLEARANCE, endMaxY + 2.2, sampler.groundY + BRIDGE_DECK_MIN);
        let applied = null;
        let best = null;
        for (let iter = 0; iter < 6; iter++) {
          const riseNeedA = Math.max(deckH - aY, 0);
          const riseNeedB = Math.max(deckH - bY, 0);
          const baseA = clamp(Math.max(18, riseNeedA / Math.max(RAMP_SLOPE, 0.05)), 18, run * 0.36);
          const baseB = clamp(Math.max(18, riseNeedB / Math.max(RAMP_SLOPE, 0.05)), 18, run * 0.36);
          const shiftMax = Math.min(12, run * 0.12);
          const shifts = [0, -4, 4, -8, 8, -12, 12].filter(d => Math.abs(d) <= shiftMax + 1e-9);
          for (const shift of shifts) {
            let rampLenA = clamp(baseA + shift, 18, run * 0.4);
            let rampLenB = clamp(baseB - shift, 18, run * 0.4);
            if (run - rampLenA - rampLenB < 14) continue;
            // ensure ramps can reach deck height within slope
            if ((deckH - aY) > RAMP_SLOPE * rampLenA + 1e-6) rampLenA = clamp((deckH - aY) / Math.max(RAMP_SLOPE, 0.05), 18, run * 0.4);
            if ((deckH - bY) > RAMP_SLOPE * rampLenB + 1e-6) rampLenB = clamp((deckH - bY) / Math.max(RAMP_SLOPE, 0.05), 18, run * 0.4);
            if (run - rampLenA - rampLenB < 14) continue;
            if ((deckH - aY) / Math.max(rampLenA, 1e-6) > RAMP_SLOPE + 1e-6) continue;
            if ((deckH - bY) / Math.max(rampLenB, 1e-6) > RAMP_SLOPE + 1e-6) continue;
            const r1 = [a[0] + ux * rampLenA, a[2] + uz * rampLenA];
            const r2 = [b[0] - ux * rampLenB, b[2] - uz * rampLenB];
            const yR1 = aY + Math.sign(deckH - aY) * Math.min(Math.abs(deckH - aY), RAMP_SLOPE * rampLenA);
            const yR2 = bY + Math.sign(deckH - bY) * Math.min(Math.abs(deckH - bY), RAMP_SLOPE * rampLenB);
            const pts = [
              [a[0], aY, a[2]],
              [Math.round(r1[0]*100)/100, Math.round(yR1*100)/100, Math.round(r1[1]*100)/100],
              [Math.round(((r1[0]+r2[0])/2)*100)/100, Math.round(deckH*100)/100, Math.round(((r1[1]+r2[1])/2)*100)/100],
              [Math.round(r2[0]*100)/100, Math.round(yR2*100)/100, Math.round(r2[1]*100)/100],
              [b[0], bY, b[2]],
            ];
            let prof = enforceSlope(pts.map(p => p.slice()), RAMP_SLOPE, stageId, 'tr_interchange_overpass', null);
            prof = pinEndpoints(prof, [a[0], aY, a[2]], [b[0], bY, b[2]], RAMP_SLOPE, stageId, 'tr_interchange_overpass', null);
            if (!Array.isArray(prof) || prof.length < 2) continue;
            if (pathMaxSlope(prof) > RAMP_SLOPE + 0.02) continue;
            const midProfY = prof.reduce((m, p) => Math.max(m, p[1] ?? -Infinity), -Infinity);
            if (!(midProfY > endMaxY + 1.0)) continue;

            let minClear = Infinity, checked = 0;
            for (let i = 0; i + 1 < prof.length; i++) {
              const pa = prof[i], pb = prof[i + 1];
              const dxs = (pb[0] ?? 0) - (pa[0] ?? 0), dzs = (pb[2] ?? 0) - (pa[2] ?? 0);
              const segLen = Math.hypot(dxs, dzs);
              const st = Math.max(1, Math.ceil(segLen / 6));
              for (let ss = 0; ss <= st; ss++) {
                const tt = ss / st;
                const sx = (pa[0] ?? 0) + dxs * tt, sz = (pa[2] ?? 0) + dzs * tt;
                const sy = (pa[1] ?? 0) + ((pb[1] ?? 0) - (pa[1] ?? 0)) * tt;
                if (sy <= endMaxY + 1.0) continue;
                minClear = Math.min(minClear, sy - sampler.heightAt(sx, sz));
                checked++;
              }
            }
            const candProf = {
              prof,
              deckH: midProfY,
              rampLen: +(Math.max(rampLenA, rampLenB).toFixed(2)),
              minClear: (checked > 0 && Number.isFinite(minClear)) ? minClear : Infinity,
            };
            if (!best || candProf.minClear > best.minClear + 1e-6) best = candProf;
            if (candProf.minClear >= 1.5) { applied = candProf; break; }
          }
          if (applied) break;
          if (!best) break;
          const nextDeck = Math.round((deckH + Math.max(0.2, 1.5 - best.minClear)) * 100) / 100;
          if (nextDeck <= deckH + 1e-9) break;
          deckH = nextDeck;
        }
        if (!applied) continue; // require sufficient clearance (>=1.5m) to avoid low-clearance interchanges
        const cand = { si, seg, applied, run };
        if (!chosen
          || (cand.applied.minClear >= 1.5 && !(chosen.applied.minClear >= 1.5))
          || ((cand.applied.minClear >= 1.5) === (chosen.applied.minClear >= 1.5) && cand.applied.minClear > chosen.applied.minClear + 1e-6)) {
          chosen = cand;
        }
      }
      if (!chosen) break;
      const { seg, applied, run } = chosen;
      seg.path = applied.prof.map(p => p.slice());
      seg.bridge = true;
      seg.layer = 'elevated';
      seg.interchange = 'overpass';
      ctx.report.diagnostics.push(info('transport_interchange_overpass', stageId, 'applied overpass interchange prototype on generated segment', {
        segmentId: seg.id, deckH: +applied.deckH.toFixed(2), rampLen: +applied.rampLen.toFixed(2), len: +run.toFixed(2),
      }));
    }
  }

  // M3 B2/B4 prototype: minimal local junction grade separation (intersection interchange).
  // Elevates one through-road pair over a clean perpendicular 4-way ground junction by splitting
  // the pair near the junction, inserting short ramps and an elevated crossing node, while keeping
  // the cross pair at grade on the original junction node. Deterministic, best-effort: applies to
  // feasible candidates in node-id order (bounded). Preserves graph connectivity of all arms.
  {
    const pathLen = (path) => {
      let l = 0; for (let i = 1; i < (path?.length ?? 0); i++) l += Math.hypot((path[i][0]-path[i-1][0]), (path[i][2]-path[i-1][2]));
      return l;
    };
    const straightNear = (seg, nid, dist = 10) => {
      const atFrom = seg.from === nid; const path = seg.path;
      if (!Array.isArray(path) || path.length < 2) return false;
      const pts = atFrom ? path : [...path].reverse();
      const p0 = pts[0], p1 = pts[1];
      const dx = p1[0] - p0[0], dz = p1[2] - p0[2]; const len = Math.hypot(dx, dz) || 1; const ux = dx / len, uz = dz / len;
      let dacc = 0;
      for (let i = 1; i < pts.length && dacc < dist + 1e-6; i++) {
        const vx = pts[i][0] - p0[0], vz = pts[i][2] - p0[2];
        const along = vx * ux + vz * uz; const perp = Math.abs(vx * uz - vz * ux);
        if (perp > 0.8) return false;
        dacc = along;
      }
      return dacc >= Math.min(dist, pathLen(path) - 0.1);
    };
    const splitAtDistanceFromEnd = (path, fromStart, dist) => {
      // returns { point, prefix, suffix } splitting so that segment from chosen end to point has length ~dist along path
      if (!Array.isArray(path) || path.length < 2) return null;
      const pts = fromStart ? path.map(p => p.slice()) : [...path].map(p => p.slice()).reverse();
      let acc = 0;
      for (let i = 0; i + 1 < pts.length; i++) {
        const a = pts[i], b = pts[i + 1];
        const segL = Math.hypot(b[0]-a[0], b[2]-a[2], b[1]-a[1]);
        if (acc + segL >= dist - 1e-6) {
          const t = segL > 1e-9 ? clamp((dist - acc) / segL, 0.02, 0.98) : 0.5;
          const p = [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t].map(v => Math.round(v*100)/100);
          const prefix = pts.slice(0, i + 1).concat([p.slice()]);
          const suffix = [p.slice()].concat(pts.slice(i + 1));
          if (fromStart) return { point: p, prefix, suffix };
          return { point: p, prefix: [...suffix].reverse(), suffix: [...prefix].reverse() };
        }
        acc += segL;
      }
      return null;
    };

    const JUNCTION_INTERCHANGE_LIMIT = 4;
    let appliedTotal = 0;
    const appliedJunctionNodeIds = new Set();
    for (let pass = 0; pass < JUNCTION_INTERCHANGE_LIMIT; pass++) {
      let appliedJ = false;
      const byNode = new Map(nodes.map(n => [n.id, n]));
      const incByNode = new Map();
      for (const s of segments) {
        if (!s) continue;
        if (s.from) { if (!incByNode.has(s.from)) incByNode.set(s.from, []); incByNode.get(s.from).push(s); }
        if (s.to) { if (!incByNode.has(s.to)) incByNode.set(s.to, []); incByNode.get(s.to).push(s); }
      }
      const dirAt = (seg, nid) => {
        const n = byNode.get(nid); if (!n || !Array.isArray(seg?.path) || seg.path.length < 2) return null;
        const atFrom = seg.from === nid;
        const p = atFrom ? seg.path[0] : seg.path[seg.path.length - 1];
        const q = atFrom ? seg.path[1] : seg.path[seg.path.length - 2];
        const dx = (q[0] ?? 0) - (p[0] ?? 0), dz = (q[2] ?? 0) - (p[2] ?? 0);
        const l = Math.hypot(dx, dz) || 1;
        return { dx: dx / l, dz: dz / l, other: atFrom ? seg.to : seg.from, seg, atFrom };
      };

      const nodeIds = Array.from(incByNode.keys()).sort();
      for (const nid of nodeIds) {
        if (appliedJ) break;
        if (appliedJunctionNodeIds.has(nid)) continue;
        const inc = incByNode.get(nid) || [];
        if (inc.length !== 4 && inc.length !== 3) continue;
        if (inc.some(s => s?.interchange || s?.layer === 'elevated' || s?.type === 'arterial')) continue;
        const jn = byNode.get(nid); if (!jn || !Array.isArray(jn.position)) continue;
        const dirs = inc.map(s => dirAt(s, nid)).filter(Boolean);
        if (dirs.length !== inc.length) continue;
        if (!dirs.every(d => straightNear(d.seg, nid, 10))) continue;

        let pairCands = [];
        let jKind = null;
        if (inc.length === 4) {
          const used = new Set(); const pairs = [];
          for (let i = 0; i < 4; i++) {
            if (used.has(i)) continue;
            let bestJ = -1, bestDot = -0.8;
            for (let j = i + 1; j < 4; j++) {
              if (used.has(j)) continue;
              const dot = dirs[i].dx * dirs[j].dx + dirs[i].dz * dirs[j].dz;
              if (dot < bestDot) { bestDot = dot; bestJ = j; }
            }
            if (bestJ >= 0) { pairs.push([i, bestJ, bestDot]); used.add(i); used.add(bestJ); }
          }
          if (pairs.length !== 2) continue;
          const p1a = dirs[pairs[0][0]], p2a = dirs[pairs[1][0]];
          const perp = Math.abs(p1a.dx * p2a.dx + p1a.dz * p2a.dz);
          if (perp > 0.2) continue; // require roughly perpendicular crossing
          pairCands = pairs.map(p => {
            const d0 = dirs[p[0]], d1 = dirs[p[1]];
            const total = pathLen(d0.seg.path) + pathLen(d1.seg.path);
            return { i0: p[0], i1: p[1], total };
          }).sort((a,b) => b.total - a.total);
          jKind = 'cross4';
        } else {
          // T-junction (3-way): one through pair (opposite) elevated, stem remains at grade at junction
          let through = null;
          for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) {
            const dot = dirs[i].dx * dirs[j].dx + dirs[i].dz * dirs[j].dz;
            if (dot < -0.8) through = [i, j, dot];
          }
          if (!through) continue;
          const stemIdx = [0, 1, 2].find(k => k !== through[0] && k !== through[1]);
          if (stemIdx == null) continue;
          const p1 = dirs[through[0]], ps = dirs[stemIdx];
          const perp = Math.abs(p1.dx * ps.dx + p1.dz * ps.dz);
          if (perp > 0.25) continue;
          const d0 = dirs[through[0]], d1 = dirs[through[1]];
          const total = pathLen(d0.seg.path) + pathLen(d1.seg.path);
          pairCands = [{ i0: through[0], i1: through[1], total }];
          jKind = 'tee3';
        }

        for (const pc of pairCands) {
          if (appliedJ) break;
          const { i0, i1 } = pc;
          const dA = dirs[i0], dB = dirs[i1];
          const sA = dA.seg, sB = dB.seg;
          // ramp distance limited by local straight length; try a few deterministic lengths (shorter fallback for tighter sites)
          const rampDistOptions = [20, 18, 16, 14, 12];
          let feasible = null;
          for (const rampDist of rampDistOptions) {
          if (pathLen(sA.path) < rampDist + 6 || pathLen(sB.path) < rampDist + 6) continue;
          const splitA = splitAtDistanceFromEnd(sA.path, dA.atFrom, rampDist);
          const splitB = splitAtDistanceFromEnd(sB.path, dB.atFrom, rampDist);
          if (!splitA || !splitB) continue;

          const jY = jn.position[1] ?? sampler.heightAt(jn.position[0], jn.position[2]);
          const aBaseY = splitA.point[1];
          const bBaseY = splitB.point[1];
          // deck height: sufficient clearance above junction/cross road, but reachable by ramps
          let deckY = Math.max(jY + 2.0, aBaseY + 0.8, bBaseY + 0.8, jY + 1.6);
          const maxRampSlope = 0.13;
          const riseA = Math.max(deckY - aBaseY, 0), riseB = Math.max(deckY - bBaseY, 0);
          if (riseA / Math.max(rampDist, 1e-6) > maxRampSlope + 1e-6) deckY = Math.min(deckY, aBaseY + maxRampSlope * rampDist);
          if (riseB / Math.max(rampDist, 1e-6) > maxRampSlope + 1e-6) deckY = Math.min(deckY, bBaseY + maxRampSlope * rampDist);
          deckY = Math.max(deckY, jY + 1.6);
          const finalRiseA = deckY - aBaseY, finalRiseB = deckY - bBaseY;
          if (finalRiseA / Math.max(rampDist, 1e-6) > maxRampSlope + 1e-6) continue;
          if (finalRiseB / Math.max(rampDist, 1e-6) > maxRampSlope + 1e-6) continue;
          const minClear = deckY - jY;
          if (!(minClear >= 1.5)) continue;

          const nRampAId = `tr_jn_${nid}_a`;
          const nRampBId = `tr_jn_${nid}_b`;
          const nUpId = `tr_jn_${nid}_up`;
          const usedIds = new Set(nodes.map(n => n.id).concat(segments.map(s => s.id)));
          const uniq = (base) => { let id = base, k = 2; while (usedIds.has(id)) { id = `${base}_${k++}`; } usedIds.add(id); return id; };
          const rampAIdNode = uniq(nRampAId);
          const rampBIdNode = uniq(nRampBId);
          const upIdNode = uniq(nUpId);

          const pA = [splitA.point[0], Math.round(aBaseY*100)/100, splitA.point[2]];
          const pB = [splitB.point[0], Math.round(bBaseY*100)/100, splitB.point[2]];
          const pUp = [Math.round(jn.position[0]*100)/100, Math.round(deckY*100)/100, Math.round(jn.position[2]*100)/100];

          // Build ramp paths (2-point, enforce slope)
          const rampPathA = enforceSlope([[pA[0], pA[1], pA[2]], [pUp[0], pUp[1], pUp[2]]], maxRampSlope, stageId, 'tr_junction_ramp', null);
          const rampPathB = enforceSlope([[pUp[0], pUp[1], pUp[2]], [pB[0], pB[1], pB[2]]], maxRampSlope, stageId, 'tr_junction_ramp', null);
          if (!rampPathA || rampPathA.length < 2 || !rampPathB || rampPathB.length < 2) continue;
          rampPathA[0] = pA.slice(); rampPathA[rampPathA.length - 1] = pUp.slice();
          rampPathB[0] = pUp.slice(); rampPathB[rampPathB.length - 1] = pB.slice();
          if (pathMaxSlope(rampPathA) > maxRampSlope + 0.02 || pathMaxSlope(rampPathB) > maxRampSlope + 0.02) continue;

          feasible = { rampDist, splitA, splitB, jY, aBaseY, bBaseY, deckY, minClear, rampAIdNode, rampBIdNode, upIdNode, pA, pB, pUp, rampPathA, rampPathB };
          break;
          }
          if (!feasible) continue;
          const { rampDist, splitA, splitB, deckY, minClear, rampAIdNode, rampBIdNode, upIdNode, pA, pB, pUp, rampPathA, rampPathB } = feasible;
          const usedIds = new Set(nodes.map(n => n.id).concat(segments.map(s => s.id)));
          const uniq = (base) => { let id = base, k = 2; while (usedIds.has(id)) { id = `${base}_${k++}`; } usedIds.add(id); return id; };

          let groundPathA, rampSegPathA, groundFromA, groundToA, rampFromA, rampToA;
          let groundPathB, rampSegPathB, groundFromB, groundToB, rampFromB, rampToB;

          if (dA.atFrom) {
            groundPathA = [...splitA.suffix].map(p=>p.slice());
            groundFromA = rampAIdNode; groundToA = sA.to;
            rampSegPathA = rampPathA.map(p=>p.slice()); // pA -> pUp
            rampFromA = rampAIdNode; rampToA = upIdNode;
          } else {
            groundPathA = [...splitA.prefix].map(p=>p.slice());
            groundFromA = sA.from; groundToA = rampAIdNode;
            rampSegPathA = rampPathA.map(p=>p.slice()); // pA -> pUp
            rampFromA = rampAIdNode; rampToA = upIdNode;
          }
          if (dB.atFrom) {
            groundPathB = [...splitB.suffix].map(p=>p.slice());
            groundFromB = rampBIdNode; groundToB = sB.to;
            rampSegPathB = rampPathB.map(p=>p.slice()); // pUp -> pB
            rampFromB = upIdNode; rampToB = rampBIdNode;
          } else {
            groundPathB = [...splitB.prefix].map(p=>p.slice());
            groundFromB = sB.from; groundToB = rampBIdNode;
            rampSegPathB = [...rampPathB].reverse().map(p=>p.slice()); // pB -> pUp
            rampFromB = rampBIdNode; rampToB = upIdNode;
          }

          groundPathA[0] = pA.slice(); groundPathA[groundPathA.length - 1] = groundPathA[groundPathA.length - 1].slice();
          groundPathB[groundPathB.length - 1] = pB.slice();

          // Apply: add nodes
          const nodeA = { id: rampAIdNode, position: pA.slice(), layer: 'ground' };
          const nodeB = { id: rampBIdNode, position: pB.slice(), layer: 'ground' };
          const nodeUp = { id: upIdNode, position: pUp.slice(), layer: 'elevated' };
          nodes.push(nodeA, nodeB, nodeUp);

          // Modify existing through segments to become ground stubs to ramp nodes (keep ids/types/lanes)
          sA.from = groundFromA; sA.to = groundToA; sA.path = groundPathA.map(p=>p.slice()); sA.layer = 'ground'; sA.bridge = false; delete sA.interchange;
          sB.from = groundFromB; sB.to = groundToB; sB.path = groundPathB.map(p=>p.slice()); sB.layer = 'ground'; sB.bridge = false; delete sB.interchange;
          // fix endpoints of modified ground stubs to ramp node positions
          if (dA.atFrom) { sA.path[0] = pA.slice(); } else { sA.path[sA.path.length - 1] = pA.slice(); }
          if (dB.atFrom) { sB.path[0] = pB.slice(); } else { sB.path[sB.path.length - 1] = pB.slice(); }

          // Add elevated ramp segments forming continuous through route over junction
          const baseSeg = sA;
          const mkRampSeg = (id, from, to, path, interchangeType = 'junction_ramp') => ({
            id,
            from, to,
            type: baseSeg.type || 'local',
            layer: 'elevated',
            bridge: true,
            interchange: interchangeType,
            path: path.map(p => p.slice()),
            lanes: Array.isArray(baseSeg.lanes) ? JSON.parse(JSON.stringify(baseSeg.lanes)) : [],
            ...(Number.isFinite(baseSeg.shoulderWidth) ? { shoulderWidth: baseSeg.shoulderWidth } : {}),
            ...(baseSeg.sidewalk === true ? { sidewalk: true } : {}),
            ...(baseSeg.surface ? { surface: baseSeg.surface } : {}),
          });
          const rampSegIdA = uniq(`tr_jr_${nid}_a`);
          const rampSegIdB = uniq(`tr_jr_${nid}_b`);
          segments.push(mkRampSeg(rampSegIdA, rampFromA, rampToA, rampSegPathA, 'junction_ramp'));
          segments.push(mkRampSeg(rampSegIdB, rampFromB, rampToB, rampSegPathB, 'junction_ramp'));

          // Ground connectors restore graph connectivity/access between cross-road junction and ramp bases
          const mkGroundConn = (id, from, to, path) => ({
            id,
            from, to,
            type: baseSeg.type || 'local',
            layer: 'ground',
            interchange: 'junction_connector',
            path: path.map(p => p.slice()),
            lanes: Array.isArray(baseSeg.lanes) ? JSON.parse(JSON.stringify(baseSeg.lanes)) : [],
            ...(Number.isFinite(baseSeg.shoulderWidth) ? { shoulderWidth: baseSeg.shoulderWidth } : {}),
            ...(baseSeg.sidewalk === true ? { sidewalk: true } : {}),
            ...(baseSeg.surface ? { surface: baseSeg.surface } : {}),
          });
          const connPathA = dA.atFrom ? [...splitA.prefix].map(p=>p.slice()) : [...splitA.suffix].map(p=>p.slice()); // junction -> split point
          const connPathB = dB.atFrom ? [...splitB.prefix].map(p=>p.slice()) : [...splitB.suffix].map(p=>p.slice());
          // ensure endpoints match junction and ramp nodes
          if (connPathA.length >= 2) {
            connPathA[0] = [jn.position[0], jn.position[1], jn.position[2]].map(v=>Math.round(v*100)/100);
            connPathA[connPathA.length - 1] = pA.slice();
          }
          if (connPathB.length >= 2) {
            connPathB[0] = [jn.position[0], jn.position[1], jn.position[2]].map(v=>Math.round(v*100)/100);
            connPathB[connPathB.length - 1] = pB.slice();
          }
          if (connPathA.length >= 2) segments.push(mkGroundConn(uniq(`tr_jc_${nid}_a`), nid, rampAIdNode, connPathA));
          if (connPathB.length >= 2) segments.push(mkGroundConn(uniq(`tr_jc_${nid}_b`), nid, rampBIdNode, connPathB));

          ctx.report.diagnostics.push(info('transport_interchange_junction', stageId, 'applied junction grade-separation interchange prototype', {
            nodeId: nid, elevatedPair: [sA.id, sB.id], ramps: [rampSegIdA, rampSegIdB], elevatedNode: upIdNode,
            deckY: +pUp[1].toFixed(2), clearance: +minClear.toFixed(3), rampDist, kind: jKind,
          }));
          appliedJunctionNodeIds.add(nid);
          appliedJ = true;
          appliedTotal++;
        }
      }
      if (!appliedJ) break;
    }
  }

  ctx.networks.roads.nodes = nodes;
  ctx.networks.roads.segments = segments;
  ctx.networks.roads.junctions = [];
  ctx.report.diagnostics.push(info('transport_generated', stageId, 'stage 2 generated road network', { nodes: nodes.length, segments: segments.length, seed, branches: made, profiled: true }));
}

/**
 * Targeted access-road augmentation for far road-needy parcels (TASK-004/005/006).
 * Runs after stage 3 parcels exist (e.g. from stage 4) to connect underserved areas
 * to the nearest road network with short profiled segments. Deterministic, bounded.
 */
/**
 * Targeted axis-aligned access roads for far road-needy parcels (TASK-004/005/006).
 * Runs after stage 3 (parcels known), before building placement. Adds L-shaped or
 * straight axis-aligned terrain-following local segments toward underserved parcels.
 * Deterministic and bounded.
 */

/**
 * Targeted axis-aligned access roads for far road-needy parcels (TASK-004/005/006).
 * Runs after stage 3 (parcels known), before building placement. Adds straight/L
 * axis-aligned terrain-following local segments toward underserved parcels.
 * Deterministic and bounded; strict river/slope/axis validation.
 */

/**
 * Targeted axis-aligned access roads for far road-needy parcels (TASK-004/005/006).
 * Conservative: strict axis/slope/river clearance; deterministic and bounded.
 */
export function addAxisAlignedAccessRoadsForParcels(ctx) {
  const stageId = '2_transport_access';
  const parcels = Array.isArray(ctx.parcels) ? ctx.parcels : [];
  const networks = ctx.networks?.roads;
  if (!networks || !Array.isArray(networks.nodes) || !Array.isArray(networks.segments)) return { added: 0 };
  // Skip for small/synthetic contexts to keep unit tests stable; pilot-scale worlds benefit most.
  if ((ctx.meta?.worldBounds?.size ?? 0) < 512 || parcels.length < 30) return { added: 0 };
  const nodes = networks.nodes;
  const segments = networks.segments;
  if (!nodes.length || !segments.length) return { added: 0 };

  const roadNeedyTypes = new Set(['office', 'residential', 'luxury', 'industrial', 'slums', 'parking', 'sports']);
  const half = (ctx.meta.worldBounds?.size ?? ctx.input?.ground?.size ?? 256) / 2;
  const sampler = makeTerrainSampler(ctx);
  const rivers = ctx.hydrology?.rivers ?? ctx.input?.cityforge?.hydrology?.rivers ?? [];

  const riverClear = (path) => {
    if (!Array.isArray(path)) return false;
    for (const pt of path) {
      const near = riverMinDistXZAt(pt[0], pt[2], rivers);
      const rv = near.river;
      if (!rv) continue;
      const margin = ((rv?.width ?? 10) * 0.5) + 50;
      if (near.d < margin) return false;
    }
    return true;
  };

  const minRoadDist = (x, z) => {
    let best = Infinity;
    for (const s of segments) {
      const pts = Array.isArray(s?.path) ? s.path : [];
      for (let i = 0; i + 1 < pts.length; i++) {
        const a = pts[i], b = pts[i + 1];
        if (!a || !b) continue;
        best = Math.min(best, pointSegDistXZ(x, z, a[0], a[2], b[0], b[2]));
      }
    }
    return best;
  };
  const nodePos = (n) => { const p = Array.isArray(n?.position) ? n.position : [0,0,0]; return { x: Number(p[0])||0, y: Number(p[1])||0, z: Number(p[2])||0 }; };
  const nearestNode = (x, z) => {
    let best = null, bestD = Infinity;
    for (const n of nodes) {
      if (n?.layer === 'elevated') continue;
      const p = nodePos(n);
      const d = Math.hypot(p.x - x, p.z - z);
      if (d < bestD) { bestD = d; best = n; }
    }
    return best ? { node: best, d: bestD } : null;
  };
  const ensureRoadIndex = () => {
    ctx.spatial = ctx.spatial || {};
    if (ctx.spatial.roadEasements && typeof ctx.spatial.roadEasements.insert === 'function') return ctx.spatial.roadEasements;
    const idx = createSpatialIndex(ctx.meta.worldBounds ?? { size: (half * 2) });
    for (const r of (ctx.masks?.easement?.roads ?? [])) idx.insert(r);
    ctx.spatial.roadEasements = idx;
    return idx;
  };
  const syncSegment = (seg) => {
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const pt of (seg.path || [])) { minX = Math.min(minX, pt[0]); maxX = Math.max(maxX, pt[0]); minZ = Math.min(minZ, pt[2]); maxZ = Math.max(maxZ, pt[2]); }
    const eas = { id: seg.id, minX, maxX, minZ, maxZ, width: (Array.isArray(seg?.lanes) && seg.lanes[0]?.width) ? seg.lanes[0].width : 8 };
    if (!ctx.masks.easement) ctx.masks.easement = { rivers: [], roads: [] };
    ctx.masks.easement.roads = ctx.masks.easement.roads || [];
    ctx.masks.easement.roads.push(eas);
    ensureRoadIndex().insert(eas);
  };
  const uniqueSegId = (base) => { const used = new Set(segments.map(s => s.id)); if (!used.has(base)) return base; let k = 2; while (used.has(`${base}_${k}`)) k++; return `${base}_${k}`; };
  const uniqueNodeId = (base) => { const used = new Set(nodes.map(n => n.id)); if (!used.has(base)) return base; let k = 2; while (used.has(`${base}_${k}`)) k++; return `${base}_${k}`; };
  const edgeExists = (a, b) => segments.some(s => (s.from === a && s.to === b) || (s.from === b && s.to === a));
  const getOrCreateNodeAt = (x, y, z, baseId) => {
    let n = nodes.find(nn => nn.layer !== 'elevated' && Math.hypot(nn.position[0] - x, nn.position[2] - z) < 0.5);
    if (!n) { n = { id: uniqueNodeId(baseId), position: [Math.round(x*100)/100, Math.round(y*100)/100, Math.round(z*100)/100], layer: 'ground' }; nodes.push(n); }
    return n;
  };
  const tryAddLeg = (fromNode, toX, toZ, idBase) => {
    const fp = nodePos(fromNode);
    const tx = Math.round(clamp(toX, -half + 6, half - 6) * 100) / 100;
    const tz = Math.round(clamp(toZ, -half + 6, half - 6) * 100) / 100;
    if (Math.abs(tx - fp.x) > 0.01 && Math.abs(tz - fp.z) > 0.01) return null;
    if (Math.hypot(tx - fp.x, tz - fp.z) < 12) return null;
    const path = buildAxisAlignedTerrainPath(fp.x, fp.z, tx, tz, sampler, rivers, 12);
    if (!isValidAxisAlignedTerrainPath(path, rivers)) return null;
    if (!riverClear(path)) return null;
    const end = path[path.length - 1];
    const toNode = getOrCreateNodeAt(end[0], end[1], end[2], `${idBase}_n`);
    if (edgeExists(fromNode.id, toNode.id)) return null;
    const segId = uniqueSegId(idBase);
    const seg = makeRoadSegment(segId, fromNode.id, toNode.id, path, 8, 'local');
    segments.push(seg);
    syncSegment(seg);
    return { seg, toNode, end };
  };

  const targets = [];
  for (const p of parcels) {
    if (!p || p.reserved) continue;
    const type = p.type || p.profileId;
    if (!roadNeedyTypes.has(type)) continue;
    const b = p.aabb; if (!b) continue;
    const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
    const rd = Number.isFinite(p.access?.roadDist) ? p.access.roadDist : minRoadDist(cx, cz);
    if (rd < 140) continue;
    const rn = riverMinDistXZAt(cx, cz, rivers);
    if ((rn.river ? rn.d : 1e9) < ((rn.river?.width ?? 10) * 0.5 + 70)) continue;
    targets.push({ x: cx, z: cz, rd, type, id: p.id });
  }
  // Rebalanced within fixed budget: prioritize currently underserved types (sports/slums)
  // while keeping deterministic order and respecting river/perf constraints.
  targets.sort((a, b) => {
    const aw = a.type === 'office' ? 0 : a.type === 'residential' ? 1 : a.type === 'sports' ? 2 : 3;
    const bw = b.type === 'office' ? 0 : b.type === 'residential' ? 1 : b.type === 'sports' ? 2 : 3;
    return aw - bw || b.rd - a.rd || String(a.id).localeCompare(String(b.id));
  });
  const picked = [];
  for (const t of targets) {
    if (picked.some(p => Math.hypot(p.x - t.x, p.z - t.z) < 50)) continue;
    picked.push(t);
    if (picked.length >= 80) break;
  }

  let added = 0;
  const budget = 18;
  const rollbackLegs = (legs) => {
    for (let i = legs.length - 1; i >= 0; i--) {
      const leg = legs[i]; if (!leg?.seg) continue;
      const segIdx = segments.lastIndexOf(leg.seg);
      if (segIdx >= 0) segments.splice(segIdx, 1);
      const n = leg.toNode;
      if (n && !segments.some(s => s.from === n.id || s.to === n.id)) {
        const idx = nodes.indexOf(n); if (idx >= 0) nodes.splice(idx, 1);
      }
      ctx.masks.easement.roads = (ctx.masks.easement.roads || []).filter(r => r.id !== leg.seg.id);
    }
    if (legs.length) {
      const idx = createSpatialIndex(ctx.meta.worldBounds ?? { size: (half * 2) });
      for (const r of (ctx.masks.easement.roads || [])) idx.insert(r);
      ctx.spatial.roadEasements = idx;
    }
  };

  for (let pass = 0; pass < 3 && added < budget; pass++) {
    for (const t of picked) {
      if (added >= budget) break;
      const cur = minRoadDist(t.x, t.z);
      if (cur < 120) continue;
      const near = nearestNode(t.x, t.z);
      if (!near || near.d < 18) continue;
      const fp = nodePos(near.node);
      const dx = t.x - fp.x, dz = t.z - fp.z;
      const adx = Math.abs(dx), adz = Math.abs(dz);
      const maxStep = clamp(cur - 30, 40, 96);
      const stepLens = [Math.min(maxStep, 72), 48, 40].filter((v, i, a) => v >= 32 && a.indexOf(v) === i);
      const tryRoutes = [];
      const sx = Math.sign(dx) || 1, sz = Math.sign(dz) || 1;
      for (const L of stepLens) {
        const lx = Math.min(L, adx), lz = Math.min(L, adz);
        if (adz < 1 && adx >= 12) tryRoutes.push([[fp.x + sx * lx, fp.z]]);
        else if (adx < 1 && adz >= 12) tryRoutes.push([[fp.x, fp.z + sz * lz]]);
        else {
          tryRoutes.push([[fp.x + sx * lx, fp.z], [fp.x + sx * lx, fp.z + sz * lz]]);
          tryRoutes.push([[fp.x, fp.z + sz * lz], [fp.x + sx * lx, fp.z + sz * lz]]);
        }
      }
      let placed = false;
      for (const route of tryRoutes) {
        if (placed) break;
        const legs = [];
        let from = near.node; let ok = true;
        for (let i = 0; i < route.length; i++) {
          const [tx, tz] = route[i];
          const leg = tryAddLeg(from, tx, tz, `tr_acc_${pass + 1}_${added + 1}`);
          if (!leg) { ok = false; break; }
          legs.push(leg); from = leg.toNode;
        }
        if (!ok) { rollbackLegs(legs); continue; }
        const end = legs[legs.length - 1].end;
        const endD = Math.hypot(end[0] - t.x, end[2] - t.z);
        if (endD < cur - 8 || endD < 130) {
          added += legs.length;
          ctx.report.repairs.push({ stage: stageId, code: 'access_roads_added', id: legs.map(l => l.seg.id).join(','), target: t.id });
          placed = true;
        } else {
          rollbackLegs(legs);
        }
      }
    }
  }

  if (added > 0 && Array.isArray(ctx.parcels)) {
    for (const p of ctx.parcels) {
      const b = p?.aabb; if (!b) continue;
      const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
      const rd = minRoadDist(cx, cz);
      if (!p.access) p.access = { edge: 'north', roadDist: null };
      p.access.roadDist = Number.isFinite(rd) ? +rd.toFixed(2) : null;
    }
  }
  if (ctx.input?.cityforge?.networks?.roads) ctx.input.cityforge.networks.roads = networks;
  return { added };
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
        const prev = structuredClone(ctx.networks?.roads ?? { nodes: [], segments: [], junctions: [] });
        try {
          generateTransport(ctx);
          // Gate: emit only if every generated road segment is axis-aligned and within slope limit.
          const segs = ctx.networks?.roads?.segments ?? [];
          let bad = 0;
          for (const s of segs) {
            const pts = pathPoints(s); if (!pts) { bad++; continue; }
            if (!isAxisAlignedPath(pts)) { bad++; continue; }
            if (pathMaxSlope(pts) > 0.3005) { bad++; continue; }
          }
          if (bad > 0 || segs.length === 0) {
            ctx.networks.roads = prev;
            ctx.report.diagnostics.push(info('transport_emit_deferred', stageId, 'generated road network computed but emission deferred pending engine-valid profiling/geometry', { bad, generatedSegments: segs.length }));
          }
        } catch (e) {
          ctx.networks.roads = prev;
          ctx.report.diagnostics.push(warn('transport_generation_failed', stageId, `transport generation failed, using passthrough: ${String(e?.message ?? e)}`));
        }
        return;
      }
      ctx.report.diagnostics.push(info('transport_passthrough', stageId, 'stage 2 using provided road network (procedural generation pending)', {
        nodes: ctx.networks.roads.nodes.length,
        segments: ctx.networks.roads.segments.length,
      }));
    },
    validate(ctx) {
      const stageId = '2_transport';
      const size = ctx.meta.worldBounds?.size ?? ctx.input?.ground?.size ?? 256;
      const half = size / 2;
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
        if (pts && polylineSelfIntersectsXZ(pts)) {
          ctx.report.diagnostics.push(warn('segment_self_intersection', stageId, `segment '${s.id}' has self-intersecting path`, { id: s.id }));
        }
        // Clamp out-of-bounds path points to world bounds (deterministic repair)
        if (pts) {
          let clamped = false;
          const newPts = pts.map(p => {
            const x = clamp(p[0], -half, half);
            const z = clamp(p[2], -half, half);
            if (Math.abs(x - p[0]) > 0.01 || Math.abs(z - p[2]) > 0.01) clamped = true;
            return [Math.round(x * 1000) / 1000, p[1], Math.round(z * 1000) / 1000];
          });
          if (clamped) {
            s.path = newPts;
            // refresh local pts view for subsequent checks/masks
            pts.length = 0; for (const p of newPts) pts.push(p);
            ctx.report.diagnostics.push(warn('road_point_out_of_bounds', stageId, `segment '${s.id}' had path point(s) outside world bounds (clamped)`, { id: s.id }));
            ctx.report.repairs.push({ stage: stageId, id: s.id ?? null, code: 'clamp_road_path_bounds' });
          }
        }
        // river easement conflict: path points inside river corridor at low relative elevation
        const rivers = ctx.hydrology?.rivers ?? ctx.input?.cityforge?.hydrology?.rivers ?? [];
        const groundY = ctx.input?.ground?.y ?? 0;
        if (pts && rivers.length) {
          let conflicts = 0;
          let unbridgedCrossings = 0;
          for (const p of pts) {
            const near = riverMinDistXZAt(p[0], p[2], rivers);
            if (near.river) {
              const margin = (near.river.width ?? 10) * 0.5 + 1;
              const bed = groundY - (Number.isFinite(near.river.depth) ? near.river.depth : 2);
              if (near.d < margin && p[1] < bed + 1.2) conflicts++;
            }
          }
          // Проверка: дорога не должна проходить через реку без моста (пересечение русла на низкой отметке).
          for (let i = 0; i + 1 < pts.length; i++) {
            const a = pts[i], b = pts[i + 1];
            const crossing = segCrossesRiver(a[0], a[2], b[0], b[2], rivers);
            if (!crossing) continue;
            const len = Math.hypot(b[0] - a[0], b[2] - a[2]);
            const steps = Math.max(2, Math.ceil(len / SAMPLE_STEP));
            let bridged = true;
            for (let st = 0; st <= steps; st++) {
              const t = st / steps;
              const x = a[0] + (b[0] - a[0]) * t;
              const y = a[1] + (b[1] - a[1]) * t;
              const z = a[2] + (b[2] - a[2]) * t;
              const near = riverMinDistXZAt(x, z, [crossing.river]);
              const channelHalf = (Number(crossing.river.width) || 10) * 0.5;
              if (near.d <= channelHalf + 0.5) {
                const minBridgeY = groundY + BRIDGE_DECK_MIN;
                if (y < minBridgeY) { bridged = false; break; }
              }
            }
            if (!bridged) unbridgedCrossings++;
          }
          if (conflicts) ctx.report.diagnostics.push(warn('road_river_conflict', stageId, `segment '${s.id}' has ${conflicts} point(s) inside river corridor`, { id: s.id, count: conflicts }));
          if (unbridgedCrossings) {
            ctx.report.diagnostics.push({ severity: 'error', code: 'road_crosses_river_without_bridge', stage: stageId, message: `segment '${s.id}' crosses river without bridge (${unbridgedCrossings} sub-segment(s))`, objectIds: [s.id] });
          }
        }
        // road easement mask (approx by path bbox/width)
        if (pts) {
          let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;
          let oob = 0;
          for (const p of pts) {
            minX=Math.min(minX,p[0]); maxX=Math.max(maxX,p[0]); minZ=Math.min(minZ,p[2]); maxZ=Math.max(maxZ,p[2]);
            if (Math.abs(p[0]) > half + 0.01 || Math.abs(p[2]) > half + 0.01) oob++;
          }
          if (oob) ctx.report.diagnostics.push(warn('road_point_out_of_bounds', stageId, `segment '${s.id}' has ${oob} path point(s) outside world bounds`, { id: s.id, count: oob }));
          const w = (Array.isArray(s.lanes) && s.lanes[0]?.width) ? s.lanes[0].width : 8;
          ctx.masks.easement.roads.push({ id: s.id ?? null, minX, maxX, minZ, maxZ, width: w });
        }
        segments.push(s);
      }
      ctx.networks.roads.nodes = nodes;
      ctx.networks.roads.segments = segments;
      ctx.networks.roads.junctions = uniqById(ctx.networks.roads.junctions, 'junction', ctx, stageId);
      // Spatial index for road easement AABBs (TASK-002): deterministic, additive for stage queries.
      ctx.spatial = ctx.spatial || {};
      const roadIdx = createSpatialIndex(ctx.meta.worldBounds ?? { size: ctx.input?.ground?.size ?? 256 });
      for (const r of (ctx.masks.easement?.roads ?? [])) roadIdx.insert(r);
      ctx.spatial.roadEasements = roadIdx;

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
    repair(ctx) {
      const stageId = '2_transport';
      const gp = ctx.input?.gameplay ?? {};
      const spawnPos = { x: gp.spawn?.x ?? 0, z: gp.spawn?.z ?? 0 };
      const exitPos = { x: gp.exit?.x ?? 0, z: gp.exit?.z ?? 0 };
      const nodes = ctx.networks?.roads?.nodes ?? [];
      const segments = ctx.networks?.roads?.segments ?? [];
      if (!nodes.length || !segments.length) return;

      // Build adjacency and components for declared from/to graph.
      const adj = new Map();
      for (const n of nodes) adj.set(n.id, new Set());
      for (const s of segments) {
        if (s.from && s.to && adj.has(s.from) && adj.has(s.to)) {
          adj.get(s.from).add(s.to); adj.get(s.to).add(s.from);
        }
      }
      const compOf = new Map();
      let cid = 0;
      for (const id of adj.keys()) {
        if (compOf.has(id)) continue;
        cid++; const q=[id]; compOf.set(id, cid);
        while (q.length) { const cur=q.shift(); for (const nb of (adj.get(cur)||[])) if(!compOf.has(nb)){compOf.set(nb,cid); q.push(nb);} }
      }
      const nodePos = (n) => {
        const p = Array.isArray(n?.position) ? n.position : [0,0,0];
        return { x: Number(p[0]) || 0, y: Number(p[1]) || 0, z: Number(p[2]) || 0 };
      };
      const nearestNode = (pos) => {
        let best = null, bestD = Infinity;
        for (const n of nodes) {
          const p = nodePos(n);
          const d = Math.hypot(p.x - pos.x, p.z - pos.z);
          if (d < bestD) { bestD = d; best = n; }
        }
        return best ? { node: best, d: bestD } : null;
      };
      const ensureAnchorNode = (label, pos) => {
        let n = nodes.find(x => x.id === `tr_n_${label}`);
        if (n) return n;
        // find closest existing node near anchor, else create
        const near = nearestNode(pos);
        if (near && near.d <= 40) return near.node;
        const sampler = makeTerrainSampler(ctx);
        n = { id: `tr_n_${label}`, position: [Math.round(pos.x*100)/100, Math.round(sampler.heightAt(pos.x,pos.z)*100)/100, Math.round(pos.z*100)/100], layer: 'ground' };
        nodes.push(n); adj.set(n.id, new Set()); compOf.set(n.id, ++cid);
        ctx.report.repairs.push({ stage: stageId, code: 'add_anchor_node', id: n.id });
        return n;
      };

      const addConnector = (idBase, fromNode, toNode, code, message) => {
        const width = 8;
        const a = nodePos(fromNode), b = nodePos(toNode);
        const path = buildProfiledSegment(ctx, idBase, { x: a.x, z: a.z }, { x: b.x, z: b.z }, width, null);
        if (!path) {
          ctx.report.diagnostics.push(warn('transport_repair_failed', stageId, `could not create connector segment '${idBase}'`));
          return false;
        }
        // unique segment id
        let segId = idBase;
        const used = new Set(segments.map(s => s.id));
        if (used.has(segId)) { let k = 2; while (used.has(`${idBase}_${k}`)) k++; segId = `${idBase}_${k}`; }
        const seg = makeRoadSegment(segId, fromNode.id, toNode.id, path, width, 'local');
        segments.push(seg);
        // Keep road easement mask/index in sync with repaired network.
        let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
        for (const pt of path) { minX = Math.min(minX, pt[0]); maxX = Math.max(maxX, pt[0]); minZ = Math.min(minZ, pt[2]); maxZ = Math.max(maxZ, pt[2]); }
        const eas = { id: seg.id, minX, maxX, minZ, maxZ, width };
        if (!ctx.masks.easement) ctx.masks.easement = { rivers: [], roads: [] };
        ctx.masks.easement.roads = ctx.masks.easement.roads || [];
        ctx.masks.easement.roads.push(eas);
        ctx.spatial = ctx.spatial || {};
        if (ctx.spatial.roadEasements && typeof ctx.spatial.roadEasements.insert === 'function') {
          ctx.spatial.roadEasements.insert(eas);
        } else {
          const roadIdx = createSpatialIndex(ctx.meta.worldBounds ?? { size: ctx.input?.ground?.size ?? 256 });
          for (const r of ctx.masks.easement.roads) roadIdx.insert(r);
          ctx.spatial.roadEasements = roadIdx;
        }
        adj.get(fromNode.id)?.add(toNode.id); adj.get(toNode.id)?.add(fromNode.id);
        const mainC = compOf.get(fromNode.id);
        const otherC = compOf.get(toNode.id);
        if (mainC != null && otherC != null && mainC !== otherC) {
          for (const [nid, c] of compOf.entries()) if (c === otherC) compOf.set(nid, mainC);
        }
        ctx.report.repairs.push({ stage: stageId, code, id: seg.id, from: fromNode.id, to: toNode.id });
        ctx.report.diagnostics.push(info('transport_repaired_connectivity', stageId, message, { id: seg.id }));
        return true;
      };

      const spawnNode = ensureAnchorNode('spawn', spawnPos);
      const exitNode = ensureAnchorNode('exit', exitPos);
      const cSpawn = compOf.get(spawnNode.id);
      const cExit = compOf.get(exitNode.id);
      if (cSpawn && cExit && cSpawn !== cExit) {
        addConnector('tr_repair_connect', spawnNode, exitNode, 'connect_spawn_exit_components', 'added connector segment to join spawn/exit components');
      }

      // Connect any remaining disconnected components to the spawn/exit main component (deterministic).
      const mainC = compOf.get(spawnNode.id);
      if (mainC != null) {
        const byComp = new Map();
        for (const n of nodes) {
          const c = compOf.get(n.id);
          if (c == null) continue;
          if (!byComp.has(c)) byComp.set(c, []);
          byComp.get(c).push(n);
        }
        const otherComps = [...byComp.keys()]
          .filter(c => c !== mainC)
          .sort((a, b) => {
            const ak = byComp.get(a).map(n => String(n.id)).sort()[0] ?? '';
            const bk = byComp.get(b).map(n => String(n.id)).sort()[0] ?? '';
            return ak < bk ? -1 : ak > bk ? 1 : 0;
          });
        let extra = 0;
        for (const c of otherComps) {
          const mainNodes = nodes.filter(n => compOf.get(n.id) === mainC);
          const compNodes = byComp.get(c) || [];
          if (!mainNodes.length || !compNodes.length) continue;
          let best = null;
          for (const a of mainNodes) {
            const ap = nodePos(a);
            for (const b of compNodes) {
              const bp = nodePos(b);
              const d = Math.hypot(ap.x - bp.x, ap.z - bp.z);
              if (!best || d < best.d - 1e-9 ||
                (Math.abs(d - best.d) <= 1e-9 && (String(a.id) < String(best.a.id) || (String(a.id) === String(best.a.id) && String(b.id) < String(best.b.id))))) {
                best = { a, b, d };
              }
            }
          }
          if (!best) continue;
          extra++;
          addConnector(`tr_repair_connect_extra_${extra}`, best.a, best.b, 'connect_road_component', 'added connector segment to join disconnected road component');
        }
      }

      ctx.networks.roads.nodes = nodes;
      ctx.networks.roads.segments = segments;
    },
    emit(ctx) {
      if (ctx.input?.cityforge) {
        if (!ctx.input.cityforge.networks) ctx.input.cityforge.networks = {};
        ctx.input.cityforge.networks.roads = ctx.networks.roads;
      }
      ctx.engine = ctx.input;
    },
  };
}
