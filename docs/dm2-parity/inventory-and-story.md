# DM2 inventory and story parity audit

> **October 14 follow-up:** Use [remaining-parity-backlog.md](remaining-parity-backlog.md) for current missing/partial status. Its source-and-caller audit identifies dormant bonus-tier stories and corrects remaining progression/reward findings; the inventory work documented here remains present.

Checked 2026-10-13 against the current DM2 2.15 browser build, `play-B7Micxas.js`. Primary references: [live game](https://dogeminer2.com/play/), [current shipped JavaScript](https://dogeminer2.com/assets/play-B7Micxas.js), and [official 2.15 release notes](https://blog.dogeminer2.com/Patch-Notes-2.15/). A readable local copy is `scratch/dm2-research/play-B7Micxas.pretty.js`; minified function names and asset URLs are specific to this build.

Research used muted browser tabs. DM2 sound/music/rock sound flags were disabled, Howler was globally muted at volume zero, and media playback was suppressed. Any experimental player state was held in memory with `game.dontsave = true`; no imported or downloaded save was written to DM2.

## Confirmed inventory presentation

The live runtime exposes the five rarity palettes below. The card renderer `Jg` uses 200×200 logical pixels, 12px corners and a 2px rarity border, with a radial highlight. These are game coordinates: their on-screen size follows DM2's canvas scaling.

| Rarity | Main color | Border / tooltip color |
| --- | --- | --- |
| Common | `#c2c2c2` | `#959595` |
| Improved | `#10d339` | `#057415` |
| Rare | `#2d94fc` | `#3651c5` |
| Epic | `#f049ff` | `#9012b5` |
| Legendary | `#ffbd49` | `#c58736` |

The tile itself contains the item art and its name. Pickaxe art rotates 24°; fortune art stays upright. Names are white, approximately 18px, with a 4px rarity outline along the bottom. Protected fortunes have an additional badge. An equipped pickaxe receives a distinct outline and banner; it retains its rarity background.

The `Qg` details renderer uses a dark rarity panel adjacent to the tile, with a 200ms fade. It contains rarity/type, an orange coin value for pickaxes, an italic description, and stat lines. Pickaxe modifiers carry an equip prefix and green text. Fortune modifiers use attribute colors: luck green, loot purple, wow pink, crit/helper income yellow, mystery blue, love red, and miscellaneous attributes white. A stat gets a percentage only when its own metadata says it is a percentage; rocket discounts retain their minus sign. DM2 2.15 also shows a colored comparison pill beside the pickaxe's click value, relative to the equipped item's base click value.

Desktop item hover rises 4px, scales to 1.035, adds a soft shadow, and follows the pointer with up to 7° tilt. DM2 suppresses this animation on phones. Phone details are shown below the active item and remain available by tapping. Fortunes are passive; tapping them never equips them.

DM2's inventory is a small horizontal carousel, normally three desktop cards and one phone card. CE retains its searchable grid, filters, sort controls, stats sidebar, and controller navigation. The visual changes here apply the confirmed card palette and details hierarchy within that existing system.

## CE changes made in this pass

- Square rarity tiles with larger art, outlined names, and equipped/protected badges.
- Hover and keyboard/controller focus reveal item details. Clicking a pickaxe still equips immediately. Touch tapping reveals full details as well as retaining that equip action; fortunes remain passive.
- Details live outside the inventory's scrolling elements and are clamped to the viewport. On touch layouts they become a dismissible, scrollable lower panel. Closing, filtering, or rebuilding the inventory dismisses stale details.
- Base-DPC comparison pills use the current equipped pickaxe. Every rolled stat retains its stored sign/percentage metadata. Cosmetic stats remain visible without claiming they affect gameplay.
- The existing total-stat values remain CE's actual calculations. The additional explanation panel describes current CE behavior; it does not claim DM2's balancing formulas are already applied. Mystery remains unexplained in the player-facing UI.

## Story and tutorial audit

Directly encountered: the first-Earth rocket introduction appeared after the muted DM2 game initialized. It tells a new player the Moon rocket target and its 50,000-coin price. Other rows below are verified from the shipped story catalog and criterion callbacks, rather than claimed as completed playthrough observations.

| Event / DM2 story IDs | DM2 trigger or role | CE parity status |
| --- | --- | --- |
| `tothemoon` | First timeline, Earth, no kennels; closing schedules the rock-mining hint | CE character entrance exists, but this rocket-goal popup and persistent starting hint were not found |
| `newtimeline`, `newtimeline3`, `newtimeline4`, `newtimeline5` | Distinct Earth returns for timelines 2, 3, 4, and >4, while off mission | CE uses the same recurring return popup after every completed mission; early-return variants are missing |
| `newtimeline2` | Registered in the story catalog | No trigger found in the inspected current criterion table; do not implement simply because it is listed |
| `bonus`, `newbonus1`…`newbonus5` | First bonus pickup and subsequent bonus tiers explain boosts and durations | CE has tier-unlock notifications, but no corresponding first-pickup explanation or detailed tier-popup sequence was found |
| `moon1`, `mars1`, `jupiter1` | Arrival explanations for new locations and their mining setting | CE travel exists; matching story dialogs were not found |
| `moon2`, `marsdraw`, `foundbp` | Discovered map, drawing, and blueprint story artifacts | Matching CE artifact story flow was not found |
| `moon3`, `mars2`, `mars3`, `titan1`, `titan2` | Helper/upgrade conditions announce discoveries and open the next travel route | CE unlock gating exists, but these narrative callbacks were not found |
| `timemachine` | Rig discovery after Mars progression or a later visited location | CE rig unlock logic exists; matching announcement was not found |
| `dia` | Rig owned, at least 11 seconds at the location, not previously contacted | CE has the mission brief and Dogetalkie, but matching contact-introduction persistence was not found |
| `cateminer_kittens`, `hitsong`, `foundup1`, `figurebp` | Thief reward, DJ milestone, and Titan progression rewards | Check CE's reward and unlock triggers separately before adding their story explanations |
| `welcomeback` | Offline earnings report, normally delayed three seconds after startup | Matching CE report was not found; offline credit and popup parity are separate questions |
| First diamond discovery | 2.15 replaced the large popup with a short discovery toast | CE still uses its first-find explainer modal. This is a deliberate follow-up decision; the claim-animation change alone does not switch the tutorial design |
| First loot container | Container introduction and reward reveal | CE's first-container flag is saved and later opens skip the introduction; this part already has the relevant persistence |

The live hint catalog is not a list of active tutorials: several old hints are explicitly marked removed, including helper purchase, DPS, rock toughness, upgrades, location switching, loot, and pickaxe inventory. The retained catalog includes the starting mining hint and intruder alert. Restore an old hint only as an intentional CE feature, not as assumed current DM2 parity.

DM2 stories are queued, record seen state, and execute reward/unlock callbacks even when ordinary story popups are disabled. Timeline-return and offline-report dialogs have special exceptions to that setting. CE should use a centralized queue and saved per-story IDs before adding the missing sequences; otherwise simultaneous travel, reward, and mission events can overlap or repeat after refresh.

## Validation and limits

JavaScript syntax checks pass. A muted, isolated CE browser session rendered five temporary sample pickaxes covering all rarity colors. The collaborative browser's snapshot endpoint subsequently timed out and its automation host intermittently disconnected; desktop and mobile visual verification was therefore handed to the parent agent's already-muted native browser. The inventory source and DM2 runtime palettes were read successfully; this is not a complete DM2 progression playthrough.
