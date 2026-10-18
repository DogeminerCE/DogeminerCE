# Beta balance and Alpha save migration

Implemented October 13, 2026. Balance version: `dm2-beta-1`.

The numerical target is the DM2 2.15 public bundle recorded in [mechanics.md](mechanics.md). This ports verified stat rolls, DPC tiers, crits, income, natural loot, Mystery Box selection, and rock progression to CE's existing inventory and helpers. It does not add every DM2 2.15 feature or seasonal system.

## New item and gameplay rules

- `balance-data.js` contains the source's numerical definitions and loot pools. `balance.js` owns Wow/timeline roll formulas, per-item ranges, rarity stat limits, helper progression tiers, natural unique-item pools, and repeatable Mystery Box selection.
- Factories share those rules. Loot Find and Luck affect relative loot weights, rather than all weights being multiplied by the same factor. Natural pickaxe cooldowns are 45 / 25 / 12 seconds on timeline 1 / 2 / 3+. Already-owned natural items are excluded, with bag quality advancing when a pool is depleted. Bag planet/quality is set at spawn and contents are rolled when opened, so unopened bags do not reserve duplicates.
- Fixed bonuses remain fixed. Staff of the SunDoge stores the declared +10% as `10`, has 0 DPC, and multiplies total DPS once. Flat pickaxe DPS, flat fortune DPS, helper income percentages, total DPS percentages, and Mystery Bonus are applied separately. Higher Ground has no mining effect in the audited source.
- Mystery Bonus on Moon or later yields `420 × timeline` DPS at 121,111, or `6,969 × timeline` at 420,133,769. The upper tier replaces the lower tier. Earth receives neither. Mystery contributes to income, excluding local helper damage and rock HP scaling.
- Critical chance starts at zero. Source critical tiers and rounding replace the old base chance; Paw remains exactly 1 DPC. Click income is clipped to remaining rock HP.
- Rock HP uses the equipped base DPC and local planet DPS with 1.1 growth per difficulty step, source planet bases, and the type-9 shine increase. Break loot uses the next rock level, matching the source; types stop cycling beyond its 36 named tiers. Local helpers damage rocks every 200 ms, using DPS / 2 on timeline 1 and DPS / 3 later. Income from other planets remains global.
- Rocket Flight discounts apply to all rocket types, with a 60% cap and the source exponent adjustment beyond 16 owned. Desktop, mobile, and purchase prices share the same calculation.
- Mystery Box standard openings use the source ten-normal/one-double cycle and 20–25 minute cooldown progression. Claimed items are saved before the shared loot reveal; the existing CE Supporter always-double perk is retained. Mystery Box prize pools only use reached planets. Item generation uses the active planet, separately from the planet selected for the pool. A second reward is forced to fortune only when the first reward is a pickaxe; reward-kind memory is saved before that override, as in DM2.

The currently installed CE assets load 78 pickaxe templates and 100 fortune templates. Baguette of Sporklin has no verified matching definition in the pinned DM2 build; its fallback and existing saved items are explicitly marked unmatched. Golden Moon Fortune now supplies the previously missing Moon pool entry. Every pickaxe and fortune referenced by the audited twenty natural bag pools resolves to an installed template; collecting Golden Moon Fortune is required for the corresponding Moon tier to advance.

## Existing Alpha items

`BetaSaveMigration.prepare()` clones and validates the Alpha save, then replays variable items in a stable order. Saved acquisition context is used when available. Otherwise instance timestamps, item origins, timeline, prior rebalanced items, and preserved earned bonuses reconstruct a reasonable progression. The report explains these estimates: Alpha did not retain every historical helper or equipped-pickaxe choice, so exact historical rolls cannot be recovered.

Each item has a seed derived from the balance version and its stable instance ID. Once migrated, a versioned save loads without another replay. Reimporting the same Alpha save produces the same items; a receipt preserves acknowledgment for that identical save.

Preserved without a reroll:

- Patron and other fully fixed fortunes.
- Existing Super Fortunes, because Alpha only stored merged totals. Earned bonuses also survive later prestiges. New ordinary fortunes use DM2's merge exclusions.
- D.I.A. badges, protected/soulbound items, and unmatched custom items.
- Fixed individual stats on otherwise variable items.

The known Staff `0.1` percentage-unit error is explicitly corrected to the declared `10`; it is identified in the report. Variable item rarity is corrected to the verified source quality. IDs, item counts, sprites, equipped selection, currency, and lifetime rock counts stay intact. The strongest-pickaxe record is rebuilt from verified replayed pickaxes, so an unmatched inflated custom item does not inflate future normal drops.

## Planet rock rescue

Lifetime `rocksBroken` and difficulty `rockLevel` are separate. On migration, each planet receives a fresh Beta HP calculation; excessive Alpha difficulty is reduced to a level bounded by the first Beta rock or roughly one minute of mining at five clicks per second plus local helpers. Existing positive damage progress is preserved as a fraction of maximum HP. A saved destroyed or invalid rock restarts with valid health.

This is a one-time CE migration rescue, not a permanent growth cap. New breaks then advance using the DM2 formula. The report includes every planet's HP, difficulty, lifetime counts, and rescue reason.

## Save and report behavior

- The original Alpha payload is retained under `dogeminer_ce_alpha_backup_dm2-beta-1`, independently of the ordinary rolling backup.
- Migrated progress, rock rescue, and the complete report are committed before ordinary saving resumes. Preparation or storage failure blocks autosave; failed commits restore previous state and storage.
- The save retains the complete report: all items and stat rows, kept bonuses, rarity/DPC changes, aggregate stats, and planet rocks. The player popup shows only changed active totals, with before/after values and up/down indicators. Explanations and individual item lists are omitted from the popup. “Welcome to Beta!” is the primary heading. The compact popup uses the last active planet's colors; it fits ordinary phone and desktop screens without scrolling. Gameplay pauses while reviewing it; keyboard, touch, and controller input stay inside the popup.
- Continue acknowledges only after a durable save. Refreshes before Continue show the report again. Rejected acknowledgment keeps the report open for retry. Loading another save replaces the visible report so it describes the current inventory.
- Import/reset invalidates old currency-flight and rock-regeneration callbacks. Autosaving during the rock animation preserves the pending new rock; interrupted regeneration loads valid HP.

## Verification

Run each `tests/*.cjs` with Node. The suite covers recorded helper prices/upgrades, deterministic migration, preserved items, Staff units, all-item reports, backup/transaction failure handling, duplicate imports, durable acknowledgment, invalid and regenerating rocks, currency animation persistence, late-game formatting, DM2 numerical roll fixtures, real template loading, loot depletion, Mystery Box rules, source gameplay income/crit/rock fixtures, and report startup/controller lifecycle.

The original detailed report was exercised with 150 items, malicious labels, duplicate stats, sign changes, focus trapping, and acknowledgment retry. Its replacement compact popup was checked with all eleven active totals changing and the actual DogeSans font: at 320 × 568 its card is 292 × 368; at 510 pixels wide its card is 482 × 304. Both fit without scrolling, and the Welcome heading is larger than the subtitle. Mars and Moon themes were visually checked. A muted isolated localhost preview confirmed the complete game boots with the report pending and both template factories loaded. Subsequent interactive preview snapshots timed out; remaining checks used headless rendering and Node regressions without modifying the user's browser save.
