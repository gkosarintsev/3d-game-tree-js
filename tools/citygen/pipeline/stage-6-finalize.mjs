/**
 * Stage 6: finalize and cross-stage checks (TASK-008).
 * Emits deterministic summary diagnostics (counts/connectivity hints) without
 * mutating generated geometry. Chunking/skeleton emission is handled by the
 * shared build pipeline after compilation.
 */
import { info, warn } from '../diagnostics.mjs';

function distXZ(ax, az, bx, bz) { return Math.hypot(ax - bx, az - bz); }

function pointSegDistXZ(px, pz, ax, az, bx, bz) {
  const abx = bx - ax, abz = bz - az, apx = px - ax, apz = pz - az;
  const ab2 = abx * abx + abz * abz || 1e-12;
  const t = Math.max(0, Math.min(1, (apx * abx + apz * abz) / ab2));
  return Math.hypot(px - (ax + abx * t), pz - (az + abz * t));
}

function minRoadDist(x, z, segments = []) {
  let best = Infinity;
  for (const s of segments) {
    const pts = Array.isArray(s?.path) ? s.path : [];
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], b = pts[i + 1];
      if (!a || !b) continue;
      best = Math.min(best, pointSegDistXZ(x, z, a[0], a[2], b[0], b[2]));
    }
  }
  return best;
}

export function makeStage6() {
  return {
    id: '6_finalize_emit',
    validate(ctx) {
      const stageId = '6_finalize_emit';
      const roads = ctx.networks?.roads?.segments ?? [];
      const nodes = ctx.networks?.roads?.nodes ?? [];
      const districts = Array.isArray(ctx.districts) ? ctx.districts : [];
      const parcels = Array.isArray(ctx.parcels) ? ctx.parcels : [];
      const buildings = Array.isArray(ctx.buildings) ? ctx.buildings : [];
      const lights = Array.isArray(ctx.infrastructure?.lights) ? ctx.infrastructure.lights : (ctx.input?.lights ?? []);
      const props = Array.isArray(ctx.infrastructure?.props) ? ctx.infrastructure.props : (ctx.input?.landscapeObjects ?? []);
      const gp = ctx.input?.gameplay ?? {};
      const spawn = { x: gp.spawn?.x ?? 0, z: gp.spawn?.z ?? 0 };
      const exit = { x: gp.exit?.x ?? 0, z: gp.exit?.z ?? 0 };

      const reservedParcels = parcels.filter(p => p?.reserved).length;
      const districtTypes = Array.from(new Set(districts.map(d => d.type || d.profileId).filter(Boolean))).sort();

      ctx.report.diagnostics.push(info('finalize_counts', stageId, 'generation summary', {
        roadNodes: nodes.length,
        roadSegments: roads.length,
        districts: districts.length,
        districtTypes,
        parcels: parcels.length,
        reservedParcels,
        buildings: buildings.length,
        lights: Array.isArray(lights) ? lights.length : 0,
        props: Array.isArray(props) ? props.length : 0,
      }));

      if (roads.length) {
        const spawnD = minRoadDist(spawn.x, spawn.z, roads);
        const exitD = minRoadDist(exit.x, exit.z, roads);
        if (Number.isFinite(spawnD) && spawnD > 120) {
          ctx.report.diagnostics.push(warn('anchor_far_from_roads_final', stageId, 'spawn is far from generated road network', { anchor: 'spawn', distance: +spawnD.toFixed(2) }));
        }
        if (Number.isFinite(exitD) && exitD > 120) {
          ctx.report.diagnostics.push(warn('anchor_far_from_roads_final', stageId, 'exit is far from generated road network', { anchor: 'exit', distance: +exitD.toFixed(2) }));
        }
        if (distXZ(spawn.x, spawn.z, exit.x, exit.z) < 1) {
          ctx.report.diagnostics.push(warn('anchors_coincident', stageId, 'spawn and exit are coincident', { spawn, exit }));
        }
      } else {
        ctx.report.diagnostics.push(warn('finalize_no_roads', stageId, 'no road segments available at finalize stage'));
      }

      // Keep engine pointing to transformed input for downstream build/compile.
      ctx.engine = ctx.input;
    },
  };
}
