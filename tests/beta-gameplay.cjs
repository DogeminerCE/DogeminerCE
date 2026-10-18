// Integration fixtures pinned to docs/dm2-parity/mechanics.md and recovered DM2 2.15 functions.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
let now = 100000;
let randomValues = [];
const timers = [];
const math = Object.create(Math);
math.random = () => randomValues.length ? randomValues.shift() : 0.5;
const context = {
    window: {}, Math: math, Map, Set,
    Date: class extends Date { static now() { return now; } },
    console: { log() {}, warn() {}, error() {} },
    document: { querySelectorAll: () => [], querySelector: () => null, getElementById: () => null },
    setTimeout(callback, delay) { timers.push({ callback, delay }); }
};
vm.createContext(context);
for (const name of ['balance-data', 'balance', 'game', 'shop', 'save', 'time-travel', 'mystery-box-presentation']) {
    vm.runInContext(fs.readFileSync(path.join(root, `play/js/${name}.js`), 'utf8'), context);
}
const Game = vm.runInContext('DogeMinerGame', context);
const Shop = vm.runInContext('ShopManager', context);
const Save = vm.runInContext('SaveManager', context);
const Travel = vm.runInContext('TimeTravelManager', context);
const balance = context.window.DogeMinerBalance;
const planets = ['earth', 'moon', 'mars', 'jupiter', 'titan'];
const categories = ['helpers', 'moonHelpers', 'marsHelpers', 'jupiterHelpers', 'titanHelpers'];
const defaults = () => ({ luck: 0, lootFind: 0, wow: 0, critChance: 0,
    dpcMultiplier: 1, helperDpsMultiplier: 1, totalDpsMultiplier: 1,
    flatHelperDps: 0, pickaxeFlatDps: 0, fortuneFlatDps: 0, mysteryBonus: 0, rocketCostReduction: 0 });
function game(overrides = {}) {
    return Object.assign(Object.create(Game.prototype), {
        currentLevel: 'earth', timelineNumber: 1, isPlaying: true,
        helpers: [], moonHelpers: [], marsHelpers: [], jupiterHelpers: [], titanHelpers: [],
        placedHelpers: [], playerStats: defaults(), bonusCoinBuffMultiplier: 1,
        dps: 0, highestDps: 0, dogecoins: 0, totalMined: 0, totalClicks: 0,
        pickaxeInventory: [{instanceId: 'pick', name: 'Normal Pickaxe', baseDPC: 100, stats: []}],
        equippedPickaxeId: 'pick', fortuneInventory: [], unlockedLevels: new Set(['earth']),
        rocksBroken: 0, rockLevel: 1, rockMaxHP: 260, rockCurrentHP: 260,
        planetRockData: Object.fromEntries(planets.map(p => [p, {rocksBroken: 0, rockLevel: 1, maxHP: 260, currentHP: 260}])),
        lastDamageThresholdPercent: 100, activeEffectCount: 0, activeParticleCount: 0, maxEffects: 0, maxParticles: 0,
        dogediamondsEverObtained: 1, prizesSinceLastPickaxe: 0, lastPickaxeDropTime: 0,
        refreshBonusCoinLevel() {}, updateUI() {}, updateRockSprite() {}, updateRockHealthDisplay() {},
        playSound() {}, swingPickaxe() {}, bounceDoge() {}, showActivePickaxeSprite() {}
    }, overrides);
}
const close = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-9, `${message}: ${actual} != ${expected}`);

let pausedSwings = 0;
const paused = game({ isPlaying: false, clickTimes: [], lastClickTime: 0, maxCPS: 15, startSwing() { pausedSwings++; } });
paused.processClick();
assert.equal(pausedSwings, 0, 'Paused mining cannot animate a misleading no-damage swing');
assert.equal(paused.totalClicks, 0);
assert.equal(paused.rockCurrentHP, 260);
assert.equal(paused.clickTimes.length, 0, 'Paused inputs do not consume the resumed click budget');

const oldPatron = { instanceId: 'earned-patron', templateId: 'badge_of_patronage', sprite: 'assets/general/diabadge.webp',
    stats: [{ name: 'luck', value: 200 }] };
const oldPatronStats = JSON.stringify(oldPatron.stats);
Object.create(Save.prototype)._migrateSpritePaths([oldPatron]);
assert.match(oldPatron.sprite, /Badge of Patronage\/patreonbadge\.webp$/);
assert.equal(JSON.stringify(oldPatron.stats), oldPatronStats, 'Correcting old Patron artwork never recalculates earned stats');

