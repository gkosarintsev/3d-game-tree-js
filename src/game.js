import * as THREE from 'three';
import { CONFIG } from './config.js';
import { createTownMap } from './map.js';
import { Coins } from './coins.js';
import { Player } from './player.js';
import { Alien } from './alien.js';
import { Hud } from './hud.js';
import { Enemies } from './enemies.js';
import { Weapon } from './weapon.js';
import { Tracers } from './effects.js';
import { winTune } from './audio.js';

/**
 * Игра: связывает карту, игрока, врагов, объекты и интерфейс, управляет
 * состоянием и игровым циклом.
 *
 * Состояния: 'menu' | 'playing' | 'paused' | 'won' | 'dead'.
 * На старте показывается экран выбора персонажа: человек (стрельба) или
 * Чужой (лазание по поверхностям и далёкий скачок).
 */
export class Game {
  constructor() {
    this._initRenderer();

    this.map = this.createMap();
    this._initScene();
    this.map.build(this.scene);

    this.coins = new Coins(this.scene, this.map, CONFIG.totalCoins, CONFIG.minCoinDistance);
    this.hud = new Hud();
    this.tracers = new Tracers(this.scene);

    // активный персонаж создаётся после выбора роли (см. _startRole)
    this.player = null;
    this.enemies = null;
    this.weapon = null;
    this.role = null;

    this.state = 'menu';
    this.startTime = 0;
    this.elapsed = 0;
    this.clock = new THREE.Clock();

    // клик по оверлею возвращает управление только из паузы
    this.hud.requestLock(() => {
      if (this.state === 'paused' && this.player) this.player.lock();
    });
    addEventListener('resize', () => this._onResize());

    this._tick = this._tick.bind(this);

    // обзорный вид улицы за экраном выбора
    this.camera.position.set(this.map.spawn.x, 7, this.map.bounds.minZ - 6);
    this.camera.lookAt(this.map.spawn.x, 9, 0);

    this.hud.showCharacterSelect(role => this._startRole(role));
  }

  /**
   * Создаёт карту уровня.
   * Точка замены: чтобы сменить тип уровня, достаточно вернуть здесь другую
   * реализацию контракта карты (см. src/map.js).
   */
  createMap() {
    return createTownMap();
  }

  /** Выбор роли: создаёт персонажа, врагов и оружие, затем захватывает курсор. */
  _startRole(role) {
    this.role = role;
    this.hud.setRole(role);

    if (role === 'alien') {
      this.player = new Alien(this.camera, this.renderer.domElement, this.map, () => this.enemies);
    } else {
      this.player = new Player(this.camera, this.renderer.domElement, this.map);
    }
    this.player.spawnAt(this.map.spawn);
    // человек разворачивается лицом к домам (Чужой задаёт ориентацию сам)
    if (role !== 'alien') this.camera.lookAt(this.map.spawn.x, this.camera.position.y, 0);

    this.enemies = new Enemies(this.scene, this.map, this.player, this.camera, this.tracers);
    this.weapon = role === 'alien' ? null : new Weapon(
      this.camera, this.map, this.player, this.enemies, this.tracers,
      () => this.hud.hitMarker(),
    );

    this.hud.setCoins(0, this.coins.total);
    this.hud.setKills(0);
    this.hud.setHealth(this.player.health, this.player.maxHealth);

    this.player.controls.addEventListener('lock', () => this._onLock());
    this.player.controls.addEventListener('unlock', () => this._onUnlock());
    this.player.lock();
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // сцена статична (дома и земля не двигаются): карту теней считаем один раз
    this.renderer.shadowMap.autoUpdate = false;
    document.body.appendChild(this.renderer.domElement);
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(CONFIG.sky);
    this.scene.fog = new THREE.Fog(CONFIG.fog.color, CONFIG.fog.near, CONFIG.fog.far);

    const cam = CONFIG.camera;
    this.camera = new THREE.PerspectiveCamera(cam.fov, innerWidth / innerHeight, cam.near, cam.far);
    this.scene.add(this.camera);

    // дневное освещение: солнце + полусферический свет неба
    const s = CONFIG.sun;
    const sun = new THREE.DirectionalLight(s.color, s.intensity);
    sun.position.set(s.position[0], s.position[1], s.position[2]);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.001;
    sun.shadow.normalBias = 0.05;
    // тени считаем вокруг всей улицы, а не по всей плоской земле
    const b = this.map.bounds;
    const extent = Math.max(
      Math.abs(b.minX), Math.abs(b.maxX), Math.abs(b.minZ), Math.abs(b.maxZ),
    ) + 30;
    const cam3 = sun.shadow.camera;
    cam3.left = -extent; cam3.right = extent;
    cam3.top = extent; cam3.bottom = -extent;
    cam3.near = 1; cam3.far = 800;
    cam3.updateProjectionMatrix();
    this.scene.add(sun);
    this.scene.add(sun.target);

    const h = CONFIG.hemi;
    this.scene.add(new THREE.HemisphereLight(h.sky, h.ground, h.intensity));
  }

  start() {
    // один раз пересчитываем заморожённую карту теней
    this.renderer.shadowMap.needsUpdate = true;
    this._tick();
  }

  _onLock() {
    if (this.state === 'won' || this.state === 'dead') return;
    this.hud.hide();
    if (this.state === 'menu') this.startTime = performance.now();
    this.state = 'playing';
  }

  _onUnlock() {
    if (this.state === 'won' || this.state === 'dead') return;
    this.state = 'paused';
    this.hud.showPause();
  }

  _onResize() {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
  }

  _tick() {
    requestAnimationFrame(this._tick);
    const dt = Math.min(this.clock.getDelta(), 0.05);

    if (this.state === 'playing' && this.player && this.player.isLocked) {
      this.player.update(dt);
      if (this.weapon) this.weapon.update(dt);
      this.enemies.update(dt);

      this.elapsed = (performance.now() - this.startTime) / 1000;
      this.hud.setTime(this.elapsed);
      this.hud.setHealth(this.player.health, this.player.maxHealth);
      this.hud.setKills(this.enemies.kills);
      this.hud.flashDamage(this.player.hurt);

      const time = performance.now() / 1000;
      if (this.coins.update(dt, this.player.position, time)) {
        this.hud.setCoins(this.coins.collected, this.coins.total);
        if (this.coins.collected === this.coins.total) this._win();
      }

      if (this.player.dead) this._lose();
    }

    this.tracers.update(dt);
    if (this.player) {
      this.hud.drawMinimap(this.map, this.coins, this.player.position, this.player.direction, this.enemies);
    }
    this.renderer.render(this.scene, this.camera);
  }

  _win() {
    this.state = 'won';
    this.hud.setCoins(this.coins.total, this.coins.total);
    const m = Math.floor(this.elapsed / 60);
    const s = Math.floor(this.elapsed % 60);
    this.hud.showWin(`${m}:${String(s).padStart(2, '0')}`);
    winTune();
    this.player.unlock();
  }

  _lose() {
    this.state = 'dead';
    this.hud.setHealth(0, this.player.maxHealth);
    this.hud.showDeath();
    this.player.unlock();
  }
}
