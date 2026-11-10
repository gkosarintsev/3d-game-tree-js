/**
 * Плавный рельеф главы (`docs/level12-relief-plan.md`).
 *
 * Поле — одна аналитическая функция на пробу: сумма капсульных холмов плюс
 * площадки-«пэды» под домами и улицами. Модуль общий для обоих берегов
 * пайплайна: парсер (Node) релаксирует по нему отметки пэдов и ставит опоры,
 * карта (браузер) строит по нему грунт, луч и сферу. Другого варианта нет:
 * две реализации поля разошлись бы на первом же холме, а картинка перестала бы
 * совпадать с опорой — ровно то, за чем в проекте следит правило со-плоскостных
 * швов.
 *
 * Почему аналитика, а не растр высот: модуль главы с генератором — 1,9 МБ, и сетка 100 × 100
 * отметок добавила бы ещё десятки килобайт плюс второй источник правды, который
 * обязан сходиться с первым после каждой правки брифа.
 */
import { CONFIG } from './config.js';
import { frameAt, rotatedBounds } from './geo2d.js';

const J = CONFIG.jsonMap;

/** Гладкий подъём от 0 к 1 с нулевыми производными на обоих концах. */
const ease = t => t * t * (3 - 2 * t);

/**
 * Предварительное выравнивание ландшафта под дорогой и запрос близости к
 * коридору. Ближайшая проекция на ломаную оси даёт поперечное расстояние.
 * Режимы: обычный — отметка цели берётся из профиля коридора (интерполяция
 * `y` точек); поперечное выравнивание (`crossLevel`) — цель это отметка
 * природного поля в проекции на ось, поэтому дорога продольно следует рельефу,
 * а поперёк под полотном становится горизонтальной. Под полотном отметка
 * плоская, на обочине — мягкий уклон, дальше — плавный переход к природному
 * полю точки.
 */
function buildRoadTool(corridors, naturalAt) {
  if (!corridors?.length) return null;
  const segs = [];
  for (const c of corridors) {
    const pts = c.points ?? [];
    const hw = (c.width ?? 8) / 2;
    const shoulder = c.shoulder ?? J.relief.roadShoulder ?? 2;
    const blend = c.blend ?? J.relief.roadBlend ?? 10;
    const reach = hw + shoulder + blend;
    const crossLevel = !!c.crossLevel;
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], b = pts[i + 1];
      const dx = b.x - a.x, dz = b.z - a.z;
      const L = Math.hypot(dx, dz);
      if (L < 1e-6) continue;
      const tx = dx / L, tz = dz / L;
      segs.push({
        ax: a.x, az: a.z, ay: a.y ?? 0, by: b.y ?? 0,
        tx, tz, L, hw, shoulder, blend, reach, crossLevel,
        minX: Math.min(a.x, b.x) - reach, maxX: Math.max(a.x, b.x) + reach,
        minZ: Math.min(a.z, b.z) - reach, maxZ: Math.max(a.z, b.z) + reach,
      });
    }
  }
  if (!segs.length) return null;
  const cell = J.planGrid || 24;
  const buckets = new Map();
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    const i0 = Math.floor(s.minX / cell), i1 = Math.floor((s.maxX - 1e-9) / cell);
    const j0 = Math.floor(s.minZ / cell), j1 = Math.floor((s.maxZ - 1e-9) / cell);
    for (let j = j0; j <= j1; j++) for (let ii = i0; ii <= i1; ii++) {
      const k = (ii + 4096) * 8192 + (j + 4096);
      const bkt = buckets.get(k);
      if (bkt) bkt.push(i); else buckets.set(k, [i]);
    }
  }
  const atCell = (x, z) => buckets.get((Math.floor(x / cell) + 4096) * 8192 + (Math.floor(z / cell) + 4096));
  const nearest = (x, z) => {
    const list = atCell(x, z);
    if (!list) return null;
    let bestD2 = Infinity, best = null, bestRoadY = 0;
    for (let k = 0; k < list.length; k++) {
      const s = segs[list[k]];
      const u = Math.max(0, Math.min(1, ((x - s.ax) * s.tx + (z - s.az) * s.tz) / s.L));
      const px = s.ax + s.tx * s.L * u;
      const pz = s.az + s.tz * s.L * u;
      const d2 = (x - px) * (x - px) + (z - pz) * (z - pz);
      if (d2 < bestD2) {
        bestD2 = d2; best = s;
        bestRoadY = s.crossLevel ? naturalAt(px, pz) : (s.ay + (s.by - s.ay) * u);
      }
    }
    return best ? { s: best, d: Math.sqrt(bestD2), roadY: bestRoadY } : null;
  };
  const grade = (x, z, natural) => {
    const n = nearest(x, z);
    if (!n) return natural;
    const { s, d } = n;
    if (d >= s.reach) return natural;
    const bestRoadY = n.roadY;
    if (d <= s.hw) return bestRoadY;
    if (d <= s.hw + s.shoulder) {
      const t = (d - s.hw) / s.shoulder;
      return bestRoadY - t * 0.05;
    }
    const edge = bestRoadY - 0.05;
    const t = (d - (s.hw + s.shoulder)) / s.blend;
    const w = t * t * (3 - 2 * t);
    return edge * (1 - w) + natural * w;
  };
  /** Ближайшее расстояние до оси коридора и его зона влияния (для измельчения меша). */
  const roadAt = (x, z) => {
    const n = nearest(x, z);
    return n ? { d: n.d, reach: n.s.reach } : null;
  };
  return { grade, roadAt };
}

