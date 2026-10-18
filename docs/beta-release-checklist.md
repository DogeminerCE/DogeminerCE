# Beta v0.1 release checklist

- [x] Full Alpha v0.055 → Beta v0.1 in-game notes: 93 player-facing bullets in eight sections, all 101 completed parity entries covered. Existing formatting retained; text rewritten in the requested voice.
- [x] Remove Pickaxe Trees and their bonuses/runtime/save hooks. Hide Hats from both layouts and navigation until after v0.1.
- [x] Verify 117 feature previews at two sizes, 81 test suites, 191 functional browser cases, four regular-gameplay guest cases, item/helper sprites and project images. [Release report](dm2-parity/checkpoints/69-beta-release-review.md), [results](qa/beta-v0.1-results.json).
- [x] Prepare the [Discord announcement](discord-beta-v0.1.md) and four ready-to-copy parts; no messages are sent automatically.
- [x] Add clean-checkout test fixtures, release validation and CI. Build/version/feed agree on `beta-v0.1`.
- [ ] Complete physical controller/device/high-refresh certification where appropriate; V01 remains open. Titan video is deferred until rkn finishes it.
- [ ] Configure/rotate the Ko-fi secret before separately deploying the tested webhook fix. [Backend instructions](../functions/README.md). No Functions deployment is part of this Git push.
- [ ] Confirm production web rollout separately from repository publication.
