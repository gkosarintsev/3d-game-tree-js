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
      "count": 1,
      "spots": [
        {
          "x": -560,
          "y": 0.12,
          "yaw": 90,
          "z": -520
        }
      ]
    },
    "enemies": {
      "count": 4
    },
    "exit": {
      "x": 520,
      "z": 520
    },
    "exitRadius": 4,
    "goal": "exit"
  },
  "hint": "Песочница: клеверная развязка — 4 петли (кривые 270° дуги, подъём 0→7→0 м) вокруг центрального путепровода. Холмы в центре убраны.",
  "map": {
    "bodyProbe": 1.2,
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
          "buildings": 89,
          "lights": 2,
          "props": 154,
          "roads": 24
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
          "buildings": 42,
          "lights": 3,
          "props": 110,
          "roads": 22
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
          "buildings": 153,
          "lights": 1,
          "props": 232,
          "roads": 26
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
          "buildings": 121,
          "lights": 3,
          "props": 162,
          "roads": 26
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
    "navEdgeProbe": 1.2,
    "relief": {
      "baseY": 0,
      "blend": 14,
      "cell": 24,
      "hills": [
        {
          "bx": -350,
          "bz": 200,
          "height": 22,
          "id": "hill_west",
          "radius": 140,
          "x": -350,
          "z": 200
        },
        {
          "bx": 350,
          "bz": -220,
          "height": 28,
          "id": "hill_east",
          "radius": 160,
          "x": 350,
          "z": -220
        },
        {
          "bx": 120,
          "bz": 380,
          "height": 18,
          "id": "hill_north",
          "radius": 130,
          "x": 120,
          "z": 380
        },
        {
          "bx": -120,
          "bz": -350,
          "height": 10,
          "id": "valley_south",
          "radius": 150,
          "x": -120,
          "z": -350
        }
      ],
      "maxSlope": 0.33,
      "pads": [],
      "roadCorridors": [
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_repair_connect",
          "points": [
            {
              "x": -520,
              "y": 0,
              "z": -520
            },
            {
              "x": 520,
              "y": 0,
              "z": -520
            },
            {
              "x": 520,
              "y": 0,
              "z": 520
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_repair_connect_extra_1_a",
          "points": [
            {
              "x": 520,
              "y": 0,
              "z": 520
            },
            {
              "x": 75,
              "y": 0,
              "z": 520
            },
            {
              "x": 75,
              "y": 0,
              "z": 220
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_repair_connect_extra_1_b",
          "points": [
            {
              "x": 75,
              "y": 0,
              "z": 220
            },
            {
              "x": 75,
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
          "id": "tr_repair_connect_extra_5",
          "points": [
            {
              "x": 0,
              "y": 0,
              "z": 75
            },
            {
              "x": 0,
              "y": 0,
              "z": 86.15
            },
            {
              "x": 0,
              "y": 0,
              "z": 97.31
            },
            {
              "x": 0,
              "y": 0,
              "z": 108.46
            },
            {
              "x": 0,
              "y": 0,
              "z": 119.62
            },
            {
              "x": 0,
              "y": 0,
              "z": 130.77
            },
            {
              "x": 0,
              "y": 0,
              "z": 141.92
            },
            {
              "x": 0,
              "y": 0,
              "z": 153.08
            },
            {
              "x": 0,
              "y": 0,
              "z": 164.23
            },
            {
              "x": 0,
              "y": 0,
              "z": 175.38
            },
            {
              "x": 0,
              "y": 0,
              "z": 186.54
            },
            {
              "x": 0,
              "y": 0,
              "z": 197.69
            },
            {
              "x": 0,
              "y": 0,
              "z": 208.85
            },
            {
              "x": 0,
              "y": 0,
              "z": 220
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_repair_connect_extra_6",
          "points": [
            {
              "x": 75,
              "y": 0,
              "z": 0
            },
            {
              "x": 70,
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
          "id": "tr_repair_connect_extra_9",
          "points": [
            {
              "x": 220,
              "y": 0,
              "z": 0
            },
            {
              "x": 150,
              "y": 0,
              "z": 0
            },
            {
              "x": 150,
              "y": 0,
              "z": -60
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_repair_connect_extra_10_a",
          "points": [
            {
              "x": 0,
              "y": 0,
              "z": 220
            },
            {
              "x": 75,
              "y": 0,
              "z": 220
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_repair_connect_extra_10_b",
          "points": [
            {
              "x": 75,
              "y": 0,
              "z": 220
            },
            {
              "x": 80,
              "y": 0,
              "z": 220
            },
            {
              "x": 80,
              "y": 0,
              "z": 150
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "tr_acc_1_1",
          "points": [
            {
              "x": -520,
              "y": 0,
              "z": -520
            },
            {
              "x": -532,
              "y": 0,
              "z": -520
            },
            {
              "x": -544,
              "y": 0,
              "z": -520
            },
            {
              "x": -556,
              "y": 0,
              "z": -520
            },
            {
              "x": -568,
              "y": 0,
              "z": -520
            },
            {
              "x": -580,
              "y": 0,
              "z": -520
            },
            {
              "x": -592,
              "y": 0,
              "z": -520
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
              "x": -592,
              "y": 0,
              "z": -520
            },
            {
              "x": -592,
              "y": 0,
              "z": -508
            },
            {
              "x": -592,
              "y": 0,
              "z": -496
            },
            {
              "x": -592,
              "y": 0,
              "z": -484
            },
            {
              "x": -592,
              "y": 0,
              "z": -472
            },
            {
              "x": -592,
              "y": 0,
              "z": -460
            },
            {
              "x": -592,
              "y": 0,
              "z": -448
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
              "x": -592,
              "y": 0,
              "z": -448
            },
            {
              "x": -580,
              "y": 0,
              "z": -448
            },
            {
              "x": -568,
              "y": 0,
              "z": -448
            },
            {
              "x": -556,
              "y": 0,
              "z": -448
            },
            {
              "x": -544,
              "y": 0,
              "z": -448
            },
            {
              "x": -532,
              "y": 0,
              "z": -448
            },
            {
              "x": -520,
              "y": 0,
              "z": -448
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
            },
            {
              "x": -520,
              "y": 0,
              "z": -412
            },
            {
              "x": -520,
              "y": 0,
              "z": -400
            },
            {
              "x": -520,
              "y": 0,
              "z": -388
            },
            {
              "x": -520,
              "y": 0,
              "z": -376
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
              "x": -520,
              "y": 0,
              "z": -376
            },
            {
              "x": -508,
              "y": 0,
              "z": -376
            },
            {
              "x": -496,
              "y": 0,
              "z": -376
            },
            {
              "x": -484,
              "y": 0,
              "z": -376
            },
            {
              "x": -472,
              "y": 0,
              "z": -376
            },
            {
              "x": -460,
              "y": 0,
              "z": -376
            },
            {
              "x": -448,
              "y": 0,
              "z": -376
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
              "x": -448,
              "y": 0,
              "z": -376
            },
            {
              "x": -448,
              "y": 0,
              "z": -365.64
            },
            {
              "x": -448,
              "y": 0,
              "z": -355.27
            },
            {
              "x": -448,
              "y": 0,
              "z": -344.91
            },
            {
              "x": -448,
              "y": 0,
              "z": -334.55
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
              "x": 0,
              "y": 0,
              "z": 220
            },
            {
              "x": -12,
              "y": 0,
              "z": 220
            },
            {
              "x": -24,
              "y": 0,
              "z": 220
            },
            {
              "x": -36,
              "y": 0,
              "z": 220
            },
            {
              "x": -48,
              "y": 0,
              "z": 220
            },
            {
              "x": -60,
              "y": 0,
              "z": 220
            },
            {
              "x": -72,
              "y": 0,
              "z": 220
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
              "x": -72,
              "y": 0,
              "z": 220
            },
            {
              "x": -72,
              "y": 0,
              "z": 232
            },
            {
              "x": -72,
              "y": 0,
              "z": 244
            },
            {
              "x": -72,
              "y": 0,
              "z": 256
            },
            {
              "x": -72,
              "y": 0,
              "z": 268
            },
            {
              "x": -72,
              "y": 0,
              "z": 280
            },
            {
              "x": -72,
              "y": 0,
              "z": 292
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
              "x": -72,
              "y": 0,
              "z": 292
            },
            {
              "x": -84,
              "y": 0,
              "z": 292
            },
            {
              "x": -96,
              "y": 0,
              "z": 292
            },
            {
              "x": -108,
              "y": 0,
              "z": 292
            },
            {
              "x": -120,
              "y": 0,
              "z": 292
            },
            {
              "x": -132,
              "y": 0,
              "z": 292
            },
            {
              "x": -144,
              "y": 0,
              "z": 292
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
              "x": -144,
              "y": 0,
              "z": 292
            },
            {
              "x": -144,
              "y": 0,
              "z": 304
            },
            {
              "x": -144,
              "y": 0,
              "z": 316
            },
            {
              "x": -144,
              "y": 0,
              "z": 328
            },
            {
              "x": -144,
              "y": 0,
              "z": 340
            },
            {
              "x": -144,
              "y": 0,
              "z": 352
            },
            {
              "x": -144,
              "y": 0,
              "z": 364
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
              "x": -144,
              "y": 0,
              "z": 364
            },
            {
              "x": -156,
              "y": 0,
              "z": 364
            },
            {
              "x": -168,
              "y": 0,
              "z": 364
            },
            {
              "x": -180,
              "y": 0,
              "z": 364
            },
            {
              "x": -192,
              "y": 0,
              "z": 364
            },
            {
              "x": -204,
              "y": 0,
              "z": 364
            },
            {
              "x": -216,
              "y": 0,
              "z": 364
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
              "x": -216,
              "y": 0,
              "z": 364
            },
            {
              "x": -216,
              "y": 0,
              "z": 374.4
            },
            {
              "x": -216,
              "y": 0,
              "z": 384.8
            },
            {
              "x": -216,
              "y": 0,
              "z": 395.2
            },
            {
              "x": -216,
              "y": 0,
              "z": 405.6
            },
            {
              "x": -216,
              "y": 0,
              "z": 416
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
              "x": -216,
              "y": 0,
              "z": 416
            },
            {
              "x": -225.78,
              "y": 0,
              "z": 416
            },
            {
              "x": -235.55,
              "y": 0,
              "z": 416
            },
            {
              "x": -245.33,
              "y": 0,
              "z": 416
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
              "x": -245.33,
              "y": 0,
              "z": 416
            },
            {
              "x": -245.33,
              "y": 0,
              "z": 428
            },
            {
              "x": -245.33,
              "y": 0,
              "z": 440
            },
            {
              "x": -245.33,
              "y": 0,
              "z": 452
            },
            {
              "x": -245.33,
              "y": 0,
              "z": 464
            },
            {
              "x": -245.33,
              "y": 0,
              "z": 476
            },
            {
              "x": -245.33,
              "y": 0,
              "z": 488
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
              "x": -245.33,
              "y": 0,
              "z": 488
            },
            {
              "x": -234.66,
              "y": 0,
              "z": 488
            },
            {
              "x": -224,
              "y": 0,
              "z": 488
            },
            {
              "x": -213.33,
              "y": 0,
              "z": 488
            },
            {
              "x": -202.66,
              "y": 0,
              "z": 488
            },
            {
              "x": -192,
              "y": 0,
              "z": 488
            },
            {
              "x": -181.33,
              "y": 0,
              "z": 488
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
              "x": -181.33,
              "y": 0,
              "z": 488
            },
            {
              "x": -181.33,
              "y": 0,
              "z": 500
            },
            {
              "x": -181.33,
              "y": 0,
              "z": 512
            },
            {
              "x": -181.33,
              "y": 0,
              "z": 524
            },
            {
              "x": -181.33,
              "y": 0,
              "z": 536
            },
            {
              "x": -181.33,
              "y": 0,
              "z": 548
            },
            {
              "x": -181.33,
              "y": 0,
              "z": 560
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
              "x": 220,
              "y": 0,
              "z": 0
            },
            {
              "x": 232,
              "y": 0,
              "z": 0
            },
            {
              "x": 244,
              "y": 0,
              "z": 0
            },
            {
              "x": 256,
              "y": 0,
              "z": 0
            },
            {
              "x": 268,
              "y": 0,
              "z": 0
            },
            {
              "x": 280,
              "y": 0,
              "z": 0
            },
            {
              "x": 292,
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
          "id": "tr_acc_1_17_2",
          "points": [
            {
              "x": 292,
              "y": 0,
              "z": 0
            },
            {
              "x": 292,
              "y": 0,
              "z": 12
            },
            {
              "x": 292,
              "y": 0,
              "z": 24
            },
            {
              "x": 292,
              "y": 0,
              "z": 36
            },
            {
              "x": 292,
              "y": 0,
              "z": 48
            },
            {
              "x": 292,
              "y": 0,
              "z": 60
            },
            {
              "x": 292,
              "y": 0,
              "z": 72
            }
          ],
          "shoulder": 1,
          "width": 8
        }
      ]
    },
    "spawn": {
      "x": -520,
      "z": -520
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
  "name": "Глава 18. Песочница развязок",
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
