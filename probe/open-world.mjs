/**
 * Замер фаз сборки уровня по любой фикстуре — инструмент этапа 0 плана
 * открытого мира (docs/open-world-plan.md, § 2 и § 6).
 *
 * Почему в браузере, а не в Node: `src/json-map.js` импортирует three, и его
 * конструктор здесь как раз и является предметом меры. При этом бриф разворачивается
 * теми же модулями, что и пайплайн (`tools/city.js` → `tools/normalize-level.mjs`
 * они three-free), поэтому число в таблице — то же, что отдаёт
 * `node tools/build-level.mjs`, а не вторая реализация.
 *
 * Как пользоваться (страница `http://localhost:8124/3d-game.html`, консоль):
 *
 *   const P = await import('/probe/open-world.mjs');
 *   window.__r = null;
 *   P.measure({ url: '/probe/open-2km.json', repeats: 2 }).then(r => window.__r = r);
 *   // тяжёлую фикстуру не ждать в одном await — опрашивать window.__r
 *   P.text(window.__r)
 *
 * Числа снимаются оборотом фаз на `JsonMap.prototype`: холодный прогон — первый
 * `new JsonMap` в этом контексте, тёплые — последующие. Само это различие и есть
 * предмет меры: на четырёх мирах холодный и тёплый отличаются не более чем на
 * ±10 %, тогда как план до этапа 0 считал холодный завышающим в 2,7…4 раза
 * (запись — docs/open-world-plan.md, § 2.3 «повторная мера»).
 */
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { CONFIG } from '../src/config.js';

/** Фазы конструктора в том порядке, в котором их зовёт сам конструктор. */
const CTOR_PHASES = [
  '_collectBuildings', '_collectRoads', '_collectWater', '_indexPlans',
  'indexSolids', '_indexSurfaces', '_indexBlockers', '_collectAnchors', '_buildNav',
];
/** Внутренние фазы навигации: ради них и затеян весь план. */
const NAV_PHASES = [
  '_navLattice', '_navRooms', '_navRoofs', '_navStairs', '_navDecks',
  '_navWater', '_navDoors', '_pruneToSpawn',
];
const PHASES = [...CTOR_PHASES, ...NAV_PHASES, 'build'];

/**
 * Читает бриф, разворачивает кварталы и нормализует — ровно как CLI.
 * @returns {Promise<{map: object, rawBytes: number, expandedBytes: number, warnings: string[]}>}
 */
export async function fixture(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  const rawText = await res.text();
  const raw = JSON.parse(rawText);
  const expanded = expandCity(raw);
  const level = normalizeLevel(expanded);
  return {
    map: level.map,
    rawBytes: rawText.length,
    expandedBytes: JSON.stringify(level.map).length,
    warnings: level.warnings ?? [],
    // `city` разворачивается до валидатора и в нормализованный бриф не едет,
    // поэтому число районов читается из авторского JSON
    districts: (raw.city?.districts ?? []).length,
    track: raw.city?.track ? 1 : 0,
  };
}

/**
 * Собирает фикстуру `repeats + 1` раз и мерит каждую фазу отдельно.
 * Первый прогон — холодный, остальные — тёплые.
 *
 * `spec` позволяет мерить уже нормализованные данные (закоммиченный модуль
 * главы), а не только бриф: иначе развёртка генератора в этом же прогоне
 * невольно участвовала бы в цене.
 */
