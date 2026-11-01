/**
 * Глава 2 — «Окраина»: пять домов в ряд, дневной свет, знакомая улица.
 *
 * Уровень — чистые данные (см. AGENTS.md): поле map идёт в createTownMap,
 * sky — в освещение сцены, gameplay — в монеты и число врагов. Любое поле
 * необязательно: недостающее берётся из config.js.
 */
export const LEVEL_02 = {
  name: 'Глава 2. Окраина',
  hint: 'Соберите все монеты, чтобы пройти главу.',
  map: {
    houses: [
      { cols: 18, rows: 16, floors: 5, offsetX: -150, offsetZ: 0 },
      { cols: 16, rows: 14, floors: 4, offsetX: -72, offsetZ: 0 },
      { cols: 22, rows: 18, floors: 6, offsetX: 0, offsetZ: 0 },
      { cols: 16, rows: 14, floors: 4, offsetX: 72, offsetZ: 0 },
      { cols: 18, rows: 15, floors: 5, offsetX: 150, offsetZ: 0 },
    ],
    ground: { size: 400, color: 0x6f9f4a },
  },
  decor: {
    palms: 22,
    lampSpacing: 28,
    roofPropsPerBuilding: 4,
    seed: 0xc0ffee,
  },
  sky: {
    sky: 0xa9d4f5,
    fog: { color: 0xd6e9ff, near: 120, far: 460 },
    sun: { color: 0xfff4e0, intensity: 2.4, position: [150, 200, -110] },
    hemi: { sky: 0xbfe3ff, ground: 0x4a6b33, intensity: 1.0 },
  },
  gameplay: {
    totalCoins: 10,
    enemies: { count: 5 },
    alienEnemies: { count: 2 },
  },
};
