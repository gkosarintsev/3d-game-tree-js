/**
 * СГЕНЕРИРОВАННО — руками не править.
 *
 * Источник правки: src/levels/level-18.json. После его изменения запуск
 * `node tools/build-level.mjs src/levels/level-18.json` перезаписывает этот файл и все
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

export const LEVEL_18 = {
  "gameplay": {
    "alienEnemies": {
      "count": 0
    },
    "cars": {
      "count": 1,
      "spots": [
        {
          "x": -560,
          "y": 10.289,
          "yaw": 90,
          "z": -520
        }
      ]
    },
    "enemies": {
      "count": 4
    },
    "exit": {
      "x": 520,
      "z": 520
    },
    "exitRadius": 4,
    "goal": "exit"
  },
  "hint": "Песочница: холмы и транспортные развязки (путепровод/эстакада). База для добавления развязок и отладки дорог и мостов.",
  "map": {
    "bodyProbe": 1.2,
    "bounds": {
      "maxX": 640,
      "maxZ": 640,
      "minX": -640,
      "minZ": -640
    },
    "catalog": "/src/levels/level-18",
    "cells": [
      {
        "file": "chunk-0-0.l14b",
        "id": "0_0",
        "objects": {
          "buildings": 85,
          "lights": 2,
          "props": 59,
          "roads": 18
        },
        "rect": {
          "maxX": 0,
          "maxZ": 0,
          "minX": -640,
          "minZ": -640
        }
      },
      {
        "file": "chunk-0-1.l14b",
        "id": "0_1",
        "objects": {
          "buildings": 44,
          "lights": 2,
          "props": 54,
          "roads": 17
        },
        "rect": {
          "maxX": 0,
          "maxZ": 640,
          "minX": -640,
          "minZ": 0
        }
      },
      {
        "file": "chunk-1-0.l14b",
        "id": "1_0",
        "objects": {
          "buildings": 148,
          "lights": 2,
          "props": 153,
          "roads": 17
        },
        "rect": {
          "maxX": 640,
          "maxZ": 0,
          "minX": 0,
          "minZ": -640
        }
      },
      {
        "file": "chunk-1-1.l14b",
        "id": "1_1",
        "objects": {
          "buildings": 127,
          "lights": 2,
          "props": 94,
          "roads": 16
        },
        "rect": {
          "maxX": 640,
          "maxZ": 640,
          "minX": 0,
          "minZ": 0
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
          "bx": -74.7,
          "bz": 5.7,
          "height": 43.6,
          "id": "hill_1",
          "radius": 176.7,
          "x": -74.7,
          "z": 5.7
        },
        {
          "bx": -190.2,
          "bz": -408,
          "height": 30.5,
          "id": "hill_2",
          "radius": 222.7,
          "x": -190.2,
          "z": -408
        },
        {
          "bx": 40.9,
          "bz": 216.5,
          "height": 32.1,
          "id": "hill_3",
          "radius": 273.7,
          "x": 40.9,
          "z": 216.5
        },
        {
          "bx": 341.3,
          "bz": -472.1,
          "height": 26.8,
          "id": "hill_4",
          "radius": 220.8,
          "x": 341.3,
          "z": -472.1
        },
        {
          "bx": -410.2,
          "bz": -411.9,
          "height": 36,
          "id": "hill_5",
          "radius": 284.4,
          "x": -410.2,
          "z": -411.9
        },
        {
          "bx": -339.4,
          "bz": 451.5,
          "height": 44.2,
          "id": "hill_6",
          "radius": 256.1,
          "x": -339.4,
          "z": 451.5
        },
        {
          "bx": -135.7,
          "bz": 111.1,
          "height": 28.6,
          "id": "hill_7",
          "radius": 182.4,
          "x": -135.7,
          "z": 111.1
        },
        {
          "bx": -210,
          "bz": -245.1,
          "height": 33.9,
          "id": "hill_8",
          "radius": 258.4,
          "x": -210,
          "z": -245.1
        },
        {
          "bx": -289.5,
          "bz": -112.1,
          "height": 18.4,
          "id": "hill_9",
          "radius": 196,
          "x": -289.5,
          "z": -112.1
        },
        {
          "bx": -200.4,
          "bz": 26.6,
          "height": 21.3,
          "id": "hill_10",
          "radius": 191.5,
          "x": -200.4,
          "z": 26.6
        },
        {
          "bx": 371.8,
          "bz": 242.3,
          "height": 26.9,
          "id": "hill_11",
          "radius": 261,
          "x": 371.8,
          "z": 242.3
        },
        {
          "bx": 339.2,
          "bz": -411.3,
          "height": 17,
          "id": "hill_12",
          "radius": 184.1,
          "x": 339.2,
          "z": -411.3
        }
      ],
      "maxSlope": 0.38,
      "pads": [
        {
          "blend": 14,
          "id": "b_district_3_1_1:площадка",
          "maxX": 539.254,
          "maxZ": -309.657,
          "minX": 532.746,
          "minZ": -314.343,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_2:площадка",
          "maxX": 538.835,
          "maxZ": -293.348,
          "minX": 533.165,
          "minZ": -298.652,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_3:площадка",
          "maxX": 539.38,
          "maxZ": -277.642,
          "minX": 532.62,
          "minZ": -282.358,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_4:площадка",
          "maxX": 539.642,
          "maxZ": -260.254,
          "minX": 532.358,
          "minZ": -267.746,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_5:площадка",
          "maxX": 538.698,
          "maxZ": -245.533,
          "minX": 533.302,
          "minZ": -250.467,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_6:площадка",
          "maxX": 539.927,
          "maxZ": -229.19,
          "minX": 532.073,
          "minZ": -234.81,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_7:площадка",
          "maxX": 538.821,
          "maxZ": -212.688,
          "minX": 533.179,
          "minZ": -219.312,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_8:площадка",
          "maxX": 539.774,
          "maxZ": -197.04,
          "minX": 532.226,
          "minZ": -202.96,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_9:площадка",
          "maxX": 539.107,
          "maxZ": -180.96,
          "minX": 532.893,
          "minZ": -187.04,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_10:площадка",
          "maxX": 539.535,
          "maxZ": -165.459,
          "minX": 532.465,
          "minZ": -170.541,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_11:площадка",
          "maxX": 538.28,
          "maxZ": -133.299,
          "minX": 533.72,
          "minZ": -138.701,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_12:площадка",
          "maxX": 538.854,
          "maxZ": -117.093,
          "minX": 533.146,
          "minZ": -122.907,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_13:площадка",
          "maxX": 538.365,
          "maxZ": -84.8,
          "minX": 533.635,
          "minZ": -91.2,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_14:площадка",
          "maxX": 540.066,
          "maxZ": -68.937,
          "minX": 531.934,
          "minZ": -75.063,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_15:площадка",
          "maxX": 539.404,
          "maxZ": -53.084,
          "minX": 532.596,
          "minZ": -58.916,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_32:площадка",
          "maxX": 542.688,
          "maxZ": -326.431,
          "minX": 530.254,
          "minZ": -332.393,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_47:площадка",
          "maxX": 49.586,
          "maxZ": 545.106,
          "minX": 37.687,
          "minZ": 531.258,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_48:площадка",
          "maxX": 81.572,
          "maxZ": 544.993,
          "minX": 63.883,
          "minZ": 531.371,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_49:площадка",
          "maxX": 137.435,
          "maxZ": 544.62,
          "minX": 124.383,
          "minZ": 531.744,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_50:площадка",
          "maxX": 166.043,
          "maxZ": 543.962,
          "minX": 153.957,
          "minZ": 532.401,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_51:площадка",
          "maxX": 196.344,
          "maxZ": 544.101,
          "minX": 181.838,
          "minZ": 532.263,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_52:площадка",
          "maxX": 254.18,
          "maxZ": 543.497,
          "minX": 240.365,
          "minZ": 532.866,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_53:площадка",
          "maxX": 315.439,
          "maxZ": 544.945,
          "minX": 295.47,
          "minZ": 531.419,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_57:площадка",
          "maxX": 551.196,
          "maxZ": 36.123,
          "minX": 536.804,
          "minZ": 27.877,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_68:площадка",
          "maxX": -6.383,
          "maxZ": 549.295,
          "minX": -14.951,
          "minZ": 538.705,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_74:площадка",
          "maxX": 552.42,
          "maxZ": 446.144,
          "minX": 540.913,
          "minZ": 433.856,
          "y": 0.035
        },
        {
          "blend": 14,
          "id": "b_district_3_3_75:площадка",
          "maxX": 554.32,
          "maxZ": 472.104,
          "minX": 539.014,
          "minZ": 461.229,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_76:площадка",
          "maxX": 556.739,
          "maxZ": 500.364,
          "minX": 536.594,
          "minZ": 486.302,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_77:площадка",
          "maxX": 557.108,
          "maxZ": 528,
          "minX": 536.225,
          "minZ": 512,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_78:площадка",
          "maxX": 339.842,
          "maxZ": 552.696,
          "minX": 326.824,
          "minZ": 540.637,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_79:площадка",
          "maxX": 368.899,
          "maxZ": 553.213,
          "minX": 351.101,
          "minZ": 540.12,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_80:площадка",
          "maxX": 423.991,
          "maxZ": 554.175,
          "minX": 402.676,
          "minZ": 539.159,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_81:площадка",
          "maxX": 448.929,
          "maxZ": 553.122,
          "minX": 431.071,
          "minZ": 540.211,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_82:площадка",
          "maxX": 476.052,
          "maxZ": 552.805,
          "minX": 457.281,
          "minZ": 540.528,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_83:площадка",
          "maxX": 503.162,
          "maxZ": 555.324,
          "minX": 483.504,
          "minZ": 538.009,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_85:площадка",
          "maxX": 555.765,
          "maxZ": -309.412,
          "minX": 548.235,
          "minZ": -314.588,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_86:площадка",
          "maxX": 554.634,
          "maxZ": -292.729,
          "minX": 549.366,
          "minZ": -299.271,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_87:площадка",
          "maxX": 554.749,
          "maxZ": -278,
          "minX": 549.251,
          "minZ": -282,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_88:площадка",
          "maxX": 555.453,
          "maxZ": -261.309,
          "minX": 548.547,
          "minZ": -266.691,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_89:площадка",
          "maxX": 554.396,
          "maxZ": -245.341,
          "minX": 549.604,
          "minZ": -250.659,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_90:площадка",
          "maxX": 554.414,
          "maxZ": -213.357,
          "minX": 549.586,
          "minZ": -218.643,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_91:площадка",
          "maxX": 555.972,
          "maxZ": -180.725,
          "minX": 548.028,
          "minZ": -187.275,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_92:площадка",
          "maxX": 554.584,
          "maxZ": -165.691,
          "minX": 549.416,
          "minZ": -170.309,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_93:площадка",
          "maxX": 554.912,
          "maxZ": -149.101,
          "minX": 549.088,
          "minZ": -154.899,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_94:площадка",
          "maxX": 554.409,
          "maxZ": -133.027,
          "minX": 549.591,
          "minZ": -138.973,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_95:площадка",
          "maxX": 555.186,
          "maxZ": -117.564,
          "minX": 548.814,
          "minZ": -122.436,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_96:площадка",
          "maxX": 554.779,
          "maxZ": -100.601,
          "minX": 549.221,
          "minZ": -107.399,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_97:площадка",
          "maxX": 554.824,
          "maxZ": -52.941,
          "minX": 549.176,
          "minZ": -59.059,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_98:площадка",
          "maxX": 555.404,
          "maxZ": -37.568,
          "minX": 548.596,
          "minZ": -42.432,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_99:площадка",
          "maxX": 554.417,
          "maxZ": -22,
          "minX": 549.583,
          "minZ": -26,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_100:площадка",
          "maxX": 554.166,
          "maxZ": -5.748,
          "minX": 549.834,
          "minZ": -10.252,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_111:площадка",
          "maxX": 558.096,
          "maxZ": -382.175,
          "minX": 552.493,
          "minZ": -389.59,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_112:площадка",
          "maxX": 556.926,
          "maxZ": 554.949,
          "minX": 536.408,
          "minZ": 538.385,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_116:площадка",
          "maxX": 573.5,
          "maxZ": 15.381,
          "minX": 557.167,
          "minZ": 5.953,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_117:площадка",
          "maxX": 569.851,
          "maxZ": 36.109,
          "minX": 560.815,
          "minZ": 27.891,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_118:площадка",
          "maxX": 569.839,
          "maxZ": 58.332,
          "minX": 560.827,
          "minZ": 48.335,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_129:площадка",
          "maxX": -2.5,
          "maxZ": 570.077,
          "minX": -18.833,
          "minZ": 560.589,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_144:площадка",
          "maxX": -7.978,
          "maxZ": -562.324,
          "minX": -21.113,
          "minZ": -572.222,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_145:площадка",
          "maxX": 138.431,
          "maxZ": 573.958,
          "minX": 123.387,
          "minZ": 560.587,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_146:площадка",
          "maxX": 166.896,
          "maxZ": 575.337,
          "minX": 153.104,
          "minZ": 559.209,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_147:площадка",
          "maxX": 195.38,
          "maxZ": 575.064,
          "minX": 182.802,
          "minZ": 559.482,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_148:площадка",
          "maxX": 224.086,
          "maxZ": 573.101,
          "minX": 212.278,
          "minZ": 561.444,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_149:площадка",
          "maxX": 256.011,
          "maxZ": 574.82,
          "minX": 238.535,
          "minZ": 559.726,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_150:площадка",
          "maxX": 281.857,
          "maxZ": 572.452,
          "minX": 270.87,
          "minZ": 562.093,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_151:площадка",
          "maxX": 313.084,
          "maxZ": 574.457,
          "minX": 297.825,
          "minZ": 560.089,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_152:площадка",
          "maxX": 571.135,
          "maxZ": -276.501,
          "minX": 564.865,
          "minZ": -283.499,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_153:площадка",
          "maxX": 571.891,
          "maxZ": -260.637,
          "minX": 564.109,
          "minZ": -267.363,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_154:площадка",
          "maxX": 571.96,
          "maxZ": -229.129,
          "minX": 564.04,
          "minZ": -234.871,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_155:площадка",
          "maxX": 571.3,
          "maxZ": -164.826,
          "minX": 564.7,
          "minZ": -171.174,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_156:площадка",
          "maxX": 570.767,
          "maxZ": -84.519,
          "minX": 565.233,
          "minZ": -91.481,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_159:площадка",
          "maxX": 559.016,
          "maxZ": -551.2,
          "minX": 551.572,
          "minZ": -559.388,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_166:площадка",
          "maxX": 583.345,
          "maxZ": 444.282,
          "minX": 563.321,
          "minZ": 435.718,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_167:площадка",
          "maxX": 584.167,
          "maxZ": 498.214,
          "minX": 562.5,
          "minZ": 488.453,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_168:площадка",
          "maxX": 581.599,
          "maxZ": 526.844,
          "minX": 565.068,
          "minZ": 513.156,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_169:площадка",
          "maxX": 369.71,
          "maxZ": 580.025,
          "minX": 350.29,
          "minZ": 566.642,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_170:площадка",
          "maxX": 395.577,
          "maxZ": 577.376,
          "minX": 377.756,
          "minZ": 569.291,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_171:площадка",
          "maxX": 449.944,
          "maxZ": 580.371,
          "minX": 430.056,
          "minZ": 566.296,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_172:площадка",
          "maxX": 474.939,
          "maxZ": 580.334,
          "minX": 458.394,
          "minZ": 566.333,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_173:площадка",
          "maxX": 500.912,
          "maxZ": 578.735,
          "minX": 485.754,
          "minZ": 567.931,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_174:площадка",
          "maxX": 528.888,
          "maxZ": 579.235,
          "minX": 511.112,
          "minZ": 567.432,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_179:площадка",
          "maxX": 580.855,
          "maxZ": -514.45,
          "minX": 567.381,
          "minZ": -520.844,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_180:площадка",
          "maxX": 580.209,
          "maxZ": -477.255,
          "minX": 568.026,
          "minZ": -482.745,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_181:площадка",
          "maxX": 576.882,
          "maxZ": -457.858,
          "minX": 571.354,
          "minZ": -464.495,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_182:площадка",
          "maxX": 579.669,
          "maxZ": -420.407,
          "minX": 568.566,
          "minZ": -426.652,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_183:площадка",
          "maxX": 578.446,
          "maxZ": -380.643,
          "minX": 569.789,
          "minZ": -391.122,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_184:площадка",
          "maxX": 577.903,
          "maxZ": -362.735,
          "minX": 570.332,
          "minZ": -371.383,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_186:площадка",
          "maxX": -26.607,
          "maxZ": 569.317,
          "minX": -37.393,
          "minZ": 561.35,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_188:площадка",
          "maxX": -46.48,
          "maxZ": 547.453,
          "minX": -60.187,
          "minZ": 540.547,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_189:площадка",
          "maxX": 551.457,
          "maxZ": 579.573,
          "minX": 541.876,
          "minZ": 567.094,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_191:площадка",
          "maxX": 586.96,
          "maxZ": -277.249,
          "minX": 581.04,
          "minZ": -282.751,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_192:площадка",
          "maxX": 586.683,
          "maxZ": -261.735,
          "minX": 581.317,
          "minZ": -266.265,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_193:площадка",
          "maxX": 586.61,
          "maxZ": -165.135,
          "minX": 581.39,
          "minZ": -170.865,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_194:площадка",
          "maxX": 586.197,
          "maxZ": -85.275,
          "minX": 581.803,
          "minZ": -90.725,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_195:площадка",
          "maxX": 587.159,
          "maxZ": -68.129,
          "minX": 580.841,
          "minZ": -75.871,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_196:площадка",
          "maxX": 587.357,
          "maxZ": -53.281,
          "minX": 580.643,
          "minZ": -58.719,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_197:площадка",
          "maxX": 586.85,
          "maxZ": -21.311,
          "minX": 581.15,
          "minZ": -26.689,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_198:площадка",
          "maxX": 587.021,
          "maxZ": -4.399,
          "minX": 580.979,
          "minZ": -11.601,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_202:площадка",
          "maxX": 593.807,
          "maxZ": 14.519,
          "minX": 579.526,
          "minZ": 6.815,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_203:площадка",
          "maxX": 593.213,
          "maxZ": 57.135,
          "minX": 580.12,
          "minZ": 49.531,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_213:площадка",
          "maxX": -5.673,
          "maxZ": 591.786,
          "minX": -15.66,
          "minZ": 581.547,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_217:площадка",
          "maxX": -49.042,
          "maxZ": 570.096,
          "minX": -57.625,
          "minZ": 560.571,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_224:площадка",
          "maxX": 596.963,
          "maxZ": -437.649,
          "minX": 588.92,
          "minZ": -447.057,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_225:площадка",
          "maxX": 598.615,
          "maxZ": -419.759,
          "minX": 587.267,
          "minZ": -427.3,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_226:площадка",
          "maxX": 598.223,
          "maxZ": -382.779,
          "minX": 587.659,
          "minZ": -388.986,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_227:площадка",
          "maxX": 597.539,
          "maxZ": -325.205,
          "minX": 588.343,
          "minZ": -333.618,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_239:площадка",
          "maxX": 107.68,
          "maxZ": 602.933,
          "minX": 95.956,
          "minZ": 589.794,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_240:площадка",
          "maxX": 223.819,
          "maxZ": 601.73,
          "minX": 212.544,
          "minZ": 590.997,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_241:площадка",
          "maxX": -69.373,
          "maxZ": 548.081,
          "minX": -79.96,
          "minZ": 539.919,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_242:площадка",
          "maxX": 602.185,
          "maxZ": -229.61,
          "minX": 597.815,
          "minZ": -234.39,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_243:площадка",
          "maxX": 602.481,
          "maxZ": -213.386,
          "minX": 597.519,
          "minZ": -218.614,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_244:площадка",
          "maxX": 603.646,
          "maxZ": -180.933,
          "minX": 596.354,
          "minZ": -187.067,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_245:площадка",
          "maxX": 602.798,
          "maxZ": -101.668,
          "minX": 597.202,
          "minZ": -106.332,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_246:площадка",
          "maxX": 603.222,
          "maxZ": -68.696,
          "minX": 596.778,
          "minZ": -75.304,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_247:площадка",
          "maxX": 602.792,
          "maxZ": -21.059,
          "minX": 597.208,
          "minZ": -26.941,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_248:площадка",
          "maxX": -111.552,
          "maxZ": 590.828,
          "minX": -123.115,
          "minZ": 582.505,
          "y": 0.021
        },
        {
          "blend": 14,
          "id": "b_district_3_3_250:площадка",
          "maxX": 609.762,
          "maxZ": 393.191,
          "minX": 590.238,
          "minZ": 380.142,
          "y": 0.009
        },
        {
          "blend": 14,
          "id": "b_district_3_3_251:площадка",
          "maxX": 610.798,
          "maxZ": 418.917,
          "minX": 589.202,
          "minZ": 407.75,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_252:площадка",
          "maxX": 609.94,
          "maxZ": 444.832,
          "minX": 590.06,
          "minZ": 435.168,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_253:площадка",
          "maxX": 606.471,
          "maxZ": 473.329,
          "minX": 593.529,
          "minZ": 460.004,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_254:площадка",
          "maxX": 608.035,
          "maxZ": 500.115,
          "minX": 591.965,
          "minZ": 486.552,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_255:площадка",
          "maxX": 605.256,
          "maxZ": 525.889,
          "minX": 594.744,
          "minZ": 514.111,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_256:площадка",
          "maxX": 343.32,
          "maxZ": 606.017,
          "minX": 323.347,
          "minZ": 593.983,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_257:площадка",
          "maxX": 397.5,
          "maxZ": 605.428,
          "minX": 375.833,
          "minZ": 594.572,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_258:площадка",
          "maxX": 528.748,
          "maxZ": 609.166,
          "minX": 511.252,
          "minZ": 590.834,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_262:площадка",
          "maxX": 608.168,
          "maxZ": 553.982,
          "minX": 591.832,
          "minZ": 539.352,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_263:площадка",
          "maxX": -46.994,
          "maxZ": 591.018,
          "minX": -59.673,
          "minZ": 582.315,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_265:площадка",
          "maxX": 613.026,
          "maxZ": 37.695,
          "minX": 602.974,
          "minZ": 26.305,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_266:площадка",
          "maxX": -90.92,
          "maxZ": 571.024,
          "minX": -101.08,
          "minZ": 559.643,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_271:площадка",
          "maxX": 616.937,
          "maxZ": -401.646,
          "minX": 606.593,
          "minZ": -407.765,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_272:площадка",
          "maxX": 615.793,
          "maxZ": -325.723,
          "minX": 607.737,
          "minZ": -333.1,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_273:площадка",
          "maxX": 618.676,
          "maxZ": -308.24,
          "minX": 613.324,
          "minZ": -315.76,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_274:площадка",
          "maxX": 618.259,
          "maxZ": -133.724,
          "minX": 613.741,
          "minZ": -138.276,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_275:площадка",
          "maxX": 619.129,
          "maxZ": -117.898,
          "minX": 612.871,
          "minZ": -122.102,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_276:площадка",
          "maxX": 618.762,
          "maxZ": -100.63,
          "minX": 613.238,
          "minZ": -107.37,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_277:площадка",
          "maxX": 619.89,
          "maxZ": -37.178,
          "minX": 612.11,
          "minZ": -42.822,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_278:площадка",
          "maxX": 583.633,
          "maxZ": 606.259,
          "minX": 563.033,
          "minZ": 593.741,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_281:площадка",
          "maxX": -68.74,
          "maxZ": 590.639,
          "minX": -80.593,
          "minZ": 582.694,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_283:площадка",
          "maxX": 598.265,
          "maxZ": -589.899,
          "minX": 587.617,
          "minZ": -595.984,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_290:площадка",
          "maxX": -96.769,
          "maxZ": -618.71,
          "minX": -106.867,
          "minZ": -632.199,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_291:площадка",
          "maxX": -38.185,
          "maxZ": -619.366,
          "minX": -49.088,
          "minZ": -631.543,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_292:площадка",
          "maxX": 50.196,
          "maxZ": 630.97,
          "minX": 37.077,
          "minZ": 619.939,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_293:площадка",
          "maxX": 137.988,
          "maxZ": 631.616,
          "minX": 123.83,
          "minZ": 619.293,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_294:площадка",
          "maxX": 254.993,
          "maxZ": 631.872,
          "minX": 239.552,
          "minZ": 619.037,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_295:площадка",
          "maxX": 313.93,
          "maxZ": 631.51,
          "minX": 296.979,
          "minZ": 619.399,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_297:площадка",
          "maxX": 632.724,
          "maxZ": 338.903,
          "minX": 620.61,
          "minZ": 327.763,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_298:площадка",
          "maxX": 634.76,
          "maxZ": 473.7,
          "minX": 618.574,
          "minZ": 459.634,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_299:площадка",
          "maxX": 343.582,
          "maxZ": 633.521,
          "minX": 323.084,
          "minZ": 619.813,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_300:площадка",
          "maxX": 501.964,
          "maxZ": 633.57,
          "minX": 484.702,
          "minZ": 619.763,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_301:площадка",
          "maxX": 636.905,
          "maxZ": 35.785,
          "minX": 621.762,
          "minZ": 28.215,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_302:площадка",
          "maxX": 633.906,
          "maxZ": 99.356,
          "minX": 624.76,
          "minZ": 92.644,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_303:площадка",
          "maxX": 635.4,
          "maxZ": 122.686,
          "minX": 623.267,
          "minZ": 111.981,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_305:площадка",
          "maxX": -91.884,
          "maxZ": 611.825,
          "minX": -100.116,
          "minZ": 604.175,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_307:площадка",
          "maxX": 555.666,
          "maxZ": 634.656,
          "minX": 537.668,
          "minZ": 618.677,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_309:площадка",
          "maxX": 520.164,
          "maxZ": -626.421,
          "minX": 515.13,
          "minZ": -634.755,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_310:площадка",
          "maxX": 634.324,
          "maxZ": -457.184,
          "minX": 626.852,
          "minZ": -465.169,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_311:площадка",
          "maxX": 635.155,
          "maxZ": -400.371,
          "minX": 626.022,
          "minZ": -409.041,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_312:площадка",
          "maxX": 636.204,
          "maxZ": -363.424,
          "minX": 624.972,
          "minZ": -370.694,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_313:площадка",
          "maxX": -617.893,
          "maxZ": -617.885,
          "minX": -633.016,
          "minZ": -633.024,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_314:площадка",
          "maxX": 540.239,
          "maxZ": -627.058,
          "minX": 532.702,
          "minZ": -634.118,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_315:площадка",
          "maxX": 634.563,
          "maxZ": -293.684,
          "minX": 629.437,
          "minZ": -298.316,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_316:площадка",
          "maxX": 634.554,
          "maxZ": -261.541,
          "minX": 629.446,
          "minZ": -266.459,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_317:площадка",
          "maxX": 635.152,
          "maxZ": -229.683,
          "minX": 628.848,
          "minZ": -234.317,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_318:площадка",
          "maxX": 635.174,
          "maxZ": -197.202,
          "minX": 628.826,
          "minZ": -202.798,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_319:площадка",
          "maxX": 634.647,
          "maxZ": -84.599,
          "minX": 629.353,
          "minZ": -91.401,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_320:площадка",
          "maxX": 608.967,
          "maxZ": 606.733,
          "minX": 591.033,
          "minZ": 593.267,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_323:площадка",
          "maxX": 634.639,
          "maxZ": -569.487,
          "minX": 626.538,
          "minZ": -578.748,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_328:площадка",
          "maxX": 633.246,
          "maxZ": -626.773,
          "minX": 627.931,
          "minZ": -634.403,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_334:площадка",
          "maxX": -601.779,
          "maxZ": 354.711,
          "minX": -632.507,
          "minZ": 331.003,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_335:площадка",
          "maxX": 538.921,
          "maxZ": -149.286,
          "minX": 533.079,
          "minZ": -154.714,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_337:площадка",
          "maxX": 282.096,
          "maxZ": 543.602,
          "minX": 270.631,
          "minZ": 532.762,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_338:площадка",
          "maxX": 550.121,
          "maxZ": 14.591,
          "minX": 537.879,
          "minZ": 6.743,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_351:площадка",
          "maxX": 48.65,
          "maxZ": 573.364,
          "minX": 38.623,
          "minZ": 561.182,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_352:площадка",
          "maxX": 79.833,
          "maxZ": 573.65,
          "minX": 65.622,
          "minZ": 560.895,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_353:площадка",
          "maxX": 571.392,
          "maxZ": -309.22,
          "minX": 564.608,
          "minZ": -314.78,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_354:площадка",
          "maxX": 570.644,
          "maxZ": -244.676,
          "minX": 565.356,
          "minZ": -251.324,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_355:площадка",
          "maxX": 570.223,
          "maxZ": -53.618,
          "minX": 565.777,
          "minZ": -58.382,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_356:площадка",
          "maxX": 571.16,
          "maxZ": -37.739,
          "minX": 564.84,
          "minZ": -42.261,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_357:площадка",
          "maxX": 30.445,
          "maxZ": -564.546,
          "minX": 15.269,
          "minZ": -578.311,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_359:площадка",
          "maxX": 343.205,
          "maxZ": 580.208,
          "minX": 323.462,
          "minZ": 566.459,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_360:площадка",
          "maxX": 421.342,
          "maxZ": 579.406,
          "minX": 405.325,
          "minZ": 567.261,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_363:площадка",
          "maxX": 581.029,
          "maxZ": -495.254,
          "minX": 567.206,
          "minZ": -502.393,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_364:площадка",
          "maxX": 581.029,
          "maxZ": -438.443,
          "minX": 567.206,
          "minZ": -446.263,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_365:площадка",
          "maxX": 577.986,
          "maxZ": -531.731,
          "minX": 570.249,
          "minZ": -541.21,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_366:площадка",
          "maxX": 586.757,
          "maxZ": -101.303,
          "minX": 581.243,
          "minZ": -106.697,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_368:площадка",
          "maxX": 597.918,
          "maxZ": -495.473,
          "minX": 587.964,
          "minZ": -502.174,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_371:площадка",
          "maxX": -8.457,
          "maxZ": -588.799,
          "minX": -20.634,
          "minZ": -603.928,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_372:площадка",
          "maxX": 21.635,
          "maxZ": 603.662,
          "minX": 7.455,
          "minZ": 589.065,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_373:площадка",
          "maxX": 167.971,
          "maxZ": 605.139,
          "minX": 152.029,
          "minZ": 587.588,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_374:площадка",
          "maxX": 254.014,
          "maxZ": 603.794,
          "minX": 240.531,
          "minZ": 588.933,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_375:площадка",
          "maxX": 283.041,
          "maxZ": 602.049,
          "minX": 269.686,
          "minZ": 590.678,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_376:площадка",
          "maxX": 311.608,
          "maxZ": 601.483,
          "minX": 299.301,
          "minZ": 591.245,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_379:площадка",
          "maxX": 602.672,
          "maxZ": -277.681,
          "minX": 597.328,
          "minZ": -282.319,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_380:площадка",
          "maxX": 603.712,
          "maxZ": -164.87,
          "minX": 596.288,
          "minZ": -171.13,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_381:площадка",
          "maxX": 602.955,
          "maxZ": -37.849,
          "minX": 597.045,
          "minZ": -42.151,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_382:площадка",
          "maxX": 421.421,
          "maxZ": 607.594,
          "minX": 405.246,
          "minZ": 592.406,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_388:площадка",
          "maxX": 522.828,
          "maxZ": -608.149,
          "minX": 512.466,
          "minZ": -615.381,
          "y": 0.008
        },
        {
          "blend": 14,
          "id": "b_district_3_0_389:площадка",
          "maxX": 615.84,
          "maxZ": -512.754,
          "minX": 607.69,
          "minZ": -522.54,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_391:площадка",
          "maxX": 619.791,
          "maxZ": -229.368,
          "minX": 612.209,
          "minZ": -234.632,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_396:площадка",
          "maxX": 167.7,
          "maxZ": 632.062,
          "minX": 152.3,
          "minZ": 618.847,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_397:площадка",
          "maxX": 224.732,
          "maxZ": 632.483,
          "minX": 211.631,
          "minZ": 618.426,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_398:площадка",
          "maxX": 285.224,
          "maxZ": 631.391,
          "minX": 267.504,
          "minZ": 619.518,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_399:площадка",
          "maxX": 618.224,
          "maxZ": -569.937,
          "minX": 605.305,
          "minZ": -578.298,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_400:площадка",
          "maxX": 633.338,
          "maxZ": 502.023,
          "minX": 619.995,
          "minZ": 484.643,
          "y": 0
        }
      ],
      "roadCorridors": [
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_repair_connect",
          "points": [
            {
              "x": -520,
              "y": 15.75,
              "z": -520
            },
            {
              "x": 520,
              "y": 1.88,
              "z": -520
            },
            {
              "x": 520,
              "y": 0,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_repair_connect_extra_1",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": 520
            },
            {
              "x": 0,
              "y": 0,
              "z": 520
            },
            {
              "x": 0,
              "y": 0,
              "z": 220
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_repair_connect_extra_5",
          "points": [
            {
              "x": 0,
              "y": 0,
              "z": -220
            },
            {
              "x": 150,
              "y": 0,
              "z": -220
            },
            {
              "x": 150,
              "y": 0,
              "z": -60
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
              "x": -520,
              "y": 15.75,
              "z": -520
            },
            {
              "x": -532,
              "y": 14.11,
              "z": -520
            },
            {
              "x": -544,
              "y": 12.42,
              "z": -520
            },
            {
              "x": -556,
              "y": 10.73,
              "z": -520
            },
            {
              "x": -568,
              "y": 9.05,
              "z": -520
            },
            {
              "x": -580,
              "y": 7.43,
              "z": -520
            },
            {
              "x": -592,
              "y": 5.88,
              "z": -520
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
              "x": -592,
              "y": 5.88,
              "z": -520
            },
            {
              "x": -592,
              "y": 6.75,
              "z": -508
            },
            {
              "x": -592,
              "y": 7.58,
              "z": -496
            },
            {
              "x": -592,
              "y": 8.34,
              "z": -484
            },
            {
              "x": -592,
              "y": 9.02,
              "z": -472
            },
            {
              "x": -592,
              "y": 9.6,
              "z": -460
            },
            {
              "x": -592,
              "y": 10.06,
              "z": -448
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
              "x": -592,
              "y": 10.06,
              "z": -448
            },
            {
              "x": -580,
              "y": 12.14,
              "z": -448
            },
            {
              "x": -568,
              "y": 14.29,
              "z": -448
            },
            {
              "x": -556,
              "y": 16.48,
              "z": -448
            },
            {
              "x": -544,
              "y": 18.69,
              "z": -448
            },
            {
              "x": -532,
              "y": 20.87,
              "z": -448
            },
            {
              "x": -520,
              "y": 22.99,
              "z": -448
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
              "x": -520,
              "y": 22.99,
              "z": -448
            },
            {
              "x": -520,
              "y": 23.57,
              "z": -436
            },
            {
              "x": -520,
              "y": 23.93,
              "z": -424
            },
            {
              "x": -520,
              "y": 24.05,
              "z": -412
            },
            {
              "x": -520,
              "y": 23.93,
              "z": -400
            },
            {
              "x": -520,
              "y": 23.58,
              "z": -388
            },
            {
              "x": -520,
              "y": 23.01,
              "z": -376
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
              "x": -520,
              "y": 23.01,
              "z": -376
            },
            {
              "x": -508,
              "y": 25.05,
              "z": -376
            },
            {
              "x": -496,
              "y": 26.97,
              "z": -376
            },
            {
              "x": -484,
              "y": 28.74,
              "z": -376
            },
            {
              "x": -472,
              "y": 30.32,
              "z": -376
            },
            {
              "x": -460,
              "y": 31.69,
              "z": -376
            },
            {
              "x": -448,
              "y": 32.81,
              "z": -376
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
              "x": -448,
              "y": 32.81,
              "z": -376
            },
            {
              "x": -448,
              "y": 31.9,
              "z": -365.64
            },
            {
              "x": -448,
              "y": 30.8,
              "z": -355.27
            },
            {
              "x": -448,
              "y": 29.52,
              "z": -344.91
            },
            {
              "x": -448,
              "y": 28.13,
              "z": -334.55
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
              "x": 0,
              "y": 30.33,
              "z": 220
            },
            {
              "x": -12,
              "y": 29.7,
              "z": 220
            },
            {
              "x": -24,
              "y": 29.15,
              "z": 220
            },
            {
              "x": -36,
              "y": 28.63,
              "z": 220
            },
            {
              "x": -48,
              "y": 28.08,
              "z": 220
            },
            {
              "x": -60,
              "y": 27.45,
              "z": 220
            },
            {
              "x": -72,
              "y": 26.69,
              "z": 220
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
              "x": -72,
              "y": 26.69,
              "z": 220
            },
            {
              "x": -72,
              "y": 24.53,
              "z": 232
            },
            {
              "x": -72,
              "y": 22.41,
              "z": 244
            },
            {
              "x": -72,
              "y": 20.43,
              "z": 256
            },
            {
              "x": -72,
              "y": 18.71,
              "z": 268
            },
            {
              "x": -72,
              "y": 17.35,
              "z": 280
            },
            {
              "x": -72,
              "y": 16.23,
              "z": 292
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
              "x": -72,
              "y": 16.23,
              "z": 292
            },
            {
              "x": -84,
              "y": 14.45,
              "z": 292
            },
            {
              "x": -96,
              "y": 12.64,
              "z": 292
            },
            {
              "x": -108,
              "y": 10.84,
              "z": 292
            },
            {
              "x": -120,
              "y": 9.07,
              "z": 292
            },
            {
              "x": -132,
              "y": 7.38,
              "z": 292
            },
            {
              "x": -144,
              "y": 5.8,
              "z": 292
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
              "x": -144,
              "y": 5.8,
              "z": 292
            },
            {
              "x": -144,
              "y": 5.36,
              "z": 304
            },
            {
              "x": -144,
              "y": 5.06,
              "z": 316
            },
            {
              "x": -144,
              "y": 4.86,
              "z": 328
            },
            {
              "x": -144,
              "y": 4.77,
              "z": 340
            },
            {
              "x": -144,
              "y": 4.75,
              "z": 352
            },
            {
              "x": -144,
              "y": 4.79,
              "z": 364
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
              "x": -144,
              "y": 4.79,
              "z": 364
            },
            {
              "x": -156,
              "y": 5.8,
              "z": 364
            },
            {
              "x": -168,
              "y": 7.23,
              "z": 364
            },
            {
              "x": -180,
              "y": 9.08,
              "z": 364
            },
            {
              "x": -192,
              "y": 11.3,
              "z": 364
            },
            {
              "x": -204,
              "y": 13.71,
              "z": 364
            },
            {
              "x": -216,
              "y": 16.15,
              "z": 364
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
              "x": -216,
              "y": 16.15,
              "z": 364
            },
            {
              "x": -216,
              "y": 17.59,
              "z": 374.22
            },
            {
              "x": -216,
              "y": 18.9,
              "z": 384.45
            },
            {
              "x": -216,
              "y": 20.08,
              "z": 394.67
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
              "x": -216,
              "y": 20.08,
              "z": 394.67
            },
            {
              "x": -225.78,
              "y": 22.36,
              "z": 394.67
            },
            {
              "x": -235.55,
              "y": 24.6,
              "z": 394.67
            },
            {
              "x": -245.33,
              "y": 26.77,
              "z": 394.67
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
              "x": -245.33,
              "y": 26.77,
              "z": 394.67
            },
            {
              "x": -245.33,
              "y": 28.2,
              "z": 406.67
            },
            {
              "x": -245.33,
              "y": 29.34,
              "z": 418.67
            },
            {
              "x": -245.33,
              "y": 30.14,
              "z": 430.67
            },
            {
              "x": -245.33,
              "y": 30.59,
              "z": 442.67
            },
            {
              "x": -245.33,
              "y": 30.68,
              "z": 454.67
            },
            {
              "x": -245.33,
              "y": 30.4,
              "z": 466.67
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
              "x": -245.33,
              "y": 30.4,
              "z": 466.67
            },
            {
              "x": -234.66,
              "y": 27.79,
              "z": 466.67
            },
            {
              "x": -224,
              "y": 25.11,
              "z": 466.67
            },
            {
              "x": -213.33,
              "y": 22.38,
              "z": 466.67
            },
            {
              "x": -202.66,
              "y": 19.64,
              "z": 466.67
            },
            {
              "x": -192,
              "y": 16.93,
              "z": 466.67
            },
            {
              "x": -181.33,
              "y": 14.29,
              "z": 466.67
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
              "x": -181.33,
              "y": 14.29,
              "z": 466.67
            },
            {
              "x": -181.33,
              "y": 13.91,
              "z": 478.67
            },
            {
              "x": -181.33,
              "y": 13.31,
              "z": 490.67
            },
            {
              "x": -181.33,
              "y": 12.53,
              "z": 502.67
            },
            {
              "x": -181.33,
              "y": 11.58,
              "z": 514.67
            },
            {
              "x": -181.33,
              "y": 10.48,
              "z": 526.67
            },
            {
              "x": -181.33,
              "y": 9.28,
              "z": 538.67
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
              "x": 220,
              "y": 0,
              "z": 0
            },
            {
              "x": 232,
              "y": 0,
              "z": 0
            },
            {
              "x": 244,
              "y": 0,
              "z": 0
            },
            {
              "x": 256,
              "y": 0,
              "z": 0
            },
            {
              "x": 268,
              "y": 0,
              "z": 0
            },
            {
              "x": 280,
              "y": 0,
              "z": 0
            },
            {
              "x": 292,
              "y": 0.04,
              "z": 0
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
              "x": 292,
              "y": 0.04,
              "z": 0
            },
            {
              "x": 292,
              "y": 0.34,
              "z": 12
            },
            {
              "x": 292,
              "y": 0.9,
              "z": 24
            },
            {
              "x": 292,
              "y": 1.69,
              "z": 36
            },
            {
              "x": 292,
              "y": 2.68,
              "z": 48
            },
            {
              "x": 292,
              "y": 3.83,
              "z": 60
            },
            {
              "x": 292,
              "y": 5.13,
              "z": 72
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
      "chunk": 640,
      "keep": 1,
      "overlap": 1.175
    },
    "units": "meters",
    "windows": {
      "spacing": 12
    }
  },
  "name": "Глава 18. Песочница развязок",
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
LEVEL_18.map.skeleton = decodeSkeleton(await loadSkel());