// Exact audited Mystery Bonus thresholds, replacement tier, and Earth exclusion.
const mystery = game({timelineNumber: 3, helpers: [{type: 'shibe', dps: 100}]});
for (const [amount, earth, moon] of [[121110, 100, 100], [121111, 100, 1360],
    [420133768, 100, 1360], [420133769, 100, 21007]]) {
    mystery.playerStats.mysteryBonus = amount;
    mystery.currentLevel = 'earth'; mystery.updateDPS(); assert.equal(mystery.dps, earth);
    mystery.currentLevel = 'moon'; mystery.updateDPS(); assert.equal(mystery.dps, moon);
}
for (const p of planets.slice(1)) { mystery.currentLevel = p; assert.equal(mystery.getMysteryDPS(), 20907); }

// Source-specific flat, helper-percent, total-percent and buff terms cannot leak into each other.
const stats = game({currentLevel: 'moon', timelineNumber: 3,
    helpers: [{type: 'earth', dps: 100}], moonHelpers: [{type: 'moon', dps: 100}],
    fortuneInventory: [{stats: [
        {name: 'helperdps', balanceKey: 'income', value: 20, indicator: '+%'},
        {name: 'dps', balanceKey: 'persec', value: 50, indicator: '+'},
        {name: 'mysterybonus', value: 121111, indicator: '+'},
        {name: 'spacerocketcosts', value: 200, indicator: '-%'},
        {name: 'luck', value: 30, indicator: '+%'},
        {name: 'wow', value: 100, indicator: '+%'},
        {name: 'lootfind', value: 200, indicator: '+%'},
        {name: 'higherground', value: 9000, indicator: '+%'}
    ]}]
});
stats.pickaxeInventory[0].stats = [
    {name: 'dps', balanceKey: 'dpsp', value: 10, indicator: '+%'},
    {name: 'dps', balanceKey: 'dps', value: 5, indicator: '+'},
    {name: 'criticalchance', value: 250, indicator: '+%'},
    {name: 'dpcmultiplier', value: 25, indicator: '+%'}
];
stats.recalculatePlayerStats();
close(stats.dps, 1710.5, 'Separate global income sources');
assert.equal(stats.playerStats.luck, 30, 'Higher Ground remains a flavor stat');
assert.equal(stats.playerStats.critChance, 2.5);
assert.equal(stats.playerStats.rocketCostReduction, 0.6);
assert.equal(stats.getPlanetMiningDPS('moon'), 125, 'Local mining excludes Mystery, fortune flat DPS, and total-DPS bonuses');
stats.bonusCoinBuffMultiplier = 2; stats.updateDPS();
close(stats.dps, 1974.5, 'Bonus Coin affects the helper income term');
assert.equal(stats.getPlanetMiningDPS('moon'), 245);
stats.currentLevel = 'earth'; stats.updateDPS(); close(stats.dps, 588.5, 'Earth excludes Mystery');
stats.isSupporter = true; stats.recalculatePlayerStats(); close(stats.dps, 617.925, 'Supporter applies once to total DPS');

// DM2's higher crit tiers fall back to 2.5x rather than inheriting prior tiers.
const critical = game();
for (const [chance, rolls, expected, isCrit] of [
    [0, [0], 100, false], [0.5, [0.75], 100, false], [0.5, [0.25], 250, true],
    [1, [0.5, 0.5], 250, true], [1.5, [0.5, 0.25], 300, true], [1.5, [0.5, 0.75], 250, true],
    [2, [0.5, 0.5], 250, true], [2.5, [0.5, 0.25], 350, true], [2.5, [0.5, 0.75], 250, true],
    [3, [0.5, 0.5], 250, true], [3.5, [0.5, 0.25], 400, true], [3.5, [0.5, 0.75], 250, true],
    [4, [0.99, 0.99], 400, true]
]) {
    randomValues = [...rolls]; critical.playerStats.critChance = chance;
    const hit = critical.calculateClickDamage(); assert.equal(hit.damage, expected); assert.equal(hit.isCrit, isCrit);
}
critical.pickaxeInventory[0].baseDPC = 3;
critical.playerStats.critChance = 0.5; randomValues = [0];
assert.equal(critical.calculateClickDamage().damage, 8, 'Critical damage rounds upward');
critical.pickaxeInventory[0].isPaw = true; critical.bonusCoinBuffMultiplier = 100;
assert.equal(critical.calculateClickDamage().damage, 1);

