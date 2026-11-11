/**
 * Stage 5: infrastructure and props (TASK-007, MVP).
 * Generates deterministic street lights and simple visual props using existing
 * engine primitives (`lights`, `props`) with budgets/clearance guards.
 */
import { info } from '../diagnostics.mjs';
import { makeRng, mix } from '../rng.mjs';
import { createSpatialIndex } from '../spatial.mjs';
import { reliefOf } from '../../../src/relief.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function pathPoints(seg) {
  const pts = Array.isArray(seg?.path) ? seg.path.filter(p => Array.isArray(p) && p.length >= 3) : [];
  return pts.length >= 2 ? pts : null;
}

function distXZ(ax, az, bx, bz) { return Math.hypot(ax - bx, az - bz); }

function pointSegDistXZ(px, pz, ax, az, bx, bz) {
  const abx = bx - ax, abz = bz - az;
  const apx = px - ax, apz = pz - az;
  const ab2 = abx * abx + abz * abz || 1e-12;
  const t = clamp((apx * abx + apz * abz) / ab2, 0, 1);
  const cx = ax + abx * t, cz = az + abz * t;
  return Math.hypot(px - cx, pz - cz);
}

function minDistToRoads(x, z, segments = []) {
  let best = Infinity;
  for (const s of segments) {
    const pts = pathPoints(s); if (!pts) continue;
    for (let i = 0; i + 1 < pts.length; i++) {
      best = Math.min(best, pointSegDistXZ(x, z, pts[i][0], pts[i][2], pts[i + 1][0], pts[i + 1][2]));
    }
  }
  return best;
}

function nearElevatedRoad(x, z, segments = [], groundY = 0) {
  for (const s of segments) {
    const pts = pathPoints(s); if (!pts) continue;
    const w = (Array.isArray(s?.lanes) && s.lanes[0]?.width) ? s.lanes[0].width : (s.width ?? 8);
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], b = pts[i + 1];
      const d = pointSegDistXZ(x, z, a[0], a[2], b[0], b[2]);
      if (d > w * 0.5 + 5.0) continue;
      const y = Math.max(a[1] ?? groundY, b[1] ?? groundY);
      if (y > groundY + 0.15) return true;
    }
  }
  return false;
}

function pointInRect(x, z, r, pad = 0) {
  return x >= r.minX - pad && x <= r.maxX + pad && z >= r.minZ - pad && z <= r.maxZ + pad;
}

function footprintAabb(fp) {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const p of fp || []) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z); }
  return { minX, maxX, minZ, maxZ };
}

function pick(arr, rng) { return arr[Math.floor(rng() * arr.length) % arr.length]; }

