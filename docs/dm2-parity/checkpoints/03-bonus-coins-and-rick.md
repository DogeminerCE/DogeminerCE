# Checkpoint 3 — Bonus Coins and Rick

**Accepted · October 15, 2026; implemented October 14.** M20, M21, M22 and E02 were implemented in order, with targeted tests passing before each next entry. At this checkpoint, eleven of the original 103 implementation findings were delivered. [Checkpoint 5](05-stories-and-royalties.md) now brings the total to 16 delivered and 87 remaining.

Open the [muted Checkpoint 3 sandbox](http://localhost:8011/play/?parityTest=checkpoint-3). **Ctrl+\** opens its tools automatically. The normal game's **Open checkpoint sandbox** now opens [Checkpoint 5](05-stories-and-royalties.md). Checkpoints 1–3 retain their own URLs and collapsible controls.

Each checkpoint uses a separate per-tab session save. Normal saves and preferences are never copied or written. Test sessions mute audio and skip cloud/account/analytics initialization. Refresh keeps test progress; failed isolation stops boot before game-save access.

## Bonus Coins

| Tier | Name | DPS/mining boost | Duration | Draw weight |
| --- | --- | ---: | ---: | ---: |
| 1 | Golden Bonus | +50% | 60s | 40 |
| 2 | Moon Coin | +60% | 60s | 25 |
| 3 | Pristine Bonus | +70% | 75s | 15 |
| 4 | Ultra Pristine Bonus | +90% | 90s | 10 |
| 5 | Hyperultra Pristine Bonus | +110% | 105s | 6 |
| 6 | Super Ultra Omega Bonus | +150% | 120s | 4 |

Reaching a planet adds every ordinary tier up to that planet to the weighted pool. Buying its base is unnecessary. Timeline 2 also adds tier 6: an Earth-only second timeline draws from tiers **1 and 6**. The Altar does not unlock that tier. A new timeline resets the reached-planet portion to Earth.

The coin freezes its tier when it appears. Unlocking another planet before clicking cannot change that offer. A new claim replaces the current buff, including when the new multiplier is weaker; buffs do not stack. The HUD keeps the claimed coin's name, icon and actual remaining time. Claims immediately save the buff's deadline and claim count; duplicate and detached old claims are rejected.

The periodic check runs every **120 seconds**, independently of claims and missed field coins. Chances progress **22%, 44%, 66%, 88%, 100%** after successive misses and return to 22% after a successful spawn. Paused/hidden game events skip checks without building offline offers. A successful roll while a field coin exists leaves the odds unchanged. Each coin stays for **eight seconds**.

The early offer requires **nine owned Mining Shibes**, a wallet strictly above **10 coins**, no previous claim, and no earlier first offer. It is checked once a second during active play and saved immediately. Missing that offer does not repeat it after refresh. Claims/first-offer history survive prestige, as in DM2.

CE keeps its existing saved-buff convenience while decision D08 remains open. An already active Alpha buff retains its multiplier and deadline, even if those differ from the new table. Refresh does not restart a buff. Field coins and escalating spawn odds are runtime state. The fixed one-damage Paw remains the existing CE decision D06. Bonus Coins now use solid strokes; the separate source HUD redesign is still U23.

## Rick

Rick adds **twice the upgraded base DPS of nearby helpers** to the helper-income term, before Helper DPS%, Bonus Coin and total DPS multipliers. The same aura enters the current planet's helper rock-mining income. Flat pickaxe/Fortune DPS and Mystery retain their existing positions in the formulas. Offline income excludes both Rick and Bonus Coin buffs.

Radius is **18% of the field's logical width**, clamped to **70–240**, with the exact boundary included. CE's top-left helper positions are converted to sprite centers. Held/destroyed helpers and helpers on other planets are excluded. Every owned member of a CE group counts once; picking up a group excludes all its members immediately. An empty field never boosts every unplaced helper. At most 40 visible helper sprites receive the green stroke; that cap does not reduce income.

Dragging, dropping, canceling a drag, upgrading helpers and resizing update the aura. Grouping/redrawing helpers preserves the visiting Rick. Leaving the planet, importing/resetting a save, prestige or refreshing clears temporary Rick state. Phone layouts keep CE's helper bar while Rick remains visible and touch-draggable. His existing 30-second visit, portal behavior and schedule remain; broader Rick movement/presentation parity is E03.

## Try it

Scenes load **paused** for inspection. **Resume mining** starts ordinary income/rock clicks immediately. Coin expiry, buff countdowns and Rick's 30-second visit continue on their existing timers.

- **Load Earth / Mars reached / Titan reached / timeline 2** compares eligible pools. The reached-planet scenes own no off-planet bases.
- **Spawn weighted coin** uses the production draw. **Spawn selected tier** deliberately bypasses unlocks to inspect each tier. These actions close the tools to expose the eight-second claim window; click the coin, then reopen Ctrl+\ for its tier/countdown and save controls.
- **Step two-minute check** runs a real random check immediately. **High roll · build odds** produces successive misses until the guaranteed fifth check. **Force successful check** tests the success path. An existing field coin still blocks another spawn.
- **Load nine Shibes · early offer**, then **Resume mining**, produces the first coin within one second. Missing it and reloading cannot repeat the early offer.
- **Load Rick · nearby groups** creates a near ×4 Mining Shibe group, one nearby Kennel, two distant Shibes and two unplaced Shibes. Drag Rick or the near group and compare DPS/green strokes. Cancel a pickup with Escape, group/ungroup helpers, remove Rick, or reload. Load the scene again for another 30-second visit.

## Verification

- **20 CJS suites pass**, including six source tiers and **251** primary-source unlock/draw outputs, **20** Rick geometry cases and **four** income/multiplier-order cases. Tests cover activation/expiry, saved legacy buffs, stale/duplicate claims, independent 120s timing, first-offer gates, group counts, held helpers, source range edges, planet isolation, visual caps, offline exclusion and prestige resets.
- Muted isolated browser checks exercise all presets, all six real claims, actual group/Rick drags, saved/refreshed/legacy buffs, early-offer persistence, grouping/reload cleanup, and desktop/**375px/320px** layouts. Normal save/preference sentinels remain unchanged and no page errors or sandbox cloud requests occur.
- Source outputs were executed from the pinned DM2 bundle, SHA-256 `24948a089fc981326a2d6ad7a558cc766ca79c85ca11d3c18e976f8dc2a03764`. Extractors and browser evidence are in `scratch/checkpoint-3-qa/`; the pre-change files are in `scratch/checkpoint-3-baseline/`.

References: [source tier table](/Users/yasin/Documents/Projects/DogeMinerCE/scratch/dm2-research/play-B7Micxas.pretty.js:24977), [selection](/Users/yasin/Documents/Projects/DogeMinerCE/scratch/dm2-research/play-B7Micxas.pretty.js:52085), [spawn check](/Users/yasin/Documents/Projects/DogeMinerCE/scratch/dm2-research/play-B7Micxas.pretty.js:52288), [early offer](/Users/yasin/Documents/Projects/DogeMinerCE/scratch/dm2-research/play-B7Micxas.pretty.js:37058), [Rick aura](/Users/yasin/Documents/Projects/DogeMinerCE/scratch/dm2-research/play-B7Micxas.pretty.js:34844), [global/local income](/Users/yasin/Documents/Projects/DogeMinerCE/scratch/dm2-research/play-B7Micxas.pretty.js:50421). Frozen fixtures: [Bonus Coins](/Users/yasin/Documents/Projects/DogeMinerCE/tests/fixtures/dm2-bonus-coins.json), [Rick](/Users/yasin/Documents/Projects/DogeMinerCE/tests/fixtures/dm2-rick-aura.json).

This checkpoint leaves Johnny/Altar, DJ royalties, the Bonus HUD redesign, the bonus tutorial story and Rick's wandering/portal work in their existing backlog entries. No commit or deployment.
