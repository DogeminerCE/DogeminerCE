const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const fixtures = require('./fixtures/dm2-bonus-coins.json');
const timers = new Map();
const intervals = new Map();
let nextTimer = 0, saves = 0;
function element() {
    return { style: { setProperty() {} }, events: {}, isConnected: true,
        addEventListener(name, cb) { this.events[name] = cb; },
        remove() { this.isConnected = false; } };
}
const field = { offsetWidth: 700, offsetHeight: 700, getBoundingClientRect: () => ({ width: 700, height: 700 }), appendChild() {} };
const context = { window: { saveManager: { saveGame() { saves++; } } }, console, Math, Date, Set, Map,
    document: { hidden: false, getElementById: id => id === 'left-panel' ? field : null, createElement: element },
    setTimeout(cb, delay) { const id = ++nextTimer; timers.set(id, { cb, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    setInterval(cb, delay) { const id = ++nextTimer; intervals.set(id, { cb, delay }); return id; },
    clearInterval(id) { intervals.delete(id); } };
vm.createContext(context);
vm.runInContext(fs.readFileSync('play/js/game.js', 'utf8'), context);
const Game = vm.runInContext('DogeMinerGame', context);
function game(extra = {}) {
    return Object.assign(Object.create(Game.prototype), { currentLevel: 'earth', timelineNumber: 1,
        bonusCoinMaxPlanetLevel: 1, bonusCoinBuffMultiplier: 1, bonusCoinBuffEndTime: 0,
        bonusCoinSeenLevel: 0, isPlaying: true, _bootComplete: true, updateDPS() { this.refreshBonusCoinLevel(); }, updateUI() {},
        _renderBonusCoinBuffIndicator() {}, playSound() {}, stopSound() {}, showNotification() {}, ...extra });
}
for (const [index, expected] of fixtures.tiers.entries()) {
    const tier = game().getBonusCoinTiers()[index + 1];
    assert.equal(tier.name, expected.name);
    assert.equal(1 + tier.boost, expected.multiplier);
    assert.equal(tier.duration, expected.duration);
    assert.equal(tier.weight, expected.weight);
}
for (const expected of fixtures.cases) {
    const g = game({ bonusCoinMaxPlanetLevel: expected.maxlevel, timelineNumber: expected.timeline });
    assert.deepEqual(Array.from(g.getUnlockedBonusCoinTiers(), tier => tier.level), expected.eligible);
    assert.equal(g.selectBonusCoinTier({ random: () => expected.roll }).level, expected.selected,
        `DM2 weighted draw: ${JSON.stringify(expected)}`);
}
const g = game({ currentLevel: 'mars', helperUpgradeLevels: { altarOfTheSunDoge: 99 } });
g.refreshBonusCoinLevel();
assert.equal(g.bonusCoinMaxPlanetLevel, 3, 'Visiting Mars unlocks tiers 1–3 without buying a base');
assert.equal(g.bonusCoinLevel, 3, 'Altar ownership does not unlock tier 6');
g.currentLevel = 'earth'; g.refreshBonusCoinLevel();
assert.equal(g.bonusCoinMaxPlanetLevel, 3, 'Returning home keeps reached tiers for this timeline');
g.timelineNumber = 2; g.refreshBonusCoinLevel();
assert.deepEqual(Array.from(g.getUnlockedBonusCoinTiers(), tier => tier.level), [1, 2, 3, 6]);

g.selectBonusCoinTier = () => g.getBonusCoinTiers()[2];
g.spawnBonusCoin();
const coin = g._bonusCoinEl;
assert.equal(g._bonusCoinFieldTier.level, 2);
assert.equal(Object.isFrozen(g._bonusCoinFieldTier), true);
g.currentLevel = 'titan'; g.refreshBonusCoinLevel();
coin.events.click();
assert.equal(g.bonusCoinBuffTier, 2, 'Claim awards the displayed offer, even after higher tiers unlock');
assert.equal(g.bonusCoinBuffMultiplier, 1.6);
assert.ok(g.bonusCoinBuffEndTime > Date.now());
const deadline = g.bonusCoinBuffEndTime;
coin.events.touchstart();
assert.equal(g.bonusCoinBuffEndTime, deadline, 'Touch/click duplicates cannot extend a buff');
assert.equal(saves, 1, 'A claim immediately saves its remaining-time deadline');
const cleanup = [...timers.values()].find(timer => timer.delay === 600).cb;
g._removeBonusCoinEl(); g.spawnBonusCoin();
const replacement = g._bonusCoinEl;
cleanup();
assert.equal(g._bonusCoinEl, replacement, 'A stale spin callback cannot remove a newer coin');
coin.events.click();
assert.equal(saves, 1, 'An old detached offer cannot be claimed after a save/preset replacement');
g.activateBonusCoin(g.getBonusCoinTiers()[1]);
assert.equal(g.bonusCoinBuffTier, 1);
assert.equal(g.bonusCoinBuffMultiplier, 1.5, 'A weaker claim replaces a stronger buff, as DM2 does');
console.log(`PASS: Bonus Coin source table, ${fixtures.cases.length} weighted unlock/draw fixtures, frozen claims and stale/duplicate guards.`);

const rhythm = game();
for (const [index, expectedChance] of [.44, .66, .88, 1].entries()) {
    assert.equal(rhythm.rollForBonusCoin({ random: () => .999999 }), 'miss');
    assert.ok(Math.abs(rhythm._bonusCoinSpawnChance - expectedChance) < 1e-12, `Miss ${index + 1} raises chance by 22 points`);
}
assert.equal(rhythm.rollForBonusCoin({ random: () => .999999 }), 'spawned', 'The fifth eligible check is guaranteed');
assert.equal(rhythm._bonusCoinSpawnChance, .22);
assert.equal([...timers.values()].filter(timer => timer.delay === 8000).length, 2, 'Each field coin lasts eight seconds');
rhythm._bonusCoinSpawnChance = .66;
assert.equal(rhythm.rollForBonusCoin({ random: () => 0 }), 'occupied');
assert.equal(rhythm._bonusCoinSpawnChance, .66, 'A successful roll while occupied does not reset accumulated odds');
assert.equal(rhythm.rollForBonusCoin({ random: () => .9 }), 'miss');
assert.equal(rhythm._bonusCoinSpawnChance, .88);
rhythm._removeBonusCoinEl();
assert.equal(rhythm.rollForBonusCoin({ random: () => 0 }), 'spawned');
const expired = rhythm._bonusCoinEl;
timers.get(rhythm._bonusCoinDespawnTimeout).cb();
assert.equal(rhythm._bonusCoinEl, null);
assert.equal(expired.isConnected, false);

for (const flag of ['isTransitioning', 'isCutscenePlaying', 'isIntroPlaying', 'isBetaReportOpen', 'isOfflineReportOpen']) {
    rhythm[flag] = true;
    assert.equal(rhythm.rollForBonusCoin({ random() { throw new Error('Paused events cannot consume RNG'); } }), 'paused', flag);
    rhythm[flag] = false;
}
rhythm.isPlaying = false;
assert.equal(rhythm.rollForBonusCoin(), 'paused'); rhythm.isPlaying = true;
context.document.hidden = true;
assert.equal(rhythm.rollForBonusCoin(), 'paused'); context.document.hidden = false;

const early = game({ helpers: Array.from({ length: 8 }, () => ({ type: 'miningShibe' })), dogecoins: 11 });
assert.equal(early.tryOfferEarlyBonusCoin(), 'ineligible');
early.helpers.push({ type: 'miningShibe' }); early.dogecoins = 10;
assert.equal(early.tryOfferEarlyBonusCoin(), 'ineligible', 'The wallet threshold is strictly greater than ten');
early.dogecoins = 11;
early.advanceBonusCoinEvents(60000);
assert.ok(early._bonusCoinEl, 'The nine-Shibe offer uses the live game loop, not a debug-only trigger');
assert.equal(early.bonusCoinEarlyOffered, true);
early._removeBonusCoinEl();
assert.equal(early.tryOfferEarlyBonusCoin(), 'ineligible', 'A missed early offer cannot repeat');
early.bonusCoinEarlyOffered = false; early.bonusCoinClaimCount = 1;
assert.equal(early.tryOfferEarlyBonusCoin(), 'ineligible', 'Any earlier successful claim suppresses the first offer');
console.log('PASS: M22 escalating two-minute rolls, occupied/paused guards, eight-second lifetime and one-shot nine-Shibe offer.');

const cadence = game(); cadence.scheduleBonusCoinSpawn();
const cycle = cadence._bonusCoinSpawnInterval;
assert.equal(intervals.get(cycle).delay,120000,'Production timer checks exactly every two minutes');
cadence.spawnBonusCoin(); cadence._bonusCoinEl.events.click();
assert.equal(cadence._bonusCoinSpawnInterval,cycle,'A claim cannot restart the two-minute clock');
cadence._removeBonusCoinEl(); cadence.spawnBonusCoin(); timers.get(cadence._bonusCoinDespawnTimeout).cb();
assert.equal(cadence._bonusCoinSpawnInterval,cycle,'An unclaimed expiry cannot restart the clock');
cadence._bonusCoinSpawnChance=.88;cadence.resetBonusCoinSpawnCycle();
assert.equal(cadence._bonusCoinSpawnChance,.22);
assert.equal(intervals.has(cycle),false,'Loading another save cancels the previous periodic event');
assert.equal(intervals.get(cadence._bonusCoinSpawnInterval).delay,120000);
console.log('PASS: independent production 120s clock survives claims/expiry and resets safely on save replacement.');
