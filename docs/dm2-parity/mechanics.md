# Dogeminer 2 mechanics audit — 2026-10-13

This is a source-backed comparison with the **current DM2 2.15 browser build**, released October 10, 2026. The observed runtime banner reports 2.15.0b (SupremeNova); all comparisons below are pinned to the same `play-B7Micxas.js` bundle. The CE column records the pre-migration Alpha behavior. The subsequent implementation is documented in [beta-balance-migration.md](beta-balance-migration.md). Earlier CE helper research used DM2 2.14.1b; version differences should be considered when choosing a parity target.

## Evidence and reproducibility

- Primary game: <https://dogeminer2.com/play/>.
- Public executable bundle: <https://dogeminer2.com/assets/play-B7Micxas.js>.
- Official release notes: <https://blog.dogeminer2.com/Patch-Notes-2.15/>.
- Downloaded bundle: `scratch/dm2-research/play-B7Micxas.js`, 982,083 bytes, SHA-256 `24948a089fc981326a2d6ad7a558cc766ca79c85ca11d3c18e976f8dc2a03764`.
- Readable copy: `scratch/dm2-research/play-B7Micxas.pretty.js`, formatted with Prettier 3.6.2. DM2 line references below refer to this copy, rather than the mostly single-line original.
- Live public template/loot data: `scratch/dm2-research/runtime-data.json`. Captured from `dogeminer.datamanager` and `dogeminer.loot`; this includes dormant/special/seasonal definitions, not just normally obtainable items.
- Repeatable numerical fixtures: `node scratch/dm2-research/compare-mechanics.cjs`, output `scratch/dm2-research/mechanics-comparison.json`. These execute recovered DM2 functions in an isolated VM. Random examples use 20,000 seeded samples; deterministic examples use the exact formulas. They do not alter a live save.

The initialized DM2 research tab was muted through its player sound/music/rock-sound settings, `dogeminer.sound.toggleMute(true)`, Howler mute/zero volume/context suspension, paused media, and an Audio playback stub before any gameplay interaction. Mechanics research only inspected source and initialized state; the tab was handed to the inventory researcher afterward.

## 1. What Mystery Bonus actually does

**Confirmed:** It is a threshold-gated flat income bonus, rather than a percentage multiplier or drop-rate modifier.

Let `M` be the sum of Mystery Bonus on the equipped pickaxe and every owned fortune, and `T` the current timeline. The active location must be Moon or later (`player.level >= 2`).

```text
Earth, or M < 121111:                   mysteryDPS = 0
Moon+ and 121111 <= M < 420133769:       mysteryDPS = 420 * T
Moon+ and M >= 420133769:               mysteryDPS = 6969 * T
```

The second tier replaces the first. `420133769` contains the remembered 420, 1337 and 69; `6969` is the upper-tier payout constant. Mystery is displayed as a `+` stat by DM2's attribute metadata, despite some older community explanations describing it as a percentage. See DM2 `QK`, lines 50421–50450; metadata lines 7448–7453.

The global monetary DPS formula is:

```text
DPS = (
  (
    equippedPickaxeFlatDPS + fortuneFlatDPS + player.extraPersec + mysteryDPS
    + (allHelperBaseDPS + RickAuraExtraDPS) * helperBonusMultiplier
  ) * holidayMultiplier + holidaySpiritExtraDPS
) * patronDPSMultiplier * equippedPickaxeDPSPercentMultiplier * adRewardMultiplier

helperBonusMultiplier = roundTo2dp((1 + sum(fortune HelperDPS%) / 100) * bonusCoinMultiplier)
equippedPickaxeDPSPercentMultiplier = pickaxeDPS% > 0 ? 1 + pickaxeDPS% / 100 : 1
```

Mystery is affected by holiday, patron, Staff and ad reward multipliers. It is **not** multiplied by Helper DPS% or Bonus Coin, because those apply only to the helper term. It does not affect pickaxe DPC, drop probabilities, or `getLevelPersec()` used for rock durability and helper damage. See `qK` at 50397; `QK` at 50421; `tJ` at 50468.

Exact recovered-function fixtures, with 100 helper DPS, timeline 3, no other bonuses:

| Mystery value | Earth total DPS | Moon total DPS |
| ---: | ---: | ---: |
| 121,110 | 100 | 100 |
| 121,111 | 100 | 1,360 |
| 420,133,768 | 100 | 1,360 |
| 420,133,769 | 100 | 21,007 |

**CE discrepancy:** `mysterybonus` is excluded from both factories' core-stat sets and has no player-stat/DPS consumer. It is currently cosmetic. CE's Unknown Fortune asset also specifies a `×4000` stat modifier; the live DM2 Unknown Fortune instead explicitly rolls Mystery in the range 100–100,000 before Wow adjustment. A future parity change should use the actual template ranges, rather than preserve the unverified textual multiplier.

## 2. Stat accumulation, consumers and caps

DM2 uses the equipped pickaxe plus all fortunes for raw Luck, Wow, Loot Find and Critical Chance. Unequipped pickaxes do not contribute. There is no clamp on the raw Luck/Wow/Loot totals in the audited functions (`NK`, `OK`, `GK`, `aJ`, `sJ`, lines 50325–50350 and 50525–50545).

| Stat | Confirmed DM2 behavior | Current CE discrepancy |
| --- | --- | --- |
| Luck | Alters drop/outcome weights; does not roll item stat magnitudes directly. | Used to magnify fortune stats and in a separate logarithmic bag-drop probability. |
| Wow | Rolls both pickaxe and fortune stat magnitudes; rolls pickaxe DPC tier bounds. Timeline changes the Wow formula. | Fortune rolls ignore Wow; pickaxe rolls use a different multiplicative log curve with no timeline factor. |
| Loot Find | Alters drop weights. Uses `1 + rawLoot/100`; does not magnify fortune stat rolls directly. | Fortune magnitudes depend on Loot Find. Template rarity weights all receive the same multiplier, so rarity probabilities do not change. |
| Critical Chance | Starts at 0%; crits can stack through 2.5×, 3×, 3.5× and 4× damage. | Starts at 5%; every crit remains 2.5×, even above 100% chance. |
| Mystery Bonus | The two flat DPS tiers described above. | Cosmetic; no mechanics consumer. |
| Helper DPS% | Sum of fortune `income` stats boosts helper income. | CE combines helper percentages and total-DPS percentages into one multiplier. |
| Flat DPS | Equipped pickaxe `dps` plus fortunes' `persec`; global and location DPS consume different subsets. | Combined into one flat helper term, with Bonus Coin affecting it. |
| Staff DPS% | Staff of SunDoge is fixed +10% to total DPS, with 0 DPC. The new fused Staff is +100% or its fusion result. | The current parser stores +10% as `0.1`, while the consumer/display expects `10`; a second Staff branch adds the raw value again, accidentally giving 1.101× helpers. |
| Space Rocket Costs | Rocket Flight fortunes affect all rocket IDs, with final discount multiplier bounded below by 0.4. The helper-cost exponent is adjusted beyond 16 owned rockets. | CE applies the reduction only for `spaceRocket`, without DM2's 60% discount cap/exponent adjustment. |
| Higher Ground | No gameplay consumer found in the audited main bundle; it has metadata and template rolls. | Explicitly mapped to Luck in CE. This mapping is unsupported by DM2's DPS/stat-roll functions. |

### Critical stacking, exactly

Let `C = (pickaxeCrit + allFortuneCrit) / 100`:

- `0 <= C < 1`: chance `C` of a 2.5× crit.
- `1 <= C < 2`: every hit crits; chance `C - 1` of 3×, otherwise 2.5×.
- `2 <= C < 3`: every hit crits; chance `C - 2` of 3.5×, otherwise 2.5×.
- `3 <= C < 4`: every hit crits; chance `C - 3` of 4×, otherwise 2.5×.
- `C >= 4`: every hit is 4×.

This is the actual nested implementation, including the surprising fall-back to 2.5× between each higher tier. It does not retain the prior tier as the minimum. Crit damage is rounded upward. See `Bm`, lines 19312–19354. CE instead multiplies by 2.5 and floors damage (`calculateClickDamage` in `play/js/game.js`).

At 150% crit, expected DM2 damage is 2.75×; CE gives 2.5×. At 250%, DM2's expectation is 3×; CE still gives 2.5×. At 400%, DM2 is 4×; CE remains 2.5×.

### Staff defect, concrete example

