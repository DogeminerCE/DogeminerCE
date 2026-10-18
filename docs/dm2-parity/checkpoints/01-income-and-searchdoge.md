# Checkpoint 1 — Offline income and Searchdoge

**Accepted, with tested follow-ups · October 14, 2026.** Four backlog entries implemented, each tested before the next. [Checkpoint 2](02-prestige-rewards.md) adds three prestige entries; [Checkpoint 3](03-bonus-coins-and-rick.md) adds Bonus Coins/Rick and [Checkpoint 4](04-timelines-and-fortunes.md) adds timeline history/protected Fortune stacks; [Checkpoint 5](05-stories-and-royalties.md) adds stories/DJ royalties; 87 implementation entries remain overall.

Open **http://localhost:8011/play/?parityTest=checkpoint-1**. The **Ctrl+\** menu opens automatically. In the normal game, Ctrl+\ → **Open checkpoint sandbox** now opens Checkpoint 5, with the same income/discovery controls in its collapsible Checkpoint 1 section. All five sandbox versions use separate session saves.

The sandbox uses a temporary save and preferences private to that tab. It stays muted, does not initialize a cloud account or analytics, and does not copy or write your normal save. Refresh retains its test progress; closing the tab ends that sandbox. The banner identifies test mode.

## Implemented and tested

| Entry | Behavior | Verification before continuing |
| --- | --- | --- |
| M01 | Offline income after **more than five minutes**, at **30% of permanent total DPS**, capped at **24 hours** and rounded once. Includes owned helpers across planets and permanent equipment bonuses. Credit, all-time mined total and receipt commit together before presentation. Replaying the same snapshot restores its one committed credit. | `offline-earnings.cjs`, balance/migration/helper-purchase regressions, live saved-credit and replay checks. |
| S25 | DM2-styled planet-themed welcome-back receipt, with credited amount and the efficiency/cap rule. Waits behind the Beta report, intro and active dialogs. Close acknowledges an already saved reward. Refresh, replacement and reset cannot award it again or leave a stale dialog. | `welcome-back.cjs`, Beta lifecycle/migration tests, desktop/mobile browser checks and production reset fixture. |
| M02 | Searches check every **3 seconds**. First timeline: eligibility after 160 complete seconds, interval over 17 seconds, chances **15/35/46/77/96/200%**. After prestige: eligibility after 8 complete seconds, interval over 5 seconds, guaranteed discovery. Found offers, failed attempts and active clocks persist per planet. | `searchdoge.cjs`, 432 helper-upgrade purchases, browser purchase/travel/prestige/reload checks. |
| M03 | Badge counts discovered offers in unlocked slots on the current planet, including unaffordable offers. Eligible but unfound helpers do not count. Corner placement/colors retained; show/pop/hide feedback added. | `upgrade-count.cjs`, mobile discovery renderer regression, desktop/mobile browser checks. |

Permanent offline DPS excludes temporary Bonus Coin and Rick boosts. Existing CE buff/Mystery timer persistence remains unchanged. Older Alpha saves retain their found offers; eligibility is inferred from recorded time before their last save, capped at the eligibility threshold. No offline time generates Searchdoge rolls.

## Your test pass

1. **Offline: 1 hour** — wait for welcome-back. Its amount is already in the saved wallet but withheld from the HUD. Close: `swipe_fast_low` plays and the normal coin flight reveals the amount on arrival. **Replay last snapshot** restores that exact snapshot plus the same credit, with no new claim or repeated acknowledged popup.
2. **Offline: 72h / cap** — the reward should be 24 times the one-hour reward for the same preset planet. **Offline: 4m / no credit** and **Offline: zero DPS** should produce no reward or popup.
3. **Offline + refresh** — reloads during the pending receipt. You should see the same receipt and amount. **Beta → welcome back** should show the compact Beta report first, then welcome-back after Continue.
4. Change **Offline report planet** and repeat an offline preset to check all five popup themes. Check the outlined title, astronaut-Doge emblem, gradient frame, and centered two-tone Close button overlapping the lower border. **Beta → welcome back** uses the same frame and text styling for the compact stat roundup; its action remains Continue Mining.
5. **Search: first timeline** skips the initial eligibility wait. Watch natural checks or use **Pause / resume**, **Step search 3s**, **Force next discovery**, and **Fill found slots**. There are four eligible helper types but only two found slots initially: the badge should show at most two.
6. Buy a found upgrade: its slot should return to **LOOKING FOR UPGRADES**, and the badge should decrease. Unlock the third slot with the normal 1-diamond button (presets include five diamonds); it starts searching rather than filling immediately.
7. **Search: timeline 2** starts from zero run time. The first guaranteed find occurs around 9 seconds; subsequent finds use the shorter interval. Pausing and stepping three times also reaches the first find.
8. **Search: two planets** gives Earth and Moon distinct saved offers/clocks. Switch planets and use **Reload test save** to check that neither replaces the other. **Fresh checkpoint scene** resets test progress whenever needed.

