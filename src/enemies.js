import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CONFIG } from './config.js';
import { beep } from './audio.js';
import { AlienBody } from './alien.js';

/** Приводит угол к диапазону (-π, π] — для плавного поворота без «прыжков». */
function wrapAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a <= -Math.PI) a += Math.PI * 2;
  return a;
}

/** Простая человекоподобная фигура: ноги, корпус, плечи, руки, голова, оружие. */
function buildBodyGeometry() {
  const box = (w, h, d, x, y, z) => {
    const g = new THREE.BoxGeometry(w, h, d);
    g.translate(x, y, z);
    return g;
  };
  return mergeGeometries([
    box(0.16, 0.85, 0.18, -0.13, 0.42, 0),   // нога
    box(0.16, 0.85, 0.18, 0.13, 0.42, 0),    // нога
    box(0.50, 0.72, 0.28, 0, 1.20, 0),       // корпус
    box(0.62, 0.16, 0.30, 0, 1.50, 0),       // плечи
    box(0.14, 0.62, 0.16, -0.36, 1.20, 0),   // рука
    box(0.14, 0.62, 0.16, 0.36, 1.20, 0),    // рука
    box(0.28, 0.30, 0.28, 0, 1.72, 0),       // голова
    box(0.10, 0.12, 0.50, 0.34, 1.14, -0.30), // оружие (ствол смотрит в -Z)
  ], false);
}

// Общая геометрия на всех врагов: тела различаются только материалом.
const BODY_GEOMETRY = buildBodyGeometry();

const BODY_HEIGHT = 1.9;
const BODY_CENTER_Y = 1.0;   // центр сферы попадания над ногами
const BODY_RADIUS = 0.6;

/**
 * Хищная фигура Чужого-врага. Силуэт приближен к классическому ксеноморфу:
 * вытянутый гладкий череп, сгорбленный корпус с рёбрами, дорсальные шипы на
 * спине, длинные тонкие конечности с когтями и сегментированный хвост с
 * клинком. Низ модели (y = 0) стоит на поверхности опоры, «вперёд» — по -Z.
 */