With 100 helper base DPS and only the Staff equipped:

```text
DM2 intended: 100 * 1.10 = 110 DPS
Current CE stat value 0.1: 100 * (1 + 0.001 + 0.1) = 110.1 DPS
Normalized CE stat value 10, if duplicate branch left: 100 * (1 + 0.10 + 10) = 1110 DPS
```

CE's **current** `_parseStatLine()` divides fixed percentages by 100, storing `+10%` as `0.1`. `_applyStatToPlayer()` subsequently divides that value by 100 again, and the Staff-specific block adds the raw value a second time. The user's saved Staff was also observed displaying +0.1% DPS. The near-correct 1.101 multiplier is an accidental result of mixed units, not evidence that the implementation matches DM2.

With +20% Helper DPS and +50 flat DPS fortunes as well, DM2 is `(100 * 1.2 + 50) * 1.1 = 187`; current fractional-value CE is `100 * 1.301 + 50 = 180.1`. A value normalized to 10 would produce `100 * 11.3 + 50 = 1180` until the duplicate Staff branch is also repaired.

A fix must update the fixed-percentage generator, migrate existing fractional values, separate total-DPS percentages from Helper DPS percentages, and remove the duplicate application together. See `play/js/pickaxe-factory.js` around 257 and `_applyStatToPlayer()` / `recalculatePlayerStats()` in `play/js/game.js`. DM2 uses distinct `dpsp`, `income`, `dps` and `persec` keys.

### Rocket-cost detail

DM2 `ea`, lines 13180–13201, sums `rockets` only from owned `flight` fortunes whose first attribute is that stat. It clamps the discount multiplier to at least 0.4. `ta` and `na`, lines 13202–13223, use:

```text
effectiveCount = ownedCount > 16
  ? max(16, floor((ownedCount + 0.15 * ownedCount) * discountMultiplier))
  : ownedCount
cost = ceil(baseCost * 1.15^effectiveCount * patronCostMultiplier * discountMultiplier)
```

## 3. Item-stat generation

### Shared Wow roll

DM2 `FJ` / `weakRandomInt`, lines 50841–50860, handles nearly every non-click item stat, **including fortunes**. For a template range `[min,max]`, Wow `W`, timeline `T`:

```text
If W > 0 and max != 1:
  exponent = T > 10 ? 10 : T == 1 ? 2 : T
  offset = round(log(W^exponent) + T)
  low = min + offset
  high = max + offset
If W > 0 and max == 1:
  low = high = 1
If W <= 0:
  low = min
  high = max

result = max(1, round(random() * (high - low + 1) + low))
```

Because DM2 uses `round` together with `+1`, this can yield `high + 1`; even nominally fixed `[5,5]` values can vary when passed through this function. This detail is preserved in the numerical fixtures.

CE pickaxe percentage rolls are instead:

```text
base = 1 + random() * 24
value = roundTo1dp(base * (1 + random() * log2(1 + Wow / 10)))
```

CE fortune percentage rolls are:

```text
base = 1 + random() * 24
value = roundTo1dp(base * (1 + log2(1 + Luck / 50 + LootFind / 500)))
```

CE rolls every listed template stat, with generic indicator-based ranges. DM2 uses each specific stat's range and discards random excess stats: at most **1 / 1 / 2 / 3 / 3 secondary stats** for Common / Improved / Rare / Epic / Legendary, and at most **one tertiary stat**, while retaining all primary stats. See `tv`, lines 23226–23301. This alone changes the rate at which total stats accumulate.

Stronger Pickaxe's Loot Find is a directly comparable example: live DM2 specifies 4–9; CE specifies only a generic `+% Loot Find`.

| Wow | DM2 range, timeline 1 | DM2 sampled mean, timeline 1 | DM2 range, timeline 5 | CE sampled-formula mean |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 4–10 | 6.98 | 4–10 | 13.00 |
| 100 | 14–20 | 16.98 | 32–38 | 35.49 |
| 1,000 | 19–25 | 21.98 | 44–50 | 56.28 |
| 10,000 | 23–29 | 25.98 | 55–61 | 77.79 |

### Fortune defaults and location offsets

