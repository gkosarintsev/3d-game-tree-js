/**
 * Реестр глав: порядок массива = порядок прохождения (как главы Half-Life).
 * Новая глава — новый файл-определение + строка здесь; движок не правим.
 */
import { LEVEL_01 } from './level-01.js';
import { LEVEL_02 } from './level-02.js';
import { LEVEL_03 } from './level-03.js';
import { LEVEL_04 } from './level-04.js';

export const LEVELS = [LEVEL_01, LEVEL_02, LEVEL_03, LEVEL_04];