// Rock formula fixtures are independent outputs from recovered fs/Cm, not CE calculations.
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'tests/reference/mechanics-comparison.json'), 'utf8'));
const rocks = game({getPlanetMiningDPS: () => 1000});
for (const row of fixture.rockHP) {
    assert.equal(rocks.getRockHP(rocks.getPlanetRockBaseHP(row.planet), row.rockLevel - 1, row.planet), row.DM2,
        `${row.planet} level ${row.rockLevel} matches recovered DM2 durability`);
}
assert.equal(rocks.getRockHP(60, 8, 'earth'), 6762, 'Type 9 gets the 1/7 shine durability bonus');
assert.equal(rocks.getRockType(369), 9);
assert.equal(rocks.getRockType(379), 19, 'Beyond 360 levels, types no longer repeat modulo ten');
const plain369 = Math.ceil(2760 * 1.1 ** 368);
assert.equal(rocks.getRockHP(60, 368, 'earth'), Math.round(plain369 + plain369 / 7), 'Level 369 is the final type-nine shine');
assert.equal(rocks.getRockHP(60, 378, 'earth'), Math.ceil(2760 * 1.1 ** 378), 'Level 379 does not repeat the shine bonus');
const extremeHP = rocks.getRockHP(60, 100000, 'earth');
assert.ok(Number.isFinite(extremeHP) && extremeHP > 0, 'Extreme difficulty remains finite');

// Every planet gets a one-time affordable rescue without deleting lifetime breaks.
for (const planet of planets) {
    const rescue = rocks.getBalancedRockMigration(planet, {rocksBroken: 1000, rockLevel: 1001, maxHP: 1e100, currentHP: 1.25e99});
    assert.equal(rescue.rocksBroken, 1000); assert.ok(rescue.rockLevel < 1001);
    assert.ok(rescue.maxHP <= Math.max(rocks.getRockHP(rocks.getPlanetRockBaseHP(planet), 0, planet), 180000));
    assert.equal(rescue.currentHP, Math.max(1, Math.ceil(rescue.maxHP * 0.125)));
}

// Local helpers tick at 200ms and can break rocks without clicking or earning click coins.
const passive = game({currentLevel: 'moon', helpers: [{type: 'earth', dps: 10000}], moonHelpers: [{type: 'moon', dps: 20}],
    rockMaxHP: 25, rockCurrentHP: 25, rollRockThresholdLoot() { this.lootRolls = (this.lootRolls || 0) + 1; }});
passive.advanceHelperRockMining(199); assert.equal(passive.rockCurrentHP, 25);
passive.advanceHelperRockMining(1); assert.equal(passive.rockCurrentHP, 15);
passive.advanceHelperRockMining(200); assert.equal(passive.rockCurrentHP, 5);
passive.advanceHelperRockMining(200); assert.equal(passive.rockCurrentHP, 0);
assert.equal(passive.rocksBroken, 1); assert.equal(passive.rockLevel, 2);
assert.equal(passive.dogecoins, 0, 'Helper rock damage does not duplicate global passive income');
const regeneration = timers.at(-1); regeneration.callback();
assert.equal(passive.isRockRegenerating, false); assert.equal(passive.rockCurrentHP, passive.rockMaxHP);
assert.ok(passive.rockCurrentHP > 0, 'Broken rocks renew with positive durability');
passive.timelineNumber = 2; passive.rockCurrentHP = 100; passive.rockMaxHP = 100;
passive.advanceHelperRockMining(200); close(passive.rockCurrentHP, 100 - 20 / 3, 'Later timelines use /3');
passive.advanceHelperRockMining(60000); close(passive.rockCurrentHP, 100 - 6 * 20 / 3, 'Long frames have at most five helper ticks');
passive.isBetaReportOpen = true; passive.advanceHelperRockMining(1000);
close(passive.rockCurrentHP, 60, 'Report pauses helper rock progression');
passive.isBetaReportOpen = false; passive.advanceHelperRockMining(199); close(passive.rockCurrentHP, 60, 'Paused time is discarded');

