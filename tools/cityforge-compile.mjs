/**
 * Компилятор CityForge v3 (`kind: 'cityforge'`, docs/world-format.md) в бриф
 * движка (`kind: 'open'` / json2), который умеют `normalizeLevel` → `splitLevel`
 * → `generateCatalog`. «Сделать играбельным» = прогнать через обычный пайплайн,
 * а не писать второй движок.
 *
 * Поддерживается подмножество, достаточное для главы со стримингом, горами,
 * серпантиной и туннелем (level-03): плита, цель A→B, чанки, рельеф-модификаторы
 * `mountain`/`valley` (→ аналитические холмы v2 через `relief.hills`), авторские
 * дороги из `cityforge.networks.roads` (цепочки сегментов сети → оси полотен с
 * подъёмом) и прямые туннели (`cityforge.structures.tunnels` → порталы и коридор).
 * Неподдержанное содержимое — явная ошибка, чтобы формат не «компилировался» с
 * потерей данных.
 */

import { CONFIG } from '../src/config.js';
import { reliefOf } from '../src/relief.js';

const J = CONFIG.jsonMap;

function pointSegDistXZ(px, pz, ax, az, bx, bz) {
  const abx = bx - ax, abz = bz - az, apx = px - ax, apz = pz - az;
  const ab2 = abx * abx + abz * abz;
  const t = ab2 > 1e-9 ? Math.max(0, Math.min(1, (apx * abx + apz * abz) / ab2)) : 0;
  return Math.hypot(px - (ax + abx * t), pz - (az + abz * t));
}

function riverDistXZ(x, z, rivers = []) {
  let best = Infinity, river = null;
  for (const rv of rivers) {
    const pts = rv?.points ?? rv?.path ?? [];
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], b = pts[i + 1];
      const ax = Array.isArray(a) ? a[0] : a.x, az = Array.isArray(a) ? a[2] ?? a.z : a.z;
      const bx = Array.isArray(b) ? b[0] : b.x, bz = Array.isArray(b) ? b[2] ?? b.z : b.z;
      const d = pointSegDistXZ(x, z, ax, az, bx, bz);
      if (d < best) { best = d; river = rv; }
    }
  }
  return { d: best, river };
}

function roadCrossesRiverWithoutBridge(road, waterways, groundY) {
  const pts = road?.points;
  if (!Array.isArray(pts) || pts.length < 2 || !waterways?.length) return null;
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1];
    const len = Math.hypot((b.x - a.x), (b.z - a.z));
    const steps = Math.max(2, Math.ceil(len / 4));
    for (const w of waterways) {
      let crossed = false;
      const half = (Number(w.width) || 10) * 0.5;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;
        const z = a.z + (b.z - a.z) * t;
        const d = pointSegDistXZ(x, z, 0, 0, 0, 0); // placeholder
        void d;
      }
    }
  }
  // simpler: sample and check
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1];
    const len = Math.hypot(b.x - a.x, b.z - a.z);
    const steps = Math.max(2, Math.ceil(len / 4));
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      const z = a.z + (b.z - a.z) * t;
      const near = riverDistXZ(x, z, waterways);
      if (!near.river) continue;
      const half = (Number(near.river.width) || 10) * 0.5;
      if (near.d <= half + 0.5 && y < groundY + J.bridgeMinHeight) return near.river.id ?? 'river';
    }
  }
  return null;
}

const SUPPORTED_EMPTY = (arr, name, errors) => {
  const hasContent = (v) => {
    if (v == null) return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v !== 'object') return true;
    return Object.values(v).some(hasContent);
  };
  if (hasContent(arr)) errors.push(`${name}: компилятор движка пока не умеет непустые '${name}' (${Array.isArray(arr) ? arr.length : Object.keys(arr ?? {}).length} шт.) — глава не может быть собрана без потерь`);
};
const SUPPORTED_NONE = (val, name, errors) => {
  const hasContent = (v) => {
    if (v == null) return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v !== 'object') return true;
    return Object.values(v).some(hasContent);
  };
  if (hasContent(val)) errors.push(`${name}: компилятор движка пока не поддерживает '${name}'`);
};

/**
 * CityForge terrain-модификаторы (`mountain`/`valley`) → холмы v2: одна капсула в
 * плане (центр + радиус + высота; `bx/bz` ставятся равными центру — это круговая
 * гора) с подъёмом, знаком зависящим от операции. В engine-брид попадает только
 * поле `relief` — парсер нормализует его в аналитическое поле и считает опоры.
 * Позиции в CityForge — плоские массивы `[x, z]` (point2) и `[x, y, z]` (point3).
 */
