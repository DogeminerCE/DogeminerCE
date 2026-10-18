# Checkpoint 14 — Critical records and the balance tab title

**October 16, 2026 · Review checkpoint.** Adds M19 and U20. **55 of the original 103 implementation findings delivered; 48 remain.** Checkpoint 13 was accepted. Stop for review before Checkpoint 15.

Open the [muted Checkpoint 14 sandbox](http://localhost:8011/play/?parityTest=checkpoint-14), press **Ctrl+\**, choose a feature, then **Show feature**. Four choices and two buttons. These scenes use private per-tab session storage; normal saves/preferences stay untouched and cloud/account/analytics remain disabled.

| Preview | What to review |
| --- | --- |
| Record critical hit | Click the rock. The guaranteed 250 crit sets a record, with a 30% larger pop, dark finish and brief recoil. The next equal hit uses the ordinary pop. |
| Ordinary critical hit | Click the rock. A saved 2.50K record makes the 250 crit an ordinary critical hit, so you can compare its motion and size. |
| Saved critical record | Opens Statistics at Highest Critical Hit: 2.50K. Refresh and reopen Statistics to see the saved value. |
| Balance on coin arrival | Click the rock. Both the HUD and browser tab wait for the mined coin to land, then show 1,250. |

The first, second and fourth scenes run with no passive income. The saved-record scene is paused. Preview item stats are synthetic fixtures; they never rebalance an earned player item.

## Record behavior

Only a critical hit with finite damage strictly above the prior record sets a new record. The comparison uses actual damage after the rock's remaining-health cap, matching the source. A tie, normal hit, zero hit or rejected/paused mining input cannot set a record. Tracking does not depend on whether the visual effects budget allows another pop.

`records.highestcrit` participates in ordinary saves, exports/imports and refresh restoration. Missing records in Alpha/older Beta saves start at zero; history is not invented from item stats. Invalid, negative and non-finite values normalize to zero. The lifetime record survives planet travel and prestige; a full reset clears it. Existing earned/fixed/Patron/Super Fortune values are untouched. Persistence follows the existing normal save/autosave policy, rather than writing the entire save on every hit.

The pop uses the source 1.3 scale multiplier and exact 210ms pivot/rotation samples. Recoil runs on an inner wrapper, so it cannot replace the existing coin-flight transform or change when currency appears. Reduced motion omits recoil. The DOM rendering uses DM2's dark Canvas tint (`#c8c8c8`), rather than its WebGL striped-gradient filter. Existing CE coin-flight timing and the critical label remain. The old critical coin glow is removed. Highest Critical Hit is also exposed in CE's existing desktop and phone Statistics layouts.

## Tab title

DM2 updates its title every 200ms using the spendable balance minus currency still in flight. CE now uses that cadence and the same visible-balance getter as its HUD. Already-credited offline income stays hidden through the report and subsequent flight. Spending, passive income and saved loads update while the simulation is paused as well.

The title keeps **Dogeminer:CE** branding and CE's accepted HUD number formatting, including quadrillions and later suffixes. It is unchanged before mining progress exists. The timer is created once, avoids rewriting an unchanged title, and has a cleanup/restart path. It does not add work to the high-refresh cursor or render loop.

## Evidence and validation

Executed pinned-source evidence covers **81 critical/damage-cap/record cases**, four pop variants, thirteen recoil samples and six visible-balance cases. The main bundle remains 982083 bytes / SHA-256 `24948a089fc981326a2d6ad7a558cc766ca79c85ca11d3c18e976f8dc2a03764`. Raw source files and historical audit/hash dictionaries remain unchanged.

Native DM2 opened at `chrome-error://chromewebdata/`; two snapshots returned `Preview automation snapshot timed out after 15000ms.` The owned tab was closed. Fresh direct source requests this checkpoint failed TLS certificate verification (`self signed certificate in certificate chain`). No new live-source or pixel-perfect WebGL certification is claimed; source function comparisons use the pinned bundles already verified in Checkpoint 13, and UI checks use isolated muted Chrome CE sessions.

All **40 CJS suites**, **37 client scripts** and **three inline scripts** pass. Focused browser checks cover real desktop/phone rock clicks, record/ordinary feedback, exact wallet credit and flight withholding, saved refresh, old/invalid imports, suppressed effects, offline claim arrivals, paused spending, Q+ balances and fresh-state title restoration. Prestige unit checks require the record to survive and be serialized in all four source timeline cases.

The real compact menu passes **sixteen previews** at 1280/375/320/844. Checks require actual clicks, the correct record classification, decoded visible art, readable Statistics inside the viewport, equal-hit behavior, reduced motion, muted audio, no account requests and untouched normal storage. All **eight related browser regressions** pass: helper DPS hints, automatic loot, Buy Max/touch lifecycle, field travel/claims, shared popups, prestige (including the saved critical record), income/SearchDoges and bootstrap/version guards. Results are in `scratch/checkpoint-14-qa/regressions/suite-results.json`.

Initial failures are retained: the first localhost check found the server down; it was restarted on 8011. Two QA expectations were corrected to the existing UI: the compact menu's second button is its close control, and a five-digit HUD balance uses comma formatting. Neither correction changes production behavior.

Evidence and screenshots: `scratch/checkpoint-14-qa/`. Immutable baseline: **119 files** in `scratch/checkpoint-14-baseline/`. Final implementation manifest: **118 files**. No commit or deployment.
