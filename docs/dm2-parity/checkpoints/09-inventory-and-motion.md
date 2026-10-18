# Checkpoint 9 — Inventory and motion

**October 15, 2026 · Accepted by user; Checkpoint 10 authorized.** Includes the requested NewsDoge/popup corrections and U02–U05/M28. **43 of the original 103 implementation findings delivered; 60 remain.**

Open the [muted Checkpoint 9 sandbox](http://localhost:8011/play/?parityTest=checkpoint-9). Press **Ctrl+\**, choose a feature and press **Show feature**. Its only other button is Close. Replaying a feature resets its private scene, inventory filters, scroll and mobile stats visibility.

| Feature | What to review |
| --- | --- |
| NewsDoge size & motion | The smaller report sits higher in the field. Its strip fades in, the reporter slides in after a delay, and slides away as the report fades out. Click/tap the reporter for its two annoyed reactions. |
| Popup zoom in & out | Review the compact Mars Beta roundup, then Welcome Back. Both center on the visible game panels and visibly ease open and closed. |
| New item badges | Two new pickaxes and two fortunes set separate counters. Open each inventory to clear only its badge. Refresh to check that the acknowledgment stays saved. |
| Complete stat totals | Review Mystery Bonus, the Staff's total-DPS multiplier and summed flavor attributes. Scroll the stats sidebar; on phone it opens automatically in this preview. |
| Stat explanations | Stats Explained opens expanded. Wow improves new loot rolls; Loot Find improves loot chances; the stale base-5% critical claim is removed. Mystery stays cryptic. |
| Attribute colors | An explicitly labeled test fortune displays sand Higher Ground, blue Discipline/Dancing, cyan Helper Morale and dark-blue Mystery. Hover/tap it for details. |
| Restored Mystery fortunes | Inspect the four restored items. Close inventory and open the ready Mystery Box to review its two-prize animation. This interactive preview uses normal random prizes; separate automated tests select each restored candidate deterministically. |

The sandbox uses a separate per-tab session save. Normal saves/preferences are never copied or written, cloud/account/analytics initialization stays disabled, and all test audio is muted. The ordinary game's Open checkpoint sandbox button now opens 9. Older checkpoint URLs and namespaces remain available.

## Corrections verified against DM2

DM2's desktop canvas is **1344×756** with a **770px logical left field**. At the observed 1280×800 viewport its actual canvas is 1016×571.5: a 36px logical news bar displays at approximately **27px**, not 36px. CE now fits the logical news geometry to its own panel dimensions. At the standard 630×590 CE field, the bar is **28px**, reporter approximately **66×74px**, and top approximately **187px** below the panel's inner origin. Phone geometry uses the source 370px logical width.

The source curves and phases are retained: 600ms sine fade in; 900ms reporter delay then 500ms circular movement; 100 logical pixels per 1300ms of scrolling after 1500ms; 1000ms after completion, then a 400ms circular reporter exit during the 600ms fade out. The clipped reporter, font/label dimensions, three original expressions, 700ms reaction reset and news1 sound remain. Resize observers and animations are disposed when a report is replaced.

Shared popup entry now zooms from **0.8 to 1 over 280ms**, with a **200ms** eased close. Reduced motion uses a smaller **0.96 to 1** zoom and **160ms** fade instead of the previous 1ms jump. Position remains relative to the two visible game panels. Save acknowledgments and input/focus cleanup keep their existing transaction order; only visual removal is delayed.

## Inventory behavior

- Bag/Mystery grants and newly granted Patron badges mark their inventory unread. Counts save with the items, clear independently on inventory visits and retry after a rejected clear write. Existing saves without counts start at zero. Default/Paw items and silently restored Patron perks are not new loot; prestige clears counts for the retired inventory. Counters display 99+ without truncating the saved count.
- Effective core totals now include Mystery and total DPS. Every other rolled attribute is summed from the equipped pickaxe and all fortunes, using legacy aliases and correct signs/units. Unequipped pickaxes are excluded; combined fortunes' already-summed bonuses are counted once. Other attributes are explicitly labeled as flavor with no mining effect. Imported/custom labels render as plain text.
- The complete **33-attribute** source metadata and color palette replace the limited fortune name switch. Fortune hover/touch details and loot reviews use the same palette. Pickaxes retain DM2's green Equip lines. Existing planet styling remains on the totals sidebar.
- **Dogecoin Mining Site Map, Enchanted Red Gem, Enchanted Green Gem, Huge Enchanted Green Gem** now have loaded templates, original local art/descriptions and source rarities/default rolls. All seven special Mystery fortunes resolve across every reached planet/tier pool. The four restored items stay outside ordinary natural-bag pools. Existing kind selection, cooldown, double-prize cycle and earned/fixed/Alpha-merged bonuses are unchanged.

## Evidence

The live native source fetch still returns **982,083 bytes**, SHA-256 **24948a089fc981326a2d6ad7a558cc766ca79c85ca11d3c18e976f8dc2a03764**. The fixture executes the pinned attribute/fortune literals rather than inferring missing data from CE. Original audit and historical checkpoint hashes remain intact.

Targeted QA covers intermediate visible entry/exit frames in ordinary/reduced motion, actual reporter displacement, desktop/phone/short geometry, separate persisted unread counts, rejected-clear retry, old/malformed count data, stat alias/sign/fraction aggregation, all 33 descriptors/colors, equipped-only and combined totals, and actual hover/touch colors. Each restored fortune passes the real Mystery pool, opening animation, claim and refresh with exactly one saved award on desktop and phone.

The real Ctrl+\ menu passes **28 previews across four viewports**, with seven choices and two buttons. Shared popup checks cover **24 layouts**, failed acknowledgment, interrupted close/reopen/reset and nested focus recovery. Dogebag/Mystery checks retain shaped, panel-sized backdrops. All **30 CJS suites**, **32 client scripts** and **three inline scripts** pass. All **seven earlier browser regression suites** pass: actual prestige/earned-item preservation, income/SearchDoges, royalties, fresh player, bootstrap, Checkpoint 7 (28 previews/32 layouts) and Checkpoint 6 (eight flows/21 layouts/five themes). A historical default-link assertion was updated to 9, an old DOM mock gained setAttribute, and an initial factory-readiness timeout passed on an isolated retry with explicit timeout/diagnostic handling. Initial results and retries are retained. The **98-file** implementation manifest and results are in `scratch/checkpoint-9-qa/`.

Native preview was used first. Repeated snapshot/evaluate timeouts required isolated muted Chrome for visual QA; native source fetching remained available. Only the two tabs opened by this task were closed. Localhost stays on **8011**. No commit or deployment is included. Stop here for user review before Checkpoint 10; unresolved Johnny/Altar and other decisions remain separate.
