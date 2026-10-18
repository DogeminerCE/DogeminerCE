# Checkpoint 7 — Planet discoveries and clues

> **October 15 follow-up:** The joint review requested follow-up UI fixes, now included in Checkpoint 8. Titan discovery/travel completes U17 there; its Partial status below describes this checkpoint's original delivery. [Checkpoint 8 review](08-rig-contact-and-titan.md).

**Implemented · October 15, 2026.** S08–S13 and S16 add eight source stories across seven review features. **Checkpoints 6 and 7 are both pending user review.** Checkpoint 6 was deferred, not accepted.

Open the [muted Checkpoint 7 sandbox](http://localhost:8011/play/?parityTest=checkpoint-7). **Ctrl+\** opens the menu: choose one feature and press **Show feature**. The menu closes automatically. Showing it again resets that private scene. The only other button closes the tools.

| Feature | What to check |
| --- | --- |
| **Moon arrival** | Automatic travel opens **SUCH ACHIEVEMENT**, introducing the Moon Base. |
| **Moon treasure map** | Six Moon Shibes and three Doge Cars trigger the map. Watch it leave the rock, then hover and collect it to open **A MAP!** |
| **Discover Mars** | The owned Lander Shibe discovers Mars. **OCEANS?** follows; Mars appears locked before its rocket is owned. Close the message, buy the rocket and select Mars to travel. |
| **Mars arrival** | Automatic travel opens **THE PARTY PLANET**. |
| **Mars crude drawing** | Three CuriosiDoges trigger the drawing. Collect it to open **THATS ODD**. Two DJ Kittenz also satisfy the production trigger. |
| **Discover Jupiter** | Space Bass triggers **GOOD VIBRATIONS**, then **THE BIGGEST YET**. The rocket stays locked until the first message is closed. Buy it after the second message and select Jupiter to travel. |
| **Jupiter arrival** | Automatic travel opens **CLOUD MINER**. |

Clues support click, touch and controller **X**, with the original field sprite, hover motion, bob, claim animation and `grab_bag2` sound. Audio is muted in this sandbox. Refresh before collection to recover the field clue; refresh during a story to resume its unacknowledged message. Solid strokes replace the source clue glow.

The [Checkpoint 6 sandbox](http://localhost:8011/play/?parityTest=checkpoint-6) and its [eight-feature guide](06-goals-and-return-stories.md) remain available for joint review. Each checkpoint uses its own per-tab session namespace. Normal saves/preferences are not copied or written; cloud/account/analytics initialization is disabled. The normal game's **Open checkpoint sandbox** now opens checkpoint 7.

## Production behavior

Arrival stories use the source text, artwork, emphasis and current planet's shared popup frame. They appear once per timeline through the existing durable story queue and respect the Story Popups preference.

The Moon map requires **more than five Moon Shibes and more than two Doge Cars**, then an **800ms** deferred callback. The Mars drawing requires **more than two CuriosiDoges or more than one DJ Kittenz**, then **1500ms**. Counts are global, as in the source; the clue is expelled on the planet active when the callback runs. Field clues do not expire, stack or grant stats. CE saves the uncollected field state and commits collection together with its pending story. Failed writes leave the clue available for retry. Travel, replacement and prestige invalidate old collection callbacks. Source landing geometry and easing are fitted inside CE's visible field, clear of the currency HUD and lower controls, including restored clues and resized windows.

A Lander Shibe immediately makes Mars known and holds travel for the **1500ms** discovery callback. It then queues `moon3` and enables the Mars Rocket. A Space Bass makes Jupiter known; callbacks occur at **1250ms** and **1550ms**. The second waits behind the first queued/open message before enabling the Jupiter Rocket and queuing `mars3`. Closing/suppressing stories and reloading retain this order. Actual rocket ownership unlocks travel. Both shop layouts and direct purchase/travel paths enforce the gates; price refreshes retain progression locks.

A versioned `worldDiscovery` ledger separates **known**, **unlocked** and **visited** locations, route stages and field clues. Primary/backup writes commit together with rollback. Old saves retain access evidenced by their current planet, owned rockets or established helpers. Tabs retained from an earlier timeline alone do not invent current-run ownership. No previous clue claims or visits are fabricated. Existing wallets, fixed/protected item stats and earned Alpha bonuses remain intact. Prestige saves the next discovery state atomically with its existing rewards; failed prestige retains the old field and state.

**U17 remains Partial:** Mars/Jupiter now show known-but-locked destinations on desktop and mobile. Titan's discovery stories and full source travel split remain for S18/S19. Rig invention/contact and later upgrade waves remain separate backlog work. Checkpoint 6's U01 artwork gap remains documented in its guide.

## Verification

- **28 CJS suites pass**, with **31 client scripts and three inline scripts** parsing. The final implementation/test/fixture hash manifest covers **71 files**. The pinned DM2 source, original audit hashes and historical checkpoint implementation hashes remain unchanged.
- Frozen primary-source evidence contains **eight narratives, 405 eligibility outputs across nine criteria, nine executed callbacks and ten landing vectors**, plus the original drop/claim motion values. Tests cover exact timer/count boundaries, primary/backup failures, rollback/retry, queued/open story holds, suppression, reload, old callback rejection and successful/failed prestige.
- Muted browser checks exercise real Moon travel, Lander/Space Bass purchases, both rocket purchases and travel, controller/touch clue claims, field refresh and save-failure retry. Four established legacy planets retain round-trip access without new rocket requirements; wallets/items stay intact.
- The real compact menu passes **28 feature previews and 32 popup layouts** across desktop, 375px, 320px and landscape. Eight forced high/low-position cases verify visible, clickable clues clear of the HUD. Programmatic/controller travel selects the correct tab. A final serial media pass confirms that all seven landscape scenes load their visible field, HUD, shop and planet artwork.
- Checkpoint 6's eight review flows, **21 popup layouts**, persistent desktop/mobile preferences and five NewsDoge themes pass again. Earlier income/SearchDoges, real prestige reward preservation, Bonus Coin/Rick and royalty workflows also pass; the normal fresh-player entrance/goal/mining flow remains intact.
- Missing sandbox/story/world/news modules and unsupported saved story/world versions stop startup without overwriting progress. No sandbox page errors or cloud-service requests occur; normal save/preferences remain unchanged and QA audio stays muted.

Evidence and scripts: `scratch/checkpoint-7-qa/`; baseline: `scratch/checkpoint-7-baseline/`. Native preview snapshots twice timed out at 15000ms before fallback to isolated muted Chrome; no owned native preview remains open. Localhost remains on port 8011. No commit or deployment is included.
