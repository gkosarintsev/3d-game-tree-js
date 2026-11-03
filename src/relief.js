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
 * Почему аналитика, а не растр высот: `level-10.js` — 1,9 МБ, и сетка 100 × 100
 * отметок добавила бы ещё десятки килобайт плюс второй источник правды, который
 * обязан сходиться с первым после каждой правки брифа.
 */
import { CONFIG } from './config.js';
import { cellKey, frameAt, rasterRect, rotatedBounds, unrotatePoint } from './geo2d.js';

const J = CONFIG.jsonMap;

/** Гладкий подъём от 0 к 1 с нулевыми производными на обоих концах. */
const ease = t => t * t * (3 - 2 * t);

/**
 * Расстояние от точки до отрезка в плане. Холм — капсула, а не круг: гряда
 * («отдельные возвышенности» района) остаётся одной записью, и между её концами
 * нет седла, которого автор не просил.
 */
function segDist(x, z, ax, az, bx, bz) {
  const dx = bx - ax;
  const dz = bz - az;
  const len2 = dx * dx + dz * dz;
  const t = len2 > 0 ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / len2)) : 0;
  return Math.hypot(x - (ax + t * dx), z - (az + t * dz));
}

/**
 * Вклад холма: `height · ease(1 − d/radius)`. `ease` даёт ноль производной на
 * вершине (плоское плато, на котором дом стоит ровно) и на краю (нет излома
 * там, где холм кончается), поэтому поле C¹, а нога не встречает уступ.
 * Отрицательная высота — тот же холм наоборот: долина, провал, карьер.
 */
function hillAt(h, x, z) {
  const d = segDist(x, z, h.x, h.z, h.bx, h.bz);
  return d >= h.radius ? 0 : h.height * ease(1 - d / h.radius);
}

/**
 * Вес пэда в точке: 1 внутри прямоугольника, 0 за `blend`, между ними — та же
 * `ease`, чтобы переход площадки в склон не имел излома. Поворот — тот же кадр
 * `frameAt`, что у дома и пластины настила: косая площадка и косой корпус
 * обязаны иметь одинаковую геометрию плана.
 */
function padWeight(p, x, z) {
  const l = p.frame ? unrotatePoint(p.frame, x, z) : { x, z };
  const dx = Math.max(l.x - p.maxX, p.minX - l.x, 0);
  const dz = Math.max(l.z - p.maxZ, p.minZ - l.z, 0);
  const dist = Math.hypot(dx, dz);
  return dist >= p.blend ? 0 : ease(1 - dist / p.blend);
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
  const hills = (spec.hills ?? []).map(h => ({
    x: h.x, z: h.z,
    bx: h.bx ?? h.x, bz: h.bz ?? h.z,
    radius: h.radius,
    height: h.height,
  }));
  const pads = (spec.pads ?? []).map((p, i) => ({
    minX: p.minX, maxX: p.maxX, minZ: p.minZ, maxZ: p.maxZ,
    y: p.y,
    blend: p.blend ?? blend,
    frame: p.yaw ? frameAt((p.minX + p.maxX) / 2, (p.minZ + p.maxZ) / 2, p.yaw) : null,
    order: i,
  }));

  /**
   * Индекс площадок: кольцо blend раздувает прямоугольник площадки в зону её
   * влияния, и перебор всех площадок на каждую пробу решётки узлов — это сотни
   * тысяч проверок на районе. Клетка — `relief.cell` (по умолчанию шаг индекса
   * планов), в неё попадает раздутый план, поэтому проба смотрит только
   * площадки своего кармана; точный вес по-прежнему решает `padWeight`.
   */
  const cell = spec.cell ?? J.planGrid;
  const buckets = new Map();
  for (const p of pads) {
    const world = p.frame ? rotatedBounds(p, p.frame) : p;
    const zone = {
      minX: world.minX - p.blend, maxX: world.maxX + p.blend,
      minZ: world.minZ - p.blend, maxZ: world.maxZ + p.blend,
    };
    for (const key of rasterRect(zone, cell)) {
      const bucket = buckets.get(key);
      if (bucket) bucket.push(p);
      else buckets.set(key, [p]);
    }
  }
  for (const list of buckets.values()) list.sort((a, b) => a.order - b.order);
  const bucketAt = (x, z) => buckets.get(cellKey(Math.floor(x / cell), Math.floor(z / cell))) ?? [];

  /** Отметка «природы» — земля без площадок: только холмы и долины над `baseY`. */
  const reliefHeightAt = (x, z) => {
    let y = baseY;
    for (const h of hills) y += hillAt(h, x, z);
    return y;
  };

  /**
   * Площадки, чьё влияние в точке nonzero: и сама площадка, и её вес. Порядок —
   * порядок записей в данных, поэтому и поле детерминировано.
   */
  const padsAt = (x, z) => {
    const out = [];
    for (const p of bucketAt(x, z)) {
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
    let y = reliefHeightAt(x, z);
    for (const { pad, weight } of padsAt(x, z)) y += (pad.y - y) * weight;
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

  return {
    baseY, hills, pads, blend,
    present: hills.length > 0 || pads.length > 0,
    reliefHeightAt, padsAt, heightAt, slopeAt, normalAt,
  };
}
