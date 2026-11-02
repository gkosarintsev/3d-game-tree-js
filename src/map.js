import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CONFIG } from './config.js';
import {
  WALL, VOID, HOLE, WINDOW,
  generateBuilding, buildBuildingGeometry, buildingSurfaces, buildingWallHits,
  buildingFloorPositions, navBuildingFloors, navBuildingDoors,
} from './building.js';
import { buildDecor } from './decor.js';
import { SolidField } from './solids.js';
import { NavGraph } from './nav-graph.js';

/**
 * Контракт карты (расширен по вертикали — в мире несколько этажей).
 *
 * Игрок, монеты и интерфейс зависят только от этого набора членов:
 *
 *   width, depth                   — размеры мира в юнитах
 *   spawn                          — { x, z } точка появления игрока
 *   groundHeightAt(x, z, fromY)    — высота опоры под ногами: ближайшая
 *                                    поверхность не выше fromY + допустимый шаг
 *   isBlocked(x, z, r, feetY, h)   — коллизии габарита: стены этажей,
 *                                    пересекающие игрока по высоте
 *   openPositions()                — свободные точки { x, y, z } для объектов
 *   worldToNormalized(x, z)        — [u, v] в диапазоне 0..1 (для миникарты)
 *   build(scene)                   — построить статическую геометрию уровня
 *   drawMinimap(ctx, size, playerPos) — отрисовать план текущего этажа
 *
 * Два члена необязательны и есть только там, где нужны (движок проверяет
 * наличие через `typeof`, главы без них работают как раньше):
 *
 *   updateStreaming(x, z)          — перестройка активного окна (стримящие карты)
 *   debugIds()                     — [{text, x, y, z}] метки id для ?debug=1
 *                                    (держит только карта из брифа, где у каждого
 *                                    объекта данных есть свой id)
 *
 * Чтобы снова сменить тип уровня, достаточно реализовать контракт в новом
 * классе и подменить его в Game.createMap().
 */

/**
 * Карта-улица: плоская земля и несколько домов в ряд. Геометрия всех домов
 * сливается в общие меши, поэтому число вызовов отрисовки не зависит от
 * количества домов. Опорные поверхности индексируются в пространственную
 * сетку — поиск высоты пола под ногами не зависит от их числа.
 */
export class TownMap extends SolidField {
  /**
   * @param {object[]} buildings дома уровня (данные generateBuilding)
   * @param {{size?:number, color?:number}} [ground] земля уровня (по умолчанию — CONFIG)
   * @param {object} [decor] параметры декора уровня (по умолчанию — CONFIG.decor)
   */
  constructor(buildings, ground = {}, decor = {}) {
    super(CONFIG.building.cell);
    this.buildings = buildings;
    this.width = ground.size ?? CONFIG.ground.size;
    this.groundColor = ground.color ?? CONFIG.ground.color;
    this.decor = { ...CONFIG.decor, ...decor };
    this.depth = this.width;
    this.stepUp = CONFIG.building.stepUp;

    // габариты каждого дома — для быстрой отбраковки в проверке коллизий
    this.boxes = buildings.map(b => ({
      minX: b.originX,
      maxX: b.originX + b.cols * b.cell,
      minZ: b.originZ,
      maxZ: b.originZ + b.rows * b.cell,
    }));

    // все опорные поверхности домов + пространственный индекс по ним
    this.surfaces = [];
    for (const b of buildings) this.surfaces.push(...buildingSurfaces(b));
    this.bucket = CONFIG.building.cell * 2;
    this.index = new Map();
    this._indexSurfaces();

    // твёрдые объёмы (AABB) для 3D-физики Чужого: заполняются в build();
    // плоская земля улицы — рейкаст по ней опускается до y = 0
    this.groundPlane = { y: 0, half: this.width / 2 };

    this.bounds = this._worldBounds();
    this.viewHalf = Math.max(
      Math.abs(this.bounds.minX), Math.abs(this.bounds.maxX),
      Math.abs(this.bounds.minZ), Math.abs(this.bounds.maxZ),
    ) + 24;
    this.spawn = this._findSpawn();

    // граф навигации для врагов (узлы, рёбра и поиск маршрута — в NavGraph)
    this.nav = this._buildNav();
  }