// Click rewards cannot exceed the remaining rock HP, and the next rock survives an autosave mid-regeneration.
const clicked = game({rockMaxHP: 100, rockCurrentHP: 7, rollRockThresholdLoot() {}});
clicked.handleRockClick(); assert.equal(clicked.dogecoins, 7); assert.equal(clicked.totalMined, 7);
assert.equal(clicked.rockCurrentHP, 0); assert.equal(clicked.isRockRegenerating, true);
const clickRegeneration = timers.at(-1);
const savedDuringBreak = Save.prototype.createSaveData.call({game: clicked});
assert.ok(savedDuringBreak.planetRockData.earth.currentHP > 0, 'Autosave must store the already-created next rock');
clickRegeneration.callback();
assert.equal(clicked.isRockRegenerating, false, 'Autosave must not invalidate the pending regeneration callback');
assert.ok(clicked.rockCurrentHP > 0);
const switched = game({rockCurrentHP: 0, rollRockThresholdLoot() {}});
switched.regenerateRock(); const switchedCallback = timers.at(-1).callback;
switched.currentLevel = 'moon'; switched.rockMaxHP = switched.rockCurrentHP = 777; switched.isRockRegenerating = false;
switchedCallback(); assert.equal(switched.rockCurrentHP, 777, 'Earth callback cannot overwrite the Moon rock');
const reset = game({rockCurrentHP: 0, rollRockThresholdLoot() {}});
reset.regenerateRock(); const resetCallback = timers.at(-1).callback;
reset.planetRockData.earth = {rocksBroken: 0, rockLevel: 1, maxHP: 260, currentHP: 260};
reset._rockStateEpoch = (reset._rockStateEpoch || 0) + 1;
reset.rockCurrentHP = 260; reset.isRockRegenerating = false;
resetCallback(); assert.equal(reset.rockCurrentHP, 260, 'An old callback cannot overwrite a new timeline');

// Break loot observes the newly advanced level: breaking 9 produces the type-10 bag guarantee.
const breaking = game({timelineNumber: 2, rocksBroken: 8, rockLevel: 9, rockCurrentHP: 0,
    createDogebag() { this.guaranteedBags = (this.guaranteedBags || 0) + 1; },
    expelBalancedCoinPile() { this.piles = (this.piles || 0) + 1; }, createDiamondLoot() {}});
randomValues = [0.5]; breaking.regenerateRock();
assert.equal(breaking.rockLevel, 10); assert.equal(breaking.guaranteedBags, 1); assert.equal(breaking.piles, 1);

// Spawned bags defer exactly one roll until opening; current ownership/stats drive that roll.
const originalDocument = context.document;
const originalBalance = context.window.DogeMinerBalance;
const spawned = [];
const rockContainer = {
    appendChild(item) { spawned.push(item); item.parentNode = this; },
    removeChild(item) { item.parentNode = null; }
};
context.document = {
    ...originalDocument,
    getElementById(id) {
        if (id === 'rock-container') return rockContainer;
        if (['dogebag-state-prompt', 'dogebag-state-reveal'].includes(id)) return {style: {}};
        return null;
    },
    createElement() { return {style: {setProperty() {}}, appendChild() {}, addEventListener() {}}; }
};
let currentBagQuality = 1;
let generated = 0;
const deferredOptions = [];
context.window.DogeMinerBalance = {...balance, getNaturalLootPool(g, options) {
    deferredOptions.push({...options});
    const owned = new Set(g.fortuneInventory.map(item => item.id));
    return {planet: options.planet, dropType: options.dropType ?? currentBagQuality,
        weights: {coins: -1, diamonds: -1}, candidates: ['first', 'second'].filter(id => !owned.has(id))
            .map(templateId => ({kind: 'fortune', templateId, quality: 0, weight: 1}))};
}};
const deferred = game({_showHappyDoge() {}, fortuneFactory: {
    templates: {}, generateFromTemplate(id, rollContext) { generated++; return {id, name: id, rollContext}; }
}, _renderDogebagFortune(item) { this._dogebagPendingItem = {type: 'fortune', item}; },
    addFortune(item) { this.fortuneInventory.push(item); }, showNotification() {},
    closeDogebagModal() { this._currentDogebag = null; this._dogebagPendingItem = null; }});
