/**
 * СГЕНЕРИРОВАННО — руками не править.
 *
 * Источник правки: .tmp/open-2km-350.json. После его изменения запуск
 * `node tools/build-level.mjs .tmp/open-2km-350.json` перезаписывает этот файл и все
 * `chunk-*.json` каталога побайтово одинаково (ГПСЧ в разрезке нет, ключи и
 * объекты отсортированы).
 *
 * Открытая глава (этап 1 плана docs/open-world-plan.md): геометрии здесь нет.
 * Мир лежит по клеткам `cells[]` — у каждой своё начало (`origin` — центр
 * клетки в мировых осях) и свой файл `chunk-<i>-<j>.json` с обычными данными
 * `JsonMap` в этих местных осях: `ground.size` в них — сторона клетки, а не
 * сторона мира. Местные оси нужны затем, что решётка навигации ставит узлы по
 * площади плиты: на 27 МБ модуле и на мире в 2 км шаг загрузки считался бы по
 * всему миру, а не по загружаемому куску. Мировой кадр держит этот файл, и
 * координаты игрока не правятся никогда — в отличие от окна главы 4.
 *
 * Дом, вставший на шов, едет в каждый пересекающий чанк (маргин
 * `stream.overlap` — его вывел парсер, движку считать его нечем), а картинку и
 * свет даёт только владеющий: у его копии стоит флаг `owner: true`.
 * `skeleton` — этап 2, до него пустой.
 * Предупреждения парсера:
 *   — ring_ring: опора в 375.146, 111.291 попала в cut:берег — пропущена
 *   — ring_ring: опора в 93.859, 127.804 попала в cut:берег — пропущена
 *
 */
