import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CONFIG } from './config.js';

/**
 * Автомобили уровня: низкополигональный кузов, аркадная поступь по контракту
 * карты и посадка/выход по клавише `F`.
 *
 * Движок знает о машине только то, что знает о любом теле: опору он спрашивает
 * у `map.groundHeightAt`, свободен ли путь — у `map.isBlocked`, пределами главы
 * служит `map.bounds`. Ни номера главы, ни секции `city`, ни полей схемы здесь
 * нет: число машин и точки стоянок приходят данными `gameplay.cars`, как монеты
 * приходят числом.
 *
 * Кузов **не** создаёт ни `solids`, ни `blockers` — по правилу о декоре твёрдость
 * уровня держат стены и настилы. Пуля проходит сквозь машину (сюжет
 * `tests/vehicle.test.js` фиксирует это свойством, а не дефектом): габарит врага
 * ровно в том же положении, и ни одно из тел не делает улицу непроходимой.
 */

const DEG = Math.PI / 180;

/**
 * Части кузова: одна деталь — один материал, поэтому машина — это шесть мешей, а
 * не пятьдесят. Геометрия строится один раз на модуль и переживает загрузку
 * следующей главы (тот же уговор, что у `src/props.js`), экземпляры различаются
 * только цветом кузова и положением.
 *
 * Модель смотрит носом вдоль локального `+X`, а её правый борт — вдоль `+Z`:
 * пластина настила в данных главы задаёт длину по той же оси, поэтому стояночный
 * `yaw` брифа переходит в `rotation.y = −yaw` без пересчёта осей, и `direction`
 * остаётся `(cos yaw, −sin yaw)` ровно как у повёрнутой коробки.
 */
const box = (w, h, d, x, y, z) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);

/** Кузов: нижняя и верхняя коробки дают ступеньку крыльев без лишних треугольников. */
function buildParts() {
  const c = CONFIG.car;
  const bodyY = c.clearance + 0.34;
  const cabinY = bodyY + 0.34 + 0.29;
  return [
    {
      mat: 'paint',
      geo: mergeGeometries([
        box(c.length, 0.68, c.width, 0, bodyY, 0),
        box(c.length * 0.44, 0.58, c.width * 0.86, -c.length * 0.04, cabinY, 0),
      ], false),
    },
    // остекление — пластины чуть наружу кузова: заподлицо они легли бы в одну
    // плоскость с краской и замигали в z-buffer (то же правило швов, что у перил)
    {
      mat: 'glass',
      geo: mergeGeometries([
        box(0.06, 0.42, c.width * 0.72, c.length * 0.16, cabinY, 0),
        box(0.06, 0.36, c.width * 0.66, -c.length * 0.235, cabinY, 0),
        box(c.length * 0.36, 0.06, 0.02, -c.length * 0.04, cabinY + 0.3, c.width * 0.43),
        box(c.length * 0.36, 0.06, 0.02, -c.length * 0.04, cabinY + 0.3, -c.width * 0.43),
      ], false),
    },
    {
      mat: 'lights',
      geo: mergeGeometries([
        box(0.05, 0.14, 0.34, c.length / 2 - 0.03, bodyY + 0.08, c.width * 0.3),
        box(0.05, 0.14, 0.34, c.length / 2 - 0.03, bodyY + 0.08, -c.width * 0.3),
      ], false),
    },
    {
      mat: 'tail',
      geo: mergeGeometries([
        box(0.05, 0.12, 0.3, -c.length / 2 + 0.03, bodyY + 0.1, c.width * 0.32),
        box(0.05, 0.12, 0.3, -c.length / 2 + 0.03, bodyY + 0.1, -c.width * 0.32),
      ], false),
    },
  ];
}

/** Колесо: ось вдоль `Z` (борта машины), поэтому катится оно вокруг `rotation.z`. */
function buildWheel() {
  const r = CONFIG.car.wheelRadius;
  return new THREE.CylinderGeometry(r, r, 0.24, 10).rotateX(Math.PI / 2);
}

/** Общие для всех машин; собираются при первой машине уровня. */
const SHARED = { parts: null, wheel: null };

