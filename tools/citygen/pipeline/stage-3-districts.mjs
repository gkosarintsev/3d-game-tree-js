/**
 * Stage 3: districts and parcels (TASK-005, incremental MVP).
 * Ingests/validates district declarations and profiles, assigns districts over a
 * planning grid when needed, and generates deterministic parcels. Emits to IR/report.
 */
import { warn, info } from '../diagnostics.mjs';
import { makeRng, mix } from '../rng.mjs';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function pointSegDistXZ(px, pz, ax, az, bx, bz) {
  const abx = bx - ax, abz = bz - az, apx = px - ax, apz = pz - az;
  const ab2 = abx * abx + abz * abz || 1e-12;
  const t = Math.max(0, Math.min(1, (apx * abx + apz * abz) / ab2));
  return Math.hypot(px - (ax + abx * t), pz - (az + abz * t));
}

function minRoadDist(x, z, segments = []) {
  let best = Infinity;
  for (const s of segments) {
    const pts = Array.isArray(s?.path) ? s.path : [];
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], b = pts[i + 1];
      best = Math.min(best, pointSegDistXZ(x, z, a[0], a[2], b[0], b[2]));
    }
  }
  return best;
}

export const DEFAULT_PROFILES = {
  office: { id: 'office', label: 'Офисный', weight: 1.1, parcels: { min: 18, max: 42, coverage: 0.55 }, buildings: { kinds: ['office_tower', 'office_mid'], maxFloors: 20, materials: ['glass_and_concrete', 'concrete'] } },
  park: { id: 'park', label: 'Парк', weight: 0.9, parcels: { min: 24, max: 64, coverage: 0.12 }, buildings: { kinds: ['pavilion'], maxFloors: 2, materials: ['painted_brick', 'concrete'] } },
  industrial: { id: 'industrial', label: 'Промышленный', weight: 1.0, parcels: { min: 24, max: 56, coverage: 0.45 }, buildings: { kinds: ['warehouse', 'factory'], maxFloors: 5, materials: ['concrete', 'rusted_metal'] } },
  luxury: { id: 'luxury', label: 'Лакшери', weight: 0.8, parcels: { min: 18, max: 38, coverage: 0.38 }, buildings: { kinds: ['residential_mid', 'villa'], maxFloors: 14, materials: ['stone_base', 'glass_and_concrete'] } },
  residential: { id: 'residential', label: 'Жилой', weight: 1.0, parcels: { min: 14, max: 30, coverage: 0.42 }, buildings: { kinds: ['residential_low', 'residential_mid'], maxFloors: 9, materials: ['painted_brick', 'concrete'] } },
  slums: { id: 'slums', label: 'Трущобы', weight: 0.7, parcels: { min: 10, max: 22, coverage: 0.5 }, buildings: { kinds: ['shack', 'residential_low'], maxFloors: 3, materials: ['rusted_metal', 'painted_brick'] } },
  forest: { id: 'forest', label: 'Лес/поле', weight: 0.8, parcels: { min: 30, max: 80, coverage: 0.04 }, buildings: { kinds: [], maxFloors: 1, materials: [] } },
  parking: { id: 'parking', label: 'Парковки', weight: 0.8, parcels: { min: 22, max: 56, coverage: 0.08 }, buildings: { kinds: ['booth'], maxFloors: 2, materials: ['concrete'] } },
  sports: { id: 'sports', label: 'Спорт', weight: 0.6, parcels: { min: 26, max: 60, coverage: 0.2 }, buildings: { kinds: ['sports_hall', 'pavilion'], maxFloors: 3, materials: ['concrete', 'glass_and_concrete'] } },
};

