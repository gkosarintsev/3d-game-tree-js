/**
 * «До / после» этапа 11 одним и тем же арифметиком: закоммиченное до правки поле
 * (HEAD) против поля рабочего дерева. Меряется разброс вдоль x (мера двумерности),
 * расхождение картинки грунта с полем и худший уклон.
 */
import { useModule, report } from './relief11.mjs';
import { LEVEL_12 as HEAD } from './bak/level-12-head.js';
import { LEVEL_12 as NOW } from '../src/levels/level-12.js';

useModule(HEAD);
report('до (HEAD, этап 10)', []);
useModule(NOW);
report('после (рабочее дерево, этап 11a)', []);
