# Checkpoints 63–65: Settings, Mobile and Controller polish

Open [the compact checkpoint 65 sandbox](http://localhost:8011/play/?parityTest=checkpoint-65), then **Test tools** or **Ctrl+\\**. The default panel retains one dropdown, **Show feature**, and **Close**. Test storage is private to the tab, audio is muted, and cloud account initialization is disabled. Build: `beta-parity-65`.

## Review scenes

1. **Compact settings & patch notes.** All post-travel settings are unlocked. Layout and Value Update Rate remain adjacent and aligned, with shorter rows and single-line labels on desktop. The Supporter button fits below them. Read **NEW PATCH NOTES**, close the notes, and reload: the footer returns to **v0.1 (BETA)** with no underline. An available update still says **UPDATE AVAILABLE**. Controller D-pad moves through settings; left/right changes a dropdown, A activates, and B returns to the field.
2. **D.I.A. with controller or touch.** Play from Burt's first line through either Cateland choice. Controller A reveals a line separately from accepting a reply. D-pad selects replies and badges; B goes back or cancels the warning. The warning initially focuses **NO WAIT**. Start skips only previously seen, skippable presentation; it cannot bypass the Cateland decision. First missions retain their no-skip policy.
3. **Mission reward controls.** Review the three real rewards, then the saved timeline return. Holding A cannot carry into another reward. Each OK activates once; the next button is re-enabled and keeps keyboard focus when replacing the previous action. Completion writes one timeline record. This preview skips presentation only to make reward controls easier to inspect.
4. **Phone inventory & drawer.** Phone mode works on wide windows too. Browse or swipe the inventory, close it, and open Settings. Dropdowns align beside their labels, touch rows/selects are at least 44 px high, and Supporter is available. Landscape gives the drawer more content space; header swipes close it while content scrolling does not. Choose Automatic to return to the normal responsive layout.

The expanded historical review catalog remains available through `allChanges=1`. Checkpoint 63 and 64 URLs are also isolated and show this batch's compact panel.

## 63 — Compact settings and controller focus

Reduce desktop settings spacing and make both dropdowns 24 px high, with matching widths and single-line labels. Preserve the complete unlocked settings list. Browser checks cover all five theme styles at four window sizes; the Supporter button remains visible at scroll position zero.

A read patch-note button displays only the version. Unread notes retain **NEW PATCH NOTES**, and available updates retain **UPDATE AVAILABLE**. Remove underlining while preserving the separate unread dot, tooltip, keyboard access, focus indicator, save-before-update protection and reload guard. Read acknowledgment survives reload.

Controller settings now use the active Phone or desktop form and focus actual native controls. A toggles a checkbox once. Left/right changes enabled dropdown options. Switching Layout follows the same control into the new form and opens the Phone drawer when needed. B closes that drawer and releases settings focus so normal mining can resume.

Active inventories and Supporter consume controller input before field actions, purchases or tab changes. B closes them and restores the previous focus context. Remove delayed inventory-focus timers that could steal focus after closing. Nested confirmations take priority over their parent modal. The settings/modal browser matrix includes Phone on a wide window, Tablet on a narrow window, layout migration, nested confirmation and rapid inventory closure.

## 64 — Complete D.I.A. controller route

Route the brief, warning, cutscene choice and rewards separately from Moon launch and field controls. Every new root or action set consumes its opening frame and tracks button release, so a held input cannot advance a fresh action. A reveals a typing sentence separately; warning B cancels, brief B goes back, and required decisions remain explicit. Right-stick vertical input can scroll long mission content.

Badge cards and skip actions use native buttons. Unchosen badge confirmation is truly disabled, chosen badges expose their pressed state, and re-rendering retains badge focus. Reward actions disable after activation and receive one-use listeners; replacement buttons re-enable and preserve focus. Existing payout, rollback, timeline and source-timing rules remain unchanged.

The browser drives the production controller poll loop with a virtual Gamepad API device, including both complete choices at four sizes, all three rewards, held A, warning cancellation, blocked background controls and the saved timeline/choice. Repeat Start skips retain the required decision. This is a software input test, not physical controller certification.

## 65 — Phone controls and drawer

Use compact label/select columns while keeping 44 px touch targets and 16 px select text. At narrow phone widths, icon tabs retain 44 px targets and their accessible image labels instead of clipping Settings off the edge. Add the existing Supporter action to Phone Settings. Give the drawer bottom/side safe-area padding; on short landscape windows its height is capped at 72dvh/360 px instead of leaving only a small content strip. Preserve native vertical scrolling and the existing inventory/header gesture classification. An open panel dialog hides the fixed drawer and its toggle without changing the selected tab or scroll position; closing it reveals the same Settings view. This fixes the drawer intercepting the Supporter Close button.

Trusted Chromium touch covers portrait phones, short/wide Phone profiles and tablet-width Phone UI. Check settings activation without mining, durable value-rate changes, Supporter open/close, aligned touch controls, header close, content scroll, and inventory browsing without equipping. Safe-area CSS is present; behavior on physical notched devices remains a device check.

## Titan video and remaining work

The user reported that rkn confirmed the Titan video is still in progress and the source route is a placeholder. **V03 is deferred upstream**, and CE does not need a Titan video yet. Keep the original audit evidence. Do not spend another checkpoint attempting to locate or implement it unless upstream finishes it or the user asks again.

V01 physical high-refresh/crowded-field verification remains open. Authenticated cloud services, native platform behavior and physical controller/device feel are not certified by these local checks. Continue Mobile/Controller polish where further defects are observed, then the CE roadmap: Pickaxe Trees before wearable equipment. Web Wide Layout codes remain removed.

## Evidence

79 CJS suites and 73 client/inline parses pass. Browser evidence includes 27 settings/focus/read-note cases, 2 virtual-cursor modal cases, 8 complete controller mission paths plus repeat skip, 5 trusted-touch layouts, 8 local recovery cases and 12 visible reward layouts. The compact panel retains four choices and two buttons.

Reusable browser scripts, screenshots and results are under `scratch/checkpoint-63-qa/`, `scratch/checkpoint-64-qa/` and `scratch/checkpoint-65-qa/`. The pre-batch snapshot is `scratch/checkpoint-62-followup-baseline/`. Checkpoint records 1–62 and original source/audit fields are preserved. The current summary and implementation manifest are in the checkpoint 65 folder.

The product-native preview twice returned `Preview automation snapshot timed out after 15000ms.` The documented separate muted Chrome workflow was used. Controller flow QA advances a virtual clock by production phases and waits for actual CSS entrance visibility before selecting controls. It must allow the full 3.5 second whiteout/reward hold. Early checks froze CSS entrance visibility, released A before testing a hold, or began a narrow-screen swipe on the tooltip Close button; those test setup errors are corrected. The real product issues found during touch QA were the drawer covering dialogs and the toggle retaining the old landscape offset. Real-time reward visuals and local primary/backup write-failure checks complement the controlled-clock mission run.

Files remain local; no commit, deployment, ordinary player save, external account or authenticated cloud write is part of this batch.
