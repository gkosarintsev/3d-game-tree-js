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
          "buildings": 115,
          "props": 80,
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
          "buildings": 37,
          "props": 21,
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
          "buildings": 19,
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
          "buildings": 10,
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
          "buildings": 15,
          "props": 12
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
          "buildings": 11,
          "channels": 1,
          "props": 21
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
          "props": 2
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
          "buildings": 23,
          "props": 5
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
          "buildings": 28,
          "props": 3
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
          "buildings": 7
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
          "buildings": 3
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
          "buildings": 3,
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
          "maxX": -627.084,
          "maxZ": -595.084,
          "minX": -636.916,
          "minZ": -604.916,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_22:площадка",
          "maxX": -564.339,
          "maxZ": -596.339,
          "minX": -571.661,
          "minZ": -603.661,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_23:площадка",
          "maxX": -548.697,
          "maxZ": -596.697,
          "minX": -555.303,
          "minZ": -603.303,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_24:площадка",
          "maxX": -531.982,
          "maxZ": -595.982,
          "minX": -540.018,
          "minZ": -604.018,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_25:площадка",
          "maxX": -515.731,
          "maxZ": -595.731,
          "minX": -524.269,
          "minZ": -604.269,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_26:площадка",
          "maxX": -500.637,
          "maxZ": -596.637,
          "minX": -507.363,
          "minZ": -603.363,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_27:площадка",
          "maxX": -468.29,
          "maxZ": -596.29,
          "minX": -475.71,
          "minZ": -603.71,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_28:площадка",
          "maxX": -452.521,
          "maxZ": -596.521,
          "minX": -459.479,
          "minZ": -603.479,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_29:площадка",
          "maxX": -436.251,
          "maxZ": -596.251,
          "minX": -443.749,
          "minZ": -603.749,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_30:площадка",
          "maxX": -419.991,
          "maxZ": -595.991,
          "minX": -428.009,
          "minZ": -604.009,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_31:площадка",
          "maxX": -403.767,
          "maxZ": -595.767,
          "minX": -412.233,
          "minZ": -604.233,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_32:площадка",
          "maxX": -627.718,
          "maxZ": -579.718,
          "minX": -636.282,
          "minZ": -588.282,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_33:площадка",
          "maxX": -612.094,
          "maxZ": -580.094,
          "minX": -619.906,
          "minZ": -587.906,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_34:площадка",
          "maxX": -579.051,
          "maxZ": -579.051,
          "minX": -588.949,
          "minZ": -588.949,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_35:площадка",
          "maxX": -564.804,
          "maxZ": -580.804,
          "minX": -571.196,
          "minZ": -587.196,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_36:площадка",
          "maxX": -532.936,
          "maxZ": -580.936,
          "minX": -539.064,
          "minZ": -587.064,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_37:площадка",
          "maxX": -515.753,
          "maxZ": -579.753,
          "minX": -524.247,
          "minZ": -588.247,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_38:площадка",
          "maxX": -500.659,
          "maxZ": -580.659,
          "minX": -507.341,
          "minZ": -587.341,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_39:площадка",
          "maxX": -451.468,
          "maxZ": -579.468,
          "minX": -460.532,
          "minZ": -588.532,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_40:площадка",
          "maxX": -436.774,
          "maxZ": -580.774,
          "minX": -443.226,
          "minZ": -587.226,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_41:площадка",
          "maxX": -419.896,
          "maxZ": -579.896,
          "minX": -428.104,
          "minZ": -588.104,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_42:площадка",
          "maxX": -371.372,
          "maxZ": -579.372,
          "minX": -380.628,
          "minZ": -588.628,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_43:площадка",
          "maxX": -627.422,
          "maxZ": -563.422,
          "minX": -636.578,
          "minZ": -572.578,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_44:площадка",
          "maxX": -611.579,
          "maxZ": -563.579,
          "minX": -620.421,
          "minZ": -572.421,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_45:площадка",
          "maxX": -548.802,
          "maxZ": -564.802,
          "minX": -555.198,
          "minZ": -571.198,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_46:площадка",
          "maxX": -499.288,
          "maxZ": -563.288,
          "minX": -508.712,
          "minZ": -572.712,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_47:площадка",
          "maxX": -483.211,
          "maxZ": -563.211,
          "minX": -492.789,
          "minZ": -572.789,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_48:площадка",
          "maxX": -468.116,
          "maxZ": -564.116,
          "minX": -475.884,
          "minZ": -571.884,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_49:площадка",
          "maxX": -436.416,
          "maxZ": -564.416,
          "minX": -443.584,
          "minZ": -571.584,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_50:площадка",
          "maxX": -419.983,
          "maxZ": -563.983,
          "minX": -428.017,
          "minZ": -572.017,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_51:площадка",
          "maxX": -387.652,
          "maxZ": -563.652,
          "minX": -396.348,
          "minZ": -572.348,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_52:площадка",
          "maxX": -372.186,
          "maxZ": -564.186,
          "minX": -379.814,
          "minZ": -571.814,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_53:площадка",
          "maxX": -339.407,
          "maxZ": -563.407,
          "minX": -348.593,
          "minZ": -572.593,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_54:площадка",
          "maxX": -323.5,
          "maxZ": -563.5,
          "minX": -332.5,
          "minZ": -572.5,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_55:площадка",
          "maxX": -612.884,
          "maxZ": -548.884,
          "minX": -619.116,
          "minZ": -555.116,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_56:площадка",
          "maxX": -595.787,
          "maxZ": -547.787,
          "minX": -604.213,
          "minZ": -556.213,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_57:площадка",
          "maxX": -564.261,
          "maxZ": -548.261,
          "minX": -571.739,
          "minZ": -555.739,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_58:площадка",
          "maxX": -547.141,
          "maxZ": -547.141,
          "minX": -556.859,
          "minZ": -556.859,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_59:площадка",
          "maxX": -515.779,
          "maxZ": -547.779,
          "minX": -524.221,
          "minZ": -556.221,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_60:площадка",
          "maxX": -499.296,
          "maxZ": -547.296,
          "minX": -508.704,
          "minZ": -556.704,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_61:площадка",
          "maxX": -467.195,
          "maxZ": -547.195,
          "minX": -476.805,
          "minZ": -556.805,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_62:площадка",
          "maxX": -420.073,
          "maxZ": -548.073,
          "minX": -427.927,
          "minZ": -555.927,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_63:площадка",
          "maxX": -404.709,
          "maxZ": -548.709,
          "minX": -411.291,
          "minZ": -555.291,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_64:площадка",
          "maxX": -372.093,
          "maxZ": -548.093,
          "minX": -379.907,
          "minZ": -555.907,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_65:площадка",
          "maxX": -339.785,
          "maxZ": -547.785,
          "minX": -348.215,
          "minZ": -556.215,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_66:площадка",
          "maxX": -628.779,
          "maxZ": -532.779,
          "minX": -635.221,
          "minZ": -539.221,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_67:площадка",
          "maxX": -612.274,
          "maxZ": -532.274,
          "minX": -619.726,
          "minZ": -539.726,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_68:площадка",
          "maxX": -595.225,
          "maxZ": -531.225,
          "minX": -604.775,
          "minZ": -540.775,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_69:площадка",
          "maxX": -580.704,
          "maxZ": -532.704,
          "minX": -587.296,
          "minZ": -539.296,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_70:площадка",
          "maxX": -563.936,
          "maxZ": -531.936,
          "minX": -572.064,
          "minZ": -540.064,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_71:площадка",
          "maxX": -548.844,
          "maxZ": -532.844,
          "minX": -555.156,
          "minZ": -539.156,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_72:площадка",
          "maxX": -531.541,
          "maxZ": -531.541,
          "minX": -540.459,
          "minZ": -540.459,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_73:площадка",
          "maxX": -516.911,
          "maxZ": -532.911,
          "minX": -523.089,
          "minZ": -539.089,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_74:площадка",
          "maxX": -468.641,
          "maxZ": -532.641,
          "minX": -475.359,
          "minZ": -539.359,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_75:площадка",
          "maxX": -452.504,
          "maxZ": -532.504,
          "minX": -459.496,
          "minZ": -539.496,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_76:площадка",
          "maxX": -435.375,
          "maxZ": -531.375,
          "minX": -444.625,
          "minZ": -540.625,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_77:площадка",
          "maxX": -420.808,
          "maxZ": -532.808,
          "minX": -427.192,
          "minZ": -539.192,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_78:площадка",
          "maxX": -403.856,
          "maxZ": -531.856,
          "minX": -412.144,
          "minZ": -540.144,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_79:площадка",
          "maxX": -387.815,
          "maxZ": -531.815,
          "minX": -396.185,
          "minZ": -540.185,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_80:площадка",
          "maxX": -371.082,
          "maxZ": -531.082,
          "minX": -380.918,
          "minZ": -540.918,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_81:площадка",
          "maxX": -355.672,
          "maxZ": -531.672,
          "minX": -364.328,
          "minZ": -540.328,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_82:площадка",
          "maxX": -627.083,
          "maxZ": -515.083,
          "minX": -636.917,
          "minZ": -524.917,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_83:площадка",
          "maxX": -579.863,
          "maxZ": -515.863,
          "minX": -588.137,
          "minZ": -524.137,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_84:площадка",
          "maxX": -548.892,
          "maxZ": -516.892,
          "minX": -555.108,
          "minZ": -523.108,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_85:площадка",
          "maxX": -531.965,
          "maxZ": -515.965,
          "minX": -540.035,
          "minZ": -524.035,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_86:площадка",
          "maxX": -628.885,
          "maxZ": -500.885,
          "minX": -635.115,
          "minZ": -507.115,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_87:площадка",
          "maxX": -611.37,
          "maxZ": -499.37,
          "minX": -620.63,
          "minZ": -508.63,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_88:площадка",
          "maxX": -595.223,
          "maxZ": -499.223,
          "minX": -604.777,
          "minZ": -508.777,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_89:площадка",
          "maxX": -579.5,
          "maxZ": -499.5,
          "minX": -588.5,
          "minZ": -508.5,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_90:площадка",
          "maxX": -564.839,
          "maxZ": -500.839,
          "minX": -571.161,
          "minZ": -507.161,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_91:площадка",
          "maxX": -548.544,
          "maxZ": -500.544,
          "minX": -555.456,
          "minZ": -507.456,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_92:площадка",
          "maxX": -532.58,
          "maxZ": -500.58,
          "minX": -539.42,
          "minZ": -507.42,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_93:площадка",
          "maxX": -595.791,
          "maxZ": -483.791,
          "minX": -604.209,
          "minZ": -492.209,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_94:площадка",
          "maxX": -579.732,
          "maxZ": -483.732,
          "minX": -588.268,
          "minZ": -492.268,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_95:площадка",
          "maxX": -547.088,
          "maxZ": -483.088,
          "minX": -556.912,
          "minZ": -492.912,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_96:площадка",
          "maxX": -532.532,
          "maxZ": -484.532,
          "minX": -539.468,
          "minZ": -491.468,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_97:площадка",
          "maxX": -628.834,
          "maxZ": -468.834,
          "minX": -635.166,
          "minZ": -475.166,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_98:площадка",
          "maxX": -612.528,
          "maxZ": -468.528,
          "minX": -619.472,
          "minZ": -475.472,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_99:площадка",
          "maxX": -595.923,
          "maxZ": -467.923,
          "minX": -604.077,
          "minZ": -476.077,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_100:площадка",
          "maxX": -579.491,
          "maxZ": -467.491,
          "minX": -588.509,
          "minZ": -476.509,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_101:площадка",
          "maxX": -563.501,
          "maxZ": -467.501,
          "minX": -572.499,
          "minZ": -476.499,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_102:площадка",
          "maxX": -547.323,
          "maxZ": -467.323,
          "minX": -556.677,
          "minZ": -476.677,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_103:площадка",
          "maxX": -532.422,
          "maxZ": -468.422,
          "minX": -539.578,
          "minZ": -475.578,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_104:площадка",
          "maxX": -612.662,
          "maxZ": -452.662,
          "minX": -619.338,
          "minZ": -459.338,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_105:площадка",
          "maxX": -579.477,
          "maxZ": -451.477,
          "minX": -588.523,
          "minZ": -460.523,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_106:площадка",
          "maxX": -563.731,
          "maxZ": -451.731,
          "minX": -572.269,
          "minZ": -460.269,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_107:площадка",
          "maxX": -628.8,
          "maxZ": -436.8,
          "minX": -635.2,
          "minZ": -443.2,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_108:площадка",
          "maxX": -595.677,
          "maxZ": -435.677,
          "minX": -604.323,
          "minZ": -444.323,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_109:площадка",
          "maxX": -580.729,
          "maxZ": -436.729,
          "minX": -587.271,
          "minZ": -443.271,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_110:площадка",
          "maxX": -547.371,
          "maxZ": -435.371,
          "minX": -556.629,
          "minZ": -444.629,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_111:площадка",
          "maxX": -531.716,
          "maxZ": -435.716,
          "minX": -540.284,
          "minZ": -444.284,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_112:площадка",
          "maxX": -628.419,
          "maxZ": -420.419,
          "minX": -635.581,
          "minZ": -427.581,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_113:площадка",
          "maxX": -611.459,
          "maxZ": -419.459,
          "minX": -620.541,
          "minZ": -428.541,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_0_114:площадка",
          "maxX": -595.523,
          "maxZ": -419.523,
          "minX": -604.477,
          "minZ": -428.477,
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
          "id": "b_district_2_0_151:площадка",
          "maxX": 16.233,
          "maxZ": -623.767,
          "minX": 5.1,
          "minZ": -634.9,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_152:площадка",
          "maxX": 39.104,
          "maxZ": -622.229,
          "minX": 24.896,
          "minZ": -636.438,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_153:площадка",
          "maxX": 79.267,
          "maxZ": -624.733,
          "minX": 70.066,
          "minZ": -633.934,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_154:площадка",
          "maxX": 102.901,
          "maxZ": -622.432,
          "minX": 89.099,
          "minZ": -636.234,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_155:площадка",
          "maxX": 123.096,
          "maxZ": -623.57,
          "minX": 111.57,
          "minZ": -635.096,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_159:площадка",
          "maxX": 80.506,
          "maxZ": -602.16,
          "minX": 68.827,
          "minZ": -613.84,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_165:площадка",
          "maxX": 101.176,
          "maxZ": -581.491,
          "minX": 90.824,
          "minZ": -591.842,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_166:площадка",
          "maxX": 123.435,
          "maxZ": -580.565,
          "minX": 111.232,
          "minZ": -592.768,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_2_0_167:площадка",
          "maxX": 144.217,
          "maxZ": -581.116,
          "minX": 133.116,
          "minZ": -592.217,
          "y": 0.007
        },
        {
          "blend": 14,
          "id": "b_district_2_0_171:площадка",
          "maxX": 123.814,
          "maxZ": -558.852,
          "minX": 110.852,
          "minZ": -571.814,
          "y": 0.007
        },
        {
          "blend": 14,
          "id": "b_district_2_0_176:площадка",
          "maxX": 101.341,
          "maxZ": -538.659,
          "minX": 90.659,
          "minZ": -549.341,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_184:площадка",
          "maxX": 488.293,
          "maxZ": -617.161,
          "minX": 471.707,
          "minZ": -633.748,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_185:площадка",
          "maxX": 603.071,
          "maxZ": -618.748,
          "minX": 589.657,
          "minZ": -632.161,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_186:площадка",
          "maxX": 633.402,
          "maxZ": -617.507,
          "minX": 617.507,
          "minZ": -633.402,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_189:площадка",
          "maxX": 516.499,
          "maxZ": -588.955,
          "minX": 501.683,
          "minZ": -603.772,
          "y": 0.016
        },
        {
          "blend": 14,
          "id": "b_district_3_0_190:площадка",
          "maxX": 548.48,
          "maxZ": -586.066,
          "minX": 527.884,
          "minZ": -606.661,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_191:площадка",
          "maxX": 574.143,
          "maxZ": -589.493,
          "minX": 560.403,
          "minZ": -603.234,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_192:площадка",
          "maxX": 603.694,
          "maxZ": -589.033,
          "minX": 589.033,
          "minZ": -603.694,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_193:площадка",
          "maxX": 633.83,
          "maxZ": -587.989,
          "minX": 617.08,
          "minZ": -604.739,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_196:площадка",
          "maxX": 545.841,
          "maxZ": -559.614,
          "minX": 530.523,
          "minZ": -574.932,
          "y": 0.015
        },
        {
          "blend": 14,
          "id": "b_district_3_0_197:площадка",
          "maxX": 574.022,
          "maxZ": -560.524,
          "minX": 560.524,
          "minZ": -574.022,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_198:площадка",
          "maxX": 607.153,
          "maxZ": -556.483,
          "minX": 585.574,
          "minZ": -578.062,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_199:площадка",
          "maxX": 633.079,
          "maxZ": -559.648,
          "minX": 617.83,
          "minZ": -574.897,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_201:площадка",
          "maxX": 633.044,
          "maxZ": -530.593,
          "minX": 617.865,
          "minZ": -545.771,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_202:площадка",
          "maxX": 604.245,
          "maxZ": -501.209,
          "minX": 588.482,
          "minZ": -516.973,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_206:площадка",
          "maxX": 604.359,
          "maxZ": -442.913,
          "minX": 588.368,
          "minZ": -458.905,
          "y": 0.002
        },
        {
          "blend": 14,
          "id": "b_district_3_0_207:площадка",
          "maxX": 633.305,
          "maxZ": -443.059,
          "minX": 617.604,
          "minZ": -458.759,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_210:площадка",
          "maxX": 632.083,
          "maxZ": -415.189,
          "minX": 618.826,
          "minZ": -428.447,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_0_213:площадка",
          "maxX": 603.86,
          "maxZ": -356.14,
          "minX": 588.867,
          "minZ": -371.133,
          "y": 0.038
        },
        {
          "blend": 14,
          "id": "b_district_3_0_216:площадка",
          "maxX": 634.573,
          "maxZ": -325.427,
          "minX": 616.336,
          "minZ": -343.664,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_217:площадка",
          "maxX": -616.843,
          "maxZ": -296.843,
          "minX": -634.066,
          "minZ": -314.066,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_218:площадка",
          "maxX": -587.718,
          "maxZ": -296.808,
          "minX": -605.01,
          "minZ": -314.101,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_219:площадка",
          "maxX": -527.935,
          "maxZ": -295.208,
          "minX": -548.429,
          "minZ": -315.701,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_220:площадка",
          "maxX": -618.428,
          "maxZ": -269.337,
          "minX": -632.481,
          "minZ": -283.39,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_221:площадка",
          "maxX": -560.195,
          "maxZ": -269.286,
          "minX": -574.351,
          "minZ": -283.442,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_222:площадка",
          "maxX": -557.828,
          "maxZ": -237.828,
          "minX": -576.717,
          "minZ": -256.717,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_223:площадка",
          "maxX": -531.357,
          "maxZ": -240.448,
          "minX": -545.007,
          "minZ": -254.098,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_224:площадка",
          "maxX": -557.253,
          "maxZ": -208.162,
          "minX": -577.292,
          "minZ": -228.201,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_225:площадка",
          "maxX": -530.232,
          "maxZ": -210.232,
          "minX": -546.132,
          "minZ": -226.132,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_226:площадка",
          "maxX": -557.467,
          "maxZ": -179.285,
          "minX": -577.078,
          "minZ": -198.897,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_227:площадка",
          "maxX": -529.765,
          "maxZ": -180.674,
          "minX": -546.599,
          "minZ": -197.508,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_228:площадка",
          "maxX": -616.056,
          "maxZ": -150.602,
          "minX": -634.853,
          "minZ": -169.398,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_229:площадка",
          "maxX": -558.178,
          "maxZ": -150.905,
          "minX": -576.367,
          "minZ": -169.095,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_230:площадка",
          "maxX": -527.529,
          "maxZ": -149.347,
          "minX": -548.835,
          "minZ": -170.653,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_231:площадка",
          "maxX": -615.395,
          "maxZ": -120.85,
          "minX": -635.514,
          "minZ": -140.969,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_232:площадка",
          "maxX": -557.319,
          "maxZ": -120.955,
          "minX": -577.227,
          "minZ": -140.863,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_233:площадка",
          "maxX": -531.312,
          "maxZ": -124.039,
          "minX": -545.052,
          "minZ": -137.779,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_234:площадка",
          "maxX": -618.025,
          "maxZ": -94.388,
          "minX": -632.884,
          "minZ": -109.248,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_235:площадка",
          "maxX": -558.137,
          "maxZ": -63.592,
          "minX": -576.408,
          "minZ": -81.863,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_236:площадка",
          "maxX": -531.253,
          "maxZ": -65.798,
          "minX": -545.111,
          "minZ": -79.656,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_237:площадка",
          "maxX": -586.004,
          "maxZ": -33.277,
          "minX": -606.723,
          "minZ": -53.996,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_238:площадка",
          "maxX": -559.467,
          "maxZ": -35.831,
          "minX": -575.078,
          "minZ": -51.442,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_239:площадка",
          "maxX": -618.73,
          "maxZ": -7.821,
          "minX": -632.179,
          "minZ": -21.27,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_1_240:площадка",
          "maxX": -586.423,
          "maxZ": -4.605,
          "minX": -606.304,
          "minZ": -24.486,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_242:площадка",
          "maxX": 606.072,
          "maxZ": -295.746,
          "minX": 586.656,
          "minZ": -315.163,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_244:площадка",
          "maxX": 635.774,
          "maxZ": -149.681,
          "minX": 615.135,
          "minZ": -170.319,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_245:площадка",
          "maxX": 605.246,
          "maxZ": -92.936,
          "minX": 587.481,
          "minZ": -110.701,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_246:площадка",
          "maxX": 634.937,
          "maxZ": -92.336,
          "minX": 615.973,
          "minZ": -111.3,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_247:площадка",
          "maxX": 577.419,
          "maxZ": -62.581,
          "minX": 557.127,
          "minZ": -82.873,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_248:площадка",
          "maxX": 574.549,
          "maxZ": -36.36,
          "minX": 559.997,
          "minZ": -50.913,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_249:площадка",
          "maxX": 634.719,
          "maxZ": -34.372,
          "minX": 616.19,
          "minZ": -52.901,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_250:площадка",
          "maxX": 574.613,
          "maxZ": -7.206,
          "minX": 559.933,
          "minZ": -21.885,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_1_251:площадка",
          "maxX": 606.819,
          "maxZ": -4.09,
          "minX": 585.908,
          "minZ": -25.001,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_252:площадка",
          "maxX": -557.558,
          "maxZ": 24.26,
          "minX": -576.987,
          "minZ": 4.831,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_253:площадка",
          "maxX": -530.658,
          "maxZ": 22.069,
          "minX": -545.706,
          "minZ": 7.022,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_254:площадка",
          "maxX": -617.347,
          "maxZ": 51.744,
          "minX": -633.562,
          "minZ": 35.529,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_255:площадка",
          "maxX": -586.761,
          "maxZ": 53.239,
          "minX": -605.966,
          "minZ": 34.034,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_256:площадка",
          "maxX": -557.775,
          "maxZ": 53.134,
          "minX": -576.77,
          "minZ": 34.139,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_257:площадка",
          "maxX": -615.851,
          "maxZ": 82.33,
          "minX": -635.058,
          "minZ": 63.124,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_258:площадка",
          "maxX": -586.483,
          "maxZ": 82.608,
          "minX": -606.244,
          "minZ": 62.847,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_259:площадка",
          "maxX": -615.42,
          "maxZ": 111.853,
          "minX": -635.489,
          "minZ": 91.784,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_260:площадка",
          "maxX": -588.437,
          "maxZ": 109.744,
          "minX": -604.29,
          "minZ": 93.892,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_261:площадка",
          "maxX": -558.543,
          "maxZ": 110.548,
          "minX": -576.002,
          "minZ": 93.088,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_262:площадка",
          "maxX": -615.769,
          "maxZ": 140.594,
          "minX": -635.14,
          "minZ": 121.224,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_263:площадка",
          "maxX": -616.316,
          "maxZ": 169.138,
          "minX": -634.593,
          "minZ": 150.862,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_264:площадка",
          "maxX": -529.195,
          "maxZ": 168.986,
          "minX": -547.168,
          "minZ": 151.014,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_265:площадка",
          "maxX": -616.771,
          "maxZ": 197.774,
          "minX": -634.138,
          "minZ": 180.408,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_266:площадка",
          "maxX": -556.952,
          "maxZ": 199.411,
          "minX": -577.593,
          "minZ": 178.771,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_267:площадка",
          "maxX": -559.299,
          "maxZ": 226.156,
          "minX": -575.246,
          "minZ": 210.208,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_268:площадка",
          "maxX": -530.111,
          "maxZ": 226.253,
          "minX": -546.253,
          "minZ": 210.111,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_269:площадка",
          "maxX": -618.646,
          "maxZ": 254.081,
          "minX": -632.263,
          "minZ": 240.465,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_270:площадка",
          "maxX": -587.705,
          "maxZ": 255.932,
          "minX": -605.023,
          "minZ": 238.614,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_271:площадка",
          "maxX": -559.112,
          "maxZ": 255.434,
          "minX": -575.434,
          "minZ": 239.112,
          "y": 0.009
        },
        {
          "blend": 14,
          "id": "b_district_0_2_273:площадка",
          "maxX": -616.895,
          "maxZ": 284.923,
          "minX": -634.014,
          "minZ": 267.804,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_0_2_274:площадка",
          "maxX": -589.64,
          "maxZ": 283.087,
          "minX": -603.087,
          "minZ": 269.64,
          "y": 0.003
        },
        {
          "blend": 14,
          "id": "b_district_3_2_279:площадка",
          "maxX": 629.309,
          "maxZ": 172.166,
          "minX": 604.977,
          "minZ": 147.834,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_2_280:площадка",
          "maxX": 628.498,
          "maxZ": 262.784,
          "minX": 605.788,
          "minZ": 240.073,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_297:площадка",
          "maxX": -126.356,
          "maxZ": 593.644,
          "minX": -153.644,
          "minZ": 566.356,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_300:площадка",
          "maxX": -126.748,
          "maxZ": 633.252,
          "minX": -153.252,
          "minZ": 606.748,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_1_3_301:площадка",
          "maxX": -47.055,
          "maxZ": 632.945,
          "minX": -72.945,
          "minZ": 607.055,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_304:площадка",
          "maxX": 449.285,
          "maxZ": 632.142,
          "minX": 419.286,
          "minZ": 602.143,
          "y": 0
        },
        {
          "blend": 14,
          "id": "b_district_3_3_305:площадка",
          "maxX": 584.586,
          "maxZ": 630.301,
          "minX": 558.271,
          "minZ": 603.985,
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
