/**
 * Repair policy helpers: retry (local reseed) → degrade → drop → fail (ADR-001).
 */
export function applyRepairPolicy(ctx, { stage, objectId, attempt = 0, maxRetries = 2, degrade, drop, fail }) {
  const log = (entry) => ctx.report.repairs.push({ stage, objectId: objectId ?? null, ...entry });
  if (attempt < maxRetries && degrade) {
    log({ code: 'retry_degrade', attempt: attempt + 1 });
    return { action: 'degrade', value: degrade(attempt + 1) };
  }
  if (drop) {
    log({ code: 'drop', attempt });
    ctx.report.drops.push({ stage, id: objectId ?? null, reason: 'repair_drop' });
    return { action: 'drop', value: drop() };
  }
  log({ code: 'fail', attempt });
  return { action: 'fail', value: fail ? fail() : null };
}
