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

function materialFor(profile, rng) {
  const mats = profile?.buildings?.materials;
  if (Array.isArray(mats) && mats.length) return pick(mats, rng);
  return 'concrete';
}

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
        office: 0.16, residential: 0.2, luxury: 0.14, industrial: 0.1, slums: 0.14,
        parking: 0.08, sports: 0.08, park: 0.06, forest: 0.04,
      };
      const typeTarget = (t) => Math.max(4, Math.round(budget * (typeShare[t] ?? 0.08)));

      const tryPlaceBuilding = (p, { relaxChunk = false } = {}) => {
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
        let scaleBase = kinds.length ? (0.55 + rng() * 0.35) : 0.4;
        if (p.type === 'industrial') scaleBase = 0.65 + rng() * 0.28;
        else if (p.type === 'office') scaleBase = nearRoad ? (0.58 + rng() * 0.3) : (0.5 + rng() * 0.28);
        else if (p.type === 'slums') scaleBase = 0.45 + rng() * 0.35;
        else if (p.type === 'park' || p.type === 'forest') scaleBase = 0.35 + rng() * 0.25;
        let footprint = null;
        for (const scaleMul of [1, 0.82, 0.68]) {
          const w = clamp(maxW * scaleBase * scaleMul, 4, maxW);
          const d = clamp(maxD * scaleBase * scaleMul, 4, maxD);
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
          const needsAccess = ['office', 'residential', 'luxury', 'industrial', 'slums', 'parking', 'sports'].includes(p.type);
          if (needsAccess) {
            if (roadDist < 60) accessChance = Math.min(0.97, chance + 0.2);
            else if (roadDist < 140) accessChance = Math.min(0.85, chance + 0.08);
            else accessChance = Math.max(0.06, chance - 0.14);
          } else if (p.type === 'park' || p.type === 'forest') {
            if (roadDist > 120) accessChance = Math.min(0.92, chance + 0.06);
            if (roadDist < 50 && rng() < 0.5) accessChance *= 0.5; // keep parks/forest more open near roads
          }
        }
        // Chunk load balancing (TASK-006/008): discourage concentration in a single stream chunk.
        const ck = chunkKeyFor(cx, cz);
        const cc = ck ? (placedPerChunk.get(ck) || 0) : 0;
        const hard = relaxChunk ? Math.ceil(chunkHard * 1.15) : chunkHard;
        const soft = relaxChunk ? Math.ceil(chunkSoft * 1.1) : chunkSoft;
        if (Number.isFinite(idealPerChunk)) {
          if (cc >= hard) accessChance *= (relaxChunk ? 0.2 : 0.05);
          else if (cc >= soft) accessChance *= (relaxChunk ? 0.45 : 0.25);
          else if (cc >= Math.ceil(idealPerChunk * 1.15)) accessChance *= 0.7;
        }
        // Balance across district types: penalize types that already reached their soft target share.
        const tcount = placedByType[p.type] || 0;
        const ttarget = typeTarget(p.type);
        if (tcount >= ttarget) accessChance *= 0.4;
        else if (tcount >= Math.floor(ttarget * 0.8)) accessChance *= 0.7;
        // If budget is still open near the end, allow deficit types to catch up.
        const remaining = budget - placed;
        if (remaining < 60 && tcount < Math.floor(ttarget * 0.5)) accessChance = Math.min(0.98, accessChance * 1.2);
        if (rng() > accessChance) return false;

        // District archetypes: height/density by type and road proximity.
        const maxFloors = Math.max(1, Number(profile.buildings?.maxFloors ?? 4));
        let floors = 1;
        if (p.type === 'office') {
          floors = nearRoad ? (6 + Math.floor(rng() * Math.max(1, maxFloors - 5))) : (3 + Math.floor(rng() * 6));
          if (rng() < 0.2) floors = Math.max(floors, Math.min(maxFloors, 10 + Math.floor(rng() * 8)));
        } else if (p.type === 'luxury') {
          floors = nearRoad ? (4 + Math.floor(rng() * 7)) : (2 + Math.floor(rng() * 5));
        } else if (p.type === 'residential') {
          floors = nearRoad ? (2 + Math.floor(rng() * 5)) : (1 + Math.floor(rng() * 4));
        } else if (p.type === 'industrial') {
          floors = 1 + Math.floor(rng() * Math.min(maxFloors, 3));
        } else if (p.type === 'slums') {
          floors = 1 + Math.floor(rng() * Math.min(maxFloors, 3));
        } else if (p.type === 'sports') {
          floors = 1 + Math.floor(rng() * Math.min(maxFloors, 2));
        } else if (p.type === 'parking') {
          floors = rng() < 0.15 ? 2 : 1;
        } else if (p.type === 'park' || p.type === 'forest') {
          floors = 1;
        } else {
          floors = 1 + Math.floor(rng() * Math.min(maxFloors, 4));
        }
        floors = clamp(floors, 1, maxFloors);
        const floorHeight = p.type === 'industrial' ? 4.5 : (p.type === 'office' ? 3.6 : 3.3);
        const id = `b_${p.districtId}_${placed + 1}`;
        out.push({
          id,
          name: `B ${placed + 1}`,
          isEnterable: false,
          floorsCount: floors,
          floorHeight,
          foundation: 'terrain',
          facadeMaterial: materialFor(profile, rng),
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
          // bypass chunk pressure by temporarily treating as relaxed+; handled via flag not available, so do a targeted attempt
          // (reuse tryPlaceBuilding by monkeying? simpler: inline relaxed attempt by calling with relaxChunk and accepting higher cc effect already limited)
          tryPlaceBuilding(p, { relaxChunk: true });
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
