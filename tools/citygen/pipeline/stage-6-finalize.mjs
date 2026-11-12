/**
 * Stage 6: finalize and cross-stage checks (TASK-008).
 * Emits summary diagnostics (counts/connectivity hints) and can apply minimal,
 * deterministic safe repairs (e.g. same-layer crossing resolution when slope/geometry
 * remain valid). Chunking/skeleton emission is handled by the shared build pipeline
 * after compilation.
 */
import { info, warn } from '../diagnostics.mjs';
import { makeTerrainSampler } from './stage-2-transport.mjs';
import { createSpatialIndex } from '../spatial.mjs';

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

function segIntersectionXZ(a1, a2, b1, b2) {
  const x1 = a1[0], z1 = a1[2], x2 = a2[0], z2 = a2[2];
  const x3 = b1[0], z3 = b1[2], x4 = b2[0], z4 = b2[2];
  const den = (x1 - x2) * (z3 - z4) - (z1 - z2) * (x3 - x4);
  if (Math.abs(den) < 1e-12) return null;
  const t = ((x1 - x3) * (z3 - z4) - (z1 - z3) * (x3 - x4)) / den;
  const u = -(((x1 - x2) * (z1 - z3) - (z1 - z2) * (x1 - x3)) / den);
  if (t <= 1e-6 || t >= 1 - 1e-6 || u <= 1e-6 || u >= 1 - 1e-6) return null; // proper interior crossing only
  const ix = x1 + t * (x2 - x1), iz = z1 + t * (z2 - z1);
  const iy = (a1[1] ?? 0) + t * ((a2[1] ?? 0) - (a1[1] ?? 0));
  return { x: ix, y: iy, z: iz, t, u };
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

      const interchangeSegments = roads.filter(s => s?.interchange && s?.layer === 'elevated').length;
      const junctionInterchangesApplied = (ctx.report?.diagnostics ?? []).filter(d => d.code === 'transport_interchange_junction' && d.stage === '2_transport').length;
      const overpassInterchangesApplied = (ctx.report?.diagnostics ?? []).filter(d => d.code === 'transport_interchange_overpass' && d.stage === '2_transport').length;
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
        ...(interchangeSegments || junctionInterchangesApplied || overpassInterchangesApplied ? { interchanges: { segments: interchangeSegments, junctions: junctionInterchangesApplied, overpasses: overpassInterchangesApplied } } : {}),
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
        if (!seg || !seg.interchange || seg.layer !== 'elevated') continue;
        interchangeCount++;
        const pts = Array.isArray(seg.path) ? seg.path : [];
        if (pts.length < 2) {
          ctx.report.diagnostics.push(warn('interchange_invalid_path', stageId, `interchange segment '${seg.id ?? '?'}' has invalid path`, { segmentId: seg.id ?? null }));
          continue;
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
        // Overpass spans should arch above both endpoints; ramps legitimately connect grade to elevated.
        const isRampLike = seg.interchange === 'junction_ramp' || Math.abs(y0 - yN) >= 0.8;
        if (!isRampLike && !(midY > Math.max(y0, yN) + 0.8)) {
          ctx.report.diagnostics.push(warn('interchange_profile_flat', stageId, `interchange segment '${seg.id ?? '?'}' is not meaningfully elevated`, { segmentId: seg.id ?? null }));
        }
        // Junction ramps should bridge ground and elevated road nodes (grade separation semantics).
        if (seg.interchange === 'junction_ramp') {
          const lf = nFrom?.layer ?? 'ground';
          const lt = nTo?.layer ?? 'ground';
          const layersOk = (lf === 'ground' && lt === 'elevated') || (lf === 'elevated' && lt === 'ground');
          if (!layersOk) {
            ctx.report.diagnostics.push(warn('interchange_ramp_layers', stageId, `junction ramp '${seg.id ?? '?'}' should connect ground and elevated nodes`, { segmentId: seg.id ?? null, fromLayer: lf, toLayer: lt }));
          }
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
        // Interchange graph consistency (B4 groundwork): endpoints must exist and interchange nodes
        // should have coherent degree/layer connectivity (ramps/elevated segments).
        const nodeById = new Map(nodes.map(n => [n?.id, n]));
        const segById = new Map(roads.map(s => [s?.id, s]).filter(([id]) => id != null));
        const deg = new Map();
        for (const s of roads) {
          if (!s) continue;
          if (s.from) deg.set(s.from, (deg.get(s.from) || 0) + 1);
          if (s.to) deg.set(s.to, (deg.get(s.to) || 0) + 1);
        }
        let endpointErrors = 0;
        let elevatedNodeIssues = 0;
        for (const seg of roads) {
          if (!seg || !seg.interchange || seg.layer !== 'elevated') continue;
          if (!nodeById.has(seg.from) || !nodeById.has(seg.to)) endpointErrors++;
        }
        for (const [nid, n] of nodeById) {
          if (n?.layer !== 'elevated') continue;
          const d = deg.get(nid) || 0;
          if (d < 2) elevatedNodeIssues++;
        }
        if (endpointErrors > 0) {
          ctx.report.diagnostics.push(warn('interchange_endpoint_missing', stageId, 'interchange segment references missing road node(s)', { count: endpointErrors }));
        }
        if (elevatedNodeIssues > 0) {
          ctx.report.diagnostics.push(warn('interchange_elevated_node_degree', stageId, 'elevated interchange node has low connectivity degree', { count: elevatedNodeIssues }));
        }

        // Junction/overpass interchange prototype integrity: referenced segments/nodes must still exist.
        let junctionIntegrityIssues = 0;
        let overpassIntegrityIssues = 0;
        for (const d of (ctx.report?.diagnostics ?? [])) {
          if (d?.code === 'transport_interchange_junction' && d?.stage === '2_transport') {
            const up = d.elevatedNode;
            if (up && (!nodeById.has(up) || nodeById.get(up)?.layer !== 'elevated')) junctionIntegrityIssues++;
            const rampIds = Array.isArray(d.ramps) ? d.ramps : [];
            for (const rid of rampIds) {
              const rs = segById.get(rid);
              if (!rs || rs.layer !== 'elevated' || rs.interchange !== 'junction_ramp') junctionIntegrityIssues++;
            }
            // connectors are named deterministically from junction node id in current prototype
            if (d.nodeId) {
              const ca = segById.get(`tr_jc_${d.nodeId}_a`);
              const cb = segById.get(`tr_jc_${d.nodeId}_b`);
              if (!ca || ca.layer !== 'ground') junctionIntegrityIssues++;
              if (!cb || cb.layer !== 'ground') junctionIntegrityIssues++;
            }
          }
          if (d?.code === 'transport_interchange_overpass' && d?.stage === '2_transport') {
            const sid = d.segmentId;
            const s = sid ? segById.get(sid) : null;
            if (!s || s.layer !== 'elevated' || s.bridge !== true || s.interchange !== 'overpass') overpassIntegrityIssues++;
          }
        }
        if (junctionIntegrityIssues > 0) {
          ctx.report.diagnostics.push(warn('interchange_junction_integrity', stageId, 'junction interchange prototype references missing/invalid segments or nodes', { count: junctionIntegrityIssues }));
        }
        if (overpassIntegrityIssues > 0) {
          ctx.report.diagnostics.push(warn('interchange_overpass_integrity', stageId, 'overpass interchange prototype segment missing or invalid', { count: overpassIntegrityIssues }));
        }
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
    repair(ctx) {
      const stageId = '6_finalize_emit';
      const networks = ctx.networks?.roads;
      if (!networks || !Array.isArray(networks.nodes) || !Array.isArray(networks.segments)) return;
      const nodes = networks.nodes;
      const segments = networks.segments;
      const segLayer = (s) => (s?.layer === 'elevated' || s?.interchange === 'overpass') ? 'elevated' : 'ground';
      const sharesNode = (a, b) => !!((a?.from && (a.from === b?.from || a.from === b?.to)) || (a?.to && (a.to === b?.from || a.to === b?.to)));
      const usedNodeIds = new Set(nodes.map(n => n.id));
      const usedSegIds = new Set(segments.map(s => s.id));
      const uniqNode = (base) => { let id = base, k = 2; while (usedNodeIds.has(id)) { id = `${base}_${k++}`; } usedNodeIds.add(id); return id; };
      const uniqSeg = (base) => { let id = base, k = 2; while (usedSegIds.has(id)) { id = `${base}_${k++}`; } usedSegIds.add(id); return id; };

      const splitPathAt = (path, subIdx, t) => {
        const a = path[subIdx], b = path[subIdx + 1];
        // Keep point on original subsegment to preserve slope/run exactly.
        const p = [
          a[0] + (b[0]-a[0]) * t,
          a[1] + (b[1]-a[1]) * t,
          a[2] + (b[2]-a[2]) * t,
        ];
        const left = path.slice(0, subIdx + 1).map(pt => pt.slice());
        left.push(p.slice());
        const right = [p.slice()].concat(path.slice(subIdx + 1).map(pt => pt.slice()));
        return { point: p, left, right };
      };
      const pathLenXZ = (pts) => { let l=0; for(let i=1;i<pts.length;i++) l+=Math.hypot((pts[i][0]-pts[i-1][0]),(pts[i][2]-pts[i-1][2])); return l; };
      const maxSlope = (pts) => {
        let m = 0;
        for (let i = 1; i < (pts?.length ?? 0); i++) {
          const a = pts[i-1], b = pts[i];
          const run = Math.hypot((b[0]-a[0]), (b[2]-a[2]));
          if (run > 1e-9) m = Math.max(m, Math.abs((b[1]-a[1])) / run);
        }
        return m;
      };
      const cloneSeg = (base, over) => {
        const s = { ...base, ...over };
        if (Array.isArray(base.lanes)) s.lanes = JSON.parse(JSON.stringify(base.lanes));
        if (Array.isArray(over.path)) s.path = over.path.map(p => p.slice());
        return s;
      };

      let repairs = 0;
      const unrepairable = new Set();
      for (let iter = 0; iter < 30; iter++) {
        let found = null;
        // deterministic scan: first repairable conflict found in stable order
        for (let i = 0; i < segments.length && !found; i++) {
          const si = segments[i]; if (!si?.path || si.path.length < 2) continue;
          for (let j = i + 1; j < segments.length && !found; j++) {
            const sj = segments[j]; if (!sj?.path || sj.path.length < 2) continue;
            if (sharesNode(si, sj)) continue;
            if (segLayer(si) !== segLayer(sj)) continue;
            const pairKey = [si.id ?? i, sj.id ?? j].sort().join('|');
            if (unrepairable.has(pairKey)) continue;
            for (let a = 0; a + 1 < si.path.length && !found; a++) {
              for (let b = 0; b + 1 < sj.path.length && !found; b++) {
                const hit = segIntersectionXZ(si.path[a], si.path[a + 1], sj.path[b], sj.path[b + 1]);
                if (hit) found = { i, j, a, b, hit, pairKey };
              }
            }
          }
        }
        if (!found) break;
        const si = segments[found.i], sj = segments[found.j];
        const splitI = splitPathAt(si.path, found.a, found.hit.t);
        const splitJ = splitPathAt(sj.path, found.b, found.hit.u);
        if (pathLenXZ(splitI.left) < 1 || pathLenXZ(splitI.right) < 1 || pathLenXZ(splitJ.left) < 1 || pathLenXZ(splitJ.right) < 1) {
          unrepairable.add(found.pairKey);
          continue;
        }

        // Shared junction must have one position; try both segment-profile Y values deterministically
        // (si first) and choose the one that keeps all resulting segments within slope limits.
        const tryNodePos = (basePoint) => {
          const np = basePoint.slice();
          const a1 = cloneSeg(si, { id: null, to: null, path: splitI.left });
          const a2 = cloneSeg(si, { id: null, from: null, path: splitI.right });
          const b1 = cloneSeg(sj, { id: null, to: null, path: splitJ.left });
          const b2 = cloneSeg(sj, { id: null, from: null, path: splitJ.right });
          a1.path[a1.path.length - 1] = np.slice(); a2.path[0] = np.slice();
          b1.path[b1.path.length - 1] = np.slice(); b2.path[0] = np.slice();
          const ok = [a1, a2, b1, b2].every(s => maxSlope(s.path) <= 0.3 + 1e-6);
          const worst = [a1, a2, b1, b2].reduce((m, s) => Math.max(m, maxSlope(s.path)), 0);
          return { ok, worst, np, a1, a2, b1, b2 };
        };
        const candA = tryNodePos(splitI.point);
        const candB = tryNodePos(splitJ.point);
        let chosen = null;
        if (candA.ok && candB.ok) chosen = (candA.worst <= candB.worst + 1e-12) ? candA : candB;
        else if (candA.ok) chosen = candA;
        else if (candB.ok) chosen = candB;
        if (!chosen) {
          unrepairable.add(found.pairKey);
          ctx.report.diagnostics.push(warn('road_crossing_repair_skipped', stageId, `skipped crossing repair for '${si.id}' x '${sj.id}' (would violate slope/geometry constraints)`, { segments: [si.id, sj.id] }));
          continue;
        }

        const si1 = cloneSeg(si, { id: uniqSeg(`${si.id}_a`), to: null, path: chosen.a1.path });
        const si2 = cloneSeg(si, { id: uniqSeg(`${si.id}_b`), from: null, path: chosen.a2.path });
        const sj1 = cloneSeg(sj, { id: uniqSeg(`${sj.id}_a`), to: null, path: chosen.b1.path });
        const sj2 = cloneSeg(sj, { id: uniqSeg(`${sj.id}_b`), from: null, path: chosen.b2.path });
        const nodePos = chosen.np;

        const nodeId = uniqNode('tr_x');
        const n = { id: nodeId, position: nodePos.slice(), layer: segLayer(si) };
        nodes.push(n);
        si1.to = nodeId; si2.from = nodeId; sj1.to = nodeId; sj2.from = nodeId;

        // replace segments (remove higher index first)
        const hi = Math.max(found.i, found.j), lo = Math.min(found.i, found.j);
        const keepHi = hi === found.i ? [si1, si2] : [sj1, sj2];
        const keepLo = lo === found.i ? [si1, si2] : [sj1, sj2];
        segments.splice(hi, 1, ...keepHi);
        segments.splice(lo, 1, ...keepLo);

        repairs++;
        ctx.report.repairs.push({ stage: stageId, code: 'resolve_road_crossing', node: nodeId, segments: [si.id, sj.id] });
        ctx.report.diagnostics.push(info('road_crossing_repaired', stageId, `repaired same-layer crossing by inserting junction '${nodeId}'`, { node: nodeId, segments: [si.id, sj.id] }));
      }

      if (unrepairable.size > 0) {
        ctx.report.diagnostics.push(warn('road_conflicts_unresolved', stageId, `could not safely repair ${unrepairable.size} same-layer crossing conflict(s)`, { count: unrepairable.size }));
      } else if (repairs > 0) {
        ctx.report.diagnostics.push(info('road_conflicts_resolved', stageId, 'resolved detected same-layer road crossing conflicts', { repairs }));
      }

      // rebuild road easement mask/index after repairs (best effort)
      if (repairs > 0) {
        if (!ctx.masks) ctx.masks = { easement: { rivers: ctx.masks?.easement?.rivers ?? [], roads: [] } };
        if (!ctx.masks.easement) ctx.masks.easement = { rivers: [], roads: [] };
        ctx.masks.easement.roads = [];
        const idx = createSpatialIndex(ctx.meta?.worldBounds ?? { size: ctx.input?.ground?.size ?? 256 });
        for (const s of segments) {
          const pts = Array.isArray(s?.path) ? s.path : null;
          if (!pts || pts.length < 2) continue;
          let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;
          for (const p of pts) { minX=Math.min(minX,p[0]); maxX=Math.max(maxX,p[0]); minZ=Math.min(minZ,p[2]); maxZ=Math.max(maxZ,p[2]); }
          const w = (Array.isArray(s.lanes) && s.lanes[0]?.width) ? s.lanes[0].width : 8;
          const r = { id: s.id ?? null, minX, maxX, minZ, maxZ, width: w };
          ctx.masks.easement.roads.push(r);
          idx.insert(r);
        }
        ctx.spatial = ctx.spatial || {};
        ctx.spatial.roadEasements = idx;
        networks.nodes = nodes;
        networks.segments = segments;
        if (ctx.input?.cityforge?.networks) ctx.input.cityforge.networks.roads = networks;

        // keep finalize summary counts consistent with post-repair network
        const fin = (ctx.report?.diagnostics ?? []).find(d => d.code === 'finalize_counts' && d.stage === stageId);
        if (fin) {
          const rg = roadComponents(nodes, segments);
          fin.roadNodes = nodes.length;
          fin.roadSegments = segments.length;
          fin.roadComponents = rg.components;
          fin.roadGraphNodes = rg.graphNodes;
          if (fin.interchanges) fin.interchanges.segments = segments.filter(s => s?.interchange && s?.layer === 'elevated').length;
        }
      }

      ctx.engine = ctx.input;
    },
  };
}