function compileHills(cf, errors) {
  const hills = [];
  const modifiers = cf?.terrain?.modifiers;
  if (!modifiers) return hills;
  modifiers.forEach((m, i) => {
    const label = `cityforge.terrain.modifiers[${i}] (${m.id ?? '?'})`;
    if (m.type !== 'mountain' && m.type !== 'valley') {
      errors.push(`${label}: тип '${m.type ?? '?'}' не поддерживается компилятором — только mountain/valley (гора = положительная высота, долина = отрицательная)`);
      return;
    }
    const c = Array.isArray(m.center) ? m.center : [m.center?.x ?? 0, m.center?.z ?? 0];
    // Ridge/capsule: path with 2 points gives the spine ends (bx,bz); else point hill
    const path = Array.isArray(m.path) && m.path.length >= 2 ? m.path : null;
    const bx = path ? (Array.isArray(path[path.length - 1]) ? path[path.length - 1][0] : c[0]) : c[0];
    const bz = path ? (Array.isArray(path[path.length - 1]) ? path[path.length - 1][1] : c[1]) : c[1];
    const ax = path ? (Array.isArray(path[0]) ? path[0][0] : c[0]) : c[0];
    const az = path ? (Array.isArray(path[0]) ? path[0][1] : c[1]) : c[1];
    hills.push({
      id: m.id ?? `hill_${i}`,
      x: ax, z: az, bx, bz,
      radius: m.radius, height: m.operation === 'subtract' ? -m.height : m.height,
    });
  });
  return hills;
}

/**
 * CityForge hydrology.rivers → engine waterways. Ось русла — ломаная {x,z} в
 * плане: двигательная геометрия (нормализатор/surfaces) принимает произвольное
 * направление сегмента, поэтому кривая река передаётся как есть (гладкая
 * полилиния), без манхэттен-разложения. CF-река несёт path (point3 [x,y,z]),
 * width, depth.
 */
function compileHydrology(cf, groundY, warnings) {
  const rivers = cf?.hydrology?.rivers ?? [];
  if (!rivers.length) return [];
  const out = [];
  const AX = 1e-6;
  for (const r of rivers) {
    const rawPts = (r.path ?? []).map(p => Array.isArray(p) ? { x: p[0], z: p[2] } : { x: p.x ?? 0, z: p.z ?? 0 });
    const clean = [];
    for (const p of rawPts) {
      const q = { x: +p.x.toFixed(3), z: +p.z.toFixed(3) };
      const n = clean.length;
      if (!n || Math.abs(clean[n - 1].x - q.x) > AX || Math.abs(clean[n - 1].z - q.z) > AX) clean.push(q);
    }
    if (clean.length < 2) continue;
    const depth = r.depth ?? 3;
    const bedY = +(groundY - depth).toFixed(3);
    const surfaceY = +(groundY - 0.2).toFixed(3);
    out.push({
      id: r.id ?? 'river',
      width: r.width ?? 12,
      bedY,
      surfaceY,
      bank: r.bank ?? 'quay',
      wade: false,
      points: clean,
    });
  }
  if (cf?.hydrology?.lakes?.length) warnings.push('cityforge.hydrology.lakes: озёра компилятор пока пропускает (река собрана)');
  return out;
}

/**
 * Сегменты сети дорог CityForge → оси полотен v2. Каждый сегмент сети — отдельная
 * дорога: классификация (bridge/ground) и валидация зазоров тогда считаются по
 * реальному профилю сегмента. Навигация и опоры соединяются по общей геометрии,
 * поэтому разрыв на объекты не создаёт разрыва проходимости.
 *
 * Сегмент с полем `elements` (v2 arc/plate) отдаётся как дорога с `elements`
 * напрямую — так можно описать плавные повороты (как в главе 13) в CityForge-
 * источнике; нормализатор развернёт элементы в настилы. Тип определяется по
 * верхней отметке элементов.
 */