/**
 * Материалы кузова красятся по `userData.baseColor` и пересобираются **из него**,
 * а не домножаются на текущий цвет — тот же уговор, что у материалов макета
 * главы 3: повторная сборка уровня не должна уводить оттенок.
 */
const PAINTED = new Map();
function paintMaterial(color) {
  let m = PAINTED.get(color);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.35 });
    m.userData.baseColor = color;
    PAINTED.set(color, m);
  }
  return m;
}

const PLAIN = {
  glass: () => new THREE.MeshStandardMaterial({ color: 0x1d2733, roughness: 0.15, metalness: 0.6 }),
  lights: () => new THREE.MeshStandardMaterial({
    color: 0xfff4d2, emissive: 0xffe9b0, emissiveIntensity: 0.8, roughness: 0.3,
  }),
  tail: () => new THREE.MeshStandardMaterial({
    color: 0x8a1d16, emissive: 0x6e120c, emissiveIntensity: 0.7, roughness: 0.4,
  }),
  rubber: () => new THREE.MeshStandardMaterial({ color: 0x1a1c20, roughness: 0.9 }),
};
const PLAIN_CACHE = new Map();
function plainMaterial(key) {
  let m = PLAIN_CACHE.get(key);
  if (!m) {
    m = PLAIN[key]();
    m.userData.baseColor = m.color.getHex();
    PLAIN_CACHE.set(key, m);
  }
  return m;
}

function sharedParts() {
  if (!SHARED.parts) SHARED.parts = buildParts();
  return SHARED.parts;
}

/**
 * Одна машина: `pos` — точка касания полотна под центром кузова, `yaw` — его
 * разворот (`rotation.y` группы), `speed` — поступь вдоль носа, со знаком реверса.
 * `rider` — кто ведёт (`Player` или `Alien`), `null` у стоящей.
 */
export class Car {
  /**
   * @param {object} map карта главы (только члены контракта)
   * @param {{x:number, z:number, yaw:number, y:number}} spot точка стоянки из
   *   `gameplay.cars`; `y` отдаёт парсер — отметку своей опоры под точкой
   * @param {number} index порядковый номер: по нему кузов красится из `CONFIG.car.colors`
   */
  constructor(map, spot, index) {
    this.map = map;
    const c = CONFIG.car;
    this.pos = new THREE.Vector3(spot.x, spot.y ?? 0, spot.z);
    this.yaw = -(spot.yaw ?? 0) * DEG;
    this.speed = 0;
    this.vertical = 0;
    this.pitch = 0;
    this.roll = 0;
    // `steer` — рука на руле (−1…1, влево положительно), `roadAngle` — угол
    // колёс, который из неё выходит с учётом остывания на скорости
    this.steer = 0;
    this.roadAngle = 0;
    this.spin = 0;
    this.rider = null;
    this.grounded = true;

    this._dir = new THREE.Vector3();

    this.group = new THREE.Group();
    // порядок «сначала разворот, потом наклон по осям кузова»: тангаж и крен
    // считаются в системе машины, а не мира
    this.group.rotation.order = 'YXZ';
    this.wheels = [];
    /** @type {THREE.Mesh[]} передние колёса: их доворачивает руль */
    this.frontWheels = [];
    const axle = c.wheelbase / 2, flank = c.width / 2 - 0.09;
    if (!SHARED.wheel) SHARED.wheel = buildWheel();
    for (const [x, z, isFront] of [[axle, flank, 1], [axle, -flank, 1], [-axle, flank, 0], [-axle, -flank, 0]]) {
      const wheel = new THREE.Mesh(SHARED.wheel, plainMaterial('rubber'));
      wheel.position.set(x, c.wheelRadius, z);
      wheel.castShadow = false;
      this.group.add(wheel);
      this.wheels.push(wheel);
      if (isFront) this.frontWheels.push(wheel);
    }
    const color = c.colors[index % c.colors.length];
    for (const part of sharedParts()) {
      const mesh = new THREE.Mesh(
        part.geo, part.mat === 'paint' ? paintMaterial(color) : plainMaterial(part.mat));
      mesh.castShadow = false;
      this.group.add(mesh);
    }
    this._sync();
  }

  /** Мировое направление носа (плоское, без тангажа). */
  get direction() {
    return this._dir.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
  }

