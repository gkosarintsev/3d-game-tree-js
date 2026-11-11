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
          "x": -550,
          "y": 0,
          "yaw": 0,
          "z": -550
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
          "buildings": 30,
          "lights": 2,
          "props": 11,
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
          "buildings": 19,
          "lights": 1,
          "props": 18,
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
          "buildings": 9,
          "props": 20,
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
          "buildings": 4,
          "lights": 1,
          "props": 12,
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
          "buildings": 12,
          "props": 9,
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
          "buildings": 7,
          "props": 5
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
          "props": 18
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
          "props": 27
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
          "props": 9
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
          "buildings": 9,
          "lights": 1,
          "props": 7,
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
          "buildings": 6,
          "channels": 1,
          "props": 10
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
          "props": 8
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
          "buildings": 9,
          "channels": 1,
          "props": 20
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
          "buildings": 31,
          "channels": 1,
          "props": 15
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
          "buildings": 45,
          "channels": 1,
          "lights": 1,
          "props": 14,
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
          "buildings": 17,
          "props": 13
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
          "buildings": 10,
          "props": 12
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
          "buildings": 21,
          "props": 8
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
          "buildings": 51,
          "props": 7
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
          "buildings": 80,
          "lights": 1,
          "props": 16,
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
          "props": 22
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
          "buildings": 9,
          "props": 15
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
          "buildings": 14,
          "props": 14
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
          "buildings": 7,
          "props": 9
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
          "buildings": 8,
          "lights": 1,
          "props": 10,
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
          "id": "b_district_0_0_1:площадка",
          "maxX": -503.871,
          "maxZ": -562.053,
          "minX": -514.311,
          "minZ": -572.492,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_2:площадка",
          "maxX": -591.157,
          "maxZ": -503.885,
          "minX": -601.57,
          "minZ": -514.297,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_3:площадка",
          "maxX": -562.207,
          "maxZ": -504.025,
          "minX": -572.338,
          "minZ": -514.157,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_4:площадка",
          "maxX": -503.025,
          "maxZ": -619.389,
          "minX": -515.157,
          "minZ": -631.52,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_35:площадка",
          "maxX": -529.635,
          "maxZ": -587.817,
          "minX": -546.728,
          "minZ": -604.91,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_36:площадка",
          "maxX": -528.467,
          "maxZ": -557.558,
          "minX": -547.897,
          "minZ": -576.988,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_37:площадка",
          "maxX": -586.726,
          "maxZ": -528.544,
          "minX": -606.002,
          "minZ": -547.82,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_38:площадка",
          "maxX": -469.834,
          "maxZ": -528.016,
          "minX": -490.166,
          "minZ": -548.348,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_39:площадка",
          "maxX": -441.666,
          "maxZ": -528.939,
          "minX": -460.152,
          "minZ": -547.425,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_40:площадка",
          "maxX": -531.182,
          "maxZ": -385.728,
          "minX": -545.181,
          "minZ": -399.727,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_41:площадка",
          "maxX": -529.966,
          "maxZ": -355.421,
          "minX": -546.397,
          "minZ": -371.852,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_42:площадка",
          "maxX": -530.58,
          "maxZ": -326.944,
          "minX": -545.783,
          "minZ": -342.147,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_43:площадка",
          "maxX": -528.88,
          "maxZ": -296.153,
          "minX": -547.483,
          "minZ": -314.756,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_44:площадка",
          "maxX": -529.745,
          "maxZ": -267.927,
          "minX": -546.619,
          "minZ": -284.8,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_45:площадка",
          "maxX": -528.824,
          "maxZ": -237.915,
          "minX": -547.539,
          "minZ": -256.63,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_46:площадка",
          "maxX": -528.257,
          "maxZ": -179.166,
          "minX": -548.107,
          "minZ": -199.016,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_47:площадка",
          "maxX": -527.736,
          "maxZ": -149.555,
          "minX": -548.627,
          "minZ": -170.445,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_48:площадка",
          "maxX": -529.194,
          "maxZ": -92.831,
          "minX": -547.169,
          "minZ": -110.806,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_49:площадка",
          "maxX": -414.421,
          "maxZ": -530.784,
          "minX": -429.216,
          "minZ": -545.579,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_59:площадка",
          "maxX": 552.679,
          "maxZ": 632.679,
          "minX": 527.321,
          "minZ": 607.321,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_60:площадка",
          "maxX": -527.68,
          "maxZ": -614.953,
          "minX": -548.683,
          "minZ": -635.956,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_82:площадка",
          "maxX": -384.283,
          "maxZ": -529.737,
          "minX": -401.172,
          "minZ": -546.626,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_84:площадка",
          "maxX": -86.937,
          "maxZ": 593.063,
          "minX": -113.063,
          "minZ": 566.937,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_85:площадка",
          "maxX": -88.094,
          "maxZ": 631.906,
          "minX": -111.906,
          "minZ": 608.094,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_86:площадка",
          "maxX": -473.355,
          "maxZ": -589.719,
          "minX": -486.645,
          "minZ": -603.009,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_87:площадка",
          "maxX": -470.145,
          "maxZ": -557.418,
          "minX": -489.855,
          "minZ": -577.127,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_88:площадка",
          "maxX": -587.833,
          "maxZ": -471.469,
          "minX": -604.894,
          "minZ": -488.531,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_89:площадка",
          "maxX": -558.285,
          "maxZ": -471.012,
          "minX": -576.261,
          "minZ": -488.988,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_91:площадка",
          "maxX": -469.37,
          "maxZ": -614.824,
          "minX": -490.63,
          "minZ": -636.085,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_92:площадка",
          "maxX": -614.696,
          "maxZ": -469.242,
          "minX": -636.213,
          "minZ": -490.758,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_96:площадка",
          "maxX": -558.343,
          "maxZ": -558.343,
          "minX": -576.202,
          "minZ": -576.202,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_97:площадка",
          "maxX": -557.419,
          "maxZ": -382.873,
          "minX": -577.127,
          "minZ": -402.581,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_98:площадка",
          "maxX": -558.815,
          "maxZ": -326.087,
          "minX": -575.731,
          "minZ": -343.003,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_99:площадка",
          "maxX": -559.436,
          "maxZ": -297.618,
          "minX": -575.109,
          "minZ": -313.291,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_100:площадка",
          "maxX": -559.596,
          "maxZ": -268.687,
          "minX": -574.949,
          "minZ": -284.04,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_101:площадка",
          "maxX": -558.842,
          "maxZ": -151.569,
          "minX": -575.704,
          "minZ": -168.431,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_102:площадка",
          "maxX": -559.962,
          "maxZ": -94.507,
          "minX": -574.584,
          "minZ": -109.129,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_103:площадка",
          "maxX": -557.926,
          "maxZ": -63.381,
          "minX": -576.619,
          "minZ": -82.074,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_104:площадка",
          "maxX": -557.928,
          "maxZ": -34.292,
          "minX": -576.617,
          "minZ": -52.981,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_105:площадка",
          "maxX": -557.923,
          "maxZ": -5.195,
          "minX": -576.623,
          "minZ": -23.896,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_119:площадка",
          "maxX": -557.574,
          "maxZ": -615.756,
          "minX": -576.972,
          "minZ": -635.153,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_120:площадка",
          "maxX": -560.576,
          "maxZ": 33.71,
          "minX": -582.281,
          "minZ": 12.004,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_121:площадка",
          "maxX": -561.677,
          "maxZ": 261.18,
          "minX": -581.18,
          "minZ": 241.677,
          "y": 0.025
        },
        {
          "blend": 14,
          "id": "b_district_0_0_122:площадка",
          "maxX": -382.92,
          "maxZ": -557.465,
          "minX": -402.535,
          "minZ": -577.08,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_131:площадка",
          "maxX": -124.403,
          "maxZ": 595.597,
          "minX": -155.597,
          "minZ": 564.403,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_145:площадка",
          "maxX": -441.294,
          "maxZ": -586.748,
          "minX": -460.525,
          "minZ": -605.979,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_146:площадка",
          "maxX": -588.153,
          "maxZ": -588.153,
          "minX": -604.574,
          "minZ": -604.574,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_147:площадка",
          "maxX": -585.885,
          "maxZ": -411.34,
          "minX": -606.842,
          "minZ": -432.297,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_148:площадка",
          "maxX": -587.957,
          "maxZ": -384.321,
          "minX": -604.77,
          "minZ": -401.134,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_149:площадка",
          "maxX": -588.424,
          "maxZ": -355.696,
          "minX": -604.304,
          "minZ": -371.576,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_150:площадка",
          "maxX": -588.727,
          "maxZ": -326.909,
          "minX": -604,
          "minZ": -342.182,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_151:площадка",
          "maxX": -587.031,
          "maxZ": -296.122,
          "minX": -605.696,
          "minZ": -314.787,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_152:площадка",
          "maxX": -588.803,
          "maxZ": -181.53,
          "minX": -603.924,
          "minZ": -196.652,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_153:площадка",
          "maxX": -587.515,
          "maxZ": -92.97,
          "minX": -605.212,
          "minZ": -110.666,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_154:площадка",
          "maxX": -585.729,
          "maxZ": -62.093,
          "minX": -606.998,
          "minZ": -83.362,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_155:площадка",
          "maxX": -588.001,
          "maxZ": -6.183,
          "minX": -604.726,
          "minZ": -22.908,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_156:площадка",
          "maxX": -413.51,
          "maxZ": -588.055,
          "minX": -430.126,
          "minZ": -604.672,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_157:площадка",
          "maxX": -616.422,
          "maxZ": -587.331,
          "minX": -634.488,
          "minZ": -605.397,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_158:площадка",
          "maxX": -125.534,
          "maxZ": 634.466,
          "minX": -154.466,
          "minZ": 605.534,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_172:площадка",
          "maxX": -383.876,
          "maxZ": -587.513,
          "minX": -401.578,
          "minZ": -605.215,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_186:площадка",
          "maxX": -606.028,
          "maxZ": 262.543,
          "minX": -628.258,
          "minZ": 240.314,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_187:площадка",
          "maxX": -353.339,
          "maxZ": -586.066,
          "minX": -373.934,
          "minZ": -606.661,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_191:площадка",
          "maxX": 44.14,
          "maxZ": 636.14,
          "minX": 35.86,
          "minZ": 627.86,
          "y": 0.012
        },
        {
          "blend": 14,
          "id": "b_district_0_0_192:площадка",
          "maxX": -616.478,
          "maxZ": -354.66,
          "minX": -634.431,
          "minZ": -372.613,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_193:площадка",
          "maxX": -617.779,
          "maxZ": -239.597,
          "minX": -633.13,
          "minZ": -254.948,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_203:площадка",
          "maxX": 299.771,
          "maxZ": 635.771,
          "minX": 292.229,
          "minZ": 628.229,
          "y": 0.002
        },
        {
          "blend": 14,
          "id": "b_district_0_0_205:площадка",
          "maxX": -352.967,
          "maxZ": -614.786,
          "minX": -374.305,
          "minZ": -636.123,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_216:площадка",
          "maxX": -604.367,
          "maxZ": 635.633,
          "minX": -635.633,
          "minZ": 604.367,
          "y": 0.003
        },
        {
          "blend": 14,
          "id": "b_district_1_0_220:площадка",
          "maxX": -280.93,
          "maxZ": -600.93,
          "minX": -313.355,
          "minZ": -633.355,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_263:площадка",
          "maxX": 492.795,
          "maxZ": 172.795,
          "minX": 467.205,
          "minZ": 147.205,
          "y": 0.013
        },
        {
          "blend": 14,
          "id": "b_district_3_1_312:площадка",
          "maxX": 487.105,
          "maxZ": -3.561,
          "minX": 472.895,
          "minZ": -17.772,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_313:площадка",
          "maxX": 506.222,
          "maxZ": -5.778,
          "minX": 496.444,
          "minZ": -15.556,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_315:площадка",
          "maxX": 422.493,
          "maxZ": -4.174,
          "minX": 409.507,
          "minZ": -17.16,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_316:площадка",
          "maxX": 636.146,
          "maxZ": -3.854,
          "minX": 622.521,
          "minZ": -17.479,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_319:площадка",
          "maxX": 399.251,
          "maxZ": -6.082,
          "minX": 390.082,
          "minZ": -15.251,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_320:площадка",
          "maxX": 378.051,
          "maxZ": -5.949,
          "minX": 368.615,
          "minZ": -15.385,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_321:площадка",
          "maxX": 16.489,
          "maxZ": -623.511,
          "minX": 4.844,
          "minZ": -635.156,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_323:площадка",
          "maxX": 443.383,
          "maxZ": -25.951,
          "minX": 431.284,
          "minZ": -38.049,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_324:площадка",
          "maxX": 551.204,
          "maxZ": -24.796,
          "minX": 536.796,
          "minZ": -39.204,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_325:площадка",
          "maxX": 421.017,
          "maxZ": -26.983,
          "minX": 410.983,
          "minZ": -37.017,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_335:площадка",
          "maxX": 550.69,
          "maxZ": -46.643,
          "minX": 537.31,
          "minZ": -60.024,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_337:площадка",
          "maxX": 379.097,
          "maxZ": -47.57,
          "minX": 367.57,
          "minZ": -59.097,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_341:площадка",
          "maxX": 528.599,
          "maxZ": -68.734,
          "minX": 516.734,
          "minZ": -80.599,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_342:площадка",
          "maxX": 571.919,
          "maxZ": -68.081,
          "minX": 558.747,
          "minZ": -81.253,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_343:площадка",
          "maxX": 635.668,
          "maxZ": -68.332,
          "minX": 622.999,
          "minZ": -81.001,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_346:площадка",
          "maxX": 337.422,
          "maxZ": -67.911,
          "minX": 323.911,
          "minZ": -81.422,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_349:площадка",
          "maxX": 101.146,
          "maxZ": -538.854,
          "minX": 90.854,
          "minZ": -549.146,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_352:площадка",
          "maxX": 506.716,
          "maxZ": -111.951,
          "minX": 495.951,
          "minZ": -122.716,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_353:площадка",
          "maxX": 612.609,
          "maxZ": -112.724,
          "minX": 603.391,
          "minZ": -121.943,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_355:площадка",
          "maxX": 379.129,
          "maxZ": -111.538,
          "minX": 367.538,
          "minZ": -123.129,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_356:площадка",
          "maxX": 336.769,
          "maxZ": -111.231,
          "minX": 324.564,
          "minZ": -123.436,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_360:площадка",
          "maxX": 528.947,
          "maxZ": -132.386,
          "minX": 516.386,
          "minZ": -144.947,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_364:площадка",
          "maxX": 143.346,
          "maxZ": -603.321,
          "minX": 133.988,
          "minZ": -612.679,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_391:площадка",
          "maxX": 570.599,
          "maxZ": -218.734,
          "minX": 560.067,
          "minZ": -229.266,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_395:площадка",
          "maxX": 571.179,
          "maxZ": -239.488,
          "minX": 559.488,
          "minZ": -251.179,
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
