/**
 * Diagnostics and generation report model (ADR-001, TASK-002).
 * Deterministic: no timestamps, stable ordering.
 */
import { byId } from './ids.mjs';

export function diag(severity, code, stage, message, extra = {}) {
  return { severity, code, stage, message, ...extra };
}

export function info(code, stage, message, extra) { return diag('info', code, stage, message, extra); }
export function warn(code, stage, message, extra) { return diag('warn', code, stage, message, extra); }
export function error(code, stage, message, extra) { return diag('error', code, stage, message, extra); }

export function createReport(meta = {}) {
  return {
    version: 1,
    generator: {
      generatorVersion: meta.generatorVersion ?? null,
      seed: meta.seed ?? null,
      deterministic: meta.deterministic ?? true,
    },
    stages: [],
    districts: [],
    diagnostics: [],
    repairs: [],
    drops: [],
    summary: { errors: 0, warnings: 0, repairs: 0, drops: 0 },
  };
}

export function finalizeReport(report) {
  // Stable ordering for determinism
  report.stages = [...(report.stages ?? [])].sort((a, b) => String(a.id ?? a.stage ?? '').localeCompare(String(b.id ?? b.stage ?? '')));
  report.districts = [...(report.districts ?? [])].sort(byId);
  const sevRank = { error: 0, warn: 1, info: 2 };
  report.diagnostics = [...(report.diagnostics ?? [])].sort((a, b) =>
    (sevRank[a.severity] ?? 9) - (sevRank[b.severity] ?? 9)
    || String(a.stage ?? '').localeCompare(String(b.stage ?? ''))
    || String(a.code ?? '').localeCompare(String(b.code ?? ''))
    || String(a.message ?? '').localeCompare(String(b.message ?? ''))
  );
  report.repairs = [...(report.repairs ?? [])].sort((a, b) => String(a.stage ?? '').localeCompare(String(b.stage ?? '')) || String(a.code ?? '').localeCompare(String(b.code ?? '')));
  report.drops = [...(report.drops ?? [])].sort((a, b) => String(a.stage ?? '').localeCompare(String(b.stage ?? '')) || String(a.id ?? '').localeCompare(String(b.id ?? '')));
  report.summary = {
    errors: report.diagnostics.filter(d => d.severity === 'error').length,
    warnings: report.diagnostics.filter(d => d.severity === 'warn').length,
    repairs: report.repairs.length,
    drops: report.drops.length,
  };
  return report;
}

export function reportToJson(report) {
  return JSON.stringify(finalizeReport(report), null, 2).replace(/\r\n/g, '\n') + '\n';
}
