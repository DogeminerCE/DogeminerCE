// Shared, deadline-driven helper frames and field chatter. Presentation never edits saves.
(function () {
    'use strict';
    const proto = DogeMinerGame.prototype, data = window.DogeMinerFieldPersonalityData;
    if (!data) return;
    const profiles = new Map(data.mapping.map(row => [row.type, Object.freeze({...row})]));
    const slow = new Set([6,12,18,30,21,29,23,24,27,32,35]);
    const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    function speed(type, random = Math.random) {
        const id = profiles.get(type)?.id;
        let value = Math.ceil(30 * random()) / 1000 + (slow.has(id) ? 0 : .08);
        if (id === 34) value /= 2;
        return Number(value.toFixed(3));
    }
    function sequence(frames) {
        return frames.length <= 2 ? [frames[0],frames[0],frames[1] || frames[0]]
            : [frames[0],frames[2],frames[1],...frames.slice(3)];
    }
    function frames(game, type) {
        const paths = game.getHelperSpritePaths(type, game.helperUpgradeLevels?.[type] || 0);
        // Extra art is opt-in. CE's retained Altar uses its existing two-frame artwork.
        return sequence([paths.idle, paths.mining, ...(paths.extra || [])]);
    }
    function writeFrame(entry) {
        const frame = Math.floor(entry.phase) % entry.frames.length, src = entry.frames[frame];
        if (entry.sprite.getAttribute('src') !== src) entry.sprite.src = src;
        entry.sprite._helperFrame = frame;
        entry.sprite.dataset.isMining = String(src !== entry.frames[0]);
    }
    function scheduler(game) {
        if (game._fieldFrameScheduler) return game._fieldFrameScheduler;
        const state = {entries:new Map(), timer:null};
        const now = () => performance.now();
        state.schedule = () => {
            if (!state.entries.size || document.hidden) {
                clearTimeout(state.timer); state.timer = null; state.dueAt = null; return;
            }
            const at = now();
            let wait = 1000;
            for (const entry of state.entries.values()) if (entry.speed > 0)
                wait = Math.min(wait, (1 - (entry.phase % 1)) / (entry.speed * .06) - Math.max(0, at - entry.at));
            const delay = Math.max(16, Math.ceil(wait)), dueAt = at + delay;
            // Repeated UI refreshes must not postpone an already scheduled frame.
            if (state.timer !== null && state.dueAt <= dueAt) return;
            clearTimeout(state.timer); state.dueAt = dueAt;
            state.timer = setTimeout(state.tick, delay);
        };
        state.tick = () => {
            state.timer = null; state.dueAt = null;
            const at = now();
            for (const [sprite, entry] of state.entries) {
                if (!sprite.isConnected) { state.entries.delete(sprite); continue; }
                entry.phase = (entry.phase + Math.max(0, at - entry.at) * entry.speed * .06) % entry.frames.length;
                entry.at = at; writeFrame(entry);
            }
            state.schedule();
        };
        const resetClock = () => {
            const at = now();
            for (const entry of state.entries.values()) {
                entry.at = at;
            }
            state.schedule();
        };
        document.addEventListener('visibilitychange', resetClock);
        window.matchMedia?.('(prefers-reduced-motion: reduce)').addEventListener?.('change', resetClock);
        game._fieldFrameScheduler = state;
        return state;
    }
    function animate(game, helper, sprite, mobile = false) {
        const state = scheduler(game), textures = frames(game, helper.type), key = textures.join('|');
        const previous = state.entries.get(sprite);
        if (previous?.key === key) return;
        sprite._helperRestSpeed ??= speed(helper.type);
        const entry = {sprite, type:helper.type, frames:textures, key, mobile,
            phase:sprite._helperAnimationPhase || 0, at:performance.now(), speed:sprite._helperRestSpeed};
        entry.phase %= textures.length;
        state.entries.set(sprite, entry); writeFrame(entry); state.schedule();
    }
    function stop(game, sprite) {
        const state = game._fieldFrameScheduler, entry = state?.entries.get(sprite);
        if (!entry && !sprite.dataset.animationInterval) return;
        if (entry) sprite._helperAnimationPhase = entry.phase;
        state?.entries.delete(sprite); state?.schedule();
        // Clean up pre-checkpoint timers when code is hot-loaded by a test.
        if (sprite.dataset.animationInterval) clearInterval(Number(sprite.dataset.animationInterval));
        sprite.dataset.animationInterval = '';
    }
    function clearMobile(game) {
        const state = game._fieldFrameScheduler;
        if (!state) return;
        for (const entry of [...state.entries.values()]) if (entry.mobile) stop(game, entry.sprite);
    }
    function syncMobile(game) {
        if (!game.isMobileDevice()) return clearMobile(game);
        const owned = new Set((game.getHelperArrayForLevel() || []).map(helper => helper.type));
        for (const icon of document.querySelectorAll('#mobile-helper-bar .mobile-helper-icon')) {
            if(icon.classList?.contains?.('helper-upgrade-transforming'))continue;
            const type = icon.closest('[data-helper-type]')?.dataset.helperType;
            if (type && owned.has(type)) animate(game, {type}, icon, true);
            else if (type) { stop(game, icon); icon.src = frames(game, type)[0]; icon.dataset.isMining = 'false'; }
        }
    }
    function idleChance(count) { return count > 20 ? .16 : count > 12 ? .14 : count > 6 ? .11 : .08; }
    function miningPosition(width, height, random = Math.random) {
        // DM2 Ys: a random point on a circle, with bottom-right text anchors.
        const angle = random() * Math.PI * 2, radius = width / 4.5;
        return {x:Math.cos(angle) * radius + width / 2 + 75,
            y:Math.sin(angle) * radius + height / 2 + 120};
    }
    function miningLayer(field) {
        const parent = field.parentElement;
        if (!parent) return field;
        let layer = parent.querySelector(':scope > .mining-phrase-layer');
        if (!layer) {
            layer = document.createElement('div'); layer.className = 'mining-phrase-layer';
            layer.setAttribute('aria-hidden', 'true'); parent.append(layer);
        }
        // Source text renders above Doge/rock and below HUD/drag layers. Keep
        // CE's field scaling without raising the helper sprites with the text.
        const style = getComputedStyle(field);
        layer.style.transform = style.transform; layer.style.transformOrigin = style.transformOrigin;
        return layer;
    }
    function phrase(game, kind = 'doge', random = Math.random) {
        const tool = String(window.DogeMinerBalance?.getDefinition('pickaxe', game.getEquippedPickaxe?.()).id || '');
        if (['carbine','shotgun'].includes(tool)) return 'pew';
        if (['paw','staff','staffascended'].includes(tool)) return random() > .5 ? 'ow' : 'much ow';
        if (['cleaver','cleavergold'].includes(tool)) return random() > .5 ? 'chop' : 'CHOP';
        const pool = Object.hasOwn(data.phrases, kind) ? data.phrases[kind] : data.phrases.doge;
        return pool[Math.floor(random() * pool.length)];
    }
    function plainPhrase(text) { return String(text ?? '').replace(/<\/?[a-zA-Z0-9_]+>/g, ''); }
    function family(type) {
        const p = profiles.get(type);
        if (!p || (!p.named && !p.talks)) return null;
        return p.id === 3 ? 'cate' : p.id === 4 || p.id === 10 ? 'target' : p.id === 15 ? 'cateDJ' : 'doge';
    }
    proto.canShowFieldChatter = function (mining = false) {
        return this.isPlaying && !document.hidden && !this.isIntroPlaying && !this.isCutscenePlaying
            && !this.isTransitioning && !this.isBetaReportOpen && !this.isOfflineReportOpen && !this.isStoryOpen
            && !this._dogebagReveal && (mining || (this._fieldPhrases?.size || 0) < 40);
    };
    proto.positionHelperChatter = function (sprite, x, y) {
        const bubbles = sprite?._fieldPhraseBubbles;
        if (!bubbles?.size) return;
        const width = document.getElementById('helper-container')?.offsetWidth || 500;
        for (const bubble of bubbles) if (bubble.isConnected) {
            bubble.style.left = `${Math.max(bubble.offsetWidth / 2 + 6, Math.min(width - bubble.offsetWidth / 2 - 6, x))}px`;
            bubble.style.top = `${Math.max(28, y)}px`;
        }
    };
    proto.showFieldPhrase = function (text, {sprite = null, helper = null, mining = false, random = Math.random} = {}) {
        if (!this.canShowFieldChatter(mining) || (sprite && !sprite.isConnected)) return null;
        const content = plainPhrase(text);
        if (!content.trim()) return null; // Blank icon entries remain silent, as in the shipped source.
        const field = document.getElementById('helper-container');
        if (!field) return null;
        // Strip source rich-text tags and assign text safely.
        const bubble = document.createElement('span');
        bubble.className = mining ? 'field-phrase field-phrase-mining' : 'field-phrase'; bubble.setAttribute('aria-hidden', 'true');
        bubble._isMiningPhrase = mining;
        bubble.textContent = content;
        const width = field.offsetWidth, baseSize = width >= 700 ? 22 : width >= 325 ? 19 : 15;
        const size = mining ? baseSize + (width >= 700 ? 15 : width >= 325 ? 7 : 5) * random() : helper ? 2 * random() + 13 : 5 * random() + 9;
        bubble.style.fontSize = `${size}px`;
        bubble.style.color = `rgb(${[0,1,2].map(() => Math.round((mining ? 175 : 160) * random())).join(',')})`;
        const position = mining ? miningPosition(width, field.offsetHeight, random) : null;
        bubble.style.setProperty('--phrase-stroke', mining ? '5px' : '3px');
        bubble.style.setProperty('--phrase-angle', `${reduced() ? 0 : 15 * random() - 15 * random()}deg`);
        const hold = Math.floor(1000 * random()) + 1300;
        bubble.style.setProperty('--phrase-hold', `${hold}ms`);
        this._fieldPhrases ||= new Set(); this._fieldPhrases.add(bubble);
        (mining ? miningLayer(field) : field).appendChild(bubble);
        if (sprite) {
            sprite._fieldPhraseBubbles ||= new Set();
            sprite._fieldPhraseBubbles.add(bubble);
            sprite._fieldPhrase = bubble; bubble._helperAnchor = sprite;
            const size = this.getHelperDisplaySize(helper?.type || sprite._helperHoverRecord?.type);
            this.positionHelperChatter(sprite, parseFloat(sprite.style.left) + size / 2, parseFloat(sprite.style.top) - 38);
        } else if (position) {
            bubble.style.left = `${position.x}px`; bubble.style.top = `${position.y}px`;
        } else {
            const rock = document.getElementById('main-rock'), fr = field.getBoundingClientRect(), rr = rock?.getBoundingClientRect();
            const ratio = fr.width / field.offsetWidth || 1;
            const x = rr ? (rr.left + rr.width / 2 - fr.left) / ratio : field.offsetWidth / 2;
            const y = rr ? (rr.top - fr.top) / ratio - 25 : field.offsetHeight / 2;
            bubble.style.left = `${Math.max(bubble.offsetWidth / 2 + 6, Math.min(field.offsetWidth - bubble.offsetWidth / 2 - 6, x + 60 * (random() - .5)))}px`;
            bubble.style.top = `${Math.max(28, y - 60 * random())}px`;
        }
        bubble._expiry = setTimeout(() => this.removeFieldPhrase(bubble), 250 + hold + 400);
        return bubble;
    };
    proto.removeFieldPhrase = function (bubble) {
        if (!bubble) return;
        clearTimeout(bubble._expiry);
        const anchor = bubble._helperAnchor;
        anchor?._fieldPhraseBubbles?.delete(bubble);
        if (anchor?._fieldPhrase === bubble) anchor._fieldPhrase = [...(anchor._fieldPhraseBubbles || [])].at(-1) || null;
        const layer = bubble.parentElement;
        this._fieldPhrases?.delete(bubble); bubble.remove();
        if (layer?.classList.contains('mining-phrase-layer') && !layer.childElementCount) layer.remove();
    };
    proto.clearFieldChatter = function () {
        clearTimeout(this._heldPhraseTimer); this._heldPhraseTimer = null;
        for (const bubble of [...(this._fieldPhrases || [])]) this.removeFieldPhrase(bubble);
    };
    proto.rollMiningChatter = function (random = Math.random, chance = .2) {
        // DM2 Bm: an independent ordinary-hit roll; mining has no text cap.
        if (!this.canShowFieldChatter(true) || random() >= chance) return false;
        return !!this.showFieldPhrase(phrase(this, 'doge', random), {mining:true, random});
    };
    proto.rollIdleHelperChatter = function (random = Math.random) {
        if (!this.canShowFieldChatter()) return false;
        if (this.isMobileDevice?.() && !document.documentElement.classList.contains('parity-helper-field-preview')) return false;
        const sprites = [...document.querySelectorAll('#helper-container .placed-helper')];
        if (!sprites.length || random() >= idleChance(sprites.length)) return false;
        const sprite = sprites[Math.floor(random() * sprites.length)], helper = sprite._helperHoverRecord;
        const kind = family(helper?.type);
        if (!kind || sprite._helperMotion) return false;
        return !!this.showFieldPhrase(kind === 'target' ? data.targets[this.currentLevel] : phrase(this, kind, random), {sprite, random});
    };
    proto.beginHeldHelperChatter = function (drag, random = Math.random) {
        clearTimeout(this._heldPhraseTimer);
        drag._willTalk = random() < .6;
        if (!drag._willTalk) return;
        const delay = 200 + 300 * random(), epoch = this._helperFieldEpoch;
        this._heldPhraseTimer = setTimeout(() => {
            this._heldPhraseTimer = null;
            const item = drag.items[0];
            if (this._helperDrag === drag && epoch === this._helperFieldEpoch && profiles.get(item.record.type)?.named)
                this.showFieldPhrase(phrase(this, 'interaction', random), {sprite:item.element, helper:item.record, random});
        }, delay);
    };
    proto.endHeldHelperChatter = function (drag, cancelled, random = Math.random) {
        clearTimeout(this._heldPhraseTimer); this._heldPhraseTimer = null;
        const item = drag.items[0];
        if (!cancelled && !drag._willTalk && random() < .3 && profiles.get(item.record.type)?.named)
            this.showFieldPhrase(phrase(this, 'after', random), {sprite:item.element, helper:item.record, random});
    };
    const initialize = proto.initializeHelperPresentation;
    proto.initializeHelperPresentation = function () {
        initialize.call(this);
        clearInterval(this._fieldChatterTimer);
        this._fieldChatterTimer = setInterval(() => this.rollIdleHelperChatter(), 500);
        document.addEventListener('visibilitychange', () => { if (document.hidden) this.clearFieldChatter(); });
    };
    const clearField = proto.clearAllHelperSprites;
    proto.clearAllHelperSprites = function () { this.clearFieldChatter(); return clearField.call(this); };
    window.DogeMinerFieldPersonality = Object.freeze({speed, sequence, frames, animate, stop, syncMobile, clearMobile, idleChance, miningPosition, phrase, plainPhrase, family});
})();
