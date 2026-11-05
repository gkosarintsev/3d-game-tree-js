/** Точные числа фикстуры plinthRaw для журнала: стыки, пластины, резка. */
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { CONFIG } from '../src/config.js';
const J = CONFIG.jsonMap;
const src = await import('../tools/level-parser.test.mjs').catch(() => null);
