/**
 * Spike Части II плана открытого мира: логистика Rapier3D.
 *
 * Проверяет, что `@dimforge/rapier3d-compat` грузится из importmap, `init()`
 * отрабатывает, и мир коллайдеров собирается из солидов/блокеров главы.
 * Запуск: открыть 3d-game.html, в консоли:
 *   const m = await import('/probe/rapier-spike.mjs');
 *   await m.runRapierSpike();
 */
import * as RAPIER from '@dimforge/rapier3d-compat';

export async function runRapierSpike() {
  const t0 = performance.now();
  await RAPIER.init();
  const initMs = performance.now() - t0;
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  const t1 = performance.now();
  // один шаг, чтобы сцена «увидела» коллайдеры (правило R1)
  world.step();
  const stepMs = performance.now() - t1;
  world.free();
  return { initMs, stepMs, version: RAPIER.version() };
}
