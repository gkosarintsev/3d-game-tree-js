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
          "buildings": 83,
          "lights": 2,
          "props": 169,
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
          "buildings": 47,
          "lights": 3,
          "props": 114,
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
          "buildings": 142,
          "lights": 1,
          "props": 224,
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
          "buildings": 131,
          "lights": 3,
          "props": 151,
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
          "maxX": 540.095,
          "maxZ": -308.873,
          "minX": 531.905,
          "minZ": -315.127,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_2:площадка",
          "maxX": 539.535,
          "maxZ": -293.45,
          "minX": 532.465,
          "minZ": -298.55,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_3:площадка",
          "maxX": 539.184,
          "maxZ": -276.158,
          "minX": 532.816,
          "minZ": -283.842,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_4:площадка",
          "maxX": 538.41,
          "maxZ": -261.818,
          "minX": 533.59,
          "minZ": -266.182,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_5:площадка",
          "maxX": 539.884,
          "maxZ": -245.071,
          "minX": 532.116,
          "minZ": -250.929,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_6:площадка",
          "maxX": 539.919,
          "maxZ": -228.52,
          "minX": 532.081,
          "minZ": -235.48,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_7:площадка",
          "maxX": 539.367,
          "maxZ": -196.939,
          "minX": 532.633,
          "minZ": -203.061,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_8:площадка",
          "maxX": 539.738,
          "maxZ": -181.153,
          "minX": 532.262,
          "minZ": -186.847,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_9:площадка",
          "maxX": 538.468,
          "maxZ": -164.866,
          "minX": 533.532,
          "minZ": -171.134,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_10:площадка",
          "maxX": 539.597,
          "maxZ": -148.415,
          "minX": 532.403,
          "minZ": -155.585,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_11:площадка",
          "maxX": 538.132,
          "maxZ": -133.138,
          "minX": 533.868,
          "minZ": -138.862,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_12:площадка",
          "maxX": 538.365,
          "maxZ": -85.982,
          "minX": 533.635,
          "minZ": -90.018,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_13:площадка",
          "maxX": 539.774,
          "maxZ": -68.797,
          "minX": 532.226,
          "minZ": -75.203,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_14:площадка",
          "maxX": 538.793,
          "maxZ": -52.81,
          "minX": 533.207,
          "minZ": -59.19,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_15:площадка",
          "maxX": 539.264,
          "maxZ": -36.101,
          "minX": 532.736,
          "minZ": -43.899,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_16:площадка",
          "maxX": 334.96,
          "maxZ": -533.043,
          "minX": 323.863,
          "minZ": -539.899,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_17:площадка",
          "maxX": 352.081,
          "maxZ": -531.705,
          "minX": 344.39,
          "minZ": -541.236,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_18:площадка",
          "maxX": 373.14,
          "maxZ": -532.81,
          "minX": 360.978,
          "minZ": -540.131,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_19:площадка",
          "maxX": 390.245,
          "maxZ": -532.552,
          "minX": 381.52,
          "minZ": -540.389,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_20:площадка",
          "maxX": 410.072,
          "maxZ": -533.758,
          "minX": 399.34,
          "minZ": -539.183,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_21:площадка",
          "maxX": 428.332,
          "maxZ": -531.504,
          "minX": 418.727,
          "minZ": -541.438,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_22:площадка",
          "maxX": 446.303,
          "maxZ": -532.821,
          "minX": 438.403,
          "minZ": -540.12,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_23:площадка",
          "maxX": 466.466,
          "maxZ": -532.761,
          "minX": 455.887,
          "minZ": -540.18,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_24:площадка",
          "maxX": 521.709,
          "maxZ": -533.074,
          "minX": 513.586,
          "minZ": -539.867,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_25:площадка",
          "maxX": 540.05,
          "maxZ": -512.662,
          "minX": 532.891,
          "minZ": -522.632,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_26:площадка",
          "maxX": 539.806,
          "maxZ": -474.806,
          "minX": 533.135,
          "minZ": -485.194,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_27:площадка",
          "maxX": 540.972,
          "maxZ": -456.359,
          "minX": 531.969,
          "minZ": -465.994,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_28:площадка",
          "maxX": 542.748,
          "maxZ": -438.957,
          "minX": 530.193,
          "minZ": -445.749,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_29:площадка",
          "maxX": 540.101,
          "maxZ": -418.555,
          "minX": 532.84,
          "minZ": -428.504,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_30:площадка",
          "maxX": 539.876,
          "maxZ": -400.81,
          "minX": 533.065,
          "minZ": -408.602,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_31:площадка",
          "maxX": 539.676,
          "maxZ": -381.839,
          "minX": 533.265,
          "minZ": -389.926,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_32:площадка",
          "maxX": 539.203,
          "maxZ": -363.109,
          "minX": 533.738,
          "minZ": -371.009,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_33:площадка",
          "maxX": 539.355,
          "maxZ": -343.025,
          "minX": 533.587,
          "minZ": -353.446,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_34:площадка",
          "maxX": 540.516,
          "maxZ": -324.064,
          "minX": 532.425,
          "minZ": -334.759,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_35:площадка",
          "maxX": -561.052,
          "maxZ": -532.55,
          "minX": -573.494,
          "minZ": -543.813,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_36:площадка",
          "maxX": -474.347,
          "maxZ": -531.06,
          "minX": -485.653,
          "minZ": -545.304,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_37:площадка",
          "maxX": -445.263,
          "maxZ": -531.746,
          "minX": -456.555,
          "minZ": -544.617,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_38:площадка",
          "maxX": -414.698,
          "maxZ": -530.864,
          "minX": -428.938,
          "minZ": -545.499,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_39:площадка",
          "maxX": -386.052,
          "maxZ": -532.138,
          "minX": -399.402,
          "minZ": -544.226,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_40:площадка",
          "maxX": -355.666,
          "maxZ": -531.499,
          "minX": -371.606,
          "minZ": -544.864,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_41:площадка",
          "maxX": -328.278,
          "maxZ": -530.357,
          "minX": -340.813,
          "minZ": -546.006,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_42:площадка",
          "maxX": -531.242,
          "maxZ": -386.174,
          "minX": -545.121,
          "minZ": -399.28,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_43:площадка",
          "maxX": -296.555,
          "maxZ": -530.777,
          "minX": -314.354,
          "minZ": -545.587,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_44:площадка",
          "maxX": -210.346,
          "maxZ": -531.93,
          "minX": -226.018,
          "minZ": -544.433,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_45:площадка",
          "maxX": -180.973,
          "maxZ": -530.598,
          "minX": -197.209,
          "minZ": -545.766,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_46:площадка",
          "maxX": -153.305,
          "maxZ": -532.17,
          "minX": -166.695,
          "minZ": -544.193,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_47:площадка",
          "maxX": -124.2,
          "maxZ": -531.366,
          "minX": -137.618,
          "minZ": -544.997,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_48:площадка",
          "maxX": -95.746,
          "maxZ": -532.511,
          "minX": -107.89,
          "minZ": -543.853,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_49:площадка",
          "maxX": -67.336,
          "maxZ": -532.473,
          "minX": -78.119,
          "minZ": -543.891,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_50:площадка",
          "maxX": 136.164,
          "maxZ": 542.687,
          "minX": 125.654,
          "minZ": 533.677,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_51:площадка",
          "maxX": 165.4,
          "maxZ": 542.902,
          "minX": 154.6,
          "minZ": 533.462,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_52:площадка",
          "maxX": 198.178,
          "maxZ": 544.303,
          "minX": 180.004,
          "minZ": 532.061,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_53:площадка",
          "maxX": 226.003,
          "maxZ": 545.458,
          "minX": 210.36,
          "minZ": 530.905,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_54:площадка",
          "maxX": 256.837,
          "maxZ": 545.095,
          "minX": 237.708,
          "minZ": 531.268,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_55:площадка",
          "maxX": 281.574,
          "maxZ": 544.321,
          "minX": 271.153,
          "minZ": 532.043,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_56:площадка",
          "maxX": 311.277,
          "maxZ": 543.997,
          "minX": 299.632,
          "minZ": 532.367,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_57:площадка",
          "maxX": 77.223,
          "maxZ": 543.705,
          "minX": 68.232,
          "minZ": 532.659,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_58:площадка",
          "maxX": -588.259,
          "maxZ": -531.162,
          "minX": -604.468,
          "minZ": -545.201,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_59:площадка",
          "maxX": -154.968,
          "maxZ": 549.897,
          "minX": -165.032,
          "minZ": 538.103,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_60:площадка",
          "maxX": -198.2,
          "maxZ": 547.88,
          "minX": -207.134,
          "minZ": 540.12,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_61:площадка",
          "maxX": -198.313,
          "maxZ": 570.33,
          "minX": -207.02,
          "minZ": 560.337,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_62:площадка",
          "maxX": -153.895,
          "maxZ": 570.499,
          "minX": -166.105,
          "minZ": 560.168,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_63:площадка",
          "maxX": 549.539,
          "maxZ": 14.999,
          "minX": 538.461,
          "minZ": 6.334,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_64:площадка",
          "maxX": 549.274,
          "maxZ": 58.825,
          "minX": 538.726,
          "minZ": 47.842,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_65:площадка",
          "maxX": 549.567,
          "maxZ": 101.429,
          "minX": 538.433,
          "minZ": 90.571,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_66:площадка",
          "maxX": 551.361,
          "maxZ": 122.239,
          "minX": 536.639,
          "minZ": 112.428,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_67:площадка",
          "maxX": 548.365,
          "maxZ": 142.654,
          "minX": 539.635,
          "minZ": 134.679,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_68:площадка",
          "maxX": 549.182,
          "maxZ": 164.985,
          "minX": 538.818,
          "minZ": 155.015,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_69:площадка",
          "maxX": 550.55,
          "maxZ": 185.789,
          "minX": 537.45,
          "minZ": 176.878,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_70:площадка",
          "maxX": 550.928,
          "maxZ": 206.805,
          "minX": 537.072,
          "minZ": 198.528,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_71:площадка",
          "maxX": 548.706,
          "maxZ": 249.632,
          "minX": 539.294,
          "minZ": 241.034,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_72:площадка",
          "maxX": 549.204,
          "maxZ": 270.156,
          "minX": 538.796,
          "minZ": 263.177,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_73:площадка",
          "maxX": 550.569,
          "maxZ": 291.891,
          "minX": 537.431,
          "minZ": 284.109,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_74:площадка",
          "maxX": -560.928,
          "maxZ": -473.092,
          "minX": -573.617,
          "minZ": -486.908,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_75:площадка",
          "maxX": -558.917,
          "maxZ": -415.231,
          "minX": -575.629,
          "minZ": -428.405,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_76:площадка",
          "maxX": -590.703,
          "maxZ": -414.599,
          "minX": -602.024,
          "minZ": -429.037,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_77:площадка",
          "maxX": -174.28,
          "maxZ": 591.561,
          "minX": -188.387,
          "minZ": 581.772,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_78:площадка",
          "maxX": 557.097,
          "maxZ": 392.972,
          "minX": 536.237,
          "minZ": 380.361,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_79:площадка",
          "maxX": 554.834,
          "maxZ": 420.28,
          "minX": 538.499,
          "minZ": 406.386,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_80:площадка",
          "maxX": 552.631,
          "maxZ": 445.702,
          "minX": 540.702,
          "minZ": 434.298,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_81:площадка",
          "maxX": 553.223,
          "maxZ": 474.692,
          "minX": 540.111,
          "minZ": 458.642,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_82:площадка",
          "maxX": 557.5,
          "maxZ": 499.591,
          "minX": 535.833,
          "minZ": 487.075,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_83:площадка",
          "maxX": 554.097,
          "maxZ": 525.935,
          "minX": 539.237,
          "minZ": 514.065,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_84:площадка",
          "maxX": 344.167,
          "maxZ": 552.732,
          "minX": 322.5,
          "minZ": 540.601,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_85:площадка",
          "maxX": 367.924,
          "maxZ": 554.781,
          "minX": 352.076,
          "minZ": 538.552,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_86:площадка",
          "maxX": 397.058,
          "maxZ": 553.171,
          "minX": 376.275,
          "minZ": 540.163,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_87:площадка",
          "maxX": 422.921,
          "maxZ": 552.988,
          "minX": 403.746,
          "minZ": 540.345,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_88:площадка",
          "maxX": 527.52,
          "maxZ": 553.477,
          "minX": 512.48,
          "minZ": 539.856,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_89:площадка",
          "maxX": -531.572,
          "maxZ": -473.29,
          "minX": -544.791,
          "minZ": -486.71,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_90:площадка",
          "maxX": 554.874,
          "maxZ": -310,
          "minX": 549.126,
          "minZ": -314,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_91:площадка",
          "maxX": 554.791,
          "maxZ": -292.65,
          "minX": 549.209,
          "minZ": -299.35,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_92:площадка",
          "maxX": 554.559,
          "maxZ": -260.681,
          "minX": 549.441,
          "minZ": -267.319,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_93:площадка",
          "maxX": 554.439,
          "maxZ": -245.34,
          "minX": 549.561,
          "minZ": -250.66,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_94:площадка",
          "maxX": 555.167,
          "maxZ": -228.134,
          "minX": 548.833,
          "minZ": -235.866,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_95:площадка",
          "maxX": 554,
          "maxZ": -213.76,
          "minX": 550,
          "minZ": -218.24,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_96:площадка",
          "maxX": 554,
          "maxZ": -181.633,
          "minX": 550,
          "minZ": -186.367,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_97:площадка",
          "maxX": 555.493,
          "maxZ": -165.307,
          "minX": 548.507,
          "minZ": -170.693,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_98:площадка",
          "maxX": 555.372,
          "maxZ": -148.578,
          "minX": 548.628,
          "minZ": -155.422,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_99:площадка",
          "maxX": 555.491,
          "maxZ": -116.428,
          "minX": 548.509,
          "minZ": -123.572,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_100:площадка",
          "maxX": 554.231,
          "maxZ": -101.455,
          "minX": 549.769,
          "minZ": -106.545,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_101:площадка",
          "maxX": 555.36,
          "maxZ": -85.545,
          "minX": 548.64,
          "minZ": -90.455,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_102:площадка",
          "maxX": 555.083,
          "maxZ": -53.694,
          "minX": 548.917,
          "minZ": -58.306,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_103:площадка",
          "maxX": 555.133,
          "maxZ": -20.235,
          "minX": 548.867,
          "minZ": -27.765,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_104:площадка",
          "maxX": -618.763,
          "maxZ": -503.258,
          "minX": -632.147,
          "minZ": -514.923,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_105:площадка",
          "maxX": -619.741,
          "maxZ": -474.6,
          "minX": -631.168,
          "minZ": -485.4,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_106:площадка",
          "maxX": -618.036,
          "maxZ": -444.793,
          "minX": -632.873,
          "minZ": -457.025,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_107:площадка",
          "maxX": -155.83,
          "maxZ": 590.58,
          "minX": -164.17,
          "minZ": 582.753,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_108:площадка",
          "maxX": 352.482,
          "maxZ": -551.549,
          "minX": 343.988,
          "minZ": -559.039,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_109:площадка",
          "maxX": 391.626,
          "maxZ": -552.445,
          "minX": 380.139,
          "minZ": -558.144,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_110:площадка",
          "maxX": 407.292,
          "maxZ": -551.662,
          "minX": 402.119,
          "minZ": -558.926,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_111:площадка",
          "maxX": 561.405,
          "maxZ": -513.538,
          "minX": 549.183,
          "minZ": -521.756,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_112:площадка",
          "maxX": 557.811,
          "maxZ": -437.909,
          "minX": 552.777,
          "minZ": -446.797,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_113:площадка",
          "maxX": 557.884,
          "maxZ": -363.239,
          "minX": 552.704,
          "minZ": -370.879,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_114:площадка",
          "maxX": 560.461,
          "maxZ": -343.714,
          "minX": 550.127,
          "minZ": -352.757,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_115:площадка",
          "maxX": 558.771,
          "maxZ": -325.546,
          "minX": 551.817,
          "minZ": -333.277,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_116:площадка",
          "maxX": 48.514,
          "maxZ": 543.836,
          "minX": 38.759,
          "minZ": 532.528,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_117:площадка",
          "maxX": -617.548,
          "maxZ": -532.099,
          "minX": -633.361,
          "minZ": -544.264,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_118:площадка",
          "maxX": 562.151,
          "maxZ": -532.459,
          "minX": 548.437,
          "minZ": -540.482,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_119:площадка",
          "maxX": -217.112,
          "maxZ": 569.2,
          "minX": -230.888,
          "minZ": 561.466,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_120:площадка",
          "maxX": -533.155,
          "maxZ": -327.693,
          "minX": -543.209,
          "minZ": -341.398,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_121:площадка",
          "maxX": 570.186,
          "maxZ": 57.09,
          "minX": 560.48,
          "minZ": 49.577,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_122:площадка",
          "maxX": 570.088,
          "maxZ": 101.557,
          "minX": 560.579,
          "minZ": 90.443,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_123:площадка",
          "maxX": 569.881,
          "maxZ": 122.168,
          "minX": 560.785,
          "minZ": 112.499,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_124:площадка",
          "maxX": 569.754,
          "maxZ": 141.858,
          "minX": 560.913,
          "minZ": 135.475,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_125:площадка",
          "maxX": 570.516,
          "maxZ": 164.78,
          "minX": 560.151,
          "minZ": 155.22,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_126:площадка",
          "maxX": 573.5,
          "maxZ": 186.268,
          "minX": 557.167,
          "minZ": 176.399,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_127:площадка",
          "maxX": 570.587,
          "maxZ": 206.783,
          "minX": 560.08,
          "minZ": 198.55,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_128:площадка",
          "maxX": 572.927,
          "maxZ": 229.057,
          "minX": 557.74,
          "minZ": 218.943,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_129:площадка",
          "maxX": 571.639,
          "maxZ": 313.979,
          "minX": 559.027,
          "minZ": 304.687,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_130:площадка",
          "maxX": -560.566,
          "maxZ": -560.638,
          "minX": -573.979,
          "minZ": -573.907,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_131:площадка",
          "maxX": -531.188,
          "maxZ": -561.563,
          "minX": -545.175,
          "minZ": -572.982,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_132:площадка",
          "maxX": -503.073,
          "maxZ": -561.183,
          "minX": -515.109,
          "minZ": -573.363,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_133:площадка",
          "maxX": -474.354,
          "maxZ": -561.02,
          "minX": -485.646,
          "minZ": -573.526,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_134:площадка",
          "maxX": -442.498,
          "maxZ": -559.375,
          "minX": -459.32,
          "minZ": -575.171,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_135:площадка",
          "maxX": -415.277,
          "maxZ": -560.624,
          "minX": -428.359,
          "minZ": -573.922,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_136:площадка",
          "maxX": -387.377,
          "maxZ": -560.526,
          "minX": -398.077,
          "minZ": -574.02,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_137:площадка",
          "maxX": -355.406,
          "maxZ": -560.598,
          "minX": -371.866,
          "minZ": -573.948,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_138:площадка",
          "maxX": -327.088,
          "maxZ": -561.316,
          "minX": -342.003,
          "minZ": -573.23,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_139:площадка",
          "maxX": -558.115,
          "maxZ": -385.685,
          "minX": -576.431,
          "minZ": -399.769,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_140:площадка",
          "maxX": -242.12,
          "maxZ": -558.175,
          "minX": -252.426,
          "minZ": -576.37,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_141:площадка",
          "maxX": -155.891,
          "maxZ": -560.861,
          "minX": -164.109,
          "minZ": -573.684,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_142:площадка",
          "maxX": -124.348,
          "maxZ": -561.834,
          "minX": -137.47,
          "minZ": -572.712,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_143:площадка",
          "maxX": -35.005,
          "maxZ": -560.128,
          "minX": -52.267,
          "minZ": -574.417,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_144:площадка",
          "maxX": -7.154,
          "maxZ": -558.589,
          "minX": -21.937,
          "minZ": -575.957,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_145:площадка",
          "maxX": 107.491,
          "maxZ": 572.525,
          "minX": 96.146,
          "minZ": 562.02,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_146:площадка",
          "maxX": 138.293,
          "maxZ": 575.149,
          "minX": 123.525,
          "minZ": 559.397,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_147:площадка",
          "maxX": 167.455,
          "maxZ": 573.273,
          "minX": 152.545,
          "minZ": 561.272,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_148:площадка",
          "maxX": 195,
          "maxZ": 572.013,
          "minX": 183.182,
          "minZ": 562.532,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_149:площадка",
          "maxX": 224.342,
          "maxZ": 573.818,
          "minX": 212.021,
          "minZ": 560.728,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_150:площадка",
          "maxX": 254.328,
          "maxZ": 573.593,
          "minX": 240.218,
          "minZ": 560.952,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_151:площадка",
          "maxX": 314.262,
          "maxZ": 573.508,
          "minX": 296.647,
          "minZ": 561.038,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_152:площадка",
          "maxX": 80.62,
          "maxZ": 573.29,
          "minX": 64.834,
          "minZ": 561.256,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_153:площадка",
          "maxX": -590.989,
          "maxZ": -560.004,
          "minX": -601.739,
          "minZ": -574.542,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_154:площадка",
          "maxX": 570,
          "maxZ": -293.317,
          "minX": 566,
          "minZ": -298.683,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_155:площадка",
          "maxX": 571.057,
          "maxZ": -277.722,
          "minX": 564.943,
          "minZ": -282.278,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_156:площадка",
          "maxX": 570.815,
          "maxZ": -244.508,
          "minX": 565.185,
          "minZ": -251.492,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_157:площадка",
          "maxX": 570.548,
          "maxZ": -230,
          "minX": 565.452,
          "minZ": -234,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_158:площадка",
          "maxX": 570.656,
          "maxZ": -212.757,
          "minX": 565.344,
          "minZ": -219.243,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_159:площадка",
          "maxX": 570.87,
          "maxZ": -181.178,
          "minX": 565.13,
          "minZ": -186.822,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_160:площадка",
          "maxX": 571.725,
          "maxZ": -148.532,
          "minX": 564.275,
          "minZ": -155.468,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_161:площадка",
          "maxX": 571.273,
          "maxZ": -85.598,
          "minX": 564.727,
          "minZ": -90.402,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_162:площадка",
          "maxX": 571.203,
          "maxZ": -21.319,
          "minX": 564.797,
          "minZ": -26.681,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_163:площадка",
          "maxX": 561.694,
          "maxZ": -552.252,
          "minX": 548.894,
          "minZ": -558.336,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_164:площадка",
          "maxX": -134.628,
          "maxZ": 591.396,
          "minX": -142.705,
          "minZ": 581.938,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_165:площадка",
          "maxX": 215.969,
          "maxZ": -563.081,
          "minX": 195.459,
          "minZ": -579.776,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_166:площадка",
          "maxX": -196.419,
          "maxZ": 613.479,
          "minX": -208.914,
          "minZ": 602.521,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_167:площадка",
          "maxX": -153.696,
          "maxZ": 611.64,
          "minX": -166.304,
          "minZ": 604.36,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_168:площадка",
          "maxX": 578.883,
          "maxZ": 367.265,
          "minX": 567.784,
          "minZ": 352.735,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_169:площадка",
          "maxX": 582.582,
          "maxZ": 392.9,
          "minX": 564.084,
          "minZ": 380.433,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_170:площадка",
          "maxX": 584.167,
          "maxZ": 418.591,
          "minX": 562.5,
          "minZ": 408.076,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_171:площадка",
          "maxX": 583.426,
          "maxZ": 498.818,
          "minX": 563.24,
          "minZ": 487.849,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_172:площадка",
          "maxX": 579.237,
          "maxZ": 526.045,
          "minX": 567.43,
          "minZ": 513.955,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_173:площадка",
          "maxX": 340.016,
          "maxZ": 580.407,
          "minX": 326.651,
          "minZ": 566.259,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_174:площадка",
          "maxX": 368.541,
          "maxZ": 579.325,
          "minX": 351.459,
          "minZ": 567.342,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_175:площадка",
          "maxX": 423.472,
          "maxZ": 579.179,
          "minX": 403.194,
          "minZ": 567.488,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_176:площадка",
          "maxX": 472.878,
          "maxZ": 580.279,
          "minX": 460.456,
          "minZ": 566.387,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_177:площадка",
          "maxX": 504.167,
          "maxZ": 579.876,
          "minX": 482.5,
          "minZ": 566.791,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_178:площадка",
          "maxX": 351.609,
          "maxZ": -568.898,
          "minX": 344.861,
          "minZ": -579.337,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_179:площадка",
          "maxX": 409.04,
          "maxZ": -570.144,
          "minX": 400.372,
          "minZ": -578.091,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_180:площадка",
          "maxX": 449.265,
          "maxZ": -570.134,
          "minX": 435.441,
          "minZ": -578.102,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_181:площадка",
          "maxX": 463.554,
          "maxZ": -570.036,
          "minX": 458.799,
          "minZ": -578.199,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_182:площадка",
          "maxX": 482.919,
          "maxZ": -570.966,
          "minX": 477.081,
          "minZ": -577.27,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_183:площадка",
          "maxX": 579.044,
          "maxZ": -513.238,
          "minX": 569.191,
          "minZ": -522.056,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_184:площадка",
          "maxX": 578.357,
          "maxZ": -401.079,
          "minX": 569.878,
          "minZ": -408.332,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_185:площадка",
          "maxX": 577.672,
          "maxZ": -362.518,
          "minX": 570.563,
          "minZ": -371.6,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_186:площадка",
          "maxX": -237.167,
          "maxZ": 548.767,
          "minX": -253.5,
          "minZ": 539.233,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_187:площадка",
          "maxX": 51.356,
          "maxZ": 572.664,
          "minX": 35.917,
          "minZ": 561.881,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_188:площадка",
          "maxX": 581.844,
          "maxZ": 555.151,
          "minX": 564.823,
          "minZ": 538.183,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_189:площадка",
          "maxX": 556.843,
          "maxZ": 579.586,
          "minX": 536.49,
          "minZ": 567.081,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_190:площадка",
          "maxX": -262.482,
          "maxZ": 547.408,
          "minX": -270.851,
          "minZ": 540.592,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_191:площадка",
          "maxX": -561.209,
          "maxZ": -328.706,
          "minX": -573.337,
          "minZ": -340.385,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_192:площадка",
          "maxX": 21.846,
          "maxZ": 543.515,
          "minX": 7.245,
          "minZ": 532.849,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_193:площадка",
          "maxX": 586.825,
          "maxZ": -309.507,
          "minX": 581.175,
          "minZ": -314.493,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_194:площадка",
          "maxX": 586.862,
          "maxZ": -260.736,
          "minX": 581.138,
          "minZ": -267.264,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_195:площадка",
          "maxX": 587.82,
          "maxZ": -228.659,
          "minX": 580.18,
          "minZ": -235.341,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_196:площадка",
          "maxX": 587.779,
          "maxZ": -212.857,
          "minX": 580.221,
          "minZ": -219.143,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_197:площадка",
          "maxX": 586.947,
          "maxZ": -148.701,
          "minX": 581.053,
          "minZ": -155.299,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_198:площадка",
          "maxX": 586.679,
          "maxZ": -132.852,
          "minX": 581.321,
          "minZ": -139.148,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_199:площадка",
          "maxX": 587.29,
          "maxZ": -101.519,
          "minX": 580.71,
          "minZ": -106.481,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_200:площадка",
          "maxX": 588.279,
          "maxZ": -36.83,
          "minX": 579.721,
          "minZ": -43.17,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_201:площадка",
          "maxX": -111.689,
          "maxZ": 548.092,
          "minX": -122.978,
          "minZ": 539.908,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_202:площадка",
          "maxX": -109.167,
          "maxZ": 570.277,
          "minX": -125.5,
          "minZ": 560.39,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_203:площадка",
          "maxX": -219.304,
          "maxZ": 613.15,
          "minX": -228.696,
          "minZ": 602.85,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_204:площадка",
          "maxX": -134.953,
          "maxZ": 612.001,
          "minX": -142.38,
          "minZ": 603.999,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_205:площадка",
          "maxX": -241.069,
          "maxZ": 569.518,
          "minX": -249.598,
          "minZ": 561.149,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_206:площадка",
          "maxX": -616.211,
          "maxZ": -384.964,
          "minX": -634.698,
          "minZ": -400.49,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_207:площадка",
          "maxX": 558.178,
          "maxZ": -569.875,
          "minX": 552.41,
          "minZ": -578.361,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_208:площадка",
          "maxX": 592.189,
          "maxZ": 58.851,
          "minX": 581.144,
          "minZ": 47.816,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_209:площадка",
          "maxX": 593.173,
          "maxZ": 101.17,
          "minX": 580.16,
          "minZ": 90.83,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_210:площадка",
          "maxX": 591.742,
          "maxZ": 271.918,
          "minX": 581.592,
          "minZ": 261.415,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_211:площадка",
          "maxX": 592.582,
          "maxZ": 313.929,
          "minX": 580.751,
          "minZ": 304.738,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_212:площадка",
          "maxX": -240.817,
          "maxZ": 590.724,
          "minX": -249.85,
          "minZ": 582.609,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_213:площадка",
          "maxX": -153.934,
          "maxZ": 634.716,
          "minX": -166.066,
          "minZ": 623.951,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_214:площадка",
          "maxX": 372.038,
          "maxZ": -588.782,
          "minX": 362.08,
          "minZ": -597.101,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_215:площадка",
          "maxX": 392.794,
          "maxZ": -589.11,
          "minX": 378.971,
          "minZ": -596.772,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_216:площадка",
          "maxX": 596.28,
          "maxZ": -380.781,
          "minX": 589.602,
          "minZ": -390.983,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_217:площадка",
          "maxX": 539.399,
          "maxZ": -588.706,
          "minX": 533.542,
          "minZ": -597.176,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_218:площадка",
          "maxX": 596.065,
          "maxZ": -531.765,
          "minX": 589.817,
          "minZ": -541.177,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_219:площадка",
          "maxX": -561.104,
          "maxZ": -591.444,
          "minX": -573.441,
          "minZ": -601.284,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_220:площадка",
          "maxX": -504.254,
          "maxZ": -589.61,
          "minX": -513.927,
          "minZ": -603.117,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_221:площадка",
          "maxX": -473.9,
          "maxZ": -589.165,
          "minX": -486.1,
          "minZ": -603.563,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_222:площадка",
          "maxX": -415.632,
          "maxZ": -590.924,
          "minX": -428.005,
          "minZ": -601.804,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_223:площадка",
          "maxX": -383.13,
          "maxZ": -588.611,
          "minX": -402.324,
          "minZ": -604.116,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_224:площадка",
          "maxX": -326.157,
          "maxZ": -588.502,
          "minX": -342.934,
          "minZ": -604.225,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_225:площадка",
          "maxX": -300.301,
          "maxZ": -590.633,
          "minX": -310.608,
          "minZ": -602.094,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_226:площадка",
          "maxX": -239.904,
          "maxZ": -588.317,
          "minX": -254.641,
          "minZ": -604.41,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_227:площадка",
          "maxX": -211.596,
          "maxZ": -588.484,
          "minX": -224.768,
          "minZ": -604.243,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_228:площадка",
          "maxX": -126.448,
          "maxZ": -590.497,
          "minX": -135.37,
          "minZ": -602.23,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_229:площадка",
          "maxX": -95.97,
          "maxZ": -590.008,
          "minX": -107.667,
          "minZ": -602.719,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_230:площадка",
          "maxX": 138.569,
          "maxZ": 603.649,
          "minX": 123.249,
          "minZ": 589.078,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_231:площадка",
          "maxX": 165.584,
          "maxZ": 602.955,
          "minX": 154.416,
          "minZ": 589.772,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_232:площадка",
          "maxX": 194.28,
          "maxZ": 602.065,
          "minX": 183.902,
          "minZ": 590.662,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_233:площадка",
          "maxX": 225.435,
          "maxZ": 603.984,
          "minX": 210.929,
          "minZ": 588.743,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_234:площадка",
          "maxX": 253.347,
          "maxZ": 602.965,
          "minX": 241.198,
          "minZ": 589.762,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_235:площадка",
          "maxX": 313.744,
          "maxZ": 603.887,
          "minX": 297.165,
          "minZ": 588.84,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_236:площадка",
          "maxX": 78.012,
          "maxZ": 602.27,
          "minX": 67.442,
          "minZ": 590.458,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_237:площадка",
          "maxX": -589.943,
          "maxZ": -357.858,
          "minX": -602.784,
          "minZ": -369.415,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_238:площадка",
          "maxX": -527.384,
          "maxZ": -292.324,
          "minX": -552.616,
          "minZ": -307.676,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_239:площадка",
          "maxX": 602.179,
          "maxZ": -293.097,
          "minX": 597.821,
          "minZ": -298.903,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_240:площадка",
          "maxX": 603.665,
          "maxZ": -277.387,
          "minX": 596.335,
          "minZ": -282.613,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_241:площадка",
          "maxX": 602.085,
          "maxZ": -229.775,
          "minX": 597.915,
          "minZ": -234.225,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_242:площадка",
          "maxX": 603.501,
          "maxZ": -213.166,
          "minX": 596.499,
          "minZ": -218.834,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_243:площадка",
          "maxX": 603.614,
          "maxZ": -180.845,
          "minX": 596.386,
          "minZ": -187.155,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_244:площадка",
          "maxX": -110.943,
          "maxZ": 612.225,
          "minX": -123.724,
          "minZ": 603.775,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_245:площадка",
          "maxX": 608.167,
          "maxZ": 340.047,
          "minX": 591.833,
          "minZ": 326.62,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_246:площадка",
          "maxX": 609.263,
          "maxZ": 365.998,
          "minX": 590.737,
          "minZ": 354.002,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_247:площадка",
          "maxX": 609.415,
          "maxZ": 393.197,
          "minX": 590.585,
          "minZ": 380.136,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_248:площадка",
          "maxX": 609.564,
          "maxZ": 420.732,
          "minX": 590.436,
          "minZ": 405.935,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_249:площадка",
          "maxX": 610.833,
          "maxZ": 446.005,
          "minX": 589.167,
          "minZ": 433.995,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_250:площадка",
          "maxX": 607.51,
          "maxZ": 524.761,
          "minX": 592.49,
          "minZ": 515.239,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_251:площадка",
          "maxX": 342.762,
          "maxZ": 606.833,
          "minX": 323.905,
          "minZ": 593.167,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_252:площадка",
          "maxX": 367.357,
          "maxZ": 607.888,
          "minX": 352.643,
          "minZ": 592.112,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_253:площадка",
          "maxX": 446.163,
          "maxZ": 607.861,
          "minX": 433.837,
          "minZ": 592.139,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_254:площадка",
          "maxX": 476.442,
          "maxZ": 606.052,
          "minX": 456.891,
          "minZ": 593.948,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_255:площадка",
          "maxX": 503.288,
          "maxZ": 606.623,
          "minX": 483.379,
          "minZ": 593.377,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_256:площадка",
          "maxX": 558.953,
          "maxZ": -588.712,
          "minX": 551.636,
          "minZ": -597.171,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_257:площадка",
          "maxX": -217.811,
          "maxZ": 633.76,
          "minX": -230.189,
          "minZ": 624.907,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_258:площадка",
          "maxX": -132.785,
          "maxZ": 634.096,
          "minX": -144.548,
          "minZ": 624.571,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_259:площадка",
          "maxX": -618.48,
          "maxZ": -589.528,
          "minX": -632.43,
          "minZ": -603.199,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_260:площадка",
          "maxX": 553.952,
          "maxZ": 608.008,
          "minX": 539.382,
          "minZ": 591.992,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_261:площадка",
          "maxX": -304.657,
          "maxZ": 548.759,
          "minX": -314.01,
          "minZ": 539.241,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_262:площадка",
          "maxX": -90.616,
          "maxZ": 548.486,
          "minX": -101.384,
          "minZ": 539.514,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_263:площадка",
          "maxX": -590.155,
          "maxZ": -325.722,
          "minX": -602.572,
          "minZ": -343.369,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_264:площадка",
          "maxX": 611.583,
          "maxZ": 35.923,
          "minX": 604.417,
          "minZ": 28.077,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_265:площадка",
          "maxX": 616.049,
          "maxZ": 100.061,
          "minX": 599.951,
          "minZ": 91.939,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_266:площадка",
          "maxX": 612.42,
          "maxZ": 185.553,
          "minX": 603.58,
          "minZ": 177.114,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_267:площадка",
          "maxX": 613.613,
          "maxZ": 250.8,
          "minX": 602.387,
          "minZ": 239.867,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_268:площадка",
          "maxX": 614.888,
          "maxZ": 314.06,
          "minX": 601.112,
          "minZ": 304.607,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_269:площадка",
          "maxX": -90.913,
          "maxZ": 590.761,
          "minX": -101.087,
          "minZ": 582.573,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_270:площадка",
          "maxX": 468.088,
          "maxZ": -607.717,
          "minX": 454.265,
          "minZ": -615.812,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_271:площадка",
          "maxX": 616.05,
          "maxZ": -514.051,
          "minX": 607.479,
          "minZ": -521.244,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_272:площадка",
          "maxX": -112.102,
          "maxZ": 632.865,
          "minX": -122.564,
          "minZ": 625.802,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_273:площадка",
          "maxX": 618.536,
          "maxZ": -293.418,
          "minX": 613.464,
          "minZ": -298.582,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_274:площадка",
          "maxX": 619.3,
          "maxZ": -277.363,
          "minX": 612.7,
          "minZ": -282.637,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_275:площадка",
          "maxX": 618.735,
          "maxZ": -229.931,
          "minX": 613.265,
          "minZ": -234.069,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_276:площадка",
          "maxX": 619.594,
          "maxZ": -164.525,
          "minX": 612.406,
          "minZ": -171.475,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_277:площадка",
          "maxX": 619.642,
          "maxZ": -101.565,
          "minX": 612.358,
          "minZ": -106.435,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_278:площадка",
          "maxX": 618.647,
          "maxZ": -86,
          "minX": 613.353,
          "minZ": -90,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_279:площадка",
          "maxX": -569.32,
          "maxZ": -288.173,
          "minX": -590.68,
          "minZ": -311.827,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_280:площадка",
          "maxX": -2.902,
          "maxZ": 569.922,
          "minX": -18.431,
          "minZ": 560.745,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_281:площадка",
          "maxX": 261.229,
          "maxZ": -608.851,
          "minX": 241.628,
          "minZ": -625.435,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_282:площадка",
          "maxX": 20.633,
          "maxZ": 603.616,
          "minX": 8.458,
          "minZ": 589.112,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_283:площадка",
          "maxX": -303.746,
          "maxZ": 569.459,
          "minX": -314.921,
          "minZ": 561.208,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_284:площадка",
          "maxX": 596.504,
          "maxZ": -589.218,
          "minX": 589.379,
          "minZ": -596.664,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_285:площадка",
          "maxX": -562.159,
          "maxZ": -619.445,
          "minX": -572.386,
          "minZ": -631.464,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_286:площадка",
          "maxX": -532.401,
          "maxZ": -618.294,
          "minX": -543.962,
          "minZ": -632.615,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_287:площадка",
          "maxX": -472.125,
          "maxZ": -617.261,
          "minX": -487.875,
          "minZ": -633.648,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_288:площадка",
          "maxX": -328.492,
          "maxZ": -617.718,
          "minX": -340.599,
          "minZ": -633.191,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_289:площадка",
          "maxX": -298.499,
          "maxZ": -618.619,
          "minX": -312.41,
          "minZ": -632.29,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_290:площадка",
          "maxX": -269.86,
          "maxZ": -620.572,
          "minX": -282.867,
          "minZ": -630.337,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_291:площадка",
          "maxX": -241.601,
          "maxZ": -618.987,
          "minX": -252.945,
          "minZ": -631.922,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_292:площадка",
          "maxX": -212.737,
          "maxZ": -621.049,
          "minX": -223.627,
          "minZ": -629.86,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_293:площадка",
          "maxX": 107.99,
          "maxZ": 633,
          "minX": 95.646,
          "minZ": 617.91,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_294:площадка",
          "maxX": 139.183,
          "maxZ": 634.245,
          "minX": 122.635,
          "minZ": 616.664,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_295:площадка",
          "maxX": 193.906,
          "maxZ": 630.427,
          "minX": 184.276,
          "minZ": 620.482,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_296:площадка",
          "maxX": 227.526,
          "maxZ": 632.464,
          "minX": 208.837,
          "minZ": 618.445,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_297:площадка",
          "maxX": 256.367,
          "maxZ": 633.37,
          "minX": 238.179,
          "minZ": 617.539,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_298:площадка",
          "maxX": 282.788,
          "maxZ": 630.725,
          "minX": 269.939,
          "minZ": 620.184,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_299:площадка",
          "maxX": 636.858,
          "maxZ": 366.94,
          "minX": 616.476,
          "minZ": 353.06,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_300:площадка",
          "maxX": 635.747,
          "maxZ": 392.714,
          "minX": 617.586,
          "minZ": 380.62,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_301:площадка",
          "maxX": 632.457,
          "maxZ": 498.417,
          "minX": 620.877,
          "minZ": 488.249,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_302:площадка",
          "maxX": 370.833,
          "maxZ": 632.14,
          "minX": 349.167,
          "minZ": 621.194,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_303:площадка",
          "maxX": 503.39,
          "maxZ": 631.11,
          "minX": 483.277,
          "minZ": 622.224,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_304:площадка",
          "maxX": -3.048,
          "maxZ": 591.712,
          "minX": -18.285,
          "minZ": 581.621,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_305:площадка",
          "maxX": 634.45,
          "maxZ": 14.96,
          "minX": 624.217,
          "minZ": 6.373,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_306:площадка",
          "maxX": 633.271,
          "maxZ": 57.588,
          "minX": 625.396,
          "minZ": 49.079,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_307:площадка",
          "maxX": 634.975,
          "maxZ": 78.946,
          "minX": 623.692,
          "minZ": 70.387,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_308:площадка",
          "maxX": 636.353,
          "maxZ": 164.219,
          "minX": 622.314,
          "minZ": 155.781,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_309:площадка",
          "maxX": 633.689,
          "maxZ": 228.419,
          "minX": 624.977,
          "minZ": 219.581,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_310:площадка",
          "maxX": -69.341,
          "maxZ": 590.731,
          "minX": -79.992,
          "minZ": 582.602,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_311:площадка",
          "maxX": 50.876,
          "maxZ": 632.105,
          "minX": 36.397,
          "minZ": 618.804,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_312:площадка",
          "maxX": 483.926,
          "maxZ": -626.198,
          "minX": 476.074,
          "minZ": -634.978,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_313:площадка",
          "maxX": 634.764,
          "maxZ": -514.003,
          "minX": 626.413,
          "minZ": -521.291,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_314:площадка",
          "maxX": 634.65,
          "maxZ": -420.052,
          "minX": 626.527,
          "minZ": -427.007,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_315:площадка",
          "maxX": 635.33,
          "maxZ": -326.333,
          "minX": 625.846,
          "minZ": -332.491,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_316:площадка",
          "maxX": -620.312,
          "maxZ": -619.535,
          "minX": -630.597,
          "minZ": -631.375,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_317:площадка",
          "maxX": 634.818,
          "maxZ": -229.473,
          "minX": 629.182,
          "minZ": -234.527,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_318:площадка",
          "maxX": 634.916,
          "maxZ": -36.563,
          "minX": 629.084,
          "minZ": -43.437,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_319:площадка",
          "maxX": 635.117,
          "maxZ": -21.584,
          "minX": 628.883,
          "minZ": -26.416,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_320:площадка",
          "maxX": -618.752,
          "maxZ": -326.09,
          "minX": -632.157,
          "minZ": -343.001,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_321:площадка",
          "maxX": -301.167,
          "maxZ": 590.649,
          "minX": -317.5,
          "minZ": 582.684,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_322:площадка",
          "maxX": -525.526,
          "maxZ": -246.048,
          "minX": -554.474,
          "minZ": -273.952,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_323:площадка",
          "maxX": 21.34,
          "maxZ": 632.146,
          "minX": 7.751,
          "minZ": 618.764,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_324:площадка",
          "maxX": 577.143,
          "maxZ": -625.796,
          "minX": 571.092,
          "minZ": -635.38,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_325:площадка",
          "maxX": -603.255,
          "maxZ": -288.692,
          "minX": -636.745,
          "minZ": -311.308,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_326:площадка",
          "maxX": -45.477,
          "maxZ": 569.282,
          "minX": -61.19,
          "minZ": 561.384,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_327:площадка",
          "maxX": -565.536,
          "maxZ": -249.379,
          "minX": -594.464,
          "minZ": -270.621,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_328:площадка",
          "maxX": 634.155,
          "maxZ": 607.906,
          "minX": 619.179,
          "minZ": 592.094,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_329:площадка",
          "maxX": 609.588,
          "maxZ": 631.351,
          "minX": 590.412,
          "minZ": 621.982,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_330:площадка",
          "maxX": -47.131,
          "maxZ": 612.36,
          "minX": -59.535,
          "minZ": 603.64,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_331:площадка",
          "maxX": -303.617,
          "maxZ": 633.317,
          "minX": -315.05,
          "minZ": 625.349,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_332:площадка",
          "maxX": 637.487,
          "maxZ": 634.421,
          "minX": 615.847,
          "minZ": 618.912,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_333:площадка",
          "maxX": -26.855,
          "maxZ": 633.248,
          "minX": -37.145,
          "minZ": 625.419,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_334:площадка",
          "maxX": -514.554,
          "maxZ": 627.756,
          "minX": -536.875,
          "minZ": 606.53,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_335:площадка",
          "maxX": -560.686,
          "maxZ": 443.711,
          "minX": -582.171,
          "minZ": 424.86,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_336:площадка",
          "maxX": -554.992,
          "maxZ": 493.102,
          "minX": -587.865,
          "minZ": 466.898,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_337:площадка",
          "maxX": -558.113,
          "maxZ": 401.142,
          "minX": -584.744,
          "minZ": 376.001,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_338:площадка",
          "maxX": -609.385,
          "maxZ": 396.394,
          "minX": -624.901,
          "minZ": 380.749,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_339:площадка",
          "maxX": -561.911,
          "maxZ": -504.317,
          "minX": -572.634,
          "minZ": -513.865,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_340:площадка",
          "maxX": 538.599,
          "maxZ": -212.842,
          "minX": 533.401,
          "minZ": -219.158,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_341:площадка",
          "maxX": -532.881,
          "maxZ": -416.274,
          "minX": -543.483,
          "minZ": -427.362,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_342:площадка",
          "maxX": -269.607,
          "maxZ": -531.231,
          "minX": -283.12,
          "minZ": -545.133,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_343:площадка",
          "maxX": 110.445,
          "maxZ": 544.347,
          "minX": 93.192,
          "minZ": 532.017,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_344:площадка",
          "maxX": -531.248,
          "maxZ": -355.995,
          "minX": -545.116,
          "minZ": -371.278,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_345:площадка",
          "maxX": 551.431,
          "maxZ": 78.329,
          "minX": 536.569,
          "minZ": 71.005,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_346:площадка",
          "maxX": 551.998,
          "maxZ": 339.096,
          "minX": 541.335,
          "minZ": 327.571,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_347:площадка",
          "maxX": 554.776,
          "maxZ": 367.931,
          "minX": 538.557,
          "minZ": 352.069,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_348:площадка",
          "maxX": 448.683,
          "maxZ": 551.236,
          "minX": 431.317,
          "minZ": 542.098,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_349:площадка",
          "maxX": 501.691,
          "maxZ": 553.842,
          "minX": 484.976,
          "minZ": 539.491,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_350:площадка",
          "maxX": 554.427,
          "maxZ": -197.845,
          "minX": 549.573,
          "minZ": -202.155,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_351:площадка",
          "maxX": -196.897,
          "maxZ": 591.158,
          "minX": -208.436,
          "minZ": 582.176,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_352:площадка",
          "maxX": 522.314,
          "maxZ": -550.526,
          "minX": 512.981,
          "minZ": -560.062,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_353:площадка",
          "maxX": 559.409,
          "maxZ": -495.119,
          "minX": 551.179,
          "minZ": -502.528,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_354:площадка",
          "maxX": 560.288,
          "maxZ": -456.527,
          "minX": 550.3,
          "minZ": -465.826,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_355:площадка",
          "maxX": 562.091,
          "maxZ": -420.431,
          "minX": 548.498,
          "minZ": -426.628,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_356:площадка",
          "maxX": 539.074,
          "maxZ": -551.307,
          "minX": 533.867,
          "minZ": -559.281,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_357:площадка",
          "maxX": -618.836,
          "maxZ": -414.912,
          "minX": -632.073,
          "minZ": -428.724,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_358:площадка",
          "maxX": -131.535,
          "maxZ": 547.935,
          "minX": -145.798,
          "minZ": 540.065,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_359:площадка",
          "maxX": 571.558,
          "maxZ": 14.42,
          "minX": 559.109,
          "minZ": 6.913,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_360:площадка",
          "maxX": 571.072,
          "maxZ": 78.915,
          "minX": 559.595,
          "minZ": 70.419,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_361:площадка",
          "maxX": 569.014,
          "maxZ": 249.103,
          "minX": 561.653,
          "minZ": 241.564,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_362:площадка",
          "maxX": -212.161,
          "maxZ": -560.736,
          "minX": -224.202,
          "minZ": -573.81,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_363:площадка",
          "maxX": -183.83,
          "maxZ": -563.26,
          "minX": -194.352,
          "minZ": -571.286,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_364:площадка",
          "maxX": -94.36,
          "maxZ": -560.827,
          "minX": -109.276,
          "minZ": -573.718,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_365:площадка",
          "maxX": -66.145,
          "maxZ": -562.143,
          "minX": -79.309,
          "minZ": -572.402,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_3_366:площадка",
          "maxX": 282.858,
          "maxZ": 574.508,
          "minX": 269.869,
          "minZ": 560.038,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_367:площадка",
          "maxX": 570.196,
          "maxZ": -197.082,
          "minX": 565.804,
          "minZ": -202.918,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_368:площадка",
          "maxX": 570.27,
          "maxZ": -165.776,
          "minX": 565.73,
          "minZ": -170.224,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_369:площадка",
          "maxX": 570.003,
          "maxZ": -37.599,
          "minX": 565.997,
          "minZ": -42.401,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_370:площадка",
          "maxX": -560.66,
          "maxZ": -356.711,
          "minX": -573.886,
          "minZ": -370.561,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_371:площадка",
          "maxX": 305.551,
          "maxZ": -561.969,
          "minX": 288.735,
          "minZ": -580.888,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_372:площадка",
          "maxX": 371.999,
          "maxZ": -569.683,
          "minX": 362.119,
          "minZ": -578.553,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_373:площадка",
          "maxX": 428.351,
          "maxZ": -570.922,
          "minX": 418.707,
          "minZ": -577.313,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_374:площадка",
          "maxX": 581.029,
          "maxZ": -419.335,
          "minX": 567.206,
          "minZ": -427.724,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_375:площадка",
          "maxX": 586.724,
          "maxZ": -292.836,
          "minX": 581.276,
          "minZ": -299.164,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_376:площадка",
          "maxX": 586.879,
          "maxZ": -197.574,
          "minX": 581.121,
          "minZ": -202.426,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_377:площадка",
          "maxX": 587.678,
          "maxZ": -53.201,
          "minX": 580.322,
          "minZ": -58.799,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_378:площадка",
          "maxX": 576.482,
          "maxZ": -551.453,
          "minX": 571.754,
          "minZ": -559.136,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_379:площадка",
          "maxX": 591.255,
          "maxZ": 185.811,
          "minX": 582.078,
          "minZ": 176.856,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_380:площадка",
          "maxX": 593.236,
          "maxZ": 249.612,
          "minX": 580.097,
          "minZ": 241.054,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_381:площадка",
          "maxX": -111.049,
          "maxZ": 591.604,
          "minX": -123.618,
          "minZ": 581.729,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_382:площадка",
          "maxX": -176.828,
          "maxZ": 634.532,
          "minX": -185.839,
          "minZ": 624.135,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_383:площадка",
          "maxX": 410.622,
          "maxZ": -589.778,
          "minX": 398.789,
          "minZ": -596.105,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_384:площадка",
          "maxX": 482.67,
          "maxZ": -588.831,
          "minX": 477.33,
          "minZ": -597.051,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_385:площадка",
          "maxX": -271.291,
          "maxZ": -590.11,
          "minX": -281.437,
          "minZ": -602.617,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_386:площадка",
          "maxX": 603.638,
          "maxZ": -261.35,
          "minX": 596.362,
          "minZ": -266.65,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_387:площадка",
          "maxX": 602.97,
          "maxZ": -117.767,
          "minX": 597.03,
          "minZ": -122.233,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_388:площадка",
          "maxX": 602.59,
          "maxZ": -84.801,
          "minX": 597.41,
          "minZ": -91.199,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_389:площадка",
          "maxX": -238.443,
          "maxZ": 611.547,
          "minX": -252.224,
          "minZ": 604.453,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_390:площадка",
          "maxX": 608.219,
          "maxZ": 499.904,
          "minX": 591.781,
          "minZ": 486.762,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_391:площадка",
          "maxX": 598.07,
          "maxZ": -551.801,
          "minX": 587.812,
          "minZ": -558.787,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_392:площадка",
          "maxX": 614.448,
          "maxZ": 15.918,
          "minX": 601.552,
          "minZ": 5.416,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_393:площадка",
          "maxX": 615.67,
          "maxZ": 121.921,
          "minX": 600.33,
          "minZ": 112.745,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_394:площадка",
          "maxX": 612.872,
          "maxZ": 206.961,
          "minX": 603.128,
          "minZ": 198.372,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_395:площадка",
          "maxX": 612.833,
          "maxZ": 228.583,
          "minX": 603.167,
          "minZ": 219.417,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_396:площадка",
          "maxX": 614.149,
          "maxZ": 292.889,
          "minX": 601.851,
          "minZ": 283.111,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_397:площадка",
          "maxX": -4.023,
          "maxZ": 549.077,
          "minX": -17.311,
          "minZ": 538.923,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_398:площадка",
          "maxX": 576.923,
          "maxZ": -589.789,
          "minX": 571.312,
          "minZ": -596.093,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_399:площадка",
          "maxX": 334.843,
          "maxZ": -608.902,
          "minX": 323.98,
          "minZ": -614.628,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_400:площадка",
          "maxX": 429.228,
          "maxZ": -607.744,
          "minX": 417.831,
          "minZ": -615.785,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_1_401:площадка",
          "maxX": 16.016,
          "maxZ": -166.991,
          "minX": 6.841,
          "minZ": -175.866,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_402:площадка",
          "maxX": -336.087,
          "maxZ": 22.891,
          "minX": -343.913,
          "minZ": 17.109,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_2_404:площадка",
          "maxX": 47.949,
          "maxZ": 18.009,
          "minX": 39.323,
          "minZ": 11.082,
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
