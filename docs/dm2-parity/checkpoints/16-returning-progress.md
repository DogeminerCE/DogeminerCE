# Checkpoint 16 — Returning progress and Statistics scrolling

**October 16, 2026 · Review checkpoint.** Includes the three requested follow-ups: softer card shadows, scrollable Statistics with long timeline histories, and relevant stories/news for returning players. The parity count remains **55 implemented, 47 pending, one intentionally omitted (U20), out of 103**. Stop for review before Checkpoint 17.

Open the [muted Checkpoint 16 sandbox](http://localhost:8011/play/?parityTest=checkpoint-16), press **Ctrl+\**, choose a feature and press **Show feature**. Four choices, two buttons; private per-tab session storage, normal saves/preferences untouched, cloud/account/analytics disabled.

| Preview | What to review |
| --- | --- |
| Softer card hover | Hover an upgrade card, then move away. The lift/highlight remain subtle; the shadow is lighter and narrower. Phone cards stay static. |
| Scrollable timeline history | Scroll down through completed runs, expand details and use Show 20 earlier timelines. Scroll back to the current summary. |
| Returning save | A Jupiter save predating the story ledger loads without old Moon/Mars/Jupiter introductions. Stories and NewsDoge remain enabled. |
| New story & NewsDoge | A newly earned sensor upgrade opens Sensing Something. Close it; a third Super Shibe is bought through the ordinary purchase path and triggers a relevant NewsDoge report. |

## Hover and scrolling

The upgrade shadow is now 16% black, with a 2px drop, 3px spread and 12px radius, reduced from 22%/6px/14px. The existing 2px lift, 11% highlight, timing, planet palettes, reduced-motion behavior and static phone cards are retained. This is the requested CE adjustment to U07.

Statistics now owns its vertical scrollbar inside the desktop panel or mobile content area. Its height is bounded by the panel and the visible viewport, accounting for the desktop game's scale. This also keeps the bottom pagination button reachable in short windows. Phone scrolling accepts touch gestures without competing with the enclosing panel. Timeline tracking, expansion and pagination remain intact; the first-travel spoiler gate and static Dogeminer:CE tab title remain enforced.

## Returning story history

Older CE saves can lack completion records for stories added during these checkpoints. A one-time reconciliation uses saved visits, owned rockets/helpers, completed discovery stages and existing story flags to mark obsolete introductions and fulfilled NewsDoge milestones as completed. Downstream progress retires stale queued introductions. Incomplete arrivals, clues/routes without completion evidence, a saved untouched return, future Titan discoveries, unfinished royalties and reward receipts remain available.

The migration retains unknown story IDs, existing extra story income, earned equipment, currencies and notification preferences. The existing hitsng royalty flag also satisfies its hitsong introduction without granting income again. It neither invents old royalty rewards nor grants equipment for reconciled clue tutorials. New saves and new timelines start with the completion-history marker; subsequent loads skip inference, preserving normal in-progress events. Automatic NewsDoge delivery also rechecks eligibility so an Earth report queued before travel cannot interrupt the player on another planet.

The completion marker and both save slots commit together. The original pre-update save is retained once under dogeminer_ce_story_history_original_v1. A rejected write restores prior storage/live progress and blocks autosave until a successful retry. Unsupported completion-history versions stop loading before overwriting the save.

## Verification

**41 CJS suites, 38 client-script checks and three inline-script checks pass.** Focused browser checks exercise actual wheel scrolling and bottom pagination at 1280×800, 1280×600, 844×390, 375×812 and 320×568; a real phone touch gesture also scrolls. Computed shadow/lift/highlight match the requested values.

Returning-save checks verify quiet load, durable marker/original backup, refresh without replay, and actual new Titan story followed by newly earned NewsDoge. Injected failures at each of the original-backup, rolling-backup and primary writes roll back successfully and retry with the exact wallet preserved. Unit coverage includes stale pending events, unfinished arrivals/returns/Titan, royalty aliases, unknown IDs, earned-data preservation and idempotence.

Sixteen real four-choice/two-button previews at 1280/375/320/844 verify the fixes, decoded visible art, muted audio, untouched normal storage and no account requests. Four related browser regressions cover novice spoilers/static title, prestige/earned records, income/SearchDoges and fifteen bootstrap/version guards, including the new module and unsupported completion-history version.

Native preview snapshots failed twice with `Preview automation snapshot timed out after 15000ms.` The owned tab was closed; browser checks use isolated muted Chrome. No fresh live-source verification is claimed. Existing pinned source/audit metadata and historical checkpoint hashes are preserved. Initial QA failures remain recorded: short-window clipping led to the viewport bound; a private preview used the Earth-only purchase API before switching to the game's real planetary purchase path; two new QA locators were corrected to the existing button text/panel class.

Evidence: `scratch/checkpoint-16-qa/`. Immutable baseline: **123 files**. Final implementation manifest: **121 files**. Six CRLF scripts remain intact. Localhost stays on **8011**, using the existing queue-128 dev server. No commit or deployment.
