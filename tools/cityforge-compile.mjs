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
    hills.push({
      id: m.id ?? `hill_${i}`,
      x: c[0], z: c[1], bx: c[0], bz: c[1],
      radius: m.radius, height: m.operation === 'subtract' ? -m.height : m.height,
    });
  });
  return hills;
}

/**
 * Цепочки сегментов сети дорог CityForge → оси полотен v2. Сегменты сети
 * соединяются в цепочки по узлам (`from`/`to`), каждая цепочка — одна ось: полотно
 * с подъёмом превращается в последовательность осей, каждая пара точек — одна
 * наклонная пластина (правило проекта: одна пластина на отрезок).
 */
function compileRoads(cf, groundY) {
  const roads = [];
  const net = cf?.networks?.roads;
  const segments = net?.segments ?? [];
  if (!net) return roads;
  const byFrom = new Map();
  for (const s of segments) {
    const arr = byFrom.get(s.from) ?? [];
    arr.push(s);
    byFrom.set(s.from, arr);
  }
  const targeted = new Set(segments.map(s => s.to));
  const starts = (net.nodes ?? []).filter(n => !targeted.has(n.id)).map(n => n.id);
  const used = new Set();
  const chains = [];
  for (const st of starts) {
    const chain = [];
    let cur = st;
    for (let guard = 0; cur && guard < 4096; guard++) {
      const next = (byFrom.get(cur) ?? []).find(s => !used.has(s));
      if (!next) break;
      used.add(next);
      chain.push(next);
      cur = next.to;
    }
    if (chain.length) chains.push(chain);
  }
  for (const s of segments) {
    if (used.has(s)) continue;
    used.add(s);
    chains.push([s]);
  }
  chains.forEach((chain, ci) => {
    const points = [];
    for (const s of chain) {
      for (const p of s.path ?? []) {
        const last = points[points.length - 1];
        if (!last || Math.abs(last.x - p[0]) > 1e-9 || Math.abs(last.y - p[1]) > 1e-9 || Math.abs(last.z - p[2]) > 1e-9) {
          points.push({ x: p[0], y: p[1], z: p[2] });
        }
      }
    }
    if (points.length < 2) {
      throw Object.assign(new Error(`cityforge.networks.roads: цепочка ${ci} не имеет геометрии`), { name: 'CityforgeCompileError', errors: [`cityforge.networks.roads: цепочка ${ci} без точек пути`] });
    }
    const top = Math.max(...points.map(p => p.y));
    const first = chain[0];
    roads.push({
      id: first.id,
      type: top - groundY > J.bridgeMinHeight ? 'bridge' : 'ground',
      width: first.lanes?.[0]?.width ?? 8,
      points,
    });
  });
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
  const pad = (id, x, z) => ({ id, type: 'ground', width: 6, points: [{ x: x - 3, z, y: ground.y ?? 0 }, { x: x + 3, z, y: ground.y ?? 0 }] });

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
    roads: [pad('spawn_pad', sx, sz), pad('exit_pad', ex, ez), ...roads],
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
    engine.relief = {
      baseY: ground.y ?? 0,
      hills,
    };
  }
  return { engine, warnings };
}
