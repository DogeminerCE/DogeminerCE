// Opt-in checkpoint sandbox. All game storage is private to this tab/session;
// the ordinary local save and preferences are never copied or written here.
(function () {
    'use strict';
    const selected = new URLSearchParams(window.location.search).get('parityTest');
    const requested = /^checkpoint-(?:[1-9]|[1-5][0-9]|6[0-9])$/.test(selected || '');
    const checkpoint = requested ? Number(selected.slice(11)) : 69;
    const prefix = `ce-parity-checkpoint-${checkpoint}:`;
    function openSandbox(target = 69) {
        const url = new URL(window.location.href);
        url.search = `?parityTest=checkpoint-${Number.isInteger(target) && target >= 1 && target <= 69 ? target : 69}`; url.hash = '';
        window.open(url.href, '_blank', 'noopener');
    }
    if (!requested) {
        window.CEParityTesting = Object.freeze({ active: false, openSandbox });
        return;
    }
    try {
        const storage = window.sessionStorage;
        const keys = () => Array.from({ length: storage.length }, (_, index) => storage.key(index))
            .filter(key => key?.startsWith(prefix));
        const isolated = Object.freeze({
            get length() { return keys().length; },
            key(index) { const key = keys()[index]; return key ? key.slice(prefix.length) : null; },
            getItem(key) { return storage.getItem(prefix + String(key)); },
            setItem(key, value) { storage.setItem(prefix + String(key), String(value)); },
            removeItem(key) { storage.removeItem(prefix + String(key)); },
            clear() { for (const key of keys()) storage.removeItem(key); }
        });
        // Fail before loading the game if a private durable backing store cannot
        // be installed. Never fall back to the player's normal localStorage.
        const probe = `${prefix}probe`;
        storage.setItem(probe, '1'); storage.removeItem(probe);
        Object.defineProperty(window, 'localStorage', { configurable: true, get: () => isolated });
        const originalPlay = HTMLMediaElement.prototype.play;
        HTMLMediaElement.prototype.play = function (...args) {
            this.muted = true;
            return originalPlay.apply(this, args);
        };
        window.CEParityTesting = Object.freeze({ active: true, checkpoint, openSandbox,
            mute() { window.Howler?.mute(true); },
            freshSave() {
                return { version: '1.0.0', balanceVersion: 'dm2-beta-1', timestamp: Date.now(),
                    dogecoins: 1000000, totalMined: 1000000, totalClicks: 0, dps: 0, highestDps: 0,
                    currentLevel: 'earth', timelineNumber: 1,
                    storyProgress: { version: 1, timeline: 1, completionHistoryVersion:1, seen: ['tothemoon', 'bonus'], pending: [], extraDps: 0 }, helpers: [], moonHelpers: [], marsHelpers: [],
                    jupiterHelpers: [], titanHelpers: [], helperUpgradeLevels: {}, helperUpgradeOffers: {},
                    statistics: { totalPlayTime: 0, startTime: Date.now() },
                    settings: { soundEnabled: false, musicEnabled: false, notificationsEnabled: true,
                        hintsEnabled: true, storiesEnabled: true, newsEnabled: true,
                        autoSaveEnabled: true, autoPlaceHelpers: true }, unlockedLevels: ['earth'] };
            }
        });
        if (!isolated.getItem('dogeminer_ce_save')) {
            isolated.setItem('dogeminer_ce_save', JSON.stringify(window.CEParityTesting.freshSave()));
        }
    } catch (error) {
        window.CEParityTesting = Object.freeze({ active: true, error: 'Test storage could not be isolated. Close this test tab and try again.' });
        console.error('Checkpoint sandbox initialization failed:', error);
    }
})();
