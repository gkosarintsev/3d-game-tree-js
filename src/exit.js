import * as THREE from 'three';

/**
 * Цель главы-перехода «из A в B»: светящийся маяк в точке B. Движок проверяет
 * достижение по расстоянию до игрока; слушателей маяк не вешает, поэтому dispose
 * убирает только меши из сцены.
 */
export class ExitGoal {
  /**
   * @param {THREE.Scene} scene
   * @param {object} map карта уровня (для опорной поверхности под маяком)
   * @param {{x:number, z:number}} pos точка B
   * @param {number} radius радиус достижения
   */
  constructor(scene, map, pos, radius) {
    this.x = pos.x;
    this.z = pos.z;
    this.radius = radius;
    this.y = map.groundHeightAt(pos.x, pos.z, 500);

    this.group = new THREE.Group();
    this.pad = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius * 1.1, 0.2, 28),
      new THREE.MeshStandardMaterial({
        color: 0x2fd6c9, emissive: 0x1fb2a8, emissiveIntensity: 1.2, roughness: 0.4,
      }),
    );
    this.pad.position.set(this.x, this.y + 0.1, this.z);
    this.beam = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.45, radius * 0.8, 26, 20, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0x6fe8dd, transparent: true, opacity: 0.16,
        side: THREE.DoubleSide, depthWrite: false,
      }),
    );
    this.beam.position.set(this.x, this.y + 13, this.z);
    this.group.add(this.pad, this.beam);
    scene.add(this.group);
  }

  /** Пульсация маяка — чтобы цель была заметна издалека. */
  update(time) {
    const p = 1 + Math.sin(time * 2.4) * 0.12;
    this.pad.scale.set(p, 1, p);
    this.beam.material.opacity = 0.1 + Math.max(0, Math.sin(time * 2.4)) * 0.09;
  }

  /** Игрок внутри радиуса и на высоте площадки — глава пройдена. */
  reached(p) {
    return Math.hypot(p.x - this.x, p.z - this.z) < this.radius &&
      Math.abs(p.y - this.y) < 3;
  }

  dispose(scene) {
    scene.remove(this.group);
    this.pad.geometry.dispose();
    this.beam.geometry.dispose();
    this.pad.material.dispose();
    this.beam.material.dispose();
  }
}
