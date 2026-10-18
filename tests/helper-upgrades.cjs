// Observed Dogeminer 2 purchases are the fixture, independent of CE's formulas.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const research = JSON.parse(fs.readFileSync(path.join(root, 'docs/research/dogeminer2-helper-upgrades.json'), 'utf8'));
const context = {
    window: {},
    document: { querySelectorAll: () => [], querySelector: () => null, getElementById: () => null },
    console: { log() {}, warn() {}, error() {} },
    Date, Math, Map, Set
};
vm.createContext(context);
for (const name of ['shop', 'game', 'searchdoge', 'save', 'ui', 'stories', 'late-progression']) {
    vm.runInContext(fs.readFileSync(path.join(root, `play/js/${name}.js`), 'utf8'), context);
}
vm.runInContext('globalThis.classes = { ShopManager, DogeMinerGame, SaveManager, UIManager };', context);
const { ShopManager, DogeMinerGame, SaveManager, UIManager } = context.classes;
const game = {
    lateProgression:{version:1,timeline:1,yoga:true,reallyhardium:true}, currentLevel: 'earth', dogecoins: 0, dogediamonds: 1000000,
    dogediamondsEverObtained: 1000000, helperUpgradeLevels: { altarOfTheSunDoge: 1 }, helperUpgradeOffers: {},
    helpers: [], moonHelpers: [], marsHelpers: [], jupiterHelpers: [], titanHelpers: [],
    placedHelpers: [], earthPlacedHelpers: [], moonPlacedHelpers: [], marsPlacedHelpers: [], jupiterPlacedHelpers: [], titanPlacedHelpers: [],
    playerStats: { helperDpsMultiplier: 1 }, bonusCoinBuffMultiplier: 1, highestDps: 0,
    refreshBonusCoinLevel() {}, showNotification() {}, updateUI() {}, updateShopPrices() {},
    updateHelperSpritesByType: DogeMinerGame.prototype.updateHelperSpritesByType,
    updateDPS: DogeMinerGame.prototype.updateDPS,
    updateRickAura: DogeMinerGame.prototype.updateRickAura,
    getRickAuraRadius: DogeMinerGame.prototype.getRickAuraRadius,
    getRickAuraBaseDPS: DogeMinerGame.prototype.getRickAuraBaseDPS,
    calculateTotalDPS: DogeMinerGame.prototype.calculateTotalDPS,
    getMysteryDPS: DogeMinerGame.prototype.getMysteryDPS,
    getHelperCost: DogeMinerGame.prototype.getHelperCost,
    getHelperSpritePaths: DogeMinerGame.prototype.getHelperSpritePaths,
    flashDiamondAmount(type) { assert.equal(type, 'red'); },
    flashDogecoinAmount(type) { assert.equal(type, 'red'); },
    updateDiamondCounter() {}
};
const categories = ['helpers', 'moonHelpers', 'marsHelpers', 'jupiterHelpers', 'titanHelpers'];
for (const helper of research.helpers) game[categories[helper.location - 1]].push({ type: helper.ceHelperType, dps: helper.baseDps });
const shop = new ShopManager(game);
context.window.shopManager = shop;
context.window.uiManager = {};
let saves = 0;
context.window.saveManager = { saveGame(show) { assert.equal(show, false); saves++; return true; } };

assert.equal(research.helpers.length, 29);
assert.deepEqual(research.verification.skippedHelperState, [34, 0, 0, 5, 5]);
const completed = new Set();
let previous;
for (const purchase of research.sequence) {
    if (purchase.helperId !== previous) {
        if (previous !== undefined) completed.add(previous);
        assert.ok(!completed.has(purchase.helperId), 'Research must finish each helper before moving on');
        previous = purchase.helperId;
    }
}