deferred.createDogebag(); deferred.createDogebag();
assert.equal(spawned.length, 2); assert.equal(generated, 0, 'Spawning does not reserve a prize');
assert.equal(deferred.lastPickaxeDropTime, 0); assert.equal(deferred.prizesSinceLastPickaxe, 0);
deferred._currentDogebag = spawned[0]; randomValues = [0]; deferred.openDogebagContents();
assert.equal(generated, 1); assert.equal(deferred._dogebagPendingItem.item.id, 'first');
deferred.openDogebagContents(); assert.equal(generated, 1, 'Opening an already-rolled bag reuses its prize');
deferred.dogebagLoot(); assert.equal(deferred.fortuneInventory[0].id, 'first');
currentBagQuality = 3; deferred.currentLevel = 'mars'; deferred.playerStats.wow = 42;
deferred._currentDogebag = spawned[1]; randomValues = [0]; deferred.openDogebagContents();
assert.equal(generated, 2); assert.equal(deferred._dogebagPendingItem.item.id, 'second', 'Later bag excludes the item just claimed');
assert.equal(deferredOptions.at(-1).planet, 'earth', 'Bag pool location remains the spawn location');
assert.equal(deferredOptions.at(-1).dropType, 1, 'Bag quality remains the spawn quality');
assert.equal(deferred._dogebagPendingItem.item.rollContext.wow, 42, 'Opening reads current Wow');
assert.equal(deferred._dogebagPendingItem.item.rollContext.planet, 'mars', 'Opening uses current generation context');
context.document = originalDocument;
context.window.DogeMinerBalance = originalBalance;

// Exact natural pickaxe cooldowns and first-Moon Mystery Box acquisition use the shared roll context.
context.window.DogeMinerBalance = {...balance, getNaturalLootPool: () => ({dropType: 2, weights: {coins: -1, diamonds: -1},
    candidates: [{kind: 'pickaxe', templateId: 'p', quality: 0, weight: 1}, {kind: 'fortune', templateId: 'f', quality: 0, weight: 1}]})};
const loot = game({pickaxeFactory: {generatePickaxe(id, max, wow, rollContext) {return {id, rollContext};}},
    fortuneFactory: {templates: {}, generateFromTemplate(id, rollContext) {return {id, rollContext};}}});
for (const [timeline, duration] of [[1, 45000], [2, 25000], [3, 12000], [30, 12000]]) {
    loot.timelineNumber = timeline; loot.lastPickaxeDropTime = now; randomValues = [0];
    assert.equal(loot.generateDogebagContents().type, 'fortune');
    now += duration; randomValues = [0]; assert.equal(loot.generateDogebagContents().type, 'fortune', 'Cooldown boundary remains blocked');
    now++; randomValues = [0]; const reward = loot.generateDogebagContents();
    assert.equal(reward.type, 'pickaxe'); assert.equal(reward.item.rollContext.dropType, 2);
    assert.equal(loot.lastPickaxeDropTime, now); assert.equal(loot.prizesSinceLastPickaxe, 0);
}
loot.currentLevel = 'moon'; loot.fortuneFactory.templates.box = {id: 'box', name: 'Mystery Box'};
const box = loot.generateDogebagContents(); assert.equal(box.type, 'fortune'); assert.equal(box.item.id, 'box');
assert.equal(box.item.rollContext.dropType, 3);
context.window.DogeMinerBalance = balance;

// Uw selects the pool location separately but generates with the active location.
// qw only forces the second prize to fortune when the first prize was a pickaxe.
let mysteryKinds = [];
let mysteryOptions = [];
context.window.DogeMinerBalance = {...balance, rollMysteryPrize(g, options = {}) {
    mysteryOptions.push({...options});
    const preOverrideKind = mysteryKinds.shift();
    return {kind: options.forceFortune ? 'fortune' : preOverrideKind, nextPreviousKind: preOverrideKind,
        planet: 'titan', dropType: 3, candidate: {templateId: 'reward'}};
}};
const boxes = game({currentLevel: 'moon', unlockedLevels: new Set(['earth', 'moon', 'titan']),
    isSupporter: true, mysteryBoxOpenCount: 0, mysteryBoxTimerRemaining: 0,
    pickaxeFactory: {generatePickaxe(id, max, wow, rollContext) {return {id, rollContext};}},
    fortuneFactory: {generateFromTemplate(id, rollContext) {return {id, rollContext};}},
    startMysteryBoxTimer() {},presentDogebagRewards(){},grantDogebagReward(){},mysteryBoxObtained:true});
