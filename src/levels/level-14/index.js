/**
 * СГЕНЕРИРОВАННО — руками не править.
 *
 * Источник правки: src/levels/level-14.json. После его изменения запуск
 * `node tools/build-level.mjs src/levels/level-14.json` перезаписывает этот файл и все
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

export const LEVEL_14 = {
  "gameplay": {
    "alienEnemies": {
      "count": 2
    },
    "enemies": {
      "count": 6
    },
    "exit": {
      "x": 800,
      "z": -800
    },
    "exitRadius": 4,
    "goal": "exit"
  },
  "hint": "От района NCC в северо-западном углу плиты — через пустошь к району SKIT в юго-восточном углу. Город достраивается по чанкам 400 м впереди игрока и гаснет за спиной.",
  "map": {
    "bounds": {
      "maxX": 1000,
      "maxZ": 1000,
      "minX": -1000,
      "minZ": -1000
    },
    "catalog": "/src/levels/level-14",
    "cells": [
      {
        "file": "chunk-0-0.l14b",
        "id": "0_0",
        "objects": {
          "buildings": 107,
          "props": 312,
          "roads": 108
        },
        "rect": {
          "maxX": -600,
          "maxZ": -600,
          "minX": -1000,
          "minZ": -1000
        }
      },
      {
        "file": "chunk-0-1.l14b",
        "id": "0_1",
        "objects": {
          "buildings": 19,
          "props": 100,
          "roads": 42
        },
        "rect": {
          "maxX": -600,
          "maxZ": -200,
          "minX": -1000,
          "minZ": -600
        }
      },
      {
        "file": "chunk-0-2.l14b",
        "id": "0_2",
        "objects": {},
        "rect": {
          "maxX": -600,
          "maxZ": 200,
          "minX": -1000,
          "minZ": -200
        }
      },
      {
        "file": "chunk-0-3.l14b",
        "id": "0_3",
        "objects": {
          "buildings": 56,
          "props": 63,
          "roads": 56
        },
        "rect": {
          "maxX": -600,
          "maxZ": 600,
          "minX": -1000,
          "minZ": 200
        }
      },
      {
        "file": "chunk-0-4.l14b",
        "id": "0_4",
        "objects": {
          "buildings": 159,
          "props": 203,
          "roads": 147
        },
        "rect": {
          "maxX": -600,
          "maxZ": 1000,
          "minX": -1000,
          "minZ": 600
        }
      },
      {
        "file": "chunk-1-0.l14b",
        "id": "1_0",
        "objects": {
          "buildings": 20,
          "props": 100,
          "roads": 42
        },
        "rect": {
          "maxX": -200,
          "maxZ": -600,
          "minX": -600,
          "minZ": -1000
        }
      },
      {
        "file": "chunk-1-1.l14b",
        "id": "1_1",
        "objects": {
          "buildings": 4,
          "props": 32,
          "roads": 16
        },
        "rect": {
          "maxX": -200,
          "maxZ": -200,
          "minX": -600,
          "minZ": -600
        }
      },
      {
        "file": "chunk-1-2.l14b",
        "id": "1_2",
        "objects": {},
        "rect": {
          "maxX": -200,
          "maxZ": 200,
          "minX": -600,
          "minZ": -200
        }
      },
      {
        "file": "chunk-1-3.l14b",
        "id": "1_3",
        "objects": {
          "buildings": 10,
          "props": 23,
          "roads": 19
        },
        "rect": {
          "maxX": -200,
          "maxZ": 600,
          "minX": -600,
          "minZ": 200
        }
      },
      {
        "file": "chunk-1-4.l14b",
        "id": "1_4",
        "objects": {
          "buildings": 39,
          "props": 71,
          "roads": 49
        },
        "rect": {
          "maxX": -200,
          "maxZ": 1000,
          "minX": -600,
          "minZ": 600
        }
      },
      {
        "file": "chunk-2-0.l14b",
        "id": "2_0",
        "objects": {},
        "rect": {
          "maxX": 200,
          "maxZ": -600,
          "minX": -200,
          "minZ": -1000
        }
      },
      {
        "file": "chunk-2-1.l14b",
        "id": "2_1",
        "objects": {},
        "rect": {
          "maxX": 200,
          "maxZ": -200,
          "minX": -200,
          "minZ": -600
        }
      },
      {
        "file": "chunk-2-2.l14b",
        "id": "2_2",
        "objects": {},
        "rect": {
          "maxX": 200,
          "maxZ": 200,
          "minX": -200,
          "minZ": -200
        }
      },
      {
        "file": "chunk-2-3.l14b",
        "id": "2_3",
        "objects": {},
        "rect": {
          "maxX": 200,
          "maxZ": 600,
          "minX": -200,
          "minZ": 200
        }
      },
      {
        "file": "chunk-2-4.l14b",
        "id": "2_4",
        "objects": {},
        "rect": {
          "maxX": 200,
          "maxZ": 1000,
          "minX": -200,
          "minZ": 600
        }
      },
      {
        "file": "chunk-3-0.l14b",
        "id": "3_0",
        "objects": {
          "buildings": 73,
          "props": 96,
          "roads": 72
        },
        "rect": {
          "maxX": 600,
          "maxZ": -600,
          "minX": 200,
          "minZ": -1000
        }
      },
      {
        "file": "chunk-3-1.l14b",
        "id": "3_1",
        "objects": {
          "buildings": 29,
          "props": 30,
          "roads": 27
        },
        "rect": {
          "maxX": 600,
          "maxZ": -200,
          "minX": 200,
          "minZ": -600
        }
      },
      {
        "file": "chunk-3-2.l14b",
        "id": "3_2",
        "objects": {},
        "rect": {
          "maxX": 600,
          "maxZ": 200,
          "minX": 200,
          "minZ": -200
        }
      },
      {
        "file": "chunk-3-3.l14b",
        "id": "3_3",
        "objects": {
          "buildings": 23,
          "props": 42,
          "roads": 40
        },
        "rect": {
          "maxX": 600,
          "maxZ": 600,
          "minX": 200,
          "minZ": 200
        }
      },
      {
        "file": "chunk-3-4.l14b",
        "id": "3_4",
        "objects": {
          "buildings": 66,
          "props": 120,
          "roads": 106
        },
        "rect": {
          "maxX": 600,
          "maxZ": 1000,
          "minX": 200,
          "minZ": 600
        }
      },
      {
        "file": "chunk-4-0.l14b",
        "id": "4_0",
        "objects": {
          "buildings": 213,
          "props": 256,
          "roads": 192
        },
        "rect": {
          "maxX": 1000,
          "maxZ": -600,
          "minX": 600,
          "minZ": -1000
        }
      },
      {
        "file": "chunk-4-1.l14b",
        "id": "4_1",
        "objects": {
          "buildings": 75,
          "props": 80,
          "roads": 72
        },
        "rect": {
          "maxX": 1000,
          "maxZ": -200,
          "minX": 600,
          "minZ": -600
        }
      },
      {
        "file": "chunk-4-2.l14b",
        "id": "4_2",
        "objects": {},
        "rect": {
          "maxX": 1000,
          "maxZ": 200,
          "minX": 600,
          "minZ": -200
        }
      },
      {
        "file": "chunk-4-3.l14b",
        "id": "4_3",
        "objects": {
          "buildings": 67,
          "props": 120,
          "roads": 106
        },
        "rect": {
          "maxX": 1000,
          "maxZ": 600,
          "minX": 600,
          "minZ": 200
        }
      },
      {
        "file": "chunk-4-4.l14b",
        "id": "4_4",
        "objects": {
          "buildings": 210,
          "props": 342,
          "roads": 280
        },
        "rect": {
          "maxX": 1000,
          "maxZ": 1000,
          "minX": 600,
          "minZ": 600
        }
      }
    ],
    "clutter": {
      "roof": {
        "perHouse": 4
      },
      "street": {
        "every": 26
      }
    },
    "ground": {
      "color": "#1a1d22",
      "size": 2000,
      "y": 0
    },
    "kind": "open",
    "signage": {
      "keep": 0.75,
      "width": [
        3.5,
        6.5
      ]
    },
    "spawn": {
      "x": -800,
      "z": 800
    },
    "stream": {
      "aheadMax": 400,
      "aheadMin": 100,
      "budgetMs": 40,
      "chunk": 400,
      "keep": 1,
      "overlap": 1.175
    },
    "units": "meters",
    "windows": {
      "lit": 0.42
    }
  },
  "name": "Глава 14. Ночь на четыре района",
  "sky": {
    "fog": {
      "color": "#0e1424",
      "far": 500,
      "near": 40
    },
    "hemi": {
      "ground": "#0a0d12",
      "intensity": 0.4,
      "sky": "#1b2a44"
    },
    "lights": {
      "count": 8,
      "height": 5.4,
      "intensity": 70,
      "spacing": 20
    },
    "sky": "#0b1020",
    "sun": {
      "color": "#bcd0ff",
      "intensity": 0.55,
      "position": [
        120,
        220,
        80
      ]
    }
  }
};
LEVEL_14.map.skeleton = decodeSkeleton(await loadSkel());
