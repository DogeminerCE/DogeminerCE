// DM2 2.15 upgrade search: uO/oO, three-second checks and escalating odds.
// CE retains fixed slots and stores a separate active search clock per planet.
(function () {
    'use strict';
    const PLANETS = ['earth', 'moon', 'mars', 'jupiter', 'titan'];
    const CHANCES = [0.15, 0.35, 0.46, 0.77, 0.96, 2];
    const CHECK_MS = 3000;
    const bounded = (value, max = Number.MAX_SAFE_INTEGER) => Number.isFinite(value) ? Math.min(max, Math.max(0, value)) : 0;

    function config(timeline = 1) {
        return timeline > 1 ? { minimumSeconds: 8, intervalMs: 5000, chances: [3] }
            : { minimumSeconds: 160, intervalMs: 17000, chances: CHANCES };
    }

    function normalize(value, timeline = 1, legacyPlayTimeMs = 0) {
        const valid = value?.version === 1 && value.timeline === timeline;
        const planets = {};
        for (const planet of PLANETS) {
            const old = valid ? value.planets?.[planet] : null;
            planets[planet] = { sinceFoundMs: bounded(old?.sinceFoundMs, 86400000),
                attempts: Math.floor(bounded(old?.attempts, CHANCES.length - 1)),
                checkMs: bounded(old?.checkMs, CHECK_MS - 1), pauseMs: bounded(old?.pauseMs, 1500) };
        }
        return { version: 1, timeline, runTimeMs: bounded(valid ? value.runTimeMs : legacyPlayTimeMs), planets };
    }

    function slotsFor(game, available) {
        const previous = game.helperUpgradeOffers?.[game.currentLevel];
        const candidates = new Set(available.map(upgrade => upgrade.helperType));
        const used = new Set();
        const limit = game.searchdogeSlot3Unlocked ? 3 : 2;
        return Array.from({ length: 3 }, (_, index) => {
            const type = previous?.[index];
            if (index >= limit || typeof type !== 'string' || !candidates.has(type) || used.has(type)) return null;
            used.add(type); return type;
        });
    }

    const proto = DogeMinerGame.prototype;
    proto.restoreSearchdogeDiscovery = function (save = {}) {
        // Alpha has no active search clock. Infer only eligibility from its
        // recorded play time/session span at the last save, capped at the
        // minimum. The current absence never advances a search or its odds.
        const rules = config(this.timelineNumber || save.timelineNumber || 1);
        const savedSpan = Number.isFinite(save.timestamp) && Number.isFinite(save.statistics?.startTime)
            ? bounded(save.timestamp - save.statistics.startTime, (rules.minimumSeconds + 1) * 1000) : 0;
        this.searchdogeDiscovery = normalize(save.searchdogeDiscovery, this.timelineNumber || save.timelineNumber || 1,
            Math.max(bounded(save.statistics?.totalPlayTime) * 1000, savedSpan));
    };
    proto.getSearchdogeDiscoveryForSave = function () {
        return normalize(this.searchdogeDiscovery, this.timelineNumber || 1);
    };
    proto.delaySearchdogeDiscovery = function (ms = 1500) {
        this.searchdogeDiscovery ||= normalize(null, this.timelineNumber || 1);
        const clock = this.searchdogeDiscovery.planets[this.currentLevel];
        if (clock) clock.pauseMs = bounded(ms, 1500);
    };
    proto.advanceSearchdogeDiscovery = function (deltaMs) {
        if (!this._bootComplete || !this.isPlaying || document.hidden || this.isIntroPlaying
            || this.isCutscenePlaying || this.isTransitioning || this.isBetaReportOpen || this.isOfflineReportOpen) return;
        this.searchdogeDiscovery ||= normalize(null, this.timelineNumber || 1);
        const state = this.searchdogeDiscovery;
        const clock = state.planets[this.currentLevel];
        if (!clock) return;
        // A suspended/background frame never simulates a series of offline rolls.
        const elapsed = bounded(deltaMs, 1000);
        state.runTimeMs = bounded(state.runTimeMs + elapsed);
        clock.sinceFoundMs = bounded(clock.sinceFoundMs + elapsed, 86400000);
        clock.pauseMs = Math.max(0, clock.pauseMs - elapsed);
        clock.checkMs += elapsed;
        if (clock.checkMs >= CHECK_MS) {
            clock.checkMs %= CHECK_MS;
            return this.tryFindSearchdogeUpgrade();
        }
    };
    proto.tryFindSearchdogeUpgrade = function ({ random = Math.random } = {}) {
        const ui = window.uiManager;
        if (!this._bootComplete || !this.isPlaying || !ui || this.isBetaReportOpen || this.isOfflineReportOpen
            || this.isIntroPlaying || this.isCutscenePlaying || this.isTransitioning || document.hidden) return 'paused';
        this.searchdogeDiscovery ||= normalize(null, this.timelineNumber || 1);
        const state = this.searchdogeDiscovery, clock = state.planets[this.currentLevel];
        const rules = config(this.timelineNumber);
        if(this.hasApplyingHelperUpgrade?.())return 'waiting';
        if (!clock || Math.floor(state.runTimeMs / 1000) <= rules.minimumSeconds) return 'ineligible';
        if (clock.pauseMs > 0 || clock.sinceFoundMs <= rules.intervalMs) return 'waiting';
        const available = ui.getAvailableHelperUpgrades();
        const slots = slotsFor(this, available);
        const limit = this.searchdogeSlot3Unlocked ? 3 : 2;
        const empty = slots.findIndex((type, index) => index < limit && !type);
        if (empty < 0) return 'full';
        const candidates = available.filter(upgrade => !slots.includes(upgrade.helperType));
        if (!candidates.length) return 'none';
        const oldClock = { ...clock }, oldOffers = this.helperUpgradeOffers?.[this.currentLevel];
        const chance = rules.chances[Math.min(clock.attempts, rules.chances.length - 1)];
        const found = random() < chance;
        if (found) {
            const index = Math.min(candidates.length - 1, Math.floor(random() * candidates.length));
            slots[empty] = candidates[index].helperType;
            clock.attempts = 0; clock.sinceFoundMs = 0; clock.pauseMs = 1500;
        } else clock.attempts = Math.min(CHANCES.length - 1, clock.attempts + 1);
        this.helperUpgradeOffers ||= {};
        this.helperUpgradeOffers[this.currentLevel] = slots;
        if (window.saveManager?.saveGame(false) === false) {
            Object.assign(clock, oldClock);
            this.helperUpgradeOffers[this.currentLevel] = oldOffers;
            return 'save-failed';
        }
        if (found) {
            ui.updateUpgradeContent();
            if (this.isMobileDevice()) ui.updateMobileUpgradesContent();
            ui.updateUpgradeTabCount();
            if(this.showFoundUpgradeNotification)this.showFoundUpgradeNotification(slots[empty]);
            else this.showNotification('Searchdoge found a new upgrade!');
        }
        return found ? 'found' : 'miss';
    };

    window.DogeMinerSearchdoge = Object.freeze({ PLANETS, CHANCES, CHECK_MS, config, normalize, slotsFor });
})();
