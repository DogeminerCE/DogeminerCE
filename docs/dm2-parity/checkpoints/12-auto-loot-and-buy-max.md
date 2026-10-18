# Checkpoint 12 — Prestige auto-pickup and Buy Max

**October 15, 2026 · Review checkpoint.** Implements M23 and M32. Q09 is partial: the saved auto-pickup control is available; its holiday control waits for E04. **52 of the original 103 implementation findings delivered; 51 remain.** Checkpoint 11 is accepted.

Open the [muted Checkpoint 12 sandbox](http://localhost:8011/play/?parityTest=checkpoint-12). Press **Ctrl+\**, choose a feature and press **Show feature**. Four choices, two buttons; replay resets only the private scene.

| Preview | What to review |
| --- | --- |
| Prestige auto-pickup unlock | Timeline 2 waits seven active seconds, then enables auto-pickup and shows the unlock notification. |
| Automatic loot & equip | New bags reveal pickaxe/fortune/currency rewards without the manual claim screen. The golden pickaxe equips and items fly to inventory; currencies fly to their counters. One older bag remains manual. Replay to watch again. |
| Auto-pickup setting | Change the real Settings checkbox and refresh to verify the saved choice. Desktop and phone share the preference. |
| Hold for Buy Max | Hold a helper buy button for half a second, slide upward into Buy Max and release. Releasing on the original button buys one and briefly leaves the Max option available to click. |

The sandbox uses its own per-tab session save, with audio muted and cloud/account/analytics disabled. Ordinary saves and preferences are untouched. Earlier checkpoint links keep separate namespaces.

## Auto-pickup

The first prestige unlocks the feature after the source seven-second delay. Older prestige saves receive the same unlock. The preference saves atomically, remains off after a later prestige if the player switched it off, and appears only after prestige. This preserves the player's explicit choice instead of reproducing the source notification callback that can turn it back on.

Only new coins, diamonds and bags dropped while enabled enter the source 200+628ms schedule. Turning it on does not consume an old manual stash. Turning it off cancels pending collection and leaves unclaimed bags/diamonds on the field. Existing per-planet stack ledgers remain authoritative; automatic claims remove just the newly queued amount. Manual collection first cannot pay twice. Maps remain manual.

Automatic bags use the existing reward generator and save inventory, unread count, equipped pickaxe ID, roll history, wallet and bag removal together before visual effects. Rejected writes restore the prior state and retry the same frozen reward. The item fades in for 600ms, flashes, then flies to inventory after a 750ms hold over 1000ms. Rarity is a solid sprite outline. Currency uses the established counter flights, so its visible balance waits for arrival while the award is already durable. Refresh after a claim retains exactly that award; refresh before collection restores unclaimed saved bag/diamond stashes for manual pickup. No earned or fixed item stats are rerolled.

The automatic claim path works on phones independently of CE's grouped helper bar. CE retains its DOM field stack presentation and panel fitting rather than replacing it with the source canvas renderer. Simultaneous new claims use that existing field origin; the private preview spaces bag drops so each reveal can be seen.

## Buy Max

The gesture uses source 500ms hold, 160ms charge delay, 14px slop, 8/12px mouse/touch rise, 1600ms lingering option and 100-helper cap. Upward drag can reveal it early; an immediate forced-open release is guarded for 120ms. The preview updates count and total price. Escape, canceled movement, scrolling elsewhere, blur, resizing and field replacement dismiss it. Shift+Enter on a focused buy button opens a keyboard-accessible option. Ordinary tap/click/controller activation still buys one.

The 600ms burst uses the executed source wave plan, with at most fourteen waves. Every purchase rechecks price, funds and eligibility; planet/epoch changes cancel remaining work. Quotes sum CE's existing per-helper rounded prices, avoiding a separate balance change. Each wave atomically saves ownership, cost and desktop positions; rejected writes roll back that wave while earlier saved purchases remain. Bulk purchases auto-place even if manual placement is preferred, without changing the saved preference. Desktop helpers fly from the shop; phones update their grouped bar. The first rocket launch is scheduled once after a successful burst. Buy Max copies the current planet's two-tone button colors and uses source sound names/pitch progression.

A targeted browser check exposed pending field restoration canceling the first purchase wave; restoration now completes before the burst is registered. Actual touch testing also required reserving the buy button's drag gesture so Chrome does not turn its upward slide into page scrolling. Cards outside the buttons still scroll.

## Verification

All **36 CJS suites**, **36 client-script checks** and **three inline-script checks** pass. Actual Chrome testing covers desktop/phone automatic claims, durable equip/unread and refresh, old manual stashes, bag currency saved before counter flights, and an older reveal retaining the current equipped pickaxe. Real CDP touch hold/slide, lingering buy-one then Max, pan cancellation, saved off/reload, rejected-setting rollback, manual-before-auto and stale resets pass.

The compact menu passes **sixteen previews** across 1280/375/320/844 widths, with real unlock/collection/settings/purchase triggers, bounded Buy Max, reachable desktop Supporter and normal-save isolation. **Nine decoded visible-art scenes** pass on desktop/phone/landscape. All **nine earlier browser regression suites** pass: CP11 previews and helper lifecycle, CP10 field/previews/24-item opening, shared dialogs, prestige, income/SearchDoges and twelve bootstrap/version guard cases.

Initial evidence is retained. Production corrections cover pending field restoration canceling a burst, Chrome touch scrolling canceling selection, and an older reveal re-equipping its earlier item. QA corrections await the tab slide, use a real click to test a rejected checkbox toggle, reset the fixture's pre-existing diamond ledger before an exact claim assertion, and wait for the game global after reload. The income regression's default-link expectation now points to Checkpoint 12. The final artwork check waits for a positive-opacity item and scrolls the real setting into view. The missing-sandbox fallback now also covers checkpoints 8–12 before ordinary player-save access.

Verification results, initial failures and final implementation hashes are recorded in `scratch/checkpoint-12-qa/`. The implementation manifest covers **111 files**. The immutable pre-change baseline contains 110 files in `scratch/checkpoint-12-baseline/`. The pinned primary source remains 982083 bytes / SHA-256 **24948a089fc981326a2d6ad7a558cc766ca79c85ca11d3c18e976f8dc2a03764**. Source fixtures execute 24 purchase-burst cases and eight collection cases, and preserve gesture configuration, labels and reveal timing. Original audit/source and historical checkpoint hash dictionaries remain unchanged.

Native source review was attempted first and muted. Two snapshots returned `Preview automation snapshot timed out after 15000ms.`; the raw error was reported and visual testing continued in isolated muted Chrome. The owned native tab was closed. No new live bundle hash is claimed beyond accepted Checkpoint 9's same-day verification.

Localhost remains on **8011**. No commit or deployment. Stop for user review before Checkpoint 13. Johnny/Altar, holiday behavior, animation-profile work and D08's broader timer policy remain separate.
