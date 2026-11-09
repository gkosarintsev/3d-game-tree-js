/**
 * СГЕНЕРИРОВАННО — руками не править.
 *
 * Источник правки: src/levels/level-11.json. После его изменения запуск
 * `node tools/build-level.mjs src/levels/level-11.json` перезаписывает этот файл
 * побайтово одинаково (ГПСЧ в парсере нет, ключи объектов отсортированы).
 *
 * Тип карты — `kind: 'json2'`: числа и топологию готовит Node-парсер
 * (замкнутые полигоны, союз прямоугольников footprint, абсолютные высоты
 * этажей, проступи лестниц, пластины настилов, автогенерированные опоры и
 * фонари, проёмы дверей), браузер строит из них только солиды, опоры,
 * навигацию и меш.
 *
 * Поворотные дома (`buildings[].rotation*) ставят корпус под углом к северу:
 * весь внутренний расчёт — стены, комнаты, шахты маршей и проёмы дверей —
 * идёт в его собственных осях, а в мировом плане его держит ориентированная
 * коробка (src/solids.js), потому что габарит решил бы твёрдость вокруг дома
 * и вокруг неё выросли бы невидимые башни.
 */
export const LEVEL_11 = {
  "name": "Глава 11. Развязка",
  "hint": "Маленький район со всеми элементами поворотного города: два косых дома, наклонные улицы, мост через реку и развязка — дорога поднимается по окружности на эстакаду и выходит на мост. Дойдите от точки A на восточной авеню до маяка на настиле моста.",
  "map": {
    "kind": "json2",
    "units": "meters",
    "ground": {
      "y": 0,
      "size": 200,
      "color": "#1a1d22"
    },
    "bounds": {
      "minX": -100.35,
      "maxX": 100,
      "minZ": -112.35,
      "maxZ": 112.35
    },
    "spawn": {
      "x": 20,
      "z": -84
    },
    "buildings": [
      {
        "id": "b_west",
        "name": "Западный дом",
        "isEnterable": true,
        "baseY": 0,
        "floorHeight": 3.6,
        "floorsCount": 2,
        "roofY": 7.2,
        "facadeMaterial": "painted_brick",
        "roof": {
          "walkable": true,
          "parapet": 0.9
        },
        "footprint": [
          {
            "x": -78,
            "z": 0
          },
          {
            "x": -62,
            "z": 0
          },
          {
            "x": -62,
            "z": 20
          },
          {
            "x": -78,
            "z": 20
          }
        ],
        "bounds": {
          "minX": -78,
          "maxX": -62,
          "minZ": 0,
          "maxZ": 20
        },
        "rects": [
          {
            "minX": -78,
            "maxX": -62,
            "minZ": 0,
            "maxZ": 20
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -62.175,
            "maxX": -61.825,
            "minZ": 0,
            "maxZ": 20,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -78.175,
            "maxX": -77.825,
            "minZ": 0,
            "maxZ": 20,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -78,
            "maxX": -62,
            "minZ": -0.175,
            "maxZ": 0.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -78,
            "maxX": -62,
            "minZ": 19.825,
            "maxZ": 20.175,
            "facade": true
          }
        ],
        "rooms": [
          {
            "id": "bw_r0",
            "type": "lobby",
            "floor": 0,
            "rect": {
              "minX": -78,
              "maxX": -62,
              "minZ": 0,
              "maxZ": 20
            },
            "y": 0
          },
          {
            "id": "bw_r1",
            "type": "room",
            "floor": 1,
            "rect": {
              "minX": -78,
              "maxX": -62,
              "minZ": 0,
              "maxZ": 20
            },
            "y": 3.6
          }
        ],
        "stairs": [
          {
            "id": "bw_roof",
            "type": "ladder",
            "connectsFloors": [
              1,
              2
            ],
            "y0": 3.6,
            "y1": 7.2,
            "height": 3.6,
            "rotation": 0,
            "rect": {
              "minX": -77.2,
              "maxX": -75.8,
              "minZ": 1.3,
              "maxZ": 2.7
            },
            "steps": [
              {
                "minX": -77.2,
                "maxX": -75.8,
                "minZ": 1.3,
                "maxZ": 2.7,
                "top": 4.114
              },
              {
                "minX": -77.2,
                "maxX": -75.8,
                "minZ": 1.3,
                "maxZ": 2.7,
                "top": 4.629
              },
              {
                "minX": -77.2,
                "maxX": -75.8,
                "minZ": 1.3,
                "maxZ": 2.7,
                "top": 5.143
              },
              {
                "minX": -77.2,
                "maxX": -75.8,
                "minZ": 1.3,
                "maxZ": 2.7,
                "top": 5.657
              },
              {
                "minX": -77.2,
                "maxX": -75.8,
                "minZ": 1.3,
                "maxZ": 2.7,
                "top": 6.171
              },
              {
                "minX": -77.2,
                "maxX": -75.8,
                "minZ": 1.3,
                "maxZ": 2.7,
                "top": 6.686
              }
            ],
            "bottom": {
              "x": -76.5,
              "z": 2,
              "y": 4.114
            },
            "top": {
              "x": -76.5,
              "z": 2,
              "y": 6.686
            }
          },
          {
            "id": "bw_s0",
            "type": "straight",
            "connectsFloors": [
              0,
              1
            ],
            "y0": 0,
            "y1": 3.6,
            "height": 3.6,
            "rotation": 0,
            "rect": {
              "minX": -77,
              "maxX": -71,
              "minZ": 10,
              "maxZ": 14
            },
            "steps": [
              {
                "minX": -77,
                "maxX": -76.143,
                "minZ": 10,
                "maxZ": 14,
                "top": 0.514
              },
              {
                "minX": -76.143,
                "maxX": -75.286,
                "minZ": 10,
                "maxZ": 14,
                "top": 1.029
              },
              {
                "minX": -75.286,
                "maxX": -74.429,
                "minZ": 10,
                "maxZ": 14,
                "top": 1.543
              },
              {
                "minX": -74.429,
                "maxX": -73.571,
                "minZ": 10,
                "maxZ": 14,
                "top": 2.057
              },
              {
                "minX": -73.571,
                "maxX": -72.714,
                "minZ": 10,
                "maxZ": 14,
                "top": 2.571
              },
              {
                "minX": -72.714,
                "maxX": -71.857,
                "minZ": 10,
                "maxZ": 14,
                "top": 3.086
              },
              {
                "minX": -71.857,
                "maxX": -71,
                "minZ": 10,
                "maxZ": 14,
                "top": 3.6
              }
            ],
            "bottom": {
              "x": -76.571,
              "z": 12,
              "y": 0.514
            },
            "top": {
              "x": -71.428,
              "z": 12,
              "y": 3.6
            }
          }
        ],
        "doors": [
          {
            "id": "bw_r0→rd_west_ave",
            "room": "bw_r0",
            "target": "rd_west_ave",
            "linkType": "main_entrance",
            "axis": "z",
            "y": 0,
            "height": 2.1,
            "rect": {
              "minX": -62.185,
              "maxX": -61.815,
              "minZ": 9.1,
              "maxZ": 10.9
            },
            "inside": {
              "x": -63.4,
              "z": 10
            },
            "outside": {
              "x": -60.6,
              "z": 10
            }
          },
          {
            "id": "bw_r1→sb_west",
            "room": "bw_r1",
            "target": "sb_west",
            "linkType": "door",
            "axis": "x",
            "y": 3.6,
            "height": 2.1,
            "rect": {
              "minX": -70.9,
              "maxX": -69.1,
              "minZ": 19.815,
              "maxZ": 20.185
            },
            "inside": {
              "x": -70,
              "z": 18.6
            },
            "outside": {
              "x": -70,
              "z": 21.4
            }
          }
        ]
      },
      {
        "id": "b_west_b",
        "name": "Дом у перехода",
        "isEnterable": true,
        "baseY": 0,
        "floorHeight": 3.6,
        "floorsCount": 2,
        "roofY": 7.2,
        "facadeMaterial": "stone_base",
        "roof": {
          "walkable": true,
          "parapet": 0.9
        },
        "footprint": [
          {
            "x": -78,
            "z": 28
          },
          {
            "x": -66,
            "z": 28
          },
          {
            "x": -66,
            "z": 43.5
          },
          {
            "x": -78,
            "z": 43.5
          }
        ],
        "bounds": {
          "minX": -78,
          "maxX": -66,
          "minZ": 28,
          "maxZ": 43.5
        },
        "rects": [
          {
            "minX": -78,
            "maxX": -66,
            "minZ": 28,
            "maxZ": 43.5
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -66.175,
            "maxX": -65.825,
            "minZ": 28,
            "maxZ": 43.5,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -78.175,
            "maxX": -77.825,
            "minZ": 28,
            "maxZ": 43.5,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -78,
            "maxX": -66,
            "minZ": 27.825,
            "maxZ": 28.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -78,
            "maxX": -66,
            "minZ": 43.325,
            "maxZ": 43.675,
            "facade": true
          }
        ],
        "rooms": [
          {
            "id": "bwb_r0",
            "type": "lobby",
            "floor": 0,
            "rect": {
              "minX": -78,
              "maxX": -66,
              "minZ": 28,
              "maxZ": 43.5
            },
            "y": 0
          },
          {
            "id": "bwb_r1",
            "type": "room",
            "floor": 1,
            "rect": {
              "minX": -78,
              "maxX": -66,
              "minZ": 28,
              "maxZ": 43.5
            },
            "y": 3.6
          }
        ],
        "stairs": [
          {
            "id": "bwb_roof",
            "type": "ladder",
            "connectsFloors": [
              1,
              2
            ],
            "y0": 3.6,
            "y1": 7.2,
            "height": 3.6,
            "rotation": 0,
            "rect": {
              "minX": -77.2,
              "maxX": -75.8,
              "minZ": 41.3,
              "maxZ": 42.699999999999996
            },
            "steps": [
              {
                "minX": -77.2,
                "maxX": -75.8,
                "minZ": 41.3,
                "maxZ": 42.7,
                "top": 4.114
              },
              {
                "minX": -77.2,
                "maxX": -75.8,
                "minZ": 41.3,
                "maxZ": 42.7,
                "top": 4.629
              },
              {
                "minX": -77.2,
                "maxX": -75.8,
                "minZ": 41.3,
                "maxZ": 42.7,
                "top": 5.143
              },
              {
                "minX": -77.2,
                "maxX": -75.8,
                "minZ": 41.3,
                "maxZ": 42.7,
                "top": 5.657
              },
              {
                "minX": -77.2,
                "maxX": -75.8,
                "minZ": 41.3,
                "maxZ": 42.7,
                "top": 6.171
              },
              {
                "minX": -77.2,
                "maxX": -75.8,
                "minZ": 41.3,
                "maxZ": 42.7,
                "top": 6.686
              }
            ],
            "bottom": {
              "x": -76.5,
              "z": 42,
              "y": 4.114
            },
            "top": {
              "x": -76.5,
              "z": 42,
              "y": 6.686
            }
          },
          {
            "id": "bwb_s0",
            "type": "spiral",
            "connectsFloors": [
              0,
              1
            ],
            "y0": 0,
            "y1": 3.6,
            "height": 3.6,
            "rotation": 0,
            "rect": {
              "minX": -75,
              "maxX": -69,
              "minZ": 29,
              "maxZ": 35
            },
            "steps": [
              {
                "minX": -71.452,
                "maxX": -69,
                "minZ": 32,
                "maxZ": 33.22,
                "top": 0.24
              },
              {
                "minX": -71.599,
                "maxX": -69.259,
                "minZ": 32.244,
                "maxZ": 34.229,
                "top": 0.48
              },
              {
                "minX": -71.815,
                "maxX": -69.993,
                "minZ": 32.446,
                "maxZ": 34.853,
                "top": 0.72
              },
              {
                "minX": -72.314,
                "maxX": -71.073,
                "minZ": 32.571,
                "maxZ": 34.984,
                "top": 0.96
              },
              {
                "minX": -73.5,
                "maxX": -72.063,
                "minZ": 32.52,
                "maxZ": 34.984,
                "top": 1.2
              },
              {
                "minX": -74.427,
                "maxX": -72.3,
                "minZ": 32.353,
                "maxZ": 34.598,
                "top": 1.44
              },
              {
                "minX": -74.934,
                "maxX": -72.485,
                "minZ": 32.125,
                "maxZ": 33.763,
                "top": 1.68
              },
              {
                "minX": -74.934,
                "maxX": -72.587,
                "minZ": 31.376,
                "maxZ": 32.624,
                "top": 1.92
              },
              {
                "minX": -74.934,
                "maxX": -72.485,
                "minZ": 30.237,
                "maxZ": 31.875,
                "top": 2.16
              },
              {
                "minX": -74.427,
                "maxX": -72.3,
                "minZ": 29.402,
                "maxZ": 31.647,
                "top": 2.4
              },
              {
                "minX": -73.5,
                "maxX": -72.063,
                "minZ": 29.016,
                "maxZ": 31.48,
                "top": 2.64
              },
              {
                "minX": -72.314,
                "maxX": -71.073,
                "minZ": 29.016,
                "maxZ": 31.429,
                "top": 2.88
              },
              {
                "minX": -71.815,
                "maxX": -69.993,
                "minZ": 29.147,
                "maxZ": 31.554,
                "top": 3.12
              },
              {
                "minX": -71.599,
                "maxX": -69.259,
                "minZ": 29.771,
                "maxZ": 31.756,
                "top": 3.36
              },
              {
                "minX": -71.452,
                "maxX": -69,
                "minZ": 30.78,
                "maxZ": 32,
                "top": 3.6
              }
            ],
            "bottom": {
              "x": -70.226,
              "z": 32.61,
              "y": 0.24
            },
            "top": {
              "x": -70.226,
              "z": 31.39,
              "y": 3.6
            }
          }
        ],
        "doors": [
          {
            "id": "bwb_r0→rd_west_ave",
            "room": "bwb_r0",
            "target": "rd_west_ave",
            "linkType": "main_entrance",
            "axis": "z",
            "y": 0,
            "height": 2.1,
            "rect": {
              "minX": -66.185,
              "maxX": -65.815,
              "minZ": 34.1,
              "maxZ": 35.9
            },
            "inside": {
              "x": -67.4,
              "z": 35
            },
            "outside": {
              "x": -64.6,
              "z": 35
            }
          },
          {
            "id": "bwb_r1→sb_west",
            "room": "bwb_r1",
            "target": "sb_west",
            "linkType": "door",
            "axis": "x",
            "y": 3.6,
            "height": 2.1,
            "rect": {
              "minX": -70.9,
              "maxX": -69.1,
              "minZ": 27.815,
              "maxZ": 28.185
            },
            "inside": {
              "x": -70,
              "z": 29.4
            },
            "outside": {
              "x": -70,
              "z": 26.6
            }
          }
        ]
      },
      {
        "id": "b_east",
        "name": "Восточный дом",
        "isEnterable": true,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "rusted_metal",
        "roof": {
          "walkable": true,
          "parapet": 0.9
        },
        "footprint": [
          {
            "x": 38,
            "z": -68
          },
          {
            "x": 56,
            "z": -68
          },
          {
            "x": 56,
            "z": -54
          },
          {
            "x": 38,
            "z": -54
          }
        ],
        "bounds": {
          "minX": 38,
          "maxX": 56,
          "minZ": -68,
          "maxZ": -54
        },
        "rects": [
          {
            "minX": 38,
            "maxX": 56,
            "minZ": -68,
            "maxZ": -54
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 37.825,
            "maxX": 38.175,
            "minZ": -68,
            "maxZ": -54,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 38,
            "maxX": 56,
            "minZ": -54.175,
            "maxZ": -53.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 38,
            "maxX": 56,
            "minZ": -68.175,
            "maxZ": -67.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 55.825,
            "maxX": 56.175,
            "minZ": -68,
            "maxZ": -54,
            "facade": true
          }
        ],
        "rooms": [
          {
            "id": "be_r0",
            "type": "lobby",
            "floor": 0,
            "rect": {
              "minX": 38,
              "maxX": 56,
              "minZ": -68,
              "maxZ": -54
            },
            "y": 0
          },
          {
            "id": "be_r1",
            "type": "office",
            "floor": 1,
            "rect": {
              "minX": 38,
              "maxX": 56,
              "minZ": -68,
              "maxZ": -54
            },
            "y": 3.2
          },
          {
            "id": "be_r2",
            "type": "warehouse",
            "floor": 2,
            "rect": {
              "minX": 38,
              "maxX": 56,
              "minZ": -68,
              "maxZ": -54
            },
            "y": 6.4
          }
        ],
        "stairs": [
          {
            "id": "be_roof",
            "type": "ladder",
            "connectsFloors": [
              2,
              3
            ],
            "y0": 6.4,
            "y1": 9.6,
            "height": 3.2,
            "rotation": 0,
            "rect": {
              "minX": 53.8,
              "maxX": 55.199999999999996,
              "minZ": -67.2,
              "maxZ": -65.8
            },
            "steps": [
              {
                "minX": 53.8,
                "maxX": 55.2,
                "minZ": -67.2,
                "maxZ": -65.8,
                "top": 6.933
              },
              {
                "minX": 53.8,
                "maxX": 55.2,
                "minZ": -67.2,
                "maxZ": -65.8,
                "top": 7.467
              },
              {
                "minX": 53.8,
                "maxX": 55.2,
                "minZ": -67.2,
                "maxZ": -65.8,
                "top": 8
              },
              {
                "minX": 53.8,
                "maxX": 55.2,
                "minZ": -67.2,
                "maxZ": -65.8,
                "top": 8.533
              },
              {
                "minX": 53.8,
                "maxX": 55.2,
                "minZ": -67.2,
                "maxZ": -65.8,
                "top": 9.067
              }
            ],
            "bottom": {
              "x": 54.5,
              "z": -66.5,
              "y": 6.933
            },
            "top": {
              "x": 54.5,
              "z": -66.5,
              "y": 9.067
            }
          },
          {
            "id": "be_s0",
            "type": "spiral",
            "connectsFloors": [
              0,
              1
            ],
            "y0": 0,
            "y1": 3.2,
            "height": 3.2,
            "rotation": 0,
            "rect": {
              "minX": 46,
              "maxX": 52,
              "minZ": -67,
              "maxZ": -61
            },
            "steps": [
              {
                "minX": 49.548,
                "maxX": 52,
                "minZ": -64,
                "maxZ": -62.78,
                "top": 0.213
              },
              {
                "minX": 49.401,
                "maxX": 51.741,
                "minZ": -63.756,
                "maxZ": -61.771,
                "top": 0.427
              },
              {
                "minX": 49.185,
                "maxX": 51.007,
                "minZ": -63.554,
                "maxZ": -61.147,
                "top": 0.64
              },
              {
                "minX": 48.686,
                "maxX": 49.927,
                "minZ": -63.429,
                "maxZ": -61.016,
                "top": 0.853
              },
              {
                "minX": 47.5,
                "maxX": 48.937,
                "minZ": -63.48,
                "maxZ": -61.016,
                "top": 1.067
              },
              {
                "minX": 46.573,
                "maxX": 48.7,
                "minZ": -63.647,
                "maxZ": -61.402,
                "top": 1.28
              },
              {
                "minX": 46.066,
                "maxX": 48.515,
                "minZ": -63.875,
                "maxZ": -62.237,
                "top": 1.493
              },
              {
                "minX": 46.066,
                "maxX": 48.413,
                "minZ": -64.624,
                "maxZ": -63.376,
                "top": 1.707
              },
              {
                "minX": 46.066,
                "maxX": 48.515,
                "minZ": -65.763,
                "maxZ": -64.125,
                "top": 1.92
              },
              {
                "minX": 46.573,
                "maxX": 48.7,
                "minZ": -66.598,
                "maxZ": -64.353,
                "top": 2.133
              },
              {
                "minX": 47.5,
                "maxX": 48.937,
                "minZ": -66.984,
                "maxZ": -64.52,
                "top": 2.347
              },
              {
                "minX": 48.686,
                "maxX": 49.927,
                "minZ": -66.984,
                "maxZ": -64.571,
                "top": 2.56
              },
              {
                "minX": 49.185,
                "maxX": 51.007,
                "minZ": -66.853,
                "maxZ": -64.446,
                "top": 2.773
              },
              {
                "minX": 49.401,
                "maxX": 51.741,
                "minZ": -66.229,
                "maxZ": -64.244,
                "top": 2.987
              },
              {
                "minX": 49.548,
                "maxX": 52,
                "minZ": -65.22,
                "maxZ": -64,
                "top": 3.2
              }
            ],
            "bottom": {
              "x": 50.774,
              "z": -63.39,
              "y": 0.213
            },
            "top": {
              "x": 50.774,
              "z": -64.61,
              "y": 3.2
            }
          },
          {
            "id": "be_s1",
            "type": "straight",
            "connectsFloors": [
              1,
              2
            ],
            "y0": 3.2,
            "y1": 6.4,
            "height": 3.2,
            "rotation": 0,
            "rect": {
              "minX": 39,
              "maxX": 45,
              "minZ": -67,
              "maxZ": -63
            },
            "steps": [
              {
                "minX": 39,
                "maxX": 40,
                "minZ": -67,
                "maxZ": -63,
                "top": 3.733
              },
              {
                "minX": 40,
                "maxX": 41,
                "minZ": -67,
                "maxZ": -63,
                "top": 4.267
              },
              {
                "minX": 41,
                "maxX": 42,
                "minZ": -67,
                "maxZ": -63,
                "top": 4.8
              },
              {
                "minX": 42,
                "maxX": 43,
                "minZ": -67,
                "maxZ": -63,
                "top": 5.333
              },
              {
                "minX": 43,
                "maxX": 44,
                "minZ": -67,
                "maxZ": -63,
                "top": 5.867
              },
              {
                "minX": 44,
                "maxX": 45,
                "minZ": -67,
                "maxZ": -63,
                "top": 6.4
              }
            ],
            "bottom": {
              "x": 39.5,
              "z": -65,
              "y": 3.733
            },
            "top": {
              "x": 44.5,
              "z": -65,
              "y": 6.4
            }
          }
        ],
        "doors": [
          {
            "id": "be_r0→rd_east_south",
            "room": "be_r0",
            "target": "rd_east_south",
            "linkType": "main_entrance",
            "axis": "x",
            "y": 0,
            "height": 2.1,
            "rect": {
              "minX": 46.1,
              "maxX": 47.9,
              "minZ": -68.185,
              "maxZ": -67.815
            },
            "inside": {
              "x": 47,
              "z": -66.6
            },
            "outside": {
              "x": 47,
              "z": -69.4
            }
          }
        ]
      },
      {
        "id": "house_yaw30",
        "name": "Косой дом 30°",
        "isEnterable": true,
        "baseY": 0,
        "floorHeight": 3.4,
        "floorsCount": 3,
        "roofY": 10.2,
        "facadeMaterial": "painted_brick",
        "roof": {
          "walkable": true,
          "parapet": 0.9
        },
        "footprint": [
          {
            "x": -97,
            "z": 72
          },
          {
            "x": -79,
            "z": 72
          },
          {
            "x": -79,
            "z": 84
          },
          {
            "x": -97,
            "z": 84
          }
        ],
        "bounds": {
          "minX": -97,
          "maxX": -79,
          "minZ": 72,
          "maxZ": 84
        },
        "rotation": 30,
        "rects": [
          {
            "minX": -97,
            "maxX": -79,
            "minZ": 72,
            "maxZ": 84
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -79.175,
            "maxX": -78.825,
            "minZ": 72,
            "maxZ": 84,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -97.175,
            "maxX": -96.825,
            "minZ": 72,
            "maxZ": 84,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -97,
            "maxX": -79,
            "minZ": 71.825,
            "maxZ": 72.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -97,
            "maxX": -79,
            "minZ": 83.825,
            "maxZ": 84.175,
            "facade": true
          }
        ],
        "rooms": [
          {
            "id": "hy_r0",
            "type": "lobby",
            "floor": 0,
            "rect": {
              "minX": -97,
              "maxX": -79,
              "minZ": 72,
              "maxZ": 84
            },
            "y": 0
          },
          {
            "id": "hy_r1",
            "type": "office",
            "floor": 1,
            "rect": {
              "minX": -97,
              "maxX": -79,
              "minZ": 72,
              "maxZ": 84
            },
            "y": 3.4
          },
          {
            "id": "hy_r2",
            "type": "warehouse",
            "floor": 2,
            "rect": {
              "minX": -97,
              "maxX": -79,
              "minZ": 72,
              "maxZ": 84
            },
            "y": 6.8
          }
        ],
        "stairs": [
          {
            "id": "hy_roof",
            "type": "ladder",
            "connectsFloors": [
              2,
              3
            ],
            "y0": 6.8,
            "y1": 10.2,
            "height": 3.4,
            "rotation": 0,
            "rect": {
              "minX": -96.2,
              "maxX": -94.8,
              "minZ": 81.8,
              "maxZ": 83.2
            },
            "steps": [
              {
                "minX": -96.2,
                "maxX": -94.8,
                "minZ": 81.8,
                "maxZ": 83.2,
                "top": 7.286
              },
              {
                "minX": -96.2,
                "maxX": -94.8,
                "minZ": 81.8,
                "maxZ": 83.2,
                "top": 7.771
              },
              {
                "minX": -96.2,
                "maxX": -94.8,
                "minZ": 81.8,
                "maxZ": 83.2,
                "top": 8.257
              },
              {
                "minX": -96.2,
                "maxX": -94.8,
                "minZ": 81.8,
                "maxZ": 83.2,
                "top": 8.743
              },
              {
                "minX": -96.2,
                "maxX": -94.8,
                "minZ": 81.8,
                "maxZ": 83.2,
                "top": 9.229
              },
              {
                "minX": -96.2,
                "maxX": -94.8,
                "minZ": 81.8,
                "maxZ": 83.2,
                "top": 9.714
              }
            ],
            "bottom": {
              "x": -95.5,
              "z": 82.5,
              "y": 7.286
            },
            "top": {
              "x": -95.5,
              "z": 82.5,
              "y": 9.714
            }
          },
          {
            "id": "hy_s0",
            "type": "spiral",
            "connectsFloors": [
              0,
              1
            ],
            "y0": 0,
            "y1": 3.4,
            "height": 3.4,
            "rotation": 0,
            "rect": {
              "minX": -86,
              "maxX": -80,
              "minZ": 77,
              "maxZ": 83
            },
            "steps": [
              {
                "minX": -82.452,
                "maxX": -80,
                "minZ": 80,
                "maxZ": 81.22,
                "top": 0.227
              },
              {
                "minX": -82.599,
                "maxX": -80.259,
                "minZ": 80.244,
                "maxZ": 82.229,
                "top": 0.453
              },
              {
                "minX": -82.815,
                "maxX": -80.993,
                "minZ": 80.446,
                "maxZ": 82.853,
                "top": 0.68
              },
              {
                "minX": -83.314,
                "maxX": -82.073,
                "minZ": 80.571,
                "maxZ": 82.984,
                "top": 0.907
              },
              {
                "minX": -84.5,
                "maxX": -83.063,
                "minZ": 80.52,
                "maxZ": 82.984,
                "top": 1.133
              },
              {
                "minX": -85.427,
                "maxX": -83.3,
                "minZ": 80.353,
                "maxZ": 82.598,
                "top": 1.36
              },
              {
                "minX": -85.934,
                "maxX": -83.485,
                "minZ": 80.125,
                "maxZ": 81.763,
                "top": 1.587
              },
              {
                "minX": -85.934,
                "maxX": -83.587,
                "minZ": 79.376,
                "maxZ": 80.624,
                "top": 1.813
              },
              {
                "minX": -85.934,
                "maxX": -83.485,
                "minZ": 78.237,
                "maxZ": 79.875,
                "top": 2.04
              },
              {
                "minX": -85.427,
                "maxX": -83.3,
                "minZ": 77.402,
                "maxZ": 79.647,
                "top": 2.267
              },
              {
                "minX": -84.5,
                "maxX": -83.063,
                "minZ": 77.016,
                "maxZ": 79.48,
                "top": 2.493
              },
              {
                "minX": -83.314,
                "maxX": -82.073,
                "minZ": 77.016,
                "maxZ": 79.429,
                "top": 2.72
              },
              {
                "minX": -82.815,
                "maxX": -80.993,
                "minZ": 77.147,
                "maxZ": 79.554,
                "top": 2.947
              },
              {
                "minX": -82.599,
                "maxX": -80.259,
                "minZ": 77.771,
                "maxZ": 79.756,
                "top": 3.173
              },
              {
                "minX": -82.452,
                "maxX": -80,
                "minZ": 78.78,
                "maxZ": 80,
                "top": 3.4
              }
            ],
            "bottom": {
              "x": -81.226,
              "z": 80.61,
              "y": 0.227
            },
            "top": {
              "x": -81.226,
              "z": 79.39,
              "y": 3.4
            }
          },
          {
            "id": "hy_s1",
            "type": "straight",
            "connectsFloors": [
              1,
              2
            ],
            "y0": 3.4,
            "y1": 6.8,
            "height": 3.4,
            "rotation": 0,
            "rect": {
              "minX": -93,
              "maxX": -87,
              "minZ": 74,
              "maxZ": 78
            },
            "steps": [
              {
                "minX": -93,
                "maxX": -92.143,
                "minZ": 74,
                "maxZ": 78,
                "top": 3.886
              },
              {
                "minX": -92.143,
                "maxX": -91.286,
                "minZ": 74,
                "maxZ": 78,
                "top": 4.371
              },
              {
                "minX": -91.286,
                "maxX": -90.429,
                "minZ": 74,
                "maxZ": 78,
                "top": 4.857
              },
              {
                "minX": -90.429,
                "maxX": -89.571,
                "minZ": 74,
                "maxZ": 78,
                "top": 5.343
              },
              {
                "minX": -89.571,
                "maxX": -88.714,
                "minZ": 74,
                "maxZ": 78,
                "top": 5.829
              },
              {
                "minX": -88.714,
                "maxX": -87.857,
                "minZ": 74,
                "maxZ": 78,
                "top": 6.314
              },
              {
                "minX": -87.857,
                "maxX": -87,
                "minZ": 74,
                "maxZ": 78,
                "top": 6.8
              }
            ],
            "bottom": {
              "x": -92.571,
              "z": 76,
              "y": 3.886
            },
            "top": {
              "x": -87.428,
              "z": 76,
              "y": 6.8
            }
          }
        ],
        "doors": [
          {
            "id": "hy_r0→rd_west_stub",
            "room": "hy_r0",
            "target": "rd_west_stub",
            "linkType": "main_entrance",
            "axis": "x",
            "y": 0,
            "height": 2.1,
            "rect": {
              "minX": -92.9,
              "maxX": -91.1,
              "minZ": 71.815,
              "maxZ": 72.185
            },
            "inside": {
              "x": -89.164,
              "z": 72.016
            },
            "outside": {
              "x": -87.764,
              "z": 69.591
            }
          }
        ]
      },
      {
        "id": "house_yaw225",
        "name": "Косой дом 22,5°",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.4,
        "floorsCount": 3,
        "roofY": 10.2,
        "facadeMaterial": "neon_panel",
        "footprint": [
          {
            "x": 60,
            "z": -63.5
          },
          {
            "x": 76,
            "z": -63.5
          },
          {
            "x": 76,
            "z": -53.5
          },
          {
            "x": 60,
            "z": -53.5
          }
        ],
        "bounds": {
          "minX": 60,
          "maxX": 76,
          "minZ": -63.5,
          "maxZ": -53.5
        },
        "rotation": 22.5,
        "rects": [
          {
            "minX": 60,
            "maxX": 76,
            "minZ": -63.5,
            "maxZ": -53.5
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 59.825,
            "maxX": 60.175,
            "minZ": -63.5,
            "maxZ": -53.5,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 60,
            "maxX": 76,
            "minZ": -53.675,
            "maxZ": -53.325,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 60,
            "maxX": 76,
            "minZ": -63.675,
            "maxZ": -63.325,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 75.825,
            "maxX": 76.175,
            "minZ": -63.5,
            "maxZ": -53.5,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "podium",
        "name": "Подиум башни",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3,
        "floorsCount": 3,
        "roofY": 9,
        "facadeMaterial": "concrete",
        "roof": {
          "walkable": true,
          "parapet": 0.9
        },
        "footprint": [
          {
            "x": 52,
            "z": 68
          },
          {
            "x": 76,
            "z": 68
          },
          {
            "x": 76,
            "z": 92
          },
          {
            "x": 52,
            "z": 92
          }
        ],
        "bounds": {
          "minX": 52,
          "maxX": 76,
          "minZ": 68,
          "maxZ": 92
        },
        "rects": [
          {
            "minX": 52,
            "maxX": 76,
            "minZ": 68,
            "maxZ": 92
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 51.825,
            "maxX": 52.175,
            "minZ": 68,
            "maxZ": 92,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 52,
            "maxX": 76,
            "minZ": 67.825,
            "maxZ": 68.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 52,
            "maxX": 76,
            "minZ": 91.825,
            "maxZ": 92.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 75.825,
            "maxX": 76.175,
            "minZ": 68,
            "maxZ": 92,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "tower",
        "name": "Башня на подиуме",
        "isEnterable": false,
        "baseY": 9,
        "foundationBottomY": 0,
        "floorHeight": 3,
        "floorsCount": 8,
        "roofY": 33,
        "facadeMaterial": "neon_panel",
        "roof": {
          "walkable": true,
          "parapet": 1
        },
        "footprint": [
          {
            "x": 58,
            "z": 74
          },
          {
            "x": 72,
            "z": 74
          },
          {
            "x": 72,
            "z": 86
          },
          {
            "x": 58,
            "z": 86
          }
        ],
        "bounds": {
          "minX": 58,
          "maxX": 72,
          "minZ": 74,
          "maxZ": 86
        },
        "rects": [
          {
            "minX": 58,
            "maxX": 72,
            "minZ": 74,
            "maxZ": 86
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 57.825,
            "maxX": 58.175,
            "minZ": 74,
            "maxZ": 86,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 58,
            "maxX": 72,
            "minZ": 73.825,
            "maxZ": 74.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 58,
            "maxX": 72,
            "minZ": 85.825,
            "maxZ": 86.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 71.825,
            "maxX": 72.175,
            "minZ": 74,
            "maxZ": 86,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_west_shop",
        "name": "Западная лавка",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "stone_base",
        "footprint": [
          {
            "x": -92,
            "z": -48
          },
          {
            "x": -76,
            "z": -48
          },
          {
            "x": -76,
            "z": -36
          },
          {
            "x": -92,
            "z": -36
          }
        ],
        "bounds": {
          "minX": -92,
          "maxX": -76,
          "minZ": -48,
          "maxZ": -36
        },
        "rects": [
          {
            "minX": -92,
            "maxX": -76,
            "minZ": -48,
            "maxZ": -36
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -76.175,
            "maxX": -75.825,
            "minZ": -48,
            "maxZ": -36,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -92.175,
            "maxX": -91.825,
            "minZ": -48,
            "maxZ": -36,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -92,
            "maxX": -76,
            "minZ": -36.175,
            "maxZ": -35.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -92,
            "maxX": -76,
            "minZ": -48.175,
            "maxZ": -47.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_east_shop",
        "name": "Восточный склад",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "rusted_metal",
        "footprint": [
          {
            "x": 60,
            "z": -98
          },
          {
            "x": 76,
            "z": -98
          },
          {
            "x": 76,
            "z": -86
          },
          {
            "x": 60,
            "z": -86
          }
        ],
        "bounds": {
          "minX": 60,
          "maxX": 76,
          "minZ": -98,
          "maxZ": -86
        },
        "rects": [
          {
            "minX": 60,
            "maxX": 76,
            "minZ": -98,
            "maxZ": -86
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 59.825,
            "maxX": 60.175,
            "minZ": -98,
            "maxZ": -86,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 60,
            "maxX": 76,
            "minZ": -86.175,
            "maxZ": -85.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 60,
            "maxX": 76,
            "minZ": -98.175,
            "maxZ": -97.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 75.825,
            "maxX": 76.175,
            "minZ": -98,
            "maxZ": -86,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      }
    ],
    "roads": [
      {
        "id": "rd_interchange",
        "type": "bridge",
        "width": 8,
        "withLamps": true,
        "decks": [
          {
            "minX": 22.501,
            "maxX": 94,
            "minZ": -22,
            "maxZ": 66,
            "arc": true,
            "cx": 50,
            "cz": 22,
            "R": 40,
            "halfW": 4,
            "a0": -128.68,
            "a1": 90,
            "span": 218.68,
            "y0": 0.12,
            "y1": 12,
            "tanBank": 0.105,
            "bankTrans": 12.144,
            "width": 8,
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 12,
            "ramp": true,
            "rails": true
          },
          {
            "minX": -44,
            "maxX": 50,
            "minZ": 58,
            "maxZ": 66,
            "obb": {
              "cx": 3,
              "cz": 62,
              "hx": 47,
              "hz": 4,
              "c": -1,
              "s": -1.2246467991473532e-16
            },
            "cx": 3,
            "cz": 62,
            "yaw": -180,
            "length": 94,
            "width": 8,
            "axis": "x",
            "topY": 12,
            "bottomY": 11.4,
            "topAtMin": 12,
            "topAtMax": 12,
            "ramp": false,
            "rails": true
          },
          {
            "minX": -84,
            "maxX": -44,
            "minZ": 58,
            "maxZ": 66,
            "obb": {
              "cx": -64,
              "cz": 62,
              "hx": 20,
              "hz": 4,
              "c": -1,
              "s": -1.2246467991473532e-16
            },
            "cx": -64,
            "cz": 62,
            "yaw": -180,
            "length": 40,
            "width": 8,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 12,
            "topAtMax": 0.12,
            "ramp": true,
            "rails": true
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [
          {
            "id": "pillar_rd_interchange_40.447_-19.72",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 12.896899219112953,
            "position": {
              "x": 40.447,
              "y": 0,
              "z": -19.72
            },
            "scale": {
              "x": 1.6,
              "y": 1.215,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_52.784_-15.096",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -4.291834634811735,
            "position": {
              "x": 52.784,
              "y": 0,
              "z": -15.096
            },
            "scale": {
              "x": 1.6,
              "y": 1.56,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_53.203_-20.68",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -4.291834634811735,
            "position": {
              "x": 53.203,
              "y": 0,
              "z": -20.68
            },
            "scale": {
              "x": 1.6,
              "y": 2.148,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_63.622_-12.616",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -21.480568488736438,
            "position": {
              "x": 63.622,
              "y": 0,
              "z": -12.616
            },
            "scale": {
              "x": 1.6,
              "y": 2.494,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_65.673_-17.827",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -21.480568488736438,
            "position": {
              "x": 65.673,
              "y": 0,
              "z": -17.827
            },
            "scale": {
              "x": 1.6,
              "y": 3.082,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_73.243_-7.044",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -38.66930234266113,
            "position": {
              "x": 73.243,
              "y": 0,
              "z": -7.044
            },
            "scale": {
              "x": 1.6,
              "y": 3.428,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_76.742_-11.417",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -38.66930234266113,
            "position": {
              "x": 76.742,
              "y": 0,
              "z": -11.417
            },
            "scale": {
              "x": 1.6,
              "y": 4.016,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_80.789_1.122",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -55.85803619658583,
            "position": {
              "x": 80.789,
              "y": 0,
              "z": 1.122
            },
            "scale": {
              "x": 1.6,
              "y": 4.362,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_85.423_-2.021",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -55.85803619658583,
            "position": {
              "x": 85.423,
              "y": 0,
              "z": -2.021
            },
            "scale": {
              "x": 1.6,
              "y": 4.95,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_85.583_11.153",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -73.04677005051053,
            "position": {
              "x": 85.583,
              "y": 0,
              "z": 11.153
            },
            "scale": {
              "x": 1.6,
              "y": 5.296,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_90.94_9.52",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -73.04677005051053,
            "position": {
              "x": 90.94,
              "y": 0,
              "z": 9.52
            },
            "scale": {
              "x": 1.6,
              "y": 5.884,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_87.2_22.153",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90.23550390443522,
            "position": {
              "x": 87.2,
              "y": 0,
              "z": 22.153
            },
            "scale": {
              "x": 1.6,
              "y": 6.229,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_92.8_22.176",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90.23550390443522,
            "position": {
              "x": 92.8,
              "y": 0,
              "z": 22.176
            },
            "scale": {
              "x": 1.6,
              "y": 6.817,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_85.493_33.139",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -107.42423775835992,
            "position": {
              "x": 85.493,
              "y": 0,
              "z": 33.139
            },
            "scale": {
              "x": 1.6,
              "y": 7.163,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_90.836_34.816",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -107.42423775835992,
            "position": {
              "x": 90.836,
              "y": 0,
              "z": 34.816
            },
            "scale": {
              "x": 1.6,
              "y": 7.751,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_80.616_43.131",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -124.61297161228464,
            "position": {
              "x": 80.616,
              "y": 0,
              "z": 43.131
            },
            "scale": {
              "x": 1.6,
              "y": 8.097,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_85.225_46.312",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -124.61297161228464,
            "position": {
              "x": 85.225,
              "y": 0,
              "z": 46.312
            },
            "scale": {
              "x": 1.6,
              "y": 8.685,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_73.004_51.235",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -141.80170546620928,
            "position": {
              "x": 73.004,
              "y": 0,
              "z": 51.235
            },
            "scale": {
              "x": 1.6,
              "y": 9.031,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_76.467_55.635",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -141.80170546620928,
            "position": {
              "x": 76.467,
              "y": 0,
              "z": 55.635
            },
            "scale": {
              "x": 1.6,
              "y": 9.619,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_63.337_56.727",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -158.99043932013402,
            "position": {
              "x": 63.337,
              "y": 0,
              "z": 56.727
            },
            "scale": {
              "x": 1.6,
              "y": 9.965,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_65.345_61.955",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -158.99043932013402,
            "position": {
              "x": 65.345,
              "y": 0,
              "z": 61.955
            },
            "scale": {
              "x": 1.6,
              "y": 10.553,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_52.479_59.117",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -176.17917317405872,
            "position": {
              "x": 52.479,
              "y": 0,
              "z": 59.117
            },
            "scale": {
              "x": 1.6,
              "y": 11.126,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_52.852_64.705",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -176.17917317405872,
            "position": {
              "x": 52.852,
              "y": 0,
              "z": 64.705
            },
            "scale": {
              "x": 1.6,
              "y": 11.259,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_44_64.8",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 180,
            "position": {
              "x": 44,
              "y": 0,
              "z": 64.8
            },
            "scale": {
              "x": 1.6,
              "y": 11.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_44_59.2",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 180,
            "position": {
              "x": 44,
              "y": 0,
              "z": 59.2
            },
            "scale": {
              "x": 1.6,
              "y": 11.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_32_64.8",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 180,
            "position": {
              "x": 32,
              "y": 0,
              "z": 64.8
            },
            "scale": {
              "x": 1.6,
              "y": 11.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_32_59.2",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 180,
            "position": {
              "x": 32,
              "y": 0,
              "z": 59.2
            },
            "scale": {
              "x": 1.6,
              "y": 11.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_20_64.8",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 180,
            "position": {
              "x": 20,
              "y": 0,
              "z": 64.8
            },
            "scale": {
              "x": 1.6,
              "y": 11.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_20_59.2",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 180,
            "position": {
              "x": 20,
              "y": 0,
              "z": 59.2
            },
            "scale": {
              "x": 1.6,
              "y": 11.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_8_64.8",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 180,
            "position": {
              "x": 8,
              "y": -3,
              "z": 64.8
            },
            "scale": {
              "x": 1.6,
              "y": 14.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_8_59.2",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 180,
            "position": {
              "x": 8,
              "y": -3,
              "z": 59.2
            },
            "scale": {
              "x": 1.6,
              "y": 14.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_-4_64.8",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 180,
            "position": {
              "x": -4,
              "y": -3,
              "z": 64.8
            },
            "scale": {
              "x": 1.6,
              "y": 14.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_-4_59.2",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 180,
            "position": {
              "x": -4,
              "y": -3,
              "z": 59.2
            },
            "scale": {
              "x": 1.6,
              "y": 14.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_-16_64.8",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 180,
            "position": {
              "x": -16,
              "y": 0,
              "z": 64.8
            },
            "scale": {
              "x": 1.6,
              "y": 11.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_-16_59.2",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 180,
            "position": {
              "x": -16,
              "y": 0,
              "z": 59.2
            },
            "scale": {
              "x": 1.6,
              "y": 11.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_-28_64.8",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 180,
            "position": {
              "x": -28,
              "y": 0,
              "z": 64.8
            },
            "scale": {
              "x": 1.6,
              "y": 11.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_-28_59.2",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 180,
            "position": {
              "x": -28,
              "y": 0,
              "z": 59.2
            },
            "scale": {
              "x": 1.6,
              "y": 11.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_-40_64.8",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 180,
            "position": {
              "x": -40,
              "y": 0,
              "z": 64.8
            },
            "scale": {
              "x": 1.6,
              "y": 11.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_-40_59.2",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 180,
            "position": {
              "x": -40,
              "y": 0,
              "z": 59.2
            },
            "scale": {
              "x": 1.6,
              "y": 11.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_-62_64.8",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 180,
            "position": {
              "x": -62,
              "y": 0,
              "z": 64.8
            },
            "scale": {
              "x": 1.6,
              "y": 6.054,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_-62_59.2",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 180,
            "position": {
              "x": -62,
              "y": 0,
              "z": 59.2
            },
            "scale": {
              "x": 1.6,
              "y": 6.054,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_-74_64.8",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 180,
            "position": {
              "x": -74,
              "y": 0,
              "z": 64.8
            },
            "scale": {
              "x": 1.6,
              "y": 2.49,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_interchange_-74_59.2",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 180,
            "position": {
              "x": -74,
              "y": 0,
              "z": 59.2
            },
            "scale": {
              "x": 1.6,
              "y": 2.49,
              "z": 1.6
            }
          }
        ],
        "lamps": [
          {
            "id": "lamp_rd_interchange_40_67.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 40,
              "y": 12,
              "z": 67.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_interchange_40_56.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 40,
              "y": 12,
              "z": 56.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_interchange_20_67.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 20,
              "y": 12,
              "z": 67.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_interchange_20_56.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 20,
              "y": 12,
              "z": 56.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_interchange_0_67.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 0,
              "y": 12,
              "z": 67.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_interchange_0_56.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 0,
              "y": 12,
              "z": 56.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_interchange_-20_67.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -20,
              "y": 12,
              "z": 67.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_interchange_-20_56.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -20,
              "y": 12,
              "z": 56.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_interchange_-40_67.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -40,
              "y": 12,
              "z": 67.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_interchange_-40_56.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -40,
              "y": 12,
              "z": 56.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          }
        ]
      },
      {
        "id": "rd_east_ave",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": 15,
            "maxX": 25,
            "minZ": -96,
            "maxZ": -8,
            "axis": "z",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_rd_east_ave_13.6_-86",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": 13.6,
              "y": 0.12,
              "z": -86
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_east_ave_26.4_-86",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 26.4,
              "y": 0.12,
              "z": -86
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_east_ave_13.6_-66",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": 13.6,
              "y": 0.12,
              "z": -66
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_east_ave_26.4_-66",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 26.4,
              "y": 0.12,
              "z": -66
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_east_ave_13.6_-46",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": 13.6,
              "y": 0.12,
              "z": -46
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_east_ave_26.4_-46",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 26.4,
              "y": 0.12,
              "z": -46
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_east_ave_13.6_-26",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": 13.6,
              "y": 0.12,
              "z": -26
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_east_ave_26.4_-26",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 26.4,
              "y": 0.12,
              "z": -26
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          }
        ]
      },
      {
        "id": "rd_east_south",
        "type": "ground",
        "width": 9,
        "withLamps": true,
        "decks": [
          {
            "minX": 25,
            "maxX": 97,
            "minZ": -80.5,
            "maxZ": -71.5,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_rd_east_south_35_-81.9",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 35,
              "y": 0.12,
              "z": -81.9
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_east_south_35_-70.1",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 35,
              "y": 0.12,
              "z": -70.1
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_east_south_55_-81.9",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 55,
              "y": 0.12,
              "z": -81.9
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_east_south_55_-70.1",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 55,
              "y": 0.12,
              "z": -70.1
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_east_south_75_-81.9",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 75,
              "y": 0.12,
              "z": -81.9
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_east_south_75_-70.1",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 75,
              "y": 0.12,
              "z": -70.1
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_east_south_95_-81.9",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 95,
              "y": 0.12,
              "z": -81.9
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_east_south_95_-70.1",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 95,
              "y": 0.12,
              "z": -70.1
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          }
        ]
      },
      {
        "id": "rd_east_north",
        "type": "ground",
        "width": 9,
        "withLamps": true,
        "decks": [
          {
            "minX": 25,
            "maxX": 62,
            "minZ": 45.5,
            "maxZ": 54.5,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_rd_east_north_35_44.1",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 35,
              "y": 0.12,
              "z": 44.1
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_east_north_35_55.9",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 35,
              "y": 0.12,
              "z": 55.9
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_east_north_55_44.1",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 55,
              "y": 0.12,
              "z": 44.1
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_east_north_55_55.9",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 55,
              "y": 0.12,
              "z": 55.9
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          }
        ]
      },
      {
        "id": "rd_north_ave",
        "type": "ground",
        "width": 9,
        "withLamps": false,
        "decks": [
          {
            "minX": 21.5,
            "maxX": 30.5,
            "minZ": 54.5,
            "maxZ": 74,
            "axis": "z",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "rd_west_ave",
        "type": "ground",
        "width": 9,
        "withLamps": true,
        "decks": [
          {
            "minX": -54.5,
            "maxX": -45.5,
            "minZ": -74,
            "maxZ": 91,
            "axis": "z",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_rd_west_ave_-55.9_-64",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -55.9,
              "y": 0.12,
              "z": -64
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_west_ave_-44.1_-64",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -44.1,
              "y": 0.12,
              "z": -64
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_west_ave_-55.9_-44",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -55.9,
              "y": 0.12,
              "z": -44
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_west_ave_-44.1_-44",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -44.1,
              "y": 0.12,
              "z": -44
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_west_ave_-55.9_-24",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -55.9,
              "y": 0.12,
              "z": -24
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_west_ave_-44.1_-24",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -44.1,
              "y": 0.12,
              "z": -24
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_west_ave_-55.9_-4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -55.9,
              "y": 0.12,
              "z": -4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_west_ave_-44.1_-4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -44.1,
              "y": 0.12,
              "z": -4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_west_ave_-55.9_16",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -55.9,
              "y": 0.12,
              "z": 16
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_west_ave_-44.1_16",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -44.1,
              "y": 0.12,
              "z": 16
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_west_ave_-55.9_36",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -55.9,
              "y": 0.12,
              "z": 36
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_west_ave_-44.1_36",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -44.1,
              "y": 0.12,
              "z": 36
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_west_ave_-55.9_56",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -55.9,
              "y": 0.12,
              "z": 56
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_west_ave_-44.1_56",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -44.1,
              "y": 0.12,
              "z": 56
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_west_ave_-55.9_76",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -55.9,
              "y": 0.12,
              "z": 76
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_west_ave_-44.1_76",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -44.1,
              "y": 0.12,
              "z": 76
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          }
        ]
      },
      {
        "id": "rd_west_cross_s",
        "type": "ground",
        "width": 9,
        "withLamps": true,
        "decks": [
          {
            "minX": -97,
            "maxX": -54.5,
            "minZ": -60.5,
            "maxZ": -51.5,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_rd_west_cross_s_-87_-61.9",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -87,
              "y": 0.12,
              "z": -61.9
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_west_cross_s_-87_-50.1",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -87,
              "y": 0.12,
              "z": -50.1
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_west_cross_s_-67_-61.9",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -67,
              "y": 0.12,
              "z": -61.9
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_west_cross_s_-67_-50.1",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -67,
              "y": 0.12,
              "z": -50.1
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          }
        ]
      },
      {
        "id": "rd_west_cross_n",
        "type": "ground",
        "width": 9,
        "withLamps": true,
        "decks": [
          {
            "minX": -97,
            "maxX": -54.5,
            "minZ": 45.5,
            "maxZ": 54.5,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_rd_west_cross_n_-87_44.1",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -87,
              "y": 0.12,
              "z": 44.1
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_west_cross_n_-87_55.9",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -87,
              "y": 0.12,
              "z": 55.9
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_west_cross_n_-67_44.1",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -67,
              "y": 0.12,
              "z": 44.1
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_west_cross_n_-67_55.9",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -67,
              "y": 0.12,
              "z": 55.9
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          }
        ]
      },
      {
        "id": "rd_west_stub",
        "type": "ground",
        "width": 8,
        "withLamps": false,
        "decks": [
          {
            "minX": -99,
            "maxX": -84,
            "minZ": 58,
            "maxZ": 66,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "rd_yaw225",
        "type": "ground",
        "width": 8,
        "withLamps": true,
        "decks": [
          {
            "minX": 56.459,
            "maxX": 83.541,
            "minZ": -78.67,
            "maxZ": -61.33,
            "obb": {
              "cx": 70,
              "cz": -70,
              "hx": 13,
              "hz": 4,
              "c": 0.9238795325112867,
              "s": 0.3826834323650898
            },
            "cx": 70,
            "cz": -70,
            "yaw": 22.5,
            "length": 26,
            "width": 8,
            "axis": "x",
            "topY": 0.14,
            "bottomY": -0.46,
            "topAtMin": 0.14,
            "topAtMax": 0.14,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_rd_yaw225_69.295_-76.137",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -22.5,
            "position": {
              "x": 69.295,
              "y": 0.14,
              "z": -76.137
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_yaw225_65.162_-66.159",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 157.5,
            "position": {
              "x": 65.162,
              "y": 0.14,
              "z": -66.159
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          }
        ]
      },
      {
        "id": "rd_yaw30",
        "type": "ground",
        "width": 8,
        "withLamps": true,
        "decks": [
          {
            "minX": -77.856,
            "maxX": -46.144,
            "minZ": 76.536,
            "maxZ": 99.464,
            "obb": {
              "cx": -62,
              "cz": 88,
              "hx": 16,
              "hz": 4,
              "c": 0.8660254037844387,
              "s": 0.49999999999999994
            },
            "cx": -62,
            "cz": 88,
            "yaw": 30,
            "length": 32,
            "width": 8,
            "axis": "x",
            "topY": 0.14,
            "bottomY": -0.46,
            "topAtMin": 0.14,
            "topAtMax": 0.14,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_rd_yaw30_-64.496_80.323",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -30,
            "position": {
              "x": -64.496,
              "y": 0.14,
              "z": 80.323
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_yaw30_-69.896_89.677",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 150,
            "position": {
              "x": -69.896,
              "y": 0.14,
              "z": 89.677
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_yaw30_-47.176_90.323",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -30,
            "position": {
              "x": -47.176,
              "y": 0.14,
              "z": 90.323
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_yaw30_-52.576_99.677",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 150,
            "position": {
              "x": -52.576,
              "y": 0.14,
              "z": 99.677
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          }
        ]
      },
      {
        "id": "sb_west",
        "type": "skybridge",
        "width": 3.4,
        "withLamps": false,
        "decks": [
          {
            "minX": -71.7,
            "maxX": -68.3,
            "minZ": 20,
            "maxZ": 28,
            "axis": "z",
            "topY": 3.6,
            "bottomY": 3,
            "topAtMin": 3.6,
            "topAtMax": 3.6,
            "ramp": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      }
    ],
    "channels": [
      {
        "id": "river",
        "bank": "quay",
        "wade": false,
        "width": 24,
        "bedY": -3,
        "surfaceY": -0.5,
        "segments": [
          {
            "axis": "z",
            "cross": 0,
            "halfW": 12,
            "run": 0,
            "depth": 0.35,
            "lo": -112,
            "hi": 112,
            "rampRun": 10,
            "bed": {
              "minX": -12,
              "maxX": 12,
              "minZ": -112,
              "maxZ": 112
            }
          }
        ],
        "walls": [
          {
            "rect": {
              "minX": -12.35,
              "maxX": -12,
              "minZ": -112.35,
              "maxZ": 112.35
            }
          },
          {
            "rect": {
              "minX": 12,
              "maxX": 12.35,
              "minZ": -112.35,
              "maxZ": 112.35
            }
          }
        ],
        "descents": [],
        "holes": [
          {
            "minX": -12,
            "maxX": 12,
            "minZ": -112,
            "maxZ": 112
          },
          {
            "minX": -12.35,
            "maxX": -12,
            "minZ": -112.35,
            "maxZ": 112.35
          },
          {
            "minX": 12,
            "maxX": 12.35,
            "minZ": -112.35,
            "maxZ": 112.35
          }
        ]
      },
      {
        "id": "canal",
        "bank": "quay",
        "wade": true,
        "width": 8,
        "bedY": -2.5,
        "surfaceY": -0.4,
        "segments": [
          {
            "axis": "x",
            "cross": -90,
            "halfW": 4,
            "run": 0,
            "depth": 0.35,
            "lo": -100,
            "hi": -16,
            "rampRun": 8.333,
            "bed": {
              "minX": -100,
              "maxX": -16,
              "minZ": -94,
              "maxZ": -86
            }
          }
        ],
        "walls": [
          {
            "rect": {
              "minX": -100.35,
              "maxX": -15.65,
              "minZ": -94.35,
              "maxZ": -94
            }
          },
          {
            "rect": {
              "minX": -100.35,
              "maxX": -83,
              "minZ": -86,
              "maxZ": -85.65
            }
          },
          {
            "rect": {
              "minX": -77,
              "maxX": -39,
              "minZ": -86,
              "maxZ": -85.65
            }
          },
          {
            "rect": {
              "minX": -33,
              "maxX": -15.65,
              "minZ": -86,
              "maxZ": -85.65
            }
          }
        ],
        "descents": [
          {
            "id": "canal:сход1",
            "kind": "ramp",
            "seg": 0,
            "axis": "z",
            "u0": -86.6,
            "u1": -78.267,
            "v0": -39,
            "v1": -33,
            "y0": -2.5,
            "y1": 0,
            "plan": {
              "minX": -39,
              "maxX": -33,
              "minZ": -86.6,
              "maxZ": -78.267
            }
          },
          {
            "id": "canal:сход2",
            "kind": "ramp",
            "seg": 0,
            "axis": "z",
            "u0": -86.6,
            "u1": -78.267,
            "v0": -83,
            "v1": -77,
            "y0": -2.5,
            "y1": 0,
            "plan": {
              "minX": -83,
              "maxX": -77,
              "minZ": -86.6,
              "maxZ": -78.267
            }
          }
        ],
        "holes": [
          {
            "minX": -100,
            "maxX": -16,
            "minZ": -94,
            "maxZ": -86
          },
          {
            "minX": -39,
            "maxX": -33,
            "minZ": -86.6,
            "maxZ": -78.267
          },
          {
            "minX": -83,
            "maxX": -77,
            "minZ": -86.6,
            "maxZ": -78.267
          },
          {
            "minX": -100.35,
            "maxX": -15.65,
            "minZ": -94.35,
            "maxZ": -94
          },
          {
            "minX": -100.35,
            "maxX": -83,
            "minZ": -86,
            "maxZ": -85.65
          },
          {
            "minX": -77,
            "maxX": -39,
            "minZ": -86,
            "maxZ": -85.65
          },
          {
            "minX": -33,
            "maxX": -15.65,
            "minZ": -86,
            "maxZ": -85.65
          }
        ]
      }
    ],
    "props": [
      {
        "id": "av_1",
        "model": "av_pad",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": 80,
          "y": 0,
          "z": 96
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "bar_1",
        "model": "barrier",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": 26,
          "y": 0,
          "z": -40
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "bench_1",
        "model": "bench",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": -20,
          "y": 0,
          "z": 70
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "boll_1",
        "model": "bollard",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": -56,
          "y": 0,
          "z": 10
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "cont_1",
        "model": "container",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": -78,
          "y": 0,
          "z": -30
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_east_ave_13.6_-26",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": 13.6,
          "y": 0.12,
          "z": -26
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_east_ave_13.6_-46",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": 13.6,
          "y": 0.12,
          "z": -46
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_east_ave_13.6_-66",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": 13.6,
          "y": 0.12,
          "z": -66
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_east_ave_13.6_-86",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": 13.6,
          "y": 0.12,
          "z": -86
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_east_ave_26.4_-26",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 26.4,
          "y": 0.12,
          "z": -26
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_east_ave_26.4_-46",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 26.4,
          "y": 0.12,
          "z": -46
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_east_ave_26.4_-66",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 26.4,
          "y": 0.12,
          "z": -66
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_east_ave_26.4_-86",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 26.4,
          "y": 0.12,
          "z": -86
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_east_north_35_44.1",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 35,
          "y": 0.12,
          "z": 44.1
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_east_north_35_55.9",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 35,
          "y": 0.12,
          "z": 55.9
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_east_north_55_44.1",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 55,
          "y": 0.12,
          "z": 44.1
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_east_north_55_55.9",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 55,
          "y": 0.12,
          "z": 55.9
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_east_south_35_-70.1",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 35,
          "y": 0.12,
          "z": -70.1
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_east_south_35_-81.9",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 35,
          "y": 0.12,
          "z": -81.9
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_east_south_55_-70.1",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 55,
          "y": 0.12,
          "z": -70.1
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_east_south_55_-81.9",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 55,
          "y": 0.12,
          "z": -81.9
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_east_south_75_-70.1",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 75,
          "y": 0.12,
          "z": -70.1
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_east_south_75_-81.9",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 75,
          "y": 0.12,
          "z": -81.9
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_east_south_95_-70.1",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 95,
          "y": 0.12,
          "z": -70.1
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_east_south_95_-81.9",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 95,
          "y": 0.12,
          "z": -81.9
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_interchange_-20_56.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -20,
          "y": 12,
          "z": 56.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_interchange_-20_67.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -20,
          "y": 12,
          "z": 67.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_interchange_-40_56.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -40,
          "y": 12,
          "z": 56.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_interchange_-40_67.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -40,
          "y": 12,
          "z": 67.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_interchange_0_56.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 0,
          "y": 12,
          "z": 56.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_interchange_0_67.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 0,
          "y": 12,
          "z": 67.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_interchange_20_56.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 20,
          "y": 12,
          "z": 56.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_interchange_20_67.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 20,
          "y": 12,
          "z": 67.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_interchange_40_56.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 40,
          "y": 12,
          "z": 56.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_interchange_40_67.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 40,
          "y": 12,
          "z": 67.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_west_ave_-44.1_-24",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -44.1,
          "y": 0.12,
          "z": -24
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_west_ave_-44.1_-4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -44.1,
          "y": 0.12,
          "z": -4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_west_ave_-44.1_-44",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -44.1,
          "y": 0.12,
          "z": -44
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_west_ave_-44.1_-64",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -44.1,
          "y": 0.12,
          "z": -64
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_west_ave_-44.1_16",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -44.1,
          "y": 0.12,
          "z": 16
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_west_ave_-44.1_36",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -44.1,
          "y": 0.12,
          "z": 36
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_west_ave_-44.1_56",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -44.1,
          "y": 0.12,
          "z": 56
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_west_ave_-44.1_76",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -44.1,
          "y": 0.12,
          "z": 76
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_west_ave_-55.9_-24",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -55.9,
          "y": 0.12,
          "z": -24
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_west_ave_-55.9_-4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -55.9,
          "y": 0.12,
          "z": -4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_west_ave_-55.9_-44",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -55.9,
          "y": 0.12,
          "z": -44
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_west_ave_-55.9_-64",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -55.9,
          "y": 0.12,
          "z": -64
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_west_ave_-55.9_16",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -55.9,
          "y": 0.12,
          "z": 16
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_west_ave_-55.9_36",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -55.9,
          "y": 0.12,
          "z": 36
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_west_ave_-55.9_56",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -55.9,
          "y": 0.12,
          "z": 56
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_west_ave_-55.9_76",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -55.9,
          "y": 0.12,
          "z": 76
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_west_cross_n_-67_44.1",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -67,
          "y": 0.12,
          "z": 44.1
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_west_cross_n_-67_55.9",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -67,
          "y": 0.12,
          "z": 55.9
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_west_cross_n_-87_44.1",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -87,
          "y": 0.12,
          "z": 44.1
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_west_cross_n_-87_55.9",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -87,
          "y": 0.12,
          "z": 55.9
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_west_cross_s_-67_-50.1",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -67,
          "y": 0.12,
          "z": -50.1
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_west_cross_s_-67_-61.9",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -67,
          "y": 0.12,
          "z": -61.9
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_west_cross_s_-87_-50.1",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -87,
          "y": 0.12,
          "z": -50.1
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_west_cross_s_-87_-61.9",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -87,
          "y": 0.12,
          "z": -61.9
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_yaw225_65.162_-66.159",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 157.5,
        "position": {
          "x": 65.162,
          "y": 0.14,
          "z": -66.159
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_yaw225_69.295_-76.137",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -22.5,
        "position": {
          "x": 69.295,
          "y": 0.14,
          "z": -76.137
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_yaw30_-47.176_90.323",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -30,
        "position": {
          "x": -47.176,
          "y": 0.14,
          "z": 90.323
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_yaw30_-52.576_99.677",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 150,
        "position": {
          "x": -52.576,
          "y": 0.14,
          "z": 99.677
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_yaw30_-64.496_80.323",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -30,
        "position": {
          "x": -64.496,
          "y": 0.14,
          "z": 80.323
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_yaw30_-69.896_89.677",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 150,
        "position": {
          "x": -69.896,
          "y": 0.14,
          "z": 89.677
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "mkt_1",
        "model": "market_stall",
        "source": "authored",
        "rotationY": 20,
        "position": {
          "x": 26,
          "y": 0,
          "z": -60
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "mkt_2",
        "model": "market_stall",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": 27,
          "y": 0,
          "z": -56
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "pillar_rd_interchange_-16_59.2",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 180,
        "position": {
          "x": -16,
          "y": 0,
          "z": 59.2
        },
        "scale": {
          "x": 1.6,
          "y": 11.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_-16_64.8",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 180,
        "position": {
          "x": -16,
          "y": 0,
          "z": 64.8
        },
        "scale": {
          "x": 1.6,
          "y": 11.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_-28_59.2",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 180,
        "position": {
          "x": -28,
          "y": 0,
          "z": 59.2
        },
        "scale": {
          "x": 1.6,
          "y": 11.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_-28_64.8",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 180,
        "position": {
          "x": -28,
          "y": 0,
          "z": 64.8
        },
        "scale": {
          "x": 1.6,
          "y": 11.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_-40_59.2",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 180,
        "position": {
          "x": -40,
          "y": 0,
          "z": 59.2
        },
        "scale": {
          "x": 1.6,
          "y": 11.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_-40_64.8",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 180,
        "position": {
          "x": -40,
          "y": 0,
          "z": 64.8
        },
        "scale": {
          "x": 1.6,
          "y": 11.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_-4_59.2",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 180,
        "position": {
          "x": -4,
          "y": -3,
          "z": 59.2
        },
        "scale": {
          "x": 1.6,
          "y": 14.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_-4_64.8",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 180,
        "position": {
          "x": -4,
          "y": -3,
          "z": 64.8
        },
        "scale": {
          "x": 1.6,
          "y": 14.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_-62_59.2",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 180,
        "position": {
          "x": -62,
          "y": 0,
          "z": 59.2
        },
        "scale": {
          "x": 1.6,
          "y": 6.054,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_-62_64.8",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 180,
        "position": {
          "x": -62,
          "y": 0,
          "z": 64.8
        },
        "scale": {
          "x": 1.6,
          "y": 6.054,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_-74_59.2",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 180,
        "position": {
          "x": -74,
          "y": 0,
          "z": 59.2
        },
        "scale": {
          "x": 1.6,
          "y": 2.49,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_-74_64.8",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 180,
        "position": {
          "x": -74,
          "y": 0,
          "z": 64.8
        },
        "scale": {
          "x": 1.6,
          "y": 2.49,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_20_59.2",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 180,
        "position": {
          "x": 20,
          "y": 0,
          "z": 59.2
        },
        "scale": {
          "x": 1.6,
          "y": 11.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_20_64.8",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 180,
        "position": {
          "x": 20,
          "y": 0,
          "z": 64.8
        },
        "scale": {
          "x": 1.6,
          "y": 11.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_32_59.2",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 180,
        "position": {
          "x": 32,
          "y": 0,
          "z": 59.2
        },
        "scale": {
          "x": 1.6,
          "y": 11.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_32_64.8",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 180,
        "position": {
          "x": 32,
          "y": 0,
          "z": 64.8
        },
        "scale": {
          "x": 1.6,
          "y": 11.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_40.447_-19.72",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 12.896899219112953,
        "position": {
          "x": 40.447,
          "y": 0,
          "z": -19.72
        },
        "scale": {
          "x": 1.6,
          "y": 1.215,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_44_59.2",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 180,
        "position": {
          "x": 44,
          "y": 0,
          "z": 59.2
        },
        "scale": {
          "x": 1.6,
          "y": 11.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_44_64.8",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 180,
        "position": {
          "x": 44,
          "y": 0,
          "z": 64.8
        },
        "scale": {
          "x": 1.6,
          "y": 11.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_52.479_59.117",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -176.17917317405872,
        "position": {
          "x": 52.479,
          "y": 0,
          "z": 59.117
        },
        "scale": {
          "x": 1.6,
          "y": 11.126,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_52.784_-15.096",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -4.291834634811735,
        "position": {
          "x": 52.784,
          "y": 0,
          "z": -15.096
        },
        "scale": {
          "x": 1.6,
          "y": 1.56,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_52.852_64.705",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -176.17917317405872,
        "position": {
          "x": 52.852,
          "y": 0,
          "z": 64.705
        },
        "scale": {
          "x": 1.6,
          "y": 11.259,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_53.203_-20.68",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -4.291834634811735,
        "position": {
          "x": 53.203,
          "y": 0,
          "z": -20.68
        },
        "scale": {
          "x": 1.6,
          "y": 2.148,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_63.337_56.727",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -158.99043932013402,
        "position": {
          "x": 63.337,
          "y": 0,
          "z": 56.727
        },
        "scale": {
          "x": 1.6,
          "y": 9.965,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_63.622_-12.616",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -21.480568488736438,
        "position": {
          "x": 63.622,
          "y": 0,
          "z": -12.616
        },
        "scale": {
          "x": 1.6,
          "y": 2.494,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_65.345_61.955",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -158.99043932013402,
        "position": {
          "x": 65.345,
          "y": 0,
          "z": 61.955
        },
        "scale": {
          "x": 1.6,
          "y": 10.553,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_65.673_-17.827",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -21.480568488736438,
        "position": {
          "x": 65.673,
          "y": 0,
          "z": -17.827
        },
        "scale": {
          "x": 1.6,
          "y": 3.082,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_73.004_51.235",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -141.80170546620928,
        "position": {
          "x": 73.004,
          "y": 0,
          "z": 51.235
        },
        "scale": {
          "x": 1.6,
          "y": 9.031,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_73.243_-7.044",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -38.66930234266113,
        "position": {
          "x": 73.243,
          "y": 0,
          "z": -7.044
        },
        "scale": {
          "x": 1.6,
          "y": 3.428,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_76.467_55.635",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -141.80170546620928,
        "position": {
          "x": 76.467,
          "y": 0,
          "z": 55.635
        },
        "scale": {
          "x": 1.6,
          "y": 9.619,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_76.742_-11.417",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -38.66930234266113,
        "position": {
          "x": 76.742,
          "y": 0,
          "z": -11.417
        },
        "scale": {
          "x": 1.6,
          "y": 4.016,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_80.616_43.131",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -124.61297161228464,
        "position": {
          "x": 80.616,
          "y": 0,
          "z": 43.131
        },
        "scale": {
          "x": 1.6,
          "y": 8.097,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_80.789_1.122",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -55.85803619658583,
        "position": {
          "x": 80.789,
          "y": 0,
          "z": 1.122
        },
        "scale": {
          "x": 1.6,
          "y": 4.362,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_85.225_46.312",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -124.61297161228464,
        "position": {
          "x": 85.225,
          "y": 0,
          "z": 46.312
        },
        "scale": {
          "x": 1.6,
          "y": 8.685,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_85.423_-2.021",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -55.85803619658583,
        "position": {
          "x": 85.423,
          "y": 0,
          "z": -2.021
        },
        "scale": {
          "x": 1.6,
          "y": 4.95,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_85.493_33.139",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -107.42423775835992,
        "position": {
          "x": 85.493,
          "y": 0,
          "z": 33.139
        },
        "scale": {
          "x": 1.6,
          "y": 7.163,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_85.583_11.153",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -73.04677005051053,
        "position": {
          "x": 85.583,
          "y": 0,
          "z": 11.153
        },
        "scale": {
          "x": 1.6,
          "y": 5.296,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_87.2_22.153",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90.23550390443522,
        "position": {
          "x": 87.2,
          "y": 0,
          "z": 22.153
        },
        "scale": {
          "x": 1.6,
          "y": 6.229,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_8_59.2",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 180,
        "position": {
          "x": 8,
          "y": -3,
          "z": 59.2
        },
        "scale": {
          "x": 1.6,
          "y": 14.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_8_64.8",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 180,
        "position": {
          "x": 8,
          "y": -3,
          "z": 64.8
        },
        "scale": {
          "x": 1.6,
          "y": 14.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_90.836_34.816",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -107.42423775835992,
        "position": {
          "x": 90.836,
          "y": 0,
          "z": 34.816
        },
        "scale": {
          "x": 1.6,
          "y": 7.751,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_90.94_9.52",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -73.04677005051053,
        "position": {
          "x": 90.94,
          "y": 0,
          "z": 9.52
        },
        "scale": {
          "x": 1.6,
          "y": 5.884,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_interchange_92.8_22.176",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90.23550390443522,
        "position": {
          "x": 92.8,
          "y": 0,
          "z": 22.176
        },
        "scale": {
          "x": 1.6,
          "y": 6.817,
          "z": 1.6
        }
      },
      {
        "id": "tree_1",
        "model": "tree",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": 30,
          "y": 0,
          "z": 80
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      }
    ],
    "lights": [
      {
        "id": "bridge_lamp",
        "type": "point",
        "position": {
          "x": 10,
          "y": 14,
          "z": 62
        },
        "color": "#ffcf9a",
        "intensity": 55,
        "distance": 45,
        "angle": 0.7
      },
      {
        "id": "plaza_lamp",
        "type": "point",
        "position": {
          "x": 20,
          "y": 7,
          "z": -40
        },
        "color": "#cfe0ff",
        "intensity": 30,
        "distance": 35,
        "angle": 0.7
      }
    ],
    "windows": {
      "lit": 0.5
    },
    "clutter": {
      "roof": {
        "perHouse": 3
      },
      "street": {
        "every": 28
      }
    },
    "signage": {
      "keep": 0.7,
      "width": [
        3,
        7
      ]
    }
  },
  "sky": {
    "sky": "#0b1020",
    "fog": {
      "color": "#0e1424",
      "near": 30,
      "far": 200
    },
    "hemi": {
      "sky": "#1b2a44",
      "ground": "#0a0d12",
      "intensity": 0.4
    },
    "lights": {
      "count": 6,
      "reach": 55,
      "height": 5.4,
      "spacing": 18,
      "intensity": 70
    },
    "sun": {
      "color": "#bcd0ff",
      "intensity": 0.55,
      "position": [
        80,
        220,
        60
      ]
    }
  },
  "gameplay": {
    "goal": "exit",
    "exit": {
      "x": 10,
      "z": 62
    },
    "exitRadius": 4,
    "enemies": {
      "count": 6
    },
    "alienEnemies": {
      "count": 1
    }
  }
};
