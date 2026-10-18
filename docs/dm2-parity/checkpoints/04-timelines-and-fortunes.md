# Checkpoint 4 — Timelines and protected Fortunes

**Accepted with tested presentation follow-up · October 15, 2026.** M11 was implemented and tested before M12. At this checkpoint, **13 of 103 findings were delivered**. [Checkpoint 5](05-stories-and-royalties.md) now brings the total to **16 delivered and 87 remaining**. Checkpoint 3 is accepted.

Open the [muted Checkpoint 4 sandbox](http://localhost:8011/play/?parityTest=checkpoint-4). **Ctrl+\** opens its tools automatically. The normal game's **Open checkpoint sandbox** now opens [Checkpoint 5](05-stories-and-royalties.md). All five checkpoint URLs retain independent per-tab session saves; earlier controls remain in collapsible sections. Normal saves/preferences are never copied or written, and audio/cloud/account initialization stays disabled in these test sessions.

## Timeline records

Statistics now shows the current timeline's earned coins and mining time below CE's lifetime totals. Completing a mission archives the coins carried, coins earned, recorded play time, actual Attack/Go Home choice, badge type and diamond reward. The next run starts its own counters at zero. Spending never reduces earned coins; offline income enters that counter once, without advancing active mining time. Pauses, hidden tabs, reports, intros and cutscenes do not advance the new active clock.

CE's lifetime mined coins, clicks and play-time fields are retained. A first-timeline legacy save retains its existing earned total and saved clock span. Later Alpha saves have no recoverable per-run history: tracking begins at their current timeline, current earnings start from the known wallet minimum and are labeled **At least**, and time starts when tracking begins. Earlier records are never invented. The source stores whole seconds; CE retains milliseconds and displays whole seconds.

Completed records expand for details. The newest 20 appear first, with a control to show 20 earlier records at a time. Expanding a row survives live counter updates. Desktop and phone views share the same ledger.

## Protected Fortune consolidation

At mission completion, duplicate protected Fortunes with the same canonical source ID become one inventory tile. It keeps the original artwork and first item identity, displays a solid **×N** count, and shows all combined bonuses in its existing hover/tap details. Different source IDs and unidentified items remain separate. A single fixed item remains unchanged. Existing stacks add their already-earned totals once, and the copy count grows without multiplying those totals again.

Ordinary integer stat rolls match DM2's `HQ` consolidation. Earned fractional Alpha bonuses are preserved rather than truncated. Fixed Patron bonuses, seasonal attributes, additional legacy badge attributes and merged Alpha Super Fortune totals remain earned. Consolidation occurs on the next completed mission; opening the game or reviewing rewards does not merge anything.

The final mission action saves the reward, consolidated inventory and timeline record in the primary save and backup together. A failed write restores the original live run and offers **TRY AGAIN**. Retrying or clicking old completion callbacks cannot award twice. Successful resets also refresh the Paw artwork immediately and restore Earth's character, platform, theme and backgrounds after an off-planet mission.

## Try it

Scenes load paused; **Resume mining** starts ordinary gameplay. Choose **Load first tracked run** before testing the following controls.

- **View timeline history** opens Statistics. **Add 1K earned coins + 10s** advances the real counters once and saves them. Refresh to inspect persistence.
- **Load veteran Alpha save** demonstrates the missing-history notice and a known minimum for current earnings.
- **Load 30 completed timelines** tests expandable records and the earlier-records button.
- **Load existing protected stacks** includes an old ×2 Patron, ×3 Poisoned Apple, another earned copy of each and an Alpha Super Fortune with 123,456 flat DPS. View the inventory before and after completing a mission: Patron becomes **×3, 45 Luck, 300 Patronage**; Apple becomes **×4, 95 Luck/Loot Find, 780 Holiday Spirit**. Alpha DPS remains 123,456.
- Select a badge, then **Play mission choice** to use the real Attack/Go Home buttons. After choosing, Skip reaches the production reward cards. **Review rewards · selected choice** is a shorter test path using the dropdown's choice. Complete every OK and close **YOU KNOW THE DRILL**, then inspect history/inventory.
- **Fail next mission save once**, followed by reward review, tests rollback. On **TRY AGAIN**, the old currency, inventory and history remain; a retry completes exactly once. Loading another preset cancels an armed failure. This control affects only that sandbox's next mission commit.

The first-run sample starts with two separate Patrons and three Apples. After its mission the protected tiles become ×2 and ×3, with 30 Luck/200 Patronage and 75 Luck/Loot Find/660 Holiday Spirit respectively. The ordinary Bronze Fortune becomes part of the Super Fortune through the existing prestige rules.

## Verification

- **22 CJS suites pass.** Four executed primary-source archive/reset outputs cover timeline numbers, wallet/earned totals, integer-second archives and both choice codes. Eight executed `HQ` fixtures cover source-ID grouping, fixed and seasonal items, badge types, Super Fortunes and repeated attributes. Additional checks cover fractional Alpha values, distinct identities, repeated stacks, numeric rejection, unchanged inputs, primary/backup failure and safe retry.
- All **28 client scripts and three inline scripts** parse. Startup rejects a missing history dependency before save access. Storage tests cover all four isolated namespaces and missing-bootstrap behavior. CRLF-aware and new-line whitespace checks pass.
- Muted native-browser checks cover all four new presets, actual Attack and Go Home choices, production reward review, reload before/after completion, current-run/offline accounting, stale completion rejection, failure/retry, fixed/seasonal/Alpha totals and source artwork. Desktop, 375px and 320px history, tools and Fortune details were inspected. Expanded records and older-page loading work without horizontal overflow.
- Browser regression checks pass for earlier offline/Searchdoge scenes, all eight prestige quotes and the real preservation payout, all six Bonus Coin claims and nearby Rick groups. Normal-save/preference sentinels remain unchanged. Primary/backup storage failures are exercised against the real SaveManager in unit tests; the browser preset uses its documented one-shot commit failure.

Primary source remains DM2 2.15's pinned bundle, SHA-256 `24948a089fc981326a2d6ad7a558cc766ca79c85ca11d3c18e976f8dc2a03764`. References: [archive/reset](/Users/yasin/Documents/Projects/DogeMinerCE/scratch/dm2-research/play-B7Micxas.pretty.js:41809), [choice](/Users/yasin/Documents/Projects/DogeMinerCE/scratch/dm2-research/play-B7Micxas.pretty.js:39602), [play clock](/Users/yasin/Documents/Projects/DogeMinerCE/scratch/dm2-research/play-B7Micxas.pretty.js:50142), [consolidation](/Users/yasin/Documents/Projects/DogeMinerCE/scratch/dm2-research/play-B7Micxas.pretty.js:51347). Frozen fixtures: [history](/Users/yasin/Documents/Projects/DogeMinerCE/tests/fixtures/dm2-timeline-history.json), [Fortunes](/Users/yasin/Documents/Projects/DogeMinerCE/tests/fixtures/dm2-fortune-consolidation.json). Baseline/evidence are in `scratch/checkpoint-4-baseline/` and `scratch/checkpoint-4-qa/`.

M13 royalties, story foundations, the Johnny/Altar choice and D08 timer persistence remain separate work. No commit or deployment.

### Accepted presentation follow-up · October 15

Timeline statistics now use inset cards, consistent type/spacing and all five planet palettes. Mission-return opacity cleanup keeps the idle Paw fully hidden while preserving its visible mining swing. Actual mission/press/release checks and fifteen desktop/phone planet layouts pass; evidence is in `scratch/checkpoint-4-followup-qa/`.
