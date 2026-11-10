/**
 * СГЕНЕРИРОВАННО — руками не править.
 *
 * Источник правки: src/levels/level-09.json. После его изменения запуск
 * `node tools/build-level.mjs src/levels/level-09.json` перезаписывает этот файл и все
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

export const LEVEL_09 = {
  "gameplay": {
    "alienEnemies": {
      "count": 0
    },
    "cars": {
      "count": 1,
      "spots": [
        {
          "x": -474,
          "y": 28.59,
          "yaw": 0,
          "z": -480
        }
      ]
    },
    "enemies": {
      "count": 5
    },
    "exit": {
      "x": 480,
      "z": 480
    },
    "exitRadius": 4,
    "goal": "exit"
  },
  "hint": "Холмистый ландшафт (холмы до 45 м) с плотной застройкой по всей карте и районом небоскрёбов. Дороги по поверхности рельефа. Доберитесь до маяка на противоположной стороне карты.",
  "map": {
    "bounds": {
      "maxX": 640,
      "maxZ": 640,
      "minX": -640,
      "minZ": -640
    },
    "catalog": "/src/levels/level-09",
    "cells": [
      {
        "file": "chunk-0-0.l14b",
        "id": "0_0",
        "objects": {
          "buildings": 38,
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
          "buildings": 35,
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
          "buildings": 43,
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
          "buildings": 44,
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
          "buildings": 32,
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
          "buildings": 41,
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
          "buildings": 39,
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
          "buildings": 46,
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
          "buildings": 38,
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
          "buildings": 42,
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
          "buildings": 41,
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
          "buildings": 47,
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
          "buildings": 55
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
          "buildings": 42,
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
          "buildings": 41,
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
          "buildings": 33,
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
          "buildings": 37,
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
          "buildings": 48,
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
          "buildings": 35,
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
          "buildings": 40,
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
          "buildings": 38,
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
          "buildings": 39,
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
          "buildings": 44,
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
          "buildings": 39,
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
          "buildings": 35,
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
          "bx": -380,
          "bz": -360,
          "height": 40,
          "id": "h1",
          "radius": 430,
          "x": -380,
          "z": -360
        },
        {
          "bx": 20,
          "bz": -400,
          "height": 45,
          "id": "h2",
          "radius": 400,
          "x": 20,
          "z": -400
        },
        {
          "bx": 400,
          "bz": -340,
          "height": 38,
          "id": "h3",
          "radius": 420,
          "x": 400,
          "z": -340
        },
        {
          "bx": -440,
          "bz": 20,
          "height": 32,
          "id": "h4",
          "radius": 380,
          "x": -440,
          "z": 20
        },
        {
          "bx": -80,
          "bz": 60,
          "height": 35,
          "id": "h5",
          "radius": 410,
          "x": -80,
          "z": 60
        },
        {
          "bx": 420,
          "bz": 60,
          "height": 28,
          "id": "h6",
          "radius": 360,
          "x": 420,
          "z": 60
        },
        {
          "bx": -340,
          "bz": 380,
          "height": 42,
          "id": "h7",
          "radius": 440,
          "x": -340,
          "z": 380
        },
        {
          "bx": 60,
          "bz": 420,
          "height": 30,
          "id": "h8",
          "radius": 390,
          "x": 60,
          "z": 420
        },
        {
          "bx": 380,
          "bz": 400,
          "height": 44,
          "id": "h9",
          "radius": 430,
          "x": 380,
          "z": 400
        },
        {
          "bx": 200,
          "bz": -140,
          "height": 22,
          "id": "h10",
          "radius": 320,
          "x": 200,
          "z": -140
        },
        {
          "bx": -200,
          "bz": 200,
          "height": 26,
          "id": "h11",
          "radius": 340,
          "x": -200,
          "z": 200
        },
        {
          "bx": -560,
          "bz": 320,
          "height": 24,
          "id": "h12",
          "radius": 300,
          "x": -560,
          "z": 320
        },
        {
          "bx": 560,
          "bz": -460,
          "height": 28,
          "id": "h13",
          "radius": 320,
          "x": 560,
          "z": -460
        }
      ],
      "maxSlope": 0.23,
      "pads": [],
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
      "aheadMax": 1200,
      "aheadMin": 200,
      "budgetMs": 100,
      "chunk": 256,
      "keep": 2,
      "overlap": 1.175
    },
    "units": "meters",
    "windows": {}
  },
  "name": "Глава 9. Плотная застройка (CityForge v3)",
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
LEVEL_09.map.skeleton = decodeSkeleton(await loadSkel());
