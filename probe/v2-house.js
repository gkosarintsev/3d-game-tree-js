/**
 * СГЕНЕРИРОВАННО — руками не править.
 *
 * Источник правки: probe/v2-house.json. После его изменения запуск
 * `node tools/build-level.mjs probe/v2-house.json` перезаписывает этот файл
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
export const V2_HOUSE = {
  "name": "Косой квартал",
  "hint": "—",
  "map": {
    "kind": "json2",
    "units": "meters",
    "ground": {
      "y": 0,
      "size": 120,
      "color": "#23262c"
    },
    "bounds": {
      "minX": -60,
      "maxX": 60,
      "minZ": -60,
      "maxZ": 60
    },
    "spawn": {
      "x": 18,
      "z": 30
    },
    "buildings": [
      {
        "id": "h_slant",
        "name": "Косой дом",
        "isEnterable": true,
        "baseY": 0,
        "floorHeight": 4,
        "floorsCount": 2,
        "roofY": 8,
        "facadeMaterial": "concrete",
        "roof": {
          "walkable": true,
          "parapet": 0.9
        },
        "footprint": [
          {
            "x": 8,
            "z": 8
          },
          {
            "x": 32,
            "z": 8
          },
          {
            "x": 32,
            "z": 16
          },
          {
            "x": 8,
            "z": 16
          }
        ],
        "bounds": {
          "minX": 8,
          "maxX": 32,
          "minZ": 8,
          "maxZ": 16
        },
        "rotation": 30,
        "rects": [
          {
            "minX": 8,
            "maxX": 32,
            "minZ": 8,
            "maxZ": 16
          }
        ],
        "walls": [
          {
            "axis": "z",
            "minX": 19.825,
            "maxX": 20.175,
            "minZ": 8,
            "maxZ": 16,
            "facade": false
          },
          {
            "axis": "x",
            "minX": 20,
            "maxX": 32,
            "minZ": 15.825,
            "maxZ": 16.175,
            "facade": false
          },
          {
            "axis": "x",
            "minX": 20,
            "maxX": 32,
            "minZ": 7.825,
            "maxZ": 8.175,
            "facade": false
          },
          {
            "axis": "z",
            "minX": 31.825,
            "maxX": 32.175,
            "minZ": 8,
            "maxZ": 16,
            "facade": true
          },
          {
            "axis": "z",
            "minX": 7.825,
            "maxX": 8.175,
            "minZ": 8,
            "maxZ": 16,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 8,
            "maxX": 20,
            "minZ": 15.825,
            "maxZ": 16.175,
            "facade": false
          },
          {
            "axis": "x",
            "minX": 8,
            "maxX": 20,
            "minZ": 7.825,
            "maxZ": 8.175,
            "facade": false
          },
          {
            "axis": "x",
            "minX": 8,
            "maxX": 32,
            "minZ": 15.825,
            "maxZ": 16.175,
            "facade": true
          },
          {
            "axis": "x",
            "minX": 8,
            "maxX": 32,
            "minZ": 7.825,
            "maxZ": 8.175,
            "facade": true
          }
        ],
        "rooms": [
          {
            "id": "hs_lobby",
            "type": "lobby",
            "floor": 0,
            "rect": {
              "minX": 20,
              "maxX": 32,
              "minZ": 8,
              "maxZ": 16
            },
            "y": 0
          },
          {
            "id": "hs_office",
            "type": "office",
            "floor": 1,
            "rect": {
              "minX": 8,
              "maxX": 32,
              "minZ": 8,
              "maxZ": 16
            },
            "y": 4
          },
          {
            "id": "hs_store",
            "type": "warehouse",
            "floor": 0,
            "rect": {
              "minX": 8,
              "maxX": 20,
              "minZ": 8,
              "maxZ": 16
            },
            "y": 0
          }
        ],
        "stairs": [
          {
            "id": "hs_ladder",
            "type": "ladder",
            "connectsFloors": [
              1,
              2
            ],
            "y0": 4,
            "y1": 8,
            "height": 4,
            "rotation": 0,
            "rect": {
              "minX": 26.3,
              "maxX": 27.7,
              "minZ": 9.3,
              "maxZ": 10.700000000000001
            },
            "steps": [
              {
                "minX": 26.3,
                "maxX": 27.7,
                "minZ": 9.3,
                "maxZ": 10.7,
                "top": 4.5
              },
              {
                "minX": 26.3,
                "maxX": 27.7,
                "minZ": 9.3,
                "maxZ": 10.7,
                "top": 5
              },
              {
                "minX": 26.3,
                "maxX": 27.7,
                "minZ": 9.3,
                "maxZ": 10.7,
                "top": 5.5
              },
              {
                "minX": 26.3,
                "maxX": 27.7,
                "minZ": 9.3,
                "maxZ": 10.7,
                "top": 6
              },
              {
                "minX": 26.3,
                "maxX": 27.7,
                "minZ": 9.3,
                "maxZ": 10.7,
                "top": 6.5
              },
              {
                "minX": 26.3,
                "maxX": 27.7,
                "minZ": 9.3,
                "maxZ": 10.7,
                "top": 7
              },
              {
                "minX": 26.3,
                "maxX": 27.7,
                "minZ": 9.3,
                "maxZ": 10.7,
                "top": 7.5
              },
              {
                "minX": 26.3,
                "maxX": 27.7,
                "minZ": 9.3,
                "maxZ": 10.7,
                "top": 8
              }
            ],
            "bottom": {
              "x": 27,
              "z": 10,
              "y": 4.5
            },
            "top": {
              "x": 27,
              "z": 10,
              "y": 8
            }
          },
          {
            "id": "hs_stair",
            "type": "straight",
            "connectsFloors": [
              0,
              1
            ],
            "y0": 0,
            "y1": 4,
            "height": 4,
            "rotation": 0,
            "rect": {
              "minX": 11,
              "maxX": 17,
              "minZ": 10,
              "maxZ": 14
            },
            "steps": [
              {
                "minX": 11,
                "maxX": 11.75,
                "minZ": 10,
                "maxZ": 14,
                "top": 0.5
              },
              {
                "minX": 11.75,
                "maxX": 12.5,
                "minZ": 10,
                "maxZ": 14,
                "top": 1
              },
              {
                "minX": 12.5,
                "maxX": 13.25,
                "minZ": 10,
                "maxZ": 14,
                "top": 1.5
              },
              {
                "minX": 13.25,
                "maxX": 14,
                "minZ": 10,
                "maxZ": 14,
                "top": 2
              },
              {
                "minX": 14,
                "maxX": 14.75,
                "minZ": 10,
                "maxZ": 14,
                "top": 2.5
              },
              {
                "minX": 14.75,
                "maxX": 15.5,
                "minZ": 10,
                "maxZ": 14,
                "top": 3
              },
              {
                "minX": 15.5,
                "maxX": 16.25,
                "minZ": 10,
                "maxZ": 14,
                "top": 3.5
              },
              {
                "minX": 16.25,
                "maxX": 17,
                "minZ": 10,
                "maxZ": 14,
                "top": 4
              }
            ],
            "bottom": {
              "x": 11.375,
              "z": 12,
              "y": 0.5
            },
            "top": {
              "x": 16.625,
              "z": 12,
              "y": 4
            }
          }
        ],
        "doors": [
          {
            "id": "hs_lobby→hs_store",
            "room": "hs_lobby",
            "target": "hs_store",
            "linkType": "door",
            "axis": "z",
            "y": 0,
            "height": 2.1,
            "rect": {
              "minX": 19.815,
              "maxX": 20.185,
              "minZ": 9.1,
              "maxZ": 10.9
            },
            "inside": {
              "x": 22.212,
              "z": 10.968
            },
            "outside": {
              "x": 19.788,
              "z": 9.568
            }
          },
          {
            "id": "hs_lobby→st_main",
            "room": "hs_lobby",
            "target": "st_main",
            "linkType": "main_entrance",
            "axis": "x",
            "y": 0,
            "height": 2.1,
            "rect": {
              "minX": 25.1,
              "maxX": 26.9,
              "minZ": 15.815,
              "maxZ": 16.185
            },
            "inside": {
              "x": 23.896,
              "z": 17.252
            },
            "outside": {
              "x": 22.496,
              "z": 19.677
            }
          }
        ]
      }
    ],
    "roads": [
      {
        "id": "st_main",
        "type": "ground",
        "width": 8,
        "withLamps": true,
        "decks": [
          {
            "minX": -50,
            "maxX": 50,
            "minZ": 26,
            "maxZ": 34,
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
            "id": "lamp_st_main_-40_24.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -40,
              "y": 0.12,
              "z": 24.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_st_main_-40_35.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -40,
              "y": 0.12,
              "z": 35.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_st_main_-20_24.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -20,
              "y": 0.12,
              "z": 24.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_st_main_-20_35.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": -20,
              "y": 0.12,
              "z": 35.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_st_main_0_24.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 0,
              "y": 0.12,
              "z": 24.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_st_main_0_35.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 0,
              "y": 0.12,
              "z": 35.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_st_main_20_24.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 20,
              "y": 0.12,
              "z": 24.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_st_main_20_35.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 20,
              "y": 0.12,
              "z": 35.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_st_main_40_24.6",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 40,
              "y": 0.12,
              "z": 24.6
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          },
          {
            "id": "lamp_st_main_40_35.4",
            "model": "lamp_post",
            "source": "road_lamp",
            "rotationY": 0,
            "position": {
              "x": 40,
              "y": 0.12,
              "z": 35.4
            },
            "scale": {
              "x": 1,
              "y": 1,
              "z": 1
            }
          }
        ]
      }
    ],
    "props": [
      {
        "id": "bench_1",
        "model": "bench",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": 6,
          "y": 0,
          "z": 25.5
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_st_main_-20_24.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -20,
          "y": 0.12,
          "z": 24.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_st_main_-20_35.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -20,
          "y": 0.12,
          "z": 35.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_st_main_-40_24.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -40,
          "y": 0.12,
          "z": 24.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_st_main_-40_35.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": -40,
          "y": 0.12,
          "z": 35.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_st_main_0_24.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 0,
          "y": 0.12,
          "z": 24.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_st_main_0_35.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 0,
          "y": 0.12,
          "z": 35.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_st_main_20_24.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 20,
          "y": 0.12,
          "z": 24.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_st_main_20_35.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 20,
          "y": 0.12,
          "z": 35.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_st_main_40_24.6",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 40,
          "y": 0.12,
          "z": 24.6
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "lamp_st_main_40_35.4",
        "model": "lamp_post",
        "source": "road_lamp",
        "rotationY": 0,
        "position": {
          "x": 40,
          "y": 0.12,
          "z": 35.4
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      },
      {
        "id": "tree_1",
        "model": "tree",
        "source": "authored",
        "rotationY": 0,
        "position": {
          "x": -20,
          "y": 0,
          "z": 40
        },
        "scale": {
          "x": 1,
          "y": 1.2,
          "z": 1
        }
      }
    ],
    "lights": [
      {
        "id": "lobby_light",
        "type": "point",
        "position": {
          "x": 26,
          "y": 2.9,
          "z": 12
        },
        "color": "#ffe6c0",
        "intensity": 70,
        "distance": 30,
        "angle": 0.7
      }
    ],
    "windows": {
      "lit": 0.5
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
      "minFloors": 2,
      "panelFloors": 1,
      "keep": 1,
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
      "far": 260
    },
    "hemi": {
      "sky": "#1b2a44",
      "ground": "#0a0d12",
      "intensity": 0.4
    },
    "lights": {
      "count": 4,
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
      "x": 23,
      "z": 15
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