function buildAlienBodyGeometry() {
  const parts = [];
  // поворот вокруг осей до переноса — так деталь ставят «как есть», а не по углам
  const place = (g, x, y, z, rx = 0, ry = 0, rz = 0) => {
    if (rx) g.rotateX(rx);
    if (ry) g.rotateY(ry);
    if (rz) g.rotateZ(rz);
    g.translate(x, y, z);
    parts.push(g);
  };
  const box = (w, h, d, x, y, z, rx, ry, rz) =>
    place(new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz);
  const cyl = (rt, rb, h, seg, x, y, z, rx, ry, rz) =>
    place(new THREE.CylinderGeometry(rt, rb, h, seg), x, y, z, rx, ry, rz);
  const cone = (r, h, seg, x, y, z, rx, ry, rz) =>
    place(new THREE.ConeGeometry(r, h, seg), x, y, z, rx, ry, rz);
  const ball = (r, x, y, z, sx = 1, sy = 1, sz = 1, rx = 0) => {
    const g = new THREE.SphereGeometry(r, 12, 10);
    g.scale(sx, sy, sz);
    place(g, x, y, z, rx);
  };

  // ноги: дигитигрейдная стойка — высокое колено, стопа вытянута вперёд
  for (const s of [-1, 1]) {
    box(0.20, 0.56, 0.22, s * 0.23, 0.76, -0.05, 0.35);      // бедро
    box(0.14, 0.62, 0.16, s * 0.23, 0.34, 0.05, -0.26);      // голень
    box(0.13, 0.12, 0.42, s * 0.23, 0.07, -0.12);            // стопа
    box(0.09, 0.09, 0.22, s * 0.23, 0.12, 0.16, 0.40);       // пяточная шпора
    for (let k = -1; k <= 1; k++) {                          // когти на стопе
      cone(0.035, 0.14, 4, s * 0.23 + k * 0.05, 0.06, -0.34, -Math.PI / 2);
    }
  }

  box(0.44, 0.32, 0.32, 0, 0.98, 0.02);                      // таз
  box(0.36, 0.36, 0.28, 0, 1.28, -0.02);                     // живот
  for (let i = 0; i < 3; i++) {                              // рёбра
    box(0.40, 0.05, 0.10, 0, 1.16 + i * 0.13, -0.16);
  }
  box(0.52, 0.42, 0.34, 0, 1.56, -0.08, -0.16);              // грудная клетка
  box(0.70, 0.20, 0.36, 0, 1.74, -0.06, -0.16);              // плечи

  // дорсальные шипы — характерный признак ксеноморфа
  for (let i = 0; i < 4; i++) {
    cyl(0.03, 0.05, 0.34, 8, 0, 1.42 + i * 0.10, 0.15 + i * 0.012, 1.0 - i * 0.06);
  }

  // руки: длинные, висят вдоль тела, кисти с когтями
  for (const s of [-1, 1]) {
    box(0.14, 0.52, 0.15, s * 0.40, 1.44, -0.02, 0.15, 0, s * 0.18); // плечо
    box(0.12, 0.54, 0.13, s * 0.46, 1.00, -0.10, 0.30);              // предплечье
    box(0.11, 0.20, 0.16, s * 0.48, 0.72, -0.22);                    // кисть
    for (let k = -1; k <= 1; k++) {                                  // когти
      cone(0.025, 0.16, 4, s * 0.48 + k * 0.04, 0.60, -0.28, -Math.PI / 2 + 0.30);
    }
  }

  // шея и голова: вытянутый гладкий череп-«банан» + приплюснутая морда
  box(0.22, 0.20, 0.26, 0, 1.86, -0.14, -0.50);              // шея наклонена вперёд
  ball(0.17, 0, 1.98, 0.04, 1.0, 0.82, 2.3, -0.10);          // череп
  box(0.17, 0.15, 0.32, 0, 1.90, -0.30, -0.10);              // морда
  box(0.30, 0.05, 0.12, 0, 2.02, -0.20, -0.10);              // надбровные валики
  for (let k = -1; k <= 1; k++) {                            // зубы
    cone(0.018, 0.07, 4, k * 0.05, 1.85, -0.42, Math.PI);
  }

  // хвост: сегменты тянутся назад, плавно проседая к клинку
  let tailZ = 0, tailY = 0;
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    tailZ = 0.22 + i * 0.14;
    tailY = 0.98 + Math.sin(t * 2.2) * 0.22 - t * 0.30;
    const r = 0.08 * (1 - 0.55 * t);
    cyl(r * 0.85, r, 0.17, 6, 0, tailY, tailZ, Math.PI / 2 - 0.30 + t * 0.35);
  }
  cone(0.07, 0.34, 6, 0, tailY, tailZ + 0.20, Math.PI / 2 - 0.05); // клинок

  return mergeGeometries(parts, false);
}

// Общая геометрия на всех Чужих-врагов: тела различаются только материалом.
const ALIEN_BODY_GEOMETRY = buildAlienBodyGeometry();

/**
 * Враг: патрулирует уровень (в том числе переходя между этажами по лестницам),
 * замечает игрока, преследует и стреляет. Маршрут строится по графу навигации
 * карты (см. map.js: findPath), высота берётся из рельефа/полов, а видимость и
 * преграды — из map.rayHitDistance.
 */
export class Enemy {
  /**
   * @param {THREE.Scene} scene
   * @param {import('./map.js').TownMap} map
   * @param {THREE.Material} material
   */
  constructor(scene, map, material, onDeath) {
    this.scene = scene;
    this.map = map;
    this.cfg = CONFIG.enemies;
    this.onDeath = onDeath;

    this.group = new THREE.Group();
    this.mesh = new THREE.Mesh(BODY_GEOMETRY, material);
    this.mesh.castShadow = false; // карта теней заморожена: движущиеся объекты её не пишут
    this.group.add(this.mesh);
    this._buildHealthBar();
    scene.add(this.group);

    this.position = this.group.position;
    this.feetY = 0;
    this.verticalVelocity = 0;
    this.velocity = new THREE.Vector3();
    this.facing = 0;

    this.health = this.cfg.health;
    this.state = 'patrol';
    this.path = null;
    this.pathIndex = 0;
    this.wander = null;
    this.repathTimer = 0;
    this.fireTimer = 0;
    this.losTimer = 0;
    this.hasLos = false;
    this.distanceToPlayer = Infinity;

    this.dead = true;
    this.deathTimer = 0;
    this.respawnTimer = 0;
    this.offstage = false;
    this.hitFlash = 0;

    // рабочие векторы, чтобы не создавать мусор в игровом цикле
    this._eyeVec = new THREE.Vector3();
    this._toPlayer = new THREE.Vector3();
    this._shootDir = new THREE.Vector3();
    this._muzzle = new THREE.Vector3();
    this._end = new THREE.Vector3();
    this._ray = new THREE.Ray();
    this._sphere = new THREE.Sphere();
    this._hitPoint = new THREE.Vector3();
  }

