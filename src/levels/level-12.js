/**
 * СГЕНЕРИРОВАННО — руками не править.
 *
 * Источник правки: src/levels/level-12.json. После его изменения запуск
 * `node tools/build-level.mjs src/levels/level-12.json` перезаписывает этот файл
 * побайтово одинаково (ГПСЧ в парсере нет, ключи объектов отсортированы).
 *
 * Секцию `city* развернул генератор кварталов (tools/city.js): его ГПСЧ сидит
 * в `city.seed`, поэтому и этот файл детерминирован — правка района в брифе
 * меняет дома, а правка сида меняет весь район целиком.
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
export const LEVEL_12 = {
  "name": "Глава 12. Рельефный мегаполис",
  "hint": "Два яруса города: порт и набережные внизу, деловой центр на холме +14 м. Три горбатых моста через реку, эстакада вдоль берега и развязка с банкованными дугами ведут на плато; оттуда — в западную иглу, по переходу между башнями и на её кровлю, где маяк.",
  "map": {
    "kind": "json2",
    "units": "meters",
    "ground": {
      "y": 0,
      "size": 600,
      "color": "#2a2d33"
    },
    "relief": {
      "baseY": 0,
      "maxSlope": 0.12,
      "blend": 14,
      "cell": 24,
      "hills": [
        {
          "id": "basin_lowland",
          "x": -340,
          "z": -135.5,
          "bx": 340,
          "bz": -135.5,
          "radius": 344,
          "height": -7.37
        },
        {
          "id": "trough_foot",
          "x": -340,
          "z": -30.6,
          "bx": 340,
          "bz": -30.6,
          "radius": 172,
          "height": -2.37
        },
        {
          "id": "scarp_south",
          "x": -340,
          "z": -36.2,
          "bx": 340,
          "bz": -36.2,
          "radius": 524,
          "height": 6.05
        },
        {
          "id": "plateau_bench",
          "x": -340,
          "z": 46.3,
          "bx": 340,
          "bz": 46.3,
          "radius": 514,
          "height": 3.66
        },
        {
          "id": "plateau_crest",
          "x": -340,
          "z": 244.6,
          "bx": 340,
          "bz": 244.6,
          "radius": 360,
          "height": 8.65
        },
        {
          "id": "ridge_far_north",
          "x": -340,
          "z": 363.8,
          "bx": 340,
          "bz": 363.8,
          "radius": 185,
          "height": 3.61
        }
      ],
      "pads": [
        {
          "id": "lowland_port",
          "minX": -300,
          "maxX": 300,
          "minZ": -300,
          "maxZ": -60,
          "y": 0,
          "blend": 53.905
        },
        {
          "id": "plate_front",
          "minX": -50,
          "maxX": 100,
          "minZ": 122,
          "maxZ": 152,
          "y": 14.783,
          "blend": 120
        },
        {
          "id": "sind:терраса",
          "minX": -288,
          "maxX": -100,
          "minZ": -294,
          "maxZ": -176,
          "y": 0,
          "blend": 14
        },
        {
          "id": "skit:терраса",
          "minX": 62.212,
          "maxX": 290.213,
          "minZ": -271.272,
          "maxZ": -207.271,
          "y": 0,
          "blend": 14,
          "yaw": -14
        },
        {
          "id": "nkab:терраса",
          "minX": -278.448,
          "maxX": -120.447,
          "minZ": 147.301,
          "maxZ": 265.302,
          "y": 14.771,
          "blend": 120,
          "yaw": 22
        },
        {
          "id": "ncc:терраса",
          "minX": -27.851,
          "maxX": 226.149,
          "minZ": 152.129,
          "maxZ": 270.13,
          "y": 14.783,
          "blend": 26.825,
          "yaw": -8
        },
        {
          "id": "corp_needle_a:площадка",
          "minX": -34,
          "maxX": -12,
          "minZ": 127,
          "maxZ": 149,
          "y": 14.783,
          "blend": 14
        },
        {
          "id": "corp_needle_b:площадка",
          "minX": 6,
          "maxX": 28,
          "minZ": 127,
          "maxZ": 149,
          "y": 14.783,
          "blend": 14
        },
        {
          "id": "corp_needle_c:площадка",
          "minX": 70,
          "maxX": 92,
          "minZ": 127,
          "maxZ": 149,
          "y": 14.783,
          "blend": 14,
          "yaw": 12
        }
      ]
    },
    "bounds": {
      "minX": -330.35,
      "maxX": 330.35,
      "minZ": -300,
      "maxZ": 300
    },
    "spawn": {
      "x": -200,
      "z": -160
    },
    "buildings": [
      {
        "id": "corp_needle_a",
        "name": "Игла западная",
        "isEnterable": true,
        "baseY": 14.783,
        "floorHeight": 4,
        "floorsCount": 6,
        "roofY": 38.783,
        "facadeMaterial": "glass_steel",
        "roof": {
          "walkable": true,
          "parapet": 1.1
        },
        "footprint": [
          {
            "x": -34,
            "z": 127
          },
          {
            "x": -12,
            "z": 127
          },
          {
            "x": -12,
            "z": 149
          },
          {
            "x": -34,
            "z": 149
          }
        ],
        "bounds": {
          "minX": -34,
          "maxX": -12,
          "minZ": 127,
          "maxZ": 149
        },
        "rects": [
          {
            "minX": -34,
            "maxX": -12,
            "minZ": 127,
            "maxZ": 149
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -12.175,
            "maxX": -11.825,
            "minZ": 127,
            "maxZ": 149,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -34.175,
            "maxX": -33.825,
            "minZ": 127,
            "maxZ": 149,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -34,
            "maxX": -12,
            "minZ": 126.825,
            "maxZ": 127.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -34,
            "maxX": -12,
            "minZ": 148.825,
            "maxZ": 149.175,
            "facade": true
          }
        ],
        "rooms": [
          {
            "id": "corp_needle_a_r0",
            "type": "lobby",
            "floor": 0,
            "rect": {
              "minX": -34,
              "maxX": -12,
              "minZ": 127,
              "maxZ": 149
            },
            "y": 14.783
          },
          {
            "id": "corp_needle_a_r1",
            "type": "office",
            "floor": 1,
            "rect": {
              "minX": -34,
              "maxX": -12,
              "minZ": 127,
              "maxZ": 149
            },
            "y": 18.783
          },
          {
            "id": "corp_needle_a_r2",
            "type": "office",
            "floor": 2,
            "rect": {
              "minX": -34,
              "maxX": -12,
              "minZ": 127,
              "maxZ": 149
            },
            "y": 22.783
          },
          {
            "id": "corp_needle_a_r3",
            "type": "utility",
            "floor": 3,
            "rect": {
              "minX": -34,
              "maxX": -12,
              "minZ": 127,
              "maxZ": 149
            },
            "y": 26.783
          },
          {
            "id": "corp_needle_a_r4",
            "type": "office",
            "floor": 4,
            "rect": {
              "minX": -34,
              "maxX": -12,
              "minZ": 127,
              "maxZ": 149
            },
            "y": 30.783
          },
          {
            "id": "corp_needle_a_r5",
            "type": "office",
            "floor": 5,
            "rect": {
              "minX": -34,
              "maxX": -12,
              "minZ": 127,
              "maxZ": 149
            },
            "y": 34.783
          }
        ],
        "stairs": [
          {
            "id": "corp_needle_a_roof",
            "type": "ladder",
            "connectsFloors": [
              5,
              6
            ],
            "y0": 34.783,
            "y1": 38.783,
            "height": 4,
            "rotation": 0,
            "rect": {
              "minX": -28.7,
              "maxX": -27.3,
              "minZ": 137.3,
              "maxZ": 138.70000000000002
            },
            "steps": [
              {
                "minX": -28.7,
                "maxX": -27.3,
                "minZ": 137.3,
                "maxZ": 138.7,
                "top": 35.283
              },
              {
                "minX": -28.7,
                "maxX": -27.3,
                "minZ": 137.3,
                "maxZ": 138.7,
                "top": 35.783
              },
              {
                "minX": -28.7,
                "maxX": -27.3,
                "minZ": 137.3,
                "maxZ": 138.7,
                "top": 36.283
              },
              {
                "minX": -28.7,
                "maxX": -27.3,
                "minZ": 137.3,
                "maxZ": 138.7,
                "top": 36.783
              },
              {
                "minX": -28.7,
                "maxX": -27.3,
                "minZ": 137.3,
                "maxZ": 138.7,
                "top": 37.283
              },
              {
                "minX": -28.7,
                "maxX": -27.3,
                "minZ": 137.3,
                "maxZ": 138.7,
                "top": 37.783
              },
              {
                "minX": -28.7,
                "maxX": -27.3,
                "minZ": 137.3,
                "maxZ": 138.7,
                "top": 38.283
              }
            ],
            "bottom": {
              "x": -28,
              "z": 138,
              "y": 35.283
            },
            "top": {
              "x": -28,
              "z": 138,
              "y": 38.283
            }
          },
          {
            "id": "corp_needle_a_s0",
            "type": "straight",
            "connectsFloors": [
              0,
              1
            ],
            "y0": 14.783,
            "y1": 18.783,
            "height": 4,
            "rotation": 0,
            "rect": {
              "minX": -31,
              "maxX": -25,
              "minZ": 141,
              "maxZ": 145
            },
            "steps": [
              {
                "minX": -31,
                "maxX": -30.25,
                "minZ": 141,
                "maxZ": 145,
                "top": 15.283
              },
              {
                "minX": -30.25,
                "maxX": -29.5,
                "minZ": 141,
                "maxZ": 145,
                "top": 15.783
              },
              {
                "minX": -29.5,
                "maxX": -28.75,
                "minZ": 141,
                "maxZ": 145,
                "top": 16.283
              },
              {
                "minX": -28.75,
                "maxX": -28,
                "minZ": 141,
                "maxZ": 145,
                "top": 16.783
              },
              {
                "minX": -28,
                "maxX": -27.25,
                "minZ": 141,
                "maxZ": 145,
                "top": 17.283
              },
              {
                "minX": -27.25,
                "maxX": -26.5,
                "minZ": 141,
                "maxZ": 145,
                "top": 17.783
              },
              {
                "minX": -26.5,
                "maxX": -25.75,
                "minZ": 141,
                "maxZ": 145,
                "top": 18.283
              },
              {
                "minX": -25.75,
                "maxX": -25,
                "minZ": 141,
                "maxZ": 145,
                "top": 18.783
              }
            ],
            "bottom": {
              "x": -30.625,
              "z": 143,
              "y": 15.283
            },
            "top": {
              "x": -25.375,
              "z": 143,
              "y": 18.783
            }
          },
          {
            "id": "corp_needle_a_s1",
            "type": "straight",
            "connectsFloors": [
              1,
              2
            ],
            "y0": 18.783,
            "y1": 22.783,
            "height": 4,
            "rotation": 0,
            "rect": {
              "minX": -21,
              "maxX": -15,
              "minZ": 131,
              "maxZ": 135
            },
            "steps": [
              {
                "minX": -21,
                "maxX": -20.25,
                "minZ": 131,
                "maxZ": 135,
                "top": 19.283
              },
              {
                "minX": -20.25,
                "maxX": -19.5,
                "minZ": 131,
                "maxZ": 135,
                "top": 19.783
              },
              {
                "minX": -19.5,
                "maxX": -18.75,
                "minZ": 131,
                "maxZ": 135,
                "top": 20.283
              },
              {
                "minX": -18.75,
                "maxX": -18,
                "minZ": 131,
                "maxZ": 135,
                "top": 20.783
              },
              {
                "minX": -18,
                "maxX": -17.25,
                "minZ": 131,
                "maxZ": 135,
                "top": 21.283
              },
              {
                "minX": -17.25,
                "maxX": -16.5,
                "minZ": 131,
                "maxZ": 135,
                "top": 21.783
              },
              {
                "minX": -16.5,
                "maxX": -15.75,
                "minZ": 131,
                "maxZ": 135,
                "top": 22.283
              },
              {
                "minX": -15.75,
                "maxX": -15,
                "minZ": 131,
                "maxZ": 135,
                "top": 22.783
              }
            ],
            "bottom": {
              "x": -20.625,
              "z": 133,
              "y": 19.283
            },
            "top": {
              "x": -15.375,
              "z": 133,
              "y": 22.783
            }
          },
          {
            "id": "corp_needle_a_s2",
            "type": "straight",
            "connectsFloors": [
              2,
              3
            ],
            "y0": 22.783,
            "y1": 26.783,
            "height": 4,
            "rotation": 0,
            "rect": {
              "minX": -31,
              "maxX": -25,
              "minZ": 141,
              "maxZ": 145
            },
            "steps": [
              {
                "minX": -31,
                "maxX": -30.25,
                "minZ": 141,
                "maxZ": 145,
                "top": 23.283
              },
              {
                "minX": -30.25,
                "maxX": -29.5,
                "minZ": 141,
                "maxZ": 145,
                "top": 23.783
              },
              {
                "minX": -29.5,
                "maxX": -28.75,
                "minZ": 141,
                "maxZ": 145,
                "top": 24.283
              },
              {
                "minX": -28.75,
                "maxX": -28,
                "minZ": 141,
                "maxZ": 145,
                "top": 24.783
              },
              {
                "minX": -28,
                "maxX": -27.25,
                "minZ": 141,
                "maxZ": 145,
                "top": 25.283
              },
              {
                "minX": -27.25,
                "maxX": -26.5,
                "minZ": 141,
                "maxZ": 145,
                "top": 25.783
              },
              {
                "minX": -26.5,
                "maxX": -25.75,
                "minZ": 141,
                "maxZ": 145,
                "top": 26.283
              },
              {
                "minX": -25.75,
                "maxX": -25,
                "minZ": 141,
                "maxZ": 145,
                "top": 26.783
              }
            ],
            "bottom": {
              "x": -30.625,
              "z": 143,
              "y": 23.283
            },
            "top": {
              "x": -25.375,
              "z": 143,
              "y": 26.783
            }
          },
          {
            "id": "corp_needle_a_s3",
            "type": "straight",
            "connectsFloors": [
              3,
              4
            ],
            "y0": 26.783,
            "y1": 30.783,
            "height": 4,
            "rotation": 0,
            "rect": {
              "minX": -21,
              "maxX": -15,
              "minZ": 131,
              "maxZ": 135
            },
            "steps": [
              {
                "minX": -21,
                "maxX": -20.25,
                "minZ": 131,
                "maxZ": 135,
                "top": 27.283
              },
              {
                "minX": -20.25,
                "maxX": -19.5,
                "minZ": 131,
                "maxZ": 135,
                "top": 27.783
              },
              {
                "minX": -19.5,
                "maxX": -18.75,
                "minZ": 131,
                "maxZ": 135,
                "top": 28.283
              },
              {
                "minX": -18.75,
                "maxX": -18,
                "minZ": 131,
                "maxZ": 135,
                "top": 28.783
              },
              {
                "minX": -18,
                "maxX": -17.25,
                "minZ": 131,
                "maxZ": 135,
                "top": 29.283
              },
              {
                "minX": -17.25,
                "maxX": -16.5,
                "minZ": 131,
                "maxZ": 135,
                "top": 29.783
              },
              {
                "minX": -16.5,
                "maxX": -15.75,
                "minZ": 131,
                "maxZ": 135,
                "top": 30.283
              },
              {
                "minX": -15.75,
                "maxX": -15,
                "minZ": 131,
                "maxZ": 135,
                "top": 30.783
              }
            ],
            "bottom": {
              "x": -20.625,
              "z": 133,
              "y": 27.283
            },
            "top": {
              "x": -15.375,
              "z": 133,
              "y": 30.783
            }
          },
          {
            "id": "corp_needle_a_s4",
            "type": "straight",
            "connectsFloors": [
              4,
              5
            ],
            "y0": 30.783,
            "y1": 34.783,
            "height": 4,
            "rotation": 0,
            "rect": {
              "minX": -31,
              "maxX": -25,
              "minZ": 141,
              "maxZ": 145
            },
            "steps": [
              {
                "minX": -31,
                "maxX": -30.25,
                "minZ": 141,
                "maxZ": 145,
                "top": 31.283
              },
              {
                "minX": -30.25,
                "maxX": -29.5,
                "minZ": 141,
                "maxZ": 145,
                "top": 31.783
              },
              {
                "minX": -29.5,
                "maxX": -28.75,
                "minZ": 141,
                "maxZ": 145,
                "top": 32.283
              },
              {
                "minX": -28.75,
                "maxX": -28,
                "minZ": 141,
                "maxZ": 145,
                "top": 32.783
              },
              {
                "minX": -28,
                "maxX": -27.25,
                "minZ": 141,
                "maxZ": 145,
                "top": 33.283
              },
              {
                "minX": -27.25,
                "maxX": -26.5,
                "minZ": 141,
                "maxZ": 145,
                "top": 33.783
              },
              {
                "minX": -26.5,
                "maxX": -25.75,
                "minZ": 141,
                "maxZ": 145,
                "top": 34.283
              },
              {
                "minX": -25.75,
                "maxX": -25,
                "minZ": 141,
                "maxZ": 145,
                "top": 34.783
              }
            ],
            "bottom": {
              "x": -30.625,
              "z": 143,
              "y": 31.283
            },
            "top": {
              "x": -25.375,
              "z": 143,
              "y": 34.783
            }
          }
        ],
        "doors": [
          {
            "id": "corp_needle_a_r0→rd_plate_ave",
            "room": "corp_needle_a_r0",
            "target": "rd_plate_ave",
            "linkType": "main_entrance",
            "axis": "x",
            "y": 14.783,
            "height": 2.1,
            "rect": {
              "minX": -23.9,
              "maxX": -22.1,
              "minZ": 126.815,
              "maxZ": 127.185
            },
            "inside": {
              "x": -23,
              "z": 128.4
            },
            "outside": {
              "x": -23,
              "z": 125.6
            }
          },
          {
            "id": "corp_needle_a_r4→sb_needles",
            "room": "corp_needle_a_r4",
            "target": "sb_needles",
            "linkType": "door",
            "axis": "z",
            "y": 30.783,
            "height": 2.1,
            "rect": {
              "minX": -12.185,
              "maxX": -11.815,
              "minZ": 137.1,
              "maxZ": 138.9
            },
            "inside": {
              "x": -13.4,
              "z": 138
            },
            "outside": {
              "x": -10.6,
              "z": 138
            }
          }
        ]
      },
      {
        "id": "corp_needle_b",
        "name": "Игла восточная",
        "isEnterable": true,
        "baseY": 14.783,
        "floorHeight": 4,
        "floorsCount": 8,
        "roofY": 46.783,
        "facadeMaterial": "glass_steel",
        "roof": {
          "walkable": true,
          "parapet": 1.1
        },
        "footprint": [
          {
            "x": 6,
            "z": 127
          },
          {
            "x": 28,
            "z": 127
          },
          {
            "x": 28,
            "z": 149
          },
          {
            "x": 6,
            "z": 149
          }
        ],
        "bounds": {
          "minX": 6,
          "maxX": 28,
          "minZ": 127,
          "maxZ": 149
        },
        "rects": [
          {
            "minX": 6,
            "maxX": 28,
            "minZ": 127,
            "maxZ": 149
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 27.825,
            "maxX": 28.175,
            "minZ": 127,
            "maxZ": 149,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 5.825,
            "maxX": 6.175,
            "minZ": 127,
            "maxZ": 149,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 6,
            "maxX": 28,
            "minZ": 126.825,
            "maxZ": 127.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 6,
            "maxX": 28,
            "minZ": 148.825,
            "maxZ": 149.175,
            "facade": true
          }
        ],
        "rooms": [
          {
            "id": "corp_needle_b_r0",
            "type": "lobby",
            "floor": 0,
            "rect": {
              "minX": 6,
              "maxX": 28,
              "minZ": 127,
              "maxZ": 149
            },
            "y": 14.783
          },
          {
            "id": "corp_needle_b_r1",
            "type": "office",
            "floor": 1,
            "rect": {
              "minX": 6,
              "maxX": 28,
              "minZ": 127,
              "maxZ": 149
            },
            "y": 18.783
          },
          {
            "id": "corp_needle_b_r2",
            "type": "office",
            "floor": 2,
            "rect": {
              "minX": 6,
              "maxX": 28,
              "minZ": 127,
              "maxZ": 149
            },
            "y": 22.783
          },
          {
            "id": "corp_needle_b_r3",
            "type": "utility",
            "floor": 3,
            "rect": {
              "minX": 6,
              "maxX": 28,
              "minZ": 127,
              "maxZ": 149
            },
            "y": 26.783
          },
          {
            "id": "corp_needle_b_r4",
            "type": "office",
            "floor": 4,
            "rect": {
              "minX": 6,
              "maxX": 28,
              "minZ": 127,
              "maxZ": 149
            },
            "y": 30.783
          },
          {
            "id": "corp_needle_b_r5",
            "type": "office",
            "floor": 5,
            "rect": {
              "minX": 6,
              "maxX": 28,
              "minZ": 127,
              "maxZ": 149
            },
            "y": 34.783
          },
          {
            "id": "corp_needle_b_r6",
            "type": "office",
            "floor": 6,
            "rect": {
              "minX": 6,
              "maxX": 28,
              "minZ": 127,
              "maxZ": 149
            },
            "y": 38.783
          },
          {
            "id": "corp_needle_b_r7",
            "type": "utility",
            "floor": 7,
            "rect": {
              "minX": 6,
              "maxX": 28,
              "minZ": 127,
              "maxZ": 149
            },
            "y": 42.783
          }
        ],
        "stairs": [
          {
            "id": "corp_needle_b_roof",
            "type": "ladder",
            "connectsFloors": [
              7,
              8
            ],
            "y0": 42.783,
            "y1": 46.783,
            "height": 4,
            "rotation": 0,
            "rect": {
              "minX": 21.3,
              "maxX": 22.7,
              "minZ": 137.3,
              "maxZ": 138.70000000000002
            },
            "steps": [
              {
                "minX": 21.3,
                "maxX": 22.7,
                "minZ": 137.3,
                "maxZ": 138.7,
                "top": 43.283
              },
              {
                "minX": 21.3,
                "maxX": 22.7,
                "minZ": 137.3,
                "maxZ": 138.7,
                "top": 43.783
              },
              {
                "minX": 21.3,
                "maxX": 22.7,
                "minZ": 137.3,
                "maxZ": 138.7,
                "top": 44.283
              },
              {
                "minX": 21.3,
                "maxX": 22.7,
                "minZ": 137.3,
                "maxZ": 138.7,
                "top": 44.783
              },
              {
                "minX": 21.3,
                "maxX": 22.7,
                "minZ": 137.3,
                "maxZ": 138.7,
                "top": 45.283
              },
              {
                "minX": 21.3,
                "maxX": 22.7,
                "minZ": 137.3,
                "maxZ": 138.7,
                "top": 45.783
              },
              {
                "minX": 21.3,
                "maxX": 22.7,
                "minZ": 137.3,
                "maxZ": 138.7,
                "top": 46.283
              }
            ],
            "bottom": {
              "x": 22,
              "z": 138,
              "y": 43.283
            },
            "top": {
              "x": 22,
              "z": 138,
              "y": 46.283
            }
          },
          {
            "id": "corp_needle_b_s0",
            "type": "straight",
            "connectsFloors": [
              0,
              1
            ],
            "y0": 14.783,
            "y1": 18.783,
            "height": 4,
            "rotation": 0,
            "rect": {
              "minX": 9,
              "maxX": 15,
              "minZ": 141,
              "maxZ": 145
            },
            "steps": [
              {
                "minX": 9,
                "maxX": 9.75,
                "minZ": 141,
                "maxZ": 145,
                "top": 15.283
              },
              {
                "minX": 9.75,
                "maxX": 10.5,
                "minZ": 141,
                "maxZ": 145,
                "top": 15.783
              },
              {
                "minX": 10.5,
                "maxX": 11.25,
                "minZ": 141,
                "maxZ": 145,
                "top": 16.283
              },
              {
                "minX": 11.25,
                "maxX": 12,
                "minZ": 141,
                "maxZ": 145,
                "top": 16.783
              },
              {
                "minX": 12,
                "maxX": 12.75,
                "minZ": 141,
                "maxZ": 145,
                "top": 17.283
              },
              {
                "minX": 12.75,
                "maxX": 13.5,
                "minZ": 141,
                "maxZ": 145,
                "top": 17.783
              },
              {
                "minX": 13.5,
                "maxX": 14.25,
                "minZ": 141,
                "maxZ": 145,
                "top": 18.283
              },
              {
                "minX": 14.25,
                "maxX": 15,
                "minZ": 141,
                "maxZ": 145,
                "top": 18.783
              }
            ],
            "bottom": {
              "x": 9.375,
              "z": 143,
              "y": 15.283
            },
            "top": {
              "x": 14.625,
              "z": 143,
              "y": 18.783
            }
          },
          {
            "id": "corp_needle_b_s1",
            "type": "straight",
            "connectsFloors": [
              1,
              2
            ],
            "y0": 18.783,
            "y1": 22.783,
            "height": 4,
            "rotation": 0,
            "rect": {
              "minX": 19,
              "maxX": 25,
              "minZ": 131,
              "maxZ": 135
            },
            "steps": [
              {
                "minX": 19,
                "maxX": 19.75,
                "minZ": 131,
                "maxZ": 135,
                "top": 19.283
              },
              {
                "minX": 19.75,
                "maxX": 20.5,
                "minZ": 131,
                "maxZ": 135,
                "top": 19.783
              },
              {
                "minX": 20.5,
                "maxX": 21.25,
                "minZ": 131,
                "maxZ": 135,
                "top": 20.283
              },
              {
                "minX": 21.25,
                "maxX": 22,
                "minZ": 131,
                "maxZ": 135,
                "top": 20.783
              },
              {
                "minX": 22,
                "maxX": 22.75,
                "minZ": 131,
                "maxZ": 135,
                "top": 21.283
              },
              {
                "minX": 22.75,
                "maxX": 23.5,
                "minZ": 131,
                "maxZ": 135,
                "top": 21.783
              },
              {
                "minX": 23.5,
                "maxX": 24.25,
                "minZ": 131,
                "maxZ": 135,
                "top": 22.283
              },
              {
                "minX": 24.25,
                "maxX": 25,
                "minZ": 131,
                "maxZ": 135,
                "top": 22.783
              }
            ],
            "bottom": {
              "x": 19.375,
              "z": 133,
              "y": 19.283
            },
            "top": {
              "x": 24.625,
              "z": 133,
              "y": 22.783
            }
          },
          {
            "id": "corp_needle_b_s2",
            "type": "straight",
            "connectsFloors": [
              2,
              3
            ],
            "y0": 22.783,
            "y1": 26.783,
            "height": 4,
            "rotation": 0,
            "rect": {
              "minX": 9,
              "maxX": 15,
              "minZ": 141,
              "maxZ": 145
            },
            "steps": [
              {
                "minX": 9,
                "maxX": 9.75,
                "minZ": 141,
                "maxZ": 145,
                "top": 23.283
              },
              {
                "minX": 9.75,
                "maxX": 10.5,
                "minZ": 141,
                "maxZ": 145,
                "top": 23.783
              },
              {
                "minX": 10.5,
                "maxX": 11.25,
                "minZ": 141,
                "maxZ": 145,
                "top": 24.283
              },
              {
                "minX": 11.25,
                "maxX": 12,
                "minZ": 141,
                "maxZ": 145,
                "top": 24.783
              },
              {
                "minX": 12,
                "maxX": 12.75,
                "minZ": 141,
                "maxZ": 145,
                "top": 25.283
              },
              {
                "minX": 12.75,
                "maxX": 13.5,
                "minZ": 141,
                "maxZ": 145,
                "top": 25.783
              },
              {
                "minX": 13.5,
                "maxX": 14.25,
                "minZ": 141,
                "maxZ": 145,
                "top": 26.283
              },
              {
                "minX": 14.25,
                "maxX": 15,
                "minZ": 141,
                "maxZ": 145,
                "top": 26.783
              }
            ],
            "bottom": {
              "x": 9.375,
              "z": 143,
              "y": 23.283
            },
            "top": {
              "x": 14.625,
              "z": 143,
              "y": 26.783
            }
          },
          {
            "id": "corp_needle_b_s3",
            "type": "straight",
            "connectsFloors": [
              3,
              4
            ],
            "y0": 26.783,
            "y1": 30.783,
            "height": 4,
            "rotation": 0,
            "rect": {
              "minX": 19,
              "maxX": 25,
              "minZ": 131,
              "maxZ": 135
            },
            "steps": [
              {
                "minX": 19,
                "maxX": 19.75,
                "minZ": 131,
                "maxZ": 135,
                "top": 27.283
              },
              {
                "minX": 19.75,
                "maxX": 20.5,
                "minZ": 131,
                "maxZ": 135,
                "top": 27.783
              },
              {
                "minX": 20.5,
                "maxX": 21.25,
                "minZ": 131,
                "maxZ": 135,
                "top": 28.283
              },
              {
                "minX": 21.25,
                "maxX": 22,
                "minZ": 131,
                "maxZ": 135,
                "top": 28.783
              },
              {
                "minX": 22,
                "maxX": 22.75,
                "minZ": 131,
                "maxZ": 135,
                "top": 29.283
              },
              {
                "minX": 22.75,
                "maxX": 23.5,
                "minZ": 131,
                "maxZ": 135,
                "top": 29.783
              },
              {
                "minX": 23.5,
                "maxX": 24.25,
                "minZ": 131,
                "maxZ": 135,
                "top": 30.283
              },
              {
                "minX": 24.25,
                "maxX": 25,
                "minZ": 131,
                "maxZ": 135,
                "top": 30.783
              }
            ],
            "bottom": {
              "x": 19.375,
              "z": 133,
              "y": 27.283
            },
            "top": {
              "x": 24.625,
              "z": 133,
              "y": 30.783
            }
          },
          {
            "id": "corp_needle_b_s4",
            "type": "straight",
            "connectsFloors": [
              4,
              5
            ],
            "y0": 30.783,
            "y1": 34.783,
            "height": 4,
            "rotation": 0,
            "rect": {
              "minX": 9,
              "maxX": 15,
              "minZ": 141,
              "maxZ": 145
            },
            "steps": [
              {
                "minX": 9,
                "maxX": 9.75,
                "minZ": 141,
                "maxZ": 145,
                "top": 31.283
              },
              {
                "minX": 9.75,
                "maxX": 10.5,
                "minZ": 141,
                "maxZ": 145,
                "top": 31.783
              },
              {
                "minX": 10.5,
                "maxX": 11.25,
                "minZ": 141,
                "maxZ": 145,
                "top": 32.283
              },
              {
                "minX": 11.25,
                "maxX": 12,
                "minZ": 141,
                "maxZ": 145,
                "top": 32.783
              },
              {
                "minX": 12,
                "maxX": 12.75,
                "minZ": 141,
                "maxZ": 145,
                "top": 33.283
              },
              {
                "minX": 12.75,
                "maxX": 13.5,
                "minZ": 141,
                "maxZ": 145,
                "top": 33.783
              },
              {
                "minX": 13.5,
                "maxX": 14.25,
                "minZ": 141,
                "maxZ": 145,
                "top": 34.283
              },
              {
                "minX": 14.25,
                "maxX": 15,
                "minZ": 141,
                "maxZ": 145,
                "top": 34.783
              }
            ],
            "bottom": {
              "x": 9.375,
              "z": 143,
              "y": 31.283
            },
            "top": {
              "x": 14.625,
              "z": 143,
              "y": 34.783
            }
          },
          {
            "id": "corp_needle_b_s5",
            "type": "straight",
            "connectsFloors": [
              5,
              6
            ],
            "y0": 34.783,
            "y1": 38.783,
            "height": 4,
            "rotation": 0,
            "rect": {
              "minX": 19,
              "maxX": 25,
              "minZ": 131,
              "maxZ": 135
            },
            "steps": [
              {
                "minX": 19,
                "maxX": 19.75,
                "minZ": 131,
                "maxZ": 135,
                "top": 35.283
              },
              {
                "minX": 19.75,
                "maxX": 20.5,
                "minZ": 131,
                "maxZ": 135,
                "top": 35.783
              },
              {
                "minX": 20.5,
                "maxX": 21.25,
                "minZ": 131,
                "maxZ": 135,
                "top": 36.283
              },
              {
                "minX": 21.25,
                "maxX": 22,
                "minZ": 131,
                "maxZ": 135,
                "top": 36.783
              },
              {
                "minX": 22,
                "maxX": 22.75,
                "minZ": 131,
                "maxZ": 135,
                "top": 37.283
              },
              {
                "minX": 22.75,
                "maxX": 23.5,
                "minZ": 131,
                "maxZ": 135,
                "top": 37.783
              },
              {
                "minX": 23.5,
                "maxX": 24.25,
                "minZ": 131,
                "maxZ": 135,
                "top": 38.283
              },
              {
                "minX": 24.25,
                "maxX": 25,
                "minZ": 131,
                "maxZ": 135,
                "top": 38.783
              }
            ],
            "bottom": {
              "x": 19.375,
              "z": 133,
              "y": 35.283
            },
            "top": {
              "x": 24.625,
              "z": 133,
              "y": 38.783
            }
          },
          {
            "id": "corp_needle_b_s6",
            "type": "straight",
            "connectsFloors": [
              6,
              7
            ],
            "y0": 38.783,
            "y1": 42.783,
            "height": 4,
            "rotation": 0,
            "rect": {
              "minX": 9,
              "maxX": 15,
              "minZ": 141,
              "maxZ": 145
            },
            "steps": [
              {
                "minX": 9,
                "maxX": 9.75,
                "minZ": 141,
                "maxZ": 145,
                "top": 39.283
              },
              {
                "minX": 9.75,
                "maxX": 10.5,
                "minZ": 141,
                "maxZ": 145,
                "top": 39.783
              },
              {
                "minX": 10.5,
                "maxX": 11.25,
                "minZ": 141,
                "maxZ": 145,
                "top": 40.283
              },
              {
                "minX": 11.25,
                "maxX": 12,
                "minZ": 141,
                "maxZ": 145,
                "top": 40.783
              },
              {
                "minX": 12,
                "maxX": 12.75,
                "minZ": 141,
                "maxZ": 145,
                "top": 41.283
              },
              {
                "minX": 12.75,
                "maxX": 13.5,
                "minZ": 141,
                "maxZ": 145,
                "top": 41.783
              },
              {
                "minX": 13.5,
                "maxX": 14.25,
                "minZ": 141,
                "maxZ": 145,
                "top": 42.283
              },
              {
                "minX": 14.25,
                "maxX": 15,
                "minZ": 141,
                "maxZ": 145,
                "top": 42.783
              }
            ],
            "bottom": {
              "x": 9.375,
              "z": 143,
              "y": 39.283
            },
            "top": {
              "x": 14.625,
              "z": 143,
              "y": 42.783
            }
          }
        ],
        "doors": [
          {
            "id": "corp_needle_b_r0→rd_plate_ave",
            "room": "corp_needle_b_r0",
            "target": "rd_plate_ave",
            "linkType": "main_entrance",
            "axis": "x",
            "y": 14.783,
            "height": 2.1,
            "rect": {
              "minX": 16.1,
              "maxX": 17.9,
              "minZ": 126.815,
              "maxZ": 127.185
            },
            "inside": {
              "x": 17,
              "z": 128.4
            },
            "outside": {
              "x": 17,
              "z": 125.6
            }
          },
          {
            "id": "corp_needle_b_r4→sb_needles",
            "room": "corp_needle_b_r4",
            "target": "sb_needles",
            "linkType": "door",
            "axis": "z",
            "y": 30.783,
            "height": 2.1,
            "rect": {
              "minX": 5.815,
              "maxX": 6.185,
              "minZ": 137.1,
              "maxZ": 138.9
            },
            "inside": {
              "x": 7.4,
              "z": 138
            },
            "outside": {
              "x": 4.6,
              "z": 138
            }
          }
        ]
      },
      {
        "id": "corp_needle_c",
        "name": "Башня под углом",
        "isEnterable": true,
        "baseY": 14.783,
        "floorHeight": 4,
        "floorsCount": 5,
        "roofY": 34.783,
        "facadeMaterial": "glass_steel",
        "roof": {
          "walkable": true,
          "parapet": 1.1
        },
        "footprint": [
          {
            "x": 70,
            "z": 127
          },
          {
            "x": 92,
            "z": 127
          },
          {
            "x": 92,
            "z": 149
          },
          {
            "x": 70,
            "z": 149
          }
        ],
        "bounds": {
          "minX": 70,
          "maxX": 92,
          "minZ": 127,
          "maxZ": 149
        },
        "rotation": 12,
        "rects": [
          {
            "minX": 70,
            "maxX": 92,
            "minZ": 127,
            "maxZ": 149
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 69.825,
            "maxX": 70.175,
            "minZ": 127,
            "maxZ": 149,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 70,
            "maxX": 92,
            "minZ": 126.825,
            "maxZ": 127.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 70,
            "maxX": 92,
            "minZ": 148.825,
            "maxZ": 149.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 91.825,
            "maxX": 92.175,
            "minZ": 127,
            "maxZ": 149,
            "facade": true
          }
        ],
        "rooms": [
          {
            "id": "corp_needle_c_r0",
            "type": "lobby",
            "floor": 0,
            "rect": {
              "minX": 70,
              "maxX": 92,
              "minZ": 127,
              "maxZ": 149
            },
            "y": 14.783
          },
          {
            "id": "corp_needle_c_r1",
            "type": "office",
            "floor": 1,
            "rect": {
              "minX": 70,
              "maxX": 92,
              "minZ": 127,
              "maxZ": 149
            },
            "y": 18.783
          },
          {
            "id": "corp_needle_c_r2",
            "type": "office",
            "floor": 2,
            "rect": {
              "minX": 70,
              "maxX": 92,
              "minZ": 127,
              "maxZ": 149
            },
            "y": 22.783
          },
          {
            "id": "corp_needle_c_r3",
            "type": "utility",
            "floor": 3,
            "rect": {
              "minX": 70,
              "maxX": 92,
              "minZ": 127,
              "maxZ": 149
            },
            "y": 26.783
          },
          {
            "id": "corp_needle_c_r4",
            "type": "office",
            "floor": 4,
            "rect": {
              "minX": 70,
              "maxX": 92,
              "minZ": 127,
              "maxZ": 149
            },
            "y": 30.783
          }
        ],
        "stairs": [
          {
            "id": "corp_needle_c_roof",
            "type": "ladder",
            "connectsFloors": [
              4,
              5
            ],
            "y0": 30.783,
            "y1": 34.783,
            "height": 4,
            "rotation": 0,
            "rect": {
              "minX": 85.3,
              "maxX": 86.7,
              "minZ": 137.3,
              "maxZ": 138.70000000000002
            },
            "steps": [
              {
                "minX": 85.3,
                "maxX": 86.7,
                "minZ": 137.3,
                "maxZ": 138.7,
                "top": 31.283
              },
              {
                "minX": 85.3,
                "maxX": 86.7,
                "minZ": 137.3,
                "maxZ": 138.7,
                "top": 31.783
              },
              {
                "minX": 85.3,
                "maxX": 86.7,
                "minZ": 137.3,
                "maxZ": 138.7,
                "top": 32.283
              },
              {
                "minX": 85.3,
                "maxX": 86.7,
                "minZ": 137.3,
                "maxZ": 138.7,
                "top": 32.783
              },
              {
                "minX": 85.3,
                "maxX": 86.7,
                "minZ": 137.3,
                "maxZ": 138.7,
                "top": 33.283
              },
              {
                "minX": 85.3,
                "maxX": 86.7,
                "minZ": 137.3,
                "maxZ": 138.7,
                "top": 33.783
              },
              {
                "minX": 85.3,
                "maxX": 86.7,
                "minZ": 137.3,
                "maxZ": 138.7,
                "top": 34.283
              }
            ],
            "bottom": {
              "x": 86,
              "z": 138,
              "y": 31.283
            },
            "top": {
              "x": 86,
              "z": 138,
              "y": 34.283
            }
          },
          {
            "id": "corp_needle_c_s0",
            "type": "straight",
            "connectsFloors": [
              0,
              1
            ],
            "y0": 14.783,
            "y1": 18.783,
            "height": 4,
            "rotation": 0,
            "rect": {
              "minX": 73,
              "maxX": 79,
              "minZ": 141,
              "maxZ": 145
            },
            "steps": [
              {
                "minX": 73,
                "maxX": 73.75,
                "minZ": 141,
                "maxZ": 145,
                "top": 15.283
              },
              {
                "minX": 73.75,
                "maxX": 74.5,
                "minZ": 141,
                "maxZ": 145,
                "top": 15.783
              },
              {
                "minX": 74.5,
                "maxX": 75.25,
                "minZ": 141,
                "maxZ": 145,
                "top": 16.283
              },
              {
                "minX": 75.25,
                "maxX": 76,
                "minZ": 141,
                "maxZ": 145,
                "top": 16.783
              },
              {
                "minX": 76,
                "maxX": 76.75,
                "minZ": 141,
                "maxZ": 145,
                "top": 17.283
              },
              {
                "minX": 76.75,
                "maxX": 77.5,
                "minZ": 141,
                "maxZ": 145,
                "top": 17.783
              },
              {
                "minX": 77.5,
                "maxX": 78.25,
                "minZ": 141,
                "maxZ": 145,
                "top": 18.283
              },
              {
                "minX": 78.25,
                "maxX": 79,
                "minZ": 141,
                "maxZ": 145,
                "top": 18.783
              }
            ],
            "bottom": {
              "x": 73.375,
              "z": 143,
              "y": 15.283
            },
            "top": {
              "x": 78.625,
              "z": 143,
              "y": 18.783
            }
          },
          {
            "id": "corp_needle_c_s1",
            "type": "straight",
            "connectsFloors": [
              1,
              2
            ],
            "y0": 18.783,
            "y1": 22.783,
            "height": 4,
            "rotation": 0,
            "rect": {
              "minX": 83,
              "maxX": 89,
              "minZ": 131,
              "maxZ": 135
            },
            "steps": [
              {
                "minX": 83,
                "maxX": 83.75,
                "minZ": 131,
                "maxZ": 135,
                "top": 19.283
              },
              {
                "minX": 83.75,
                "maxX": 84.5,
                "minZ": 131,
                "maxZ": 135,
                "top": 19.783
              },
              {
                "minX": 84.5,
                "maxX": 85.25,
                "minZ": 131,
                "maxZ": 135,
                "top": 20.283
              },
              {
                "minX": 85.25,
                "maxX": 86,
                "minZ": 131,
                "maxZ": 135,
                "top": 20.783
              },
              {
                "minX": 86,
                "maxX": 86.75,
                "minZ": 131,
                "maxZ": 135,
                "top": 21.283
              },
              {
                "minX": 86.75,
                "maxX": 87.5,
                "minZ": 131,
                "maxZ": 135,
                "top": 21.783
              },
              {
                "minX": 87.5,
                "maxX": 88.25,
                "minZ": 131,
                "maxZ": 135,
                "top": 22.283
              },
              {
                "minX": 88.25,
                "maxX": 89,
                "minZ": 131,
                "maxZ": 135,
                "top": 22.783
              }
            ],
            "bottom": {
              "x": 83.375,
              "z": 133,
              "y": 19.283
            },
            "top": {
              "x": 88.625,
              "z": 133,
              "y": 22.783
            }
          },
          {
            "id": "corp_needle_c_s2",
            "type": "straight",
            "connectsFloors": [
              2,
              3
            ],
            "y0": 22.783,
            "y1": 26.783,
            "height": 4,
            "rotation": 0,
            "rect": {
              "minX": 73,
              "maxX": 79,
              "minZ": 141,
              "maxZ": 145
            },
            "steps": [
              {
                "minX": 73,
                "maxX": 73.75,
                "minZ": 141,
                "maxZ": 145,
                "top": 23.283
              },
              {
                "minX": 73.75,
                "maxX": 74.5,
                "minZ": 141,
                "maxZ": 145,
                "top": 23.783
              },
              {
                "minX": 74.5,
                "maxX": 75.25,
                "minZ": 141,
                "maxZ": 145,
                "top": 24.283
              },
              {
                "minX": 75.25,
                "maxX": 76,
                "minZ": 141,
                "maxZ": 145,
                "top": 24.783
              },
              {
                "minX": 76,
                "maxX": 76.75,
                "minZ": 141,
                "maxZ": 145,
                "top": 25.283
              },
              {
                "minX": 76.75,
                "maxX": 77.5,
                "minZ": 141,
                "maxZ": 145,
                "top": 25.783
              },
              {
                "minX": 77.5,
                "maxX": 78.25,
                "minZ": 141,
                "maxZ": 145,
                "top": 26.283
              },
              {
                "minX": 78.25,
                "maxX": 79,
                "minZ": 141,
                "maxZ": 145,
                "top": 26.783
              }
            ],
            "bottom": {
              "x": 73.375,
              "z": 143,
              "y": 23.283
            },
            "top": {
              "x": 78.625,
              "z": 143,
              "y": 26.783
            }
          },
          {
            "id": "corp_needle_c_s3",
            "type": "straight",
            "connectsFloors": [
              3,
              4
            ],
            "y0": 26.783,
            "y1": 30.783,
            "height": 4,
            "rotation": 0,
            "rect": {
              "minX": 83,
              "maxX": 89,
              "minZ": 131,
              "maxZ": 135
            },
            "steps": [
              {
                "minX": 83,
                "maxX": 83.75,
                "minZ": 131,
                "maxZ": 135,
                "top": 27.283
              },
              {
                "minX": 83.75,
                "maxX": 84.5,
                "minZ": 131,
                "maxZ": 135,
                "top": 27.783
              },
              {
                "minX": 84.5,
                "maxX": 85.25,
                "minZ": 131,
                "maxZ": 135,
                "top": 28.283
              },
              {
                "minX": 85.25,
                "maxX": 86,
                "minZ": 131,
                "maxZ": 135,
                "top": 28.783
              },
              {
                "minX": 86,
                "maxX": 86.75,
                "minZ": 131,
                "maxZ": 135,
                "top": 29.283
              },
              {
                "minX": 86.75,
                "maxX": 87.5,
                "minZ": 131,
                "maxZ": 135,
                "top": 29.783
              },
              {
                "minX": 87.5,
                "maxX": 88.25,
                "minZ": 131,
                "maxZ": 135,
                "top": 30.283
              },
              {
                "minX": 88.25,
                "maxX": 89,
                "minZ": 131,
                "maxZ": 135,
                "top": 30.783
              }
            ],
            "bottom": {
              "x": 83.375,
              "z": 133,
              "y": 27.283
            },
            "top": {
              "x": 88.625,
              "z": 133,
              "y": 30.783
            }
          }
        ],
        "doors": [
          {
            "id": "corp_needle_c_r0→rd_plate_ave",
            "room": "corp_needle_c_r0",
            "target": "rd_plate_ave",
            "linkType": "main_entrance",
            "axis": "x",
            "y": 14.783,
            "height": 2.1,
            "rect": {
              "minX": 80.1,
              "maxX": 81.9,
              "minZ": 126.815,
              "maxZ": 127.185
            },
            "inside": {
              "x": 82.996,
              "z": 128.61
            },
            "outside": {
              "x": 83.578,
              "z": 125.871
            }
          }
        ]
      },
      {
        "id": "sind_001",
        "name": "sind_001",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.5,
        "floorsCount": 4,
        "roofY": 18,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -268,
            "z": -274
          },
          {
            "x": -248,
            "z": -274
          },
          {
            "x": -248,
            "z": -266
          },
          {
            "x": -268,
            "z": -266
          }
        ],
        "bounds": {
          "minX": -268,
          "maxX": -248,
          "minZ": -274,
          "maxZ": -266
        },
        "rects": [
          {
            "minX": -268,
            "maxX": -248,
            "minZ": -274,
            "maxZ": -266
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -248.175,
            "maxX": -247.825,
            "minZ": -274,
            "maxZ": -266,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -268.175,
            "maxX": -267.825,
            "minZ": -274,
            "maxZ": -266,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -268,
            "maxX": -248,
            "minZ": -266.175,
            "maxZ": -265.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -268,
            "maxX": -248,
            "minZ": -274.175,
            "maxZ": -273.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "sind_002_a",
        "name": "sind_002_a",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 5,
        "floorsCount": 3,
        "roofY": 15,
        "facadeMaterial": "panel_block",
        "footprint": [
          {
            "x": -268,
            "z": -262
          },
          {
            "x": -257.5,
            "z": -262
          },
          {
            "x": -257.5,
            "z": -254
          },
          {
            "x": -268,
            "z": -254
          }
        ],
        "bounds": {
          "minX": -268,
          "maxX": -257.5,
          "minZ": -262,
          "maxZ": -254
        },
        "rects": [
          {
            "minX": -268,
            "maxX": -257.5,
            "minZ": -262,
            "maxZ": -254
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -257.675,
            "maxX": -257.325,
            "minZ": -262,
            "maxZ": -254,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -268.175,
            "maxX": -267.825,
            "minZ": -262,
            "maxZ": -254,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -268,
            "maxX": -257.5,
            "minZ": -254.175,
            "maxZ": -253.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -268,
            "maxX": -257.5,
            "minZ": -262.175,
            "maxZ": -261.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "sind_002_b",
        "name": "sind_002_b",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.5,
        "floorsCount": 3,
        "roofY": 13.5,
        "facadeMaterial": "panel_block",
        "footprint": [
          {
            "x": -253.5,
            "z": -262
          },
          {
            "x": -248,
            "z": -262
          },
          {
            "x": -248,
            "z": -254
          },
          {
            "x": -253.5,
            "z": -254
          }
        ],
        "bounds": {
          "minX": -253.5,
          "maxX": -248,
          "minZ": -262,
          "maxZ": -254
        },
        "rects": [
          {
            "minX": -253.5,
            "maxX": -248,
            "minZ": -262,
            "maxZ": -254
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -248.175,
            "maxX": -247.825,
            "minZ": -262,
            "maxZ": -254,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -253.5,
            "maxX": -248,
            "minZ": -254.175,
            "maxZ": -253.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -253.5,
            "maxX": -248,
            "minZ": -262.175,
            "maxZ": -261.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -253.675,
            "maxX": -253.325,
            "minZ": -262,
            "maxZ": -254,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "sind_003",
        "name": "sind_003",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.5,
        "floorsCount": 4,
        "roofY": 18,
        "facadeMaterial": "rusted_metal",
        "footprint": [
          {
            "x": -220.5,
            "z": -274
          },
          {
            "x": -211.5,
            "z": -274
          },
          {
            "x": -211.5,
            "z": -266.5
          },
          {
            "x": -204,
            "z": -266.5
          },
          {
            "x": -204,
            "z": -258
          },
          {
            "x": -211.5,
            "z": -258
          },
          {
            "x": -211.5,
            "z": -254
          },
          {
            "x": -220.5,
            "z": -254
          },
          {
            "x": -220.5,
            "z": -258
          },
          {
            "x": -224,
            "z": -258
          },
          {
            "x": -224,
            "z": -266.5
          },
          {
            "x": -220.5,
            "z": -266.5
          }
        ],
        "bounds": {
          "minX": -224,
          "maxX": -204,
          "minZ": -274,
          "maxZ": -254
        },
        "rects": [
          {
            "minX": -220.5,
            "maxX": -211.5,
            "minZ": -258,
            "maxZ": -254
          },
          {
            "minX": -220.5,
            "maxX": -211.5,
            "minZ": -274,
            "maxZ": -266.5
          },
          {
            "minX": -224,
            "maxX": -204,
            "minZ": -266.5,
            "maxZ": -258
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -204.175,
            "maxX": -203.825,
            "minZ": -266.5,
            "maxZ": -258,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -211.5,
            "maxX": -204,
            "minZ": -258.175,
            "maxZ": -257.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -211.5,
            "maxX": -204,
            "minZ": -266.675,
            "maxZ": -266.325,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -211.675,
            "maxX": -211.325,
            "minZ": -258,
            "maxZ": -254,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -211.675,
            "maxX": -211.325,
            "minZ": -274,
            "maxZ": -266.5,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -220.5,
            "maxX": -211.5,
            "minZ": -254.175,
            "maxZ": -253.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -220.5,
            "maxX": -211.5,
            "minZ": -274.175,
            "maxZ": -273.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -220.675,
            "maxX": -220.325,
            "minZ": -258,
            "maxZ": -254,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -220.675,
            "maxX": -220.325,
            "minZ": -274,
            "maxZ": -266.5,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -224.175,
            "maxX": -223.825,
            "minZ": -266.5,
            "maxZ": -258,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -224,
            "maxX": -220.5,
            "minZ": -258.175,
            "maxZ": -257.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -224,
            "maxX": -220.5,
            "minZ": -266.675,
            "maxZ": -266.325,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "sind_004",
        "name": "sind_004",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.5,
        "floorsCount": 5,
        "roofY": 22.5,
        "facadeMaterial": "panel_block",
        "footprint": [
          {
            "x": -180,
            "z": -274
          },
          {
            "x": -172,
            "z": -274
          },
          {
            "x": -172,
            "z": -266
          },
          {
            "x": -180,
            "z": -266
          }
        ],
        "bounds": {
          "minX": -180,
          "maxX": -172,
          "minZ": -274,
          "maxZ": -266
        },
        "rects": [
          {
            "minX": -180,
            "maxX": -172,
            "minZ": -274,
            "maxZ": -266
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -172.175,
            "maxX": -171.825,
            "minZ": -274,
            "maxZ": -266,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -180.175,
            "maxX": -179.825,
            "minZ": -274,
            "maxZ": -266,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -180,
            "maxX": -172,
            "minZ": -266.175,
            "maxZ": -265.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -180,
            "maxX": -172,
            "minZ": -274.175,
            "maxZ": -273.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "sind_005",
        "name": "sind_005",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.5,
        "floorsCount": 2,
        "roofY": 9,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -168,
            "z": -274
          },
          {
            "x": -160,
            "z": -274
          },
          {
            "x": -160,
            "z": -266
          },
          {
            "x": -168,
            "z": -266
          }
        ],
        "bounds": {
          "minX": -168,
          "maxX": -160,
          "minZ": -274,
          "maxZ": -266
        },
        "rects": [
          {
            "minX": -168,
            "maxX": -160,
            "minZ": -274,
            "maxZ": -266
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -160.175,
            "maxX": -159.825,
            "minZ": -274,
            "maxZ": -266,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -168.175,
            "maxX": -167.825,
            "minZ": -274,
            "maxZ": -266,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -168,
            "maxX": -160,
            "minZ": -266.175,
            "maxZ": -265.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -168,
            "maxX": -160,
            "minZ": -274.175,
            "maxZ": -273.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "sind_005_t1",
        "name": "sind_005_t1",
        "isEnterable": false,
        "baseY": 9,
        "floorHeight": 5,
        "floorsCount": 1,
        "roofY": 14,
        "facadeMaterial": "panel_block",
        "footprint": [
          {
            "x": -167.5,
            "z": -273.5
          },
          {
            "x": -161,
            "z": -273.5
          },
          {
            "x": -161,
            "z": -266.5
          },
          {
            "x": -167.5,
            "z": -266.5
          }
        ],
        "bounds": {
          "minX": -167.5,
          "maxX": -161,
          "minZ": -273.5,
          "maxZ": -266.5
        },
        "rects": [
          {
            "minX": -167.5,
            "maxX": -161,
            "minZ": -273.5,
            "maxZ": -266.5
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -161.175,
            "maxX": -160.825,
            "minZ": -273.5,
            "maxZ": -266.5,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -167.5,
            "maxX": -161,
            "minZ": -266.675,
            "maxZ": -266.325,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -167.5,
            "maxX": -161,
            "minZ": -273.675,
            "maxZ": -273.325,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -167.675,
            "maxX": -167.325,
            "minZ": -273.5,
            "maxZ": -266.5,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "sind_006",
        "name": "sind_006",
        "isEnterable": true,
        "baseY": 0,
        "floorHeight": 4.5,
        "floorsCount": 4,
        "roofY": 18,
        "facadeMaterial": "rusted_metal",
        "footprint": [
          {
            "x": -180,
            "z": -262
          },
          {
            "x": -160,
            "z": -262
          },
          {
            "x": -160,
            "z": -254
          },
          {
            "x": -180,
            "z": -254
          }
        ],
        "bounds": {
          "minX": -180,
          "maxX": -160,
          "minZ": -262,
          "maxZ": -254
        },
        "rects": [
          {
            "minX": -180,
            "maxX": -160,
            "minZ": -262,
            "maxZ": -254
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -160.175,
            "maxX": -159.825,
            "minZ": -262,
            "maxZ": -254,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -180.175,
            "maxX": -179.825,
            "minZ": -262,
            "maxZ": -254,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -180,
            "maxX": -160,
            "minZ": -254.175,
            "maxZ": -253.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -180,
            "maxX": -160,
            "minZ": -262.175,
            "maxZ": -261.825,
            "facade": true
          }
        ],
        "rooms": [
          {
            "id": "sind_006_r0",
            "type": "utility",
            "floor": 0,
            "rect": {
              "minX": -180,
              "maxX": -160,
              "minZ": -262,
              "maxZ": -254
            },
            "y": 0
          },
          {
            "id": "sind_006_r1",
            "type": "corridor",
            "floor": 1,
            "rect": {
              "minX": -180,
              "maxX": -160,
              "minZ": -262,
              "maxZ": -254
            },
            "y": 4.5
          },
          {
            "id": "sind_006_r2",
            "type": "utility",
            "floor": 2,
            "rect": {
              "minX": -180,
              "maxX": -160,
              "minZ": -262,
              "maxZ": -254
            },
            "y": 9
          },
          {
            "id": "sind_006_r3",
            "type": "room",
            "floor": 3,
            "rect": {
              "minX": -180,
              "maxX": -160,
              "minZ": -262,
              "maxZ": -254
            },
            "y": 13.5
          }
        ],
        "stairs": [
          {
            "id": "sind_006_s0",
            "type": "l_shape",
            "connectsFloors": [
              0,
              1
            ],
            "y0": 0,
            "y1": 4.5,
            "height": 4.5,
            "rotation": 0,
            "rect": {
              "minX": -176.104,
              "maxX": -169.89600000000002,
              "minZ": -259.9,
              "maxZ": -256.09999999999997
            },
            "steps": [
              {
                "minX": -176.104,
                "maxX": -175.359,
                "minZ": -259.9,
                "maxZ": -258,
                "top": 0.5
              },
              {
                "minX": -175.359,
                "maxX": -174.614,
                "minZ": -259.9,
                "maxZ": -258,
                "top": 1
              },
              {
                "minX": -174.614,
                "maxX": -173.869,
                "minZ": -259.9,
                "maxZ": -258,
                "top": 1.5
              },
              {
                "minX": -173.869,
                "maxX": -173.124,
                "minZ": -259.9,
                "maxZ": -258,
                "top": 2
              },
              {
                "minX": -173.124,
                "maxX": -172.379,
                "minZ": -259.9,
                "maxZ": -258,
                "top": 2.5
              },
              {
                "minX": -172.379,
                "maxX": -169.896,
                "minZ": -259.9,
                "maxZ": -258,
                "top": 2.5
              },
              {
                "minX": -172.379,
                "maxX": -169.896,
                "minZ": -258,
                "maxZ": -257.525,
                "top": 3
              },
              {
                "minX": -172.379,
                "maxX": -169.896,
                "minZ": -257.525,
                "maxZ": -257.05,
                "top": 3.5
              },
              {
                "minX": -172.379,
                "maxX": -169.896,
                "minZ": -257.05,
                "maxZ": -256.575,
                "top": 4
              },
              {
                "minX": -172.379,
                "maxX": -169.896,
                "minZ": -256.575,
                "maxZ": -256.1,
                "top": 4.5
              }
            ],
            "bottom": {
              "x": -175.731,
              "z": -258.95,
              "y": 0.5
            },
            "top": {
              "x": -171.137,
              "z": -256.337,
              "y": 4.5
            }
          },
          {
            "id": "sind_006_s1",
            "type": "l_shape",
            "connectsFloors": [
              1,
              2
            ],
            "y0": 4.5,
            "y1": 9,
            "height": 4.5,
            "rotation": 0,
            "rect": {
              "minX": -176.104,
              "maxX": -169.89600000000002,
              "minZ": -259.9,
              "maxZ": -256.09999999999997
            },
            "steps": [
              {
                "minX": -176.104,
                "maxX": -175.359,
                "minZ": -259.9,
                "maxZ": -258,
                "top": 5
              },
              {
                "minX": -175.359,
                "maxX": -174.614,
                "minZ": -259.9,
                "maxZ": -258,
                "top": 5.5
              },
              {
                "minX": -174.614,
                "maxX": -173.869,
                "minZ": -259.9,
                "maxZ": -258,
                "top": 6
              },
              {
                "minX": -173.869,
                "maxX": -173.124,
                "minZ": -259.9,
                "maxZ": -258,
                "top": 6.5
              },
              {
                "minX": -173.124,
                "maxX": -172.379,
                "minZ": -259.9,
                "maxZ": -258,
                "top": 7
              },
              {
                "minX": -172.379,
                "maxX": -169.896,
                "minZ": -259.9,
                "maxZ": -258,
                "top": 7
              },
              {
                "minX": -172.379,
                "maxX": -169.896,
                "minZ": -258,
                "maxZ": -257.525,
                "top": 7.5
              },
              {
                "minX": -172.379,
                "maxX": -169.896,
                "minZ": -257.525,
                "maxZ": -257.05,
                "top": 8
              },
              {
                "minX": -172.379,
                "maxX": -169.896,
                "minZ": -257.05,
                "maxZ": -256.575,
                "top": 8.5
              },
              {
                "minX": -172.379,
                "maxX": -169.896,
                "minZ": -256.575,
                "maxZ": -256.1,
                "top": 9
              }
            ],
            "bottom": {
              "x": -175.731,
              "z": -258.95,
              "y": 5
            },
            "top": {
              "x": -171.137,
              "z": -256.337,
              "y": 9
            }
          },
          {
            "id": "sind_006_s2",
            "type": "l_shape",
            "connectsFloors": [
              2,
              3
            ],
            "y0": 9,
            "y1": 13.5,
            "height": 4.5,
            "rotation": 0,
            "rect": {
              "minX": -176.104,
              "maxX": -169.89600000000002,
              "minZ": -259.9,
              "maxZ": -256.09999999999997
            },
            "steps": [
              {
                "minX": -176.104,
                "maxX": -175.359,
                "minZ": -259.9,
                "maxZ": -258,
                "top": 9.5
              },
              {
                "minX": -175.359,
                "maxX": -174.614,
                "minZ": -259.9,
                "maxZ": -258,
                "top": 10
              },
              {
                "minX": -174.614,
                "maxX": -173.869,
                "minZ": -259.9,
                "maxZ": -258,
                "top": 10.5
              },
              {
                "minX": -173.869,
                "maxX": -173.124,
                "minZ": -259.9,
                "maxZ": -258,
                "top": 11
              },
              {
                "minX": -173.124,
                "maxX": -172.379,
                "minZ": -259.9,
                "maxZ": -258,
                "top": 11.5
              },
              {
                "minX": -172.379,
                "maxX": -169.896,
                "minZ": -259.9,
                "maxZ": -258,
                "top": 11.5
              },
              {
                "minX": -172.379,
                "maxX": -169.896,
                "minZ": -258,
                "maxZ": -257.525,
                "top": 12
              },
              {
                "minX": -172.379,
                "maxX": -169.896,
                "minZ": -257.525,
                "maxZ": -257.05,
                "top": 12.5
              },
              {
                "minX": -172.379,
                "maxX": -169.896,
                "minZ": -257.05,
                "maxZ": -256.575,
                "top": 13
              },
              {
                "minX": -172.379,
                "maxX": -169.896,
                "minZ": -256.575,
                "maxZ": -256.1,
                "top": 13.5
              }
            ],
            "bottom": {
              "x": -175.731,
              "z": -258.95,
              "y": 9.5
            },
            "top": {
              "x": -171.137,
              "z": -256.337,
              "y": 13.5
            }
          }
        ],
        "doors": [
          {
            "id": "sind_006_r0→sind_s_h1_2",
            "room": "sind_006_r0",
            "target": "sind_s_h1_2",
            "linkType": "main_entrance",
            "axis": "x",
            "y": 0,
            "height": 2.1,
            "rect": {
              "minX": -170.9,
              "maxX": -169.1,
              "minZ": -254.185,
              "maxZ": -253.815
            },
            "inside": {
              "x": -170,
              "z": -255.4
            },
            "outside": {
              "x": -170,
              "z": -252.6
            }
          }
        ]
      },
      {
        "id": "sind_007",
        "name": "sind_007",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 5,
        "floorsCount": 3,
        "roofY": 15,
        "facadeMaterial": "rusted_metal",
        "footprint": [
          {
            "x": -268,
            "z": -230
          },
          {
            "x": -248,
            "z": -230
          },
          {
            "x": -248,
            "z": -222
          },
          {
            "x": -268,
            "z": -222
          }
        ],
        "bounds": {
          "minX": -268,
          "maxX": -248,
          "minZ": -230,
          "maxZ": -222
        },
        "rects": [
          {
            "minX": -268,
            "maxX": -248,
            "minZ": -230,
            "maxZ": -222
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -248.175,
            "maxX": -247.825,
            "minZ": -230,
            "maxZ": -222,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -268.175,
            "maxX": -267.825,
            "minZ": -230,
            "maxZ": -222,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -268,
            "maxX": -248,
            "minZ": -222.175,
            "maxZ": -221.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -268,
            "maxX": -248,
            "minZ": -230.175,
            "maxZ": -229.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "sind_008",
        "name": "sind_008",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 5,
        "floorsCount": 1,
        "roofY": 5,
        "facadeMaterial": "rusted_metal",
        "footprint": [
          {
            "x": -268,
            "z": -218
          },
          {
            "x": -248,
            "z": -218
          },
          {
            "x": -248,
            "z": -210
          },
          {
            "x": -268,
            "z": -210
          }
        ],
        "bounds": {
          "minX": -268,
          "maxX": -248,
          "minZ": -218,
          "maxZ": -210
        },
        "rects": [
          {
            "minX": -268,
            "maxX": -248,
            "minZ": -218,
            "maxZ": -210
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -248.175,
            "maxX": -247.825,
            "minZ": -218,
            "maxZ": -210,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -268.175,
            "maxX": -267.825,
            "minZ": -218,
            "maxZ": -210,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -268,
            "maxX": -248,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -268,
            "maxX": -248,
            "minZ": -218.175,
            "maxZ": -217.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "sind_008_t1",
        "name": "sind_008_t1",
        "isEnterable": false,
        "baseY": 5,
        "floorHeight": 5,
        "floorsCount": 1,
        "roofY": 10,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -267,
            "z": -217
          },
          {
            "x": -249,
            "z": -217
          },
          {
            "x": -249,
            "z": -210.5
          },
          {
            "x": -267,
            "z": -210.5
          }
        ],
        "bounds": {
          "minX": -267,
          "maxX": -249,
          "minZ": -217,
          "maxZ": -210.5
        },
        "rects": [
          {
            "minX": -267,
            "maxX": -249,
            "minZ": -217,
            "maxZ": -210.5
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -249.175,
            "maxX": -248.825,
            "minZ": -217,
            "maxZ": -210.5,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -267.175,
            "maxX": -266.825,
            "minZ": -217,
            "maxZ": -210.5,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -267,
            "maxX": -249,
            "minZ": -210.675,
            "maxZ": -210.325,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -267,
            "maxX": -249,
            "minZ": -217.175,
            "maxZ": -216.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "sind_009",
        "name": "sind_009",
        "isEnterable": true,
        "baseY": 0,
        "floorHeight": 4.5,
        "floorsCount": 4,
        "roofY": 18,
        "facadeMaterial": "panel_block",
        "footprint": [
          {
            "x": -224,
            "z": -230
          },
          {
            "x": -216,
            "z": -230
          },
          {
            "x": -216,
            "z": -222
          },
          {
            "x": -224,
            "z": -222
          }
        ],
        "bounds": {
          "minX": -224,
          "maxX": -216,
          "minZ": -230,
          "maxZ": -222
        },
        "rects": [
          {
            "minX": -224,
            "maxX": -216,
            "minZ": -230,
            "maxZ": -222
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -216.175,
            "maxX": -215.825,
            "minZ": -230,
            "maxZ": -222,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -224.175,
            "maxX": -223.825,
            "minZ": -230,
            "maxZ": -222,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -224,
            "maxX": -216,
            "minZ": -222.175,
            "maxZ": -221.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -224,
            "maxX": -216,
            "minZ": -230.175,
            "maxZ": -229.825,
            "facade": true
          }
        ],
        "rooms": [
          {
            "id": "sind_009_r0",
            "type": "utility",
            "floor": 0,
            "rect": {
              "minX": -224,
              "maxX": -216,
              "minZ": -230,
              "maxZ": -222
            },
            "y": 0
          },
          {
            "id": "sind_009_r1",
            "type": "room",
            "floor": 1,
            "rect": {
              "minX": -224,
              "maxX": -216,
              "minZ": -230,
              "maxZ": -222
            },
            "y": 4.5
          },
          {
            "id": "sind_009_r2",
            "type": "corridor",
            "floor": 2,
            "rect": {
              "minX": -224,
              "maxX": -216,
              "minZ": -230,
              "maxZ": -222
            },
            "y": 9
          },
          {
            "id": "sind_009_r3",
            "type": "room",
            "floor": 3,
            "rect": {
              "minX": -224,
              "maxX": -216,
              "minZ": -230,
              "maxZ": -222
            },
            "y": 13.5
          }
        ],
        "stairs": [
          {
            "id": "sind_009_s0",
            "type": "spiral",
            "connectsFloors": [
              0,
              1
            ],
            "y0": 0,
            "y1": 4.5,
            "height": 4.5,
            "rotation": 0,
            "rect": {
              "minX": -221.95,
              "maxX": -218.04999999999998,
              "minZ": -227.95,
              "maxZ": -224.04999999999998
            },
            "steps": [
              {
                "minX": -219.644,
                "maxX": -218.05,
                "minZ": -226,
                "maxZ": -225.207,
                "top": 0.3
              },
              {
                "minX": -219.739,
                "maxX": -218.219,
                "minZ": -225.841,
                "maxZ": -224.551,
                "top": 0.6
              },
              {
                "minX": -219.879,
                "maxX": -218.695,
                "minZ": -225.71,
                "maxZ": -224.145,
                "top": 0.9
              },
              {
                "minX": -220.204,
                "maxX": -219.397,
                "minZ": -225.629,
                "maxZ": -224.061,
                "top": 1.2
              },
              {
                "minX": -220.975,
                "maxX": -220.041,
                "minZ": -225.662,
                "maxZ": -224.061,
                "top": 1.5
              },
              {
                "minX": -221.578,
                "maxX": -220.195,
                "minZ": -225.771,
                "maxZ": -224.311,
                "top": 1.8
              },
              {
                "minX": -221.907,
                "maxX": -220.316,
                "minZ": -225.919,
                "maxZ": -224.854,
                "top": 2.1
              },
              {
                "minX": -221.907,
                "maxX": -220.381,
                "minZ": -226.405,
                "maxZ": -225.595,
                "top": 2.4
              },
              {
                "minX": -221.907,
                "maxX": -220.316,
                "minZ": -227.146,
                "maxZ": -226.081,
                "top": 2.7
              },
              {
                "minX": -221.578,
                "maxX": -220.195,
                "minZ": -227.689,
                "maxZ": -226.229,
                "top": 3
              },
              {
                "minX": -220.975,
                "maxX": -220.041,
                "minZ": -227.939,
                "maxZ": -226.338,
                "top": 3.3
              },
              {
                "minX": -220.204,
                "maxX": -219.397,
                "minZ": -227.939,
                "maxZ": -226.371,
                "top": 3.6
              },
              {
                "minX": -219.879,
                "maxX": -218.695,
                "minZ": -227.855,
                "maxZ": -226.29,
                "top": 3.9
              },
              {
                "minX": -219.739,
                "maxX": -218.219,
                "minZ": -227.449,
                "maxZ": -226.159,
                "top": 4.2
              },
              {
                "minX": -219.644,
                "maxX": -218.05,
                "minZ": -226.793,
                "maxZ": -226,
                "top": 4.5
              }
            ],
            "bottom": {
              "x": -218.847,
              "z": -225.603,
              "y": 0.3
            },
            "top": {
              "x": -218.847,
              "z": -226.396,
              "y": 4.5
            }
          },
          {
            "id": "sind_009_s1",
            "type": "spiral",
            "connectsFloors": [
              1,
              2
            ],
            "y0": 4.5,
            "y1": 9,
            "height": 4.5,
            "rotation": 0,
            "rect": {
              "minX": -221.95,
              "maxX": -218.04999999999998,
              "minZ": -227.95,
              "maxZ": -224.04999999999998
            },
            "steps": [
              {
                "minX": -219.644,
                "maxX": -218.05,
                "minZ": -226,
                "maxZ": -225.207,
                "top": 4.8
              },
              {
                "minX": -219.739,
                "maxX": -218.219,
                "minZ": -225.841,
                "maxZ": -224.551,
                "top": 5.1
              },
              {
                "minX": -219.879,
                "maxX": -218.695,
                "minZ": -225.71,
                "maxZ": -224.145,
                "top": 5.4
              },
              {
                "minX": -220.204,
                "maxX": -219.397,
                "minZ": -225.629,
                "maxZ": -224.061,
                "top": 5.7
              },
              {
                "minX": -220.975,
                "maxX": -220.041,
                "minZ": -225.662,
                "maxZ": -224.061,
                "top": 6
              },
              {
                "minX": -221.578,
                "maxX": -220.195,
                "minZ": -225.771,
                "maxZ": -224.311,
                "top": 6.3
              },
              {
                "minX": -221.907,
                "maxX": -220.316,
                "minZ": -225.919,
                "maxZ": -224.854,
                "top": 6.6
              },
              {
                "minX": -221.907,
                "maxX": -220.381,
                "minZ": -226.405,
                "maxZ": -225.595,
                "top": 6.9
              },
              {
                "minX": -221.907,
                "maxX": -220.316,
                "minZ": -227.146,
                "maxZ": -226.081,
                "top": 7.2
              },
              {
                "minX": -221.578,
                "maxX": -220.195,
                "minZ": -227.689,
                "maxZ": -226.229,
                "top": 7.5
              },
              {
                "minX": -220.975,
                "maxX": -220.041,
                "minZ": -227.939,
                "maxZ": -226.338,
                "top": 7.8
              },
              {
                "minX": -220.204,
                "maxX": -219.397,
                "minZ": -227.939,
                "maxZ": -226.371,
                "top": 8.1
              },
              {
                "minX": -219.879,
                "maxX": -218.695,
                "minZ": -227.855,
                "maxZ": -226.29,
                "top": 8.4
              },
              {
                "minX": -219.739,
                "maxX": -218.219,
                "minZ": -227.449,
                "maxZ": -226.159,
                "top": 8.7
              },
              {
                "minX": -219.644,
                "maxX": -218.05,
                "minZ": -226.793,
                "maxZ": -226,
                "top": 9
              }
            ],
            "bottom": {
              "x": -218.847,
              "z": -225.603,
              "y": 4.8
            },
            "top": {
              "x": -218.847,
              "z": -226.396,
              "y": 9
            }
          },
          {
            "id": "sind_009_s2",
            "type": "spiral",
            "connectsFloors": [
              2,
              3
            ],
            "y0": 9,
            "y1": 13.5,
            "height": 4.5,
            "rotation": 0,
            "rect": {
              "minX": -221.95,
              "maxX": -218.04999999999998,
              "minZ": -227.95,
              "maxZ": -224.04999999999998
            },
            "steps": [
              {
                "minX": -219.644,
                "maxX": -218.05,
                "minZ": -226,
                "maxZ": -225.207,
                "top": 9.3
              },
              {
                "minX": -219.739,
                "maxX": -218.219,
                "minZ": -225.841,
                "maxZ": -224.551,
                "top": 9.6
              },
              {
                "minX": -219.879,
                "maxX": -218.695,
                "minZ": -225.71,
                "maxZ": -224.145,
                "top": 9.9
              },
              {
                "minX": -220.204,
                "maxX": -219.397,
                "minZ": -225.629,
                "maxZ": -224.061,
                "top": 10.2
              },
              {
                "minX": -220.975,
                "maxX": -220.041,
                "minZ": -225.662,
                "maxZ": -224.061,
                "top": 10.5
              },
              {
                "minX": -221.578,
                "maxX": -220.195,
                "minZ": -225.771,
                "maxZ": -224.311,
                "top": 10.8
              },
              {
                "minX": -221.907,
                "maxX": -220.316,
                "minZ": -225.919,
                "maxZ": -224.854,
                "top": 11.1
              },
              {
                "minX": -221.907,
                "maxX": -220.381,
                "minZ": -226.405,
                "maxZ": -225.595,
                "top": 11.4
              },
              {
                "minX": -221.907,
                "maxX": -220.316,
                "minZ": -227.146,
                "maxZ": -226.081,
                "top": 11.7
              },
              {
                "minX": -221.578,
                "maxX": -220.195,
                "minZ": -227.689,
                "maxZ": -226.229,
                "top": 12
              },
              {
                "minX": -220.975,
                "maxX": -220.041,
                "minZ": -227.939,
                "maxZ": -226.338,
                "top": 12.3
              },
              {
                "minX": -220.204,
                "maxX": -219.397,
                "minZ": -227.939,
                "maxZ": -226.371,
                "top": 12.6
              },
              {
                "minX": -219.879,
                "maxX": -218.695,
                "minZ": -227.855,
                "maxZ": -226.29,
                "top": 12.9
              },
              {
                "minX": -219.739,
                "maxX": -218.219,
                "minZ": -227.449,
                "maxZ": -226.159,
                "top": 13.2
              },
              {
                "minX": -219.644,
                "maxX": -218.05,
                "minZ": -226.793,
                "maxZ": -226,
                "top": 13.5
              }
            ],
            "bottom": {
              "x": -218.847,
              "z": -225.603,
              "y": 9.3
            },
            "top": {
              "x": -218.847,
              "z": -226.396,
              "y": 13.5
            }
          }
        ],
        "doors": [
          {
            "id": "sind_009_r0→sind_s_h1_1",
            "room": "sind_009_r0",
            "target": "sind_s_h1_1",
            "linkType": "main_entrance",
            "axis": "x",
            "y": 0,
            "height": 2.1,
            "rect": {
              "minX": -220.9,
              "maxX": -219.1,
              "minZ": -230.185,
              "maxZ": -229.815
            },
            "inside": {
              "x": -220,
              "z": -228.6
            },
            "outside": {
              "x": -220,
              "z": -231.4
            }
          }
        ]
      },
      {
        "id": "sind_010",
        "name": "sind_010",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 5,
        "floorsCount": 5,
        "roofY": 25,
        "facadeMaterial": "panel_block",
        "footprint": [
          {
            "x": -212,
            "z": -230
          },
          {
            "x": -204,
            "z": -230
          },
          {
            "x": -204,
            "z": -222
          },
          {
            "x": -212,
            "z": -222
          }
        ],
        "bounds": {
          "minX": -212,
          "maxX": -204,
          "minZ": -230,
          "maxZ": -222
        },
        "rects": [
          {
            "minX": -212,
            "maxX": -204,
            "minZ": -230,
            "maxZ": -222
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -204.175,
            "maxX": -203.825,
            "minZ": -230,
            "maxZ": -222,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -212.175,
            "maxX": -211.825,
            "minZ": -230,
            "maxZ": -222,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -212,
            "maxX": -204,
            "minZ": -222.175,
            "maxZ": -221.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -212,
            "maxX": -204,
            "minZ": -230.175,
            "maxZ": -229.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "sind_011",
        "name": "sind_011",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.5,
        "floorsCount": 4,
        "roofY": 18,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -224,
            "z": -218
          },
          {
            "x": -216,
            "z": -218
          },
          {
            "x": -216,
            "z": -210
          },
          {
            "x": -224,
            "z": -210
          }
        ],
        "bounds": {
          "minX": -224,
          "maxX": -216,
          "minZ": -218,
          "maxZ": -210
        },
        "rects": [
          {
            "minX": -224,
            "maxX": -216,
            "minZ": -218,
            "maxZ": -210
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -216.175,
            "maxX": -215.825,
            "minZ": -218,
            "maxZ": -210,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -224.175,
            "maxX": -223.825,
            "minZ": -218,
            "maxZ": -210,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -224,
            "maxX": -216,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -224,
            "maxX": -216,
            "minZ": -218.175,
            "maxZ": -217.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "sind_012",
        "name": "sind_012",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.5,
        "floorsCount": 1,
        "roofY": 4.5,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -212,
            "z": -218
          },
          {
            "x": -204,
            "z": -218
          },
          {
            "x": -204,
            "z": -210
          },
          {
            "x": -212,
            "z": -210
          }
        ],
        "bounds": {
          "minX": -212,
          "maxX": -204,
          "minZ": -218,
          "maxZ": -210
        },
        "rects": [
          {
            "minX": -212,
            "maxX": -204,
            "minZ": -218,
            "maxZ": -210
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -204.175,
            "maxX": -203.825,
            "minZ": -218,
            "maxZ": -210,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -212.175,
            "maxX": -211.825,
            "minZ": -218,
            "maxZ": -210,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -212,
            "maxX": -204,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -212,
            "maxX": -204,
            "minZ": -218.175,
            "maxZ": -217.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "sind_012_t1",
        "name": "sind_012_t1",
        "isEnterable": false,
        "baseY": 4.5,
        "floorHeight": 5,
        "floorsCount": 1,
        "roofY": 9.5,
        "facadeMaterial": "panel_block",
        "footprint": [
          {
            "x": -211.5,
            "z": -217.5
          },
          {
            "x": -205,
            "z": -217.5
          },
          {
            "x": -205,
            "z": -210.5
          },
          {
            "x": -211.5,
            "z": -210.5
          }
        ],
        "bounds": {
          "minX": -211.5,
          "maxX": -205,
          "minZ": -217.5,
          "maxZ": -210.5
        },
        "rects": [
          {
            "minX": -211.5,
            "maxX": -205,
            "minZ": -217.5,
            "maxZ": -210.5
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -205.175,
            "maxX": -204.825,
            "minZ": -217.5,
            "maxZ": -210.5,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -211.5,
            "maxX": -205,
            "minZ": -210.675,
            "maxZ": -210.325,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -211.5,
            "maxX": -205,
            "minZ": -217.675,
            "maxZ": -217.325,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -211.675,
            "maxX": -211.325,
            "minZ": -217.5,
            "maxZ": -210.5,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "sind_013",
        "name": "sind_013",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.5,
        "floorsCount": 2,
        "roofY": 9,
        "facadeMaterial": "rusted_metal",
        "footprint": [
          {
            "x": -180,
            "z": -230
          },
          {
            "x": -160,
            "z": -230
          },
          {
            "x": -160,
            "z": -222
          },
          {
            "x": -180,
            "z": -222
          }
        ],
        "bounds": {
          "minX": -180,
          "maxX": -160,
          "minZ": -230,
          "maxZ": -222
        },
        "rects": [
          {
            "minX": -180,
            "maxX": -160,
            "minZ": -230,
            "maxZ": -222
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -160.175,
            "maxX": -159.825,
            "minZ": -230,
            "maxZ": -222,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -180.175,
            "maxX": -179.825,
            "minZ": -230,
            "maxZ": -222,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -180,
            "maxX": -160,
            "minZ": -222.175,
            "maxZ": -221.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -180,
            "maxX": -160,
            "minZ": -230.175,
            "maxZ": -229.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "sind_013_t1",
        "name": "sind_013_t1",
        "isEnterable": false,
        "baseY": 9,
        "floorHeight": 5,
        "floorsCount": 1,
        "roofY": 14,
        "facadeMaterial": "rusted_metal",
        "footprint": [
          {
            "x": -177.5,
            "z": -229.5
          },
          {
            "x": -162.5,
            "z": -229.5
          },
          {
            "x": -162.5,
            "z": -222.5
          },
          {
            "x": -177.5,
            "z": -222.5
          }
        ],
        "bounds": {
          "minX": -177.5,
          "maxX": -162.5,
          "minZ": -229.5,
          "maxZ": -222.5
        },
        "rects": [
          {
            "minX": -177.5,
            "maxX": -162.5,
            "minZ": -229.5,
            "maxZ": -222.5
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -162.675,
            "maxX": -162.325,
            "minZ": -229.5,
            "maxZ": -222.5,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -177.5,
            "maxX": -162.5,
            "minZ": -222.675,
            "maxZ": -222.325,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -177.5,
            "maxX": -162.5,
            "minZ": -229.675,
            "maxZ": -229.325,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -177.675,
            "maxX": -177.325,
            "minZ": -229.5,
            "maxZ": -222.5,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "sind_014_a",
        "name": "sind_014_a",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.5,
        "floorsCount": 3,
        "roofY": 13.5,
        "facadeMaterial": "panel_block",
        "footprint": [
          {
            "x": -180,
            "z": -218
          },
          {
            "x": -174,
            "z": -218
          },
          {
            "x": -174,
            "z": -210
          },
          {
            "x": -180,
            "z": -210
          }
        ],
        "bounds": {
          "minX": -180,
          "maxX": -174,
          "minZ": -218,
          "maxZ": -210
        },
        "rects": [
          {
            "minX": -180,
            "maxX": -174,
            "minZ": -218,
            "maxZ": -210
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -174.175,
            "maxX": -173.825,
            "minZ": -218,
            "maxZ": -210,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -180.175,
            "maxX": -179.825,
            "minZ": -218,
            "maxZ": -210,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -180,
            "maxX": -174,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -180,
            "maxX": -174,
            "minZ": -218.175,
            "maxZ": -217.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "sind_014_b",
        "name": "sind_014_b",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.5,
        "floorsCount": 4,
        "roofY": 18,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -166,
            "z": -218
          },
          {
            "x": -160,
            "z": -218
          },
          {
            "x": -160,
            "z": -210
          },
          {
            "x": -166,
            "z": -210
          }
        ],
        "bounds": {
          "minX": -166,
          "maxX": -160,
          "minZ": -218,
          "maxZ": -210
        },
        "rects": [
          {
            "minX": -166,
            "maxX": -160,
            "minZ": -218,
            "maxZ": -210
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -160.175,
            "maxX": -159.825,
            "minZ": -218,
            "maxZ": -210,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -166.175,
            "maxX": -165.825,
            "minZ": -218,
            "maxZ": -210,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -166,
            "maxX": -160,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -166,
            "maxX": -160,
            "minZ": -218.175,
            "maxZ": -217.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "skit_015",
        "name": "skit_015",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 12,
        "roofY": 42,
        "facadeMaterial": "neon_panel",
        "footprint": [
          {
            "x": 77.649,
            "z": -233.356
          },
          {
            "x": 91.649,
            "z": -233.356
          },
          {
            "x": 91.649,
            "z": -227.356
          },
          {
            "x": 77.649,
            "z": -227.356
          }
        ],
        "bounds": {
          "minX": 77.649,
          "maxX": 91.649,
          "minZ": -233.356,
          "maxZ": -227.356
        },
        "rotation": -15.93,
        "rects": [
          {
            "minX": 77.649,
            "maxX": 91.649,
            "minZ": -233.356,
            "maxZ": -227.356
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 77.474,
            "maxX": 77.824,
            "minZ": -233.356,
            "maxZ": -227.356,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 77.649,
            "maxX": 91.649,
            "minZ": -227.531,
            "maxZ": -227.181,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 77.649,
            "maxX": 91.649,
            "minZ": -233.531,
            "maxZ": -233.181,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 91.474,
            "maxX": 91.824,
            "minZ": -233.356,
            "maxZ": -227.356,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "skit_016",
        "name": "skit_016",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "glass_and_concrete",
        "footprint": [
          {
            "x": 79.387,
            "z": -224.13
          },
          {
            "x": 94.387,
            "z": -224.13
          },
          {
            "x": 94.387,
            "z": -221.13
          },
          {
            "x": 87.387,
            "z": -221.13
          },
          {
            "x": 87.387,
            "z": -218.63
          },
          {
            "x": 83.387,
            "z": -218.63
          },
          {
            "x": 83.387,
            "z": -221.13
          },
          {
            "x": 79.387,
            "z": -221.13
          }
        ],
        "bounds": {
          "minX": 79.387,
          "maxX": 94.387,
          "minZ": -224.13,
          "maxZ": -218.63
        },
        "rotation": -10.209,
        "rects": [
          {
            "minX": 79.387,
            "maxX": 94.387,
            "minZ": -224.13,
            "maxZ": -221.13
          },
          {
            "minX": 83.387,
            "maxX": 87.387,
            "minZ": -221.13,
            "maxZ": -218.63
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 79.212,
            "maxX": 79.562,
            "minZ": -224.13,
            "maxZ": -221.13,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 79.387,
            "maxX": 83.387,
            "minZ": -221.305,
            "maxZ": -220.955,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 79.387,
            "maxX": 94.387,
            "minZ": -224.305,
            "maxZ": -223.955,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 83.212,
            "maxX": 83.562,
            "minZ": -221.13,
            "maxZ": -218.63,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 83.387,
            "maxX": 87.387,
            "minZ": -218.805,
            "maxZ": -218.455,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 87.212,
            "maxX": 87.562,
            "minZ": -221.13,
            "maxZ": -218.63,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 87.387,
            "maxX": 94.387,
            "minZ": -221.305,
            "maxZ": -220.955,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 94.212,
            "maxX": 94.562,
            "minZ": -224.13,
            "maxZ": -221.13,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "skit_017",
        "name": "skit_017",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "rusted_metal",
        "footprint": [
          {
            "x": 111.235,
            "z": -241.654
          },
          {
            "x": 125.735,
            "z": -241.654
          },
          {
            "x": 125.735,
            "z": -226.654
          },
          {
            "x": 111.235,
            "z": -226.654
          }
        ],
        "bounds": {
          "minX": 111.235,
          "maxX": 125.735,
          "minZ": -241.654,
          "maxZ": -226.654
        },
        "rotation": -15.095,
        "rects": [
          {
            "minX": 111.235,
            "maxX": 125.735,
            "minZ": -241.654,
            "maxZ": -226.654
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 111.06,
            "maxX": 111.41,
            "minZ": -241.654,
            "maxZ": -226.654,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 111.235,
            "maxX": 125.735,
            "minZ": -226.829,
            "maxZ": -226.479,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 111.235,
            "maxX": 125.735,
            "minZ": -241.829,
            "maxZ": -241.479,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 125.56,
            "maxX": 125.91,
            "minZ": -241.654,
            "maxZ": -226.654,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "skit_017_t1",
        "name": "skit_017_t1",
        "isEnterable": false,
        "baseY": 7,
        "floorHeight": 4,
        "floorsCount": 1,
        "roofY": 11,
        "facadeMaterial": "glass_and_concrete",
        "footprint": [
          {
            "x": 114.327,
            "z": -240.411
          },
          {
            "x": 124.827,
            "z": -240.411
          },
          {
            "x": 124.827,
            "z": -227.411
          },
          {
            "x": 114.327,
            "z": -227.411
          }
        ],
        "bounds": {
          "minX": 114.327,
          "maxX": 124.827,
          "minZ": -240.411,
          "maxZ": -227.411
        },
        "rotation": -15.095,
        "rects": [
          {
            "minX": 114.327,
            "maxX": 124.827,
            "minZ": -240.411,
            "maxZ": -227.411
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 114.152,
            "maxX": 114.502,
            "minZ": -240.411,
            "maxZ": -227.411,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 114.327,
            "maxX": 124.827,
            "minZ": -227.586,
            "maxZ": -227.236,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 114.327,
            "maxX": 124.827,
            "minZ": -240.586,
            "maxZ": -240.236,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 124.652,
            "maxX": 125.002,
            "minZ": -240.411,
            "maxZ": -227.411,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "skit_018",
        "name": "skit_018",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "rusted_metal",
        "footprint": [
          {
            "x": 158.122,
            "z": -244.367
          },
          {
            "x": 143.622,
            "z": -244.367
          },
          {
            "x": 143.622,
            "z": -249.367
          },
          {
            "x": 158.122,
            "z": -249.367
          }
        ],
        "bounds": {
          "minX": 143.622,
          "maxX": 158.122,
          "minZ": -249.367,
          "maxZ": -244.367
        },
        "rotation": -16.59,
        "rects": [
          {
            "minX": 143.622,
            "maxX": 158.122,
            "minZ": -249.367,
            "maxZ": -244.367
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 143.447,
            "maxX": 143.797,
            "minZ": -249.367,
            "maxZ": -244.367,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 143.622,
            "maxX": 158.122,
            "minZ": -244.542,
            "maxZ": -244.192,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 143.622,
            "maxX": 158.122,
            "minZ": -249.542,
            "maxZ": -249.192,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 157.947,
            "maxX": 158.297,
            "minZ": -249.367,
            "maxZ": -244.367,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "skit_019",
        "name": "skit_019",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 11,
        "roofY": 38.5,
        "facadeMaterial": "painted_brick",
        "footprint": [
          {
            "x": 145.799,
            "z": -240.634
          },
          {
            "x": 160.299,
            "z": -240.634
          },
          {
            "x": 160.299,
            "z": -235.634
          },
          {
            "x": 145.799,
            "z": -235.634
          }
        ],
        "bounds": {
          "minX": 145.799,
          "maxX": 160.299,
          "minZ": -240.634,
          "maxZ": -235.634
        },
        "rotation": -8.673,
        "rects": [
          {
            "minX": 145.799,
            "maxX": 160.299,
            "minZ": -240.634,
            "maxZ": -235.634
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 145.624,
            "maxX": 145.974,
            "minZ": -240.634,
            "maxZ": -235.634,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 145.799,
            "maxX": 160.299,
            "minZ": -235.809,
            "maxZ": -235.459,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 145.799,
            "maxX": 160.299,
            "minZ": -240.809,
            "maxZ": -240.459,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 160.124,
            "maxX": 160.474,
            "minZ": -240.634,
            "maxZ": -235.634,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "skit_020_a",
        "name": "skit_020_a",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 7,
        "roofY": 24.5,
        "facadeMaterial": "painted_brick",
        "footprint": [
          {
            "x": 176.559,
            "z": -258.024
          },
          {
            "x": 190.559,
            "z": -258.024
          },
          {
            "x": 190.559,
            "z": -252.524
          },
          {
            "x": 176.559,
            "z": -252.524
          }
        ],
        "bounds": {
          "minX": 176.559,
          "maxX": 190.559,
          "minZ": -258.024,
          "maxZ": -252.524
        },
        "rotation": -14.774,
        "rects": [
          {
            "minX": 176.559,
            "maxX": 190.559,
            "minZ": -258.024,
            "maxZ": -252.524
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 176.384,
            "maxX": 176.734,
            "minZ": -258.024,
            "maxZ": -252.524,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 176.559,
            "maxX": 190.559,
            "minZ": -252.699,
            "maxZ": -252.349,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 176.559,
            "maxX": 190.559,
            "minZ": -258.199,
            "maxZ": -257.849,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 190.384,
            "maxX": 190.734,
            "minZ": -258.024,
            "maxZ": -252.524,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "skit_020_b",
        "name": "skit_020_b",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 8,
        "roofY": 28,
        "facadeMaterial": "rusted_metal",
        "footprint": [
          {
            "x": 178.676,
            "z": -249.784
          },
          {
            "x": 192.676,
            "z": -249.784
          },
          {
            "x": 192.676,
            "z": -243.784
          },
          {
            "x": 178.676,
            "z": -243.784
          }
        ],
        "bounds": {
          "minX": 178.676,
          "maxX": 192.676,
          "minZ": -249.784,
          "maxZ": -243.784
        },
        "rotation": -14.774,
        "rects": [
          {
            "minX": 178.676,
            "maxX": 192.676,
            "minZ": -249.784,
            "maxZ": -243.784
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 178.501,
            "maxX": 178.851,
            "minZ": -249.784,
            "maxZ": -243.784,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 178.676,
            "maxX": 192.676,
            "minZ": -243.959,
            "maxZ": -243.609,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 178.676,
            "maxX": 192.676,
            "minZ": -249.959,
            "maxZ": -249.609,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 192.501,
            "maxX": 192.851,
            "minZ": -249.784,
            "maxZ": -243.784,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "skit_021_a",
        "name": "skit_021_a",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 8,
        "roofY": 28,
        "facadeMaterial": "rusted_metal",
        "footprint": [
          {
            "x": 209.243,
            "z": -264.668
          },
          {
            "x": 215.243,
            "z": -264.668
          },
          {
            "x": 215.243,
            "z": -259.668
          },
          {
            "x": 209.243,
            "z": -259.668
          }
        ],
        "bounds": {
          "minX": 209.243,
          "maxX": 215.243,
          "minZ": -264.668,
          "maxZ": -259.668
        },
        "rotation": -13.925,
        "rects": [
          {
            "minX": 209.243,
            "maxX": 215.243,
            "minZ": -264.668,
            "maxZ": -259.668
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 209.068,
            "maxX": 209.418,
            "minZ": -264.668,
            "maxZ": -259.668,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 209.243,
            "maxX": 215.243,
            "minZ": -259.843,
            "maxZ": -259.493,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 209.243,
            "maxX": 215.243,
            "minZ": -264.843,
            "maxZ": -264.493,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 215.068,
            "maxX": 215.418,
            "minZ": -264.668,
            "maxZ": -259.668,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "skit_021_b",
        "name": "skit_021_b",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 9,
        "roofY": 31.5,
        "facadeMaterial": "neon_panel",
        "footprint": [
          {
            "x": 211.421,
            "z": -255.936
          },
          {
            "x": 217.421,
            "z": -255.936
          },
          {
            "x": 217.421,
            "z": -250.936
          },
          {
            "x": 211.421,
            "z": -250.936
          }
        ],
        "bounds": {
          "minX": 211.421,
          "maxX": 217.421,
          "minZ": -255.936,
          "maxZ": -250.936
        },
        "rotation": -13.925,
        "rects": [
          {
            "minX": 211.421,
            "maxX": 217.421,
            "minZ": -255.936,
            "maxZ": -250.936
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 211.246,
            "maxX": 211.596,
            "minZ": -255.936,
            "maxZ": -250.936,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 211.421,
            "maxX": 217.421,
            "minZ": -251.111,
            "maxZ": -250.761,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 211.421,
            "maxX": 217.421,
            "minZ": -256.111,
            "maxZ": -255.761,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 217.246,
            "maxX": 217.596,
            "minZ": -255.936,
            "maxZ": -250.936,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "skit_022",
        "name": "skit_022",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "rusted_metal",
        "footprint": [
          {
            "x": 219.625,
            "z": -266.987
          },
          {
            "x": 224.625,
            "z": -266.987
          },
          {
            "x": 224.625,
            "z": -252.487
          },
          {
            "x": 219.625,
            "z": -252.487
          }
        ],
        "bounds": {
          "minX": 219.625,
          "maxX": 224.625,
          "minZ": -266.987,
          "maxZ": -252.487
        },
        "rotation": -8.065,
        "rects": [
          {
            "minX": 219.625,
            "maxX": 224.625,
            "minZ": -266.987,
            "maxZ": -252.487
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 219.45,
            "maxX": 219.8,
            "minZ": -266.987,
            "maxZ": -252.487,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 219.625,
            "maxX": 224.625,
            "minZ": -252.662,
            "maxZ": -252.312,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 219.625,
            "maxX": 224.625,
            "minZ": -267.162,
            "maxZ": -266.812,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 224.45,
            "maxX": 224.8,
            "minZ": -266.987,
            "maxZ": -252.487,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "skit_023",
        "name": "skit_023",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 7,
        "roofY": 24.5,
        "facadeMaterial": "glass_and_concrete",
        "footprint": [
          {
            "x": 242.18,
            "z": -273.326
          },
          {
            "x": 247.68,
            "z": -273.326
          },
          {
            "x": 247.68,
            "z": -267.826
          },
          {
            "x": 242.18,
            "z": -267.826
          }
        ],
        "bounds": {
          "minX": 242.18,
          "maxX": 247.68,
          "minZ": -273.326,
          "maxZ": -267.826
        },
        "rotation": -8.664,
        "rects": [
          {
            "minX": 242.18,
            "maxX": 247.68,
            "minZ": -273.326,
            "maxZ": -267.826
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 242.005,
            "maxX": 242.355,
            "minZ": -273.326,
            "maxZ": -267.826,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 242.18,
            "maxX": 247.68,
            "minZ": -268.001,
            "maxZ": -267.651,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 242.18,
            "maxX": 247.68,
            "minZ": -273.501,
            "maxZ": -273.151,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 247.505,
            "maxX": 247.855,
            "minZ": -273.326,
            "maxZ": -267.826,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "skit_024",
        "name": "skit_024",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "glass_and_concrete",
        "footprint": [
          {
            "x": 251.526,
            "z": -275.079
          },
          {
            "x": 256.526,
            "z": -275.079
          },
          {
            "x": 256.526,
            "z": -269.579
          },
          {
            "x": 251.526,
            "z": -269.579
          }
        ],
        "bounds": {
          "minX": 251.526,
          "maxX": 256.526,
          "minZ": -275.079,
          "maxZ": -269.579
        },
        "rotation": -14.03,
        "rects": [
          {
            "minX": 251.526,
            "maxX": 256.526,
            "minZ": -275.079,
            "maxZ": -269.579
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 251.351,
            "maxX": 251.701,
            "minZ": -275.079,
            "maxZ": -269.579,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 251.526,
            "maxX": 256.526,
            "minZ": -269.754,
            "maxZ": -269.404,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 251.526,
            "maxX": 256.526,
            "minZ": -275.254,
            "maxZ": -274.904,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 256.351,
            "maxX": 256.701,
            "minZ": -275.079,
            "maxZ": -269.579,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "skit_025",
        "name": "skit_025",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "rusted_metal",
        "footprint": [
          {
            "x": 244.903,
            "z": -264.222
          },
          {
            "x": 250.403,
            "z": -264.222
          },
          {
            "x": 250.403,
            "z": -259.222
          },
          {
            "x": 244.903,
            "z": -259.222
          }
        ],
        "bounds": {
          "minX": 244.903,
          "maxX": 250.403,
          "minZ": -264.222,
          "maxZ": -259.222
        },
        "rotation": -18.619,
        "rects": [
          {
            "minX": 244.903,
            "maxX": 250.403,
            "minZ": -264.222,
            "maxZ": -259.222
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 244.728,
            "maxX": 245.078,
            "minZ": -264.222,
            "maxZ": -259.222,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 244.903,
            "maxX": 250.403,
            "minZ": -259.397,
            "maxZ": -259.047,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 244.903,
            "maxX": 250.403,
            "minZ": -264.397,
            "maxZ": -264.047,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 250.228,
            "maxX": 250.578,
            "minZ": -264.222,
            "maxZ": -259.222,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "skit_026",
        "name": "skit_026",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "neon_panel",
        "footprint": [
          {
            "x": 253.151,
            "z": -266.778
          },
          {
            "x": 258.651,
            "z": -266.778
          },
          {
            "x": 258.651,
            "z": -260.778
          },
          {
            "x": 253.151,
            "z": -260.778
          }
        ],
        "bounds": {
          "minX": 253.151,
          "maxX": 258.651,
          "minZ": -266.778,
          "maxZ": -260.778
        },
        "rotation": -9.238,
        "rects": [
          {
            "minX": 253.151,
            "maxX": 258.651,
            "minZ": -266.778,
            "maxZ": -260.778
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 252.976,
            "maxX": 253.326,
            "minZ": -266.778,
            "maxZ": -260.778,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 253.151,
            "maxX": 258.651,
            "minZ": -260.953,
            "maxZ": -260.603,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 253.151,
            "maxX": 258.651,
            "minZ": -266.953,
            "maxZ": -266.603,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 258.476,
            "maxX": 258.826,
            "minZ": -266.778,
            "maxZ": -260.778,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "nkab_027",
        "name": "nkab_027",
        "isEnterable": false,
        "baseY": 14.771,
        "floorHeight": 3,
        "floorsCount": 4,
        "roofY": 26.771,
        "facadeMaterial": "rusted_metal",
        "footprint": [
          {
            "x": -245.653,
            "z": 142.115
          },
          {
            "x": -233.153,
            "z": 142.115
          },
          {
            "x": -233.153,
            "z": 151.115
          },
          {
            "x": -242.653,
            "z": 151.115
          },
          {
            "x": -242.653,
            "z": 154.615
          },
          {
            "x": -245.653,
            "z": 154.615
          }
        ],
        "bounds": {
          "minX": -245.653,
          "maxX": -233.153,
          "minZ": 142.115,
          "maxZ": 154.615
        },
        "rotation": 24.15,
        "rects": [
          {
            "minX": -245.653,
            "maxX": -233.153,
            "minZ": 142.115,
            "maxZ": 151.115
          },
          {
            "minX": -245.653,
            "maxX": -242.653,
            "minZ": 151.115,
            "maxZ": 154.615
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -233.328,
            "maxX": -232.978,
            "minZ": 142.115,
            "maxZ": 151.115,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -242.653,
            "maxX": -233.153,
            "minZ": 150.94,
            "maxZ": 151.29,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -242.828,
            "maxX": -242.478,
            "minZ": 151.115,
            "maxZ": 154.615,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -245.653,
            "maxX": -233.153,
            "minZ": 141.94,
            "maxZ": 142.29,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -245.653,
            "maxX": -242.653,
            "minZ": 154.44,
            "maxZ": 154.79,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -245.828,
            "maxX": -245.478,
            "minZ": 142.115,
            "maxZ": 154.615,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "nkab_034",
        "name": "nkab_034",
        "isEnterable": true,
        "baseY": 14.771,
        "floorHeight": 3,
        "floorsCount": 4,
        "roofY": 26.771,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -162.095,
            "z": 175.754
          },
          {
            "x": -150.095,
            "z": 175.754
          },
          {
            "x": -150.095,
            "z": 187.754
          },
          {
            "x": -162.095,
            "z": 187.754
          }
        ],
        "bounds": {
          "minX": -162.095,
          "maxX": -150.095,
          "minZ": 175.754,
          "maxZ": 187.754
        },
        "rotation": 25.327,
        "rects": [
          {
            "minX": -162.095,
            "maxX": -150.095,
            "minZ": 175.754,
            "maxZ": 187.754
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -150.27,
            "maxX": -149.92,
            "minZ": 175.754,
            "maxZ": 187.754,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -162.095,
            "maxX": -150.095,
            "minZ": 175.579,
            "maxZ": 175.929,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -162.095,
            "maxX": -150.095,
            "minZ": 187.579,
            "maxZ": 187.929,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -162.27,
            "maxX": -161.92,
            "minZ": 175.754,
            "maxZ": 187.754,
            "facade": true
          }
        ],
        "rooms": [
          {
            "id": "nkab_034_r0",
            "type": "cafe",
            "floor": 0,
            "rect": {
              "minX": -162.095,
              "maxX": -150.095,
              "minZ": 175.754,
              "maxZ": 187.754
            },
            "y": 14.771
          },
          {
            "id": "nkab_034_r1",
            "type": "utility",
            "floor": 1,
            "rect": {
              "minX": -162.095,
              "maxX": -150.095,
              "minZ": 175.754,
              "maxZ": 187.754
            },
            "y": 17.771
          },
          {
            "id": "nkab_034_r2",
            "type": "corridor",
            "floor": 2,
            "rect": {
              "minX": -162.095,
              "maxX": -150.095,
              "minZ": 175.754,
              "maxZ": 187.754
            },
            "y": 20.771
          },
          {
            "id": "nkab_034_r3",
            "type": "corridor",
            "floor": 3,
            "rect": {
              "minX": -162.095,
              "maxX": -150.095,
              "minZ": 175.754,
              "maxZ": 187.754
            },
            "y": 23.771
          }
        ],
        "stairs": [
          {
            "id": "nkab_034_s0",
            "type": "straight",
            "connectsFloors": [
              0,
              1
            ],
            "y0": 14.771,
            "y1": 17.771,
            "height": 3,
            "rotation": 0,
            "rect": {
              "minX": -156.47,
              "maxX": -152.72,
              "minZ": 178.304,
              "maxZ": 180.204
            },
            "steps": [
              {
                "minX": -156.47,
                "maxX": -155.845,
                "minZ": 178.304,
                "maxZ": 180.204,
                "top": 15.271
              },
              {
                "minX": -155.845,
                "maxX": -155.22,
                "minZ": 178.304,
                "maxZ": 180.204,
                "top": 15.771
              },
              {
                "minX": -155.22,
                "maxX": -154.595,
                "minZ": 178.304,
                "maxZ": 180.204,
                "top": 16.271
              },
              {
                "minX": -154.595,
                "maxX": -153.97,
                "minZ": 178.304,
                "maxZ": 180.204,
                "top": 16.771
              },
              {
                "minX": -153.97,
                "maxX": -153.345,
                "minZ": 178.304,
                "maxZ": 180.204,
                "top": 17.271
              },
              {
                "minX": -153.345,
                "maxX": -152.72,
                "minZ": 178.304,
                "maxZ": 180.204,
                "top": 17.771
              }
            ],
            "bottom": {
              "x": -156.157,
              "z": 179.254,
              "y": 15.271
            },
            "top": {
              "x": -153.032,
              "z": 179.254,
              "y": 17.771
            }
          },
          {
            "id": "nkab_034_s1",
            "type": "straight",
            "connectsFloors": [
              1,
              2
            ],
            "y0": 17.771,
            "y1": 20.771,
            "height": 3,
            "rotation": 0,
            "rect": {
              "minX": -156.47,
              "maxX": -152.72,
              "minZ": 178.304,
              "maxZ": 180.204
            },
            "steps": [
              {
                "minX": -156.47,
                "maxX": -155.845,
                "minZ": 178.304,
                "maxZ": 180.204,
                "top": 18.271
              },
              {
                "minX": -155.845,
                "maxX": -155.22,
                "minZ": 178.304,
                "maxZ": 180.204,
                "top": 18.771
              },
              {
                "minX": -155.22,
                "maxX": -154.595,
                "minZ": 178.304,
                "maxZ": 180.204,
                "top": 19.271
              },
              {
                "minX": -154.595,
                "maxX": -153.97,
                "minZ": 178.304,
                "maxZ": 180.204,
                "top": 19.771
              },
              {
                "minX": -153.97,
                "maxX": -153.345,
                "minZ": 178.304,
                "maxZ": 180.204,
                "top": 20.271
              },
              {
                "minX": -153.345,
                "maxX": -152.72,
                "minZ": 178.304,
                "maxZ": 180.204,
                "top": 20.771
              }
            ],
            "bottom": {
              "x": -156.157,
              "z": 179.254,
              "y": 18.271
            },
            "top": {
              "x": -153.032,
              "z": 179.254,
              "y": 20.771
            }
          },
          {
            "id": "nkab_034_s2",
            "type": "straight",
            "connectsFloors": [
              2,
              3
            ],
            "y0": 20.771,
            "y1": 23.771,
            "height": 3,
            "rotation": 0,
            "rect": {
              "minX": -156.47,
              "maxX": -152.72,
              "minZ": 178.304,
              "maxZ": 180.204
            },
            "steps": [
              {
                "minX": -156.47,
                "maxX": -155.845,
                "minZ": 178.304,
                "maxZ": 180.204,
                "top": 21.271
              },
              {
                "minX": -155.845,
                "maxX": -155.22,
                "minZ": 178.304,
                "maxZ": 180.204,
                "top": 21.771
              },
              {
                "minX": -155.22,
                "maxX": -154.595,
                "minZ": 178.304,
                "maxZ": 180.204,
                "top": 22.271
              },
              {
                "minX": -154.595,
                "maxX": -153.97,
                "minZ": 178.304,
                "maxZ": 180.204,
                "top": 22.771
              },
              {
                "minX": -153.97,
                "maxX": -153.345,
                "minZ": 178.304,
                "maxZ": 180.204,
                "top": 23.271
              },
              {
                "minX": -153.345,
                "maxX": -152.72,
                "minZ": 178.304,
                "maxZ": 180.204,
                "top": 23.771
              }
            ],
            "bottom": {
              "x": -156.157,
              "z": 179.254,
              "y": 21.271
            },
            "top": {
              "x": -153.032,
              "z": 179.254,
              "y": 23.771
            }
          }
        ],
        "doors": [
          {
            "id": "nkab_034_r0→nkab_s_h0_3",
            "room": "nkab_034_r0",
            "target": "nkab_s_h0_3",
            "linkType": "main_entrance",
            "axis": "x",
            "y": 14.771,
            "height": 2.1,
            "rect": {
              "minX": -156.995,
              "maxX": -155.195,
              "minZ": 175.569,
              "maxZ": 175.939
            },
            "inside": {
              "x": -154.127,
              "z": 177.596
            },
            "outside": {
              "x": -152.929,
              "z": 175.065
            }
          }
        ]
      },
      {
        "id": "nkab_036",
        "name": "nkab_036",
        "isEnterable": false,
        "baseY": 14.771,
        "floorHeight": 3,
        "floorsCount": 4,
        "roofY": 26.771,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -258.76,
            "z": 176.97
          },
          {
            "x": -246.26,
            "z": 176.97
          },
          {
            "x": -246.26,
            "z": 181.97
          },
          {
            "x": -258.76,
            "z": 181.97
          }
        ],
        "bounds": {
          "minX": -258.76,
          "maxX": -246.26,
          "minZ": 176.97,
          "maxZ": 181.97
        },
        "rotation": 16.485,
        "rects": [
          {
            "minX": -258.76,
            "maxX": -246.26,
            "minZ": 176.97,
            "maxZ": 181.97
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -246.435,
            "maxX": -246.085,
            "minZ": 176.97,
            "maxZ": 181.97,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -258.76,
            "maxX": -246.26,
            "minZ": 176.795,
            "maxZ": 177.145,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -258.76,
            "maxX": -246.26,
            "minZ": 181.795,
            "maxZ": 182.145,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -258.935,
            "maxX": -258.585,
            "minZ": 176.97,
            "maxZ": 181.97,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "nkab_039",
        "name": "nkab_039",
        "isEnterable": false,
        "baseY": 14.771,
        "floorHeight": 3,
        "floorsCount": 7,
        "roofY": 35.771,
        "facadeMaterial": "rusted_metal",
        "footprint": [
          {
            "x": -201.649,
            "z": 191.832
          },
          {
            "x": -188.649,
            "z": 191.832
          },
          {
            "x": -188.649,
            "z": 204.832
          },
          {
            "x": -201.649,
            "z": 204.832
          }
        ],
        "bounds": {
          "minX": -201.649,
          "maxX": -188.649,
          "minZ": 191.832,
          "maxZ": 204.832
        },
        "rotation": 23.042,
        "rects": [
          {
            "minX": -201.649,
            "maxX": -188.649,
            "minZ": 191.832,
            "maxZ": 204.832
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -188.824,
            "maxX": -188.474,
            "minZ": 191.832,
            "maxZ": 204.832,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -201.649,
            "maxX": -188.649,
            "minZ": 191.657,
            "maxZ": 192.007,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -201.649,
            "maxX": -188.649,
            "minZ": 204.657,
            "maxZ": 205.007,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -201.824,
            "maxX": -201.474,
            "minZ": 191.832,
            "maxZ": 204.832,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "nkab_045",
        "name": "nkab_045",
        "isEnterable": false,
        "baseY": 14.771,
        "floorHeight": 3,
        "floorsCount": 7,
        "roofY": 35.771,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -228.278,
            "z": 221.297
          },
          {
            "x": -232.278,
            "z": 221.297
          },
          {
            "x": -232.278,
            "z": 213.797
          },
          {
            "x": -240.778,
            "z": 213.797
          },
          {
            "x": -240.778,
            "z": 208.797
          },
          {
            "x": -228.278,
            "z": 208.797
          }
        ],
        "bounds": {
          "minX": -240.778,
          "maxX": -228.278,
          "minZ": 208.797,
          "maxZ": 221.297
        },
        "rotation": 22.601,
        "rects": [
          {
            "minX": -232.278,
            "maxX": -228.278,
            "minZ": 213.797,
            "maxZ": 221.297
          },
          {
            "minX": -240.778,
            "maxX": -228.278,
            "minZ": 208.797,
            "maxZ": 213.797
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -228.453,
            "maxX": -228.103,
            "minZ": 208.797,
            "maxZ": 221.297,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -232.278,
            "maxX": -228.278,
            "minZ": 221.122,
            "maxZ": 221.472,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -232.453,
            "maxX": -232.103,
            "minZ": 213.797,
            "maxZ": 221.297,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -240.778,
            "maxX": -228.278,
            "minZ": 208.622,
            "maxZ": 208.972,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -240.778,
            "maxX": -232.278,
            "minZ": 213.622,
            "maxZ": 213.972,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -240.953,
            "maxX": -240.603,
            "minZ": 208.797,
            "maxZ": 213.797,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_051",
        "name": "ncc_051",
        "isEnterable": true,
        "baseY": 14.783,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 28.783,
        "facadeMaterial": "stone_base",
        "footprint": [
          {
            "x": -14.097,
            "z": 183.912
          },
          {
            "x": 3.903,
            "z": 183.912
          },
          {
            "x": 3.903,
            "z": 191.912
          },
          {
            "x": -14.097,
            "z": 191.912
          }
        ],
        "bounds": {
          "minX": -14.097,
          "maxX": 3.903,
          "minZ": 183.912,
          "maxZ": 191.912
        },
        "rotation": -3.841,
        "rects": [
          {
            "minX": -14.097,
            "maxX": 3.903,
            "minZ": 183.912,
            "maxZ": 191.912
          }
        ],
        "walls": [
          {
            "axis": "x",
            "minX": -14.097,
            "maxX": 3.903,
            "minZ": 183.737,
            "maxZ": 184.087,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -14.097,
            "maxX": 3.903,
            "minZ": 191.737,
            "maxZ": 192.087,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -14.272,
            "maxX": -13.922,
            "minZ": 183.912,
            "maxZ": 191.912,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 3.728,
            "maxX": 4.078,
            "minZ": 183.912,
            "maxZ": 191.912,
            "facade": true
          }
        ],
        "rooms": [
          {
            "id": "ncc_051_r0",
            "type": "hall",
            "floor": 0,
            "rect": {
              "minX": -14.097,
              "maxX": 3.903,
              "minZ": 183.912,
              "maxZ": 191.912
            },
            "y": 14.783
          },
          {
            "id": "ncc_051_r1",
            "type": "corridor",
            "floor": 1,
            "rect": {
              "minX": -14.097,
              "maxX": 3.903,
              "minZ": 183.912,
              "maxZ": 191.912
            },
            "y": 18.283
          },
          {
            "id": "ncc_051_r2",
            "type": "corridor",
            "floor": 2,
            "rect": {
              "minX": -14.097,
              "maxX": 3.903,
              "minZ": 183.912,
              "maxZ": 191.912
            },
            "y": 21.783
          },
          {
            "id": "ncc_051_r3",
            "type": "utility",
            "floor": 3,
            "rect": {
              "minX": -14.097,
              "maxX": 3.903,
              "minZ": 183.912,
              "maxZ": 191.912
            },
            "y": 25.283
          }
        ],
        "stairs": [
          {
            "id": "ncc_051_s0",
            "type": "l_shape",
            "connectsFloors": [
              0,
              1
            ],
            "y0": 14.783,
            "y1": 18.283,
            "height": 3.5,
            "rotation": 0,
            "rect": {
              "minX": -12.1595,
              "maxX": -8.0345,
              "minZ": 186.012,
              "maxZ": 189.812
            },
            "steps": [
              {
                "minX": -12.159,
                "maxX": -11.541,
                "minZ": 186.012,
                "maxZ": 187.912,
                "top": 15.283
              },
              {
                "minX": -11.541,
                "maxX": -10.922,
                "minZ": 186.012,
                "maxZ": 187.912,
                "top": 15.783
              },
              {
                "minX": -10.922,
                "maxX": -10.303,
                "minZ": 186.012,
                "maxZ": 187.912,
                "top": 16.283
              },
              {
                "minX": -10.303,
                "maxX": -9.684,
                "minZ": 186.012,
                "maxZ": 187.912,
                "top": 16.783
              },
              {
                "minX": -9.684,
                "maxX": -8.034,
                "minZ": 186.012,
                "maxZ": 187.912,
                "top": 16.783
              },
              {
                "minX": -9.684,
                "maxX": -8.034,
                "minZ": 187.912,
                "maxZ": 188.545,
                "top": 17.283
              },
              {
                "minX": -9.684,
                "maxX": -8.034,
                "minZ": 188.545,
                "maxZ": 189.179,
                "top": 17.783
              },
              {
                "minX": -9.684,
                "maxX": -8.034,
                "minZ": 189.179,
                "maxZ": 189.812,
                "top": 18.283
              }
            ],
            "bottom": {
              "x": -11.85,
              "z": 186.962,
              "y": 15.283
            },
            "top": {
              "x": -8.859,
              "z": 189.496,
              "y": 18.283
            }
          },
          {
            "id": "ncc_051_s1",
            "type": "l_shape",
            "connectsFloors": [
              1,
              2
            ],
            "y0": 18.283,
            "y1": 21.783,
            "height": 3.5,
            "rotation": 0,
            "rect": {
              "minX": -12.1595,
              "maxX": -8.0345,
              "minZ": 186.012,
              "maxZ": 189.812
            },
            "steps": [
              {
                "minX": -12.159,
                "maxX": -11.541,
                "minZ": 186.012,
                "maxZ": 187.912,
                "top": 18.783
              },
              {
                "minX": -11.541,
                "maxX": -10.922,
                "minZ": 186.012,
                "maxZ": 187.912,
                "top": 19.283
              },
              {
                "minX": -10.922,
                "maxX": -10.303,
                "minZ": 186.012,
                "maxZ": 187.912,
                "top": 19.783
              },
              {
                "minX": -10.303,
                "maxX": -9.684,
                "minZ": 186.012,
                "maxZ": 187.912,
                "top": 20.283
              },
              {
                "minX": -9.684,
                "maxX": -8.034,
                "minZ": 186.012,
                "maxZ": 187.912,
                "top": 20.283
              },
              {
                "minX": -9.684,
                "maxX": -8.034,
                "minZ": 187.912,
                "maxZ": 188.545,
                "top": 20.783
              },
              {
                "minX": -9.684,
                "maxX": -8.034,
                "minZ": 188.545,
                "maxZ": 189.179,
                "top": 21.283
              },
              {
                "minX": -9.684,
                "maxX": -8.034,
                "minZ": 189.179,
                "maxZ": 189.812,
                "top": 21.783
              }
            ],
            "bottom": {
              "x": -11.85,
              "z": 186.962,
              "y": 18.783
            },
            "top": {
              "x": -8.859,
              "z": 189.496,
              "y": 21.783
            }
          },
          {
            "id": "ncc_051_s2",
            "type": "l_shape",
            "connectsFloors": [
              2,
              3
            ],
            "y0": 21.783,
            "y1": 25.283,
            "height": 3.5,
            "rotation": 0,
            "rect": {
              "minX": -12.1595,
              "maxX": -8.0345,
              "minZ": 186.012,
              "maxZ": 189.812
            },
            "steps": [
              {
                "minX": -12.159,
                "maxX": -11.541,
                "minZ": 186.012,
                "maxZ": 187.912,
                "top": 22.283
              },
              {
                "minX": -11.541,
                "maxX": -10.922,
                "minZ": 186.012,
                "maxZ": 187.912,
                "top": 22.783
              },
              {
                "minX": -10.922,
                "maxX": -10.303,
                "minZ": 186.012,
                "maxZ": 187.912,
                "top": 23.283
              },
              {
                "minX": -10.303,
                "maxX": -9.684,
                "minZ": 186.012,
                "maxZ": 187.912,
                "top": 23.783
              },
              {
                "minX": -9.684,
                "maxX": -8.034,
                "minZ": 186.012,
                "maxZ": 187.912,
                "top": 23.783
              },
              {
                "minX": -9.684,
                "maxX": -8.034,
                "minZ": 187.912,
                "maxZ": 188.545,
                "top": 24.283
              },
              {
                "minX": -9.684,
                "maxX": -8.034,
                "minZ": 188.545,
                "maxZ": 189.179,
                "top": 24.783
              },
              {
                "minX": -9.684,
                "maxX": -8.034,
                "minZ": 189.179,
                "maxZ": 189.812,
                "top": 25.283
              }
            ],
            "bottom": {
              "x": -11.85,
              "z": 186.962,
              "y": 22.283
            },
            "top": {
              "x": -8.859,
              "z": 189.496,
              "y": 25.283
            }
          }
        ],
        "doors": [
          {
            "id": "ncc_051_r0→ncc_s_h0_0",
            "room": "ncc_051_r0",
            "target": "ncc_s_h0_0",
            "linkType": "main_entrance",
            "axis": "x",
            "y": 14.783,
            "height": 2.1,
            "rect": {
              "minX": -5.997,
              "maxX": -4.197,
              "minZ": 183.727,
              "maxZ": 184.097
            },
            "inside": {
              "x": -5.271,
              "z": 185.318
            },
            "outside": {
              "x": -5.459,
              "z": 182.524
            }
          }
        ]
      },
      {
        "id": "ncc_053",
        "name": "ncc_053",
        "isEnterable": false,
        "baseY": 14.783,
        "floorHeight": 4,
        "floorsCount": 15,
        "roofY": 74.783,
        "facadeMaterial": "glass_and_concrete",
        "footprint": [
          {
            "x": 25.067,
            "z": 179.61
          },
          {
            "x": 33.067,
            "z": 179.61
          },
          {
            "x": 33.067,
            "z": 186.61
          },
          {
            "x": 25.067,
            "z": 186.61
          }
        ],
        "bounds": {
          "minX": 25.067,
          "maxX": 33.067,
          "minZ": 179.61,
          "maxZ": 186.61
        },
        "rotation": -13.283,
        "rects": [
          {
            "minX": 25.067,
            "maxX": 33.067,
            "minZ": 179.61,
            "maxZ": 186.61
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 24.892,
            "maxX": 25.242,
            "minZ": 179.61,
            "maxZ": 186.61,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 25.067,
            "maxX": 33.067,
            "minZ": 179.435,
            "maxZ": 179.785,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 25.067,
            "maxX": 33.067,
            "minZ": 186.435,
            "maxZ": 186.785,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 32.892,
            "maxX": 33.242,
            "minZ": 179.61,
            "maxZ": 186.61,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_054",
        "name": "ncc_054",
        "isEnterable": false,
        "baseY": 14.783,
        "floorHeight": 4,
        "floorsCount": 5,
        "roofY": 34.783,
        "facadeMaterial": "panel_block",
        "footprint": [
          {
            "x": 35.995,
            "z": 178.077
          },
          {
            "x": 43.995,
            "z": 178.077
          },
          {
            "x": 43.995,
            "z": 185.577
          },
          {
            "x": 35.995,
            "z": 185.577
          }
        ],
        "bounds": {
          "minX": 35.995,
          "maxX": 43.995,
          "minZ": 178.077,
          "maxZ": 185.577
        },
        "rotation": -11.339,
        "rects": [
          {
            "minX": 35.995,
            "maxX": 43.995,
            "minZ": 178.077,
            "maxZ": 185.577
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 35.82,
            "maxX": 36.17,
            "minZ": 178.077,
            "maxZ": 185.577,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 35.995,
            "maxX": 43.995,
            "minZ": 177.902,
            "maxZ": 178.252,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 35.995,
            "maxX": 43.995,
            "minZ": 185.402,
            "maxZ": 185.752,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 43.82,
            "maxX": 44.17,
            "minZ": 178.077,
            "maxZ": 185.577,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_054_t1",
        "name": "ncc_054_t1",
        "isEnterable": false,
        "baseY": 20,
        "floorHeight": 4.5,
        "floorsCount": 4,
        "roofY": 38,
        "facadeMaterial": "stone_base",
        "footprint": [
          {
            "x": 36.498,
            "z": 178.612
          },
          {
            "x": 42.998,
            "z": 178.612
          },
          {
            "x": 42.998,
            "z": 185.112
          },
          {
            "x": 36.498,
            "z": 185.112
          }
        ],
        "bounds": {
          "minX": 36.498,
          "maxX": 42.998,
          "minZ": 178.612,
          "maxZ": 185.112
        },
        "rotation": -11.339,
        "rects": [
          {
            "minX": 36.498,
            "maxX": 42.998,
            "minZ": 178.612,
            "maxZ": 185.112
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 36.323,
            "maxX": 36.673,
            "minZ": 178.612,
            "maxZ": 185.112,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 36.498,
            "maxX": 42.998,
            "minZ": 178.437,
            "maxZ": 178.787,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 36.498,
            "maxX": 42.998,
            "minZ": 184.937,
            "maxZ": 185.287,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 42.823,
            "maxX": 43.173,
            "minZ": 178.612,
            "maxZ": 185.112,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_055",
        "name": "ncc_055",
        "isEnterable": false,
        "baseY": 14.783,
        "floorHeight": 4,
        "floorsCount": 5,
        "roofY": 34.783,
        "facadeMaterial": "glass_and_concrete",
        "footprint": [
          {
            "x": 26.582,
            "z": 189.77
          },
          {
            "x": 45.082,
            "z": 189.77
          },
          {
            "x": 45.082,
            "z": 197.27
          },
          {
            "x": 26.582,
            "z": 197.27
          }
        ],
        "bounds": {
          "minX": 26.582,
          "maxX": 45.082,
          "minZ": 189.77,
          "maxZ": 197.27
        },
        "rotation": -10.642,
        "rects": [
          {
            "minX": 26.582,
            "maxX": 45.082,
            "minZ": 189.77,
            "maxZ": 197.27
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 26.407,
            "maxX": 26.757,
            "minZ": 189.77,
            "maxZ": 197.27,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 26.582,
            "maxX": 45.082,
            "minZ": 189.595,
            "maxZ": 189.945,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 26.582,
            "maxX": 45.082,
            "minZ": 197.095,
            "maxZ": 197.445,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 44.907,
            "maxX": 45.257,
            "minZ": 189.77,
            "maxZ": 197.27,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_055_t1",
        "name": "ncc_055_t1",
        "isEnterable": false,
        "baseY": 20,
        "floorHeight": 4.5,
        "floorsCount": 4,
        "roofY": 38,
        "facadeMaterial": "glass_and_concrete",
        "footprint": [
          {
            "x": 29.082,
            "z": 190.27
          },
          {
            "x": 42.582,
            "z": 190.27
          },
          {
            "x": 42.582,
            "z": 196.77
          },
          {
            "x": 29.082,
            "z": 196.77
          }
        ],
        "bounds": {
          "minX": 29.082,
          "maxX": 42.582,
          "minZ": 190.27,
          "maxZ": 196.77
        },
        "rotation": -10.642,
        "rects": [
          {
            "minX": 29.082,
            "maxX": 42.582,
            "minZ": 190.27,
            "maxZ": 196.77
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 28.907,
            "maxX": 29.257,
            "minZ": 190.27,
            "maxZ": 196.77,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 29.082,
            "maxX": 42.582,
            "minZ": 190.095,
            "maxZ": 190.445,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 29.082,
            "maxX": 42.582,
            "minZ": 196.595,
            "maxZ": 196.945,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 42.407,
            "maxX": 42.757,
            "minZ": 190.27,
            "maxZ": 196.77,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_056",
        "name": "ncc_056",
        "isEnterable": false,
        "baseY": 14.783,
        "floorHeight": 3.5,
        "floorsCount": 8,
        "roofY": 42.783,
        "facadeMaterial": "glass_steel",
        "footprint": [
          {
            "x": 64.646,
            "z": 173.581
          },
          {
            "x": 72.146,
            "z": 173.581
          },
          {
            "x": 72.146,
            "z": 181.081
          },
          {
            "x": 64.646,
            "z": 181.081
          }
        ],
        "bounds": {
          "minX": 64.646,
          "maxX": 72.146,
          "minZ": 173.581,
          "maxZ": 181.081
        },
        "rotation": -11.517,
        "rects": [
          {
            "minX": 64.646,
            "maxX": 72.146,
            "minZ": 173.581,
            "maxZ": 181.081
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 64.471,
            "maxX": 64.821,
            "minZ": 173.581,
            "maxZ": 181.081,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 64.646,
            "maxX": 72.146,
            "minZ": 173.406,
            "maxZ": 173.756,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 64.646,
            "maxX": 72.146,
            "minZ": 180.906,
            "maxZ": 181.256,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 71.971,
            "maxX": 72.321,
            "minZ": 173.581,
            "maxZ": 181.081,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_057",
        "name": "ncc_057",
        "isEnterable": false,
        "baseY": 14.783,
        "floorHeight": 4,
        "floorsCount": 4,
        "roofY": 30.783,
        "facadeMaterial": "stone_base",
        "footprint": [
          {
            "x": 76.106,
            "z": 172.51
          },
          {
            "x": 83.106,
            "z": 172.51
          },
          {
            "x": 83.106,
            "z": 180.01
          },
          {
            "x": 76.106,
            "z": 180.01
          }
        ],
        "bounds": {
          "minX": 76.106,
          "maxX": 83.106,
          "minZ": 172.51,
          "maxZ": 180.01
        },
        "rotation": -13.823,
        "rects": [
          {
            "minX": 76.106,
            "maxX": 83.106,
            "minZ": 172.51,
            "maxZ": 180.01
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 75.931,
            "maxX": 76.281,
            "minZ": 172.51,
            "maxZ": 180.01,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 76.106,
            "maxX": 83.106,
            "minZ": 172.335,
            "maxZ": 172.685,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 76.106,
            "maxX": 83.106,
            "minZ": 179.835,
            "maxZ": 180.185,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 82.931,
            "maxX": 83.281,
            "minZ": 172.51,
            "maxZ": 180.01,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_057_t1",
        "name": "ncc_057_t1",
        "isEnterable": false,
        "baseY": 16,
        "floorHeight": 4.5,
        "floorsCount": 3,
        "roofY": 29.5,
        "facadeMaterial": "glass_steel",
        "footprint": [
          {
            "x": 76.606,
            "z": 173.01
          },
          {
            "x": 82.606,
            "z": 173.01
          },
          {
            "x": 82.606,
            "z": 179.51
          },
          {
            "x": 76.606,
            "z": 179.51
          }
        ],
        "bounds": {
          "minX": 76.606,
          "maxX": 82.606,
          "minZ": 173.01,
          "maxZ": 179.51
        },
        "rotation": -13.823,
        "rects": [
          {
            "minX": 76.606,
            "maxX": 82.606,
            "minZ": 173.01,
            "maxZ": 179.51
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 76.431,
            "maxX": 76.781,
            "minZ": 173.01,
            "maxZ": 179.51,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 76.606,
            "maxX": 82.606,
            "minZ": 172.835,
            "maxZ": 173.185,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 76.606,
            "maxX": 82.606,
            "minZ": 179.335,
            "maxZ": 179.685,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 82.431,
            "maxX": 82.781,
            "minZ": 173.01,
            "maxZ": 179.51,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_058",
        "name": "ncc_058",
        "isEnterable": false,
        "baseY": 14.783,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 35.783,
        "facadeMaterial": "panel_block",
        "footprint": [
          {
            "x": 84.655,
            "z": 191.671
          },
          {
            "x": 66.655,
            "z": 191.671
          },
          {
            "x": 66.655,
            "z": 186.671
          },
          {
            "x": 71.655,
            "z": 186.671
          },
          {
            "x": 71.655,
            "z": 183.671
          },
          {
            "x": 77.155,
            "z": 183.671
          },
          {
            "x": 77.155,
            "z": 186.671
          },
          {
            "x": 84.655,
            "z": 186.671
          }
        ],
        "bounds": {
          "minX": 66.655,
          "maxX": 84.655,
          "minZ": 183.671,
          "maxZ": 191.671
        },
        "rotation": -7.534,
        "rects": [
          {
            "minX": 66.655,
            "maxX": 84.655,
            "minZ": 186.671,
            "maxZ": 191.671
          },
          {
            "minX": 71.655,
            "maxX": 77.155,
            "minZ": 183.671,
            "maxZ": 186.671
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 66.48,
            "maxX": 66.83,
            "minZ": 186.671,
            "maxZ": 191.671,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 66.655,
            "maxX": 71.655,
            "minZ": 186.496,
            "maxZ": 186.846,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 66.655,
            "maxX": 84.655,
            "minZ": 191.496,
            "maxZ": 191.846,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 71.48,
            "maxX": 71.83,
            "minZ": 183.671,
            "maxZ": 186.671,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 71.655,
            "maxX": 77.155,
            "minZ": 183.496,
            "maxZ": 183.846,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 76.98,
            "maxX": 77.33,
            "minZ": 183.671,
            "maxZ": 186.671,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 77.155,
            "maxX": 84.655,
            "minZ": 186.496,
            "maxZ": 186.846,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 84.48,
            "maxX": 84.83,
            "minZ": 186.671,
            "maxZ": 191.671,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_059",
        "name": "ncc_059",
        "isEnterable": false,
        "baseY": 14.783,
        "floorHeight": 4,
        "floorsCount": 4,
        "roofY": 30.783,
        "facadeMaterial": "stone_base",
        "footprint": [
          {
            "x": 104.203,
            "z": 167.248
          },
          {
            "x": 122.703,
            "z": 167.248
          },
          {
            "x": 122.703,
            "z": 174.748
          },
          {
            "x": 104.203,
            "z": 174.748
          }
        ],
        "bounds": {
          "minX": 104.203,
          "maxX": 122.703,
          "minZ": 167.248,
          "maxZ": 174.748
        },
        "rotation": -5.481,
        "rects": [
          {
            "minX": 104.203,
            "maxX": 122.703,
            "minZ": 167.248,
            "maxZ": 174.748
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 104.028,
            "maxX": 104.378,
            "minZ": 167.248,
            "maxZ": 174.748,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 104.203,
            "maxX": 122.703,
            "minZ": 167.073,
            "maxZ": 167.423,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 104.203,
            "maxX": 122.703,
            "minZ": 174.573,
            "maxZ": 174.923,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 122.528,
            "maxX": 122.878,
            "minZ": 167.248,
            "maxZ": 174.748,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_059_t1",
        "name": "ncc_059_t1",
        "isEnterable": false,
        "baseY": 16,
        "floorHeight": 4.5,
        "floorsCount": 3,
        "roofY": 29.5,
        "facadeMaterial": "panel_block",
        "footprint": [
          {
            "x": 106.7,
            "z": 167.713
          },
          {
            "x": 120.7,
            "z": 167.713
          },
          {
            "x": 120.7,
            "z": 174.213
          },
          {
            "x": 106.7,
            "z": 174.213
          }
        ],
        "bounds": {
          "minX": 106.7,
          "maxX": 120.7,
          "minZ": 167.713,
          "maxZ": 174.213
        },
        "rotation": -5.481,
        "rects": [
          {
            "minX": 106.7,
            "maxX": 120.7,
            "minZ": 167.713,
            "maxZ": 174.213
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 106.525,
            "maxX": 106.875,
            "minZ": 167.713,
            "maxZ": 174.213,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 106.7,
            "maxX": 120.7,
            "minZ": 167.538,
            "maxZ": 167.888,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 106.7,
            "maxX": 120.7,
            "minZ": 174.038,
            "maxZ": 174.388,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 120.525,
            "maxX": 120.875,
            "minZ": 167.713,
            "maxZ": 174.213,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_060",
        "name": "ncc_060",
        "isEnterable": true,
        "baseY": 14.783,
        "floorHeight": 4,
        "floorsCount": 4,
        "roofY": 30.783,
        "facadeMaterial": "glass_steel",
        "roof": {
          "walkable": true,
          "parapet": 0.9
        },
        "footprint": [
          {
            "x": 106.264,
            "z": 178.569
          },
          {
            "x": 124.764,
            "z": 178.569
          },
          {
            "x": 124.764,
            "z": 185.569
          },
          {
            "x": 106.264,
            "z": 185.569
          }
        ],
        "bounds": {
          "minX": 106.264,
          "maxX": 124.764,
          "minZ": 178.569,
          "maxZ": 185.569
        },
        "rotation": -2.25,
        "rects": [
          {
            "minX": 106.264,
            "maxX": 124.764,
            "minZ": 178.569,
            "maxZ": 185.569
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 106.089,
            "maxX": 106.439,
            "minZ": 178.569,
            "maxZ": 185.569,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 106.264,
            "maxX": 124.764,
            "minZ": 178.394,
            "maxZ": 178.744,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 106.264,
            "maxX": 124.764,
            "minZ": 185.394,
            "maxZ": 185.744,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 124.589,
            "maxX": 124.939,
            "minZ": 178.569,
            "maxZ": 185.569,
            "facade": true
          }
        ],
        "rooms": [
          {
            "id": "ncc_060_r0",
            "type": "hall",
            "floor": 0,
            "rect": {
              "minX": 106.264,
              "maxX": 124.764,
              "minZ": 178.569,
              "maxZ": 185.569
            },
            "y": 14.783
          },
          {
            "id": "ncc_060_r1",
            "type": "office",
            "floor": 1,
            "rect": {
              "minX": 106.264,
              "maxX": 124.764,
              "minZ": 178.569,
              "maxZ": 185.569
            },
            "y": 18.783
          },
          {
            "id": "ncc_060_r2",
            "type": "corridor",
            "floor": 2,
            "rect": {
              "minX": 106.264,
              "maxX": 124.764,
              "minZ": 178.569,
              "maxZ": 185.569
            },
            "y": 22.783
          },
          {
            "id": "ncc_060_r3",
            "type": "office",
            "floor": 3,
            "rect": {
              "minX": 106.264,
              "maxX": 124.764,
              "minZ": 178.569,
              "maxZ": 185.569
            },
            "y": 26.783
          }
        ],
        "stairs": [
          {
            "id": "ncc_060_roof",
            "type": "ladder",
            "connectsFloors": [
              3,
              4
            ],
            "y0": 26.783,
            "y1": 30.783,
            "height": 4,
            "rotation": 0,
            "rect": {
              "minX": 107.064,
              "maxX": 108.464,
              "minZ": 179.369,
              "maxZ": 180.769
            },
            "steps": [
              {
                "minX": 107.064,
                "maxX": 108.464,
                "minZ": 179.369,
                "maxZ": 180.769,
                "top": 27.283
              },
              {
                "minX": 107.064,
                "maxX": 108.464,
                "minZ": 179.369,
                "maxZ": 180.769,
                "top": 27.783
              },
              {
                "minX": 107.064,
                "maxX": 108.464,
                "minZ": 179.369,
                "maxZ": 180.769,
                "top": 28.283
              },
              {
                "minX": 107.064,
                "maxX": 108.464,
                "minZ": 179.369,
                "maxZ": 180.769,
                "top": 28.783
              },
              {
                "minX": 107.064,
                "maxX": 108.464,
                "minZ": 179.369,
                "maxZ": 180.769,
                "top": 29.283
              },
              {
                "minX": 107.064,
                "maxX": 108.464,
                "minZ": 179.369,
                "maxZ": 180.769,
                "top": 29.783
              },
              {
                "minX": 107.064,
                "maxX": 108.464,
                "minZ": 179.369,
                "maxZ": 180.769,
                "top": 30.283
              }
            ],
            "bottom": {
              "x": 107.764,
              "z": 180.069,
              "y": 27.283
            },
            "top": {
              "x": 107.764,
              "z": 180.069,
              "y": 30.283
            }
          },
          {
            "id": "ncc_060_s0",
            "type": "straight",
            "connectsFloors": [
              0,
              1
            ],
            "y0": 14.783,
            "y1": 18.783,
            "height": 4,
            "rotation": 0,
            "rect": {
              "minX": 113.264,
              "maxX": 118.264,
              "minZ": 181.119,
              "maxZ": 183.019
            },
            "steps": [
              {
                "minX": 113.264,
                "maxX": 113.889,
                "minZ": 181.119,
                "maxZ": 183.019,
                "top": 15.283
              },
              {
                "minX": 113.889,
                "maxX": 114.514,
                "minZ": 181.119,
                "maxZ": 183.019,
                "top": 15.783
              },
              {
                "minX": 114.514,
                "maxX": 115.139,
                "minZ": 181.119,
                "maxZ": 183.019,
                "top": 16.283
              },
              {
                "minX": 115.139,
                "maxX": 115.764,
                "minZ": 181.119,
                "maxZ": 183.019,
                "top": 16.783
              },
              {
                "minX": 115.764,
                "maxX": 116.389,
                "minZ": 181.119,
                "maxZ": 183.019,
                "top": 17.283
              },
              {
                "minX": 116.389,
                "maxX": 117.014,
                "minZ": 181.119,
                "maxZ": 183.019,
                "top": 17.783
              },
              {
                "minX": 117.014,
                "maxX": 117.639,
                "minZ": 181.119,
                "maxZ": 183.019,
                "top": 18.283
              },
              {
                "minX": 117.639,
                "maxX": 118.264,
                "minZ": 181.119,
                "maxZ": 183.019,
                "top": 18.783
              }
            ],
            "bottom": {
              "x": 113.577,
              "z": 182.069,
              "y": 15.283
            },
            "top": {
              "x": 117.952,
              "z": 182.069,
              "y": 18.783
            }
          },
          {
            "id": "ncc_060_s1",
            "type": "straight",
            "connectsFloors": [
              1,
              2
            ],
            "y0": 18.783,
            "y1": 22.783,
            "height": 4,
            "rotation": 0,
            "rect": {
              "minX": 113.264,
              "maxX": 118.264,
              "minZ": 181.119,
              "maxZ": 183.019
            },
            "steps": [
              {
                "minX": 113.264,
                "maxX": 113.889,
                "minZ": 181.119,
                "maxZ": 183.019,
                "top": 19.283
              },
              {
                "minX": 113.889,
                "maxX": 114.514,
                "minZ": 181.119,
                "maxZ": 183.019,
                "top": 19.783
              },
              {
                "minX": 114.514,
                "maxX": 115.139,
                "minZ": 181.119,
                "maxZ": 183.019,
                "top": 20.283
              },
              {
                "minX": 115.139,
                "maxX": 115.764,
                "minZ": 181.119,
                "maxZ": 183.019,
                "top": 20.783
              },
              {
                "minX": 115.764,
                "maxX": 116.389,
                "minZ": 181.119,
                "maxZ": 183.019,
                "top": 21.283
              },
              {
                "minX": 116.389,
                "maxX": 117.014,
                "minZ": 181.119,
                "maxZ": 183.019,
                "top": 21.783
              },
              {
                "minX": 117.014,
                "maxX": 117.639,
                "minZ": 181.119,
                "maxZ": 183.019,
                "top": 22.283
              },
              {
                "minX": 117.639,
                "maxX": 118.264,
                "minZ": 181.119,
                "maxZ": 183.019,
                "top": 22.783
              }
            ],
            "bottom": {
              "x": 113.577,
              "z": 182.069,
              "y": 19.283
            },
            "top": {
              "x": 117.952,
              "z": 182.069,
              "y": 22.783
            }
          },
          {
            "id": "ncc_060_s2",
            "type": "straight",
            "connectsFloors": [
              2,
              3
            ],
            "y0": 22.783,
            "y1": 26.783,
            "height": 4,
            "rotation": 0,
            "rect": {
              "minX": 113.264,
              "maxX": 118.264,
              "minZ": 181.119,
              "maxZ": 183.019
            },
            "steps": [
              {
                "minX": 113.264,
                "maxX": 113.889,
                "minZ": 181.119,
                "maxZ": 183.019,
                "top": 23.283
              },
              {
                "minX": 113.889,
                "maxX": 114.514,
                "minZ": 181.119,
                "maxZ": 183.019,
                "top": 23.783
              },
              {
                "minX": 114.514,
                "maxX": 115.139,
                "minZ": 181.119,
                "maxZ": 183.019,
                "top": 24.283
              },
              {
                "minX": 115.139,
                "maxX": 115.764,
                "minZ": 181.119,
                "maxZ": 183.019,
                "top": 24.783
              },
              {
                "minX": 115.764,
                "maxX": 116.389,
                "minZ": 181.119,
                "maxZ": 183.019,
                "top": 25.283
              },
              {
                "minX": 116.389,
                "maxX": 117.014,
                "minZ": 181.119,
                "maxZ": 183.019,
                "top": 25.783
              },
              {
                "minX": 117.014,
                "maxX": 117.639,
                "minZ": 181.119,
                "maxZ": 183.019,
                "top": 26.283
              },
              {
                "minX": 117.639,
                "maxX": 118.264,
                "minZ": 181.119,
                "maxZ": 183.019,
                "top": 26.783
              }
            ],
            "bottom": {
              "x": 113.577,
              "z": 182.069,
              "y": 23.283
            },
            "top": {
              "x": 117.952,
              "z": 182.069,
              "y": 26.783
            }
          }
        ],
        "doors": [
          {
            "id": "ncc_060_r0→ncc_s_h1_3",
            "room": "ncc_060_r0",
            "target": "ncc_s_h1_3",
            "linkType": "main_entrance",
            "axis": "x",
            "y": 14.783,
            "height": 2.1,
            "rect": {
              "minX": 114.614,
              "maxX": 116.414,
              "minZ": 185.384,
              "maxZ": 185.754
            },
            "inside": {
              "x": 115.596,
              "z": 184.167
            },
            "outside": {
              "x": 115.706,
              "z": 186.965
            }
          }
        ]
      },
      {
        "id": "ncc_061",
        "name": "ncc_061",
        "isEnterable": false,
        "baseY": 14.783,
        "floorHeight": 4.5,
        "floorsCount": 26,
        "roofY": 131.783,
        "facadeMaterial": "stone_base",
        "footprint": [
          {
            "x": 143.9,
            "z": 162.409
          },
          {
            "x": 151.9,
            "z": 162.409
          },
          {
            "x": 151.9,
            "z": 170.409
          },
          {
            "x": 143.9,
            "z": 170.409
          }
        ],
        "bounds": {
          "minX": 143.9,
          "maxX": 151.9,
          "minZ": 162.409,
          "maxZ": 170.409
        },
        "rotation": -6.4,
        "rects": [
          {
            "minX": 143.9,
            "maxX": 151.9,
            "minZ": 162.409,
            "maxZ": 170.409
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 143.725,
            "maxX": 144.075,
            "minZ": 162.409,
            "maxZ": 170.409,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 143.9,
            "maxX": 151.9,
            "minZ": 162.234,
            "maxZ": 162.584,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 143.9,
            "maxX": 151.9,
            "minZ": 170.234,
            "maxZ": 170.584,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 151.725,
            "maxX": 152.075,
            "minZ": 162.409,
            "maxZ": 170.409,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_061_t1",
        "name": "ncc_061_t1",
        "isEnterable": false,
        "baseY": 117,
        "floorHeight": 4.5,
        "floorsCount": 16,
        "roofY": 189,
        "facadeMaterial": "glass_steel",
        "footprint": [
          {
            "x": 144.402,
            "z": 162.944
          },
          {
            "x": 150.902,
            "z": 162.944
          },
          {
            "x": 150.902,
            "z": 169.944
          },
          {
            "x": 144.402,
            "z": 169.944
          }
        ],
        "bounds": {
          "minX": 144.402,
          "maxX": 150.902,
          "minZ": 162.944,
          "maxZ": 169.944
        },
        "rotation": -6.4,
        "rects": [
          {
            "minX": 144.402,
            "maxX": 150.902,
            "minZ": 162.944,
            "maxZ": 169.944
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 144.227,
            "maxX": 144.577,
            "minZ": 162.944,
            "maxZ": 169.944,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 144.402,
            "maxX": 150.902,
            "minZ": 162.769,
            "maxZ": 163.119,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 144.402,
            "maxX": 150.902,
            "minZ": 169.769,
            "maxZ": 170.119,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 150.727,
            "maxX": 151.077,
            "minZ": 162.944,
            "maxZ": 169.944,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_062",
        "name": "ncc_062",
        "isEnterable": false,
        "baseY": 14.783,
        "floorHeight": 4.5,
        "floorsCount": 11,
        "roofY": 64.283,
        "facadeMaterial": "stone_base",
        "footprint": [
          {
            "x": 155.255,
            "z": 160.846
          },
          {
            "x": 162.755,
            "z": 160.846
          },
          {
            "x": 162.755,
            "z": 168.346
          },
          {
            "x": 155.255,
            "z": 168.346
          }
        ],
        "bounds": {
          "minX": 155.255,
          "maxX": 162.755,
          "minZ": 160.846,
          "maxZ": 168.346
        },
        "rotation": -7.29,
        "rects": [
          {
            "minX": 155.255,
            "maxX": 162.755,
            "minZ": 160.846,
            "maxZ": 168.346
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 155.08,
            "maxX": 155.43,
            "minZ": 160.846,
            "maxZ": 168.346,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 155.255,
            "maxX": 162.755,
            "minZ": 160.671,
            "maxZ": 161.021,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 155.255,
            "maxX": 162.755,
            "minZ": 168.171,
            "maxZ": 168.521,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 162.58,
            "maxX": 162.93,
            "minZ": 160.846,
            "maxZ": 168.346,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_062_top",
        "name": "ncc_062_top",
        "isEnterable": false,
        "baseY": 49.5,
        "floorHeight": 4.5,
        "floorsCount": 31,
        "roofY": 189,
        "facadeMaterial": "panel_block",
        "footprint": [
          {
            "x": 156.255,
            "z": 161.846
          },
          {
            "x": 161.755,
            "z": 161.846
          },
          {
            "x": 161.755,
            "z": 167.346
          },
          {
            "x": 156.255,
            "z": 167.346
          }
        ],
        "bounds": {
          "minX": 156.255,
          "maxX": 161.755,
          "minZ": 161.846,
          "maxZ": 167.346
        },
        "rotation": -7.29,
        "rects": [
          {
            "minX": 156.255,
            "maxX": 161.755,
            "minZ": 161.846,
            "maxZ": 167.346
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 156.08,
            "maxX": 156.43,
            "minZ": 161.846,
            "maxZ": 167.346,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 156.255,
            "maxX": 161.755,
            "minZ": 161.671,
            "maxZ": 162.021,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 156.255,
            "maxX": 161.755,
            "minZ": 167.171,
            "maxZ": 167.521,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 161.58,
            "maxX": 161.93,
            "minZ": 161.846,
            "maxZ": 167.346,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_063",
        "name": "ncc_063",
        "isEnterable": true,
        "baseY": 14.783,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 28.783,
        "facadeMaterial": "stone_base",
        "footprint": [
          {
            "x": 145.396,
            "z": 173.305
          },
          {
            "x": 153.396,
            "z": 173.305
          },
          {
            "x": 153.396,
            "z": 180.805
          },
          {
            "x": 145.396,
            "z": 180.805
          }
        ],
        "bounds": {
          "minX": 145.396,
          "maxX": 153.396,
          "minZ": 173.305,
          "maxZ": 180.805
        },
        "rotation": -6.42,
        "rects": [
          {
            "minX": 145.396,
            "maxX": 153.396,
            "minZ": 173.305,
            "maxZ": 180.805
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 145.221,
            "maxX": 145.571,
            "minZ": 173.305,
            "maxZ": 180.805,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 145.396,
            "maxX": 153.396,
            "minZ": 173.13,
            "maxZ": 173.48,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 145.396,
            "maxX": 153.396,
            "minZ": 180.63,
            "maxZ": 180.98,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 153.221,
            "maxX": 153.571,
            "minZ": 173.305,
            "maxZ": 180.805,
            "facade": true
          }
        ],
        "rooms": [
          {
            "id": "ncc_063_r0",
            "type": "hall",
            "floor": 0,
            "rect": {
              "minX": 145.396,
              "maxX": 153.396,
              "minZ": 173.305,
              "maxZ": 180.805
            },
            "y": 14.783
          },
          {
            "id": "ncc_063_r1",
            "type": "corridor",
            "floor": 1,
            "rect": {
              "minX": 145.396,
              "maxX": 153.396,
              "minZ": 173.305,
              "maxZ": 180.805
            },
            "y": 18.283
          },
          {
            "id": "ncc_063_r2",
            "type": "corridor",
            "floor": 2,
            "rect": {
              "minX": 145.396,
              "maxX": 153.396,
              "minZ": 173.305,
              "maxZ": 180.805
            },
            "y": 21.783
          },
          {
            "id": "ncc_063_r3",
            "type": "utility",
            "floor": 3,
            "rect": {
              "minX": 145.396,
              "maxX": 153.396,
              "minZ": 173.305,
              "maxZ": 180.805
            },
            "y": 25.283
          }
        ],
        "stairs": [
          {
            "id": "ncc_063_s0",
            "type": "spiral",
            "connectsFloors": [
              0,
              1
            ],
            "y0": 14.783,
            "y1": 18.283,
            "height": 3.5,
            "rotation": 0,
            "rect": {
              "minX": 147.696,
              "maxX": 151.096,
              "minZ": 175.60500000000002,
              "maxZ": 179.00500000000002
            },
            "steps": [
              {
                "minX": 149.707,
                "maxX": 151.096,
                "minZ": 177.305,
                "maxZ": 177.996,
                "top": 15.016
              },
              {
                "minX": 149.624,
                "maxX": 150.949,
                "minZ": 177.443,
                "maxZ": 178.568,
                "top": 15.25
              },
              {
                "minX": 149.501,
                "maxX": 150.534,
                "minZ": 177.558,
                "maxZ": 178.922,
                "top": 15.483
              },
              {
                "minX": 149.218,
                "maxX": 149.921,
                "minZ": 177.628,
                "maxZ": 178.996,
                "top": 15.716
              },
              {
                "minX": 148.546,
                "maxX": 149.36,
                "minZ": 177.599,
                "maxZ": 178.996,
                "top": 15.95
              },
              {
                "minX": 148.021,
                "maxX": 149.226,
                "minZ": 177.505,
                "maxZ": 178.777,
                "top": 16.183
              },
              {
                "minX": 147.733,
                "maxX": 149.121,
                "minZ": 177.376,
                "maxZ": 178.304,
                "top": 16.416
              },
              {
                "minX": 147.733,
                "maxX": 149.063,
                "minZ": 176.952,
                "maxZ": 177.658,
                "top": 16.65
              },
              {
                "minX": 147.733,
                "maxX": 149.121,
                "minZ": 176.306,
                "maxZ": 177.234,
                "top": 16.883
              },
              {
                "minX": 148.021,
                "maxX": 149.226,
                "minZ": 175.833,
                "maxZ": 177.105,
                "top": 17.116
              },
              {
                "minX": 148.546,
                "maxX": 149.36,
                "minZ": 175.614,
                "maxZ": 177.011,
                "top": 17.35
              },
              {
                "minX": 149.218,
                "maxX": 149.921,
                "minZ": 175.614,
                "maxZ": 176.982,
                "top": 17.583
              },
              {
                "minX": 149.501,
                "maxX": 150.534,
                "minZ": 175.688,
                "maxZ": 177.052,
                "top": 17.816
              },
              {
                "minX": 149.624,
                "maxX": 150.949,
                "minZ": 176.042,
                "maxZ": 177.167,
                "top": 18.05
              },
              {
                "minX": 149.707,
                "maxX": 151.096,
                "minZ": 176.614,
                "maxZ": 177.305,
                "top": 18.283
              }
            ],
            "bottom": {
              "x": 150.402,
              "z": 177.651,
              "y": 15.016
            },
            "top": {
              "x": 150.402,
              "z": 176.96,
              "y": 18.283
            }
          },
          {
            "id": "ncc_063_s1",
            "type": "spiral",
            "connectsFloors": [
              1,
              2
            ],
            "y0": 18.283,
            "y1": 21.783,
            "height": 3.5,
            "rotation": 0,
            "rect": {
              "minX": 147.696,
              "maxX": 151.096,
              "minZ": 175.60500000000002,
              "maxZ": 179.00500000000002
            },
            "steps": [
              {
                "minX": 149.707,
                "maxX": 151.096,
                "minZ": 177.305,
                "maxZ": 177.996,
                "top": 18.516
              },
              {
                "minX": 149.624,
                "maxX": 150.949,
                "minZ": 177.443,
                "maxZ": 178.568,
                "top": 18.75
              },
              {
                "minX": 149.501,
                "maxX": 150.534,
                "minZ": 177.558,
                "maxZ": 178.922,
                "top": 18.983
              },
              {
                "minX": 149.218,
                "maxX": 149.921,
                "minZ": 177.628,
                "maxZ": 178.996,
                "top": 19.216
              },
              {
                "minX": 148.546,
                "maxX": 149.36,
                "minZ": 177.599,
                "maxZ": 178.996,
                "top": 19.45
              },
              {
                "minX": 148.021,
                "maxX": 149.226,
                "minZ": 177.505,
                "maxZ": 178.777,
                "top": 19.683
              },
              {
                "minX": 147.733,
                "maxX": 149.121,
                "minZ": 177.376,
                "maxZ": 178.304,
                "top": 19.916
              },
              {
                "minX": 147.733,
                "maxX": 149.063,
                "minZ": 176.952,
                "maxZ": 177.658,
                "top": 20.15
              },
              {
                "minX": 147.733,
                "maxX": 149.121,
                "minZ": 176.306,
                "maxZ": 177.234,
                "top": 20.383
              },
              {
                "minX": 148.021,
                "maxX": 149.226,
                "minZ": 175.833,
                "maxZ": 177.105,
                "top": 20.616
              },
              {
                "minX": 148.546,
                "maxX": 149.36,
                "minZ": 175.614,
                "maxZ": 177.011,
                "top": 20.85
              },
              {
                "minX": 149.218,
                "maxX": 149.921,
                "minZ": 175.614,
                "maxZ": 176.982,
                "top": 21.083
              },
              {
                "minX": 149.501,
                "maxX": 150.534,
                "minZ": 175.688,
                "maxZ": 177.052,
                "top": 21.316
              },
              {
                "minX": 149.624,
                "maxX": 150.949,
                "minZ": 176.042,
                "maxZ": 177.167,
                "top": 21.55
              },
              {
                "minX": 149.707,
                "maxX": 151.096,
                "minZ": 176.614,
                "maxZ": 177.305,
                "top": 21.783
              }
            ],
            "bottom": {
              "x": 150.402,
              "z": 177.651,
              "y": 18.516
            },
            "top": {
              "x": 150.402,
              "z": 176.96,
              "y": 21.783
            }
          },
          {
            "id": "ncc_063_s2",
            "type": "spiral",
            "connectsFloors": [
              2,
              3
            ],
            "y0": 21.783,
            "y1": 25.283,
            "height": 3.5,
            "rotation": 0,
            "rect": {
              "minX": 147.696,
              "maxX": 151.096,
              "minZ": 175.60500000000002,
              "maxZ": 179.00500000000002
            },
            "steps": [
              {
                "minX": 149.707,
                "maxX": 151.096,
                "minZ": 177.305,
                "maxZ": 177.996,
                "top": 22.016
              },
              {
                "minX": 149.624,
                "maxX": 150.949,
                "minZ": 177.443,
                "maxZ": 178.568,
                "top": 22.25
              },
              {
                "minX": 149.501,
                "maxX": 150.534,
                "minZ": 177.558,
                "maxZ": 178.922,
                "top": 22.483
              },
              {
                "minX": 149.218,
                "maxX": 149.921,
                "minZ": 177.628,
                "maxZ": 178.996,
                "top": 22.716
              },
              {
                "minX": 148.546,
                "maxX": 149.36,
                "minZ": 177.599,
                "maxZ": 178.996,
                "top": 22.95
              },
              {
                "minX": 148.021,
                "maxX": 149.226,
                "minZ": 177.505,
                "maxZ": 178.777,
                "top": 23.183
              },
              {
                "minX": 147.733,
                "maxX": 149.121,
                "minZ": 177.376,
                "maxZ": 178.304,
                "top": 23.416
              },
              {
                "minX": 147.733,
                "maxX": 149.063,
                "minZ": 176.952,
                "maxZ": 177.658,
                "top": 23.65
              },
              {
                "minX": 147.733,
                "maxX": 149.121,
                "minZ": 176.306,
                "maxZ": 177.234,
                "top": 23.883
              },
              {
                "minX": 148.021,
                "maxX": 149.226,
                "minZ": 175.833,
                "maxZ": 177.105,
                "top": 24.116
              },
              {
                "minX": 148.546,
                "maxX": 149.36,
                "minZ": 175.614,
                "maxZ": 177.011,
                "top": 24.35
              },
              {
                "minX": 149.218,
                "maxX": 149.921,
                "minZ": 175.614,
                "maxZ": 176.982,
                "top": 24.583
              },
              {
                "minX": 149.501,
                "maxX": 150.534,
                "minZ": 175.688,
                "maxZ": 177.052,
                "top": 24.816
              },
              {
                "minX": 149.624,
                "maxX": 150.949,
                "minZ": 176.042,
                "maxZ": 177.167,
                "top": 25.05
              },
              {
                "minX": 149.707,
                "maxX": 151.096,
                "minZ": 176.614,
                "maxZ": 177.305,
                "top": 25.283
              }
            ],
            "bottom": {
              "x": 150.402,
              "z": 177.651,
              "y": 22.016
            },
            "top": {
              "x": 150.402,
              "z": 176.96,
              "y": 25.283
            }
          }
        ],
        "doors": [
          {
            "id": "ncc_063_r0→ncc_s_h1_4",
            "room": "ncc_063_r0",
            "target": "ncc_s_h1_4",
            "linkType": "main_entrance",
            "axis": "x",
            "y": 14.783,
            "height": 2.1,
            "rect": {
              "minX": 148.496,
              "maxX": 150.296,
              "minZ": 180.62,
              "maxZ": 180.99
            },
            "inside": {
              "x": 149.659,
              "z": 179.39
            },
            "outside": {
              "x": 149.972,
              "z": 182.173
            }
          }
        ]
      },
      {
        "id": "ncc_064",
        "name": "ncc_064",
        "isEnterable": false,
        "baseY": 14.783,
        "floorHeight": 4,
        "floorsCount": 4,
        "roofY": 30.783,
        "facadeMaterial": "panel_block",
        "footprint": [
          {
            "x": 156.361,
            "z": 172.304
          },
          {
            "x": 163.861,
            "z": 172.304
          },
          {
            "x": 163.861,
            "z": 179.804
          },
          {
            "x": 156.361,
            "z": 179.804
          }
        ],
        "bounds": {
          "minX": 156.361,
          "maxX": 163.861,
          "minZ": 172.304,
          "maxZ": 179.804
        },
        "rotation": -12.635,
        "rects": [
          {
            "minX": 156.361,
            "maxX": 163.861,
            "minZ": 172.304,
            "maxZ": 179.804
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 156.186,
            "maxX": 156.536,
            "minZ": 172.304,
            "maxZ": 179.804,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 156.361,
            "maxX": 163.861,
            "minZ": 172.129,
            "maxZ": 172.479,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 156.361,
            "maxX": 163.861,
            "minZ": 179.629,
            "maxZ": 179.979,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 163.686,
            "maxX": 164.036,
            "minZ": 172.304,
            "maxZ": 179.804,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_064_top",
        "name": "ncc_064_top",
        "isEnterable": false,
        "baseY": 16,
        "floorHeight": 4.5,
        "floorsCount": 11,
        "roofY": 65.5,
        "facadeMaterial": "stone_base",
        "footprint": [
          {
            "x": 157.328,
            "z": 173.341
          },
          {
            "x": 162.328,
            "z": 173.341
          },
          {
            "x": 162.328,
            "z": 178.341
          },
          {
            "x": 157.328,
            "z": 178.341
          }
        ],
        "bounds": {
          "minX": 157.328,
          "maxX": 162.328,
          "minZ": 173.341,
          "maxZ": 178.341
        },
        "rotation": -12.635,
        "rects": [
          {
            "minX": 157.328,
            "maxX": 162.328,
            "minZ": 173.341,
            "maxZ": 178.341
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 157.153,
            "maxX": 157.503,
            "minZ": 173.341,
            "maxZ": 178.341,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 157.328,
            "maxX": 162.328,
            "minZ": 173.166,
            "maxZ": 173.516,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 157.328,
            "maxX": 162.328,
            "minZ": 178.166,
            "maxZ": 178.516,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 162.153,
            "maxX": 162.503,
            "minZ": 173.341,
            "maxZ": 178.341,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_065",
        "name": "ncc_065",
        "isEnterable": false,
        "baseY": 14.783,
        "floorHeight": 4,
        "floorsCount": 12,
        "roofY": 62.783,
        "facadeMaterial": "panel_block",
        "footprint": [
          {
            "x": 184.01,
            "z": 156.843
          },
          {
            "x": 191.01,
            "z": 156.843
          },
          {
            "x": 191.01,
            "z": 164.843
          },
          {
            "x": 184.01,
            "z": 164.843
          }
        ],
        "bounds": {
          "minX": 184.01,
          "maxX": 191.01,
          "minZ": 156.843,
          "maxZ": 164.843
        },
        "rotation": -11.823,
        "rects": [
          {
            "minX": 184.01,
            "maxX": 191.01,
            "minZ": 156.843,
            "maxZ": 164.843
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 183.835,
            "maxX": 184.185,
            "minZ": 156.843,
            "maxZ": 164.843,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 184.01,
            "maxX": 191.01,
            "minZ": 156.668,
            "maxZ": 157.018,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 184.01,
            "maxX": 191.01,
            "minZ": 164.668,
            "maxZ": 165.018,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 190.835,
            "maxX": 191.185,
            "minZ": 156.843,
            "maxZ": 164.843,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_066",
        "name": "ncc_066",
        "isEnterable": false,
        "baseY": 14.783,
        "floorHeight": 4.5,
        "floorsCount": 32,
        "roofY": 158.783,
        "facadeMaterial": "glass_steel",
        "footprint": [
          {
            "x": 194.473,
            "z": 156.307
          },
          {
            "x": 202.473,
            "z": 156.307
          },
          {
            "x": 202.473,
            "z": 163.307
          },
          {
            "x": 194.473,
            "z": 163.307
          }
        ],
        "bounds": {
          "minX": 194.473,
          "maxX": 202.473,
          "minZ": 156.307,
          "maxZ": 163.307
        },
        "rotation": -4.155,
        "rects": [
          {
            "minX": 194.473,
            "maxX": 202.473,
            "minZ": 156.307,
            "maxZ": 163.307
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 194.298,
            "maxX": 194.648,
            "minZ": 156.307,
            "maxZ": 163.307,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 194.473,
            "maxX": 202.473,
            "minZ": 156.132,
            "maxZ": 156.482,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 194.473,
            "maxX": 202.473,
            "minZ": 163.132,
            "maxZ": 163.482,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 202.298,
            "maxX": 202.648,
            "minZ": 156.307,
            "maxZ": 163.307,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_067",
        "name": "ncc_067",
        "isEnterable": false,
        "baseY": 14.783,
        "floorHeight": 4,
        "floorsCount": 16,
        "roofY": 78.783,
        "facadeMaterial": "panel_block",
        "footprint": [
          {
            "x": 185.541,
            "z": 167.735
          },
          {
            "x": 192.541,
            "z": 167.735
          },
          {
            "x": 192.541,
            "z": 175.735
          },
          {
            "x": 185.541,
            "z": 175.735
          }
        ],
        "bounds": {
          "minX": 185.541,
          "maxX": 192.541,
          "minZ": 167.735,
          "maxZ": 175.735
        },
        "rotation": -7.808,
        "rects": [
          {
            "minX": 185.541,
            "maxX": 192.541,
            "minZ": 167.735,
            "maxZ": 175.735
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 185.366,
            "maxX": 185.716,
            "minZ": 167.735,
            "maxZ": 175.735,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 185.541,
            "maxX": 192.541,
            "minZ": 167.56,
            "maxZ": 167.91,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 185.541,
            "maxX": 192.541,
            "minZ": 175.56,
            "maxZ": 175.91,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 192.366,
            "maxX": 192.716,
            "minZ": 167.735,
            "maxZ": 175.735,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_068",
        "name": "ncc_068",
        "isEnterable": false,
        "baseY": 14.783,
        "floorHeight": 4.5,
        "floorsCount": 41,
        "roofY": 199.283,
        "facadeMaterial": "panel_block",
        "footprint": [
          {
            "x": 195.902,
            "z": 166.242
          },
          {
            "x": 203.402,
            "z": 166.242
          },
          {
            "x": 203.402,
            "z": 173.742
          },
          {
            "x": 195.902,
            "z": 173.742
          }
        ],
        "bounds": {
          "minX": 195.902,
          "maxX": 203.402,
          "minZ": 166.242,
          "maxZ": 173.742
        },
        "rotation": -2.188,
        "rects": [
          {
            "minX": 195.902,
            "maxX": 203.402,
            "minZ": 166.242,
            "maxZ": 173.742
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 195.727,
            "maxX": 196.077,
            "minZ": 166.242,
            "maxZ": 173.742,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 195.902,
            "maxX": 203.402,
            "minZ": 166.067,
            "maxZ": 166.417,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 195.902,
            "maxX": 203.402,
            "minZ": 173.567,
            "maxZ": 173.917,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 203.227,
            "maxX": 203.577,
            "minZ": 166.242,
            "maxZ": 173.742,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_069",
        "name": "ncc_069",
        "isEnterable": false,
        "baseY": 14.783,
        "floorHeight": 4.5,
        "floorsCount": 9,
        "roofY": 55.283,
        "facadeMaterial": "stone_base",
        "footprint": [
          {
            "x": -7.765,
            "z": 223.969
          },
          {
            "x": 10.235,
            "z": 223.969
          },
          {
            "x": 10.235,
            "z": 241.969
          },
          {
            "x": -7.765,
            "z": 241.969
          }
        ],
        "bounds": {
          "minX": -7.765,
          "maxX": 10.235,
          "minZ": 223.969,
          "maxZ": 241.969
        },
        "rotation": -8.807,
        "rects": [
          {
            "minX": -7.765,
            "maxX": 10.235,
            "minZ": 223.969,
            "maxZ": 241.969
          }
        ],
        "walls": [
          {
            "axis": "x",
            "minX": -7.765,
            "maxX": 10.235,
            "minZ": 223.794,
            "maxZ": 224.144,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -7.765,
            "maxX": 10.235,
            "minZ": 241.794,
            "maxZ": 242.144,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -7.94,
            "maxX": -7.59,
            "minZ": 223.969,
            "maxZ": 241.969,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 10.06,
            "maxX": 10.41,
            "minZ": 223.969,
            "maxZ": 241.969,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_069_top",
        "name": "ncc_069_top",
        "isEnterable": false,
        "baseY": 40.5,
        "floorHeight": 4.5,
        "floorsCount": 27,
        "roofY": 162,
        "facadeMaterial": "stone_base",
        "footprint": [
          {
            "x": -1.789,
            "z": 227.121
          },
          {
            "x": 9.211,
            "z": 227.121
          },
          {
            "x": 9.211,
            "z": 238.121
          },
          {
            "x": -1.789,
            "z": 238.121
          }
        ],
        "bounds": {
          "minX": -1.789,
          "maxX": 9.211,
          "minZ": 227.121,
          "maxZ": 238.121
        },
        "rotation": -8.807,
        "rects": [
          {
            "minX": -1.789,
            "maxX": 9.211,
            "minZ": 227.121,
            "maxZ": 238.121
          }
        ],
        "walls": [
          {
            "axis": "x",
            "minX": -1.789,
            "maxX": 9.211,
            "minZ": 226.946,
            "maxZ": 227.296,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -1.789,
            "maxX": 9.211,
            "minZ": 237.946,
            "maxZ": 238.296,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -1.964,
            "maxX": -1.614,
            "minZ": 227.121,
            "maxZ": 238.121,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 9.036,
            "maxX": 9.386,
            "minZ": 227.121,
            "maxZ": 238.121,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_070",
        "name": "ncc_070",
        "isEnterable": false,
        "baseY": 14.783,
        "floorHeight": 4.5,
        "floorsCount": 30,
        "roofY": 149.783,
        "facadeMaterial": "glass_steel",
        "footprint": [
          {
            "x": 38.102,
            "z": 226.258
          },
          {
            "x": 30.602,
            "z": 226.258
          },
          {
            "x": 30.602,
            "z": 218.758
          },
          {
            "x": 38.102,
            "z": 218.758
          }
        ],
        "bounds": {
          "minX": 30.602,
          "maxX": 38.102,
          "minZ": 218.758,
          "maxZ": 226.258
        },
        "rotation": -9.683,
        "rects": [
          {
            "minX": 30.602,
            "maxX": 38.102,
            "minZ": 218.758,
            "maxZ": 226.258
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 30.427,
            "maxX": 30.777,
            "minZ": 218.758,
            "maxZ": 226.258,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 30.602,
            "maxX": 38.102,
            "minZ": 218.583,
            "maxZ": 218.933,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 30.602,
            "maxX": 38.102,
            "minZ": 226.083,
            "maxZ": 226.433,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 37.927,
            "maxX": 38.277,
            "minZ": 218.758,
            "maxZ": 226.258,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_071",
        "name": "ncc_071",
        "isEnterable": false,
        "baseY": 14.783,
        "floorHeight": 4.5,
        "floorsCount": 33,
        "roofY": 163.283,
        "facadeMaterial": "glass_and_concrete",
        "footprint": [
          {
            "x": 49.527,
            "z": 224.69
          },
          {
            "x": 46.027,
            "z": 224.69
          },
          {
            "x": 46.027,
            "z": 220.19
          },
          {
            "x": 41.527,
            "z": 220.19
          },
          {
            "x": 41.527,
            "z": 217.69
          },
          {
            "x": 49.527,
            "z": 217.69
          }
        ],
        "bounds": {
          "minX": 41.527,
          "maxX": 49.527,
          "minZ": 217.69,
          "maxZ": 224.69
        },
        "rotation": -2.938,
        "rects": [
          {
            "minX": 41.527,
            "maxX": 49.527,
            "minZ": 217.69,
            "maxZ": 220.19
          },
          {
            "minX": 46.027,
            "maxX": 49.527,
            "minZ": 220.19,
            "maxZ": 224.69
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 41.352,
            "maxX": 41.702,
            "minZ": 217.69,
            "maxZ": 220.19,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 41.527,
            "maxX": 46.027,
            "minZ": 220.015,
            "maxZ": 220.365,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 41.527,
            "maxX": 49.527,
            "minZ": 217.515,
            "maxZ": 217.865,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 45.852,
            "maxX": 46.202,
            "minZ": 220.19,
            "maxZ": 224.69,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 46.027,
            "maxX": 49.527,
            "minZ": 224.515,
            "maxZ": 224.865,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 49.352,
            "maxX": 49.702,
            "minZ": 217.69,
            "maxZ": 224.69,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_072",
        "name": "ncc_072",
        "isEnterable": true,
        "baseY": 14.783,
        "floorHeight": 4,
        "floorsCount": 4,
        "roofY": 30.783,
        "facadeMaterial": "panel_block",
        "footprint": [
          {
            "x": 32.168,
            "z": 229.649
          },
          {
            "x": 39.668,
            "z": 229.649
          },
          {
            "x": 39.668,
            "z": 237.649
          },
          {
            "x": 32.168,
            "z": 237.649
          }
        ],
        "bounds": {
          "minX": 32.168,
          "maxX": 39.668,
          "minZ": 229.649,
          "maxZ": 237.649
        },
        "rotation": -2.948,
        "rects": [
          {
            "minX": 32.168,
            "maxX": 39.668,
            "minZ": 229.649,
            "maxZ": 237.649
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 31.993,
            "maxX": 32.343,
            "minZ": 229.649,
            "maxZ": 237.649,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 32.168,
            "maxX": 39.668,
            "minZ": 229.474,
            "maxZ": 229.824,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 32.168,
            "maxX": 39.668,
            "minZ": 237.474,
            "maxZ": 237.824,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 39.493,
            "maxX": 39.843,
            "minZ": 229.649,
            "maxZ": 237.649,
            "facade": true
          }
        ],
        "rooms": [
          {
            "id": "ncc_072_r0",
            "type": "hall",
            "floor": 0,
            "rect": {
              "minX": 32.168,
              "maxX": 39.668,
              "minZ": 229.649,
              "maxZ": 237.649
            },
            "y": 14.783
          },
          {
            "id": "ncc_072_r1",
            "type": "utility",
            "floor": 1,
            "rect": {
              "minX": 32.168,
              "maxX": 39.668,
              "minZ": 229.649,
              "maxZ": 237.649
            },
            "y": 18.783
          },
          {
            "id": "ncc_072_r2",
            "type": "office",
            "floor": 2,
            "rect": {
              "minX": 32.168,
              "maxX": 39.668,
              "minZ": 229.649,
              "maxZ": 237.649
            },
            "y": 22.783
          },
          {
            "id": "ncc_072_r3",
            "type": "utility",
            "floor": 3,
            "rect": {
              "minX": 32.168,
              "maxX": 39.668,
              "minZ": 229.649,
              "maxZ": 237.649
            },
            "y": 26.783
          }
        ],
        "stairs": [
          {
            "id": "ncc_072_s0",
            "type": "spiral",
            "connectsFloors": [
              0,
              1
            ],
            "y0": 14.783,
            "y1": 18.783,
            "height": 4,
            "rotation": 90,
            "rect": {
              "minX": 34.468,
              "maxX": 37.868,
              "minZ": 231.949,
              "maxZ": 235.34900000000002
            },
            "steps": [
              {
                "minX": 35.477,
                "maxX": 36.168,
                "minZ": 233.96,
                "maxZ": 235.349,
                "top": 15.05
              },
              {
                "minX": 34.905,
                "maxX": 36.03,
                "minZ": 233.877,
                "maxZ": 235.202,
                "top": 15.316
              },
              {
                "minX": 34.551,
                "maxX": 35.915,
                "minZ": 233.754,
                "maxZ": 234.787,
                "top": 15.583
              },
              {
                "minX": 34.477,
                "maxX": 35.845,
                "minZ": 233.471,
                "maxZ": 234.174,
                "top": 15.85
              },
              {
                "minX": 34.477,
                "maxX": 35.874,
                "minZ": 232.799,
                "maxZ": 233.613,
                "top": 16.116
              },
              {
                "minX": 34.696,
                "maxX": 35.968,
                "minZ": 232.274,
                "maxZ": 233.479,
                "top": 16.383
              },
              {
                "minX": 35.169,
                "maxX": 36.097,
                "minZ": 231.986,
                "maxZ": 233.374,
                "top": 16.65
              },
              {
                "minX": 35.815,
                "maxX": 36.521,
                "minZ": 231.986,
                "maxZ": 233.316,
                "top": 16.916
              },
              {
                "minX": 36.239,
                "maxX": 37.167,
                "minZ": 231.986,
                "maxZ": 233.374,
                "top": 17.183
              },
              {
                "minX": 36.368,
                "maxX": 37.64,
                "minZ": 232.274,
                "maxZ": 233.479,
                "top": 17.45
              },
              {
                "minX": 36.462,
                "maxX": 37.859,
                "minZ": 232.799,
                "maxZ": 233.613,
                "top": 17.716
              },
              {
                "minX": 36.491,
                "maxX": 37.859,
                "minZ": 233.471,
                "maxZ": 234.174,
                "top": 17.983
              },
              {
                "minX": 36.421,
                "maxX": 37.785,
                "minZ": 233.754,
                "maxZ": 234.787,
                "top": 18.25
              },
              {
                "minX": 36.306,
                "maxX": 37.431,
                "minZ": 233.877,
                "maxZ": 235.202,
                "top": 18.516
              },
              {
                "minX": 36.168,
                "maxX": 36.859,
                "minZ": 233.96,
                "maxZ": 235.349,
                "top": 18.783
              }
            ],
            "bottom": {
              "x": 35.823,
              "z": 234.654,
              "y": 15.05
            },
            "top": {
              "x": 36.514,
              "z": 234.654,
              "y": 18.783
            }
          },
          {
            "id": "ncc_072_s1",
            "type": "spiral",
            "connectsFloors": [
              1,
              2
            ],
            "y0": 18.783,
            "y1": 22.783,
            "height": 4,
            "rotation": 90,
            "rect": {
              "minX": 34.468,
              "maxX": 37.868,
              "minZ": 231.949,
              "maxZ": 235.34900000000002
            },
            "steps": [
              {
                "minX": 35.477,
                "maxX": 36.168,
                "minZ": 233.96,
                "maxZ": 235.349,
                "top": 19.05
              },
              {
                "minX": 34.905,
                "maxX": 36.03,
                "minZ": 233.877,
                "maxZ": 235.202,
                "top": 19.316
              },
              {
                "minX": 34.551,
                "maxX": 35.915,
                "minZ": 233.754,
                "maxZ": 234.787,
                "top": 19.583
              },
              {
                "minX": 34.477,
                "maxX": 35.845,
                "minZ": 233.471,
                "maxZ": 234.174,
                "top": 19.85
              },
              {
                "minX": 34.477,
                "maxX": 35.874,
                "minZ": 232.799,
                "maxZ": 233.613,
                "top": 20.116
              },
              {
                "minX": 34.696,
                "maxX": 35.968,
                "minZ": 232.274,
                "maxZ": 233.479,
                "top": 20.383
              },
              {
                "minX": 35.169,
                "maxX": 36.097,
                "minZ": 231.986,
                "maxZ": 233.374,
                "top": 20.65
              },
              {
                "minX": 35.815,
                "maxX": 36.521,
                "minZ": 231.986,
                "maxZ": 233.316,
                "top": 20.916
              },
              {
                "minX": 36.239,
                "maxX": 37.167,
                "minZ": 231.986,
                "maxZ": 233.374,
                "top": 21.183
              },
              {
                "minX": 36.368,
                "maxX": 37.64,
                "minZ": 232.274,
                "maxZ": 233.479,
                "top": 21.45
              },
              {
                "minX": 36.462,
                "maxX": 37.859,
                "minZ": 232.799,
                "maxZ": 233.613,
                "top": 21.716
              },
              {
                "minX": 36.491,
                "maxX": 37.859,
                "minZ": 233.471,
                "maxZ": 234.174,
                "top": 21.983
              },
              {
                "minX": 36.421,
                "maxX": 37.785,
                "minZ": 233.754,
                "maxZ": 234.787,
                "top": 22.25
              },
              {
                "minX": 36.306,
                "maxX": 37.431,
                "minZ": 233.877,
                "maxZ": 235.202,
                "top": 22.516
              },
              {
                "minX": 36.168,
                "maxX": 36.859,
                "minZ": 233.96,
                "maxZ": 235.349,
                "top": 22.783
              }
            ],
            "bottom": {
              "x": 35.823,
              "z": 234.654,
              "y": 19.05
            },
            "top": {
              "x": 36.514,
              "z": 234.654,
              "y": 22.783
            }
          },
          {
            "id": "ncc_072_s2",
            "type": "spiral",
            "connectsFloors": [
              2,
              3
            ],
            "y0": 22.783,
            "y1": 26.783,
            "height": 4,
            "rotation": 90,
            "rect": {
              "minX": 34.468,
              "maxX": 37.868,
              "minZ": 231.949,
              "maxZ": 235.34900000000002
            },
            "steps": [
              {
                "minX": 35.477,
                "maxX": 36.168,
                "minZ": 233.96,
                "maxZ": 235.349,
                "top": 23.05
              },
              {
                "minX": 34.905,
                "maxX": 36.03,
                "minZ": 233.877,
                "maxZ": 235.202,
                "top": 23.316
              },
              {
                "minX": 34.551,
                "maxX": 35.915,
                "minZ": 233.754,
                "maxZ": 234.787,
                "top": 23.583
              },
              {
                "minX": 34.477,
                "maxX": 35.845,
                "minZ": 233.471,
                "maxZ": 234.174,
                "top": 23.85
              },
              {
                "minX": 34.477,
                "maxX": 35.874,
                "minZ": 232.799,
                "maxZ": 233.613,
                "top": 24.116
              },
              {
                "minX": 34.696,
                "maxX": 35.968,
                "minZ": 232.274,
                "maxZ": 233.479,
                "top": 24.383
              },
              {
                "minX": 35.169,
                "maxX": 36.097,
                "minZ": 231.986,
                "maxZ": 233.374,
                "top": 24.65
              },
              {
                "minX": 35.815,
                "maxX": 36.521,
                "minZ": 231.986,
                "maxZ": 233.316,
                "top": 24.916
              },
              {
                "minX": 36.239,
                "maxX": 37.167,
                "minZ": 231.986,
                "maxZ": 233.374,
                "top": 25.183
              },
              {
                "minX": 36.368,
                "maxX": 37.64,
                "minZ": 232.274,
                "maxZ": 233.479,
                "top": 25.45
              },
              {
                "minX": 36.462,
                "maxX": 37.859,
                "minZ": 232.799,
                "maxZ": 233.613,
                "top": 25.716
              },
              {
                "minX": 36.491,
                "maxX": 37.859,
                "minZ": 233.471,
                "maxZ": 234.174,
                "top": 25.983
              },
              {
                "minX": 36.421,
                "maxX": 37.785,
                "minZ": 233.754,
                "maxZ": 234.787,
                "top": 26.25
              },
              {
                "minX": 36.306,
                "maxX": 37.431,
                "minZ": 233.877,
                "maxZ": 235.202,
                "top": 26.516
              },
              {
                "minX": 36.168,
                "maxX": 36.859,
                "minZ": 233.96,
                "maxZ": 235.349,
                "top": 26.783
              }
            ],
            "bottom": {
              "x": 35.823,
              "z": 234.654,
              "y": 23.05
            },
            "top": {
              "x": 36.514,
              "z": 234.654,
              "y": 26.783
            }
          }
        ],
        "doors": [
          {
            "id": "ncc_072_r0→ncc_s_v1_1",
            "room": "ncc_072_r0",
            "target": "ncc_s_v1_1",
            "linkType": "main_entrance",
            "axis": "z",
            "y": 14.783,
            "height": 2.1,
            "rect": {
              "minX": 31.983,
              "maxX": 32.353,
              "minZ": 232.749,
              "maxZ": 234.549
            },
            "inside": {
              "x": 33.571,
              "z": 233.77
            },
            "outside": {
              "x": 30.775,
              "z": 233.914
            }
          }
        ]
      },
      {
        "id": "ncc_073",
        "name": "ncc_073",
        "isEnterable": false,
        "baseY": 14.783,
        "floorHeight": 4,
        "floorsCount": 12,
        "roofY": 62.783,
        "facadeMaterial": "panel_block",
        "footprint": [
          {
            "x": 43.558,
            "z": 228.583
          },
          {
            "x": 50.558,
            "z": 228.583
          },
          {
            "x": 50.558,
            "z": 235.583
          },
          {
            "x": 43.558,
            "z": 235.583
          }
        ],
        "bounds": {
          "minX": 43.558,
          "maxX": 50.558,
          "minZ": 228.583,
          "maxZ": 235.583
        },
        "rotation": -2.653,
        "rects": [
          {
            "minX": 43.558,
            "maxX": 50.558,
            "minZ": 228.583,
            "maxZ": 235.583
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 43.383,
            "maxX": 43.733,
            "minZ": 228.583,
            "maxZ": 235.583,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 43.558,
            "maxX": 50.558,
            "minZ": 228.408,
            "maxZ": 228.758,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 43.558,
            "maxX": 50.558,
            "minZ": 235.408,
            "maxZ": 235.758,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 50.383,
            "maxX": 50.733,
            "minZ": 228.583,
            "maxZ": 235.583,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_074_a",
        "name": "ncc_074_a",
        "isEnterable": false,
        "baseY": 14.783,
        "floorHeight": 4,
        "floorsCount": 10,
        "roofY": 54.783,
        "facadeMaterial": "glass_steel",
        "footprint": [
          {
            "x": 71.023,
            "z": 213.774
          },
          {
            "x": 76.523,
            "z": 213.774
          },
          {
            "x": 76.523,
            "z": 231.774
          },
          {
            "x": 71.023,
            "z": 231.774
          }
        ],
        "bounds": {
          "minX": 71.023,
          "maxX": 76.523,
          "minZ": 213.774,
          "maxZ": 231.774
        },
        "rotation": -2.473,
        "rects": [
          {
            "minX": 71.023,
            "maxX": 76.523,
            "minZ": 213.774,
            "maxZ": 231.774
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 70.848,
            "maxX": 71.198,
            "minZ": 213.774,
            "maxZ": 231.774,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 71.023,
            "maxX": 76.523,
            "minZ": 213.599,
            "maxZ": 213.949,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 71.023,
            "maxX": 76.523,
            "minZ": 231.599,
            "maxZ": 231.949,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 76.348,
            "maxX": 76.698,
            "minZ": 213.774,
            "maxZ": 231.774,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_074_b",
        "name": "ncc_074_b",
        "isEnterable": false,
        "baseY": 14.783,
        "floorHeight": 4,
        "floorsCount": 12,
        "roofY": 62.783,
        "facadeMaterial": "glass_steel",
        "footprint": [
          {
            "x": 83.894,
            "z": 211.93
          },
          {
            "x": 89.894,
            "z": 211.93
          },
          {
            "x": 89.894,
            "z": 229.93
          },
          {
            "x": 83.894,
            "z": 229.93
          }
        ],
        "bounds": {
          "minX": 83.894,
          "maxX": 89.894,
          "minZ": 211.93,
          "maxZ": 229.93
        },
        "rotation": -2.473,
        "rects": [
          {
            "minX": 83.894,
            "maxX": 89.894,
            "minZ": 211.93,
            "maxZ": 229.93
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 83.719,
            "maxX": 84.069,
            "minZ": 211.93,
            "maxZ": 229.93,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 83.894,
            "maxX": 89.894,
            "minZ": 211.755,
            "maxZ": 212.105,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 83.894,
            "maxX": 89.894,
            "minZ": 229.755,
            "maxZ": 230.105,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 89.719,
            "maxX": 90.069,
            "minZ": 211.93,
            "maxZ": 229.93,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_075",
        "name": "ncc_075",
        "isEnterable": false,
        "baseY": 14.783,
        "floorHeight": 4.5,
        "floorsCount": 41,
        "roofY": 199.283,
        "facadeMaterial": "glass_and_concrete",
        "footprint": [
          {
            "x": 111.204,
            "z": 212.224
          },
          {
            "x": 129.704,
            "z": 212.224
          },
          {
            "x": 129.704,
            "z": 222.224
          },
          {
            "x": 111.204,
            "z": 222.224
          }
        ],
        "bounds": {
          "minX": 111.204,
          "maxX": 129.704,
          "minZ": 212.224,
          "maxZ": 222.224
        },
        "rotation": -8.137,
        "rects": [
          {
            "minX": 111.204,
            "maxX": 129.704,
            "minZ": 212.224,
            "maxZ": 222.224
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 111.029,
            "maxX": 111.379,
            "minZ": 212.224,
            "maxZ": 222.224,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 111.204,
            "maxX": 129.704,
            "minZ": 212.049,
            "maxZ": 212.399,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 111.204,
            "maxX": 129.704,
            "minZ": 222.049,
            "maxZ": 222.399,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 129.529,
            "maxX": 129.879,
            "minZ": 212.224,
            "maxZ": 222.224,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_076",
        "name": "ncc_076",
        "isEnterable": false,
        "baseY": 14.783,
        "floorHeight": 3.5,
        "floorsCount": 10,
        "roofY": 49.783,
        "facadeMaterial": "glass_steel",
        "footprint": [
          {
            "x": 150.644,
            "z": 201.204
          },
          {
            "x": 168.644,
            "z": 201.204
          },
          {
            "x": 168.644,
            "z": 219.704
          },
          {
            "x": 150.644,
            "z": 219.704
          }
        ],
        "bounds": {
          "minX": 150.644,
          "maxX": 168.644,
          "minZ": 201.204,
          "maxZ": 219.704
        },
        "rotation": -12.32,
        "rects": [
          {
            "minX": 150.644,
            "maxX": 168.644,
            "minZ": 201.204,
            "maxZ": 219.704
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 150.469,
            "maxX": 150.819,
            "minZ": 201.204,
            "maxZ": 219.704,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 150.644,
            "maxX": 168.644,
            "minZ": 201.029,
            "maxZ": 201.379,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 150.644,
            "maxX": 168.644,
            "minZ": 219.529,
            "maxZ": 219.879,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 168.469,
            "maxX": 168.819,
            "minZ": 201.204,
            "maxZ": 219.704,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_077",
        "name": "ncc_077",
        "isEnterable": false,
        "baseY": 14.783,
        "floorHeight": 4.5,
        "floorsCount": 41,
        "roofY": 199.283,
        "facadeMaterial": "glass_and_concrete",
        "footprint": [
          {
            "x": 189.556,
            "z": 196.151
          },
          {
            "x": 208.056,
            "z": 196.151
          },
          {
            "x": 208.056,
            "z": 203.651
          },
          {
            "x": 189.556,
            "z": 203.651
          }
        ],
        "bounds": {
          "minX": 189.556,
          "maxX": 208.056,
          "minZ": 196.151,
          "maxZ": 203.651
        },
        "rotation": -5.406,
        "rects": [
          {
            "minX": 189.556,
            "maxX": 208.056,
            "minZ": 196.151,
            "maxZ": 203.651
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 189.381,
            "maxX": 189.731,
            "minZ": 196.151,
            "maxZ": 203.651,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 189.556,
            "maxX": 208.056,
            "minZ": 195.976,
            "maxZ": 196.326,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 189.556,
            "maxX": 208.056,
            "minZ": 203.476,
            "maxZ": 203.826,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 207.881,
            "maxX": 208.231,
            "minZ": 196.151,
            "maxZ": 203.651,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_078",
        "name": "ncc_078",
        "isEnterable": false,
        "baseY": 14.783,
        "floorHeight": 4,
        "floorsCount": 4,
        "roofY": 30.783,
        "facadeMaterial": "glass_steel",
        "footprint": [
          {
            "x": 190.576,
            "z": 207.383
          },
          {
            "x": 198.076,
            "z": 207.383
          },
          {
            "x": 198.076,
            "z": 214.883
          },
          {
            "x": 190.576,
            "z": 214.883
          }
        ],
        "bounds": {
          "minX": 190.576,
          "maxX": 198.076,
          "minZ": 207.383,
          "maxZ": 214.883
        },
        "rotation": -10.095,
        "rects": [
          {
            "minX": 190.576,
            "maxX": 198.076,
            "minZ": 207.383,
            "maxZ": 214.883
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 190.401,
            "maxX": 190.751,
            "minZ": 207.383,
            "maxZ": 214.883,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 190.576,
            "maxX": 198.076,
            "minZ": 207.208,
            "maxZ": 207.558,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 190.576,
            "maxX": 198.076,
            "minZ": 214.708,
            "maxZ": 215.058,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 197.901,
            "maxX": 198.251,
            "minZ": 207.383,
            "maxZ": 214.883,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_078_t1",
        "name": "ncc_078_t1",
        "isEnterable": false,
        "baseY": 16,
        "floorHeight": 4.5,
        "floorsCount": 2,
        "roofY": 25,
        "facadeMaterial": "glass_steel",
        "footprint": [
          {
            "x": 191.076,
            "z": 207.883
          },
          {
            "x": 197.576,
            "z": 207.883
          },
          {
            "x": 197.576,
            "z": 214.383
          },
          {
            "x": 191.076,
            "z": 214.383
          }
        ],
        "bounds": {
          "minX": 191.076,
          "maxX": 197.576,
          "minZ": 207.883,
          "maxZ": 214.383
        },
        "rotation": -10.095,
        "rects": [
          {
            "minX": 191.076,
            "maxX": 197.576,
            "minZ": 207.883,
            "maxZ": 214.383
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 190.901,
            "maxX": 191.251,
            "minZ": 207.883,
            "maxZ": 214.383,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 191.076,
            "maxX": 197.576,
            "minZ": 207.708,
            "maxZ": 208.058,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 191.076,
            "maxX": 197.576,
            "minZ": 214.208,
            "maxZ": 214.558,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 197.401,
            "maxX": 197.751,
            "minZ": 207.883,
            "maxZ": 214.383,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "ncc_079",
        "name": "ncc_079",
        "isEnterable": false,
        "baseY": 14.783,
        "floorHeight": 4.5,
        "floorsCount": 35,
        "roofY": 172.283,
        "facadeMaterial": "glass_steel",
        "footprint": [
          {
            "x": 209.533,
            "z": 213.778
          },
          {
            "x": 202.033,
            "z": 213.778
          },
          {
            "x": 202.033,
            "z": 206.278
          },
          {
            "x": 209.533,
            "z": 206.278
          }
        ],
        "bounds": {
          "minX": 202.033,
          "maxX": 209.533,
          "minZ": 206.278,
          "maxZ": 213.778
        },
        "rotation": -11.399,
        "rects": [
          {
            "minX": 202.033,
            "maxX": 209.533,
            "minZ": 206.278,
            "maxZ": 213.778
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 201.858,
            "maxX": 202.208,
            "minZ": 206.278,
            "maxZ": 213.778,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 202.033,
            "maxX": 209.533,
            "minZ": 206.103,
            "maxZ": 206.453,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 202.033,
            "maxX": 209.533,
            "minZ": 213.603,
            "maxZ": 213.953,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 209.358,
            "maxX": 209.708,
            "minZ": 206.278,
            "maxZ": 213.778,
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
        "id": "rd_quay_s",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -280,
            "maxX": 280,
            "minZ": -175,
            "maxZ": -165,
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
            "id": "lamp_rd_quay_s_-270_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -270,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-270_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -270,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-250_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -250,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-250_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -250,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-230_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -230,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-230_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -230,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-210_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -210,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-210_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -210,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-190_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -190,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-190_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -190,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-170_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -170,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-170_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -170,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-150_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -150,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-150_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -150,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-130_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -130,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-130_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -130,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-110_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -110,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-110_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -110,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-90_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -90,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-90_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -90,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-70_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -70,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-70_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -70,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-50_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -50,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-50_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -50,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-30_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -30,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-30_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -30,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-10_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -10,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_-10_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -10,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_10_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 10,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_10_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 10,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_30_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 30,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_30_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 30,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_50_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 50,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_50_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 50,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_70_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 70,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_70_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 70,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_90_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 90,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_90_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 90,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_110_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 110,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_110_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 110,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_130_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 130,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_130_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 130,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_150_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 150,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_150_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 150,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_170_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 170,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_170_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 170,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_190_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 190,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_190_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 190,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_210_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 210,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_210_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 210,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_230_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 230,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_230_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 230,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_250_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 250,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_250_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 250,
              "y": 0.12,
              "z": -163.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_270_-176.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 270,
              "y": 0.12,
              "z": -176.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_s_270_-163.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 270,
              "y": 0.12,
              "z": -163.6
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
        "id": "rd_quay_n",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -280,
            "maxX": 280,
            "minZ": -74,
            "maxZ": -64,
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
            "id": "lamp_rd_quay_n_-270_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -270,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-270_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -270,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-250_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -250,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-250_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -250,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-230_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -230,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-230_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -230,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-210_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -210,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-210_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -210,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-190_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -190,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-190_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -190,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-170_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -170,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-170_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -170,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-150_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -150,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-150_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -150,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-130_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -130,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-130_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -130,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-110_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -110,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-110_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -110,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-90_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -90,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-90_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -90,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-70_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -70,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-70_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -70,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-50_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -50,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-50_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -50,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-30_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -30,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-30_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -30,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-10_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -10,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_-10_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -10,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_10_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 10,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_10_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 10,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_30_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 30,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_30_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 30,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_50_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 50,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_50_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 50,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_70_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 70,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_70_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 70,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_90_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 90,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_90_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 90,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_110_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 110,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_110_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 110,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_130_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 130,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_130_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 130,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_150_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 150,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_150_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 150,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_170_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 170,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_170_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 170,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_190_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 190,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_190_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 190,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_210_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 210,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_210_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 210,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_230_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 230,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_230_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 230,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_250_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 250,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_250_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 250,
              "y": 0.12,
              "z": -62.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_270_-75.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 270,
              "y": 0.12,
              "z": -75.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_quay_n_270_-62.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 270,
              "y": 0.12,
              "z": -62.6
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
        "id": "rd_port_ave",
        "type": "ground",
        "width": 8,
        "withLamps": true,
        "decks": [
          {
            "minX": -24,
            "maxX": -16,
            "minZ": -290,
            "maxZ": -175,
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
            "id": "lamp_rd_port_ave_-25.4_-280",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -25.4,
              "y": 0.12,
              "z": -280
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_port_ave_-14.6_-280",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -14.6,
              "y": 0.12,
              "z": -280
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_port_ave_-25.4_-260",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -25.4,
              "y": 0.12,
              "z": -260
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_port_ave_-14.6_-260",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -14.6,
              "y": 0.12,
              "z": -260
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_port_ave_-25.4_-240",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -25.4,
              "y": 0.12,
              "z": -240
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_port_ave_-14.6_-240",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -14.6,
              "y": 0.12,
              "z": -240
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_port_ave_-25.4_-220",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -25.4,
              "y": 0.12,
              "z": -220
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_port_ave_-14.6_-220",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -14.6,
              "y": 0.12,
              "z": -220
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_port_ave_-25.4_-200",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -25.4,
              "y": 0.12,
              "z": -200
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_port_ave_-14.6_-200",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -14.6,
              "y": 0.12,
              "z": -200
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_port_ave_-25.4_-180",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -25.4,
              "y": 0.12,
              "z": -180
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_port_ave_-14.6_-180",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -14.6,
              "y": 0.12,
              "z": -180
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
        "id": "rd_low_link",
        "type": "ground",
        "width": 8,
        "withLamps": true,
        "decks": [
          {
            "minX": -90,
            "maxX": 50,
            "minZ": -254,
            "maxZ": -246,
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
            "id": "lamp_rd_low_link_-80_-255.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -80,
              "y": 0.12,
              "z": -255.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_low_link_-80_-244.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -80,
              "y": 0.12,
              "z": -244.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_low_link_-60_-255.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -60,
              "y": 0.12,
              "z": -255.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_low_link_-60_-244.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -60,
              "y": 0.12,
              "z": -244.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_low_link_-40_-255.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -40,
              "y": 0.12,
              "z": -255.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_low_link_-40_-244.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -40,
              "y": 0.12,
              "z": -244.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_low_link_-20_-255.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -20,
              "y": 0.12,
              "z": -255.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_low_link_-20_-244.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -20,
              "y": 0.12,
              "z": -244.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_low_link_0_-255.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 0,
              "y": 0.12,
              "z": -255.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_low_link_0_-244.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 0,
              "y": 0.12,
              "z": -244.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_low_link_20_-255.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 20,
              "y": 0.12,
              "z": -255.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_low_link_20_-244.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 20,
              "y": 0.12,
              "z": -244.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_low_link_40_-255.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 40,
              "y": 0.12,
              "z": -255.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_low_link_40_-244.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 40,
              "y": 0.12,
              "z": -244.6
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
        "id": "rd_plate_ave",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -280,
            "maxX": -260,
            "minZ": 113,
            "maxZ": 123,
            "axis": "x",
            "topY": 14.702,
            "bottomY": 14.102,
            "topAtMin": 14.702,
            "topAtMax": 14.871,
            "ramp": true
          },
          {
            "minX": -260,
            "maxX": -237,
            "minZ": 113,
            "maxZ": 123,
            "axis": "x",
            "topY": 14.871,
            "bottomY": 14.271,
            "topAtMin": 14.871,
            "topAtMax": 14.886,
            "ramp": true
          },
          {
            "minX": -237,
            "maxX": -129,
            "minZ": 113,
            "maxZ": 123,
            "axis": "x",
            "topY": 14.556,
            "bottomY": 13.956,
            "topAtMin": 14.886,
            "topAtMax": 14.556,
            "ramp": true
          },
          {
            "minX": -129,
            "maxX": -107,
            "minZ": 113,
            "maxZ": 123,
            "axis": "x",
            "topY": 14.556,
            "bottomY": 13.956,
            "topAtMin": 14.556,
            "topAtMax": 14.613,
            "ramp": true
          },
          {
            "minX": -107,
            "maxX": -53,
            "minZ": 113,
            "maxZ": 123,
            "axis": "x",
            "topY": 14.613,
            "bottomY": 14.013,
            "topAtMin": 14.613,
            "topAtMax": 14.898,
            "ramp": true
          },
          {
            "minX": -53,
            "maxX": 104,
            "minZ": 113,
            "maxZ": 123,
            "axis": "x",
            "topY": 14.898,
            "bottomY": 14.298,
            "topAtMin": 14.898,
            "topAtMax": 14.898,
            "ramp": false
          },
          {
            "minX": 104,
            "maxX": 121,
            "minZ": 113,
            "maxZ": 123,
            "axis": "x",
            "topY": 14.783,
            "bottomY": 14.183,
            "topAtMin": 14.898,
            "topAtMax": 14.783,
            "ramp": true
          },
          {
            "minX": 121,
            "maxX": 158,
            "minZ": 113,
            "maxZ": 123,
            "axis": "x",
            "topY": 14.308,
            "bottomY": 13.708,
            "topAtMin": 14.783,
            "topAtMax": 14.308,
            "ramp": true
          },
          {
            "minX": 158,
            "maxX": 175,
            "minZ": 113,
            "maxZ": 123,
            "axis": "x",
            "topY": 14.158,
            "bottomY": 13.558,
            "topAtMin": 14.308,
            "topAtMax": 14.158,
            "ramp": true
          },
          {
            "minX": 175,
            "maxX": 194,
            "minZ": 113,
            "maxZ": 123,
            "axis": "x",
            "topY": 14.128,
            "bottomY": 13.528,
            "topAtMin": 14.158,
            "topAtMax": 14.128,
            "ramp": true
          },
          {
            "minX": 194,
            "maxX": 218,
            "minZ": 113,
            "maxZ": 123,
            "axis": "x",
            "topY": 14.128,
            "bottomY": 13.528,
            "topAtMin": 14.128,
            "topAtMax": 14.268,
            "ramp": true
          },
          {
            "minX": 218,
            "maxX": 223,
            "minZ": 113,
            "maxZ": 123,
            "axis": "x",
            "topY": 14.145,
            "bottomY": 13.545,
            "topAtMin": 14.268,
            "topAtMax": 14.145,
            "ramp": true
          },
          {
            "minX": 223,
            "maxX": 235,
            "minZ": 113,
            "maxZ": 123,
            "axis": "x",
            "topY": 13.547,
            "bottomY": 12.947,
            "topAtMin": 14.145,
            "topAtMax": 13.547,
            "ramp": true
          },
          {
            "minX": 235,
            "maxX": 240,
            "minZ": 113,
            "maxZ": 123,
            "axis": "x",
            "topY": 13.417,
            "bottomY": 12.817,
            "topAtMin": 13.547,
            "topAtMax": 13.417,
            "ramp": true
          },
          {
            "minX": 240,
            "maxX": 280,
            "minZ": 113,
            "maxZ": 123,
            "axis": "x",
            "topY": 13.415,
            "bottomY": 12.815,
            "topAtMin": 13.417,
            "topAtMax": 13.415,
            "ramp": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_rd_plate_ave_-43_111.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -43,
              "y": 14.898,
              "z": 111.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_plate_ave_-43_124.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -43,
              "y": 14.898,
              "z": 124.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_plate_ave_-23_111.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -23,
              "y": 14.898,
              "z": 111.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_plate_ave_-23_124.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -23,
              "y": 14.898,
              "z": 124.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_plate_ave_-3_111.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -3,
              "y": 14.898,
              "z": 111.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_plate_ave_-3_124.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -3,
              "y": 14.898,
              "z": 124.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_plate_ave_17_111.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 17,
              "y": 14.898,
              "z": 111.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_plate_ave_17_124.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 17,
              "y": 14.898,
              "z": 124.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_plate_ave_37_111.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 37,
              "y": 14.898,
              "z": 111.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_plate_ave_37_124.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 37,
              "y": 14.898,
              "z": 124.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_plate_ave_57_111.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 57,
              "y": 14.898,
              "z": 111.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_plate_ave_57_124.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 57,
              "y": 14.898,
              "z": 124.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_plate_ave_77_111.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 77,
              "y": 14.898,
              "z": 111.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_plate_ave_77_124.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 77,
              "y": 14.898,
              "z": 124.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_plate_ave_97_111.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 97,
              "y": 14.898,
              "z": 111.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_plate_ave_97_124.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 97,
              "y": 14.898,
              "z": 124.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_plate_ave_250_111.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 250,
              "y": 13.415,
              "z": 111.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_plate_ave_250_124.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 250,
              "y": 13.415,
              "z": 124.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_plate_ave_270_111.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 270,
              "y": 13.415,
              "z": 111.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_rd_plate_ave_270_124.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": 270,
              "y": 13.415,
              "z": 124.4
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
        "id": "rd_scarp_ave",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -165,
            "maxX": -155,
            "minZ": -64,
            "maxZ": -56,
            "axis": "z",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.141,
            "ramp": true
          },
          {
            "minX": -165,
            "maxX": -155,
            "minZ": -56,
            "maxZ": -50,
            "axis": "z",
            "topY": 0.141,
            "bottomY": -0.459,
            "topAtMin": 0.141,
            "topAtMax": 0.264,
            "ramp": true
          },
          {
            "minX": -165,
            "maxX": -155,
            "minZ": -50,
            "maxZ": -43,
            "axis": "z",
            "topY": 0.264,
            "bottomY": -0.336,
            "topAtMin": 0.264,
            "topAtMax": 0.575,
            "ramp": true
          },
          {
            "minX": -165,
            "maxX": -155,
            "minZ": -43,
            "maxZ": -37,
            "axis": "z",
            "topY": 0.575,
            "bottomY": -0.025,
            "topAtMin": 0.575,
            "topAtMax": 0.996,
            "ramp": true
          },
          {
            "minX": -165,
            "maxX": -155,
            "minZ": -37,
            "maxZ": -29,
            "axis": "z",
            "topY": 0.996,
            "bottomY": 0.396,
            "topAtMin": 0.996,
            "topAtMax": 1.767,
            "ramp": true
          },
          {
            "minX": -165,
            "maxX": -155,
            "minZ": -29,
            "maxZ": -14,
            "axis": "z",
            "topY": 1.767,
            "bottomY": 1.167,
            "topAtMin": 1.767,
            "topAtMax": 3.55,
            "ramp": true
          },
          {
            "minX": -165,
            "maxX": -155,
            "minZ": -14,
            "maxZ": -9,
            "axis": "z",
            "topY": 3.55,
            "bottomY": 2.95,
            "topAtMin": 3.55,
            "topAtMax": 4.071,
            "ramp": true
          },
          {
            "minX": -165,
            "maxX": -155,
            "minZ": -9,
            "maxZ": 20,
            "axis": "z",
            "topY": 4.071,
            "bottomY": 3.471,
            "topAtMin": 4.071,
            "topAtMax": 6.27,
            "ramp": true
          },
          {
            "minX": -165,
            "maxX": -155,
            "minZ": 20,
            "maxZ": 34,
            "axis": "z",
            "topY": 6.27,
            "bottomY": 5.67,
            "topAtMin": 6.27,
            "topAtMax": 7.437,
            "ramp": true
          },
          {
            "minX": -165,
            "maxX": -155,
            "minZ": 34,
            "maxZ": 43,
            "axis": "z",
            "topY": 7.437,
            "bottomY": 6.837,
            "topAtMin": 7.437,
            "topAtMax": 8.372,
            "ramp": true
          },
          {
            "minX": -165,
            "maxX": -155,
            "minZ": 43,
            "maxZ": 67,
            "axis": "z",
            "topY": 8.372,
            "bottomY": 7.772,
            "topAtMin": 8.372,
            "topAtMax": 11.067,
            "ramp": true
          },
          {
            "minX": -165,
            "maxX": -155,
            "minZ": 67,
            "maxZ": 79,
            "axis": "z",
            "topY": 11.067,
            "bottomY": 10.467,
            "topAtMin": 11.067,
            "topAtMax": 12.26,
            "ramp": true
          },
          {
            "minX": -165,
            "maxX": -155,
            "minZ": 79,
            "maxZ": 91,
            "axis": "z",
            "topY": 12.26,
            "bottomY": 11.66,
            "topAtMin": 12.26,
            "topAtMax": 13.234,
            "ramp": true
          },
          {
            "minX": -165,
            "maxX": -155,
            "minZ": 91,
            "maxZ": 98,
            "axis": "z",
            "topY": 13.234,
            "bottomY": 12.634,
            "topAtMin": 13.234,
            "topAtMax": 13.688,
            "ramp": true
          },
          {
            "minX": -165,
            "maxX": -155,
            "minZ": 98,
            "maxZ": 105,
            "axis": "z",
            "topY": 13.688,
            "bottomY": 13.088,
            "topAtMin": 13.688,
            "topAtMax": 14.057,
            "ramp": true
          },
          {
            "minX": -165,
            "maxX": -155,
            "minZ": 105,
            "maxZ": 109,
            "axis": "z",
            "topY": 14.057,
            "bottomY": 13.457,
            "topAtMin": 14.057,
            "topAtMax": 14.44,
            "ramp": true
          },
          {
            "minX": -165,
            "maxX": -155,
            "minZ": 109,
            "maxZ": 113,
            "axis": "z",
            "topY": 14.44,
            "bottomY": 13.84,
            "topAtMin": 14.44,
            "topAtMax": 14.651,
            "ramp": true
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "br_west",
        "type": "bridge",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": -198,
            "maxX": -186,
            "minZ": -165,
            "maxZ": -135,
            "obb": {
              "cx": -192,
              "cz": -150,
              "hx": 15,
              "hz": 6,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": -192,
            "cz": -150,
            "yaw": 90,
            "length": 30,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 3,
            "ramp": true,
            "rails": true
          },
          {
            "minX": -198,
            "maxX": -186,
            "minZ": -135,
            "maxZ": -104.5,
            "obb": {
              "cx": -192,
              "cz": -119.75,
              "hx": 15.25,
              "hz": 6,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": -192,
            "cz": -119.75,
            "yaw": 90,
            "length": 30.5,
            "width": 12,
            "axis": "x",
            "topY": 3,
            "bottomY": 2.4,
            "topAtMin": 3,
            "topAtMax": 3,
            "ramp": false,
            "rails": true
          },
          {
            "minX": -198,
            "maxX": -186,
            "minZ": -104.5,
            "maxZ": -74,
            "obb": {
              "cx": -192,
              "cz": -89.25,
              "hx": 15.25,
              "hz": 6,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": -192,
            "cz": -89.25,
            "yaw": 90,
            "length": 30.5,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 3,
            "topAtMax": 0.12,
            "ramp": true,
            "rails": true
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [
          {
            "id": "pillar_br_west_-187.2_-147",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -187.2,
              "y": -4,
              "z": -147
            },
            "scale": {
              "x": 1.6,
              "y": 5.248,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_west_-196.8_-147",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -196.8,
              "y": -4,
              "z": -147
            },
            "scale": {
              "x": 1.6,
              "y": 5.248,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_west_-187.2_-129",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -187.2,
              "y": -4,
              "z": -129
            },
            "scale": {
              "x": 1.6,
              "y": 6.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_west_-196.8_-129",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -196.8,
              "y": -4,
              "z": -129
            },
            "scale": {
              "x": 1.6,
              "y": 6.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_west_-187.2_-117",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -187.2,
              "y": -4,
              "z": -117
            },
            "scale": {
              "x": 1.6,
              "y": 6.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_west_-196.8_-117",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -196.8,
              "y": -4,
              "z": -117
            },
            "scale": {
              "x": 1.6,
              "y": 6.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_west_-187.2_-105",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -187.2,
              "y": -4,
              "z": -105
            },
            "scale": {
              "x": 1.6,
              "y": 6.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_west_-196.8_-105",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -196.8,
              "y": -4,
              "z": -105
            },
            "scale": {
              "x": 1.6,
              "y": 6.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_west_-187.2_-98.5",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -187.2,
              "y": -4,
              "z": -98.5
            },
            "scale": {
              "x": 1.6,
              "y": 5.833,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_west_-196.8_-98.5",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -196.8,
              "y": -4,
              "z": -98.5
            },
            "scale": {
              "x": 1.6,
              "y": 5.833,
              "z": 1.6
            }
          }
        ],
        "lamps": [
          {
            "id": "lamp_br_west_-184.6_-125",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -184.6,
              "y": 3,
              "z": -125
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_br_west_-199.4_-125",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -199.4,
              "y": 3,
              "z": -125
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_br_west_-184.6_-105",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -184.6,
              "y": 3,
              "z": -105
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_br_west_-199.4_-105",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -199.4,
              "y": 3,
              "z": -105
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
        "id": "br_mid",
        "type": "bridge",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 54,
            "maxX": 66,
            "minZ": -165,
            "maxZ": -135,
            "obb": {
              "cx": 60,
              "cz": -150,
              "hx": 15,
              "hz": 6,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": 60,
            "cz": -150,
            "yaw": 90,
            "length": 30,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 3,
            "ramp": true,
            "rails": true
          },
          {
            "minX": 54,
            "maxX": 66,
            "minZ": -135,
            "maxZ": -104.5,
            "obb": {
              "cx": 60,
              "cz": -119.75,
              "hx": 15.25,
              "hz": 6,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": 60,
            "cz": -119.75,
            "yaw": 90,
            "length": 30.5,
            "width": 12,
            "axis": "x",
            "topY": 3,
            "bottomY": 2.4,
            "topAtMin": 3,
            "topAtMax": 3,
            "ramp": false,
            "rails": true
          },
          {
            "minX": 54,
            "maxX": 66,
            "minZ": -104.5,
            "maxZ": -74,
            "obb": {
              "cx": 60,
              "cz": -89.25,
              "hx": 15.25,
              "hz": 6,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": 60,
            "cz": -89.25,
            "yaw": 90,
            "length": 30.5,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 3,
            "topAtMax": 0.12,
            "ramp": true,
            "rails": true
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [
          {
            "id": "pillar_br_mid_64.8_-147",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": 64.8,
              "y": -4,
              "z": -147
            },
            "scale": {
              "x": 1.6,
              "y": 5.248,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_mid_55.2_-147",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": 55.2,
              "y": -4,
              "z": -147
            },
            "scale": {
              "x": 1.6,
              "y": 5.248,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_mid_64.8_-129",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": 64.8,
              "y": -4,
              "z": -129
            },
            "scale": {
              "x": 1.6,
              "y": 6.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_mid_55.2_-129",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": 55.2,
              "y": -4,
              "z": -129
            },
            "scale": {
              "x": 1.6,
              "y": 6.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_mid_64.8_-117",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": 64.8,
              "y": -4,
              "z": -117
            },
            "scale": {
              "x": 1.6,
              "y": 6.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_mid_55.2_-117",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": 55.2,
              "y": -4,
              "z": -117
            },
            "scale": {
              "x": 1.6,
              "y": 6.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_mid_64.8_-105",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": 64.8,
              "y": -4,
              "z": -105
            },
            "scale": {
              "x": 1.6,
              "y": 6.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_mid_55.2_-105",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": 55.2,
              "y": -4,
              "z": -105
            },
            "scale": {
              "x": 1.6,
              "y": 6.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_mid_64.8_-98.5",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": 64.8,
              "y": -4,
              "z": -98.5
            },
            "scale": {
              "x": 1.6,
              "y": 5.833,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_mid_55.2_-98.5",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": 55.2,
              "y": -4,
              "z": -98.5
            },
            "scale": {
              "x": 1.6,
              "y": 5.833,
              "z": 1.6
            }
          }
        ],
        "lamps": [
          {
            "id": "lamp_br_mid_67.4_-125",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 67.4,
              "y": 3,
              "z": -125
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_br_mid_52.6_-125",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": 52.6,
              "y": 3,
              "z": -125
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_br_mid_67.4_-105",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 67.4,
              "y": 3,
              "z": -105
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_br_mid_52.6_-105",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": 52.6,
              "y": 3,
              "z": -105
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
        "id": "br_east",
        "type": "bridge",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 164,
            "maxX": 176,
            "minZ": -165,
            "maxZ": -135,
            "obb": {
              "cx": 170,
              "cz": -150,
              "hx": 15,
              "hz": 6,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": 170,
            "cz": -150,
            "yaw": 90,
            "length": 30,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 3,
            "ramp": true,
            "rails": true
          },
          {
            "minX": 164,
            "maxX": 176,
            "minZ": -135,
            "maxZ": -104.5,
            "obb": {
              "cx": 170,
              "cz": -119.75,
              "hx": 15.25,
              "hz": 6,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": 170,
            "cz": -119.75,
            "yaw": 90,
            "length": 30.5,
            "width": 12,
            "axis": "x",
            "topY": 3,
            "bottomY": 2.4,
            "topAtMin": 3,
            "topAtMax": 3,
            "ramp": false,
            "rails": true
          },
          {
            "minX": 164,
            "maxX": 176,
            "minZ": -104.5,
            "maxZ": -74,
            "obb": {
              "cx": 170,
              "cz": -89.25,
              "hx": 15.25,
              "hz": 6,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": 170,
            "cz": -89.25,
            "yaw": 90,
            "length": 30.5,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 3,
            "topAtMax": 0.12,
            "ramp": true,
            "rails": true
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [
          {
            "id": "pillar_br_east_174.8_-147",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": 174.8,
              "y": -4,
              "z": -147
            },
            "scale": {
              "x": 1.6,
              "y": 5.248,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_east_165.2_-147",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": 165.2,
              "y": -4,
              "z": -147
            },
            "scale": {
              "x": 1.6,
              "y": 5.248,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_east_174.8_-129",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": 174.8,
              "y": -4,
              "z": -129
            },
            "scale": {
              "x": 1.6,
              "y": 6.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_east_165.2_-129",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": 165.2,
              "y": -4,
              "z": -129
            },
            "scale": {
              "x": 1.6,
              "y": 6.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_east_174.8_-117",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": 174.8,
              "y": -4,
              "z": -117
            },
            "scale": {
              "x": 1.6,
              "y": 6.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_east_165.2_-117",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": 165.2,
              "y": -4,
              "z": -117
            },
            "scale": {
              "x": 1.6,
              "y": 6.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_east_174.8_-105",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": 174.8,
              "y": -4,
              "z": -105
            },
            "scale": {
              "x": 1.6,
              "y": 6.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_east_165.2_-105",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": 165.2,
              "y": -4,
              "z": -105
            },
            "scale": {
              "x": 1.6,
              "y": 6.4,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_east_174.8_-98.5",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": 174.8,
              "y": -4,
              "z": -98.5
            },
            "scale": {
              "x": 1.6,
              "y": 5.833,
              "z": 1.6
            }
          },
          {
            "id": "pillar_br_east_165.2_-98.5",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": 165.2,
              "y": -4,
              "z": -98.5
            },
            "scale": {
              "x": 1.6,
              "y": 5.833,
              "z": 1.6
            }
          }
        ],
        "lamps": [
          {
            "id": "lamp_br_east_177.4_-125",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 177.4,
              "y": 3,
              "z": -125
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_br_east_162.6_-125",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": 162.6,
              "y": 3,
              "z": -125
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_br_east_177.4_-105",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 177.4,
              "y": 3,
              "z": -105
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_br_east_162.6_-105",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": 162.6,
              "y": 3,
              "z": -105
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
        "id": "rd_fly_e",
        "type": "bridge",
        "width": 8,
        "withLamps": false,
        "decks": [
          {
            "minX": -64,
            "maxX": -56,
            "minZ": -165,
            "maxZ": -117,
            "obb": {
              "cx": -60,
              "cz": -141,
              "hx": 24,
              "hz": 4,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": -60,
            "cz": -141,
            "yaw": 90,
            "length": 48,
            "width": 8,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 2.28,
            "ramp": true,
            "rails": true
          },
          {
            "minX": -64,
            "maxX": -56,
            "minZ": -117,
            "maxZ": -83,
            "obb": {
              "cx": -60,
              "cz": -100,
              "hx": 17,
              "hz": 4,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": -60,
            "cz": -100,
            "yaw": 90,
            "length": 34,
            "width": 8,
            "axis": "x",
            "topY": 2.28,
            "bottomY": 1.68,
            "topAtMin": 2.28,
            "topAtMax": 4.022,
            "ramp": true,
            "rails": true
          },
          {
            "minX": -64,
            "maxX": -56,
            "minZ": -83,
            "maxZ": -50,
            "obb": {
              "cx": -60,
              "cz": -66.5,
              "hx": 16.5,
              "hz": 4,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": -60,
            "cz": -66.5,
            "yaw": 90,
            "length": 33,
            "width": 8,
            "axis": "x",
            "topY": 4.022,
            "bottomY": 3.422,
            "topAtMin": 4.022,
            "topAtMax": 6.002,
            "ramp": true,
            "rails": true
          },
          {
            "minX": -64,
            "maxX": -56,
            "minZ": -50,
            "maxZ": -20,
            "obb": {
              "cx": -60,
              "cz": -35,
              "hx": 15,
              "hz": 4,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": -60,
            "cz": -35,
            "yaw": 90,
            "length": 30,
            "width": 8,
            "axis": "x",
            "topY": 6.002,
            "bottomY": 5.402,
            "topAtMin": 6.002,
            "topAtMax": 7.802,
            "ramp": true,
            "rails": true
          },
          {
            "minX": -64,
            "maxX": -56,
            "minZ": -20,
            "maxZ": 20,
            "obb": {
              "cx": -60,
              "cz": 0,
              "hx": 20,
              "hz": 4,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": -60,
            "cz": 0,
            "yaw": 90,
            "length": 40,
            "width": 8,
            "axis": "x",
            "topY": 7.802,
            "bottomY": 7.202,
            "topAtMin": 7.802,
            "topAtMax": 10.202,
            "ramp": true,
            "rails": true
          },
          {
            "minX": -64,
            "maxX": -56,
            "minZ": 20,
            "maxZ": 60,
            "obb": {
              "cx": -60,
              "cz": 40,
              "hx": 20,
              "hz": 4,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": -60,
            "cz": 40,
            "yaw": 90,
            "length": 40,
            "width": 8,
            "axis": "x",
            "topY": 10.202,
            "bottomY": 9.602,
            "topAtMin": 10.202,
            "topAtMax": 12.602,
            "ramp": true,
            "rails": true
          },
          {
            "minX": -64,
            "maxX": -56,
            "minZ": 60,
            "maxZ": 86.5,
            "obb": {
              "cx": -60,
              "cz": 73.25,
              "hx": 13.25,
              "hz": 4,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": -60,
            "cz": 73.25,
            "yaw": 90,
            "length": 26.5,
            "width": 8,
            "axis": "x",
            "topY": 12.602,
            "bottomY": 12.002,
            "topAtMin": 12.602,
            "topAtMax": 14.192,
            "ramp": true,
            "rails": true
          },
          {
            "minX": -64,
            "maxX": -56,
            "minZ": 86.5,
            "maxZ": 99.75,
            "obb": {
              "cx": -60,
              "cz": 93.125,
              "hx": 6.625,
              "hz": 4,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": -60,
            "cz": 93.125,
            "yaw": 90,
            "length": 13.25,
            "width": 8,
            "axis": "x",
            "topY": 14.192,
            "bottomY": 13.592,
            "topAtMin": 14.192,
            "topAtMax": 14.788,
            "ramp": true,
            "rails": true
          },
          {
            "minX": -64,
            "maxX": -56,
            "minZ": 99.75,
            "maxZ": 113,
            "obb": {
              "cx": -60,
              "cz": 106.375,
              "hx": 6.625,
              "hz": 4,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": -60,
            "cz": 106.375,
            "yaw": 90,
            "length": 13.25,
            "width": 8,
            "axis": "x",
            "topY": 14.788,
            "bottomY": 14.188,
            "topAtMin": 14.788,
            "topAtMax": 14.861,
            "ramp": true,
            "rails": true
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [
          {
            "id": "pillar_rd_fly_e_-57.2_-147",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -57.2,
              "y": -4,
              "z": -147
            },
            "scale": {
              "x": 1.6,
              "y": 4.33,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-62.8_-147",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -62.8,
              "y": -4,
              "z": -147
            },
            "scale": {
              "x": 1.6,
              "y": 4.33,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-57.2_-135",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -57.2,
              "y": -4,
              "z": -135
            },
            "scale": {
              "x": 1.6,
              "y": 4.87,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-62.8_-135",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -62.8,
              "y": -4,
              "z": -135
            },
            "scale": {
              "x": 1.6,
              "y": 4.87,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-57.2_-123",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -57.2,
              "y": -4,
              "z": -123
            },
            "scale": {
              "x": 1.6,
              "y": 5.41,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-62.8_-123",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -62.8,
              "y": -4,
              "z": -123
            },
            "scale": {
              "x": 1.6,
              "y": 5.41,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-57.2_-111",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -57.2,
              "y": -4,
              "z": -111
            },
            "scale": {
              "x": 1.6,
              "y": 5.987,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-62.8_-111",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -62.8,
              "y": -4,
              "z": -111
            },
            "scale": {
              "x": 1.6,
              "y": 5.987,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-57.2_-99",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -57.2,
              "y": -4,
              "z": -99
            },
            "scale": {
              "x": 1.6,
              "y": 6.602,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-62.8_-99",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -62.8,
              "y": -4,
              "z": -99
            },
            "scale": {
              "x": 1.6,
              "y": 6.602,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-57.2_-87",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -57.2,
              "y": 0,
              "z": -87
            },
            "scale": {
              "x": 1.6,
              "y": 3.217,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-62.8_-87",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -62.8,
              "y": 0,
              "z": -87
            },
            "scale": {
              "x": 1.6,
              "y": 3.217,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-57.2_-77",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -57.2,
              "y": 0,
              "z": -77
            },
            "scale": {
              "x": 1.6,
              "y": 3.782,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-62.8_-77",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -62.8,
              "y": 0,
              "z": -77
            },
            "scale": {
              "x": 1.6,
              "y": 3.782,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-57.2_-53",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -57.2,
              "y": 0.068,
              "z": -53
            },
            "scale": {
              "x": 1.6,
              "y": 5.154,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-62.8_-53",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -62.8,
              "y": 0.068,
              "z": -53
            },
            "scale": {
              "x": 1.6,
              "y": 5.154,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-57.2_-44",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -57.2,
              "y": 0.399,
              "z": -44
            },
            "scale": {
              "x": 1.6,
              "y": 5.363,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-62.8_-44",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -62.8,
              "y": 0.399,
              "z": -44
            },
            "scale": {
              "x": 1.6,
              "y": 5.363,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-57.2_-32",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -57.2,
              "y": 1.332,
              "z": -32
            },
            "scale": {
              "x": 1.6,
              "y": 5.15,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-62.8_-32",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -62.8,
              "y": 1.332,
              "z": -32
            },
            "scale": {
              "x": 1.6,
              "y": 5.15,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-57.2_-14",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -57.2,
              "y": 3.43,
              "z": -14
            },
            "scale": {
              "x": 1.6,
              "y": 4.132,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-62.8_-14",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -62.8,
              "y": 3.43,
              "z": -14
            },
            "scale": {
              "x": 1.6,
              "y": 4.132,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-57.2_-2",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -57.2,
              "y": 4.483,
              "z": -2
            },
            "scale": {
              "x": 1.6,
              "y": 3.799,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-62.8_-2",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -62.8,
              "y": 4.483,
              "z": -2
            },
            "scale": {
              "x": 1.6,
              "y": 3.799,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-57.2_10",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -57.2,
              "y": 5.49,
              "z": 10
            },
            "scale": {
              "x": 1.6,
              "y": 3.512,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-62.8_10",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -62.8,
              "y": 5.476,
              "z": 10
            },
            "scale": {
              "x": 1.6,
              "y": 3.526,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-57.2_26",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -57.2,
              "y": 7.453,
              "z": 26
            },
            "scale": {
              "x": 1.6,
              "y": 2.509,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-62.8_26",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -62.8,
              "y": 7.416,
              "z": 26
            },
            "scale": {
              "x": 1.6,
              "y": 2.546,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-57.2_38",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -57.2,
              "y": 9.108,
              "z": 38
            },
            "scale": {
              "x": 1.6,
              "y": 1.574,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_fly_e_-62.8_38",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -90,
            "position": {
              "x": -62.8,
              "y": 9.059,
              "z": 38
            },
            "scale": {
              "x": 1.6,
              "y": 1.623,
              "z": 1.6
            }
          }
        ],
        "lamps": []
      },
      {
        "id": "rd_x_east",
        "type": "bridge",
        "width": 8,
        "withLamps": false,
        "decks": [
          {
            "minX": 249.76,
            "maxX": 274.908,
            "minZ": -66.746,
            "maxZ": -40.784,
            "obb": {
              "cx": 262.334,
              "cz": -53.765,
              "hx": 14.078,
              "hz": 4,
              "c": -0.6866308548791057,
              "s": 0.727006237337747
            },
            "cx": 262.334,
            "cz": -53.765,
            "yaw": 133.364,
            "length": 28.156,
            "width": 8,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 1.35,
            "ramp": true,
            "rails": true
          },
          {
            "minX": 216.555,
            "maxX": 255.576,
            "minZ": -46.277,
            "maxZ": -16.957,
            "arc": true,
            "cx": 187.236,
            "cz": -105.326,
            "R": 90,
            "halfW": 4,
            "a0": 43.363,
            "a1": 70.067,
            "span": 26.703999999999994,
            "y0": 1.35,
            "y1": 3.213,
            "tanBank": 0.105,
            "bankTrans": 9.457,
            "width": 8,
            "topY": 1.35,
            "bottomY": 0.75,
            "topAtMin": 1.35,
            "topAtMax": 3.213,
            "ramp": true,
            "rails": true
          },
          {
            "minX": 162.402,
            "maxX": 219.282,
            "minZ": -24.479,
            "maxZ": 2.681,
            "obb": {
              "cx": 190.842,
              "cz": -10.899,
              "hx": 28.802,
              "hz": 4,
              "c": -0.940091926513835,
              "s": 0.34092106080954615
            },
            "cx": 190.842,
            "cz": -10.899,
            "yaw": 160.067,
            "length": 57.604,
            "width": 8,
            "axis": "x",
            "topY": 3.213,
            "bottomY": 2.613,
            "topAtMin": 3.213,
            "topAtMax": 6.205,
            "ramp": true,
            "rails": true
          },
          {
            "minX": 130.79,
            "maxX": 165.129,
            "minZ": -4.84,
            "maxZ": 19.558,
            "arc": true,
            "cx": 197.857,
            "cz": 92.93,
            "R": 100,
            "halfW": 4,
            "a0": -109.933,
            "a1": -130.156,
            "span": -20.223,
            "y0": 6.206,
            "y1": 8.324,
            "tanBank": 0.105,
            "bankTrans": 6.299,
            "width": 8,
            "topY": 6.206,
            "bottomY": 5.606,
            "topAtMin": 6.206,
            "topAtMax": 8.324,
            "ramp": true,
            "rails": true
          },
          {
            "minX": 67.888,
            "maxX": 135.95,
            "minZ": 13.444,
            "maxZ": 72.632,
            "obb": {
              "cx": 101.919,
              "cz": 43.038,
              "hx": 41.151,
              "hz": 4,
              "c": -0.7642914792863121,
              "s": 0.6448709442131353
            },
            "cx": 101.919,
            "cz": 43.038,
            "yaw": 139.844,
            "length": 82.302,
            "width": 8,
            "axis": "x",
            "topY": 8.324,
            "bottomY": 7.724,
            "topAtMin": 8.324,
            "topAtMax": 13.262,
            "ramp": true,
            "rails": true
          },
          {
            "minX": 44.728,
            "maxX": 73.046,
            "minZ": 66.518,
            "maxZ": 92.174,
            "obb": {
              "cx": 58.887,
              "cz": 79.346,
              "hx": 15.151,
              "hz": 4,
              "c": -0.7642914792863121,
              "s": 0.6448709442131353
            },
            "cx": 58.887,
            "cz": 79.346,
            "yaw": 139.844,
            "length": 30.302,
            "width": 8,
            "axis": "x",
            "topY": 13.262,
            "bottomY": 12.662,
            "topAtMin": 13.262,
            "topAtMax": 14.441,
            "ramp": true,
            "rails": true
          },
          {
            "minX": 16.421,
            "maxX": 49.887,
            "minZ": 86.059,
            "maxZ": 116.057,
            "obb": {
              "cx": 33.154,
              "cz": 101.058,
              "hx": 18.518,
              "hz": 4,
              "c": -0.7642914792863121,
              "s": 0.6448709442131353
            },
            "cx": 33.154,
            "cz": 101.058,
            "yaw": 139.844,
            "length": 37.037,
            "width": 8,
            "axis": "x",
            "topY": 14.44,
            "bottomY": 13.84,
            "topAtMin": 14.44,
            "topAtMax": 14.898,
            "ramp": true,
            "rails": true
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [
          {
            "id": "pillar_rd_x_east_166.199_-4.941",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -160.067,
            "position": {
              "x": 166.199,
              "y": 4.271,
              "z": -4.941
            },
            "scale": {
              "x": 1.6,
              "y": 1.147,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_x_east_157.078_-1.436",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 23.370746770784947,
            "position": {
              "x": 157.078,
              "y": 4.523,
              "z": -1.436
            },
            "scale": {
              "x": 1.6,
              "y": 1.611,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_x_east_148.896_8.962",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 30.246240312354843,
            "position": {
              "x": 148.896,
              "y": 5.297,
              "z": 8.962
            },
            "scale": {
              "x": 1.6,
              "y": 1.095,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_x_east_146.075_4.124",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 30.246240312354843,
            "position": {
              "x": 146.075,
              "y": 4.933,
              "z": 4.124
            },
            "scale": {
              "x": 1.6,
              "y": 2.047,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_x_east_139.196_15.427",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 37.121733853924695,
            "position": {
              "x": 139.196,
              "y": 5.869,
              "z": 15.427
            },
            "scale": {
              "x": 1.6,
              "y": 1.399,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_x_east_135.816_10.962",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": 37.121733853924695,
            "position": {
              "x": 135.816,
              "y": 5.471,
              "z": 10.962
            },
            "scale": {
              "x": 1.6,
              "y": 2.074,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_x_east_130.59_22.51",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -139.844,
            "position": {
              "x": 130.59,
              "y": 6.753,
              "z": 22.51
            },
            "scale": {
              "x": 1.6,
              "y": 1.331,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_x_east_126.979_18.23",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -139.844,
            "position": {
              "x": 126.979,
              "y": 6.289,
              "z": 18.23
            },
            "scale": {
              "x": 1.6,
              "y": 1.795,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_x_east_117.807_25.969",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -139.844,
            "position": {
              "x": 117.807,
              "y": 7.362,
              "z": 25.969
            },
            "scale": {
              "x": 1.6,
              "y": 1.442,
              "z": 1.6
            }
          },
          {
            "id": "pillar_rd_x_east_108.636_33.707",
            "model": "concrete_pillar",
            "source": "bridge_pillar",
            "rotationY": -139.844,
            "position": {
              "x": 108.636,
              "y": 8.505,
              "z": 33.707
            },
            "scale": {
              "x": 1.6,
              "y": 1.019,
              "z": 1.6
            }
          }
        ],
        "lamps": []
      },
      {
        "id": "sb_needles",
        "type": "skybridge",
        "width": 3.4,
        "withLamps": true,
        "decks": [
          {
            "minX": -13,
            "maxX": 7,
            "minZ": 136.3,
            "maxZ": 139.7,
            "axis": "x",
            "topY": 30.783,
            "bottomY": 30.183,
            "topAtMin": 30.783,
            "topAtMax": 30.783,
            "ramp": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_sb_needles_-3_134.9",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -3,
              "y": 30.783,
              "z": 134.9
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sb_needles_-3_141.1",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -3,
              "y": 30.783,
              "z": 141.1
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
        "id": "sind_s_h0_0",
        "type": "ground",
        "width": 16,
        "withLamps": true,
        "decks": [
          {
            "minX": -272,
            "maxX": -244,
            "minZ": -294,
            "maxZ": -278,
            "length": 28,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_sind_s_h0_0_-262_-295.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -262,
              "y": 0.12,
              "z": -295.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_h0_0_-262_-276.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -262,
              "y": 0.12,
              "z": -276.6
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
        "id": "sind_s_h0_1",
        "type": "ground",
        "width": 16,
        "withLamps": true,
        "decks": [
          {
            "minX": -228,
            "maxX": -200,
            "minZ": -294,
            "maxZ": -278,
            "length": 28,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_sind_s_h0_1_-218_-295.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -218,
              "y": 0.12,
              "z": -295.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_h0_1_-218_-276.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -218,
              "y": 0.12,
              "z": -276.6
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
        "id": "sind_s_h0_2",
        "type": "ground",
        "width": 16,
        "withLamps": true,
        "decks": [
          {
            "minX": -184,
            "maxX": -156,
            "minZ": -294,
            "maxZ": -278,
            "length": 28,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_sind_s_h0_2_-174_-295.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -174,
              "y": 0.12,
              "z": -295.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_h0_2_-174_-276.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -174,
              "y": 0.12,
              "z": -276.6
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
        "id": "sind_s_h0_3",
        "type": "ground",
        "width": 16,
        "withLamps": true,
        "decks": [
          {
            "minX": -140,
            "maxX": -100,
            "minZ": -294,
            "maxZ": -278,
            "length": 40,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_sind_s_h0_3_-130_-295.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -130,
              "y": 0.12,
              "z": -295.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_h0_3_-130_-276.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -130,
              "y": 0.12,
              "z": -276.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_h0_3_-110_-295.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -110,
              "y": 0.12,
              "z": -295.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_h0_3_-110_-276.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -110,
              "y": 0.12,
              "z": -276.6
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
        "id": "sind_s_h1_0",
        "type": "ground",
        "width": 16,
        "withLamps": true,
        "decks": [
          {
            "minX": -272,
            "maxX": -244,
            "minZ": -250,
            "maxZ": -234,
            "length": 28,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_sind_s_h1_0_-262_-251.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -262,
              "y": 0.12,
              "z": -251.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_h1_0_-262_-232.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -262,
              "y": 0.12,
              "z": -232.6
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
        "id": "sind_s_h1_1",
        "type": "ground",
        "width": 16,
        "withLamps": true,
        "decks": [
          {
            "minX": -228,
            "maxX": -200,
            "minZ": -250,
            "maxZ": -234,
            "length": 28,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_sind_s_h1_1_-218_-251.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -218,
              "y": 0.12,
              "z": -251.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_h1_1_-218_-232.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -218,
              "y": 0.12,
              "z": -232.6
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
        "id": "sind_s_h1_2",
        "type": "ground",
        "width": 16,
        "withLamps": true,
        "decks": [
          {
            "minX": -184,
            "maxX": -156,
            "minZ": -250,
            "maxZ": -234,
            "length": 28,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_sind_s_h1_2_-174_-251.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -174,
              "y": 0.12,
              "z": -251.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_h1_2_-174_-232.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -174,
              "y": 0.12,
              "z": -232.6
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
        "id": "sind_s_h1_3",
        "type": "ground",
        "width": 16,
        "withLamps": true,
        "decks": [
          {
            "minX": -140,
            "maxX": -100,
            "minZ": -250,
            "maxZ": -234,
            "length": 40,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_sind_s_h1_3_-130_-251.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -130,
              "y": 0.12,
              "z": -251.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_h1_3_-130_-232.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -130,
              "y": 0.12,
              "z": -232.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_h1_3_-110_-251.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -110,
              "y": 0.12,
              "z": -251.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_h1_3_-110_-232.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -110,
              "y": 0.12,
              "z": -232.6
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
        "id": "sind_s_h2_0",
        "type": "ground",
        "width": 16,
        "withLamps": true,
        "decks": [
          {
            "minX": -272,
            "maxX": -244,
            "minZ": -206,
            "maxZ": -190,
            "length": 28,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_sind_s_h2_0_-262_-207.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -262,
              "y": 0.12,
              "z": -207.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_h2_0_-262_-188.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -262,
              "y": 0.12,
              "z": -188.6
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
        "id": "sind_s_h2_1",
        "type": "ground",
        "width": 16,
        "withLamps": true,
        "decks": [
          {
            "minX": -228,
            "maxX": -200,
            "minZ": -206,
            "maxZ": -190,
            "length": 28,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_sind_s_h2_1_-218_-207.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -218,
              "y": 0.12,
              "z": -207.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_h2_1_-218_-188.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -218,
              "y": 0.12,
              "z": -188.6
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
        "id": "sind_s_h2_2",
        "type": "ground",
        "width": 16,
        "withLamps": true,
        "decks": [
          {
            "minX": -184,
            "maxX": -156,
            "minZ": -206,
            "maxZ": -190,
            "length": 28,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_sind_s_h2_2_-174_-207.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -174,
              "y": 0.12,
              "z": -207.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_h2_2_-174_-188.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -174,
              "y": 0.12,
              "z": -188.6
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
        "id": "sind_s_h2_3",
        "type": "ground",
        "width": 16,
        "withLamps": true,
        "decks": [
          {
            "minX": -140,
            "maxX": -100,
            "minZ": -206,
            "maxZ": -190,
            "length": 40,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_sind_s_h2_3_-130_-207.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -130,
              "y": 0.12,
              "z": -207.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_h2_3_-130_-188.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -130,
              "y": 0.12,
              "z": -188.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_h2_3_-110_-207.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -110,
              "y": 0.12,
              "z": -207.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_h2_3_-110_-188.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 180,
            "position": {
              "x": -110,
              "y": 0.12,
              "z": -188.6
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
        "id": "sind_s_v0_0",
        "type": "ground",
        "width": 16,
        "withLamps": true,
        "decks": [
          {
            "minX": -288,
            "maxX": -272,
            "minZ": -278,
            "maxZ": -250,
            "obb": {
              "cx": -280,
              "cz": -264,
              "hx": 14,
              "hz": 8,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": -280,
            "cz": -264,
            "yaw": 90,
            "length": 28,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_sind_s_v0_0_-270.6_-268",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -270.6,
              "y": 0.12,
              "z": -268
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_v0_0_-289.4_-268",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -289.4,
              "y": 0.12,
              "z": -268
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
        "id": "sind_s_v0_1",
        "type": "ground",
        "width": 16,
        "withLamps": true,
        "decks": [
          {
            "minX": -288,
            "maxX": -272,
            "minZ": -234,
            "maxZ": -206,
            "obb": {
              "cx": -280,
              "cz": -220,
              "hx": 14,
              "hz": 8,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": -280,
            "cz": -220,
            "yaw": 90,
            "length": 28,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_sind_s_v0_1_-270.6_-224",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -270.6,
              "y": 0.12,
              "z": -224
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_v0_1_-289.4_-224",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -289.4,
              "y": 0.12,
              "z": -224
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
        "id": "sind_s_v0_2",
        "type": "ground",
        "width": 16,
        "withLamps": true,
        "decks": [
          {
            "minX": -288,
            "maxX": -272,
            "minZ": -190,
            "maxZ": -176,
            "obb": {
              "cx": -280,
              "cz": -183,
              "hx": 7,
              "hz": 8,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": -280,
            "cz": -183,
            "yaw": 90,
            "length": 14,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_sind_s_v0_2_-270.6_-180",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -270.6,
              "y": 0.12,
              "z": -180
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_v0_2_-289.4_-180",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -289.4,
              "y": 0.12,
              "z": -180
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
        "id": "sind_s_v1_0",
        "type": "ground",
        "width": 16,
        "withLamps": true,
        "decks": [
          {
            "minX": -244,
            "maxX": -228,
            "minZ": -278,
            "maxZ": -250,
            "obb": {
              "cx": -236,
              "cz": -264,
              "hx": 14,
              "hz": 8,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": -236,
            "cz": -264,
            "yaw": 90,
            "length": 28,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_sind_s_v1_0_-226.6_-268",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -226.6,
              "y": 0.12,
              "z": -268
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_v1_0_-245.4_-268",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -245.4,
              "y": 0.12,
              "z": -268
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
        "id": "sind_s_v1_1",
        "type": "ground",
        "width": 16,
        "withLamps": true,
        "decks": [
          {
            "minX": -244,
            "maxX": -228,
            "minZ": -234,
            "maxZ": -206,
            "obb": {
              "cx": -236,
              "cz": -220,
              "hx": 14,
              "hz": 8,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": -236,
            "cz": -220,
            "yaw": 90,
            "length": 28,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_sind_s_v1_1_-226.6_-224",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -226.6,
              "y": 0.12,
              "z": -224
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_v1_1_-245.4_-224",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -245.4,
              "y": 0.12,
              "z": -224
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
        "id": "sind_s_v1_2",
        "type": "ground",
        "width": 16,
        "withLamps": true,
        "decks": [
          {
            "minX": -244,
            "maxX": -228,
            "minZ": -190,
            "maxZ": -176,
            "obb": {
              "cx": -236,
              "cz": -183,
              "hx": 7,
              "hz": 8,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": -236,
            "cz": -183,
            "yaw": 90,
            "length": 14,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_sind_s_v1_2_-226.6_-180",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -226.6,
              "y": 0.12,
              "z": -180
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_v1_2_-245.4_-180",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -245.4,
              "y": 0.12,
              "z": -180
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
        "id": "sind_s_v2_0",
        "type": "ground",
        "width": 16,
        "withLamps": true,
        "decks": [
          {
            "minX": -200,
            "maxX": -184,
            "minZ": -278,
            "maxZ": -250,
            "obb": {
              "cx": -192,
              "cz": -264,
              "hx": 14,
              "hz": 8,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": -192,
            "cz": -264,
            "yaw": 90,
            "length": 28,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_sind_s_v2_0_-182.6_-268",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -182.6,
              "y": 0.12,
              "z": -268
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_v2_0_-201.4_-268",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -201.4,
              "y": 0.12,
              "z": -268
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
        "id": "sind_s_v2_1",
        "type": "ground",
        "width": 16,
        "withLamps": true,
        "decks": [
          {
            "minX": -200,
            "maxX": -184,
            "minZ": -234,
            "maxZ": -206,
            "obb": {
              "cx": -192,
              "cz": -220,
              "hx": 14,
              "hz": 8,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": -192,
            "cz": -220,
            "yaw": 90,
            "length": 28,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_sind_s_v2_1_-182.6_-224",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -182.6,
              "y": 0.12,
              "z": -224
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_v2_1_-201.4_-224",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -201.4,
              "y": 0.12,
              "z": -224
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
        "id": "sind_s_v2_2",
        "type": "ground",
        "width": 16,
        "withLamps": true,
        "decks": [
          {
            "minX": -200,
            "maxX": -184,
            "minZ": -190,
            "maxZ": -176,
            "obb": {
              "cx": -192,
              "cz": -183,
              "hx": 7,
              "hz": 8,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": -192,
            "cz": -183,
            "yaw": 90,
            "length": 14,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_sind_s_v2_2_-182.6_-180",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -182.6,
              "y": 0.12,
              "z": -180
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_v2_2_-201.4_-180",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -201.4,
              "y": 0.12,
              "z": -180
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
        "id": "sind_s_v3_0",
        "type": "ground",
        "width": 16,
        "withLamps": true,
        "decks": [
          {
            "minX": -156,
            "maxX": -140,
            "minZ": -278,
            "maxZ": -250,
            "obb": {
              "cx": -148,
              "cz": -264,
              "hx": 14,
              "hz": 8,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": -148,
            "cz": -264,
            "yaw": 90,
            "length": 28,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_sind_s_v3_0_-138.6_-268",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -138.6,
              "y": 0.12,
              "z": -268
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_v3_0_-157.4_-268",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -157.4,
              "y": 0.12,
              "z": -268
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
        "id": "sind_s_v3_1",
        "type": "ground",
        "width": 16,
        "withLamps": true,
        "decks": [
          {
            "minX": -156,
            "maxX": -140,
            "minZ": -234,
            "maxZ": -206,
            "obb": {
              "cx": -148,
              "cz": -220,
              "hx": 14,
              "hz": 8,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": -148,
            "cz": -220,
            "yaw": 90,
            "length": 28,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_sind_s_v3_1_-138.6_-224",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -138.6,
              "y": 0.12,
              "z": -224
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_v3_1_-157.4_-224",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -157.4,
              "y": 0.12,
              "z": -224
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
        "id": "sind_s_v3_2",
        "type": "ground",
        "width": 16,
        "withLamps": true,
        "decks": [
          {
            "minX": -156,
            "maxX": -140,
            "minZ": -190,
            "maxZ": -176,
            "obb": {
              "cx": -148,
              "cz": -183,
              "hx": 7,
              "hz": 8,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": -148,
            "cz": -183,
            "yaw": 90,
            "length": 14,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_sind_s_v3_2_-138.6_-180",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": -138.6,
              "y": 0.12,
              "z": -180
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_sind_s_v3_2_-157.4_-180",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 90,
            "position": {
              "x": -157.4,
              "y": 0.12,
              "z": -180
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
        "id": "sind_x0_0",
        "type": "ground",
        "width": 16,
        "withLamps": false,
        "decks": [
          {
            "minX": -288,
            "maxX": -272,
            "minZ": -294,
            "maxZ": -278,
            "length": 16,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "sind_x1_0",
        "type": "ground",
        "width": 16,
        "withLamps": false,
        "decks": [
          {
            "minX": -244,
            "maxX": -228,
            "minZ": -294,
            "maxZ": -278,
            "length": 16,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "sind_x2_0",
        "type": "ground",
        "width": 16,
        "withLamps": false,
        "decks": [
          {
            "minX": -200,
            "maxX": -184,
            "minZ": -294,
            "maxZ": -278,
            "length": 16,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "sind_x3_0",
        "type": "ground",
        "width": 16,
        "withLamps": false,
        "decks": [
          {
            "minX": -156,
            "maxX": -140,
            "minZ": -294,
            "maxZ": -278,
            "length": 16,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "sind_x0_1",
        "type": "ground",
        "width": 16,
        "withLamps": false,
        "decks": [
          {
            "minX": -288,
            "maxX": -272,
            "minZ": -250,
            "maxZ": -234,
            "length": 16,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "sind_x1_1",
        "type": "ground",
        "width": 16,
        "withLamps": false,
        "decks": [
          {
            "minX": -244,
            "maxX": -228,
            "minZ": -250,
            "maxZ": -234,
            "length": 16,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "sind_x2_1",
        "type": "ground",
        "width": 16,
        "withLamps": false,
        "decks": [
          {
            "minX": -200,
            "maxX": -184,
            "minZ": -250,
            "maxZ": -234,
            "length": 16,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "sind_x3_1",
        "type": "ground",
        "width": 16,
        "withLamps": false,
        "decks": [
          {
            "minX": -156,
            "maxX": -140,
            "minZ": -250,
            "maxZ": -234,
            "length": 16,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "sind_x0_2",
        "type": "ground",
        "width": 16,
        "withLamps": false,
        "decks": [
          {
            "minX": -288,
            "maxX": -272,
            "minZ": -206,
            "maxZ": -190,
            "length": 16,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "sind_x1_2",
        "type": "ground",
        "width": 16,
        "withLamps": false,
        "decks": [
          {
            "minX": -244,
            "maxX": -228,
            "minZ": -206,
            "maxZ": -190,
            "length": 16,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "sind_x2_2",
        "type": "ground",
        "width": 16,
        "withLamps": false,
        "decks": [
          {
            "minX": -200,
            "maxX": -184,
            "minZ": -206,
            "maxZ": -190,
            "length": 16,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "sind_x3_2",
        "type": "ground",
        "width": 16,
        "withLamps": false,
        "decks": [
          {
            "minX": -156,
            "maxX": -140,
            "minZ": -206,
            "maxZ": -190,
            "length": 16,
            "width": 16,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "skit_s_h0_0",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 69.5,
            "maxX": 93.75,
            "minZ": -250.967,
            "maxZ": -234.001,
            "obb": {
              "cx": 81.625,
              "cz": -242.484,
              "hx": 11,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 81.625,
            "cz": -242.484,
            "yaw": -14,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_h0_0_78.864_-249.422",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 14,
            "position": {
              "x": 78.864,
              "y": 0.12,
              "z": -249.422
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_h0_0_82.445_-235.062",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -166,
            "position": {
              "x": 82.445,
              "y": 0.12,
              "z": -235.062
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
        "id": "skit_s_h0_1",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 102.49,
            "maxX": 126.74,
            "minZ": -259.193,
            "maxZ": -242.227,
            "obb": {
              "cx": 114.615,
              "cz": -250.71,
              "hx": 11,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 114.615,
            "cz": -250.71,
            "yaw": -14,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_h0_1_111.854_-257.648",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 14,
            "position": {
              "x": 111.854,
              "y": 0.12,
              "z": -257.648
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_h0_1_115.435_-243.288",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -166,
            "position": {
              "x": 115.435,
              "y": 0.12,
              "z": -243.288
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
        "id": "skit_s_h0_2",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 135.48,
            "maxX": 159.73,
            "minZ": -267.418,
            "maxZ": -250.452,
            "obb": {
              "cx": 147.605,
              "cz": -258.935,
              "hx": 11,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 147.605,
            "cz": -258.935,
            "yaw": -14,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_h0_2_144.844_-265.873",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 14,
            "position": {
              "x": 144.844,
              "y": 0.12,
              "z": -265.873
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_h0_2_148.425_-251.513",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -166,
            "position": {
              "x": 148.425,
              "y": 0.12,
              "z": -251.513
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
        "id": "skit_s_h0_3",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 168.471,
            "maxX": 192.721,
            "minZ": -275.643,
            "maxZ": -258.677,
            "obb": {
              "cx": 180.596,
              "cz": -267.16,
              "hx": 11,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 180.596,
            "cz": -267.16,
            "yaw": -14,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_h0_3_177.835_-274.098",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 14,
            "position": {
              "x": 177.835,
              "y": 0.12,
              "z": -274.098
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_h0_3_181.416_-259.738",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -166,
            "position": {
              "x": 181.416,
              "y": 0.12,
              "z": -259.738
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
        "id": "skit_s_h0_4",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 201.461,
            "maxX": 225.711,
            "minZ": -283.869,
            "maxZ": -266.903,
            "obb": {
              "cx": 213.586,
              "cz": -275.386,
              "hx": 11,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 213.586,
            "cz": -275.386,
            "yaw": -14,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_h0_4_210.825_-282.324",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 14,
            "position": {
              "x": 210.825,
              "y": 0.12,
              "z": -282.324
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_h0_4_214.406_-267.964",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -166,
            "position": {
              "x": 214.406,
              "y": 0.12,
              "z": -267.964
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
        "id": "skit_s_h0_5",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 234.451,
            "maxX": 258.701,
            "minZ": -292.094,
            "maxZ": -275.128,
            "obb": {
              "cx": 246.576,
              "cz": -283.611,
              "hx": 11,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 246.576,
            "cz": -283.611,
            "yaw": -14,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_h0_5_243.815_-290.549",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 14,
            "position": {
              "x": 243.815,
              "y": 0.12,
              "z": -290.549
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_h0_5_247.396_-276.189",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -166,
            "position": {
              "x": 247.396,
              "y": 0.12,
              "z": -276.189
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
        "id": "skit_s_h0_6",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 267.441,
            "maxX": 281.987,
            "minZ": -297.9,
            "maxZ": -283.354,
            "obb": {
              "cx": 274.714,
              "cz": -290.627,
              "hx": 6,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 274.714,
            "cz": -290.627,
            "yaw": -14,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_h0_6_276.805_-298.775",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 14,
            "position": {
              "x": 276.805,
              "y": 0.12,
              "z": -298.775
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_h0_6_280.385_-284.414",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -166,
            "position": {
              "x": 280.385,
              "y": 0.12,
              "z": -284.414
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
        "id": "skit_s_h1_0",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 77.726,
            "maxX": 101.976,
            "minZ": -217.977,
            "maxZ": -201.011,
            "obb": {
              "cx": 89.851,
              "cz": -209.494,
              "hx": 11,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 89.851,
            "cz": -209.494,
            "yaw": -14,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_h1_0_87.09_-216.432",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 14,
            "position": {
              "x": 87.09,
              "y": 0.12,
              "z": -216.432
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_h1_0_90.671_-202.072",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -166,
            "position": {
              "x": 90.671,
              "y": 0.12,
              "z": -202.072
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
        "id": "skit_s_h1_1",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 110.716,
            "maxX": 134.966,
            "minZ": -226.203,
            "maxZ": -209.237,
            "obb": {
              "cx": 122.841,
              "cz": -217.72,
              "hx": 11,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 122.841,
            "cz": -217.72,
            "yaw": -14,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_h1_1_120.08_-224.658",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 14,
            "position": {
              "x": 120.08,
              "y": 0.12,
              "z": -224.658
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_h1_1_123.661_-210.298",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -166,
            "position": {
              "x": 123.661,
              "y": 0.12,
              "z": -210.298
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
        "id": "skit_s_h1_2",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 143.706,
            "maxX": 167.956,
            "minZ": -234.428,
            "maxZ": -217.462,
            "obb": {
              "cx": 155.831,
              "cz": -225.945,
              "hx": 11,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 155.831,
            "cz": -225.945,
            "yaw": -14,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_h1_2_153.07_-232.883",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 14,
            "position": {
              "x": 153.07,
              "y": 0.12,
              "z": -232.883
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_h1_2_156.651_-218.523",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -166,
            "position": {
              "x": 156.651,
              "y": 0.12,
              "z": -218.523
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
        "id": "skit_s_h1_3",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 176.696,
            "maxX": 200.946,
            "minZ": -242.653,
            "maxZ": -225.687,
            "obb": {
              "cx": 188.821,
              "cz": -234.17,
              "hx": 11,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 188.821,
            "cz": -234.17,
            "yaw": -14,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_h1_3_186.06_-241.108",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 14,
            "position": {
              "x": 186.06,
              "y": 0.12,
              "z": -241.108
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_h1_3_189.641_-226.748",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -166,
            "position": {
              "x": 189.641,
              "y": 0.12,
              "z": -226.748
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
        "id": "skit_s_h1_4",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 209.686,
            "maxX": 233.936,
            "minZ": -250.879,
            "maxZ": -233.913,
            "obb": {
              "cx": 221.811,
              "cz": -242.396,
              "hx": 11,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 221.811,
            "cz": -242.396,
            "yaw": -14,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_h1_4_219.05_-249.334",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 14,
            "position": {
              "x": 219.05,
              "y": 0.12,
              "z": -249.334
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_h1_4_222.631_-234.974",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -166,
            "position": {
              "x": 222.631,
              "y": 0.12,
              "z": -234.974
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
        "id": "skit_s_h1_5",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 242.676,
            "maxX": 266.926,
            "minZ": -259.104,
            "maxZ": -242.138,
            "obb": {
              "cx": 254.801,
              "cz": -250.621,
              "hx": 11,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 254.801,
            "cz": -250.621,
            "yaw": -14,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_h1_5_252.04_-257.559",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 14,
            "position": {
              "x": 252.04,
              "y": 0.12,
              "z": -257.559
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_h1_5_255.621_-243.199",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -166,
            "position": {
              "x": 255.621,
              "y": 0.12,
              "z": -243.199
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
        "id": "skit_s_h1_6",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 275.667,
            "maxX": 290.213,
            "minZ": -264.91,
            "maxZ": -250.364,
            "obb": {
              "cx": 282.94,
              "cz": -257.637,
              "hx": 6,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 282.94,
            "cz": -257.637,
            "yaw": -14,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_h1_6_285.031_-265.785",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 14,
            "position": {
              "x": 285.031,
              "y": 0.12,
              "z": -265.785
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_h1_6_288.611_-251.424",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -166,
            "position": {
              "x": 288.611,
              "y": 0.12,
              "z": -251.424
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
        "id": "skit_s_v0_0",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 60.76,
            "maxX": 77.726,
            "minZ": -234.002,
            "maxZ": -209.752,
            "obb": {
              "cx": 69.243,
              "cz": -221.877,
              "hx": 11,
              "hz": 6,
              "c": 0.2419218955996679,
              "s": 0.9702957262759965
            },
            "cx": 69.243,
            "cz": -221.877,
            "yaw": 76,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_v0_0_76.181_-224.638",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -76,
            "position": {
              "x": 76.181,
              "y": 0.12,
              "z": -224.638
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_v0_0_61.821_-221.057",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 104,
            "position": {
              "x": 61.821,
              "y": 0.12,
              "z": -221.057
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
        "id": "skit_s_v0_1",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 68.985,
            "maxX": 84.983,
            "minZ": -201.011,
            "maxZ": -180.643,
            "obb": {
              "cx": 76.984,
              "cz": -190.827,
              "hx": 9,
              "hz": 6,
              "c": 0.2419218955996679,
              "s": 0.9702957262759965
            },
            "cx": 76.984,
            "cz": -190.827,
            "yaw": 76,
            "length": 18,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_v0_1_84.406_-191.647",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -76,
            "position": {
              "x": 84.406,
              "y": 0.12,
              "z": -191.647
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_v0_1_70.046_-188.066",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 104,
            "position": {
              "x": 70.046,
              "y": 0.12,
              "z": -188.066
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
        "id": "skit_s_v1_0",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 93.75,
            "maxX": 110.716,
            "minZ": -242.227,
            "maxZ": -217.977,
            "obb": {
              "cx": 102.233,
              "cz": -230.102,
              "hx": 11,
              "hz": 6,
              "c": 0.2419218955996679,
              "s": 0.9702957262759965
            },
            "cx": 102.233,
            "cz": -230.102,
            "yaw": 76,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_v1_0_109.171_-232.863",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -76,
            "position": {
              "x": 109.171,
              "y": 0.12,
              "z": -232.863
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_v1_0_94.811_-229.282",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 104,
            "position": {
              "x": 94.811,
              "y": 0.12,
              "z": -229.282
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
        "id": "skit_s_v1_1",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 101.976,
            "maxX": 117.974,
            "minZ": -209.237,
            "maxZ": -188.869,
            "obb": {
              "cx": 109.975,
              "cz": -199.053,
              "hx": 9,
              "hz": 6,
              "c": 0.2419218955996679,
              "s": 0.9702957262759965
            },
            "cx": 109.975,
            "cz": -199.053,
            "yaw": 76,
            "length": 18,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_v1_1_117.397_-199.873",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -76,
            "position": {
              "x": 117.397,
              "y": 0.12,
              "z": -199.873
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_v1_1_103.037_-196.292",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 104,
            "position": {
              "x": 103.037,
              "y": 0.12,
              "z": -196.292
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
        "id": "skit_s_v2_0",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 126.74,
            "maxX": 143.706,
            "minZ": -250.452,
            "maxZ": -226.202,
            "obb": {
              "cx": 135.223,
              "cz": -238.327,
              "hx": 11,
              "hz": 6,
              "c": 0.2419218955996679,
              "s": 0.9702957262759965
            },
            "cx": 135.223,
            "cz": -238.327,
            "yaw": 76,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_v2_0_142.161_-241.088",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -76,
            "position": {
              "x": 142.161,
              "y": 0.12,
              "z": -241.088
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_v2_0_127.801_-237.507",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 104,
            "position": {
              "x": 127.801,
              "y": 0.12,
              "z": -237.507
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
        "id": "skit_s_v2_1",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 134.966,
            "maxX": 150.964,
            "minZ": -217.462,
            "maxZ": -197.094,
            "obb": {
              "cx": 142.965,
              "cz": -207.278,
              "hx": 9,
              "hz": 6,
              "c": 0.2419218955996679,
              "s": 0.9702957262759965
            },
            "cx": 142.965,
            "cz": -207.278,
            "yaw": 76,
            "length": 18,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_v2_1_150.387_-208.098",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -76,
            "position": {
              "x": 150.387,
              "y": 0.12,
              "z": -208.098
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_v2_1_136.027_-204.517",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 104,
            "position": {
              "x": 136.027,
              "y": 0.12,
              "z": -204.517
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
        "id": "skit_s_v3_0",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 159.73,
            "maxX": 176.696,
            "minZ": -258.678,
            "maxZ": -234.428,
            "obb": {
              "cx": 168.213,
              "cz": -246.553,
              "hx": 11,
              "hz": 6,
              "c": 0.2419218955996679,
              "s": 0.9702957262759965
            },
            "cx": 168.213,
            "cz": -246.553,
            "yaw": 76,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_v3_0_175.151_-249.314",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -76,
            "position": {
              "x": 175.151,
              "y": 0.12,
              "z": -249.314
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_v3_0_160.791_-245.733",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 104,
            "position": {
              "x": 160.791,
              "y": 0.12,
              "z": -245.733
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
        "id": "skit_s_v3_1",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 167.956,
            "maxX": 183.954,
            "minZ": -225.687,
            "maxZ": -205.319,
            "obb": {
              "cx": 175.955,
              "cz": -215.503,
              "hx": 9,
              "hz": 6,
              "c": 0.2419218955996679,
              "s": 0.9702957262759965
            },
            "cx": 175.955,
            "cz": -215.503,
            "yaw": 76,
            "length": 18,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_v3_1_183.377_-216.323",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -76,
            "position": {
              "x": 183.377,
              "y": 0.12,
              "z": -216.323
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_v3_1_169.017_-212.742",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 104,
            "position": {
              "x": 169.017,
              "y": 0.12,
              "z": -212.742
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
        "id": "skit_s_v4_0",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 192.72,
            "maxX": 209.686,
            "minZ": -266.903,
            "maxZ": -242.653,
            "obb": {
              "cx": 201.203,
              "cz": -254.778,
              "hx": 11,
              "hz": 6,
              "c": 0.2419218955996679,
              "s": 0.9702957262759965
            },
            "cx": 201.203,
            "cz": -254.778,
            "yaw": 76,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_v4_0_208.141_-257.539",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -76,
            "position": {
              "x": 208.141,
              "y": 0.12,
              "z": -257.539
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_v4_0_193.781_-253.958",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 104,
            "position": {
              "x": 193.781,
              "y": 0.12,
              "z": -253.958
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
        "id": "skit_s_v4_1",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 200.946,
            "maxX": 216.944,
            "minZ": -233.913,
            "maxZ": -213.545,
            "obb": {
              "cx": 208.945,
              "cz": -223.729,
              "hx": 9,
              "hz": 6,
              "c": 0.2419218955996679,
              "s": 0.9702957262759965
            },
            "cx": 208.945,
            "cz": -223.729,
            "yaw": 76,
            "length": 18,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_v4_1_216.367_-224.549",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -76,
            "position": {
              "x": 216.367,
              "y": 0.12,
              "z": -224.549
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_v4_1_202.007_-220.968",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 104,
            "position": {
              "x": 202.007,
              "y": 0.12,
              "z": -220.968
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
        "id": "skit_s_v5_0",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 225.71,
            "maxX": 242.676,
            "minZ": -275.128,
            "maxZ": -250.878,
            "obb": {
              "cx": 234.193,
              "cz": -263.003,
              "hx": 11,
              "hz": 6,
              "c": 0.2419218955996679,
              "s": 0.9702957262759965
            },
            "cx": 234.193,
            "cz": -263.003,
            "yaw": 76,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_v5_0_241.131_-265.764",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -76,
            "position": {
              "x": 241.131,
              "y": 0.12,
              "z": -265.764
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_v5_0_226.771_-262.183",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 104,
            "position": {
              "x": 226.771,
              "y": 0.12,
              "z": -262.183
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
        "id": "skit_s_v5_1",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 233.936,
            "maxX": 249.934,
            "minZ": -242.138,
            "maxZ": -221.77,
            "obb": {
              "cx": 241.935,
              "cz": -231.954,
              "hx": 9,
              "hz": 6,
              "c": 0.2419218955996679,
              "s": 0.9702957262759965
            },
            "cx": 241.935,
            "cz": -231.954,
            "yaw": 76,
            "length": 18,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_v5_1_249.357_-232.774",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -76,
            "position": {
              "x": 249.357,
              "y": 0.12,
              "z": -232.774
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_v5_1_234.997_-229.193",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 104,
            "position": {
              "x": 234.997,
              "y": 0.12,
              "z": -229.193
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
        "id": "skit_s_v6_0",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 258.7,
            "maxX": 275.666,
            "minZ": -283.354,
            "maxZ": -259.104,
            "obb": {
              "cx": 267.183,
              "cz": -271.229,
              "hx": 11,
              "hz": 6,
              "c": 0.2419218955996679,
              "s": 0.9702957262759965
            },
            "cx": 267.183,
            "cz": -271.229,
            "yaw": 76,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_v6_0_274.121_-273.99",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -76,
            "position": {
              "x": 274.121,
              "y": 0.12,
              "z": -273.99
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_v6_0_259.761_-270.409",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 104,
            "position": {
              "x": 259.761,
              "y": 0.12,
              "z": -270.409
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
        "id": "skit_s_v6_1",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 266.926,
            "maxX": 282.924,
            "minZ": -250.363,
            "maxZ": -229.995,
            "obb": {
              "cx": 274.925,
              "cz": -240.179,
              "hx": 9,
              "hz": 6,
              "c": 0.2419218955996679,
              "s": 0.9702957262759965
            },
            "cx": 274.925,
            "cz": -240.179,
            "yaw": 76,
            "length": 18,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_skit_s_v6_1_282.347_-240.999",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -76,
            "position": {
              "x": 282.347,
              "y": 0.12,
              "z": -240.999
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_skit_s_v6_1_267.987_-237.418",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 104,
            "position": {
              "x": 267.987,
              "y": 0.12,
              "z": -237.418
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
        "id": "skit_x0_0",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 57.857,
            "maxX": 72.403,
            "minZ": -245.645,
            "maxZ": -231.099,
            "obb": {
              "cx": 65.13,
              "cz": -238.372,
              "hx": 6,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 65.13,
            "cz": -238.372,
            "yaw": -14,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "skit_x1_0",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 90.847,
            "maxX": 105.393,
            "minZ": -253.87,
            "maxZ": -239.324,
            "obb": {
              "cx": 98.12,
              "cz": -246.597,
              "hx": 6,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 98.12,
            "cz": -246.597,
            "yaw": -14,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "skit_x2_0",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 123.837,
            "maxX": 138.383,
            "minZ": -262.095,
            "maxZ": -247.549,
            "obb": {
              "cx": 131.11,
              "cz": -254.822,
              "hx": 6,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 131.11,
            "cz": -254.822,
            "yaw": -14,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "skit_x3_0",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 156.827,
            "maxX": 171.373,
            "minZ": -270.321,
            "maxZ": -255.775,
            "obb": {
              "cx": 164.1,
              "cz": -263.048,
              "hx": 6,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 164.1,
            "cz": -263.048,
            "yaw": -14,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "skit_x4_0",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 189.818,
            "maxX": 204.364,
            "minZ": -278.546,
            "maxZ": -264,
            "obb": {
              "cx": 197.091,
              "cz": -271.273,
              "hx": 6,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 197.091,
            "cz": -271.273,
            "yaw": -14,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "skit_x5_0",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 222.808,
            "maxX": 237.354,
            "minZ": -286.771,
            "maxZ": -272.225,
            "obb": {
              "cx": 230.081,
              "cz": -279.498,
              "hx": 6,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 230.081,
            "cz": -279.498,
            "yaw": -14,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "skit_x6_0",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 255.798,
            "maxX": 270.344,
            "minZ": -294.997,
            "maxZ": -280.451,
            "obb": {
              "cx": 263.071,
              "cz": -287.724,
              "hx": 6,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 263.071,
            "cz": -287.724,
            "yaw": -14,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "skit_x0_1",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 66.083,
            "maxX": 80.629,
            "minZ": -212.655,
            "maxZ": -198.109,
            "obb": {
              "cx": 73.356,
              "cz": -205.382,
              "hx": 6,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 73.356,
            "cz": -205.382,
            "yaw": -14,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "skit_x1_1",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 99.073,
            "maxX": 113.619,
            "minZ": -220.88,
            "maxZ": -206.334,
            "obb": {
              "cx": 106.346,
              "cz": -213.607,
              "hx": 6,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 106.346,
            "cz": -213.607,
            "yaw": -14,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "skit_x2_1",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 132.063,
            "maxX": 146.609,
            "minZ": -229.105,
            "maxZ": -214.559,
            "obb": {
              "cx": 139.336,
              "cz": -221.832,
              "hx": 6,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 139.336,
            "cz": -221.832,
            "yaw": -14,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "skit_x3_1",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 165.053,
            "maxX": 179.599,
            "minZ": -237.331,
            "maxZ": -222.785,
            "obb": {
              "cx": 172.326,
              "cz": -230.058,
              "hx": 6,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 172.326,
            "cz": -230.058,
            "yaw": -14,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "skit_x4_1",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 198.043,
            "maxX": 212.589,
            "minZ": -245.556,
            "maxZ": -231.01,
            "obb": {
              "cx": 205.316,
              "cz": -238.283,
              "hx": 6,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 205.316,
            "cz": -238.283,
            "yaw": -14,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "skit_x5_1",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 231.033,
            "maxX": 245.579,
            "minZ": -253.781,
            "maxZ": -239.235,
            "obb": {
              "cx": 238.306,
              "cz": -246.508,
              "hx": 6,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 238.306,
            "cz": -246.508,
            "yaw": -14,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "skit_x6_1",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 264.023,
            "maxX": 278.569,
            "minZ": -262.007,
            "maxZ": -247.461,
            "obb": {
              "cx": 271.296,
              "cz": -254.734,
              "hx": 6,
              "hz": 6,
              "c": 0.9702957262759965,
              "s": -0.24192189559966773
            },
            "cx": 271.296,
            "cz": -254.734,
            "yaw": -14,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": 0.12,
            "bottomY": -0.48,
            "topAtMin": 0.12,
            "topAtMax": 0.12,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "nkab_s_h0_0",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -245.068,
            "maxX": -222.778,
            "minZ": 125.75,
            "maxZ": 142.514,
            "obb": {
              "cx": -233.923,
              "cz": 134.132,
              "hx": 10,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -233.923,
            "cz": 134.132,
            "yaw": 22,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_h0_0_-231.526_128.198",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -22,
            "position": {
              "x": -231.526,
              "y": 14.891,
              "z": 128.198
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_h0_0_-236.32_140.066",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 158,
            "position": {
              "x": -236.32,
              "y": 14.891,
              "z": 140.066
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
        "id": "nkab_s_h0_1",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -217.252,
            "maxX": -194.962,
            "minZ": 136.988,
            "maxZ": 153.752,
            "obb": {
              "cx": -206.107,
              "cz": 145.37,
              "hx": 10,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -206.107,
            "cz": 145.37,
            "yaw": 22,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_h0_1_-203.71_139.436",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -22,
            "position": {
              "x": -203.71,
              "y": 14.891,
              "z": 139.436
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_h0_1_-208.504_151.304",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 158,
            "position": {
              "x": -208.504,
              "y": 14.891,
              "z": 151.304
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
        "id": "nkab_s_h0_2",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -189.436,
            "maxX": -167.146,
            "minZ": 148.226,
            "maxZ": 164.99,
            "obb": {
              "cx": -178.291,
              "cz": 156.608,
              "hx": 10,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -178.291,
            "cz": 156.608,
            "yaw": 22,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_h0_2_-175.894_150.674",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -22,
            "position": {
              "x": -175.894,
              "y": 14.891,
              "z": 150.674
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_h0_2_-180.688_162.542",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 158,
            "position": {
              "x": -180.688,
              "y": 14.891,
              "z": 162.542
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
        "id": "nkab_s_h0_3",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -161.621,
            "maxX": -139.331,
            "minZ": 159.465,
            "maxZ": 176.229,
            "obb": {
              "cx": -150.476,
              "cz": 167.847,
              "hx": 10,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -150.476,
            "cz": 167.847,
            "yaw": 22,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_h0_3_-148.079_161.913",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -22,
            "position": {
              "x": -148.079,
              "y": 14.891,
              "z": 161.913
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_h0_3_-152.873_173.781",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 158,
            "position": {
              "x": -152.873,
              "y": 14.891,
              "z": 173.781
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
        "id": "nkab_s_h0_4",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -133.806,
            "maxX": -104.098,
            "minZ": 170.703,
            "maxZ": 190.463,
            "obb": {
              "cx": -118.952,
              "cz": 180.583,
              "hx": 14,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -118.952,
            "cz": 180.583,
            "yaw": 22,
            "length": 28,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_h0_4_-120.263_173.151",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -22,
            "position": {
              "x": -120.263,
              "y": 14.891,
              "z": 173.151
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_h0_4_-125.058_185.019",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 158,
            "position": {
              "x": -125.058,
              "y": 14.891,
              "z": 185.019
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
        "id": "nkab_s_h1_0",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -256.306,
            "maxX": -234.016,
            "minZ": 153.566,
            "maxZ": 170.33,
            "obb": {
              "cx": -245.161,
              "cz": 161.948,
              "hx": 10,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -245.161,
            "cz": 161.948,
            "yaw": 22,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_h1_0_-242.764_156.014",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -22,
            "position": {
              "x": -242.764,
              "y": 14.891,
              "z": 156.014
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_h1_0_-247.558_167.882",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 158,
            "position": {
              "x": -247.558,
              "y": 14.891,
              "z": 167.882
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
        "id": "nkab_s_h1_1",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -228.49,
            "maxX": -206.2,
            "minZ": 164.804,
            "maxZ": 181.568,
            "obb": {
              "cx": -217.345,
              "cz": 173.186,
              "hx": 10,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -217.345,
            "cz": 173.186,
            "yaw": 22,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_h1_1_-214.948_167.252",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -22,
            "position": {
              "x": -214.948,
              "y": 14.891,
              "z": 167.252
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_h1_1_-219.742_179.12",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 158,
            "position": {
              "x": -219.742,
              "y": 14.891,
              "z": 179.12
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
        "id": "nkab_s_h1_2",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -200.675,
            "maxX": -178.385,
            "minZ": 176.042,
            "maxZ": 192.806,
            "obb": {
              "cx": -189.53,
              "cz": 184.424,
              "hx": 10,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -189.53,
            "cz": 184.424,
            "yaw": 22,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_h1_2_-187.133_178.49",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -22,
            "position": {
              "x": -187.133,
              "y": 14.891,
              "z": 178.49
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_h1_2_-191.927_190.358",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 158,
            "position": {
              "x": -191.927,
              "y": 14.891,
              "z": 190.358
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
        "id": "nkab_s_h1_3",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -172.859,
            "maxX": -150.569,
            "minZ": 187.28,
            "maxZ": 204.044,
            "obb": {
              "cx": -161.714,
              "cz": 195.662,
              "hx": 10,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -161.714,
            "cz": 195.662,
            "yaw": 22,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_h1_3_-159.317_189.728",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -22,
            "position": {
              "x": -159.317,
              "y": 14.891,
              "z": 189.728
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_h1_3_-164.111_201.596",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 158,
            "position": {
              "x": -164.111,
              "y": 14.891,
              "z": 201.596
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
        "id": "nkab_s_h1_4",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -145.044,
            "maxX": -115.336,
            "minZ": 198.519,
            "maxZ": 218.279,
            "obb": {
              "cx": -130.19,
              "cz": 208.399,
              "hx": 14,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -130.19,
            "cz": 208.399,
            "yaw": 22,
            "length": 28,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_h1_4_-131.501_200.967",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -22,
            "position": {
              "x": -131.501,
              "y": 14.891,
              "z": 200.967
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_h1_4_-136.296_212.835",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 158,
            "position": {
              "x": -136.296,
              "y": 14.891,
              "z": 212.835
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
        "id": "nkab_s_h2_0",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -267.544,
            "maxX": -245.254,
            "minZ": 181.381,
            "maxZ": 198.145,
            "obb": {
              "cx": -256.399,
              "cz": 189.763,
              "hx": 10,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -256.399,
            "cz": 189.763,
            "yaw": 22,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_h2_0_-254.002_183.829",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -22,
            "position": {
              "x": -254.002,
              "y": 14.891,
              "z": 183.829
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_h2_0_-258.796_195.697",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 158,
            "position": {
              "x": -258.796,
              "y": 14.891,
              "z": 195.697
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
        "id": "nkab_s_h2_1",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -239.728,
            "maxX": -217.438,
            "minZ": 192.619,
            "maxZ": 209.383,
            "obb": {
              "cx": -228.583,
              "cz": 201.001,
              "hx": 10,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -228.583,
            "cz": 201.001,
            "yaw": 22,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_h2_1_-226.186_195.067",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -22,
            "position": {
              "x": -226.186,
              "y": 14.891,
              "z": 195.067
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_h2_1_-230.98_206.935",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 158,
            "position": {
              "x": -230.98,
              "y": 14.891,
              "z": 206.935
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
        "id": "nkab_s_h2_2",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -211.913,
            "maxX": -189.623,
            "minZ": 203.858,
            "maxZ": 220.622,
            "obb": {
              "cx": -200.768,
              "cz": 212.24,
              "hx": 10,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -200.768,
            "cz": 212.24,
            "yaw": 22,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_h2_2_-198.371_206.306",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -22,
            "position": {
              "x": -198.371,
              "y": 14.891,
              "z": 206.306
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_h2_2_-203.165_218.174",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 158,
            "position": {
              "x": -203.165,
              "y": 14.891,
              "z": 218.174
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
        "id": "nkab_s_h2_3",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -184.097,
            "maxX": -161.807,
            "minZ": 215.096,
            "maxZ": 231.86,
            "obb": {
              "cx": -172.952,
              "cz": 223.478,
              "hx": 10,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -172.952,
            "cz": 223.478,
            "yaw": 22,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_h2_3_-170.555_217.544",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -22,
            "position": {
              "x": -170.555,
              "y": 14.891,
              "z": 217.544
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_h2_3_-175.349_229.412",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 158,
            "position": {
              "x": -175.349,
              "y": 14.891,
              "z": 229.412
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
        "id": "nkab_s_h2_4",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -156.282,
            "maxX": -126.574,
            "minZ": 226.334,
            "maxZ": 246.094,
            "obb": {
              "cx": -141.428,
              "cz": 236.214,
              "hx": 14,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -141.428,
            "cz": 236.214,
            "yaw": 22,
            "length": 28,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_h2_4_-142.739_228.782",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -22,
            "position": {
              "x": -142.739,
              "y": 14.891,
              "z": 228.782
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_h2_4_-147.534_240.65",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 158,
            "position": {
              "x": -147.534,
              "y": 14.891,
              "z": 240.65
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
        "id": "nkab_s_h3_0",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -278.782,
            "maxX": -256.492,
            "minZ": 209.197,
            "maxZ": 225.961,
            "obb": {
              "cx": -267.637,
              "cz": 217.579,
              "hx": 10,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -267.637,
            "cz": 217.579,
            "yaw": 22,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_h3_0_-265.24_211.645",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -22,
            "position": {
              "x": -265.24,
              "y": 14.891,
              "z": 211.645
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_h3_0_-270.034_223.513",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 158,
            "position": {
              "x": -270.034,
              "y": 14.891,
              "z": 223.513
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
        "id": "nkab_s_h3_1",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -250.967,
            "maxX": -228.677,
            "minZ": 220.435,
            "maxZ": 237.199,
            "obb": {
              "cx": -239.822,
              "cz": 228.817,
              "hx": 10,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -239.822,
            "cz": 228.817,
            "yaw": 22,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_h3_1_-237.425_222.883",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -22,
            "position": {
              "x": -237.425,
              "y": 14.891,
              "z": 222.883
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_h3_1_-242.219_234.751",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 158,
            "position": {
              "x": -242.219,
              "y": 14.891,
              "z": 234.751
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
        "id": "nkab_s_h3_2",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -223.151,
            "maxX": -200.861,
            "minZ": 231.673,
            "maxZ": 248.437,
            "obb": {
              "cx": -212.006,
              "cz": 240.055,
              "hx": 10,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -212.006,
            "cz": 240.055,
            "yaw": 22,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_h3_2_-209.609_234.121",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -22,
            "position": {
              "x": -209.609,
              "y": 14.891,
              "z": 234.121
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_h3_2_-214.403_245.989",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 158,
            "position": {
              "x": -214.403,
              "y": 14.891,
              "z": 245.989
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
        "id": "nkab_s_h3_3",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -195.336,
            "maxX": -173.046,
            "minZ": 242.911,
            "maxZ": 259.675,
            "obb": {
              "cx": -184.191,
              "cz": 251.293,
              "hx": 10,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -184.191,
            "cz": 251.293,
            "yaw": 22,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_h3_3_-181.794_245.359",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -22,
            "position": {
              "x": -181.794,
              "y": 14.891,
              "z": 245.359
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_h3_3_-186.588_257.227",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 158,
            "position": {
              "x": -186.588,
              "y": 14.891,
              "z": 257.227
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
        "id": "nkab_s_h3_4",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -167.52,
            "maxX": -137.812,
            "minZ": 254.15,
            "maxZ": 273.91,
            "obb": {
              "cx": -152.666,
              "cz": 264.03,
              "hx": 14,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -152.666,
            "cz": 264.03,
            "yaw": 22,
            "length": 28,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_h3_4_-153.977_256.598",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -22,
            "position": {
              "x": -153.977,
              "y": 14.891,
              "z": 256.598
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_h3_4_-158.772_268.466",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 158,
            "position": {
              "x": -158.772,
              "y": 14.891,
              "z": 268.466
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
        "id": "nkab_s_v0_0",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -261.831,
            "maxX": -245.067,
            "minZ": 131.276,
            "maxZ": 153.566,
            "obb": {
              "cx": -253.449,
              "cz": 142.421,
              "hx": 10,
              "hz": 5,
              "c": -0.37460659341591207,
              "s": 0.9271838545667874
            },
            "cx": -253.449,
            "cz": 142.421,
            "yaw": 112,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_v0_0_-247.515_144.818",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -112,
            "position": {
              "x": -247.515,
              "y": 14.891,
              "z": 144.818
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_v0_0_-259.383_140.024",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 68,
            "position": {
              "x": -259.383,
              "y": 14.891,
              "z": 140.024
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
        "id": "nkab_s_v0_1",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -273.07,
            "maxX": -256.306,
            "minZ": 159.091,
            "maxZ": 181.381,
            "obb": {
              "cx": -264.688,
              "cz": 170.236,
              "hx": 10,
              "hz": 5,
              "c": -0.37460659341591207,
              "s": 0.9271838545667874
            },
            "cx": -264.688,
            "cz": 170.236,
            "yaw": 112,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_v0_1_-258.754_172.633",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -112,
            "position": {
              "x": -258.754,
              "y": 14.891,
              "z": 172.633
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_v0_1_-270.622_167.839",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 68,
            "position": {
              "x": -270.622,
              "y": 14.891,
              "z": 167.839
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
        "id": "nkab_s_v0_2",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -284.308,
            "maxX": -267.544,
            "minZ": 186.907,
            "maxZ": 209.197,
            "obb": {
              "cx": -275.926,
              "cz": 198.052,
              "hx": 10,
              "hz": 5,
              "c": -0.37460659341591207,
              "s": 0.9271838545667874
            },
            "cx": -275.926,
            "cz": 198.052,
            "yaw": 112,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_v0_2_-269.992_200.449",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -112,
            "position": {
              "x": -269.992,
              "y": 14.891,
              "z": 200.449
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_v0_2_-281.86_195.655",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 68,
            "position": {
              "x": -281.86,
              "y": 14.891,
              "z": 195.655
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
        "id": "nkab_s_v0_3",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -294.796,
            "maxX": -278.782,
            "minZ": 214.722,
            "maxZ": 235.158,
            "obb": {
              "cx": -286.789,
              "cz": 224.94,
              "hx": 9,
              "hz": 5,
              "c": -0.37460659341591207,
              "s": 0.9271838545667874
            },
            "cx": -286.789,
            "cz": 224.94,
            "yaw": 112,
            "length": 18,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_v0_3_-281.23_228.265",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -112,
            "position": {
              "x": -281.23,
              "y": 14.891,
              "z": 228.265
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_v0_3_-293.098_223.47",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 68,
            "position": {
              "x": -293.098,
              "y": 14.891,
              "z": 223.47
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
        "id": "nkab_s_v1_0",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -234.016,
            "maxX": -217.252,
            "minZ": 142.514,
            "maxZ": 164.804,
            "obb": {
              "cx": -225.634,
              "cz": 153.659,
              "hx": 10,
              "hz": 5,
              "c": -0.37460659341591207,
              "s": 0.9271838545667874
            },
            "cx": -225.634,
            "cz": 153.659,
            "yaw": 112,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_v1_0_-219.7_156.056",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -112,
            "position": {
              "x": -219.7,
              "y": 14.891,
              "z": 156.056
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_v1_0_-231.568_151.262",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 68,
            "position": {
              "x": -231.568,
              "y": 14.891,
              "z": 151.262
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
        "id": "nkab_s_v1_1",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -245.254,
            "maxX": -228.49,
            "minZ": 170.329,
            "maxZ": 192.619,
            "obb": {
              "cx": -236.872,
              "cz": 181.474,
              "hx": 10,
              "hz": 5,
              "c": -0.37460659341591207,
              "s": 0.9271838545667874
            },
            "cx": -236.872,
            "cz": 181.474,
            "yaw": 112,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_v1_1_-230.938_183.871",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -112,
            "position": {
              "x": -230.938,
              "y": 14.891,
              "z": 183.871
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_v1_1_-242.806_179.077",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 68,
            "position": {
              "x": -242.806,
              "y": 14.891,
              "z": 179.077
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
        "id": "nkab_s_v1_2",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -256.492,
            "maxX": -239.728,
            "minZ": 198.145,
            "maxZ": 220.435,
            "obb": {
              "cx": -248.11,
              "cz": 209.29,
              "hx": 10,
              "hz": 5,
              "c": -0.37460659341591207,
              "s": 0.9271838545667874
            },
            "cx": -248.11,
            "cz": 209.29,
            "yaw": 112,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_v1_2_-242.176_211.687",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -112,
            "position": {
              "x": -242.176,
              "y": 14.891,
              "z": 211.687
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_v1_2_-254.044_206.893",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 68,
            "position": {
              "x": -254.044,
              "y": 14.891,
              "z": 206.893
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
        "id": "nkab_s_v1_3",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -266.981,
            "maxX": -250.967,
            "minZ": 225.96,
            "maxZ": 246.396,
            "obb": {
              "cx": -258.974,
              "cz": 236.178,
              "hx": 9,
              "hz": 5,
              "c": -0.37460659341591207,
              "s": 0.9271838545667874
            },
            "cx": -258.974,
            "cz": 236.178,
            "yaw": 112,
            "length": 18,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_v1_3_-253.415_239.503",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -112,
            "position": {
              "x": -253.415,
              "y": 14.891,
              "z": 239.503
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_v1_3_-265.283_234.708",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 68,
            "position": {
              "x": -265.283,
              "y": 14.891,
              "z": 234.708
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
        "id": "nkab_s_v2_0",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -206.2,
            "maxX": -189.436,
            "minZ": 153.752,
            "maxZ": 176.042,
            "obb": {
              "cx": -197.818,
              "cz": 164.897,
              "hx": 10,
              "hz": 5,
              "c": -0.37460659341591207,
              "s": 0.9271838545667874
            },
            "cx": -197.818,
            "cz": 164.897,
            "yaw": 112,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_v2_0_-191.884_167.294",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -112,
            "position": {
              "x": -191.884,
              "y": 14.891,
              "z": 167.294
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_v2_0_-203.752_162.5",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 68,
            "position": {
              "x": -203.752,
              "y": 14.891,
              "z": 162.5
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
        "id": "nkab_s_v2_1",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -217.439,
            "maxX": -200.675,
            "minZ": 181.568,
            "maxZ": 203.858,
            "obb": {
              "cx": -209.057,
              "cz": 192.713,
              "hx": 10,
              "hz": 5,
              "c": -0.37460659341591207,
              "s": 0.9271838545667874
            },
            "cx": -209.057,
            "cz": 192.713,
            "yaw": 112,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_v2_1_-203.123_195.11",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -112,
            "position": {
              "x": -203.123,
              "y": 14.891,
              "z": 195.11
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_v2_1_-214.991_190.316",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 68,
            "position": {
              "x": -214.991,
              "y": 14.891,
              "z": 190.316
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
        "id": "nkab_s_v2_2",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -228.677,
            "maxX": -211.913,
            "minZ": 209.383,
            "maxZ": 231.673,
            "obb": {
              "cx": -220.295,
              "cz": 220.528,
              "hx": 10,
              "hz": 5,
              "c": -0.37460659341591207,
              "s": 0.9271838545667874
            },
            "cx": -220.295,
            "cz": 220.528,
            "yaw": 112,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_v2_2_-214.361_222.925",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -112,
            "position": {
              "x": -214.361,
              "y": 14.891,
              "z": 222.925
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_v2_2_-226.229_218.131",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 68,
            "position": {
              "x": -226.229,
              "y": 14.891,
              "z": 218.131
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
        "id": "nkab_s_v2_3",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -239.165,
            "maxX": -223.151,
            "minZ": 237.198,
            "maxZ": 257.634,
            "obb": {
              "cx": -231.158,
              "cz": 247.416,
              "hx": 9,
              "hz": 5,
              "c": -0.37460659341591207,
              "s": 0.9271838545667874
            },
            "cx": -231.158,
            "cz": 247.416,
            "yaw": 112,
            "length": 18,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_v2_3_-225.599_250.741",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -112,
            "position": {
              "x": -225.599,
              "y": 14.891,
              "z": 250.741
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_v2_3_-237.467_245.946",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 68,
            "position": {
              "x": -237.467,
              "y": 14.891,
              "z": 245.946
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
        "id": "nkab_s_v3_0",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -178.385,
            "maxX": -161.621,
            "minZ": 164.99,
            "maxZ": 187.28,
            "obb": {
              "cx": -170.003,
              "cz": 176.135,
              "hx": 10,
              "hz": 5,
              "c": -0.37460659341591207,
              "s": 0.9271838545667874
            },
            "cx": -170.003,
            "cz": 176.135,
            "yaw": 112,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_v3_0_-164.069_178.532",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -112,
            "position": {
              "x": -164.069,
              "y": 14.891,
              "z": 178.532
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_v3_0_-175.937_173.738",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 68,
            "position": {
              "x": -175.937,
              "y": 14.891,
              "z": 173.738
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
        "id": "nkab_s_v3_1",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -189.623,
            "maxX": -172.859,
            "minZ": 192.806,
            "maxZ": 215.096,
            "obb": {
              "cx": -181.241,
              "cz": 203.951,
              "hx": 10,
              "hz": 5,
              "c": -0.37460659341591207,
              "s": 0.9271838545667874
            },
            "cx": -181.241,
            "cz": 203.951,
            "yaw": 112,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_v3_1_-175.307_206.348",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -112,
            "position": {
              "x": -175.307,
              "y": 14.891,
              "z": 206.348
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_v3_1_-187.175_201.554",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 68,
            "position": {
              "x": -187.175,
              "y": 14.891,
              "z": 201.554
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
        "id": "nkab_s_v3_2",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -200.861,
            "maxX": -184.097,
            "minZ": 220.621,
            "maxZ": 242.911,
            "obb": {
              "cx": -192.479,
              "cz": 231.766,
              "hx": 10,
              "hz": 5,
              "c": -0.37460659341591207,
              "s": 0.9271838545667874
            },
            "cx": -192.479,
            "cz": 231.766,
            "yaw": 112,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_v3_2_-186.545_234.163",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -112,
            "position": {
              "x": -186.545,
              "y": 14.891,
              "z": 234.163
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_v3_2_-198.413_229.369",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 68,
            "position": {
              "x": -198.413,
              "y": 14.891,
              "z": 229.369
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
        "id": "nkab_s_v3_3",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -211.35,
            "maxX": -195.336,
            "minZ": 248.437,
            "maxZ": 268.873,
            "obb": {
              "cx": -203.343,
              "cz": 258.655,
              "hx": 9,
              "hz": 5,
              "c": -0.37460659341591207,
              "s": 0.9271838545667874
            },
            "cx": -203.343,
            "cz": 258.655,
            "yaw": 112,
            "length": 18,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_v3_3_-197.784_261.98",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -112,
            "position": {
              "x": -197.784,
              "y": 14.891,
              "z": 261.98
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_v3_3_-209.652_257.185",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 68,
            "position": {
              "x": -209.652,
              "y": 14.891,
              "z": 257.185
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
        "id": "nkab_s_v4_0",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -150.569,
            "maxX": -133.805,
            "minZ": 176.229,
            "maxZ": 198.519,
            "obb": {
              "cx": -142.187,
              "cz": 187.374,
              "hx": 10,
              "hz": 5,
              "c": -0.37460659341591207,
              "s": 0.9271838545667874
            },
            "cx": -142.187,
            "cz": 187.374,
            "yaw": 112,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_v4_0_-136.253_189.771",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -112,
            "position": {
              "x": -136.253,
              "y": 14.891,
              "z": 189.771
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_v4_0_-148.121_184.977",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 68,
            "position": {
              "x": -148.121,
              "y": 14.891,
              "z": 184.977
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
        "id": "nkab_s_v4_1",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -161.808,
            "maxX": -145.044,
            "minZ": 204.044,
            "maxZ": 226.334,
            "obb": {
              "cx": -153.426,
              "cz": 215.189,
              "hx": 10,
              "hz": 5,
              "c": -0.37460659341591207,
              "s": 0.9271838545667874
            },
            "cx": -153.426,
            "cz": 215.189,
            "yaw": 112,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_v4_1_-147.492_217.586",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -112,
            "position": {
              "x": -147.492,
              "y": 14.891,
              "z": 217.586
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_v4_1_-159.36_212.792",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 68,
            "position": {
              "x": -159.36,
              "y": 14.891,
              "z": 212.792
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
        "id": "nkab_s_v4_2",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -173.046,
            "maxX": -156.282,
            "minZ": 231.86,
            "maxZ": 254.15,
            "obb": {
              "cx": -164.664,
              "cz": 243.005,
              "hx": 10,
              "hz": 5,
              "c": -0.37460659341591207,
              "s": 0.9271838545667874
            },
            "cx": -164.664,
            "cz": 243.005,
            "yaw": 112,
            "length": 20,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_v4_2_-158.73_245.402",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -112,
            "position": {
              "x": -158.73,
              "y": 14.891,
              "z": 245.402
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_v4_2_-170.598_240.608",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 68,
            "position": {
              "x": -170.598,
              "y": 14.891,
              "z": 240.608
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
        "id": "nkab_s_v4_3",
        "type": "ground",
        "width": 10,
        "withLamps": true,
        "decks": [
          {
            "minX": -183.534,
            "maxX": -167.52,
            "minZ": 259.675,
            "maxZ": 280.111,
            "obb": {
              "cx": -175.527,
              "cz": 269.893,
              "hx": 9,
              "hz": 5,
              "c": -0.37460659341591207,
              "s": 0.9271838545667874
            },
            "cx": -175.527,
            "cz": 269.893,
            "yaw": 112,
            "length": 18,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_nkab_s_v4_3_-169.968_273.218",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -112,
            "position": {
              "x": -169.968,
              "y": 14.891,
              "z": 273.218
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_nkab_s_v4_3_-181.836_268.423",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 68,
            "position": {
              "x": -181.836,
              "y": 14.891,
              "z": 268.423
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
        "id": "nkab_x1_0",
        "type": "ground",
        "width": 10,
        "withLamps": false,
        "decks": [
          {
            "minX": -226.524,
            "maxX": -213.506,
            "minZ": 133.242,
            "maxZ": 146.26,
            "obb": {
              "cx": -220.015,
              "cz": 139.751,
              "hx": 5,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -220.015,
            "cz": 139.751,
            "yaw": 22,
            "length": 10,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "nkab_x2_0",
        "type": "ground",
        "width": 10,
        "withLamps": false,
        "decks": [
          {
            "minX": -198.708,
            "maxX": -185.69,
            "minZ": 144.48,
            "maxZ": 157.498,
            "obb": {
              "cx": -192.199,
              "cz": 150.989,
              "hx": 5,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -192.199,
            "cz": 150.989,
            "yaw": 22,
            "length": 10,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "nkab_x3_0",
        "type": "ground",
        "width": 10,
        "withLamps": false,
        "decks": [
          {
            "minX": -170.893,
            "maxX": -157.875,
            "minZ": 155.719,
            "maxZ": 168.737,
            "obb": {
              "cx": -164.384,
              "cz": 162.228,
              "hx": 5,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -164.384,
            "cz": 162.228,
            "yaw": 22,
            "length": 10,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "nkab_x4_0",
        "type": "ground",
        "width": 10,
        "withLamps": false,
        "decks": [
          {
            "minX": -143.077,
            "maxX": -130.059,
            "minZ": 166.957,
            "maxZ": 179.975,
            "obb": {
              "cx": -136.568,
              "cz": 173.466,
              "hx": 5,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -136.568,
            "cz": 173.466,
            "yaw": 22,
            "length": 10,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "nkab_x0_1",
        "type": "ground",
        "width": 10,
        "withLamps": false,
        "decks": [
          {
            "minX": -265.577,
            "maxX": -252.559,
            "minZ": 149.819,
            "maxZ": 162.837,
            "obb": {
              "cx": -259.068,
              "cz": 156.328,
              "hx": 5,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -259.068,
            "cz": 156.328,
            "yaw": 22,
            "length": 10,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "nkab_x1_1",
        "type": "ground",
        "width": 10,
        "withLamps": false,
        "decks": [
          {
            "minX": -237.762,
            "maxX": -224.744,
            "minZ": 161.058,
            "maxZ": 174.076,
            "obb": {
              "cx": -231.253,
              "cz": 167.567,
              "hx": 5,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -231.253,
            "cz": 167.567,
            "yaw": 22,
            "length": 10,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "nkab_x2_1",
        "type": "ground",
        "width": 10,
        "withLamps": false,
        "decks": [
          {
            "minX": -209.946,
            "maxX": -196.928,
            "minZ": 172.296,
            "maxZ": 185.314,
            "obb": {
              "cx": -203.437,
              "cz": 178.805,
              "hx": 5,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -203.437,
            "cz": 178.805,
            "yaw": 22,
            "length": 10,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "nkab_x3_1",
        "type": "ground",
        "width": 10,
        "withLamps": false,
        "decks": [
          {
            "minX": -182.131,
            "maxX": -169.113,
            "minZ": 183.534,
            "maxZ": 196.552,
            "obb": {
              "cx": -175.622,
              "cz": 190.043,
              "hx": 5,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -175.622,
            "cz": 190.043,
            "yaw": 22,
            "length": 10,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "nkab_x4_1",
        "type": "ground",
        "width": 10,
        "withLamps": false,
        "decks": [
          {
            "minX": -154.315,
            "maxX": -141.297,
            "minZ": 194.772,
            "maxZ": 207.79,
            "obb": {
              "cx": -147.806,
              "cz": 201.281,
              "hx": 5,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -147.806,
            "cz": 201.281,
            "yaw": 22,
            "length": 10,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "nkab_x0_2",
        "type": "ground",
        "width": 10,
        "withLamps": false,
        "decks": [
          {
            "minX": -276.816,
            "maxX": -263.798,
            "minZ": 177.635,
            "maxZ": 190.653,
            "obb": {
              "cx": -270.307,
              "cz": 184.144,
              "hx": 5,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -270.307,
            "cz": 184.144,
            "yaw": 22,
            "length": 10,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "nkab_x1_2",
        "type": "ground",
        "width": 10,
        "withLamps": false,
        "decks": [
          {
            "minX": -249,
            "maxX": -235.982,
            "minZ": 188.873,
            "maxZ": 201.891,
            "obb": {
              "cx": -242.491,
              "cz": 195.382,
              "hx": 5,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -242.491,
            "cz": 195.382,
            "yaw": 22,
            "length": 10,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "nkab_x2_2",
        "type": "ground",
        "width": 10,
        "withLamps": false,
        "decks": [
          {
            "minX": -221.185,
            "maxX": -208.167,
            "minZ": 200.111,
            "maxZ": 213.129,
            "obb": {
              "cx": -214.676,
              "cz": 206.62,
              "hx": 5,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -214.676,
            "cz": 206.62,
            "yaw": 22,
            "length": 10,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "nkab_x3_2",
        "type": "ground",
        "width": 10,
        "withLamps": false,
        "decks": [
          {
            "minX": -193.369,
            "maxX": -180.351,
            "minZ": 211.35,
            "maxZ": 224.368,
            "obb": {
              "cx": -186.86,
              "cz": 217.859,
              "hx": 5,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -186.86,
            "cz": 217.859,
            "yaw": 22,
            "length": 10,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "nkab_x4_2",
        "type": "ground",
        "width": 10,
        "withLamps": false,
        "decks": [
          {
            "minX": -165.554,
            "maxX": -152.536,
            "minZ": 222.588,
            "maxZ": 235.606,
            "obb": {
              "cx": -159.045,
              "cz": 229.097,
              "hx": 5,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -159.045,
            "cz": 229.097,
            "yaw": 22,
            "length": 10,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "nkab_x0_3",
        "type": "ground",
        "width": 10,
        "withLamps": false,
        "decks": [
          {
            "minX": -288.054,
            "maxX": -275.036,
            "minZ": 205.451,
            "maxZ": 218.469,
            "obb": {
              "cx": -281.545,
              "cz": 211.96,
              "hx": 5,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -281.545,
            "cz": 211.96,
            "yaw": 22,
            "length": 10,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "nkab_x1_3",
        "type": "ground",
        "width": 10,
        "withLamps": false,
        "decks": [
          {
            "minX": -260.238,
            "maxX": -247.22,
            "minZ": 216.689,
            "maxZ": 229.707,
            "obb": {
              "cx": -253.729,
              "cz": 223.198,
              "hx": 5,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -253.729,
            "cz": 223.198,
            "yaw": 22,
            "length": 10,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "nkab_x2_3",
        "type": "ground",
        "width": 10,
        "withLamps": false,
        "decks": [
          {
            "minX": -232.423,
            "maxX": -219.405,
            "minZ": 227.927,
            "maxZ": 240.945,
            "obb": {
              "cx": -225.914,
              "cz": 234.436,
              "hx": 5,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -225.914,
            "cz": 234.436,
            "yaw": 22,
            "length": 10,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "nkab_x3_3",
        "type": "ground",
        "width": 10,
        "withLamps": false,
        "decks": [
          {
            "minX": -204.607,
            "maxX": -191.589,
            "minZ": 239.165,
            "maxZ": 252.183,
            "obb": {
              "cx": -198.098,
              "cz": 245.674,
              "hx": 5,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -198.098,
            "cz": 245.674,
            "yaw": 22,
            "length": 10,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "nkab_x4_3",
        "type": "ground",
        "width": 10,
        "withLamps": false,
        "decks": [
          {
            "minX": -176.792,
            "maxX": -163.774,
            "minZ": 250.403,
            "maxZ": 263.421,
            "obb": {
              "cx": -170.283,
              "cz": 256.912,
              "hx": 5,
              "hz": 5,
              "c": 0.9271838545667874,
              "s": 0.374606593415912
            },
            "cx": -170.283,
            "cz": 256.912,
            "yaw": 22,
            "length": 10,
            "width": 10,
            "axis": "x",
            "topY": 14.891,
            "bottomY": 14.291,
            "topAtMin": 14.891,
            "topAtMax": 14.891,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "ncc_s_h0_0",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": -20.963,
            "maxX": 6.733,
            "minZ": 164.812,
            "maxZ": 182.294,
            "obb": {
              "cx": -7.115,
              "cz": 173.553,
              "hx": 13,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": -7.115,
            "cz": 173.553,
            "yaw": -8,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_h0_0_-11.255_165.652",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 8,
            "position": {
              "x": -11.255,
              "y": 14.903,
              "z": 165.652
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_h0_0_-8.917_182.289",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -172,
            "position": {
              "x": -8.917,
              "y": 14.903,
              "z": 182.289
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
        "id": "ncc_s_h0_1",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 18.648,
            "maxX": 46.344,
            "minZ": 159.245,
            "maxZ": 176.727,
            "obb": {
              "cx": 32.496,
              "cz": 167.986,
              "hx": 13,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 32.496,
            "cz": 167.986,
            "yaw": -8,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_h0_1_28.356_160.085",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 8,
            "position": {
              "x": 28.356,
              "y": 14.903,
              "z": 160.085
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_h0_1_30.694_176.722",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -172,
            "position": {
              "x": 30.694,
              "y": 14.903,
              "z": 176.722
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
        "id": "ncc_s_h0_2",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 58.259,
            "maxX": 85.955,
            "minZ": 153.678,
            "maxZ": 171.16,
            "obb": {
              "cx": 72.107,
              "cz": 162.419,
              "hx": 13,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 72.107,
            "cz": 162.419,
            "yaw": -8,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_h0_2_67.967_154.518",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 8,
            "position": {
              "x": 67.967,
              "y": 14.903,
              "z": 154.518
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_h0_2_70.305_171.155",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -172,
            "position": {
              "x": 70.305,
              "y": 14.903,
              "z": 171.155
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
        "id": "ncc_s_h0_3",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 97.869,
            "maxX": 125.565,
            "minZ": 148.111,
            "maxZ": 165.593,
            "obb": {
              "cx": 111.717,
              "cz": 156.852,
              "hx": 13,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 111.717,
            "cz": 156.852,
            "yaw": -8,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_h0_3_107.577_148.951",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 8,
            "position": {
              "x": 107.577,
              "y": 14.903,
              "z": 148.951
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_h0_3_109.915_165.588",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -172,
            "position": {
              "x": 109.915,
              "y": 14.903,
              "z": 165.588
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
        "id": "ncc_s_h0_4",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 137.48,
            "maxX": 165.176,
            "minZ": 142.544,
            "maxZ": 160.026,
            "obb": {
              "cx": 151.328,
              "cz": 151.285,
              "hx": 13,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 151.328,
            "cz": 151.285,
            "yaw": -8,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_h0_4_147.188_143.384",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 8,
            "position": {
              "x": 147.188,
              "y": 14.903,
              "z": 143.384
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_h0_4_149.526_160.021",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -172,
            "position": {
              "x": 149.526,
              "y": 14.903,
              "z": 160.021
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
        "id": "ncc_s_h0_5",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 177.091,
            "maxX": 204.787,
            "minZ": 136.977,
            "maxZ": 154.459,
            "obb": {
              "cx": 190.939,
              "cz": 145.718,
              "hx": 13,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 190.939,
            "cz": 145.718,
            "yaw": -8,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_h0_5_186.799_137.817",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 8,
            "position": {
              "x": 186.799,
              "y": 14.903,
              "z": 137.817
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_h0_5_189.137_154.454",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -172,
            "position": {
              "x": 189.137,
              "y": 14.903,
              "z": 154.454
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
        "id": "ncc_s_h1_0",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": -15.396,
            "maxX": 12.3,
            "minZ": 204.423,
            "maxZ": 221.905,
            "obb": {
              "cx": -1.548,
              "cz": 213.164,
              "hx": 13,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": -1.548,
            "cz": 213.164,
            "yaw": -8,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_h1_0_-5.688_205.263",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 8,
            "position": {
              "x": -5.688,
              "y": 14.903,
              "z": 205.263
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_h1_0_-3.35_221.9",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -172,
            "position": {
              "x": -3.35,
              "y": 14.903,
              "z": 221.9
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
        "id": "ncc_s_h1_1",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 24.215,
            "maxX": 51.911,
            "minZ": 198.856,
            "maxZ": 216.338,
            "obb": {
              "cx": 38.063,
              "cz": 207.597,
              "hx": 13,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 38.063,
            "cz": 207.597,
            "yaw": -8,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_h1_1_33.923_199.696",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 8,
            "position": {
              "x": 33.923,
              "y": 14.903,
              "z": 199.696
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_h1_1_36.261_216.333",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -172,
            "position": {
              "x": 36.261,
              "y": 14.903,
              "z": 216.333
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
        "id": "ncc_s_h1_2",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 63.825,
            "maxX": 91.521,
            "minZ": 193.289,
            "maxZ": 210.771,
            "obb": {
              "cx": 77.673,
              "cz": 202.03,
              "hx": 13,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 77.673,
            "cz": 202.03,
            "yaw": -8,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_h1_2_73.533_194.129",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 8,
            "position": {
              "x": 73.533,
              "y": 14.903,
              "z": 194.129
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_h1_2_75.871_210.766",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -172,
            "position": {
              "x": 75.871,
              "y": 14.903,
              "z": 210.766
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
        "id": "ncc_s_h1_3",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 103.436,
            "maxX": 131.132,
            "minZ": 187.722,
            "maxZ": 205.204,
            "obb": {
              "cx": 117.284,
              "cz": 196.463,
              "hx": 13,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 117.284,
            "cz": 196.463,
            "yaw": -8,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_h1_3_113.144_188.562",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 8,
            "position": {
              "x": 113.144,
              "y": 14.903,
              "z": 188.562
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_h1_3_115.482_205.199",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -172,
            "position": {
              "x": 115.482,
              "y": 14.903,
              "z": 205.199
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
        "id": "ncc_s_h1_4",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 143.047,
            "maxX": 170.743,
            "minZ": 182.155,
            "maxZ": 199.637,
            "obb": {
              "cx": 156.895,
              "cz": 190.896,
              "hx": 13,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 156.895,
            "cz": 190.896,
            "yaw": -8,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_h1_4_152.755_182.995",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 8,
            "position": {
              "x": 152.755,
              "y": 14.903,
              "z": 182.995
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_h1_4_155.093_199.632",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -172,
            "position": {
              "x": 155.093,
              "y": 14.903,
              "z": 199.632
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
        "id": "ncc_s_h1_5",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 182.658,
            "maxX": 210.354,
            "minZ": 176.588,
            "maxZ": 194.07,
            "obb": {
              "cx": 196.506,
              "cz": 185.329,
              "hx": 13,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 196.506,
            "cz": 185.329,
            "yaw": -8,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_h1_5_192.366_177.428",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 8,
            "position": {
              "x": 192.366,
              "y": 14.903,
              "z": 177.428
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_h1_5_194.704_194.065",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -172,
            "position": {
              "x": 194.704,
              "y": 14.903,
              "z": 194.065
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
        "id": "ncc_s_h2_0",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": -9.829,
            "maxX": 17.867,
            "minZ": 244.033,
            "maxZ": 261.515,
            "obb": {
              "cx": 4.019,
              "cz": 252.774,
              "hx": 13,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 4.019,
            "cz": 252.774,
            "yaw": -8,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_h2_0_-0.121_244.873",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 8,
            "position": {
              "x": -0.121,
              "y": 14.903,
              "z": 244.873
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_h2_0_2.217_261.51",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -172,
            "position": {
              "x": 2.217,
              "y": 14.903,
              "z": 261.51
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
        "id": "ncc_s_h2_1",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 29.782,
            "maxX": 57.478,
            "minZ": 238.466,
            "maxZ": 255.948,
            "obb": {
              "cx": 43.63,
              "cz": 247.207,
              "hx": 13,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 43.63,
            "cz": 247.207,
            "yaw": -8,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_h2_1_39.49_239.306",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 8,
            "position": {
              "x": 39.49,
              "y": 14.903,
              "z": 239.306
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_h2_1_41.828_255.943",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -172,
            "position": {
              "x": 41.828,
              "y": 14.903,
              "z": 255.943
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
        "id": "ncc_s_h2_2",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 69.392,
            "maxX": 97.088,
            "minZ": 232.899,
            "maxZ": 250.381,
            "obb": {
              "cx": 83.24,
              "cz": 241.64,
              "hx": 13,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 83.24,
            "cz": 241.64,
            "yaw": -8,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_h2_2_79.1_233.739",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 8,
            "position": {
              "x": 79.1,
              "y": 14.903,
              "z": 233.739
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_h2_2_81.438_250.376",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -172,
            "position": {
              "x": 81.438,
              "y": 14.903,
              "z": 250.376
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
        "id": "ncc_s_h2_3",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 109.003,
            "maxX": 136.699,
            "minZ": 227.332,
            "maxZ": 244.814,
            "obb": {
              "cx": 122.851,
              "cz": 236.073,
              "hx": 13,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 122.851,
            "cz": 236.073,
            "yaw": -8,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_h2_3_118.711_228.172",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 8,
            "position": {
              "x": 118.711,
              "y": 14.903,
              "z": 228.172
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_h2_3_121.049_244.809",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -172,
            "position": {
              "x": 121.049,
              "y": 14.903,
              "z": 244.809
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
        "id": "ncc_s_h2_4",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 148.614,
            "maxX": 176.31,
            "minZ": 221.766,
            "maxZ": 239.248,
            "obb": {
              "cx": 162.462,
              "cz": 230.507,
              "hx": 13,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 162.462,
            "cz": 230.507,
            "yaw": -8,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_h2_4_158.322_222.606",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 8,
            "position": {
              "x": 158.322,
              "y": 14.903,
              "z": 222.606
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_h2_4_160.66_239.243",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -172,
            "position": {
              "x": 160.66,
              "y": 14.903,
              "z": 239.243
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
        "id": "ncc_s_h2_5",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 188.225,
            "maxX": 215.921,
            "minZ": 216.199,
            "maxZ": 233.681,
            "obb": {
              "cx": 202.073,
              "cz": 224.94,
              "hx": 13,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 202.073,
            "cz": 224.94,
            "yaw": -8,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_h2_5_197.933_217.039",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 8,
            "position": {
              "x": 197.933,
              "y": 14.903,
              "z": 217.039
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_h2_5_200.271_233.676",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -172,
            "position": {
              "x": 200.271,
              "y": 14.903,
              "z": 233.676
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
        "id": "ncc_s_v0_0",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": -32.878,
            "maxX": -15.396,
            "minZ": 182.294,
            "maxZ": 209.99,
            "obb": {
              "cx": -24.137,
              "cz": 196.142,
              "hx": 13,
              "hz": 7,
              "c": 0.1391731009600657,
              "s": 0.9902680687415703
            },
            "cx": -24.137,
            "cz": 196.142,
            "yaw": 82,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_v0_0_-16.236_192.002",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -82,
            "position": {
              "x": -16.236,
              "y": 14.903,
              "z": 192.002
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_v0_0_-32.873_194.34",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 98,
            "position": {
              "x": -32.873,
              "y": 14.903,
              "z": 194.34
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
        "id": "ncc_s_v0_1",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": -27.311,
            "maxX": -9.829,
            "minZ": 221.904,
            "maxZ": 249.6,
            "obb": {
              "cx": -18.57,
              "cz": 235.752,
              "hx": 13,
              "hz": 7,
              "c": 0.1391731009600657,
              "s": 0.9902680687415703
            },
            "cx": -18.57,
            "cz": 235.752,
            "yaw": 82,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_v0_1_-10.669_231.612",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -82,
            "position": {
              "x": -10.669,
              "y": 14.903,
              "z": 231.612
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_v0_1_-27.306_233.95",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 98,
            "position": {
              "x": -27.306,
              "y": 14.903,
              "z": 233.95
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
        "id": "ncc_s_v0_2",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": -21.744,
            "maxX": -4.54,
            "minZ": 261.516,
            "maxZ": 287.23,
            "obb": {
              "cx": -13.142,
              "cz": 274.373,
              "hx": 12,
              "hz": 7,
              "c": 0.1391731009600657,
              "s": 0.9902680687415703
            },
            "cx": -13.142,
            "cz": 274.373,
            "yaw": 82,
            "length": 24,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_v0_2_-5.102_271.223",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -82,
            "position": {
              "x": -5.102,
              "y": 14.903,
              "z": 271.223
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_v0_2_-21.739_273.562",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 98,
            "position": {
              "x": -21.739,
              "y": 14.903,
              "z": 273.562
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
        "id": "ncc_s_v1_0",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 6.733,
            "maxX": 24.215,
            "minZ": 176.727,
            "maxZ": 204.423,
            "obb": {
              "cx": 15.474,
              "cz": 190.575,
              "hx": 13,
              "hz": 7,
              "c": 0.1391731009600657,
              "s": 0.9902680687415703
            },
            "cx": 15.474,
            "cz": 190.575,
            "yaw": 82,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_v1_0_23.375_186.435",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -82,
            "position": {
              "x": 23.375,
              "y": 14.903,
              "z": 186.435
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_v1_0_6.738_188.773",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 98,
            "position": {
              "x": 6.738,
              "y": 14.903,
              "z": 188.773
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
        "id": "ncc_s_v1_1",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 12.3,
            "maxX": 29.782,
            "minZ": 216.337,
            "maxZ": 244.033,
            "obb": {
              "cx": 21.041,
              "cz": 230.185,
              "hx": 13,
              "hz": 7,
              "c": 0.1391731009600657,
              "s": 0.9902680687415703
            },
            "cx": 21.041,
            "cz": 230.185,
            "yaw": 82,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_v1_1_28.942_226.045",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -82,
            "position": {
              "x": 28.942,
              "y": 14.903,
              "z": 226.045
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_v1_1_12.305_228.383",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 98,
            "position": {
              "x": 12.305,
              "y": 14.903,
              "z": 228.383
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
        "id": "ncc_s_v1_2",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 17.867,
            "maxX": 35.071,
            "minZ": 255.949,
            "maxZ": 281.663,
            "obb": {
              "cx": 26.469,
              "cz": 268.806,
              "hx": 12,
              "hz": 7,
              "c": 0.1391731009600657,
              "s": 0.9902680687415703
            },
            "cx": 26.469,
            "cz": 268.806,
            "yaw": 82,
            "length": 24,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_v1_2_34.509_265.656",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -82,
            "position": {
              "x": 34.509,
              "y": 14.903,
              "z": 265.656
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_v1_2_17.872_267.995",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 98,
            "position": {
              "x": 17.872,
              "y": 14.903,
              "z": 267.995
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
        "id": "ncc_s_v2_0",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 46.344,
            "maxX": 63.826,
            "minZ": 171.16,
            "maxZ": 198.856,
            "obb": {
              "cx": 55.085,
              "cz": 185.008,
              "hx": 13,
              "hz": 7,
              "c": 0.1391731009600657,
              "s": 0.9902680687415703
            },
            "cx": 55.085,
            "cz": 185.008,
            "yaw": 82,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_v2_0_62.986_180.868",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -82,
            "position": {
              "x": 62.986,
              "y": 14.903,
              "z": 180.868
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_v2_0_46.349_183.206",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 98,
            "position": {
              "x": 46.349,
              "y": 14.903,
              "z": 183.206
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
        "id": "ncc_s_v2_1",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 51.911,
            "maxX": 69.393,
            "minZ": 210.771,
            "maxZ": 238.467,
            "obb": {
              "cx": 60.652,
              "cz": 224.619,
              "hx": 13,
              "hz": 7,
              "c": 0.1391731009600657,
              "s": 0.9902680687415703
            },
            "cx": 60.652,
            "cz": 224.619,
            "yaw": 82,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_v2_1_68.553_220.479",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -82,
            "position": {
              "x": 68.553,
              "y": 14.903,
              "z": 220.479
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_v2_1_51.916_222.817",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 98,
            "position": {
              "x": 51.916,
              "y": 14.903,
              "z": 222.817
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
        "id": "ncc_s_v2_2",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 57.477,
            "maxX": 74.681,
            "minZ": 250.382,
            "maxZ": 276.096,
            "obb": {
              "cx": 66.079,
              "cz": 263.239,
              "hx": 12,
              "hz": 7,
              "c": 0.1391731009600657,
              "s": 0.9902680687415703
            },
            "cx": 66.079,
            "cz": 263.239,
            "yaw": 82,
            "length": 24,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_v2_2_74.119_260.089",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -82,
            "position": {
              "x": 74.119,
              "y": 14.903,
              "z": 260.089
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_v2_2_57.482_262.428",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 98,
            "position": {
              "x": 57.482,
              "y": 14.903,
              "z": 262.428
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
        "id": "ncc_s_v3_0",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 85.954,
            "maxX": 103.436,
            "minZ": 165.593,
            "maxZ": 193.289,
            "obb": {
              "cx": 94.695,
              "cz": 179.441,
              "hx": 13,
              "hz": 7,
              "c": 0.1391731009600657,
              "s": 0.9902680687415703
            },
            "cx": 94.695,
            "cz": 179.441,
            "yaw": 82,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_v3_0_102.596_175.301",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -82,
            "position": {
              "x": 102.596,
              "y": 14.903,
              "z": 175.301
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_v3_0_85.959_177.639",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 98,
            "position": {
              "x": 85.959,
              "y": 14.903,
              "z": 177.639
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
        "id": "ncc_s_v3_1",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 91.521,
            "maxX": 109.003,
            "minZ": 205.204,
            "maxZ": 232.9,
            "obb": {
              "cx": 100.262,
              "cz": 219.052,
              "hx": 13,
              "hz": 7,
              "c": 0.1391731009600657,
              "s": 0.9902680687415703
            },
            "cx": 100.262,
            "cz": 219.052,
            "yaw": 82,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_v3_1_108.163_214.912",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -82,
            "position": {
              "x": 108.163,
              "y": 14.903,
              "z": 214.912
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_v3_1_91.526_217.25",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 98,
            "position": {
              "x": 91.526,
              "y": 14.903,
              "z": 217.25
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
        "id": "ncc_s_v3_2",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 97.088,
            "maxX": 114.292,
            "minZ": 244.815,
            "maxZ": 270.529,
            "obb": {
              "cx": 105.69,
              "cz": 257.672,
              "hx": 12,
              "hz": 7,
              "c": 0.1391731009600657,
              "s": 0.9902680687415703
            },
            "cx": 105.69,
            "cz": 257.672,
            "yaw": 82,
            "length": 24,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_v3_2_113.73_254.522",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -82,
            "position": {
              "x": 113.73,
              "y": 14.903,
              "z": 254.522
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_v3_2_97.093_256.861",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 98,
            "position": {
              "x": 97.093,
              "y": 14.903,
              "z": 256.861
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
        "id": "ncc_s_v4_0",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 125.565,
            "maxX": 143.047,
            "minZ": 160.026,
            "maxZ": 187.722,
            "obb": {
              "cx": 134.306,
              "cz": 173.874,
              "hx": 13,
              "hz": 7,
              "c": 0.1391731009600657,
              "s": 0.9902680687415703
            },
            "cx": 134.306,
            "cz": 173.874,
            "yaw": 82,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_v4_0_142.207_169.734",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -82,
            "position": {
              "x": 142.207,
              "y": 14.903,
              "z": 169.734
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_v4_0_125.57_172.072",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 98,
            "position": {
              "x": 125.57,
              "y": 14.903,
              "z": 172.072
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
        "id": "ncc_s_v4_1",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 131.132,
            "maxX": 148.614,
            "minZ": 199.637,
            "maxZ": 227.333,
            "obb": {
              "cx": 139.873,
              "cz": 213.485,
              "hx": 13,
              "hz": 7,
              "c": 0.1391731009600657,
              "s": 0.9902680687415703
            },
            "cx": 139.873,
            "cz": 213.485,
            "yaw": 82,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_v4_1_147.774_209.345",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -82,
            "position": {
              "x": 147.774,
              "y": 14.903,
              "z": 209.345
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_v4_1_131.137_211.683",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 98,
            "position": {
              "x": 131.137,
              "y": 14.903,
              "z": 211.683
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
        "id": "ncc_s_v4_2",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 136.699,
            "maxX": 153.903,
            "minZ": 239.248,
            "maxZ": 264.962,
            "obb": {
              "cx": 145.301,
              "cz": 252.105,
              "hx": 12,
              "hz": 7,
              "c": 0.1391731009600657,
              "s": 0.9902680687415703
            },
            "cx": 145.301,
            "cz": 252.105,
            "yaw": 82,
            "length": 24,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_v4_2_153.341_248.955",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -82,
            "position": {
              "x": 153.341,
              "y": 14.903,
              "z": 248.955
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_v4_2_136.704_251.294",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 98,
            "position": {
              "x": 136.704,
              "y": 14.903,
              "z": 251.294
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
        "id": "ncc_s_v5_0",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 165.176,
            "maxX": 182.658,
            "minZ": 154.459,
            "maxZ": 182.155,
            "obb": {
              "cx": 173.917,
              "cz": 168.307,
              "hx": 13,
              "hz": 7,
              "c": 0.1391731009600657,
              "s": 0.9902680687415703
            },
            "cx": 173.917,
            "cz": 168.307,
            "yaw": 82,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_v5_0_181.818_164.167",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -82,
            "position": {
              "x": 181.818,
              "y": 14.903,
              "z": 164.167
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_v5_0_165.181_166.505",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 98,
            "position": {
              "x": 165.181,
              "y": 14.903,
              "z": 166.505
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
        "id": "ncc_s_v5_1",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 170.743,
            "maxX": 188.225,
            "minZ": 194.07,
            "maxZ": 221.766,
            "obb": {
              "cx": 179.484,
              "cz": 207.918,
              "hx": 13,
              "hz": 7,
              "c": 0.1391731009600657,
              "s": 0.9902680687415703
            },
            "cx": 179.484,
            "cz": 207.918,
            "yaw": 82,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_v5_1_187.385_203.778",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -82,
            "position": {
              "x": 187.385,
              "y": 14.903,
              "z": 203.778
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_v5_1_170.748_206.116",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 98,
            "position": {
              "x": 170.748,
              "y": 14.903,
              "z": 206.116
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
        "id": "ncc_s_v5_2",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 176.309,
            "maxX": 193.513,
            "minZ": 233.681,
            "maxZ": 259.395,
            "obb": {
              "cx": 184.911,
              "cz": 246.538,
              "hx": 12,
              "hz": 7,
              "c": 0.1391731009600657,
              "s": 0.9902680687415703
            },
            "cx": 184.911,
            "cz": 246.538,
            "yaw": 82,
            "length": 24,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_v5_2_192.951_243.388",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -82,
            "position": {
              "x": 192.951,
              "y": 14.903,
              "z": 243.388
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_v5_2_176.314_245.727",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 98,
            "position": {
              "x": 176.314,
              "y": 14.903,
              "z": 245.727
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
        "id": "ncc_s_v6_0",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 204.787,
            "maxX": 222.269,
            "minZ": 148.892,
            "maxZ": 176.588,
            "obb": {
              "cx": 213.528,
              "cz": 162.74,
              "hx": 13,
              "hz": 7,
              "c": 0.1391731009600657,
              "s": 0.9902680687415703
            },
            "cx": 213.528,
            "cz": 162.74,
            "yaw": 82,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_v6_0_221.429_158.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -82,
            "position": {
              "x": 221.429,
              "y": 14.903,
              "z": 158.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_v6_0_204.792_160.938",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 98,
            "position": {
              "x": 204.792,
              "y": 14.903,
              "z": 160.938
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
        "id": "ncc_s_v6_1",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 210.353,
            "maxX": 227.835,
            "minZ": 188.503,
            "maxZ": 216.199,
            "obb": {
              "cx": 219.094,
              "cz": 202.351,
              "hx": 13,
              "hz": 7,
              "c": 0.1391731009600657,
              "s": 0.9902680687415703
            },
            "cx": 219.094,
            "cz": 202.351,
            "yaw": 82,
            "length": 26,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_v6_1_226.995_198.211",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -82,
            "position": {
              "x": 226.995,
              "y": 14.903,
              "z": 198.211
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_v6_1_210.358_200.549",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 98,
            "position": {
              "x": 210.358,
              "y": 14.903,
              "z": 200.549
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
        "id": "ncc_s_v6_2",
        "type": "ground",
        "width": 14,
        "withLamps": true,
        "decks": [
          {
            "minX": 215.92,
            "maxX": 233.124,
            "minZ": 228.114,
            "maxZ": 253.828,
            "obb": {
              "cx": 224.522,
              "cz": 240.971,
              "hx": 12,
              "hz": 7,
              "c": 0.1391731009600657,
              "s": 0.9902680687415703
            },
            "cx": 224.522,
            "cz": 240.971,
            "yaw": 82,
            "length": 24,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_ncc_s_v6_2_232.562_237.821",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -82,
            "position": {
              "x": 232.562,
              "y": 14.903,
              "z": 237.821
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_ncc_s_v6_2_215.925_240.16",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 98,
            "position": {
              "x": 215.925,
              "y": 14.903,
              "z": 240.16
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
        "id": "ncc_x0_0",
        "type": "ground",
        "width": 14,
        "withLamps": false,
        "decks": [
          {
            "minX": -34.826,
            "maxX": -19.014,
            "minZ": 168.43,
            "maxZ": 184.242,
            "obb": {
              "cx": -26.92,
              "cz": 176.336,
              "hx": 7,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": -26.92,
            "cz": 176.336,
            "yaw": -8,
            "length": 14,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "ncc_x1_0",
        "type": "ground",
        "width": 14,
        "withLamps": false,
        "decks": [
          {
            "minX": 4.784,
            "maxX": 20.596,
            "minZ": 162.863,
            "maxZ": 178.675,
            "obb": {
              "cx": 12.69,
              "cz": 170.769,
              "hx": 7,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 12.69,
            "cz": 170.769,
            "yaw": -8,
            "length": 14,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "ncc_x2_0",
        "type": "ground",
        "width": 14,
        "withLamps": false,
        "decks": [
          {
            "minX": 44.395,
            "maxX": 60.207,
            "minZ": 157.296,
            "maxZ": 173.108,
            "obb": {
              "cx": 52.301,
              "cz": 165.202,
              "hx": 7,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 52.301,
            "cz": 165.202,
            "yaw": -8,
            "length": 14,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "ncc_x3_0",
        "type": "ground",
        "width": 14,
        "withLamps": false,
        "decks": [
          {
            "minX": 84.006,
            "maxX": 99.818,
            "minZ": 151.73,
            "maxZ": 167.542,
            "obb": {
              "cx": 91.912,
              "cz": 159.636,
              "hx": 7,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 91.912,
            "cz": 159.636,
            "yaw": -8,
            "length": 14,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "ncc_x4_0",
        "type": "ground",
        "width": 14,
        "withLamps": false,
        "decks": [
          {
            "minX": 123.617,
            "maxX": 139.429,
            "minZ": 146.163,
            "maxZ": 161.975,
            "obb": {
              "cx": 131.523,
              "cz": 154.069,
              "hx": 7,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 131.523,
            "cz": 154.069,
            "yaw": -8,
            "length": 14,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "ncc_x5_0",
        "type": "ground",
        "width": 14,
        "withLamps": false,
        "decks": [
          {
            "minX": 163.227,
            "maxX": 179.039,
            "minZ": 140.596,
            "maxZ": 156.408,
            "obb": {
              "cx": 171.133,
              "cz": 148.502,
              "hx": 7,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 171.133,
            "cz": 148.502,
            "yaw": -8,
            "length": 14,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "ncc_x6_0",
        "type": "ground",
        "width": 14,
        "withLamps": false,
        "decks": [
          {
            "minX": 202.838,
            "maxX": 218.65,
            "minZ": 135.029,
            "maxZ": 150.841,
            "obb": {
              "cx": 210.744,
              "cz": 142.935,
              "hx": 7,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 210.744,
            "cz": 142.935,
            "yaw": -8,
            "length": 14,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "ncc_x0_1",
        "type": "ground",
        "width": 14,
        "withLamps": false,
        "decks": [
          {
            "minX": -29.259,
            "maxX": -13.447,
            "minZ": 208.041,
            "maxZ": 223.853,
            "obb": {
              "cx": -21.353,
              "cz": 215.947,
              "hx": 7,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": -21.353,
            "cz": 215.947,
            "yaw": -8,
            "length": 14,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "ncc_x1_1",
        "type": "ground",
        "width": 14,
        "withLamps": false,
        "decks": [
          {
            "minX": 10.351,
            "maxX": 26.163,
            "minZ": 202.474,
            "maxZ": 218.286,
            "obb": {
              "cx": 18.257,
              "cz": 210.38,
              "hx": 7,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 18.257,
            "cz": 210.38,
            "yaw": -8,
            "length": 14,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "ncc_x2_1",
        "type": "ground",
        "width": 14,
        "withLamps": false,
        "decks": [
          {
            "minX": 49.962,
            "maxX": 65.774,
            "minZ": 196.907,
            "maxZ": 212.719,
            "obb": {
              "cx": 57.868,
              "cz": 204.813,
              "hx": 7,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 57.868,
            "cz": 204.813,
            "yaw": -8,
            "length": 14,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "ncc_x3_1",
        "type": "ground",
        "width": 14,
        "withLamps": false,
        "decks": [
          {
            "minX": 89.573,
            "maxX": 105.385,
            "minZ": 191.34,
            "maxZ": 207.152,
            "obb": {
              "cx": 97.479,
              "cz": 199.246,
              "hx": 7,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 97.479,
            "cz": 199.246,
            "yaw": -8,
            "length": 14,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "ncc_x4_1",
        "type": "ground",
        "width": 14,
        "withLamps": false,
        "decks": [
          {
            "minX": 129.184,
            "maxX": 144.996,
            "minZ": 185.773,
            "maxZ": 201.585,
            "obb": {
              "cx": 137.09,
              "cz": 193.679,
              "hx": 7,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 137.09,
            "cz": 193.679,
            "yaw": -8,
            "length": 14,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "ncc_x5_1",
        "type": "ground",
        "width": 14,
        "withLamps": false,
        "decks": [
          {
            "minX": 168.794,
            "maxX": 184.606,
            "minZ": 180.206,
            "maxZ": 196.018,
            "obb": {
              "cx": 176.7,
              "cz": 188.112,
              "hx": 7,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 176.7,
            "cz": 188.112,
            "yaw": -8,
            "length": 14,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "ncc_x6_1",
        "type": "ground",
        "width": 14,
        "withLamps": false,
        "decks": [
          {
            "minX": 208.405,
            "maxX": 224.217,
            "minZ": 174.639,
            "maxZ": 190.451,
            "obb": {
              "cx": 216.311,
              "cz": 182.545,
              "hx": 7,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 216.311,
            "cz": 182.545,
            "yaw": -8,
            "length": 14,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "ncc_x0_2",
        "type": "ground",
        "width": 14,
        "withLamps": false,
        "decks": [
          {
            "minX": -23.692,
            "maxX": -7.88,
            "minZ": 247.652,
            "maxZ": 263.464,
            "obb": {
              "cx": -15.786,
              "cz": 255.558,
              "hx": 7,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": -15.786,
            "cz": 255.558,
            "yaw": -8,
            "length": 14,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "ncc_x1_2",
        "type": "ground",
        "width": 14,
        "withLamps": false,
        "decks": [
          {
            "minX": 15.918,
            "maxX": 31.73,
            "minZ": 242.085,
            "maxZ": 257.897,
            "obb": {
              "cx": 23.824,
              "cz": 249.991,
              "hx": 7,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 23.824,
            "cz": 249.991,
            "yaw": -8,
            "length": 14,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "ncc_x2_2",
        "type": "ground",
        "width": 14,
        "withLamps": false,
        "decks": [
          {
            "minX": 55.529,
            "maxX": 71.341,
            "minZ": 236.518,
            "maxZ": 252.33,
            "obb": {
              "cx": 63.435,
              "cz": 244.424,
              "hx": 7,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 63.435,
            "cz": 244.424,
            "yaw": -8,
            "length": 14,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "ncc_x3_2",
        "type": "ground",
        "width": 14,
        "withLamps": false,
        "decks": [
          {
            "minX": 95.14,
            "maxX": 110.952,
            "minZ": 230.951,
            "maxZ": 246.763,
            "obb": {
              "cx": 103.046,
              "cz": 238.857,
              "hx": 7,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 103.046,
            "cz": 238.857,
            "yaw": -8,
            "length": 14,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "ncc_x4_2",
        "type": "ground",
        "width": 14,
        "withLamps": false,
        "decks": [
          {
            "minX": 134.75,
            "maxX": 150.562,
            "minZ": 225.384,
            "maxZ": 241.196,
            "obb": {
              "cx": 142.656,
              "cz": 233.29,
              "hx": 7,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 142.656,
            "cz": 233.29,
            "yaw": -8,
            "length": 14,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "ncc_x5_2",
        "type": "ground",
        "width": 14,
        "withLamps": false,
        "decks": [
          {
            "minX": 174.361,
            "maxX": 190.173,
            "minZ": 219.817,
            "maxZ": 235.629,
            "obb": {
              "cx": 182.267,
              "cz": 227.723,
              "hx": 7,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 182.267,
            "cz": 227.723,
            "yaw": -8,
            "length": 14,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "ncc_x6_2",
        "type": "ground",
        "width": 14,
        "withLamps": false,
        "decks": [
          {
            "minX": 213.972,
            "maxX": 229.784,
            "minZ": 214.25,
            "maxZ": 230.062,
            "obb": {
              "cx": 221.878,
              "cz": 222.156,
              "hx": 7,
              "hz": 7,
              "c": 0.9902680687415704,
              "s": -0.13917310096006544
            },
            "cx": 221.878,
            "cz": 222.156,
            "yaw": -8,
            "length": 14,
            "width": 14,
            "axis": "x",
            "topY": 14.903,
            "bottomY": 14.303,
            "topAtMin": 14.903,
            "topAtMax": 14.903,
            "ramp": false,
            "rails": false
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
        "wade": true,
        "width": 60,
        "bedY": -4,
        "surfaceY": -1.5,
        "segments": [
          {
            "axis": "x",
            "cross": -120,
            "halfW": 30,
            "run": 0,
            "depth": 0.35,
            "lo": -330,
            "hi": 330,
            "rampRun": 13.333,
            "bed": {
              "minX": -330,
              "maxX": 330,
              "minZ": -150,
              "maxZ": -90
            }
          }
        ],
        "walls": [
          {
            "rect": {
              "minX": -330.35,
              "maxX": -263,
              "minZ": -150.35,
              "maxZ": -150
            }
          },
          {
            "rect": {
              "minX": -257,
              "maxX": -23,
              "minZ": -150.35,
              "maxZ": -150
            }
          },
          {
            "rect": {
              "minX": -17,
              "maxX": 97,
              "minZ": -150.35,
              "maxZ": -150
            }
          },
          {
            "rect": {
              "minX": 103,
              "maxX": 257,
              "minZ": -150.35,
              "maxZ": -150
            }
          },
          {
            "rect": {
              "minX": 263,
              "maxX": 330.35,
              "minZ": -150.35,
              "maxZ": -150
            }
          },
          {
            "rect": {
              "minX": -330.35,
              "maxX": 330.35,
              "minZ": -90,
              "maxZ": -89.65
            }
          }
        ],
        "descents": [
          {
            "id": "river:сход1",
            "kind": "ramp",
            "seg": 0,
            "axis": "z",
            "u0": -149.4,
            "u1": -162.733,
            "v0": -263,
            "v1": -257,
            "y0": -4,
            "y1": 0,
            "plan": {
              "minX": -263,
              "maxX": -257,
              "minZ": -162.733,
              "maxZ": -149.4
            }
          },
          {
            "id": "river:сход2",
            "kind": "ramp",
            "seg": 0,
            "axis": "z",
            "u0": -149.4,
            "u1": -162.733,
            "v0": -23,
            "v1": -17,
            "y0": -4,
            "y1": 0,
            "plan": {
              "minX": -23,
              "maxX": -17,
              "minZ": -162.733,
              "maxZ": -149.4
            }
          },
          {
            "id": "river:сход3",
            "kind": "ramp",
            "seg": 0,
            "axis": "z",
            "u0": -149.4,
            "u1": -162.733,
            "v0": 97,
            "v1": 103,
            "y0": -4,
            "y1": 0,
            "plan": {
              "minX": 97,
              "maxX": 103,
              "minZ": -162.733,
              "maxZ": -149.4
            }
          },
          {
            "id": "river:сход4",
            "kind": "ramp",
            "seg": 0,
            "axis": "z",
            "u0": -149.4,
            "u1": -162.733,
            "v0": 257,
            "v1": 263,
            "y0": -4,
            "y1": 0,
            "plan": {
              "minX": 257,
              "maxX": 263,
              "minZ": -162.733,
              "maxZ": -149.4
            }
          }
        ],
        "holes": [
          {
            "minX": -330,
            "maxX": 330,
            "minZ": -150,
            "maxZ": -90
          },
          {
            "minX": -263,
            "maxX": -257,
            "minZ": -162.733,
            "maxZ": -149.4
          },
          {
            "minX": -23,
            "maxX": -17,
            "minZ": -162.733,
            "maxZ": -149.4
          },
          {
            "minX": 97,
            "maxX": 103,
            "minZ": -162.733,
            "maxZ": -149.4
          },
          {
            "minX": 257,
            "maxX": 263,
            "minZ": -162.733,
            "maxZ": -149.4
          },
          {
            "minX": -330.35,
            "maxX": -263,
            "minZ": -150.35,
            "maxZ": -150
          },
          {
            "minX": -257,
            "maxX": -23,
            "minZ": -150.35,
            "maxZ": -150
          },
          {
            "minX": -17,
            "maxX": 97,
            "minZ": -150.35,
            "maxZ": -150
          },
          {
            "minX": 103,
            "maxX": 257,
            "minZ": -150.35,
            "maxZ": -150
          },
          {
            "minX": 263,
            "maxX": 330.35,
            "minZ": -150.35,
            "maxZ": -150
          },
          {
            "minX": -330.35,
            "maxX": 330.35,
            "minZ": -90,
            "maxZ": -89.65
          }
        ]
      }
    ],
    "props": [
      {
        "id": "bench_plaza_40",
        "model": "bench",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": 40,
          "y": 14.783,
          "z": 134
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "bench_plaza_48",
        "model": "bench",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": 48,
          "y": 14.783,
          "z": 134
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "bench_plaza_56",
        "model": "bench",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": 56,
          "y": 14.783,
          "z": 134
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_br_east_162.6_-105",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": 162.6,
          "y": 3,
          "z": -105
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_br_east_162.6_-125",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": 162.6,
          "y": 3,
          "z": -125
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_br_east_177.4_-105",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 177.4,
          "y": 3,
          "z": -105
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_br_east_177.4_-125",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 177.4,
          "y": 3,
          "z": -125
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_br_mid_52.6_-105",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": 52.6,
          "y": 3,
          "z": -105
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_br_mid_52.6_-125",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": 52.6,
          "y": 3,
          "z": -125
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_br_mid_67.4_-105",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 67.4,
          "y": 3,
          "z": -105
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_br_mid_67.4_-125",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 67.4,
          "y": 3,
          "z": -125
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_br_west_-184.6_-105",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -184.6,
          "y": 3,
          "z": -105
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_br_west_-184.6_-125",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -184.6,
          "y": 3,
          "z": -125
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_br_west_-199.4_-105",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -199.4,
          "y": 3,
          "z": -105
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_br_west_-199.4_-125",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -199.4,
          "y": 3,
          "z": -125
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h0_0_-11.255_165.652",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 8,
        "position": {
          "x": -11.255,
          "y": 14.903,
          "z": 165.652
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h0_0_-8.917_182.289",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -172,
        "position": {
          "x": -8.917,
          "y": 14.903,
          "z": 182.289
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h0_1_28.356_160.085",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 8,
        "position": {
          "x": 28.356,
          "y": 14.903,
          "z": 160.085
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h0_1_30.694_176.722",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -172,
        "position": {
          "x": 30.694,
          "y": 14.903,
          "z": 176.722
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h0_2_67.967_154.518",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 8,
        "position": {
          "x": 67.967,
          "y": 14.903,
          "z": 154.518
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h0_2_70.305_171.155",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -172,
        "position": {
          "x": 70.305,
          "y": 14.903,
          "z": 171.155
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h0_3_107.577_148.951",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 8,
        "position": {
          "x": 107.577,
          "y": 14.903,
          "z": 148.951
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h0_3_109.915_165.588",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -172,
        "position": {
          "x": 109.915,
          "y": 14.903,
          "z": 165.588
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h0_4_147.188_143.384",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 8,
        "position": {
          "x": 147.188,
          "y": 14.903,
          "z": 143.384
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h0_4_149.526_160.021",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -172,
        "position": {
          "x": 149.526,
          "y": 14.903,
          "z": 160.021
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h0_5_186.799_137.817",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 8,
        "position": {
          "x": 186.799,
          "y": 14.903,
          "z": 137.817
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h0_5_189.137_154.454",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -172,
        "position": {
          "x": 189.137,
          "y": 14.903,
          "z": 154.454
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h1_0_-3.35_221.9",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -172,
        "position": {
          "x": -3.35,
          "y": 14.903,
          "z": 221.9
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h1_0_-5.688_205.263",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 8,
        "position": {
          "x": -5.688,
          "y": 14.903,
          "z": 205.263
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h1_1_33.923_199.696",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 8,
        "position": {
          "x": 33.923,
          "y": 14.903,
          "z": 199.696
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h1_1_36.261_216.333",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -172,
        "position": {
          "x": 36.261,
          "y": 14.903,
          "z": 216.333
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h1_2_73.533_194.129",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 8,
        "position": {
          "x": 73.533,
          "y": 14.903,
          "z": 194.129
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h1_2_75.871_210.766",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -172,
        "position": {
          "x": 75.871,
          "y": 14.903,
          "z": 210.766
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h1_3_113.144_188.562",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 8,
        "position": {
          "x": 113.144,
          "y": 14.903,
          "z": 188.562
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h1_3_115.482_205.199",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -172,
        "position": {
          "x": 115.482,
          "y": 14.903,
          "z": 205.199
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h1_4_152.755_182.995",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 8,
        "position": {
          "x": 152.755,
          "y": 14.903,
          "z": 182.995
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h1_4_155.093_199.632",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -172,
        "position": {
          "x": 155.093,
          "y": 14.903,
          "z": 199.632
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h1_5_192.366_177.428",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 8,
        "position": {
          "x": 192.366,
          "y": 14.903,
          "z": 177.428
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h1_5_194.704_194.065",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -172,
        "position": {
          "x": 194.704,
          "y": 14.903,
          "z": 194.065
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h2_0_-0.121_244.873",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 8,
        "position": {
          "x": -0.121,
          "y": 14.903,
          "z": 244.873
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h2_0_2.217_261.51",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -172,
        "position": {
          "x": 2.217,
          "y": 14.903,
          "z": 261.51
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h2_1_39.49_239.306",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 8,
        "position": {
          "x": 39.49,
          "y": 14.903,
          "z": 239.306
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h2_1_41.828_255.943",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -172,
        "position": {
          "x": 41.828,
          "y": 14.903,
          "z": 255.943
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h2_2_79.1_233.739",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 8,
        "position": {
          "x": 79.1,
          "y": 14.903,
          "z": 233.739
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h2_2_81.438_250.376",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -172,
        "position": {
          "x": 81.438,
          "y": 14.903,
          "z": 250.376
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h2_3_118.711_228.172",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 8,
        "position": {
          "x": 118.711,
          "y": 14.903,
          "z": 228.172
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h2_3_121.049_244.809",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -172,
        "position": {
          "x": 121.049,
          "y": 14.903,
          "z": 244.809
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h2_4_158.322_222.606",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 8,
        "position": {
          "x": 158.322,
          "y": 14.903,
          "z": 222.606
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h2_4_160.66_239.243",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -172,
        "position": {
          "x": 160.66,
          "y": 14.903,
          "z": 239.243
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h2_5_197.933_217.039",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 8,
        "position": {
          "x": 197.933,
          "y": 14.903,
          "z": 217.039
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_h2_5_200.271_233.676",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -172,
        "position": {
          "x": 200.271,
          "y": 14.903,
          "z": 233.676
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v0_0_-16.236_192.002",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -82,
        "position": {
          "x": -16.236,
          "y": 14.903,
          "z": 192.002
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v0_0_-32.873_194.34",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 98,
        "position": {
          "x": -32.873,
          "y": 14.903,
          "z": 194.34
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v0_1_-10.669_231.612",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -82,
        "position": {
          "x": -10.669,
          "y": 14.903,
          "z": 231.612
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v0_1_-27.306_233.95",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 98,
        "position": {
          "x": -27.306,
          "y": 14.903,
          "z": 233.95
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v0_2_-21.739_273.562",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 98,
        "position": {
          "x": -21.739,
          "y": 14.903,
          "z": 273.562
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v0_2_-5.102_271.223",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -82,
        "position": {
          "x": -5.102,
          "y": 14.903,
          "z": 271.223
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v1_0_23.375_186.435",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -82,
        "position": {
          "x": 23.375,
          "y": 14.903,
          "z": 186.435
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v1_0_6.738_188.773",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 98,
        "position": {
          "x": 6.738,
          "y": 14.903,
          "z": 188.773
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v1_1_12.305_228.383",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 98,
        "position": {
          "x": 12.305,
          "y": 14.903,
          "z": 228.383
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v1_1_28.942_226.045",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -82,
        "position": {
          "x": 28.942,
          "y": 14.903,
          "z": 226.045
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v1_2_17.872_267.995",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 98,
        "position": {
          "x": 17.872,
          "y": 14.903,
          "z": 267.995
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v1_2_34.509_265.656",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -82,
        "position": {
          "x": 34.509,
          "y": 14.903,
          "z": 265.656
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v2_0_46.349_183.206",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 98,
        "position": {
          "x": 46.349,
          "y": 14.903,
          "z": 183.206
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v2_0_62.986_180.868",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -82,
        "position": {
          "x": 62.986,
          "y": 14.903,
          "z": 180.868
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v2_1_51.916_222.817",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 98,
        "position": {
          "x": 51.916,
          "y": 14.903,
          "z": 222.817
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v2_1_68.553_220.479",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -82,
        "position": {
          "x": 68.553,
          "y": 14.903,
          "z": 220.479
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v2_2_57.482_262.428",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 98,
        "position": {
          "x": 57.482,
          "y": 14.903,
          "z": 262.428
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v2_2_74.119_260.089",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -82,
        "position": {
          "x": 74.119,
          "y": 14.903,
          "z": 260.089
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v3_0_102.596_175.301",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -82,
        "position": {
          "x": 102.596,
          "y": 14.903,
          "z": 175.301
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v3_0_85.959_177.639",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 98,
        "position": {
          "x": 85.959,
          "y": 14.903,
          "z": 177.639
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v3_1_108.163_214.912",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -82,
        "position": {
          "x": 108.163,
          "y": 14.903,
          "z": 214.912
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v3_1_91.526_217.25",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 98,
        "position": {
          "x": 91.526,
          "y": 14.903,
          "z": 217.25
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v3_2_113.73_254.522",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -82,
        "position": {
          "x": 113.73,
          "y": 14.903,
          "z": 254.522
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v3_2_97.093_256.861",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 98,
        "position": {
          "x": 97.093,
          "y": 14.903,
          "z": 256.861
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v4_0_125.57_172.072",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 98,
        "position": {
          "x": 125.57,
          "y": 14.903,
          "z": 172.072
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v4_0_142.207_169.734",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -82,
        "position": {
          "x": 142.207,
          "y": 14.903,
          "z": 169.734
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v4_1_131.137_211.683",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 98,
        "position": {
          "x": 131.137,
          "y": 14.903,
          "z": 211.683
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v4_1_147.774_209.345",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -82,
        "position": {
          "x": 147.774,
          "y": 14.903,
          "z": 209.345
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v4_2_136.704_251.294",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 98,
        "position": {
          "x": 136.704,
          "y": 14.903,
          "z": 251.294
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v4_2_153.341_248.955",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -82,
        "position": {
          "x": 153.341,
          "y": 14.903,
          "z": 248.955
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v5_0_165.181_166.505",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 98,
        "position": {
          "x": 165.181,
          "y": 14.903,
          "z": 166.505
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v5_0_181.818_164.167",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -82,
        "position": {
          "x": 181.818,
          "y": 14.903,
          "z": 164.167
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v5_1_170.748_206.116",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 98,
        "position": {
          "x": 170.748,
          "y": 14.903,
          "z": 206.116
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v5_1_187.385_203.778",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -82,
        "position": {
          "x": 187.385,
          "y": 14.903,
          "z": 203.778
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v5_2_176.314_245.727",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 98,
        "position": {
          "x": 176.314,
          "y": 14.903,
          "z": 245.727
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v5_2_192.951_243.388",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -82,
        "position": {
          "x": 192.951,
          "y": 14.903,
          "z": 243.388
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v6_0_204.792_160.938",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 98,
        "position": {
          "x": 204.792,
          "y": 14.903,
          "z": 160.938
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v6_0_221.429_158.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -82,
        "position": {
          "x": 221.429,
          "y": 14.903,
          "z": 158.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v6_1_210.358_200.549",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 98,
        "position": {
          "x": 210.358,
          "y": 14.903,
          "z": 200.549
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v6_1_226.995_198.211",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -82,
        "position": {
          "x": 226.995,
          "y": 14.903,
          "z": 198.211
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v6_2_215.925_240.16",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 98,
        "position": {
          "x": 215.925,
          "y": 14.903,
          "z": 240.16
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_ncc_s_v6_2_232.562_237.821",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -82,
        "position": {
          "x": 232.562,
          "y": 14.903,
          "z": 237.821
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h0_0_-231.526_128.198",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -22,
        "position": {
          "x": -231.526,
          "y": 14.891,
          "z": 128.198
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h0_0_-236.32_140.066",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 158,
        "position": {
          "x": -236.32,
          "y": 14.891,
          "z": 140.066
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h0_1_-203.71_139.436",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -22,
        "position": {
          "x": -203.71,
          "y": 14.891,
          "z": 139.436
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h0_1_-208.504_151.304",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 158,
        "position": {
          "x": -208.504,
          "y": 14.891,
          "z": 151.304
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h0_2_-175.894_150.674",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -22,
        "position": {
          "x": -175.894,
          "y": 14.891,
          "z": 150.674
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h0_2_-180.688_162.542",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 158,
        "position": {
          "x": -180.688,
          "y": 14.891,
          "z": 162.542
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h0_3_-148.079_161.913",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -22,
        "position": {
          "x": -148.079,
          "y": 14.891,
          "z": 161.913
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h0_3_-152.873_173.781",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 158,
        "position": {
          "x": -152.873,
          "y": 14.891,
          "z": 173.781
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h0_4_-120.263_173.151",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -22,
        "position": {
          "x": -120.263,
          "y": 14.891,
          "z": 173.151
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h0_4_-125.058_185.019",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 158,
        "position": {
          "x": -125.058,
          "y": 14.891,
          "z": 185.019
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h1_0_-242.764_156.014",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -22,
        "position": {
          "x": -242.764,
          "y": 14.891,
          "z": 156.014
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h1_0_-247.558_167.882",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 158,
        "position": {
          "x": -247.558,
          "y": 14.891,
          "z": 167.882
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h1_1_-214.948_167.252",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -22,
        "position": {
          "x": -214.948,
          "y": 14.891,
          "z": 167.252
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h1_1_-219.742_179.12",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 158,
        "position": {
          "x": -219.742,
          "y": 14.891,
          "z": 179.12
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h1_2_-187.133_178.49",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -22,
        "position": {
          "x": -187.133,
          "y": 14.891,
          "z": 178.49
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h1_2_-191.927_190.358",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 158,
        "position": {
          "x": -191.927,
          "y": 14.891,
          "z": 190.358
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h1_3_-159.317_189.728",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -22,
        "position": {
          "x": -159.317,
          "y": 14.891,
          "z": 189.728
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h1_3_-164.111_201.596",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 158,
        "position": {
          "x": -164.111,
          "y": 14.891,
          "z": 201.596
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h1_4_-131.501_200.967",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -22,
        "position": {
          "x": -131.501,
          "y": 14.891,
          "z": 200.967
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h1_4_-136.296_212.835",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 158,
        "position": {
          "x": -136.296,
          "y": 14.891,
          "z": 212.835
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h2_0_-254.002_183.829",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -22,
        "position": {
          "x": -254.002,
          "y": 14.891,
          "z": 183.829
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h2_0_-258.796_195.697",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 158,
        "position": {
          "x": -258.796,
          "y": 14.891,
          "z": 195.697
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h2_1_-226.186_195.067",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -22,
        "position": {
          "x": -226.186,
          "y": 14.891,
          "z": 195.067
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h2_1_-230.98_206.935",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 158,
        "position": {
          "x": -230.98,
          "y": 14.891,
          "z": 206.935
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h2_2_-198.371_206.306",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -22,
        "position": {
          "x": -198.371,
          "y": 14.891,
          "z": 206.306
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h2_2_-203.165_218.174",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 158,
        "position": {
          "x": -203.165,
          "y": 14.891,
          "z": 218.174
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h2_3_-170.555_217.544",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -22,
        "position": {
          "x": -170.555,
          "y": 14.891,
          "z": 217.544
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h2_3_-175.349_229.412",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 158,
        "position": {
          "x": -175.349,
          "y": 14.891,
          "z": 229.412
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h2_4_-142.739_228.782",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -22,
        "position": {
          "x": -142.739,
          "y": 14.891,
          "z": 228.782
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h2_4_-147.534_240.65",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 158,
        "position": {
          "x": -147.534,
          "y": 14.891,
          "z": 240.65
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h3_0_-265.24_211.645",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -22,
        "position": {
          "x": -265.24,
          "y": 14.891,
          "z": 211.645
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h3_0_-270.034_223.513",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 158,
        "position": {
          "x": -270.034,
          "y": 14.891,
          "z": 223.513
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h3_1_-237.425_222.883",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -22,
        "position": {
          "x": -237.425,
          "y": 14.891,
          "z": 222.883
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h3_1_-242.219_234.751",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 158,
        "position": {
          "x": -242.219,
          "y": 14.891,
          "z": 234.751
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h3_2_-209.609_234.121",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -22,
        "position": {
          "x": -209.609,
          "y": 14.891,
          "z": 234.121
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h3_2_-214.403_245.989",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 158,
        "position": {
          "x": -214.403,
          "y": 14.891,
          "z": 245.989
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h3_3_-181.794_245.359",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -22,
        "position": {
          "x": -181.794,
          "y": 14.891,
          "z": 245.359
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h3_3_-186.588_257.227",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 158,
        "position": {
          "x": -186.588,
          "y": 14.891,
          "z": 257.227
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h3_4_-153.977_256.598",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -22,
        "position": {
          "x": -153.977,
          "y": 14.891,
          "z": 256.598
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_h3_4_-158.772_268.466",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 158,
        "position": {
          "x": -158.772,
          "y": 14.891,
          "z": 268.466
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v0_0_-247.515_144.818",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -112,
        "position": {
          "x": -247.515,
          "y": 14.891,
          "z": 144.818
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v0_0_-259.383_140.024",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 68,
        "position": {
          "x": -259.383,
          "y": 14.891,
          "z": 140.024
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v0_1_-258.754_172.633",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -112,
        "position": {
          "x": -258.754,
          "y": 14.891,
          "z": 172.633
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v0_1_-270.622_167.839",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 68,
        "position": {
          "x": -270.622,
          "y": 14.891,
          "z": 167.839
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v0_2_-269.992_200.449",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -112,
        "position": {
          "x": -269.992,
          "y": 14.891,
          "z": 200.449
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v0_2_-281.86_195.655",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 68,
        "position": {
          "x": -281.86,
          "y": 14.891,
          "z": 195.655
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v0_3_-281.23_228.265",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -112,
        "position": {
          "x": -281.23,
          "y": 14.891,
          "z": 228.265
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v0_3_-293.098_223.47",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 68,
        "position": {
          "x": -293.098,
          "y": 14.891,
          "z": 223.47
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v1_0_-219.7_156.056",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -112,
        "position": {
          "x": -219.7,
          "y": 14.891,
          "z": 156.056
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v1_0_-231.568_151.262",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 68,
        "position": {
          "x": -231.568,
          "y": 14.891,
          "z": 151.262
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v1_1_-230.938_183.871",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -112,
        "position": {
          "x": -230.938,
          "y": 14.891,
          "z": 183.871
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v1_1_-242.806_179.077",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 68,
        "position": {
          "x": -242.806,
          "y": 14.891,
          "z": 179.077
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v1_2_-242.176_211.687",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -112,
        "position": {
          "x": -242.176,
          "y": 14.891,
          "z": 211.687
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v1_2_-254.044_206.893",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 68,
        "position": {
          "x": -254.044,
          "y": 14.891,
          "z": 206.893
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v1_3_-253.415_239.503",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -112,
        "position": {
          "x": -253.415,
          "y": 14.891,
          "z": 239.503
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v1_3_-265.283_234.708",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 68,
        "position": {
          "x": -265.283,
          "y": 14.891,
          "z": 234.708
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v2_0_-191.884_167.294",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -112,
        "position": {
          "x": -191.884,
          "y": 14.891,
          "z": 167.294
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v2_0_-203.752_162.5",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 68,
        "position": {
          "x": -203.752,
          "y": 14.891,
          "z": 162.5
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v2_1_-203.123_195.11",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -112,
        "position": {
          "x": -203.123,
          "y": 14.891,
          "z": 195.11
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v2_1_-214.991_190.316",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 68,
        "position": {
          "x": -214.991,
          "y": 14.891,
          "z": 190.316
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v2_2_-214.361_222.925",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -112,
        "position": {
          "x": -214.361,
          "y": 14.891,
          "z": 222.925
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v2_2_-226.229_218.131",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 68,
        "position": {
          "x": -226.229,
          "y": 14.891,
          "z": 218.131
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v2_3_-225.599_250.741",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -112,
        "position": {
          "x": -225.599,
          "y": 14.891,
          "z": 250.741
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v2_3_-237.467_245.946",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 68,
        "position": {
          "x": -237.467,
          "y": 14.891,
          "z": 245.946
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v3_0_-164.069_178.532",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -112,
        "position": {
          "x": -164.069,
          "y": 14.891,
          "z": 178.532
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v3_0_-175.937_173.738",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 68,
        "position": {
          "x": -175.937,
          "y": 14.891,
          "z": 173.738
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v3_1_-175.307_206.348",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -112,
        "position": {
          "x": -175.307,
          "y": 14.891,
          "z": 206.348
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v3_1_-187.175_201.554",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 68,
        "position": {
          "x": -187.175,
          "y": 14.891,
          "z": 201.554
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v3_2_-186.545_234.163",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -112,
        "position": {
          "x": -186.545,
          "y": 14.891,
          "z": 234.163
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v3_2_-198.413_229.369",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 68,
        "position": {
          "x": -198.413,
          "y": 14.891,
          "z": 229.369
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v3_3_-197.784_261.98",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -112,
        "position": {
          "x": -197.784,
          "y": 14.891,
          "z": 261.98
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v3_3_-209.652_257.185",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 68,
        "position": {
          "x": -209.652,
          "y": 14.891,
          "z": 257.185
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v4_0_-136.253_189.771",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -112,
        "position": {
          "x": -136.253,
          "y": 14.891,
          "z": 189.771
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v4_0_-148.121_184.977",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 68,
        "position": {
          "x": -148.121,
          "y": 14.891,
          "z": 184.977
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v4_1_-147.492_217.586",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -112,
        "position": {
          "x": -147.492,
          "y": 14.891,
          "z": 217.586
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v4_1_-159.36_212.792",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 68,
        "position": {
          "x": -159.36,
          "y": 14.891,
          "z": 212.792
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v4_2_-158.73_245.402",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -112,
        "position": {
          "x": -158.73,
          "y": 14.891,
          "z": 245.402
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v4_2_-170.598_240.608",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 68,
        "position": {
          "x": -170.598,
          "y": 14.891,
          "z": 240.608
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v4_3_-169.968_273.218",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -112,
        "position": {
          "x": -169.968,
          "y": 14.891,
          "z": 273.218
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_nkab_s_v4_3_-181.836_268.423",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 68,
        "position": {
          "x": -181.836,
          "y": 14.891,
          "z": 268.423
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_low_link_-20_-244.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -20,
          "y": 0.12,
          "z": -244.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_low_link_-20_-255.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -20,
          "y": 0.12,
          "z": -255.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_low_link_-40_-244.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -40,
          "y": 0.12,
          "z": -244.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_low_link_-40_-255.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -40,
          "y": 0.12,
          "z": -255.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_low_link_-60_-244.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -60,
          "y": 0.12,
          "z": -244.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_low_link_-60_-255.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -60,
          "y": 0.12,
          "z": -255.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_low_link_-80_-244.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -80,
          "y": 0.12,
          "z": -244.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_low_link_-80_-255.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -80,
          "y": 0.12,
          "z": -255.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_low_link_0_-244.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 0,
          "y": 0.12,
          "z": -244.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_low_link_0_-255.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 0,
          "y": 0.12,
          "z": -255.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_low_link_20_-244.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 20,
          "y": 0.12,
          "z": -244.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_low_link_20_-255.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 20,
          "y": 0.12,
          "z": -255.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_low_link_40_-244.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 40,
          "y": 0.12,
          "z": -244.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_low_link_40_-255.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 40,
          "y": 0.12,
          "z": -255.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_plate_ave_-23_111.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -23,
          "y": 14.898,
          "z": 111.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_plate_ave_-23_124.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -23,
          "y": 14.898,
          "z": 124.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_plate_ave_-3_111.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -3,
          "y": 14.898,
          "z": 111.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_plate_ave_-3_124.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -3,
          "y": 14.898,
          "z": 124.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_plate_ave_-43_111.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -43,
          "y": 14.898,
          "z": 111.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_plate_ave_-43_124.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -43,
          "y": 14.898,
          "z": 124.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_plate_ave_17_111.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 17,
          "y": 14.898,
          "z": 111.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_plate_ave_17_124.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 17,
          "y": 14.898,
          "z": 124.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_plate_ave_250_111.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 250,
          "y": 13.415,
          "z": 111.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_plate_ave_250_124.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 250,
          "y": 13.415,
          "z": 124.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_plate_ave_270_111.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 270,
          "y": 13.415,
          "z": 111.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_plate_ave_270_124.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 270,
          "y": 13.415,
          "z": 124.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_plate_ave_37_111.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 37,
          "y": 14.898,
          "z": 111.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_plate_ave_37_124.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 37,
          "y": 14.898,
          "z": 124.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_plate_ave_57_111.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 57,
          "y": 14.898,
          "z": 111.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_plate_ave_57_124.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 57,
          "y": 14.898,
          "z": 124.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_plate_ave_77_111.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 77,
          "y": 14.898,
          "z": 111.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_plate_ave_77_124.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 77,
          "y": 14.898,
          "z": 124.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_plate_ave_97_111.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 97,
          "y": 14.898,
          "z": 111.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_plate_ave_97_124.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 97,
          "y": 14.898,
          "z": 124.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_port_ave_-14.6_-180",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -14.6,
          "y": 0.12,
          "z": -180
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_port_ave_-14.6_-200",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -14.6,
          "y": 0.12,
          "z": -200
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_port_ave_-14.6_-220",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -14.6,
          "y": 0.12,
          "z": -220
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_port_ave_-14.6_-240",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -14.6,
          "y": 0.12,
          "z": -240
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_port_ave_-14.6_-260",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -14.6,
          "y": 0.12,
          "z": -260
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_port_ave_-14.6_-280",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -14.6,
          "y": 0.12,
          "z": -280
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_port_ave_-25.4_-180",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -25.4,
          "y": 0.12,
          "z": -180
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_port_ave_-25.4_-200",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -25.4,
          "y": 0.12,
          "z": -200
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_port_ave_-25.4_-220",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -25.4,
          "y": 0.12,
          "z": -220
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_port_ave_-25.4_-240",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -25.4,
          "y": 0.12,
          "z": -240
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_port_ave_-25.4_-260",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -25.4,
          "y": 0.12,
          "z": -260
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_port_ave_-25.4_-280",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -25.4,
          "y": 0.12,
          "z": -280
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-10_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -10,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-10_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -10,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-110_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -110,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-110_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -110,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-130_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -130,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-130_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -130,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-150_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -150,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-150_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -150,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-170_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -170,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-170_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -170,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-190_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -190,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-190_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -190,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-210_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -210,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-210_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -210,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-230_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -230,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-230_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -230,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-250_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -250,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-250_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -250,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-270_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -270,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-270_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -270,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-30_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -30,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-30_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -30,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-50_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -50,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-50_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -50,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-70_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -70,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-70_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -70,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-90_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -90,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_-90_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -90,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_10_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 10,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_10_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 10,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_110_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 110,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_110_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 110,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_130_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 130,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_130_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 130,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_150_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 150,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_150_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 150,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_170_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 170,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_170_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 170,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_190_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 190,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_190_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 190,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_210_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 210,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_210_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 210,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_230_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 230,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_230_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 230,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_250_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 250,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_250_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 250,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_270_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 270,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_270_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 270,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_30_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 30,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_30_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 30,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_50_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 50,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_50_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 50,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_70_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 70,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_70_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 70,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_90_-62.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 90,
          "y": 0.12,
          "z": -62.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_n_90_-75.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 90,
          "y": 0.12,
          "z": -75.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-10_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -10,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-10_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -10,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-110_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -110,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-110_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -110,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-130_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -130,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-130_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -130,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-150_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -150,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-150_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -150,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-170_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -170,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-170_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -170,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-190_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -190,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-190_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -190,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-210_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -210,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-210_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -210,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-230_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -230,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-230_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -230,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-250_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -250,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-250_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -250,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-270_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -270,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-270_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -270,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-30_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -30,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-30_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -30,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-50_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -50,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-50_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -50,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-70_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -70,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-70_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -70,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-90_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -90,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_-90_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -90,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_10_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 10,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_10_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 10,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_110_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 110,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_110_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 110,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_130_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 130,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_130_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 130,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_150_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 150,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_150_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 150,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_170_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 170,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_170_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 170,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_190_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 190,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_190_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 190,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_210_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 210,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_210_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 210,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_230_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 230,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_230_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 230,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_250_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 250,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_250_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 250,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_270_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 270,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_270_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 270,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_30_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 30,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_30_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 30,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_50_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 50,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_50_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 50,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_70_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 70,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_70_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 70,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_90_-163.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": 90,
          "y": 0.12,
          "z": -163.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_rd_quay_s_90_-176.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 90,
          "y": 0.12,
          "z": -176.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sb_needles_-3_134.9",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -3,
          "y": 30.783,
          "z": 134.9
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sb_needles_-3_141.1",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -3,
          "y": 30.783,
          "z": 141.1
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h0_0_-262_-276.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -262,
          "y": 0.12,
          "z": -276.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h0_0_-262_-295.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -262,
          "y": 0.12,
          "z": -295.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h0_1_-218_-276.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -218,
          "y": 0.12,
          "z": -276.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h0_1_-218_-295.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -218,
          "y": 0.12,
          "z": -295.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h0_2_-174_-276.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -174,
          "y": 0.12,
          "z": -276.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h0_2_-174_-295.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -174,
          "y": 0.12,
          "z": -295.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h0_3_-110_-276.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -110,
          "y": 0.12,
          "z": -276.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h0_3_-110_-295.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -110,
          "y": 0.12,
          "z": -295.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h0_3_-130_-276.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -130,
          "y": 0.12,
          "z": -276.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h0_3_-130_-295.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -130,
          "y": 0.12,
          "z": -295.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h1_0_-262_-232.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -262,
          "y": 0.12,
          "z": -232.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h1_0_-262_-251.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -262,
          "y": 0.12,
          "z": -251.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h1_1_-218_-232.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -218,
          "y": 0.12,
          "z": -232.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h1_1_-218_-251.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -218,
          "y": 0.12,
          "z": -251.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h1_2_-174_-232.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -174,
          "y": 0.12,
          "z": -232.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h1_2_-174_-251.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -174,
          "y": 0.12,
          "z": -251.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h1_3_-110_-232.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -110,
          "y": 0.12,
          "z": -232.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h1_3_-110_-251.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -110,
          "y": 0.12,
          "z": -251.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h1_3_-130_-232.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -130,
          "y": 0.12,
          "z": -232.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h1_3_-130_-251.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -130,
          "y": 0.12,
          "z": -251.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h2_0_-262_-188.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -262,
          "y": 0.12,
          "z": -188.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h2_0_-262_-207.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -262,
          "y": 0.12,
          "z": -207.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h2_1_-218_-188.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -218,
          "y": 0.12,
          "z": -188.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h2_1_-218_-207.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -218,
          "y": 0.12,
          "z": -207.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h2_2_-174_-188.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -174,
          "y": 0.12,
          "z": -188.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h2_2_-174_-207.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -174,
          "y": 0.12,
          "z": -207.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h2_3_-110_-188.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -110,
          "y": 0.12,
          "z": -188.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h2_3_-110_-207.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -110,
          "y": 0.12,
          "z": -207.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h2_3_-130_-188.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 180,
        "position": {
          "x": -130,
          "y": 0.12,
          "z": -188.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_h2_3_-130_-207.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -130,
          "y": 0.12,
          "z": -207.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_v0_0_-270.6_-268",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -270.6,
          "y": 0.12,
          "z": -268
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_v0_0_-289.4_-268",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -289.4,
          "y": 0.12,
          "z": -268
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_v0_1_-270.6_-224",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -270.6,
          "y": 0.12,
          "z": -224
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_v0_1_-289.4_-224",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -289.4,
          "y": 0.12,
          "z": -224
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_v0_2_-270.6_-180",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -270.6,
          "y": 0.12,
          "z": -180
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_v0_2_-289.4_-180",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -289.4,
          "y": 0.12,
          "z": -180
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_v1_0_-226.6_-268",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -226.6,
          "y": 0.12,
          "z": -268
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_v1_0_-245.4_-268",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -245.4,
          "y": 0.12,
          "z": -268
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_v1_1_-226.6_-224",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -226.6,
          "y": 0.12,
          "z": -224
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_v1_1_-245.4_-224",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -245.4,
          "y": 0.12,
          "z": -224
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_v1_2_-226.6_-180",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -226.6,
          "y": 0.12,
          "z": -180
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_v1_2_-245.4_-180",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -245.4,
          "y": 0.12,
          "z": -180
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_v2_0_-182.6_-268",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -182.6,
          "y": 0.12,
          "z": -268
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_v2_0_-201.4_-268",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -201.4,
          "y": 0.12,
          "z": -268
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_v2_1_-182.6_-224",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -182.6,
          "y": 0.12,
          "z": -224
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_v2_1_-201.4_-224",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -201.4,
          "y": 0.12,
          "z": -224
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_v2_2_-182.6_-180",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -182.6,
          "y": 0.12,
          "z": -180
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_v2_2_-201.4_-180",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -201.4,
          "y": 0.12,
          "z": -180
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_v3_0_-138.6_-268",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -138.6,
          "y": 0.12,
          "z": -268
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_v3_0_-157.4_-268",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -157.4,
          "y": 0.12,
          "z": -268
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_v3_1_-138.6_-224",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -138.6,
          "y": 0.12,
          "z": -224
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_v3_1_-157.4_-224",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -157.4,
          "y": 0.12,
          "z": -224
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_v3_2_-138.6_-180",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": -138.6,
          "y": 0.12,
          "z": -180
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_sind_s_v3_2_-157.4_-180",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 90,
        "position": {
          "x": -157.4,
          "y": 0.12,
          "z": -180
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h0_0_78.864_-249.422",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 14,
        "position": {
          "x": 78.864,
          "y": 0.12,
          "z": -249.422
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h0_0_82.445_-235.062",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -166,
        "position": {
          "x": 82.445,
          "y": 0.12,
          "z": -235.062
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h0_1_111.854_-257.648",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 14,
        "position": {
          "x": 111.854,
          "y": 0.12,
          "z": -257.648
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h0_1_115.435_-243.288",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -166,
        "position": {
          "x": 115.435,
          "y": 0.12,
          "z": -243.288
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h0_2_144.844_-265.873",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 14,
        "position": {
          "x": 144.844,
          "y": 0.12,
          "z": -265.873
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h0_2_148.425_-251.513",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -166,
        "position": {
          "x": 148.425,
          "y": 0.12,
          "z": -251.513
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h0_3_177.835_-274.098",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 14,
        "position": {
          "x": 177.835,
          "y": 0.12,
          "z": -274.098
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h0_3_181.416_-259.738",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -166,
        "position": {
          "x": 181.416,
          "y": 0.12,
          "z": -259.738
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h0_4_210.825_-282.324",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 14,
        "position": {
          "x": 210.825,
          "y": 0.12,
          "z": -282.324
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h0_4_214.406_-267.964",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -166,
        "position": {
          "x": 214.406,
          "y": 0.12,
          "z": -267.964
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h0_5_243.815_-290.549",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 14,
        "position": {
          "x": 243.815,
          "y": 0.12,
          "z": -290.549
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h0_5_247.396_-276.189",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -166,
        "position": {
          "x": 247.396,
          "y": 0.12,
          "z": -276.189
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h0_6_276.805_-298.775",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 14,
        "position": {
          "x": 276.805,
          "y": 0.12,
          "z": -298.775
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h0_6_280.385_-284.414",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -166,
        "position": {
          "x": 280.385,
          "y": 0.12,
          "z": -284.414
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h1_0_87.09_-216.432",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 14,
        "position": {
          "x": 87.09,
          "y": 0.12,
          "z": -216.432
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h1_0_90.671_-202.072",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -166,
        "position": {
          "x": 90.671,
          "y": 0.12,
          "z": -202.072
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h1_1_120.08_-224.658",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 14,
        "position": {
          "x": 120.08,
          "y": 0.12,
          "z": -224.658
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h1_1_123.661_-210.298",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -166,
        "position": {
          "x": 123.661,
          "y": 0.12,
          "z": -210.298
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h1_2_153.07_-232.883",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 14,
        "position": {
          "x": 153.07,
          "y": 0.12,
          "z": -232.883
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h1_2_156.651_-218.523",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -166,
        "position": {
          "x": 156.651,
          "y": 0.12,
          "z": -218.523
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h1_3_186.06_-241.108",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 14,
        "position": {
          "x": 186.06,
          "y": 0.12,
          "z": -241.108
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h1_3_189.641_-226.748",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -166,
        "position": {
          "x": 189.641,
          "y": 0.12,
          "z": -226.748
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h1_4_219.05_-249.334",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 14,
        "position": {
          "x": 219.05,
          "y": 0.12,
          "z": -249.334
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h1_4_222.631_-234.974",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -166,
        "position": {
          "x": 222.631,
          "y": 0.12,
          "z": -234.974
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h1_5_252.04_-257.559",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 14,
        "position": {
          "x": 252.04,
          "y": 0.12,
          "z": -257.559
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h1_5_255.621_-243.199",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -166,
        "position": {
          "x": 255.621,
          "y": 0.12,
          "z": -243.199
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h1_6_285.031_-265.785",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 14,
        "position": {
          "x": 285.031,
          "y": 0.12,
          "z": -265.785
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_h1_6_288.611_-251.424",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -166,
        "position": {
          "x": 288.611,
          "y": 0.12,
          "z": -251.424
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v0_0_61.821_-221.057",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 104,
        "position": {
          "x": 61.821,
          "y": 0.12,
          "z": -221.057
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v0_0_76.181_-224.638",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -76,
        "position": {
          "x": 76.181,
          "y": 0.12,
          "z": -224.638
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v0_1_70.046_-188.066",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 104,
        "position": {
          "x": 70.046,
          "y": 0.12,
          "z": -188.066
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v0_1_84.406_-191.647",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -76,
        "position": {
          "x": 84.406,
          "y": 0.12,
          "z": -191.647
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v1_0_109.171_-232.863",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -76,
        "position": {
          "x": 109.171,
          "y": 0.12,
          "z": -232.863
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v1_0_94.811_-229.282",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 104,
        "position": {
          "x": 94.811,
          "y": 0.12,
          "z": -229.282
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v1_1_103.037_-196.292",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 104,
        "position": {
          "x": 103.037,
          "y": 0.12,
          "z": -196.292
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v1_1_117.397_-199.873",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -76,
        "position": {
          "x": 117.397,
          "y": 0.12,
          "z": -199.873
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v2_0_127.801_-237.507",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 104,
        "position": {
          "x": 127.801,
          "y": 0.12,
          "z": -237.507
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v2_0_142.161_-241.088",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -76,
        "position": {
          "x": 142.161,
          "y": 0.12,
          "z": -241.088
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v2_1_136.027_-204.517",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 104,
        "position": {
          "x": 136.027,
          "y": 0.12,
          "z": -204.517
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v2_1_150.387_-208.098",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -76,
        "position": {
          "x": 150.387,
          "y": 0.12,
          "z": -208.098
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v3_0_160.791_-245.733",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 104,
        "position": {
          "x": 160.791,
          "y": 0.12,
          "z": -245.733
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v3_0_175.151_-249.314",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -76,
        "position": {
          "x": 175.151,
          "y": 0.12,
          "z": -249.314
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v3_1_169.017_-212.742",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 104,
        "position": {
          "x": 169.017,
          "y": 0.12,
          "z": -212.742
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v3_1_183.377_-216.323",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -76,
        "position": {
          "x": 183.377,
          "y": 0.12,
          "z": -216.323
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v4_0_193.781_-253.958",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 104,
        "position": {
          "x": 193.781,
          "y": 0.12,
          "z": -253.958
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v4_0_208.141_-257.539",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -76,
        "position": {
          "x": 208.141,
          "y": 0.12,
          "z": -257.539
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v4_1_202.007_-220.968",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 104,
        "position": {
          "x": 202.007,
          "y": 0.12,
          "z": -220.968
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v4_1_216.367_-224.549",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -76,
        "position": {
          "x": 216.367,
          "y": 0.12,
          "z": -224.549
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v5_0_226.771_-262.183",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 104,
        "position": {
          "x": 226.771,
          "y": 0.12,
          "z": -262.183
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v5_0_241.131_-265.764",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -76,
        "position": {
          "x": 241.131,
          "y": 0.12,
          "z": -265.764
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v5_1_234.997_-229.193",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 104,
        "position": {
          "x": 234.997,
          "y": 0.12,
          "z": -229.193
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v5_1_249.357_-232.774",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -76,
        "position": {
          "x": 249.357,
          "y": 0.12,
          "z": -232.774
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v6_0_259.761_-270.409",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 104,
        "position": {
          "x": 259.761,
          "y": 0.12,
          "z": -270.409
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v6_0_274.121_-273.99",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -76,
        "position": {
          "x": 274.121,
          "y": 0.12,
          "z": -273.99
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v6_1_267.987_-237.418",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 104,
        "position": {
          "x": 267.987,
          "y": 0.12,
          "z": -237.418
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_skit_s_v6_1_282.347_-240.999",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -76,
        "position": {
          "x": 282.347,
          "y": 0.12,
          "z": -240.999
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "pillar_br_east_165.2_-105",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": 165.2,
          "y": -4,
          "z": -105
        },
        "scale": {
          "x": 1.6,
          "y": 6.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_east_165.2_-117",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": 165.2,
          "y": -4,
          "z": -117
        },
        "scale": {
          "x": 1.6,
          "y": 6.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_east_165.2_-129",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": 165.2,
          "y": -4,
          "z": -129
        },
        "scale": {
          "x": 1.6,
          "y": 6.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_east_165.2_-147",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": 165.2,
          "y": -4,
          "z": -147
        },
        "scale": {
          "x": 1.6,
          "y": 5.248,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_east_165.2_-98.5",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": 165.2,
          "y": -4,
          "z": -98.5
        },
        "scale": {
          "x": 1.6,
          "y": 5.833,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_east_174.8_-105",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": 174.8,
          "y": -4,
          "z": -105
        },
        "scale": {
          "x": 1.6,
          "y": 6.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_east_174.8_-117",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": 174.8,
          "y": -4,
          "z": -117
        },
        "scale": {
          "x": 1.6,
          "y": 6.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_east_174.8_-129",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": 174.8,
          "y": -4,
          "z": -129
        },
        "scale": {
          "x": 1.6,
          "y": 6.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_east_174.8_-147",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": 174.8,
          "y": -4,
          "z": -147
        },
        "scale": {
          "x": 1.6,
          "y": 5.248,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_east_174.8_-98.5",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": 174.8,
          "y": -4,
          "z": -98.5
        },
        "scale": {
          "x": 1.6,
          "y": 5.833,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_mid_55.2_-105",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": 55.2,
          "y": -4,
          "z": -105
        },
        "scale": {
          "x": 1.6,
          "y": 6.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_mid_55.2_-117",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": 55.2,
          "y": -4,
          "z": -117
        },
        "scale": {
          "x": 1.6,
          "y": 6.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_mid_55.2_-129",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": 55.2,
          "y": -4,
          "z": -129
        },
        "scale": {
          "x": 1.6,
          "y": 6.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_mid_55.2_-147",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": 55.2,
          "y": -4,
          "z": -147
        },
        "scale": {
          "x": 1.6,
          "y": 5.248,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_mid_55.2_-98.5",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": 55.2,
          "y": -4,
          "z": -98.5
        },
        "scale": {
          "x": 1.6,
          "y": 5.833,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_mid_64.8_-105",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": 64.8,
          "y": -4,
          "z": -105
        },
        "scale": {
          "x": 1.6,
          "y": 6.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_mid_64.8_-117",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": 64.8,
          "y": -4,
          "z": -117
        },
        "scale": {
          "x": 1.6,
          "y": 6.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_mid_64.8_-129",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": 64.8,
          "y": -4,
          "z": -129
        },
        "scale": {
          "x": 1.6,
          "y": 6.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_mid_64.8_-147",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": 64.8,
          "y": -4,
          "z": -147
        },
        "scale": {
          "x": 1.6,
          "y": 5.248,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_mid_64.8_-98.5",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": 64.8,
          "y": -4,
          "z": -98.5
        },
        "scale": {
          "x": 1.6,
          "y": 5.833,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_west_-187.2_-105",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -187.2,
          "y": -4,
          "z": -105
        },
        "scale": {
          "x": 1.6,
          "y": 6.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_west_-187.2_-117",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -187.2,
          "y": -4,
          "z": -117
        },
        "scale": {
          "x": 1.6,
          "y": 6.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_west_-187.2_-129",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -187.2,
          "y": -4,
          "z": -129
        },
        "scale": {
          "x": 1.6,
          "y": 6.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_west_-187.2_-147",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -187.2,
          "y": -4,
          "z": -147
        },
        "scale": {
          "x": 1.6,
          "y": 5.248,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_west_-187.2_-98.5",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -187.2,
          "y": -4,
          "z": -98.5
        },
        "scale": {
          "x": 1.6,
          "y": 5.833,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_west_-196.8_-105",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -196.8,
          "y": -4,
          "z": -105
        },
        "scale": {
          "x": 1.6,
          "y": 6.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_west_-196.8_-117",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -196.8,
          "y": -4,
          "z": -117
        },
        "scale": {
          "x": 1.6,
          "y": 6.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_west_-196.8_-129",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -196.8,
          "y": -4,
          "z": -129
        },
        "scale": {
          "x": 1.6,
          "y": 6.4,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_west_-196.8_-147",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -196.8,
          "y": -4,
          "z": -147
        },
        "scale": {
          "x": 1.6,
          "y": 5.248,
          "z": 1.6
        }
      },
      {
        "id": "pillar_br_west_-196.8_-98.5",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -196.8,
          "y": -4,
          "z": -98.5
        },
        "scale": {
          "x": 1.6,
          "y": 5.833,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-57.2_-111",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -57.2,
          "y": -4,
          "z": -111
        },
        "scale": {
          "x": 1.6,
          "y": 5.987,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-57.2_-123",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -57.2,
          "y": -4,
          "z": -123
        },
        "scale": {
          "x": 1.6,
          "y": 5.41,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-57.2_-135",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -57.2,
          "y": -4,
          "z": -135
        },
        "scale": {
          "x": 1.6,
          "y": 4.87,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-57.2_-14",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -57.2,
          "y": 3.43,
          "z": -14
        },
        "scale": {
          "x": 1.6,
          "y": 4.132,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-57.2_-147",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -57.2,
          "y": -4,
          "z": -147
        },
        "scale": {
          "x": 1.6,
          "y": 4.33,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-57.2_-2",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -57.2,
          "y": 4.483,
          "z": -2
        },
        "scale": {
          "x": 1.6,
          "y": 3.799,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-57.2_-32",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -57.2,
          "y": 1.332,
          "z": -32
        },
        "scale": {
          "x": 1.6,
          "y": 5.15,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-57.2_-44",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -57.2,
          "y": 0.399,
          "z": -44
        },
        "scale": {
          "x": 1.6,
          "y": 5.363,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-57.2_-53",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -57.2,
          "y": 0.068,
          "z": -53
        },
        "scale": {
          "x": 1.6,
          "y": 5.154,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-57.2_-77",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -57.2,
          "y": 0,
          "z": -77
        },
        "scale": {
          "x": 1.6,
          "y": 3.782,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-57.2_-87",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -57.2,
          "y": 0,
          "z": -87
        },
        "scale": {
          "x": 1.6,
          "y": 3.217,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-57.2_-99",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -57.2,
          "y": -4,
          "z": -99
        },
        "scale": {
          "x": 1.6,
          "y": 6.602,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-57.2_10",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -57.2,
          "y": 5.49,
          "z": 10
        },
        "scale": {
          "x": 1.6,
          "y": 3.512,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-57.2_26",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -57.2,
          "y": 7.453,
          "z": 26
        },
        "scale": {
          "x": 1.6,
          "y": 2.509,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-57.2_38",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -57.2,
          "y": 9.108,
          "z": 38
        },
        "scale": {
          "x": 1.6,
          "y": 1.574,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-62.8_-111",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -62.8,
          "y": -4,
          "z": -111
        },
        "scale": {
          "x": 1.6,
          "y": 5.987,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-62.8_-123",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -62.8,
          "y": -4,
          "z": -123
        },
        "scale": {
          "x": 1.6,
          "y": 5.41,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-62.8_-135",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -62.8,
          "y": -4,
          "z": -135
        },
        "scale": {
          "x": 1.6,
          "y": 4.87,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-62.8_-14",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -62.8,
          "y": 3.43,
          "z": -14
        },
        "scale": {
          "x": 1.6,
          "y": 4.132,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-62.8_-147",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -62.8,
          "y": -4,
          "z": -147
        },
        "scale": {
          "x": 1.6,
          "y": 4.33,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-62.8_-2",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -62.8,
          "y": 4.483,
          "z": -2
        },
        "scale": {
          "x": 1.6,
          "y": 3.799,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-62.8_-32",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -62.8,
          "y": 1.332,
          "z": -32
        },
        "scale": {
          "x": 1.6,
          "y": 5.15,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-62.8_-44",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -62.8,
          "y": 0.399,
          "z": -44
        },
        "scale": {
          "x": 1.6,
          "y": 5.363,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-62.8_-53",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -62.8,
          "y": 0.068,
          "z": -53
        },
        "scale": {
          "x": 1.6,
          "y": 5.154,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-62.8_-77",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -62.8,
          "y": 0,
          "z": -77
        },
        "scale": {
          "x": 1.6,
          "y": 3.782,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-62.8_-87",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -62.8,
          "y": 0,
          "z": -87
        },
        "scale": {
          "x": 1.6,
          "y": 3.217,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-62.8_-99",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -62.8,
          "y": -4,
          "z": -99
        },
        "scale": {
          "x": 1.6,
          "y": 6.602,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-62.8_10",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -62.8,
          "y": 5.476,
          "z": 10
        },
        "scale": {
          "x": 1.6,
          "y": 3.526,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-62.8_26",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -62.8,
          "y": 7.416,
          "z": 26
        },
        "scale": {
          "x": 1.6,
          "y": 2.546,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_fly_e_-62.8_38",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -90,
        "position": {
          "x": -62.8,
          "y": 9.059,
          "z": 38
        },
        "scale": {
          "x": 1.6,
          "y": 1.623,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_x_east_108.636_33.707",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -139.844,
        "position": {
          "x": 108.636,
          "y": 8.505,
          "z": 33.707
        },
        "scale": {
          "x": 1.6,
          "y": 1.019,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_x_east_117.807_25.969",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -139.844,
        "position": {
          "x": 117.807,
          "y": 7.362,
          "z": 25.969
        },
        "scale": {
          "x": 1.6,
          "y": 1.442,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_x_east_126.979_18.23",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -139.844,
        "position": {
          "x": 126.979,
          "y": 6.289,
          "z": 18.23
        },
        "scale": {
          "x": 1.6,
          "y": 1.795,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_x_east_130.59_22.51",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -139.844,
        "position": {
          "x": 130.59,
          "y": 6.753,
          "z": 22.51
        },
        "scale": {
          "x": 1.6,
          "y": 1.331,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_x_east_135.816_10.962",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 37.121733853924695,
        "position": {
          "x": 135.816,
          "y": 5.471,
          "z": 10.962
        },
        "scale": {
          "x": 1.6,
          "y": 2.074,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_x_east_139.196_15.427",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 37.121733853924695,
        "position": {
          "x": 139.196,
          "y": 5.869,
          "z": 15.427
        },
        "scale": {
          "x": 1.6,
          "y": 1.399,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_x_east_146.075_4.124",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 30.246240312354843,
        "position": {
          "x": 146.075,
          "y": 4.933,
          "z": 4.124
        },
        "scale": {
          "x": 1.6,
          "y": 2.047,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_x_east_148.896_8.962",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 30.246240312354843,
        "position": {
          "x": 148.896,
          "y": 5.297,
          "z": 8.962
        },
        "scale": {
          "x": 1.6,
          "y": 1.095,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_x_east_157.078_-1.436",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": 23.370746770784947,
        "position": {
          "x": 157.078,
          "y": 4.523,
          "z": -1.436
        },
        "scale": {
          "x": 1.6,
          "y": 1.611,
          "z": 1.6
        }
      },
      {
        "id": "pillar_rd_x_east_166.199_-4.941",
        "model": "concrete_pillar",
        "source": "bridge_pillar",
        "rotationY": -160.067,
        "position": {
          "x": 166.199,
          "y": 4.271,
          "z": -4.941
        },
        "scale": {
          "x": 1.6,
          "y": 1.147,
          "z": 1.6
        }
      },
      {
        "id": "tree_plaza_40",
        "model": "tree",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": 40,
          "y": 14.783,
          "z": 144
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "tree_plaza_56",
        "model": "tree",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": 56,
          "y": 14.783,
          "z": 144
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "tree_quay_-100",
        "model": "tree",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": -100,
          "y": 0.021,
          "z": -56
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "tree_quay_-140",
        "model": "tree",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": -140,
          "y": 0.021,
          "z": -56
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "tree_quay_-20",
        "model": "tree",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": -20,
          "y": 0.021,
          "z": -56
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "tree_quay_100",
        "model": "tree",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": 100,
          "y": 0.021,
          "z": -56
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "tree_quay_160",
        "model": "tree",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": 160,
          "y": 0.021,
          "z": -56
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "tree_quay_220",
        "model": "tree",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": 220,
          "y": 0.021,
          "z": -56
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
        "id": "wash_needle_a",
        "type": "spot",
        "position": {
          "x": -23,
          "y": 14.983,
          "z": 124
        },
        "target": {
          "x": -23,
          "y": 34.783,
          "z": 138
        },
        "color": "#8ec9ff",
        "intensity": 90,
        "distance": 60,
        "angle": 0.6
      },
      {
        "id": "wash_needle_b",
        "type": "spot",
        "position": {
          "x": 17,
          "y": 14.983,
          "z": 124
        },
        "target": {
          "x": 17,
          "y": 42.783,
          "z": 138
        },
        "color": "#ffd9a8",
        "intensity": 90,
        "distance": 70,
        "angle": 0.6
      }
    ],
    "windows": {
      "lit": 0.42
    },
    "clutter": {
      "roof": {
        "perHouse": 4
      },
      "street": {
        "every": 26
      }
    },
    "signage": {
      "keep": 0.75,
      "width": [
        3.5,
        6.5
      ]
    }
  },
  "sky": {
    "sky": "#0b1020",
    "fog": {
      "color": "#0e1424",
      "near": 40,
      "far": 320
    },
    "hemi": {
      "sky": "#1b2a44",
      "ground": "#0a0d12",
      "intensity": 0.7
    },
    "sun": {
      "color": "#bcd0ff",
      "intensity": 3.5,
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
      "x": 17,
      "z": 138
    },
    "exitRadius": 4,
    "enemies": {
      "count": 8
    },
    "alienEnemies": {
      "count": 2
    }
  }
};
