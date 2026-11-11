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
          "buildings": 10,
          "roads": 2
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
          "buildings": 5,
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
          "buildings": 46,
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
          "buildings": 51,
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
          "buildings": 2
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
        "objects": {},
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
          "roads": 1
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
          "buildings": 6,
          "channels": 1
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
          "channels": 1
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
          "roads": 1
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
          "buildings": 7
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
        "objects": {},
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
        "objects": {},
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
        "objects": {},
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
          "buildings": 2,
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
        "objects": {},
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
          "buildings": 9
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
          "buildings": 7
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
          "buildings": 1
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
          "buildings": 6,
          "roads": 2
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
          "maxX": -568.055,
          "maxZ": -608.055,
          "minX": -591.945,
          "minZ": -631.945,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_2:площадка",
          "maxX": -529.682,
          "maxZ": -609.682,
          "minX": -550.318,
          "minZ": -630.318,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_3:площадка",
          "maxX": -489.341,
          "maxZ": -609.341,
          "minX": -510.659,
          "minZ": -630.659,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_4:площадка",
          "maxX": -406.666,
          "maxZ": -606.666,
          "minX": -433.334,
          "minZ": -633.334,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_5:площадка",
          "maxX": -528.619,
          "maxZ": -568.619,
          "minX": -551.381,
          "minZ": -591.381,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_6:площадка",
          "maxX": -327.04,
          "maxZ": -567.04,
          "minX": -352.96,
          "minZ": -592.96,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_7:площадка",
          "maxX": -565.16,
          "maxZ": -525.16,
          "minX": -594.84,
          "minZ": -554.84,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_8:площадка",
          "maxX": -450.17,
          "maxZ": -530.17,
          "minX": -469.83,
          "minZ": -549.83,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_9:площадка",
          "maxX": -410.352,
          "maxZ": -530.352,
          "minX": -429.648,
          "minZ": -549.648,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_11:площадка",
          "maxX": -608.734,
          "maxZ": -448.734,
          "minX": -631.266,
          "minZ": -471.266,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_12:площадка",
          "maxX": -606.999,
          "maxZ": -406.999,
          "minX": -633.001,
          "minZ": -433.001,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_13:площадка",
          "maxX": 30.853,
          "maxZ": -609.147,
          "minX": 9.147,
          "minZ": -630.853,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_14:площадка",
          "maxX": 70.11,
          "maxZ": -609.89,
          "minX": 49.89,
          "minZ": -630.11,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_15:площадка",
          "maxX": 113.583,
          "maxZ": -606.417,
          "minX": 86.417,
          "minZ": -633.583,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_16:площадка",
          "maxX": 152.837,
          "maxZ": -607.163,
          "minX": 127.163,
          "minZ": -632.837,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_21:площадка",
          "maxX": 111.955,
          "maxZ": -568.045,
          "minX": 88.045,
          "minZ": -591.955,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_26:площадка",
          "maxX": -527.641,
          "maxZ": -287.641,
          "minX": -552.359,
          "minZ": -312.359,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_27:площадка",
          "maxX": -567.22,
          "maxZ": -247.22,
          "minX": -592.78,
          "minZ": -272.78,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_28:площадка",
          "maxX": -610.023,
          "maxZ": -210.023,
          "minX": -629.977,
          "minZ": -229.977,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_29:площадка",
          "maxX": -527.164,
          "maxZ": -207.164,
          "minX": -552.836,
          "minZ": -232.836,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_30:площадка",
          "maxX": -529.775,
          "maxZ": -129.775,
          "minX": -550.225,
          "minZ": -150.225,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_31:площадка",
          "maxX": -605.026,
          "maxZ": -45.026,
          "minX": -634.974,
          "minZ": -74.974,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_32:площадка",
          "maxX": -609.915,
          "maxZ": -9.915,
          "minX": -630.085,
          "minZ": -30.085,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_33:площадка",
          "maxX": -567.685,
          "maxZ": -7.685,
          "minX": -592.315,
          "minZ": -32.315,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_35:площадка",
          "maxX": 631.095,
          "maxZ": -288.905,
          "minX": 608.905,
          "minZ": -311.095,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_37:площадка",
          "maxX": 633.351,
          "maxZ": -246.649,
          "minX": 606.649,
          "minZ": -273.351,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_39:площадка",
          "maxX": 592.15,
          "maxZ": -207.85,
          "minX": 567.85,
          "minZ": -232.15,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_40:площадка",
          "maxX": 632.07,
          "maxZ": -207.93,
          "minX": 607.93,
          "minZ": -232.07,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_41:площадка",
          "maxX": 633.489,
          "maxZ": -166.511,
          "minX": 606.511,
          "minZ": -193.489,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_42:площадка",
          "maxX": 634.491,
          "maxZ": -125.509,
          "minX": 605.509,
          "minZ": -154.491,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_43:площадка",
          "maxX": 631.108,
          "maxZ": -88.892,
          "minX": 608.892,
          "minZ": -111.108,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_44:площадка",
          "maxX": 633.815,
          "maxZ": -46.185,
          "minX": 606.185,
          "minZ": -73.815,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_45:площадка",
          "maxX": 594.475,
          "maxZ": -5.525,
          "minX": 565.525,
          "minZ": -34.475,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_46:площадка",
          "maxX": 633.506,
          "maxZ": -6.494,
          "minX": 606.494,
          "minZ": -33.506,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_47:площадка",
          "maxX": -627.122,
          "maxZ": 12.878,
          "minX": -636.878,
          "minZ": 3.122,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_48:площадка",
          "maxX": -595.616,
          "maxZ": 12.384,
          "minX": -604.384,
          "minZ": 3.616,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_49:площадка",
          "maxX": -564.149,
          "maxZ": 11.851,
          "minX": -571.851,
          "minZ": 4.149,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_50:площадка",
          "maxX": -548.07,
          "maxZ": 11.93,
          "minX": -555.93,
          "minZ": 4.07,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_51:площадка",
          "maxX": -532.909,
          "maxZ": 11.091,
          "minX": -539.091,
          "minZ": 4.909,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_52:площадка",
          "maxX": -627.068,
          "maxZ": 28.932,
          "minX": -636.932,
          "minZ": 19.068,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_53:площадка",
          "maxX": -611.151,
          "maxZ": 28.849,
          "minX": -620.849,
          "minZ": 19.151,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_54:площадка",
          "maxX": -595.673,
          "maxZ": 28.327,
          "minX": -604.327,
          "minZ": 19.673,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_55:площадка",
          "maxX": -580.678,
          "maxZ": 27.322,
          "minX": -587.322,
          "minZ": 20.678,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_56:площадка",
          "maxX": -564.221,
          "maxZ": 27.779,
          "minX": -571.779,
          "minZ": 20.221,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_57:площадка",
          "maxX": -628.066,
          "maxZ": 43.934,
          "minX": -635.934,
          "minZ": 36.066,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_58:площадка",
          "maxX": -611.339,
          "maxZ": 44.661,
          "minX": -620.661,
          "minZ": 35.339,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_59:площадка",
          "maxX": -579.694,
          "maxZ": 44.306,
          "minX": -588.306,
          "minZ": 35.694,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_60:площадка",
          "maxX": -531.207,
          "maxZ": 44.793,
          "minX": -540.793,
          "minZ": 35.207,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_61:площадка",
          "maxX": -595.165,
          "maxZ": 60.835,
          "minX": -604.835,
          "minZ": 51.165,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_62:площадка",
          "maxX": -580.24,
          "maxZ": 59.76,
          "minX": -587.76,
          "minZ": 52.24,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_63:площадка",
          "maxX": -564.466,
          "maxZ": 59.534,
          "minX": -571.534,
          "minZ": 52.466,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_64:площадка",
          "maxX": -531.079,
          "maxZ": 60.921,
          "minX": -540.921,
          "minZ": 51.079,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_65:площадка",
          "maxX": -628.642,
          "maxZ": 75.358,
          "minX": -635.358,
          "minZ": 68.642,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_66:площадка",
          "maxX": -596.39,
          "maxZ": 75.61,
          "minX": -603.61,
          "minZ": 68.39,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_67:площадка",
          "maxX": -580.595,
          "maxZ": 75.405,
          "minX": -587.405,
          "minZ": 68.595,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_68:площадка",
          "maxX": -564.359,
          "maxZ": 75.641,
          "minX": -571.641,
          "minZ": 68.359,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_69:площадка",
          "maxX": -548.678,
          "maxZ": 75.322,
          "minX": -555.322,
          "minZ": 68.678,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_70:площадка",
          "maxX": -532.121,
          "maxZ": 75.879,
          "minX": -539.879,
          "minZ": 68.121,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_71:площадка",
          "maxX": -628.514,
          "maxZ": 91.486,
          "minX": -635.486,
          "minZ": 84.514,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_72:площадка",
          "maxX": -612.292,
          "maxZ": 91.708,
          "minX": -619.708,
          "minZ": 84.292,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_73:площадка",
          "maxX": -596.009,
          "maxZ": 91.991,
          "minX": -603.991,
          "minZ": 84.009,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_74:площадка",
          "maxX": -580.213,
          "maxZ": 91.787,
          "minX": -587.787,
          "minZ": 84.213,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_75:площадка",
          "maxX": -563.472,
          "maxZ": 92.528,
          "minX": -572.528,
          "minZ": 83.472,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_76:площадка",
          "maxX": -547.938,
          "maxZ": 92.062,
          "minX": -556.062,
          "minZ": 83.938,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_77:площадка",
          "maxX": -531.174,
          "maxZ": 92.826,
          "minX": -540.826,
          "minZ": 83.174,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_78:площадка",
          "maxX": -612.019,
          "maxZ": 107.981,
          "minX": -619.981,
          "minZ": 100.019,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_79:площадка",
          "maxX": -595.882,
          "maxZ": 108.118,
          "minX": -604.118,
          "minZ": 99.882,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_80:площадка",
          "maxX": -580.194,
          "maxZ": 107.806,
          "minX": -587.806,
          "minZ": 100.194,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_81:площадка",
          "maxX": -563.851,
          "maxZ": 108.149,
          "minX": -572.149,
          "minZ": 99.851,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_82:площадка",
          "maxX": -548.618,
          "maxZ": 107.382,
          "minX": -555.382,
          "minZ": 100.618,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_83:площадка",
          "maxX": -532.038,
          "maxZ": 107.962,
          "minX": -539.962,
          "minZ": 100.038,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_84:площадка",
          "maxX": -628.024,
          "maxZ": 123.976,
          "minX": -635.976,
          "minZ": 116.024,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_85:площадка",
          "maxX": -612.697,
          "maxZ": 123.303,
          "minX": -619.303,
          "minZ": 116.697,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_86:площадка",
          "maxX": -595.074,
          "maxZ": 124.926,
          "minX": -604.926,
          "minZ": 115.074,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_87:площадка",
          "maxX": -564.701,
          "maxZ": 123.299,
          "minX": -571.299,
          "minZ": 116.701,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_88:площадка",
          "maxX": -548.066,
          "maxZ": 123.934,
          "minX": -555.934,
          "minZ": 116.066,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_89:площадка",
          "maxX": -531.064,
          "maxZ": 124.936,
          "minX": -540.936,
          "minZ": 115.064,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_90:площадка",
          "maxX": -627.816,
          "maxZ": 140.184,
          "minX": -636.184,
          "minZ": 131.816,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_91:площадка",
          "maxX": -611.571,
          "maxZ": 140.429,
          "minX": -620.429,
          "minZ": 131.571,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_92:площадка",
          "maxX": -580.096,
          "maxZ": 139.904,
          "minX": -587.904,
          "minZ": 132.096,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_93:площадка",
          "maxX": -563.702,
          "maxZ": 140.298,
          "minX": -572.298,
          "minZ": 131.702,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_94:площадка",
          "maxX": -548.079,
          "maxZ": 139.921,
          "minX": -555.921,
          "minZ": 132.079,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_95:площадка",
          "maxX": -531.243,
          "maxZ": 140.757,
          "minX": -540.757,
          "minZ": 131.243,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_96:площадка",
          "maxX": -612.176,
          "maxZ": 155.824,
          "minX": -619.824,
          "minZ": 148.176,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_97:площадка",
          "maxX": -595.968,
          "maxZ": 156.032,
          "minX": -604.032,
          "minZ": 147.968,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_98:площадка",
          "maxX": -579.64,
          "maxZ": 156.36,
          "minX": -588.36,
          "minZ": 147.64,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_99:площадка",
          "maxX": -564.843,
          "maxZ": 155.157,
          "minX": -571.157,
          "minZ": 148.843,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_100:площадка",
          "maxX": -532.297,
          "maxZ": 155.703,
          "minX": -539.703,
          "minZ": 148.297,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_101:площадка",
          "maxX": -611.378,
          "maxZ": 172.622,
          "minX": -620.622,
          "minZ": 163.378,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_102:площадка",
          "maxX": -580.032,
          "maxZ": 171.968,
          "minX": -587.968,
          "minZ": 164.032,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_103:площадка",
          "maxX": -563.266,
          "maxZ": 172.734,
          "minX": -572.734,
          "minZ": 163.266,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_104:площадка",
          "maxX": -547.707,
          "maxZ": 172.293,
          "minX": -556.293,
          "minZ": 163.707,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_105:площадка",
          "maxX": -532.446,
          "maxZ": 171.554,
          "minX": -539.554,
          "minZ": 164.446,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_106:площадка",
          "maxX": -611.116,
          "maxZ": 188.884,
          "minX": -620.884,
          "minZ": 179.116,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_107:площадка",
          "maxX": -580.052,
          "maxZ": 187.948,
          "minX": -587.948,
          "minZ": 180.052,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_108:площадка",
          "maxX": -564.568,
          "maxZ": 187.432,
          "minX": -571.432,
          "minZ": 180.568,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_109:площадка",
          "maxX": -532.763,
          "maxZ": 187.237,
          "minX": -539.237,
          "minZ": 180.763,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_110:площадка",
          "maxX": -611.644,
          "maxZ": 204.356,
          "minX": -620.356,
          "minZ": 195.644,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_111:площадка",
          "maxX": -547.296,
          "maxZ": 204.704,
          "minX": -556.704,
          "minZ": 195.296,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_112:площадка",
          "maxX": -531.181,
          "maxZ": 204.819,
          "minX": -540.819,
          "minZ": 195.181,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_113:площадка",
          "maxX": -628.161,
          "maxZ": 219.839,
          "minX": -635.839,
          "minZ": 212.161,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_114:площадка",
          "maxX": -595.255,
          "maxZ": 220.745,
          "minX": -604.745,
          "minZ": 211.255,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_115:площадка",
          "maxX": -563.7,
          "maxZ": 220.3,
          "minX": -572.3,
          "minZ": 211.7,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_116:площадка",
          "maxX": -532.157,
          "maxZ": 219.843,
          "minX": -539.843,
          "minZ": 212.157,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_117:площадка",
          "maxX": -627.136,
          "maxZ": 236.864,
          "minX": -636.864,
          "minZ": 227.136,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_118:площадка",
          "maxX": -596.112,
          "maxZ": 235.888,
          "minX": -603.888,
          "minZ": 228.112,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_119:площадка",
          "maxX": -580.486,
          "maxZ": 235.514,
          "minX": -587.514,
          "minZ": 228.486,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_120:площадка",
          "maxX": -547.32,
          "maxZ": 236.68,
          "minX": -556.68,
          "minZ": 227.32,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_121:площадка",
          "maxX": -627.221,
          "maxZ": 252.779,
          "minX": -636.779,
          "minZ": 243.221,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_122:площадка",
          "maxX": -611.517,
          "maxZ": 252.483,
          "minX": -620.483,
          "minZ": 243.517,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_123:площадка",
          "maxX": -579.808,
          "maxZ": 252.192,
          "minX": -588.192,
          "minZ": 243.808,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_125:площадка",
          "maxX": -611.554,
          "maxZ": 268.446,
          "minX": -620.446,
          "minZ": 259.554,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_126:площадка",
          "maxX": -580.93,
          "maxZ": 267.07,
          "minX": -587.07,
          "minZ": 260.93,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_128:площадка",
          "maxX": -628.495,
          "maxZ": 283.505,
          "minX": -635.505,
          "minZ": 276.495,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_131:площадка",
          "maxX": -612.233,
          "maxZ": 299.767,
          "minX": -619.767,
          "minZ": 292.233,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_132:площадка",
          "maxX": -596.382,
          "maxZ": 299.618,
          "minX": -603.618,
          "minZ": 292.382,
          "y": 0.031
        },
        {
          "blend": 14,
          "id": "b_district_0_2_135:площадка",
          "maxX": -628.922,
          "maxZ": 315.078,
          "minX": -635.078,
          "minZ": 308.922,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_136:площадка",
          "maxX": -611.192,
          "maxZ": 316.808,
          "minX": -620.808,
          "minZ": 307.192,
          "y": 0.014
        },
        {
          "blend": 14,
          "id": "b_district_3_2_141:площадка",
          "maxX": 549.687,
          "maxZ": 69.687,
          "minX": 530.313,
          "minZ": 50.313,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_142:площадка",
          "maxX": 591.123,
          "maxZ": 71.123,
          "minX": 568.877,
          "minZ": 48.877,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_143:площадка",
          "maxX": 634.61,
          "maxZ": 194.61,
          "minX": 605.39,
          "minZ": 165.39,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_150:площадка",
          "maxX": 537.678,
          "maxZ": 629.107,
          "minX": 513.751,
          "minZ": 605.179,
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
