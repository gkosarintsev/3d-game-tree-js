import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
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

    // машина, которую ведёт это тело (`src/vehicle.js`); null — пока идёт пешком.
    // У врага (`AlienEnemy`) поле не заполняется никогда, поэтому его `position` —
    // по-прежнему собственный `pos`, который он сам пишет через этот геттер.
    this.vehicle = null;

    // намерение текущего кадра — заполняется в _control подкласса
    this._wish = new THREE.Vector3();
    this._moving = false;
    this._speed = this.cfg.speed.walk;

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
    this._twQ3 = new THREE.Quaternion();
    this._twQ4 = new THREE.Quaternion();
    this._twAxis = new THREE.Vector3();
    this._twTravel = new THREE.Vector3();
    this._twFix = new THREE.Quaternion();
    this._twArc = 0;
    this._twTwistAng = 0;
    this._twHalf = false;
  }

  // Пока тело в машине, его точкой, направлением и «ногами» считают кузов: тот
  // едет по своим пробам опоры, и пересчитывать их дважды — значит разъезжать
  // с настилом, к которому прижат. `pos` при этом остаётся своим (ноги в кузове
  // не нужны), поэтому выход из машины ставит тело на опору заново.
  get position() { return this.vehicle ? this.vehicle.pos : this.pos; }
  get direction() { return this.vehicle ? this.vehicle.direction : this.fwd; }
  get feetY() { return this.vehicle ? this.vehicle.pos.y : this.pos.y - this.cfg.radius; }
  get dead() { return this.health <= 0; }

  /** Урон от врага: снимает здоровье и запускает вспышку/регенерацию. */
  takeDamage(amount) {
    // в кузове Чужой неуязвим: машина не держит ни пуль, ни лап, но право
    // ведения снимает урон с тела, а не с геометрии
    if (this.dead || this.vehicle) return;
    this.health = Math.max(0, this.health - amount);
    this.hurt = 1;
    this._lastDamage = performance.now() / 1000;
  }

  /**
   * Развернуть «вперёд» тела вдоль мировой оси `(dx, dz)`: так Чужой выходит из
   * машины лицом вдоль её носа. Нормаль ставит вертикалью, наклон взгляда гасит,
   * и `fwd` получает ту же плоскость, что и у опоры (`_replanar`).
   */
  face(dx, dz) {
    this.up.set(0, 1, 0);
    this.fwd.set(dx, 0, dz);
    this._replanar();
    this.pitch = 0;
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
   * Перенос тела вместе с миром: при перестановке активного окна главы 4
   * (src/stream-map.js) начало координат главы уходит на (dx, dz) метров файла,
   * и все мировые точки сущности обязаны сдвинуться, иначе Чужой окажется на 260
   * м западнее там, где он стоял. Направления — нормаль опоры, «вперёд», линия
   * взгляда и скорость — не трогаем: окно переводится без поворота.
   */
  shift(dx, dz) {
    this.pos.x -= dx;
    this.pos.z -= dz;
    if (this._tween) {
      // посреди плавного перевала тело едет между двумя мировыми точками —
      // обе относятся к старому окну
      this._twFromPos.x -= dx; this._twFromPos.z -= dz;
      this._twToPos.x -= dx; this._twToPos.z -= dz;
    }
  }

  /**
   * Обновление физики за кадр. Подкласс в _control задаёт намерение движения
   * (_wish/_moving/_speed) и ориентацию, а в _postUpdate делает своё
   * (например, обновляет камеру игрока).
   */
  update(dt) {
    // в машине физика тела спит: кузов ведёт свою поступь, лапы не работают,
    // а здоровье продолжает залечиваться ровно как у идущего. `pos` при этом не
    // переносим: выход из машины ставит тело на опору через `spawnAt`.
    if (this.vehicle) {
      this._postUpdate(dt);
      this._regen(dt);
      return;
    }

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

  /**
   * Прыжок вперёд (Space): стартовая скорость в заданном направлении.
   * Направления может не быть — тогда прыгаем вдоль взгляда (fwd с учётом
   * наклона), как это видит игрок.
   */
  _leap(dir) {
    if (!this.grounded || this.leapTimer > 0) return;
    const l = this.leapParams || this.cfg.leap;

    const d = this._tmp;
    if (dir) d.copy(dir);
    else d.copy(this.fwd).multiplyScalar(Math.cos(this.pitch))
      .addScaledVector(this.up, Math.sin(this.pitch)).normalize();

    // ограничиваем угол возвышения: слишком пологий не долетит до цели,
    // слишком крутой уведёт тело почти вертикально
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

  /**
   * Урон, которым касание цели в полёте ранит её. Маленький (config.alien.leap):
   * прыжок — средство передвижения, а не оружие; бьёт рука (см. Alien._strike).
   * У врага-Чужего он свой.
   */
  _leapDamage() {
    return this.cfg.leap.damage;
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

    // касание цели в полёте ранит её слегка (leap.damage). За один прыжок каждая
    // цель получает удар не более раза: без этого контакт держался бы несколько
    // кадров и урон начислялся многократно.
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
   * ориентация доводятся за несколько кадров, поэтому камера не «перекидывается»
   * рывком.
   *
   * Ориентация — дуга вокруг **касательной кромки**: плоскость перевала обязана
   * содержать направление бега. Один `setFromUnitVectors(fromUp, toUp)` этого не
   * даёт: касательной в нём нет, а при антипараллельных нормах (переворот
   * потолок ↔ кровля сквозь лаз) Three.js берёт ось из наименьшей по модулю
   * компоненты — для `(0,−1,0)` это мировая Z, то есть вдоль бега, и перевал
   * читается бочкой вокруг линии взгляда (замер — docs/defects-v2-plan.md).
   *
   * Линия взгляда едет вместе с корпусом (поворотом той же дуги). Горизонт после
   * переворота остаётся горизонтом — ровно то, ради чего взгляд сохраняли в мире,
   * — но без вырождения в середине дуги: там мировая линия становится параллельна
   * новой нормали, `_restoreLook` не оставляет выбора, и `_replanar` бросает
   * «вперёд» на мировую ось (отсюда «поворот вбок» на косом фасаде v2).
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

    const dot = Math.max(-1, Math.min(1, this._twFromUp.dot(this._twToUp)));
    this._twArc = Math.acos(dot);
    this._transitionAxis(this._twAxis);
    this._twQ.setFromAxisAngle(this._twAxis, this._twArc);
    // Дуга обязана кончаться точно в нормали цели: ось из направления бега
    // перпендикулярна ей, но не прежней нормали, и без доводки последний кадр
    // разворачивает корпус рывком (на креновой дуге моста — на доли градуса).
    this._twBuf.copy(this._twFromUp).applyQuaternion(this._twQ);
    this._twFix.setFromUnitVectors(this._twBuf, this._twToUp);
    this._twQ.premultiply(this._twFix);

    // Переворот на 180° (потолок ↔ кровля сквозь лаз) дугой через кромку всегда
    // разворачивает «вперёд» против бега: с зажатой «вперёд» тело тут же вернулось
    // бы в тот же лаз. Второй половиной перехода доворачиваем корпус вокруг новой
    // опоры по направлению бега — переворот через край, как человек из люка.
    this._twHalf = false;
    this._twTwistAng = 0;
    if (this._twArc > Math.PI * 0.75) {
      const dir = this._travelDir(this._probe);
      dir.addScaledVector(this._twToUp, -dir.dot(this._twToUp));
      const look = this._twTravel.copy(this._twLook).applyQuaternion(this._twQ);
      look.addScaledVector(this._twToUp, -look.dot(this._twToUp));
      if (dir.lengthSq() > 1e-4 && look.lengthSq() > 1e-4) {
        dir.normalize();
        look.normalize();
        const ang = Math.atan2(this._tmp.crossVectors(look, dir).dot(this._twToUp), look.dot(dir));
        if (Math.abs(ang) > 0.2) {
          this._twTwistAng = ang;
          this._twHalf = true;
        }
      }
    }

    this._tween = { t: 0, dur };
    this.vel.set(0, 0, 0);
    this.grounded = true;
    this.leapTimer = 0;
    beep(160, 0.05, 'triangle');
  }

  /**
   * Горизонтальное направление бега текущего кадра — по нему ориентируется
   * плоскость перевала. Без намерения движения берём «вперёд» тела, без него —
   * вектор переноса центра: переход всегда куда-то едет.
   */
  _travelDir(out) {
    out.copy(this._wish).setY(0);
    if (out.lengthSq() < 1e-6) out.copy(this.fwd).setY(0);
    if (out.lengthSq() < 1e-6) out.copy(this._twToPos).sub(this._twFromPos).setY(0);
    return out;
  }

  /**
   * Ось дуги перехода. Пока нормали не противоположны, это `fromUp × toUp` —
   * единственная ось короткой дуги, она же касательная кромки (для перевала
   * стена → крыша даёт ровно те −90° вокруг фасада, что и раньше). У
   * противоположных нормалей короткая дуга не определена, и ось берётся
   * перпендикулярно бегу: `бег × toUp` — та из двух полуокружностей, на которой
   * голова в середине дуги смотрит на новую опору, а не вниз.
   */
  _transitionAxis(out) {
    out.crossVectors(this._twFromUp, this._twToUp);
    if (out.lengthSq() > 1e-4 && this._twArc < Math.PI - 0.2) return out.normalize();
    const travel = this._travelDir(this._twTravel);
    out.crossVectors(travel, this._twToUp);
    if (out.lengthSq() < 1e-8) out.crossVectors(travel, this._twFromUp);
    if (out.lengthSq() < 1e-8) {
      // ни бега, ни переноса: любая ось, перпендикулярная нормали цели
      out.set(0, 0, 1);
      if (Math.abs(out.dot(this._twToUp)) > 0.9) out.set(1, 0, 0);
      out.crossVectors(out, this._twToUp);
    }
    return out.normalize();
  }

  /** Кадр плавного перехода: доводим позицию и ориентацию тела с easing. */
  _updateTransition(dt) {
    const tw = this._tween;
    tw.t += dt;
    const a = Math.min(1, tw.t / tw.dur);
    const e = a * a * (3 - 2 * a); // smoothstep: мягкий разгон и торможение

    this.pos.copy(this._twFromPos).lerp(this._twToPos, e);
    if (this._twHalf) {
      // первая половина — дуга через кромку, вторая — доворот по ходу бега;
      // доводка концевой нормали размазана по второму этапу
      const flip = Math.min(1, 2 * e);
      const turn = Math.max(0, 2 * e - 1);
      this._twQ2.setFromAxisAngle(this._twAxis, this._twArc * flip);
      this._twQ3.identity().slerp(this._twFix, turn);
      this._twQ4.setFromAxisAngle(this._twToUp, this._twTwistAng * turn);
      this._twQ2.premultiply(this._twQ3).premultiply(this._twQ4);
    } else {
      this._twQ2.set(0, 0, 0, 1).slerp(this._twQ, e);
    }
    this.up.copy(this._twFromUp).applyQuaternion(this._twQ2).normalize();
    // взгляд едет вместе с корпусом: угол между ним и нормалью не меняется,
    // поэтому середина дуги не вырождается и «вперёд» не прыгает на мировую ось
    if (!this._restoreLook(this._twBuf.copy(this._twLook).applyQuaternion(this._twQ2))) this._replanar();

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

  /** Не даёт выйти за пределы карты. `width` предполагает симметричные границы,
   *  а contrato карты даёт `bounds` (minX/maxX/minZ/maxZ) — для несимметричных
   *  окон (стрим главы 4, русский мост с 7 м за плиткой) `width/2` врёт. Y не
   *  клампим: опору hält `_updateGrounded` через raySolid, а `y < radius` сажал
   *  Чужого на виртуальный ноль над отрицательным дном (русло главы 13, пропасть
   *  главы 1) и не давал ему сойти на дно.
   */
  _clampWorld() {
    const cfg = this.cfg;
    const b = this.map.bounds;
    const limX = b.maxX - cfg.radius, limZ = b.maxZ - cfg.radius;
    if (this.pos.x > limX) this.pos.x = limX;
    else if (this.pos.x < b.minX + cfg.radius) this.pos.x = b.minX + cfg.radius;
    if (this.pos.z > limZ) this.pos.z = limZ;
    else if (this.pos.z < b.minZ + cfg.radius) this.pos.z = b.minZ + cfg.radius;
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

  dispose() {
    document.removeEventListener('pointerlockchange', this._onChange);
  }
}

/**
 * Играбельный Чужой. Надстраивает над AlienBody управление с клавиатуры/мыши и
 * камеру: взгляд поворачивается вокруг текущей нормали, а сама нормаль плавно
 * доворачивается под новую поверхность, поэтому при переходе «пол → стена →
 * потолок» картинку не переворачивает.
 *
 * ЛКМ — удар рукой в сторону взгляда (config.alien.strike): короткий, но основной
 * урон Чужого. Space — прыжок вперёд (config.alien.leap): долетит до врага —
 * заденет его слегка (leap.damage), но прыжок нужен для движения и лазания, а не
 * для боя.
 */
export class Alien extends AlienBody {
  /**
   * @param {THREE.Camera} camera
   * @param {HTMLElement} domElement
   * @param {import('./map.js').TownMap} map
   * @param {Function} getEnemies ленивый доступ к менеджеру врагов (для удара и прыжка)
   * @param {Function} [onHit] вызывается при попадании рукой (отметка на HUD)
   */
  constructor(camera, domElement, map, getEnemies, onHit) {
    super(map);
    this.camera = camera;
    this.controls = new PointerLock(domElement);
    this.getEnemies = getEnemies || (() => null);
    this._leapTargets = this.getEnemies;
    this.onHit = onHit || null;

    this.keys = new Set();

    this._look = new THREE.Vector3();
    this._camTarget = new THREE.Vector3();
    this._q = new THREE.Quaternion();

    // удар рукой: пауза между замахами и сам замах (0 — рука в покое)
    this.strikeCd = 0;
    this.strikeAnim = 0;
    this._spaceHeld = false;
    this._buildClaw();

    this._bindInput();
  }

  // Камера игрока — производная от тела, поэтому пока Чужой в кузове её место
  // занимает преследующая камера машины, а точкой тела остаётся кузов.
  get position() { return this.vehicle ? this.vehicle.pos : this.camera.position; }
  get isLocked() { return this.controls.isLocked; }

  lock() { this.controls.lock(); }
  unlock() { this.controls.unlock(); }

  _bindInput() {
    this._onKeyDown = e => {
      this.keys.add(e.code);
      if (e.code === 'Space') e.preventDefault();
    };
    this._onKeyUp = e => this.keys.delete(e.code);
    this._onBlur = () => this.keys.clear();
    this._onMouseMoveBind = e => this._onMouseMove(e);
    this._onMouseDown = e => {
      if (e.button !== 0 || !this.isLocked) return;
      this._strike();
    };
    addEventListener('keydown', this._onKeyDown);
    addEventListener('keyup', this._onKeyUp);
    addEventListener('blur', this._onBlur);
    addEventListener('mousemove', this._onMouseMoveBind);
    addEventListener('mousedown', this._onMouseDown);
  }

  /** Снимает слушатели и модель руки с камеры при выгрузке уровня. */
  dispose() {
    removeEventListener('keydown', this._onKeyDown);
    removeEventListener('keyup', this._onKeyUp);
    removeEventListener('blur', this._onBlur);
    removeEventListener('mousemove', this._onMouseMoveBind);
    removeEventListener('mousedown', this._onMouseDown);
    this.controls.dispose();
    this.camera.remove(this.claw);
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

  /**
   * Разворот после высадки: базовый `face` ставит тело, а камера Чужого —
   * производная от него, поэтому пересчитывается сразу. Иначе один кадр показал
   * бы улицу с позиции преследующей камеры машины.
   */
  face(dx, dz) {
    super.face(dx, dz);
    this._updateCamera();
  }

  /**
   * Camera игрока — производная от тела, поэтому после переноса мира её
   * пересчитываем сразу: иначе кадр, отданный на экран до следующего `update`,
   * показал бы улицу старого окна.
   */
  shift(dx, dz) {
    super.shift(dx, dz);
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

    // прыжок вперёд по краю нажатия Space: удержание не должно превращать
    // приземление в новый прыжок каждую секунду
    const space = keys.has('Space');
    if (space && !this._spaceHeld) this._leap();
    this._spaceHeld = space;
  }

  _postUpdate(dt) {
    if (this.strikeCd > 0) this.strikeCd = Math.max(0, this.strikeCd - dt);
    // край нажатия Space синхронизируется и в поездке: `update` в ней не зовёт
    // `_control`, и без этого удержанная в машине клавиша дала бы прыжок на первом
    // шаге после высадки
    this._spaceHeld = this.keys.has('Space');
    this._updateClaw(dt);
    this._updateCamera();
  }

  /**
   * Удар рукой по ЛКМ: короткий луч вдоль взгляда — до стены и до врага, поражаем
   * ближайший. Урон основной (config.alien.strike), после попадания — отметка на
   * HUD; замах показывается когтистой рукой в углу вида.
   * @returns {boolean} был ли удар (false — ещё не истекла пауза)
   */
  _strike() {
    // за рулём удара нет: лапа не выходит за кузов, а камера смотрит на машину,
    // поэтому луч вдоль взгляда бил бы по асфальту за кормой
    if (this.vehicle || this.strikeCd > 0) return false;
    const s = this.cfg.strike;
    this.strikeCd = s.cooldown;
    this.strikeAnim = s.animTime;
    beep(150, 0.05, 'sawtooth');

    this.camera.getWorldDirection(this._look);
    const cam = this.camera.position;
    const wall = this.map.rayHitDistance(cam.x, cam.y, cam.z, this._look.x, this._look.y, this._look.z, s.reach);
    const enemies = this.getEnemies();
    const hit = enemies?.raycast
      ? enemies.raycast(cam, this._look, Math.min(wall, s.reach))
      : null;
    if (hit) {
      hit.enemy.takeDamage(s.damage);
      if (this.onHit) this.onHit();
      setTimeout(() => beep(70, 0.1, 'square'), 40);
    }
    return true;
  }

  /** Когтистая рука в правом нижнем углу вида — показывает замах по ЛКМ. */
  _buildClaw() {
    const box = (w, h, d, x, y, z) => {
      const g = new THREE.BoxGeometry(w, h, d);
      g.translate(x, y, z);
      return g;
    };
    const mesh = new THREE.Mesh(
      mergeGeometries([
        box(0.09, 0.10, 0.42, 0, 0, 0.18),     // предплечье
        box(0.13, 0.12, 0.20, 0, 0, -0.08),    // ладонь
        box(0.03, 0.03, 0.24, -0.04, -0.02, -0.28), // когти
        box(0.03, 0.03, 0.26, 0, -0.03, -0.30),
        box(0.03, 0.03, 0.24, 0.04, -0.02, -0.28),
      ], false),
      new THREE.MeshStandardMaterial({ color: 0x241d28, roughness: 0.55 }),
    );
    mesh.castShadow = false;

    this.claw = new THREE.Group();
    this.claw.add(mesh);
    this._clawHome = new THREE.Vector3(0.28, -0.26, -0.44);
    this._clawPitch = 0.22;
    this.claw.position.copy(this._clawHome);
    this.claw.rotation.x = this._clawPitch;
    this.claw.visible = false;  // до первого удара рука в покое и не видна
    this.camera.add(this.claw);
  }

  /**
   * Замах: рука вылетает вперёд и возвращается за config.alien.strike.animTime.
   * Вне замаха её не видно вовсе — профиль `k` начинается и кончается нулём,
   * поэтому рука появляется и исчезает, лежа дома, без скачка в кадре.
   */
  _updateClaw(dt) {
    if (this.strikeAnim > 0) this.strikeAnim = Math.max(0, this.strikeAnim - dt);
    const T = this.cfg.strike.animTime;
    const k = Math.sin((1 - this.strikeAnim / T) * Math.PI);
    this.claw.position.set(
      this._clawHome.x,
      this._clawHome.y + k * 0.06,
      this._clawHome.z + k * 0.34,
    );
    this.claw.rotation.x = this._clawPitch - k * 1.15;
    this.claw.visible = this.strikeAnim > 0;
  }

  /** Собирает камеру: позиция — вдоль нормали от центра тела, взгляд — по fwd/pitch. */
  _updateCamera() {
    // в поездке камерой ведает `Cars.applyCamera`: поза вдоль нормали тела
    // дала бы вид из-под обшивки ровно поверх позы преследования
    if (this.vehicle) return;
    const cfg = this.cfg;
    const cos = Math.cos(this.pitch), sin = Math.sin(this.pitch);
    this._look.copy(this.fwd).multiplyScalar(cos).addScaledVector(this.up, sin).normalize();

    this.camera.position.copy(this.pos).addScaledVector(this.up, cfg.eyeOffset);
    this.camera.up.copy(this.up);
    this._camTarget.copy(this.camera.position).add(this._look);
    this.camera.lookAt(this._camTarget);
  }
}