  get alive() { return !this.dead; }

  /**
   * Полоска здоровья над головой (фон + убывающая заливка). Живёт прямо в
   * сцене, а не в группе врага: группу мы вращаем по курсу, и тогда полоска
   * оказалась бы повёрнутой вместе с ним, а не лицом к камере.
   */
  _buildHealthBar() {
    const bar = new THREE.Group();
    const bg = new THREE.Mesh(
      new THREE.PlaneGeometry(0.92, 0.13),
      new THREE.MeshBasicMaterial({ color: 0x11161f }),
    );
    this._hpFill = new THREE.Mesh(
      new THREE.PlaneGeometry(0.86, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x62d84a }),
    );
    this._hpFill.position.z = 0.002;
    bar.add(bg, this._hpFill);
    bar.visible = false;
    this._hpBar = bar;
    this.scene.add(bar);
  }

  _updateHealthBar() {
    const pct = Math.max(0, this.health / this.cfg.health);
    this._hpFill.scale.x = pct;
    this._hpFill.position.x = -(1 - pct) * 0.43;
    const color = pct > 0.5 ? 0x62d84a : pct > 0.25 ? 0xe2b13c : 0xe2503c;
    this._hpFill.material.color.setHex(color);
  }

  /** Точка глаз — начало лучей видимости и выстрелов. */
  _eye() {
    return this._eyeVec.set(this.position.x, this.feetY + this.cfg.eyeHeight, this.position.z);
  }

  /** Ставит врага на свободный узел навигации вдали от игрока. */
  respawn(playerPos) {
    let node = null;
    for (let i = 0; i < 120; i++) {
      const p = this.map.randomNavPoint(playerPos.x, playerPos.z, 180);
      if (!p) continue;
      const d = Math.hypot(p.x - playerPos.x, p.z - playerPos.z);
      if (d >= this.cfg.spawnDistance && d < 180) { node = p; break; }
    }
    if (!node) return;

    this.group.position.set(node.x, node.y, node.z);
    this.group.rotation.set(0, Math.random() * Math.PI * 2, 0);
    this.group.visible = true;
    this.feetY = node.y;
    this.facing = this.group.rotation.y;
    this.verticalVelocity = 0;
    this.velocity.set(0, 0, 0);

    this.health = this.cfg.health;
    this.state = 'patrol';
    this.path = null;
    this.pathIndex = 0;
    this.wander = null;
    this.repathTimer = 0;
    this.fireTimer = Math.random() * this.cfg.fireDelay;
    this.losTimer = 0;
    this.hasLos = false;
    this.hitFlash = 0;

    this.dead = false;
    this.deathTimer = 0;
    this.respawnTimer = 0;
    this.offstage = false;
    this.mesh.material.emissive.setHex(0x000000); // сброс подсветки попадания
    this._hpBar.visible = false;
    this._updateHealthBar();
  }

  /**
   * Перенос врага вместе с миром (перестановка активного окна главы 4,
   * src/stream-map.js): группа встаёт на новые метры главы, а маршрут и цель
   * блуждания сбрасываются — граф улиц после перестройки другой, и прежние узлы
   * в нём больше не существуют.
   */
  shift(dx, dz) {
    this.group.position.x -= dx;
    this.group.position.z -= dz;
    this.path = null;
    this.pathIndex = 0;
    this.wander = null;
    this.repathTimer = 0;
  }

  /**
   * Молчаливое снятие со сцены: враг остался за бортом активного окна главы 4 и
   * маршрута к игроку через несобранный район у него нет. В отличие от `_die()` —
   * без анимации падения, звука и засчитанного убийства; дальше работает тот же
   * очередь возрождения, что и после смерти, и враг появляется на узле нового
   * окна (respawn берёт точки из `map.nav`).
   */
  despawn() {
    this.offstage = true;
    this.group.visible = false;
    this._hpBar.visible = false;
    this.path = null;
    this.pathIndex = 0;
    this.wander = null;
    this.repathTimer = 0;
    this.respawnTimer = this.cfg.respawnDelay;
  }

  /** Урон от игрока. При смерти запускает анимацию и таймер возрождения. */
  takeDamage(amount) {
    if (this.dead) return;
    this.health -= amount;
    this.hitFlash = 0.12;
    this._hpBar.visible = true;
    this._updateHealthBar();
    if (this.health <= 0) {
      this._die();
    } else {
      beep(560, 0.035, 'triangle');
    }
  }

  _die() {
    this.dead = true;
    this.state = 'dead';
    this.deathTimer = 0.9;
    this.respawnTimer = this.cfg.respawnDelay;
    this._hpBar.visible = false;
    beep(320, 0.12, 'sawtooth');
    setTimeout(() => beep(180, 0.18, 'sawtooth'), 90);
    if (this.onDeath) this.onDeath(this);
  }

  _pickWander() {
    return this.map.randomNavPoint(this.position.x, this.position.z, 55)
      || { x: this.position.x, y: this.feetY, z: this.position.z };
  }

  /**
   * Обновление за кадр.
   * @param {number} dt
   * @param {import('./player.js').Player} player
   * @param {THREE.Camera} camera
   * @param {import('./effects.js').Tracers} tracers
   */
  update(dt, player, camera, tracers) {
    // полоска всегда над головой и развёрнута к камере
    this._hpBar.position.set(this.position.x, this.feetY + 2.05, this.position.z);
    this._hpBar.quaternion.copy(camera.quaternion);

    // за бортом активного окна: ждём очередь возрождения, не стреляем и не идём
    // через несобранный район (маршрута к игроку в новом графе у такого нет)
    if (this.offstage) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) this.respawn(player.position);
      return;
    }

    if (this.dead) {
      if (this.deathTimer > 0) {
        this.deathTimer -= dt;
        // заваливается на бок и оседает, затем скрывается до возрождения
        this.group.rotation.x = -(1 - Math.max(0, this.deathTimer) / 0.9) * Math.PI / 2;
        if (this.deathTimer <= 0) this.group.visible = false;
      }
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) this.respawn(player.position);
      return;
    }

    if (this.hitFlash > 0) {
      this.hitFlash = Math.max(0, this.hitFlash - dt);
      this.mesh.material.emissive.setHex(this.hitFlash > 0 ? 0x551200 : 0x000000);
    }

    const cfg = this.cfg;
    const pos = this.position;

    // --- восприятие: расстояние и линия видимости (луч не каждый кадр) ---
    const eye = this._eye();
    this._toPlayer.copy(player.position).sub(eye);
    const dist = Math.max(this._toPlayer.length(), 1e-4);
    this.distanceToPlayer = dist;
    this._toPlayer.multiplyScalar(1 / dist);

    this.losTimer -= dt;
    if (this.losTimer <= 0) {
      this.losTimer = 0.12;
      this.hasLos = dist <= cfg.visionRange &&
        this.map.rayHitDistance(eye.x, eye.y, eye.z,
          this._toPlayer.x, this._toPlayer.y, this._toPlayer.z, dist) >= dist - 1.2;
    }

    const engaged = this.hasLos;
    this.state = !engaged ? 'patrol' : (dist <= cfg.advanceRange ? 'attack' : 'chase');

    // --- маршрут: к игроку в бою, к случайной точке в патруле ---
    this.repathTimer -= dt;
    if (this.repathTimer <= 0 || !this.path) {
      this.repathTimer = cfg.repathDelay * (0.6 + Math.random() * 0.8);
      if (engaged) {
        this.path = this.map.findPath(
          { x: pos.x, y: this.feetY, z: pos.z },
          { x: player.position.x, y: player.feetY, z: player.position.z },
        );
      } else {
        if (!this.wander || Math.random() < 0.4) this.wander = this._pickWander();
        this.path = this.map.findPath({ x: pos.x, y: this.feetY, z: pos.z }, this.wander);
      }
      this.pathIndex = 1; // нулевой узел — там, где враг стоит сейчас
    }

    // --- движение по маршруту ---
    let wishX = 0, wishZ = 0;
    if (this.state !== 'attack' && this.path && this.pathIndex < this.path.length) {
      const node = this.path[this.pathIndex];
      const dx = node.x - pos.x, dz = node.z - pos.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.9) {
        this.pathIndex++;
      } else {
        const speed = engaged ? cfg.speed.run : cfg.speed.walk;
        wishX = dx / d * speed;
        wishZ = dz / d * speed;
      }
    }

    const k = 1 - Math.exp(-10 * dt);
    this.velocity.x += (wishX - this.velocity.x) * k;
    this.velocity.z += (wishZ - this.velocity.z) * k;

    // раздельное разрешение коллизий по осям, как у игрока
    const nx = pos.x + this.velocity.x * dt;
    if (!this.map.isBlocked(nx, pos.z, cfg.radius, this.feetY, BODY_HEIGHT)) pos.x = nx;
    else this.velocity.x = 0;
    const nz = pos.z + this.velocity.z * dt;
    if (!this.map.isBlocked(pos.x, nz, cfg.radius, this.feetY, BODY_HEIGHT)) pos.z = nz;
    else this.velocity.z = 0;

    // гравитация и ходьба по полу этажа/ступеням лестницы
    const ground = this.map.groundHeightAt(pos.x, pos.z, this.feetY);
    this.verticalVelocity -= CONFIG.gravity * dt;
    this.feetY += this.verticalVelocity * dt;
    if (this.feetY <= ground) { this.feetY = ground; this.verticalVelocity = 0; }
    pos.y = this.feetY;

    // --- поворот: в бою смотрит на игрока, иначе по направлению движения ---
    const speed2d = Math.hypot(this.velocity.x, this.velocity.z);
    let targetYaw;
    if (this.state === 'attack' || speed2d < 0.3) {
      targetYaw = Math.atan2(-(player.position.x - pos.x), -(player.position.z - pos.z));
    } else {
      targetYaw = Math.atan2(-this.velocity.x, -this.velocity.z);
    }
    this.facing += wrapAngle(targetYaw - this.facing) * Math.min(1, dt * 8);
    this.group.rotation.y = this.facing;

    // --- огонь по игроку ---
    if (this.state === 'attack') {
      this.fireTimer -= dt;
      if (this.fireTimer <= 0 && this.hasLos) {
        this.fireTimer = cfg.fireDelay * (0.75 + Math.random() * 0.5);
        this._shoot(player, tracers);
      }
    }
  }

  /** Выстрел по игроку: трассер, звук и попадание по корпусу цели. */
  _shoot(player, tracers) {
    const cfg = this.cfg;
    const eye = this._eye();
    const dir = this._shootDir.copy(player.position).sub(eye);
    const dist = Math.max(dir.length(), 1e-4);
    dir.multiplyScalar(1 / dist);

    const s = cfg.spread;
    dir.x += (Math.random() - 0.5) * s;
    dir.y += (Math.random() - 0.5) * s;
    dir.z += (Math.random() - 0.5) * s;
    dir.normalize();

    const muzzle = this._muzzle.copy(eye).addScaledVector(dir, 0.45);
    const end = this._end.copy(muzzle).addScaledVector(dir, Math.min(dist + 2, cfg.attackRange + 8));
    tracers.spawn(muzzle, end, 0xff7a52, 0.08);
    beep(140 + Math.random() * 50, 0.06, 'square');

    // попадание — если трассер проходит вплотную к корпусу игрока
    this._ray.set(muzzle, dir);
    this._sphere.center.copy(player.position);
    this._sphere.center.y -= 0.25;
    this._sphere.radius = BODY_RADIUS;
    const hit = this._ray.intersectSphere(this._sphere, this._hitPoint);
    if (hit && Math.random() < cfg.accuracy) player.takeDamage(cfg.damage);
  }
}