  get feetY() { return this.pos.y; }

  /** Опора под точкой, отпущенной от центра кузова на `along` по носа и `side` по борту. */
  _support(along, side, fromY) {
    const d = this.direction;
    const y = this.map.groundHeightAt(
      this.pos.x + d.x * along - d.z * side,
      this.pos.z + d.z * along + d.x * side,
      fromY,
    );
    return isFinite(y) ? y : this.pos.y;
  }

  /**
   * Притяжение и опора под центром. Съезд с кромки настила — падение, а не
   * телепорт на грунт: `grounded` включает только касание, всё остальное время
   * кузов летит по своей вертикальной скорости.
   */
  _fall(dt) {
    const step = CONFIG.building.stepUp;
    const ground = this._support(0, 0, this.pos.y + step);
    if (this.pos.y <= ground + 1e-3 && this.vertical <= 0) {
      this.pos.y = ground;
      this.vertical = 0;
      this.grounded = true;
      return;
    }
    this.grounded = false;
    this.vertical -= CONFIG.gravity * dt;
    this.pos.y += this.vertical * dt;
    if (this.pos.y <= ground) {
      this.pos.y = ground;
      this.vertical = 0;
      this.grounded = true;
    }
  }

  /**
   * Наклон кузова: тангаж по осям колёс, крен по бортам.
   *
   * Оба меряются пробой опоры, а не картинкой настила, — и только на земле: в
   * полёте нос держит инерция, а не полотно, и наклонять его по асфальту под
   * ним значит рисовать машиной по воздуху ломаную.
   */
  _pose() {
    if (!this.grounded) return;
    const c = CONFIG.car;
    const fromY = this.pos.y + CONFIG.building.stepUp;
    const reach = c.wheelbase / 2;
    const rear = this._support(-reach, 0, fromY);
    const front = this._support(reach, 0, fromY);
    this.pitch = Math.atan2(front - rear, c.wheelbase);
    // крен меряется по колёсам, а не по центру: на подъёме проба борта в
    // середине кузова отвечала бы той же плоскостью, что и оси, и завала не дала
    const half = c.width / 2;
    const right = this._support(0, half, fromY);
    const left = this._support(0, -half, fromY);
    this.roll = Math.max(-0.25, Math.min(0.25, Math.atan2(right - left, c.width)));
  }

  /** Свободно ли место под кузовом в `(x, z)` с таким разворотом: пробы по осям и центру. */
  _bodyFree(x, z, yaw) {
    const c = CONFIG.car;
    const dx = Math.cos(yaw), dz = -Math.sin(yaw);
    const r = c.width / 2, reach = c.wheelbase / 2;
    for (const s of [-1, 0, 1]) {
      if (this.map.isBlocked(x + dx * reach * s, z + dz * reach * s, r, this.pos.y, c.height)) return false;
    }
    return true;
  }

  /**
   * Кадр поступти. Клавиши берутся у водителя: и у `Player`, и у `Alien` это один
   * и тот же `Set` кодов, поэтому машина не знает, кто в ней сидит.
   */
  drive(dt, keys) {
    const c = CONFIG.car;
    const throttle = (keys.has('KeyW') ? 1 : 0) - (keys.has('KeyS') ? 1 : 0);
    const wheel = (keys.has('KeyA') ? 1 : 0) - (keys.has('KeyD') ? 1 : 0);
    this.steer += (wheel - this.steer) * Math.min(1, dt * 8);

    if (throttle > 0) this.speed += c.accel * dt;
    else if (throttle < 0) {
      // `S` сначала тормозит, и только у нуля начинает крутить назад
      this.speed += (this.speed > 0.05 ? -c.brake : -c.reverse) * dt;
    } else if (Math.abs(this.speed) < c.drag * dt) this.speed = 0;
    else this.speed -= Math.sign(this.speed) * c.drag * dt;
    this.speed = Math.max(-c.maxReverse, Math.min(c.maxSpeed, this.speed));

    // Руль — bicycle-модель: скорость поворота есть `v · tan(δ) / база`, поэтому
    // она сама гаснет на месте и меняет знак на заднем ходу. Угол δ остывает со
    // скоростью (`steerFade`), иначе на `maxSpeed` радиус поворота вышел бы
    // меньше ширины полосы и машина завертелась юлой.
    const fade = 1 - c.steerFade * Math.min(1, Math.abs(this.speed) / c.maxSpeed);
    this.roadAngle = this.steer * fade * c.steerMax;
    this.yaw += (this.speed / c.wheelbase) * Math.tan(this.roadAngle) * dt;
    this.spin += (this.speed / c.wheelRadius) * dt;

    // шаг по осям с раздельным разрешением коллизий — та же схема, что у `Player`:
    // кузов обязан скользить вдоль фасада, а не залипать в нём
    const d = this.direction;
    const nx = this.pos.x + d.x * this.speed * dt;
    const nz = this.pos.z + d.z * this.speed * dt;
    if (!this._bodyFree(nx, this.pos.z, this.yaw)) this.speed = 0;
    else this.pos.x = nx;
    if (!this._bodyFree(this.pos.x, nz, this.yaw)) this.speed = 0;
    else this.pos.z = nz;

    this._clamp();
    this._fall(dt);
    this._pose();
    this._sync();
  }

