/**
 * Реестр глав: порядок массива = порядок прохождения (как главы Half-Life).
 * Новая глава — новый файл-определение + строка здесь; движок не правим.
 *
 * Главы 1–4 — переходы «из A в B» (цель exit): рельеф, город кварталов, район
 * из GLB-макета и весь город тем же макетом, но с перестановкой окна (стриминг).
 * Главы 5–8 — уличные уровни TownMap со сбором монет.
 */
import { LEVEL_01 } from './level-01.js';
import { LEVEL_02 } from './level-02.js';
import { LEVEL_03 } from './level-03.js';
import { LEVEL_04 } from './level-04.js';
import { LEVEL_05 } from './level-05.js';
import { LEVEL_06 } from './level-06.js';
import { LEVEL_07 } from './level-07.js';
import { LEVEL_08 } from './level-08.js';

export const LEVELS = [LEVEL_01, LEVEL_02, LEVEL_03, LEVEL_04, LEVEL_05, LEVEL_06, LEVEL_07, LEVEL_08];