/**
 * Враг-Чужой: использует ту же 3D-физику прилипания к поверхностям, что и
 * играбельный Чужой (см. AlienBody), но управляется ИИ. Идёт к игроку по любой
 * поверхности — пол, стены, потолки, крыши — и атакует прыжком в упор.
 *
 * Интерфейс совместим с человеческим Enemy: position, dead, health, takeDamage,
 * group (для сцены), а также hitOffsetY/hitRadius для попаданий скачком.
 */
export class AlienEnemy extends AlienBody {
  /**
   * @param {THREE.Scene} scene
   * @param {import('./map.js').TownMap} map
   * @param {THREE.Material} material
   * @param {object} player живой игрок (цель восприятия и прыжка)
   * @param {Function} [onDeath] вызывается при смерти врага
   */
  constructor(scene, map, material, player, onDeath) {
    super(map);

    this.scene = scene;
    this.material = material;
    this.onDeath = onDeath;
    this.cfgEnemy = CONFIG.alienEnemies;

    // здоровье своё (тело AlienBody по умолчанию берёт общее)
    this.maxHealth = this.cfgEnemy.health;
    this.health = this.maxHealth;

    // габариты попадания: позиция тела — уже его центр, поэтому смещение 0
    this.hitOffsetY = this.cfgEnemy.hitOffsetY;
    this.hitRadius = this.cfgEnemy.hitRadius;

    this.player = player || null;
    this.respawnTimer = 0;
    this.offstage = false;
    this._leapCd = 0;

    this.group = new THREE.Group();
    this.mesh = new THREE.Mesh(ALIEN_BODY_GEOMETRY, material);
    this.mesh.castShadow = false; // карта теней заморожена: движущиеся объекты её не пишут
    this.mesh.position.y = -this.cfg.radius; // низ модели — на поверхности опоры
    this.group.add(this.mesh);
    scene.add(this.group);

    // рабочие буферы (отдельно от физических буферов AlienBody)
    this._toTarget = new THREE.Vector3();
    this._xAxis = new THREE.Vector3();
    this._zAxis = new THREE.Vector3();
    this._basis = new THREE.Matrix4();

    // цель прыжка — сам игрок: при контакте в полёте он получает урон.
    // (имя _leapTarget, а не _target: _target в AlienBody занят буфером нормали)
    this._leapTarget = {
      position: new THREE.Vector3(),
      hitOffsetY: 0,
      hitRadius: this.cfgEnemy.hitRadius,
      dead: false,
      takeDamage: n => { if (this.player) this.player.takeDamage(n); },
    };
    this._leapTargets = () =>
      (this.player && !this.player.dead ? { items: [this._leapTarget] } : null);

    this._syncMesh();
  }

