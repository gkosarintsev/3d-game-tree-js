/**
 * Фильтр глав по номеру для браузерных автотестов: при отладке одной главы не
 * гонять весь реестр. Соглашение задокументировано в AGENTS.md.
 *
 * `level` из аргумента `run*Tests(level)`: число, массив номеров, объект
 * `{ level }`/`{ levels }`/`{ chapter }` или строка `'12'`. Если аргумент не
 * передан, читается `globalThis.TEST_LEVEL` (удобно в консоли: `TEST_LEVEL=12`).
 *
 * Номер главы — запись в `LEVEL_NUMBERS` (файл `level-NN`), а не позиция в
 * массиве `LEVELS`: у удалённых глав позиции смещены.
 */
import { LEVEL_NUMBERS } from '../src/levels/index.js';

/** @returns {Set<number>|null} выбранные номера глав, или `null` = все. */
export function parseLevelFilter(arg) {
  let v = arg;
  if (v === undefined || v === null || v === '') v = globalThis.TEST_LEVEL;
  if (v === undefined || v === null || v === '' || v === false) return null;
  if (typeof v === 'object' && !Array.isArray(v)) {
    v = v.level ?? v.levels ?? v.chapter ?? v.chapters ?? v.num;
  }
  if (v === undefined || v === null || v === '' || v === false) return null;
  const nums = (Array.isArray(v) ? v : String(v).split(','))
    .map(x => Number(x))
    .filter(Number.isFinite);
  return nums.length ? new Set(nums) : null;
}

/** @returns {number[]} индексы `LEVELS`, попавшие в фильтр (пустой массив при `null` = не фильтровано). */
export function selectedIndices(filter) {
  if (!filter) return null;
  return LEVEL_NUMBERS.map((n, i) => (filter.has(n) ? i : -1)).filter(i => i >= 0);
}

/** Текст для отчёта: какие главы выбраны. */
export function filterLabel(filter) {
  if (!filter) return '';
  return ` [главы ${[...filter].sort((a, b) => a - b).join(', ')}]`;
}
