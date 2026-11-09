/**
 * Автотест разрезки на чанки — § 7.1 плана docs/open-world-plan.md
 * (`node tools/chunk.test.mjs`).
 *
 * Меряет на данных то, от чего зависит стриминг: побайтовость вывода парсера и
 * его независимость от порядка обхода, владение каждым объектом ровно одним
 * чанком и присутствие во всех чанках, чей план он пересекает, совпадение
 * координат копии с мировыми (чанк этапа 3 не переводит оси), достаточность
 * маргина на шве и приёмку секции `stream` схемой.
 *
 * Three.js здесь не нужен и не запускается: `src/json-map.js:1` импортирует
 * 'three', поэтому настоящий `bodyClearLine` по собранной карте — в браузерной
 * сюите этапа 3 (§ 7.2 п. 5). П. 4 берёт тот же вердикт, что ставит движок
 * (`circleHitsRect` из src/solids.js стоит под `isBlocked` всех типов карт), но
 * по планам частей: без вертикали и без точности OBB. Аппроксимация одинакова с
 * обеих сторон сравнения — мира против одного чанка, — поэтому расхождение
 * видно и его нельзя купить разной мерой.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CONFIG } from '../src/config.js';
import { circleHitsRect } from '../src/solids.js';
import { SurfaceField } from '../src/surfaces.js';
import { validateLevel, LEVEL_SPEC, LEVEL_SPEC_V2 } from './level-schema.mjs';
import { generateCatalog, generateModule } from './build-level.mjs';
import { SKELETON_STEP, GROUND_FIT, axisLength, skeletonOf } from './skeleton.mjs';
import { schemaText, schemaTextFor, SCHEMA_FILES } from './export-schema.mjs';
import {
  splitLevel, chunkOverlap, planOf, cellChoices, CHUNK_COLLECTIONS, stringifyStable,
} from './chunk-level.mjs';
import { decodeChunk } from '../src/level-bin.js';

const ROOT = resolve(import.meta.dirname, '..');
const FIXTURE = 'probe/open-2km.json';
// Клетка 200 м вместо 350 м этапа 1: сторона обязана делить плиту нацело — для
// малых плит снята кратность `J.relief.meshCell` (глава 2, приоритет размера
// чанка автору). Из делителей 1 400 м в пределах схемы подходят 200 и
// 280 (§ 6.3.1 плана), берём меньшую — она держит худшую цену сборки окна.
const CHUNK = 200;
const R = CONFIG.radius;
const OVERLAP = chunkOverlap();

let passed = 0;
const failures = [];
const notes = [];

function t(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ok  ${name}`);
  } catch (e) {
    failures.push(name);
    console.log(`FAIL  ${name}\n      ${String(e.message).split('\n')[0]}`);
  }
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

function eq(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: ожидалось ${JSON.stringify(expected)}, получено ${JSON.stringify(actual)}`);
  }
}

/** В списке ошибок валидатора обязана быть строка, содержащая `needle`. */
function hasError(errors, needle, message) {
  const text = errors.join(' | ');
  assert(errors.length > 0 && text.includes(needle),
    `${message}: ошибок нет или ни одна не про «${needle}» — ${text.slice(0, 240) || '〈пусто〉'}`);
}

function assertThrows(fn, needle, message) {
  let thrown = null;
  try { fn(); } catch (e) { thrown = e; }
  assert(thrown, `${message}: не брошено исключение`);
  assert(String(thrown.message).includes(needle),
    `${message}: брошено «${thrown.message}», а ожидалось упоминание «${needle}»`);
}

// ------------------------------------------------------------------ фикстура

const base = JSON.parse(readFileSync(resolve(ROOT, FIXTURE), 'utf8'));

/** Тот же город, но открытой главой: `kind: 'open'` и секция `stream`. */
function openBrief(chunk = CHUNK, mutate = null) {
  const r = structuredClone(base);
  r.kind = 'open';
  r.stream = { chunk, keep: 1, aheadMin: 300, aheadMax: 900, budgetMs: 8 };
  if (mutate) mutate(r);
  return r;
}

const brief = openBrief();
// `full` и `again` — два одинаковых тяжёлых прогона ради детерминизма, а
// `backwards` — третий: с этапа 2 в `index.js` лежит скелет, которого у голой
// разрезки нет, поэтому «порядок обхода не влияет на вывод» мерится файлами
// эмиссии, а не только чанками. Остальные меры берут нормализованную карту и
// разрезку из неё, не плодя нормализатор
const full = generateCatalog(structuredClone(brief), FIXTURE);
const again = generateCatalog(structuredClone(brief), FIXTURE);
const worldMap = full.worldMap;
const backwards = generateCatalog(structuredClone(brief), FIXTURE, { reverse: true });
const noMargin = splitLevel(worldMap, brief.stream, { overlap: 0 });

const grown = (r, m) => ({ minX: r.minX - m, maxX: r.maxX + m, minZ: r.minZ - m, maxZ: r.maxZ + m });
const hits = (a, b) => a.minX <= b.maxX && b.minX <= a.maxX && a.minZ <= b.maxZ && b.minZ <= a.maxZ;

// ------------------------------------------------------- планы, индекс, пробы

/** Все планы частей карты — и у мира, и у чанка они в мировых осях (§ 5.8). */
function allRects(map) {
  const out = [];
  for (const coll of CHUNK_COLLECTIONS) {
    for (const o of map[coll] ?? []) out.push(...planOf(coll, o).rects);
  }
  return out;
}

const BUCKET = 100;

/** Плоская сетка планов — та же схема, что у `_blockIndex` движка. */
function rectIndex(rects) {
  const idx = new Map();
  for (const r of rects) {
    const i0 = Math.floor(r.minX / BUCKET), i1 = Math.floor(r.maxX / BUCKET);
    const j0 = Math.floor(r.minZ / BUCKET), j1 = Math.floor(r.maxZ / BUCKET);
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const key = `${i}_${j}`;
        let list = idx.get(key);
        if (!list) idx.set(key, list = []);
        list.push(r);
      }
    }
  }
  return idx;
}