  /** Урон игроку при контакте в прыжке (постепенный, как у человека). */
  _leapDamage() {
    return this.cfgEnemy.damage;
  }

  /**
   * Обновление за кадр (единый интерфейс менеджера врагов).
   * @param {number} dt
   * @param {object} player
   * @param {THREE.Camera} camera
   * @param {import('./effects.js').Tracers} tracers
   */
  update(dt, player, camera, tracers) {
    if (player) this.player = player;

    // за бортом активного окна: тело не идёт через несобранный район и не прыгает
    if (this.offstage) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0 && this.player) this.respawn(this.player.position);
      return;
    }

    if (this.dead) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0 && this.player) this.respawn(this.player.position);
      return;
    }
    super.update(dt);
  }

  /** ИИ: идёт к игроку по любой поверхности, вблизи прыгает на него в упор. */
  _control(dt) {
    const p = this.player;
    const ae = this.cfgEnemy;
    this._leapCd = Math.max(0, this._leapCd - dt);

    if (!p) { this._moving = false; return; }

    this._leapTarget.position.copy(p.position);
    this._leapTarget.dead = !!p.dead;

    const to = this._toTarget.copy(p.position).sub(this.pos);
    const dist = to.length();

    // «вперёд» тела — на цель (в плоскости текущей опоры)
    if (to.lengthSq() > 1e-6) {
      this.fwd.copy(to).normalize();
      this._replanar();
    }

    // прыжок в упор
    if (this.grounded && this.leapTimer <= 0 && this._leapCd <= 0 &&
        !p.dead && dist <= ae.leapRange) {
      this._pounce(this._leapTarget.position);
      return;
    }

    // бег к цели строго по касательной к опоре
    this._wish.copy(to).addScaledVector(this.up, -to.dot(this.up));
    this._moving = this._wish.lengthSq() > 1e-6;
    if (this._moving) this._wish.normalize();
    this._speed = ae.speed.run;
    // цель выше — смотрим вверх, чтобы прилипнуть к стене и залезть по ней
    this.pitch = to.dot(this.up) > 0.4 ? ae.climbPitch : 0;
  }

  /**
   * Прыжок в упор: подбирает начальную скорость так, чтобы тело долетело до
   * цели (а не «мимо»): время полёта — из дистанции, вертикальная добавка
   * компенсирует падение под гравитацией за это время.
   */
  _pounce(targetPos) {
    const ae = this.cfgEnemy;
    const delta = this._tmp.copy(targetPos).sub(this.pos);
    const dist = Math.max(delta.length(), 1e-3);
    const t = Math.max(0.12, Math.min(1.4, dist / ae.leapSpeed));

    this.vel.copy(delta).multiplyScalar(1 / t);
    this.vel.y += 0.5 * CONFIG.gravity * t;

    this.grounded = false;
    this.leapTimer = ae.leapMaxTime;
    this._leapHits.clear();
    this._leapCd = ae.leapCooldown;
    beep(90, 0.16, 'sawtooth');
  }

  /** Урон: при смерти запускается таймер возрождения и засчитывается фраг. */
  takeDamage(amount) {
    if (this.dead) return;
    super.takeDamage(amount);
    if (this.health <= 0) this._die();
  }

  _die() {
    this.respawnTimer = this.cfgEnemy.respawnDelay;
    this.group.visible = false;
    beep(320, 0.12, 'sawtooth');
    if (this.onDeath) this.onDeath(this);
  }

  /** Возрождение на свободном узле навигации вдали от игрока. */
  respawn(playerPos) {
    const cfg = this.cfgEnemy;
    let node = null;
    for (let i = 0; i < 120; i++) {
      const p = this.map.randomNavPoint(playerPos.x, playerPos.z, 180);
      if (!p) continue;
      const d = Math.hypot(p.x - playerPos.x, p.z - playerPos.z);
      if (d >= cfg.spawnDistance && d < 180) { node = p; break; }
    }
    if (!node) return;

    this.pos.set(node.x, node.y + this.cfg.radius, node.z);
    this.up.set(0, 1, 0);
    this.fwd.set(0, 0, 1);
    this.pitch = 0;
    this.vel.set(0, 0, 0);
    this.grounded = true;
    this.leapTimer = 0;
    this._leapHits.clear();
    this._leapCd = 0;
    this._tween = null;

    this.health = this.maxHealth;
    this.hurt = 0;
    this._lastDamage = -1e9;
    this.respawnTimer = 0;
    this.offstage = false;
    this.group.visible = true;
    this._syncMesh();
  }

  /**
   * Перенос вместе с миром: тело (AlienBody) сдвигает центр, модель — `_syncMesh`,
   * цель ИИ каждый кадр читается из позиции игрока, поэтому маршрута здесь нет.
   */
  shift(dx, dz) {
    super.shift(dx, dz);
    this._syncMesh();
  }

  /**
   * Молчаливое снятие со сцены (враг остался за бортом активного окна главы 4):
   * без смерти, звука и засчитанного убийства, дальше — общая очередь
   * возрождения, и тело встаёт на узел графа нового окна.
   */
  despawn() {
    this.offstage = true;
    this.group.visible = false;
    this.respawnTimer = this.cfgEnemy.respawnDelay;
  }

  _postUpdate(dt) {
    this._syncMesh();
    if (this.material && this.material.emissive) {
      this.material.emissive.setHex(this.hurt > 0.01 ? 0x551200 : 0x000000);
    }
  }

  /** Привязывает модель к телу: позиция — центр, ориентация — по нормали и курсу. */
  _syncMesh() {
    this.group.position.copy(this.pos);
    this._zAxis.copy(this.fwd).negate();            // локальный -Z смотрит вперёд
    this._xAxis.copy(this.up).cross(this._zAxis);
    if (this._xAxis.lengthSq() < 1e-6) this._xAxis.set(1, 0, 0);
    this._xAxis.normalize();
    this._basis.makeBasis(this._xAxis, this.up, this._zAxis);
    this.group.quaternion.setFromRotationMatrix(this._basis);
  }
}

