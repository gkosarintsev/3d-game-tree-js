/**
 * СГЕНЕРИРОВАННО — руками не править.
 *
 * Источник правки: src/levels/level-19.json. После его изменения запуск
 * `node tools/build-level.mjs src/levels/level-19.json` перезаписывает этот файл и все
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

export const LEVEL_19 = {
  "gameplay": {
    "alienEnemies": {
      "count": 0
    },
    "cars": {
      "count": 0,
      "spots": []
    },
    "enemies": {
      "count": 0
    },
    "exit": {
      "x": -12,
      "z": 1180
    },
    "exitRadius": 5,
    "goal": "exit"
  },
  "hint": "Большая турбинная развязка: правые съезды и спиральные левые рампы вокруг центрального путепровода.",
  "map": {
    "bounds": {
      "maxX": 1280,
      "maxZ": 1280,
      "minX": -1280,
      "minZ": -1280
    },
    "catalog": "/src/levels/level-19",
    "cells": [
      {
        "file": "chunk-0-0.l14b",
        "id": "0_0",
        "objects": {
          "buildings": 2
        },
        "rect": {
          "maxX": -640,
          "maxZ": -640,
          "minX": -1280,
          "minZ": -1280
        }
      },
      {
        "file": "chunk-0-1.l14b",
        "id": "0_1",
        "objects": {
          "buildings": 3,
          "roads": 2
        },
        "rect": {
          "maxX": -640,
          "maxZ": 0,
          "minX": -1280,
          "minZ": -640
        }
      },
      {
        "file": "chunk-0-2.l14b",
        "id": "0_2",
        "objects": {
          "buildings": 3,
          "roads": 1
        },
        "rect": {
          "maxX": -640,
          "maxZ": 640,
          "minX": -1280,
          "minZ": 0
        }
      },
      {
        "file": "chunk-0-3.l14b",
        "id": "0_3",
        "objects": {
          "buildings": 2
        },
        "rect": {
          "maxX": -640,
          "maxZ": 1280,
          "minX": -1280,
          "minZ": 640
        }
      },
      {
        "file": "chunk-1-0.l14b",
        "id": "1_0",
        "objects": {
          "roads": 1
        },
        "rect": {
          "maxX": 0,
          "maxZ": -640,
          "minX": -640,
          "minZ": -1280
        }
      },
      {
        "file": "chunk-1-1.l14b",
        "id": "1_1",
        "objects": {
          "buildings": 1,
          "props": 808,
          "roads": 41
        },
        "rect": {
          "maxX": 0,
          "maxZ": 0,
          "minX": -640,
          "minZ": -640
        }
      },
      {
        "file": "chunk-1-2.l14b",
        "id": "1_2",
        "objects": {
          "buildings": 2,
          "props": 468,
          "roads": 38
        },
        "rect": {
          "maxX": 0,
          "maxZ": 640,
          "minX": -640,
          "minZ": 0
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
          "maxX": 0,
          "maxZ": 1280,
          "minX": -640,
          "minZ": 640
        }
      },
      {
        "file": "chunk-2-0.l14b",
        "id": "2_0",
        "objects": {
          "buildings": 3,
          "roads": 1
        },
        "rect": {
          "maxX": 640,
          "maxZ": -640,
          "minX": 0,
          "minZ": -1280
        }
      },
      {
        "file": "chunk-2-1.l14b",
        "id": "2_1",
        "objects": {
          "buildings": 1,
          "props": 542,
          "roads": 36
        },
        "rect": {
          "maxX": 640,
          "maxZ": 0,
          "minX": 0,
          "minZ": -640
        }
      },
      {
        "file": "chunk-2-2.l14b",
        "id": "2_2",
        "objects": {
          "buildings": 2,
          "props": 808,
          "roads": 44
        },
        "rect": {
          "maxX": 640,
          "maxZ": 640,
          "minX": 0,
          "minZ": 0
        }
      },
      {
        "file": "chunk-2-3.l14b",
        "id": "2_3",
        "objects": {
          "buildings": 6,
          "roads": 1
        },
        "rect": {
          "maxX": 640,
          "maxZ": 1280,
          "minX": 0,
          "minZ": 640
        }
      },
      {
        "file": "chunk-3-0.l14b",
        "id": "3_0",
        "objects": {
          "buildings": 4
        },
        "rect": {
          "maxX": 1280,
          "maxZ": -640,
          "minX": 640,
          "minZ": -1280
        }
      },
      {
        "file": "chunk-3-1.l14b",
        "id": "3_1",
        "objects": {
          "buildings": 2,
          "roads": 1
        },
        "rect": {
          "maxX": 1280,
          "maxZ": 0,
          "minX": 640,
          "minZ": -640
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
          "maxX": 1280,
          "maxZ": 640,
          "minX": 640,
          "minZ": 0
        }
      },
      {
        "file": "chunk-3-3.l14b",
        "id": "3_3",
        "objects": {
          "buildings": 2
        },
        "rect": {
          "maxX": 1280,
          "maxZ": 1280,
          "minX": 640,
          "minZ": 640
        }
      }
    ],
    "ground": {
      "color": 7322954,
      "size": 2560,
      "y": 0
    },
    "kind": "open",
    "relief": {
      "baseY": 0,
      "blend": 14,
      "cell": 24,
      "hills": [
        {
          "bx": 0,
          "bz": 0,
          "height": 0.01,
          "id": "flat_seed",
          "radius": 2,
          "x": 0,
          "z": 0
        }
      ],
      "maxSlope": 0.12,
      "pads": [],
      "roadCorridors": [
        {
          "blend": 5,
          "crossLevel": true,
          "id": "rt1",
          "points": [
            {
              "x": 210,
              "y": 0,
              "z": -12
            },
            {
              "x": 248.823,
              "y": 0,
              "z": -17.111
            },
            {
              "x": 285,
              "y": 0,
              "z": -32.096
            },
            {
              "x": 316.066,
              "y": 0,
              "z": -55.934
            },
            {
              "x": 339.904,
              "y": 0,
              "z": -87
            },
            {
              "x": 354.889,
              "y": 0,
              "z": -123.177
            },
            {
              "x": 360,
              "y": 0,
              "z": -162
            }
          ],
          "shoulder": 1,
          "width": 10
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "rt2_a",
          "points": [
            {
              "x": 12,
              "y": 0,
              "z": 210
            },
            {
              "x": 6.889,
              "y": 0,
              "z": 171.177
            },
            {
              "x": -8.096,
              "y": 0,
              "z": 135
            },
            {
              "x": -31.934,
              "y": 0,
              "z": 103.934
            },
            {
              "x": -63,
              "y": 0,
              "z": 80.096
            },
            {
              "x": -99.177,
              "y": 0,
              "z": 65.111
            },
            {
              "x": -138,
              "y": 0,
              "z": 60
            }
          ],
          "shoulder": 1,
          "width": 10
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "rt2_b",
          "points": [
            {
              "x": 12,
              "y": 0,
              "z": 210
            },
            {
              "x": 6.889,
              "y": 0,
              "z": 171.177
            },
            {
              "x": -8.096,
              "y": 0,
              "z": 135
            },
            {
              "x": -31.934,
              "y": 0,
              "z": 103.934
            },
            {
              "x": -63,
              "y": 0,
              "z": 80.096
            },
            {
              "x": -99.177,
              "y": 0,
              "z": 65.111
            },
            {
              "x": -138,
              "y": 0,
              "z": 60
            }
          ],
          "shoulder": 1,
          "width": 10
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "rt3",
          "points": [
            {
              "x": -210,
              "y": 0,
              "z": 12
            },
            {
              "x": -248.823,
              "y": 0,
              "z": 17.111
            },
            {
              "x": -285,
              "y": 0,
              "z": 32.096
            },
            {
              "x": -316.066,
              "y": 0,
              "z": 55.934
            },
            {
              "x": -339.904,
              "y": 0,
              "z": 87
            },
            {
              "x": -354.889,
              "y": 0,
              "z": 123.177
            },
            {
              "x": -360,
              "y": 0,
              "z": 162
            }
          ],
          "shoulder": 1,
          "width": 10
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "rt4",
          "points": [
            {
              "x": 288,
              "y": 0,
              "z": -210
            },
            {
              "x": 282.889,
              "y": 0,
              "z": -248.823
            },
            {
              "x": 267.904,
              "y": 0,
              "z": -285
            },
            {
              "x": 244.066,
              "y": 0,
              "z": -316.066
            },
            {
              "x": 213,
              "y": 0,
              "z": -339.904
            },
            {
              "x": 176.823,
              "y": 0,
              "z": -354.889
            },
            {
              "x": 138,
              "y": 0,
              "z": -360
            }
          ],
          "shoulder": 1,
          "width": 10
        }
      ]
    },
    "spawn": {
      "x": -1180,
      "z": -12
    },
    "stream": {
      "aheadMax": 1000,
      "aheadMin": 260,
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
  "name": "Глава 19. Турбинная развязка",
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
LEVEL_19.map.skeleton = decodeSkeleton(await loadSkel());
