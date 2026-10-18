# Checkpoints 31–35 — Late Progression and Upgrades

The previous combined review is accepted. This batch implements **M04/M05/M06/M15/U08/S20/S21/S22**: **80 complete,22 pending,one intentionally omitted(U20), out of103.** Stop before36 for review.

Open [the combined review](http://localhost:8011/play/?parityTest=checkpoint-35), then **Ctrl+\**. Four choices, two buttons:

| Preview | What to do |
| --- | --- |
| Altar awakening & payments | Buy the15-diamond upgrade. Close the awakening story; the private preview prepares the next found offer. Buy the25-diamond upgrade. The diamond wallet reaches0; Reallyhardium still needs a blueprint. |
| Titan blueprints | A Robo Shibe triggers a blueprint after500ms. Collect it to see BLUEPRINTS? Refresh preserves the uncollected artifact; allow the normal Doge entrance to finish. |
| Reallyhardium unlocks | The second Altar upgrade plus a blueprint triggers the metal story and unlocks27 late tiers. Earth has a prepared late upgrade to inspect after closing the story. |
| Upgrade transformation | Buy the found upgrade. Watch APPLYING…, staggered texture/sway changes, DONE., then searching. Six named helpers include a retained group. Phones also animate the card's helper image. |

The first preview prepares the second offer to avoid waiting for normal Searchdoge discovery; that convenience exists only in the private test fixture. Ordinary discovery is still governed by its existing clock. URLs31–34 show the same review with independent session saves. Ordinary player saves/preferences/cloud accounts stay untouched. All browser testing is muted.

## Source and retained CE content

Fresh source fetches both match the pinned audit:

- [DM2 main](https://dogeminer2.com/assets/play-B7Micxas.js): HTTP200,982083bytes,SHA-256 `24948a089fc981326a2d6ad7a558cc766ca79c85ca11d3c18e976f8dc2a03764`.
- [DM2 tweens](https://dogeminer2.com/assets/tweens-CyR_UHKv.js): HTTP200,59743bytes,SHA-256 `9405f09a278fbfb5937d5bcca3875bde4e3adfc304d202e591cb3d9f65405f45`.

CE keeps its existing **Altar of the SunDoge artwork, tier names and descriptions**. Source Johnny/helper34 progression is mapped onto that helper. Story timing and unlocks follow source; the two milestone narratives and images are adapted to CE’s Altar. On review, the first story now describes the Altar enlightening Titan’s researchers; the second, titled **TITAN RESEARCH BREAKTHROUGH!**, connects their blueprint research to Reallyhardium. The Altar remains its existing two-frame sprite presentation. CE inventory, hats, grouping, helper names, controller behavior and earned/fixed/merged item values remain intact. No source Johnny art replaces CE content.

**31 / M15:** Altar tiers retain200B/600B coin prices and1900/4999 DPS, and gain the source15/25 diamond alternatives. Both payment buttons buy the same tier. Upgrade transactions now commit payment, tier, consumed offer and scouting pause together through `commitHelperUpgrade`; failed primary/backup writes restore them and show retry feedback. Presentation follows a successful commit. Diamond purchases use source `notification_soft3`, loaded under that exact sound name; coin purchases use `ching`.

A saved v1 `lateProgression` ledger tracks the current timeline's Yoga/Reallyhardium milestones. It validates version/timeline/booleans, resets with prestige/reset and preserves modern saved flags. Legacy saves infer completed milestones only from already purchased tiers. They retain all purchased levels/currency/item values, retire completed milestone stories and avoid an obsolete blueprint drop. A real uncollected field blueprint remains collectible after metal unlock. Existing saved data does not receive new item stat rolls.

**32 / M05+S20:** Source criterion is helper34 upgrade1-or-higher and strictly more than5500ms since arrival. One transaction records Yoga and queues `foundup1`; closing the popup is not required to unlock tiers. The exact eight pairs are Cloud Base2/3/4, Robo Shibe2/3/4, Time Travel D-Rex4 and Altar2. Locked tiers cannot enter new offers or either payment path before the milestone. A rejected milestone save retains the prior flags/queue for retry.

**33 / S21:** On Titan, owning Robo Shibe or Heavy Doge Walker starts the source500ms deferred blueprint drop. The found flag is represented by field-or-collected artifact state, so it is true **at spawn**. Collection queues `foundbp`, using the original BLUEPRINTS? text/art and existing grab sound. Travel is held during the500ms pending phase. Spawn/collection/story state saves atomically; uncollected artifacts restore after refresh/travel, and stale/double claims cannot replay. The source243×225 art uses0.6scale and a120px hit target; CE's existing bounded clue landing logic reserves room for hover/bob, including narrow screens. Crisp strokes replace source glow. Controller X and normal button/touch/keyboard handling use the existing clue path.

**34 / M04+M06+S22:** The second Altar upgrade, a field-or-collected blueprint and strictly more than1300ms since arrival unlock the source27 metal tiers and queue `figurebp` together. The old blanket Altar1 terminal gate is removed. Further repeating tiers retain their appropriate milestone gate. D-Rex is a Yoga unlock; Curiosi Rocket Mode remains independent of Reallyhardium. Old earned late tiers establish legacy access without forcing players through completed announcements.

**35 / U08:** Source WR/Ao supplies100ms stagger capped at1200ms across the field,100ms fade/texture swap, scale1→0.6 over300ms→1.2 at500ms, then a500ms hold/200ms settle; rotation follows the source−9°/±10° sequence. APPLYING dims the card and shrinks payment controls over500ms. The last helper's500ms callback changes the card to DONE.; it fades for1000ms before searching. A world-clock-compatible Web Animation samples the source easing profile every10ms. Empty fields still complete cleanly. Grouped CE helpers transform once per visible leader; names/group membership persist.

The phone helper-bar animation has the source500ms start delay. CE's open drawer covers that bar, so the same transform also appears on the card's helper image for visible feedback. Applying slots survive UI rerenders, block repeated purchases and pause discovery while applying. Save replacement/travel/field recreation cancels runtime jobs and restores sprites without touching earned purchases. OS reduced motion skips helper motion and presentation CSS animations, retaining state feedback. No new preference controls or glows.

## Verification

Sequential checks before advancing: **58 suites/53 parses after each of31–34**; final **59 CJS suites and54 parses (51client+3inline)** pass. Tests execute the actual source milestone actions/predicates and Ao tween program. They cover eight/27 exact waves, all source timing boundaries,40 blueprint predicate cases,432 existing catalog purchases, both currencies, stale/unowned/locked rejection, real primary/backup rollback/retry, consumed offers/scouting pause, fixed earned Fortune preservation, legacy flags, future-version rejection, prestige/reset, source scale/rotation/fades/stagger,100-helper jobs, mobile/card feedback, reduced motion and stale cleanup. Existing income, loot, inventory, Settings, controllers, reports and startup guards pass.

Native browser checks include real desktop and phone purchase buttons, source shape/artwork changes, saved tier/currency state, the complete15→Yoga→25 journey, exact late gate behavior, actual blueprint collection/story and refresh recovery, legacy tier/currency preservation and unsupported-version rejection. Desktop samples show staggered old/new art and changing scale/rotation; phone samples show the visible card image changing at600ms, swaying/scaling and reaching DONE. Sixteen feature/viewport cases cover1280×800,375×812,320×568 and844×390. Popups fit and center in the game area; the novice timeline stays blank and title stays static. Four-choice/two-button menu and muted isolation are verified.

QA corrections: the first catalog mapping read the wrong research key before any edit; a cross-VM assertion now compares serialized values; a test mobile stub was completed. A private fixture's synthetic seen-story IDs initially hid its blueprint and were corrected without altering production rules. A reload click timed out because the normal entrance had not finished; waiting for the live collectible and closing the debug overlay succeeds. Legacy rescue was extended to avoid obsolete blueprints when an old save contains an explicit empty artifact record. The phone drawer visibility issue is handled by card feedback. Native screenshots can contain host blur/duplicate margins; DOM bounds, timed samples and real interactions supplement inspection. No physical controller/touch/high-refresh device or audible playback certification is claimed.

Evidence: immutable `scratch/checkpoint-31-baseline/`(194files), phase31/32/33/34 QA and final `scratch/checkpoint-35-qa/`. Original audit fields, source metadata, all prior checkpoint/follow-up hash dictionaries and required CRLF remain intact. No commit, deployment or external-browser fallback; localhost8011 remains running.

### Story wording review follow-up

The Altar awakening story now describes enlightenment and Titan research instead of Robo-Yoga. **TITAN RESEARCH BREAKTHROUGH!** connects the researchers’ blueprint work to Reallyhardium and further upgrades. Both revised stories were triggered through their normal milestone queues in the muted private preview at1280×800 and320×568; phone scrolling reaches the end and CLOSE stays accessible. Existing late-progression/story-queue suites and both edited script parses pass. Original audit/source/checkpoint hashes remain historical; current199-file follow-up hashes and immutable204-file baseline live in the separate follow-up QA directories. Saved IDs and mechanics are unchanged.
