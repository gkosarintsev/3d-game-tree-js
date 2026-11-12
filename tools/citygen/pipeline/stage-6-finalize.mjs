/**
 * Stage 6: finalize and cross-stage checks (TASK-008).
 * Emits deterministic summary diagnostics (counts/connectivity hints) without
 * mutating generated geometry. Chunking/skeleton emission is handled by the
 * shared build pipeline after compilation.
 */
import { info, warn } from '../diagnostics.mjs';
import { makeTerrainSampler } from './stage-2-transport.mjs';

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

function buildingCenter(b) {
  const fp = Array.isArray(b?.footprint) ? b.footprint : [];
  if (!fp.length) return null;
  let sx = 0, sz = 0, n = 0;
  for (const p of fp) {
    const x = Number(p?.x ?? p?.[0]), z = Number(p?.z ?? p?.[2] ?? p?.[1]);
    if (!Number.isFinite(x) || !Number.isFinite(z)) continue;
    sx += x; sz += z; n++;
  }
  return n ? { x: sx / n, z: sz / n } : null;
}

function pointPos(o) {
  const p = o?.position ?? o;
  const x = Number(p?.x ?? p?.[0]), z = Number(p?.z ?? p?.[2] ?? p?.[1]);
  return (Number.isFinite(x) && Number.isFinite(z)) ? { x, z } : null;
}

function chunkKeyFor(x, z, groundSize, chunkSize, grid) {
  if (!(chunkSize > 0) || !(groundSize > 0) || !(grid > 0)) return null;
  const half = groundSize / 2;
  const cx = Math.max(0, Math.min(grid - 1, Math.floor((x + half) / chunkSize)));
  const cz = Math.max(0, Math.min(grid - 1, Math.floor((z + half) / chunkSize)));
  return `${cx}_${cz}`;
}

