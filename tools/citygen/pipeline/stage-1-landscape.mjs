/**
 * Stage 1: landscape and hydrology (TASK-003, incremental).
 * Validates/repairs terrain modifiers and waterways in IR; emits sanitized data
 * back into the source cityforge for compilation. Deterministic, local repairs.
 */
import { warn, info } from '../diagnostics.mjs';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

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
      // TASK-003 incremental: generation hooks reserved; for now keep/normalize existing IR.
      ctx.report.diagnostics.push(info('landscape_passthrough', '1_landscape_hydrology', 'stage 1 using provided terrain/hydrology (procedural generation pending)', {
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
      const rivers = [];
      for (const r of ctx.hydrology.rivers) {
        if (!r || typeof r !== 'object') {
          ctx.report.drops.push({ stage: stageId, id: null, reason: 'invalid_river' });
          continue;
        }
        const path = Array.isArray(r.path) ? r.path.filter(p => Array.isArray(p) && p.length >= 2) : [];
        if (path.length < 2) {
          ctx.report.diagnostics.push(warn('river_too_short', stageId, `river '${r.id ?? '?'}' dropped: path < 2 points`));
          ctx.report.drops.push({ stage: stageId, id: r.id ?? null, reason: 'river_too_short' });
          continue;
        }
        let rr = { ...r };
        if (Number.isFinite(rr.width)) {
          const cw = clamp(rr.width, 2, 200);
          if (cw !== rr.width) { rr.width = cw; ctx.report.repairs.push({ stage: stageId, id: rr.id, code: 'clamp_river_width', to: cw }); }
        }
        if (Number.isFinite(rr.depth)) {
          const cd = clamp(rr.depth, 0, 100);
          if (cd !== rr.depth) { rr.depth = cd; ctx.report.repairs.push({ stage: stageId, id: rr.id, code: 'clamp_river_depth', to: cd }); }
        }
        // easement mask: reserve corridor around river centerline (approx by width)
        ctx.masks.easement.rivers.push({ id: rr.id ?? null, path, width: rr.width ?? 0 });
        rivers.push(rr);
      }
      ctx.hydrology.rivers = uniqIds(rivers, 'river', ctx, stageId);
      ctx.hydrology.lakes = uniqIds(ctx.hydrology.lakes, 'lake', ctx, stageId);
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
  s.prepare(ctx); s.generate(ctx); s.validate(ctx); s.repair(ctx); s.generateEmit(ctx);
  return ctx;
}