Fortunes with explicit attribute ranges use those ranges. For fortunes whose attributes are initially empty, DM2 `$y` fills rarity-specific ranges and adds a location offset **2 / 5 / 8 / 11 / 17** for Earth / Moon / Mars / Jupiter / Titan to the mechanical ranges, before the shared Wow roll. Flavor stats use the unshifted `fun` range. `nostats` items bypass scaling and stat selection uses minima, with the special `rockets` handling present in the generator. See lines 23099–23212.

| Rarity | Luck range | Wow range | Loot Find range | Helper DPS / flat DPS range | Flavor range |
| --- | --- | --- | --- | --- | --- |
| Common | 3–6 | 3–6 | 3–6 | 1–4 | 1–30 |
| Improved | 2–8 | 1–8 | 2–8 | 1–4 | 4–35 |
| Rare | 7–14 | 7–14 | 7–14 | 2–5 | 9–100 |
| Epic | 15–30 | 15–20 | 15–20 | 5–7 | 30–420 |
| Legendary | 19–25 | 19–30 | 19–40 | 6–8 | 30–1,000 |

These are available base ranges, not promises that all stats will appear: each rarity has a candidate-stat list and the secondary/tertiary limits above. CE's fixed generic 1–25% roll does not reproduce these differences.

## 4. Pickaxe DPC progression and drop cadence

DM2's DPC is tied to **highest location reached and helper milestones**, the current strongest collected pickaxe, Wow, rarity and timeline. It is not CE's single damped-growth formula. `getCurrentTier` / `$J`, lines 51035 onward:

| Highest location | Tier rules | Integer tier bounds |
| --- | --- | --- |
| Earth | 1; 1.5 with Streamer Kittens | 12–100 |
| Moon | 2; 2.5 with Lander Shibe | 115–1,000 |
| Mars | 3; 3.5 with DJ Kittenz | 1,100–5,000 |
| Jupiter | 4; 4.5 with Flying Doggo; 5 with DogeStar; 6 with Infinite Dogebility Drive | 6,000–9,000; 10,000–17,500; 40,000–70,000 |
| Titan | 6; 6.5 with Heavy Doge Walker or Coin Seeker 5000; 7 with Johnny Silverpaw or Time Travel D-Rex | 40,000–70,000; 80,000–200,000 |

A half tier raises the lower bound halfway toward the upper bound. Both DPC bounds use DM2's stronger Wow roll, `NJ` / `randomInt`, lines 50805–50840:

```text
If Wow W > 0 and bound != 1:
  timelineShift = 25 * (T > 10 ? 10 : T == 1 ? 0 : T)
  effectiveTimeline = T > 10 ? 20 : T
  divisor = W>900 ? 1 : W>500 ? 2 : W>400 ? 2.5 :
            W>300 ? 3 : W>200 ? 3.5 : W>100 ? 5 : 6
  wowShift = floor((30 + effectiveTimeline) * log(W^1.2) / divisor)
  adjustedBound = bound + timelineShift + wowShift
  rolledBound = round(random() + adjustedBound)  // same min and max inputs
Else:
  rolledBound = bound
```

Then `tv` applies the following exact logic, where `min/max` are adjusted bounds, `K` is strongest collected DPC, `A` is active location, `B` is integer tier, `T` timeline, `dropType` is bag quality:

```text
If timeline1 and K < 3: return 3 DPC
If min > K and A != Earth and highestLocation != Earth: return min

rarityMultiplier = [1.10, 1.11, 1.12, 1.13, 1.16] by rarity
If A < B and dropType < 2 and T != 1 and A != Earth and highestLocation != Earth:
  rarityMultiplier = 1.03

next = ceil(min * rarityMultiplier)
If next >= max:
  next = max + ceil(15 * random() + 1) * rarityMultiplier
If next <= K:
  next = (K + ceil(15 * random() + 1)) * rarityMultiplier
         + T * rarityMultiplier * 2
return round(next)
```

CE instead uses `growth=.15/(1+.35*log10(max(2,K)))`, adds a small random growth/flat boost, then multiplies the result by **1 / 1.1 / 1.25 / 1.5 / 2** for its rarities. Wow does not affect CE DPC. Legendary therefore nearly doubles CE DPC at every drop versus roughly +16% once above DM2's tier minimum.

