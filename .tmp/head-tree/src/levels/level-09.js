/**
 * СГЕНЕРИРОВАННО — руками не править.
 *
 * Источник правки: src/levels/level-09.json. После его изменения запуск
 * `node tools/build-level.mjs src/levels/level-09.json` перезаписывает этот файл
 * побайтово одинаково (ГПСЧ в парсере нет, ключи объектов отсортированы).
 *
 * Тип карты — `kind: 'json'`: числа и топологию готовит Node-парсер
 * (замкнутые полигоны, союз прямоугольников footprint, абсолютные высоты
 * этажей, проступи лестниц, пластины настилов, автогенерированные опоры и
 * фонари, проёмы дверей), браузер строит из них только солиды, опоры,
 * навигацию и меш.
 */
export const LEVEL_09 = {
  "name": "Глава 9. Сводная из JSON",
  "hint": "Все типы объектов пайплайна на одной площади: улицы двух ярусов, дома с комнатами и тремя видами лестниц. Дойдите от точки A до маяка на втором этаже углового дома.",
  "map": {
    "kind": "json",
    "units": "meters",
    "ground": {
      "y": 0,
      "size": 176,
      "color": "#23262c"
    },
    "bounds": {
      "minX": -88,
      "maxX": 88,
      "minZ": -88,
      "maxZ": 88
    },
    "spawn": {
      "x": -8,
      "z": 14
    },
    "buildings": [
      {
        "id": "building_plaza",
        "name": "Commercial Corner Plaza",
        "isEnterable": true,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "glass_and_concrete",
        "footprint": [
          {
            "x": 8,
            "z": 8
          },
          {
            "x": 38,
            "z": 8
          },
          {
            "x": 38,
            "z": 34
          },
          {
            "x": 8,
            "z": 34
          }
        ],
        "bounds": {
          "minX": 8,
          "maxX": 38,
          "minZ": 8,
          "maxZ": 34
        },
        "rects": [
          {
            "minX": 8,
            "maxX": 38,
            "minZ": 8,
            "maxZ": 34
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 23.825,
            "maxX": 24.175,
            "minZ": 8,
            "maxZ": 34,
            "facade": false
          },
          {
            "axis": "x",
            "minX": 24,
            "maxX": 38,
            "minZ": 33.825,
            "maxZ": 34.175,
            "facade": false
          },
          {
            "axis": "x",
            "minX": 24,
            "maxX": 38,
            "minZ": 7.825,
            "maxZ": 8.175,
            "facade": false
          },
          {
            "axis": "z",
            "minX": 37.825,
            "maxX": 38.175,
            "minZ": 8,
            "maxZ": 34,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 7.825,
            "maxX": 8.175,
            "minZ": 8,
            "maxZ": 34,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 8,
            "maxX": 24,
            "minZ": 33.825,
            "maxZ": 34.175,
            "facade": false
          },
          {
            "axis": "x",
            "minX": 8,
            "maxX": 24,
            "minZ": 7.825,
            "maxZ": 8.175,
            "facade": false
          },
          {
            "axis": "x",
            "minX": 8,
            "maxX": 38,
            "minZ": 33.825,
            "maxZ": 34.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 8,
            "maxX": 38,
            "minZ": 7.825,
            "maxZ": 8.175,
            "facade": true
          }
        ],
        "rooms": [
          {
            "id": "plaza_cafe",
            "type": "cafe",
            "floor": 0,
            "rect": {
              "minX": 24,
              "maxX": 38,
              "minZ": 8,
              "maxZ": 34
            },
            "y": 0
          },
          {
            "id": "plaza_corridor",
            "type": "corridor",
            "floor": 1,
            "rect": {
              "minX": 24,
              "maxX": 38,
              "minZ": 8,
              "maxZ": 34
            },
            "y": 3.5
          },
          {
            "id": "plaza_hall",
            "type": "hall",
            "floor": 0,
            "rect": {
              "minX": 8,
              "maxX": 24,
              "minZ": 8,
              "maxZ": 34
            },
            "y": 0
          },
          {
            "id": "plaza_office",
            "type": "office",
            "floor": 1,
            "rect": {
              "minX": 8,
              "maxX": 24,
              "minZ": 8,
              "maxZ": 34
            },
            "y": 3.5
          }
        ],
        "stairs": [
          {
            "id": "plaza_stair_a",
            "type": "straight",
            "connectsFloors": [
              0,
              1
            ],
            "y0": 0,
            "y1": 3.5,
            "height": 3.5,
            "rotation": 0,
            "rect": {
              "minX": 28,
              "maxX": 34,
              "minZ": 29,
              "maxZ": 31
            },
            "steps": [
              {
                "minX": 28,
                "maxX": 28.857,
                "minZ": 29,
                "maxZ": 31,
                "top": 0.5
              },
              {
                "minX": 28.857,
                "maxX": 29.714,
                "minZ": 29,
                "maxZ": 31,
                "top": 1
              },
              {
                "minX": 29.714,
                "maxX": 30.571,
                "minZ": 29,
                "maxZ": 31,
                "top": 1.5
              },
              {
                "minX": 30.571,
                "maxX": 31.429,
                "minZ": 29,
                "maxZ": 31,
                "top": 2
              },
              {
                "minX": 31.429,
                "maxX": 32.286,
                "minZ": 29,
                "maxZ": 31,
                "top": 2.5
              },
              {
                "minX": 32.286,
                "maxX": 33.143,
                "minZ": 29,
                "maxZ": 31,
                "top": 3
              },
              {
                "minX": 33.143,
                "maxX": 34,
                "minZ": 29,
                "maxZ": 31,
                "top": 3.5
              }
            ],
            "bottom": {
              "x": 28.429,
              "z": 30,
              "y": 0.5
            },
            "top": {
              "x": 33.572,
              "z": 30,
              "y": 3.5
            }
          }
        ],
        "doors": [
          {
            "id": "plaza_cafe→road_main",
            "room": "plaza_cafe",
            "target": "road_main",
            "linkType": "door",
            "axis": "x",
            "y": 0,
            "height": 2.1,
            "rect": {
              "minX": 30.1,
              "maxX": 31.9,
              "minZ": 7.815,
              "maxZ": 8.185
            },
            "inside": {
              "x": 31,
              "z": 9.4
            },
            "outside": {
              "x": 31,
              "z": 6.6
            }
          },
          {
            "id": "plaza_corridor→plaza_office",
            "room": "plaza_corridor",
            "target": "plaza_office",
            "linkType": "door",
            "axis": "z",
            "y": 3.5,
            "height": 2.1,
            "rect": {
              "minX": 23.815,
              "maxX": 24.185,
              "minZ": 19.1,
              "maxZ": 20.9
            },
            "inside": {
              "x": 25.4,
              "z": 20
            },
            "outside": {
              "x": 22.6,
              "z": 20
            }
          },
          {
            "id": "plaza_hall→plaza_cafe",
            "room": "plaza_hall",
            "target": "plaza_cafe",
            "linkType": "door",
            "axis": "z",
            "y": 0,
            "height": 2.1,
            "rect": {
              "minX": 23.815,
              "maxX": 24.185,
              "minZ": 13.1,
              "maxZ": 14.9
            },
            "inside": {
              "x": 22.6,
              "z": 14
            },
            "outside": {
              "x": 25.4,
              "z": 14
            }
          },
          {
            "id": "plaza_hall→road_main",
            "room": "plaza_hall",
            "target": "road_main",
            "linkType": "main_entrance",
            "axis": "x",
            "y": 0,
            "height": 2.1,
            "rect": {
              "minX": 15.1,
              "maxX": 16.9,
              "minZ": 7.815,
              "maxZ": 8.185
            },
            "inside": {
              "x": 16,
              "z": 9.4
            },
            "outside": {
              "x": 16,
              "z": 6.6
            }
          }
        ]
      },
      {
        "id": "building_l",
        "name": "Corner Tower L",
        "isEnterable": true,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 3,
        "roofY": 10.5,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -64,
            "z": -34
          },
          {
            "x": -24,
            "z": -34
          },
          {
            "x": -24,
            "z": -20
          },
          {
            "x": -44,
            "z": -20
          },
          {
            "x": -44,
            "z": -8
          },
          {
            "x": -58,
            "z": -8
          },
          {
            "x": -58,
            "z": -20
          },
          {
            "x": -64,
            "z": -20
          }
        ],
        "bounds": {
          "minX": -64,
          "maxX": -24,
          "minZ": -34,
          "maxZ": -8
        },
        "rects": [
          {
            "minX": -58,
            "maxX": -44,
            "minZ": -20,
            "maxZ": -8
          },
          {
            "minX": -64,
            "maxX": -24,
            "minZ": -34,
            "maxZ": -20
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -24.175,
            "maxX": -23.825,
            "minZ": -34,
            "maxZ": -20,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -44.175,
            "maxX": -43.825,
            "minZ": -20,
            "maxZ": -8,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -44.175,
            "maxX": -43.825,
            "minZ": -34,
            "maxZ": -20,
            "facade": false
          },
          {
            "axis": "z",
            "minX": -44.175,
            "maxX": -43.825,
            "minZ": -34,
            "maxZ": -8,
            "facade": false
          },
          {
            "axis": "x",
            "minX": -44,
            "maxX": -24,
            "minZ": -20.175,
            "maxZ": -19.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -44,
            "maxX": -24,
            "minZ": -34.175,
            "maxZ": -33.825,
            "facade": false
          },
          {
            "axis": "z",
            "minX": -58.175,
            "maxX": -57.825,
            "minZ": -20,
            "maxZ": -8,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -58,
            "maxX": -44,
            "minZ": -8.175,
            "maxZ": -7.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -64.175,
            "maxX": -63.825,
            "minZ": -34,
            "maxZ": -20,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -64,
            "maxX": -24,
            "minZ": -34.175,
            "maxZ": -33.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -64,
            "maxX": -44,
            "minZ": -34.175,
            "maxZ": -33.825,
            "facade": false
          },
          {
            "axis": "x",
            "minX": -64,
            "maxX": -58,
            "minZ": -20.175,
            "maxZ": -19.825,
            "facade": true
          }
        ],
        "rooms": [
          {
            "id": "l_hall",
            "type": "hall",
            "floor": 0,
            "rect": {
              "minX": -44,
              "maxX": -24,
              "minZ": -34,
              "maxZ": -20
            },
            "y": 0
          },
          {
            "id": "l_office",
            "type": "office",
            "floor": 1,
            "rect": {
              "minX": -44,
              "maxX": -24,
              "minZ": -34,
              "maxZ": -20
            },
            "y": 3.5
          },
          {
            "id": "l_room2",
            "type": "room",
            "floor": 2,
            "rect": {
              "minX": -44,
              "maxX": -24,
              "minZ": -34,
              "maxZ": -20
            },
            "y": 7
          },
          {
            "id": "l_shape_room1",
            "type": "room",
            "floor": 1,
            "rect": {
              "minX": -64,
              "maxX": -44,
              "minZ": -34,
              "maxZ": -8
            },
            "y": 3.5
          },
          {
            "id": "l_utility",
            "type": "utility",
            "floor": 0,
            "rect": {
              "minX": -64,
              "maxX": -44,
              "minZ": -34,
              "maxZ": -8
            },
            "y": 0
          },
          {
            "id": "l_utility2",
            "type": "utility",
            "floor": 2,
            "rect": {
              "minX": -64,
              "maxX": -44,
              "minZ": -34,
              "maxZ": -8
            },
            "y": 7
          }
        ],
        "stairs": [
          {
            "id": "l_stair_shape",
            "type": "l_shape",
            "connectsFloors": [
              1,
              2
            ],
            "y0": 3.5,
            "y1": 7,
            "height": 3.5,
            "rotation": 0,
            "rect": {
              "minX": -54.3,
              "maxX": -47.699999999999996,
              "minZ": -16.3,
              "maxZ": -11.700000000000001
            },
            "steps": [
              {
                "minX": -54.3,
                "maxX": -53.31,
                "minZ": -16.3,
                "maxZ": -14,
                "top": 4
              },
              {
                "minX": -53.31,
                "maxX": -52.32,
                "minZ": -16.3,
                "maxZ": -14,
                "top": 4.5
              },
              {
                "minX": -52.32,
                "maxX": -51.33,
                "minZ": -16.3,
                "maxZ": -14,
                "top": 5
              },
              {
                "minX": -51.33,
                "maxX": -50.34,
                "minZ": -16.3,
                "maxZ": -14,
                "top": 5.5
              },
              {
                "minX": -50.34,
                "maxX": -47.7,
                "minZ": -16.3,
                "maxZ": -14,
                "top": 5.5
              },
              {
                "minX": -50.34,
                "maxX": -47.7,
                "minZ": -14,
                "maxZ": -13.233,
                "top": 6
              },
              {
                "minX": -50.34,
                "maxX": -47.7,
                "minZ": -13.233,
                "maxZ": -12.467,
                "top": 6.5
              },
              {
                "minX": -50.34,
                "maxX": -47.7,
                "minZ": -12.467,
                "maxZ": -11.7,
                "top": 7
              }
            ],
            "bottom": {
              "x": -53.805,
              "z": -15.15,
              "y": 4
            },
            "top": {
              "x": -49.02,
              "z": -12.083,
              "y": 7
            }
          },
          {
            "id": "l_stair_spiral",
            "type": "spiral",
            "connectsFloors": [
              0,
              1
            ],
            "y0": 0,
            "y1": 3.5,
            "height": 3.5,
            "rotation": 0,
            "rect": {
              "minX": -32.8,
              "maxX": -27.199999999999996,
              "minZ": -28.8,
              "maxZ": -23.200000000000003
            },
            "steps": [
              {
                "minX": -29.488,
                "maxX": -27.2,
                "minZ": -26,
                "maxZ": -24.861,
                "top": 0.233
              },
              {
                "minX": -29.625,
                "maxX": -27.442,
                "minZ": -25.772,
                "maxZ": -23.919,
                "top": 0.467
              },
              {
                "minX": -29.827,
                "maxX": -28.126,
                "minZ": -25.584,
                "maxZ": -23.337,
                "top": 0.7
              },
              {
                "minX": -30.293,
                "maxX": -29.135,
                "minZ": -25.467,
                "maxZ": -23.215,
                "top": 0.933
              },
              {
                "minX": -31.4,
                "maxX": -30.059,
                "minZ": -25.515,
                "maxZ": -23.215,
                "top": 1.167
              },
              {
                "minX": -32.265,
                "maxX": -30.28,
                "minZ": -25.671,
                "maxZ": -23.575,
                "top": 1.4
              },
              {
                "minX": -32.739,
                "maxX": -30.453,
                "minZ": -25.884,
                "maxZ": -24.354,
                "top": 1.633
              },
              {
                "minX": -32.739,
                "maxX": -30.548,
                "minZ": -26.582,
                "maxZ": -25.418,
                "top": 1.867
              },
              {
                "minX": -32.739,
                "maxX": -30.453,
                "minZ": -27.646,
                "maxZ": -26.116,
                "top": 2.1
              },
              {
                "minX": -32.265,
                "maxX": -30.28,
                "minZ": -28.425,
                "maxZ": -26.329,
                "top": 2.333
              },
              {
                "minX": -31.4,
                "maxX": -30.059,
                "minZ": -28.785,
                "maxZ": -26.485,
                "top": 2.567
              },
              {
                "minX": -30.293,
                "maxX": -29.135,
                "minZ": -28.785,
                "maxZ": -26.533,
                "top": 2.8
              },
              {
                "minX": -29.827,
                "maxX": -28.126,
                "minZ": -28.663,
                "maxZ": -26.416,
                "top": 3.033
              },
              {
                "minX": -29.625,
                "maxX": -27.442,
                "minZ": -28.081,
                "maxZ": -26.228,
                "top": 3.267
              },
              {
                "minX": -29.488,
                "maxX": -27.2,
                "minZ": -27.139,
                "maxZ": -26,
                "top": 3.5
              }
            ],
            "bottom": {
              "x": -28.344,
              "z": -25.431,
              "y": 0.233
            },
            "top": {
              "x": -28.344,
              "z": -26.569,
              "y": 3.5
            }
          }
        ],
        "doors": [
          {
            "id": "l_hall→l_utility",
            "room": "l_hall",
            "target": "l_utility",
            "linkType": "door",
            "axis": "z",
            "y": 0,
            "height": 2.1,
            "rect": {
              "minX": -44.185,
              "maxX": -43.815,
              "minZ": -26.9,
              "maxZ": -25.1
            },
            "inside": {
              "x": -42.6,
              "z": -26
            },
            "outside": {
              "x": -45.4,
              "z": -26
            }
          },
          {
            "id": "l_hall→road_cross",
            "room": "l_hall",
            "target": "road_cross",
            "linkType": "main_entrance",
            "axis": "z",
            "y": 0,
            "height": 2.1,
            "rect": {
              "minX": -24.185,
              "maxX": -23.815,
              "minZ": -26.9,
              "maxZ": -25.1
            },
            "inside": {
              "x": -25.4,
              "z": -26
            },
            "outside": {
              "x": -22.6,
              "z": -26
            }
          },
          {
            "id": "l_office→l_shape_room1",
            "room": "l_office",
            "target": "l_shape_room1",
            "linkType": "door",
            "axis": "z",
            "y": 3.5,
            "height": 2.1,
            "rect": {
              "minX": -44.185,
              "maxX": -43.815,
              "minZ": -26.9,
              "maxZ": -25.1
            },
            "inside": {
              "x": -42.6,
              "z": -26
            },
            "outside": {
              "x": -45.4,
              "z": -26
            }
          },
          {
            "id": "l_utility2→l_room2",
            "room": "l_utility2",
            "target": "l_room2",
            "linkType": "door",
            "axis": "z",
            "y": 7,
            "height": 2.1,
            "rect": {
              "minX": -44.185,
              "maxX": -43.815,
              "minZ": -26.9,
              "maxZ": -25.1
            },
            "inside": {
              "x": -45.4,
              "z": -26
            },
            "outside": {
              "x": -42.6,
              "z": -26
            }
          },
          {
            "id": "l_utility→road_main",
            "room": "l_utility",
            "target": "road_main",
            "linkType": "back_entrance",
            "axis": "x",
            "y": 0,
            "height": 2.1,
            "rect": {
              "minX": -51.9,
              "maxX": -50.1,
              "minZ": -8.185,
              "maxZ": -7.815
            },
            "inside": {
              "x": -51,
              "z": -9.4
            },
            "outside": {
              "x": -51,
              "z": -6.6
            }
          }
        ]
      },
      {
        "id": "building_kiosk",
        "name": "Kiosk",
        "isEnterable": true,
        "baseY": 0,
        "floorHeight": 4,
        "floorsCount": 1,
        "roofY": 4,
        "facadeMaterial": "painted_brick",
        "footprint": [
          {
            "x": 44,
            "z": 8
          },
          {
            "x": 58,
            "z": 8
          },
          {
            "x": 58,
            "z": 22
          },
          {
            "x": 44,
            "z": 22
          }
        ],
        "bounds": {
          "minX": 44,
          "maxX": 58,
          "minZ": 8,
          "maxZ": 22
        },
        "rects": [
          {
            "minX": 44,
            "maxX": 58,
            "minZ": 8,
            "maxZ": 22
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 43.825,
            "maxX": 44.175,
            "minZ": 8,
            "maxZ": 22,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 44,
            "maxX": 58,
            "minZ": 21.825,
            "maxZ": 22.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 44,
            "maxX": 58,
            "minZ": 7.825,
            "maxZ": 8.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 57.825,
            "maxX": 58.175,
            "minZ": 8,
            "maxZ": 22,
            "facade": true
          }
        ],
        "rooms": [
          {
            "id": "kiosk_hall",
            "type": "hall",
            "floor": 0,
            "rect": {
              "minX": 44,
              "maxX": 58,
              "minZ": 8,
              "maxZ": 22
            },
            "y": 0
          }
        ],
        "stairs": [],
        "doors": [
          {
            "id": "kiosk_hall→road_main",
            "room": "kiosk_hall",
            "target": "road_main",
            "linkType": "main_entrance",
            "axis": "x",
            "y": 0,
            "height": 2.1,
            "rect": {
              "minX": 49.1,
              "maxX": 50.9,
              "minZ": 7.815,
              "maxZ": 8.185
            },
            "inside": {
              "x": 50,
              "z": 9.4
            },
            "outside": {
              "x": 50,
              "z": 6.6
            }
          }
        ]
      },
      {
        "id": "building_shed",
        "name": "Locked Depot",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4,
        "floorsCount": 1,
        "roofY": 4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -84,
            "z": 40
          },
          {
            "x": -64,
            "z": 40
          },
          {
            "x": -64,
            "z": 56
          },
          {
            "x": -84,
            "z": 56
          }
        ],
        "bounds": {
          "minX": -84,
          "maxX": -64,
          "minZ": 40,
          "maxZ": 56
        },
        "rects": [
          {
            "minX": -84,
            "maxX": -64,
            "minZ": 40,
            "maxZ": 56
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -64.175,
            "maxX": -63.825,
            "minZ": 40,
            "maxZ": 56,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -84.175,
            "maxX": -83.825,
            "minZ": 40,
            "maxZ": 56,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -84,
            "maxX": -64,
            "minZ": 39.825,
            "maxZ": 40.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -84,
            "maxX": -64,
            "minZ": 55.825,
            "maxZ": 56.175,
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
        "id": "road_main",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -80,
            "maxX": 0,
            "minZ": -5,
            "maxZ": 5,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false
          },
          {
            "minX": 0,
            "maxX": 80,
            "minZ": -5,
            "maxZ": 5,
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
            "id": "lamp_road_main_-70_-6.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -70,
              "y": 0.12,
              "z": -6.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_main_-70_6.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -70,
              "y": 0.12,
              "z": 6.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_main_-50_-6.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -50,
              "y": 0.12,
              "z": -6.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_main_-50_6.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -50,
              "y": 0.12,
              "z": 6.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_main_-30_-6.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -30,
              "y": 0.12,
              "z": -6.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_main_-30_6.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -30,
              "y": 0.12,
              "z": 6.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_main_-10_-6.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -10,
              "y": 0.12,
              "z": -6.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_main_-10_6.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -10,
              "y": 0.12,
              "z": 6.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_main_10_-6.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 10,
              "y": 0.12,
              "z": -6.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_main_10_6.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 10,
              "y": 0.12,
              "z": 6.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_main_30_-6.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 30,
              "y": 0.12,
              "z": -6.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_main_30_6.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 30,
              "y": 0.12,
              "z": 6.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_main_50_-6.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 50,
              "y": 0.12,
              "z": -6.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_main_50_6.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 50,
              "y": 0.12,
              "z": 6.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_main_70_-6.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 70,
              "y": 0.12,
              "z": -6.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_main_70_6.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 70,
              "y": 0.12,
              "z": 6.4
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
        "id": "road_cross",
        "type": "ground",
        "width": 8,
        "withLamps": true,
        "decks": [
          {
            "minX": -20,
            "maxX": -12,
            "minZ": -70,
            "maxZ": 0,
            "axis": "z",
            "topY": 0.16,
            "bottomY": -0.44,
            "topAtMin": 0.16,
            "topAtMax": 0.16,
            "ramp": false
          },
          {
            "minX": -20,
            "maxX": -12,
            "minZ": 0,
            "maxZ": 70,
            "axis": "z",
            "topY": 0.16,
            "bottomY": -0.44,
            "topAtMin": 0.16,
            "topAtMax": 0.16,
            "ramp": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_road_cross_-21.4_-60",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -21.4,
              "y": 0.16,
              "z": -60
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_cross_-10.6_-60",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -10.6,
              "y": 0.16,
              "z": -60
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_cross_-21.4_-40",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -21.4,
              "y": 0.16,
              "z": -40
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_cross_-10.6_-40",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -10.6,
              "y": 0.16,
              "z": -40
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_cross_-21.4_-20",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -21.4,
              "y": 0.16,
              "z": -20
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_cross_-10.6_-20",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -10.6,
              "y": 0.16,
              "z": -20
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_cross_-21.4_10",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -21.4,
              "y": 0.16,
              "z": 10
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_cross_-10.6_10",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -10.6,
              "y": 0.16,
              "z": 10
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_cross_-21.4_30",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -21.4,
              "y": 0.16,
              "z": 30
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_cross_-10.6_30",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -10.6,
              "y": 0.16,
              "z": 30
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_cross_-21.4_50",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -21.4,
              "y": 0.16,
              "z": 50
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_road_cross_-10.6_50",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -10.6,
              "y": 0.16,
              "z": 50
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
        "id": "road_overpass",
        "type": "bridge",
        "width": 9,
        "withLamps": false,
        "decks": [
          {
            "minX": -80,
            "maxX": -40,
            "minZ": -46.5,
            "maxZ": -37.5,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 8,
            "ramp": true
          },
          {
            "minX": -40,
            "maxX": 40,
            "minZ": -46.5,
            "maxZ": -37.5,
            "axis": "x",
            "topY": 8,
            "bottomY": 7.4,
            "topAtMin": 8,
            "topAtMax": 8,
            "ramp": false
          },
          {
            "minX": 40,
            "maxX": 80,
            "minZ": -46.5,
            "maxZ": -37.5,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 8,
            "topAtMax": 0.12,
            "ramp": true
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [
          {
            "id": "pillar_road_overpass_-34_-45.3",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 0,
            "position": {
              "x": -34,
              "y": 0,
              "z": -45.3
            },
            "scale": {
              "x": 1.6,
              "y": 7.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_road_overpass_-34_-38.7",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 0,
            "position": {
              "x": -34,
              "y": 0,
              "z": -38.7
            },
            "scale": {
              "x": 1.6,
              "y": 7.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_road_overpass_-22_-45.3",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 0,
            "position": {
              "x": -22,
              "y": 0,
              "z": -45.3
            },
            "scale": {
              "x": 1.6,
              "y": 7.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_road_overpass_-22_-38.7",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 0,
            "position": {
              "x": -22,
              "y": 0,
              "z": -38.7
            },
            "scale": {
              "x": 1.6,
              "y": 7.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_road_overpass_-10_-45.3",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 0,
            "position": {
              "x": -10,
              "y": 0,
              "z": -45.3
            },
            "scale": {
              "x": 1.6,
              "y": 7.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_road_overpass_-10_-38.7",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 0,
            "position": {
              "x": -10,
              "y": 0,
              "z": -38.7
            },
            "scale": {
              "x": 1.6,
              "y": 7.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_road_overpass_2_-45.3",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 0,
            "position": {
              "x": 2,
              "y": 0,
              "z": -45.3
            },
            "scale": {
              "x": 1.6,
              "y": 7.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_road_overpass_2_-38.7",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 0,
            "position": {
              "x": 2,
              "y": 0,
              "z": -38.7
            },
            "scale": {
              "x": 1.6,
              "y": 7.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_road_overpass_14_-45.3",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 0,
            "position": {
              "x": 14,
              "y": 0,
              "z": -45.3
            },
            "scale": {
              "x": 1.6,
              "y": 7.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_road_overpass_14_-38.7",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 0,
            "position": {
              "x": 14,
              "y": 0,
              "z": -38.7
            },
            "scale": {
              "x": 1.6,
              "y": 7.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_road_overpass_26_-45.3",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 0,
            "position": {
              "x": 26,
              "y": 0,
              "z": -45.3
            },
            "scale": {
              "x": 1.6,
              "y": 7.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_road_overpass_26_-38.7",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 0,
            "position": {
              "x": 26,
              "y": 0,
              "z": -38.7
            },
            "scale": {
              "x": 1.6,
              "y": 7.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_road_overpass_38_-45.3",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 0,
            "position": {
              "x": 38,
              "y": 0,
              "z": -45.3
            },
            "scale": {
              "x": 1.6,
              "y": 7.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_road_overpass_38_-38.7",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 0,
            "position": {
              "x": 38,
              "y": 0,
              "z": -38.7
            },
            "scale": {
              "x": 1.6,
              "y": 7.4,
              "z": 1.6
            }
          }
        ],
        "lamps": []
      },
      {
        "id": "road_bank",
        "type": "embankment",
        "width": 7,
        "withLamps": false,
        "decks": [
          {
            "minX": -30,
            "maxX": 0,
            "minZ": 52.5,
            "maxZ": 59.5,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 3,
            "ramp": true
          },
          {
            "minX": 0,
            "maxX": 50,
            "minZ": 52.5,
            "maxZ": 59.5,
            "axis": "x",
            "topY": 3,
            "bottomY": 2.4,
            "topAtMin": 3,
            "topAtMax": 3,
            "ramp": false,
            "grounded": true
          },
          {
            "minX": 50,
            "maxX": 78,
            "minZ": 52.5,
            "maxZ": 59.5,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 3,
            "topAtMax": 0.12,
            "ramp": true
          }
        ],
        "fill": [
          {
            "minX": 0,
            "maxX": 50,
            "minZ": 52.5,
            "maxZ": 59.5,
            "topY": 2.4,
            "bottomY": 0
          }
        ],
        "aprons": [
          {
            "axis": "x",
            "minX": 0,
            "maxX": 50,
            "cross": 52.5,
            "dir": -1,
            "run": 4.8,
            "topY": 3,
            "groundY": 0
          },
          {
            "axis": "x",
            "minX": 0,
            "maxX": 50,
            "cross": 59.5,
            "dir": 1,
            "run": 4.8,
            "topY": 3,
            "groundY": 0
          }
        ],
        "pillars": [],
        "lamps": []
      }
    ],
    "props": [
      {
        "id": "bench_1",
        "model": "bench",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": 14,
          "y": 0,
          "z": 6.5
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "bench_2",
        "model": "bench",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": 22,
          "y": 0,
          "z": 6.5
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "bench_3",
        "model": "bench",
        "source": "authored",
        "rotationY": 180,
        "position": {
          "x": -10,
          "y": 0,
          "z": 10
        },
        "scale": {
          "x": 1.2,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "bench_4",
        "model": "bench",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": -10,
          "y": 0,
          "z": 16
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "bollard_1",
        "model": "bollard",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": 12,
          "y": 0,
          "z": 6.8
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "bollard_2",
        "model": "bollard",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": 16,
          "y": 0,
          "z": 6.8
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "bollard_3",
        "model": "bollard",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": 20,
          "y": 0,
          "z": 6.8
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "bollard_4",
        "model": "bollard",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": 34,
          "y": 0,
          "z": 6.8
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "bollard_5",
        "model": "bollard",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": -22,
          "y": 0,
          "z": -26
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "bollard_6",
        "model": "bollard",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": -22,
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
        "id": "lamp_road_cross_-10.6_-20",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -10.6,
          "y": 0.16,
          "z": -20
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_cross_-10.6_-40",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -10.6,
          "y": 0.16,
          "z": -40
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_cross_-10.6_-60",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -10.6,
          "y": 0.16,
          "z": -60
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_cross_-10.6_10",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -10.6,
          "y": 0.16,
          "z": 10
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_cross_-10.6_30",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -10.6,
          "y": 0.16,
          "z": 30
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_cross_-10.6_50",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -10.6,
          "y": 0.16,
          "z": 50
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_cross_-21.4_-20",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -21.4,
          "y": 0.16,
          "z": -20
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_cross_-21.4_-40",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -21.4,
          "y": 0.16,
          "z": -40
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_cross_-21.4_-60",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -21.4,
          "y": 0.16,
          "z": -60
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_cross_-21.4_10",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -21.4,
          "y": 0.16,
          "z": 10
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_cross_-21.4_30",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -21.4,
          "y": 0.16,
          "z": 30
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_cross_-21.4_50",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -21.4,
          "y": 0.16,
          "z": 50
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_main_-10_-6.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -10,
          "y": 0.12,
          "z": -6.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_main_-10_6.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -10,
          "y": 0.12,
          "z": 6.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_main_-30_-6.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -30,
          "y": 0.12,
          "z": -6.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_main_-30_6.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -30,
          "y": 0.12,
          "z": 6.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_main_-50_-6.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -50,
          "y": 0.12,
          "z": -6.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_main_-50_6.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -50,
          "y": 0.12,
          "z": 6.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_main_-70_-6.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -70,
          "y": 0.12,
          "z": -6.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_main_-70_6.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -70,
          "y": 0.12,
          "z": 6.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_main_10_-6.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 10,
          "y": 0.12,
          "z": -6.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_main_10_6.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 10,
          "y": 0.12,
          "z": 6.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_main_30_-6.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 30,
          "y": 0.12,
          "z": -6.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_main_30_6.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 30,
          "y": 0.12,
          "z": 6.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_main_50_-6.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 50,
          "y": 0.12,
          "z": -6.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_main_50_6.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 50,
          "y": 0.12,
          "z": 6.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_main_70_-6.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 70,
          "y": 0.12,
          "z": -6.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_road_main_70_6.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 70,
          "y": 0.12,
          "z": 6.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "pillar_depot",
        "model": "concrete_pillar",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": -60,
          "y": 0,
          "z": 36
        },
        "scale": {
          "x": 1.6,
          "y": 4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_road_overpass_-10_-38.7",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 0,
        "position": {
          "x": -10,
          "y": 0,
          "z": -38.7
        },
        "scale": {
          "x": 1.6,
          "y": 7.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_road_overpass_-10_-45.3",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 0,
        "position": {
          "x": -10,
          "y": 0,
          "z": -45.3
        },
        "scale": {
          "x": 1.6,
          "y": 7.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_road_overpass_-22_-38.7",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 0,
        "position": {
          "x": -22,
          "y": 0,
          "z": -38.7
        },
        "scale": {
          "x": 1.6,
          "y": 7.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_road_overpass_-22_-45.3",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 0,
        "position": {
          "x": -22,
          "y": 0,
          "z": -45.3
        },
        "scale": {
          "x": 1.6,
          "y": 7.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_road_overpass_-34_-38.7",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 0,
        "position": {
          "x": -34,
          "y": 0,
          "z": -38.7
        },
        "scale": {
          "x": 1.6,
          "y": 7.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_road_overpass_-34_-45.3",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 0,
        "position": {
          "x": -34,
          "y": 0,
          "z": -45.3
        },
        "scale": {
          "x": 1.6,
          "y": 7.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_road_overpass_14_-38.7",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 0,
        "position": {
          "x": 14,
          "y": 0,
          "z": -38.7
        },
        "scale": {
          "x": 1.6,
          "y": 7.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_road_overpass_14_-45.3",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 0,
        "position": {
          "x": 14,
          "y": 0,
          "z": -45.3
        },
        "scale": {
          "x": 1.6,
          "y": 7.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_road_overpass_26_-38.7",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 0,
        "position": {
          "x": 26,
          "y": 0,
          "z": -38.7
        },
        "scale": {
          "x": 1.6,
          "y": 7.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_road_overpass_26_-45.3",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 0,
        "position": {
          "x": 26,
          "y": 0,
          "z": -45.3
        },
        "scale": {
          "x": 1.6,
          "y": 7.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_road_overpass_2_-38.7",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 0,
        "position": {
          "x": 2,
          "y": 0,
          "z": -38.7
        },
        "scale": {
          "x": 1.6,
          "y": 7.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_road_overpass_2_-45.3",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 0,
        "position": {
          "x": 2,
          "y": 0,
          "z": -45.3
        },
        "scale": {
          "x": 1.6,
          "y": 7.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_road_overpass_38_-38.7",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 0,
        "position": {
          "x": 38,
          "y": 0,
          "z": -38.7
        },
        "scale": {
          "x": 1.6,
          "y": 7.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_road_overpass_38_-45.3",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 0,
        "position": {
          "x": 38,
          "y": 0,
          "z": -45.3
        },
        "scale": {
          "x": 1.6,
          "y": 7.4,
          "z": 1.6
        }
      },
      {
        "id": "tree_1",
        "model": "tree",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": -6,
          "y": 0,
          "z": 20
        },
        "scale": {
          "x": 1,
          "y": 1.2,
          "z": 1
        }
      },
      {
        "id": "tree_2",
        "model": "tree",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": -6,
          "y": 0,
          "z": 32
        },
        "scale": {
          "x": 1,
          "y": 0.9,
          "z": 1
        }
      },
      {
        "id": "tree_3",
        "model": "tree",
        "source": "authored",
        "rotationY": 35,
        "position": {
          "x": 4,
          "y": 0,
          "z": -16
        },
        "scale": {
          "x": 1.1,
          "y": 1,
          "z": 1.1
        }
      },
      {
        "id": "tree_4",
        "model": "tree",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": -70,
          "y": 0,
          "z": -54
        },
        "scale": {
          "x": 1,
          "y": 1.1,
          "z": 1
        }
      },
      {
        "id": "tree_5",
        "model": "tree",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": 66,
          "y": 0,
          "z": -20
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "tree_6",
        "model": "tree",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": 24,
          "y": 0,
          "z": 44
        },
        "scale": {
          "x": 0.9,
          "y": 1.2,
          "z": 0.9
        }
      }
    ],
    "lights": [
      {
        "id": "facade_spot",
        "type": "spot",
        "position": {
          "x": 4,
          "y": 1.6,
          "z": 40
        },
        "target": {
          "x": 22,
          "y": 6,
          "z": 20
        },
        "color": "#ffd9a8",
        "intensity": 160,
        "distance": 60,
        "angle": 0.5
      },
      {
        "id": "hall_l_light",
        "type": "point",
        "position": {
          "x": -34,
          "y": 2.9,
          "z": -26
        },
        "color": "#ffe6c0",
        "intensity": 70,
        "distance": 30,
        "angle": 0.7
      },
      {
        "id": "hall_plaza_light",
        "type": "point",
        "position": {
          "x": 16,
          "y": 2.9,
          "z": 20
        },
        "color": "#ffe6c0",
        "intensity": 70,
        "distance": 30,
        "angle": 0.7
      },
      {
        "id": "plaza_lamp",
        "type": "point",
        "position": {
          "x": 20,
          "y": 6,
          "z": 2
        },
        "color": "#ffcf9a",
        "intensity": 110,
        "distance": 46,
        "angle": 0.7
      },
      {
        "id": "underpass_light",
        "type": "point",
        "position": {
          "x": -16,
          "y": 6,
          "z": -42
        },
        "color": "#9fd0ff",
        "intensity": 90,
        "distance": 40,
        "angle": 0.7
      }
    ]
  },
  "sky": {
    "sky": "#0b1020",
    "fog": {
      "color": "#0e1424",
      "near": 40,
      "far": 260
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
      "spacing": 20,
      "intensity": 70
    },
    "sun": {
      "color": "#bcd0ff",
      "intensity": 0.55,
      "position": [
        120,
        220,
        80
      ]
    }
  },
  "gameplay": {
    "goal": "exit",
    "exit": {
      "x": -34,
      "z": -26
    },
    "exitRadius": 4,
    "enemies": {
      "count": 3
    },
    "alienEnemies": {
      "count": 1
    }
  }
};
