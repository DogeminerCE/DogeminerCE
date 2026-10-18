const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const context = { window: {}, console, Math, Map, Set };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../play/js/game.js'), 'utf8'), context);
const Game = vm.runInContext('DogeMinerGame', context);
const game = Object.create(Game.prototype);

// All late-game quantities share the formatter: HUD, prices, damage, and stats.
const cases = [
    [0, '0'], [1.9, '1'], [999.99, '999'],
    [1000, '1.00K'], [1234, '1.23K'], [1e6, '1.00M'],
    [1e9, '1.00B'], [1e12, '1.00T'],
    [4e16, '40.00Q'], [4e19, '40.00Qi'], [4e22, '40.00Sx'],
    [4e25, '40.00Sp'], [4e28, '40.00Oc'], [4e31, '40.00No'],
    [4e34, '40.00Dc'], [1e36, '1.00e+36'],
    [1.234e100, '1.23e+100'], [Number.MAX_VALUE, '1.80e+308'],
    [-4e16, '-40.00Q'], [-Number.MAX_VALUE, '-1.80e+308'],
    [Infinity, 'Infinity'], [-Infinity, '-Infinity'], [NaN, 'NaN']
];
for (const [amount, expected] of cases) {
    assert.equal(game.formatNumber(amount), expected, `formatNumber(${amount})`);
}

// Rounding should carry into the next suffix at each supported tier.
for (const [exponent, oldSuffix, nextSuffix] of [
    [3, 'K', 'M'], [6, 'M', 'B'], [9, 'B', 'T'], [12, 'T', 'Q'],
    [15, 'Q', 'Qi'], [18, 'Qi', 'Sx'], [21, 'Sx', 'Sp'],
    [24, 'Sp', 'Oc'], [27, 'Oc', 'No'], [30, 'No', 'Dc']
]) {
    assert.equal(game.formatNumber(999.994 * 10 ** exponent), `999.99${oldSuffix}`);
    assert.equal(game.formatNumber(999.996 * 10 ** exponent), `1.00${nextSuffix}`);
    assert.equal(game.formatNumber(-999.996 * 10 ** exponent), `-1.00${nextSuffix}`);
}
assert.equal(game.formatNumber(999.996e33), '1.00e+36', 'Last suffix carries into scientific notation');

// Preserve currency grouping/flooring and the DPS-only decimal convention.
assert.equal(game.formatCounterAmount(315369.9), '315,369');
assert.equal(game.formatCounterAmount(999999.9), '999,999');
assert.equal(game.formatCounterAmount(1.9), '1');
assert.equal(game.formatCounterAmount(1e6), '1.00M');
assert.equal(game.formatCounterAmount(1234567), '1.23M');
assert.equal(game.formatCounterAmount(7.35, true), '7.35');
assert.equal(game.formatCounterAmount(0.2, true), '0.2');
assert.equal(game.formatCounterAmount(999.99, true), '999.99');
assert.equal(game.formatCounterAmount(1000, true), '1.00K');
assert.equal(game.formatCounterAmount(4e16), '40.00Q');
assert.equal(game.formatCounterAmount(4e19, true), '40.00Qi');
assert.equal(game.formatCounterAmount(Number.MAX_VALUE), '1.80e+308');
console.log('PASS: quadrillion and later suffixes, unit-boundary rounding, finite extremes, signs, and existing small currency/DPS conventions.');
