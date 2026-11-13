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
          "buildings": 86,
          "lights": 2,
          "props": 157,
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
          "buildings": 39,
          "lights": 3,
          "props": 113,
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
          "buildings": 154,
          "lights": 1,
          "props": 231,
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
          "buildings": 126,
          "lights": 3,
          "props": 157,
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
          "maxX": 538.092,
          "maxZ": -278,
          "minX": 533.908,
          "minZ": -282,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_3:площадка",
          "maxX": 539.071,
          "maxZ": -245.204,
          "minX": 532.929,
          "minZ": -250.796,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_4:площадка",
          "maxX": 538.596,
          "maxZ": -228.55,
          "minX": 533.404,
          "minZ": -235.45,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_5:площадка",
          "maxX": 538.699,
          "maxZ": -213.546,
          "minX": 533.301,
          "minZ": -218.454,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_6:площадка",
          "maxX": 538.835,
          "maxZ": -197.348,
          "minX": 533.165,
          "minZ": -202.652,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_7:площадка",
          "maxX": 538.103,
          "maxZ": -181.714,
          "minX": 533.897,
          "minZ": -186.286,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_8:площадка",
          "maxX": 538,
          "maxZ": -166,
          "minX": 534,
          "minZ": -170,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_9:площадка",
          "maxX": 539.551,
          "maxZ": -117.046,
          "minX": 532.449,
          "minZ": -122.954,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_10:площадка",
          "maxX": 539.205,
          "maxZ": -100.825,
          "minX": 532.795,
          "minZ": -107.175,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_11:площадка",
          "maxX": 538.612,
          "maxZ": -68.89,
          "minX": 533.388,
          "minZ": -75.11,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_12:площадка",
          "maxX": 539.302,
          "maxZ": -37.318,
          "minX": 532.698,
          "minZ": -42.682,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_13:площадка",
          "maxX": 538.498,
          "maxZ": -5.812,
          "minX": 533.502,
          "minZ": -10.188,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_14:площадка",
          "maxX": 334.067,
          "maxZ": -532.48,
          "minX": 324.757,
          "minZ": -540.461,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_15:площадка",
          "maxX": 352.053,
          "maxZ": -532.477,
          "minX": 344.417,
          "minZ": -540.464,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_16:площадка",
          "maxX": 371.025,
          "maxZ": -532.019,
          "minX": 363.093,
          "minZ": -540.922,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_17:площадка",
          "maxX": 391.975,
          "maxZ": -533.923,
          "minX": 379.79,
          "minZ": -539.018,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_18:площадка",
          "maxX": 409.661,
          "maxZ": -532.251,
          "minX": 399.751,
          "minZ": -540.69,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_19:площадка",
          "maxX": 427.465,
          "maxZ": -533.145,
          "minX": 419.594,
          "minZ": -539.796,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_20:площадка",
          "maxX": 446.41,
          "maxZ": -532.676,
          "minX": 438.296,
          "minZ": -540.265,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_21:площадка",
          "maxX": 464.498,
          "maxZ": -533.145,
          "minX": 457.855,
          "minZ": -539.796,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_22:площадка",
          "maxX": 484.542,
          "maxZ": -532.018,
          "minX": 475.458,
          "minZ": -540.923,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_23:площадка",
          "maxX": 501.556,
          "maxZ": -532.52,
          "minX": 496.091,
          "minZ": -540.421,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_24:площадка",
          "maxX": 521.699,
          "maxZ": -532.361,
          "minX": 513.595,
          "minZ": -540.58,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_25:площадка",
          "maxX": 539.306,
          "maxZ": -514.764,
          "minX": 533.635,
          "minZ": -520.53,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_26:площадка",
          "maxX": 540.101,
          "maxZ": -494.689,
          "minX": 532.84,
          "minZ": -502.958,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_27:площадка",
          "maxX": 540.291,
          "maxZ": -475.114,
          "minX": 532.651,
          "minZ": -484.886,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_28:площадка",
          "maxX": 540.394,
          "maxZ": -457.117,
          "minX": 532.547,
          "minZ": -465.236,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_29:площадка",
          "maxX": 541.2,
          "maxZ": -439.155,
          "minX": 531.742,
          "minZ": -445.551,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_30:площадка",
          "maxX": 539.898,
          "maxZ": -382.971,
          "minX": 533.044,
          "minZ": -388.794,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_31:площадка",
          "maxX": 540.175,
          "maxZ": -363.04,
          "minX": 532.767,
          "minZ": -371.077,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_32:площадка",
          "maxX": 540.079,
          "maxZ": -344.443,
          "minX": 532.863,
          "minZ": -352.028,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_33:площадка",
          "maxX": 540.117,
          "maxZ": -324.338,
          "minX": 532.825,
          "minZ": -334.486,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_34:площадка",
          "maxX": -559.377,
          "maxZ": -531.28,
          "minX": -575.168,
          "minZ": -545.083,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_35:площадка",
          "maxX": -473.706,
          "maxZ": -532.286,
          "minX": -486.294,
          "minZ": -544.077,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_36:площадка",
          "maxX": -445.55,
          "maxZ": -531.183,
          "minX": -456.269,
          "minZ": -545.18,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_37:площадка",
          "maxX": -386.636,
          "maxZ": -533.306,
          "minX": -398.818,
          "minZ": -543.057,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_38:площадка",
          "maxX": -353.96,
          "maxZ": -530.929,
          "minX": -373.313,
          "minZ": -545.435,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_39:площадка",
          "maxX": -327.342,
          "maxZ": -532.646,
          "minX": -341.749,
          "minZ": -543.718,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_40:площадка",
          "maxX": -531.626,
          "maxZ": -413.196,
          "minX": -544.737,
          "minZ": -430.44,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_41:площадка",
          "maxX": -530.838,
          "maxZ": -384.889,
          "minX": -545.526,
          "minZ": -400.566,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_42:площадка",
          "maxX": -269.651,
          "maxZ": -531.731,
          "minX": -283.076,
          "minZ": -544.633,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_43:площадка",
          "maxX": -179.664,
          "maxZ": -532.472,
          "minX": -198.518,
          "minZ": -543.891,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_44:площадка",
          "maxX": -154.433,
          "maxZ": -533.799,
          "minX": -165.567,
          "minZ": -542.565,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_45:площадка",
          "maxX": -64.022,
          "maxZ": -532.305,
          "minX": -81.433,
          "minZ": -544.058,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_46:площадка",
          "maxX": 107.431,
          "maxZ": 542.738,
          "minX": 96.205,
          "minZ": 533.625,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_47:площадка",
          "maxX": 137.736,
          "maxZ": 544.557,
          "minX": 124.082,
          "minZ": 531.807,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_48:площадка",
          "maxX": 282.421,
          "maxZ": 544.275,
          "minX": 270.307,
          "minZ": 532.089,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_49:площадка",
          "maxX": 79.683,
          "maxZ": 543.978,
          "minX": 65.771,
          "minZ": 532.386,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_50:площадка",
          "maxX": -585.534,
          "maxZ": -529.6,
          "minX": -607.194,
          "minZ": -546.764,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_51:площадка",
          "maxX": -529.086,
          "maxZ": -357.676,
          "minX": -547.278,
          "minZ": -369.596,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_52:площадка",
          "maxX": -197.304,
          "maxZ": 570.61,
          "minX": -208.029,
          "minZ": 560.057,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_53:площадка",
          "maxX": -153.431,
          "maxZ": 569.224,
          "minX": -166.569,
          "minZ": 561.443,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_54:площадка",
          "maxX": 540.417,
          "maxZ": -532.182,
          "minX": 532.524,
          "minZ": -540.759,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_55:площадка",
          "maxX": 550.109,
          "maxZ": 121.728,
          "minX": 537.891,
          "minZ": 112.938,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_56:площадка",
          "maxX": 549.878,
          "maxZ": 143.002,
          "minX": 538.122,
          "minZ": 134.331,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_57:площадка",
          "maxX": 548.585,
          "maxZ": 164.027,
          "minX": 539.415,
          "minZ": 155.973,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_58:площадка",
          "maxX": 550.008,
          "maxZ": 185.983,
          "minX": 537.992,
          "minZ": 176.683,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_59:площадка",
          "maxX": 549.954,
          "maxZ": 207.299,
          "minX": 538.046,
          "minZ": 198.034,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_60:площадка",
          "maxX": 551.885,
          "maxZ": 228.938,
          "minX": 536.115,
          "minZ": 219.062,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_61:площадка",
          "maxX": 548.082,
          "maxZ": 249.237,
          "minX": 539.918,
          "minZ": 241.429,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_62:площадка",
          "maxX": 550.061,
          "maxZ": 314.567,
          "minX": 537.939,
          "minZ": 304.1,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_63:площадка",
          "maxX": -559.457,
          "maxZ": -414.259,
          "minX": -575.089,
          "minZ": -429.377,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_64:площадка",
          "maxX": -589.567,
          "maxZ": -414.685,
          "minX": -603.16,
          "minZ": -428.951,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_65:площадка",
          "maxX": -177.187,
          "maxZ": 590.989,
          "minX": -185.479,
          "minZ": 582.344,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_66:площадка",
          "maxX": 557.5,
          "maxZ": 340.361,
          "minX": 535.833,
          "minZ": 326.305,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_67:площадка",
          "maxX": 552.308,
          "maxZ": 366.29,
          "minX": 541.025,
          "minZ": 353.71,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_68:площадка",
          "maxX": 556.154,
          "maxZ": 394.916,
          "minX": 537.18,
          "minZ": 378.418,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_69:площадка",
          "maxX": 554.051,
          "maxZ": 419.989,
          "minX": 539.282,
          "minZ": 406.678,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_70:площадка",
          "maxX": 554.686,
          "maxZ": 445.76,
          "minX": 538.647,
          "minZ": 434.24,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_71:площадка",
          "maxX": 555.566,
          "maxZ": 473.213,
          "minX": 537.767,
          "minZ": 460.12,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_72:площадка",
          "maxX": 556.524,
          "maxZ": 499.624,
          "minX": 536.81,
          "minZ": 487.042,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_73:площадка",
          "maxX": 555.824,
          "maxZ": 529.008,
          "minX": 537.509,
          "minZ": 510.992,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_74:площадка",
          "maxX": 368.357,
          "maxZ": 552.804,
          "minX": 351.643,
          "minZ": 540.53,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_75:площадка",
          "maxX": 395.316,
          "maxZ": 553.058,
          "minX": 378.017,
          "minZ": 540.275,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_76:площадка",
          "maxX": 446.145,
          "maxZ": 551.577,
          "minX": 433.855,
          "minZ": 541.756,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_77:площадка",
          "maxX": 475.719,
          "maxZ": 553.397,
          "minX": 457.614,
          "minZ": 539.937,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_78:площадка",
          "maxX": 503.494,
          "maxZ": 552.323,
          "minX": 483.173,
          "minZ": 541.01,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_79:площадка",
          "maxX": 526.324,
          "maxZ": 554.66,
          "minX": 513.676,
          "minZ": 538.673,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_80:площадка",
          "maxX": -529.513,
          "maxZ": -474.732,
          "minX": -546.85,
          "minZ": -485.268,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_81:площадка",
          "maxX": 554.24,
          "maxZ": -310,
          "minX": 549.76,
          "minZ": -314,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_82:площадка",
          "maxX": 554.596,
          "maxZ": -278,
          "minX": 549.404,
          "minZ": -282,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_83:площадка",
          "maxX": 554.667,
          "maxZ": -261.225,
          "minX": 549.333,
          "minZ": -266.775,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_84:площадка",
          "maxX": 554.507,
          "maxZ": -244.679,
          "minX": 549.493,
          "minZ": -251.321,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_85:площадка",
          "maxX": 555.617,
          "maxZ": -229.251,
          "minX": 548.383,
          "minZ": -234.749,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_86:площадка",
          "maxX": 554.689,
          "maxZ": -212.732,
          "minX": 549.311,
          "minZ": -219.268,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_87:площадка",
          "maxX": 555.599,
          "maxZ": -196.227,
          "minX": 548.401,
          "minZ": -203.773,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_88:площадка",
          "maxX": 554.433,
          "maxZ": -133.843,
          "minX": 549.567,
          "minZ": -138.157,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_89:площадка",
          "maxX": 554.125,
          "maxZ": -117.779,
          "minX": 549.875,
          "minZ": -122.221,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_90:площадка",
          "maxX": 555.468,
          "maxZ": -85.185,
          "minX": 548.532,
          "minZ": -90.815,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_91:площадка",
          "maxX": 554.066,
          "maxZ": -70,
          "minX": 549.934,
          "minZ": -74,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_92:площадка",
          "maxX": 555.135,
          "maxZ": -53.124,
          "minX": 548.865,
          "minZ": -58.876,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_93:площадка",
          "maxX": 554.86,
          "maxZ": -36.683,
          "minX": 549.14,
          "minZ": -43.317,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_94:площадка",
          "maxX": 555.193,
          "maxZ": -21.086,
          "minX": 548.807,
          "minZ": -26.914,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_95:площадка",
          "maxX": -616.939,
          "maxZ": -503.599,
          "minX": -633.97,
          "minZ": -514.583,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_96:площадка",
          "maxX": -619.938,
          "maxZ": -474.433,
          "minX": -630.971,
          "minZ": -485.567,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_97:площадка",
          "maxX": -614.828,
          "maxZ": -443.828,
          "minX": -636.081,
          "minZ": -457.99,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_98:площадка",
          "maxX": -194.685,
          "maxZ": 591.208,
          "minX": -210.648,
          "minZ": 582.125,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_99:площадка",
          "maxX": -155.086,
          "maxZ": 590.717,
          "minX": -164.914,
          "minZ": 582.617,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_100:площадка",
          "maxX": 333.038,
          "maxZ": -552.156,
          "minX": 325.786,
          "minZ": -558.432,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_101:площадка",
          "maxX": 372.266,
          "maxZ": -551.683,
          "minX": 361.852,
          "minZ": -558.905,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_102:площадка",
          "maxX": 408.518,
          "maxZ": -552.213,
          "minX": 400.894,
          "minZ": -558.375,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_103:площадка",
          "maxX": 427.574,
          "maxZ": -550.899,
          "minX": 419.485,
          "minZ": -559.69,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_104:площадка",
          "maxX": 521.291,
          "maxZ": -552.423,
          "minX": 514.003,
          "minZ": -558.165,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_105:площадка",
          "maxX": 559.326,
          "maxZ": -438.658,
          "minX": 551.262,
          "minZ": -446.047,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_106:площадка",
          "maxX": 540.631,
          "maxZ": -550.764,
          "minX": 532.311,
          "minZ": -559.824,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_107:площадка",
          "maxX": 558.732,
          "maxZ": -532.699,
          "minX": 551.857,
          "minZ": -540.242,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_108:площадка",
          "maxX": -613.851,
          "maxZ": -412.852,
          "minX": -637.058,
          "minZ": -430.785,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_109:площадка",
          "maxX": -219.361,
          "maxZ": 547.673,
          "minX": -228.639,
          "minZ": 540.327,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_110:площадка",
          "maxX": -219.849,
          "maxZ": 569.69,
          "minX": -228.151,
          "minZ": 560.977,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_111:площадка",
          "maxX": -133.833,
          "maxZ": 569.881,
          "minX": -143.5,
          "minZ": 560.786,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_112:площадка",
          "maxX": 571.916,
          "maxZ": 15.32,
          "minX": 558.751,
          "minZ": 6.013,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_113:площадка",
          "maxX": 573.5,
          "maxZ": 57.557,
          "minX": 557.167,
          "minZ": 49.109,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_114:площадка",
          "maxX": 573.5,
          "maxZ": 79.47,
          "minX": 557.167,
          "minZ": 69.863,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_115:площадка",
          "maxX": 570.143,
          "maxZ": 101.955,
          "minX": 560.524,
          "minZ": 90.045,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_116:площадка",
          "maxX": 571.04,
          "maxZ": 122.46,
          "minX": 559.627,
          "minZ": 112.207,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_117:площадка",
          "maxX": 570.944,
          "maxZ": 185.906,
          "minX": 559.723,
          "minZ": 176.761,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_118:площадка",
          "maxX": 570.664,
          "maxZ": 206.383,
          "minX": 560.003,
          "minZ": 198.95,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_119:площадка",
          "maxX": 572.748,
          "maxZ": 228.043,
          "minX": 557.919,
          "minZ": 219.957,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_120:площадка",
          "maxX": 572.804,
          "maxZ": 250.468,
          "minX": 557.862,
          "minZ": 240.199,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_121:площадка",
          "maxX": 571.306,
          "maxZ": 313.306,
          "minX": 559.361,
          "minZ": 305.361,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_122:площадка",
          "maxX": -559.169,
          "maxZ": -558.822,
          "minX": -575.377,
          "minZ": -575.724,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_123:площадка",
          "maxX": -532.406,
          "maxZ": -561.55,
          "minX": -543.958,
          "minZ": -572.995,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_124:площадка",
          "maxX": -503.027,
          "maxZ": -559.909,
          "minX": -515.154,
          "minZ": -574.636,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_125:площадка",
          "maxX": -471.244,
          "maxZ": -560.857,
          "minX": -488.756,
          "minZ": -573.688,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_126:площадка",
          "maxX": -444.771,
          "maxZ": -559.67,
          "minX": -457.047,
          "minZ": -574.875,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_127:площадка",
          "maxX": -412.698,
          "maxZ": -560.863,
          "minX": -430.939,
          "minZ": -573.682,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_128:площадка",
          "maxX": -381.668,
          "maxZ": -559.714,
          "minX": -403.787,
          "minZ": -574.831,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_129:площадка",
          "maxX": -353.622,
          "maxZ": -558.842,
          "minX": -373.651,
          "minZ": -575.704,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_130:площадка",
          "maxX": -555.697,
          "maxZ": -384.901,
          "minX": -578.849,
          "minZ": -400.553,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_131:площадка",
          "maxX": -297.883,
          "maxZ": -561.369,
          "minX": -313.026,
          "minZ": -573.177,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_132:площадка",
          "maxX": -211.673,
          "maxZ": -560.763,
          "minX": -224.691,
          "minZ": -573.783,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_133:площадка",
          "maxX": -182.015,
          "maxZ": -561.692,
          "minX": -196.167,
          "minZ": -572.853,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_134:площадка",
          "maxX": -152.086,
          "maxZ": -561.281,
          "minX": -167.914,
          "minZ": -573.264,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_135:площадка",
          "maxX": -96.36,
          "maxZ": -563.015,
          "minX": -107.277,
          "minZ": -571.53,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_136:площадка",
          "maxX": -38.229,
          "maxZ": -560.61,
          "minX": -49.043,
          "minZ": -573.935,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_137:площадка",
          "maxX": 110.017,
          "maxZ": 573.847,
          "minX": 93.62,
          "minZ": 560.698,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_138:площадка",
          "maxX": 139.105,
          "maxZ": 572.91,
          "minX": 122.714,
          "minZ": 561.636,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_139:площадка",
          "maxX": 169.993,
          "maxZ": 574.335,
          "minX": 150.007,
          "minZ": 560.211,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_140:площадка",
          "maxX": 226.661,
          "maxZ": 573.259,
          "minX": 209.703,
          "minZ": 561.286,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_141:площадка",
          "maxX": 252.598,
          "maxZ": 572.661,
          "minX": 241.948,
          "minZ": 561.884,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_142:площадка",
          "maxX": 286.003,
          "maxZ": 572.824,
          "minX": 266.724,
          "minZ": 561.722,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_143:площадка",
          "maxX": 309.879,
          "maxZ": 572.654,
          "minX": 301.03,
          "minZ": 561.891,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_144:площадка",
          "maxX": 79.358,
          "maxZ": 574.128,
          "minX": 66.097,
          "minZ": 560.418,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_145:площадка",
          "maxX": -585.872,
          "maxZ": -558.455,
          "minX": -606.855,
          "minZ": -576.09,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_146:площадка",
          "maxX": 571.752,
          "maxZ": -308.676,
          "minX": 564.248,
          "minZ": -315.324,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_147:площадка",
          "maxX": 571.156,
          "maxZ": -293.244,
          "minX": 564.844,
          "minZ": -298.756,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_148:площадка",
          "maxX": 571.01,
          "maxZ": -277.842,
          "minX": 564.99,
          "minZ": -282.158,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_149:площадка",
          "maxX": 570,
          "maxZ": -261.437,
          "minX": 566,
          "minZ": -266.563,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_150:площадка",
          "maxX": 571.558,
          "maxZ": -245.395,
          "minX": 564.442,
          "minZ": -250.605,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_151:площадка",
          "maxX": 571.589,
          "maxZ": -213.569,
          "minX": 564.411,
          "minZ": -218.431,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_152:площадка",
          "maxX": 570.435,
          "maxZ": -166,
          "minX": 565.565,
          "minZ": -170,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_153:площадка",
          "maxX": 571.206,
          "maxZ": -133.66,
          "minX": 564.794,
          "minZ": -138.34,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_154:площадка",
          "maxX": 570.609,
          "maxZ": -21.531,
          "minX": 565.391,
          "minZ": -26.469,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_155:площадка",
          "maxX": 571.288,
          "maxZ": -5.492,
          "minX": 564.712,
          "minZ": -10.508,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_156:площадка",
          "maxX": -173.167,
          "maxZ": 612.436,
          "minX": -189.5,
          "minZ": 603.564,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_157:площадка",
          "maxX": -557.829,
          "maxZ": -355.183,
          "minX": -576.717,
          "minZ": -372.09,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_158:площадка",
          "maxX": 559.602,
          "maxZ": -551.621,
          "minX": 550.986,
          "minZ": -558.968,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_159:площадка",
          "maxX": -133.294,
          "maxZ": 591.401,
          "minX": -144.039,
          "minZ": 581.932,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_160:площадка",
          "maxX": -216.125,
          "maxZ": 590.201,
          "minX": -231.875,
          "minZ": 583.132,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_161:площадка",
          "maxX": 31.998,
          "maxZ": -560.578,
          "minX": 13.716,
          "minZ": -582.279,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_162:площадка",
          "maxX": 170.409,
          "maxZ": -563.181,
          "minX": 149.591,
          "minZ": -579.676,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_163:площадка",
          "maxX": 222.736,
          "maxZ": -560.107,
          "minX": 188.693,
          "minZ": -582.75,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_164:площадка",
          "maxX": -197.411,
          "maxZ": 612.46,
          "minX": -207.923,
          "minZ": 603.54,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_165:площадка",
          "maxX": 582.155,
          "maxZ": 369.32,
          "minX": 564.512,
          "minZ": 350.68,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_166:площадка",
          "maxX": 582.236,
          "maxZ": 392.142,
          "minX": 564.43,
          "minZ": 381.191,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_167:площадка",
          "maxX": 582.424,
          "maxZ": 446.231,
          "minX": 564.243,
          "minZ": 433.769,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_168:площадка",
          "maxX": 579.081,
          "maxZ": 472.297,
          "minX": 567.586,
          "minZ": 461.036,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_169:площадка",
          "maxX": 580.011,
          "maxZ": 498.623,
          "minX": 566.655,
          "minZ": 488.044,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_170:площадка",
          "maxX": 583.647,
          "maxZ": 527.16,
          "minX": 563.019,
          "minZ": 512.84,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_171:площадка",
          "maxX": 342.072,
          "maxZ": 579.451,
          "minX": 324.594,
          "minZ": 567.216,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_172:площадка",
          "maxX": 368.82,
          "maxZ": 580.372,
          "minX": 351.18,
          "minZ": 566.294,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_173:площадка",
          "maxX": 393.637,
          "maxZ": 578.641,
          "minX": 379.697,
          "minZ": 568.026,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_174:площадка",
          "maxX": 422.374,
          "maxZ": 579.652,
          "minX": 404.292,
          "minZ": 567.014,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_175:площадка",
          "maxX": 473.445,
          "maxZ": 581.681,
          "minX": 459.888,
          "minZ": 564.986,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_176:площадка",
          "maxX": 499.381,
          "maxZ": 580.134,
          "minX": 487.286,
          "minZ": 566.532,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_177:площадка",
          "maxX": 526.932,
          "maxZ": 578.765,
          "minX": 513.068,
          "minZ": 567.902,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_178:площадка",
          "maxX": 351.481,
          "maxZ": -571.312,
          "minX": 344.989,
          "minZ": -576.923,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_179:площадка",
          "maxX": 407.87,
          "maxZ": -570.791,
          "minX": 401.541,
          "minZ": -577.445,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_180:площадка",
          "maxX": 467.54,
          "maxZ": -571.24,
          "minX": 454.812,
          "minZ": -576.995,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_181:площадка",
          "maxX": 501.511,
          "maxZ": -571.164,
          "minX": 496.136,
          "minZ": -577.072,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_182:площадка",
          "maxX": 521.826,
          "maxZ": -569.909,
          "minX": 513.468,
          "minZ": -578.326,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_183:площадка",
          "maxX": 576.724,
          "maxZ": -514.59,
          "minX": 571.511,
          "minZ": -520.704,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_184:площадка",
          "maxX": 578.078,
          "maxZ": -475.824,
          "minX": 570.157,
          "minZ": -484.176,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_185:площадка",
          "maxX": 577.001,
          "maxZ": -438.11,
          "minX": 571.234,
          "minZ": -446.596,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_186:площадка",
          "maxX": 577.948,
          "maxZ": -420.452,
          "minX": 570.288,
          "minZ": -426.607,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_187:площадка",
          "maxX": 576.943,
          "maxZ": -381.767,
          "minX": 571.292,
          "minZ": -389.998,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_188:площадка",
          "maxX": 577.508,
          "maxZ": -344.901,
          "minX": 570.728,
          "minZ": -351.57,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_189:площадка",
          "maxX": 577.385,
          "maxZ": -325.502,
          "minX": 570.85,
          "minZ": -333.322,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_190:площадка",
          "maxX": -587.404,
          "maxZ": -384.45,
          "minX": -605.323,
          "minZ": -401.005,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_191:площадка",
          "maxX": -239.818,
          "maxZ": 548.883,
          "minX": -250.849,
          "minZ": 539.117,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_192:площадка",
          "maxX": 578.587,
          "maxZ": -531.709,
          "minX": 569.648,
          "minZ": -541.233,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_193:площадка",
          "maxX": 53.372,
          "maxZ": 574.433,
          "minX": 33.901,
          "minZ": 560.113,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_194:площадка",
          "maxX": -617.815,
          "maxZ": -559.479,
          "minX": -633.094,
          "minZ": -575.066,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_195:площадка",
          "maxX": 580.753,
          "maxZ": 553.663,
          "minX": 565.914,
          "minZ": 539.671,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_196:площадка",
          "maxX": 555.467,
          "maxZ": 578.676,
          "minX": 537.867,
          "minZ": 567.99,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_197:площадка",
          "maxX": 586.586,
          "maxZ": -244.508,
          "minX": 581.414,
          "minZ": -251.492,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_198:площадка",
          "maxX": 586.443,
          "maxZ": -180.555,
          "minX": 581.557,
          "minZ": -187.445,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_199:площадка",
          "maxX": 586.875,
          "maxZ": -133.457,
          "minX": 581.125,
          "minZ": -138.543,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_200:площадка",
          "maxX": 586.739,
          "maxZ": -6,
          "minX": 581.261,
          "minZ": -10,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_201:площадка",
          "maxX": -112.918,
          "maxZ": 548.755,
          "minX": -121.749,
          "minZ": 539.245,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_202:площадка",
          "maxX": -111.351,
          "maxZ": 569.729,
          "minX": -123.316,
          "minZ": 560.938,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_203:площадка",
          "maxX": -133.963,
          "maxZ": 612.233,
          "minX": -143.37,
          "minZ": 603.767,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_204:площадка",
          "maxX": -237.167,
          "maxZ": 570.809,
          "minX": -253.5,
          "minZ": 559.858,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_205:площадка",
          "maxX": -619.881,
          "maxZ": -386.669,
          "minX": -631.028,
          "minZ": -398.785,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_206:площадка",
          "maxX": 593.358,
          "maxZ": 36.271,
          "minX": 579.976,
          "minZ": 27.729,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_207:площадка",
          "maxX": 594.833,
          "maxZ": 58.437,
          "minX": 578.5,
          "minZ": 48.23,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_208:площадка",
          "maxX": 593.653,
          "maxZ": 122.14,
          "minX": 579.68,
          "minZ": 112.527,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_209:площадка",
          "maxX": 592.387,
          "maxZ": 164.262,
          "minX": 580.947,
          "minZ": 155.738,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_210:площадка",
          "maxX": 594.362,
          "maxZ": 206.667,
          "minX": 578.971,
          "minZ": 198.667,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_211:площадка",
          "maxX": 592.619,
          "maxZ": 229.041,
          "minX": 580.714,
          "minZ": 218.959,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_212:площадка",
          "maxX": -112.759,
          "maxZ": 591.038,
          "minX": -121.908,
          "minZ": 582.295,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_213:площадка",
          "maxX": -240.716,
          "maxZ": 591.18,
          "minX": -249.951,
          "minZ": 582.153,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_214:площадка",
          "maxX": -197.03,
          "maxZ": 633.268,
          "minX": -208.303,
          "minZ": 625.399,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_215:площадка",
          "maxX": 352.921,
          "maxZ": -588.08,
          "minX": 343.55,
          "minZ": -597.802,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_216:площадка",
          "maxX": 407.882,
          "maxZ": -589.845,
          "minX": 401.529,
          "minZ": -596.037,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_217:площадка",
          "maxX": 464.35,
          "maxZ": -588.789,
          "minX": 458.003,
          "minZ": -597.093,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_218:площадка",
          "maxX": 596.491,
          "maxZ": -514.646,
          "minX": 589.392,
          "minZ": -520.648,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_219:площадка",
          "maxX": 596.509,
          "maxZ": -438.521,
          "minX": 589.373,
          "minZ": -446.185,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_220:площадка",
          "maxX": 596.736,
          "maxZ": -344.223,
          "minX": 589.146,
          "minZ": -352.247,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_221:площадка",
          "maxX": 539.557,
          "maxZ": -588.785,
          "minX": 533.384,
          "minZ": -597.097,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_222:площадка",
          "maxX": 598.441,
          "maxZ": -533.45,
          "minX": 587.441,
          "minZ": -539.491,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_223:площадка",
          "maxX": 580.348,
          "maxZ": 577.897,
          "minX": 566.319,
          "minZ": 568.769,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_224:площадка",
          "maxX": -561.179,
          "maxZ": -589.983,
          "minX": -573.366,
          "minZ": -602.744,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_225:площадка",
          "maxX": -529.927,
          "maxZ": -590.451,
          "minX": -546.437,
          "minZ": -602.276,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_226:площадка",
          "maxX": -500.16,
          "maxZ": -590.246,
          "minX": -518.022,
          "minZ": -602.481,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_227:площадка",
          "maxX": -472.957,
          "maxZ": -590.059,
          "minX": -487.043,
          "minZ": -602.668,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_228:площадка",
          "maxX": -410.995,
          "maxZ": -587.897,
          "minX": -432.642,
          "minZ": -604.831,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_229:площадка",
          "maxX": -355.822,
          "maxZ": -587.644,
          "minX": -371.451,
          "minZ": -605.083,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_230:площадка",
          "maxX": -269.169,
          "maxZ": -590.78,
          "minX": -283.559,
          "minZ": -601.947,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_231:площадка",
          "maxX": -184.999,
          "maxZ": -591.112,
          "minX": -193.182,
          "minZ": -601.615,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_232:площадка",
          "maxX": -124.447,
          "maxZ": -589.544,
          "minX": -137.372,
          "minZ": -603.183,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_233:площадка",
          "maxX": -37.911,
          "maxZ": -588.301,
          "minX": -49.362,
          "minZ": -604.426,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_234:площадка",
          "maxX": 137.857,
          "maxZ": 604.184,
          "minX": 123.962,
          "minZ": 588.543,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_235:площадка",
          "maxX": 166.339,
          "maxZ": 603.075,
          "minX": 153.661,
          "minZ": 589.652,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_236:площадка",
          "maxX": 194.799,
          "maxZ": 601.591,
          "minX": 183.383,
          "minZ": 591.136,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_237:площадка",
          "maxX": 224.459,
          "maxZ": 603.68,
          "minX": 211.905,
          "minZ": 589.047,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_238:площадка",
          "maxX": 253.21,
          "maxZ": 601.412,
          "minX": 241.336,
          "minZ": 591.315,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_239:площадка",
          "maxX": 312.527,
          "maxZ": 602.086,
          "minX": 298.382,
          "minZ": 590.642,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_240:площадка",
          "maxX": 78.832,
          "maxZ": 602.955,
          "minX": 66.622,
          "minZ": 589.772,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_241:площадка",
          "maxX": 579.353,
          "maxZ": -569.645,
          "minX": 568.883,
          "minZ": -578.59,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_242:площадка",
          "maxX": 21.203,
          "maxZ": 573.912,
          "minX": 7.888,
          "minZ": 560.634,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_243:площадка",
          "maxX": -588.722,
          "maxZ": -354.135,
          "minX": -604.005,
          "minZ": -373.138,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_244:площадка",
          "maxX": 602,
          "maxZ": -261.445,
          "minX": 598,
          "minZ": -266.555,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_245:площадка",
          "maxX": 602,
          "maxZ": -197.842,
          "minX": 598,
          "minZ": -202.158,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_246:площадка",
          "maxX": 603.461,
          "maxZ": -165.19,
          "minX": 596.539,
          "minZ": -170.81,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_247:площадка",
          "maxX": 602.501,
          "maxZ": -132.532,
          "minX": 597.499,
          "minZ": -139.468,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_248:площадка",
          "maxX": 602.468,
          "maxZ": -101.083,
          "minX": 597.532,
          "minZ": -106.917,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_249:площадка",
          "maxX": 602.296,
          "maxZ": -37.455,
          "minX": 597.704,
          "minZ": -42.545,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_250:площадка",
          "maxX": -241.313,
          "maxZ": 612.431,
          "minX": -249.354,
          "minZ": 603.569,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_251:площадка",
          "maxX": -109.467,
          "maxZ": 611.603,
          "minX": -125.2,
          "minZ": 604.397,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_252:площадка",
          "maxX": 610.52,
          "maxZ": 474.716,
          "minX": 589.48,
          "minZ": 458.618,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_253:площадка",
          "maxX": 606.76,
          "maxZ": 502.243,
          "minX": 593.24,
          "minZ": 484.424,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_254:площадка",
          "maxX": 366.614,
          "maxZ": 607.003,
          "minX": 353.386,
          "minZ": 592.997,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_255:площадка",
          "maxX": 448.953,
          "maxZ": 605.894,
          "minX": 431.047,
          "minZ": 594.106,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_256:площадка",
          "maxX": 530.534,
          "maxZ": 606.383,
          "minX": 509.466,
          "minZ": 593.617,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_257:площадка",
          "maxX": 596.281,
          "maxZ": -552.088,
          "minX": 589.601,
          "minZ": -558.501,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_258:площадка",
          "maxX": -219.637,
          "maxZ": 633.123,
          "minX": -228.363,
          "minZ": 625.544,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_259:площадка",
          "maxX": 51.261,
          "maxZ": 602.95,
          "minX": 36.012,
          "minZ": 589.777,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_260:площадка",
          "maxX": -619.393,
          "maxZ": -589.425,
          "minX": -631.516,
          "minZ": -603.302,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_261:площадка",
          "maxX": 607.751,
          "maxZ": 552.646,
          "minX": 592.249,
          "minZ": 540.688,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_262:площадка",
          "maxX": -303.306,
          "maxZ": 548.446,
          "minX": -315.361,
          "minZ": 539.554,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_263:площадка",
          "maxX": -89.897,
          "maxZ": 548.942,
          "minX": -102.103,
          "minZ": 539.058,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_264:площадка",
          "maxX": 612.652,
          "maxZ": 78.258,
          "minX": 603.348,
          "minZ": 71.076,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_265:площадка",
          "maxX": 614.066,
          "maxZ": 100.508,
          "minX": 601.934,
          "minZ": 91.492,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_266:площадка",
          "maxX": 615.86,
          "maxZ": 229.428,
          "minX": 600.14,
          "minZ": 218.572,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_267:площадка",
          "maxX": 613.935,
          "maxZ": 291.862,
          "minX": 602.065,
          "minZ": 284.138,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_268:площадка",
          "maxX": 612.736,
          "maxZ": 313.335,
          "minX": 603.264,
          "minZ": 305.332,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_269:площадка",
          "maxX": -4.97,
          "maxZ": 549.375,
          "minX": -16.363,
          "minZ": 538.625,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_270:площадка",
          "maxX": -90.786,
          "maxZ": 592.238,
          "minX": -101.214,
          "minZ": 581.096,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_271:площадка",
          "maxX": -262.493,
          "maxZ": 590.127,
          "minX": -270.841,
          "minZ": 583.206,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_272:площадка",
          "maxX": -617.837,
          "maxZ": -357.304,
          "minX": -633.072,
          "minZ": -369.969,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_273:площадка",
          "maxX": 578.275,
          "maxZ": -589.405,
          "minX": 569.96,
          "minZ": -596.477,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_274:площадка",
          "maxX": 599.853,
          "maxZ": -570.343,
          "minX": 586.029,
          "minZ": -577.892,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_275:площадка",
          "maxX": 392.794,
          "maxZ": -608.273,
          "minX": 378.971,
          "minZ": -615.256,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_276:площадка",
          "maxX": 429.041,
          "maxZ": -608.773,
          "minX": 418.018,
          "minZ": -614.756,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_277:площадка",
          "maxX": 615.965,
          "maxZ": -495.606,
          "minX": 607.565,
          "minZ": -502.041,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_278:площадка",
          "maxX": 615.598,
          "maxZ": -475.376,
          "minX": 607.931,
          "minZ": -484.624,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_279:площадка",
          "maxX": 615.709,
          "maxZ": -418.329,
          "minX": 607.821,
          "minZ": -428.73,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_280:площадка",
          "maxX": 614.606,
          "maxZ": -381.906,
          "minX": 608.923,
          "minZ": -389.859,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_281:площадка",
          "maxX": 615.529,
          "maxZ": -344.658,
          "minX": 608,
          "minZ": -351.813,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_282:площадка",
          "maxX": 539.422,
          "maxZ": -608.695,
          "minX": 533.519,
          "minZ": -614.835,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_283:площадка",
          "maxX": -112.977,
          "maxZ": 633.752,
          "minX": -121.689,
          "minZ": 624.915,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_284:площадка",
          "maxX": -240.051,
          "maxZ": 635.263,
          "minX": -250.616,
          "minZ": 623.404,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_285:площадка",
          "maxX": 618.503,
          "maxZ": -277.215,
          "minX": 613.497,
          "minZ": -282.785,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_286:площадка",
          "maxX": 618.454,
          "maxZ": -196.717,
          "minX": 613.546,
          "minZ": -203.283,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_287:площадка",
          "maxX": 619.063,
          "maxZ": -133.75,
          "minX": 612.937,
          "minZ": -138.25,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_288:площадка",
          "maxX": 619.219,
          "maxZ": -21.599,
          "minX": 612.781,
          "minZ": -26.401,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_289:площадка",
          "maxX": 34.123,
          "maxZ": -608.355,
          "minX": 11.591,
          "minZ": -625.93,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_290:площадка",
          "maxX": 258.893,
          "maxZ": -607.295,
          "minX": 243.964,
          "minZ": -626.991,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_291:площадка",
          "maxX": 21.208,
          "maxZ": 602.47,
          "minX": 7.882,
          "minZ": 590.257,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_292:площадка",
          "maxX": -258.5,
          "maxZ": 611.881,
          "minX": -274.833,
          "minZ": 604.119,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_293:площадка",
          "maxX": -560.866,
          "maxZ": -618.358,
          "minX": -573.679,
          "minZ": -632.551,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_294:площадка",
          "maxX": -529.22,
          "maxZ": -619.745,
          "minX": -547.143,
          "minZ": -631.164,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_295:площадка",
          "maxX": -468.577,
          "maxZ": -616.695,
          "minX": -491.423,
          "minZ": -634.214,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_296:площадка",
          "maxX": -441.672,
          "maxZ": -618.309,
          "minX": -460.146,
          "minZ": -632.6,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_297:площадка",
          "maxX": -328.706,
          "maxZ": -618.505,
          "minX": -340.385,
          "minZ": -632.405,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_298:площадка",
          "maxX": -240.487,
          "maxZ": -620.151,
          "minX": -254.058,
          "minZ": -630.758,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_299:площадка",
          "maxX": -94.151,
          "maxZ": -620.7,
          "minX": -109.485,
          "minZ": -630.209,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_300:площадка",
          "maxX": 138.077,
          "maxZ": 631.048,
          "minX": 123.741,
          "minZ": 619.861,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_301:площадка",
          "maxX": 166.114,
          "maxZ": 632.646,
          "minX": 153.886,
          "minZ": 618.263,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_302:площадка",
          "maxX": 196.242,
          "maxZ": 631.916,
          "minX": 181.94,
          "minZ": 618.993,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_303:площадка",
          "maxX": 229.241,
          "maxZ": 631.64,
          "minX": 207.123,
          "minZ": 619.269,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_304:площадка",
          "maxX": 255.685,
          "maxZ": 631.454,
          "minX": 238.86,
          "minZ": 619.455,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_305:площадка",
          "maxX": 283.175,
          "maxZ": 632.422,
          "minX": 269.552,
          "minZ": 618.487,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_306:площадка",
          "maxX": -590.896,
          "maxZ": -619.385,
          "minX": -601.831,
          "minZ": -631.524,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_307:площадка",
          "maxX": 578.092,
          "maxZ": -608.289,
          "minX": 570.143,
          "minZ": -615.24,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_308:площадка",
          "maxX": 636.409,
          "maxZ": 341.1,
          "minX": 616.924,
          "minZ": 325.567,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_309:площадка",
          "maxX": 632.335,
          "maxZ": 446.642,
          "minX": 620.998,
          "minZ": 433.358,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_310:площадка",
          "maxX": 530.136,
          "maxZ": 632.548,
          "minX": 509.864,
          "minZ": 620.786,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_311:площадка",
          "maxX": 634.574,
          "maxZ": 208.428,
          "minX": 624.093,
          "minZ": 196.906,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_312:площадка",
          "maxX": 637.5,
          "maxZ": 251.061,
          "minX": 621.167,
          "minZ": 239.605,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_313:площадка",
          "maxX": 637.5,
          "maxZ": 271.482,
          "minX": 621.167,
          "minZ": 261.852,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_314:площадка",
          "maxX": 637.239,
          "maxZ": 292.001,
          "minX": 621.428,
          "minZ": 283.999,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_315:площадка",
          "maxX": 50.056,
          "maxZ": 631.072,
          "minX": 37.216,
          "minZ": 619.837,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_316:площадка",
          "maxX": 332.61,
          "maxZ": -626.767,
          "minX": 326.214,
          "minZ": -634.409,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_317:площадка",
          "maxX": 352.367,
          "maxZ": -627.162,
          "minX": 344.104,
          "minZ": -634.014,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_318:площадка",
          "maxX": 633.844,
          "maxZ": -400.102,
          "minX": 627.332,
          "minZ": -409.309,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_319:площадка",
          "maxX": 634.523,
          "maxZ": -37.421,
          "minX": 629.477,
          "minZ": -42.579,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_320:площадка",
          "maxX": 606.523,
          "maxZ": 605.235,
          "minX": 593.477,
          "minZ": 594.765,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_321:площадка",
          "maxX": -618.856,
          "maxZ": -327.551,
          "minX": -632.053,
          "minZ": -341.54,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_322:площадка",
          "maxX": -279.833,
          "maxZ": 611.979,
          "minX": -296.167,
          "minZ": 604.021,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_323:площадка",
          "maxX": 615.661,
          "maxZ": -588.899,
          "minX": 607.869,
          "minZ": -596.983,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_324:площадка",
          "maxX": 20.583,
          "maxZ": 630.284,
          "minX": 8.508,
          "minZ": 620.625,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_325:площадка",
          "maxX": -602.5,
          "maxZ": -290.112,
          "minX": -637.5,
          "minZ": -309.888,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_326:площадка",
          "maxX": 636.012,
          "maxZ": -589.9,
          "minX": 625.165,
          "minZ": -595.982,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_327:площадка",
          "maxX": -302.912,
          "maxZ": 611.892,
          "minX": -315.755,
          "minZ": 604.108,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_328:площадка",
          "maxX": -607.244,
          "maxZ": -249.124,
          "minX": -632.756,
          "minZ": -270.876,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_329:площадка",
          "maxX": -558.801,
          "maxZ": 626.66,
          "minX": -584.056,
          "minZ": 607.625,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_330:площадка",
          "maxX": -603.183,
          "maxZ": 400.506,
          "minX": -631.102,
          "minZ": 376.637,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_331:площадка",
          "maxX": -608.967,
          "maxZ": 579.398,
          "minX": -625.319,
          "minZ": 563.459,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_332:площадка",
          "maxX": -559.411,
          "maxZ": -504.432,
          "minX": -575.134,
          "minZ": -513.75,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_333:площадка",
          "maxX": -416.077,
          "maxZ": -532.45,
          "minX": -427.56,
          "minZ": -543.913,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_334:площадка",
          "maxX": -298.983,
          "maxZ": -532.498,
          "minX": -311.926,
          "minZ": -543.866,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_335:площадка",
          "maxX": -239.612,
          "maxZ": -531.412,
          "minX": -254.934,
          "minZ": -544.951,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_336:площадка",
          "maxX": -211.373,
          "maxZ": -532.749,
          "minX": -224.991,
          "minZ": -543.615,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_337:площадка",
          "maxX": -124.534,
          "maxZ": -532.965,
          "minX": -137.285,
          "minZ": -543.398,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_338:площадка",
          "maxX": -93.546,
          "maxZ": -532.268,
          "minX": -110.09,
          "minZ": -544.096,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_339:площадка",
          "maxX": -8.873,
          "maxZ": -532.209,
          "minX": -20.218,
          "minZ": -544.155,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_340:площадка",
          "maxX": 168.655,
          "maxZ": 544.904,
          "minX": 151.345,
          "minZ": 531.46,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_341:площадка",
          "maxX": 196.233,
          "maxZ": 545.791,
          "minX": 181.949,
          "minZ": 530.573,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_342:площадка",
          "maxX": 224.937,
          "maxZ": 543.881,
          "minX": 211.427,
          "minZ": 532.483,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_343:площадка",
          "maxX": 548.333,
          "maxZ": 58.389,
          "minX": 539.667,
          "minZ": 48.278,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_344:площадка",
          "maxX": 548.305,
          "maxZ": 99.658,
          "minX": 539.695,
          "minZ": 92.342,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_345:площадка",
          "maxX": 341.042,
          "maxZ": 554.119,
          "minX": 325.625,
          "minZ": 539.215,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_346:площадка",
          "maxX": 554.696,
          "maxZ": -180.824,
          "minX": 549.304,
          "minZ": -187.176,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_347:площадка",
          "maxX": 555.213,
          "maxZ": -165.797,
          "minX": 548.787,
          "minZ": -170.203,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_348:площадка",
          "maxX": 355.147,
          "maxZ": -551.296,
          "minX": 341.324,
          "minZ": -559.292,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_349:площадка",
          "maxX": 448.464,
          "maxZ": -552.476,
          "minX": 436.242,
          "minZ": -558.112,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_350:площадка",
          "maxX": 558.101,
          "maxZ": -514.544,
          "minX": 552.487,
          "minZ": -520.75,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_351:площадка",
          "maxX": 559.479,
          "maxZ": -495.066,
          "minX": 551.109,
          "minZ": -502.581,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_352:площадка",
          "maxX": 52.772,
          "maxZ": 543.434,
          "minX": 34.501,
          "minZ": 532.93,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_353:площадка",
          "maxX": -619.913,
          "maxZ": -532.822,
          "minX": -630.997,
          "minZ": -543.542,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_354:площадка",
          "maxX": -532.096,
          "maxZ": -327.208,
          "minX": -544.268,
          "minZ": -341.883,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_355:площадка",
          "maxX": -270.523,
          "maxZ": -561.112,
          "minX": -282.204,
          "minZ": -573.433,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_356:площадка",
          "maxX": -241.059,
          "maxZ": -558.424,
          "minX": -253.486,
          "minZ": -576.121,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_357:площадка",
          "maxX": -66.227,
          "maxZ": -560.649,
          "minX": -79.228,
          "minZ": -573.896,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_358:площадка",
          "maxX": 126.453,
          "maxZ": -562.842,
          "minX": 102.118,
          "minZ": -580.015,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_359:площадка",
          "maxX": 259.475,
          "maxZ": -560.779,
          "minX": 243.382,
          "minZ": -582.078,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_360:площадка",
          "maxX": 332.937,
          "maxZ": -569.753,
          "minX": 325.887,
          "minZ": -578.482,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_361:площадка",
          "maxX": 577.049,
          "maxZ": -495.545,
          "minX": 571.186,
          "minZ": -502.102,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_362:площадка",
          "maxX": 577.533,
          "maxZ": -458.005,
          "minX": 570.702,
          "minZ": -464.348,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_363:площадка",
          "maxX": 577.646,
          "maxZ": -363.493,
          "minX": 570.59,
          "minZ": -370.625,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_364:площадка",
          "maxX": 20.014,
          "maxZ": 543.667,
          "minX": 9.077,
          "minZ": 532.697,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_365:площадка",
          "maxX": 587.31,
          "maxZ": -101.344,
          "minX": 580.69,
          "minZ": -106.656,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_366:площадка",
          "maxX": 558.076,
          "maxZ": -570.867,
          "minX": 552.512,
          "minZ": -577.369,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_367:площадка",
          "maxX": 593.484,
          "maxZ": 78.574,
          "minX": 579.849,
          "minZ": 70.759,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_368:площадка",
          "maxX": 592.755,
          "maxZ": 250.015,
          "minX": 580.578,
          "minZ": 240.652,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_369:площадка",
          "maxX": 446.202,
          "maxZ": -589.381,
          "minX": 438.503,
          "minZ": -596.502,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_370:площадка",
          "maxX": 596.907,
          "maxZ": -380.753,
          "minX": 588.975,
          "minZ": -391.012,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_371:площадка",
          "maxX": -443.414,
          "maxZ": -590.077,
          "minX": -458.404,
          "minZ": -602.65,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_372:площадка",
          "maxX": -241.275,
          "maxZ": -591.105,
          "minX": -253.271,
          "minZ": -601.622,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_373:площадка",
          "maxX": -97.109,
          "maxZ": -590.653,
          "minX": -106.527,
          "minZ": -602.075,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_374:площадка",
          "maxX": 108.217,
          "maxZ": 603.469,
          "minX": 95.419,
          "minZ": 589.258,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_375:площадка",
          "maxX": 284.295,
          "maxZ": 603.039,
          "minX": 268.432,
          "minZ": 589.689,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_376:площадка",
          "maxX": 603.023,
          "maxZ": -293.318,
          "minX": 596.977,
          "minZ": -298.682,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_377:площадка",
          "maxX": 602.998,
          "maxZ": -277.597,
          "minX": 597.002,
          "minZ": -282.403,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_378:площадка",
          "maxX": 602.838,
          "maxZ": -20.88,
          "minX": 597.162,
          "minZ": -27.12,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_379:площадка",
          "maxX": 610.512,
          "maxZ": 366.437,
          "minX": 589.488,
          "minZ": 353.563,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_380:площадка",
          "maxX": 341.215,
          "maxZ": 607.975,
          "minX": 325.452,
          "minZ": 592.025,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_381:площадка",
          "maxX": 473.024,
          "maxZ": 604.703,
          "minX": 460.31,
          "minZ": 595.297,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_382:площадка",
          "maxX": 614.373,
          "maxZ": 15.229,
          "minX": 601.627,
          "minZ": 6.105,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_383:площадка",
          "maxX": 612.13,
          "maxZ": 143.247,
          "minX": 603.87,
          "minZ": 134.087,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_384:площадка",
          "maxX": 370.952,
          "maxZ": -608.125,
          "minX": 363.166,
          "minZ": -615.405,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_385:площадка",
          "maxX": 465.315,
          "maxZ": -608.527,
          "minX": 457.038,
          "minZ": -615.002,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_386:площадка",
          "maxX": 502.034,
          "maxZ": -608.638,
          "minX": 495.613,
          "minZ": -614.891,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_387:площадка",
          "maxX": 618.419,
          "maxZ": -229.937,
          "minX": 613.581,
          "minZ": -234.063,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_388:площадка",
          "maxX": 619.171,
          "maxZ": -213.703,
          "minX": 612.829,
          "minZ": -218.297,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_389:площадка",
          "maxX": 618.262,
          "maxZ": -181.589,
          "minX": 613.738,
          "minZ": -186.411,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_390:площадка",
          "maxX": -564.912,
          "maxZ": -290.426,
          "minX": -595.088,
          "minZ": -309.574,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_391:площадка",
          "maxX": 168.596,
          "maxZ": -609.077,
          "minX": 151.404,
          "minZ": -625.209,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_392:площадка",
          "maxX": 305.903,
          "maxZ": -607.831,
          "minX": 288.382,
          "minZ": -626.455,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_393:площадка",
          "maxX": -385.634,
          "maxZ": -620.135,
          "minX": -399.82,
          "minZ": -630.774,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_394:площадка",
          "maxX": -153.42,
          "maxZ": -619.137,
          "minX": -166.58,
          "minZ": -631.773,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_395:площадка",
          "maxX": -125.45,
          "maxZ": -620.879,
          "minX": -136.368,
          "minZ": -630.03,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_396:площадка",
          "maxX": 108.823,
          "maxZ": 631.187,
          "minX": 94.813,
          "minZ": 619.722,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_397:площадка",
          "maxX": 637.395,
          "maxZ": 474.482,
          "minX": 615.939,
          "minZ": 458.852,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_398:площадка",
          "maxX": 421.255,
          "maxZ": 632.653,
          "minX": 405.412,
          "minZ": 620.681,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_399:площадка",
          "maxX": 474.027,
          "maxZ": 632.327,
          "minX": 459.307,
          "minZ": 621.007,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_400:площадка",
          "maxX": -283.541,
          "maxZ": 590.748,
          "minX": -292.459,
          "minZ": 582.585,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_1_401:площадка",
          "maxX": -20.982,
          "maxZ": -20.42,
          "minX": -32.351,
          "minZ": -32.914,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_1_402:площадка",
          "maxX": 16.771,
          "maxZ": -189.934,
          "minX": 6.086,
          "minZ": -198.637,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_403:площадка",
          "maxX": -335.448,
          "maxZ": 25.4,
          "minX": -344.552,
          "minZ": 14.6,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_2_404:площадка",
          "maxX": -13.302,
          "maxZ": 30.498,
          "minX": -32.412,
          "minZ": 15.216,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_2_405:площадка",
          "maxX": 311.956,
          "maxZ": 20.744,
          "minX": 298.953,
          "minZ": 8.347,
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
