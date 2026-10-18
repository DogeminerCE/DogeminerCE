const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../play/js');
const context = { window: {}, document: { hidden: false, querySelectorAll: () => [] },
    console: { log() {}, warn() {}, error() {} } };
vm.createContext(context);
for (const file of ['game', 'searchdoge', 'ui', 'save']) {
    vm.runInContext(fs.readFileSync(path.join(root, `${file}.js`), 'utf8'), context);
}
const Game = vm.runInContext('DogeMinerGame', context);
const UI = vm.runInContext('UIManager', context);
const Save = vm.runInContext('SaveManager', context);
const search = context.window.DogeMinerSearchdoge;
const plain = data => JSON.parse(JSON.stringify(data));
const available = ['a', 'b', 'c', 'd'].map(helperType => ({ helperType, nextLevel: 1 }));
function fixture(timeline = 1) {
    let saves = 0, fail = false, notices = 0, renders = 0;
    const snapshots = [];
    const game = Object.assign(Object.create(Game.prototype), { _bootComplete: true, isPlaying: true,
        currentLevel: 'earth', timelineNumber: timeline, helperUpgradeOffers: {}, searchdogeSlot3Unlocked: false,
        isMobileDevice() { return false; }, showNotification() { notices++; } });
    game.restoreSearchdogeDiscovery();
    const ui = Object.assign(Object.create(UI.prototype), { game,
        getAvailableHelperUpgrades() { return available; }, updateUpgradeContent() { renders++; }, updateUpgradeTabCount() {} });
    context.window.uiManager = ui;
    context.window.saveManager = { saveGame() { saves++; if (fail) return false;
        snapshots.push(plain({ discovery: game.getSearchdogeDiscoveryForSave(), offers: game.helperUpgradeOffers })); return true; } };
    const clock = () => game.searchdogeDiscovery.planets[game.currentLevel];
    const ready = () => { game.searchdogeDiscovery.runTimeMs = 161000; clock().sinceFoundMs = 17001; clock().pauseMs = 0; };
    return { game, ui, clock, ready, snapshots, get saves() { return saves; }, get notices() { return notices; },
        get renders() { return renders; }, set fail(value) { fail = value; } };
}
let f = fixture();
f.ui.getDisplayHelperUpgrades(available); f.ui.getDisplayHelperUpgrades(available, true);
assert.deepEqual(plain(f.game.helperUpgradeOffers.earth), [null, null, null], 'Rendering either layout never discovers an offer');
f.ready(); f.game.searchdogeDiscovery.runTimeMs = 160999;
assert.equal(f.game.tryFindSearchdogeUpgrade({ random: () => 0 }), 'ineligible');
f.game.searchdogeDiscovery.runTimeMs = 161000; f.clock().sinceFoundMs = 17000;
assert.equal(f.game.tryFindSearchdogeUpgrade({ random: () => 0 }), 'waiting');
f.clock().sinceFoundMs = 17001;
for (const [roll, expectedAttempts] of [[.15, 1], [.35, 2], [.46, 3], [.77, 4], [.96, 5]]) {
    assert.equal(f.game.tryFindSearchdogeUpgrade({ random: () => roll }), 'miss');
    assert.equal(f.clock().attempts, expectedAttempts);
    assert.equal(f.snapshots.at(-1).discovery.planets.earth.attempts, expectedAttempts, 'Misses persist before another roll');
}
assert.equal(f.game.tryFindSearchdogeUpgrade({ random: () => .999 }), 'found', 'The sixth source chance is guaranteed');
assert.deepEqual(plain(f.game.helperUpgradeOffers.earth), ['d', null, null]);
assert.equal(f.clock().attempts, 0); assert.equal(f.clock().sinceFoundMs, 0);
assert.equal(f.notices, 1); assert.equal(f.renders, 1);
f.ready();
assert.equal(f.game.tryFindSearchdogeUpgrade({ random: () => 0 }), 'found');
assert.deepEqual(plain(f.game.helperUpgradeOffers.earth), ['d', 'a', null]);
f.ready();
assert.equal(f.game.tryFindSearchdogeUpgrade({ random: () => 0 }), 'full');
f.game.searchdogeSlot3Unlocked = true;
assert.equal(f.game.tryFindSearchdogeUpgrade({ random: () => 0 }), 'found');
assert.deepEqual(plain(f.game.helperUpgradeOffers.earth), ['d', 'a', 'b']);
f.ui.replacePurchasedHelperUpgradeOffer('a');
assert.deepEqual(plain(f.game.helperUpgradeOffers.earth), ['d', null, 'b'], 'A purchase leaves its slot searching');
assert.equal(f.clock().pauseMs, 1500);
const rendered = f.ui.getDisplayHelperUpgrades(available, true);
assert.deepEqual(Array.from(rendered, item => item?.helperType ?? null), ['d', null, 'b']);

