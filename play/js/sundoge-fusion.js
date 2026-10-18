// Source SunDoge fusion, adapted to CE's DOM scene with solid etched strokes.
(function () {
    'use strict';
    const proto = DogeMinerGame.prototype, tools = window.DogeMinerTools;
    const clamp = n => Math.max(0, Math.min(1, n));
    const smooth = n => { n = clamp(n); return n * n * (3 - 2 * n); };
    function pair(game) {
        const staffs = (game.pickaxeInventory || []).filter(item => tools.id(item) === 'staff');
        if (staffs.length < 2) return null;
        const latest = staffs.at(-1), older = staffs.at(-2);
        const roll = latest.stats?.find(stat => stat.balanceKey === 'dpsp' || stat.name?.toLowerCase() === 'dps' && stat.indicator === '+%')?.value;
        return Number.isFinite(roll) && roll > 0 && Number.isFinite(roll * 10) ? { older, latest, roll } : null;
    }
    function result(pair) {
        return { instanceId: `sundoge_fusion_${pair.latest.instanceId}`, templateId: 'universal_ascendedstaffofthesundoge',
            name: 'Ascended Staff of the SunDoge', rarity: 'legendary', baseDPC: 0,
            description: "Two ancient suns, one legendary staff. Its passive DPS bonus is ten times the newest staff's original roll. It deals no direct damage.",
            idleSprite: pair.latest.idleSprite, planetOfOrigin: 'universal', isStaffOfSundoge: true,
            balanceVersion: window.DogeMinerBalance?.VERSION, balanceDefinitionId: 'staffascended',
            stats: [{ name: 'DPS', displayName: 'DPS', balanceKey: 'dpsp', indicator: '+%', value: pair.roll * 10, isCore: true, type: 'primary' }],
            fusionOrigin: { older: pair.older.instanceId, latest: pair.latest.instanceId, originalPassiveDpsRoll: pair.roll } };
    }
    proto.commitSunDogeFusion = function (captured) {
        const current = pair(this);
        if (!current || current.older !== captured.older || current.latest !== captured.latest || current.roll !== captured.roll) return false;
        const inventory = this.pickaxeInventory, equipped = this.equippedPickaxeId, pending = this.sundogeDiscoveryPending;
        const item = result(current), next = inventory.slice();
        next[next.indexOf(current.latest)] = item; next.splice(next.indexOf(current.older), 1);
        this.pickaxeInventory = next; this.equippedPickaxeId = item.instanceId;
        this.sundogeDiscoveryPending = !this.sundogeFusionDiscovered;
        let saved = false;
        try { this.recalculatePlayerStats(); saved = window.saveManager?.commitToolProgress?.() === true; }
        catch (error) { console.error('SunDoge fusion could not be saved:', error); }
        if (!saved) {
            this.pickaxeInventory = inventory; this.equippedPickaxeId = equipped; this.sundogeDiscoveryPending = pending;
            this.recalculatePlayerStats(); return false;
        }
        this._toolRigKey = null;
        this.syncToolRig();
        this.renderPickaxeGrid?.(); this.updateStatsSidebar?.('pickaxe');
        const preview = document.getElementById('pickaxe-btn-preview'); if (preview) preview.src = item.idleSprite;
        this.playSound?.('receiveItem');
        return item;
    };
    function create(game, captured) {
        const host = document.getElementById('left-panel'); if (!host) return null;
        const element = document.createElement('div'); element.className = 'sundoge-fusion';
        element.innerHTML = '<svg viewBox="-120 -120 240 240" aria-hidden="true"><g class="fusion-seal"><circle r="102"/><circle r="76"/><path d="M0 -76 66 -38 66 38 0 76 -66 38 -66 -38Z M0 -51 44 -25 44 25 0 51 -44 25 -44 -25Z M0 -76 0 -51 M66 -38 44 -25 M66 38 44 25 M0 76 0 51 M-66 38 -44 25 M-66 -38 -44 -25"/></g><circle class="fusion-ring" r="65"/></svg>';
        const hands = [-1, 1].map(side => { const img = document.createElement('img'); img.src = captured.latest.idleSprite; img.alt = ''; img.dataset.side = side; element.append(img); return img; });
        const label = document.createElement('span'); label.textContent = 'SunDoge'; element.append(label); host.append(element);
        return { element, hands, label, pair: captured, timeline: game.timelineNumber, elapsed: 0, committed: false, retryAt: 0 };
    }
    proto.resetSunDogeFusion = function () { this._sunDogeFusion?.element?.remove(); this._sunDogeFusion = null; };
    proto.advanceSunDogeFusion = function (elapsed) {
        let state = this._sunDogeFusion;
        if (state && (state.timeline !== this.timelineNumber || (state.committed ? !this.pickaxeInventory.includes(state.item)
            : !this.pickaxeInventory.includes(state.pair.older) || !this.pickaxeInventory.includes(state.pair.latest)))) {
            this.resetSunDogeFusion(); state = null;
        }
        if (!this.canPresentTool()) { if (state) state.element.hidden = true; return; }
        if (!state) {
            const captured = pair(this);
            if (captured) {
                if (this.equippedPickaxeId !== captured.older.instanceId) this.equipPickaxe(captured.older.instanceId);
                state = this._sunDogeFusion = create(this, captured);
            } else if (this.sundogeDiscoveryPending && tools.id(this.getEquippedPickaxe()) === 'staffascended' && !this._toolToast) {
                this.showToolDiscovery?.('Fusion Successful', 'sundogeFusionDiscovered', 'SunDoge');
            }
        }
        if (!state) return;
        if (!state.committed && this.equippedPickaxeId !== state.pair.older.instanceId) this.equipPickaxe(state.pair.older.instanceId);
        state.element.hidden = false;
        state.elapsed += Math.max(0, Math.min(100, elapsed)) * 1.8;
        if (state.elapsed >= 2550 && !state.committed) {
            if (Date.now() < state.retryAt) state.elapsed = 2550;
            else {
                state.item = this.commitSunDogeFusion(state.pair);
                if (!state.item) { state.elapsed = 2550; state.retryAt = Date.now() + 1000; state.label.textContent = 'Saving fusion…'; }
                else { state.committed = true; state.label.textContent = 'Fusion Successful'; }
            }
        }
        const host = document.getElementById('left-panel'), doge = document.getElementById('main-character');
        if (host && doge) {
            const r = host.getBoundingClientRect(), d = doge.getBoundingClientRect(), size = Math.min(240, r.width - 16);
            Object.assign(state.element.style, { width: `${size}px`, height: `${size}px`, left: `${Math.max(8, Math.min(r.width - size - 8, d.x - r.x + d.width / 2 - size / 2))}px`, top: `${Math.max(8, Math.min(r.height - size - 8, d.y - r.y - size / 2))}px` });
        }
        const ms = state.elapsed, heat = smooth((ms - 500) / 1500), motion = clamp((ms - 1300) / 950), snap = clamp((ms - 2250) / 300) ** 5, after = clamp((ms - 2550) / 1100);
        state.element.dataset.phase = ms < 500 ? 'equipped' : ms < 2250 ? 'heating' : ms < 2550 ? 'pull' : 'merged';
        const seal = state.element.querySelector('.fusion-seal'); seal.setAttribute('transform',`rotate(${tools.reduced() ? 0 : ms / 1250 * 180 / Math.PI})`);
        seal.style.opacity = heat * (1 - after);
        state.element.querySelector('.fusion-ring').setAttribute('transform',`scale(${1 + after * 1.8})`);
        state.element.querySelector('.fusion-ring').style.opacity = after > 0 ? 1 - after : 0;
        state.hands.forEach((node, index) => {
            const side = index ? 1 : -1, x = side * Math.cos(motion * Math.PI * 2) * 65 * (1 - snap), y = -52 * Math.sin(motion * Math.PI) * (1 - snap);
            node.style.translate = tools.reduced() ? `${side * (1 - snap) * 35}px 0` : `${x}px ${y}px`;
            node.style.rotate = `${tools.reduced() ? 0 : .35 * side * Math.cos(motion * Math.PI * 2) * (1 - snap) * 180 / Math.PI}deg`;
            node.style.opacity = index === 0 && state.committed ? 0 : 1;
        });
        for (const hand of ['pickaxe', 'pickaxe-offhand']) document.getElementById(hand)?.classList.add('tool-fusing');
        if (state.elapsed >= 3650 && state.committed) {
            this.resetSunDogeFusion(); this._toolRigKey = null; this.syncToolRig();
            if (this.sundogeDiscoveryPending) this.showToolDiscovery('Fusion Successful', 'sundogeFusionDiscovered', 'SunDoge');
        }
    };
    window.DogeMinerSunDogeFusion = Object.freeze({ pair, result });
})();
