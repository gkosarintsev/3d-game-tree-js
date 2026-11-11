/**
 * Stage 1: landscape and hydrology (TASK-003, incremental).
 * Validates/repairs terrain modifiers and waterways in IR; emits sanitized data
 * back into the source cityforge for compilation. Deterministic, local repairs.
 * Procedural generation: when `generator.landscape` requests it (or provides
 * config and there is no authored terrain/hydrology), produces hills/rivers
 * from seed/subseed without Math.random.
 */
import { warn, info } from '../diagnostics.mjs';
import { makeRng, mix } from '../rng.mjs';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, t) => a + (b - a) * t;
const EPS = 1e-9;

function inBoundsXZ(x, z, half) {
  return x >= -half - EPS && x <= half + EPS && z >= -half - EPS && z <= half + EPS;
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

function polylineSelfIntersects(path) {
  const n = path.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 2; j < n - 1; j++) {
      if (segsIntersect(path[i], path[i + 1], path[j], path[j + 1])) return true;
    }
  }
  return false;
}

function distPointSegXZ(px, pz, ax, az, bx, bz) {
  const abx = bx - ax, abz = bz - az;
  const apx = px - ax, apz = pz - az;
  const ab2 = abx * abx + abz * abz;
  const t = ab2 > EPS ? clamp((apx * abx + apz * abz) / ab2, 0, 1) : 0;
  const cx = ax + abx * t, cz = az + abz * t;
  return Math.hypot(px - cx, pz - cz);
}

function riverMinDistToPoint(river, x, z) {
  const path = river.path ?? [];
  let best = Infinity;
  for (let i = 0; i + 1 < path.length; i++) {
    const a = path[i], b = path[i + 1];
    best = Math.min(best, distPointSegXZ(x, z, a[0], a[2], b[0], b[2]));
  }
  return best;
}

function shouldGenerate(ctx) {
  const ls = ctx.input?.generator?.landscape;
  if (!ls || typeof ls !== 'object') return false;
  if (ls.generate === true) return true;
  if (ls.generate === false) return false;
  // If config present and no authored content, generate.
  const hasAuthored = (ctx.terrain.modifiers?.length ?? 0) > 0 || (ctx.hydrology.rivers?.length ?? 0) > 0;
  return !hasAuthored;
}

function farFromAnchors(x, z, anchors, minD) {
  for (const a of anchors) if (Math.hypot(x - a.x, z - a.z) < minD) return false;
  return true;
}

