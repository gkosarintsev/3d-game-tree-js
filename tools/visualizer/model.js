/**
 * Чистая модель визуализатора (без Three/DOM).
 * Нормализация, dedupe, provenance, districts, matching source↔compiled, статистика.
 */

export const LEVEL_NUMBERS = [7, 8, 9, 10, 15, 16, 17, 18, 19];

export function levelFileName(n) {
  return `level-${String(n).padStart(2, '0')}`;
}

export function parseLevelNumbers(indexJsText) {
  const m = /export\s+const\s+LEVEL_NUMBERS\s*=\s*\[([^\]]+)\]/s.exec(indexJsText || '');
  if (!m) return null;
  const nums = m[1].split(',').map(s => Number(String(s).trim())).filter(n => Number.isFinite(n));
  return nums.length ? nums : null;
}

function isNum(v) { return typeof v === 'number' && Number.isFinite(v); }

function bboxInit() {
  return { minX: Infinity, minY: Infinity, minZ: Infinity, maxX: -Infinity, maxY: -Infinity, maxZ: -Infinity };
}
function bboxAdd(b, x, y, z) {
  if (!isNum(x) || !isNum(y) || !isNum(z)) return;
  if (x < b.minX) b.minX = x; if (x > b.maxX) b.maxX = x;
  if (y < b.minY) b.minY = y; if (y > b.maxY) b.maxY = y;
  if (z < b.minZ) b.minZ = z; if (z > b.maxZ) b.maxZ = z;
}
function bboxValid(b) { return b.minX <= b.maxX && b.minY <= b.maxY && b.minZ <= b.maxZ; }
function bboxUnion(a, b) {
  if (!bboxValid(b)) return a;
  if (!bboxValid(a)) return { ...b };
  return {
    minX: Math.min(a.minX, b.minX), minY: Math.min(a.minY, b.minY), minZ: Math.min(a.minZ, b.minZ),
    maxX: Math.max(a.maxX, b.maxX), maxY: Math.max(a.maxY, b.maxY), maxZ: Math.max(a.maxZ, b.maxZ),
  };
}

function pointBbox(x, y, z, s = 0.5) {
  return { minX: x - s, maxX: x + s, minY: y - s, maxY: y + s, minZ: z - s, maxZ: z + s };
}

function deckToGeom(d) {
  const topY = isNum(d.topY) ? d.topY : (isNum(d.topAtMax) ? d.topAtMax : 0);
  const bottomY = isNum(d.bottomY) ? d.bottomY : topY - 0.6;
  const geom = {
    minX: d.minX, maxX: d.maxX, minZ: d.minZ, maxZ: d.maxZ,
    topY, bottomY,
    topAtMin: isNum(d.topAtMin) ? d.topAtMin : topY,
    topAtMax: isNum(d.topAtMax) ? d.topAtMax : topY,
    ramp: !!d.ramp,
    rails: !!d.rails,
  };
  if (d.obb) geom.obb = { ...d.obb };
  if (isNum(d.yaw)) geom.yaw = d.yaw;
  if (isNum(d.length)) geom.length = d.length;
  if (isNum(d.width)) geom.width = d.width;
  return geom;
}

function roadBBox(road) {
  const b = bboxInit();
  for (const d of road.decks || []) {
    const y0 = isNum(d.bottomY) ? d.bottomY : (isNum(d.topY) ? d.topY - 0.6 : 0);
    const y1 = isNum(d.topAtMax) ? d.topAtMax : (isNum(d.topY) ? d.topY : 0);
    const y2 = isNum(d.topAtMin) ? d.topAtMin : y1;
    bboxAdd(b, d.minX, y0, d.minZ); bboxAdd(b, d.maxX, y0, d.maxZ);
    bboxAdd(b, d.minX, y1, d.minZ); bboxAdd(b, d.maxX, y1, d.maxZ);
    bboxAdd(b, d.minX, y2, d.minZ); bboxAdd(b, d.maxX, y2, d.maxZ);
  }
  if (!bboxValid(b) && road.fill?.length) {
    for (const f of road.fill) { bboxAdd(b, f.minX, 0, f.minZ); bboxAdd(b, f.maxX, 0, f.maxZ); }
  }
  return bboxValid(b) ? b : { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 };
}

function buildingBBox(bld) {
  const b = bboxInit();
  const by = isNum(bld.baseY) ? bld.baseY : 0;
  const ry = isNum(bld.roofY) ? bld.roofY : by + 3;
  if (bld.bounds) {
    bboxAdd(b, bld.bounds.minX, by, bld.bounds.minZ);
    bboxAdd(b, bld.bounds.maxX, ry, bld.bounds.maxZ);
  } else if (Array.isArray(bld.footprint)) {
    for (const p of bld.footprint) bboxAdd(b, p.x, by, p.z), bboxAdd(b, p.x, ry, p.z);
  }
  return bboxValid(b) ? b : pointBbox(0, by, 0, 1);
}