  /** Кадр стоящей машины: рука отпускает руль, кузов стоит на своей опоре. */
  idle(dt) {
    this.steer += (0 - this.steer) * Math.min(1, dt * 8);
    this.roadAngle = this.steer * CONFIG.car.steerMax;
    this._fall(dt);
    this._pose();
    this._sync();
  }

  /** Кузов не смеет уехать за край мира: за `bounds` опоры нет вовсе. */
  _clamp() {
    const b = this.map.bounds;
    const r = CONFIG.car.width / 2;
    this.pos.x = Math.max(b.minX + r, Math.min(b.maxX - r, this.pos.x));
    this.pos.z = Math.max(b.minZ + r, Math.min(b.maxZ - r, this.pos.z));
  }

  /** Перенос расчётной позы в меши. */
  _sync() {
    this.group.position.copy(this.pos);
    this.group.rotation.set(-this.roll, this.yaw, this.pitch);
    for (const wheel of this.wheels) wheel.rotation.z = this.spin;
    for (const wheel of this.frontWheels) wheel.rotation.y = this.roadAngle;
  }

  /**
   * Точка, куда встаёт водитель при выходе: сбоку от кузова, где свободно.
   * Отметку отдаёт пол кузова, а не ноль: `spawnAt` ищет опору **не выше**
   * переданной точки, и с подъёма петли человек без неё слезал бы на грунт под
   * настилом, а не на сам настил. Радиальный зазор — по телу водителя: сфера
   * Чужого крупнее человеческой, и точка, свободная для человека, втиснула бы
   * его в перила, откуда `resolveSphere` тут же вытолкнула бы его в кузов.
   */
  _exitPoint(rider) {
    const c = CONFIG.car;
    const d = this.direction;
    const r = rider?.cfg?.radius ?? CONFIG.radius;
    const off = c.width / 2 + r + 0.15;
    for (const side of [1, -1]) {
      const x = this.pos.x - d.z * off * side;
      const z = this.pos.z + d.x * off * side;
      if (!this.map.isBlocked(x, z, r, this.pos.y, CONFIG.eyeHeight + 0.35)) {
        return { x, z, y: this.pos.y };
      }
    }
    // между перилами кольца места нет ни с одной стороны: сажаем водителя в
    // центр кузова — граней у машины нет, а настил под ним держит его ноги
    return { x: this.pos.x, z: this.pos.z, y: this.pos.y };
  }

  /** Посадка: водитель получает машину, машина — водителя. */
  enter(rider) {
    this.rider = rider;
    this.speed = 0;
    rider.vehicle = this;
  }

  /**
   * Высадка: водителя ставят на опору сбоку от кузова лицом вдоль его оси.
   * `face` у человека и Чужого разная (камера против `fwd`), поэтому поворот
   * делает сам водитель, а машина отдаёт только точку и направление.
   */
  exit() {
    const rider = this.rider;
    if (!rider) return;
    this.rider = null;
    rider.vehicle = null;
    this.speed = 0;
    const point = this._exitPoint(rider);
    rider.spawnAt(point);
    const d = this.direction;
    rider.face(d.x, d.z);
  }

