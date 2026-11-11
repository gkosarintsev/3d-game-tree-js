/**
 * Stage 4: buildings and large structures (TASK-006, incremental MVP).
 * Places simple deterministic buildings on parcels by district profile, emitting
 * engine-compatible building definitions (no new primitives). Static only.
 */
import { info, warn } from '../diagnostics.mjs';
import { makeRng, mix } from '../rng.mjs';
import { createSpatialIndex } from '../spatial.mjs';
import { addAxisAlignedAccessRoadsForParcels } from './stage-2-transport.mjs';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const EPS = 1e-9;

function pick(arr, rng) { return arr[Math.floor(rng() * arr.length) % arr.length]; }

function footprintRect(cx, cz, w, d) {
  const hx = w / 2, hz = d / 2;
  // CCW
  return [
    { x: +(cx - hx).toFixed(3), z: +(cz - hz).toFixed(3) },
    { x: +(cx + hx).toFixed(3), z: +(cz - hz).toFixed(3) },
    { x: +(cx + hx).toFixed(3), z: +(cz + hz).toFixed(3) },
    { x: +(cx - hx).toFixed(3), z: +(cz + hz).toFixed(3) },
  ];
}

function aabbOfFootprint(fp) {
  let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;
  for (const p of fp) { minX=Math.min(minX,p.x); maxX=Math.max(maxX,p.x); minZ=Math.min(minZ,p.z); maxZ=Math.max(maxZ,p.z); }
  return { minX,maxX,minZ,maxZ };
}

function pointSegDistXZ(px, pz, ax, az, bx, bz) {
  const abx = bx - ax, abz = bz - az, apx = px - ax, apz = pz - az;
  const ab2 = abx * abx + abz * abz;
  const t = ab2 > EPS ? clamp((apx * abx + apz * abz) / ab2, 0, 1) : 0;
  return Math.hypot(px - (ax + abx * t), pz - (az + abz * t));
}

function footprintIntersectsRiver(fp, rivers = [], riverIndex = null) {
  const b = aabbOfFootprint(fp);
  const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
  const corners = [[b.minX,b.minZ],[b.maxX,b.minZ],[b.maxX,b.maxZ],[b.minX,b.maxZ],[cx,cz]];
  if (riverIndex) {
    const pad = 30;
    const candidates = riverIndex.query({ minX: b.minX - pad, maxX: b.maxX + pad, minZ: b.minZ - pad, maxZ: b.maxZ + pad });
    for (const seg of candidates) {
      const clearance = (seg.width ?? 10) * 0.5 + 20.0;
      for (const [px,pz] of corners) {
        if (pointSegDistXZ(px, pz, seg.ax, seg.az, seg.bx, seg.bz) < clearance) return true;
      }
      if (pointSegDistXZ(cx, cz, seg.ax, seg.az, seg.bx, seg.bz) < clearance) return true;
    }
    return false;
  }
  for (const rv of rivers) {
    const path = rv.path ?? [];
    // Be conservative: include banks/bed margins used by compiled waterway/channel checks.
    const clearance = (rv.width ?? 10) * 0.5 + 20.0;
    for (let i = 0; i + 1 < path.length; i++) {
      const a = path[i], c = path[i+1];
      for (const [px,pz] of corners) {
        if (pointSegDistXZ(px,pz,a[0],a[2],c[0],c[2]) < clearance) return true;
      }
      // centerline near box center
      if (pointSegDistXZ(cx,cz,a[0],a[2],c[0],c[2]) < clearance) return true;
    }
  }
  return false;
}