let purchases = 0;
for (const helper of research.helpers) {
    const type = helper.ceHelperType;
    game.helperUpgradeLevels.altarOfTheSunDoge = 1;
    assert.equal(shop.getCurrentHelperUpgradeInfo(type).dps, helper.baseDps);
    for (const observed of helper.upgrades) {
        const next = shop.getNextHelperUpgrade(type);
        assert.ok(observed.purchased);
        for (const [field, expected] of [['level', observed.level], ['price', observed.dogecoinCost], ['diamondPrice', observed.diamondCost], ['dps', observed.dpsAfter]]) {
            assert.equal(next[field], expected, `${type} level ${observed.level}: ${field}`);
        }
        if (observed.kind === 'repeatable') assert.equal(next.upgradeName, observed.title);
        assert.equal(next.upgradeIcon, `assets/general/icons/${observed.sprite}.webp`, `${type} level ${observed.level}: reference upgrade icon`);
        assert.ok(fs.existsSync(path.join(root, 'play', next.upgradeIcon)), `Missing upgrade icon: ${next.upgradeIcon}`);
        const diamonds = game.dogediamonds;
        assert.ok(shop.buyHelperUpgrade(type, 'dogediamonds', observed.level));
        assert.equal(game.dogediamonds, diamonds - observed.diamondCost);
        assert.equal(game.dogecoins, 0, 'Diamond purchase must not spend coins');
        assert.equal(shop.getCurrentHelperUpgradeInfo(type).dps, observed.dpsAfter);
        const sprite = game.getHelperSpritePaths(type, observed.level);
        const visualLevel = Math.min(observed.level, helper.finiteMaxLevel);
        assert.ok(sprite.idle.endsWith(`-idle-${visualLevel}.webp`));
        assert.ok(sprite.mining.endsWith(`-mine-${visualLevel}.webp`));
        for (const file of Object.values(sprite)) assert.ok(fs.existsSync(path.join(root, 'play', file)), `Missing sprite: ${file}`);
        assert.equal(shop.buyHelperUpgrade(type, 'dogediamonds', observed.level), false, 'Stale button must not buy another level');
        assert.equal(game.dogediamonds, diamonds - observed.diamondCost);
        purchases++;
    }
    const next = shop.getNextHelperUpgrade(type);
    assert.equal(next.diamondPrice, helper.next.diamonds);
    assert.equal(next.price, helper.next.cost);
    assert.equal(next.dps, helper.next.strength);
}
assert.equal(purchases, 432);
assert.equal(saves, purchases);
const expectedDps = research.helpers.reduce((sum, helper) => sum + helper.upgrades.at(-1).dpsAfter, 0);
assert.equal(game.dps, expectedDps);

const type = 'miningShibe';
const next = shop.getNextHelperUpgrade(type);
game.dogecoins = next.price;
const diamonds = game.dogediamonds;
assert.ok(shop.buyHelperUpgrade(type, 'dogecoins', next.level));
assert.equal(game.dogecoins, 0);
assert.equal(game.dogediamonds, diamonds);
game.dogediamonds = 0;
const level = shop.getHelperUpgradeLevel(type);
assert.equal(shop.buyHelperUpgrade(type, 'dogediamonds'), false);
assert.equal(shop.buyHelperUpgrade(type, 'dogecoins'), false);
assert.equal(shop.buyHelperUpgrade(type, 'invalid'), false);
assert.equal(shop.getHelperUpgradeLevel(type), level);
game.helpers = game.helpers.filter(helper => helper.type !== type);
game.dogediamonds = 100;
assert.equal(shop.buyHelperUpgrade(type, 'dogediamonds'), false, 'Unowned helpers cannot be upgraded');

