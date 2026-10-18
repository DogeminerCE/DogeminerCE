const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../play/js');
const NOW = 1800000000000;
const HOUR = 3600000;
const context = { window: {}, document: { querySelectorAll() { return []; } },
    console: { log() {}, error() {}, warn() {} }, Date: class extends Date { static now() { return NOW; } } };
vm.createContext(context);
for (const name of ['offline-earnings', 'game', 'save']) {
    vm.runInContext(fs.readFileSync(path.join(root, `${name}.js`), 'utf8'), context);
}
const offline = context.window.DogeMinerOfflineEarnings;
const Game = vm.runInContext('DogeMinerGame', context);
const Save = vm.runInContext('SaveManager', context);

for (const [ago, dps, expected] of [
    [300000, 100, null], [300001, 100, 9000], [HOUR, 100, 108000],
    [24 * HOUR, 100, 2592000], [72 * HOUR, 100, 2592000],
    [HOUR, 0, null], [HOUR, -1, null], [HOUR, Infinity, null],
    [HOUR, 0.0001, null], [HOUR, 0.0005, 1], [-HOUR, 100, null]
]) assert.equal(offline.calculate(NOW - ago, NOW, dps)?.amount ?? null, expected, `${ago}ms at ${dps} DPS`);
for (const savedAt of [0, null, NaN, Infinity, '1800000000000']) {
    assert.equal(offline.calculate(savedAt, NOW, 100), null, 'Invalid timestamps cannot manufacture earnings');
}
assert.equal(offline.calculate(NOW - HOUR, NOW, Number.MAX_VALUE), null);

// Use the production total-DPS path: both planets, upgraded strength, passive
// stats and permanent multipliers count. Rick and the temporary coin do not.
context.window.shopManager = { getCurrentHelperUpgradeInfo(type) { return { dps: type === 'shibe' ? 10 : 50 }; } };
const incomeGame = Object.assign(Object.create(Game.prototype), {
    helpers: [{ type: 'shibe' }, { type: 'shibe' }], moonHelpers: [{ type: 'base' }],
    playerStats: { helperDpsMultiplier: 1.5, flatHelperDps: 20, totalDpsMultiplier: 2 },
    bonusCoinBuffMultiplier: 2.5, placedRick: { active: true }, placedHelpers: [],
    _rickBoostedCounts: {}, getMysteryDPS() { return 420; }
});
assert.equal(incomeGame.getOfflineDPS(), 1090);
assert.equal(incomeGame.bonusCoinBuffMultiplier, 2.5, 'Offline calculation never expires or consumes the saved buff');
assert.ok(incomeGame.calculateTotalDPS() > incomeGame.getOfflineDPS());

function page() {
    const storage = new Map();
    const fault = { key: null };
    context.localStorage = {
        getItem(key) { return storage.get(key) ?? null; },
        setItem(key, value) {
            if (fault.key === key) { fault.key = null; throw new Error('Storage rejected'); }
            storage.set(key, String(value));
        }, removeItem(key) { storage.delete(key); }
    };
    const game = { dogecoins: 7, totalMined: 9, dps: 100, offlineEarningsReport: null,
        getOfflineDPS() { return 100; }, updateUI() {}, showPendingBetaMigrationReport() {} };
    const save = Object.assign(Object.create(Save.prototype), {
        game, saveKey: 'save', backupKey: 'backup', _saveBlocked: false, _loadInProgress: false,
        _applySaveData(data) {
            game.dogecoins = data.dogecoins; game.totalMined = data.totalMined;
            game.dps = 99999999; // Deliberately stale serialized value.
            game.offlineEarningsReport = offline.normalizeReport(data.offlineEarningsReport);
        },
        createSaveData() { return { ...snapshot, timestamp: NOW, dogecoins: game.dogecoins,
            totalMined: game.totalMined, offlineEarningsReport: game.offlineEarningsReport }; }
    });
    return { game, save, storage, fault };
}
const snapshot = { version: '1.0.0', timestamp: NOW - HOUR, dogecoins: 1000,
    totalMined: 2000, totalClicks: 2 };
const initial = JSON.stringify(snapshot);
const first = page();
first.save.applySaveData(snapshot);
assert.equal(JSON.stringify(snapshot), initial, 'Applying a save does not mutate the import/cloud object');
assert.equal(first.game.dogecoins, 109000);
assert.equal(first.game.totalMined, 110000);
assert.equal(first.game.offlineEarningsReport.amount, 108000);
assert.equal(first.game.offlineEarningsReport.acknowledged, false);
assert.equal(first.storage.get('save'), first.storage.get('backup'));
const committed = JSON.parse(first.storage.get('save'));
assert.equal(committed.timestamp, NOW);
assert.equal(committed.dogecoins, 109000, 'Currency and report are durable before the dialog');
first.save.applySaveData(committed);
assert.equal(first.game.dogecoins, 109000, 'Immediate refresh cannot add another award');
assert.equal(first.game.offlineEarningsReport.id, committed.offlineEarningsReport.id);
first.save.applySaveData(snapshot);
assert.equal(first.game.dogecoins, 109000, 'Repeated old cloud/import snapshot restores exactly its one credit');
const reordered = { totalClicks: 2, totalMined: 2000, dogecoins: 1000,
    timestamp: NOW - HOUR, version: '1.0.0' };
first.save.applySaveData(reordered);
assert.equal(first.game.dogecoins, 109000);
assert.equal(JSON.parse(first.storage.get('dogeminer_ce_offline_earnings_receipts')).length, 1);

// A later real absence uses the new saved timestamp and can earn normally.
const tomorrow = { ...committed, timestamp: NOW - 2 * HOUR };
first.save.applySaveData(tomorrow);
assert.equal(first.game.dogecoins, 325000);

for (const key of ['save', 'backup', 'dogeminer_ce_offline_earnings_receipts']) {
    const failed = page();
    failed.storage.set('save', 'old-main'); failed.storage.set('backup', 'old-backup');
    failed.fault.key = key;
    assert.throws(() => failed.save.applySaveData(snapshot), /Storage rejected/);
    assert.equal(failed.game.dogecoins, 7, 'Rejected persistence rolls back the live award');
    assert.equal(failed.game.totalMined, 9);
    assert.equal(failed.game.offlineEarningsReport, null);
    assert.equal(failed.storage.get('save'), 'old-main');
    assert.equal(failed.storage.get('backup'), 'old-backup');
    assert.equal(failed.storage.has('dogeminer_ce_offline_earnings_receipts'), false);
    assert.equal(failed.save._saveBlocked, true);
    assert.equal(failed.save.saveGame(false), false, 'Autosave cannot overwrite progress after a failed load');
}

const short = page();
short.save.applySaveData({ ...snapshot, timestamp: NOW - 4 * 60000 });
assert.equal(short.game.dogecoins, 1000);
assert.equal(short.storage.size, 0, 'No forced write or report below the source threshold');
assert.equal(offline.readReceipts({}).length, 0);
assert.equal(offline.normalizeReport({ amount: Infinity }), null);
console.log('Offline earnings: thresholds, cap, permanent DPS, durable credit, replay and rollback pass.');
