import * as THREE from 'three';
import { CONFIG } from './config.js';
import { beep } from './audio.js';

// Порог «горизонтальности» опоры: |up.y| больше — пол/потолок/крыша, меньше —
// почти вертикальная стена. Один порог на все переходы, чтобы «пол ↔ стена» и
// «стена ↔ крыша» были согласованы.
const WALL_NORMAL_Y = 0.7;
// Предел наклона взгляда относительно тела (±66°): камера не запрокидывается.
const PITCH_LIMIT = 1.15;
// Косинус между нормалями, при котором поверхность считается продолжением опоры.
const NORMAL_ALIGN = 0.86;
// Толщина перекрытия — та же величина, что у геометрии дома (см. config.building).
const SLAB = CONFIG.building.slabThickness;

/**
 * Тело Чужого: физика прилипания к поверхностям, ориентация по нормали опоры и
 * скачок. Не знает ни о вводе, ни о камере — подклассы задают намерение
 * (см. _control) и, при необходимости, рисуют модель.
 *
 * Тело не привязано к «гравитационной» сетке этажей, а прилипает к любой
 * поверхности. Нормаль поверхности (то, что для тела является «низом»)
 * находится рейкастом к твёрдым объёмам карты (map.raySolid), тело
 * удерживается сферой столкновений (map.resolveSphere).
 */
export class AlienBody {
  /** @param {import('./map.js').TownMap} map */
  constructor(map) {
    this.map = map;
    this.cfg = CONFIG.alien;

    // тело: центр сферы, скорость, «низ» (нормаль опоры) и «вперёд» тела
    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.up = new THREE.Vector3(0, 1, 0);
    this.fwd = new THREE.Vector3(0, 0, 1);
    this.pitch = 0;

    this.grounded = true;
    this.leapTimer = 0;
    this._leapHits = new Set(); // цели, уже раненые текущим скачком

    // здоровье и состояние боя (интерфейс тот же, что у человека)
    this.maxHealth = CONFIG.health.max;
    this.health = this.maxHealth;
    this.hurt = 0;
    this._lastDamage = -1e9;

    // намерение текущего кадра — заполняется в _control подкласса
    this._wish = new THREE.Vector3();
    this._moving = false;
    this._speed = this.cfg.speed.walk;
    this._jump = false;

    // параметры скачка: подкласс может подменить (например, у врага — прицельный пружинный прыжок)
    this.leapParams = null;
    // ленивый доступ к целям скачка: () => ({ items: [...] }) | null
    this._leapTargets = () => null;

    // рабочие векторы — чтобы не создавать мусор в игровом цикле
    this._right = new THREE.Vector3();
    this._tmp = new THREE.Vector3();
    this._down = new THREE.Vector3();
    this._target = new THREE.Vector3();
    this._mantle = new THREE.Vector3();
    this._probe = new THREE.Vector3();
    this._lookKeep = new THREE.Vector3();

    // плавный переход между поверхностями (перевал на крышу, проход сквозь лаз):
    // откуда и куда едем телом + сохранённый мировой взгляд на время переворота
    this._tween = null;
    this._twFromUp = new THREE.Vector3();
    this._twToUp = new THREE.Vector3();
    this._twFromPos = new THREE.Vector3();
    this._twToPos = new THREE.Vector3();
    this._twLook = new THREE.Vector3();
    this._twBuf = new THREE.Vector3();
    this._twQ = new THREE.Quaternion();
    this._twQ2 = new THREE.Quaternion();
  }

  get position() { return this.pos; }
  get direction() { return this.fwd; }
  get feetY() { return this.pos.y - this.cfg.radius; }
  get dead() { return this.health <= 0; }

  /** Урон от врага: снимает здоровье и запускает вспышку/регенерацию. */
  takeDamage(amount) {
    if (this.dead) return;
    this.health = Math.max(0, this.health - amount);
    this.hurt = 1;
    this._lastDamage = performance.now() / 1000;
  }

  /** Удерживает «вперёд» в плоскости опоры (перпендикулярно нормали). */
  _replanar() {
    this.fwd.addScaledVector(this.up, -this.fwd.dot(this.up));
    if (this.fwd.lengthSq() < 1e-6) {
      this._tmp.set(0, 0, 1);
      if (Math.abs(this._tmp.dot(this.up)) > 0.9) this._tmp.set(1, 0, 0);
      this.fwd.copy(this._tmp).addScaledVector(this.up, -this._tmp.dot(this.up));
    }
    this.fwd.normalize();
  }

