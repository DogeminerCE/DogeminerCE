# Checkpoint 21 — Planet Backgrounds and Silent Saving

Checkpoint 20 is accepted. This checkpoint implements U18 and removes the requested “Game saved successfully!” notification. **62 original findings implemented, 40 pending, one intentionally omitted (U20), out of 103.** Stop for review before Checkpoint 22.

Open [Checkpoint 21](http://localhost:8011/play/?parityTest=checkpoint-21), then **Ctrl+\**. Four choices, two buttons:

| Preview | What to check |
| --- | --- |
| Moon backgrounds | The Moon starts with its own artwork and cycles through its source pool. |
| Mars backgrounds | Mars uses its five landscape images followed by the two shared images. |
| Jupiter backgrounds | Four source images rotate with a gentle fade. |
| Titan backgrounds | Four Titan images rotate with the same fade. |

Watch a change every **ten seconds**. **B** advances immediately on desktop. All five planets are known and unlocked in this private test save; use the ordinary planet selector to inspect Earth too. Moon and Earth deliberately share several images, as they do in DM2. Save Game should save silently. Save failures still report an error.

The sandbox stays muted and uses its own tab-session save. Ordinary saves/preferences are untouched, account/cloud/analytics initialization is disabled, and earlier checkpoint namespaces remain available. The recently accepted notification size, 4.5-second lifetime and no-X presentation are retained.

## Source parity

The fresh native-browser source fetch returns HTTP 200, 982,083 bytes and SHA-256 `24948a089fc981326a2d6ad7a558cc766ca79c85ca11d3c18e976f8dc2a03764`, matching the audit. Source `Pr` provides the five ordinary pools; `MP` schedules ten seconds; `_P` walks the pool sequentially and wraps when needed. The source CSS (`play-4b_ABwYk.css`, HTTP 200) uses four-second opacity fades and cover sizing aligned to the top left.

| Planet | Source order, using existing local WebP copies |
| --- | --- |
| Earth | bg1, bg-new, bg3, bg5, bg6, bg7, bg4, bg9 |
| Moon | bg003, bg001, bg3, bg-new, bg5, bg1, bg6, bgmoon01 |
| Mars | bg101, bg102, bg103, bg104, bg105, bg6, bg-new |
| Jupiter | bgjup01, bgjup02, bgjup03, dogewow |
| Titan | titan02, titan03, titan04, titan05 |

These 31 entries use 24 existing images; none of their artwork is edited. One shared pool method now serves initial loading, imports, planet travel and timeline resets. Fresh loads/reset scenes start at the first image. Ordinary planet travel carries the source cursor forward, wrapping to zero if the new pool is shorter.

Two display images provide the source-style blend: the outgoing frame stays opaque beneath the incoming fade. A cached image loads before replacing the visible frame, and late loads from a previous scene are ignored. Failed loads retain the old frame and can retry. Fade cleanup removes the old layer without starting another hidden fade. CE's former brightness/contrast filter is removed to retain the image colors.

There is one ten-second timer. Repeated setup replaces it, and paused, hidden, transitioning or cutscene scenes skip automatic changes without a catch-up burst. Reduced motion skips the long fade while retaining image changes. Holiday pools/settings remain separate pending work. Background selection does not change inventory, currencies, stats or save schemas.

Only the routine successful-save toast is removed. Primary/backup writes, return values, error messages and import/export feedback keep their existing behavior.

## Verification and evidence

**49 CJS suites, 44 client scripts and three inline parses pass.** New background tests execute the shipped pool and timer functions for 41 order/wrap vectors, then check local artwork, cross-planet cursor wrapping, stale/failed/cached loads, reduced motion, four-second cleanup and one guarded timer. The existing save lifecycle test verifies a silent successful save with identical primary/backup data and a visible write-failure message.

Native browser checks cover 16 responsive previews at 1280×800, 375×812, 320×568 and 844×390. Six final preview checks also verify all-five-planet access and the source crop after the private fixture correction. All 24 distinct images decode. Real Earth/Moon planet-button clicks select the right pools; the actual Settings Save Game button writes matching primary/backup data without a notice or ordinary-storage mutation.

A fresh saved-Moon reload selects `bg003`. In the natural timing check, the index remains zero at 9.00 seconds, changes to one by 10.60 seconds, and the incoming frame has intermediate opacity during its four-second fade. The final frame is opaque with one active image and no outgoing layer. Audio stays muted, the browser title remains `Dogeminer:CE`, and a novice's timeline label is blank.

Evidence: `scratch/checkpoint-21-qa/`. The immutable pre-change baseline contains 142 files; the current implementation manifest contains 162, including the 24 unchanged existing background images and the new test. Historical source/audit/checkpoint/follow-up hash dictionaries and CRLF files remain intact. No external-browser fallback, commit or deployment was needed. Localhost stays on port 8011.

QA notes: the first static check measured fade cleanup from the request instead of the loaded frame; it now waits for the frame and pauses rotation during static captures. The private preview initially marked planets unlocked without marking them known; the fixture now supplies both. An initial reload check ran after normal rotation had resumed; the immediate fresh-reload check passes. Native snapshots retain existing `/sw.js` registration 404 console messages; no background image failures occur. These notes do not claim a fresh full DM2 gameplay/pixel certification.