function compileRoads(cf, groundY, terrainHeightAt = null) {
  const roads = [];
  const segments = cf?.networks?.roads?.segments ?? [];
  const roadType = (id, top, points, elements) => {
    const base = (top - groundY > J.bridgeMinHeight) ? 'bridge' : 'ground';
    // Terrain-following roads on hills should remain "ground" so relief roadCorridors/pre-leveling apply.
    if (terrainHeightAt) {
      let minClear = Infinity, maxClear = -Infinity;
      if (Array.isArray(points) && points.length >= 2) {
        for (const p of points) {
          const ty = terrainHeightAt(p.x, p.z);
          if (!Number.isFinite(ty)) continue;
          const c = p.y - ty;
          minClear = Math.min(minClear, c);
          maxClear = Math.max(maxClear, c);
        }
      } else if (Array.isArray(elements) && elements.length > 0) {
        const deg2rad = (d) => d * Math.PI / 180;
        for (const el of elements) {
          if (el.arc) {
            const a = el.arc;
            const y0 = Number(a.y?.[0] ?? 0), y1 = Number(a.y?.[1] ?? y0);
            const from = Number(a.from ?? 0), to = Number(a.to ?? 0), span = to - from;
            const steps = 6;
            for (let i = 0; i <= steps; i++) {
              const t = i / steps;
              const ang = from + span * t;
              const x = a.cx + Math.cos(deg2rad(ang)) * a.radius;
              const z = a.cz + Math.sin(deg2rad(ang)) * a.radius;
              const y = y0 + (y1 - y0) * t;
              const ty = terrainHeightAt(x, z);
              if (!Number.isFinite(ty)) continue;
              const c = y - ty;
              minClear = Math.min(minClear, c);
              maxClear = Math.max(maxClear, c);
            }
          } else if (el.plate) {
            // best-effort: sample plate endpoints by y/rise if center not explicit
            const p = el.plate;
            const py = Number(p.y ?? 0);
            const pts = [[p.x ?? p.cx ?? 0, p.z ?? p.cz ?? 0, py], [p.x ?? p.cx ?? 0, p.z ?? p.cz ?? 0, py + Number(p.rise ?? 0)]];
            for (const [x, z, y] of pts) {
              const ty = terrainHeightAt(x, z);
              if (!Number.isFinite(ty)) continue;
              const c = y - ty;
              minClear = Math.min(minClear, c);
              maxClear = Math.max(maxClear, c);
            }
          }
        }
      }
      if (Number.isFinite(minClear) || Number.isFinite(maxClear)) {
        // Clearly elevated above local terrain along its whole span => bridge/overpass.
        if (Number.isFinite(minClear) && minClear >= J.bridgeMinHeight) return 'bridge';
        // Road follows terrain surface (possibly on hills) => ground, even if high above base groundY.
        // Only correct base misclassification (road sits on terrain, not in a cut/tunnel below it).
        if (base === 'bridge' && Number.isFinite(maxClear) && maxClear <= 0.9 && Number.isFinite(minClear) && minClear >= -0.6) return 'ground';
        // Mixed/ambiguous: keep base classification.
        return base;
      }
    }
    return base;
  };
  for (const s of segments) {
    if (Array.isArray(s.elements) && s.elements.length > 0) {
      let top = -Infinity;
      for (const el of s.elements) {
        if (el.arc) top = Math.max(top, ...(el.arc.y ?? [0]));
        if (el.plate) top = Math.max(top, el.plate.y ?? 0, (el.plate.y ?? 0) + (el.plate.rise ?? 0));
      }
      roads.push({
        id: s.id,
        type: roadType(s.id, top, null, s.elements),
        width: s.lanes?.[0]?.width ?? 8,
        elements: s.elements,
      });
      continue;
    }
    const points = [];
    for (const p of s.path ?? []) {
      const last = points[points.length - 1];
      if (!last || Math.abs(last.x - p[0]) > 1e-9 || Math.abs(last.y - p[1]) > 1e-9 || Math.abs(last.z - p[2]) > 1e-9) {
        points.push({ x: p[0], y: p[1], z: p[2] });
      }
    }
    if (points.length < 2) continue;
    const top = Math.max(...points.map(p => p.y));
    const roadOut = {
      id: s.id,
      type: roadType(s.id, top, points, null),
      width: s.lanes?.[0]?.width ?? 8,
      points,
    };
    const fr = s.filletRadius ?? s.fillet;
    if (Number.isFinite(Number(fr)) && Number(fr) > 0.01) roadOut.filletRadius = Number(fr);
    roads.push(roadOut);
  }
  return roads;
}

/**
 * CityForge структуры → прямые туннели v2: порталы коридора (точки на отметке
 * пола) и параметры коридора. Туннель — прямой коридор: пол внутри — обычный
 * настил, стены/потолок — призмы/солиды (правило «твёрдость обязана совпадать с
 * картинкой»). Порталы — плоские точки `[x, y, z]` (point3) в CityForge.
 */