function generateLights(ctx, stageId, cfg) {
  const roads = ctx.networks?.roads?.segments ?? [];
  if (!roads.length) {
    ctx.report.diagnostics.push(info('props_no_roads', stageId, 'no road segments available for street lights'));
    return;
  }
  if ((ctx.infrastructure.lights?.length ?? 0) > 0) {
    ctx.report.diagnostics.push(info('lights_passthrough', stageId, 'using declared lights', { lights: ctx.infrastructure.lights.length }));
    return;
  }
  const seed = mix(ctx.meta.seed ?? 0, stageId, 'lights');
  const rng = makeRng(seed);
  const REAL_LIGHT_CAP = 8;
  const existing = Array.isArray(ctx.input?.lights) ? ctx.input.lights.length : 0;
  const budget = clamp(Number.isInteger(cfg.lightBudget) ? cfg.lightBudget : REAL_LIGHT_CAP, 0, Math.max(0, REAL_LIGHT_CAP - existing));
  if (budget <= 0) {
    ctx.report.diagnostics.push(info('props_light_budget_exhausted', stageId, 'real light budget exhausted; skipping street lights'));
    return;
  }
  const sideOffset = clamp(Number(cfg.lightOffset) || 5.5, 2, 10);
  const height = clamp(Number(cfg.lightHeight) || 7.5, 4, 12);

  const samples = [];
  for (const seg of roads) {
    const pts = pathPoints(seg); if (!pts) continue;
    let total = 0;
    for (let i = 0; i + 1 < pts.length; i++) total += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][2] - pts[i][2]);
    for (const fr of [0.2, 0.5, 0.8]) {
      let need = total * fr, acc = 0;
      for (let i = 0; i + 1 < pts.length; i++) {
        const a = pts[i], b = pts[i + 1];
        const dx = b[0] - a[0], dz = b[2] - a[2], dy = b[1] - a[1];
        const len = Math.hypot(dx, dz); if (len < 1e-6) continue;
        if (acc + len >= need) {
          const t = (need - acc) / len;
          samples.push({ x: a[0] + dx * t, z: a[2] + dz * t, y: a[1] + dy * t, nx: -dz / len, nz: dx / len, w: 1 - Math.abs(fr - 0.5) });
          break;
        }
        acc += len;
      }
    }
  }
  for (let i = samples.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [samples[i], samples[j]] = [samples[j], samples[i]]; }
  // Deterministic spatial spread: greedily pick samples maximizing distance to already placed lights.
  const used = new Array(samples.length).fill(false);
  const lights = [];
  let skipped = 0;
  const minSep = 18;
  while (lights.length < budget) {
    let bestIdx = -1;
    let bestScore = -1;
    for (let i = 0; i < samples.length; i++) {
      if (used[i]) continue;
      const s = samples[i];
      // estimate both side candidates' feasibility roughly for scoring
      let nearest = Infinity;
      if (!lights.length) nearest = 1e9;
      else for (const o of lights) nearest = Math.min(nearest, distXZ(o.position.x, o.position.z, s.x, s.z));
      const score = nearest + s.w * 10; // spread first, slight center preference
      if (score > bestScore) { bestScore = score; bestIdx = i; }
    }
    if (bestIdx < 0) break;
    used[bestIdx] = true;
    const s = samples[bestIdx];
    const side = (rng() < 0.5 ? -1 : 1);
    const lx = Math.round((s.x + s.nx * side * sideOffset) * 100) / 100;
    const lz = Math.round((s.z + s.nz * side * sideOffset) * 100) / 100;
    const ly = Math.round((s.y + height) * 100) / 100;
    if (lights.some(o => distXZ(o.position.x, o.position.z, lx, lz) < minSep)) { skipped++; continue; }
    lights.push({ id: `sl_${lights.length + 1}`, type: 'point', position: { x: lx, y: ly, z: lz }, color: 0xffd8a8, intensity: 38, distance: 45 });
  }
  ctx.infrastructure.lights = lights;
  ctx.report.diagnostics.push(info('street_lights_generated', stageId, 'generated street lights along roads', { count: lights.length, budget, skipped }));
}

