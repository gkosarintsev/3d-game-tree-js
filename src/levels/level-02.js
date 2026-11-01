/**
 * Глава 2 — «Пустошь»: заготовка главы-перехода A → B.
 * Пока уровень пустой: один крохотный дом и одна монета — её сбор проходит
 * главу. Начинка (рельеф переходов) появится вместе с механикой выхода.
 */
export const LEVEL_02 = {
  name: 'Глава 2. Пустошь',
  hint: 'Заготовка главы-перехода. Пока что достаточно собрать одну монету.',
  map: {
    houses: [
      { cols: 12, rows: 10, floors: 1, offsetX: 0, offsetZ: 0 },
    ],
    ground: { size: 120, color: 0x8a9b6b },
  },
  decor: {
    palms: 0,
    lampSpacing: 900,
    roofPropsPerBuilding: 0,
    seed: 0x000002,
  },
  sky: {
    sky: 0xc6dff2,
    fog: { color: 0xdce9f4, near: 70, far: 320 },
    sun: { color: 0xfff4e0, intensity: 2.2, position: [80, 130, -60] },
    hemi: { sky: 0xcfe3f7, ground: 0x55663d, intensity: 0.95 },
  },
  gameplay: {
    goal: 'coins',
    totalCoins: 1,
    minCoinDistance: 0,
    enemies: { count: 0 },
    alienEnemies: { count: 0 },
  },
};