export async function measure({ url = '/probe/open-2km.json', repeats = 2, withBuild = true, spec: given = null } = {}) {
  const { JsonMap } = await import('../src/json-map.js');
  const THREE = await import('three');
  const fix = given ? { map: given, rawBytes: 0, expandedBytes: JSON.stringify(given).length, warnings: [], districts: 0, track: 0 }
    : await fixture(url);
  const spec = fix.map;
  const navStep = CONFIG.jsonMap.navStep;

  const runs = [];
  let acc = null;
  const orig = {};
  for (const name of PHASES) {
    const fn = JsonMap.prototype[name];
    if (typeof fn !== 'function') continue;
    orig[name] = fn;
    JsonMap.prototype[name] = function wrapped(...args) {
      const t = performance.now();
      const out = fn.apply(this, args);
      if (acc) {
        const a = (acc[name] ??= { ms: 0, calls: 0 });
        a.ms += performance.now() - t;
        a.calls++;
      }
      return out;
    };
  }

  try {
    for (let k = 0; k <= repeats; k++) {
      acc = {};
      const t0 = performance.now();
      const map = new JsonMap(spec);
      const ctor = performance.now() - t0;
      let meshes = null, buildMs = 0;
      if (withBuild) {
        const scene = new THREE.Scene();
        const t1 = performance.now();
        map.build(scene);
        buildMs = performance.now() - t1;
        meshes = scene;
      }
      const nav = map.nav;
      // узлы решётки ставятся в клетках 0..n включительно, поэтому на оси
      // `floor(width / step) + 1` точек (600 м → 101, как в § 2.3 плана)
      const perAxis = Math.floor(map.width / navStep) + 1;
      runs.push({
        kind: k === 0 ? 'холодный' : `тёплый ${k}`,
        ctorMs: round(ctor, 1),
        buildMs: round(buildMs, 1),
        phases: Object.fromEntries(Object.entries(acc).map(([n, a]) => [n, round(a.ms, 1)])),
        nodes: nav ? nav.pos.length : 0,
        edges: nav ? nav.adj.reduce((s, l) => s + l.length, 0) / 2 : 0,
        points: perAxis * perAxis,
        width: map.width,
        solids: map.solids.length,
        blockers: map.blockers.length,
        props: map.props.length,
        prisms: map.prisms.length,
        rails: map.rails.length,
        sweeps: map.sweeps.length,
        holes: map.holes.length,
        meshes: meshes && map.sceneObjects ? map.sceneObjects.length : null,
      });
      map.dispose?.();
    }
  } finally {
    for (const name of Object.keys(orig)) JsonMap.prototype[name] = orig[name];
  }

  const cold = runs[0], warm = runs.slice(1);
  const points = cold.points;
  const size = cold.width;
  const perAxis = Math.floor(size / navStep) + 1;
  const latticeMs = (r) => r.phases._navLattice ?? 0;
  const usPerPoint = (ms) => round(ms * 1000 / points, 1);
  return {
    url,
    ground: { size, areaKm2: round((size / 1000) ** 2, 3) },
    rawKB: round(fix.rawBytes / 1024, 1),
    expandedMB: round(fix.expandedBytes / 1048576, 2),
    expandedMBperKm2: round(fix.expandedBytes / 1048576 / (size / 1000) ** 2, 2),
    warnings: fix.warnings,
    districts: fix.districts,
    track: fix.track,
    lattice: { navStep, perAxis, points },
    cold: { ctorMs: cold.ctorMs, latticeMs: latticeMs(cold), usPerPoint: usPerPoint(latticeMs(cold)), ...pick(cold) },
    warm: warm.map((r) => ({
      ctorMs: r.ctorMs, latticeMs: latticeMs(r), usPerPoint: usPerPoint(latticeMs(r)),
      coldOverWarm: round(latticeMs(cold) / Math.max(latticeMs(r), 0.001), 2), ...pick(r),
    })),
    best: warm.reduce((a, b) => (b.ctorMs < a.ctorMs ? b : a), warm[0]),
  };
}

const pick = (r) => ({
  buildMs: r.buildMs, meshes: r.meshes, nodes: r.nodes, edges: r.edges,
  solids: r.solids, blockers: r.blockers, props: r.props, prisms: r.prisms,
  rails: r.rails, sweeps: r.sweeps, holes: r.holes, phases: r.phases,
});

const round = (v, n = 2) => Math.round(v * 10 ** n) / 10 ** n;

/** Строка таблицы § 2 — чтобы число из прогона переезжало в план без переписывания. */
export function text(rec) {
  const b = rec.best;
  const p = rec.lattice;
  return [
    `${rec.url}: плита ${rec.ground.size} м (${rec.ground.areaKm2} км²), районов ${rec.districts}, трасса ${rec.track ? 'есть' : 'нет'},`,
    `данных ${rec.rawKB} КБ авторского JSON → ${rec.expandedMB} МБ нормализованных (${rec.expandedMBperKm2} МБ/км²),`,
    `предупреждений парсера ${rec.warnings.length}`,
    `решётка: шаг ${p.navStep} → ${p.perAxis}² = ${p.points} точек`,
    `холодный: конструктор ${rec.cold.ctorMs} мс, решётка ${rec.cold.latticeMs} мс, ${rec.cold.usPerPoint} мкс/точку`,
    `тёплый (лучший): конструктор ${b.ctorMs} мс, решётка ${b.latticeMs} мс, ${b.usPerPoint} мкс/точку`,
    `узлов ${b.nodes}, рёбер ${b.edges}, меши ${b.buildMs} мс (${b.meshes} объектов), solids ${b.solids}, blockers ${b.blockers},`,
    `props ${b.props}, prisms ${b.prisms}, rails ${b.rails}, sweeps ${b.sweeps}, holes ${b.holes}`,
    `фазы тёплого: ${Object.entries(b.phases).map(([k, v]) => `${k} ${v}`).join(', ')}`,
    `разброс тёплых прогонов: ${rec.warm.map((w) => `${w.ctorMs} мс (×${w.coldOverWarm})`).join(', ')}`,
  ].join('\n');
}

export default { fixture, measure, text };
