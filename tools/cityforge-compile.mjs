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

const J = CONFIG.jsonMap;

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
function compileRoads(cf, groundY) {
  const roads = [];
  const segments = cf?.networks?.roads?.segments ?? [];
  for (const s of segments) {
    if (Array.isArray(s.elements) && s.elements.length > 0) {
      let top = -Infinity;
      for (const el of s.elements) {
        if (el.arc) top = Math.max(top, ...(el.arc.y ?? [0]));
        if (el.plate) top = Math.max(top, el.plate.y ?? 0, (el.plate.y ?? 0) + (el.plate.rise ?? 0));
      }
      roads.push({
        id: s.id,
        type: top - groundY > J.bridgeMinHeight ? 'bridge' : 'ground',
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
    roads.push({
      id: s.id,
      type: top - groundY > J.bridgeMinHeight ? 'bridge' : 'ground',
      width: s.lanes?.[0]?.width ?? 8,
      points,
    });
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
  SUPPORTED_NONE(cf.hydrology, 'cityforge.hydrology', errors);
  SUPPORTED_NONE(cf.networks?.railways, 'cityforge.networks.railways', errors);
  SUPPORTED_NONE(cf.networks?.paths, 'cityforge.networks.paths', errors);
  // мосты пока не компилируются: в abbreviated-форме у них другой состав полотен
  // (съезды/опоры), а у туннелей состав простее — пол, стены, потолок
  SUPPORTED_NONE(cf.structures?.bridges, 'cityforge.structures.bridges', errors);
  const hills = compileHills(cf, errors);
  const roads = compileRoads(cf, raw.ground?.y ?? 0);
  const tunnels = compileTunnels(cf, roads, errors);
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
  // настиле), берём её y, иначе площадка оказалась бы на ground.y и оторвалась
  // от сети по высоте (ломает скелет/навигацию)
  const padY = (x, z, fallback) => {
    for (const t of (tunnels ?? [])) for (const p of (t.points ?? []))
      if (Math.hypot(p.x - x, p.z - z) < 12) return p.y;
    for (const r of roads) for (const p of (r.points ?? []))
      if (Math.hypot(p.x - x, p.z - z) < 12) return p.y;
    return fallback;
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
    buildings: [],
    roads: [pad('spawn_pad', sx, sz, padY(sx, sz, gy)), pad('exit_pad', ex, ez, padY(ex, ez, gy)), ...tunnelPads, ...roads],
    tunnels,
    lights: [],
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
    engine.relief = {
      baseY: ground.y ?? 0,
      hillMaxSlope,
      maxSlope,
      hills,
    };
  }
  return { engine, warnings };
}