function generateLandscape(ctx) {
  const stageId = '1_landscape_hydrology';
  const ls = ctx.input.generator.landscape || {};
  const size = ctx.meta.worldBounds?.size ?? ctx.input?.ground?.size ?? 256;
  const half = size / 2;
  const seed = mix(ctx.meta.seed ?? 0, stageId, ls.seedOffset ?? 0);
  const rng = makeRng(seed);
  const gp = ctx.input?.gameplay ?? {};
  const anchors = [
    { x: gp.spawn?.x ?? 0, z: gp.spawn?.z ?? 0 },
    { x: gp.exit?.x ?? 0, z: gp.exit?.z ?? 0 },
  ];
  const hillsCfg = ls.hills || {};
  const wantHills = hillsCfg.enabled !== false;
  const count = clamp(Number.isInteger(hillsCfg.count) ? hillsCfg.count : 6, 0, 40);
  const minH = Number.isFinite(hillsCfg.minHeight) ? hillsCfg.minHeight : 10;
  const maxH = Number.isFinite(hillsCfg.maxHeight) ? hillsCfg.maxHeight : 45;
  const minR = Number.isFinite(hillsCfg.minRadius) ? hillsCfg.minRadius : 80;
  const maxR = Number.isFinite(hillsCfg.maxRadius) ? hillsCfg.maxRadius : 300;
  const type = hillsCfg.type === 'valley' ? 'valley' : 'mountain';
  const modifiers = [];
  let attempts = 0;
  for (let i = 0; i < count && attempts < count * 20; attempts++) {
    const x = lerp(-half * 0.8, half * 0.8, rng());
    const z = lerp(-half * 0.8, half * 0.8, rng());
    if (!farFromAnchors(x, z, anchors, Math.max(40, minR * 0.25))) continue;
    const radius = lerp(minR, maxR, rng());
    const height = lerp(minH, maxH, rng());
    modifiers.push({
      id: `hill_${i + 1}`,
      type,
      center: [Math.round(x * 10) / 10, Math.round(z * 10) / 10],
      radius: Math.round(radius * 10) / 10,
      height: Math.round(height * 10) / 10,
      falloff: 'smooth',
    });
    i++;
  }
  if (wantHills && count > 0) ctx.terrain.modifiers = modifiers;

  const riverCfg = ls.river || {};
  const rivers = [];
  if (riverCfg.enabled === true) {
    const width = clamp(Number.isFinite(riverCfg.width) ? riverCfg.width : 24, 4, 120);
    const depth = clamp(Number.isFinite(riverCfg.depth) ? riverCfg.depth : 4, 0.5, 30);
    const margin = half * 0.9;
    // Simple deterministic meandering river roughly across the map (west->east or north->south)
    const axis = riverCfg.axis === 'x' ? 'x' : 'z';
    const points = [];
    const steps = clamp(Number.isInteger(riverCfg.points) ? riverCfg.points : 6, 2, 12);
    const amp = Math.min(half * 0.35, Number.isFinite(riverCfg.amplitude) ? riverCfg.amplitude : half * 0.2);
    const base = lerp(-amp, amp, rng());
    for (let i = 0; i < steps; i++) {
      const t = steps === 1 ? 0.5 : i / (steps - 1);
      const along = lerp(-margin, margin, t);
      const wiggle = base + Math.sin(t * Math.PI * 2 + rng() * 0.5) * amp * 0.5;
      const x = axis === 'z' ? wiggle : along;
      const z = axis === 'z' ? along : wiggle;
      points.push([Math.round(x * 10) / 10, 0, Math.round(z * 10) / 10]);
    }
    rivers.push({ id: 'river_1', path: points, width, depth, carveTerrain: riverCfg.carveTerrain !== false });
  }
  if (riverCfg.enabled === true) ctx.hydrology.rivers = rivers;

  ctx.report.diagnostics.push(info('landscape_generated', stageId, 'stage 1 generated terrain/hydrology from generator.landscape', {
    modifiers: ctx.terrain.modifiers.length,
    rivers: ctx.hydrology.rivers.length,
    seed,
  }));
}

function uniqIds(items, kind, ctx, stageId) {
  const seen = new Set();
  const out = [];
  for (const it of items ?? []) {
    let cur = it;
    let id = String(cur?.id ?? kind);
    if (seen.has(id)) {
      let k = 2;
      while (seen.has(`${id}_${k}`)) k++;
      const nid = `${id}_${k}`;
      ctx.report.repairs.push({ stage: stageId, id, code: 'duplicate_id_renamed', to: nid });
      ctx.report.diagnostics.push(warn('duplicate_id', stageId, `${kind} '${id}' renamed to '${nid}'`, { id, to: nid }));
      id = nid;
      cur = { ...cur, id };
    }
    seen.add(id);
    out.push(cur?.id === id ? cur : { ...cur, id });
  }
  return out;
}

