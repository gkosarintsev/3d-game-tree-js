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
          "buildings": 25,
          "lights": 1,
          "props": 11,
          "roads": 9
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
          "buildings": 18,
          "props": 32,
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
          "buildings": 10,
          "props": 12,
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
          "buildings": 5,
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
          "buildings": 24,
          "props": 6,
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
          "buildings": 11,
          "props": 20,
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
          "props": 12,
          "roads": 5
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
          "lights": 1,
          "props": 14,
          "roads": 4
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
          "props": 15,
          "roads": 9
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
          "buildings": 16,
          "lights": 1,
          "props": 9,
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
          "buildings": 20,
          "channels": 1,
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
          "props": 9,
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
          "buildings": 12,
          "channels": 1,
          "props": 13
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
          "props": 10,
          "roads": 2
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
          "buildings": 10,
          "channels": 1,
          "lights": 1,
          "props": 4,
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
          "buildings": 33,
          "props": 15,
          "roads": 11
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
          "buildings": 28,
          "props": 10,
          "roads": 8
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
          "buildings": 28,
          "lights": 1,
          "props": 14,
          "roads": 10
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
          "buildings": 28,
          "props": 9,
          "roads": 6
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
          "buildings": 14,
          "props": 7,
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
          "buildings": 26,
          "lights": 1,
          "props": 19,
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
          "buildings": 26,
          "props": 28,
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
          "buildings": 32,
          "props": 19,
          "roads": 7
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
          "buildings": 28,
          "lights": 1,
          "props": 17,
          "roads": 4
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
          "buildings": 9,
          "lights": 1,
          "props": 3,
          "roads": 65
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
          "id": "b_district_0_0_10:площадка",
          "maxX": -515.977,
          "maxZ": -621.426,
          "minX": -524.023,
          "minZ": -631.907,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_11:площадка",
          "maxX": 523.756,
          "maxZ": -174.823,
          "minX": 511.538,
          "minZ": -182.825,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_47:площадка",
          "maxX": 542.301,
          "maxZ": -156.178,
          "minX": 530.64,
          "minZ": -163.822,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_48:площадка",
          "maxX": 539.907,
          "maxZ": -136.808,
          "minX": 533.034,
          "minZ": -145.545,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_49:площадка",
          "maxX": 540.063,
          "maxZ": -118.2,
          "minX": 532.878,
          "minZ": -126.506,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_50:площадка",
          "maxX": 543.382,
          "maxZ": -100.376,
          "minX": 529.559,
          "minZ": -106.683,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_51:площадка",
          "maxX": 543.335,
          "maxZ": -81.815,
          "minX": 529.606,
          "minZ": -87.597,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_52:площадка",
          "maxX": 542.022,
          "maxZ": -62.676,
          "minX": 530.919,
          "minZ": -69.089,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_53:площадка",
          "maxX": 541.26,
          "maxZ": -42.687,
          "minX": 531.681,
          "minZ": -51.431,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_54:площадка",
          "maxX": 540.149,
          "maxZ": -24.157,
          "minX": 532.792,
          "minZ": -32.313,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_55:площадка",
          "maxX": 540.34,
          "maxZ": -5.457,
          "minX": 532.601,
          "minZ": -13.367,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_56:площадка",
          "maxX": 333.652,
          "maxZ": -4.894,
          "minX": 325.171,
          "minZ": -13.93,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_57:площадка",
          "maxX": 354.112,
          "maxZ": -5.777,
          "minX": 342.359,
          "minZ": -13.047,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_58:площадка",
          "maxX": 372.131,
          "maxZ": -5.8,
          "minX": 361.986,
          "minZ": -13.023,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_59:площадка",
          "maxX": 408.111,
          "maxZ": -4.857,
          "minX": 401.3,
          "minZ": -13.967,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_60:площадка",
          "maxX": 448.427,
          "maxZ": -6.079,
          "minX": 436.278,
          "minZ": -12.745,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_61:площадка",
          "maxX": 466.281,
          "maxZ": -4.936,
          "minX": 456.072,
          "minZ": -13.887,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_62:площадка",
          "maxX": 482.218,
          "maxZ": -5.421,
          "minX": 477.782,
          "minZ": -13.402,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_63:площадка",
          "maxX": 502.234,
          "maxZ": -4.586,
          "minX": 495.413,
          "minZ": -14.237,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_66:площадка",
          "maxX": 505.403,
          "maxZ": 36.333,
          "minX": 497.263,
          "minZ": 27.667,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_67:площадка",
          "maxX": 507.227,
          "maxZ": 122.847,
          "minX": 495.439,
          "minZ": 111.82,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_68:площадка",
          "maxX": 508.93,
          "maxZ": 142.777,
          "minX": 493.737,
          "minZ": 134.556,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_69:площадка",
          "maxX": 508.38,
          "maxZ": 185.488,
          "minX": 494.287,
          "minZ": 177.179,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_70:площадка",
          "maxX": 509.216,
          "maxZ": 227.871,
          "minX": 493.451,
          "minZ": 220.129,
          "y": 0.049
        },
        {
          "blend": 14,
          "id": "b_district_3_1_90:площадка",
          "maxX": 505.735,
          "maxZ": -156.209,
          "minX": 491.912,
          "minZ": -163.791,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_91:площадка",
          "maxX": 502.106,
          "maxZ": -136.158,
          "minX": 495.541,
          "minZ": -146.195,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_92:площадка",
          "maxX": 502.039,
          "maxZ": -117.905,
          "minX": 495.608,
          "minZ": -126.801,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_93:площадка",
          "maxX": 502.968,
          "maxZ": -60.933,
          "minX": 494.679,
          "minZ": -70.832,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_94:площадка",
          "maxX": 503.862,
          "maxZ": -23.588,
          "minX": 493.785,
          "minZ": -32.883,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_97:площадка",
          "maxX": 165.524,
          "maxZ": -602.908,
          "minX": 154.476,
          "minZ": -613.092,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_101:площадка",
          "maxX": -538.119,
          "maxZ": -305.342,
          "minX": -549.881,
          "minZ": -313.325,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_102:площадка",
          "maxX": -539.566,
          "maxZ": -282.822,
          "minX": -548.434,
          "minZ": -293.178,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_103:площадка",
          "maxX": -538.96,
          "maxZ": -261.494,
          "minX": -549.04,
          "minZ": -271.84,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_104:площадка",
          "maxX": -538.771,
          "maxZ": -177.474,
          "minX": -549.229,
          "minZ": -185.193,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_105:площадка",
          "maxX": -538.476,
          "maxZ": -155.66,
          "minX": -549.524,
          "minZ": -164.34,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_106:площадка",
          "maxX": -537.915,
          "maxZ": -134.013,
          "minX": -550.085,
          "minZ": -143.321,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_107:площадка",
          "maxX": -536.603,
          "maxZ": -112.917,
          "minX": -551.397,
          "minZ": -121.749,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_108:площадка",
          "maxX": -539.422,
          "maxZ": -90.979,
          "minX": -548.578,
          "minZ": -101.021,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_109:площадка",
          "maxX": -536.419,
          "maxZ": -70.699,
          "minX": -551.581,
          "minZ": -78.635,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_110:площадка",
          "maxX": -539.938,
          "maxZ": -28.503,
          "minX": -548.062,
          "minZ": -35.497,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_111:площадка",
          "maxX": 358.749,
          "maxZ": 37.622,
          "minX": 345.251,
          "minZ": 26.378,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_112:площадка",
          "maxX": 421.38,
          "maxZ": 37.128,
          "minX": 410.62,
          "minZ": 26.872,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_113:площадка",
          "maxX": 444.798,
          "maxZ": 35.872,
          "minX": 429.869,
          "minZ": 28.128,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_114:площадка",
          "maxX": 466.012,
          "maxZ": 35.73,
          "minX": 451.321,
          "minZ": 28.27,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_115:площадка",
          "maxX": 484.98,
          "maxZ": 36.464,
          "minX": 475.02,
          "minZ": 27.536,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_116:площадка",
          "maxX": 551.113,
          "maxZ": 143.043,
          "minX": 536.887,
          "minZ": 134.29,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_117:площадка",
          "maxX": 551.496,
          "maxZ": 164.025,
          "minX": 536.504,
          "minZ": 155.975,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_123:площадка",
          "maxX": -540.213,
          "maxZ": -594.944,
          "minX": -553.121,
          "minZ": -605.056,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_124:площадка",
          "maxX": -487.437,
          "maxZ": -594.774,
          "minX": -499.229,
          "minZ": -605.226,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_125:площадка",
          "maxX": -536.865,
          "maxZ": -565.066,
          "minX": -556.468,
          "minZ": -581.601,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_126:площадка",
          "maxX": -482.5,
          "maxZ": -566.032,
          "minX": -504.167,
          "minZ": -580.635,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_127:площадка",
          "maxX": -537.791,
          "maxZ": -538.863,
          "minX": -555.542,
          "minZ": -554.47,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_128:площадка",
          "maxX": -487.11,
          "maxZ": -540.633,
          "minX": -499.557,
          "minZ": -552.701,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_129:площадка",
          "maxX": -429.167,
          "maxZ": -538.888,
          "minX": -450.833,
          "minZ": -554.445,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_130:площадка",
          "maxX": -590.281,
          "maxZ": -485.399,
          "minX": -609.719,
          "minZ": -501.268,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_131:площадка",
          "maxX": -564.894,
          "maxZ": -485.208,
          "minX": -581.772,
          "minZ": -501.459,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_132:площадка",
          "maxX": -539.762,
          "maxZ": -486.585,
          "minX": -553.572,
          "minZ": -500.081,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_133:площадка",
          "maxX": -537.43,
          "maxZ": -458.281,
          "minX": -555.903,
          "minZ": -475.053,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_134:площадка",
          "maxX": -535.833,
          "maxZ": -408.511,
          "minX": -557.5,
          "minZ": -418.156,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_135:площадка",
          "maxX": -538.858,
          "maxZ": -380.551,
          "minX": -554.475,
          "minZ": -392.782,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_136:площадка",
          "maxX": -539.188,
          "maxZ": -352.523,
          "minX": -554.146,
          "minZ": -367.477,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_137:площадка",
          "maxX": -536.061,
          "maxZ": -325.582,
          "minX": -557.272,
          "minZ": -341.085,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_138:площадка",
          "maxX": 122.071,
          "maxZ": -581.832,
          "minX": 112.596,
          "minZ": -591.501,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_146:площадка",
          "maxX": -618.302,
          "maxZ": -541.862,
          "minX": -635.032,
          "minZ": -551.472,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_147:площадка",
          "maxX": -404.431,
          "maxZ": -536.994,
          "minX": -422.235,
          "minZ": -556.34,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_148:площадка",
          "maxX": -619.942,
          "maxZ": -484.856,
          "minX": -633.392,
          "minZ": -501.811,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_163:площадка",
          "maxX": 121.237,
          "maxZ": -603.365,
          "minX": 113.43,
          "minZ": -612.635,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_178:площадка",
          "maxX": 560.335,
          "maxZ": -155.273,
          "minX": 550.253,
          "minZ": -164.727,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_179:площадка",
          "maxX": 558.187,
          "maxZ": -137.17,
          "minX": 552.402,
          "minZ": -145.183,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_182:площадка",
          "maxX": 351.712,
          "maxZ": -23.414,
          "minX": 344.759,
          "minZ": -33.057,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_183:площадка",
          "maxX": 448.678,
          "maxZ": -24.45,
          "minX": 436.028,
          "minZ": -32.021,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_185:площадка",
          "maxX": 558.739,
          "maxZ": -173.827,
          "minX": 551.849,
          "minZ": -183.82,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_186:площадка",
          "maxX": 145.217,
          "maxZ": -625.821,
          "minX": 132.117,
          "minZ": -632.846,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_192:площадка",
          "maxX": 487.037,
          "maxZ": 122.194,
          "minX": 472.963,
          "minZ": 112.472,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_211:площадка",
          "maxX": -559.54,
          "maxZ": -155.464,
          "minX": -571.127,
          "minZ": -164.536,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_212:площадка",
          "maxX": -559.655,
          "maxZ": -112.641,
          "minX": -571.012,
          "minZ": -122.025,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_213:площадка",
          "maxX": 571.795,
          "maxZ": 57.797,
          "minX": 558.871,
          "minZ": 48.87,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_214:площадка",
          "maxX": 572.525,
          "maxZ": 249.55,
          "minX": 558.142,
          "minZ": 241.116,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_215:площадка",
          "maxX": -377.322,
          "maxZ": -540.748,
          "minX": -396.011,
          "minZ": -552.585,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_220:площадка",
          "maxX": 539.266,
          "maxZ": -212.904,
          "minX": 533.675,
          "minZ": -220.038,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_228:площадка",
          "maxX": -563.75,
          "maxZ": -595.43,
          "minX": -582.917,
          "minZ": -604.57,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_229:площадка",
          "maxX": -593.84,
          "maxZ": -566.073,
          "minX": -606.16,
          "minZ": -580.594,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_230:площадка",
          "maxX": -593.049,
          "maxZ": -460.552,
          "minX": -606.951,
          "minZ": -472.781,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_231:площадка",
          "maxX": -564.743,
          "maxZ": -430.858,
          "minX": -581.923,
          "minZ": -449.142,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_232:площадка",
          "maxX": -566.854,
          "maxZ": -327.154,
          "minX": -579.813,
          "minZ": -339.513,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_233:площадка",
          "maxX": 577.33,
          "maxZ": -42.68,
          "minX": 570.906,
          "minZ": -51.437,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_240:площадка",
          "maxX": 464.996,
          "maxZ": -136.87,
          "minX": 457.357,
          "minZ": -145.483,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_253:площадка",
          "maxX": -96.006,
          "maxZ": 584.339,
          "minX": -103.994,
          "minZ": 575.661,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_256:площадка",
          "maxX": 465.203,
          "maxZ": 143.198,
          "minX": 452.13,
          "minZ": 134.135,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_261:площадка",
          "maxX": -579.835,
          "maxZ": -305.473,
          "minX": -593.498,
          "minZ": -313.194,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_262:площадка",
          "maxX": -581.973,
          "maxZ": -6.088,
          "minX": -591.361,
          "minZ": -15.245,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_264:площадка",
          "maxX": 593.724,
          "maxZ": 186.824,
          "minX": 579.609,
          "minZ": 175.842,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_265:площадка",
          "maxX": 592.326,
          "maxZ": 250.028,
          "minX": 581.007,
          "minZ": 240.639,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_266:площадка",
          "maxX": 591.243,
          "maxZ": 292.424,
          "minX": 582.091,
          "minZ": 283.576,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_276:площадка",
          "maxX": 598.171,
          "maxZ": -118.85,
          "minX": 587.711,
          "minZ": -125.856,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_282:площадка",
          "maxX": 81.135,
          "maxZ": -624.306,
          "minX": 68.198,
          "minZ": -634.361,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_284:площадка",
          "maxX": -591.203,
          "maxZ": -350.991,
          "minX": -608.797,
          "minZ": -369.009,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_285:площадка",
          "maxX": -404.607,
          "maxZ": -593.983,
          "minX": -422.06,
          "minZ": -606.017,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_286:площадка",
          "maxX": -618.475,
          "maxZ": -434.775,
          "minX": -634.859,
          "minZ": -445.225,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_287:площадка",
          "maxX": 589.162,
          "maxZ": -487.133,
          "minX": 576.552,
          "minZ": -495.724,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_294:площадка",
          "maxX": -602.356,
          "maxZ": -239.701,
          "minX": -613.644,
          "minZ": -250.966,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_295:площадка",
          "maxX": -600.433,
          "maxZ": -176.336,
          "minX": -615.567,
          "minZ": -186.331,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_296:площадка",
          "maxX": -600.082,
          "maxZ": -113.466,
          "minX": -615.918,
          "minZ": -121.2,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_297:площадка",
          "maxX": -602.279,
          "maxZ": -27.682,
          "minX": -613.721,
          "minZ": -36.318,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_298:площадка",
          "maxX": -599.833,
          "maxZ": -5.968,
          "minX": -616.167,
          "minZ": -15.365,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_299:площадка",
          "maxX": 615.2,
          "maxZ": -175.014,
          "minX": 608.329,
          "minZ": -182.633,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_304:площадка",
          "maxX": 372.535,
          "maxZ": -100.88,
          "minX": 361.583,
          "minZ": -106.179,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_317:площадка",
          "maxX": -134.212,
          "maxZ": 624.235,
          "minX": -145.788,
          "minZ": 615.765,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_322:площадка",
          "maxX": 614.643,
          "maxZ": -394.8,
          "minX": 596.786,
          "minZ": -405.2,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_325:площадка",
          "maxX": -616.162,
          "maxZ": -380.616,
          "minX": -637.172,
          "minZ": -392.717,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_326:площадка",
          "maxX": -616.225,
          "maxZ": -352.358,
          "minX": -637.109,
          "minZ": -367.642,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_328:площадка",
          "maxX": -625.912,
          "maxZ": -283.894,
          "minX": -632.755,
          "minZ": -292.106,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_329:площадка",
          "maxX": -622.276,
          "maxZ": -91.917,
          "minX": -636.391,
          "minZ": -100.083,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_330:площадка",
          "maxX": 636.971,
          "maxZ": 292.111,
          "minX": 621.696,
          "minZ": 283.889,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_331:площадка",
          "maxX": 637.248,
          "maxZ": -119.494,
          "minX": 623.929,
          "minZ": -125.212,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_332:площадка",
          "maxX": 636.557,
          "maxZ": -25.491,
          "minX": 624.62,
          "minZ": -30.979,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_342:площадка",
          "maxX": 39.493,
          "maxZ": -624.563,
          "minX": 24.507,
          "minZ": -634.104,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_344:площадка",
          "maxX": -322.858,
          "maxZ": -595.179,
          "minX": -343.809,
          "minZ": -604.821,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_355:площадка",
          "maxX": 635.485,
          "maxZ": -250.689,
          "minX": 625.691,
          "minZ": -257.546,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_356:площадка",
          "maxX": 636.032,
          "maxZ": -533.297,
          "minX": 621.111,
          "minZ": -540.988,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_357:площадка",
          "maxX": -605.832,
          "maxZ": 629.348,
          "minX": -634.168,
          "minZ": 610.652,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_363:площадка",
          "maxX": -299.115,
          "maxZ": -619.612,
          "minX": -311.794,
          "minZ": -631.297,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_369:площадка",
          "maxX": -36.813,
          "maxZ": -590.716,
          "minX": -50.46,
          "minZ": -602.012,
          "y": 0.011
        },
        {
          "blend": 14,
          "id": "b_district_1_0_370:площадка",
          "maxX": -36.935,
          "maxZ": -618.525,
          "minX": -50.338,
          "minZ": -632.385,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_371:площадка",
          "maxX": -238.577,
          "maxZ": -619.323,
          "minX": -255.969,
          "minZ": -631.586,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_373:площадка",
          "maxX": -154.245,
          "maxZ": -620.063,
          "minX": -165.755,
          "minZ": -630.846,
          "y": 0.002
        },
        {
          "blend": 14,
          "id": "b_district_2_0_379:площадка",
          "maxX": 143.088,
          "maxZ": -604.794,
          "minX": 134.245,
          "minZ": -611.206,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_384:площадка",
          "maxX": 337.269,
          "maxZ": 35.763,
          "minX": 324.065,
          "minZ": 28.237,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_385:площадка",
          "maxX": 379.574,
          "maxZ": 36.709,
          "minX": 367.093,
          "minZ": 27.291,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_386:площадка",
          "maxX": 550.553,
          "maxZ": 99.634,
          "minX": 537.447,
          "minZ": 92.366,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_387:площадка",
          "maxX": 548.873,
          "maxZ": 123.315,
          "minX": 539.127,
          "minZ": 111.352,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_389:площадка",
          "maxX": 121.931,
          "maxZ": -560.014,
          "minX": 112.736,
          "minZ": -570.652,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_394:площадка",
          "maxX": 521.317,
          "maxZ": -192.817,
          "minX": 513.977,
          "minZ": -202.477,
          "y": 0.006
        },
        {
          "blend": 14,
          "id": "b_district_3_1_397:площадка",
          "maxX": 562.206,
          "maxZ": -42.939,
          "minX": 548.382,
          "minZ": -51.178,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_400:площадка",
          "maxX": 391.458,
          "maxZ": -25.367,
          "minX": 380.307,
          "minZ": -31.104,
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
          "id": "tr_gb_29",
          "points": [
            {
              "x": 632,
              "y": 0,
              "z": 520
            },
            {
              "x": 632,
              "y": 0,
              "z": 531.2
            },
            {
              "x": 632,
              "y": 0,
              "z": 542.4
            },
            {
              "x": 632,
              "y": 0,
              "z": 553.6
            },
            {
              "x": 632,
              "y": 0,
              "z": 564.8
            },
            {
              "x": 632,
              "y": 0,
              "z": 576
            },
            {
              "x": 632,
              "y": 0,
              "z": 587.2
            },
            {
              "x": 632,
              "y": 0,
              "z": 598.4
            },
            {
              "x": 632,
              "y": 0,
              "z": 609.6
            },
            {
              "x": 632,
              "y": 0,
              "z": 620.8
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
          "id": "tr_gb_35",
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
              "z": 88
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
              "z": 19.43
            },
            {
              "x": 520,
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
          "id": "tr_gb_80",
          "points": [
            {
              "x": 360,
              "y": 0,
              "z": 8
            },
            {
              "x": 348.57,
              "y": 0,
              "z": 8
            },
            {
              "x": 337.14,
              "y": 0,
              "z": 8
            },
            {
              "x": 325.71,
              "y": 0,
              "z": 8
            },
            {
              "x": 314.29,
              "y": 0,
              "z": 8
            },
            {
              "x": 302.86,
              "y": 0,
              "z": 8
            },
            {
              "x": 291.43,
              "y": 0,
              "z": 8
            },
            {
              "x": 280,
              "y": 0.02,
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
              "y": 10.98,
              "z": -136
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
              "y": 9.33,
              "z": -204.57
            },
            {
              "x": 216,
              "y": 9.52,
              "z": -216
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
              "y": 14.57,
              "z": -296
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
              "y": 20.37,
              "z": -360
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
              "y": 21.13,
              "z": -396
            },
            {
              "x": 216,
              "y": 20.91,
              "z": -408
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
              "z": -56
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
              "x": -344,
              "y": 5.32,
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
              "y": 16.14,
              "z": -472
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
          "id": "tr_acc_1_1",
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
          "id": "tr_acc_1_1_2",
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
          "id": "tr_acc_1_3",
          "points": [
            {
              "x": 144,
              "y": 21.82,
              "z": 144
            },
            {
              "x": 152,
              "y": 20.06,
              "z": 144
            },
            {
              "x": 160,
              "y": 18.2,
              "z": 144
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
              "x": 160,
              "y": 18.2,
              "z": 144
            },
            {
              "x": 160,
              "y": 19.43,
              "z": 156
            },
            {
              "x": 160,
              "y": 20.13,
              "z": 168
            },
            {
              "x": 160,
              "y": 20.32,
              "z": 180
            },
            {
              "x": 160,
              "y": 20.07,
              "z": 192
            },
            {
              "x": 160,
              "y": 19.48,
              "z": 204
            },
            {
              "x": 160,
              "y": 18.71,
              "z": 216
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
              "x": 160,
              "y": 18.71,
              "z": 216
            },
            {
              "x": 148,
              "y": 20.37,
              "z": 216
            },
            {
              "x": 136,
              "y": 21.85,
              "z": 216
            },
            {
              "x": 124,
              "y": 22.97,
              "z": 216
            },
            {
              "x": 112,
              "y": 23.6,
              "z": 216
            },
            {
              "x": 100,
              "y": 23.62,
              "z": 216
            },
            {
              "x": 88,
              "y": 22.98,
              "z": 216
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
              "x": 88,
              "y": 22.98,
              "z": 216
            },
            {
              "x": 88,
              "y": 21.79,
              "z": 226.06
            },
            {
              "x": 88,
              "y": 20.81,
              "z": 236.12
            },
            {
              "x": 88,
              "y": 20.14,
              "z": 246.18
            },
            {
              "x": 88,
              "y": 19.83,
              "z": 256.24
            },
            {
              "x": 88,
              "y": 19.99,
              "z": 266.3
            },
            {
              "x": 88,
              "y": 20.68,
              "z": 276.36
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
              "x": 160,
              "y": 18.71,
              "z": 216
            },
            {
              "x": 172,
              "y": 17.05,
              "z": 216
            },
            {
              "x": 184,
              "y": 15.53,
              "z": 216
            },
            {
              "x": 196,
              "y": 14.29,
              "z": 216
            },
            {
              "x": 208,
              "y": 13.52,
              "z": 216
            },
            {
              "x": 220,
              "y": 13.32,
              "z": 216
            },
            {
              "x": 232,
              "y": 13.14,
              "z": 216
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
              "x": 232,
              "y": 13.14,
              "z": 216
            },
            {
              "x": 232,
              "y": 13.99,
              "z": 226.06
            },
            {
              "x": 232,
              "y": 14.81,
              "z": 236.12
            },
            {
              "x": 232,
              "y": 15.58,
              "z": 246.18
            },
            {
              "x": 232,
              "y": 16.29,
              "z": 256.24
            },
            {
              "x": 232,
              "y": 16.95,
              "z": 266.3
            },
            {
              "x": 232,
              "y": 17.64,
              "z": 276.36
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
          "id": "tr_acc_1_11",
          "points": [
            {
              "x": -228.56,
              "y": 6.4,
              "z": 172.25
            },
            {
              "x": -216.75,
              "y": 7,
              "z": 172.25
            },
            {
              "x": -204.94,
              "y": 7.11,
              "z": 172.25
            },
            {
              "x": -193.14,
              "y": 6.73,
              "z": 172.25
            },
            {
              "x": -181.33,
              "y": 5.88,
              "z": 172.25
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_11_2",
          "points": [
            {
              "x": -181.33,
              "y": 5.88,
              "z": 172.25
            },
            {
              "x": -181.33,
              "y": 2.82,
              "z": 160.25
            },
            {
              "x": -181.33,
              "y": 0.75,
              "z": 148.25
            },
            {
              "x": -181.33,
              "y": 0,
              "z": 136.25
            },
            {
              "x": -181.33,
              "y": 0,
              "z": 124.25
            },
            {
              "x": -181.33,
              "y": 0.25,
              "z": 112.25
            },
            {
              "x": -181.33,
              "y": 0.99,
              "z": 100.25
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
              "x": -228.56,
              "y": 6.4,
              "z": 172.25
            },
            {
              "x": -240.56,
              "y": 5.36,
              "z": 172.25
            },
            {
              "x": -252.56,
              "y": 4.03,
              "z": 172.25
            },
            {
              "x": -264.56,
              "y": 2.6,
              "z": 172.25
            },
            {
              "x": -276.56,
              "y": 1.28,
              "z": 172.25
            },
            {
              "x": -288.56,
              "y": 0.32,
              "z": 172.25
            },
            {
              "x": -300.56,
              "y": 0,
              "z": 172.25
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
              "x": -300.56,
              "y": 0,
              "z": 172.25
            },
            {
              "x": -300.56,
              "y": 0,
              "z": 160.25
            },
            {
              "x": -300.56,
              "y": 0,
              "z": 148.25
            },
            {
              "x": -300.56,
              "y": 0,
              "z": 136.25
            },
            {
              "x": -300.56,
              "y": 0,
              "z": 124.25
            },
            {
              "x": -300.56,
              "y": 0,
              "z": 112.25
            },
            {
              "x": -300.56,
              "y": 0.2,
              "z": 100.25
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
              "x": -300.56,
              "y": 0.2,
              "z": 100.25
            },
            {
              "x": -310.6,
              "y": 0.05,
              "z": 100.25
            },
            {
              "x": -320.63,
              "y": 0,
              "z": 100.25
            },
            {
              "x": -330.67,
              "y": 0,
              "z": 100.25
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
              "x": -330.67,
              "y": 0,
              "z": 100.25
            },
            {
              "x": -330.67,
              "y": 0.02,
              "z": 88.25
            },
            {
              "x": -330.67,
              "y": 0.31,
              "z": 76.25
            },
            {
              "x": -330.67,
              "y": 0.87,
              "z": 64.25
            },
            {
              "x": -330.67,
              "y": 1.62,
              "z": 52.25
            },
            {
              "x": -330.67,
              "y": 2.48,
              "z": 40.25
            },
            {
              "x": -330.67,
              "y": 3.4,
              "z": 28.25
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
              "x": 216,
              "y": 10.05,
              "z": -520
            },
            {
              "x": 204,
              "y": 8.65,
              "z": -520
            },
            {
              "x": 192,
              "y": 7.24,
              "z": -520
            },
            {
              "x": 180,
              "y": 5.87,
              "z": -520
            },
            {
              "x": 168,
              "y": 4.55,
              "z": -520
            },
            {
              "x": 156,
              "y": 3.34,
              "z": -520
            },
            {
              "x": 144,
              "y": 2.26,
              "z": -520
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
              "x": 144,
              "y": 2.26,
              "z": -520
            },
            {
              "x": 144,
              "y": 1.59,
              "z": -532
            },
            {
              "x": 144,
              "y": 1,
              "z": -544
            },
            {
              "x": 144,
              "y": 0.52,
              "z": -556
            },
            {
              "x": 144,
              "y": 0.18,
              "z": -568
            },
            {
              "x": 144,
              "y": 0.01,
              "z": -580
            },
            {
              "x": 144,
              "y": 0,
              "z": -592
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
