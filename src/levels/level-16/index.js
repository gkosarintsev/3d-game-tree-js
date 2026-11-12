/**
 * СГЕНЕРИРОВАННО — руками не править.
 *
 * Источник правки: src/levels/level-16.json. После его изменения запуск
 * `node tools/build-level.mjs src/levels/level-16.json` перезаписывает этот файл и все
 * бинарные файлы каталога побайтово одинаково (ГПСЧ в разрезке нет, ключи и
 * объекты отсортированы).
 *
 * Открытая глава: геометрии здесь нет. Мир лежит по клеткам `cells[]`, у каждой
 * — прямоугольник в мировых осях и свой файл `chunk-<i>-<j>.l14b` с данными
 * `JsonMap` в бинарном кодеке (src/level-bin.js) в тех же мировых осях. Скелет
 * — глобальная сеть улиц/русов/дверей — лежит в `skeleton.l14b` плоскими
 * typed arrays и догружается top-level await; в браузере и в Node один и тот же
 * модуль, поэтому загрузка идёт через `fetch` относительного URL с откатом на
 * `node:fs` под Node.
 *
 * Файлы клеток берёт `WorldMap.chunkUrl` из `catalog` — браузерного пути
 * каталога от корня сайта.
 */
import { decodeSkeleton } from '../../level-bin.js';

async function loadSkel() {
  const url = new URL('./skeleton.l14b', import.meta.url);
  if (typeof process !== 'undefined' && process.versions?.node) {
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    return readFileSync(fileURLToPath(url));
  }
  const r = await fetch(url);
  if (!r.ok) throw new Error(url + ': ' + r.status);
  return new Uint8Array(await r.arrayBuffer());
}

