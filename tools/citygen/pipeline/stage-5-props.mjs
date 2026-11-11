/**
 * Stage 5: infrastructure and props (TASK-007, MVP).
 * Generates deterministic street lights and simple visual props using existing
 * engine primitives (`lights`, `props`) with budgets/clearance guards.
 */
import { info } from '../diagnostics.mjs';
import { makeRng, mix } from '../rng.mjs';

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
  samples.sort((a, b) => b.w - a.w);

  const lights = [];
  let skipped = 0;
  for (const s of samples) {
    if (lights.length >= budget) break;
    const side = (rng() < 0.5 ? -1 : 1);
    const lx = Math.round((s.x + s.nx * side * sideOffset) * 100) / 100;
    const lz = Math.round((s.z + s.nz * side * sideOffset) * 100) / 100;
    const ly = Math.round((s.y + height) * 100) / 100;
    if (lights.some(o => distXZ(o.position.x, o.position.z, lx, lz) < 18)) { skipped++; continue; }
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
    ...(ctx.landscape?.hydrology?.rivers ?? []),
    ...(ctx.input?.waterways ?? []),
    ...(ctx.input?.cityforge?.landscape?.hydrology?.rivers ?? []),
  ];
  const rivers = riverLike.map(r => ({
    width: r.width ?? 10,
    path: r.path ?? (Array.isArray(r.points) ? r.points.map(p => [p.x, 0, p.z]) : []),
  }));
  const buildings = ctx.buildings ?? [];
  const districts = ctx.districts ?? [];
  const parcels = ctx.parcels ?? [];
  const anchors = [
    ctx.input?.gameplay?.spawn ? { x: ctx.input.gameplay.spawn.x, z: ctx.input.gameplay.spawn.z } : null,
    ctx.input?.gameplay?.exit ? { x: ctx.input.gameplay.exit.x, z: ctx.input.gameplay.exit.z } : null,
  ].filter(Boolean);
  const buildingRects = buildings.map(b => footprintAabb(b.footprint));

  const tooCloseToRiver = (x, z) => rivers.some(rv => (rv.path || []).some((pt, i, a) => {
    if (i + 1 >= a.length) return false;
    const w = (rv.width ?? 10) * 0.5 + 6.0;
    return pointSegDistXZ(x, z, pt[0], pt[2], a[i + 1][0], a[i + 1][2]) < w;
  }));
  const blocked = (x, z, roadPad = 3.5) => {
    if (minDistToRoads(x, z, roads) < roadPad) return true;
    if (tooCloseToRiver(x, z)) return true;
    if (anchors.some(a => distXZ(x, z, a.x, a.z) < 8)) return true;
    if (buildingRects.some(r => pointInRect(x, z, r, 1.5))) return true;
    return false;
  };

  const size = ctx.meta.worldBounds?.size ?? ctx.input?.ground?.size ?? 256;
  const budget = clamp(Number.isInteger(cfg.objectBudget) ? cfg.objectBudget : Math.round(size / 4), 20, 220);
  const out = [];
  let attempts = 0;
  const tryPlace = (model, x, y, z, rotY = 0, scale = { x: 1, y: 1, z: 1 }, roadPad = 3.5, minSep = 4) => {
    attempts++;
    if (out.length >= budget) return false;
    if (blocked(x, z, roadPad)) return false;
    if (out.some(p => distXZ(p.position.x, p.position.z, x, z) < minSep)) return false;
    out.push({
      id: `prop_${out.length + 1}`,
      model,
      position: { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100, z: Math.round(z * 100) / 100 },
      rotation: { x: 0, y: Math.round(rotY), z: 0 },
      scale: { x: +scale.x.toFixed(3), y: +scale.y.toFixed(3), z: +scale.z.toFixed(3) },
    });
    return true;
  };

  // District-driven props
  const districtById = new Map(districts.map(d => [d.id, d]));
  for (const p of parcels) {
    if (out.length >= budget) break;
    const d = districtById.get(p.districtId);
    const type = d?.type || p.type || 'residential';
    const b = p.rect ?? p.aabb; if (!b) continue;
    const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
    const area = (b.maxX - b.minX) * (b.maxZ - b.minZ);
    const baseY = ctx.input?.ground?.y ?? 0;

    if (type === 'park' || type === 'forest') {
      const count = clamp(Math.round(area / (type === 'forest' ? 900 : 1200)), 1, 4);
      for (let i = 0; i < count && out.length < budget; i++) {
        const jx = (rng() - 0.5) * (b.maxX - b.minX) * 0.5;
        const jz = (rng() - 0.5) * (b.maxZ - b.minZ) * 0.5;
        const s = 0.85 + rng() * 0.5;
        tryPlace('tree', cx + jx, baseY, cz + jz, rng() * 360, { x: s, y: s, z: s }, 5.0, type === 'forest' ? 3 : 4);
      }
      if (type === 'park' && rng() < 0.7) tryPlace('bench', cx + (rng() - 0.5) * 8, baseY, cz + (rng() - 0.5) * 8, rng() * 360, { x: 1, y: 1, z: 1 }, 5.0, 3.5);
    } else if (type === 'residential' || type === 'luxury' || type === 'office') {
      if (rng() < 0.35) tryPlace('tree', cx + (b.maxX - b.minX) * 0.3 * (rng() - 0.5), baseY, cz + (b.maxZ - b.minZ) * 0.3 * (rng() - 0.5), rng() * 360, { x: 0.9, y: 0.9, z: 0.9 }, 4.8, 4);
      if (rng() < 0.25) tryPlace('bench', cx + (b.maxX - b.minX) * 0.25 * (rng() - 0.5), baseY, cz + (b.maxZ - b.minZ) * 0.25 * (rng() - 0.5), rng() * 360, { x: 1, y: 1, z: 1 }, 4.8, 3.5);
    } else if (type === 'industrial' || type === 'parking') {
      if (rng() < 0.45) tryPlace(pick(['container', 'barrier'], rng), cx + (b.maxX - b.minX) * 0.25 * (rng() - 0.5), baseY, cz + (b.maxZ - b.minZ) * 0.25 * (rng() - 0.5), rng() * 360, { x: 1, y: 1, z: 1 }, 4.5, 4);
      if (type === 'parking' && rng() < 0.35) tryPlace('bollard', cx + (b.maxX - b.minX) * 0.35 * (rng() - 0.5), baseY, cz + (b.maxZ - b.minZ) * 0.35 * (rng() - 0.5), 0, { x: 1, y: 1, z: 1 }, 4.0, 3);
    } else if (type === 'slums') {
      if (rng() < 0.3) tryPlace(pick(['barrier', 'container', 'bench'], rng), cx + (rng() - 0.5) * 10, baseY, cz + (rng() - 0.5) * 10, rng() * 360, { x: 1, y: 1, z: 1 }, 4.5, 3.5);
    }
  }

  // Sparse roadside bollards (visual) where space allows
  for (const seg of roads) {
    if (out.length >= budget) break;
    const pts = pathPoints(seg); if (!pts) continue;
    for (let i = 0; i + 1 < pts.length && out.length < budget; i++) {
      const a = pts[i], b = pts[i + 1];
      const dx = b[0] - a[0], dz = b[2] - a[2], dy = b[1] - a[1];
      const len = Math.hypot(dx, dz); if (len < 40) continue;
      const t = 0.5;
      const x = a[0] + dx * t, z = a[2] + dz * t, y = a[1] + dy * t;
      const nx = -dz / len, nz = dx / len;
      if (rng() < 0.25) tryPlace('bollard', x + nx * 6.2, ctx.input?.ground?.y ?? y, z + nz * 6.2, 0, { x: 1, y: 1, z: 1 }, 2.8, 5);
    }
  }

  ctx.infrastructure.props = out;
  ctx.report.diagnostics.push(info('props_generated', stageId, 'generated district props', { count: out.length, budget, attempts }));
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
