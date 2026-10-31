import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { CONFIG } from './config.js';
import { beep } from './audio.js';

/**
 * Игрок: обзор мышью (PointerLockControls), движение, прыжки и ходьба по
 * полу этажей и ступеням лестниц. Источник коллизий и высоты опоры — объект
 * карты, реализующий контракт (см. map.js): методы groundHeightAt(x, z, fromY)
 * и isBlocked(x, z, radius, feetY, height).
 */
export class Player {
  constructor(camera, domElement, map) {
    this.camera = camera;
    this.map = map;
    this.controls = new PointerLockControls(camera, domElement);

    this.keys = new Set();
    this.velocity = new THREE.Vector3();
    this.verticalVelocity = 0;
    this.feetY = 0; // высота ног (по поверхности рельефа)
    this.bob = 0;

    // здоровье и состояние боя
    this.maxHealth = CONFIG.health.max;
    this.health = this.maxHealth;
    this.hurt = 0;            // затухающая вспышка урона (0..1) для интерфейса
    this._lastDamage = -1e9;  // время последнего урона (для регенерации)

    this._forward = new THREE.Vector3(0, 0, -1);
    this._right = new THREE.Vector3();
    this._up = new THREE.Vector3(0, 1, 0);
    this._wish = new THREE.Vector3();

    this._bindInput();
  }

  get position() { return this.camera.position; }
  get direction() { return this._forward; }
  get isLocked() { return this.controls.isLocked; }
  get dead() { return this.health <= 0; }

  lock() { this.controls.lock(); }
  unlock() { this.controls.unlock(); }

  /** Урон от врага: снимает здоровье и запускает вспышку/регенерацию. */
  takeDamage(amount) {
    if (this.dead) return;
    this.health = Math.max(0, this.health - amount);
    this.hurt = 1;
    this._lastDamage = performance.now() / 1000;
  }

  _bindInput() {
    addEventListener('keydown', e => {
      this.keys.add(e.code);
      if (e.code === 'Space') e.preventDefault();
    });
    addEventListener('keyup', e => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());
  }

  /** Ставит игрока в указанную точку карты (ноги — на опорную поверхность). */
  spawnAt(point) {
    const ground = this.map.groundHeightAt(point.x, point.z, point.y || 0);
    this.feetY = isFinite(ground) ? ground : 0;
    this.camera.position.set(point.x, this.feetY + CONFIG.eyeHeight, point.z);
    this.verticalVelocity = 0;
    this.velocity.set(0, 0, 0);
  }

  /** Обновление физики за кадр (вызывать только при активном управлении). */
  update(dt) {
    const { camera, keys, map } = this;
    const cfg = CONFIG;

    camera.getWorldDirection(this._forward);
    this._forward.y = 0;
    if (this._forward.lengthSq() < 1e-6) this._forward.set(0, 0, -1);
    this._forward.normalize();
    this._right.copy(this._forward).cross(this._up).normalize();

    const f = (keys.has('KeyW') ? 1 : 0) - (keys.has('KeyS') ? 1 : 0);
    const s = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0);
    this._wish.set(0, 0, 0).addScaledVector(this._forward, f).addScaledVector(this._right, s);
    const moving = this._wish.lengthSq() > 1e-6;
    if (moving) this._wish.normalize();

    const speed = keys.has('ShiftLeft') || keys.has('ShiftRight') ? cfg.speed.run : cfg.speed.walk;
    this._wish.multiplyScalar(speed);
    const k = moving ? 1 - Math.exp(-14 * dt) : 1 - Math.exp(-9 * dt);
    this.velocity.x += (this._wish.x - this.velocity.x) * k;
    this.velocity.z += (this._wish.z - this.velocity.z) * k;

    // движение с раздельным разрешением коллизий по осям
    const height = cfg.eyeHeight + 0.35;
    const nx = camera.position.x + this.velocity.x * dt;
    if (!map.isBlocked(nx, camera.position.z, cfg.radius, this.feetY, height)) camera.position.x = nx; else this.velocity.x = 0;
    const nz = camera.position.z + this.velocity.z * dt;
    if (!map.isBlocked(camera.position.x, nz, cfg.radius, this.feetY, height)) camera.position.z = nz; else this.velocity.z = 0;

    // прыжок и притяжение относительно опорной поверхности (пол этажа/ступень)
    const ground = map.groundHeightAt(camera.position.x, camera.position.z, this.feetY);
    const onGround = this.feetY <= ground + 0.02 && this.verticalVelocity <= 0;
    if (keys.has('Space') && onGround) { this.verticalVelocity = cfg.jump; beep(180, 0.07, 'triangle'); }
    this.verticalVelocity -= cfg.gravity * dt;
    this.feetY += this.verticalVelocity * dt;
    if (this.feetY <= ground) { this.feetY = ground; this.verticalVelocity = 0; }

    // покачивание головы
    const sp = Math.hypot(this.velocity.x, this.velocity.z);
    this.bob += dt * sp * 1.7;
    camera.position.y = this.feetY + cfg.eyeHeight + Math.sin(this.bob * 2) * 0.035 * Math.min(sp / 4, 1);

    // заживление после затишья и затухание вспышки урона
    const now = performance.now() / 1000;
    if (this.health > 0 && this.health < this.maxHealth &&
        now - this._lastDamage > cfg.health.regenDelay) {
      this.health = Math.min(this.maxHealth, this.health + cfg.health.regenRate * dt);
    }
    this.hurt = Math.max(0, this.hurt - dt * 2.5);
  }
}
