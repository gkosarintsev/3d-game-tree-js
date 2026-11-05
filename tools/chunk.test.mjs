/**
 * Автотест разрезки на чанки — § 7.1 плана docs/open-world-plan.md
 * (`node tools/chunk.test.mjs`).
 *
 * Меряет на данных то, от чего зависит стриминг: побайтовость вывода парсера и
 * его независимость от порядка обхода, владение каждым объектом ровно одним
 * чанком и присутствие во всех чанках, чей план он пересекает, обратимость
 * локализации, достаточность маргина на шве и приёмку секции `stream` схемой.
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
import { validateLevel, LEVEL_SPEC, LEVEL_SPEC_V2 } from './level-schema.mjs';
import { generateCatalog, generateModule } from './build-level.mjs';
import { schemaText, SCHEMA_FILES } from './export-schema.mjs';
import {
  splitLevel, chunkOverlap, planOf, localize, CHUNK_COLLECTIONS, stringifyStable,
} from './chunk-level.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const FIXTURE = 'probe/open-2km.json';
const CHUNK = 350;
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
// два тяжёлых прогона нужны проверке детерминизма; остальные меры берут
// нормализованную карту и разрезку из неё, не плодя нормализатор
const full = generateCatalog(structuredClone(brief), FIXTURE);
const again = generateCatalog(structuredClone(brief), FIXTURE);
const worldMap = full.worldMap;
const backwards = splitLevel(worldMap, brief.stream, { reverse: true });
const noMargin = splitLevel(worldMap, brief.stream, { overlap: 0 });

const grown = (r, m) => ({ minX: r.minX - m, maxX: r.maxX + m, minZ: r.minZ - m, maxZ: r.maxZ + m });
const hits = (a, b) => a.minX <= b.maxX && b.minX <= a.maxX && a.minZ <= b.maxZ && b.minZ <= a.maxZ;

// ------------------------------------------------------- планы, индекс, пробы

/** Все планы частей карты в её собственных осях — мир или один чанк. */
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

