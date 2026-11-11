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
          "lights": 5,
          "props": 82,
          "roads": 4
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
          "buildings": 26,
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
          "buildings": 22,
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
          "buildings": 12,
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
          "buildings": 20,
          "props": 36
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
          "props": 9
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
          "buildings": 11,
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
          "buildings": 10,
          "channels": 1,
          "props": 39
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
          "props": 9
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
          "buildings": 24,
          "props": 73
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
          "props": 20
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
          "buildings": 29,
          "props": 25
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
          "buildings": 12
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
          "buildings": 4
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
          "id": "b_district_2_0_153:площадка",
          "maxX": 17.771,
          "maxZ": -622.229,
          "minX": 3.562,
          "minZ": -636.438,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_154:площадка",
          "maxX": 57.934,
          "maxZ": -624.733,
          "minX": 48.733,
          "minZ": -633.934,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_155:площадка",
          "maxX": 81.568,
          "maxZ": -622.432,
          "minX": 67.766,
          "minZ": -636.234,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_156:площадка",
          "maxX": 101.763,
          "maxZ": -623.57,
          "minX": 90.237,
          "minZ": -635.096,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_157:площадка",
          "maxX": 207.793,
          "maxZ": -624.207,
          "minX": 197.541,
          "minZ": -634.459,
          "y": 0.025
        },
        {
          "blend": 14,
          "id": "b_district_2_0_161:площадка",
          "maxX": 37.84,
          "maxZ": -602.16,
          "minX": 26.16,
          "minZ": -613.84,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_162:площадка",
          "maxX": 145.403,
          "maxZ": -601.264,
          "minX": 131.93,
          "minZ": -614.736,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_163:площадка",
          "maxX": 165.245,
          "maxZ": -602.755,
          "minX": 154.755,
          "minZ": -613.245,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_168:площадка",
          "maxX": 80.768,
          "maxZ": -580.565,
          "minX": 68.565,
          "minZ": -592.768,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_169:площадка",
          "maxX": 101.551,
          "maxZ": -581.116,
          "minX": 90.449,
          "minZ": -592.217,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_170:площадка",
          "maxX": 145.737,
          "maxZ": -579.596,
          "minX": 131.596,
          "minZ": -593.737,
          "y": 0.026
        },
        {
          "blend": 14,
          "id": "b_district_3_0_188:площадка",
          "maxX": 544.889,
          "maxZ": -618.748,
          "minX": 531.475,
          "minZ": -632.161,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_189:площадка",
          "maxX": 575.22,
          "maxZ": -617.507,
          "minX": 559.325,
          "minZ": -633.402,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_190:площадка",
          "maxX": 633.235,
          "maxZ": -617.674,
          "minX": 617.674,
          "minZ": -633.235,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_194:площадка",
          "maxX": 515.961,
          "maxZ": -589.493,
          "minX": 502.221,
          "minZ": -603.234,
          "y": 0.01
        },
        {
          "blend": 14,
          "id": "b_district_3_0_195:площадка",
          "maxX": 545.512,
          "maxZ": -589.033,
          "minX": 530.851,
          "minZ": -603.694,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_196:площадка",
          "maxX": 575.648,
          "maxZ": -587.989,
          "minX": 558.898,
          "minZ": -604.739,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_197:площадка",
          "maxX": 633.404,
          "maxZ": -588.414,
          "minX": 617.505,
          "minZ": -604.313,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_202:площадка",
          "maxX": 574.897,
          "maxZ": -559.648,
          "minX": 559.648,
          "minZ": -574.897,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_203:площадка",
          "maxX": 604.98,
          "maxZ": -558.656,
          "minX": 587.747,
          "minZ": -575.889,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_204:площадка",
          "maxX": 574.862,
          "maxZ": -530.593,
          "minX": 559.684,
          "minZ": -545.771,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_207:площадка",
          "maxX": 604.685,
          "maxZ": -471.679,
          "minX": 588.042,
          "minZ": -488.321,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_209:площадка",
          "maxX": 604.214,
          "maxZ": -443.059,
          "minX": 588.513,
          "minZ": -458.759,
          "y": 0.002
        },
        {
          "blend": 14,
          "id": "b_district_3_0_214:площадка",
          "maxX": 633.188,
          "maxZ": -384.994,
          "minX": 617.721,
          "minZ": -400.461,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_216:площадка",
          "maxX": 632.531,
          "maxZ": -356.56,
          "minX": 618.378,
          "minZ": -370.713,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_218:площадка",
          "maxX": 605.482,
          "maxZ": -325.427,
          "minX": 587.245,
          "minZ": -343.664,
          "y": 0.015
        },
        {
          "blend": 14,
          "id": "b_district_3_0_219:площадка",
          "maxX": 634.066,
          "maxZ": -325.934,
          "minX": 616.843,
          "minZ": -343.157,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_220:площадка",
          "maxX": -616.808,
          "maxZ": -296.808,
          "minX": -634.101,
          "minZ": -314.101,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_221:площадка",
          "maxX": -557.026,
          "maxZ": -295.208,
          "minX": -577.519,
          "minZ": -315.701,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_222:площадка",
          "maxX": -530.926,
          "maxZ": -298.199,
          "minX": -545.437,
          "minZ": -312.71,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_223:площадка",
          "maxX": -589.286,
          "maxZ": -269.286,
          "minX": -603.442,
          "minZ": -283.442,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_224:площадка",
          "maxX": -527.911,
          "maxZ": -266.092,
          "minX": -548.453,
          "minZ": -286.635,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_225:площадка",
          "maxX": -618.155,
          "maxZ": -239.973,
          "minX": -632.754,
          "minZ": -254.573,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_226:площадка",
          "maxX": -559.383,
          "maxZ": -239.383,
          "minX": -575.162,
          "minZ": -255.162,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_227:площадка",
          "maxX": -529.473,
          "maxZ": -238.564,
          "minX": -546.891,
          "minZ": -255.982,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_228:площадка",
          "maxX": -617.505,
          "maxZ": -210.232,
          "minX": -633.404,
          "minZ": -226.132,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_229:площадка",
          "maxX": -585.861,
          "maxZ": -207.679,
          "minX": -606.867,
          "minZ": -228.685,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_230:площадка",
          "maxX": -560.042,
          "maxZ": -210.951,
          "minX": -574.503,
          "minZ": -225.412,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_231:площадка",
          "maxX": -589.101,
          "maxZ": -181.828,
          "minX": -603.626,
          "minZ": -196.353,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_232:площадка",
          "maxX": -556.596,
          "maxZ": -178.414,
          "minX": -577.949,
          "minZ": -199.767,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_233:площадка",
          "maxX": -560.246,
          "maxZ": -152.973,
          "minX": -574.3,
          "minZ": -167.027,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_234:площадка",
          "maxX": -529.319,
          "maxZ": -151.137,
          "minX": -547.045,
          "minZ": -168.863,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_235:площадка",
          "maxX": -589.494,
          "maxZ": -124.039,
          "minX": -603.234,
          "minZ": -137.779,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_236:площадка",
          "maxX": -556.867,
          "maxZ": -120.504,
          "minX": -577.678,
          "minZ": -141.315,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_237:площадка",
          "maxX": -530.728,
          "maxZ": -123.455,
          "minX": -545.636,
          "minZ": -138.363,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_238:площадка",
          "maxX": -616.916,
          "maxZ": -93.279,
          "minX": -633.994,
          "minZ": -110.357,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_239:площадка",
          "maxX": -587.377,
          "maxZ": -92.832,
          "minX": -605.35,
          "minZ": -110.805,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_240:площадка",
          "maxX": -558.093,
          "maxZ": -92.638,
          "minX": -576.453,
          "minZ": -110.998,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_241:площадка",
          "maxX": -527.782,
          "maxZ": -91.419,
          "minX": -548.581,
          "minZ": -112.218,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_242:площадка",
          "maxX": -560.403,
          "maxZ": -65.858,
          "minX": -574.142,
          "minZ": -79.597,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_243:площадка",
          "maxX": -614.715,
          "maxZ": -32.897,
          "minX": -636.194,
          "minZ": -54.376,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_244:площадка",
          "maxX": -589.639,
          "maxZ": -36.912,
          "minX": -603.088,
          "minZ": -50.361,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_245:площадка",
          "maxX": -557.332,
          "maxZ": -33.696,
          "minX": -577.213,
          "minZ": -53.577,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_246:площадка",
          "maxX": -615.832,
          "maxZ": -4.923,
          "minX": -635.077,
          "minZ": -24.168,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_247:площадка",
          "maxX": -557.456,
          "maxZ": -4.729,
          "minX": -577.089,
          "minZ": -24.362,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_248:площадка",
          "maxX": -530.505,
          "maxZ": -6.869,
          "minX": -545.858,
          "minZ": -22.222,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_250:площадка",
          "maxX": 635.774,
          "maxZ": -178.772,
          "minX": 615.135,
          "minZ": -199.41,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_251:площадка",
          "maxX": 605.246,
          "maxZ": -122.027,
          "minX": 587.481,
          "minZ": -139.792,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_252:площадка",
          "maxX": 634.937,
          "maxZ": -121.427,
          "minX": 615.973,
          "minZ": -140.391,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_253:площадка",
          "maxX": 577.419,
          "maxZ": -91.672,
          "minX": 557.127,
          "minZ": -111.964,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_254:площадка",
          "maxX": 574.549,
          "maxZ": -65.451,
          "minX": 559.997,
          "minZ": -80.003,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_255:площадка",
          "maxX": 634.719,
          "maxZ": -63.463,
          "minX": 616.19,
          "minZ": -81.992,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_256:площадка",
          "maxX": 574.613,
          "maxZ": -36.296,
          "minX": 559.933,
          "minZ": -50.976,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_257:площадка",
          "maxX": 606.819,
          "maxZ": -33.181,
          "minX": 585.908,
          "minZ": -54.092,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_258:площадка",
          "maxX": 604.802,
          "maxZ": -6.107,
          "minX": 587.925,
          "minZ": -22.984,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_259:площадка",
          "maxX": -617.498,
          "maxZ": 22.502,
          "minX": -633.412,
          "minZ": 6.588,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_260:площадка",
          "maxX": -587.777,
          "maxZ": 23.133,
          "minX": -604.951,
          "minZ": 5.958,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_261:площадка",
          "maxX": -557.902,
          "maxZ": 23.916,
          "minX": -576.643,
          "minZ": 5.175,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_262:площадка",
          "maxX": -530.19,
          "maxZ": 22.537,
          "minX": -546.174,
          "minZ": 6.554,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_263:площадка",
          "maxX": -615.851,
          "maxZ": 53.239,
          "minX": -635.058,
          "minZ": 34.033,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_264:площадка",
          "maxX": -586.483,
          "maxZ": 53.517,
          "minX": -606.244,
          "minZ": 33.756,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_265:площадка",
          "maxX": -615.42,
          "maxZ": 82.762,
          "minX": -635.489,
          "minZ": 62.693,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_266:площадка",
          "maxX": -588.437,
          "maxZ": 80.653,
          "minX": -604.29,
          "minZ": 64.801,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_267:площадка",
          "maxX": -558.543,
          "maxZ": 81.457,
          "minX": -576.002,
          "minZ": 63.998,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_268:площадка",
          "maxX": -615.769,
          "maxZ": 111.503,
          "minX": -635.14,
          "minZ": 92.133,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_269:площадка",
          "maxX": -616.316,
          "maxZ": 140.048,
          "minX": -634.593,
          "minZ": 121.771,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_270:площадка",
          "maxX": -529.195,
          "maxZ": 139.896,
          "minX": -547.168,
          "minZ": 121.923,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_271:площадка",
          "maxX": -616.771,
          "maxZ": 168.683,
          "minX": -634.138,
          "minZ": 151.317,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_272:площадка",
          "maxX": -556.952,
          "maxZ": 170.32,
          "minX": -577.593,
          "minZ": 149.68,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_273:площадка",
          "maxX": -559.299,
          "maxZ": 197.065,
          "minX": -575.246,
          "minZ": 181.117,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_274:площадка",
          "maxX": -530.111,
          "maxZ": 197.162,
          "minX": -546.253,
          "minZ": 181.02,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_275:площадка",
          "maxX": -618.646,
          "maxZ": 224.99,
          "minX": -632.263,
          "minZ": 211.374,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_276:площадка",
          "maxX": -587.705,
          "maxZ": 226.841,
          "minX": -605.023,
          "minZ": 209.523,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_277:площадка",
          "maxX": -559.112,
          "maxZ": 226.343,
          "minX": -575.434,
          "minZ": 210.021,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_278:площадка",
          "maxX": -527.665,
          "maxZ": 228.698,
          "minX": -548.698,
          "minZ": 207.665,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_279:площадка",
          "maxX": -616.895,
          "maxZ": 255.832,
          "minX": -634.014,
          "minZ": 238.713,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_280:площадка",
          "maxX": -589.64,
          "maxZ": 253.996,
          "minX": -603.087,
          "minZ": 240.549,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_281:площадка",
          "maxX": -559.827,
          "maxZ": 254.718,
          "minX": -574.718,
          "minZ": 239.827,
          "y": 0.005
        },
        {
          "blend": 14,
          "id": "b_district_0_2_283:площадка",
          "maxX": -588.07,
          "maxZ": 284.657,
          "minX": -604.657,
          "minZ": 268.07,
          "y": 0.012
        },
        {
          "blend": 14,
          "id": "b_district_3_2_288:площадка",
          "maxX": 630.217,
          "maxZ": 218.789,
          "minX": 604.068,
          "minZ": 192.64,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_3_300:площадка",
          "maxX": -605.359,
          "maxZ": 634.641,
          "minX": -634.641,
          "minZ": 605.359,
          "y": 0.001
        },
        {
          "blend": 14,
          "id": "b_district_1_3_310:площадка",
          "maxX": -126.304,
          "maxZ": 593.696,
          "minX": -153.696,
          "minZ": 566.304,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_314:площадка",
          "maxX": -170.213,
          "maxZ": 629.787,
          "minX": -189.787,
          "minZ": 610.213,
          "y": 0.014
        },
        {
          "blend": 14,
          "id": "b_district_3_3_320:площадка",
          "maxX": 630.826,
          "maxZ": 539.397,
          "minX": 603.46,
          "minZ": 512.032,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_322:площадка",
          "maxX": 634.474,
          "maxZ": 588.759,
          "minX": 599.812,
          "minZ": 554.098,
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