const COMPAT = {
  office: new Set(['office', 'parking', 'luxury', 'residential', 'park', 'industrial', 'sports']),
  park: new Set(['park', 'luxury', 'residential', 'office', 'forest', 'sports', 'parking']),
  industrial: new Set(['industrial', 'parking', 'office', 'slums', 'forest']),
  luxury: new Set(['luxury', 'park', 'office', 'residential', 'parking', 'sports']),
  residential: new Set(['residential', 'luxury', 'park', 'office', 'parking', 'sports', 'slums', 'forest']),
  slums: new Set(['slums', 'industrial', 'residential', 'parking', 'forest']),
  forest: new Set(['forest', 'park', 'residential', 'industrial', 'slums', 'parking', 'sports', 'office', 'luxury']),
  parking: new Set(['parking', 'office', 'industrial', 'luxury', 'park', 'residential', 'slums', 'sports', 'forest']),
  sports: new Set(['sports', 'park', 'residential', 'office', 'luxury', 'parking', 'forest']),
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
        const allTypeIds = Object.keys(profiles);
        const assigned = new Map(); // key "i,j" -> type
        const districts = [];

        // Ensure a diverse baseline mix for MVP (>=6 target types when possible).
        const core = ['office', 'residential', 'park', 'industrial', 'slums', 'forest', 'parking', 'sports', 'luxury'];
        const preferred = core.filter(t => profiles[t]);
        // Guarantee a broad core set first, then fill remaining slots from preferred.
        const requiredSet = new Set();
        for (const t of ['office', 'residential', 'park', 'industrial', 'slums', 'forest']) if (profiles[t]) requiredSet.add(t);
        for (const t of preferred) { if (requiredSet.size >= Math.min(preferred.length, grid * grid)) break; requiredSet.add(t); }
        const required = [...requiredSet];
        const coords = [];
        for (let j = 0; j < grid; j++) for (let i = 0; i < grid; i++) coords.push({ i, j });
        // deterministic shuffle of coords
        for (let k = coords.length - 1; k > 0; k--) {
          const r = Math.floor(rng() * (k + 1));
          [coords[k], coords[r]] = [coords[r], coords[k]];
        }
        const preassigned = new Map();
        for (let k = 0; k < required.length && k < coords.length; k++) {
          preassigned.set(`${coords[k].i},${coords[k].j}`, required[k]);
        }

        const typeCounts = Object.fromEntries(allTypeIds.map(t => [t, 0]));
        const roadSegments = ctx.networks?.roads?.segments ?? [];
        const roadNeedy = new Set(['office', 'residential', 'luxury', 'industrial', 'slums', 'parking', 'sports']);
        const roadAverse = new Set(['forest', 'park']);
        for (let j = 0; j < grid; j++) {
          for (let i = 0; i < grid; i++) {
            const key = `${i},${j}`;
            const neighbors = [];
            if (i > 0) neighbors.push(assigned.get(`${i-1},${j}`));
            if (j > 0) neighbors.push(assigned.get(`${i},${j-1}`));
            const nTypes = neighbors.filter(Boolean);
            let candidates = compatibleTypes(nTypes, profiles);
            if (!candidates.length) candidates = allTypeIds.slice();
            const cx = -half + (i + 0.5) * cell;
            const cz = -half + (j + 0.5) * cell;
            const rd = minRoadDist(cx, cz, roadSegments);

            let type = preassigned.get(key);
            if (!type || !profiles[type] || !candidates.includes(type)) {
              // weighted pick with mild balancing and road-access bias
              let total = 0;
              const weights = candidates.map(id => {
                const base = Math.max(0, Number(profiles[id]?.weight ?? 1));
                const count = typeCounts[id] || 0;
                const balance = 1 / (1 + count * 0.6);
                let access = 1;
                if (Number.isFinite(rd) && rd !== Infinity) {
                  if (roadNeedy.has(id)) {
                    if (rd < cell * 0.7) access = 1.3;
                    else if (rd < cell * 1.4) access = 1.05;
                    else access = 0.78;
                  } else if (roadAverse.has(id)) {
                    if (rd < cell * 0.7) access = 0.88;
                    else if (rd > cell * 1.2) access = 1.12;
                  }
                }
                const w = base * balance * access;
                total += w;
                return { id, w };
              });
              let r = rng() * (total || 1), picked = candidates[0];
              for (const it of weights) { r -= it.w; if (r <= 0) { picked = it.id; break; } }
              type = picked;
            }
            if (!candidates.includes(type)) type = weightedPick(rng, candidates, profiles);

            assigned.set(key, type);
            typeCounts[type] = (typeCounts[type] || 0) + 1;
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

        // Ensure core MVP types are represented when possible (deterministic swaps).
        const coreNeed = ['office', 'residential', 'park', 'industrial', 'slums', 'forest'].filter(t => profiles[t]);
        const present = () => new Set(districts.map(d => d.type || d.profileId));
        for (const need of coreNeed) {
          if (present().has(need)) continue;
          // find a district to replace: prefer one whose type is over-represented and replacement is neighbor-compatible
          let replaced = false;
          const countsNow = () => { const m = {}; for (const d of districts) m[d.type] = (m[d.type]||0)+1; return m; };
          for (const d of districts) {
            const m = countsNow();
            if ((m[d.type] || 0) <= 1) continue;
            const c = d.cells?.[0]; if (!c) continue;
            const neigh = [];
            for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
              const n = districts.find(x => x.cells?.some(cc => cc.cx===c.cx+dx && cc.cy===c.cy+dy));
              if (n) neigh.push(n.type);
            }
            const ok = neigh.every(nt => (COMPAT[need]?.has(nt) ?? true) && (COMPAT[nt]?.has(need) ?? true));
            if (!ok) continue;
            typeCounts[d.type] = Math.max(0, (typeCounts[d.type]||1)-1);
            d.type = need; d.profileId = need;
            typeCounts[need] = (typeCounts[need]||0)+1;
            replaced = true; break;
          }
          if (!replaced && districts.length) {
            // last resort: force swap smallest-impact cell (may create adjacency warning, handled by validation)
            const countsNow2 = () => { const m = {}; for (const d of districts) m[d.type] = (m[d.type]||0)+1; return m; };
            const m = countsNow2();
            const cand = districts.find(d => (m[d.type]||0) > 1) || districts[0];
            typeCounts[cand.type] = Math.max(0, (typeCounts[cand.type]||1)-1);
            cand.type = need; cand.profileId = need;
            typeCounts[need] = (typeCounts[need]||0)+1;
          }
        }
        ctx.districts = districts;
        ctx.report.diagnostics.push(info('districts_generated', stageId, 'auto-generated district grid', { count: districts.length, grid, types: [...new Set(districts.map(d=>d.type))].sort(), counts: typeCounts }));
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
