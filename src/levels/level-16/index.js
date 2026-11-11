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
          "buildings": 14,
          "props": 59,
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
          "buildings": 30,
          "props": 13,
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
          "buildings": 49,
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
          "buildings": 71,
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
          "props": 23
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
          "props": 4
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
          "buildings": 5,
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
          "buildings": 16,
          "channels": 1,
          "props": 38
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
          "buildings": 12,
          "channels": 1,
          "props": 13
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
          "buildings": 4,
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
          "buildings": 61,
          "props": 58
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
          "buildings": 34,
          "props": 6
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
          "buildings": 5
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
          "buildings": 3
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
          "buildings": 37,
          "props": 48
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
          "props": 8
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
          "buildings": 16
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
          "buildings": 5
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
          "maxX": 143.691,
          "maxZ": -624.309,
          "minX": 133.642,
          "minZ": -634.358,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_23:площадка",
          "maxX": 165.972,
          "maxZ": -623.362,
          "minX": 154.028,
          "minZ": -635.305,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_24:площадка",
          "maxX": 102.267,
          "maxZ": -601.733,
          "minX": 89.733,
          "minZ": -614.267,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_30:площадка",
          "maxX": 60.063,
          "maxZ": -579.937,
          "minX": 46.604,
          "minZ": -593.396,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_31:площадка",
          "maxX": 81.748,
          "maxZ": -579.585,
          "minX": 67.585,
          "minZ": -593.748,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_32:площадка",
          "maxX": 123.427,
          "maxZ": -580.573,
          "minX": 111.24,
          "minZ": -592.76,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_101:площадка",
          "maxX": 547.184,
          "maxZ": -616.452,
          "minX": 529.179,
          "minZ": -634.457,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_102:площадка",
          "maxX": 633.802,
          "maxZ": -617.107,
          "minX": 617.107,
          "minZ": -633.802,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_108:площадка",
          "maxX": 516.938,
          "maxZ": -588.516,
          "minX": 501.244,
          "minZ": -604.211,
          "y": 0.022
        },
        {
          "blend": 14,
          "id": "b_district_3_0_109:площадка",
          "maxX": 575.628,
          "maxZ": -588.008,
          "minX": 558.917,
          "minZ": -604.719,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_110:площадка",
          "maxX": 633.934,
          "maxZ": -587.884,
          "minX": 616.975,
          "minZ": -604.843,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_114:площадка",
          "maxX": 575.017,
          "maxZ": -559.528,
          "minX": 559.528,
          "minZ": -575.017,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_117:площадка",
          "maxX": 575.167,
          "maxZ": -530.287,
          "minX": 559.378,
          "minZ": -546.076,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_122:площадка",
          "maxX": 604.4,
          "maxZ": -501.055,
          "minX": 588.328,
          "minZ": -517.127,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_123:площадка",
          "maxX": 632.78,
          "maxZ": -501.766,
          "minX": 618.129,
          "minZ": -516.416,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_129:площадка",
          "maxX": 605.288,
          "maxZ": -471.076,
          "minX": 587.439,
          "minZ": -488.924,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_130:площадка",
          "maxX": 635.895,
          "maxZ": -469.56,
          "minX": 615.014,
          "minZ": -490.44,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_157:площадка",
          "maxX": 632.24,
          "maxZ": -356.851,
          "minX": 618.669,
          "minZ": -370.422,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_162:площадка",
          "maxX": 604.673,
          "maxZ": -326.236,
          "minX": 588.054,
          "minZ": -342.855,
          "y": 0.008
        },
        {
          "blend": 14,
          "id": "b_district_3_0_163:площадка",
          "maxX": 633.763,
          "maxZ": -326.237,
          "minX": 617.146,
          "minZ": -342.854,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_164:площадка",
          "maxX": -528.246,
          "maxZ": -295.519,
          "minX": -548.118,
          "minZ": -315.39,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_165:площадка",
          "maxX": -556.604,
          "maxZ": -265.695,
          "minX": -577.941,
          "minZ": -287.032,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_166:площадка",
          "maxX": -531.253,
          "maxZ": -269.435,
          "minX": -545.111,
          "minZ": -283.293,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_167:площадка",
          "maxX": -616.455,
          "maxZ": -238.274,
          "minX": -634.454,
          "minZ": -256.272,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_168:площадка",
          "maxX": -559.521,
          "maxZ": -239.521,
          "minX": -575.024,
          "minZ": -255.024,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_169:площадка",
          "maxX": -531.53,
          "maxZ": -211.53,
          "minX": -544.834,
          "minZ": -224.834,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_170:площадка",
          "maxX": -586.608,
          "maxZ": -179.335,
          "minX": -606.12,
          "minZ": -198.847,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_171:площадка",
          "maxX": -558.84,
          "maxZ": -180.658,
          "minX": -575.706,
          "minZ": -197.524,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_172:площадка",
          "maxX": -586.98,
          "maxZ": -150.617,
          "minX": -605.747,
          "minZ": -169.383,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_173:площадка",
          "maxX": -530.459,
          "maxZ": -152.277,
          "minX": -545.905,
          "minZ": -167.723,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_174:площадка",
          "maxX": -615.994,
          "maxZ": -121.449,
          "minX": -634.915,
          "minZ": -140.37,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_175:площадка",
          "maxX": -530.399,
          "maxZ": -123.126,
          "minX": -545.965,
          "minZ": -138.692,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_176:площадка",
          "maxX": -587.513,
          "maxZ": -92.967,
          "minX": -605.215,
          "minZ": -110.669,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_177:площадка",
          "maxX": -558.016,
          "maxZ": -92.561,
          "minX": -576.53,
          "minZ": -111.075,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_178:площадка",
          "maxX": -616.838,
          "maxZ": -64.111,
          "minX": -634.071,
          "minZ": -81.344,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_179:площадка",
          "maxX": -586.615,
          "maxZ": -62.978,
          "minX": -606.113,
          "minZ": -82.476,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_180:площадка",
          "maxX": -556.728,
          "maxZ": -4.001,
          "minX": -577.818,
          "minZ": -25.09,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_181:площадка",
          "maxX": -530.094,
          "maxZ": -6.458,
          "minX": -546.27,
          "minZ": -22.633,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_204:площадка",
          "maxX": 605.646,
          "maxZ": -296.172,
          "minX": 587.081,
          "minZ": -314.737,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_211:площадка",
          "maxX": 634.653,
          "maxZ": -238.074,
          "minX": 616.256,
          "minZ": -256.471,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_217:площадка",
          "maxX": 548.735,
          "maxZ": -178.538,
          "minX": 527.628,
          "minZ": -199.644,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_218:площадка",
          "maxX": 576.39,
          "maxZ": -179.973,
          "minX": 558.155,
          "minZ": -198.209,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_219:площадка",
          "maxX": 603.448,
          "maxZ": -182.007,
          "minX": 589.279,
          "minZ": -196.175,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_220:площадка",
          "maxX": 635.531,
          "maxZ": -179.014,
          "minX": 615.378,
          "minZ": -199.167,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_223:площадка",
          "maxX": 633.37,
          "maxZ": -152.085,
          "minX": 617.539,
          "minZ": -167.915,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_225:площадка",
          "maxX": 429.894,
          "maxZ": -122.833,
          "minX": 413.742,
          "minZ": -138.985,
          "y": 0.001
        },
        {
          "blend": 14,
          "id": "b_district_3_1_226:площадка",
          "maxX": 490.786,
          "maxZ": -120.123,
          "minX": 469.214,
          "minZ": -141.695,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_227:площадка",
          "maxX": 343.213,
          "maxZ": -93.151,
          "minX": 325.878,
          "minZ": -110.485,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_228:площадка",
          "maxX": 457.779,
          "maxZ": -94.948,
          "minX": 444.039,
          "minZ": -108.688,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_229:площадка",
          "maxX": 518.878,
          "maxZ": -92.031,
          "minX": 499.303,
          "minZ": -111.606,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_230:площадка",
          "maxX": 399.998,
          "maxZ": -65.457,
          "minX": 385.457,
          "minZ": -79.998,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_231:площадка",
          "maxX": 430.298,
          "maxZ": -64.248,
          "minX": 413.339,
          "minZ": -81.207,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_232:площадка",
          "maxX": 516.02,
          "maxZ": -65.798,
          "minX": 502.162,
          "minZ": -79.656,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_233:площадка",
          "maxX": 547.057,
          "maxZ": -63.852,
          "minX": 529.306,
          "minZ": -81.603,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_234:площадка",
          "maxX": 575.109,
          "maxZ": -64.891,
          "minX": 559.437,
          "minZ": -80.563,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_235:площадка",
          "maxX": 342.351,
          "maxZ": -35.831,
          "minX": 326.74,
          "minZ": -51.442,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_236:площадка",
          "maxX": 432.558,
          "maxZ": -32.897,
          "minX": 411.079,
          "minZ": -54.376,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_237:площадка",
          "maxX": 545.514,
          "maxZ": -36.304,
          "minX": 530.849,
          "minZ": -50.969,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_238:площадка",
          "maxX": 603.165,
          "maxZ": -36.835,
          "minX": 589.563,
          "minZ": -50.437,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_239:площадка",
          "maxX": 635.077,
          "maxZ": -34.014,
          "minX": 615.832,
          "minZ": -53.259,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_240:площадка",
          "maxX": 429.856,
          "maxZ": -6.507,
          "minX": 413.78,
          "minZ": -22.583,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_241:площадка",
          "maxX": 548.806,
          "maxZ": -3.921,
          "minX": 527.557,
          "minZ": -25.17,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_242:площадка",
          "maxX": 605.957,
          "maxZ": -4.952,
          "minX": 586.771,
          "minZ": -24.139,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_243:площадка",
          "maxX": -622.581,
          "maxZ": 17.419,
          "minX": -636.086,
          "minZ": 3.914,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_244:площадка",
          "maxX": -603.172,
          "maxZ": 15.494,
          "minX": -612.828,
          "minZ": 5.839,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_245:площадка",
          "maxX": -560.799,
          "maxZ": 15.201,
          "minX": -569.867,
          "minZ": 6.133,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_246:площадка",
          "maxX": -536.726,
          "maxZ": 17.941,
          "minX": -551.274,
          "minZ": 3.392,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_247:площадка",
          "maxX": -623.412,
          "maxZ": 37.922,
          "minX": -635.255,
          "minZ": 26.078,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_248:площадка",
          "maxX": -601.286,
          "maxZ": 38.714,
          "minX": -614.714,
          "minZ": 25.286,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_249:площадка",
          "maxX": -579.637,
          "maxZ": 39.029,
          "minX": -593.696,
          "minZ": 24.971,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_250:площадка",
          "maxX": -539.318,
          "maxZ": 36.682,
          "minX": -548.682,
          "minZ": 27.318,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_251:площадка",
          "maxX": -622.586,
          "maxZ": 60.081,
          "minX": -636.081,
          "minZ": 46.586,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_252:площадка",
          "maxX": -579.456,
          "maxZ": 60.544,
          "minX": -593.878,
          "minZ": 46.122,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_253:площадка",
          "maxX": -560.041,
          "maxZ": 58.626,
          "minX": -570.626,
          "minZ": 48.041,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_254:площадка",
          "maxX": -624.155,
          "maxZ": 79.845,
          "minX": -634.512,
          "minZ": 69.488,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_255:площадка",
          "maxX": -600.996,
          "maxZ": 81.67,
          "minX": -615.004,
          "minZ": 67.663,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_256:площадка",
          "maxX": -579.431,
          "maxZ": 81.902,
          "minX": -593.902,
          "minZ": 67.431,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_257:площадка",
          "maxX": -558.613,
          "maxZ": 81.387,
          "minX": -572.054,
          "minZ": 67.946,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_258:площадка",
          "maxX": -537.227,
          "maxZ": 81.439,
          "minX": -550.773,
          "minZ": 67.894,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_259:площадка",
          "maxX": -622.925,
          "maxZ": 102.408,
          "minX": -635.742,
          "minZ": 89.592,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_260:площадка",
          "maxX": -560.396,
          "maxZ": 100.937,
          "minX": -570.271,
          "minZ": 91.063,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_261:площадка",
          "maxX": -538.72,
          "maxZ": 101.28,
          "minX": -549.28,
          "minZ": 90.72,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_262:площадка",
          "maxX": -601.544,
          "maxZ": 123.79,
          "minX": -614.456,
          "minZ": 110.877,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_263:площадка",
          "maxX": -579.428,
          "maxZ": 124.572,
          "minX": -593.905,
          "minZ": 110.095,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_264:площадка",
          "maxX": -537.418,
          "maxZ": 123.915,
          "minX": -550.582,
          "minZ": 110.751,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_265:площадка",
          "maxX": -624.139,
          "maxZ": 143.861,
          "minX": -634.528,
          "minZ": 133.472,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_266:площадка",
          "maxX": -558.039,
          "maxZ": 145.961,
          "minX": -572.628,
          "minZ": 131.372,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_267:площадка",
          "maxX": -538.389,
          "maxZ": 144.277,
          "minX": -549.611,
          "minZ": 133.056,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_268:площадка",
          "maxX": -602.21,
          "maxZ": 165.79,
          "minX": -613.79,
          "minZ": 154.21,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_269:площадка",
          "maxX": -582.143,
          "maxZ": 164.524,
          "minX": -591.191,
          "minZ": 155.476,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_270:площадка",
          "maxX": -536.959,
          "maxZ": 167.041,
          "minX": -551.041,
          "minZ": 152.959,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_271:площадка",
          "maxX": -601.86,
          "maxZ": 187.474,
          "minX": -614.14,
          "minZ": 175.193,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_272:площадка",
          "maxX": -560.123,
          "maxZ": 186.544,
          "minX": -570.544,
          "minZ": 176.123,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_273:площадка",
          "maxX": -537.094,
          "maxZ": 188.239,
          "minX": -550.906,
          "minZ": 174.428,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_274:площадка",
          "maxX": -623.105,
          "maxZ": 208.895,
          "minX": -635.562,
          "minZ": 196.438,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_275:площадка",
          "maxX": -579.44,
          "maxZ": 209.894,
          "minX": -593.894,
          "minZ": 195.44,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_276:площадка",
          "maxX": -559.183,
          "maxZ": 208.817,
          "minX": -571.484,
          "minZ": 196.516,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_277:площадка",
          "maxX": -602.811,
          "maxZ": 229.189,
          "minX": -613.189,
          "minZ": 218.811,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_278:площадка",
          "maxX": -581.778,
          "maxZ": 228.888,
          "minX": -591.555,
          "minZ": 219.112,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_279:площадка",
          "maxX": -558.831,
          "maxZ": 230.502,
          "minX": -571.835,
          "minZ": 217.498,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_280:площадка",
          "maxX": -600.857,
          "maxZ": 252.476,
          "minX": -615.143,
          "minZ": 238.191,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_281:площадка",
          "maxX": -560.4,
          "maxZ": 250.266,
          "minX": -570.266,
          "minZ": 240.4,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_283:площадка",
          "maxX": -624.558,
          "maxZ": 271.442,
          "minX": -634.109,
          "minZ": 261.891,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_284:площадка",
          "maxX": -603.024,
          "maxZ": 271.643,
          "minX": -612.976,
          "minZ": 261.69,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_287:площадка",
          "maxX": -623.612,
          "maxZ": 293.721,
          "minX": -635.054,
          "minZ": 282.279,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_288:площадка",
          "maxX": -601.629,
          "maxZ": 294.371,
          "minX": -614.371,
          "minZ": 281.629,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_298:площадка",
          "maxX": 537.673,
          "maxZ": 171.958,
          "minX": 513.756,
          "minZ": 148.042,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_299:площадка",
          "maxX": 586.642,
          "maxZ": 175.214,
          "minX": 556.215,
          "minZ": 144.786,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_301:площадка",
          "maxX": 629.145,
          "maxZ": 217.716,
          "minX": 605.141,
          "minZ": 193.712,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_303:площадка",
          "maxX": 632.255,
          "maxZ": 266.541,
          "minX": 602.03,
          "minZ": 236.316,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_304:площадка",
          "maxX": -628.653,
          "maxZ": 331.347,
          "minX": -635.347,
          "minZ": 324.653,
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
