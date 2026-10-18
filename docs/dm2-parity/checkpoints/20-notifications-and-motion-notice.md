# Checkpoint 20 — Notifications and Reduce Motion Notice

Checkpoint 19 is accepted. This checkpoint implements U10 and the requested warning for users whose system has Reduce Motion enabled. **61 original findings implemented, 41 pending, one intentionally omitted (U20), out of 103.** Stop for review before Checkpoint 21.

**Latest review update:** Notifications are 20% smaller, the red X is removed, and the default lifetime is 4.5 seconds (1.5 seconds shorter). The Reduce Motion heading moves left/down beside the small circular alert symbol. These are requested CE presentation choices; the source reference below retains its original six-second default. The staying accessibility notice still dismisses by clicking its message.

Open [Checkpoint 20](http://localhost:8011/play/?parityTest=checkpoint-20), then **Ctrl+\**. There are four feature choices and two buttons: Show feature and Close. The private test save is muted, isolated in tab session storage, and disconnected from account/cloud/analytics services. Normal saves and settings remain untouched.

| Feature | What to check |
| --- | --- |
| Reduce Motion notice | A persistent notice explains that some animations are reduced and identifies the device accessibility setting. Click the message to dismiss it. This preview works regardless of your actual OS setting. |
| Found upgrade notification | A source-style UPGRADE notice shows the found helper upgrade's artwork. Click its body to open and focus the saved upgrade slot. Letting it expire does not navigate or buy anything. |
| Story notification | The FASTER notice shows the source title, main line and green detail text. Check the frame, text and entry/exit. |
| Notification dismissal | A notice leaves automatically after 4.5 seconds. Click this message to dismiss it early. |

## Reduce Motion behavior

The game observes `prefers-reduced-motion` at startup and while the preference changes. When enabled, it shows a silent notice that stays until acknowledged. Acknowledgment survives reload in the same tab session, using a separate key from game saves. Turning the preference off removes the notice and resets that acknowledgment; enabling it again warns again. The notice is shown even if ordinary game notifications are disabled.

The warning never changes the system preference or forces animations on. Its own reduced-motion presentation uses a short opacity fade. The test preview neither changes the OS setting nor records acknowledgment of the real warning. No additional Settings checkbox or menu height is introduced.

## Source behavior and adaptation

The pinned main bundle is 982,083 bytes, SHA-256 `24948a089fc981326a2d6ad7a558cc766ca79c85ca11d3c18e976f8dc2a03764`, unchanged from the preceding live-source verification. Tests execute the shipped `fc.runTimers` and `fc.closePopup` methods for default/custom/staying lifetimes and callback semantics. The source defaults to 6,000ms, animates entry from scale 0.3 over 500ms with a 250ms fade, exits over 300ms, and removes after 700ms. The DOM presentation follows these sizes/timings, with responsive layout and reduced-motion opacity alternatives; no claim of identical GSAP interpolation is made.

The ordinary info frame is the existing 411×181 source asset. Notifications share one source anchor, newest above earlier notices, rather than creating a tall column. Desktop notices anchor inside the game panels at 328.8px wide; phones use 230.16px and top placement. Both are 20% smaller than the initial checkpoint. The private phone checkpoint banner is moved below the feature so it cannot obscure its title. No new glows or bitmap assets are added.

The original U10 audit inferred three artwork variants from configuration. This checkpoint verifies the live general atlas (HTTP 200): only `general/notification_info` ships. The quest/achievement texture paths return 404 and the story atlas has neither. All active ordinary `bc` callers use the info type. Compatible type names and text colors remain available, but dormant references do not justify inventing artwork or activating extra gameplay.

Title/info/details/icon fields use safe DOM text and recognized source color tags. Untrusted markup stays inert. A body activation runs `onClick`; a cross, timeout, replacement, overflow or cleanup does not. `onEnd` runs once. Source `biblip` plays once per ordinary notice through the existing sound setting. Staying system notices are not evicted by ordinary overflow.

The SearchDoge discovery transaction still saves the found offer before showing its notice. The action rechecks planet, epoch, offer and upgrade level; it opens CE's existing desktop/phone upgrades view and focuses the exact saved slot after the tab switch. No purchase, currency credit, item reroll or migration occurs. Existing FASTER story/news routing retains the source title and details without duplicating its sound.

## Verification

**48 CJS suites, 44 client scripts and three inline script parses pass.** Tests cover executed source callback/timer semantics, duplicate actions, safe markup, queue/preference handling, stale navigation, startup dependency guards, system preference changes, dismissal/reload, preview isolation and session-storage failure.

Muted private Chrome checks cover automatic reduced-motion detection, reload acknowledgment, off/on changes and the warning with ordinary notifications disabled. Actual found-upgrade activation focuses its saved slot while wallet, helpers, upgrade level and offers remain unchanged. Cross and stale-offer activation never navigate. The default timeout fully removes its node. Five simultaneous notices share the source anchor and clean up.

All 16 compact previews pass at 1280×800, 375×812, 320×568 and 844×390. Frames and text stay in bounds and the private banner does not cover phone notices. The final session records no script errors, failed local resources or account-service calls. Normal storage remains unchanged, audio is muted, the browser title stays `Dogeminer:CE`, and the timeline label remains blank for a first-timeline player.

Evidence is in `scratch/checkpoint-20-qa/`, including source verification, unit/syntax results, browser actions/preferences/responsive matrix and screenshots. Native browser capture failed with `Preview automation snapshot timed out after 15000ms.` and then `No preview automation host is available for snapshot`; owned tabs were closed and the checks completed in a separate muted Chrome session without a user profile. Initial navigation evidence is retained: focusing immediately found CE's destination still hidden during its 50ms tab transition, so focus now waits 80ms and rechecks context.

The 138-file pre-change baseline and all historical audit/source/checkpoint/follow-up hash dictionaries are preserved. The final implementation manifest has 137 files. Original CRLF files, including notifications, retain their line endings. Localhost remains on port 8011. No commit or deployment was made.

## Compact-notification review verification

Current follow-up checks pass all 48 CJS suites and 47 syntax parses. The source timer oracle still records 6,000ms; CE's explicit requested default is now 4,500ms, with custom and staying timers unchanged. The removed close button contributes no invisible hit target or extra keyboard stop. Clicking the body still acts once and dismisses the notice.

All 16 native-browser previews pass at 1280×800, 375×812, 320×568 and 844×390. Actual frame widths are 328.8/230.16px; headings and body text fit. The warning heading starts at 33% left/2% top with left-aligned text, matching the small circular alert's vertical center. Body copy remains readable at the smaller phone size.

Native timing samples prove the notice remains at 4.25 seconds, begins closing by 4.65 seconds and then removes without activating its action. Actual pointer clicks dismiss the warning and open the saved upgrade slot, preserving the exact wallet, helper count, upgrade level and offers. Normal storage remains untouched, audio muted, static title retained and novice timeline label blank. Evidence: `scratch/checkpoint-20-followup-qa/`; immutable 142-file baseline and current 137-file follow-up manifest. Original checkpoint hashes remain historical. The first native navigation briefly served the earlier page; a unique review URL loaded the new cache versions and the full native matrix then passed. No external-browser fallback was needed for this follow-up. Cache versions: styles108, notifications3, parity-testing40. Remain at Checkpoint20 for review.
