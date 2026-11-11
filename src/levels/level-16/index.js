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
          "y": 0,
          "yaw": 0,
          "z": -560
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
          "buildings": 14,
          "lights": 1,
          "props": 30,
          "roads": 6
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
          "buildings": 16,
          "props": 24,
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
          "buildings": 34,
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
          "buildings": 48,
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
          "buildings": 81,
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
          "buildings": 4,
          "props": 29
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
          "props": 12
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
        "objects": {},
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
        "objects": {},
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
          "buildings": 4,
          "roads": 2
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
          "buildings": 11,
          "channels": 1,
          "props": 43
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
          "props": 11
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
          "buildings": 8,
          "channels": 1
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
          "buildings": 3,
          "channels": 1
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
          "channels": 1,
          "lights": 2,
          "props": 4,
          "roads": 10
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
          "buildings": 50,
          "props": 84
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
          "buildings": 23,
          "props": 24
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
          "buildings": 9
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
          "buildings": 2
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
          "roads": 1
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
          "buildings": 41,
          "props": 54
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
          "buildings": 39,
          "props": 14
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
          "buildings": 17
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
          "buildings": 3
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
          "lights": 5,
          "roads": 25
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
          "id": "b_district_0_0_1:площадка",
          "maxX": -527.96,
          "maxZ": -607.96,
          "minX": -552.04,
          "minZ": -632.04,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_2:площадка",
          "maxX": -484.547,
          "maxZ": -604.547,
          "minX": -515.453,
          "minZ": -635.453,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_3:площадка",
          "maxX": -527.424,
          "maxZ": -567.424,
          "minX": -552.576,
          "minZ": -592.576,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_4:площадка",
          "maxX": -409.45,
          "maxZ": -569.45,
          "minX": -430.55,
          "minZ": -590.55,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_5:площадка",
          "maxX": -324.516,
          "maxZ": -564.516,
          "minX": -355.484,
          "minZ": -595.484,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_6:площадка",
          "maxX": -608.969,
          "maxZ": -528.969,
          "minX": -631.031,
          "minZ": -551.031,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_7:площадка",
          "maxX": -570.302,
          "maxZ": -530.302,
          "minX": -589.698,
          "minZ": -549.698,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_8:площадка",
          "maxX": -491.481,
          "maxZ": -531.481,
          "minX": -508.519,
          "minZ": -548.519,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_9:площадка",
          "maxX": -367.884,
          "maxZ": -527.884,
          "minX": -392.116,
          "minZ": -552.116,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_10:площадка",
          "maxX": -608.672,
          "maxZ": -488.672,
          "minX": -631.328,
          "minZ": -511.328,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_11:площадка",
          "maxX": -570.035,
          "maxZ": -490.035,
          "minX": -589.965,
          "minZ": -509.965,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_12:площадка",
          "maxX": -604.319,
          "maxZ": -444.319,
          "minX": -635.681,
          "minZ": -475.681,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_13:площадка",
          "maxX": -569.105,
          "maxZ": -409.105,
          "minX": -590.895,
          "minZ": -430.895,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_14:площадка",
          "maxX": -604.99,
          "maxZ": -364.99,
          "minX": -635.01,
          "minZ": -395.01,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_15:площадка",
          "maxX": -527.841,
          "maxZ": -367.841,
          "minX": -552.159,
          "minZ": -392.159,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_18:площадка",
          "maxX": 15.661,
          "maxZ": -624.339,
          "minX": 5.673,
          "minZ": -634.327,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_19:площадка",
          "maxX": 59.78,
          "maxZ": -622.887,
          "minX": 46.887,
          "minZ": -635.78,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_20:площадка",
          "maxX": 80.545,
          "maxZ": -623.455,
          "minX": 68.788,
          "minZ": -635.212,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_21:площадка",
          "maxX": 122.118,
          "maxZ": -624.548,
          "minX": 112.548,
          "minZ": -634.118,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_22:площадка",
          "maxX": 187.305,
          "maxZ": -623.362,
          "minX": 175.362,
          "minZ": -635.305,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_23:площадка",
          "maxX": 123.6,
          "maxZ": -601.733,
          "minX": 111.067,
          "minZ": -614.267,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_28:площадка",
          "maxX": 102.729,
          "maxZ": -579.937,
          "minX": 89.271,
          "minZ": -593.396,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_29:площадка",
          "maxX": 124.415,
          "maxZ": -579.585,
          "minX": 110.252,
          "minZ": -593.748,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_88:площадка",
          "maxX": 487.15,
          "maxZ": -618.304,
          "minX": 472.85,
          "minZ": -632.605,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_89:площадка",
          "maxX": 516.406,
          "maxZ": -618.139,
          "minX": 501.776,
          "minZ": -632.77,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_90:площадка",
          "maxX": 575.502,
          "maxZ": -617.225,
          "minX": 559.044,
          "minZ": -633.684,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_94:площадка",
          "maxX": 517.371,
          "maxZ": -588.084,
          "minX": 500.811,
          "minZ": -604.644,
          "y": 0.03
        },
        {
          "blend": 14,
          "id": "b_district_3_0_95:площадка",
          "maxX": 632.862,
          "maxZ": -588.956,
          "minX": 618.047,
          "minZ": -603.771,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_99:площадка",
          "maxX": 545.1,
          "maxZ": -560.355,
          "minX": 531.264,
          "minZ": -574.191,
          "y": 0.007
        },
        {
          "blend": 14,
          "id": "b_district_3_0_100:площадка",
          "maxX": 575.983,
          "maxZ": -558.562,
          "minX": 558.562,
          "minZ": -575.983,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_105:площадка",
          "maxX": 574.453,
          "maxZ": -531.002,
          "minX": 560.093,
          "minZ": -545.362,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_106:площадка",
          "maxX": 632.761,
          "maxZ": -530.876,
          "minX": 618.148,
          "minZ": -545.488,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_111:площадка",
          "maxX": 632.707,
          "maxZ": -501.838,
          "minX": 618.202,
          "minZ": -516.344,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_127:площадка",
          "maxX": 633.87,
          "maxZ": -413.403,
          "minX": 617.039,
          "minZ": -430.233,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_134:площадка",
          "maxX": 602.864,
          "maxZ": -386.227,
          "minX": 589.863,
          "minZ": -399.228,
          "y": 0.034
        },
        {
          "blend": 14,
          "id": "b_district_3_0_135:площадка",
          "maxX": 633.034,
          "maxZ": -385.148,
          "minX": 617.875,
          "minZ": -400.307,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_146:площадка",
          "maxX": 605.633,
          "maxZ": -325.276,
          "minX": 587.095,
          "minZ": -343.814,
          "y": 0.017
        },
        {
          "blend": 14,
          "id": "b_district_0_1_147:площадка",
          "maxX": -585.766,
          "maxZ": -294.857,
          "minX": -606.962,
          "minZ": -316.053,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_148:площадка",
          "maxX": -559.246,
          "maxZ": -297.428,
          "minX": -575.3,
          "minZ": -313.482,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_149:площадка",
          "maxX": -556.818,
          "maxZ": -265.909,
          "minX": -577.727,
          "minZ": -286.818,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_150:площадка",
          "maxX": -530.459,
          "maxZ": -268.641,
          "minX": -545.905,
          "minZ": -284.087,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_151:площадка",
          "maxX": -586.903,
          "maxZ": -237.812,
          "minX": -605.824,
          "minZ": -256.733,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_152:площадка",
          "maxX": -557.027,
          "maxZ": -237.027,
          "minX": -577.519,
          "minZ": -257.519,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_153:площадка",
          "maxX": -528.705,
          "maxZ": -237.796,
          "minX": -547.659,
          "minZ": -256.75,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_154:площадка",
          "maxX": -557.038,
          "maxZ": -207.947,
          "minX": -577.507,
          "minZ": -228.416,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_155:площадка",
          "maxX": -531.488,
          "maxZ": -211.488,
          "minX": -544.876,
          "minZ": -224.876,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_156:площадка",
          "maxX": -586.979,
          "maxZ": -179.706,
          "minX": -605.749,
          "minZ": -198.476,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_157:площадка",
          "maxX": -558.656,
          "maxZ": -180.474,
          "minX": -575.889,
          "minZ": -197.708,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_158:площадка",
          "maxX": -529.705,
          "maxZ": -151.523,
          "minX": -546.658,
          "minZ": -168.477,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_159:площадка",
          "maxX": -588.101,
          "maxZ": -122.647,
          "minX": -604.626,
          "minZ": -139.171,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_160:площадка",
          "maxX": -558.646,
          "maxZ": -122.282,
          "minX": -575.899,
          "minZ": -139.536,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_161:площадка",
          "maxX": -615.041,
          "maxZ": -91.405,
          "minX": -635.868,
          "minZ": -112.232,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_162:площадка",
          "maxX": -557.887,
          "maxZ": -92.432,
          "minX": -576.659,
          "minZ": -111.204,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_163:площадка",
          "maxX": -527.405,
          "maxZ": -91.041,
          "minX": -548.959,
          "minZ": -112.595,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_164:площадка",
          "maxX": -589.279,
          "maxZ": -65.642,
          "minX": -603.449,
          "minZ": -79.812,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_165:площадка",
          "maxX": -617.925,
          "maxZ": -36.107,
          "minX": -632.984,
          "minZ": -51.165,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_166:площадка",
          "maxX": -588.458,
          "maxZ": -35.731,
          "minX": -604.269,
          "minZ": -51.542,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_167:площадка",
          "maxX": -558.817,
          "maxZ": -35.181,
          "minX": -575.728,
          "minZ": -52.092,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_168:площадка",
          "maxX": -531.29,
          "maxZ": -36.744,
          "minX": -545.074,
          "minZ": -50.528,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_169:площадка",
          "maxX": -616.348,
          "maxZ": -5.439,
          "minX": -634.561,
          "minZ": -23.652,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_170:площадка",
          "maxX": -587.579,
          "maxZ": -5.761,
          "minX": -605.148,
          "minZ": -23.33,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_171:площадка",
          "maxX": -557.64,
          "maxZ": -4.913,
          "minX": -576.905,
          "minZ": -24.178,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_172:площадка",
          "maxX": -529.155,
          "maxZ": -5.518,
          "minX": -547.209,
          "minZ": -23.572,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_201:площадка",
          "maxX": 633.26,
          "maxZ": -239.467,
          "minX": 617.649,
          "minZ": -255.078,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_207:площадка",
          "maxX": 606.483,
          "maxZ": -208.062,
          "minX": 586.244,
          "minZ": -228.301,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_210:площадка",
          "maxX": 548.806,
          "maxZ": -178.466,
          "minX": 527.557,
          "minZ": -199.716,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_211:площадка",
          "maxX": 577.418,
          "maxZ": -178.946,
          "minX": 557.127,
          "minZ": -199.236,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_212:площадка",
          "maxX": 603.587,
          "maxZ": -181.867,
          "minX": 589.14,
          "minZ": -196.314,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_213:площадка",
          "maxX": 634.687,
          "maxZ": -179.858,
          "minX": 616.222,
          "minZ": -198.324,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_217:площадка",
          "maxX": 489.967,
          "maxZ": -150.033,
          "minX": 470.033,
          "minZ": -169.967,
          "y": 0.024
        },
        {
          "blend": 14,
          "id": "b_district_3_1_218:площадка",
          "maxX": 634.042,
          "maxZ": -151.413,
          "minX": 616.867,
          "minZ": -168.587,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_220:площадка",
          "maxX": 431.689,
          "maxZ": -121.038,
          "minX": 411.947,
          "minZ": -140.78,
          "y": 0.012
        },
        {
          "blend": 14,
          "id": "b_district_3_1_221:площадка",
          "maxX": 459.898,
          "maxZ": -121.92,
          "minX": 441.92,
          "minZ": -139.898,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_222:площадка",
          "maxX": 489.456,
          "maxZ": -121.453,
          "minX": 470.544,
          "minZ": -140.365,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_223:площадка",
          "maxX": 519.426,
          "maxZ": -120.574,
          "minX": 498.756,
          "minZ": -141.244,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_224:площадка",
          "maxX": 574.841,
          "maxZ": -123.341,
          "minX": 559.704,
          "minZ": -138.478,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_225:площадка",
          "maxX": 635.984,
          "maxZ": -120.38,
          "minX": 614.925,
          "minZ": -141.439,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_226:площадка",
          "maxX": 344.324,
          "maxZ": -92.039,
          "minX": 324.767,
          "minZ": -111.597,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_227:площадка",
          "maxX": 400.238,
          "maxZ": -94.308,
          "minX": 385.217,
          "minZ": -109.329,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_228:площадка",
          "maxX": 460.835,
          "maxZ": -91.893,
          "minX": 440.983,
          "minZ": -111.744,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_229:площадка",
          "maxX": 517.563,
          "maxZ": -93.346,
          "minX": 500.619,
          "minZ": -110.29,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_230:площадка",
          "maxX": 545.82,
          "maxZ": -94.18,
          "minX": 530.544,
          "minZ": -109.456,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_231:площадка",
          "maxX": 574.979,
          "maxZ": -94.112,
          "minX": 559.566,
          "minZ": -109.525,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_232:площадка",
          "maxX": 605.931,
          "maxZ": -92.251,
          "minX": 586.796,
          "minZ": -111.386,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_233:площадка",
          "maxX": 341.432,
          "maxZ": -65.841,
          "minX": 327.659,
          "minZ": -79.614,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_234:площадка",
          "maxX": 461.112,
          "maxZ": -62.525,
          "minX": 440.706,
          "minZ": -82.93,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_235:площадка",
          "maxX": 489.243,
          "maxZ": -63.484,
          "minX": 470.757,
          "minZ": -81.97,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_236:площадка",
          "maxX": 519.001,
          "maxZ": -62.817,
          "minX": 499.181,
          "minZ": -82.637,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_237:площадка",
          "maxX": 632.22,
          "maxZ": -65.962,
          "minX": 618.689,
          "minZ": -79.492,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_238:площадка",
          "maxX": 341.841,
          "maxZ": -36.341,
          "minX": 327.25,
          "minZ": -50.932,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_239:площадка",
          "maxX": 373.989,
          "maxZ": -4.193,
          "minX": 353.284,
          "minZ": -24.898,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_240:площадка",
          "maxX": -622.499,
          "maxZ": 17.501,
          "minX": -636.168,
          "minZ": 3.832,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_241:площадка",
          "maxX": -601.686,
          "maxZ": 16.98,
          "minX": -614.314,
          "minZ": 4.353,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_242:площадка",
          "maxX": -560.688,
          "maxZ": 15.312,
          "minX": -569.979,
          "minZ": 6.021,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_243:площадка",
          "maxX": -624.705,
          "maxZ": 36.629,
          "minX": -633.962,
          "minZ": 27.371,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_244:площадка",
          "maxX": -601.713,
          "maxZ": 38.287,
          "minX": -614.287,
          "minZ": 25.713,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_245:площадка",
          "maxX": -580.975,
          "maxZ": 37.691,
          "minX": -592.358,
          "minZ": 26.309,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_246:площадка",
          "maxX": -558.744,
          "maxZ": 38.59,
          "minX": -571.923,
          "minZ": 25.41,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_247:площадка",
          "maxX": -623.046,
          "maxZ": 59.621,
          "minX": -635.621,
          "minZ": 47.046,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_248:площадка",
          "maxX": -602.931,
          "maxZ": 58.402,
          "minX": -613.069,
          "minZ": 48.264,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_249:площадка",
          "maxX": -560.841,
          "maxZ": 57.826,
          "minX": -569.826,
          "minZ": 48.841,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_250:площадка",
          "maxX": -539.28,
          "maxZ": 58.053,
          "minX": -548.72,
          "minZ": 48.613,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_251:площадка",
          "maxX": -622.806,
          "maxZ": 81.194,
          "minX": -635.86,
          "minZ": 68.14,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_252:площадка",
          "maxX": -602.695,
          "maxZ": 79.972,
          "minX": -613.305,
          "minZ": 69.362,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_253:площадка",
          "maxX": -581.309,
          "maxZ": 80.024,
          "minX": -592.024,
          "minZ": 69.309,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_254:площадка",
          "maxX": -624.434,
          "maxZ": 100.899,
          "minX": -634.232,
          "minZ": 91.101,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_255:площадка",
          "maxX": -579.445,
          "maxZ": 103.221,
          "minX": -593.888,
          "minZ": 88.779,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_256:площадка",
          "maxX": -560.262,
          "maxZ": 101.072,
          "minX": -570.405,
          "minZ": 90.928,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_257:площадка",
          "maxX": -539.046,
          "maxZ": 100.954,
          "minX": -548.954,
          "minZ": 91.046,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_258:площадка",
          "maxX": -624.813,
          "maxZ": 121.854,
          "minX": -633.854,
          "minZ": 112.813,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_259:площадка",
          "maxX": -558.244,
          "maxZ": 124.422,
          "minX": -572.422,
          "minZ": 110.244,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_260:площадка",
          "maxX": -622.148,
          "maxZ": 145.852,
          "minX": -636.518,
          "minZ": 131.482,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_261:площадка",
          "maxX": -603.095,
          "maxZ": 143.572,
          "minX": -612.905,
          "minZ": 133.761,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_262:площадка",
          "maxX": -559.939,
          "maxZ": 144.061,
          "minX": -570.728,
          "minZ": 133.272,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_263:площадка",
          "maxX": -538.503,
          "maxZ": 144.163,
          "minX": -549.497,
          "minZ": 133.17,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_264:площадка",
          "maxX": -623.42,
          "maxZ": 165.913,
          "minX": -635.246,
          "minZ": 154.087,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_265:площадка",
          "maxX": -559.365,
          "maxZ": 165.968,
          "minX": -571.301,
          "minZ": 154.032,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_266:площадка",
          "maxX": -537.567,
          "maxZ": 166.433,
          "minX": -550.433,
          "minZ": 153.567,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_267:площадка",
          "maxX": -601.297,
          "maxZ": 188.037,
          "minX": -614.703,
          "minZ": 174.63,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_268:площадка",
          "maxX": -579.863,
          "maxZ": 188.137,
          "minX": -593.47,
          "minZ": 174.53,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_269:площадка",
          "maxX": -560.384,
          "maxZ": 186.283,
          "minX": -570.283,
          "minZ": 176.384,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_270:площадка",
          "maxX": -538.823,
          "maxZ": 186.51,
          "minX": -549.177,
          "minZ": 176.157,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_271:площадка",
          "maxX": -581.787,
          "maxZ": 207.547,
          "minX": -591.547,
          "minZ": 197.787,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_272:площадка",
          "maxX": -558.249,
          "maxZ": 209.751,
          "minX": -572.418,
          "minZ": 195.582,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_273:площадка",
          "maxX": -623.163,
          "maxZ": 230.17,
          "minX": -635.503,
          "minZ": 217.83,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_274:площадка",
          "maxX": -558.856,
          "maxZ": 230.477,
          "minX": -571.81,
          "minZ": 217.523,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_275:площадка",
          "maxX": -602.601,
          "maxZ": 250.732,
          "minX": -613.399,
          "minZ": 239.934,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_276:площадка",
          "maxX": -580.075,
          "maxZ": 251.925,
          "minX": -593.258,
          "minZ": 238.742,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_277:площадка",
          "maxX": -559.342,
          "maxZ": 251.324,
          "minX": -571.324,
          "minZ": 239.342,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_279:площадка",
          "maxX": -603.357,
          "maxZ": 271.309,
          "minX": -612.643,
          "minZ": 262.024,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_281:площадка",
          "maxX": -622.203,
          "maxZ": 295.13,
          "minX": -636.463,
          "minZ": 280.87,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_285:площадка",
          "maxX": -624.325,
          "maxZ": 314.342,
          "minX": -634.342,
          "minZ": 304.325,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_292:площадка",
          "maxX": 541.217,
          "maxZ": 175.502,
          "minX": 510.212,
          "minZ": 144.498,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_294:площадка",
          "maxX": 632.834,
          "maxZ": 267.12,
          "minX": 601.452,
          "minZ": 235.737,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_296:площадка",
          "maxX": -629.425,
          "maxZ": 330.575,
          "minX": -634.575,
          "minZ": 325.425,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_301:площадка",
          "maxX": -629.215,
          "maxZ": 346.785,
          "minX": -634.785,
          "minZ": 341.215,
          "y": 0.006
        },
        {
          "blend": 14,
          "id": "b_district_0_3_388:площадка",
          "maxX": -628.513,
          "maxZ": 555.487,
          "minX": -635.487,
          "minZ": 548.513,
          "y": 0.037
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
          "id": "tr_sp1_r",
          "points": [
            {
              "x": -520,
              "y": 0,
              "z": -520
            },
            {
              "x": -508,
              "y": 0,
              "z": -520
            },
            {
              "x": -496,
              "y": 0,
              "z": -520
            },
            {
              "x": -484,
              "y": 0,
              "z": -520
            },
            {
              "x": -472,
              "y": 0,
              "z": -520
            },
            {
              "x": -460,
              "y": 0,
              "z": -520
            },
            {
              "x": -448,
              "y": 0,
              "z": -520
            },
            {
              "x": -436,
              "y": 0,
              "z": -520
            },
            {
              "x": -424,
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
          "id": "tr_sp2_r",
          "points": [
            {
              "x": -520,
              "y": 0,
              "z": -520
            },
            {
              "x": -520,
              "y": 0,
              "z": -508
            },
            {
              "x": -520,
              "y": 0,
              "z": -496
            },
            {
              "x": -520,
              "y": 0,
              "z": -484
            },
            {
              "x": -520,
              "y": 0,
              "z": -472
            },
            {
              "x": -520,
              "y": 0,
              "z": -460
            },
            {
              "x": -520,
              "y": 0,
              "z": -448
            },
            {
              "x": -520,
              "y": 0,
              "z": -436
            },
            {
              "x": -520,
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
              "x": -520,
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
              "x": -436,
              "y": 0,
              "z": -424
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
          "id": "tr_gb_9",
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
          "id": "tr_gb_10",
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
          "id": "tr_gb_11",
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
          "id": "tr_gb_12",
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
          "id": "tr_gb_13",
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
          "id": "tr_gb_14",
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
          "id": "tr_gb_15",
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
          "id": "tr_gb_16",
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
          "id": "tr_gb_17",
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
          "id": "tr_gb_18",
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
          "id": "tr_gb_19",
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
          "id": "tr_gb_20",
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
          "id": "tr_gb_21",
          "points": [
            {
              "x": -60.56,
              "y": 3.33,
              "z": 520
            },
            {
              "x": -71.99,
              "y": 2.34,
              "z": 520
            },
            {
              "x": -83.42,
              "y": 1.48,
              "z": 520
            },
            {
              "x": -94.85,
              "y": 0.78,
              "z": 520
            },
            {
              "x": -106.27,
              "y": 0.28,
              "z": 520
            },
            {
              "x": -117.7,
              "y": 0.03,
              "z": 520
            },
            {
              "x": -129.13,
              "y": 0,
              "z": 520
            },
            {
              "x": -140.56,
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
          "id": "tr_gb_22",
          "points": [
            {
              "x": -60.56,
              "y": 3.33,
              "z": 520
            },
            {
              "x": -60.56,
              "y": 2.49,
              "z": 531.43
            },
            {
              "x": -60.56,
              "y": 1.71,
              "z": 542.86
            },
            {
              "x": -60.56,
              "y": 1.04,
              "z": 554.29
            },
            {
              "x": -60.56,
              "y": 0.51,
              "z": 565.71
            },
            {
              "x": -60.56,
              "y": 0.15,
              "z": 577.14
            },
            {
              "x": -60.56,
              "y": 0,
              "z": 588.57
            },
            {
              "x": -60.56,
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
          "id": "tr_gb_23",
          "points": [
            {
              "x": -60.56,
              "y": 3.33,
              "z": 520
            },
            {
              "x": -71.23,
              "y": 2.4,
              "z": 520
            },
            {
              "x": -81.89,
              "y": 1.59,
              "z": 520
            },
            {
              "x": -92.56,
              "y": 0.91,
              "z": 520
            },
            {
              "x": -103.23,
              "y": 0.39,
              "z": 520
            },
            {
              "x": -113.89,
              "y": 0.08,
              "z": 520
            },
            {
              "x": -124.56,
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
          "id": "tr_gb_24",
          "points": [
            {
              "x": -60.56,
              "y": 3.33,
              "z": 520
            },
            {
              "x": -60.56,
              "y": 2.54,
              "z": 530.67
            },
            {
              "x": -60.56,
              "y": 1.81,
              "z": 541.33
            },
            {
              "x": -60.56,
              "y": 1.16,
              "z": 552
            },
            {
              "x": -60.56,
              "y": 0.63,
              "z": 562.67
            },
            {
              "x": -60.56,
              "y": 0.24,
              "z": 573.33
            },
            {
              "x": -60.56,
              "y": 0.03,
              "z": 584
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
              "x": -60.56,
              "y": 3.33,
              "z": 520
            },
            {
              "x": -60.56,
              "y": 4.14,
              "z": 509.33
            },
            {
              "x": -60.56,
              "y": 4.96,
              "z": 498.67
            },
            {
              "x": -60.56,
              "y": 5.75,
              "z": 488
            },
            {
              "x": -60.56,
              "y": 6.52,
              "z": 477.33
            },
            {
              "x": -60.56,
              "y": 7.25,
              "z": 466.67
            },
            {
              "x": -60.56,
              "y": 7.92,
              "z": 456
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
              "x": -60.56,
              "y": 3.33,
              "z": 520
            },
            {
              "x": -60.56,
              "y": 2.45,
              "z": 532
            },
            {
              "x": -60.56,
              "y": 1.64,
              "z": 544
            },
            {
              "x": -60.56,
              "y": 0.95,
              "z": 556
            },
            {
              "x": -60.56,
              "y": 0.42,
              "z": 568
            }
          ],
          "shoulder": 1,
          "width": 6
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_gc_28",
          "points": [
            {
              "x": 440,
              "y": 10.43,
              "z": 520
            },
            {
              "x": 451.43,
              "y": 9.86,
              "z": 520
            },
            {
              "x": 462.86,
              "y": 9.08,
              "z": 520
            },
            {
              "x": 474.29,
              "y": 8.08,
              "z": 520
            },
            {
              "x": 485.71,
              "y": 6.9,
              "z": 520
            },
            {
              "x": 497.14,
              "y": 5.61,
              "z": 520
            },
            {
              "x": 508.57,
              "y": 4.28,
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
          "id": "tr_gc_29",
          "points": [
            {
              "x": 440,
              "y": 10.43,
              "z": 520
            },
            {
              "x": 451.43,
              "y": 9.86,
              "z": 520
            },
            {
              "x": 462.86,
              "y": 9.08,
              "z": 520
            },
            {
              "x": 474.29,
              "y": 8.08,
              "z": 520
            },
            {
              "x": 485.71,
              "y": 6.9,
              "z": 520
            },
            {
              "x": 497.14,
              "y": 5.61,
              "z": 520
            },
            {
              "x": 508.57,
              "y": 4.28,
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
          "id": "tr_gc_30",
          "points": [
            {
              "x": 440,
              "y": 10.43,
              "z": 520
            },
            {
              "x": 451.43,
              "y": 9.86,
              "z": 520
            },
            {
              "x": 462.86,
              "y": 9.08,
              "z": 520
            },
            {
              "x": 474.29,
              "y": 8.08,
              "z": 520
            },
            {
              "x": 485.71,
              "y": 6.9,
              "z": 520
            },
            {
              "x": 497.14,
              "y": 5.61,
              "z": 520
            },
            {
              "x": 508.57,
              "y": 4.28,
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
          "id": "tr_gc_31",
          "points": [
            {
              "x": 440,
              "y": 10.43,
              "z": 520
            },
            {
              "x": 451.43,
              "y": 9.86,
              "z": 520
            },
            {
              "x": 462.86,
              "y": 9.08,
              "z": 520
            },
            {
              "x": 474.29,
              "y": 8.08,
              "z": 520
            },
            {
              "x": 485.71,
              "y": 6.9,
              "z": 520
            },
            {
              "x": 497.14,
              "y": 5.61,
              "z": 520
            },
            {
              "x": 508.57,
              "y": 4.28,
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
          "id": "tr_gc_32",
          "points": [
            {
              "x": 440,
              "y": 10.43,
              "z": 520
            },
            {
              "x": 451.43,
              "y": 9.86,
              "z": 520
            },
            {
              "x": 462.86,
              "y": 9.08,
              "z": 520
            },
            {
              "x": 474.29,
              "y": 8.08,
              "z": 520
            },
            {
              "x": 485.71,
              "y": 6.9,
              "z": 520
            },
            {
              "x": 497.14,
              "y": 5.61,
              "z": 520
            },
            {
              "x": 508.57,
              "y": 4.28,
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
          "id": "tr_gc_33",
          "points": [
            {
              "x": 440,
              "y": 10.43,
              "z": 520
            },
            {
              "x": 451.43,
              "y": 9.86,
              "z": 520
            },
            {
              "x": 462.86,
              "y": 9.08,
              "z": 520
            },
            {
              "x": 474.29,
              "y": 8.08,
              "z": 520
            },
            {
              "x": 485.71,
              "y": 6.9,
              "z": 520
            },
            {
              "x": 497.14,
              "y": 5.61,
              "z": 520
            },
            {
              "x": 508.57,
              "y": 4.28,
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
          "id": "tr_gc_34",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": 600
            },
            {
              "x": 530.67,
              "y": 0,
              "z": 600
            },
            {
              "x": 541.33,
              "y": 0,
              "z": 600
            },
            {
              "x": 552,
              "y": 0,
              "z": 600
            },
            {
              "x": 562.67,
              "y": 0,
              "z": 600
            },
            {
              "x": 573.33,
              "y": 0,
              "z": 600
            },
            {
              "x": 584,
              "y": 0,
              "z": 600
            },
            {
              "x": 584,
              "y": 0,
              "z": 588.57
            },
            {
              "x": 584,
              "y": 0,
              "z": 577.14
            },
            {
              "x": 584,
              "y": 0,
              "z": 565.71
            },
            {
              "x": 584,
              "y": 0,
              "z": 554.29
            },
            {
              "x": 584,
              "y": 0,
              "z": 542.86
            },
            {
              "x": 584,
              "y": 0,
              "z": 531.43
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
          "id": "tr_gc_35",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": 600
            },
            {
              "x": 509.33,
              "y": 0,
              "z": 600
            },
            {
              "x": 498.67,
              "y": 0,
              "z": 600
            },
            {
              "x": 488,
              "y": 0,
              "z": 600
            },
            {
              "x": 477.33,
              "y": 0,
              "z": 600
            },
            {
              "x": 466.67,
              "y": 0,
              "z": 600
            },
            {
              "x": 456,
              "y": 0,
              "z": 600
            },
            {
              "x": 456,
              "y": 0,
              "z": 588.57
            },
            {
              "x": 456,
              "y": 0.04,
              "z": 577.14
            },
            {
              "x": 456,
              "y": 0.7,
              "z": 565.71
            },
            {
              "x": 456,
              "y": 2.1,
              "z": 554.29
            },
            {
              "x": 456,
              "y": 4.12,
              "z": 542.86
            },
            {
              "x": 456,
              "y": 6.65,
              "z": 531.43
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
          "id": "tr_gc_36",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": 600
            },
            {
              "x": 532,
              "y": 0,
              "z": 600
            },
            {
              "x": 544,
              "y": 0,
              "z": 600
            },
            {
              "x": 556,
              "y": 0,
              "z": 600
            },
            {
              "x": 568,
              "y": 0,
              "z": 600
            },
            {
              "x": 568,
              "y": 0,
              "z": 588.57
            },
            {
              "x": 568,
              "y": 0,
              "z": 577.14
            },
            {
              "x": 568,
              "y": 0,
              "z": 565.71
            },
            {
              "x": 568,
              "y": 0,
              "z": 554.29
            },
            {
              "x": 568,
              "y": 0,
              "z": 542.86
            },
            {
              "x": 568,
              "y": 0,
              "z": 531.43
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
          "id": "tr_gc_37",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": 600
            },
            {
              "x": 508,
              "y": 0,
              "z": 600
            },
            {
              "x": 496,
              "y": 0,
              "z": 600
            },
            {
              "x": 484,
              "y": 0,
              "z": 600
            },
            {
              "x": 472,
              "y": 0,
              "z": 600
            },
            {
              "x": 472,
              "y": 0,
              "z": 588.57
            },
            {
              "x": 472,
              "y": 0,
              "z": 577.14
            },
            {
              "x": 472,
              "y": 0.41,
              "z": 565.71
            },
            {
              "x": 472,
              "y": 1.56,
              "z": 554.29
            },
            {
              "x": 472,
              "y": 3.33,
              "z": 542.86
            },
            {
              "x": 472,
              "y": 5.61,
              "z": 531.43
            },
            {
              "x": 472,
              "y": 8.3,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 6
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
      "budgetMs": 80,
      "chunk": 256,
      "keep": 2,
      "overlap": 1.175
    },
    "units": "meters",
    "windows": {}
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
