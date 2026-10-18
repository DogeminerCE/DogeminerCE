# Dogeminer 2 helper upgrade audit

Reference: [Dogeminer 2](https://dogeminer2.com/play/), version 2.14.1b. Collected 2026-10-06T00:46:44.270Z.

The run started with zero owned/upgraded helpers on a fresh local save. Dogecoins were set to `999999999999999999999999999` in the console. Helpers were unlocked individually; purchases used the game’s real controller transaction with Dogecoins. Locked terminal upgrades were explicitly unlocked through the console for inspection. Each helper’s finite upgrades and ten repeatable tiers were purchased before starting the next helper. Locations were visited in order through Titan. Titan’s sixth helper (ID 34, zero owned and zero upgraded) was excluded. No cloud account was used.

Coverage: **29 helpers, 142 finite upgrades, 290 repeatable-tier purchases**. The [JSON record](dogeminer2-helper-upgrades.json) includes every observed price, DPS before/after, purchase confirmation, and the ordered transaction trace. The [CSV](dogeminer2-helper-upgrades.csv) provides all 432 observations.

Each observation's `sprite` field records the upgrade artwork key from Dogeminer 2, separately from the upgraded helper preview. CE uses `assets/general/icons/<sprite>.webp` for these icons, including the inherited artwork on repeating tiers. These were sourced from the recorded game data, not inferred from upgrade names. The two CE-only Altar of the SunDoge upgrades use chosen existing magma/diamond artwork.

On October 9, 2026, all 432 captured levels' icon paths were checked against CE, with no mismatches or missing files; `tests/helper-upgrades.cjs` now enforces this comparison. A further live-site check was attempted, but the current local network blocks Dogeminer 2. This check therefore validates CE against the original captured reference data, rather than claiming a new live audit.

## Finite upgrade prices

### Earth

| Helper | Level | Upgrade | Dogediamonds | Dogecoins | DPS per helper |
|---|---:|---|---:|---:|---:|
| Mining Shibe | 1 | Euphoria | 1 | 1,000 | 0.7 |
| Mining Shibe | 2 | Golden Pickaxes | 1 | 3,500 | 1 |
| Mining Shibe | 3 | Salary Raise | 1 | 32,500 | 2 |
| Mining Shibe | 4 | Rapper Shibes | 1 | 4,500,000 | 5 |
| Mining Shibe | 5 | Space Shibes | 2 | 25,000,000 | 19 |
| Mining Shibe | 6 | Golden Helmet Upgrade | 3 | 55,000,000 | 35 |
| Mining Shibe | 7 | Diamond Helmet Upgrade | 3 | 55,000,000 | 69 |
| Mining Shibe | 8 | Reallyhardium Coating | 5 | 250,000,000 | 130 |
| Doge Kennels | 1 | More Axes | 1 | 1,100 | 3.2 |
| Doge Kennels | 2 | Paint Job | 1 | 4,000 | 4.3 |
| Doge Kennels | 3 | Micro-Rockets | 1 | 42,000 | 5 |
| Doge Kennels | 4 | Release the Doge | 1 | 125,000 | 7 |
| Doge Kennels | 5 | Jet Packs | 1 | 3,000,000 | 11 |
| Doge Kennels | 6 | Safety First | 3 | 30,000,000 | 20 |
| Doge Kennels | 7 | Golden Improvement | 4 | 80,000,000 | 33 |
| Doge Kennels | 8 | Diamond Improvement | 5 | 151,000,000 | 61 |
| Doge Kennels | 9 | Reallyhardium-coating | 7 | 320,000,000 | 150 |
| Streamer Kittens | 1 | High Quality Pussy-cat | 1 | 4,200 | 7 |
| Streamer Kittens | 2 | More Kittens | 1 | 99,000 | 9 |
| Streamer Kittens | 3 | High-Speed Interwebs | 1 | 392,000 | 12 |
| Streamer Kittens | 4 | Intelligence | 1 | 3,250,000 | 18 |
| Streamer Kittens | 5 | Stock Kittens | 2 | 6,500,000 | 21 |
| Streamer Kittens | 6 | Catstronaut | 3 | 82,000,000 | 23 |
| Streamer Kittens | 7 | Goldened Helmets | 4 | 169,000,000 | 45 |
| Streamer Kittens | 8 | Diamond Helmets | 5 | 290,000,000 | 70 |
| Streamer Kittens | 9 | Reallyhardium Catstronauts | 7 | 399,000,000 | 169 |
| Space Rocket | 1 | Blue-Flame | 1 | 52,000 | 11 |
| Space Rocket | 2 | Warp Drive | 2 | 1,500,000 | 14 |
| Space Rocket | 3 | Hull Upgrade | 3 | 500,000,000 | 23 |
| Space Rocket | 4 | Olie Upgrade | 4 | 600,000,000 | 28 |
| Space Rocket | 5 | Space Helmets | 5 | 1,000,000,000 | 48 |
| Space Rocket | 6 | Golden Helmet | 5 | 1,300,000,000 | 79 |
| Space Rocket | 7 | Diamond helmet | 6 | 1,600,000,000 | 159 |
| Space Rocket | 8 | Reallyhardium Helmet | 7 | 300,000,000 | 215 |
| Time Machine Mining Rig | 1 | Roads? | 3 | 24,200,000 | 88 |
| Time Machine Mining Rig | 2 | Bling Bling | 3 | 72,000,000 | 122 |
| Time Machine Mining Rig | 3 | Diamond Bling | 6 | 240,000,000 | 178 |
| Time Machine Mining Rig | 4 | Hyper-Bling | 8 | 800,000,000 | 300 |
| Infinite Dogebility Drive | 1 | Delivery Service | 15 | 20,000,000,000 | 1950 |
| Infinite Dogebility Drive | 2 | Hire a crew | 30 | 45,000,000,000 | 3456 |
| Infinite Dogebility Drive | 3 | Upside Doge | 40 | 75,000,000,000 | 4210 |
| Infinite Dogebility Drive | 4 | The Upside of Gold | 50 | 150,000,000,000 | 5420 |
| Infinite Dogebility Drive | 5 | The Cost of Diamonds | 60 | 300,000,000,000 | 6900 |
| Infinite Dogebility Drive | 6 | Hype Me Up | 99 | 2,222,000,000,000 | 15000 |

### Moon

| Helper | Level | Upgrade | Dogediamonds | Dogecoins | DPS per helper |
|---|---:|---|---:|---:|---:|
| Moon Base | 1 | Excavator Assistance | 1 | 60,000 | 15 |
| Moon Base | 2 | More Axes v2 | 1 | 315,000 | 17 |
| Moon Base | 3 | Gold-Coated Base | 3 | 2,250,000 | 29 |
| Moon Base | 4 | Diamond-coated Base | 5 | 65,000,000 | 90 |
| Moon Base | 5 | Reallyhardium Coat | 7 | 300,000,000 | 260 |
| Moon Shibe | 1 | Suit Up | 1 | 54,000 | 13 |
| Moon Shibe | 2 | Head-Mounted Pickaxes | 2 | 290,000 | 15 |
| Moon Shibe | 3 | Gold-Suit Up | 3 | 2,000,000 | 19 |
| Moon Shibe | 4 | Diamond-Suit Up | 4 | 24,000,000 | 49 |
| Moon Shibe | 5 | Hyper-Suit Up | 6 | 210,000,000 | 230 |
| Doge Car | 1 | Shade Miner | 1 | 64,500 | 15 |
| Doge Car | 2 | Tank | 1 | 400,000 | 20 |
| Doge Car | 3 | Roof Miner | 2 | 5,000,000 | 24 |
| Doge Car | 4 | Gold Miner | 3 | 30,000,000 | 75 |
| Doge Car | 5 | Diamond Miner | 5 | 99,000,000 | 159 |
| Doge Car | 6 | Reallyhardium Miner | 7 | 250,000,000 | 255 |
| Lander Shibe | 1 | Candy-Lander Shibe | 1 | 550,000 | 24 |
| Lander Shibe | 2 | Double-Lander Shibe | 1 | 4,000,000 | 26 |
| Lander Shibe | 3 | Triple-Lander Shibe | 3 | 75,000,000 | 35 |
| Lander Shibe | 4 | Diamonds for the Lander | 5 | 175,000,000 | 105 |
| Lander Shibe | 5 | Really Hardened Lander | 7 | 340,000,000 | 268 |
| Mars Rocket | 1 | Golden Rocket Plating | 3 | 22,500,000 | 90 |
| Mars Rocket | 2 | Diamond Rocket Plating | 5 | 85,000,000 | 150 |
| Mars Rocket | 3 | Reallyhardium Rocket Plating | 7 | 355,000,000 | 275 |
| Doge Gate | 1 | Golden Gate | 5 | 6,900,000,000 | 575 |
| Doge Gate | 2 | Diamond Gate | 8 | 9,900,000,000 | 1875 |
| Doge Gate | 3 | Really Hard Gate | 13 | 30,000,000,000 | 3575 |

### Mars

| Helper | Level | Upgrade | Dogediamonds | Dogecoins | DPS per helper |
|---|---:|---|---:|---:|---:|
| Mars Base | 1 | Double Mars Bases | 1 | 750,000 | 31 |
| Mars Base | 2 | Quad Mars Base | 2 | 6,000,000 | 38 |
| Mars Base | 3 | Heckin-Ton of Bases | 4 | 400,000,000 | 47 |
| Mars Base | 4 | Spray It With Gold | 6 | 800,000,000 | 99 |
| Mars Base | 5 | Apply To Outside Only | 10 | 1,600,000,000 | 280 |
| Mars Base | 6 | Don't Spill Any | 10 | 2,100,000,000 | 520 |
| Party Shibe | 1 | Proper Raving | 1 | 610,000 | 35 |
| Party Shibe | 2 | Dual-Wielding Ravers | 2 | 1,250,000 | 40 |
| Party Shibe | 3 | Sugar Baby | 3 | 38,000,000 | 78 |
| Party Shibe | 4 | Shiny Shibe | 5 | 99,000,000 | 139 |
| Party Shibe | 5 | Shinier Shibe | 7 | 320,000,000 | 199 |
| Party Shibe | 6 | Shiniest Shibe | 9 | 900,000,000 | 428 |
| CuriousiDoge | 1 | Party Mode | 1 | 620,000 | 38 |
| CuriousiDoge | 2 | Party Hydra | 2 | 2,250,000 | 48 |
| CuriousiDoge | 3 | Rocket Mode | 4 | 49,900,000 | 59 |
| DJ Kittenz | 1 | D.I.S.C.O. | 1 | 1,450,000 | 57 |
| DJ Kittenz | 2 | Swag Upgrade | 3 | 37,500,000 | 75 |
| DJ Kittenz | 3 | Wash-Oops | 4 | 120,000,000 | 99 |
| DJ Kittenz | 4 | Golden Hits | 5 | 290,000,000 | 133 |
| DJ Kittenz | 5 | Diamond Hits? | 7 | 525,000,000 | 200 |
| DJ Kittenz | 6 | Really Hard Hits | 9 | 900,000,000 | 440 |
| Space Bass | 1 | Golden Bass | 4 | 265,000,000 | 122 |
| Space Bass | 2 | Diamond Bass | 7 | 565,000,000 | 229 |
| Space Bass | 3 | Really Hard Vibrations | 9 | 1,000,000,000 | 450 |
| Jupiter Rocket | 1 | Golden Rocket Plating | 4 | 125,000,000 | 200 |
| Jupiter Rocket | 2 | Diamond Rocket Plating | 6 | 240,000,000 | 298 |
| Jupiter Rocket | 3 | Reallyhardium Rocket Plating | 9 | 1,500,000,000 | 498 |

### Jupiter

| Helper | Level | Upgrade | Dogediamonds | Dogecoins | DPS per helper |
|---|---:|---|---:|---:|---:|
| Cloud Base | 1 | Sensor Package | 2 | 30,000,000 | 139 |
| Cloud Base | 2 | AI Package | 3 | 100,000,000 | 169 |
| Cloud Base | 3 | What Else But Gold | 4 | 285,000,000 | 310 |
| Cloud Base | 4 | Are Those Real Diamonds | 6 | 780,000,000 | 446 |
| Cloud Base | 5 | Reallyhardium Package | 9 | 1,500,000,000 | 1333 |
| Super Shibe | 1 | Cloud Juice | 3 | 35,000,000 | 79 |
| Super Shibe | 2 | Helmet Factor Two | 4 | 77,000,000 | 140 |
| Super Shibe | 3 | We Can Do Better | 6 | 180,000,000 | 209 |
| Super Shibe | 4 | The Best Protection | 8 | 850,000,000 | 1000 |
| Doge Air Ship | 1 | Rockets Beats Balloons | 5 | 160,000,000 | 140 |
| Doge Air Ship | 2 | Golden Rockets | 6 | 220,000,000 | 180 |
| Doge Air Ship | 3 | Diamond Rockets | 7 | 350,000,000 | 230 |
| Doge Air Ship | 4 | Reallyhardiumated Rockets | 10 | 950,000,000 | 1150 |
| Flying Doggo | 1 | Doggo Bling | 3 | 65,000,000 | 140 |
| Flying Doggo | 2 | Gotta Go Fast | 4 | 100,000,000 | 165 |
| Flying Doggo | 3 | Gotta Go Faster | 5 | 280,000,000 | 260 |
| Flying Doggo | 4 | Gotta Go Really Fast | 7 | 510,000,000 | 485 |
| Flying Doggo | 5 | Is This Legal? | 9 | 1,000,000,000 | 1200 |
| TARDogeIS | 1 | Rockets Equals Wow | 5 | 195,000,000 | 192 |
| TARDogeIS | 2 | Better, Faster Rockets | 6 | 300,000,000 | 300 |
| TARDogeIS | 3 | Hard Rock Ets | 7 | 480,000,000 | 499 |
| TARDogeIS | 4 | These Rockets Go To 11 | 10 | 1,150,000,000 | 1399 |
| DogeStar | 1 | That's Gold Jerry! | 6 | 7,500,000,000 | 920 |
| DogeStar | 2 | Are Those Diamonds Jerry?! | 10 | 12,500,000,000 | 2770 |
| DogeStar | 3 | What IS that Jerry? | 13 | 20,000,000,000 | 4820 |

### Titan

| Helper | Level | Upgrade | Dogediamonds | Dogecoins | DPS per helper |
|---|---:|---|---:|---:|---:|
| Titan Base | 1 | Golden Plates | 4 | 1,000,000,000 | 400 |
| Titan Base | 2 | Diamond Plates | 7 | 2,000,000,000 | 700 |
| Titan Base | 3 | Reallyhardium Plates | 9 | 4,000,000,000 | 1800 |
| Robo Shibe | 1 | Deeper Learning | 4 | 195,000,000 | 352 |
| Robo Shibe | 2 | Superintelligence | 4 | 295,000,000 | 502 |
| Robo Shibe | 3 | Super-gold | 5 | 620,000,000 | 895 |
| Robo Shibe | 4 | Super Hard | 7 | 1,337,000,000 | 1337 |
| Robo Shibe | 5 | Super Duper | 10 | 2,337,000,000 | 3337 |
| Heavy Doge Walker | 1 | Advanced Hover Tech | 4 | 7,200,000,000 | 850 |
| Heavy Doge Walker | 2 | Advanced Diamond Tech | 7 | 20,100,000,000 | 1700 |
| Heavy Doge Walker | 3 | Reallyhardium Advantages | 12 | 39,000,000,000 | 3500 |
| Coin Seeker 5000 | 1 | Golden Backpack | 4 | 6,400,000,000 | 900 |
| Coin Seeker 5000 | 2 | Needs More Gold | 5 | 23,500,000,000 | 1800 |
| Coin Seeker 5000 | 3 | Switch To Diamond | 7 | 34,000,000,000 | 3420 |
| Coin Seeker 5000 | 4 | I Want To Be | 11 | 6,400,000,000 | 4400 |
| Time Travel Ð-Rex | 1 | Freakin Lazorz | 4 | 9,000,000,000 | 1100 |
| Time Travel Ð-Rex | 2 | Rocketrex | 5 | 17,000,000,000 | 1850 |
| Time Travel Ð-Rex | 3 | More Rocket | 6 | 20,000,000,000 | 2950 |
| Time Travel Ð-Rex | 4 | Clever Girl | 12 | 50,000,000,000 | 3650 |

## Repeatable upgrades

Every audited helper continues past its terminal finite upgrade. The terminal upgrade has no numeral; the first repeatable tier is **II**, then III, IV, and so on. The same terminal sprite is reused. Let `r = purchased level − terminal finite level` (first repeat = 1), and let `C`, `S`, and `D` be the terminal finite Dogecoin cost, per-helper DPS, and Dogediamond cost.

For every helper except CuriosiDoge:

- Dogecoin price: round the sum of `r` copies of `C × 1.01 + C / 20` (a 1.06× base-price step).
- DPS: round the sum of `r` copies of `S × 1.05 + D`.
- Dogediamond price: `D + r × (1 + round(D / 4))`.

CuriosiDoge uses:

- Dogecoin price: round the sum of `r` copies of `C × 1.18 + C / 5` (a 1.38× base-price step).
- DPS: round the sum of `r` copies of `S × 1.01 + D / 2`.
- Dogediamond price: `D + r × (2 + round(D / 4)) + (r > 1 ? 1 : 0)`. Its sampled prices are 7, 11, 14, 17, 20, 23, 26, 29, 32, 35.

These are linear steps anchored to the final finite upgrade; the current tier is not multiplied to produce the next one. The first repeatable step is followed by roughly twice that repeated-step DPS at III. The reference adds floating-point values repeatedly and rounds once at the end. CE does the same: Cloud Base XI is 14,086 DPS and Robo Shibe XI is 35,138 DPS, rather than the one-point-higher results from direct multiplication.

| Helper | Terminal level | Terminal diamonds | II diamonds | III diamonds | II DPS | II Dogecoins |
|---|---:|---:|---:|---:|---:|---:|
| Mining Shibe | 8 | 5 | 7 | 9 | 142 | 265,000,000 |
| Doge Kennels | 9 | 7 | 10 | 13 | 165 | 339,200,000 |
| Streamer Kittens | 9 | 7 | 10 | 13 | 184 | 422,940,000 |
| Space Rocket | 8 | 7 | 10 | 13 | 233 | 318,000,000 |
| Time Machine Mining Rig | 4 | 8 | 11 | 14 | 323 | 848,000,000 |
| Infinite Dogebility Drive | 6 | 99 | 125 | 151 | 15,849 | 2,355,320,000,000 |
| Moon Base | 5 | 7 | 10 | 13 | 280 | 318,000,000 |
| Moon Shibe | 5 | 6 | 9 | 12 | 248 | 222,600,000 |
| Doge Car | 6 | 7 | 10 | 13 | 275 | 265,000,000 |
| Lander Shibe | 5 | 7 | 10 | 13 | 288 | 360,400,000 |
| Mars Rocket | 3 | 7 | 10 | 13 | 296 | 376,300,000 |
| Doge Gate | 3 | 13 | 17 | 21 | 3,767 | 31,800,000,000 |
| Mars Base | 6 | 10 | 14 | 18 | 556 | 2,226,000,000 |
| Party Shibe | 6 | 9 | 12 | 15 | 458 | 954,000,000 |
| CuriousiDoge | 3 | 4 | 7 | 11 | 62 | 68,862,000 |
| DJ Kittenz | 6 | 9 | 12 | 15 | 471 | 954,000,000 |
| Space Bass | 3 | 9 | 12 | 15 | 482 | 1,060,000,000 |
| Jupiter Rocket | 3 | 9 | 12 | 15 | 532 | 1,590,000,000 |
| Cloud Base | 5 | 9 | 12 | 15 | 1,409 | 1,590,000,000 |
| Super Shibe | 4 | 8 | 11 | 14 | 1,058 | 901,000,000 |
| Doge Air Ship | 4 | 10 | 14 | 18 | 1,218 | 1,007,000,000 |
| Flying Doggo | 5 | 9 | 12 | 15 | 1,269 | 1,060,000,000 |
| TARDogeIS | 4 | 10 | 14 | 18 | 1,479 | 1,219,000,000 |
| DogeStar | 3 | 13 | 17 | 21 | 5,074 | 21,200,000,000 |
| Titan Base | 3 | 9 | 12 | 15 | 1,899 | 4,240,000,000 |
| Robo Shibe | 5 | 10 | 14 | 18 | 3,514 | 2,477,220,000 |
| Heavy Doge Walker | 3 | 12 | 16 | 20 | 3,687 | 41,340,000,000 |
| Coin Seeker 5000 | 4 | 11 | 15 | 19 | 4,631 | 6,784,000,000 |
| Time Travel Ð-Rex | 4 | 12 | 16 | 20 | 3,845 | 53,000,000,000 |

## CE integration

`play/js/shop.js` now includes the recorded finite prices, 28 missing terminal upgrades, and repeatable tier calculation. The source also confirms Robo Shibe’s first upgraded DPS is 352 (CE had 852) and D-Rex’s last finite DPS is 3,650 (CE had 8,650); these values are corrected. Level-zero records match the reference helper DPS so the baseline and upgrade calculations agree.

Desktop and mobile upgrade offers have independent coin and blue Dogediamond buy buttons. Both purchase the same next upgrade, update all helpers of that type, and save the result. Stale displayed levels cannot spend currency twice. Prices refresh as either balance changes. Repeatable helpers keep their terminal finite sprites, including the Time Machine rig in the D.I.A. cutscene. Existing `helperUpgradeLevels` and `dogediamonds` save fields persist the new tiers.

CE’s replacement sixth Titan helper, Altar of the SunDoge, retains its existing finite coin upgrades. Its Dogediamond prices and repeatable rules are not invented from the excluded reference helper. The 28 reference-locked terminal upgrades and their continuing tiers require its **Awakened** upgrade (level 1). The requirement is enforced when finding offers and purchasing with either currency. CuriosiDoge’s ungated Rocket Mode follows the reference and remains available.

Validation: `node tests/helper-upgrades.cjs` checks all 432 captured purchases against CE, both purchase currencies, insufficient funds, stale/invalid/unowned purchases, all idle/mining sprite files, serialization, persistent Searchdoge slots, the Awakened Altar requirement, Rick’s buff range and DPS aggregation, and progression beyond the sampled tiers.

Browser verification also covered desktop/mobile diamond purchases, coin purchases, insufficient-funds states, live affordability changes, CuriosiDoge II/III, Titan Robo Shibe II/III, controller activation, loaded terminal sprites, and purchase persistence after reload. The 390px mobile layout was adjusted to keep both currency buttons within each card.
