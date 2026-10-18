# Checkpoint 57: complete review controls and DM2 egg icons

Open [the full review sandbox](http://localhost:8011/play/?parityTest=checkpoint-57). Press **Test tools** at the bottom right or **Ctrl+\** to open/close the menu. The previous checkpoint56 URL also gets the expanded menu after refresh.

The menu exposes **174 previews in 34 categories**, including the early income, SearchDoge, prestige, Bonus Coin, history and royalty actions as well as all later feature scenes. Search by name or select a category, choose a preview, then press **Show selected change**. The optional early-checkpoint settings select the report planet, reward badge, mission choice and Bonus Coin tier. Test session controls pause/resume and reload the private save. Stateful actions such as stepping a clock run against the currently loaded fixture; load the corresponding scene first.

**Seasons** has Ordinary/no event, Easter, Halloween and Christmas, each on all five planets. Choose 0–9 eggs and whether the golden reward is already earned, then press **Show season**. **Next background** cycles the selected scene. The two inventory buttons grant that event's entire source pool: Easter4 picks/9 fortunes, Halloween3/5, Christmas3/7. These are actual factory-generated items with source artwork and protected seasonal fortunes. **Show hidden egg** opens any of the nine actual locations; mobile tab animations finish before spawning and the location scrolls into view. **Play ninth egg → golden reward** loads eight found eggs and one real collectible, followed by the actual saved story reward.

These controls replace only the temporary per-tab save. Audio remains muted and cloud initialization disabled. Production uses the normal calendar; the private Ordinary override cannot affect ordinary play. The new checkpoint URL is included in both game and landing bootstrap failure guards.

## Source check and correction

The pinned official DM2 client `play-B7Micxas.js` lists exactly **nine** hidden locations in `YU()` (`scratch/dm2-research/play-B7Micxas.pretty.js:46698`): Earth, Moon, Mars, Jupiter, Titan, Settings, Pickaxes, Fortunes and Upgrades. `QU()` at46795 selects `easter/count1` through `easter/count9`, capped at9. It draws a row of nine egg icons. The count9 image is taller and includes the large golden egg underneath; this is completion artwork, not a tenth hidden egg. The golden story receipt (`fg`) is tracked separately and does not select the strip image.

CE's text-only badge was incomplete. It now uses those original source sprites: `assets/SpritesheetsSrc/easter/easter/count1.webp` through `count9.webp`. Counts1–8 are154×35, count9 is154×75, with source phone scale0.75. The strip hides at zero or outside Easter. Its accessible label and tap notification retain the exact count and earned receipt. CE keeps the source offset where it fits and moves the strip below the wider CE balance on phones when necessary.

The actual source income function remains unchanged: nine eggs give×1.09; completing the golden reward gives×2.18. Source `QU()`'s tooltip says18% at nine while its executed income function uses×2.18 after the reward. CE continues to report the actual calculated bonus, as documented in the earlier seasonal checkpoint; this correction changes presentation, not saved reward mechanics.

## Validation and evidence

- The original source `YU()` and `QU()` are executed in `tests/egg-counter.cjs` as an oracle for all ten count states, golden receipt independence and the source phone scale. Existing seasonal tests compare1116 calendar dates and200 income cases and cover all31 seasonal prizes, save failures and protection.
- Native T3 browser automation checks all20 season/planet combinations, every seasonal item's image decoding, background rotation, all nine hidden locations on desktop and two phone sizes, and all ten counter states at1280×800,375×812,320×568 and844×390. Phone balances and the icon strip do not intersect. Category/search/empty results, real inventory/season buttons, menu scrolling/close and the touch launcher are checked at those four sizes.
- The real ninth-egg storage transaction is forced to fail once, keeps its collectible, then succeeds. Golden completion,×2.18 and source count9 artwork persist after reload. Opt-out hides the strip while retaining progress; normal-play guards reject all three private mutation entry points.
- Full automated checks:77 CJS suites and73 game parses (70 client/3 inline). Generated patch notes remain93 bullets/8 sections covering101 entries, with build `beta-parity-57`.

Evidence and reusable browser assertions are in `scratch/checkpoint-57-qa/`; the before-edit snapshot is `scratch/checkpoint-57-baseline/`. Native screenshots are retained with their reported viewport metadata; geometry assertions use the page's actual CSS viewport. Older immutable checkpoint evidence is preserved. No physical-device certification, commit or deployment is claimed.
