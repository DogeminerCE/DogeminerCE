// Prestige auto-pickup. Manual stashes remain manual; only new enabled drops queue.
(function () {
    'use strict';
    const proto = DogeMinerGame.prototype;
    const colors = { common:'#bababa', improved:'#40d545', rare:'#62b8e9', epic:'#ad69d7', legendary:'#efa938' };
    function normalize(saved, timeline = 1) {
        if (saved && saved.version !== 1) throw new Error('This auto-pickup save version is not supported. Your save has not been changed.');
        const unlocked = timeline > 1;
        const newlyUnlocked = unlocked && !saved?.unlocked;
        const pending = newlyUnlocked || unlocked && saved.pendingUnlock === true;
        return { version:1, unlocked, enabled:unlocked && saved?.unlocked === true && saved?.enabled === true,
            pendingUnlock:pending, remainingMs:pending ? newlyUnlocked ? 7000 : Math.max(0, Math.min(7000, Number.isFinite(saved?.remainingMs) ? saved.remainingMs : 7000)) : 0 };
    }
    proto.getLootAutomationForSave = function () { return normalize(this.lootAutomation, this.timelineNumber); };
    proto.nextTimelineLootAutomation = function (timeline) { return normalize(this.lootAutomation, timeline); };
    proto.restoreLootAutomation = function (saved, timeline) {
        this.resetLootAutomationPresentation(); this.lootAutomation = normalize(saved, timeline); this.syncAutoPickupSettings();
    };
    proto.syncAutoPickupSettings = function () {
        const state = this.getLootAutomationForSave();
        for (const id of ['auto-pickup-loot','mobile-auto-pickup-loot']) {
            const input = document.getElementById(id); if (!input) continue;
            input.checked = state.enabled; input.closest('.setting-item').hidden = !state.unlocked;
        }
    };
    proto.setAutoPickupEnabled = function (enabled) {
        const before = this.lootAutomation, state = this.getLootAutomationForSave();
        if (!state.unlocked) return false;
        this.lootAutomation = { ...state, enabled:enabled === true, pendingUnlock:false, remainingMs:0 };
        if (!window.saveManager?.commitFieldLoot()) { this.lootAutomation = before; this.syncAutoPickupSettings(); return false; }
        if (!enabled) this._autoLootQueue = [];
        this.syncAutoPickupSettings(); return true;
    };
    proto.queueAutoLoot = function (node, type, amount = 1) {
        if (!node || !this.getLootAutomationForSave().enabled) return;
        this._autoLootQueue ||= [];
        this._autoLootQueue.push({ node, type, amount, planet:this.currentLevel, epoch:this._currencyFlightEpoch || 0,
            at:(this._autoLootClock || 0) + 828 }); // Source Kp(200), then Kp(628).
    };
    proto.resetLootAutomationPresentation = function () {
        this._autoLootQueue = []; this._autoLootRetryAt = 0;
        for (const effect of this._autoLootEffects || []) { effect.timers.forEach(clearTimeout); effect.node.getAnimations?.().forEach(a => a.cancel()); effect.node.remove(); }
        this._autoLootEffects = new Set();
    };
    proto.claimAutomaticBag = function (job) {
        const quality = job.node._dogebagRollOptions?.dropType || 0, planet = job.planet;
        const count = this.dogebagStacks?.[planet]?.[quality] || 0;
        if (!count) return true;
        const before = { ...this };
        this.pickaxeInventory = [...this.pickaxeInventory]; this.fortuneInventory = [...this.fortuneInventory];
        this.inventoryUnread = { ...(this.inventoryUnread || { pickaxe:0, fortune:0 }) };
        this.dogebagStacks = { ...this.dogebagStacks, [planet]:{ ...this.dogebagStacks[planet], [quality]:count - 1 } };
        try {
            if (!job.reward) {
                job.reward = this.generateDogebagContents(job.node._dogebagRollOptions);
                job.rollState = { lastPickaxeDropTime:this.lastPickaxeDropTime, prizesSinceLastPickaxe:this.prizesSinceLastPickaxe };
            } else Object.assign(this, job.rollState);
            const reward = job.reward; if (!reward) throw new Error('No reward could be generated.');
            if (reward.type === 'pickaxe') {
                this.pickaxeInventory.push(reward.item); this.inventoryUnread.pickaxe++;
                this.maxPickaxeDPC = Math.max(this.maxPickaxeDPC || 1, reward.item.baseDPC || 0);
                this.equippedPickaxeId = reward.item.instanceId;
            } else if (reward.type === 'fortune') {
                this.fortuneInventory.push(reward.item); this.inventoryUnread.fortune++;
                this.latestObtainedFortune = { name:reward.item.name, sprite:reward.item.sprite };
                if (reward.item.name === 'Mystery Box') { this.noteMysteryBoxFound?.(); this.mysteryBoxObtained = true; }
            } else if (reward.type === 'coins') {
                this.dogecoins += reward.amount; this.totalMined += reward.amount;
                this.pendingCoinDisplayAmount = (this.pendingCoinDisplayAmount || 0) + reward.amount;
            } else if (reward.type === 'diamonds') {
                this.dogediamonds += reward.amount; this.dogediamondsEverObtained += reward.amount;
                this.pendingDiamondDisplayAmount = (this.pendingDiamondDisplayAmount || 0) + reward.amount;
            } else throw new Error('Unsupported auto-pickup reward.');
            this.recalculatePlayerStats();
            if (!window.saveManager?.commitFieldLoot()) throw new Error('Auto-pickup could not be saved.');
        } catch (error) {
            for (const key of Object.keys(this)) if (!Object.hasOwn(before, key)) delete this[key];
            Object.assign(this, before); this.updateUI(true); return false;
        }
        const rect = job.node.getBoundingClientRect(), reward = job.reward;
        job.node._dogebagCount = count - 1;
        if (count > 1) this.updateDogebagPile(job.node, count - 1);
        else { clearInterval(job.node._fullPulse); job.node._lootHover?.detach(); job.node.getAnimations?.({subtree:true}).forEach(a => a.cancel()); job.node.remove(); }
        this.updateInventoryUnread(); this.updateUI(true);
        if (reward.type === 'fortune') { this.setLatestObtainedFortune(reward.item); if (reward.item.name === 'Mystery Box') this.initMysteryBox(); }
        this.playSound?.('grabBag');
        this.presentAutomaticReward(reward, rect);
        return true;
    };
    proto.presentAutomaticReward = function (reward, rect) {
        const node = document.createElement('div'); node.className = 'auto-loot-prize';
        const image = document.createElement('img'); image.alt = reward.item?.name || reward.type;
        image.src = reward.item?.idleSprite || reward.item?.sprite || (reward.type === 'diamonds' ? 'assets/general/diamond.webp' : 'assets/general/dogecoin_70x70.webp');
        node.append(image); if (reward.item) { node.style.setProperty('--loot-color', colors[reward.item.rarity] || colors.common); node.classList.add('auto-loot-item'); }
        node.style.left = rect.left + rect.width / 2 + 'px'; node.style.top = rect.top + rect.height / 2 + 'px';
        document.body.append(node);
        const effect = { node, timers:[], epoch:this._currencyFlightEpoch || 0 }, valid = () => node.isConnected && effect.epoch === (this._currencyFlightEpoch || 0);
        this._autoLootEffects ||= new Set(); this._autoLootEffects.add(effect);
        const end = () => { node.remove(); this._autoLootEffects.delete(effect); };
        const later = (fn, ms) => effect.timers.push(setTimeout(() => { if (valid()) fn(); }, ms));
        node.animate([{opacity:0,scale:.5},{opacity:1,scale:1}],{duration:600,easing:'ease-out'});
        later(() => {
            if (reward.item) {
                // A later bag may already have equipped its newer pickaxe.
                if (reward.type === 'pickaxe') this.equipPickaxe(this.equippedPickaxeId, {sound:false});
                this.playSound?.(reward.type==='pickaxe'?'receivePickaxe':'select2', {volume:reward.type==='pickaxe'?.2:.5});
                image.animate([{scale:1},{scale:1.12},{scale:1}],{duration:500,easing:'ease-out'});
                later(() => {
                    const target = document.getElementById(reward.type === 'pickaxe' ? 'pickaxe-btn' : 'fortune-btn')?.getBoundingClientRect();
                    if (!target) return end();
                    const from = node.getBoundingClientRect(), dx = target.left + target.width / 2 - (from.left + from.width / 2), dy = target.top + target.height / 2 - (from.top + from.height / 2);
                    const flight = node.animate([{translate:'0 0',scale:1,opacity:1},{translate:`${dx}px ${dy}px`,scale:.3,opacity:0}],{duration:1000,easing:'cubic-bezier(.3,0,.6,1)',fill:'forwards'});
                    flight.onfinish = end; later(end,1100);
                },750);
            } else {
                if (reward.type==='coins') this.playSound?.('receiveStash');
                later(()=>this.playSound?.(reward.type==='coins'?'getCoins':'diamond1', {volume:reward.type==='coins'?.5:.2}),150);
                const origin = { clientX:rect.left+rect.width/2, clientY:rect.top+rect.height/2 };
                if (reward.type === 'coins') { this.pendingCoinDisplayAmount = Math.max(0,(this.pendingCoinDisplayAmount || 0)-reward.amount); this.createFloatingCoin(reward.amount,origin); }
                else { this.pendingDiamondDisplayAmount = Math.max(0,(this.pendingDiamondDisplayAmount || 0)-reward.amount); this.createFloatingDiamond(reward.amount,origin); }
                later(end,750);
            }
        },600);
    };
    proto.advanceLootAutomation = function (dt) {
        if (!this.helperLootCanRun()) return;
        this._autoLootClock = (this._autoLootClock || 0) + Math.max(0,Math.min(250,dt));
        this.lootAutomation ||= this.getLootAutomationForSave();
        let state = this.lootAutomation;
        if (!state.unlocked && this.timelineNumber > 1) this.lootAutomation = state = this.nextTimelineLootAutomation(this.timelineNumber);
        if (state.pendingUnlock) {
            this.lootAutomation = state = { ...state, remainingMs:Math.max(0,state.remainingMs-Math.max(0,Math.min(250,dt))) };
            if (!state.remainingMs && this._autoLootClock >= (this._autoLootRetryAt || 0)) {
                this.lootAutomation = { ...state, enabled:true, pendingUnlock:false };
                if (!window.saveManager?.commitFieldLoot()) { this.lootAutomation = state; this._autoLootRetryAt = this._autoLootClock+500; }
                else { this.syncAutoPickupSettings(); this.showNotification?.('UNLOCKED: Auto-Pickup Loot! Turn it off in Settings.'); }
            }
        }
        if (!this.lootAutomation.enabled || this._dogebagReveal || this._autoLootClock < (this._autoLootRetryAt || 0)) return;
        const queue = this._autoLootQueue || [];
        for (let index = 0, processed = 0; index < queue.length && processed < 4;) {
            const job = queue[index];
            if (!job.node.isConnected || job.node.dataset.collected || job.epoch !== (this._currencyFlightEpoch || 0) || job.planet !== this.currentLevel) { queue.splice(index,1); continue; }
            if (job.at > this._autoLootClock) { index++; continue; }
            const ok = job.type === 'bag' ? this.claimAutomaticBag(job) : job.type === 'coin' ? this.collectCoinPile(job.node) : this.claimFieldDiamonds(Math.min(job.amount,this.diamondStacks?.[this.currentLevel] || 0),job.node);
            if (!ok) { this._autoLootRetryAt = this._autoLootClock+500; break; }
            queue.splice(index,1); processed++;
        }
    };
    const coin = proto.createCoinPile, bag = proto.createDogebag, diamond = proto.createDiamondLoot, reset = proto.resetFieldLootPresentation;
    proto.createCoinPile = function (...args) { const node = coin.apply(this,args); this.queueAutoLoot(node,'coin'); return node; };
    proto.createDogebag = function (...args) {
        const before = this.getDogebagStacksForSave(); const result = bag.apply(this,args);
        const node = [...document.querySelectorAll('.dogebag-stack')].find(n => (this.dogebagStacks?.[this.currentLevel]?.[n._dogebagRollOptions.dropType] || 0) > (before[this.currentLevel]?.[n._dogebagRollOptions.dropType] || 0));
        this.queueAutoLoot(node,'bag'); return result;
    };
    proto.createDiamondLoot = function (...args) {
        const before = this.diamondStacks?.[this.currentLevel] || 0, result = diamond.apply(this,args);
        if ((this.diamondStacks?.[this.currentLevel] || 0) > before) this.queueAutoLoot(document.querySelector('.diamond-stack:not([data-collected])'),'diamond');
        return result;
    };
    proto.resetFieldLootPresentation = function (...args) { this.resetLootAutomationPresentation(); return reset.apply(this,args); };
    document.addEventListener('change', event => {
        if (['auto-pickup-loot','mobile-auto-pickup-loot'].includes(event.target.id)) window.game?.setAutoPickupEnabled(event.target.checked);
    });
    window.DogeMinerLootAutomation = Object.freeze({ normalize });
})();