function propBBox(p) {
  const pos = p.position || { x: 0, y: 0, z: 0 };
  const s = p.scale || { x: 1, y: 1, z: 1 };
  const hx = Math.max(0.25, (s.x || 1) * 0.5);
  const hy = Math.max(0.25, (s.y || 1) * 0.5);
  const hz = Math.max(0.25, (s.z || 1) * 0.5);
  return { minX: pos.x - hx, maxX: pos.x + hx, minY: pos.y, maxY: pos.y + hy * 2, minZ: pos.z - hz, maxZ: pos.z + hz };
}

function normalizeRoad(r) {
  return {
    id: String(r.id),
    kind: 'road',
    type: r.type || 'local',
    width: isNum(r.width) ? r.width : null,
    withLamps: !!r.withLamps,
    decks: (r.decks || []).map(deckToGeom),
    fill: (r.fill || []).map(f => ({ ...f })),
    aprons: (r.aprons || []).map(a => ({ ...a })),
    rails: (r.decks || []).some(d => d.rails),
    ramp: (r.decks || []).some(d => d.ramp),
    lampsCount: (r.lamps || []).length,
    pillarsCount: (r.pillars || []).length,
    raw: r,
  };
}

function normalizeBuilding(b) {
  return {
    id: String(b.id),
    kind: 'building',
    name: b.name || null,
    isEnterable: !!b.isEnterable,
    baseY: isNum(b.baseY) ? b.baseY : 0,
    roofY: isNum(b.roofY) ? b.roofY : (isNum(b.baseY) ? b.baseY : 0) + 3,
    floorsCount: b.floorsCount ?? null,
    facadeMaterial: b.facadeMaterial || null,
    footprint: Array.isArray(b.footprint) ? b.footprint.map(p => ({ x: p.x, z: p.z })) : null,
    bounds: b.bounds ? { ...b.bounds } : null,
    walls: Array.isArray(b.walls) ? b.walls.map(w => ({ ...w })) : [],
    houseKind: b.houseKind || null,
    raw: b,
  };
}

function normalizeProp(p) {
  return {
    id: String(p.id),
    kind: 'prop',
    model: p.model || null,
    source: p.source || null,
    position: p.position ? { x: p.position.x, y: p.position.y || 0, z: p.position.z } : { x: 0, y: 0, z: 0 },
    scale: p.scale ? { ...p.scale } : null,
    rotationY: isNum(p.rotationY) ? p.rotationY : null,
    raw: p,
  };
}

function normalizeLight(l) {
  return {
    id: String(l.id),
    kind: 'light',
    position: l.position ? { x: l.position.x, y: l.position.y || 0, z: l.position.z } : { x: 0, y: 0, z: 0 },
    intensity: l.intensity,
    range: l.range,
    raw: l,
  };
}

function normalizeChannel(c) {
  return {
    id: String(c.id),
    kind: 'channel',
    segments: Array.isArray(c.segments) ? c.segments : [],
    raw: c,
  };
}

function normalizeTunnel(t) {
  return {
    id: String(t.id),
    kind: 'tunnel',
    points: Array.isArray(t.points) ? t.points.map(p => ({ x: p.x, y: p.y || 0, z: p.z })) : [],
    width: t.width, height: t.height,
    raw: t,
  };
}

const KIND_NORM = {
  roads: normalizeRoad,
  buildings: normalizeBuilding,
  props: normalizeProp,
  lights: normalizeLight,
  channels: normalizeChannel,
  tunnels: normalizeTunnel,
};

/**
 * Декодировать и собрать compiled-сущности из чанков с dedupe.
 * @param {Array<{id:string,file:string,rect:any,objects:any,decoded:any}>} cells
 * @returns {{entities:Record<string,Map<string,any>>, stats:any, chunkInfo:Map<string,any>}}
 */
