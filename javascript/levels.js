/* SPACE STRIKE LEVELS v2.0.1 — 100 sectors */
const ADVENTURE_LEVELS = [
    {
        "id": 1,
        "name": "OUTPOST",
        "target": 490,
        "excellency": 759,
        "timeLimit": 120,
        "coins": 46,
        "kills": 10,
        "allowedTypes": [
            "basic"
        ],
        "map": {
            "x": 12,
            "y": 96.0
        }
    },
    {
        "id": 2,
        "name": "DRIFT",
        "target": 580,
        "excellency": 899,
        "timeLimit": 121,
        "coins": 52,
        "kills": 10,
        "allowedTypes": [
            "basic"
        ],
        "map": {
            "x": 31,
            "y": 96.0
        }
    },
    {
        "id": 3,
        "name": "NEBULA",
        "target": 670,
        "excellency": 1038,
        "timeLimit": 121,
        "coins": 58,
        "kills": 10,
        "allowedTypes": [
            "basic"
        ],
        "map": {
            "x": 50,
            "y": 96.0
        }
    },
    {
        "id": 4,
        "name": "SIGNAL",
        "target": 760,
        "excellency": 1178,
        "timeLimit": 122,
        "coins": 64,
        "kills": 10,
        "allowedTypes": [
            "basic"
        ],
        "map": {
            "x": 69,
            "y": 96.0
        }
    },
    {
        "id": 5,
        "name": "RIFT",
        "target": 850,
        "excellency": 1317,
        "timeLimit": 122,
        "coins": 70,
        "kills": 10,
        "allowedTypes": [
            "basic",
            "fast"
        ],
        "map": {
            "x": 88,
            "y": 96.0
        }
    },
    {
        "id": 6,
        "name": "CANYON",
        "target": 940,
        "excellency": 1457,
        "timeLimit": 123,
        "coins": 76,
        "kills": 11,
        "allowedTypes": [
            "basic",
            "fast"
        ],
        "map": {
            "x": 88,
            "y": 91.3
        }
    },
    {
        "id": 7,
        "name": "CANNON",
        "target": 1030,
        "excellency": 1596,
        "timeLimit": 123,
        "coins": 82,
        "kills": 11,
        "allowedTypes": [
            "basic",
            "fast"
        ],
        "map": {
            "x": 69,
            "y": 91.3
        }
    },
    {
        "id": 8,
        "name": "SWARM",
        "target": 1120,
        "excellency": 1736,
        "timeLimit": 124,
        "coins": 88,
        "kills": 12,
        "allowedTypes": [
            "basic",
            "fast"
        ],
        "map": {
            "x": 50,
            "y": 91.3
        }
    },
    {
        "id": 9,
        "name": "SPIRE",
        "target": 1210,
        "excellency": 1875,
        "timeLimit": 124,
        "coins": 94,
        "kills": 12,
        "allowedTypes": [
            "basic",
            "fast"
        ],
        "map": {
            "x": 31,
            "y": 91.3
        }
    },
    {
        "id": 10,
        "name": "MIRROR",
        "target": 1300,
        "excellency": 2015,
        "timeLimit": 125,
        "coins": 100,
        "kills": 13,
        "allowedTypes": [
            "basic",
            "fast"
        ],
        "map": {
            "x": 12,
            "y": 91.3
        }
    },
    {
        "id": 11,
        "name": "VOID",
        "target": 1390,
        "excellency": 2154,
        "timeLimit": 125,
        "coins": 106,
        "kills": 13,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter"
        ],
        "map": {
            "x": 12,
            "y": 86.5
        }
    },
    {
        "id": 12,
        "name": "PULSE",
        "target": 1480,
        "excellency": 2294,
        "timeLimit": 126,
        "coins": 112,
        "kills": 14,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter"
        ],
        "map": {
            "x": 31,
            "y": 86.5
        }
    },
    {
        "id": 13,
        "name": "GRID",
        "target": 1570,
        "excellency": 2433,
        "timeLimit": 126,
        "coins": 118,
        "kills": 14,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter"
        ],
        "map": {
            "x": 50,
            "y": 86.5
        }
    },
    {
        "id": 14,
        "name": "HALO",
        "target": 1660,
        "excellency": 2573,
        "timeLimit": 127,
        "coins": 124,
        "kills": 15,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter"
        ],
        "map": {
            "x": 69,
            "y": 86.5
        }
    },
    {
        "id": 15,
        "name": "FORGE",
        "target": 1750,
        "excellency": 2712,
        "timeLimit": 127,
        "coins": 130,
        "kills": 15,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter"
        ],
        "map": {
            "x": 88,
            "y": 86.5
        }
    },
    {
        "id": 16,
        "name": "STORM",
        "target": 1840,
        "excellency": 2852,
        "timeLimit": 128,
        "coins": 136,
        "kills": 16,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter"
        ],
        "map": {
            "x": 88,
            "y": 81.8
        }
    },
    {
        "id": 17,
        "name": "CORE",
        "target": 1930,
        "excellency": 2991,
        "timeLimit": 128,
        "coins": 142,
        "kills": 16,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter"
        ],
        "map": {
            "x": 69,
            "y": 81.8
        }
    },
    {
        "id": 18,
        "name": "NEXUS",
        "target": 2020,
        "excellency": 3131,
        "timeLimit": 129,
        "coins": 148,
        "kills": 17,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter"
        ],
        "map": {
            "x": 50,
            "y": 81.8
        }
    },
    {
        "id": 19,
        "name": "APEX",
        "target": 2110,
        "excellency": 3270,
        "timeLimit": 129,
        "coins": 154,
        "kills": 17,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter"
        ],
        "map": {
            "x": 31,
            "y": 81.8
        }
    },
    {
        "id": 20,
        "name": "OMEGA",
        "target": 2200,
        "excellency": 3410,
        "timeLimit": 130,
        "coins": 160,
        "kills": 18,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter"
        ],
        "map": {
            "x": 12,
            "y": 81.8
        }
    },
    {
        "id": 21,
        "name": "ORBIT",
        "target": 2290,
        "excellency": 3549,
        "timeLimit": 130,
        "coins": 166,
        "kills": 18,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter"
        ],
        "map": {
            "x": 12,
            "y": 77.1
        }
    },
    {
        "id": 22,
        "name": "QUASAR",
        "target": 2380,
        "excellency": 3689,
        "timeLimit": 131,
        "coins": 172,
        "kills": 19,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter"
        ],
        "map": {
            "x": 31,
            "y": 77.1
        }
    },
    {
        "id": 23,
        "name": "PULSAR",
        "target": 2470,
        "excellency": 3828,
        "timeLimit": 131,
        "coins": 178,
        "kills": 19,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter"
        ],
        "map": {
            "x": 50,
            "y": 77.1
        }
    },
    {
        "id": 24,
        "name": "NOVA",
        "target": 2560,
        "excellency": 3968,
        "timeLimit": 132,
        "coins": 184,
        "kills": 20,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter"
        ],
        "map": {
            "x": 69,
            "y": 77.1
        }
    },
    {
        "id": 25,
        "name": "ECLIPSE",
        "target": 2650,
        "excellency": 4107,
        "timeLimit": 132,
        "coins": 190,
        "kills": 20,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter"
        ],
        "map": {
            "x": 88,
            "y": 77.1
        }
    },
    {
        "id": 26,
        "name": "COMET",
        "target": 2740,
        "excellency": 4247,
        "timeLimit": 133,
        "coins": 196,
        "kills": 21,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank"
        ],
        "map": {
            "x": 88,
            "y": 72.3
        }
    },
    {
        "id": 27,
        "name": "ASTRA",
        "target": 2830,
        "excellency": 4386,
        "timeLimit": 133,
        "coins": 202,
        "kills": 21,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank"
        ],
        "map": {
            "x": 69,
            "y": 72.3
        }
    },
    {
        "id": 28,
        "name": "VORTEX",
        "target": 2920,
        "excellency": 4526,
        "timeLimit": 134,
        "coins": 208,
        "kills": 22,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank"
        ],
        "map": {
            "x": 50,
            "y": 72.3
        }
    },
    {
        "id": 29,
        "name": "PRISM",
        "target": 3010,
        "excellency": 4665,
        "timeLimit": 134,
        "coins": 214,
        "kills": 22,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank"
        ],
        "map": {
            "x": 31,
            "y": 72.3
        }
    },
    {
        "id": 30,
        "name": "ECHO",
        "target": 3100,
        "excellency": 4805,
        "timeLimit": 135,
        "coins": 220,
        "kills": 23,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank"
        ],
        "map": {
            "x": 12,
            "y": 72.3
        }
    },
    {
        "id": 31,
        "name": "SILICON",
        "target": 3190,
        "excellency": 4944,
        "timeLimit": 135,
        "coins": 226,
        "kills": 23,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank"
        ],
        "map": {
            "x": 12,
            "y": 67.6
        }
    },
    {
        "id": 32,
        "name": "QUANTUM",
        "target": 3280,
        "excellency": 5084,
        "timeLimit": 136,
        "coins": 232,
        "kills": 24,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank"
        ],
        "map": {
            "x": 31,
            "y": 67.6
        }
    },
    {
        "id": 33,
        "name": "NEXUS-2",
        "target": 3370,
        "excellency": 5223,
        "timeLimit": 136,
        "coins": 238,
        "kills": 24,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank"
        ],
        "map": {
            "x": 50,
            "y": 67.6
        }
    },
    {
        "id": 34,
        "name": "HORIZON",
        "target": 3460,
        "excellency": 5363,
        "timeLimit": 137,
        "coins": 244,
        "kills": 25,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank"
        ],
        "map": {
            "x": 69,
            "y": 67.6
        }
    },
    {
        "id": 35,
        "name": "ZENITH",
        "target": 3550,
        "excellency": 5502,
        "timeLimit": 137,
        "coins": 250,
        "kills": 25,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank"
        ],
        "map": {
            "x": 88,
            "y": 67.6
        }
    },
    {
        "id": 36,
        "name": "CIPHER",
        "target": 3640,
        "excellency": 5642,
        "timeLimit": 138,
        "coins": 256,
        "kills": 26,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank"
        ],
        "map": {
            "x": 88,
            "y": 62.8
        }
    },
    {
        "id": 37,
        "name": "VECTOR",
        "target": 3730,
        "excellency": 5781,
        "timeLimit": 138,
        "coins": 262,
        "kills": 26,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank"
        ],
        "map": {
            "x": 69,
            "y": 62.8
        }
    },
    {
        "id": 38,
        "name": "AEGIS",
        "target": 3820,
        "excellency": 5921,
        "timeLimit": 139,
        "coins": 268,
        "kills": 27,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank"
        ],
        "map": {
            "x": 50,
            "y": 62.8
        }
    },
    {
        "id": 39,
        "name": "TITAN",
        "target": 3910,
        "excellency": 6060,
        "timeLimit": 139,
        "coins": 274,
        "kills": 27,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank"
        ],
        "map": {
            "x": 31,
            "y": 62.8
        }
    },
    {
        "id": 40,
        "name": "FINALE",
        "target": 4000,
        "excellency": 6200,
        "timeLimit": 140,
        "coins": 280,
        "kills": 28,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank"
        ],
        "map": {
            "x": 12,
            "y": 62.8
        }
    },
    {
        "id": 41,
        "name": "ORIGIN",
        "target": 4090,
        "excellency": 6339,
        "timeLimit": 140,
        "coins": 286,
        "kills": 28,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank"
        ],
        "map": {
            "x": 12,
            "y": 58.1
        }
    },
    {
        "id": 42,
        "name": "FLARE",
        "target": 4180,
        "excellency": 6479,
        "timeLimit": 141,
        "coins": 292,
        "kills": 29,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank"
        ],
        "map": {
            "x": 31,
            "y": 58.1
        }
    },
    {
        "id": 43,
        "name": "GLITCH",
        "target": 4270,
        "excellency": 6618,
        "timeLimit": 141,
        "coins": 298,
        "kills": 29,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank"
        ],
        "map": {
            "x": 50,
            "y": 58.1
        }
    },
    {
        "id": 44,
        "name": "RADAR",
        "target": 4360,
        "excellency": 6758,
        "timeLimit": 142,
        "coins": 304,
        "kills": 30,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank"
        ],
        "map": {
            "x": 69,
            "y": 58.1
        }
    },
    {
        "id": 45,
        "name": "BOLT",
        "target": 4450,
        "excellency": 6897,
        "timeLimit": 142,
        "coins": 310,
        "kills": 30,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank"
        ],
        "map": {
            "x": 88,
            "y": 58.1
        }
    },
    {
        "id": 46,
        "name": "CRATER",
        "target": 4540,
        "excellency": 7037,
        "timeLimit": 143,
        "coins": 316,
        "kills": 31,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank"
        ],
        "map": {
            "x": 88,
            "y": 53.4
        }
    },
    {
        "id": 47,
        "name": "DRIFT-2",
        "target": 4630,
        "excellency": 7176,
        "timeLimit": 143,
        "coins": 322,
        "kills": 31,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank"
        ],
        "map": {
            "x": 69,
            "y": 53.4
        }
    },
    {
        "id": 48,
        "name": "ION",
        "target": 4720,
        "excellency": 7316,
        "timeLimit": 144,
        "coins": 328,
        "kills": 32,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank"
        ],
        "map": {
            "x": 50,
            "y": 53.4
        }
    },
    {
        "id": 49,
        "name": "PLASMA",
        "target": 4810,
        "excellency": 7455,
        "timeLimit": 144,
        "coins": 334,
        "kills": 32,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank"
        ],
        "map": {
            "x": 31,
            "y": 53.4
        }
    },
    {
        "id": 50,
        "name": "BINARY",
        "target": 4900,
        "excellency": 7595,
        "timeLimit": 145,
        "coins": 340,
        "kills": 33,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank"
        ],
        "map": {
            "x": 12,
            "y": 53.4
        }
    },
    {
        "id": 51,
        "name": "SECTOR-X",
        "target": 4990,
        "excellency": 7734,
        "timeLimit": 145,
        "coins": 346,
        "kills": 33,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 12,
            "y": 48.6
        }
    },
    {
        "id": 52,
        "name": "GHOST",
        "target": 5080,
        "excellency": 7874,
        "timeLimit": 146,
        "coins": 352,
        "kills": 34,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 31,
            "y": 48.6
        }
    },
    {
        "id": 53,
        "name": "PHANTOM",
        "target": 5170,
        "excellency": 8013,
        "timeLimit": 146,
        "coins": 358,
        "kills": 34,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 50,
            "y": 48.6
        }
    },
    {
        "id": 54,
        "name": "ORBIT-2",
        "target": 5260,
        "excellency": 8153,
        "timeLimit": 147,
        "coins": 364,
        "kills": 35,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 69,
            "y": 48.6
        }
    },
    {
        "id": 55,
        "name": "RING",
        "target": 5350,
        "excellency": 8292,
        "timeLimit": 147,
        "coins": 370,
        "kills": 35,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 88,
            "y": 48.6
        }
    },
    {
        "id": 56,
        "name": "DUST",
        "target": 5440,
        "excellency": 8432,
        "timeLimit": 148,
        "coins": 376,
        "kills": 36,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 88,
            "y": 43.9
        }
    },
    {
        "id": 57,
        "name": "SOLAR",
        "target": 5530,
        "excellency": 8571,
        "timeLimit": 148,
        "coins": 382,
        "kills": 36,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 69,
            "y": 43.9
        }
    },
    {
        "id": 58,
        "name": "LUNAR",
        "target": 5620,
        "excellency": 8711,
        "timeLimit": 149,
        "coins": 388,
        "kills": 37,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 50,
            "y": 43.9
        }
    },
    {
        "id": 59,
        "name": "COMET-2",
        "target": 5710,
        "excellency": 8850,
        "timeLimit": 149,
        "coins": 394,
        "kills": 37,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 31,
            "y": 43.9
        }
    },
    {
        "id": 60,
        "name": "BLAZE",
        "target": 5800,
        "excellency": 8990,
        "timeLimit": 150,
        "coins": 400,
        "kills": 38,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 12,
            "y": 43.9
        }
    },
    {
        "id": 61,
        "name": "FROST",
        "target": 5890,
        "excellency": 9129,
        "timeLimit": 150,
        "coins": 406,
        "kills": 38,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 12,
            "y": 39.2
        }
    },
    {
        "id": 62,
        "name": "EMBER",
        "target": 5980,
        "excellency": 9269,
        "timeLimit": 151,
        "coins": 412,
        "kills": 39,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 31,
            "y": 39.2
        }
    },
    {
        "id": 63,
        "name": "SPARK",
        "target": 6070,
        "excellency": 9408,
        "timeLimit": 151,
        "coins": 418,
        "kills": 39,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 50,
            "y": 39.2
        }
    },
    {
        "id": 64,
        "name": "ARC",
        "target": 6160,
        "excellency": 9548,
        "timeLimit": 152,
        "coins": 424,
        "kills": 40,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 69,
            "y": 39.2
        }
    },
    {
        "id": 65,
        "name": "NODE",
        "target": 6250,
        "excellency": 9687,
        "timeLimit": 152,
        "coins": 430,
        "kills": 40,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 88,
            "y": 39.2
        }
    },
    {
        "id": 66,
        "name": "LINK",
        "target": 6340,
        "excellency": 9827,
        "timeLimit": 153,
        "coins": 436,
        "kills": 41,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 88,
            "y": 34.4
        }
    },
    {
        "id": 67,
        "name": "BRIDGE",
        "target": 6430,
        "excellency": 9966,
        "timeLimit": 153,
        "coins": 442,
        "kills": 41,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 69,
            "y": 34.4
        }
    },
    {
        "id": 68,
        "name": "GATE",
        "target": 6520,
        "excellency": 10106,
        "timeLimit": 154,
        "coins": 448,
        "kills": 42,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 50,
            "y": 34.4
        }
    },
    {
        "id": 69,
        "name": "PORT",
        "target": 6610,
        "excellency": 10245,
        "timeLimit": 154,
        "coins": 454,
        "kills": 42,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 31,
            "y": 34.4
        }
    },
    {
        "id": 70,
        "name": "DOCK",
        "target": 6700,
        "excellency": 10385,
        "timeLimit": 155,
        "coins": 460,
        "kills": 43,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 12,
            "y": 34.4
        }
    },
    {
        "id": 71,
        "name": "HULL",
        "target": 6790,
        "excellency": 10524,
        "timeLimit": 155,
        "coins": 466,
        "kills": 43,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 12,
            "y": 29.7
        }
    },
    {
        "id": 72,
        "name": "WING",
        "target": 6880,
        "excellency": 10664,
        "timeLimit": 156,
        "coins": 472,
        "kills": 44,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 31,
            "y": 29.7
        }
    },
    {
        "id": 73,
        "name": "THRUST",
        "target": 6970,
        "excellency": 10803,
        "timeLimit": 156,
        "coins": 478,
        "kills": 44,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 50,
            "y": 29.7
        }
    },
    {
        "id": 74,
        "name": "NOSE",
        "target": 7060,
        "excellency": 10943,
        "timeLimit": 157,
        "coins": 484,
        "kills": 45,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 69,
            "y": 29.7
        }
    },
    {
        "id": 75,
        "name": "COCKPIT",
        "target": 7150,
        "excellency": 11082,
        "timeLimit": 157,
        "coins": 490,
        "kills": 45,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 88,
            "y": 29.7
        }
    },
    {
        "id": 76,
        "name": "RADOME",
        "target": 7240,
        "excellency": 11222,
        "timeLimit": 158,
        "coins": 496,
        "kills": 46,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 88,
            "y": 24.9
        }
    },
    {
        "id": 77,
        "name": "ARRAY",
        "target": 7330,
        "excellency": 11361,
        "timeLimit": 158,
        "coins": 502,
        "kills": 46,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 69,
            "y": 24.9
        }
    },
    {
        "id": 78,
        "name": "BEACON",
        "target": 7420,
        "excellency": 11501,
        "timeLimit": 159,
        "coins": 508,
        "kills": 47,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 50,
            "y": 24.9
        }
    },
    {
        "id": 79,
        "name": "TOWER",
        "target": 7510,
        "excellency": 11640,
        "timeLimit": 159,
        "coins": 514,
        "kills": 47,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 31,
            "y": 24.9
        }
    },
    {
        "id": 80,
        "name": "SPIKE",
        "target": 7600,
        "excellency": 11780,
        "timeLimit": 160,
        "coins": 520,
        "kills": 48,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 12,
            "y": 24.9
        }
    },
    {
        "id": 81,
        "name": "SHARD",
        "target": 7690,
        "excellency": 11919,
        "timeLimit": 160,
        "coins": 526,
        "kills": 48,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 12,
            "y": 20.2
        }
    },
    {
        "id": 82,
        "name": "CRYSTAL",
        "target": 7780,
        "excellency": 12059,
        "timeLimit": 161,
        "coins": 532,
        "kills": 49,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 31,
            "y": 20.2
        }
    },
    {
        "id": 83,
        "name": "ONYX",
        "target": 7870,
        "excellency": 12198,
        "timeLimit": 161,
        "coins": 538,
        "kills": 49,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 50,
            "y": 20.2
        }
    },
    {
        "id": 84,
        "name": "JADE",
        "target": 7960,
        "excellency": 12338,
        "timeLimit": 162,
        "coins": 544,
        "kills": 50,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 69,
            "y": 20.2
        }
    },
    {
        "id": 85,
        "name": "RUBY",
        "target": 8050,
        "excellency": 12477,
        "timeLimit": 162,
        "coins": 550,
        "kills": 50,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 88,
            "y": 20.2
        }
    },
    {
        "id": 86,
        "name": "COBALT",
        "target": 8140,
        "excellency": 12617,
        "timeLimit": 163,
        "coins": 556,
        "kills": 51,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 88,
            "y": 15.5
        }
    },
    {
        "id": 87,
        "name": "IRON",
        "target": 8230,
        "excellency": 12756,
        "timeLimit": 163,
        "coins": 562,
        "kills": 51,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 69,
            "y": 15.5
        }
    },
    {
        "id": 88,
        "name": "STEEL",
        "target": 8320,
        "excellency": 12896,
        "timeLimit": 164,
        "coins": 568,
        "kills": 52,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 50,
            "y": 15.5
        }
    },
    {
        "id": 89,
        "name": "CARBON",
        "target": 8410,
        "excellency": 13035,
        "timeLimit": 164,
        "coins": 574,
        "kills": 52,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 31,
            "y": 15.5
        }
    },
    {
        "id": 90,
        "name": "GRAPHENE",
        "target": 8500,
        "excellency": 13175,
        "timeLimit": 165,
        "coins": 580,
        "kills": 53,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 12,
            "y": 15.5
        }
    },
    {
        "id": 91,
        "name": "ALPHA",
        "target": 8590,
        "excellency": 13314,
        "timeLimit": 165,
        "coins": 586,
        "kills": 53,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 12,
            "y": 10.7
        }
    },
    {
        "id": 92,
        "name": "BETA",
        "target": 8680,
        "excellency": 13454,
        "timeLimit": 166,
        "coins": 592,
        "kills": 54,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 31,
            "y": 10.7
        }
    },
    {
        "id": 93,
        "name": "GAMMA",
        "target": 8770,
        "excellency": 13593,
        "timeLimit": 166,
        "coins": 598,
        "kills": 54,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 50,
            "y": 10.7
        }
    },
    {
        "id": 94,
        "name": "DELTA",
        "target": 8860,
        "excellency": 13733,
        "timeLimit": 167,
        "coins": 604,
        "kills": 55,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 69,
            "y": 10.7
        }
    },
    {
        "id": 95,
        "name": "EPSILON",
        "target": 8950,
        "excellency": 13872,
        "timeLimit": 167,
        "coins": 610,
        "kills": 55,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 88,
            "y": 10.7
        }
    },
    {
        "id": 96,
        "name": "ZETA",
        "target": 9040,
        "excellency": 14012,
        "timeLimit": 168,
        "coins": 616,
        "kills": 56,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 88,
            "y": 6.0
        }
    },
    {
        "id": 97,
        "name": "ETA",
        "target": 9130,
        "excellency": 14151,
        "timeLimit": 168,
        "coins": 622,
        "kills": 56,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 69,
            "y": 6.0
        }
    },
    {
        "id": 98,
        "name": "THETA",
        "target": 9220,
        "excellency": 14291,
        "timeLimit": 169,
        "coins": 628,
        "kills": 57,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 50,
            "y": 6.0
        }
    },
    {
        "id": 99,
        "name": "IOTA",
        "target": 9310,
        "excellency": 14430,
        "timeLimit": 169,
        "coins": 634,
        "kills": 57,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 31,
            "y": 6.0
        }
    },
    {
        "id": 100,
        "name": "OMEGA-X",
        "target": 9400,
        "excellency": 14570,
        "timeLimit": 170,
        "coins": 640,
        "kills": 58,
        "allowedTypes": [
            "basic",
            "fast",
            "shooter",
            "tank",
            "elite"
        ],
        "map": {
            "x": 12,
            "y": 6.0
        }
    }
];