/** Свободна ли точка телу радиуса radius — та же проверка, что в `isBlocked`. */
function blocked(idx, x, z, radius) {
  const i0 = Math.floor((x - radius) / BUCKET), i1 = Math.floor((x + radius) / BUCKET);
  const j0 = Math.floor((z - radius) / BUCKET), j1 = Math.floor((z + radius) / BUCKET);
  for (let j = j0; j <= j1; j++) {
    for (let i = i0; i <= i1; i++) {
      for (const r of idx.get(`${i}_${j}`) ?? []) {
        if (circleHitsRect(x, z, r.minX, r.maxX, r.minZ, r.maxZ, radius)) return true;
      }
    }
  }
  return false;
}

/**
 * Планы чанка — уже мировые: с этапа 3 (§ 5.8) чанк не переводит оси, и второй
 * переводчик координат в мере был бы второй правдой о кадре клетки.
 */
function chunkWorldRects(chunk) {
  return allRects(chunk.map);
}

/** Внутренние границы клеток (каждая один раз): ось, координата, сосед справа. */
function innerBorders(split) {
  const byIJ = new Map(split.chunks.map(c => [`${c.cell.i}_${c.cell.j}`, c]));
  const out = [];
  for (const c of split.chunks) {
    for (const [di, dj, axis] of [[1, 0, 'x'], [0, 1, 'z']]) {
      const right = byIJ.get(`${c.cell.i + di}_${c.cell.j + dj}`);
      if (!right) continue;
      out.push({
        axis,
        at: axis === 'x' ? c.cell.rect.maxX : c.cell.rect.maxZ,
        from: axis === 'x' ? c.cell.rect.minZ : c.cell.rect.minX,
        to: axis === 'x' ? c.cell.rect.maxZ : c.cell.rect.maxX,
        left: c, right,
      });
    }
  }
  return out;
}

/**
 * Мера шва: для каждой внутренней границы пробы тела на глубине `depth` от неё
 * с обеих сторон. Вердикт мира сравнивается с вердиктом **одного** чанка, в
 * котором точка лежит, — ровно то, что получит движок, загрузивший этот чанк.
 * `depths` обязаны быть ≤ `overlap − radius`: иначе проба требует твёрдости
 * дальше, чем правило участия её гарантировало.
 */
function seamMismatches(split, world, depths, alongStep = 20) {
  const worldIdx = rectIndex(allRects(world));
  const idx = new Map(split.chunks.map(c => [c.id, rectIndex(chunkWorldRects(c))]));
  const step = (split.chunks[0].cell.rect.maxX - split.chunks[0].cell.rect.minX) / alongStep;
  let probes = 0;
  let mismatches = 0;
  const samples = [];
  for (const b of innerBorders(split)) {
    for (let k = 1; k < step; k++) {
      const along = b.from + k * (b.to - b.from) / step;
      for (const depth of depths) {
        for (const [at, cell] of [[b.at - depth, b.left], [b.at + depth, b.right]]) {
          const p = b.axis === 'x' ? { x: at, z: along } : { x: along, z: at };
          const w = blocked(worldIdx, p.x, p.z, R);
          const c = blocked(idx.get(cell.id), p.x, p.z, R);
          probes++;
          if (w !== c) {
            mismatches++;
            if (samples.length < 3) {
              samples.push(`чанк ${cell.id} (${p.x.toFixed(2)}, ${p.z.toFixed(2)}): мир ${w ? 'закрыт' : 'свободен'}, чанк ${c ? 'закрыт' : 'свободен'}`);
            }
          }
        }
      }
    }
  }
  return { probes, mismatches, samples };
}

/** Глубины проб: от почти-на-шве до предельной, которую гарантирует маргин. */
const DEPTHS = [0.05, 0.25, R, OVERLAP - R - 0.01];

// ------------------------------------------------------------------ проверки

function fileBytes(f) { return f.bytes ? f.bytes : Buffer.from(f.code ?? '', 'utf8'); }
function sameFile(a, b) {
  if (!a || !b || a.path !== b.path) return false;
  const A = fileBytes(a), B = fileBytes(b);
  return A.length === B.length && A.every((v, i) => v === B[i]);
}

// § 7.1 п. 1.
t('детерминизм: два прогона парсера дают побайтово одинаковые файлы каталога', () => {
  eq(full.files.length, again.files.length, 'число файлов каталога');
  const diff = [];
  full.files.forEach((f, i) => {
    const a = again.files[i];
    if (!sameFile(f, a)) diff.push(`${f.path} против ${a?.path}: байты разошлись`);
  });
  assert(diff.length === 0, diff.slice(0, 3).join(' | '));
  // бинарный чанк обязан декодироваться в те же данные, что вернула разрезка
  const cf = full.files.find(f => f.path.startsWith('chunk-') && f.bytes);
  assert(cf, 'в каталоге нет бинарного чанка');
  const decoded = decodeChunk(cf.bytes);
  const expected = full.chunks.find(c => c.file === cf.path)?.map;
  assert(expected, `нет семантического чанка для ${cf.path}`);
  eq(stringifyStable(decoded), stringifyStable(expected), 'бинарный чанк не сходится с данными разрезки');
});

// § 7.1 п. 2.
t('идемпотность к порядку: обход клеток и объектов задом наперёд даёт те же файлы', () => {
  const byId = new Map(backwards.chunks.map(c => [c.id, c]));
  const diff = [];
  for (const c of full.chunks) {
    const b = byId.get(c.id);
    if (!b) { diff.push(`чанка ${c.id} нет в обратном обходе`); continue; }
    if (stringifyStable(b.map) !== stringifyStable(c.map)) diff.push(`${c.file}: байты чанка зависят от порядка обхода`);
  }
  assert(diff.length === 0, diff.slice(0, 3).join(' | '));
  eq(stringifyStable(backwards.indexMap), stringifyStable(full.indexMap), 'index.js зависит от порядка обхода');
  // байты файла, а не только его данные: эмиссия правит шапку и порядок ключей,
  // и скелет обязан пережить обратный обход без расхождения
  eq(backwards.files.length, full.files.length, 'файлов каталога при обратном обходе');
  const drifted = full.files.filter((f, i) => !sameFile(f, backwards.files[i])).map(f => f.path);
  eq(drifted.length, 0, 'файлов, чьи байты зависят от порядка обхода');
});