export function collectCompiled(cells) {
  const collections = ['roads', 'buildings', 'props', 'lights', 'channels', 'tunnels'];
  const entities = {};
  for (const c of collections) entities[c] = new Map();
  const chunkInfo = new Map();
  const seen = new Map(); // key -> entity
  const stats = { unique: {}, instances: {}, duplicates: 0, ownerCount: 0, failedChunks: 0 };

  for (const cell of cells) {
    const id = String(cell.id);
    chunkInfo.set(id, { id, rect: cell.rect, objects: cell.objects || {}, file: cell.file, failed: !!cell.error, error: cell.error || null });
    if (cell.error || !cell.decoded) { stats.failedChunks++; continue; }
    for (const coll of collections) {
      const arr = cell.decoded[coll];
      if (!Array.isArray(arr)) continue;
      stats.instances[coll] = (stats.instances[coll] || 0) + arr.length;
      const normFn = KIND_NORM[coll];
      for (const raw of arr) {
        if (!raw || raw.id == null) continue;
        const oid = String(raw.id);
        const key = `${coll}:${oid}`;
        const existing = seen.get(key);
        if (existing) {
          stats.duplicates++;
          existing.instances = (existing.instances || 1) + 1;
          if (!existing.chunkIds.includes(id)) existing.chunkIds.push(id);
          // слияние decks для дорог (копии на шве несут части)
          if (coll === 'roads' && Array.isArray(raw.decks)) {
            const have = new Set(existing.attrs.decks.map(d => JSON.stringify(d)));
            for (const d of raw.decks) {
              const s = JSON.stringify(deckToGeom(d));
              if (!have.has(s)) { existing.attrs.decks.push(deckToGeom(d)); have.add(s); }
            }
            existing.bbox = bboxUnion(existing.bbox, roadBBox(raw));
            existing.attrs.ramp = existing.attrs.ramp || raw.decks.some(d => d.ramp);
            existing.attrs.rails = existing.attrs.rails || raw.decks.some(d => d.rails);
          }
          if (raw.owner === true && existing.ownerChunk == null) existing.ownerChunk = id;
          continue;
        }
        const attrs = normFn(raw);
        let bbox;
        if (coll === 'roads') bbox = roadBBox(raw);
        else if (coll === 'buildings') bbox = buildingBBox(raw);
        else if (coll === 'props') bbox = propBBox(raw);
        else if (coll === 'lights') {
          const p = raw.position || { x: 0, y: 0, z: 0 };
          bbox = pointBbox(p.x, p.y || 0, p.z, isNum(raw.range) ? Math.min(raw.range, 5) : 1);
        } else if (coll === 'tunnels' && Array.isArray(raw.points) && raw.points.length) {
          bbox = bboxInit();
          for (const p of raw.points) bboxAdd(bbox, p.x, (p.y || 0) - (raw.height || 3), p.z), bboxAdd(bbox, p.x, (p.y || 0) + (raw.height || 3), p.z);
          if (!bboxValid(bbox)) bbox = pointBbox(raw.points[0].x, raw.points[0].y || 0, raw.points[0].z, 2);
        } else if (coll === 'channels') {
          bbox = bboxInit();
          for (const s of raw.segments || []) {
            for (const k of ['bed', 'walls', 'points']) {
              const v = s?.[k];
              if (Array.isArray(v)) {
                for (const pt of v) if (pt && isNum(pt.x) && isNum(pt.z)) bboxAdd(bbox, pt.x, pt.y || 0, pt.z);
              } else if (v && typeof v === 'object') {
                if (isNum(v.minX) && isNum(v.maxX) && isNum(v.minZ) && isNum(v.maxZ)) {
                  const y = isNum(v.y) ? v.y : 0;
                  bboxAdd(bbox, v.minX, y, v.minZ); bboxAdd(bbox, v.maxX, y, v.maxZ);
                } else if (isNum(v.x) && isNum(v.z)) {
                  bboxAdd(bbox, v.x, v.y || 0, v.z);
                }
              }
            }
            for (const key of ['ax', 'bx']) {
              if (isNum(s?.[key]) && isNum(s?.[key === 'ax' ? 'az' : 'bz'])) {
                bboxAdd(bbox, s[key], 0, s[key === 'ax' ? 'az' : 'bz']);
              }
            }
          }
          if (!bboxValid(bbox)) bbox = pointBbox(0, 0, 0, 1);
        } else bbox = pointBbox(0, 0, 0, 1);

        const ent = {
          id: oid,
          kind: coll.slice(0, -1), // road/building/prop/light/channel/tunnel
          origin: 'unknown',
          status: 'present',
          originRule: null,
          parentId: null,
          nestedFrom: null,
          sourcePointer: null,
          chunkIds: [id],
          ownerChunk: raw.owner === true ? id : null,
          instances: 1,
          geometry: null,
          attrs,
          bbox,
          labelPriority: 0,
        };
        if (raw.owner === true) stats.ownerCount++;
        entities[coll].set(oid, ent);
        seen.set(key, ent);
        stats.unique[coll] = (stats.unique[coll] || 0) + 1;
      }
    }
  }
  return { entities, stats, chunkInfo };
}

// ---------- source index ----------

