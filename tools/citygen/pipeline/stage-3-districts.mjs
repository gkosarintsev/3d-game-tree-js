/**
 * Stage 3: districts and parcels (TASK-005, incremental MVP).
 * Ingests/validates district declarations and profiles, assigns districts over a
 * planning grid when needed, and generates deterministic parcels. Emits to IR/report.
 */
import { warn, info } from '../diagnostics.mjs';
import { makeRng, mix } from '../rng.mjs';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export const DEFAULT_PROFILES = {
  office: { id: 'office', label: 'Офисный', weight: 1, parcels: { min: 18, max: 40, coverage: 0.55 }, buildings: { kinds: ['office_tower', 'office_mid'], maxFloors: 24 } },
  park: { id: 'park', label: 'Парк', weight: 1, parcels: { min: 24, max: 60, coverage: 0.15 }, buildings: { kinds: ['pavilion'], maxFloors: 2 } },
  industrial: { id: 'industrial', label: 'Промышленный', weight: 1, parcels: { min: 24, max: 55, coverage: 0.45 }, buildings: { kinds: ['warehouse', 'factory'], maxFloors: 4 } },
  luxury: { id: 'luxury', label: 'Лакшери/жилой', weight: 1, parcels: { min: 16, max: 36, coverage: 0.4 }, buildings: { kinds: ['residential_mid', 'villa'], maxFloors: 12 } },
  forest: { id: 'forest', label: 'Лес/поле', weight: 1, parcels: { min: 30, max: 80, coverage: 0.05 }, buildings: { kinds: [] , maxFloors: 1 } },
  parking: { id: 'parking', label: 'Парковки/дороги', weight: 1, parcels: { min: 20, max: 50, coverage: 0.1 }, buildings: { kinds: ['booth'], maxFloors: 1 } },
};

const COMPAT = {
  industrial: new Set(['parking', 'office', 'forest', 'industrial']),
  luxury: new Set(['park', 'office', 'forest', 'luxury', 'parking']),
  park: new Set(['luxury', 'office', 'forest', 'parking', 'park']),
  office: new Set(['parking', 'luxury', 'industrial', 'park', 'office']),
  forest: new Set(['forest', 'park', 'luxury', 'parking', 'industrial', 'office']),
  parking: new Set(['parking', 'office', 'industrial', 'luxury', 'park', 'forest']),
};

function mergeProfiles(genProfiles) {
  const out = { ...DEFAULT_PROFILES };
  if (genProfiles && typeof genProfiles === 'object') {
    for (const [k, v] of Object.entries(genProfiles)) {
      if (v && typeof v === 'object') out[k] = { ...(out[k] || { id: k }), ...v, id: v.id || k };
    }
  }
  return out;
}

function weightedPick(rng, ids, profiles) {
  let total = 0;
  for (const id of ids) total += Math.max(0, Number(profiles[id]?.weight ?? 1));
  if (total <= 0) return ids[0];
  let r = rng() * total;
  for (const id of ids) {
    r -= Math.max(0, Number(profiles[id]?.weight ?? 1));
    if (r <= 0) return id;
  }
  return ids[ids.length - 1];
}

function compatibleTypes(neighborTypes, profiles) {
  const ids = Object.keys(profiles);
  return ids.filter(id => neighborTypes.every(nt => (COMPAT[id]?.has(nt) ?? true) && (COMPAT[nt]?.has(id) ?? true)));
}

