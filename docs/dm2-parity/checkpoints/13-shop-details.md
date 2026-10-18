# Checkpoint 13 — Shop DPS details and Checkpoint 12 review fixes

**October 16, 2026 · Review checkpoint.** Adds U24 and the requested M23/M32 presentation corrections. **53 of the original 103 implementation findings delivered; 50 remain.** Q09's holiday preference still waits for E04.

Open the [muted Checkpoint 13 sandbox](http://localhost:8011/play/?parityTest=checkpoint-13), press **Ctrl+\**, choose a feature and press **Show feature**. Four choices, two buttons. Normal saves/preferences are untouched; test progress uses private per-tab session storage, with audio muted and cloud/account/analytics disabled.

| Preview | What to review |
| --- | --- |
| Automatic loot & equip | Four new bags reveal a golden pickaxe, fortune, coins and diamonds. All four disappear automatically; the pickaxe equips, and the rewards reach inventory/counters. |
| Buy Max motion & icon | Hold a helper buy button, slide upward and release. The real Dogecoin icon accompanies the price; two animated upward chevrons replace the old rails. Escape/expiry retracts the popup. Purchasing expands/fades it with a small particle burst. |
| Boosted helper DPS | Gray per-helper DPS includes the upgraded base and active income boosts. Click the line to see the breakdown. |
| Helper DPS breakdown | A Mars example opens the source-colored total/base/stat-added hint. Click outside or press Escape to close; click the DPS line to reopen. |

Replay resets only the private scene. Earlier checkpoint links retain their own storage namespaces. The old Checkpoint 12 auto-loot preview also benefits from the corrected demo setup.

## Why a bag was left behind

Checkpoint 12 deliberately seeded an older manual bag before creating the four automatic drops. That tested the production rule that enabling auto-pickup does not retroactively consume old saved stashes, but made the visual demo appear broken. The demo now contains only four new drops, and the browser check requires every bag to clear with exactly one pickaxe, one fortune, 327 coins and three diamonds awarded. The ordinary saved-stash policy is unchanged and remains tested separately.

## Buy Max presentation

DM2's source calls its design “Ladder,” but the renderer draws two upward-moving chevrons with a 600ms cycle. CE's old literal ladder rails were an incorrect interpretation. The replacement uses those source chevron positions/fades, including hiding them when armed, stale or reduced motion is enabled.

Entrance, pointer lean, squash and retraction use the source spring integrator, with substeps through elapsed time rather than a frame-count assumption. Dismissal retracts toward the buy button. A purchase expands the body to 1.35 and fades it over 200ms while eighteen source-colored particles disperse. The real Dogecoin image replaces the text “D.” CE retains a separate total-price line and fits the DOM popup to its panel/viewport, rather than replacing the shop with a canvas renderer. No glow is added.

Existing CSS button transitions are disabled on this animated body so they cannot delay its source motion. Releasing over the original button explicitly buys one even if the entering bubble passes under the pointer. A canceled Escape release cannot accidentally buy one. Linger, touch, keyboard, affordability/location/epoch guards, 100-helper cap, exact CE price quotes and atomic purchase waves remain intact. Hard field resets remove exiting effects and cancel stale work.

## Helper DPS details

The shop now shows source per-helper income: upgraded base × the income/Bonus Coin multiplier rounded to two decimal places. It is a per-helper readout, not the player's overall DPS. Global total-DPS multipliers, flat item income and other helpers are excluded, matching the source shop line. This does not change the underlying economy or any earned/fixed/Alpha item stats.

The gray text becomes italic on hover. Clicking it shows the helper name and boosted income; when there is a positive bonus, the hint adds base income and green stat-added income. Source number formatting trims a single decimal rather than rounding it. The five source hint fill/border/text palettes and the existing notification audio asset are used. The compact hint stays near its stat and remains inside the viewport, with eased entry/exit. Show Hints controls it.

CE also makes the interaction available to keyboard and phone tap users; DM2's source click binding omits phones. The hint does not pause mining or mutate saves. It updates with temporary boosts and clears when its anchor/tab disappears, on travel/import/reset, scroll, resize, blur, competing dialogs, Escape or outside click. There are no inactive controls or new persistent settings.

## Evidence and verification

The shipped bundle was fetched directly again this checkpoint: **982083 bytes**, SHA-256 **24948a089fc981326a2d6ad7a558cc766ca79c85ca11d3c18e976f8dc2a03764**, identical to the audit source. Executed source evidence covers eight spring trajectories at 30/60/100/144Hz, eight body frames, twelve chevron cases, 45 helper-income outputs, eighteen number-format outputs and five hint palettes.

Native DM2 was opened and muted first; two snapshots returned `Preview automation snapshot timed out after 15000ms.` The owned tab was closed. The isolated Chrome source page then showed Cloudflare security verification, so no live visual parity certification is claimed. Source function comparisons and muted isolated Chrome CE checks provide the verification; the direct shipped JavaScript fetch succeeded.

All **38 CJS suites**, **37 client-script checks** and **three inline-script checks** pass. Focused Chrome checks require all four demo bags to clear, exact rewards/equip, a decoded coin icon, moving chevrons, visible intermediate retract/purchase frames, eighteen particles, cancellation without a stray buy, reduced motion and stale-reset cleanup. Actual CDP touch, lingering purchase, keyboard and rejected-save tests remain covered.

The real Ctrl+\ menu passes **sixteen previews** at 1280/375/320/844, with four choices/two buttons, bounded shop hints/Buy Max, visible grouped preview helpers, muted audio and unchanged normal saves/preferences. Rapid hint close/reopen/reset leaves one current hint and no stale exit. Four-size interaction tests cover live boosts, zero-bonus content, Show Hints, no economy mutation and five source hint palettes. All **eleven historical browser suites** pass: CP12 automation/touch lifecycle, CP11 previews/helper lifecycle, CP10 field/previews/24-item opening, shared popups, prestige, income/SearchDoges and thirteen missing-script/version guards.

Initial failures and corrections are retained. Button CSS transitions were delaying the source animation; the animated body now owns its motion. Native click targeting could lose an original-button release when the bubble moved underneath it; explicit release handling and Escape suppression fix that. Animated targets are clicked by actual coordinates in the QA harness. The phone preset must refresh its existing shop cards when changing planets and wait for its preview scroll before opening the hint. Private helper groups are fitted inside the visible panel. Source single-decimal trimming replaces an early rounded formatter. The final image check decodes visible images; an earlier run reported the diamond image unloaded while direct asset requests returned 200, without an asserted root cause.

**Twelve final decoded-art scenes** pass across desktop, phone and landscape. The final **115-file implementation manifest** matches the reviewed code/tests/fixtures.

Current results, screenshots, initial failures and final hashes are in `scratch/checkpoint-13-qa/`. The immutable baseline contains **115 files** in `scratch/checkpoint-13-baseline/`. Original audit/source metadata and historical checkpoint hash dictionaries are preserved. Localhost remains on **8011**. No commit or deployment. Stop for user review before Checkpoint 14.
