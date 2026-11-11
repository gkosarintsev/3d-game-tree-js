/**
 * Stage contract: prepare(ctx) → generate(ctx) → validate(ctx) → repair(ctx)
 */
import { info } from '../diagnostics.mjs';

export function runStage(stage, ctx) {
  const id = stage.id;
  if (stage.enabled === false) {
    ctx.report.stages.push({ id, status: 'skipped' });
    return ctx;
  }
  const entry = { id, status: 'ok', diagnostics: 0, repairs: 0, drops: 0 };
  const beforeD = ctx.report.diagnostics.length;
  const beforeR = ctx.report.repairs.length;
  const beforeDrop = ctx.report.drops.length;
  try {
    if (typeof stage.prepare === 'function') stage.prepare(ctx);
    if (typeof stage.generate === 'function') stage.generate(ctx);
    if (typeof stage.validate === 'function') stage.validate(ctx);
    if (typeof stage.repair === 'function') stage.repair(ctx);
    ctx.report.diagnostics.push(info('stage_ok', id, `stage ${id} completed`));
  } catch (e) {
    entry.status = 'error';
    ctx.report.diagnostics.push({ severity: 'error', code: 'stage_error', stage: id, message: String(e?.message ?? e) });
  }
  entry.diagnostics = ctx.report.diagnostics.length - beforeD;
  entry.repairs = ctx.report.repairs.length - beforeR;
  entry.drops = ctx.report.drops.length - beforeDrop;
  ctx.report.stages.push(entry);
  return ctx;
}

export function stage(id, impl = {}) {
  return { id, enabled: impl.enabled !== false, ...impl };
}
