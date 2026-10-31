import * as THREE from 'three';

/**
 * Пул короткоживущих трассеров — линий, отмечающих выстрел. Линии берутся из
 * заранее созданных объектов и возвращаются в пул, поэтому стрельба не создаёт
 * мусора для сборщика.
 */
export class Tracers {
  /**
   * @param {THREE.Scene} scene
   * @param {number} max максимальное число одновременно видимых трассеров
   */
  constructor(scene, max = 40) {
    this.pool = [];
    this.active = [];

    for (let i = 0; i < max; i++) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
      const material = new THREE.LineBasicMaterial({
        transparent: true, depthWrite: false, fog: false,
      });
      const line = new THREE.Line(geometry, material);
      line.frustumCulled = false;
      line.visible = false;
      scene.add(line);
      this.pool.push(line);
    }
  }

  /** Показать линию выстрела от from до to. */
  spawn(from, to, color = 0xffe08a, life = 0.07) {
    const line = this.pool.pop();
    if (!line) return;
    const p = line.geometry.attributes.position.array;
    p[0] = from.x; p[1] = from.y; p[2] = from.z;
    p[3] = to.x; p[4] = to.y; p[5] = to.z;
    line.geometry.attributes.position.needsUpdate = true;
    line.material.color.setHex(color);
    line.material.opacity = 1;
    line.visible = true;
    this.active.push({ line, life, maxLife: life });
  }

  /** Плавно гасит линии и освобождает их в пул. */
  update(dt) {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const t = this.active[i];
      t.life -= dt;
      if (t.life <= 0) {
        t.line.visible = false;
        this.pool.push(t.line);
        this.active.splice(i, 1);
      } else {
        t.line.material.opacity = t.life / t.maxLife;
      }
    }
  }
}