  /**
   * Перенос вместе с миром (перестановка активного окна главы 4): кузов обязан
   * остаться на своей точке полотна, а не отстать от него на размер окна.
   */
  shift(dx, dz) {
    this.pos.x -= dx;
    this.pos.z -= dz;
    this._sync();
  }

  /** Снимает меш сцены; общие геометрии и материалы остаются на следующую главу. */
  dispose(scene) {
    scene.remove(this.group);
  }
}

/**
 * Менеджер машин уровня — зеркало `Coins` и `Enemies`: их число и точки приходят
 * данными главы, он расставляет кузова, ведёт поступь того, кто за рулём, и
 * отдаёт список миникарте.
 */
export class Cars {
  /**
   * @param {THREE.Scene} scene
   * @param {object} map карта главы
   * @param {{count?:number, spots?:Array<object>}} [data] секция `gameplay.cars`.
   *   Без неё машин нет: главы 9–12 обязаны ехать как ездили, а `CONFIG.car.count`
   *   держит ноль именно поэтому.
   */
  constructor(scene, map, data = {}) {
    this.scene = scene;
    this.map = map;
    this.items = [];
    this.driven = null;
    const spots = data.spots ?? [];
    const count = Math.min(data.count ?? CONFIG.car.count, spots.length);
    for (let i = 0; i < count; i++) {
      const car = new Car(map, spots[i], i);
      scene.add(car.group);
      this.items.push(car);
    }
  }

  get count() { return this.items.length; }

  /**
   * Ближайшая свободная машина в радиусе `CONFIG.car.enterRadius` от точки
   * кузова — с расстоянием, по которому HUD решает, показывать ли подсказку.
   */
  nearest(pos) {
    let best = null, bestDist = Infinity;
    for (const car of this.items) {
      if (car.rider) continue;
      const d = Math.hypot(car.pos.x - pos.x, car.pos.z - pos.z);
      if (d < bestDist) { best = car; bestDist = d; }
    }
    return best && bestDist <= CONFIG.car.enterRadius ? { car: best, distance: bestDist } : null;
  }

  /** Посадка водителя: машина ведётся, человек внутри неё. */
  enter(car, rider) {
    car.enter(rider);
    this.driven = car;
  }

  /** Высадка того, кто ведёт (если ведёт). */
  exit() {
    if (!this.driven) return false;
    this.driven.exit();
    this.driven = null;
    return true;
  }

  update(dt) {
    for (const car of this.items) {
      if (car === this.driven && car.rider) car.drive(dt, car.rider.keys);
      else car.idle(dt);
    }
  }

  /**
   * Жёсткая преследующая камера: точка за кормой и над ней, взгляд — в середину
   * кузова. Мышь её не трогает, поэтому кадру достаточно этой позы.
   *
   * Подъём над собственной опорой обязателен: у машины в начале подъёма полотно
   * за кормой выше носа, и без него камера оказывалась внутри настила — кадр
   * чёрный, а не «видно мало».
   */
  applyCamera(camera) {
    const car = this.driven;
    if (!car) return;
    const cam = CONFIG.car.camera;
    const d = car.direction;
    const x = car.pos.x - d.x * cam.back;
    const z = car.pos.z - d.z * cam.back;
    const support = this.map.groundHeightAt(x, z, car.pos.y + cam.up);
    camera.position.set(
      x,
      Math.max(car.pos.y + cam.up, (isFinite(support) ? support : car.pos.y) + cam.minClearance),
      z,
    );
    camera.up.set(0, 1, 0);
    camera.lookAt(car.pos.x, car.pos.y + cam.look, car.pos.z);
  }

  /** Сдвиг мира под стримингом (глава 4): кузова переносятся вместе с улицей. */
  shiftWorld(dx, dz) {
    for (const car of this.items) car.shift(dx, dz);
  }

  /** Машины уровня — для миникарты. */
  forEachVisible(fn) {
    for (const car of this.items) fn(car.pos, car.yaw);
  }

  dispose() {
    for (const car of this.items) car.dispose(this.scene);
    this.items.length = 0;
    this.driven = null;
  }
}
