# Checkpoint 18 — Field personality

**Accepted October16.** Current mining text retains DM2’s20% ordinary-hit rate with uncapped circular placement, corrected in [Checkpoint19](19-mining-text-and-buttons.md). The source20% ordinary-hit chance below is retained.

**Historical Checkpoint18 review record.** Implements **U13/U14**. **59 findings implemented, 43 pending, one intentionally omitted (U20), out of 103.** Stop before Checkpoint 19. At the present batch size, roughly **12–18 more checkpoints** is a planning estimate; combat, seasonal systems, save conversion and final verification are larger than small polish rows.

Open the [muted Checkpoint 18 sandbox](http://localhost:8011/play/?parityTest=checkpoint-18), press **Ctrl+\**, choose a feature and press **Show feature**. Four choices, two buttons. Normal saves/preferences remain separate; cloud, accounts and analytics are disabled.

| Preview | What to review |
| --- | --- |
| Mining phrases | An initial phrase appears above the rock. Each accepted ordinary hit has a 20% chance of another phrase. |
| Helper conversations | Party Shibe and DJ Kittenz use different phrase pools. One example starts the scene; subsequent chatter uses natural DM2 timing. |
| Held & dropped phrases | The first grab speaks while held; the next speaks after dropping. Repeat to compare the two. This deterministic alternation is private to the preview. |
| Helper animation timing | Two Shibes have independent speeds; the rig and drive animate more slowly. Representative source-valid draws make all four cycle within about two seconds. Grab a helper to compare held speed. |

Phone previews expose field samples; ordinary phone gameplay keeps its grouped bar. Mining phrases work in normal phone gameplay, and only owned phone-bar helpers animate.

## Behavior

Source rules are executed into `tests/fixtures/dm2-field-personality.json`: 150 helper speed vectors, four frame orders, 64 population/chance boundaries, thirty helper conversation gates and 120 tool/phrase vectors. Idle chatter checks every 500ms at 8/11/14/16% by visible helper population, then selects a helper before checking whether its definition speaks. Named helpers use the held pool with a 60% chance after 200–500ms. If that held chance was not selected, dropping has a 30% after-phrase chance. Cancellation never creates a drop phrase.

Mining, idle, held and after lines share source tool overrides (Paw/staff, firearms and cleavers). Cat and DJ pools differ. Lander Shibes use the current planet's destination phrase. The ordinary rocket's destination branch is gated off by its source definition; it is not enabled from dormant code. Empty source icon entries stay silent, without invented symbols. Text uses safe text assignment, a solid white stroke and no glow or background box. Short fade-in/hold/fade-out phases, limited tilt and bounded positioning adapt source canvas text to CE's field. Reduced motion removes phrase tilt while retaining opacity fades and texture playback.

Held phrases follow the existing lift/sway/drop transform. Field replacement, travel/import/reset and hidden pages clear bubbles and delayed held phrases. Paused play, stories, cutscenes, balance/offline reports and bag/Mystery review suppress new chatter. A forty-phrase budget bounds effects. No phrase grants currency, changes names/stats, or writes saves.

The frame scheduler uses the source's type-dependent randomized speed and `[idle,idle,mine]` sequence. It supports extra-frame ordering when artwork supplies those frames. CE's Altar keeps its existing two textures; Johnny's different art and extra textures remain with **M04**. One shared deadline timer serves field and owned phone-bar sprites, skips duplicate source writes, preserves rest speed/phase across holding and pauses while hidden. Repeated UI refreshes cannot postpone a frame. The approved 105ms held alternation, shadows, hover, grouping and pendulum/bounce motion remain.

## Verification

**45 CJS suites, 41 client parses and three inline parses pass.** Unit checks cover source vectors, upgrade refresh, shared scheduling, rapid UI refresh deadlines, detached nodes, visibility/reduced motion, phone ownership, source phrase gates and paused/cancelled/stale interactions.

The native collaborative browser passes sixteen compact previews at 1280×800, 375×812, 320×568 and 844×390: fitted helpers/text, decoded visible art, no timeline spoiler, static title, mute and unchanged normal storage. No account requests or local resource failures appear in the final matrix. Four additional final checks verify mining text stays above and near the actual rock. Four final conversation checks include the prerequisite Mars Base and only speak through the two enabled families.

Focused native checks cover independent frame profiles, eased lift, held chatter following movement, retained sway/name/shadow animation, distinct after-drop pool, restored resting rate, stale cancellation and exact save/load identities/wallet/stats. Four nickname families and two manual placement paths survive redraw/load. Group/ungroup retains every name, ID and DPS. A real rock click increments clicks, coins and rock damage exactly once while invoking chatter; a story-blocked click invokes neither. Phone animation continues through rapid real UI refreshes, keeps unowned icons idle, and normal phone mining text remains visible.

Initial QA corrections are recorded in `scratch/checkpoint-18-qa/qa-notes.json`: the sandbox default, a stale same-URL browser document, native timing assertions, and the rock selector/anchor. The final rock positioning fix is checked at all four sizes. These checks do not certify a physical 100Hz display or every live DM2 pixel. The initial source request returned **HTTP 403**. During this review follow-up, live DM2 loads successfully with audio blocked before game startup and saving disabled in a private profile. Its freshly fetched 982083-byte bundle matches SHA-256 `24948a089fc981326a2d6ad7a558cc766ca79c85ca11d3c18e976f8dc2a03764`.

Evidence: `scratch/checkpoint-18-qa/`. Immutable baseline: **130 files**. Implementation manifest: **130 files**. Historical audit/source fields and checkpoint hashes, all six CRLF scripts and the existing dirty tree are preserved. Localhost remains **8011**; no commit or deployment.


## Review follow-up — phrase fades and the frozen timing demo

Live DM2 confirms the short fade-in, 1300–2299ms hold and roughly400ms fade-out, with source idle chances unchanged. A40-second observation with two Shibes and one Kennel records two spontaneous phrases; this small sample illustrates cadence, not a new probability estimate. The earlier CE conversation demo forced two extra phrases every3.1seconds. That repeat loop is removed; it now shows one initial example and then relies on normal source rolls.

The prior reduced-motion handling could freeze every helper texture and disable both phrase fades. It now removes spatial phrase tilt while keeping frame playback and the complete opacity lifecycle. New text also keeps an older same-helper phrase alive until its own fade finishes. All active phrases follow held helper motion and clean up independently.

The timing preview uses source-valid representative rates0.082/0.110/0.024/0.030 so the two machines visibly cycle during a short review. Ordinary gameplay retains random source rates. The actual OS/browser preference in the user's Chrome session was not read; the disabling code path was reproduced and corrected.

**Follow-up verification:**45CJS suites and44syntax checks pass. Native browser checks observe intermediate opacity on both fade phases, complete cleanup and overlapping/moving phrases under normal and forced reduced-motion conditions. All four helpers use both textures in both conditions. Eight desktop/phone/landscape previews fit and decode. Held/drop/sway/name/rest-rate/stale-field/save-load checks pass. The repeat-loop test observes no new forced speech after the initial example. Normal storage remains untouched and CE/DM2 stay muted.

Current evidence: `scratch/checkpoint-18-followup-qa/`;135-file immutable follow-up baseline and130-file current implementation manifest. The original Checkpoint18 manifest remains historical. Cache versions:styles104,field-personality7,parity-testing35. Stay at Checkpoint18; stop before19.
