/**
 * WorldState / IR container for citygen pipeline (TASK-002 skeleton).
 */
import { createReport } from './diagnostics.mjs';
import { makeRng } from './rng.mjs';

export function createContext(input) {
  const gen = input?.generator ?? {};
  const seed = Number.isInteger(gen.seed) ? gen.seed : 0;
  return {
    input,
    meta: {
      seed,
      generatorVersion: gen.generatorVersion ?? '0.0.0',
      deterministic: gen.deterministic !== false,
      worldBounds: input?.ground ? { size: input.ground.size, y: input.ground.y ?? 0 } : null,
      stream: input?.stream ?? null,
    },
    masks: {},
    terrain: null,
    networks: null,
    districts: [],
    parcels: [],
    buildings: [],
    props: [],
    rng: makeRng(seed),
    report: createReport(gen),
    hooks: { behavior: {}, glb: {} }, // future: gameplay/properties, asset refs (MVP: static/no-op)
  };
}
