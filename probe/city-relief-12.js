/**
 * СГЕНЕРИРОВАННО — руками не править.
 *
 * Источник правки: probe/city-relief-12.json. После его изменения запуск
 * `node tools/build-level.mjs probe/city-relief-12.json` перезаписывает этот файл
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
export const CITY_RELIEF_12 = {
  "name": "Кварталы",
  "hint": "—",
  "map": {
    "kind": "json2",
    "units": "meters",
    "ground": {
      "y": 0,
      "size": 320,
      "color": 2764083
    },
    "relief": {
      "baseY": 0,
      "maxSlope": 0.12,
      "blend": 14,
      "cell": 24,
      "hills": [
        {
          "id": "hrub",
          "x": -80,
          "z": -80,
          "radius": 400,
          "height": 3
        },
        {
          "id": "lon",
          "x": 90,
          "z": 90,
          "radius": 400,
          "height": -2
        }
      ],
      "pads": [
        {
          "id": "a:терраса",
          "minX": -121.966,
          "maxX": -32.439,
          "minZ": -123.861,
          "maxZ": -45.361,
          "y": 2.307,
          "blend": 14,
          "yaw": 18
        },
        {
          "id": "b:терраса",
          "minX": 22,
          "maxX": 136,
          "minZ": 22,
          "maxZ": 136,
          "y": -0.769,
          "blend": 20.445
        },
        {
          "id": "plinth:площадка",
          "minX": 56,
          "maxX": 68,
          "minZ": 54,
          "maxZ": 66,
          "y": -0.219,
          "blend": 14
        }
      ]
    },
    "bounds": {
      "minX": -160,
      "maxX": 160,
      "minZ": -160,
      "maxZ": 160
    },
    "spawn": {
      "x": -100,
      "z": -100
    },
    "buildings": [
      {
        "id": "plinth",
        "name": "plinth",
        "isEnterable": false,
        "baseY": -0.219,
        "floorHeight": 3.4,
        "floorsCount": 3,
        "roofY": 9.981,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 56,
            "z": 54
          },
          {
            "x": 68,
            "z": 54
          },
          {
            "x": 68,
            "z": 66
          },
          {
            "x": 56,
            "z": 66
          }
        ],
        "bounds": {
          "minX": 56,
          "maxX": 68,
          "minZ": 54,
          "maxZ": 66
        },
        "rects": [
          {
            "minX": 56,
            "maxX": 68,
            "minZ": 54,
            "maxZ": 66
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 55.825,
            "maxX": 56.175,
            "minZ": 54,
            "maxZ": 66,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 56,
            "maxX": 68,
            "minZ": 53.825,
            "maxZ": 54.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 56,
            "maxX": 68,
            "minZ": 65.825,
            "maxZ": 66.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 67.825,
            "maxX": 68.175,
            "minZ": 54,
            "maxZ": 66,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "a_005",
        "name": "a_005",
        "isEnterable": false,
        "baseY": 2.307,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 16.307,
        "facadeMaterial": "glass_and_concrete",
        "footprint": [
          {
            "x": -63.41,
            "z": -116.521
          },
          {
            "x": -55.41,
            "z": -116.521
          },
          {
            "x": -55.41,
            "z": -113.021
          },
          {
            "x": -50.91,
            "z": -113.021
          },
          {
            "x": -50.91,
            "z": -108.021
          },
          {
            "x": -63.41,
            "z": -108.021
          }
        ],
        "bounds": {
          "minX": -63.41,
          "maxX": -50.91,
          "minZ": -116.521,
          "maxZ": -108.021
        },
        "rotation": 12.197,
        "rects": [
          {
            "minX": -63.41,
            "maxX": -50.91,
            "minZ": -113.021,
            "maxZ": -108.021
          },
          {
            "minX": -63.41,
            "maxX": -55.41,
            "minZ": -116.521,
            "maxZ": -113.021
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -51.085,
            "maxX": -50.735,
            "minZ": -113.021,
            "maxZ": -108.021,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -55.41,
            "maxX": -50.91,
            "minZ": -113.196,
            "maxZ": -112.846,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -55.585,
            "maxX": -55.235,
            "minZ": -116.521,
            "maxZ": -113.021,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -63.41,
            "maxX": -50.91,
            "minZ": -108.196,
            "maxZ": -107.846,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -63.41,
            "maxX": -55.41,
            "minZ": -116.696,
            "maxZ": -116.346,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -63.585,
            "maxX": -63.235,
            "minZ": -116.521,
            "maxZ": -108.021,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "a_009",
        "name": "a_009",
        "isEnterable": false,
        "baseY": 2.307,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 16.307,
        "facadeMaterial": "glass_and_concrete",
        "footprint": [
          {
            "x": -121.246,
            "z": -93.918
          },
          {
            "x": -112.746,
            "z": -93.918
          },
          {
            "x": -112.746,
            "z": -85.918
          },
          {
            "x": -121.246,
            "z": -85.918
          }
        ],
        "bounds": {
          "minX": -121.246,
          "maxX": -112.746,
          "minZ": -93.918,
          "maxZ": -85.918
        },
        "rotation": 12.38,
        "rects": [
          {
            "minX": -121.246,
            "maxX": -112.746,
            "minZ": -93.918,
            "maxZ": -85.918
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -112.921,
            "maxX": -112.571,
            "minZ": -93.918,
            "maxZ": -85.918,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -121.246,
            "maxX": -112.746,
            "minZ": -86.093,
            "maxZ": -85.743,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -121.246,
            "maxX": -112.746,
            "minZ": -94.093,
            "maxZ": -93.743,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -121.421,
            "maxX": -121.071,
            "minZ": -93.918,
            "maxZ": -85.918,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "a_010",
        "name": "a_010",
        "isEnterable": false,
        "baseY": 2.307,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 16.307,
        "facadeMaterial": "stone_base",
        "footprint": [
          {
            "x": -100.858,
            "z": -90.555
          },
          {
            "x": -100.858,
            "z": -81.555
          },
          {
            "x": -105.858,
            "z": -81.555
          },
          {
            "x": -105.858,
            "z": -85.055
          },
          {
            "x": -109.358,
            "z": -85.055
          },
          {
            "x": -109.358,
            "z": -88.055
          },
          {
            "x": -105.858,
            "z": -88.055
          },
          {
            "x": -105.858,
            "z": -90.555
          }
        ],
        "bounds": {
          "minX": -109.358,
          "maxX": -100.858,
          "minZ": -90.555,
          "maxZ": -81.555
        },
        "rotation": 14.514,
        "rects": [
          {
            "minX": -105.858,
            "maxX": -100.858,
            "minZ": -85.055,
            "maxZ": -81.555
          },
          {
            "minX": -105.858,
            "maxX": -100.858,
            "minZ": -90.555,
            "maxZ": -88.055
          },
          {
            "minX": -109.358,
            "maxX": -100.858,
            "minZ": -88.055,
            "maxZ": -85.055
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -101.033,
            "maxX": -100.683,
            "minZ": -90.555,
            "maxZ": -81.555,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -105.858,
            "maxX": -100.858,
            "minZ": -81.73,
            "maxZ": -81.38,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -105.858,
            "maxX": -100.858,
            "minZ": -90.73,
            "maxZ": -90.38,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -106.033,
            "maxX": -105.683,
            "minZ": -85.055,
            "maxZ": -81.555,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -106.033,
            "maxX": -105.683,
            "minZ": -90.555,
            "maxZ": -88.055,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -109.358,
            "maxX": -105.858,
            "minZ": -85.23,
            "maxZ": -84.88,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -109.358,
            "maxX": -105.858,
            "minZ": -88.23,
            "maxZ": -87.88,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -109.533,
            "maxX": -109.183,
            "minZ": -88.055,
            "maxZ": -85.055,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "a_011",
        "name": "a_011",
        "isEnterable": false,
        "baseY": 2.307,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 16.307,
        "facadeMaterial": "glass_steel",
        "footprint": [
          {
            "x": -125.325,
            "z": -80.663
          },
          {
            "x": -104.825,
            "z": -80.663
          },
          {
            "x": -104.825,
            "z": -72.163
          },
          {
            "x": -125.325,
            "z": -72.163
          }
        ],
        "bounds": {
          "minX": -125.325,
          "maxX": -104.825,
          "minZ": -80.663,
          "maxZ": -72.163
        },
        "rotation": 13.663,
        "rects": [
          {
            "minX": -125.325,
            "maxX": -104.825,
            "minZ": -80.663,
            "maxZ": -72.163
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -105,
            "maxX": -104.65,
            "minZ": -80.663,
            "maxZ": -72.163,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -125.325,
            "maxX": -104.825,
            "minZ": -72.338,
            "maxZ": -71.988,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -125.325,
            "maxX": -104.825,
            "minZ": -80.838,
            "maxZ": -80.488,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -125.5,
            "maxX": -125.15,
            "minZ": -80.663,
            "maxZ": -72.163,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "a_011_t1",
        "name": "a_011_t1",
        "isEnterable": false,
        "baseY": 14,
        "floorHeight": 4,
        "floorsCount": 2,
        "roofY": 22,
        "facadeMaterial": "panel_block",
        "footprint": [
          {
            "x": -123.341,
            "z": -80.062
          },
          {
            "x": -109.341,
            "z": -80.062
          },
          {
            "x": -109.341,
            "z": -73.062
          },
          {
            "x": -123.341,
            "z": -73.062
          }
        ],
        "bounds": {
          "minX": -123.341,
          "maxX": -109.341,
          "minZ": -80.062,
          "maxZ": -73.062
        },
        "rotation": 13.663,
        "rects": [
          {
            "minX": -123.341,
            "maxX": -109.341,
            "minZ": -80.062,
            "maxZ": -73.062
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -109.516,
            "maxX": -109.166,
            "minZ": -80.062,
            "maxZ": -73.062,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -123.341,
            "maxX": -109.341,
            "minZ": -73.237,
            "maxZ": -72.887,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -123.341,
            "maxX": -109.341,
            "minZ": -80.237,
            "maxZ": -79.887,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -123.516,
            "maxX": -123.166,
            "minZ": -80.062,
            "maxZ": -73.062,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "a_011_t2",
        "name": "a_011_t2",
        "isEnterable": false,
        "baseY": 22,
        "floorHeight": 4,
        "floorsCount": 1,
        "roofY": 26,
        "facadeMaterial": "glass_steel",
        "footprint": [
          {
            "x": -122.841,
            "z": -79.562
          },
          {
            "x": -109.841,
            "z": -79.562
          },
          {
            "x": -109.841,
            "z": -73.562
          },
          {
            "x": -122.841,
            "z": -73.562
          }
        ],
        "bounds": {
          "minX": -122.841,
          "maxX": -109.841,
          "minZ": -79.562,
          "maxZ": -73.562
        },
        "rotation": 13.663,
        "rects": [
          {
            "minX": -122.841,
            "maxX": -109.841,
            "minZ": -79.562,
            "maxZ": -73.562
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -110.016,
            "maxX": -109.666,
            "minZ": -79.562,
            "maxZ": -73.562,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -122.841,
            "maxX": -109.841,
            "minZ": -73.737,
            "maxZ": -73.387,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -122.841,
            "maxX": -109.841,
            "minZ": -79.737,
            "maxZ": -79.387,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -123.016,
            "maxX": -122.666,
            "minZ": -79.562,
            "maxZ": -73.562,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "a_012",
        "name": "a_012",
        "isEnterable": false,
        "baseY": 2.307,
        "floorHeight": 3.5,
        "floorsCount": 8,
        "roofY": 30.307,
        "facadeMaterial": "glass_steel",
        "footprint": [
          {
            "x": -82.716,
            "z": -81.98
          },
          {
            "x": -74.716,
            "z": -81.98
          },
          {
            "x": -74.716,
            "z": -72.98
          },
          {
            "x": -82.716,
            "z": -72.98
          }
        ],
        "bounds": {
          "minX": -82.716,
          "maxX": -74.716,
          "minZ": -81.98,
          "maxZ": -72.98
        },
        "rotation": 18.755,
        "rects": [
          {
            "minX": -82.716,
            "maxX": -74.716,
            "minZ": -81.98,
            "maxZ": -72.98
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -74.891,
            "maxX": -74.541,
            "minZ": -81.98,
            "maxZ": -72.98,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -82.716,
            "maxX": -74.716,
            "minZ": -73.155,
            "maxZ": -72.805,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -82.716,
            "maxX": -74.716,
            "minZ": -82.155,
            "maxZ": -81.805,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -82.891,
            "maxX": -82.541,
            "minZ": -81.98,
            "maxZ": -72.98,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "a_013",
        "name": "a_013",
        "isEnterable": false,
        "baseY": 2.307,
        "floorHeight": 3.5,
        "floorsCount": 1,
        "roofY": 5.807,
        "facadeMaterial": "glass_and_concrete",
        "footprint": [
          {
            "x": -71.791,
            "z": -78.349
          },
          {
            "x": -63.291,
            "z": -78.349
          },
          {
            "x": -63.291,
            "z": -69.349
          },
          {
            "x": -71.791,
            "z": -69.349
          }
        ],
        "bounds": {
          "minX": -71.791,
          "maxX": -63.291,
          "minZ": -78.349,
          "maxZ": -69.349
        },
        "rotation": 18.476,
        "rects": [
          {
            "minX": -71.791,
            "maxX": -63.291,
            "minZ": -78.349,
            "maxZ": -69.349
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -63.466,
            "maxX": -63.116,
            "minZ": -78.349,
            "maxZ": -69.349,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -71.791,
            "maxX": -63.291,
            "minZ": -69.524,
            "maxZ": -69.174,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -71.791,
            "maxX": -63.291,
            "minZ": -78.524,
            "maxZ": -78.174,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -71.966,
            "maxX": -71.616,
            "minZ": -78.349,
            "maxZ": -69.349,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "a_013_top",
        "name": "a_013_top",
        "isEnterable": false,
        "baseY": 3.5,
        "floorHeight": 4,
        "floorsCount": 4,
        "roofY": 19.5,
        "facadeMaterial": "panel_block",
        "footprint": [
          {
            "x": -70.624,
            "z": -77.402
          },
          {
            "x": -64.624,
            "z": -77.402
          },
          {
            "x": -64.624,
            "z": -71.402
          },
          {
            "x": -70.624,
            "z": -71.402
          }
        ],
        "bounds": {
          "minX": -70.624,
          "maxX": -64.624,
          "minZ": -77.402,
          "maxZ": -71.402
        },
        "rotation": 18.476,
        "rects": [
          {
            "minX": -70.624,
            "maxX": -64.624,
            "minZ": -77.402,
            "maxZ": -71.402
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -64.799,
            "maxX": -64.449,
            "minZ": -77.402,
            "maxZ": -71.402,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -70.624,
            "maxX": -64.624,
            "minZ": -71.577,
            "maxZ": -71.227,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -70.624,
            "maxX": -64.624,
            "minZ": -77.577,
            "maxZ": -77.227,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -70.799,
            "maxX": -70.449,
            "minZ": -77.402,
            "maxZ": -71.402,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "a_014",
        "name": "a_014",
        "isEnterable": false,
        "baseY": 2.307,
        "floorHeight": 4,
        "floorsCount": 38,
        "roofY": 154.307,
        "facadeMaterial": "stone_base",
        "footprint": [
          {
            "x": -78.347,
            "z": -70.555
          },
          {
            "x": -78.347,
            "z": -62.055
          },
          {
            "x": -86.347,
            "z": -62.055
          },
          {
            "x": -86.347,
            "z": -70.555
          }
        ],
        "bounds": {
          "minX": -86.347,
          "maxX": -78.347,
          "minZ": -70.555,
          "maxZ": -62.055
        },
        "rotation": 15.183,
        "rects": [
          {
            "minX": -86.347,
            "maxX": -78.347,
            "minZ": -70.555,
            "maxZ": -62.055
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -78.522,
            "maxX": -78.172,
            "minZ": -70.555,
            "maxZ": -62.055,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -86.347,
            "maxX": -78.347,
            "minZ": -62.23,
            "maxZ": -61.88,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -86.347,
            "maxX": -78.347,
            "minZ": -70.73,
            "maxZ": -70.38,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -86.522,
            "maxX": -86.172,
            "minZ": -70.555,
            "maxZ": -62.055,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "a_015",
        "name": "a_015",
        "isEnterable": false,
        "baseY": 2.307,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 9.307,
        "facadeMaterial": "panel_block",
        "footprint": [
          {
            "x": -74.946,
            "z": -66.769
          },
          {
            "x": -66.446,
            "z": -66.769
          },
          {
            "x": -66.446,
            "z": -58.269
          },
          {
            "x": -74.946,
            "z": -58.269
          }
        ],
        "bounds": {
          "minX": -74.946,
          "maxX": -66.446,
          "minZ": -66.769,
          "maxZ": -58.269
        },
        "rotation": 23.735,
        "rects": [
          {
            "minX": -74.946,
            "maxX": -66.446,
            "minZ": -66.769,
            "maxZ": -58.269
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -66.621,
            "maxX": -66.271,
            "minZ": -66.769,
            "maxZ": -58.269,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -74.946,
            "maxX": -66.446,
            "minZ": -58.444,
            "maxZ": -58.094,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -74.946,
            "maxX": -66.446,
            "minZ": -66.944,
            "maxZ": -66.594,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -75.121,
            "maxX": -74.771,
            "minZ": -66.769,
            "maxZ": -58.269,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "a_015_top",
        "name": "a_015_top",
        "isEnterable": false,
        "baseY": 7,
        "floorHeight": 4,
        "floorsCount": 5,
        "roofY": 27,
        "facadeMaterial": "stone_base",
        "footprint": [
          {
            "x": -74.036,
            "z": -65.704
          },
          {
            "x": -67.036,
            "z": -65.704
          },
          {
            "x": -67.036,
            "z": -58.704
          },
          {
            "x": -74.036,
            "z": -58.704
          }
        ],
        "bounds": {
          "minX": -74.036,
          "maxX": -67.036,
          "minZ": -65.704,
          "maxZ": -58.704
        },
        "rotation": 23.735,
        "rects": [
          {
            "minX": -74.036,
            "maxX": -67.036,
            "minZ": -65.704,
            "maxZ": -58.704
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -67.211,
            "maxX": -66.861,
            "minZ": -65.704,
            "maxZ": -58.704,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -74.036,
            "maxX": -67.036,
            "minZ": -58.879,
            "maxZ": -58.529,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -74.036,
            "maxX": -67.036,
            "minZ": -65.879,
            "maxZ": -65.529,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -74.211,
            "maxX": -73.861,
            "minZ": -65.704,
            "maxZ": -58.704,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_016",
        "name": "b_016",
        "isEnterable": false,
        "baseY": -0.769,
        "floorHeight": 3,
        "floorsCount": 3,
        "roofY": 8.231,
        "facadeMaterial": "glass_and_concrete",
        "footprint": [
          {
            "x": 38,
            "z": 38
          },
          {
            "x": 43,
            "z": 38
          },
          {
            "x": 43,
            "z": 43
          },
          {
            "x": 38,
            "z": 43
          }
        ],
        "bounds": {
          "minX": 38,
          "maxX": 43,
          "minZ": 38,
          "maxZ": 43
        },
        "rects": [
          {
            "minX": 38,
            "maxX": 43,
            "minZ": 38,
            "maxZ": 43
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 37.825,
            "maxX": 38.175,
            "minZ": 38,
            "maxZ": 43,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 38,
            "maxX": 43,
            "minZ": 37.825,
            "maxZ": 38.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 38,
            "maxX": 43,
            "minZ": 42.825,
            "maxZ": 43.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 42.825,
            "maxX": 43.175,
            "minZ": 38,
            "maxZ": 43,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_017",
        "name": "b_017",
        "isEnterable": false,
        "baseY": -0.769,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 20.231,
        "facadeMaterial": "neon_panel",
        "footprint": [
          {
            "x": 47,
            "z": 38
          },
          {
            "x": 52,
            "z": 38
          },
          {
            "x": 52,
            "z": 43.5
          },
          {
            "x": 47,
            "z": 43.5
          }
        ],
        "bounds": {
          "minX": 47,
          "maxX": 52,
          "minZ": 38,
          "maxZ": 43.5
        },
        "rects": [
          {
            "minX": 47,
            "maxX": 52,
            "minZ": 38,
            "maxZ": 43.5
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 46.825,
            "maxX": 47.175,
            "minZ": 38,
            "maxZ": 43.5,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 47,
            "maxX": 52,
            "minZ": 37.825,
            "maxZ": 38.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 47,
            "maxX": 52,
            "minZ": 43.325,
            "maxZ": 43.675,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 51.825,
            "maxX": 52.175,
            "minZ": 38,
            "maxZ": 43.5,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_018",
        "name": "b_018",
        "isEnterable": false,
        "baseY": -0.769,
        "floorHeight": 4,
        "floorsCount": 34,
        "roofY": 135.231,
        "facadeMaterial": "glass_and_concrete",
        "footprint": [
          {
            "x": 37.5,
            "z": 47
          },
          {
            "x": 43.5,
            "z": 47
          },
          {
            "x": 43.5,
            "z": 52
          },
          {
            "x": 37.5,
            "z": 52
          }
        ],
        "bounds": {
          "minX": 37.5,
          "maxX": 43.5,
          "minZ": 47,
          "maxZ": 52
        },
        "rects": [
          {
            "minX": 37.5,
            "maxX": 43.5,
            "minZ": 47,
            "maxZ": 52
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 37.325,
            "maxX": 37.675,
            "minZ": 47,
            "maxZ": 52,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 37.5,
            "maxX": 43.5,
            "minZ": 46.825,
            "maxZ": 47.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 37.5,
            "maxX": 43.5,
            "minZ": 51.825,
            "maxZ": 52.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 43.325,
            "maxX": 43.675,
            "minZ": 47,
            "maxZ": 52,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_020",
        "name": "b_020",
        "isEnterable": false,
        "baseY": -0.769,
        "floorHeight": 4,
        "floorsCount": 22,
        "roofY": 87.231,
        "facadeMaterial": "painted_brick",
        "footprint": [
          {
            "x": 71.5,
            "z": 37.5
          },
          {
            "x": 77.5,
            "z": 37.5
          },
          {
            "x": 77.5,
            "z": 43
          },
          {
            "x": 71.5,
            "z": 43
          }
        ],
        "bounds": {
          "minX": 71.5,
          "maxX": 77.5,
          "minZ": 37.5,
          "maxZ": 43
        },
        "rects": [
          {
            "minX": 71.5,
            "maxX": 77.5,
            "minZ": 37.5,
            "maxZ": 43
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 71.325,
            "maxX": 71.675,
            "minZ": 37.5,
            "maxZ": 43,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 71.5,
            "maxX": 77.5,
            "minZ": 37.325,
            "maxZ": 37.675,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 71.5,
            "maxX": 77.5,
            "minZ": 42.825,
            "maxZ": 43.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 77.325,
            "maxX": 77.675,
            "minZ": 37.5,
            "maxZ": 43,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_021",
        "name": "b_021",
        "isEnterable": false,
        "baseY": -0.769,
        "floorHeight": 3,
        "floorsCount": 5,
        "roofY": 14.231,
        "facadeMaterial": "painted_brick",
        "footprint": [
          {
            "x": 80.5,
            "z": 38
          },
          {
            "x": 86,
            "z": 38
          },
          {
            "x": 86,
            "z": 43.5
          },
          {
            "x": 80.5,
            "z": 43.5
          }
        ],
        "bounds": {
          "minX": 80.5,
          "maxX": 86,
          "minZ": 38,
          "maxZ": 43.5
        },
        "rects": [
          {
            "minX": 80.5,
            "maxX": 86,
            "minZ": 38,
            "maxZ": 43.5
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 80.325,
            "maxX": 80.675,
            "minZ": 38,
            "maxZ": 43.5,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 80.5,
            "maxX": 86,
            "minZ": 37.825,
            "maxZ": 38.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 80.5,
            "maxX": 86,
            "minZ": 43.325,
            "maxZ": 43.675,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 85.825,
            "maxX": 86.175,
            "minZ": 38,
            "maxZ": 43.5,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_023",
        "name": "b_023",
        "isEnterable": false,
        "baseY": -0.769,
        "floorHeight": 3,
        "floorsCount": 5,
        "roofY": 14.231,
        "facadeMaterial": "painted_brick",
        "footprint": [
          {
            "x": 105.5,
            "z": 38
          },
          {
            "x": 111,
            "z": 38
          },
          {
            "x": 111,
            "z": 43.5
          },
          {
            "x": 105.5,
            "z": 43.5
          }
        ],
        "bounds": {
          "minX": 105.5,
          "maxX": 111,
          "minZ": 38,
          "maxZ": 43.5
        },
        "rects": [
          {
            "minX": 105.5,
            "maxX": 111,
            "minZ": 38,
            "maxZ": 43.5
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 105.325,
            "maxX": 105.675,
            "minZ": 38,
            "maxZ": 43.5,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 105.5,
            "maxX": 111,
            "minZ": 37.825,
            "maxZ": 38.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 105.5,
            "maxX": 111,
            "minZ": 43.325,
            "maxZ": 43.675,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 110.825,
            "maxX": 111.175,
            "minZ": 38,
            "maxZ": 43.5,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_024",
        "name": "b_024",
        "isEnterable": false,
        "baseY": -0.769,
        "floorHeight": 3,
        "floorsCount": 3,
        "roofY": 8.231,
        "facadeMaterial": "neon_panel",
        "footprint": [
          {
            "x": 115,
            "z": 37.5
          },
          {
            "x": 120,
            "z": 37.5
          },
          {
            "x": 120,
            "z": 43
          },
          {
            "x": 115,
            "z": 43
          }
        ],
        "bounds": {
          "minX": 115,
          "maxX": 120,
          "minZ": 37.5,
          "maxZ": 43
        },
        "rects": [
          {
            "minX": 115,
            "maxX": 120,
            "minZ": 37.5,
            "maxZ": 43
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 114.825,
            "maxX": 115.175,
            "minZ": 37.5,
            "maxZ": 43,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 115,
            "maxX": 120,
            "minZ": 37.325,
            "maxZ": 37.675,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 115,
            "maxX": 120,
            "minZ": 42.825,
            "maxZ": 43.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 119.825,
            "maxX": 120.175,
            "minZ": 37.5,
            "maxZ": 43,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_025",
        "name": "b_025",
        "isEnterable": false,
        "baseY": -0.769,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 13.231,
        "facadeMaterial": "neon_panel",
        "footprint": [
          {
            "x": 120.5,
            "z": 52
          },
          {
            "x": 105.5,
            "z": 52
          },
          {
            "x": 105.5,
            "z": 49.5
          },
          {
            "x": 113,
            "z": 49.5
          },
          {
            "x": 113,
            "z": 46.5
          },
          {
            "x": 116.5,
            "z": 46.5
          },
          {
            "x": 116.5,
            "z": 49.5
          },
          {
            "x": 120.5,
            "z": 49.5
          }
        ],
        "bounds": {
          "minX": 105.5,
          "maxX": 120.5,
          "minZ": 46.5,
          "maxZ": 52
        },
        "rects": [
          {
            "minX": 105.5,
            "maxX": 120.5,
            "minZ": 49.5,
            "maxZ": 52
          },
          {
            "minX": 113,
            "maxX": 116.5,
            "minZ": 46.5,
            "maxZ": 49.5
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 105.325,
            "maxX": 105.675,
            "minZ": 49.5,
            "maxZ": 52,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 105.5,
            "maxX": 113,
            "minZ": 49.325,
            "maxZ": 49.675,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 105.5,
            "maxX": 120.5,
            "minZ": 51.825,
            "maxZ": 52.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 112.825,
            "maxX": 113.175,
            "minZ": 46.5,
            "maxZ": 49.5,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 113,
            "maxX": 116.5,
            "minZ": 46.325,
            "maxZ": 46.675,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 116.325,
            "maxX": 116.675,
            "minZ": 46.5,
            "maxZ": 49.5,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 116.5,
            "maxX": 120.5,
            "minZ": 49.325,
            "maxZ": 49.675,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 120.325,
            "maxX": 120.675,
            "minZ": 49.5,
            "maxZ": 52,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_026",
        "name": "b_026",
        "isEnterable": false,
        "baseY": -0.769,
        "floorHeight": 3,
        "floorsCount": 2,
        "roofY": 5.231,
        "facadeMaterial": "neon_panel",
        "footprint": [
          {
            "x": 38,
            "z": 72
          },
          {
            "x": 52,
            "z": 72
          },
          {
            "x": 52,
            "z": 86.5
          },
          {
            "x": 38,
            "z": 86.5
          }
        ],
        "bounds": {
          "minX": 38,
          "maxX": 52,
          "minZ": 72,
          "maxZ": 86.5
        },
        "rects": [
          {
            "minX": 38,
            "maxX": 52,
            "minZ": 72,
            "maxZ": 86.5
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 37.825,
            "maxX": 38.175,
            "minZ": 72,
            "maxZ": 86.5,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 38,
            "maxX": 52,
            "minZ": 71.825,
            "maxZ": 72.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 38,
            "maxX": 52,
            "minZ": 86.325,
            "maxZ": 86.675,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 51.825,
            "maxX": 52.175,
            "minZ": 72,
            "maxZ": 86.5,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_026_t1",
        "name": "b_026_t1",
        "isEnterable": false,
        "baseY": 6,
        "floorHeight": 4,
        "floorsCount": 2,
        "roofY": 14,
        "facadeMaterial": "neon_panel",
        "footprint": [
          {
            "x": 39.5,
            "z": 73
          },
          {
            "x": 51.5,
            "z": 73
          },
          {
            "x": 51.5,
            "z": 85.5
          },
          {
            "x": 39.5,
            "z": 85.5
          }
        ],
        "bounds": {
          "minX": 39.5,
          "maxX": 51.5,
          "minZ": 73,
          "maxZ": 85.5
        },
        "rects": [
          {
            "minX": 39.5,
            "maxX": 51.5,
            "minZ": 73,
            "maxZ": 85.5
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 39.325,
            "maxX": 39.675,
            "minZ": 73,
            "maxZ": 85.5,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 39.5,
            "maxX": 51.5,
            "minZ": 72.825,
            "maxZ": 73.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 39.5,
            "maxX": 51.5,
            "minZ": 85.325,
            "maxZ": 85.675,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 51.325,
            "maxX": 51.675,
            "minZ": 73,
            "maxZ": 85.5,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_028",
        "name": "b_028",
        "isEnterable": false,
        "baseY": -0.769,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 20.231,
        "facadeMaterial": "painted_brick",
        "footprint": [
          {
            "x": 106,
            "z": 71.5
          },
          {
            "x": 111,
            "z": 71.5
          },
          {
            "x": 111,
            "z": 86.5
          },
          {
            "x": 106,
            "z": 86.5
          }
        ],
        "bounds": {
          "minX": 106,
          "maxX": 111,
          "minZ": 71.5,
          "maxZ": 86.5
        },
        "rects": [
          {
            "minX": 106,
            "maxX": 111,
            "minZ": 71.5,
            "maxZ": 86.5
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 105.825,
            "maxX": 106.175,
            "minZ": 71.5,
            "maxZ": 86.5,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 106,
            "maxX": 111,
            "minZ": 71.325,
            "maxZ": 71.675,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 106,
            "maxX": 111,
            "minZ": 86.325,
            "maxZ": 86.675,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 110.825,
            "maxX": 111.175,
            "minZ": 71.5,
            "maxZ": 86.5,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_030",
        "name": "b_030",
        "isEnterable": false,
        "baseY": -0.769,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 6.231,
        "facadeMaterial": "neon_panel",
        "footprint": [
          {
            "x": 37.5,
            "z": 106
          },
          {
            "x": 52,
            "z": 106
          },
          {
            "x": 52,
            "z": 111.5
          },
          {
            "x": 37.5,
            "z": 111.5
          }
        ],
        "bounds": {
          "minX": 37.5,
          "maxX": 52,
          "minZ": 106,
          "maxZ": 111.5
        },
        "rects": [
          {
            "minX": 37.5,
            "maxX": 52,
            "minZ": 106,
            "maxZ": 111.5
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 37.325,
            "maxX": 37.675,
            "minZ": 106,
            "maxZ": 111.5,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 37.5,
            "maxX": 52,
            "minZ": 105.825,
            "maxZ": 106.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 37.5,
            "maxX": 52,
            "minZ": 111.325,
            "maxZ": 111.675,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 51.825,
            "maxX": 52.175,
            "minZ": 106,
            "maxZ": 111.5,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_031_a",
        "name": "b_031_a",
        "isEnterable": false,
        "baseY": -0.769,
        "floorHeight": 3.5,
        "floorsCount": 5,
        "roofY": 16.731,
        "facadeMaterial": "glass_and_concrete",
        "footprint": [
          {
            "x": 38,
            "z": 114.5
          },
          {
            "x": 43.5,
            "z": 114.5
          },
          {
            "x": 43.5,
            "z": 120.5
          },
          {
            "x": 38,
            "z": 120.5
          }
        ],
        "bounds": {
          "minX": 38,
          "maxX": 43.5,
          "minZ": 114.5,
          "maxZ": 120.5
        },
        "rects": [
          {
            "minX": 38,
            "maxX": 43.5,
            "minZ": 114.5,
            "maxZ": 120.5
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 37.825,
            "maxX": 38.175,
            "minZ": 114.5,
            "maxZ": 120.5,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 38,
            "maxX": 43.5,
            "minZ": 114.325,
            "maxZ": 114.675,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 38,
            "maxX": 43.5,
            "minZ": 120.325,
            "maxZ": 120.675,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 43.325,
            "maxX": 43.675,
            "minZ": 114.5,
            "maxZ": 120.5,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_031_b",
        "name": "b_031_b",
        "isEnterable": false,
        "baseY": -0.769,
        "floorHeight": 3,
        "floorsCount": 5,
        "roofY": 14.231,
        "facadeMaterial": "glass_and_concrete",
        "footprint": [
          {
            "x": 47.5,
            "z": 114.5
          },
          {
            "x": 52.5,
            "z": 114.5
          },
          {
            "x": 52.5,
            "z": 120.5
          },
          {
            "x": 47.5,
            "z": 120.5
          }
        ],
        "bounds": {
          "minX": 47.5,
          "maxX": 52.5,
          "minZ": 114.5,
          "maxZ": 120.5
        },
        "rects": [
          {
            "minX": 47.5,
            "maxX": 52.5,
            "minZ": 114.5,
            "maxZ": 120.5
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 47.325,
            "maxX": 47.675,
            "minZ": 114.5,
            "maxZ": 120.5,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 47.5,
            "maxX": 52.5,
            "minZ": 114.325,
            "maxZ": 114.675,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 47.5,
            "maxX": 52.5,
            "minZ": 120.325,
            "maxZ": 120.675,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 52.325,
            "maxX": 52.675,
            "minZ": 114.5,
            "maxZ": 120.5,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_032",
        "name": "b_032",
        "isEnterable": false,
        "baseY": -0.769,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 20.231,
        "facadeMaterial": "painted_brick",
        "footprint": [
          {
            "x": 71.5,
            "z": 106
          },
          {
            "x": 77.5,
            "z": 106
          },
          {
            "x": 77.5,
            "z": 111
          },
          {
            "x": 71.5,
            "z": 111
          }
        ],
        "bounds": {
          "minX": 71.5,
          "maxX": 77.5,
          "minZ": 106,
          "maxZ": 111
        },
        "rects": [
          {
            "minX": 71.5,
            "maxX": 77.5,
            "minZ": 106,
            "maxZ": 111
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 71.325,
            "maxX": 71.675,
            "minZ": 106,
            "maxZ": 111,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 71.5,
            "maxX": 77.5,
            "minZ": 105.825,
            "maxZ": 106.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 71.5,
            "maxX": 77.5,
            "minZ": 110.825,
            "maxZ": 111.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 77.325,
            "maxX": 77.675,
            "minZ": 106,
            "maxZ": 111,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_034",
        "name": "b_034",
        "isEnterable": false,
        "baseY": -0.769,
        "floorHeight": 3,
        "floorsCount": 3,
        "roofY": 8.231,
        "facadeMaterial": "glass_and_concrete",
        "footprint": [
          {
            "x": 71.5,
            "z": 114.5
          },
          {
            "x": 77,
            "z": 114.5
          },
          {
            "x": 77,
            "z": 120.5
          },
          {
            "x": 71.5,
            "z": 120.5
          }
        ],
        "bounds": {
          "minX": 71.5,
          "maxX": 77,
          "minZ": 114.5,
          "maxZ": 120.5
        },
        "rects": [
          {
            "minX": 71.5,
            "maxX": 77,
            "minZ": 114.5,
            "maxZ": 120.5
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 71.325,
            "maxX": 71.675,
            "minZ": 114.5,
            "maxZ": 120.5,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 71.5,
            "maxX": 77,
            "minZ": 114.325,
            "maxZ": 114.675,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 71.5,
            "maxX": 77,
            "minZ": 120.325,
            "maxZ": 120.675,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 76.825,
            "maxX": 77.175,
            "minZ": 114.5,
            "maxZ": 120.5,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_035",
        "name": "b_035",
        "isEnterable": false,
        "baseY": -0.769,
        "floorHeight": 3,
        "floorsCount": 6,
        "roofY": 17.231,
        "facadeMaterial": "painted_brick",
        "footprint": [
          {
            "x": 80.5,
            "z": 115
          },
          {
            "x": 86.5,
            "z": 115
          },
          {
            "x": 86.5,
            "z": 120
          },
          {
            "x": 80.5,
            "z": 120
          }
        ],
        "bounds": {
          "minX": 80.5,
          "maxX": 86.5,
          "minZ": 115,
          "maxZ": 120
        },
        "rects": [
          {
            "minX": 80.5,
            "maxX": 86.5,
            "minZ": 115,
            "maxZ": 120
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 80.325,
            "maxX": 80.675,
            "minZ": 115,
            "maxZ": 120,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 80.5,
            "maxX": 86.5,
            "minZ": 114.825,
            "maxZ": 115.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 80.5,
            "maxX": 86.5,
            "minZ": 119.825,
            "maxZ": 120.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 86.325,
            "maxX": 86.675,
            "minZ": 115,
            "maxZ": 120,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_037",
        "name": "b_037",
        "isEnterable": false,
        "baseY": -0.769,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 13.231,
        "facadeMaterial": "painted_brick",
        "footprint": [
          {
            "x": 114.5,
            "z": 105.5
          },
          {
            "x": 120,
            "z": 105.5
          },
          {
            "x": 120,
            "z": 111
          },
          {
            "x": 114.5,
            "z": 111
          }
        ],
        "bounds": {
          "minX": 114.5,
          "maxX": 120,
          "minZ": 105.5,
          "maxZ": 111
        },
        "rects": [
          {
            "minX": 114.5,
            "maxX": 120,
            "minZ": 105.5,
            "maxZ": 111
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 114.325,
            "maxX": 114.675,
            "minZ": 105.5,
            "maxZ": 111,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 114.5,
            "maxX": 120,
            "minZ": 105.325,
            "maxZ": 105.675,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 114.5,
            "maxX": 120,
            "minZ": 110.825,
            "maxZ": 111.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 119.825,
            "maxX": 120.175,
            "minZ": 105.5,
            "maxZ": 111,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_038",
        "name": "b_038",
        "isEnterable": false,
        "baseY": -0.769,
        "floorHeight": 3,
        "floorsCount": 4,
        "roofY": 11.231,
        "facadeMaterial": "rusted_metal",
        "footprint": [
          {
            "x": 105.5,
            "z": 115
          },
          {
            "x": 120,
            "z": 115
          },
          {
            "x": 120,
            "z": 120
          },
          {
            "x": 105.5,
            "z": 120
          }
        ],
        "bounds": {
          "minX": 105.5,
          "maxX": 120,
          "minZ": 115,
          "maxZ": 120
        },
        "rects": [
          {
            "minX": 105.5,
            "maxX": 120,
            "minZ": 115,
            "maxZ": 120
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 105.325,
            "maxX": 105.675,
            "minZ": 115,
            "maxZ": 120,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 105.5,
            "maxX": 120,
            "minZ": 114.825,
            "maxZ": 115.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 105.5,
            "maxX": 120,
            "minZ": 119.825,
            "maxZ": 120.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 119.825,
            "maxX": 120.175,
            "minZ": 115,
            "maxZ": 120,
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
        "id": "a_s_h1_0",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": -105.251,
            "maxX": -91.557,
            "minZ": -105.926,
            "maxZ": -91.268,
            "obb": {
              "cx": -98.404,
              "cz": -98.597,
              "hx": 5.25,
              "hz": 6,
              "c": 0.9510565162951535,
              "s": 0.3090169943749474
            },
            "cx": -98.404,
            "cz": -98.597,
            "yaw": 18,
            "length": 10.5,
            "width": 12,
            "axis": "x",
            "topY": 2.427,
            "bottomY": 1.827,
            "topAtMin": 2.427,
            "topAtMax": 2.427,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_a_s_h1_0_-91.6_-104.167",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -18,
            "position": {
              "x": -91.6,
              "y": 2.427,
              "z": -104.167
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_a_s_h1_0_-96.173_-90.091",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -18,
            "position": {
              "x": -96.173,
              "y": 2.427,
              "z": -90.091
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
        "id": "a_s_h1_1",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": -83.852,
            "maxX": -53.514,
            "minZ": -98.974,
            "maxZ": -78.908,
            "obb": {
              "cx": -68.683,
              "cz": -88.941,
              "hx": 14,
              "hz": 6,
              "c": 0.9510565162951535,
              "s": 0.3090169943749474
            },
            "cx": -68.683,
            "cz": -88.941,
            "yaw": 18,
            "length": 28,
            "width": 12,
            "axis": "x",
            "topY": 2.427,
            "bottomY": 1.827,
            "topAtMin": 2.427,
            "topAtMax": 2.427,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_a_s_h1_1_-70.201_-97.215",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -18,
            "position": {
              "x": -70.201,
              "y": 2.427,
              "z": -97.215
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_a_s_h1_1_-74.774_-83.139",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -18,
            "position": {
              "x": -74.774,
              "y": 2.427,
              "z": -83.139
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
        "id": "a_s_h1_2",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": -45.81,
            "maxX": -30.69,
            "minZ": -86.612,
            "maxZ": -71.492,
            "obb": {
              "cx": -38.25,
              "cz": -79.052,
              "hx": 6,
              "hz": 6,
              "c": 0.9510565162951535,
              "s": 0.3090169943749474
            },
            "cx": -38.25,
            "cz": -79.052,
            "yaw": 18,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": 2.427,
            "bottomY": 1.827,
            "topAtMin": 2.427,
            "topAtMax": 2.427,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_a_s_h1_2_-32.159_-84.854",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -18,
            "position": {
              "x": -32.159,
              "y": 2.427,
              "z": -84.854
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_a_s_h1_2_-36.732_-70.778",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -18,
            "position": {
              "x": -36.732,
              "y": 2.427,
              "z": -70.778
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
        "id": "a_s_h2",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": -96.213,
            "maxX": -65.875,
            "minZ": -60.931,
            "maxZ": -40.865,
            "obb": {
              "cx": -81.044,
              "cz": -50.898,
              "hx": 14,
              "hz": 6,
              "c": 0.9510565162951535,
              "s": 0.3090169943749474
            },
            "cx": -81.044,
            "cz": -50.898,
            "yaw": 18,
            "length": 28,
            "width": 12,
            "axis": "x",
            "topY": 2.427,
            "bottomY": 1.827,
            "topAtMin": 2.427,
            "topAtMax": 2.427,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_a_s_h2_-82.562_-59.172",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -18,
            "position": {
              "x": -82.562,
              "y": 2.427,
              "z": -59.172
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_a_s_h2_-87.135_-45.096",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -18,
            "position": {
              "x": -87.135,
              "y": 2.427,
              "z": -45.096
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
        "id": "a_s_v1_0",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": -91.556,
            "maxX": -76.436,
            "minZ": -114.094,
            "maxZ": -98.974,
            "obb": {
              "cx": -83.996,
              "cz": -106.534,
              "hx": 6,
              "hz": 6,
              "c": -0.30901699437494734,
              "s": 0.9510565162951536
            },
            "cx": -83.996,
            "cz": -106.534,
            "yaw": 108,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": 2.427,
            "bottomY": 1.827,
            "topAtMin": 2.427,
            "topAtMax": 2.427,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_a_s_v1_0_-78.194_-100.443",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -108,
            "position": {
              "x": -78.194,
              "y": 2.427,
              "z": -100.443
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_a_s_v1_0_-92.27_-105.016",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -108,
            "position": {
              "x": -92.27,
              "y": 2.427,
              "z": -105.016
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
        "id": "a_s_v1_1",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": -103.918,
            "maxX": -83.852,
            "minZ": -91.269,
            "maxZ": -60.931,
            "obb": {
              "cx": -93.885,
              "cz": -76.1,
              "hx": 14,
              "hz": 6,
              "c": -0.30901699437494734,
              "s": 0.9510565162951536
            },
            "cx": -93.885,
            "cz": -76.1,
            "yaw": 108,
            "length": 28,
            "width": 12,
            "axis": "x",
            "topY": 2.427,
            "bottomY": 1.827,
            "topAtMin": 2.427,
            "topAtMax": 2.427,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_a_s_v1_1_-85.611_-77.618",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -108,
            "position": {
              "x": -85.611,
              "y": 2.427,
              "z": -77.618
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_a_s_v1_1_-99.687_-82.191",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -108,
            "position": {
              "x": -99.687,
              "y": 2.427,
              "z": -82.191
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
        "id": "a_s_v2_0",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": -53.515,
            "maxX": -33.913,
            "minZ": -115.524,
            "maxZ": -86.612,
            "obb": {
              "cx": -43.714,
              "cz": -101.068,
              "hx": 13.25,
              "hz": 6,
              "c": -0.30901699437494734,
              "s": 0.9510565162951536
            },
            "cx": -43.714,
            "cz": -101.068,
            "yaw": 108,
            "length": 26.5,
            "width": 12,
            "axis": "x",
            "topY": 2.427,
            "bottomY": 1.827,
            "topAtMin": 2.427,
            "topAtMax": 2.427,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_a_s_v2_0_-35.672_-101.872",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -108,
            "position": {
              "x": -35.672,
              "y": 2.427,
              "z": -101.872
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_a_s_v2_0_-49.748_-106.446",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -108,
            "position": {
              "x": -49.748,
              "y": 2.427,
              "z": -106.446
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
        "id": "a_s_v2_1",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": -65.876,
            "maxX": -45.81,
            "minZ": -78.908,
            "maxZ": -48.57,
            "obb": {
              "cx": -55.843,
              "cz": -63.739,
              "hx": 14,
              "hz": 6,
              "c": -0.30901699437494734,
              "s": 0.9510565162951536
            },
            "cx": -55.843,
            "cz": -63.739,
            "yaw": 108,
            "length": 28,
            "width": 12,
            "axis": "x",
            "topY": 2.427,
            "bottomY": 1.827,
            "topAtMin": 2.427,
            "topAtMax": 2.427,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_a_s_v2_1_-47.569_-65.257",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -108,
            "position": {
              "x": -47.569,
              "y": 2.427,
              "z": -65.257
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_a_s_v2_1_-61.645_-69.83",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -108,
            "position": {
              "x": -61.645,
              "y": 2.427,
              "z": -69.83
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
        "id": "a_x1_1",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": -95.264,
            "maxX": -80.144,
            "minZ": -102.681,
            "maxZ": -87.561,
            "obb": {
              "cx": -87.704,
              "cz": -95.121,
              "hx": 6,
              "hz": 6,
              "c": 0.9510565162951535,
              "s": 0.3090169943749474
            },
            "cx": -87.704,
            "cz": -95.121,
            "yaw": 18,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": 2.427,
            "bottomY": 1.827,
            "topAtMin": 2.427,
            "topAtMax": 2.427,
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
        "id": "a_x2_1",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": -57.222,
            "maxX": -42.102,
            "minZ": -90.32,
            "maxZ": -75.2,
            "obb": {
              "cx": -49.662,
              "cz": -82.76,
              "hx": 6,
              "hz": 6,
              "c": 0.9510565162951535,
              "s": 0.3090169943749474
            },
            "cx": -49.662,
            "cz": -82.76,
            "yaw": 18,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": 2.427,
            "bottomY": 1.827,
            "topAtMin": 2.427,
            "topAtMax": 2.427,
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
        "id": "b_s_h0_0",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 34,
            "maxX": 56,
            "minZ": 22,
            "maxZ": 34,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_b_s_h0_0_44_20.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 44,
              "y": -0.649,
              "z": 20.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_b_s_h0_0_44_35.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 44,
              "y": -0.649,
              "z": 35.4
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
        "id": "b_s_h0_1",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 68,
            "maxX": 90,
            "minZ": 22,
            "maxZ": 34,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_b_s_h0_1_78_20.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 78,
              "y": -0.649,
              "z": 20.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_b_s_h0_1_78_35.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 78,
              "y": -0.649,
              "z": 35.4
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
        "id": "b_s_h0_2",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 102,
            "maxX": 124,
            "minZ": 22,
            "maxZ": 34,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_b_s_h0_2_112_20.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 112,
              "y": -0.649,
              "z": 20.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_b_s_h0_2_112_35.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 112,
              "y": -0.649,
              "z": 35.4
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
        "id": "b_s_h1_0",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 34,
            "maxX": 44.5,
            "minZ": 56,
            "maxZ": 68,
            "length": 10.5,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.603,
            "ramp": true,
            "rails": false
          },
          {
            "minX": 44.5,
            "maxX": 55,
            "minZ": 56,
            "maxZ": 68,
            "length": 10.5,
            "width": 12,
            "axis": "x",
            "topY": -0.603,
            "bottomY": -1.203,
            "topAtMin": -0.603,
            "topAtMax": -0.107,
            "ramp": true,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "b_s_h1_1",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 69,
            "maxX": 79.5,
            "minZ": 56,
            "maxZ": 68,
            "length": 10.5,
            "width": 12,
            "axis": "x",
            "topY": -0.603,
            "bottomY": -1.203,
            "topAtMin": -0.107,
            "topAtMax": -0.603,
            "ramp": true,
            "rails": false
          },
          {
            "minX": 79.5,
            "maxX": 90,
            "minZ": 56,
            "maxZ": 68,
            "length": 10.5,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.603,
            "topAtMax": -0.649,
            "ramp": true,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "b_s_h1_2",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 102,
            "maxX": 124,
            "minZ": 56,
            "maxZ": 68,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_b_s_h1_2_112_54.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 112,
              "y": -0.649,
              "z": 54.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_b_s_h1_2_112_69.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 112,
              "y": -0.649,
              "z": 69.4
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
        "id": "b_s_h2_0",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 34,
            "maxX": 56,
            "minZ": 90,
            "maxZ": 102,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_b_s_h2_0_44_88.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 44,
              "y": -0.649,
              "z": 88.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_b_s_h2_0_44_103.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 44,
              "y": -0.649,
              "z": 103.4
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
        "id": "b_s_h2_1",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 68,
            "maxX": 90,
            "minZ": 90,
            "maxZ": 102,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_b_s_h2_1_78_88.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 78,
              "y": -0.649,
              "z": 88.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_b_s_h2_1_78_103.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 78,
              "y": -0.649,
              "z": 103.4
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
        "id": "b_s_h2_2",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 102,
            "maxX": 124,
            "minZ": 90,
            "maxZ": 102,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_b_s_h2_2_112_88.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 112,
              "y": -0.649,
              "z": 88.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_b_s_h2_2_112_103.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 112,
              "y": -0.649,
              "z": 103.4
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
        "id": "b_s_h3_0",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 34,
            "maxX": 56,
            "minZ": 124,
            "maxZ": 136,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_b_s_h3_0_44_122.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 44,
              "y": -0.649,
              "z": 122.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_b_s_h3_0_44_137.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 44,
              "y": -0.649,
              "z": 137.4
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
        "id": "b_s_h3_1",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 68,
            "maxX": 90,
            "minZ": 124,
            "maxZ": 136,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_b_s_h3_1_78_122.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 78,
              "y": -0.649,
              "z": 122.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_b_s_h3_1_78_137.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 78,
              "y": -0.649,
              "z": 137.4
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
        "id": "b_s_h3_2",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 102,
            "maxX": 124,
            "minZ": 124,
            "maxZ": 136,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_b_s_h3_2_112_122.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 112,
              "y": -0.649,
              "z": 122.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_b_s_h3_2_112_137.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 112,
              "y": -0.649,
              "z": 137.4
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
        "id": "b_s_v0_0",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 22,
            "maxX": 34,
            "minZ": 34,
            "maxZ": 56,
            "obb": {
              "cx": 28,
              "cz": 45,
              "hx": 11,
              "hz": 6,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": 28,
            "cz": 45,
            "yaw": 90,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_b_s_v0_0_35.4_44",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 35.4,
              "y": -0.649,
              "z": 44
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_b_s_v0_0_20.6_44",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 20.6,
              "y": -0.649,
              "z": 44
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
        "id": "b_s_v0_1",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 22,
            "maxX": 34,
            "minZ": 68,
            "maxZ": 90,
            "obb": {
              "cx": 28,
              "cz": 79,
              "hx": 11,
              "hz": 6,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": 28,
            "cz": 79,
            "yaw": 90,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_b_s_v0_1_35.4_78",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 35.4,
              "y": -0.649,
              "z": 78
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_b_s_v0_1_20.6_78",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 20.6,
              "y": -0.649,
              "z": 78
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
        "id": "b_s_v0_2",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 22,
            "maxX": 34,
            "minZ": 102,
            "maxZ": 124,
            "obb": {
              "cx": 28,
              "cz": 113,
              "hx": 11,
              "hz": 6,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": 28,
            "cz": 113,
            "yaw": 90,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_b_s_v0_2_35.4_112",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 35.4,
              "y": -0.649,
              "z": 112
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_b_s_v0_2_20.6_112",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 20.6,
              "y": -0.649,
              "z": 112
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
        "id": "b_s_v1_0",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 56,
            "maxX": 68,
            "minZ": 34,
            "maxZ": 43.5,
            "obb": {
              "cx": 62,
              "cz": 38.75,
              "hx": 4.75,
              "hz": 6,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": 62,
            "cz": 38.75,
            "yaw": 90,
            "length": 9.5,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.563,
            "ramp": true,
            "rails": false
          },
          {
            "minX": 56,
            "maxX": 68,
            "minZ": 43.5,
            "maxZ": 53,
            "obb": {
              "cx": 62,
              "cz": 48.25,
              "hx": 4.75,
              "hz": 6,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": 62,
            "cz": 48.25,
            "yaw": 90,
            "length": 9.5,
            "width": 12,
            "axis": "x",
            "topY": -0.563,
            "bottomY": -1.163,
            "topAtMin": -0.563,
            "topAtMax": -0.107,
            "ramp": true,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": []
      },
      {
        "id": "b_s_v1_1",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 56,
            "maxX": 68,
            "minZ": 68,
            "maxZ": 79,
            "obb": {
              "cx": 62,
              "cz": 73.5,
              "hx": 5.5,
              "hz": 6,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": 62,
            "cz": 73.5,
            "yaw": 90,
            "length": 11,
            "width": 12,
            "axis": "x",
            "topY": -0.641,
            "bottomY": -1.241,
            "topAtMin": -0.129,
            "topAtMax": -0.641,
            "ramp": true,
            "rails": false
          },
          {
            "minX": 56,
            "maxX": 68,
            "minZ": 79,
            "maxZ": 90,
            "obb": {
              "cx": 62,
              "cz": 84.5,
              "hx": 5.5,
              "hz": 6,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": 62,
            "cz": 84.5,
            "yaw": 90,
            "length": 11,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.641,
            "topAtMax": -0.649,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_b_s_v1_1_69.4_89",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 69.4,
              "y": -0.649,
              "z": 89
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_b_s_v1_1_54.6_89",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 54.6,
              "y": -0.649,
              "z": 89
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
        "id": "b_s_v1_2",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 56,
            "maxX": 68,
            "minZ": 102,
            "maxZ": 124,
            "obb": {
              "cx": 62,
              "cz": 113,
              "hx": 11,
              "hz": 6,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": 62,
            "cz": 113,
            "yaw": 90,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_b_s_v1_2_69.4_112",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 69.4,
              "y": -0.649,
              "z": 112
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_b_s_v1_2_54.6_112",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 54.6,
              "y": -0.649,
              "z": 112
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
        "id": "b_s_v2_0",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 90,
            "maxX": 102,
            "minZ": 34,
            "maxZ": 56,
            "obb": {
              "cx": 96,
              "cz": 45,
              "hx": 11,
              "hz": 6,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": 96,
            "cz": 45,
            "yaw": 90,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_b_s_v2_0_103.4_44",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 103.4,
              "y": -0.649,
              "z": 44
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_b_s_v2_0_88.6_44",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 88.6,
              "y": -0.649,
              "z": 44
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
        "id": "b_s_v2_1",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 90,
            "maxX": 102,
            "minZ": 68,
            "maxZ": 90,
            "obb": {
              "cx": 96,
              "cz": 79,
              "hx": 11,
              "hz": 6,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": 96,
            "cz": 79,
            "yaw": 90,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_b_s_v2_1_103.4_78",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 103.4,
              "y": -0.649,
              "z": 78
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_b_s_v2_1_88.6_78",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 88.6,
              "y": -0.649,
              "z": 78
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
        "id": "b_s_v2_2",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 90,
            "maxX": 102,
            "minZ": 102,
            "maxZ": 124,
            "obb": {
              "cx": 96,
              "cz": 113,
              "hx": 11,
              "hz": 6,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": 96,
            "cz": 113,
            "yaw": 90,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_b_s_v2_2_103.4_112",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 103.4,
              "y": -0.649,
              "z": 112
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_b_s_v2_2_88.6_112",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 88.6,
              "y": -0.649,
              "z": 112
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
        "id": "b_s_v3_0",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 124,
            "maxX": 136,
            "minZ": 34,
            "maxZ": 56,
            "obb": {
              "cx": 130,
              "cz": 45,
              "hx": 11,
              "hz": 6,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": 130,
            "cz": 45,
            "yaw": 90,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_b_s_v3_0_137.4_44",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 137.4,
              "y": -0.649,
              "z": 44
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_b_s_v3_0_122.6_44",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 122.6,
              "y": -0.649,
              "z": 44
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
        "id": "b_s_v3_1",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 124,
            "maxX": 136,
            "minZ": 68,
            "maxZ": 90,
            "obb": {
              "cx": 130,
              "cz": 79,
              "hx": 11,
              "hz": 6,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": 130,
            "cz": 79,
            "yaw": 90,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_b_s_v3_1_137.4_78",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 137.4,
              "y": -0.649,
              "z": 78
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_b_s_v3_1_122.6_78",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 122.6,
              "y": -0.649,
              "z": 78
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
        "id": "b_s_v3_2",
        "type": "ground",
        "width": 12,
        "withLamps": true,
        "decks": [
          {
            "minX": 124,
            "maxX": 136,
            "minZ": 102,
            "maxZ": 124,
            "obb": {
              "cx": 130,
              "cz": 113,
              "hx": 11,
              "hz": 6,
              "c": 6.123233995736766e-17,
              "s": 1
            },
            "cx": 130,
            "cz": 113,
            "yaw": 90,
            "length": 22,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
            "ramp": false,
            "rails": false
          }
        ],
        "fill": [],
        "aprons": [],
        "pillars": [],
        "lamps": [
          {
            "id": "lamp_b_s_v3_2_137.4_112",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 137.4,
              "y": -0.649,
              "z": 112
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_b_s_v3_2_122.6_112",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": -90,
            "position": {
              "x": 122.6,
              "y": -0.649,
              "z": 112
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
        "id": "b_x0_0",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 22,
            "maxX": 34,
            "minZ": 22,
            "maxZ": 34,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
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
        "id": "b_x1_0",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 56,
            "maxX": 68,
            "minZ": 22,
            "maxZ": 34,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
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
        "id": "b_x2_0",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 90,
            "maxX": 102,
            "minZ": 22,
            "maxZ": 34,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
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
        "id": "b_x3_0",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 124,
            "maxX": 136,
            "minZ": 22,
            "maxZ": 34,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
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
        "id": "b_x0_1",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 22,
            "maxX": 34,
            "minZ": 56,
            "maxZ": 68,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
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
        "id": "b_x2_1",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 90,
            "maxX": 102,
            "minZ": 56,
            "maxZ": 68,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
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
        "id": "b_x3_1",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 124,
            "maxX": 136,
            "minZ": 56,
            "maxZ": 68,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
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
        "id": "b_x0_2",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 22,
            "maxX": 34,
            "minZ": 90,
            "maxZ": 102,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
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
        "id": "b_x1_2",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 56,
            "maxX": 68,
            "minZ": 90,
            "maxZ": 102,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
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
        "id": "b_x2_2",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 90,
            "maxX": 102,
            "minZ": 90,
            "maxZ": 102,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
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
        "id": "b_x3_2",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 124,
            "maxX": 136,
            "minZ": 90,
            "maxZ": 102,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
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
        "id": "b_x0_3",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 22,
            "maxX": 34,
            "minZ": 124,
            "maxZ": 136,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
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
        "id": "b_x1_3",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 56,
            "maxX": 68,
            "minZ": 124,
            "maxZ": 136,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
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
        "id": "b_x2_3",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 90,
            "maxX": 102,
            "minZ": 124,
            "maxZ": 136,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
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
        "id": "b_x3_3",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": 124,
            "maxX": 136,
            "minZ": 124,
            "maxZ": 136,
            "length": 12,
            "width": 12,
            "axis": "x",
            "topY": -0.649,
            "bottomY": -1.249,
            "topAtMin": -0.649,
            "topAtMax": -0.649,
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
    "props": [
      {
        "id": "lamp_a_s_h1_0_-91.6_-104.167",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -18,
        "position": {
          "x": -91.6,
          "y": 2.427,
          "z": -104.167
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_a_s_h1_0_-96.173_-90.091",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -18,
        "position": {
          "x": -96.173,
          "y": 2.427,
          "z": -90.091
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_a_s_h1_1_-70.201_-97.215",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -18,
        "position": {
          "x": -70.201,
          "y": 2.427,
          "z": -97.215
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_a_s_h1_1_-74.774_-83.139",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -18,
        "position": {
          "x": -74.774,
          "y": 2.427,
          "z": -83.139
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_a_s_h1_2_-32.159_-84.854",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -18,
        "position": {
          "x": -32.159,
          "y": 2.427,
          "z": -84.854
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_a_s_h1_2_-36.732_-70.778",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -18,
        "position": {
          "x": -36.732,
          "y": 2.427,
          "z": -70.778
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_a_s_h2_-82.562_-59.172",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -18,
        "position": {
          "x": -82.562,
          "y": 2.427,
          "z": -59.172
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_a_s_h2_-87.135_-45.096",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -18,
        "position": {
          "x": -87.135,
          "y": 2.427,
          "z": -45.096
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_a_s_v1_0_-78.194_-100.443",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -108,
        "position": {
          "x": -78.194,
          "y": 2.427,
          "z": -100.443
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_a_s_v1_0_-92.27_-105.016",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -108,
        "position": {
          "x": -92.27,
          "y": 2.427,
          "z": -105.016
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_a_s_v1_1_-85.611_-77.618",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -108,
        "position": {
          "x": -85.611,
          "y": 2.427,
          "z": -77.618
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_a_s_v1_1_-99.687_-82.191",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -108,
        "position": {
          "x": -99.687,
          "y": 2.427,
          "z": -82.191
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_a_s_v2_0_-35.672_-101.872",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -108,
        "position": {
          "x": -35.672,
          "y": 2.427,
          "z": -101.872
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_a_s_v2_0_-49.748_-106.446",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -108,
        "position": {
          "x": -49.748,
          "y": 2.427,
          "z": -106.446
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_a_s_v2_1_-47.569_-65.257",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -108,
        "position": {
          "x": -47.569,
          "y": 2.427,
          "z": -65.257
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_a_s_v2_1_-61.645_-69.83",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -108,
        "position": {
          "x": -61.645,
          "y": 2.427,
          "z": -69.83
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_h0_0_44_20.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 44,
          "y": -0.649,
          "z": 20.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_h0_0_44_35.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 44,
          "y": -0.649,
          "z": 35.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_h0_1_78_20.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 78,
          "y": -0.649,
          "z": 20.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_h0_1_78_35.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 78,
          "y": -0.649,
          "z": 35.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_h0_2_112_20.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 112,
          "y": -0.649,
          "z": 20.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_h0_2_112_35.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 112,
          "y": -0.649,
          "z": 35.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_h1_2_112_54.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 112,
          "y": -0.649,
          "z": 54.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_h1_2_112_69.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 112,
          "y": -0.649,
          "z": 69.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_h2_0_44_103.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 44,
          "y": -0.649,
          "z": 103.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_h2_0_44_88.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 44,
          "y": -0.649,
          "z": 88.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_h2_1_78_103.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 78,
          "y": -0.649,
          "z": 103.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_h2_1_78_88.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 78,
          "y": -0.649,
          "z": 88.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_h2_2_112_103.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 112,
          "y": -0.649,
          "z": 103.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_h2_2_112_88.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 112,
          "y": -0.649,
          "z": 88.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_h3_0_44_122.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 44,
          "y": -0.649,
          "z": 122.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_h3_0_44_137.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 44,
          "y": -0.649,
          "z": 137.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_h3_1_78_122.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 78,
          "y": -0.649,
          "z": 122.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_h3_1_78_137.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 78,
          "y": -0.649,
          "z": 137.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_h3_2_112_122.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 112,
          "y": -0.649,
          "z": 122.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_h3_2_112_137.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 112,
          "y": -0.649,
          "z": 137.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_v0_0_20.6_44",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 20.6,
          "y": -0.649,
          "z": 44
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_v0_0_35.4_44",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 35.4,
          "y": -0.649,
          "z": 44
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_v0_1_20.6_78",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 20.6,
          "y": -0.649,
          "z": 78
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_v0_1_35.4_78",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 35.4,
          "y": -0.649,
          "z": 78
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_v0_2_20.6_112",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 20.6,
          "y": -0.649,
          "z": 112
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_v0_2_35.4_112",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 35.4,
          "y": -0.649,
          "z": 112
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_v1_1_54.6_89",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 54.6,
          "y": -0.649,
          "z": 89
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_v1_1_69.4_89",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 69.4,
          "y": -0.649,
          "z": 89
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_v1_2_54.6_112",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 54.6,
          "y": -0.649,
          "z": 112
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_v1_2_69.4_112",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 69.4,
          "y": -0.649,
          "z": 112
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_v2_0_103.4_44",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 103.4,
          "y": -0.649,
          "z": 44
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_v2_0_88.6_44",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 88.6,
          "y": -0.649,
          "z": 44
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_v2_1_103.4_78",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 103.4,
          "y": -0.649,
          "z": 78
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_v2_1_88.6_78",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 88.6,
          "y": -0.649,
          "z": 78
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_v2_2_103.4_112",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 103.4,
          "y": -0.649,
          "z": 112
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_v2_2_88.6_112",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 88.6,
          "y": -0.649,
          "z": 112
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_v3_0_122.6_44",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 122.6,
          "y": -0.649,
          "z": 44
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_v3_0_137.4_44",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 137.4,
          "y": -0.649,
          "z": 44
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_v3_1_122.6_78",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 122.6,
          "y": -0.649,
          "z": 78
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_v3_1_137.4_78",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 137.4,
          "y": -0.649,
          "z": 78
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_v3_2_122.6_112",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 122.6,
          "y": -0.649,
          "z": 112
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_b_s_v3_2_137.4_112",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": -90,
        "position": {
          "x": 137.4,
          "y": -0.649,
          "z": 112
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      }
    ],
    "lights": []
  },
  "sky": {},
  "gameplay": {
    "goal": "exit",
    "exit": {
      "x": 100,
      "z": 100
    },
    "exitRadius": 4,
    "enemies": {
      "count": 2
    },
    "alienEnemies": {
      "count": 1
    }
  }
};
