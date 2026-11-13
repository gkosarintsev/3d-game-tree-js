/**
 * СГЕНЕРИРОВАННО — руками не править.
 *
 * Источник правки: src/levels/level-18.json. После его изменения запуск
 * `node tools/build-level.mjs src/levels/level-18.json` перезаписывает этот файл и все
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

export const LEVEL_18 = {
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
      "x": 220,
      "z": 0
    },
    "exitRadius": 4,
    "goal": "exit"
  },
  "hint": "Длинный мост со съездом посередине.",
  "map": {
    "bounds": {
      "maxX": 640,
      "maxZ": 640,
      "minX": -640,
      "minZ": -640
    },
    "catalog": "/src/levels/level-18",
    "cells": [
      {
        "file": "chunk-0-0.l14b",
        "id": "0_0",
        "objects": {
          "buildings": 129,
          "props": 19,
          "roads": 22
        },
        "rect": {
          "maxX": 0,
          "maxZ": 0,
          "minX": -640,
          "minZ": -640
        }
      },
      {
        "file": "chunk-0-1.l14b",
        "id": "0_1",
        "objects": {
          "buildings": 32,
          "props": 19,
          "roads": 6
        },
        "rect": {
          "maxX": 0,
          "maxZ": 640,
          "minX": -640,
          "minZ": 0
        }
      },
      {
        "file": "chunk-1-0.l14b",
        "id": "1_0",
        "objects": {
          "buildings": 130,
          "props": 21,
          "roads": 5
        },
        "rect": {
          "maxX": 640,
          "maxZ": 0,
          "minX": 0,
          "minZ": -640
        }
      },
      {
        "file": "chunk-1-1.l14b",
        "id": "1_1",
        "objects": {
          "buildings": 109,
          "props": 32,
          "roads": 7
        },
        "rect": {
          "maxX": 640,
          "maxZ": 640,
          "minX": 0,
          "minZ": 0
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
          "id": "tr_acc_1_1",
          "points": [
            {
              "x": -220,
              "y": 0,
              "z": 0
            },
            {
              "x": -232,
              "y": 0,
              "z": 0
            },
            {
              "x": -244,
              "y": 0,
              "z": 0
            },
            {
              "x": -256,
              "y": 0,
              "z": 0
            },
            {
              "x": -268,
              "y": 0,
              "z": 0
            },
            {
              "x": -280,
              "y": 0,
              "z": 0
            },
            {
              "x": -292,
              "y": 0,
              "z": 0
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_1_2",
          "points": [
            {
              "x": -292,
              "y": 0,
              "z": 0
            },
            {
              "x": -292,
              "y": 0,
              "z": -12
            },
            {
              "x": -292,
              "y": 0,
              "z": -24
            },
            {
              "x": -292,
              "y": 0,
              "z": -36
            },
            {
              "x": -292,
              "y": 0,
              "z": -48
            },
            {
              "x": -292,
              "y": 0,
              "z": -60
            },
            {
              "x": -292,
              "y": 0,
              "z": -72
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_3",
          "points": [
            {
              "x": -292,
              "y": 0,
              "z": -72
            },
            {
              "x": -304,
              "y": 0,
              "z": -72
            },
            {
              "x": -316,
              "y": 0,
              "z": -72
            },
            {
              "x": -328,
              "y": 0,
              "z": -72
            },
            {
              "x": -340,
              "y": 0,
              "z": -72
            },
            {
              "x": -352,
              "y": 0,
              "z": -72
            },
            {
              "x": -364,
              "y": 0,
              "z": -72
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_3_2",
          "points": [
            {
              "x": -364,
              "y": 0,
              "z": -72
            },
            {
              "x": -364,
              "y": 0,
              "z": -84
            },
            {
              "x": -364,
              "y": 0,
              "z": -96
            },
            {
              "x": -364,
              "y": 0,
              "z": -108
            },
            {
              "x": -364,
              "y": 0,
              "z": -120
            },
            {
              "x": -364,
              "y": 0,
              "z": -132
            },
            {
              "x": -364,
              "y": 0,
              "z": -144
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_5",
          "points": [
            {
              "x": -364,
              "y": 0,
              "z": -144
            },
            {
              "x": -376,
              "y": 0,
              "z": -144
            },
            {
              "x": -388,
              "y": 0,
              "z": -144
            },
            {
              "x": -400,
              "y": 0,
              "z": -144
            },
            {
              "x": -412,
              "y": 0,
              "z": -144
            },
            {
              "x": -424,
              "y": 0,
              "z": -144
            },
            {
              "x": -436,
              "y": 0,
              "z": -144
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_5_2",
          "points": [
            {
              "x": -436,
              "y": 0,
              "z": -144
            },
            {
              "x": -436,
              "y": 0,
              "z": -156
            },
            {
              "x": -436,
              "y": 0,
              "z": -168
            },
            {
              "x": -436,
              "y": 0,
              "z": -180
            },
            {
              "x": -436,
              "y": 0,
              "z": -192
            },
            {
              "x": -436,
              "y": 0,
              "z": -204
            },
            {
              "x": -436,
              "y": 0,
              "z": -216
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_7",
          "points": [
            {
              "x": -436,
              "y": 0,
              "z": -216
            },
            {
              "x": -448,
              "y": 0,
              "z": -216
            },
            {
              "x": -460,
              "y": 0,
              "z": -216
            },
            {
              "x": -472,
              "y": 0,
              "z": -216
            },
            {
              "x": -484,
              "y": 0,
              "z": -216
            },
            {
              "x": -496,
              "y": 0,
              "z": -216
            },
            {
              "x": -508,
              "y": 0,
              "z": -216
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_7_2",
          "points": [
            {
              "x": -508,
              "y": 0,
              "z": -216
            },
            {
              "x": -508,
              "y": 0,
              "z": -228
            },
            {
              "x": -508,
              "y": 0,
              "z": -240
            },
            {
              "x": -508,
              "y": 0,
              "z": -252
            },
            {
              "x": -508,
              "y": 0,
              "z": -264
            },
            {
              "x": -508,
              "y": 0,
              "z": -276
            },
            {
              "x": -508,
              "y": 0,
              "z": -288
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_9",
          "points": [
            {
              "x": -508,
              "y": 0,
              "z": -288
            },
            {
              "x": -496.58,
              "y": 0,
              "z": -288
            },
            {
              "x": -485.16,
              "y": 0,
              "z": -288
            },
            {
              "x": -473.75,
              "y": 0,
              "z": -288
            },
            {
              "x": -462.33,
              "y": 0,
              "z": -288
            },
            {
              "x": -450.91,
              "y": 0,
              "z": -288
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_9_2",
          "points": [
            {
              "x": -450.91,
              "y": 0,
              "z": -288
            },
            {
              "x": -450.91,
              "y": 0,
              "z": -300
            },
            {
              "x": -450.91,
              "y": 0,
              "z": -312
            },
            {
              "x": -450.91,
              "y": 0,
              "z": -324
            },
            {
              "x": -450.91,
              "y": 0,
              "z": -336
            },
            {
              "x": -450.91,
              "y": 0,
              "z": -348
            },
            {
              "x": -450.91,
              "y": 0,
              "z": -360
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_11",
          "points": [
            {
              "x": -450.91,
              "y": 0,
              "z": -360
            },
            {
              "x": -462.91,
              "y": 0,
              "z": -360
            },
            {
              "x": -474.91,
              "y": 0,
              "z": -360
            },
            {
              "x": -486.91,
              "y": 0,
              "z": -360
            },
            {
              "x": -498.91,
              "y": 0,
              "z": -360
            },
            {
              "x": -510.91,
              "y": 0,
              "z": -360
            },
            {
              "x": -522.91,
              "y": 0,
              "z": -360
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_11_2",
          "points": [
            {
              "x": -522.91,
              "y": 0,
              "z": -360
            },
            {
              "x": -522.91,
              "y": 0,
              "z": -372
            },
            {
              "x": -522.91,
              "y": 0,
              "z": -384
            },
            {
              "x": -522.91,
              "y": 0,
              "z": -396
            },
            {
              "x": -522.91,
              "y": 0,
              "z": -408
            },
            {
              "x": -522.91,
              "y": 0,
              "z": -420
            },
            {
              "x": -522.91,
              "y": 0,
              "z": -432
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_13",
          "points": [
            {
              "x": -522.91,
              "y": 0,
              "z": -432
            },
            {
              "x": -534.91,
              "y": 0,
              "z": -432
            },
            {
              "x": -546.91,
              "y": 0,
              "z": -432
            },
            {
              "x": -558.91,
              "y": 0,
              "z": -432
            },
            {
              "x": -570.91,
              "y": 0,
              "z": -432
            },
            {
              "x": -582.91,
              "y": 0,
              "z": -432
            },
            {
              "x": -594.91,
              "y": 0,
              "z": -432
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_13_2",
          "points": [
            {
              "x": -594.91,
              "y": 0,
              "z": -432
            },
            {
              "x": -594.91,
              "y": 0,
              "z": -444
            },
            {
              "x": -594.91,
              "y": 0,
              "z": -456
            },
            {
              "x": -594.91,
              "y": 0,
              "z": -468
            },
            {
              "x": -594.91,
              "y": 0,
              "z": -480
            },
            {
              "x": -594.91,
              "y": 0,
              "z": -492
            },
            {
              "x": -594.91,
              "y": 0,
              "z": -504
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_15",
          "points": [
            {
              "x": -522.91,
              "y": 0,
              "z": -432
            },
            {
              "x": -510.91,
              "y": 0,
              "z": -432
            },
            {
              "x": -498.91,
              "y": 0,
              "z": -432
            },
            {
              "x": -486.91,
              "y": 0,
              "z": -432
            },
            {
              "x": -474.91,
              "y": 0,
              "z": -432
            },
            {
              "x": -462.91,
              "y": 0,
              "z": -432
            },
            {
              "x": -450.91,
              "y": 0,
              "z": -432
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_15_2",
          "points": [
            {
              "x": -450.91,
              "y": 0,
              "z": -432
            },
            {
              "x": -450.91,
              "y": 0,
              "z": -444
            },
            {
              "x": -450.91,
              "y": 0,
              "z": -456
            },
            {
              "x": -450.91,
              "y": 0,
              "z": -468
            },
            {
              "x": -450.91,
              "y": 0,
              "z": -480
            },
            {
              "x": -450.91,
              "y": 0,
              "z": -492
            },
            {
              "x": -450.91,
              "y": 0,
              "z": -504
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_17",
          "points": [
            {
              "x": -450.91,
              "y": 0,
              "z": -504
            },
            {
              "x": -438.91,
              "y": 0,
              "z": -504
            },
            {
              "x": -426.91,
              "y": 0,
              "z": -504
            },
            {
              "x": -414.91,
              "y": 0,
              "z": -504
            },
            {
              "x": -402.91,
              "y": 0,
              "z": -504
            },
            {
              "x": -390.91,
              "y": 0,
              "z": -504
            },
            {
              "x": -378.91,
              "y": 0,
              "z": -504
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_17_2",
          "points": [
            {
              "x": -378.91,
              "y": 0,
              "z": -504
            },
            {
              "x": -378.91,
              "y": 0,
              "z": -516
            },
            {
              "x": -378.91,
              "y": 0,
              "z": -528
            },
            {
              "x": -378.91,
              "y": 0,
              "z": -540
            },
            {
              "x": -378.91,
              "y": 0,
              "z": -552
            },
            {
              "x": -378.91,
              "y": 0,
              "z": -564
            },
            {
              "x": -378.91,
              "y": 0,
              "z": -576
            }
          ],
          "shoulder": 1,
          "width": 8
        }
      ]
    },
    "spawn": {
      "x": 70,
      "z": 10
    },
    "stream": {
      "aheadMax": 900,
      "aheadMin": 200,
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
  "name": "Глава 18. Мост и съезд",
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
LEVEL_18.map.skeleton = decodeSkeleton(await loadSkel());
