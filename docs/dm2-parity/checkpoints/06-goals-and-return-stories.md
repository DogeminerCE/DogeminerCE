# Checkpoint 6 — Goals, returns and news

> **October 15 follow-up:** Settings density, NewsDoge scrolling/sound/exact reactions and panel-centered eased popup corrections are delivered in Checkpoint 8. The earlier U01 artwork gap is resolved. [Checkpoint 8 review](08-rig-contact-and-titan.md).

**Implemented and tested · October 15, 2026.** S02–S07, Q01 and Q02 are delivered. **At its delivery, 24 of the original 103 implementation findings were complete; 79 remained.** Checkpoint 5 is accepted. U01's functional NewsDoge preview is included, with the exact annoyed-face artwork still tracked below.

**Review status:** deferred by the user; review this together with [Checkpoint 7](07-planet-discoveries.md). Checkpoint 6 has not been accepted.

Open the [muted Checkpoint 6 sandbox](http://localhost:8011/play/?parityTest=checkpoint-6). **Ctrl+\** opens its compact menu: choose a feature, then press **Show feature**. The menu closes to expose the game; Ctrl+\ reopens it. Showing a feature again resets only that test scene. There are no boundary-test or failure controls in this menu.

| Feature | What to check |
| --- | --- |
| **First Moon goal** | Close **TO THE MOON!**. The rocket card flashes after 800ms; the mining hint appears after 2.5s. Click/tap the rock to dismiss the hint. |
| **First Bonus Coin** | Collect the coin that appears. **SUCH BONUS** explains the first boost. Closing it retains the original boost deadline. |
| **Timeline 2 return** | **MISSION SUCCESSFUL** explains the first return. Close it to see Doge arrive; a separate **FASTER!** SearchDoges notice follows after 16s. |
| **Timeline 3 return** | **WELL WHAT NOW?** uses the repeat-history message and announces the new settings. |
| **Timeline 4 return** | **UHH OKAY** uses the fourth-timeline message. |
| **Later timeline return** | **YOU KNOW THE DRILL** begins on timeline 5. |
| **NewsDoge report** | The scene crosses the real 475-earned-coin threshold. Watch the scrolling report and click NewsDoge for the temporary reaction. |
| **Story and hint settings** | Opens the real timeline-3 Settings panel. Hints, Story Popups and News have independent saved switches. |

The sandbox uses a separate per-tab session namespace, with audio muted and cloud/account/analytics initialization disabled. It does not copy or write normal player saves or preferences. Checkpoint URLs 1–5 retain their own namespaces and earlier diagnostic menus. The normal game's **Open checkpoint sandbox** now opens checkpoint 7; this direct Checkpoint 6 URL keeps its own menu and saved test scene.

## Production behavior

The first goal requires timeline 1, Earth and no owned Doge Kennels. Its source artwork, text and emphasis use the existing planet-colored story frame. Closing schedules the source's three rocket-card flashes and starting hint. An already-mining player gets no starting hint; disabling **Show Hints** dismisses it. The hint has no mouse/touch hit area. Delayed tasks are canceled when the save is replaced.

The Bonus Coin explanation requires the first lifetime claim and first-offer flag, on timeline 1. It uses the source's **+50% income for 60 seconds** explanation. Acknowledging the story neither grants another coin nor restarts the actual buff. Later claims and later timelines do not repeat it.

Return stories require Earth, no Kennels, and no active mission/cutscene. Timeline 2 uses `newtimeline`, timeline 3 `newtimeline3`, timeline 4 `newtimeline4`, and timelines 5+ `newtimeline5`. The registered-but-unused source `newtimeline2` remains dormant. A real mission saves its pending return together with its rewards and timeline reset. Failed acknowledgment keeps the story and waiting arrival intact for **TRY AGAIN**. Successful close starts the arrival once; the Paw remains hidden while idle. Refresh resumes an unacknowledged return without paying mission rewards again. Loading another save cancels old arrival/tutorial callbacks.

**Enable Story Popups** and **Enable News** appear from timeline 3, matching the source. **Show Hints** is independent and available earlier. Preferences persist in both desktop and mobile Settings; failed saves restore the old checkbox value. Suppressing ordinary stories still commits their completion effects. Return stories and Welcome Back retain their special visibility/receipt behavior. **News** controls the NewsDoge ticker; the separate faster-SearchDoges notification follows the source's independent notification path.

## NewsDoge preview and remaining art gap

The preview implements all **22 source report criteria**, source report text, five planet palettes, the last-three pending queue, startup-backlog discard, a 500–3,499ms delivery delay, 36px bar, label sizing, scrolling at 100px per 1.3 seconds after a 1.5-second lead-in, reporter entrance and saved shown IDs. Triggers use earned coins and maximum reached planet in the current timeline. Grouped helpers count by actual owners. Travel/save replacement/prestige clear stale presentation; turning off News clears the ticker. Reduced-motion mode presents readable stationary text.

**U01 remains Partial:** the two exact `newsdoge_annoyed_1` / `newsdoge_annoyed_2` sprites are absent from the local assets, and the current network blocks the live DM2 site. The original available reporter image currently uses two alternating 700ms motion reactions. Their source expressions still need the original artwork before U01 is counted complete. No substitute artwork was generated and no blocked-site access was bypassed.

## Verification

- **27 CJS suites pass**, with **30 client scripts and three inline scripts** parsing. New frozen primary-source evidence contains six stories, 66 trigger outputs, all 22 news reports, 105 news-eligibility vectors, five palettes and executed startup/bounded-queue cases.
- Targeted tests cover durable close, both save-key failures/retry, stale callbacks, exact follow-up boundaries, independent preferences, atomic mission/return state, reload, mandatory/suppressed stories, unchanged Bonus Coin deadlines, source queue limits and startup discard.
- Muted browser checks cover real compact-menu controls, actual first mining/Bonus Coin triggers, all four return messages, failed close/retry, pending return refresh, real arrival/idle Paw, the real 16-second SearchDoges notice, **21 popup layouts** across desktop/375px/320px/landscape, production desktop/mobile preferences and all five news palettes. Additional preview checks verify clean scenes, restoration of the Shop/field and clipped phone tickers.
- Earlier income/SearchDoges, prestige reward preservation, Bonus Coin/Rick and royalty workflows are regression-tested. Missing sandbox/story/news modules and unsupported saved story versions stop boot without overwriting progress. Normal save/preferences stay unchanged; no sandbox cloud-service requests or page errors occur.

Evidence and scripts: `scratch/checkpoint-6-qa/`. The pinned DM2 web 2.15.0 source and historical audit/checkpoint hashes remain unchanged. No commit or deployment is included.
