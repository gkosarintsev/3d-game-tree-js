/**
 * Цена скелета улиц — мера этапа 2 плана docs/open-world-plan.md (§ 4.2, § 7.1 п. 5).
 *
 * Отвечает на один вопрос: платит ли скелет за ПЛОЩАДЬ плиты или за
 * ПРОТЯЖЁННОСТЬ содержимого. Для этого в таблице есть три пары сравнений:
 *   · один и тот же контент на плитах 1400 м и 2000 м — площадь ×2,04, а узлов,
 *     рёбер и компонентов обязано быть ровно столько же (цена не зависит от
 *     площади по построению: узлы ставятся вдоль осей, а не по клеткам плиты);
 *   · тот же контент втрое короче при прежней плите — площадь не менялась, а
 *     узлов обязано упасть во столько же раз, во сколько осей (это и есть
 *     «цена ∝ длина дорог», а не «меньше содержимого → меньше узлов»);
 *   · разные фикстуры с разной плотностью улиц (плиты 600/1200/2000 м) — узлы
 *     на километр оси обязаны остаться одним числом, тогда как узлы на км²
 *     различаются в разы.
 *
 * Узлы меряются по цепочкам `deckChain`/`descentChain` тем же шагом, что и
 * скелет, а протяжённость осей — по геометрическим полям настила (`length`,
 * `R`·`span`), а не по длине цепочки: иначе отношение узлов к километражу
 * выродилось бы в обратный шаг и ничего не доказывало.
 *
 * Запуск: `node probe/skeleton-cost.mjs`. Three.js не нужен: `SurfaceField` и
 * `skeletonOf` работают на нормализованных данных в Node (§ 4.2 — ради этого
 * аналитика опоры и выносилась из `json-map.js`).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { generateCatalog } from '../tools/build-level.mjs';
import { skeletonOf, axisLength } from '../tools/skeleton.mjs';
import { SurfaceField } from '../src/surfaces.js';
// v1-фикстуры этапов 0 и 2 — уже собранные нормализованные карты (модули
// генератора), повторная нормализация им не нужна
import { CITY as CITY_600 } from './city-600.js';
import { CITY as CITY_1200 } from './city-1200.js';

const ROOT = resolve(import.meta.dirname, '..');

/** Одна строка таблицы: нормализованная карта → скелет и его цена. */
function row(label, map, extra) {
  const field = new SurfaceField(map);
  field.collectData();
  const mile = axisLength(field);
  const t0 = performance.now();
  const sk = skeletonOf(map);
  const ms = Math.round(performance.now() - t0);
  const area = map.ground.size * map.ground.size / 1e6;
  return {
    фикстура: label,
    'плита, м': map.ground.size,
    'площадь, км²': +area.toFixed(2),
    'осей, км': +mile.km.toFixed(2),
    'настилов': mile.decks,
    'узлов': sk.meta.nodes,
    'узлов/км': Math.round(sk.meta.nodes / mile.km),
    'узлов/км²': Math.round(sk.meta.nodes / area),
    'рёбер': sk.meta.edges,
    'компонент': sk.meta.components.after,
    'построение, мс': ms,
    'фазы, мс': extra ? '' : JSON.stringify(sk.meta.ms),
  };
}

const rows = [];

/**
 * Западная половина улиц: все настилы и дома, чей габарит заходит в x < 0.
 * Плита та же, content — вдвое меньше по протяжённости, поэтому это вторая
 * пара сравнений: площадь не менялась, а число узлов обязано упасть ровно
 * во столько раз, во сколько упала длина осей.
 */
function halfWest(map) {
  return {
    ...map,
    roads: map.roads
      .map(r => ({ ...r, decks: (r.decks ?? []).filter(d => d.minX < 0) }))
      .filter(r => (r.decks ?? []).length > 0),
    buildings: map.buildings.filter(b => (b.bounds?.minX ?? 0) < 0),
  };
}

for (const [label, level] of [['city-600.js', CITY_600], ['city-1200.js', CITY_1200]]) {
  rows.push(row(label, level.map));
}

// открытая фикстура: тот же контент на двух плитах — 1400 м (её собственная) и
// 2000 м (вдвое больше площади, того же километража)
const base = JSON.parse(readFileSync(resolve(ROOT, 'probe/open-2km.json'), 'utf8'));
base.kind = 'open';
base.stream = { chunk: 350, keep: 1, aheadMin: 300, aheadMax: 900, budgetMs: 8 };
const worldMap = generateCatalog(structuredClone(base), 'probe/open-2km.json').worldMap;
rows.push(row('open-2km (разрезка этапа 1)', worldMap));
const wide = { ...worldMap, ground: { ...worldMap.ground, size: 2000 } };
rows.push(row('open-2km на плите 2000 м', wide, true));
const west = row('open-2km, западные улицы', halfWest(worldMap), true);
rows.push(west);

console.table(rows);

const open = rows.find(r => r.фикстура.startsWith('open-2km ('));
const same2000 = rows.find(r => r['плита, м'] === 2000);
console.log(`\nплощадь ×${(same2000['площадь, км²'] / open['площадь, км²']).toFixed(2)} при том же контенте: `
  + `узлов ${open['узлов']} → ${same2000['узлов']}, рёбер ${open['рёбер']} → ${same2000['рёбер']}, `
  + `компонент ${open['компонент']} → ${same2000['компонент']} (цена узла не зависит от размера плиты)`);
console.log(`то же содержимое вдвое меньше при прежней плите `
  + `(площадь ×${(west['площадь, км²'] / open['площадь, км²']).toFixed(2)}): `
  + `осей ${open['осей, км']} → ${west['осей, км']} км (×${(west['осей, км'] / open['осей, км']).toFixed(3)}), `
  + `узлов ${open['узлов']} → ${west['узлов']} (×${(west['узлов'] / open['узлов']).toFixed(3)}) — `
  + `расхождение отношения узлов с отношением осей `
  + `${Math.abs(west['узлов'] / open['узлов'] - west['осей, км'] / open['осей, км']).toFixed(3)}`);
const densities = rows.map(r => `${r.фикстура}: ${r['узлов/км']} узлов/км при ${r['узлов/км²']} узла/км²`);
console.log(`плотность улиц: ${densities.join(' | ')}`);
