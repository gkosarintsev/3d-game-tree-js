/**
 * Декор улицы и крыш: пальмы, фонари, кровельное оборудование.
 *
 * Всё это чистая визуальная геометрия — коллизий и солидов декор не создаёт,
 * поэтому физика игрока, Чужого и навигация врагов остаются нетронутыми.
 * Геометрия объединяется по материалам: независимо от числа объектов
 * сцена получает лишь несколько дополнительных мешей.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { VOID, HOLE } from './building.js';
import { makeRng } from './rng.js';

/** Пальма: сегментированный ствол, крона из листьев-конусов и кокосы. */
function pushPalm(x, z, rng, trunkGeos, leafGeos) {
  const h = 5.5 + rng() * 3;
  const lean = (rng() - 0.5) * 0.25;
  const segs = 5;
  for (let s = 0; s < segs; s++) {
    const t0 = s / segs;
    const r0 = 0.28 - 0.12 * t0;
    const g = new THREE.CylinderGeometry(r0 * 0.85, r0, h / segs, 7);
    g.translate(x + lean * h * (t0 + 1 / segs), h * (t0 + 0.5 / segs), z);
    trunkGeos.push(g);
  }
  const topX = x + lean * h;

  const fronds = 7 + Math.floor(rng() * 3);
  const topY = h;
  for (let f = 0; f < fronds; f++) {
    const len = 2.6 + rng() * 1.2;
    const g = new THREE.ConeGeometry(0.42, len, 4);
    g.scale(1, 1, 0.32);
    g.translate(0, len / 2, 0);
    g.rotateX(Math.PI / 2 + 0.3 + rng() * 0.25); // почти горизонтально, с провисом
    g.rotateY((f / fronds) * Math.PI * 2 + rng() * 0.4);
    g.translate(topX, topY, z);
    leafGeos.push(g);
  }
  for (let c = 0; c < 3; c++) {
    const g = new THREE.SphereGeometry(0.16, 6, 5);
    const a = rng() * Math.PI * 2;
    g.translate(topX + Math.cos(a) * 0.4, topY - 0.35, z + Math.sin(a) * 0.4);
    trunkGeos.push(g);
  }
}

/** Фонарь: столб с базой, Г-образный выпуск и светящаяся лампа. */
function pushLamp(z, armSign, x, poleGeos, bulbGeos) {
  const h = 6.2;
  const base = new THREE.BoxGeometry(0.8, 0.35, 0.8);
  base.translate(x, 0.175, z);
  poleGeos.push(base);
  const pole = new THREE.CylinderGeometry(0.11, 0.14, h, 7);
  pole.translate(x, h / 2, z);
  poleGeos.push(pole);
  const arm = new THREE.BoxGeometry(0.16, 0.16, 1.6);
  arm.translate(x, h - 0.1, z + armSign * 0.8);
  poleGeos.push(arm);
  const bulb = new THREE.SphereGeometry(0.34, 8, 7);
  bulb.translate(x, h - 0.4, z + armSign * 1.5);
  bulbGeos.push(bulb);
}

/**
 * Кровельное оборудование дома: бак, кондиционеры и вытяжные короба.
 * Ставим только на клетки с крышей, подальше от лестничной шахты (лаза).
 */
