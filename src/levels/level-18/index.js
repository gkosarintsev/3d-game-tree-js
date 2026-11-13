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
          "y": 0.12,
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
  "hint": "Песочница: клеверная развязка — 4 петли (кривые 270° дуги, подъём 0→7→0 м) вокруг центрального путепровода. Холмы в центре убраны.",
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
          "buildings": 80,
          "lights": 2,
          "props": 160,
          "roads": 24
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
          "buildings": 43,
          "lights": 3,
          "props": 115,
          "roads": 22
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
          "buildings": 152,
          "lights": 1,
          "props": 230,
          "roads": 26
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
          "buildings": 130,
          "lights": 3,
          "props": 153,
          "roads": 26
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
          "bx": -350,
          "bz": 200,
          "height": 22,
          "id": "hill_west",
          "radius": 140,
          "x": -350,
          "z": 200
        },
        {
          "bx": 350,
          "bz": -220,
          "height": 28,
          "id": "hill_east",
          "radius": 160,
          "x": 350,
          "z": -220
        },
        {
          "bx": 120,
          "bz": 380,
          "height": 18,
          "id": "hill_north",
          "radius": 130,
          "x": 120,
          "z": 380
        },
        {
          "bx": -120,
          "bz": -350,
          "height": 10,
          "id": "valley_south",
          "radius": 150,
          "x": -120,
          "z": -350
        }
      ],
      "maxSlope": 0.33,
      "pads": [
        {
          "blend": 14,
          "id": "b_district_3_1_1:площадка",
          "maxX": 538.496,
          "maxZ": -294,
          "minX": 533.504,
          "minZ": -298,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_2:площадка",
          "maxX": 539.505,
          "maxZ": -245.217,
          "minX": 532.495,
          "minZ": -250.783,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_3:площадка",
          "maxX": 539.354,
          "maxZ": -213.718,
          "minX": 532.646,
          "minZ": -218.282,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_4:площадка",
          "maxX": 539.108,
          "maxZ": -197.795,
          "minX": 532.892,
          "minZ": -202.205,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_5:площадка",
          "maxX": 539.952,
          "maxZ": -148.909,
          "minX": 532.048,
          "minZ": -155.091,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_6:площадка",
          "maxX": 538.103,
          "maxZ": -133.714,
          "minX": 533.897,
          "minZ": -138.286,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_7:площадка",
          "maxX": 539.62,
          "maxZ": -116.252,
          "minX": 532.38,
          "minZ": -123.748,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_8:площадка",
          "maxX": 539.279,
          "maxZ": -85.81,
          "minX": 532.721,
          "minZ": -90.19,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_9:площадка",
          "maxX": 538.128,
          "maxZ": -69.233,
          "minX": 533.872,
          "minZ": -74.767,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_10:площадка",
          "maxX": 539.774,
          "maxZ": -53.04,
          "minX": 532.226,
          "minZ": -58.96,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_11:площадка",
          "maxX": 539.107,
          "maxZ": -36.96,
          "minX": 532.893,
          "minZ": -43.04,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_12:площадка",
          "maxX": 540.039,
          "maxZ": -20.936,
          "minX": 531.961,
          "minZ": -27.064,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_13:площадка",
          "maxX": 351.281,
          "maxZ": -533.637,
          "minX": 345.189,
          "minZ": -539.305,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_14:площадка",
          "maxX": 371.049,
          "maxZ": -532.742,
          "minX": 363.068,
          "minZ": -540.199,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_15:площадка",
          "maxX": 408.088,
          "maxZ": -532.886,
          "minX": 401.323,
          "minZ": -540.055,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_16:площадка",
          "maxX": 430.129,
          "maxZ": -533.506,
          "minX": 416.93,
          "minZ": -539.435,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_17:площадка",
          "maxX": 445.287,
          "maxZ": -533.846,
          "minX": 439.418,
          "minZ": -539.095,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_18:площадка",
          "maxX": 468.088,
          "maxZ": -532.429,
          "minX": 454.265,
          "minZ": -540.512,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_19:площадка",
          "maxX": 485.936,
          "maxZ": -533.728,
          "minX": 474.064,
          "minZ": -539.213,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_20:площадка",
          "maxX": 501.762,
          "maxZ": -532.862,
          "minX": 495.885,
          "minZ": -540.079,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_21:площадка",
          "maxX": 542.563,
          "maxZ": -496.276,
          "minX": 530.378,
          "minZ": -501.371,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_22:площадка",
          "maxX": 539.791,
          "maxZ": -475.941,
          "minX": 533.15,
          "minZ": -484.059,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_23:площадка",
          "maxX": 539.806,
          "maxZ": -437.159,
          "minX": 533.135,
          "minZ": -447.547,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_24:площадка",
          "maxX": 540.645,
          "maxZ": -419.494,
          "minX": 532.296,
          "minZ": -427.564,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_25:площадка",
          "maxX": 540.266,
          "maxZ": -401,
          "minX": 532.675,
          "minZ": -408.412,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_26:площадка",
          "maxX": 540.101,
          "maxZ": -380.907,
          "minX": 532.84,
          "minZ": -390.857,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_27:площадка",
          "maxX": 539.876,
          "maxZ": -363.163,
          "minX": 533.065,
          "minZ": -370.955,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_28:площадка",
          "maxX": 540.77,
          "maxZ": -343.951,
          "minX": 532.172,
          "minZ": -352.519,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_29:площадка",
          "maxX": 539.203,
          "maxZ": -325.462,
          "minX": 533.738,
          "minZ": -333.362,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_30:площадка",
          "maxX": -558.77,
          "maxZ": -531.147,
          "minX": -575.776,
          "minZ": -545.217,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_31:площадка",
          "maxX": -472.857,
          "maxZ": -532.661,
          "minX": -487.143,
          "minZ": -543.703,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_32:площадка",
          "maxX": -444.045,
          "maxZ": -529.951,
          "minX": -457.773,
          "minZ": -546.413,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_33:площадка",
          "maxX": -414.989,
          "maxZ": -530.131,
          "minX": -428.647,
          "minZ": -546.233,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_34:площадка",
          "maxX": -383.913,
          "maxZ": -529.96,
          "minX": -401.542,
          "minZ": -546.403,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_35:площадка",
          "maxX": -356.972,
          "maxZ": -531.483,
          "minX": -370.301,
          "minZ": -544.881,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_36:площадка",
          "maxX": -326.738,
          "maxZ": -531.646,
          "minX": -342.353,
          "minZ": -544.718,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_37:площадка",
          "maxX": -530.652,
          "maxZ": -415.992,
          "minX": -545.712,
          "minZ": -427.644,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_38:площадка",
          "maxX": -299.797,
          "maxZ": -532.654,
          "minX": -311.112,
          "minZ": -543.71,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_39:площадка",
          "maxX": -184.363,
          "maxZ": -529.811,
          "minX": -193.819,
          "minZ": -546.553,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_40:площадка",
          "maxX": -124.657,
          "maxZ": -531.513,
          "minX": -137.161,
          "minZ": -544.851,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_41:площадка",
          "maxX": -95.669,
          "maxZ": -532.042,
          "minX": -107.967,
          "minZ": -544.322,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_42:площадка",
          "maxX": -10.386,
          "maxZ": -531.363,
          "minX": -18.705,
          "minZ": -545,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_43:площадка",
          "maxX": 107.105,
          "maxZ": 544.636,
          "minX": 96.531,
          "minZ": 531.728,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_44:площадка",
          "maxX": 198.649,
          "maxZ": 546.018,
          "minX": 179.533,
          "minZ": 530.346,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_45:площадка",
          "maxX": 229.242,
          "maxZ": 544.871,
          "minX": 207.122,
          "minZ": 531.492,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_46:площадка",
          "maxX": 255.963,
          "maxZ": 543.591,
          "minX": 238.582,
          "minZ": 532.772,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_47:площадка",
          "maxX": 283.819,
          "maxZ": 546.471,
          "minX": 268.908,
          "minZ": 529.892,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_48:площадка",
          "maxX": 313.606,
          "maxZ": 544.327,
          "minX": 297.304,
          "minZ": 532.037,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_49:площадка",
          "maxX": -589.088,
          "maxZ": -530.725,
          "minX": -603.639,
          "minZ": -545.639,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_50:площадка",
          "maxX": -155.068,
          "maxZ": 549.263,
          "minX": -164.932,
          "minZ": 538.737,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_51:площадка",
          "maxX": -194.5,
          "maxZ": 547.38,
          "minX": -210.833,
          "minZ": 540.62,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_52:площадка",
          "maxX": -527.372,
          "maxZ": -354.607,
          "minX": -548.991,
          "minZ": -372.666,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_53:площадка",
          "maxX": -196.547,
          "maxZ": 570.522,
          "minX": -208.786,
          "minZ": 560.144,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_54:площадка",
          "maxX": -155.187,
          "maxZ": 570.362,
          "minX": -164.813,
          "minZ": 560.305,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_55:площадка",
          "maxX": 540.621,
          "maxZ": -532.766,
          "minX": 532.32,
          "minZ": -540.175,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_56:площадка",
          "maxX": 549.755,
          "maxZ": 15.401,
          "minX": 538.245,
          "minZ": 5.932,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_57:площадка",
          "maxX": 552.167,
          "maxZ": 37.476,
          "minX": 535.833,
          "minZ": 26.524,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_58:площадка",
          "maxX": 550.146,
          "maxZ": 57.825,
          "minX": 537.854,
          "minZ": 48.842,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_59:площадка",
          "maxX": 550.882,
          "maxZ": 101.087,
          "minX": 537.118,
          "minZ": 90.913,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_60:площадка",
          "maxX": 549.567,
          "maxZ": 144.096,
          "minX": 538.433,
          "minZ": 133.237,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_61:площадка",
          "maxX": 552.167,
          "maxZ": 165.057,
          "minX": 535.833,
          "minZ": 154.943,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_62:площадка",
          "maxX": 549.976,
          "maxZ": 185.217,
          "minX": 538.024,
          "minZ": 177.45,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_63:площадка",
          "maxX": 549.182,
          "maxZ": 207.652,
          "minX": 538.818,
          "minZ": 197.682,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_64:площадка",
          "maxX": 551.56,
          "maxZ": 228.295,
          "minX": 536.44,
          "minZ": 219.705,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_65:площадка",
          "maxX": 552.042,
          "maxZ": 249.291,
          "minX": 535.958,
          "minZ": 241.376,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_66:площадка",
          "maxX": 548.706,
          "maxZ": 292.299,
          "minX": 539.294,
          "minZ": 283.701,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_67:площадка",
          "maxX": 551.078,
          "maxZ": 312.724,
          "minX": 536.922,
          "minZ": 305.943,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_68:площадка",
          "maxX": -559.607,
          "maxZ": -474.879,
          "minX": -574.939,
          "minZ": -485.121,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_69:площадка",
          "maxX": -559.391,
          "maxZ": -412.409,
          "minX": -575.155,
          "minZ": -431.227,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_70:площадка",
          "maxX": -590.586,
          "maxZ": -416.177,
          "minX": -602.141,
          "minZ": -427.459,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_71:площадка",
          "maxX": -173.674,
          "maxZ": 590.864,
          "minX": -188.993,
          "minZ": 582.469,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_72:площадка",
          "maxX": 554.083,
          "maxZ": 339.132,
          "minX": 539.25,
          "minZ": 327.535,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_73:площадка",
          "maxX": 554.327,
          "maxZ": 366.993,
          "minX": 539.007,
          "minZ": 353.007,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_74:площадка",
          "maxX": 554.218,
          "maxZ": 392.622,
          "minX": 539.115,
          "minZ": 380.711,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_75:площадка",
          "maxX": 552.171,
          "maxZ": 420.205,
          "minX": 541.162,
          "minZ": 406.461,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_76:площадка",
          "maxX": 556.054,
          "maxZ": 449.186,
          "minX": 537.279,
          "minZ": 430.814,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_77:площадка",
          "maxX": 557.254,
          "maxZ": 474.021,
          "minX": 536.08,
          "minZ": 459.312,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_78:площадка",
          "maxX": 553.9,
          "maxZ": 498.906,
          "minX": 539.433,
          "minZ": 487.76,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_79:площадка",
          "maxX": 367.599,
          "maxZ": 554.012,
          "minX": 352.401,
          "minZ": 539.321,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_80:площадка",
          "maxX": 394.591,
          "maxZ": 554.781,
          "minX": 378.743,
          "minZ": 538.552,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_81:площадка",
          "maxX": 423.725,
          "maxZ": 553.171,
          "minX": 402.942,
          "minZ": 540.163,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_82:площадка",
          "maxX": 449.588,
          "maxZ": 552.988,
          "minX": 430.412,
          "minZ": 540.345,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_83:площадка",
          "maxX": -530.251,
          "maxZ": -474.024,
          "minX": -546.113,
          "minZ": -485.976,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_84:площадка",
          "maxX": 555.372,
          "maxZ": -308.219,
          "minX": 548.628,
          "minZ": -315.781,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_85:площадка",
          "maxX": 554.5,
          "maxZ": -278,
          "minX": 549.5,
          "minZ": -282,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_86:площадка",
          "maxX": 555.254,
          "maxZ": -245.396,
          "minX": 548.746,
          "minZ": -250.604,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_87:площадка",
          "maxX": 554.574,
          "maxZ": -229.547,
          "minX": 549.426,
          "minZ": -234.453,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_88:площадка",
          "maxX": 555.95,
          "maxZ": -212.927,
          "minX": 548.05,
          "minZ": -219.073,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_89:площадка",
          "maxX": 554.175,
          "maxZ": -196.93,
          "minX": 549.825,
          "minZ": -203.07,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_90:площадка",
          "maxX": 554.634,
          "maxZ": -164.729,
          "minX": 549.366,
          "minZ": -171.271,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_91:площадка",
          "maxX": 554.749,
          "maxZ": -150,
          "minX": 549.251,
          "minZ": -154,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_92:площадка",
          "maxX": 555.453,
          "maxZ": -133.309,
          "minX": 548.547,
          "minZ": -138.691,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_93:площадка",
          "maxX": 554.396,
          "maxZ": -117.341,
          "minX": 549.604,
          "minZ": -122.659,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_94:площадка",
          "maxX": 554.916,
          "maxZ": -84.962,
          "minX": 549.084,
          "minZ": -91.038,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_95:площадка",
          "maxX": 555.302,
          "maxZ": -53.36,
          "minX": 548.698,
          "minZ": -58.64,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_96:площадка",
          "maxX": 555.041,
          "maxZ": -37.272,
          "minX": 548.959,
          "minZ": -42.728,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_97:площадка",
          "maxX": 554.25,
          "maxZ": -21.686,
          "minX": 549.75,
          "minZ": -26.314,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_98:площадка",
          "maxX": 554.409,
          "maxZ": -5.027,
          "minX": 549.591,
          "minZ": -10.973,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_99:площадка",
          "maxX": -620.154,
          "maxZ": -502.784,
          "minX": -630.755,
          "minZ": -515.397,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_100:площадка",
          "maxX": -616.586,
          "maxZ": -470.338,
          "minX": -634.323,
          "minZ": -489.662,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_101:площадка",
          "maxX": -616.845,
          "maxZ": -443.091,
          "minX": -634.064,
          "minZ": -458.727,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_102:площадка",
          "maxX": -194.958,
          "maxZ": 589.871,
          "minX": -210.375,
          "minZ": 583.462,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_103:площадка",
          "maxX": -155.848,
          "maxZ": 591.558,
          "minX": -164.152,
          "minZ": 581.775,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_104:площадка",
          "maxX": 352.612,
          "maxZ": -550.043,
          "minX": 343.859,
          "minZ": -560.545,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_105:площадка",
          "maxX": 388.779,
          "maxZ": -550.43,
          "minX": 382.985,
          "minZ": -560.158,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_106:площадка",
          "maxX": 427.733,
          "maxZ": -550.765,
          "minX": 419.326,
          "minZ": -559.823,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_107:площадка",
          "maxX": 465.437,
          "maxZ": -551.032,
          "minX": 456.916,
          "minZ": -559.556,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_108:площадка",
          "maxX": 521.406,
          "maxZ": -550.838,
          "minX": 513.888,
          "minZ": -559.75,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_109:площадка",
          "maxX": 558.72,
          "maxZ": -456.422,
          "minX": 551.868,
          "minZ": -465.931,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_110:площадка",
          "maxX": 557.884,
          "maxZ": -382.063,
          "minX": 552.704,
          "minZ": -389.702,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_111:площадка",
          "maxX": 560.066,
          "maxZ": -363.219,
          "minX": 550.522,
          "minZ": -370.899,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_112:площадка",
          "maxX": 559.94,
          "maxZ": -344.149,
          "minX": 550.648,
          "minZ": -352.322,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_113:площадка",
          "maxX": 558.362,
          "maxZ": -325.884,
          "minX": 552.226,
          "minZ": -332.94,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_114:площадка",
          "maxX": 49.857,
          "maxZ": 544.349,
          "minX": 37.416,
          "minZ": 532.015,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_115:площадка",
          "maxX": 556.879,
          "maxZ": 551.131,
          "minX": 536.454,
          "minZ": 542.202,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_116:площадка",
          "maxX": -618.555,
          "maxZ": -529.631,
          "minX": -632.354,
          "minZ": -546.733,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_117:площадка",
          "maxX": -618.473,
          "maxZ": -414.944,
          "minX": -632.436,
          "minZ": -428.692,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_118:площадка",
          "maxX": -133.291,
          "maxZ": 548.3,
          "minX": -144.043,
          "minZ": 539.7,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_119:площадка",
          "maxX": -218.23,
          "maxZ": 548.398,
          "minX": -229.77,
          "minZ": 539.602,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_120:площадка",
          "maxX": -215.833,
          "maxZ": 569.946,
          "minX": -232.167,
          "minZ": 560.721,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_121:площадка",
          "maxX": -131.814,
          "maxZ": 569.532,
          "minX": -145.519,
          "minZ": 561.135,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_122:площадка",
          "maxX": -531.294,
          "maxZ": -326.623,
          "minX": -545.07,
          "minZ": -342.467,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_123:площадка",
          "maxX": 572.112,
          "maxZ": 15.675,
          "minX": 558.555,
          "minZ": 5.658,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_124:площадка",
          "maxX": 569.754,
          "maxZ": 56.525,
          "minX": 560.913,
          "minZ": 50.142,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_125:площадка",
          "maxX": 570.516,
          "maxZ": 79.447,
          "minX": 560.151,
          "minZ": 69.886,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_126:площадка",
          "maxX": 573.5,
          "maxZ": 101.718,
          "minX": 557.167,
          "minZ": 90.282,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_127:площадка",
          "maxX": 571.196,
          "maxZ": 121.626,
          "minX": 559.471,
          "minZ": 113.041,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_128:площадка",
          "maxX": 573.5,
          "maxZ": 144.085,
          "minX": 557.167,
          "minZ": 133.248,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_129:площадка",
          "maxX": 572.261,
          "maxZ": 228.765,
          "minX": 558.406,
          "minZ": 219.235,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_130:площадка",
          "maxX": 573.5,
          "maxZ": 250.275,
          "minX": 557.167,
          "minZ": 240.391,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_131:площадка",
          "maxX": 569.215,
          "maxZ": 270.994,
          "minX": 561.451,
          "minZ": 262.339,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_132:площадка",
          "maxX": 572.76,
          "maxZ": 292.222,
          "minX": 557.907,
          "minZ": 283.778,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_133:площадка",
          "maxX": 570.512,
          "maxZ": 313.242,
          "minX": 560.155,
          "minZ": 305.425,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_134:площадка",
          "maxX": -559.682,
          "maxZ": -560.967,
          "minX": -574.864,
          "minZ": -573.579,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_135:площадка",
          "maxX": -528.77,
          "maxZ": -558.694,
          "minX": -547.594,
          "minZ": -575.852,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_136:площадка",
          "maxX": -474.109,
          "maxZ": -558.94,
          "minX": -485.891,
          "minZ": -575.605,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_137:площадка",
          "maxX": -441.192,
          "maxZ": -559.979,
          "minX": -460.627,
          "minZ": -574.566,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_138:площадка",
          "maxX": -383.055,
          "maxZ": -560.373,
          "minX": -402.4,
          "minZ": -574.172,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_139:площадка",
          "maxX": -355.693,
          "maxZ": -560.442,
          "minX": -371.58,
          "minZ": -574.104,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_140:площадка",
          "maxX": -326.188,
          "maxZ": -560.676,
          "minX": -342.903,
          "minZ": -573.869,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_141:площадка",
          "maxX": -562.012,
          "maxZ": -386.681,
          "minX": -572.533,
          "minZ": -398.774,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_142:площадка",
          "maxX": -298.426,
          "maxZ": -561.158,
          "minX": -312.483,
          "minZ": -573.387,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_143:площадка",
          "maxX": -271.529,
          "maxZ": -560.32,
          "minX": -281.198,
          "minZ": -574.226,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_144:площадка",
          "maxX": -239.776,
          "maxZ": -561.631,
          "minX": -254.769,
          "minZ": -572.914,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_145:площадка",
          "maxX": -120.695,
          "maxZ": -562.048,
          "minX": -141.123,
          "minZ": -572.498,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_146:площадка",
          "maxX": -9.105,
          "maxZ": -557.547,
          "minX": -19.986,
          "minZ": -576.998,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_147:площадка",
          "maxX": 107.975,
          "maxZ": 573.11,
          "minX": 95.661,
          "minZ": 561.435,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_148:площадка",
          "maxX": 165.294,
          "maxZ": 573.661,
          "minX": 154.706,
          "minZ": 560.884,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_149:площадка",
          "maxX": 196.234,
          "maxZ": 574.345,
          "minX": 181.948,
          "minZ": 560.2,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_150:площадка",
          "maxX": 224.97,
          "maxZ": 573.168,
          "minX": 211.393,
          "minZ": 561.377,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_151:площадка",
          "maxX": 254.201,
          "maxZ": 573.334,
          "minX": 240.344,
          "minZ": 561.212,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_152:площадка",
          "maxX": 285.813,
          "maxZ": 574.243,
          "minX": 266.914,
          "minZ": 560.302,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_153:площадка",
          "maxX": 310.32,
          "maxZ": 572.919,
          "minX": 300.589,
          "minZ": 561.627,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_154:площадка",
          "maxX": -588.792,
          "maxZ": -560.41,
          "minX": -603.935,
          "minZ": -574.136,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_155:площадка",
          "maxX": 570.589,
          "maxZ": -292.355,
          "minX": 565.411,
          "minZ": -299.645,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_156:площадка",
          "maxX": 571.283,
          "maxZ": -277.063,
          "minX": 564.717,
          "minZ": -282.937,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_157:площадка",
          "maxX": 570.569,
          "maxZ": -213.691,
          "minX": 565.431,
          "minZ": -218.309,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_158:площадка",
          "maxX": 570.291,
          "maxZ": -180.891,
          "minX": 565.709,
          "minZ": -187.109,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_159:площадка",
          "maxX": 570.326,
          "maxZ": -148.962,
          "minX": 565.674,
          "minZ": -155.038,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_160:площадка",
          "maxX": 570.045,
          "maxZ": -101.637,
          "minX": 565.955,
          "minZ": -106.363,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_161:площадка",
          "maxX": 570,
          "maxZ": -85.951,
          "minX": 566,
          "minZ": -90.049,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_162:площадка",
          "maxX": 570.864,
          "maxZ": -5.462,
          "minX": 565.136,
          "minZ": -10.538,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_163:площадка",
          "maxX": -176.632,
          "maxZ": 612.13,
          "minX": -186.034,
          "minZ": 603.87,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_164:площадка",
          "maxX": -557.408,
          "maxZ": -356.176,
          "minX": -577.138,
          "minZ": -371.097,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_165:площадка",
          "maxX": 558.554,
          "maxZ": -552.067,
          "minX": 552.034,
          "minZ": -558.521,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_166:площадка",
          "maxX": -133.442,
          "maxZ": 592.417,
          "minX": -143.892,
          "minZ": 580.916,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_167:площадка",
          "maxX": -216.794,
          "maxZ": 590.7,
          "minX": -231.206,
          "minZ": 582.634,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_168:площадка",
          "maxX": 79.992,
          "maxZ": -561.845,
          "minX": 57.151,
          "minZ": -581.012,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_169:площадка",
          "maxX": -151.833,
          "maxZ": 612.575,
          "minX": -168.167,
          "minZ": 603.425,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_170:площадка",
          "maxX": 582.038,
          "maxZ": 340.1,
          "minX": 564.628,
          "minZ": 326.566,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_171:площадка",
          "maxX": 580.704,
          "maxZ": 365.07,
          "minX": 565.963,
          "minZ": 354.93,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_172:площадка",
          "maxX": 582.469,
          "maxZ": 393.613,
          "minX": 564.198,
          "minZ": 379.72,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_173:площадка",
          "maxX": 582.282,
          "maxZ": 448.013,
          "minX": 564.385,
          "minZ": 431.987,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_174:площадка",
          "maxX": 580.853,
          "maxZ": 471.904,
          "minX": 565.814,
          "minZ": 461.429,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_175:площадка",
          "maxX": 582.144,
          "maxZ": 525.545,
          "minX": 564.522,
          "minZ": 514.455,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_176:площадка",
          "maxX": 340.804,
          "maxZ": 580.564,
          "minX": 325.862,
          "minZ": 566.102,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_177:площадка",
          "maxX": 369.661,
          "maxZ": 578.576,
          "minX": 350.339,
          "minZ": 568.091,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_178:площадка",
          "maxX": 421.962,
          "maxZ": 580.745,
          "minX": 404.705,
          "minZ": 565.922,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_179:площадка",
          "maxX": 449.437,
          "maxZ": 579.256,
          "minX": 430.563,
          "minZ": 567.411,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_180:площадка",
          "maxX": 473.356,
          "maxZ": 578.434,
          "minX": 459.977,
          "minZ": 568.233,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_181:площадка",
          "maxX": 500.42,
          "maxZ": 578.042,
          "minX": 486.247,
          "minZ": 568.625,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_182:площадка",
          "maxX": 528.018,
          "maxZ": 579.111,
          "minX": 511.982,
          "minZ": 567.555,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_183:площадка",
          "maxX": 333.399,
          "maxZ": -570.31,
          "minX": 325.424,
          "minZ": -577.925,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_184:площадка",
          "maxX": 350.612,
          "maxZ": -570.036,
          "minX": 345.858,
          "minZ": -578.199,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_185:площадка",
          "maxX": 371.088,
          "maxZ": -570.675,
          "minX": 363.03,
          "minZ": -577.561,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_186:площадка",
          "maxX": 428.061,
          "maxZ": -570.395,
          "minX": 418.997,
          "minZ": -577.84,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_187:площадка",
          "maxX": 577.912,
          "maxZ": -514.657,
          "minX": 570.323,
          "minZ": -520.637,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_188:площадка",
          "maxX": 579.484,
          "maxZ": -476.572,
          "minX": 568.751,
          "minZ": -483.428,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_189:площадка",
          "maxX": 578.609,
          "maxZ": -380.521,
          "minX": 569.627,
          "minZ": -391.244,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_190:площадка",
          "maxX": -237.918,
          "maxZ": 548.684,
          "minX": -252.748,
          "minZ": 539.316,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_191:площадка",
          "maxX": 51.6,
          "maxZ": 575.496,
          "minX": 35.673,
          "minZ": 559.049,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_192:площадка",
          "maxX": 581.281,
          "maxZ": 553.474,
          "minX": 565.385,
          "minZ": 539.859,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_193:площадка",
          "maxX": 553.187,
          "maxZ": 578.371,
          "minX": 540.146,
          "minZ": 568.296,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_194:площадка",
          "maxX": -261.241,
          "maxZ": 548.006,
          "minX": -272.093,
          "minZ": 539.994,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_195:площадка",
          "maxX": -560.002,
          "maxZ": -327.725,
          "minX": -574.544,
          "minZ": -341.366,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_196:площадка",
          "maxX": 22.969,
          "maxZ": 545.737,
          "minX": 6.122,
          "minZ": 530.626,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_197:площадка",
          "maxX": 587.142,
          "maxZ": -277.287,
          "minX": 580.858,
          "minZ": -282.713,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_198:площадка",
          "maxX": 587.113,
          "maxZ": -261.483,
          "minX": 580.887,
          "minZ": -266.517,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_199:площадка",
          "maxX": 586.256,
          "maxZ": -197.263,
          "minX": 581.744,
          "minZ": -202.737,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_200:площадка",
          "maxX": 586.679,
          "maxZ": -180.852,
          "minX": 581.321,
          "minZ": -187.148,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_201:площадка",
          "maxX": 587.29,
          "maxZ": -149.519,
          "minX": 580.71,
          "minZ": -154.481,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_202:площадка",
          "maxX": 587.621,
          "maxZ": -85.473,
          "minX": 580.379,
          "minZ": -90.527,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_203:площадка",
          "maxX": 587.321,
          "maxZ": -3.977,
          "minX": 580.679,
          "minZ": -12.023,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_204:площадка",
          "maxX": -111.357,
          "maxZ": 548.633,
          "minX": -123.309,
          "minZ": 539.367,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_205:площадка",
          "maxX": -109.833,
          "maxZ": 569.248,
          "minX": -124.833,
          "minZ": 561.418,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_206:площадка",
          "maxX": -215.833,
          "maxZ": 613.514,
          "minX": -232.167,
          "minZ": 602.486,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_207:площадка",
          "maxX": -130.916,
          "maxZ": 612.288,
          "minX": -146.417,
          "minZ": 603.712,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_208:площадка",
          "maxX": -241.568,
          "maxZ": 570.036,
          "minX": -249.098,
          "minZ": 560.63,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_209:площадка",
          "maxX": 594.175,
          "maxZ": 37.08,
          "minX": 579.159,
          "minZ": 26.92,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_210:площадка",
          "maxX": 591.742,
          "maxZ": 207.918,
          "minX": 581.592,
          "minZ": 197.415,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_211:площадка",
          "maxX": 594.412,
          "maxZ": 249.624,
          "minX": 578.921,
          "minZ": 241.043,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_212:площадка",
          "maxX": 594.833,
          "maxZ": 314.291,
          "minX": 578.5,
          "minZ": 304.376,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_213:площадка",
          "maxX": -111.181,
          "maxZ": 591.423,
          "minX": -123.486,
          "minZ": 581.911,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_214:площадка",
          "maxX": -174.801,
          "maxZ": 634.606,
          "minX": -187.866,
          "minZ": 624.06,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_215:площадка",
          "maxX": -240.554,
          "maxZ": 590.247,
          "minX": -250.113,
          "minZ": 583.086,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_216:площадка",
          "maxX": -194.597,
          "maxZ": 632.869,
          "minX": -210.736,
          "minZ": 625.798,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_217:площадка",
          "maxX": 354.319,
          "maxZ": -588.715,
          "minX": 342.152,
          "minZ": -597.167,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_218:площадка",
          "maxX": 486.912,
          "maxZ": -589.535,
          "minX": 473.088,
          "minZ": -596.347,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_219:площадка",
          "maxX": 597.391,
          "maxZ": -494.483,
          "minX": 588.492,
          "minZ": -503.164,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_220:площадка",
          "maxX": 597.237,
          "maxZ": -419.502,
          "minX": 588.645,
          "minZ": -427.556,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_221:площадка",
          "maxX": 598.792,
          "maxZ": -382.777,
          "minX": 587.09,
          "minZ": -388.988,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_222:площадка",
          "maxX": 595.87,
          "maxZ": -344,
          "minX": 590.013,
          "minZ": -352.471,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_223:площадка",
          "maxX": 597.094,
          "maxZ": -324.481,
          "minX": 588.788,
          "minZ": -334.343,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_224:площадка",
          "maxX": 599.406,
          "maxZ": -532.417,
          "minX": 586.476,
          "minZ": -540.525,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_225:площадка",
          "maxX": 580.571,
          "maxZ": 580.938,
          "minX": 566.095,
          "minZ": 565.729,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_226:площадка",
          "maxX": -559.392,
          "maxZ": -588.604,
          "minX": -575.154,
          "minZ": -604.124,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_227:площадка",
          "maxX": -469.054,
          "maxZ": -589.32,
          "minX": -490.946,
          "minZ": -603.407,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_228:площадка",
          "maxX": -445.226,
          "maxZ": -590.142,
          "minX": -456.592,
          "minZ": -602.586,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_229:площадка",
          "maxX": -413.229,
          "maxZ": -588.63,
          "minX": -430.407,
          "minZ": -604.097,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_230:площадка",
          "maxX": -382.797,
          "maxZ": -589.46,
          "minX": -402.658,
          "minZ": -603.268,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_231:площадка",
          "maxX": -358.431,
          "maxZ": -590.386,
          "minX": -368.842,
          "minZ": -602.341,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_232:площадка",
          "maxX": -325.366,
          "maxZ": -588.148,
          "minX": -343.725,
          "minZ": -604.58,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_233:площадка",
          "maxX": -124.024,
          "maxZ": -589.38,
          "minX": -137.794,
          "minZ": -603.347,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_234:площадка",
          "maxX": -95.995,
          "maxZ": -589.531,
          "minX": -107.642,
          "minZ": -603.196,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_235:площадка",
          "maxX": -67.529,
          "maxZ": -590.802,
          "minX": -77.925,
          "minZ": -601.925,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_236:площадка",
          "maxX": 137.589,
          "maxZ": 602.153,
          "minX": 124.229,
          "minZ": 590.574,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_237:площадка",
          "maxX": 194.105,
          "maxZ": 601.005,
          "minX": 184.077,
          "minZ": 591.722,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_238:площадка",
          "maxX": -587.894,
          "maxZ": -589.647,
          "minX": -604.834,
          "minZ": -603.08,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_239:площадка",
          "maxX": 602.944,
          "maxZ": -197.463,
          "minX": 597.056,
          "minZ": -202.537,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_240:площадка",
          "maxX": -238.253,
          "maxZ": 611.893,
          "minX": -252.414,
          "minZ": 604.107,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_241:площадка",
          "maxX": 606.893,
          "maxZ": 339.154,
          "minX": 593.107,
          "minZ": 327.512,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_242:площадка",
          "maxX": 610.091,
          "maxZ": 364.585,
          "minX": 589.909,
          "minZ": 355.415,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_243:площадка",
          "maxX": 606.515,
          "maxZ": 391.305,
          "minX": 593.485,
          "minZ": 382.028,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_244:площадка",
          "maxX": 610.083,
          "maxZ": 421.336,
          "minX": 589.917,
          "minZ": 405.33,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_245:площадка",
          "maxX": 605.997,
          "maxZ": 498.667,
          "minX": 594.003,
          "minZ": 487.999,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_246:площадка",
          "maxX": 609.822,
          "maxZ": 524.71,
          "minX": 590.178,
          "minZ": 515.29,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_247:площадка",
          "maxX": 340.691,
          "maxZ": 607.888,
          "minX": 325.976,
          "minZ": 592.112,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_248:площадка",
          "maxX": 420.794,
          "maxZ": 607.176,
          "minX": 405.873,
          "minZ": 592.824,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_249:площадка",
          "maxX": 446.633,
          "maxZ": 607.545,
          "minX": 433.367,
          "minZ": 592.455,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_250:площадка",
          "maxX": 474.835,
          "maxZ": 607.619,
          "minX": 458.499,
          "minZ": 592.381,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_251:площадка",
          "maxX": -262.122,
          "maxZ": 569.897,
          "minX": -271.211,
          "minZ": 560.77,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_252:площадка",
          "maxX": -215.833,
          "maxZ": 635.034,
          "minX": -232.167,
          "minZ": 623.633,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_253:площадка",
          "maxX": -615.942,
          "maxZ": -589.41,
          "minX": -634.967,
          "minZ": -603.318,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_254:площадка",
          "maxX": 607.285,
          "maxZ": 554.675,
          "minX": 592.715,
          "minZ": 538.658,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_255:площадка",
          "maxX": 553.455,
          "maxZ": 605.933,
          "minX": 539.878,
          "minZ": 594.067,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_256:площадка",
          "maxX": 611.835,
          "maxZ": 14.611,
          "minX": 604.165,
          "minZ": 6.723,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_257:площадка",
          "maxX": 611.583,
          "maxZ": 35.923,
          "minX": 604.417,
          "minZ": 28.077,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_258:площадка",
          "maxX": 616.049,
          "maxZ": 100.061,
          "minX": 599.951,
          "minZ": 91.939,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_259:площадка",
          "maxX": 612.456,
          "maxZ": 314.043,
          "minX": 603.544,
          "minZ": 304.624,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_260:площадка",
          "maxX": 333.237,
          "maxZ": -608.17,
          "minX": 325.587,
          "minZ": -615.36,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_261:площадка",
          "maxX": 370.527,
          "maxZ": -608.845,
          "minX": 363.591,
          "minZ": -614.684,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_262:площадка",
          "maxX": 483.067,
          "maxZ": -608.098,
          "minX": 476.933,
          "minZ": -615.431,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_263:площадка",
          "maxX": 616.096,
          "maxZ": -493.16,
          "minX": 607.433,
          "minZ": -504.487,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_264:площадка",
          "maxX": 615.947,
          "maxZ": -382.439,
          "minX": 607.583,
          "minZ": -389.325,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_265:площадка",
          "maxX": -240.767,
          "maxZ": 633.513,
          "minX": -249.9,
          "minZ": 625.154,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_266:площадка",
          "maxX": 618,
          "maxZ": -293.992,
          "minX": 614,
          "minZ": -298.008,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_267:площадка",
          "maxX": 619.3,
          "maxZ": -277.363,
          "minX": 612.7,
          "minZ": -282.637,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_268:площадка",
          "maxX": 618.735,
          "maxZ": -229.931,
          "minX": 613.265,
          "minZ": -234.069,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_269:площадка",
          "maxX": 618.9,
          "maxZ": -165.135,
          "minX": 613.1,
          "minZ": -170.865,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_270:площадка",
          "maxX": 619.642,
          "maxZ": -101.565,
          "minX": 612.358,
          "minZ": -106.435,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_271:площадка",
          "maxX": 619.058,
          "maxZ": -85.593,
          "minX": 612.942,
          "minZ": -90.407,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_272:площадка",
          "maxX": -569.32,
          "maxZ": -288.173,
          "minX": -590.68,
          "minZ": -311.827,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_273:площадка",
          "maxX": 34.683,
          "maxZ": -607.44,
          "minX": 11.031,
          "minZ": -626.846,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_274:площадка",
          "maxX": 261.229,
          "maxZ": -608.851,
          "minX": 241.628,
          "minZ": -625.435,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_275:площадка",
          "maxX": 23.2,
          "maxZ": 603.816,
          "minX": 5.89,
          "minZ": 588.911,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_276:площадка",
          "maxX": -560.456,
          "maxZ": -619.574,
          "minX": -574.089,
          "minZ": -631.335,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_277:площадка",
          "maxX": -532.082,
          "maxZ": -617.844,
          "minX": -544.282,
          "minZ": -633.065,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_278:площадка",
          "maxX": -501.398,
          "maxZ": -619.478,
          "minX": -516.783,
          "minZ": -631.431,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_279:площадка",
          "maxX": -324.552,
          "maxZ": -618.285,
          "minX": -344.539,
          "minZ": -632.624,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_280:площадка",
          "maxX": -241.57,
          "maxZ": -619.649,
          "minX": -252.975,
          "minZ": -631.26,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_281:площадка",
          "maxX": -212.625,
          "maxZ": -620.777,
          "minX": -223.738,
          "minZ": -630.132,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_282:площадка",
          "maxX": -183.848,
          "maxZ": -619.499,
          "minX": -194.334,
          "minZ": -631.41,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_283:площадка",
          "maxX": -152.893,
          "maxZ": -620.328,
          "minX": -167.107,
          "minZ": -630.581,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_284:площадка",
          "maxX": -96.489,
          "maxZ": -618.989,
          "minX": -107.147,
          "minZ": -631.92,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_285:площадка",
          "maxX": -38.52,
          "maxZ": -618.401,
          "minX": -48.753,
          "minZ": -632.508,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_286:площадка",
          "maxX": 110.558,
          "maxZ": 633.203,
          "minX": 93.078,
          "minZ": 617.706,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_287:площадка",
          "maxX": 137.502,
          "maxZ": 633.092,
          "minX": 124.316,
          "minZ": 617.817,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_288:площадка",
          "maxX": 194.192,
          "maxZ": 630.622,
          "minX": 183.99,
          "minZ": 620.287,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_289:площадка",
          "maxX": 225.319,
          "maxZ": 631.746,
          "minX": 211.045,
          "minZ": 619.163,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_290:площадка",
          "maxX": 254.353,
          "maxZ": 632.486,
          "minX": 240.193,
          "minZ": 618.423,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_291:площадка",
          "maxX": 283.18,
          "maxZ": 630.841,
          "minX": 269.547,
          "minZ": 620.068,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_292:площадка",
          "maxX": 636.858,
          "maxZ": 366.94,
          "minX": 616.476,
          "minZ": 353.06,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_293:площадка",
          "maxX": 635.706,
          "maxZ": 390.668,
          "minX": 617.627,
          "minZ": 382.666,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_294:площадка",
          "maxX": 633.47,
          "maxZ": 498.014,
          "minX": 619.863,
          "minZ": 488.653,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_295:площадка",
          "maxX": 367.636,
          "maxZ": 633.236,
          "minX": 352.364,
          "minZ": 620.097,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_296:площадка",
          "maxX": 501.428,
          "maxZ": 631.712,
          "minX": 485.238,
          "minZ": 621.621,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_297:площадка",
          "maxX": -5.531,
          "maxZ": 590.65,
          "minX": -15.803,
          "minZ": 582.684,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_298:площадка",
          "maxX": 633.943,
          "maxZ": 58.735,
          "minX": 624.724,
          "minZ": 47.932,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_299:площадка",
          "maxX": 634.233,
          "maxZ": 100.03,
          "minX": 624.433,
          "minZ": 91.97,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_300:площадка",
          "maxX": 637.5,
          "maxZ": 121.731,
          "minX": 621.167,
          "minZ": 112.936,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_301:площадка",
          "maxX": -261.341,
          "maxZ": 633.398,
          "minX": -271.992,
          "minZ": 625.269,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_302:площадка",
          "maxX": 48.694,
          "maxZ": 630.301,
          "minX": 38.579,
          "minZ": 620.608,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_303:площадка",
          "maxX": 334.431,
          "maxZ": -627.079,
          "minX": 324.392,
          "minZ": -634.097,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_304:площадка",
          "maxX": 370.771,
          "maxZ": -626.913,
          "minX": 363.346,
          "minZ": -634.264,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_305:площадка",
          "maxX": 501.787,
          "maxZ": -627.385,
          "minX": 495.86,
          "minZ": -633.792,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_306:площадка",
          "maxX": 524.559,
          "maxZ": -626.63,
          "minX": 510.735,
          "minZ": -634.546,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_307:площадка",
          "maxX": 637.5,
          "maxZ": -438.186,
          "minX": 623.676,
          "minZ": -446.52,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_308:площадка",
          "maxX": 634.205,
          "maxZ": -344.363,
          "minX": 626.971,
          "minZ": -352.108,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_309:площадка",
          "maxX": -618.599,
          "maxZ": -619.152,
          "minX": -632.31,
          "minZ": -631.758,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_310:площадка",
          "maxX": 634.603,
          "maxZ": -293.985,
          "minX": 629.397,
          "minZ": -298.015,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_311:площадка",
          "maxX": 634,
          "maxZ": -277.9,
          "minX": 630,
          "minZ": -282.1,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_312:площадка",
          "maxX": 635.443,
          "maxZ": -260.687,
          "minX": 628.557,
          "minZ": -267.313,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_313:площадка",
          "maxX": 634,
          "maxZ": -245.454,
          "minX": 630,
          "minZ": -250.546,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_314:площадка",
          "maxX": 635.104,
          "maxZ": -133.77,
          "minX": 628.896,
          "minZ": -138.23,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_315:площадка",
          "maxX": 634.213,
          "maxZ": -69.106,
          "minX": 629.787,
          "minZ": -74.894,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_316:площадка",
          "maxX": 635.117,
          "maxZ": -53.584,
          "minX": 628.883,
          "minZ": -58.416,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_317:площадка",
          "maxX": -617.617,
          "maxZ": -327.066,
          "minX": -633.293,
          "minZ": -342.025,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_318:площадка",
          "maxX": 633.777,
          "maxZ": -552.436,
          "minX": 627.4,
          "minZ": -558.152,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_319:площадка",
          "maxX": -69.157,
          "maxZ": 612.099,
          "minX": -80.176,
          "minZ": 603.901,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_320:площадка",
          "maxX": 596.718,
          "maxZ": -608.199,
          "minX": 589.164,
          "minZ": -615.33,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_321:площадка",
          "maxX": 616.827,
          "maxZ": -588.09,
          "minX": 606.702,
          "minZ": -597.793,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_322:площадка",
          "maxX": -302.202,
          "maxZ": 591.028,
          "minX": -316.464,
          "minZ": 582.305,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_323:площадка",
          "maxX": -527.566,
          "maxZ": -248.552,
          "minX": -552.434,
          "minZ": -271.448,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_324:площадка",
          "maxX": 634.512,
          "maxZ": 578.43,
          "minX": 618.821,
          "minZ": 568.237,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_325:площадка",
          "maxX": 579.658,
          "maxZ": 632.116,
          "minX": 567.009,
          "minZ": 621.217,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_326:площадка",
          "maxX": 23.144,
          "maxZ": 632.43,
          "minX": 5.947,
          "minZ": 618.479,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_327:площадка",
          "maxX": -603.247,
          "maxZ": -287.554,
          "minX": -636.753,
          "minZ": -312.446,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_328:площадка",
          "maxX": -48.433,
          "maxZ": 548.284,
          "minX": -58.234,
          "minZ": 539.716,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_329:площадка",
          "maxX": -329.613,
          "maxZ": 587.29,
          "minX": -356.101,
          "minZ": 555.567,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_330:площадка",
          "maxX": 616.066,
          "maxZ": -607.76,
          "minX": 607.463,
          "minZ": -615.77,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_331:площадка",
          "maxX": 634.247,
          "maxZ": 634.023,
          "minX": 619.086,
          "minZ": 619.311,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_332:площадка",
          "maxX": 634.866,
          "maxZ": -626.748,
          "minX": 626.311,
          "minZ": -634.428,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_333:площадка",
          "maxX": -466.006,
          "maxZ": 582.601,
          "minX": -493.994,
          "minZ": 560.256,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_334:площадка",
          "maxX": -553.131,
          "maxZ": 448.254,
          "minX": -589.726,
          "minZ": 420.317,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_335:площадка",
          "maxX": -560.628,
          "maxZ": 399.592,
          "minX": -582.23,
          "minZ": 377.551,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_336:площадка",
          "maxX": 538.478,
          "maxZ": -310,
          "minX": 533.522,
          "minZ": -314,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_337:площадка",
          "maxX": 538.293,
          "maxZ": -277.975,
          "minX": 533.707,
          "minZ": -282.025,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_338:площадка",
          "maxX": 521.007,
          "maxZ": -532.687,
          "minX": 514.287,
          "minZ": -540.254,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_339:площадка",
          "maxX": -271.838,
          "maxZ": -532.94,
          "minX": -280.89,
          "minZ": -543.424,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_340:площадка",
          "maxX": -155.119,
          "maxZ": -533.651,
          "minX": -164.881,
          "minZ": -542.712,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_341:площадка",
          "maxX": -38.821,
          "maxZ": -532.937,
          "minX": -48.452,
          "minZ": -543.427,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_342:площадка",
          "maxX": 135.891,
          "maxZ": 543.092,
          "minX": 125.927,
          "minZ": 533.272,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_343:площадка",
          "maxX": 166.817,
          "maxZ": 544.049,
          "minX": 153.183,
          "minZ": 532.314,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_344:площадка",
          "maxX": 79.068,
          "maxZ": 546.081,
          "minX": 66.386,
          "minZ": 530.283,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_345:площадка",
          "maxX": 344.167,
          "maxZ": 552.84,
          "minX": 322.5,
          "minZ": 540.494,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_346:площадка",
          "maxX": 501.679,
          "maxZ": 554.618,
          "minX": 484.987,
          "minZ": 538.716,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_347:площадка",
          "maxX": 527.343,
          "maxZ": 552.247,
          "minX": 512.657,
          "minZ": 541.086,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_348:площадка",
          "maxX": 408.465,
          "maxZ": -552.254,
          "minX": 400.946,
          "minZ": -558.335,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_349:площадка",
          "maxX": 558.586,
          "maxZ": -476.308,
          "minX": 552.002,
          "minZ": -483.692,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_350:площадка",
          "maxX": 558.618,
          "maxZ": -401.808,
          "minX": 551.971,
          "minZ": -407.604,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_351:площадка",
          "maxX": 572.92,
          "maxZ": 164.006,
          "minX": 557.747,
          "minZ": 155.994,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_352:площадка",
          "maxX": 569.014,
          "maxZ": 185.103,
          "minX": 561.653,
          "minZ": 177.564,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_353:площадка",
          "maxX": -182.325,
          "maxZ": -562.109,
          "minX": -195.857,
          "minZ": -572.437,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_354:площадка",
          "maxX": -155.12,
          "maxZ": -561.992,
          "minX": -164.88,
          "minZ": -572.554,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_355:площадка",
          "maxX": -92.906,
          "maxZ": -562.081,
          "minX": -110.73,
          "minZ": -572.464,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_356:площадка",
          "maxX": -66.807,
          "maxZ": -562.35,
          "minX": -78.647,
          "minZ": -572.195,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_357:площадка",
          "maxX": -38.884,
          "maxZ": -561.287,
          "minX": -48.389,
          "minZ": -573.259,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_358:площадка",
          "maxX": 137.034,
          "maxZ": 574.264,
          "minX": 124.785,
          "minZ": 560.282,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_359:площадка",
          "maxX": 570.458,
          "maxZ": -246,
          "minX": 565.542,
          "minZ": -250,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_360:площадка",
          "maxX": 570.347,
          "maxZ": -165.26,
          "minX": 565.653,
          "minZ": -170.74,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_361:площадка",
          "maxX": 571.046,
          "maxZ": -133.873,
          "minX": 564.954,
          "minZ": -138.127,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_362:площадка",
          "maxX": 571.628,
          "maxZ": -53.53,
          "minX": 564.372,
          "minZ": -58.47,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_363:площадка",
          "maxX": 395.139,
          "maxZ": 580.342,
          "minX": 378.194,
          "minZ": 566.325,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_364:площадка",
          "maxX": 505.319,
          "maxZ": -571.366,
          "minX": 492.328,
          "minZ": -576.87,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_365:площадка",
          "maxX": 576.766,
          "maxZ": -494.86,
          "minX": 571.469,
          "minZ": -502.787,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_366:площадка",
          "maxX": 578.641,
          "maxZ": -438.886,
          "minX": 569.595,
          "minZ": -445.82,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_367:площадка",
          "maxX": 578.409,
          "maxZ": -400.971,
          "minX": 569.826,
          "minZ": -408.441,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_368:площадка",
          "maxX": 587.267,
          "maxZ": -213.175,
          "minX": 580.733,
          "minZ": -218.825,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_369:площадка",
          "maxX": -619.563,
          "maxZ": -384.702,
          "minX": -631.346,
          "minZ": -400.752,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_370:площадка",
          "maxX": 592.845,
          "maxZ": 121.618,
          "minX": 580.488,
          "minZ": 113.048,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_371:площадка",
          "maxX": 594.062,
          "maxZ": 142.951,
          "minX": 579.272,
          "minZ": 134.382,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_372:площадка",
          "maxX": 592.105,
          "maxZ": 186.379,
          "minX": 581.228,
          "minZ": 176.288,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_373:площадка",
          "maxX": 593.851,
          "maxZ": 291.895,
          "minX": 579.482,
          "minZ": 284.105,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_374:площадка",
          "maxX": 389.15,
          "maxZ": -589.855,
          "minX": 382.615,
          "minZ": -596.028,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_375:площадка",
          "maxX": 463.846,
          "maxZ": -588.831,
          "minX": 458.507,
          "minZ": -597.051,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_376:площадка",
          "maxX": -212.32,
          "maxZ": -590.047,
          "minX": -224.044,
          "minZ": -602.68,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_377:площадка",
          "maxX": 169.569,
          "maxZ": 603.574,
          "minX": 150.431,
          "minZ": 589.153,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_378:площадка",
          "maxX": 255.727,
          "maxZ": 601.338,
          "minX": 238.819,
          "minZ": 591.389,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_379:площадка",
          "maxX": 314.835,
          "maxZ": 601.624,
          "minX": 296.074,
          "minZ": 591.103,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_380:площадка",
          "maxX": 602.575,
          "maxZ": -293.598,
          "minX": 597.425,
          "minZ": -298.402,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_381:площадка",
          "maxX": 602.379,
          "maxZ": -277.067,
          "minX": 597.621,
          "minZ": -282.933,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_382:площадка",
          "maxX": 602.331,
          "maxZ": -230,
          "minX": 597.669,
          "minZ": -234,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_383:площадка",
          "maxX": 602.209,
          "maxZ": -37.498,
          "minX": 597.791,
          "minZ": -42.502,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_384:площадка",
          "maxX": 602.417,
          "maxZ": -21.354,
          "minX": 597.583,
          "minZ": -26.646,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_385:площадка",
          "maxX": 602.877,
          "maxZ": -5.459,
          "minX": 597.123,
          "minZ": -10.541,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_386:площадка",
          "maxX": 608.456,
          "maxZ": 473.337,
          "minX": 591.544,
          "minZ": 459.996,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_387:площадка",
          "maxX": 561.846,
          "maxZ": -589.459,
          "minX": 548.742,
          "minZ": -596.424,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_388:площадка",
          "maxX": 595.362,
          "maxZ": -551.099,
          "minX": 590.52,
          "minZ": -559.489,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_389:площадка",
          "maxX": -589.544,
          "maxZ": -328.11,
          "minX": -603.184,
          "minZ": -340.981,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_390:площадка",
          "maxX": 616.167,
          "maxZ": 79.615,
          "minX": 599.833,
          "minZ": 69.718,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_391:площадка",
          "maxX": -88.711,
          "maxZ": 591.797,
          "minX": -103.289,
          "minZ": 581.537,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_392:площадка",
          "maxX": 389.631,
          "maxZ": -607.797,
          "minX": 382.134,
          "minZ": -615.732,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_393:площадка",
          "maxX": 521.817,
          "maxZ": -608.279,
          "minX": 513.478,
          "minZ": -615.25,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_394:площадка",
          "maxX": 615.91,
          "maxZ": -512.052,
          "minX": 607.619,
          "minZ": -523.242,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_395:площадка",
          "maxX": 618.073,
          "maxZ": -532.088,
          "minX": 605.457,
          "minZ": -540.853,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_396:площадка",
          "maxX": -113.326,
          "maxZ": 632.803,
          "minX": -121.34,
          "minZ": 625.864,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_397:площадка",
          "maxX": 619.296,
          "maxZ": -180.842,
          "minX": 612.704,
          "minZ": -187.158,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_398:площадка",
          "maxX": 618.554,
          "maxZ": -148.731,
          "minX": 613.446,
          "minZ": -155.269,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_399:площадка",
          "maxX": 619.727,
          "maxZ": -52.679,
          "minX": 612.273,
          "minZ": -59.321,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_400:площадка",
          "maxX": 579.217,
          "maxZ": 607.759,
          "minX": 567.45,
          "minZ": 592.241,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_1_401:площадка",
          "maxX": -21.369,
          "maxZ": -20.16,
          "minX": -31.964,
          "minZ": -33.173,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_1_402:площадка",
          "maxX": 15.941,
          "maxZ": -214.1,
          "minX": 6.916,
          "minZ": -220.186,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_403:площадка",
          "maxX": -335.487,
          "maxZ": 26.116,
          "minX": -344.513,
          "minZ": 13.884,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_2_404:площадка",
          "maxX": -7.452,
          "maxZ": 82.859,
          "minX": -38.263,
          "minZ": 54.284,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_2_405:площадка",
          "maxX": 312.358,
          "maxZ": 20.852,
          "minX": 298.551,
          "minZ": 8.239,
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
              "y": 0,
              "z": -520
            },
            {
              "x": 520,
              "y": 0,
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
          "id": "tr_repair_connect_extra_1_a",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": 520
            },
            {
              "x": 75,
              "y": 0,
              "z": 520
            },
            {
              "x": 75,
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
          "id": "tr_repair_connect_extra_1_b",
          "points": [
            {
              "x": 75,
              "y": 0,
              "z": 220
            },
            {
              "x": 75,
              "y": 0,
              "z": 0
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
              "z": 75
            },
            {
              "x": 0,
              "y": 0,
              "z": 86.15
            },
            {
              "x": 0,
              "y": 0,
              "z": 97.31
            },
            {
              "x": 0,
              "y": 0,
              "z": 108.46
            },
            {
              "x": 0,
              "y": 0,
              "z": 119.62
            },
            {
              "x": 0,
              "y": 0,
              "z": 130.77
            },
            {
              "x": 0,
              "y": 0,
              "z": 141.92
            },
            {
              "x": 0,
              "y": 0,
              "z": 153.08
            },
            {
              "x": 0,
              "y": 0,
              "z": 164.23
            },
            {
              "x": 0,
              "y": 0,
              "z": 175.38
            },
            {
              "x": 0,
              "y": 0,
              "z": 186.54
            },
            {
              "x": 0,
              "y": 0,
              "z": 197.69
            },
            {
              "x": 0,
              "y": 0,
              "z": 208.85
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
          "id": "tr_repair_connect_extra_6",
          "points": [
            {
              "x": 75,
              "y": 0,
              "z": 0
            },
            {
              "x": 70,
              "y": 0,
              "z": 0
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_repair_connect_extra_9",
          "points": [
            {
              "x": 220,
              "y": 0,
              "z": 0
            },
            {
              "x": 150,
              "y": 0,
              "z": 0
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
          "id": "tr_repair_connect_extra_10_a",
          "points": [
            {
              "x": 0,
              "y": 0,
              "z": 220
            },
            {
              "x": 75,
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
          "id": "tr_repair_connect_extra_10_b",
          "points": [
            {
              "x": 75,
              "y": 0,
              "z": 220
            },
            {
              "x": 80,
              "y": 0,
              "z": 220
            },
            {
              "x": 80,
              "y": 0,
              "z": 150
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
              "y": 0,
              "z": -520
            },
            {
              "x": -592,
              "y": 0,
              "z": -508
            },
            {
              "x": -592,
              "y": 0,
              "z": -496
            },
            {
              "x": -592,
              "y": 0,
              "z": -484
            },
            {
              "x": -592,
              "y": 0,
              "z": -472
            },
            {
              "x": -592,
              "y": 0,
              "z": -460
            },
            {
              "x": -592,
              "y": 0,
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
              "y": 0,
              "z": -448
            },
            {
              "x": -580,
              "y": 0,
              "z": -448
            },
            {
              "x": -568,
              "y": 0,
              "z": -448
            },
            {
              "x": -556,
              "y": 0,
              "z": -448
            },
            {
              "x": -544,
              "y": 0,
              "z": -448
            },
            {
              "x": -532,
              "y": 0,
              "z": -448
            },
            {
              "x": -520,
              "y": 0,
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
            },
            {
              "x": -520,
              "y": 0,
              "z": -412
            },
            {
              "x": -520,
              "y": 0,
              "z": -400
            },
            {
              "x": -520,
              "y": 0,
              "z": -388
            },
            {
              "x": -520,
              "y": 0,
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
              "y": 0,
              "z": -376
            },
            {
              "x": -508,
              "y": 0,
              "z": -376
            },
            {
              "x": -496,
              "y": 0,
              "z": -376
            },
            {
              "x": -484,
              "y": 0,
              "z": -376
            },
            {
              "x": -472,
              "y": 0,
              "z": -376
            },
            {
              "x": -460,
              "y": 0,
              "z": -376
            },
            {
              "x": -448,
              "y": 0,
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
              "y": 0,
              "z": -376
            },
            {
              "x": -448,
              "y": 0,
              "z": -365.64
            },
            {
              "x": -448,
              "y": 0,
              "z": -355.27
            },
            {
              "x": -448,
              "y": 0,
              "z": -344.91
            },
            {
              "x": -448,
              "y": 0,
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
              "y": 0,
              "z": 220
            },
            {
              "x": -12,
              "y": 0,
              "z": 220
            },
            {
              "x": -24,
              "y": 0,
              "z": 220
            },
            {
              "x": -36,
              "y": 0,
              "z": 220
            },
            {
              "x": -48,
              "y": 0,
              "z": 220
            },
            {
              "x": -60,
              "y": 0,
              "z": 220
            },
            {
              "x": -72,
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
          "id": "tr_acc_1_7_2",
          "points": [
            {
              "x": -72,
              "y": 0,
              "z": 220
            },
            {
              "x": -72,
              "y": 0,
              "z": 232
            },
            {
              "x": -72,
              "y": 0,
              "z": 244
            },
            {
              "x": -72,
              "y": 0,
              "z": 256
            },
            {
              "x": -72,
              "y": 0,
              "z": 268
            },
            {
              "x": -72,
              "y": 0,
              "z": 280
            },
            {
              "x": -72,
              "y": 0,
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
              "y": 0,
              "z": 292
            },
            {
              "x": -84,
              "y": 0,
              "z": 292
            },
            {
              "x": -96,
              "y": 0,
              "z": 292
            },
            {
              "x": -108,
              "y": 0,
              "z": 292
            },
            {
              "x": -120,
              "y": 0,
              "z": 292
            },
            {
              "x": -132,
              "y": 0,
              "z": 292
            },
            {
              "x": -144,
              "y": 0,
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
              "y": 0,
              "z": 292
            },
            {
              "x": -144,
              "y": 0,
              "z": 304
            },
            {
              "x": -144,
              "y": 0,
              "z": 316
            },
            {
              "x": -144,
              "y": 0,
              "z": 328
            },
            {
              "x": -144,
              "y": 0,
              "z": 340
            },
            {
              "x": -144,
              "y": 0,
              "z": 352
            },
            {
              "x": -144,
              "y": 0,
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
              "y": 0,
              "z": 364
            },
            {
              "x": -156,
              "y": 0,
              "z": 364
            },
            {
              "x": -168,
              "y": 0,
              "z": 364
            },
            {
              "x": -180,
              "y": 0,
              "z": 364
            },
            {
              "x": -192,
              "y": 0,
              "z": 364
            },
            {
              "x": -204,
              "y": 0,
              "z": 364
            },
            {
              "x": -216,
              "y": 0,
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
              "y": 0,
              "z": 364
            },
            {
              "x": -216,
              "y": 0,
              "z": 374.4
            },
            {
              "x": -216,
              "y": 0,
              "z": 384.8
            },
            {
              "x": -216,
              "y": 0,
              "z": 395.2
            },
            {
              "x": -216,
              "y": 0,
              "z": 405.6
            },
            {
              "x": -216,
              "y": 0,
              "z": 416
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
              "y": 0,
              "z": 416
            },
            {
              "x": -225.78,
              "y": 0,
              "z": 416
            },
            {
              "x": -235.55,
              "y": 0,
              "z": 416
            },
            {
              "x": -245.33,
              "y": 0,
              "z": 416
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
              "y": 0,
              "z": 416
            },
            {
              "x": -245.33,
              "y": 0,
              "z": 428
            },
            {
              "x": -245.33,
              "y": 0,
              "z": 440
            },
            {
              "x": -245.33,
              "y": 0,
              "z": 452
            },
            {
              "x": -245.33,
              "y": 0,
              "z": 464
            },
            {
              "x": -245.33,
              "y": 0,
              "z": 476
            },
            {
              "x": -245.33,
              "y": 0,
              "z": 488
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
              "y": 0,
              "z": 488
            },
            {
              "x": -234.66,
              "y": 0,
              "z": 488
            },
            {
              "x": -224,
              "y": 0,
              "z": 488
            },
            {
              "x": -213.33,
              "y": 0,
              "z": 488
            },
            {
              "x": -202.66,
              "y": 0,
              "z": 488
            },
            {
              "x": -192,
              "y": 0,
              "z": 488
            },
            {
              "x": -181.33,
              "y": 0,
              "z": 488
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
              "y": 0,
              "z": 488
            },
            {
              "x": -181.33,
              "y": 0,
              "z": 500
            },
            {
              "x": -181.33,
              "y": 0,
              "z": 512
            },
            {
              "x": -181.33,
              "y": 0,
              "z": 524
            },
            {
              "x": -181.33,
              "y": 0,
              "z": 536
            },
            {
              "x": -181.33,
              "y": 0,
              "z": 548
            },
            {
              "x": -181.33,
              "y": 0,
              "z": 560
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
              "y": 0,
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
              "y": 0,
              "z": 0
            },
            {
              "x": 292,
              "y": 0,
              "z": 12
            },
            {
              "x": 292,
              "y": 0,
              "z": 24
            },
            {
              "x": 292,
              "y": 0,
              "z": 36
            },
            {
              "x": 292,
              "y": 0,
              "z": 48
            },
            {
              "x": 292,
              "y": 0,
              "z": 60
            },
            {
              "x": 292,
              "y": 0,
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
