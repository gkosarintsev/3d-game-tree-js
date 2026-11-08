import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CONFIG } from './config.js';
import { makeRng } from './rng.js';
import { SolidField } from './solids.js';
import { NavGraph } from './nav-graph.js';
import {
  WALL, VOID, HOLE, WINDOW,
  generateBuilding, buildBuildingGeometry, buildingSurfaces, buildingWallHits,
  buildingFloorPositions, navBuildingFloors, navBuildingDoors,
} from './building.js';

/**
 * Реализация контракта карты для города: сетка кварталов, между ними проезжие
 * улицы, в каждом квартале — дом на тротуаре-подиуме.
 *
 * Планировка задаётся числами (grid × grid кварталов, сторона квартала, ширина
 * улицы, высота бордюра), дома внутри кварталов подбираются детерминированно по
 * сиду уровня из диапазона клеток и этажей. Дальше работает тот же общий
 * механизм, что на улице: дома строит building.js, опоры и коллизии — индекс
 * поверхностей и солиды из solids.js, граф навигации — NavGraph. Поэтому и
 * физика Чужого, и маршруты врагов на городе ведут себя как на улице.
 *
 * Тротуар поднят над асфальтом на бордюр (меньше шага), поэтому он опора, а не
 * стена: и пешком, и телом Чужого перепад перешагивается. Развязки, эстакады и
 * мосты (следующие этапы главы) добавляются поверх этой сетки.
 */

export class CityMap extends SolidField {
  /**
   * @param {object} spec определение map из уровня: kind, grid, block, street,
   *   curb, sidewalk, navStep, house, seed, spawn — недостающее из CONFIG.city
   */
  constructor(spec = {}) {
    const c = { ...CONFIG.city, ...spec };
    super(CONFIG.building.cell);
    this.cfg = c;
    this.stepUp = CONFIG.building.stepUp;
    const bc = CONFIG.building.cell;

    // планировка: квартал + улица = шаг сетки; по краю мира — улица, поэтому
    // между крайними кварталами и границей мира тоже проезжая часть
    this.pitch = c.block + c.street;
    this.width = this.depth = this.extent = c.grid * c.block + (c.grid + 1) * c.street;
    this.half = this.extent / 2;
    /** минимальная координата i-го квартала */
    this.blockMin = n => -this.half + c.street + n * this.pitch;

    // дома кварталов: габарит берётся из диапазона уровня, но не лезет на тротуар
    const rng = makeRng(c.seed);
    const maxSpan = Math.floor((c.block - 2 * c.sidewalk) / bc);
    const span = (lo, hi) => lo + Math.floor(rng() * (Math.min(hi, maxSpan) - lo + 1));
    /** @type {object[]} данные зданий (generateBuilding) */
    this.buildings = [];
    /** @type {{minX,maxX,minZ,maxZ}[]} габариты кварталов-тротуаров */
    this.blocks = [];
    for (let j = 0; j < c.grid; j++) {
      for (let i = 0; i < c.grid; i++) {
        const minX = this.blockMin(i), minZ = this.blockMin(j);
        const cx = minX + c.block / 2, cz = minZ + c.block / 2;
        this.blocks.push({ minX, maxX: minX + c.block, minZ, maxZ: minZ + c.block });
        this.buildings.push(generateBuilding({
          ...CONFIG.building,
          cols: span(c.house.minCols, c.house.maxCols),
          rows: span(c.house.minRows, c.house.maxRows),
          floors: span(c.house.minFloors, c.house.maxFloors),
          // пол первого этажа — верх подиума: иначе внутри дома ноги опирались
          // бы на бордюр, а точки полов и узлы графа висели ниже своей опоры
          baseY: c.curb,
          offsetX: cx,
          offsetZ: cz,
        }));
      }
    }
    // габариты домов — быстрая отбраковка в коллизиях и при построении графа
    this.boxes = this.buildings.map(b => ({
      minX: b.originX,
      maxX: b.originX + b.cols * b.cell,
      minZ: b.originZ,
      maxZ: b.originZ + b.rows * b.cell,
    }));

    // опоры: тротуар квартала (выше асфальта на бордюр) + полы и ступени домов
    this.surfaces = [];
    for (const blk of this.blocks) this.surfaces.push({ ...blk, y: c.curb });
    for (const b of this.buildings) this.surfaces.push(...buildingSurfaces(b));
    this.bucket = bc * 2;
    this._indexSurfaces();

    // асфальт — плоская земля; бордюр в солиды не попадает: его перешагивают
    this.groundPlane = { y: 0, half: this.half };

    this.bounds = { minX: -this.half, maxX: this.half, minZ: -this.half, maxZ: this.half };
    this.viewHalf = this.half + 24;
    this.spawn = this._findSpawn(spec.spawn);

    this.nav = this._buildNav();
  }

  /** Точка появления: на улице у юго-западного угла города (или из уровня). */
  _findSpawn(pos) {
    const c = this.cfg;
    const x = pos?.x ?? -this.half + c.street / 2;
    const z = pos?.z ?? -this.half + c.street / 2;
    return { x, z, y: this.groundHeightAt(x, z, 0) };
  }

