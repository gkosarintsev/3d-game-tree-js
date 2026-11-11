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
          "buildings": 93,
          "roads": 2
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
          "buildings": 28,
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
          "buildings": 16,
          "lights": 1,
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
          "buildings": 2,
          "lights": 1,
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
          "buildings": 24
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
        "objects": {},
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
          "buildings": 8,
          "roads": 1
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
          "buildings": 3,
          "channels": 1,
          "lights": 1,
          "roads": 1
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
          "buildings": 31
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
        "objects": {},
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
        "objects": {},
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
        "objects": {
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
          "buildings": 36
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
          "buildings": 17
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
          "buildings": 12
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
          "buildings": 7,
          "roads": 2
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
          "maxX": -612.246,
          "maxZ": -628.246,
          "minX": -619.754,
          "minZ": -635.754,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_2:площадка",
          "maxX": -595.139,
          "maxZ": -627.139,
          "minX": -604.861,
          "minZ": -636.861,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_3:площадка",
          "maxX": -531.809,
          "maxZ": -627.809,
          "minX": -540.191,
          "minZ": -636.191,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_4:площадка",
          "maxX": -468.423,
          "maxZ": -628.423,
          "minX": -475.577,
          "minZ": -635.577,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_5:площадка",
          "maxX": -403.927,
          "maxZ": -627.927,
          "minX": -412.073,
          "minZ": -636.073,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_6:площадка",
          "maxX": -387.336,
          "maxZ": -627.336,
          "minX": -396.664,
          "minZ": -636.664,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_7:площадка",
          "maxX": -371.511,
          "maxZ": -627.511,
          "minX": -380.489,
          "minZ": -636.489,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_8:площадка",
          "maxX": -340.968,
          "maxZ": -628.968,
          "minX": -347.032,
          "minZ": -635.032,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_9:площадка",
          "maxX": -324.844,
          "maxZ": -628.844,
          "minX": -331.156,
          "minZ": -635.156,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_10:площадка",
          "maxX": -596.192,
          "maxZ": -612.192,
          "minX": -603.808,
          "minZ": -619.808,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_11:площадка",
          "maxX": -579.082,
          "maxZ": -611.082,
          "minX": -588.918,
          "minZ": -620.918,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_12:площадка",
          "maxX": -564.868,
          "maxZ": -612.868,
          "minX": -571.132,
          "minZ": -619.132,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_13:площадка",
          "maxX": -516.446,
          "maxZ": -612.446,
          "minX": -523.554,
          "minZ": -619.554,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_14:площадка",
          "maxX": -500.581,
          "maxZ": -612.581,
          "minX": -507.419,
          "minZ": -619.419,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_15:площадка",
          "maxX": -436.657,
          "maxZ": -612.657,
          "minX": -443.343,
          "minZ": -619.343,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_16:площадка",
          "maxX": -420.576,
          "maxZ": -612.576,
          "minX": -427.424,
          "minZ": -619.424,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_17:площадка",
          "maxX": -403.166,
          "maxZ": -611.166,
          "minX": -412.834,
          "minZ": -620.834,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_18:площадка",
          "maxX": -387.861,
          "maxZ": -611.861,
          "minX": -396.139,
          "minZ": -620.139,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_19:площадка",
          "maxX": -356.225,
          "maxZ": -612.225,
          "minX": -363.775,
          "minZ": -619.775,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_20:площадка",
          "maxX": -340.685,
          "maxZ": -612.685,
          "minX": -347.315,
          "minZ": -619.315,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_21:площадка",
          "maxX": -324.734,
          "maxZ": -612.734,
          "minX": -331.266,
          "minZ": -619.266,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_22:площадка",
          "maxX": -627.581,
          "maxZ": -595.581,
          "minX": -636.419,
          "minZ": -604.419,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_23:площадка",
          "maxX": -611.448,
          "maxZ": -595.448,
          "minX": -620.552,
          "minZ": -604.552,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_24:площадка",
          "maxX": -596.753,
          "maxZ": -596.753,
          "minX": -603.247,
          "minZ": -603.247,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_25:площадка",
          "maxX": -532.385,
          "maxZ": -596.385,
          "minX": -539.615,
          "minZ": -603.615,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_26:площадка",
          "maxX": -515.551,
          "maxZ": -595.551,
          "minX": -524.449,
          "minZ": -604.449,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_27:площадка",
          "maxX": -499.457,
          "maxZ": -595.457,
          "minX": -508.543,
          "minZ": -604.543,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_28:площадка",
          "maxX": -484.589,
          "maxZ": -596.589,
          "minX": -491.411,
          "minZ": -603.411,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_29:площадка",
          "maxX": -468.008,
          "maxZ": -596.008,
          "minX": -475.992,
          "minZ": -603.992,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_30:площадка",
          "maxX": -451.978,
          "maxZ": -595.978,
          "minX": -460.022,
          "minZ": -604.022,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_31:площадка",
          "maxX": -435.375,
          "maxZ": -595.375,
          "minX": -444.625,
          "minZ": -604.625,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_32:площадка",
          "maxX": -404.884,
          "maxZ": -596.884,
          "minX": -411.116,
          "minZ": -603.116,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_33:площадка",
          "maxX": -387.723,
          "maxZ": -595.723,
          "minX": -396.277,
          "minZ": -604.277,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_34:площадка",
          "maxX": -372.492,
          "maxZ": -596.492,
          "minX": -379.508,
          "minZ": -603.508,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_35:площадка",
          "maxX": -356.144,
          "maxZ": -596.144,
          "minX": -363.856,
          "minZ": -603.856,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_36:площадка",
          "maxX": -323.407,
          "maxZ": -595.407,
          "minX": -332.593,
          "minZ": -604.593,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_37:площадка",
          "maxX": -627.392,
          "maxZ": -579.392,
          "minX": -636.608,
          "minZ": -588.608,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_38:площадка",
          "maxX": -611.599,
          "maxZ": -579.599,
          "minX": -620.401,
          "minZ": -588.401,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_39:площадка",
          "maxX": -548.094,
          "maxZ": -580.094,
          "minX": -555.906,
          "minZ": -587.906,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_40:площадка",
          "maxX": -515.629,
          "maxZ": -579.629,
          "minX": -524.371,
          "minZ": -588.371,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_41:площадка",
          "maxX": -499.402,
          "maxZ": -579.402,
          "minX": -508.598,
          "minZ": -588.598,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_42:площадка",
          "maxX": -468.732,
          "maxZ": -580.732,
          "minX": -475.268,
          "minZ": -587.268,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_43:площадка",
          "maxX": -451.746,
          "maxZ": -579.746,
          "minX": -460.254,
          "minZ": -588.254,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_44:площадка",
          "maxX": -436.615,
          "maxZ": -580.615,
          "minX": -443.385,
          "minZ": -587.385,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_45:площадка",
          "maxX": -388.168,
          "maxZ": -580.168,
          "minX": -395.832,
          "minZ": -587.832,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_46:площадка",
          "maxX": -356.905,
          "maxZ": -580.905,
          "minX": -363.095,
          "minZ": -587.095,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_47:площадка",
          "maxX": -340.39,
          "maxZ": -580.39,
          "minX": -347.61,
          "minZ": -587.61,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_48:площадка",
          "maxX": -323.764,
          "maxZ": -579.764,
          "minX": -332.236,
          "minZ": -588.236,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_49:площадка",
          "maxX": -595.372,
          "maxZ": -563.372,
          "minX": -604.628,
          "minZ": -572.628,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_50:площадка",
          "maxX": -563.566,
          "maxZ": -563.566,
          "minX": -572.434,
          "minZ": -572.434,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_51:площадка",
          "maxX": -516.025,
          "maxZ": -564.025,
          "minX": -523.975,
          "minZ": -571.975,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_52:площадка",
          "maxX": -499.974,
          "maxZ": -563.974,
          "minX": -508.026,
          "minZ": -572.026,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_53:площадка",
          "maxX": -403.907,
          "maxZ": -563.907,
          "minX": -412.093,
          "minZ": -572.093,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_54:площадка",
          "maxX": -355.351,
          "maxZ": -563.351,
          "minX": -364.649,
          "minZ": -572.649,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_55:площадка",
          "maxX": -564.116,
          "maxZ": -548.116,
          "minX": -571.884,
          "minZ": -555.884,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_56:площадка",
          "maxX": -547.128,
          "maxZ": -547.128,
          "minX": -556.872,
          "minZ": -556.872,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_57:площадка",
          "maxX": -499.983,
          "maxZ": -547.983,
          "minX": -508.017,
          "minZ": -556.017,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_58:площадка",
          "maxX": -484.727,
          "maxZ": -548.727,
          "minX": -491.273,
          "minZ": -555.273,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_59:площадка",
          "maxX": -468.536,
          "maxZ": -548.536,
          "minX": -475.464,
          "minZ": -555.464,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_60:площадка",
          "maxX": -452.937,
          "maxZ": -548.937,
          "minX": -459.063,
          "minZ": -555.063,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_61:площадка",
          "maxX": -419.509,
          "maxZ": -547.509,
          "minX": -428.491,
          "minZ": -556.491,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_62:площадка",
          "maxX": -404.562,
          "maxZ": -548.562,
          "minX": -411.438,
          "minZ": -555.438,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_63:площадка",
          "maxX": -371.735,
          "maxZ": -547.735,
          "minX": -380.265,
          "minZ": -556.265,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_64:площадка",
          "maxX": -339.972,
          "maxZ": -547.972,
          "minX": -348.028,
          "minZ": -556.028,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_65:площадка",
          "maxX": -628.786,
          "maxZ": -532.786,
          "minX": -635.214,
          "minZ": -539.214,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_66:площадка",
          "maxX": -595.681,
          "maxZ": -531.681,
          "minX": -604.319,
          "minZ": -540.319,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_67:площадка",
          "maxX": -532.743,
          "maxZ": -532.743,
          "minX": -539.257,
          "minZ": -539.257,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_68:площадка",
          "maxX": -515.903,
          "maxZ": -531.903,
          "minX": -524.097,
          "minZ": -540.097,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_69:площадка",
          "maxX": -436.623,
          "maxZ": -532.623,
          "minX": -443.377,
          "minZ": -539.377,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_70:площадка",
          "maxX": -420.51,
          "maxZ": -532.51,
          "minX": -427.49,
          "minZ": -539.49,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_71:площадка",
          "maxX": -404.59,
          "maxZ": -532.59,
          "minX": -411.41,
          "minZ": -539.41,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_72:площадка",
          "maxX": -387.279,
          "maxZ": -531.279,
          "minX": -396.721,
          "minZ": -540.721,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_73:площадка",
          "maxX": -356.235,
          "maxZ": -532.235,
          "minX": -363.765,
          "minZ": -539.765,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_76:площадка",
          "maxX": -628.242,
          "maxZ": -516.242,
          "minX": -635.758,
          "minZ": -523.758,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_77:площадка",
          "maxX": -595.295,
          "maxZ": -515.295,
          "minX": -604.705,
          "minZ": -524.705,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_78:площадка",
          "maxX": -579.271,
          "maxZ": -515.271,
          "minX": -588.729,
          "minZ": -524.729,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_79:площадка",
          "maxX": -564.864,
          "maxZ": -516.864,
          "minX": -571.136,
          "minZ": -523.136,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_80:площадка",
          "maxX": -532.875,
          "maxZ": -516.875,
          "minX": -539.125,
          "minZ": -523.125,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_81:площадка",
          "maxX": -563.072,
          "maxZ": -499.072,
          "minX": -572.928,
          "minZ": -508.928,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_82:площадка",
          "maxX": -547.535,
          "maxZ": -499.535,
          "minX": -556.465,
          "minZ": -508.465,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_83:площадка",
          "maxX": -531.311,
          "maxZ": -499.311,
          "minX": -540.689,
          "minZ": -508.689,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_84:площадка",
          "maxX": -563.444,
          "maxZ": -483.444,
          "minX": -572.556,
          "minZ": -492.556,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_85:площадка",
          "maxX": -547.327,
          "maxZ": -483.327,
          "minX": -556.673,
          "minZ": -492.673,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_86:площадка",
          "maxX": -532.182,
          "maxZ": -484.182,
          "minX": -539.818,
          "minZ": -491.818,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_87:площадка",
          "maxX": -596.767,
          "maxZ": -468.767,
          "minX": -603.233,
          "minZ": -475.233,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_88:площадка",
          "maxX": -580.08,
          "maxZ": -468.08,
          "minX": -587.92,
          "minZ": -475.92,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_89:площадка",
          "maxX": -564.239,
          "maxZ": -468.239,
          "minX": -571.761,
          "minZ": -475.761,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_90:площадка",
          "maxX": -548.532,
          "maxZ": -468.532,
          "minX": -555.468,
          "minZ": -475.468,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_91:площадка",
          "maxX": -531.279,
          "maxZ": -467.279,
          "minX": -540.721,
          "minZ": -476.721,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_92:площадка",
          "maxX": -580.925,
          "maxZ": -452.925,
          "minX": -587.075,
          "minZ": -459.075,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_93:площадка",
          "maxX": -548.672,
          "maxZ": -452.672,
          "minX": -555.328,
          "minZ": -459.328,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_94:площадка",
          "maxX": -532.598,
          "maxZ": -452.598,
          "minX": -539.402,
          "minZ": -459.402,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_95:площадка",
          "maxX": -627.168,
          "maxZ": -435.168,
          "minX": -636.832,
          "minZ": -444.832,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_96:площадка",
          "maxX": -611.578,
          "maxZ": -435.578,
          "minX": -620.422,
          "minZ": -444.422,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_97:площадка",
          "maxX": -595.85,
          "maxZ": -435.85,
          "minX": -604.15,
          "minZ": -444.15,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_98:площадка",
          "maxX": -579.292,
          "maxZ": -435.292,
          "minX": -588.708,
          "minZ": -444.708,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_99:площадка",
          "maxX": -564.05,
          "maxZ": -436.05,
          "minX": -571.95,
          "minZ": -443.95,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_100:площадка",
          "maxX": -532.422,
          "maxZ": -436.422,
          "minX": -539.578,
          "minZ": -443.578,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_101:площадка",
          "maxX": -628.042,
          "maxZ": -420.042,
          "minX": -635.958,
          "minZ": -427.958,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_102:площадка",
          "maxX": -579.717,
          "maxZ": -419.717,
          "minX": -588.283,
          "minZ": -428.283,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_103:площадка",
          "maxX": -547.389,
          "maxZ": -419.389,
          "minX": -556.611,
          "minZ": -428.611,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_104:площадка",
          "maxX": -628.384,
          "maxZ": -404.384,
          "minX": -635.616,
          "minZ": -411.616,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_105:площадка",
          "maxX": -611.36,
          "maxZ": -403.36,
          "minX": -620.64,
          "minZ": -412.64,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_106:площадка",
          "maxX": -611.638,
          "maxZ": -387.638,
          "minX": -620.362,
          "minZ": -396.362,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_107:площадка",
          "maxX": -595.347,
          "maxZ": -387.347,
          "minX": -604.653,
          "minZ": -396.653,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_108:площадка",
          "maxX": -579.162,
          "maxZ": -387.162,
          "minX": -588.838,
          "minZ": -396.838,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_109:площадка",
          "maxX": -563.099,
          "maxZ": -387.099,
          "minX": -572.901,
          "minZ": -396.901,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_110:площадка",
          "maxX": -547.263,
          "maxZ": -387.263,
          "minX": -556.737,
          "minZ": -396.737,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_111:площадка",
          "maxX": -532.417,
          "maxZ": -388.417,
          "minX": -539.583,
          "minZ": -395.583,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_112:площадка",
          "maxX": -611.22,
          "maxZ": -371.22,
          "minX": -620.78,
          "minZ": -380.78,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_113:площадка",
          "maxX": -580.337,
          "maxZ": -372.337,
          "minX": -587.663,
          "minZ": -379.663,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_114:площадка",
          "maxX": -563.66,
          "maxZ": -371.66,
          "minX": -572.34,
          "minZ": -380.34,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_115:площадка",
          "maxX": -531.286,
          "maxZ": -371.286,
          "minX": -540.714,
          "minZ": -380.714,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_116:площадка",
          "maxX": -627.174,
          "maxZ": -355.174,
          "minX": -636.826,
          "minZ": -364.826,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_117:площадка",
          "maxX": -548.966,
          "maxZ": -356.966,
          "minX": -555.034,
          "minZ": -363.034,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_118:площадка",
          "maxX": -532.807,
          "maxZ": -356.807,
          "minX": -539.193,
          "minZ": -363.193,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_119:площадка",
          "maxX": -627.245,
          "maxZ": -339.245,
          "minX": -636.755,
          "minZ": -348.755,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_120:площадка",
          "maxX": -612.947,
          "maxZ": -340.947,
          "minX": -619.053,
          "minZ": -347.053,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_121:площадка",
          "maxX": -595.866,
          "maxZ": -339.866,
          "minX": -604.134,
          "minZ": -348.134,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_122:площадка",
          "maxX": -547.986,
          "maxZ": -339.986,
          "minX": -556.014,
          "minZ": -348.014,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_123:площадка",
          "maxX": -531.851,
          "maxZ": -339.851,
          "minX": -540.149,
          "minZ": -348.149,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_124:площадка",
          "maxX": -548.273,
          "maxZ": -324.273,
          "minX": -555.727,
          "minZ": -331.727,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_125:площадка",
          "maxX": -532.291,
          "maxZ": -324.291,
          "minX": -539.709,
          "minZ": -331.709,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_134:площадка",
          "maxX": 17.277,
          "maxZ": -622.723,
          "minX": 4.056,
          "minZ": -635.944,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_135:площадка",
          "maxX": 37.044,
          "maxZ": -624.29,
          "minX": 26.956,
          "minZ": -634.377,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_136:площадка",
          "maxX": 123.479,
          "maxZ": -623.187,
          "minX": 111.187,
          "minZ": -635.479,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_137:площадка",
          "maxX": 144.415,
          "maxZ": -623.585,
          "minX": 132.918,
          "minZ": -635.082,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_138:площадка",
          "maxX": 188.409,
          "maxZ": -622.257,
          "minX": 174.257,
          "minZ": -636.409,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_142:площадка",
          "maxX": 101.409,
          "maxZ": -602.591,
          "minX": 90.591,
          "minZ": -613.409,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_147:площадка",
          "maxX": 58.252,
          "maxZ": -581.748,
          "minX": 48.415,
          "minZ": -591.585,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_148:площадка",
          "maxX": 101.178,
          "maxZ": -581.489,
          "minX": 90.822,
          "minZ": -591.844,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_149:площадка",
          "maxX": 123.661,
          "maxZ": -580.339,
          "minX": 111.006,
          "minZ": -592.994,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_156:площадка",
          "maxX": 102.87,
          "maxZ": -558.463,
          "minX": 89.13,
          "minZ": -572.203,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_162:площадка",
          "maxX": 102.805,
          "maxZ": -537.195,
          "minX": 89.195,
          "minZ": -550.805,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_174:площадка",
          "maxX": 548.136,
          "maxZ": -615.501,
          "minX": 528.228,
          "minZ": -635.409,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_175:площадка",
          "maxX": 574.97,
          "maxZ": -617.757,
          "minX": 559.575,
          "minZ": -633.152,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_176:площадка",
          "maxX": 603.199,
          "maxZ": -618.62,
          "minX": 589.529,
          "minZ": -632.29,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_180:площадка",
          "maxX": 518.109,
          "maxZ": -587.345,
          "minX": 500.073,
          "minZ": -605.382,
          "y": 0.045
        },
        {
          "blend": 14,
          "id": "b_district_3_0_181:площадка",
          "maxX": 546.516,
          "maxZ": -588.029,
          "minX": 529.847,
          "minZ": -604.698,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_182:площадка",
          "maxX": 576.36,
          "maxZ": -587.276,
          "minX": 558.185,
          "minZ": -605.451,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_183:площадка",
          "maxX": 603.771,
          "maxZ": -588.956,
          "minX": 588.956,
          "minZ": -603.771,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_184:площадка",
          "maxX": 634.131,
          "maxZ": -587.688,
          "minX": 616.778,
          "minZ": -605.04,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_188:площадка",
          "maxX": 546.891,
          "maxZ": -558.564,
          "minX": 529.473,
          "minZ": -575.982,
          "y": 0.031
        },
        {
          "blend": 14,
          "id": "b_district_3_0_189:площадка",
          "maxX": 574.506,
          "maxZ": -560.039,
          "minX": 560.039,
          "minZ": -574.506,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_190:площадка",
          "maxX": 635.34,
          "maxZ": -557.387,
          "minX": 615.569,
          "minZ": -577.159,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_197:площадка",
          "maxX": 575.15,
          "maxZ": -530.305,
          "minX": 559.396,
          "minZ": -546.059,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_198:площадка",
          "maxX": 606.063,
          "maxZ": -528.483,
          "minX": 586.664,
          "minZ": -547.881,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_200:площадка",
          "maxX": 606.827,
          "maxZ": -498.628,
          "minX": 585.9,
          "minZ": -519.554,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_202:площадка",
          "maxX": 604.066,
          "maxZ": -472.297,
          "minX": 588.661,
          "minZ": -487.703,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_203:площадка",
          "maxX": 634.899,
          "maxZ": -470.555,
          "minX": 616.01,
          "minZ": -489.445,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_205:площадка",
          "maxX": 604.045,
          "maxZ": -443.227,
          "minX": 588.682,
          "minZ": -458.591,
          "y": 0.001
        },
        {
          "blend": 14,
          "id": "b_district_3_0_206:площадка",
          "maxX": 632.966,
          "maxZ": -443.398,
          "minX": 617.943,
          "minZ": -458.42,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_207:площадка",
          "maxX": 634.145,
          "maxZ": -413.127,
          "minX": 616.764,
          "minZ": -430.509,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_210:площадка",
          "maxX": 633.416,
          "maxZ": -384.766,
          "minX": 617.493,
          "minZ": -400.689,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_212:площадка",
          "maxX": 635.885,
          "maxZ": -353.206,
          "minX": 615.024,
          "minZ": -374.067,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_214:площадка",
          "maxX": 606.504,
          "maxZ": -324.405,
          "minX": 586.223,
          "minZ": -344.686,
          "y": 0.029
        },
        {
          "blend": 14,
          "id": "b_district_3_0_215:площадка",
          "maxX": 634.996,
          "maxZ": -325.004,
          "minX": 615.914,
          "minZ": -344.086,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_216:площадка",
          "maxX": -556.971,
          "maxZ": -295.153,
          "minX": -577.574,
          "minZ": -315.756,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_217:площадка",
          "maxX": -527.628,
          "maxZ": -294.901,
          "minX": -548.735,
          "minZ": -316.008,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_218:площадка",
          "maxX": -615.396,
          "maxZ": -266.305,
          "minX": -635.513,
          "minZ": -286.422,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_219:площадка",
          "maxX": -587.106,
          "maxZ": -267.106,
          "minX": -605.621,
          "minZ": -285.621,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_220:площадка",
          "maxX": -557.275,
          "maxZ": -266.366,
          "minX": -577.27,
          "minZ": -286.361,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_221:площадка",
          "maxX": -617.539,
          "maxZ": -239.357,
          "minX": -633.37,
          "minZ": -255.188,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_222:площадка",
          "maxX": -589.266,
          "maxZ": -240.176,
          "minX": -603.461,
          "minZ": -254.37,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_223:площадка",
          "maxX": -528.784,
          "maxZ": -237.874,
          "minX": -547.58,
          "minZ": -256.671,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_224:площадка",
          "maxX": -558.757,
          "maxZ": -209.666,
          "minX": -575.789,
          "minZ": -226.698,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_225:площадка",
          "maxX": -615.968,
          "maxZ": -179.604,
          "minX": -634.941,
          "minZ": -198.577,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_226:площадка",
          "maxX": -587.634,
          "maxZ": -151.271,
          "minX": -605.093,
          "minZ": -168.729,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_227:площадка",
          "maxX": -556.806,
          "maxZ": -149.533,
          "minX": -577.74,
          "minZ": -170.467,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_228:площадка",
          "maxX": -588.46,
          "maxZ": -123.005,
          "minX": -604.268,
          "minZ": -138.813,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_229:площадка",
          "maxX": -531.002,
          "maxZ": -123.73,
          "minX": -545.361,
          "minZ": -138.089,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_230:площадка",
          "maxX": -587.258,
          "maxZ": -92.712,
          "minX": -605.469,
          "minZ": -110.924,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_231:площадка",
          "maxX": -587.08,
          "maxZ": -63.444,
          "minX": -605.647,
          "minZ": -82.011,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_232:площадка",
          "maxX": -557.333,
          "maxZ": -62.787,
          "minX": -577.213,
          "minZ": -82.667,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_233:площадка",
          "maxX": -617.778,
          "maxZ": -35.96,
          "minX": -633.131,
          "minZ": -51.313,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_234:площадка",
          "maxX": -527.394,
          "maxZ": -32.849,
          "minX": -548.969,
          "minZ": -54.424,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_235:площадка",
          "maxX": -586.144,
          "maxZ": -4.326,
          "minX": -606.583,
          "minZ": -24.765,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_236:площадка",
          "maxX": -559.268,
          "maxZ": -6.541,
          "minX": -575.277,
          "minZ": -22.55,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_239:площадка",
          "maxX": 575.747,
          "maxZ": -238.799,
          "minX": 558.799,
          "minZ": -255.747,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_240:площадка",
          "maxX": 606.412,
          "maxZ": -237.225,
          "minX": 586.316,
          "minZ": -257.321,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_241:площадка",
          "maxX": 576.627,
          "maxZ": -208.827,
          "minX": 557.918,
          "minZ": -227.536,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_242:площадка",
          "maxX": 604.951,
          "maxZ": -209.595,
          "minX": 587.777,
          "minZ": -226.769,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_243:площадка",
          "maxX": 635.453,
          "maxZ": -179.092,
          "minX": 615.456,
          "minZ": -199.089,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_244:площадка",
          "maxX": 546.949,
          "maxZ": -122.141,
          "minX": 529.414,
          "minZ": -139.677,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_245:площадка",
          "maxX": 606.471,
          "maxZ": -120.801,
          "minX": 586.256,
          "minZ": -141.017,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_246:площадка",
          "maxX": 577.722,
          "maxZ": -91.369,
          "minX": 556.824,
          "minZ": -112.267,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_247:площадка",
          "maxX": 577.421,
          "maxZ": -62.579,
          "minX": 557.125,
          "minZ": -82.875,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_248:площадка",
          "maxX": 604.643,
          "maxZ": -64.448,
          "minX": 588.084,
          "minZ": -81.007,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_249:площадка",
          "maxX": 574.625,
          "maxZ": -36.284,
          "minX": 559.921,
          "minZ": -50.988,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_250:площадка",
          "maxX": 634.291,
          "maxZ": -34.8,
          "minX": 616.618,
          "minZ": -52.473,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_251:площадка",
          "maxX": 547.074,
          "maxZ": -5.653,
          "minX": 529.289,
          "minZ": -23.438,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_252:площадка",
          "maxX": 576.368,
          "maxZ": -5.451,
          "minX": 558.178,
          "minZ": -23.64,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_253:площадка",
          "maxX": 632.263,
          "maxZ": -7.737,
          "minX": 618.646,
          "minZ": -21.354,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_254:площадка",
          "maxX": -588.769,
          "maxZ": 22.14,
          "minX": -603.959,
          "minZ": 6.95,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_255:площадка",
          "maxX": -618.531,
          "maxZ": 50.56,
          "minX": -632.378,
          "minZ": 36.713,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_256:площадка",
          "maxX": -559.809,
          "maxZ": 51.1,
          "minX": -574.737,
          "minZ": 36.172,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_257:площадка",
          "maxX": -531.258,
          "maxZ": 50.561,
          "minX": -545.106,
          "minZ": 36.712,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_258:площадка",
          "maxX": -530.611,
          "maxZ": 80.298,
          "minX": -545.753,
          "minZ": 65.156,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_259:площадка",
          "maxX": -618.529,
          "maxZ": 137.835,
          "minX": -632.38,
          "minZ": 123.983,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_260:площадка",
          "maxX": -527.869,
          "maxZ": 141.222,
          "minX": -548.495,
          "minZ": 120.596,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_261:площадка",
          "maxX": -589.262,
          "maxZ": 167.102,
          "minX": -603.465,
          "minZ": 152.898,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_262:площадка",
          "maxX": -617.413,
          "maxZ": 197.133,
          "minX": -633.496,
          "minZ": 181.049,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_263:площадка",
          "maxX": -588.969,
          "maxZ": 196.486,
          "minX": -603.759,
          "minZ": 181.696,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_264:площадка",
          "maxX": -559.472,
          "maxZ": 225.982,
          "minX": -575.073,
          "minZ": 210.381,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_265:площадка",
          "maxX": -588.573,
          "maxZ": 255.064,
          "minX": -604.155,
          "minZ": 239.482,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_268:площадка",
          "maxX": 584.087,
          "maxZ": 35.515,
          "minX": 558.77,
          "minZ": 10.199,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_269:площадка",
          "maxX": 583.397,
          "maxZ": 126.255,
          "minX": 559.46,
          "minZ": 102.317,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_270:площадка",
          "maxX": 633.075,
          "maxZ": 267.36,
          "minX": 601.211,
          "minZ": 235.497,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_272:площадка",
          "maxX": 632.032,
          "maxZ": 312.032,
          "minX": 602.254,
          "minZ": 282.254,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_281:площадка",
          "maxX": -129.89,
          "maxZ": 590.11,
          "minX": -150.11,
          "minZ": 569.89,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_283:площадка",
          "maxX": -169.973,
          "maxZ": 630.027,
          "minX": -190.027,
          "minZ": 609.973,
          "y": 0.016
        },
        {
          "blend": 14,
          "id": "b_district_1_3_284:площадка",
          "maxX": -87.376,
          "maxZ": 632.624,
          "minX": -112.624,
          "minZ": 607.376,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_285:площадка",
          "maxX": -44.429,
          "maxZ": 635.571,
          "minX": -75.571,
          "minZ": 604.429,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_290:площадка",
          "maxX": 631.369,
          "maxZ": 539.94,
          "minX": 602.917,
          "minZ": 511.488,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_291:площадка",
          "maxX": 538.224,
          "maxZ": 583.938,
          "minX": 513.204,
          "minZ": 558.919,
          "y": 0.016
        },
        {
          "blend": 14,
          "id": "b_district_3_3_292:площадка",
          "maxX": 630.601,
          "maxZ": 584.886,
          "minX": 603.685,
          "minZ": 557.971,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_293:площадка",
          "maxX": 585.31,
          "maxZ": 631.025,
          "minX": 557.547,
          "minZ": 603.261,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_294:площадка",
          "maxX": 635.313,
          "maxZ": 635.313,
          "minX": 598.973,
          "minZ": 598.973,
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