/**
 * Менеджер врагов: создаёт их, обновляет за кадр и умеет искать ближайшего к
 * лучу (для попаданий выстрелов игрока).
 */
export class Enemies {
  /**
   * @param {THREE.Scene} scene
   * @param {import('./map.js').TownMap} map
   * @param {import('./player.js').Player} player
   * @param {THREE.Camera} camera
   * @param {import('./effects.js').Tracers} tracers
   * @param {{count?:number, alienCount?:number}} [opts] числа врагов уровня
   *   (см. gameplay-секцию определения уровня); по умолчанию — CONFIG
   */
  constructor(scene, map, player, camera, tracers, opts = {}) {
    this.map = map;
    this.player = player;
    this.camera = camera;
    this.tracers = tracers;
    this.kills = 0;
    this.items = [];

    const count = opts.count ?? CONFIG.enemies.count;
    const alienCount = opts.alienCount ?? CONFIG.alienEnemies.count;

    const palette = [0xc0392b, 0x8e44ad, 0x2c3e50, 0x1e824c, 0xb9770e, 0x943126, 0x2e86c1];
    for (let i = 0; i < count; i++) {
      const material = new THREE.MeshStandardMaterial({
        color: palette[i % palette.length], emissive: 0x000000, roughness: .8, metalness: .1,
      });
      const enemy = new Enemy(scene, map, material, () => { this.kills++; });
      enemy.respawn(player.position);
      this.items.push(enemy);
    }

    // Чужие-враги — рядом с людьми: те же правила попаданий, но 3D-лазание
    const alienPalette = [0x3f5d2b, 0x2f4a33, 0x4a3a24];
    for (let i = 0; i < alienCount; i++) {
      const material = new THREE.MeshStandardMaterial({
        color: alienPalette[i % alienPalette.length], emissive: 0x000000, roughness: .75, metalness: .2,
      });
      const alien = new AlienEnemy(scene, map, material, player, () => { this.kills++; });
      alien.respawn(player.position);
      this.items.push(alien);
    }

    this._ray = new THREE.Ray();
    this._sphere = new THREE.Sphere();
    this._center = new THREE.Vector3();
    this._point = new THREE.Vector3();
  }