function getAdventureLevel(id) {
    return ADVENTURE_LEVELS.find(function (l) { return l.id === id; }) || null;
}

function calculateStars(score, livesLeft, def) {
    if (!def || livesLeft <= 0) return 0;
    if (score < def.target) return 0;
    if (score >= def.excellency || livesLeft >= 3) return 3;
    if (score >= Math.floor(def.excellency * 0.75) || livesLeft >= 2) return 2;
    return 1;
}

function loadAdventureProgress() {
    try {
        const raw = localStorage.getItem("spaceStrikeAdventure");
        if (!raw) return { levels: {} };
        const data = JSON.parse(raw);
        if (!data.levels) data.levels = {};
        return data;
    } catch (e) {
        return { levels: {} };
    }
}

function saveAdventureProgress(data) {
    try { localStorage.setItem("spaceStrikeAdventure", JSON.stringify(data)); } catch (e) {}
}

function setLevelStars(levelId, stars) {
    const data = loadAdventureProgress();
    if (!data.levels) data.levels = {};
    const key = String(levelId);
    const prev = Number(data.levels[key] || 0);
    data.levels[key] = Math.max(prev, Math.max(0, Math.min(3, stars)));
    saveAdventureProgress(data);
    return data.levels[key];
}

function isAdventureLevelUnlocked(id, progress) {
    if (id <= 1) return true;
    return Number((progress.levels || {})[String(id - 1)] || 0) >= 1;
}

if (typeof window !== "undefined") {
    window.SpaceStrikeLevels = {
        ADVENTURE_LEVELS: ADVENTURE_LEVELS,
        getAdventureLevel: getAdventureLevel,
        calculateStars: calculateStars,
        loadAdventureProgress: loadAdventureProgress,
        saveAdventureProgress: saveAdventureProgress,
        setLevelStars: setLevelStars,
        isUnlocked: isAdventureLevelUnlocked
    };
}
