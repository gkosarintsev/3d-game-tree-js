/**
 * СГЕНЕРИРОВАННО — руками не править.
 *
 * Источник правки: src/levels/level-10.json. После его изменения запуск
 * `node tools/build-level.mjs src/levels/level-10.json` перезаписывает этот файл и все
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

export const LEVEL_10 = {
  "gameplay": {
    "alienEnemies": {
      "count": 0
    },
    "cars": {
      "count": 1,
      "spots": [
        {
          "x": -474,
          "y": 30.125,
          "yaw": 0,
          "z": -480
        }
      ]
    },
    "enemies": {
      "count": 5
    },
    "exit": {
      "x": 440,
      "z": 440
    },
    "exitRadius": 4,
    "goal": "exit"
  },
  "hint": "Холмистый ландшафт (до 45 м) с рекой, изгибающейся через всю карту. Пересекайте реку по мостам — подъезды плавно стыкуются с дорогами. Доберитесь до маяка на противоположной стороне.",
  "map": {
    "bounds": {
      "maxX": 649.35,
      "maxZ": 640,
      "minX": -649.35,
      "minZ": -640
    },
    "catalog": "/src/levels/level-10",
    "cells": [
      {
        "file": "chunk-0-0.l14b",
        "id": "0_0",
        "objects": {
          "buildings": 1,
          "roads": 3
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
          "roads": 2
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
          "channels": 1,
          "roads": 5
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
          "roads": 2
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
          "roads": 2
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
          "roads": 2
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
          "buildings": 2,
          "roads": 3
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
          "channels": 1,
          "roads": 5
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
        "objects": {
          "roads": 2
        },
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
          "roads": 1
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
          "buildings": 1,
          "roads": 1
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
          "buildings": 2,
          "roads": 1
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
          "roads": 2
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
          "buildings": 1,
          "roads": 2
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
          "channels": 1,
          "roads": 4
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
        "objects": {
          "roads": 3
        },
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
          "buildings": 1,
          "roads": 2
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
          "roads": 2
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
          "roads": 2
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
          "channels": 1,
          "roads": 5
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
          "roads": 2
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
          "buildings": 1,
          "roads": 3
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
          "bx": -360,
          "bz": -380,
          "height": 42,
          "id": "h1",
          "radius": 430,
          "x": -360,
          "z": -380
        },
        {
          "bx": 40,
          "bz": -360,
          "height": 35,
          "id": "h2",
          "radius": 400,
          "x": 40,
          "z": -360
        },
        {
          "bx": 400,
          "bz": -300,
          "height": 45,
          "id": "h3",
          "radius": 420,
          "x": 400,
          "z": -300
        },
        {
          "bx": -420,
          "bz": -40,
          "height": 28,
          "id": "h4",
          "radius": 380,
          "x": -420,
          "z": -40
        },
        {
          "bx": -60,
          "bz": -120,
          "height": 30,
          "id": "h5",
          "radius": 360,
          "x": -60,
          "z": -120
        },
        {
          "bx": 440,
          "bz": 80,
          "height": 32,
          "id": "h6",
          "radius": 390,
          "x": 440,
          "z": 80
        },
        {
          "bx": -340,
          "bz": 400,
          "height": 40,
          "id": "h7",
          "radius": 440,
          "x": -340,
          "z": 400
        },
        {
          "bx": 80,
          "bz": 380,
          "height": 38,
          "id": "h8",
          "radius": 380,
          "x": 80,
          "z": 380
        },
        {
          "bx": 360,
          "bz": 420,
          "height": 34,
          "id": "h9",
          "radius": 420,
          "x": 360,
          "z": 420
        },
        {
          "bx": 220,
          "bz": -420,
          "height": 25,
          "id": "h10",
          "radius": 340,
          "x": 220,
          "z": -420
        },
        {
          "bx": -520,
          "bz": 220,
          "height": 26,
          "id": "h11",
          "radius": 320,
          "x": -520,
          "z": 220
        },
        {
          "bx": 520,
          "bz": -120,
          "height": 22,
          "id": "h12",
          "radius": 300,
          "x": 520,
          "z": -120
        }
      ],
      "maxSlope": 0.23,
      "pads": [
        {
          "blend": 14,
          "id": "h10_0:площадка",
          "maxX": -314,
          "maxZ": -315,
          "minX": -326,
          "minZ": -325,
          "y": 43.962
        },
        {
          "blend": 14,
          "id": "h10_1:площадка",
          "maxX": -315,
          "maxZ": -195,
          "minX": -325,
          "minZ": -205,
          "y": 44.271
        },
        {
          "blend": 14,
          "id": "h10_3:площадка",
          "maxX": -75,
          "maxZ": -314,
          "minX": -85,
          "minZ": -326,
          "y": 50.757
        },
        {
          "blend": 25.504,
          "id": "h10_4:площадка",
          "maxX": -54,
          "maxZ": 205,
          "minX": -66,
          "minZ": 195,
          "y": 19.953
        },
        {
          "blend": 14,
          "id": "h10_5:площадка",
          "maxX": -75,
          "maxZ": 365,
          "minX": -85,
          "minZ": 355,
          "y": 37.735
        },
        {
          "blend": 14,
          "id": "h10_6:площадка",
          "maxX": 246,
          "maxZ": -335,
          "minX": 234,
          "minZ": -345,
          "y": 68.542
        },
        {
          "blend": 14,
          "id": "h10_8:площадка",
          "maxX": 246,
          "maxZ": 425,
          "minX": 234,
          "minZ": 415,
          "y": 50.411
        },
        {
          "blend": 95.792,
          "id": "h10_18:площадка",
          "maxX": 545,
          "maxZ": 425,
          "minX": 535,
          "minZ": 415,
          "y": 22.226
        },
        {
          "blend": 120,
          "id": "h10_19:площадка",
          "maxX": -554,
          "maxZ": -415,
          "minX": -566,
          "minZ": -425,
          "y": 23.612
        }
      ]
    },
    "spawn": {
      "x": -480,
      "z": -480
    },
    "stream": {
      "aheadMax": 1200,
      "aheadMin": 200,
      "budgetMs": 80,
      "chunk": 256,
      "keep": 2,
      "overlap": 1.175
    },
    "units": "meters"
  },
  "name": "Глава 10. Река и мосты (CityForge v3)",
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
LEVEL_10.map.skeleton = decodeSkeleton(await loadSkel());
