# Checkpoint 8 — Rig invention, D.I.A. contact and Titan

> **Review update:** Other work accepted. NewsDoge display scaling/entry/exit and popup visibility feedback is addressed and re-verified in [Checkpoint 9](09-inventory-and-motion.md). The implementation and test record below describes Checkpoint 8.

**October 15, 2026 · Ready for user review.** Includes the requested Checkpoint 6 corrections and M07, S14, S15, S18, S19, U17 and U01. **38 of the original 103 implementation findings are delivered; 65 remain.** This is not a claim of complete DM2 parity.

Open the [muted Checkpoint 8 sandbox](http://localhost:8011/play/?parityTest=checkpoint-8). Press **Ctrl+\**, choose a feature and press **Show feature**. The menu closes automatically; its only other button is Close. Showing a feature again resets its private scene.

| Feature | What to review |
| --- | --- |
| Settings & Supporter | Compact Settings keeps Become a Supporter visible on desktop. Short panels scroll; phone Settings remains usable. Timeline 3 includes the story/news preferences. |
| NewsDoge report | A compact, single-line report scrolls across the field. Click/tap NewsDoge twice to see the two original annoyed faces. Audio remains muted in the sandbox. |
| Popup position & zoom | Review the dense Mars-themed Beta roundup, then Welcome Back. Both center on the game panels and ease in/out. Resize to check placement. |
| Time Machine Rig invention | 25 Party Shibes trigger TIME MINER. Close it and return to Earth: the rig is available before Jupiter. |
| First D.I.A. contact | The preview's arrival clock has passed eleven seconds. Close the introduction, then click/tap the Dogetalkie to open the existing mission brief. Jupiter is not required. |
| Discover Titan | Sensor Package triggers Sensing Something. Close it and select the known-but-locked Titan tab to see LOCKED feedback. |
| DogeStar route to Titan | DogeStar triggers IT'S BEAUTIFUL. Close it and select Titan to travel. Sensor Package is absent from this scene. |

The [Checkpoint 6 sandbox](http://localhost:8011/play/?parityTest=checkpoint-6) and [Checkpoint 7 sandbox](http://localhost:8011/play/?parityTest=checkpoint-7) remain separate. Normal saves/preferences are never copied or written; each test tab/checkpoint uses its own session namespace. Cloud/account/analytics initialization is disabled, and all QA audio is muted. The ordinary game's Open checkpoint sandbox button now opens 8.

## Corrections from the joint review

Settings uses denser desktop spacing and bounded internal scrolling. The Supporter button fits without scrolling in all five planet themes at the standard desktop size, and remains reachable in short panels.

Live [DM2](https://dogeminer2.com/play/) verified the unchanged shipped source bundle and NewsDoge runtime geometry, original atlas art and `news1` invocation. CE now keeps the **36px** ticker scrolling under both ordinary and reduced-motion preferences; the former reduced-motion fallback wrapped it into a taller static block. Text uses the source linear travel/delay, label widths are **165/77px** desktop/phone, top is **240 logical px**, and the reporter uses the original **85×95** art. The exact normal/annoyed-1/annoyed-2 atlas frames are losslessly extracted and mirrored locally. Reactions revert after **700ms**; actual text-animation completion schedules the source exit. `news1` retains its existing **0.25** gain. All 22 source report texts/criteria, startup discard, bounded queue and saved sightings remain intact. U01's earlier artwork gap is resolved.

`popup-presentation.js` positions game dialog content at the center of the visible left/right panel bounds, accounting for CSS scaling, mobile's single field, short windows and visual viewport changes. Cards use **220ms** eased zoom-in and **160ms** zoom-out, shortened for reduced motion. Existing reports, stories, inventories, Supporter, diamond introduction, controller dialogs, mission brief/warning/rewards and loot scenes share this placement. Dogebag/Mystery Box retain their individually rounded panel backdrops and distinct content.

Acknowledgments still commit before dismissal. Failed writes leave dialogs usable. Programmatic save replacement/reset removes obsolete views immediately; reopening cancels an old exit. Input/focus cleanup is synchronous, while only the visuals persist during a successful close. Temporary static-dialog exit guards live on the card so a new story cannot capture a stale inert root.

## Source progression and saved access

- **Rig:** 25 Party Shibes **or** two Space Basses **or** a visit beyond Mars starts the **1250ms** invention callback, queues the original TIME MINER story and enables the rig. Both shop layouts and direct purchases enforce the saved gate.
- **Contact:** an owned rig and **strictly more than 11000ms** since location entry set the saved contact flag and queue the original D.I.A. introduction together. The talkie works before Jupiter. The preview advances only its fixture clock; separate browser QA waited the real eleven seconds.
- **Sensors:** Cloud Base upgrade level ≥1 starts the **500ms** reveal. Titan becomes known while travel remains locked. `titan1` keeps its source prestige-survivor behavior.
- **DogeStar:** ownership queues `titan2` immediately and completes the route after **500ms**, including while that introduction is open. Sensor Package does not gate travel. The repeated source callback cannot duplicate the story.

Optional progression fields extend the existing v1 discovery ledger without replacing its clues, routes or planet history. State/story writes use primary/backup rollback and retry. Existing CE rig/mission/Titan access is preserved from established progress; earned items, fixed stats, wallets and Alpha merged bonuses are not rebalanced here. New timelines receive fresh invention/contact/routes with their existing atomic mission reset. Save replacement cannot run an old delayed unlock.

## Verification and evidence

The pinned primary-source bundle is still **982,083 bytes**, SHA-256 **24948a089fc981326a2d6ad7a558cc766ca79c85ca11d3c18e976f8dc2a03764**. New fixtures execute **118 source eligibility cases** across the four progression criteria and freeze all four narratives/art references. Targeted production tests cover timer boundaries, failed primary/backup writes, retry, suppression, refresh, prestige survivors/reset and stale save replacement.

- **29 CJS suites**, **32 client scripts** and **three inline scripts** pass. The implementation/test/fixture/asset hash manifest covers **80 files**; original audit and historical checkpoint hashes remain unchanged.
- Real browser purchases verify the Rig before Jupiter, Sensor Package discovery and DogeStar-only Titan travel. Real elapsed-time contact opens the production mission brief and retains access after refresh.
- The compact menu passes **28 previews and 24 popup layouts** at 1280px, 375px, 320px and 844px landscape. Twelve progression layouts load all visible character, field, shop, planet and story art. Normal save/preference sentinels remain unchanged, with no sandbox page errors or cloud-service requests.
- Focus/animation checks cover wide desktop, phone and short landscape dialogs, failed acknowledgment, interrupted close/reopen, reset and a story opening during a mission dialog's exit. Settings and NewsDoge have separate five-theme/short-panel and actual motion/sound/reaction checks.

The final regression run passes all **eight browser suites**: CP7's 28 previews/32 layouts, CP6's eight flows/21 layouts/five news themes, earlier income/SearchDoges, real prestige with earned-item preservation, Bonus Coin/Rick, royalties, the normal fresh-player flow and missing-module/unsupported-save guards. The old CP6 harness was updated to wait for the newly animated exit before replaying; its initial attempt is retained in the evidence log.

Evidence: `scratch/checkpoint-8-qa/`; pre-change baseline: `scratch/checkpoint-8-baseline/`. Native preview was used first, including live source runtime/atlas extraction. Two CE snapshots returned `Preview automation snapshot timed out after 15000ms.`; visual QA continued in isolated muted Chrome. CLI source requests received the site's ordinary challenge and were not bypassed.

M04 Johnny versus Altar, dependent later upgrade waves, D08 buff persistence and the other unresolved CE decisions remain separate. Localhost stays on **8011**. No commit or deployment is included.
