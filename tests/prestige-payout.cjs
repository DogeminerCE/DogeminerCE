const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const fixtures = require('./fixtures/dm2-prestige-rewards.json');
const context = { window: {}, console, Math };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../play/js/time-travel.js'), 'utf8'), context);
const Travel = vm.runInContext('TimeTravelManager', context);
function fixture(overrides = {}) {
    const game = { dogecoins: 0, dogediamonds: 1234, timelineNumber: 1, pickaxeInventory: [], fortuneInventory: [],
        helpers: [], moonHelpers: [], marsHelpers: [], jupiterHelpers: [], titanHelpers: [], ...overrides };
    return { game, travel: new Travel(game) };
}
for (const { coins, diamonds } of fixtures.coins) {
    const { game, travel } = fixture({ dogecoins: coins });
    const saved = JSON.stringify(game);
    assert.equal(travel.computePayout().coinDiamonds, diamonds, `${coins} coins: shipped _Q(15)`);
    assert.equal(JSON.stringify(game), saved, 'Quoting future rewards never changes an earned balance or item');
}
assert.equal(fixture({ dogecoins: -20 }).travel.computePayout().coinDiamonds, 1);
assert.equal(fixture({ dogecoins: NaN }).travel.computePayout().coinDiamonds, 1);
console.log(`PASS: M08 source coin payout threshold, ceil/power order, minimum and cap (${fixtures.coins.length} source fixtures).`);

for (const { count, diamonds } of fixtures.pickaxes) {
    for (const rarity of ['common', 'improved', 'rare', 'epic', 'legendary']) {
        const inventory = Array.from({ length: count }, (_, index) => ({ instanceId: index ? 'copy-' + index : 'timeline_paw',
            name: index ? 'Duplicate pickaxe' : 'Paw', rarity: index ? rarity : 'common', baseDPC: index + 1 }));
        const { game, travel } = fixture({ pickaxeInventory: inventory });
        const saved = JSON.stringify(game);
        assert.equal(travel.computePayout().pickaxeDiamonds, diamonds, `${count} pickaxes / ${rarity}: shipped DQ()`);
        assert.equal(JSON.stringify(game), saved, 'Payout quotes never rewrite old pickaxes or rewards');
    }
}
assert.equal(fixture({ pickaxeInventory: Array(3001).fill({ rarity: 'legendary' }) }).travel.computePayout().pickaxeDiamonds,
    1501, 'Pickaxe diamonds have no cap');
console.log(`PASS: M09 rarity-independent copy count, starting Paw and no cap (${fixtures.pickaxes.length} source fixtures across five rarities).`);

const planetKeys = ['helpers', 'moonHelpers', 'marsHelpers', 'jupiterHelpers', 'titanHelpers'];
for (const { timeline, helpers, stat } of fixtures.badges) {
    const { game, travel } = fixture({ timelineNumber: timeline });
    for (const row of helpers) game[planetKeys[row.planet - 1]].push(...Array.from({ length: row.count }, () => ({ type: row.type })));
    const saved = JSON.stringify(game);
    assert.equal(travel.computePayout().badgeStat, stat, `Timeline ${timeline}, ${JSON.stringify(helpers)}: shipped IQ()`);
    assert.equal(JSON.stringify(game), saved, 'Badge previews cannot modify existing helpers, equipment or diamonds');
}
const distinctTypes = fixture({ helpers: Array.from({ length: 10 }, (_, index) => ({ type: 'type-' + index })) });
assert.equal(distinctTypes.travel.computeBadgeStat(), 10, 'Ceil happens for each helper type, not the whole planet');
distinctTypes.game.earthPlacedHelpers = [{ helperIds: Array.from({ length: 10 }, (_, index) => index), groupCount: 10 }];
assert.equal(distinctTypes.travel.computeBadgeStat(), 10, 'Visual grouping does not change owned-helper strength');
console.log(`PASS: M10 all planet weights, per-type rounding, strict cap, timeline growth/10–11 boundary and grouping (${fixtures.badges.length} source fixtures).`);

context.document = { body: { dataset: {}, classList: { remove() {} } }, getElementById: () => null };
const legacyBadge = { instanceId: 'earned-badge', name: 'D.I.A. Badge (Luck)', isDiaBadge: true, isProtected: true,
    stats: [{ name: 'luck', displayName: 'Luck', value: 2000, indicator: '+%' }] };
