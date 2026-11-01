import * as THREE from 'three';
import { CONFIG } from './config.js';
import { createTownMap } from './map.js';
import { LEVELS } from './levels/index.js';
import { Coins } from './coins.js';
import { Player } from './player.js';
import { Alien } from './alien.js';
import { Hud } from './hud.js';
import { Enemies } from './enemies.js';
import { Weapon } from './weapon.js';
import { Tracers } from './effects.js';
import { winTune } from './audio.js';

/**
 * Движок: последовательность глав (src/levels — чистые данные) и игровой цикл.
 *
 * Состояния: 'menu' | 'chapter' | 'playing' | 'paused' | 'chapterEnd' | 'won' | 'dead'.
 * На старте — выбор персонажа, затем главы идут одна за другой, как в Half-Life:
 * интертитр главы → сбор монет → «Глава пройдена» → следующая глава без
 * перезагрузки страницы. Смерть перезапускает текущую главу.
 */
export class Game {
  constructor() {
    this._initRenderer();

    // одна камера живёт между сценами всех глав
    const cam = CONFIG.camera;
    this.camera = new THREE.PerspectiveCamera(cam.fov, innerWidth / innerHeight, cam.near, cam.far);

    this.hud = new Hud();
    this.role = null;
    this.player = null;
    this.weapon = null;
    this.enemies = null;
    this.levelIndex = 0;
    this.totalTime = 0;

    this.state = 'menu';
    this.startTime = 0;
    this.elapsed = 0;
    this.clock = new THREE.Clock();

    // клик по оверлею захватывает управление из паузы и с интертитра главы
    this.hud.requestLock(() => {
      if ((this.state === 'paused' || this.state === 'chapter') && this.player) this.player.lock();
    });
    addEventListener('resize', () => this._onResize());

    this._tick = this._tick.bind(this);

    // обзорный вид улицы за экраном выбора персонажа
    this._previewLevel(0);
    this.hud.showCharacterSelect(role => this._startRole(role));
  }

  /** Выбор роли: создаёт персонажа при каждой загрузке главы, затем глава 1. */
  _startRole(role) {
    this.role = role;
    this.hud.setRole(role);
    this.totalTime = 0;
    this._loadLevel(0);
  }

  /**
   * Точка замены типа уровня: чтобы вернуть другую реализацию контракта карты,
   * достаточно подменить её здесь (см. src/map.js и AGENTS.md).
   */
  createMap(spec) {
    return createTownMap(spec);
  }

  /** Загружает главу: карта, сцена, монеты, враги, персонаж, интертитр. */
  _loadLevel(index) {
    this.levelIndex = index;
    this.level = LEVELS[index];

    // выгрузка сущностей предыдущей главы: снятие слушателей (см. AGENTS.md)
    if (this.player) {
      this.player.unlock();
      this.player.dispose();
    }
    if (this.weapon) {
      this.weapon.dispose();
      this.weapon = null;
    }

    const gp = this.level.gameplay ?? {};
    this.map = this.createMap(this.level.map);
    this._initScene(this.level.sky);
    this.map.build(this.scene);
    // карта теней заморожена — пересчитать под новую сцену
    this.renderer.shadowMap.needsUpdate = true;

    this.tracers = new Tracers(this.scene);
    this.coins = new Coins(
      this.scene, this.map,
      gp.totalCoins ?? CONFIG.totalCoins,
      gp.minCoinDistance ?? CONFIG.minCoinDistance,
    );
    this.player = this._createPlayer();
    this.enemies = new Enemies(this.scene, this.map, this.player, this.camera, this.tracers, {
      count: gp.enemies?.count,
      alienCount: gp.alienEnemies?.count,
    });
    if (this.role !== 'alien') {
      this.weapon = new Weapon(
        this.camera, this.map, this.player, this.enemies, this.tracers,
        () => this.hud.hitMarker(),
      );
    }

    this.hud.setCoins(0, this.coins.total);
    this.hud.setKills(0);
    this.hud.setHealth(this.player.health, this.player.maxHealth);
    this.hud.setChapter(this.level.name);

    this.elapsed = 0;
    this._setOverviewCamera();
    this.state = 'chapter';
    this.hud.showChapter(this.level, () => this.player && this.player.lock());
  }

