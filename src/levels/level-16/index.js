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
          "buildings": 124,
          "lights": 6,
          "props": 99,
          "roads": 15
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
          "buildings": 37,
          "props": 29,
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
          "buildings": 21,
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
          "buildings": 20,
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
          "buildings": 9,
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
          "buildings": 23,
          "props": 54
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
          "props": 16
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
          "buildings": 12,
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
          "buildings": 7,
          "channels": 1,
          "props": 53
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
          "channels": 1,
          "props": 6
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
          "buildings": 4,
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
          "buildings": 26,
          "props": 66
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
          "buildings": 27
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
          "buildings": 10
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
          "buildings": 8
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
          "buildings": 1
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
          "buildings": 5,
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
          "maxX": -627.293,
          "maxZ": -627.293,
          "minX": -636.707,
          "minZ": -636.707,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_2:площадка",
          "maxX": -612.504,
          "maxZ": -628.504,
          "minX": -619.496,
          "minZ": -635.496,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_3:площадка",
          "maxX": -564.147,
          "maxZ": -628.147,
          "minX": -571.853,
          "minZ": -635.853,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_4:площадка",
          "maxX": -547.703,
          "maxZ": -627.703,
          "minX": -556.297,
          "minZ": -636.297,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_5:площадка",
          "maxX": -532.048,
          "maxZ": -628.048,
          "minX": -539.952,
          "minZ": -635.952,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_6:площадка",
          "maxX": -515.339,
          "maxZ": -627.339,
          "minX": -524.661,
          "minZ": -636.661,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_7:площадка",
          "maxX": -499.648,
          "maxZ": -627.648,
          "minX": -508.352,
          "minZ": -636.352,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_8:площадка",
          "maxX": -484.729,
          "maxZ": -628.729,
          "minX": -491.271,
          "minZ": -635.271,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_9:площадка",
          "maxX": -452.952,
          "maxZ": -628.952,
          "minX": -459.048,
          "minZ": -635.048,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_10:площадка",
          "maxX": -436.735,
          "maxZ": -628.735,
          "minX": -443.265,
          "minZ": -635.265,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_11:площадка",
          "maxX": -404.117,
          "maxZ": -628.117,
          "minX": -411.883,
          "minZ": -635.883,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_12:площадка",
          "maxX": -372.44,
          "maxZ": -628.44,
          "minX": -379.56,
          "minZ": -635.56,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_13:площадка",
          "maxX": -323.709,
          "maxZ": -627.709,
          "minX": -332.291,
          "minZ": -636.291,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_14:площадка",
          "maxX": -627.072,
          "maxZ": -611.072,
          "minX": -636.928,
          "minZ": -620.928,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_15:площадка",
          "maxX": -595.253,
          "maxZ": -611.253,
          "minX": -604.747,
          "minZ": -620.747,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_16:площадка",
          "maxX": -564.303,
          "maxZ": -612.303,
          "minX": -571.697,
          "minZ": -619.697,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_17:площадка",
          "maxX": -532.314,
          "maxZ": -612.314,
          "minX": -539.686,
          "minZ": -619.686,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_18:площадка",
          "maxX": -515.282,
          "maxZ": -611.282,
          "minX": -524.718,
          "minZ": -620.718,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_19:площадка",
          "maxX": -484.736,
          "maxZ": -612.736,
          "minX": -491.264,
          "minZ": -619.264,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_20:площадка",
          "maxX": -468.052,
          "maxZ": -612.052,
          "minX": -475.948,
          "minZ": -619.948,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_21:площадка",
          "maxX": -404.041,
          "maxZ": -612.041,
          "minX": -411.959,
          "minZ": -619.959,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_22:площадка",
          "maxX": -387.689,
          "maxZ": -611.689,
          "minX": -396.311,
          "minZ": -620.311,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_23:площадка",
          "maxX": -371.49,
          "maxZ": -611.49,
          "minX": -380.51,
          "minZ": -620.51,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_24:площадка",
          "maxX": -356.385,
          "maxZ": -612.385,
          "minX": -363.615,
          "minZ": -619.615,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_25:площадка",
          "maxX": -339.551,
          "maxZ": -611.551,
          "minX": -348.449,
          "minZ": -620.449,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_26:площадка",
          "maxX": -323.457,
          "maxZ": -611.457,
          "minX": -332.543,
          "minZ": -620.543,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_27:площадка",
          "maxX": -628.589,
          "maxZ": -596.589,
          "minX": -635.411,
          "minZ": -603.411,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_28:площадка",
          "maxX": -612.008,
          "maxZ": -596.008,
          "minX": -619.992,
          "minZ": -603.992,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_29:площадка",
          "maxX": -595.978,
          "maxZ": -595.978,
          "minX": -604.022,
          "minZ": -604.022,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_30:площадка",
          "maxX": -579.375,
          "maxZ": -595.375,
          "minX": -588.625,
          "minZ": -604.625,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_31:площадка",
          "maxX": -564.29,
          "maxZ": -596.29,
          "minX": -571.71,
          "minZ": -603.71,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_32:площадка",
          "maxX": -548.521,
          "maxZ": -596.521,
          "minX": -555.479,
          "minZ": -603.479,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_33:площадка",
          "maxX": -532.251,
          "maxZ": -596.251,
          "minX": -539.749,
          "minZ": -603.749,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_34:площадка",
          "maxX": -500.144,
          "maxZ": -596.144,
          "minX": -507.856,
          "minZ": -603.856,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_35:площадка",
          "maxX": -468.573,
          "maxZ": -596.573,
          "minX": -475.427,
          "minZ": -603.427,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_36:площадка",
          "maxX": -451.564,
          "maxZ": -595.564,
          "minX": -460.436,
          "minZ": -604.436,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_37:площадка",
          "maxX": -419.718,
          "maxZ": -595.718,
          "minX": -428.282,
          "minZ": -604.282,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_38:площадка",
          "maxX": -404.094,
          "maxZ": -596.094,
          "minX": -411.906,
          "minZ": -603.906,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_39:площадка",
          "maxX": -371.051,
          "maxZ": -595.051,
          "minX": -380.949,
          "minZ": -604.949,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_40:площадка",
          "maxX": -356.804,
          "maxZ": -596.804,
          "minX": -363.196,
          "minZ": -603.196,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_41:площадка",
          "maxX": -324.936,
          "maxZ": -596.936,
          "minX": -331.064,
          "minZ": -603.064,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_42:площадка",
          "maxX": -627.753,
          "maxZ": -579.753,
          "minX": -636.247,
          "minZ": -588.247,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_43:площадка",
          "maxX": -612.659,
          "maxZ": -580.659,
          "minX": -619.341,
          "minZ": -587.341,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_44:площадка",
          "maxX": -563.468,
          "maxZ": -579.468,
          "minX": -572.532,
          "minZ": -588.532,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_45:площадка",
          "maxX": -548.774,
          "maxZ": -580.774,
          "minX": -555.226,
          "minZ": -587.226,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_46:площадка",
          "maxX": -531.896,
          "maxZ": -579.896,
          "minX": -540.104,
          "minZ": -588.104,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_47:площадка",
          "maxX": -499.386,
          "maxZ": -579.386,
          "minX": -508.614,
          "minZ": -588.614,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_48:площадка",
          "maxX": -484.216,
          "maxZ": -580.216,
          "minX": -491.784,
          "minZ": -587.784,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_49:площадка",
          "maxX": -467.585,
          "maxZ": -579.585,
          "minX": -476.415,
          "minZ": -588.415,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_50:площадка",
          "maxX": -452.484,
          "maxZ": -580.484,
          "minX": -459.516,
          "minZ": -587.516,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_51:площадка",
          "maxX": -436.907,
          "maxZ": -580.907,
          "minX": -443.093,
          "minZ": -587.093,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_52:площадка",
          "maxX": -419.541,
          "maxZ": -579.541,
          "minX": -428.459,
          "minZ": -588.459,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_53:площадка",
          "maxX": -404.802,
          "maxZ": -580.802,
          "minX": -411.198,
          "minZ": -587.198,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_54:площадка",
          "maxX": -355.288,
          "maxZ": -579.288,
          "minX": -364.712,
          "minZ": -588.712,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_55:площадка",
          "maxX": -339.211,
          "maxZ": -579.211,
          "minX": -348.789,
          "minZ": -588.789,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_56:площадка",
          "maxX": -324.116,
          "maxZ": -580.116,
          "minX": -331.884,
          "minZ": -587.884,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_57:площадка",
          "maxX": -612.416,
          "maxZ": -564.416,
          "minX": -619.584,
          "minZ": -571.584,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_58:площадка",
          "maxX": -595.983,
          "maxZ": -563.983,
          "minX": -604.017,
          "minZ": -572.017,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_59:площадка",
          "maxX": -580.727,
          "maxZ": -564.727,
          "minX": -587.273,
          "minZ": -571.273,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_60:площадка",
          "maxX": -564.536,
          "maxZ": -564.536,
          "minX": -571.464,
          "minZ": -571.464,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_61:площадка",
          "maxX": -532.53,
          "maxZ": -564.53,
          "minX": -539.47,
          "minZ": -571.47,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_62:площадка",
          "maxX": -500.295,
          "maxZ": -564.295,
          "minX": -507.705,
          "minZ": -571.705,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_63:площадка",
          "maxX": -483.204,
          "maxZ": -563.204,
          "minX": -492.796,
          "minZ": -572.796,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_64:площадка",
          "maxX": -468.603,
          "maxZ": -564.603,
          "minX": -475.397,
          "minZ": -571.397,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_65:площадка",
          "maxX": -451.972,
          "maxZ": -563.972,
          "minX": -460.028,
          "minZ": -572.028,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_66:площадка",
          "maxX": -436.261,
          "maxZ": -564.261,
          "minX": -443.739,
          "minZ": -571.739,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_67:площадка",
          "maxX": -419.141,
          "maxZ": -563.141,
          "minX": -428.859,
          "minZ": -572.859,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_68:площадка",
          "maxX": -387.779,
          "maxZ": -563.779,
          "minX": -396.221,
          "minZ": -572.221,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_69:площадка",
          "maxX": -356.854,
          "maxZ": -564.854,
          "minX": -363.146,
          "minZ": -571.146,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_70:площадка",
          "maxX": -323.795,
          "maxZ": -563.795,
          "minX": -332.205,
          "minZ": -572.205,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_71:площадка",
          "maxX": -628.848,
          "maxZ": -548.848,
          "minX": -635.152,
          "minZ": -555.152,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_72:площадка",
          "maxX": -612.83,
          "maxZ": -548.83,
          "minX": -619.17,
          "minZ": -555.17,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_73:площадка",
          "maxX": -564.093,
          "maxZ": -548.093,
          "minX": -571.907,
          "minZ": -555.907,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_74:площадка",
          "maxX": -548.235,
          "maxZ": -548.235,
          "minX": -555.765,
          "minZ": -555.765,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_75:площадка",
          "maxX": -500.027,
          "maxZ": -548.027,
          "minX": -507.973,
          "minZ": -555.973,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_76:площадка",
          "maxX": -483.491,
          "maxZ": -547.491,
          "minX": -492.509,
          "minZ": -556.509,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_77:площадка",
          "maxX": -435.534,
          "maxZ": -547.534,
          "minX": -444.466,
          "minZ": -556.466,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_78:площадка",
          "maxX": -419.846,
          "maxZ": -547.846,
          "minX": -428.154,
          "minZ": -556.154,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_79:площадка",
          "maxX": -403.087,
          "maxZ": -547.087,
          "minX": -412.913,
          "minZ": -556.913,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_80:площадка",
          "maxX": -388.875,
          "maxZ": -548.875,
          "minX": -395.125,
          "minZ": -555.125,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_81:площадка",
          "maxX": -372.626,
          "maxZ": -548.626,
          "minX": -379.374,
          "minZ": -555.374,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_82:площадка",
          "maxX": -355.54,
          "maxZ": -547.54,
          "minX": -364.46,
          "minZ": -556.46,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_83:площадка",
          "maxX": -339.376,
          "maxZ": -547.376,
          "minX": -348.624,
          "minZ": -556.624,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_85:площадка",
          "maxX": -595.467,
          "maxZ": -531.467,
          "minX": -604.533,
          "minZ": -540.533,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_86:площадка",
          "maxX": -580.946,
          "maxZ": -532.946,
          "minX": -587.054,
          "minZ": -539.054,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_87:площадка",
          "maxX": -547.815,
          "maxZ": -531.815,
          "minX": -556.185,
          "minZ": -540.185,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_88:площадка",
          "maxX": -531.082,
          "maxZ": -531.082,
          "minX": -540.918,
          "minZ": -540.918,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_89:площадка",
          "maxX": -500.078,
          "maxZ": -532.078,
          "minX": -507.922,
          "minZ": -539.922,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_90:площадка",
          "maxX": -483.454,
          "maxZ": -531.454,
          "minX": -492.546,
          "minZ": -540.546,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_91:площадка",
          "maxX": -468.748,
          "maxZ": -532.748,
          "minX": -475.252,
          "minZ": -539.252,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_92:площадка",
          "maxX": -435.863,
          "maxZ": -531.863,
          "minX": -444.137,
          "minZ": -540.137,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_93:площадка",
          "maxX": -404.892,
          "maxZ": -532.892,
          "minX": -411.108,
          "minZ": -539.108,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_94:площадка",
          "maxX": -387.965,
          "maxZ": -531.965,
          "minX": -396.035,
          "minZ": -540.035,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_95:площадка",
          "maxX": -372.508,
          "maxZ": -532.508,
          "minX": -379.492,
          "minZ": -539.492,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_96:площадка",
          "maxX": -355.884,
          "maxZ": -531.884,
          "minX": -364.116,
          "minZ": -540.116,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_99:площадка",
          "maxX": -628.767,
          "maxZ": -516.767,
          "minX": -635.233,
          "minZ": -523.233,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_100:площадка",
          "maxX": -612.08,
          "maxZ": -516.08,
          "minX": -619.92,
          "minZ": -523.92,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_101:площадка",
          "maxX": -627.392,
          "maxZ": -499.392,
          "minX": -636.608,
          "minZ": -508.608,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_102:площадка",
          "maxX": -611.291,
          "maxZ": -499.291,
          "minX": -620.709,
          "minZ": -508.709,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_103:площадка",
          "maxX": -595.104,
          "maxZ": -499.104,
          "minX": -604.896,
          "minZ": -508.896,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_104:площадка",
          "maxX": -563.791,
          "maxZ": -499.791,
          "minX": -572.209,
          "minZ": -508.209,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_105:площадка",
          "maxX": -547.732,
          "maxZ": -499.732,
          "minX": -556.268,
          "minZ": -508.268,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_106:площадка",
          "maxX": -627.298,
          "maxZ": -483.298,
          "minX": -636.702,
          "minZ": -492.702,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_107:площадка",
          "maxX": -612.333,
          "maxZ": -484.333,
          "minX": -619.667,
          "minZ": -491.667,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_108:площадка",
          "maxX": -596.834,
          "maxZ": -484.834,
          "minX": -603.166,
          "minZ": -491.166,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_109:площадка",
          "maxX": -580.528,
          "maxZ": -484.528,
          "minX": -587.472,
          "minZ": -491.472,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_110:площадка",
          "maxX": -563.923,
          "maxZ": -483.923,
          "minX": -572.077,
          "minZ": -492.077,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_111:площадка",
          "maxX": -547.491,
          "maxZ": -483.491,
          "minX": -556.509,
          "minZ": -492.509,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_112:площадка",
          "maxX": -531.501,
          "maxZ": -483.501,
          "minX": -540.499,
          "minZ": -492.499,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_113:площадка",
          "maxX": -611.343,
          "maxZ": -467.343,
          "minX": -620.657,
          "minZ": -476.657,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_114:площадка",
          "maxX": -596.763,
          "maxZ": -468.763,
          "minX": -603.237,
          "minZ": -475.237,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_115:площадка",
          "maxX": -580.662,
          "maxZ": -468.662,
          "minX": -587.338,
          "minZ": -475.338,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_116:площадка",
          "maxX": -547.477,
          "maxZ": -467.477,
          "minX": -556.523,
          "minZ": -476.523,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_117:площадка",
          "maxX": -531.731,
          "maxZ": -467.731,
          "minX": -540.269,
          "minZ": -476.269,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_118:площадка",
          "maxX": -612.68,
          "maxZ": -452.68,
          "minX": -619.32,
          "minZ": -459.32,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_119:площадка",
          "maxX": -595.122,
          "maxZ": -451.122,
          "minX": -604.878,
          "minZ": -460.878,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_120:площадка",
          "maxX": -580.332,
          "maxZ": -452.332,
          "minX": -587.668,
          "minZ": -459.668,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_121:площадка",
          "maxX": -548.237,
          "maxZ": -452.237,
          "minX": -555.763,
          "minZ": -459.763,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_122:площадка",
          "maxX": -531.748,
          "maxZ": -451.748,
          "minX": -540.252,
          "minZ": -460.252,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_123:площадка",
          "maxX": -628.189,
          "maxZ": -436.189,
          "minX": -635.811,
          "minZ": -443.811,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_124:площадка",
          "maxX": -579.459,
          "maxZ": -435.459,
          "minX": -588.541,
          "minZ": -444.541,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_125:площадка",
          "maxX": -563.523,
          "maxZ": -435.523,
          "minX": -572.477,
          "minZ": -444.477,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_126:площадка",
          "maxX": -547.924,
          "maxZ": -435.924,
          "minX": -556.076,
          "minZ": -444.076,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_127:площадка",
          "maxX": -531.768,
          "maxZ": -435.768,
          "minX": -540.232,
          "minZ": -444.232,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_128:площадка",
          "maxX": -628.309,
          "maxZ": -420.309,
          "minX": -635.691,
          "minZ": -427.691,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_129:площадка",
          "maxX": -611.653,
          "maxZ": -419.653,
          "minX": -620.347,
          "minZ": -428.347,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_130:площадка",
          "maxX": -596.965,
          "maxZ": -420.965,
          "minX": -603.035,
          "minZ": -427.035,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_131:площадка",
          "maxX": -580.826,
          "maxZ": -420.826,
          "minX": -587.174,
          "minZ": -427.174,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_132:площадка",
          "maxX": -563.668,
          "maxZ": -419.668,
          "minX": -572.332,
          "minZ": -428.332,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_133:площадка",
          "maxX": -531.126,
          "maxZ": -419.126,
          "minX": -540.874,
          "minZ": -428.874,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_134:площадка",
          "maxX": -627.565,
          "maxZ": -403.565,
          "minX": -636.435,
          "minZ": -412.435,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_135:площадка",
          "maxX": -611.796,
          "maxZ": -403.796,
          "minX": -620.204,
          "minZ": -412.204,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_136:площадка",
          "maxX": -596.056,
          "maxZ": -404.056,
          "minX": -603.944,
          "minZ": -411.944,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_137:площадка",
          "maxX": -579.174,
          "maxZ": -403.174,
          "minX": -588.826,
          "minZ": -412.826,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_138:площадка",
          "maxX": -547.522,
          "maxZ": -403.522,
          "minX": -556.478,
          "minZ": -412.478,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_139:площадка",
          "maxX": -531.938,
          "maxZ": -403.938,
          "minX": -540.062,
          "minZ": -412.062,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_140:площадка",
          "maxX": -628.13,
          "maxZ": -388.13,
          "minX": -635.87,
          "minZ": -395.87,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_141:площадка",
          "maxX": -612.816,
          "maxZ": -388.816,
          "minX": -619.184,
          "minZ": -395.184,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_142:площадка",
          "maxX": -595.245,
          "maxZ": -387.245,
          "minX": -604.755,
          "minZ": -396.755,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_143:площадка",
          "maxX": -580.947,
          "maxZ": -388.947,
          "minX": -587.053,
          "minZ": -395.053,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_144:площадка",
          "maxX": -563.866,
          "maxZ": -387.866,
          "minX": -572.134,
          "minZ": -396.134,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_145:площадка",
          "maxX": -547.075,
          "maxZ": -387.075,
          "minX": -556.925,
          "minZ": -396.925,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_146:площадка",
          "maxX": -531.448,
          "maxZ": -387.448,
          "minX": -540.552,
          "minZ": -396.552,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_147:площадка",
          "maxX": -627.536,
          "maxZ": -371.536,
          "minX": -636.464,
          "minZ": -380.464,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_148:площадка",
          "maxX": -612.157,
          "maxZ": -372.157,
          "minX": -619.843,
          "minZ": -379.843,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_149:площадка",
          "maxX": -580.762,
          "maxZ": -372.762,
          "minX": -587.238,
          "minZ": -379.238,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_150:площадка",
          "maxX": -563.925,
          "maxZ": -371.925,
          "minX": -572.075,
          "minZ": -380.075,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_151:площадка",
          "maxX": -547.233,
          "maxZ": -371.233,
          "minX": -556.767,
          "minZ": -380.767,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_152:площадка",
          "maxX": -596.467,
          "maxZ": -356.467,
          "minX": -603.533,
          "minZ": -363.533,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_153:площадка",
          "maxX": -563.192,
          "maxZ": -355.192,
          "minX": -572.808,
          "minZ": -364.808,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_154:площадка",
          "maxX": -531.164,
          "maxZ": -355.164,
          "minX": -540.836,
          "minZ": -364.836,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_155:площадка",
          "maxX": -628.537,
          "maxZ": -340.537,
          "minX": -635.463,
          "minZ": -347.463,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_156:площадка",
          "maxX": -612.327,
          "maxZ": -340.327,
          "minX": -619.673,
          "minZ": -347.673,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_157:площадка",
          "maxX": -595.224,
          "maxZ": -339.224,
          "minX": -604.776,
          "minZ": -348.776,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_158:площадка",
          "maxX": -580.436,
          "maxZ": -340.436,
          "minX": -587.564,
          "minZ": -347.564,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_159:площадка",
          "maxX": -563.218,
          "maxZ": -339.218,
          "minX": -572.782,
          "minZ": -348.782,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_160:площадка",
          "maxX": -548.251,
          "maxZ": -340.251,
          "minX": -555.749,
          "minZ": -347.749,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_161:площадка",
          "maxX": -628.737,
          "maxZ": -324.737,
          "minX": -635.263,
          "minZ": -331.263,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_162:площадка",
          "maxX": -612.514,
          "maxZ": -324.514,
          "minX": -619.486,
          "minZ": -331.486,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_163:площадка",
          "maxX": -596.276,
          "maxZ": -324.276,
          "minX": -603.724,
          "minZ": -331.724,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_164:площадка",
          "maxX": -579.861,
          "maxZ": -323.861,
          "minX": -588.139,
          "minZ": -332.139,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_165:площадка",
          "maxX": -564.875,
          "maxZ": -324.875,
          "minX": -571.125,
          "minZ": -331.125,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_166:площадка",
          "maxX": -547.28,
          "maxZ": -323.28,
          "minX": -556.72,
          "minZ": -332.72,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_167:площадка",
          "maxX": -532.623,
          "maxZ": -324.623,
          "minX": -539.377,
          "minZ": -331.377,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_169:площадка",
          "maxX": 16.994,
          "maxZ": -623.006,
          "minX": 4.339,
          "minZ": -635.661,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_170:площадка",
          "maxX": 101.126,
          "maxZ": -624.207,
          "minX": 90.874,
          "minZ": -634.459,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_171:площадка",
          "maxX": 165.999,
          "maxZ": -623.334,
          "minX": 154.001,
          "minZ": -635.332,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_172:площадка",
          "maxX": 188.543,
          "maxZ": -622.123,
          "minX": 174.123,
          "minZ": -636.543,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_173:площадка",
          "maxX": 208.972,
          "maxZ": -623.028,
          "minX": 196.361,
          "minZ": -635.639,
          "y": 0.048
        },
        {
          "blend": 14,
          "id": "b_district_2_0_176:площадка",
          "maxX": 38.295,
          "maxZ": -601.705,
          "minX": 25.705,
          "minZ": -614.295,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_177:площадка",
          "maxX": 80.15,
          "maxZ": -602.517,
          "minX": 69.184,
          "minZ": -613.483,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_178:площадка",
          "maxX": 124.137,
          "maxZ": -601.197,
          "minX": 110.53,
          "minZ": -614.803,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_179:площадка",
          "maxX": 145.044,
          "maxZ": -601.623,
          "minX": 132.289,
          "minZ": -614.377,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_185:площадка",
          "maxX": 123.812,
          "maxZ": -580.188,
          "minX": 110.855,
          "minZ": -593.145,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_186:площадка",
          "maxX": 145.421,
          "maxZ": -579.912,
          "minX": 131.912,
          "minZ": -593.421,
          "y": 0.021
        },
        {
          "blend": 14,
          "id": "b_district_3_0_204:площадка",
          "maxX": 516.871,
          "maxZ": -617.674,
          "minX": 501.311,
          "minZ": -633.235,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_205:площадка",
          "maxX": 635.26,
          "maxZ": -615.649,
          "minX": 615.649,
          "minZ": -635.26,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_211:площадка",
          "maxX": 517.04,
          "maxZ": -588.414,
          "minX": 501.142,
          "minZ": -604.313,
          "y": 0.024
        },
        {
          "blend": 14,
          "id": "b_district_3_0_212:площадка",
          "maxX": 603.178,
          "maxZ": -589.549,
          "minX": 589.549,
          "minZ": -603.178,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_220:площадка",
          "maxX": 604.245,
          "maxZ": -530.3,
          "minX": 588.482,
          "minZ": -546.064,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_224:площадка",
          "maxX": 604.359,
          "maxZ": -472.004,
          "minX": 588.368,
          "minZ": -487.996,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_225:площадка",
          "maxX": 633.305,
          "maxZ": -472.15,
          "minX": 617.604,
          "minZ": -487.85,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_227:площадка",
          "maxX": 606.571,
          "maxZ": -440.701,
          "minX": 586.156,
          "minZ": -461.117,
          "y": 0.022
        },
        {
          "blend": 14,
          "id": "b_district_3_0_228:площадка",
          "maxX": 632.083,
          "maxZ": -444.28,
          "minX": 618.826,
          "minZ": -457.538,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_231:площадка",
          "maxX": 603.86,
          "maxZ": -385.231,
          "minX": 588.867,
          "minZ": -400.224,
          "y": 0.049
        },
        {
          "blend": 14,
          "id": "b_district_3_0_234:площадка",
          "maxX": 634.573,
          "maxZ": -354.518,
          "minX": 616.336,
          "minZ": -372.755,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_236:площадка",
          "maxX": 606.804,
          "maxZ": -324.105,
          "minX": 585.923,
          "minZ": -344.986,
          "y": 0.033
        },
        {
          "blend": 14,
          "id": "b_district_0_1_237:площадка",
          "maxX": -616.642,
          "maxZ": -296.642,
          "minX": -634.267,
          "minZ": -314.267,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_238:площадка",
          "maxX": -528.851,
          "maxZ": -296.124,
          "minX": -547.512,
          "minZ": -314.785,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_239:площадка",
          "maxX": -618.823,
          "maxZ": -269.732,
          "minX": -632.086,
          "minZ": -282.995,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_240:площадка",
          "maxX": -557.828,
          "maxZ": -266.919,
          "minX": -576.717,
          "minZ": -285.808,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_241:площадка",
          "maxX": -531.357,
          "maxZ": -269.539,
          "minX": -545.007,
          "minZ": -283.189,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_242:площадка",
          "maxX": -557.253,
          "maxZ": -237.253,
          "minX": -577.292,
          "minZ": -257.292,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_243:площадка",
          "maxX": -530.232,
          "maxZ": -239.323,
          "minX": -546.132,
          "minZ": -255.222,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_244:площадка",
          "maxX": -557.467,
          "maxZ": -208.376,
          "minX": -577.078,
          "minZ": -227.988,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_245:площадка",
          "maxX": -529.765,
          "maxZ": -209.765,
          "minX": -546.599,
          "minZ": -226.599,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_246:площадка",
          "maxX": -616.056,
          "maxZ": -179.693,
          "minX": -634.853,
          "minZ": -198.489,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_247:площадка",
          "maxX": -558.178,
          "maxZ": -179.996,
          "minX": -576.367,
          "minZ": -198.186,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_248:площадка",
          "maxX": -527.529,
          "maxZ": -178.438,
          "minX": -548.835,
          "minZ": -199.744,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_249:площадка",
          "maxX": -615.395,
          "maxZ": -149.94,
          "minX": -635.514,
          "minZ": -170.06,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_250:площадка",
          "maxX": -557.319,
          "maxZ": -150.046,
          "minX": -577.227,
          "minZ": -169.954,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_251:площадка",
          "maxX": -531.312,
          "maxZ": -153.13,
          "minX": -545.052,
          "minZ": -166.87,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_252:площадка",
          "maxX": -618.025,
          "maxZ": -123.479,
          "minX": -632.884,
          "minZ": -138.339,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_253:площадка",
          "maxX": -558.137,
          "maxZ": -92.683,
          "minX": -576.408,
          "minZ": -110.954,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_254:площадка",
          "maxX": -531.253,
          "maxZ": -94.889,
          "minX": -545.111,
          "minZ": -108.747,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_255:площадка",
          "maxX": -586.004,
          "maxZ": -62.368,
          "minX": -606.723,
          "minZ": -83.087,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_256:площадка",
          "maxX": -559.467,
          "maxZ": -64.922,
          "minX": -575.078,
          "minZ": -80.533,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_257:площадка",
          "maxX": -618.73,
          "maxZ": -36.912,
          "minX": -632.179,
          "minZ": -50.361,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_258:площадка",
          "maxX": -586.423,
          "maxZ": -33.696,
          "minX": -606.304,
          "minZ": -53.577,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_259:площадка",
          "maxX": -586.943,
          "maxZ": -5.125,
          "minX": -605.784,
          "minZ": -23.966,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_260:площадка",
          "maxX": -530.144,
          "maxZ": -6.507,
          "minX": -546.22,
          "minZ": -22.583,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_262:площадка",
          "maxX": 635.774,
          "maxZ": -178.772,
          "minX": 615.135,
          "minZ": -199.41,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_263:площадка",
          "maxX": 605.246,
          "maxZ": -122.027,
          "minX": 587.481,
          "minZ": -139.792,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_264:площадка",
          "maxX": 634.937,
          "maxZ": -121.427,
          "minX": 615.973,
          "minZ": -140.391,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_265:площадка",
          "maxX": 577.419,
          "maxZ": -91.672,
          "minX": 557.127,
          "minZ": -111.964,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_266:площадка",
          "maxX": 574.549,
          "maxZ": -65.451,
          "minX": 559.997,
          "minZ": -80.003,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_267:площадка",
          "maxX": 634.719,
          "maxZ": -63.463,
          "minX": 616.19,
          "minZ": -81.992,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_268:площадка",
          "maxX": 574.613,
          "maxZ": -36.296,
          "minX": 559.933,
          "minZ": -50.976,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_269:площадка",
          "maxX": 606.819,
          "maxZ": -33.181,
          "minX": 585.908,
          "minZ": -54.092,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_270:площадка",
          "maxX": 604.802,
          "maxZ": -6.107,
          "minX": 587.925,
          "minZ": -22.984,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_271:площадка",
          "maxX": -617.498,
          "maxZ": 22.502,
          "minX": -633.412,
          "minZ": 6.588,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_272:площадка",
          "maxX": -587.777,
          "maxZ": 23.133,
          "minX": -604.951,
          "minZ": 5.958,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_273:площадка",
          "maxX": -557.902,
          "maxZ": 23.916,
          "minX": -576.643,
          "minZ": 5.175,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_274:площадка",
          "maxX": -530.19,
          "maxZ": 22.537,
          "minX": -546.174,
          "minZ": 6.554,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_275:площадка",
          "maxX": -615.851,
          "maxZ": 53.239,
          "minX": -635.058,
          "minZ": 34.033,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_276:площадка",
          "maxX": -586.483,
          "maxZ": 53.517,
          "minX": -606.244,
          "minZ": 33.756,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_277:площадка",
          "maxX": -615.42,
          "maxZ": 82.762,
          "minX": -635.489,
          "minZ": 62.693,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_278:площадка",
          "maxX": -588.437,
          "maxZ": 80.653,
          "minX": -604.29,
          "minZ": 64.801,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_279:площадка",
          "maxX": -558.543,
          "maxZ": 81.457,
          "minX": -576.002,
          "minZ": 63.998,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_280:площадка",
          "maxX": -615.769,
          "maxZ": 111.503,
          "minX": -635.14,
          "minZ": 92.133,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_281:площадка",
          "maxX": -616.316,
          "maxZ": 140.048,
          "minX": -634.593,
          "minZ": 121.771,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_282:площадка",
          "maxX": -529.195,
          "maxZ": 139.896,
          "minX": -547.168,
          "minZ": 121.923,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_283:площадка",
          "maxX": -616.771,
          "maxZ": 168.683,
          "minX": -634.138,
          "minZ": 151.317,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_284:площадка",
          "maxX": -556.952,
          "maxZ": 170.32,
          "minX": -577.593,
          "minZ": 149.68,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_285:площадка",
          "maxX": -559.299,
          "maxZ": 197.065,
          "minX": -575.246,
          "minZ": 181.117,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_286:площадка",
          "maxX": -530.111,
          "maxZ": 197.162,
          "minX": -546.253,
          "minZ": 181.02,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_287:площадка",
          "maxX": -618.646,
          "maxZ": 224.99,
          "minX": -632.263,
          "minZ": 211.374,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_288:площадка",
          "maxX": -587.705,
          "maxZ": 226.841,
          "minX": -605.023,
          "minZ": 209.523,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_289:площадка",
          "maxX": -559.112,
          "maxZ": 226.343,
          "minX": -575.434,
          "minZ": 210.021,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_290:площадка",
          "maxX": -527.665,
          "maxZ": 228.698,
          "minX": -548.698,
          "minZ": 207.665,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_291:площадка",
          "maxX": -616.895,
          "maxZ": 255.832,
          "minX": -634.014,
          "minZ": 238.713,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_292:площадка",
          "maxX": -589.64,
          "maxZ": 253.996,
          "minX": -603.087,
          "minZ": 240.549,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_293:площадка",
          "maxX": -559.827,
          "maxZ": 254.718,
          "minX": -574.718,
          "minZ": 239.827,
          "y": 0.005
        },
        {
          "blend": 14,
          "id": "b_district_0_2_295:площадка",
          "maxX": -588.07,
          "maxZ": 284.657,
          "minX": -604.657,
          "minZ": 268.07,
          "y": 0.012
        },
        {
          "blend": 14,
          "id": "b_district_1_3_318:площадка",
          "maxX": -127.697,
          "maxZ": 592.303,
          "minX": -152.303,
          "minZ": 567.697,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_319:площадка",
          "maxX": -89.081,
          "maxZ": 590.919,
          "minX": -110.919,
          "minZ": 569.081,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_323:площадка",
          "maxX": -130.258,
          "maxZ": 629.742,
          "minX": -149.742,
          "minZ": 610.258,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_324:площадка",
          "maxX": -88.006,
          "maxZ": 631.994,
          "minX": -111.994,
          "minZ": 608.006,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_327:площадка",
          "maxX": 635.241,
          "maxZ": 498.098,
          "minX": 599.045,
          "minZ": 461.902,
          "y": 0.004
        },
        {
          "blend": 14,
          "id": "b_district_3_3_329:площадка",
          "maxX": 583.716,
          "maxZ": 583.716,
          "minX": 559.141,
          "minZ": 559.141,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_330:площадка",
          "maxX": 633.013,
          "maxZ": 587.298,
          "minX": 601.273,
          "minZ": 555.559,
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
          "id": "tr_sp1_r",
          "points": [
            {
              "x": -520,
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
              "z": -424
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
          "id": "tr_gb_6",
          "points": [
            {
              "x": -520,
              "y": 0,
              "z": -520
            },
            {
              "x": -440,
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
          "id": "tr_gb_7",
          "points": [
            {
              "x": -520,
              "y": 0,
              "z": -520
            },
            {
              "x": -600,
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
          "id": "tr_gb_8",
          "points": [
            {
              "x": -520,
              "y": 0,
              "z": -520
            },
            {
              "x": -520,
              "y": 0,
              "z": -440
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
              "x": -520,
              "y": 0,
              "z": -520
            },
            {
              "x": -520,
              "y": 0,
              "z": -600
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
              "x": -520,
              "y": 0,
              "z": -520
            },
            {
              "x": -456,
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
          "id": "tr_gb_11",
          "points": [
            {
              "x": -520,
              "y": 0,
              "z": -520
            },
            {
              "x": -584,
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
          "id": "tr_gb_12",
          "points": [
            {
              "x": -520,
              "y": 0,
              "z": -520
            },
            {
              "x": -520,
              "y": 0,
              "z": -456
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
              "x": -520,
              "y": 0,
              "z": -520
            },
            {
              "x": -520,
              "y": 0,
              "z": -584
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
              "x": -520,
              "y": 0,
              "z": -520
            },
            {
              "x": -472,
              "y": 0,
              "z": -520
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
