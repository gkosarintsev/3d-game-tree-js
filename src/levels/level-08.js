/**
 * Глава 8 — «Высотки»: три башни, пасмурное небо, много Чужих-врагов.
 * Крыш много, вертикальные обходы — основной маршрут скачков Чужого.
 */
export const LEVEL_08 = {
  name: 'Глава 8. Высотки',
  hint: 'Финальная глава: соберите монеты на этажах и крышах башен.',
  map: {
    houses: [
      { cols: 20, rows: 18, floors: 8, offsetX: -95, offsetZ: 0 },
      { cols: 24, rows: 20, floors: 10, offsetX: 15, offsetZ: 10 },
      { cols: 18, rows: 16, floors: 7, offsetX: 120, offsetZ: -15 },
    ],
    ground: { size: 440, color: 0x5f7457 },
  },
  decor: {
    palms: 10,
    lampSpacing: 18,
    roofPropsPerBuilding: 6,
    seed: 0xd1ce55,
  },
  sky: {
    sky: 0x6a7688,
    fog: { color: 0x8894a6, near: 70, far: 380 },
    sun: { color: 0xdfe8ff, intensity: 1.3, position: [90, 180, 130] },
    hemi: { sky: 0x9fb0c8, ground: 0x2f3a44, intensity: 0.75 },
  },
  gameplay: {
    totalCoins: 16,
    minCoinDistance: 18,
    enemies: { count: 8 },
    alienEnemies: { count: 5 },
  },
};
