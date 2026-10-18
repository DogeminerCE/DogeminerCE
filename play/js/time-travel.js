// DogeMiner: Community Edition - Time Travel / D.I.A. Mission (prestige system)
//
// Flow: Dogetalkie -> D.I.A. Mission Brief dialog -> badge picker -> "no going back"
// confirm -> time-machine warp cutscene -> Cateland 1930 -> Attack/Go Home -> drive into
// Kitler -> lightning impact -> "Mission Passed" rewards -> timeline reset -> "you
// know the drill" popup.
//
// Completing a mission is a prestige: nearly everything resets, EXCEPT the chosen
// D.I.A. Badge, the combined Super Fortune, Dogediamonds (existing + earned), and
// any already-protected (seasonal) fortunes. The timeline counter advances and the
// player restarts on Earth with only their bare Paw.

class TimeTravelManager {
    // Source GB/zB/VB/YB event deadlines; CE keeps its DOM scene rendering.
    static MISSION_TIMING = Object.freeze({
        catelandEntry: 13000, firstSpeech: 5700, speechPeriod: 3700, crowdLag: 1400,
        teleport: (3 / .3 + 3 / .4 + 5 / .3) * 1000 / 60 + 1000,
        choiceDelay: 4000, exitStart: 2760, cower: 3200, whiteFade: 500, rewardHold: 3000
    });

    static fortuneCopies(item) {
        return Number.isSafeInteger(item?.consolidatedCopies) && item.consolidatedCopies > 0 ? item.consolidatedCopies : 1;
    }

    /** DM2 HQ groups by source ID, never by display name. CE keeps earned fractions. */
    static consolidateFortunes(inventory) {
        const groups = new Map();
        for (const item of inventory) {
            const definition = window.DogeMinerBalance?.getDefinition('fortune', item);
            const key = definition?.sourceMatched ? `dm2:${definition.id}`
                : item.isDiaBadge && item.name ? `badge:${item.name}`
                : item.templateId ? `ce:${item.templateId}` : Symbol('unidentified fortune');
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(item);
        }
        return Array.from(groups.values(), copies => {
            if (copies.length === 1) return copies[0];
            const stats = new Map();
            for (const item of copies) for (const stat of item.stats || []) {
                if (!Number.isFinite(stat.value)) throw new Error('Cannot consolidate an invalid Fortune stat.');
                const attribute = window.DogeMinerBalance?.statKey(stat, 'fortune', item) || stat.name || stat.displayName;
                const key = `${attribute}:${stat.indicator || '+'}`;
                if (!stats.has(key)) stats.set(key, { ...stat });
                else {
                    const total = stats.get(key).value + stat.value;
                    if (!Number.isFinite(total)) throw new Error('Consolidated Fortune stats exceed the supported range.');
                    // Ordinary DM2 rolls are integers, so this matches HQ's sum/floor.
                    // Fractional Alpha bonuses are earned and must not be discarded.
                    stats.get(key).value = total;
                }
            }
            return { ...copies[0], stats: [...stats.values()], isProtected: true,
                consolidatedCopies: copies.reduce((sum, item) => sum + TimeTravelManager.fortuneCopies(item), 0) };
        });
    }

    static createStartingPaw() {
        return {
            instanceId: 'timeline_paw', templateId: 'timeline_start_paw', name: 'Paw', rarity: 'common',
            description: 'Soft and furry. Hurts to hit rocks with.', planetOfOrigin: 'earth', baseDPC: 1, stats: [],
            idleSprite: 'assets/items/pickaxes-seasonal/Timeline Start/Paw/paw.webp',
            isStaffOfSundoge: false, isPaw: true,
            specialInstructions: 'Under no circumstances can the Paw be more than 1.'
        };
    }

    constructor(game) {
        this.game = game;
        this._step = 0;
        this._payout = null;        // { coinDiamonds, pickaxeDiamonds, total, badgeStat }
        this._chosenBadge = null;   // 'wow' | 'luck' | 'loot'
        this._missionChoice = null; // DM2 kitlerstats: 0=Attack, 1=Go home
        this._phase = null;         // 'travel' | 'cateland' | 'choice' | 'drive' | 'impact'
        this._sounds = {};          // cached Audio elements
        this._activeLoops = [];     // looping sounds to stop on teardown
        this._timers = [];          // pending timeouts/intervals (cleared on skip/teardown)

        // --- Tunable config ---
        this.COIN_DIAMOND_CAP = 60; // max Dogediamonds from Dogecoins

        this._buildScript();
    }

    // ============================ AVAILABILITY ============================

    /** First contact is saved with its story, eleven seconds after location
     * entry with a rig. Existing CE mission access is retained on save upgrade. */
    isUnlocked() {
        const g = this.game;
        const ownsRig = (g.helpers || []).some(h => h.type === 'timeMachineRig');
        if (!ownsRig) return false;
        if (g.worldDiscovery?.events && typeof g.worldDiscovery.events.contacted === 'boolean') return g.worldDiscovery.events.contacted;
        // Compatibility for older callers without a restored discovery ledger.
        // Veterans of a previous mission know the drill — the rig is all they need.
        if (g.diaMissionSeenOnce || (g.timelineNumber || 1) > 1) return true;
        // First timeline: must have reached Jupiter (once reached, remembered forever).
        if (!g.hasReachedJupiterEver) {
            const reached = g.currentLevel === 'jupiter' || g.currentLevel === 'titan'
                || (g.jupiterHelpers || []).length > 0 || (g.titanHelpers || []).length > 0;
            if (reached) g.hasReachedJupiterEver = true;
        }
        return !!g.hasReachedJupiterEver;
    }

    /** Injects (once) and toggles the Dogetalkie button + Timeline label. */
    updateDogetalkieButton() {
        this._ensureTopBar();
        const btn = document.getElementById('dogetalkie-btn');
        const label = document.getElementById('timeline-label');
        const show = this.isUnlocked();
        if (btn) btn.style.display = show ? 'flex' : 'none';
        if (label) {
            // Veterans always see which timeline they're in, even before
            // rebuying a Time Machine Mining Rig in the new timeline.
            const showLabel = (this.game.timelineNumber || 1) > 1;
            label.style.display = showLabel ? 'block' : 'none';
            label.textContent = showLabel ? `TIMELINE #${this.game.timelineNumber || 1}` : '';
        }
    }

    _ensureTopBar() {
        // Dogetalkie button lives in the top-right HUD, next to the Dogediamond
        // counter (the top-left switcher row is the Mystery Box's turf).
        if (!document.getElementById('dogetalkie-btn')) {
            const hud = document.getElementById('topright-hud');
            if (hud) {
                const btn = document.createElement('button');
                btn.id = 'dogetalkie-btn';
                btn.className = 'switcher-btn dogetalkie-btn';
                btn.style.display = 'none';
                btn.title = 'D.I.A. Dogetalkie';
                btn.innerHTML = `<img src="assets/general/dogetalkie.webp" alt="Dogetalkie" class="switcher-btn-icon">`;
                btn.addEventListener('click', () => this.openMissionBrief());
                hud.insertBefore(btn, hud.firstChild);
            }
        }
        // Timeline label sits just above the top-right HUD.
        if (!document.getElementById('timeline-label')) {
            const hud = document.getElementById('topright-hud');
            if (hud && hud.parentElement) {
                const label = document.createElement('div');
                label.id = 'timeline-label';
                label.className = 'timeline-label';
                label.style.display = 'none';
                hud.parentElement.insertBefore(label, hud);
            }
        }
    }

    // ============================ PAYOUT ============================

    computePayout() {
        const g = this.game;
        const coins = Math.max(0, g.dogecoins || 0);
        const coinDiamonds = Math.min(
            this.COIN_DIAMOND_CAP,
            Math.max(1, Math.ceil(Math.pow(Math.ceil(coins / 1000000), 0.4)))
        );

        // DM2 DQ: every owned pickaxe counts, including the starting Paw.
        const pickaxeDiamonds = Math.ceil((g.pickaxeInventory || []).length / 2);

        const badgeStat = this.computeBadgeStat();

        this._payout = {
            coinDiamonds,
            pickaxeDiamonds,
            total: coinDiamonds + pickaxeDiamonds,
            badgeStat
        };
        this._payoutContext = { timeline: g.timelineNumber || 1, currencyEpoch: g._currencyFlightEpoch || 0 };
        this._payoutApplied = false;
        return this._payout;
    }

