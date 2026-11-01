/**
 * Глава 4 — «Первый дом»: один дом посреди улицы, мало врагов и монет.
 * Первая «уличная» глава после трёх глав-переходов по рельефу.
 */
export const LEVEL_04 = {
  name: 'Глава 4. Первый дом',
  hint: 'Один дом, четыре монеты. Разберитесь с управлением на улице.',
  map: {
    houses: [
      { cols: 14, rows: 12, floors: 3, offsetX: 0, offsetZ: 0 },
    ],
    ground: { size: 160, color: 0x74a04e },
  },
  decor: {
    palms: 8,
    lampSpacing: 18,
    roofPropsPerBuilding: 3,
    seed: 0x000001,
  },
  sky: {
    sky: 0xb8dcf7,
    fog: { color: 0xdff0ff, near: 60, far: 300 },
    sun: { color: 0xfff4e0, intensity: 2.4, position: [90, 140, -70] },
    hemi: { sky: 0xbfe3ff, ground: 0x4a6b33, intensity: 1.0 },
  },
  gameplay: {
    totalCoins: 4,
    minCoinDistance: 8,
    enemies: { count: 2 },
    alienEnemies: { count: 1 },
  },
};