export function buildSourceIndex(source) {
  const idx = new Map();
  if (!source) return idx;
  const cf = source.cityforge || {};
  const roads = cf.networks?.roads || {};
  (roads.nodes || []).forEach((n, i) => { if (n?.id != null) idx.set(String(n.id), { kind: 'road-node', pointer: `/cityforge/networks/roads/nodes/${i}`, raw: n }); });
  (roads.segments || []).forEach((s, i) => { if (s?.id != null) idx.set(String(s.id), { kind: 'road-segment', pointer: `/cityforge/networks/roads/segments/${i}`, raw: s }); });
  (source.buildings || []).forEach((b, i) => { if (b?.id != null) idx.set(String(b.id), { kind: 'building', pointer: `/buildings/${i}`, raw: b }); });
  (source.props || []).forEach((p, i) => { if (p?.id != null) idx.set(String(p.id), { kind: 'prop', pointer: `/props/${i}`, raw: p }); });
  (source.lights || []).forEach((l, i) => { if (l?.id != null) idx.set(String(l.id), { kind: 'light', pointer: `/lights/${i}`, raw: l }); });
  (source.generator?.districts || []).forEach((d, i) => { if (d?.id != null) idx.set(String(d.id), { kind: 'district', pointer: `/generator/districts/${i}`, raw: d }); });
  if (source.gameplay?.spawn) idx.set('__spawn__', { kind: 'anchor', pointer: '/gameplay/spawn', raw: source.gameplay.spawn });
  if (source.gameplay?.exit) idx.set('__exit__', { kind: 'anchor', pointer: '/gameplay/exit', raw: source.gameplay.exit });
  (cf.structures?.tunnels || []).forEach((t, i) => { if (t?.id != null) idx.set(String(t.id), { kind: 'tunnel', pointer: `/cityforge/structures/tunnels/${i}`, raw: t }); });
  return idx;
}

// ---------- provenance ----------

function stripSplitSuffix(id) {
  let x = String(id);
  let depth = 0;
  while (/_[ab]$/.test(x)) { x = x.slice(0, -2); depth++; }
  return { base: x, depth };
}

function pillarParent(id) {
  const m = /^pillar_(.+)_-?\d+(?:\.\d+)?_-?\d+(?:\.\d+)?$/.exec(id);
  return m ? m[1] : null;
}

function tunnelPortalParent(id) {
  const m = /^tunnel_(.+)_p\d+$/.exec(id);
  return m ? m[1] : null;
}

export function classifyEntity(id, kind, sourceIndex, report, compiledRoadIds) {
  const sid = String(id);
  const src = sourceIndex.get(sid);
  if (src) {
    return { origin: 'authored', originRule: `source:${src.pointer}`, sourcePointer: src.pointer, parentId: null };
  }
  // split of source road
  if (kind === 'road') {
    const { base, depth } = stripSplitSuffix(sid);
    if (depth > 0 && sourceIndex.has(base)) {
      const s = sourceIndex.get(base);
      return { origin: 'authored', originRule: `split:${base}`, sourcePointer: s.pointer, parentId: base, split: true, splitDepth: depth };
    }
  }
  // pads
  if (/^spawn_pad$|^exit_pad$/.test(sid)) {
    const ptr = sid === 'spawn_pad' ? '/gameplay/spawn' : '/gameplay/exit';
    return { origin: 'derived', originRule: 'pad', sourcePointer: ptr, parentId: null };
  }
  // tunnel portal
  const tp = tunnelPortalParent(sid);
  if (tp) {
    const s = sourceIndex.get(tp);
    return { origin: 'derived', originRule: `tunnel-portal:${tp}`, sourcePointer: s?.pointer || null, parentId: tp };
  }
  // pillar
  const pp = pillarParent(sid);
  if (pp) {
    const { base } = stripSplitSuffix(pp);
    return { origin: 'derived', originRule: `pillar:${pp}`, sourcePointer: null, parentId: compiledRoadIds?.has(pp) ? pp : (compiledRoadIds?.has(base) ? base : pp) };
  }
  // generated patterns
  if (/^tr_/.test(sid)) return { origin: 'generated', originRule: 'regex:^tr_', sourcePointer: null, parentId: null };
  if (/^b_(.+)_\d+$/.test(sid)) return { origin: 'generated', originRule: 'regex:^b_', sourcePointer: null, parentId: sid.replace(/^b_(.+)_\d+$/, '$1') ? null : null };
  if (/^sl_\d+$/.test(sid)) return { origin: 'generated', originRule: 'regex:^sl_', sourcePointer: null, parentId: null };
  if (/^prop_\d+$/.test(sid)) return { origin: 'generated', originRule: 'regex:^prop_', sourcePointer: null, parentId: null };
  if (/^district_\d+_\d+$/.test(sid)) return { origin: 'generated', originRule: 'regex:^district_i_j', sourcePointer: null, parentId: null };
  // district from report (auto) - kind district
  if (kind === 'district' && report?.districts?.some(d => String(d.id) === sid)) {
    return { origin: 'generated', originRule: 'report:district', sourcePointer: null, parentId: null };
  }
  return { origin: 'unknown', originRule: 'unmatched', sourcePointer: null, parentId: null };
}

