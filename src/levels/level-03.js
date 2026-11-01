/**
 * Глава 3 — «Квартал на закате»: дома вразнобой, низкое солнце, пальм больше.
 * Врагов заметно больше, чем в предыдущей главе.
 */
export const LEVEL_03 = {
  name: 'Глава 3. Квартал на закате',
  hint: 'Солнце садится — монеты всё так же решают.',
  map: {
    houses: [
      { cols: 20, rows: 18, floors: 5, offsetX: -105, offsetZ: -20 },
      { cols: 18, rows: 16, floors: 7, offsetX: -30, offsetZ: 25 },
      { cols: 16, rows: 14, floors: 4, offsetX: 50, offsetZ: -25 },
      { cols: 22, rows: 16, floors: 6, offsetX: 135, offsetZ: 15 },
    ],
    ground: { size: 480, color: 0x7c8b4f },
  },
  decor: {
    palms: 30,
    lampSpacing: 22,
    roofPropsPerBuilding: 5,
    seed: 0xbeef01,
  },
  sky: {
    sky: 0xf2b98a,
    fog: { color: 0xf7cda0, near: 90, far: 420 },
    sun: { color: 0xffc185, intensity: 2.0, position: [-160, 90, 140] },
    hemi: { sky: 0xffd9b0, ground: 0x4f3b28, intensity: 0.9 },
  },
  gameplay: {
    totalCoins: 14,
    minCoinDistance: 16,
    enemies: { count: 7 },
    alienEnemies: { count: 3 },
  },
};