// Active frame integration checks once per three seconds, never per render.
f = fixture(); f.game.searchdogeDiscovery.runTimeMs = 161000; f.clock().sinceFoundMs = 17001;
let checks = 0;
f.game.tryFindSearchdogeUpgrade = () => { checks++; return 'checked'; };
for (let i = 0; i < 179; i++) f.game.advanceSearchdogeDiscovery(1000 / 60);
assert.equal(checks, 0);
for (let i = 0; i < 2; i++) f.game.advanceSearchdogeDiscovery(1000 / 60);
assert.equal(checks, 1);
for (const flag of ['isPlaying', 'isIntroPlaying', 'isCutscenePlaying', 'isTransitioning', 'isBetaReportOpen', 'isOfflineReportOpen']) {
    const before = plain(f.game.searchdogeDiscovery);
    f.game[flag] = flag === 'isPlaying' ? false : true;
    f.game.advanceSearchdogeDiscovery(1000);
    assert.deepEqual(plain(f.game.searchdogeDiscovery), before, `No active search behind ${flag}`);
    f.game[flag] = flag === 'isPlaying';
}
context.document.hidden = true;
const before = f.game.searchdogeDiscovery.runTimeMs;
f.game.advanceSearchdogeDiscovery(3600000);
assert.equal(f.game.searchdogeDiscovery.runTimeMs, before);
context.document.hidden = false;
f.game.advanceSearchdogeDiscovery(3600000);
assert.equal(f.game.searchdogeDiscovery.runTimeMs, before + 1000, 'Suspension cannot catch up with offline rolls');

// Prestige starts after 8 complete seconds and guarantees discoveries, with a
// shorter five-second interval. Saved clocks and offers stay per planet.
f = fixture(2); f.game.searchdogeDiscovery.runTimeMs = 8999; f.clock().sinceFoundMs = 9000;
assert.equal(f.game.tryFindSearchdogeUpgrade({ random: () => .999 }), 'ineligible');
f.game.searchdogeDiscovery.runTimeMs = 9000;
assert.equal(f.game.tryFindSearchdogeUpgrade({ random: () => .999 }), 'found');
f.clock().pauseMs = 0; f.clock().sinceFoundMs = 5000;
assert.equal(f.game.tryFindSearchdogeUpgrade({ random: () => 0 }), 'waiting');
f.clock().sinceFoundMs++;
assert.equal(f.game.tryFindSearchdogeUpgrade({ random: () => 0 }), 'found');
const earth = plain(f.clock()), earthOffers = plain(f.game.helperUpgradeOffers.earth);
f.game.currentLevel = 'moon'; f.clock().sinceFoundMs = 6000;
assert.equal(f.game.tryFindSearchdogeUpgrade({ random: () => 0 }), 'found');
assert.deepEqual(plain(f.game.searchdogeDiscovery.planets.earth), earth);
assert.deepEqual(plain(f.game.helperUpgradeOffers.earth), earthOffers);
const data = plain(Save.prototype.createSaveData.call({ game: f.game }));
const restored = Object.assign(Object.create(Game.prototype), { timelineNumber: 2 });
restored.restoreSearchdogeDiscovery(data);
assert.deepEqual(plain(restored.searchdogeDiscovery), plain(f.game.searchdogeDiscovery));
restored.timelineNumber = 3; restored.restoreSearchdogeDiscovery(data);
assert.equal(restored.searchdogeDiscovery.runTimeMs, 0, 'A new timeline cannot inherit an old search clock');

f = fixture(); f.ready(); f.fail = true;
const failedClock = plain(f.clock());
assert.equal(f.game.tryFindSearchdogeUpgrade({ random: () => 0 }), 'save-failed');
assert.deepEqual(plain(f.clock()), failedClock);
assert.equal(f.game.helperUpgradeOffers.earth, undefined);
assert.equal(f.notices, 0); assert.equal(f.renders, 0);
assert.equal(f.game.tryFindSearchdogeUpgrade({ random: () => .5 }), 'save-failed');
assert.equal(f.clock().attempts, 0, 'A failed write cannot consume a chance escalation');
f = fixture(); f.ready(); f.game.isMobileDevice = () => true;
let mobileRenders = 0;
f.ui.updateMobileUpgradesContent = () => { mobileRenders++; };
assert.equal(f.game.tryFindSearchdogeUpgrade({ random: () => 0 }), 'found');
assert.equal(mobileRenders, 1, 'A discovery updates the production mobile upgrade renderer too');
assert.equal(search.normalize({ version: 1, timeline: 1, runTimeMs: Infinity, planets: { earth: { attempts: -99, checkMs: NaN } } }).runTimeMs, 0);
assert.deepEqual(Array.from(search.slotsFor({ currentLevel: 'earth', searchdogeSlot3Unlocked: true,
    helperUpgradeOffers: { earth: ['a', 'a', 'missing'] } }, available)), ['a', null, null]);
const alpha = Object.assign(Object.create(Game.prototype), { timelineNumber: 1 });
alpha.restoreSearchdogeDiscovery({ timestamp: 1000000, statistics: { startTime: 1 } });
assert.equal(alpha.searchdogeDiscovery.runTimeMs, 161000, 'An established Alpha session retains eligibility without inventing active-clock history');
assert.equal(alpha.searchdogeDiscovery.planets.earth.attempts, 0);
assert.equal(alpha.searchdogeDiscovery.planets.earth.sinceFoundMs, 0);
alpha.restoreSearchdogeDiscovery({ timestamp: 1000000, statistics: { startTime: 999000 } });
assert.equal(alpha.searchdogeDiscovery.runTimeMs, 1000, 'Only the span before the save counts, not the current absence');
console.log('Searchdoge: eligibility, exact odds, 3s checks, prestige speed, saved per-planet slots/clocks, pause and rollback pass.');
