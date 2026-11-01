import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CONFIG } from './config.js';
import { beep } from './audio.js';

/**
 * Оружие игрока: модель в руках, стрельба лучом из центра экрана, попадания по
 * врагам с учётом стен (map.rayHitDistance), трассеры, вспышка и отдача.
 *
 * Огонь — по удержанию ЛКМ, с паузой CONFIG.weapon.fireDelay между выстрелами.
 * Стрелять можно только при захваченном курсоре (активное управление).
 */
export class Weapon {
  /**
   * @param {THREE.Camera} camera
   * @param {import('./map.js').TownMap} map
   * @param {import('./player.js').Player} player
   * @param {import('./enemies.js').Enemies} enemies
   * @param {import('./effects.js').Tracers} tracers
   * @param {Function} onHit вызывается при попадании по врагу
   */
  constructor(camera, map, player, enemies, tracers, onHit) {
    this.camera = camera;
    this.map = map;
    this.player = player;
    this.enemies = enemies;
    this.tracers = tracers;
    this.onHit = onHit;

    this.cooldown = 0;
    this.firing = false;
    this.recoil = 0;
    this.flashTime = 0;

    this._origin = new THREE.Vector3();
    this._dir = new THREE.Vector3();
    this._end = new THREE.Vector3();
    this._muzzle = new THREE.Vector3();

    this._buildViewModel();
    this._bindInput();
  }

  /** Модель оружия в правом нижнем углу и вспышка у дула. */
  _buildViewModel() {
    const box = (w, h, d, x, y, z) => {
      const g = new THREE.BoxGeometry(w, h, d);
      g.translate(x, y, z);
      return g;
    };
    const gun = new THREE.Mesh(
      mergeGeometries([
        box(0.10, 0.12, 0.55, 0, 0, -0.18),    // корпус
        box(0.05, 0.05, 0.34, 0, 0.02, -0.55), // ствол
        box(0.09, 0.20, 0.12, 0, -0.14, -0.02),// рукоять
        box(0.07, 0.07, 0.16, 0, -0.08, -0.34),// магазин
        box(0.03, 0.05, 0.03, 0, 0.09, -0.40), // мушка
      ], false),
      new THREE.MeshStandardMaterial({ color: 0x2b2f36, roughness: .55, metalness: .7 }),
    );
    gun.castShadow = false;

    this.group = new THREE.Group();
    this.group.add(gun);
    this.group.position.set(0.26, -0.22, -0.45);
    this.camera.add(this.group);

    this.flash = new THREE.Mesh(
      new THREE.PlaneGeometry(0.34, 0.34),
      new THREE.MeshBasicMaterial({
        color: 0xffd27a, transparent: true, opacity: 0.9, depthWrite: false,
        blending: THREE.AdditiveBlending, fog: false,
      }),
    );
    this.flash.position.set(0, 0.02, -0.74);
    this.flash.visible = false;
    this.group.add(this.flash);
  }

  _bindInput() {
    this._onMouseDown = e => {
      if (e.button !== 0 || !this.player.isLocked) return;
      this.firing = true;
      this._tryFire();
    };
    this._onMouseUp = e => {
      if (e.button === 0) this.firing = false;
    };
    this._onBlur = () => { this.firing = false; };
    addEventListener('mousedown', this._onMouseDown);
    addEventListener('mouseup', this._onMouseUp);
    addEventListener('blur', this._onBlur);
  }

  /** Снимает слушатели и модель с камеры при выгрузке уровня. */
  dispose() {
    removeEventListener('mousedown', this._onMouseDown);
    removeEventListener('mouseup', this._onMouseUp);
    removeEventListener('blur', this._onBlur);
    this.camera.remove(this.group);
  }

  /** Выстрел, если пауза между выстрелами истекла. */
  _tryFire() {
    if (this.cooldown > 0) return;
    const w = CONFIG.weapon;
    this.cooldown = w.fireDelay;
    this.recoil = 1;
    this.flashTime = 0.045;
    this.flash.visible = true;
    this.flash.rotation.z = Math.random() * Math.PI;

    this.camera.getWorldDirection(this._dir);
    this._dir.x += (Math.random() - 0.5) * w.spread;
    this._dir.y += (Math.random() - 0.5) * w.spread;
    this._dir.z += (Math.random() - 0.5) * w.spread;
    this._dir.normalize();
    this._origin.copy(this.camera.position);

    // до стены и до врага: поражаем только то, что ближе
    const wall = this.map.rayHitDistance(
      this._origin.x, this._origin.y, this._origin.z,
      this._dir.x, this._dir.y, this._dir.z, w.range,
    );
    const hit = this.enemies.raycast(this._origin, this._dir, Math.min(wall, w.range));

    if (hit) {
      hit.enemy.takeDamage(w.damage);
      this._end.copy(hit.point);
      if (this.onHit) this.onHit();
    } else {
      this._end.copy(this._dir).multiplyScalar(Math.min(wall, w.range)).add(this._origin);
    }

    this.flash.getWorldPosition(this._muzzle);
    this.tracers.spawn(this._muzzle, this._end, 0xfff0b0, 0.06);
    beep(240, 0.05, 'square');
  }

  update(dt) {
    if (this.cooldown > 0) this.cooldown -= dt;
    if (this.firing && this.player.isLocked && this.cooldown <= 0) this._tryFire();

    // отдача: ствол уходит назад и вверх, затем плавно возвращается
    this.recoil = Math.max(0, this.recoil - dt * 7);
    this.group.position.z = -0.45 + this.recoil * 0.07;
    this.group.rotation.x = this.recoil * 0.22;

    if (this.flashTime > 0) {
      this.flashTime -= dt;
      if (this.flashTime <= 0) this.flash.visible = false;
    }
  }
}
