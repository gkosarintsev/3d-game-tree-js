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
    "bodyProbe": 1.2,
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
          "buildings": 15,
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
          "buildings": 13,
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
          "props": 95,
          "roads": 2
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
          "buildings": 9,
          "props": 65,
          "roads": 2
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
          "buildings": 8,
          "props": 10,
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
          "buildings": 1,
          "props": 2,
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
          "lights": 1,
          "props": 6,
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
          "props": 27,
          "roads": 8
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
          "props": 28,
          "roads": 5
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
          "buildings": 5,
          "channels": 1,
          "props": 18,
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
          "buildings": 10,
          "channels": 1,
          "props": 7,
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
          "buildings": 15,
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
          "buildings": 13,
          "channels": 1,
          "props": 12,
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
          "buildings": 14,
          "channels": 1,
          "lights": 1,
          "props": 17,
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
          "buildings": 20,
          "props": 16,
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
          "lights": 1,
          "props": 26,
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
          "buildings": 31,
          "props": 23,
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
          "buildings": 22,
          "props": 17,
          "roads": 15
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
          "buildings": 29,
          "props": 17,
          "roads": 3
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
          "buildings": 37,
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
          "buildings": 29,
          "lights": 1,
          "props": 25,
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
          "props": 19,
          "roads": 16
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
          "buildings": 19,
          "lights": 1,
          "props": 20,
          "roads": 72
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
    "navEdgeProbe": 1.2,
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
          "id": "b_district_0_0_5:площадка",
          "maxX": -503.793,
          "maxZ": -591.944,
          "minX": -514.388,
          "minZ": -600.783,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_6:площадка",
          "maxX": -562.172,
          "maxZ": -504.024,
          "minX": -572.373,
          "minZ": -514.158,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_23:площадка",
          "maxX": -617.456,
          "maxZ": -503.873,
          "minX": -633.453,
          "minZ": -514.309,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_34:площадка",
          "maxX": 506.363,
          "maxZ": -165.217,
          "minX": 501.637,
          "minZ": -170.783,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_35:площадка",
          "maxX": 506.924,
          "maxZ": -149.847,
          "minX": 501.076,
          "minZ": -154.153,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_36:площадка",
          "maxX": 539.129,
          "maxZ": -149.882,
          "minX": 532.871,
          "minZ": -154.118,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_37:площадка",
          "maxX": 507.563,
          "maxZ": -132.309,
          "minX": 500.437,
          "minZ": -139.691,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_38:площадка",
          "maxX": 539.279,
          "maxZ": -133.151,
          "minX": 532.721,
          "minZ": -138.849,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_39:площадка",
          "maxX": 508.136,
          "maxZ": -116.928,
          "minX": 499.864,
          "minZ": -123.072,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_40:площадка",
          "maxX": 539.756,
          "maxZ": -116.596,
          "minX": 532.244,
          "minZ": -123.404,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_41:площадка",
          "maxX": 506.985,
          "maxZ": -101.011,
          "minX": 501.015,
          "minZ": -106.989,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_42:площадка",
          "maxX": 506.249,
          "maxZ": -86,
          "minX": 501.751,
          "minZ": -90,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_43:площадка",
          "maxX": 538.257,
          "maxZ": -85.559,
          "minX": 533.743,
          "minZ": -90.441,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_44:площадка",
          "maxX": 507.061,
          "maxZ": -69.508,
          "minX": 500.939,
          "minZ": -74.492,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_45:площадка",
          "maxX": 538,
          "maxZ": -69.476,
          "minX": 534,
          "minZ": -74.524,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_46:площадка",
          "maxX": 507.88,
          "maxZ": -52.733,
          "minX": 500.12,
          "minZ": -59.267,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_47:площадка",
          "maxX": 538,
          "maxZ": -54,
          "minX": 534,
          "minZ": -58,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_48:площадка",
          "maxX": 506.712,
          "maxZ": -36.703,
          "minX": 501.288,
          "minZ": -43.297,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_49:площадка",
          "maxX": 538.642,
          "maxZ": -37.269,
          "minX": 533.358,
          "minZ": -42.731,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_50:площадка",
          "maxX": 539.796,
          "maxZ": -21.138,
          "minX": 532.204,
          "minZ": -26.862,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_51:площадка",
          "maxX": 331.386,
          "maxZ": -5.087,
          "minX": 324.614,
          "minZ": -10.913,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_52:площадка",
          "maxX": 346.135,
          "maxZ": -5.707,
          "minX": 341.865,
          "minZ": -10.293,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_53:площадка",
          "maxX": 363.967,
          "maxZ": -4.833,
          "minX": 356.033,
          "minZ": -11.167,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_54:площадка",
          "maxX": 380.021,
          "maxZ": -4.581,
          "minX": 371.979,
          "minZ": -11.419,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_55:площадка",
          "maxX": 394.936,
          "maxZ": -5.25,
          "minX": 389.064,
          "minZ": -10.75,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_56:площадка",
          "maxX": 410.788,
          "maxZ": -5.326,
          "minX": 405.212,
          "minZ": -10.674,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_57:площадка",
          "maxX": 426.272,
          "maxZ": -4.966,
          "minX": 421.728,
          "minZ": -11.034,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_58:площадка",
          "maxX": 443.109,
          "maxZ": -5.719,
          "minX": 436.891,
          "minZ": -10.281,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_59:площадка",
          "maxX": 475.511,
          "maxZ": -4.34,
          "minX": 468.489,
          "minZ": -11.66,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_60:площадка",
          "maxX": 506.848,
          "maxZ": -5.607,
          "minX": 501.152,
          "minZ": -10.393,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_61:площадка",
          "maxX": 539.12,
          "maxZ": -5.846,
          "minX": 532.88,
          "minZ": -10.154,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_71:площадка",
          "maxX": -587.226,
          "maxZ": -529.367,
          "minX": -605.502,
          "minZ": -546.997,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_72:площадка",
          "maxX": -556.914,
          "maxZ": -530.406,
          "minX": -577.631,
          "minZ": -545.958,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_73:площадка",
          "maxX": -471.72,
          "maxZ": -530.725,
          "minX": -488.28,
          "minZ": -545.638,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_74:площадка",
          "maxX": -530.008,
          "maxZ": -473.521,
          "minX": -546.356,
          "minZ": -486.479,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_75:площадка",
          "maxX": -532.291,
          "maxZ": -444.148,
          "minX": -544.073,
          "minZ": -457.671,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_76:площадка",
          "maxX": -531.723,
          "maxZ": -415.447,
          "minX": -544.641,
          "minZ": -428.19,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_77:площадка",
          "maxX": -532.94,
          "maxZ": -387.083,
          "minX": -543.424,
          "minZ": -398.371,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_78:площадка",
          "maxX": -532.257,
          "maxZ": -327.921,
          "minX": -544.107,
          "minZ": -341.17,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_84:площадка",
          "maxX": -410.489,
          "maxZ": -529.065,
          "minX": -433.148,
          "minZ": -547.299,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_85:площадка",
          "maxX": 508.022,
          "maxZ": 57.873,
          "minX": 494.644,
          "minZ": 48.793,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_86:площадка",
          "maxX": 507.151,
          "maxZ": 185.562,
          "minX": 495.516,
          "minZ": 177.105,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_98:площадка",
          "maxX": -526.577,
          "maxZ": -289.26,
          "minX": -553.423,
          "minZ": -310.74,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_99:площадка",
          "maxX": -526.515,
          "maxZ": -210.009,
          "minX": -553.485,
          "minZ": -229.991,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_100:площадка",
          "maxX": -527.078,
          "maxZ": -170.463,
          "minX": -552.922,
          "minZ": -189.537,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_101:площадка",
          "maxX": -526.418,
          "maxZ": -128.67,
          "minX": -553.582,
          "minZ": -151.33,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_102:площадка",
          "maxX": -527.592,
          "maxZ": -92.132,
          "minX": -552.408,
          "minZ": -107.868,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_103:площадка",
          "maxX": -527.815,
          "maxZ": -49.581,
          "minX": -552.185,
          "minZ": -70.419,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_104:площадка",
          "maxX": -527.135,
          "maxZ": -12.708,
          "minX": -552.865,
          "minZ": -27.292,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_105:площадка",
          "maxX": -535.23,
          "maxZ": 25.187,
          "minX": -544.77,
          "minZ": 14.813,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_106:площадка",
          "maxX": -535.733,
          "maxZ": 185.761,
          "minX": -544.267,
          "minZ": 174.239,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_107:площадка",
          "maxX": -535.406,
          "maxZ": 224.104,
          "minX": -544.594,
          "minZ": 215.896,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_110:площадка",
          "maxX": -530.133,
          "maxZ": -618.223,
          "minX": -546.23,
          "minZ": -632.687,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_111:площадка",
          "maxX": -615.147,
          "maxZ": -530.918,
          "minX": -635.762,
          "minZ": -545.445,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_117:площадка",
          "maxX": 393.963,
          "maxZ": 606.739,
          "minX": 379.37,
          "minZ": 593.261,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_118:площадка",
          "maxX": 397.201,
          "maxZ": 634.489,
          "minX": 376.133,
          "minZ": 618.844,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_133:площадка",
          "maxX": 635.431,
          "maxZ": 392.058,
          "minX": 617.903,
          "minZ": 381.275,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_138:площадка",
          "maxX": 538.999,
          "maxZ": -181.757,
          "minX": 533.001,
          "minZ": -186.243,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_148:площадка",
          "maxX": 335.033,
          "maxZ": 36.248,
          "minX": 326.3,
          "minZ": 27.752,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_149:площадка",
          "maxX": 358.325,
          "maxZ": 36.916,
          "minX": 345.675,
          "minZ": 27.084,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_150:площадка",
          "maxX": 378.068,
          "maxZ": 37.067,
          "minX": 368.599,
          "minZ": 26.933,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_151:площадка",
          "maxX": 399.934,
          "maxZ": 36.218,
          "minX": 389.399,
          "minZ": 27.782,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_152:площадка",
          "maxX": 422.316,
          "maxZ": 36.103,
          "minX": 409.684,
          "minZ": 27.897,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_153:площадка",
          "maxX": 549.449,
          "maxZ": 59.453,
          "minX": 538.551,
          "minZ": 47.213,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_154:площадка",
          "maxX": 552.167,
          "maxZ": 79.207,
          "minX": 535.833,
          "minZ": 70.126,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_155:площадка",
          "maxX": 549.408,
          "maxZ": 144.871,
          "minX": 538.592,
          "minZ": 132.462,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_156:площадка",
          "maxX": 550.266,
          "maxZ": 228.836,
          "minX": 537.734,
          "minZ": 219.164,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_157:площадка",
          "maxX": 549.779,
          "maxZ": 250.046,
          "minX": 538.221,
          "minZ": 240.621,
          "y": 0.001
        },
        {
          "blend": 14,
          "id": "b_district_1_3_167:площадка",
          "maxX": -134.567,
          "maxZ": 548.763,
          "minX": -142.766,
          "minZ": 539.237,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_1_198:площадка",
          "maxX": 314.953,
          "maxZ": -29.787,
          "minX": 302.19,
          "minZ": -38.785,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_202:площадка",
          "maxX": 490.784,
          "maxZ": -166,
          "minX": 485.216,
          "minZ": -170,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_203:площадка",
          "maxX": 555.306,
          "maxZ": -164.521,
          "minX": 548.694,
          "minZ": -171.479,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_204:площадка",
          "maxX": 490.72,
          "maxZ": -148.917,
          "minX": 485.28,
          "minZ": -155.083,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_205:площадка",
          "maxX": 490.708,
          "maxZ": -133.063,
          "minX": 485.292,
          "minZ": -138.937,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_206:площадка",
          "maxX": 554.811,
          "maxZ": -133.361,
          "minX": 549.189,
          "minZ": -138.639,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_207:площадка",
          "maxX": 490.811,
          "maxZ": -69.113,
          "minX": 485.189,
          "minZ": -74.887,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_215:площадка",
          "maxX": 554.89,
          "maxZ": -180.887,
          "minX": 549.11,
          "minZ": -187.113,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_217:площадка",
          "maxX": -387.667,
          "maxZ": -531.031,
          "minX": -397.788,
          "minZ": -545.333,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_221:площадка",
          "maxX": -469.021,
          "maxZ": -588.958,
          "minX": -490.979,
          "minZ": -603.769,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_222:площадка",
          "maxX": -473.238,
          "maxZ": -560.997,
          "minX": -486.762,
          "minZ": -573.549,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_223:площадка",
          "maxX": -591.121,
          "maxZ": -472.957,
          "minX": -601.606,
          "minZ": -487.043,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_224:площадка",
          "maxX": -559.34,
          "maxZ": -472.7,
          "minX": -575.206,
          "minZ": -487.3,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_225:площадка",
          "maxX": 485.274,
          "maxZ": 143.523,
          "minX": 474.726,
          "minZ": 133.81,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_226:площадка",
          "maxX": 485.254,
          "maxZ": 165.043,
          "minX": 474.746,
          "minZ": 154.957,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_227:площадка",
          "maxX": 485.512,
          "maxZ": 185.612,
          "minX": 474.488,
          "minZ": 177.055,
          "y": 0.013
        },
        {
          "blend": 14,
          "id": "b_district_0_0_236:площадка",
          "maxX": -474.095,
          "maxZ": -618.12,
          "minX": -485.905,
          "minZ": -632.789,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_237:площадка",
          "maxX": -618.012,
          "maxZ": -473.08,
          "minX": -632.897,
          "minZ": -486.92,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_249:площадка",
          "maxX": 555.289,
          "maxZ": -197.57,
          "minX": 548.711,
          "minZ": -202.43,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_250:площадка",
          "maxX": 378.229,
          "maxZ": 57.813,
          "minX": 368.437,
          "minZ": 48.854,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_256:площадка",
          "maxX": -89.494,
          "maxZ": 569.875,
          "minX": -102.506,
          "minZ": 560.792,
          "y": 0.01
        },
        {
          "blend": 14,
          "id": "b_district_0_0_262:площадка",
          "maxX": -558.408,
          "maxZ": -589.829,
          "minX": -576.138,
          "minZ": -602.898,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_263:площадка",
          "maxX": -560.196,
          "maxZ": -412.784,
          "minX": -574.35,
          "minZ": -430.852,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_264:площадка",
          "maxX": -558.432,
          "maxZ": -357.675,
          "minX": -576.113,
          "minZ": -369.597,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_265:площадка",
          "maxX": -558.966,
          "maxZ": -326.311,
          "minX": -575.58,
          "minZ": -342.78,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_268:площадка",
          "maxX": 330.78,
          "maxZ": -53.967,
          "minX": 325.22,
          "minZ": -58.033,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_269:площадка",
          "maxX": 331.288,
          "maxZ": -36.556,
          "minX": 324.712,
          "minZ": -43.444,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_270:площадка",
          "maxX": 426.893,
          "maxZ": -37.546,
          "minX": 421.107,
          "minZ": -42.454,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_271:площадка",
          "maxX": 570.808,
          "maxZ": -20.873,
          "minX": 565.192,
          "minZ": -27.127,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_272:площадка",
          "maxX": -616.296,
          "maxZ": -558.732,
          "minX": -634.613,
          "minZ": -575.814,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_292:площадка",
          "maxX": -564.109,
          "maxZ": -250.007,
          "minX": -595.891,
          "minZ": -269.993,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_293:площадка",
          "maxX": -569.615,
          "maxZ": -211.945,
          "minX": -590.385,
          "minZ": -228.055,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_294:площадка",
          "maxX": -570.543,
          "maxZ": -171.527,
          "minX": -589.457,
          "minZ": -188.473,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_295:площадка",
          "maxX": -565.658,
          "maxZ": -8.785,
          "minX": -594.342,
          "minZ": -31.215,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_296:площадка",
          "maxX": -576.27,
          "maxZ": 23.584,
          "minX": -583.73,
          "minZ": 16.416,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_297:площадка",
          "maxX": -575.597,
          "maxZ": 143.946,
          "minX": -584.403,
          "minZ": 136.054,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_298:площадка",
          "maxX": -576.252,
          "maxZ": 224.433,
          "minX": -583.748,
          "minZ": 215.567,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_300:площадка",
          "maxX": 464.102,
          "maxZ": 100.204,
          "minX": 453.231,
          "minZ": 91.796,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_301:площадка",
          "maxX": 464.172,
          "maxZ": 142.706,
          "minX": 453.161,
          "minZ": 134.628,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_305:площадка",
          "maxX": -357.519,
          "maxZ": -530.537,
          "minX": -369.754,
          "minZ": -545.826,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_307:площадка",
          "maxX": 586.947,
          "maxZ": -101.344,
          "minX": 581.053,
          "minZ": -106.656,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_309:площадка",
          "maxX": 594.81,
          "maxZ": 228.673,
          "minX": 578.523,
          "minZ": 219.327,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_313:площадка",
          "maxX": -155.236,
          "maxZ": 591.617,
          "minX": -164.764,
          "minZ": 581.716,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_322:площадка",
          "maxX": 554.285,
          "maxZ": -230,
          "minX": 549.715,
          "minZ": -234,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_327:площадка",
          "maxX": 339.969,
          "maxZ": 631.988,
          "minX": 326.698,
          "minZ": 621.345,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_328:площадка",
          "maxX": -590.662,
          "maxZ": -590.415,
          "minX": -602.065,
          "minZ": -602.312,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_329:площадка",
          "maxX": -585.957,
          "maxZ": -386.224,
          "minX": -606.77,
          "minZ": -399.23,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_330:площадка",
          "maxX": -588.625,
          "maxZ": -355.431,
          "minX": -604.102,
          "minZ": -371.842,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_331:площадка",
          "maxX": -589.289,
          "maxZ": -329.038,
          "minX": -603.439,
          "minZ": -340.053,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_332:площадка",
          "maxX": -356.692,
          "maxZ": -560.466,
          "minX": -370.581,
          "minZ": -574.079,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_333:площадка",
          "maxX": -589.935,
          "maxZ": -620.028,
          "minX": -602.792,
          "minZ": -630.881,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_339:площадка",
          "maxX": 576.96,
          "maxZ": -513.778,
          "minX": 571.275,
          "minZ": -521.516,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_354:площадка",
          "maxX": -355.415,
          "maxZ": -587.797,
          "minX": -371.858,
          "minZ": -604.93,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_355:площадка",
          "maxX": 561.571,
          "maxZ": -551.426,
          "minX": 549.017,
          "minZ": -559.162,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_359:площадка",
          "maxX": -619.681,
          "maxZ": -416.722,
          "minX": -631.228,
          "minZ": -426.915,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_361:площадка",
          "maxX": -604.079,
          "maxZ": -249.926,
          "minX": -635.921,
          "minZ": -270.074,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_362:площадка",
          "maxX": -606.227,
          "maxZ": -129.127,
          "minX": -633.773,
          "minZ": -150.873,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_363:площадка",
          "maxX": -609.392,
          "maxZ": -92.664,
          "minX": -630.608,
          "minZ": -107.336,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_364:площадка",
          "maxX": -603.068,
          "maxZ": -49.074,
          "minX": -636.932,
          "minZ": -70.926,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_365:площадка",
          "maxX": -605.365,
          "maxZ": -10.544,
          "minX": -634.635,
          "minZ": -29.456,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_366:площадка",
          "maxX": -616.545,
          "maxZ": 24.572,
          "minX": -623.455,
          "minZ": 15.428,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_367:площадка",
          "maxX": -615.26,
          "maxZ": 103.849,
          "minX": -624.74,
          "minZ": 96.151,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_368:площадка",
          "maxX": -614.471,
          "maxZ": 185.319,
          "minX": -625.529,
          "minZ": 174.681,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_369:площадка",
          "maxX": -615.254,
          "maxZ": 224.898,
          "minX": -624.746,
          "minZ": 215.102,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_370:площадка",
          "maxX": -615.464,
          "maxZ": 303.406,
          "minX": -624.536,
          "minZ": 296.594,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_373:площадка",
          "maxX": -616.367,
          "maxZ": -386.151,
          "minX": -634.542,
          "minZ": -399.304,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_374:площадка",
          "maxX": -619.394,
          "maxZ": -357.688,
          "minX": -631.515,
          "minZ": -369.585,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_375:площадка",
          "maxX": 539.56,
          "maxZ": -570.984,
          "minX": 533.382,
          "minZ": -577.251,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_382:площадка",
          "maxX": 129.954,
          "maxZ": -561.856,
          "minX": 98.617,
          "minZ": -581.001,
          "y": 0.036
        },
        {
          "blend": 14,
          "id": "b_district_3_1_385:площадка",
          "maxX": 619.193,
          "maxZ": -229.857,
          "minX": 612.807,
          "minZ": -234.143,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_386:площадка",
          "maxX": -325.316,
          "maxZ": -589.516,
          "minX": -343.775,
          "minZ": -603.211,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_389:площадка",
          "maxX": -356.543,
          "maxZ": -618.501,
          "minX": -370.73,
          "minZ": -632.408,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_398:площадка",
          "maxX": -325.633,
          "maxZ": -618.675,
          "minX": -343.458,
          "minZ": -632.234,
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
              "x": 384,
              "y": 38.78,
              "z": 360
            },
            {
              "x": 383.539,
              "y": 39.063,
              "z": 364.682
            },
            {
              "x": 382.173,
              "y": 39.345,
              "z": 369.184
            },
            {
              "x": 379.955,
              "y": 39.628,
              "z": 373.334
            },
            {
              "x": 376.971,
              "y": 39.91,
              "z": 376.971
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
              "x": 376.971,
              "y": 39.91,
              "z": 376.971
            },
            {
              "x": 373.334,
              "y": 39.2,
              "z": 379.955
            },
            {
              "x": 369.184,
              "y": 38.49,
              "z": 382.173
            },
            {
              "x": 364.682,
              "y": 37.78,
              "z": 383.539
            },
            {
              "x": 360,
              "y": 37.07,
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
              "x": 360,
              "y": 37.07,
              "z": 384
            },
            {
              "x": 355.318,
              "y": 36.013,
              "z": 383.539
            },
            {
              "x": 350.816,
              "y": 34.955,
              "z": 382.173
            },
            {
              "x": 346.666,
              "y": 33.898,
              "z": 379.955
            },
            {
              "x": 343.029,
              "y": 32.84,
              "z": 376.971
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
              "x": 343.029,
              "y": 32.84,
              "z": 376.971
            },
            {
              "x": 340.045,
              "y": 32.143,
              "z": 373.334
            },
            {
              "x": 337.827,
              "y": 31.445,
              "z": 369.184
            },
            {
              "x": 336.461,
              "y": 30.748,
              "z": 364.682
            },
            {
              "x": 336,
              "y": 30.05,
              "z": 360
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_rb_360_360_5",
          "points": [
            {
              "x": 336,
              "y": 30.05,
              "z": 360
            },
            {
              "x": 336.461,
              "y": 29.81,
              "z": 355.318
            },
            {
              "x": 337.827,
              "y": 29.57,
              "z": 350.816
            },
            {
              "x": 340.045,
              "y": 29.33,
              "z": 346.666
            },
            {
              "x": 343.029,
              "y": 29.09,
              "z": 343.029
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_rb_360_360_6",
          "points": [
            {
              "x": 343.029,
              "y": 29.09,
              "z": 343.029
            },
            {
              "x": 346.666,
              "y": 29.428,
              "z": 340.045
            },
            {
              "x": 350.816,
              "y": 29.765,
              "z": 337.827
            },
            {
              "x": 355.318,
              "y": 30.103,
              "z": 336.461
            },
            {
              "x": 360,
              "y": 30.44,
              "z": 336
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_rb_360_360_7",
          "points": [
            {
              "x": 360,
              "y": 30.44,
              "z": 336
            },
            {
              "x": 364.682,
              "y": 31.41,
              "z": 336.461
            },
            {
              "x": 369.184,
              "y": 32.38,
              "z": 337.827
            },
            {
              "x": 373.334,
              "y": 33.35,
              "z": 340.045
            },
            {
              "x": 376.971,
              "y": 34.32,
              "z": 343.029
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_rb_360_360_8",
          "points": [
            {
              "x": 376.971,
              "y": 34.32,
              "z": 343.029
            },
            {
              "x": 379.955,
              "y": 35.435,
              "z": 346.666
            },
            {
              "x": 382.173,
              "y": 36.55,
              "z": 350.816
            },
            {
              "x": 383.539,
              "y": 37.665,
              "z": 355.318
            },
            {
              "x": 384,
              "y": 38.78,
              "z": 360
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
              "x": 376.97,
              "y": 39.91,
              "z": 376.97
            },
            {
              "x": 398,
              "y": 41.81,
              "z": 376.97
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
              "x": 460,
              "y": 34.03,
              "z": 360
            },
            {
              "x": 459.616,
              "y": 34.93,
              "z": 363.902
            },
            {
              "x": 458.478,
              "y": 35.83,
              "z": 367.654
            },
            {
              "x": 456.629,
              "y": 36.73,
              "z": 371.111
            },
            {
              "x": 454.142,
              "y": 37.63,
              "z": 374.142
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
              "x": 454.142,
              "y": 37.63,
              "z": 374.142
            },
            {
              "x": 451.111,
              "y": 38.478,
              "z": 376.629
            },
            {
              "x": 447.654,
              "y": 39.325,
              "z": 378.478
            },
            {
              "x": 443.902,
              "y": 40.173,
              "z": 379.616
            },
            {
              "x": 440,
              "y": 41.02,
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
              "x": 440,
              "y": 41.02,
              "z": 380
            },
            {
              "x": 436.098,
              "y": 41.253,
              "z": 379.616
            },
            {
              "x": 432.346,
              "y": 41.485,
              "z": 378.478
            },
            {
              "x": 428.889,
              "y": 41.718,
              "z": 376.629
            },
            {
              "x": 425.858,
              "y": 41.95,
              "z": 374.142
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
              "x": 425.858,
              "y": 41.95,
              "z": 374.142
            },
            {
              "x": 423.371,
              "y": 41.448,
              "z": 371.111
            },
            {
              "x": 421.522,
              "y": 40.945,
              "z": 367.654
            },
            {
              "x": 420.384,
              "y": 40.442,
              "z": 363.902
            },
            {
              "x": 420,
              "y": 39.94,
              "z": 360
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_rb_440_360_5",
          "points": [
            {
              "x": 420,
              "y": 39.94,
              "z": 360
            },
            {
              "x": 420.384,
              "y": 39,
              "z": 356.098
            },
            {
              "x": 421.522,
              "y": 38.06,
              "z": 352.346
            },
            {
              "x": 423.371,
              "y": 37.12,
              "z": 348.889
            },
            {
              "x": 425.858,
              "y": 36.18,
              "z": 345.858
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_rb_440_360_6",
          "points": [
            {
              "x": 425.858,
              "y": 36.18,
              "z": 345.858
            },
            {
              "x": 428.889,
              "y": 35.403,
              "z": 343.371
            },
            {
              "x": 432.346,
              "y": 34.625,
              "z": 341.522
            },
            {
              "x": 436.098,
              "y": 33.848,
              "z": 340.384
            },
            {
              "x": 440,
              "y": 33.07,
              "z": 340
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_rb_440_360_7",
          "points": [
            {
              "x": 440,
              "y": 33.07,
              "z": 340
            },
            {
              "x": 443.902,
              "y": 32.865,
              "z": 340.384
            },
            {
              "x": 447.654,
              "y": 32.66,
              "z": 341.522
            },
            {
              "x": 451.111,
              "y": 32.455,
              "z": 343.371
            },
            {
              "x": 454.142,
              "y": 32.25,
              "z": 345.858
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_rb_440_360_8",
          "points": [
            {
              "x": 454.142,
              "y": 32.25,
              "z": 345.858
            },
            {
              "x": 456.629,
              "y": 32.695,
              "z": 348.889
            },
            {
              "x": 458.478,
              "y": 33.14,
              "z": 352.346
            },
            {
              "x": 459.616,
              "y": 33.585,
              "z": 356.098
            },
            {
              "x": 460,
              "y": 34.03,
              "z": 360
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
              "x": 425.86,
              "y": 41.95,
              "z": 374.14
            },
            {
              "x": 398,
              "y": 41.52,
              "z": 374.14
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
              "x": 360,
              "y": 30.44,
              "z": 336
            },
            {
              "x": 350.22,
              "y": 29,
              "z": 336
            },
            {
              "x": 340.45,
              "y": 27.44,
              "z": 336
            },
            {
              "x": 330.67,
              "y": 25.83,
              "z": 336
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
              "x": 330.67,
              "y": 25.83,
              "z": 336
            },
            {
              "x": 330.67,
              "y": 23.75,
              "z": 324
            },
            {
              "x": 330.67,
              "y": 21.47,
              "z": 312
            },
            {
              "x": 330.67,
              "y": 19.08,
              "z": 300
            },
            {
              "x": 330.67,
              "y": 16.7,
              "z": 288
            },
            {
              "x": 330.67,
              "y": 14.45,
              "z": 276
            },
            {
              "x": 330.67,
              "y": 12.46,
              "z": 264
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
          "id": "tr_acc_1_3_2",
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
              "x": 330.67,
              "y": 12.46,
              "z": 264
            },
            {
              "x": 318.67,
              "y": 12.62,
              "z": 264
            },
            {
              "x": 306.67,
              "y": 13.02,
              "z": 264
            },
            {
              "x": 294.67,
              "y": 13.74,
              "z": 264
            },
            {
              "x": 282.67,
              "y": 14.53,
              "z": 264
            },
            {
              "x": 270.67,
              "y": 15.24,
              "z": 264
            },
            {
              "x": 258.67,
              "y": 15.85,
              "z": 264
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
              "x": 258.67,
              "y": 15.85,
              "z": 264
            },
            {
              "x": 258.67,
              "y": 16.2,
              "z": 270.18
            },
            {
              "x": 258.67,
              "y": 16.53,
              "z": 276.36
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
          "id": "tr_acc_1_15_2",
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
          "id": "tr_acc_1_17",
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
          "id": "tr_acc_1_17_2",
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
        }
      ]
    },
    "spawn": {
      "x": -520,
      "z": -520
    },
    "stream": {
      "aheadMax": 900,
      "aheadMin": 200,
      "budgetMs": 120,
      "chunk": 256,
      "keep": 1,
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