export function applyProvenance(entities, sourceIndex, report) {
  const roadIds = new Set([...(entities.roads?.keys() || [])]);
  const byOrigin = { authored: 0, generated: 0, derived: 0, unknown: 0 };
  for (const [coll, map] of Object.entries(entities)) {
    if (!(map instanceof Map)) continue;
    for (const [id, ent] of map) {
      const c = classifyEntity(id, ent.kind, sourceIndex, report, roadIds);
      ent.origin = c.origin;
      ent.originRule = c.originRule;
      ent.sourcePointer = c.sourcePointer || ent.sourcePointer;
      ent.parentId = c.parentId;
      if (c.split) { ent.attrs.split = true; ent.attrs.splitDepth = c.splitDepth; }
      // district from source pointer refinement
      if (ent.kind === 'district' && sourceIndex.has(id)) {
        const s = sourceIndex.get(id);
        ent.origin = 'authored';
        ent.originRule = `source:${s.pointer}`;
        ent.sourcePointer = s.pointer;
      }
      byOrigin[ent.origin] = (byOrigin[ent.origin] || 0) + 1;
    }
  }
  return byOrigin;
}

// ---------- districts ----------

function bboxFromPoints(points) {
  const b = bboxInit();
  for (const p of points) bboxAdd(b, p.x, 0, p.z ?? p.y ?? 0);
  return bboxValid(b) ? b : null;
}

function centroid(points) {
  if (!points.length) return { x: 0, z: 0 };
  let x = 0, z = 0;
  for (const p of points) { x += p.x; z += (p.z ?? p.y ?? 0); }
  return { x: x / points.length, z: z / points.length };
}

export function normalizeDistrictGeometry(district) {
  const g = district.geometry || district;
  if (g.rect) {
    const r = g.rect;
    const points = [
      { x: r.minX, z: r.minZ }, { x: r.maxX, z: r.minZ },
      { x: r.maxX, z: r.maxZ }, { x: r.minX, z: r.maxZ },
    ];
    return { type: 'rect', points, bbox: { minX: r.minX, maxX: r.maxX, minY: 0, maxY: 0, minZ: r.minZ, maxZ: r.maxZ }, inferred: false };
  }
  const poly = g.polygon || g.points || g.vertices;
  if (Array.isArray(poly) && poly.length >= 3) {
    const points = poly.map(p => ({ x: p.x, z: p.z ?? p.y ?? 0 }));
    const b = bboxFromPoints(points) || { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 };
    return { type: 'polygon', points, bbox: b, inferred: false };
  }
  if (g.mask) return { type: 'unsupported', points: [], bbox: null, inferred: false, reason: 'mask-not-supported' };
  return { type: 'none', points: [], bbox: null, inferred: false, reason: 'geometry-not-persisted' };
}