function footprintIntersectsRoad(fp, roads = [], roadSegments = [], roadIndex = null) {
  const b = aabbOfFootprint(fp);
  const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
  const samplePts = [[b.minX,b.minZ],[b.maxX,b.minZ],[b.maxX,b.maxZ],[b.minX,b.maxZ],[cx,cz]];
  const padMax = 16; // conservative query margin (typ lane half-width + clearance)
  const candidates = roadIndex
    ? roadIndex.query({ minX: b.minX - padMax, maxX: b.maxX + padMax, minZ: b.minZ - padMax, maxZ: b.maxZ + padMax })
    : roads;
  for (const r of candidates) {
    if (r && Number.isFinite(r.minX)) {
      const pad = (r.width ?? 8) * 0.5 + 1.5;
      if (b.maxX >= r.minX - pad && b.minX <= r.maxX + pad && b.maxZ >= r.minZ - pad && b.minZ <= r.maxZ + pad) return true;
    }
  }
  for (const s of roadSegments) {
    const pts = Array.isArray(s?.path) ? s.path : [];
    if (pts.length < 2) continue;
    const w = (Array.isArray(s.lanes) && s.lanes[0]?.width) ? s.lanes[0].width : 8;
    const clearance = w * 0.5 + 2.0;
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], c = pts[i+1];
      for (const [px,pz] of samplePts) {
        if (pointSegDistXZ(px,pz,a[0],a[2],c[0],c[2]) < clearance) return true;
      }
    }
  }
  return false;
}

function minDistanceToRoadSegments(x, z, roadSegments = []) {
  let best = Infinity;
  for (const s of roadSegments) {
    const pts = Array.isArray(s?.path) ? s.path : [];
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], c = pts[i+1];
      best = Math.min(best, pointSegDistXZ(x, z, a[0], a[2], c[0], c[2]));
    }
  }
  return best;
}

function footprintNearAnchors(fp, anchors = [], margin = 8) {
  const b = aabbOfFootprint(fp);
  for (const a of anchors) {
    if (a.x >= b.minX - margin && a.x <= b.maxX + margin && a.z >= b.minZ - margin && a.z <= b.maxZ + margin) return true;
  }
  return false;
}

function materialFor(profile, kind, rng) {
  const ARCH_MATS = {
    office_tower: ['glass_and_concrete', 'concrete'],
    office_mid: ['glass_and_concrete', 'concrete', 'painted_brick'],
    apartment_block: ['painted_brick', 'concrete'],
    residential_low: ['painted_brick', 'stone_base'],
    residential_mid: ['painted_brick', 'concrete'],
    townhouse: ['painted_brick', 'stone_base'],
    cottage: ['painted_brick', 'stone_base'],
    villa: ['stone_base', 'glass_and_concrete', 'painted_brick'],
    historic_block: ['stone_base', 'painted_brick'],
    shop_row: ['painted_brick', 'concrete', 'glass_and_concrete'],
    mall: ['concrete', 'glass_and_concrete'],
    market_hall: ['painted_brick', 'rusted_metal', 'concrete'],
    warehouse: ['concrete', 'rusted_metal'],
    factory: ['concrete', 'rusted_metal'],
    workshop: ['concrete', 'rusted_metal', 'painted_brick'],
    sports_hall: ['concrete', 'glass_and_concrete'],
    pavilion: ['painted_brick', 'concrete'],
    campus_hall: ['concrete', 'painted_brick', 'glass_and_concrete'],
    shack: ['rusted_metal', 'painted_brick'],
    booth: ['concrete', 'painted_brick'],
  };
  const km = ARCH_MATS[kind];
  if (Array.isArray(km) && km.length) return pick(km, rng);
  const mats = profile?.buildings?.materials;
  if (Array.isArray(mats) && mats.length) return pick(mats, rng);
  return 'concrete';
}