  /** Коллизии габарита: стены домов; тротуар ниже шага стеной не считается. */
  isBlocked(x, z, radius, feetY = 0, height = 2) {
    const half = this.half;
    if (x - radius < -half || x + radius > half || z - radius < -half || z + radius > half) return true;
    for (const b of this.buildings) {
      if (buildingWallHits(b, x, z, radius, feetY, height)) return true;
    }
    return false;
  }

  /**
   * Свободные точки: полы домов + узлы улиц и тротуаров (для объектов уровня).
   * Берём только те, что реально стоят на своей опоре: клетка у нижнего шага
   * марша опирается уже на ступень, и предмет, поставленный на отметку пола,
   * утонул бы в лестнице.
   */
  openPositions() {
    const out = [];
    const cand = [];
    for (const b of this.buildings) cand.push(...buildingFloorPositions(b));
    const top = this.cfg.curb + 0.01;
    for (const p of this.nav.pos) {
      if (p.y <= top) cand.push({ x: p.x, y: p.y, z: p.z });
    }
    for (const p of cand) {
      if (Math.abs(this.groundHeightAt(p.x, p.z, p.y) - p.y) <= 0.02) out.push(p);
    }
    return out;
  }

  worldToNormalized(x, z) {
    const v = this.viewHalf;
    return [
      Math.min(Math.max((x + v) / (2 * v), 0), 1),
      Math.min(Math.max((z + v) / (2 * v), 0), 1),
    ];
  }

  // ---------------------------------------------------------------- навигация

  /**
   * Граф навигации города. Узлы трёх видов: проходимые клетки полов каждого
   * дома (и марши между этажами — см. navBuildingFloors), регулярная решётка
   * улиц и тротуаров с высотой опоры в каждой точке и пороги домов, связанные с
   * ближайшими узлами решётки. Решётка не заходит в габарит домов: внутри дома
   * ходят по клеткам этажей, а наружу выходят через вход.
   */
  _buildNav() {
    const nav = new NavGraph();
    const c = this.cfg;

    for (let n = 0; n < this.buildings.length; n++) {
      navBuildingFloors(nav, n, this.buildings[n]);
    }

    // решётка улиц и тротуаров: шаг по всей площади города, точка вне габарита
    // дома и не задержанная габаритом человека получает узел на своей опоре
    const step = c.navStep;
    const latticeKey = (i, j) => `g:${i}:${j}`;
    const inHouse = (x, z) => this.boxes.some(b =>
      x > b.minX - 0.5 && x < b.maxX + 0.5 && z > b.minZ - 0.5 && z < b.maxZ + 0.5);
    const count = Math.floor(this.extent / step);
    const gx = i => -this.half + (i + 0.5) * step;
    for (let i = 0; i <= count; i++) {
      for (let j = 0; j <= count; j++) {
        const x = gx(i), z = gx(j);
        if (inHouse(x, z)) continue;
        const y = this.groundHeightAt(x, z, 0);
        if (this.isBlocked(x, z, CONFIG.radius, y, CONFIG.eyeHeight)) continue;
        nav.add(x, y, z, latticeKey(i, j));
      }
    }
    // соседние узлы связаны, только если перепад перешагиваем и отрезок между
    // ними свободен для тела: так граф не ведёт сквозь фасад, вписанный в
    // клетку решётки между двумя точками
    const clear = (a, b) => Math.abs(a.y - b.y) <= this.stepUp && this.bodyClearLine(a, b);
    for (let i = 0; i <= count; i++) {
      for (let j = 0; j <= count; j++) {
        const a = nav.id(latticeKey(i, j));
        if (a === undefined) continue;
        for (const [di, dj] of [[1, 0], [0, 1]]) {
          const b = nav.id(latticeKey(i + di, j + dj));
          if (b === undefined) continue;
          if (clear(nav.pos[a], nav.pos[b])) nav.link(a, b);
        }
      }
    }

    // входы домов: порог первого этажа соединяем с решёткой улицы/тротуара
    const nearLattice = p => {
      const out = [];
      const ci = Math.round((p.x + this.half) / step - 0.5);
      const cj = Math.round((p.z + this.half) / step - 0.5);
      for (let i = ci - 2; i <= ci + 2; i++) {
        for (let j = cj - 2; j <= cj + 2; j++) {
          const g = nav.id(latticeKey(i, j));
          if (g === undefined) continue;
          const q = nav.pos[g];
          const d = Math.hypot(q.x - p.x, q.z - p.z);
          if (d > step * 1.6) continue;
          if (!this.bodyClearLine(p, q)) continue;
          out.push(g);
        }
      }
      return out;
    };
    for (let n = 0; n < this.buildings.length; n++) {
      navBuildingDoors(nav, n, this.buildings[n], nearLattice);
    }

    return nav.seal();
  }

  randomNavPoint(x, z, radius) {
    return this.nav.randomPoint(x, z, radius);
  }

  findPath(from, to) {
    return this.nav.findPath(from, to);
  }

  // ---------------------------------------------------------------- постройка

