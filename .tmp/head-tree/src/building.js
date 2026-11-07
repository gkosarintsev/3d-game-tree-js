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
 * (подоконник, перемычка, простенки), проём сквозной и без стекла, поэтому
 * Чужой может влезть в окно снаружи.
 *
 * baseY — отметка пола первого этажа: на улице это земля (0), в городе дом
 * стоит на тротуаре-подиуме, и его пол совпадает с верхом бордюра. Все
 * высоты — полы, перекрытия, марши, коллизии и опоры — считаются от baseY,
 * чтобы картинка и физика не расходились.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { circleHitsRect } from './solids.js';

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
 *   stepUp:number, wallThickness:number, baseY:number, originX:number, originZ:number,
 *   levels:string[][][], ramps:object[], stair:object, doorX:number}}
 */
export function generateBuilding(cfg) {
  const {
    cols, rows, cell, floors, floorHeight, stepUp, wallThickness = 0.5,
    slabThickness = 0.3, baseY = 0,
    offsetX = 0, offsetZ = 0, roofHole = null,
  } = cfg;
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

  // Лаз в крыше: прямоугольный участок верхнего перекрытия становится проёмом
  // (HOLE). Крыша строится по клеткам последнего этажа, поэтому в этом месте
  // плита не кладётся — образуется сквозное отверстие с пола этажа на крышу.
  if (roofHole) {
    const grid = levels[floors - 1];
    for (let j = roofHole.j0; j <= roofHole.j1; j++) {
      for (let i = roofHole.i0; i <= roofHole.i1; i++) {
        if (grid[j] && i >= 0 && i < cols) grid[j][i] = HOLE;
      }
    }
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
      y0: baseY + k * floorHeight, y1: baseY + (k + 1) * floorHeight,
      baseY: baseY + k * floorHeight,
    });
  }

  return {
    cols, rows, cell, floors, floorHeight, stepUp, wallThickness, slabThickness, baseY,
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
 * под ногами игрока. Полы этажей (кроме первого — там опора самой карты:
 * земля на улице, тротуар-подиум в городе) и ступени маршей.
 */
export function buildingSurfaces(b) {
  const { cols, rows, cell, floors, floorHeight, baseY = 0, originX, originZ, levels, ramps } = b;
  const surfaces = [];
  for (let k = 1; k < floors; k++) {
    const y = baseY + k * floorHeight;
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

/**
 * Свободные точки полов всех этажей дома (вне лестничной шахты) — кандидаты,
 * куда можно поставить объект уровня: монету, врага, предмет.
 */
export function buildingFloorPositions(b) {
  const { cols, rows, cell, floors, floorHeight, baseY = 0, originX, originZ, levels, stair } = b;
  const out = [];
  for (let k = 0; k < floors; k++) {
    for (let j = 1; j < rows - 1; j++) {
      for (let i = 1; i < cols - 1; i++) {
        if (levels[k][j][i] !== FLOOR) continue;
        if (i >= stair.i0 - 1 && i <= stair.i1 + 1 && j >= stair.j0 - 1 && j <= stair.j1 + 1) continue;
        out.push({
          x: originX + (i + 0.5) * cell,
          z: originZ + (j + 0.5) * cell,
          y: baseY + k * floorHeight,
        });
      }
    }
  }
  return out;
}

/** Ключ узла графа навигации: клетка (i, j) этажа k дома n. */
export const buildingCellKey = (n, k, i, j) => `b${n}:${k}:${i}:${j}`;

/**
 * Узлы полов дома в графе навигации: по узлу на каждую проходимую клетку пола
 * каждого этажа, связи с соседями по клеткам и марш — южный торец этажа k
 * связан с северным торцом этажа k + 1, поэтому граф ведёт между этажами.
 * Общий для улицы и города: дома там строятся одной функцией.
 */
export function navBuildingFloors(nav, n, b) {
  const { cols, rows, cell, floors, floorHeight, baseY = 0, originX, originZ, levels, stair } = b;
  const nodeAt = (k, i, j) => nav.add(
    originX + (i + 0.5) * cell, baseY + k * floorHeight, originZ + (j + 0.5) * cell,
    buildingCellKey(n, k, i, j),
  );
  const walk = (k, i, j) =>
    i >= 0 && j >= 0 && i < cols && j < rows && levels[k][j][i] === FLOOR;

  for (let k = 0; k < floors; k++) {
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        if (levels[k][j][i] !== FLOOR) continue;
        const id = nodeAt(k, i, j);
        if (walk(k, i + 1, j)) nav.link(id, nodeAt(k, i + 1, j));
        if (walk(k, i, j + 1)) nav.link(id, nodeAt(k, i, j + 1));
      }
    }
  }
  for (let k = 0; k + 1 < floors; k++) {
    for (const i of [stair.i0, stair.i1]) {
      nav.link(
        nav.id(buildingCellKey(n, k, i, stair.j0 - 1)),
        nav.id(buildingCellKey(n, k + 1, i, stair.j1 + 1)),
      );
    }
  }
}

/**
 * Связь входов дома с внешним миром карты: клетка первого этажа, у которой есть
 * наружная сторона (то есть это порог, а не внутренняя клетка), соединяется с
 * узлами, которые вернёт candidatesAt для точки порога. Кто именно эти узлы —
 * решает карта: у улицы это решётка по земле, в городе — решётка улиц и тротуаров.
 */
export function navBuildingDoors(nav, n, b, candidatesAt) {
  const { cols, rows, levels } = b;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      if (levels[0][j][i] !== FLOOR) continue;
      const o = outerSides(levels[0], cols, rows, i, j);
      if (!o.W && !o.E && !o.N && !o.S) continue; // не порог, а внутренняя клетка
      const id = nav.id(buildingCellKey(n, 0, i, j));
      if (id === undefined) continue;
      for (const g of candidatesAt(nav.pos[id])) nav.link(id, g);
    }
  }
}