function generateProps(ctx, stageId, cfg) {
  if ((ctx.infrastructure.props?.length ?? 0) > 0) {
    ctx.report.diagnostics.push(info('props_passthrough', stageId, 'using declared props', { props: ctx.infrastructure.props.length }));
    return;
  }
  const seed = mix(ctx.meta.seed ?? 0, stageId, 'props');
  const rng = makeRng(seed);
  const roads = ctx.networks?.roads?.segments ?? [];
  const riverLike = [
    ...(ctx.hydrology?.rivers ?? []),
    ...(ctx.landscape?.hydrology?.rivers ?? []),
    ...(ctx.input?.waterways ?? []),
    ...(ctx.input?.cityforge?.hydrology?.rivers ?? []),
    ...(ctx.input?.cityforge?.landscape?.hydrology?.rivers ?? []),
  ];
  const rivers = riverLike.map(r => ({
    width: r.width ?? 10,
    path: r.path ?? (Array.isArray(r.points) ? r.points.map(p => [p.x, 0, p.z]) : []),
  }));
  // Use river segment spatial index only when it represents the same hydrology set as checked here.
  const hydro = ctx.hydrology?.rivers ?? [];
  const cfHydro = ctx.input?.cityforge?.hydrology?.rivers;
  const riverIndex = (ctx.spatial?.riverSegments && riverLike.length === hydro.length &&
    !(ctx.landscape?.hydrology?.rivers?.length) && !(ctx.input?.waterways?.length) &&
    !(ctx.input?.cityforge?.landscape?.hydrology?.rivers?.length) &&
    (cfHydro === hydro || !cfHydro))
    ? ctx.spatial.riverSegments : null;
  const buildings = ctx.buildings ?? [];
  const districts = ctx.districts ?? [];
  const parcels = ctx.parcels ?? [];
  const anchors = [
    ctx.input?.gameplay?.spawn ? { x: ctx.input.gameplay.spawn.x, z: ctx.input.gameplay.spawn.z } : null,
    ctx.input?.gameplay?.exit ? { x: ctx.input.gameplay.exit.x, z: ctx.input.gameplay.exit.z } : null,
  ].filter(Boolean);
  const buildingIndex = ctx.spatial?.buildings ?? null;
  const buildingRects = buildingIndex ? null : buildings.map(b => footprintAabb(b.footprint));
  const baseGroundY = ctx.input?.ground?.y ?? 0;
  let landHeightAt = () => baseGroundY;
  try {
    const mods = ctx.terrain?.modifiers ?? ctx.input?.cityforge?.terrain?.modifiers ?? [];
    const hills = mods.map((m, i) => {
      if (!m || typeof m !== 'object') return null;
      if (m.type !== 'mountain' && m.type !== 'valley') return null;
      const center = Array.isArray(m.center) ? m.center : [Number(m.center?.x) || 0, Number(m.center?.z) || 0];
      const path = Array.isArray(m.path) && m.path.length >= 2 ? m.path : null;
      const ax = path ? (Array.isArray(path[0]) ? path[0][0] : center[0]) : center[0];
      const az = path ? (Array.isArray(path[0]) ? path[0][1] : center[1]) : center[1];
      const bx = path ? (Array.isArray(path[path.length - 1]) ? path[path.length - 1][0] : center[0]) : center[0];
      const bz = path ? (Array.isArray(path[path.length - 1]) ? path[path.length - 1][1] : center[1]) : center[1];
      const radius = Number.isFinite(m.radius) ? m.radius : 0;
      const height = Number.isFinite(m.height) ? m.height : 0;
      if (!(radius > 0)) return null;
      const signed = m.operation === 'subtract' ? -height : height;
      return { id: m.id ?? `hill_${i}`, x: ax, z: az, bx, bz, radius, height: signed };
    }).filter(Boolean);
    // Use hills-only relief for land height; river areas are excluded geometrically.
    const rel = reliefOf({ baseY: baseGroundY, hills, pads: [], rivers: [], roadCorridors: [] });
    landHeightAt = (x, z) => rel.heightAt(x, z);
  } catch {
    // fallback to groundY
  }

  const tooCloseToRiver = (x, z) => {
    if (riverIndex) {
      const pad = 25;
      const candidates = riverIndex.query({ minX: x - pad, maxX: x + pad, minZ: z - pad, maxZ: z + pad });
      for (const seg of candidates) {
        const w = (seg.width ?? 10) * 0.5 + 12.0;
        if (pointSegDistXZ(x, z, seg.ax, seg.az, seg.bx, seg.bz) < w) return true;
      }
      return false;
    }
    return rivers.some(rv => (rv.path || []).some((pt, i, a) => {
      if (i + 1 >= a.length) return false;
      const w = (rv.width ?? 10) * 0.5 + 12.0;
      return pointSegDistXZ(x, z, pt[0], pt[2], a[i + 1][0], a[i + 1][2]) < w;
    }));
  };
  const roadEaseIndex = ctx.spatial?.roadEasements ?? null;
  const blocked = (x, z, roadPad = 4.0) => {
    if (roads.length) {
      // Cheap prefilter: point must be within roadPad of some road path AABB to be near a segment.
      const maybeNearRoad = !roadEaseIndex || roadEaseIndex.query({ minX: x - roadPad, maxX: x + roadPad, minZ: z - roadPad, maxZ: z + roadPad }).length > 0;
      if (maybeNearRoad && minDistToRoads(x, z, roads) < roadPad) return true;
      const maybeElevated = !roadEaseIndex || roadEaseIndex.query({ minX: x - 10, maxX: x + 10, minZ: z - 10, maxZ: z + 10 }).length > 0;
      if (maybeElevated && nearElevatedRoad(x, z, roads, baseGroundY)) return true;
    }
    if (tooCloseToRiver(x, z)) return true;
    if (anchors.some(a => distXZ(x, z, a.x, a.z) < 8)) return true;
    if (buildingIndex) {
      if (buildingIndex.query({ minX: x - 2.0, maxX: x + 2.0, minZ: z - 2.0, maxZ: z + 2.0 }).length) return true;
    } else if (buildingRects.some(r => pointInRect(x, z, r, 2.0))) {
      return true;
    }
    return false;
  };

  const size = ctx.meta.worldBounds?.size ?? ctx.input?.ground?.size ?? 256;
  const budget = clamp(Number.isInteger(cfg.objectBudget) ? cfg.objectBudget : Math.round(size / 3), 40, 320);
  const out = [];
  const placedPropIndex = createSpatialIndex(ctx.meta.worldBounds ?? { size }, 32);
  let attempts = 0;
  const tryPlace = (model, x, _y, z, rotY = 0, scale = { x: 1, y: 1, z: 1 }, roadPad = 3.5, minSep = 4) => {
    attempts++;
    if (out.length >= budget) return false;
    if (!Number.isFinite(x) || !Number.isFinite(z)) return false;
    if (blocked(x, z, roadPad)) return false;
    const near = placedPropIndex.query({ minX: x - minSep, maxX: x + minSep, minZ: z - minSep, maxZ: z + minSep });
    if (near.some(p => distXZ(p.position.x, p.position.z, x, z) < minSep)) return false;
    const y = landHeightAt(x, z);
    if (!Number.isFinite(y)) return false;
    // avoid placing in river bed / underwater depressions
    if (y < baseGroundY - 0.2) return false;
    const prop = {
      id: `prop_${out.length + 1}`,
      model,
      position: { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100, z: Math.round(z * 100) / 100 },
      rotation: { x: 0, y: Math.round(rotY), z: 0 },
      scale: { x: +scale.x.toFixed(3), y: +scale.y.toFixed(3), z: +scale.z.toFixed(3) },
    };
    out.push(prop);
    placedPropIndex.insert({ id: prop.id, x: prop.position.x, z: prop.position.z, position: prop.position, minX: prop.position.x, maxX: prop.position.x, minZ: prop.position.z, maxZ: prop.position.z });
    return true;
  };
  const tryPlaceNear = (model, cx, cz, _baseY, spreadX, spreadZ, tries, rotYFn, scaleFn, roadPad, minSep) => {
    for (let i = 0; i < tries && out.length < budget; i++) {
      const jx = (rng() - 0.5) * spreadX;
      const jz = (rng() - 0.5) * spreadZ;
      const rotY = typeof rotYFn === 'function' ? rotYFn() : rotYFn;
      const scale = typeof scaleFn === 'function' ? scaleFn() : scaleFn;
      if (tryPlace(model, cx + jx, 0, cz + jz, rotY, scale, roadPad, minSep)) return true;
    }
    return false;
  };

  const districtById = new Map(districts.map(d => [d.id, d]));

  // Roadside elements along flat/ground road segments first (visual priority), spread along segments.
  const roadsideCap = Math.min(36, Math.floor(budget * 0.12));
  for (const seg of roads) {
    if (out.length >= roadsideCap) break;
    const pts = pathPoints(seg); if (!pts) continue;
    const baseYRoad = ctx.input?.ground?.y ?? 0;
    for (let i = 0; i + 1 < pts.length && out.length < roadsideCap; i++) {
      const a = pts[i], b = pts[i + 1];
      const dx = b[0] - a[0], dz = b[2] - a[2];
      const len = Math.hypot(dx, dz); if (len < 28) continue;
      if (Math.abs((a[1] ?? baseYRoad) - baseYRoad) > 0.1 || Math.abs((b[1] ?? baseYRoad) - baseYRoad) > 0.1) continue;
      const samples = len >= 90 ? [0.25, 0.5, 0.75] : [0.5];
      for (const t of samples) {
        if (out.length >= roadsideCap) break;
        const x = a[0] + dx * t, z = a[2] + dz * t;
        const nx = -dz / len, nz = dx / len;
        const side = rng() < 0.5 ? -1 : 1;
        const off = 6.6 + rng() * 0.8;
        const r = rng();
        if (r < 0.16) tryPlace('bollard', x + nx * side * off, baseYRoad, z + nz * side * off, 0, { x: 1, y: 1, z: 1 }, 3.2, 5);
        else if (r < 0.24) tryPlace('bench', x + nx * side * off, baseYRoad, z + nz * side * off, Math.atan2(dx, dz) * 180 / Math.PI, { x: 1, y: 1, z: 1 }, 3.4, 5.5);
        else if (r < 0.32) tryPlace('tree', x + nx * side * off, baseYRoad, z + nz * side * off, rng() * 360, { x: 0.85, y: 0.85, z: 0.85 }, 3.6, 5.5);
      }
    }
  }

  // District-driven props with soft per-type budget balance (representation across district types).
  const parcelOrder = Array.isArray(parcels) ? parcels.slice() : [];
  for (let i = parcelOrder.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [parcelOrder[i], parcelOrder[j]] = [parcelOrder[j], parcelOrder[i]];
  }
  const parcelsByType = new Map();
  for (const p of parcelOrder) {
    const d = districtById.get(p.districtId);
    const type = d?.type || p.type || 'residential';
    if (!parcelsByType.has(type)) parcelsByType.set(type, 0);
    parcelsByType.set(type, parcelsByType.get(type) + 1);
  }
  const totalParcels = Math.max(1, parcelOrder.length);
  const districtBudget = Math.max(0, budget - out.length);
  // Type weights bias greenery/sports/public areas a bit while keeping parcel-proportional balance.
  const typeWeight = (t) => ({ park: 1.35, forest: 1.2, sports: 1.15, residential: 1.0, luxury: 1.0, office: 0.95, slums: 0.95, industrial: 0.8, parking: 0.75 }[t] ?? 1.0);
  const typeQuota = new Map();
  let quotaSum = 0;
  for (const [t, n] of parcelsByType.entries()) {
    const q = Math.max(1, Math.round(districtBudget * ((n / totalParcels) * typeWeight(t))));
    typeQuota.set(t, q);
    quotaSum += q;
  }
  // Normalize quotas to districtBudget (deterministic by sorted type order).
  if (quotaSum > districtBudget && districtBudget > 0) {
    let over = quotaSum - districtBudget;
    const typesSorted = [...typeQuota.keys()].sort();
    while (over > 0) {
      let changed = false;
      for (const t of typesSorted) {
        if (over <= 0) break;
        const q = typeQuota.get(t);
        if (q > 1) { typeQuota.set(t, q - 1); over--; changed = true; }
      }
      if (!changed) break;
    }
  }
  const placedByType = new Map([...parcelsByType.keys()].map(t => [t, 0]));

  const placeDistrictProp = (model, cx, cz, _baseY, spreadX, spreadZ, tries, rotYFn, scaleFn, roadPad, minSep, type) => {
    for (let i = 0; i < tries && out.length < budget; i++) {
      const jx = (rng() - 0.5) * spreadX;
      const jz = (rng() - 0.5) * spreadZ;
      const rotY = typeof rotYFn === 'function' ? rotYFn() : rotYFn;
      const scale = typeof scaleFn === 'function' ? scaleFn() : scaleFn;
      if (tryPlace(model, cx + jx, 0, cz + jz, rotY, scale, roadPad, minSep)) {
        if (type) placedByType.set(type, (placedByType.get(type) || 0) + 1);
        return true;
      }
    }
    return false;
  };

  for (const p of parcelOrder) {
    if (out.length >= budget) break;
    const d = districtById.get(p.districtId);
    const type = d?.type || p.type || 'residential';
    // Soft cap: once type reached its quota, skip most placements so other types can catch up.
    const q = typeQuota.get(type) ?? 0;
    const used = placedByType.get(type) ?? 0;
    if (q > 0 && used >= q && rng() < 0.85) continue;

    const b = p.rect ?? p.aabb; if (!b) continue;
    const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
    const area = (b.maxX - b.minX) * (b.maxZ - b.minZ);
    const baseY = ctx.input?.ground?.y ?? 0;

    if (type === 'park' || type === 'forest') {
      const count = clamp(Math.round(area / (type === 'forest' ? 700 : 1000)), 1, 6);
      for (let i = 0; i < count && out.length < budget; i++) {
        const s = 0.85 + rng() * 0.55;
        placeDistrictProp('tree', cx, cz, baseY, (b.maxX - b.minX) * 0.58, (b.maxZ - b.minZ) * 0.58, 5, () => rng() * 360, () => ({ x: s, y: s, z: s }), 5.2, type === 'forest' ? 2.8 : 3.5, type);
      }
      if (type === 'park' && rng() < 0.9) placeDistrictProp('bench', cx, cz, baseY, 14, 14, 5, () => rng() * 360, { x: 1, y: 1, z: 1 }, 5.2, 3.2, type);
      if (type === 'park' && rng() < 0.5) placeDistrictProp('tree', cx, cz, baseY, (b.maxX - b.minX) * 0.48, (b.maxZ - b.minZ) * 0.48, 4, () => rng() * 360, () => { const s = 0.8 + rng() * 0.45; return { x: s, y: s, z: s }; }, 5.2, 3.2, type);
      if (type === 'park' && rng() < 0.25) placeDistrictProp(pick(['bollard', 'bench'], rng), cx, cz, baseY, 10, 10, 3, () => rng() * 360, { x: 1, y: 1, z: 1 }, 5.0, 3.2, type);
      if (type === 'forest' && rng() < 0.35) placeDistrictProp(pick(['wire_spool', 'barrier', 'tree'], rng), cx, cz, baseY, 12, 12, 3, () => rng() * 360, () => { const s = 0.75 + rng() * 0.4; return { x: s, y: s, z: s }; }, 5.0, 3.0, type);
    } else if (type === 'residential' || type === 'luxury' || type === 'office') {
      if (rng() < 0.5) placeDistrictProp('tree', cx, cz, baseY, (b.maxX - b.minX) * 0.38, (b.maxZ - b.minZ) * 0.38, 4, () => rng() * 360, { x: 0.9, y: 0.9, z: 0.9 }, 4.8, 3.8, type);
      if (rng() < 0.4) placeDistrictProp('bench', cx, cz, baseY, (b.maxX - b.minX) * 0.32, (b.maxZ - b.minZ) * 0.32, 4, () => rng() * 360, { x: 1, y: 1, z: 1 }, 4.8, 3.2, type);
      if ((type === 'office' || type === 'luxury') && rng() < 0.3) placeDistrictProp(pick(['bollard', 'ac_unit', 'vent'], rng), cx, cz, baseY, (b.maxX - b.minX) * 0.3, (b.maxZ - b.minZ) * 0.3, 3, () => rng() * 360, { x: 1, y: 1, z: 1 }, 4.5, 3, type);
      if (type === 'luxury' && rng() < 0.22) placeDistrictProp(pick(['antenna', 'av_pad'], rng), cx, cz, baseY, (b.maxX - b.minX) * 0.25, (b.maxZ - b.minZ) * 0.25, 2, () => rng() * 360, { x: 1, y: 1, z: 1 }, 4.8, 3.5, type);
      if (type === 'office' && rng() < 0.22) placeDistrictProp(pick(['ac_unit', 'vent', 'water_tank'], rng), cx, cz, baseY, (b.maxX - b.minX) * 0.25, (b.maxZ - b.minZ) * 0.25, 2, () => rng() * 360, { x: 1, y: 1, z: 1 }, 4.8, 3.5, type);
    } else if (type === 'industrial' || type === 'parking') {
      if (rng() < 0.55) placeDistrictProp(pick(['container', 'barrier', 'wire_spool', 'water_tank'], rng), cx, cz, baseY, (b.maxX - b.minX) * 0.3, (b.maxZ - b.minZ) * 0.3, 3, () => rng() * 360, { x: 1, y: 1, z: 1 }, 4.8, 4, type);
      if (type === 'parking' && rng() < 0.45) placeDistrictProp(pick(['bollard', 'barrier'], rng), cx, cz, baseY, (b.maxX - b.minX) * 0.4, (b.maxZ - b.minZ) * 0.4, 3, () => rng() * 360, { x: 1, y: 1, z: 1 }, 4.2, 3, type);
      if (type === 'industrial' && rng() < 0.3) placeDistrictProp(pick(['barrier', 'ac_unit', 'vent'], rng), cx, cz, baseY, (b.maxX - b.minX) * 0.25, (b.maxZ - b.minZ) * 0.25, 2, () => rng() * 360, { x: 1, y: 1, z: 1 }, 4.8, 3.5, type);
    } else if (type === 'slums') {
      if (rng() < 0.45) placeDistrictProp(pick(['barrier', 'container', 'bench', 'market_stall'], rng), cx, cz, baseY, 14, 14, 3, () => rng() * 360, { x: 1, y: 1, z: 1 }, 4.8, 3.5, type);
      if (rng() < 0.2) placeDistrictProp(pick(['wire_spool', 'water_tank'], rng), cx, cz, baseY, 10, 10, 2, () => rng() * 360, { x: 1, y: 1, z: 1 }, 4.8, 3.5, type);
    } else if (type === 'sports') {
      if (rng() < 0.4) placeDistrictProp('bench', cx, cz, baseY, 12, 12, 3, () => rng() * 360, { x: 1, y: 1, z: 1 }, 5.0, 3.5, type);
      if (rng() < 0.3) placeDistrictProp(pick(['tree', 'bollard'], rng), cx, cz, baseY, 10, 10, 3, () => rng() * 360, { x: 0.9, y: 0.9, z: 0.9 }, 5.0, 4, type);
      if (rng() < 0.15) placeDistrictProp('av_pad', cx, cz, baseY, 8, 8, 2, () => rng() * 360, { x: 1, y: 1, z: 1 }, 5.0, 4, type);
    }
  }



  ctx.infrastructure.props = out;
  const byDistrictType = {};
  for (const [t, n] of placedByType.entries()) if (n > 0) byDistrictType[t] = n;
  ctx.report.diagnostics.push(info('props_generated', stageId, 'generated district props', { count: out.length, budget, attempts, byDistrictType }));
}