function pushRoofProps(b, rng, propGeos, count) {
  const { cols, rows, cell, floors, floorHeight, originX, originZ, levels, stair } = b;
  const grid = levels[floors - 1];
  const roofY = floors * floorHeight;
  const cells = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const c = grid[j][i];
      if (c === VOID || c === HOLE) continue;
      if (i >= stair.i0 - 2 && i <= stair.i1 + 2 && j >= stair.j0 - 2 && j <= stair.j1 + 2) continue;
      cells.push([i, j]);
    }
  }
  // перемешиваем и берём клетки с расстоянием друг от друга
  for (let n = cells.length - 1; n > 0; n--) {
    const k = Math.floor(rng() * (n + 1));
    [cells[n], cells[k]] = [cells[k], cells[n]];
  }
  const chosen = [];
  for (const [i, j] of cells) {
    if (chosen.length >= count) break;
    if (chosen.every(([a, c]) => Math.hypot(i - a, j - c) > 3)) chosen.push([i, j]);
  }
  for (const [i, j] of chosen) {
    const cx = originX + (i + 0.5) * cell;
    const cz = originZ + (j + 0.5) * cell;
    const kind = rng();
    if (kind < 0.3) { // бак на ножках
      const tank = new THREE.CylinderGeometry(1.05, 1.05, 2.2, 8);
      tank.translate(cx, roofY + 2.6, cz);
      propGeos.push(tank);
      const lid = new THREE.CylinderGeometry(0.8, 1.05, 0.35, 8);
      lid.translate(cx, roofY + 3.85, cz);
      propGeos.push(lid);
    } else if (kind < 0.65) { // кондиционер
      const unit = new THREE.BoxGeometry(1.7, 0.95, 1.5);
      unit.rotateY(rng() * Math.PI);
      unit.translate(cx, roofY + 0.475, cz);
      propGeos.push(unit);
    } else { // вытяжной короб с раструбом
      const duct = new THREE.BoxGeometry(1.2, 0.7, 1.2);
      duct.translate(cx, roofY + 0.35, cz);
      propGeos.push(duct);
      const cap = new THREE.BoxGeometry(0.7, 0.5, 0.7);
      cap.translate(cx, roofY + 0.95, cz);
      propGeos.push(cap);
    }
  }
}

/** Строит весь декор и добавляет его в сцену. */
export function buildDecor(scene, map) {
  const cfg = map.decor;
  const rng = makeRng(cfg.seed ?? 0xc0ffee);
  const half = map.width / 2 - 12;
  const inAnyBox = (x, z, m) => map.boxes.some(b =>
    x > b.minX - m && x < b.maxX + m && z > b.minZ - m && z < b.maxZ + m);

  const trunkGeos = [];
  const leafGeos = [];
  const poleGeos = [];
  const bulbGeos = [];
  const propGeos = [];

  // фонари вдоль южного фасада (улица со стороны минимального Z,
  // выпуск консоли направлен к краю улицы)
  const lampZ = map.bounds.minZ - 6;
  const lampXs = [];
  for (let x = map.bounds.minX + 8; x <= map.bounds.maxX - 8; x += cfg.lampSpacing) {
    lampXs.push(x);
    pushLamp(lampZ, -1, x, poleGeos, bulbGeos);
  }

  // пальмы: случайные точки на улице, вне габаритов домов и в стороне от спавна
  const placed = [];
  let tries = 0;
  while (placed.length < cfg.palms && tries < 600) {
    tries++;
    const x = -half + rng() * 2 * half;
    const z = -half + rng() * 2 * half;
    if (inAnyBox(x, z, 5)) continue;
    if (Math.hypot(x - map.spawn.x, z - map.spawn.z) < 9) continue;
    if (placed.some(p => Math.hypot(p.x - x, p.z - z) < 7)) continue;
    placed.push({ x, z });
    pushPalm(x, z, rng, trunkGeos, leafGeos);
  }

  // оборудование крыш каждого дома
  for (const b of map.buildings) pushRoofProps(b, rng, propGeos, cfg.roofPropsPerBuilding);

  const mats = {
    trunk: new THREE.MeshStandardMaterial({ color: 0x8a6a45, roughness: 0.95 }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x3f9b4f, roughness: 0.8 }),
    pole: new THREE.MeshStandardMaterial({ color: 0x3a4049, roughness: 0.6, metalness: 0.5 }),
    bulb: new THREE.MeshStandardMaterial({
      color: 0xfff2cf, emissive: 0xffd9a0, emissiveIntensity: 1.6, roughness: 0.4,
    }),
    prop: new THREE.MeshStandardMaterial({ color: 0x7c828c, roughness: 0.7, metalness: 0.35 }),
  };

  const add = (geos, mat) => {
    if (!geos.length) return;
    const mesh = new THREE.Mesh(mergeGeometries(geos, false), mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  };
  add(trunkGeos, mats.trunk);
  add(leafGeos, mats.leaf);
  add(poleGeos, mats.pole);
  add(bulbGeos, mats.bulb);
  add(propGeos, mats.prop);
}