export const OPEN_2KM_350 = {
  "gameplay": {
    "alienEnemies": {
      "count": 2
    },
    "enemies": {
      "count": 8
    },
    "exit": {
      "x": 480,
      "z": 460
    },
    "exitRadius": 4,
    "goal": "exit"
  },
  "hint": "Замерная фикстура этапа 0 (docs/open-world-plan.md): не глава, а полигон для чисел. Плита 1400 × 1400 м, девять косых кварталов, рельеф с террасами, одно русло через весь мир и один участок трассы — чтобы цена точки решётки была худшей (перила, дуги, откосы), а не средней.",
  "map": {
    "cells": [
      {
        "file": "chunk-0-0.json",
        "id": "0_0",
        "objects": {
          "buildings": 72,
          "props": 256,
          "roads": 192
        },
        "origin": {
          "x": -525,
          "z": -525
        },
        "rect": {
          "maxX": -350,
          "maxZ": -350,
          "minX": -700,
          "minZ": -700
        }
      },
      {
        "file": "chunk-0-1.json",
        "id": "0_1",
        "objects": {
          "buildings": 61,
          "props": 232,
          "roads": 179
        },
        "origin": {
          "x": -525,
          "z": -175
        },
        "rect": {
          "maxX": -350,
          "maxZ": 0,
          "minX": -700,
          "minZ": -350
        }
      },
      {
        "file": "chunk-0-2.json",
        "id": "0_2",
        "objects": {
          "buildings": 40,
          "channels": 1,
          "props": 169,
          "roads": 132
        },
        "origin": {
          "x": -525,
          "z": 175
        },
        "rect": {
          "maxX": -350,
          "maxZ": 350,
          "minX": -700,
          "minZ": 0
        }
      },
      {
        "file": "chunk-0-3.json",
        "id": "0_3",
        "objects": {
          "buildings": 39,
          "props": 162,
          "roads": 112
        },
        "origin": {
          "x": -525,
          "z": 525
        },
        "rect": {
          "maxX": -350,
          "maxZ": 700,
          "minX": -700,
          "minZ": 350
        }
      },
      {
        "file": "chunk-1-0.json",
        "id": "1_0",
        "objects": {
          "buildings": 67,
          "props": 237,
          "roads": 178
        },
        "origin": {
          "x": -175,
          "z": -525
        },
        "rect": {
          "maxX": 0,
          "maxZ": -350,
          "minX": -350,
          "minZ": -700
        }
      },
      {
        "file": "chunk-1-1.json",
        "id": "1_1",
        "objects": {
          "buildings": 68,
          "props": 196,
          "roads": 162
        },
        "origin": {
          "x": -175,
          "z": -175
        },
        "rect": {
          "maxX": 0,
          "maxZ": 0,
          "minX": -350,
          "minZ": -350
        }
      },
      {
        "file": "chunk-1-2.json",
        "id": "1_2",
        "objects": {
          "buildings": 50,
          "channels": 1,
          "props": 163,
          "roads": 120
        },
        "origin": {
          "x": -175,
          "z": 175
        },
        "rect": {
          "maxX": 0,
          "maxZ": 350,
          "minX": -350,
          "minZ": 0
        }
      },
      {
        "file": "chunk-1-3.json",
        "id": "1_3",
        "objects": {
          "buildings": 43,
          "props": 144,
          "roads": 105
        },
        "origin": {
          "x": -175,
          "z": 525
        },
        "rect": {
          "maxX": 0,
          "maxZ": 700,
          "minX": -350,
          "minZ": 350
        }
      },
      {
        "file": "chunk-2-0.json",
        "id": "2_0",
        "objects": {
          "buildings": 67,
          "props": 206,
          "roads": 176
        },
        "origin": {
          "x": 175,
          "z": -525
        },
        "rect": {
          "maxX": 350,
          "maxZ": -350,
          "minX": 0,
          "minZ": -700
        }
      },
      {
        "file": "chunk-2-1.json",
        "id": "2_1",
        "objects": {
          "buildings": 57,
          "props": 259,
          "roads": 161
        },
        "origin": {
          "x": 175,
          "z": -175
        },
        "rect": {
          "maxX": 350,
          "maxZ": 0,
          "minX": 0,
          "minZ": -350
        }
      },
      {
        "file": "chunk-2-2.json",
        "id": "2_2",
        "objects": {
          "buildings": 39,
          "channels": 1,
          "props": 224,
          "roads": 132
        },
        "origin": {
          "x": 175,
          "z": 175
        },
        "rect": {
          "maxX": 350,
          "maxZ": 350,
          "minX": 0,
          "minZ": 0
        }
      },
      {
        "file": "chunk-2-3.json",
        "id": "2_3",
        "objects": {
          "buildings": 39,
          "props": 138,
          "roads": 101
        },
        "origin": {
          "x": 175,
          "z": 525
        },
        "rect": {
          "maxX": 350,
          "maxZ": 700,
          "minX": 0,
          "minZ": 350
        }
      },
      {
        "file": "chunk-3-0.json",
        "id": "3_0",
        "objects": {
          "buildings": 21,
          "props": 107,
          "roads": 67
        },
        "origin": {
          "x": 525,
          "z": -525
        },
        "rect": {
          "maxX": 700,
          "maxZ": -350,
          "minX": 350,
          "minZ": -700
        }
      },
      {
        "file": "chunk-3-1.json",
        "id": "3_1",
        "objects": {
          "buildings": 23,
          "props": 96,
          "roads": 66
        },
        "origin": {
          "x": 525,
          "z": -175
        },
        "rect": {
          "maxX": 700,
          "maxZ": 0,
          "minX": 350,
          "minZ": -350
        }
      },
      {
        "file": "chunk-3-2.json",
        "id": "3_2",
        "objects": {
          "buildings": 9,
          "channels": 1,
          "props": 91,
          "roads": 48
        },
        "origin": {
          "x": 525,
          "z": 175
        },
        "rect": {
          "maxX": 700,
          "maxZ": 350,
          "minX": 350,
          "minZ": 0
        }
      },
      {
        "file": "chunk-3-3.json",
        "id": "3_3",
        "objects": {
          "buildings": 10,
          "props": 63,
          "roads": 41
        },
        "origin": {
          "x": 525,
          "z": 525
        },
        "rect": {
          "maxX": 700,
          "maxZ": 700,
          "minX": 350,
          "minZ": 350
        }
      }
    ],
    "kind": "open",
    "skeleton": {
      "edges": [],
      "nodes": []
    },
    "spawn": {
      "x": -500,
      "z": -500
    },
    "stream": {
      "aheadMax": 900,
      "aheadMin": 300,
      "budgetMs": 8,
      "chunk": 350,
      "keep": 1,
      "overlap": 1.175
    },
    "units": "meters",
    "world": {
      "bounds": {
        "maxX": 700,
        "maxZ": 700,
        "minX": -700,
        "minZ": -700
      },
      "color": "#2a2d33",
      "size": 1400,
      "y": 0
    }
  },
  "name": "Зонд открытого мира 1,96 км²",
  "sky": {
    "fog": {
      "color": "#0e1424",
      "far": 320,
      "near": 40
    },
    "hemi": {
      "ground": "#0a0d12",
      "intensity": 0.7,
      "sky": "#1b2a44"
    },
    "sky": "#0b1020",
    "sun": {
      "color": "#bcd0ff",
      "intensity": 3.5,
      "position": [
        120,
        220,
        80
      ]
    }
  }
};