/** План чанка в мировых осях: местные прямоугольники + начало клетки. */
function chunkWorldRects(chunk) {
  const { x: ox, z: oz } = chunk.cell.origin;
  return allRects(chunk.map).map(r => ({
    minX: r.minX + ox, maxX: r.maxX + ox, minZ: r.minZ + oz, maxZ: r.maxZ + oz,
  }));
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

// § 7.1 п. 1.
t('детерминизм: два прогона парсера дают побайтово одинаковые index.js и все chunk-*.json', () => {
  eq(full.files.length, full.meta.cells + 1, 'файлов каталога (индекс плюс чанки)');
  const diff = [];
  full.files.forEach((f, i) => {
    const a = again.files[i];
    if (!a || a.path !== f.path) diff.push(`файл №${i}: ${f.path} против ${a?.path}`);
    else if (a.code !== f.code) diff.push(`${f.path}: байты разошлись на ${Math.abs(a.code.length - f.code.length)} символов`);
  });
  assert(diff.length === 0, diff.slice(0, 3).join(' | '));
  // печать обязана быть обратима: файл — те же данные, что вернула разрезка
  eq(stringifyStable(JSON.parse(full.files[1].code)), full.files[1].code, 'чанк не сходится с собственной печатью');
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

// Локализация — вне списка § 7.1, но без неё п. 3 и п. 4 бессмысленны: чанк с
// несдвинутой координатой проходит «покрытие» и краснеет швом в браузере.
// (П. 5 списка — скелет — приходит этапом 2, здесь его нечем мерить.)
t('локализация обратима: копия чанка, возвращённая в мир, равна мировому объекту', () => {
  let worst = 0;
  const errors = [];
  for (const coll of CHUNK_COLLECTIONS) {
    const byId = new Map((worldMap[coll] ?? []).map(o => [o.id, o]));
    for (const c of full.chunks) {
      for (const copy of c.map[coll] ?? []) {
        const { x: ox, z: oz } = c.cell.origin;
        const clean = { ...copy };
        delete clean.owner;
        const src = byId.get(copy.id);
        if (!src) { errors.push(`${coll}: '${copy.id}' в чанке ${c.id} нет в мире`); continue; }
        const d = deepDiff(src, localize(clean, { x: -ox, z: -oz }), '', 1e-9);
        if (d.message) { errors.push(`${coll}:${copy.id} — ${d.message}`); continue; }
        if (d.worst > worst) worst = d.worst;
      }
    }
  }
  const { x: ox, z: oz } = full.chunks[0].cell.origin;
  const d = deepDiff(worldMap.relief, localize(full.chunks[0].map.relief, { x: -ox, z: -oz }), '.relief', 1e-9);
  if (d.message) errors.push(`relief — ${d.message}`);
  else if (d.worst > worst) worst = d.worst;
  assert(errors.length === 0, errors.slice(0, 3).join(' | '));
  notes.push(`локализация: ${full.meta.participants} копий возвращаются в мир с худшим шумом ${worst.toExponential(2)} м`);
});

t('классификация координатных ключей: обход данных и claimed-карта разрезки равны', () => {
  // оба списка держатся здесь отдельными от COORD_KEYS/SIZE_KEYS разрезки:
  // выпадет ключ из производственного — обход найдёт его в данных и потребует
  // объяснения, а сдвинутый размер станет расхождением множества вердиктов, а не
  // молчанием
  const COORD = ['x', 'z', 'minX', 'maxX', 'minZ', 'maxZ', 'cx', 'cz', 'bx', 'bz',
    'lo', 'hi', 'cross', 'u0', 'u1', 'v0', 'v1'];
  const SIZE = ['hx', 'hz', 'radius', 'a0', 'a1', 'span', 'halfW'];
  // родитель, чьи `x`/`z` — масштаб экземпляра, а не место в мире
  const SIZE_PARENTS = ['scale'];
  const found = new Map();
  const add = (map, key, verdict) => {
    let s = map.get(key);
    if (!s) map.set(key, s = new Set());
    s.add(verdict);
  };
  const walk = (v, path, underSize) => {
    if (Array.isArray(v)) { for (const item of v) walk(item, `${path}[]`, underSize); return; }
    if (!v || typeof v !== 'object') return;
    for (const [k, sub] of Object.entries(v)) {
      const p = `${path}.${k}`;
      if (typeof sub === 'number') {
        if (SIZE.includes(k)) add(found, p, 'size');
        else if (COORD.includes(k)) add(found, p, underSize ? 'size' : 'shift');
      }
      walk(sub, p, underSize || SIZE_PARENTS.includes(k));
    }
  };
  for (const coll of CHUNK_COLLECTIONS) for (const o of worldMap[coll] ?? []) walk(o, `.${coll}[]`, false);
  walk(worldMap.relief, '.relief', false);
  const claimed = new Map();
  for (const c of full.chunks) {
    for (const [p, kind] of c.claimed) add(claimed, p, kind);
  }
  const same = (a, b) => a.size === b.size && [...a].every((v) => b.has(v));
  const unexplained = [...found].filter(([p, v]) => !claimed.has(p) || !same(v, claimed.get(p)))
    .map(([p, v]) => `${p} (ожидалось ${[...v].join('/')})`).sort();
  const invented = [...claimed.keys()].filter(p => !found.has(p)).sort();
  assert(unexplained.length === 0,
    `координатных ключей в данных без объяснения разрезки: ${unexplained.slice(0, 8).join(', ')}`);
  assert(invented.length === 0,
    `разрезка объясняет ключ, которого в данных нет: ${invented.slice(0, 8).join(', ')}`);
  const shifted = [...found.values()].filter(s => s.has('shift')).length;
  notes.push(`ключи: координатных путей в данных ${found.size}; разрезка сдвигает ${shifted}, размером признаёт ${found.size - shifted}`);
});

// § 7.1 п. 6.
t('модули глав 9–13 побайтово прежние, и разрезка к ним не прикоснулась', () => {
  for (const nn of ['09', '10', '11', '12', '13']) {
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
  hasError(validateLevel(openBrief(50), LEVEL_SPEC_V2).errors,
    'chunk', 'сторона клетки 50 м принята');
  hasError(validateLevel(openBrief(CHUNK, r => { r.stream.extra = 1; }), LEVEL_SPEC_V2).errors,
    'extra', 'неописанное поле stream принято');

  const e = validateLevel(openBrief(300), LEVEL_SPEC_V2).errors.join(' | ');
  assert(/не делит плиту/.test(e) && /350/.test(e),
    `клетка 300 на плите 1400 не названа ошибкой со списком подходящих сторон: ${e.slice(0, 240)}`);
});

t('обе JSON Schema побайтово равны выводу DSL', () => {
  for (const { spec, title, out } of SCHEMA_FILES) {
    const committed = readFileSync(out, 'utf8').replace(/\r\n/g, '\n');
    const fresh = schemaText(spec, title);
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

t('чанк — законные данные карты: местная плита, габарит внутри неё, id уникальны', () => {
  const half = CHUNK / 2;
  const errors = [];
  let empty = 0;
  // § 4.1 режет **список** объектов, а не их план: длинная дуга или русло,
  // пересёкшие четыре клетки, едут в каждую целиком. Поэтому мера не «план
  // внутри плиты» (она краснела бы на законном кольце), а «у каждой копии есть
  // часть, касающаяся клетки» + замер свеса за плиту
  let overhangObjects = 0;
  let worstOverhang = 0;
  let worstOverhangAt = '';
  for (const c of full.chunks) {
    const m = c.map;
    if (m.kind !== 'json2') errors.push(`${c.id}: kind чанка ${m.kind}, а JsonMap принимает v2 под именем json2`);
    if (m.ground.size !== CHUNK) errors.push(`${c.id}: плита ${m.ground.size}, а обязана быть сторона клетки`);
    if (!m.spawn || m.spawn.x !== 0 || m.spawn.z !== 0) errors.push(`${c.id}: спавн чанка не в его центре`);
    for (const key of ['city', 'stream', 'metadata']) if (key in m) errors.push(`${c.id}: служебная секция ${key} доехала в чанк`);
    const b = m.bounds;
    if (b.minX < -half - 1e-6 || b.maxX > half + 1e-6 || b.minZ < -half - 1e-6 || b.maxZ > half + 1e-6) {
      errors.push(`${c.id}: габарит ${JSON.stringify(b)} вылез за плиту ±${half}`);
    }
    for (const coll of CHUNK_COLLECTIONS) {
      const ids = (m[coll] ?? []).map(o => o.id);
      if (new Set(ids).size !== ids.length) errors.push(`${c.id}: в ${coll} id повторяются`);
      for (const o of m[coll] ?? []) {
        const rects = planOf(coll, o).rects;
        const cell = { minX: -half, maxX: half, minZ: -half, maxZ: half };
        if (!rects.some(r => hits(grown(cell, OVERLAP), r))) {
          errors.push(`${c.id}: ${coll}:${o.id} попал в клетку, чей план не пересекает ни одну его часть`);
        }
        const over = Math.max(
          -half - Math.min(...rects.map(r => r.minX)),
          Math.max(...rects.map(r => r.maxX)) - half,
          -half - Math.min(...rects.map(r => r.minZ)),
          Math.max(...rects.map(r => r.maxZ)) - half,
        );
        if (over > OVERLAP) {
          overhangObjects++;
          if (over > worstOverhang) { worstOverhang = over; worstOverhangAt = `${c.id} ${coll}:${o.id}`; }
        }
      }
    }
    if (!Object.keys(c.counts).length) empty++;
  }
  assert(errors.length === 0, errors.slice(0, 3).join(' | '));
  eq(full.indexMap.kind, 'open', 'kind индексного файла');
  eq(full.indexMap.cells.length, full.meta.cells, 'список клеток в index.js');
  eq(full.indexMap.stream.overlap, OVERLAP, 'маргин в index.js обязан быть выведен парсером');
  eq(full.indexMap.cells.reduce((s, c) => s + Object.values(c.objects).reduce((a, v) => a + v, 0), 0),
    full.meta.participants, 'счётчики клеток против участников разрезки');
  notes.push(`чанки: сетка ${full.meta.grid}×${full.meta.grid}, пустых клеток ${empty} из ${full.meta.cells}`);
  notes.push(`свес планов за плиту чанка: копий ${overhangObjects} из ${full.meta.participants},`
    + ` худший ${worstOverhang.toFixed(0)} м (${worstOverhangAt || '—'}) — длинные объекты едут целиком (§ 4.1)`);
});

// ------------------------------------------------------------------- вердикт

console.log('\nпрайс разрезки (фикстура 2 км):');
const sizes = full.files.slice(1).map(f => f.code.length);
const total = sizes.reduce((s, v) => s + v, 0);
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
  'средний чанк, КБ': Math.round(total / sizes.length / 1024),
  'наибольший чанк, КБ': Math.round(Math.max(...sizes) / 1024),
  'index, КБ': Math.round(full.files[0].code.length / 1024),
}]);
for (const n of notes) console.log(`  · ${n}`);
{
  // из дублирования надо вычесть то, что копируется намеренно: аналитическое
  // поле рельефа едет в каждый чанк целиком (§ 4.1), а не по клеткам
  const relief = full.chunks.filter(c => c.map.relief)
    .map(c => stringifyStable(c.map.relief).length);
  const reliefTotal = relief.reduce((s, v) => s + v, 0);
  console.log(`  · рельеф копируется в каждый чанк целиком: ${relief.length} × ${Math.round(relief[0] / 1024)} КБ = ${Math.round(reliefTotal / 1024)} КБ`
    + ` (без него дублирование ${((total - reliefTotal) / worldBytes).toFixed(2)} против ${(total / worldBytes).toFixed(2)})`);
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