    computeBadgeStat() {
        // DM2 IQ rounds each helper type separately, including non-mining helpers.
        // Earth uses the source's default 0.4 weight (not the unused 0.1 initializer).
        let value = 0;
        for (const [key, weight] of [['helpers', 0.4], ['moonHelpers', 0.2], ['marsHelpers', 0.3],
            ['jupiterHelpers', 0.35], ['titanHelpers', 0.4]]) {
            const counts = new Map();
            for (const helper of this.game[key] || []) {
                if (helper?.type) counts.set(helper.type, (counts.get(helper.type) || 0) + 1);
            }
            for (const count of counts.values()) value += Math.ceil(count * weight);
        }
        const cap = 230;
        const timeline = Math.max(1, Math.floor(this.game.timelineNumber || 1));
        if (value > cap) {
            if (timeline < 2) return cap;
            // Preserve the shipped string exponent: the extra term starts when
            // clamping converts it to number 2, which first occurs on timeline 11.
            let exponent = (timeline / 10 + 1).toFixed(1);
            if (exponent > 2) exponent = 2;
            value = Math.ceil(4.2 * Math.pow(cap, exponent) / Math.log(Math.pow(timeline, 6.9))
                + (exponent === 2 ? cap * timeline * 6.9 : 0));
        }
        return value || 1;
    }

    // ============================ MISSION BRIEF DIALOG ============================

    _buildScript() {
        const blue = '#7fc4ff', orange = '#ffb347', red = '#ff7a7a';
        this._script = [
            { char: 'burt-talkie', pose: 'talking', text: `Hello There! My name is <em data-c="${blue}">Burt Dogelin, D.I.A.</em> It brings me great pleasure that you called, we have a mission of <em data-c="${orange}">muchmost importance.</em>`, left: 'NO PLS', right: 'WOW?' },
            { char: 'burt', pose: 'angry', text: `Your mission, should you choose to accept it, is:<br><em data-c="${red}">To go back in time and stop KITLER!</em>`, left: 'BACK', right: 'MANY WOW!' },
            { char: 'burt', pose: 'chill', text: `Many wow indeed. Before you accept, I am required to tell you of the <em data-c="${red}">sacrifices</em> you must make as well as the <em data-c="${blue}">rewards</em> of this mission.`, left: 'BACK', right: 'MUCH LISTEN' },
            { char: 'burt', pose: 'sweat', text: `Going back in time and altering history will have <em data-c="${red}">major implications</em> for you. I can't go into too much details, but rest assured, we will compensate you <em data-c="#7ee07e">greatly.</em>`, left: 'BACK', right: 'GO ON' },
            { char: 'burt', pose: 'glasses', text: `We have a <em data-c="${orange}">"special"</em> machine that takes your FORTUNES and makes a <em data-c="#cfa0ff">SUPER FORTUNE</em>, protected from time travel. Also, we think <em data-c="${blue}">DOGEDIAMONDS</em> are safe to bring.`, left: 'BACK', right: 'SO WOW' },
            { char: 'burt', pose: 'thumbsup', dynamic: 'offer', left: 'BACK', right: 'HMMM' },
            { char: 'badge', dynamic: 'summary', left: 'BACK', right: 'NOT BAD' },
            { char: 'burt-talkie', pose: 'talking', text: `Will you heed the call? Will you be the Doge we need? Will you <em data-c="${orange}">go back in time and stop KITLER?</em>`, left: 'BACK', right: 'MAYHAPS' },
            { char: 'picker', left: 'BACK', right: 'READY!' }
        ];
    }

    _stepText(step) {
        const p = this._payout;
        const blue = '#7fc4ff';
        if (step.dynamic === 'offer') {
            const maxTag = p.coinDiamonds >= this.COIN_DIAMOND_CAP ? ' (max)' : '';
            return `For your current <em data-c="${blue}">ĐOGECOINS</em>, we offer <em data-c="${blue}">${p.coinDiamonds} DOGEDIAMONDS</em>${maxTag}. For your pickaxes, <em data-c="${blue}">${p.pickaxeDiamonds} DOGEDIAMONDS</em>, and as for the helpers you may choose a D.I.A. Badge that will get <em data-c="#ff8fc4">+${this.game.formatNumber(p.badgeStat)} stats</em>.`;
        }
        if (step.dynamic === 'summary') {
            return `We understand if you say no. Shall you accept, you will receive <em data-c="${blue}">${p.total} DOGEDIAMONDS</em>, a D.I.A. Badge of your choosing <em>and</em> keep most of your <em data-c="#cfcf8f">FORTUNE</em> stats.`;
        }
        return step.text || '';
    }

    openMissionBrief(force = false) {
        if (!force && !this.isUnlocked()) return;
        this.game.playSound('inventoryOpen');
        this.computePayout();
        this._chosenBadge = null;
        this._step = 0;
        this._burtIntroduced = false; // nameplate shows "???" until he says his name
        this._ensureModal();
        this._renderStep();
        // The very first mission is a story moment — no skipping it.
        const skipBtn = document.getElementById('dia-skip-btn');
        if (skipBtn) skipBtn.style.display = this.game.diaMissionSeenOnce ? 'block' : 'none';
        document.getElementById('dia-mission-modal').classList.add('active');
    }

    closeMissionBrief() {
        this._stopTyping();
        const m = document.getElementById('dia-mission-modal');
        if (m) m.classList.remove('active');
    }

    _ensureModal() {
        if (document.getElementById('dia-mission-modal')) return;
        const modal = document.createElement('div');
        modal.id = 'dia-mission-modal';
        modal.className = 'dia-mission-modal';
        modal.innerHTML = `
            <button type="button" class="dia-skip-btn" id="dia-skip-btn">SKIP</button>
            <div class="dia-mission-card">
                <h2 class="dia-mission-title">D.I.A. MISSION BRIEF</h2>
                <div class="dia-mission-body" id="dia-mission-body"></div>
                <div class="dia-mission-buttons" id="dia-mission-buttons"></div>
            </div>`;
        document.body.appendChild(modal);
        document.getElementById('dia-skip-btn').addEventListener('click', () => { this._step = this._script.length - 1; this._renderStep(); });
        // Clicking anywhere on the card while Burt is mid-sentence reveals it all.
        modal.querySelector('.dia-mission-card').addEventListener('click', () => {
            if (this._finishTyping) this._finishTyping();
        });
    }

