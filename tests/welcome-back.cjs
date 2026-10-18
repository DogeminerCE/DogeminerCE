const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../play/js');
const NOW = 1800000000000;
const timers = new Map();
let timerId = 0;
let blockedModal = false;
const storage = new Map();
const fault = { key: null };
const shown = [];
let open = false;
const context = { window: {}, console: { log() {}, error() {}, warn() {} },
    Date: class extends Date { static now() { return NOW; } },
    document: { querySelector() { return blockedModal ? {} : null; } },
    setTimeout(callback, delay) { const id = ++timerId; timers.set(id, { callback, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    localStorage: { getItem(key) { return storage.get(key) ?? null; },
        setItem(key, value) { if (fault.key === key) { fault.key = null; throw new Error('Commit failed'); } storage.set(key, String(value)); },
        removeItem(key) { storage.delete(key); } }
};
vm.createContext(context);
for (const file of ['offline-earnings', 'game', 'save', 'welcome-back']) {
    vm.runInContext(fs.readFileSync(path.join(root, `${file}.js`), 'utf8'), context);
}
const Game = vm.runInContext('DogeMinerGame', context);
const Save = vm.runInContext('SaveManager', context);
context.window.WelcomeBackReport = {
    show(report, options) { open = true; shown.push({ report, options }); }, close() { open = false; }
};
const report = { id: 'one', from: NOW - 3600000, to: NOW, amount: 108000,
    dps: 100, elapsedMs: 3600000, rate: .3, acknowledged: false };
function makeGame(overrides = {}) {
    const game = Object.assign(Object.create(Game.prototype), { _bootComplete: true, currentLevel: 'mars',
        isPlaying: true, isMouseDown: true, isSpaceDown: true, _helperRockElapsed: 199,
        offlineEarningsReport: { ...report }, dogecoins: 108100, totalMined: 109000, ...overrides });
    const save = Object.assign(Object.create(Save.prototype), { game, saveKey: 'save', backupKey: 'backup',
        _saveBlocked: false, _loadInProgress: false,
        createSaveData() { return { timestamp: NOW, dogecoins: game.dogecoins, totalMined: game.totalMined,
            offlineEarningsReport: game.offlineEarningsReport }; } });
    context.window.saveManager = save;
    return { game, save };
}
function fire(delay) {
    const pair = [...timers].find(([, timer]) => timer.delay === delay);
    assert.ok(pair, `Expected timer at ${delay}ms`);
    timers.delete(pair[0]); pair[1].callback();
}
for (const overrides of [{ _bootComplete: false }, { offlineEarningsReport: null },
    { offlineEarningsReport: { ...report, acknowledged: true } }]) {
    const { game } = makeGame(overrides);
    game.scheduleOfflineEarningsReport();
    assert.equal(timers.size, 0);
    assert.equal(game.showPendingOfflineEarningsReport(), false);
}
for (const flag of ['isBetaReportOpen', 'isIntroPlaying', 'isCutscenePlaying', 'isTransitioning', '_dogebagReveal']) {
    const { game } = makeGame({ [flag]: true });
    game.scheduleOfflineEarningsReport();
    assert.equal(timers.size, 1);
    fire(3000);
    assert.equal(shown.length, 0, `Offline report waits behind ${flag}`);
    assert.equal(timers.size, 1);
    game[flag] = false;
    fire(500);
    assert.equal(shown.at(-1).options.planet, 'mars');
    assert.equal(game.isOfflineReportOpen, true);
    game.closeOfflineEarningsReport(); shown.length = 0;
}
const { game, save } = makeGame();
blockedModal = true;
assert.equal(game.showPendingOfflineEarningsReport(), false);
blockedModal = false;
game.scheduleOfflineEarningsReport(); game.scheduleOfflineEarningsReport();
assert.equal(timers.size, 1, 'Repeated scheduling cannot open duplicate views');
fire(3000);
assert.equal(game.isPlaying, false);
assert.equal(game.isMouseDown, false);
assert.equal(game.isSpaceDown, false);
assert.equal(game._helperRockElapsed, 0);
assert.equal(game.showPendingOfflineEarningsReport(), true);
assert.equal(shown.length, 1);
storage.set('save', 'prior-main'); storage.set('backup', 'prior-backup');
fault.key = 'save';
assert.equal(shown[0].options.onAcknowledge(), false);
assert.equal(game.isPlaying, false);
assert.equal(game.offlineEarningsReport.acknowledged, false);
assert.equal(storage.get('save'), 'prior-main');
assert.equal(storage.get('backup'), 'prior-backup');
assert.equal(storage.has('dogeminer_ce_offline_earnings_receipts'), false);
assert.equal(shown[0].options.onAcknowledge(), true);
assert.equal(game.isPlaying, true);
assert.equal(game.offlineEarningsReport.acknowledged, true);
assert.equal(game.dogecoins, 108100, 'Closing is acknowledgment, never another currency grant');
assert.equal(JSON.parse(storage.get('save')).offlineEarningsReport.acknowledged, true);
assert.equal(JSON.parse(storage.get('dogeminer_ce_offline_earnings_receipts'))[0].acknowledged, true);
assert.equal(save.acknowledgeOfflineEarnings('different'), false);
assert.equal(save.acknowledgeOfflineEarnings('one'), true);

const paused = makeGame({ isPlaying: false });
paused.game.showPendingOfflineEarningsReport();
assert.equal(shown.at(-1).options.onAcknowledge(), true);
assert.equal(paused.game.isPlaying, false, 'A previously paused game remains paused');

const replaced = makeGame();
replaced.game.showPendingOfflineEarningsReport();
const stale = shown.at(-1).options.onAcknowledge;
replaced.game.offlineEarningsReport = { ...report, id: 'replacement' };
replaced.game.closeOfflineEarningsReport();
assert.equal(open, false);
assert.equal(replaced.game.isPlaying, true);
assert.equal(stale(), false, 'An old view cannot acknowledge a newly imported report');
replaced.game.scheduleOfflineEarningsReport();
replaced.game.offlineEarningsReport = null;
fire(3000);
assert.equal(timers.size, 0, 'Reset or save replacement cancels the pending receipt');
// Exercise the actual destructive-reset routine in the isolated VM. Neither a
// pending receipt nor its scheduled dialog may survive into the fresh save.
context.gameConfirm = async () => true;
context.document.getElementById = () => null;
context.location = { reload() {} };
const reset = makeGame();
Object.assign(reset.game, { defaultPickaxe: { instanceId: 'paw' },
    _expireBonusCoinBuff() {}, _removeBonusCoinEl() {}, updateDiamondCounter() {},
    recalculatePlayerStats() {}, getPlanetRockBaseHP: () => 10, clearAllHelperSprites() {},
    updateUI() {}, updateDPS() {}, showNotification() {} });
reset.game.scheduleOfflineEarningsReport();
reset.save.resetGame().then(() => {
    assert.equal(reset.game.offlineEarningsReport, null);
    assert.equal(reset.game.isOfflineReportOpen, false);
    assert.equal(JSON.parse(storage.get('save')).offlineEarningsReport, null);
    assert.equal([...timers.values()].some(timer => timer.delay === 3000 || timer.delay === 500), false);
    console.log('Welcome back: startup ordering, focus/input pause, durable acknowledgment, failure, replacement and production reset pass.');
}).catch(error => { console.error(error); process.exitCode = 1; });
