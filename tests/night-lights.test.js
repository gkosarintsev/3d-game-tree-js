/**
 * Автотесты ночного света главы (src/night-lights.js).
 *
 * Пул огней — единственные настоящие источники света на улице: их число
 * ограничено, а стоят они там, где смотрит игрок. Тестируется ровно то, из-за
 * чего такой пул иначе перестал бы работать: число огней, что каждый стоит на
 * своей опоре и поднят на высоту фонаря, разнесение огней (иначе шесть
 * источников сливаются в одно пятно в центре), перестановка только после
 * шага дальше `reprobe` и снятие всех источников сцены при `dispose()`.
 *
 * Запуск в браузере (через консоль страницы игры, где есть importmap):
 *   const m = await import('/tests/night-lights.test.js?v=1');
 *   m.runNightLightsTests();
 *
 * Проверяются сценарии:
 *   1. Огней ровно `count`, все на опорах и подняты на `height`;
 *   2. Расстояние между огнями не меньше `spacing`;
 *   3. Шаг в пределах `reprobe` пул не переставляет, большой шаг — переставляет
 *      к новой точке;
 *   4. Опор меньше, чем огней: пул ограничивается опорами;
 *   5. `dispose()` не оставляет в сцене ни одного источника и ни одной лампы;
 *   6. Пустой список опор — пул создаётся, update() не падает.
 */
import * as THREE from 'three';
import { NightLights } from '../src/night-lights.js';
import { CONFIG } from '../src/config.js';
import { parseLevelFilter, SKIPPED } from './level-filter.js';

/** Опорная сетка улиц: узлы через `step` метров на плоскости y = 0. */
function gridAnchors(step, n, y = 0) {
  const out = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      out.push({ x: (i - (n - 1) / 2) * step, y, z: (j - (n - 1) / 2) * step });
    }
  }
  return out;
}

const OPTS = { count: 5, reach: 40, height: 6, spacing: 18, intensity: 60, reprobe: 14, bulb: 0.7 };

function lightsIn(scene) {
  return scene.children.filter(o => o.isLight).length;
}

function bulbsIn(scene) {
  return scene.children.filter(o => o.isMesh).length;
}

function testPlacedOnSupports() {
  const scene = new THREE.Scene();
  const nl = new NightLights(scene, gridAnchors(6, 20), OPTS);
  const ok = nl.count === OPTS.count && lightsIn(scene) === OPTS.count && bulbsIn(scene) === OPTS.count;
  const heights = nl.lights.map(l => +l.position.y.toFixed(2));
  const inScene = `${lightsIn(scene)}+${bulbsIn(scene)}`;
  const onSupport = nl.lights.every((l, i) => Math.abs(l.position.y - (nl.bulbs[i].position.y)) < 1e-6);
  nl.dispose();
  const passed = ok && onSupport && heights.every(h => Math.abs(h - OPTS.height) < 1e-6);
  return {
    name: 'Огней ровно count, каждый на своей опоре и поднят на height',
    passed,
    info: `огней ${OPTS.count}, в сцене источников+ламп ${inScene}, лампы на тех же опорах: ${onSupport}, высоты ${heights.join('/')}`,
  };
}

function testSpacing() {
  const scene = new THREE.Scene();
  const nl = new NightLights(scene, gridAnchors(6, 20), OPTS);
  let min = Infinity;
  for (let i = 0; i < nl.lights.length; i++) {
    for (let j = i + 1; j < nl.lights.length; j++) {
      min = Math.min(min, nl.lights[i].position.distanceTo(nl.lights[j].position));
    }
  }
  nl.dispose();
  const passed = min >= OPTS.spacing - 1e-6;
  return {
    name: 'Огни пула разнесены не ближе spacing',
    passed,
    info: `ближайшая пара в ${min.toFixed(1)} м (порог ${OPTS.spacing} м)`,
  };
}

