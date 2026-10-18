# Checkpoint 10 — Field loot and large openings

**October 15, 2026 · Accepted with a diamond-layering follow-up delivered in Checkpoint 11.** Implements M26, M27, M33 and U06. **47 of the original 103 implementation findings delivered; 56 remain.**

Open the [muted Checkpoint 10 sandbox](http://localhost:8011/play/?parityTest=checkpoint-10). Press **Ctrl+\**, choose a feature and press **Show feature**. There are four choices and only two buttons: Show feature and Close. Each preview resets its private scene.

| Feature | What to review |
| --- | --- |
| Bag gathers loose coins | Click a coin to collect that pile individually, then open the Dogebag to gather the remaining coins. Their counter credit waits for the flights. These preview coins wait for review rather than expiring. |
| Persistent diamond stacks | Earth starts with four unclaimed diamonds, Moon with seven. Travel or refresh before collecting; each planet restores its stack. Click/tap, keyboard Enter/Space or controller X claims the current stack once. |
| Coin warning & expiry | Watch three ordinary coins start warning after about six seconds, then disappear roughly three seconds later. Show the feature again to replay. |
| Large Dogebag opening | Open the 27-bag pile: 24 items, two coin prizes and a diamond prize. Desktop shows ten item minis and phone four, then “+N.” Currency has consolidated receipts. Select +N to inspect its items, use Loot to continue, or close the review; awarded ownership is already saved. |

Normal saves/preferences are never copied or written. Each checkpoint/tab has its own session save; audio is muted and cloud/account/analytics initialization stays off. The ordinary game's sandbox button now opens 10, while prior checkpoint URLs remain available. The parser now supports two-digit checkpoint numbers without sharing namespaces.

## Source behavior and one audit correction

The original M26 audit overstated coin-click behavior. In the pinned source, `wC` binds a coin click to `kC` for that pile; it does **not** call `TC("coins")`. Both ordinary and stacked **bag opening** call `TC("coins")`. CE now follows those paths: individual coin clicks remain individual; opening a new bag view gathers loose coins from the current field. The original audit description is retained in JSON with an explicit correction.

M33 uses the source **6001 + floor(666 × random) ms** warning schedule and **3030ms** removal delay. Ordinary motion follows the eighteen source fade phases over three seconds; reduced motion uses a fade. Collection/reset/travel cancels expiry and hover animation. This does not change CE's wider timer policy or add helper/automatic pickup.

M27 uses an optional per-planet ledger with a **999** unclaimed-diamond cap. Further source drops at the cap go directly to the wallet. One pile shows the source two tinted backing copies and xN badge, with merge/arrival and shared hover motion. Source polar destinations are fitted to CE's visible field; the old glow filters are removed. Unclaimed stacks do not expire and survive travel/refresh. Old saves start with empty stacks.

Claiming commits the wallet increase and stack removal together through primary/backup rollback. A rejected claim leaves the pile available to retry; repeated or stale clicks cannot grant twice. Visual credit still waits for the diamond flight, and refresh restores the actual credited wallet. Newly dropped diamonds remain available in memory if storage is temporarily unavailable; successful saving is required for refresh persistence. Source prestige clears unclaimed field loot while retaining the established wallet/reward transaction; failed prestige restores the old ledger. Ordinary reset clears it too.

Paused travel now explicitly refreshes the HUD and field after switching planets, so the preview and real paused game restore the destination's stack without waiting for a mining tick. Controller X and its existing field prompts include diamond stacks.

## Large receipt strip

The tray builds at most ten item buttons on desktop or four on phone, plus one +N overflow button and up to two currency receipts. It retains a mapping for **every** prize: no item is discarded or left out of sequential review. Overflow selects the next unreviewed hidden item and only dims once all its items have been reviewed.

Flights land on the live receipt when the viewport changes. Rebuilding the strip preserves arrived amounts, review state and currency totals; all ownership was already committed by the existing bag/Mystery grant path. Early close exposes complete receipts before measuring claim origins, cancels unfinished effects, and preserves already-awarded loot. Bag stack capacity and Supporter/Mystery balancing remain separate existing policies.

The large-opening preview uses a fixed mixed-prize fixture through production opening/grant/review paths. Its coins are 5801 and diamonds two. Small/short preview coin placement is fitted away from mobile controls; production loose-coin dispersal remains the separate U22 follow-up.

## Verification and evidence

The pinned primary bundle remains **982083 bytes**, SHA-256 **24948a089fc981326a2d6ad7a558cc766ca79c85ca11d3c18e976f8dc2a03764**. The new fixture executes sixteen source cap cases and freezes warning timing, removal delay, 10/4 limits and diamond destinations. Source also explicitly clears field loot on prestige.

Targeted checks cover individual/gather behavior, one credit per pile, failed claim retries, stale epochs, source timing, five-planet ledger normalization, cap/excess behavior and primary/backup rollback. Live Chrome checks verify actual travel/refresh, wallet saving before HUD arrival, expiry, controller pickup, large-opening review of all 24 items, in-flight phone/desktop resizing, early close and stale reset. The real Ctrl+\ menu passes **sixteen previews across four viewport sizes**, with four choices/two buttons, bounded diamond/tray geometry, normal-save isolation, muted audio and no cloud requests or page errors. Settled, decoded-art captures verify visible assets on desktop, phone and landscape.

All **33 CJS suites**, **33 client-script syntax checks** and **three inline-script checks** pass. All **seven browser regression suites** pass: Checkpoint 9's 28 previews, eight restored-Mystery award/reload cases, 24 shared-popup layouts, six shaped loot scenes, prestige preservation, income/SearchDoges and bootstrap failure guards. Initial failures and retry notes are retained: one relocated fixture path, passive income during a replay assertion, and a preview that passed on an isolated diagnostic rerun. The replay keeps its original exact-wallet assertion with mining paused synchronously.

Full test/regression results and the **103-file implementation manifest** are in `scratch/checkpoint-10-qa/`; the immutable **102-file pre-change baseline** is `scratch/checkpoint-10-baseline/`. Original audit/source and all historical checkpoint hash dictionaries are unchanged. Native DM2 was opened and muted first. Two native snapshots returned `Preview automation snapshot timed out after 15000ms.`; source evaluation later timed out too. Visual QA used isolated muted Chrome, and only the task-owned native tab was closed. No new live bundle hash is claimed for this checkpoint; the source hash was verified live in accepted Checkpoint 9.

Localhost remains on **8011**. No commit or deployment is included. Stop for user review before Checkpoint 11. Auto-pickup, helper seeking, Johnny/Altar, first-diamond toast design and other unresolved choices remain separate.