/**
 * Вклад холма: `height · ease(1 − d/radius)`. `ease` даёт ноль производной на
 * вершине (плоское плато, на котором дом стоит ровно) и на краю (нет излома
 * там, где холм кончается), поэтому поле C¹, а нога не встречает уступ.
 * Отрицательная высота — тот же холм наоборот: долина, провал, карьер.
 *
 * `d²` считается до извлечения корня и сравнивается с `r²`: промах мимо
 * капсулы — самый частый ответ и в пределах клетки индекса (холм раздут в неё
 * габаритом, а точка лежит в углу), а `Math.hypot` на каждом промахе стоил бы
 * дороже самого вклада. На попадании корень тоже один и тоже из `d²`: `hypot`
 * в V8 не инлайнится (он страхует переполнение, которого здесь нет — координаты
 * главы не больше 300 м) и на четырёх гигантских капсулах базовой «природы»,
 * попадающих в каждую клетку, стоил каждому пробы поля лишних долей микросекунды.
 * Деление на `len2` заменено умножением на предпосчитанное обратное — тот же
 * отсчёт, один раз на холм вместо раза на пробу.
 */
function hillAt(h, x, z) {
  const dx = x - h.x;
  const dz = z - h.z;
  const t = h.len2 > 0 ? Math.max(0, Math.min(1, (dx * h.abx + dz * h.abz) * h.inv)) : 0;
  const px = dx - t * h.abx;
  const pz = dz - t * h.abz;
  const d2 = px * px + pz * pz;
  return d2 >= h.r2 ? 0 : h.height * ease(1 - Math.sqrt(d2) / h.radius);
}

/**
 * Вес пэда в точке: 1 внутри прямоугольника, 0 за `blend`, между ними — та же
 * `ease`, чтобы переход площадки в склон не имел излома. Поворот — тот же кадр
 * `frameAt`, что у дома и пластины настила: косая площадка и косой корпус
 * обязаны иметь одинаковую геометрию плана.
 *
 * Разворот и проверку делает арифметикой кадра, а не `unrotatePoint`: этот
 * счётчик зовётся с каждой площадки кармана на каждую пробу поля, и
 * объект-координата на каждый вызов означал бы мусор в GC там, где меряется
 * бюджет опоры. Квадрат расстояния до угла сравнивается с квадратом `blend` до
 * извлечения корня: промах мимо кольца — самый частый ответ.
 */
function padWeight(p, x, z) {
  let lx = x, lz = z;
  if (p.frame) {
    const f = p.frame, dx = x - f.cx, dz = z - f.cz;
    lx = f.cx + dx * f.c + dz * f.s;
    lz = f.cz - dx * f.s + dz * f.c;
  }
  const dx = Math.max(lx - p.maxX, p.minX - lx, 0);
  const dz = Math.max(lz - p.maxZ, p.minZ - lz, 0);
  const d2 = dx * dx + dz * dz;
  if (d2 >= p.blend * p.blend) return 0;
  return ease(1 - Math.sqrt(d2) / p.blend);
}