context.document.getElementById=()=>({hidden:false,dataset:{},textContent:''});
const newMysteryView=()=>({kind:'mystery',opened:false,rewards:[]});
boxes._dogebagReveal=newMysteryView();
mysteryKinds = ['pickaxe', 'pickaxe']; boxes.openMysteryBoxRewards();
assert.deepEqual(Array.from(boxes._dogebagReveal.rewards, r => r.type), ['pickaxe', 'fortune']);
assert.equal(mysteryOptions[1].forceFortune, true);
assert.equal(boxes.mysteryBoxLastKind, 'pickaxe', 'Store the pre-override kind, not the forced displayed fortune');
assert.equal(boxes._dogebagReveal.rewards[1].item.rollContext.planet, 'moon', 'Source active location controls generated stats');
assert.equal(boxes._dogebagReveal.rewards[1].item.rollContext.dropType, 3);
boxes.mysteryBoxTimerRemaining = 0; boxes._dogebagReveal=newMysteryView();
mysteryKinds = ['fortune', 'pickaxe']; mysteryOptions = []; boxes.openMysteryBoxRewards();
assert.deepEqual(Array.from(boxes._dogebagReveal.rewards, r => r.type), ['fortune', 'pickaxe']);
assert.equal(Boolean(mysteryOptions[1].forceFortune), false, 'A first fortune allows a second pickaxe');
assert.equal(Save.prototype.createSaveData.call({game: boxes}).mysteryBoxLastKind, 'pickaxe');
context.window.DogeMinerBalance = balance;
context.document.getElementById=()=>null;

// Rocket discounts reach every rocket and saturate at 60%, including the >16 owned exponent rule.
const costs = game(); costs.playerStats.rocketCostReduction = 0.95;
for (const type of ['spaceRocket', 'marsRocket', 'jupiterRocket', 'titanRocket']) {
    assert.equal(costs.getHelperCost(100, 0, type), 40);
    assert.equal(costs.getHelperCost(100, 30, type), Math.ceil(100 * 1.15 ** 16 * 0.4));
}
assert.equal(costs.getHelperCost(100, 0, 'miningShibe'), 100);
costs.playerStats.rocketCostReduction = 0.2;
assert.equal(costs.getHelperCost(100, 30, 'spaceRocket'), Math.ceil(100 * 1.15 ** 27 * 0.8));
const shop = new Shop(costs);
for (const type of ['spaceRocket', 'marsRocket', 'jupiterRocket']) {
    const helper = categories.map(category => shop.shopData[category]?.[type]).find(Boolean);
    assert.ok(helper, `${type} has a configured helper definition`);
    assert.equal(shop.getHelperCost(type, 30), costs.getHelperCost(helper.baseCost, 30, type));
}
assert.equal(shop.getHelperCost('unconfiguredHelper', 30), Infinity);

// Future Super Fortunes omit new reset-only income sources and preserve grandfathered Alpha merges.
const oldSuper = {name: 'Super Fortune', isSuperFortune: true, isProtected: true, stats: [
    {name: 'luck', value: 100, indicator: '+%'}, {name: 'dps', balanceKey: 'persec', value: 9999, indicator: '+'}]};
const fresh = {name: 'Normal Fortune', stats: [
    {name: 'luck', value: 10, indicator: '+%'}, {name: 'helperdps', balanceKey: 'income', value: 20, indicator: '+%'},
    {name: 'mysterybonus', value: 121111, indicator: '+'},
    {name: 'dps', balanceKey: 'persec', value: 5000, indicator: '+'},
    {name: 'dps', balanceKey: 'dpsp', value: 10, indicator: '+%'},
    {name: 'spacerocketcosts', balanceKey: 'rockets', value: 5, indicator: '-%'}]};
const kept = {name: 'D.I.A. Badge (Luck)', isDiaBadge: true, stats: [{name: 'luck', value: 999, indicator: '+%'}]};
const travel = Object.assign(Object.create(Travel.prototype), {game: game({fortuneInventory: [oldSuper, fresh, kept]})});
const merged = travel._makeSuperFortune();
assert.equal(merged.stats.find(s => s.balanceKey === 'luck').value, 110);
assert.equal(merged.stats.find(s => s.balanceKey === 'income').value, 20);
assert.equal(merged.stats.find(s => s.balanceKey === 'mystery').value, 121111);
assert.equal(merged.stats.find(s => s.balanceKey === 'persec').value, 9999,
    'Existing Alpha merged flat DPS survives future prestige, while new flat DPS does not enter the merge');
assert.equal(merged.stats.some(s => ['dpsp', 'rockets'].includes(s.balanceKey)), false);
assert.equal(oldSuper.stats[1].value, 9999, 'Preparing a future merge does not mutate existing earned equipment');
console.log('PASS: DM2 gameplay integration: Mystery/critical tiers, source-specific income, local helper cadence, exact rock durability/shine, all-planet rescue, renewable rocks/save races, natural cooldowns, rocket discounts, and future Super Fortune rules.');