Concrete recovered-function means for new Common versus Epic pickaxes (CE's matching rarity multipliers 1 and 1.5):

| Current strongest DPC | Location/tier, Wow, timeline | DM2 Common | CE Common | DM2 Epic | CE Epic |
| ---: | --- | ---: | ---: | ---: | ---: |
| 1 | Earth/tier1, Wow0, timeline1 | 3.00 exactly | 3.00, range2–4 | 3.00 exactly | 4.33, range3–6 |
| 100 | Earth/tier1, Wow0, timeline1 | 122.18 | 116.52 | 125.45 | 174.53 |
| 1,000 | Moon/tier2, Wow100, timeline1 | 1,112.18 | 1,106.84 | 1,142.45 | 1,660.01 |
| 10,000 | Mars/tier3, Wow1000, timeline5 | 11,020.91 | 10,830.68 | 11,321.45 | 16,245.77 |

These are representative formulas using public Common/Epic definitions, not claims that the same item naturally drops in each listed location. No particular player's save is used.

Drop cadence is also materially different:

- DM2's natural bag pools exclude already-owned pickaxes and fortunes (`YC`, `$C`, lines 33984 and 34033). Bags advance to the next quality after all their available items have been collected (`WM`, `UM`, lines 32598–32648). The Mystery Box can separately produce repeats.
- DM2 pickaxes have a natural cooldown: 45 seconds on timeline1, 25 seconds on timeline2, 12 seconds afterward. After more than three non-pick prizes, non-Legendary pick weighting is boosted by Luck (`jC`, lines 33937–33983).
- DM2 adjusts outcome weights with `lootWeightMultiplier=max(1,(1+Loot/100)/3)` and `luckAddition=max(1,(1+Luck/100)/6)`. Item weights gain these adjustments while coin/diamond outcomes behave differently, so relative probabilities actually change.
- CE uses 60% pickaxe / 20% fortune / 20% coins, has no equivalent pickaxe cooldown or natural unique-item depletion, and repeatedly compounds rarity gains.
- **Confirmed CE bug:** both `rollTemplate()` methods compute each rarity weight as `baseWeight * (1 + LootFind/100)`. That common factor cancels when divided by total weight, so Loot Find has no effect on the rarity distribution. This applies at every positive Loot Find value; it is not just a high-stat cap.

## 5. Rock durability and helper damage

**Confirmed DM2 maximum durability:**

```text
HP = ceil((planetBase + ceil(2.5 * currentPlanetDPS + ceil(2 * equippedDPC)))
          * 1.1^(planetRockLevel - 1))
If rock type is 9: HP = round(HP + HP/7)
planetBase = Earth60, Moon3000, Mars155000, Jupiter450000, Titan2500000
```

See `fs`, lines 13513–13521; planet definitions in runtime data; `Cm`, lines 19263–19276. Rock level advances separately per location on break. `currentPlanetDPS` is the local helpers' income multiplied by fortune Helper DPS/Bonus Coin, plus equipped flat pickaxe DPS (and Rick aura when present); it excludes Mystery and fortune flat DPS.

DM2 clicks deal full damage up to remaining rock HP, and coin earnings are clipped to that remaining HP as well (`Bm`, lines 19312–19354). There is no 15%-of-maximum damage cap. Helpers damage the rock every 200ms using `currentPlanetDPS / 2` on timeline1 and `/3` on later timelines, or 2.5× / 1.6667× local DPS per second respectively (`Rm` at 19363 and `xR` at 40519). This continues to advance loot even with no clicking.

CE's `getRockHP()` in `play/js/game.js` instead uses:

```text
HP = max(floor(planetBase * growthFactor^rocksBroken), floor(strongestDPC * 6.67))
planetBase = Earth100, Moon500, Mars1500, Jupiter5000, Titan25000
growthFactor = Earth1.15, Moon1.25, Mars1.40, Jupiter1.60, Titan1.85
```

CE caps each click's **rock damage** at 15% maximum HP but awards the full calculated DPC as coins, including damage beyond remaining HP. This cap requires at least seven hits, rather than the comment's ten. CE's helpers do not damage rocks: every decreasing assignment to `rockCurrentHP` in the audited `game.js` comes from a click.

Controlled examples at 100 equipped/strongest DPC and 1,000 local helper DPS; no buffs, crits or type9 shine bonus. CE broken count is DM2 rock level minus one:

| Planet | Rock level | DM2 HP | CE HP | CE / DM2 |
| --- | ---: | ---: | ---: | ---: |
| Earth | 1 | 2,760 | 667 | 0.242× |
| Earth | 10 | 6,508 | 667 | 0.102× |
| Earth | 50 | 294,545 | 94,231 | 0.320× |
| Moon | 1 | 5,700 | 667 | 0.117× |
| Moon | 10 | 13,441 | 3,725 | 0.277× |
| Moon | 50 | 608,299 | 28,025,969 | 46.1× |
| Mars | 1 | 157,700 | 1,500 | 0.0095× |
| Mars | 10 | 371,849 | 30,991 | 0.0833× |
| Mars | 50 | 16,829,580 | 21,695,267,399 | 1,289× |
| Jupiter | 1 | 452,700 | 5,000 | 0.0110× |
| Jupiter | 10 | 1,067,443 | 343,597 | 0.322× |
| Jupiter | 50 | 48,311,672 | 50,216,813,883,093 | 1,039,434× |
| Titan | 1 | 2,502,700 | 25,000 | 0.0100× |
| Titan | 10 | 5,901,236 | 6,345,788 | 1.075× |
| Titan | 50 | 267,085,535 | 308,570,710,445,764,860 | ~1.16 billion× |

This establishes a much easier starting rock on later CE planets but a radically steeper exponential wall. The difference is not explainable by a small base-value adjustment. A fresh no-helper/no-stat start is also different: DM2 first Earth rock is 62HP with the 1DPC starter; CE begins at 100HP with its 5% base crit.

### Other loot-progress differences affecting perceived balance

DM2 damage thresholds are under 90%, under 75%, under 51%, under 25%, and zero HP; CE uses 90/75/50/25/zero. DM2 grants a bag on each tenth rock type and has specific early guarantees: the second broken rock gives a bag, and rock20 guarantees a diamond if none has been obtained (`HM`, `GM`, lines 32473–32516). CE's guarantees and drop probabilities differ.

Natural DM2 outcome weights also depend on rock tier/type, Luck and Loot Find. At break, chest weight is `10 * (1 + LootFind/100) + (1 + Luck/100)`; diamond weight is 1; small/medium/large coin weights are 1/4/6; Nothing starts at `7 - rockTier - 2*rockType` and is further reduced by Loot Find. Only positive weights enter the selection. On rock type10 DM2 uses the guaranteed bag/coins path instead. See `BM` 31480 and `NM` 32516. CE uses independent event probabilities and a 30% capped bag chance.

## 6. Time travel and recommendations for a separate balancing pass

DM2 forms a Super Fortune from non-protected fortune stats while excluding `persec` (flat fortune DPS), `dps` and `rockets`. CE `_makeSuperFortune()` currently carries every stat through, including flat DPS and rocket discounts. This changes timeline-start strength and allows bonuses intended to reset to accumulate indefinitely. See DM2 `CL`, lines 41770–41788; CE `play/js/time-travel.js` around 943.

The safest implementation sequence is:

1. Fix confirmed isolated defects: Staff fixed-percentage unit mismatch/duplicate application, the ineffective Loot Find rarity weighting, and missing Mystery consumer. Avoid normalizing Staff values without also removing its duplicate branch.
2. Decide which DM2 version is the parity target and how existing CE rolls/saves should migrate. Live 2.15 added Staff fusion and changes to loot stack saving; previous helper-parity notes used 2.14.1b.
3. Port item-specific ranges, Wow/timeline formulas, secondary/tertiary selection, tier DPC rules, and drop-pool/cooldown behavior together. Fixing one in isolation changes the flow of stat acquisition in another.
4. Port rock HP, full-damage clipping, local helper mining and threshold/drop rules together, then replay representative timeline1 and later-timeline progression.
5. Apply deliberate CE deviations only after the matching baseline is measurable. Keep the improved CE inventory interface independent of this balancing decision.

**Remaining uncertainty:** This audit confirms the current public browser build. It does not prove that an older DM2 release used identical formulas, quantify full player-session pacing after every story/upgrade unlock, or establish an intended effect for Higher Ground beyond the absence of a consumer in the audited bundle. Production balance changes and save migrations remain a separate task.
