# Checkpoints 66–68 — Pickaxe Tree review

Open the [compact checkpoint 68 sandbox](http://localhost:8011/play/?parityTest=checkpoint-68), then **Test tools** or **Ctrl+\**. Choose a feature and press **Show feature**. The panel retains one dropdown, Show feature and Close. All game storage is private to this tab, audio is muted and cloud account initialization is disabled. Build: `beta-parity-68`.

The four presets are:

- **Controller shop, upgrades & travel:** native upgrade currency actions, third SearchDoge slot, Phone shop paging/drawer and discovered travel gates.
- **Pickaxe Tree · first timeline:** inspect nine skills, costs and prerequisites; learning is locked until the first D.I.A. mission.
- **Pickaxe Tree · choose skills:** 65 test diamonds and an empty tree. Buy skills and reload to check persistence. Re-selecting this preset deliberately replaces the private fixture.
- **Pickaxe Tree · learned skills:** all nine skills already learned in a clearly seeded test fixture; review totals and branch appearance.

[All changes](http://localhost:8011/play/?parityTest=checkpoint-68&allChanges=1) retains historical controls, seasonal scenes and earlier fixes. The new tree is a CE feature; it does not change the original parity classifications or source/audit pins. [Checkpoint 66](66-controller-shop-and-travel.md) covers controller navigation. [Checkpoint 67](67-permanent-pickaxe-tree.md) records balance and save semantics. Wearable equipment is the next CE roadmap item; Titan video remains deferred while rkn finishes it.

The tree opens from Upgrades on both layouts. Its native buttons support touch, keyboard and controller. Tab stays inside the dialog, Escape/B closes it and focus returns to the opener. D-pad/RB/LB browse the controls and scroll skills into view; A learns an available skill. Unavailable skills still expose their cost, effect and prerequisite. Mining, travel and shop input remain isolated. Delayed panel focus yields to the open tree.

The modal uses actual viewport dimensions, including when a tiny browser window is forced into Desktop/Tablet layout. Branches become one column in narrow windows. The title, wallet and Done action stay outside the scrolling skill area. Prices include the existing diamond artwork, and learning results/save failures have a live status message. Every purchase action is at least 44 px high before any deliberate game-canvas scaling.

Verification: **80 CJS suites and 74 client/inline parses pass**. Browser evidence covers **6 layout cases, 13 controller cases, 11 recovery cases and 2 deferred-focus cases**. Layouts include 1440×900 Automatic, 768×1024 Tablet, 375×812 and 320×568 Automatic, 844×390 Phone, and 320×568 forced Desktop. Trusted taps buy four skills, exhaust the prepared 65 diamonds, retain original item rolls, avoid mining and survive reload in each case. Keyboard focus containment and the compact four-choice/two-button menu are checked. Screenshots are under `scratch/checkpoint-68-qa/`.

The browser review caught a zero-height skill area when the forced Desktop canvas was scaled down on a phone. The tree now anchors to the viewport and uses container-based narrow styling. Recovery testing found no lost currency or duplicate progression. Test setup was also corrected to force a deliberately unavailable tap, distinguish the slot unlock from the diamond-upgrade button that shares its class, and wait for the production popup entrance before manual controller frames.

Evidence and reproducible scripts are in `scratch/checkpoint-66-qa/`, `scratch/checkpoint-67-qa/` and `scratch/checkpoint-68-qa/`. The pre-batch snapshot is `scratch/checkpoint-65-followup-baseline/`. Native preview snapshots timed out twice with `Preview automation snapshot timed out after 15000ms.`; the documented muted standalone Chrome workflow was used. Existing checkpoints 1–65 and source/audit fields remain unchanged. V01 physical controller/high-refresh/device verification remains open. Ordinary player storage and external accounts were not changed. No commit or deployment was made.