// Retained CE Altar uses source helper34's actual diamond alternatives.
assert.equal(shop.getHelperUpgradeAtLevel('altarOfTheSunDoge', 1).diamondPrice, 15);
assert.equal(shop.getHelperUpgradeAtLevel('altarOfTheSunDoge', 2).diamondPrice, 25);
assert.equal(shop.getHelperUpgradeAtLevel('altarOfTheSunDoge', 3), null);
const saved = JSON.parse(JSON.stringify(SaveManager.prototype.createSaveData.call({ game })));
assert.deepEqual(saved.helperUpgradeLevels, JSON.parse(JSON.stringify(game.helperUpgradeLevels)));
assert.equal(saved.dogediamonds, 100);
const restoredShop = new ShopManager({ ...game, helperUpgradeLevels: saved.helperUpgradeLevels });
assert.equal(restoredShop.getNextHelperUpgrade('cloudBase').level, 16);
assert.equal(restoredShop.getCurrentHelperUpgradeInfo('roboShibe').dps, 35138);

// Source progression gates do not use Altar1 as a blanket metal unlock.
const late=context.window.DogeMinerLateProgression;
const gatedGame={...game,dogecoins:1e30,dogediamonds:1e6,helpers:[{type:'miningShibe'}],helperUpgradeLevels:{miningShibe:7,altarOfTheSunDoge:1},lateProgression:late.fresh(1)};
const gatedShop=new ShopManager(gatedGame);assert.equal(gatedShop.getNextHelperUpgrade('miningShibe'),null);
for(const currency of ['dogecoins','dogediamonds']){const balance=gatedGame[currency];assert.equal(gatedShop.buyHelperUpgrade('miningShibe',currency),false);assert.equal(gatedGame[currency],balance);}
gatedGame.lateProgression={...late.fresh(1),yoga:true};assert.equal(gatedShop.getNextHelperUpgrade('miningShibe'),null);
gatedGame.lateProgression.reallyhardium=true;assert.equal(gatedShop.getNextHelperUpgrade('miningShibe').level,8);
for(const helper of research.helpers){
 const terminal=helper.upgrades[helper.finiteMaxLevel-1];const unlockGame={...game,helperUpgradeLevels:{[helper.ceHelperType]:terminal.level-1},lateProgression:late.fresh(1)};
 const unlockShop=new ShopManager(unlockGame);assert.equal(unlockShop.getNextHelperUpgrade(helper.ceHelperType)===null,terminal.locked,helper.ceHelperType);
 unlockGame.lateProgression={...late.fresh(1),yoga:true,reallyhardium:true};assert.equal(unlockShop.getNextHelperUpgrade(helper.ceHelperType).level,terminal.level);
 unlockGame.helperUpgradeLevels[helper.ceHelperType]=terminal.level;unlockGame.lateProgression=late.fresh(1);
 assert.equal(unlockShop.getNextHelperUpgrade(helper.ceHelperType)===null,terminal.locked,helper.ceHelperType+' repeat');
}

// Offers survive purchases, planet changes, layout changes, and serialization.
const offerGame = { currentLevel: 'earth', searchdogeSlot3Unlocked: true,
    helperUpgradeOffers: { earth: ['a', 'b', 'c'] } };
const available = ['a', 'b', 'c', 'd'].map(helperType => ({ helperType, nextLevel: 2 }));
const ui = { game: offerGame, updateUpgradeTabCount() {}, getAvailableHelperUpgrades: () => available,
    getDisplayHelperUpgrades: UIManager.prototype.getDisplayHelperUpgrades };
