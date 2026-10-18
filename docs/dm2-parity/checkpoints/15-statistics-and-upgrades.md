# Checkpoint 15 — Statistics and upgrade-card hover

**October 16, 2026 · Review checkpoint.** Includes the Statistics correction, the requested first-travel spoiler gate and removal of the balance from the browser tab. Adds U07 upgrade-card hover. **55 findings implemented, 47 pending, one intentionally omitted (U20), out of the original 103.** Stop for review before Checkpoint 16.

Open the [muted Checkpoint 15 sandbox](http://localhost:8011/play/?parityTest=checkpoint-15), press **Ctrl+\**, choose a feature and press **Show feature**. Four choices, two buttons; private per-tab session storage, normal saves/preferences untouched, cloud/account/analytics disabled.

| Preview | What to review |
| --- | --- |
| First-game Statistics | Compact stats with no timeline summary, history, placeholder or HUD label. The tab title stays Dogeminer:CE. |
| Statistics after travel | The current timeline's earnings and mining time come first. Compact lifetime stats follow, including Highest Critical Hit. Completed runs stay below. |
| Timeline history | Thirty completed runs: open their details and use Show 20 earlier timelines. The current summary stays above lifetime totals. |
| Upgrade card hover | Hover a found upgrade: subtle 2px lift, 11% background highlight and a soft shadow. Move away to settle. Empty/locked slots stay still; phone cards stay static. |

## Statistics correction and spoilers

The new critical-hit row exposed an existing layout problem: lifetime stats were separate tall cards ahead of the current-run summary. The current summary now has its own section before compact two-column lifetime rows. Completed-run details remain below the lifetime rows, with the existing expansion and pagination behavior. All information remains available; the layout uses the existing planet palettes and internal panel scrolling.

Before the first successful time travel (`timelineNumber` remains 1), both current/history sections are hidden and emptied. The HUD timeline label is also hidden and blank, including when the first mission has unlocked. No empty timeline placeholder or lifetime heading appears. A completed first travel reveals the sections; importing a first-game save hides them again. Hidden sections start hidden in HTML/mobile markup, avoiding a startup flash or an accessible spoiler. Tracking still records the first run privately so its completed record is available later.

## Static browser title

The user explicitly declined U20. The balance title timer and title-writing methods are removed; the browser tab keeps **Dogeminer:CE** through mining, claimed-coin flights, refresh and veteran saves. Coin amounts continue using the existing HUD flight ledger. This is an intentional CE preference, not pending parity work.

## Upgrade hover

The executed DM2 config enables 2px lift, 100ms entry/settling, 120ms additive background brightening at 11%, and a 22% black shadow with 2px drop, 6px spread and 14px radius. Tilt is disabled in the shared source base config, despite the preset carrying tilt parameters; CE correctly keeps cards flat.

CSS applies the effect to found desktop offers, preserving the current two-tone purchase buttons and planet surfaces. Keyboard focus gets the same cue as a CE accessibility extension. Empty/locked offers and phone cards stay static. Reduced motion keeps the soft highlight/shadow without lift. Purchase/removal fades retain control of their transforms. The effect adds no frame loop, economy changes, persistent controls or glows.

## Verification

**40 CJS suites, 37 client-script checks and three inline-script checks pass.** Source config is executed from the pinned bundle into `tests/fixtures/dm2-upgrade-hover.json`; original source/audit metadata is preserved.

Focused Chrome checks cover current-summary visibility at seven viewport sizes, large values without horizontal overflow, all thirty reachable records, pagination and retained expanded details. Upgrade checks compare computed lift/highlight/shadow/timings with the executed source, including two themes, pointer leave, empty slots, unchanged wallet on hover, real keyboard purchase/save, reduced motion and static phone tap purchasing.

First-game/veteran tests cover desktop and phone: no visible timeline strings before travel, even with the mission unlocked; visibility after travel; hiding after importing a novice save; static tab name through coin flights and refresh. The real compact menu passes sixteen previews at 1280/375/320/844 with decoded visible art, isolated normal storage, muted audio and no account requests. All four related browser regressions pass: critical-hit/Statistics previews, prestige and saved critical records, income/SearchDoges, and thirteen bootstrap/version guards. Results are in `scratch/checkpoint-15-qa/regressions/suite-results.json`.

Native preview snapshots failed twice with `Preview automation snapshot timed out after 15000ms.` The owned tab was closed; UI checks use isolated muted Chrome. No fresh live-source verification is claimed; this uses the pinned source verified in accepted Checkpoint 13. Initial QA failures remain recorded: a manually changed test timeline needed matching story/discovery state, and repeat pagination cases needed their private view limit reset. Repeated image checks recorded local `net::ERR_CONNECTION_RESET`; direct image GETs returned 200. The owned Python dev server had a five-request connection queue. It now uses a 128-request queue on the same port; the subsequent Earth/Mars decoded-art and five-theme checks pass without local resets. Production asset files were unchanged. External CDN certificate failures use the existing local fallbacks. The silent HowlerLite fallback now exposes its mute state consistently; this resolves the initial regression checks that could not observe that state.

Evidence: `scratch/checkpoint-15-qa/`. Immutable baseline: **122 files**. Final implementation manifest: **119 files**. Original audit/source fields, historical checkpoint hash dictionaries and six CRLF scripts remain preserved. Localhost stays on **8011**. No commit or deployment.
