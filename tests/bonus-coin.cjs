// Exercise buff transitions without a running income loop refreshing the HUD.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

let now = 1000000;
let ticker;
const hud = new Map();
const context = {
    window: {}, console, Math, Map, Set,
    Date: class extends Date { static now() { return now; } },
    document: {
        querySelectorAll: () => [], querySelector: () => null,
        getElementById(id) {
            if (!hud.has(id)) hud.set(id, { textContent: '', setAttribute(name, value) { this[name] = value; } });
            return hud.get(id);
        }
    },
    setInterval(callback) { ticker = callback; return 1; },
    clearInterval() { ticker = null; }
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../play/js/game.js'), 'utf8'), context);
const Game = vm.runInContext('DogeMinerGame', context);
const game = Object.assign(Object.create(Game.prototype), {
    helpers: [{ type: 'spaceRocket', dps: 9 }], placedHelpers: [],
    helperUpgradeLevels: { altarOfTheSunDoge: 1 },
    playerStats: { helperDpsMultiplier: 1, dpcMultiplier: 1, critChance: 0 },
    bonusCoinLevel: 6, bonusCoinSeenLevel: 6,
    bonusCoinBuffMultiplier: 1, bonusCoinBuffEndTime: 0,
    dogecoins: 0, totalMined: 0, totalClicks: 0, totalPlayTime: 0,
    highestDps: 0, startTime: now, currentLevel: 'earth',
    getEquippedPickaxe: () => ({ baseDPC: 1 }),
    updateDiamondCounter() {}, isMobileDevice: () => false,
    playSound() {},
    updateShopPrices() { throw new Error('Buff updates should skip shop work'); },
    _renderBonusCoinBuffIndicator() {} // The real DOM pill is checked in-browser.
});

// Frozen from the pinned DM2 cb table, rather than inferred from CE's table.
const expectedTiers = [
    ['Golden Bonus', 1.5, 60, .5, 40], ['Moon Coin', 1.6, 60, .45, 25],
    ['Pristine Bonus', 1.7, 75, .4, 15], ['Ultra Pristine Bonus', 1.9, 90, .35, 10],
    ['Hyperultra Pristine Bonus', 2.1, 105, .3, 6], ['Super Ultra Omega Bonus', 2.5, 120, .25, 4]
];
for (const [index, [name, multiplier, duration, speed, weight]] of expectedTiers.entries()) {
    const tier = game.getBonusCoinTiers()[index + 1];
    assert.equal(tier.name, name);
    assert.equal(1 + tier.boost, multiplier);
    assert.equal(tier.duration, duration);
    assert.equal(tier.speed, speed);
    assert.equal(tier.weight, weight);
}

game.updateDPS();
game.updateUI(true);
assert.equal(game.formatCounterAmount(315369), '315,369');
assert.equal(game.formatCounterAmount(7.35, true), '7.35');
assert.equal(game.formatCounterAmount(0.2, true), '0.2');
assert.equal(game.formatCounterAmount(1.9), '1');
assert.equal(game.formatCounterAmount(1234567), '1.23M');
assert.equal(game.dps, 9);
assert.equal(hud.get('dps-amount').textContent, '9');
assert.equal(game.calculateClickDamage().damage, 1);

game.activateBonusCoin(game.getBonusCoinTiers()[6]);
assert.equal(game.bonusCoinBuffMultiplier, 2.5);
assert.equal(game.bonusCoinBuffEndTime, now + 120000);
assert.equal(game.dps, 22.5);
assert.equal(hud.get('dps-amount').textContent, '22.5', 'Claim must refresh DPS immediately');
assert.equal(game.calculateClickDamage().damage, 2.5);

now += 120000;
ticker();
assert.equal(game.dps, 9);
assert.equal(hud.get('dps-amount').textContent, '9', 'Expiry must refresh DPS immediately');
assert.equal(game.calculateClickDamage().damage, 1);
assert.equal(game.bonusCoinBuffEndTime, 0);
assert.equal(ticker, null);

// Saved active buffs resume for only their remaining time; expired ones clear.
game.bonusCoinBuffMultiplier = 2;
game.bonusCoinBuffEndTime = now + 30000;
game.resumeBonusCoinBuff();
assert.equal(game.dps, 18);
assert.equal(hud.get('dps-amount').textContent, '18');
assert.equal(game.bonusCoinBuffEndTime, now + 30000);
now += 30001;
game.resumeBonusCoinBuff();
assert.equal(game.dps, 9);
assert.equal(game.bonusCoinBuffMultiplier, 1);
assert.equal(hud.get('dps-amount').textContent, '9');
assert.equal(ticker, null);

// Keep the intentionally fixed one-damage Paw behavior.
game.getEquippedPickaxe = () => ({ baseDPC: 1, isPaw: true });
game.activateBonusCoin(game.getBonusCoinTiers()[6]);
assert.equal(game.calculateClickDamage().damage, 1);
console.log('Bonus coin: immediate DPS/DPC activation, expiry, saved-buff recovery, and Paw rule passed.');