const types = values => Array.from(values, upgrade => upgrade?.helperType ?? null);
assert.deepEqual(types(ui.getDisplayHelperUpgrades(available)), ['a', 'b', 'c']);
UIManager.prototype.replacePurchasedHelperUpgradeOffer.call(ui, 'b');
const replacement = Array.from(offerGame.helperUpgradeOffers.earth);
assert.equal(replacement[0], 'a');
assert.equal(replacement[2], 'c');
assert.deepEqual(types(ui.getDisplayHelperUpgrades(available, true)), replacement);
const restoredOffers = JSON.parse(JSON.stringify(offerGame.helperUpgradeOffers));
ui.game = { ...offerGame, helperUpgradeOffers: restoredOffers };
assert.deepEqual(types(ui.getDisplayHelperUpgrades(available)), replacement);
ui.game.currentLevel = 'moon';
ui.getDisplayHelperUpgrades([{ helperType: 'moonDoge', nextLevel: 1 }]);
assert.deepEqual(Array.from(ui.game.helperUpgradeOffers.earth), replacement);
ui.game.currentLevel = 'earth';
assert.deepEqual(types(ui.getDisplayHelperUpgrades(available)), replacement);
ui.game.helperUpgradeOffers.earth = ['a', 'finished', 'c'];
assert.deepEqual(types(ui.getDisplayHelperUpgrades(available.filter(u => ['a', 'c'].includes(u.helperType)))), ['a', null, 'c'], 'An empty middle slot must not move the last card');
ui.game.searchdogeSlot3Unlocked = false;
const lockedOffers = types(ui.getDisplayHelperUpgrades(available));
assert.equal(lockedOffers[0], 'a');
assert.equal(lockedOffers[1], null, 'Purchasing an offer leaves a searching slot until the clock discovers another');
assert.equal(lockedOffers[2], null);
game.helperUpgradeOffers = { earth: ['miningShibe', null, 'dogeKennels'] };
assert.deepEqual(JSON.parse(JSON.stringify(SaveManager.prototype.createSaveData.call({ game }))).helperUpgradeOffers, game.helperUpgradeOffers);

// Rick boosts only in-range helpers and resolves one tier per type.
let lookups = 0, additions = 0, removals = 0;
const sprite = { dataset: { helperId: '1' }, classList: { add() { additions++; }, remove() { removals++; } } };
context.document.querySelectorAll = () => [sprite];
context.window.shopManager = { getCurrentHelperUpgradeInfo(type) { lookups++; return { dps: type === 'miningShibe' ? 2 : 5 }; } };
const buffGame = { ...game, helpers: Array.from({ length: 100 }, () => ({ type: 'miningShibe' })),
    moonHelpers: [{ type: 'moonDoge' }], marsHelpers: [], jupiterHelpers: [], titanHelpers: [],
    placedHelpers: [{ id: 1, type: 'miningShibe', x: 0, y: 0 }], placedRick: { active: true, x: 0, y: 0 } };
DogeMinerGame.prototype.updateDPS.call(buffGame);
assert.equal(buffGame.dps, 209, 'One nearby upgraded 2-DPS helper adds 4 base DPS');
assert.equal(lookups, 3, 'One aura lookup plus one ordinary lookup per owned helper type');
assert.equal(additions, 1);
DogeMinerGame.prototype.updateDPS.call(buffGame);
assert.equal(additions, 1, 'Unchanged highlights must not be rewritten');
buffGame.placedRick.x = 500;
DogeMinerGame.prototype.updateDPS.call(buffGame);
assert.equal(buffGame.dps, 205);
assert.equal(removals, 1);
buffGame.placedHelpers = [];
DogeMinerGame.prototype.updateDPS.call(buffGame);
assert.equal(buffGame.dps, 205, 'An empty field receives no aura on any layout');
buffGame.placedRick = null;
DogeMinerGame.prototype.updateDPS.call(buffGame);
assert.equal(buffGame.dps, 205);

assert.equal(shop.formatUpgradeTier(2), 'II');
assert.equal(shop.formatUpgradeTier(11), 'XI');
assert.equal(shop.formatUpgradeTier(40), 'XL');
assert.ok(shop.getHelperUpgradeAtLevel('cloudBase', 1000).dps > 35138, 'Repeatable upgrades continue beyond sampled tiers');
console.log('PASS: 142 finite + 290 repeatable purchases match recorded prices/DPS/icons; currency isolation, stale/invalid/unowned rejection, all sprite/icon paths, save serialization, Altar gating, persistent slots, Rick range/aggregation, and continuing tiers.');
