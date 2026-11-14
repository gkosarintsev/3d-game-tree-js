/**
 * Чистая математика сетки (1-2-5) и подписей координат.
 * Без Three/DOM — тестируется в node:test.
 */

/**
 * Шаг "красивой" сетки 1-2-5 для заданного сырого шага в метрах.
 * @param {number} raw
 * @returns {number}
 */
export function nice125(raw) {
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  const exp = Math.floor(Math.log10(raw));
  const base = 10 ** exp;
  const f = raw / base;
  let nice;
  if (f <= 1) nice = 1;
  else if (f <= 2) nice = 2;
  else if (f <= 2.5) nice = 2.5;
  else if (f <= 5) nice = 5;
  else nice = 10;
  return nice * base;
}

/**
 * Авто-шаг: ~90 px между основными линиями.
 * @param {number} metersPerPixel
 * @param {number} [targetPx=90]
 * @returns {number}
 */
export function autoStep(metersPerPixel, targetPx = 90) {
  return nice125(Math.max(1e-6, metersPerPixel) * targetPx);
}

/**
 * Формат подписи координаты (метры / км).
 * @param {number} v
 * @returns {string}
 */
export function formatCoord(v) {
  const av = Math.abs(v);
  if (av >= 10000) {
    const km = v / 1000;
    const s = Number.isInteger(km) ? String(km) : String(Math.round(km * 10) / 10);
    return `${s} км`;
  }
  if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
  return String(Math.round(v * 10) / 10);
}

/**
 * Генерация линий сетки в мировых координатах.
 * @param {{minX:number,maxX:number,minZ:number,maxZ:number}} extent
 * @param {number} step основной шаг
 * @param {number} [minorDiv=5] делитель малых линий
 * @returns {{major:Array<{axis:'x'|'z',v:number}>, minor:Array<{axis:'x'|'z',v:number}>, axes:Array<{axis:'x'|'z',v:number}>}}
 */
export function buildGridLines(extent, step, minorDiv = 5) {
  const major = [];
  const minor = [];
  const axes = [];
  const minorStep = step / minorDiv;
  const startX = Math.floor(extent.minX / minorStep) * minorStep;
  const endX = Math.ceil(extent.maxX / minorStep) * minorStep;
  const startZ = Math.floor(extent.minZ / minorStep) * minorStep;
  const endZ = Math.ceil(extent.maxZ / minorStep) * minorStep;
  const isMajor = (v) => Math.abs(v / step - Math.round(v / step)) < 1e-6;
  for (let v = startX; v <= endX + minorStep * 0.5; v += minorStep) {
    const rv = Math.round(v * 1e6) / 1e6;
    if (Math.abs(rv) < 1e-9) { axes.push({ axis: 'x', v: 0 }); continue; }
    if (isMajor(rv)) major.push({ axis: 'x', v: rv }); else minor.push({ axis: 'x', v: rv });
  }
  for (let v = startZ; v <= endZ + minorStep * 0.5; v += minorStep) {
    const rv = Math.round(v * 1e6) / 1e6;
    if (Math.abs(rv) < 1e-9) { axes.push({ axis: 'z', v: 0 }); continue; }
    if (isMajor(rv)) major.push({ axis: 'z', v: rv }); else minor.push({ axis: 'z', v: rv });
  }
  // гарантируем оси даже если не попали в цикл
  if (!axes.some(a => a.axis === 'x')) axes.push({ axis: 'x', v: 0 });
  if (!axes.some(a => a.axis === 'z')) axes.push({ axis: 'z', v: 0 });
  return { major, minor, axes };
}

/**
 * Подписи по краям видимой области/плиты.
 * @param {{minX:number,maxX:number,minZ:number,maxZ:number}} extent
 * @param {number} step
 * @returns {Array<{v:number,axis:'x'|'z'}>}
 */
export function gridLabels(extent, step) {
  const out = [];
  const startX = Math.ceil(extent.minX / step) * step;
  for (let v = startX; v <= extent.maxX + step * 0.5; v += step) out.push({ v: Math.round(v * 1e6) / 1e6, axis: 'x' });
  const startZ = Math.ceil(extent.minZ / step) * step;
  for (let v = startZ; v <= extent.maxZ + step * 0.5; v += step) out.push({ v: Math.round(v * 1e6) / 1e6, axis: 'z' });
  return out;
}

/** Допустимые ручные шаги сетки. */
export const GRID_STEPS = [1, 5, 10, 25, 50, 100, 250, 500];
