/**
 * СГЕНЕРИРОВАННО — руками не править.
 *
 * Источник правки: probe/city.json. После его изменения запуск
 * `node tools/build-level.mjs probe/city.json` перезаписывает этот файл
 * побайтово одинаково (ГПСЧ в парсере нет, ключи объектов отсортированы).
 *
 * Тип карты — `kind: 'json'`: числа и топологию готовит Node-парсер
 * (замкнутые полигоны, союз прямоугольников footprint, абсолютные высоты
 * этажей, проступи лестниц, пластины настилов, автогенерированные опоры и
 * фонари, проёмы дверей), браузер строит из них только солиды, опоры,
 * навигацию и меш.
 */
export const CITY = {
  "name": "Зонд",
  "hint": "зонд масштаба",
  "map": {
    "kind": "json",
    "units": "meters",
    "ground": {
      "y": 0,
      "size": 600,
      "color": "#23262c"
    },
    "bounds": {
      "minX": -300,
      "maxX": 300,
      "minZ": -300,
      "maxZ": 300
    },
    "spawn": {
      "x": -20,
      "z": -20
    },
    "buildings": [
      {
        "id": "b_0",
        "name": "Block 0",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -258,
            "z": -294
          },
          {
            "x": -250,
            "z": -294
          },
          {
            "x": -250,
            "z": -286
          },
          {
            "x": -258,
            "z": -286
          }
        ],
        "bounds": {
          "minX": -258,
          "maxX": -250,
          "minZ": -294,
          "maxZ": -286
        },
        "rects": [
          {
            "minX": -258,
            "maxX": -250,
            "minZ": -294,
            "maxZ": -286
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -250.175,
            "maxX": -249.825,
            "minZ": -294,
            "maxZ": -286,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -258.175,
            "maxX": -257.825,
            "minZ": -294,
            "maxZ": -286,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -258,
            "maxX": -250,
            "minZ": -286.175,
            "maxZ": -285.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -258,
            "maxX": -250,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_1",
        "name": "Block 1",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -246,
            "z": -294
          },
          {
            "x": -236,
            "z": -294
          },
          {
            "x": -236,
            "z": -284
          },
          {
            "x": -246,
            "z": -284
          }
        ],
        "bounds": {
          "minX": -246,
          "maxX": -236,
          "minZ": -294,
          "maxZ": -284
        },
        "rects": [
          {
            "minX": -246,
            "maxX": -236,
            "minZ": -294,
            "maxZ": -284
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -236.175,
            "maxX": -235.825,
            "minZ": -294,
            "maxZ": -284,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -246.175,
            "maxX": -245.825,
            "minZ": -294,
            "maxZ": -284,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -246,
            "maxX": -236,
            "minZ": -284.175,
            "maxZ": -283.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -246,
            "maxX": -236,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_2",
        "name": "Block 2",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -234,
            "z": -294
          },
          {
            "x": -222,
            "z": -294
          },
          {
            "x": -222,
            "z": -282
          },
          {
            "x": -234,
            "z": -282
          }
        ],
        "bounds": {
          "minX": -234,
          "maxX": -222,
          "minZ": -294,
          "maxZ": -282
        },
        "rects": [
          {
            "minX": -234,
            "maxX": -222,
            "minZ": -294,
            "maxZ": -282
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -222.175,
            "maxX": -221.825,
            "minZ": -294,
            "maxZ": -282,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -234.175,
            "maxX": -233.825,
            "minZ": -294,
            "maxZ": -282,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -234,
            "maxX": -222,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -234,
            "maxX": -222,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_3",
        "name": "Block 3",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -222,
            "z": -294
          },
          {
            "x": -214,
            "z": -294
          },
          {
            "x": -214,
            "z": -280
          },
          {
            "x": -222,
            "z": -280
          }
        ],
        "bounds": {
          "minX": -222,
          "maxX": -214,
          "minZ": -294,
          "maxZ": -280
        },
        "rects": [
          {
            "minX": -222,
            "maxX": -214,
            "minZ": -294,
            "maxZ": -280
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -214.175,
            "maxX": -213.825,
            "minZ": -294,
            "maxZ": -280,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -222.175,
            "maxX": -221.825,
            "minZ": -294,
            "maxZ": -280,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -222,
            "maxX": -214,
            "minZ": -280.175,
            "maxZ": -279.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -222,
            "maxX": -214,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_4",
        "name": "Block 4",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -210,
            "z": -294
          },
          {
            "x": -200,
            "z": -294
          },
          {
            "x": -200,
            "z": -286
          },
          {
            "x": -210,
            "z": -286
          }
        ],
        "bounds": {
          "minX": -210,
          "maxX": -200,
          "minZ": -294,
          "maxZ": -286
        },
        "rects": [
          {
            "minX": -210,
            "maxX": -200,
            "minZ": -294,
            "maxZ": -286
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -200.175,
            "maxX": -199.825,
            "minZ": -294,
            "maxZ": -286,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -210.175,
            "maxX": -209.825,
            "minZ": -294,
            "maxZ": -286,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -210,
            "maxX": -200,
            "minZ": -286.175,
            "maxZ": -285.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -210,
            "maxX": -200,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_5",
        "name": "Block 5",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -198,
            "z": -294
          },
          {
            "x": -186,
            "z": -294
          },
          {
            "x": -186,
            "z": -284
          },
          {
            "x": -198,
            "z": -284
          }
        ],
        "bounds": {
          "minX": -198,
          "maxX": -186,
          "minZ": -294,
          "maxZ": -284
        },
        "rects": [
          {
            "minX": -198,
            "maxX": -186,
            "minZ": -294,
            "maxZ": -284
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -186.175,
            "maxX": -185.825,
            "minZ": -294,
            "maxZ": -284,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -198.175,
            "maxX": -197.825,
            "minZ": -294,
            "maxZ": -284,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -198,
            "maxX": -186,
            "minZ": -284.175,
            "maxZ": -283.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -198,
            "maxX": -186,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_6",
        "name": "Block 6",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -186,
            "z": -294
          },
          {
            "x": -178,
            "z": -294
          },
          {
            "x": -178,
            "z": -282
          },
          {
            "x": -186,
            "z": -282
          }
        ],
        "bounds": {
          "minX": -186,
          "maxX": -178,
          "minZ": -294,
          "maxZ": -282
        },
        "rects": [
          {
            "minX": -186,
            "maxX": -178,
            "minZ": -294,
            "maxZ": -282
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -178.175,
            "maxX": -177.825,
            "minZ": -294,
            "maxZ": -282,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -186.175,
            "maxX": -185.825,
            "minZ": -294,
            "maxZ": -282,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -186,
            "maxX": -178,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -186,
            "maxX": -178,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_7",
        "name": "Block 7",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -174,
            "z": -294
          },
          {
            "x": -164,
            "z": -294
          },
          {
            "x": -164,
            "z": -280
          },
          {
            "x": -174,
            "z": -280
          }
        ],
        "bounds": {
          "minX": -174,
          "maxX": -164,
          "minZ": -294,
          "maxZ": -280
        },
        "rects": [
          {
            "minX": -174,
            "maxX": -164,
            "minZ": -294,
            "maxZ": -280
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -164.175,
            "maxX": -163.825,
            "minZ": -294,
            "maxZ": -280,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -174.175,
            "maxX": -173.825,
            "minZ": -294,
            "maxZ": -280,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -174,
            "maxX": -164,
            "minZ": -280.175,
            "maxZ": -279.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -174,
            "maxX": -164,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_8",
        "name": "Block 8",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -126,
            "z": -294
          },
          {
            "x": -114,
            "z": -294
          },
          {
            "x": -114,
            "z": -280
          },
          {
            "x": -126,
            "z": -280
          }
        ],
        "bounds": {
          "minX": -126,
          "maxX": -114,
          "minZ": -294,
          "maxZ": -280
        },
        "rects": [
          {
            "minX": -126,
            "maxX": -114,
            "minZ": -294,
            "maxZ": -280
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -114.175,
            "maxX": -113.825,
            "minZ": -294,
            "maxZ": -280,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -126.175,
            "maxX": -125.825,
            "minZ": -294,
            "maxZ": -280,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -126,
            "maxX": -114,
            "minZ": -280.175,
            "maxZ": -279.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -126,
            "maxX": -114,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_9",
        "name": "Block 9",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -114,
            "z": -294
          },
          {
            "x": -106,
            "z": -294
          },
          {
            "x": -106,
            "z": -286
          },
          {
            "x": -114,
            "z": -286
          }
        ],
        "bounds": {
          "minX": -114,
          "maxX": -106,
          "minZ": -294,
          "maxZ": -286
        },
        "rects": [
          {
            "minX": -114,
            "maxX": -106,
            "minZ": -294,
            "maxZ": -286
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -106.175,
            "maxX": -105.825,
            "minZ": -294,
            "maxZ": -286,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -114.175,
            "maxX": -113.825,
            "minZ": -294,
            "maxZ": -286,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -114,
            "maxX": -106,
            "minZ": -286.175,
            "maxZ": -285.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -114,
            "maxX": -106,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_10",
        "name": "Block 10",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -102,
            "z": -294
          },
          {
            "x": -92,
            "z": -294
          },
          {
            "x": -92,
            "z": -284
          },
          {
            "x": -102,
            "z": -284
          }
        ],
        "bounds": {
          "minX": -102,
          "maxX": -92,
          "minZ": -294,
          "maxZ": -284
        },
        "rects": [
          {
            "minX": -102,
            "maxX": -92,
            "minZ": -294,
            "maxZ": -284
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -102.175,
            "maxX": -101.825,
            "minZ": -294,
            "maxZ": -284,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -102,
            "maxX": -92,
            "minZ": -284.175,
            "maxZ": -283.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -102,
            "maxX": -92,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -92.175,
            "maxX": -91.825,
            "minZ": -294,
            "maxZ": -284,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_11",
        "name": "Block 11",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -90,
            "z": -294
          },
          {
            "x": -78,
            "z": -294
          },
          {
            "x": -78,
            "z": -282
          },
          {
            "x": -90,
            "z": -282
          }
        ],
        "bounds": {
          "minX": -90,
          "maxX": -78,
          "minZ": -294,
          "maxZ": -282
        },
        "rects": [
          {
            "minX": -90,
            "maxX": -78,
            "minZ": -294,
            "maxZ": -282
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -78.175,
            "maxX": -77.825,
            "minZ": -294,
            "maxZ": -282,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -90.175,
            "maxX": -89.825,
            "minZ": -294,
            "maxZ": -282,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -90,
            "maxX": -78,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -90,
            "maxX": -78,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_12",
        "name": "Block 12",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -78,
            "z": -294
          },
          {
            "x": -70,
            "z": -294
          },
          {
            "x": -70,
            "z": -280
          },
          {
            "x": -78,
            "z": -280
          }
        ],
        "bounds": {
          "minX": -78,
          "maxX": -70,
          "minZ": -294,
          "maxZ": -280
        },
        "rects": [
          {
            "minX": -78,
            "maxX": -70,
            "minZ": -294,
            "maxZ": -280
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -70.175,
            "maxX": -69.825,
            "minZ": -294,
            "maxZ": -280,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -78.175,
            "maxX": -77.825,
            "minZ": -294,
            "maxZ": -280,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -78,
            "maxX": -70,
            "minZ": -280.175,
            "maxZ": -279.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -78,
            "maxX": -70,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_13",
        "name": "Block 13",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -66,
            "z": -294
          },
          {
            "x": -56,
            "z": -294
          },
          {
            "x": -56,
            "z": -286
          },
          {
            "x": -66,
            "z": -286
          }
        ],
        "bounds": {
          "minX": -66,
          "maxX": -56,
          "minZ": -294,
          "maxZ": -286
        },
        "rects": [
          {
            "minX": -66,
            "maxX": -56,
            "minZ": -294,
            "maxZ": -286
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -56.175,
            "maxX": -55.825,
            "minZ": -294,
            "maxZ": -286,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -66.175,
            "maxX": -65.825,
            "minZ": -294,
            "maxZ": -286,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -66,
            "maxX": -56,
            "minZ": -286.175,
            "maxZ": -285.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -66,
            "maxX": -56,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_14",
        "name": "Block 14",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -54,
            "z": -294
          },
          {
            "x": -42,
            "z": -294
          },
          {
            "x": -42,
            "z": -284
          },
          {
            "x": -54,
            "z": -284
          }
        ],
        "bounds": {
          "minX": -54,
          "maxX": -42,
          "minZ": -294,
          "maxZ": -284
        },
        "rects": [
          {
            "minX": -54,
            "maxX": -42,
            "minZ": -294,
            "maxZ": -284
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -42.175,
            "maxX": -41.825,
            "minZ": -294,
            "maxZ": -284,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -54.175,
            "maxX": -53.825,
            "minZ": -294,
            "maxZ": -284,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -54,
            "maxX": -42,
            "minZ": -284.175,
            "maxZ": -283.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -54,
            "maxX": -42,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_15",
        "name": "Block 15",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -42,
            "z": -294
          },
          {
            "x": -34,
            "z": -294
          },
          {
            "x": -34,
            "z": -282
          },
          {
            "x": -42,
            "z": -282
          }
        ],
        "bounds": {
          "minX": -42,
          "maxX": -34,
          "minZ": -294,
          "maxZ": -282
        },
        "rects": [
          {
            "minX": -42,
            "maxX": -34,
            "minZ": -294,
            "maxZ": -282
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -34.175,
            "maxX": -33.825,
            "minZ": -294,
            "maxZ": -282,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -42.175,
            "maxX": -41.825,
            "minZ": -294,
            "maxZ": -282,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -42,
            "maxX": -34,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -42,
            "maxX": -34,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_16",
        "name": "Block 16",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 6,
            "z": -294
          },
          {
            "x": 16,
            "z": -294
          },
          {
            "x": 16,
            "z": -282
          },
          {
            "x": 6,
            "z": -282
          }
        ],
        "bounds": {
          "minX": 6,
          "maxX": 16,
          "minZ": -294,
          "maxZ": -282
        },
        "rects": [
          {
            "minX": 6,
            "maxX": 16,
            "minZ": -294,
            "maxZ": -282
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 15.825,
            "maxX": 16.175,
            "minZ": -294,
            "maxZ": -282,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 5.825,
            "maxX": 6.175,
            "minZ": -294,
            "maxZ": -282,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 6,
            "maxX": 16,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 6,
            "maxX": 16,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_17",
        "name": "Block 17",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 18,
            "z": -294
          },
          {
            "x": 30,
            "z": -294
          },
          {
            "x": 30,
            "z": -280
          },
          {
            "x": 18,
            "z": -280
          }
        ],
        "bounds": {
          "minX": 18,
          "maxX": 30,
          "minZ": -294,
          "maxZ": -280
        },
        "rects": [
          {
            "minX": 18,
            "maxX": 30,
            "minZ": -294,
            "maxZ": -280
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 17.825,
            "maxX": 18.175,
            "minZ": -294,
            "maxZ": -280,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 18,
            "maxX": 30,
            "minZ": -280.175,
            "maxZ": -279.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 18,
            "maxX": 30,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 29.825,
            "maxX": 30.175,
            "minZ": -294,
            "maxZ": -280,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_18",
        "name": "Block 18",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 30,
            "z": -294
          },
          {
            "x": 38,
            "z": -294
          },
          {
            "x": 38,
            "z": -286
          },
          {
            "x": 30,
            "z": -286
          }
        ],
        "bounds": {
          "minX": 30,
          "maxX": 38,
          "minZ": -294,
          "maxZ": -286
        },
        "rects": [
          {
            "minX": 30,
            "maxX": 38,
            "minZ": -294,
            "maxZ": -286
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 29.825,
            "maxX": 30.175,
            "minZ": -294,
            "maxZ": -286,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 30,
            "maxX": 38,
            "minZ": -286.175,
            "maxZ": -285.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 30,
            "maxX": 38,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 37.825,
            "maxX": 38.175,
            "minZ": -294,
            "maxZ": -286,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_19",
        "name": "Block 19",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 42,
            "z": -294
          },
          {
            "x": 52,
            "z": -294
          },
          {
            "x": 52,
            "z": -284
          },
          {
            "x": 42,
            "z": -284
          }
        ],
        "bounds": {
          "minX": 42,
          "maxX": 52,
          "minZ": -294,
          "maxZ": -284
        },
        "rects": [
          {
            "minX": 42,
            "maxX": 52,
            "minZ": -294,
            "maxZ": -284
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 41.825,
            "maxX": 42.175,
            "minZ": -294,
            "maxZ": -284,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 42,
            "maxX": 52,
            "minZ": -284.175,
            "maxZ": -283.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 42,
            "maxX": 52,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 51.825,
            "maxX": 52.175,
            "minZ": -294,
            "maxZ": -284,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_20",
        "name": "Block 20",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 54,
            "z": -294
          },
          {
            "x": 66,
            "z": -294
          },
          {
            "x": 66,
            "z": -282
          },
          {
            "x": 54,
            "z": -282
          }
        ],
        "bounds": {
          "minX": 54,
          "maxX": 66,
          "minZ": -294,
          "maxZ": -282
        },
        "rects": [
          {
            "minX": 54,
            "maxX": 66,
            "minZ": -294,
            "maxZ": -282
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 53.825,
            "maxX": 54.175,
            "minZ": -294,
            "maxZ": -282,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 54,
            "maxX": 66,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 54,
            "maxX": 66,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 65.825,
            "maxX": 66.175,
            "minZ": -294,
            "maxZ": -282,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_21",
        "name": "Block 21",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 66,
            "z": -294
          },
          {
            "x": 74,
            "z": -294
          },
          {
            "x": 74,
            "z": -280
          },
          {
            "x": 66,
            "z": -280
          }
        ],
        "bounds": {
          "minX": 66,
          "maxX": 74,
          "minZ": -294,
          "maxZ": -280
        },
        "rects": [
          {
            "minX": 66,
            "maxX": 74,
            "minZ": -294,
            "maxZ": -280
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 65.825,
            "maxX": 66.175,
            "minZ": -294,
            "maxZ": -280,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 66,
            "maxX": 74,
            "minZ": -280.175,
            "maxZ": -279.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 66,
            "maxX": 74,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 73.825,
            "maxX": 74.175,
            "minZ": -294,
            "maxZ": -280,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_22",
        "name": "Block 22",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 78,
            "z": -294
          },
          {
            "x": 88,
            "z": -294
          },
          {
            "x": 88,
            "z": -286
          },
          {
            "x": 78,
            "z": -286
          }
        ],
        "bounds": {
          "minX": 78,
          "maxX": 88,
          "minZ": -294,
          "maxZ": -286
        },
        "rects": [
          {
            "minX": 78,
            "maxX": 88,
            "minZ": -294,
            "maxZ": -286
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 77.825,
            "maxX": 78.175,
            "minZ": -294,
            "maxZ": -286,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 78,
            "maxX": 88,
            "minZ": -286.175,
            "maxZ": -285.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 78,
            "maxX": 88,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 87.825,
            "maxX": 88.175,
            "minZ": -294,
            "maxZ": -286,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_23",
        "name": "Block 23",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 90,
            "z": -294
          },
          {
            "x": 102,
            "z": -294
          },
          {
            "x": 102,
            "z": -284
          },
          {
            "x": 90,
            "z": -284
          }
        ],
        "bounds": {
          "minX": 90,
          "maxX": 102,
          "minZ": -294,
          "maxZ": -284
        },
        "rects": [
          {
            "minX": 90,
            "maxX": 102,
            "minZ": -294,
            "maxZ": -284
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 101.825,
            "maxX": 102.175,
            "minZ": -294,
            "maxZ": -284,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 89.825,
            "maxX": 90.175,
            "minZ": -294,
            "maxZ": -284,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 90,
            "maxX": 102,
            "minZ": -284.175,
            "maxZ": -283.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 90,
            "maxX": 102,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_24",
        "name": "Block 24",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 138,
            "z": -294
          },
          {
            "x": 146,
            "z": -294
          },
          {
            "x": 146,
            "z": -284
          },
          {
            "x": 138,
            "z": -284
          }
        ],
        "bounds": {
          "minX": 138,
          "maxX": 146,
          "minZ": -294,
          "maxZ": -284
        },
        "rects": [
          {
            "minX": 138,
            "maxX": 146,
            "minZ": -294,
            "maxZ": -284
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 137.825,
            "maxX": 138.175,
            "minZ": -294,
            "maxZ": -284,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 138,
            "maxX": 146,
            "minZ": -284.175,
            "maxZ": -283.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 138,
            "maxX": 146,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 145.825,
            "maxX": 146.175,
            "minZ": -294,
            "maxZ": -284,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_25",
        "name": "Block 25",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 150,
            "z": -294
          },
          {
            "x": 160,
            "z": -294
          },
          {
            "x": 160,
            "z": -282
          },
          {
            "x": 150,
            "z": -282
          }
        ],
        "bounds": {
          "minX": 150,
          "maxX": 160,
          "minZ": -294,
          "maxZ": -282
        },
        "rects": [
          {
            "minX": 150,
            "maxX": 160,
            "minZ": -294,
            "maxZ": -282
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 149.825,
            "maxX": 150.175,
            "minZ": -294,
            "maxZ": -282,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 150,
            "maxX": 160,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 150,
            "maxX": 160,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 159.825,
            "maxX": 160.175,
            "minZ": -294,
            "maxZ": -282,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_26",
        "name": "Block 26",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 162,
            "z": -294
          },
          {
            "x": 174,
            "z": -294
          },
          {
            "x": 174,
            "z": -280
          },
          {
            "x": 162,
            "z": -280
          }
        ],
        "bounds": {
          "minX": 162,
          "maxX": 174,
          "minZ": -294,
          "maxZ": -280
        },
        "rects": [
          {
            "minX": 162,
            "maxX": 174,
            "minZ": -294,
            "maxZ": -280
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 161.825,
            "maxX": 162.175,
            "minZ": -294,
            "maxZ": -280,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 162,
            "maxX": 174,
            "minZ": -280.175,
            "maxZ": -279.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 162,
            "maxX": 174,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 173.825,
            "maxX": 174.175,
            "minZ": -294,
            "maxZ": -280,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_27",
        "name": "Block 27",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 174,
            "z": -294
          },
          {
            "x": 182,
            "z": -294
          },
          {
            "x": 182,
            "z": -286
          },
          {
            "x": 174,
            "z": -286
          }
        ],
        "bounds": {
          "minX": 174,
          "maxX": 182,
          "minZ": -294,
          "maxZ": -286
        },
        "rects": [
          {
            "minX": 174,
            "maxX": 182,
            "minZ": -294,
            "maxZ": -286
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 173.825,
            "maxX": 174.175,
            "minZ": -294,
            "maxZ": -286,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 174,
            "maxX": 182,
            "minZ": -286.175,
            "maxZ": -285.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 174,
            "maxX": 182,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 181.825,
            "maxX": 182.175,
            "minZ": -294,
            "maxZ": -286,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_28",
        "name": "Block 28",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 186,
            "z": -294
          },
          {
            "x": 196,
            "z": -294
          },
          {
            "x": 196,
            "z": -284
          },
          {
            "x": 186,
            "z": -284
          }
        ],
        "bounds": {
          "minX": 186,
          "maxX": 196,
          "minZ": -294,
          "maxZ": -284
        },
        "rects": [
          {
            "minX": 186,
            "maxX": 196,
            "minZ": -294,
            "maxZ": -284
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 185.825,
            "maxX": 186.175,
            "minZ": -294,
            "maxZ": -284,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 186,
            "maxX": 196,
            "minZ": -284.175,
            "maxZ": -283.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 186,
            "maxX": 196,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 195.825,
            "maxX": 196.175,
            "minZ": -294,
            "maxZ": -284,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_29",
        "name": "Block 29",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 198,
            "z": -294
          },
          {
            "x": 210,
            "z": -294
          },
          {
            "x": 210,
            "z": -282
          },
          {
            "x": 198,
            "z": -282
          }
        ],
        "bounds": {
          "minX": 198,
          "maxX": 210,
          "minZ": -294,
          "maxZ": -282
        },
        "rects": [
          {
            "minX": 198,
            "maxX": 210,
            "minZ": -294,
            "maxZ": -282
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 197.825,
            "maxX": 198.175,
            "minZ": -294,
            "maxZ": -282,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 198,
            "maxX": 210,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 198,
            "maxX": 210,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 209.825,
            "maxX": 210.175,
            "minZ": -294,
            "maxZ": -282,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_30",
        "name": "Block 30",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 210,
            "z": -294
          },
          {
            "x": 218,
            "z": -294
          },
          {
            "x": 218,
            "z": -280
          },
          {
            "x": 210,
            "z": -280
          }
        ],
        "bounds": {
          "minX": 210,
          "maxX": 218,
          "minZ": -294,
          "maxZ": -280
        },
        "rects": [
          {
            "minX": 210,
            "maxX": 218,
            "minZ": -294,
            "maxZ": -280
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 209.825,
            "maxX": 210.175,
            "minZ": -294,
            "maxZ": -280,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 210,
            "maxX": 218,
            "minZ": -280.175,
            "maxZ": -279.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 210,
            "maxX": 218,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 217.825,
            "maxX": 218.175,
            "minZ": -294,
            "maxZ": -280,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_31",
        "name": "Block 31",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 222,
            "z": -294
          },
          {
            "x": 232,
            "z": -294
          },
          {
            "x": 232,
            "z": -286
          },
          {
            "x": 222,
            "z": -286
          }
        ],
        "bounds": {
          "minX": 222,
          "maxX": 232,
          "minZ": -294,
          "maxZ": -286
        },
        "rects": [
          {
            "minX": 222,
            "maxX": 232,
            "minZ": -294,
            "maxZ": -286
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 221.825,
            "maxX": 222.175,
            "minZ": -294,
            "maxZ": -286,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 222,
            "maxX": 232,
            "minZ": -286.175,
            "maxZ": -285.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 222,
            "maxX": 232,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 231.825,
            "maxX": 232.175,
            "minZ": -294,
            "maxZ": -286,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_32",
        "name": "Block 32",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 270,
            "z": -294
          },
          {
            "x": 282,
            "z": -294
          },
          {
            "x": 282,
            "z": -286
          },
          {
            "x": 270,
            "z": -286
          }
        ],
        "bounds": {
          "minX": 270,
          "maxX": 282,
          "minZ": -294,
          "maxZ": -286
        },
        "rects": [
          {
            "minX": 270,
            "maxX": 282,
            "minZ": -294,
            "maxZ": -286
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 269.825,
            "maxX": 270.175,
            "minZ": -294,
            "maxZ": -286,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 270,
            "maxX": 282,
            "minZ": -286.175,
            "maxZ": -285.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 270,
            "maxX": 282,
            "minZ": -294.175,
            "maxZ": -293.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 281.825,
            "maxX": 282.175,
            "minZ": -294,
            "maxZ": -286,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_33",
        "name": "Block 33",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -294,
            "z": -282
          },
          {
            "x": -286,
            "z": -282
          },
          {
            "x": -286,
            "z": -272
          },
          {
            "x": -294,
            "z": -272
          }
        ],
        "bounds": {
          "minX": -294,
          "maxX": -286,
          "minZ": -282,
          "maxZ": -272
        },
        "rects": [
          {
            "minX": -294,
            "maxX": -286,
            "minZ": -282,
            "maxZ": -272
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -286.175,
            "maxX": -285.825,
            "minZ": -282,
            "maxZ": -272,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -294.175,
            "maxX": -293.825,
            "minZ": -282,
            "maxZ": -272,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -294,
            "maxX": -286,
            "minZ": -272.175,
            "maxZ": -271.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -294,
            "maxX": -286,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_34",
        "name": "Block 34",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -282,
            "z": -282
          },
          {
            "x": -272,
            "z": -282
          },
          {
            "x": -272,
            "z": -270
          },
          {
            "x": -282,
            "z": -270
          }
        ],
        "bounds": {
          "minX": -282,
          "maxX": -272,
          "minZ": -282,
          "maxZ": -270
        },
        "rects": [
          {
            "minX": -282,
            "maxX": -272,
            "minZ": -282,
            "maxZ": -270
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -272.175,
            "maxX": -271.825,
            "minZ": -282,
            "maxZ": -270,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -282.175,
            "maxX": -281.825,
            "minZ": -282,
            "maxZ": -270,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -282,
            "maxX": -272,
            "minZ": -270.175,
            "maxZ": -269.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -282,
            "maxX": -272,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_35",
        "name": "Block 35",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -270,
            "z": -282
          },
          {
            "x": -258,
            "z": -282
          },
          {
            "x": -258,
            "z": -268
          },
          {
            "x": -270,
            "z": -268
          }
        ],
        "bounds": {
          "minX": -270,
          "maxX": -258,
          "minZ": -282,
          "maxZ": -268
        },
        "rects": [
          {
            "minX": -270,
            "maxX": -258,
            "minZ": -282,
            "maxZ": -268
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -258.175,
            "maxX": -257.825,
            "minZ": -282,
            "maxZ": -268,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -270.175,
            "maxX": -269.825,
            "minZ": -282,
            "maxZ": -268,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -270,
            "maxX": -258,
            "minZ": -268.175,
            "maxZ": -267.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -270,
            "maxX": -258,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_36",
        "name": "Block 36",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -258,
            "z": -282
          },
          {
            "x": -250,
            "z": -282
          },
          {
            "x": -250,
            "z": -274
          },
          {
            "x": -258,
            "z": -274
          }
        ],
        "bounds": {
          "minX": -258,
          "maxX": -250,
          "minZ": -282,
          "maxZ": -274
        },
        "rects": [
          {
            "minX": -258,
            "maxX": -250,
            "minZ": -282,
            "maxZ": -274
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -250.175,
            "maxX": -249.825,
            "minZ": -282,
            "maxZ": -274,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -258.175,
            "maxX": -257.825,
            "minZ": -282,
            "maxZ": -274,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -258,
            "maxX": -250,
            "minZ": -274.175,
            "maxZ": -273.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -258,
            "maxX": -250,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_37",
        "name": "Block 37",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -246,
            "z": -282
          },
          {
            "x": -236,
            "z": -282
          },
          {
            "x": -236,
            "z": -272
          },
          {
            "x": -246,
            "z": -272
          }
        ],
        "bounds": {
          "minX": -246,
          "maxX": -236,
          "minZ": -282,
          "maxZ": -272
        },
        "rects": [
          {
            "minX": -246,
            "maxX": -236,
            "minZ": -282,
            "maxZ": -272
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -236.175,
            "maxX": -235.825,
            "minZ": -282,
            "maxZ": -272,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -246.175,
            "maxX": -245.825,
            "minZ": -282,
            "maxZ": -272,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -246,
            "maxX": -236,
            "minZ": -272.175,
            "maxZ": -271.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -246,
            "maxX": -236,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_38",
        "name": "Block 38",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -234,
            "z": -282
          },
          {
            "x": -222,
            "z": -282
          },
          {
            "x": -222,
            "z": -270
          },
          {
            "x": -234,
            "z": -270
          }
        ],
        "bounds": {
          "minX": -234,
          "maxX": -222,
          "minZ": -282,
          "maxZ": -270
        },
        "rects": [
          {
            "minX": -234,
            "maxX": -222,
            "minZ": -282,
            "maxZ": -270
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -222.175,
            "maxX": -221.825,
            "minZ": -282,
            "maxZ": -270,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -234.175,
            "maxX": -233.825,
            "minZ": -282,
            "maxZ": -270,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -234,
            "maxX": -222,
            "minZ": -270.175,
            "maxZ": -269.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -234,
            "maxX": -222,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_39",
        "name": "Block 39",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -222,
            "z": -282
          },
          {
            "x": -214,
            "z": -282
          },
          {
            "x": -214,
            "z": -268
          },
          {
            "x": -222,
            "z": -268
          }
        ],
        "bounds": {
          "minX": -222,
          "maxX": -214,
          "minZ": -282,
          "maxZ": -268
        },
        "rects": [
          {
            "minX": -222,
            "maxX": -214,
            "minZ": -282,
            "maxZ": -268
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -214.175,
            "maxX": -213.825,
            "minZ": -282,
            "maxZ": -268,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -222.175,
            "maxX": -221.825,
            "minZ": -282,
            "maxZ": -268,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -222,
            "maxX": -214,
            "minZ": -268.175,
            "maxZ": -267.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -222,
            "maxX": -214,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_40",
        "name": "Block 40",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -174,
            "z": -282
          },
          {
            "x": -164,
            "z": -282
          },
          {
            "x": -164,
            "z": -268
          },
          {
            "x": -174,
            "z": -268
          }
        ],
        "bounds": {
          "minX": -174,
          "maxX": -164,
          "minZ": -282,
          "maxZ": -268
        },
        "rects": [
          {
            "minX": -174,
            "maxX": -164,
            "minZ": -282,
            "maxZ": -268
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -164.175,
            "maxX": -163.825,
            "minZ": -282,
            "maxZ": -268,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -174.175,
            "maxX": -173.825,
            "minZ": -282,
            "maxZ": -268,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -174,
            "maxX": -164,
            "minZ": -268.175,
            "maxZ": -267.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -174,
            "maxX": -164,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_41",
        "name": "Block 41",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -162,
            "z": -282
          },
          {
            "x": -150,
            "z": -282
          },
          {
            "x": -150,
            "z": -274
          },
          {
            "x": -162,
            "z": -274
          }
        ],
        "bounds": {
          "minX": -162,
          "maxX": -150,
          "minZ": -282,
          "maxZ": -274
        },
        "rects": [
          {
            "minX": -162,
            "maxX": -150,
            "minZ": -282,
            "maxZ": -274
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -150.175,
            "maxX": -149.825,
            "minZ": -282,
            "maxZ": -274,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -162.175,
            "maxX": -161.825,
            "minZ": -282,
            "maxZ": -274,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -162,
            "maxX": -150,
            "minZ": -274.175,
            "maxZ": -273.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -162,
            "maxX": -150,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_42",
        "name": "Block 42",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -150,
            "z": -282
          },
          {
            "x": -142,
            "z": -282
          },
          {
            "x": -142,
            "z": -272
          },
          {
            "x": -150,
            "z": -272
          }
        ],
        "bounds": {
          "minX": -150,
          "maxX": -142,
          "minZ": -282,
          "maxZ": -272
        },
        "rects": [
          {
            "minX": -150,
            "maxX": -142,
            "minZ": -282,
            "maxZ": -272
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -142.175,
            "maxX": -141.825,
            "minZ": -282,
            "maxZ": -272,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -150.175,
            "maxX": -149.825,
            "minZ": -282,
            "maxZ": -272,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -150,
            "maxX": -142,
            "minZ": -272.175,
            "maxZ": -271.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -150,
            "maxX": -142,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_43",
        "name": "Block 43",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -138,
            "z": -282
          },
          {
            "x": -128,
            "z": -282
          },
          {
            "x": -128,
            "z": -270
          },
          {
            "x": -138,
            "z": -270
          }
        ],
        "bounds": {
          "minX": -138,
          "maxX": -128,
          "minZ": -282,
          "maxZ": -270
        },
        "rects": [
          {
            "minX": -138,
            "maxX": -128,
            "minZ": -282,
            "maxZ": -270
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -128.175,
            "maxX": -127.825,
            "minZ": -282,
            "maxZ": -270,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -138.175,
            "maxX": -137.825,
            "minZ": -282,
            "maxZ": -270,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -138,
            "maxX": -128,
            "minZ": -270.175,
            "maxZ": -269.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -138,
            "maxX": -128,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_44",
        "name": "Block 44",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -126,
            "z": -282
          },
          {
            "x": -114,
            "z": -282
          },
          {
            "x": -114,
            "z": -268
          },
          {
            "x": -126,
            "z": -268
          }
        ],
        "bounds": {
          "minX": -126,
          "maxX": -114,
          "minZ": -282,
          "maxZ": -268
        },
        "rects": [
          {
            "minX": -126,
            "maxX": -114,
            "minZ": -282,
            "maxZ": -268
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -114.175,
            "maxX": -113.825,
            "minZ": -282,
            "maxZ": -268,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -126.175,
            "maxX": -125.825,
            "minZ": -282,
            "maxZ": -268,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -126,
            "maxX": -114,
            "minZ": -268.175,
            "maxZ": -267.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -126,
            "maxX": -114,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_45",
        "name": "Block 45",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -114,
            "z": -282
          },
          {
            "x": -106,
            "z": -282
          },
          {
            "x": -106,
            "z": -274
          },
          {
            "x": -114,
            "z": -274
          }
        ],
        "bounds": {
          "minX": -114,
          "maxX": -106,
          "minZ": -282,
          "maxZ": -274
        },
        "rects": [
          {
            "minX": -114,
            "maxX": -106,
            "minZ": -282,
            "maxZ": -274
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -106.175,
            "maxX": -105.825,
            "minZ": -282,
            "maxZ": -274,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -114.175,
            "maxX": -113.825,
            "minZ": -282,
            "maxZ": -274,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -114,
            "maxX": -106,
            "minZ": -274.175,
            "maxZ": -273.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -114,
            "maxX": -106,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_46",
        "name": "Block 46",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -102,
            "z": -282
          },
          {
            "x": -92,
            "z": -282
          },
          {
            "x": -92,
            "z": -272
          },
          {
            "x": -102,
            "z": -272
          }
        ],
        "bounds": {
          "minX": -102,
          "maxX": -92,
          "minZ": -282,
          "maxZ": -272
        },
        "rects": [
          {
            "minX": -102,
            "maxX": -92,
            "minZ": -282,
            "maxZ": -272
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -102.175,
            "maxX": -101.825,
            "minZ": -282,
            "maxZ": -272,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -102,
            "maxX": -92,
            "minZ": -272.175,
            "maxZ": -271.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -102,
            "maxX": -92,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -92.175,
            "maxX": -91.825,
            "minZ": -282,
            "maxZ": -272,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_47",
        "name": "Block 47",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -90,
            "z": -282
          },
          {
            "x": -78,
            "z": -282
          },
          {
            "x": -78,
            "z": -270
          },
          {
            "x": -90,
            "z": -270
          }
        ],
        "bounds": {
          "minX": -90,
          "maxX": -78,
          "minZ": -282,
          "maxZ": -270
        },
        "rects": [
          {
            "minX": -90,
            "maxX": -78,
            "minZ": -282,
            "maxZ": -270
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -78.175,
            "maxX": -77.825,
            "minZ": -282,
            "maxZ": -270,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -90.175,
            "maxX": -89.825,
            "minZ": -282,
            "maxZ": -270,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -90,
            "maxX": -78,
            "minZ": -270.175,
            "maxZ": -269.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -90,
            "maxX": -78,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_48",
        "name": "Block 48",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -42,
            "z": -282
          },
          {
            "x": -34,
            "z": -282
          },
          {
            "x": -34,
            "z": -270
          },
          {
            "x": -42,
            "z": -270
          }
        ],
        "bounds": {
          "minX": -42,
          "maxX": -34,
          "minZ": -282,
          "maxZ": -270
        },
        "rects": [
          {
            "minX": -42,
            "maxX": -34,
            "minZ": -282,
            "maxZ": -270
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -34.175,
            "maxX": -33.825,
            "minZ": -282,
            "maxZ": -270,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -42.175,
            "maxX": -41.825,
            "minZ": -282,
            "maxZ": -270,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -42,
            "maxX": -34,
            "minZ": -270.175,
            "maxZ": -269.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -42,
            "maxX": -34,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_49",
        "name": "Block 49",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -30,
            "z": -282
          },
          {
            "x": -20,
            "z": -282
          },
          {
            "x": -20,
            "z": -268
          },
          {
            "x": -30,
            "z": -268
          }
        ],
        "bounds": {
          "minX": -30,
          "maxX": -20,
          "minZ": -282,
          "maxZ": -268
        },
        "rects": [
          {
            "minX": -30,
            "maxX": -20,
            "minZ": -282,
            "maxZ": -268
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -20.175,
            "maxX": -19.825,
            "minZ": -282,
            "maxZ": -268,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -30.175,
            "maxX": -29.825,
            "minZ": -282,
            "maxZ": -268,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -30,
            "maxX": -20,
            "minZ": -268.175,
            "maxZ": -267.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -30,
            "maxX": -20,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_50",
        "name": "Block 50",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -18,
            "z": -282
          },
          {
            "x": -6,
            "z": -282
          },
          {
            "x": -6,
            "z": -274
          },
          {
            "x": -18,
            "z": -274
          }
        ],
        "bounds": {
          "minX": -18,
          "maxX": -6,
          "minZ": -282,
          "maxZ": -274
        },
        "rects": [
          {
            "minX": -18,
            "maxX": -6,
            "minZ": -282,
            "maxZ": -274
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -18.175,
            "maxX": -17.825,
            "minZ": -282,
            "maxZ": -274,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -18,
            "maxX": -6,
            "minZ": -274.175,
            "maxZ": -273.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -18,
            "maxX": -6,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -6.175,
            "maxX": -5.825,
            "minZ": -282,
            "maxZ": -274,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_51",
        "name": "Block 51",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -6,
            "z": -282
          },
          {
            "x": 2,
            "z": -282
          },
          {
            "x": 2,
            "z": -272
          },
          {
            "x": -6,
            "z": -272
          }
        ],
        "bounds": {
          "minX": -6,
          "maxX": 2,
          "minZ": -282,
          "maxZ": -272
        },
        "rects": [
          {
            "minX": -6,
            "maxX": 2,
            "minZ": -282,
            "maxZ": -272
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -6.175,
            "maxX": -5.825,
            "minZ": -282,
            "maxZ": -272,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -6,
            "maxX": 2,
            "minZ": -272.175,
            "maxZ": -271.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -6,
            "maxX": 2,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 1.825,
            "maxX": 2.175,
            "minZ": -282,
            "maxZ": -272,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_52",
        "name": "Block 52",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 6,
            "z": -282
          },
          {
            "x": 16,
            "z": -282
          },
          {
            "x": 16,
            "z": -270
          },
          {
            "x": 6,
            "z": -270
          }
        ],
        "bounds": {
          "minX": 6,
          "maxX": 16,
          "minZ": -282,
          "maxZ": -270
        },
        "rects": [
          {
            "minX": 6,
            "maxX": 16,
            "minZ": -282,
            "maxZ": -270
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 15.825,
            "maxX": 16.175,
            "minZ": -282,
            "maxZ": -270,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 5.825,
            "maxX": 6.175,
            "minZ": -282,
            "maxZ": -270,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 6,
            "maxX": 16,
            "minZ": -270.175,
            "maxZ": -269.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 6,
            "maxX": 16,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_53",
        "name": "Block 53",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 18,
            "z": -282
          },
          {
            "x": 30,
            "z": -282
          },
          {
            "x": 30,
            "z": -268
          },
          {
            "x": 18,
            "z": -268
          }
        ],
        "bounds": {
          "minX": 18,
          "maxX": 30,
          "minZ": -282,
          "maxZ": -268
        },
        "rects": [
          {
            "minX": 18,
            "maxX": 30,
            "minZ": -282,
            "maxZ": -268
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 17.825,
            "maxX": 18.175,
            "minZ": -282,
            "maxZ": -268,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 18,
            "maxX": 30,
            "minZ": -268.175,
            "maxZ": -267.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 18,
            "maxX": 30,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 29.825,
            "maxX": 30.175,
            "minZ": -282,
            "maxZ": -268,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_54",
        "name": "Block 54",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 30,
            "z": -282
          },
          {
            "x": 38,
            "z": -282
          },
          {
            "x": 38,
            "z": -274
          },
          {
            "x": 30,
            "z": -274
          }
        ],
        "bounds": {
          "minX": 30,
          "maxX": 38,
          "minZ": -282,
          "maxZ": -274
        },
        "rects": [
          {
            "minX": 30,
            "maxX": 38,
            "minZ": -282,
            "maxZ": -274
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 29.825,
            "maxX": 30.175,
            "minZ": -282,
            "maxZ": -274,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 30,
            "maxX": 38,
            "minZ": -274.175,
            "maxZ": -273.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 30,
            "maxX": 38,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 37.825,
            "maxX": 38.175,
            "minZ": -282,
            "maxZ": -274,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_55",
        "name": "Block 55",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 42,
            "z": -282
          },
          {
            "x": 52,
            "z": -282
          },
          {
            "x": 52,
            "z": -272
          },
          {
            "x": 42,
            "z": -272
          }
        ],
        "bounds": {
          "minX": 42,
          "maxX": 52,
          "minZ": -282,
          "maxZ": -272
        },
        "rects": [
          {
            "minX": 42,
            "maxX": 52,
            "minZ": -282,
            "maxZ": -272
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 41.825,
            "maxX": 42.175,
            "minZ": -282,
            "maxZ": -272,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 42,
            "maxX": 52,
            "minZ": -272.175,
            "maxZ": -271.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 42,
            "maxX": 52,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 51.825,
            "maxX": 52.175,
            "minZ": -282,
            "maxZ": -272,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_56",
        "name": "Block 56",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 90,
            "z": -282
          },
          {
            "x": 102,
            "z": -282
          },
          {
            "x": 102,
            "z": -272
          },
          {
            "x": 90,
            "z": -272
          }
        ],
        "bounds": {
          "minX": 90,
          "maxX": 102,
          "minZ": -282,
          "maxZ": -272
        },
        "rects": [
          {
            "minX": 90,
            "maxX": 102,
            "minZ": -282,
            "maxZ": -272
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 101.825,
            "maxX": 102.175,
            "minZ": -282,
            "maxZ": -272,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 89.825,
            "maxX": 90.175,
            "minZ": -282,
            "maxZ": -272,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 90,
            "maxX": 102,
            "minZ": -272.175,
            "maxZ": -271.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 90,
            "maxX": 102,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_57",
        "name": "Block 57",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 102,
            "z": -282
          },
          {
            "x": 110,
            "z": -282
          },
          {
            "x": 110,
            "z": -270
          },
          {
            "x": 102,
            "z": -270
          }
        ],
        "bounds": {
          "minX": 102,
          "maxX": 110,
          "minZ": -282,
          "maxZ": -270
        },
        "rects": [
          {
            "minX": 102,
            "maxX": 110,
            "minZ": -282,
            "maxZ": -270
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 101.825,
            "maxX": 102.175,
            "minZ": -282,
            "maxZ": -270,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 102,
            "maxX": 110,
            "minZ": -270.175,
            "maxZ": -269.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 102,
            "maxX": 110,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 109.825,
            "maxX": 110.175,
            "minZ": -282,
            "maxZ": -270,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_58",
        "name": "Block 58",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 114,
            "z": -282
          },
          {
            "x": 124,
            "z": -282
          },
          {
            "x": 124,
            "z": -268
          },
          {
            "x": 114,
            "z": -268
          }
        ],
        "bounds": {
          "minX": 114,
          "maxX": 124,
          "minZ": -282,
          "maxZ": -268
        },
        "rects": [
          {
            "minX": 114,
            "maxX": 124,
            "minZ": -282,
            "maxZ": -268
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 113.825,
            "maxX": 114.175,
            "minZ": -282,
            "maxZ": -268,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 114,
            "maxX": 124,
            "minZ": -268.175,
            "maxZ": -267.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 114,
            "maxX": 124,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 123.825,
            "maxX": 124.175,
            "minZ": -282,
            "maxZ": -268,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_59",
        "name": "Block 59",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 126,
            "z": -282
          },
          {
            "x": 138,
            "z": -282
          },
          {
            "x": 138,
            "z": -274
          },
          {
            "x": 126,
            "z": -274
          }
        ],
        "bounds": {
          "minX": 126,
          "maxX": 138,
          "minZ": -282,
          "maxZ": -274
        },
        "rects": [
          {
            "minX": 126,
            "maxX": 138,
            "minZ": -282,
            "maxZ": -274
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 125.825,
            "maxX": 126.175,
            "minZ": -282,
            "maxZ": -274,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 126,
            "maxX": 138,
            "minZ": -274.175,
            "maxZ": -273.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 126,
            "maxX": 138,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 137.825,
            "maxX": 138.175,
            "minZ": -282,
            "maxZ": -274,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_60",
        "name": "Block 60",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 138,
            "z": -282
          },
          {
            "x": 146,
            "z": -282
          },
          {
            "x": 146,
            "z": -272
          },
          {
            "x": 138,
            "z": -272
          }
        ],
        "bounds": {
          "minX": 138,
          "maxX": 146,
          "minZ": -282,
          "maxZ": -272
        },
        "rects": [
          {
            "minX": 138,
            "maxX": 146,
            "minZ": -282,
            "maxZ": -272
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 137.825,
            "maxX": 138.175,
            "minZ": -282,
            "maxZ": -272,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 138,
            "maxX": 146,
            "minZ": -272.175,
            "maxZ": -271.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 138,
            "maxX": 146,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 145.825,
            "maxX": 146.175,
            "minZ": -282,
            "maxZ": -272,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_61",
        "name": "Block 61",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 150,
            "z": -282
          },
          {
            "x": 160,
            "z": -282
          },
          {
            "x": 160,
            "z": -270
          },
          {
            "x": 150,
            "z": -270
          }
        ],
        "bounds": {
          "minX": 150,
          "maxX": 160,
          "minZ": -282,
          "maxZ": -270
        },
        "rects": [
          {
            "minX": 150,
            "maxX": 160,
            "minZ": -282,
            "maxZ": -270
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 149.825,
            "maxX": 150.175,
            "minZ": -282,
            "maxZ": -270,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 150,
            "maxX": 160,
            "minZ": -270.175,
            "maxZ": -269.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 150,
            "maxX": 160,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 159.825,
            "maxX": 160.175,
            "minZ": -282,
            "maxZ": -270,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_62",
        "name": "Block 62",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 162,
            "z": -282
          },
          {
            "x": 174,
            "z": -282
          },
          {
            "x": 174,
            "z": -268
          },
          {
            "x": 162,
            "z": -268
          }
        ],
        "bounds": {
          "minX": 162,
          "maxX": 174,
          "minZ": -282,
          "maxZ": -268
        },
        "rects": [
          {
            "minX": 162,
            "maxX": 174,
            "minZ": -282,
            "maxZ": -268
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 161.825,
            "maxX": 162.175,
            "minZ": -282,
            "maxZ": -268,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 162,
            "maxX": 174,
            "minZ": -268.175,
            "maxZ": -267.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 162,
            "maxX": 174,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 173.825,
            "maxX": 174.175,
            "minZ": -282,
            "maxZ": -268,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_63",
        "name": "Block 63",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 174,
            "z": -282
          },
          {
            "x": 182,
            "z": -282
          },
          {
            "x": 182,
            "z": -274
          },
          {
            "x": 174,
            "z": -274
          }
        ],
        "bounds": {
          "minX": 174,
          "maxX": 182,
          "minZ": -282,
          "maxZ": -274
        },
        "rects": [
          {
            "minX": 174,
            "maxX": 182,
            "minZ": -282,
            "maxZ": -274
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 173.825,
            "maxX": 174.175,
            "minZ": -282,
            "maxZ": -274,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 174,
            "maxX": 182,
            "minZ": -274.175,
            "maxZ": -273.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 174,
            "maxX": 182,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 181.825,
            "maxX": 182.175,
            "minZ": -282,
            "maxZ": -274,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_64",
        "name": "Block 64",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 222,
            "z": -282
          },
          {
            "x": 232,
            "z": -282
          },
          {
            "x": 232,
            "z": -274
          },
          {
            "x": 222,
            "z": -274
          }
        ],
        "bounds": {
          "minX": 222,
          "maxX": 232,
          "minZ": -282,
          "maxZ": -274
        },
        "rects": [
          {
            "minX": 222,
            "maxX": 232,
            "minZ": -282,
            "maxZ": -274
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 221.825,
            "maxX": 222.175,
            "minZ": -282,
            "maxZ": -274,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 222,
            "maxX": 232,
            "minZ": -274.175,
            "maxZ": -273.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 222,
            "maxX": 232,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 231.825,
            "maxX": 232.175,
            "minZ": -282,
            "maxZ": -274,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_65",
        "name": "Block 65",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 234,
            "z": -282
          },
          {
            "x": 246,
            "z": -282
          },
          {
            "x": 246,
            "z": -272
          },
          {
            "x": 234,
            "z": -272
          }
        ],
        "bounds": {
          "minX": 234,
          "maxX": 246,
          "minZ": -282,
          "maxZ": -272
        },
        "rects": [
          {
            "minX": 234,
            "maxX": 246,
            "minZ": -282,
            "maxZ": -272
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 233.825,
            "maxX": 234.175,
            "minZ": -282,
            "maxZ": -272,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 234,
            "maxX": 246,
            "minZ": -272.175,
            "maxZ": -271.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 234,
            "maxX": 246,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 245.825,
            "maxX": 246.175,
            "minZ": -282,
            "maxZ": -272,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_66",
        "name": "Block 66",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 246,
            "z": -282
          },
          {
            "x": 254,
            "z": -282
          },
          {
            "x": 254,
            "z": -270
          },
          {
            "x": 246,
            "z": -270
          }
        ],
        "bounds": {
          "minX": 246,
          "maxX": 254,
          "minZ": -282,
          "maxZ": -270
        },
        "rects": [
          {
            "minX": 246,
            "maxX": 254,
            "minZ": -282,
            "maxZ": -270
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 245.825,
            "maxX": 246.175,
            "minZ": -282,
            "maxZ": -270,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 246,
            "maxX": 254,
            "minZ": -270.175,
            "maxZ": -269.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 246,
            "maxX": 254,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 253.825,
            "maxX": 254.175,
            "minZ": -282,
            "maxZ": -270,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_67",
        "name": "Block 67",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 258,
            "z": -282
          },
          {
            "x": 268,
            "z": -282
          },
          {
            "x": 268,
            "z": -268
          },
          {
            "x": 258,
            "z": -268
          }
        ],
        "bounds": {
          "minX": 258,
          "maxX": 268,
          "minZ": -282,
          "maxZ": -268
        },
        "rects": [
          {
            "minX": 258,
            "maxX": 268,
            "minZ": -282,
            "maxZ": -268
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 257.825,
            "maxX": 258.175,
            "minZ": -282,
            "maxZ": -268,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 258,
            "maxX": 268,
            "minZ": -268.175,
            "maxZ": -267.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 258,
            "maxX": 268,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 267.825,
            "maxX": 268.175,
            "minZ": -282,
            "maxZ": -268,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_68",
        "name": "Block 68",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 270,
            "z": -282
          },
          {
            "x": 282,
            "z": -282
          },
          {
            "x": 282,
            "z": -274
          },
          {
            "x": 270,
            "z": -274
          }
        ],
        "bounds": {
          "minX": 270,
          "maxX": 282,
          "minZ": -282,
          "maxZ": -274
        },
        "rects": [
          {
            "minX": 270,
            "maxX": 282,
            "minZ": -282,
            "maxZ": -274
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 269.825,
            "maxX": 270.175,
            "minZ": -282,
            "maxZ": -274,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 270,
            "maxX": 282,
            "minZ": -274.175,
            "maxZ": -273.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 270,
            "maxX": 282,
            "minZ": -282.175,
            "maxZ": -281.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 281.825,
            "maxX": 282.175,
            "minZ": -282,
            "maxZ": -274,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_69",
        "name": "Block 69",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -294,
            "z": -246
          },
          {
            "x": -286,
            "z": -246
          },
          {
            "x": -286,
            "z": -236
          },
          {
            "x": -294,
            "z": -236
          }
        ],
        "bounds": {
          "minX": -294,
          "maxX": -286,
          "minZ": -246,
          "maxZ": -236
        },
        "rects": [
          {
            "minX": -294,
            "maxX": -286,
            "minZ": -246,
            "maxZ": -236
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -286.175,
            "maxX": -285.825,
            "minZ": -246,
            "maxZ": -236,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -294.175,
            "maxX": -293.825,
            "minZ": -246,
            "maxZ": -236,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -294,
            "maxX": -286,
            "minZ": -236.175,
            "maxZ": -235.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -294,
            "maxX": -286,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_70",
        "name": "Block 70",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -282,
            "z": -246
          },
          {
            "x": -272,
            "z": -246
          },
          {
            "x": -272,
            "z": -234
          },
          {
            "x": -282,
            "z": -234
          }
        ],
        "bounds": {
          "minX": -282,
          "maxX": -272,
          "minZ": -246,
          "maxZ": -234
        },
        "rects": [
          {
            "minX": -282,
            "maxX": -272,
            "minZ": -246,
            "maxZ": -234
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -272.175,
            "maxX": -271.825,
            "minZ": -246,
            "maxZ": -234,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -282.175,
            "maxX": -281.825,
            "minZ": -246,
            "maxZ": -234,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -282,
            "maxX": -272,
            "minZ": -234.175,
            "maxZ": -233.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -282,
            "maxX": -272,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_71",
        "name": "Block 71",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -270,
            "z": -246
          },
          {
            "x": -258,
            "z": -246
          },
          {
            "x": -258,
            "z": -232
          },
          {
            "x": -270,
            "z": -232
          }
        ],
        "bounds": {
          "minX": -270,
          "maxX": -258,
          "minZ": -246,
          "maxZ": -232
        },
        "rects": [
          {
            "minX": -270,
            "maxX": -258,
            "minZ": -246,
            "maxZ": -232
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -258.175,
            "maxX": -257.825,
            "minZ": -246,
            "maxZ": -232,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -270.175,
            "maxX": -269.825,
            "minZ": -246,
            "maxZ": -232,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -270,
            "maxX": -258,
            "minZ": -232.175,
            "maxZ": -231.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -270,
            "maxX": -258,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_72",
        "name": "Block 72",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -258,
            "z": -246
          },
          {
            "x": -250,
            "z": -246
          },
          {
            "x": -250,
            "z": -238
          },
          {
            "x": -258,
            "z": -238
          }
        ],
        "bounds": {
          "minX": -258,
          "maxX": -250,
          "minZ": -246,
          "maxZ": -238
        },
        "rects": [
          {
            "minX": -258,
            "maxX": -250,
            "minZ": -246,
            "maxZ": -238
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -250.175,
            "maxX": -249.825,
            "minZ": -246,
            "maxZ": -238,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -258.175,
            "maxX": -257.825,
            "minZ": -246,
            "maxZ": -238,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -258,
            "maxX": -250,
            "minZ": -238.175,
            "maxZ": -237.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -258,
            "maxX": -250,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_73",
        "name": "Block 73",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -246,
            "z": -246
          },
          {
            "x": -236,
            "z": -246
          },
          {
            "x": -236,
            "z": -236
          },
          {
            "x": -246,
            "z": -236
          }
        ],
        "bounds": {
          "minX": -246,
          "maxX": -236,
          "minZ": -246,
          "maxZ": -236
        },
        "rects": [
          {
            "minX": -246,
            "maxX": -236,
            "minZ": -246,
            "maxZ": -236
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -236.175,
            "maxX": -235.825,
            "minZ": -246,
            "maxZ": -236,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -246.175,
            "maxX": -245.825,
            "minZ": -246,
            "maxZ": -236,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -246,
            "maxX": -236,
            "minZ": -236.175,
            "maxZ": -235.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -246,
            "maxX": -236,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_74",
        "name": "Block 74",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -234,
            "z": -246
          },
          {
            "x": -222,
            "z": -246
          },
          {
            "x": -222,
            "z": -234
          },
          {
            "x": -234,
            "z": -234
          }
        ],
        "bounds": {
          "minX": -234,
          "maxX": -222,
          "minZ": -246,
          "maxZ": -234
        },
        "rects": [
          {
            "minX": -234,
            "maxX": -222,
            "minZ": -246,
            "maxZ": -234
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -222.175,
            "maxX": -221.825,
            "minZ": -246,
            "maxZ": -234,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -234.175,
            "maxX": -233.825,
            "minZ": -246,
            "maxZ": -234,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -234,
            "maxX": -222,
            "minZ": -234.175,
            "maxZ": -233.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -234,
            "maxX": -222,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_75",
        "name": "Block 75",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -186,
            "z": -246
          },
          {
            "x": -178,
            "z": -246
          },
          {
            "x": -178,
            "z": -234
          },
          {
            "x": -186,
            "z": -234
          }
        ],
        "bounds": {
          "minX": -186,
          "maxX": -178,
          "minZ": -246,
          "maxZ": -234
        },
        "rects": [
          {
            "minX": -186,
            "maxX": -178,
            "minZ": -246,
            "maxZ": -234
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -178.175,
            "maxX": -177.825,
            "minZ": -246,
            "maxZ": -234,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -186.175,
            "maxX": -185.825,
            "minZ": -246,
            "maxZ": -234,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -186,
            "maxX": -178,
            "minZ": -234.175,
            "maxZ": -233.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -186,
            "maxX": -178,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_76",
        "name": "Block 76",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -174,
            "z": -246
          },
          {
            "x": -164,
            "z": -246
          },
          {
            "x": -164,
            "z": -232
          },
          {
            "x": -174,
            "z": -232
          }
        ],
        "bounds": {
          "minX": -174,
          "maxX": -164,
          "minZ": -246,
          "maxZ": -232
        },
        "rects": [
          {
            "minX": -174,
            "maxX": -164,
            "minZ": -246,
            "maxZ": -232
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -164.175,
            "maxX": -163.825,
            "minZ": -246,
            "maxZ": -232,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -174.175,
            "maxX": -173.825,
            "minZ": -246,
            "maxZ": -232,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -174,
            "maxX": -164,
            "minZ": -232.175,
            "maxZ": -231.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -174,
            "maxX": -164,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_77",
        "name": "Block 77",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -162,
            "z": -246
          },
          {
            "x": -150,
            "z": -246
          },
          {
            "x": -150,
            "z": -238
          },
          {
            "x": -162,
            "z": -238
          }
        ],
        "bounds": {
          "minX": -162,
          "maxX": -150,
          "minZ": -246,
          "maxZ": -238
        },
        "rects": [
          {
            "minX": -162,
            "maxX": -150,
            "minZ": -246,
            "maxZ": -238
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -150.175,
            "maxX": -149.825,
            "minZ": -246,
            "maxZ": -238,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -162.175,
            "maxX": -161.825,
            "minZ": -246,
            "maxZ": -238,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -162,
            "maxX": -150,
            "minZ": -238.175,
            "maxZ": -237.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -162,
            "maxX": -150,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_78",
        "name": "Block 78",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -150,
            "z": -246
          },
          {
            "x": -142,
            "z": -246
          },
          {
            "x": -142,
            "z": -236
          },
          {
            "x": -150,
            "z": -236
          }
        ],
        "bounds": {
          "minX": -150,
          "maxX": -142,
          "minZ": -246,
          "maxZ": -236
        },
        "rects": [
          {
            "minX": -150,
            "maxX": -142,
            "minZ": -246,
            "maxZ": -236
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -142.175,
            "maxX": -141.825,
            "minZ": -246,
            "maxZ": -236,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -150.175,
            "maxX": -149.825,
            "minZ": -246,
            "maxZ": -236,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -150,
            "maxX": -142,
            "minZ": -236.175,
            "maxZ": -235.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -150,
            "maxX": -142,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_79",
        "name": "Block 79",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -138,
            "z": -246
          },
          {
            "x": -128,
            "z": -246
          },
          {
            "x": -128,
            "z": -234
          },
          {
            "x": -138,
            "z": -234
          }
        ],
        "bounds": {
          "minX": -138,
          "maxX": -128,
          "minZ": -246,
          "maxZ": -234
        },
        "rects": [
          {
            "minX": -138,
            "maxX": -128,
            "minZ": -246,
            "maxZ": -234
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -128.175,
            "maxX": -127.825,
            "minZ": -246,
            "maxZ": -234,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -138.175,
            "maxX": -137.825,
            "minZ": -246,
            "maxZ": -234,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -138,
            "maxX": -128,
            "minZ": -234.175,
            "maxZ": -233.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -138,
            "maxX": -128,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_80",
        "name": "Block 80",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -126,
            "z": -246
          },
          {
            "x": -114,
            "z": -246
          },
          {
            "x": -114,
            "z": -232
          },
          {
            "x": -126,
            "z": -232
          }
        ],
        "bounds": {
          "minX": -126,
          "maxX": -114,
          "minZ": -246,
          "maxZ": -232
        },
        "rects": [
          {
            "minX": -126,
            "maxX": -114,
            "minZ": -246,
            "maxZ": -232
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -114.175,
            "maxX": -113.825,
            "minZ": -246,
            "maxZ": -232,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -126.175,
            "maxX": -125.825,
            "minZ": -246,
            "maxZ": -232,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -126,
            "maxX": -114,
            "minZ": -232.175,
            "maxZ": -231.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -126,
            "maxX": -114,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_81",
        "name": "Block 81",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -114,
            "z": -246
          },
          {
            "x": -106,
            "z": -246
          },
          {
            "x": -106,
            "z": -238
          },
          {
            "x": -114,
            "z": -238
          }
        ],
        "bounds": {
          "minX": -114,
          "maxX": -106,
          "minZ": -246,
          "maxZ": -238
        },
        "rects": [
          {
            "minX": -114,
            "maxX": -106,
            "minZ": -246,
            "maxZ": -238
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -106.175,
            "maxX": -105.825,
            "minZ": -246,
            "maxZ": -238,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -114.175,
            "maxX": -113.825,
            "minZ": -246,
            "maxZ": -238,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -114,
            "maxX": -106,
            "minZ": -238.175,
            "maxZ": -237.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -114,
            "maxX": -106,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_82",
        "name": "Block 82",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -102,
            "z": -246
          },
          {
            "x": -92,
            "z": -246
          },
          {
            "x": -92,
            "z": -236
          },
          {
            "x": -102,
            "z": -236
          }
        ],
        "bounds": {
          "minX": -102,
          "maxX": -92,
          "minZ": -246,
          "maxZ": -236
        },
        "rects": [
          {
            "minX": -102,
            "maxX": -92,
            "minZ": -246,
            "maxZ": -236
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -102.175,
            "maxX": -101.825,
            "minZ": -246,
            "maxZ": -236,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -102,
            "maxX": -92,
            "minZ": -236.175,
            "maxZ": -235.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -102,
            "maxX": -92,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -92.175,
            "maxX": -91.825,
            "minZ": -246,
            "maxZ": -236,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_83",
        "name": "Block 83",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -54,
            "z": -246
          },
          {
            "x": -42,
            "z": -246
          },
          {
            "x": -42,
            "z": -236
          },
          {
            "x": -54,
            "z": -236
          }
        ],
        "bounds": {
          "minX": -54,
          "maxX": -42,
          "minZ": -246,
          "maxZ": -236
        },
        "rects": [
          {
            "minX": -54,
            "maxX": -42,
            "minZ": -246,
            "maxZ": -236
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -42.175,
            "maxX": -41.825,
            "minZ": -246,
            "maxZ": -236,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -54.175,
            "maxX": -53.825,
            "minZ": -246,
            "maxZ": -236,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -54,
            "maxX": -42,
            "minZ": -236.175,
            "maxZ": -235.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -54,
            "maxX": -42,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_84",
        "name": "Block 84",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -42,
            "z": -246
          },
          {
            "x": -34,
            "z": -246
          },
          {
            "x": -34,
            "z": -234
          },
          {
            "x": -42,
            "z": -234
          }
        ],
        "bounds": {
          "minX": -42,
          "maxX": -34,
          "minZ": -246,
          "maxZ": -234
        },
        "rects": [
          {
            "minX": -42,
            "maxX": -34,
            "minZ": -246,
            "maxZ": -234
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -34.175,
            "maxX": -33.825,
            "minZ": -246,
            "maxZ": -234,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -42.175,
            "maxX": -41.825,
            "minZ": -246,
            "maxZ": -234,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -42,
            "maxX": -34,
            "minZ": -234.175,
            "maxZ": -233.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -42,
            "maxX": -34,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_85",
        "name": "Block 85",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -30,
            "z": -246
          },
          {
            "x": -20,
            "z": -246
          },
          {
            "x": -20,
            "z": -232
          },
          {
            "x": -30,
            "z": -232
          }
        ],
        "bounds": {
          "minX": -30,
          "maxX": -20,
          "minZ": -246,
          "maxZ": -232
        },
        "rects": [
          {
            "minX": -30,
            "maxX": -20,
            "minZ": -246,
            "maxZ": -232
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -20.175,
            "maxX": -19.825,
            "minZ": -246,
            "maxZ": -232,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -30.175,
            "maxX": -29.825,
            "minZ": -246,
            "maxZ": -232,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -30,
            "maxX": -20,
            "minZ": -232.175,
            "maxZ": -231.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -30,
            "maxX": -20,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_86",
        "name": "Block 86",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -18,
            "z": -246
          },
          {
            "x": -6,
            "z": -246
          },
          {
            "x": -6,
            "z": -238
          },
          {
            "x": -18,
            "z": -238
          }
        ],
        "bounds": {
          "minX": -18,
          "maxX": -6,
          "minZ": -246,
          "maxZ": -238
        },
        "rects": [
          {
            "minX": -18,
            "maxX": -6,
            "minZ": -246,
            "maxZ": -238
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -18.175,
            "maxX": -17.825,
            "minZ": -246,
            "maxZ": -238,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -18,
            "maxX": -6,
            "minZ": -238.175,
            "maxZ": -237.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -18,
            "maxX": -6,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -6.175,
            "maxX": -5.825,
            "minZ": -246,
            "maxZ": -238,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_87",
        "name": "Block 87",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -6,
            "z": -246
          },
          {
            "x": 2,
            "z": -246
          },
          {
            "x": 2,
            "z": -236
          },
          {
            "x": -6,
            "z": -236
          }
        ],
        "bounds": {
          "minX": -6,
          "maxX": 2,
          "minZ": -246,
          "maxZ": -236
        },
        "rects": [
          {
            "minX": -6,
            "maxX": 2,
            "minZ": -246,
            "maxZ": -236
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -6.175,
            "maxX": -5.825,
            "minZ": -246,
            "maxZ": -236,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -6,
            "maxX": 2,
            "minZ": -236.175,
            "maxZ": -235.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -6,
            "maxX": 2,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 1.825,
            "maxX": 2.175,
            "minZ": -246,
            "maxZ": -236,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_88",
        "name": "Block 88",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 6,
            "z": -246
          },
          {
            "x": 16,
            "z": -246
          },
          {
            "x": 16,
            "z": -234
          },
          {
            "x": 6,
            "z": -234
          }
        ],
        "bounds": {
          "minX": 6,
          "maxX": 16,
          "minZ": -246,
          "maxZ": -234
        },
        "rects": [
          {
            "minX": 6,
            "maxX": 16,
            "minZ": -246,
            "maxZ": -234
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 15.825,
            "maxX": 16.175,
            "minZ": -246,
            "maxZ": -234,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 5.825,
            "maxX": 6.175,
            "minZ": -246,
            "maxZ": -234,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 6,
            "maxX": 16,
            "minZ": -234.175,
            "maxZ": -233.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 6,
            "maxX": 16,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_89",
        "name": "Block 89",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 18,
            "z": -246
          },
          {
            "x": 30,
            "z": -246
          },
          {
            "x": 30,
            "z": -232
          },
          {
            "x": 18,
            "z": -232
          }
        ],
        "bounds": {
          "minX": 18,
          "maxX": 30,
          "minZ": -246,
          "maxZ": -232
        },
        "rects": [
          {
            "minX": 18,
            "maxX": 30,
            "minZ": -246,
            "maxZ": -232
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 17.825,
            "maxX": 18.175,
            "minZ": -246,
            "maxZ": -232,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 18,
            "maxX": 30,
            "minZ": -232.175,
            "maxZ": -231.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 18,
            "maxX": 30,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 29.825,
            "maxX": 30.175,
            "minZ": -246,
            "maxZ": -232,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_90",
        "name": "Block 90",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 30,
            "z": -246
          },
          {
            "x": 38,
            "z": -246
          },
          {
            "x": 38,
            "z": -238
          },
          {
            "x": 30,
            "z": -238
          }
        ],
        "bounds": {
          "minX": 30,
          "maxX": 38,
          "minZ": -246,
          "maxZ": -238
        },
        "rects": [
          {
            "minX": 30,
            "maxX": 38,
            "minZ": -246,
            "maxZ": -238
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 29.825,
            "maxX": 30.175,
            "minZ": -246,
            "maxZ": -238,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 30,
            "maxX": 38,
            "minZ": -238.175,
            "maxZ": -237.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 30,
            "maxX": 38,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 37.825,
            "maxX": 38.175,
            "minZ": -246,
            "maxZ": -238,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_91",
        "name": "Block 91",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 78,
            "z": -246
          },
          {
            "x": 88,
            "z": -246
          },
          {
            "x": 88,
            "z": -238
          },
          {
            "x": 78,
            "z": -238
          }
        ],
        "bounds": {
          "minX": 78,
          "maxX": 88,
          "minZ": -246,
          "maxZ": -238
        },
        "rects": [
          {
            "minX": 78,
            "maxX": 88,
            "minZ": -246,
            "maxZ": -238
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 77.825,
            "maxX": 78.175,
            "minZ": -246,
            "maxZ": -238,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 78,
            "maxX": 88,
            "minZ": -238.175,
            "maxZ": -237.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 78,
            "maxX": 88,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 87.825,
            "maxX": 88.175,
            "minZ": -246,
            "maxZ": -238,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_92",
        "name": "Block 92",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 90,
            "z": -246
          },
          {
            "x": 102,
            "z": -246
          },
          {
            "x": 102,
            "z": -236
          },
          {
            "x": 90,
            "z": -236
          }
        ],
        "bounds": {
          "minX": 90,
          "maxX": 102,
          "minZ": -246,
          "maxZ": -236
        },
        "rects": [
          {
            "minX": 90,
            "maxX": 102,
            "minZ": -246,
            "maxZ": -236
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 101.825,
            "maxX": 102.175,
            "minZ": -246,
            "maxZ": -236,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 89.825,
            "maxX": 90.175,
            "minZ": -246,
            "maxZ": -236,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 90,
            "maxX": 102,
            "minZ": -236.175,
            "maxZ": -235.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 90,
            "maxX": 102,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_93",
        "name": "Block 93",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 102,
            "z": -246
          },
          {
            "x": 110,
            "z": -246
          },
          {
            "x": 110,
            "z": -234
          },
          {
            "x": 102,
            "z": -234
          }
        ],
        "bounds": {
          "minX": 102,
          "maxX": 110,
          "minZ": -246,
          "maxZ": -234
        },
        "rects": [
          {
            "minX": 102,
            "maxX": 110,
            "minZ": -246,
            "maxZ": -234
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 101.825,
            "maxX": 102.175,
            "minZ": -246,
            "maxZ": -234,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 102,
            "maxX": 110,
            "minZ": -234.175,
            "maxZ": -233.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 102,
            "maxX": 110,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 109.825,
            "maxX": 110.175,
            "minZ": -246,
            "maxZ": -234,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_94",
        "name": "Block 94",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 114,
            "z": -246
          },
          {
            "x": 124,
            "z": -246
          },
          {
            "x": 124,
            "z": -232
          },
          {
            "x": 114,
            "z": -232
          }
        ],
        "bounds": {
          "minX": 114,
          "maxX": 124,
          "minZ": -246,
          "maxZ": -232
        },
        "rects": [
          {
            "minX": 114,
            "maxX": 124,
            "minZ": -246,
            "maxZ": -232
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 113.825,
            "maxX": 114.175,
            "minZ": -246,
            "maxZ": -232,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 114,
            "maxX": 124,
            "minZ": -232.175,
            "maxZ": -231.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 114,
            "maxX": 124,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 123.825,
            "maxX": 124.175,
            "minZ": -246,
            "maxZ": -232,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_95",
        "name": "Block 95",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 126,
            "z": -246
          },
          {
            "x": 138,
            "z": -246
          },
          {
            "x": 138,
            "z": -238
          },
          {
            "x": 126,
            "z": -238
          }
        ],
        "bounds": {
          "minX": 126,
          "maxX": 138,
          "minZ": -246,
          "maxZ": -238
        },
        "rects": [
          {
            "minX": 126,
            "maxX": 138,
            "minZ": -246,
            "maxZ": -238
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 125.825,
            "maxX": 126.175,
            "minZ": -246,
            "maxZ": -238,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 126,
            "maxX": 138,
            "minZ": -238.175,
            "maxZ": -237.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 126,
            "maxX": 138,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 137.825,
            "maxX": 138.175,
            "minZ": -246,
            "maxZ": -238,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_96",
        "name": "Block 96",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 138,
            "z": -246
          },
          {
            "x": 146,
            "z": -246
          },
          {
            "x": 146,
            "z": -236
          },
          {
            "x": 138,
            "z": -236
          }
        ],
        "bounds": {
          "minX": 138,
          "maxX": 146,
          "minZ": -246,
          "maxZ": -236
        },
        "rects": [
          {
            "minX": 138,
            "maxX": 146,
            "minZ": -246,
            "maxZ": -236
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 137.825,
            "maxX": 138.175,
            "minZ": -246,
            "maxZ": -236,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 138,
            "maxX": 146,
            "minZ": -236.175,
            "maxZ": -235.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 138,
            "maxX": 146,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 145.825,
            "maxX": 146.175,
            "minZ": -246,
            "maxZ": -236,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_97",
        "name": "Block 97",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 150,
            "z": -246
          },
          {
            "x": 160,
            "z": -246
          },
          {
            "x": 160,
            "z": -234
          },
          {
            "x": 150,
            "z": -234
          }
        ],
        "bounds": {
          "minX": 150,
          "maxX": 160,
          "minZ": -246,
          "maxZ": -234
        },
        "rects": [
          {
            "minX": 150,
            "maxX": 160,
            "minZ": -246,
            "maxZ": -234
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 149.825,
            "maxX": 150.175,
            "minZ": -246,
            "maxZ": -234,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 150,
            "maxX": 160,
            "minZ": -234.175,
            "maxZ": -233.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 150,
            "maxX": 160,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 159.825,
            "maxX": 160.175,
            "minZ": -246,
            "maxZ": -234,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_98",
        "name": "Block 98",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 162,
            "z": -246
          },
          {
            "x": 174,
            "z": -246
          },
          {
            "x": 174,
            "z": -232
          },
          {
            "x": 162,
            "z": -232
          }
        ],
        "bounds": {
          "minX": 162,
          "maxX": 174,
          "minZ": -246,
          "maxZ": -232
        },
        "rects": [
          {
            "minX": 162,
            "maxX": 174,
            "minZ": -246,
            "maxZ": -232
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 161.825,
            "maxX": 162.175,
            "minZ": -246,
            "maxZ": -232,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 162,
            "maxX": 174,
            "minZ": -232.175,
            "maxZ": -231.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 162,
            "maxX": 174,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 173.825,
            "maxX": 174.175,
            "minZ": -246,
            "maxZ": -232,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_99",
        "name": "Block 99",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 210,
            "z": -246
          },
          {
            "x": 218,
            "z": -246
          },
          {
            "x": 218,
            "z": -232
          },
          {
            "x": 210,
            "z": -232
          }
        ],
        "bounds": {
          "minX": 210,
          "maxX": 218,
          "minZ": -246,
          "maxZ": -232
        },
        "rects": [
          {
            "minX": 210,
            "maxX": 218,
            "minZ": -246,
            "maxZ": -232
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 209.825,
            "maxX": 210.175,
            "minZ": -246,
            "maxZ": -232,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 210,
            "maxX": 218,
            "minZ": -232.175,
            "maxZ": -231.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 210,
            "maxX": 218,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 217.825,
            "maxX": 218.175,
            "minZ": -246,
            "maxZ": -232,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_100",
        "name": "Block 100",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 222,
            "z": -246
          },
          {
            "x": 232,
            "z": -246
          },
          {
            "x": 232,
            "z": -238
          },
          {
            "x": 222,
            "z": -238
          }
        ],
        "bounds": {
          "minX": 222,
          "maxX": 232,
          "minZ": -246,
          "maxZ": -238
        },
        "rects": [
          {
            "minX": 222,
            "maxX": 232,
            "minZ": -246,
            "maxZ": -238
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 221.825,
            "maxX": 222.175,
            "minZ": -246,
            "maxZ": -238,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 222,
            "maxX": 232,
            "minZ": -238.175,
            "maxZ": -237.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 222,
            "maxX": 232,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 231.825,
            "maxX": 232.175,
            "minZ": -246,
            "maxZ": -238,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_101",
        "name": "Block 101",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 234,
            "z": -246
          },
          {
            "x": 246,
            "z": -246
          },
          {
            "x": 246,
            "z": -236
          },
          {
            "x": 234,
            "z": -236
          }
        ],
        "bounds": {
          "minX": 234,
          "maxX": 246,
          "minZ": -246,
          "maxZ": -236
        },
        "rects": [
          {
            "minX": 234,
            "maxX": 246,
            "minZ": -246,
            "maxZ": -236
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 233.825,
            "maxX": 234.175,
            "minZ": -246,
            "maxZ": -236,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 234,
            "maxX": 246,
            "minZ": -236.175,
            "maxZ": -235.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 234,
            "maxX": 246,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 245.825,
            "maxX": 246.175,
            "minZ": -246,
            "maxZ": -236,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_102",
        "name": "Block 102",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 246,
            "z": -246
          },
          {
            "x": 254,
            "z": -246
          },
          {
            "x": 254,
            "z": -234
          },
          {
            "x": 246,
            "z": -234
          }
        ],
        "bounds": {
          "minX": 246,
          "maxX": 254,
          "minZ": -246,
          "maxZ": -234
        },
        "rects": [
          {
            "minX": 246,
            "maxX": 254,
            "minZ": -246,
            "maxZ": -234
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 245.825,
            "maxX": 246.175,
            "minZ": -246,
            "maxZ": -234,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 246,
            "maxX": 254,
            "minZ": -234.175,
            "maxZ": -233.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 246,
            "maxX": 254,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 253.825,
            "maxX": 254.175,
            "minZ": -246,
            "maxZ": -234,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_103",
        "name": "Block 103",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 258,
            "z": -246
          },
          {
            "x": 268,
            "z": -246
          },
          {
            "x": 268,
            "z": -232
          },
          {
            "x": 258,
            "z": -232
          }
        ],
        "bounds": {
          "minX": 258,
          "maxX": 268,
          "minZ": -246,
          "maxZ": -232
        },
        "rects": [
          {
            "minX": 258,
            "maxX": 268,
            "minZ": -246,
            "maxZ": -232
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 257.825,
            "maxX": 258.175,
            "minZ": -246,
            "maxZ": -232,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 258,
            "maxX": 268,
            "minZ": -232.175,
            "maxZ": -231.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 258,
            "maxX": 268,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 267.825,
            "maxX": 268.175,
            "minZ": -246,
            "maxZ": -232,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_104",
        "name": "Block 104",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 270,
            "z": -246
          },
          {
            "x": 282,
            "z": -246
          },
          {
            "x": 282,
            "z": -238
          },
          {
            "x": 270,
            "z": -238
          }
        ],
        "bounds": {
          "minX": 270,
          "maxX": 282,
          "minZ": -246,
          "maxZ": -238
        },
        "rects": [
          {
            "minX": 270,
            "maxX": 282,
            "minZ": -246,
            "maxZ": -238
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 269.825,
            "maxX": 270.175,
            "minZ": -246,
            "maxZ": -238,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 270,
            "maxX": 282,
            "minZ": -238.175,
            "maxZ": -237.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 270,
            "maxX": 282,
            "minZ": -246.175,
            "maxZ": -245.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 281.825,
            "maxX": 282.175,
            "minZ": -246,
            "maxZ": -238,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_105",
        "name": "Block 105",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -294,
            "z": -210
          },
          {
            "x": -286,
            "z": -210
          },
          {
            "x": -286,
            "z": -200
          },
          {
            "x": -294,
            "z": -200
          }
        ],
        "bounds": {
          "minX": -294,
          "maxX": -286,
          "minZ": -210,
          "maxZ": -200
        },
        "rects": [
          {
            "minX": -294,
            "maxX": -286,
            "minZ": -210,
            "maxZ": -200
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -286.175,
            "maxX": -285.825,
            "minZ": -210,
            "maxZ": -200,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -294.175,
            "maxX": -293.825,
            "minZ": -210,
            "maxZ": -200,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -294,
            "maxX": -286,
            "minZ": -200.175,
            "maxZ": -199.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -294,
            "maxX": -286,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_106",
        "name": "Block 106",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -282,
            "z": -210
          },
          {
            "x": -272,
            "z": -210
          },
          {
            "x": -272,
            "z": -198
          },
          {
            "x": -282,
            "z": -198
          }
        ],
        "bounds": {
          "minX": -282,
          "maxX": -272,
          "minZ": -210,
          "maxZ": -198
        },
        "rects": [
          {
            "minX": -282,
            "maxX": -272,
            "minZ": -210,
            "maxZ": -198
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -272.175,
            "maxX": -271.825,
            "minZ": -210,
            "maxZ": -198,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -282.175,
            "maxX": -281.825,
            "minZ": -210,
            "maxZ": -198,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -282,
            "maxX": -272,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -282,
            "maxX": -272,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_107",
        "name": "Block 107",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -270,
            "z": -210
          },
          {
            "x": -258,
            "z": -210
          },
          {
            "x": -258,
            "z": -196
          },
          {
            "x": -270,
            "z": -196
          }
        ],
        "bounds": {
          "minX": -270,
          "maxX": -258,
          "minZ": -210,
          "maxZ": -196
        },
        "rects": [
          {
            "minX": -270,
            "maxX": -258,
            "minZ": -210,
            "maxZ": -196
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -258.175,
            "maxX": -257.825,
            "minZ": -210,
            "maxZ": -196,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -270.175,
            "maxX": -269.825,
            "minZ": -210,
            "maxZ": -196,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -270,
            "maxX": -258,
            "minZ": -196.175,
            "maxZ": -195.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -270,
            "maxX": -258,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_108",
        "name": "Block 108",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -258,
            "z": -210
          },
          {
            "x": -250,
            "z": -210
          },
          {
            "x": -250,
            "z": -202
          },
          {
            "x": -258,
            "z": -202
          }
        ],
        "bounds": {
          "minX": -258,
          "maxX": -250,
          "minZ": -210,
          "maxZ": -202
        },
        "rects": [
          {
            "minX": -258,
            "maxX": -250,
            "minZ": -210,
            "maxZ": -202
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -250.175,
            "maxX": -249.825,
            "minZ": -210,
            "maxZ": -202,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -258.175,
            "maxX": -257.825,
            "minZ": -210,
            "maxZ": -202,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -258,
            "maxX": -250,
            "minZ": -202.175,
            "maxZ": -201.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -258,
            "maxX": -250,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_109",
        "name": "Block 109",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -246,
            "z": -210
          },
          {
            "x": -236,
            "z": -210
          },
          {
            "x": -236,
            "z": -200
          },
          {
            "x": -246,
            "z": -200
          }
        ],
        "bounds": {
          "minX": -246,
          "maxX": -236,
          "minZ": -210,
          "maxZ": -200
        },
        "rects": [
          {
            "minX": -246,
            "maxX": -236,
            "minZ": -210,
            "maxZ": -200
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -236.175,
            "maxX": -235.825,
            "minZ": -210,
            "maxZ": -200,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -246.175,
            "maxX": -245.825,
            "minZ": -210,
            "maxZ": -200,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -246,
            "maxX": -236,
            "minZ": -200.175,
            "maxZ": -199.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -246,
            "maxX": -236,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_110",
        "name": "Block 110",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -198,
            "z": -210
          },
          {
            "x": -186,
            "z": -210
          },
          {
            "x": -186,
            "z": -200
          },
          {
            "x": -198,
            "z": -200
          }
        ],
        "bounds": {
          "minX": -198,
          "maxX": -186,
          "minZ": -210,
          "maxZ": -200
        },
        "rects": [
          {
            "minX": -198,
            "maxX": -186,
            "minZ": -210,
            "maxZ": -200
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -186.175,
            "maxX": -185.825,
            "minZ": -210,
            "maxZ": -200,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -198.175,
            "maxX": -197.825,
            "minZ": -210,
            "maxZ": -200,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -198,
            "maxX": -186,
            "minZ": -200.175,
            "maxZ": -199.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -198,
            "maxX": -186,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_111",
        "name": "Block 111",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -186,
            "z": -210
          },
          {
            "x": -178,
            "z": -210
          },
          {
            "x": -178,
            "z": -198
          },
          {
            "x": -186,
            "z": -198
          }
        ],
        "bounds": {
          "minX": -186,
          "maxX": -178,
          "minZ": -210,
          "maxZ": -198
        },
        "rects": [
          {
            "minX": -186,
            "maxX": -178,
            "minZ": -210,
            "maxZ": -198
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -178.175,
            "maxX": -177.825,
            "minZ": -210,
            "maxZ": -198,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -186.175,
            "maxX": -185.825,
            "minZ": -210,
            "maxZ": -198,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -186,
            "maxX": -178,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -186,
            "maxX": -178,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_112",
        "name": "Block 112",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -174,
            "z": -210
          },
          {
            "x": -164,
            "z": -210
          },
          {
            "x": -164,
            "z": -196
          },
          {
            "x": -174,
            "z": -196
          }
        ],
        "bounds": {
          "minX": -174,
          "maxX": -164,
          "minZ": -210,
          "maxZ": -196
        },
        "rects": [
          {
            "minX": -174,
            "maxX": -164,
            "minZ": -210,
            "maxZ": -196
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -164.175,
            "maxX": -163.825,
            "minZ": -210,
            "maxZ": -196,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -174.175,
            "maxX": -173.825,
            "minZ": -210,
            "maxZ": -196,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -174,
            "maxX": -164,
            "minZ": -196.175,
            "maxZ": -195.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -174,
            "maxX": -164,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_113",
        "name": "Block 113",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -162,
            "z": -210
          },
          {
            "x": -150,
            "z": -210
          },
          {
            "x": -150,
            "z": -202
          },
          {
            "x": -162,
            "z": -202
          }
        ],
        "bounds": {
          "minX": -162,
          "maxX": -150,
          "minZ": -210,
          "maxZ": -202
        },
        "rects": [
          {
            "minX": -162,
            "maxX": -150,
            "minZ": -210,
            "maxZ": -202
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -150.175,
            "maxX": -149.825,
            "minZ": -210,
            "maxZ": -202,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -162.175,
            "maxX": -161.825,
            "minZ": -210,
            "maxZ": -202,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -162,
            "maxX": -150,
            "minZ": -202.175,
            "maxZ": -201.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -162,
            "maxX": -150,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_114",
        "name": "Block 114",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -150,
            "z": -210
          },
          {
            "x": -142,
            "z": -210
          },
          {
            "x": -142,
            "z": -200
          },
          {
            "x": -150,
            "z": -200
          }
        ],
        "bounds": {
          "minX": -150,
          "maxX": -142,
          "minZ": -210,
          "maxZ": -200
        },
        "rects": [
          {
            "minX": -150,
            "maxX": -142,
            "minZ": -210,
            "maxZ": -200
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -142.175,
            "maxX": -141.825,
            "minZ": -210,
            "maxZ": -200,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -150.175,
            "maxX": -149.825,
            "minZ": -210,
            "maxZ": -200,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -150,
            "maxX": -142,
            "minZ": -200.175,
            "maxZ": -199.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -150,
            "maxX": -142,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_115",
        "name": "Block 115",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -138,
            "z": -210
          },
          {
            "x": -128,
            "z": -210
          },
          {
            "x": -128,
            "z": -198
          },
          {
            "x": -138,
            "z": -198
          }
        ],
        "bounds": {
          "minX": -138,
          "maxX": -128,
          "minZ": -210,
          "maxZ": -198
        },
        "rects": [
          {
            "minX": -138,
            "maxX": -128,
            "minZ": -210,
            "maxZ": -198
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -128.175,
            "maxX": -127.825,
            "minZ": -210,
            "maxZ": -198,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -138.175,
            "maxX": -137.825,
            "minZ": -210,
            "maxZ": -198,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -138,
            "maxX": -128,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -138,
            "maxX": -128,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_116",
        "name": "Block 116",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -126,
            "z": -210
          },
          {
            "x": -114,
            "z": -210
          },
          {
            "x": -114,
            "z": -196
          },
          {
            "x": -126,
            "z": -196
          }
        ],
        "bounds": {
          "minX": -126,
          "maxX": -114,
          "minZ": -210,
          "maxZ": -196
        },
        "rects": [
          {
            "minX": -126,
            "maxX": -114,
            "minZ": -210,
            "maxZ": -196
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -114.175,
            "maxX": -113.825,
            "minZ": -210,
            "maxZ": -196,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -126.175,
            "maxX": -125.825,
            "minZ": -210,
            "maxZ": -196,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -126,
            "maxX": -114,
            "minZ": -196.175,
            "maxZ": -195.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -126,
            "maxX": -114,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_117",
        "name": "Block 117",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -114,
            "z": -210
          },
          {
            "x": -106,
            "z": -210
          },
          {
            "x": -106,
            "z": -202
          },
          {
            "x": -114,
            "z": -202
          }
        ],
        "bounds": {
          "minX": -114,
          "maxX": -106,
          "minZ": -210,
          "maxZ": -202
        },
        "rects": [
          {
            "minX": -114,
            "maxX": -106,
            "minZ": -210,
            "maxZ": -202
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -106.175,
            "maxX": -105.825,
            "minZ": -210,
            "maxZ": -202,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -114.175,
            "maxX": -113.825,
            "minZ": -210,
            "maxZ": -202,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -114,
            "maxX": -106,
            "minZ": -202.175,
            "maxZ": -201.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -114,
            "maxX": -106,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_118",
        "name": "Block 118",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -66,
            "z": -210
          },
          {
            "x": -56,
            "z": -210
          },
          {
            "x": -56,
            "z": -202
          },
          {
            "x": -66,
            "z": -202
          }
        ],
        "bounds": {
          "minX": -66,
          "maxX": -56,
          "minZ": -210,
          "maxZ": -202
        },
        "rects": [
          {
            "minX": -66,
            "maxX": -56,
            "minZ": -210,
            "maxZ": -202
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -56.175,
            "maxX": -55.825,
            "minZ": -210,
            "maxZ": -202,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -66.175,
            "maxX": -65.825,
            "minZ": -210,
            "maxZ": -202,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -66,
            "maxX": -56,
            "minZ": -202.175,
            "maxZ": -201.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -66,
            "maxX": -56,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_119",
        "name": "Block 119",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -54,
            "z": -210
          },
          {
            "x": -42,
            "z": -210
          },
          {
            "x": -42,
            "z": -200
          },
          {
            "x": -54,
            "z": -200
          }
        ],
        "bounds": {
          "minX": -54,
          "maxX": -42,
          "minZ": -210,
          "maxZ": -200
        },
        "rects": [
          {
            "minX": -54,
            "maxX": -42,
            "minZ": -210,
            "maxZ": -200
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -42.175,
            "maxX": -41.825,
            "minZ": -210,
            "maxZ": -200,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -54.175,
            "maxX": -53.825,
            "minZ": -210,
            "maxZ": -200,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -54,
            "maxX": -42,
            "minZ": -200.175,
            "maxZ": -199.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -54,
            "maxX": -42,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_120",
        "name": "Block 120",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -42,
            "z": -210
          },
          {
            "x": -34,
            "z": -210
          },
          {
            "x": -34,
            "z": -198
          },
          {
            "x": -42,
            "z": -198
          }
        ],
        "bounds": {
          "minX": -42,
          "maxX": -34,
          "minZ": -210,
          "maxZ": -198
        },
        "rects": [
          {
            "minX": -42,
            "maxX": -34,
            "minZ": -210,
            "maxZ": -198
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -34.175,
            "maxX": -33.825,
            "minZ": -210,
            "maxZ": -198,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -42.175,
            "maxX": -41.825,
            "minZ": -210,
            "maxZ": -198,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -42,
            "maxX": -34,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -42,
            "maxX": -34,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_121",
        "name": "Block 121",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -30,
            "z": -210
          },
          {
            "x": -20,
            "z": -210
          },
          {
            "x": -20,
            "z": -196
          },
          {
            "x": -30,
            "z": -196
          }
        ],
        "bounds": {
          "minX": -30,
          "maxX": -20,
          "minZ": -210,
          "maxZ": -196
        },
        "rects": [
          {
            "minX": -30,
            "maxX": -20,
            "minZ": -210,
            "maxZ": -196
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -20.175,
            "maxX": -19.825,
            "minZ": -210,
            "maxZ": -196,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -30.175,
            "maxX": -29.825,
            "minZ": -210,
            "maxZ": -196,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -30,
            "maxX": -20,
            "minZ": -196.175,
            "maxZ": -195.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -30,
            "maxX": -20,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_122",
        "name": "Block 122",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -18,
            "z": -210
          },
          {
            "x": -6,
            "z": -210
          },
          {
            "x": -6,
            "z": -202
          },
          {
            "x": -18,
            "z": -202
          }
        ],
        "bounds": {
          "minX": -18,
          "maxX": -6,
          "minZ": -210,
          "maxZ": -202
        },
        "rects": [
          {
            "minX": -18,
            "maxX": -6,
            "minZ": -210,
            "maxZ": -202
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -18.175,
            "maxX": -17.825,
            "minZ": -210,
            "maxZ": -202,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -18,
            "maxX": -6,
            "minZ": -202.175,
            "maxZ": -201.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -18,
            "maxX": -6,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -6.175,
            "maxX": -5.825,
            "minZ": -210,
            "maxZ": -202,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_123",
        "name": "Block 123",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -6,
            "z": -210
          },
          {
            "x": 2,
            "z": -210
          },
          {
            "x": 2,
            "z": -200
          },
          {
            "x": -6,
            "z": -200
          }
        ],
        "bounds": {
          "minX": -6,
          "maxX": 2,
          "minZ": -210,
          "maxZ": -200
        },
        "rects": [
          {
            "minX": -6,
            "maxX": 2,
            "minZ": -210,
            "maxZ": -200
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -6.175,
            "maxX": -5.825,
            "minZ": -210,
            "maxZ": -200,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -6,
            "maxX": 2,
            "minZ": -200.175,
            "maxZ": -199.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -6,
            "maxX": 2,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 1.825,
            "maxX": 2.175,
            "minZ": -210,
            "maxZ": -200,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_124",
        "name": "Block 124",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 6,
            "z": -210
          },
          {
            "x": 16,
            "z": -210
          },
          {
            "x": 16,
            "z": -198
          },
          {
            "x": 6,
            "z": -198
          }
        ],
        "bounds": {
          "minX": 6,
          "maxX": 16,
          "minZ": -210,
          "maxZ": -198
        },
        "rects": [
          {
            "minX": 6,
            "maxX": 16,
            "minZ": -210,
            "maxZ": -198
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 15.825,
            "maxX": 16.175,
            "minZ": -210,
            "maxZ": -198,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 5.825,
            "maxX": 6.175,
            "minZ": -210,
            "maxZ": -198,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 6,
            "maxX": 16,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 6,
            "maxX": 16,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_125",
        "name": "Block 125",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 18,
            "z": -210
          },
          {
            "x": 30,
            "z": -210
          },
          {
            "x": 30,
            "z": -196
          },
          {
            "x": 18,
            "z": -196
          }
        ],
        "bounds": {
          "minX": 18,
          "maxX": 30,
          "minZ": -210,
          "maxZ": -196
        },
        "rects": [
          {
            "minX": 18,
            "maxX": 30,
            "minZ": -210,
            "maxZ": -196
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 17.825,
            "maxX": 18.175,
            "minZ": -210,
            "maxZ": -196,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 18,
            "maxX": 30,
            "minZ": -196.175,
            "maxZ": -195.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 18,
            "maxX": 30,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 29.825,
            "maxX": 30.175,
            "minZ": -210,
            "maxZ": -196,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_126",
        "name": "Block 126",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 66,
            "z": -210
          },
          {
            "x": 74,
            "z": -210
          },
          {
            "x": 74,
            "z": -196
          },
          {
            "x": 66,
            "z": -196
          }
        ],
        "bounds": {
          "minX": 66,
          "maxX": 74,
          "minZ": -210,
          "maxZ": -196
        },
        "rects": [
          {
            "minX": 66,
            "maxX": 74,
            "minZ": -210,
            "maxZ": -196
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 65.825,
            "maxX": 66.175,
            "minZ": -210,
            "maxZ": -196,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 66,
            "maxX": 74,
            "minZ": -196.175,
            "maxZ": -195.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 66,
            "maxX": 74,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 73.825,
            "maxX": 74.175,
            "minZ": -210,
            "maxZ": -196,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_127",
        "name": "Block 127",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 78,
            "z": -210
          },
          {
            "x": 88,
            "z": -210
          },
          {
            "x": 88,
            "z": -202
          },
          {
            "x": 78,
            "z": -202
          }
        ],
        "bounds": {
          "minX": 78,
          "maxX": 88,
          "minZ": -210,
          "maxZ": -202
        },
        "rects": [
          {
            "minX": 78,
            "maxX": 88,
            "minZ": -210,
            "maxZ": -202
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 77.825,
            "maxX": 78.175,
            "minZ": -210,
            "maxZ": -202,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 78,
            "maxX": 88,
            "minZ": -202.175,
            "maxZ": -201.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 78,
            "maxX": 88,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 87.825,
            "maxX": 88.175,
            "minZ": -210,
            "maxZ": -202,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_128",
        "name": "Block 128",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 90,
            "z": -210
          },
          {
            "x": 102,
            "z": -210
          },
          {
            "x": 102,
            "z": -200
          },
          {
            "x": 90,
            "z": -200
          }
        ],
        "bounds": {
          "minX": 90,
          "maxX": 102,
          "minZ": -210,
          "maxZ": -200
        },
        "rects": [
          {
            "minX": 90,
            "maxX": 102,
            "minZ": -210,
            "maxZ": -200
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 101.825,
            "maxX": 102.175,
            "minZ": -210,
            "maxZ": -200,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 89.825,
            "maxX": 90.175,
            "minZ": -210,
            "maxZ": -200,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 90,
            "maxX": 102,
            "minZ": -200.175,
            "maxZ": -199.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 90,
            "maxX": 102,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_129",
        "name": "Block 129",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 102,
            "z": -210
          },
          {
            "x": 110,
            "z": -210
          },
          {
            "x": 110,
            "z": -198
          },
          {
            "x": 102,
            "z": -198
          }
        ],
        "bounds": {
          "minX": 102,
          "maxX": 110,
          "minZ": -210,
          "maxZ": -198
        },
        "rects": [
          {
            "minX": 102,
            "maxX": 110,
            "minZ": -210,
            "maxZ": -198
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 101.825,
            "maxX": 102.175,
            "minZ": -210,
            "maxZ": -198,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 102,
            "maxX": 110,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 102,
            "maxX": 110,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 109.825,
            "maxX": 110.175,
            "minZ": -210,
            "maxZ": -198,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_130",
        "name": "Block 130",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 114,
            "z": -210
          },
          {
            "x": 124,
            "z": -210
          },
          {
            "x": 124,
            "z": -196
          },
          {
            "x": 114,
            "z": -196
          }
        ],
        "bounds": {
          "minX": 114,
          "maxX": 124,
          "minZ": -210,
          "maxZ": -196
        },
        "rects": [
          {
            "minX": 114,
            "maxX": 124,
            "minZ": -210,
            "maxZ": -196
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 113.825,
            "maxX": 114.175,
            "minZ": -210,
            "maxZ": -196,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 114,
            "maxX": 124,
            "minZ": -196.175,
            "maxZ": -195.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 114,
            "maxX": 124,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 123.825,
            "maxX": 124.175,
            "minZ": -210,
            "maxZ": -196,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_131",
        "name": "Block 131",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 126,
            "z": -210
          },
          {
            "x": 138,
            "z": -210
          },
          {
            "x": 138,
            "z": -202
          },
          {
            "x": 126,
            "z": -202
          }
        ],
        "bounds": {
          "minX": 126,
          "maxX": 138,
          "minZ": -210,
          "maxZ": -202
        },
        "rects": [
          {
            "minX": 126,
            "maxX": 138,
            "minZ": -210,
            "maxZ": -202
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 125.825,
            "maxX": 126.175,
            "minZ": -210,
            "maxZ": -202,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 126,
            "maxX": 138,
            "minZ": -202.175,
            "maxZ": -201.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 126,
            "maxX": 138,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 137.825,
            "maxX": 138.175,
            "minZ": -210,
            "maxZ": -202,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_132",
        "name": "Block 132",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 138,
            "z": -210
          },
          {
            "x": 146,
            "z": -210
          },
          {
            "x": 146,
            "z": -200
          },
          {
            "x": 138,
            "z": -200
          }
        ],
        "bounds": {
          "minX": 138,
          "maxX": 146,
          "minZ": -210,
          "maxZ": -200
        },
        "rects": [
          {
            "minX": 138,
            "maxX": 146,
            "minZ": -210,
            "maxZ": -200
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 137.825,
            "maxX": 138.175,
            "minZ": -210,
            "maxZ": -200,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 138,
            "maxX": 146,
            "minZ": -200.175,
            "maxZ": -199.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 138,
            "maxX": 146,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 145.825,
            "maxX": 146.175,
            "minZ": -210,
            "maxZ": -200,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_133",
        "name": "Block 133",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 150,
            "z": -210
          },
          {
            "x": 160,
            "z": -210
          },
          {
            "x": 160,
            "z": -198
          },
          {
            "x": 150,
            "z": -198
          }
        ],
        "bounds": {
          "minX": 150,
          "maxX": 160,
          "minZ": -210,
          "maxZ": -198
        },
        "rects": [
          {
            "minX": 150,
            "maxX": 160,
            "minZ": -210,
            "maxZ": -198
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 149.825,
            "maxX": 150.175,
            "minZ": -210,
            "maxZ": -198,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 150,
            "maxX": 160,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 150,
            "maxX": 160,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 159.825,
            "maxX": 160.175,
            "minZ": -210,
            "maxZ": -198,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_134",
        "name": "Block 134",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 198,
            "z": -210
          },
          {
            "x": 210,
            "z": -210
          },
          {
            "x": 210,
            "z": -198
          },
          {
            "x": 198,
            "z": -198
          }
        ],
        "bounds": {
          "minX": 198,
          "maxX": 210,
          "minZ": -210,
          "maxZ": -198
        },
        "rects": [
          {
            "minX": 198,
            "maxX": 210,
            "minZ": -210,
            "maxZ": -198
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 197.825,
            "maxX": 198.175,
            "minZ": -210,
            "maxZ": -198,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 198,
            "maxX": 210,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 198,
            "maxX": 210,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 209.825,
            "maxX": 210.175,
            "minZ": -210,
            "maxZ": -198,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_135",
        "name": "Block 135",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 210,
            "z": -210
          },
          {
            "x": 218,
            "z": -210
          },
          {
            "x": 218,
            "z": -196
          },
          {
            "x": 210,
            "z": -196
          }
        ],
        "bounds": {
          "minX": 210,
          "maxX": 218,
          "minZ": -210,
          "maxZ": -196
        },
        "rects": [
          {
            "minX": 210,
            "maxX": 218,
            "minZ": -210,
            "maxZ": -196
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 209.825,
            "maxX": 210.175,
            "minZ": -210,
            "maxZ": -196,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 210,
            "maxX": 218,
            "minZ": -196.175,
            "maxZ": -195.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 210,
            "maxX": 218,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 217.825,
            "maxX": 218.175,
            "minZ": -210,
            "maxZ": -196,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_136",
        "name": "Block 136",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 222,
            "z": -210
          },
          {
            "x": 232,
            "z": -210
          },
          {
            "x": 232,
            "z": -202
          },
          {
            "x": 222,
            "z": -202
          }
        ],
        "bounds": {
          "minX": 222,
          "maxX": 232,
          "minZ": -210,
          "maxZ": -202
        },
        "rects": [
          {
            "minX": 222,
            "maxX": 232,
            "minZ": -210,
            "maxZ": -202
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 221.825,
            "maxX": 222.175,
            "minZ": -210,
            "maxZ": -202,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 222,
            "maxX": 232,
            "minZ": -202.175,
            "maxZ": -201.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 222,
            "maxX": 232,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 231.825,
            "maxX": 232.175,
            "minZ": -210,
            "maxZ": -202,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_137",
        "name": "Block 137",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 234,
            "z": -210
          },
          {
            "x": 246,
            "z": -210
          },
          {
            "x": 246,
            "z": -200
          },
          {
            "x": 234,
            "z": -200
          }
        ],
        "bounds": {
          "minX": 234,
          "maxX": 246,
          "minZ": -210,
          "maxZ": -200
        },
        "rects": [
          {
            "minX": 234,
            "maxX": 246,
            "minZ": -210,
            "maxZ": -200
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 233.825,
            "maxX": 234.175,
            "minZ": -210,
            "maxZ": -200,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 234,
            "maxX": 246,
            "minZ": -200.175,
            "maxZ": -199.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 234,
            "maxX": 246,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 245.825,
            "maxX": 246.175,
            "minZ": -210,
            "maxZ": -200,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_138",
        "name": "Block 138",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 246,
            "z": -210
          },
          {
            "x": 254,
            "z": -210
          },
          {
            "x": 254,
            "z": -198
          },
          {
            "x": 246,
            "z": -198
          }
        ],
        "bounds": {
          "minX": 246,
          "maxX": 254,
          "minZ": -210,
          "maxZ": -198
        },
        "rects": [
          {
            "minX": 246,
            "maxX": 254,
            "minZ": -210,
            "maxZ": -198
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 245.825,
            "maxX": 246.175,
            "minZ": -210,
            "maxZ": -198,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 246,
            "maxX": 254,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 246,
            "maxX": 254,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 253.825,
            "maxX": 254.175,
            "minZ": -210,
            "maxZ": -198,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_139",
        "name": "Block 139",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 258,
            "z": -210
          },
          {
            "x": 268,
            "z": -210
          },
          {
            "x": 268,
            "z": -196
          },
          {
            "x": 258,
            "z": -196
          }
        ],
        "bounds": {
          "minX": 258,
          "maxX": 268,
          "minZ": -210,
          "maxZ": -196
        },
        "rects": [
          {
            "minX": 258,
            "maxX": 268,
            "minZ": -210,
            "maxZ": -196
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 257.825,
            "maxX": 258.175,
            "minZ": -210,
            "maxZ": -196,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 258,
            "maxX": 268,
            "minZ": -196.175,
            "maxZ": -195.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 258,
            "maxX": 268,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 267.825,
            "maxX": 268.175,
            "minZ": -210,
            "maxZ": -196,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_140",
        "name": "Block 140",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 270,
            "z": -210
          },
          {
            "x": 282,
            "z": -210
          },
          {
            "x": 282,
            "z": -202
          },
          {
            "x": 270,
            "z": -202
          }
        ],
        "bounds": {
          "minX": 270,
          "maxX": 282,
          "minZ": -210,
          "maxZ": -202
        },
        "rects": [
          {
            "minX": 270,
            "maxX": 282,
            "minZ": -210,
            "maxZ": -202
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 269.825,
            "maxX": 270.175,
            "minZ": -210,
            "maxZ": -202,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 270,
            "maxX": 282,
            "minZ": -202.175,
            "maxZ": -201.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 270,
            "maxX": 282,
            "minZ": -210.175,
            "maxZ": -209.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 281.825,
            "maxX": 282.175,
            "minZ": -210,
            "maxZ": -202,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_141",
        "name": "Block 141",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -294,
            "z": -198
          },
          {
            "x": -286,
            "z": -198
          },
          {
            "x": -286,
            "z": -188
          },
          {
            "x": -294,
            "z": -188
          }
        ],
        "bounds": {
          "minX": -294,
          "maxX": -286,
          "minZ": -198,
          "maxZ": -188
        },
        "rects": [
          {
            "minX": -294,
            "maxX": -286,
            "minZ": -198,
            "maxZ": -188
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -286.175,
            "maxX": -285.825,
            "minZ": -198,
            "maxZ": -188,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -294.175,
            "maxX": -293.825,
            "minZ": -198,
            "maxZ": -188,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -294,
            "maxX": -286,
            "minZ": -188.175,
            "maxZ": -187.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -294,
            "maxX": -286,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_142",
        "name": "Block 142",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -246,
            "z": -198
          },
          {
            "x": -236,
            "z": -198
          },
          {
            "x": -236,
            "z": -188
          },
          {
            "x": -246,
            "z": -188
          }
        ],
        "bounds": {
          "minX": -246,
          "maxX": -236,
          "minZ": -198,
          "maxZ": -188
        },
        "rects": [
          {
            "minX": -246,
            "maxX": -236,
            "minZ": -198,
            "maxZ": -188
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -236.175,
            "maxX": -235.825,
            "minZ": -198,
            "maxZ": -188,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -246.175,
            "maxX": -245.825,
            "minZ": -198,
            "maxZ": -188,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -246,
            "maxX": -236,
            "minZ": -188.175,
            "maxZ": -187.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -246,
            "maxX": -236,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_143",
        "name": "Block 143",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -210,
            "z": -198
          },
          {
            "x": -200,
            "z": -198
          },
          {
            "x": -200,
            "z": -190
          },
          {
            "x": -210,
            "z": -190
          }
        ],
        "bounds": {
          "minX": -210,
          "maxX": -200,
          "minZ": -198,
          "maxZ": -190
        },
        "rects": [
          {
            "minX": -210,
            "maxX": -200,
            "minZ": -198,
            "maxZ": -190
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -200.175,
            "maxX": -199.825,
            "minZ": -198,
            "maxZ": -190,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -210.175,
            "maxX": -209.825,
            "minZ": -198,
            "maxZ": -190,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -210,
            "maxX": -200,
            "minZ": -190.175,
            "maxZ": -189.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -210,
            "maxX": -200,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_144",
        "name": "Block 144",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -198,
            "z": -198
          },
          {
            "x": -186,
            "z": -198
          },
          {
            "x": -186,
            "z": -188
          },
          {
            "x": -198,
            "z": -188
          }
        ],
        "bounds": {
          "minX": -198,
          "maxX": -186,
          "minZ": -198,
          "maxZ": -188
        },
        "rects": [
          {
            "minX": -198,
            "maxX": -186,
            "minZ": -198,
            "maxZ": -188
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -186.175,
            "maxX": -185.825,
            "minZ": -198,
            "maxZ": -188,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -198.175,
            "maxX": -197.825,
            "minZ": -198,
            "maxZ": -188,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -198,
            "maxX": -186,
            "minZ": -188.175,
            "maxZ": -187.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -198,
            "maxX": -186,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_145",
        "name": "Block 145",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -162,
            "z": -198
          },
          {
            "x": -150,
            "z": -198
          },
          {
            "x": -150,
            "z": -190
          },
          {
            "x": -162,
            "z": -190
          }
        ],
        "bounds": {
          "minX": -162,
          "maxX": -150,
          "minZ": -198,
          "maxZ": -190
        },
        "rects": [
          {
            "minX": -162,
            "maxX": -150,
            "minZ": -198,
            "maxZ": -190
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -150.175,
            "maxX": -149.825,
            "minZ": -198,
            "maxZ": -190,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -162.175,
            "maxX": -161.825,
            "minZ": -198,
            "maxZ": -190,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -162,
            "maxX": -150,
            "minZ": -190.175,
            "maxZ": -189.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -162,
            "maxX": -150,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_146",
        "name": "Block 146",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -114,
            "z": -198
          },
          {
            "x": -106,
            "z": -198
          },
          {
            "x": -106,
            "z": -190
          },
          {
            "x": -114,
            "z": -190
          }
        ],
        "bounds": {
          "minX": -114,
          "maxX": -106,
          "minZ": -198,
          "maxZ": -190
        },
        "rects": [
          {
            "minX": -114,
            "maxX": -106,
            "minZ": -198,
            "maxZ": -190
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -106.175,
            "maxX": -105.825,
            "minZ": -198,
            "maxZ": -190,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -114.175,
            "maxX": -113.825,
            "minZ": -198,
            "maxZ": -190,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -114,
            "maxX": -106,
            "minZ": -190.175,
            "maxZ": -189.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -114,
            "maxX": -106,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_147",
        "name": "Block 147",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -102,
            "z": -198
          },
          {
            "x": -92,
            "z": -198
          },
          {
            "x": -92,
            "z": -188
          },
          {
            "x": -102,
            "z": -188
          }
        ],
        "bounds": {
          "minX": -102,
          "maxX": -92,
          "minZ": -198,
          "maxZ": -188
        },
        "rects": [
          {
            "minX": -102,
            "maxX": -92,
            "minZ": -198,
            "maxZ": -188
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -102.175,
            "maxX": -101.825,
            "minZ": -198,
            "maxZ": -188,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -102,
            "maxX": -92,
            "minZ": -188.175,
            "maxZ": -187.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -102,
            "maxX": -92,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -92.175,
            "maxX": -91.825,
            "minZ": -198,
            "maxZ": -188,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_148",
        "name": "Block 148",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -66,
            "z": -198
          },
          {
            "x": -56,
            "z": -198
          },
          {
            "x": -56,
            "z": -190
          },
          {
            "x": -66,
            "z": -190
          }
        ],
        "bounds": {
          "minX": -66,
          "maxX": -56,
          "minZ": -198,
          "maxZ": -190
        },
        "rects": [
          {
            "minX": -66,
            "maxX": -56,
            "minZ": -198,
            "maxZ": -190
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -56.175,
            "maxX": -55.825,
            "minZ": -198,
            "maxZ": -190,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -66.175,
            "maxX": -65.825,
            "minZ": -198,
            "maxZ": -190,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -66,
            "maxX": -56,
            "minZ": -190.175,
            "maxZ": -189.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -66,
            "maxX": -56,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_149",
        "name": "Block 149",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -54,
            "z": -198
          },
          {
            "x": -42,
            "z": -198
          },
          {
            "x": -42,
            "z": -188
          },
          {
            "x": -54,
            "z": -188
          }
        ],
        "bounds": {
          "minX": -54,
          "maxX": -42,
          "minZ": -198,
          "maxZ": -188
        },
        "rects": [
          {
            "minX": -54,
            "maxX": -42,
            "minZ": -198,
            "maxZ": -188
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -42.175,
            "maxX": -41.825,
            "minZ": -198,
            "maxZ": -188,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -54.175,
            "maxX": -53.825,
            "minZ": -198,
            "maxZ": -188,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -54,
            "maxX": -42,
            "minZ": -188.175,
            "maxZ": -187.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -54,
            "maxX": -42,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_150",
        "name": "Block 150",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 30,
            "z": -198
          },
          {
            "x": 38,
            "z": -198
          },
          {
            "x": 38,
            "z": -190
          },
          {
            "x": 30,
            "z": -190
          }
        ],
        "bounds": {
          "minX": 30,
          "maxX": 38,
          "minZ": -198,
          "maxZ": -190
        },
        "rects": [
          {
            "minX": 30,
            "maxX": 38,
            "minZ": -198,
            "maxZ": -190
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 29.825,
            "maxX": 30.175,
            "minZ": -198,
            "maxZ": -190,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 30,
            "maxX": 38,
            "minZ": -190.175,
            "maxZ": -189.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 30,
            "maxX": 38,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 37.825,
            "maxX": 38.175,
            "minZ": -198,
            "maxZ": -190,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_151",
        "name": "Block 151",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 42,
            "z": -198
          },
          {
            "x": 52,
            "z": -198
          },
          {
            "x": 52,
            "z": -188
          },
          {
            "x": 42,
            "z": -188
          }
        ],
        "bounds": {
          "minX": 42,
          "maxX": 52,
          "minZ": -198,
          "maxZ": -188
        },
        "rects": [
          {
            "minX": 42,
            "maxX": 52,
            "minZ": -198,
            "maxZ": -188
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 41.825,
            "maxX": 42.175,
            "minZ": -198,
            "maxZ": -188,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 42,
            "maxX": 52,
            "minZ": -188.175,
            "maxZ": -187.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 42,
            "maxX": 52,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 51.825,
            "maxX": 52.175,
            "minZ": -198,
            "maxZ": -188,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_152",
        "name": "Block 152",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 78,
            "z": -198
          },
          {
            "x": 88,
            "z": -198
          },
          {
            "x": 88,
            "z": -190
          },
          {
            "x": 78,
            "z": -190
          }
        ],
        "bounds": {
          "minX": 78,
          "maxX": 88,
          "minZ": -198,
          "maxZ": -190
        },
        "rects": [
          {
            "minX": 78,
            "maxX": 88,
            "minZ": -198,
            "maxZ": -190
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 77.825,
            "maxX": 78.175,
            "minZ": -198,
            "maxZ": -190,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 78,
            "maxX": 88,
            "minZ": -190.175,
            "maxZ": -189.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 78,
            "maxX": 88,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 87.825,
            "maxX": 88.175,
            "minZ": -198,
            "maxZ": -190,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_153",
        "name": "Block 153",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 90,
            "z": -198
          },
          {
            "x": 102,
            "z": -198
          },
          {
            "x": 102,
            "z": -188
          },
          {
            "x": 90,
            "z": -188
          }
        ],
        "bounds": {
          "minX": 90,
          "maxX": 102,
          "minZ": -198,
          "maxZ": -188
        },
        "rects": [
          {
            "minX": 90,
            "maxX": 102,
            "minZ": -198,
            "maxZ": -188
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 101.825,
            "maxX": 102.175,
            "minZ": -198,
            "maxZ": -188,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 89.825,
            "maxX": 90.175,
            "minZ": -198,
            "maxZ": -188,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 90,
            "maxX": 102,
            "minZ": -188.175,
            "maxZ": -187.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 90,
            "maxX": 102,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_154",
        "name": "Block 154",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 174,
            "z": -198
          },
          {
            "x": 182,
            "z": -198
          },
          {
            "x": 182,
            "z": -190
          },
          {
            "x": 174,
            "z": -190
          }
        ],
        "bounds": {
          "minX": 174,
          "maxX": 182,
          "minZ": -198,
          "maxZ": -190
        },
        "rects": [
          {
            "minX": 174,
            "maxX": 182,
            "minZ": -198,
            "maxZ": -190
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 173.825,
            "maxX": 174.175,
            "minZ": -198,
            "maxZ": -190,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 174,
            "maxX": 182,
            "minZ": -190.175,
            "maxZ": -189.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 174,
            "maxX": 182,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 181.825,
            "maxX": 182.175,
            "minZ": -198,
            "maxZ": -190,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_155",
        "name": "Block 155",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 186,
            "z": -198
          },
          {
            "x": 196,
            "z": -198
          },
          {
            "x": 196,
            "z": -188
          },
          {
            "x": 186,
            "z": -188
          }
        ],
        "bounds": {
          "minX": 186,
          "maxX": 196,
          "minZ": -198,
          "maxZ": -188
        },
        "rects": [
          {
            "minX": 186,
            "maxX": 196,
            "minZ": -198,
            "maxZ": -188
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 185.825,
            "maxX": 186.175,
            "minZ": -198,
            "maxZ": -188,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 186,
            "maxX": 196,
            "minZ": -188.175,
            "maxZ": -187.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 186,
            "maxX": 196,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 195.825,
            "maxX": 196.175,
            "minZ": -198,
            "maxZ": -188,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_156",
        "name": "Block 156",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 222,
            "z": -198
          },
          {
            "x": 232,
            "z": -198
          },
          {
            "x": 232,
            "z": -190
          },
          {
            "x": 222,
            "z": -190
          }
        ],
        "bounds": {
          "minX": 222,
          "maxX": 232,
          "minZ": -198,
          "maxZ": -190
        },
        "rects": [
          {
            "minX": 222,
            "maxX": 232,
            "minZ": -198,
            "maxZ": -190
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 221.825,
            "maxX": 222.175,
            "minZ": -198,
            "maxZ": -190,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 222,
            "maxX": 232,
            "minZ": -190.175,
            "maxZ": -189.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 222,
            "maxX": 232,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 231.825,
            "maxX": 232.175,
            "minZ": -198,
            "maxZ": -190,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_157",
        "name": "Block 157",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 234,
            "z": -198
          },
          {
            "x": 246,
            "z": -198
          },
          {
            "x": 246,
            "z": -188
          },
          {
            "x": 234,
            "z": -188
          }
        ],
        "bounds": {
          "minX": 234,
          "maxX": 246,
          "minZ": -198,
          "maxZ": -188
        },
        "rects": [
          {
            "minX": 234,
            "maxX": 246,
            "minZ": -198,
            "maxZ": -188
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 233.825,
            "maxX": 234.175,
            "minZ": -198,
            "maxZ": -188,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 234,
            "maxX": 246,
            "minZ": -188.175,
            "maxZ": -187.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 234,
            "maxX": 246,
            "minZ": -198.175,
            "maxZ": -197.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 245.825,
            "maxX": 246.175,
            "minZ": -198,
            "maxZ": -188,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_158",
        "name": "Block 158",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -258,
            "z": -162
          },
          {
            "x": -250,
            "z": -162
          },
          {
            "x": -250,
            "z": -154
          },
          {
            "x": -258,
            "z": -154
          }
        ],
        "bounds": {
          "minX": -258,
          "maxX": -250,
          "minZ": -162,
          "maxZ": -154
        },
        "rects": [
          {
            "minX": -258,
            "maxX": -250,
            "minZ": -162,
            "maxZ": -154
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -250.175,
            "maxX": -249.825,
            "minZ": -162,
            "maxZ": -154,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -258.175,
            "maxX": -257.825,
            "minZ": -162,
            "maxZ": -154,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -258,
            "maxX": -250,
            "minZ": -154.175,
            "maxZ": -153.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -258,
            "maxX": -250,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_159",
        "name": "Block 159",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -246,
            "z": -162
          },
          {
            "x": -236,
            "z": -162
          },
          {
            "x": -236,
            "z": -152
          },
          {
            "x": -246,
            "z": -152
          }
        ],
        "bounds": {
          "minX": -246,
          "maxX": -236,
          "minZ": -162,
          "maxZ": -152
        },
        "rects": [
          {
            "minX": -246,
            "maxX": -236,
            "minZ": -162,
            "maxZ": -152
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -236.175,
            "maxX": -235.825,
            "minZ": -162,
            "maxZ": -152,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -246.175,
            "maxX": -245.825,
            "minZ": -162,
            "maxZ": -152,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -246,
            "maxX": -236,
            "minZ": -152.175,
            "maxZ": -151.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -246,
            "maxX": -236,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_160",
        "name": "Block 160",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -234,
            "z": -162
          },
          {
            "x": -222,
            "z": -162
          },
          {
            "x": -222,
            "z": -150
          },
          {
            "x": -234,
            "z": -150
          }
        ],
        "bounds": {
          "minX": -234,
          "maxX": -222,
          "minZ": -162,
          "maxZ": -150
        },
        "rects": [
          {
            "minX": -234,
            "maxX": -222,
            "minZ": -162,
            "maxZ": -150
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -222.175,
            "maxX": -221.825,
            "minZ": -162,
            "maxZ": -150,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -234.175,
            "maxX": -233.825,
            "minZ": -162,
            "maxZ": -150,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -234,
            "maxX": -222,
            "minZ": -150.175,
            "maxZ": -149.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -234,
            "maxX": -222,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_161",
        "name": "Block 161",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -222,
            "z": -162
          },
          {
            "x": -214,
            "z": -162
          },
          {
            "x": -214,
            "z": -148
          },
          {
            "x": -222,
            "z": -148
          }
        ],
        "bounds": {
          "minX": -222,
          "maxX": -214,
          "minZ": -162,
          "maxZ": -148
        },
        "rects": [
          {
            "minX": -222,
            "maxX": -214,
            "minZ": -162,
            "maxZ": -148
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -214.175,
            "maxX": -213.825,
            "minZ": -162,
            "maxZ": -148,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -222.175,
            "maxX": -221.825,
            "minZ": -162,
            "maxZ": -148,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -222,
            "maxX": -214,
            "minZ": -148.175,
            "maxZ": -147.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -222,
            "maxX": -214,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_162",
        "name": "Block 162",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -210,
            "z": -162
          },
          {
            "x": -200,
            "z": -162
          },
          {
            "x": -200,
            "z": -154
          },
          {
            "x": -210,
            "z": -154
          }
        ],
        "bounds": {
          "minX": -210,
          "maxX": -200,
          "minZ": -162,
          "maxZ": -154
        },
        "rects": [
          {
            "minX": -210,
            "maxX": -200,
            "minZ": -162,
            "maxZ": -154
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -200.175,
            "maxX": -199.825,
            "minZ": -162,
            "maxZ": -154,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -210.175,
            "maxX": -209.825,
            "minZ": -162,
            "maxZ": -154,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -210,
            "maxX": -200,
            "minZ": -154.175,
            "maxZ": -153.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -210,
            "maxX": -200,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_163",
        "name": "Block 163",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -198,
            "z": -162
          },
          {
            "x": -186,
            "z": -162
          },
          {
            "x": -186,
            "z": -152
          },
          {
            "x": -198,
            "z": -152
          }
        ],
        "bounds": {
          "minX": -198,
          "maxX": -186,
          "minZ": -162,
          "maxZ": -152
        },
        "rects": [
          {
            "minX": -198,
            "maxX": -186,
            "minZ": -162,
            "maxZ": -152
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -186.175,
            "maxX": -185.825,
            "minZ": -162,
            "maxZ": -152,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -198.175,
            "maxX": -197.825,
            "minZ": -162,
            "maxZ": -152,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -198,
            "maxX": -186,
            "minZ": -152.175,
            "maxZ": -151.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -198,
            "maxX": -186,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_164",
        "name": "Block 164",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -186,
            "z": -162
          },
          {
            "x": -178,
            "z": -162
          },
          {
            "x": -178,
            "z": -150
          },
          {
            "x": -186,
            "z": -150
          }
        ],
        "bounds": {
          "minX": -186,
          "maxX": -178,
          "minZ": -162,
          "maxZ": -150
        },
        "rects": [
          {
            "minX": -186,
            "maxX": -178,
            "minZ": -162,
            "maxZ": -150
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -178.175,
            "maxX": -177.825,
            "minZ": -162,
            "maxZ": -150,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -186.175,
            "maxX": -185.825,
            "minZ": -162,
            "maxZ": -150,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -186,
            "maxX": -178,
            "minZ": -150.175,
            "maxZ": -149.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -186,
            "maxX": -178,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_165",
        "name": "Block 165",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -174,
            "z": -162
          },
          {
            "x": -164,
            "z": -162
          },
          {
            "x": -164,
            "z": -148
          },
          {
            "x": -174,
            "z": -148
          }
        ],
        "bounds": {
          "minX": -174,
          "maxX": -164,
          "minZ": -162,
          "maxZ": -148
        },
        "rects": [
          {
            "minX": -174,
            "maxX": -164,
            "minZ": -162,
            "maxZ": -148
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -164.175,
            "maxX": -163.825,
            "minZ": -162,
            "maxZ": -148,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -174.175,
            "maxX": -173.825,
            "minZ": -162,
            "maxZ": -148,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -174,
            "maxX": -164,
            "minZ": -148.175,
            "maxZ": -147.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -174,
            "maxX": -164,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_166",
        "name": "Block 166",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -126,
            "z": -162
          },
          {
            "x": -114,
            "z": -162
          },
          {
            "x": -114,
            "z": -148
          },
          {
            "x": -126,
            "z": -148
          }
        ],
        "bounds": {
          "minX": -126,
          "maxX": -114,
          "minZ": -162,
          "maxZ": -148
        },
        "rects": [
          {
            "minX": -126,
            "maxX": -114,
            "minZ": -162,
            "maxZ": -148
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -114.175,
            "maxX": -113.825,
            "minZ": -162,
            "maxZ": -148,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -126.175,
            "maxX": -125.825,
            "minZ": -162,
            "maxZ": -148,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -126,
            "maxX": -114,
            "minZ": -148.175,
            "maxZ": -147.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -126,
            "maxX": -114,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_167",
        "name": "Block 167",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -114,
            "z": -162
          },
          {
            "x": -106,
            "z": -162
          },
          {
            "x": -106,
            "z": -154
          },
          {
            "x": -114,
            "z": -154
          }
        ],
        "bounds": {
          "minX": -114,
          "maxX": -106,
          "minZ": -162,
          "maxZ": -154
        },
        "rects": [
          {
            "minX": -114,
            "maxX": -106,
            "minZ": -162,
            "maxZ": -154
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -106.175,
            "maxX": -105.825,
            "minZ": -162,
            "maxZ": -154,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -114.175,
            "maxX": -113.825,
            "minZ": -162,
            "maxZ": -154,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -114,
            "maxX": -106,
            "minZ": -154.175,
            "maxZ": -153.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -114,
            "maxX": -106,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_168",
        "name": "Block 168",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -102,
            "z": -162
          },
          {
            "x": -92,
            "z": -162
          },
          {
            "x": -92,
            "z": -152
          },
          {
            "x": -102,
            "z": -152
          }
        ],
        "bounds": {
          "minX": -102,
          "maxX": -92,
          "minZ": -162,
          "maxZ": -152
        },
        "rects": [
          {
            "minX": -102,
            "maxX": -92,
            "minZ": -162,
            "maxZ": -152
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -102.175,
            "maxX": -101.825,
            "minZ": -162,
            "maxZ": -152,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -102,
            "maxX": -92,
            "minZ": -152.175,
            "maxZ": -151.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -102,
            "maxX": -92,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -92.175,
            "maxX": -91.825,
            "minZ": -162,
            "maxZ": -152,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_169",
        "name": "Block 169",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -90,
            "z": -162
          },
          {
            "x": -78,
            "z": -162
          },
          {
            "x": -78,
            "z": -150
          },
          {
            "x": -90,
            "z": -150
          }
        ],
        "bounds": {
          "minX": -90,
          "maxX": -78,
          "minZ": -162,
          "maxZ": -150
        },
        "rects": [
          {
            "minX": -90,
            "maxX": -78,
            "minZ": -162,
            "maxZ": -150
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -78.175,
            "maxX": -77.825,
            "minZ": -162,
            "maxZ": -150,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -90.175,
            "maxX": -89.825,
            "minZ": -162,
            "maxZ": -150,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -90,
            "maxX": -78,
            "minZ": -150.175,
            "maxZ": -149.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -90,
            "maxX": -78,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_170",
        "name": "Block 170",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -78,
            "z": -162
          },
          {
            "x": -70,
            "z": -162
          },
          {
            "x": -70,
            "z": -148
          },
          {
            "x": -78,
            "z": -148
          }
        ],
        "bounds": {
          "minX": -78,
          "maxX": -70,
          "minZ": -162,
          "maxZ": -148
        },
        "rects": [
          {
            "minX": -78,
            "maxX": -70,
            "minZ": -162,
            "maxZ": -148
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -70.175,
            "maxX": -69.825,
            "minZ": -162,
            "maxZ": -148,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -78.175,
            "maxX": -77.825,
            "minZ": -162,
            "maxZ": -148,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -78,
            "maxX": -70,
            "minZ": -148.175,
            "maxZ": -147.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -78,
            "maxX": -70,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_171",
        "name": "Block 171",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -66,
            "z": -162
          },
          {
            "x": -56,
            "z": -162
          },
          {
            "x": -56,
            "z": -154
          },
          {
            "x": -66,
            "z": -154
          }
        ],
        "bounds": {
          "minX": -66,
          "maxX": -56,
          "minZ": -162,
          "maxZ": -154
        },
        "rects": [
          {
            "minX": -66,
            "maxX": -56,
            "minZ": -162,
            "maxZ": -154
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -56.175,
            "maxX": -55.825,
            "minZ": -162,
            "maxZ": -154,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -66.175,
            "maxX": -65.825,
            "minZ": -162,
            "maxZ": -154,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -66,
            "maxX": -56,
            "minZ": -154.175,
            "maxZ": -153.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -66,
            "maxX": -56,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_172",
        "name": "Block 172",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -54,
            "z": -162
          },
          {
            "x": -42,
            "z": -162
          },
          {
            "x": -42,
            "z": -152
          },
          {
            "x": -54,
            "z": -152
          }
        ],
        "bounds": {
          "minX": -54,
          "maxX": -42,
          "minZ": -162,
          "maxZ": -152
        },
        "rects": [
          {
            "minX": -54,
            "maxX": -42,
            "minZ": -162,
            "maxZ": -152
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -42.175,
            "maxX": -41.825,
            "minZ": -162,
            "maxZ": -152,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -54.175,
            "maxX": -53.825,
            "minZ": -162,
            "maxZ": -152,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -54,
            "maxX": -42,
            "minZ": -152.175,
            "maxZ": -151.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -54,
            "maxX": -42,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_173",
        "name": "Block 173",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -42,
            "z": -162
          },
          {
            "x": -34,
            "z": -162
          },
          {
            "x": -34,
            "z": -150
          },
          {
            "x": -42,
            "z": -150
          }
        ],
        "bounds": {
          "minX": -42,
          "maxX": -34,
          "minZ": -162,
          "maxZ": -150
        },
        "rects": [
          {
            "minX": -42,
            "maxX": -34,
            "minZ": -162,
            "maxZ": -150
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -34.175,
            "maxX": -33.825,
            "minZ": -162,
            "maxZ": -150,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -42.175,
            "maxX": -41.825,
            "minZ": -162,
            "maxZ": -150,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -42,
            "maxX": -34,
            "minZ": -150.175,
            "maxZ": -149.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -42,
            "maxX": -34,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_174",
        "name": "Block 174",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 6,
            "z": -162
          },
          {
            "x": 16,
            "z": -162
          },
          {
            "x": 16,
            "z": -150
          },
          {
            "x": 6,
            "z": -150
          }
        ],
        "bounds": {
          "minX": 6,
          "maxX": 16,
          "minZ": -162,
          "maxZ": -150
        },
        "rects": [
          {
            "minX": 6,
            "maxX": 16,
            "minZ": -162,
            "maxZ": -150
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 15.825,
            "maxX": 16.175,
            "minZ": -162,
            "maxZ": -150,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 5.825,
            "maxX": 6.175,
            "minZ": -162,
            "maxZ": -150,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 6,
            "maxX": 16,
            "minZ": -150.175,
            "maxZ": -149.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 6,
            "maxX": 16,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_175",
        "name": "Block 175",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 18,
            "z": -162
          },
          {
            "x": 30,
            "z": -162
          },
          {
            "x": 30,
            "z": -148
          },
          {
            "x": 18,
            "z": -148
          }
        ],
        "bounds": {
          "minX": 18,
          "maxX": 30,
          "minZ": -162,
          "maxZ": -148
        },
        "rects": [
          {
            "minX": 18,
            "maxX": 30,
            "minZ": -162,
            "maxZ": -148
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 17.825,
            "maxX": 18.175,
            "minZ": -162,
            "maxZ": -148,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 18,
            "maxX": 30,
            "minZ": -148.175,
            "maxZ": -147.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 18,
            "maxX": 30,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 29.825,
            "maxX": 30.175,
            "minZ": -162,
            "maxZ": -148,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_176",
        "name": "Block 176",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 30,
            "z": -162
          },
          {
            "x": 38,
            "z": -162
          },
          {
            "x": 38,
            "z": -154
          },
          {
            "x": 30,
            "z": -154
          }
        ],
        "bounds": {
          "minX": 30,
          "maxX": 38,
          "minZ": -162,
          "maxZ": -154
        },
        "rects": [
          {
            "minX": 30,
            "maxX": 38,
            "minZ": -162,
            "maxZ": -154
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 29.825,
            "maxX": 30.175,
            "minZ": -162,
            "maxZ": -154,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 30,
            "maxX": 38,
            "minZ": -154.175,
            "maxZ": -153.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 30,
            "maxX": 38,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 37.825,
            "maxX": 38.175,
            "minZ": -162,
            "maxZ": -154,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_177",
        "name": "Block 177",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 42,
            "z": -162
          },
          {
            "x": 52,
            "z": -162
          },
          {
            "x": 52,
            "z": -152
          },
          {
            "x": 42,
            "z": -152
          }
        ],
        "bounds": {
          "minX": 42,
          "maxX": 52,
          "minZ": -162,
          "maxZ": -152
        },
        "rects": [
          {
            "minX": 42,
            "maxX": 52,
            "minZ": -162,
            "maxZ": -152
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 41.825,
            "maxX": 42.175,
            "minZ": -162,
            "maxZ": -152,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 42,
            "maxX": 52,
            "minZ": -152.175,
            "maxZ": -151.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 42,
            "maxX": 52,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 51.825,
            "maxX": 52.175,
            "minZ": -162,
            "maxZ": -152,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_178",
        "name": "Block 178",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 54,
            "z": -162
          },
          {
            "x": 66,
            "z": -162
          },
          {
            "x": 66,
            "z": -150
          },
          {
            "x": 54,
            "z": -150
          }
        ],
        "bounds": {
          "minX": 54,
          "maxX": 66,
          "minZ": -162,
          "maxZ": -150
        },
        "rects": [
          {
            "minX": 54,
            "maxX": 66,
            "minZ": -162,
            "maxZ": -150
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 53.825,
            "maxX": 54.175,
            "minZ": -162,
            "maxZ": -150,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 54,
            "maxX": 66,
            "minZ": -150.175,
            "maxZ": -149.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 54,
            "maxX": 66,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 65.825,
            "maxX": 66.175,
            "minZ": -162,
            "maxZ": -150,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_179",
        "name": "Block 179",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 66,
            "z": -162
          },
          {
            "x": 74,
            "z": -162
          },
          {
            "x": 74,
            "z": -148
          },
          {
            "x": 66,
            "z": -148
          }
        ],
        "bounds": {
          "minX": 66,
          "maxX": 74,
          "minZ": -162,
          "maxZ": -148
        },
        "rects": [
          {
            "minX": 66,
            "maxX": 74,
            "minZ": -162,
            "maxZ": -148
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 65.825,
            "maxX": 66.175,
            "minZ": -162,
            "maxZ": -148,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 66,
            "maxX": 74,
            "minZ": -148.175,
            "maxZ": -147.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 66,
            "maxX": 74,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 73.825,
            "maxX": 74.175,
            "minZ": -162,
            "maxZ": -148,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_180",
        "name": "Block 180",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 78,
            "z": -162
          },
          {
            "x": 88,
            "z": -162
          },
          {
            "x": 88,
            "z": -154
          },
          {
            "x": 78,
            "z": -154
          }
        ],
        "bounds": {
          "minX": 78,
          "maxX": 88,
          "minZ": -162,
          "maxZ": -154
        },
        "rects": [
          {
            "minX": 78,
            "maxX": 88,
            "minZ": -162,
            "maxZ": -154
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 77.825,
            "maxX": 78.175,
            "minZ": -162,
            "maxZ": -154,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 78,
            "maxX": 88,
            "minZ": -154.175,
            "maxZ": -153.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 78,
            "maxX": 88,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 87.825,
            "maxX": 88.175,
            "minZ": -162,
            "maxZ": -154,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_181",
        "name": "Block 181",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 90,
            "z": -162
          },
          {
            "x": 102,
            "z": -162
          },
          {
            "x": 102,
            "z": -152
          },
          {
            "x": 90,
            "z": -152
          }
        ],
        "bounds": {
          "minX": 90,
          "maxX": 102,
          "minZ": -162,
          "maxZ": -152
        },
        "rects": [
          {
            "minX": 90,
            "maxX": 102,
            "minZ": -162,
            "maxZ": -152
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 101.825,
            "maxX": 102.175,
            "minZ": -162,
            "maxZ": -152,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 89.825,
            "maxX": 90.175,
            "minZ": -162,
            "maxZ": -152,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 90,
            "maxX": 102,
            "minZ": -152.175,
            "maxZ": -151.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 90,
            "maxX": 102,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_182",
        "name": "Block 182",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 138,
            "z": -162
          },
          {
            "x": 146,
            "z": -162
          },
          {
            "x": 146,
            "z": -152
          },
          {
            "x": 138,
            "z": -152
          }
        ],
        "bounds": {
          "minX": 138,
          "maxX": 146,
          "minZ": -162,
          "maxZ": -152
        },
        "rects": [
          {
            "minX": 138,
            "maxX": 146,
            "minZ": -162,
            "maxZ": -152
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 137.825,
            "maxX": 138.175,
            "minZ": -162,
            "maxZ": -152,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 138,
            "maxX": 146,
            "minZ": -152.175,
            "maxZ": -151.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 138,
            "maxX": 146,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 145.825,
            "maxX": 146.175,
            "minZ": -162,
            "maxZ": -152,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_183",
        "name": "Block 183",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 150,
            "z": -162
          },
          {
            "x": 160,
            "z": -162
          },
          {
            "x": 160,
            "z": -150
          },
          {
            "x": 150,
            "z": -150
          }
        ],
        "bounds": {
          "minX": 150,
          "maxX": 160,
          "minZ": -162,
          "maxZ": -150
        },
        "rects": [
          {
            "minX": 150,
            "maxX": 160,
            "minZ": -162,
            "maxZ": -150
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 149.825,
            "maxX": 150.175,
            "minZ": -162,
            "maxZ": -150,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 150,
            "maxX": 160,
            "minZ": -150.175,
            "maxZ": -149.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 150,
            "maxX": 160,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 159.825,
            "maxX": 160.175,
            "minZ": -162,
            "maxZ": -150,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_184",
        "name": "Block 184",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 162,
            "z": -162
          },
          {
            "x": 174,
            "z": -162
          },
          {
            "x": 174,
            "z": -148
          },
          {
            "x": 162,
            "z": -148
          }
        ],
        "bounds": {
          "minX": 162,
          "maxX": 174,
          "minZ": -162,
          "maxZ": -148
        },
        "rects": [
          {
            "minX": 162,
            "maxX": 174,
            "minZ": -162,
            "maxZ": -148
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 161.825,
            "maxX": 162.175,
            "minZ": -162,
            "maxZ": -148,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 162,
            "maxX": 174,
            "minZ": -148.175,
            "maxZ": -147.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 162,
            "maxX": 174,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 173.825,
            "maxX": 174.175,
            "minZ": -162,
            "maxZ": -148,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_185",
        "name": "Block 185",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 174,
            "z": -162
          },
          {
            "x": 182,
            "z": -162
          },
          {
            "x": 182,
            "z": -154
          },
          {
            "x": 174,
            "z": -154
          }
        ],
        "bounds": {
          "minX": 174,
          "maxX": 182,
          "minZ": -162,
          "maxZ": -154
        },
        "rects": [
          {
            "minX": 174,
            "maxX": 182,
            "minZ": -162,
            "maxZ": -154
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 173.825,
            "maxX": 174.175,
            "minZ": -162,
            "maxZ": -154,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 174,
            "maxX": 182,
            "minZ": -154.175,
            "maxZ": -153.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 174,
            "maxX": 182,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 181.825,
            "maxX": 182.175,
            "minZ": -162,
            "maxZ": -154,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_186",
        "name": "Block 186",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 186,
            "z": -162
          },
          {
            "x": 196,
            "z": -162
          },
          {
            "x": 196,
            "z": -152
          },
          {
            "x": 186,
            "z": -152
          }
        ],
        "bounds": {
          "minX": 186,
          "maxX": 196,
          "minZ": -162,
          "maxZ": -152
        },
        "rects": [
          {
            "minX": 186,
            "maxX": 196,
            "minZ": -162,
            "maxZ": -152
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 185.825,
            "maxX": 186.175,
            "minZ": -162,
            "maxZ": -152,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 186,
            "maxX": 196,
            "minZ": -152.175,
            "maxZ": -151.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 186,
            "maxX": 196,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 195.825,
            "maxX": 196.175,
            "minZ": -162,
            "maxZ": -152,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_187",
        "name": "Block 187",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 198,
            "z": -162
          },
          {
            "x": 210,
            "z": -162
          },
          {
            "x": 210,
            "z": -150
          },
          {
            "x": 198,
            "z": -150
          }
        ],
        "bounds": {
          "minX": 198,
          "maxX": 210,
          "minZ": -162,
          "maxZ": -150
        },
        "rects": [
          {
            "minX": 198,
            "maxX": 210,
            "minZ": -162,
            "maxZ": -150
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 197.825,
            "maxX": 198.175,
            "minZ": -162,
            "maxZ": -150,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 198,
            "maxX": 210,
            "minZ": -150.175,
            "maxZ": -149.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 198,
            "maxX": 210,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 209.825,
            "maxX": 210.175,
            "minZ": -162,
            "maxZ": -150,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_188",
        "name": "Block 188",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 210,
            "z": -162
          },
          {
            "x": 218,
            "z": -162
          },
          {
            "x": 218,
            "z": -148
          },
          {
            "x": 210,
            "z": -148
          }
        ],
        "bounds": {
          "minX": 210,
          "maxX": 218,
          "minZ": -162,
          "maxZ": -148
        },
        "rects": [
          {
            "minX": 210,
            "maxX": 218,
            "minZ": -162,
            "maxZ": -148
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 209.825,
            "maxX": 210.175,
            "minZ": -162,
            "maxZ": -148,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 210,
            "maxX": 218,
            "minZ": -148.175,
            "maxZ": -147.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 210,
            "maxX": 218,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 217.825,
            "maxX": 218.175,
            "minZ": -162,
            "maxZ": -148,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_189",
        "name": "Block 189",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 222,
            "z": -162
          },
          {
            "x": 232,
            "z": -162
          },
          {
            "x": 232,
            "z": -154
          },
          {
            "x": 222,
            "z": -154
          }
        ],
        "bounds": {
          "minX": 222,
          "maxX": 232,
          "minZ": -162,
          "maxZ": -154
        },
        "rects": [
          {
            "minX": 222,
            "maxX": 232,
            "minZ": -162,
            "maxZ": -154
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 221.825,
            "maxX": 222.175,
            "minZ": -162,
            "maxZ": -154,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 222,
            "maxX": 232,
            "minZ": -154.175,
            "maxZ": -153.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 222,
            "maxX": 232,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 231.825,
            "maxX": 232.175,
            "minZ": -162,
            "maxZ": -154,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_190",
        "name": "Block 190",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 270,
            "z": -162
          },
          {
            "x": 282,
            "z": -162
          },
          {
            "x": 282,
            "z": -154
          },
          {
            "x": 270,
            "z": -154
          }
        ],
        "bounds": {
          "minX": 270,
          "maxX": 282,
          "minZ": -162,
          "maxZ": -154
        },
        "rects": [
          {
            "minX": 270,
            "maxX": 282,
            "minZ": -162,
            "maxZ": -154
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 269.825,
            "maxX": 270.175,
            "minZ": -162,
            "maxZ": -154,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 270,
            "maxX": 282,
            "minZ": -154.175,
            "maxZ": -153.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 270,
            "maxX": 282,
            "minZ": -162.175,
            "maxZ": -161.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 281.825,
            "maxX": 282.175,
            "minZ": -162,
            "maxZ": -154,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_191",
        "name": "Block 191",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -270,
            "z": -126
          },
          {
            "x": -258,
            "z": -126
          },
          {
            "x": -258,
            "z": -112
          },
          {
            "x": -270,
            "z": -112
          }
        ],
        "bounds": {
          "minX": -270,
          "maxX": -258,
          "minZ": -126,
          "maxZ": -112
        },
        "rects": [
          {
            "minX": -270,
            "maxX": -258,
            "minZ": -126,
            "maxZ": -112
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -258.175,
            "maxX": -257.825,
            "minZ": -126,
            "maxZ": -112,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -270.175,
            "maxX": -269.825,
            "minZ": -126,
            "maxZ": -112,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -270,
            "maxX": -258,
            "minZ": -112.175,
            "maxZ": -111.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -270,
            "maxX": -258,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_192",
        "name": "Block 192",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -258,
            "z": -126
          },
          {
            "x": -250,
            "z": -126
          },
          {
            "x": -250,
            "z": -118
          },
          {
            "x": -258,
            "z": -118
          }
        ],
        "bounds": {
          "minX": -258,
          "maxX": -250,
          "minZ": -126,
          "maxZ": -118
        },
        "rects": [
          {
            "minX": -258,
            "maxX": -250,
            "minZ": -126,
            "maxZ": -118
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -250.175,
            "maxX": -249.825,
            "minZ": -126,
            "maxZ": -118,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -258.175,
            "maxX": -257.825,
            "minZ": -126,
            "maxZ": -118,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -258,
            "maxX": -250,
            "minZ": -118.175,
            "maxZ": -117.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -258,
            "maxX": -250,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_193",
        "name": "Block 193",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -246,
            "z": -126
          },
          {
            "x": -236,
            "z": -126
          },
          {
            "x": -236,
            "z": -116
          },
          {
            "x": -246,
            "z": -116
          }
        ],
        "bounds": {
          "minX": -246,
          "maxX": -236,
          "minZ": -126,
          "maxZ": -116
        },
        "rects": [
          {
            "minX": -246,
            "maxX": -236,
            "minZ": -126,
            "maxZ": -116
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -236.175,
            "maxX": -235.825,
            "minZ": -126,
            "maxZ": -116,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -246.175,
            "maxX": -245.825,
            "minZ": -126,
            "maxZ": -116,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -246,
            "maxX": -236,
            "minZ": -116.175,
            "maxZ": -115.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -246,
            "maxX": -236,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_194",
        "name": "Block 194",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -234,
            "z": -126
          },
          {
            "x": -222,
            "z": -126
          },
          {
            "x": -222,
            "z": -114
          },
          {
            "x": -234,
            "z": -114
          }
        ],
        "bounds": {
          "minX": -234,
          "maxX": -222,
          "minZ": -126,
          "maxZ": -114
        },
        "rects": [
          {
            "minX": -234,
            "maxX": -222,
            "minZ": -126,
            "maxZ": -114
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -222.175,
            "maxX": -221.825,
            "minZ": -126,
            "maxZ": -114,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -234.175,
            "maxX": -233.825,
            "minZ": -126,
            "maxZ": -114,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -234,
            "maxX": -222,
            "minZ": -114.175,
            "maxZ": -113.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -234,
            "maxX": -222,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_195",
        "name": "Block 195",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -222,
            "z": -126
          },
          {
            "x": -214,
            "z": -126
          },
          {
            "x": -214,
            "z": -112
          },
          {
            "x": -222,
            "z": -112
          }
        ],
        "bounds": {
          "minX": -222,
          "maxX": -214,
          "minZ": -126,
          "maxZ": -112
        },
        "rects": [
          {
            "minX": -222,
            "maxX": -214,
            "minZ": -126,
            "maxZ": -112
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -214.175,
            "maxX": -213.825,
            "minZ": -126,
            "maxZ": -112,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -222.175,
            "maxX": -221.825,
            "minZ": -126,
            "maxZ": -112,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -222,
            "maxX": -214,
            "minZ": -112.175,
            "maxZ": -111.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -222,
            "maxX": -214,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_196",
        "name": "Block 196",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -210,
            "z": -126
          },
          {
            "x": -200,
            "z": -126
          },
          {
            "x": -200,
            "z": -118
          },
          {
            "x": -210,
            "z": -118
          }
        ],
        "bounds": {
          "minX": -210,
          "maxX": -200,
          "minZ": -126,
          "maxZ": -118
        },
        "rects": [
          {
            "minX": -210,
            "maxX": -200,
            "minZ": -126,
            "maxZ": -118
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -200.175,
            "maxX": -199.825,
            "minZ": -126,
            "maxZ": -118,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -210.175,
            "maxX": -209.825,
            "minZ": -126,
            "maxZ": -118,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -210,
            "maxX": -200,
            "minZ": -118.175,
            "maxZ": -117.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -210,
            "maxX": -200,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_197",
        "name": "Block 197",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -198,
            "z": -126
          },
          {
            "x": -186,
            "z": -126
          },
          {
            "x": -186,
            "z": -116
          },
          {
            "x": -198,
            "z": -116
          }
        ],
        "bounds": {
          "minX": -198,
          "maxX": -186,
          "minZ": -126,
          "maxZ": -116
        },
        "rects": [
          {
            "minX": -198,
            "maxX": -186,
            "minZ": -126,
            "maxZ": -116
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -186.175,
            "maxX": -185.825,
            "minZ": -126,
            "maxZ": -116,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -198.175,
            "maxX": -197.825,
            "minZ": -126,
            "maxZ": -116,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -198,
            "maxX": -186,
            "minZ": -116.175,
            "maxZ": -115.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -198,
            "maxX": -186,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_198",
        "name": "Block 198",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -186,
            "z": -126
          },
          {
            "x": -178,
            "z": -126
          },
          {
            "x": -178,
            "z": -114
          },
          {
            "x": -186,
            "z": -114
          }
        ],
        "bounds": {
          "minX": -186,
          "maxX": -178,
          "minZ": -126,
          "maxZ": -114
        },
        "rects": [
          {
            "minX": -186,
            "maxX": -178,
            "minZ": -126,
            "maxZ": -114
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -178.175,
            "maxX": -177.825,
            "minZ": -126,
            "maxZ": -114,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -186.175,
            "maxX": -185.825,
            "minZ": -126,
            "maxZ": -114,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -186,
            "maxX": -178,
            "minZ": -114.175,
            "maxZ": -113.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -186,
            "maxX": -178,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_199",
        "name": "Block 199",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -138,
            "z": -126
          },
          {
            "x": -128,
            "z": -126
          },
          {
            "x": -128,
            "z": -114
          },
          {
            "x": -138,
            "z": -114
          }
        ],
        "bounds": {
          "minX": -138,
          "maxX": -128,
          "minZ": -126,
          "maxZ": -114
        },
        "rects": [
          {
            "minX": -138,
            "maxX": -128,
            "minZ": -126,
            "maxZ": -114
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -128.175,
            "maxX": -127.825,
            "minZ": -126,
            "maxZ": -114,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -138.175,
            "maxX": -137.825,
            "minZ": -126,
            "maxZ": -114,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -138,
            "maxX": -128,
            "minZ": -114.175,
            "maxZ": -113.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -138,
            "maxX": -128,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_200",
        "name": "Block 200",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -126,
            "z": -126
          },
          {
            "x": -114,
            "z": -126
          },
          {
            "x": -114,
            "z": -112
          },
          {
            "x": -126,
            "z": -112
          }
        ],
        "bounds": {
          "minX": -126,
          "maxX": -114,
          "minZ": -126,
          "maxZ": -112
        },
        "rects": [
          {
            "minX": -126,
            "maxX": -114,
            "minZ": -126,
            "maxZ": -112
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -114.175,
            "maxX": -113.825,
            "minZ": -126,
            "maxZ": -112,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -126.175,
            "maxX": -125.825,
            "minZ": -126,
            "maxZ": -112,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -126,
            "maxX": -114,
            "minZ": -112.175,
            "maxZ": -111.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -126,
            "maxX": -114,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_201",
        "name": "Block 201",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -114,
            "z": -126
          },
          {
            "x": -106,
            "z": -126
          },
          {
            "x": -106,
            "z": -118
          },
          {
            "x": -114,
            "z": -118
          }
        ],
        "bounds": {
          "minX": -114,
          "maxX": -106,
          "minZ": -126,
          "maxZ": -118
        },
        "rects": [
          {
            "minX": -114,
            "maxX": -106,
            "minZ": -126,
            "maxZ": -118
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -106.175,
            "maxX": -105.825,
            "minZ": -126,
            "maxZ": -118,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -114.175,
            "maxX": -113.825,
            "minZ": -126,
            "maxZ": -118,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -114,
            "maxX": -106,
            "minZ": -118.175,
            "maxZ": -117.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -114,
            "maxX": -106,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_202",
        "name": "Block 202",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -102,
            "z": -126
          },
          {
            "x": -92,
            "z": -126
          },
          {
            "x": -92,
            "z": -116
          },
          {
            "x": -102,
            "z": -116
          }
        ],
        "bounds": {
          "minX": -102,
          "maxX": -92,
          "minZ": -126,
          "maxZ": -116
        },
        "rects": [
          {
            "minX": -102,
            "maxX": -92,
            "minZ": -126,
            "maxZ": -116
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -102.175,
            "maxX": -101.825,
            "minZ": -126,
            "maxZ": -116,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -102,
            "maxX": -92,
            "minZ": -116.175,
            "maxZ": -115.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -102,
            "maxX": -92,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -92.175,
            "maxX": -91.825,
            "minZ": -126,
            "maxZ": -116,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_203",
        "name": "Block 203",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -90,
            "z": -126
          },
          {
            "x": -78,
            "z": -126
          },
          {
            "x": -78,
            "z": -114
          },
          {
            "x": -90,
            "z": -114
          }
        ],
        "bounds": {
          "minX": -90,
          "maxX": -78,
          "minZ": -126,
          "maxZ": -114
        },
        "rects": [
          {
            "minX": -90,
            "maxX": -78,
            "minZ": -126,
            "maxZ": -114
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -78.175,
            "maxX": -77.825,
            "minZ": -126,
            "maxZ": -114,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -90.175,
            "maxX": -89.825,
            "minZ": -126,
            "maxZ": -114,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -90,
            "maxX": -78,
            "minZ": -114.175,
            "maxZ": -113.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -90,
            "maxX": -78,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_204",
        "name": "Block 204",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -78,
            "z": -126
          },
          {
            "x": -70,
            "z": -126
          },
          {
            "x": -70,
            "z": -112
          },
          {
            "x": -78,
            "z": -112
          }
        ],
        "bounds": {
          "minX": -78,
          "maxX": -70,
          "minZ": -126,
          "maxZ": -112
        },
        "rects": [
          {
            "minX": -78,
            "maxX": -70,
            "minZ": -126,
            "maxZ": -112
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -70.175,
            "maxX": -69.825,
            "minZ": -126,
            "maxZ": -112,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -78.175,
            "maxX": -77.825,
            "minZ": -126,
            "maxZ": -112,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -78,
            "maxX": -70,
            "minZ": -112.175,
            "maxZ": -111.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -78,
            "maxX": -70,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_205",
        "name": "Block 205",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -66,
            "z": -126
          },
          {
            "x": -56,
            "z": -126
          },
          {
            "x": -56,
            "z": -118
          },
          {
            "x": -66,
            "z": -118
          }
        ],
        "bounds": {
          "minX": -66,
          "maxX": -56,
          "minZ": -126,
          "maxZ": -118
        },
        "rects": [
          {
            "minX": -66,
            "maxX": -56,
            "minZ": -126,
            "maxZ": -118
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -56.175,
            "maxX": -55.825,
            "minZ": -126,
            "maxZ": -118,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -66.175,
            "maxX": -65.825,
            "minZ": -126,
            "maxZ": -118,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -66,
            "maxX": -56,
            "minZ": -118.175,
            "maxZ": -117.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -66,
            "maxX": -56,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_206",
        "name": "Block 206",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -54,
            "z": -126
          },
          {
            "x": -42,
            "z": -126
          },
          {
            "x": -42,
            "z": -116
          },
          {
            "x": -54,
            "z": -116
          }
        ],
        "bounds": {
          "minX": -54,
          "maxX": -42,
          "minZ": -126,
          "maxZ": -116
        },
        "rects": [
          {
            "minX": -54,
            "maxX": -42,
            "minZ": -126,
            "maxZ": -116
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -42.175,
            "maxX": -41.825,
            "minZ": -126,
            "maxZ": -116,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -54.175,
            "maxX": -53.825,
            "minZ": -126,
            "maxZ": -116,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -54,
            "maxX": -42,
            "minZ": -116.175,
            "maxZ": -115.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -54,
            "maxX": -42,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_207",
        "name": "Block 207",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -6,
            "z": -126
          },
          {
            "x": 2,
            "z": -126
          },
          {
            "x": 2,
            "z": -116
          },
          {
            "x": -6,
            "z": -116
          }
        ],
        "bounds": {
          "minX": -6,
          "maxX": 2,
          "minZ": -126,
          "maxZ": -116
        },
        "rects": [
          {
            "minX": -6,
            "maxX": 2,
            "minZ": -126,
            "maxZ": -116
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -6.175,
            "maxX": -5.825,
            "minZ": -126,
            "maxZ": -116,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -6,
            "maxX": 2,
            "minZ": -116.175,
            "maxZ": -115.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -6,
            "maxX": 2,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 1.825,
            "maxX": 2.175,
            "minZ": -126,
            "maxZ": -116,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_208",
        "name": "Block 208",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 6,
            "z": -126
          },
          {
            "x": 16,
            "z": -126
          },
          {
            "x": 16,
            "z": -114
          },
          {
            "x": 6,
            "z": -114
          }
        ],
        "bounds": {
          "minX": 6,
          "maxX": 16,
          "minZ": -126,
          "maxZ": -114
        },
        "rects": [
          {
            "minX": 6,
            "maxX": 16,
            "minZ": -126,
            "maxZ": -114
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 15.825,
            "maxX": 16.175,
            "minZ": -126,
            "maxZ": -114,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 5.825,
            "maxX": 6.175,
            "minZ": -126,
            "maxZ": -114,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 6,
            "maxX": 16,
            "minZ": -114.175,
            "maxZ": -113.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 6,
            "maxX": 16,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_209",
        "name": "Block 209",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 18,
            "z": -126
          },
          {
            "x": 30,
            "z": -126
          },
          {
            "x": 30,
            "z": -112
          },
          {
            "x": 18,
            "z": -112
          }
        ],
        "bounds": {
          "minX": 18,
          "maxX": 30,
          "minZ": -126,
          "maxZ": -112
        },
        "rects": [
          {
            "minX": 18,
            "maxX": 30,
            "minZ": -126,
            "maxZ": -112
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 17.825,
            "maxX": 18.175,
            "minZ": -126,
            "maxZ": -112,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 18,
            "maxX": 30,
            "minZ": -112.175,
            "maxZ": -111.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 18,
            "maxX": 30,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 29.825,
            "maxX": 30.175,
            "minZ": -126,
            "maxZ": -112,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_210",
        "name": "Block 210",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 30,
            "z": -126
          },
          {
            "x": 38,
            "z": -126
          },
          {
            "x": 38,
            "z": -118
          },
          {
            "x": 30,
            "z": -118
          }
        ],
        "bounds": {
          "minX": 30,
          "maxX": 38,
          "minZ": -126,
          "maxZ": -118
        },
        "rects": [
          {
            "minX": 30,
            "maxX": 38,
            "minZ": -126,
            "maxZ": -118
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 29.825,
            "maxX": 30.175,
            "minZ": -126,
            "maxZ": -118,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 30,
            "maxX": 38,
            "minZ": -118.175,
            "maxZ": -117.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 30,
            "maxX": 38,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 37.825,
            "maxX": 38.175,
            "minZ": -126,
            "maxZ": -118,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_211",
        "name": "Block 211",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 42,
            "z": -126
          },
          {
            "x": 52,
            "z": -126
          },
          {
            "x": 52,
            "z": -116
          },
          {
            "x": 42,
            "z": -116
          }
        ],
        "bounds": {
          "minX": 42,
          "maxX": 52,
          "minZ": -126,
          "maxZ": -116
        },
        "rects": [
          {
            "minX": 42,
            "maxX": 52,
            "minZ": -126,
            "maxZ": -116
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 41.825,
            "maxX": 42.175,
            "minZ": -126,
            "maxZ": -116,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 42,
            "maxX": 52,
            "minZ": -116.175,
            "maxZ": -115.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 42,
            "maxX": 52,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 51.825,
            "maxX": 52.175,
            "minZ": -126,
            "maxZ": -116,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_212",
        "name": "Block 212",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 54,
            "z": -126
          },
          {
            "x": 66,
            "z": -126
          },
          {
            "x": 66,
            "z": -114
          },
          {
            "x": 54,
            "z": -114
          }
        ],
        "bounds": {
          "minX": 54,
          "maxX": 66,
          "minZ": -126,
          "maxZ": -114
        },
        "rects": [
          {
            "minX": 54,
            "maxX": 66,
            "minZ": -126,
            "maxZ": -114
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 53.825,
            "maxX": 54.175,
            "minZ": -126,
            "maxZ": -114,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 54,
            "maxX": 66,
            "minZ": -114.175,
            "maxZ": -113.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 54,
            "maxX": 66,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 65.825,
            "maxX": 66.175,
            "minZ": -126,
            "maxZ": -114,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_213",
        "name": "Block 213",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 66,
            "z": -126
          },
          {
            "x": 74,
            "z": -126
          },
          {
            "x": 74,
            "z": -112
          },
          {
            "x": 66,
            "z": -112
          }
        ],
        "bounds": {
          "minX": 66,
          "maxX": 74,
          "minZ": -126,
          "maxZ": -112
        },
        "rects": [
          {
            "minX": 66,
            "maxX": 74,
            "minZ": -126,
            "maxZ": -112
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 65.825,
            "maxX": 66.175,
            "minZ": -126,
            "maxZ": -112,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 66,
            "maxX": 74,
            "minZ": -112.175,
            "maxZ": -111.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 66,
            "maxX": 74,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 73.825,
            "maxX": 74.175,
            "minZ": -126,
            "maxZ": -112,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_214",
        "name": "Block 214",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 78,
            "z": -126
          },
          {
            "x": 88,
            "z": -126
          },
          {
            "x": 88,
            "z": -118
          },
          {
            "x": 78,
            "z": -118
          }
        ],
        "bounds": {
          "minX": 78,
          "maxX": 88,
          "minZ": -126,
          "maxZ": -118
        },
        "rects": [
          {
            "minX": 78,
            "maxX": 88,
            "minZ": -126,
            "maxZ": -118
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 77.825,
            "maxX": 78.175,
            "minZ": -126,
            "maxZ": -118,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 78,
            "maxX": 88,
            "minZ": -118.175,
            "maxZ": -117.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 78,
            "maxX": 88,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 87.825,
            "maxX": 88.175,
            "minZ": -126,
            "maxZ": -118,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_215",
        "name": "Block 215",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 126,
            "z": -126
          },
          {
            "x": 138,
            "z": -126
          },
          {
            "x": 138,
            "z": -118
          },
          {
            "x": 126,
            "z": -118
          }
        ],
        "bounds": {
          "minX": 126,
          "maxX": 138,
          "minZ": -126,
          "maxZ": -118
        },
        "rects": [
          {
            "minX": 126,
            "maxX": 138,
            "minZ": -126,
            "maxZ": -118
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 125.825,
            "maxX": 126.175,
            "minZ": -126,
            "maxZ": -118,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 126,
            "maxX": 138,
            "minZ": -118.175,
            "maxZ": -117.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 126,
            "maxX": 138,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 137.825,
            "maxX": 138.175,
            "minZ": -126,
            "maxZ": -118,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_216",
        "name": "Block 216",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 138,
            "z": -126
          },
          {
            "x": 146,
            "z": -126
          },
          {
            "x": 146,
            "z": -116
          },
          {
            "x": 138,
            "z": -116
          }
        ],
        "bounds": {
          "minX": 138,
          "maxX": 146,
          "minZ": -126,
          "maxZ": -116
        },
        "rects": [
          {
            "minX": 138,
            "maxX": 146,
            "minZ": -126,
            "maxZ": -116
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 137.825,
            "maxX": 138.175,
            "minZ": -126,
            "maxZ": -116,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 138,
            "maxX": 146,
            "minZ": -116.175,
            "maxZ": -115.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 138,
            "maxX": 146,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 145.825,
            "maxX": 146.175,
            "minZ": -126,
            "maxZ": -116,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_217",
        "name": "Block 217",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 150,
            "z": -126
          },
          {
            "x": 160,
            "z": -126
          },
          {
            "x": 160,
            "z": -114
          },
          {
            "x": 150,
            "z": -114
          }
        ],
        "bounds": {
          "minX": 150,
          "maxX": 160,
          "minZ": -126,
          "maxZ": -114
        },
        "rects": [
          {
            "minX": 150,
            "maxX": 160,
            "minZ": -126,
            "maxZ": -114
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 149.825,
            "maxX": 150.175,
            "minZ": -126,
            "maxZ": -114,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 150,
            "maxX": 160,
            "minZ": -114.175,
            "maxZ": -113.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 150,
            "maxX": 160,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 159.825,
            "maxX": 160.175,
            "minZ": -126,
            "maxZ": -114,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_218",
        "name": "Block 218",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 162,
            "z": -126
          },
          {
            "x": 174,
            "z": -126
          },
          {
            "x": 174,
            "z": -112
          },
          {
            "x": 162,
            "z": -112
          }
        ],
        "bounds": {
          "minX": 162,
          "maxX": 174,
          "minZ": -126,
          "maxZ": -112
        },
        "rects": [
          {
            "minX": 162,
            "maxX": 174,
            "minZ": -126,
            "maxZ": -112
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 161.825,
            "maxX": 162.175,
            "minZ": -126,
            "maxZ": -112,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 162,
            "maxX": 174,
            "minZ": -112.175,
            "maxZ": -111.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 162,
            "maxX": 174,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 173.825,
            "maxX": 174.175,
            "minZ": -126,
            "maxZ": -112,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_219",
        "name": "Block 219",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 174,
            "z": -126
          },
          {
            "x": 182,
            "z": -126
          },
          {
            "x": 182,
            "z": -118
          },
          {
            "x": 174,
            "z": -118
          }
        ],
        "bounds": {
          "minX": 174,
          "maxX": 182,
          "minZ": -126,
          "maxZ": -118
        },
        "rects": [
          {
            "minX": 174,
            "maxX": 182,
            "minZ": -126,
            "maxZ": -118
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 173.825,
            "maxX": 174.175,
            "minZ": -126,
            "maxZ": -118,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 174,
            "maxX": 182,
            "minZ": -118.175,
            "maxZ": -117.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 174,
            "maxX": 182,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 181.825,
            "maxX": 182.175,
            "minZ": -126,
            "maxZ": -118,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_220",
        "name": "Block 220",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 186,
            "z": -126
          },
          {
            "x": 196,
            "z": -126
          },
          {
            "x": 196,
            "z": -116
          },
          {
            "x": 186,
            "z": -116
          }
        ],
        "bounds": {
          "minX": 186,
          "maxX": 196,
          "minZ": -126,
          "maxZ": -116
        },
        "rects": [
          {
            "minX": 186,
            "maxX": 196,
            "minZ": -126,
            "maxZ": -116
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 185.825,
            "maxX": 186.175,
            "minZ": -126,
            "maxZ": -116,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 186,
            "maxX": 196,
            "minZ": -116.175,
            "maxZ": -115.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 186,
            "maxX": 196,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 195.825,
            "maxX": 196.175,
            "minZ": -126,
            "maxZ": -116,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_221",
        "name": "Block 221",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 198,
            "z": -126
          },
          {
            "x": 210,
            "z": -126
          },
          {
            "x": 210,
            "z": -114
          },
          {
            "x": 198,
            "z": -114
          }
        ],
        "bounds": {
          "minX": 198,
          "maxX": 210,
          "minZ": -126,
          "maxZ": -114
        },
        "rects": [
          {
            "minX": 198,
            "maxX": 210,
            "minZ": -126,
            "maxZ": -114
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 197.825,
            "maxX": 198.175,
            "minZ": -126,
            "maxZ": -114,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 198,
            "maxX": 210,
            "minZ": -114.175,
            "maxZ": -113.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 198,
            "maxX": 210,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 209.825,
            "maxX": 210.175,
            "minZ": -126,
            "maxZ": -114,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_222",
        "name": "Block 222",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 210,
            "z": -126
          },
          {
            "x": 218,
            "z": -126
          },
          {
            "x": 218,
            "z": -112
          },
          {
            "x": 210,
            "z": -112
          }
        ],
        "bounds": {
          "minX": 210,
          "maxX": 218,
          "minZ": -126,
          "maxZ": -112
        },
        "rects": [
          {
            "minX": 210,
            "maxX": 218,
            "minZ": -126,
            "maxZ": -112
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 209.825,
            "maxX": 210.175,
            "minZ": -126,
            "maxZ": -112,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 210,
            "maxX": 218,
            "minZ": -112.175,
            "maxZ": -111.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 210,
            "maxX": 218,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 217.825,
            "maxX": 218.175,
            "minZ": -126,
            "maxZ": -112,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_223",
        "name": "Block 223",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 258,
            "z": -126
          },
          {
            "x": 268,
            "z": -126
          },
          {
            "x": 268,
            "z": -112
          },
          {
            "x": 258,
            "z": -112
          }
        ],
        "bounds": {
          "minX": 258,
          "maxX": 268,
          "minZ": -126,
          "maxZ": -112
        },
        "rects": [
          {
            "minX": 258,
            "maxX": 268,
            "minZ": -126,
            "maxZ": -112
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 257.825,
            "maxX": 258.175,
            "minZ": -126,
            "maxZ": -112,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 258,
            "maxX": 268,
            "minZ": -112.175,
            "maxZ": -111.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 258,
            "maxX": 268,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 267.825,
            "maxX": 268.175,
            "minZ": -126,
            "maxZ": -112,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_224",
        "name": "Block 224",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 270,
            "z": -126
          },
          {
            "x": 282,
            "z": -126
          },
          {
            "x": 282,
            "z": -118
          },
          {
            "x": 270,
            "z": -118
          }
        ],
        "bounds": {
          "minX": 270,
          "maxX": 282,
          "minZ": -126,
          "maxZ": -118
        },
        "rects": [
          {
            "minX": 270,
            "maxX": 282,
            "minZ": -126,
            "maxZ": -118
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 269.825,
            "maxX": 270.175,
            "minZ": -126,
            "maxZ": -118,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 270,
            "maxX": 282,
            "minZ": -118.175,
            "maxZ": -117.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 270,
            "maxX": 282,
            "minZ": -126.175,
            "maxZ": -125.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 281.825,
            "maxX": 282.175,
            "minZ": -126,
            "maxZ": -118,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_225",
        "name": "Block 225",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -282,
            "z": -90
          },
          {
            "x": -272,
            "z": -90
          },
          {
            "x": -272,
            "z": -78
          },
          {
            "x": -282,
            "z": -78
          }
        ],
        "bounds": {
          "minX": -282,
          "maxX": -272,
          "minZ": -90,
          "maxZ": -78
        },
        "rects": [
          {
            "minX": -282,
            "maxX": -272,
            "minZ": -90,
            "maxZ": -78
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -272.175,
            "maxX": -271.825,
            "minZ": -90,
            "maxZ": -78,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -282.175,
            "maxX": -281.825,
            "minZ": -90,
            "maxZ": -78,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -282,
            "maxX": -272,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -282,
            "maxX": -272,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_226",
        "name": "Block 226",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -270,
            "z": -90
          },
          {
            "x": -258,
            "z": -90
          },
          {
            "x": -258,
            "z": -76
          },
          {
            "x": -270,
            "z": -76
          }
        ],
        "bounds": {
          "minX": -270,
          "maxX": -258,
          "minZ": -90,
          "maxZ": -76
        },
        "rects": [
          {
            "minX": -270,
            "maxX": -258,
            "minZ": -90,
            "maxZ": -76
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -258.175,
            "maxX": -257.825,
            "minZ": -90,
            "maxZ": -76,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -270.175,
            "maxX": -269.825,
            "minZ": -90,
            "maxZ": -76,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -270,
            "maxX": -258,
            "minZ": -76.175,
            "maxZ": -75.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -270,
            "maxX": -258,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_227",
        "name": "Block 227",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -258,
            "z": -90
          },
          {
            "x": -250,
            "z": -90
          },
          {
            "x": -250,
            "z": -82
          },
          {
            "x": -258,
            "z": -82
          }
        ],
        "bounds": {
          "minX": -258,
          "maxX": -250,
          "minZ": -90,
          "maxZ": -82
        },
        "rects": [
          {
            "minX": -258,
            "maxX": -250,
            "minZ": -90,
            "maxZ": -82
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -250.175,
            "maxX": -249.825,
            "minZ": -90,
            "maxZ": -82,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -258.175,
            "maxX": -257.825,
            "minZ": -90,
            "maxZ": -82,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -258,
            "maxX": -250,
            "minZ": -82.175,
            "maxZ": -81.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -258,
            "maxX": -250,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_228",
        "name": "Block 228",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -246,
            "z": -90
          },
          {
            "x": -236,
            "z": -90
          },
          {
            "x": -236,
            "z": -80
          },
          {
            "x": -246,
            "z": -80
          }
        ],
        "bounds": {
          "minX": -246,
          "maxX": -236,
          "minZ": -90,
          "maxZ": -80
        },
        "rects": [
          {
            "minX": -246,
            "maxX": -236,
            "minZ": -90,
            "maxZ": -80
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -236.175,
            "maxX": -235.825,
            "minZ": -90,
            "maxZ": -80,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -246.175,
            "maxX": -245.825,
            "minZ": -90,
            "maxZ": -80,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -246,
            "maxX": -236,
            "minZ": -80.175,
            "maxZ": -79.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -246,
            "maxX": -236,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_229",
        "name": "Block 229",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -234,
            "z": -90
          },
          {
            "x": -222,
            "z": -90
          },
          {
            "x": -222,
            "z": -78
          },
          {
            "x": -234,
            "z": -78
          }
        ],
        "bounds": {
          "minX": -234,
          "maxX": -222,
          "minZ": -90,
          "maxZ": -78
        },
        "rects": [
          {
            "minX": -234,
            "maxX": -222,
            "minZ": -90,
            "maxZ": -78
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -222.175,
            "maxX": -221.825,
            "minZ": -90,
            "maxZ": -78,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -234.175,
            "maxX": -233.825,
            "minZ": -90,
            "maxZ": -78,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -234,
            "maxX": -222,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -234,
            "maxX": -222,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_230",
        "name": "Block 230",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -222,
            "z": -90
          },
          {
            "x": -214,
            "z": -90
          },
          {
            "x": -214,
            "z": -76
          },
          {
            "x": -222,
            "z": -76
          }
        ],
        "bounds": {
          "minX": -222,
          "maxX": -214,
          "minZ": -90,
          "maxZ": -76
        },
        "rects": [
          {
            "minX": -222,
            "maxX": -214,
            "minZ": -90,
            "maxZ": -76
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -214.175,
            "maxX": -213.825,
            "minZ": -90,
            "maxZ": -76,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -222.175,
            "maxX": -221.825,
            "minZ": -90,
            "maxZ": -76,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -222,
            "maxX": -214,
            "minZ": -76.175,
            "maxZ": -75.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -222,
            "maxX": -214,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_231",
        "name": "Block 231",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -210,
            "z": -90
          },
          {
            "x": -200,
            "z": -90
          },
          {
            "x": -200,
            "z": -82
          },
          {
            "x": -210,
            "z": -82
          }
        ],
        "bounds": {
          "minX": -210,
          "maxX": -200,
          "minZ": -90,
          "maxZ": -82
        },
        "rects": [
          {
            "minX": -210,
            "maxX": -200,
            "minZ": -90,
            "maxZ": -82
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -200.175,
            "maxX": -199.825,
            "minZ": -90,
            "maxZ": -82,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -210.175,
            "maxX": -209.825,
            "minZ": -90,
            "maxZ": -82,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -210,
            "maxX": -200,
            "minZ": -82.175,
            "maxZ": -81.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -210,
            "maxX": -200,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_232",
        "name": "Block 232",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -198,
            "z": -90
          },
          {
            "x": -186,
            "z": -90
          },
          {
            "x": -186,
            "z": -80
          },
          {
            "x": -198,
            "z": -80
          }
        ],
        "bounds": {
          "minX": -198,
          "maxX": -186,
          "minZ": -90,
          "maxZ": -80
        },
        "rects": [
          {
            "minX": -198,
            "maxX": -186,
            "minZ": -90,
            "maxZ": -80
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -186.175,
            "maxX": -185.825,
            "minZ": -90,
            "maxZ": -80,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -198.175,
            "maxX": -197.825,
            "minZ": -90,
            "maxZ": -80,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -198,
            "maxX": -186,
            "minZ": -80.175,
            "maxZ": -79.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -198,
            "maxX": -186,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_233",
        "name": "Block 233",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -150,
            "z": -90
          },
          {
            "x": -142,
            "z": -90
          },
          {
            "x": -142,
            "z": -80
          },
          {
            "x": -150,
            "z": -80
          }
        ],
        "bounds": {
          "minX": -150,
          "maxX": -142,
          "minZ": -90,
          "maxZ": -80
        },
        "rects": [
          {
            "minX": -150,
            "maxX": -142,
            "minZ": -90,
            "maxZ": -80
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -142.175,
            "maxX": -141.825,
            "minZ": -90,
            "maxZ": -80,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -150.175,
            "maxX": -149.825,
            "minZ": -90,
            "maxZ": -80,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -150,
            "maxX": -142,
            "minZ": -80.175,
            "maxZ": -79.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -150,
            "maxX": -142,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_234",
        "name": "Block 234",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -138,
            "z": -90
          },
          {
            "x": -128,
            "z": -90
          },
          {
            "x": -128,
            "z": -78
          },
          {
            "x": -138,
            "z": -78
          }
        ],
        "bounds": {
          "minX": -138,
          "maxX": -128,
          "minZ": -90,
          "maxZ": -78
        },
        "rects": [
          {
            "minX": -138,
            "maxX": -128,
            "minZ": -90,
            "maxZ": -78
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -128.175,
            "maxX": -127.825,
            "minZ": -90,
            "maxZ": -78,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -138.175,
            "maxX": -137.825,
            "minZ": -90,
            "maxZ": -78,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -138,
            "maxX": -128,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -138,
            "maxX": -128,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_235",
        "name": "Block 235",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -126,
            "z": -90
          },
          {
            "x": -114,
            "z": -90
          },
          {
            "x": -114,
            "z": -76
          },
          {
            "x": -126,
            "z": -76
          }
        ],
        "bounds": {
          "minX": -126,
          "maxX": -114,
          "minZ": -90,
          "maxZ": -76
        },
        "rects": [
          {
            "minX": -126,
            "maxX": -114,
            "minZ": -90,
            "maxZ": -76
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -114.175,
            "maxX": -113.825,
            "minZ": -90,
            "maxZ": -76,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -126.175,
            "maxX": -125.825,
            "minZ": -90,
            "maxZ": -76,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -126,
            "maxX": -114,
            "minZ": -76.175,
            "maxZ": -75.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -126,
            "maxX": -114,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_236",
        "name": "Block 236",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -114,
            "z": -90
          },
          {
            "x": -106,
            "z": -90
          },
          {
            "x": -106,
            "z": -82
          },
          {
            "x": -114,
            "z": -82
          }
        ],
        "bounds": {
          "minX": -114,
          "maxX": -106,
          "minZ": -90,
          "maxZ": -82
        },
        "rects": [
          {
            "minX": -114,
            "maxX": -106,
            "minZ": -90,
            "maxZ": -82
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -106.175,
            "maxX": -105.825,
            "minZ": -90,
            "maxZ": -82,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -114.175,
            "maxX": -113.825,
            "minZ": -90,
            "maxZ": -82,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -114,
            "maxX": -106,
            "minZ": -82.175,
            "maxZ": -81.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -114,
            "maxX": -106,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_237",
        "name": "Block 237",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -102,
            "z": -90
          },
          {
            "x": -92,
            "z": -90
          },
          {
            "x": -92,
            "z": -80
          },
          {
            "x": -102,
            "z": -80
          }
        ],
        "bounds": {
          "minX": -102,
          "maxX": -92,
          "minZ": -90,
          "maxZ": -80
        },
        "rects": [
          {
            "minX": -102,
            "maxX": -92,
            "minZ": -90,
            "maxZ": -80
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -102.175,
            "maxX": -101.825,
            "minZ": -90,
            "maxZ": -80,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -102,
            "maxX": -92,
            "minZ": -80.175,
            "maxZ": -79.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -102,
            "maxX": -92,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -92.175,
            "maxX": -91.825,
            "minZ": -90,
            "maxZ": -80,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_238",
        "name": "Block 238",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -90,
            "z": -90
          },
          {
            "x": -78,
            "z": -90
          },
          {
            "x": -78,
            "z": -78
          },
          {
            "x": -90,
            "z": -78
          }
        ],
        "bounds": {
          "minX": -90,
          "maxX": -78,
          "minZ": -90,
          "maxZ": -78
        },
        "rects": [
          {
            "minX": -90,
            "maxX": -78,
            "minZ": -90,
            "maxZ": -78
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -78.175,
            "maxX": -77.825,
            "minZ": -90,
            "maxZ": -78,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -90.175,
            "maxX": -89.825,
            "minZ": -90,
            "maxZ": -78,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -90,
            "maxX": -78,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -90,
            "maxX": -78,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_239",
        "name": "Block 239",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -78,
            "z": -90
          },
          {
            "x": -70,
            "z": -90
          },
          {
            "x": -70,
            "z": -76
          },
          {
            "x": -78,
            "z": -76
          }
        ],
        "bounds": {
          "minX": -78,
          "maxX": -70,
          "minZ": -90,
          "maxZ": -76
        },
        "rects": [
          {
            "minX": -78,
            "maxX": -70,
            "minZ": -90,
            "maxZ": -76
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -70.175,
            "maxX": -69.825,
            "minZ": -90,
            "maxZ": -76,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -78.175,
            "maxX": -77.825,
            "minZ": -90,
            "maxZ": -76,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -78,
            "maxX": -70,
            "minZ": -76.175,
            "maxZ": -75.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -78,
            "maxX": -70,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_240",
        "name": "Block 240",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -66,
            "z": -90
          },
          {
            "x": -56,
            "z": -90
          },
          {
            "x": -56,
            "z": -82
          },
          {
            "x": -66,
            "z": -82
          }
        ],
        "bounds": {
          "minX": -66,
          "maxX": -56,
          "minZ": -90,
          "maxZ": -82
        },
        "rects": [
          {
            "minX": -66,
            "maxX": -56,
            "minZ": -90,
            "maxZ": -82
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -56.175,
            "maxX": -55.825,
            "minZ": -90,
            "maxZ": -82,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -66.175,
            "maxX": -65.825,
            "minZ": -90,
            "maxZ": -82,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -66,
            "maxX": -56,
            "minZ": -82.175,
            "maxZ": -81.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -66,
            "maxX": -56,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_241",
        "name": "Block 241",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -18,
            "z": -90
          },
          {
            "x": -6,
            "z": -90
          },
          {
            "x": -6,
            "z": -82
          },
          {
            "x": -18,
            "z": -82
          }
        ],
        "bounds": {
          "minX": -18,
          "maxX": -6,
          "minZ": -90,
          "maxZ": -82
        },
        "rects": [
          {
            "minX": -18,
            "maxX": -6,
            "minZ": -90,
            "maxZ": -82
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -18.175,
            "maxX": -17.825,
            "minZ": -90,
            "maxZ": -82,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -18,
            "maxX": -6,
            "minZ": -82.175,
            "maxZ": -81.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -18,
            "maxX": -6,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -6.175,
            "maxX": -5.825,
            "minZ": -90,
            "maxZ": -82,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_242",
        "name": "Block 242",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -6,
            "z": -90
          },
          {
            "x": 2,
            "z": -90
          },
          {
            "x": 2,
            "z": -80
          },
          {
            "x": -6,
            "z": -80
          }
        ],
        "bounds": {
          "minX": -6,
          "maxX": 2,
          "minZ": -90,
          "maxZ": -80
        },
        "rects": [
          {
            "minX": -6,
            "maxX": 2,
            "minZ": -90,
            "maxZ": -80
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -6.175,
            "maxX": -5.825,
            "minZ": -90,
            "maxZ": -80,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -6,
            "maxX": 2,
            "minZ": -80.175,
            "maxZ": -79.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -6,
            "maxX": 2,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 1.825,
            "maxX": 2.175,
            "minZ": -90,
            "maxZ": -80,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_243",
        "name": "Block 243",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 6,
            "z": -90
          },
          {
            "x": 16,
            "z": -90
          },
          {
            "x": 16,
            "z": -78
          },
          {
            "x": 6,
            "z": -78
          }
        ],
        "bounds": {
          "minX": 6,
          "maxX": 16,
          "minZ": -90,
          "maxZ": -78
        },
        "rects": [
          {
            "minX": 6,
            "maxX": 16,
            "minZ": -90,
            "maxZ": -78
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 15.825,
            "maxX": 16.175,
            "minZ": -90,
            "maxZ": -78,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 5.825,
            "maxX": 6.175,
            "minZ": -90,
            "maxZ": -78,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 6,
            "maxX": 16,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 6,
            "maxX": 16,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_244",
        "name": "Block 244",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 18,
            "z": -90
          },
          {
            "x": 30,
            "z": -90
          },
          {
            "x": 30,
            "z": -76
          },
          {
            "x": 18,
            "z": -76
          }
        ],
        "bounds": {
          "minX": 18,
          "maxX": 30,
          "minZ": -90,
          "maxZ": -76
        },
        "rects": [
          {
            "minX": 18,
            "maxX": 30,
            "minZ": -90,
            "maxZ": -76
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 17.825,
            "maxX": 18.175,
            "minZ": -90,
            "maxZ": -76,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 18,
            "maxX": 30,
            "minZ": -76.175,
            "maxZ": -75.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 18,
            "maxX": 30,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 29.825,
            "maxX": 30.175,
            "minZ": -90,
            "maxZ": -76,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_245",
        "name": "Block 245",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 30,
            "z": -90
          },
          {
            "x": 38,
            "z": -90
          },
          {
            "x": 38,
            "z": -82
          },
          {
            "x": 30,
            "z": -82
          }
        ],
        "bounds": {
          "minX": 30,
          "maxX": 38,
          "minZ": -90,
          "maxZ": -82
        },
        "rects": [
          {
            "minX": 30,
            "maxX": 38,
            "minZ": -90,
            "maxZ": -82
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 29.825,
            "maxX": 30.175,
            "minZ": -90,
            "maxZ": -82,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 30,
            "maxX": 38,
            "minZ": -82.175,
            "maxZ": -81.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 30,
            "maxX": 38,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 37.825,
            "maxX": 38.175,
            "minZ": -90,
            "maxZ": -82,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_246",
        "name": "Block 246",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 42,
            "z": -90
          },
          {
            "x": 52,
            "z": -90
          },
          {
            "x": 52,
            "z": -80
          },
          {
            "x": 42,
            "z": -80
          }
        ],
        "bounds": {
          "minX": 42,
          "maxX": 52,
          "minZ": -90,
          "maxZ": -80
        },
        "rects": [
          {
            "minX": 42,
            "maxX": 52,
            "minZ": -90,
            "maxZ": -80
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 41.825,
            "maxX": 42.175,
            "minZ": -90,
            "maxZ": -80,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 42,
            "maxX": 52,
            "minZ": -80.175,
            "maxZ": -79.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 42,
            "maxX": 52,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 51.825,
            "maxX": 52.175,
            "minZ": -90,
            "maxZ": -80,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_247",
        "name": "Block 247",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 54,
            "z": -90
          },
          {
            "x": 66,
            "z": -90
          },
          {
            "x": 66,
            "z": -78
          },
          {
            "x": 54,
            "z": -78
          }
        ],
        "bounds": {
          "minX": 54,
          "maxX": 66,
          "minZ": -90,
          "maxZ": -78
        },
        "rects": [
          {
            "minX": 54,
            "maxX": 66,
            "minZ": -90,
            "maxZ": -78
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 53.825,
            "maxX": 54.175,
            "minZ": -90,
            "maxZ": -78,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 54,
            "maxX": 66,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 54,
            "maxX": 66,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 65.825,
            "maxX": 66.175,
            "minZ": -90,
            "maxZ": -78,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_248",
        "name": "Block 248",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 66,
            "z": -90
          },
          {
            "x": 74,
            "z": -90
          },
          {
            "x": 74,
            "z": -76
          },
          {
            "x": 66,
            "z": -76
          }
        ],
        "bounds": {
          "minX": 66,
          "maxX": 74,
          "minZ": -90,
          "maxZ": -76
        },
        "rects": [
          {
            "minX": 66,
            "maxX": 74,
            "minZ": -90,
            "maxZ": -76
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 65.825,
            "maxX": 66.175,
            "minZ": -90,
            "maxZ": -76,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 66,
            "maxX": 74,
            "minZ": -76.175,
            "maxZ": -75.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 66,
            "maxX": 74,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 73.825,
            "maxX": 74.175,
            "minZ": -90,
            "maxZ": -76,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_249",
        "name": "Block 249",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 114,
            "z": -90
          },
          {
            "x": 124,
            "z": -90
          },
          {
            "x": 124,
            "z": -76
          },
          {
            "x": 114,
            "z": -76
          }
        ],
        "bounds": {
          "minX": 114,
          "maxX": 124,
          "minZ": -90,
          "maxZ": -76
        },
        "rects": [
          {
            "minX": 114,
            "maxX": 124,
            "minZ": -90,
            "maxZ": -76
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 113.825,
            "maxX": 114.175,
            "minZ": -90,
            "maxZ": -76,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 114,
            "maxX": 124,
            "minZ": -76.175,
            "maxZ": -75.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 114,
            "maxX": 124,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 123.825,
            "maxX": 124.175,
            "minZ": -90,
            "maxZ": -76,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_250",
        "name": "Block 250",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 126,
            "z": -90
          },
          {
            "x": 138,
            "z": -90
          },
          {
            "x": 138,
            "z": -82
          },
          {
            "x": 126,
            "z": -82
          }
        ],
        "bounds": {
          "minX": 126,
          "maxX": 138,
          "minZ": -90,
          "maxZ": -82
        },
        "rects": [
          {
            "minX": 126,
            "maxX": 138,
            "minZ": -90,
            "maxZ": -82
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 125.825,
            "maxX": 126.175,
            "minZ": -90,
            "maxZ": -82,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 126,
            "maxX": 138,
            "minZ": -82.175,
            "maxZ": -81.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 126,
            "maxX": 138,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 137.825,
            "maxX": 138.175,
            "minZ": -90,
            "maxZ": -82,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_251",
        "name": "Block 251",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 138,
            "z": -90
          },
          {
            "x": 146,
            "z": -90
          },
          {
            "x": 146,
            "z": -80
          },
          {
            "x": 138,
            "z": -80
          }
        ],
        "bounds": {
          "minX": 138,
          "maxX": 146,
          "minZ": -90,
          "maxZ": -80
        },
        "rects": [
          {
            "minX": 138,
            "maxX": 146,
            "minZ": -90,
            "maxZ": -80
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 137.825,
            "maxX": 138.175,
            "minZ": -90,
            "maxZ": -80,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 138,
            "maxX": 146,
            "minZ": -80.175,
            "maxZ": -79.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 138,
            "maxX": 146,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 145.825,
            "maxX": 146.175,
            "minZ": -90,
            "maxZ": -80,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_252",
        "name": "Block 252",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 150,
            "z": -90
          },
          {
            "x": 160,
            "z": -90
          },
          {
            "x": 160,
            "z": -78
          },
          {
            "x": 150,
            "z": -78
          }
        ],
        "bounds": {
          "minX": 150,
          "maxX": 160,
          "minZ": -90,
          "maxZ": -78
        },
        "rects": [
          {
            "minX": 150,
            "maxX": 160,
            "minZ": -90,
            "maxZ": -78
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 149.825,
            "maxX": 150.175,
            "minZ": -90,
            "maxZ": -78,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 150,
            "maxX": 160,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 150,
            "maxX": 160,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 159.825,
            "maxX": 160.175,
            "minZ": -90,
            "maxZ": -78,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_253",
        "name": "Block 253",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 162,
            "z": -90
          },
          {
            "x": 174,
            "z": -90
          },
          {
            "x": 174,
            "z": -76
          },
          {
            "x": 162,
            "z": -76
          }
        ],
        "bounds": {
          "minX": 162,
          "maxX": 174,
          "minZ": -90,
          "maxZ": -76
        },
        "rects": [
          {
            "minX": 162,
            "maxX": 174,
            "minZ": -90,
            "maxZ": -76
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 161.825,
            "maxX": 162.175,
            "minZ": -90,
            "maxZ": -76,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 162,
            "maxX": 174,
            "minZ": -76.175,
            "maxZ": -75.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 162,
            "maxX": 174,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 173.825,
            "maxX": 174.175,
            "minZ": -90,
            "maxZ": -76,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_254",
        "name": "Block 254",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 174,
            "z": -90
          },
          {
            "x": 182,
            "z": -90
          },
          {
            "x": 182,
            "z": -82
          },
          {
            "x": 174,
            "z": -82
          }
        ],
        "bounds": {
          "minX": 174,
          "maxX": 182,
          "minZ": -90,
          "maxZ": -82
        },
        "rects": [
          {
            "minX": 174,
            "maxX": 182,
            "minZ": -90,
            "maxZ": -82
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 173.825,
            "maxX": 174.175,
            "minZ": -90,
            "maxZ": -82,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 174,
            "maxX": 182,
            "minZ": -82.175,
            "maxZ": -81.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 174,
            "maxX": 182,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 181.825,
            "maxX": 182.175,
            "minZ": -90,
            "maxZ": -82,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_255",
        "name": "Block 255",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 186,
            "z": -90
          },
          {
            "x": 196,
            "z": -90
          },
          {
            "x": 196,
            "z": -80
          },
          {
            "x": 186,
            "z": -80
          }
        ],
        "bounds": {
          "minX": 186,
          "maxX": 196,
          "minZ": -90,
          "maxZ": -80
        },
        "rects": [
          {
            "minX": 186,
            "maxX": 196,
            "minZ": -90,
            "maxZ": -80
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 185.825,
            "maxX": 186.175,
            "minZ": -90,
            "maxZ": -80,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 186,
            "maxX": 196,
            "minZ": -80.175,
            "maxZ": -79.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 186,
            "maxX": 196,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 195.825,
            "maxX": 196.175,
            "minZ": -90,
            "maxZ": -80,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_256",
        "name": "Block 256",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 198,
            "z": -90
          },
          {
            "x": 210,
            "z": -90
          },
          {
            "x": 210,
            "z": -78
          },
          {
            "x": 198,
            "z": -78
          }
        ],
        "bounds": {
          "minX": 198,
          "maxX": 210,
          "minZ": -90,
          "maxZ": -78
        },
        "rects": [
          {
            "minX": 198,
            "maxX": 210,
            "minZ": -90,
            "maxZ": -78
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 197.825,
            "maxX": 198.175,
            "minZ": -90,
            "maxZ": -78,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 198,
            "maxX": 210,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 198,
            "maxX": 210,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 209.825,
            "maxX": 210.175,
            "minZ": -90,
            "maxZ": -78,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_257",
        "name": "Block 257",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 246,
            "z": -90
          },
          {
            "x": 254,
            "z": -90
          },
          {
            "x": 254,
            "z": -78
          },
          {
            "x": 246,
            "z": -78
          }
        ],
        "bounds": {
          "minX": 246,
          "maxX": 254,
          "minZ": -90,
          "maxZ": -78
        },
        "rects": [
          {
            "minX": 246,
            "maxX": 254,
            "minZ": -90,
            "maxZ": -78
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 245.825,
            "maxX": 246.175,
            "minZ": -90,
            "maxZ": -78,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 246,
            "maxX": 254,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 246,
            "maxX": 254,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 253.825,
            "maxX": 254.175,
            "minZ": -90,
            "maxZ": -78,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_258",
        "name": "Block 258",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 258,
            "z": -90
          },
          {
            "x": 268,
            "z": -90
          },
          {
            "x": 268,
            "z": -76
          },
          {
            "x": 258,
            "z": -76
          }
        ],
        "bounds": {
          "minX": 258,
          "maxX": 268,
          "minZ": -90,
          "maxZ": -76
        },
        "rects": [
          {
            "minX": 258,
            "maxX": 268,
            "minZ": -90,
            "maxZ": -76
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 257.825,
            "maxX": 258.175,
            "minZ": -90,
            "maxZ": -76,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 258,
            "maxX": 268,
            "minZ": -76.175,
            "maxZ": -75.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 258,
            "maxX": 268,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 267.825,
            "maxX": 268.175,
            "minZ": -90,
            "maxZ": -76,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_259",
        "name": "Block 259",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 270,
            "z": -90
          },
          {
            "x": 282,
            "z": -90
          },
          {
            "x": 282,
            "z": -82
          },
          {
            "x": 270,
            "z": -82
          }
        ],
        "bounds": {
          "minX": 270,
          "maxX": 282,
          "minZ": -90,
          "maxZ": -82
        },
        "rects": [
          {
            "minX": 270,
            "maxX": 282,
            "minZ": -90,
            "maxZ": -82
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 269.825,
            "maxX": 270.175,
            "minZ": -90,
            "maxZ": -82,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 270,
            "maxX": 282,
            "minZ": -82.175,
            "maxZ": -81.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 270,
            "maxX": 282,
            "minZ": -90.175,
            "maxZ": -89.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 281.825,
            "maxX": 282.175,
            "minZ": -90,
            "maxZ": -82,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_260",
        "name": "Block 260",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -294,
            "z": -78
          },
          {
            "x": -286,
            "z": -78
          },
          {
            "x": -286,
            "z": -68
          },
          {
            "x": -294,
            "z": -68
          }
        ],
        "bounds": {
          "minX": -294,
          "maxX": -286,
          "minZ": -78,
          "maxZ": -68
        },
        "rects": [
          {
            "minX": -294,
            "maxX": -286,
            "minZ": -78,
            "maxZ": -68
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -286.175,
            "maxX": -285.825,
            "minZ": -78,
            "maxZ": -68,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -294.175,
            "maxX": -293.825,
            "minZ": -78,
            "maxZ": -68,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -294,
            "maxX": -286,
            "minZ": -68.175,
            "maxZ": -67.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -294,
            "maxX": -286,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_261",
        "name": "Block 261",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -258,
            "z": -78
          },
          {
            "x": -250,
            "z": -78
          },
          {
            "x": -250,
            "z": -70
          },
          {
            "x": -258,
            "z": -70
          }
        ],
        "bounds": {
          "minX": -258,
          "maxX": -250,
          "minZ": -78,
          "maxZ": -70
        },
        "rects": [
          {
            "minX": -258,
            "maxX": -250,
            "minZ": -78,
            "maxZ": -70
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -250.175,
            "maxX": -249.825,
            "minZ": -78,
            "maxZ": -70,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -258.175,
            "maxX": -257.825,
            "minZ": -78,
            "maxZ": -70,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -258,
            "maxX": -250,
            "minZ": -70.175,
            "maxZ": -69.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -258,
            "maxX": -250,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_262",
        "name": "Block 262",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -246,
            "z": -78
          },
          {
            "x": -236,
            "z": -78
          },
          {
            "x": -236,
            "z": -68
          },
          {
            "x": -246,
            "z": -68
          }
        ],
        "bounds": {
          "minX": -246,
          "maxX": -236,
          "minZ": -78,
          "maxZ": -68
        },
        "rects": [
          {
            "minX": -246,
            "maxX": -236,
            "minZ": -78,
            "maxZ": -68
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -236.175,
            "maxX": -235.825,
            "minZ": -78,
            "maxZ": -68,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -246.175,
            "maxX": -245.825,
            "minZ": -78,
            "maxZ": -68,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -246,
            "maxX": -236,
            "minZ": -68.175,
            "maxZ": -67.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -246,
            "maxX": -236,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_263",
        "name": "Block 263",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -198,
            "z": -78
          },
          {
            "x": -186,
            "z": -78
          },
          {
            "x": -186,
            "z": -68
          },
          {
            "x": -198,
            "z": -68
          }
        ],
        "bounds": {
          "minX": -198,
          "maxX": -186,
          "minZ": -78,
          "maxZ": -68
        },
        "rects": [
          {
            "minX": -198,
            "maxX": -186,
            "minZ": -78,
            "maxZ": -68
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -186.175,
            "maxX": -185.825,
            "minZ": -78,
            "maxZ": -68,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -198.175,
            "maxX": -197.825,
            "minZ": -78,
            "maxZ": -68,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -198,
            "maxX": -186,
            "minZ": -68.175,
            "maxZ": -67.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -198,
            "maxX": -186,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_264",
        "name": "Block 264",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -162,
            "z": -78
          },
          {
            "x": -150,
            "z": -78
          },
          {
            "x": -150,
            "z": -70
          },
          {
            "x": -162,
            "z": -70
          }
        ],
        "bounds": {
          "minX": -162,
          "maxX": -150,
          "minZ": -78,
          "maxZ": -70
        },
        "rects": [
          {
            "minX": -162,
            "maxX": -150,
            "minZ": -78,
            "maxZ": -70
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -150.175,
            "maxX": -149.825,
            "minZ": -78,
            "maxZ": -70,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -162.175,
            "maxX": -161.825,
            "minZ": -78,
            "maxZ": -70,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -162,
            "maxX": -150,
            "minZ": -70.175,
            "maxZ": -69.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -162,
            "maxX": -150,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_265",
        "name": "Block 265",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -150,
            "z": -78
          },
          {
            "x": -142,
            "z": -78
          },
          {
            "x": -142,
            "z": -68
          },
          {
            "x": -150,
            "z": -68
          }
        ],
        "bounds": {
          "minX": -150,
          "maxX": -142,
          "minZ": -78,
          "maxZ": -68
        },
        "rects": [
          {
            "minX": -150,
            "maxX": -142,
            "minZ": -78,
            "maxZ": -68
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -142.175,
            "maxX": -141.825,
            "minZ": -78,
            "maxZ": -68,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -150.175,
            "maxX": -149.825,
            "minZ": -78,
            "maxZ": -68,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -150,
            "maxX": -142,
            "minZ": -68.175,
            "maxZ": -67.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -150,
            "maxX": -142,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_266",
        "name": "Block 266",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -114,
            "z": -78
          },
          {
            "x": -106,
            "z": -78
          },
          {
            "x": -106,
            "z": -70
          },
          {
            "x": -114,
            "z": -70
          }
        ],
        "bounds": {
          "minX": -114,
          "maxX": -106,
          "minZ": -78,
          "maxZ": -70
        },
        "rects": [
          {
            "minX": -114,
            "maxX": -106,
            "minZ": -78,
            "maxZ": -70
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -106.175,
            "maxX": -105.825,
            "minZ": -78,
            "maxZ": -70,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -114.175,
            "maxX": -113.825,
            "minZ": -78,
            "maxZ": -70,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -114,
            "maxX": -106,
            "minZ": -70.175,
            "maxZ": -69.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -114,
            "maxX": -106,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_267",
        "name": "Block 267",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -66,
            "z": -78
          },
          {
            "x": -56,
            "z": -78
          },
          {
            "x": -56,
            "z": -70
          },
          {
            "x": -66,
            "z": -70
          }
        ],
        "bounds": {
          "minX": -66,
          "maxX": -56,
          "minZ": -78,
          "maxZ": -70
        },
        "rects": [
          {
            "minX": -66,
            "maxX": -56,
            "minZ": -78,
            "maxZ": -70
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -56.175,
            "maxX": -55.825,
            "minZ": -78,
            "maxZ": -70,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -66.175,
            "maxX": -65.825,
            "minZ": -78,
            "maxZ": -70,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -66,
            "maxX": -56,
            "minZ": -70.175,
            "maxZ": -69.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -66,
            "maxX": -56,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_268",
        "name": "Block 268",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -54,
            "z": -78
          },
          {
            "x": -42,
            "z": -78
          },
          {
            "x": -42,
            "z": -68
          },
          {
            "x": -54,
            "z": -68
          }
        ],
        "bounds": {
          "minX": -54,
          "maxX": -42,
          "minZ": -78,
          "maxZ": -68
        },
        "rects": [
          {
            "minX": -54,
            "maxX": -42,
            "minZ": -78,
            "maxZ": -68
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -42.175,
            "maxX": -41.825,
            "minZ": -78,
            "maxZ": -68,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -54.175,
            "maxX": -53.825,
            "minZ": -78,
            "maxZ": -68,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -54,
            "maxX": -42,
            "minZ": -68.175,
            "maxZ": -67.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -54,
            "maxX": -42,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_269",
        "name": "Block 269",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -18,
            "z": -78
          },
          {
            "x": -6,
            "z": -78
          },
          {
            "x": -6,
            "z": -70
          },
          {
            "x": -18,
            "z": -70
          }
        ],
        "bounds": {
          "minX": -18,
          "maxX": -6,
          "minZ": -78,
          "maxZ": -70
        },
        "rects": [
          {
            "minX": -18,
            "maxX": -6,
            "minZ": -78,
            "maxZ": -70
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -18.175,
            "maxX": -17.825,
            "minZ": -78,
            "maxZ": -70,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -18,
            "maxX": -6,
            "minZ": -70.175,
            "maxZ": -69.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -18,
            "maxX": -6,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -6.175,
            "maxX": -5.825,
            "minZ": -78,
            "maxZ": -70,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_270",
        "name": "Block 270",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -6,
            "z": -78
          },
          {
            "x": 2,
            "z": -78
          },
          {
            "x": 2,
            "z": -68
          },
          {
            "x": -6,
            "z": -68
          }
        ],
        "bounds": {
          "minX": -6,
          "maxX": 2,
          "minZ": -78,
          "maxZ": -68
        },
        "rects": [
          {
            "minX": -6,
            "maxX": 2,
            "minZ": -78,
            "maxZ": -68
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -6.175,
            "maxX": -5.825,
            "minZ": -78,
            "maxZ": -68,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -6,
            "maxX": 2,
            "minZ": -68.175,
            "maxZ": -67.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -6,
            "maxX": 2,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 1.825,
            "maxX": 2.175,
            "minZ": -78,
            "maxZ": -68,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_271",
        "name": "Block 271",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 78,
            "z": -78
          },
          {
            "x": 88,
            "z": -78
          },
          {
            "x": 88,
            "z": -70
          },
          {
            "x": 78,
            "z": -70
          }
        ],
        "bounds": {
          "minX": 78,
          "maxX": 88,
          "minZ": -78,
          "maxZ": -70
        },
        "rects": [
          {
            "minX": 78,
            "maxX": 88,
            "minZ": -78,
            "maxZ": -70
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 77.825,
            "maxX": 78.175,
            "minZ": -78,
            "maxZ": -70,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 78,
            "maxX": 88,
            "minZ": -70.175,
            "maxZ": -69.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 78,
            "maxX": 88,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 87.825,
            "maxX": 88.175,
            "minZ": -78,
            "maxZ": -70,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_272",
        "name": "Block 272",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 90,
            "z": -78
          },
          {
            "x": 102,
            "z": -78
          },
          {
            "x": 102,
            "z": -68
          },
          {
            "x": 90,
            "z": -68
          }
        ],
        "bounds": {
          "minX": 90,
          "maxX": 102,
          "minZ": -78,
          "maxZ": -68
        },
        "rects": [
          {
            "minX": 90,
            "maxX": 102,
            "minZ": -78,
            "maxZ": -68
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 101.825,
            "maxX": 102.175,
            "minZ": -78,
            "maxZ": -68,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 89.825,
            "maxX": 90.175,
            "minZ": -78,
            "maxZ": -68,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 90,
            "maxX": 102,
            "minZ": -68.175,
            "maxZ": -67.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 90,
            "maxX": 102,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_273",
        "name": "Block 273",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 126,
            "z": -78
          },
          {
            "x": 138,
            "z": -78
          },
          {
            "x": 138,
            "z": -70
          },
          {
            "x": 126,
            "z": -70
          }
        ],
        "bounds": {
          "minX": 126,
          "maxX": 138,
          "minZ": -78,
          "maxZ": -70
        },
        "rects": [
          {
            "minX": 126,
            "maxX": 138,
            "minZ": -78,
            "maxZ": -70
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 125.825,
            "maxX": 126.175,
            "minZ": -78,
            "maxZ": -70,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 126,
            "maxX": 138,
            "minZ": -70.175,
            "maxZ": -69.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 126,
            "maxX": 138,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 137.825,
            "maxX": 138.175,
            "minZ": -78,
            "maxZ": -70,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_274",
        "name": "Block 274",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 138,
            "z": -78
          },
          {
            "x": 146,
            "z": -78
          },
          {
            "x": 146,
            "z": -68
          },
          {
            "x": 138,
            "z": -68
          }
        ],
        "bounds": {
          "minX": 138,
          "maxX": 146,
          "minZ": -78,
          "maxZ": -68
        },
        "rects": [
          {
            "minX": 138,
            "maxX": 146,
            "minZ": -78,
            "maxZ": -68
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 137.825,
            "maxX": 138.175,
            "minZ": -78,
            "maxZ": -68,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 138,
            "maxX": 146,
            "minZ": -68.175,
            "maxZ": -67.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 138,
            "maxX": 146,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 145.825,
            "maxX": 146.175,
            "minZ": -78,
            "maxZ": -68,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_275",
        "name": "Block 275",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 222,
            "z": -78
          },
          {
            "x": 232,
            "z": -78
          },
          {
            "x": 232,
            "z": -70
          },
          {
            "x": 222,
            "z": -70
          }
        ],
        "bounds": {
          "minX": 222,
          "maxX": 232,
          "minZ": -78,
          "maxZ": -70
        },
        "rects": [
          {
            "minX": 222,
            "maxX": 232,
            "minZ": -78,
            "maxZ": -70
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 221.825,
            "maxX": 222.175,
            "minZ": -78,
            "maxZ": -70,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 222,
            "maxX": 232,
            "minZ": -70.175,
            "maxZ": -69.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 222,
            "maxX": 232,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 231.825,
            "maxX": 232.175,
            "minZ": -78,
            "maxZ": -70,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_276",
        "name": "Block 276",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 234,
            "z": -78
          },
          {
            "x": 246,
            "z": -78
          },
          {
            "x": 246,
            "z": -68
          },
          {
            "x": 234,
            "z": -68
          }
        ],
        "bounds": {
          "minX": 234,
          "maxX": 246,
          "minZ": -78,
          "maxZ": -68
        },
        "rects": [
          {
            "minX": 234,
            "maxX": 246,
            "minZ": -78,
            "maxZ": -68
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 233.825,
            "maxX": 234.175,
            "minZ": -78,
            "maxZ": -68,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 234,
            "maxX": 246,
            "minZ": -68.175,
            "maxZ": -67.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 234,
            "maxX": 246,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 245.825,
            "maxX": 246.175,
            "minZ": -78,
            "maxZ": -68,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_277",
        "name": "Block 277",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 270,
            "z": -78
          },
          {
            "x": 282,
            "z": -78
          },
          {
            "x": 282,
            "z": -70
          },
          {
            "x": 270,
            "z": -70
          }
        ],
        "bounds": {
          "minX": 270,
          "maxX": 282,
          "minZ": -78,
          "maxZ": -70
        },
        "rects": [
          {
            "minX": 270,
            "maxX": 282,
            "minZ": -78,
            "maxZ": -70
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 269.825,
            "maxX": 270.175,
            "minZ": -78,
            "maxZ": -70,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 270,
            "maxX": 282,
            "minZ": -70.175,
            "maxZ": -69.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 270,
            "maxX": 282,
            "minZ": -78.175,
            "maxZ": -77.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 281.825,
            "maxX": 282.175,
            "minZ": -78,
            "maxZ": -70,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_278",
        "name": "Block 278",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -294,
            "z": -42
          },
          {
            "x": -286,
            "z": -42
          },
          {
            "x": -286,
            "z": -32
          },
          {
            "x": -294,
            "z": -32
          }
        ],
        "bounds": {
          "minX": -294,
          "maxX": -286,
          "minZ": -42,
          "maxZ": -32
        },
        "rects": [
          {
            "minX": -294,
            "maxX": -286,
            "minZ": -42,
            "maxZ": -32
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -286.175,
            "maxX": -285.825,
            "minZ": -42,
            "maxZ": -32,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -294.175,
            "maxX": -293.825,
            "minZ": -42,
            "maxZ": -32,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -294,
            "maxX": -286,
            "minZ": -32.175,
            "maxZ": -31.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -294,
            "maxX": -286,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_279",
        "name": "Block 279",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -282,
            "z": -42
          },
          {
            "x": -272,
            "z": -42
          },
          {
            "x": -272,
            "z": -30
          },
          {
            "x": -282,
            "z": -30
          }
        ],
        "bounds": {
          "minX": -282,
          "maxX": -272,
          "minZ": -42,
          "maxZ": -30
        },
        "rects": [
          {
            "minX": -282,
            "maxX": -272,
            "minZ": -42,
            "maxZ": -30
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -272.175,
            "maxX": -271.825,
            "minZ": -42,
            "maxZ": -30,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -282.175,
            "maxX": -281.825,
            "minZ": -42,
            "maxZ": -30,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -282,
            "maxX": -272,
            "minZ": -30.175,
            "maxZ": -29.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -282,
            "maxX": -272,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_280",
        "name": "Block 280",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -270,
            "z": -42
          },
          {
            "x": -258,
            "z": -42
          },
          {
            "x": -258,
            "z": -28
          },
          {
            "x": -270,
            "z": -28
          }
        ],
        "bounds": {
          "minX": -270,
          "maxX": -258,
          "minZ": -42,
          "maxZ": -28
        },
        "rects": [
          {
            "minX": -270,
            "maxX": -258,
            "minZ": -42,
            "maxZ": -28
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -258.175,
            "maxX": -257.825,
            "minZ": -42,
            "maxZ": -28,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -270.175,
            "maxX": -269.825,
            "minZ": -42,
            "maxZ": -28,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -270,
            "maxX": -258,
            "minZ": -28.175,
            "maxZ": -27.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -270,
            "maxX": -258,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_281",
        "name": "Block 281",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -258,
            "z": -42
          },
          {
            "x": -250,
            "z": -42
          },
          {
            "x": -250,
            "z": -34
          },
          {
            "x": -258,
            "z": -34
          }
        ],
        "bounds": {
          "minX": -258,
          "maxX": -250,
          "minZ": -42,
          "maxZ": -34
        },
        "rects": [
          {
            "minX": -258,
            "maxX": -250,
            "minZ": -42,
            "maxZ": -34
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -250.175,
            "maxX": -249.825,
            "minZ": -42,
            "maxZ": -34,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -258.175,
            "maxX": -257.825,
            "minZ": -42,
            "maxZ": -34,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -258,
            "maxX": -250,
            "minZ": -34.175,
            "maxZ": -33.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -258,
            "maxX": -250,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_282",
        "name": "Block 282",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -210,
            "z": -42
          },
          {
            "x": -200,
            "z": -42
          },
          {
            "x": -200,
            "z": -34
          },
          {
            "x": -210,
            "z": -34
          }
        ],
        "bounds": {
          "minX": -210,
          "maxX": -200,
          "minZ": -42,
          "maxZ": -34
        },
        "rects": [
          {
            "minX": -210,
            "maxX": -200,
            "minZ": -42,
            "maxZ": -34
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -200.175,
            "maxX": -199.825,
            "minZ": -42,
            "maxZ": -34,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -210.175,
            "maxX": -209.825,
            "minZ": -42,
            "maxZ": -34,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -210,
            "maxX": -200,
            "minZ": -34.175,
            "maxZ": -33.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -210,
            "maxX": -200,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_283",
        "name": "Block 283",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -198,
            "z": -42
          },
          {
            "x": -186,
            "z": -42
          },
          {
            "x": -186,
            "z": -32
          },
          {
            "x": -198,
            "z": -32
          }
        ],
        "bounds": {
          "minX": -198,
          "maxX": -186,
          "minZ": -42,
          "maxZ": -32
        },
        "rects": [
          {
            "minX": -198,
            "maxX": -186,
            "minZ": -42,
            "maxZ": -32
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -186.175,
            "maxX": -185.825,
            "minZ": -42,
            "maxZ": -32,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -198.175,
            "maxX": -197.825,
            "minZ": -42,
            "maxZ": -32,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -198,
            "maxX": -186,
            "minZ": -32.175,
            "maxZ": -31.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -198,
            "maxX": -186,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_284",
        "name": "Block 284",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -186,
            "z": -42
          },
          {
            "x": -178,
            "z": -42
          },
          {
            "x": -178,
            "z": -30
          },
          {
            "x": -186,
            "z": -30
          }
        ],
        "bounds": {
          "minX": -186,
          "maxX": -178,
          "minZ": -42,
          "maxZ": -30
        },
        "rects": [
          {
            "minX": -186,
            "maxX": -178,
            "minZ": -42,
            "maxZ": -30
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -178.175,
            "maxX": -177.825,
            "minZ": -42,
            "maxZ": -30,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -186.175,
            "maxX": -185.825,
            "minZ": -42,
            "maxZ": -30,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -186,
            "maxX": -178,
            "minZ": -30.175,
            "maxZ": -29.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -186,
            "maxX": -178,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_285",
        "name": "Block 285",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -174,
            "z": -42
          },
          {
            "x": -164,
            "z": -42
          },
          {
            "x": -164,
            "z": -28
          },
          {
            "x": -174,
            "z": -28
          }
        ],
        "bounds": {
          "minX": -174,
          "maxX": -164,
          "minZ": -42,
          "maxZ": -28
        },
        "rects": [
          {
            "minX": -174,
            "maxX": -164,
            "minZ": -42,
            "maxZ": -28
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -164.175,
            "maxX": -163.825,
            "minZ": -42,
            "maxZ": -28,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -174.175,
            "maxX": -173.825,
            "minZ": -42,
            "maxZ": -28,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -174,
            "maxX": -164,
            "minZ": -28.175,
            "maxZ": -27.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -174,
            "maxX": -164,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_286",
        "name": "Block 286",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -162,
            "z": -42
          },
          {
            "x": -150,
            "z": -42
          },
          {
            "x": -150,
            "z": -34
          },
          {
            "x": -162,
            "z": -34
          }
        ],
        "bounds": {
          "minX": -162,
          "maxX": -150,
          "minZ": -42,
          "maxZ": -34
        },
        "rects": [
          {
            "minX": -162,
            "maxX": -150,
            "minZ": -42,
            "maxZ": -34
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -150.175,
            "maxX": -149.825,
            "minZ": -42,
            "maxZ": -34,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -162.175,
            "maxX": -161.825,
            "minZ": -42,
            "maxZ": -34,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -162,
            "maxX": -150,
            "minZ": -34.175,
            "maxZ": -33.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -162,
            "maxX": -150,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_287",
        "name": "Block 287",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -150,
            "z": -42
          },
          {
            "x": -142,
            "z": -42
          },
          {
            "x": -142,
            "z": -32
          },
          {
            "x": -150,
            "z": -32
          }
        ],
        "bounds": {
          "minX": -150,
          "maxX": -142,
          "minZ": -42,
          "maxZ": -32
        },
        "rects": [
          {
            "minX": -150,
            "maxX": -142,
            "minZ": -42,
            "maxZ": -32
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -142.175,
            "maxX": -141.825,
            "minZ": -42,
            "maxZ": -32,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -150.175,
            "maxX": -149.825,
            "minZ": -42,
            "maxZ": -32,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -150,
            "maxX": -142,
            "minZ": -32.175,
            "maxZ": -31.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -150,
            "maxX": -142,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_288",
        "name": "Block 288",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -138,
            "z": -42
          },
          {
            "x": -128,
            "z": -42
          },
          {
            "x": -128,
            "z": -30
          },
          {
            "x": -138,
            "z": -30
          }
        ],
        "bounds": {
          "minX": -138,
          "maxX": -128,
          "minZ": -42,
          "maxZ": -30
        },
        "rects": [
          {
            "minX": -138,
            "maxX": -128,
            "minZ": -42,
            "maxZ": -30
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -128.175,
            "maxX": -127.825,
            "minZ": -42,
            "maxZ": -30,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -138.175,
            "maxX": -137.825,
            "minZ": -42,
            "maxZ": -30,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -138,
            "maxX": -128,
            "minZ": -30.175,
            "maxZ": -29.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -138,
            "maxX": -128,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_289",
        "name": "Block 289",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -126,
            "z": -42
          },
          {
            "x": -114,
            "z": -42
          },
          {
            "x": -114,
            "z": -28
          },
          {
            "x": -126,
            "z": -28
          }
        ],
        "bounds": {
          "minX": -126,
          "maxX": -114,
          "minZ": -42,
          "maxZ": -28
        },
        "rects": [
          {
            "minX": -126,
            "maxX": -114,
            "minZ": -42,
            "maxZ": -28
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -114.175,
            "maxX": -113.825,
            "minZ": -42,
            "maxZ": -28,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -126.175,
            "maxX": -125.825,
            "minZ": -42,
            "maxZ": -28,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -126,
            "maxX": -114,
            "minZ": -28.175,
            "maxZ": -27.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -126,
            "maxX": -114,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_290",
        "name": "Block 290",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -78,
            "z": -42
          },
          {
            "x": -70,
            "z": -42
          },
          {
            "x": -70,
            "z": -28
          },
          {
            "x": -78,
            "z": -28
          }
        ],
        "bounds": {
          "minX": -78,
          "maxX": -70,
          "minZ": -42,
          "maxZ": -28
        },
        "rects": [
          {
            "minX": -78,
            "maxX": -70,
            "minZ": -42,
            "maxZ": -28
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -70.175,
            "maxX": -69.825,
            "minZ": -42,
            "maxZ": -28,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -78.175,
            "maxX": -77.825,
            "minZ": -42,
            "maxZ": -28,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -78,
            "maxX": -70,
            "minZ": -28.175,
            "maxZ": -27.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -78,
            "maxX": -70,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_291",
        "name": "Block 291",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -66,
            "z": -42
          },
          {
            "x": -56,
            "z": -42
          },
          {
            "x": -56,
            "z": -34
          },
          {
            "x": -66,
            "z": -34
          }
        ],
        "bounds": {
          "minX": -66,
          "maxX": -56,
          "minZ": -42,
          "maxZ": -34
        },
        "rects": [
          {
            "minX": -66,
            "maxX": -56,
            "minZ": -42,
            "maxZ": -34
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -56.175,
            "maxX": -55.825,
            "minZ": -42,
            "maxZ": -34,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -66.175,
            "maxX": -65.825,
            "minZ": -42,
            "maxZ": -34,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -66,
            "maxX": -56,
            "minZ": -34.175,
            "maxZ": -33.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -66,
            "maxX": -56,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_292",
        "name": "Block 292",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -54,
            "z": -42
          },
          {
            "x": -42,
            "z": -42
          },
          {
            "x": -42,
            "z": -32
          },
          {
            "x": -54,
            "z": -32
          }
        ],
        "bounds": {
          "minX": -54,
          "maxX": -42,
          "minZ": -42,
          "maxZ": -32
        },
        "rects": [
          {
            "minX": -54,
            "maxX": -42,
            "minZ": -42,
            "maxZ": -32
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -42.175,
            "maxX": -41.825,
            "minZ": -42,
            "maxZ": -32,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -54.175,
            "maxX": -53.825,
            "minZ": -42,
            "maxZ": -32,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -54,
            "maxX": -42,
            "minZ": -32.175,
            "maxZ": -31.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -54,
            "maxX": -42,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_293",
        "name": "Block 293",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -42,
            "z": -42
          },
          {
            "x": -34,
            "z": -42
          },
          {
            "x": -34,
            "z": -30
          },
          {
            "x": -42,
            "z": -30
          }
        ],
        "bounds": {
          "minX": -42,
          "maxX": -34,
          "minZ": -42,
          "maxZ": -30
        },
        "rects": [
          {
            "minX": -42,
            "maxX": -34,
            "minZ": -42,
            "maxZ": -30
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -34.175,
            "maxX": -33.825,
            "minZ": -42,
            "maxZ": -30,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -42.175,
            "maxX": -41.825,
            "minZ": -42,
            "maxZ": -30,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -42,
            "maxX": -34,
            "minZ": -30.175,
            "maxZ": -29.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -42,
            "maxX": -34,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_294",
        "name": "Block 294",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -30,
            "z": -42
          },
          {
            "x": -20,
            "z": -42
          },
          {
            "x": -20,
            "z": -28
          },
          {
            "x": -30,
            "z": -28
          }
        ],
        "bounds": {
          "minX": -30,
          "maxX": -20,
          "minZ": -42,
          "maxZ": -28
        },
        "rects": [
          {
            "minX": -30,
            "maxX": -20,
            "minZ": -42,
            "maxZ": -28
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -20.175,
            "maxX": -19.825,
            "minZ": -42,
            "maxZ": -28,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -30.175,
            "maxX": -29.825,
            "minZ": -42,
            "maxZ": -28,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -30,
            "maxX": -20,
            "minZ": -28.175,
            "maxZ": -27.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -30,
            "maxX": -20,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_295",
        "name": "Block 295",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -18,
            "z": -42
          },
          {
            "x": -6,
            "z": -42
          },
          {
            "x": -6,
            "z": -34
          },
          {
            "x": -18,
            "z": -34
          }
        ],
        "bounds": {
          "minX": -18,
          "maxX": -6,
          "minZ": -42,
          "maxZ": -34
        },
        "rects": [
          {
            "minX": -18,
            "maxX": -6,
            "minZ": -42,
            "maxZ": -34
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -18.175,
            "maxX": -17.825,
            "minZ": -42,
            "maxZ": -34,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -18,
            "maxX": -6,
            "minZ": -34.175,
            "maxZ": -33.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -18,
            "maxX": -6,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -6.175,
            "maxX": -5.825,
            "minZ": -42,
            "maxZ": -34,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_296",
        "name": "Block 296",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -6,
            "z": -42
          },
          {
            "x": 2,
            "z": -42
          },
          {
            "x": 2,
            "z": -32
          },
          {
            "x": -6,
            "z": -32
          }
        ],
        "bounds": {
          "minX": -6,
          "maxX": 2,
          "minZ": -42,
          "maxZ": -32
        },
        "rects": [
          {
            "minX": -6,
            "maxX": 2,
            "minZ": -42,
            "maxZ": -32
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -6.175,
            "maxX": -5.825,
            "minZ": -42,
            "maxZ": -32,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -6,
            "maxX": 2,
            "minZ": -32.175,
            "maxZ": -31.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -6,
            "maxX": 2,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 1.825,
            "maxX": 2.175,
            "minZ": -42,
            "maxZ": -32,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_297",
        "name": "Block 297",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 6,
            "z": -42
          },
          {
            "x": 16,
            "z": -42
          },
          {
            "x": 16,
            "z": -30
          },
          {
            "x": 6,
            "z": -30
          }
        ],
        "bounds": {
          "minX": 6,
          "maxX": 16,
          "minZ": -42,
          "maxZ": -30
        },
        "rects": [
          {
            "minX": 6,
            "maxX": 16,
            "minZ": -42,
            "maxZ": -30
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 15.825,
            "maxX": 16.175,
            "minZ": -42,
            "maxZ": -30,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 5.825,
            "maxX": 6.175,
            "minZ": -42,
            "maxZ": -30,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 6,
            "maxX": 16,
            "minZ": -30.175,
            "maxZ": -29.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 6,
            "maxX": 16,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_298",
        "name": "Block 298",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 54,
            "z": -42
          },
          {
            "x": 66,
            "z": -42
          },
          {
            "x": 66,
            "z": -30
          },
          {
            "x": 54,
            "z": -30
          }
        ],
        "bounds": {
          "minX": 54,
          "maxX": 66,
          "minZ": -42,
          "maxZ": -30
        },
        "rects": [
          {
            "minX": 54,
            "maxX": 66,
            "minZ": -42,
            "maxZ": -30
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 53.825,
            "maxX": 54.175,
            "minZ": -42,
            "maxZ": -30,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 54,
            "maxX": 66,
            "minZ": -30.175,
            "maxZ": -29.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 54,
            "maxX": 66,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 65.825,
            "maxX": 66.175,
            "minZ": -42,
            "maxZ": -30,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_299",
        "name": "Block 299",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 66,
            "z": -42
          },
          {
            "x": 74,
            "z": -42
          },
          {
            "x": 74,
            "z": -28
          },
          {
            "x": 66,
            "z": -28
          }
        ],
        "bounds": {
          "minX": 66,
          "maxX": 74,
          "minZ": -42,
          "maxZ": -28
        },
        "rects": [
          {
            "minX": 66,
            "maxX": 74,
            "minZ": -42,
            "maxZ": -28
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 65.825,
            "maxX": 66.175,
            "minZ": -42,
            "maxZ": -28,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 66,
            "maxX": 74,
            "minZ": -28.175,
            "maxZ": -27.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 66,
            "maxX": 74,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 73.825,
            "maxX": 74.175,
            "minZ": -42,
            "maxZ": -28,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_300",
        "name": "Block 300",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 78,
            "z": -42
          },
          {
            "x": 88,
            "z": -42
          },
          {
            "x": 88,
            "z": -34
          },
          {
            "x": 78,
            "z": -34
          }
        ],
        "bounds": {
          "minX": 78,
          "maxX": 88,
          "minZ": -42,
          "maxZ": -34
        },
        "rects": [
          {
            "minX": 78,
            "maxX": 88,
            "minZ": -42,
            "maxZ": -34
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 77.825,
            "maxX": 78.175,
            "minZ": -42,
            "maxZ": -34,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 78,
            "maxX": 88,
            "minZ": -34.175,
            "maxZ": -33.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 78,
            "maxX": 88,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 87.825,
            "maxX": 88.175,
            "minZ": -42,
            "maxZ": -34,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_301",
        "name": "Block 301",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 90,
            "z": -42
          },
          {
            "x": 102,
            "z": -42
          },
          {
            "x": 102,
            "z": -32
          },
          {
            "x": 90,
            "z": -32
          }
        ],
        "bounds": {
          "minX": 90,
          "maxX": 102,
          "minZ": -42,
          "maxZ": -32
        },
        "rects": [
          {
            "minX": 90,
            "maxX": 102,
            "minZ": -42,
            "maxZ": -32
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 101.825,
            "maxX": 102.175,
            "minZ": -42,
            "maxZ": -32,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 89.825,
            "maxX": 90.175,
            "minZ": -42,
            "maxZ": -32,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 90,
            "maxX": 102,
            "minZ": -32.175,
            "maxZ": -31.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 90,
            "maxX": 102,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_302",
        "name": "Block 302",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 102,
            "z": -42
          },
          {
            "x": 110,
            "z": -42
          },
          {
            "x": 110,
            "z": -30
          },
          {
            "x": 102,
            "z": -30
          }
        ],
        "bounds": {
          "minX": 102,
          "maxX": 110,
          "minZ": -42,
          "maxZ": -30
        },
        "rects": [
          {
            "minX": 102,
            "maxX": 110,
            "minZ": -42,
            "maxZ": -30
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 101.825,
            "maxX": 102.175,
            "minZ": -42,
            "maxZ": -30,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 102,
            "maxX": 110,
            "minZ": -30.175,
            "maxZ": -29.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 102,
            "maxX": 110,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 109.825,
            "maxX": 110.175,
            "minZ": -42,
            "maxZ": -30,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_303",
        "name": "Block 303",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 114,
            "z": -42
          },
          {
            "x": 124,
            "z": -42
          },
          {
            "x": 124,
            "z": -28
          },
          {
            "x": 114,
            "z": -28
          }
        ],
        "bounds": {
          "minX": 114,
          "maxX": 124,
          "minZ": -42,
          "maxZ": -28
        },
        "rects": [
          {
            "minX": 114,
            "maxX": 124,
            "minZ": -42,
            "maxZ": -28
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 113.825,
            "maxX": 114.175,
            "minZ": -42,
            "maxZ": -28,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 114,
            "maxX": 124,
            "minZ": -28.175,
            "maxZ": -27.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 114,
            "maxX": 124,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 123.825,
            "maxX": 124.175,
            "minZ": -42,
            "maxZ": -28,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_304",
        "name": "Block 304",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 126,
            "z": -42
          },
          {
            "x": 138,
            "z": -42
          },
          {
            "x": 138,
            "z": -34
          },
          {
            "x": 126,
            "z": -34
          }
        ],
        "bounds": {
          "minX": 126,
          "maxX": 138,
          "minZ": -42,
          "maxZ": -34
        },
        "rects": [
          {
            "minX": 126,
            "maxX": 138,
            "minZ": -42,
            "maxZ": -34
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 125.825,
            "maxX": 126.175,
            "minZ": -42,
            "maxZ": -34,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 126,
            "maxX": 138,
            "minZ": -34.175,
            "maxZ": -33.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 126,
            "maxX": 138,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 137.825,
            "maxX": 138.175,
            "minZ": -42,
            "maxZ": -34,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_305",
        "name": "Block 305",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 138,
            "z": -42
          },
          {
            "x": 146,
            "z": -42
          },
          {
            "x": 146,
            "z": -32
          },
          {
            "x": 138,
            "z": -32
          }
        ],
        "bounds": {
          "minX": 138,
          "maxX": 146,
          "minZ": -42,
          "maxZ": -32
        },
        "rects": [
          {
            "minX": 138,
            "maxX": 146,
            "minZ": -42,
            "maxZ": -32
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 137.825,
            "maxX": 138.175,
            "minZ": -42,
            "maxZ": -32,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 138,
            "maxX": 146,
            "minZ": -32.175,
            "maxZ": -31.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 138,
            "maxX": 146,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 145.825,
            "maxX": 146.175,
            "minZ": -42,
            "maxZ": -32,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_306",
        "name": "Block 306",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 186,
            "z": -42
          },
          {
            "x": 196,
            "z": -42
          },
          {
            "x": 196,
            "z": -32
          },
          {
            "x": 186,
            "z": -32
          }
        ],
        "bounds": {
          "minX": 186,
          "maxX": 196,
          "minZ": -42,
          "maxZ": -32
        },
        "rects": [
          {
            "minX": 186,
            "maxX": 196,
            "minZ": -42,
            "maxZ": -32
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 185.825,
            "maxX": 186.175,
            "minZ": -42,
            "maxZ": -32,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 186,
            "maxX": 196,
            "minZ": -32.175,
            "maxZ": -31.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 186,
            "maxX": 196,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 195.825,
            "maxX": 196.175,
            "minZ": -42,
            "maxZ": -32,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_307",
        "name": "Block 307",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 198,
            "z": -42
          },
          {
            "x": 210,
            "z": -42
          },
          {
            "x": 210,
            "z": -30
          },
          {
            "x": 198,
            "z": -30
          }
        ],
        "bounds": {
          "minX": 198,
          "maxX": 210,
          "minZ": -42,
          "maxZ": -30
        },
        "rects": [
          {
            "minX": 198,
            "maxX": 210,
            "minZ": -42,
            "maxZ": -30
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 197.825,
            "maxX": 198.175,
            "minZ": -42,
            "maxZ": -30,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 198,
            "maxX": 210,
            "minZ": -30.175,
            "maxZ": -29.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 198,
            "maxX": 210,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 209.825,
            "maxX": 210.175,
            "minZ": -42,
            "maxZ": -30,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_308",
        "name": "Block 308",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 210,
            "z": -42
          },
          {
            "x": 218,
            "z": -42
          },
          {
            "x": 218,
            "z": -28
          },
          {
            "x": 210,
            "z": -28
          }
        ],
        "bounds": {
          "minX": 210,
          "maxX": 218,
          "minZ": -42,
          "maxZ": -28
        },
        "rects": [
          {
            "minX": 210,
            "maxX": 218,
            "minZ": -42,
            "maxZ": -28
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 209.825,
            "maxX": 210.175,
            "minZ": -42,
            "maxZ": -28,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 210,
            "maxX": 218,
            "minZ": -28.175,
            "maxZ": -27.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 210,
            "maxX": 218,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 217.825,
            "maxX": 218.175,
            "minZ": -42,
            "maxZ": -28,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_309",
        "name": "Block 309",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 222,
            "z": -42
          },
          {
            "x": 232,
            "z": -42
          },
          {
            "x": 232,
            "z": -34
          },
          {
            "x": 222,
            "z": -34
          }
        ],
        "bounds": {
          "minX": 222,
          "maxX": 232,
          "minZ": -42,
          "maxZ": -34
        },
        "rects": [
          {
            "minX": 222,
            "maxX": 232,
            "minZ": -42,
            "maxZ": -34
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 221.825,
            "maxX": 222.175,
            "minZ": -42,
            "maxZ": -34,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 222,
            "maxX": 232,
            "minZ": -34.175,
            "maxZ": -33.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 222,
            "maxX": 232,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 231.825,
            "maxX": 232.175,
            "minZ": -42,
            "maxZ": -34,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_310",
        "name": "Block 310",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 234,
            "z": -42
          },
          {
            "x": 246,
            "z": -42
          },
          {
            "x": 246,
            "z": -32
          },
          {
            "x": 234,
            "z": -32
          }
        ],
        "bounds": {
          "minX": 234,
          "maxX": 246,
          "minZ": -42,
          "maxZ": -32
        },
        "rects": [
          {
            "minX": 234,
            "maxX": 246,
            "minZ": -42,
            "maxZ": -32
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 233.825,
            "maxX": 234.175,
            "minZ": -42,
            "maxZ": -32,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 234,
            "maxX": 246,
            "minZ": -32.175,
            "maxZ": -31.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 234,
            "maxX": 246,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 245.825,
            "maxX": 246.175,
            "minZ": -42,
            "maxZ": -32,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_311",
        "name": "Block 311",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 246,
            "z": -42
          },
          {
            "x": 254,
            "z": -42
          },
          {
            "x": 254,
            "z": -30
          },
          {
            "x": 246,
            "z": -30
          }
        ],
        "bounds": {
          "minX": 246,
          "maxX": 254,
          "minZ": -42,
          "maxZ": -30
        },
        "rects": [
          {
            "minX": 246,
            "maxX": 254,
            "minZ": -42,
            "maxZ": -30
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 245.825,
            "maxX": 246.175,
            "minZ": -42,
            "maxZ": -30,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 246,
            "maxX": 254,
            "minZ": -30.175,
            "maxZ": -29.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 246,
            "maxX": 254,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 253.825,
            "maxX": 254.175,
            "minZ": -42,
            "maxZ": -30,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_312",
        "name": "Block 312",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 258,
            "z": -42
          },
          {
            "x": 268,
            "z": -42
          },
          {
            "x": 268,
            "z": -28
          },
          {
            "x": 258,
            "z": -28
          }
        ],
        "bounds": {
          "minX": 258,
          "maxX": 268,
          "minZ": -42,
          "maxZ": -28
        },
        "rects": [
          {
            "minX": 258,
            "maxX": 268,
            "minZ": -42,
            "maxZ": -28
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 257.825,
            "maxX": 258.175,
            "minZ": -42,
            "maxZ": -28,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 258,
            "maxX": 268,
            "minZ": -28.175,
            "maxZ": -27.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 258,
            "maxX": 268,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 267.825,
            "maxX": 268.175,
            "minZ": -42,
            "maxZ": -28,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_313",
        "name": "Block 313",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 270,
            "z": -42
          },
          {
            "x": 282,
            "z": -42
          },
          {
            "x": 282,
            "z": -34
          },
          {
            "x": 270,
            "z": -34
          }
        ],
        "bounds": {
          "minX": 270,
          "maxX": 282,
          "minZ": -42,
          "maxZ": -34
        },
        "rects": [
          {
            "minX": 270,
            "maxX": 282,
            "minZ": -42,
            "maxZ": -34
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 269.825,
            "maxX": 270.175,
            "minZ": -42,
            "maxZ": -34,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 270,
            "maxX": 282,
            "minZ": -34.175,
            "maxZ": -33.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 270,
            "maxX": 282,
            "minZ": -42.175,
            "maxZ": -41.825,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 281.825,
            "maxX": 282.175,
            "minZ": -42,
            "maxZ": -34,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_314",
        "name": "Block 314",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -294,
            "z": -6
          },
          {
            "x": -286,
            "z": -6
          },
          {
            "x": -286,
            "z": 4
          },
          {
            "x": -294,
            "z": 4
          }
        ],
        "bounds": {
          "minX": -294,
          "maxX": -286,
          "minZ": -6,
          "maxZ": 4
        },
        "rects": [
          {
            "minX": -294,
            "maxX": -286,
            "minZ": -6,
            "maxZ": 4
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -286.175,
            "maxX": -285.825,
            "minZ": -6,
            "maxZ": 4,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -294.175,
            "maxX": -293.825,
            "minZ": -6,
            "maxZ": 4,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -294,
            "maxX": -286,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -294,
            "maxX": -286,
            "minZ": 3.825,
            "maxZ": 4.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_315",
        "name": "Block 315",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -282,
            "z": -6
          },
          {
            "x": -272,
            "z": -6
          },
          {
            "x": -272,
            "z": 6
          },
          {
            "x": -282,
            "z": 6
          }
        ],
        "bounds": {
          "minX": -282,
          "maxX": -272,
          "minZ": -6,
          "maxZ": 6
        },
        "rects": [
          {
            "minX": -282,
            "maxX": -272,
            "minZ": -6,
            "maxZ": 6
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -272.175,
            "maxX": -271.825,
            "minZ": -6,
            "maxZ": 6,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -282.175,
            "maxX": -281.825,
            "minZ": -6,
            "maxZ": 6,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -282,
            "maxX": -272,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -282,
            "maxX": -272,
            "minZ": 5.825,
            "maxZ": 6.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_316",
        "name": "Block 316",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -270,
            "z": -6
          },
          {
            "x": -258,
            "z": -6
          },
          {
            "x": -258,
            "z": 8
          },
          {
            "x": -270,
            "z": 8
          }
        ],
        "bounds": {
          "minX": -270,
          "maxX": -258,
          "minZ": -6,
          "maxZ": 8
        },
        "rects": [
          {
            "minX": -270,
            "maxX": -258,
            "minZ": -6,
            "maxZ": 8
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -258.175,
            "maxX": -257.825,
            "minZ": -6,
            "maxZ": 8,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -270.175,
            "maxX": -269.825,
            "minZ": -6,
            "maxZ": 8,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -270,
            "maxX": -258,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -270,
            "maxX": -258,
            "minZ": 7.825,
            "maxZ": 8.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_317",
        "name": "Block 317",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -222,
            "z": -6
          },
          {
            "x": -214,
            "z": -6
          },
          {
            "x": -214,
            "z": 8
          },
          {
            "x": -222,
            "z": 8
          }
        ],
        "bounds": {
          "minX": -222,
          "maxX": -214,
          "minZ": -6,
          "maxZ": 8
        },
        "rects": [
          {
            "minX": -222,
            "maxX": -214,
            "minZ": -6,
            "maxZ": 8
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -214.175,
            "maxX": -213.825,
            "minZ": -6,
            "maxZ": 8,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -222.175,
            "maxX": -221.825,
            "minZ": -6,
            "maxZ": 8,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -222,
            "maxX": -214,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -222,
            "maxX": -214,
            "minZ": 7.825,
            "maxZ": 8.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_318",
        "name": "Block 318",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -210,
            "z": -6
          },
          {
            "x": -200,
            "z": -6
          },
          {
            "x": -200,
            "z": 2
          },
          {
            "x": -210,
            "z": 2
          }
        ],
        "bounds": {
          "minX": -210,
          "maxX": -200,
          "minZ": -6,
          "maxZ": 2
        },
        "rects": [
          {
            "minX": -210,
            "maxX": -200,
            "minZ": -6,
            "maxZ": 2
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -200.175,
            "maxX": -199.825,
            "minZ": -6,
            "maxZ": 2,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -210.175,
            "maxX": -209.825,
            "minZ": -6,
            "maxZ": 2,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -210,
            "maxX": -200,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -210,
            "maxX": -200,
            "minZ": 1.825,
            "maxZ": 2.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_319",
        "name": "Block 319",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -198,
            "z": -6
          },
          {
            "x": -186,
            "z": -6
          },
          {
            "x": -186,
            "z": 4
          },
          {
            "x": -198,
            "z": 4
          }
        ],
        "bounds": {
          "minX": -198,
          "maxX": -186,
          "minZ": -6,
          "maxZ": 4
        },
        "rects": [
          {
            "minX": -198,
            "maxX": -186,
            "minZ": -6,
            "maxZ": 4
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -186.175,
            "maxX": -185.825,
            "minZ": -6,
            "maxZ": 4,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -198.175,
            "maxX": -197.825,
            "minZ": -6,
            "maxZ": 4,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -198,
            "maxX": -186,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -198,
            "maxX": -186,
            "minZ": 3.825,
            "maxZ": 4.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_320",
        "name": "Block 320",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -186,
            "z": -6
          },
          {
            "x": -178,
            "z": -6
          },
          {
            "x": -178,
            "z": 6
          },
          {
            "x": -186,
            "z": 6
          }
        ],
        "bounds": {
          "minX": -186,
          "maxX": -178,
          "minZ": -6,
          "maxZ": 6
        },
        "rects": [
          {
            "minX": -186,
            "maxX": -178,
            "minZ": -6,
            "maxZ": 6
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -178.175,
            "maxX": -177.825,
            "minZ": -6,
            "maxZ": 6,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -186.175,
            "maxX": -185.825,
            "minZ": -6,
            "maxZ": 6,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -186,
            "maxX": -178,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -186,
            "maxX": -178,
            "minZ": 5.825,
            "maxZ": 6.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_321",
        "name": "Block 321",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -174,
            "z": -6
          },
          {
            "x": -164,
            "z": -6
          },
          {
            "x": -164,
            "z": 8
          },
          {
            "x": -174,
            "z": 8
          }
        ],
        "bounds": {
          "minX": -174,
          "maxX": -164,
          "minZ": -6,
          "maxZ": 8
        },
        "rects": [
          {
            "minX": -174,
            "maxX": -164,
            "minZ": -6,
            "maxZ": 8
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -164.175,
            "maxX": -163.825,
            "minZ": -6,
            "maxZ": 8,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -174.175,
            "maxX": -173.825,
            "minZ": -6,
            "maxZ": 8,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -174,
            "maxX": -164,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -174,
            "maxX": -164,
            "minZ": 7.825,
            "maxZ": 8.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_322",
        "name": "Block 322",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -162,
            "z": -6
          },
          {
            "x": -150,
            "z": -6
          },
          {
            "x": -150,
            "z": 2
          },
          {
            "x": -162,
            "z": 2
          }
        ],
        "bounds": {
          "minX": -162,
          "maxX": -150,
          "minZ": -6,
          "maxZ": 2
        },
        "rects": [
          {
            "minX": -162,
            "maxX": -150,
            "minZ": -6,
            "maxZ": 2
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -150.175,
            "maxX": -149.825,
            "minZ": -6,
            "maxZ": 2,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -162.175,
            "maxX": -161.825,
            "minZ": -6,
            "maxZ": 2,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -162,
            "maxX": -150,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -162,
            "maxX": -150,
            "minZ": 1.825,
            "maxZ": 2.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_323",
        "name": "Block 323",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -150,
            "z": -6
          },
          {
            "x": -142,
            "z": -6
          },
          {
            "x": -142,
            "z": 4
          },
          {
            "x": -150,
            "z": 4
          }
        ],
        "bounds": {
          "minX": -150,
          "maxX": -142,
          "minZ": -6,
          "maxZ": 4
        },
        "rects": [
          {
            "minX": -150,
            "maxX": -142,
            "minZ": -6,
            "maxZ": 4
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -142.175,
            "maxX": -141.825,
            "minZ": -6,
            "maxZ": 4,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -150.175,
            "maxX": -149.825,
            "minZ": -6,
            "maxZ": 4,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -150,
            "maxX": -142,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -150,
            "maxX": -142,
            "minZ": 3.825,
            "maxZ": 4.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_324",
        "name": "Block 324",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -138,
            "z": -6
          },
          {
            "x": -128,
            "z": -6
          },
          {
            "x": -128,
            "z": 6
          },
          {
            "x": -138,
            "z": 6
          }
        ],
        "bounds": {
          "minX": -138,
          "maxX": -128,
          "minZ": -6,
          "maxZ": 6
        },
        "rects": [
          {
            "minX": -138,
            "maxX": -128,
            "minZ": -6,
            "maxZ": 6
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -128.175,
            "maxX": -127.825,
            "minZ": -6,
            "maxZ": 6,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -138.175,
            "maxX": -137.825,
            "minZ": -6,
            "maxZ": 6,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -138,
            "maxX": -128,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -138,
            "maxX": -128,
            "minZ": 5.825,
            "maxZ": 6.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_325",
        "name": "Block 325",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -90,
            "z": -6
          },
          {
            "x": -78,
            "z": -6
          },
          {
            "x": -78,
            "z": 6
          },
          {
            "x": -90,
            "z": 6
          }
        ],
        "bounds": {
          "minX": -90,
          "maxX": -78,
          "minZ": -6,
          "maxZ": 6
        },
        "rects": [
          {
            "minX": -90,
            "maxX": -78,
            "minZ": -6,
            "maxZ": 6
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -78.175,
            "maxX": -77.825,
            "minZ": -6,
            "maxZ": 6,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -90.175,
            "maxX": -89.825,
            "minZ": -6,
            "maxZ": 6,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -90,
            "maxX": -78,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -90,
            "maxX": -78,
            "minZ": 5.825,
            "maxZ": 6.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_326",
        "name": "Block 326",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -78,
            "z": -6
          },
          {
            "x": -70,
            "z": -6
          },
          {
            "x": -70,
            "z": 8
          },
          {
            "x": -78,
            "z": 8
          }
        ],
        "bounds": {
          "minX": -78,
          "maxX": -70,
          "minZ": -6,
          "maxZ": 8
        },
        "rects": [
          {
            "minX": -78,
            "maxX": -70,
            "minZ": -6,
            "maxZ": 8
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -70.175,
            "maxX": -69.825,
            "minZ": -6,
            "maxZ": 8,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -78.175,
            "maxX": -77.825,
            "minZ": -6,
            "maxZ": 8,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -78,
            "maxX": -70,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -78,
            "maxX": -70,
            "minZ": 7.825,
            "maxZ": 8.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_327",
        "name": "Block 327",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -66,
            "z": -6
          },
          {
            "x": -56,
            "z": -6
          },
          {
            "x": -56,
            "z": 2
          },
          {
            "x": -66,
            "z": 2
          }
        ],
        "bounds": {
          "minX": -66,
          "maxX": -56,
          "minZ": -6,
          "maxZ": 2
        },
        "rects": [
          {
            "minX": -66,
            "maxX": -56,
            "minZ": -6,
            "maxZ": 2
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -56.175,
            "maxX": -55.825,
            "minZ": -6,
            "maxZ": 2,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -66.175,
            "maxX": -65.825,
            "minZ": -6,
            "maxZ": 2,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -66,
            "maxX": -56,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -66,
            "maxX": -56,
            "minZ": 1.825,
            "maxZ": 2.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_328",
        "name": "Block 328",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -54,
            "z": -6
          },
          {
            "x": -42,
            "z": -6
          },
          {
            "x": -42,
            "z": 4
          },
          {
            "x": -54,
            "z": 4
          }
        ],
        "bounds": {
          "minX": -54,
          "maxX": -42,
          "minZ": -6,
          "maxZ": 4
        },
        "rects": [
          {
            "minX": -54,
            "maxX": -42,
            "minZ": -6,
            "maxZ": 4
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -42.175,
            "maxX": -41.825,
            "minZ": -6,
            "maxZ": 4,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -54.175,
            "maxX": -53.825,
            "minZ": -6,
            "maxZ": 4,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -54,
            "maxX": -42,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -54,
            "maxX": -42,
            "minZ": 3.825,
            "maxZ": 4.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_329",
        "name": "Block 329",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -42,
            "z": -6
          },
          {
            "x": -34,
            "z": -6
          },
          {
            "x": -34,
            "z": 6
          },
          {
            "x": -42,
            "z": 6
          }
        ],
        "bounds": {
          "minX": -42,
          "maxX": -34,
          "minZ": -6,
          "maxZ": 6
        },
        "rects": [
          {
            "minX": -42,
            "maxX": -34,
            "minZ": -6,
            "maxZ": 6
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -34.175,
            "maxX": -33.825,
            "minZ": -6,
            "maxZ": 6,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -42.175,
            "maxX": -41.825,
            "minZ": -6,
            "maxZ": 6,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -42,
            "maxX": -34,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -42,
            "maxX": -34,
            "minZ": 5.825,
            "maxZ": 6.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_330",
        "name": "Block 330",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -30,
            "z": -6
          },
          {
            "x": -20,
            "z": -6
          },
          {
            "x": -20,
            "z": 8
          },
          {
            "x": -30,
            "z": 8
          }
        ],
        "bounds": {
          "minX": -30,
          "maxX": -20,
          "minZ": -6,
          "maxZ": 8
        },
        "rects": [
          {
            "minX": -30,
            "maxX": -20,
            "minZ": -6,
            "maxZ": 8
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -20.175,
            "maxX": -19.825,
            "minZ": -6,
            "maxZ": 8,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -30.175,
            "maxX": -29.825,
            "minZ": -6,
            "maxZ": 8,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -30,
            "maxX": -20,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -30,
            "maxX": -20,
            "minZ": 7.825,
            "maxZ": 8.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_331",
        "name": "Block 331",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -18,
            "z": -6
          },
          {
            "x": -6,
            "z": -6
          },
          {
            "x": -6,
            "z": 2
          },
          {
            "x": -18,
            "z": 2
          }
        ],
        "bounds": {
          "minX": -18,
          "maxX": -6,
          "minZ": -6,
          "maxZ": 2
        },
        "rects": [
          {
            "minX": -18,
            "maxX": -6,
            "minZ": -6,
            "maxZ": 2
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -18.175,
            "maxX": -17.825,
            "minZ": -6,
            "maxZ": 2,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -18,
            "maxX": -6,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -18,
            "maxX": -6,
            "minZ": 1.825,
            "maxZ": 2.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -6.175,
            "maxX": -5.825,
            "minZ": -6,
            "maxZ": 2,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_332",
        "name": "Block 332",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -6,
            "z": -6
          },
          {
            "x": 2,
            "z": -6
          },
          {
            "x": 2,
            "z": 4
          },
          {
            "x": -6,
            "z": 4
          }
        ],
        "bounds": {
          "minX": -6,
          "maxX": 2,
          "minZ": -6,
          "maxZ": 4
        },
        "rects": [
          {
            "minX": -6,
            "maxX": 2,
            "minZ": -6,
            "maxZ": 4
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -6.175,
            "maxX": -5.825,
            "minZ": -6,
            "maxZ": 4,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -6,
            "maxX": 2,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -6,
            "maxX": 2,
            "minZ": 3.825,
            "maxZ": 4.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 1.825,
            "maxX": 2.175,
            "minZ": -6,
            "maxZ": 4,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_333",
        "name": "Block 333",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 42,
            "z": -6
          },
          {
            "x": 52,
            "z": -6
          },
          {
            "x": 52,
            "z": 4
          },
          {
            "x": 42,
            "z": 4
          }
        ],
        "bounds": {
          "minX": 42,
          "maxX": 52,
          "minZ": -6,
          "maxZ": 4
        },
        "rects": [
          {
            "minX": 42,
            "maxX": 52,
            "minZ": -6,
            "maxZ": 4
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 41.825,
            "maxX": 42.175,
            "minZ": -6,
            "maxZ": 4,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 42,
            "maxX": 52,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 42,
            "maxX": 52,
            "minZ": 3.825,
            "maxZ": 4.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 51.825,
            "maxX": 52.175,
            "minZ": -6,
            "maxZ": 4,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_334",
        "name": "Block 334",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 54,
            "z": -6
          },
          {
            "x": 66,
            "z": -6
          },
          {
            "x": 66,
            "z": 6
          },
          {
            "x": 54,
            "z": 6
          }
        ],
        "bounds": {
          "minX": 54,
          "maxX": 66,
          "minZ": -6,
          "maxZ": 6
        },
        "rects": [
          {
            "minX": 54,
            "maxX": 66,
            "minZ": -6,
            "maxZ": 6
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 53.825,
            "maxX": 54.175,
            "minZ": -6,
            "maxZ": 6,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 54,
            "maxX": 66,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 54,
            "maxX": 66,
            "minZ": 5.825,
            "maxZ": 6.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 65.825,
            "maxX": 66.175,
            "minZ": -6,
            "maxZ": 6,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_335",
        "name": "Block 335",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 66,
            "z": -6
          },
          {
            "x": 74,
            "z": -6
          },
          {
            "x": 74,
            "z": 8
          },
          {
            "x": 66,
            "z": 8
          }
        ],
        "bounds": {
          "minX": 66,
          "maxX": 74,
          "minZ": -6,
          "maxZ": 8
        },
        "rects": [
          {
            "minX": 66,
            "maxX": 74,
            "minZ": -6,
            "maxZ": 8
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 65.825,
            "maxX": 66.175,
            "minZ": -6,
            "maxZ": 8,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 66,
            "maxX": 74,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 66,
            "maxX": 74,
            "minZ": 7.825,
            "maxZ": 8.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 73.825,
            "maxX": 74.175,
            "minZ": -6,
            "maxZ": 8,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_336",
        "name": "Block 336",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 78,
            "z": -6
          },
          {
            "x": 88,
            "z": -6
          },
          {
            "x": 88,
            "z": 2
          },
          {
            "x": 78,
            "z": 2
          }
        ],
        "bounds": {
          "minX": 78,
          "maxX": 88,
          "minZ": -6,
          "maxZ": 2
        },
        "rects": [
          {
            "minX": 78,
            "maxX": 88,
            "minZ": -6,
            "maxZ": 2
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 77.825,
            "maxX": 78.175,
            "minZ": -6,
            "maxZ": 2,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 78,
            "maxX": 88,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 78,
            "maxX": 88,
            "minZ": 1.825,
            "maxZ": 2.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 87.825,
            "maxX": 88.175,
            "minZ": -6,
            "maxZ": 2,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_337",
        "name": "Block 337",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 90,
            "z": -6
          },
          {
            "x": 102,
            "z": -6
          },
          {
            "x": 102,
            "z": 4
          },
          {
            "x": 90,
            "z": 4
          }
        ],
        "bounds": {
          "minX": 90,
          "maxX": 102,
          "minZ": -6,
          "maxZ": 4
        },
        "rects": [
          {
            "minX": 90,
            "maxX": 102,
            "minZ": -6,
            "maxZ": 4
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 101.825,
            "maxX": 102.175,
            "minZ": -6,
            "maxZ": 4,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 89.825,
            "maxX": 90.175,
            "minZ": -6,
            "maxZ": 4,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 90,
            "maxX": 102,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 90,
            "maxX": 102,
            "minZ": 3.825,
            "maxZ": 4.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_338",
        "name": "Block 338",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 102,
            "z": -6
          },
          {
            "x": 110,
            "z": -6
          },
          {
            "x": 110,
            "z": 6
          },
          {
            "x": 102,
            "z": 6
          }
        ],
        "bounds": {
          "minX": 102,
          "maxX": 110,
          "minZ": -6,
          "maxZ": 6
        },
        "rects": [
          {
            "minX": 102,
            "maxX": 110,
            "minZ": -6,
            "maxZ": 6
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 101.825,
            "maxX": 102.175,
            "minZ": -6,
            "maxZ": 6,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 102,
            "maxX": 110,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 102,
            "maxX": 110,
            "minZ": 5.825,
            "maxZ": 6.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 109.825,
            "maxX": 110.175,
            "minZ": -6,
            "maxZ": 6,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_339",
        "name": "Block 339",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 114,
            "z": -6
          },
          {
            "x": 124,
            "z": -6
          },
          {
            "x": 124,
            "z": 8
          },
          {
            "x": 114,
            "z": 8
          }
        ],
        "bounds": {
          "minX": 114,
          "maxX": 124,
          "minZ": -6,
          "maxZ": 8
        },
        "rects": [
          {
            "minX": 114,
            "maxX": 124,
            "minZ": -6,
            "maxZ": 8
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 113.825,
            "maxX": 114.175,
            "minZ": -6,
            "maxZ": 8,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 114,
            "maxX": 124,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 114,
            "maxX": 124,
            "minZ": 7.825,
            "maxZ": 8.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 123.825,
            "maxX": 124.175,
            "minZ": -6,
            "maxZ": 8,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_340",
        "name": "Block 340",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 126,
            "z": -6
          },
          {
            "x": 138,
            "z": -6
          },
          {
            "x": 138,
            "z": 2
          },
          {
            "x": 126,
            "z": 2
          }
        ],
        "bounds": {
          "minX": 126,
          "maxX": 138,
          "minZ": -6,
          "maxZ": 2
        },
        "rects": [
          {
            "minX": 126,
            "maxX": 138,
            "minZ": -6,
            "maxZ": 2
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 125.825,
            "maxX": 126.175,
            "minZ": -6,
            "maxZ": 2,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 126,
            "maxX": 138,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 126,
            "maxX": 138,
            "minZ": 1.825,
            "maxZ": 2.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 137.825,
            "maxX": 138.175,
            "minZ": -6,
            "maxZ": 2,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_341",
        "name": "Block 341",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 174,
            "z": -6
          },
          {
            "x": 182,
            "z": -6
          },
          {
            "x": 182,
            "z": 2
          },
          {
            "x": 174,
            "z": 2
          }
        ],
        "bounds": {
          "minX": 174,
          "maxX": 182,
          "minZ": -6,
          "maxZ": 2
        },
        "rects": [
          {
            "minX": 174,
            "maxX": 182,
            "minZ": -6,
            "maxZ": 2
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 173.825,
            "maxX": 174.175,
            "minZ": -6,
            "maxZ": 2,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 174,
            "maxX": 182,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 174,
            "maxX": 182,
            "minZ": 1.825,
            "maxZ": 2.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 181.825,
            "maxX": 182.175,
            "minZ": -6,
            "maxZ": 2,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_342",
        "name": "Block 342",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 186,
            "z": -6
          },
          {
            "x": 196,
            "z": -6
          },
          {
            "x": 196,
            "z": 4
          },
          {
            "x": 186,
            "z": 4
          }
        ],
        "bounds": {
          "minX": 186,
          "maxX": 196,
          "minZ": -6,
          "maxZ": 4
        },
        "rects": [
          {
            "minX": 186,
            "maxX": 196,
            "minZ": -6,
            "maxZ": 4
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 185.825,
            "maxX": 186.175,
            "minZ": -6,
            "maxZ": 4,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 186,
            "maxX": 196,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 186,
            "maxX": 196,
            "minZ": 3.825,
            "maxZ": 4.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 195.825,
            "maxX": 196.175,
            "minZ": -6,
            "maxZ": 4,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_343",
        "name": "Block 343",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 198,
            "z": -6
          },
          {
            "x": 210,
            "z": -6
          },
          {
            "x": 210,
            "z": 6
          },
          {
            "x": 198,
            "z": 6
          }
        ],
        "bounds": {
          "minX": 198,
          "maxX": 210,
          "minZ": -6,
          "maxZ": 6
        },
        "rects": [
          {
            "minX": 198,
            "maxX": 210,
            "minZ": -6,
            "maxZ": 6
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 197.825,
            "maxX": 198.175,
            "minZ": -6,
            "maxZ": 6,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 198,
            "maxX": 210,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 198,
            "maxX": 210,
            "minZ": 5.825,
            "maxZ": 6.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 209.825,
            "maxX": 210.175,
            "minZ": -6,
            "maxZ": 6,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_344",
        "name": "Block 344",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 210,
            "z": -6
          },
          {
            "x": 218,
            "z": -6
          },
          {
            "x": 218,
            "z": 8
          },
          {
            "x": 210,
            "z": 8
          }
        ],
        "bounds": {
          "minX": 210,
          "maxX": 218,
          "minZ": -6,
          "maxZ": 8
        },
        "rects": [
          {
            "minX": 210,
            "maxX": 218,
            "minZ": -6,
            "maxZ": 8
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 209.825,
            "maxX": 210.175,
            "minZ": -6,
            "maxZ": 8,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 210,
            "maxX": 218,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 210,
            "maxX": 218,
            "minZ": 7.825,
            "maxZ": 8.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 217.825,
            "maxX": 218.175,
            "minZ": -6,
            "maxZ": 8,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_345",
        "name": "Block 345",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 222,
            "z": -6
          },
          {
            "x": 232,
            "z": -6
          },
          {
            "x": 232,
            "z": 2
          },
          {
            "x": 222,
            "z": 2
          }
        ],
        "bounds": {
          "minX": 222,
          "maxX": 232,
          "minZ": -6,
          "maxZ": 2
        },
        "rects": [
          {
            "minX": 222,
            "maxX": 232,
            "minZ": -6,
            "maxZ": 2
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 221.825,
            "maxX": 222.175,
            "minZ": -6,
            "maxZ": 2,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 222,
            "maxX": 232,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 222,
            "maxX": 232,
            "minZ": 1.825,
            "maxZ": 2.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 231.825,
            "maxX": 232.175,
            "minZ": -6,
            "maxZ": 2,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_346",
        "name": "Block 346",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 234,
            "z": -6
          },
          {
            "x": 246,
            "z": -6
          },
          {
            "x": 246,
            "z": 4
          },
          {
            "x": 234,
            "z": 4
          }
        ],
        "bounds": {
          "minX": 234,
          "maxX": 246,
          "minZ": -6,
          "maxZ": 4
        },
        "rects": [
          {
            "minX": 234,
            "maxX": 246,
            "minZ": -6,
            "maxZ": 4
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 233.825,
            "maxX": 234.175,
            "minZ": -6,
            "maxZ": 4,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 234,
            "maxX": 246,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 234,
            "maxX": 246,
            "minZ": 3.825,
            "maxZ": 4.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 245.825,
            "maxX": 246.175,
            "minZ": -6,
            "maxZ": 4,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_347",
        "name": "Block 347",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 246,
            "z": -6
          },
          {
            "x": 254,
            "z": -6
          },
          {
            "x": 254,
            "z": 6
          },
          {
            "x": 246,
            "z": 6
          }
        ],
        "bounds": {
          "minX": 246,
          "maxX": 254,
          "minZ": -6,
          "maxZ": 6
        },
        "rects": [
          {
            "minX": 246,
            "maxX": 254,
            "minZ": -6,
            "maxZ": 6
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 245.825,
            "maxX": 246.175,
            "minZ": -6,
            "maxZ": 6,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 246,
            "maxX": 254,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 246,
            "maxX": 254,
            "minZ": 5.825,
            "maxZ": 6.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 253.825,
            "maxX": 254.175,
            "minZ": -6,
            "maxZ": 6,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_348",
        "name": "Block 348",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 258,
            "z": -6
          },
          {
            "x": 268,
            "z": -6
          },
          {
            "x": 268,
            "z": 8
          },
          {
            "x": 258,
            "z": 8
          }
        ],
        "bounds": {
          "minX": 258,
          "maxX": 268,
          "minZ": -6,
          "maxZ": 8
        },
        "rects": [
          {
            "minX": 258,
            "maxX": 268,
            "minZ": -6,
            "maxZ": 8
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 257.825,
            "maxX": 258.175,
            "minZ": -6,
            "maxZ": 8,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 258,
            "maxX": 268,
            "minZ": -6.175,
            "maxZ": -5.825,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 258,
            "maxX": 268,
            "minZ": 7.825,
            "maxZ": 8.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 267.825,
            "maxX": 268.175,
            "minZ": -6,
            "maxZ": 8,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_349",
        "name": "Block 349",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -294,
            "z": 30
          },
          {
            "x": -286,
            "z": 30
          },
          {
            "x": -286,
            "z": 40
          },
          {
            "x": -294,
            "z": 40
          }
        ],
        "bounds": {
          "minX": -294,
          "maxX": -286,
          "minZ": 30,
          "maxZ": 40
        },
        "rects": [
          {
            "minX": -294,
            "maxX": -286,
            "minZ": 30,
            "maxZ": 40
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -286.175,
            "maxX": -285.825,
            "minZ": 30,
            "maxZ": 40,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -294.175,
            "maxX": -293.825,
            "minZ": 30,
            "maxZ": 40,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -294,
            "maxX": -286,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -294,
            "maxX": -286,
            "minZ": 39.825,
            "maxZ": 40.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_350",
        "name": "Block 350",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -282,
            "z": 30
          },
          {
            "x": -272,
            "z": 30
          },
          {
            "x": -272,
            "z": 42
          },
          {
            "x": -282,
            "z": 42
          }
        ],
        "bounds": {
          "minX": -282,
          "maxX": -272,
          "minZ": 30,
          "maxZ": 42
        },
        "rects": [
          {
            "minX": -282,
            "maxX": -272,
            "minZ": 30,
            "maxZ": 42
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -272.175,
            "maxX": -271.825,
            "minZ": 30,
            "maxZ": 42,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -282.175,
            "maxX": -281.825,
            "minZ": 30,
            "maxZ": 42,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -282,
            "maxX": -272,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -282,
            "maxX": -272,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_351",
        "name": "Block 351",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -234,
            "z": 30
          },
          {
            "x": -222,
            "z": 30
          },
          {
            "x": -222,
            "z": 42
          },
          {
            "x": -234,
            "z": 42
          }
        ],
        "bounds": {
          "minX": -234,
          "maxX": -222,
          "minZ": 30,
          "maxZ": 42
        },
        "rects": [
          {
            "minX": -234,
            "maxX": -222,
            "minZ": 30,
            "maxZ": 42
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -222.175,
            "maxX": -221.825,
            "minZ": 30,
            "maxZ": 42,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -234.175,
            "maxX": -233.825,
            "minZ": 30,
            "maxZ": 42,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -234,
            "maxX": -222,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -234,
            "maxX": -222,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_352",
        "name": "Block 352",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -222,
            "z": 30
          },
          {
            "x": -214,
            "z": 30
          },
          {
            "x": -214,
            "z": 44
          },
          {
            "x": -222,
            "z": 44
          }
        ],
        "bounds": {
          "minX": -222,
          "maxX": -214,
          "minZ": 30,
          "maxZ": 44
        },
        "rects": [
          {
            "minX": -222,
            "maxX": -214,
            "minZ": 30,
            "maxZ": 44
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -214.175,
            "maxX": -213.825,
            "minZ": 30,
            "maxZ": 44,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -222.175,
            "maxX": -221.825,
            "minZ": 30,
            "maxZ": 44,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -222,
            "maxX": -214,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -222,
            "maxX": -214,
            "minZ": 43.825,
            "maxZ": 44.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_353",
        "name": "Block 353",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -210,
            "z": 30
          },
          {
            "x": -200,
            "z": 30
          },
          {
            "x": -200,
            "z": 38
          },
          {
            "x": -210,
            "z": 38
          }
        ],
        "bounds": {
          "minX": -210,
          "maxX": -200,
          "minZ": 30,
          "maxZ": 38
        },
        "rects": [
          {
            "minX": -210,
            "maxX": -200,
            "minZ": 30,
            "maxZ": 38
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -200.175,
            "maxX": -199.825,
            "minZ": 30,
            "maxZ": 38,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -210.175,
            "maxX": -209.825,
            "minZ": 30,
            "maxZ": 38,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -210,
            "maxX": -200,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -210,
            "maxX": -200,
            "minZ": 37.825,
            "maxZ": 38.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_354",
        "name": "Block 354",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -198,
            "z": 30
          },
          {
            "x": -186,
            "z": 30
          },
          {
            "x": -186,
            "z": 40
          },
          {
            "x": -198,
            "z": 40
          }
        ],
        "bounds": {
          "minX": -198,
          "maxX": -186,
          "minZ": 30,
          "maxZ": 40
        },
        "rects": [
          {
            "minX": -198,
            "maxX": -186,
            "minZ": 30,
            "maxZ": 40
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -186.175,
            "maxX": -185.825,
            "minZ": 30,
            "maxZ": 40,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -198.175,
            "maxX": -197.825,
            "minZ": 30,
            "maxZ": 40,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -198,
            "maxX": -186,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -198,
            "maxX": -186,
            "minZ": 39.825,
            "maxZ": 40.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_355",
        "name": "Block 355",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -186,
            "z": 30
          },
          {
            "x": -178,
            "z": 30
          },
          {
            "x": -178,
            "z": 42
          },
          {
            "x": -186,
            "z": 42
          }
        ],
        "bounds": {
          "minX": -186,
          "maxX": -178,
          "minZ": 30,
          "maxZ": 42
        },
        "rects": [
          {
            "minX": -186,
            "maxX": -178,
            "minZ": 30,
            "maxZ": 42
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -178.175,
            "maxX": -177.825,
            "minZ": 30,
            "maxZ": 42,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -186.175,
            "maxX": -185.825,
            "minZ": 30,
            "maxZ": 42,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -186,
            "maxX": -178,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -186,
            "maxX": -178,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_356",
        "name": "Block 356",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -174,
            "z": 30
          },
          {
            "x": -164,
            "z": 30
          },
          {
            "x": -164,
            "z": 44
          },
          {
            "x": -174,
            "z": 44
          }
        ],
        "bounds": {
          "minX": -174,
          "maxX": -164,
          "minZ": 30,
          "maxZ": 44
        },
        "rects": [
          {
            "minX": -174,
            "maxX": -164,
            "minZ": 30,
            "maxZ": 44
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -164.175,
            "maxX": -163.825,
            "minZ": 30,
            "maxZ": 44,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -174.175,
            "maxX": -173.825,
            "minZ": 30,
            "maxZ": 44,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -174,
            "maxX": -164,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -174,
            "maxX": -164,
            "minZ": 43.825,
            "maxZ": 44.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_357",
        "name": "Block 357",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -162,
            "z": 30
          },
          {
            "x": -150,
            "z": 30
          },
          {
            "x": -150,
            "z": 38
          },
          {
            "x": -162,
            "z": 38
          }
        ],
        "bounds": {
          "minX": -162,
          "maxX": -150,
          "minZ": 30,
          "maxZ": 38
        },
        "rects": [
          {
            "minX": -162,
            "maxX": -150,
            "minZ": 30,
            "maxZ": 38
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -150.175,
            "maxX": -149.825,
            "minZ": 30,
            "maxZ": 38,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -162.175,
            "maxX": -161.825,
            "minZ": 30,
            "maxZ": 38,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -162,
            "maxX": -150,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -162,
            "maxX": -150,
            "minZ": 37.825,
            "maxZ": 38.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_358",
        "name": "Block 358",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -150,
            "z": 30
          },
          {
            "x": -142,
            "z": 30
          },
          {
            "x": -142,
            "z": 40
          },
          {
            "x": -150,
            "z": 40
          }
        ],
        "bounds": {
          "minX": -150,
          "maxX": -142,
          "minZ": 30,
          "maxZ": 40
        },
        "rects": [
          {
            "minX": -150,
            "maxX": -142,
            "minZ": 30,
            "maxZ": 40
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -142.175,
            "maxX": -141.825,
            "minZ": 30,
            "maxZ": 40,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -150.175,
            "maxX": -149.825,
            "minZ": 30,
            "maxZ": 40,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -150,
            "maxX": -142,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -150,
            "maxX": -142,
            "minZ": 39.825,
            "maxZ": 40.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_359",
        "name": "Block 359",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -102,
            "z": 30
          },
          {
            "x": -92,
            "z": 30
          },
          {
            "x": -92,
            "z": 40
          },
          {
            "x": -102,
            "z": 40
          }
        ],
        "bounds": {
          "minX": -102,
          "maxX": -92,
          "minZ": 30,
          "maxZ": 40
        },
        "rects": [
          {
            "minX": -102,
            "maxX": -92,
            "minZ": 30,
            "maxZ": 40
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -102.175,
            "maxX": -101.825,
            "minZ": 30,
            "maxZ": 40,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -102,
            "maxX": -92,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -102,
            "maxX": -92,
            "minZ": 39.825,
            "maxZ": 40.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -92.175,
            "maxX": -91.825,
            "minZ": 30,
            "maxZ": 40,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_360",
        "name": "Block 360",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -90,
            "z": 30
          },
          {
            "x": -78,
            "z": 30
          },
          {
            "x": -78,
            "z": 42
          },
          {
            "x": -90,
            "z": 42
          }
        ],
        "bounds": {
          "minX": -90,
          "maxX": -78,
          "minZ": 30,
          "maxZ": 42
        },
        "rects": [
          {
            "minX": -90,
            "maxX": -78,
            "minZ": 30,
            "maxZ": 42
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -78.175,
            "maxX": -77.825,
            "minZ": 30,
            "maxZ": 42,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -90.175,
            "maxX": -89.825,
            "minZ": 30,
            "maxZ": 42,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -90,
            "maxX": -78,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -90,
            "maxX": -78,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_361",
        "name": "Block 361",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -78,
            "z": 30
          },
          {
            "x": -70,
            "z": 30
          },
          {
            "x": -70,
            "z": 44
          },
          {
            "x": -78,
            "z": 44
          }
        ],
        "bounds": {
          "minX": -78,
          "maxX": -70,
          "minZ": 30,
          "maxZ": 44
        },
        "rects": [
          {
            "minX": -78,
            "maxX": -70,
            "minZ": 30,
            "maxZ": 44
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -70.175,
            "maxX": -69.825,
            "minZ": 30,
            "maxZ": 44,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -78.175,
            "maxX": -77.825,
            "minZ": 30,
            "maxZ": 44,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -78,
            "maxX": -70,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -78,
            "maxX": -70,
            "minZ": 43.825,
            "maxZ": 44.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_362",
        "name": "Block 362",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -66,
            "z": 30
          },
          {
            "x": -56,
            "z": 30
          },
          {
            "x": -56,
            "z": 38
          },
          {
            "x": -66,
            "z": 38
          }
        ],
        "bounds": {
          "minX": -66,
          "maxX": -56,
          "minZ": 30,
          "maxZ": 38
        },
        "rects": [
          {
            "minX": -66,
            "maxX": -56,
            "minZ": 30,
            "maxZ": 38
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -56.175,
            "maxX": -55.825,
            "minZ": 30,
            "maxZ": 38,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -66.175,
            "maxX": -65.825,
            "minZ": 30,
            "maxZ": 38,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -66,
            "maxX": -56,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -66,
            "maxX": -56,
            "minZ": 37.825,
            "maxZ": 38.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_363",
        "name": "Block 363",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -54,
            "z": 30
          },
          {
            "x": -42,
            "z": 30
          },
          {
            "x": -42,
            "z": 40
          },
          {
            "x": -54,
            "z": 40
          }
        ],
        "bounds": {
          "minX": -54,
          "maxX": -42,
          "minZ": 30,
          "maxZ": 40
        },
        "rects": [
          {
            "minX": -54,
            "maxX": -42,
            "minZ": 30,
            "maxZ": 40
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -42.175,
            "maxX": -41.825,
            "minZ": 30,
            "maxZ": 40,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -54.175,
            "maxX": -53.825,
            "minZ": 30,
            "maxZ": 40,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -54,
            "maxX": -42,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -54,
            "maxX": -42,
            "minZ": 39.825,
            "maxZ": 40.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_364",
        "name": "Block 364",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -42,
            "z": 30
          },
          {
            "x": -34,
            "z": 30
          },
          {
            "x": -34,
            "z": 42
          },
          {
            "x": -42,
            "z": 42
          }
        ],
        "bounds": {
          "minX": -42,
          "maxX": -34,
          "minZ": 30,
          "maxZ": 42
        },
        "rects": [
          {
            "minX": -42,
            "maxX": -34,
            "minZ": 30,
            "maxZ": 42
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -34.175,
            "maxX": -33.825,
            "minZ": 30,
            "maxZ": 42,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -42.175,
            "maxX": -41.825,
            "minZ": 30,
            "maxZ": 42,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -42,
            "maxX": -34,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -42,
            "maxX": -34,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_365",
        "name": "Block 365",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -30,
            "z": 30
          },
          {
            "x": -20,
            "z": 30
          },
          {
            "x": -20,
            "z": 44
          },
          {
            "x": -30,
            "z": 44
          }
        ],
        "bounds": {
          "minX": -30,
          "maxX": -20,
          "minZ": 30,
          "maxZ": 44
        },
        "rects": [
          {
            "minX": -30,
            "maxX": -20,
            "minZ": 30,
            "maxZ": 44
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -20.175,
            "maxX": -19.825,
            "minZ": 30,
            "maxZ": 44,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -30.175,
            "maxX": -29.825,
            "minZ": 30,
            "maxZ": 44,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -30,
            "maxX": -20,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -30,
            "maxX": -20,
            "minZ": 43.825,
            "maxZ": 44.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_366",
        "name": "Block 366",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -18,
            "z": 30
          },
          {
            "x": -6,
            "z": 30
          },
          {
            "x": -6,
            "z": 38
          },
          {
            "x": -18,
            "z": 38
          }
        ],
        "bounds": {
          "minX": -18,
          "maxX": -6,
          "minZ": 30,
          "maxZ": 38
        },
        "rects": [
          {
            "minX": -18,
            "maxX": -6,
            "minZ": 30,
            "maxZ": 38
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -18.175,
            "maxX": -17.825,
            "minZ": 30,
            "maxZ": 38,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -18,
            "maxX": -6,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -18,
            "maxX": -6,
            "minZ": 37.825,
            "maxZ": 38.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -6.175,
            "maxX": -5.825,
            "minZ": 30,
            "maxZ": 38,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_367",
        "name": "Block 367",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 30,
            "z": 30
          },
          {
            "x": 38,
            "z": 30
          },
          {
            "x": 38,
            "z": 38
          },
          {
            "x": 30,
            "z": 38
          }
        ],
        "bounds": {
          "minX": 30,
          "maxX": 38,
          "minZ": 30,
          "maxZ": 38
        },
        "rects": [
          {
            "minX": 30,
            "maxX": 38,
            "minZ": 30,
            "maxZ": 38
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 29.825,
            "maxX": 30.175,
            "minZ": 30,
            "maxZ": 38,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 30,
            "maxX": 38,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 30,
            "maxX": 38,
            "minZ": 37.825,
            "maxZ": 38.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 37.825,
            "maxX": 38.175,
            "minZ": 30,
            "maxZ": 38,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_368",
        "name": "Block 368",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 42,
            "z": 30
          },
          {
            "x": 52,
            "z": 30
          },
          {
            "x": 52,
            "z": 40
          },
          {
            "x": 42,
            "z": 40
          }
        ],
        "bounds": {
          "minX": 42,
          "maxX": 52,
          "minZ": 30,
          "maxZ": 40
        },
        "rects": [
          {
            "minX": 42,
            "maxX": 52,
            "minZ": 30,
            "maxZ": 40
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 41.825,
            "maxX": 42.175,
            "minZ": 30,
            "maxZ": 40,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 42,
            "maxX": 52,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 42,
            "maxX": 52,
            "minZ": 39.825,
            "maxZ": 40.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 51.825,
            "maxX": 52.175,
            "minZ": 30,
            "maxZ": 40,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_369",
        "name": "Block 369",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 54,
            "z": 30
          },
          {
            "x": 66,
            "z": 30
          },
          {
            "x": 66,
            "z": 42
          },
          {
            "x": 54,
            "z": 42
          }
        ],
        "bounds": {
          "minX": 54,
          "maxX": 66,
          "minZ": 30,
          "maxZ": 42
        },
        "rects": [
          {
            "minX": 54,
            "maxX": 66,
            "minZ": 30,
            "maxZ": 42
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 53.825,
            "maxX": 54.175,
            "minZ": 30,
            "maxZ": 42,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 54,
            "maxX": 66,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 54,
            "maxX": 66,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 65.825,
            "maxX": 66.175,
            "minZ": 30,
            "maxZ": 42,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_370",
        "name": "Block 370",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 66,
            "z": 30
          },
          {
            "x": 74,
            "z": 30
          },
          {
            "x": 74,
            "z": 44
          },
          {
            "x": 66,
            "z": 44
          }
        ],
        "bounds": {
          "minX": 66,
          "maxX": 74,
          "minZ": 30,
          "maxZ": 44
        },
        "rects": [
          {
            "minX": 66,
            "maxX": 74,
            "minZ": 30,
            "maxZ": 44
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 65.825,
            "maxX": 66.175,
            "minZ": 30,
            "maxZ": 44,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 66,
            "maxX": 74,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 66,
            "maxX": 74,
            "minZ": 43.825,
            "maxZ": 44.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 73.825,
            "maxX": 74.175,
            "minZ": 30,
            "maxZ": 44,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_371",
        "name": "Block 371",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 78,
            "z": 30
          },
          {
            "x": 88,
            "z": 30
          },
          {
            "x": 88,
            "z": 38
          },
          {
            "x": 78,
            "z": 38
          }
        ],
        "bounds": {
          "minX": 78,
          "maxX": 88,
          "minZ": 30,
          "maxZ": 38
        },
        "rects": [
          {
            "minX": 78,
            "maxX": 88,
            "minZ": 30,
            "maxZ": 38
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 77.825,
            "maxX": 78.175,
            "minZ": 30,
            "maxZ": 38,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 78,
            "maxX": 88,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 78,
            "maxX": 88,
            "minZ": 37.825,
            "maxZ": 38.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 87.825,
            "maxX": 88.175,
            "minZ": 30,
            "maxZ": 38,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_372",
        "name": "Block 372",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 90,
            "z": 30
          },
          {
            "x": 102,
            "z": 30
          },
          {
            "x": 102,
            "z": 40
          },
          {
            "x": 90,
            "z": 40
          }
        ],
        "bounds": {
          "minX": 90,
          "maxX": 102,
          "minZ": 30,
          "maxZ": 40
        },
        "rects": [
          {
            "minX": 90,
            "maxX": 102,
            "minZ": 30,
            "maxZ": 40
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 101.825,
            "maxX": 102.175,
            "minZ": 30,
            "maxZ": 40,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 89.825,
            "maxX": 90.175,
            "minZ": 30,
            "maxZ": 40,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 90,
            "maxX": 102,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 90,
            "maxX": 102,
            "minZ": 39.825,
            "maxZ": 40.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_373",
        "name": "Block 373",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 102,
            "z": 30
          },
          {
            "x": 110,
            "z": 30
          },
          {
            "x": 110,
            "z": 42
          },
          {
            "x": 102,
            "z": 42
          }
        ],
        "bounds": {
          "minX": 102,
          "maxX": 110,
          "minZ": 30,
          "maxZ": 42
        },
        "rects": [
          {
            "minX": 102,
            "maxX": 110,
            "minZ": 30,
            "maxZ": 42
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 101.825,
            "maxX": 102.175,
            "minZ": 30,
            "maxZ": 42,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 102,
            "maxX": 110,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 102,
            "maxX": 110,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 109.825,
            "maxX": 110.175,
            "minZ": 30,
            "maxZ": 42,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_374",
        "name": "Block 374",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 114,
            "z": 30
          },
          {
            "x": 124,
            "z": 30
          },
          {
            "x": 124,
            "z": 44
          },
          {
            "x": 114,
            "z": 44
          }
        ],
        "bounds": {
          "minX": 114,
          "maxX": 124,
          "minZ": 30,
          "maxZ": 44
        },
        "rects": [
          {
            "minX": 114,
            "maxX": 124,
            "minZ": 30,
            "maxZ": 44
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 113.825,
            "maxX": 114.175,
            "minZ": 30,
            "maxZ": 44,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 114,
            "maxX": 124,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 114,
            "maxX": 124,
            "minZ": 43.825,
            "maxZ": 44.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 123.825,
            "maxX": 124.175,
            "minZ": 30,
            "maxZ": 44,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_375",
        "name": "Block 375",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 162,
            "z": 30
          },
          {
            "x": 174,
            "z": 30
          },
          {
            "x": 174,
            "z": 44
          },
          {
            "x": 162,
            "z": 44
          }
        ],
        "bounds": {
          "minX": 162,
          "maxX": 174,
          "minZ": 30,
          "maxZ": 44
        },
        "rects": [
          {
            "minX": 162,
            "maxX": 174,
            "minZ": 30,
            "maxZ": 44
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 161.825,
            "maxX": 162.175,
            "minZ": 30,
            "maxZ": 44,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 162,
            "maxX": 174,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 162,
            "maxX": 174,
            "minZ": 43.825,
            "maxZ": 44.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 173.825,
            "maxX": 174.175,
            "minZ": 30,
            "maxZ": 44,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_376",
        "name": "Block 376",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 174,
            "z": 30
          },
          {
            "x": 182,
            "z": 30
          },
          {
            "x": 182,
            "z": 38
          },
          {
            "x": 174,
            "z": 38
          }
        ],
        "bounds": {
          "minX": 174,
          "maxX": 182,
          "minZ": 30,
          "maxZ": 38
        },
        "rects": [
          {
            "minX": 174,
            "maxX": 182,
            "minZ": 30,
            "maxZ": 38
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 173.825,
            "maxX": 174.175,
            "minZ": 30,
            "maxZ": 38,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 174,
            "maxX": 182,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 174,
            "maxX": 182,
            "minZ": 37.825,
            "maxZ": 38.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 181.825,
            "maxX": 182.175,
            "minZ": 30,
            "maxZ": 38,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_377",
        "name": "Block 377",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 186,
            "z": 30
          },
          {
            "x": 196,
            "z": 30
          },
          {
            "x": 196,
            "z": 40
          },
          {
            "x": 186,
            "z": 40
          }
        ],
        "bounds": {
          "minX": 186,
          "maxX": 196,
          "minZ": 30,
          "maxZ": 40
        },
        "rects": [
          {
            "minX": 186,
            "maxX": 196,
            "minZ": 30,
            "maxZ": 40
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 185.825,
            "maxX": 186.175,
            "minZ": 30,
            "maxZ": 40,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 186,
            "maxX": 196,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 186,
            "maxX": 196,
            "minZ": 39.825,
            "maxZ": 40.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 195.825,
            "maxX": 196.175,
            "minZ": 30,
            "maxZ": 40,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_378",
        "name": "Block 378",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 198,
            "z": 30
          },
          {
            "x": 210,
            "z": 30
          },
          {
            "x": 210,
            "z": 42
          },
          {
            "x": 198,
            "z": 42
          }
        ],
        "bounds": {
          "minX": 198,
          "maxX": 210,
          "minZ": 30,
          "maxZ": 42
        },
        "rects": [
          {
            "minX": 198,
            "maxX": 210,
            "minZ": 30,
            "maxZ": 42
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 197.825,
            "maxX": 198.175,
            "minZ": 30,
            "maxZ": 42,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 198,
            "maxX": 210,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 198,
            "maxX": 210,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 209.825,
            "maxX": 210.175,
            "minZ": 30,
            "maxZ": 42,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_379",
        "name": "Block 379",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 210,
            "z": 30
          },
          {
            "x": 218,
            "z": 30
          },
          {
            "x": 218,
            "z": 44
          },
          {
            "x": 210,
            "z": 44
          }
        ],
        "bounds": {
          "minX": 210,
          "maxX": 218,
          "minZ": 30,
          "maxZ": 44
        },
        "rects": [
          {
            "minX": 210,
            "maxX": 218,
            "minZ": 30,
            "maxZ": 44
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 209.825,
            "maxX": 210.175,
            "minZ": 30,
            "maxZ": 44,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 210,
            "maxX": 218,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 210,
            "maxX": 218,
            "minZ": 43.825,
            "maxZ": 44.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 217.825,
            "maxX": 218.175,
            "minZ": 30,
            "maxZ": 44,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_380",
        "name": "Block 380",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 222,
            "z": 30
          },
          {
            "x": 232,
            "z": 30
          },
          {
            "x": 232,
            "z": 38
          },
          {
            "x": 222,
            "z": 38
          }
        ],
        "bounds": {
          "minX": 222,
          "maxX": 232,
          "minZ": 30,
          "maxZ": 38
        },
        "rects": [
          {
            "minX": 222,
            "maxX": 232,
            "minZ": 30,
            "maxZ": 38
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 221.825,
            "maxX": 222.175,
            "minZ": 30,
            "maxZ": 38,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 222,
            "maxX": 232,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 222,
            "maxX": 232,
            "minZ": 37.825,
            "maxZ": 38.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 231.825,
            "maxX": 232.175,
            "minZ": 30,
            "maxZ": 38,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_381",
        "name": "Block 381",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 234,
            "z": 30
          },
          {
            "x": 246,
            "z": 30
          },
          {
            "x": 246,
            "z": 40
          },
          {
            "x": 234,
            "z": 40
          }
        ],
        "bounds": {
          "minX": 234,
          "maxX": 246,
          "minZ": 30,
          "maxZ": 40
        },
        "rects": [
          {
            "minX": 234,
            "maxX": 246,
            "minZ": 30,
            "maxZ": 40
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 233.825,
            "maxX": 234.175,
            "minZ": 30,
            "maxZ": 40,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 234,
            "maxX": 246,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 234,
            "maxX": 246,
            "minZ": 39.825,
            "maxZ": 40.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 245.825,
            "maxX": 246.175,
            "minZ": 30,
            "maxZ": 40,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_382",
        "name": "Block 382",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 246,
            "z": 30
          },
          {
            "x": 254,
            "z": 30
          },
          {
            "x": 254,
            "z": 42
          },
          {
            "x": 246,
            "z": 42
          }
        ],
        "bounds": {
          "minX": 246,
          "maxX": 254,
          "minZ": 30,
          "maxZ": 42
        },
        "rects": [
          {
            "minX": 246,
            "maxX": 254,
            "minZ": 30,
            "maxZ": 42
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 245.825,
            "maxX": 246.175,
            "minZ": 30,
            "maxZ": 42,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 246,
            "maxX": 254,
            "minZ": 29.825,
            "maxZ": 30.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 246,
            "maxX": 254,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 253.825,
            "maxX": 254.175,
            "minZ": 30,
            "maxZ": 42,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_383",
        "name": "Block 383",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -258,
            "z": 42
          },
          {
            "x": -250,
            "z": 42
          },
          {
            "x": -250,
            "z": 50
          },
          {
            "x": -258,
            "z": 50
          }
        ],
        "bounds": {
          "minX": -258,
          "maxX": -250,
          "minZ": 42,
          "maxZ": 50
        },
        "rects": [
          {
            "minX": -258,
            "maxX": -250,
            "minZ": 42,
            "maxZ": 50
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -250.175,
            "maxX": -249.825,
            "minZ": 42,
            "maxZ": 50,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -258.175,
            "maxX": -257.825,
            "minZ": 42,
            "maxZ": 50,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -258,
            "maxX": -250,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -258,
            "maxX": -250,
            "minZ": 49.825,
            "maxZ": 50.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_384",
        "name": "Block 384",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -246,
            "z": 42
          },
          {
            "x": -236,
            "z": 42
          },
          {
            "x": -236,
            "z": 52
          },
          {
            "x": -246,
            "z": 52
          }
        ],
        "bounds": {
          "minX": -246,
          "maxX": -236,
          "minZ": 42,
          "maxZ": 52
        },
        "rects": [
          {
            "minX": -246,
            "maxX": -236,
            "minZ": 42,
            "maxZ": 52
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -236.175,
            "maxX": -235.825,
            "minZ": 42,
            "maxZ": 52,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -246.175,
            "maxX": -245.825,
            "minZ": 42,
            "maxZ": 52,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -246,
            "maxX": -236,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -246,
            "maxX": -236,
            "minZ": 51.825,
            "maxZ": 52.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_385",
        "name": "Block 385",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -210,
            "z": 42
          },
          {
            "x": -200,
            "z": 42
          },
          {
            "x": -200,
            "z": 50
          },
          {
            "x": -210,
            "z": 50
          }
        ],
        "bounds": {
          "minX": -210,
          "maxX": -200,
          "minZ": 42,
          "maxZ": 50
        },
        "rects": [
          {
            "minX": -210,
            "maxX": -200,
            "minZ": 42,
            "maxZ": 50
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -200.175,
            "maxX": -199.825,
            "minZ": 42,
            "maxZ": 50,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -210.175,
            "maxX": -209.825,
            "minZ": 42,
            "maxZ": 50,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -210,
            "maxX": -200,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -210,
            "maxX": -200,
            "minZ": 49.825,
            "maxZ": 50.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_386",
        "name": "Block 386",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -198,
            "z": 42
          },
          {
            "x": -186,
            "z": 42
          },
          {
            "x": -186,
            "z": 52
          },
          {
            "x": -198,
            "z": 52
          }
        ],
        "bounds": {
          "minX": -198,
          "maxX": -186,
          "minZ": 42,
          "maxZ": 52
        },
        "rects": [
          {
            "minX": -198,
            "maxX": -186,
            "minZ": 42,
            "maxZ": 52
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -186.175,
            "maxX": -185.825,
            "minZ": 42,
            "maxZ": 52,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -198.175,
            "maxX": -197.825,
            "minZ": 42,
            "maxZ": 52,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -198,
            "maxX": -186,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -198,
            "maxX": -186,
            "minZ": 51.825,
            "maxZ": 52.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_387",
        "name": "Block 387",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -150,
            "z": 42
          },
          {
            "x": -142,
            "z": 42
          },
          {
            "x": -142,
            "z": 52
          },
          {
            "x": -150,
            "z": 52
          }
        ],
        "bounds": {
          "minX": -150,
          "maxX": -142,
          "minZ": 42,
          "maxZ": 52
        },
        "rects": [
          {
            "minX": -150,
            "maxX": -142,
            "minZ": 42,
            "maxZ": 52
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -142.175,
            "maxX": -141.825,
            "minZ": 42,
            "maxZ": 52,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -150.175,
            "maxX": -149.825,
            "minZ": 42,
            "maxZ": 52,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -150,
            "maxX": -142,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -150,
            "maxX": -142,
            "minZ": 51.825,
            "maxZ": 52.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_388",
        "name": "Block 388",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 5,
        "roofY": 16,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -114,
            "z": 42
          },
          {
            "x": -106,
            "z": 42
          },
          {
            "x": -106,
            "z": 50
          },
          {
            "x": -114,
            "z": 50
          }
        ],
        "bounds": {
          "minX": -114,
          "maxX": -106,
          "minZ": 42,
          "maxZ": 50
        },
        "rects": [
          {
            "minX": -114,
            "maxX": -106,
            "minZ": 42,
            "maxZ": 50
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -106.175,
            "maxX": -105.825,
            "minZ": 42,
            "maxZ": 50,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -114.175,
            "maxX": -113.825,
            "minZ": 42,
            "maxZ": 50,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -114,
            "maxX": -106,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -114,
            "maxX": -106,
            "minZ": 49.825,
            "maxZ": 50.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_389",
        "name": "Block 389",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 6,
        "roofY": 21,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -102,
            "z": 42
          },
          {
            "x": -92,
            "z": 42
          },
          {
            "x": -92,
            "z": 52
          },
          {
            "x": -102,
            "z": 52
          }
        ],
        "bounds": {
          "minX": -102,
          "maxX": -92,
          "minZ": 42,
          "maxZ": 52
        },
        "rects": [
          {
            "minX": -102,
            "maxX": -92,
            "minZ": 42,
            "maxZ": 52
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -102.175,
            "maxX": -101.825,
            "minZ": 42,
            "maxZ": 52,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -102,
            "maxX": -92,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -102,
            "maxX": -92,
            "minZ": 51.825,
            "maxZ": 52.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -92.175,
            "maxX": -91.825,
            "minZ": 42,
            "maxZ": 52,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_390",
        "name": "Block 390",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 1,
        "roofY": 3.8,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -66,
            "z": 42
          },
          {
            "x": -56,
            "z": 42
          },
          {
            "x": -56,
            "z": 50
          },
          {
            "x": -66,
            "z": 50
          }
        ],
        "bounds": {
          "minX": -66,
          "maxX": -56,
          "minZ": 42,
          "maxZ": 50
        },
        "rects": [
          {
            "minX": -66,
            "maxX": -56,
            "minZ": 42,
            "maxZ": 50
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -56.175,
            "maxX": -55.825,
            "minZ": 42,
            "maxZ": 50,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -66.175,
            "maxX": -65.825,
            "minZ": 42,
            "maxZ": 50,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -66,
            "maxX": -56,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -66,
            "maxX": -56,
            "minZ": 49.825,
            "maxZ": 50.175,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_391",
        "name": "Block 391",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 2,
        "roofY": 8.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -18,
            "z": 42
          },
          {
            "x": -6,
            "z": 42
          },
          {
            "x": -6,
            "z": 50
          },
          {
            "x": -18,
            "z": 50
          }
        ],
        "bounds": {
          "minX": -18,
          "maxX": -6,
          "minZ": 42,
          "maxZ": 50
        },
        "rects": [
          {
            "minX": -18,
            "maxX": -6,
            "minZ": 42,
            "maxZ": 50
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -18.175,
            "maxX": -17.825,
            "minZ": 42,
            "maxZ": 50,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -18,
            "maxX": -6,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -18,
            "maxX": -6,
            "minZ": 49.825,
            "maxZ": 50.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": -6.175,
            "maxX": -5.825,
            "minZ": 42,
            "maxZ": 50,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_392",
        "name": "Block 392",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 3,
        "roofY": 9.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": -6,
            "z": 42
          },
          {
            "x": 2,
            "z": 42
          },
          {
            "x": 2,
            "z": 52
          },
          {
            "x": -6,
            "z": 52
          }
        ],
        "bounds": {
          "minX": -6,
          "maxX": 2,
          "minZ": 42,
          "maxZ": 52
        },
        "rects": [
          {
            "minX": -6,
            "maxX": 2,
            "minZ": 42,
            "maxZ": 52
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": -6.175,
            "maxX": -5.825,
            "minZ": 42,
            "maxZ": 52,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -6,
            "maxX": 2,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": -6,
            "maxX": 2,
            "minZ": 51.825,
            "maxZ": 52.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 1.825,
            "maxX": 2.175,
            "minZ": 42,
            "maxZ": 52,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_393",
        "name": "Block 393",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 4,
        "roofY": 14,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 30,
            "z": 42
          },
          {
            "x": 38,
            "z": 42
          },
          {
            "x": 38,
            "z": 50
          },
          {
            "x": 30,
            "z": 50
          }
        ],
        "bounds": {
          "minX": 30,
          "maxX": 38,
          "minZ": 42,
          "maxZ": 50
        },
        "rects": [
          {
            "minX": 30,
            "maxX": 38,
            "minZ": 42,
            "maxZ": 50
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 29.825,
            "maxX": 30.175,
            "minZ": 42,
            "maxZ": 50,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 30,
            "maxX": 38,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 30,
            "maxX": 38,
            "minZ": 49.825,
            "maxZ": 50.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 37.825,
            "maxX": 38.175,
            "minZ": 42,
            "maxZ": 50,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_394",
        "name": "Block 394",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 5,
        "roofY": 19,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 42,
            "z": 42
          },
          {
            "x": 52,
            "z": 42
          },
          {
            "x": 52,
            "z": 52
          },
          {
            "x": 42,
            "z": 52
          }
        ],
        "bounds": {
          "minX": 42,
          "maxX": 52,
          "minZ": 42,
          "maxZ": 52
        },
        "rects": [
          {
            "minX": 42,
            "maxX": 52,
            "minZ": 42,
            "maxZ": 52
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 41.825,
            "maxX": 42.175,
            "minZ": 42,
            "maxZ": 52,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 42,
            "maxX": 52,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 42,
            "maxX": 52,
            "minZ": 51.825,
            "maxZ": 52.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 51.825,
            "maxX": 52.175,
            "minZ": 42,
            "maxZ": 52,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_395",
        "name": "Block 395",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 6,
        "roofY": 24.6,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 126,
            "z": 42
          },
          {
            "x": 138,
            "z": 42
          },
          {
            "x": 138,
            "z": 50
          },
          {
            "x": 126,
            "z": 50
          }
        ],
        "bounds": {
          "minX": 126,
          "maxX": 138,
          "minZ": 42,
          "maxZ": 50
        },
        "rects": [
          {
            "minX": 126,
            "maxX": 138,
            "minZ": 42,
            "maxZ": 50
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 125.825,
            "maxX": 126.175,
            "minZ": 42,
            "maxZ": 50,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 126,
            "maxX": 138,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 126,
            "maxX": 138,
            "minZ": 49.825,
            "maxZ": 50.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 137.825,
            "maxX": 138.175,
            "minZ": 42,
            "maxZ": 50,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_396",
        "name": "Block 396",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.2,
        "floorsCount": 1,
        "roofY": 3.2,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 138,
            "z": 42
          },
          {
            "x": 146,
            "z": 42
          },
          {
            "x": 146,
            "z": 52
          },
          {
            "x": 138,
            "z": 52
          }
        ],
        "bounds": {
          "minX": 138,
          "maxX": 146,
          "minZ": 42,
          "maxZ": 52
        },
        "rects": [
          {
            "minX": 138,
            "maxX": 146,
            "minZ": 42,
            "maxZ": 52
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 137.825,
            "maxX": 138.175,
            "minZ": 42,
            "maxZ": 52,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 138,
            "maxX": 146,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 138,
            "maxX": 146,
            "minZ": 51.825,
            "maxZ": 52.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 145.825,
            "maxX": 146.175,
            "minZ": 42,
            "maxZ": 52,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_397",
        "name": "Block 397",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.5,
        "floorsCount": 2,
        "roofY": 7,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 174,
            "z": 42
          },
          {
            "x": 182,
            "z": 42
          },
          {
            "x": 182,
            "z": 50
          },
          {
            "x": 174,
            "z": 50
          }
        ],
        "bounds": {
          "minX": 174,
          "maxX": 182,
          "minZ": 42,
          "maxZ": 50
        },
        "rects": [
          {
            "minX": 174,
            "maxX": 182,
            "minZ": 42,
            "maxZ": 50
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 173.825,
            "maxX": 174.175,
            "minZ": 42,
            "maxZ": 50,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 174,
            "maxX": 182,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 174,
            "maxX": 182,
            "minZ": 49.825,
            "maxZ": 50.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 181.825,
            "maxX": 182.175,
            "minZ": 42,
            "maxZ": 50,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_398",
        "name": "Block 398",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 3.8,
        "floorsCount": 3,
        "roofY": 11.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 186,
            "z": 42
          },
          {
            "x": 196,
            "z": 42
          },
          {
            "x": 196,
            "z": 52
          },
          {
            "x": 186,
            "z": 52
          }
        ],
        "bounds": {
          "minX": 186,
          "maxX": 196,
          "minZ": 42,
          "maxZ": 52
        },
        "rects": [
          {
            "minX": 186,
            "maxX": 196,
            "minZ": 42,
            "maxZ": 52
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 185.825,
            "maxX": 186.175,
            "minZ": 42,
            "maxZ": 52,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 186,
            "maxX": 196,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 186,
            "maxX": 196,
            "minZ": 51.825,
            "maxZ": 52.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 195.825,
            "maxX": 196.175,
            "minZ": 42,
            "maxZ": 52,
            "facade": true
          }
        ],
        "rooms": [],
        "stairs": [],
        "doors": []
      },
      {
        "id": "b_399",
        "name": "Block 399",
        "isEnterable": false,
        "baseY": 0,
        "floorHeight": 4.1,
        "floorsCount": 4,
        "roofY": 16.4,
        "facadeMaterial": "concrete",
        "footprint": [
          {
            "x": 270,
            "z": 42
          },
          {
            "x": 282,
            "z": 42
          },
          {
            "x": 282,
            "z": 50
          },
          {
            "x": 270,
            "z": 50
          }
        ],
        "bounds": {
          "minX": 270,
          "maxX": 282,
          "minZ": 42,
          "maxZ": 50
        },
        "rects": [
          {
            "minX": 270,
            "maxX": 282,
            "minZ": 42,
            "maxZ": 50
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 269.825,
            "maxX": 270.175,
            "minZ": 42,
            "maxZ": 50,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 270,
            "maxX": 282,
            "minZ": 41.825,
            "maxZ": 42.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 270,
            "maxX": 282,
            "minZ": 49.825,
            "maxZ": 50.175,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 281.825,
            "maxX": 282.175,
            "minZ": 42,
            "maxZ": 50,
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
        "id": "road_x_-260",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": -296,
            "maxX": 296,
            "minZ": -266,
            "maxZ": -254,
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
        "id": "road_x_-220",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": -296,
            "maxX": 296,
            "minZ": -226,
            "maxZ": -214,
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
        "id": "road_x_-180",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": -296,
            "maxX": 296,
            "minZ": -186,
            "maxZ": -174,
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
        "id": "road_x_-140",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": -296,
            "maxX": 296,
            "minZ": -146,
            "maxZ": -134,
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
        "id": "road_x_-100",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": -296,
            "maxX": 296,
            "minZ": -106,
            "maxZ": -94,
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
        "id": "road_x_-60",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": -296,
            "maxX": 296,
            "minZ": -66,
            "maxZ": -54,
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
        "id": "road_x_-20",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": -296,
            "maxX": 296,
            "minZ": -26,
            "maxZ": -14,
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
        "id": "road_x_20",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": -296,
            "maxX": 296,
            "minZ": 14,
            "maxZ": 26,
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
        "id": "road_x_60",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": -296,
            "maxX": 296,
            "minZ": 54,
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
        "id": "road_x_100",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": -296,
            "maxX": 296,
            "minZ": 94,
            "maxZ": 106,
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
        "id": "road_x_140",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": -296,
            "maxX": 296,
            "minZ": 134,
            "maxZ": 146,
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
        "id": "road_x_180",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": -296,
            "maxX": 296,
            "minZ": 174,
            "maxZ": 186,
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
        "id": "road_x_220",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": -296,
            "maxX": 296,
            "minZ": 214,
            "maxZ": 226,
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
        "id": "road_x_260",
        "type": "ground",
        "width": 12,
        "withLamps": false,
        "decks": [
          {
            "minX": -296,
            "maxX": 296,
            "minZ": 254,
            "maxZ": 266,
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
      }
    ],
    "props": [],
    "lights": []
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
      "x": 20,
      "z": 20
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
