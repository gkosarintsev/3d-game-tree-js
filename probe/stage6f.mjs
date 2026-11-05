/**
 * Замер этапа 6b: ловит ли резка прогона крутой переход поля.
 *
 * Площадка 4 м с узким кольцом посреди района — улица обязана разориться на
 * пластины и назвать author'у причину, а не лечь прямой над ступенью.
 */
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { CONFIG } from '../src/config.js';
import { CITY_RAW } from './city-fixture.mjs';

const J = CONFIG.jsonMap;
const raw = structuredClone(CITY_RAW);
raw.kind = 'json2';
raw.relief = {
  baseY: 0,
  hills: [
    { id: 'hrub', x: -80, z: -80, radius: 400, height: 3 },
    { id: 'lon', x: 90, z: 90, radius: 400, height: -2 },
  ],
  pads: [{ id: 'уступ', minX: 60, maxX: 140, minZ: 20, maxZ: 140, y: 4, blend: 6 }],
};
const level = normalizeLevel(expandCity(raw));
const roads = level.map.roads.filter(r => r.decks.some(d => d.length !== undefined));
const split = roads.filter(r => r.decks.length > 1);
const worst = level.map.roads.flatMap(r => r.decks.map(d => ({
  id: r.id, d, slope: Math.abs(d.topAtMax - d.topAtMin) / Math.max(d.length ?? (d.maxX - d.minX), 1e-6),
}))).sort((a, b) => b.slope - a.slope);
console.log(JSON.stringify({
  дорог: roads.length, пластин: roads.reduce((s, r) => s + r.decks.length, 0),
  разрезано: split.length, 'пример разреза': split[0] && split[0].decks.map(d => [d.length, d.topAtMin, d.ramp]),
  предупреждений: level.warnings.length,
  тексты: level.warnings.slice(0, 3),
  худшиеуклоны: worst.slice(0, 4).map(x => `${x.id} ${x.slope.toFixed(3)}`),
  streetFit: J.streetFit, streetSplitMax: J.streetSplitMax, streetGrade: J.streetGrade,
}, null, 1));