// § 7.1 п. 3.
t('покрытие: объект владеет ровно один чанк, и он есть во всех пересекающих', () => {
  const cells = full.chunks.map(c => c.cell);
  const actual = new Map();
  let spuriousFlag = 0;
  for (const c of full.chunks) {
    for (const coll of CHUNK_COLLECTIONS) {
      for (const o of c.map[coll] ?? []) {
        const key = `${coll}:${o.id}`;
        let a = actual.get(key);
        if (!a) actual.set(key, a = { cells: new Set(), owners: 0, ownerCell: null });
        a.cells.add(c.id);
        if (o.owner === true) { a.owners++; a.ownerCell = c.id; } else if ('owner' in o) spuriousFlag++;
      }
    }
  }
  const errors = [];
  let outside = 0;
  let recounted = 0;
  for (const coll of CHUNK_COLLECTIONS) {
    for (const o of worldMap[coll] ?? []) {
      const plan = planOf(coll, o);
      const expected = new Set(cells
        .filter(cl => plan.rects.some(r => hits(grown(cl.rect, OVERLAP), r)))
        .map(cl => cl.id));
      recounted += expected.size;
      const a = actual.get(`${coll}:${o.id}`);
      if (!expected.size) {
        // объект целиком вне плиты: он отброшен, а не лежит в чанке молча
        if (a) errors.push(`${coll}:${o.id} вне плиты, но попал в клетку ${a.ownerCell ?? [...a.cells][0]}`);
        else outside++;
        continue;
      }
      if (!a) { errors.push(`${coll}:${o.id} потерян: должен быть в ${[...expected].join(', ')}`); continue; }
      const missing = [...expected].filter(id => !a.cells.has(id));
      const extra = [...a.cells].filter(id => !expected.has(id));
      if (missing.length || extra.length) {
        errors.push(`${coll}:${o.id}: нет в ${missing.join(',') || '—'}, лишний в ${extra.join(',') || '—'}`);
        continue;
      }
      if (a.owners !== 1) { errors.push(`${coll}:${o.id}: владельцев ${a.owners}, а обязан ровно один`); continue; }
      const own = cells.find(cl => cl.id === a.ownerCell);
      // владеющий обязан пересекать план БЕЗ маргина: картинка не имеет права
      // достаться чанку, в котором объекта нет
      if (!plan.rects.some(r => hits(own.rect, r))) {
        errors.push(`${coll}:${o.id}: владеет клетка ${own.id}, чей прямоугольник не пересекает ни одну часть плана`);
      }
    }
  }
  eq(actual.size, full.meta.owners, 'объектов в чанках против владельцев разрезки');
  eq(spuriousFlag, 0, 'флаг owner на копии, которая не владеет');
  assert(errors.length === 0, errors.slice(0, 3).join(' | '));
  notes.push(`покрытие: объектов ${full.meta.owners}, участников ${full.meta.participants} (пересчитано независимо ${recounted}), вне плиты отброшено ${outside}`);
});

// § 7.1 п. 4 — на фикстуре и на синтетике, где стена стоит у самого шва.
t('шов: вердикт тела у границы клетки равен вердикту мира (выведенный overlap)', () => {
  const m = seamMismatches(full, worldMap, DEPTHS);
  eq(m.mismatches, 0, `расхождений у шва (проб ${m.probes})`);
  notes.push(`шов: ${m.probes} проб у ${innerBorders(full).length} внутренних границ, расхождений 0 при overlap ${OVERLAP} м`);
});

t('шов: без маргина та же мера краснеет — overlap обязан окупаться', () => {
  const fix = seamMismatches(noMargin, worldMap, DEPTHS);
  const synth = seamMismatches(splitLevel(syntheticMap(), { chunk: 200 }, { overlap: OVERLAP }), syntheticMap(), [0.05, 0.25, R], 0.5);
  const synthNo = seamMismatches(splitLevel(syntheticMap(), { chunk: 200 }, { overlap: 0 }), syntheticMap(), [0.05, 0.25, R], 0.5);
  eq(synth.mismatches, 0, 'синтетика с маргином');
  // мера обязана уметь краснеть: зелёный «равен миру» при overlap = 0 значил бы,
  // что пробы не попадают туда, где маргин что-то даёт
  assert(synthNo.mismatches > 0, 'синтетика без маргина сошлась с миром — мера ничего не проверяет');
  assert(fix.mismatches > 0, `фикстура без маргина не дала ни одного расхождения (${fix.probes} проб) — мера слепая на больших планах`);
  const gained = full.meta.participants - noMargin.meta.participants;
  notes.push(`цена маргина: участников ${full.meta.participants} против ${noMargin.meta.participants} без него (+${gained});`
    + ` расхождений у шва без маргина на фикстуре ${fix.mismatches} из ${fix.probes},`
    + ` на синтетике (стена в 0,3 м от границы) ${synthNo.mismatches} из ${synthNo.probes}`);
});

/**
 * § 7.1 п. 5 — скелет.
 *
 * Меряется по **выведенным в `index.js` числам** (`indexMap.skeleton`), а не по
 * `meta` парсера: движок читает файлы, и расхождение между тем, что скелет
 * посчитал, и тем, что эмиссия положила в каталог, — дефект файла, который иначе
 * уехал бы в браузер. Наборы настилов, берегов и дверей берёт тот же
 * `SurfaceField` и тот же `GROUND_FIT`, что и фазы скелета: «дверь наружная
 * наземная» без общего числа означала бы два разных списка, и красная сюита
 * показала бы меру вместо дыры.
 */
const SK = full.indexMap.skeleton;
const skField = new SurfaceField(worldMap);
skField.collectData();
// Двойные числа в файл идут без квантования (§ 4.2, цена `r3` на шве кольца),
// поэтому узел цепочки и узел эмиссии сравниваются точно, а не «ближайший».
const skIndex = new Map(SK.nodes.map((n, i) => [`${n[0]}|${n[1]}|${n[2]}`, i]));