export const LEVEL_16 = {
  "gameplay": {
    "alienEnemies": {
      "count": 0
    },
    "cars": {
      "count": 1,
      "spots": [
        {
          "x": -560,
          "y": 0.12,
          "yaw": 90,
          "z": -520
        }
      ]
    },
    "enemies": {
      "count": 6
    },
    "exit": {
      "x": 520,
      "z": 520
    },
    "exitRadius": 4,
    "goal": "exit"
  },
  "hint": "Доберитесь до маяка, пересекая районы сгенерированного города.",
  "map": {
    "bounds": {
      "maxX": 640,
      "maxZ": 640,
      "minX": -640,
      "minZ": -640
    },
    "catalog": "/src/levels/level-16",
    "cells": [
      {
        "file": "chunk-0-0.l14b",
        "id": "0_0",
        "objects": {
          "buildings": 29,
          "lights": 1,
          "props": 18,
          "roads": 13
        },
        "rect": {
          "maxX": -384,
          "maxZ": -384,
          "minX": -640,
          "minZ": -640
        }
      },
      {
        "file": "chunk-0-1.l14b",
        "id": "0_1",
        "objects": {
          "buildings": 17,
          "props": 7,
          "roads": 1
        },
        "rect": {
          "maxX": -384,
          "maxZ": -128,
          "minX": -640,
          "minZ": -384
        }
      },
      {
        "file": "chunk-0-2.l14b",
        "id": "0_2",
        "objects": {
          "buildings": 8,
          "props": 6,
          "roads": 1
        },
        "rect": {
          "maxX": -384,
          "maxZ": 128,
          "minX": -640,
          "minZ": -128
        }
      },
      {
        "file": "chunk-0-3.l14b",
        "id": "0_3",
        "objects": {
          "buildings": 9,
          "props": 4,
          "roads": 1
        },
        "rect": {
          "maxX": -384,
          "maxZ": 384,
          "minX": -640,
          "minZ": 128
        }
      },
      {
        "file": "chunk-0-4.l14b",
        "id": "0_4",
        "objects": {
          "buildings": 8,
          "props": 5,
          "roads": 1
        },
        "rect": {
          "maxX": -384,
          "maxZ": 640,
          "minX": -640,
          "minZ": 384
        }
      },
      {
        "file": "chunk-1-0.l14b",
        "id": "1_0",
        "objects": {
          "buildings": 5,
          "props": 12,
          "roads": 4
        },
        "rect": {
          "maxX": -128,
          "maxZ": -384,
          "minX": -384,
          "minZ": -640
        }
      },
      {
        "file": "chunk-1-1.l14b",
        "id": "1_1",
        "objects": {
          "lights": 1,
          "props": 10,
          "roads": 9
        },
        "rect": {
          "maxX": -128,
          "maxZ": -128,
          "minX": -384,
          "minZ": -384
        }
      },
      {
        "file": "chunk-1-2.l14b",
        "id": "1_2",
        "objects": {
          "props": 7,
          "roads": 3
        },
        "rect": {
          "maxX": -128,
          "maxZ": 128,
          "minX": -384,
          "minZ": -128
        }
      },
      {
        "file": "chunk-1-3.l14b",
        "id": "1_3",
        "objects": {
          "buildings": 1,
          "props": 9,
          "roads": 7
        },
        "rect": {
          "maxX": -128,
          "maxZ": 384,
          "minX": -384,
          "minZ": 128
        }
      },
      {
        "file": "chunk-1-4.l14b",
        "id": "1_4",
        "objects": {
          "buildings": 23,
          "lights": 1,
          "props": 14,
          "roads": 4
        },
        "rect": {
          "maxX": -128,
          "maxZ": 640,
          "minX": -384,
          "minZ": 384
        }
      },
      {
        "file": "chunk-2-0.l14b",
        "id": "2_0",
        "objects": {
          "buildings": 2,
          "channels": 1,
          "props": 14,
          "roads": 1
        },
        "rect": {
          "maxX": 128,
          "maxZ": -384,
          "minX": -128,
          "minZ": -640
        }
      },
      {
        "file": "chunk-2-1.l14b",
        "id": "2_1",
        "objects": {
          "buildings": 9,
          "channels": 1,
          "props": 18,
          "roads": 1
        },
        "rect": {
          "maxX": 128,
          "maxZ": -128,
          "minX": -128,
          "minZ": -384
        }
      },
      {
        "file": "chunk-2-2.l14b",
        "id": "2_2",
        "objects": {
          "buildings": 17,
          "channels": 1,
          "props": 17
        },
        "rect": {
          "maxX": 128,
          "maxZ": 128,
          "minX": -128,
          "minZ": -128
        }
      },
      {
        "file": "chunk-2-3.l14b",
        "id": "2_3",
        "objects": {
          "buildings": 18,
          "channels": 1,
          "props": 9,
          "roads": 4
        },
        "rect": {
          "maxX": 128,
          "maxZ": 384,
          "minX": -128,
          "minZ": 128
        }
      },
      {
        "file": "chunk-2-4.l14b",
        "id": "2_4",
        "objects": {
          "buildings": 13,
          "channels": 1,
          "lights": 1,
          "props": 15,
          "roads": 4
        },
        "rect": {
          "maxX": 128,
          "maxZ": 640,
          "minX": -128,
          "minZ": 384
        }
      },
      {
        "file": "chunk-3-0.l14b",
        "id": "3_0",
        "objects": {
          "buildings": 19,
          "props": 20,
          "roads": 13
        },
        "rect": {
          "maxX": 384,
          "maxZ": -384,
          "minX": 128,
          "minZ": -640
        }
      },
      {
        "file": "chunk-3-1.l14b",
        "id": "3_1",
        "objects": {
          "buildings": 32,
          "props": 17,
          "roads": 12
        },
        "rect": {
          "maxX": 384,
          "maxZ": -128,
          "minX": 128,
          "minZ": -384
        }
      },
      {
        "file": "chunk-3-2.l14b",
        "id": "3_2",
        "objects": {
          "buildings": 32,
          "props": 22,
          "roads": 12
        },
        "rect": {
          "maxX": 384,
          "maxZ": 128,
          "minX": 128,
          "minZ": -128
        }
      },
      {
        "file": "chunk-3-3.l14b",
        "id": "3_3",
        "objects": {
          "buildings": 25,
          "lights": 1,
          "props": 21,
          "roads": 8
        },
        "rect": {
          "maxX": 384,
          "maxZ": 384,
          "minX": 128,
          "minZ": 128
        }
      },
      {
        "file": "chunk-3-4.l14b",
        "id": "3_4",
        "objects": {
          "buildings": 32,
          "props": 16,
          "roads": 5
        },
        "rect": {
          "maxX": 384,
          "maxZ": 640,
          "minX": 128,
          "minZ": 384
        }
      },
      {
        "file": "chunk-4-0.l14b",
        "id": "4_0",
        "objects": {
          "buildings": 30,
          "lights": 1,
          "props": 32,
          "roads": 3
        },
        "rect": {
          "maxX": 640,
          "maxZ": -384,
          "minX": 384,
          "minZ": -640
        }
      },
      {
        "file": "chunk-4-1.l14b",
        "id": "4_1",
        "objects": {
          "buildings": 36,
          "props": 34,
          "roads": 1
        },
        "rect": {
          "maxX": 640,
          "maxZ": -128,
          "minX": 384,
          "minZ": -384
        }
      },
      {
        "file": "chunk-4-2.l14b",
        "id": "4_2",
        "objects": {
          "buildings": 31,
          "lights": 1,
          "props": 30,
          "roads": 11
        },
        "rect": {
          "maxX": 640,
          "maxZ": 128,
          "minX": 384,
          "minZ": -128
        }
      },
      {
        "file": "chunk-4-3.l14b",
        "id": "4_3",
        "objects": {
          "buildings": 35,
          "props": 13,
          "roads": 8
        },
        "rect": {
          "maxX": 640,
          "maxZ": 384,
          "minX": 384,
          "minZ": 128
        }
      },
      {
        "file": "chunk-4-4.l14b",
        "id": "4_4",
        "objects": {
          "buildings": 22,
          "lights": 1,
          "props": 20,
          "roads": 71
        },
        "rect": {
          "maxX": 640,
          "maxZ": 640,
          "minX": 384,
          "minZ": 384
        }
      }
    ],
    "ground": {
      "color": 7322954,
      "size": 1280,
      "y": 0
    },
    "kind": "open",
    "relief": {
      "baseY": 0,
      "blend": 14,
      "cell": 24,
      "hills": [
        {
          "bx": 52.2,
          "bz": -104.9,
          "height": 38.4,
          "id": "hill_1",
          "radius": 257.7,
          "x": 52.2,
          "z": -104.9
        },
        {
          "bx": 328.1,
          "bz": -390.9,
          "height": 34.2,
          "id": "hill_2",
          "radius": 266.7,
          "x": 328.1,
          "z": -390.9
        },
        {
          "bx": -208.2,
          "bz": 259.9,
          "height": 31.8,
          "id": "hill_3",
          "radius": 126.4,
          "x": -208.2,
          "z": 259.9
        },
        {
          "bx": -393.3,
          "bz": 453.1,
          "height": 12.8,
          "id": "hill_4",
          "radius": 262.1,
          "x": -393.3,
          "z": 453.1
        },
        {
          "bx": 205.7,
          "bz": 331.7,
          "height": 19.5,
          "id": "hill_5",
          "radius": 310.6,
          "x": 205.7,
          "z": 331.7
        },
        {
          "bx": 93,
          "bz": 153.9,
          "height": 23.6,
          "id": "hill_6",
          "radius": 136.6,
          "x": 93,
          "z": 153.9
        },
        {
          "bx": 69.5,
          "bz": 411.7,
          "height": 24.3,
          "id": "hill_7",
          "radius": 220.5,
          "x": 69.5,
          "z": 411.7
        },
        {
          "bx": 426.2,
          "bz": 397.4,
          "height": 39.6,
          "id": "hill_8",
          "radius": 185.6,
          "x": 426.2,
          "z": 397.4
        },
        {
          "bx": -163.2,
          "bz": -378.4,
          "height": 39,
          "id": "hill_9",
          "radius": 242.8,
          "x": -163.2,
          "z": -378.4
        },
        {
          "bx": -224.3,
          "bz": -43.1,
          "height": 20.7,
          "id": "hill_10",
          "radius": 172.4,
          "x": -224.3,
          "z": -43.1
        }
      ],
      "maxSlope": 0.47,
      "pads": [
        {
          "blend": 14,
          "id": "b_district_0_0_7:площадка",
          "maxX": -503.263,
          "maxZ": -589.128,
          "minX": -514.919,
          "minZ": -603.6,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_8:площадка",
          "maxX": -503.482,
          "maxZ": -561.845,
          "minX": -514.7,
          "minZ": -572.701,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_9:площадка",
          "maxX": -562.172,
          "maxZ": -504.024,
          "minX": -572.373,
          "minZ": -514.158,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_23:площадка",
          "maxX": -502.768,
          "maxZ": -620.507,
          "minX": -515.414,
          "minZ": -630.402,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_24:площадка",
          "maxX": -620.677,
          "maxZ": -502.59,
          "minX": -630.232,
          "minZ": -515.592,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_34:площадка",
          "maxX": 522.389,
          "maxZ": -180.712,
          "minX": 517.611,
          "minZ": -187.288,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_35:площадка",
          "maxX": 538.683,
          "maxZ": -165.862,
          "minX": 533.317,
          "minZ": -170.138,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_36:площадка",
          "maxX": 539.66,
          "maxZ": -149.241,
          "minX": 532.34,
          "minZ": -154.759,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_37:площадка",
          "maxX": 507.123,
          "maxZ": -133.32,
          "minX": 500.877,
          "minZ": -138.68,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_38:площадка",
          "maxX": 539.307,
          "maxZ": -133.618,
          "minX": 532.693,
          "minZ": -138.382,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_39:площадка",
          "maxX": 506.876,
          "maxZ": -117.368,
          "minX": 501.124,
          "minZ": -122.632,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_40:площадка",
          "maxX": 539.511,
          "maxZ": -117.245,
          "minX": 532.489,
          "minZ": -122.755,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_41:площадка",
          "maxX": 538.942,
          "maxZ": -101.697,
          "minX": 533.058,
          "minZ": -106.303,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_42:площадка",
          "maxX": 507.777,
          "maxZ": -85.112,
          "minX": 500.223,
          "minZ": -90.888,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_43:площадка",
          "maxX": 539.021,
          "maxZ": -85.645,
          "minX": 532.979,
          "minZ": -90.355,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_44:площадка",
          "maxX": 539.046,
          "maxZ": -69.004,
          "minX": 532.954,
          "minZ": -74.996,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_45:площадка",
          "maxX": 506.767,
          "maxZ": -53.679,
          "minX": 501.233,
          "minZ": -58.321,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_46:площадка",
          "maxX": 506.577,
          "maxZ": -37.611,
          "minX": 501.423,
          "minZ": -42.389,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_47:площадка",
          "maxX": 539.144,
          "maxZ": -37.039,
          "minX": 532.856,
          "minZ": -42.961,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_48:площадка",
          "maxX": 538.649,
          "maxZ": -21.13,
          "minX": 533.351,
          "minZ": -26.87,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_49:площадка",
          "maxX": 331.102,
          "maxZ": -4.682,
          "minX": 324.898,
          "minZ": -11.318,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_50:площадка",
          "maxX": 379.994,
          "maxZ": -4.584,
          "minX": 372.006,
          "minZ": -11.416,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_51:площадка",
          "maxX": 426.98,
          "maxZ": -4.753,
          "minX": 421.02,
          "minZ": -11.247,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_52:площадка",
          "maxX": 459.497,
          "maxZ": -5.343,
          "minX": 452.503,
          "minZ": -10.657,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_53:площадка",
          "maxX": 475.756,
          "maxZ": -4.596,
          "minX": 468.244,
          "minZ": -11.404,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_54:площадка",
          "maxX": 490.939,
          "maxZ": -4.682,
          "minX": 485.061,
          "minZ": -11.318,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_55:площадка",
          "maxX": 507.493,
          "maxZ": -5.348,
          "minX": 500.507,
          "minZ": -10.652,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_56:площадка",
          "maxX": 539.154,
          "maxZ": -5.619,
          "minX": 532.846,
          "minZ": -10.381,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_63:площадка",
          "maxX": -532.95,
          "maxZ": -589.855,
          "minX": -543.414,
          "minZ": -602.872,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_64:площадка",
          "maxX": -531.242,
          "maxZ": -560.23,
          "minX": -545.122,
          "minZ": -574.316,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_65:площадка",
          "maxX": -588.121,
          "maxZ": -531.412,
          "minX": -604.606,
          "minZ": -544.951,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_66:площадка",
          "maxX": -560.567,
          "maxZ": -530.362,
          "minX": -573.979,
          "minZ": -546.002,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_67:площадка",
          "maxX": -471.274,
          "maxZ": -530.626,
          "minX": -488.726,
          "minZ": -545.737,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_68:площадка",
          "maxX": -443.101,
          "maxZ": -531.161,
          "minX": -458.717,
          "minZ": -545.203,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_69:площадка",
          "maxX": -531.316,
          "maxZ": -472.835,
          "minX": -545.048,
          "minZ": -487.165,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_70:площадка",
          "maxX": -530.649,
          "maxZ": -441.94,
          "minX": -545.715,
          "minZ": -459.879,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_71:площадка",
          "maxX": -530.221,
          "maxZ": -383.972,
          "minX": -546.143,
          "minZ": -401.482,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_72:площадка",
          "maxX": -531.253,
          "maxZ": -357.811,
          "minX": -545.111,
          "minZ": -369.462,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_73:площадка",
          "maxX": -530.685,
          "maxZ": -327.666,
          "minX": -545.678,
          "minZ": -341.425,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_80:площадка",
          "maxX": -415.17,
          "maxZ": -531.899,
          "minX": -428.466,
          "minZ": -544.464,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_81:площадка",
          "maxX": 506.462,
          "maxZ": 36.178,
          "minX": 496.204,
          "minZ": 27.822,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_83:площадка",
          "maxX": 358.141,
          "maxZ": 57.214,
          "minX": 345.859,
          "minZ": 49.453,
          "y": 0.003
        },
        {
          "blend": 14,
          "id": "b_district_3_2_84:площадка",
          "maxX": 508.183,
          "maxZ": 58.604,
          "minX": 494.484,
          "minZ": 48.063,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_85:площадка",
          "maxX": 507.468,
          "maxZ": 101.313,
          "minX": 495.199,
          "minZ": 90.687,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_86:площадка",
          "maxX": 508.338,
          "maxZ": 122.448,
          "minX": 494.329,
          "minZ": 112.218,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_87:площадка",
          "maxX": 507.198,
          "maxZ": 142.865,
          "minX": 495.468,
          "minZ": 134.468,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_88:площадка",
          "maxX": 506.473,
          "maxZ": 185.621,
          "minX": 496.193,
          "minZ": 177.046,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_95:площадка",
          "maxX": -526.441,
          "maxZ": -252.515,
          "minX": -553.559,
          "minZ": -267.485,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_96:площадка",
          "maxX": -527.624,
          "maxZ": -132.157,
          "minX": -552.376,
          "minZ": -147.843,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_97:площадка",
          "maxX": -526.045,
          "maxZ": -88.149,
          "minX": -553.955,
          "minZ": -111.851,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_98:площадка",
          "maxX": -526.833,
          "maxZ": -10.315,
          "minX": -553.167,
          "minZ": -29.685,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_99:площадка",
          "maxX": -534.659,
          "maxZ": 105.665,
          "minX": -545.341,
          "minZ": 94.335,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_100:площадка",
          "maxX": -534.072,
          "maxZ": 145.102,
          "minX": -545.928,
          "minZ": 134.898,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_102:площадка",
          "maxX": -531.216,
          "maxZ": -618.011,
          "minX": -545.148,
          "minZ": -632.898,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_103:площадка",
          "maxX": -616.664,
          "maxZ": -529.82,
          "minX": -634.245,
          "minZ": -546.544,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_113:площадка",
          "maxX": 395.859,
          "maxZ": 609.37,
          "minX": 377.475,
          "minZ": 590.63,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_114:площадка",
          "maxX": 395.276,
          "maxZ": 635.157,
          "minX": 378.057,
          "minZ": 618.176,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_128:площадка",
          "maxX": 635.116,
          "maxZ": 393.31,
          "minX": 618.217,
          "minZ": 380.023,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_141:площадка",
          "maxX": 337.297,
          "maxZ": 36.116,
          "minX": 324.037,
          "minZ": 27.884,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_142:площадка",
          "maxX": 379.269,
          "maxZ": 36.077,
          "minX": 367.398,
          "minZ": 27.923,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_143:площадка",
          "maxX": 441.391,
          "maxZ": 36.838,
          "minX": 433.275,
          "minZ": 27.162,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_144:площадка",
          "maxX": 465.858,
          "maxZ": 35.938,
          "minX": 451.476,
          "minZ": 28.062,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_145:площадка",
          "maxX": 548.9,
          "maxZ": 78.433,
          "minX": 539.1,
          "minZ": 70.9,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_146:площадка",
          "maxX": 550.419,
          "maxZ": 142.299,
          "minX": 537.581,
          "minZ": 135.034,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_147:площадка",
          "maxX": 549.366,
          "maxZ": 165.136,
          "minX": 538.634,
          "minZ": 154.864,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_148:площадка",
          "maxX": 550.052,
          "maxZ": 185.709,
          "minX": 537.948,
          "minZ": 176.958,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_149:площадка",
          "maxX": 548.603,
          "maxZ": 249.921,
          "minX": 539.397,
          "minZ": 240.746,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_159:площадка",
          "maxX": -110.978,
          "maxZ": 548.501,
          "minX": -123.689,
          "minZ": 539.499,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_202:площадка",
          "maxX": 522.564,
          "maxZ": -197.219,
          "minX": 517.436,
          "minZ": -202.781,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_203:площадка",
          "maxX": 491.464,
          "maxZ": -165.115,
          "minX": 484.536,
          "minZ": -170.885,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_204:площадка",
          "maxX": 555.17,
          "maxZ": -165.403,
          "minX": 548.83,
          "minZ": -170.597,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_205:площадка",
          "maxX": 490.4,
          "maxZ": -149.128,
          "minX": 485.6,
          "minZ": -154.872,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_206:площадка",
          "maxX": 554.556,
          "maxZ": -149.596,
          "minX": 549.444,
          "minZ": -154.404,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_207:площадка",
          "maxX": 491.236,
          "maxZ": -133.385,
          "minX": 484.764,
          "minZ": -138.615,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_208:площадка",
          "maxX": 555.841,
          "maxZ": -133.358,
          "minX": 548.159,
          "minZ": -138.642,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_209:площадка",
          "maxX": 412.215,
          "maxZ": -20.692,
          "minX": 403.785,
          "minZ": -27.308,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_210:площадка",
          "maxX": 443.186,
          "maxZ": -20.386,
          "minX": 436.814,
          "minZ": -27.614,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_211:площадка",
          "maxX": 475.31,
          "maxZ": -20.746,
          "minX": 468.69,
          "minZ": -27.254,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_218:площадка",
          "maxX": 538.501,
          "maxZ": -197.514,
          "minX": 533.499,
          "minZ": -202.486,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_219:площадка",
          "maxX": -387.867,
          "maxZ": -531.638,
          "minX": -397.588,
          "minZ": -544.725,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_224:площадка",
          "maxX": -471.695,
          "maxZ": -589.712,
          "minX": -488.305,
          "minZ": -603.016,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_225:площадка",
          "maxX": -472.479,
          "maxZ": -559.127,
          "minX": -487.521,
          "minZ": -575.418,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_226:площадка",
          "maxX": 484.155,
          "maxZ": 79.486,
          "minX": 475.845,
          "minZ": 69.847,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_227:площадка",
          "maxX": 485.397,
          "maxZ": 100.139,
          "minX": 474.603,
          "minZ": 91.861,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_228:площадка",
          "maxX": 485.704,
          "maxZ": 122.048,
          "minX": 474.296,
          "minZ": 112.619,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_229:площадка",
          "maxX": 486.158,
          "maxZ": 144.094,
          "minX": 473.842,
          "minZ": 133.239,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_242:площадка",
          "maxX": -473.274,
          "maxZ": -619.363,
          "minX": -486.726,
          "minZ": -631.546,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_243:площадка",
          "maxX": -615.623,
          "maxZ": -472.424,
          "minX": -635.286,
          "minZ": -487.576,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_254:площадка",
          "maxX": 554.249,
          "maxZ": -197.279,
          "minX": 549.751,
          "minZ": -202.721,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_255:площадка",
          "maxX": 569.733,
          "maxZ": 141.85,
          "minX": 560.934,
          "minZ": 135.483,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_256:площадка",
          "maxX": 571.45,
          "maxZ": 185.396,
          "minX": 559.217,
          "minZ": 177.271,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_257:площадка",
          "maxX": 571.945,
          "maxZ": 227.437,
          "minX": 558.721,
          "minZ": 220.563,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_264:площадка",
          "maxX": -133.48,
          "maxZ": 569.05,
          "minX": -143.854,
          "minZ": 561.617,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_270:площадка",
          "maxX": -560.196,
          "maxZ": -560.066,
          "minX": -574.349,
          "minZ": -574.48,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_271:площадка",
          "maxX": -560.48,
          "maxZ": -445.563,
          "minX": -574.065,
          "minZ": -456.255,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_272:площадка",
          "maxX": -560.698,
          "maxZ": -415.609,
          "minX": -573.847,
          "minZ": -428.027,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_273:площадка",
          "maxX": -559.845,
          "maxZ": -356.618,
          "minX": -574.7,
          "minZ": -370.654,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_274:площадка",
          "maxX": -560.719,
          "maxZ": -326.197,
          "minX": -573.826,
          "minZ": -342.894,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_278:площадка",
          "maxX": 571.703,
          "maxZ": -164.999,
          "minX": 564.297,
          "minZ": -171.001,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_279:площадка",
          "maxX": 474.826,
          "maxZ": -133.572,
          "minX": 469.174,
          "minZ": -138.428,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_283:площадка",
          "maxX": -560.02,
          "maxZ": -618.592,
          "minX": -574.526,
          "minZ": -632.317,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_284:площадка",
          "maxX": -620.02,
          "maxZ": -560.834,
          "minX": -630.889,
          "minZ": -573.711,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_287:площадка",
          "maxX": 570.603,
          "maxZ": -180.681,
          "minX": 565.397,
          "minZ": -187.319,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_299:площадка",
          "maxX": -386.326,
          "maxZ": -560.088,
          "minX": -399.128,
          "minZ": -574.457,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_309:площадка",
          "maxX": -563.446,
          "maxZ": -287.442,
          "minX": -596.554,
          "minZ": -312.558,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_310:площадка",
          "maxX": -569.858,
          "maxZ": -212.345,
          "minX": -590.142,
          "minZ": -227.655,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_311:площадка",
          "maxX": -565.298,
          "maxZ": -126.214,
          "minX": -594.702,
          "minZ": -153.786,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_312:площадка",
          "maxX": -569.446,
          "maxZ": -89.487,
          "minX": -590.554,
          "minZ": -110.513,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_313:площадка",
          "maxX": -563.268,
          "maxZ": -8.587,
          "minX": -596.732,
          "minZ": -31.413,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_314:площадка",
          "maxX": -575.58,
          "maxZ": 63.235,
          "minX": -584.42,
          "minZ": 56.765,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_315:площадка",
          "maxX": -576.156,
          "maxZ": 143.835,
          "minX": -583.844,
          "minZ": 136.165,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_316:площадка",
          "maxX": -574.61,
          "maxZ": 264.193,
          "minX": -585.39,
          "minZ": 255.807,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_321:площадка",
          "maxX": 426.528,
          "maxZ": -52.962,
          "minX": 421.472,
          "minZ": -59.038,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_325:площадка",
          "maxX": 443.538,
          "maxZ": 78.669,
          "minX": 431.129,
          "minZ": 70.664,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_328:площадка",
          "maxX": -445.034,
          "maxZ": -618.417,
          "minX": -456.784,
          "minZ": -632.492,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_330:площадка",
          "maxX": 554.439,
          "maxZ": -228.632,
          "minX": 549.561,
          "minZ": -235.368,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_335:площадка",
          "maxX": -589.488,
          "maxZ": -358.3,
          "minX": -603.239,
          "minZ": -368.972,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_338:площадка",
          "maxX": -357.12,
          "maxZ": -561.018,
          "minX": -370.153,
          "minZ": -573.527,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_345:площадка",
          "maxX": 577.553,
          "maxZ": -513.838,
          "minX": 570.682,
          "minZ": -521.456,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_346:площадка",
          "maxX": 602.791,
          "maxZ": -196.698,
          "minX": 597.209,
          "minZ": -203.302,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_351:площадка",
          "maxX": -151.833,
          "maxZ": 612.575,
          "minX": -168.167,
          "minZ": 603.425,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_352:площадка",
          "maxX": -47.708,
          "maxZ": 612.962,
          "minX": -58.959,
          "minZ": 603.038,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_362:площадка",
          "maxX": -357.364,
          "maxZ": -590.825,
          "minX": -369.909,
          "minZ": -601.903,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_365:площадка",
          "maxX": -604.229,
          "maxZ": -291.129,
          "minX": -635.771,
          "minZ": -308.871,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_366:площадка",
          "maxX": -606.082,
          "maxZ": -249.327,
          "minX": -633.918,
          "minZ": -270.673,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_367:площадка",
          "maxX": -602.5,
          "maxZ": -209.121,
          "minX": -637.5,
          "minZ": -230.879,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_368:площадка",
          "maxX": -604.086,
          "maxZ": -169.075,
          "minX": -635.914,
          "minZ": -190.925,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_369:площадка",
          "maxX": -608.254,
          "maxZ": -127.142,
          "minX": -631.746,
          "minZ": -152.858,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_370:площадка",
          "maxX": -614.84,
          "maxZ": 224.423,
          "minX": -625.16,
          "minZ": 215.577,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_371:площадка",
          "maxX": -615.117,
          "maxZ": 266.052,
          "minX": -624.883,
          "minZ": 253.948,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_372:площадка",
          "maxX": -615.226,
          "maxZ": 303.575,
          "minX": -624.774,
          "minZ": 296.425,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_374:площадка",
          "maxX": -617.995,
          "maxZ": -327.069,
          "minX": -632.914,
          "minZ": -342.022,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_376:площадка",
          "maxX": 615.093,
          "maxZ": -419.27,
          "minX": 608.436,
          "minZ": -427.789,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_377:площадка",
          "maxX": 578.237,
          "maxZ": -551.765,
          "minX": 569.998,
          "minZ": -558.823,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_380:площадка",
          "maxX": -2.5,
          "maxZ": 634.223,
          "minX": -18.833,
          "minZ": 624.444,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_385:площадка",
          "maxX": 124.34,
          "maxZ": -562.182,
          "minX": 104.232,
          "minZ": -580.675,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_388:площадка",
          "maxX": -327.183,
          "maxZ": -587.993,
          "minX": -341.908,
          "minZ": -604.734,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_394:площадка",
          "maxX": -358.565,
          "maxZ": -618.33,
          "minX": -368.708,
          "minZ": -632.579,
          "y": 0
        }
      ],
      "rivers": [
        {
          "bankY": 0,
          "bedY": -4,
          "halfW": 11,
          "ramp": 30,
          "segments": [
            {
              "ax": 3,
              "az": -576,
              "bx": 61,
              "bz": -384
            },
            {
              "ax": 61,
              "az": -384,
              "bx": 35.2,
              "bz": -192
            },
            {
              "ax": 35.2,
              "az": -192,
              "bx": -8.6,
              "bz": 0
            },
            {
              "ax": -8.6,
              "az": 0,
              "bx": -62.2,
              "bz": 192
            },
            {
              "ax": -62.2,
              "az": 192,
              "bx": -40.9,
              "bz": 384
            },
            {
              "ax": -40.9,
              "az": 384,
              "bx": 22.1,
              "bz": 576
            }
          ],
          "surfaceY": -0.2
        }
      ],
      "roadCorridors": [
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_main_g_1",
          "points": [
            {
              "x": -520,
              "y": 0,
              "z": -520
            },
            {
              "x": -520,
              "y": 0,
              "z": -508.05
            },
            {
              "x": -520,
              "y": 0,
              "z": -496.09
            },
            {
              "x": -520,
              "y": 0,
              "z": -484.14
            },
            {
              "x": -520,
              "y": 0,
              "z": -472.18
            },
            {
              "x": -520,
              "y": 0,
              "z": -460.23
            },
            {
              "x": -520,
              "y": 0,
              "z": -448.28
            },
            {
              "x": -520,
              "y": 0,
              "z": -436.32
            },
            {
              "x": -520,
              "y": 0,
              "z": -424.37
            },
            {
              "x": -520,
              "y": 0,
              "z": -412.41
            },
            {
              "x": -520,
              "y": 0,
              "z": -400.46
            },
            {
              "x": -520,
              "y": 0,
              "z": -388.51
            },
            {
              "x": -520,
              "y": 0,
              "z": -376.55
            },
            {
              "x": -520,
              "y": 0,
              "z": -364.6
            },
            {
              "x": -520,
              "y": 0,
              "z": -352.64
            },
            {
              "x": -520,
              "y": 0,
              "z": -340.69
            },
            {
              "x": -520,
              "y": 0,
              "z": -328.74
            },
            {
              "x": -520,
              "y": 0,
              "z": -316.78
            },
            {
              "x": -520,
              "y": 0,
              "z": -304.83
            },
            {
              "x": -520,
              "y": 0,
              "z": -292.87
            },
            {
              "x": -520,
              "y": 0,
              "z": -280.92
            },
            {
              "x": -520,
              "y": 0,
              "z": -268.97
            },
            {
              "x": -520,
              "y": 0,
              "z": -257.01
            },
            {
              "x": -520,
              "y": 0,
              "z": -245.06
            },
            {
              "x": -520,
              "y": 0,
              "z": -233.1
            },
            {
              "x": -520,
              "y": 0,
              "z": -221.15
            },
            {
              "x": -520,
              "y": 0,
              "z": -209.2
            },
            {
              "x": -520,
              "y": 0,
              "z": -197.24
            },
            {
              "x": -520,
              "y": 0,
              "z": -185.29
            },
            {
              "x": -520,
              "y": 0,
              "z": -173.33
            },
            {
              "x": -520,
              "y": 0,
              "z": -161.38
            },
            {
              "x": -520,
              "y": 0,
              "z": -149.43
            },
            {
              "x": -520,
              "y": 0,
              "z": -137.47
            },
            {
              "x": -520,
              "y": 0,
              "z": -125.52
            },
            {
              "x": -520,
              "y": 0,
              "z": -113.56
            },
            {
              "x": -520,
              "y": 0,
              "z": -101.61
            },
            {
              "x": -520,
              "y": 0,
              "z": -89.66
            },
            {
              "x": -520,
              "y": 0,
              "z": -77.7
            },
            {
              "x": -520,
              "y": 0,
              "z": -65.75
            },
            {
              "x": -520,
              "y": 0,
              "z": -53.79
            },
            {
              "x": -520,
              "y": 0,
              "z": -41.84
            },
            {
              "x": -520,
              "y": 0,
              "z": -29.89
            },
            {
              "x": -520,
              "y": 0,
              "z": -17.93
            },
            {
              "x": -520,
              "y": 0,
              "z": -5.98
            },
            {
              "x": -520,
              "y": 0,
              "z": 5.98
            },
            {
              "x": -520,
              "y": 0,
              "z": 17.93
            },
            {
              "x": -520,
              "y": 0,
              "z": 29.89
            },
            {
              "x": -520,
              "y": 0,
              "z": 41.84
            },
            {
              "x": -520,
              "y": 0,
              "z": 53.79
            },
            {
              "x": -520,
              "y": 0,
              "z": 65.75
            },
            {
              "x": -520,
              "y": 0,
              "z": 77.7
            },
            {
              "x": -520,
              "y": 0,
              "z": 89.66
            },
            {
              "x": -520,
              "y": 0,
              "z": 101.61
            },
            {
              "x": -520,
              "y": 0,
              "z": 113.56
            },
            {
              "x": -520,
              "y": 0,
              "z": 125.52
            },
            {
              "x": -520,
              "y": 0,
              "z": 137.47
            },
            {
              "x": -520,
              "y": 0,
              "z": 149.43
            },
            {
              "x": -520,
              "y": 0,
              "z": 161.38
            },
            {
              "x": -520,
              "y": 0,
              "z": 173.33
            },
            {
              "x": -520,
              "y": 0,
              "z": 185.29
            },
            {
              "x": -520,
              "y": 0,
              "z": 197.24
            },
            {
              "x": -520,
              "y": 0,
              "z": 209.2
            },
            {
              "x": -520,
              "y": 0,
              "z": 221.15
            },
            {
              "x": -520,
              "y": 0.04,
              "z": 233.1
            },
            {
              "x": -520,
              "y": 0.18,
              "z": 245.06
            },
            {
              "x": -520,
              "y": 0.43,
              "z": 257.01
            },
            {
              "x": -520,
              "y": 0.75,
              "z": 268.97
            },
            {
              "x": -520,
              "y": 1.15,
              "z": 280.92
            },
            {
              "x": -520,
              "y": 1.59,
              "z": 292.87
            },
            {
              "x": -520,
              "y": 2.09,
              "z": 304.83
            },
            {
              "x": -520,
              "y": 2.6,
              "z": 316.78
            },
            {
              "x": -520,
              "y": 3.14,
              "z": 328.74
            },
            {
              "x": -520,
              "y": 3.67,
              "z": 340.69
            },
            {
              "x": -520,
              "y": 4.2,
              "z": 352.64
            },
            {
              "x": -520,
              "y": 4.7,
              "z": 364.6
            },
            {
              "x": -520,
              "y": 5.16,
              "z": 376.55
            },
            {
              "x": -520,
              "y": 5.58,
              "z": 388.51
            },
            {
              "x": -520,
              "y": 5.95,
              "z": 400.46
            },
            {
              "x": -520,
              "y": 6.25,
              "z": 412.41
            },
            {
              "x": -520,
              "y": 6.48,
              "z": 424.37
            },
            {
              "x": -520,
              "y": 6.64,
              "z": 436.32
            },
            {
              "x": -520,
              "y": 6.71,
              "z": 448.28
            },
            {
              "x": -520,
              "y": 6.7,
              "z": 460.23
            },
            {
              "x": -520,
              "y": 6.61,
              "z": 472.18
            },
            {
              "x": -520,
              "y": 6.44,
              "z": 484.14
            },
            {
              "x": -520,
              "y": 6.2,
              "z": 496.09
            },
            {
              "x": -520,
              "y": 5.88,
              "z": 508.05
            },
            {
              "x": -520,
              "y": 5.51,
              "z": 520
            },
            {
              "x": -508.22,
              "y": 6.26,
              "z": 520
            },
            {
              "x": -496.44,
              "y": 6.99,
              "z": 520
            },
            {
              "x": -484.66,
              "y": 7.7,
              "z": 520
            },
            {
              "x": -472.88,
              "y": 8.36,
              "z": 520
            },
            {
              "x": -461.1,
              "y": 8.96,
              "z": 520
            },
            {
              "x": -449.32,
              "y": 9.49,
              "z": 520
            },
            {
              "x": -437.54,
              "y": 9.94,
              "z": 520
            },
            {
              "x": -425.76,
              "y": 10.29,
              "z": 520
            },
            {
              "x": -413.98,
              "y": 10.55,
              "z": 520
            },
            {
              "x": -402.2,
              "y": 10.69,
              "z": 520
            },
            {
              "x": -390.41,
              "y": 10.72,
              "z": 520
            },
            {
              "x": -378.63,
              "y": 10.63,
              "z": 520
            },
            {
              "x": -366.85,
              "y": 10.44,
              "z": 520
            },
            {
              "x": -355.07,
              "y": 10.13,
              "z": 520
            },
            {
              "x": -343.29,
              "y": 9.73,
              "z": 520
            },
            {
              "x": -331.51,
              "y": 9.24,
              "z": 520
            },
            {
              "x": -319.73,
              "y": 8.67,
              "z": 520
            },
            {
              "x": -307.95,
              "y": 8.04,
              "z": 520
            },
            {
              "x": -296.17,
              "y": 7.36,
              "z": 520
            },
            {
              "x": -284.39,
              "y": 6.64,
              "z": 520
            },
            {
              "x": -272.61,
              "y": 5.89,
              "z": 520
            },
            {
              "x": -260.83,
              "y": 5.14,
              "z": 520
            },
            {
              "x": -249.05,
              "y": 4.38,
              "z": 520
            },
            {
              "x": -237.27,
              "y": 3.65,
              "z": 520
            },
            {
              "x": -225.49,
              "y": 2.94,
              "z": 520
            },
            {
              "x": -213.71,
              "y": 2.28,
              "z": 520
            },
            {
              "x": -201.93,
              "y": 1.67,
              "z": 520
            },
            {
              "x": -190.15,
              "y": 1.14,
              "z": 520
            },
            {
              "x": -178.37,
              "y": 0.69,
              "z": 520
            },
            {
              "x": -166.59,
              "y": 0.35,
              "z": 520
            },
            {
              "x": -154.8,
              "y": 0.11,
              "z": 520
            },
            {
              "x": -143.02,
              "y": 0.01,
              "z": 520
            },
            {
              "x": -131.24,
              "y": 0,
              "z": 520
            },
            {
              "x": -119.46,
              "y": 0.01,
              "z": 520
            },
            {
              "x": -107.68,
              "y": 0.24,
              "z": 520
            },
            {
              "x": -95.9,
              "y": 0.73,
              "z": 520
            },
            {
              "x": -84.12,
              "y": 1.43,
              "z": 520
            },
            {
              "x": -72.34,
              "y": 2.31,
              "z": 520
            },
            {
              "x": -60.56,
              "y": 3.33,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_main_g_3",
          "points": [
            {
              "x": 56.88,
              "y": 14.91,
              "z": 520
            },
            {
              "x": 68.75,
              "y": 15.53,
              "z": 520
            },
            {
              "x": 80.63,
              "y": 15.93,
              "z": 520
            },
            {
              "x": 92.5,
              "y": 16.11,
              "z": 520
            },
            {
              "x": 104.38,
              "y": 16.07,
              "z": 520
            },
            {
              "x": 116.25,
              "y": 15.82,
              "z": 520
            },
            {
              "x": 128.13,
              "y": 15.37,
              "z": 520
            },
            {
              "x": 140,
              "y": 14.75,
              "z": 520
            },
            {
              "x": 151.88,
              "y": 13.98,
              "z": 520
            },
            {
              "x": 163.75,
              "y": 13.09,
              "z": 520
            },
            {
              "x": 175.63,
              "y": 12.11,
              "z": 520
            },
            {
              "x": 187.5,
              "y": 11.07,
              "z": 520
            },
            {
              "x": 199.38,
              "y": 10.02,
              "z": 520
            },
            {
              "x": 211.25,
              "y": 9,
              "z": 520
            },
            {
              "x": 223.13,
              "y": 8.05,
              "z": 520
            },
            {
              "x": 235,
              "y": 7.21,
              "z": 520
            },
            {
              "x": 246.88,
              "y": 6.52,
              "z": 520
            },
            {
              "x": 258.75,
              "y": 6.05,
              "z": 520
            },
            {
              "x": 270.63,
              "y": 5.73,
              "z": 520
            },
            {
              "x": 282.5,
              "y": 5.37,
              "z": 520
            },
            {
              "x": 294.38,
              "y": 5.07,
              "z": 520
            },
            {
              "x": 306.25,
              "y": 5.18,
              "z": 520
            },
            {
              "x": 318.13,
              "y": 5.62,
              "z": 520
            },
            {
              "x": 330,
              "y": 6.31,
              "z": 520
            },
            {
              "x": 341.88,
              "y": 7.14,
              "z": 520
            },
            {
              "x": 353.75,
              "y": 8.03,
              "z": 520
            },
            {
              "x": 365.63,
              "y": 8.9,
              "z": 520
            },
            {
              "x": 377.5,
              "y": 9.68,
              "z": 520
            },
            {
              "x": 389.38,
              "y": 10.3,
              "z": 520
            },
            {
              "x": 401.25,
              "y": 10.73,
              "z": 520
            },
            {
              "x": 413.13,
              "y": 10.92,
              "z": 520
            },
            {
              "x": 425,
              "y": 10.86,
              "z": 520
            },
            {
              "x": 436.88,
              "y": 10.55,
              "z": 520
            },
            {
              "x": 448.75,
              "y": 10.01,
              "z": 520
            },
            {
              "x": 460.63,
              "y": 9.26,
              "z": 520
            },
            {
              "x": 472.5,
              "y": 8.25,
              "z": 520
            },
            {
              "x": 484.38,
              "y": 7.05,
              "z": 520
            },
            {
              "x": 496.25,
              "y": 5.71,
              "z": 520
            },
            {
              "x": 508.13,
              "y": 4.33,
              "z": 520
            },
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_sp4_r",
          "points": [
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 520,
              "y": 4.85,
              "z": 508
            },
            {
              "x": 520,
              "y": 6.95,
              "z": 496
            },
            {
              "x": 520,
              "y": 9.17,
              "z": 484
            },
            {
              "x": 520,
              "y": 11.39,
              "z": 472
            },
            {
              "x": 520,
              "y": 13.51,
              "z": 460
            },
            {
              "x": 520,
              "y": 15.42,
              "z": 448
            },
            {
              "x": 520,
              "y": 17.05,
              "z": 436
            },
            {
              "x": 520,
              "y": 18.3,
              "z": 424
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_spc_a",
          "points": [
            {
              "x": -424,
              "y": 0,
              "z": -520
            },
            {
              "x": -424,
              "y": 0,
              "z": -508
            },
            {
              "x": -424,
              "y": 0,
              "z": -496
            },
            {
              "x": -424,
              "y": 0,
              "z": -484
            },
            {
              "x": -424,
              "y": 0,
              "z": -472
            },
            {
              "x": -424,
              "y": 0,
              "z": -460
            },
            {
              "x": -424,
              "y": 0,
              "z": -448
            },
            {
              "x": -424,
              "y": 0,
              "z": -436
            },
            {
              "x": -424,
              "y": 0,
              "z": -424
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_spc_b",
          "points": [
            {
              "x": -444,
              "y": 0,
              "z": -424
            },
            {
              "x": -508,
              "y": 0,
              "z": -424
            },
            {
              "x": -496,
              "y": 0,
              "z": -424
            },
            {
              "x": -484,
              "y": 0,
              "z": -424
            },
            {
              "x": -472,
              "y": 0,
              "z": -424
            },
            {
              "x": -460,
              "y": 0,
              "z": -424
            },
            {
              "x": -448,
              "y": 0,
              "z": -424
            },
            {
              "x": -444,
              "y": 0,
              "z": -424
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_9",
          "points": [
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 532,
              "y": 1.77,
              "z": 520
            },
            {
              "x": 544,
              "y": 0.79,
              "z": 520
            },
            {
              "x": 556,
              "y": 0.17,
              "z": 520
            },
            {
              "x": 568,
              "y": 0,
              "z": 520
            },
            {
              "x": 580,
              "y": 0,
              "z": 520
            },
            {
              "x": 592,
              "y": 0,
              "z": 520
            },
            {
              "x": 604,
              "y": 0,
              "z": 520
            },
            {
              "x": 616,
              "y": 0,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_10",
          "points": [
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 508,
              "y": 4.35,
              "z": 520
            },
            {
              "x": 496,
              "y": 5.74,
              "z": 520
            },
            {
              "x": 484,
              "y": 7.09,
              "z": 520
            },
            {
              "x": 472,
              "y": 8.3,
              "z": 520
            },
            {
              "x": 460,
              "y": 9.3,
              "z": 520
            },
            {
              "x": 448,
              "y": 10.05,
              "z": 520
            },
            {
              "x": 436,
              "y": 10.58,
              "z": 520
            },
            {
              "x": 424,
              "y": 10.87,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_11",
          "points": [
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 520,
              "y": 1.48,
              "z": 532
            },
            {
              "x": 520,
              "y": 0.44,
              "z": 544
            },
            {
              "x": 520,
              "y": 0.01,
              "z": 556
            },
            {
              "x": 520,
              "y": 0,
              "z": 568
            },
            {
              "x": 520,
              "y": 0,
              "z": 580
            },
            {
              "x": 520,
              "y": 0,
              "z": 592
            },
            {
              "x": 520,
              "y": 0,
              "z": 604
            },
            {
              "x": 520,
              "y": 0,
              "z": 616
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_12",
          "points": [
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 531.43,
              "y": 1.82,
              "z": 520
            },
            {
              "x": 542.86,
              "y": 0.87,
              "z": 520
            },
            {
              "x": 554.29,
              "y": 0.23,
              "z": 520
            },
            {
              "x": 565.71,
              "y": 0,
              "z": 520
            },
            {
              "x": 577.14,
              "y": 0,
              "z": 520
            },
            {
              "x": 588.57,
              "y": 0,
              "z": 520
            },
            {
              "x": 600,
              "y": 0,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_13",
          "points": [
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 508.57,
              "y": 4.28,
              "z": 520
            },
            {
              "x": 497.14,
              "y": 5.61,
              "z": 520
            },
            {
              "x": 485.71,
              "y": 6.9,
              "z": 520
            },
            {
              "x": 474.29,
              "y": 8.08,
              "z": 520
            },
            {
              "x": 462.86,
              "y": 9.08,
              "z": 520
            },
            {
              "x": 451.43,
              "y": 9.86,
              "z": 520
            },
            {
              "x": 440,
              "y": 10.43,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_14",
          "points": [
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 520,
              "y": 1.54,
              "z": 531.43
            },
            {
              "x": 520,
              "y": 0.52,
              "z": 542.86
            },
            {
              "x": 520,
              "y": 0.03,
              "z": 554.29
            },
            {
              "x": 520,
              "y": 0,
              "z": 565.71
            },
            {
              "x": 520,
              "y": 0,
              "z": 577.14
            },
            {
              "x": 520,
              "y": 0,
              "z": 588.57
            },
            {
              "x": 520,
              "y": 0,
              "z": 600
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_15",
          "points": [
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 520,
              "y": 4.76,
              "z": 508.57
            },
            {
              "x": 520,
              "y": 6.74,
              "z": 497.14
            },
            {
              "x": 520,
              "y": 8.85,
              "z": 485.71
            },
            {
              "x": 520,
              "y": 10.97,
              "z": 474.29
            },
            {
              "x": 520,
              "y": 13.02,
              "z": 462.86
            },
            {
              "x": 520,
              "y": 14.9,
              "z": 451.43
            },
            {
              "x": 520,
              "y": 16.54,
              "z": 440
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_16",
          "points": [
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 530.67,
              "y": 1.89,
              "z": 520
            },
            {
              "x": 541.33,
              "y": 0.98,
              "z": 520
            },
            {
              "x": 552,
              "y": 0.33,
              "z": 520
            },
            {
              "x": 562.67,
              "y": 0.02,
              "z": 520
            },
            {
              "x": 573.33,
              "y": 0,
              "z": 520
            },
            {
              "x": 584,
              "y": 0,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_17",
          "points": [
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 509.33,
              "y": 4.19,
              "z": 520
            },
            {
              "x": 498.67,
              "y": 5.43,
              "z": 520
            },
            {
              "x": 488,
              "y": 6.65,
              "z": 520
            },
            {
              "x": 477.33,
              "y": 7.78,
              "z": 520
            },
            {
              "x": 466.67,
              "y": 8.77,
              "z": 520
            },
            {
              "x": 456,
              "y": 9.58,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_18",
          "points": [
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 520,
              "y": 1.62,
              "z": 530.67
            },
            {
              "x": 520,
              "y": 0.62,
              "z": 541.33
            },
            {
              "x": 520,
              "y": 0.08,
              "z": 552
            },
            {
              "x": 520,
              "y": 0,
              "z": 562.67
            },
            {
              "x": 520,
              "y": 0,
              "z": 573.33
            },
            {
              "x": 520,
              "y": 0,
              "z": 584
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_19",
          "points": [
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 520,
              "y": 4.63,
              "z": 509.33
            },
            {
              "x": 520,
              "y": 6.47,
              "z": 498.67
            },
            {
              "x": 520,
              "y": 8.42,
              "z": 488
            },
            {
              "x": 520,
              "y": 10.41,
              "z": 477.33
            },
            {
              "x": 520,
              "y": 12.35,
              "z": 466.67
            },
            {
              "x": 520,
              "y": 14.17,
              "z": 456
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_20",
          "points": [
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 532,
              "y": 1.77,
              "z": 520
            },
            {
              "x": 544,
              "y": 0.79,
              "z": 520
            },
            {
              "x": 556,
              "y": 0.17,
              "z": 520
            },
            {
              "x": 568,
              "y": 0,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_21",
          "points": [
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 508,
              "y": 4.35,
              "z": 520
            },
            {
              "x": 496,
              "y": 5.74,
              "z": 520
            },
            {
              "x": 484,
              "y": 7.09,
              "z": 520
            },
            {
              "x": 472,
              "y": 8.3,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_22",
          "points": [
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 520,
              "y": 1.48,
              "z": 532
            },
            {
              "x": 520,
              "y": 0.44,
              "z": 544
            },
            {
              "x": 520,
              "y": 0.01,
              "z": 556
            },
            {
              "x": 520,
              "y": 0,
              "z": 568
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_23",
          "points": [
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 520,
              "y": 4.85,
              "z": 508
            },
            {
              "x": 520,
              "y": 6.95,
              "z": 496
            },
            {
              "x": 520,
              "y": 9.17,
              "z": 484
            },
            {
              "x": 520,
              "y": 11.39,
              "z": 472
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_24",
          "points": [
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 530,
              "y": 1.96,
              "z": 520
            },
            {
              "x": 540,
              "y": 1.08,
              "z": 520
            },
            {
              "x": 550,
              "y": 0.43,
              "z": 520
            },
            {
              "x": 560,
              "y": 0.06,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_25",
          "points": [
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 510,
              "y": 4.11,
              "z": 520
            },
            {
              "x": 500,
              "y": 5.28,
              "z": 520
            },
            {
              "x": 490,
              "y": 6.43,
              "z": 520
            },
            {
              "x": 480,
              "y": 7.51,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_26",
          "points": [
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 520,
              "y": 1.7,
              "z": 530
            },
            {
              "x": 520,
              "y": 0.73,
              "z": 540
            },
            {
              "x": 520,
              "y": 0.14,
              "z": 550
            },
            {
              "x": 520,
              "y": 0,
              "z": 560
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_27",
          "points": [
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 520,
              "y": 4.52,
              "z": 510
            },
            {
              "x": 520,
              "y": 6.23,
              "z": 500
            },
            {
              "x": 520,
              "y": 8.05,
              "z": 490
            },
            {
              "x": 520,
              "y": 9.91,
              "z": 480
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_28",
          "points": [
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 531.2,
              "y": 1.84,
              "z": 520
            },
            {
              "x": 542.4,
              "y": 0.9,
              "z": 520
            },
            {
              "x": 553.6,
              "y": 0.26,
              "z": 520
            },
            {
              "x": 564.8,
              "y": 0,
              "z": 520
            },
            {
              "x": 576,
              "y": 0,
              "z": 520
            },
            {
              "x": 587.2,
              "y": 0,
              "z": 520
            },
            {
              "x": 598.4,
              "y": 0,
              "z": 520
            },
            {
              "x": 609.6,
              "y": 0,
              "z": 520
            },
            {
              "x": 620.8,
              "y": 0,
              "z": 520
            },
            {
              "x": 632,
              "y": 0,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_30",
          "points": [
            {
              "x": 632,
              "y": 0,
              "z": 520
            },
            {
              "x": 632,
              "y": 0,
              "z": 508.8
            },
            {
              "x": 632,
              "y": 0,
              "z": 497.6
            },
            {
              "x": 632,
              "y": 0,
              "z": 486.4
            },
            {
              "x": 632,
              "y": 0,
              "z": 475.2
            },
            {
              "x": 632,
              "y": 0,
              "z": 464
            },
            {
              "x": 632,
              "y": 0,
              "z": 452.8
            },
            {
              "x": 632,
              "y": 0,
              "z": 441.6
            },
            {
              "x": 632,
              "y": 0,
              "z": 430.4
            },
            {
              "x": 632,
              "y": 0,
              "z": 419.2
            },
            {
              "x": 632,
              "y": 0,
              "z": 408
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_31",
          "points": [
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 508.8,
              "y": 4.25,
              "z": 520
            },
            {
              "x": 497.6,
              "y": 5.56,
              "z": 520
            },
            {
              "x": 486.4,
              "y": 6.83,
              "z": 520
            },
            {
              "x": 475.2,
              "y": 7.99,
              "z": 520
            },
            {
              "x": 464,
              "y": 8.99,
              "z": 520
            },
            {
              "x": 452.8,
              "y": 9.78,
              "z": 520
            },
            {
              "x": 441.6,
              "y": 10.36,
              "z": 520
            },
            {
              "x": 430.4,
              "y": 10.75,
              "z": 520
            },
            {
              "x": 419.2,
              "y": 10.92,
              "z": 520
            },
            {
              "x": 408,
              "y": 10.87,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_32",
          "points": [
            {
              "x": 408,
              "y": 10.87,
              "z": 520
            },
            {
              "x": 408,
              "y": 7.62,
              "z": 531.2
            },
            {
              "x": 408,
              "y": 4.81,
              "z": 542.4
            },
            {
              "x": 408,
              "y": 2.55,
              "z": 553.6
            },
            {
              "x": 408,
              "y": 0.96,
              "z": 564.8
            },
            {
              "x": 408,
              "y": 0.12,
              "z": 576
            },
            {
              "x": 408,
              "y": 0,
              "z": 587.2
            },
            {
              "x": 408,
              "y": 0,
              "z": 598.4
            },
            {
              "x": 408,
              "y": 0,
              "z": 609.6
            },
            {
              "x": 408,
              "y": 0,
              "z": 620.8
            },
            {
              "x": 408,
              "y": 0,
              "z": 632
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_33",
          "points": [
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 520,
              "y": 4.72,
              "z": 508.8
            },
            {
              "x": 520,
              "y": 6.66,
              "z": 497.6
            },
            {
              "x": 520,
              "y": 8.72,
              "z": 486.4
            },
            {
              "x": 520,
              "y": 10.8,
              "z": 475.2
            },
            {
              "x": 520,
              "y": 12.82,
              "z": 464
            },
            {
              "x": 520,
              "y": 14.69,
              "z": 452.8
            },
            {
              "x": 520,
              "y": 16.33,
              "z": 441.6
            },
            {
              "x": 520,
              "y": 17.68,
              "z": 430.4
            },
            {
              "x": 520,
              "y": 18.68,
              "z": 419.2
            },
            {
              "x": 520,
              "y": 19.29,
              "z": 408
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_34",
          "points": [
            {
              "x": 520,
              "y": 19.29,
              "z": 408
            },
            {
              "x": 514.4,
              "y": 20.97,
              "z": 408
            },
            {
              "x": 503.2,
              "y": 24.33,
              "z": 408
            },
            {
              "x": 500.4,
              "y": 25.17,
              "z": 408
            },
            {
              "x": 494.8,
              "y": 26.85,
              "z": 408
            },
            {
              "x": 490.6,
              "y": 28.11,
              "z": 408
            },
            {
              "x": 482.2,
              "y": 30.63,
              "z": 408
            },
            {
              "x": 478.7,
              "y": 31.68,
              "z": 408
            },
            {
              "x": 471.7,
              "y": 33.78,
              "z": 408
            },
            {
              "x": 464,
              "y": 35.98,
              "z": 408
            },
            {
              "x": 452.8,
              "y": 38.52,
              "z": 408
            },
            {
              "x": 441.6,
              "y": 40.54,
              "z": 408
            },
            {
              "x": 430.4,
              "y": 41.92,
              "z": 408
            },
            {
              "x": 419.2,
              "y": 42.57,
              "z": 408
            },
            {
              "x": 408,
              "y": 42.49,
              "z": 408
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_36",
          "points": [
            {
              "x": 616,
              "y": 0,
              "z": 520
            },
            {
              "x": 616,
              "y": 0,
              "z": 508
            },
            {
              "x": 616,
              "y": 0,
              "z": 496
            },
            {
              "x": 616,
              "y": 0,
              "z": 484
            },
            {
              "x": 616,
              "y": 0,
              "z": 472
            },
            {
              "x": 616,
              "y": 0,
              "z": 460
            },
            {
              "x": 616,
              "y": 0,
              "z": 448
            },
            {
              "x": 616,
              "y": 0,
              "z": 436
            },
            {
              "x": 616,
              "y": 0,
              "z": 424
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_37",
          "points": [
            {
              "x": 424,
              "y": 10.87,
              "z": 520
            },
            {
              "x": 424,
              "y": 7.44,
              "z": 532
            },
            {
              "x": 424,
              "y": 4.53,
              "z": 544
            },
            {
              "x": 424,
              "y": 2.27,
              "z": 556
            },
            {
              "x": 424,
              "y": 0.73,
              "z": 568
            },
            {
              "x": 424,
              "y": 0.03,
              "z": 580
            },
            {
              "x": 424,
              "y": 0,
              "z": 592
            },
            {
              "x": 424,
              "y": 0,
              "z": 604
            },
            {
              "x": 424,
              "y": 0,
              "z": 616
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_38",
          "points": [
            {
              "x": 520,
              "y": 18.3,
              "z": 424
            },
            {
              "x": 514,
              "y": 20.1,
              "z": 424
            },
            {
              "x": 502,
              "y": 23.7,
              "z": 424
            },
            {
              "x": 499,
              "y": 24.6,
              "z": 424
            },
            {
              "x": 493,
              "y": 26.4,
              "z": 424
            },
            {
              "x": 484,
              "y": 29.01,
              "z": 424
            },
            {
              "x": 472,
              "y": 32.24,
              "z": 424
            },
            {
              "x": 460,
              "y": 35.1,
              "z": 424
            },
            {
              "x": 448,
              "y": 37.45,
              "z": 424
            },
            {
              "x": 436,
              "y": 39.16,
              "z": 424
            },
            {
              "x": 424,
              "y": 40.14,
              "z": 424
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_39",
          "points": [
            {
              "x": 600,
              "y": 0,
              "z": 520
            },
            {
              "x": 600,
              "y": 0,
              "z": 531.43
            },
            {
              "x": 600,
              "y": 0,
              "z": 542.86
            },
            {
              "x": 600,
              "y": 0,
              "z": 554.29
            },
            {
              "x": 600,
              "y": 0,
              "z": 565.71
            },
            {
              "x": 600,
              "y": 0,
              "z": 577.14
            },
            {
              "x": 600,
              "y": 0,
              "z": 588.57
            },
            {
              "x": 600,
              "y": 0,
              "z": 600
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_40",
          "points": [
            {
              "x": 600,
              "y": 0,
              "z": 520
            },
            {
              "x": 600,
              "y": 0,
              "z": 508.57
            },
            {
              "x": 600,
              "y": 0,
              "z": 497.14
            },
            {
              "x": 600,
              "y": 0,
              "z": 485.71
            },
            {
              "x": 600,
              "y": 0,
              "z": 474.29
            },
            {
              "x": 600,
              "y": 0,
              "z": 462.86
            },
            {
              "x": 600,
              "y": 0.04,
              "z": 451.43
            },
            {
              "x": 600,
              "y": 0.15,
              "z": 440
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_41",
          "points": [
            {
              "x": 440,
              "y": 10.43,
              "z": 520
            },
            {
              "x": 440,
              "y": 7.3,
              "z": 531.43
            },
            {
              "x": 440,
              "y": 4.62,
              "z": 542.86
            },
            {
              "x": 440,
              "y": 2.45,
              "z": 554.29
            },
            {
              "x": 440,
              "y": 0.91,
              "z": 565.71
            },
            {
              "x": 440,
              "y": 0.1,
              "z": 577.14
            },
            {
              "x": 440,
              "y": 0,
              "z": 588.57
            },
            {
              "x": 440,
              "y": 0,
              "z": 600
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_42",
          "points": [
            {
              "x": 520,
              "y": 16.54,
              "z": 440
            },
            {
              "x": 508.57,
              "y": 19.82,
              "z": 440
            },
            {
              "x": 497.14,
              "y": 23,
              "z": 440
            },
            {
              "x": 485.71,
              "y": 26.05,
              "z": 440
            },
            {
              "x": 474.29,
              "y": 28.91,
              "z": 440
            },
            {
              "x": 462.86,
              "y": 31.47,
              "z": 440
            },
            {
              "x": 451.43,
              "y": 33.63,
              "z": 440
            },
            {
              "x": 440,
              "y": 35.28,
              "z": 440
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_43",
          "points": [
            {
              "x": 584,
              "y": 0,
              "z": 520
            },
            {
              "x": 584,
              "y": 0,
              "z": 530.67
            },
            {
              "x": 584,
              "y": 0,
              "z": 541.33
            },
            {
              "x": 584,
              "y": 0,
              "z": 552
            },
            {
              "x": 584,
              "y": 0,
              "z": 562.67
            },
            {
              "x": 584,
              "y": 0,
              "z": 573.33
            },
            {
              "x": 584,
              "y": 0,
              "z": 584
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_44",
          "points": [
            {
              "x": 584,
              "y": 0,
              "z": 520
            },
            {
              "x": 584,
              "y": 0,
              "z": 509.33
            },
            {
              "x": 584,
              "y": 0,
              "z": 498.67
            },
            {
              "x": 584,
              "y": 0.05,
              "z": 488
            },
            {
              "x": 584,
              "y": 0.25,
              "z": 477.33
            },
            {
              "x": 584,
              "y": 0.58,
              "z": 466.67
            },
            {
              "x": 584,
              "y": 0.96,
              "z": 456
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_45",
          "points": [
            {
              "x": 456,
              "y": 9.58,
              "z": 520
            },
            {
              "x": 456,
              "y": 6.83,
              "z": 530.67
            },
            {
              "x": 456,
              "y": 4.43,
              "z": 541.33
            },
            {
              "x": 456,
              "y": 2.46,
              "z": 552
            },
            {
              "x": 456,
              "y": 1.01,
              "z": 562.67
            },
            {
              "x": 456,
              "y": 0.17,
              "z": 573.33
            },
            {
              "x": 456,
              "y": 0,
              "z": 584
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_46",
          "points": [
            {
              "x": -60.56,
              "y": 3.33,
              "z": 520
            },
            {
              "x": -72.56,
              "y": 2.3,
              "z": 520
            },
            {
              "x": -84.56,
              "y": 1.4,
              "z": 520
            },
            {
              "x": -96.56,
              "y": 0.69,
              "z": 520
            },
            {
              "x": -108.56,
              "y": 0.21,
              "z": 520
            },
            {
              "x": -120.56,
              "y": 0,
              "z": 520
            },
            {
              "x": -132.56,
              "y": 0,
              "z": 520
            },
            {
              "x": -144.56,
              "y": 0.01,
              "z": 520
            },
            {
              "x": -156.56,
              "y": 0.14,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gc_47",
          "points": [
            {
              "x": 424,
              "y": 10.87,
              "z": 520
            },
            {
              "x": 436,
              "y": 10.58,
              "z": 520
            },
            {
              "x": 448,
              "y": 10.05,
              "z": 520
            },
            {
              "x": 460,
              "y": 9.3,
              "z": 520
            },
            {
              "x": 472,
              "y": 8.3,
              "z": 520
            },
            {
              "x": 484,
              "y": 7.09,
              "z": 520
            },
            {
              "x": 496,
              "y": 5.74,
              "z": 520
            },
            {
              "x": 508,
              "y": 4.35,
              "z": 520
            },
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 520,
              "y": 1.48,
              "z": 532
            },
            {
              "x": 520,
              "y": 0.44,
              "z": 544
            },
            {
              "x": 520,
              "y": 0.01,
              "z": 556
            },
            {
              "x": 520,
              "y": 0,
              "z": 568
            },
            {
              "x": 520,
              "y": 0,
              "z": 580
            },
            {
              "x": 520,
              "y": 0,
              "z": 592
            },
            {
              "x": 520,
              "y": 0,
              "z": 604
            },
            {
              "x": 520,
              "y": 0,
              "z": 616
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gc_48",
          "points": [
            {
              "x": 424,
              "y": 10.87,
              "z": 520
            },
            {
              "x": 436,
              "y": 10.58,
              "z": 520
            },
            {
              "x": 448,
              "y": 10.05,
              "z": 520
            },
            {
              "x": 460,
              "y": 9.3,
              "z": 520
            },
            {
              "x": 472,
              "y": 8.3,
              "z": 520
            },
            {
              "x": 484,
              "y": 7.09,
              "z": 520
            },
            {
              "x": 496,
              "y": 5.74,
              "z": 520
            },
            {
              "x": 508,
              "y": 4.35,
              "z": 520
            },
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 520,
              "y": 1.54,
              "z": 531.43
            },
            {
              "x": 520,
              "y": 0.52,
              "z": 542.86
            },
            {
              "x": 520,
              "y": 0.03,
              "z": 554.29
            },
            {
              "x": 520,
              "y": 0,
              "z": 565.71
            },
            {
              "x": 520,
              "y": 0,
              "z": 577.14
            },
            {
              "x": 520,
              "y": 0,
              "z": 588.57
            },
            {
              "x": 520,
              "y": 0,
              "z": 600
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gc_49",
          "points": [
            {
              "x": 424,
              "y": 10.87,
              "z": 520
            },
            {
              "x": 436,
              "y": 10.58,
              "z": 520
            },
            {
              "x": 448,
              "y": 10.05,
              "z": 520
            },
            {
              "x": 460,
              "y": 9.3,
              "z": 520
            },
            {
              "x": 472,
              "y": 8.3,
              "z": 520
            },
            {
              "x": 484,
              "y": 7.09,
              "z": 520
            },
            {
              "x": 496,
              "y": 5.74,
              "z": 520
            },
            {
              "x": 508,
              "y": 4.35,
              "z": 520
            },
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 520,
              "y": 4.76,
              "z": 508.57
            },
            {
              "x": 520,
              "y": 6.74,
              "z": 497.14
            },
            {
              "x": 520,
              "y": 8.85,
              "z": 485.71
            },
            {
              "x": 520,
              "y": 10.97,
              "z": 474.29
            },
            {
              "x": 520,
              "y": 13.02,
              "z": 462.86
            },
            {
              "x": 520,
              "y": 14.9,
              "z": 451.43
            },
            {
              "x": 520,
              "y": 16.54,
              "z": 440
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gc_50",
          "points": [
            {
              "x": 424,
              "y": 10.87,
              "z": 520
            },
            {
              "x": 436,
              "y": 10.58,
              "z": 520
            },
            {
              "x": 448,
              "y": 10.05,
              "z": 520
            },
            {
              "x": 460,
              "y": 9.3,
              "z": 520
            },
            {
              "x": 472,
              "y": 8.3,
              "z": 520
            },
            {
              "x": 484,
              "y": 7.09,
              "z": 520
            },
            {
              "x": 496,
              "y": 5.74,
              "z": 520
            },
            {
              "x": 508,
              "y": 4.35,
              "z": 520
            },
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 520,
              "y": 1.62,
              "z": 530.67
            },
            {
              "x": 520,
              "y": 0.62,
              "z": 541.33
            },
            {
              "x": 520,
              "y": 0.08,
              "z": 552
            },
            {
              "x": 520,
              "y": 0,
              "z": 562.67
            },
            {
              "x": 520,
              "y": 0,
              "z": 573.33
            },
            {
              "x": 520,
              "y": 0,
              "z": 584
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gc_51",
          "points": [
            {
              "x": 424,
              "y": 10.87,
              "z": 520
            },
            {
              "x": 436,
              "y": 10.58,
              "z": 520
            },
            {
              "x": 448,
              "y": 10.05,
              "z": 520
            },
            {
              "x": 460,
              "y": 9.3,
              "z": 520
            },
            {
              "x": 472,
              "y": 8.3,
              "z": 520
            },
            {
              "x": 484,
              "y": 7.09,
              "z": 520
            },
            {
              "x": 496,
              "y": 5.74,
              "z": 520
            },
            {
              "x": 508,
              "y": 4.35,
              "z": 520
            },
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 520,
              "y": 4.63,
              "z": 509.33
            },
            {
              "x": 520,
              "y": 6.47,
              "z": 498.67
            },
            {
              "x": 520,
              "y": 8.42,
              "z": 488
            },
            {
              "x": 520,
              "y": 10.41,
              "z": 477.33
            },
            {
              "x": 520,
              "y": 12.35,
              "z": 466.67
            },
            {
              "x": 520,
              "y": 14.17,
              "z": 456
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gc_52",
          "points": [
            {
              "x": 424,
              "y": 10.87,
              "z": 520
            },
            {
              "x": 436,
              "y": 10.58,
              "z": 520
            },
            {
              "x": 448,
              "y": 10.05,
              "z": 520
            },
            {
              "x": 460,
              "y": 9.3,
              "z": 520
            },
            {
              "x": 472,
              "y": 8.3,
              "z": 520
            },
            {
              "x": 484,
              "y": 7.09,
              "z": 520
            },
            {
              "x": 496,
              "y": 5.74,
              "z": 520
            },
            {
              "x": 508,
              "y": 4.35,
              "z": 520
            },
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 520,
              "y": 1.48,
              "z": 532
            },
            {
              "x": 520,
              "y": 0.44,
              "z": 544
            },
            {
              "x": 520,
              "y": 0.01,
              "z": 556
            },
            {
              "x": 520,
              "y": 0,
              "z": 568
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gc_53",
          "points": [
            {
              "x": 424,
              "y": 10.87,
              "z": 520
            },
            {
              "x": 436,
              "y": 10.58,
              "z": 520
            },
            {
              "x": 448,
              "y": 10.05,
              "z": 520
            },
            {
              "x": 460,
              "y": 9.3,
              "z": 520
            },
            {
              "x": 472,
              "y": 8.3,
              "z": 520
            },
            {
              "x": 484,
              "y": 7.09,
              "z": 520
            },
            {
              "x": 496,
              "y": 5.74,
              "z": 520
            },
            {
              "x": 508,
              "y": 4.35,
              "z": 520
            },
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 520,
              "y": 4.85,
              "z": 508
            },
            {
              "x": 520,
              "y": 6.95,
              "z": 496
            },
            {
              "x": 520,
              "y": 9.17,
              "z": 484
            },
            {
              "x": 520,
              "y": 11.39,
              "z": 472
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gc_54",
          "points": [
            {
              "x": 424,
              "y": 10.87,
              "z": 520
            },
            {
              "x": 436,
              "y": 10.58,
              "z": 520
            },
            {
              "x": 448,
              "y": 10.05,
              "z": 520
            },
            {
              "x": 460,
              "y": 9.3,
              "z": 520
            },
            {
              "x": 472,
              "y": 8.3,
              "z": 520
            },
            {
              "x": 484,
              "y": 7.09,
              "z": 520
            },
            {
              "x": 496,
              "y": 5.74,
              "z": 520
            },
            {
              "x": 508,
              "y": 4.35,
              "z": 520
            },
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 520,
              "y": 1.7,
              "z": 530
            },
            {
              "x": 520,
              "y": 0.73,
              "z": 540
            },
            {
              "x": 520,
              "y": 0.14,
              "z": 550
            },
            {
              "x": 520,
              "y": 0,
              "z": 560
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gc_55",
          "points": [
            {
              "x": 424,
              "y": 10.87,
              "z": 520
            },
            {
              "x": 436,
              "y": 10.58,
              "z": 520
            },
            {
              "x": 448,
              "y": 10.05,
              "z": 520
            },
            {
              "x": 460,
              "y": 9.3,
              "z": 520
            },
            {
              "x": 472,
              "y": 8.3,
              "z": 520
            },
            {
              "x": 484,
              "y": 7.09,
              "z": 520
            },
            {
              "x": 496,
              "y": 5.74,
              "z": 520
            },
            {
              "x": 508,
              "y": 4.35,
              "z": 520
            },
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 520,
              "y": 4.52,
              "z": 510
            },
            {
              "x": 520,
              "y": 6.23,
              "z": 500
            },
            {
              "x": 520,
              "y": 8.05,
              "z": 490
            },
            {
              "x": 520,
              "y": 9.91,
              "z": 480
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gc_56",
          "points": [
            {
              "x": 424,
              "y": 10.87,
              "z": 520
            },
            {
              "x": 416,
              "y": 10.93,
              "z": 520
            },
            {
              "x": 408,
              "y": 10.87,
              "z": 520
            },
            {
              "x": 408,
              "y": 7.62,
              "z": 531.2
            },
            {
              "x": 408,
              "y": 4.81,
              "z": 542.4
            },
            {
              "x": 408,
              "y": 2.55,
              "z": 553.6
            },
            {
              "x": 408,
              "y": 0.96,
              "z": 564.8
            },
            {
              "x": 408,
              "y": 0.12,
              "z": 576
            },
            {
              "x": 408,
              "y": 0,
              "z": 587.2
            },
            {
              "x": 408,
              "y": 0,
              "z": 598.4
            },
            {
              "x": 408,
              "y": 0,
              "z": 609.6
            },
            {
              "x": 408,
              "y": 0,
              "z": 620.8
            },
            {
              "x": 408,
              "y": 0,
              "z": 632
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gc_57",
          "points": [
            {
              "x": 424,
              "y": 10.87,
              "z": 520
            },
            {
              "x": 432,
              "y": 10.7,
              "z": 520
            },
            {
              "x": 440,
              "y": 10.43,
              "z": 520
            },
            {
              "x": 440,
              "y": 7.3,
              "z": 531.43
            },
            {
              "x": 440,
              "y": 4.62,
              "z": 542.86
            },
            {
              "x": 440,
              "y": 2.45,
              "z": 554.29
            },
            {
              "x": 440,
              "y": 0.91,
              "z": 565.71
            },
            {
              "x": 440,
              "y": 0.1,
              "z": 577.14
            },
            {
              "x": 440,
              "y": 0,
              "z": 588.57
            },
            {
              "x": 440,
              "y": 0,
              "z": 600
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gc_58",
          "points": [
            {
              "x": 424,
              "y": 10.87,
              "z": 520
            },
            {
              "x": 436,
              "y": 10.58,
              "z": 520
            },
            {
              "x": 448,
              "y": 10.05,
              "z": 520
            },
            {
              "x": 460,
              "y": 9.3,
              "z": 520
            },
            {
              "x": 472,
              "y": 8.3,
              "z": 520
            },
            {
              "x": 484,
              "y": 7.09,
              "z": 520
            },
            {
              "x": 496,
              "y": 5.74,
              "z": 520
            },
            {
              "x": 508,
              "y": 4.35,
              "z": 520
            },
            {
              "x": 520,
              "y": 2.99,
              "z": 520
            },
            {
              "x": 520,
              "y": 4.85,
              "z": 508
            },
            {
              "x": 520,
              "y": 6.95,
              "z": 496
            },
            {
              "x": 520,
              "y": 9.17,
              "z": 484
            },
            {
              "x": 520,
              "y": 11.39,
              "z": 472
            },
            {
              "x": 520,
              "y": 13.51,
              "z": 460
            },
            {
              "x": 520,
              "y": 15.42,
              "z": 448
            },
            {
              "x": 520,
              "y": 17.05,
              "z": 436
            },
            {
              "x": 520,
              "y": 18.3,
              "z": 424
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gc_59",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": 616
            },
            {
              "x": 531.43,
              "y": 0,
              "z": 616
            },
            {
              "x": 542.86,
              "y": 0,
              "z": 616
            },
            {
              "x": 554.29,
              "y": 0,
              "z": 616
            },
            {
              "x": 565.71,
              "y": 0,
              "z": 616
            },
            {
              "x": 577.14,
              "y": 0,
              "z": 616
            },
            {
              "x": 588.57,
              "y": 0,
              "z": 616
            },
            {
              "x": 600,
              "y": 0,
              "z": 616
            },
            {
              "x": 600,
              "y": 0,
              "z": 604
            },
            {
              "x": 600,
              "y": 0,
              "z": 592
            },
            {
              "x": 600,
              "y": 0,
              "z": 580
            },
            {
              "x": 600,
              "y": 0,
              "z": 568
            },
            {
              "x": 600,
              "y": 0,
              "z": 556
            },
            {
              "x": 600,
              "y": 0,
              "z": 544
            },
            {
              "x": 600,
              "y": 0,
              "z": 532
            },
            {
              "x": 600,
              "y": 0,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gc_60",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": 616
            },
            {
              "x": 508.57,
              "y": 0,
              "z": 616
            },
            {
              "x": 497.14,
              "y": 0,
              "z": 616
            },
            {
              "x": 485.71,
              "y": 0,
              "z": 616
            },
            {
              "x": 474.29,
              "y": 0,
              "z": 616
            },
            {
              "x": 462.86,
              "y": 0,
              "z": 616
            },
            {
              "x": 451.43,
              "y": 0,
              "z": 616
            },
            {
              "x": 440,
              "y": 0,
              "z": 616
            },
            {
              "x": 440,
              "y": 0,
              "z": 604
            },
            {
              "x": 440,
              "y": 0,
              "z": 592
            },
            {
              "x": 440,
              "y": 0.02,
              "z": 580
            },
            {
              "x": 440,
              "y": 0.68,
              "z": 568
            },
            {
              "x": 440,
              "y": 2.18,
              "z": 556
            },
            {
              "x": 440,
              "y": 4.37,
              "z": 544
            },
            {
              "x": 440,
              "y": 7.15,
              "z": 532
            },
            {
              "x": 440,
              "y": 10.43,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gc_61",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": 616
            },
            {
              "x": 530.67,
              "y": 0,
              "z": 616
            },
            {
              "x": 541.33,
              "y": 0,
              "z": 616
            },
            {
              "x": 552,
              "y": 0,
              "z": 616
            },
            {
              "x": 562.67,
              "y": 0,
              "z": 616
            },
            {
              "x": 573.33,
              "y": 0,
              "z": 616
            },
            {
              "x": 584,
              "y": 0,
              "z": 616
            },
            {
              "x": 584,
              "y": 0,
              "z": 604
            },
            {
              "x": 584,
              "y": 0,
              "z": 592
            },
            {
              "x": 584,
              "y": 0,
              "z": 580
            },
            {
              "x": 584,
              "y": 0,
              "z": 568
            },
            {
              "x": 584,
              "y": 0,
              "z": 556
            },
            {
              "x": 584,
              "y": 0,
              "z": 544
            },
            {
              "x": 584,
              "y": 0,
              "z": 532
            },
            {
              "x": 584,
              "y": 0,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gc_62",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": 616
            },
            {
              "x": 509.33,
              "y": 0,
              "z": 616
            },
            {
              "x": 498.67,
              "y": 0,
              "z": 616
            },
            {
              "x": 488,
              "y": 0,
              "z": 616
            },
            {
              "x": 477.33,
              "y": 0,
              "z": 616
            },
            {
              "x": 466.67,
              "y": 0,
              "z": 616
            },
            {
              "x": 456,
              "y": 0,
              "z": 616
            },
            {
              "x": 456,
              "y": 0,
              "z": 604
            },
            {
              "x": 456,
              "y": 0,
              "z": 592
            },
            {
              "x": 456,
              "y": 0,
              "z": 580
            },
            {
              "x": 456,
              "y": 0.51,
              "z": 568
            },
            {
              "x": 456,
              "y": 1.85,
              "z": 556
            },
            {
              "x": 456,
              "y": 3.89,
              "z": 544
            },
            {
              "x": 456,
              "y": 6.51,
              "z": 532
            },
            {
              "x": 456,
              "y": 9.58,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gc_63",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": 616
            },
            {
              "x": 532,
              "y": 0,
              "z": 616
            },
            {
              "x": 544,
              "y": 0,
              "z": 616
            },
            {
              "x": 556,
              "y": 0,
              "z": 616
            },
            {
              "x": 568,
              "y": 0,
              "z": 616
            },
            {
              "x": 568,
              "y": 0,
              "z": 604
            },
            {
              "x": 568,
              "y": 0,
              "z": 592
            },
            {
              "x": 568,
              "y": 0,
              "z": 580
            },
            {
              "x": 568,
              "y": 0,
              "z": 568
            },
            {
              "x": 568,
              "y": 0,
              "z": 556
            },
            {
              "x": 568,
              "y": 0,
              "z": 544
            },
            {
              "x": 568,
              "y": 0,
              "z": 532
            },
            {
              "x": 568,
              "y": 0,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gc_64",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": 616
            },
            {
              "x": 508,
              "y": 0,
              "z": 616
            },
            {
              "x": 496,
              "y": 0,
              "z": 616
            },
            {
              "x": 484,
              "y": 0,
              "z": 616
            },
            {
              "x": 472,
              "y": 0,
              "z": 616
            },
            {
              "x": 472,
              "y": 0,
              "z": 604
            },
            {
              "x": 472,
              "y": 0,
              "z": 592
            },
            {
              "x": 472,
              "y": 0,
              "z": 580
            },
            {
              "x": 472,
              "y": 0.27,
              "z": 568
            },
            {
              "x": 472,
              "y": 1.35,
              "z": 556
            },
            {
              "x": 472,
              "y": 3.13,
              "z": 544
            },
            {
              "x": 472,
              "y": 5.49,
              "z": 532
            },
            {
              "x": 472,
              "y": 8.3,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gc_65",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": 616
            },
            {
              "x": 530,
              "y": 0,
              "z": 616
            },
            {
              "x": 540,
              "y": 0,
              "z": 616
            },
            {
              "x": 550,
              "y": 0,
              "z": 616
            },
            {
              "x": 560,
              "y": 0,
              "z": 616
            },
            {
              "x": 560,
              "y": 0,
              "z": 604
            },
            {
              "x": 560,
              "y": 0,
              "z": 592
            },
            {
              "x": 560,
              "y": 0,
              "z": 580
            },
            {
              "x": 560,
              "y": 0,
              "z": 568
            },
            {
              "x": 560,
              "y": 0,
              "z": 556
            },
            {
              "x": 560,
              "y": 0,
              "z": 544
            },
            {
              "x": 560,
              "y": 0,
              "z": 532
            },
            {
              "x": 560,
              "y": 0.06,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gc_66",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": 616
            },
            {
              "x": 510,
              "y": 0,
              "z": 616
            },
            {
              "x": 500,
              "y": 0,
              "z": 616
            },
            {
              "x": 490,
              "y": 0,
              "z": 616
            },
            {
              "x": 480,
              "y": 0,
              "z": 616
            },
            {
              "x": 480,
              "y": 0,
              "z": 604
            },
            {
              "x": 480,
              "y": 0,
              "z": 592
            },
            {
              "x": 480,
              "y": 0,
              "z": 580
            },
            {
              "x": 480,
              "y": 0.15,
              "z": 568
            },
            {
              "x": 480,
              "y": 1.06,
              "z": 556
            },
            {
              "x": 480,
              "y": 2.67,
              "z": 544
            },
            {
              "x": 480,
              "y": 4.87,
              "z": 532
            },
            {
              "x": 480,
              "y": 7.51,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gc_67",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": 616
            },
            {
              "x": 531.2,
              "y": 0,
              "z": 616
            },
            {
              "x": 542.4,
              "y": 0,
              "z": 616
            },
            {
              "x": 553.6,
              "y": 0,
              "z": 616
            },
            {
              "x": 564.8,
              "y": 0,
              "z": 616
            },
            {
              "x": 576,
              "y": 0,
              "z": 616
            },
            {
              "x": 587.2,
              "y": 0,
              "z": 616
            },
            {
              "x": 598.4,
              "y": 0,
              "z": 616
            },
            {
              "x": 609.6,
              "y": 0,
              "z": 616
            },
            {
              "x": 620.8,
              "y": 0,
              "z": 616
            },
            {
              "x": 632,
              "y": 0,
              "z": 616
            },
            {
              "x": 632,
              "y": 0,
              "z": 624
            },
            {
              "x": 632,
              "y": 0,
              "z": 632
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gc_68",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": 616
            },
            {
              "x": 508.8,
              "y": 0,
              "z": 616
            },
            {
              "x": 497.6,
              "y": 0,
              "z": 616
            },
            {
              "x": 486.4,
              "y": 0,
              "z": 616
            },
            {
              "x": 475.2,
              "y": 0,
              "z": 616
            },
            {
              "x": 464,
              "y": 0,
              "z": 616
            },
            {
              "x": 452.8,
              "y": 0,
              "z": 616
            },
            {
              "x": 441.6,
              "y": 0,
              "z": 616
            },
            {
              "x": 430.4,
              "y": 0,
              "z": 616
            },
            {
              "x": 419.2,
              "y": 0,
              "z": 616
            },
            {
              "x": 408,
              "y": 0,
              "z": 616
            },
            {
              "x": 408,
              "y": 0,
              "z": 624
            },
            {
              "x": 408,
              "y": 0,
              "z": 632
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gc_69",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": 616
            },
            {
              "x": 532,
              "y": 0,
              "z": 616
            },
            {
              "x": 544,
              "y": 0,
              "z": 616
            },
            {
              "x": 556,
              "y": 0,
              "z": 616
            },
            {
              "x": 568,
              "y": 0,
              "z": 616
            },
            {
              "x": 580,
              "y": 0,
              "z": 616
            },
            {
              "x": 592,
              "y": 0,
              "z": 616
            },
            {
              "x": 604,
              "y": 0,
              "z": 616
            },
            {
              "x": 616,
              "y": 0,
              "z": 616
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gc_70",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": 616
            },
            {
              "x": 508,
              "y": 0,
              "z": 616
            },
            {
              "x": 496,
              "y": 0,
              "z": 616
            },
            {
              "x": 484,
              "y": 0,
              "z": 616
            },
            {
              "x": 472,
              "y": 0,
              "z": 616
            },
            {
              "x": 460,
              "y": 0,
              "z": 616
            },
            {
              "x": 448,
              "y": 0,
              "z": 616
            },
            {
              "x": 436,
              "y": 0,
              "z": 616
            },
            {
              "x": 424,
              "y": 0,
              "z": 616
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_71",
          "points": [
            {
              "x": -520,
              "y": 0,
              "z": -520
            },
            {
              "x": -532,
              "y": 0,
              "z": -520
            },
            {
              "x": -544,
              "y": 0,
              "z": -520
            },
            {
              "x": -556,
              "y": 0,
              "z": -520
            },
            {
              "x": -568,
              "y": 0,
              "z": -520
            },
            {
              "x": -580,
              "y": 0,
              "z": -520
            },
            {
              "x": -592,
              "y": 0,
              "z": -520
            },
            {
              "x": -604,
              "y": 0,
              "z": -520
            },
            {
              "x": -616,
              "y": 0,
              "z": -520
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_72",
          "points": [
            {
              "x": -520,
              "y": 0,
              "z": -520
            },
            {
              "x": -520,
              "y": 0,
              "z": -532
            },
            {
              "x": -520,
              "y": 0,
              "z": -544
            },
            {
              "x": -520,
              "y": 0,
              "z": -556
            },
            {
              "x": -520,
              "y": 0,
              "z": -568
            },
            {
              "x": -520,
              "y": 0,
              "z": -580
            },
            {
              "x": -520,
              "y": 0,
              "z": -592
            },
            {
              "x": -520,
              "y": 0,
              "z": -604
            },
            {
              "x": -520,
              "y": 0,
              "z": -616
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_73",
          "points": [
            {
              "x": 520,
              "y": 19.29,
              "z": 408
            },
            {
              "x": 520,
              "y": 19.48,
              "z": 396.57
            },
            {
              "x": 520,
              "y": 19.22,
              "z": 385.14
            },
            {
              "x": 520,
              "y": 18.54,
              "z": 373.71
            },
            {
              "x": 520,
              "y": 17.45,
              "z": 362.29
            },
            {
              "x": 520,
              "y": 16.01,
              "z": 350.86
            },
            {
              "x": 520,
              "y": 14.28,
              "z": 339.43
            },
            {
              "x": 520,
              "y": 12.33,
              "z": 328
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_74",
          "points": [
            {
              "x": 520,
              "y": 12.33,
              "z": 328
            },
            {
              "x": 520,
              "y": 10.24,
              "z": 316.57
            },
            {
              "x": 520,
              "y": 8.11,
              "z": 305.14
            },
            {
              "x": 520,
              "y": 6.04,
              "z": 293.71
            },
            {
              "x": 520,
              "y": 4.12,
              "z": 282.29
            },
            {
              "x": 520,
              "y": 2.45,
              "z": 270.86
            },
            {
              "x": 520,
              "y": 1.13,
              "z": 259.43
            },
            {
              "x": 520,
              "y": 0.28,
              "z": 248
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_75",
          "points": [
            {
              "x": 520,
              "y": 0.28,
              "z": 248
            },
            {
              "x": 520,
              "y": 0,
              "z": 236.57
            },
            {
              "x": 520,
              "y": 0,
              "z": 225.14
            },
            {
              "x": 520,
              "y": 0,
              "z": 213.71
            },
            {
              "x": 520,
              "y": 0,
              "z": 202.29
            },
            {
              "x": 520,
              "y": 0,
              "z": 190.86
            },
            {
              "x": 520,
              "y": 0,
              "z": 179.43
            },
            {
              "x": 520,
              "y": 0,
              "z": 168
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_76",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": 168
            },
            {
              "x": 520,
              "y": 0,
              "z": 156.57
            },
            {
              "x": 520,
              "y": 0,
              "z": 145.14
            },
            {
              "x": 520,
              "y": 0,
              "z": 133.71
            },
            {
              "x": 520,
              "y": 0,
              "z": 122.29
            },
            {
              "x": 520,
              "y": 0,
              "z": 110.86
            },
            {
              "x": 520,
              "y": 0,
              "z": 99.43
            },
            {
              "x": 520,
              "y": 0,
              "z": 88
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_77",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": 28
            },
            {
              "x": 520,
              "y": 0,
              "z": 76.57
            },
            {
              "x": 520,
              "y": 0,
              "z": 65.14
            },
            {
              "x": 520,
              "y": 0,
              "z": 53.71
            },
            {
              "x": 520,
              "y": 0,
              "z": 42.29
            },
            {
              "x": 520,
              "y": 0,
              "z": 30.86
            },
            {
              "x": 520,
              "y": 0,
              "z": 28
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_78",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": 8
            },
            {
              "x": 508.57,
              "y": 0,
              "z": 8
            },
            {
              "x": 497.14,
              "y": 0,
              "z": 8
            },
            {
              "x": 485.71,
              "y": 0,
              "z": 8
            },
            {
              "x": 474.29,
              "y": 0,
              "z": 8
            },
            {
              "x": 462.86,
              "y": 0,
              "z": 8
            },
            {
              "x": 451.43,
              "y": 0,
              "z": 8
            },
            {
              "x": 440,
              "y": 0,
              "z": 8
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_79",
          "points": [
            {
              "x": 440,
              "y": 0,
              "z": 8
            },
            {
              "x": 428.57,
              "y": 0,
              "z": 8
            },
            {
              "x": 417.14,
              "y": 0,
              "z": 8
            },
            {
              "x": 405.71,
              "y": 0,
              "z": 8
            },
            {
              "x": 394.29,
              "y": 0,
              "z": 8
            },
            {
              "x": 382.86,
              "y": 0,
              "z": 8
            },
            {
              "x": 371.43,
              "y": 0,
              "z": 8
            },
            {
              "x": 360,
              "y": 0,
              "z": 8
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_81",
          "points": [
            {
              "x": 280,
              "y": 0.02,
              "z": 8
            },
            {
              "x": 280,
              "y": 0.11,
              "z": -2.67
            },
            {
              "x": 280,
              "y": 0.25,
              "z": -13.33
            },
            {
              "x": 280,
              "y": 0.42,
              "z": -24
            },
            {
              "x": 280,
              "y": 0.62,
              "z": -34.67
            },
            {
              "x": 280,
              "y": 0.81,
              "z": -45.33
            },
            {
              "x": 280,
              "y": 0.99,
              "z": -56
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_82",
          "points": [
            {
              "x": 280,
              "y": 0.99,
              "z": -56
            },
            {
              "x": 269.33,
              "y": 1.95,
              "z": -56
            },
            {
              "x": 258.67,
              "y": 3.17,
              "z": -56
            },
            {
              "x": 248,
              "y": 4.63,
              "z": -56
            },
            {
              "x": 237.33,
              "y": 6.3,
              "z": -56
            },
            {
              "x": 226.67,
              "y": 8.14,
              "z": -56
            },
            {
              "x": 216,
              "y": 10.13,
              "z": -56
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_83",
          "points": [
            {
              "x": 216,
              "y": 10.13,
              "z": -56
            },
            {
              "x": 216,
              "y": 10.71,
              "z": -67.43
            },
            {
              "x": 216,
              "y": 11.16,
              "z": -78.86
            },
            {
              "x": 216,
              "y": 11.45,
              "z": -90.29
            },
            {
              "x": 216,
              "y": 11.57,
              "z": -101.71
            },
            {
              "x": 216,
              "y": 11.54,
              "z": -113.14
            },
            {
              "x": 216,
              "y": 11.34,
              "z": -124.57
            },
            {
              "x": 216,
              "y": 10.98,
              "z": -136
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_84",
          "points": [
            {
              "x": 216,
              "y": 9.29,
              "z": -196
            },
            {
              "x": 216,
              "y": 10.47,
              "z": -147.43
            },
            {
              "x": 216,
              "y": 9.94,
              "z": -158.86
            },
            {
              "x": 216,
              "y": 9.57,
              "z": -170.29
            },
            {
              "x": 216,
              "y": 9.35,
              "z": -181.71
            },
            {
              "x": 216,
              "y": 9.27,
              "z": -193.14
            },
            {
              "x": 216,
              "y": 9.29,
              "z": -196
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_85",
          "points": [
            {
              "x": 216,
              "y": 10.17,
              "z": -235.99
            },
            {
              "x": 216,
              "y": 10.28,
              "z": -238.86
            },
            {
              "x": 216,
              "y": 10.86,
              "z": -250.29
            },
            {
              "x": 216,
              "y": 11.57,
              "z": -261.71
            },
            {
              "x": 216,
              "y": 12.42,
              "z": -273.14
            },
            {
              "x": 216,
              "y": 13.42,
              "z": -284.57
            },
            {
              "x": 216,
              "y": 10.17,
              "z": -235.99
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_86",
          "points": [
            {
              "x": 216,
              "y": 14.57,
              "z": -296
            },
            {
              "x": 216,
              "y": 15.78,
              "z": -306.67
            },
            {
              "x": 216,
              "y": 16.96,
              "z": -317.33
            },
            {
              "x": 216,
              "y": 18.02,
              "z": -328
            },
            {
              "x": 216,
              "y": 18.96,
              "z": -338.67
            },
            {
              "x": 216,
              "y": 19.74,
              "z": -349.33
            },
            {
              "x": 216,
              "y": 20.37,
              "z": -360
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_87",
          "points": [
            {
              "x": 216,
              "y": 21.12,
              "z": -388
            },
            {
              "x": 216,
              "y": 20.86,
              "z": -372
            },
            {
              "x": 216,
              "y": 21.11,
              "z": -384
            },
            {
              "x": 216,
              "y": 21.12,
              "z": -388
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_88",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": -12
            },
            {
              "x": 520,
              "y": 0,
              "z": -13.33
            },
            {
              "x": 520,
              "y": 0,
              "z": -24
            },
            {
              "x": 520,
              "y": 0,
              "z": -34.67
            },
            {
              "x": 520,
              "y": 0,
              "z": -45.33
            },
            {
              "x": 520,
              "y": 0,
              "z": -12
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_89",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": -56
            },
            {
              "x": 520,
              "y": 0,
              "z": -68
            },
            {
              "x": 520,
              "y": 0,
              "z": -80
            },
            {
              "x": 520,
              "y": 0,
              "z": -92
            },
            {
              "x": 520,
              "y": 0,
              "z": -104
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_90",
          "points": [
            {
              "x": -404,
              "y": 0,
              "z": -424
            },
            {
              "x": -401.14,
              "y": 0,
              "z": -424
            },
            {
              "x": -389.71,
              "y": 0.26,
              "z": -424
            },
            {
              "x": -378.29,
              "y": 0.98,
              "z": -424
            },
            {
              "x": -366.86,
              "y": 2.09,
              "z": -424
            },
            {
              "x": -355.43,
              "y": 3.56,
              "z": -424
            },
            {
              "x": -404,
              "y": 0,
              "z": -424
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_91",
          "points": [
            {
              "x": -344,
              "y": 5.32,
              "z": -424
            },
            {
              "x": -344,
              "y": 5.75,
              "z": -412.57
            },
            {
              "x": -344,
              "y": 6.07,
              "z": -401.14
            },
            {
              "x": -344,
              "y": 6.27,
              "z": -389.71
            },
            {
              "x": -344,
              "y": 6.33,
              "z": -378.29
            },
            {
              "x": -344,
              "y": 6.26,
              "z": -366.86
            },
            {
              "x": -344,
              "y": 6.07,
              "z": -355.43
            },
            {
              "x": -344,
              "y": 5.75,
              "z": -344
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_92",
          "points": [
            {
              "x": -344,
              "y": 5.75,
              "z": -344
            },
            {
              "x": -332.57,
              "y": 7.85,
              "z": -344
            },
            {
              "x": -321.14,
              "y": 10.16,
              "z": -344
            },
            {
              "x": -309.71,
              "y": 12.62,
              "z": -344
            },
            {
              "x": -298.29,
              "y": 15.2,
              "z": -344
            },
            {
              "x": -286.86,
              "y": 17.83,
              "z": -344
            },
            {
              "x": -275.43,
              "y": 20.47,
              "z": -344
            },
            {
              "x": -264,
              "y": 23.07,
              "z": -344
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_93",
          "points": [
            {
              "x": -264,
              "y": 23.07,
              "z": -344
            },
            {
              "x": -264,
              "y": 22.14,
              "z": -333.33
            },
            {
              "x": -264,
              "y": 21,
              "z": -322.67
            },
            {
              "x": -264,
              "y": 19.67,
              "z": -312
            },
            {
              "x": -264,
              "y": 18.18,
              "z": -301.33
            },
            {
              "x": -264,
              "y": 16.56,
              "z": -290.67
            },
            {
              "x": -264,
              "y": 14.85,
              "z": -280
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_94",
          "points": [
            {
              "x": -264,
              "y": 14.85,
              "z": -280
            },
            {
              "x": -264,
              "y": 13.08,
              "z": -269.33
            },
            {
              "x": -264,
              "y": 11.28,
              "z": -258.67
            },
            {
              "x": -264,
              "y": 9.49,
              "z": -248
            },
            {
              "x": -264,
              "y": 7.74,
              "z": -237.33
            },
            {
              "x": -264,
              "y": 6.08,
              "z": -226.67
            },
            {
              "x": -264,
              "y": 4.55,
              "z": -216
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_95",
          "points": [
            {
              "x": -156.56,
              "y": 0.14,
              "z": 520
            },
            {
              "x": -156.56,
              "y": 0.19,
              "z": 508.57
            },
            {
              "x": -156.56,
              "y": 0.24,
              "z": 497.14
            },
            {
              "x": -156.56,
              "y": 0.28,
              "z": 485.71
            },
            {
              "x": -156.56,
              "y": 0.31,
              "z": 474.29
            },
            {
              "x": -156.56,
              "y": 0.33,
              "z": 462.86
            },
            {
              "x": -156.56,
              "y": 0.34,
              "z": 451.43
            },
            {
              "x": -156.56,
              "y": 0.33,
              "z": 440
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_96",
          "points": [
            {
              "x": -156.56,
              "y": 0.33,
              "z": 440
            },
            {
              "x": -156.56,
              "y": 0.3,
              "z": 428.57
            },
            {
              "x": -156.56,
              "y": 0.27,
              "z": 417.14
            },
            {
              "x": -156.56,
              "y": 0.23,
              "z": 405.71
            },
            {
              "x": -156.56,
              "y": 0.18,
              "z": 394.29
            },
            {
              "x": -156.56,
              "y": 0.12,
              "z": 382.86
            },
            {
              "x": -156.56,
              "y": 0.15,
              "z": 371.43
            },
            {
              "x": -156.56,
              "y": 1.08,
              "z": 360
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_97",
          "points": [
            {
              "x": -156.56,
              "y": 1.08,
              "z": 360
            },
            {
              "x": -156.56,
              "y": 2.81,
              "z": 349.33
            },
            {
              "x": -156.56,
              "y": 5.14,
              "z": 338.67
            },
            {
              "x": -156.56,
              "y": 7.85,
              "z": 328
            },
            {
              "x": -156.56,
              "y": 10.69,
              "z": 317.33
            },
            {
              "x": -156.56,
              "y": 13.47,
              "z": 306.67
            },
            {
              "x": -156.56,
              "y": 15.97,
              "z": 296
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_98",
          "points": [
            {
              "x": -156.56,
              "y": 15.97,
              "z": 296
            },
            {
              "x": -156.56,
              "y": 18.24,
              "z": 284
            },
            {
              "x": -156.56,
              "y": 19.7,
              "z": 272
            },
            {
              "x": -156.56,
              "y": 20.21,
              "z": 260
            },
            {
              "x": -156.56,
              "y": 19.72,
              "z": 248
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_99",
          "points": [
            {
              "x": 280,
              "y": 0.02,
              "z": 8
            },
            {
              "x": 280,
              "y": 0,
              "z": 18.67
            },
            {
              "x": 280,
              "y": 0,
              "z": 29.33
            },
            {
              "x": 280,
              "y": 0.05,
              "z": 40
            },
            {
              "x": 280,
              "y": 0.23,
              "z": 50.67
            },
            {
              "x": 280,
              "y": 0.52,
              "z": 61.33
            },
            {
              "x": 280,
              "y": 0.91,
              "z": 72
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_100",
          "points": [
            {
              "x": 280,
              "y": 0.91,
              "z": 72
            },
            {
              "x": 269.33,
              "y": 1.03,
              "z": 72
            },
            {
              "x": 258.67,
              "y": 1.14,
              "z": 72
            },
            {
              "x": 248,
              "y": 1.23,
              "z": 72
            },
            {
              "x": 237.33,
              "y": 1.31,
              "z": 72
            },
            {
              "x": 226.67,
              "y": 1.5,
              "z": 72
            },
            {
              "x": 216,
              "y": 1.85,
              "z": 72
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_101",
          "points": [
            {
              "x": -264,
              "y": 23.07,
              "z": -344
            },
            {
              "x": -264,
              "y": 23.77,
              "z": -354.67
            },
            {
              "x": -264,
              "y": 24.22,
              "z": -365.33
            },
            {
              "x": -264,
              "y": 24.41,
              "z": -376
            },
            {
              "x": -264,
              "y": 24.34,
              "z": -386.67
            },
            {
              "x": -264,
              "y": 24,
              "z": -397.33
            },
            {
              "x": -264,
              "y": 23.41,
              "z": -408
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_102",
          "points": [
            {
              "x": -264,
              "y": 23.41,
              "z": -408
            },
            {
              "x": -252,
              "y": 26.08,
              "z": -408
            },
            {
              "x": -240,
              "y": 28.59,
              "z": -408
            },
            {
              "x": -228,
              "y": 30.9,
              "z": -408
            },
            {
              "x": -216,
              "y": 32.94,
              "z": -408
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_103",
          "points": [
            {
              "x": 216,
              "y": 20.91,
              "z": -408
            },
            {
              "x": 227.43,
              "y": 23,
              "z": -408
            },
            {
              "x": 238.86,
              "y": 25,
              "z": -408
            },
            {
              "x": 250.29,
              "y": 26.87,
              "z": -408
            },
            {
              "x": 261.71,
              "y": 28.58,
              "z": -408
            },
            {
              "x": 273.14,
              "y": 30.11,
              "z": -408
            },
            {
              "x": 284.57,
              "y": 31.41,
              "z": -408
            },
            {
              "x": 296,
              "y": 32.47,
              "z": -408
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_104",
          "points": [
            {
              "x": 296,
              "y": 32.47,
              "z": -408
            },
            {
              "x": 307.43,
              "y": 33.23,
              "z": -408
            },
            {
              "x": 318.86,
              "y": 33.68,
              "z": -408
            },
            {
              "x": 330.29,
              "y": 33.79,
              "z": -408
            },
            {
              "x": 341.71,
              "y": 33.55,
              "z": -408
            },
            {
              "x": 353.14,
              "y": 32.97,
              "z": -408
            },
            {
              "x": 364.57,
              "y": 32.1,
              "z": -408
            },
            {
              "x": 376,
              "y": 30.94,
              "z": -408
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_105",
          "points": [
            {
              "x": 376,
              "y": 30.94,
              "z": -408
            },
            {
              "x": 386.67,
              "y": 29.65,
              "z": -408
            },
            {
              "x": 397.33,
              "y": 28.17,
              "z": -408
            },
            {
              "x": 408,
              "y": 26.54,
              "z": -408
            },
            {
              "x": 418.67,
              "y": 24.77,
              "z": -408
            },
            {
              "x": 429.33,
              "y": 22.9,
              "z": -408
            },
            {
              "x": 440,
              "y": 20.95,
              "z": -408
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_106",
          "points": [
            {
              "x": 440,
              "y": 20.95,
              "z": -408
            },
            {
              "x": 450.67,
              "y": 18.94,
              "z": -408
            },
            {
              "x": 461.33,
              "y": 16.91,
              "z": -408
            },
            {
              "x": 472,
              "y": 14.88,
              "z": -408
            },
            {
              "x": 482.67,
              "y": 12.88,
              "z": -408
            },
            {
              "x": 493.33,
              "y": 10.92,
              "z": -408
            },
            {
              "x": 504,
              "y": 9.05,
              "z": -408
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_107",
          "points": [
            {
              "x": 504,
              "y": 9.05,
              "z": -408
            },
            {
              "x": 504,
              "y": 8.82,
              "z": -418.67
            },
            {
              "x": 504,
              "y": 8.48,
              "z": -429.33
            },
            {
              "x": 504,
              "y": 8.05,
              "z": -440
            },
            {
              "x": 504,
              "y": 7.54,
              "z": -450.67
            },
            {
              "x": 504,
              "y": 6.94,
              "z": -461.33
            },
            {
              "x": 504,
              "y": 6.28,
              "z": -472
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_108",
          "points": [
            {
              "x": 216,
              "y": 9.52,
              "z": -216
            },
            {
              "x": 204,
              "y": 10.31,
              "z": -216
            },
            {
              "x": 192,
              "y": 11.24,
              "z": -216
            },
            {
              "x": 180,
              "y": 12.29,
              "z": -216
            },
            {
              "x": 168,
              "y": 13.44,
              "z": -216
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_109",
          "points": [
            {
              "x": 216,
              "y": 10.13,
              "z": -56
            },
            {
              "x": 204,
              "y": 12.48,
              "z": -56
            },
            {
              "x": 192,
              "y": 14.93,
              "z": -56
            },
            {
              "x": 180,
              "y": 17.42,
              "z": -56
            },
            {
              "x": 168,
              "y": 19.9,
              "z": -56
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_110",
          "points": [
            {
              "x": 168,
              "y": 13.44,
              "z": -216
            },
            {
              "x": 156,
              "y": 14.69,
              "z": -216
            },
            {
              "x": 144,
              "y": 16.03,
              "z": -216
            },
            {
              "x": 132,
              "y": 17.45,
              "z": -216
            },
            {
              "x": 120,
              "y": 18.91,
              "z": -216
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_111",
          "points": [
            {
              "x": 216,
              "y": 20.01,
              "z": -427.98
            },
            {
              "x": 216,
              "y": 19.94,
              "z": -429.33
            },
            {
              "x": 216,
              "y": 19.21,
              "z": -440
            },
            {
              "x": 216,
              "y": 18.31,
              "z": -450.67
            },
            {
              "x": 216,
              "y": 17.28,
              "z": -461.33
            },
            {
              "x": 216,
              "y": 20.01,
              "z": -427.98
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_112",
          "points": [
            {
              "x": 216,
              "y": 20.91,
              "z": -408
            },
            {
              "x": 204,
              "y": 18.65,
              "z": -408
            },
            {
              "x": 192,
              "y": 16.37,
              "z": -408
            },
            {
              "x": 180,
              "y": 14.09,
              "z": -408
            },
            {
              "x": 168,
              "y": 11.86,
              "z": -408
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_113",
          "points": [
            {
              "x": 168,
              "y": 11.86,
              "z": -408
            },
            {
              "x": 157.33,
              "y": 9.94,
              "z": -408
            },
            {
              "x": 146.67,
              "y": 8.12,
              "z": -408
            },
            {
              "x": 136,
              "y": 6.41,
              "z": -408
            },
            {
              "x": 125.33,
              "y": 4.85,
              "z": -408
            },
            {
              "x": 114.67,
              "y": 3.46,
              "z": -408
            },
            {
              "x": 104,
              "y": 2.27,
              "z": -408
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_114",
          "points": [
            {
              "x": 216,
              "y": 16.14,
              "z": -472
            },
            {
              "x": 216,
              "y": 14.73,
              "z": -484
            },
            {
              "x": 216,
              "y": 13.22,
              "z": -496
            },
            {
              "x": 216,
              "y": 11.65,
              "z": -508
            },
            {
              "x": 216,
              "y": 10.05,
              "z": -520
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_115",
          "points": [
            {
              "x": 376,
              "y": 30.94,
              "z": -408
            },
            {
              "x": 376,
              "y": 31.24,
              "z": -397.33
            },
            {
              "x": 376,
              "y": 31.27,
              "z": -386.67
            },
            {
              "x": 376,
              "y": 31.03,
              "z": -376
            },
            {
              "x": 376,
              "y": 30.52,
              "z": -365.33
            },
            {
              "x": 376,
              "y": 29.78,
              "z": -354.67
            },
            {
              "x": 376,
              "y": 28.8,
              "z": -344
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gb_116",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": -104
            },
            {
              "x": 520,
              "y": 0,
              "z": -114.67
            },
            {
              "x": 520,
              "y": 0,
              "z": -125.33
            },
            {
              "x": 520,
              "y": 0,
              "z": -136
            },
            {
              "x": 520,
              "y": 0,
              "z": -146.67
            },
            {
              "x": 520,
              "y": 0,
              "z": -157.33
            },
            {
              "x": 520,
              "y": 0,
              "z": -168
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_jc_tr_gn_53_a",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": 8
            },
            {
              "x": 520,
              "y": 0,
              "z": 19.43
            },
            {
              "x": 520,
              "y": 0,
              "z": 28
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_jc_tr_gn_53_b",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": 8
            },
            {
              "x": 520,
              "y": 0,
              "z": -2.67
            },
            {
              "x": 520,
              "y": 0,
              "z": -12
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_jc_tr_gn_60_a",
          "points": [
            {
              "x": 216,
              "y": 9.52,
              "z": -216
            },
            {
              "x": 216,
              "y": 9.33,
              "z": -204.57
            },
            {
              "x": 216,
              "y": 9.29,
              "z": -196
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_jc_tr_gn_60_b",
          "points": [
            {
              "x": 216,
              "y": 9.52,
              "z": -216
            },
            {
              "x": 216,
              "y": 9.83,
              "z": -227.43
            },
            {
              "x": 216,
              "y": 10.17,
              "z": -235.99
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_jc_tr_gn_63_a",
          "points": [
            {
              "x": 216,
              "y": 20.91,
              "z": -408
            },
            {
              "x": 216,
              "y": 21.13,
              "z": -396
            },
            {
              "x": 216,
              "y": 21.12,
              "z": -388
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_jc_tr_gn_63_b",
          "points": [
            {
              "x": 216,
              "y": 20.91,
              "z": -408
            },
            {
              "x": 216,
              "y": 20.52,
              "z": -418.67
            },
            {
              "x": 216,
              "y": 20.01,
              "z": -427.98
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_jc_tr_spc1_n_a",
          "points": [
            {
              "x": -424,
              "y": 0,
              "z": -424
            },
            {
              "x": -436,
              "y": 0,
              "z": -424
            },
            {
              "x": -444,
              "y": 0,
              "z": -424
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_jc_tr_spc1_n_b",
          "points": [
            {
              "x": -424,
              "y": 0,
              "z": -424
            },
            {
              "x": -412.57,
              "y": 0,
              "z": -424
            },
            {
              "x": -404,
              "y": 0,
              "z": -424
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_ta_1_1",
          "points": [
            {
              "x": 408,
              "y": 42.49,
              "z": 408
            },
            {
              "x": 398,
              "y": 41.88,
              "z": 408
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_ta_1_2",
          "points": [
            {
              "x": 398,
              "y": 41.88,
              "z": 408
            },
            {
              "x": 398,
              "y": 40.96,
              "z": 416
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_ta_1_3",
          "points": [
            {
              "x": 398,
              "y": 41.88,
              "z": 408
            },
            {
              "x": 398,
              "y": 42.42,
              "z": 400
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_rb_360_360_1",
          "points": [
            {
              "x": 336,
              "y": 26.71,
              "z": 336
            },
            {
              "x": 384,
              "y": 33.175,
              "z": 336
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_rb_360_360_2",
          "points": [
            {
              "x": 384,
              "y": 33.175,
              "z": 336
            },
            {
              "x": 384,
              "y": 40.828,
              "z": 384
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_rb_360_360_3",
          "points": [
            {
              "x": 384,
              "y": 40.828,
              "z": 384
            },
            {
              "x": 336,
              "y": 31.464,
              "z": 384
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_rb_360_360_4",
          "points": [
            {
              "x": 336,
              "y": 31.464,
              "z": 384
            },
            {
              "x": 336,
              "y": 26.71,
              "z": 336
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_rbc_360_360",
          "points": [
            {
              "x": 384,
              "y": 40.828,
              "z": 384
            },
            {
              "x": 398,
              "y": 42.33,
              "z": 384
            },
            {
              "x": 398,
              "y": 42.42,
              "z": 400
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_1",
          "points": [
            {
              "x": -156.56,
              "y": 1.08,
              "z": 360
            },
            {
              "x": -156.56,
              "y": 2.64,
              "z": 350.22
            },
            {
              "x": -156.56,
              "y": 4.72,
              "z": 340.45
            },
            {
              "x": -156.56,
              "y": 7.15,
              "z": 330.67
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_1_2",
          "points": [
            {
              "x": -156.56,
              "y": 7.15,
              "z": 330.67
            },
            {
              "x": -168.56,
              "y": 9.34,
              "z": 330.67
            },
            {
              "x": -180.56,
              "y": 11.29,
              "z": 330.67
            },
            {
              "x": -192.56,
              "y": 12.8,
              "z": 330.67
            },
            {
              "x": -204.56,
              "y": 13.72,
              "z": 330.67
            },
            {
              "x": -216.56,
              "y": 13.97,
              "z": 330.67
            },
            {
              "x": -228.56,
              "y": 13.54,
              "z": 330.67
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_3",
          "points": [
            {
              "x": 280,
              "y": 0.91,
              "z": 72
            },
            {
              "x": 292,
              "y": 0.76,
              "z": 72
            },
            {
              "x": 304,
              "y": 0.61,
              "z": 72
            },
            {
              "x": 316,
              "y": 0.46,
              "z": 72
            },
            {
              "x": 328,
              "y": 0.32,
              "z": 72
            },
            {
              "x": 340,
              "y": 0.19,
              "z": 72
            },
            {
              "x": 352,
              "y": 0.09,
              "z": 72
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_3_2",
          "points": [
            {
              "x": 352,
              "y": 0.09,
              "z": 72
            },
            {
              "x": 352,
              "y": 0.3,
              "z": 84
            },
            {
              "x": 352,
              "y": 0.62,
              "z": 96
            },
            {
              "x": 352,
              "y": 1.03,
              "z": 108
            },
            {
              "x": 352,
              "y": 1.52,
              "z": 120
            },
            {
              "x": 352,
              "y": 2.08,
              "z": 132
            },
            {
              "x": 352,
              "y": 2.7,
              "z": 144
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_5",
          "points": [
            {
              "x": -264,
              "y": 4.55,
              "z": -216
            },
            {
              "x": -257.72,
              "y": 5.08,
              "z": -216
            },
            {
              "x": -251.43,
              "y": 5.61,
              "z": -216
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_5_2",
          "points": [
            {
              "x": -251.43,
              "y": 5.61,
              "z": -216
            },
            {
              "x": -251.43,
              "y": 4.04,
              "z": -204
            },
            {
              "x": -251.43,
              "y": 3.24,
              "z": -192
            },
            {
              "x": -251.43,
              "y": 3.18,
              "z": -180
            },
            {
              "x": -251.43,
              "y": 3.85,
              "z": -168
            },
            {
              "x": -251.43,
              "y": 5.2,
              "z": -156
            },
            {
              "x": -251.43,
              "y": 7.11,
              "z": -144
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_7",
          "points": [
            {
              "x": -251.43,
              "y": 7.11,
              "z": -144
            },
            {
              "x": -239.43,
              "y": 7.53,
              "z": -144
            },
            {
              "x": -227.43,
              "y": 7.72,
              "z": -144
            },
            {
              "x": -215.43,
              "y": 7.67,
              "z": -144
            },
            {
              "x": -203.43,
              "y": 7.4,
              "z": -144
            },
            {
              "x": -191.43,
              "y": 7.12,
              "z": -144
            },
            {
              "x": -179.43,
              "y": 7.07,
              "z": -144
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_7_2",
          "points": [
            {
              "x": -179.43,
              "y": 7.07,
              "z": -144
            },
            {
              "x": -179.43,
              "y": 8.93,
              "z": -132
            },
            {
              "x": -179.43,
              "y": 10.9,
              "z": -120
            },
            {
              "x": -179.43,
              "y": 12.76,
              "z": -108
            },
            {
              "x": -179.43,
              "y": 14.43,
              "z": -96
            },
            {
              "x": -179.43,
              "y": 15.83,
              "z": -84
            },
            {
              "x": -179.43,
              "y": 16.89,
              "z": -72
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_9",
          "points": [
            {
              "x": -179.43,
              "y": 16.89,
              "z": -72
            },
            {
              "x": -191.43,
              "y": 17.61,
              "z": -72
            },
            {
              "x": -203.43,
              "y": 18.41,
              "z": -72
            },
            {
              "x": -215.43,
              "y": 19.01,
              "z": -72
            },
            {
              "x": -227.43,
              "y": 19.13,
              "z": -72
            },
            {
              "x": -239.43,
              "y": 18.76,
              "z": -72
            },
            {
              "x": -251.43,
              "y": 17.92,
              "z": -72
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_9_2",
          "points": [
            {
              "x": -251.43,
              "y": 17.92,
              "z": -72
            },
            {
              "x": -251.43,
              "y": 18.83,
              "z": -60
            },
            {
              "x": -251.43,
              "y": 19.28,
              "z": -48
            },
            {
              "x": -251.43,
              "y": 19.24,
              "z": -36
            },
            {
              "x": -251.43,
              "y": 18.7,
              "z": -24
            },
            {
              "x": -251.43,
              "y": 17.71,
              "z": -12
            },
            {
              "x": -251.43,
              "y": 16.35,
              "z": 0
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_11",
          "points": [
            {
              "x": -156.56,
              "y": 19.72,
              "z": 248
            },
            {
              "x": -162.56,
              "y": 21.52,
              "z": 248
            },
            {
              "x": -174.56,
              "y": 25.12,
              "z": 248
            },
            {
              "x": -177.56,
              "y": 26.02,
              "z": 248
            },
            {
              "x": -183.56,
              "y": 27.82,
              "z": 248
            },
            {
              "x": -192.56,
              "y": 29.73,
              "z": 248
            },
            {
              "x": -204.56,
              "y": 30.94,
              "z": 248
            },
            {
              "x": -216.56,
              "y": 30.63,
              "z": 248
            },
            {
              "x": -228.56,
              "y": 28.89,
              "z": 248
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_13",
          "points": [
            {
              "x": 216,
              "y": 1.85,
              "z": 72
            },
            {
              "x": 204,
              "y": 2.38,
              "z": 72
            },
            {
              "x": 192,
              "y": 3.27,
              "z": 72
            },
            {
              "x": 180,
              "y": 4.78,
              "z": 72
            },
            {
              "x": 168,
              "y": 6.7,
              "z": 72
            },
            {
              "x": 156,
              "y": 8.83,
              "z": 72
            },
            {
              "x": 144,
              "y": 10.98,
              "z": 72
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_13_2",
          "points": [
            {
              "x": 144,
              "y": 10.98,
              "z": 72
            },
            {
              "x": 144,
              "y": 12.28,
              "z": 84
            },
            {
              "x": 144,
              "y": 13.97,
              "z": 96
            },
            {
              "x": 144,
              "y": 15.91,
              "z": 108
            },
            {
              "x": 144,
              "y": 17.96,
              "z": 120
            },
            {
              "x": 144,
              "y": 19.99,
              "z": 132
            },
            {
              "x": 144,
              "y": 21.82,
              "z": 144
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_15",
          "points": [
            {
              "x": 144,
              "y": 21.82,
              "z": 144
            },
            {
              "x": 132,
              "y": 24.18,
              "z": 144
            },
            {
              "x": 120,
              "y": 26.02,
              "z": 144
            },
            {
              "x": 108,
              "y": 27.17,
              "z": 144
            },
            {
              "x": 96,
              "y": 27.47,
              "z": 144
            },
            {
              "x": 84,
              "y": 26.77,
              "z": 144
            },
            {
              "x": 72,
              "y": 25.12,
              "z": 144
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_15_2",
          "points": [
            {
              "x": 72,
              "y": 25.12,
              "z": 144
            },
            {
              "x": 72,
              "y": 26.03,
              "z": 156
            },
            {
              "x": 72,
              "y": 26.17,
              "z": 168
            },
            {
              "x": 72,
              "y": 25.5,
              "z": 180
            },
            {
              "x": 72,
              "y": 24.18,
              "z": 192
            },
            {
              "x": 72,
              "y": 22.6,
              "z": 204
            },
            {
              "x": 72,
              "y": 21.1,
              "z": 216
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_17",
          "points": [
            {
              "x": 72,
              "y": 21.1,
              "z": 216
            },
            {
              "x": 62.55,
              "y": 19.49,
              "z": 216
            },
            {
              "x": 53.09,
              "y": 17.58,
              "z": 216
            },
            {
              "x": 43.64,
              "y": 15.44,
              "z": 216
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_17_2",
          "points": [
            {
              "x": 43.64,
              "y": 15.44,
              "z": 216
            },
            {
              "x": 43.64,
              "y": 14.56,
              "z": 228
            },
            {
              "x": 43.64,
              "y": 14.03,
              "z": 240
            },
            {
              "x": 43.64,
              "y": 14.01,
              "z": 252
            },
            {
              "x": 43.64,
              "y": 14.61,
              "z": 264
            },
            {
              "x": 43.64,
              "y": 15.97,
              "z": 276
            },
            {
              "x": 43.64,
              "y": 18.07,
              "z": 288
            }
          ],
          "shoulder": 1,
          "width": 8
        }
      ]
    },
    "spawn": {
      "x": -520,
      "z": -520
    },
    "stream": {
      "aheadMax": 1200,
      "aheadMin": 200,
      "budgetMs": 120,
      "chunk": 256,
      "keep": 2,
      "overlap": 1.175
    },
    "units": "meters",
    "windows": {
      "spacing": 12
    }
  },
  "name": "Глава 16. Районы города (v4, pilot)",
  "sky": {
    "fog": {
      "color": 14230008,
      "far": 900,
      "near": 120
    },
    "hemi": {
      "ground": 5527871,
      "intensity": 1,
      "sky": 13613055
    },
    "sky": 12575732,
    "sun": {
      "color": 16771932,
      "intensity": 2.2,
      "position": [
        -200,
        260,
        -140
      ]
    }
  }
};
LEVEL_16.map.skeleton = decodeSkeleton(await loadSkel());