function compileTunnels(cf, roads, errors) {
  const tunnels = [];
  const structures = cf?.structures;
  const list = structures?.tunnels ?? structures;
  if (!Array.isArray(list)) return tunnels;
  list.forEach((t, i) => {
    const label = `cityforge.structures.tunnels[${i}] (${t.id ?? '?'})`;
    if (t.type !== 'tunnel') {
      errors.push(`${label}: тип '${t.type ?? '?'}' не поддерживается — только tunnel`);
      return;
    }
    const portals = t.portals ?? [];
    if (portals.length < 2) {
      errors.push(`${label}: порталов меньше двух — туннеля нет`);
      return;
    }
    const points = portals.slice(0, 2).map(p => {
      const q = Array.isArray(p.position) ? p.position : [p.position?.x ?? 0, p.position?.y ?? 0, p.position?.z ?? 0];
      return { x: q[0], y: q[1], z: q[2] };
    });
    const road = roads.find(r => (t.roadRefs ?? []).includes(r.id));
    tunnels.push({
      id: t.id,
      points,
      width: road?.width ?? J.deckThickness * 10,
      height: J.tunnelHeight,
      lamps: !!t.parameters?.lighting,
    });
  });
  return tunnels;
}

/**
 * @param {object} raw бриф CityForge v3
 * @returns {{ engine: object, warnings: string[] }}
 */