/**
 * Коллизия габарита игрока со стенами дома. Проверяются только клетки, чей
 * прямоугольник в плане пересекает круг игрока, и только те этажи, чья высота
 * задевает его по вертикали; тонкие наружные стены — по фактической толщине,
 * внутренние и колонны — как сплошная клетка.
 *
 * Общая для улицы (TownMap) и города (CityMap): дома там строятся одной
 * функцией, поэтому и обаться должны одинаково.
 */
export function buildingWallHits(b, x, z, radius, feetY, height) {
  const { cols, rows, cell, floors, floorHeight, baseY = 0, originX, originZ, levels, wallThickness } = b;
  if (x + radius < originX || x - radius > originX + cols * cell ||
      z + radius < originZ || z - radius > originZ + rows * cell) return false;

  const i0 = Math.floor((x - radius - originX) / cell);
  const i1 = Math.floor((x + radius - originX) / cell);
  const j0 = Math.floor((z - radius - originZ) / cell);
  const j1 = Math.floor((z + radius - originZ) / cell);
  const thick = cell * wallThickness;
  const y0 = feetY, y1 = feetY + height;

  for (let j = j0; j <= j1; j++) {
    if (j < 0 || j >= rows) continue;
    for (let i = i0; i <= i1; i++) {
      if (i < 0 || i >= cols) continue;
      const cx = originX + i * cell;
      const cz = originZ + j * cell;
      if (!circleHitsRect(x, z, cx, cx + cell, cz, cz + cell, radius)) continue;

      for (let k = 0; k < floors; k++) {
        const c = levels[k][j][i];
        if (c !== WALL && c !== WINDOW) continue;
        const wy0 = baseY + k * floorHeight;
        if (y0 >= wy0 + floorHeight || y1 <= wy0) continue;

        const o = outerSides(levels[k], cols, rows, i, j);
        if (!o.W && !o.E && !o.N && !o.S) return true;
        if (o.W && circleHitsRect(x, z, cx, cx + thick, cz, cz + cell, radius)) return true;
        if (o.E && circleHitsRect(x, z, cx + cell - thick, cx + cell, cz, cz + cell, radius)) return true;
        if (o.N && circleHitsRect(x, z, cx, cx + cell, cz, cz + thick, radius)) return true;
        if (o.S && circleHitsRect(x, z, cx, cx + cell, cz + cell - thick, cz + cell, radius)) return true;
      }
    }
  }
  return false;
}

