# Checkpoints 22–24 — Bonus HUD, Passive Income and Audio

Checkpoint 21 is accepted. The next three checkpoints are implemented and tested together, as requested: **U23, U25, Q03 and Q04**. The audit now has **66 implemented, 36 pending and one intentionally omitted (U20), out of 103**. Stop for this combined review before Checkpoint 25.

Open [the combined checkpoint](http://localhost:8011/play/?parityTest=checkpoint-24), then **Ctrl+\**. There are four choices and two buttons:

| Preview | What to check |
| --- | --- |
| Bonus HUD & expiry | The hourglass counts in tenths beneath DPS, with the Bonus icon, percentage and gentle pulses. After eight seconds, BONUS FADED appears and normal DPS returns. Only this private fixture shortens the Golden Bonus; normal duration remains 60 seconds. |
| Smooth passive income | The balance rises smoothly. Rock-click coins still appear in the amount only when their flight lands. |
| Mining sound setting | Settings opens with Mute Rock Sounds checked. The setting saves and stays synchronized between desktop and phone. Production suppresses mining hits, crits, weapon hits and rock-stage effects while keeping loot, UI and music independent. |
| Background audio setting | Settings opens with Sound in Background unchecked. Blur/focus or hide/show the tab exercises the policy. Production silences background audio and restores playing tracks in place when focused. |

The sandbox always stays globally muted. It uses its own tab-session save/preferences and disables account/cloud/analytics initialization. Checkpoint 22 and 23 URLs also expose this combined menu in separate private namespaces. Ordinary saved update-rate choices are retained; the preview chooses Smooth only inside its sandbox.

## Source and implementation

The fresh native-browser fetch of [DM2's shipped bundle](https://dogeminer2.com/assets/play-B7Micxas.js) returns HTTP 200, 982,083 bytes, SHA-256 `24948a089fc981326a2d6ad7a558cc766ca79c85ca11d3c18e976f8dc2a03764`, matching the pinned audit source.

**22 / U23:** Source `V$`, `aZ`, `cZ`, `FQ` and the shipped tweens define the compact 28px Bonus icon, 16px percentage, 13px tenth-second timer, vector hourglass, active DPS icon/tint, 700ms icon pulse, 1400ms wallet pulse, 500ms replacement gap and 1110ms activated/faded feedback. The original audit's “progress” wording describes a countdown; the actual row has no progress bar. The new `bonus-hud.js` renders those elements without changing saved multipliers, tier balance or claim persistence. Expired loads resume silently. Feedback uses a solid stroke with no glow, and reduced motion suppresses pulses. Existing legacy multipliers display their earned value.

**23 / U25:** Source `sQ` credits `DPS × elapsed milliseconds / 1000` on its ordinary 20ms loop. Source `P$` throttles counter painting at 50ms. CE now defaults to that behavior. Existing Instant, 100ms, one-second and five-second choices remain selected when saved. Instant retains per-frame counter painting. Shop/stat scans run at most once a second on the smooth clock; credits still use real elapsed time when a browser delays a timer. Pause ticks and save replacement reset the clock. Existing pending-flight and offline-receipt deductions remain the visible-wallet authority. Source's optional 72ms FPS-limited mode belongs to pending Q05 and is not silently enabled here.

**24 / Q03–Q04:** DM2 settings `rocksounds` and `inactivesnds`, both true by default, map to new saved `rockSoundsEnabled` and `backgroundAudioEnabled` fields. Older saves therefore retain their current audio behavior. Compact desktop/phone controls share one preference setter, synchronize immediately and roll back if saving fails. Mining families are gated independently of other effects/music. Blur, focus and visibility changes update individual Howl mutes and mission/video media without changing an external Howler master mute. Music keeps playing silently in place, so focus does not restart its intro or loop. Lazy-loaded tracks inherit the policy; cutscene suspension and explicit effect/music mutes remain authoritative.

Responsive verification exposed the existing center-origin desktop scaling clipping the panels on a short landscape viewport. Anchoring the container's scale at the top keeps both panels and Supporter inside the viewport, while dialogs continue following their panel bounds. New audio checkboxes use the existing planet accent colors.

## Verification and evidence

Each feature was tested before starting the next: **50 CJS suites after 22, 51 after 23 and 52 after 24**. All **45 client scripts plus three inline scripts parse**. The source remaining-time formatter and passive-income loop execute as independent test oracles. Tests cover replacement/expiry, legacy buffs, elapsed-time stalls, saved rates, bounded UI work, coin-arrival/offline ledgers, one timer, audio families, background/hidden/focus state, lazy music, cutscene suspension, external mute preservation, setting synchronization and failed-save rollback.

Native browser verification covers 16 final feature/viewport combinations at 1280×800, 375×812, 320×568 and 844×390. The HUD stays inside its panel; Settings scrolls on short phones and Supporter remains visible on desktop/landscape. Real phone checkbox clicks save and synchronize with desktop; reload retains the saved choice. Live instrumented effect calls verify mining suppression with loot effects retained. Blur/focus mutes and restores a playing track without clearing the sandbox's global mute. The eight-second preview naturally expires, restoring DPS from 99 to 66 and removing the pulse/row; all six tier images decode. The ordinary title remains `Dogeminer:CE`, and the first-timeline label remains blank and hidden. The actual Show feature button triggers the selected preview and closes the two-button menu.

Evidence is in `scratch/checkpoint-22-qa/`, `scratch/checkpoint-23-qa/` and `scratch/checkpoint-24-qa/`. Phase 22/23 manifests were captured before beginning the next implementation. The immutable pre-change baseline contains 167 files; all historical source/audit/checkpoint/follow-up hashes and CRLF scripts remain intact. The final manifest includes the reused Bonus/DPS icons. No commit, deployment, live player-save access or external-browser fallback was needed. Localhost remains on port 8011.

QA notes: an initial phone click ran before the native resize had settled and timed out; waiting for the requested viewport, rebuilding the preview and repeating the real click passed. The initial landscape matrix exposed the scale-origin issue; the final matrix passes after its correction. Native snapshots still contain the pre-existing `/sw.js` registration 404 messages. These checks do not claim a fresh full DM2 gameplay/pixel certification or audible playback verification.


## Review follow-up — Match the existing Settings rows

The new audio controls now use the same `setting-item` markup as neighboring controls on desktop and phone, including the phone `setting-label` span. Remove the separate audio-only layout and typography rules so text color, font, checkbox size, gap, margins, padding and planet colors inherit from the existing settings. IDs, listeners, saved preferences and four-preview menu remain unchanged. Cache versions: styles115/ui22.

Verified20 computed-style comparisons across five planet themes and four viewports (1280×800,375×812,320×568,844×390): both new rows exactly match Background Music. Desktop/landscape Supporter stays visible; short-phone settings scroll normally. Visual screenshots and results are in `scratch/checkpoint-24-followup-qa/`. The audio preference suite and UI script parse pass. All review audio remains muted. Counts66/36/1 are unchanged; remain at the combined22–24 review.

The179-file immutable follow-up baseline and174-file current implementation manifest preserve the initial22–24 snapshots and every earlier source/audit/checkpoint/follow-up hash. No commit or deployment.
