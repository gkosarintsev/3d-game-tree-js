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
import {
  TRACK_DEFAULTS, TRACK_ARC_MIN, trackSpec, trackCenterline, trackAxisAt, expandCity,
  trackProfile, trackToes, trackDeckAt,
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
        // при `TRACK_ARC_MIN` 2 м и худший поворот 152,1°)
        for (let i = 0; i < turns; i++) {
          assert(tr.R[i] >= TRACK_ARC_MIN,
            `seed ${seed}, jitter ${jitter}, turns ${turns}: вершина ${i} осталась углом (R ${tr.R[i]})`);
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

  // дороги района от трассы не зависят: коридор блокирует лоты, но не улицы,
  // и осевой район остаётся прежним кварталом под поднятым настилом
  const ids = out => out.roads.map(r => r.id).join(',');
  const track = LEVEL({ track: { radius: 60, turns: 5, minRadius: 30, entries: 0, amplitude: 1, waves: 1, clearance: 2 } });
  const statsTrack = {};
  const builtTrack = expandCity(structuredClone(track), statsTrack);
  assert(ids(builtPlain) === ids(builtTrack), 'ids улиц района изменились из-за секции track');
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

console.log(`\n${passed}/${passed + failures.length} проверок зелёные`);
if (failures.length) {
  console.log(`провалено: ${failures.join(', ')}`);
  process.exitCode = 1;
}
