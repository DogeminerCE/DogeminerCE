# Beta v0.1 — Release review

The release build is `beta-v0.1`. The [compact review sandbox](http://localhost:8011/play/?parityTest=checkpoint-69) keeps four choices and two buttons; [all changes](http://localhost:8011/play/?parityTest=checkpoint-69&allChanges=1) retains the full feature/seasonal review. Storage is isolated per tab, audio is muted and account initialization is disabled in these previews.

The October 18 user decision supersedes the Pickaxe Tree work in checkpoints 67–68. The tree's launchers, module, effects, persistence hooks, controller routes and presets have been removed. Older saves containing the experimental field load with the same currency balance, receive no tree bonuses and omit the field on resave. Hats are hidden from both normal layouts and excluded from controller/tab navigation. Wearable equipment ships after v0.1; the tree design is on hold. Titan video remains deferred while rkn finishes it.

The review covered every available feature preview: **117 previews at desktop and Phone sizes, 234 renders**. These are paired with **81 deterministic test suites**, **191 functional browser cases**, four regular-gameplay guest cases with external services blocked, a complete item/helper image catalog check and image-file verification. The [feature matrix](../../qa/beta-v0.1-feature-matrix.json) and [results](../../qa/beta-v0.1-results.json) record the coverage.

| Area | Verification |
| --- | --- |
| Mining, balance, criticals and income | Independent pinned DM2 function oracles; item/fortune stats, rocket prices, helper tiers, passive/offline income, critical records and field currency ledgers |
| Progression and stories | All five worlds, known/unlocked routes, goals, clues, return stories, royalties, Altar/Robo-Yoga, blueprints, Reallyhardium, Mystery evolution and saved story queues |
| D.I.A. and time travel | Eight full controller mission paths across four sizes, both choices, warning cancellation, held-input guards, three one-use rewards and repeat skip |
| Loot, tools and visitors | Full 99-bag payout, complete receipts, saved bag/diamond stacks, helper pickup/seeking, Auto-Pickup, Buy Max, dual wielding, fusion, drills, Cate Thief and real-time Rick expiry |
| UI and controls | 27 settings/focus/read-note cases, virtual cursor, native currency/slot purchases, hidden release scope, input isolation, first/post-travel settings and keyboard/touch/controller routes |
| Mobile and world presentation | Five trusted-touch layouts, 100 world/theme/layout geometry cases, 12 visible reward screens, all seasonal scenes, egg locations and golden reward |
| Saves and services | Migration/import fixtures, protected/custom items, malformed saves, primary/backup/recovery rollback, replay guards, cloud priority/account races, auth UI, full reset and Ko-fi handler validation/retry tests |
| Assets and startup | 528 literal file references, 561 generated item/helper sprite references, 89 pickaxe/125 Fortune templates, 3,006 project images, partial/malformed catalog failure before save application |

The polish fixes found in this pass are:

- Phone settings now include controller indicators, helper placement and controller-input disabling, using the existing native handlers. Controls stay synchronized with Desktop. Rate selects use the same validated getter.
- Sign-in/out updates the existing Phone cloud controls without resetting focus or scroll. Xbox restrictions survive Phone form rebuilds and auth updates, with one local-save notice per form.
- Corrected stale background/pickaxe/upgrade image paths, including the Mars/Jupiter fallback backgrounds.
- Repaired the checksum bytes in 32 PNG color-profile chunks. Pixel/compressed image data is unchanged; all project images now verify.
- Missing or malformed item templates stop startup before a save is loaded or replaced. Real browser tests preserve the exact prior saved bytes for HTTP-failure and invalid-template responses.
- Ko-fi deliveries now commit supporter updates with an idempotency receipt. Invalid payloads/amounts and failed transactions are tested without processing a real payment. Its formerly hardcoded token is now a bound secret. **The source fix requires configuring/rotating that secret before a separate Functions deployment**; see [the backend instructions](../../../functions/README.md). No function deployment or remote account write was performed during this review.
- Tests no longer depend on local scratch folders. Pinned reference fixtures, a root test runner, a release validator, reusable browser suites and CI verification are included.
- Windows packaging now reads an explicit manifest version instead of parsing the game label. Beta v0.1 uses native package `1.0.0.0`, above Alpha's `0.55.0.0`, with a positive major and zero Store revision. The validator checks this separately from the unchanged `v0.1 (BETA)` game label. See [Microsoft's version rules](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/package-version-numbering).

The in-game notes retain their existing section/bullet formatting, with 93 rewritten player-facing changes mapping all 101 completed parity entries to their bullets. The [Discord announcement](../../discord-beta-v0.1.md) uses the requested style; four [copy-ready parts](../../discord/beta-v0.1-part-1.txt) stay below the standard message limit. Hats and Pickaxe Trees are not advertised as released features.

## Reproduce

```sh
npm ci
npm test
npm run check
python3 -m http.server 8011
```

With that server running, use another terminal:

```sh
npx playwright install chromium
npm run test:browser
npm run test:browser -- features catalog guest
```

Browser suites use installed Chrome on macOS or Playwright Chromium elsewhere; `CHROME_BIN` overrides the executable and `CE_QA_OUTPUT` controls evidence output. Tests run sequentially with muted audio. The regular-gameplay guest checks use disposable contexts and block external requests; preview tests use isolated saves. The CI workflow runs deterministic tests and the release validator without an account.

The initial broad sweep had three startup-polling timeouts and three `image.decode()` aborts while sprites changed frames. Rechecks with timer polling and current-image validation passed all six; no game bug is inferred from those harness races. Recovery QA waits for enabled, visibly entered production reward controls, and touch metrics exclude the intentionally hidden Hats button. Original checkpoint records 1–68 and original source/audit fields are preserved. Screenshot/evidence detail remains under local `scratch/release-review/`.

Physical controller/device/high-refresh certification and live authenticated cloud/payment delivery are not claimed by these software checks. V01 remains the physical verification queue; V03 remains upstream-deferred. Native preview snapshots timed out twice, so the documented muted Chrome fallback was used. Ordinary player storage was not changed.
