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
          "buildings": 111,
          "lights": 1,
          "props": 107,
          "roads": 6
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
          "buildings": 38,
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
          "buildings": 20,
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
          "buildings": 10,
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
          "buildings": 18,
          "props": 48
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
          "props": 20
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
          "buildings": 14,
          "channels": 1,
          "props": 41
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
          "buildings": 11,
          "channels": 1,
          "props": 3
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
          "buildings": 4,
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
          "channels": 1,
          "lights": 2,
          "props": 4,
          "roads": 10
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
          "buildings": 56,
          "props": 59
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
          "buildings": 29,
          "props": 10
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
          "buildings": 13
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
          "buildings": 45
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
          "buildings": 32
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
          "buildings": 21
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
          "lights": 5,
          "roads": 25
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
          "maxX": -531.487,
          "maxZ": -627.487,
          "minX": -540.513,
          "minZ": -636.513,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_5:площадка",
          "maxX": -484.215,
          "maxZ": -628.215,
          "minX": -491.785,
          "minZ": -635.785,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_6:площадка",
          "maxX": -436.729,
          "maxZ": -628.729,
          "minX": -443.271,
          "minZ": -635.271,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_7:площадка",
          "maxX": -404.952,
          "maxZ": -628.952,
          "minX": -411.048,
          "minZ": -635.048,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_8:площадка",
          "maxX": -388.735,
          "maxZ": -628.735,
          "minX": -395.265,
          "minZ": -635.265,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_9:площадка",
          "maxX": -356.117,
          "maxZ": -628.117,
          "minX": -363.883,
          "minZ": -635.883,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_10:площадка",
          "maxX": -324.44,
          "maxZ": -628.44,
          "minX": -331.56,
          "minZ": -635.56,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_11:площадка",
          "maxX": -595.709,
          "maxZ": -611.709,
          "minX": -604.291,
          "minZ": -620.291,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_12:площадка",
          "maxX": -579.072,
          "maxZ": -611.072,
          "minX": -588.928,
          "minZ": -620.928,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_13:площадка",
          "maxX": -547.253,
          "maxZ": -611.253,
          "minX": -556.747,
          "minZ": -620.747,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_14:площадка",
          "maxX": -516.303,
          "maxZ": -612.303,
          "minX": -523.697,
          "minZ": -619.697,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_15:площадка",
          "maxX": -484.314,
          "maxZ": -612.314,
          "minX": -491.686,
          "minZ": -619.686,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_16:площадка",
          "maxX": -467.282,
          "maxZ": -611.282,
          "minX": -476.718,
          "minZ": -620.718,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_17:площадка",
          "maxX": -436.736,
          "maxZ": -612.736,
          "minX": -443.264,
          "minZ": -619.264,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_18:площадка",
          "maxX": -420.052,
          "maxZ": -612.052,
          "minX": -427.948,
          "minZ": -619.948,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_19:площадка",
          "maxX": -356.041,
          "maxZ": -612.041,
          "minX": -363.959,
          "minZ": -619.959,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_20:площадка",
          "maxX": -339.689,
          "maxZ": -611.689,
          "minX": -348.311,
          "minZ": -620.311,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_21:площадка",
          "maxX": -323.49,
          "maxZ": -611.49,
          "minX": -332.51,
          "minZ": -620.51,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_22:площадка",
          "maxX": -628.385,
          "maxZ": -596.385,
          "minX": -635.615,
          "minZ": -603.615,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_23:площадка",
          "maxX": -611.551,
          "maxZ": -595.551,
          "minX": -620.449,
          "minZ": -604.449,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_24:площадка",
          "maxX": -595.457,
          "maxZ": -595.457,
          "minX": -604.543,
          "minZ": -604.543,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_25:площадка",
          "maxX": -580.589,
          "maxZ": -596.589,
          "minX": -587.411,
          "minZ": -603.411,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_26:площадка",
          "maxX": -564.008,
          "maxZ": -596.008,
          "minX": -571.992,
          "minZ": -603.992,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_27:площадка",
          "maxX": -547.978,
          "maxZ": -595.978,
          "minX": -556.022,
          "minZ": -604.022,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_28:площадка",
          "maxX": -531.375,
          "maxZ": -595.375,
          "minX": -540.625,
          "minZ": -604.625,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_29:площадка",
          "maxX": -516.29,
          "maxZ": -596.29,
          "minX": -523.71,
          "minZ": -603.71,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_30:площадка",
          "maxX": -500.521,
          "maxZ": -596.521,
          "minX": -507.479,
          "minZ": -603.479,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_31:площадка",
          "maxX": -484.251,
          "maxZ": -596.251,
          "minX": -491.749,
          "minZ": -603.749,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_32:площадка",
          "maxX": -467.991,
          "maxZ": -595.991,
          "minX": -476.009,
          "minZ": -604.009,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_33:площадка",
          "maxX": -451.767,
          "maxZ": -595.767,
          "minX": -460.233,
          "minZ": -604.233,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_34:площадка",
          "maxX": -435.671,
          "maxZ": -595.671,
          "minX": -444.329,
          "minZ": -604.329,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_35:площадка",
          "maxX": -419.826,
          "maxZ": -595.826,
          "minX": -428.174,
          "minZ": -604.174,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_36:площадка",
          "maxX": -403.718,
          "maxZ": -595.718,
          "minX": -412.282,
          "minZ": -604.282,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_37:площадка",
          "maxX": -388.094,
          "maxZ": -596.094,
          "minX": -395.906,
          "minZ": -603.906,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_38:площадка",
          "maxX": -355.051,
          "maxZ": -595.051,
          "minX": -364.949,
          "minZ": -604.949,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_39:площадка",
          "maxX": -340.804,
          "maxZ": -596.804,
          "minX": -347.196,
          "minZ": -603.196,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_40:площадка",
          "maxX": -628.936,
          "maxZ": -580.936,
          "minX": -635.064,
          "minZ": -587.064,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_41:площадка",
          "maxX": -611.753,
          "maxZ": -579.753,
          "minX": -620.247,
          "minZ": -588.247,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_42:площадка",
          "maxX": -596.659,
          "maxZ": -580.659,
          "minX": -603.341,
          "minZ": -587.341,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_43:площадка",
          "maxX": -547.468,
          "maxZ": -579.468,
          "minX": -556.532,
          "minZ": -588.532,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_44:площадка",
          "maxX": -532.774,
          "maxZ": -580.774,
          "minX": -539.226,
          "minZ": -587.226,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_45:площадка",
          "maxX": -515.896,
          "maxZ": -579.896,
          "minX": -524.104,
          "minZ": -588.104,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_46:площадка",
          "maxX": -483.544,
          "maxZ": -579.544,
          "minX": -492.456,
          "minZ": -588.456,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_47:площадка",
          "maxX": -403.422,
          "maxZ": -579.422,
          "minX": -412.578,
          "minZ": -588.578,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_48:площадка",
          "maxX": -387.579,
          "maxZ": -579.579,
          "minX": -396.421,
          "minZ": -588.421,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_49:площадка",
          "maxX": -324.802,
          "maxZ": -580.802,
          "minX": -331.198,
          "minZ": -587.198,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_50:площадка",
          "maxX": -595.288,
          "maxZ": -563.288,
          "minX": -604.712,
          "minZ": -572.712,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_51:площадка",
          "maxX": -579.211,
          "maxZ": -563.211,
          "minX": -588.789,
          "minZ": -572.789,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_52:площадка",
          "maxX": -564.116,
          "maxZ": -564.116,
          "minX": -571.884,
          "minZ": -571.884,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_53:площадка",
          "maxX": -532.416,
          "maxZ": -564.416,
          "minX": -539.584,
          "minZ": -571.584,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_54:площадка",
          "maxX": -515.983,
          "maxZ": -563.983,
          "minX": -524.017,
          "minZ": -572.017,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_55:площадка",
          "maxX": -500.727,
          "maxZ": -564.727,
          "minX": -507.273,
          "minZ": -571.273,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_56:площадка",
          "maxX": -484.536,
          "maxZ": -564.536,
          "minX": -491.464,
          "minZ": -571.464,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_57:площадка",
          "maxX": -452.53,
          "maxZ": -564.53,
          "minX": -459.47,
          "minZ": -571.47,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_58:площадка",
          "maxX": -435.862,
          "maxZ": -563.862,
          "minX": -444.138,
          "minZ": -572.138,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_59:площадка",
          "maxX": -388.884,
          "maxZ": -564.884,
          "minX": -395.116,
          "minZ": -571.116,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_60:площадка",
          "maxX": -371.787,
          "maxZ": -563.787,
          "minX": -380.213,
          "minZ": -572.213,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_61:площадка",
          "maxX": -340.261,
          "maxZ": -564.261,
          "minX": -347.739,
          "minZ": -571.739,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_62:площадка",
          "maxX": -323.141,
          "maxZ": -563.141,
          "minX": -332.859,
          "minZ": -572.859,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_63:площадка",
          "maxX": -611.779,
          "maxZ": -547.779,
          "minX": -620.221,
          "minZ": -556.221,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_64:площадка",
          "maxX": -580.854,
          "maxZ": -548.854,
          "minX": -587.146,
          "minZ": -555.146,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_65:площадка",
          "maxX": -563.195,
          "maxZ": -547.195,
          "minX": -572.805,
          "minZ": -556.805,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_66:площадка",
          "maxX": -532.848,
          "maxZ": -548.848,
          "minX": -539.152,
          "minZ": -555.152,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_67:площадка",
          "maxX": -516.83,
          "maxZ": -548.83,
          "minX": -523.17,
          "minZ": -555.17,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_68:площадка",
          "maxX": -468.093,
          "maxZ": -548.093,
          "minX": -475.907,
          "minZ": -555.907,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_69:площадка",
          "maxX": -452.235,
          "maxZ": -548.235,
          "minX": -459.765,
          "minZ": -555.765,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_70:площадка",
          "maxX": -420.654,
          "maxZ": -548.654,
          "minX": -427.346,
          "minZ": -555.346,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_71:площадка",
          "maxX": -404.971,
          "maxZ": -548.971,
          "minX": -411.029,
          "minZ": -555.029,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_72:площадка",
          "maxX": -371.225,
          "maxZ": -547.225,
          "minX": -380.775,
          "minZ": -556.775,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_73:площадка",
          "maxX": -356.704,
          "maxZ": -548.704,
          "minX": -363.296,
          "minZ": -555.296,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_74:площадка",
          "maxX": -339.936,
          "maxZ": -547.936,
          "minX": -348.064,
          "minZ": -556.064,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_75:площадка",
          "maxX": -628.26,
          "maxZ": -532.26,
          "minX": -635.74,
          "minZ": -539.74,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_76:площадка",
          "maxX": -612.897,
          "maxZ": -532.897,
          "minX": -619.103,
          "minZ": -539.103,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_77:площадка",
          "maxX": -580.703,
          "maxZ": -532.703,
          "minX": -587.297,
          "minZ": -539.297,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_78:площадка",
          "maxX": -564.641,
          "maxZ": -532.641,
          "minX": -571.359,
          "minZ": -539.359,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_79:площадка",
          "maxX": -548.504,
          "maxZ": -532.504,
          "minX": -555.496,
          "minZ": -539.496,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_80:площадка",
          "maxX": -531.375,
          "maxZ": -531.375,
          "minX": -540.625,
          "minZ": -540.625,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_81:площадка",
          "maxX": -516.808,
          "maxZ": -532.808,
          "minX": -523.192,
          "minZ": -539.192,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_82:площадка",
          "maxX": -499.856,
          "maxZ": -531.856,
          "minX": -508.144,
          "minZ": -540.144,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_83:площадка",
          "maxX": -483.815,
          "maxZ": -531.815,
          "minX": -492.185,
          "minZ": -540.185,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_84:площадка",
          "maxX": -467.082,
          "maxZ": -531.082,
          "minX": -476.918,
          "minZ": -540.918,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_85:площадка",
          "maxX": -451.672,
          "maxZ": -531.672,
          "minX": -460.328,
          "minZ": -540.328,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_86:площадка",
          "maxX": -403.083,
          "maxZ": -531.083,
          "minX": -412.917,
          "minZ": -540.917,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_87:площадка",
          "maxX": -355.863,
          "maxZ": -531.863,
          "minX": -364.137,
          "minZ": -540.137,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_89:площадка",
          "maxX": -612.563,
          "maxZ": -516.563,
          "minX": -619.437,
          "minZ": -523.437,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_90:площадка",
          "maxX": -595.333,
          "maxZ": -515.333,
          "minX": -604.667,
          "minZ": -524.667,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_91:площадка",
          "maxX": -580.279,
          "maxZ": -516.279,
          "minX": -587.721,
          "minZ": -523.721,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_92:площадка",
          "maxX": -563.264,
          "maxZ": -515.264,
          "minX": -572.736,
          "minZ": -524.736,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_93:площадка",
          "maxX": -532.352,
          "maxZ": -516.352,
          "minX": -539.648,
          "minZ": -523.648,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_94:площадка",
          "maxX": -628.311,
          "maxZ": -500.311,
          "minX": -635.689,
          "minZ": -507.689,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_95:площадка",
          "maxX": -612.545,
          "maxZ": -500.545,
          "minX": -619.455,
          "minZ": -507.455,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_96:площадка",
          "maxX": -579.859,
          "maxZ": -499.859,
          "minX": -588.141,
          "minZ": -508.141,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_97:площадка",
          "maxX": -563.882,
          "maxZ": -499.882,
          "minX": -572.118,
          "minZ": -508.118,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_98:площадка",
          "maxX": -548.42,
          "maxZ": -500.42,
          "minX": -555.58,
          "minZ": -507.58,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_99:площадка",
          "maxX": -531.12,
          "maxZ": -499.12,
          "minX": -540.88,
          "minZ": -508.88,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_100:площадка",
          "maxX": -628.532,
          "maxZ": -484.532,
          "minX": -635.468,
          "minZ": -491.468,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_101:площадка",
          "maxX": -579.492,
          "maxZ": -483.492,
          "minX": -588.508,
          "minZ": -492.508,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_102:площадка",
          "maxX": -548.001,
          "maxZ": -484.001,
          "minX": -555.999,
          "minZ": -491.999,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_103:площадка",
          "maxX": -611.501,
          "maxZ": -467.501,
          "minX": -620.499,
          "minZ": -476.499,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_104:площадка",
          "maxX": -595.323,
          "maxZ": -467.323,
          "minX": -604.677,
          "minZ": -476.677,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_105:площадка",
          "maxX": -580.422,
          "maxZ": -468.422,
          "minX": -587.578,
          "minZ": -475.578,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_106:площадка",
          "maxX": -564.291,
          "maxZ": -468.291,
          "minX": -571.709,
          "minZ": -475.709,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_107:площадка",
          "maxX": -547.343,
          "maxZ": -467.343,
          "minX": -556.657,
          "minZ": -476.657,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_108:площадка",
          "maxX": -532.763,
          "maxZ": -468.763,
          "minX": -539.237,
          "minZ": -475.237,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_109:площадка",
          "maxX": -564.949,
          "maxZ": -452.949,
          "minX": -571.051,
          "minZ": -459.051,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_110:площадка",
          "maxX": -532.376,
          "maxZ": -452.376,
          "minX": -539.624,
          "minZ": -459.624,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_111:площадка",
          "maxX": -628.729,
          "maxZ": -436.729,
          "minX": -635.271,
          "minZ": -443.271,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_112:площадка",
          "maxX": -595.371,
          "maxZ": -435.371,
          "minX": -604.629,
          "minZ": -444.629,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_113:площадка",
          "maxX": -579.716,
          "maxZ": -435.716,
          "minX": -588.284,
          "minZ": -444.284,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_114:площадка",
          "maxX": -563.889,
          "maxZ": -435.889,
          "minX": -572.111,
          "minZ": -444.111,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_115:площадка",
          "maxX": -563.6,
          "maxZ": -419.6,
          "minX": -572.4,
          "minZ": -428.4,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_116:площадка",
          "maxX": -548.869,
          "maxZ": -420.869,
          "minX": -555.131,
          "minZ": -427.131,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_117:площадка",
          "maxX": -531.967,
          "maxZ": -419.967,
          "minX": -540.033,
          "minZ": -428.033,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_118:площадка",
          "maxX": -628.273,
          "maxZ": -404.273,
          "minX": -635.727,
          "minZ": -411.727,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_119:площадка",
          "maxX": -596.147,
          "maxZ": -404.147,
          "minX": -603.853,
          "minZ": -411.853,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_120:площадка",
          "maxX": -579.184,
          "maxZ": -403.184,
          "minX": -588.816,
          "minZ": -412.816,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_121:площадка",
          "maxX": -564.337,
          "maxZ": -404.337,
          "minX": -571.663,
          "minZ": -411.663,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_122:площадка",
          "maxX": -547.66,
          "maxZ": -403.66,
          "minX": -556.34,
          "minZ": -412.34,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_123:площадка",
          "maxX": -627.797,
          "maxZ": -387.797,
          "minX": -636.203,
          "minZ": -396.203,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_124:площадка",
          "maxX": -611.885,
          "maxZ": -387.885,
          "minX": -620.115,
          "minZ": -396.115,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_125:площадка",
          "maxX": -579.982,
          "maxZ": -387.982,
          "minX": -588.018,
          "minZ": -396.018,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_126:площадка",
          "maxX": -563.374,
          "maxZ": -387.374,
          "minX": -572.626,
          "minZ": -396.626,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_127:площадка",
          "maxX": -548.567,
          "maxZ": -388.567,
          "minX": -555.433,
          "minZ": -395.433,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_128:площадка",
          "maxX": -628.162,
          "maxZ": -372.162,
          "minX": -635.838,
          "minZ": -379.838,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_129:площадка",
          "maxX": -595.279,
          "maxZ": -371.279,
          "minX": -604.721,
          "minZ": -380.721,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_130:площадка",
          "maxX": -580.345,
          "maxZ": -372.345,
          "minX": -587.655,
          "minZ": -379.655,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_131:площадка",
          "maxX": -563.399,
          "maxZ": -371.399,
          "minX": -572.601,
          "minZ": -380.601,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_132:площадка",
          "maxX": -531.075,
          "maxZ": -371.075,
          "minX": -540.925,
          "minZ": -380.925,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_133:площадка",
          "maxX": -627.645,
          "maxZ": -355.645,
          "minX": -636.355,
          "minZ": -364.355,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_134:площадка",
          "maxX": -611.536,
          "maxZ": -355.536,
          "minX": -620.464,
          "minZ": -364.464,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_135:площадка",
          "maxX": -596.157,
          "maxZ": -356.157,
          "minX": -603.843,
          "minZ": -363.843,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_136:площадка",
          "maxX": -564.762,
          "maxZ": -356.762,
          "minX": -571.238,
          "minZ": -363.238,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_137:площадка",
          "maxX": -547.925,
          "maxZ": -355.925,
          "minX": -556.075,
          "minZ": -364.075,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_138:площадка",
          "maxX": -531.233,
          "maxZ": -355.233,
          "minX": -540.767,
          "minZ": -364.767,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_139:площадка",
          "maxX": -627.504,
          "maxZ": -339.504,
          "minX": -636.496,
          "minZ": -348.496,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_140:площадка",
          "maxX": -611.088,
          "maxZ": -339.088,
          "minX": -620.912,
          "minZ": -348.912,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_141:площадка",
          "maxX": -595.881,
          "maxZ": -339.881,
          "minX": -604.119,
          "minZ": -348.119,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_142:площадка",
          "maxX": -532.655,
          "maxZ": -340.655,
          "minX": -539.345,
          "minZ": -347.345,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_143:площадка",
          "maxX": -596.327,
          "maxZ": -324.327,
          "minX": -603.673,
          "minZ": -331.673,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_144:площадка",
          "maxX": -579.224,
          "maxZ": -323.224,
          "minX": -588.776,
          "minZ": -332.776,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_145:площадка",
          "maxX": -564.436,
          "maxZ": -324.436,
          "minX": -571.564,
          "minZ": -331.564,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_146:площадка",
          "maxX": -547.218,
          "maxZ": -323.218,
          "minX": -556.782,
          "minZ": -332.782,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_147:площадка",
          "maxX": -532.251,
          "maxZ": -324.251,
          "minX": -539.749,
          "minZ": -331.749,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_0_148:площадка",
          "maxX": -281.788,
          "maxZ": -601.788,
          "minX": -312.498,
          "minZ": -632.498,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_150:площадка",
          "maxX": 102.314,
          "maxZ": -623.02,
          "minX": 89.686,
          "minZ": -635.647,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_151:площадка",
          "maxX": 165.866,
          "maxZ": -623.467,
          "minX": 154.134,
          "minZ": -635.2,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_152:площадка",
          "maxX": 186.69,
          "maxZ": -623.977,
          "minX": 175.977,
          "minZ": -634.69,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_156:площадка",
          "maxX": 37.559,
          "maxZ": -602.441,
          "minX": 26.441,
          "minZ": -613.559,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_157:площадка",
          "maxX": 79.44,
          "maxZ": -603.227,
          "minX": 69.894,
          "minZ": -612.773,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_158:площадка",
          "maxX": 102.354,
          "maxZ": -601.646,
          "minX": 89.646,
          "minZ": -614.354,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_159:площадка",
          "maxX": 122.98,
          "maxZ": -602.353,
          "minX": 111.687,
          "minZ": -613.647,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_160:площадка",
          "maxX": 165.811,
          "maxZ": -602.189,
          "minX": 154.189,
          "minZ": -613.811,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_162:площадка",
          "maxX": 124.07,
          "maxZ": -579.93,
          "minX": 110.597,
          "minZ": -593.403,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_163:площадка",
          "maxX": 143.911,
          "maxZ": -581.422,
          "minX": 133.422,
          "minZ": -591.911,
          "y": 0.004
        },
        {
          "blend": 14,
          "id": "b_district_2_0_171:площадка",
          "maxX": 103.071,
          "maxZ": -558.263,
          "minX": 88.929,
          "minZ": -572.404,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_222:площадка",
          "maxX": 548.92,
          "maxZ": -614.716,
          "minX": 527.443,
          "minZ": -636.193,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_223:площадка",
          "maxX": 576.315,
          "maxZ": -616.412,
          "minX": 558.23,
          "minZ": -634.497,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_224:площадка",
          "maxX": 636.278,
          "maxZ": -614.631,
          "minX": 614.631,
          "minZ": -636.278,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_228:площадка",
          "maxX": 517.887,
          "maxZ": -587.568,
          "minX": 500.295,
          "minZ": -605.16,
          "y": 0.04
        },
        {
          "blend": 14,
          "id": "b_district_3_0_229:площадка",
          "maxX": 576.207,
          "maxZ": -587.43,
          "minX": 558.339,
          "minZ": -605.298,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_230:площадка",
          "maxX": 605.646,
          "maxZ": -587.081,
          "minX": 587.081,
          "minZ": -605.646,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_236:площадка",
          "maxX": 603.86,
          "maxZ": -559.776,
          "minX": 588.867,
          "minZ": -574.769,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_243:площадка",
          "maxX": 577.519,
          "maxZ": -527.935,
          "minX": 557.026,
          "minZ": -548.429,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_244:площадка",
          "maxX": 603.619,
          "maxZ": -530.926,
          "minX": 589.108,
          "minZ": -545.437,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_245:площадка",
          "maxX": 636.123,
          "maxZ": -527.513,
          "minX": 614.786,
          "minZ": -548.851,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_250:площадка",
          "maxX": 604.253,
          "maxZ": -501.202,
          "minX": 588.474,
          "minZ": -516.98,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_251:площадка",
          "maxX": 634.163,
          "maxZ": -500.382,
          "minX": 616.746,
          "minZ": -517.8,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_257:площадка",
          "maxX": 633.171,
          "maxZ": -472.284,
          "minX": 617.738,
          "minZ": -487.716,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_263:площадка",
          "maxX": 632.325,
          "maxZ": -444.039,
          "minX": 618.584,
          "minZ": -457.779,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_269:площадка",
          "maxX": 603.293,
          "maxZ": -414.889,
          "minX": 589.434,
          "minZ": -428.747,
          "y": 0.026
        },
        {
          "blend": 14,
          "id": "b_district_3_0_270:площадка",
          "maxX": 634.33,
          "maxZ": -412.943,
          "minX": 616.579,
          "minZ": -430.694,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_285:площадка",
          "maxX": 605.098,
          "maxZ": -325.811,
          "minX": 587.63,
          "minZ": -343.28,
          "y": 0.012
        },
        {
          "blend": 14,
          "id": "b_district_0_1_286:площадка",
          "maxX": -588.253,
          "maxZ": -297.344,
          "minX": -604.474,
          "minZ": -313.565,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_287:площадка",
          "maxX": -560.367,
          "maxZ": -298.549,
          "minX": -574.178,
          "minZ": -312.36,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_288:площадка",
          "maxX": -615.502,
          "maxZ": -266.411,
          "minX": -635.407,
          "minZ": -286.316,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_289:площадка",
          "maxX": -585.728,
          "maxZ": -265.728,
          "minX": -606.999,
          "minZ": -286.999,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_290:площадка",
          "maxX": -560.53,
          "maxZ": -269.621,
          "minX": -574.015,
          "minZ": -283.106,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_291:площадка",
          "maxX": -530.04,
          "maxZ": -268.221,
          "minX": -546.324,
          "minZ": -284.506,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_292:площадка",
          "maxX": -587.892,
          "maxZ": -238.801,
          "minX": -604.835,
          "minZ": -255.745,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_293:площадка",
          "maxX": -559.336,
          "maxZ": -239.336,
          "minX": -575.209,
          "minZ": -255.209,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_294:площадка",
          "maxX": -618.303,
          "maxZ": -211.03,
          "minX": -632.606,
          "minZ": -225.333,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_295:площадка",
          "maxX": -527.979,
          "maxZ": -207.979,
          "minX": -548.385,
          "minZ": -228.385,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_296:площадка",
          "maxX": -615.935,
          "maxZ": -179.571,
          "minX": -634.974,
          "minZ": -198.611,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_297:площадка",
          "maxX": -585.728,
          "maxZ": -178.455,
          "minX": -607,
          "minZ": -199.727,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_298:площадка",
          "maxX": -559.978,
          "maxZ": -181.796,
          "minX": -574.568,
          "minZ": -196.386,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_299:площадка",
          "maxX": -527.609,
          "maxZ": -178.518,
          "minX": -548.754,
          "minZ": -199.664,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_300:площадка",
          "maxX": -615.94,
          "maxZ": -150.485,
          "minX": -634.969,
          "minZ": -169.515,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_301:площадка",
          "maxX": -586.158,
          "maxZ": -149.794,
          "minX": -606.569,
          "minZ": -170.206,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_302:площадка",
          "maxX": -560.219,
          "maxZ": -152.947,
          "minX": -574.326,
          "minZ": -167.053,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_303:площадка",
          "maxX": -528.102,
          "maxZ": -120.829,
          "minX": -548.262,
          "minZ": -140.989,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_304:площадка",
          "maxX": -530.405,
          "maxZ": -94.042,
          "minX": -545.958,
          "minZ": -109.595,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_305:площадка",
          "maxX": -616.181,
          "maxZ": -63.454,
          "minX": -634.728,
          "minZ": -82.001,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_306:площадка",
          "maxX": -588.9,
          "maxZ": -65.264,
          "minX": -603.827,
          "minZ": -80.191,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_307:площадка",
          "maxX": -615.794,
          "maxZ": -33.976,
          "minX": -635.115,
          "minZ": -53.297,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_308:площадка",
          "maxX": -559.796,
          "maxZ": -36.16,
          "minX": -574.749,
          "minZ": -51.113,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_309:площадка",
          "maxX": -527.522,
          "maxZ": -32.977,
          "minX": -548.841,
          "minZ": -54.296,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_310:площадка",
          "maxX": -615.047,
          "maxZ": -4.137,
          "minX": -635.863,
          "minZ": -24.953,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_311:площадка",
          "maxX": -589.62,
          "maxZ": -7.802,
          "minX": -603.107,
          "minZ": -21.289,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_312:площадка",
          "maxX": -559.62,
          "maxZ": -6.893,
          "minX": -574.926,
          "minZ": -22.198,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_337:площадка",
          "maxX": 635.618,
          "maxZ": -295.292,
          "minX": 615.292,
          "minZ": -315.618,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_346:площадка",
          "maxX": 576.219,
          "maxZ": -238.327,
          "minX": 558.327,
          "minZ": -256.219,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_355:площадка",
          "maxX": 575.058,
          "maxZ": -181.306,
          "minX": 559.488,
          "minZ": -196.876,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_356:площадка",
          "maxX": 633.925,
          "maxZ": -180.62,
          "minX": 616.984,
          "minZ": -197.562,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_358:площадка",
          "maxX": 632.699,
          "maxZ": -152.755,
          "minX": 618.21,
          "minZ": -167.245,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_361:площадка",
          "maxX": 488.816,
          "maxZ": -122.093,
          "minX": 471.184,
          "minZ": -139.726,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_362:площадка",
          "maxX": 343.721,
          "maxZ": -92.643,
          "minX": 325.37,
          "minZ": -110.993,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_363:площадка",
          "maxX": 489.759,
          "maxZ": -92.059,
          "minX": 470.241,
          "minZ": -111.577,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_364:площадка",
          "maxX": 547.326,
          "maxZ": -92.674,
          "minX": 529.038,
          "minZ": -110.962,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_365:площадка",
          "maxX": 578.046,
          "maxZ": -91.044,
          "minX": 556.499,
          "minZ": -112.592,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_366:площадка",
          "maxX": 604.884,
          "maxZ": -93.298,
          "minX": 587.843,
          "minZ": -110.339,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_367:площадка",
          "maxX": 344.382,
          "maxZ": -62.891,
          "minX": 324.709,
          "minZ": -82.564,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_368:площадка",
          "maxX": 370.553,
          "maxZ": -65.811,
          "minX": 356.72,
          "minZ": -79.644,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_369:площадка",
          "maxX": 402.062,
          "maxZ": -63.392,
          "minX": 383.392,
          "minZ": -82.062,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_370:площадка",
          "maxX": 429.399,
          "maxZ": -65.147,
          "minX": 414.238,
          "minZ": -80.308,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_371:площадка",
          "maxX": 487.265,
          "maxZ": -65.463,
          "minX": 472.735,
          "minZ": -79.992,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_372:площадка",
          "maxX": 518.017,
          "maxZ": -63.802,
          "minX": 500.165,
          "minZ": -81.653,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_373:площадка",
          "maxX": 575.801,
          "maxZ": -64.199,
          "minX": 558.745,
          "minZ": -81.255,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_374:площадка",
          "maxX": 604.362,
          "maxZ": -64.729,
          "minX": 588.366,
          "minZ": -80.725,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_375:площадка",
          "maxX": 401.607,
          "maxZ": -34.756,
          "minX": 383.847,
          "minZ": -52.516,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_376:площадка",
          "maxX": 459.458,
          "maxZ": -35.087,
          "minX": 442.36,
          "minZ": -52.185,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_377:площадка",
          "maxX": 546.974,
          "maxZ": -34.844,
          "minX": 529.389,
          "minZ": -52.429,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_378:площадка",
          "maxX": 399.892,
          "maxZ": -7.381,
          "minX": 385.563,
          "minZ": -21.71,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_379:площадка",
          "maxX": 460.746,
          "maxZ": -4.709,
          "minX": 441.072,
          "minZ": -24.382,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_380:площадка",
          "maxX": 519.564,
          "maxZ": -4.073,
          "minX": 498.618,
          "minZ": -25.018,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_381:площадка",
          "maxX": 545.026,
          "maxZ": -7.701,
          "minX": 531.337,
          "minZ": -21.39,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_382:площадка",
          "maxX": 604.323,
          "maxZ": -6.586,
          "minX": 588.404,
          "minZ": -22.505,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_383:площадка",
          "maxX": 634.779,
          "maxZ": -5.221,
          "minX": 616.13,
          "minZ": -23.87,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_384:площадка",
          "maxX": -586.286,
          "maxZ": 24.623,
          "minX": -606.441,
          "minZ": 4.468,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_385:площадка",
          "maxX": -529.868,
          "maxZ": 22.859,
          "minX": -546.496,
          "minZ": 6.232,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_386:площадка",
          "maxX": -558.962,
          "maxZ": 51.947,
          "minX": -575.584,
          "minZ": 35.325,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_387:площадка",
          "maxX": -530.05,
          "maxZ": 51.768,
          "minX": -546.314,
          "minZ": 35.504,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_388:площадка",
          "maxX": -528.38,
          "maxZ": 82.529,
          "minX": -547.983,
          "minZ": 62.926,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_389:площадка",
          "maxX": -586.972,
          "maxZ": 111.21,
          "minX": -605.755,
          "minZ": 92.427,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_390:площадка",
          "maxX": -557.872,
          "maxZ": 111.219,
          "minX": -576.674,
          "minZ": 92.417,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_391:площадка",
          "maxX": -589.311,
          "maxZ": 137.962,
          "minX": -603.416,
          "minZ": 123.856,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_392:площадка",
          "maxX": -558.362,
          "maxZ": 139.82,
          "minX": -576.183,
          "minZ": 121.999,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_393:площадка",
          "maxX": -530.665,
          "maxZ": 138.426,
          "minX": -545.698,
          "minZ": 123.393,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_394:площадка",
          "maxX": -618.468,
          "maxZ": 166.987,
          "minX": -632.441,
          "minZ": 153.013,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_395:площадка",
          "maxX": -588.884,
          "maxZ": 167.48,
          "minX": -603.844,
          "minZ": 152.52,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_396:площадка",
          "maxX": -558.117,
          "maxZ": 169.156,
          "minX": -576.428,
          "minZ": 150.844,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_397:площадка",
          "maxX": -528.792,
          "maxZ": 169.39,
          "minX": -547.572,
          "minZ": 150.61,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_398:площадка",
          "maxX": -530.141,
          "maxZ": 197.132,
          "minX": -546.223,
          "minZ": 181.05,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_399:площадка",
          "maxX": -560.405,
          "maxZ": 225.049,
          "minX": -574.14,
          "minZ": 211.314,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_400:площадка",
          "maxX": -530.431,
          "maxZ": 225.932,
          "minX": -545.932,
          "minZ": 210.431,
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
          "id": "tr_gb_22",
          "points": [
            {
              "x": -60.56,
              "y": 3.33,
              "z": 520
            },
            {
              "x": -60.56,
              "y": 2.49,
              "z": 531.43
            },
            {
              "x": -60.56,
              "y": 1.71,
              "z": 542.86
            },
            {
              "x": -60.56,
              "y": 1.04,
              "z": 554.29
            },
            {
              "x": -60.56,
              "y": 0.51,
              "z": 565.71
            },
            {
              "x": -60.56,
              "y": 0.15,
              "z": 577.14
            },
            {
              "x": -60.56,
              "y": 0,
              "z": 588.57
            },
            {
              "x": -60.56,
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
          "id": "tr_gb_23",
          "points": [
            {
              "x": -60.56,
              "y": 3.33,
              "z": 520
            },
            {
              "x": -71.23,
              "y": 2.4,
              "z": 520
            },
            {
              "x": -81.89,
              "y": 1.59,
              "z": 520
            },
            {
              "x": -92.56,
              "y": 0.91,
              "z": 520
            },
            {
              "x": -103.23,
              "y": 0.39,
              "z": 520
            },
            {
              "x": -113.89,
              "y": 0.08,
              "z": 520
            },
            {
              "x": -124.56,
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
          "id": "tr_gb_24",
          "points": [
            {
              "x": -60.56,
              "y": 3.33,
              "z": 520
            },
            {
              "x": -60.56,
              "y": 2.54,
              "z": 530.67
            },
            {
              "x": -60.56,
              "y": 1.81,
              "z": 541.33
            },
            {
              "x": -60.56,
              "y": 1.16,
              "z": 552
            },
            {
              "x": -60.56,
              "y": 0.63,
              "z": 562.67
            },
            {
              "x": -60.56,
              "y": 0.24,
              "z": 573.33
            },
            {
              "x": -60.56,
              "y": 0.03,
              "z": 584
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
              "x": -60.56,
              "y": 3.33,
              "z": 520
            },
            {
              "x": -60.56,
              "y": 4.14,
              "z": 509.33
            },
            {
              "x": -60.56,
              "y": 4.96,
              "z": 498.67
            },
            {
              "x": -60.56,
              "y": 5.75,
              "z": 488
            },
            {
              "x": -60.56,
              "y": 6.52,
              "z": 477.33
            },
            {
              "x": -60.56,
              "y": 7.25,
              "z": 466.67
            },
            {
              "x": -60.56,
              "y": 7.92,
              "z": 456
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
          "id": "tr_gc_35",
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
          "id": "tr_gc_36",
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
          "id": "tr_gc_37",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": 600
            },
            {
              "x": 508,
              "y": 0,
              "z": 600
            },
            {
              "x": 496,
              "y": 0,
              "z": 600
            },
            {
              "x": 484,
              "y": 0,
              "z": 600
            },
            {
              "x": 472,
              "y": 0,
              "z": 600
            },
            {
              "x": 472,
              "y": 0,
              "z": 588.57
            },
            {
              "x": 472,
              "y": 0,
              "z": 577.14
            },
            {
              "x": 472,
              "y": 0.41,
              "z": 565.71
            },
            {
              "x": 472,
              "y": 1.56,
              "z": 554.29
            },
            {
              "x": 472,
              "y": 3.33,
              "z": 542.86
            },
            {
              "x": 472,
              "y": 5.61,
              "z": 531.43
            },
            {
              "x": 472,
              "y": 8.3,
              "z": 520
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
