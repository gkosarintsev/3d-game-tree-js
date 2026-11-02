import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Окружение уровня из JSON: деревья, скамейки, тумбы, фонари и опоры эстакады.
 *
 * Каждый тип — один `InstancedMesh` на материал, поэтому два десятка деревьев и
 * сорок опор добавляют в сцену несколько мешей вместо сотен: район главы 3 уже
 * учитывал цену каждого меша, а глава 9 несёт 60+ предметов.
 *
 * Коллизий предметы не создают — правило о декоре в AGENTS.md: твёрдость уровня
 * держат стены, плиты и настилы, а проходовость не зависит от украшений. Опора
 * моста здесь исключение по смыслу, но не по механике: она visual, потому что
 * человек и Чужой проходят между ними по улице, как проходят между пальмами.
 *
 * Geometry каждого типа построена в локальных метрах с основанием на y = 0,
 * поэтому scale и position из данных главы ставят предмет на свою опору.
 */

/** Материалы общие для всех типов: инстанс получает один материал на меш. */
const MATERIALS = {
  bark: new THREE.MeshStandardMaterial({ color: 0x6b5136, roughness: 0.95 }),
  leaf: new THREE.MeshStandardMaterial({ color: 0x3f7f45, roughness: 0.85 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x8a6a45, roughness: 0.9 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x3a4049, roughness: 0.6, metalness: 0.5 }),
  concrete: new THREE.MeshStandardMaterial({ color: 0x707681, roughness: 0.95 }),
  glow: new THREE.MeshStandardMaterial({
    color: 0xfff2cf, emissive: 0xffd9a0, emissiveIntensity: 1.4, roughness: 0.4,
  }),
};

const box = (w, h, d, x, y, z) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);
const cyl = (rTop, rBottom, h, x, y, z, segs = 8) =>
  new THREE.CylinderGeometry(rTop, rBottom, h, segs).translate(x, y, z);

/**
 * Части каждого типа: геометрия + ключ материала. Один тип — до двух мешей
 * (тело и светящаяся голова фонаря), поэтому число мешей уровня не растёт с
 * числом предметов.
 */
const PARTS = {
  tree: () => [
    { mat: 'bark', geo: [cyl(0.16, 0.26, 3.2, 0, 1.6, 0)] },
    { mat: 'leaf', geo: [
      new THREE.IcosahedronGeometry(1.7, 1).scale(1, 0.72, 1).translate(0, 3.9, 0),
      new THREE.IcosahedronGeometry(1.1, 1).scale(1, 0.8, 1).translate(0.8, 3.1, -0.5),
    ] },
  ],
  bench: () => [
    { mat: 'wood', geo: [box(1.9, 0.1, 0.55, 0, 0.45, 0), box(1.9, 0.5, 0.08, 0, 0.75, -0.26)] },
    { mat: 'metal', geo: [box(0.08, 0.45, 0.5, -0.8, 0.225, 0), box(0.08, 0.45, 0.5, 0.8, 0.225, 0)] },
  ],
  bollard: () => [
    { mat: 'metal', geo: [cyl(0.13, 0.15, 0.85, 0, 0.425, 0, 7), cyl(0.05, 0.13, 0.12, 0, 0.91, 0, 7)] },
  ],
  lamp_post: () => [
    { mat: 'metal', geo: [box(0.5, 0.3, 0.5, 0, 0.15, 0), cyl(0.09, 0.13, 6, 0, 3.3, 0, 7), box(0.12, 0.12, 1.1, 0, 6.25, 0.5)] },
    { mat: 'glow', geo: [box(0.46, 0.16, 0.34, 0, 6.14, 0.95)] },
  ],
  // блок 1×1×1 с основанием на y = 0: scale из данных задаёт сечение и высоту
  concrete_pillar: () => [
    { mat: 'concrete', geo: [box(1, 1, 1, 0, 0.5, 0)] },
  ],
};

/** @returns {string[]} типы, доступные уровню из JSON (проверяются схемой) */
export function propModels() {
  return Object.keys(PARTS);
}

/**
 * Ставит предметы в сцену одним InstancedMesh на пару «тип + материал».
 * @param {THREE.Scene} scene
 * @param {{model:string, position:{x,y,z}, scale:{x,y,z}, rotationY:number}[]} props
 *   данные нормализатора (src/levels/level-09.json → tools/normalize-level.mjs)
 * @returns {THREE.Object3D[]} меши — чтобы карта могла снять их при перестройке
 */
export function buildProps(scene, props) {
  const meshes = [];
  const byModel = new Map();
  for (const p of props ?? []) {
    if (!PARTS[p.model]) continue;
    if (!byModel.has(p.model)) byModel.set(p.model, []);
    byModel.get(p.model).push(p);
  }
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const pos = new THREE.Vector3();
  const scl = new THREE.Vector3();
  const m = new THREE.Matrix4();

  for (const [model, items] of byModel) {
    for (const part of PARTS[model]()) {
      const mesh = new THREE.InstancedMesh(mergeGeometries(part.geo, false), MATERIALS[part.mat], items.length);
      items.forEach((it, i) => {
        e.set(0, ((it.rotationY ?? 0) * Math.PI) / 180, 0);
        q.setFromEuler(e);
        pos.set(it.position.x, it.position.y, it.position.z);
        scl.set(it.scale?.x ?? 1, it.scale?.y ?? 1, it.scale?.z ?? 1);
        mesh.setMatrixAt(i, m.compose(pos, q, scl));
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      meshes.push(mesh);
    }
  }
  return meshes;
}
