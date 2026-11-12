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
          "props": 15,
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
          "props": 9,
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
          "buildings": 12,
          "props": 7,
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
          "lights": 1,
          "props": 5,
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
          "buildings": 10,
          "props": 4,
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
          "buildings": 3,
          "props": 15,
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
          "props": 5,
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
          "props": 17,
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
          "buildings": 22,
          "props": 19,
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
          "lights": 1,
          "props": 12,
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
          "buildings": 8,
          "channels": 1,
          "props": 15,
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
          "buildings": 10,
          "channels": 1,
          "props": 14
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
          "buildings": 19,
          "channels": 1,
          "props": 11,
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
          "buildings": 17,
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
          "props": 17,
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
          "props": 19,
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
          "buildings": 34,
          "lights": 1,
          "props": 19,
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
          "buildings": 22,
          "props": 17,
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
          "buildings": 33,
          "props": 17,
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
          "props": 34,
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
          "buildings": 34,
          "props": 33,
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
          "buildings": 30,
          "props": 29,
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
          "buildings": 31,
          "props": 16,
          "roads": 13
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
          "buildings": 20,
          "lights": 1,
          "props": 22,
          "roads": 73
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
          "id": "b_district_0_0_6:площадка",
          "maxX": -503.745,
          "maxZ": -590.511,
          "minX": -514.437,
          "minZ": -602.216,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_7:площадка",
          "maxX": -503.992,
          "maxZ": -562.047,
          "minX": -514.189,
          "minZ": -572.498,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_8:площадка",
          "maxX": -589.496,
          "maxZ": -503.696,
          "minX": -603.232,
          "minZ": -514.486,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_9:площадка",
          "maxX": -561.189,
          "maxZ": -503.977,
          "minX": -573.357,
          "minZ": -514.205,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_23:площадка",
          "maxX": -620.709,
          "maxZ": -503.066,
          "minX": -630.2,
          "minZ": -515.115,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_33:площадка",
          "maxX": 506.683,
          "maxZ": -165.862,
          "minX": 501.317,
          "minZ": -170.138,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_34:площадка",
          "maxX": 507.66,
          "maxZ": -149.241,
          "minX": 500.34,
          "minZ": -154.759,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_35:площадка",
          "maxX": 539.123,
          "maxZ": -149.32,
          "minX": 532.877,
          "minZ": -154.68,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_36:площадка",
          "maxX": 507.307,
          "maxZ": -133.618,
          "minX": 500.693,
          "minZ": -138.382,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_37:площадка",
          "maxX": 538.876,
          "maxZ": -133.368,
          "minX": 533.124,
          "minZ": -138.632,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_38:площадка",
          "maxX": 507.511,
          "maxZ": -117.245,
          "minX": 500.489,
          "minZ": -122.755,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_39:площадка",
          "maxX": 506.942,
          "maxZ": -101.697,
          "minX": 501.058,
          "minZ": -106.303,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_40:площадка",
          "maxX": 539.777,
          "maxZ": -101.112,
          "minX": 532.223,
          "minZ": -106.888,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_41:площадка",
          "maxX": 507.021,
          "maxZ": -85.645,
          "minX": 500.979,
          "minZ": -90.355,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_42:площадка",
          "maxX": 507.046,
          "maxZ": -69.004,
          "minX": 500.954,
          "minZ": -74.996,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_43:площадка",
          "maxX": 538.767,
          "maxZ": -69.679,
          "minX": 533.233,
          "minZ": -74.321,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_44:площадка",
          "maxX": 538.577,
          "maxZ": -53.611,
          "minX": 533.423,
          "minZ": -58.389,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_45:площадка",
          "maxX": 507.144,
          "maxZ": -37.039,
          "minX": 500.856,
          "minZ": -42.961,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_46:площадка",
          "maxX": 506.649,
          "maxZ": -21.13,
          "minX": 501.351,
          "minZ": -26.87,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_47:площадка",
          "maxX": 539.102,
          "maxZ": -20.682,
          "minX": 532.898,
          "minZ": -27.318,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_48:площадка",
          "maxX": 363.994,
          "maxZ": -4.584,
          "minX": 356.006,
          "minZ": -11.416,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_49:площадка",
          "maxX": 410.98,
          "maxZ": -4.753,
          "minX": 405.02,
          "minZ": -11.247,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_50:площадка",
          "maxX": 443.497,
          "maxZ": -5.343,
          "minX": 436.503,
          "minZ": -10.657,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_51:площадка",
          "maxX": 459.756,
          "maxZ": -4.596,
          "minX": 452.244,
          "minZ": -11.404,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_52:площадка",
          "maxX": 474.939,
          "maxZ": -4.682,
          "minX": 469.061,
          "minZ": -11.318,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_53:площадка",
          "maxX": 491.493,
          "maxZ": -5.348,
          "minX": 484.507,
          "minZ": -10.652,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_54:площадка",
          "maxX": 507.154,
          "maxZ": -5.619,
          "minX": 500.846,
          "minZ": -10.381,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_55:площадка",
          "maxX": 539.106,
          "maxZ": -5.036,
          "minX": 532.894,
          "minZ": -10.964,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_65:площадка",
          "maxX": -530.581,
          "maxZ": -590.584,
          "minX": -545.782,
          "minZ": -602.143,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_66:площадка",
          "maxX": -590.222,
          "maxZ": -532.125,
          "minX": -602.506,
          "minZ": -544.238,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_67:площадка",
          "maxX": -559.287,
          "maxZ": -530.166,
          "minX": -575.259,
          "minZ": -546.197,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_68:площадка",
          "maxX": -472.925,
          "maxZ": -530.878,
          "minX": -487.075,
          "minZ": -545.486,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_69:площадка",
          "maxX": -445.135,
          "maxZ": -532.791,
          "minX": -456.684,
          "minZ": -543.573,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_70:площадка",
          "maxX": -530.452,
          "maxZ": -444.246,
          "minX": -545.912,
          "minZ": -457.573,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_71:площадка",
          "maxX": -531.448,
          "maxZ": -415.898,
          "minX": -544.916,
          "minZ": -427.738,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_72:площадка",
          "maxX": -531.125,
          "maxZ": -387.001,
          "minX": -545.239,
          "minZ": -398.453,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_73:площадка",
          "maxX": -530.355,
          "maxZ": -356.851,
          "minX": -546.008,
          "minZ": -370.421,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_74:площадка",
          "maxX": -529.401,
          "maxZ": -327.445,
          "minX": -546.963,
          "minZ": -341.646,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_81:площадка",
          "maxX": -414.958,
          "maxZ": -532.098,
          "minX": -428.679,
          "minZ": -544.266,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_82:площадка",
          "maxX": 507.697,
          "maxZ": 36.832,
          "minX": 494.97,
          "minZ": 27.168,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_83:площадка",
          "maxX": 506.064,
          "maxZ": 58.002,
          "minX": 496.603,
          "minZ": 48.665,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_84:площадка",
          "maxX": 506.32,
          "maxZ": 79.946,
          "minX": 496.346,
          "minZ": 69.387,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_85:площадка",
          "maxX": 508.565,
          "maxZ": 142.497,
          "minX": 494.101,
          "minZ": 134.836,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_86:площадка",
          "maxX": 508.049,
          "maxZ": 163.977,
          "minX": 494.618,
          "minZ": 156.023,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_87:площадка",
          "maxX": 508.252,
          "maxZ": 186.98,
          "minX": 494.415,
          "minZ": 175.687,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_88:площадка",
          "maxX": 508.621,
          "maxZ": 208.066,
          "minX": 494.045,
          "minZ": 197.267,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_89:площадка",
          "maxX": 506.558,
          "maxZ": 229.253,
          "minX": 496.108,
          "minZ": 218.747,
          "y": 0.046
        },
        {
          "blend": 14,
          "id": "b_district_2_1_95:площадка",
          "maxX": 315.823,
          "maxZ": -7.215,
          "minX": 301.32,
          "minZ": -15.642,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_96:площадка",
          "maxX": -527.093,
          "maxZ": -292.883,
          "minX": -552.907,
          "minZ": -307.117,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_97:площадка",
          "maxX": -526.671,
          "maxZ": -249.333,
          "minX": -553.329,
          "minZ": -270.667,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_98:площадка",
          "maxX": -528.465,
          "maxZ": -171.542,
          "minX": -551.535,
          "minZ": -188.458,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_99:площадка",
          "maxX": -527.967,
          "maxZ": -129.973,
          "minX": -552.033,
          "minZ": -150.027,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_100:площадка",
          "maxX": -528.195,
          "maxZ": -90.385,
          "minX": -551.805,
          "minZ": -109.615,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_101:площадка",
          "maxX": -527.328,
          "maxZ": -51.276,
          "minX": -552.672,
          "minZ": -68.724,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_102:площадка",
          "maxX": -534.932,
          "maxZ": 144.631,
          "minX": -545.068,
          "minZ": 135.369,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_103:площадка",
          "maxX": -534.644,
          "maxZ": 184.022,
          "minX": -545.356,
          "minZ": 175.978,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_106:площадка",
          "maxX": -620.116,
          "maxZ": -531.214,
          "minX": -630.793,
          "minZ": -545.15,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_116:площадка",
          "maxX": 394.672,
          "maxZ": 606.608,
          "minX": 378.661,
          "minZ": 593.392,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_117:площадка",
          "maxX": 395.435,
          "maxZ": 631.418,
          "minX": 377.898,
          "minZ": 621.915,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_132:площадка",
          "maxX": 634.567,
          "maxZ": 393.546,
          "minX": 618.767,
          "minZ": 379.787,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_136:площадка",
          "maxX": 506.627,
          "maxZ": -181.607,
          "minX": 501.373,
          "minZ": -186.393,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_143:площадка",
          "maxX": 336.661,
          "maxZ": 36.479,
          "minX": 324.673,
          "minZ": 27.521,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_144:площадка",
          "maxX": 380.15,
          "maxZ": 36.798,
          "minX": 366.517,
          "minZ": 27.202,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_145:площадка",
          "maxX": 398.725,
          "maxZ": 36.838,
          "minX": 390.609,
          "minZ": 27.162,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_146:площадка",
          "maxX": 423.191,
          "maxZ": 35.938,
          "minX": 408.809,
          "minZ": 28.062,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_147:площадка",
          "maxX": 548.9,
          "maxZ": 35.766,
          "minX": 539.1,
          "minZ": 28.234,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_148:площадка",
          "maxX": 550.419,
          "maxZ": 99.632,
          "minX": 537.581,
          "minZ": 92.368,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_149:площадка",
          "maxX": 548.295,
          "maxZ": 143.3,
          "minX": 539.705,
          "minZ": 134.033,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_150:площадка",
          "maxX": 552.167,
          "maxZ": 207.626,
          "minX": 535.833,
          "minZ": 197.707,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_151:площадка",
          "maxX": 548.751,
          "maxZ": 249.703,
          "minX": 539.249,
          "minZ": 240.964,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_159:площадка",
          "maxX": -133.339,
          "maxZ": 549.157,
          "minX": -143.994,
          "minZ": 538.843,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_185:площадка",
          "maxX": 380.75,
          "maxZ": 56.937,
          "minX": 365.917,
          "minZ": 49.729,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_1_187:площадка",
          "maxX": 315.801,
          "maxZ": -29.35,
          "minX": 301.341,
          "minZ": -39.222,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_203:площадка",
          "maxX": 522.743,
          "maxZ": -197.249,
          "minX": 517.257,
          "minZ": -202.751,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_204:площадка",
          "maxX": 491.493,
          "maxZ": -165.281,
          "minX": 484.507,
          "minZ": -170.719,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_205:площадка",
          "maxX": 554.855,
          "maxZ": -166,
          "minX": 549.145,
          "minZ": -170,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_206:площадка",
          "maxX": 491.532,
          "maxZ": -133.254,
          "minX": 484.468,
          "minZ": -138.746,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_207:площадка",
          "maxX": 554.543,
          "maxZ": -133.564,
          "minX": 549.457,
          "minZ": -138.436,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_208:площадка",
          "maxX": 362.556,
          "maxZ": -21.69,
          "minX": 357.444,
          "minZ": -26.31,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_209:площадка",
          "maxX": 394.88,
          "maxZ": -21.782,
          "minX": 389.12,
          "minZ": -26.218,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_210:площадка",
          "maxX": 491.102,
          "maxZ": -20.638,
          "minX": 484.898,
          "minZ": -27.362,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_221:площадка",
          "maxX": 539.115,
          "maxZ": -197.564,
          "minX": 532.885,
          "minZ": -202.436,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_223:площадка",
          "maxX": -385.631,
          "maxZ": -531.115,
          "minX": -399.823,
          "minZ": -545.249,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_227:площадка",
          "maxX": -474.303,
          "maxZ": -591.012,
          "minX": -485.697,
          "minZ": -601.715,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_228:площадка",
          "maxX": -471.356,
          "maxZ": -560.592,
          "minX": -488.644,
          "minZ": -573.954,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_229:площадка",
          "maxX": -589.497,
          "maxZ": -473.562,
          "minX": -603.23,
          "minZ": -486.438,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_230:площадка",
          "maxX": -562.701,
          "maxZ": -473.483,
          "minX": -571.844,
          "minZ": -486.517,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_231:площадка",
          "maxX": 484.525,
          "maxZ": 142.641,
          "minX": 475.475,
          "minZ": 134.693,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_242:площадка",
          "maxX": -619.672,
          "maxZ": -472.838,
          "minX": -631.237,
          "minZ": -487.162,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_244:площадка",
          "maxX": 400.337,
          "maxZ": 79.195,
          "minX": 388.997,
          "minZ": 70.138,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_253:площадка",
          "maxX": 554.249,
          "maxZ": -197.279,
          "minX": 549.751,
          "minZ": -202.721,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_254:площадка",
          "maxX": 571.07,
          "maxZ": 249.497,
          "minX": 559.597,
          "minZ": 241.17,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_263:площадка",
          "maxX": -133.48,
          "maxZ": 569.05,
          "minX": -143.854,
          "minZ": 561.617,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_269:площадка",
          "maxX": -557.637,
          "maxZ": -589.031,
          "minX": -576.909,
          "minZ": -603.696,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_270:площадка",
          "maxX": -560.48,
          "maxZ": -445.563,
          "minX": -574.065,
          "minZ": -456.255,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_271:площадка",
          "maxX": -560.698,
          "maxZ": -415.609,
          "minX": -573.847,
          "minZ": -428.027,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_272:площадка",
          "maxX": -559.845,
          "maxZ": -356.618,
          "minX": -574.7,
          "minZ": -370.654,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_273:площадка",
          "maxX": -560.719,
          "maxZ": -326.197,
          "minX": -573.826,
          "minZ": -342.894,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_277:площадка",
          "maxX": 571.703,
          "maxZ": -164.999,
          "minX": 564.297,
          "minZ": -171.001,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_278:площадка",
          "maxX": 474.826,
          "maxZ": -133.572,
          "minX": 469.174,
          "minZ": -138.428,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_285:площадка",
          "maxX": 570.674,
          "maxZ": -180.242,
          "minX": 565.326,
          "minZ": -187.758,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_303:площадка",
          "maxX": -569.552,
          "maxZ": -207.497,
          "minX": -590.448,
          "minZ": -232.503,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_304:площадка",
          "maxX": -564.271,
          "maxZ": -165.864,
          "minX": -595.729,
          "minZ": -194.136,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_305:площадка",
          "maxX": -565.421,
          "maxZ": -129.881,
          "minX": -594.579,
          "minZ": -150.119,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_306:площадка",
          "maxX": -565.2,
          "maxZ": -88.397,
          "minX": -594.8,
          "minZ": -111.603,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_307:площадка",
          "maxX": -568.371,
          "maxZ": -7.896,
          "minX": -591.629,
          "minZ": -32.104,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_308:площадка",
          "maxX": -575.166,
          "maxZ": 24.004,
          "minX": -584.834,
          "minZ": 15.996,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_309:площадка",
          "maxX": -576.746,
          "maxZ": 103.711,
          "minX": -583.254,
          "minZ": 96.289,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_311:площадка",
          "maxX": 463.111,
          "maxZ": 122.508,
          "minX": 454.223,
          "minZ": 112.159,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_321:площадка",
          "maxX": 587.385,
          "maxZ": -165.097,
          "minX": 580.615,
          "minZ": -170.903,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_322:площадка",
          "maxX": 459.316,
          "maxZ": -68.059,
          "minX": 452.684,
          "minZ": -75.941,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_323:площадка",
          "maxX": 378.539,
          "maxZ": -52.954,
          "minX": 373.461,
          "minZ": -59.046,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_324:площадка",
          "maxX": 586.528,
          "maxZ": -52.962,
          "minX": 581.472,
          "minZ": -59.038,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_325:площадка",
          "maxX": 347.307,
          "maxZ": -68.989,
          "minX": 340.693,
          "minZ": -75.011,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_326:площадка",
          "maxX": 592.036,
          "maxZ": 186.3,
          "minX": 581.297,
          "minZ": 176.366,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_328:площадка",
          "maxX": -151.833,
          "maxZ": 591.539,
          "minX": -168.167,
          "minZ": 581.794,
          "y": 0.004
        },
        {
          "blend": 14,
          "id": "b_district_0_0_332:площадка",
          "maxX": -444.202,
          "maxZ": -619.018,
          "minX": -457.617,
          "minZ": -631.891,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_333:площадка",
          "maxX": -619.58,
          "maxZ": -443.872,
          "minX": -631.329,
          "minZ": -457.946,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_341:площадка",
          "maxX": -589.247,
          "maxZ": -414.636,
          "minX": -603.48,
          "minZ": -429.001,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_342:площадка",
          "maxX": -590.472,
          "maxZ": -387.445,
          "minX": -602.256,
          "minZ": -398.009,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_343:площадка",
          "maxX": -588.192,
          "maxZ": -356.904,
          "minX": -604.536,
          "minZ": -370.369,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_345:площадка",
          "maxX": -357.661,
          "maxZ": -561.815,
          "minX": -369.612,
          "minZ": -572.73,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_347:площадка",
          "maxX": -590.4,
          "maxZ": -620.476,
          "minX": -602.327,
          "minZ": -630.433,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_350:площадка",
          "maxX": 571.613,
          "maxZ": -229.354,
          "minX": 564.387,
          "minZ": -234.646,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_351:площадка",
          "maxX": 603.37,
          "maxZ": -165.592,
          "minX": 596.63,
          "minZ": -170.408,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_360:площадка",
          "maxX": -69.041,
          "maxZ": 612.962,
          "minX": -80.292,
          "minZ": 603.038,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_365:площадка",
          "maxX": 618.66,
          "maxZ": -165.12,
          "minX": 613.34,
          "minZ": -170.88,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_369:площадка",
          "maxX": -356.946,
          "maxZ": -589.255,
          "minX": -370.327,
          "minZ": -603.472,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_370:площадка",
          "maxX": 597.445,
          "maxZ": -361.797,
          "minX": 588.437,
          "minZ": -372.32,
          "y": 0.046
        },
        {
          "blend": 14,
          "id": "b_district_0_1_373:площадка",
          "maxX": -608.144,
          "maxZ": -288.847,
          "minX": -631.856,
          "minZ": -311.153,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_374:площадка",
          "maxX": -610.31,
          "maxZ": -251.637,
          "minX": -629.69,
          "minZ": -268.363,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_375:площадка",
          "maxX": -610.124,
          "maxZ": -209.872,
          "minX": -629.876,
          "minZ": -230.128,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_376:площадка",
          "maxX": -602.5,
          "maxZ": -167.167,
          "minX": -637.5,
          "minZ": -192.833,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_377:площадка",
          "maxX": -605.154,
          "maxZ": -128.101,
          "minX": -634.846,
          "minZ": -151.899,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_378:площадка",
          "maxX": -604.096,
          "maxZ": -86.979,
          "minX": -635.904,
          "minZ": -113.021,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_379:площадка",
          "maxX": -602.512,
          "maxZ": -47.086,
          "minX": -637.488,
          "minZ": -72.914,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_380:площадка",
          "maxX": -602.5,
          "maxZ": -8.761,
          "minX": -637.5,
          "minZ": -31.239,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_381:площадка",
          "maxX": -613.808,
          "maxZ": 65.04,
          "minX": -626.192,
          "minZ": 54.96,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_382:площадка",
          "maxX": -616.339,
          "maxZ": 102.729,
          "minX": -623.661,
          "minZ": 97.271,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_383:площадка",
          "maxX": -615.221,
          "maxZ": 226.045,
          "minX": -624.779,
          "minZ": 213.955,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_384:площадка",
          "maxX": -614.125,
          "maxZ": 264.204,
          "minX": -625.875,
          "minZ": 255.796,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_385:площадка",
          "maxX": -613.794,
          "maxZ": 304.928,
          "minX": -626.206,
          "minZ": 295.072,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_389:площадка",
          "maxX": 633.831,
          "maxZ": 250.264,
          "minX": 624.836,
          "minZ": 240.402,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_395:площадка",
          "maxX": 123.153,
          "maxZ": -564.197,
          "minX": 105.418,
          "minZ": -578.66,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_397:площадка",
          "maxX": 379.53,
          "maxZ": -117.174,
          "minX": 372.47,
          "minZ": -122.826,
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
          "id": "tr_rb_440_360_1",
          "points": [
            {
              "x": 420,
              "y": 34.937,
              "z": 340
            },
            {
              "x": 460,
              "y": 29.641,
              "z": 340
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_rb_440_360_2",
          "points": [
            {
              "x": 460,
              "y": 29.641,
              "z": 340
            },
            {
              "x": 460,
              "y": 36.74,
              "z": 380
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_rb_440_360_3",
          "points": [
            {
              "x": 460,
              "y": 36.74,
              "z": 380
            },
            {
              "x": 420,
              "y": 42.536,
              "z": 380
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_rb_440_360_4",
          "points": [
            {
              "x": 420,
              "y": 42.536,
              "z": 380
            },
            {
              "x": 420,
              "y": 34.937,
              "z": 340
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_rbc_440_360",
          "points": [
            {
              "x": 420,
              "y": 42.536,
              "z": 380
            },
            {
              "x": 398,
              "y": 42.07,
              "z": 380
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
