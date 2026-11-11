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
          "buildings": 8,
          "lights": 2,
          "props": 33,
          "roads": 8
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
          "props": 8,
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
          "buildings": 53,
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
          "buildings": 118,
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
          "props": 9
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
          "buildings": 30,
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
          "buildings": 13,
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
          "buildings": 14,
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
          "buildings": 6,
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
          "buildings": 1,
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
          "buildings": 3,
          "channels": 1,
          "lights": 1,
          "props": 4,
          "roads": 5
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
          "buildings": 40,
          "props": 81
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
          "buildings": 22,
          "props": 14
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
          "buildings": 1
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
          "buildings": 1,
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
          "props": 94
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
          "buildings": 18
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
          "buildings": 11
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
          "buildings": 3,
          "lights": 5,
          "roads": 32
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
          "id": "b_district_3_3_23:площадка",
          "maxX": 487.584,
          "maxZ": 624.727,
          "minX": 472.416,
          "minZ": 609.559,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_24:площадка",
          "maxX": 535.703,
          "maxZ": 627.131,
          "minX": 515.726,
          "minZ": 607.154,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_25:площадка",
          "maxX": -528.527,
          "maxZ": -237.618,
          "minX": -547.837,
          "minZ": -256.927,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_26:площадка",
          "maxX": -530.778,
          "maxZ": -210.778,
          "minX": -545.585,
          "minZ": -225.585,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_27:площадка",
          "maxX": -527.77,
          "maxZ": -178.679,
          "minX": -548.593,
          "minZ": -199.502,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_28:площадка",
          "maxX": -527.616,
          "maxZ": -149.435,
          "minX": -548.747,
          "minZ": -170.565,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_29:площадка",
          "maxX": -531.221,
          "maxZ": -94.857,
          "minX": -545.143,
          "minZ": -108.779,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_30:площадка",
          "maxX": -531.05,
          "maxZ": -65.595,
          "minX": -545.314,
          "minZ": -79.859,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_31:площадка",
          "maxX": -529.828,
          "maxZ": -35.283,
          "minX": -546.536,
          "minZ": -51.99,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_32:площадка",
          "maxX": -528.067,
          "maxZ": -4.431,
          "minX": -548.297,
          "minZ": -24.66,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_33:площадка",
          "maxX": -448.104,
          "maxZ": -528.104,
          "minX": -471.896,
          "minZ": -551.896,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_34:площадка",
          "maxX": -526.122,
          "maxZ": -326.122,
          "minX": -553.878,
          "minZ": -353.878,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_38:площадка",
          "maxX": -607.541,
          "maxZ": -527.541,
          "minX": -632.459,
          "minZ": -552.459,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_39:площадка",
          "maxX": -408.388,
          "maxZ": -528.388,
          "minX": -431.612,
          "minZ": -551.612,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_41:площадка",
          "maxX": -538.446,
          "maxZ": 37.554,
          "minX": -549.554,
          "minZ": 26.446,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_42:площадка",
          "maxX": -539.498,
          "maxZ": 57.836,
          "minX": -548.502,
          "minZ": 48.831,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_43:площадка",
          "maxX": -539.413,
          "maxZ": 79.254,
          "minX": -548.587,
          "minZ": 70.079,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_44:площадка",
          "maxX": -539.105,
          "maxZ": 100.895,
          "minX": -548.895,
          "minZ": 91.105,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_45:площадка",
          "maxX": -537.134,
          "maxZ": 124.2,
          "minX": -550.866,
          "minZ": 110.467,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_46:площадка",
          "maxX": -537.571,
          "maxZ": 145.095,
          "minX": -550.429,
          "minZ": 132.238,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_73:площадка",
          "maxX": -558.614,
          "maxZ": 17.386,
          "minX": -572.053,
          "minZ": 3.947,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_74:площадка",
          "maxX": -559.049,
          "maxZ": 38.284,
          "minX": -571.617,
          "minZ": 25.716,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_75:площадка",
          "maxX": -558.3,
          "maxZ": 60.367,
          "minX": -572.367,
          "minZ": 46.3,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_76:площадка",
          "maxX": -559.287,
          "maxZ": 80.713,
          "minX": -571.38,
          "minZ": 68.62,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_77:площадка",
          "maxX": -559.668,
          "maxZ": 144.332,
          "minX": -570.998,
          "minZ": 133.002,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_78:площадка",
          "maxX": -559.687,
          "maxZ": 165.646,
          "minX": -570.98,
          "minZ": 154.354,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_79:площадка",
          "maxX": -559.584,
          "maxZ": 187.083,
          "minX": -571.083,
          "minZ": 175.584,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_80:площадка",
          "maxX": -560.827,
          "maxZ": 207.173,
          "minX": -569.839,
          "minZ": 198.161,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_81:площадка",
          "maxX": -559.612,
          "maxZ": 229.722,
          "minX": -571.055,
          "minZ": 218.278,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_85:площадка",
          "maxX": -559.528,
          "maxZ": -239.528,
          "minX": -575.017,
          "minZ": -255.017,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_86:площадка",
          "maxX": -557.893,
          "maxZ": -208.802,
          "minX": -576.652,
          "minZ": -227.561,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_87:площадка",
          "maxX": -557.239,
          "maxZ": -120.876,
          "minX": -577.306,
          "minZ": -140.943,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_88:площадка",
          "maxX": -558.494,
          "maxZ": -93.04,
          "minX": -576.051,
          "minZ": -110.597,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_89:площадка",
          "maxX": -557.812,
          "maxZ": -63.267,
          "minX": -576.733,
          "minZ": -82.188,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_90:площадка",
          "maxX": -556.704,
          "maxZ": -33.068,
          "minX": -577.841,
          "minZ": -54.205,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_117:площадка",
          "maxX": -565.429,
          "maxZ": -605.429,
          "minX": -594.571,
          "minZ": -634.571,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_118:площадка",
          "maxX": -446.03,
          "maxZ": -606.03,
          "minX": -473.97,
          "minZ": -633.97,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_119:площадка",
          "maxX": -606.834,
          "maxZ": -446.834,
          "minX": -633.166,
          "minZ": -473.166,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_135:площадка",
          "maxX": -582.092,
          "maxZ": 15.241,
          "minX": -591.241,
          "minZ": 6.092,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_136:площадка",
          "maxX": -581.7,
          "maxZ": 36.967,
          "minX": -591.634,
          "minZ": 27.033,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_137:площадка",
          "maxX": -580.305,
          "maxZ": 59.695,
          "minX": -593.028,
          "minZ": 46.972,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_138:площадка",
          "maxX": -581.298,
          "maxZ": 80.035,
          "minX": -592.035,
          "minZ": 69.298,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_139:площадка",
          "maxX": -582.04,
          "maxZ": 100.627,
          "minX": -591.294,
          "minZ": 91.373,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_140:площадка",
          "maxX": -580.94,
          "maxZ": 144.394,
          "minX": -592.394,
          "minZ": 132.94,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_141:площадка",
          "maxX": -580.253,
          "maxZ": 187.747,
          "minX": -593.081,
          "minZ": 174.919,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_142:площадка",
          "maxX": -579.72,
          "maxZ": 209.613,
          "minX": -593.613,
          "minZ": 195.72,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_143:площадка",
          "maxX": -580.241,
          "maxZ": 230.425,
          "minX": -593.092,
          "minZ": 217.575,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_144:площадка",
          "maxX": -581.54,
          "maxZ": 250.46,
          "minX": -591.793,
          "minZ": 240.207,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_145:площадка",
          "maxX": -581.866,
          "maxZ": 271.467,
          "minX": -591.467,
          "minZ": 261.866,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_150:площадка",
          "maxX": -588.101,
          "maxZ": -151.738,
          "minX": -604.626,
          "minZ": -168.262,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_151:площадка",
          "maxX": -128.307,
          "maxZ": 631.693,
          "minX": -151.693,
          "minZ": 608.307,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_177:площадка",
          "maxX": -601.405,
          "maxZ": 17.262,
          "minX": -614.595,
          "minZ": 4.072,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_178:площадка",
          "maxX": -600.719,
          "maxZ": 39.281,
          "minX": -615.281,
          "minZ": 24.719,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_179:площадка",
          "maxX": -600.894,
          "maxZ": 81.773,
          "minX": -615.106,
          "minZ": 67.561,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_180:площадка",
          "maxX": -601.914,
          "maxZ": 123.419,
          "minX": -614.086,
          "minZ": 111.247,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_181:площадка",
          "maxX": -601.923,
          "maxZ": 144.743,
          "minX": -614.077,
          "minZ": 132.59,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_182:площадка",
          "maxX": -602.796,
          "maxZ": 186.537,
          "minX": -613.204,
          "minZ": 176.129,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_183:площадка",
          "maxX": -601.326,
          "maxZ": 230.674,
          "minX": -614.674,
          "minZ": 217.326,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_204:площадка",
          "maxX": -609.157,
          "maxZ": -329.157,
          "minX": -630.843,
          "minZ": -350.843,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_209:площадка",
          "maxX": -604.302,
          "maxZ": -604.302,
          "minX": -635.698,
          "minZ": -635.698,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_210:площадка",
          "maxX": -408.789,
          "maxZ": -608.789,
          "minX": -431.211,
          "minZ": -631.211,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_213:площадка",
          "maxX": -326.454,
          "maxZ": -566.454,
          "minX": -353.546,
          "minZ": -593.546,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_214:площадка",
          "maxX": -615.968,
          "maxZ": -295.968,
          "minX": -634.941,
          "minZ": -314.941,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_215:площадка",
          "maxX": -615.049,
          "maxZ": -236.867,
          "minX": -635.86,
          "minZ": -257.678,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_216:площадка",
          "maxX": -618,
          "maxZ": -181.637,
          "minX": -632.909,
          "minZ": -196.545,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_217:площадка",
          "maxX": -615.672,
          "maxZ": -150.217,
          "minX": -635.238,
          "minZ": -169.783,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_218:площадка",
          "maxX": -616.916,
          "maxZ": -64.188,
          "minX": -633.994,
          "minZ": -81.266,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_219:площадка",
          "maxX": -616.975,
          "maxZ": -6.066,
          "minX": -633.934,
          "minZ": -23.025,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_222:площадка",
          "maxX": -623.816,
          "maxZ": 16.184,
          "minX": -634.851,
          "minZ": 5.149,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_223:площадка",
          "maxX": -624.021,
          "maxZ": 37.313,
          "minX": -634.646,
          "minZ": 26.687,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_224:площадка",
          "maxX": -622.31,
          "maxZ": 60.357,
          "minX": -636.357,
          "minZ": 46.31,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_225:площадка",
          "maxX": -622.319,
          "maxZ": 81.681,
          "minX": -636.348,
          "minZ": 67.652,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_226:площадка",
          "maxX": -624.263,
          "maxZ": 101.071,
          "minX": -634.404,
          "minZ": 90.929,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_227:площадка",
          "maxX": -622.068,
          "maxZ": 124.599,
          "minX": -636.599,
          "minZ": 110.068,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_228:площадка",
          "maxX": -624.559,
          "maxZ": 143.441,
          "minX": -634.108,
          "minZ": 133.892,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_229:площадка",
          "maxX": -624.774,
          "maxZ": 164.559,
          "minX": -633.893,
          "minZ": 155.441,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_230:площадка",
          "maxX": -624.362,
          "maxZ": 207.638,
          "minX": -634.305,
          "minZ": 197.695,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_231:площадка",
          "maxX": -624.722,
          "maxZ": 271.278,
          "minX": -633.944,
          "minZ": 262.056,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_232:площадка",
          "maxX": -628.249,
          "maxZ": 331.751,
          "minX": -635.751,
          "minZ": 324.249,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_233:площадка",
          "maxX": -628.88,
          "maxZ": 347.12,
          "minX": -635.12,
          "minZ": 340.88,
          "y": 0.008
        },
        {
          "blend": 14,
          "id": "b_district_0_3_254:площадка",
          "maxX": -612.025,
          "maxZ": 587.975,
          "minX": -619.975,
          "minZ": 580.025,
          "y": 0.046
        },
        {
          "blend": 14,
          "id": "b_district_0_3_256:площадка",
          "maxX": -629.461,
          "maxZ": 554.539,
          "minX": -634.539,
          "minZ": 549.461,
          "y": 0.027
        },
        {
          "blend": 14,
          "id": "b_district_0_3_258:площадка",
          "maxX": -611.823,
          "maxZ": 604.177,
          "minX": -620.177,
          "minZ": 595.823,
          "y": 0.001
        },
        {
          "blend": 14,
          "id": "b_district_0_3_261:площадка",
          "maxX": -628.636,
          "maxZ": 587.364,
          "minX": -635.364,
          "minZ": 580.636,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_262:площадка",
          "maxX": -580.139,
          "maxZ": 635.861,
          "minX": -587.861,
          "minZ": 628.139,
          "y": 0.02
        },
        {
          "blend": 14,
          "id": "b_district_0_0_263:площадка",
          "maxX": -328.613,
          "maxZ": -608.613,
          "minX": -351.387,
          "minZ": -631.387,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_264:площадка",
          "maxX": -613.524,
          "maxZ": 618.476,
          "minX": -618.476,
          "minZ": 613.524,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_265:площадка",
          "maxX": -612.32,
          "maxZ": 635.68,
          "minX": -619.68,
          "minZ": 628.32,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_266:площадка",
          "maxX": -628.681,
          "maxZ": 635.319,
          "minX": -635.319,
          "minZ": 628.681,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_267:площадка",
          "maxX": 629.704,
          "maxZ": 218.275,
          "minX": 604.582,
          "minZ": 193.154,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_278:площадка",
          "maxX": 486.728,
          "maxZ": -7.817,
          "minX": 473.272,
          "minZ": -21.273,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_279:площадка",
          "maxX": 546.699,
          "maxZ": -6.028,
          "minX": 529.665,
          "minZ": -23.062,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_280:площадка",
          "maxX": 402.128,
          "maxZ": -5.144,
          "minX": 383.326,
          "minZ": -23.947,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_284:площадка",
          "maxX": 460.759,
          "maxZ": -33.787,
          "minX": 441.059,
          "minZ": -53.486,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_285:площадка",
          "maxX": 603.074,
          "maxZ": -36.926,
          "minX": 589.653,
          "minZ": -50.347,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_286:площадка",
          "maxX": 374.456,
          "maxZ": -32.817,
          "minX": 352.817,
          "minZ": -54.456,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_293:площадка",
          "maxX": 490.579,
          "maxZ": -62.149,
          "minX": 469.421,
          "minZ": -83.306,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_294:площадка",
          "maxX": 519.431,
          "maxZ": -62.387,
          "minX": 498.75,
          "minZ": -83.068,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_298:площадка",
          "maxX": 81.211,
          "maxZ": -580.122,
          "minX": 68.122,
          "minZ": -593.211,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_299:площадка",
          "maxX": 79.391,
          "maxZ": -603.276,
          "minX": 69.942,
          "minZ": -612.724,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_300:площадка",
          "maxX": 81.805,
          "maxZ": -622.195,
          "minX": 67.529,
          "minZ": -636.471,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_306:площадка",
          "maxX": 460.253,
          "maxZ": -92.474,
          "minX": 441.565,
          "minZ": -111.162,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_307:площадка",
          "maxX": 487.4,
          "maxZ": -94.418,
          "minX": 472.6,
          "minZ": -109.218,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_308:площадка",
          "maxX": 546.475,
          "maxZ": -93.525,
          "minX": 529.889,
          "minZ": -110.111,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_309:площадка",
          "maxX": 102.185,
          "maxZ": -601.815,
          "minX": 89.815,
          "minZ": -614.185,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_310:площадка",
          "maxX": 341.428,
          "maxZ": -94.936,
          "minX": 327.663,
          "minZ": -108.701,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_316:площадка",
          "maxX": 122.404,
          "maxZ": -581.596,
          "minX": 112.262,
          "minZ": -591.738,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_318:площадка",
          "maxX": 459.896,
          "maxZ": -121.922,
          "minX": 441.922,
          "minZ": -139.896,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_325:площадка",
          "maxX": 143.596,
          "maxZ": -603.07,
          "minX": 133.737,
          "minZ": -612.93,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_330:площадка",
          "maxX": 515.954,
          "maxZ": -153.137,
          "minX": 502.228,
          "minZ": -166.863,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_334:площадка",
          "maxX": 166.559,
          "maxZ": -622.774,
          "minX": 153.441,
          "minZ": -635.893,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_340:площадка",
          "maxX": 577.081,
          "maxZ": -179.283,
          "minX": 557.465,
          "minZ": -198.899,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_341:площадка",
          "maxX": 633.026,
          "maxZ": -181.519,
          "minX": 617.883,
          "minZ": -196.663,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_377:площадка",
          "maxX": 605.816,
          "maxZ": -266.911,
          "minX": 586.911,
          "minZ": -285.816,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_396:площадка",
          "maxX": 633.977,
          "maxZ": -326.023,
          "minX": 616.932,
          "minZ": -343.068,
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
          "id": "tr_gb_22",
          "points": [
            {
              "x": 616,
              "y": 0,
              "z": 520
            },
            {
              "x": 616,
              "y": 0,
              "z": 532
            },
            {
              "x": 616,
              "y": 0,
              "z": 544
            },
            {
              "x": 616,
              "y": 0,
              "z": 556
            },
            {
              "x": 616,
              "y": 0,
              "z": 568
            },
            {
              "x": 616,
              "y": 0,
              "z": 580
            },
            {
              "x": 616,
              "y": 0,
              "z": 592
            },
            {
              "x": 616,
              "y": 0,
              "z": 604
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
          "id": "tr_gb_23",
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
          "id": "tr_gb_24",
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
          "id": "tr_gb_25",
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
          "id": "tr_gb_26",
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
          "id": "tr_gb_27",
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
              "x": 440,
              "y": 10.43,
              "z": 520
            },
            {
              "x": 432,
              "y": 10.7,
              "z": 520
            },
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
          "id": "tr_gc_35",
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
          "id": "tr_gc_36",
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
          "id": "tr_gc_37",
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
          "id": "tr_gb_38",
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
          "id": "tr_gb_39",
          "points": [
            {
              "x": 520,
              "y": 18.3,
              "z": 424
            },
            {
              "x": 526,
              "y": 16.5,
              "z": 424
            },
            {
              "x": 538,
              "y": 12.9,
              "z": 424
            },
            {
              "x": 544,
              "y": 11.12,
              "z": 424
            },
            {
              "x": 556,
              "y": 7.87,
              "z": 424
            },
            {
              "x": 568,
              "y": 5.02,
              "z": 424
            },
            {
              "x": 580,
              "y": 2.69,
              "z": 424
            },
            {
              "x": 592,
              "y": 1.01,
              "z": 424
            },
            {
              "x": 604,
              "y": 0.11,
              "z": 424
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
          "id": "tr_gb_40",
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
          "id": "tr_gb_41",
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
            },
            {
              "x": -60.56,
              "y": 0.09,
              "z": 580
            },
            {
              "x": -60.56,
              "y": 0,
              "z": 592
            },
            {
              "x": -60.56,
              "y": 0,
              "z": 604
            },
            {
              "x": -60.56,
              "y": 0,
              "z": 616
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
