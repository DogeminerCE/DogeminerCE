// Tool ownership, paired attacks and their presentation. Item rolls stay untouched.
(function () {
    'use strict';
    const proto = DogeMinerGame.prototype;
    const keys = ['dualWieldDiscovered', 'sundogeFusionDiscovered', 'sundogeDiscoveryPending', 'diamondDiscoverySeen'];
    function id(item) {
        if (!item) return null;
        const definition = window.DogeMinerBalance?.getDefinition?.('pickaxe', item);
        return item.isPaw ? 'paw' : definition?.sourceMatched ? definition.id : item.balanceDefinitionId || item.templateId || null;
    }
    function pair(game) {
        const items = game.pickaxeInventory, cache = game._toolPairCache;
        if (cache && cache.items === items && cache.count === items?.length && cache.equipped === game.equippedPickaxeId) return cache.other;
        const equipped = items?.find(item => item.instanceId === game.equippedPickaxeId);
        const type = id(equipped);
        if (!type || type === 'staffascended') return null;
        const other = items.find(item => item !== equipped && id(item) === type) || null;
        game._toolPairCache = {items,count:items.length,equipped:game.equippedPickaxeId,other};
        return other;
    }
    function discoveryState(save = {}) {
        for (const key of keys) if (save[key] !== undefined && typeof save[key] !== 'boolean') throw new Error('Unsupported tool discovery state.');
        return Object.fromEntries(keys.map(key => [key, key === 'diamondDiscoverySeen' && save[key] === undefined ? (save.dogediamondsEverObtained || save.dogediamonds || 0) > 0 : save[key] === true]));
    }
    const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
    proto.getPairedPickaxe = function () { return pair(this); };
    proto.isDualWielding = function () { return !!pair(this); };
    proto.rollDualAttack = function (random = Math.random) { return this.isDualWielding() && random() < .4; };
    proto.canPresentTool = function () { return this.canPresentStory?.() === true && !this.isStoryOpen; };
    proto.resetToolPresentation = function ({ rigOnly = false } = {}) {
        if (!rigOnly) { this.resetSunDogeFusion?.(); this.resetDrill?.(); }
        clearTimeout(this.swingTimeout); this.swingTimeout = null;
        this._toolEpoch = (this._toolEpoch || 0) + 1;
        this._toolRigKey = null; this._toolMetadataKey = null; this._toolNextOffhand = false; this._toolAttackHands = [];
        document.getElementById('pickaxe-offhand')?.remove();
        this._toolToast?.element?.remove(); this._toolToast = null;
        const primary = document.getElementById('pickaxe');
        primary?.classList.remove('swing-down', 'tool-fusing');
    };
    proto.syncToolRig = function () {
        const equipped = this.getEquippedPickaxe(), other = pair(this), primary = document.getElementById('pickaxe');
        const key = `${equipped?.instanceId || ''}:${other?.instanceId || ''}`;
        if (!primary || this._toolRigKey === key) return;
        this.resetToolPresentation({rigOnly:true}); this._toolRigKey = key;
        if (other) {
            const secondary = primary.cloneNode(false);
            secondary.id = 'pickaxe-offhand'; secondary.removeAttribute('style');
            secondary.classList.remove('pickaxe-intro', 'swing-down');
            secondary.src = equipped.idleSprite; secondary.alt = ''; secondary.setAttribute('aria-hidden', 'true');
            primary.parentElement.insertBefore(secondary, primary);
        }
    };
    proto.prepareToolAttack = function (both) {
        this.syncToolRig();
        const paired = this.isDualWielding();
        this._toolAttackHands = both && paired ? ['pickaxe', 'pickaxe-offhand']
            : [paired && this._toolNextOffhand ? 'pickaxe-offhand' : 'pickaxe'];
        if (paired && !both) this._toolNextOffhand = !this._toolNextOffhand;
    };
    const equip = proto.equipPickaxe;
    proto.equipPickaxe = function (...args) { const result = equip.apply(this, args); this._toolRigKey = null; this.syncToolRig(); return result; };
    proto.showActivePickaxeSprite = function () {
        const equipped = this.getEquippedPickaxe();
        for (const hand of this._toolAttackHands || ['pickaxe']) {
            const sprite = document.getElementById(hand);
            if (sprite && this._activeSpritePaths?.has(equipped?.templateId)) sprite.src = equipped.idleSprite.replace(/\.webp$/, '-use.webp');
        }
    };
    proto.startSwing = function () {
        if (this.isIntroPlaying || this.isCutscenePlaying || this.isTransitioning) return;
        const now = Date.now(), duration = now - (this.lastRealSwing || 0) < 200 ? 34 : 68;
        this.lastRealSwing = now; this._swingStartTime = now; this._currentSwingDuration = duration;
        clearTimeout(this.swingTimeout);
        const hands = this._toolAttackHands || ['pickaxe'];
        for (const hand of ['pickaxe', 'pickaxe-offhand']) {
            const node = document.getElementById(hand); if (!node) continue;
            node.classList.remove('pickaxe-intro');
            node.style.transition = `transform ${reduced() ? 0 : hands.includes(hand) ? 34 : duration}ms ${hands.includes(hand) ? 'ease-in' : 'ease-out'}, opacity 30ms`;
            node.classList.toggle('swing-down', hands.includes(hand));
            if (!hands.includes(hand)) node.src = this.getEquippedPickaxe().idleSprite;
        }
    };
    proto.endSwing = function () {
        if (this.isMouseDown || this.isSpaceDown) return;
        clearTimeout(this.swingTimeout);
        const remaining = (this._currentSwingDuration || 34) - (Date.now() - (this._swingStartTime || 0));
        if (remaining > 0) this.swingTimeout = setTimeout(() => this._doSwingReturn(null,this._currentSwingDuration),remaining);
        else this._doSwingReturn();
    };
    proto._doSwingReturn = function (_node, duration = 136) {
        if (this.isMouseDown || this.isSpaceDown) return;
        for (const hand of ['pickaxe', 'pickaxe-offhand']) {
            const node = document.getElementById(hand); if (!node) continue;
            node.style.transition = `transform ${reduced() ? 0 : duration}ms ease-out, opacity 60ms`;
            node.classList.remove('swing-down'); node.src = this.getEquippedPickaxe().idleSprite;
        }
        this.swingTimeout = null;
    };
    proto.showToolDiscovery = function (titleText, flag, eyebrow = 'Discovered:') {
        const host = document.getElementById('left-panel'); if (!host || this._toolToast) return;
        const element = document.createElement('div'); element.className = 'tool-discovery';
        if (flag === 'diamondDiscoverySeen') element.classList.add('tool-discovery-diamonds');
        const label = document.createElement('small'); label.textContent = eyebrow;
        const title = document.createElement('strong'); title.textContent = titleText;
        element.append(label, title); host.append(element);
        this._toolToast = { element, elapsed:0, flag };
    };
    // Every first-claim path calls this after committing the currency. The frame
    // clock waits for a clear field and never awards the currency a second time.
    proto.showDiamondIntro = function () {};
    proto.advanceToolDiscovery = function (elapsed) {
        if (!this._toolToast && !this._sunDogeFusion && (this.timelineNumber || 1) === 1 && this.dogediamonds > 0 && !this.diamondDiscoverySeen)
            this.showToolDiscovery('DOGEDIAMONDS', 'diamondDiscoverySeen');
        if (!this._toolToast && !this._sunDogeFusion && this.isDualWielding() && id(this.getEquippedPickaxe()) !== 'staff' && !this.dualWieldDiscovered)
            this.showToolDiscovery('Dual-Wielding', 'dualWieldDiscovered');
        const toast = this._toolToast; if (!toast) return;
        const safe = this.canPresentTool(); toast.element.hidden = !safe;
        if (!safe) return;
        toast.elapsed += Math.max(0, Math.min(100, elapsed));
        if (toast.elapsed >= 300 && !this[toast.flag]) {
            if (Date.now() < (toast.retryAt || 0)) { toast.elapsed = 299; return; }
            this[toast.flag] = true;
            const pending = this.sundogeDiscoveryPending;
            if (toast.flag === 'sundogeFusionDiscovered') this.sundogeDiscoveryPending = false;
            if (window.saveManager?.commitToolProgress?.() !== true) { this[toast.flag] = false; this.sundogeDiscoveryPending = pending; toast.elapsed = 299; toast.retryAt = Date.now() + 1000; }
        }
        const host=document.getElementById('left-panel'),doge=document.getElementById('main-character');
        if(host&&doge){
            const h=host.getBoundingClientRect(),d=doge.getBoundingClientRect(),half=toast.element.getBoundingClientRect().width/2;
            toast.element.style.left=Math.max(half+8,Math.min(h.width-half-8,d.x-h.x+d.width/2))+'px';
            const hud=document.getElementById('stats-display')?.getBoundingClientRect();
            const phone=this.isMobileDevice?.()===true;
            toast.element.style.top=Math.max(24,hud?hud.bottom-h.y+12:0,d.y-h.y-(phone?52:76))+'px';
        }
        const alpha = Math.max(0, Math.min(toast.elapsed / 300, 1, (3800 - toast.elapsed) / 500));
        toast.element.style.opacity = alpha;
        toast.element.style.translate = `0 ${reduced() ? 0 : -20 * toast.elapsed / 3800}px`;
        if (toast.elapsed >= 3800) { toast.element.remove(); this._toolToast = null; }
    };
    proto.advanceTools = function (elapsed) { this.installDrillInput?.(); this.syncToolRig(); this.advanceDrillMining?.(elapsed); this.advanceSunDogeFusion?.(elapsed); this.advanceToolDiscovery(elapsed); };
    window.DogeMinerTools = Object.freeze({ id, pair, discoveryState, reduced });
})();