function roadComponents(nodes = [], segments = []) {
  const adj = new Map();
  for (const n of nodes) if (n?.id != null) adj.set(n.id, new Set());
  for (const s of segments) {
    if (s?.from && s?.to && adj.has(s.from) && adj.has(s.to)) {
      adj.get(s.from).add(s.to); adj.get(s.to).add(s.from);
    }
  }
  const seen = new Set();
  let components = 0;
  for (const id of adj.keys()) {
    if (seen.has(id)) continue;
    components++;
    const q = [id]; seen.add(id);
    while (q.length) {
      const cur = q.shift();
      for (const nb of (adj.get(cur) || [])) if (!seen.has(nb)) { seen.add(nb); q.push(nb); }
    }
  }
  return { components, graphNodes: adj.size };
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
      const propsDiag = (ctx.report?.diagnostics ?? []).find(d => d.stage === '5_infrastructure_props' && d.code === 'props_generated');
      const propsByDistrictType = (propsDiag?.byDistrictType && typeof propsDiag.byDistrictType === 'object') ? propsDiag.byDistrictType : null;
      const gp = ctx.input?.gameplay ?? {};
      const spawn = { x: gp.spawn?.x ?? 0, z: gp.spawn?.z ?? 0 };
      const exit = { x: gp.exit?.x ?? 0, z: gp.exit?.z ?? 0 };

      const reservedParcels = parcels.filter(p => p?.reserved).length;
      const districtTypes = Array.from(new Set(districts.map(d => d.type || d.profileId).filter(Boolean))).sort();

      const buildingsByDistrictType = {};
      const buildingsByDistrictId = {};
      const districtTypeById = new Map(districts.map(d => [d.id, d.type || d.profileId]));
      for (const b of buildings) {
        // building ids are b_<districtId>_<n> in generated form; fallback to unknown
        const did = typeof b?.id === 'string' && b.id.startsWith('b_') ? b.id.split('_').slice(1, -1).join('_') : null;
        const dtype = (did && districtTypeById.get(did)) || 'unknown';
        buildingsByDistrictType[dtype] = (buildingsByDistrictType[dtype] || 0) + 1;
        if (did) buildingsByDistrictId[did] = (buildingsByDistrictId[did] || 0) + 1;
      }

      const parcelsByDistrictId = {};
      for (const p of parcels) {
        const did = p?.districtId;
        if (did) parcelsByDistrictId[did] = (parcelsByDistrictId[did] || 0) + 1;
      }
      for (const d of districts) {
        const did = d?.id;
        if (!did) continue;
        const pc = parcelsByDistrictId[did] ?? 0;
        const bc = buildingsByDistrictId[did] ?? 0;
        const dtype = d.type || d.profileId || 'unknown';
        // Some district types (e.g. forest/field-like) may legitimately have few/no buildings; warn for built-up types with parcels but none.
        const expectsBuildings = !['forest', 'park', 'field', 'sports_field'].includes(dtype);
        if (pc > 0 && bc === 0 && expectsBuildings) {
          ctx.report.diagnostics.push(warn('district_without_buildings', stageId, `district '${did}' (${dtype}) has parcels but no buildings`, { districtId: did, type: dtype, parcels: pc }));
        }
      }

      let near = 0, mid = 0, far = 0;
      for (const p of parcels) {
        const rd = Number.isFinite(p?.access?.roadDist) ? p.access.roadDist : null;
        if (rd == null) { far++; continue; }
        if (rd < 60) near++; else if (rd < 140) mid++; else far++;
      }

      // Road-access coverage for road-needy district types (TASK-005/006/008).
      const roadNeedyTypes = new Set(['office', 'residential', 'luxury', 'industrial', 'slums', 'parking', 'sports']);
      const accessByType = Object.create(null);
      for (const p of parcels) {
        const t = p?.type || 'unknown';
        if (!roadNeedyTypes.has(t)) continue;
        const r = accessByType[t] || (accessByType[t] = { parcels: 0, unreserved: 0, good: 0, mid: 0, far: 0, reserved: 0 });
        r.parcels++;
        if (p?.reserved) { r.reserved++; continue; }
        r.unreserved++;
        const rd = Number.isFinite(p?.access?.roadDist) ? p.access.roadDist : null;
        if (rd == null || rd >= 140) r.far++;
        else if (rd < 60) r.good++;
        else r.mid++;
      }
      for (const k of Object.keys(accessByType)) {
        const r = accessByType[k];
        r.goodOrMid = r.good + r.mid;
        r.accessibleRatio = r.unreserved > 0 ? +(r.goodOrMid / r.unreserved).toFixed(3) : null;
      }
      const roadAccessByType = Object.keys(accessByType).sort().reduce((o, k) => { o[k] = accessByType[k]; return o; }, {});

      const groundSize = Number(ctx.meta?.worldBounds?.size ?? ctx.input?.ground?.size ?? 0) || 0;
      const stream = ctx.meta?.stream ?? ctx.input?.stream ?? null;
      const chunk = Number(stream?.chunk) > 0 ? Number(stream.chunk) : null;
      const grid = chunk && groundSize ? Math.max(1, Math.round(groundSize / chunk)) : null;
      const roadGraph = roadComponents(nodes, roads);

      // Per-chunk load estimates (buildings/props/lights) for budget awareness (TASK-006/008).
      let chunkLoad = null;
      if (grid && chunk) {
        const per = new Map();
        const bump = (key, kind) => { if (!key) return; const r = per.get(key) || { buildings: 0, props: 0, lights: 0 }; r[kind]++; per.set(key, r); };
        for (const b of buildings) { const c = buildingCenter(b); if (c) bump(chunkKeyFor(c.x, c.z, groundSize, chunk, grid), 'buildings'); }
        for (const p of props) { const c = pointPos(p); if (c) bump(chunkKeyFor(c.x, c.z, groundSize, chunk, grid), 'props'); }
        for (const l of lights) { const c = pointPos(l); if (c) bump(chunkKeyFor(c.x, c.z, groundSize, chunk, grid), 'lights'); }
        const rows = Array.from(per.values());
        const maxB = rows.reduce((m, r) => Math.max(m, r.buildings), 0);
        const maxP = rows.reduce((m, r) => Math.max(m, r.props), 0);
        const maxL = rows.reduce((m, r) => Math.max(m, r.lights), 0);
        const nonEmpty = rows.length;
        chunkLoad = {
          nonEmptyChunks: nonEmpty,
          maxBuildings: maxB,
          maxProps: maxP,
          maxLights: maxL,
          avgBuildings: buildings.length && grid ? +(buildings.length / (grid * grid)).toFixed(2) : 0,
          avgProps: Array.isArray(props) && grid ? +(props.length / (grid * grid)).toFixed(2) : 0,
        };
        // Heuristic warnings: very high concentration in a single chunk can hurt stream/budgets.
        if (maxB > 60) ctx.report.diagnostics.push(warn('chunk_buildings_heavy', stageId, `high building count in a single chunk (${maxB})`, { maxBuildings: maxB, chunk, grid }));
        if (maxP > 80) ctx.report.diagnostics.push(warn('chunk_props_heavy', stageId, `high prop count in a single chunk (${maxP})`, { maxProps: maxP, chunk, grid }));
      }

      ctx.report.diagnostics.push(info('finalize_counts', stageId, 'generation summary', {
        groundSize,
        stream: stream ? {
          chunk: stream.chunk ?? null,
          keep: stream.keep ?? null,
          aheadMin: stream.aheadMin ?? null,
          aheadMax: stream.aheadMax ?? null,
          budgetMs: stream.budgetMs ?? null,
        } : null,
        chunks: grid ? { grid, total: grid * grid } : null,
        roadNodes: nodes.length,
        roadSegments: roads.length,
        roadComponents: roadGraph.components,
        roadGraphNodes: roadGraph.graphNodes,
        districts: districts.length,
        districtTypes,
        parcels: parcels.length,
        reservedParcels,
        parcelAccess: { near, mid, far },
        roadAccessByType,
        buildings: buildings.length,
        buildingsByDistrictType,
        lights: Array.isArray(lights) ? lights.length : 0,
        props: Array.isArray(props) ? props.length : 0,
        ...(propsByDistrictType ? { propsByDistrictType } : {}),
        ...(chunkLoad ? { chunkLoad } : {}),
      }));

      for (const [t, r] of Object.entries(roadAccessByType)) {
        if (r.parcels > 0 && r.unreserved > 0 && r.goodOrMid === 0) {
          ctx.report.diagnostics.push(warn('district_type_poor_road_access', stageId, `road-needy type '${t}' has no parcels with road access < 140m`, { type: t, parcels: r.parcels, unreserved: r.unreserved }));
        }
      }

      // M3 B3 groundwork: basic validation for interchange/overpass segments.
      let interchangeCount = 0;
      const nodeById = new Map(nodes.map(n => [n?.id, n]));
      let sampler = null;
      try { sampler = makeTerrainSampler(ctx); } catch { sampler = null; }
      for (const seg of roads) {
        if (!seg || (seg.interchange !== 'overpass' && !(seg.layer === 'elevated' && seg.interchange))) continue;
        interchangeCount++;
        const pts = Array.isArray(seg.path) ? seg.path : [];
        if (pts.length < 2) {
          ctx.report.diagnostics.push(warn('interchange_invalid_path', stageId, `interchange segment '${seg.id ?? '?'}' has invalid path`, { segmentId: seg.id ?? null }));
          continue;
        }
        if (seg.layer !== 'elevated') {
          ctx.report.diagnostics.push(warn('interchange_layer_mismatch', stageId, `interchange segment '${seg.id ?? '?'}' should use elevated layer`, { segmentId: seg.id ?? null, layer: seg.layer ?? null }));
        }
        // Endpoint consistency with road graph nodes (path endpoints should match node positions).
        const nFrom = nodeById.get(seg.from), nTo = nodeById.get(seg.to);
        if (nFrom?.position && pts[0]) {
          const dx = Math.abs((pts[0][0] ?? 0) - (nFrom.position[0] ?? 0));
          const dz = Math.abs((pts[0][2] ?? 0) - (nFrom.position[2] ?? 0));
          if (dx > 0.05 || dz > 0.05) ctx.report.diagnostics.push(warn('interchange_endpoint_mismatch', stageId, `interchange segment '${seg.id ?? '?'}' start mismatches node`, { segmentId: seg.id ?? null, node: seg.from ?? null }));
        }
        if (nTo?.position && pts[pts.length - 1]) {
          const pe = pts[pts.length - 1];
          const dx = Math.abs((pe[0] ?? 0) - (nTo.position[0] ?? 0));
          const dz = Math.abs((pe[2] ?? 0) - (nTo.position[2] ?? 0));
          if (dx > 0.05 || dz > 0.05) ctx.report.diagnostics.push(warn('interchange_endpoint_mismatch', stageId, `interchange segment '${seg.id ?? '?'}' end mismatches node`, { segmentId: seg.id ?? null, node: seg.to ?? null }));
        }
        let maxSlope = 0;
        for (let i = 0; i + 1 < pts.length; i++) {
          const a = pts[i], b = pts[i + 1]; if (!a || !b) continue;
          const run = Math.hypot((b[0] ?? 0) - (a[0] ?? 0), (b[2] ?? 0) - (a[2] ?? 0));
          const rise = Math.abs((b[1] ?? 0) - (a[1] ?? 0));
          if (run > 1e-9) maxSlope = Math.max(maxSlope, rise / run);
        }
        const y0 = pts[0]?.[1] ?? 0, yN = pts[pts.length - 1]?.[1] ?? 0;
        const midY = pts.reduce((m, p) => Math.max(m, p?.[1] ?? -Infinity), -Infinity);
        if (maxSlope > 0.31) {
          ctx.report.diagnostics.push(warn('interchange_slope_high', stageId, `interchange segment '${seg.id ?? '?'}' exceeds slope limit`, { segmentId: seg.id ?? null, maxSlope: +maxSlope.toFixed(3) }));
        }
        if (!(midY > Math.max(y0, yN) + 0.8)) {
          ctx.report.diagnostics.push(warn('interchange_profile_flat', stageId, `interchange segment '${seg.id ?? '?'}' is not meaningfully elevated`, { segmentId: seg.id ?? null }));
        }
        // Approximate vertical clearance over terrain along elevated span (B3 groundwork).
        if (sampler) {
          let minClear = Infinity;
          let checked = 0;
          const endMaxY = Math.max(y0, yN);
          for (let i = 0; i + 1 < pts.length; i++) {
            const a = pts[i], b = pts[i + 1]; if (!a || !b) continue;
            const dx = (b[0] ?? 0) - (a[0] ?? 0), dz = (b[2] ?? 0) - (a[2] ?? 0);
            const segLen = Math.hypot(dx, dz);
            const steps = Math.max(1, Math.ceil(segLen / 6));
            for (let s = 0; s <= steps; s++) {
              const t = s / steps;
              const x = (a[0] ?? 0) + dx * t, z = (a[2] ?? 0) + dz * t;
              const y = (a[1] ?? 0) + ((b[1] ?? 0) - (a[1] ?? 0)) * t;
              if (y <= endMaxY + 1.0) continue; // skip ramps/touchdown near grade
              const gy = sampler.heightAt(x, z);
              minClear = Math.min(minClear, y - gy);
              checked++;
            }
          }
          if (checked > 0 && Number.isFinite(minClear) && minClear < 1.5) {
            ctx.report.diagnostics.push(warn('interchange_clearance_low', stageId, `interchange segment '${seg.id ?? '?'}' has low clearance over terrain`, { segmentId: seg.id ?? null, minClearance: +minClear.toFixed(3), requiredClearance: 1.5 }));
          }
        }
      }
      if (interchangeCount > 0) {
        ctx.report.diagnostics.push(info('interchange_validated', stageId, 'validated interchange/overpass segments', { count: interchangeCount }));
      }

      // M3 B3: detect same-layer proper (non-collinear) road crossings without a shared junction node.
      // Collinear overlaps and endpoint-sharing connections are not treated as crossing conflicts.
      // Different effective layers are considered grade-separated.
      {
        const segLayer = (s) => (s?.layer === 'elevated' || s?.interchange === 'overpass') ? 'elevated' : 'ground';
        const sharesNode = (a, b) => !!((a?.from && (a.from === b?.from || a.from === b?.to)) || (a?.to && (a.to === b?.from || a.to === b?.to)));
        const orient = (ax, az, bx, bz, cx, cz) => (bx - ax) * (cz - az) - (bz - az) * (cx - ax);
        const onSeg = (ax, az, bx, bz, cx, cz) => Math.min(ax,bx)-1e-6 <= cx && cx <= Math.max(ax,bx)+1e-6 && Math.min(az,bz)-1e-6 <= cz && cz <= Math.max(az,bz)+1e-6;
        const properCross = (a1, a2, b1, b2) => {
          const o1 = orient(a1[0],a1[2],a2[0],a2[2],b1[0],b1[2]);
          const o2 = orient(a1[0],a1[2],a2[0],a2[2],b2[0],b2[2]);
          const o3 = orient(b1[0],b1[2],b2[0],b2[2],a1[0],a1[2]);
          const o4 = orient(b1[0],b1[2],b2[0],b2[2],a2[0],a2[2]);
          const s1 = (o1 > 0) - (o1 < 0), s2 = (o2 > 0) - (o2 < 0), s3 = (o3 > 0) - (o3 < 0), s4 = (o4 > 0) - (o4 < 0);
          if (s1 !== 0 && s2 !== 0 && s3 !== 0 && s4 !== 0 && s1 !== s2 && s3 !== s4) return true;
          return false; // collinear/touching treated as non-crossing conflict here
        };
        let conflictCount = 0;
        const conflictPairs = new Set();
        for (let i = 0; i < roads.length; i++) {
          const si = roads[i]; if (!si?.path || si.path.length < 2) continue;
          for (let j = i + 1; j < roads.length; j++) {
            const sj = roads[j]; if (!sj?.path || sj.path.length < 2) continue;
            if (sharesNode(si, sj)) continue;
            if (segLayer(si) !== segLayer(sj)) continue; // grade-separated
            let crossed = false;
            for (let a = 0; a + 1 < si.path.length && !crossed; a++) {
              for (let b = 0; b + 1 < sj.path.length && !crossed; b++) {
                const p1 = si.path[a], p2 = si.path[a+1], p3 = sj.path[b], p4 = sj.path[b+1];
                if (!p1||!p2||!p3||!p4) continue;
                if (properCross(p1,p2,p3,p4)) crossed = true;
              }
            }
            if (!crossed) continue;
            const key = [si.id ?? i, sj.id ?? j].sort().join('|');
            if (!conflictPairs.has(key)) { conflictPairs.add(key); conflictCount++; }
          }
        }
        if (conflictCount > 0) {
          ctx.report.diagnostics.push(warn('road_same_level_conflict', stageId, `detected ${conflictCount} same-layer road crossing conflict(s) without shared junction`, { count: conflictCount }));
        } else {
          ctx.report.diagnostics.push(info('road_conflicts_none', stageId, 'no same-layer road crossing conflicts detected'));
        }
      }

      // M3 B2 groundwork: identify junction-grade-separation candidates (degree>=4, all ground, not interchange).
      {
        const segByNode = new Map();
        for (const s of roads) {
          if (!s) continue;
          if (s.from) { if (!segByNode.has(s.from)) segByNode.set(s.from, []); segByNode.get(s.from).push(s); }
          if (s.to) { if (!segByNode.has(s.to)) segByNode.set(s.to, []); segByNode.get(s.to).push(s); }
        }
        let candidates = 0;
        for (const [nid, inc] of segByNode) {
          if (!nid || inc.length < 4) continue;
          if (inc.some(s => s?.interchange || s?.layer === 'elevated')) continue;
          candidates++;
        }
        if (candidates > 0) {
          ctx.report.diagnostics.push(info('interchange_junction_candidates', stageId, 'identified junction nodes as grade-separation candidates', { count: candidates }));
        }
      }

      if (roads.length) {
        const spawnD = minRoadDist(spawn.x, spawn.z, roads);
        const exitD = minRoadDist(exit.x, exit.z, roads);
        if (Number.isFinite(spawnD) && spawnD > 120) {
          ctx.report.diagnostics.push(warn('anchor_far_from_roads_final', stageId, 'spawn is far from generated road network', { anchor: 'spawn', distance: +spawnD.toFixed(2) }));
        }
        if (Number.isFinite(exitD) && exitD > 120) {
          ctx.report.diagnostics.push(warn('anchor_far_from_roads_final', stageId, 'exit is far from generated road network', { anchor: 'exit', distance: +exitD.toFixed(2) }));
        }
        if (roadGraph.components > 1) {
          ctx.report.diagnostics.push(warn('road_graph_disconnected_final', stageId, `road graph has ${roadGraph.components} connected components at finalize`, { components: roadGraph.components }));
        }
        if (distXZ(spawn.x, spawn.z, exit.x, exit.z) < 1) {
          ctx.report.diagnostics.push(warn('anchors_coincident', stageId, 'spawn and exit are coincident', { spawn, exit }));
        }
        if (roadGraph.components === 1 && Number.isFinite(spawnD) && Number.isFinite(exitD) && spawnD <= 120 && exitD <= 120) {
          ctx.report.diagnostics.push(info('anchors_connected_network', stageId, 'spawn and exit are near a single connected road graph component', { spawnDistance: +spawnD.toFixed(2), exitDistance: +exitD.toFixed(2), roadComponents: roadGraph.components }));
        }
      } else {
        ctx.report.diagnostics.push(warn('finalize_no_roads', stageId, 'no road segments available at finalize stage'));
      }

      // Keep engine pointing to transformed input for downstream build/compile.
      ctx.engine = ctx.input;
    },
  };
}
