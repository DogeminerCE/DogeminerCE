const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const animations = [];
const timers = [];
const counter = { textContent: '', getBoundingClientRect: () => rect };
const rect = { left: 0, top: 0, width: 400, height: 400 };
const container = {
    getBoundingClientRect: () => rect,
    appendChild(item) { item.parentNode = this; },
    removeChild(item) { item.parentNode = null; }
};
let showContainer = true;
const context = {
    window: {}, console, Math, Map, Set,
    document: {
        getElementById: id => id === 'dogecoin-amount' ? counter : showContainer ? container : null,
        querySelector: () => null,
        createElement: () => ({
            style: {}, appendChild() {},
            animate() {
                const animation = { cancel() {} };
                animations.push(animation);
                return animation;
            }
        })
    },
    setTimeout(callback) { timers.push(callback); }
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname, '../play/js/game.js'), 'utf8'), context);
const Game = vm.runInContext('DogeMinerGame', context);
const game = Object.assign(Object.create(Game.prototype), {
    dogecoins: 100, activeEffectCount: 0, pendingCoinDisplayAmount: 0,
    flashDogecoinAmount() {}
});
const mine = amount => {
    game.dogecoins += amount;
    game.createFloatingCoin(amount, { clientX: 200, clientY: 200 });
    game.updateDogecoinCounter();
};
mine(7);
mine(11);
assert.equal(game.dogecoins, 118, 'Actual balance is credited immediately');
assert.equal(counter.textContent, '100', 'Concurrent flights remain withheld');
game.dogecoins += 3; // Passive income still appears during flight.
game.updateDogecoinCounter();
assert.equal(counter.textContent, '103');
animations[1].onfinish();
assert.equal(counter.textContent, '114', 'Each flight settles independently, even out of order');
timers[1]();
assert.equal(counter.textContent, '114', 'Fallback cannot settle a finished flight twice');
game.dogecoins -= 110; // Spending is allowed while mined coins are in flight.
game.updateDogecoinCounter();
assert.equal(counter.textContent, '4');
timers[0]();
assert.equal(counter.textContent, '11', 'Fallback settles an interrupted animation');
assert.equal(game.pendingCoinDisplayAmount, 0);
assert.equal(game.activeEffectCount, 0);
showContainer = false;
mine(5);
assert.equal(counter.textContent, '16', 'Without an animation container, income is shown immediately');
// Use the real Welcome Back handoff: durable credit stays hidden through the
// popup, then the ordinary flight reveals it without touching the wallet.
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname, '../play/js/welcome-back.js'), 'utf8'), context);
showContainer = true;
let receipt;
Object.assign(game, { _bootComplete: true, isPlaying: true, currentLevel: 'earth',
    dogecoins: 1000, pendingCoinDisplayAmount: 0,
    offlineEarningsReport: { id: 'offline', amount: 900, acknowledged: false } });
context.window.WelcomeBackReport = { show(_, options) { receipt = options; } };
context.window.saveManager = { acknowledgeOfflineEarnings(id) {
    assert.equal(id, 'offline');
    game.offlineEarningsReport = { ...game.offlineEarningsReport, acknowledged: true };
    return true;
} };
game.updateDogecoinCounter();
assert.equal(counter.textContent, '100', 'Already-saved offline credit waits for its claim animation');
assert.equal(game.showPendingOfflineEarningsReport(), true);
assert.equal(receipt.onAcknowledge(), true);
const before = animations.length;
receipt.onAcknowledged(game.offlineEarningsReport, { clientX: 200, clientY: 200 });
assert.equal(animations.length, before + 1);
assert.equal(counter.textContent, '100');
assert.equal(game.dogecoins, 1000, 'The animation never grants another offline credit');
animations.at(-1).onfinish();
assert.equal(counter.textContent, '1,000');
assert.equal(game.pendingCoinDisplayAmount, 0);

game.offlineEarningsReport = { id: 'replacement', amount: 100, acknowledged: true };
receipt.onAcknowledged({}, { clientX: 200, clientY: 200 });
assert.equal(animations.length, before + 1, 'A replaced report cannot start a stale flight');
console.log('PASS: coin arrival display, concurrent flights, offline claim handoff, passive income, spending, and cleanup fallback.');
