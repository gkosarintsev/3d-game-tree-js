/**
 * Генератор мега-дома и строитель его геометрии.
 *
 * План каждого этажа задаётся сеткой клеток (WALL / FLOOR / VOID / HOLE / WINDOW).
 * Силуэт — знак «плюс», верхние этажи сужаются «ступенями». Внутри проходит
 * сквозная лестничная шахта: проём в перекрытии каждого этажа и по одному
 * прямому маршу на этаж. Марш k поднимается от уровня k*floorHeight (у южного
 * торца шахты) до уровня (k+1)*floorHeight (у северного торца), поэтому оба
 * торца на каждом этаже совпадают с уровнем пола: с юга марш начинается, а с
 * севера заканчивается предыдущий. Войти в шахту можно с любого торца.
 *
 * Фасадные стены верхних этажей размечаются как WINDOW — стена с проёмом
 * (подоконник, перемычка, простенки и стекло), проём сквозной.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const WALL = '#';
export const FLOOR = '.';
export const VOID = ' ';
export const HOLE = 'H';
export const WINDOW = 'o';

/**
 * Полуширина крыльев силуэта (в клетках) с учётом сужения кверху.
 * Нижний этаж должен оставаться не меньше (3, 4): иначе сужение перекрывает
 * обход вокруг лестничной шахты и верхние этажи становятся недостижимы.
 */
function setback(k) {
  if (k < 2) return { vHalf: 5, hHalf: 6 };
  if (k < 4) return { vHalf: 4, hHalf: 5 };
  return { vHalf: 3, hHalf: 4 };
}

/** Проём в стене (клетка стены становится проходимой). */
function openWallCell(grid, i, j) {
  if (grid[j] && grid[j][i] === WALL) grid[j][i] = FLOOR;
}

/**
 * Наружные стороны клетки — соседняя клетка лежит вне контура здания (VOID).
 * По ним тонкая стена прижимается к внешней грани клетки. Одна и та же
 * функция используется и при построении геометрии, и при расчёте коллизий,
 * чтобы стена выглядела и работала одинаково.
 */
export function outerSides(grid, cols, rows, i, j) {
  const at = (a, b) => (a >= 0 && b >= 0 && a < cols && b < rows) ? grid[b][a] : VOID;
  return {
    W: at(i - 1, j) === VOID,
    E: at(i + 1, j) === VOID,
    N: at(i, j - 1) === VOID,
    S: at(i, j + 1) === VOID,
  };
}

/**
 * Генерирует данные здания.
 * @returns {{cols:number, rows:number, cell:number, floors:number, floorHeight:number,
 *   stepUp:number, wallThickness:number, originX:number, originZ:number,
 *   levels:string[][][], ramps:object[], stair:object, doorX:number}}
 */
export function generateBuilding(cfg) {
  const { cols, rows, cell, floors, floorHeight, stepUp, wallThickness = 0.5, offsetX = 0, offsetZ = 0 } = cfg;
  const cx = (cols - 1) / 2;
  const cy = (rows - 1) / 2;
  const originX = -(cols * cell) / 2 + offsetX;
  const originZ = -(rows * cell) / 2 + offsetZ;

  // шахта лестницы: 2 клетки в ширину, 5 в длину, торцы открыты на каждом этаже
  const ci = Math.round(cx);
  const cj = Math.round(cy);
  const stair = { i0: ci - 1, i1: ci, j0: cj - 2, j1: cj + 2 };
  const inStair = (i, j) =>
    i >= stair.i0 - 1 && i <= stair.i1 + 1 && j >= stair.j0 - 1 && j <= stair.j1 + 1;

  const levels = [];
  for (let k = 0; k < floors; k++) {
    const { vHalf, hHalf } = setback(k);
    const grid = Array.from({ length: rows }, () => new Array(cols).fill(VOID));
    const inFoot = (i, j) => i >= 0 && j >= 0 && i < cols && j < rows &&
      (Math.abs(i - cx) <= vHalf || Math.abs(j - cy) <= hHalf);

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) if (inFoot(i, j)) grid[j][i] = FLOOR;
    }

    // внешний контур здания
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        if (grid[j][i] !== FLOOR) continue;
        if (!inFoot(i - 1, j) || !inFoot(i + 1, j) || !inFoot(i, j - 1) || !inFoot(i, j + 1)) {
          grid[j][i] = WALL;
        }
      }
    }

    // колонны — добавляют объём, но не запирают проходы
    for (let j = 2; j < rows - 2; j++) {
      for (let i = 2; i < cols - 2; i++) {
        if (grid[j][i] !== FLOOR || inStair(i, j)) continue;
        if ((i - 2) % 6 === 0 && (j - 2) % 6 === 0) grid[j][i] = WALL;
      }
    }

    // входы с улицы на первом этаже (восток, запад, юг)
    if (k === 0) {
      for (const j of [cj - 1, cj, cj + 1]) openWallCell(grid, cols - 1, j);
      for (const j of [cj - 1, cj, cj + 1]) openWallCell(grid, 0, j);
      for (const i of [ci, ci + 1]) openWallCell(grid, i, 0);
    }

    // шахта: стены по бокам, открытые торцы, проём в перекрытии
    for (let j = stair.j0; j <= stair.j1; j++) {
      for (const i of [stair.i0 - 1, stair.i1 + 1]) {
        if (i > 0 && i < cols - 1 && grid[j][i] === FLOOR) grid[j][i] = WALL;
      }
    }
    for (const j of [stair.j0 - 1, stair.j1 + 1]) {
      for (let i = stair.i0; i <= stair.i1; i++) {
        if (j > 0 && j < rows - 1) grid[j][i] = FLOOR;
      }
    }
    for (let j = stair.j0; j <= stair.j1; j++) {
      for (let i = stair.i0; i <= stair.i1; i++) grid[j][i] = k >= 1 ? HOLE : FLOOR;
    }

    // окна: фасадные стены верхних этажей (первый этаж глухой — там входы,
    // он играет роль «цоколя»)
    if (k >= 1) {
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          if (grid[j][i] !== WALL) continue;
          if (!inFoot(i - 1, j) || !inFoot(i + 1, j) || !inFoot(i, j - 1) || !inFoot(i, j + 1)) {
            grid[j][i] = WINDOW;
          }
        }
      }
    }

    levels.push(grid);
  }

  // марши: по одному на этаж, во всю длину шахты
  const X = i => originX + i * cell;
  const Z = j => originZ + j * cell;
  const z0 = Z(stair.j0);
  const z1 = Z(stair.j1 + 1);
  const ramps = [];
  for (let k = 0; k < floors - 1; k++) {
    ramps.push({
      minX: X(stair.i0), maxX: X(stair.i1 + 1),
      minZ: z0, maxZ: z1, z0, z1,
      y0: k * floorHeight, y1: (k + 1) * floorHeight, baseY: k * floorHeight,
    });
  }

  return {
    cols, rows, cell, floors, floorHeight, stepUp, wallThickness,
    originX, originZ, levels, ramps, stair,
    doorX: X(ci) + cell, // центр южного входа (между клетками ci и ci+1)
  };
}