  /**
   * Асфальт, тротуары-подиумы кварталов и дома. Геометрия сливается по
   * материалам: число мешей не зависит от количества кварталов. Твёрдые объёмы
   * домов собирает buildBuildingGeometry; индексируются они в indexSolids().
   */
  build(scene) {
    this.sceneObjects = [];
    const c = this.cfg;
    const mats = {
      asphalt: new THREE.MeshStandardMaterial({ color: c.asphalt, roughness: 1, metalness: 0 }),
      plot: new THREE.MeshStandardMaterial({ color: c.concrete, roughness: .95, metalness: 0 }),
      walls: new THREE.MeshStandardMaterial({ color: c.walls, roughness: .85, metalness: .05 }),
      slabs: new THREE.MeshStandardMaterial({ color: c.slabs, roughness: .9, metalness: .05 }),
      stairs: new THREE.MeshStandardMaterial({ color: c.stairs, roughness: .9, metalness: .05 }),
    };

    const groundGeo = new THREE.PlaneGeometry(this.width, this.depth);
    const ground = new THREE.Mesh(groundGeo, mats.asphalt);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    this.sceneObjects.push({ mesh: ground, geo: groundGeo, mat: mats.asphalt });

    this.solids = [];

    // тротуар: коробка бордюра над асфальтом. Солидом не становится — перепад
    // меньше шага, и тело Чужого, и ноги человека проходят его как ступеньку.
    const plotGeos = [];
    for (const blk of this.blocks) {
      const w = blk.maxX - blk.minX, d = blk.maxZ - blk.minZ;
      const g = new THREE.BoxGeometry(w, c.curb, d);
      g.translate((blk.minX + blk.maxX) / 2, c.curb / 2, (blk.minZ + blk.maxZ) / 2);
      plotGeos.push(g);
    }

    const parts = { walls: [], slabs: [], stairs: [] };
    for (const b of this.buildings) {
      const g = buildBuildingGeometry(b, this.solids);
      for (const key of Object.keys(parts)) if (g[key]) parts[key].push(g[key]);
    }
    this.indexSolids();

    const add = (geos, mat) => {
      if (!geos.length) return;
      const g = mergeGeometries(geos, false);
      const mesh = new THREE.Mesh(g, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      this.sceneObjects.push({ mesh, geo: g, mat });
    };
    add(plotGeos, mats.plot);
    for (const key of Object.keys(parts)) add(parts[key], mats[key]);
  }

  /**
   * Снимает со сцены меши города, их геометрии и свои материалы: всё создано
   * `build` для себя, общих материалов у города нет.
   */
  dispose() {
    for (const o of this.sceneObjects ?? []) {
      o.mesh.parent?.remove(o.mesh);
      o.geo?.dispose?.();
      o.mat?.dispose?.();
    }
    this.sceneObjects = [];
  }

  /** План города: кварталы, улицы и стены домов текущего этажа. */
  drawMinimap(ctx, size, playerPos) {
    const c = this.cfg;
    const toPx = (wx, wz) => {
      const [u, v] = this.worldToNormalized(wx, wz);
      return [u * size, v * size];
    };

    ctx.fillStyle = '#12161d'; // асфальт
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#2b333d'; // кварталы-тротуары
    for (const blk of this.blocks) {
      const [x0, z0] = toPx(blk.minX, blk.minZ);
      const [x1, z1] = toPx(blk.maxX, blk.maxZ);
      ctx.fillRect(x0, z0, x1 - x0, z1 - z0);
    }

    const floorHeight = CONFIG.building.floorHeight;
    const y = playerPos?.y ?? 0;
    const label = Math.max(0, Math.floor(y / floorHeight));
    // внутри дома рисуем его этаж, снаружи — габарит (стены первого этажа)
    const inside = this.buildings.some(b =>
      playerPos && playerPos.x > b.originX && playerPos.x < b.originX + b.cols * b.cell &&
      playerPos.z > b.originZ && playerPos.z < b.originZ + b.rows * b.cell);

    for (const b of this.buildings) {
      const k = inside ? Math.min(label, b.floors - 1) : 0;
      const grid = b.levels[k];
      for (let j = 0; j < b.rows; j++) {
        for (let i = 0; i < b.cols; i++) {
          const cc = grid[j][i];
          if (cc === VOID) continue;
          const [x0, z0] = toPx(b.originX + i * b.cell, b.originZ + j * b.cell);
          const [x1, z1] = toPx(b.originX + (i + 1) * b.cell, b.originZ + (j + 1) * b.cell);
          ctx.fillStyle = cc === WALL ? '#0b0f14'
            : cc === WINDOW ? '#1d2c3e'
            : cc === HOLE ? '#4a3c24'
            : 'rgba(150,168,190,.35)';
          ctx.fillRect(x0, z0, Math.max(x1 - x0, 1), Math.max(z1 - z0, 1));
        }
      }
    }

    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(inside && y > c.curb ? `Этаж ${label + 1}` : 'Улица', 10, 10);
  }
}

/**
 * Создаёт карту города по определению уровня (см. map-секцию главы).
 * Всё необязательно: недостающее берётся из CONFIG.city.
 */
export function createCityMap(spec = {}) {
  return new CityMap(spec);
}
