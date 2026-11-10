/**
 * Реестр глав: порядок массива = порядок прохождения (как главы Half-Life).
 * Новая глава — новый файл-определение + строка здесь; движок не правим.
 *
 * Номера глав в реестре не совпадают с позицией: часть глав удалена, и
 * `LEVEL_NUMBERS` держит прежние номера рядом с именами файлов. По ним меню
 * отладки и отчёт бюджетов находят каталог главы (`level-NN`), поэтому номер
 * нельзя выводить из индекса массива.
 *
 * Глава 1 — рельеф (`TerrainMap`): перевал из A в B через пещеру и мост.
 * Глава 2 — **открытый мир** (`kind: 'open'`): копия уровня 1, плита 240 × 240 м,
 * разрезана парсером на 16 чанков 60 м (`src/levels/level-02/`).
 * Глава 3 — **открытый мир** (`kind: 'open'`), пустой: плита 1280 × 1280 м,
 * 25 чанков 256 м, цель A→B. Источник — CityForge v3 (`src/levels/level-03.json`),
 * компилируется в движковый каталог `level-03/`:
 * `node tools/build-level.mjs src/levels/level-03.json`.
 * Глава 7 — **открытый мир** (`kind: 'open'`), как глава 3 по размерам: плита 1280 × 1280 м,
 * 5×5 чанков по 256 м, цель A→B. Одна высокая гора, туннель сквозь неё; спавн в начале
 * туннеля. Источник — CityForge v3 (`src/levels/level-07.json`), компилируется в `level-07/`:
 * `node tools/build-level.mjs src/levels/level-07.json`.
 * Глава 8 — **открытый мир** (`kind: 'open'`): плита 1280 × 1280 м, 5×5 чанков по 256 м,
 * цель A→B. Неровный ландшафт с холмами до 50 м по всей карте, сетка дорог по поверхности
 * рельефа (драпировка движка), дома с `foundation: 'terrain'`, машина у спавна. Источник —
 * CityForge v3 (`src/levels/level-08.json`), компилируется в `level-08/`:
 * `node tools/build-level.mjs src/levels/level-08.json`.
 * Глава 9 — **открытый мир** (`kind: 'open'`): плита 1280 × 1280 м, 5×5 чанков по 256 м,
 * цель A→B. Неровный ландшафт с холмами до 45 м, плотная застройка по всей карте с
 * `foundation: 'terrain'`, включая район небоскрёбов (shell), дороги по поверхности
 * рельефа, машина у спавна. Источник — CityForge v3 (`src/levels/level-09.json`),
 * компилируется в `level-09/`: `node tools/build-level.mjs src/levels/level-09.json`.
 * Глава 10 — **открытый мир** (`kind: 'open'`): плита 1280 × 1280 м, 5×5 чанков по 256 м,
 * цель A→B. Неровный ландшафт с холмами до 45 м, река (axis-aligned, повороты) через
 * всю карту, мосты с плавными рампами-подъездами, дороги по поверхности рельефа,
 * дома `foundation: 'terrain'`, машина у спавна. Источник — CityForge v3
 * (`src/levels/level-10.json`): `node tools/build-level.mjs src/levels/level-10.json`.
 * Глава 4 — весь ночной макет GLB активным окном со стримингом (`StreamedModelMap`).
 * Глава 6 — уличный уровень `TownMap` со сбором монет.
 * Главы 11–13 — переходы A→B из JSON-брифа (`kind: 'json2'`): 11 — v2 с
 * поворотными домами, дугой и развязкой; 12 — v2 на 600 × 600 м с плавным
 * рельефом (`relief`), косыми районами и двумя ярусами; 13 — v2 с
 * кольцом-трассой из секции `city.track`.
 * Глава 14 — **открытый мир** (`kind: 'open'`): город на плите 2000 × 2000 м,
 * но определение главы — не модуль с геометрией, а каталог `level-14/`:
 * `index.js` держит мировую плиту, скелет улиц и список клеток, а каждую клетку
 * 400 м движок читает и достраивает по ходу пути (`WorldMap`, план
 * docs/open-world-plan.md). Поэтому глава — единственный импорт из подкаталога,
 * и правят её так же через парсер:
 * `node tools/build-level.mjs src/levels/level-14.json`.
 */
import { LEVEL_01 } from './level-01.js';
import { LEVEL_02 } from './level-02/index.js';
import { LEVEL_03 } from './level-03/index.js';
import { LEVEL_04 } from './level-04.js';
import { LEVEL_05 } from './level-05/index.js';
import { LEVEL_06 } from './level-06.js';
import { LEVEL_07 } from './level-07/index.js';
import { LEVEL_08 } from './level-08/index.js';
import { LEVEL_09 } from './level-09/index.js';
import { LEVEL_10 } from './level-10/index.js';
import { LEVEL_11 } from './level-11.js';
import { LEVEL_12 } from './level-12.js';
import { LEVEL_13 } from './level-13.js';
import { LEVEL_14 } from './level-14/index.js';
import { LEVEL_15 } from './level-15/index.js';

export const LEVELS = [
  LEVEL_01, LEVEL_02, LEVEL_03, LEVEL_04, LEVEL_05, LEVEL_06,
  LEVEL_07, LEVEL_08, LEVEL_09, LEVEL_10,
  LEVEL_11, LEVEL_12, LEVEL_13, LEVEL_14, LEVEL_15,
];

/** Номер главы для каждой позиции `LEVELS` (файлы `level-NN`). */
export const LEVEL_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
