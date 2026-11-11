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
          "buildings": 18,
          "roads": 1
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
          "buildings": 23
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
          "buildings": 66
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
        "objects": {},
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
        "objects": {},
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
          "buildings": 5
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
          "buildings": 17
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
          "buildings": 24
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
        "objects": {},
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
          "buildings": 37,
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
          "buildings": 31,
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
          "channels": 1
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
          "buildings": 18
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
          "buildings": 88
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
          "buildings": 69
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
        "objects": {},
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
        "objects": {},
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
          "buildings": 21
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
        "objects": {},
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
          "roads": 1
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
          "maxX": -568.055,
          "maxZ": -608.055,
          "minX": -591.945,
          "minZ": -631.945,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_2:площадка",
          "maxX": -529.682,
          "maxZ": -609.682,
          "minX": -550.318,
          "minZ": -630.318,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_3:площадка",
          "maxX": -489.341,
          "maxZ": -609.341,
          "minX": -510.659,
          "minZ": -630.659,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_4:площадка",
          "maxX": -406.666,
          "maxZ": -606.666,
          "minX": -433.334,
          "minZ": -633.334,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_5:площадка",
          "maxX": -528.619,
          "maxZ": -568.619,
          "minX": -551.381,
          "minZ": -591.381,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_6:площадка",
          "maxX": -327.04,
          "maxZ": -567.04,
          "minX": -352.96,
          "minZ": -592.96,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_7:площадка",
          "maxX": -565.16,
          "maxZ": -525.16,
          "minX": -594.84,
          "minZ": -554.84,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_8:площадка",
          "maxX": -450.17,
          "maxZ": -530.17,
          "minX": -469.83,
          "minZ": -549.83,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_9:площадка",
          "maxX": -410.352,
          "maxZ": -530.352,
          "minX": -429.648,
          "minZ": -549.648,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_11:площадка",
          "maxX": -448.195,
          "maxZ": -488.195,
          "minX": -471.805,
          "minZ": -511.805,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_14:площадка",
          "maxX": -528.691,
          "maxZ": -448.691,
          "minX": -551.309,
          "minZ": -471.309,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_15:площадка",
          "maxX": -449.122,
          "maxZ": -449.122,
          "minX": -470.878,
          "minZ": -470.878,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_16:площадка",
          "maxX": -569.363,
          "maxZ": -409.363,
          "minX": -590.637,
          "minZ": -430.637,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_17:площадка",
          "maxX": -489.105,
          "maxZ": -409.105,
          "minX": -510.895,
          "minZ": -430.895,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_19:площадка",
          "maxX": -526.995,
          "maxZ": -366.995,
          "minX": -553.005,
          "minZ": -393.005,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_20:площадка",
          "maxX": -485.171,
          "maxZ": -365.171,
          "minX": -514.829,
          "minZ": -394.829,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_21:площадка",
          "maxX": -449.453,
          "maxZ": -369.453,
          "minX": -470.547,
          "minZ": -390.547,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_22:площадка",
          "maxX": -410.088,
          "maxZ": -370.088,
          "minX": -429.912,
          "minZ": -389.912,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_23:площадка",
          "maxX": -605.94,
          "maxZ": -325.94,
          "minX": -634.06,
          "minZ": -354.06,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_24:площадка",
          "maxX": -567.651,
          "maxZ": -327.651,
          "minX": -592.349,
          "minZ": -352.349,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_25:площадка",
          "maxX": -526.283,
          "maxZ": -326.283,
          "minX": -553.717,
          "minZ": -353.717,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_26:площадка",
          "maxX": -487.354,
          "maxZ": -327.354,
          "minX": -512.646,
          "minZ": -352.646,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_28:площадка",
          "maxX": 151.929,
          "maxZ": -608.071,
          "minX": 128.071,
          "minZ": -631.929,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_50:площадка",
          "maxX": -525.683,
          "maxZ": -285.683,
          "minX": -554.317,
          "minZ": -314.317,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_52:площадка",
          "maxX": -606.596,
          "maxZ": -246.596,
          "minX": -633.404,
          "minZ": -273.404,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_53:площадка",
          "maxX": -566.274,
          "maxZ": -246.274,
          "minX": -593.726,
          "minZ": -273.726,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_54:площадка",
          "maxX": -529.775,
          "maxZ": -249.775,
          "minX": -550.225,
          "minZ": -270.225,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_55:площадка",
          "maxX": -406.259,
          "maxZ": -246.259,
          "minX": -433.741,
          "minZ": -273.741,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_56:площадка",
          "maxX": -529.635,
          "maxZ": -209.635,
          "minX": -550.365,
          "minZ": -230.365,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_57:площадка",
          "maxX": -446.963,
          "maxZ": -206.963,
          "minX": -473.037,
          "minZ": -233.037,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_58:площадка",
          "maxX": -529.255,
          "maxZ": -169.255,
          "minX": -550.745,
          "minZ": -190.745,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_59:площадка",
          "maxX": -448.895,
          "maxZ": -168.895,
          "minX": -471.105,
          "minZ": -191.105,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_60:площадка",
          "maxX": -369.151,
          "maxZ": -169.151,
          "minX": -390.849,
          "minZ": -190.849,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_61:площадка",
          "maxX": -530.269,
          "maxZ": -130.269,
          "minX": -549.731,
          "minZ": -149.731,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_62:площадка",
          "maxX": -488.022,
          "maxZ": -128.022,
          "minX": -511.978,
          "minZ": -151.978,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_63:площадка",
          "maxX": -449.134,
          "maxZ": -129.134,
          "minX": -470.866,
          "minZ": -150.866,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_64:площадка",
          "maxX": -407.357,
          "maxZ": -127.357,
          "minX": -432.643,
          "minZ": -152.643,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_66:площадка",
          "maxX": -564.973,
          "maxZ": -84.973,
          "minX": -595.027,
          "minZ": -115.027,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_67:площадка",
          "maxX": -449.514,
          "maxZ": -89.514,
          "minX": -470.486,
          "minZ": -110.486,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_69:площадка",
          "maxX": -609.958,
          "maxZ": -49.958,
          "minX": -630.042,
          "minZ": -70.042,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_70:площадка",
          "maxX": -567.237,
          "maxZ": -47.237,
          "minX": -592.763,
          "minZ": -72.763,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_71:площадка",
          "maxX": -529.265,
          "maxZ": -49.265,
          "minX": -550.735,
          "minZ": -70.735,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_72:площадка",
          "maxX": -445.808,
          "maxZ": -45.808,
          "minX": -474.192,
          "minZ": -74.192,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_73:площадка",
          "maxX": -608.677,
          "maxZ": -8.677,
          "minX": -631.323,
          "minZ": -31.323,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_74:площадка",
          "maxX": -527.05,
          "maxZ": -7.05,
          "minX": -552.95,
          "minZ": -32.95,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_75:площадка",
          "maxX": -404.32,
          "maxZ": -4.32,
          "minX": -435.68,
          "minZ": -35.68,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_1_231:площадка",
          "maxX": 315.641,
          "maxZ": -100.359,
          "minX": 308.359,
          "minZ": -107.641,
          "y": 0.004
        },
        {
          "blend": 14,
          "id": "b_district_2_1_279:площадка",
          "maxX": 315.253,
          "maxZ": -36.747,
          "minX": 308.747,
          "minZ": -43.253,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_1_290:площадка",
          "maxX": 315.948,
          "maxZ": -20.052,
          "minX": 308.052,
          "minZ": -27.948,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_306:площадка",
          "maxX": 633.682,
          "maxZ": -286.318,
          "minX": 606.318,
          "minZ": -313.682,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_319:площадка",
          "maxX": 554.22,
          "maxZ": -165.78,
          "minX": 525.78,
          "minZ": -194.22,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_320:площадка",
          "maxX": 630.794,
          "maxZ": -169.206,
          "minX": 609.206,
          "minZ": -190.794,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_322:площадка",
          "maxX": 475.207,
          "maxZ": -124.793,
          "minX": 444.793,
          "minZ": -155.207,
          "y": 0.02
        },
        {
          "blend": 14,
          "id": "b_district_3_1_323:площадка",
          "maxX": 512.279,
          "maxZ": -127.721,
          "minX": 487.721,
          "minZ": -152.279,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_324:площадка",
          "maxX": 550.343,
          "maxZ": -129.657,
          "minX": 529.657,
          "minZ": -150.343,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_325:площадка",
          "maxX": 354.024,
          "maxZ": -85.976,
          "minX": 325.976,
          "minZ": -114.024,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_326:площадка",
          "maxX": 391.483,
          "maxZ": -88.517,
          "minX": 368.517,
          "minZ": -111.483,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_327:площадка",
          "maxX": 432.894,
          "maxZ": -87.106,
          "minX": 407.106,
          "minZ": -112.894,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_328:площадка",
          "maxX": 472.558,
          "maxZ": -87.442,
          "minX": 447.442,
          "minZ": -112.558,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_329:площадка",
          "maxX": 633.085,
          "maxZ": -86.915,
          "minX": 606.915,
          "minZ": -113.085,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_330:площадка",
          "maxX": 351.028,
          "maxZ": -48.972,
          "minX": 328.972,
          "minZ": -71.028,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_331:площадка",
          "maxX": 429.945,
          "maxZ": -50.055,
          "minX": 410.055,
          "minZ": -69.945,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_332:площадка",
          "maxX": 549.684,
          "maxZ": -50.316,
          "minX": 530.316,
          "minZ": -69.684,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_333:площадка",
          "maxX": 592.478,
          "maxZ": -47.522,
          "minX": 567.522,
          "minZ": -72.478,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_334:площадка",
          "maxX": 391.538,
          "maxZ": -8.462,
          "minX": 368.462,
          "minZ": -31.538,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_335:площадка",
          "maxX": 514.817,
          "maxZ": -5.183,
          "minX": 485.183,
          "minZ": -34.817,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_336:площадка",
          "maxX": 633.98,
          "maxZ": -6.02,
          "minX": 606.02,
          "minZ": -33.98,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_337:площадка",
          "maxX": -595.828,
          "maxZ": 12.172,
          "minX": -604.172,
          "minZ": 3.828,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_338:площадка",
          "maxX": -564.495,
          "maxZ": 11.505,
          "minX": -571.505,
          "minZ": 4.495,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_339:площадка",
          "maxX": -515.074,
          "maxZ": 12.926,
          "minX": -524.926,
          "minZ": 3.074,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_340:площадка",
          "maxX": -500.89,
          "maxZ": 11.11,
          "minX": -507.11,
          "minZ": 4.89,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_341:площадка",
          "maxX": -452.557,
          "maxZ": 11.443,
          "minX": -459.443,
          "minZ": 4.557,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_342:площадка",
          "maxX": -435.334,
          "maxZ": 12.666,
          "minX": -444.666,
          "minZ": 3.334,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_343:площадка",
          "maxX": -404.345,
          "maxZ": 11.655,
          "minX": -411.655,
          "minZ": 4.345,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_347:площадка",
          "maxX": -627.305,
          "maxZ": 28.695,
          "minX": -636.695,
          "minZ": 19.305,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_348:площадка",
          "maxX": -611.478,
          "maxZ": 28.522,
          "minX": -620.522,
          "minZ": 19.478,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_349:площадка",
          "maxX": -580.736,
          "maxZ": 27.264,
          "minX": -587.264,
          "minZ": 20.736,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_350:площадка",
          "maxX": -564.278,
          "maxZ": 27.722,
          "minX": -571.722,
          "minZ": 20.278,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_351:площадка",
          "maxX": -547.375,
          "maxZ": 28.625,
          "minX": -556.625,
          "minZ": 19.375,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_352:площадка",
          "maxX": -531.281,
          "maxZ": 28.719,
          "minX": -540.719,
          "minZ": 19.281,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_353:площадка",
          "maxX": -515.722,
          "maxZ": 28.278,
          "minX": -524.278,
          "minZ": 19.722,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_354:площадка",
          "maxX": -484.084,
          "maxZ": 27.916,
          "minX": -491.916,
          "minZ": 20.084,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_355:площадка",
          "maxX": -467.535,
          "maxZ": 28.465,
          "minX": -476.465,
          "minZ": 19.535,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_356:площадка",
          "maxX": -451.263,
          "maxZ": 28.737,
          "minX": -460.737,
          "minZ": 19.263,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_357:площадка",
          "maxX": -436.249,
          "maxZ": 27.751,
          "minX": -443.751,
          "minZ": 20.249,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_358:площадка",
          "maxX": -420.15,
          "maxZ": 27.85,
          "minX": -427.85,
          "minZ": 20.15,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_359:площадка",
          "maxX": -403.809,
          "maxZ": 28.191,
          "minX": -412.191,
          "minZ": 19.809,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_360:площадка",
          "maxX": -387.474,
          "maxZ": 28.526,
          "minX": -396.526,
          "minZ": 19.474,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_363:площадка",
          "maxX": -628.289,
          "maxZ": 43.711,
          "minX": -635.711,
          "minZ": 36.289,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_364:площадка",
          "maxX": -595.769,
          "maxZ": 44.231,
          "minX": -604.231,
          "minZ": 35.769,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_365:площадка",
          "maxX": -580.125,
          "maxZ": 43.875,
          "minX": -587.875,
          "minZ": 36.125,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_366:площадка",
          "maxX": -532.615,
          "maxZ": 43.385,
          "minX": -539.385,
          "minZ": 36.615,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_367:площадка",
          "maxX": -516.557,
          "maxZ": 43.443,
          "minX": -523.443,
          "minZ": 36.557,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_368:площадка",
          "maxX": -499.802,
          "maxZ": 44.198,
          "minX": -508.198,
          "minZ": 35.802,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_369:площадка",
          "maxX": -483.125,
          "maxZ": 44.875,
          "minX": -492.875,
          "minZ": 35.125,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_370:площадка",
          "maxX": -419.364,
          "maxZ": 44.636,
          "minX": -428.636,
          "minZ": 35.364,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_371:площадка",
          "maxX": -403.58,
          "maxZ": 44.42,
          "minX": -412.42,
          "minZ": 35.58,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_372:площадка",
          "maxX": -387.883,
          "maxZ": 44.117,
          "minX": -396.117,
          "minZ": 35.883,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_373:площадка",
          "maxX": -372.267,
          "maxZ": 43.733,
          "minX": -379.733,
          "minZ": 36.267,
          "y": 0.041
        },
        {
          "blend": 14,
          "id": "b_district_0_2_374:площадка",
          "maxX": -595.923,
          "maxZ": 60.077,
          "minX": -604.077,
          "minZ": 51.923,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_375:площадка",
          "maxX": -579.662,
          "maxZ": 60.338,
          "minX": -588.338,
          "minZ": 51.662,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_376:площадка",
          "maxX": -563.756,
          "maxZ": 60.244,
          "minX": -572.244,
          "minZ": 51.756,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_377:площадка",
          "maxX": -532.646,
          "maxZ": 59.354,
          "minX": -539.354,
          "minZ": 52.646,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_378:площадка",
          "maxX": -515.762,
          "maxZ": 60.238,
          "minX": -524.238,
          "minZ": 51.762,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_379:площадка",
          "maxX": -483.779,
          "maxZ": 60.221,
          "minX": -492.221,
          "minZ": 51.779,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_380:площадка",
          "maxX": -451.907,
          "maxZ": 60.093,
          "minX": -460.093,
          "minZ": 51.907,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_381:площадка",
          "maxX": -435.766,
          "maxZ": 60.234,
          "minX": -444.234,
          "minZ": 51.766,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_382:площадка",
          "maxX": -420.592,
          "maxZ": 59.408,
          "minX": -427.408,
          "minZ": 52.592,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_383:площадка",
          "maxX": -404.434,
          "maxZ": 59.566,
          "minX": -411.566,
          "minZ": 52.434,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_384:площадка",
          "maxX": -388.258,
          "maxZ": 59.742,
          "minX": -395.742,
          "minZ": 52.258,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_385:площадка",
          "maxX": -372.152,
          "maxZ": 59.848,
          "minX": -379.848,
          "minZ": 52.152,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_388:площадка",
          "maxX": -611.858,
          "maxZ": 76.142,
          "minX": -620.142,
          "minZ": 67.858,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_389:площадка",
          "maxX": -595.185,
          "maxZ": 76.815,
          "minX": -604.815,
          "minZ": 67.185,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_390:площадка",
          "maxX": -579.889,
          "maxZ": 76.111,
          "minX": -588.111,
          "minZ": 67.889,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_391:площадка",
          "maxX": -563.604,
          "maxZ": 76.396,
          "minX": -572.396,
          "minZ": 67.604,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_392:площадка",
          "maxX": -548.615,
          "maxZ": 75.385,
          "minX": -555.385,
          "minZ": 68.615,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_393:площадка",
          "maxX": -531.229,
          "maxZ": 76.771,
          "minX": -540.771,
          "minZ": 67.229,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_394:площадка",
          "maxX": -451.748,
          "maxZ": 76.252,
          "minX": -460.252,
          "minZ": 67.748,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_395:площадка",
          "maxX": -435.245,
          "maxZ": 76.755,
          "minX": -444.755,
          "minZ": 67.245,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_396:площадка",
          "maxX": -387.227,
          "maxZ": 76.773,
          "minX": -396.773,
          "minZ": 67.227,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_397:площадка",
          "maxX": -372.584,
          "maxZ": 75.416,
          "minX": -379.416,
          "minZ": 68.584,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_398:площадка",
          "maxX": -356.056,
          "maxZ": 75.944,
          "minX": -363.944,
          "minZ": 68.056,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_400:площадка",
          "maxX": -627.421,
          "maxZ": 92.579,
          "minX": -636.579,
          "minZ": 83.421,
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