export function makeStage3() {
  return {
    id: '3_districts_parcels',
    prepare(ctx) {
      const gen = ctx.input?.generator ?? {};
      ctx.districts = Array.isArray(gen.districts) ? structuredClone(gen.districts) : [];
      ctx.parcels = [];
      ctx.meta.profiles = mergeProfiles(gen.profiles);
    },
    generate(ctx) {
      const stageId = '3_districts_parcels';
      const profiles = ctx.meta.profiles || mergeProfiles(null);
      const size = ctx.meta.worldBounds?.size ?? ctx.input?.ground?.size ?? 256;
      const half = size / 2;
      const seed = mix(ctx.meta.seed ?? 0, stageId);
      const rng = makeRng(seed);

      // If no districts declared, auto-generate a deterministic grid assignment (MVP).
      if (!ctx.districts.length) {
        const grid = size >= 1024 ? 4 : 3; // coarse planning grid
        const cell = size / grid;
        const typeIds = Object.keys(profiles);
        const assigned = new Map(); // key "i,j" -> type
        const districts = [];
        for (let j = 0; j < grid; j++) {
          for (let i = 0; i < grid; i++) {
            const neighbors = [];
            if (i > 0) neighbors.push(assigned.get(`${i-1},${j}`));
            if (j > 0) neighbors.push(assigned.get(`${i},${j-1}`));
            const nTypes = neighbors.filter(Boolean);
            let candidates = compatibleTypes(nTypes, profiles);
            if (!candidates.length) candidates = typeIds.slice();
            // bias: place parking/office nearer spawn-ish edge, park/forest variety, keep distribution
            const type = weightedPick(rng, candidates, profiles);
            assigned.set(`${i},${j}`, type);
            const minX = -half + i * cell, maxX = minX + cell;
            const minZ = -half + j * cell, maxZ = minZ + cell;
            districts.push({
              id: `district_${i}_${j}`,
              type,
              profileId: type,
              geometry: { rect: { minX, maxX, minZ, maxZ } },
              cells: [{ cx: i, cy: j }],
              priority: 0,
            });
          }
        }
        ctx.districts = districts;
        ctx.report.diagnostics.push(info('districts_generated', stageId, 'auto-generated district grid', { count: districts.length, grid, types: [...new Set(districts.map(d=>d.type))].sort() }));
      } else {
        // Normalize declared districts minimally
        ctx.districts = ctx.districts.map((d, idx) => ({ id: d.id ?? `district_${idx}`, type: d.type ?? d.profileId ?? 'office', profileId: d.profileId ?? d.type ?? 'office', priority: d.priority ?? 0, ...d }));
        ctx.report.diagnostics.push(info('districts_passthrough', stageId, 'using declared districts', { count: ctx.districts.length }));
      }

      // Generate parcels per district (simple subdivision of rect geometry/cells)
      const parcels = [];
      for (const d of ctx.districts) {
        const profile = profiles[d.profileId || d.type] || profiles.office || { parcels: { min: 20, max: 40 } };
        const pmin = clamp(Number(profile.parcels?.min) || 20, 8, 120);
        const pmax = Math.max(pmin, clamp(Number(profile.parcels?.max) || 40, 8, 160));
        let rect = d.geometry?.rect;
        if (!rect && Array.isArray(d.geometry?.bounds)) {
          // [minX,minZ,maxX,maxZ] or similar - best effort
          const b = d.geometry.bounds;
          if (b.length >= 4) rect = { minX: b[0], minZ: b[1], maxX: b[2], maxZ: b[3] };
        }
        if (!rect && Array.isArray(d.cells) && d.cells.length) {
          // infer from first/last cell using grid assumption not known; skip (fallback later)
          rect = null;
        }
        if (!rect) continue;
        const w = rect.maxX - rect.minX, h = rect.maxZ - rect.minZ;
        if (w <= 0 || h <= 0) continue;
        const target = (pmin + pmax) / 2;
        const nx = Math.max(1, Math.round(w / target));
        const nz = Math.max(1, Math.round(h / target));
        const pw = w / nx, ph = h / nz;
        let seq = 0;
        for (let j = 0; j < nz; j++) {
          for (let i = 0; i < nx; i++) {
            seq++;
            const minX = rect.minX + i * pw, maxX = minX + pw;
            const minZ = rect.minZ + j * ph, maxZ = minZ + ph;
            // inset for access/spacing
            const inset = Math.min(1.5, pw * 0.1, ph * 0.1);
            parcels.push({
              id: `${d.id}_p${seq}`,
              districtId: d.id,
              type: d.type || d.profileId,
              aabb: { minX: minX + inset, maxX: maxX - inset, minZ: minZ + inset, maxZ: maxZ - inset },
              access: { edge: j === 0 ? 'south' : j === nz - 1 ? 'north' : (i === 0 ? 'west' : 'east') },
              reserved: false,
            });
          }
        }
      }
      ctx.parcels = parcels;
      const byType = {};
      for (const d of ctx.districts) byType[d.type || d.profileId] = (byType[d.type || d.profileId] || 0) + 1;
      ctx.report.diagnostics.push(info('parcels_generated', stageId, 'generated parcels', { districts: ctx.districts.length, parcels: parcels.length, byType }));
    },
    validate(ctx) {
      const stageId = '3_districts_parcels';
      const profiles = ctx.meta.profiles || {};
      if (!ctx.districts.length) ctx.report.diagnostics.push(warn('no_districts', stageId, 'no districts produced'));
      for (const d of ctx.districts) {
        const t = d.type || d.profileId;
        if (t && !profiles[t]) ctx.report.diagnostics.push(warn('unknown_district_profile', stageId, `district '${d.id}' uses unknown profile '${t}'`, { id: d.id, type: t }));
      }
      const size = ctx.meta.worldBounds?.size ?? ctx.input?.ground?.size ?? 256;
      const half = size / 2;
      for (const p of ctx.parcels) {
        const b = p.aabb;
        if (!b || b.maxX <= b.minX || b.maxZ <= b.minZ) ctx.report.diagnostics.push(warn('invalid_parcel', stageId, `parcel '${p.id}' invalid aabb`));
        if (b && (b.minX < -half-1 || b.maxX > half+1 || b.minZ < -half-1 || b.maxZ > half+1)) ctx.report.diagnostics.push(warn('parcel_out_of_bounds', stageId, `parcel '${p.id}' outside bounds`, { id: p.id }));
      }
      // Adjacency compatibility (rect grid neighbors best-effort)
      const byCell = new Map();
      for (const d of ctx.districts) for (const c of (d.cells || [])) byCell.set(`${c.cx},${c.cy}`, d.type || d.profileId);
      for (const d of ctx.districts) {
        for (const c of (d.cells || [])) {
          for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
            const nt = byCell.get(`${c.cx+dx},${c.cy+dy}`);
            const t = d.type || d.profileId;
            if (nt && t && nt !== t && !(COMPAT[t]?.has(nt))) {
              ctx.report.diagnostics.push(warn('district_adjacency_fallback', stageId, `adjacency ${t}↔${nt} not preferred`, { a: t, b: nt }));
            }
          }
        }
      }
    },
    repair(ctx) {
      // Fallback: ensure every district has known profile id
      const profiles = ctx.meta.profiles || {};
      for (const d of ctx.districts) {
        const t = d.type || d.profileId;
        if (t && !profiles[t]) {
          const fallback = 'forest';
          ctx.report.repairs.push({ stage: '3_districts_parcels', id: d.id, code: 'district_profile_fallback', from: t, to: fallback });
          d.type = fallback; d.profileId = fallback;
        }
      }
    },
    emit(ctx) {
      // Persist planning results in report and context (engine emission comes in later stages/TASK-008)
      ctx.report.districts = ctx.districts.map(d => ({ id: d.id, type: d.type || d.profileId, profileId: d.profileId || d.type, cells: d.cells?.length ?? 0, parcels: ctx.parcels.filter(p => p.districtId === d.id).length }));
    },
  };
}
