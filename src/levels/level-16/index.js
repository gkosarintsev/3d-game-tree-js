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
          "buildings": 13,
          "lights": 2,
          "props": 35,
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
          "buildings": 16,
          "props": 12,
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
          "buildings": 31,
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
          "buildings": 117,
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
          "props": 26
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
          "props": 7
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
          "buildings": 28,
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
          "buildings": 15,
          "channels": 1,
          "props": 41
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
          "buildings": 38,
          "props": 75
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
          "buildings": 21,
          "props": 18
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
          "buildings": 8
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
          "buildings": 6
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
        "objects": {
          "props": 96
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
          "buildings": 7
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
          "id": "b_district_0_1_23:площадка",
          "maxX": -529.541,
          "maxZ": -296.814,
          "minX": -546.823,
          "minZ": -314.095,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_24:площадка",
          "maxX": -527.693,
          "maxZ": -265.875,
          "minX": -548.67,
          "minZ": -286.852,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_25:площадка",
          "maxX": -531.022,
          "maxZ": -240.113,
          "minX": -545.342,
          "minZ": -254.433,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_26:площадка",
          "maxX": -530.525,
          "maxZ": -210.525,
          "minX": -545.839,
          "minZ": -225.839,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_27:площадка",
          "maxX": -530.332,
          "maxZ": -181.241,
          "minX": -546.032,
          "minZ": -196.941,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_28:площадка",
          "maxX": -530.966,
          "maxZ": -152.784,
          "minX": -545.398,
          "minZ": -167.216,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_29:площадка",
          "maxX": -527.392,
          "maxZ": -120.119,
          "minX": -548.972,
          "minZ": -141.699,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_30:площадка",
          "maxX": -528.66,
          "maxZ": -92.297,
          "minX": -547.703,
          "minZ": -111.34,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_31:площадка",
          "maxX": -528.949,
          "maxZ": -63.494,
          "minX": -547.415,
          "minZ": -81.96,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_32:площадка",
          "maxX": -530.582,
          "maxZ": -6.946,
          "minX": -545.782,
          "minZ": -22.145,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_33:площадка",
          "maxX": -487.182,
          "maxZ": -567.182,
          "minX": -512.818,
          "minZ": -592.818,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_34:площадка",
          "maxX": -567.687,
          "maxZ": -527.687,
          "minX": -592.313,
          "minZ": -552.313,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_35:площадка",
          "maxX": -570.018,
          "maxZ": -490.018,
          "minX": -589.982,
          "minZ": -509.982,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_40:площадка",
          "maxX": -487.541,
          "maxZ": -607.541,
          "minX": -512.459,
          "minZ": -632.459,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_41:площадка",
          "maxX": -608.388,
          "maxZ": -528.388,
          "minX": -631.612,
          "minZ": -551.612,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_42:площадка",
          "maxX": -607.069,
          "maxZ": -487.069,
          "minX": -632.931,
          "minZ": -512.931,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_44:площадка",
          "maxX": -539.498,
          "maxZ": 36.502,
          "minX": -548.502,
          "minZ": 27.498,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_45:площадка",
          "maxX": -539.413,
          "maxZ": 57.921,
          "minX": -548.587,
          "minZ": 48.746,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_46:площадка",
          "maxX": -539.105,
          "maxZ": 79.562,
          "minX": -548.895,
          "minZ": 69.771,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_47:площадка",
          "maxX": -537.134,
          "maxZ": 102.866,
          "minX": -550.866,
          "minZ": 89.134,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_48:площадка",
          "maxX": -537.571,
          "maxZ": 123.762,
          "minX": -550.429,
          "minZ": 110.905,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_49:площадка",
          "maxX": -539.26,
          "maxZ": 228.74,
          "minX": -548.74,
          "minZ": 219.26,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_74:площадка",
          "maxX": -558.15,
          "maxZ": 17.85,
          "minX": -572.517,
          "minZ": 3.483,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_75:площадка",
          "maxX": -559.049,
          "maxZ": 59.617,
          "minX": -571.617,
          "minZ": 47.049,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_76:площадка",
          "maxX": -558.3,
          "maxZ": 81.7,
          "minX": -572.367,
          "minZ": 67.633,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_77:площадка",
          "maxX": -559.287,
          "maxZ": 102.047,
          "minX": -571.38,
          "minZ": 89.953,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_78:площадка",
          "maxX": -559.668,
          "maxZ": 165.665,
          "minX": -570.998,
          "minZ": 154.335,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_79:площадка",
          "maxX": -559.687,
          "maxZ": 186.98,
          "minX": -570.98,
          "minZ": 175.687,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_80:площадка",
          "maxX": -559.584,
          "maxZ": 208.416,
          "minX": -571.083,
          "minZ": 196.917,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_81:площадка",
          "maxX": -560.827,
          "maxZ": 228.506,
          "minX": -569.839,
          "minZ": 219.494,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_82:площадка",
          "maxX": -559.612,
          "maxZ": 251.055,
          "minX": -571.055,
          "minZ": 239.612,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_85:площадка",
          "maxX": -559.528,
          "maxZ": -181.347,
          "minX": -575.017,
          "minZ": -196.835,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_86:площадка",
          "maxX": -557.893,
          "maxZ": -150.62,
          "minX": -576.652,
          "minZ": -169.38,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_87:площадка",
          "maxX": -557.239,
          "maxZ": -62.694,
          "minX": -577.306,
          "minZ": -82.761,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_88:площадка",
          "maxX": -558.494,
          "maxZ": -34.858,
          "minX": -576.051,
          "minZ": -52.415,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_89:площадка",
          "maxX": -557.812,
          "maxZ": -5.085,
          "minX": -576.733,
          "minZ": -24.006,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_117:площадка",
          "maxX": -565.904,
          "maxZ": -605.904,
          "minX": -594.096,
          "minZ": -634.096,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_118:площадка",
          "maxX": -446.931,
          "maxZ": -606.931,
          "minX": -473.069,
          "minZ": -633.069,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_119:площадка",
          "maxX": -605.429,
          "maxZ": -565.429,
          "minX": -634.571,
          "minZ": -594.571,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_120:площадка",
          "maxX": -406.03,
          "maxZ": -566.03,
          "minX": -433.97,
          "minZ": -593.97,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_134:площадка",
          "maxX": -579.481,
          "maxZ": 17.852,
          "minX": -593.852,
          "minZ": 3.481,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_135:площадка",
          "maxX": -580.831,
          "maxZ": 59.169,
          "minX": -592.502,
          "minZ": 47.498,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_136:площадка",
          "maxX": -582.092,
          "maxZ": 79.241,
          "minX": -591.241,
          "minZ": 70.092,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_137:площадка",
          "maxX": -581.7,
          "maxZ": 100.967,
          "minX": -591.634,
          "minZ": 91.033,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_138:площадка",
          "maxX": -580.305,
          "maxZ": 123.695,
          "minX": -593.028,
          "minZ": 110.972,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_139:площадка",
          "maxX": -581.298,
          "maxZ": 144.035,
          "minX": -592.035,
          "minZ": 133.298,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_140:площадка",
          "maxX": -582.04,
          "maxZ": 164.627,
          "minX": -591.294,
          "minZ": 155.373,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_141:площадка",
          "maxX": -580.94,
          "maxZ": 208.394,
          "minX": -592.394,
          "minZ": 196.94,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_142:площадка",
          "maxX": -580.253,
          "maxZ": 251.747,
          "minX": -593.081,
          "minZ": 238.919,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_143:площадка",
          "maxX": -579.72,
          "maxZ": 273.613,
          "minX": -593.613,
          "minZ": 259.72,
          "y": 0.006
        },
        {
          "blend": 14,
          "id": "b_district_0_1_148:площадка",
          "maxX": -587.103,
          "maxZ": -179.83,
          "minX": -605.624,
          "minZ": -198.352,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_149:площадка",
          "maxX": -588.899,
          "maxZ": -152.535,
          "minX": -603.828,
          "minZ": -167.465,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_150:площадка",
          "maxX": -588.101,
          "maxZ": -6.283,
          "minX": -604.626,
          "minZ": -22.808,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_175:площадка",
          "maxX": 353.033,
          "maxZ": 627.318,
          "minX": 332.682,
          "minZ": 606.967,
          "y": 0.033
        },
        {
          "blend": 14,
          "id": "b_district_0_2_178:площадка",
          "maxX": -601.438,
          "maxZ": 17.229,
          "minX": -614.562,
          "minZ": 4.105,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_179:площадка",
          "maxX": -602.552,
          "maxZ": 37.448,
          "minX": -613.448,
          "minZ": 26.552,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_180:площадка",
          "maxX": -602.309,
          "maxZ": 187.025,
          "minX": -613.691,
          "minZ": 175.642,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_181:площадка",
          "maxX": -601.723,
          "maxZ": 208.944,
          "minX": -614.277,
          "minZ": 196.39,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_182:площадка",
          "maxX": -602.071,
          "maxZ": 229.929,
          "minX": -613.929,
          "minZ": 218.071,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_183:площадка",
          "maxX": -601.788,
          "maxZ": 251.545,
          "minX": -614.212,
          "minZ": 239.121,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_207:площадка",
          "maxX": -604.741,
          "maxZ": -604.741,
          "minX": -635.259,
          "minZ": -635.259,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_208:площадка",
          "maxX": -404.902,
          "maxZ": -604.902,
          "minX": -435.098,
          "minZ": -635.098,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_211:площадка",
          "maxX": -328.789,
          "maxZ": -568.789,
          "minX": -351.211,
          "minZ": -591.211,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_212:площадка",
          "maxX": -618.428,
          "maxZ": -269.337,
          "minX": -632.482,
          "minZ": -283.391,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_213:площадка",
          "maxX": -617.579,
          "maxZ": -239.397,
          "minX": -633.33,
          "minZ": -255.148,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_214:площадка",
          "maxX": -616.787,
          "maxZ": -209.515,
          "minX": -634.122,
          "minZ": -226.849,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_215:площадка",
          "maxX": -615.5,
          "maxZ": -150.046,
          "minX": -635.409,
          "minZ": -169.954,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_216:площадка",
          "maxX": -615.968,
          "maxZ": -121.423,
          "minX": -634.941,
          "minZ": -140.396,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_217:площадка",
          "maxX": -615.049,
          "maxZ": -62.322,
          "minX": -635.86,
          "minZ": -83.133,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_218:площадка",
          "maxX": -618,
          "maxZ": -7.091,
          "minX": -632.909,
          "minZ": -22,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_220:площадка",
          "maxX": -367.594,
          "maxZ": -607.594,
          "minX": -392.406,
          "minZ": -632.406,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_221:площадка",
          "maxX": -622.677,
          "maxZ": 17.323,
          "minX": -635.989,
          "minZ": 4.011,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_222:площадка",
          "maxX": -622.038,
          "maxZ": 39.296,
          "minX": -636.629,
          "minZ": 24.704,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_223:площадка",
          "maxX": -624.635,
          "maxZ": 100.698,
          "minX": -634.031,
          "minZ": 91.302,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_224:площадка",
          "maxX": -624.779,
          "maxZ": 121.888,
          "minX": -633.888,
          "minZ": 112.779,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_225:площадка",
          "maxX": -623.518,
          "maxZ": 144.482,
          "minX": -635.149,
          "minZ": 132.851,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_226:площадка",
          "maxX": -622.31,
          "maxZ": 188.357,
          "minX": -636.357,
          "minZ": 174.31,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_227:площадка",
          "maxX": -622.319,
          "maxZ": 209.681,
          "minX": -636.348,
          "minZ": 195.652,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_228:площадка",
          "maxX": -624.263,
          "maxZ": 229.071,
          "minX": -634.404,
          "minZ": 218.929,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_229:площадка",
          "maxX": -622.068,
          "maxZ": 252.599,
          "minX": -636.599,
          "minZ": 238.068,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_230:площадка",
          "maxX": -624.559,
          "maxZ": 271.441,
          "minX": -634.108,
          "minZ": 261.892,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_231:площадка",
          "maxX": -624.774,
          "maxZ": 292.559,
          "minX": -633.893,
          "minZ": 283.441,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_249:площадка",
          "maxX": -613.01,
          "maxZ": 586.99,
          "minX": -618.99,
          "minZ": 581.01,
          "y": 0.034
        },
        {
          "blend": 14,
          "id": "b_district_0_3_251:площадка",
          "maxX": -629.285,
          "maxZ": 554.715,
          "minX": -634.715,
          "minZ": 549.285,
          "y": 0.029
        },
        {
          "blend": 14,
          "id": "b_district_0_3_253:площадка",
          "maxX": -629.165,
          "maxZ": 570.835,
          "minX": -634.835,
          "minZ": 565.165,
          "y": 0.001
        },
        {
          "blend": 14,
          "id": "b_district_0_3_255:площадка",
          "maxX": -612.202,
          "maxZ": 603.798,
          "minX": -619.798,
          "minZ": 596.202,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_257:площадка",
          "maxX": -580.862,
          "maxZ": 635.138,
          "minX": -587.138,
          "minZ": 628.862,
          "y": 0.014
        },
        {
          "blend": 14,
          "id": "b_district_0_0_258:площадка",
          "maxX": -327.048,
          "maxZ": -607.048,
          "minX": -352.952,
          "minZ": -632.952,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_260:площадка",
          "maxX": -628.786,
          "maxZ": 603.214,
          "minX": -635.214,
          "minZ": 596.786,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_261:площадка",
          "maxX": -597.473,
          "maxZ": 634.527,
          "minX": -602.527,
          "minZ": 629.473,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_262:площадка",
          "maxX": -629.228,
          "maxZ": 634.772,
          "minX": -634.772,
          "minZ": 629.228,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_266:площадка",
          "maxX": 584.904,
          "maxZ": 219.19,
          "minX": 557.953,
          "minZ": 192.239,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_281:площадка",
          "maxX": 457.754,
          "maxZ": -7.701,
          "minX": 444.065,
          "minZ": -21.39,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_282:площадка",
          "maxX": 488.678,
          "maxZ": -5.867,
          "minX": 471.322,
          "minZ": -23.223,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_284:площадка",
          "maxX": 15.213,
          "maxZ": -624.787,
          "minX": 6.12,
          "minZ": -633.88,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_285:площадка",
          "maxX": 430.559,
          "maxZ": -34.895,
          "minX": 413.077,
          "minZ": -52.378,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_286:площадка",
          "maxX": 605.755,
          "maxZ": -34.245,
          "minX": 586.972,
          "minZ": -53.028,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_287:площадка",
          "maxX": 400.354,
          "maxZ": -36.01,
          "minX": 385.101,
          "minZ": -51.263,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_293:площадка",
          "maxX": 57.901,
          "maxZ": -624.766,
          "minX": 48.766,
          "minZ": -633.901,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_298:площадка",
          "maxX": 79.981,
          "maxZ": -602.685,
          "minX": 69.352,
          "minZ": -613.315,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_304:площадка",
          "maxX": 102.953,
          "maxZ": -579.714,
          "minX": 89.047,
          "minZ": -593.619,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_305:площадка",
          "maxX": 458.085,
          "maxZ": -94.643,
          "minX": 443.733,
          "minZ": -108.994,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_306:площадка",
          "maxX": 103.105,
          "maxZ": -600.895,
          "minX": 88.895,
          "minZ": -615.105,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_308:площадка",
          "maxX": 371.88,
          "maxZ": -93.574,
          "minX": 355.392,
          "minZ": -110.062,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_317:площадка",
          "maxX": 428.786,
          "maxZ": -123.941,
          "minX": 414.85,
          "minZ": -137.877,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_318:площадка",
          "maxX": 460.78,
          "maxZ": -121.038,
          "minX": 441.038,
          "minZ": -140.78,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_319:площадка",
          "maxX": 519.619,
          "maxZ": -120.381,
          "minX": 498.563,
          "minZ": -141.437,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_320:площадка",
          "maxX": 577.842,
          "maxZ": -120.339,
          "minX": 556.703,
          "minZ": -141.479,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_321:площадка",
          "maxX": 603.378,
          "maxZ": -123.895,
          "minX": 589.349,
          "minZ": -137.923,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_327:площадка",
          "maxX": 144.289,
          "maxZ": -581.044,
          "minX": 133.044,
          "minZ": -592.289,
          "y": 0.007
        },
        {
          "blend": 14,
          "id": "b_district_2_0_328:площадка",
          "maxX": 145.741,
          "maxZ": -622.259,
          "minX": 131.593,
          "minZ": -636.407,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_335:площадка",
          "maxX": 546.313,
          "maxZ": -151.869,
          "minX": 530.051,
          "minZ": -168.131,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_336:площадка",
          "maxX": 574.516,
          "maxZ": -152.757,
          "minX": 560.029,
          "minZ": -167.243,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_337:площадка",
          "maxX": 633.881,
          "maxZ": -151.574,
          "minX": 617.028,
          "minZ": -168.426,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_354:площадка",
          "maxX": 547.896,
          "maxZ": -179.377,
          "minX": 528.468,
          "minZ": -198.805,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_356:площадка",
          "maxX": 186.585,
          "maxZ": -624.082,
          "minX": 176.082,
          "minZ": -634.585,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_364:площадка",
          "maxX": 634.853,
          "maxZ": -208.784,
          "minX": 616.056,
          "minZ": -227.58,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_395:площадка",
          "maxX": 607.128,
          "maxZ": -265.599,
          "minX": 585.599,
          "minZ": -287.128,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_396:площадка",
          "maxX": 635.654,
          "maxZ": -266.164,
          "minX": 615.255,
          "minZ": -286.563,
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
