/**
 * City generator v4 orchestrator (TASK-002/003).
 * Runs deterministic stages, produces diagnostics/report; stages progressively
 * populate/validate/emit IR while preserving compilable v4 content.
 */
import { createContext } from './context.mjs';
import { runStage, stage } from './pipeline/stage.mjs';
import { finalizeReport, reportToJson } from './diagnostics.mjs';
import { makeStage1 } from './pipeline/stage-1-landscape.mjs';

const STAGES = [
  stage('0_input_space', {}),
  makeStage1(),
  stage('2_transport', {}),
  stage('3_districts_parcels', {}),
  stage('4_buildings_structures', {}),
  stage('5_infrastructure_props', {}),
  stage('6_finalize_emit', {}),
];

export function runCitygen(raw) {
  const ctx = createContext(raw);
  // Allow generator.stages to disable/override in future; for now run all skeleton stages.
  for (const s of STAGES) runStage(s, ctx);
  // Future: stages emit/transform ctx.engine into engine brief. For TASK-002 skeleton,
  // preserve provided cityforge content so v4 briefs with embedded data compile as before.
  ctx.engine = raw;
  finalizeReport(ctx.report);
  return { engine: ctx.engine, report: ctx.report, reportJson: reportToJson(ctx.report), ctx };
}

export { reportToJson, finalizeReport };
