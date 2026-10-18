// Pinned active DM2 drill settings and audio-sprite regions.
window.DogeMinerDrillData = Object.freeze({
  "config": {
    "enabled": true,
    "trigger": "hold",
    "burstMs": 3000,
    "toggleDebounceMs": 250,
    "hitMinMs": 100,
    "hitMaxMs": 250,
    "useSoundCadence": false,
    "strength": 1,
    "hitSounds": false,
    "critSounds": true,
    "textChance": 0.05,
    "rebiteOnNewRock": true,
    "pauseWhenUnfocused": true,
    "volume": 0.5,
    "idleGain": 1,
    "cutGain": 1,
    "winddownGain": 1,
    "cutInFadeMs": 120,
    "cutOutFadeMs": 220,
    "winddownFadeMs": 50,
    "normalizeCuts": true,
    "variantCut2": true,
    "variantCut3": true,
    "variantCut4": true,
    "variantCut5": true,
    "spinupMs": 800,
    "spindownMs": 900,
    "idleShakePx": 1.2,
    "idleShakeDeg": 0.7,
    "shakeHz": 28,
    "rumblePx": 0.6,
    "rumbleHz": 7,
    "spinWobble": 0.03,
    "spinHz": 22,
    "spinFlip": false,
    "pistonPx": 2.5,
    "pistonHz": 16,
    "drillShakePx": 3.2,
    "drillShakeDeg": 2,
    "poseInMs": 110,
    "poseOutMs": 260,
    "respawnLift": 0.15,
    "respawnLiftMs": 450,
    "biteDepthPx": 6,
    "biteMs": 70,
    "rockNudgePx": 2.5,
    "rockBuzzPx": 0.6,
    "particlesEvery": 1,
    "dogeFollow": 0.45,
    "dogeLagMs": 70,
    "dogeHzScale": 0.5,
    "dogeBracePx": 3,
    "instability": 0
  },
  "profiles": {
    "drill": {
      "style": "auger",
      "fx": 1,
      "poseDeg": -92,
      "poseX": -2,
      "poseY": 10,
      "bite": 1,
      "cadence": 1,
      "strength": 1,
      "pitch": 0.94,
      "instability": 0
    },
    "goldendrill": {
      "style": "auger",
      "fx": 1.1,
      "poseDeg": -92,
      "poseX": -2,
      "poseY": 10,
      "bite": 1,
      "cadence": 1,
      "strength": 1,
      "pitch": 1,
      "instability": 0
    },
    "smalldrill": {
      "style": "jackhammer",
      "fx": 1.15,
      "poseDeg": -105,
      "poseX": -8,
      "poseY": 2,
      "bite": 1.3,
      "cadence": 0.85,
      "strength": 1,
      "pitch": 1.08,
      "instability": 0.6
    }
  },
  "cadence": [
    {
      "id": "drill",
      "roll": 0,
      "gap": 100
    },
    {
      "id": "drill",
      "roll": 0.25,
      "gap": 137.5
    },
    {
      "id": "drill",
      "roll": 0.5,
      "gap": 175
    },
    {
      "id": "drill",
      "roll": 1,
      "gap": 250
    },
    {
      "id": "goldendrill",
      "roll": 0,
      "gap": 100
    },
    {
      "id": "goldendrill",
      "roll": 0.25,
      "gap": 137.5
    },
    {
      "id": "goldendrill",
      "roll": 0.5,
      "gap": 175
    },
    {
      "id": "goldendrill",
      "roll": 1,
      "gap": 250
    },
    {
      "id": "smalldrill",
      "roll": 0,
      "gap": 85
    },
    {
      "id": "smalldrill",
      "roll": 0.25,
      "gap": 116.875
    },
    {
      "id": "smalldrill",
      "roll": 0.5,
      "gap": 148.75
    },
    {
      "id": "smalldrill",
      "roll": 1,
      "gap": 212.5
    }
  ],
  "sprite": {
    "idle_intro": [
      100,
      5871.995464852607
    ],
    "idle_loop": [
      5971.995464852607,
      2417.6190476190477,
      true
    ],
    "winddown": [
      8990,
      1300
    ],
    "cut2_intro": [
      10790,
      924.9886621315192
    ],
    "cut2_loop": [
      11714.98866213152,
      1368.7074829931971,
      true
    ],
    "cut3_intro": [
      13690,
      1950
    ],
    "cut3_loop": [
      15640,
      2755.419501133787,
      true
    ],
    "cut4_intro": [
      19000,
      236.00907029478455
    ],
    "cut4_loop": [
      19236.009070294785,
      2905.011337868481,
      true
    ],
    "cut5_intro": [
      22750,
      870
    ],
    "cut5_loop": [
      23620,
      3412.154195011338,
      true
    ]
  }
});