/**
 * Поле высот главы.
 *
 * @param {object} spec секция `relief` брифа (или её нормализованный вид)
 * @returns {{baseY:number, hills:object[], pads:object[], blend:number,
 *   present:boolean, reliefHeightAt:function, padsAt:function, heightAt:function,
 *   slopeAt:function, normalAt:function}}
 */
export function reliefOf(spec = {}) {
  const baseY = spec.baseY ?? 0;
  const blend = spec.blend ?? J.relief.blend;
  // Холм хранит разницу концов оси, обратное к её квадрату и квадрат радиуса:
  // `hillAt` зовётся с каждой пробы поля, и деление на `len2` плюс `hypot` на
  // каждый вызов стоили бы доли микросекунды там, где хватает умножений.
  // `id` — ради метки `debugIds()`.
  const hills = (spec.hills ?? []).map((h, i) => {
    const bx = h.bx ?? h.x, bz = h.bz ?? h.z;
    const abx = bx - h.x, abz = bz - h.z;
    const len2 = abx * abx + abz * abz;
    return {
      id: h.id, x: h.x, z: h.z, bx, bz,
      abx, abz, len2, inv: len2 > 0 ? 1 / len2 : 0,
      radius: h.radius, r2: h.radius * h.radius,
      height: h.height,
      order: i,
    };
  });
  const pads = (spec.pads ?? []).map((p, i) => ({
    id: p.id,
    minX: p.minX, maxX: p.maxX, minZ: p.minZ, maxZ: p.maxZ,
    y: p.y,
    blend: p.blend ?? blend,
    frame: p.yaw ? frameAt((p.minX + p.maxX) / 2, (p.minZ + p.maxZ) / 2, p.yaw) : null,
    order: i,
  }));

  /**
   * Индекс влияния: в клетку попадает раздутый план объекта — кольцо `blend` у
   * площадки, радиус у холма, — и проба смотрит только объекты своего кармана.
   * Без него перебор всех площадок (их на главе с кварталами сотни) и всех
   * холмов на каждую клетку решётки узлов — это сотни тысяч проверок на районе.
   * Клетка — `relief.cell` (по умолчанию шаг индекса планов), точный вклад по-
   *прежнему решает `padWeight` / `hillAt`.
   *
   * Ключ клетки — число, как `SolidField._key` (src/solids.js), а не строка
   * `` `${i}:${j}` ``: `heightAt` зовётся на каждую клетку решётки навигации, на
   * каждый шаг марша луча и на каждую вершину меша грунта — на главе 600 × 600 м
   * это сотни тысяч проб, и строка на каждую означала бы мусор в GC ровно там,
   * где меряется бюджет опоры.
   *
   * Порядок списка — порядок записей в данных (`order`), поэтому индекс не
   * меняет ни последовательное смешение площадок, ни сумму холмов: он убирает
   * только слагаемые с нулевым весом, а `h + 0` есть `h`.
   */
  const cell = spec.cell ?? J.planGrid;
  const EMPTY = [];
  const buildIndex = (items, boxOf) => {
    const buckets = new Map();
    for (const it of items) {
      const box = boxOf(it);
      // `− 1e-9` на max, как в rasterRect: грань прямоугольника, легшая ровно на
      // границу клетки, не должна добавлять column'у за собой
      const i0 = Math.floor((box.minX - box.pad) / cell);
      const i1 = Math.floor((box.maxX + box.pad - 1e-9) / cell);
      const j0 = Math.floor((box.minZ - box.pad) / cell);
      const j1 = Math.floor((box.maxZ + box.pad - 1e-9) / cell);
      for (let j = j0; j <= j1; j++) {
        for (let i = i0; i <= i1; i++) {
          const key = (i + 4096) * 8192 + (j + 4096);
          const bucket = buckets.get(key);
          if (bucket) bucket.push(it);
          else buckets.set(key, [it]);
        }
      }
    }
    for (const list of buckets.values()) list.sort((a, b) => a.order - b.order);
    // общий пустой список на промах: `.get(...) ?? []` на каждую пробу значил бы
    // массив-мусор там, где поля нет вовсе (а таких проб на главе — большинство)
    return (x, z) => buckets.get(
      (Math.floor(x / cell) + 4096) * 8192 + (Math.floor(z / cell) + 4096)) ?? EMPTY;
  };
  const padsAtCell = buildIndex(pads, p => {
    const world = p.frame ? rotatedBounds(p, p.frame) : p;
    return { minX: world.minX, maxX: world.maxX, minZ: world.minZ, maxZ: world.maxZ, pad: p.blend };
  });
  const hillsAtCell = buildIndex(hills, h => ({
    minX: Math.min(h.x, h.bx), maxX: Math.max(h.x, h.bx),
    minZ: Math.min(h.z, h.bz), maxZ: Math.max(h.z, h.bz), pad: h.radius,
  }));

  // Речные вырезы: ландшафт строится ОТ РЕКИ. На берегу (край русла, halfW от
  // оси) высота = bankY (постоянный низкий уровень берега), от берега рельеф идёт
  // только вверх — плавный подъём к отметке холмов за шириной перехода ramp.
  // Внутри русла отметка подавляется до bedY (картина/опора русла перекрывают
  // канал, но поле само не должно поднимать воду холмом).
  const rivers = (spec.rivers ?? []).map(rv => {
    const segs = (rv.segments ?? []).map(s => {
      const dx = s.bx - s.ax, dz = s.bz - s.az;
      const L = Math.hypot(dx, dz) || 1;
      return { ax: s.ax, az: s.az, tx: dx / L, tz: dz / L, L, halfW: rv.halfW ?? 0 };
    });
    return {
      bankY: rv.bankY ?? baseY,
      bedY: rv.bedY ?? (rv.bankY ?? baseY) - 2,
      surfaceY: rv.surfaceY ?? (rv.bankY ?? baseY) - 0.2,
      halfW: rv.halfW ?? 0,
      ramp: rv.ramp ?? 40,
      segs,
    };
  });
  // индекс сегментов рек по клеткам (с раздутием на ramp+halfW)
  let riverAtCell = null;
  if (rivers.length) {
    const buckets = new Map();
    rivers.forEach((rv) => rv.segs.forEach((s) => {
      const ref = { rv, s };
      const minX = Math.min(s.ax, s.ax+s.tx*s.L)-s.halfW-rv.ramp, maxX = Math.max(s.ax, s.ax+s.tx*s.L)+s.halfW+rv.ramp;
      const minZ = Math.min(s.az, s.az+s.tz*s.L)-s.halfW-rv.ramp, maxZ = Math.max(s.az, s.az+s.tz*s.L)+s.halfW+rv.ramp;
      const i0=Math.floor(minX/cell), i1=Math.floor((maxX-1e-9)/cell), j0=Math.floor(minZ/cell), j1=Math.floor((maxZ-1e-9)/cell);
      for(let j=j0;j<=j1;j++) for(let i=i0;i<=i1;i++){ const k=(i+4096)*8192+(j+4096); const b=buckets.get(k); if(b)b.push(ref); else buckets.set(k,[ref]); }
    }));
    riverAtCell = (x,z) => buckets.get((Math.floor(x/cell)+4096)*8192+(Math.floor(z/cell)+4096)) ?? EMPTY;
  }
  const riverAt = riverAtCell ? (x, z) => {
    let best = Infinity, rv = null, hw = 0;
    const list = riverAtCell(x, z);
    if (!list.length) return null;
    for (let k = 0; k < list.length; k++) {
      const { rv: r, s } = list[k];
      const u = Math.max(0, Math.min(s.L, (x - s.ax) * s.tx + (z - s.az) * s.tz));
      const d = Math.hypot(x - (s.ax + s.tx * u), z - (s.az + s.tz * u));
      if (d < best) { best = d; rv = r; hw = s.halfW; }
    }
    // полуширина у сегмента, а не у реки: у будущих русел с переменной шириной
    // берег обязан считаться от того сегмента, который ближе
    const d = best - hw;
    return d < rv.ramp ? { d, rv } : null;
  } : null;
  const distRiver = riverAt;

  /** Природное поле без площадок и без дорожных коридоров: холмы и речной вырез. */
  const naturalBaseAt = (x, z) => {
    let y = baseY;
    const hl = hillsAtCell(x, z);
    for (let k = 0; k < hl.length; k++) y += hillAt(hl[k], x, z);
    if (distRiver) {
      const dr = distRiver(x, z);
      if (dr) {
        if (dr.d <= 0) return dr.rv.bedY; // в русле — дно
        const t = ease(dr.d / dr.rv.ramp); // 0 на берегу, 1 на конце перехода
        y = dr.rv.bankY + (Math.max(y, dr.rv.bankY) - dr.rv.bankY) * t;
      }
    }
    return y;
  };

  const roadTool = buildRoadTool(spec.roadCorridors ?? spec.corridors, naturalBaseAt);
  const roadGradeRaw = roadTool?.grade ?? null;
  const roadAt = roadTool?.roadAt ?? null;
  // Дорожное выравнивание меняет только природный склон: внутри площадки/её
  // перехода отметку задаёт сама площадка, и срез/подсыпка коридора здесь не
  // должна ломать валидированный уклон кольца (иначе дорога рядом с террасой
  // порождает предупреждение «не хватает переходной зоны»).
  const roadGrade = roadGradeRaw ? (x, z, natural) => {
    for (const p of padsAtCell(x, z)) if (padWeight(p, x, z) > 0) return natural;
    return roadGradeRaw(x, z, natural);
  } : null;

  /**
   * Отметка «природы» — земля без площадок: холмы и долины над `baseY`, речной
   * вырез и предварительное выравнивание под дорогами. Дно русла остаётся дном:
   * коридор не поднимает его.
   */
  const reliefHeightAt = (x, z) => {
    let y = naturalBaseAt(x, z);
    if (roadGrade && !(distRiver && (distRiver(x, z)?.d ?? 1) <= 0)) y = roadGrade(x, z, y);
    return y;
  };

  /**
   * Площадки, чьё влияние в точке nonzero: и сама площадка, и её вес. Порядок —
   * порядок записей в данных, поэтому и поле детерминировано.
   */
  const padsAt = (x, z) => {
    const out = [];
    for (const p of padsAtCell(x, z)) {
      const w = padWeight(p, x, z);
      if (w > 0) out.push({ pad: p, weight: w });
    }
    return out;
  };

  /**
   * Пэды накладываются последовательно: `h ← h + (pad.y − h) · вес`. Максимум по
   * весу тут не годится: площадка дома законно лежит внутри площадки квартала,
   * у внешней площадки вес в её ядре равен 1, и «победа по весу» оставила бы
   * дом стоять на отметке улицы со ступенькой ровно на границе ядра дома.
   * Последовательное смешение даёт ту же отметку в ядре последней площадки и
   * непрерывный профиль там, где кольца перекрываются.
   *
   * Разрыв остаётся возможен только на противоречивых данных: ядра двух
   * площадок разной высоты пересекаются — значит дом встал в тело улицы, и это
   * брак по валидатору (этап 2), а не поле, которое нужно сглаживать.
   */
  const heightAt = (x, z) => {
    let y = naturalBaseAt(x, z);
    if (roadGrade && !(distRiver && (distRiver(x, z)?.d ?? 1) <= 0)) y = roadGrade(x, z, y);
    const list = padsAtCell(x, z);
    for (let k = 0; k < list.length; k++) {
      const pad = list[k];
      const w = padWeight(pad, x, z);
      if (w > 0) y += (pad.y - y) * w;
    }
    return y;
  };

  /**
   * Уклон поля в точке — центральные разности. Аналитическую производную
   * `ease` давать не будем: она обязана совпасть с тем, что реально видит нога
   * и меш, а те берут `heightAt` на сетке. Шаг — из `J.relief`, чтобы и парсер,
   * и карта считали один и тот же градиент.
   */
  const eps = J.relief.normalEps;
  const slopeAt = (x, z) => {
    const dx = (heightAt(x + eps, z) - heightAt(x - eps, z)) / (2 * eps);
    const dz = (heightAt(x, z + eps) - heightAt(x, z - eps)) / (2 * eps);
    return { dx, dz, mag: Math.hypot(dx, dz) };
  };

  /** Нормаль поля (мировая ось Y вверх) — для выталкивания сферы по склону. */
  const normalAt = (x, z) => {
    const s = slopeAt(x, z);
    const len = Math.hypot(s.dx, 1, s.dz);
    return { x: -s.dx / len, y: 1 / len, z: -s.dz / len };
  };

  const corridors = spec.roadCorridors ?? spec.corridors ?? [];
  return {
    baseY, hills, pads, blend, corridors,
    present: hills.length > 0 || pads.length > 0 || !!roadGrade,
    reliefHeightAt, padsAt, heightAt, slopeAt, normalAt,
    rivers, riverAt, roadAt,
  };
}