  /** Плавно доворачивает нормаль тела под новую поверхность. */
  _alignUp(target, dt) {
    const k = 1 - Math.exp(-this.cfg.alignSpeed * dt);
    this.up.lerp(target, k);
    if (this.up.lengthSq() < 1e-6) this.up.set(0, 1, 0);
    this.up.normalize();
    this._replanar();
  }

  /** Мировая линия взгляда: «вперёд» тела, наклонённое на pitch вокруг нормали. */
  _lookVector(out) {
    return out.copy(this.fwd).multiplyScalar(Math.cos(this.pitch))
      .addScaledVector(this.up, Math.sin(this.pitch));
  }

  /**
   * Восстанавливает «вперёд» и наклон из сохранённой мировой линии взгляда при
   * текущей нормали тела. Возвращает false, если взгляд совпал с нормалью —
   * тогда направление по линии не восстановить, и вызывающий делает _replanar().
   */
  _restoreLook(look) {
    const along = look.dot(this.up);
    look.addScaledVector(this.up, -along);
    if (look.lengthSq() < 1e-4) return false;
    this.fwd.copy(look).normalize();
    const c = Math.max(-1, Math.min(1, along));
    this.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, Math.asin(c)));
    return true;
  }

  /**
   * То же, но сохраняет направление взгляда в мире. В полёте корпус плавно
   * встаёт «на ноги» (нормаль доворачивается к вертикали), а наклон взгляда при
   * этом не меняется — камера «перекидывается». При приземлении после скачка с
   * потолка на пол это давало взгляд вверх, и Чужой сам залезал по стене назад
   * на потолок. Здесь наклон и «вперёд» пересчитываются из сохранённого взгляда,
   * поэтому камера остаётся на той же линии, а опора просто переворачивается.
   */
  _alignUpLook(target, dt) {
    this._lookVector(this._lookKeep);
    this._alignUp(target, dt);
    this._restoreLook(this._lookKeep);
  }

  /** Ставит Чужого на поверхность под точкой появления. */
  spawnAt(point) {
    const ground = this.map.groundHeightAt(point.x, point.z, point.y || 0);
    const y = isFinite(ground) ? ground : 0;
    this.pos.set(point.x, y + this.cfg.radius, point.z);
    this.up.set(0, 1, 0);
    this.fwd.set(0, 0, 1);
    this.pitch = 0;
    this.vel.set(0, 0, 0);
    this.grounded = true;
    this.leapTimer = 0;
    this._leapHits.clear();
  }

  /**
   * Обновление физики за кадр. Подкласс в _control задаёт намерение движения
   * (_wish/_moving/_speed/_jump) и ориентацию, а в _postUpdate делает своё
   * (например, обновляет камеру игрока).
   */
  update(dt) {
    this._control(dt);

    if (this._tween) this._updateTransition(dt);
    else if (this.leapTimer > 0) this._updateLeap(dt);
    else if (this.grounded) this._updateGrounded(dt, this._moving, this._speed);
    else this._updateAirborne(dt, this._moving, this._speed);

    this._clampWorld();
    this._postUpdate(dt);
    this._regen(dt);
  }

  /** Намерение движения текущего кадра — переопределяется подклассом. */
  _control(dt) {}

  /** Завершение кадра — переопределяется подклассом (например, камера игрока). */
  _postUpdate(dt) {}

  /** Движение по поверхности, поиск опоры и переход на стены/потолок. */
  _updateGrounded(dt, moving, speed) {
    const cfg = this.cfg;
    const pos = this.pos;

    // разгон по касательной к поверхности
    const target = this._tmp.copy(this._wish).multiplyScalar(moving ? speed : 0);
    const k = 1 - Math.exp(-14 * dt);
    this.vel.x += (target.x - this.vel.x) * k;
    this.vel.y += (target.y - this.vel.y) * k;
    this.vel.z += (target.z - this.vel.z) * k;
    this.vel.addScaledVector(this.up, -this.vel.dot(this.up)); // строго по опоре

    this._moveAndCollide(dt);

    // Опора. Сначала ищем стену по направлению движения: если упёрлись в
    // наклонную поверхность, переходим на неё (пол → стена → потолок).
    // Иначе опираемся на поверхность под телом.
    //
    // Переход с горизонтальной опоры (пол/потолок) на стену — только когда
    // игрок смотрит вверх (pitch > climbPitch): иначе при ровном взгляде тело
    // просто упирается в стену. Так после скачка с потолка Чужой не залезает
    // обратно сам. На самих стенах переходы (углы) остаются автоматическими.
    let hit = null;
    const canClimb = this.pitch > cfg.climbPitch * Math.PI / 180;
    if (moving && (canClimb || Math.abs(this.up.y) <= WALL_NORMAL_Y)) {
      const fh = this.map.raySolid(pos.x, pos.y, pos.z, this._wish.x, this._wish.y, this._wish.z,
        cfg.radius + cfg.stepUp);
      if (fh && (fh.nx * this.up.x + fh.ny * this.up.y + fh.nz * this.up.z) < NORMAL_ALIGN) hit = fh;
    }
    if (!hit) {
      const down = this._down.copy(this.up).negate();
      hit = this.map.raySolid(pos.x, pos.y, pos.z, down.x, down.y, down.z, cfg.radius + cfg.stepUp);
    }

    // Сквозной лаз в перекрытии (потолок ↔ крыша): опоры под телом нет, но
    // плита в этом месте прорезана насквозь — проходим на её обратную сторону.
    if (!hit && this._tryThroughHole()) return;

    // Тело идёт по горизонтали (крыша/пол) к краю: если впереди опоры уже нет,
    // а ниже кромки проходит стена — принимаем стену за опору и сползаем по
    // ней, а не падаем вниз (обратный случай к перевалу _tryMantle).
    if (moving && Math.abs(this.up.y) > WALL_NORMAL_Y) {
      const wall = this._edgeWall();
      if (wall) hit = wall;
    }

    if (!hit) {
      // Опора пропала, а лаза рядом нет. Если тело ползло по почти вертикальной
      // стене, то возможны два конца: торец стены сбоку (наружный угол дома) —
      // обходим его, не падая; либо верхняя кромка — переваливаемся на крышу.
      if (this._tryCornerWrap()) return;
      if (this._tryMantle()) return;
      this.grounded = false;
      return;
    }

    this._target.set(hit.nx, hit.ny, hit.nz);
    this._alignUp(this._target, dt);

    // подтягиваем центр тела к найденной поверхности на радиус
    const a = 1 - Math.exp(-cfg.alignSpeed * dt);
    pos.x += (hit.x + this.up.x * cfg.radius - pos.x) * a;
    pos.y += (hit.y + this.up.y * cfg.radius - pos.y) * a;
    pos.z += (hit.z + this.up.z * cfg.radius - pos.z) * a;

    // отрыв от поверхности обычным прыжком
    if (this._jump) {
      this.vel.copy(this.up).multiplyScalar(cfg.jump);
      this.grounded = false;
      beep(200, 0.07, 'triangle');
    }
  }

  /**
   * Двигает тело на vel·dt, разбивая шаг на подшаги и выталкивая сферу из
   * препятствий на каждом. Нужно из-за высокой скорости скачка: за кадр тело
   * пролетает ~0.8 юнита и без подшагов «протыкает» тонкие перекрытия (0.3):
   * центр оказывается за серединой плиты, и выталкивание уводит его наружу
   * с обратной стороны.
   */
  _moveAndCollide(dt) {
    const r = this.cfg.radius;
    const dist = this.vel.length() * dt;
    const n = Math.max(1, Math.ceil(dist / (r * 0.5)));
    const sdt = dt / n;
    for (let i = 0; i < n; i++) {
      this.pos.addScaledVector(this.vel, sdt);
      this.map.resolveSphere(this.pos, r);
    }
  }

  /**
   * Перевал через верхнюю кромку стены (mantle). Вызывается, когда «низ»
   * перестал находить поверхность: тело дошло до края и упёрлось в пустоту.
   * Сдвигаем тело внутрь поверхности (за кромку), даём столкновениям вынести
   * его наверх и встаём на горизонтальную крышу под ним.
   * @returns {boolean} удалось ли встать на верхнюю поверхность
   */
  _tryMantle() {
    const cfg = this.cfg;
    if (Math.abs(this.up.y) > WALL_NORMAL_Y) return false; // перевал нужен только со стен

    const step = cfg.radius + cfg.stepUp;
    this._mantle.set(
      this.pos.x - this.up.x * step,
      this.pos.y - this.up.y * step,
      this.pos.z - this.up.z * step,
    );
    this.map.resolveSphere(this._mantle, cfg.radius);

    const hit = this.map.raySolid(
      this._mantle.x, this._mantle.y, this._mantle.z, 0, -1, 0, cfg.radius + cfg.stepUp,
    );
    if (!hit || hit.ny < 0.5) return false;

    this._beginTransition(hit); // плавный перевал на крышу, без рывка камеры
    return true;
  }

  /**
   * Проход сквозь сквозной лаз в перекрытии (потолок ↔ крыша). Чужой ползёт по
   * горизонтальной поверхности и доходит до прямоугольного проёма: опора под
   * телом пропадает, но плита в этом месте прорезана насквозь, а с обратной
   * стороны есть такая же поверхность. Переносим центр тела на другую сторону
   * перекрытия и находим там опору, смещаясь по направлению движения к дальнему
   * краю проёма.
   * @returns {boolean} удалось ли перейти на обратную сторону перекрытия
   */
  _tryThroughHole() {
    const cfg = this.cfg;
    const r = cfg.radius;

    // переход возможен только с горизонтальной опоры (пол / потолок / крыша)
    if (Math.abs(this.up.y) <= WALL_NORMAL_Y) return false;

    const into = this._probe.copy(this.up).negate(); // ось «внутрь плиты»

    // 1) Убеждаемся, что это именно проём: вдоль нормали внутрь плиты твёрдого
    //    тела быть не должно — иначе опора пропала по другой причине (край).
    const solid = this.map.raySolid(
      this.pos.x, this.pos.y, this.pos.z, into.x, into.y, into.z, r + 0.6,
    );
    if (solid) return false;

    // 2) Переносим центр тела на обратную сторону перекрытия.
    const cross = SLAB + 2 * r + 0.05;
    const p = this._mantle.set(
      this.pos.x + into.x * cross,
      this.pos.y + into.y * cross,
      this.pos.z + into.z * cross,
    );
    this.map.resolveSphere(p, r);

    // 3) Ищем опору на новой стороне, смещаясь по ходу движения к дальнему краю.
    const dir = this._tmp.copy(this._wish);
    dir.addScaledVector(this.up, -dir.dot(this.up));
    if (dir.lengthSq() < 1e-6) dir.copy(this.fwd).addScaledVector(this.up, -this.fwd.dot(this.up));
    if (dir.lengthSq() < 1e-6) return false;
    dir.normalize();

    // Опора обратной стороны лежит в направлении старой нормали, а её собственная
    // нормаль направлена к нам (новая опора — «антипод» прежней).
    const step = Math.max(r * 0.5, 0.2);
    const maxScan = cfg.holeScan;
    for (let t = 0; t <= maxScan; t += step) {
      const hit = this.map.raySolid(
        p.x + dir.x * t, p.y + dir.y * t, p.z + dir.z * t,
        this.up.x, this.up.y, this.up.z, r + 0.4,
      );
      if (!hit) continue;
      if (-(hit.nx * this.up.x + hit.ny * this.up.y + hit.nz * this.up.z) < 0.5) continue;
      this._beginTransition(hit); // плавный проход сквозь лаз, без телепорта
      return true;
    }
    return false;
  }

  /**
   * Наружная стена под кромкой крыши/пола (обратный случай к перевалу). Тело
   * идёт по горизонтальной опоре к краю: «носок» впереди уже нависает над
   * пустотой, а ниже кромки проходит почти вертикальная стена. Возвращает
   * поверхность стены — её принимаем за новую опору, чтобы сползти по ней,
   * а не упасть. Работает в мировых горизонтальных координатах.
   * @returns {?object} пересечение стены (формат map.raySolid) или null
   */
  _edgeWall() {
    const cfg = this.cfg;
    const r = cfg.radius;
    const pro = this._probe;

    // горизонтальное направление движения
    const d = this._tmp.copy(this._wish);
    d.y = 0;
    if (d.lengthSq() < 1e-6) return null;
    d.normalize();

    // «носок» впереди тела: если под ним ещё есть горизонтальная опора, то это
    // не край — сход не нужен.
    pro.copy(this.pos).addScaledVector(d, r + 0.15);
    const under = this.map.raySolid(pro.x, pro.y, pro.z, 0, -1, 0, r + cfg.stepUp + 0.5);
    if (under && under.ny > 0.5) return null;

    // Опора впереди кончилась: из-за края бьём горизонтально назад в дом на
    // высоте ниже кромки — там должна стоять почти вертикальная стена.
    pro.y -= r + 0.5;
    const hit = this.map.raySolid(pro.x, pro.y, pro.z, -d.x, 0, -d.z, r + cfg.stepUp);
    if (!hit || Math.abs(hit.ny) > 0.5) return null;
    return hit;
  }

  /**
   * Обход наружного угла дома. Чужой ползёт по вертикальной стене к её торцу:
   * опоры под телом больше нет, но за углом начинается перпендикулярная стена.
   * Направление движения D по стене совпадает с наружной нормалью соседней стены
   * (она смотрит «в сторону движения»), поэтому новая опора — это D, а «вперёд»
   * на ней — минус прежняя нормаль. Нашариваем соседнюю стену за углом и встаём
   * на неё, чтобы не сорваться вниз.
   * @returns {boolean} удалось ли перебраться на смежную стену
   */
  _tryCornerWrap() {
    const cfg = this.cfg;
    if (Math.abs(this.up.y) > WALL_NORMAL_Y) return false; // только со стен

    // направление движения по стене (горизонтальная касательная)
    const d = this._tmp.copy(this._wish);
    d.y = 0;
    if (d.lengthSq() < 1e-6) return false;
    d.normalize();

    const n1 = this.up;               // нормаль текущей стены
    const n2 = this._right.copy(d);   // нормаль соседней стены = ход движения

    // пробная точка за углом: по ходу движения и на радиус вбок от текущей
    // стены — иначе она остаётся сбоку от торца и луч проходит мимо соседней.
    const push = cfg.radius + 0.2;
    const side = cfg.radius + 0.2;
    const px = this.pos.x + n2.x * push - n1.x * side;
    const py = this.pos.y;
    const pz = this.pos.z + n2.z * push - n1.z * side;

    // бьём назад вдоль −n2 в соседнюю стену и требуем её внешнюю грань
    const hit = this.map.raySolid(px, py, pz, -n2.x, 0, -n2.z, push + side + 0.5);
    if (!hit) return false;
    if (hit.nx * n2.x + hit.ny * n2.y + hit.nz * n2.z < NORMAL_ALIGN) return false;

    // встаём на соседнюю стену и разворачиваем тело вдоль неё
    const f2 = this._probe.copy(n1).negate(); // «вперёд» новой стены = −прежняя нормаль
    this._land(hit);
    this.up.copy(n2);
    this.fwd.copy(f2);
    this.pitch = 0;
    this._replanar();
    return true;
  }

  /** Полёт под гравитацией: прыжок, падение с края, посадка на поверхность. */
  _updateAirborne(dt, moving, speed) {
    const cfg = this.cfg;

    if (moving) { // ослабленное управление в воздухе
      const target = this._tmp.copy(this._wish).multiplyScalar(speed * cfg.airControl);
      const k = 1 - Math.exp(-4 * dt);
      this.vel.x += (target.x - this.vel.x) * k;
      this.vel.z += (target.z - this.vel.z) * k;
    }

    this.vel.y -= CONFIG.gravity * dt;
    this._moveAndCollide(dt);

    this._target.set(0, 1, 0);
    this._alignUpLook(this._target, dt);

    this._tryLandBelow();
  }

  /** Далёкий скачок: стартовая скорость в заданном направлении. */
  _leap(dir) {
    if (!this.grounded || this.leapTimer > 0) return;
    const l = this.leapParams || this.cfg.leap;

    const d = this._tmp.copy(dir);

    // ограничиваем угол возвышения, иначе скачок не долетит до соседней крыши
    const minE = l.minElevation * Math.PI / 180;
    const maxE = l.maxElevation * Math.PI / 180;
    const e = Math.asin(Math.max(-1, Math.min(1, d.dot(this.up))));
    if (e < minE || e > maxE) {
      const a = Math.max(minE, Math.min(maxE, e));
      d.copy(this.fwd).multiplyScalar(Math.cos(a)).addScaledVector(this.up, Math.sin(a)).normalize();
    }

    this.vel.copy(d).multiplyScalar(l.speed);
    this.grounded = false;
    this.leapTimer = l.maxTime;
    this._leapHits.clear(); // новый скачок — каждая цель снова может быть ранена
    beep(90, 0.18, 'sawtooth');
    setTimeout(() => beep(60, 0.22, 'sawtooth'), 70);
  }

  /** Урон, который скачок наносит цели (у врага-Чужего он свой). */
  _leapDamage() {
    return CONFIG.weapon.damage;
  }

  /** Обновление скачка: баллистика, поражение целей и посадка. */
  _updateLeap(dt) {
    const cfg = this.cfg;
    const pos = this.pos;

    this.leapTimer -= dt;
    this.vel.y -= CONFIG.gravity * dt;

    // Удар в преграду: скачок не «скользит» вдоль поверхности, а останавливается
    // и прилипает к ней (стена, пол или потолок). Бросаем луч вдоль вектора
    // скорости на длину шага с запасом на радиус: если впереди твёрдая
    // поверхность — встаём на неё и гасим скорость.
    const speed = this.vel.length();
    if (speed > 1e-6) {
      const dir = this._tmp.copy(this.vel).multiplyScalar(1 / speed);
      const hit = this.map.raySolid(
        pos.x, pos.y, pos.z, dir.x, dir.y, dir.z, speed * dt + cfg.radius,
      );
      if (hit) { this._land(hit); return; }
    }

    this._moveAndCollide(dt);

    this._target.set(0, 1, 0);
    this._alignUpLook(this._target, dt);

    // касание цели в полёте — урон «как при стрельбе». За один скачок каждая
    // цель ранится не более раза: без этого контакт держался бы несколько кадров
    // и урон начислялся многократно.
    const targets = this._leapTargets();
    if (targets) {
      const kr = cfg.leap.killRadius;
      for (const e of targets.items) {
        if (e.dead || this._leapHits.has(e)) continue;
        const cy = e.hitOffsetY !== undefined ? e.hitOffsetY : 1.0; // центр корпуса
        const cr = e.hitRadius !== undefined ? e.hitRadius : kr;
        const dx = pos.x - e.position.x;
        const dy = pos.y - (e.position.y + cy);
        const dz = pos.z - e.position.z;
        if (dx * dx + dy * dy + dz * dz <= cr * cr) {
          e.takeDamage(this._leapDamage());
          this._leapHits.add(e);
        }
      }
    }

    if (this._tryLandBelow()) return;
    if (this.leapTimer <= 0) { this.vel.set(0, 0, 0); this.grounded = true; this.leapTimer = 0; }
  }

  /**
   * Ищет опору прямо под телом и, если она есть и тело не поднимается,
   * приземляется на неё. Общий шаг полёта и скачка.
   * @returns {boolean} приземлились ли
   */
  _tryLandBelow() {
    const hit = this.map.raySolid(
      this.pos.x, this.pos.y, this.pos.z, 0, -1, 0, this.cfg.radius + 0.35,
    );
    if (!hit || this.vel.y > 0.01) return false;
    this._land(hit);
    return true;
  }

  /**
   * Начинает плавный переход тела на другую поверхность (перевал со стены на
   * крышу, проход сквозь лаз). В отличие от мгновенного `_land`, позиция и
   * нормаль доводятся за несколько кадров, поэтому камера не «перекидывается»
   * рывком. Мировая линия взгляда сохраняется — меняется только ориентация тела.
   */
  _beginTransition(hit) {
    const cfg = this.cfg;
    this._lookVector(this._twLook);
    this._twFromUp.copy(this.up);
    this._twToUp.set(hit.nx, hit.ny, hit.nz).normalize();
    this._twFromPos.copy(this.pos);
    this._twToPos.set(
      hit.x + hit.nx * cfg.radius,
      hit.y + hit.ny * cfg.radius,
      hit.z + hit.nz * cfg.radius,
    );

    const tr = cfg.transition;
    const dist = this._twFromPos.distanceTo(this._twToPos);
    const dur = Math.max(tr.minTime, Math.min(tr.maxTime, dist / tr.speed));
    this._twQ.setFromUnitVectors(this._twFromUp, this._twToUp);

    this._tween = { t: 0, dur };
    this.vel.set(0, 0, 0);
    this.grounded = true;
    this.leapTimer = 0;
    beep(160, 0.05, 'triangle');
  }

  /** Кадр плавного перехода: доводим позицию и нормаль тела с easing. */
  _updateTransition(dt) {
    const tw = this._tween;
    tw.t += dt;
    const a = Math.min(1, tw.t / tw.dur);
    const e = a * a * (3 - 2 * a); // smoothstep: мягкий разгон и торможение

    this.pos.copy(this._twFromPos).lerp(this._twToPos, e);
    this._twQ2.set(0, 0, 0, 1).slerp(this._twQ, e);
    this.up.copy(this._twFromUp).applyQuaternion(this._twQ2).normalize();
    if (!this._restoreLook(this._twBuf.copy(this._twLook))) this._replanar();

    if (a >= 1) this._tween = null;
  }

  /** Ставит тело на поверхность и «прилипает» к ней. */
  _land(hit) {
    const cfg = this.cfg;
    // Приземление после опоры на горизонталь (пол ↔ потолок, скачок, падение)
    // переворачивает тело, а наклон взгляда остаётся прежним — камера
    // «перекидывается», и, оказавшись на полу взглядом вверх, Чужой сам залезает
    // обратно по стене на потолок. Запоминаем линию взгляда в мире и восстановим
    // её после смены опоры. Переходы со стен (перевал на крышу, сползание) не
    // трогаем — там камера должна следовать за доворотом корпуса.
    const keepLook = Math.abs(this.up.y) > WALL_NORMAL_Y;
    if (keepLook) this._lookVector(this._lookKeep);

    this.pos.set(
      hit.x + hit.nx * cfg.radius,
      hit.y + hit.ny * cfg.radius,
      hit.z + hit.nz * cfg.radius,
    );
    this.up.set(hit.nx, hit.ny, hit.nz).normalize();
    if (!keepLook || !this._restoreLook(this._lookKeep)) this._replanar();
    this.vel.set(0, 0, 0);
    this.grounded = true;
    this.leapTimer = 0;
    beep(160, 0.05, 'triangle');
  }

  /** Не даёт выйти за пределы карты и уйти под землю. */
  _clampWorld() {
    const cfg = this.cfg;
    const half = this.map.width / 2;
    const lim = half - cfg.radius;
    if (this.pos.x > lim) this.pos.x = lim;
    else if (this.pos.x < -lim) this.pos.x = -lim;
    if (this.pos.z > lim) this.pos.z = lim;
    else if (this.pos.z < -lim) this.pos.z = -lim;
    if (this.pos.y < cfg.radius) {
      this.pos.y = cfg.radius;
      if (this.vel.y < 0) {
        this.up.set(0, 1, 0);
        this._replanar();
        this.vel.set(0, 0, 0);
        this.grounded = true;
        this.leapTimer = 0;
      }
    }
  }

  /** Заживление после затишья и затухание вспышки урона. */
  _regen(dt) {
    const now = performance.now() / 1000;
    if (this.health > 0 && this.health < this.maxHealth &&
        now - this._lastDamage > CONFIG.health.regenDelay) {
      this.health = Math.min(this.maxHealth, this.health + CONFIG.health.regenRate * dt);
    }
    this.hurt = Math.max(0, this.hurt - dt * 2.5);
  }
}

