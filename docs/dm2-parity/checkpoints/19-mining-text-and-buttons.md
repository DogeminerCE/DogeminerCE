# Checkpoint 19 — Mining text & buttons

**October 16, 2026 · Ready for review.** Implements **U09**, plus mining-text source parity. **60 findings implemented, 42 pending, one intentionally omitted (U20), out of 103.** Stop before Checkpoint 20.

Open the [muted Checkpoint 19 sandbox](http://localhost:8011/play/?parityTest=checkpoint-19), press **Ctrl+\**, choose a feature and press **Show feature**. Four choices, two buttons. Normal saves/preferences remain separate; account, cloud and analytics actions stay disabled.

| Preview | What to review |
| --- | --- |
| Mining text spread | Mine normally: phrases use DM2’s circular placement around Doge, a20% chance per accepted ordinary hit and no mining-specific cap. |
| Shop button motion | Hover, press, release and buy once. Holding still opens Buy Max. Short phone cards can scroll vertically; the preview brings the buy control into view. |
| Welcome Back buttons | Watch the buttons pop in; hover, press and claim. The report closes and coins use their existing flight. Keyboard and controller activation remain available. |
| Story & close buttons | Watch the story and controls enter. Hover/press/release CLOSE or the desktop cross, then check the existing popup exit. Phone keeps its primary CLOSE control. |

## Mining-text adjustment

The source's ordinary hit-word chance is **20%**, rolled independently on each accepted hit. CE now uses that rule, with no two-line or helper-budget cap on mining words. The initial5%/two-line change was an agent-created adjustment; the user requested1:1 behavior, so it has been removed. DM2's separate drill runtime can override its hit chance; it does not change the ordinary-hit default.

The stacking problem came from placement: CE put phrases in a narrow strip above the rock. It now executes the source `Ys` circle: radius=field width/4.5, a random angle over the full circle, center=(width/2+75,height/2+120), and bottom-right text anchors. A matching text layer sits above Doge/rock and below HUD, without raising helper sprites. This spreads phrases around Doge without adding collision avoidance, a cooldown or an invented spacing rule. Existing phrase pools, opacity fades, helper conversations and frame playback retain their accepted behavior. No click, damage, coin, stat or saved-item calculation changes.

## Button behavior

The executed source oracle covers `ql`/`Yl` defaults and `cd.hover/press/release/leave/popIn`, with the close control's 350ms entry delay. Popup buttons lift 3px/scale1.04 over260ms, press to0.9 over80ms and release with Back easing over450ms. Buy buttons use 2px/1.02 over220ms, a0.95 press, and320ms Elastic release. Popup entry starts at0.6 over500ms; the source buy profile's0.85/350ms entry settings are retained in the profile, without adding unsolicited shop-card entrance motion.

`button-motion.js` applies these profiles selectively to existing two-tone shop, upgrade and dialog controls. Web Animations interpolates dense source easing samples without adding a JavaScript RAF loop. Interrupted motion samples the current animation timeline; settled, hidden, disabled and detached controls clean up. Popup anchors precede visual scaling, so the primary button remains centered throughout entry/hover/press. Shop redraws transfer only release feedback to the replacement control for that same helper.

Existing input and transaction owners remain responsible for activation. The module never clicks, purchases, acknowledges, prevents input or changes prices. Pointer/mouse compatibility events are deduplicated. Keyboard, touch, pen and controller paths settle without retaining a press; cancel, scroll, blur and hidden-page paths reset feedback. Reduced motion skips this spatial button motion, while the accepted popup cue, phrase fades and texture playback remain. Buy Max's action button keeps its own animation owner. Colors, two-tone artwork and card shadows stay with the existing theme; no glow is added.

## Verification and evidence

**46 CJS suites, 42 client parses and three inline parses pass.** The source fixture has ten executed motion calls and126 easing samples executed through the existing GSAP3.12.2 `parseEase`. Tests include redraw handoff, release re-entry, settled leave timing, pointer/controller/key/touch/pen, cancel/blur, disabled/reduced/detached states and Buy Max exclusion. Missing motion dependency stops startup before save/account initialization.

Native browser checks observe hover overshoot, press squash,320ms release, entry undershoot/overshoot and centered popup anchors at every sample. Four activation paths each buy exactly one helper at its exact quoted cost. An actual pointer click retains320ms release after the shop replaces its button. Buy Max opens with its independent spring, cancels and buys nothing. A real short-phone pointer click buys once; a real Enter claim acknowledges once, closes, and retains the already-credited wallet. The original two-line mining check is superseded by the source-parity follow-up below.

All sixteen previews fit at1280×800,375×812,320×568 and844×390, with decoded art, static title, no timeline spoiler, mute and unchanged normal storage. Forty-two local page/style/script requests return200; no local resource failures or account/cloud service calls are observed. Static Firebase SDK imports are still downloaded by the existing page; this is distinct from initializing or calling account/cloud/analytics services. Reduced-motion tests force the preference in the private test page; no user OS preference or physical100Hz display certification is claimed.

Evidence: `scratch/checkpoint-19-qa/`. Immutable baseline:135 files. Current implementation manifest:133 files. Original audit/source fields, historical checkpoint/follow-up hashes and six CRLF scripts are preserved. The pinned DM2 bundle matches the live source verified during the preceding accepted review. Localhost remains8011; no commit or deployment.


## Mining-text source-parity review correction

The user identified the narrow placement as the reason CE looked busier, and required DM2 parity. Revert the agent's frequency/cap adaptation and copy the shipped source trigger and circular placement. Source `Bm`/`Ys` are executed in tests: seven chance boundaries and eighty position cases over five field sizes match. DOM text uses the source bottom-right anchor and the full source radius. Forty-five simultaneous forced mining rolls are permitted and clean up, independently of the helper-text budget. Source fixture/hash and every prior checkpoint/follow-up hash remain historical.

The fresh native browser fetch returns200,982083bytes and the same SHA-256. A terminal fetch initially returns403; that failed attempt is preserved separately. Native DOM sampling confirms the circular positions, but subsequent native snapshot/evaluation calls hang; two identical evaluation timeouts authorize an isolated muted Chrome fallback. No user browser profile is accessed.

Current checks:46CJS suites and45parses. Browser tests check the complete source circle at1280×800,375×812,320×568 and844×390, plus reduced motion;20accepted hits keep20clicks/coins/damage. Forced successful rolls allow all20phrases, a100-hit stratified test yields20phrases, and45simultaneous lines have no mining cap. All expire/clear normally. Normal storage stays unchanged and audio remains muted. Current evidence: `scratch/checkpoint-19-mining-parity-qa/`,139-file immutable baseline and133-file current implementation manifest. Versions:styles106,field-personality9,parity-testing38. Counts60/42/1; remain at19 for review, stop before20.

The844×390 check preserves source coordinates on CE’s existing scaled desktop canvas; that canvas extends below the short viewport. This follow-up does not clamp or distort the source circle to hide that separate layout issue. Static screenshots show eight forced sample positions; ordinary gameplay keeps its natural independent20% rolls.
