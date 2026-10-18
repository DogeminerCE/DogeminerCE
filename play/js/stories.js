// DM2 story queue: saved seen IDs, ordered delivery and completion effects.
// Effects edit the supplied draft; the save and its backup commit before dismissal.
(function () {
    'use strict';
    const definitions = new Map();
    const ALWAYS_SHOW = new Set(['welcomeback', 'newtimeline', 'newtimeline2', 'newtimeline3', 'newtimeline4', 'newtimeline5', 'catepril', 'easter', 'eggz21']);
    const FIRST_TIMELINE = new Set(['bonus', 'last', 'temp1', 'music', 'yaypat']);
    const RECEIPTS = new Set(['welcomeback', 'MBOX']);
    const SURVIVORS = new Set(['music', 'yaypat', 'titan1', 'upgfast2k']);
    const timelineOf = value => Math.max(1, Math.floor(Number.isFinite(value) ? value : 1));
    const timelineReturnId = timeline => timeline === 2 ? 'newtimeline' : timeline === 3 ? 'newtimeline3'
        : timeline === 4 ? 'newtimeline4' : timeline > 4 ? 'newtimeline5' : null;
    const idIsValid = id => typeof id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(id);
    function ids(value) {
        if (value == null) return [];
        if (!Array.isArray(value) || value.length > 2048 || value.some(id => !idIsValid(id))) throw new Error('Story progress contains invalid IDs.');
        return [...new Set(value)];
    }
    function normalize(raw, timeline = 1) {
        timeline = timelineOf(timeline);
        if (raw != null && (raw.version !== 1 || raw.timeline !== timeline)) throw new Error('This story-progress version or timeline is not supported.');
        const extraDps = raw?.extraDps ?? 0;
        if (!Number.isFinite(extraDps) || extraDps < 0) throw new Error('Story income is invalid.');
        const seen = ids(raw?.seen);
        const revision = raw?.completionHistoryVersion;
        if (revision != null && ![0,1].includes(revision)) throw new Error('This story-completion history version is not supported.');
        return { version: 1, timeline, seen, pending: ids(raw?.pending).filter(id => !seen.includes(id)), extraDps,
            ...(raw == null || revision === 1 ? {completionHistoryVersion:1} : {}) };
    }
    function register(definition) {
        if (!idIsValid(definition?.id) || typeof definition.title !== 'string' || definitions.has(definition.id)) throw new Error('Invalid or duplicate story definition.');
        definitions.set(definition.id, Object.freeze({ ...definition }));
    }
    const proto = DogeMinerGame.prototype;
    proto.getStoryProgressForSave = function () {
        const state = this.storyProgress || normalize(null, this.timelineNumber);
        return { ...state, seen: [...state.seen], pending: [...state.pending] };
    };
    proto.resetStoryPresentation = function () {
        this._storyEpoch = (this._storyEpoch || 0) + 1;
        this.resetNewsDoge?.();
        this.resetWorldDiscoveryPresentation?.();
        this._storyArrivalCancel?.(); this._storyArrivalCancel = null;
        if (this._storyReturnArrival) {
            this.isIntroPlaying = false;
            for (const id of ['character-container', 'main-character', 'pickaxe']) {
                const node = document.getElementById(id);
                if (node) { node.style.visibility = ''; node.style.transform = ''; node.style.opacity = ''; }
            }
        }
        this._storyReturnArrival = null;
        this._storyFollowups = [];
        this.clearStartingHint?.();
        for (const node of this._storyFlashingCards || []) node.classList.remove('story-rocket-flash');
        this._storyFlashingCards = [];
        this._activeStory?.view?.close();
        window.PopupPresentation?.finishClosing();
        this._activeStory = null;
        this.isStoryOpen = false;
    };
    proto.noteStoryLocation = function () {
        this._storyLocationPlanet = this.currentLevel;
        this._storyLocationStartedAt = Date.now();
    };
    proto.restoreStoryProgress = function (save = {}) {
        const state = normalize(save.storyProgress, save.timelineNumber);
        this.resetStoryPresentation();
        this.storyProgress = state;
        this._storySkipped = new Set();
        this._storyRetryAt = 0;
        this._storyNextAt = 0;
        this._storyCheckMs = 0;
        this.noteStoryLocation();
    };
    proto.nextTimelineStoryProgress = function (nextTimeline) {
        const state = this.getStoryProgressForSave();
        const keep = state.seen.filter(id => SURVIVORS.has(id)
            || (this.holiday === 'easter' && ['eastr21', 'eggz21'].includes(id)));
        const next = timelineOf(nextTimeline), id = timelineReturnId(next);
        return { version: 1, timeline: next, seen: [...new Set(['music', 'yaypat', ...keep])], pending: id ? [id] : [], extraDps: 0, completionHistoryVersion:1 };
    };
    proto.getStoryDPS = function () { return this.storyProgress?.extraDps || 0; };
    proto.syncStorySettings = function () {
        for (const [id, key] of [['hints', 'hintsEnabled'], ['stories', 'storiesEnabled'], ['news', 'newsEnabled']]) {
            for (const prefix of ['', 'mobile-']) {
                const checkbox = document.getElementById(`${prefix}${id}-enabled`);
                if (checkbox) checkbox.checked = this[key] !== false;
                if (id !== 'hints') {
                    const row = checkbox?.closest('.setting-item');
                    if (row) row.hidden = (this.timelineNumber || 1) <= 2;
                }
            }
        }
    };
    proto.setStoryPreference = function (key, value) {
        if (!['hintsEnabled', 'storiesEnabled', 'newsEnabled'].includes(key)) return false;
        const before = this[key]; this[key] = Boolean(value);
        const saved = this._commitStoryProgress(this.getStoryProgressForSave());
        if (!saved) this[key] = before;
        if (this.hintsEnabled === false) this.clearStartingHint();
        if (this.newsEnabled === false) { this.hideNewsDoge?.(); this._newsQueue = []; this._newsNextAt = 0; }
        this.syncStorySettings();
        if (saved) window.audioManager?.playSound('check');
        return saved;
    };
    proto._commitStoryProgress = function (next) {
        try { next = normalize(next, this.timelineNumber); }
        catch (error) { console.error('Invalid story completion:', error); return false; }
        const before = { ...this };
        this.storyProgress = next;
        try {
            this.updateDPS?.();
            if (window.saveManager?.commitStoryProgress?.() !== true) throw new Error('Story progress could not be saved.');
            this._storyRetryAt = 0;
        } catch (error) {
            for (const key of Object.keys(this)) if (!Object.hasOwn(before, key)) delete this[key];
            Object.assign(this, before);
            this._storyRetryAt = Date.now() + 1000;
            this.updateDPS?.();
            console.error('Could not commit story progress:', error);
            return false;
        }
        try { this.updateUI?.(); } catch (error) { console.error('Story display refresh failed:', error); }
        return true;
    };
    proto.queueStory = function (id) {
        const definition = definitions.get(id);
        if (!definition || (FIRST_TIMELINE.has(id) && (this.timelineNumber || 1) > 1) || this._storySkipped?.has(id)) return false;
        const next = this.getStoryProgressForSave();
        if (next.seen.includes(id) || next.pending.includes(id) || this._activeStory?.id === id) return false;
        next.pending.push(id);
        return this._commitStoryProgress(next);
    };
    proto.canPresentStory = function () {
        return Boolean(this._bootComplete && this.isPlaying && !document.hidden && document.hasFocus?.() !== false
            && (!this.isIntroPlaying || this._storyReturnArrival?.waiting === true)
            && !this.isCutscenePlaying && !this.isTransitioning && !this.isBetaReportOpen && !this.isOfflineReportOpen
            && !(this.betaMigrationReport && !this.betaMigrationReport.acknowledged) && !(this.offlineEarningsReport && !this.offlineEarningsReport.acknowledged)
            && !this._dogebagReveal && !this._helperDrag && !this.isPlacingHelpers && !this.helpersOnCursor?.length && !this.isMouseDown && !this.isSpaceDown
            && !window.controllerManager?._dialogOpen
            && !document.querySelector('.modal.active, .switcher-modal.active, .dialog-overlay.active, .dia-mission-modal.active, .dia-warning-modal.active, #mission-passed, #mission-cutscene, #controller-dialog.active'));
    };
    proto.completeStory = function (token) {
        if (!token || token !== this._activeStory || token.epoch !== this._storyEpoch || token.timeline !== (this.timelineNumber || 1)) return false;
        const definition = definitions.get(token.id), next = this.getStoryProgressForSave();
        if (!definition || !next.pending.includes(token.id) || next.seen.includes(token.id)) return false;
        next.pending = next.pending.filter(id => id !== token.id);
        const noPops = (window.location?.hash || '').includes('nopops');
        if (!noPops && !RECEIPTS.has(token.id) && definition.remember !== false) next.seen.push(token.id);
        try { definition.effect?.(this, next); }
        catch (error) { console.error('Could not prepare story effect:', error); return false; }
        if (!this._commitStoryProgress(next)) return false;
        if (noPops || RECEIPTS.has(token.id) || definition.remember === false) { this._storySkipped ||= new Set(); this._storySkipped.add(token.id); }
        this._activeStory = null;
        this.isStoryOpen = false;
        this._storyNextAt = Date.now() + 500;
        token.view?.close({ animate: true });
        if (token.view) window.audioManager?.playSound('swipe_fast_low');
        // Follow-up presentation starts only after the acknowledgment is durable.
        // Save replacement invalidates these runtime tasks rather than replaying
        // an old tutorial or notification over the newly loaded game.
        try { definition.afterComplete?.(this); }
        catch (error) { console.error('Story follow-up failed:', error); }
        return true;
    };
    proto.deliverNextStory = function () {
        if (!this.storyProgress?.pending?.length || this._activeStory || Date.now() < (this._storyNextAt || 0) || Date.now() < (this._storyRetryAt || 0) || !this.canPresentStory()) return false;
        const state = this.getStoryProgressForSave();
        const id = state.pending.find(id => definitions.has(id) && !this._storySkipped?.has(id)
            && (!this._storyReturnArrival?.waiting || id === this._storyReturnArrival.id));
        if (!id) return false;
        const definition = definitions.get(id);
        this._storyEpoch ||= 1;
        const token = { id, epoch: this._storyEpoch, timeline: this.timelineNumber || 1, view: null };
        this._activeStory = token;
        const suppressed = (window.location?.hash || '').includes('nopops') || (this.storiesEnabled === false && !ALWAYS_SHOW.has(id) && !definition.alwaysShow);
        if (suppressed) {
            const done = this.completeStory(token);
            if (!done) this._activeStory = null;
            return done;
        }
        this.isStoryOpen = true;
        this.isMouseDown = false; this.isSpaceDown = false; this.endSwing?.();
        try {
            token.view = this._showStoryPopup(definition, token);
            window.audioManager?.playSound(definition.sound || 'nice_popup');
            return true;
        } catch (error) {
            this.resetStoryPresentation();
            console.error('Could not display story:', error);
            return false;
        }
    };
    proto.advanceStoryEvents = function (deltaMs) {
        this.advanceMysteryBoxEvolution?.();
        if (this._storyLocationPlanet !== this.currentLevel) this.noteStoryLocation();
        if (!this._bootComplete || !this.isPlaying || document.hidden || this.isStoryOpen) return;
        if (this._storyFollowups?.length && this.canPresentStory()) this.advanceStoryFollowups(Date.now());
        this._storyCheckMs = (this._storyCheckMs || 0) + Math.max(0, Math.min(1000, deltaMs || 0));
        if (this._storyCheckMs < 500) return;
        this._storyCheckMs %= 500;
        if (!this.canPresentStory()) return;
        if (this._storyHintNode) this.advanceStoryFollowups(Date.now());
        if (Date.now() >= (this._storyRetryAt || 0)) {
            for (const definition of definitions.values()) {
                const state = this.storyProgress;
                if (!state?.seen.includes(definition.id) && !state?.pending.includes(definition.id) && !this._storySkipped?.has(definition.id)
                    && definition.eligible?.(this, Date.now())) this.queueStory(definition.id);
            }
        }
        this.deliverNextStory();
    };

    function element(tag, className, text) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (text != null) el.textContent = text;
        return el;
    }
    proto.scheduleStoryFollowup = function (delay, run) {
        this._storyFollowups ||= [];
        this._storyFollowups.push({ at: Date.now() + delay, epoch: this._storyEpoch, timeline: this.timelineNumber || 1, run });
    };
    proto.beginTimelineReturn = function () {
        const id = timelineReturnId(this.timelineNumber || 1);
        if (!id || !definitions.has(id)) return false;
        if (!this.storyProgress?.pending.includes(id) && !this.queueStory(id)) return false;
        this._storyReturnArrival = { id, waiting: true };
        this.isIntroPlaying = true;
        this.deliverNextStory();
        return true;
    };
    proto.finishTimelineReturn = function (id) {
        if (!this._storyReturnArrival?.waiting || this._storyReturnArrival.id !== id) return;
        this._storyReturnArrival.waiting = false;
        window.timeTravelManager?._zapDogeToPlatform();
    };
    proto.showStoryNews = function ({ id, title, info, details }) {
        // Source notifications (bc) are independent of the NewsDoge preference.
        const manager = window.notificationManager;
        if (!manager) return false;
        const node=manager.showEvent({id,title,info,details,type:'info'});
        if(!node)return false;
        node.classList.add('story-news');node.dataset.storyNews=id;
        return true;
    };
    proto.advanceStoryFollowups = function (now) {
        const tasks = this._storyFollowups || [];
        this._storyFollowups = [];
        for (const task of tasks) {
            if (task.epoch !== this._storyEpoch || task.timeline !== (this.timelineNumber || 1)) continue;
            if (task.at > now) this._storyFollowups.push(task);
            else task.run();
        }
        if (this._storyHintNode) {
            if (this.hintsEnabled === false || this.totalClicks > 0 || this.currentLevel !== 'earth') this.clearStartingHint();
            else this.positionStartingHint();
        }
    };
    proto.clearStartingHint = function () {
        this._storyHintNode?.remove(); this._storyHintNode = null;
    };
    proto.positionStartingHint = function () {
        const rock = document.getElementById('rock-container')?.getBoundingClientRect();
        if (!rock || !this._storyHintNode) return;
        const viewport = window.visualViewport;
        const left = viewport?.offsetLeft || 0, width = viewport?.width || innerWidth;
        const boxWidth = Math.min(270, width - 24);
        Object.assign(this._storyHintNode.style, { width: `${boxWidth}px`,
            left: `${Math.max(left + 12, Math.min(left + width - boxWidth - 12, rock.left + rock.width / 2 - boxWidth / 2))}px`,
            top: `${Math.max((viewport?.offsetTop || 0) + 40, rock.top - this._storyHintNode.offsetHeight - 24)}px` });
    };
    proto.showStartingHint = function () {
        if (this.hintsEnabled === false || (this.timelineNumber || 1) !== 1 || this.totalClicks > 0 || this.currentLevel !== 'earth') return false;
        this.clearStartingHint();
        this._storyHintNode = element('div', 'story-mining-hint', `${this.isMobileDevice?.() ? 'Tap' : 'Click'} on the rock to mine dogecoins`);
        this._storyHintNode.setAttribute('role', 'status');
        document.documentElement.append(this._storyHintNode); this.positionStartingHint();
        return true;
    };
    proto.flashRocketShopCard = function () {
        if (this.currentLevel !== 'earth') return;
        const cards = [...document.querySelectorAll('.shop-buy-btn[data-helper-type="spaceRocket"]')]
            .map(button => button.closest('.shop-grid-item')).filter(Boolean);
        this._storyFlashingCards = cards;
        for (const card of cards) {
            card.classList.remove('story-rocket-flash'); void card.offsetWidth;
            card.classList.add('story-rocket-flash');
            card.addEventListener('animationend', () => card.classList.remove('story-rocket-flash'), { once: true });
        }
    };
    const colorClasses = { red: 'story-popup-red', blue: 'story-popup-blue', orange: 'story-popup-amount',
        green: 'story-popup-income', dark: 'story-popup-dark', earth: 'story-popup-income',
        jupiter: 'story-popup-amount', orangered: 'story-popup-red', ltblue: 'story-popup-blue', goldorange: 'story-popup-amount' };
    // These are fixed source-authored strings, rendered as text with a small
    // allowlist of emphasis tags rather than inserted as HTML.
    function markedBody(text) {
        return (game, body) => {
            const p = element('p'), stack = [p];
            for (const part of text.split(/(<\/?(?:red|blue|orange|green|dark|earth|jupiter|orangered|ltblue|goldorange|i)>)/g)) {
                const match = part.match(/^<(\/)?(red|blue|orange|green|dark|earth|jupiter|orangered|ltblue|goldorange|i)>$/);
                if (!match) stack[stack.length - 1].append(document.createTextNode(part));
                else if (match[1]) { if (stack.length > 1) stack.pop(); }
                else {
                    const node = element(match[2] === 'i' ? 'em' : 'strong', colorClasses[match[2]]);
                    stack[stack.length - 1].append(node); stack.push(node);
                }
            }
            body.append(p);
        };
    }
    const moonGoalBody = 'You need a <red>SPACE ROCKET</red> to go to <blue>THE MOON</blue>. It costs <orange>50,000</orange> <green>ĐOGECOINS</green>.';
    register({ id: 'tothemoon', title: 'TO THE MOON!', image: '../assets/SpritesheetsSrc/story/story/to_the_moon.webp',
        body: moonGoalBody, renderBody: markedBody(moonGoalBody),
        eligible: game => game.currentLevel === 'earth' && (game.timelineNumber || 1) === 1
            && !(game.helpers || []).some(helper => helper.type === 'dogeKennels'),
        afterComplete(game) {
            game.scheduleStoryFollowup(800, () => game.flashRocketShopCard());
            game.scheduleStoryFollowup(2500, () => game.showStartingHint());
        }
    });
    const firstBonusBody = 'Some objects may increase <green>INCOME</green>. A <orange>BONUSCOIN</orange> temporarily increases <green>INCOME</green> by <green>50%</green> for <dark>60 seconds</dark>.';
    register({ id: 'bonus', title: 'SUCH BONUS', image: '../assets/SpritesheetsSrc/general/general/bonuscoin.webp',
        body: firstBonusBody, renderBody: markedBody(firstBonusBody),
        eligible: game => game.bonusCoinEarlyOffered === true && game.bonusCoinClaimCount === 1
            && (game.timelineNumber || 1) === 1
    });
    const firstReturnBody = 'Well done! You are back in the present. Your <blue>TIME MACHINE</blue> was stolen on the way back. You are also missing all pickaxes. However, with this super fortune from the future, finding even better gear will be <green>easy-peasy!</green>';
    register({ id: 'newtimeline', title: 'MISSION SUCCESSFUL', image: '../assets/SpritesheetsSrc/story/story/to_the_moon.webp',
        body: firstReturnBody, renderBody: markedBody(firstReturnBody),
        eligible: game => timelineReturnId(game.timelineNumber) === 'newtimeline' && game.currentLevel === 'earth'
            && !game.isCutscenePlaying && !(game.helpers || []).some(helper => helper.type === 'dogeKennels'),
        afterComplete(game) {
            game.finishTimelineReturn('newtimeline');
            game.scheduleStoryFollowup(16000, () => game.showStoryNews({ id: 'upgfast2k', title: 'FASTER!',
                info: 'Your experience is showing', details: 'SearchDoges now sniff out upgrades <green>MUCH fast!</green>!' }));
        }
    });
    function registerLaterReturn(id, title, body) {
        register({ id, title, body, image: '../assets/SpritesheetsSrc/story/story/to_the_moon.webp', renderBody: markedBody(body),
            eligible: game => timelineReturnId(game.timelineNumber) === id && game.currentLevel === 'earth'
                && !game.isCutscenePlaying && !(game.helpers || []).some(helper => helper.type === 'dogeKennels'),
            afterComplete: game => game.finishTimelineReturn(id)
        });
    }
    registerLaterReturn('newtimeline3', 'WELL WHAT NOW?', 'History keeps repeating itself! Much confuse. Maybe try something different if you go back again? <i>PS. There are new options for turning off news and story-popups!</i>');
    registerLaterReturn('newtimeline4', 'UHH OKAY', 'Welcome back... again. You know what just happened. You know exactly what you did. On the bright side, you are getting some serious juice into these fortunes!');
    registerLaterReturn('newtimeline5', 'YOU KNOW THE DRILL', 'You know the drill. That is all. May you one day break this paradoxical curse. Godspeed.');
    class StoryPopup {
        constructor(game, definition, token) {
            this.game = game; this.token = token; this.previousFocus = document.activeElement;
            this.previousOverflow = document.body.style.overflow;
            this.inert = [...document.body.children].map(el => [el, el.inert]);
            this.overlay = element('div', 'beta-balance-overlay story-popup-overlay');
            this.overlay.id = 'story-popup'; this.overlay.dataset.planet = game.currentLevel || 'earth';
            const panel = element('section', 'beta-balance-panel story-popup-panel');
            if (definition.titleSize === 'medium') panel.classList.add('story-popup-medium-title');
            panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-labelledby', 'story-popup-title');
            const header = element('header', 'beta-balance-header');
            this.title = element('h2', 'beta-balance-title', definition.title);this.title.id = 'story-popup-title';this.title.tabIndex = -1;header.append(this.title);
            this.body = element('div', 'beta-balance-body story-popup-body');
            this.body.id = 'story-popup-content';panel.setAttribute('aria-describedby', this.body.id);
            if (definition.image) {
                const image = element('img', 'story-popup-image');image.src = definition.image;image.alt = '';this.body.append(image);
            }
            if (definition.renderBody) definition.renderBody(game, this.body);
            else this.body.append(element('p', '', definition.body || ''));
            this.error = element('p', 'beta-balance-error');this.error.hidden = true;this.error.setAttribute('role', 'alert');this.body.append(this.error);
            this.button = element('button', 'beta-balance-continue', 'CLOSE');this.button.type = 'button';
            this.closeButton = element('button', 'beta-balance-close story-popup-cross', '×');this.closeButton.type = 'button';this.closeButton.setAttribute('aria-label', 'Close story');
            const acknowledge = () => {
                if (this.closed || this.saving) return;
                this.saving = true;this.button.disabled = this.closeButton.disabled = true;
                if (game.completeStory(token)) return;
                this.error.textContent = 'Your progress could not be saved. Please try again.';this.error.hidden = false;
                this.button.textContent = 'TRY AGAIN';this.button.disabled = this.closeButton.disabled = false;this.saving = false;
            };
            this.button.addEventListener('click', acknowledge);this.closeButton.addEventListener('click', acknowledge);
            panel.append(header, this.body, this.button, this.closeButton);this.overlay.append(panel);
            this.layout = () => {
                const viewport = window.visualViewport;
                Object.assign(this.overlay.style, { left: `${viewport?.offsetLeft || 0}px`, top: `${viewport?.offsetTop || 0}px`, width: `${viewport?.width || innerWidth}px`, height: `${viewport?.height || innerHeight}px` });
                this.overlay.style.setProperty('--beta-viewport-height', `${viewport?.height || innerHeight}px`);
                window.PopupPresentation?.refresh();
            };
            this.keys = event => {
                if (event.key === 'Enter' || event.key === 'Escape' || event.key === ' ') { event.preventDefault();event.stopPropagation();acknowledge(); }
                else if (event.key === 'Tab') { event.preventDefault();(document.activeElement === this.button ? this.closeButton : this.button).focus(); }
            };
            this.focus = event => { if (!this.overlay.contains(event.target)) this.title.focus({ preventScroll: true }); };
            for (const [el] of this.inert) el.inert = true;
            document.body.style.overflow = 'hidden';document.documentElement.append(this.overlay);this.layout();
            window.PopupPresentation?.mount(this.overlay);
            document.addEventListener('keydown', this.keys, true);document.addEventListener('focusin', this.focus, true);
            window.addEventListener('resize', this.layout);window.visualViewport?.addEventListener('resize', this.layout);window.visualViewport?.addEventListener('scroll', this.layout);
            this.button.focus({ preventScroll: true });
        }
        close({ animate = false } = {}) {
            if (this.closed) return;
            this.closed = true;
            if (animate && window.PopupPresentation) window.PopupPresentation.close(this.overlay);
            else if (window.PopupPresentation) window.PopupPresentation.remove(this.overlay);
            else this.overlay.remove();
            for (const [el, inert] of this.inert) if (el.isConnected) el.inert = inert;
            document.body.style.overflow = this.previousOverflow;
            document.removeEventListener('keydown', this.keys, true);document.removeEventListener('focusin', this.focus, true);
            window.removeEventListener('resize', this.layout);window.visualViewport?.removeEventListener('resize', this.layout);window.visualViewport?.removeEventListener('scroll', this.layout);
            if (this.previousFocus?.isConnected) this.previousFocus.focus({ preventScroll: true });
        }
    }
    proto._showStoryPopup = function (definition, token) { return new StoryPopup(this, definition, token); };
    function royaltyAmount(timeline) {
        const amount = 300 * timelineOf(timeline) + 500;
        if (!Number.isFinite(amount)) throw new Error('Royalty income exceeds the supported range.');
        return amount;
    }
    function royaltyEligible(game, now, focused = document.hasFocus?.() !== false) {
        return game.currentLevel === 'mars' && (game.marsHelpers || []).filter(helper => helper.type === 'djKittenz').length >= 5
            && focused && Math.floor((game.getCurrentTimelineStats?.().playTimeMs || 0) / 1000) > 729
            && Number.isFinite(game._storyLocationStartedAt) && game._storyLocationStartedAt + 8200 < now;
    }
    register({
        id: 'hitsong', title: "IT'S A HIT!", image: '../assets/SpritesheetsSrc/story/story/hitsong.webp',
        eligible: royaltyEligible,
        renderBody(game, body) {
            const message = element('p');
            message.append(document.createTextNode('DJ Kittenz is topping the charts worldwide! The royalties are increasing '),
                element('strong', 'story-popup-income', 'INCOME'), document.createTextNode(' by '),
                element('strong', 'story-popup-amount', game.formatNumber(royaltyAmount(game.timelineNumber))),
                document.createTextNode(' '), element('strong', 'story-popup-income', 'ĐOGECOINS PER SECOND!'));
            body.append(message);
        },
        effect(game, next) {
            if (next.seen.includes('hitsng')) return;
            next.seen.push('hitsng');
            next.extraDps += royaltyAmount(game.timelineNumber);
        }
    });
    function registerNarrative(definition) { register({ ...definition, renderBody: markedBody(definition.body || '') }); }
    window.DogeMinerStories = Object.freeze({ normalize, register, registerNarrative, royaltyAmount, royaltyEligible, timelineReturnId, get: id => definitions.get(id),
        alwaysShow: Object.freeze([...ALWAYS_SHOW]), firstTimelineOnly: Object.freeze([...FIRST_TIMELINE]) });
})();
