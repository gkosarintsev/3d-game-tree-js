/**
 * Реестр глав: порядок массива = порядок прохождения (как главы Half-Life).
 * Новая глава — новый файл-определение + строка здесь; движок не правим.
 *
 * Главы 1–3 — переходы «из A в B» (цель exit либо одна монета-заглушка),
 * главы 4–7 — уличные уровни TownMap со сбором монет.
 */
import { LEVEL_01 } from './level-01.js';
import { LEVEL_02 } from './level-02.js';
import { LEVEL_03 } from './level-03.js';
import { LEVEL_04 } from './level-04.js';
import { LEVEL_05 } from './level-05.js';
import { LEVEL_06 } from './level-06.js';
import { LEVEL_07 } from './level-07.js';

export const LEVELS = [LEVEL_01, LEVEL_02, LEVEL_03, LEVEL_04, LEVEL_05, LEVEL_06, LEVEL_07];
