# Checkpoint 2 — Prestige rewards

**Implemented and tested · October 14, 2026.** M08, M09 and M10 were implemented in sequence, with source-fixture and gameplay tests passing before each next entry. Seven of the original 103 implementation entries are now delivered; 96 remain.

Open the [muted Checkpoint 2 sandbox](http://localhost:8011/play/?parityTest=checkpoint-2). **Ctrl+\** opens its tools automatically. In the normal game, Ctrl+\ → **Open checkpoint sandbox** now opens [Checkpoint 5](05-stories-and-royalties.md); this checkpoint retains its URL and collapsible controls. The older income/discovery controls remain under **Checkpoint 1 · Income & Searchdoge**.

All checkpoint versions keep their saves in separate, per-tab session-storage namespaces. They stay muted, skip cloud/account/analytics initialization, and never copy or write normal player saves or preferences. Refresh retains the selected sandbox; failed isolation stops boot before game-save access.

## Changed behavior

| Entry | Future mission payout | Verification |
| --- | --- | --- |
| M08 | Coin diamonds are `ceil(ceil(coins / 1,000,000)^0.4)`, minimum 1, maximum 60. One million gives 1; one million plus one gives 2; one billion gives 16; one trillion reaches the cap. | 13 frozen outputs from shipped DM2 `_Q(15)`, plus actual mission quote/reward/save checks. |
| M09 | Pickaxe diamonds are `ceil(owned pickaxes / 2)`, including the starting pickaxe/Paw and every duplicate. Rarity does not change the payout, and there is no pickaxe cap. | Nine shipped `DQ()` fixtures across five rarities, starting-item and high-count checks, real reward completion. |
| M10 | Each owned helper type contributes its count times the planet weight, rounded up separately: Earth 0.4, Moon 0.2, Mars 0.3, Jupiter 0.35, Titan 0.4. Empty totals give 1. Above 230, timeline 1 caps at 230; later timelines use DM2's growth calculation. Grouping does not alter ownership. | 88 shipped `IQ()` fixtures, including every planet, per-type rounding, the strict cap and timeline 10/11 boundary. |

The later badge calculation preserves DM2's rounded exponent and its additional term starting on timeline 11. For 1,000 Earth Mining Shibes, the results are 230 on timeline 1, 600 on timeline 2, 13,985 on timeline 10 and 30,886 on timeline 11. These values were executed from the source rather than inferred from screenshots.

These rules apply to future payouts. Existing diamonds and earned badge values are not reduced. Same-type badges add the newly earned value to the old value at prestige. Fixed/protected fortunes and grandfathered Alpha Super Fortune bonuses retain their existing preservation rules.

Reward completion is guarded against repeated callbacks, an earlier timeline's quote and save replacement. Older reward buttons cannot apply a newer quote. Completing a mission also clears previous currency-flight display holds, so they cannot hide new-timeline income.

## Test presets

The **Load 1M / Load 1T** controls replace the sandbox's test save; they are payout examples. Presets pause simulation to keep exact threshold examples stable. The banner shows **PAUSED**, and **Resume mining** at the top of Ctrl+\ resumes rock damage and helper income immediately. Refreshing is not needed to resume. While paused, clicks do not animate a misleading swing.

First-timeline presets equip the normal starting pickaxe. Later-timeline and Paw-only presets use the real Paw item and artwork. Large helper counts use ordinary CE visual groups while retaining every owned helper and name.

| Preset | Coin diamonds | Pickaxe diamonds | Total new diamonds | New badge stat |
| --- | ---: | ---: | ---: | ---: |
| 1M coins · 8 pickaxes | 1 | 4 | 5 | 4 |
| 1T coins · first badge cap | 60 | 4 | 64 | 230 |
| Paw only · zero helpers | 1 | 1 | 2 | 1 |
| Helpers on all five planets | 1 | 4 | 5 | 18 |
| Badge: timeline 2 | 1 | 4 | 5 | 600 |
| Badge: timeline 10 | 1 | 4 | 5 | 13,985 |
| Badge: timeline 11 | 1 | 4 | 5 | 30,886 |
| Preserve earned Alpha rewards | 1 | 4 | 5 | 4 |

Each preset starts with 500 existing diamonds. **View mission quote** opens the production offer; **View badge choices** opens the normal picker. The badge selector in the tools chooses Luck, Wow or Loot Find for **Review rewards · skip cutscene**, which bypasses the cinematic only inside the sandbox and uses the production reward review/reset path.

For the preservation preset, finish the three OK buttons. The result should be timeline 2 with **505 diamonds**, **2,004 Luck on the existing badge**, the real Badge of Patronage's fixed **100 Patronage / 15% Loot Find / 15% Luck / 15% Wow**, and the Alpha Super Fortune's **123,456 flat DPS** retained. The Patron item comes from the production factory with its own gold/black artwork. Refresh before the final OK restores the uncompleted save with 500 diamonds; refresh after completion retains the new timeline and its rewards. Use **Reload test save** to verify persistence or another preset to start again.

The earlier test preset accidentally used the D.I.A. icon and sample stats for Patronage, and marked a normal pickaxe as a Paw. New presets correct both. Loading an older test save repairs that malformed starter; recognized Patron items recover their canonical artwork while retaining all existing earned stat values.

## Validation record

- All **18 CJS suites** pass, including the new prestige source fixtures and production reset checks. All 27 client scripts, three inline scripts and CRLF-aware whitespace checks pass.
- Muted isolated Chrome verifies all eight presets, grouped helper counting, production quote/picker controls, reward review, refresh before/after completion, real saved grants, double-click completion, stale quote rejection and earned-item preservation. The 320px and 375px menus/pickers fit; screenshots were inspected.
- Existing income/discovery browser scenarios pass through the new menu: offline presets, replay/refresh, Beta ordering, purchase-to-search, first/prestige discovery and per-planet clocks. Popup audio/coin-flight/coin-hover follow-ups pass separately.
- No page errors or sandbox cloud requests. Normal save/preferences stay unchanged; missing sandbox bootstraps stop both checkpoint versions before any game/account initialization.
- Follow-up checks cover real clicks in both 1M/1T scenes: no damage/swing while paused, immediate damage after Resume mining, normal versus real Paw artwork, the production Patron icon/fixed stats, and artwork repair of an older test save without changing its earned stats. All eighteen suites and the full checkpoint 1/2 browser workflows pass after this correction.

Source: [coin calculation](/Users/yasin/Documents/Projects/DogeMinerCE/scratch/dm2-research/play-B7Micxas.pretty.js:51206), [pickaxe and badge calculations](/Users/yasin/Documents/Projects/DogeMinerCE/scratch/dm2-research/play-B7Micxas.pretty.js:51221), [mission grant](/Users/yasin/Documents/Projects/DogeMinerCE/scratch/dm2-research/play-B7Micxas.pretty.js:41786). Frozen outputs: [fixtures](/Users/yasin/Documents/Projects/DogeMinerCE/tests/fixtures/dm2-prestige-rewards.json); regression: [prestige payout test](/Users/yasin/Documents/Projects/DogeMinerCE/tests/prestige-payout.cjs). Source bundle SHA-256 remains `24948a089fc981326a2d6ad7a558cc766ca79c85ca11d3c18e976f8dc2a03764`.

This checkpoint does not change Bonus Coin/Rick rewards, DJ royalties, Johnny/Altar progression, timeline history or broader cloud reconciliation. Those remain separate [backlog](../remaining-parity-backlog.md) entries. No commit or deployment.
