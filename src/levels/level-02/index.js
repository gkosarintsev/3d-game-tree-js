/**
 * СГЕНЕРИРОВАННО — руками не править.
 *
 * Источник правки: src/levels/level-02.json. После его изменения запуск
 * `node tools/build-level.mjs src/levels/level-02.json` перезаписывает этот файл и все
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

export const LEVEL_02 = {
  "gameplay": {
    "alienEnemies": {
      "count": 0
    },
    "enemies": {
      "count": 2
    },
    "exit": {
      "x": 104,
      "z": -4
    },
    "exitRadius": 3.5,
    "goal": "exit"
  },
  "hint": "Пройдите от точки A до маяка точки B: по мосту через пропасть.",
  "map": {
    "bounds": {
      "maxX": 120,
      "maxZ": 120,
      "minX": -120,
      "minZ": -120
    },
    "catalog": "/src/levels/level-02",
    "cells": [
      {
        "file": "chunk-0-0.l14b",
        "id": "0_0",
        "objects": {},
        "rect": {
          "maxX": -60,
          "maxZ": -60,
          "minX": -120,
          "minZ": -120
        }
      },
      {
        "file": "chunk-0-1.l14b",
        "id": "0_1",
        "objects": {
          "roads": 1
        },
        "rect": {
          "maxX": -60,
          "maxZ": 0,
          "minX": -120,
          "minZ": -60
        }
      },
      {
        "file": "chunk-0-2.l14b",
        "id": "0_2",
        "objects": {
          "roads": 1
        },
        "rect": {
          "maxX": -60,
          "maxZ": 60,
          "minX": -120,
          "minZ": 0
        }
      },
      {
        "file": "chunk-0-3.l14b",
        "id": "0_3",
        "objects": {},
        "rect": {
          "maxX": -60,
          "maxZ": 120,
          "minX": -120,
          "minZ": 60
        }
      },
      {
        "file": "chunk-1-0.l14b",
        "id": "1_0",
        "objects": {},
        "rect": {
          "maxX": 0,
          "maxZ": -60,
          "minX": -60,
          "minZ": -120
        }
      },
      {
        "file": "chunk-1-1.l14b",
        "id": "1_1",
        "objects": {
          "roads": 1
        },
        "rect": {
          "maxX": 0,
          "maxZ": 0,
          "minX": -60,
          "minZ": -60
        }
      },
      {
        "file": "chunk-1-2.l14b",
        "id": "1_2",
        "objects": {
          "roads": 1
        },
        "rect": {
          "maxX": 0,
          "maxZ": 60,
          "minX": -60,
          "minZ": 0
        }
      },
      {
        "file": "chunk-1-3.l14b",
        "id": "1_3",
        "objects": {},
        "rect": {
          "maxX": 0,
          "maxZ": 120,
          "minX": -60,
          "minZ": 60
        }
      },
      {
        "file": "chunk-2-0.l14b",
        "id": "2_0",
        "objects": {
          "channels": 1
        },
        "rect": {
          "maxX": 60,
          "maxZ": -60,
          "minX": 0,
          "minZ": -120
        }
      },
      {
        "file": "chunk-2-1.l14b",
        "id": "2_1",
        "objects": {
          "channels": 1,
          "props": 2,
          "roads": 2
        },
        "rect": {
          "maxX": 60,
          "maxZ": 0,
          "minX": 0,
          "minZ": -60
        }
      },
      {
        "file": "chunk-2-2.l14b",
        "id": "2_2",
        "objects": {
          "channels": 1,
          "props": 1,
          "roads": 2
        },
        "rect": {
          "maxX": 60,
          "maxZ": 60,
          "minX": 0,
          "minZ": 0
        }
      },
      {
        "file": "chunk-2-3.l14b",
        "id": "2_3",
        "objects": {},
        "rect": {
          "maxX": 60,
          "maxZ": 120,
          "minX": 0,
          "minZ": 60
        }
      },
      {
        "file": "chunk-3-0.l14b",
        "id": "3_0",
        "objects": {
          "channels": 1
        },
        "rect": {
          "maxX": 120,
          "maxZ": -60,
          "minX": 60,
          "minZ": -120
        }
      },
      {
        "file": "chunk-3-1.l14b",
        "id": "3_1",
        "objects": {
          "channels": 1,
          "props": 6,
          "roads": 2
        },
        "rect": {
          "maxX": 120,
          "maxZ": 0,
          "minX": 60,
          "minZ": -60
        }
      },
      {
        "file": "chunk-3-2.l14b",
        "id": "3_2",
        "objects": {
          "channels": 1,
          "props": 3,
          "roads": 2
        },
        "rect": {
          "maxX": 120,
          "maxZ": 60,
          "minX": 60,
          "minZ": 0
        }
      },
      {
        "file": "chunk-3-3.l14b",
        "id": "3_3",
        "objects": {},
        "rect": {
          "maxX": 120,
          "maxZ": 120,
          "minX": 60,
          "minZ": 60
        }
      }
    ],
    "ground": {
      "color": 7322954,
      "size": 240,
      "y": 0
    },
    "kind": "open",
    "relief": {
      "baseY": 0,
      "blend": 14,
      "cell": 24,
      "hills": [
        {
          "height": 19,
          "id": "main_ridge",
          "radius": 30,
          "x": -4,
          "z": -12
        },
        {
          "height": 14,
          "id": "west_hill",
          "radius": 20,
          "x": -30,
          "z": 26
        },
        {
          "height": 15,
          "id": "east_hill",
          "radius": 24,
          "x": 30,
          "z": -34
        }
      ],
      "maxSlope": 1.5,
      "pads": []
    },
    "spawn": {
      "x": -104,
      "z": -4
    },
    "stream": {
      "aheadMax": 120,
      "aheadMin": 60,
      "budgetMs": 40,
      "chunk": 60,
      "keep": 1,
      "overlap": 1.175
    },
    "units": "meters"
  },
  "name": "Глава 2. Перевал (открытый мир)",
  "sky": {
    "fog": {
      "color": 14230008,
      "far": 520,
      "near": 90
    },
    "hemi": {
      "ground": 5527871,
      "intensity": 1,
      "sky": 13613055
    },
    "sky": 12575732,
    "sun": {
      "color": 16771932,
      "intensity": 2.3,
      "position": [
        -120,
        160,
        -90
      ]
    }
  }
};
LEVEL_02.map.skeleton = decodeSkeleton(await loadSkel());