export function makeStage1() {
  return {
    id: '1_landscape_hydrology',
    prepare(ctx) {
      const cf = ctx.input?.cityforge ?? {};
      ctx.masks.easement = { rivers: [], roads: [] };
      ctx.terrain = {
        modifiers: Array.isArray(cf.terrain?.modifiers) ? structuredClone(cf.terrain.modifiers) : [],
      };
      ctx.hydrology = {
        rivers: Array.isArray(cf.hydrology?.rivers) ? structuredClone(cf.hydrology.rivers) : [],
        lakes: Array.isArray(cf.hydrology?.lakes) ? structuredClone(cf.hydrology.lakes) : [],
      };
    },
    generate(ctx) {
      const stageId = '1_landscape_hydrology';
      if (shouldGenerate(ctx)) {
        generateLandscape(ctx);
        return;
      }
      ctx.report.diagnostics.push(info('landscape_passthrough', stageId, 'stage 1 using provided terrain/hydrology (procedural generation pending)', {
        modifiers: ctx.terrain.modifiers.length,
        rivers: ctx.hydrology.rivers.length,
        lakes: ctx.hydrology.lakes.length,
      }));
    },
    validate(ctx) {
      const g = ctx.meta.worldBounds?.size ?? ctx.input?.ground?.size ?? 0;
      const half = g / 2;
      const stageId = '1_landscape_hydrology';
      // terrain modifiers
      const mods = [];
      for (const m of ctx.terrain.modifiers) {
        if (!m || typeof m !== 'object') {
          ctx.report.diagnostics.push(warn('invalid_modifier', stageId, 'terrain modifier dropped: not an object'));
          ctx.report.drops.push({ stage: stageId, id: null, reason: 'invalid_modifier' });
          continue;
        }
        const type = m.type;
        if (type !== 'mountain' && type !== 'valley' && type !== 'terrain_modifier') {
          ctx.report.diagnostics.push(warn('unsupported_modifier_type', stageId, `modifier '${m.id ?? '?'}' type '${type}' unsupported; kept for compiler validation`));
        }
        let mm = { ...m };
        if (Number.isFinite(mm.height)) {
          const ch = clamp(mm.height, -300, 300);
          if (ch !== mm.height) { mm.height = ch; ctx.report.repairs.push({ stage: stageId, id: mm.id, code: 'clamp_height', to: ch }); }
        }
        if (Number.isFinite(mm.radius)) {
          const cr = clamp(mm.radius, 1, g * 2);
          if (cr !== mm.radius) { mm.radius = cr; ctx.report.repairs.push({ stage: stageId, id: mm.id, code: 'clamp_radius', to: cr }); }
        }
        if (Array.isArray(mm.center) && mm.center.length >= 2) {
          const cx = clamp(Number(mm.center[0]) || 0, -half, half);
          const cz = clamp(Number(mm.center[1]) || 0, -half, half);
          if (cx !== mm.center[0] || cz !== mm.center[1]) {
            mm.center = [cx, cz, mm.center[2] ?? 0];
            ctx.report.repairs.push({ stage: stageId, id: mm.id, code: 'clamp_center' });
          }
        }
        mods.push(mm);
      }
      ctx.terrain.modifiers = uniqIds(mods, 'modifier', ctx, stageId);

      // waterways
      const gp = ctx.input?.gameplay ?? {};
      const anchors = [
        { name: 'spawn', x: gp.spawn?.x ?? 0, z: gp.spawn?.z ?? 0 },
        { name: 'exit', x: gp.exit?.x ?? 0, z: gp.exit?.z ?? 0 },
      ];
      const rivers = [];
      for (const r of ctx.hydrology.rivers) {
        if (!r || typeof r !== 'object') {
          ctx.report.drops.push({ stage: stageId, id: null, reason: 'invalid_river' });
          continue;
        }
        let path = Array.isArray(r.path) ? r.path.filter(p => Array.isArray(p) && p.length >= 2).map(p => [Number(p[0]) || 0, Number(p[1]) || 0, Number(p[2]) || 0]) : [];
        if (path.length < 2) {
          ctx.report.diagnostics.push(warn('river_too_short', stageId, `river '${r.id ?? '?'}' dropped: path < 2 points`));
          ctx.report.drops.push({ stage: stageId, id: r.id ?? null, reason: 'river_too_short' });
          continue;
        }
        // bounds: clamp points to plate
        let clamped = false;
        path = path.map(p => {
          const x = clamp(p[0], -half, half), z = clamp(p[2], -half, half);
          if (x !== p[0] || z !== p[2]) clamped = true;
          return [Math.round(x * 1000) / 1000, p[1], Math.round(z * 1000) / 1000];
        });
        if (clamped) ctx.report.repairs.push({ stage: stageId, id: r.id ?? null, code: 'clamp_river_path_bounds' });

        let rr = { ...r, path };
        if (Number.isFinite(rr.width)) {
          const cw = clamp(rr.width, 2, 200);
          if (cw !== rr.width) { rr.width = cw; ctx.report.repairs.push({ stage: stageId, id: rr.id, code: 'clamp_river_width', to: cw }); }
        }
        if (Number.isFinite(rr.depth)) {
          const cd = clamp(rr.depth, 0, 100);
          if (cd !== rr.depth) { rr.depth = cd; ctx.report.repairs.push({ stage: stageId, id: rr.id, code: 'clamp_river_depth', to: cd }); }
        }

        // geometric validation: self-intersection
        if (polylineSelfIntersects(path)) {
          ctx.report.diagnostics.push(warn('river_self_intersection', stageId, `river '${rr.id ?? '?'}' dropped: self-intersecting path`));
          ctx.report.drops.push({ stage: stageId, id: rr.id ?? null, reason: 'river_self_intersection' });
          continue;
        }

        // anchor conflict: river corridor too close to spawn/exit (flag/warn; bridges/routes handled later)
        const clearance = (rr.width ?? 0) * 0.5 + 6;
        for (const a of anchors) {
          const d = riverMinDistToPoint(rr, a.x, a.z);
          if (d < clearance) {
            ctx.report.diagnostics.push(warn('river_anchor_conflict', stageId, `river '${rr.id ?? '?'}' within ${clearance.toFixed(1)}m of ${a.name} (dist ${d.toFixed(1)}m)`, { anchor: a.name, distance: d, id: rr.id ?? null }));
          }
        }

        // easement mask: reserve corridor around river centerline (approx by width)
        ctx.masks.easement.rivers.push({ id: rr.id ?? null, path, width: rr.width ?? 0 });
        rivers.push(rr);
      }
      ctx.hydrology.rivers = uniqIds(rivers, 'river', ctx, stageId);
      ctx.hydrology.lakes = uniqIds(ctx.hydrology.lakes, 'lake', ctx, stageId);

      // terrain slope sanity (basic): very steep hill height/radius ratio
      for (const m of ctx.terrain.modifiers) {
        if (Number.isFinite(m.height) && Number.isFinite(m.radius) && m.radius > EPS) {
          const ratio = Math.abs(m.height) / m.radius;
          if (ratio > 0.8) {
            ctx.report.diagnostics.push(warn('terrain_steep_modifier', stageId, `modifier '${m.id ?? '?'}' steep (|h|/r=${ratio.toFixed(2)})`, { id: m.id ?? null, ratio }));
          }
        }
      }
    },
    repair(_ctx) {
      // Repairs applied during validate for locality/determinism in this skeleton.
    },
    emit(ctx) {
      // Write sanitized terrain/hydrology back into input for downstream compilation.
      if (ctx.input?.cityforge) {
        if (ctx.input.cityforge.terrain) ctx.input.cityforge.terrain.modifiers = ctx.terrain.modifiers;
        else if (ctx.terrain.modifiers.length) ctx.input.cityforge.terrain = { base: { type: 'heightfield', source: 'procedural', resolution: 4 }, modifiers: ctx.terrain.modifiers };
        if (!ctx.input.cityforge.hydrology) ctx.input.cityforge.hydrology = { rivers: [], lakes: [] };
        ctx.input.cityforge.hydrology.rivers = ctx.hydrology.rivers;
        ctx.input.cityforge.hydrology.lakes = ctx.hydrology.lakes;
      }
      ctx.engine = ctx.input;
    },
  };
}

export function applyStage1(ctx) {
  const s = makeStage1();
  s.prepare(ctx); s.generate(ctx); s.validate(ctx); s.repair(ctx); s.emit(ctx);
  return ctx;
}
