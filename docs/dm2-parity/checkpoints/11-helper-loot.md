# Checkpoint 11 — Helper coin pickup and field motion

**October 15, 2026 · Review checkpoint.** Implements M24, M25 and U22, plus the Checkpoint 10 diamond-layering correction. **50 of the original 103 implementation findings delivered; 53 remain.** Checkpoint 10's other features are accepted.

Open the [muted Checkpoint 11 sandbox](http://localhost:8011/play/?parityTest=checkpoint-11). Press **Ctrl+\**, select a feature and press **Show feature**. Four choices, two buttons; replaying resets only the private preview scene.

| Preview | What to review |
| --- | --- |
| Diamond stack layering | Both tinted copies sit behind the main diamond. Their offsets scale with the original 38px texture, and the count uses the source position. Earth has four unclaimed diamonds and Moon seven; travel/refresh/claim still work. |
| Coin motion & hover | Three pile sizes ease out from the rock, then bob gently. Desktop hover has the shared bag lift, wobble, lean and return. These coins use ordinary expiry. |
| Nearby helper pickup | After the landing delay, Pixel dips to collect three nearby piles, one per polling cycle. Reopen the preview to replay. |
| Helpers seek coins | A group of three Shibes hops toward a distant coin and collects it. Pixel, Orbit and Waffles keep their identities and move together; ungroup to inspect them. This preview's coin waits for review. |

CE retains its grouped mobile helper bar. Normal mobile field sprites stay hidden and do not collect coins invisibly. The two helper previews temporarily expose the field on phones so their animation can be reviewed; this does not change the ordinary mobile layout.

The sandbox uses an independent per-tab session save. Normal saves/preferences are untouched. Audio is muted and cloud/account/analytics initialization is disabled. Earlier checkpoint URLs retain their separate namespaces.

## Diamond correction and field motion

The source's KT/JT order is two tinted backing copies followed by the main sprite; the ghosts appear at counts three and two respectively. CE's absolutely positioned copies could paint above its unpositioned main image. The main image now has an explicit higher drawing order, and all three images use the same block baseline. Offsets use 23/38, matching the displayed width to the original texture, rather than the former unrelated 0.4 factor. The count is centered at the source-relative anchor with its original brown stroke. Persistence and the accepted diamond arrival/merge animation remain intact.

Coin destinations use the source desktop/phone random polar ranges, converted through CE's existing 0.42 field fitting and visible-panel bounds. Expulsion uses the source 800ms exponential curve and 200ms fade, followed by a 2.2-second each-way sine bob. The image's independent hover remains available without fighting that movement. Resizing retains the chosen polar position. Collection cancels flight/bob/expiry work, and a mid-flight click starts the counter flight from the coin's visible position. Reduced motion shortens entry and omits idle bobbing.

## Nearby pickup and seeking

Only Mining, Moon, Party, Super and Robo Shibes and Coin Seeker 5000 qualify. Source gC/Ub checks newest piles first, selects the closest eligible helper within 100 source pixels, waits 1800ms after landing, and lets each helper collect once per 500ms poll. Held helpers, drop motions and active movement are excluded. A successful pickup uses the existing durable coin transaction and the source collection dip; a rejected write leaves the pile for retry.

The pure Kb planner and Qb cadence match the pinned source. Coins already within a helper's pickup range do not recruit seekers. Targets are separated by the source pile radius, existing seekers can retain or retarget within their forward cone, and the cap is one seeker plus another for each five helpers beyond the first five. Hops use the source 14px step, 240ms sine movement, 9px lift and 12% squash; loop-aligned waits use CE's existing two-frame helper animation. Source rest-animation profile differences remain U14.

Detours sample angles through ±150 degrees in 15-degree steps, with the source skirt limit and blocked-target release. Bounds and collision geometry fit CE's panels and visible Doge rather than treating the entire rock area as an obstacle. Landing can gently bump stationary helper peers. Coordinates and distances share the existing 0.42 field conversion. These are geometry adaptations to CE's DOM layout, not a replacement with DM2's canvas renderer.

A CE group is one visible actor and moves every member together. Seeking never replaces IDs, names, ownership or DPS records. Completed positions use normal save paths. Grabbing cancels movement at its visible location; pause/hidden state pauses active movement. Travel, import/reset, group rebuild and field replacement invalidate old motion callbacks. No helper can award a stale or already-collected coin.

M23's prestige auto-pickup, Q09's related setting, M32 Buy Max, U14 rest animation profiles and D08's broader timer policy remain separate. This checkpoint adds no inactive controls and performs no item-stat migration.

## Verification

The pinned primary bundle remains 982083 bytes / SHA-256 **24948a089fc981326a2d6ad7a558cc766ca79c85ca11d3c18e976f8dc2a03764**. New frozen evidence includes 84 executed target plans, 28 hop waits, six rotations, original ghost geometry, six eligible helper types and source tuning.

All **34 CJS suites**, **34 client-script checks** and **three inline-script checks** pass. Targeted tests cover selection/range/delay, source planning and detours, group identity retention, collection in desktop and private phone/landscape field previews, pause/resume and mid-hop grabbing, rejected claim retry, refresh, reset and reduced motion. The real menu passes **sixteen previews**, requiring actually drawn helpers, and **nine final decoded-art scenes** pass. All **seven browser regressions** pass, including Checkpoint 10 field/large-opening behavior, shared popups, prestige, income/SearchDoges and bootstrap guards.

Initial failures and retries are retained: private coin placement needed separation from the bag, the exact-wallet reload check needed an immediate pause before passive income, and WAAPI pause sampling needed to await Animation.ready. An overlapping-run artwork check reported unloaded images; direct requests returned 200 and the final isolated decoded-art run passed. No root cause beyond those observations is claimed. Results and the **106-file implementation manifest** are in `scratch/checkpoint-11-qa/`. The immutable pre-change baseline contains **107 files** in `scratch/checkpoint-11-baseline/`.

Native DM2 was opened and muted first, but two snapshots returned `Preview automation snapshot timed out after 15000ms.` and evaluation then timed out. Visual QA used isolated muted Chrome; the owned native tab was closed. No new live bundle hash is claimed beyond Checkpoint 9's same-day verification. Original audit/source and historical checkpoint hash dictionaries are preserved.

Localhost remains on **8011**. No commit or deployment. Stop for user review before Checkpoint 12.
