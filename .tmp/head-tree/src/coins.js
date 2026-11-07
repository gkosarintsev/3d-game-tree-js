import * as THREE from 'three';
import { beep } from './audio.js';

/** Набор монет: спавн по карте, анимация и подбор. */
export class Coins {
  /**
   * @param {THREE.Scene} scene
   * @param {{openPositions:Function, spawn:{x:number,z:number}}} map
   * @param {number} total
   * @param {number} minSpawnDistance  минимальное расстояние от точки старта
   */
  constructor(scene, map, total, minSpawnDistance) {
    this.scene = scene;
    this.total = total;
    this.collected = 0;
    this.items = [];

    const geometry = new THREE.IcosahedronGeometry(0.34, 0);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffd76a, emissive: 0xffab1a, emissiveIntensity: 1.4, roughness: .3, metalness: .6,
    });

    const candidates = map.openPositions();
    const spawn = map.spawn;
    const used = new Set();

    while (this.items.length < total) {
      const p = candidates[Math.floor(Math.random() * candidates.length)];
      const key = `${p.x.toFixed(1)},${p.y.toFixed(1)},${p.z.toFixed(1)}`;
      if (used.has(key)) continue;
      if (Math.hypot(p.x - spawn.x, p.z - spawn.z) < minSpawnDistance) continue;
      used.add(key);

      const baseY = (isFinite(p.y) ? p.y : 0) + 1.1;
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(p.x, baseY, p.z);
      mesh.userData.baseY = baseY;
      mesh.userData.phase = Math.random() * Math.PI * 2;
      // карта теней заморожена (сцена статична), поэтому монеты её не обновляют
      mesh.castShadow = false;
      scene.add(mesh);
      this.items.push(mesh);
    }
  }

  get remaining() { return this.items.length; }

  /**
   * Анимирует монеты и проверяет подбор рядом с игроком.
   * @returns {boolean} true, если в этом кадре собрана хотя бы одна монета
   */
  update(dt, playerPos, time) {
    let picked = false;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const coin = this.items[i];
      coin.rotation.y += dt * 2.2;
      coin.rotation.x += dt * 0.8;
      coin.position.y = coin.userData.baseY + Math.sin(time * 2 + coin.userData.phase) * 0.18;

      const dx = coin.position.x - playerPos.x;
      const dy = coin.position.y - playerPos.y;
      const dz = coin.position.z - playerPos.z;
      if (dx * dx + dy * dy + dz * dz < 1.6) {
        this.scene.remove(coin);
        this.items.splice(i, 1);
        this.collected++;
        beep(880 + this.collected * 70, 0.1);
        picked = true;
      }
    }
    return picked;
  }

  /** Монеты, ещё лежащие на карте (для миникарты). */
  forEachVisible(fn) {
    for (const coin of this.items) fn(coin.position);
  }
}