export function makeStage5() {
  return {
    id: '5_infrastructure_props',
    prepare(ctx) {
      ctx.infrastructure = {
        lights: Array.isArray(ctx.input?.lights) ? structuredClone(ctx.input.lights) : [],
        props: Array.isArray(ctx.input?.props) ? structuredClone(ctx.input.props) : [],
      };
    },
    generate(ctx) {
      const stageId = '5_infrastructure_props';
      const gen = ctx.input?.generator ?? {};
      const cfg = gen.props ?? gen.infrastructure ?? {};
      if (cfg.enabled === false) {
        ctx.report.diagnostics.push(info('props_disabled', stageId, 'infrastructure/props generation disabled'));
        return;
      }
      generateLights(ctx, stageId, cfg);
      generateProps(ctx, stageId, cfg);
    },
    validate(ctx) {
      const stageId = '5_infrastructure_props';
      if (!Array.isArray(ctx.infrastructure?.lights)) ctx.infrastructure.lights = [];
      if (!Array.isArray(ctx.infrastructure?.props)) ctx.infrastructure.props = [];

      const okLights = [];
      for (const l of ctx.infrastructure.lights) {
        const p = l?.position;
        if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.z)) {
          ctx.report.drops.push({ stage: stageId, id: l?.id ?? null, reason: 'invalid_light' });
          continue;
        }
        okLights.push(l);
      }
      ctx.infrastructure.lights = okLights;

      const okProps = [];
      for (const p of ctx.infrastructure.props) {
        const pos = p?.position;
        if (!p?.id || !p?.model || !pos || !Number.isFinite(pos.x) || !Number.isFinite(pos.y) || !Number.isFinite(pos.z)) {
          ctx.report.drops.push({ stage: stageId, id: p?.id ?? null, reason: 'invalid_prop' });
          continue;
        }
        okProps.push(p);
      }
      ctx.infrastructure.props = okProps;
    },
    repair(_ctx) {},
    emit(ctx) {
      if (ctx.infrastructure?.lights?.length) {
        ctx.input.lights = Array.isArray(ctx.input.lights) ? ctx.input.lights.concat(ctx.infrastructure.lights) : ctx.infrastructure.lights;
      }
      if (ctx.infrastructure?.props?.length) {
        // v2/open schema accepts landscapeObjects; normalizeLevel converts them to props.
        ctx.input.landscapeObjects = Array.isArray(ctx.input.landscapeObjects)
          ? ctx.input.landscapeObjects.concat(ctx.infrastructure.props)
          : ctx.infrastructure.props;
      }
      ctx.engine = ctx.input;
    },
  };
}
