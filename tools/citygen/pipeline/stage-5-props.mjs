/**
 * Stage 5: infrastructure and props (TASK-007, MVP).
 * Generates simple deterministic street lights along emitted road segments using
 * existing engine primitives (`lights`), with budget/clearance guards.
 */
import { info, warn } from '../diagnostics.mjs';
import { makeRng, mix } from '../rng.mjs';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function pathPoints(seg) {
  const pts = Array.isArray(seg?.path) ? seg.path.filter(p => Array.isArray(p) && p.length >= 3) : [];
  return pts.length >= 2 ? pts : null;
}

function distXZ(ax, az, bx, bz) { return Math.hypot(ax - bx, az - bz); }

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
      // Opt-in/off: default enabled for generated worlds unless explicitly false
      const cfg = gen.props ?? gen.infrastructure ?? {};
      if (cfg.enabled === false) {
        ctx.report.diagnostics.push(info('props_disabled', stageId, 'infrastructure/props generation disabled'));
        return;
      }

      // Only place lights if not explicitly provided
      if ((ctx.infrastructure.lights?.length ?? 0) > 0) {
        ctx.report.diagnostics.push(info('props_passthrough', stageId, 'using declared lights/props', {
          lights: ctx.infrastructure.lights.length,
          props: ctx.infrastructure.props.length,
        }));
        return;
      }

      const roads = ctx.networks?.roads?.segments ?? [];
      if (!roads.length) {
        ctx.report.diagnostics.push(info('props_no_roads', stageId, 'no road segments available for street lights'));
        return;
      }

      const seed = mix(ctx.meta.seed ?? 0, stageId);
      const rng = makeRng(seed);
      // Engine enforces a hard cap on real point/spot lights (CONFIG.jsonMap.maxRealLights = 8).
      const REAL_LIGHT_CAP = 8;
      const existing = Array.isArray(ctx.input?.lights) ? ctx.input.lights.length : 0;
      const budget = clamp(Number.isInteger(cfg.lightBudget) ? cfg.lightBudget : REAL_LIGHT_CAP, 0, Math.max(0, REAL_LIGHT_CAP - existing));
      if (budget <= 0) {
        ctx.report.diagnostics.push(info('props_light_budget_exhausted', stageId, 'real light budget exhausted; skipping street lights'));
        return;
      }
      const sideOffset = clamp(Number(cfg.lightOffset) || 5.5, 2, 10);
      const height = clamp(Number(cfg.lightHeight) || 7.5, 4, 12);

      // Pick a few representative points along roads (start/mid/end) to stay within cap.
      const samples = [];
      for (const seg of roads) {
        const pts = pathPoints(seg); if (!pts) continue;
        let total = 0;
        for (let i = 0; i + 1 < pts.length; i++) total += Math.hypot(pts[i + 1][0]-pts[i][0], pts[i + 1][2]-pts[i][2]);
        const targets = [0.2, 0.5, 0.8];
        for (const fr of targets) {
          let need = total * fr, acc = 0;
          for (let i = 0; i + 1 < pts.length; i++) {
            const a = pts[i], b = pts[i + 1];
            const dx = b[0]-a[0], dz = b[2]-a[2], dy = b[1]-a[1];
            const len = Math.hypot(dx, dz); if (len < 1e-6) continue;
            if (acc + len >= need) {
              const t = (need - acc) / len;
              samples.push({ x: a[0]+dx*t, z: a[2]+dz*t, y: a[1]+dy*t, nx: -dz/len, nz: dx/len, w: 1 - Math.abs(fr-0.5) });
              break;
            }
            acc += len;
          }
        }
      }
      // deterministic selection: spread by order + rng tie-break
      for (let i = samples.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [samples[i], samples[j]] = [samples[j], samples[i]]; }
      samples.sort((a,b) => b.w - a.w);

      const lights = [];
      let skipped = 0;
      for (const s of samples) {
        if (lights.length >= budget) break;
        const side = (rng() < 0.5 ? -1 : 1);
        const lx = Math.round((s.x + s.nx * side * sideOffset) * 100) / 100;
        const lz = Math.round((s.z + s.nz * side * sideOffset) * 100) / 100;
        const ly = Math.round((s.y + height) * 100) / 100;
        if (lights.some(o => distXZ(o.position.x, o.position.z, lx, lz) < 18)) { skipped++; continue; }
        lights.push({
          id: `sl_${lights.length + 1}`,
          type: 'point',
          position: { x: lx, y: ly, z: lz },
          color: 0xffd8a8,
          intensity: 38,
          distance: 45,
        });
      }
      ctx.infrastructure.lights = lights;
      ctx.report.diagnostics.push(info('street_lights_generated', stageId, 'generated street lights along roads', {
        count: ctx.infrastructure.lights.length, budget, skipped,
      }));
    },
    validate(ctx) {
      const stageId = '5_infrastructure_props';
      if (!Array.isArray(ctx.infrastructure?.lights)) ctx.infrastructure.lights = [];
      if (!Array.isArray(ctx.infrastructure?.props)) ctx.infrastructure.props = [];
      // basic sanity: keep lights with valid positions
      const ok = [];
      for (const l of ctx.infrastructure.lights) {
        const p = l?.position;
        if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.z)) {
          ctx.report.drops.push({ stage: stageId, id: l?.id ?? null, reason: 'invalid_light' });
          continue;
        }
        ok.push(l);
      }
      ctx.infrastructure.lights = ok;
    },
    repair(_ctx) {},
    emit(ctx) {
      // Pass through to engine input for compile/build; compileCityforge preserves raw.lights
      if (ctx.infrastructure?.lights?.length) {
        ctx.input.lights = Array.isArray(ctx.input.lights) ? ctx.input.lights.concat(ctx.infrastructure.lights) : ctx.infrastructure.lights;
      }
      if (ctx.infrastructure?.props?.length) {
        ctx.input.props = Array.isArray(ctx.input.props) ? ctx.input.props.concat(ctx.infrastructure.props) : ctx.infrastructure.props;
      }
      ctx.engine = ctx.input;
    },
  };
}
