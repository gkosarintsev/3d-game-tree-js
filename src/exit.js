import * as THREE from 'three';

/**
 * Цель главы-перехода «из A в B»: светящийся маяк в точке B. Движок проверяет
 * достижение по расстоянию до игрока; слушателей маяк не вешает, поэтому dispose
 * убирает только меши из сцены.
 */
export class ExitGoal {
  /**
   * @param {THREE.Scene} scene
   * @param {object} map карта уровня (для опорной поверхности под маяком)
   * @param {{x:number, z:number}} pos точка B
   * @param {number} radius радиус достижения
   */
  constructor(scene, map, pos, radius) {
    this.map = map;
    // открытый мир отличается наличием помпы (`typeof`, как у остальных
    // опциональных членов контракта): обычным главам правило не видно вовсе
    this._streamed = typeof map.streamStep === 'function';
    // начальное состояние — тот же вопрос, что задаёт `update`: у главы из
    // реестра точка B лежит за окном спавна (замер главы 14: B в клетке `4_0`,
    // окно спавна собирает `0_3, 0_4, 1_3, 1_4`), и маяк, созданный видимым,
    // висел бы на «полу мира» незастроенной клетки весь интертитр — до первого
    // кадра игры, где `update` его наконец спрятал бы
    this.built = this._streamed ? map.isBuiltAt(pos.x, pos.z) : true;
    this.x = pos.x;
    this.z = pos.z;
    this.radius = radius;
    this.y = map.groundHeightAt(pos.x, pos.z, 500);

    this.group = new THREE.Group();
    this.pad = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius * 1.1, 0.2, 28),
      new THREE.MeshStandardMaterial({
        color: 0x2fd6c9, emissive: 0x1fb2a8, emissiveIntensity: 1.2, roughness: 0.4,
      }),
    );
    this.pad.position.set(this.x, this.y + 0.1, this.z);
    this.beam = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.45, radius * 0.8, 26, 20, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0x6fe8dd, transparent: true, opacity: 0.16,
        side: THREE.DoubleSide, depthWrite: false,
      }),
    );
    this.beam.position.set(this.x, this.y + 13, this.z);
    this.group.add(this.pad, this.beam);
    this.group.visible = this.built;
    scene.add(this.group);
  }

  /**
   * Пульсация маяка — чтобы цель была заметна издалека — и в открытом мире
   * отвечает тот же вопрос, что и `Cars.update`: стоит ли ещё точка B на
   * застроенной клетке.
   *
   * До её достройки у площадки нет опоры: `groundHeightAt` незастроенной клетки
   * отвечает «пол мира» (замер: 0 против 0,12 м у построенной, а по плите
   * худшее расхождение 10,54 м и 1,3 % точек выше допуска `reached` в 3 м), то
   * есть маяк висел бы под настилом, а цель засчитывалась по отметке, которой
   * в мире ещё нет. Поэтому не застроено — не видно и не достигается.
   */
  update(time) {
    if (this._streamed && typeof this.map.isBuiltAt === 'function') {
      const built = this.map.isBuiltAt(this.x, this.z);
      if (built !== this.built) {
        this.built = built;
        this.group.visible = built;
        // отметка берётся заново у своей опоры — прежняя взята с «пола мира»
        if (built) this.reseat();
      }
    }
    const p = 1 + Math.sin(time * 2.4) * 0.12;
    this.pad.scale.set(p, 1, p);
    this.beam.material.opacity = 0.1 + Math.max(0, Math.sin(time * 2.4)) * 0.09;
  }

  /**
   * Пересадка площадки на фактическую опору точки B (тот же проба-сверху, что и
   * в конструкторе) — вызывается на rising edge застроенности.
   */
  reseat() {
    this.y = this.map.groundHeightAt(this.x, this.z, 500);
    this.pad.position.y = this.y + 0.1;
    this.beam.position.y = this.y + 13;
  }

  /** Игрок внутри радиуса и на высоте площадки — глава пройдена. */
  reached(p) {
    if (!this.built) return false;
    return Math.hypot(p.x - this.x, p.z - this.z) < this.radius &&
      Math.abs(p.y - this.y) < 3;
  }

  /**
   * Перенос точки B вместе с миром: при перестановке активного окна главы 4
   * (src/stream-map.js) начало координат главы уходит на (dx, dz) метров файла,
   * и маяк обязан остаться над своей площадью, а не отстать от неё на 260 м.
   * Отметка площадки не пересчитывается: улица главы — одна плита макета, её
   * высота от окна не зависит.
   */
  shift(dx, dz) {
    this.x -= dx;
    this.z -= dz;
    for (const m of [this.pad, this.beam]) {
      m.position.x -= dx;
      m.position.z -= dz;
    }
  }

  dispose(scene) {
    scene.remove(this.group);
    this.pad.geometry.dispose();
    this.beam.geometry.dispose();
    this.pad.material.dispose();
    this.beam.material.dispose();
  }
}
