import * as THREE from 'three';
import { CONFIG } from './config.js';

/**
 * Ночной свет уровня: пул огней, который держат рядом с игроком.
 *
 * Ночь в главе делает направленным светом («луна» из `sky.sun`) и точечными
 * огнями улицы. Настоящих источников не может быть по одному на фонарь: у
 * каждого — свой множитель в каждый фрагмент, а район главы 3 — 51 тыс. граней.
 * Поэтому здесь фиксированное число `count` огней, которые переставляются на
 * ближайшие к камере опорные точки (`map.openPositions()` — только члены
 * контракта карты, см. AGENTS.md), а вдоль дорог стоит сколько угодно ламп.
 *
 * Слушателей модуль не вешает, но в сцену добавляет — `dispose()` обязателен,
 * как и у остальных сущностей жизненного цикла уровня.
 */
export class NightLights {
  /**
   * @param {THREE.Scene} scene сцена главы
   * @param {Array<{x:number,y:number,z:number}>} anchors опорные точки улицы
   * @param {object} [opts] переопределение CONFIG.night из `sky.lights` главы
   */
  constructor(scene, anchors, opts = {}) {
    const c = { ...CONFIG.night, ...opts };
    this.cfg = c;
    this.scene = scene;
    // огней не может быть больше, чем мест, куда их ставить
    this.count = Math.min(c.count, anchors.length);
    this.lights = [];
    this.bulbs = [];

    this._bulbGeo = new THREE.SphereGeometry(c.bulb, 10, 6);
    this._bulbMat = new THREE.MeshBasicMaterial({ color: c.color });

    for (let i = 0; i < this.count; i++) {
      // тени у пула выключены: теневая карта на каждый из огней — это ещё по
      // одному проходу по всей сцене за кадр, а ночь делает свет, а не тень
      const light = new THREE.PointLight(c.color, c.intensity, c.reach, c.decay);
      light.castShadow = false;
      const bulb = new THREE.Mesh(this._bulbGeo, this._bulbMat);
      scene.add(light);
      scene.add(bulb);
      this.lights.push(light);
      this.bulbs.push(bulb);
    }

    this._anchors = anchors;
    this._order = anchors.map((_, i) => i);
    this._at = null;
    if (this.count > 0) this._place(anchors[0]);
  }

  /**
   * Ставит пул к точке `pos`, если игрок ушёл достаточно далеко. Перестановка
   * стоит сортировку опорных точек (на районе их ~8,7 тыс.), поэтому она
   * привязана к расстоянию, а не к кадру: пока идёшь по одному кварталу, огни
   * стоят.
   */
  update(pos) {
    if (this.count === 0) return;
    if (this._at !== null) {
      const moved = Math.hypot(pos.x - this._at.x, pos.z - this._at.z);
      if (moved < this.cfg.reprobe) return;
    }
    this._place(pos);
  }

  /** Ближайшие опорные точки с разнесением не меньше `spacing`. */
  _place(pos) {
    const a = this._anchors;
    const d2 = new Float64Array(a.length);
    for (let i = 0; i < a.length; i++) {
      const dx = a[i].x - pos.x, dz = a[i].z - pos.z;
      d2[i] = dx * dx + dz * dz;
    }
    this._order.sort((i, j) => d2[i] - d2[j]);

    const min2 = this.cfg.spacing * this.cfg.spacing;
    const picked = [];
    for (const i of this._order) {
      if (picked.length >= this.count) break;
      let far = true;
      for (const k of picked) {
        const dx = a[i].x - a[k].x, dz = a[i].z - a[k].z;
        if (dx * dx + dz * dz < min2) { far = false; break; }
      }
      if (far) picked.push(i);
    }

    for (let n = 0; n < this.count; n++) {
      const p = a[picked[n] ?? picked[picked.length - 1]];
      const y = p.y + this.cfg.height;
      this.lights[n].position.set(p.x, y, p.z);
      this.bulbs[n].position.set(p.x, y, p.z);
    }
    this._at = { x: pos.x, z: pos.z };
  }

  /**
   * Новые опоры после перестановки активного окна (глава 4, src/stream-map.js):
   * огни и материалы остаются те же — меняется только список точек улицы, на
   * которые они ставятся. Метку последней перестановки сбрасываем, чтобы пул
   * встал заново на ближайшем же кадре: старые опоры вместе со старым окном
   * больше не существуют.
   */
  setAnchors(anchors) {
    this._anchors = anchors;
    this._order = anchors.map((_, i) => i);
    this._at = null;
  }

  dispose() {
    for (const l of this.lights) this.scene.remove(l);
    for (const b of this.bulbs) this.scene.remove(b);
    this._bulbGeo.dispose();
    this._bulbMat.dispose();
    this.lights = [];
    this.bulbs = [];
    this.count = 0;
    this.scene = null;
  }
}
