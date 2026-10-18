# Checkpoints 28–30 — Doge Gate, Mystery Evolution and Moon Launch

The previous combined review is accepted. **M14, S24 and U16 are implemented and tested: 72 findings complete, 30 pending and one intentionally omitted (U20), out of 103.** Stop before31 for this review.

Open [the combined sandbox](http://localhost:8011/play/?parityTest=checkpoint-30), then **Ctrl+\**. Four choices, two buttons:

| Preview | Check |
| --- | --- |
| Doge Gate price | Buy one Gate with exactly123,456,789 coins; the wallet reaches zero. The shop abbreviates the label to123.46M as usual. The fixture includes the required Jupiter progress. |
| Mystery Box evolution | The fortune is already earned and saved. Wait about4.5s for “Huh? / Your Mystery Box is evolving!” The button appears at6.5s; close the story, then open it. |
| Moon launch introduction | Press the logo/rocket screen to start the video. Nothing autoplays before initiation. |
| Moon playback & skip | Try play/pause and5% volume steps. After4s, Skip opens the confirmation. Keep Watching returns; Very Understand saves completion and travels to the Moon. |

All previews are muted and isolated in tab-session storage; ordinary player saves, preferences and cloud accounts are untouched. URLs28/29 expose the same review with separate namespaces. Existing checkpoint URLs remain available.

## Source and behavior

Fresh [DM2 main bundle](https://dogeminer2.com/assets/play-B7Micxas.js) fetch: HTTP200,982083bytes, SHA-256 `24948a089fc981326a2d6ad7a558cc766ca79c85ca11d3c18e976f8dc2a03764`, unchanged from the audit.

**28 / M14:** Source helper25 costs123,456,789 and gives155base DPS. CE's base price now matches; the existing owned-count scaling, flooring and supporter discount consume the corrected base. No earned helpers, currencies, stats or unlock requirements are migrated. Next ordinary price141,975,307; first supporter price117,283,949.

**29 / S24:** Execute the two source `ZP` actions at37406 in `play-B7Micxas.pretty.js` (original audit37408):1500ms found stage,3000ms to queue `mbevolve`,1000ms to initialize. Source `fw` then waits1000ms before its250ms entry fade. CE uses the same staged timing after loot presentation/holding clears. The existing story queue supplies the exact title, blue emphasis, Mystery Box artwork, special `short_sparkle` sound, centered planet frame, zoom and durable acknowledgment. The interactive box cannot open through the story.

A saved `mysteryBoxEvolutionPending` flag distinguishes newly found fortunes from boxes already available in older saves. Manual and automatic loot paths include the flag with ownership. Reveal commits before showing the button and retries rejected saves; loading restarts pending runtime delays rather than losing the earned fortune. A remembered/pending announcement does not queue twice. Travel waits through initialization. Suppressed stories retain their existing completion rules. Prestige/reset clears the flag; old boxes retain their cooldowns, rewards and availability without an obsolete announcement. No earned item-stat values change.

**30 / U16:** Source `jP` at36487 supplies the press-to-initiate logo/rocket,20% video volume,5% volume steps, play/pause, desktop fallback link and4s skip arming with500ms fade. CE's required `moon-launch.js` owns those controls and a two-tone “Are you sure?” confirmation with the source description/Very Understand wording. The local Moon video stays; the source YouTube fallback URL is exposed but was not opened during QA. On phones the fallback is hidden as in source, while controls have44px targets. Video and controls fit the two-panel area on desktop and viewport on phones. Source introductory fade, video fade and confirmation zoom honor OS reduced motion.

Completion/confirmed skip saves the watched flag and Moon access before traveling. A rejected save retains the scene and offers Try Again. Pending playback promises, skip/load timers, inert state, focus listeners, body overflow and suspended game audio are cleaned up on finish or save replacement. Play errors retain a fallback/skip route. Keyboard and controller input require initiation/confirmation; volume never overrides the player's sound/background policy. A bought rocket triggers the introduction; interrupted/unwatched launches can be offered again. Prior watched/legacy progress stays retained.

## Verification

Sequential checks:55 suites/51 parses after28;56/51 after29; final **57 CJS suites and52 syntax checks (49 client+3inline)** pass. New tests execute the actual source evolution actions and cover delays, queue/save rejection, retry, holding, reload, legacy access, source volume/steps, explicit initiation, pause, volume bounds, controller confirmation, completion rollback, one travel, stale callbacks, focus/inert cleanup, failure recovery and reduced motion. Existing income, currency flights, automatic loot, prestige, earned/fixed/merged items, Settings and startup guards pass.

Native incognito browser: exact-price affordability/purchase and real shop-button purchase leave0coins with one saved Gate; supporter/next prices match. Actual evolution produces one owned fortune, delayed announcement/button and saved unlock. Reload during the pending delay recovers the same fortune/announcement; acknowledging then clicking the real button opens the Mystery UI. Real launch controls pause, increase20→25%, preserve mute, cancel Skip and retry an injected save failure. Success travels to Moon, restores audio/inert state, and survives reload. A real Space Rocket purchase triggers the waiting introduction. Sixteen feature/viewport cases cover1280×800,375×812,320×568 and844×390; popup and playback controls stay visible, the first-timeline label stays blank, the title stays static and all audio stays muted.

QA also registered the previously unloaded short_sparkle.wav under its source sound name. All checks passed again. QA corrected a stale browser resource, video intrinsic grid height, missing private-preview cleanup and the Gate fixture's Jupiter requirement. One early play-control click timed out while below the stage; the corrected layout passes native clicks. An unsupported CSS locator was replaced by a private ID. Native screenshots can contain host blur/duplicate margins; DOM bounds and real interactions supplement inspection. No physical controller/touch hardware or audible sound matching is certified.

Evidence: `scratch/checkpoint-28-baseline/`, phase28/29 QA and `scratch/checkpoint-30-qa/`. The baseline contains186files; historical source/audit/checkpoint/follow-up hashes and CRLF scripts remain intact. No commit, deployment or external-browser fallback. Localhost8011 remains running.
