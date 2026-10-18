# Checkpoint 5 — Stories and DJ royalties

**Implemented and tested · October 15, 2026.** The S01 story foundation was implemented and tested before the shared M13/S17 royalty event. **16 of the original 103 implementation findings are delivered; 87 remain.** Checkpoint 4 is accepted, including its timeline-card and idle-Paw corrections.

Open the [muted Checkpoint 5 sandbox](http://localhost:8011/play/?parityTest=checkpoint-5). **Ctrl+\** opens its tools. The normal game's **Open checkpoint sandbox** now opens this version. All five checkpoint URLs use independent per-tab session saves. Normal saves/preferences are never copied or written; sandbox audio and cloud/account initialization remain disabled.

## Story foundation

The new queue delivers one story at a time, rejects duplicate IDs and saves pending/completed state. Unacknowledged stories resume after refresh. Completing a story saves its seen marker and effect together in the primary save and backup. Failed saves retain the original state and show **TRY AGAIN**. Old buttons from a dismissed or replaced save cannot grant an effect.

Delivery waits for focus and active gameplay, pauses during held inputs/placement, and avoids intros, cutscenes, reports, loot reveals, inventories and other dialogs. Pending Beta and Welcome Back receipts keep priority, including while their presentation timers are waiting. Passive coin income continues behind a story; mining, helper rock damage and conflicting controller/game actions stay blocked. Close/Enter/Escape and controller A use the same saved completion path. A controller button held into the opening frame cannot acknowledge it.

Suppressing ordinary stories still commits their effects. The foundation supports DM2's first-timeline-only IDs, mandatory-story exceptions, receipt IDs and `#nopops` behavior. Existing Welcome Back/Beta receipts retain their tested presentation and acknowledgment systems. The story frame reuses their planet palettes, solid outlines, two-tone action and source sounds (`nice_popup`, `swipe_fast_low`). New story IDs/effects can use this queue as subsequent backlog entries are implemented.

Only **hitsong** is newly registered for ordinary gameplay in this checkpoint. Earlier goals, timeline-return narratives, arrival stories and separate normal-game story/news settings remain in their own entries. The saved story preference and sandbox toggle prepare that later settings work.

## DJ Kittenz royalties

DM2's exact gates are:

- Currently on **Mars**, with **at least five owned DJ Kittenz**. Visual grouping does not change ownership.
- Current-timeline play time has reached **730 whole seconds**.
- The game has focus, and **more than 8,200 milliseconds** have passed since arrival. Travel/reload restarts this arrival timer.

The source artwork and **IT'S A HIT!** message explain the reward. Closing saves **300 × timeline + 500 flat DPS** once for that timeline: **800** on timeline 1, **1,100** on timeline 2, **1,400** on timeline 3. `hitsong` records the story and `hitsng` guards its royalty effect. Reviewing/reloading the popup cannot pay twice.

The flat bonus is added after the helper/Bonus Coin term and before the total DPS multiplier. It continues on other planets and enters the permanent offline-income base. Rick/Bonus Coin boosts do not multiply the flat royalty term. Royalties do not add local helper rock damage or become Fortune item stats. Prestige clears the timeline's royalty income and eligibility markers, while earned equipment/Alpha bonuses remain intact. The inventory stats sidebar shows a separate **Royalty DPS** row when active.

## Try it

Presets load paused. **Load five DJs · 730s**, then **Resume mining**, uses the real arrival timer; the popup appears after the gate passes. For faster inspection, choose **Pass arrival delay**, then **Step story check**. The latter temporarily runs one real check and retains the scene's prior paused state.

| Control | Expected result |
| --- | --- |
| **Load four DJs · blocked** | No royalty story, even with enough time. |
| **Load five DJs · 729s** | No story until **Add one mining second** reaches 730s. |
| **Load five DJs · 730s** | 248 base DPS; after saved completion, 800 royalties bring it to **1,048 DPS**. |
| **Load timeline 2 · five DJs** | Uses the real Paw; completion grants **1,100** royalty DPS. |
| **Load claimed royalty reward** | Already has 800; repeated checks grant nothing more. |
| **Load stories suppressed** | Same eligibility, effect and saved markers, with no ordinary popup. |
| **Load saved pending story** | Reload to resume it; no reward is granted before completion. |
| **Queue behind Welcome Back** | The offline receipt closes first, then the royalty story can run. |
| **Fail next story completion once** | Queueing still saves. Closing fails once with zero royalty/seen change; **TRY AGAIN** completes once. Loading a new preset disarms it. |
| **Suppress/Enable story popups** | Changes only this test save; Welcome Back remains visible. |

Live diagnostics show DJs, current timeline/time, arrival delay, pending/seen IDs, royalty income, total DPS and permanent offline DPS. Previous checkpoint controls remain in collapsible sections.

## Verification

- **24 CJS suites pass.** Execute six primary-source queue/suppression/close cases, nine royalty eligibility cases, six reward/repeat cases and three actual `QK` income outputs. Additional tests cover both primary/backup failures, safe retry, pending/seen reload, stale views, input/dialog gates, overflow/version rejection, source prestige resets and exact preservation of earned Alpha/item bonuses.
- All **29 client scripts and three inline scripts** parse. A missing story module stops boot before save access. Tests cover all five sandbox namespaces; the normal player's save/preferences remain separate. CRLF-aware and changed-line whitespace checks pass.
- Muted isolated browser QA exercises every new preset, the actual 8.2s arrival gate/frame loop, source popup artwork, real completion/retry, reloads, story suppression, Welcome Back priority, offline credit/replay and mining isolation with passive income continuing. Twenty popup layouts cover all five planet palettes at desktop, 375px, 320px and short landscape sizes. Desktop/phone/landscape screenshots were inspected; no sandbox page errors or cloud requests occurred.
- Earlier income/Searchdoge, real prestige preservation and Bonus Coin/Rick browser regressions are retained. The timeline/Paw follow-up separately checks fifteen planet layouts and real press/release after the mission zap. Evidence/extractors live in `scratch/checkpoint-5-qa/` and `scratch/checkpoint-4-followup-qa/`; pre-edit files are in the corresponding baseline folders.

Source remains the pinned DM2 2.15 bundle, SHA-256 `24948a089fc981326a2d6ad7a558cc766ca79c85ca11d3c18e976f8dc2a03764`. References: [queue and suppression](/Users/yasin/Documents/Projects/DogeMinerCE/scratch/dm2-research/play-B7Micxas.pretty.js:25466), [story/effect](/Users/yasin/Documents/Projects/DogeMinerCE/scratch/dm2-research/play-B7Micxas.pretty.js:25362), [eligibility](/Users/yasin/Documents/Projects/DogeMinerCE/scratch/dm2-research/play-B7Micxas.pretty.js:37102), [income order](/Users/yasin/Documents/Projects/DogeMinerCE/scratch/dm2-research/play-B7Micxas.pretty.js:50421), [timeline reset](/Users/yasin/Documents/Projects/DogeMinerCE/scratch/dm2-research/play-B7Micxas.pretty.js:41852). Frozen fixtures: [stories](/Users/yasin/Documents/Projects/DogeMinerCE/tests/fixtures/dm2-story-queue.json), [royalties](/Users/yasin/Documents/Projects/DogeMinerCE/tests/fixtures/dm2-royalties.json).

M04 Johnny/Altar and D08 timer persistence remain unresolved; no decisions were silently changed. No commit or deployment.
