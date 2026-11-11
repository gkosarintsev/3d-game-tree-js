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

function makeRoadSegment(id, from, to, path, width, type = 'local') {
  return {
    id, from, to, type, layer: 'ground', path,
    lanes: [{ id: `${id}_lane_1`, direction: 'forward', width, type: 'vehicle' }],
    shoulderWidth: 1, sidewalk: false, surface: 'asphalt',
  };
}

function buildProfiledSegment(ctx, segId, a2, b2, width, viaPoints = null) {
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
      const halfSpan = clamp((cr.river.width ?? 10) * 0.5 + 6, 8, Math.max(8, len * 0.45));
      const ds = halfSpan / len;
      const s1 = clamp(cr.s - ds, 0.02, 0.98);
      const s2 = clamp(cr.s + ds, s1 + 0.02, 0.99);
      // ramp up to deck
      keys.push({ s: s1, y: Math.max(sampler.heightAt(a.x + dx*s1, a.z + dz*s1), groundY) });
      keys.push({ s: (s1 + cr.s) / 2, y: cr.deckH });
      keys.push({ s: cr.s, y: cr.deckH });
      keys.push({ s: (cr.s + s2) / 2, y: cr.deckH });
      keys.push({ s: s2, y: Math.max(sampler.heightAt(a.x + dx*s2, a.z + dz*s2), groundY) });
      report?.diagnostics.push(info('transport_bridge_profiled', stageId, `segment crossing river '${cr.river?.id ?? '?'}' bridged (deck ${cr.deckH.toFixed(2)}m)`, { river: cr.river?.id ?? null, deckH: cr.deckH }));
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

  const mainPath = buildAxisRoutePath(pts2d, sampler, rivers, groundY, stageId, ctx.report);
  if (!mainPath || mainPath.length < 2) return;

  const nodes = [
    { id: 'tr_n_spawn', position: mainPath[0].slice(), layer: 'ground' },
    { id: 'tr_n_exit', position: mainPath[mainPath.length - 1].slice(), layer: 'ground' },
  ];
  const segments = [makeRoadSegment('tr_main', 'tr_n_spawn', 'tr_n_exit', mainPath, width, 'arterial')];

  const requested = clamp(Number.isInteger(tc.branches) ? tc.branches : 0, 0, 4);
  const made = 0;
  if (requested > 0) {
    ctx.report.diagnostics.push(warn('transport_branches_deferred', stageId, `procedural branch generation deferred (${requested} requested) pending axis/slope-valid profiling`, { requested }));
  }

  ctx.networks.roads.nodes = nodes;
  ctx.networks.roads.segments = segments;
  ctx.networks.roads.junctions = [];
  ctx.report.diagnostics.push(info('transport_generated', stageId, 'stage 2 generated road network', { nodes: nodes.length, segments: segments.length, seed, branches: made, profiled: true }));
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
        // river easement conflict: path points inside river corridor at low relative elevation
        const rivers = ctx.hydrology?.rivers ?? ctx.input?.cityforge?.hydrology?.rivers ?? [];
        if (pts && rivers.length) {
          let conflicts = 0;
          for (const p of pts) {
            const near = riverMinDistXZAt(p[0], p[2], rivers);
            if (near.river) {
              const margin = (near.river.width ?? 10) * 0.5 + 1;
              const bed = (ctx.meta.worldBounds?.y ?? ctx.input?.ground?.y ?? 0) - (Number.isFinite(near.river.depth) ? near.river.depth : 2);
              if (near.d < margin && p[1] < bed + 1.2) conflicts++;
            }
          }
          if (conflicts) ctx.report.diagnostics.push(warn('road_river_conflict', stageId, `segment '${s.id}' has ${conflicts} point(s) inside river corridor`, { id: s.id, count: conflicts }));
        }
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
      const nearestNode = (pos) => {
        let best = null, bestD = Infinity;
        for (const n of nodes) {
          const p = Array.isArray(n.position) ? n.position : [0,0,0];
          const d = Math.hypot((p[0]??0)-pos.x, (p[2]??0)-pos.z);
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
      const spawnNode = ensureAnchorNode('spawn', spawnPos);
      const exitNode = ensureAnchorNode('exit', exitPos);
      const cSpawn = compOf.get(spawnNode.id);
      const cExit = compOf.get(exitNode.id);
      if (cSpawn && cExit && cSpawn !== cExit) {
        const width = 8;
        const path = buildProfiledSegment(ctx, 'tr_repair_connect', { x: spawnNode.position[0], z: spawnNode.position[2] }, { x: exitNode.position[0], z: exitNode.position[2] }, width, null);
        if (path) {
          const seg = makeRoadSegment('tr_repair_connect', spawnNode.id, exitNode.id, path, width, 'local');
          segments.push(seg);
          adj.get(spawnNode.id)?.add(exitNode.id); adj.get(exitNode.id)?.add(spawnNode.id);
          const merged = compOf.get(exitNode.id);
          for (const [nid, c] of compOf.entries()) if (c === merged) compOf.set(nid, compOf.get(spawnNode.id));
          ctx.report.repairs.push({ stage: stageId, code: 'connect_spawn_exit_components', id: seg.id });
          ctx.report.diagnostics.push(info('transport_repaired_connectivity', stageId, 'added connector segment to join spawn/exit components', { id: seg.id }));
        } else {
          ctx.report.diagnostics.push(warn('transport_repair_failed', stageId, 'could not create connector segment for spawn/exit connectivity'));
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