const ARCHETYPES = {
  office_tower:    { floors: [10, 20], floorHeight: [3.5, 3.8], scale: [0.45, 0.62], aspect: [0.7, 1.3] },
  office_mid:      { floors: [4, 9],   floorHeight: [3.4, 3.7], scale: [0.5, 0.72],  aspect: [0.75, 1.35] },
  apartment_block: { floors: [4, 9],   floorHeight: [3.1, 3.4], scale: [0.58, 0.78], aspect: [1.2, 2.1] },
  residential_low: { floors: [1, 3],   floorHeight: [3.0, 3.3], scale: [0.45, 0.68], aspect: [0.8, 1.4] },
  residential_mid: { floors: [3, 7],   floorHeight: [3.1, 3.4], scale: [0.5, 0.72],  aspect: [0.85, 1.5] },
  townhouse:       { floors: [2, 4],   floorHeight: [3.0, 3.3], scale: [0.42, 0.62], aspect: [0.55, 0.95] },
  cottage:         { floors: [1, 2],   floorHeight: [3.0, 3.3], scale: [0.38, 0.58], aspect: [0.75, 1.35] },
  villa:           { floors: [1, 3],   floorHeight: [3.2, 3.6], scale: [0.4, 0.6],   aspect: [0.8, 1.25] },
  historic_block:  { floors: [2, 5],   floorHeight: [3.2, 3.5], scale: [0.52, 0.72], aspect: [0.7, 1.2] },
  shop_row:        { floors: [1, 3],   floorHeight: [3.4, 3.8], scale: [0.55, 0.78], aspect: [1.4, 2.4] },
  mall:            { floors: [1, 3],   floorHeight: [4.0, 5.0], scale: [0.68, 0.86], aspect: [0.9, 1.6] },
  market_hall:     { floors: [1, 2],   floorHeight: [3.8, 4.6], scale: [0.58, 0.8],  aspect: [0.9, 1.5] },
  warehouse:       { floors: [1, 2],   floorHeight: [4.5, 6.0], scale: [0.65, 0.86], aspect: [1.0, 1.8] },
  factory:         { floors: [1, 3],   floorHeight: [4.5, 6.5], scale: [0.66, 0.86], aspect: [1.0, 1.9] },
  workshop:        { floors: [1, 2],   floorHeight: [3.8, 4.8], scale: [0.5, 0.74],  aspect: [0.8, 1.5] },
  sports_hall:     { floors: [1, 2],   floorHeight: [5.0, 7.0], scale: [0.62, 0.84], aspect: [0.9, 1.5] },
  pavilion:        { floors: [1, 1],   floorHeight: [3.2, 4.0], scale: [0.35, 0.55], aspect: [0.8, 1.3] },
  campus_hall:     { floors: [2, 5],   floorHeight: [3.6, 4.2], scale: [0.58, 0.8],  aspect: [0.9, 1.7] },
  shack:           { floors: [1, 2],   floorHeight: [2.8, 3.2], scale: [0.38, 0.58], aspect: [0.7, 1.5] },
  booth:           { floors: [1, 1],   floorHeight: [2.8, 3.2], scale: [0.18, 0.32], aspect: [0.7, 1.4] },
};

function rangePick([a, b], rng) { return a + rng() * (b - a); }
function rangePickInt([a, b], rng) { return a + Math.floor(rng() * (b - a + 1)); }

