/**
 * Автотест оси трассы на Node: `node tools/track.test.mjs` (план —
 * docs/level13-track-plan.md, этап 1).
 *
 * Проверяет то, что обязано быть верным до появления полотна в данных: шов
 * петли замкнут **построением**, а не подгонкой; дуга касается своих рёбер;
 * между двумя скруглениями остаётся прямая не короче минимального прогона;
 * расход ГПСЧ не зависит ни от отказов, ни от того, что получилось; и что
 * колец без `city.track` генератор не трогает вовсе (главы 9–12 собираются
 * побайтово).
 */
import { makeRng } from '../src/rng.js';
import { arcDelta, r3 } from '../src/geo2d.js';
import { CONFIG } from '../src/config.js';
import { reliefOf } from '../src/relief.js';
import { validateLevel, LEVEL_SPEC_V2 } from './level-schema.mjs';
import { normalizeLevel } from './normalize-level.mjs';
import {
  TRACK_DEFAULTS, TRACK_ARC_MIN, TRACK_ARC_SLIVER, trackSpec, trackCenterline, trackAxisAt, expandCity,
  trackProfile, trackToes, trackDeckAt, trackFittedAt,
} from './city.js';

const JJ = CONFIG.jsonMap;

let passed = 0;
const failures = [];

function t(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ok  ${name}`);
  } catch (e) {
    failures.push(name);
    console.log(`FAIL  ${name}\n      ${e.message}`);
  }
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

function near(actual, expected, tol, message) {
  if (!(Math.abs(actual - expected) <= tol)) {
    throw new Error(`${message}: ожидалось ${expected} ± ${tol}, получено ${actual}`);
  }
}

/** Профиль кривизны с заданными числами и сидом; `ctx` — только ГПСЧ и счётчики. */
function ring(over = {}, seed = 20261105) {
  const spec = trackSpec({ ...TRACK_DEFAULTS, ...over });
  const bumps = [];
  const track = trackCenterline(spec, { rng: makeRng(seed), bump: k => bumps.push(k) });
  track.bumps = bumps;
  return track;
}

/** То же, но с считалчиком вызовов ГПСЧ вместо самого сида. */
function counted(over = {}, calls = { n: 0 }) {
  const spec = trackSpec({ ...TRACK_DEFAULTS, ...over });
  const rng = () => { calls.n++; return makeRng(calls.n * 7919 + 13)(); };
  const track = trackCenterline(spec, { rng, bump: () => {} });
  return { track, calls };
}

const SEEDS = [1, 7, 20261105, 42, 99991, 555, 2024, 31337];
const MIN_RUN = 8;

t('шов замкнут побайтово: конец последнего элемента — та же точка, что начало первого', () => {
  for (const seed of SEEDS) {
    for (const turns of [3, 5, 12, 14, 21]) {
      const tr = ring({ turns }, seed);
      const first = tr.elements[0], last = tr.elements[tr.elements.length - 1];
      const gap = Math.hypot(last.x1 - first.x0, last.z1 - first.z0);
      assert(gap === 0, `seed ${seed}, turns ${turns}: зазор шва ${gap} м (нужен ноль, а не допуск)`);
      let sum = 0;
      for (const el of tr.elements) sum += el.len;
      near(sum, tr.length, 1e-9, `seed ${seed}, turns ${turns}: сумма длин против длины оси`);
    }
  }
});

t('ось непрерывна: точка на конце элемента совпадает с началом следующего', () => {
  for (const seed of SEEDS) {
    const tr = ring({}, seed);
    for (let i = 0; i + 1 < tr.elements.length; i++) {
      const a = trackAxisAt(tr, tr.elements[i].s0 + tr.elements[i].len);
      const b = trackAxisAt(tr, tr.elements[i + 1].s0);
      near(Math.hypot(a.x - b.x, a.z - b.z), 0, 1e-9, `seed ${seed}, стык ${i}`);
      // касательная на стыке обязана быть той же: на этом держит полотно
      // `connect: 'tangent'`, и разрыв угла нормализатор превратил бы в диагональ
      const dot = a.tx * b.tx + a.tz * b.tz;
      near(dot, 1, 1e-9, `seed ${seed}, стык ${i}: излом касательной`);
    }
    // обход на целый круг вперёд и назад returns ту же точку
    const p0 = trackAxisAt(tr, 0);
    for (const extra of [tr.length, -tr.length, tr.length * 3]) {
      const p = trackAxisAt(tr, extra);
      near(p.x, p0.x, 1e-9, `seed ${seed}, обход +${extra}`);
      near(p.z, p0.z, 1e-9, `seed ${seed}, обход +${extra}`);
    }
  }
});

t('дуга касается своих рёбер: концы на расстоянии R от центра, раствор — ровно угол вершины', () => {
  for (const seed of SEEDS) {
    const tr = ring({ turns: 14, curvatureJitter: 0.35 }, seed);
    let arcs = 0;
    for (const el of tr.elements) {
      if (el.kind !== 'arc') continue;
      arcs++;
      near(Math.hypot(el.x0 - el.cx, el.z0 - el.cz), el.radius, 1e-9, `дуга ${el.i}: начало не на окружности`);
      near(Math.hypot(el.x1 - el.cx, el.z1 - el.cz), el.radius, 1e-9, `дуга ${el.i}: конец не на окружности`);
      const a1 = Math.atan2(el.z1 - el.cz, el.x1 - el.cx);
      // тот же предикат, что у движка в `sweepTopAt`: угол конца внутри развёртки
      const delta = arcDelta(a1, el.a0, el.span);
      assert(delta !== null, `дуга ${el.i}: конец вышел за свою развёртку (arcDelta null)`);
      near(Math.abs(delta), Math.abs(el.span), 1e-9, `дуга ${el.i}: раствор против угла вершины`);
      near(el.len, el.radius * Math.abs(el.span), 1e-9, `дуга ${el.i}: длина против R·|δ|`);
      // касательная в начале дуги совпадает с направлением входящего ребра
      const w = Math.sign(el.span);
      const tx = -Math.sin(el.a0) * w, tz = Math.cos(el.a0) * w;
      const e = tr.edges[(el.i - 1 + tr.spec.turns) % tr.spec.turns];
      near(Math.abs(tx * e.ux + tz * e.uz), 1, 1e-9, `дуга ${el.i}: касательная не вдоль ребра`);
      // и в конце — с исходящим
      const q = tr.edges[el.i];
      const tx1 = -Math.sin(el.a0 + el.span) * w, tz1 = Math.cos(el.a0 + el.span) * w;
      near(Math.abs(tx1 * q.ux + tz1 * q.uz), 1, 1e-9, `дуга ${el.i}: касательная конца не вдоль ребра`);
      // середина развёртки — самая близкая к вершине точка дуги: она обязана
      // лежать между вершиной и центром, иначе скругление вылезло бы за угол
      const am = el.a0 + el.span / 2;
      const mid = { x: el.cx + Math.cos(am) * el.radius, z: el.cz + Math.sin(am) * el.radius };
      const v = tr.verts[el.i];
      assert(Math.hypot(mid.x - v.x, mid.z - v.z) < Math.hypot(el.cx - v.x, el.cz - v.z),
        `дуга ${el.i}: центр ближе к вершине, чем сама дуга`);
    }
    assert(arcs >= 3, `дуг меньше трёх (${arcs}) — скругление не построилось`);
  }
});

t('между скруглениями остаётся прямая не короче минимального прогона', () => {
  for (const seed of SEEDS) {
    for (const turns of [3, 5, 12, 14, 21]) {
      const tr = ring({ turns }, seed);
      const lines = tr.elements.filter(e => e.kind === 'line');
      assert(lines.length >= 3, `turns ${turns}: прямых ${lines.length} — кольцо сложилось в одни дуги`);
      for (const el of lines) {
        assert(el.len >= MIN_RUN - 1e-9, `turns ${turns}, seed ${seed}: прямая ${el.len.toFixed(3)} м короче ${MIN_RUN} м`);
      }
    }
  }
});

t('контур остаётся простым при дрожи до предела (0,5): без самопересечений и с обходом ровно 2π', () => {
  // знак поворота в вершине при дрожи радиуса **не обязан** быть одинаковым:
  // вершина, задвинутая между двумя выпуклыми, даёт вогнутый угол (замер
  // первой пробы: seed 1, jitter 0,2 — один поворот против обхода). Это
  // легитимная форма петли, и требует она другого — чтобы контур не
  // самопересекался, а хорда ребра не проходила через центр кольца
  // знак ориентации с допуском: соседние пробы одной прямой дают перекрестное
  // произведение порядка 1e-13, и без допуска тест считал «пересечением»
  // собственный прямолинейный участок (замер: пробы 300 и 305 на seed
  // 20261105, jitter 0,49 легли на одну прямую line6)
  const sgn = (p, q, r) => {
    const v = (q.x - p.x) * (r.z - p.z) - (q.z - p.z) * (r.x - p.x);
    return Math.abs(v) < 1e-9 ? 0 : Math.sign(v);
  };
  const crossing = (a, b, c, d) => sgn(a, b, c) !== sgn(a, b, d) && sgn(c, d, a) !== sgn(c, d, b);
  for (const seed of SEEDS) {
    for (const jitter of [0, 0.2, 0.35, 0.49]) {
      for (const turns of [3, 5, 12, 14, 21]) {
        const tr = ring({ turns, curvatureJitter: jitter }, seed);
        let sum = 0;
        for (const d of tr.turn) sum += d;
        near(Math.abs(sum), Math.PI * 2, 1e-9, `seed ${seed}, jitter ${jitter}, turns ${turns}: сумма внешних углов петли`);
        const pts = tr.verts;
        for (let i = 0; i + 2 < pts.length; i++) {
          for (let j = i + 2; j + 1 < pts.length; j++) {
            if (i === 0 && j === pts.length - 1) continue;   // стык шва
            if (crossing(pts[i], pts[i + 1], pts[j], pts[j + 1])) {
              throw new Error(`seed ${seed}, jitter ${jitter}, turns ${turns}: полигон вершин самопересекается на ${i} и ${j} рёбрах`);
            }
          }
        }
        // вершина без скругления — это угол, а не поворот: полотно в ней
        // ломается, и `connect: 'tangent'` отдаст диагональ. Предел дрожи
        // (0,5) подобран так, чтобы скругление переживало срезку `MIN_RUN`
        // на каждом кольце (замер: 880 вершин прогона, худший радиус 8,5 м
        // при `TRACK_ARC_MIN` 2 м и худший поворот 152,1°). Сброс в ноль
        // легален по двум причинам: тоньше предела схемы (`TRACK_ARC_MIN`) и
        // короче миллиметровой отметки (`TRACK_ARC_SLIVER`) — тогда вершина
        // остаётся углом, а две прямые сходятся в неё в одну точку
        for (let i = 0; i < turns; i++) {
          assert(tr.R[i] === 0 || tr.R[i] >= TRACK_ARC_MIN,
            `seed ${seed}, jitter ${jitter}, turns ${turns}: вершина ${i} осталась углом (R ${tr.R[i]})`);
          assert(!tr.R[i] || tr.R[i] * Math.abs(tr.turn[i]) >= TRACK_ARC_SLIVER,
            `seed ${seed}, jitter ${jitter}, turns ${turns}: дуга вершины ${i} короче ${TRACK_ARC_SLIVER} м`
            + ` (${(tr.R[i] * Math.abs(tr.turn[i])).toFixed(3)} м при R ${tr.R[i].toFixed(1)})`);
        }
      }
    }
  }
});

t('ось (дуги вместе с прямыми) не самопересекается: 600 проб на полный обход', () => {
  // знак ориентации с допуском: соседние пробы одной прямой дают перекрестное
  // произведение порядка 1e-13, и без допуска тест считал «пересечением»
  // собственный прямолинейный участок (замер: пробы 300 и 305 на seed
  // 20261105, jitter 0,49 легли на одну прямую line6)
  const sgn = (p, q, r) => {
    const v = (q.x - p.x) * (r.z - p.z) - (q.z - p.z) * (r.x - p.x);
    return Math.abs(v) < 1e-9 ? 0 : Math.sign(v);
  };
  const crossing = (a, b, c, d) => sgn(a, b, c) !== sgn(a, b, d) && sgn(c, d, a) !== sgn(c, d, b);
  for (const seed of SEEDS) {
    for (const jitter of [0.35, 0.49]) {
      const tr = ring({ turns: 12, curvatureJitter: jitter }, seed);
      const pts = [];
      for (let i = 0; i < 600; i++) {
        const at = trackAxisAt(tr, (i / 600) * tr.length);
        pts.push({ x: at.x, z: at.z });
      }
      for (let i = 0; i + 2 < pts.length; i++) {
        for (let j = i + 2; j + 1 < pts.length; j++) {
          if (i === 0 && j === pts.length - 1) continue;
          assert(!crossing(pts[i], pts[i + 1], pts[j], pts[j + 1]),
            `seed ${seed}, jitter ${jitter}: ось пересекла себя на пробах ${i} и ${j}`);
        }
      }
    }
  }
});

t('детерминизм: один сид — один профиль, другой сид — другой', () => {
  const a = JSON.stringify(ring({}, 100).elements);
  const b = JSON.stringify(ring({}, 100).elements);
  assert(a === b, 'один и тот же сид дал разные профили');
  const c = JSON.stringify(ring({}, 101).elements);
  assert(a !== c, 'разные сиды дали одинаковый профиль');
  // длина оси — тоже из сида, и она разная на разных сидах (иначе дрожь
  // вершины не влияла бы на форму)
  const lengths = new Set(SEEDS.map(s => r3(ring({}, s).length)));
  assert(lengths.size === SEEDS.length, `длины оси повторились: ${[...lengths].join(' ')}`);
});

t('расход ГПСЧ фиксирован: две ноты на вершину и три на съезд', () => {
  for (const [turns, entries] of [[3, 0], [12, 2], [14, 5], [21, 8]]) {
    const { calls } = counted({ turns, entries });
    near(calls.n, turns * 2 + entries * 3, 0, `turns ${turns}, entries ${entries}: вызовов ГПСЧ`);
  }
});

t('коридор накрывает полотно, а не половину карты', () => {
  for (const seed of SEEDS) {
    const tr = ring({ turns: 14 }, seed);
    const half = tr.spec.width / 2;
    let misses = 0;
    // любая точка полотна (ось ± половина ширины) обязана попасть в коробку
    // коридора: иначе под поднятым настилом встанет лот
    for (let i = 0; i < 4000; i++) {
      const s = (i / 4000) * tr.length;
      const at = trackAxisAt(tr, s);
      for (const k of [-1, 0, 1]) {
        const x = at.x + -at.tz * half * k, z = at.z + at.tx * half * k;
        if (!tr.band.some(o => x >= o.rect.minX && x <= o.rect.maxX && z >= o.rect.minZ && z <= o.rect.maxZ)) misses++;
      }
    }
    assert(misses === 0, `seed ${seed}: ${misses} точек полотна вне коридора`);
    const boxes = tr.band.length;
    assert(boxes < 400, `коридор набит ${boxes} коробками — препятствий больше, чем настила`);
  }
});

t('съезды: сторона и направление из сида, ось уходит от петли по нормали', () => {
  const tr = ring({ entries: 3 }, 777);
  near(tr.entries.length, 3, 0, 'число съездов');
  for (const e of tr.entries) {
    near(Math.hypot(e.dx, e.dz), 1, 1e-9, `${e.id}: направление не единичное`);
    const at = trackAxisAt(tr, e.s);
    near(at.x, e.x, 1e-9, `${e.id}: точка ухода не на оси`);
    near(at.z, e.z, 1e-9, `${e.id}: точка ухода не на оси`);
    // съезд уходит перпендикулярно касательной (иначе въезд лёг бы вдоль полотна)
    near(at.tx * e.dx + at.tz * e.dz, 0, 1e-9, `${e.id}: уход не по нормали`);
    const toCenter = (tr.spec.center.x - e.x) * e.dx + (tr.spec.center.z - e.z) * e.dz;
    assert(e.inward === (toCenter > 0), `${e.id}: флаг стороны против вектора к центру`);
    assert(e.runFactor >= 0.85 && e.runFactor <= 1.15, `${e.id}: удлинение пролёта ${e.runFactor} вне [0,85; 1,15]`);
    assert(e.s >= 0 && e.s < tr.length, `${e.id}: точка ухода вне длины оси (${e.s} при ${tr.length})`);
  }
  // разные сиды дают разные стороны — иначе «внутрь/наружу» не дрожало бы
  const sides = new Set([20261105, 1, 2, 3, 4].map(s => ring({ entries: 4 }, s).entries.map(e => e.inward).join('')));
  assert(sides.size > 1, 'сторона ухода съездов не зависит от сида');
});

// --------------------------------------------------------------- гейты секции

const LEVEL = (city, kind = 'json2') => ({
  kind,
  ground: { y: 0, size: 600 },
  city: { seed: 20261105, districts: [{ id: 'd0', block: { minX: -290, maxX: -200, minZ: 200, maxZ: 290 } }], ...city },
});

function gate(city, over = {}) {
  try {
    expandCity(LEVEL({ track: { ...TRACK_DEFAULTS, ...over }, ...city }));
    return null;
  } catch (e) { return String(e.message); }
}

t('гейты: невозможная конфигурация называется до первого вызова ГПСЧ', () => {
  const cases = [
    ['curvatureJitter', { curvatureJitter: 0.8 }, /curvatureJitter/],
    ['radius меньше minRadius', { minRadius: 200 }, /radius .* меньше minRadius/],
    ['внутренняя кромка выродилась', { minRadius: 3, width: 6 }, /внутреннюю кромку/],
    ['уклон круче предела схемы', { grade: 0.4 }, /grade/],
    ['ширина вне схемы', { width: 60 }, /width/],
    ['крен вне схемы', { bank: 45 }, /bank/],
    ['нулевой зазор', { clearance: 0 }, /clearance/],
    ['волна не влезает в уклон', { amplitude: 20, waves: 3 }, /волна/],
    ['несколько волн — не целое', { waves: 1.5 }, /waves/],
    ['петля вне земли', { radius: 290 }, /не влезает в землю/],
    ['кольцо из двух вершин', { turns: 2 }, /turns/],
    ['несчитанный ключ', { spline: 'catmull' }, /ключ 'spline'/],
    ['v1 не принимает трассу', null, /поле v2/],
  ];
  for (const [name, over, re] of cases) {
    const msg = over === null
      ? (() => { try { expandCity(LEVEL({ track: { ...TRACK_DEFAULTS } }, 'json')); return null; } catch (e) { return String(e.message); } })()
      : gate({}, over);
    assert(msg !== null, `${name}: конфигурация прошла молча`);
    assert(re.test(msg), `${name}: ошибка '${msg.split('\n')[0]}' не называет причину (искали ${re})`);
  }
  assert(gate({}) === null, `дефолтная трасса не собралась: ${gate({})}`);
});

t('без city.track генератор не берёт ни одной ноты больше и не добавляет препятствий', () => {
  const plain = LEVEL({});
  const statsPlain = {};
  const builtPlain = expandCity(structuredClone(plain), statsPlain);
  assert(!('lot_in_track_band' in statsPlain), 'без трассы появился счётчик коридора');
  assert(!('district_crossed_by_track' in statsPlain), 'без трассы появился счётчик пересечённых районов');

  // улицы района от трассы не зависят: коридор блокирует лоты, но не улицы, и
  // осевой район остаётся прежним кварталом под поднятым настилом. Полотно
  // самой трассы — свои записи (их различает `trackRole`), их в этом сравнении нет
  const ids = out => out.roads.filter(r => r.district !== undefined).map(r => r.id).join(',');
  const track = LEVEL({ track: { radius: 60, turns: 5, minRadius: 30, entries: 0, amplitude: 1, waves: 1, clearance: 2 } });
  const statsTrack = {};
  const builtTrack = expandCity(structuredClone(track), statsTrack);
  assert(ids(builtPlain) === ids(builtTrack), 'ids улиц района изменились из-за секции track');
  assert(builtTrack.roads.some(r => r.trackRole === 'ring'), 'кольцо не эмитилось в дороги');
  assert(!builtPlain.roads.some(r => r.trackRole), 'без city.track в дорогах появилась трасса');
  assert(builtTrack.buildings.length <= builtPlain.buildings.length,
    `с коридором домов больше (${builtTrack.buildings.length} против ${builtPlain.buildings.length})`);
  // и не нуля: коробка коридора обязана оставлять район кварталом. Первая
  // версия этапа передавала в `d.trackBand` сырую коробку вместо обёртки
  // `{obb}`, `obbHitsRect` на NaN считал пересечение с ней всякого лота, и
  // район под кольцом (60 м радиуса на 400-м районе) вычищался целиком —
  // «домов стало меньше» при этом оставалось зелёным
  assert(builtTrack.buildings.length > 0,
    `кольцо вычистило район целиком: ${(statsTrack.lot_in_track_band ?? 0)} лотов в коридоре из ${statsTrack.lots ?? '?'}`);

  // лот, вставший под полотно, называется счётчиком, а не молчанием: блок
  // района прямо в центр кольца — самый жадный случай
  const inside = LEVEL({ track: { radius: 60, turns: 5, minRadius: 30, entries: 0, amplitude: 1, waves: 1, clearance: 2 } });
  inside.city.districts = [{ id: 'd0', block: { minX: -55, maxX: 55, minZ: -55, maxZ: 55 } }];
  const statsInside = {};
  expandCity(structuredClone(inside), statsInside);
  assert(statsInside.lot_in_track_band > 0,
    `лоты под кольцом не отбракованы: ${JSON.stringify(statsInside)}`);
  const plainInside = LEVEL({});
  plainInside.city.districts = [{ id: 'd0', block: { minX: -55, maxX: 55, minZ: -55, maxZ: 55 } }];
  const statsPlainInside = {};
  const builtPlainInside = expandCity(structuredClone(plainInside), statsPlainInside);
  const rejected = builtPlainInside.buildings.length - expandCity(structuredClone(inside), {}).buildings.length;
  assert(rejected > 0, `с коридором дома не стали реже: ${builtPlainInside.buildings.length} против ${expandCity(structuredClone(inside), {}).buildings.length}`);
});

// ------------------------------------------------------------- профиль высот

/** Кольцо с профилем высот: то, чем пользуется этап 3. */
function ringP(over = {}, field = null, groundY = 0, seed = 20261105) {
  const tr = ring(over, seed);
  trackProfile(tr, field, groundY);
  return tr;
}

/** Поле главы 12 — гряда капсул; берётся прямо из закоммиченного брифа. */
const field12 = reliefOf({
  baseY: 0,
  hills: [
    { x: -340, z: -135.5, bx: 340, bz: -135.5, radius: 344, height: -7.37 },
    { x: -340, z: -30.6, bx: 340, bz: -30.6, radius: 172, height: -2.37 },
    { x: -340, z: -36.2, bx: 340, bz: -36.2, radius: 524, height: 6.05 },
    { x: -340, z: 46.3, bx: 340, bz: 46.3, radius: 514, height: 3.66 },
    { x: -340, z: 244.6, bx: 340, bz: 244.6, radius: 360, height: 8.65 },
  ],
});

t('профиль: нигде не ниже требования, нигде не круче grade, и без лишнего миллиметра', () => {
  const fields = [['равнина', null, 0], ['гряда главы 12', field12, 0]];
  for (const [label, field, groundY] of fields) {
    for (const seed of [20261105, 1, 42]) {
      const tr = ringP({}, field, groundY, seed);
      const p = tr.profile;
      const g = tr.spec.grade;
      for (let i = 0; i < p.n; i++) {
        assert(p.deck[i] >= p.need[i] - 1e-12, `${label}/seed ${seed}: проба ${i} ниже требования`);
        assert(p.deck[i] >= p.floor[i] + tr.spec.clearance - 1e-12,
          `${label}/seed ${seed}: проба ${i} под корытом поля + зазором`);
        const j = (i + 1) % p.n;
        const slope = Math.abs(p.deck[j] - p.deck[i]) / p.step;
        assert(slope <= g + 1e-12, `${label}/seed ${seed}: уклон ${slope.toFixed(5)} круче grade ${g}`);
        // наименьшая мажоранта: отметка обязана быть **достигнута** каким-то
        // требованием, иначе полотно поднято «про запас» и этого запаса никто не
        // просил (ловит лишнюю итерацию и ошибку в расстоянии вокруг петли)
        let hit = false;
        for (let k = 0; k < p.n; k++) {
          let d = Math.abs(k - i) * p.step;
          if (d > tr.length / 2) d = tr.length - d;
          if (Math.abs(p.deck[i] - (p.need[k] - g * d)) < 1e-12) { hit = true; break; }
        }
        assert(hit, `${label}/seed ${seed}: проба ${i} не достигнута ни одним требованием — мажоранта не наименьшая`);
      }
      assert(p.maxSlope <= g + 1e-12, `${label}/seed ${seed}: статистика уклона ${p.maxSlope} против цикла проб ${g}`);
    }
  }
});

t('профиль по корыту, а не по осевой: гребень, задевший только борт, полотно не закапывает', () => {
  // сопка ставится так, чтобы её вершина легла **за** осевой точкой петли, но
  // внутри половины ширины: ось там ниже гребня, и фит по осевой уронил бы плиту
  // под грунт ровно на разницу (правило главы 12). Радиус 60 при высоте 6 —
  // склон 0,15 м/м, тот же порядок, что у гряды: игла в 9 м давала бы обрыв,
  // которого в брифе нет, и ловила бы не правило, а его отсутствие
  for (const width of [8, 10, 16]) {
    const tr = ring({ width, turns: 21, minRadius: 30 });
    const s = tr.length * 0.17;
    const at = trackAxisAt(tr, s);
    const out = { x: at.x - at.tz * (width / 2 - 0.5), z: at.z + at.tx * (width / 2 - 0.5) };
    const crest = 6;
    const field = reliefOf({ baseY: 0, hills: [{ x: out.x, z: out.z, radius: 60, height: crest }] });
    const axis = field.heightAt(at.x, at.z);
    assert(crest - axis > 0.05,
      `width ${width}: гребень ${crest} лег на осевую ${axis.toFixed(3)} — проба не про борт, а про ось`);
    trackProfile(tr, field, 0);
    const p = tr.profile;
    const i = Math.round(s / p.step);
    assert(p.floor[i] >= crest - 0.02,
      `width ${width}: пол пробы ${i} = ${p.floor[i].toFixed(3)} м — корыто не взяло гребень борта`);
    assert(p.deck[i] >= crest + tr.spec.clearance - 1e-9,
      `width ${width}: полотно ${p.deck[i].toFixed(3)} м при осевой ${axis.toFixed(3)} м — гребень борта не накрыт`);
  }
});

t('шов профиля замкнут: отметка и волна сходятся в нуле петли, переломов на стыке нет', () => {
  for (const seed of [20261105, 7, 555]) {
    for (const waves of [1, 2, 3]) {
      const tr = ringP({ waves }, field12, 0, seed);
      const p = tr.profile;
      near(trackDeckAt(tr, tr.length), trackDeckAt(tr, 0), 1e-12, `seed ${seed}, waves ${waves}: отметка шва`);
      const gap = Math.abs(p.deck[0] - p.deck[p.n - 1]);
      assert(gap <= tr.spec.grade * p.step + 1e-12,
        `seed ${seed}, waves ${waves}: перепад через шов ${gap.toFixed(4)} м при пределе ${(tr.spec.grade * p.step).toFixed(4)}`);
      // волна — целое число периодов на петлю, поэтому требование в нуле и на
      // полном обходе одинаково (иначе профиль в шве разъехался бы навсегда)
      const need0 = p.floor[0] + tr.spec.clearance;
      const needL = p.floor[0] + tr.spec.clearance + tr.spec.amplitude * (1 - Math.cos(2 * Math.PI * waves)) / 2;
      near(needL, need0, 1e-12, `seed ${seed}, waves ${waves}: волна не замкнулась`);
    }
  }
});

t('съезд: нос лежит на уровне улицы, runFactor множит уклон, а не длину', () => {
  const ctx = { field: field12, ground: { y: 0, size: 600 } };
  let worst = 0;
  for (const seed of SEEDS) {
    const tr = ringP({ entries: 3 }, field12, 0, seed);
    for (const e of trackToes(tr, ctx)) {
      const t = e.toe;
      assert(t.reach > 0, `${e.id}: пролёт нуля — подъёма нет`);
      // коллинеарность и длина: нос обязан лежать на луче съезда ровно на reach.
      // Допуск — два миллиметра, а не метр: и coordinate носа, и пролёт округлены
      // до миллиметра, поэтому даже верный ответ расходится на последнее деление
      near(t.x, r3(e.x + e.dx * t.reach), 2e-3, `${e.id}: нос не на луче по x`);
      near(t.z, r3(e.z + e.dz * t.reach), 2e-3, `${e.id}: нос не на луче по z`);
      near(t.top, t.ringTop - t.slope * t.reach, 1e-3, `${e.id}: торец не на плоскости подъёма`);
      near(t.slope, tr.spec.grade / e.runFactor, 1e-12, `${e.id}: уклон не grade/runFactor`);
      assert(t.slope <= JJ.maxSlope, `${e.id}: уклон ${t.slope} круче предела схемы ${JJ.maxSlope}`);
      // главное обещание носа: он вровень с асфальтом, который его принимает
      const level = field12.heightAt(t.x, t.z) + JJ.streetRise;
      const fit = Math.abs(t.top - level);
      if (fit > worst) worst = fit;
      assert(fit <= JJ.skybridgeFit,
        `${e.id}: нос ${t.top} против улицы ${level.toFixed(3)} — ступень ${fit.toFixed(4)} м при допуске ${JJ.skybridgeFit}`);
      assert(Math.abs(t.x) < ctx.ground.size / 2 && Math.abs(t.z) < ctx.ground.size / 2, `${e.id}: нос за плиткой`);
    }
  }
  assert(worst > 0, 'ступень носа не мерилась вовсе');
});

t('съезд, не дотянувшийся до грунта за край плитки, называется ошибкой с числами', () => {
  // кольцо прижмите к востоку плитки: наружные съезды уйдут за её борты раньше,
  // чем успеют спуститься, и молчаливая геометрия «дороги в никуда» невозможна
  let err = null;
  for (const seed of SEEDS) {
    const tr = ringP({ center: [240, 0], radius: 40, minRadius: 10, turns: 8, entries: 4, amplitude: 0 }, null, 0, seed);
    try {
      trackToes(tr, { field: null, ground: { y: 0, size: 600 } });
    } catch (e) { err = String(e.message); break; }
  }
  assert(err !== null, 'ни один съезд не ушёл за плитку — проба не настроена');
  assert(/за плитку/.test(err), `ошибка не называет причину: ${err}`);
});

t('носы съездов попадают в ctx.noses до цикла районов, и сетка улицы подаётся под них', () => {
  const level = {
    kind: 'json2',
    ground: { y: 0, size: 600 },
    city: {
      seed: 20261105,
      districts: [{ id: 'd0', block: { minX: -280, maxX: 280, minZ: -280, maxZ: 280 }, street: { pitch: 60 } }],
      track: { ...TRACK_DEFAULTS, entries: 2 },
    },
  };
  const stats = {};
  const out = expandCity(structuredClone(level), stats);
  assert(out.roads.length > 0, 'район не дал улиц — проверять нечего');
  const moved = (stats.nose_line_shifted ?? 0) + (stats.nose_line_added ?? 0);
  assert(moved > 0, `сетка улиц не подавалась ни под один нос съезда: ${JSON.stringify(stats)}`);
  assert(!stats.nose_no_district, `нос съезда не нашёл район (${stats.nose_no_district} шт.) — валидатор схемы скажет то же`);
});

t('коридор съезда отбраковывает лот под подъездом — и только он', () => {
  // кольцо с длинным подъёмом (clearance 12 м → пролёт 126…170 м) и без дрожи
  // радиуса: середину луча внутреннего съезда кладём в полость петли так, чтобы
  // углы блока не дотянули до полосы самой петли. Тогда отказ с entries > 0 и
  // его отсутствие с entries: 0 доказывают именно коридор подъезда
  const seed = 20261105;
  const over = { turns: 12, radius: 120, minRadius: 60, curvatureJitter: 0, amplitude: 0, clearance: 12, entries: 4 };
  const tr = ringP(over, null, 0, seed);
  trackToes(tr, { field: null, ground: { y: 0, size: 600 } });
  const HALF = 32;   // блок 64 × 64 м: минимум для `pitch 40` — 58,2 м
  let best = null;
  for (const e of tr.entries.filter(x => x.inward)) {
    const mx = e.x + e.dx * e.toe.reach / 2, mz = e.z + e.dz * e.toe.reach / 2;
    let far = 0;
    for (const sx of [-HALF, HALF])
      for (const sz of [-HALF, HALF]) far = Math.max(far, Math.hypot(mx + sx, mz + sz));
    if (!best || far < best.far) best = { mx, mz, far };
  }
  assert(best, 'ни один из четырёх съездов не ушёл внутрь петли — проба не настроена');
  // запас 4 м от осевой: 2,1 м верги плюс метр на хорду коридора и метр на шум
  const safe = tr.spec.radius - tr.spec.width / 2 - 4;
  assert(best.far < safe,
    `блок подъезда дотянул до полосы петли: дальний угол ${best.far.toFixed(1)} м при ${safe} м — проба не изолирована`);
  const level = (entries) => ({
    kind: 'json2', ground: { y: 0, size: 600 },
    city: {
      seed,
      districts: [{
        id: 'd0', street: { pitch: 40 },
        block: { minX: r3(best.mx - HALF), maxX: r3(best.mx + HALF), minZ: r3(best.mz - HALF), maxZ: r3(best.mz + HALF) },
      }],
      track: { ...TRACK_DEFAULTS, ...over, entries },
    },
  });
  const s1 = {}, s2 = {};
  const withEntry = expandCity(structuredClone(level(4)), s1);
  const noEntry = expandCity(structuredClone(level(0)), s2);
  assert((s1.lot_in_track_band ?? 0) > 0, `лот под подъездом не отбракован: ${JSON.stringify(s1)}`);
  assert(!(s2.lot_in_track_band ?? 0),
    `без съезда лоты всё равно отбракованы коридором: ${JSON.stringify(s2)} — проба не изолирована`);
  assert(noEntry.buildings.length > 0, `блок 64 м не дал ни одного дома — контраст пустоцветен: ${JSON.stringify(s2)}`);
  assert(withEntry.buildings.length < noEntry.buildings.length,
    `с подъездом домов не стало меньше: ${withEntry.buildings.length} против ${noEntry.buildings.length}`);
});

t('профиль детерминирован и различает сиды и поле', () => {
  const a = JSON.stringify(ringP({}, field12, 0, 5).profile.deck);
  assert(a === JSON.stringify(ringP({}, field12, 0, 5).profile.deck), 'один сид — разные отметки полотна');
  assert(a !== JSON.stringify(ringP({}, field12, 0, 6).profile.deck), 'разные сиды — одна и та же петля');
  assert(a !== JSON.stringify(ringP({}, null, 0, 5).profile.deck), 'рельеф не повлиял на профиль');
});

t('разброс требования больше, чем петля берёт своим уклоном, называется ошибкой', () => {
  // гряда 30 м через всю петлю: перепад требования 26,7 м (поле плюс волна), а
  // петля радиусом 60 м — 376,5 м, и при grade 0,08 она поднимается и опускается
  // лишь на grade·L/2 = 15,1 м. Мажоранте ничего не остаётся, кроме как повесить
  // над грунтом целый этаж, — и это конфиг, а не случайность сида
  const steep = reliefOf({ baseY: 0, hills: [{ x: -300, z: 0, bx: 300, bz: 0, radius: 60, height: 30 }] });
  let err = null;
  try { ringP({ radius: 60, minRadius: 40, amplitude: 4 }, steep, 0); } catch (e) { err = String(e.message); }
  assert(err !== null, 'требование перепадает больше бюджета — а ошибки нет');
  assert(/коротка для разброса требования/.test(err), `ошибка не называет причину: ${err}`);
  // та же гряда на петле вчетверо длиннее обязана пройти: ошибка про уклон и
  // длину, а не про саму сопку (1480,3 м ⇒ бюджет 59,2 м против разброса 30,0)
  const ok = ringP({ radius: 240, amplitude: 4 }, steep, 0);
  assert(ok.profile.spread <= ok.spec.grade * ok.length / 2 + 1e-9,
    `радиус 240 м не снял отказ: разброс ${ok.profile.spread.toFixed(2)} м при бюджете ${(ok.spec.grade * ok.length / 2).toFixed(2)} м`);
  assert(ok.profile.deck.every((y, i) => y >= ok.profile.need[i] - 1e-12),
    'на длинной петле полотно ушло под требование');
});

// ------------------------------------------------------------------ эмиссия
/*
 * Этап 3: полотно в данных. Всё ниже проверяет уже **записи брифа**, а не
 * внутренний массив, потому что с этого момента потребители — схема, нормализатор
 * и движок — видят именно их.
 */

/** Специя поля главы 12 — тот же бриф, что у собранной главы. */
const FIELD12_SPEC = {
  baseY: 0,
  hills: [
    { x: -340, z: -135.5, bx: 340, bz: -135.5, radius: 344, height: -7.37 },
    { x: -340, z: -30.6, bx: 340, bz: -30.6, radius: 172, height: -2.37 },
    { x: -340, z: -36.2, bx: 340, bz: -36.2, radius: 524, height: 6.05 },
    { x: -340, z: 46.3, bx: 340, bz: 46.3, radius: 514, height: 3.66 },
    { x: -340, z: 244.6, bx: 340, bz: 244.6, radius: 360, height: 8.65 },
  ],
};

const MILD_SPEC = { baseY: 0, hills: [{ x: -300, z: 0, bx: 300, bz: 0, radius: 400, height: 6 }] };

/** Район в дальнем углу: носам съездов улица под ними не достается. */
const FAR_BLOCK = { minX: 200, maxX: 290, minZ: 200, maxZ: 290 };

const DEG = Math.PI / 180;

/** Концы элемента полотна в мире и его длина по оси. */
function deckCaps(el) {
  if (el.arc) {
    const a = el.arc, d0 = a.from * DEG, d1 = a.to * DEG;
    let d = d1 - d0;
    if (d > Math.PI) d -= 2 * Math.PI;
    if (d < -Math.PI) d += 2 * Math.PI;
    const w = Math.sign(d) || 1;
    return {
      x0: a.cx + Math.cos(d0) * a.radius, z0: a.cz + Math.sin(d0) * a.radius,
      x1: a.cx + Math.cos(d1) * a.radius, z1: a.cz + Math.sin(d1) * a.radius,
      t0x: -Math.sin(d0) * w, t0z: Math.cos(d0) * w,
      t1x: -Math.sin(d1) * w, t1z: Math.cos(d1) * w,
      y0: a.y[0], y1: a.y[1], len: a.radius * Math.abs(d), width: a.width, rails: a.rails,
    };
  }
  const pl = el.plate, rad = (pl.yaw ?? 0) * DEG, hx = pl.length / 2;
  return {
    x0: pl.x - Math.cos(rad) * hx, z0: pl.z - Math.sin(rad) * hx,
    x1: pl.x + Math.cos(rad) * hx, z1: pl.z + Math.sin(rad) * hx,
    t0x: Math.cos(rad), t0z: Math.sin(rad), t1x: Math.cos(rad), t1z: Math.sin(rad),
    y0: pl.y, y1: pl.y + (pl.rise ?? 0), len: pl.length, width: pl.width, rails: pl.rails,
  };
}

function cityLevel(block, over = {}, seed = 20261105) {
  // голый прямоугольник — это «район где угодно»: id и уклад улиц фикстура
  // дописывает сама, иначе схема бракует бриф до того, как дойдёт до трассы
  const district = block.block ? block : {
    id: 'd0', street: { pitch: 44, width: 14, grade: 0.06 }, block,
  };
  return {
    kind: 'json2',
    metadata: { levelName: 'проба', name: 'проба', hint: ' ', units: 'meters' },
    ground: { y: 0, size: 600 },
    ...(over.relief ? { relief: over.relief } : {}),
    gameplay: { goal: 'exit', spawn: { x: 0, z: 0 }, exit: { x: 0, z: 0 }, enemies: { count: 1 } },
    city: {
      seed,
      districts: [district],
      track: { ...TRACK_DEFAULTS, ...(over.track ?? {}) },
    },
  };
}

/** Разворот, точка B на пластине кольца и оба прохода проверки данных. */
function buildDeck(block, over = {}, seed = 20261105) {
  const stats = {};
  const built = expandCity(cityLevel(block, over, seed), stats);
  const ring = built.roads.find(r => r.trackRole === 'ring');
  const p = ring.elements.find(el => el.plate).plate;
  built.gameplay.exit = { x: p.x, z: p.z };
  const { errors, warnings } = validateLevel(built, LEVEL_SPEC_V2);
  const norm = normalizeLevel(structuredClone(built));
  return {
    built, stats, ring, errors, norm,
    warnings: [...warnings, ...norm.warnings.map(m => `нормализатор: ${m}`)],
    entries: built.roads.filter(r => r.trackRole === 'entry'),
  };
}

/**
 * Полотно наземной улицы в точке: нормализатор переписывает отметки прогона по
 * полю (и по террасе района), поэтому мериТЬ нос надо по `decks` нормализованной
 * дороги, а не по provisional `y` пластины в развёрнутом брифе — иначе сравнение
 * видит естественный грунт под кварталом (замер первой версии теста: нос 6,117 м
 * против «асфальта» 0,120 м на мягкой гряде).
 */
function streetTopAt(norm, x, z) {
  for (const road of norm.map.roads) {
    if (road.type !== 'ground') continue;
    for (const d of road.decks ?? []) {
      if (x < d.minX - 1e-9 || x > d.maxX + 1e-9 || z < d.minZ - 1e-9 || z > d.maxZ + 1e-9) continue;
      const span = (d.axis === 'x' ? d.maxX - d.minX : d.maxZ - d.minZ);
      if (span <= 0) return { id: road.id, top: d.topAtMin };
      const t = ((d.axis === 'x' ? x - d.minX : z - d.minZ) / span);
      return { id: road.id, top: d.topAtMin + (d.topAtMax - d.topAtMin) * t };
    }
  }
  return null;
}

/**
 * Блок, накрывающий оба носа съездов с запасом: носы берутся из сборки, где
 * района под ними нет, поэтому фикстура не зависит от того, куда сид их поставил.
 */
function noseCover(over = {}, seed = 20261105, half = 60) {
  const far = buildDeck(FAR_BLOCK, over, seed);
  const pts = far.entries.map(e => {
    const c = deckCaps(e.elements[e.elements.length - 1]);
    return { x: c.x1, z: c.z1 };
  });
  if (!pts.length) return { far, block: FAR_BLOCK };
  return {
    far,
    block: {
      id: 'd0',
      street: { pitch: 44, width: 14, grade: 0.06 },
      block: {
        minX: Math.round(Math.min(...pts.map(q => q.x)) - half),
        maxX: Math.round(Math.max(...pts.map(q => q.x)) + half),
        minZ: Math.round(Math.min(...pts.map(q => q.z)) - half),
        maxZ: Math.round(Math.max(...pts.map(q => q.z)) + half),
      },
    },
  };
}

t('полотно петли в данных: крышки стыкуются вровень, касательная не ломается, уклон в grade', () => {
  // Два разных допуска, и оба — про представление числа, а не про геометрию:
  // план крышки восстанавливается из округлённых `x`/`length`/`yaw` (0,5 мм на
  // координату плюс 1e-3° поворота на конце пролёта — замер: 1,426 мм на 60-й
  // плите), а отметка в стыке — ОДНО и то же число `fit.v`, поэтому по высоте
  // требует ровно равенства.
  const CAP_MM = 2e-3;
  const MM = 1e-3;
  const configs = [['дефолт', {}], ['мелкое кольцо', { radius: 80, turns: 8, minRadius: 30 }],
    ['без дрожи', { curvatureJitter: 0 }], ['дрожащее', { curvatureJitter: 0.49 }],
    ['крутой профиль', { grade: 0.12, amplitude: 6 }],
    // «полоса высот»: 6 м при двух волнах — самый высокий гребень, который
    // держит гейт конфигурации при дефолтном уклоне (amplitude·waves·π ≤
    // grade·L = 0,08 × 484,509 м, то есть ≤ 12,338 м·волн; 8 × 2 = 16 гейт
    // бракует, поэтому здесь не больше 6 × 2)
    ['полоса высот', { amplitude: 6, waves: 2 }]];
  for (const [label, track] of configs) {
    const grade = track.grade ?? TRACK_DEFAULTS.grade;
    for (const seed of [1, 7, 20261105, 42]) {
      const r = buildDeck(FAR_BLOCK, { track: { ...track, entries: 0 } }, seed);
      const els = r.ring.elements;
      assert(els.length >= 6, `${label}/seed ${seed}: элементов ${els.length} — полотно не собралось`);
      assert(r.errors.length === 0, `${label}/seed ${seed}: схема бракует кольцо: ${r.errors[0]}`);
      let arcs = 0, plates = 0, worstJoint = 0, worstSlope = 0;
      for (let i = 0; i < els.length; i++) {
        const a = deckCaps(els[i]), b = deckCaps(els[(i + 1) % els.length]);
        const gap = Math.hypot(a.x1 - b.x0, a.z1 - b.z0);
        worstJoint = Math.max(worstJoint, gap);
        assert(gap <= CAP_MM, `${label}/seed ${seed}, шов ${i}: крышки разошлись на ${gap.toFixed(6)} м`);
        // в стыке одно и то же число `fit.v`, но у плиты конец — сумма `y + rise`
        // двух округлённых величин, поэтому здесь не равенство, а шум
        // представления (замер: ≤ 1e-16 м); миллиметра на стыке быть не должно
        assert(Math.abs(a.y1 - b.y0) <= 1e-9,
          `${label}/seed ${seed}, шов ${i}: ступень по высоте ${Math.abs(a.y1 - b.y0).toFixed(6)} м — крышки взяли разные числа`);
        const dot = Math.max(-1, Math.min(1, a.t1x * b.t0x + a.t1z * b.t0z));
        const kink = Math.acos(dot) * 180 / Math.PI;
        // Верешина без скругления — это угол, и он легален ровно потому, что
        // `TRACK_ARC_SLIVER` сбрасывает в ноль только почти прямые вершины:
        // худший из измеренных (мелкое кольцо, seed 1) — 0,663°, дефолт — 0,063°.
        // Градус — потолок того, что глаз прочитал бы как излом на 10-м полотне
        assert(kink <= 1, `${label}/seed ${seed}, шов ${i}: излом касательной ${kink.toFixed(3)}°`);
        if (els[i].arc) arcs++; else plates++;
        const slope = Math.abs(a.y1 - a.y0) / a.len;
        worstSlope = Math.max(worstSlope, slope);
        assert(slope <= grade + 2 * MM / a.len + 1e-12,
          `${label}/seed ${seed}, элемент ${i}: уклон ${slope.toFixed(5)} м/м круче обещанного ${grade}`);
        assert(a.len >= TRACK_ARC_SLIVER, `${label}/seed ${seed}, элемент ${i}: пролёт ${a.len.toFixed(3)} м`);
        assert(a.width === r3(TRACK_DEFAULTS.width), `${label}/seed ${seed}, элемент ${i}: ширина не из брифа`);
        assert(a.rails === true, `${label}/seed ${seed}, элемент ${i}: перила потерялись`);
      }
      assert(arcs >= 3 && plates >= 3, `${label}/seed ${seed}: дуг ${arcs}, плит ${plates} — что-то не эмитилось`);
      // восстановление крышки из округлённых чисел не имеет права дать дыру,
      // которую нога заметит: `J.deckJoint` — половина метра, здесь — два
      // миллиметра наихудшего стыка (замер: 1,426 мм на 60-й плите)
      assert(worstJoint <= CAP_MM, `${label}/seed ${seed}: худший шов ${worstJoint.toFixed(6)} м`);
    }
  }
});

t('подгонка полотна: хорда держит мажоранту профиля, уклон и разброс остаются в бюджете', () => {
  for (const seed of SEEDS) {
    for (const [label, field] of [['равнина', null], ['гряда главы 12', field12]]) {
      const tr = ringP({}, field, 0, seed);
      const f = tr.fit, g = tr.spec.grade;
      assert(f, `${label}/seed ${seed}: подгонка не посчитана`);
      near(f.m, tr.elements.length, 0, `${label}/seed ${seed}: узлов подгонки против элементов`);
      for (let k = 0; k < f.m; k++) {
        near(f.s[k], tr.elements[k].s0, 1e-9, `${label}/seed ${seed}: узел ${k} не на начале элемента`);
        near(f.v[k], trackFittedAt(tr, f.s[k]), 1e-12, `${label}/seed ${seed}: узел ${k} против своей пробы`);
        // узлы подгонки не стоят на решётке профиля (шаг 2 м против длины
        // пролёта), поэтому мерить надо интерполяцией мажоранты в абсциссе узла,
        // а не ближайшей её пробой: ближайшая проба выше узла на уклоне сама по
        // себе (замер первой версии этого теста: 3,486 м против пробы 3,503 м)
        const fine = trackDeckAt(tr, f.s[k]);
        assert(f.v[k] >= fine - 1e-9,
          `${label}/seed ${seed}: узел ${k} = ${f.v[k].toFixed(3)} м ушёл под полотно профиля ${fine.toFixed(3)} м`);
      }
      // главное обещание: кусочно-линейная крышка нигде не провисает под мажоранту
      let dip = 0;
      for (let i = 0; i < 2000; i++) {
        const s = (i / 2000) * tr.length;
        dip = Math.max(dip, trackDeckAt(tr, s) - trackFittedAt(tr, s));
      }
      assert(dip <= 1e-12, `${label}/seed ${seed}: хорда провисает под полотно на ${dip.toFixed(6)} м`);
      assert(f.maxSlope <= g + 1e-12,
        `${label}/seed ${seed}: уклон после подгонки ${f.maxSlope.toFixed(5)} круче grade ${g}`);
      assert(f.spread <= g * tr.length / 2 + 1e-9,
        `${label}/seed ${seed}: разброс после подгонки ${f.spread.toFixed(3)} м при бюджете ${(g * tr.length / 2).toFixed(3)} м`);
      assert(f.liftMax > 0, `${label}/seed ${seed}: подгонка не сняла ни одного прогиба — проба ничего не меряет`);
      near(trackFittedAt(tr, -3.5), trackFittedAt(tr, tr.length - 3.5), 1e-12, `${label}/seed ${seed}: обход петли`);
    }
  }
});

t('полотно после подгонки не прячется под террасу: нос выше асфальта всегда', () => {
  // профиль читает поле СО ВСЕМИ террасами, поэтому спуск есть всегда; подиум,
  // вставший выше полотна, — конфиг, а не случайность сида, и он обязан быть
  // назван, а не превращён в пластину нулевой длины за гейтом схемы
  const tr = ringP({ entries: 1 }, null, 0, 20261105);
  const podium = reliefOf({
    baseY: 0,
    pads: [{ id: 'подиум', minX: -300, maxX: 300, minZ: -300, maxZ: 300, y: tr.fit.v[0] + 10, blend: 1 }],
  });
  let err = null;
  try { trackToes(tr, { field: null, streetField: podium, ground: { y: 0, size: 600 } }); }
  catch (e) { err = String(e.message); }
  assert(err !== null, 'съезд, начавшийся на 10 м ниже асфальта, прошёл молча');
  assert(/спускаться нечему/.test(err), `ошибка не называет причину: ${err}`);
});

t('съезды в данных: одна пластина от кольца до асфальта, торец вровень с улицей', () => {
  for (const [label, relief] of [['равнина', null], ['мягкая гряда', MILD_SPEC]]) {
    const cover = noseCover({ relief }, 20261105);
    const r = buildDeck(cover.block, { relief }, 20261105);
    assert(r.entries.length === 2, `${label}: съездов ${r.entries.length} при entries 2`);
    for (const e of r.entries) {
      assert(e.elements.length === 1 && e.elements[0].plate, `${label}/${e.id}: подъём не пластиной`);
      const p = e.elements[0].plate;
      assert(p.rise < 0, `${label}/${e.id}: подъём идёт вверх (${p.rise}) — съезд обязан спускаться`);
      assert(p.length >= 1, `${label}/${e.id}: пластина ${p.length} м — короче минимума схемы`);
      const slope = Math.abs(p.rise) / p.length;
      assert(slope <= JJ.maxSlope, `${label}/${e.id}: уклон ${slope.toFixed(4)} круче предела ${JJ.maxSlope}`);
      const cap = deckCaps(e.elements[0]);
      // торец подъёма обязан лежать в плане наземной улицы и вровень с её
      // окончательным полотном — той же отметкой, которую видит нога
      const asphalt = streetTopAt(r.norm, cap.x1, cap.z1);
      assert(asphalt, `${label}/${e.id}: нос ${cap.x1.toFixed(1)}, ${cap.z1.toFixed(1)} не в плане наземной улицы`);
      assert(Math.abs(asphalt.top - cap.y1) <= JJ.skybridgeFit,
        `${label}/${e.id}: нос ${cap.y1.toFixed(3)} м против асфальта ${asphalt.top.toFixed(3)} м (${asphalt.id}) — ступень больше допуска ${JJ.skybridgeFit}`);
    }
  }
});

t('нос на асфальте: собранный уровень не несёт ни ошибки, ни предупреждения', () => {
  for (const [label, relief] of [['равнина', null], ['мягкая гряда', MILD_SPEC]]) {
    for (const seed of [2, 3, 5, 8]) {
      const cover = noseCover({ relief }, seed);
      const r = buildDeck(cover.block, { relief }, seed);
      assert(r.errors.length === 0, `${label}/seed ${seed}: ошибок ${r.errors.length} — ${r.errors[0]}`);
      assert(r.warnings.length === 0, `${label}/seed ${seed}: предупреждений ${r.warnings.length} — ${r.warnings[0]}`);
      assert(r.stats.district_crossed_by_track > 0, `${label}/seed ${seed}: кольцо не пересекло район — фикстура не о том`);
      assert((r.stats.nose_line_added ?? 0) + (r.stats.nose_line_shifted ?? 0) > 0,
        `${label}/seed ${seed}: сетка улиц не подавалась под носы: ${JSON.stringify(r.stats)}`);
      // оценка террасы по центру блока не обязана сойтись с ядром квартала
      // миллиметр в миллиметр: на гряде 0,05 м/м через 268-й блок ошибка —
      // десятки дециметров, и residual назван счётчиком. Требование честное:
      // на равнине их нет вовсе, на рельефе — доли процента проб полотна
      const under = r.stats.track_deck_under_terrace ?? 0;
      const limit = label === 'равнина' ? 0 : 20;   // 20 проб из ~400 (5 %)
      assert(under <= limit,
        `${label}/seed ${seed}: ${under} проб полотна под террасой при пределе ${limit} — кольцо закопано в насыпь`);
    }
  }
});

t('район не в том месте: свободные носы названы и схемой, и счётчиками', () => {
  const r = buildDeck(FAR_BLOCK, {}, 2);
  assert(r.errors.length === 2, `ожидалось два свободных носа, получила ошибок ${r.errors.length}: ${r.errors[0] ?? '—'}`);
  assert(/не находит наземную улицу/.test(r.errors[0]), `схема назвала не то: ${r.errors[0]}`);
  assert(r.stats.track_nose_off_street === 2, `счётчик носа вне улицы: ${JSON.stringify(r.stats)}`);
  assert(r.stats.nose_no_district === 2, `счётчик носа вне района: ${JSON.stringify(r.stats)}`);
  // обратная сторона: тот же сид, но блок накрывает носы — счётчиков нет
  const near = buildDeck(noseCover({}, 2).block, {}, 2);
  assert(!(near.stats.track_nose_off_street > 0) && !(near.stats.nose_no_district > 0),
    `район под носами, а счётчики остались: ${JSON.stringify(near.stats)}`);
});

t('оценка террасы против собранной: расхождение названо счётчиком', () => {
  // район на 268 × 354 м через всю гряду главы 12: ядро террасы поднимает грунт
  // выше, чем оценка по центру блока, и и нос, и полотно обязаны это показать
  const cover = noseCover({ relief: FIELD12_SPEC }, 1);
  const r = buildDeck(cover.block, { relief: FIELD12_SPEC }, 1);
  assert((r.stats.track_toe_moved ?? 0) > 0,
    `пролёт съезда не сдвинулся ни на полметра на 300-м блоке: ${JSON.stringify(r.stats)}`);
  assert((r.stats.track_deck_under_terrace ?? 0) > 0,
    `полотно не ушло под террасу на крутом поле — проба не настроена: ${JSON.stringify(r.stats)}`);
  // на равнине тех же счётчиков быть не может
  const flat = buildDeck(noseCover({}, 1).block, {}, 1);
  assert(!(flat.stats.track_toe_moved > 0) && !(flat.stats.track_deck_under_terrace > 0),
    `на равнине счётчики террасы всё равно сработали: ${JSON.stringify(flat.stats)}`);
});

t('отметки кольца не зависят от районов, пока съездов нет', () => {
  const a = buildDeck(FAR_BLOCK, { track: { entries: 0 } }, 7);
  const b = buildDeck({
    id: 'd0', street: { pitch: 44, width: 14, grade: 0.06 },
    block: { minX: -250, maxX: -100, minZ: -250, maxZ: -100 },
  }, { track: { entries: 0 } }, 7);
  assert(JSON.stringify(a.ring.elements) === JSON.stringify(b.ring.elements),
    'полотно петли поехало от того, где стоит квартал (при съездах 0 и равнине поле ему не указ)');
  // и наоборот: рельеф обязан двигать полотно — иначе «поле нужно на шаге 2» ложь
  const hilly = buildDeck(FAR_BLOCK, { relief: MILD_SPEC, track: { entries: 0 } }, 7);
  assert(JSON.stringify(hilly.ring.elements) !== JSON.stringify(a.ring.elements),
    'гряда не повлияла на отметки полотна');
  // два разных сида — два разных полотна
  const other = buildDeck(FAR_BLOCK, { track: { entries: 0 } }, 42);
  assert(JSON.stringify(other.ring.elements) !== JSON.stringify(a.ring.elements),
    'сид не повлиял на полотно');
});

console.log(`\n${passed}/${passed + failures.length} проверок зелёные`);
if (failures.length) {
  console.log(`провалено: ${failures.join(', ')}`);
  process.exitCode = 1;
}