/** Компоненты по рёбрам из файла: обход не знает ни `adj` скелета, ни `meta`. */
function emittedComponents() {
  const adj = SK.nodes.map(() => []);
  for (const [a, b] of SK.edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  const of = new Int32Array(SK.nodes.length).fill(-1);
  const sizes = [];
  for (let s = 0; s < SK.nodes.length; s++) {
    if (of[s] >= 0) continue;
    const c = sizes.length;
    const q = [s];
    of[s] = c;
    for (let h = 0; h < q.length; h++) {
      for (const nb of adj[q[h]]) if (of[nb] < 0) { of[nb] = c; q.push(nb); }
    }
    sizes.push(q.length);
  }
  return { count: sizes.length, of, main: sizes.indexOf(Math.max(...sizes)), sizes };
}
const skNet = emittedComponents();

/** Точки цепочки элемента: все ли они легли в файл и в большую сеть. */
function chainInFile(pts, label, errors) {
  let missing = 0, offNet = 0;
  for (const p of pts) {
    const i = skIndex.get(`${p.x}|${p.y}|${p.z}`);
    if (i === undefined) { missing++; continue; }
    if (skNet.of[i] !== skNet.main) offNet++;
  }
  if (missing) errors.push(`${label}: узлов цепочки нет в index.js — ${missing} из ${pts.length}`);
  else if (offNet) errors.push(`${label}: узлов цепочки вне большой сети — ${offNet} из ${pts.length}`);
  return !missing && !offNet;
}

t('скелет: одна связная сеть на рёбрах, лежащих в index.js', () => {
  eq(full.meta.skeleton.step, SKELETON_STEP, 'шаг скелета, выведенный парсером');
  eq(skNet.count, 1, `компонент скелета (узлов ${SK.nodes.length}, рёбер ${SK.edges.length})`);
  assert(skNet.of.every(c => c === skNet.main), 'есть узел, до которого рёбра из файла не доходят');
  notes.push(`скелет: ${SK.nodes.length} узлов / ${SK.edges.length} рёбер в index.js, компонент ${skNet.count},`
    + ` размерен на парсере ${full.meta.skeleton.components.before} → 1 (длинных рёбер принято `
    + `${full.meta.skeleton.joined}, худшее ${full.meta.skeleton.longestJoin} м, отказов ${JSON.stringify(full.meta.skeleton.rejected)})`);
});

t('скелет проходит каждый настил дороги и каждый берег русла', () => {
  const errors = [];
  let decks = 0, decksOk = 0, banks = 0, banksOk = 0, pts = 0;
  const sky = skField.roads.filter(r => r.type === 'skybridge');
  for (const road of skField.roads) {
    // переход вне скелета — решение владельца («только магистрали»): его торцы
    // стыкуются с полом комнаты или ходовой кровлей, наружу такой настил не
    // соединён ни с чем и дал бы отдельную компоненту
    if (road.type === 'skybridge') continue;
    for (const [di, d] of (road.decks ?? []).entries()) {
      decks++;
      const chain = skField.deckChain(d, SKELETON_STEP) ?? [];
      pts += chain.length;
      if (!chain.length) { errors.push(`${road.id}:${di} — цепочка пуста, настил в скелете не представлен`); continue; }
      if (chainInFile(chain, `настил ${road.id}:${di}`, errors)) decksOk++;
    }
  }
  for (const d of skField.descents) {
    banks++;
    const chain = skField.descentChain(d, SKELETON_STEP);
    if (!chain) { errors.push(`сход ${d.id} — цепочки нет (уклон круче предела или план пуст)`); continue; }
    pts += chain.length;
    if (chainInFile(chain, `сход ${d.id}`, errors)) banksOk++;
  }
  // цена исключения — список, а не молчание: сколько настилов переходов скелет
  // сознательно не ведёт, и ни одного из них в сети быть не должно
  const skyDecks = sky.flatMap(r => (r.decks ?? []).map((d, di) => `${r.id}:${di}`));
  const leaked = sky.flatMap(r => (r.decks ?? []).flatMap((d, di) =>
    (skField.deckChain(d, SKELETON_STEP) ?? []).filter(p => skIndex.has(`${p.x}|${p.y}|${p.z}`)).map(() => `${r.id}:${di}`)));
  eq(new Set(leaked).size, 0, `настилов перехода, чьи точки всё же легли в сеть (${skyDecks.length} настилов исключены)`);
  eq(errors.length, 0, errors.slice(0, 3).join(' | ') || 'настилы и берега в скелете');
  eq(decksOk, decks, 'настилов, чья цепочка целиком легла в index.js и в большую сеть');
  eq(banksOk, banks, 'сходов русла, представленных в скелете');
  notes.push(`скелет по содержимому: настилов ${decks} (цепочек целых ${decksOk}), сходов ${banks} (${banksOk}),`
    + ` точек цепочек ${pts}; вне сети по решению — ${sky.length} перехода / ${skyDecks.length} настила`);
});

t('скелет проходит каждую наружную дверь наземного уровня', () => {
  const errors = [];
  let total = 0, upFloors = 0, inner = 0;
  for (const b of skField.buildings) {
    for (const d of b.doors ?? []) {
      // отбор — ровно фаза 3 скелета: `_inPlan` (наружная) и `GROUND_FIT` по
      // отметке пола (наземная). Остальные два счётчика называют, сколько дверей
      // правило не зовёт и почему
      if (skField._inPlan(b, d.outside)) { inner++; continue; }
      if (Math.abs(d.y - b.baseY) > GROUND_FIT) { upFloors++; continue; }
      total++;
      const y = skField.groundHeightAt(d.outside.x, d.outside.z, d.y);
      const i = skIndex.get(`${d.outside.x}|${y}|${d.outside.z}`);
      if (i === undefined) { errors.push(`дверь ${d.id}: узла (${d.outside.x}, ${y}, ${d.outside.z}) нет в index.js`); continue; }
      if (skNet.of[i] !== skNet.main) errors.push(`дверь ${d.id}: узел в компоненте ${skNet.of[i]}, а не в большой сети`);
    }
  }
  eq(errors.length, 0, errors.slice(0, 3).join(' | ') || 'двери наземного уровня в скелете');
  assert(total > 0, 'ни одной наружной наземной двери — мера нечего проверяет');
  notes.push(`скелет по дверям: наземных ${total} (все в сети), выше земли ${upFloors}, внутри плана ${inner}`);
});

t('скелет проходит каждый чанк с уличным содержимым', () => {
  // «уличное содержимое» клетки — её прямоугольник пересекает план настила
  // (не перехода), план схода или точка наружной наземной двери. Клетка без
  // содержимого узла не требует: там скелету неоткуда взяться, и требовать его
  // значило бы заставлять скелет покрывать незастроенную плиту
  const rects = [];
  for (const road of skField.roads) {
    if (road.type === 'skybridge') continue;
    for (const d of road.decks ?? []) rects.push({ id: `настил ${road.id}`, r: d });
  }
  for (const d of skField.descents) rects.push({ id: `сход ${d.id}`, r: d.plan });
  const groundDoors = [];
  for (const b of skField.buildings) {
    for (const d of b.doors ?? []) {
      if (skField._inPlan(b, d.outside) || Math.abs(d.y - b.baseY) > GROUND_FIT) continue;
      groundDoors.push({ id: `дверь ${d.id}`, x: d.outside.x, z: d.outside.z });
    }
  }
  const hitsRect = (c, r) => c.minX <= r.maxX && r.minX <= c.maxX && c.minZ <= r.maxZ && r.minZ <= c.maxZ;
  const empty = [];
  let withContent = 0, leastNodes = Infinity;
  for (const cell of full.chunks) {
    const c = cell.cell.rect;
    const content = rects.some(o => hitsRect(c, o.r))
      || groundDoors.some(d => d.x >= c.minX && d.x <= c.maxX && d.z >= c.minZ && d.z <= c.maxZ);
    if (!content) continue;
    withContent++;
    let n = 0;
    for (const p of SK.nodes) if (p[0] >= c.minX && p[0] <= c.maxX && p[2] >= c.minZ && p[2] <= c.maxZ) n++;
    if (!n) empty.push(`${cell.cell.id} (${content})`);
    leastNodes = Math.min(leastNodes, n);
  }
  eq(empty.length, 0, `чанков с уличным содержимым без единого узла скелета: ${empty.slice(0, 4).join(', ')}`);
  notes.push(`скелет по чанкам: клеток с содержимым ${withContent} из ${full.chunks.length},`
    + ` наименьшее число узлов в клетке ${leastNodes}`);
});

/**
 * § 7.1 п. 5, вторая половина критерия этапа 2 — «цена построения не растёт с
 * площадью плиты». Меряется отношением чисел, а не миллисекундами: время на
 * этой машине плавает в полтора раза между прогонами (замер 1 004…1 202 мс на
 * фикстуре), а узловое содержание — от прогона к прогону одно и то же, и
 * именно оно определяет цену в браузере (движок обходит массивы из `index.js`,
 * ничего нового не считая).
 *
 * Две пары сравнений, без которых «3 864 узла» — просто число:
 *  (а) тот же контент на плите вдвое больше площади. Решётка навигации
 *      платила бы за это ×2,04 (54 756 → 111 556 клеток шагом 6 м), скелет
 *      обязан дать РОВНО те же узлы и рёбра: он ставится вдоль осей.
 *  (б) тот же контент вдвое короче при прежней плите — площадь не менялась
 *      вовсе. Узлов обязано упасть во столько же раз, во сколько осей, иначе
 *      «∝ длина дорог» было бы наблюдением, а не свойством.
 *
 * Срез делается по мировым осям (`minX < 0`) и трогает и настилы, и дома:
 * иначе вместе с дорогами осталось бы полное число дверей, и отношение узлов
 * к осям уехало бы вверх без всякой связи с ценой.
 */
t('скелет: цена ∝ протяжённость осей, а не площадь плиты', () => {
  const mile = axisLength(skField);
  const wide = skeletonOf({ ...worldMap, ground: { ...worldMap.ground, size: 2000 } });
  eq(wide.meta.nodes, SK.nodes.length, 'узлов при площади ×2,04 (плита 2000 м)');
  eq(wide.meta.edges, SK.edges.length, 'рёбер при площади ×2,04 (плита 2000 м)');
  eq(wide.meta.components.after, 1, 'компонент при площади ×2,04 (плита 2000 м)');

  const westMap = {
    ...worldMap,
    roads: worldMap.roads
      .map(r => ({ ...r, decks: (r.decks ?? []).filter(d => d.minX < 0) }))
      .filter(r => (r.decks ?? []).length > 0),
    buildings: worldMap.buildings.filter(b => (b.bounds?.minX ?? 0) < 0),
  };
  const westField = new SurfaceField(westMap);
  westField.collectData();
  const westMile = axisLength(westField);
  const skw = skeletonOf(westMap);
  const axisRatio = westMile.km / mile.km;
  const nodeRatio = skw.meta.nodes / SK.nodes.length;
  // Допуск 0,05: отношение не обязано быть точным — `deckChain` мельчит шаг
  // там, где перепад соседних узлов выше `stepUp`, и этот дополнительный шаг
  // не пропорционален длине оси. Замер — 0,002 (0,602 против 0,605), то есть
  // допуск в 25 раз хуже факта и всё ещё не даёт пройти площади: при цене по
  // площади отношение было бы 1,00 против 0,602.
  assert(Math.abs(nodeRatio - axisRatio) <= 0.05,
    `отношение узлов ${nodeRatio.toFixed(3)} разошлось с отношением осей ${axisRatio.toFixed(3)} `
    + `на ${(nodeRatio - axisRatio).toFixed(3)} > 0,05`);
  notes.push(`цена скелета: осей ${mile.km.toFixed(2)} км → узлов ${SK.nodes.length} `
    + `(${Math.round(SK.nodes.length / mile.km)} узлов/км, ${Math.round(SK.nodes.length / (worldMap.ground.size ** 2 / 1e6))} узлов/км²); `
    + `плита ×2,04 площади — узлов ${wide.meta.nodes}, рёбер ${wide.meta.edges}, компонент ${wide.meta.components.after} (цена не тронулась); `
    + `оси ×${axisRatio.toFixed(3)} при прежней плите — узлов ×${nodeRatio.toFixed(3)} `
    + `(настилов ${mile.decks} → ${westMile.decks}, компонент ${skw.meta.components.after}: срез рвёт кольцо, `
    + `для меры цены это допустимо — гейт связности мерит полный мир)`);
});

/**
 * Крошечная карта для меры шва: плита 400 × 400, клетки по 200 м, у границы
 * x = 0 стоит стена, целиком лежащая в правой клетке и не пересекающая её. На
 * большой фикстуре такое редкость (кварталы генератора не выровнены по
 * границам), поэтому проверка «маргин работает» требует ручной геометрии.
 */
function syntheticMap() {
  return {
    kind: 'json2',
    ground: { size: 400, y: 0, color: 0x111111 },
    spawn: { x: 0, z: 0 },
    buildings: [{
      id: 'w1',
      bounds: { minX: 0.3, maxX: 1.3, minZ: -6, maxZ: -5.5 },
      height: 9,
      rooms: [{ id: 'w1:r1', floors: [{ id: 'w1:f1', rect: { minX: 1.3, maxX: 9, minZ: -5.5, maxZ: 5.5 }, y: 0 }] }],
    }],
    roads: [{
      id: 'r1',
      type: 'street',
      decks: [{ minX: -20, maxX: 20, minZ: -1, maxZ: 1, y: 0, topY: 0.2 }],
    }],
  };
}

// § 7.1 п. 3 (мера, пришедшая на смену обратимости локализации: перевода
// координат в формате этапа 3 больше нет). Копия обязана равняться мировому
// объекту слово в слово — `deepDiff` с нулевым допуском ловит и забытое
// смещение, и потерянное поле, и то, что разрезка начала править данные.
t('чанк в мировых осях: копия равна мировому объекту без перевода координат', () => {
  const errors = [];
  let copies = 0;
  let owners = 0;
  for (const coll of CHUNK_COLLECTIONS) {
    const byId = new Map((worldMap[coll] ?? []).map(o => [o.id, o]));
    for (const c of full.chunks) {
      for (const copy of c.map[coll] ?? []) {
        const src = byId.get(copy.id);
        if (!src) { errors.push(`${coll}: '${copy.id}' в чанке ${c.id} нет в мире`); continue; }
        const clean = { ...copy };
        if (clean.owner) { owners++; delete clean.owner; }
        const d = deepDiff(src, clean, '', 0);
        if (d.message) errors.push(`${coll}:${copy.id} в чанке ${c.id} — ${d.message}`);
        copies++;
      }
    }
  }
  assert(errors.length === 0, errors.slice(0, 3).join(' | '));
  eq(copies, full.meta.participants, 'копий в чанках против участников разрезки');
  notes.push(`оси: ${copies} копий лежат в мировом кадре без перевода (${owners} из них несут флаг owner);`
    + ` смещение на центр клетки — то есть форму этапа 1 — эта мера ловит как расхождение чисел, а не молчанием`);
});

// § 7.1 п. 7 (вместе с гейтом `cellGrid`): мировые настройки карты должны
// доезжать до `index.js` — до правки § 6.3.1 формат терял `windows`, `clutter`
// и `signage` вовсе, и открытая глава не выводила бы ни окон, ни мусора, ни неона.
t('index.js держит мировые секции ровно один раз, чанк — ни одной', () => {
  const IM = full.indexMap;
  eq(IM.ground.size, worldMap.ground.size, 'плита в index.js — мировая, не клеточная');
  eq(stringifyStable(IM.bounds), stringifyStable(worldMap.bounds), 'габарит содержимого мира');
  eq(stringifyStable(IM.spawn), stringifyStable(worldMap.spawn), 'спавн мира');
  for (const key of ['relief', 'windows', 'clutter', 'signage']) {
    assert(worldMap[key], `${key}: в фикстуре секции нет — мера нечем проверяется`);
    eq(stringifyStable(IM[key]), stringifyStable(worldMap[key]), `${key} в index.js`);
  }
  const leaked = [];
  for (const c of full.chunks) {
    for (const key of ['ground', 'relief', 'spawn', 'bounds', 'windows', 'clutter', 'signage', 'stream']) {
      if (key in c.map) leaked.push(`${c.id}:${key}`);
    }
  }
  eq(leaked.length, 0, `мировые секции в чанках (${leaked.slice(0, 6).join(', ')})`);
  const reliefBytes = stringifyStable(worldMap.relief).length;
  const outBytes = ['windows', 'clutter', 'signage'].reduce((s, k) => s + stringifyStable(worldMap[k]).length, 0);
  notes.push(`мировое в index.js один раз: рельеф ${Math.round(reliefBytes / 1024)} КБ`
    + ` (в местных осях он ехал в каждый из ${full.meta.cells} чанков),`
    + ` секции вывода ${outBytes} Б (18 + 73 + 53 Б на фикстуре этапа 1 их теряла)`);
});

// § 7.1 п. 6.
t('модули глав из брифа побайтово прежние, и разрезка к ним не прикоснулась', () => {
  for (const nn of ['11', '12', '13']) {
    const file = `src/levels/level-${nn}.json`;
    const raw = JSON.parse(readFileSync(resolve(ROOT, file), 'utf8'));
    const committed = readFileSync(resolve(ROOT, `src/levels/level-${nn}.js`), 'utf8').replace(/\r\n/g, '\n');
    const fresh = generateModule(structuredClone(raw), file);
    eq(committed, fresh.code, `${file}: модуль разошёлся с парсером`);
    assert(!fresh.code.includes('"stream"'), `${file}: секция stream не должна доезжать до обычной главы`);
    assert(!fresh.code.includes('"owner"'), `${file}: флаг владения не должен доезжать до обычной главы`);
  }
});

// § 7.1 п. 7 — схема.
t('схема: stream берёт только open; open без него и json2 с ним отвергаются', () => {
  const ok = validateLevel(structuredClone(brief), LEVEL_SPEC_V2);
  assert(ok.errors.length === 0, `законный open-бриф отвергнут: ${ok.errors.slice(0, 3).join(' | ')}`);

  // `json2` без `stream` — законен: главы 11–13 живут именно так
  const plain = validateLevel(openBrief(CHUNK, r => { delete r.stream; r.kind = 'json2'; }), LEVEL_SPEC_V2);
  assert(plain.errors.length === 0, `v2 без stream отвергнут: ${plain.errors.slice(0, 2).join(' | ')}`);
  hasError(validateLevel(openBrief(CHUNK, r => { r.kind = 'json2'; }), LEVEL_SPEC_V2).errors,
    'stream', 'v2 со stream принят');
  hasError(validateLevel(openBrief(CHUNK, r => { delete r.stream; }), LEVEL_SPEC_V2).errors,
    'stream', 'open без stream принят');
  hasError(validateLevel(openBrief(CHUNK, r => { r.kind = 'json'; }), LEVEL_SPEC).errors,
    'stream', 'v1 со stream принят');
  hasError(validateLevel(openBrief(CHUNK, r => { r.stream.aheadMax = 100; }), LEVEL_SPEC_V2).errors,
    'ahead', 'aheadMax меньше aheadMin принят');
  hasError(validateLevel(openBrief(45), LEVEL_SPEC_V2).errors,
    'chunk', 'клетка 45 м, не делящая плиту, принята');
  hasError(validateLevel(openBrief(CHUNK, r => { r.stream.extra = 1; }), LEVEL_SPEC_V2).errors,
    'extra', 'неописанное поле stream принято');

  // Гейт клетки теперь один — деление плиты нацело (для малых плит снята и
  // кратность meshCell, глава 2). Клетка, не делящая плиту, — ошибка, и она
  // обязана называть подходящие стороны
  const e1 = validateLevel(openBrief(240), LEVEL_SPEC_V2).errors.join(' | ');
  assert(/не делит плиту/.test(e1) && /200/.test(e1),
    `клетка 240 на плите 1400 не названа ошибкой со списком подходящих сторон: ${e1.slice(0, 240)}`);
  const ok350 = validateLevel(openBrief(350), LEVEL_SPEC_V2);
  eq(ok350.errors.length, 0, `клетка 350 на плите 1400 теперь должна быть принята: ${ok350.errors.slice(0, 3).join(' | ')}`);
  eq(cellChoices(worldMap.ground.size).join(', '), '40, 56, 200, 280',
    'стороны клетки, которые принимает эта плита (деление нацело; кратность meshCell для малых плит снята)');
});

t('обе JSON Schema побайтово равны выводу DSL', () => {
  for (const entry of SCHEMA_FILES) {
    const { spec, title, out } = entry;
    const committed = readFileSync(out, 'utf8').replace(/\r\n/g, '\n');
    const fresh = schemaTextFor(entry);
    assert(committed === fresh,
      `${out.split(/[\\/]/).pop()}: расходится с DSL на ${committed.length - fresh.length} символов — запустите node tools/export-schema.mjs`);
  }
});

t('разрезка отказывает там, где владение нечем проверить: id, план, половина плана, дубль', () => {
  // карта мира не клонируется глубоко: `ground.land` — функция опоры, и
  // structuredClone на ней падает; разрезка вход не правит, поэтому достаточно
  // подменить саму коллекцию
  const patched = (patch) => splitLevel({ ...worldMap, ...patch }, brief.stream);
  const bs = worldMap.buildings.slice();
  bs[1] = { ...bs[1], id: bs[0].id };
  assertThrows(() => patched({ buildings: bs }), 'дважды', 'дубликат id принят');
  const noBounds = worldMap.buildings.slice();
  noBounds[0] = { ...noBounds[0] };
  delete noBounds[0].bounds;
  assertThrows(() => patched({ buildings: noBounds }), 'плана', 'объект без плана принят');
  const noId = worldMap.buildings.slice();
  noId[0] = { ...noId[0] };
  delete noId[0].id;
  assertThrows(() => patched({ buildings: noId }), 'без id', 'объект без id принят');
  // половина плана опаснее, чем его отсутствие: объект встал бы в чанк частями, и
  // на шве его твёрдость зависела бы от того, какая половина куда попала
  const multi = worldMap.roads.findIndex((r) => (r.decks ?? []).length > 1);
  assert(multi >= 0, 'в фикстуре нет дороги с двумя настилами — частичный план нечем проверить');
  const half = worldMap.roads.map((r, i) => (i === multi
    ? { ...r, decks: r.decks.map((d, k) => (k === 0 ? (({ maxX, ...rest }) => rest)(d) : d)) }
    : r));
  assertThrows(() => patched({ roads: half }), 'без координат', 'дорога с половиной плана принята');
});

t('чанк — законные данные карты: мировая плита в index.js, координаты без переноса', () => {
  const worldHalf = worldMap.ground.size / 2;
  const errors = [];
  let empty = 0;
  // § 4.1 режет **список** объектов, а не их план: длинная дуга или русло,
  // пересёкшие четыре клетки, едут в каждую целиком. Поэтому мера не «план
  // внутри клетки» (она краснела бы на законном кольце), а «у каждой копии есть
  // часть, касающаяся клетки» + замер свеса за клетку
  let overhangObjects = 0;
  let worstOverhang = 0;
  let worstOverhangAt = '';
  // extreme за пределами планового свеса — тот же перевод координат, который
  // этап 3 снял: у чанка он обязан равняться мировому
  let worstChunkReach = 0;
  for (const c of full.chunks) {
    const m = c.map;
    if (m.kind !== 'json2') errors.push(`${c.id}: kind чанка ${m.kind}, а JsonMap принимает v2 под именем json2`);
    // мировое в чанк не едет: плита, рельеф, спавн и габарит лежат в index.js
    // один раз (§ 4.1), иначе у движка стало бы две правды о кадре мира
    for (const key of ['city', 'stream', 'metadata', 'ground', 'relief', 'spawn', 'bounds', 'windows', 'clutter', 'signage']) {
      if (key in m) errors.push(`${c.id}: секция ${key} доехала в чанк`);
    }
    for (const coll of CHUNK_COLLECTIONS) {
      const ids = (m[coll] ?? []).map(o => o.id);
      if (new Set(ids).size !== ids.length) errors.push(`${c.id}: в ${coll} id повторяются`);
      for (const o of m[coll] ?? []) {
        const rects = planOf(coll, o).rects;
        if (!rects.some(r => hits(grown(c.cell.rect, OVERLAP), r))) {
          errors.push(`${c.id}: ${coll}:${o.id} попал в клетку, чей план не пересекает ни одну его часть`);
        }
        const over = Math.max(
          c.cell.rect.minX - Math.min(...rects.map(r => r.minX)),
          Math.max(...rects.map(r => r.maxX)) - c.cell.rect.maxX,
          c.cell.rect.minZ - Math.min(...rects.map(r => r.minZ)),
          Math.max(...rects.map(r => r.maxZ)) - c.cell.rect.maxZ,
        );
        if (over > OVERLAP) {
          overhangObjects++;
          if (over > worstOverhang) { worstOverhang = over; worstOverhangAt = `${c.id} ${coll}:${o.id}`; }
        }
        worstChunkReach = Math.max(worstChunkReach, ...rects.map(r => Math.max(-r.minX, r.maxX, -r.minZ, r.maxZ)));
      }
    }
    if (!Object.keys(c.counts).length) empty++;
  }
  // координаты чанка не выезжают дальше, чем план мира: перенос на центр клетки
  // дал бы здесь перевес ровно на половину мира
  assert(worstChunkReach <= worldHalf + 1e-6,
    `планы чанков достают до ${worstChunkReach.toFixed(1)} м при плите ±${worldHalf} м — координаты переведены в местный кадр`);
  assert(errors.length === 0, errors.slice(0, 3).join(' | '));
  eq(full.indexMap.kind, 'open', 'kind индексного файла');
  eq(full.indexMap.cells.length, full.meta.cells, 'список клеток в index.js');
  eq(full.indexMap.stream.overlap, OVERLAP, 'маргин в index.js обязан быть выведен парсером');
  eq(full.indexMap.cells.reduce((s, c) => s + Object.values(c.objects).reduce((a, v) => a + v, 0), 0),
    full.meta.participants, 'счётчики клеток против участников разрезки');
  notes.push(`чанки: сетка ${full.meta.grid}×${full.meta.grid}, пустых клеток ${empty} из ${full.meta.cells},`
    + ` худшее удаление плана чанка от (0, 0) — ${worstChunkReach.toFixed(0)} м при плите ±${worldHalf} м`);
  notes.push(`свес планов за клетку: копий ${overhangObjects} из ${full.meta.participants},`
    + ` худший ${worstOverhang.toFixed(0)} м (${worstOverhangAt || '—'}) — длинные объекты едут целиком (§ 4.1)`);
});

// ------------------------------------------------------------------- вердикт

console.log('\nпрайс разрезки (фикстура 2 км):');
const chunkDataFiles = full.files.filter(f => f.path.startsWith('chunk-'));
const sizes = chunkDataFiles.map(f => fileBytes(f).length);
const total = sizes.reduce((s, v) => s + v, 0);
const skelBytes = (full.files.find(f => f.path.includes('skeleton'))?.bytes?.length) ?? 0;
// мир печатается тем же принтером, что и чанки: сравнение компактного
// `JSON.stringify` с отступами чанков приписало бы дублированию каждые
// отступы и переносы
const worldBytes = stringifyStable(worldMap).length;
console.table([{
  'плита, м': full.meta.size,
  'чанк, м': full.meta.chunk,
  чанков: full.meta.cells,
  объектов: full.meta.owners,
  участников: full.meta.participants,
  'дублирование': (total / worldBytes).toFixed(2),
  'мир, КБ': Math.round(worldBytes / 1024),
  'чанки, КБ': Math.round(total / 1024),
  'средний чанк, КБ': Math.round(total / (sizes.length || 1) / 1024),
  'наибольший чанк, КБ': Math.round(Math.max(0, ...sizes) / 1024),
  'скелет, КБ': Math.round(skelBytes / 1024),
  'index, КБ': Math.round(fileBytes(full.files[0]).length / 1024),
}]);
for (const n of notes) console.log(`  · ${n}`);
{
  // В местных осях аналитическое поле рельефа ехало в каждый чанк целиком (§ 4.1
  // этапа 1) — с мировыми осями оно лежит один раз в индексном файле, и сравнение
  // дублирования чанков обязано это показывать, а не прятать за отступами
  const reliefBytes = stringifyStable(worldMap.relief).length;
  console.log(`  · рельеф (${Math.round(reliefBytes)} Б) — один раз в index.js (гейт «мировые секции» выше);`
    + ` в местных осях он удорожал бы каталог на ${Math.round(reliefBytes * full.meta.cells / 1024)} КБ`);
}
console.log(`\n${passed}/${passed + failures.length} проверок зелёные`);
if (failures.length) {
  console.error(`провалено: ${failures.join(', ')}`);
  process.exitCode = 1;
}

// ------------------------------------------------------------------- утилиты

/** Различия двух узлов данных: структура обязана совпасть, числа — с допуском. */
function deepDiff(a, b, path, eps) {
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return { worst: 0, message: `${path}: массив против ${typeof b}` };
    if (a.length !== b.length) return { worst: 0, message: `${path}: длина ${a.length} против ${b.length}` };
    let worst = 0;
    for (let i = 0; i < a.length; i++) {
      const d = deepDiff(a[i], b[i], `${path}[${i}]`, eps);
      if (d.message) return d;
      if (d.worst > worst) worst = d.worst;
    }
    return { worst, message: null };
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a);
    const miss = ka.filter(k => !(k in b));
    const add = Object.keys(b).filter(k => !(k in a));
    if (miss.length || add.length) {
      return { worst: 0, message: `${path}: ключи разошлись (нет ${miss.slice(0, 3)}, лишних ${add.slice(0, 3)})` };
    }
    let worst = 0;
    for (const k of ka) {
      const d = deepDiff(a[k], b[k], `${path}.${k}`, eps);
      if (d.message) return d;
      if (d.worst > worst) worst = d.worst;
    }
    return { worst, message: null };
  }
  if (typeof a === 'number' && typeof b === 'number') {
    const d = Math.abs(a - b);
    return { worst: d, message: d > eps ? `${path}: ${a} против ${b}` : null };
  }
  if (a !== b) return { worst: 0, message: `${path}: ${JSON.stringify(a)} против ${JSON.stringify(b)}` };
  return { worst: 0, message: null };
}
