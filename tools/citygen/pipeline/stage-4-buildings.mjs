/**
 * Stage 4: buildings and large structures (TASK-006, incremental MVP).
 * Places simple deterministic buildings on parcels by district profile, emitting
 * engine-compatible building definitions (no new primitives). Static only.
 */
import { info, warn } from '../diagnostics.mjs';
import { makeRng, mix } from '../rng.mjs';

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

function footprintIntersectsRiver(fp, rivers = []) {
  const b = aabbOfFootprint(fp);
  const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
  const corners = [[b.minX,b.minZ],[b.maxX,b.minZ],[b.maxX,b.maxZ],[b.minX,b.maxZ],[cx,cz]];
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

function footprintIntersectsRoad(fp, roads = [], roadSegments = []) {
  const b = aabbOfFootprint(fp);
  const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
  const samplePts = [[b.minX,b.minZ],[b.maxX,b.minZ],[b.maxX,b.maxZ],[b.minX,b.maxZ],[cx,cz]];
  for (const r of roads) {
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
      for (const p of parcels) {
        if (placed >= budget) break;
        const profile = profiles[p.type] || profiles[p.profileId] || {};
        const kinds = profile.buildings?.kinds ?? [];
        const coverage = clamp(Number(profile.parcels?.coverage ?? 0.3), 0, 0.85);
        // skip empty/low-coverage zones sometimes (parks/forest/parking)
        const chance = kinds.length === 0 ? 0 : Math.max(0.15, coverage + 0.1);
        if (rng() > chance) continue;
        const b = p.aabb; if (!b) continue;
        const pw = b.maxX - b.minX, ph = b.maxZ - b.minZ;
        if (pw < 6 || ph < 6) continue;
        const margin = 1.0;
        const maxW = Math.max(4, pw - margin * 2);
        const maxD = Math.max(4, ph - margin * 2);
        const scale = kinds.length ? (0.55 + rng() * 0.35) : 0.4;
        const w = clamp(maxW * scale, 4, maxW);
        const d = clamp(maxD * scale, 4, maxD);
        const cx = (b.minX + b.maxX) / 2;
        const cz = (b.minZ + b.maxZ) / 2;
        const footprint = footprintRect(cx, cz, w, d);
        if (footprintNearAnchors(footprint, anchors, 10) || footprintIntersectsRiver(footprint, rivers) || footprintIntersectsRoad(footprint, roads, roadSegments)) {
          skippedConflict++;
          continue;
        }
        const maxFloors = Math.max(1, Number(profile.buildings?.maxFloors ?? 4));
        let floors = 1 + Math.floor(rng() * Math.min(maxFloors, 6));
        // allow taller in office/luxury occasionally
        if ((p.type === 'office' || p.type === 'luxury') && rng() < 0.25) floors = Math.max(floors, Math.min(maxFloors, 6 + Math.floor(rng() * 10)));
        if (p.type === 'slums') floors = 1 + Math.floor(rng() * Math.min(maxFloors, 3));
        floors = clamp(floors, 1, maxFloors);
        const floorHeight = p.type === 'industrial' ? 4.5 : 3.4;
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
      }
      ctx.buildings = out;
      ctx.report.diagnostics.push(info('buildings_generated', stageId, 'generated buildings from parcels', { count: out.length, budget, skippedConflict }));
      ctx.report.diagnostics.push(info('buildings_generated', stageId, 'generated buildings from parcels', { count: out.length, budget }));
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
      ctx.engine = ctx.input;
    },
  };
}
