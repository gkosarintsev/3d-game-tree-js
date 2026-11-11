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
          "buildings": 28,
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
          "buildings": 15,
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
          "buildings": 17,
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
          "buildings": 15,
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
          "buildings": 5,
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
          "buildings": 7
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
          "buildings": 10,
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
          "buildings": 12,
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
          "buildings": 5,
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
          "buildings": 23
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
          "buildings": 34
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
          "buildings": 22
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
          "buildings": 13
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
          "buildings": 2,
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
          "maxX": -588.142,
          "maxZ": -617.233,
          "minX": -604.586,
          "minZ": -633.676,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_2:площадка",
          "maxX": -556.627,
          "maxZ": -614.809,
          "minX": -577.918,
          "minZ": -636.1,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_3:площадка",
          "maxX": -470.822,
          "maxZ": -616.277,
          "minX": -489.178,
          "minZ": -634.632,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_4:площадка",
          "maxX": -355.802,
          "maxZ": -617.621,
          "minX": -371.47,
          "minZ": -633.288,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_5:площадка",
          "maxX": -587.443,
          "maxZ": -587.443,
          "minX": -605.284,
          "minZ": -605.284,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_6:площадка",
          "maxX": -473.017,
          "maxZ": -589.381,
          "minX": -486.983,
          "minZ": -603.346,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_7:площадка",
          "maxX": -415.177,
          "maxZ": -589.723,
          "minX": -428.459,
          "minZ": -603.004,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_8:площадка",
          "maxX": -385.533,
          "maxZ": -589.169,
          "minX": -399.922,
          "minZ": -603.558,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_9:площадка",
          "maxX": -326.206,
          "maxZ": -588.024,
          "minX": -342.885,
          "minZ": -604.703,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_10:площадка",
          "maxX": -614.684,
          "maxZ": -556.503,
          "minX": -636.225,
          "minZ": -578.043,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_11:площадка",
          "maxX": -589.064,
          "maxZ": -559.973,
          "minX": -603.663,
          "minZ": -574.572,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_12:площадка",
          "maxX": -530.398,
          "maxZ": -559.488,
          "minX": -545.966,
          "minZ": -575.057,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_13:площадка",
          "maxX": -501.603,
          "maxZ": -559.785,
          "minX": -516.579,
          "minZ": -574.76,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_14:площадка",
          "maxX": -385.406,
          "maxZ": -559.951,
          "minX": -400.049,
          "minZ": -574.594,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_15:площадка",
          "maxX": -356.137,
          "maxZ": -559.774,
          "minX": -371.135,
          "minZ": -574.772,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_16:площадка",
          "maxX": -588.484,
          "maxZ": -530.302,
          "minX": -604.244,
          "minZ": -546.062,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_17:площадка",
          "maxX": -440.702,
          "maxZ": -527.975,
          "minX": -461.116,
          "minZ": -548.389,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_18:площадка",
          "maxX": -384.004,
          "maxZ": -529.459,
          "minX": -401.45,
          "minZ": -546.905,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_20:площадка",
          "maxX": -615.485,
          "maxZ": -499.122,
          "minX": -635.424,
          "minZ": -519.06,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_21:площадка",
          "maxX": -589.251,
          "maxZ": -501.979,
          "minX": -603.476,
          "minZ": -516.203,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_22:площадка",
          "maxX": -618.449,
          "maxZ": -472.994,
          "minX": -632.46,
          "minZ": -487.006,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_23:площадка",
          "maxX": -587.621,
          "maxZ": -471.257,
          "minX": -605.106,
          "minZ": -488.743,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_24:площадка",
          "maxX": -529.438,
          "maxZ": -471.257,
          "minX": -546.925,
          "minZ": -488.743,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_25:площадка",
          "maxX": -618.63,
          "maxZ": -444.084,
          "minX": -632.279,
          "minZ": -457.734,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_26:площадка",
          "maxX": -586.998,
          "maxZ": -441.543,
          "minX": -605.73,
          "minZ": -460.275,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_27:площадка",
          "maxX": -559.589,
          "maxZ": -443.226,
          "minX": -574.956,
          "minZ": -458.592,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_28:площадка",
          "maxX": -529.374,
          "maxZ": -442.101,
          "minX": -546.99,
          "minZ": -459.717,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_29:площадка",
          "maxX": -615.816,
          "maxZ": -412.18,
          "minX": -635.093,
          "minZ": -431.456,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_30:площадка",
          "maxX": -615.579,
          "maxZ": -382.851,
          "minX": -635.33,
          "minZ": -402.603,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_31:площадка",
          "maxX": -586.228,
          "maxZ": -382.591,
          "minX": -606.5,
          "minZ": -402.863,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_32:площадка",
          "maxX": -530.58,
          "maxZ": -385.126,
          "minX": -545.783,
          "minZ": -400.329,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_33:площадка",
          "maxX": -586.413,
          "maxZ": -353.686,
          "minX": -606.314,
          "minZ": -373.587,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_34:площадка",
          "maxX": -529.391,
          "maxZ": -354.846,
          "minX": -546.972,
          "minZ": -372.427,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_35:площадка",
          "maxX": -588.077,
          "maxZ": -326.259,
          "minX": -604.65,
          "minZ": -342.832,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_39:площадка",
          "maxX": 59.666,
          "maxZ": -623.001,
          "minX": 47.001,
          "minZ": -635.666,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_40:площадка",
          "maxX": 80.922,
          "maxZ": -623.078,
          "minX": 68.412,
          "minZ": -635.588,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_41:площадка",
          "maxX": 102.405,
          "maxZ": -622.928,
          "minX": 89.595,
          "minZ": -635.739,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_42:площадка",
          "maxX": 122.105,
          "maxZ": -624.561,
          "minX": 112.561,
          "minZ": -634.105,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_43:площадка",
          "maxX": 187.746,
          "maxZ": -622.921,
          "minX": 174.921,
          "minZ": -635.746,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_45:площадка",
          "maxX": 38.988,
          "maxZ": -601.012,
          "minX": 25.012,
          "minZ": -614.988,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_46:площадка",
          "maxX": 122.348,
          "maxZ": -602.986,
          "minX": 112.319,
          "minZ": -613.014,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_47:площадка",
          "maxX": 165.182,
          "maxZ": -602.818,
          "minX": 154.818,
          "minZ": -613.182,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_51:площадка",
          "maxX": 59.233,
          "maxZ": -580.767,
          "minX": 47.433,
          "minZ": -592.567,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_52:площадка",
          "maxX": 102.695,
          "maxZ": -579.972,
          "minX": 89.305,
          "minZ": -593.362,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_53:площадка",
          "maxX": 145.679,
          "maxZ": -579.654,
          "minX": 131.654,
          "minZ": -593.679,
          "y": 0.025
        },
        {
          "blend": 14,
          "id": "b_district_2_0_60:площадка",
          "maxX": 122.618,
          "maxZ": -560.049,
          "minX": 112.049,
          "minZ": -570.618,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_66:площадка",
          "maxX": 101.886,
          "maxZ": -538.114,
          "minX": 90.114,
          "minZ": -549.886,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_73:площадка",
          "maxX": 489.552,
          "maxZ": -615.902,
          "minX": 470.448,
          "minZ": -635.007,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_74:площадка",
          "maxX": 519.28,
          "maxZ": -615.265,
          "minX": 498.901,
          "minZ": -635.644,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_75:площадка",
          "maxX": 548.777,
          "maxZ": -614.86,
          "minX": 527.587,
          "minZ": -636.05,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_76:площадка",
          "maxX": 578.006,
          "maxZ": -614.721,
          "minX": 556.539,
          "minZ": -636.188,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_77:площадка",
          "maxX": 606.738,
          "maxZ": -615.08,
          "minX": 585.989,
          "minZ": -635.829,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_78:площадка",
          "maxX": 633.302,
          "maxZ": -617.607,
          "minX": 617.607,
          "minZ": -633.302,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_80:площадка",
          "maxX": 517.253,
          "maxZ": -588.202,
          "minX": 500.929,
          "minZ": -604.526,
          "y": 0.028
        },
        {
          "blend": 14,
          "id": "b_district_3_0_81:площадка",
          "maxX": 545.064,
          "maxZ": -589.481,
          "minX": 531.299,
          "minZ": -603.246,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_82:площадка",
          "maxX": 574.521,
          "maxZ": -589.116,
          "minX": 560.025,
          "minZ": -603.612,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_89:площадка",
          "maxX": 546.819,
          "maxZ": -558.636,
          "minX": 529.545,
          "minZ": -575.909,
          "y": 0.03
        },
        {
          "blend": 14,
          "id": "b_district_3_0_90:площадка",
          "maxX": 577.841,
          "maxZ": -556.704,
          "minX": 556.704,
          "minZ": -577.841,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_96:площадка",
          "maxX": 635.869,
          "maxZ": -527.767,
          "minX": 615.04,
          "minZ": -548.596,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_99:площадка",
          "maxX": 605.13,
          "maxZ": -500.324,
          "minX": 587.597,
          "minZ": -517.858,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_100:площадка",
          "maxX": 634.993,
          "maxZ": -499.553,
          "minX": 615.916,
          "minZ": -518.629,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_101:площадка",
          "maxX": 633.617,
          "maxZ": -471.838,
          "minX": 617.292,
          "minZ": -488.162,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_103:площадка",
          "maxX": 605.878,
          "maxZ": -441.395,
          "minX": 586.849,
          "minZ": -460.423,
          "y": 0.013
        },
        {
          "blend": 14,
          "id": "b_district_3_0_107:площадка",
          "maxX": 633.053,
          "maxZ": -385.129,
          "minX": 617.856,
          "minZ": -400.325,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_110:площадка",
          "maxX": 634.529,
          "maxZ": -354.562,
          "minX": 616.38,
          "minZ": -372.711,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_113:площадка",
          "maxX": 605.784,
          "maxZ": -325.125,
          "minX": 586.943,
          "minZ": -343.966,
          "y": 0.019
        },
        {
          "blend": 14,
          "id": "b_district_3_0_114:площадка",
          "maxX": 634.573,
          "maxZ": -325.427,
          "minX": 616.336,
          "minZ": -343.664,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_115:площадка",
          "maxX": -617.222,
          "maxZ": -297.222,
          "minX": -633.687,
          "minZ": -313.687,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_116:площадка",
          "maxX": -557.439,
          "maxZ": -295.621,
          "minX": -577.106,
          "minZ": -315.288,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_117:площадка",
          "maxX": -557.194,
          "maxZ": -266.285,
          "minX": -577.351,
          "minZ": -286.442,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_118:площадка",
          "maxX": -585.956,
          "maxZ": -236.865,
          "minX": -606.771,
          "minZ": -257.68,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_119:площадка",
          "maxX": -560.018,
          "maxZ": -240.018,
          "minX": -574.528,
          "minZ": -254.528,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_120:площадка",
          "maxX": -530.204,
          "maxZ": -239.295,
          "minX": -546.159,
          "minZ": -255.25,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_121:площадка",
          "maxX": -617.772,
          "maxZ": -210.5,
          "minX": -633.137,
          "minZ": -225.864,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_122:площадка",
          "maxX": -588.294,
          "maxZ": -151.931,
          "minX": -604.433,
          "minZ": -168.069,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_123:площадка",
          "maxX": -586.326,
          "maxZ": -120.872,
          "minX": -606.401,
          "minZ": -140.946,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_124:площадка",
          "maxX": -527.677,
          "maxZ": -91.313,
          "minX": -548.687,
          "minZ": -112.323,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_125:площадка",
          "maxX": -617.428,
          "maxZ": -35.609,
          "minX": -633.482,
          "minZ": -51.663,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_126:площадка",
          "maxX": -531.443,
          "maxZ": -36.897,
          "minX": -544.921,
          "minZ": -50.375,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_127:площадка",
          "maxX": -618.63,
          "maxZ": -7.721,
          "minX": -632.279,
          "minZ": -21.37,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_128:площадка",
          "maxX": -560.562,
          "maxZ": -7.835,
          "minX": -573.984,
          "minZ": -21.256,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_131:площадка",
          "maxX": 635.34,
          "maxZ": -295.569,
          "minX": 615.569,
          "minZ": -315.34,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_133:площадка",
          "maxX": 606.635,
          "maxZ": -266.092,
          "minX": 586.092,
          "minZ": -286.635,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_134:площадка",
          "maxX": 605.526,
          "maxZ": -238.11,
          "minX": 587.201,
          "minZ": -256.435,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_135:площадка",
          "maxX": 635.154,
          "maxZ": -237.573,
          "minX": 615.755,
          "minZ": -256.972,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_136:площадка",
          "maxX": 577.827,
          "maxZ": -207.628,
          "minX": 556.719,
          "minZ": -228.736,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_137:площадка",
          "maxX": 577.714,
          "maxZ": -178.649,
          "minX": 556.831,
          "minZ": -199.532,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_138:площадка",
          "maxX": 635.004,
          "maxZ": -150.451,
          "minX": 615.905,
          "minZ": -169.549,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_139:площадка",
          "maxX": 547.464,
          "maxZ": -121.627,
          "minX": 528.899,
          "minZ": -140.192,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_140:площадка",
          "maxX": 574.954,
          "maxZ": -123.227,
          "minX": 559.591,
          "minZ": -138.591,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_141:площадка",
          "maxX": 632.578,
          "maxZ": -123.785,
          "minX": 618.331,
          "minZ": -138.033,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_142:площадка",
          "maxX": 605.055,
          "maxZ": -93.127,
          "minX": 587.673,
          "minZ": -110.509,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_143:площадка",
          "maxX": 548.727,
          "maxZ": -62.183,
          "minX": 527.637,
          "minZ": -83.272,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_144:площадка",
          "maxX": 606.048,
          "maxZ": -63.043,
          "minX": 586.679,
          "minZ": -82.412,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_145:площадка",
          "maxX": 633.416,
          "maxZ": -64.766,
          "minX": 617.493,
          "minZ": -80.689,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_146:площадка",
          "maxX": 605.01,
          "maxZ": -34.99,
          "minX": 587.718,
          "minZ": -52.282,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_147:площадка",
          "maxX": 635.885,
          "maxZ": -33.206,
          "minX": 615.024,
          "minZ": -54.067,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_148:площадка",
          "maxX": -558.356,
          "maxZ": 23.462,
          "minX": -576.189,
          "minZ": 5.629,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_149:площадка",
          "maxX": -528.588,
          "maxZ": 24.139,
          "minX": -547.775,
          "minZ": 4.952,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_150:площадка",
          "maxX": -614.901,
          "maxZ": 54.19,
          "minX": -636.008,
          "minZ": 33.083,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_151:площадка",
          "maxX": -587.246,
          "maxZ": 52.754,
          "minX": -605.481,
          "minZ": 34.519,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_152:площадка",
          "maxX": -560.47,
          "maxZ": 50.439,
          "minX": -574.076,
          "minZ": 36.833,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_153:площадка",
          "maxX": -558,
          "maxZ": 82,
          "minX": -576.545,
          "minZ": 63.455,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_154:площадка",
          "maxX": -531.514,
          "maxZ": 79.395,
          "minX": -544.85,
          "minZ": 66.059,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_155:площадка",
          "maxX": -589.377,
          "maxZ": 108.804,
          "minX": -603.35,
          "minZ": 94.832,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_156:площадка",
          "maxX": -557.964,
          "maxZ": 111.127,
          "minX": -576.582,
          "minZ": 92.509,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_157:площадка",
          "maxX": -614.981,
          "maxZ": 141.383,
          "minX": -635.928,
          "minZ": 120.435,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_158:площадка",
          "maxX": -527.574,
          "maxZ": 141.517,
          "minX": -548.79,
          "minZ": 120.301,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_159:площадка",
          "maxX": -529.626,
          "maxZ": 168.556,
          "minX": -546.737,
          "minZ": 151.444,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_160:площадка",
          "maxX": -618.184,
          "maxZ": 196.361,
          "minX": -632.725,
          "minZ": 181.82,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_161:площадка",
          "maxX": -560.154,
          "maxZ": 196.21,
          "minX": -574.392,
          "minZ": 181.972,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_162:площадка",
          "maxX": -528.529,
          "maxZ": 198.744,
          "minX": -547.835,
          "minZ": 179.438,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_163:площадка",
          "maxX": -558.266,
          "maxZ": 227.189,
          "minX": -576.279,
          "minZ": 209.175,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_164:площадка",
          "maxX": -527.528,
          "maxZ": 228.836,
          "minX": -548.836,
          "minZ": 207.528,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_165:площадка",
          "maxX": -615.111,
          "maxZ": 257.616,
          "minX": -635.798,
          "minZ": 236.929,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_166:площадка",
          "maxX": -587.08,
          "maxZ": 256.556,
          "minX": -605.647,
          "minZ": 237.989,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_167:площадка",
          "maxX": -557.333,
          "maxZ": 257.213,
          "minX": -577.213,
          "minZ": 237.333,
          "y": 0.024
        },
        {
          "blend": 14,
          "id": "b_district_0_2_168:площадка",
          "maxX": -617.778,
          "maxZ": 284.04,
          "minX": -633.131,
          "minZ": 268.687,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_172:площадка",
          "maxX": 586.025,
          "maxZ": 83.168,
          "minX": 556.832,
          "minZ": 53.975,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_173:площадка",
          "maxX": 630.68,
          "maxZ": 82.109,
          "minX": 603.606,
          "minZ": 55.034,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_174:площадка",
          "maxX": 582.697,
          "maxZ": 125.554,
          "minX": 560.161,
          "minZ": 103.018,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_175:площадка",
          "maxX": 630.081,
          "maxZ": 127.224,
          "minX": 604.204,
          "minZ": 101.347,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_176:площадка",
          "maxX": 588.41,
          "maxZ": 176.982,
          "minX": 554.447,
          "minZ": 143.018,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_177:площадка",
          "maxX": 585.208,
          "maxZ": 219.494,
          "minX": 557.649,
          "minZ": 191.935,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_178:площадка",
          "maxX": 632.68,
          "maxZ": 221.252,
          "minX": 601.606,
          "minZ": 190.177,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_179:площадка",
          "maxX": 634.238,
          "maxZ": 268.524,
          "minX": 600.048,
          "minZ": 234.333,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_189:площадка",
          "maxX": -129.156,
          "maxZ": 590.844,
          "minX": -150.844,
          "minZ": 569.156,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_190:площадка",
          "maxX": -89.259,
          "maxZ": 590.741,
          "minX": -110.741,
          "minZ": 569.259,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_194:площадка",
          "maxX": -169.001,
          "maxZ": 630.999,
          "minX": -190.999,
          "minZ": 609.001,
          "y": 0.025
        },
        {
          "blend": 14,
          "id": "b_district_1_3_195:площадка",
          "maxX": -125.027,
          "maxZ": 634.973,
          "minX": -154.973,
          "minZ": 605.027,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_196:площадка",
          "maxX": -89.06,
          "maxZ": 630.94,
          "minX": -110.94,
          "minZ": 609.06,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_197:площадка",
          "maxX": -47.049,
          "maxZ": 632.951,
          "minX": -72.951,
          "minZ": 607.049,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_199:площадка",
          "maxX": 539.03,
          "maxZ": 630.458,
          "minX": 512.399,
          "minZ": 603.828,
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