    _renderStep() {
        const step = this._script[this._step];
        const body = document.getElementById('dia-mission-body');
        const btns = document.getElementById('dia-mission-buttons');
        if (!step) return;
        this._stopTyping();

        const canAdvance = step.char !== 'picker' || this._chosenBadge;
        btns.innerHTML = `
            <button class="dia-btn dia-btn-left">${step.left}</button>
            <button class="dia-btn dia-btn-right${canAdvance ? '' : ' disabled'}"${canAdvance ? '' : ' disabled'}>${step.right}</button>`;
        // stopPropagation: otherwise the click bubbles to the card's
        // click-to-complete handler and instantly reveals the NEXT line.
        btns.querySelector('.dia-btn-left').addEventListener('click', (e) => { e.stopPropagation(); this._back(); });
        btns.querySelector('.dia-btn-right').addEventListener('click', (e) => { e.stopPropagation(); this._advance(); });
        // Buttons default to visible each step; the talking branch below hides
        // them until the line lands (otherwise a SKIP straight to the picker
        // would inherit the hidden state and strand the player).
        btns.classList.remove('dia-btns-hidden');

        // Talking steps float free (no card backing) — the badge picker keeps
        // the classic card panel with centered content.
        const isPicker = step.char === 'picker';
        const card = body.closest('.dia-mission-card');
        if (card) card.classList.toggle('dia-card-clear', !isPicker);
        body.classList.toggle('dia-body-centered', isPicker);

        if (isPicker) {
            body.innerHTML = this._badgePickerHTML();
            body.querySelectorAll('[data-c]').forEach(el => { el.style.color = el.getAttribute('data-c'); });
            this._wireBadgePicker();
            // Picker keeps the buttons in their classic spot below the card.
            if (card) card.appendChild(btns);
            btns.classList.remove('dia-btns-on-box');
        } else {
            // Steps past the intro mean he's already said his name.
            if (this._step > 0) this._burtIntroduced = true;
            const name = this._burtIntroduced ? 'Burt Dogelin' : '???';
            // Visual-novel layout: big portrait bottom-left, dialogue box layered
            // over it along the bottom, name plate on the box's top edge.
            body.innerHTML = `
                <div class="dia-scene dia-char-${step.char}">${this._charHTML(step.char, step.pose)}</div>
                <div class="dia-box">
                    <div class="dia-nameplate" id="dia-nameplate">${name}</div>
                    <p class="dia-text" id="dia-typed-text"></p>
                </div>`;
            // The replies ride the dialogue box's bottom edge, mirroring the
            // name plate on its top edge.
            const box = body.querySelector('.dia-box');
            box.appendChild(btns);
            btns.classList.add('dia-btns-on-box');
            // Extra bottom padding so the last text line never runs under
            // the buttons straddling the box's bottom edge
            box.classList.add('dia-box-has-btns');
            // Burt "talks": the line types out, and the replies appear once he's done
            // (or instantly, if the player clicks the dialog to hurry him up).
            btns.classList.add('dia-btns-hidden');
            const portrait = body.querySelector('.dia-burt');
            if (portrait) portrait.classList.add('dia-talking');
            this._typeText(document.getElementById('dia-typed-text'), this._stepText(step), () => {
                btns.classList.remove('dia-btns-hidden');
                this._stopTalking(portrait);
                // He just identified himself — the name plate catches up.
                if (!this._burtIntroduced) {
                    this._burtIntroduced = true;
                    const plate = document.getElementById('dia-nameplate');
                    if (plate) plate.textContent = 'Burt Dogelin';
                }
            });
        }
    }

    // ---- Typewriter ("talking") effect ----

    /**
     * Types `html` into `el` character by character, preserving markup (emphasis
     * spans keep their colors while their text reveals). Clicking the dialog
     * finishes the line instantly via _finishTyping().
     */
    _typeText(el, html, onDone) {
        el.innerHTML = html;
        el.querySelectorAll('[data-c]').forEach(e => { e.style.color = e.getAttribute('data-c'); });

        // Collect every text node, remember its content, then blank them all.
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const nodes = [];
        let n;
        while ((n = walker.nextNode())) {
            nodes.push({ node: n, full: n.nodeValue });
            n.nodeValue = '';
        }

        let ni = 0, ci = 0;
        this._finishTyping = () => {
            nodes.forEach(x => { x.node.nodeValue = x.full; });
            this._stopTyping();
            if (onDone) onDone();
        };
        this._typeInterval = setInterval(() => {
            // Reveal two characters per tick — brisk, but still clearly "spoken".
            for (let step = 0; step < 2; step++) {
                while (ni < nodes.length && ci >= nodes[ni].full.length) { ni++; ci = 0; }
                if (ni >= nodes.length) { this._finishTyping && this._finishTyping(); return; }
                ci++;
                nodes[ni].node.nodeValue = nodes[ni].full.slice(0, ci);
            }
        }, 24);
    }

    _stopTyping() {
        if (this._typeInterval) { clearInterval(this._typeInterval); this._typeInterval = null; }
        this._finishTyping = null;
    }

    /**
     * Ends Burt's talk-bob without the jarring snap: freezing the animation
     * mid-cycle would jump him back to rest instantly, so we capture his
     * current offset, hold it inline, then ease him back down.
     */
    _stopTalking(portrait) {
        if (!portrait || !portrait.classList.contains('dia-talking')) return;
        const frozen = getComputedStyle(portrait).transform;
        portrait.classList.remove('dia-talking');
        if (!frozen || frozen === 'none') return;
        portrait.style.transition = 'none';
        portrait.style.transform = frozen;
        portrait.getBoundingClientRect(); // reflow: the frozen pose becomes the start point
        portrait.style.transition = 'transform 0.25s ease-out';
        portrait.style.transform = '';
        const cleanup = () => { portrait.style.transition = ''; portrait.removeEventListener('transitionend', cleanup); };
        portrait.addEventListener('transitionend', cleanup);
    }

    _charHTML(type, pose = 'talking') {
        const burt = `<img src="assets/general/missions/burt/${pose}.webp" class="dia-burt" alt="Burt Dogelin">`;
        if (type === 'burt') return burt;
        if (type === 'burt-talkie') return `${burt}<img src="assets/general/dogetalkie.webp" class="dia-talkie" alt="Dogetalkie">`;
        if (type === 'badge') return `<img src="assets/general/diabadge.webp" class="dia-badge-logo" alt="D.I.A.">`;
        return '';
    }

    _back() {
        this.game.playSound('swipe');
        if (this._step === 0) { this.closeMissionBrief(); return; }
        this._step--;
        this._renderStep();
    }

    _advance() {
        const step = this._script[this._step];
        if (step.char === 'picker') {
            if (!this._chosenBadge) return;
            this._confirmNoGoingBack();
            return;
        }
        this._playSound('radio'); // radio crackle on each next-dialogue click
        this._step++;
        this._renderStep();
    }

    // ---- Badge picker ----

    _badgePickerHTML() {
        const stat = this.game.formatNumber(this._payout.badgeStat);
        const hasPick = !!this._chosenBadge;
        const card = (type, label) => `
            <button type="button" aria-pressed="${this._chosenBadge === type}" class="dia-badge-card${this._chosenBadge === type ? ' selected' : ''}${hasPick && this._chosenBadge !== type ? ' unpicked' : ''}" data-badge="${type}">
                <div class="dia-badge-tag">[PROTECTED]</div>
                <img src="assets/general/diabadge.webp" alt="${label}">
                <div class="dia-badge-name">D.I.A. Badge (${label})</div>
            </button>`;
        return `
            <div class="dia-picker-title">Pick a reward:</div>
            <div class="dia-badge-cards">
                ${card('luck', 'Luck')}${card('wow', 'Wow')}${card('loot', 'Loot')}
            </div>
            <p class="dia-text dia-picker-text">Good enough. Here's the D.I.A. badges. They each have different stats: <em data-c="#7fc4ff">+${stat}</em> Luck, Wow or Loot Find. Pick one.</p>`;
    }

    _wireBadgePicker() {
        document.querySelectorAll('#dia-mission-body .dia-badge-card').forEach(c => {
            c.addEventListener('click', () => {
                const wasFocused = document.activeElement === c;
                this._chosenBadge = c.dataset.badge;
                this.game.playSound('check');
                this._renderStep();
                if (wasFocused) document.querySelector(`#dia-mission-body [data-badge="${this._chosenBadge}"]`)?.focus({ preventScroll: true });
            });
        });
    }

    // ---- No going back ----

    _confirmNoGoingBack() {
        let modal = document.getElementById('dia-warning-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'dia-warning-modal';
            modal.className = 'dia-warning-modal';
            modal.innerHTML = `
                <div class="dia-warning-card">
                    <div class="dia-warning-icon">!</div>
                    <h2 class="dia-warning-title">WARNING: NO GOING BACK</h2>
                    <p class="dia-warning-text">THERE IS NO TURNING BACK AFTER THIS. ARE YOU SURE YOU WANT TO PROCEED?</p>
                    <div class="dia-warning-buttons">
                        <button class="dia-warning-no" id="dia-warning-no">NO WAIT</button>
                        <button class="dia-warning-yes" id="dia-warning-yes">YESSSSSS</button>
                    </div>
                </div>`;
            document.body.appendChild(modal);
            document.getElementById('dia-warning-no').addEventListener('click', () => modal.classList.remove('active'));
            document.getElementById('dia-warning-yes').addEventListener('click', () => {
                modal.classList.remove('active');
                this.closeMissionBrief();
                this.startCutscene();
            });
        }
        modal.classList.add('active');
    }

    // ============================ CUTSCENE ============================