  get aliveCount() {
    let n = 0;
    for (const e of this.items) if (!e.dead) n++;
    return n;
  }

  /**
   * Перестановка активного окна (глава 4): мир главы привязан к центру окна,
   * поэтому вместе с ним сдвигается и начало координат. Каждый враг переносится
   * на `-(dx, dz)` — и остаётся там же, где стоял физически. Кто после сдвига
   * оказался за краем нового окна, тот молча снимается со сцены: граф улиц
   * собирается только в окне, поэтому маршрута к игроку у такого врага нет, а
   * стоять невидимым в несобранном районе он не должен. Возрождается он на узле
   * нового окна общей очередью (`respawn`).
   */
  shiftWorld(dx, dz) {
    const b = this.map.bounds;
    for (const e of this.items) {
      e.shift(dx, dz);
      if (!e.offstage && (e.position.x < b.minX || e.position.x > b.maxX || e.position.z < b.minZ || e.position.z > b.maxZ)) {
        e.despawn();
      }
    }
  }

  update(dt) {
    for (const enemy of this.items) {
      enemy.update(dt, this.player, this.camera, this.tracers);
    }
  }

  /**
   * Ближайший живой враг, которого задевает луч.
   * @returns {{enemy:Enemy, distance:number, point:THREE.Vector3}|null}
   */
  raycast(origin, direction, maxDist) {
    this._ray.origin.copy(origin);
    this._ray.direction.copy(direction);
    let best = null;

    for (const enemy of this.items) {
      if (enemy.dead || enemy.offstage) continue;
      // габариты попадания у людей и Чужих разные (см. hitOffsetY/hitRadius)
      const cy = enemy.hitOffsetY !== undefined ? enemy.hitOffsetY : BODY_CENTER_Y;
      const cr = enemy.hitRadius !== undefined ? enemy.hitRadius : BODY_RADIUS;
      this._center.set(enemy.position.x, enemy.position.y + cy, enemy.position.z);
      this._sphere.center.copy(this._center);
      this._sphere.radius = cr;
      const point = this._ray.intersectSphere(this._sphere, this._point);
      if (!point) continue;
      const distance = origin.distanceTo(point);
      if (distance > maxDist) continue;
      if (!best || distance < best.distance) {
        best = { enemy, distance, point: point.clone() };
      }
    }
    return best;
  }

  /** Живые враги в собранном районе — для миникарты. */
  forEachVisible(fn) {
    for (const enemy of this.items) if (!enemy.dead && !enemy.offstage) fn(enemy.position);
  }
}
