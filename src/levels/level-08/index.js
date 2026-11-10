/**
 * СГЕНЕРИРОВАННО — руками не править.
 *
 * Источник правки: src/levels/level-08.json. После его изменения запуск
 * `node tools/build-level.mjs src/levels/level-08.json` перезаписывает этот файл и все
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

export const LEVEL_08 = {
  "gameplay": {
    "alienEnemies": {
      "count": 0
    },
    "cars": {
      "count": 1,
      "spots": [
        {
          "x": -474,
          "y": 27.586,
          "yaw": 0,
          "z": -480
        }
      ]
    },
    "enemies": {
      "count": 4
    },
    "exit": {
      "x": 480,
      "z": 480
    },
    "exitRadius": 4,
    "goal": "exit"
  },
  "hint": "Неровный ландшафт с холмами до 50 м, дома на фундаментах terrain и дороги по поверхности. Доберитесь до маяка на противоположной стороне карты.",
  "map": {
    "bounds": {
      "maxX": 640,
      "maxZ": 640,
      "minX": -640,
      "minZ": -640
    },
    "catalog": "/src/levels/level-08",
    "cells": [
      {
        "file": "chunk-0-0.l14b",
        "id": "0_0",
        "objects": {
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
          "buildings": 1,
          "roads": 2
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
          "buildings": 1,
          "roads": 1
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
          "buildings": 1,
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
          "buildings": 1,
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
          "buildings": 2
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
          "buildings": 1,
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
          "buildings": 1,
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
          "buildings": 1,
          "roads": 1
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
          "buildings": 1,
          "roads": 2
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
          "buildings": 1,
          "roads": 1
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
          "buildings": 1,
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
          "bx": -350,
          "bz": -350,
          "height": 45,
          "id": "h1",
          "radius": 422,
          "x": -350,
          "z": -350
        },
        {
          "bx": 0,
          "bz": -380,
          "height": 38,
          "id": "h2",
          "radius": 357,
          "x": 0,
          "z": -380
        },
        {
          "bx": 380,
          "bz": -320,
          "height": 50,
          "id": "h3",
          "radius": 469,
          "x": 380,
          "z": -320
        },
        {
          "bx": -420,
          "bz": 0,
          "height": 35,
          "id": "h4",
          "radius": 329,
          "x": -420,
          "z": 0
        },
        {
          "bx": -50,
          "bz": 50,
          "height": 42,
          "id": "h5",
          "radius": 394,
          "x": -50,
          "z": 50
        },
        {
          "bx": 400,
          "bz": 40,
          "height": 30,
          "id": "h6",
          "radius": 282,
          "x": 400,
          "z": 40
        },
        {
          "bx": -320,
          "bz": 360,
          "height": 48,
          "id": "h7",
          "radius": 450,
          "x": -320,
          "z": 360
        },
        {
          "bx": 50,
          "bz": 400,
          "height": 33,
          "id": "h8",
          "radius": 310,
          "x": 50,
          "z": 400
        },
        {
          "bx": 360,
          "bz": 380,
          "height": 46,
          "id": "h9",
          "radius": 432,
          "x": 360,
          "z": 380
        },
        {
          "bx": 180,
          "bz": -120,
          "height": 25,
          "id": "h10",
          "radius": 235,
          "x": 180,
          "z": -120
        },
        {
          "bx": -180,
          "bz": 180,
          "height": 28,
          "id": "h11",
          "radius": 263,
          "x": -180,
          "z": 180
        },
        {
          "bx": -550,
          "bz": 300,
          "height": 30,
          "id": "h12",
          "radius": 320,
          "x": -550,
          "z": 300
        },
        {
          "bx": 550,
          "bz": -450,
          "height": 35,
          "id": "h13",
          "radius": 340,
          "x": 550,
          "z": -450
        },
        {
          "bx": 0,
          "bz": -150,
          "height": 22,
          "id": "h14",
          "radius": 300,
          "x": 0,
          "z": -150
        }
      ],
      "maxSlope": 0.32,
      "pads": [
        {
          "blend": 14,
          "id": "h8_0:площадка",
          "maxX": -194,
          "maxZ": -335,
          "minX": -206,
          "minZ": -345,
          "y": 47.553
        },
        {
          "blend": 14,
          "id": "h8_1:площадка",
          "maxX": -315,
          "maxZ": -75,
          "minX": -325,
          "minZ": -85,
          "y": 42.634
        },
        {
          "blend": 14,
          "id": "h8_2:площадка",
          "maxX": -313,
          "maxZ": 245,
          "minX": -327,
          "minZ": 235,
          "y": 62.941
        },
        {
          "blend": 14,
          "id": "h8_3:площадка",
          "maxX": -75,
          "maxZ": -314,
          "minX": -85,
          "minZ": -326,
          "y": 51.469
        },
        {
          "blend": 14,
          "id": "h8_4:площадка",
          "maxX": -34,
          "maxZ": -54,
          "minX": -46,
          "minZ": -66,
          "y": 51.932
        },
        {
          "blend": 61.058,
          "id": "h8_5:площадка",
          "maxX": -75,
          "maxZ": 265,
          "minX": -85,
          "minZ": 255,
          "y": 63.562
        },
        {
          "blend": 14,
          "id": "h8_6:площадка",
          "maxX": 246,
          "maxZ": -335,
          "minX": 234,
          "minZ": -345,
          "y": 48.494
        },
        {
          "blend": 32.779,
          "id": "h8_7:площадка",
          "maxX": 265,
          "maxZ": -53,
          "minX": 255,
          "minZ": -67,
          "y": 46.864
        },
        {
          "blend": 14,
          "id": "h8_8:площадка",
          "maxX": 246,
          "maxZ": 246,
          "minX": 234,
          "minZ": 234,
          "y": 34.491
        },
        {
          "blend": 33.469,
          "id": "h8_9:площадка",
          "maxX": 85,
          "maxZ": 85,
          "minX": 75,
          "minZ": 75,
          "y": 34.538
        },
        {
          "blend": 120,
          "id": "h8_10:площадка",
          "maxX": 526,
          "maxZ": -95,
          "minX": 514,
          "minZ": -105,
          "y": 30.28
        },
        {
          "blend": 39.72,
          "id": "h8_11:площадка",
          "maxX": 505,
          "maxZ": 326,
          "minX": 495,
          "minZ": 314,
          "y": 33.875
        },
        {
          "blend": 78.671,
          "id": "h8_12:площадка",
          "maxX": 7,
          "maxZ": -515,
          "minX": -7,
          "minZ": -525,
          "y": 27.847
        },
        {
          "blend": 120,
          "id": "h8_13:площадка",
          "maxX": 6,
          "maxZ": 525,
          "minX": -6,
          "minZ": 515,
          "y": 28.326
        }
      ],
      "roadCorridors": [
        {
          "blend": 5,
          "crossLevel": true,
          "id": "road_h_m480",
          "points": [
            {
              "x": -580,
              "y": 0,
              "z": -480
            },
            {
              "x": 580,
              "y": 0,
              "z": -480
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "road_h_m160",
          "points": [
            {
              "x": -580,
              "y": 0,
              "z": -160
            },
            {
              "x": 580,
              "y": 0,
              "z": -160
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "road_h_160",
          "points": [
            {
              "x": -580,
              "y": 0,
              "z": 160
            },
            {
              "x": 580,
              "y": 0,
              "z": 160
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "road_h_480",
          "points": [
            {
              "x": -580,
              "y": 0,
              "z": 480
            },
            {
              "x": 580,
              "y": 0,
              "z": 480
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "road_v_m480",
          "points": [
            {
              "x": -480,
              "y": 0,
              "z": -580
            },
            {
              "x": -480,
              "y": 0,
              "z": 580
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "road_v_m160",
          "points": [
            {
              "x": -160,
              "y": 0,
              "z": -580
            },
            {
              "x": -160,
              "y": 0,
              "z": 580
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "road_v_160",
          "points": [
            {
              "x": 160,
              "y": 0,
              "z": -580
            },
            {
              "x": 160,
              "y": 0,
              "z": 580
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "road_v_480",
          "points": [
            {
              "x": 480,
              "y": 0,
              "z": -580
            },
            {
              "x": 480,
              "y": 0,
              "z": 580
            }
          ],
          "shoulder": 1,
          "width": 8
        }
      ]
    },
    "spawn": {
      "x": -480,
      "z": -480
    },
    "stream": {
      "aheadMax": 700,
      "aheadMin": 200,
      "budgetMs": 60,
      "chunk": 256,
      "keep": 2,
      "overlap": 1.175
    },
    "units": "meters"
  },
  "name": "Глава 8. Холмистая равнина (CityForge v3)",
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
LEVEL_08.map.skeleton = decodeSkeleton(await loadSkel());
