/**
 * Глава 3 — «Предгорье»: вторая заготовка главы-перехода A → B.
 * Пустой уровень с одной монетой: сбор проходит главу. Содержимое появится
 * вместе с маршрутами переходов.
 */
export const LEVEL_03 = {
  name: 'Глава 3. Предгорье',
  hint: 'Заготовка главы-перехода. Пока что достаточно собрать одну монету.',
  map: {
    houses: [
      { cols: 12, rows: 10, floors: 1, offsetX: 12, offsetZ: -8 },
    ],
    ground: { size: 140, color: 0x7f9462 },
  },
  decor: {
    palms: 0,
    lampSpacing: 900,
    roofPropsPerBuilding: 0,
    seed: 0x000003,
  },
  sky: {
    sky: 0xc0d9ea,
    fog: { color: 0xd6e4ee, near: 70, far: 340 },
    sun: { color: 0xfff0d8, intensity: 2.1, position: [-70, 150, 60] },
    hemi: { sky: 0xd0e2f2, ground: 0x5a6a44, intensity: 0.95 },
  },
  gameplay: {
    goal: 'coins',
    totalCoins: 1,
    minCoinDistance: 0,
    enemies: { count: 0 },
    alienEnemies: { count: 0 },
  },
};
