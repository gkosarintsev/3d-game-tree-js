import * as THREE from 'three';
import { JsonMap } from '../../src/json-map.js';

/**
 * Detailed/textured rendering for visualizer: builds game-like meshes with
 * textures and details by reusing JsonMap rendering. Read-only dev tool mode.
 */

function isNum(v) { return typeof v === 'number' && Number.isFinite(v); }

/** Merge decoded chunk collections into unique arrays (prefer owner). */
export function mergeChunkData(decodedCells) {
  const collections = ['buildings', 'roads', 'props', 'lights', 'channels', 'tunnels'];
  const out = {};
  for (const c of collections) out[c] = [];
  const seen = new Set();
  const cells = decodedCells || [];
  // two passes: owners first
  for (const passOwner of [true, false]) {
    for (const cell of cells) {
      const d = cell?.decoded;
      if (!d || cell.error) continue;
      for (const coll of collections) {
        const arr = d[coll];
        if (!Array.isArray(arr)) continue;
        for (const raw of arr) {
          if (!raw || raw.id == null) continue;
          const id = String(raw.id);
          const key = `${coll}:${id}`;
          if (seen.has(key)) continue;
          const isOwner = raw.owner === true;
          if (passOwner && !isOwner) continue;
          // in second pass take non-owner only if never seen
          out[coll].push(raw);
          seen.add(key);
        }
      }
    }
  }
  // merge road decks from duplicates (like model) - simple pass over all again
  const byId = new Map();
  for (const r of out.roads) byId.set(String(r.id), r);
  for (const cell of cells) {
    const d = cell?.decoded; if (!d || cell.error) continue;
    for (const raw of d.roads || []) {
      if (!raw?.id) continue;
      const base = byId.get(String(raw.id));
      if (!base || !Array.isArray(raw.decks)) continue;
      if (!Array.isArray(base.decks)) base.decks = [];
      const have = new Set(base.decks.map(x => JSON.stringify(x)));
      for (const dk of raw.decks) {
        const s = JSON.stringify(dk);
        if (!have.has(s)) { base.decks.push(dk); have.add(s); }
      }
    }
  }
  return out;
}

export function buildMergedSpec(source, compiledIndex, decodedCells) {
  const merged = mergeChunkData(decodedCells);
  const ground = source?.ground || compiledIndex?.ground || { y: 0, size: 1280, color: 0x6fb04a };
  const bounds = compiledIndex?.bounds || source?.cityforge?.world?.bounds && Array.isArray(source.cityforge.world.bounds.min) ? {
    minX: source.cityforge.world.bounds.min[0], minZ: source.cityforge.world.bounds.min[2],
    maxX: source.cityforge.world.bounds.max[0], maxZ: source.cityforge.world.bounds.max[2],
  } : { minX: -ground.size / 2, maxX: ground.size / 2, minZ: -ground.size / 2, maxZ: ground.size / 2 };
  const spawn = source?.gameplay?.spawn || compiledIndex?.spawn || { x: 0, z: 0 };
  const spec = {
    kind: 'json',
    ground: { ...ground },
    bounds: { ...bounds },
    spawn: { ...spawn },
    buildings: merged.buildings,
    roads: merged.roads,
    channels: merged.channels,
    props: merged.props,
    lights: merged.lights,
    tunnels: merged.tunnels,
  };
  if (source?.windows) spec.windows = source.windows;
  if (source?.signage) spec.signage = source.signage;
  if (source?.clutter) spec.clutter = source.clutter;
  if (compiledIndex?.relief) spec.relief = compiledIndex.relief;
  else if (source?.relief) spec.relief = source.relief;
  // waterRects may appear in chunks in some formats? keep extensible
  return spec;
}

export async function createDetailedView({ source, compiledIndex, decodedCells, onProgress }) {
  const spec = buildMergedSpec(source, compiledIndex, decodedCells);
  const group = new THREE.Group();
  group.name = 'detailed-root';
  const lightsGroup = new THREE.Group();
  group.add(lightsGroup);

  // basic lighting similar to game-ish readable view
  const hemi = new THREE.HemisphereLight(0xbfdcff, 0x445566, 0.9);
  const dir = new THREE.DirectionalLight(0xffffff, 1.1);
  dir.position.set(200, 400, 120);
  dir.castShadow = false;
  const amb = new THREE.AmbientLight(0xffffff, 0.25);
  lightsGroup.add(hemi, dir, amb);

  try { onProgress?.('build-spec'); } catch {}
  // yield so UI can update
  await new Promise(r => setTimeout(r, 0));

  let map = null;
  const _prof = (typeof globalThis !== 'undefined' && globalThis.__mapBuildProfile);
  try {
    // JsonMap constructor builds nav/solids; can be heavy
    map = new JsonMap(spec);
  } catch (e) {
    e.message = `JsonMap init: ${e.message}`;
    throw e;
  }
  await new Promise(r => setTimeout(r, 0));
  try { onProgress?.('build-visuals'); } catch {}
  const _tBuild = _prof ? performance.now() : 0;
  try {
    map.build(group);
  } catch (e) {
    e.message = `JsonMap build: ${e.message}`;
    throw e;
  }
  if (_prof) {
    const p = map.lastBuildProfile || (map.lastBuildProfile = {});
    if (p.pictureMs == null) p.pictureMs = performance.now() - _tBuild;
    globalThis.__lastMapBuildProfile = p;
  }

  return {
    group,
    map,
    spec,
    dispose() {
      try { map?.dispose?.(); } catch {}
      // dispose any remaining geometries/materials/textures under group
      group.traverse((obj) => {
        if (obj.geometry) { try { obj.geometry.dispose?.(); } catch {} }
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          for (const m of mats) {
            for (const k of ['map','normalMap','roughnessMap','metalnessMap','aoMap','emissiveMap','alphaMap']) {
              try { m?.[k]?.dispose?.(); } catch {}
            }
            try { m?.dispose?.(); } catch {}
          }
        }
      });
      try { group.clear(); } catch {}
    },
  };
}