/** Ступени марша: наклонная поверхность аппроксимируется ступенями. */
export function stairSteps(r) {
  const run = r.z1 - r.z0;
  const n = Math.max(6, Math.round(run / 1.2));
  const step = run / n;
  const out = [];
  for (let s = 0; s < n; s++) {
    const zc = r.z0 + (s + 0.5) * step;
    const t = (zc - r.z0) / run;
    const top = r.y0 + (r.y1 - r.y0) * t;
    if (top - r.baseY <= 0.02) continue;
    out.push({ minX: r.minX, maxX: r.maxX, minZ: zc - step / 2, maxZ: zc + step / 2, top });
  }
  return out;
}

/**
 * Горизонтальные опорные поверхности — по ним карта считает высоту пола
 * под ногами игрока. Полы этажей (кроме первого — там земля) и ступени маршей.
 */
export function buildingSurfaces(b) {
  const { cols, rows, cell, floors, floorHeight, originX, originZ, levels, ramps } = b;
  const surfaces = [];
  for (let k = 1; k < floors; k++) {
    const y = k * floorHeight;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const c = levels[k][j][i];
        // опора есть и под тонкими стенами: к ним можно подойти вплотную
        if (c === VOID || c === HOLE) continue;
        surfaces.push({
          minX: originX + i * cell, maxX: originX + (i + 1) * cell,
          minZ: originZ + j * cell, maxZ: originZ + (j + 1) * cell,
          y,
        });
      }
    }
  }
  for (const r of ramps) {
    for (const s of stairSteps(r)) {
      surfaces.push({ minX: s.minX, maxX: s.maxX, minZ: s.minZ, maxZ: s.maxZ, y: s.top });
    }
  }
  return surfaces;
}

/** Вспомогательный параллелепипед со сдвигом в мировые координаты. */
function box(w, h, d, x, y, z) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y, z);
  return g;
}

/**
 * Собирает геометрию здания (стены, перекрытия, лестницы, стёкла окон).
 * @returns {{walls:THREE.BufferGeometry, slabs:THREE.BufferGeometry,
 *   stairs:THREE.BufferGeometry, glass:THREE.BufferGeometry}}
 */