The menu displays simulation state, permanent DPS, search play time, misses and next success chance. Close it with Ctrl+\ to inspect the field unobstructed. Existing debug tools remain in **Current game tools**.

## Validation record

- All **17 CJS regression suites** pass, including five new suites for income, welcome-back, discovery, badge counts and sandbox storage.
- Muted isolated Chrome checks cover the actual Ctrl+\ menu, every offline preset, replay/refresh, Beta ordering, discovery/purchase/prestige/planet travel, and 375px mobile layout. No page errors; zero sandbox cloud requests. A separate normal tab’s save and preference sentinel remain unchanged.
- Both reports pass 40 layout checks: five planets, two report types and four viewports (1280×800, 375×812, 320×568 and 844×390). The full eleven-stat Beta roundup fits without scrolling, with its title larger than the subtitle. Source palette, gradient stops, solid text strokes, centering and two-tone actions are checked. Earth/Mars desktop and phone screenshots were inspected.
- The desktop close cross and lower action share durable acknowledgment. A rejected save keeps both actions available for retry, and closing Welcome Back never grants currency again. Styling QA is in `scratch/report-style-qa/reports.cjs`.
- Follow-up audio/coin checks verify `swipe_fast_low` at 0.3, no close sound on failed saves, saved offline credits hidden until the ordinary flight lands, and shared Dogebag-style rock-coin hover/lean/settle with controller support. The **Coin hover sample** control makes that effect easy to inspect. Script: `scratch/checkpoint-2-qa/followups.cjs`.
- Client and inline JavaScript syntax and CRLF-aware whitespace checks pass. Localhost serves the checkpoint and new modules.

This checkpoint does not reconcile older cloud progress with newer local progress; that remains M30. The general story queue and the other story/reward callbacks remain scheduled work. Existing earned items, protected/merged Alpha bonuses, CE inventory/controller features and the solid-stroke preference are retained.

Next checkpoint delivered: [prestige rewards](02-prestige-rewards.md). Progression content choices such as Johnny versus the Altar remain tracked in the [backlog](../remaining-parity-backlog.md).

## October 14 styling follow-up

Welcome Back now follows the shipped DM2 PopupBox frame, title, emblem, inline reward copy, pop-in and lower-border action. The same frame and outlined text apply to the first-Beta stat roundup, retaining only changed active stats and the compact layout. All five palettes are read from the pinned DM2 bundle: [PopupBox](/Users/yasin/Documents/Projects/DogeMinerCE/scratch/dm2-research/play-B7Micxas.pretty.js:24471), [Welcome Back registration](/Users/yasin/Documents/Projects/DogeMinerCE/scratch/dm2-research/play-B7Micxas.pretty.js:25108), [planet themes](/Users/yasin/Documents/Projects/DogeMinerCE/scratch/dm2-research/play-B7Micxas.pretty.js:6166), and [gradient renderer](/Users/yasin/Documents/Projects/DogeMinerCE/scratch/dm2-research/play-B7Micxas.pretty.js:15669). CE's web font lacks DM2's private close glyph, so an inline SVG supplies the red cross and white stroke. Desktop proportions adapt to CE's viewport; the Beta report remains smaller. Solid outlines follow the user's preference.