const patron = { instanceId: 'fixed-patron', templateId: 'badge_of_patronage', name: 'Patron', isProtected: true,
    stats: [{ name: 'luck', displayName: 'Luck', value: 200, indicator: '+%' }] };
const alphaSuper = { name: 'Super Fortune', isSuperFortune: true, isProtected: true,
    stats: [{ name: 'luck', displayName: 'Luck', value: 999, indicator: '+%' },
        { name: 'dps', displayName: 'DPS', value: 123456, indicator: '+' }] };
function resetFixture() {
    const result = fixture({ dogecoins: 1e12, dogediamonds: 500, dogediamondsEverObtained: 600,
        helpers: Array.from({ length: 10 }, () => ({ type: 'miningShibe' })),
        pickaxeInventory: Array.from({ length: 8 }, (_, index) => ({ instanceId: index ? 'copy-' + index : 'timeline_paw', rarity: 'legendary' })),
        fortuneInventory: JSON.parse(JSON.stringify([legacyBadge, patron, alphaSuper])),
        _currencyFlightEpoch: 7, pendingCoinDisplayAmount: 123, pendingDiamondDisplayAmount: 2,
        formatNumber: value => String(value), getPlanetRockBaseHP: () => 10, getRockHP: () => 10,
        recalculatePlayerStats() {}, updateDPS() {}, updateDiamondCounter() {}, updateUI() {}, clearAllHelperSprites() {} });
    result.travel.updateDogetalkieButton = () => {};
    result.travel._showYouKnowTheDrill = () => {};
    result.travel._chosenBadge = 'luck';
    result.travel.computePayout(); result.travel._buildRewards();
    return result;
}
const reset = resetFixture();
reset.game.bonusCoinMaxPlanetLevel = 5;
reset.game.bonusCoinBuffTier = 4;
reset.game.bonusCoinClaimCount = 17;
reset.game.bonusCoinEarlyOffered = true;
let saved;
context.window.saveManager = { saveGame() { saved = JSON.parse(JSON.stringify(reset.game)); return true; } };
const offered = { ...reset.travel._payout };
reset.travel._executeTimelineReset();
assert.equal(reset.game.dogediamonds, 500 + offered.total);
assert.equal(reset.game.timelineNumber, 2);
assert.equal(reset.game.bonusCoinMaxPlanetLevel, 1, 'Reached-planet bonus pool starts again at Earth');
assert.equal(reset.game.bonusCoinBuffTier, 0);
assert.equal(reset.game.bonusCoinClaimCount, 17, 'DM2 lifetime bonus claims survive prestige');
assert.equal(reset.game.bonusCoinEarlyOffered, true, 'The first-offer tutorial does not repeat on later timelines');
assert.equal(reset.game.fortuneInventory.find(f => f.isDiaBadge).stats[0].value, 2000 + offered.badgeStat);
assert.equal(JSON.stringify(reset.game.fortuneInventory.find(f => f.instanceId === patron.instanceId)), JSON.stringify(patron));
assert.equal(reset.game.fortuneInventory.find(f => f.isSuperFortune).stats.find(s => s.name === 'dps').value, 123456,
    'Earned Alpha merged bonuses survive future payouts');
assert.equal(saved.dogediamonds, 500 + offered.total);
const committed = JSON.stringify(reset.game);
reset.travel._executeTimelineReset();
assert.equal(JSON.stringify(reset.game), committed, 'Repeating the reward completion cannot award a second time');
assert.equal(reset.game.pendingCoinDisplayAmount, 0, 'Prior-timeline coin flights cannot withhold new income');
assert.equal(reset.game.pendingDiamondDisplayAmount, 0);
const replaced = resetFixture();
const staleQuote = replaced.travel._payoutContext;
replaced.game._currencyFlightEpoch++;
const replacement = JSON.stringify(replaced.game);
replaced.travel._executeTimelineReset();
assert.equal(JSON.stringify(replaced.game), replacement, 'A quote from before save replacement cannot reset the imported game');
replaced.travel.computePayout();
replaced.travel._executeTimelineReset(staleQuote);
assert.equal(JSON.stringify(replaced.game), replacement, 'Old reward buttons cannot commit a newly opened quote either');
console.log('PASS: future reward commit, earned diamond/badge/Patron/Alpha preservation, duplicate completion and save-replacement/flight guards.');
