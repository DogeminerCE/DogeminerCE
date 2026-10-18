# Checkpoint 17 — Helper hover and personal names

**October 16, 2026 · Review checkpoint.** Implements **U15 and U26**. **57 original findings implemented, 45 pending and one intentionally omitted (U20), out of 103.** Stop for review before Checkpoint 18.

Open the [muted Checkpoint 17 sandbox](http://localhost:8011/play/?parityTest=checkpoint-17), press **Ctrl+\**, choose a feature and press **Show feature**. Four choices, two buttons; private session storage, normal saves/preferences untouched, cloud/account/analytics disabled.

| Preview | What to review |
| --- | --- |
| Helper outline & name fade | Hover overlapping helpers. The current helper comes forward with a crisp amber silhouette and its name. Move away: the outline clears immediately, while the name fades for one second before the helper returns to its resting depth. |
| Grouped helper names | Hover the group, wait for Ungroup and open it. All three saved member names remain intact, including the old Mining Shibe label. Keyboard focus also reveals names. |
| Moon Shibe nicknames | A new purchase gets a personal nickname; the previously saved nickname and type label remain unchanged. |
| Super Shibe nicknames | A new Super Shibe uses its source name pool. Purchase and reload retain the name. |

Phone previews expose a small field sample for inspection; ordinary phone gameplay retains its grouped helper bar. Name previews show the new named helper beside that bar. Fixtures stay paused and keep helpers clear of the desktop planet footer.

## Helper hover

The executed source uses a 2px #f1951d outline, white 14px names with a 3px amber stroke, immediate name display and a 1000ms fade. Its depth order is resting, fading, hovered, then held. CE uses paired DOM depth slots for separate sprites/names and keeps grouping controls above them. The source fade has no explicit easing override; CE uses CSS ease-out for the DOM fade.

A dedicated state owner handles hover, keyboard focus, interrupted/re-entered fades and held names. Fade completion also hides the name from rendering/accessibility. The silhouette is solid, with no Gaussian blur or text glow. Keyboard focus uses the silhouette cue instead of a native rectangular ring. Existing selected-helper tint and Rick's green buff stroke remain. The old hover scale is removed; held sway, pickup, fall and bounce retain their motion. Landing, cancelled seeking and completed loot hops update resting depth. Reduced motion omits the visual fade.

## New purchase names

Source definitions mark Mining Shibe, Moon Shibe, Party Shibe, DJ Kittenz and Super Shibe as named. Super Shibes use the separate femnames pool. The original audit incorrectly included Robo Shibes and omitted DJ Kittenz; source execution confirms Robo Shibes keep their type label. The source's reserved index-zero name sentinel remains excluded from random allocation. Existing CE Earth nickname choices are retained.

Each purchase allocates its name once, before placement. The same value is passed to automatic placement, manual cursor reservation and the phone-owned record. Reconstructing a desktop field after a phone purchase reuses unplaced saved names, including duplicates. Rendering, grouping, dragging and loading preserve existing saved names and old generic labels. The previous Mining Shibe redraw repair that silently renamed generic labels is removed. No item/stat/price migration or new progression gate is introduced.

The small helper-names module is a required bootstrap dependency. A missing module stops startup before save/account initialization, consistent with the existing required-module policy.

## Verification

**43 CJS suites, 39 client-script checks and three inline-script checks pass.** The new source fixture executes helper hover/depth/fade behavior and name definitions directly from the pinned DM2 bundle. It records both name pools and source selection behavior. Unit checks cover actual purchases, failed purchases, unchanged shop templates/prices, source family membership, reserved sentinel, retained CE Earth names and hover lifecycle.

Focused Chrome tests exercise real hover, fade, re-entry, overlapping depth, keyboard focus, drag/sway, group/ungroup and exact saved identities. Four non-Earth named families retain names through redraw/save/load; Moon Shibe and DJ Kittenz manual reservations/placement keep the same name. A real phone shop purchase survives refresh and desktop reconstruction. Reduced motion passes.

Sixteen compact-menu previews pass at 1280×800, 375×812, 320×568 and 844×390, including decoded visible artwork, bounded helpers, old-name preservation, mute and storage/account isolation. Six related browser regressions cover first-travel spoilers/static title, Statistics wheel/touch scrolling and softer card hover, returning-story migration/new events, prestige/critical records, income/SearchDoges and sixteen bootstrap/version guards.

Native preview performs initial hover/focus tests and six responsive preview cases with no script errors or normal-storage changes. Two consecutive phone captures then returned `Preview snapshot failed: Preview automation snapshot timed out after 15000ms.` The owned tab was closed and the full matrix completed in isolated muted Chrome. One later Chrome still capture timed out; static captures now disable presentation animations, while the focused motion/fade tests remain live. A reused scrolling regression initially compared a button with bounds measured before the mobile panel finished resizing; the assertion now uses the current bounds and still requires actual scrolling and clicking.

Other initial QA corrections remain recorded: a save reconstruction variable typo, a missing prototype-key guard in the name allocator, minimal test DOM stubs and a detached test iframe reference. Phone fixtures explicitly reconstruct the purchased saved field record; real phone UI continues using its existing bar.

Fresh source download and native source navigation failed certificate verification. This checkpoint uses the unchanged pinned source; no new live-source certification is claimed. Its main-Doge tilt config is disabled by default, so U11 remains pending verification rather than being activated from dormant code.

Evidence: `scratch/checkpoint-17-qa/`. Immutable baseline: **125 files**. Final implementation manifest: **125 files**. Original audit fields, source identities, historical checkpoint hash dictionaries and six CRLF files remain preserved. Localhost stays on **8011**, with the existing queue-128 server. No commit or deployment.