function testFollowsPlayer() {
  const scene = new THREE.Scene();
  const nl = new NightLights(scene, gridAnchors(6, 40), OPTS);
  nl.update({ x: 0, y: 0, z: 0 });
  const near = nl.lights.map(l => l.position.clone());
  // шаг меньше reprobe — пул стоит на месте
  nl.update({ x: OPTS.reprobe - 4, y: 0, z: 0 });
  const held = nl.lights.every((l, i) => l.position.distanceToSquared(near[i]) < 1e-9);
  // дальний шаг — переставился к новой точке
  nl.update({ x: 90, y: 0, z: 90 });
  const moved = nl.lights.map(l => l.position.clone());
  const changed = moved.some((p, i) => p.distanceToSquared(near[i]) > 1);
  const closest = Math.max(...moved.map(p => Math.hypot(p.x - 90, p.z - 90)));
  nl.dispose();
  const passed = held && changed && closest < 40;
  return {
    name: 'Короткий шаг пул не переставляет, дальний — переставляет к игроку',
    passed,
    info: `шаг ${OPTS.reprobe - 4} м: стоит=${held}; шаг в (90, 90): сдвинулся=${changed}, самый дальний огонь в ${closest.toFixed(1)} м`,
  };
}

function testFewAnchors() {
  const scene = new THREE.Scene();
  const anchors = [{ x: 1, y: 0, z: 2 }, { x: 5, y: 0, z: 2 }];
  const nl = new NightLights(scene, anchors, OPTS);
  const placed = nl.lights.every(l => anchors.some(a => Math.abs(l.position.x - a.x) < 1e-6 && Math.abs(l.position.z - a.z) < 1e-6));
  const lights = lightsIn(scene);
  const count = nl.count;
  nl.dispose();
  const passed = count === anchors.length && lights === anchors.length && placed;
  return {
    name: 'Опор меньше, чем огней: пул ограничивается опорами',
    passed,
    info: `опор ${anchors.length}, огней ${count}, источников в сцене ${lights}, все на опорах=${placed}`,
  };
}

function testDispose() {
  const scene = new THREE.Scene();
  const nl = new NightLights(scene, gridAnchors(6, 20), OPTS);
  const before = `${lightsIn(scene)}+${bulbsIn(scene)}`;
  nl.dispose();
  const passed = lightsIn(scene) === 0 && bulbsIn(scene) === 0 && nl.lights.length === 0;
  return {
    name: 'dispose() снимает с scene все огни и все лампы',
    passed,
    info: `до ${before}, после ${lightsIn(scene)}+${bulbsIn(scene)}`,
  };
}

function testEmptyAnchors() {
  const scene = new THREE.Scene();
  let threw = null;
  try {
    const nl = new NightLights(scene, [], OPTS);
    nl.update({ x: 3, y: 0, z: 3 });
    nl.dispose();
  } catch (e) { threw = e.message; }
  const passed = threw === null && lightsIn(scene) === 0;
  return {
    name: 'Пустой список опор: пул пуст, update() и dispose() не падают',
    passed,
    info: threw ? `ошибка: ${threw}` : `источников в сцене ${lightsIn(scene)}`,
  };
}

function testDefaultsComeFromConfig() {
  const scene = new THREE.Scene();
  const nl = new NightLights(scene, gridAnchors(6, 20), {});
  const c = CONFIG.night;
  const first = nl.lights[0];
  const passed = nl.lights.length === Math.min(c.count, 400)
    && first.distance === c.reach
    && first.intensity === c.intensity
    && first.decay === c.decay
    && first.color.getHex() === c.color;
  const info = `огней ${nl.lights.length}, дальность ${first.distance}, сила ${first.intensity}, затухание ${first.decay}`;
  nl.dispose();
  return { name: 'Без переопределения числа берутся из CONFIG.night', passed, info };
}

/**
 * Прогоняет все тесты ночного света и печатает отчёт в консоль.
 * @returns {{passed:number, total:number, results:Array<{name:string,passed:boolean,info:string}>}}
 */
export function runNightLightsTests(arg) {
  const filter = parseLevelFilter(arg);
  if (filter) return SKIPPED;
  const tests = [
    testPlacedOnSupports, testSpacing, testFollowsPlayer, testFewAnchors,
    testDispose, testEmptyAnchors, testDefaultsComeFromConfig,
  ];
  const results = tests.map(fn => {
    try { return fn(); }
    catch (e) { return { name: fn.name, passed: false, info: `ошибка: ${e && e.message}` }; }
  });
  const passed = results.filter(r => r.passed).length;

  if (typeof console !== 'undefined') {
    console.group('Автотесты ночного света');
    for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'} — ${r.name}: ${r.info}`);
    console.log(`Итого: ${passed}/${results.length}`);
    console.groupEnd();
  }
  return { passed, total: results.length, results };
}