    startCutscene() {
        this._missionChoice = null;
        if (window.audioManager && typeof window.audioManager.stopMusic === 'function') {
            window.audioManager.stopMusic();
        }

        this.game.isCutscenePlaying = true;
        this.game.isPlaying = false;
        // First-ever mission plays out in full — no skipping the story.
        this._skipAllowed = !!this.game.diaMissionSeenOnce;
        this.game.diaMissionSeenOnce = true;
        this._rewardsShown = false;
        const overlay = document.createElement('div');
        overlay.id = 'mission-cutscene';
        overlay.className = 'mission-cutscene';
        overlay.innerHTML = `
            <div class="cutscene-stage" id="cutscene-stage"></div>
            <button type="button" class="cutscene-skip" id="mission-cutscene-skip" style="display:none;"><span class="cs-skip-key">[SKIP]</span><span class="cs-skip-label">SKIPPABLE CUTSCENE</span></button>`;
        document.body.appendChild(overlay);
        document.getElementById('mission-cutscene-skip').addEventListener('click', () => this._skip());
        this._setSkipVisible(true);
        this._cutscenePart1();
    }

    _stage() { return document.getElementById('cutscene-stage'); }

    _after(ms, fn) { const t = setTimeout(fn, ms); this._timers.push(t); return t; }
    _every(ms, fn) { const t = setInterval(fn, ms); this._timers.push(t); return t; }

    _setSkipVisible(show) {
        const el = document.getElementById('mission-cutscene-skip');
        if (el) el.style.display = (show && this._skipAllowed) ? 'block' : 'none';
    }

    _getRigSprite() {
        const lvl = (this.game.helperUpgradeLevels && this.game.helperUpgradeLevels['timeMachineRig']) || 0;
        return this.game.getHelperSpritePaths('timeMachineRig', lvl).idle;
    }

    /**
     * Part 1 — travelling through time. Black void with rushing warp streaks,
     * the DeLorean rig floating and rocking, doge saying wow / such excite.
     */
    _cutscenePart1() {
        this._phase = 'travel';
        const stage = this._stage();
        if (!stage) return;
        stage.className = 'cutscene-stage cs-space';
        stage.innerHTML = `
            <div class="cs-warp">
                <div class="cs-warp-layer cs-warp-1"></div>
                <div class="cs-warp-layer cs-warp-2"></div>
                <div class="cs-warp-layer cs-warp-3"></div>
            </div>
            <div class="cs-car cs-car-float" id="cs-car">
                <div class="cs-speech cs-speech-car" id="cs-car-speech">wow</div>
                <img src="${this._getRigSprite()}" alt="Time Machine">
            </div>`;
        this._playSound('carStart');
        this._after(1000, () => this._playLoop('carLoop'));

        const speech = document.getElementById('cs-car-speech');
        const say = (txt) => {
            if (!speech) return;
            speech.textContent = txt;
            speech.classList.remove('cs-speech-pop');
            void speech.offsetWidth; // restart the pop animation
            speech.classList.add('cs-speech-pop');
        };
        this._after(1500, () => say('such excite'));
        this._after(3000, () => say('wow'));
        this._after(3700, () => {
            const car = document.getElementById('cs-car');
            if (car) {
                car.classList.remove('cs-car-float');
                car.classList.add('cs-car-accelerate');

                const bolt = document.createElement('img');
                bolt.className = 'cs-zap-bolt';
                bolt.style.top = '-40px';
                bolt.src = 'assets/general/missions/lightning/ln1.webp';
                car.appendChild(bolt);

                const zapFlash = document.createElement('div');
                zapFlash.className = 'cs-zap-flash';
                car.appendChild(zapFlash);

                let frame = 1;
                this._accelZap = setInterval(() => {
                    bolt.src = `assets/general/missions/lightning/ln${((frame - 1) % 5) + 1}.webp`;
                    frame++;
                }, 70);
            }
            this._playSound('lightningLate', .3);
            this._after(450, () => this._playSound('lightningBig'));
        });

        this._after(4550, () => {
            if (this._accelZap) clearInterval(this._accelZap);
            this._cateland();
        });
    }

    static lightningFrames(late = false) {
        const frames = []; let at = late ? 300 : 0;
        for (const speed of [.3, .4]) for (let frame = 1; frame <= 3; frame++) {
            frames.push({ at, frame }); at += 1000 / (60 * speed);
        }
        const darkAt = at; at += late ? 700 : 1000;
        for (let frame = 1; frame <= 5; frame++) { frames.push({ at, frame }); at += 1000 / 18; }
        return { frames, darkAt, end: at };
    }

    _animateMissionLightning(bolt, late, done) {
        if (late) this._after(300, () => this._playSound('lightningLate', .25));
        else this._playSound('lightningSmall');
        const timing = TimeTravelManager.lightningFrames(late);
        bolt.style.opacity = '0';
        for (const {at, frame} of timing.frames) this._after(at, () => {
            bolt.style.opacity = '1'; bolt.src = `assets/general/missions/lightning/ln${frame}.webp`;
        });
        this._after(timing.darkAt, () => { bolt.style.opacity = '0'; });
        if (!late) this._after(timing.end - 5*1000/18, () => this._playSound('lightningBig'));
        this._after(timing.end, done);
    }

    /** Bright warp flash between scenes. */
    _warpFlashTo(cb) {
        const overlay = document.getElementById('mission-cutscene');
        if (!overlay) { cb(); return; }
        const flash = document.createElement('div');
        flash.className = 'cs-flash';
        overlay.appendChild(flash);
        this._playSound('warp');
        this._after(650, () => { flash.remove(); cb(); });
    }

    /**
     * Part 2 — Cateland, circa 1930. Kitler and his crowd of civilian cats on the
     * right; the time machine screeches in on the left. Kitler and the crowd trade
     * lines, then the Attack / Go Home choice appears.
     */
    _cateland() {
        this._phase = 'cateland';
        this._stopLoop('carLoop');
        this._playLoop('missionLoop');
        const stage = this._stage();
        if (!stage) return;
        stage.className = 'cutscene-stage cs-cateland';
        stage.innerHTML = `
            <div class="cs-cateland-label">CATELAND, circa 1930</div>
            <div class="cs-sky"></div>
            <div class="cs-skyline"></div>
            <div class="cs-car cs-car-hidden" id="cs-car">
                <img src="${this._getRigSprite()}" alt="Time Machine">
                <img class="cs-zap-bolt" id="cs-zap-bolt" alt="">
            </div>
            <div class="cs-kitler" id="cs-kitler">
                <div class="cs-speech cs-speech-kitler" id="cs-kitler-speech"></div>
                <img src="assets/general/missions/cat normal.webp" alt="Kitler" id="cs-kitler-img">
            </div>
            <div class="cs-crowd-wrap">
                <div class="cs-speech cs-speech-crowd" id="cs-crowd-speech"></div>
                <img src="assets/general/missions/crowd.webp" class="cs-crowd" alt="Civilian Cats">
            </div>`;

        // Kitler speaks first while the left side of the scene is empty
        const beats = [
            { who: 'kitler', text: 'VE MUST STOP DOGE' },
            { who: 'crowd', text: 'how we stop doge??' },
            { who: 'kitler', text: 'CATE UBER ALLES!' },
            { who: 'crowd', text: 'ja!' },
            { who: 'kitler', text: 'IF WE FITS, WE SITS!' },
            { who: 'crowd', text: 'i always fits' },
            { who: 'kitler', text: 'ONLY CATE NOW!' },
            { who: 'crowd', text: 'sound good!' }
        ];

        const timing = TimeTravelManager.MISSION_TIMING;

        // Short pause after the first dialogue, then the time machine ZAPS into 1930 in a crackle of electricity.
        this._after(timing.catelandEntry, () => {
            const car = document.getElementById('cs-car');
            const bolt = document.getElementById('cs-zap-bolt');
            const zapFlash = document.createElement('div');
            zapFlash.className = 'cs-zap-flash';
            if (!car || !bolt) return;
            const effect = car.cloneNode(false); effect.removeAttribute('id'); effect.className = 'cs-car cs-arrival-effect';
            effect.style.height = car.offsetHeight + 'px'; effect.append(bolt, zapFlash); stage.append(effect);
            this._animateMissionLightning(bolt, false, () => { this._playSound('warp');car.classList.remove('cs-car-hidden'); effect.remove(); });
        });

        // Remaining dialogue beats trade lines, then the choice appears.
        beats.forEach((beat, i) => this._after(timing.firstSpeech + Math.floor(i / 2) * timing.speechPeriod + (i % 2 ? timing.crowdLag : 0), () => this._speak(beat.who, beat.text)));
        this._after(timing.catelandEntry + timing.teleport + timing.choiceDelay, () => this._showChoice());
    }