export function districtsFromReport(report, buildingEntities) {
  const out = new Map();
  if (!report?.districts) return out;
  for (const d of report.districts) {
    const id = String(d.id);
    // try hull from buildings b_<districtId>_*
    let geom = { type: 'none', points: [], bbox: null, inferred: false, reason: 'geometry-not-persisted' };
    const prefix = `b_${id}_`;
    const pts = [];
    if (buildingEntities) {
      for (const [bid, b] of buildingEntities) {
        if (!bid.startsWith(prefix)) continue;
        if (Array.isArray(b.attrs?.footprint)) pts.push(...b.attrs.footprint);
        else if (b.attrs?.bounds) {
          const r = b.attrs.bounds;
          pts.push({ x: r.minX, z: r.minZ }, { x: r.maxX, z: r.minZ }, { x: r.maxX, z: r.maxZ }, { x: r.minX, z: r.maxZ });
        } else if (b.bbox) {
          pts.push({ x: b.bbox.minX, z: b.bbox.minZ }, { x: b.bbox.maxX, z: b.bbox.minZ }, { x: b.bbox.maxX, z: b.bbox.maxZ }, { x: b.bbox.minX, z: b.bbox.maxZ });
        }
      }
    }
    if (pts.length >= 3) {
      const b = bboxFromPoints(pts);
      if (b) {
        const rectPts = [{ x: b.minX, z: b.minZ }, { x: b.maxX, z: b.minZ }, { x: b.maxX, z: b.maxZ }, { x: b.minX, z: b.maxZ }];
        geom = { type: 'hull', points: rectPts, bbox: b, inferred: true, reason: 'inferred-from-buildings' };
      }
    }
    const ent = {
      id, kind: 'district', origin: 'generated', status: 'present',
      originRule: 'report:district', parentId: null, nestedFrom: null,
      sourcePointer: null, chunkIds: [], ownerChunk: null, instances: 1,
      geometry: geom,
      attrs: { ...d, reportOnly: true },
      bbox: geom.bbox || { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
      labelPriority: 90,
    };
    out.set(id, ent);
  }
  return out;
}

export function districtsFromSource(source) {
  const out = new Map();
  for (const d of source?.generator?.districts || []) {
    const id = String(d.id);
    const geom = normalizeDistrictGeometry(d);
    out.set(id, {
      id, kind: 'district', origin: 'authored', status: 'present',
      originRule: 'source:/generator/districts', parentId: null, nestedFrom: null,
      sourcePointer: null, chunkIds: [], ownerChunk: null, instances: 1,
      geometry: geom,
      attrs: { ...d },
      bbox: geom.bbox || { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
      labelPriority: 90,
    });
  }
  return out;
}

// ---------- diagnostics ----------

export function normalizeDiagnostics(report) {
  const list = [];
  const byEntity = new Map();
  const counts = { warn: 0, info: 0, error: 0, byCode: {} };
  const refKeys = ['id', 'to', 'target', 'anchor', 'node', 'from'];
  const add = (item, index, group) => {
    const code = item.code || item.type || 'unknown';
    const severity = item.severity || (group === 'repairs' ? 'info' : 'info');
    counts[severity] = (counts[severity] || 0) + 1;
    counts.byCode[code] = (counts.byCode[code] || 0) + 1;
    const refs = new Set();
    for (const k of refKeys) if (item[k] != null) refs.add(String(item[k]));
    if (Array.isArray(item.segments)) for (const s of item.segments) refs.add(String(s));
    const norm = { index, group, code, severity, stage: item.stage || null, message: item.message || '', refs: [...refs], raw: item };
    list.push(norm);
    for (const r of refs) {
      if (!byEntity.has(r)) byEntity.set(r, []);
      byEntity.get(r).push(norm);
    }
  };
  (report?.repairs || []).forEach((x, i) => add(x, i, 'repair'));
  (report?.diagnostics || []).forEach((x, i) => add(x, i, 'diagnostic'));
  return { list, byEntity, counts };
}

// ---------- compare / matching ----------

export function buildCompare(sourceIndex, compiledEntities) {
  const missing = [];
  const compiledIds = new Set();
  for (const map of Object.values(compiledEntities)) {
    if (!(map instanceof Map)) continue;
    for (const id of map.keys()) compiledIds.add(id);
  }
  // source road segments represented by exact, split, or pad mapping
  for (const [id, info] of sourceIndex) {
    if (info.kind === 'road-segment') {
      if (compiledIds.has(id)) continue;
      // represented by splits?
      let represented = false;
      for (const cid of compiledIds) {
        const { base } = stripSplitSuffix(cid);
        if (base === id && cid !== id) { represented = true; break; }
      }
      if (!represented) missing.push({ id, kind: 'road', sourcePointer: info.pointer });
    } else if (info.kind === 'building') {
      if (!compiledIds.has(id)) missing.push({ id, kind: 'building', sourcePointer: info.pointer });
    } else if (info.kind === 'district') {
      // districts compared separately
    }
  }
  return { missing };
}

// ---------- anchors / meta ----------

function worldBoundsFromSource(source) {
  const b = source?.cityforge?.world?.bounds;
  if (b && Array.isArray(b.min) && Array.isArray(b.max)) {
    return { minX: b.min[0], minY: b.min[1], minZ: b.min[2], maxX: b.max[0], maxY: b.max[1], maxZ: b.max[2] };
  }
  return null;
}

export function buildModel({ level, mode, source, compiledIndex, decodedCells, report }) {
  const t0 = nowMs();
  const sourceIndex = buildSourceIndex(source);
  const groundY = isNum(source?.ground?.y) ? source.ground.y : 0;
  const plateSize = isNum(source?.ground?.size) ? source.ground.size : (compiledIndex?.bounds ? Math.max(compiledIndex.bounds.maxX - compiledIndex.bounds.minX, compiledIndex.bounds.maxZ - compiledIndex.bounds.minZ) : 0);
  const half = plateSize / 2;
  const bounds = worldBoundsFromSource(source) || compiledIndex?.bounds || { minX: -half, minY: groundY, minZ: -half, maxX: half, maxY: groundY, maxZ: half };
  const plate = { size: plateSize, minX: -half, maxX: half, minZ: -half, maxZ: half, groundY };

  const hasCatalog = !!(compiledIndex && decodedCells);
  const { entities, stats, chunkInfo } = hasCatalog ? collectCompiled(decodedCells) : { entities: { roads: new Map(), buildings: new Map(), props: new Map(), lights: new Map(), channels: new Map(), tunnels: new Map() }, stats: { unique: {}, instances: {}, duplicates: 0, failedChunks: 0 }, chunkInfo: new Map() };

  // districts: merge source + report (source geometry wins, report adds summary/auto)
  const srcDistricts = districtsFromSource(source);
  const repDistricts = districtsFromReport(report, entities.buildings);
  const districts = new Map(srcDistricts);
  for (const [id, d] of repDistricts) {
    if (districts.has(id)) {
      const s = districts.get(id);
      s.attrs = { ...d.attrs, ...s.attrs };
      // keep authored geometry if present
    } else {
      districts.set(id, d);
    }
  }
  entities.districts = districts;

  // chunk entities
  const chunks = new Map();
  if (compiledIndex?.cells) {
    for (const c of compiledIndex.cells) {
      const id = String(c.id);
      const r = c.rect;
      chunks.set(id, {
        id, kind: 'chunk', origin: 'derived', status: chunkInfo.get(id)?.failed ? 'failed' : 'present',
        originRule: 'index:cell', parentId: null, nestedFrom: null, sourcePointer: null,
        chunkIds: [id], ownerChunk: id, instances: 1,
        geometry: { type: 'rect', rect: r },
        attrs: { file: c.file, objects: c.objects || {}, ...(chunkInfo.get(id) || {}) },
        bbox: { minX: r.minX, maxX: r.maxX, minY: groundY, maxY: groundY, minZ: r.minZ, maxZ: r.maxZ },
        labelPriority: 30,
      });
    }
  }
  entities.chunks = chunks;

  // anchors
  const anchors = new Map();
  if (source?.gameplay?.spawn) {
    const p = source.gameplay.spawn;
    anchors.set('spawn', { id: 'spawn', kind: 'anchor', origin: 'authored', status: 'present', originRule: 'source:/gameplay/spawn', parentId: null, nestedFrom: null, sourcePointer: '/gameplay/spawn', chunkIds: [], ownerChunk: null, instances: 1, geometry: { type: 'point', x: p.x, y: groundY, z: p.z }, attrs: { ...p }, bbox: pointBbox(p.x, groundY, p.z, 3), labelPriority: 100 });
  }
  if (source?.gameplay?.exit) {
    const p = source.gameplay.exit;
    anchors.set('exit', { id: 'exit', kind: 'anchor', origin: 'authored', status: 'present', originRule: 'source:/gameplay/exit', parentId: null, nestedFrom: null, sourcePointer: '/gameplay/exit', chunkIds: [], ownerChunk: null, instances: 1, geometry: { type: 'point', x: p.x, y: groundY, z: p.z }, attrs: { ...p }, bbox: pointBbox(p.x, groundY, p.z, 3), labelPriority: 100 });
  }
  entities.anchors = anchors;

  // source-only nodes/district placeholders not needed as entities except districts done
  entities.nodes = entities.nodes || new Map();
  entities.cars = entities.cars || new Map();

  const byOrigin = hasCatalog ? applyProvenance(entities, sourceIndex, report) : {};
  // districts in authored source may be overridden in applyProvenance? ensure authored ones
  for (const [id, d] of srcDistricts) {
    if (entities.districts.has(id)) {
      const e = entities.districts.get(id);
      e.origin = 'authored';
      e.originRule = `source:${sourceIndex.get(id)?.pointer || '/generator/districts'}`;
      e.sourcePointer = sourceIndex.get(id)?.pointer || e.sourcePointer;
    }
  }

  // re-count origins after district fix
  const byOriginFinal = { authored: 0, generated: 0, derived: 0, unknown: 0 };
  for (const map of Object.values(entities)) {
    if (!(map instanceof Map)) continue;
    for (const e of map.values()) if (e.origin) byOriginFinal[e.origin] = (byOriginFinal[e.origin] || 0) + 1;
  }

  const diagnostics = normalizeDiagnostics(report);
  const compare = (mode === 'compare' && hasCatalog) ? buildCompare(sourceIndex, entities) : { missing: [] };
  if (mode === 'compare') {
    // mark missing as ghost entities in separate list? keep in meta/compare and let UI/render read
  }

  const warnings = [];
  const declaredUp = source?.cityforge?.world?.coordinateSystem?.up || null;
  const mismatch = declaredUp === 'Z';
  if (mismatch) warnings.push({ code: 'coord-up-z', message: 'Источник объявляет coordinateSystem.up="Z", данные читаются как Y-up.' });
  if (mode !== 'source' && !report && source?.schemaVersion >= 4) warnings.push({ code: 'report-missing', message: 'generation-report.json не найден.' });
  if (!report && (source?.schemaVersion == null || source?.schemaVersion < 4) && mode !== 'source') warnings.push({ code: 'v3-no-report', message: 'v3: отчёт/районы не предусмотрены.' });
  if (mode === 'source' && source?.schemaVersion >= 4) {
    const srcRoads = (source?.cityforge?.networks?.roads?.segments || []).length;
    const srcBuildings = (source?.buildings || []).length;
    const srcProps = (source?.props || []).length;
    if (srcRoads === 0 && srcBuildings === 0 && srcProps === 0) {
      warnings.push({ code: 'source-generated-empty', message: 'Source-режим: геометрия главы генерируется citygen и хранится в compiled-каталоге. Переключитесь в compiled, чтобы увидеть дороги/дома/пропы.' });
    }
  }
  if (report?.districts?.length && [...(entities.districts?.values() || [])].some(d => d.geometry?.type === 'none' || d.geometry?.inferred)) {
    warnings.push({ code: 'district-geometry-missing', message: 'Часть районов без сохранённой геометрии (показаны как список/ inferred hull).' });
  }

  const skeleton = compiledIndex?.skeleton || { nodes: [], edges: [] };
  const statsOut = {
    ...stats,
    byOrigin: byOriginFinal,
    byKind: {},
    decodeMs: 0,
    buildMs: Math.round((nowMs() - t0) * 10) / 10,
  };
  for (const [k, m] of Object.entries(entities)) if (m instanceof Map) statsOut.byKind[k] = m.size;

  return {
    meta: {
      level,
      mode,
      plate,
      bounds,
      spawn: source?.gameplay?.spawn || null,
      exit: source?.gameplay?.exit || null,
      coordinate: { engine: 'Y-up', declared: declaredUp, mismatch },
      report: report ? { present: true, version: report.version, seed: report.generator?.seed, stages: report.stages, summary: report.summary } : null,
      relief: compiledIndex?.relief || null,
      gameplay: source?.gameplay || null,
      warnings,
      files: [],
      phases: {},
    },
    entities,
    skeleton,
    diagnostics,
    sourceIndex,
    compare,
    stats: statsOut,
  };
}

function nowMs() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

// ---------- label planning (pure helpers) ----------

/**
 * План меток для набора кандидатов.
 * @param {Array<{id:string, text:string, priority:number, areaPx:number, screenX:number, screenY:number, selected?:boolean, eligible?:boolean}>} candidates
 * @param {{budget:number, widthOf:(t:string)=>number, height?:number, pad?:number, occupied?:Array<{x:number,y:number,w:number,h:number}>, safeArea?:{minX:number,minY:number,maxX:number,maxY:number}}} opts
 */
export function planLabels(candidates, opts) {
  const budget = opts.budget ?? 60;
  const h = opts.height ?? 16;
  const pad = opts.pad ?? 4;
  const occupied = (opts.occupied || []).map(r => ({ ...r }));
  const safe = opts.safeArea || null;
  const out = [];
  const items = candidates
    .filter(c => c && c.eligible !== false)
    .sort((a, b) => (b.priority - a.priority) || ((b.areaPx || 0) - (a.areaPx || 0)) || String(a.id).localeCompare(String(b.id)));
  for (const c of items) {
    if (!c.selected && out.length >= budget) continue;
    const w = (opts.widthOf ? opts.widthOf(c.text) : c.text.length * 7) + 8;
    let x = c.screenX + 8;
    let y = c.screenY - 14;
    if (safe) {
      if (x < safe.minX) x = safe.minX;
      if (y < safe.minY) y = safe.minY;
      // if anchor inside panel area -> skip unless selected
      if (!c.selected && (c.screenX < safe.minX || c.screenX > safe.maxX || c.screenY < safe.minY || c.screenY > safe.maxY)) continue;
      if (x + w > safe.maxX) x = Math.max(safe.minX, safe.maxX - w);
      if (y + h > safe.maxY) y = Math.max(safe.minY, safe.maxY - h);
    }
    const rect = { x: x - pad, y: y - pad, w: w + pad * 2, h: h + pad * 2 };
    let hit = false;
    for (const o of occupied) {
      if (rect.x < o.x + o.w && rect.x + rect.w > o.x && rect.y < o.y + o.h && rect.y + rect.h > o.y) { hit = true; break; }
    }
    if (hit && !c.selected) continue;
    if (hit && c.selected) {
      // selected wins: remove conflicting non-selected? easier allow but still try offset
      x = c.screenX + 8; y = c.screenY - 14;
    }
    occupied.push(rect);
    out.push({ ...c, x, y, w, h });
  }
  return out;
}
