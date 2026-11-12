/**
 * СГЕНЕРИРОВАННО — руками не править.
 *
 * Источник правки: src/levels/level-15.json. После его изменения запуск
 * `node tools/build-level.mjs src/levels/level-15.json` перезаписывает этот файл и все
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

export const LEVEL_15 = {
  "gameplay": {
    "alienEnemies": {
      "count": 0
    },
    "cars": {
      "count": 1,
      "spots": [
        {
          "x": -550,
          "y": 14.262,
          "yaw": 0,
          "z": -560
        }
      ]
    },
    "enemies": {
      "count": 6
    },
    "exit": {
      "x": 560,
      "z": 560
    },
    "exitRadius": 4,
    "goal": "exit"
  },
  "hint": "Пересеките реку по мостам, пройдите сквозь горный туннель и доберитесь до маяка.",
  "map": {
    "bounds": {
      "maxX": 643.186,
      "maxZ": 640,
      "minX": -645.885,
      "minZ": -640
    },
    "catalog": "/src/levels/level-15",
    "cells": [
      {
        "file": "chunk-0-0.l14b",
        "id": "0_0",
        "objects": {
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
          "roads": 3
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
          "buildings": 4,
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
          "buildings": 2,
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
          "channels": 1,
          "props": 8,
          "roads": 3
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
          "buildings": 12,
          "roads": 5,
          "tunnels": 1
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
          "buildings": 8,
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
          "buildings": 1,
          "roads": 3,
          "tunnels": 1
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
          "props": 8,
          "roads": 3
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
          "buildings": 2,
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
          "channels": 1,
          "roads": 3
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
        },
        {
          "bx": -50,
          "bz": 290,
          "height": 40,
          "id": "steep_mountain",
          "radius": 130,
          "x": -50,
          "z": 30
        }
      ],
      "maxSlope": 0.52,
      "pads": [],
      "rivers": [
        {
          "bankY": 0,
          "bedY": -4,
          "halfW": 9,
          "ramp": 30,
          "segments": [
            {
              "ax": -640,
              "az": 22.62,
              "bx": -628,
              "bz": 32.99
            },
            {
              "ax": -628,
              "az": 32.99,
              "bx": -616,
              "bz": 40.28
            },
            {
              "ax": -616,
              "az": 40.28,
              "bx": -604,
              "bz": 44.38
            },
            {
              "ax": -604,
              "az": 44.38,
              "bx": -592,
              "bz": 45.47
            },
            {
              "ax": -592,
              "az": 45.47,
              "bx": -580,
              "bz": 43.92
            },
            {
              "ax": -580,
              "az": 43.92,
              "bx": -568,
              "bz": 40.31
            },
            {
              "ax": -568,
              "az": 40.31,
              "bx": -556,
              "bz": 35.34
            },
            {
              "ax": -556,
              "az": 35.34,
              "bx": -544,
              "bz": 29.76
            },
            {
              "ax": -544,
              "az": 29.76,
              "bx": -532,
              "bz": 24.32
            },
            {
              "ax": -532,
              "az": 24.32,
              "bx": -520,
              "bz": 19.7
            },
            {
              "ax": -520,
              "az": 19.7,
              "bx": -508,
              "bz": 16.45
            },
            {
              "ax": -508,
              "az": 16.45,
              "bx": -496,
              "bz": 14.91
            },
            {
              "ax": -496,
              "az": 14.91,
              "bx": -484,
              "bz": 15.23
            },
            {
              "ax": -484,
              "az": 15.23,
              "bx": -472,
              "bz": 17.3
            },
            {
              "ax": -472,
              "az": 17.3,
              "bx": -460,
              "bz": 20.82
            },
            {
              "ax": -460,
              "az": 20.82,
              "bx": -448,
              "bz": 25.28
            },
            {
              "ax": -448,
              "az": 25.28,
              "bx": -436,
              "bz": 30.05
            },
            {
              "ax": -436,
              "az": 30.05,
              "bx": -424,
              "bz": 34.38
            },
            {
              "ax": -424,
              "az": 34.38,
              "bx": -412,
              "bz": 37.53
            },
            {
              "ax": -412,
              "az": 37.53,
              "bx": -400,
              "bz": 38.8
            },
            {
              "ax": -400,
              "az": 38.8,
              "bx": -388,
              "bz": 37.61
            },
            {
              "ax": -388,
              "az": 37.61,
              "bx": -376,
              "bz": 33.57
            },
            {
              "ax": -376,
              "az": 33.57,
              "bx": -364,
              "bz": 26.49
            },
            {
              "ax": -364,
              "az": 26.49,
              "bx": -352,
              "bz": 16.44
            },
            {
              "ax": -352,
              "az": 16.44,
              "bx": -340,
              "bz": 3.73
            },
            {
              "ax": -340,
              "az": 3.73,
              "bx": -328,
              "bz": -11.11
            },
            {
              "ax": -328,
              "az": -11.11,
              "bx": -316,
              "bz": -27.32
            },
            {
              "ax": -316,
              "az": -27.32,
              "bx": -304,
              "bz": -44.02
            },
            {
              "ax": -304,
              "az": -44.02,
              "bx": -292,
              "bz": -60.26
            },
            {
              "ax": -292,
              "az": -60.26,
              "bx": -280,
              "bz": -75.06
            },
            {
              "ax": -280,
              "az": -75.06,
              "bx": -268,
              "bz": -87.54
            },
            {
              "ax": -268,
              "az": -87.54,
              "bx": -256,
              "bz": -96.93
            },
            {
              "ax": -256,
              "az": -96.93,
              "bx": -244,
              "bz": -102.68
            },
            {
              "ax": -244,
              "az": -102.68,
              "bx": -232,
              "bz": -104.46
            },
            {
              "ax": -232,
              "az": -104.46,
              "bx": -220,
              "bz": -102.21
            },
            {
              "ax": -220,
              "az": -102.21,
              "bx": -208,
              "bz": -96.14
            },
            {
              "ax": -208,
              "az": -96.14,
              "bx": -196,
              "bz": -86.72
            },
            {
              "ax": -196,
              "az": -86.72,
              "bx": -184,
              "bz": -74.62
            },
            {
              "ax": -184,
              "az": -74.62,
              "bx": -172,
              "bz": -60.65
            },
            {
              "ax": -172,
              "az": -60.65,
              "bx": -160,
              "bz": -45.75
            },
            {
              "ax": -160,
              "az": -45.75,
              "bx": -148,
              "bz": -30.84
            },
            {
              "ax": -148,
              "az": -30.84,
              "bx": -136,
              "bz": -16.81
            },
            {
              "ax": -136,
              "az": -16.81,
              "bx": -124,
              "bz": -4.41
            },
            {
              "ax": -124,
              "az": -4.41,
              "bx": -112,
              "bz": 5.76
            },
            {
              "ax": -112,
              "az": 5.76,
              "bx": -100,
              "bz": 13.36
            },
            {
              "ax": -100,
              "az": 13.36,
              "bx": -88,
              "bz": 18.25
            },
            {
              "ax": -88,
              "az": 18.25,
              "bx": -76,
              "bz": 20.56
            },
            {
              "ax": -76,
              "az": 20.56,
              "bx": -64,
              "bz": 20.63
            },
            {
              "ax": -64,
              "az": 20.63,
              "bx": -52,
              "bz": 18.98
            },
            {
              "ax": -52,
              "az": 18.98,
              "bx": -40,
              "bz": 16.27
            },
            {
              "ax": -40,
              "az": 16.27,
              "bx": -28,
              "bz": 13.21
            },
            {
              "ax": -28,
              "az": 13.21,
              "bx": -16,
              "bz": 10.51
            },
            {
              "ax": -16,
              "az": 10.51,
              "bx": -4,
              "bz": 8.81
            },
            {
              "ax": -4,
              "az": 8.81,
              "bx": 8,
              "bz": 8.62
            },
            {
              "ax": 8,
              "az": 8.62,
              "bx": 20,
              "bz": 10.26
            },
            {
              "ax": 20,
              "az": 10.26,
              "bx": 32,
              "bz": 13.83
            },
            {
              "ax": 32,
              "az": 13.83,
              "bx": 44,
              "bz": 19.21
            },
            {
              "ax": 44,
              "az": 19.21,
              "bx": 56,
              "bz": 26.05
            },
            {
              "ax": 56,
              "az": 26.05,
              "bx": 68,
              "bz": 33.81
            },
            {
              "ax": 68,
              "az": 33.81,
              "bx": 80,
              "bz": 41.8
            },
            {
              "ax": 80,
              "az": 41.8,
              "bx": 92,
              "bz": 49.22
            },
            {
              "ax": 92,
              "az": 49.22,
              "bx": 104,
              "bz": 55.29
            },
            {
              "ax": 104,
              "az": 55.29,
              "bx": 116,
              "bz": 59.23
            },
            {
              "ax": 116,
              "az": 59.23,
              "bx": 128,
              "bz": 60.42
            },
            {
              "ax": 128,
              "az": 60.42,
              "bx": 140,
              "bz": 58.38
            },
            {
              "ax": 140,
              "az": 58.38,
              "bx": 152,
              "bz": 52.87
            },
            {
              "ax": 152,
              "az": 52.87,
              "bx": 164,
              "bz": 43.9
            },
            {
              "ax": 164,
              "az": 43.9,
              "bx": 176,
              "bz": 31.73
            },
            {
              "ax": 176,
              "az": 31.73,
              "bx": 188,
              "bz": 16.89
            },
            {
              "ax": 188,
              "az": 16.89,
              "bx": 200,
              "bz": 0.08
            },
            {
              "ax": 200,
              "az": 0.08,
              "bx": 212,
              "bz": -17.82
            },
            {
              "ax": 212,
              "az": -17.82,
              "bx": 224,
              "bz": -35.81
            },
            {
              "ax": 224,
              "az": -35.81,
              "bx": 236,
              "bz": -52.92
            },
            {
              "ax": 236,
              "az": -52.92,
              "bx": 248,
              "bz": -68.18
            },
            {
              "ax": 248,
              "az": -68.18,
              "bx": 260,
              "bz": -80.78
            },
            {
              "ax": 260,
              "az": -80.78,
              "bx": 272,
              "bz": -90.07
            },
            {
              "ax": 272,
              "az": -90.07,
              "bx": 284,
              "bz": -95.64
            },
            {
              "ax": 284,
              "az": -95.64,
              "bx": 296,
              "bz": -97.34
            },
            {
              "ax": 296,
              "az": -97.34,
              "bx": 308,
              "bz": -95.28
            },
            {
              "ax": 308,
              "az": -95.28,
              "bx": 320,
              "bz": -89.82
            },
            {
              "ax": 320,
              "az": -89.82,
              "bx": 332,
              "bz": -81.54
            },
            {
              "ax": 332,
              "az": -81.54,
              "bx": 344,
              "bz": -71.19
            },
            {
              "ax": 344,
              "az": -71.19,
              "bx": 356,
              "bz": -59.62
            },
            {
              "ax": 356,
              "az": -59.62,
              "bx": 368,
              "bz": -47.69
            },
            {
              "ax": 368,
              "az": -47.69,
              "bx": 380,
              "bz": -36.26
            },
            {
              "ax": 380,
              "az": -36.26,
              "bx": 392,
              "bz": -26.05
            },
            {
              "ax": 392,
              "az": -26.05,
              "bx": 404,
              "bz": -17.62
            },
            {
              "ax": 404,
              "az": -17.62,
              "bx": 416,
              "bz": -11.33
            },
            {
              "ax": 416,
              "az": -11.33,
              "bx": 428,
              "bz": -7.3
            },
            {
              "ax": 428,
              "az": -7.3,
              "bx": 440,
              "bz": -5.43
            },
            {
              "ax": 440,
              "az": -5.43,
              "bx": 452,
              "bz": -5.38
            },
            {
              "ax": 452,
              "az": -5.38,
              "bx": 464,
              "bz": -6.66
            },
            {
              "ax": 464,
              "az": -6.66,
              "bx": 476,
              "bz": -8.61
            },
            {
              "ax": 476,
              "az": -8.61,
              "bx": 488,
              "bz": -10.56
            },
            {
              "ax": 488,
              "az": -10.56,
              "bx": 500,
              "bz": -11.79
            },
            {
              "ax": 500,
              "az": -11.79,
              "bx": 512,
              "bz": -11.68
            },
            {
              "ax": 512,
              "az": -11.68,
              "bx": 524,
              "bz": -9.75
            },
            {
              "ax": 524,
              "az": -9.75,
              "bx": 536,
              "bz": -5.69
            },
            {
              "ax": 536,
              "az": -5.69,
              "bx": 548,
              "bz": 0.59
            },
            {
              "ax": 548,
              "az": 0.59,
              "bx": 560,
              "bz": 8.94
            },
            {
              "ax": 560,
              "az": 8.94,
              "bx": 572,
              "bz": 18.99
            },
            {
              "ax": 572,
              "az": 18.99,
              "bx": 584,
              "bz": 30.14
            },
            {
              "ax": 584,
              "az": 30.14,
              "bx": 596,
              "bz": 41.68
            },
            {
              "ax": 596,
              "az": 41.68,
              "bx": 608,
              "bz": 52.75
            },
            {
              "ax": 608,
              "az": 52.75,
              "bx": 620,
              "bz": 62.48
            },
            {
              "ax": 620,
              "az": 62.48,
              "bx": 640,
              "bz": 70.05
            }
          ],
          "surfaceY": -0.2
        }
      ],
      "roadCorridors": [
        {
          "blend": 5,
          "crossLevel": true,
          "id": "rv_m480_0_g",
          "points": [
            {
              "x": -480,
              "y": 0,
              "z": -580
            },
            {
              "x": -480,
              "y": 0,
              "z": -39.08
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "rv_m480_2_g",
          "points": [
            {
              "x": -480,
              "y": 0,
              "z": 70.92
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
          "id": "rv_m160_0_g",
          "points": [
            {
              "x": -160,
              "y": 0,
              "z": -580
            },
            {
              "x": -160,
              "y": 0,
              "z": -100.75
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "rv_m160_2_g",
          "points": [
            {
              "x": -160,
              "y": 0,
              "z": 9.25
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
          "id": "rv_160_0_g",
          "points": [
            {
              "x": 160,
              "y": 0,
              "z": -580
            },
            {
              "x": 160,
              "y": 0,
              "z": -8.11
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "rv_160_2_g",
          "points": [
            {
              "x": 160,
              "y": 0,
              "z": 101.89
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
          "id": "rv_480_0_g",
          "points": [
            {
              "x": 480,
              "y": 0,
              "z": -580
            },
            {
              "x": 480,
              "y": 0,
              "z": -64.26
            }
          ],
          "shoulder": 1,
          "width": 8
        },
        {
          "blend": 5,
          "crossLevel": true,
          "id": "rv_480_2_g",
          "points": [
            {
              "x": 480,
              "y": 0,
              "z": 45.74
            },
            {
              "x": 480,
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
          "id": "rh_m480_0_g",
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
          "id": "rh_m160_0_g",
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
          "id": "rh_480_0_g",
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
          "id": "rh_160_w0",
          "points": [
            {
              "x": -580,
              "y": 0,
              "z": 160
            },
            {
              "x": -225,
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
          "id": "rh_160_e0",
          "points": [
            {
              "x": 125,
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
        }
      ]
    },
    "spawn": {
      "x": -260,
      "z": 160
    },
    "stream": {
      "aheadMax": 900,
      "aheadMin": 200,
      "budgetMs": 120,
      "chunk": 256,
      "keep": 1,
      "overlap": 1.175
    },
    "units": "meters",
    "windows": {}
  },
  "name": "Глава 15. Река, горы и туннель (CityForge v3)",
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
LEVEL_15.map.skeleton = decodeSkeleton(await loadSkel());