    _speak(who, text) {
        const el = document.getElementById(who === 'kitler' ? 'cs-kitler-speech' : 'cs-crowd-speech');
        if (!el) return;
        el.textContent = text;
        el.classList.remove('cs-speech-pop');
        void el.offsetWidth;
        el.classList.add('cs-speech-pop');
    }

    _showChoice() {
        if (this._phase === 'choice') return;
        this._phase = 'choice';
        const stage = this._stage();
        if (!stage) return;
        document.getElementById('cs-car')?.classList.remove('cs-car-hidden');
        stage.querySelector('.cs-arrival-effect')?.remove();
        this._setSkipVisible(false); // the decision itself can't be skipped

        const choice = document.createElement('div');
        choice.className = 'cs-choice';
        choice.innerHTML = `
            <div class="cs-choice-title">There's Kitler!</div>
            <button class="cs-choice-btn" id="cs-attack">ATTACK</button>
            <button class="cs-choice-btn" id="cs-gohome">GO HOME</button>`;
        stage.appendChild(choice);
        document.getElementById('cs-attack').addEventListener('click', () => this._driveIntoKitler('GOTTA GO FAST', 'attack'));
        document.getElementById('cs-gohome').addEventListener('click', () => this._driveIntoKitler('GOTTA GO HOME', 'go_home'));

        // Kitler keeps monologuing while the player decides.
        const taunts = [
            { who: 'kitler', text: 'MAKE CATE GR8 AGEN' },
            { who: 'crowd', text: 'meow' },
            { who: 'crowd', text: 'are we ze bad guys?' },
            { who: 'kitler', text: 'CATE CAN WORLD TAKE' },
            { who: 'kitler', text: 'DOGE TAKE CATE JOBS!' },
            { who: 'crowd', text: 'bad doge!' },
            { who: 'kitler', text: 'BUT CATES CUTEST!' },
            { who: 'crowd', text: 'ja! cutest!' },
            { who: 'crowd', text: 'me hungry' },
            { who: 'kitler', text: 'I HAVE ZE SOLUTION!' },
            { who: 'crowd', text: 'much interest' },
            { who: 'kitler', text: 'VE WILL NOT GIVE UP!' },
            { who: 'crowd', text: 'meow!' },
            { who: 'kitler', text: 'ZE DOGE VERY BAD!' },
            { who: 'crowd', text: 'okay!' },
            { who: 'crowd', text: 'victory meow!' },
            { who: 'kitler', text: 'ZE REVOLUTION TO START!' },
            { who: 'crowd', text: 'meow meow' },
            { who: 'kitler', text: 'VICTORY MEOW!' },
            { who: 'crowd', text: 'victory meow!' },
            { who: 'kitler', text: 'FOR CATELAND!' },
            { who: 'crowd', text: 'stop doge meow!' },
            { who: 'kitler', text: 'VE MUST STOP DOGE' },
            { who: 'crowd', text: 'how we stop doge??' }
        ];
        let i = 0;
        this._speak(taunts[0].who, taunts[0].text);
        this._tauntInterval = this._every(1650, () => {
            i = (i + 1) % taunts.length;
            this._speak(taunts[i].who, taunts[i].text);
        });
    }

    /** Both choices end the same way: floor it, straight into Kitler. */
    _driveIntoKitler(shout, missionChoice) {
        if (this._phase === 'drive') return;
        this._phase = 'drive';
        this._missionChoice = missionChoice === 'attack' || missionChoice === 'go_home' ? missionChoice : null;
        if (this._tauntInterval) clearInterval(this._tauntInterval);
        const stage = this._stage();
        if (!stage) return;
        this._setSkipVisible(true);
        const choice = stage.querySelector('.cs-choice');
        if (choice) choice.remove();

        // Doge's battle cry rides along above the car
        const car = document.getElementById('cs-car');
        if (car) {
            const shoutEl = document.createElement('div');
            shoutEl.className = 'cs-shout';
            shoutEl.textContent = shout;
            car.appendChild(shoutEl);
        }

        // Kitler realises what's happening
        this._after(2200, () => this._speak('kitler', 'no pls'));
        this._after(2700, () => this._speak('kitler', 'i was only kitten around'));
        this._after(300, () => {
            const kImg = document.getElementById('cs-kitler-img');
            if (kImg) kImg.src = 'assets/general/missions/cat shaking.webp';
        });

        // Floor it: tire burn, then charge with a dust trail
        this._playSound('burnDrive');
        this._after(350, () => {
            if (car) car.classList.add('cs-car-charge');
            // The source burn-and-drive clip already contains the engine.
            // Kick up dust puffs behind the car while it charges
            this._dustInterval = this._every(120, () => {
                if (!car || !car.parentNode) return;
                const rect = car.getBoundingClientRect();
                const puff = document.createElement('img');
                puff.src = 'assets/general/cartoonsmoke.webp';
                puff.className = 'cs-dust-puff';
                puff.style.left = (rect.left - 8) + 'px';
                puff.style.top = (rect.top + rect.height * 0.55) + 'px';
                document.getElementById('mission-cutscene').appendChild(puff);
                setTimeout(() => puff.remove(), 700);
            });
        });

        this._after(TimeTravelManager.MISSION_TIMING.exitStart, () => this._lightningImpact());
    }

    _lightningImpact() {
        if (this._phase === 'impact') return;
        this._phase = 'impact';
        if (this._dustInterval) clearInterval(this._dustInterval);
        this._stopLoop('carLoop');
        const stage = this._stage();
        const overlay = document.getElementById('mission-cutscene');
        if (!stage || !overlay) return;

        // Kitler cowers, electricity everywhere
        const kitler = document.getElementById('cs-kitler');
        const kImg = document.getElementById('cs-kitler-img');
        this._after(TimeTravelManager.MISSION_TIMING.cower - TimeTravelManager.MISSION_TIMING.exitStart, () => { if (kImg) kImg.src = 'assets/general/missions/cat cowering.webp'; });
        if (kitler) kitler.classList.add('cs-kitler-shake');
        // Lightning audio follows the same short/late phase as the bolt.

        // Lightning bolt frames over Kitler + a full-screen electric flicker
        const bolt = document.createElement('img');
        bolt.className = 'cs-lightning';
        if (kitler) kitler.appendChild(bolt);
        const flicker = document.createElement('div');
        flicker.className = 'cs-electric-flicker';
        overlay.appendChild(flicker);

        this._animateMissionLightning(bolt, true, () => { this._playSound('brake');this._playSound('warpExit');this._whiteOutToRewards(); });
        stage.classList.add('cs-shake');
    }

    _whiteOutToRewards() {
        if (this._phase === 'done') return;
        this._phase = 'done';
        const overlay = document.getElementById('mission-cutscene');
        if (overlay) {
            const white = document.createElement('div');
            white.className = 'cs-whiteout';
            overlay.appendChild(white);
        }
        this._after(TimeTravelManager.MISSION_TIMING.whiteFade + TimeTravelManager.MISSION_TIMING.rewardHold, () => { this._teardownCutscene(); this._showRewards(); });
    }

    /**
     * Context-aware skip: part 1 skips to Cateland; Cateland chatter skips to the
     * choice (which itself must be answered); the drive/impact skips to the rewards.
     */
    _skip() {
        if (!this._skipAllowed) return;
        this._clearTimers();
        this._stopAllLoops();
        if (this._phase === 'travel') {
            this._cateland();
        } else if (this._phase === 'cateland') {
            this._showChoice();
        } else if (this._phase === 'drive' || this._phase === 'impact') {
            this._whiteOutToRewards();
        } else if (this._phase === 'done') {
            // Skip spammed during the whiteout: _clearTimers() above just killed the
            // pending rewards timer, so finish synchronously instead of hanging on
            // a white screen forever.
            this._teardownCutscene();
            this._showRewards();
        }
    }