  // ------------------------------------------- опоры, солиды и поиск высоты пола
  // Механизм общий с картой-рельефом и городом: AABB-солиды (рейкаст, сфера,
  // маршевый луч) и индекс плоских опор — в базовом классе SolidField (solids.js).

  /** Общий габарит всех домов (по земле). */
  _worldBounds() {
    const out = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity };
    for (const box of this.boxes) {
      out.minX = Math.min(out.minX, box.minX);
      out.maxX = Math.max(out.maxX, box.maxX);
      out.minZ = Math.min(out.minZ, box.minZ);
      out.maxZ = Math.max(out.maxZ, box.maxZ);
    }
    return out;
  }

  /** Точка появления — на улице, перед входом центрального дома. */
  _findSpawn() {
    const b = this.buildings.reduce((a, c) => Math.abs(c.doorX) < Math.abs(a.doorX) ? c : a);
    const z = this.bounds.minZ - 10;
    // y — как у других типов карты: маршруты ищут от spawn и требуют отметки
    return { x: b.doorX, y: this.groundHeightAt(b.doorX, z, 0), z };
  }

  /** Коллизии габарита игрока: стены (и окна) этажей, пересекающие его по высоте. */
  isBlocked(x, z, radius, feetY = 0, height = 2) {
    const half = this.width / 2;
    if (x - radius < -half || x + radius > half || z - radius < -half || z + radius > half) return true;

    for (const b of this.buildings) {
      if (buildingWallHits(b, x, z, radius, feetY, height)) return true;
    }
    return false;
  }

  /** Свободные точки на полах этажей всех домов (вне лестничных шахт). */
  openPositions() {
    const out = [];
    for (const b of this.buildings) out.push(...buildingFloorPositions(b));
    return out;
  }

  worldToNormalized(x, z) {
    const v = this.viewHalf;
    const u = (x + v) / (2 * v);
    const w = (z + v) / (2 * v);
    return [Math.min(Math.max(u, 0), 1), Math.min(Math.max(w, 0), 1)];
  }

  // ---------------------------------------------------------------- навигация

  /**
   * Граф навигации для врагов. Узлы — проходимые клетки пола каждого этажа
   * каждого дома и регулярная сетка точек на земле улицы. Рёбра — соседство
   * по клеткам и лестничные марши (южный торец этажа k ↔ северный торец
   * этажа k + 1), поэтому по графу можно ходить и между этажами.
   */
  _buildNav() {
    const nav = new NavGraph();

    // 1. полы домов: узел на каждой проходимой клетке, связи с соседями и марши
    for (let n = 0; n < this.buildings.length; n++) {
      navBuildingFloors(nav, n, this.buildings[n]);
    }

    // 2. земля улицы: регулярная сетка вне габаритов домов
    const step = CONFIG.nav.streetStep;
    const half = this.width / 2;
    const count = Math.floor(this.width / step);
    const gx = ix => -half + ix * step;
    const inBox = (x, z) => this.boxes.some(b =>
      x > b.minX - 1 && x < b.maxX + 1 && z > b.minZ - 1 && z < b.maxZ + 1);
    const groundKey = (ix, iz) => `g:${ix}:${iz}`;
    for (let ix = 0; ix <= count; ix++) {
      for (let iz = 0; iz <= count; iz++) {
        const x = gx(ix), z = gx(iz);
        if (inBox(x, z)) continue;
        const id = nav.add(x, 0, z, groundKey(ix, iz));
        nav.link(id, nav.id(groundKey(ix - 1, iz)));
        nav.link(id, nav.id(groundKey(ix, iz - 1)));
      }
    }

    // 3. выходы: пороговые клетки первого этажа соединяем с улицей
    const nearStreet = p => {
      const out = [];
      const ci = Math.round((p.x + half) / step);
      const cj = Math.round((p.z + half) / step);
      for (let ix = ci - 2; ix <= ci + 2; ix++) {
        for (let iz = cj - 2; iz <= cj + 2; iz++) {
          const g = nav.id(groundKey(ix, iz));
          if (g === undefined) continue;
          const q = nav.pos[g];
          const d = Math.hypot(q.x - p.x, q.z - p.z);
          if (d > step * 1.6) continue;
          if (this.rayHitDistance(p.x, p.y + 0.9, p.z,
            (q.x - p.x) / d, 0, (q.z - p.z) / d, d) < d - 0.1) continue;
          // вдоль фасада луч не заденет стену, а тело radius в зазор не войдёт:
          // такое ребро привело бы врага в глухую стену у угла дома
          if (!this.bodyClearLine(p, q)) continue;
          out.push(g);
        }
      }
      return out;
    };
    for (let n = 0; n < this.buildings.length; n++) {
      navBuildingDoors(nav, n, this.buildings[n], nearStreet);
    }

    return nav.seal();
  }

  /** Случайная точка графа в радиусе от (x, z); если не нашлось — null. */
  randomNavPoint(x, z, radius) {
    return this.nav.randomPoint(x, z, radius);
  }

  /** Маршрут по узлам графа (поиск в ширину). null — пути нет. */
  findPath(from, to) {
    return this.nav.findPath(from, to);
  }

  // ---------------------------------------------------------------- стрельба
  // rayHitDistance — в SolidField: маршевый луч по isBlocked/groundHeightAt.

  /** Плоская земля и слитая геометрия всех домов. */
  build(scene) {
    const size = this.width;
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      new THREE.MeshStandardMaterial({ color: this.groundColor, roughness: 1, metalness: 0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // геометрия всех домов сливается по материалам → постоянное число мешей.
    // Попутно собираем твёрдые объёмы (AABB) для 3D-физики Чужого.
    this.solids = [];
    const parts = { walls: [], slabs: [], stairs: [] };
    for (const b of this.buildings) {
      const g = buildBuildingGeometry(b, this.solids);
      for (const key of Object.keys(parts)) if (g[key]) parts[key].push(g[key]);
    }
    this.indexSolids();

    const mats = {
      walls: new THREE.MeshStandardMaterial({ color: 0xd6dae0, roughness: .85, metalness: .05 }),
      slabs: new THREE.MeshStandardMaterial({ color: 0xb9bec6, roughness: .9, metalness: .05 }),
      stairs: new THREE.MeshStandardMaterial({ color: 0x9aa3ad, roughness: .9, metalness: .05 }),
    };

    for (const key of Object.keys(parts)) {
      if (!parts[key].length) continue;
      const mesh = new THREE.Mesh(mergeGeometries(parts[key], false), mats[key]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    }

    buildDecor(scene, this);
  }

  /** План текущего этажа всех домов. */
  drawMinimap(ctx, size, playerPos) {
    ctx.fillStyle = '#3f6b2c';
    ctx.fillRect(0, 0, size, size);

    const toPx = (wx, wz) => {
      const [u, v] = this.worldToNormalized(wx, wz);
      return [u * size, v * size];
    };

    const floorHeight = CONFIG.building.floorHeight;
    const label = playerPos ? Math.max(0, Math.floor(playerPos.y / floorHeight)) : 0;

    for (const b of this.buildings) {
      const { cols, rows, cell, floors, originX, originZ, levels } = b;
      const k = Math.min(label, floors - 1);
      const grid = levels[k];
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const c = grid[j][i];
          if (c === VOID) continue;
          const [x0, z0] = toPx(originX + i * cell, originZ + j * cell);
          const [x1, z1] = toPx(originX + (i + 1) * cell, originZ + (j + 1) * cell);
          if (c === WALL) ctx.fillStyle = '#262f3d';
          else if (c === WINDOW) ctx.fillStyle = '#33475e';
          else if (c === HOLE) ctx.fillStyle = '#5b4a2c';
          else ctx.fillStyle = 'rgba(196,212,232,.55)';
          ctx.fillRect(x0, z0, Math.max(x1 - x0, 1), Math.max(z1 - z0, 1));
        }
      }
    }

    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Этаж ${label + 1}`, 10, 10);
  }
}

/**
 * Создаёт карту-улицу по определению уровня (см. src/levels/).
 * @param {{houses?:object[], ground?:{size?:number, color?:number}, decor?:object}} [spec]
 *   всё необязательно: недостающее берётся из CONFIG (дома — базовая улица).
 */
export function createTownMap(spec = {}) {
  const base = CONFIG.building;
  const houses = spec.houses ?? base.houses;
  const buildings = houses.map(h => generateBuilding({ ...base, ...h }));
  return new TownMap(buildings, spec.ground ?? {}, spec.decor ?? {});
}