/**
 * Минимальный контроллер захвата курсора: только блокировка/события, без
 * вращения камеры (ориентацию Чужого считает сам Alien под нормаль опоры).
 */
class PointerLock {
  /** @param {HTMLElement} domElement */
  constructor(domElement) {
    this.dom = domElement;
    this.isLocked = false;
    this._lock = [];
    this._unlock = [];
    this._onChange = () => {
      const locked = document.pointerLockElement === this.dom;
      if (locked === this.isLocked) return;
      this.isLocked = locked;
      for (const fn of locked ? this._lock : this._unlock) fn();
    };
    document.addEventListener('pointerlockchange', this._onChange);
  }

  lock() { if (this.dom.requestPointerLock) this.dom.requestPointerLock(); }
  unlock() { if (document.pointerLockElement) document.exitPointerLock(); }

  addEventListener(type, fn) {
    if (type === 'lock') this._lock.push(fn);
    else if (type === 'unlock') this._unlock.push(fn);
  }
}

/**
 * Играбельный Чужой. Надстраивает над AlienBody управление с клавиатуры/мыши и
 * камеру: взгляд поворачивается вокруг текущей нормали, а сама нормаль плавно
 * доворачивается под новую поверхность, поэтому при переходе «пол → стена →
 * потолок» картинку не переворачивает.
 *
 * Вместо стрельбы — далёкий скачок по ЛКМ (см. config.alien.leap): попадёт по
 * врагу в полёте — враг получает урон.
 */
