/**
 * Stable, deterministic ids for citygen artifacts (ADR-001).
 */
import { mix } from './rng.mjs';

export function stableId(...parts) {
  return parts.map(p => String(p ?? '')).join('_');
}

export function stageSubseed(seed, stage, districtId = '', chunkY = 0, chunkX = 0, slotId = '', attempt = 0) {
  return mix(seed, stage, districtId, chunkY, chunkX, slotId, attempt);
}

/** Deterministic sort key: by id, then by coords if present. */
export function byId(a, b) {
  return String(a?.id ?? '').localeCompare(String(b?.id ?? ''));
}
