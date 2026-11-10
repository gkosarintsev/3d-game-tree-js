/**
 * Реестр глав: порядок массива = порядок прохождения (как главы Half-Life).
 * Новая глава — новый файл-определение + строка здесь; движок не правим.
 *
 * Номера глав в реестре не совпадают с позицией: часть глав удалена, и
 * `LEVEL_NUMBERS` держит прежние номера рядом с именами файлов. По ним меню
 * отладки и отчёт бюджетов находят каталог главы (`level-NN`), поэтому номер
 * нельзя выводить из индекса массива.
 *
 * Scope (v3/v4, TASK-001): legacy главы 01,02,04,06,11,12,13,14 удалены (см. ADR-001,
 * .ai/plans/01-city-generator-districts.md). В реестре остаются v3 CityForge/open:
 * 03,05,07,08,09,10,15; пилот v4 — глава 16 (добавляется в TASK-008).
 *
 * Главы 03,05,07,08,09,10,15 — **открытый мир** (`kind: 'open'`), CityForge v3:
 * источник `src/levels/level-NN.json`, скомпилированный каталог `src/levels/level-NN/`
 * (`node tools/build-level.mjs src/levels/level-NN.json`).
 */
import { LEVEL_03 } from './level-03/index.js';
import { LEVEL_05 } from './level-05/index.js';
import { LEVEL_07 } from './level-07/index.js';
import { LEVEL_08 } from './level-08/index.js';
import { LEVEL_09 } from './level-09/index.js';
import { LEVEL_10 } from './level-10/index.js';
import { LEVEL_15 } from './level-15/index.js';

export const LEVELS = [
  LEVEL_03, LEVEL_05, LEVEL_07, LEVEL_08, LEVEL_09, LEVEL_10, LEVEL_15,
];

/** Номер главы для каждой позиции `LEVELS` (файлы/каталоги `level-NN`). */
export const LEVEL_NUMBERS = [3, 5, 7, 8, 9, 10, 15];