export function makeStage4() {
  return {
    id: '4_buildings_structures',
    prepare(ctx) {
      ctx.buildings = Array.isArray(ctx.input?.buildings) ? structuredClone(ctx.input.buildings) : [];
      ctx.meta._buildingSeq = 0;
    },
    generate(ctx) {
      const stageId = '4_buildings_structures';
      if (ctx.buildings.length > 0) {
        ctx.report.diagnostics.push(info('buildings_passthrough', stageId, 'using declared buildings', { count: ctx.buildings.length }));
        return;
      }
      // Targeted axis-aligned access roads for far road-needy parcels (TASK-004/005/006).
      try {
        addAxisAlignedAccessRoadsForParcels(ctx);
      } catch (e) {
        ctx.report.diagnostics.push(warn('transport_access_augment_failed', stageId, `access augmentation failed: ${e?.message ?? e}`));
      }
      const profiles = ctx.meta.profiles || {};
      const parcels = ctx.parcels || [];
      const seed = mix(ctx.meta.seed ?? 0, stageId);
      const rng = makeRng(seed);
      const out = [];
      const size = ctx.meta.worldBounds?.size ?? ctx.input?.ground?.size ?? 256;
      const budget = Math.min(400, Math.max(40, Math.floor(size * size / 3000))); // rough density cap
      const rivers = ctx.masks?.easement?.rivers ?? ctx.hydrology?.rivers ?? ctx.input?.cityforge?.hydrology?.rivers ?? [];
      const roads = ctx.masks?.easement?.roads ?? [];
      const roadSegments = ctx.networks?.roads?.segments ?? ctx.input?.cityforge?.networks?.roads?.segments ?? [];
      const gp = ctx.input?.gameplay ?? {};
      const anchors = [
        { x: gp.spawn?.x ?? 0, z: gp.spawn?.z ?? 0 },
        { x: gp.exit?.x ?? 0, z: gp.exit?.z ?? 0 },
      ];
      let placed = 0, skippedConflict = 0;
      // Prioritize parcels with better road access so budget favors reachable built-up areas.
      const orderedParcels = parcels.map((p, idx) => {
        const b = p.aabb; const cx = b ? (b.minX + b.maxX) / 2 : 0; const cz = b ? (b.minZ + b.maxZ) / 2 : 0;
        const rd = Number.isFinite(p?.access?.roadDist) ? p.access.roadDist : minDistanceToRoadSegments(cx, cz, roadSegments);
        return { p, idx, rd: Number.isFinite(rd) ? rd : 1e9 };
      }).sort((a, b) => a.rd - b.rd || a.idx - b.idx).map(x => x.p);

      const stream = ctx.meta?.stream ?? ctx.input?.stream ?? null;
      const chunkSize = Number(stream?.chunk) > 0 ? Number(stream.chunk) : null;
      const chunkGrid = chunkSize ? Math.max(1, Math.round(size / chunkSize)) : 0;
      const totalChunks = chunkGrid > 0 ? chunkGrid * chunkGrid : 0;
      const idealPerChunk = totalChunks > 0 ? (budget / totalChunks) : Infinity;
      const chunkSoft = Number.isFinite(idealPerChunk) ? Math.max(8, Math.ceil(idealPerChunk * 1.3)) : Infinity;
      const chunkHard = Number.isFinite(idealPerChunk) ? Math.max(chunkSoft + 2, Math.ceil(idealPerChunk * 1.7)) : Infinity;
      const placedPerChunk = new Map();
      const placedParcel = new Set();
      const conflictParcel = new Set();
      const chunkKeyFor = (x, z) => {
        if (!chunkSize || !chunkGrid) return null;
        const half = size / 2;
        const ix = Math.max(0, Math.min(chunkGrid - 1, Math.floor((x + half) / chunkSize)));
        const iz = Math.max(0, Math.min(chunkGrid - 1, Math.floor((z + half) / chunkSize)));
        return `${ix},${iz}`;
      };

      const placedByType = Object.create(null);
      // Soft per-type budget shares to avoid one district type consuming the whole building budget.
      const typeShare = {
        office: 0.11, residential: 0.14, luxury: 0.1, industrial: 0.08, slums: 0.08,
        parking: 0.06, sports: 0.06, park: 0.05, forest: 0.04,
        commercial: 0.08, suburb: 0.08, old_town: 0.05, campus: 0.04, market: 0.05,
      };
      const typeTarget = (t) => Math.max(4, Math.round(budget * (typeShare[t] ?? 0.08)));

      const tryPlaceBuilding = (p, { relaxChunk = false, force = false } = {}) => {
        if (placed >= budget) return false;
        if (placedParcel.has(p)) return false;
        if (p?.reserved) return false;
        const profile = profiles[p.type] || profiles[p.profileId] || {};
        const kinds = profile.buildings?.kinds ?? [];
        const coverage = clamp(Number(profile.parcels?.coverage ?? 0.3), 0, 0.85);
        // base placement probability by district/building profile
        const chance = kinds.length === 0 ? 0 : Math.max(0.15, coverage + 0.1);
        const b = p.aabb; if (!b) return false;
        const pw = b.maxX - b.minX, ph = b.maxZ - b.minZ;
        if (pw < 6 || ph < 6) return false;
        const margin = 1.0;
        const maxW = Math.max(4, pw - margin * 2);
        const maxD = Math.max(4, ph - margin * 2);
        const cx = (b.minX + b.maxX) / 2;
        const cz = (b.minZ + b.maxZ) / 2;
        // Road-access metrics used by archetype, scale and placement chance.
        const roadDist = Number.isFinite(p?.access?.roadDist) ? p.access.roadDist : minDistanceToRoadSegments(cx, cz, roadSegments);
        const nearRoad = Number.isFinite(roadDist) && roadDist < 70;
        // RNG: consume kind/shape seeds deterministically per eligible attempt before conflict checks.
        const kind = kinds.length ? pick(kinds, rng) : 'generic';
        const arch = ARCHETYPES[kind] || null;
        let scaleBase = arch ? rangePick(arch.scale, rng) : (kinds.length ? (0.55 + rng() * 0.35) : 0.4);
        if (!arch) {
          if (p.type === 'industrial') scaleBase = 0.65 + rng() * 0.28;
          else if (p.type === 'office') scaleBase = nearRoad ? (0.58 + rng() * 0.3) : (0.5 + rng() * 0.28);
          else if (p.type === 'slums') scaleBase = 0.45 + rng() * 0.35;
          else if (p.type === 'park' || p.type === 'forest') scaleBase = 0.35 + rng() * 0.25;
          else if (p.type === 'suburb') scaleBase = 0.4 + rng() * 0.22;
          else if (p.type === 'commercial' || p.type === 'market') scaleBase = 0.56 + rng() * 0.28;
          else if (p.type === 'campus' || p.type === 'old_town') scaleBase = 0.5 + rng() * 0.28;
        }
        const aspect = arch ? rangePick(arch.aspect, rng) : (0.8 + rng() * 0.6);
        let footprint = null;
        for (const scaleMul of [1, 0.82, 0.68]) {
          const s = scaleBase * scaleMul;
          let w = clamp(maxW * s * Math.sqrt(Math.max(0.4, aspect)), 4, maxW);
          let d = clamp(maxD * s / Math.sqrt(Math.max(0.4, aspect)), 4, maxD);
          // If aspect pushes out of bounds, rebalance.
          if (w >= maxW - 0.01) d = clamp(maxD * s * s / (w / maxW || 1), 4, maxD);
          if (d >= maxD - 0.01) w = clamp(maxW * s * s / (d / maxD || 1), 4, maxW);
          const fp = footprintRect(cx, cz, w, d);
          const riverIndex = (rivers === (ctx.hydrology?.rivers ?? null) || rivers === (ctx.masks?.easement?.rivers ?? null)) ? (ctx.spatial?.riverSegments ?? null) : null;
          if (footprintNearAnchors(fp, anchors, 10) || footprintIntersectsRiver(fp, rivers, riverIndex) || footprintIntersectsRoad(fp, roads, roadSegments, ctx.spatial?.roadEasements)) continue;
          footprint = fp;
          break;
        }
        if (!footprint) {
          if (!conflictParcel.has(p)) { conflictParcel.add(p); skippedConflict++; }
          return false;
        }

        // Road-access bias: prefer parcels closer to emitted road network for built-up districts.
        let accessChance = chance;
        if (Number.isFinite(roadDist) && roadDist !== Infinity) {
          const needsAccess = ['office', 'residential', 'luxury', 'industrial', 'slums', 'parking', 'sports', 'commercial', 'old_town', 'campus', 'market'].includes(p.type);
          if (needsAccess) {
            if (roadDist < 60) accessChance = Math.min(0.97, chance + 0.2);
            else if (roadDist < 140) accessChance = Math.min(0.85, chance + 0.08);
            else accessChance = Math.max(0.06, chance - 0.14);
          } else if (p.type === 'park' || p.type === 'forest') {
            if (roadDist > 120) accessChance = Math.min(0.92, chance + 0.06);
            if (roadDist < 50 && rng() < 0.5) accessChance *= 0.5; // keep parks/forest more open near roads
          } else if (p.type === 'suburb') {
            // low-density, prefers some setback but still reachable
            if (roadDist < 70) accessChance = Math.min(0.8, chance + 0.08);
            else if (roadDist < 180) accessChance = Math.min(0.65, chance + 0.02);
            else accessChance = Math.max(0.08, chance - 0.1);
          }
        }
        // Chunk load balancing (TASK-006/008): discourage concentration in a single stream chunk.
        const ck = chunkKeyFor(cx, cz);
        const cc = ck ? (placedPerChunk.get(ck) || 0) : 0;
        const hard = relaxChunk ? Math.ceil(chunkHard * 1.15) : chunkHard;
        const soft = relaxChunk ? Math.ceil(chunkSoft * 1.1) : chunkSoft;
        if (!force && Number.isFinite(idealPerChunk)) {
          if (cc >= hard) accessChance *= (relaxChunk ? 0.2 : 0.05);
          else if (cc >= soft) accessChance *= (relaxChunk ? 0.45 : 0.25);
          else if (cc >= Math.ceil(idealPerChunk * 1.15)) accessChance *= 0.7;
        }
        // Balance across district types: penalize types that already reached their soft target share.
        const tcount = placedByType[p.type] || 0;
        const ttarget = typeTarget(p.type);
        if (!force) {
          if (tcount >= ttarget) accessChance *= 0.4;
          else if (tcount >= Math.floor(ttarget * 0.8)) accessChance *= 0.7;
          // If budget is still open near the end, allow deficit types to catch up.
          const remaining = budget - placed;
          if (remaining < 60 && tcount < Math.floor(ttarget * 0.5)) accessChance = Math.min(0.98, accessChance * 1.2);
        } else {
          accessChance = 1.0;
        }
        if (!force && rng() > accessChance) return false;

        // District archetypes: parametric footprint/height/material (kind/shape seeded above).
        const maxFloors = Math.max(1, Number(profile.buildings?.maxFloors ?? (arch ? arch.floors[1] : 4)));
        let floors = arch ? rangePickInt(arch.floors, rng) : (1 + Math.floor(rng() * Math.min(maxFloors, 4)));
        if (p.type === 'office' && nearRoad) floors = Math.max(floors, Math.min(maxFloors, 6 + Math.floor(rng() * 6)));
        if (p.type === 'office' && rng() < 0.12) floors = Math.max(floors, Math.min(maxFloors, 12 + Math.floor(rng() * 8)));
        if ((p.type === 'park' || p.type === 'forest') && kinds.length) floors = Math.min(floors, 2);
        floors = clamp(floors, 1, maxFloors);
        let floorHeight = arch ? +rangePick(arch.floorHeight, rng).toFixed(2) : 3.3;
        if (p.type === 'industrial' && floorHeight < 4.2) floorHeight = +(4.2 + rng() * 1.2).toFixed(2);
        if ((p.type === 'sports' || p.type === 'campus') && floorHeight < 3.8) floorHeight = +(3.8 + rng() * 1.4).toFixed(2);
        const id = `b_${p.districtId}_${placed + 1}`;
        out.push({
          id,
          name: `B ${placed + 1}`,
          isEnterable: false,
          floorsCount: floors,
          floorHeight,
          foundation: 'terrain',
          facadeMaterial: materialFor(profile, kind, rng),
          footprint,
          rooms: [],
          stairs: [],
        });
        placed++;
        placedParcel.add(p);
        placedByType[p.type] = (placedByType[p.type] || 0) + 1;
        if (ck) placedPerChunk.set(ck, (placedPerChunk.get(ck) || 0) + 1);
        return true;
      };

      for (const p of orderedParcels) {
        if (placed >= budget) break;
        tryPlaceBuilding(p);
      }
      // Fill pass: if chunk balancing left budget unused, relax chunk pressure to reach target density.
      if (placed < budget) {
        for (const p of orderedParcels) {
          if (placed >= budget) break;
          tryPlaceBuilding(p, { relaxChunk: true });
        }
      }
      // Final fallback: if still under budget, allow placement with minimal extra pressure (keeps some spread).
      if (placed < Math.floor(budget * 0.9)) {
        for (const p of orderedParcels) {
          if (placed >= budget) break;
          if (placedParcel.has(p) || p?.reserved) continue;
          tryPlaceBuilding(p, { relaxChunk: true });
        }
      }
      // Ensure district representation: try to place at least one building in districts that have buildable kinds.
      if (placed < budget) {
        const placedByDistrict = new Map();
        for (const b of out) {
          const m = /^b_(.+)_\d+$/.exec(String(b.id || ''));
          const did = m ? m[1] : null;
          if (did) placedByDistrict.set(did, (placedByDistrict.get(did) || 0) + 1);
        }
        for (const d of (ctx.districts || [])) {
          if (placed >= budget) break;
          const profile = profiles[d.type] || profiles[d.profileId] || {};
          const kinds = profile.buildings?.kinds ?? [];
          if (!kinds.length) continue;
          if ((placedByDistrict.get(d.id) || 0) > 0) continue;
          const dp = orderedParcels.filter(p => p.districtId === d.id && !placedParcel.has(p) && !p?.reserved);
          // prefer better road access first
          dp.sort((a,b) => {
            const ba = a.aabb, bb = b.aabb;
            const acx = ba ? (ba.minX+ba.maxX)/2 : 0, acz = ba ? (ba.minZ+ba.maxZ)/2 : 0;
            const bcx = bb ? (bb.minX+bb.maxX)/2 : 0, bcz = bb ? (bb.minZ+bb.maxZ)/2 : 0;
            const ad = Number.isFinite(a?.access?.roadDist) ? a.access.roadDist : minDistanceToRoadSegments(acx,acz,roadSegments);
            const bd = Number.isFinite(b?.access?.roadDist) ? b.access.roadDist : minDistanceToRoadSegments(bcx,bcz,roadSegments);
            return (Number.isFinite(ad)?ad:1e9) - (Number.isFinite(bd)?bd:1e9);
          });
          for (const p of dp.slice(0, 40)) {
            if (placed >= budget) break;
            if (tryPlaceBuilding(p, { relaxChunk: true, force: true })) {
              placedByDistrict.set(d.id, (placedByDistrict.get(d.id) || 0) + 1);
              break;
            }
          }
        }
      }
      ctx.buildings = out;
      ctx.report.diagnostics.push(info('buildings_generated', stageId, 'generated buildings from parcels', { count: out.length, budget, skippedConflict }));
    },
    validate(ctx) {
      const stageId = '4_buildings_structures';
      if (!Array.isArray(ctx.buildings)) { ctx.buildings = []; ctx.report.diagnostics.push(warn('buildings_invalid', stageId, 'buildings not an array')); }
      // Basic checks; detailed geometric validation happens in normalize/level schema pipeline.
      const seen = new Set();
      const filtered = [];
      for (const b of ctx.buildings) {
        if (!b || typeof b !== 'object' || !Array.isArray(b.footprint) || b.footprint.length < 3) {
          ctx.report.drops.push({ stage: stageId, id: b?.id ?? null, reason: 'invalid_building' });
          continue;
        }
        let id = String(b.id ?? 'b');
        if (seen.has(id)) { id = `${id}_2`; ctx.report.repairs.push({ stage: stageId, id: b.id, code: 'duplicate_building_id', to: id }); b.id = id; }
        seen.add(id);
        filtered.push(b);
      }
      ctx.buildings = filtered;
    },
    repair(_ctx) {},
    emit(ctx) {
      // Emit into source so compileCityforge/build pipeline can pass buildings through.
      if (!Array.isArray(ctx.input.buildings) || ctx.input.buildings.length === 0) {
        ctx.input.buildings = ctx.buildings;
      } else if (ctx.buildings.length) {
        ctx.input.buildings = ctx.buildings;
      }
      // Spatial index for building footprints (TASK-002), additive for downstream queries.
      ctx.spatial = ctx.spatial || {};
      const bIdx = createSpatialIndex(ctx.meta.worldBounds ?? { size: ctx.input?.ground?.size ?? 256 });
      for (const b of (ctx.buildings ?? [])) {
        if (!Array.isArray(b?.footprint)) continue;
        const a = aabbOfFootprint(b.footprint);
        if (Number.isFinite(a.minX)) bIdx.insert({ id: b.id ?? null, ...a });
      }
      ctx.spatial.buildings = bIdx;
      ctx.engine = ctx.input;
    },
  };
}