  /** Создаёт персонажа выбранной роли и подписывает захват/отпуск курсора. */
  _createPlayer() {
    const player = this.role === 'alien'
      ? new Alien(this.camera, this.renderer.domElement, this.map, () => this.enemies)
      : new Player(this.camera, this.renderer.domElement, this.map);
    player.controls.addEventListener('lock', () => this._onLock());
    player.controls.addEventListener('unlock', () => this._onUnlock());
    return player;
  }

  /** Обзорный кадр улицы: за интертитром главы и экраном выбора. */
  _setOverviewCamera() {
    this.camera.position.set(this.map.spawn.x, 7, this.map.bounds.minZ - 6);
    this.camera.lookAt(this.map.spawn.x, 9, 0);
  }

  /** Сцена без сущностей — только для обзора за экраном выбора роли. */
  _previewLevel(index) {
    this.map = this.createMap(LEVELS[index].map);
    this._initScene(LEVELS[index].sky);
    this.map.build(this.scene);
    this._setOverviewCamera();
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // сцена главы статична (дома и земля не двигаются): карту теней считаем один раз
    this.renderer.shadowMap.autoUpdate = false;
    document.body.appendChild(this.renderer.domElement);
  }

  /**
   * Сцена главы: небо, туман и свет из sky-секции определения уровня,
   * недостающее — из CONFIG (освещение по умолчанию).
   */
  _initScene(sky = {}) {
    const cfg = {
      sky: sky.sky ?? CONFIG.sky,
      fog: { ...CONFIG.fog, ...sky.fog },
      sun: { ...CONFIG.sun, ...sky.sun },
      hemi: { ...CONFIG.hemi, ...sky.hemi },
    };

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(cfg.sky);
    this.scene.fog = new THREE.Fog(cfg.fog.color, cfg.fog.near, cfg.fog.far);
    this.scene.add(this.camera);

    const s = cfg.sun;
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
    this.sun = sun; // ссылка для отладочной панели (?debug=1)

    const h = cfg.hemi;
    this.hemi = new THREE.HemisphereLight(h.sky, h.ground, h.intensity);
    this.scene.add(this.hemi);
  }

  start() {
    // один раз пересчитываем заморожённую карту теней обзора меню
    this.renderer.shadowMap.needsUpdate = true;
    // первый кадр — через rAF: сущности появятся только при выборе роли
    requestAnimationFrame(this._tick);
  }

  _onLock() {
    if (this.state === 'chapter') {
      // стартовая позиция — только в момент захвата: до этого камера летала обзором
      this.player.spawnAt(this.map.spawn);
      if (this.role !== 'alien') this.camera.lookAt(this.map.spawn.x, this.camera.position.y, 0);
      this.startTime = performance.now();
    } else if (this.state !== 'paused') {
      return;
    }
    this.hud.hide();
    this.state = 'playing';
  }

  _onUnlock() {
    if (this.state !== 'playing') return; // главы и финал паузу не показывают
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
        if (this.coins.collected === this.coins.total) this._levelComplete();
      }

      if (this.player.dead) this._lose();
    }

    // до начала главы сущностей нет — рендерим только обзор карты
    if (this.tracers) this.tracers.update(dt);
    if (this.player) {
      this.hud.drawMinimap(this.map, this.coins, this.player.position, this.player.direction, this.enemies);
    }
    this.renderer.render(this.scene, this.camera);
  }

  static _fmtTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  /** Все монеты главы собраны: переход к следующей главе или финал. */
  _levelComplete() {
    this.state = 'chapterEnd';
    this.totalTime += this.elapsed;
    const next = LEVELS[this.levelIndex + 1];
    if (next) {
      this.hud.showLevelComplete(this.level, Game._fmtTime(this.elapsed), next,
        () => this._loadLevel(this.levelIndex + 1));
    } else {
      this.state = 'won';
      this.hud.showWin(Game._fmtTime(this.totalTime));
      winTune();
    }
    this.player.unlock();
  }

  _lose() {
    this.state = 'dead';
    this.hud.setHealth(0, this.player.maxHealth);
    this.hud.showDeath(() => this._loadLevel(this.levelIndex));
    this.player.unlock();
  }
}