export function buildBuildingGeometry(b) {
  const {
    cols, rows, cell, floors, floorHeight, originX, originZ, levels, ramps,
    wallThickness = 0.5,
  } = b;
  const wallGeos = [];
  const slabGeos = [];
  const stairGeos = [];
  const glassGeos = [];

  // толщина стены: примерно вдвое тоньше клетки
  const thick = cell * wallThickness;

  // толщина перекрытия. Вертикальные элементы (стены, простенки) делаем ниже
  // этажа ровно на эту величину, чтобы стена нижнего этажа заканчивалась там,
  // где начинается перекрытие верхнего: иначе оба объёма перекрываются по
  // высоте и их совпадающие наружные грани мерцают (z-fighting).
  const SLAB = 0.3;
  const wallH = floorHeight - SLAB;

  // параметры окна: проём в тонкой стене (подоконник / перемычка / простенки)
  const winW = cell * 0.55;
  const winH = floorHeight * 0.42;
  const sill = floorHeight * 0.34;
  const lintel = wallH - sill - winH;
  const jamb = (cell - winW) / 2;

  for (let k = 0; k < floors; k++) {
    const y0 = k * floorHeight;
    const grid = levels[k];
    const cy = y0 + wallH / 2;
    const cyWin = y0 + sill + winH / 2;

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const c = grid[j][i];
        if (c === VOID || c === HOLE) continue;
        const wx = originX + (i + 0.5) * cell;
        const wz = originZ + (j + 0.5) * cell;

        // перекрытие (первый этаж — это земля). Кладём и под стенами/окнами,
        // иначе у тонкой стены останется щель в полу.
        if (k >= 1) slabGeos.push(box(cell, SLAB, cell, wx, y0 - SLAB / 2, wz));
        if (c === FLOOR) continue;

        const o = outerSides(grid, cols, rows, i, j);
        const open = o.W || o.E || o.N || o.S;

        if (c === WALL) {
          if (!open) { // внутренняя стена или колонна — оставляем сплошной
            wallGeos.push(box(cell, wallH, cell, wx, cy, wz));
            continue;
          }
          // тонкая стена, прижатая к наружной грани клетки
          if (o.W) wallGeos.push(box(thick, wallH, cell, wx - (cell - thick) / 2, cy, wz));
          if (o.E) wallGeos.push(box(thick, wallH, cell, wx + (cell - thick) / 2, cy, wz));
          if (o.N) wallGeos.push(box(cell, wallH, thick, wx, cy, wz - (cell - thick) / 2));
          if (o.S) wallGeos.push(box(cell, wallH, thick, wx, cy, wz + (cell - thick) / 2));
          continue;
        }

        // WINDOW: тонкая стена с проёмом. Окно режем на грани вдоль X, если
        // она наружная, иначе вдоль Z; на «угловой» грани — глухая стена.
        const winX = o.W || o.E;
        // грань стены по X (запад/восток)
        const segX = (posX, win) => {
          if (!win) { wallGeos.push(box(thick, wallH, cell, posX, cy, wz)); return; }
          wallGeos.push(box(thick, sill, cell, posX, y0 + sill / 2, wz));
          wallGeos.push(box(thick, lintel, cell, posX, y0 + sill + winH + lintel / 2, wz));
          wallGeos.push(box(thick, winH, jamb, posX, cyWin, wz - (winW + jamb) / 2));
          wallGeos.push(box(thick, winH, jamb, posX, cyWin, wz + (winW + jamb) / 2));
          glassGeos.push(box(0.12, winH, winW, posX, cyWin, wz));
        };
        // грань стены по Z (север/юг)
        const segZ = (posZ, win) => {
          if (!win) { wallGeos.push(box(cell, wallH, thick, wx, cy, posZ)); return; }
          wallGeos.push(box(cell, sill, thick, wx, y0 + sill / 2, posZ));
          wallGeos.push(box(cell, lintel, thick, wx, y0 + sill + winH + lintel / 2, posZ));
          wallGeos.push(box(jamb, winH, thick, wx - (winW + jamb) / 2, cyWin, posZ));
          wallGeos.push(box(jamb, winH, thick, wx + (winW + jamb) / 2, cyWin, posZ));
          glassGeos.push(box(winW, winH, 0.12, wx, cyWin, posZ));
        };
        if (!open) { // запасной случай: окно без наружной грани
          wallGeos.push(box(cell, floorHeight, cell, wx, cy, wz));
          continue;
        }
        if (o.W) segX(wx - (cell - thick) / 2, winX);
        if (o.E) segX(wx + (cell - thick) / 2, winX);
        if (o.N) segZ(wz - (cell - thick) / 2, !winX);
        if (o.S) segZ(wz + (cell - thick) / 2, !winX);
      }
    }
  }

  // крыша верхнего этажа — над всем контуром, включая тонкие стены
  const roofY = floors * floorHeight;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const c = levels[floors - 1][j][i];
      if (c === VOID || c === HOLE) continue;
      slabGeos.push(box(cell, SLAB, cell, originX + (i + 0.5) * cell, roofY - SLAB / 2, originZ + (j + 0.5) * cell));
    }
  }

  // ступени маршей — тонкие ступенчатые плиты: так марши можно ставить
  // друг над другом, и над каждым остаётся достаточный просвет
  const STEP_THICK = 0.45;
  for (const r of ramps) {
    const width = r.maxX - r.minX;
    const cxr = (r.minX + r.maxX) / 2;
    for (const s of stairSteps(r)) {
      const depth = s.maxZ - s.minZ;
      stairGeos.push(box(width, STEP_THICK, depth, cxr, s.top - STEP_THICK / 2, (s.minZ + s.maxZ) / 2));
    }
  }

  const merge = arr => (arr.length ? mergeGeometries(arr, false) : null);
  return {
    walls: merge(wallGeos),
    slabs: merge(slabGeos),
    stairs: merge(stairGeos),
    glass: merge(glassGeos),
  };
}
