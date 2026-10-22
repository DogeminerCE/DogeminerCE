const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const nodes = new Map();
let writes = 0, controls = [], logs = 0;
function node() {
    let text = '';
    return {get textContent() { return text; }, set textContent(value) { text = String(value); writes++; }, style: {}};
}
const context = {window: {}, document: {
    getElementById(id) { if (!nodes.has(id)) nodes.set(id, node()); return nodes.get(id); },
    querySelectorAll(selector) { return selector.includes('[data-upgrade-helper]') ? controls : []; }
}, console: {log() { logs++; }, warn() {}, error() {}}, Date: {now: () => 10000}};
vm.createContext(context);
for (const name of ['game', 'shop', 'ui', 'stories', 'late-progression']) vm.runInContext(fs.readFileSync(`play/js/${name}.js`, 'utf8'), context);
const {Game, Shop, UI} = vm.runInContext('({Game:DogeMinerGame,Shop:ShopManager,UI:UIManager})', context);
const game = Object.assign(Object.create(Game.prototype), {
    currentLevel: 'earth', helpers: [{type: 'miningShibe'}, {type: 'miningShibe'}],
    moonHelpers: [{type: 'moonShibe'}], marsHelpers: [], jupiterHelpers: [], titanHelpers: [{type: 'roboShibe'}],
    helperUpgradeLevels: {}, dogecoins: 1e20, dogediamonds: 100, dogediamondsEverObtained: 100,
    totalMined: 120, totalClicks: 9, dps: 4, highestDps: 4, startTime: 0, totalPlayTime: 0,
    isMobileDevice: () => false, updateInventoryUnread() {}, updateShopPrices() {}
});
const shop = new Shop(game), ui = Object.assign(Object.create(UI.prototype), {game});
context.window.shopManager = shop;
assert.equal(game.getTotalHelperCount(), 4, 'Include Titan helpers in lifetime statistics');
assert.equal(shop.getOwnedHelperCount('roboShibe'), 1);
assert.equal(shop.getHelperCounts([]).size, 0, 'An empty planet is not a request for all planets');
assert.equal(shop.getHelperCounts(game.helpers).get('miningShibe'), 2);
const oldCounts = shop.getHelperCounts();
game.helpers.push({type: 'miningShibe'});
assert.equal(shop.getHelperCounts().get('miningShibe'), 3);
assert.equal(oldCounts.get('miningShibe'), 2, 'Counts are snapshots, never retained across refreshes');
game.helpers = [{type: 'dogeKennels'}, {type: 'dogeKennels'}, {type: 'dogeKennels'}];
assert.equal(shop.canAffordHelperUpgrade('miningShibe'), false, 'A replaced array cannot retain stale ownership');
assert.equal(shop.canAffordHelperUpgrade('dogeKennels'), true);
assert.deepEqual(Array.from(ui.getAvailableHelperUpgrades(), u => [u.helperType, u.helperCount]), [['dogeKennels', 3]]);
game.currentLevel = 'titan';
assert.deepEqual(Array.from(ui.getAvailableHelperUpgrades(), u => [u.helperType, u.helperCount]), [['roboShibe', 1]]);
assert.equal(game.getHelperArrayForLevel(), game.titanHelpers);
game.currentLevel = 'earth';

// A refresh traverses the collection once, regardless of duplicate desktop/
// Phone controls and both currencies. This also catches accidental .filter work.
let reads = 0;
const count = 5000;
game.helpers = Array.from({length: count}, () => ({get type() { reads++; return 'miningShibe'; }}));
reads = 0;
ui.getAvailableHelperUpgrades();
assert.equal(reads, count);
assert.equal(logs, 0, 'Upgrade discovery must not dump collections into the console');
function button(currency, level = 1) {
    let disabled = false;
    const classes = new Set();
    return {dataset: {upgradeHelper: 'miningShibe', upgradeCurrency: currency, upgradeLevel: String(level)},
        get disabled() { return disabled; }, set disabled(value) { disabled = value; writes++; },
        classList: {contains: name => classes.has(name), toggle(name, on) { writes++; if (on) classes.add(name); else classes.delete(name); }}};
}
controls = [button('dogecoins'), button('dogediamonds'), button('dogecoins'), button('dogediamonds'), button('dogecoins', 2)];
reads = 0;
ui.updateHelperUpgradeAffordability();
assert.equal(reads, count, 'Read each instrumented helper once across all currency controls');
assert.equal(controls[0].disabled, false);
assert.equal(controls[4].disabled, true, 'Stale future-tier controls remain blocked');
writes = 0;
ui.updateHelperUpgradeAffordability();
assert.equal(writes, 0, 'Unchanged affordability has no DOM writes');
game.dogecoins = 0; game.dogediamonds = 0;
ui.updateHelperUpgradeAffordability();
assert.ok(controls.every(b => b.disabled));
game.dogecoins = 1e20; game.dogediamonds = 100; game.helperUpgradeLevels.miningShibe = 1;
ui.updateHelperUpgradeAffordability();
assert.ok(controls.slice(0, 4).every(b => b.disabled), 'Old offers cannot become actionable after an upgrade');
assert.equal(controls[4].disabled, false);

// HUD changes paint immediately, while identical refreshes preserve text nodes.
game.updateUI(true); writes = 0;
game.updateUI(true);
assert.equal(writes, 0);
const total = game.getTotalHelperCount();
assert.equal(nodes.get('helpers-owned').textContent, String(total));
game.titanHelpers.push({type: 'roboShibe'});
game.updateUI(true);
assert.equal(nodes.get('helpers-owned').textContent, String(total + 1));
ui.activeMobileTab = 'achievements'; ui.updateMobileStats();
assert.equal(nodes.get('mobile-helpers-owned').textContent, nodes.get('helpers-owned').textContent);
const amount = nodes.get('dogecoin-amount');
game.dogecoins += 100;
game.updateDogecoinCounter();
assert.equal(nodes.get('dogecoin-amount'), amount, 'Keep the same counter element');
context.document.getElementById = () => null;
assert.doesNotThrow(() => game.updateDisplayText('missing-optional-panel', '0'));
console.log('PASS: bounded helper scans, fresh ownership snapshots, both currencies/stale tiers, silent discovery, unchanged HUD writes and Titan totals on desktop/Phone.');