export class Alien extends AlienBody {
  /**
   * @param {THREE.Camera} camera
   * @param {HTMLElement} domElement
   * @param {import('./map.js').TownMap} map
   * @param {Function} getEnemies ленивый доступ к менеджеру врагов (для скачка)
   */
  constructor(camera, domElement, map, getEnemies) {
    super(map);
    this.camera = camera;
    this.controls = new PointerLock(domElement);
    this._leapTargets = getEnemies || (() => null);

    this.keys = new Set();

    this._look = new THREE.Vector3();
    this._camTarget = new THREE.Vector3();
    this._q = new THREE.Quaternion();

    this._bindInput();
  }

  get position() { return this.camera.position; }
  get isLocked() { return this.controls.isLocked; }

  lock() { this.controls.lock(); }
  unlock() { this.controls.unlock(); }

  _bindInput() {
    addEventListener('keydown', e => {
      this.keys.add(e.code);
      if (e.code === 'Space') e.preventDefault();
    });
    addEventListener('keyup', e => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());
    addEventListener('mousemove', e => this._onMouseMove(e));
    addEventListener('mousedown', e => {
      if (e.button !== 0 || !this.isLocked) return;
      this._leap();
    });
  }

  /** Обзор: поворот «вперёд» вокруг текущей опоры + наклон взгляда. */
  _onMouseMove(e) {
    if (!this.isLocked) return;
    const s = this.cfg.lookSensitivity;
    this._q.setFromAxisAngle(this.up, -e.movementX * s);
    this.fwd.applyQuaternion(this._q);
    this._replanar();
    this.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, this.pitch - e.movementY * s));
  }

  spawnAt(point) {
    super.spawnAt(point);
    this._updateCamera();
  }

  /** Желаемое движение из клавиш WASD (в плоскости опоры) + прыжок. */
  _control(dt) {
    const cfg = this.cfg;
    const keys = this.keys;

    this._right.copy(this.fwd).cross(this.up).normalize();
    const f = (keys.has('KeyW') ? 1 : 0) - (keys.has('KeyS') ? 1 : 0);
    const s = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0);
    this._wish.set(0, 0, 0).addScaledVector(this.fwd, f).addScaledVector(this._right, s);
    this._moving = this._wish.lengthSq() > 1e-6;
    if (this._moving) {
      this._wish.normalize();
      this._wish.addScaledVector(this.up, -this._wish.dot(this.up));
      if (this._wish.lengthSq() < 1e-6) this._wish.set(0, 0, 0);
      else this._wish.normalize();
    }
    this._speed = (keys.has('ShiftLeft') || keys.has('ShiftRight')) ? cfg.speed.run : cfg.speed.walk;
    this._jump = keys.has('Space');
  }

  _postUpdate(dt) { this._updateCamera(); }

  /** Скачок по ЛКМ — в сторону взгляда камеры. */
  _leap() {
    this.camera.getWorldDirection(this._look);
    super._leap(this._look);
  }

  /** Собирает камеру: позиция — вдоль нормали от центра тела, взгляд — по fwd/pitch. */
  _updateCamera() {
    const cfg = this.cfg;
    const cos = Math.cos(this.pitch), sin = Math.sin(this.pitch);
    this._look.copy(this.fwd).multiplyScalar(cos).addScaledVector(this.up, sin).normalize();

    this.camera.position.copy(this.pos).addScaledVector(this.up, cfg.eyeOffset);
    this.camera.up.copy(this.up);
    this._camTarget.copy(this.camera.position).add(this._look);
    this.camera.lookAt(this._camTarget);
  }
}