export function compileCityforge(raw) {
  const errors = [];
  const warnings = [];
  const cf = raw.cityforge ?? {};
  SUPPORTED_EMPTY(raw.instances ?? cf.instances, 'instances', errors);
  SUPPORTED_EMPTY(cf.districts, 'cityforge.districts', errors);
  SUPPORTED_EMPTY(cf.blocks, 'cityforge.blocks', errors);
  SUPPORTED_EMPTY(cf.parcels, 'cityforge.parcels', errors);
  SUPPORTED_EMPTY(cf.caves?.systems ?? cf.caves, 'cityforge.caves', errors);
  SUPPORTED_NONE(cf.networks?.railways, 'cityforge.networks.railways', errors);
  SUPPORTED_NONE(cf.networks?.paths, 'cityforge.networks.paths', errors);
  // формальные CF-мосты (decks/spans) компилятор не разворачивает; мосты главы
  // задаются как приподнятые сегменты roads (type bridge по высоте) с плавными
  // стыками — их compileRoads обрабатывает. Непустые структуры пропускаем с
  // предупреждением, чтобы не терять молча, но не роняем сборку.
  if ((cf.structures?.bridges ?? []).length) warnings.push('cityforge.structures.bridges: формальные мосты не разворачиваются компилятором — используйте приподнятые road-сегменты (type/высота bridge)');
  const hills = compileHills(cf, errors);
  const groundY = raw.ground?.y ?? 0;
  let terrainHeightAt = null;
  if (hills.length) {
    try {
      const relief = reliefOf({ baseY: groundY, hills, pads: [], rivers: [], roadCorridors: [] });
      terrainHeightAt = (x, z) => relief.heightAt(x, z);
    } catch { /* keep null */ }
  }
  const roads = compileRoads(cf, groundY, terrainHeightAt);
  const waterways = compileHydrology(cf, groundY, warnings);
  const tunnels = compileTunnels(cf, roads, errors);
  for (const r of roads) {
    const riverId = roadCrossesRiverWithoutBridge(r, waterways, groundY);
    if (riverId) errors.push(`cityforge.networks.roads.segments (${r.id}): дорога пересекает реку '${riverId}' без моста (поднимите путь над руслом)`);
  }
  if (errors.length) {
    const e = new Error(errors.join('\n'));
    e.name = 'CityforgeCompileError';
    e.errors = errors;
    throw e;
  }

  const ground = raw.ground ?? {};
  const gp = raw.gameplay ?? {};
  const stream = raw.stream;
  if (!stream) throw Object.assign(new Error('stream: для открытого мира CityForge нужен stream (chunk/keep/ahead/budget)'), { name: 'CityforgeCompileError', errors: ['нет stream'] });

  const sx = gp.spawn?.x ?? 0, sz = gp.spawn?.z ?? 0;
  const ex = gp.exit?.x ?? 0, ez = gp.exit?.z ?? 0;
  const gy = ground.y ?? 0;
  // отметка площадки: если рядом есть портал/точка дороги (спавн в тоннеле/на
  // настиле), берём её y (ближайшая точка в радиусе привязки), иначе площадка
  // оказалась бы на ground.y и оторвалась от сети по высоте (ломает скелет/навигацию)
  const anchored = (x, z) => {
    let best = null, bestD = Infinity;
    for (const t of (tunnels ?? [])) for (const p of (t.points ?? [])) {
      const d = Math.hypot(p.x - x, p.z - z);
      if (d < 12 && d < bestD) { bestD = d; best = p.y; }
    }
    for (const r of roads) for (const p of (r.points ?? [])) {
      const d = Math.hypot(p.x - x, p.z - z);
      if (d < 12 && d < bestD) { bestD = d; best = p.y; }
    }
    return best;
  };
  const padY = (x, z, fallback) => anchored(x, z) ?? fallback;
  /**
   * Площадка не ставится на берегу реки.
   *
   * Настил площадки — плоскость, поперёк своей оси он не наклоняется, а берег
   * реки поднимается от русла с уклоном порядка 0,2 м/м. Плита 6 × 6 м на таком
   * склоне расходится с грунтом на ±0,6 м: один её край уходит в землю, другой
   * висит над ней. Замер главы 10 до правки: 1,9 м грунта над асфальтом с
   * нагорной стороны; после разворота площадки вдоль нормали берега — 0,25 м
   * утопания и 0,5 м висящей кромки. Ни одно из чисел не читается площадкой,
   * поэтому у воды её просто нет: спавн и точка B стоят на собственном поле,
   * которое там гладкое и не режется настилом.
   *
   * У площадки, привязанной к дороге или порталу, ось остаётся авторской:
   * отметку она берёт у полотна (`padY`), и связь с сетью важнее берега.
   */
  const padFits = (x, z) => {
    if (anchored(x, z) !== null) return true;
    let best = Infinity;
    for (const w of waterways) {
      const pts = w.points ?? [];
      for (let i = 0; i + 1 < pts.length; i++) {
        const a = pts[i], b = pts[i + 1];
        const dx = b.x - a.x, dz = b.z - a.z;
        const L = Math.hypot(dx, dz);
        if (L < 1e-9) continue;
        const tx = dx / L, tz = dz / L;
        const u = Math.max(0, Math.min(L, (x - a.x) * tx + (z - a.z) * tz));
        const d = Math.hypot(x - (a.x + tx * u), z - (a.z + tz * u));
        if (d < best) best = d;
      }
    }
    return best > 40;
  };
  const pad = (id, x, z, y = gy) => ({
    id, type: 'ground', width: 6,
    points: [{ x: x - 3, z, y }, { x: x + 3, z, y }],
  });
  // Площадки у порталов туннелей: подъёмные «носы» мостов обязаны приходить на
  // полотно (валидатор bridgeNoses), а у тоннеля это его портал на отметке пола.
  const tunnelPads = tunnels.flatMap((t, i) => (t.points ?? []).map((p, j) =>
    pad(`tunnel_${t.id}_p${j}`, p.x, p.z, p.y)
  ));

  const sky = raw.sky ?? {
    sky: 12575732,
    fog: { color: 14230008, near: 120, far: 900 },
    sun: { color: 16771932, intensity: 2.2, position: [-200, 260, -140] },
    hemi: { sky: 13613055, ground: 5527871, intensity: 1.0 },
  };

  const engine = {
    $schema: './level-v2.schema.json',
    kind: 'open',
    // v3: окна фасадов включены по умолчанию (программная текстура/ритм из движка).
    // Явное null/false в источнике отключает окна (perf-тюнинг); отсутствие поля = defaults.
    windows: raw.windows === undefined ? {} : raw.windows,
    ...(raw.navEdgeProbe != null ? { navEdgeProbe: +raw.navEdgeProbe } : {}),
    ...(raw.bodyProbe != null ? { bodyProbe: +raw.bodyProbe } : {}),
    metadata: {
      levelName: raw.metadata?.levelName,
      name: raw.metadata?.name,
      hint: raw.metadata?.hint,
      units: 'meters',
      notes: (raw.metadata?.notes ? raw.metadata.notes + ' ' : '') + '[скомпилировано из CityForge v3]',
    },
    ground: {
      size: ground.size,
      y: ground.y ?? 0,
      ...(ground.color != null ? { color: ground.color } : { color: 7322954 }),
    },
    stream: {
      chunk: stream.chunk,
      keep: stream.keep,
      aheadMin: stream.aheadMin,
      aheadMax: stream.aheadMax,
      budgetMs: stream.budgetMs,
    },
    // Авторские дома в движковом формате (v2) пропускаются в движок; полноценная
    // компиляция instances/building-шаблонов — отдельный шаг формата.
    buildings: Array.isArray(raw.buildings) ? raw.buildings : [],
    roads: [
      ...(padFits(sx, sz) ? [pad('spawn_pad', sx, sz, padY(sx, sz, gy))] : []),
      ...(padFits(ex, ez) ? [pad('exit_pad', ex, ez, padY(ex, ez, gy))] : []),
      ...tunnelPads, ...roads,
    ],
    ...(waterways.length ? { waterways } : {}),
    tunnels,
    lights: Array.isArray(raw.lights) ? raw.lights : [],
    ...(Array.isArray(raw.landscapeObjects) && raw.landscapeObjects.length ? { landscapeObjects: raw.landscapeObjects } : {}),
    gameplay: {
      goal: gp.goal ?? 'exit',
      spawn: { x: sx, z: sz },
      exit: { x: ex, z: ez },
      ...(gp.exitRadius != null ? { exitRadius: gp.exitRadius } : {}),
      enemies: { count: gp.enemies?.count ?? 0 },
      alienEnemies: { count: gp.alienEnemies?.count ?? 0 },
      ...(gp.cars ? { cars: gp.cars } : {}),
    },
    sky,
  };
  if (hills.length) {
    const maxH = Math.max(...hills.map((h) => Math.abs(h.height)));
    const minR = Math.min(...hills.map((h) => h.radius));
    // запас над аналитическим максимумом производной капсулы (1.5*H/R) и над
    // крутизной суммарного поля: «большая гора» может быть круче дефолтов.
    const hillMaxSlope = Math.max(J.relief.hillMaxSlope, Math.ceil((1.5 * maxH / Math.max(minR, 1)) * 100) / 100);
    const maxSlope = Math.max(J.relief.maxSlope, hillMaxSlope);
    // Небольшое поперечное выравнивание под наземными дорогами: продольно полотно
    // следует рельефу (отметка берётся с оси природного поля), поперёк под
    // полотном склон выровнен, чтобы поперечное сечение дороги было горизонтальным.
    // Переход к склону узкий — ландшафт вокруг дороги меняется минимально.
    // Берём все наземные дороги движка (включая площадки и дуговые/element-дороги), кроме мостов.
    const sampleArcPoints = (arc) => {
      const deg2rad = (d) => d * Math.PI / 180;
      const from = Number(arc.from ?? 0), to = Number(arc.to ?? 0);
      const span = to - from;
      const y0 = Number(arc.y?.[0] ?? 0), y1 = Number(arc.y?.[1] ?? y0);
      const steps = Math.max(4, Math.ceil(Math.abs(span) / 15));
      const pts = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const ang = from + span * t;
        pts.push({
          x: arc.cx + Math.cos(deg2rad(ang)) * arc.radius,
          y: y0 + (y1 - y0) * t,
          z: arc.cz + Math.sin(deg2rad(ang)) * arc.radius,
        });
      }
      return pts;
    };
    const roadCorridors = [];
    for (const r of (roads ?? [])) {
      if (r.type !== 'ground') continue;
      if (Array.isArray(r.points) && r.points.length >= 2) {
        roadCorridors.push({
          id: r.id,
          width: r.width ?? 8,
          shoulder: 1,
          blend: 5,
          crossLevel: true,
          points: r.points.map(p => ({ x: p.x, y: p.y ?? 0, z: p.z })),
        });
        continue;
      }
      if (Array.isArray(r.elements) && r.elements.length > 0) {
        for (let ei = 0; ei < r.elements.length; ei++) {
          const el = r.elements[ei];
          if (el?.arc) {
            const pts = sampleArcPoints(el.arc);
            if (pts.length >= 2) {
              roadCorridors.push({
                id: `${r.id}${r.elements.length > 1 ? `:e${ei}` : ''}`,
                width: el.arc.width ?? r.width ?? 8,
                shoulder: 1,
                blend: 5,
                crossLevel: true,
                points: pts,
              });
            }
          }
          // plate elements could be added similarly if needed
        }
      }
    }
    engine.relief = {
      baseY: ground.y ?? 0,
      hillMaxSlope,
      maxSlope,
      hills,
      ...(roadCorridors.length ? { roadCorridors } : {}),
    };
  }
  return { engine, warnings };
}