/**
 * Собирает геометрию здания (стены, перекрытия, лестницы).
 *
 * @param {object} b данные здания
 * @param {Array} [solids] если передан, в него добавляются мировые AABB всех
 *   твёрдых элементов (стен, перекрытий, ступеней, крыши). По этим объёмам
 *   работает физика Чужого: рейкасты к поверхностям и выталкивание тела.
 *   Оконные проёмы в солиды не попадают — через окно можно пролезть.
 * @returns {{walls:THREE.BufferGeometry, slabs:THREE.BufferGeometry,
 *   stairs:THREE.BufferGeometry}}
 */
export function buildBuildingGeometry(b, solids) {
  const {
    cols, rows, cell, floors, floorHeight, baseY = 0, originX, originZ, levels, ramps,
    wallThickness = 0.5, slabThickness = 0.3,
  } = b;
  const wallGeos = [];
  const slabGeos = [];
  const stairGeos = [];

  /** Параллелепипед со сдвигом в мировые координаты; попадает в солиды. */
  const box = (w, h, d, x, y, z) => {
    const g = new THREE.BoxGeometry(w, h, d);
    g.translate(x, y, z);
    if (solids) {
      solids.push({
        minX: x - w / 2, maxX: x + w / 2,
        minY: y - h / 2, maxY: y + h / 2,
        minZ: z - d / 2, maxZ: z + d / 2,
      });
    }
    return g;
  };

  // толщина стены: примерно вдвое тоньше клетки
  const thick = cell * wallThickness;

  // толщина перекрытия. Вертикальные элементы (стены, простенки) делаем ниже
  // этажа ровно на эту величину, чтобы стена нижнего этажа заканчивалась там,
  // где начинается перекрытие верхнего: иначе оба объёма перекрываются по
  // высоте и их совпадающие наружные грани мерцают (z-fighting).
  const SLAB = slabThickness;
  const wallH = floorHeight - SLAB;

  // параметры окна: проём в тонкой стене (подоконник / перемычка / простенки)
  const winW = cell * 0.55;
  const winH = floorHeight * 0.42;
  const sill = floorHeight * 0.34;
  const lintel = wallH - sill - winH;
  const jamb = (cell - winW) / 2;

  for (let k = 0; k < floors; k++) {
    const y0 = baseY + k * floorHeight;
    const grid = levels[k];
    const cy = y0 + wallH / 2;
    const cyWin = y0 + sill + winH / 2;

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const c = grid[j][i];
        if (c === VOID || c === HOLE) continue;
        const wx = originX + (i + 0.5) * cell;
        const wz = originZ + (j + 0.5) * cell;

        // перекрытие (пол первого этажа — опора самой карты: земля или тротуар).
        // Кладём и под стенами/окнами, иначе у тонкой стены останется щель в полу.
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
        };
        // грань стены по Z (север/юг)
        const segZ = (posZ, win) => {
          if (!win) { wallGeos.push(box(cell, wallH, thick, wx, cy, posZ)); return; }
          wallGeos.push(box(cell, sill, thick, wx, y0 + sill / 2, posZ));
          wallGeos.push(box(cell, lintel, thick, wx, y0 + sill + winH + lintel / 2, posZ));
          wallGeos.push(box(jamb, winH, thick, wx - (winW + jamb) / 2, cyWin, posZ));
          wallGeos.push(box(jamb, winH, thick, wx + (winW + jamb) / 2, cyWin, posZ));
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
  const roofY = baseY + floors * floorHeight;
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
  };
}
