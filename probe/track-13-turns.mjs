// Сколько дуг в кольце: сборка брифа главы 13 при turns 12 / 14 / 16 — счётчики
// генератора и предупреждения валидатора (вопрос § 10.1 плана).
import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { validateLevel, LEVEL_SPEC_V2 } from '../tools/level-schema.mjs';
import { normalizeLevel } from '../tools/normalize-level.mjs';

const raw = JSON.parse(readFileSync(new URL('../src/levels/level-13.json', import.meta.url), 'utf8'));

for (const turns of [12, 14, 16]) {
  const spec = JSON.parse(JSON.stringify(raw));
  spec.city.track.turns = turns;
  const stats = {};
  let expanded;
  try {
    expanded = expandCity(spec, stats);
  } catch (e) {
    console.log(`turns ${turns}: ОТКАЗ генератора — ${e.message}`);
    continue;
  }
  const { errors, warnings } = validateLevel(expanded, LEVEL_SPEC_V2);
  const trackRoads = expanded.roads.filter((r) => r.id.startsWith('ring'));
  const arcs = trackRoads.flatMap((r) => r.elements || []).filter((el) => el.arc).length;
  const plates = trackRoads.flatMap((r) => r.elements || []).filter((el) => el.plate).length;
  let norm = null;
  let normErr = '';
  try {
    norm = normalizeLevel(expanded);
  } catch (e) {
    normErr = String(e.message);
  }
  const allWarn = [...warnings, ...(norm?.warnings ?? [])];
  const groups = new Map();
  for (const w of allWarn) {
    const key = w.replace(/-?\d+(\.\d+)?/g, '#').slice(0, 72);
    groups.set(key, (groups.get(key) ?? 0) + 1);
  }
  const roads = norm?.map?.roads ?? [];
  const nodes = roads.reduce((a, r) => a + (r.elements || []).length, 0);
  console.log(`turns ${turns}: дорог ${expanded.roads.length} (трасса ${trackRoads.length}: дуг ${arcs}, пластин ${plates}), домов ${expanded.buildings?.length ?? 0}`);
  console.log(`  нормализация: ${normErr ? 'ОТКАЗ — ' + normErr : 'ок'} | ошибок ${errors.length}, предупреждений ${allWarn.length}, настилов в модуле ${roads.length}, элементов ${nodes}`);
  if (norm) console.log(`  модуль: ${(JSON.stringify(norm).length)} симв.`);
  console.log(`  счётчики: ${JSON.stringify(stats)}`);
  for (const [k, c] of [...groups].sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log(`  ${c}× ${k}`);
  for (const e of errors.slice(0, 6)) console.log(`  × ${e.slice(0, 160)}`);
}