    _teardownCutscene() {
        this._clearTimers();
        this._stopAllLoops();
        for (const sound of Object.values(this._sounds)) { sound.pause();sound.currentTime=0; }
        const overlay = document.getElementById('mission-cutscene');
        if (overlay) overlay.remove();
    }

    _clearTimers() {
        this._timers.forEach(t => { clearTimeout(t); clearInterval(t); });
        this._timers = [];
        if (this._tauntInterval) clearInterval(this._tauntInterval);
        if (this._dustInterval) clearInterval(this._dustInterval);
        if (this._lnInterval) clearInterval(this._lnInterval);
        if (this._zapInterval) clearInterval(this._zapInterval);
    }

    // ============================ MISSION PASSED / REWARDS ============================

    _showRewards() {
        // Guard: the whiteout timer and a skip click can race — only present once.
        if (this._rewardsShown) return;
        this._rewardsShown = true;
        this._playSound('complete');
        // Build the rewards now (so the cards show real data), then present them one by one.
        const rewards = this._buildRewards();
        this._presentReward(0, rewards, this._payoutContext);
    }

    _presentReward(index, rewards, quote) {
        if (quote !== this._payoutContext) return;
        if (index >= rewards.length) {
            this._executeTimelineReset(quote);
            return;
        }
        const r = rewards[index];
        let overlay = document.getElementById('mission-passed');

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'mission-passed';
            overlay.className = 'mission-passed';
            document.body.appendChild(overlay);

            overlay.innerHTML = `
                <div class="mp-banner mp-anim-banner">
                    <span class="mp-banner-text mp-anim-text">MISSION PASSED</span>
                </div>
                <div class="mp-body mp-anim-body">
                    <div class="mp-receive">YOU RECEIVE:</div>
                    <div class="mp-item" id="mp-item">${r.html}</div>
                    <button class="mp-ok" id="mp-ok">OK</button>
                </div>`;

            this._attachOkListener(index, rewards, quote);
        } else {
            // Smoothly cross-fade to the next reward item
            const itemEl = document.getElementById('mp-item');
            if (itemEl) {
                itemEl.classList.add('mp-fade-out');
                this._after(200, () => {
                    if (quote !== this._payoutContext) return;
                    itemEl.innerHTML = r.html;
                    itemEl.classList.remove('mp-fade-out');
                    itemEl.classList.add('mp-fade-in');
                    this._after(300, () => itemEl.classList.remove('mp-fade-in'));
                    this._attachOkListener(index, rewards, quote);
                });
            } else {
                this._attachOkListener(index, rewards, quote);
            }
        }
    }

    _attachOkListener(index, rewards, quote) {
        const btn = document.getElementById('mp-ok');
        if (!btn) return;
        this.game.playSound('select2');
        const wasFocused = document.activeElement === btn;
        const newBtn = btn.cloneNode(true);
        newBtn.disabled = false;
        btn.parentNode.replaceChild(newBtn, btn);
        if (wasFocused) newBtn.focus({ preventScroll: true });
        newBtn.addEventListener('click', () => {
            newBtn.disabled = true;
            const type = rewards[index].type;
            this.game.playSound(type==='diamonds'?'diamond1':'pickup', {volume:type==='diamonds'?.2:1});
            this._presentReward(index + 1, rewards, quote);
        }, { once: true });
    }

    _buildRewards() {
        const p = this._payout;
        const rewards = [];

        // 1) Super Fortune (combined), only if there were combinable fortunes
        this._newSuperFortune = this._makeSuperFortune();
        if (this._newSuperFortune) {
            rewards.push({ type:'fortune', html: this._fortuneCardHTML(this._newSuperFortune, 'mp-super') });
        }

        // 2) Chosen D.I.A. Badge (built as a real fortune)
        this._newBadge = this._makeBadgeFortune(this._chosenBadge, p.badgeStat);
        rewards.push({ type:'fortune', html: this._fortuneCardHTML(this._newBadge, 'mp-badge') });

        // 3) Dogediamonds (with spinning sunburst)
        rewards.push({
            type:'diamonds',
            html: `<div class="mp-burst"></div>
                <img src="assets/general/icons/diamonds_stack.webp" class="mp-diamond-img" alt="Dogediamonds">
                <div class="mp-diamond-label">DOGEDIAMONDS</div>
                <div class="mp-diamond-amount">${p.total}x</div>`
        });

        return rewards;
    }

    _fortuneCardHTML(fortune, extraClass) {
        const rarityLabel = (fortune.rarity || 'rare').charAt(0).toUpperCase() + (fortune.rarity || 'rare').slice(1);
        const statsHtml = (fortune.stats || []).map(s => {
            const cls = (s.value < 0) ? 'mp-stat-neg' : 'mp-stat-pos';
            const sign = s.value < 0 ? '-' : '+';
            const pct = (s.indicator && s.indicator.includes('%')) ? '%' : '';
            return `<div class="${cls}">${sign}${this.game.formatNumber(Math.abs(s.value))}${pct} ${s.displayName}</div>`;
        }).join('');
        return `
            <div class="mp-burst"></div>
            <div class="mp-fortune ${extraClass} rarity-${(fortune.rarity || 'rare')}">
                <div class="mp-fortune-card">
                    <div class="mp-fortune-tag">[PROTECTED]</div>
                    <img src="${fortune.sprite}" alt="${fortune.name}">
                    <div class="mp-fortune-cardname">${fortune.name}</div>
                </div>
                <div class="mp-fortune-detail">
                    <div class="mp-fortune-rarity">${rarityLabel} Fortune</div>
                    <div class="mp-fortune-name">${fortune.name.toUpperCase()}</div>
                    <div class="mp-fortune-desc">${fortune.description || ''}</div>
                    <div class="mp-fortune-stats">${statsHtml}</div>
                </div>
            </div>`;
    }

    // ---- Fortune builders ----

    _makeBadgeFortune(type, value) {
        const map = {
            wow: { name: 'D.I.A. Badge (Wow)', stat: 'wow', display: 'Wow', desc: 'This badge is wow.<br>For distinguished D.I.A. agents only.' },
            luck: { name: 'D.I.A. Badge (Luck)', stat: 'luck', display: 'Luck', desc: 'Luck favours the bold.<br>For distinguished D.I.A. agents only.' },
            loot: { name: 'D.I.A. Badge (Loot)', stat: 'lootfind', display: 'Loot Find', desc: 'With this badge, finding things are easier.<br>For distinguished D.I.A. agents only.' }
        };
        const m = map[type] || map.wow;
        return {
            instanceId: `dia_badge_${type}_${Date.now()}`,
            templateId: `dia_badge_${type}`,
            name: m.name,
            rarity: 'rare',
            description: m.desc,
            sprite: 'assets/general/diabadge.webp',
            stats: [{ name: m.stat, displayName: m.display, indicator: '+%', isCore: true, value: value }],
            isDiaBadge: true,
            isProtected: true
        };
    }

    /** Combines all non-protected fortunes (incl. the previous Super Fortune) into one. */
    _makeSuperFortune() {
        const inv = this.game.fortuneInventory || [];
        const combinable = inv.filter(f => this._isCombinable(f));
        if (combinable.length === 0) return null;

        const map = {};
        combinable.forEach(f => (f.stats || []).forEach(s => {
            const key = window.DogeMinerBalance?.statKey(s, 'fortune', f) || s.name;
            // Keep previously earned merged bonuses, including Alpha-only ones.
            // New ordinary fortunes follow DM2's exclusions at prestige.
            if (!f.isSuperFortune && (['persec', 'dps', 'dpsp', 'rockets'].includes(key)
                || ['dps', 'spacerocketcosts', 'rocketcostreduction'].includes(s.name))) return;
            if (!map[key]) map[key] = { name: s.name, balanceKey: key, displayName: s.displayName, indicator: s.indicator, isCore: s.isCore, value: 0 };
            map[key].value += (s.value || 0);
        }));
        const stats = Object.values(map).map(s => ({ ...s }));

        return {
            instanceId: `super_fortune_${Date.now()}`,
            templateId: 'super_fortune',
            name: 'Super Fortune',
            rarity: 'legendary',
            description: 'This fortune contains stats from another timeline.',
            sprite: 'assets/general/icons/Fortunes/Protected Non Seasonal/Super Fortune/superfortune.webp',
            stats,
            isSuperFortune: true,
            isProtected: true
        };
    }

    /** Combinable = normal fortunes + the previous Super Fortune; excludes protected/seasonal/badges. */
    _isCombinable(f) {
        if (!f) return false;
        if (f.isSuperFortune) return true; // previous timeline's Super Fortune folds into the new one
        if (f.isProtected || f.isSoulbound || f.isDiaBadge || f.isSeasonal || f.protected
            || window.DogeMinerBalance?.getDefinition('fortune', f)?.protected) return false;
        if (f.templateId === 'badge_of_patronage' || (f.name || '').startsWith('D.I.A. Badge')) return false;
        return true;
    }

    // ============================ TIMELINE RESET (PRESTIGE) ============================

    _executeTimelineReset(quote = this._payoutContext) {
        const g = this.game;
        if (!this._payout || this._payoutApplied || !quote || quote !== this._payoutContext || quote.timeline !== (g.timelineNumber || 1)
            || quote.currencyEpoch !== (g._currencyFlightEpoch || 0)) return false;
        const before = { ...g };
        this._payoutApplied = true;

        try {
            // Keep: protected/seasonal fortunes + badges (not combinable), plus the new badge
            // and the new super fortune. Everything else (combinable) is consumed.
            const newInventory = (g.fortuneInventory || []).filter(f => !this._isCombinable(f));
            if (this._newSuperFortune) newInventory.push(this._newSuperFortune);
            if (this._newBadge) newInventory.push(this._newBadge);
            g.fortuneInventory = TimeTravelManager.consolidateFortunes(newInventory);
            g.inventoryUnread = { pickaxe: 0, fortune: 0 };
            g.latestObtainedFortune = null;

            // Award Dogediamonds (protected currency)
            const earned = this._payout.total;
            g.dogediamonds = (g.dogediamonds || 0) + earned;
            g.dogediamondsEverObtained = (g.dogediamondsEverObtained || 0) + earned;

            // Advance the timeline
            if(g.nextTimelineLateProgression) g.lateProgression=g.nextTimelineLateProgression((g.timelineNumber||1)+1);
            if (g.nextTimelineWorldDiscovery) g.worldDiscovery = g.nextTimelineWorldDiscovery((g.timelineNumber || 1) + 1);
            if (g.nextTimelineStoryProgress) g.storyProgress = g.nextTimelineStoryProgress((g.timelineNumber || 1) + 1);
            g.completeTimelineRecord?.({ choice: this._missionChoice, badge: this._chosenBadge, diamonds: earned });
            if (g.nextTimelineLootAutomation) g.lootAutomation = g.nextTimelineLootAutomation((g.timelineNumber || 1) + 1);
            g.timelineNumber = (g.timelineNumber || 1) + 1;

            // --- Wipe progression ---
            g.offlineEarningsReport = null;
            g._currencyFlightEpoch = (g._currencyFlightEpoch || 0) + 1;
            g.pendingCoinDisplayAmount = 0;
            g.pendingDiamondDisplayAmount = 0;
            g.activeEffectCount = 0;
            g.dogecoins = 0;
            g.helpers = []; g.moonHelpers = []; g.marsHelpers = []; g.jupiterHelpers = []; g.titanHelpers = [];
            g.earthPlacedHelpers = []; g.moonPlacedHelpers = []; g.marsPlacedHelpers = [];
            g.jupiterPlacedHelpers = []; g.titanPlacedHelpers = [];
            g.placedHelpers = []; g.helpersOnCursor = []; g.placementQueue = []; g.isPlacingHelpers = false;
            g.upgrades = {}; g.helperUpgradeLevels = {}; g.helperUpgradeOffers = {};
            g.searchdogeDiscovery = null;
            g.dogebagStacks = {};
            g.diamondStacks = {};
            g.currentLevel = 'earth';
            document.body.dataset.planet = 'earth';
            g.rocksBroken = 0;
            g.planetRockData = {
                earth: { rocksBroken: 0, rockLevel: 1, currentHP: null, maxHP: null },
                moon: { rocksBroken: 0, rockLevel: 1, currentHP: null, maxHP: null },
                mars: { rocksBroken: 0, rockLevel: 1, currentHP: null, maxHP: null },
                jupiter: { rocksBroken: 0, rockLevel: 1, currentHP: null, maxHP: null },
                titan: { rocksBroken: 0, rockLevel: 1, currentHP: null, maxHP: null }
            };
            g.rockLevel = 1;
            g._helperRockElapsed = 0;
            g.lastPickaxeDropTime = 0;
            g.prizesSinceLastPickaxe = 0;
            g.mysteryBoxLastKind = 'pickaxe';
            g._rockStateEpoch = (g._rockStateEpoch || 0) + 1;
            g.isRockRegenerating = false;
            g.rockBaseHP = g.getPlanetRockBaseHP('earth');
            g.rockMaxHP = g.rockBaseHP;
            g.rockCurrentHP = g.rockMaxHP;
            g.maxPickaxeDPC = 1;

            // Mystery Box progress resets with the timeline (its fortune got combined)
            g.mysteryBoxObtained = false;
            g.mysteryBoxEvolutionPending = false;
            g._mysteryEvolution = null; g._mysteryEntryAt = 0;
            g.mysteryBoxOpenCount = 0;
            g.mysteryBoxCycle = 0;
            g._mysteryBoxReadyAt = null;
            g.mysteryBoxTimerRemaining = 0;
            g.mysteryBoxLastSaveTime = 0;
            g.moonDogebagCount = 0;

            // The 3rd Searchdoge slot persists across time travel once unlocked
            // (g.searchdogeSlot3Unlocked is retained)

            // The player has seen the Moon launch already — don't replay it each timeline.
            g.hasPlayedMoonLaunch = true;


            // Bare paws: the player loses all pickaxes and starts with the Paw.
            const paw = TimeTravelManager.createStartingPaw();
            g.pickaxeInventory = [paw];
            g.equippedPickaxeId = 'timeline_paw';

            // Reset Bonus Coin tier (helpers gone) and clear any active buff/on-screen coin
            g.bonusCoinLevel = 1; g.bonusCoinSeenLevel = 0;
            g.bonusCoinMaxPlanetLevel = 1; g.bonusCoinBuffTier = 0;
            g.bonusCoinBuffMultiplier = 1; g.bonusCoinBuffEndTime = 0;
            // Recompute & refresh
            g.recalculatePlayerStats();
            g.rockMaxHP = g.getRockHP(g.rockBaseHP, 0, 'earth');
            g.rockCurrentHP = g.rockMaxHP;
            g.updateDPS();
            const save = window.saveManager;
            const saved = save?.commitTimelineReset ? save.commitTimelineReset() : save?.saveGame(false);
            if (saved === false) throw new Error('The timeline reset could not be saved.');
        } catch (error) {
            // The original inventory and ledger were never mutated. Restore the
            // live run if either the primary save or its companion backup fails.
            for (const key of Object.keys(g)) if (!Object.hasOwn(before, key)) delete g[key];
            Object.assign(g, before);
            document.body.dataset.planet = g.currentLevel;
            this._payoutApplied = false;
            g._rickBoostedSprites = new Set();
            g._dogebagFieldPlanet = null;
            g.recalculatePlayerStats();
            g.updateUI();
            g.showNotification?.('Mission rewards could not be saved. Your original progress is restored. Try again.');
            const button = document.getElementById('mp-ok');
            if (button) {
                const retry = button.cloneNode(true);
                retry.textContent = 'TRY AGAIN'; retry.disabled = false;
                button.replaceWith(retry);
                retry.addEventListener('click', () => this._executeTimelineReset(quote), { once: true });
            }
            console.error('Could not commit mission rewards:', error);
            return false;
        }

        // Destructive presentation cleanup follows the durable inventory/history
        // commit, so a failed save leaves the visiting helpers and rewards usable.
        g.restoreStoryProgress?.({ timelineNumber: g.timelineNumber, storyProgress: g.storyProgress });
        g.restoreWorldDiscovery?.({ ...g, worldDiscovery: g.worldDiscovery });
        g.resetRickVisitor?.();
        g.despawnRick?.({ animate: false });
        g.closeOfflineEarningsReport?.();
        g.resetDogebagPresentation?.();
        g.resetDogebagStacks?.();
        g._expireBonusCoinBuff?.();
        g._removeBonusCoinEl?.();
        g.resetBonusCoinSpawnCycle?.();
        g.isMouseDown = false; g.isSpaceDown = false;
        if (g.swingTimeout) clearTimeout(g.swingTimeout);
        g.swingTimeout = null; g._currentIdleSpritePath = null;
        g.equipPickaxe?.('timeline_paw', {sound:false});
        const mboxBtn = document.getElementById('mystery-box-btn');
        if (mboxBtn) mboxBtn.style.display = 'none';
        const fortunePreviewImg = document.getElementById('fortune-btn-preview');
        if (fortunePreviewImg) {
            fortunePreviewImg.src = ''; fortunePreviewImg.alt = 'Fortunes';
            fortunePreviewImg.classList.add('fortune-icon-placeholder'); fortunePreviewImg.style.visibility = 'hidden';
        }
        document.body.classList.remove('moon-theme', 'planet-mars', 'planet-jupiter', 'planet-titan');
        window.uiManager?.updateCharacter?.('standard');
        window.uiManager?.updateBackground?.('earth');
        const platform = document.getElementById('platform');
        if (platform) platform.src = '../assets/quickUI/dogeplatform.webp';
        g.setPlanetBackgrounds?.('earth', { reset: true });
        window.uiManager?.initializePlanetTabs?.();
        window.uiManager?.updateMobilePlanetDisplay?.();
        g.isCutscenePlaying = false;
        g.isPlaying = true;
        g.syncStorySettings?.();
        g.updateDiamondCounter();
        g.updateUI();
        if (window.uiManager) {
            if (window.uiManager.updateShopContent) window.uiManager.updateShopContent();
        }
        // Remove the on-screen helper sprites too
        if (typeof g.clearAllHelperSprites === 'function') g.clearAllHelperSprites();
        this.updateDogetalkieButton();

        // Keep Doge hidden until the saved timeline-return story is acknowledged
        const cc = document.getElementById('character-container');
        const pickaxe = document.getElementById('pickaxe');
        if (cc) {
            cc.style.visibility = 'hidden';
            cc.style.transform = 'translateY(-520px)';
        }
        if (pickaxe) {
            pickaxe.classList.remove('swing-down');
            pickaxe.style.visibility = 'hidden';
        }
        g.isIntroPlaying = true;

        if (window.audioManager && typeof window.audioManager.playBackgroundMusic === 'function') {
            window.audioManager.playBackgroundMusic();
        }

        // Clear the reward overlay before delivering the queued return story
        const mp = document.getElementById('mission-passed');
        if (mp) {
            if (window.PopupPresentation) window.PopupPresentation.close(mp);
            else mp.remove();
        }
        this._showYouKnowTheDrill();
        return true;
    }

    // ============================ "YOU KNOW THE DRILL" ============================

    _showYouKnowTheDrill() {
        // The saved story queue selects the narrative for this timeline. Its
        // acknowledgment starts the arrival only after progress is committed.
        if (!this.game.beginTimelineReturn?.()) this._zapDogeToPlatform();
    }

    _zapDogeToPlatform() {
        const cc = document.getElementById('character-container');
        const doge = document.getElementById('main-character');
        const pickaxe = document.getElementById('pickaxe');
        if (!cc) { this.game.isIntroPlaying = false; this.game._storyReturnArrival = null; return; }
        const epoch = this.game._storyEpoch, timeline = this.game.timelineNumber;

        cc.style.transform = '';
        cc.style.visibility = 'visible';
        if (doge) doge.style.opacity = '0';
        if (pickaxe) {
            pickaxe.style.visibility = 'visible';
            pickaxe.style.opacity = '0';
        }
        this._playSound('lightningBig');
        const enterTimer=setTimeout(()=>{if(epoch===this.game._storyEpoch&&timeline===this.game.timelineNumber)this._playSound('warp');},500);

        const bolt = document.createElement('img');
        bolt.className = 'cs-zap-bolt';
        bolt.style.position = 'absolute';
        bolt.style.top = '-20px';
        bolt.style.left = '50%';
        bolt.style.transform = 'translateX(-50%)';
        bolt.style.zIndex = '999';
        cc.appendChild(bolt);

        const zapFlash = document.createElement('div');
        zapFlash.className = 'cs-zap-flash';
        cc.appendChild(zapFlash);

        let frame = 1;
        let zapInterval;
        const cleanup = () => { clearInterval(zapInterval);clearTimeout(enterTimer);bolt.remove();zapFlash.remove(); };
        this.game._storyArrivalCancel = cleanup;
        zapInterval = setInterval(() => {
            if (epoch !== this.game._storyEpoch || timeline !== this.game.timelineNumber) { cleanup(); return; }
            bolt.src = `assets/general/missions/lightning/ln${((frame - 1) % 5) + 1}.webp`;
            frame++;
            if (frame > 8) {
                cleanup();
                this.game._storyArrivalCancel = null;
                this.game._storyReturnArrival = null;
                if (doge) doge.style.opacity = '1';
                if (pickaxe) pickaxe.style.opacity = '';
                if (this.game) this.game.isIntroPlaying = false;
            }
        }, 90);
    }

    // ============================ SOUND ============================

    _audio(key) {
        const paths = {
            radio: '../assets/SoundsSrc/main/radio_start.wav',
            carStart: '../assets/SoundsSrc/missions/car_start.mp3',
            carLoop: '../assets/SoundsSrc/missions/car_driving_loop.mp3',
            tireBurn: '../assets/SoundsSrc/missions/tireburn.wav',
            brake: '../assets/SoundsSrc/missions/brake.wav',
            warp: '../assets/SoundsSrc/missions/ln_enter.wav',
            warpExit: '../assets/SoundsSrc/missions/ln_exit.wav',
            lightningSmall: '../assets/SoundsSrc/missions/ln_small.wav',
            lightningLate: '../assets/SoundsSrc/missions/ln_short-late.mp3',
            burnDrive: '../assets/SoundsSrc/missions/burn_and_drive.mp3',
            lightningBig: '../assets/SoundsSrc/missions/ln_big.mp3',
            complete: '../assets/SoundsSrc/missions/mission_complete.wav',
            missionLoop: '../assets/SoundsSrc/missions/test_mission_loop_cool.wav'
        };
        if (!paths[key]) return null;
        if (!this._sounds[key]) this._sounds[key] = new Audio(paths[key]);
        const volumes={radio:.2,carStart:.35,carLoop:.1,burnDrive:.3,brake:.3,warpExit:.4,missionLoop:.1};
        this._sounds[key].volume=(volumes[key]??.5)*(window.audioManager?.soundVolume??1);
        window.audioManager?.applyMediaPolicy?.(this._sounds[key]);
        return this._sounds[key];
    }

    _playSound(key, volume) {
        if (this.game.soundEnabled === false || window.audioManager?.isBackgroundMuted?.()) return;
        try { const a = this._audio(key);if(!a)return;if(Number.isFinite(volume))a.volume=volume*(window.audioManager?.soundVolume??1);a.currentTime = 0; a.play().catch(() => {}); } catch (e) {}
    }

    _playLoop(key) {
        if (this.game.soundEnabled === false || window.audioManager?.isBackgroundMuted?.()) return;
        try {
            const a = this._audio(key);
            a.loop = true;
            a.currentTime = 0;
            a.play().catch(() => {});
            if (!this._activeLoops.includes(key)) this._activeLoops.push(key);
        } catch (e) {}
    }

    _stopLoop(key) {
        const a = this._sounds[key];
        if (a) { a.pause(); a.currentTime = 0; }
        this._activeLoops = this._activeLoops.filter(k => k !== key);
    }

    _stopAllLoops() { this._activeLoops.slice().forEach(k => this._stopLoop(k)); }
}

window.TimeTravelManager = TimeTravelManager;
