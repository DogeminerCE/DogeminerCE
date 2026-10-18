// Claim/save the real balance immediately while withholding only the HUD flight.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sourceRoot = path.resolve(__dirname, '../play/js');

function createPage(storage = new Map()) {
    const animations = [];
    const timers = [];
    const flashes = [];
    const saveCalls = [];
    const rect = { left: 0, top: 0, width: 400, height: 400 };
    const amount = { textContent: '', getBoundingClientRect: () => rect };
    const counter = { style: {}, getBoundingClientRect: () => rect };
    const children = new Set();
    const container = {
        getBoundingClientRect: () => rect,
        appendChild(item) { children.add(item); item.parentNode = this; },
        removeChild(item) { children.delete(item); item.parentNode = null; }
    };
    const page = { showContainer: true, introCount: 0 };
    const context = {
        window: { innerWidth: 1200, innerHeight: 800 },
        console: { log() {}, warn() {}, error(error) { throw new Error(String(error)); } },
        Math, Map, Set,
        localStorage: {
            getItem: key => storage.get(key) ?? null,
            setItem: (key, value) => storage.set(key, value)
        },
        document: {
            body: { dataset: {}, classList: { toggle() {} } },
            getElementById(id) {
                if (id === 'diamond-counter') return counter;
                if (id === 'diamond-amount') return amount;
                if (id === 'floating-coins') return page.showContainer ? container : null;
                return null;
            },
            querySelector: () => null,
            createElement: () => ({
                style: {}, appendChild() {},
                animate() {
                    const animation = {
                        item: this,
                        cancel() { if (this.oncancel) this.oncancel(); }
                    };
                    animations.push(animation);
                    return animation;
                }
            })
        },
        setTimeout(callback, delay) { timers.push({ callback, delay }); }
    };
    vm.createContext(context);
    for (const name of ['game', 'save']) {
        vm.runInContext(fs.readFileSync(path.join(sourceRoot, `${name}.js`), 'utf8'), context);
    }
    const Game = vm.runInContext('DogeMinerGame', context);
    const SaveManager = vm.runInContext('SaveManager', context);
    // Keep constructor state and real currency/save code; skip DOM setup and loops.
    class HeadlessGame extends Game {
        initializeGameData() {}
        setupEventListeners() {}
        startGameLoop() {}
        startBackgroundRotation() {}
        startBlinking() {}
        startRickSpawn() {}
        startSearchdogAnimation() {}
        addGlobalMouseTracking() {}
        syncBackgroundImages() {}
        setupCutsceneSystem() {}
        initMarqueeSelection() {}
        playSound() {}
        updateUI() { this.updateDiamondCounter(); }
        showDiamondIntro() { page.introCount++; }
        flashDiamondAmount(type) { flashes.push(type); }
        recalculatePlayerStats() {}
        recreateHelperSprites() {}
        updateShopPrices() {}
        updateDPS() {}
        updateRockHealthDisplay() {}
        initMysteryBox() {}
    }
    const game = new HeadlessGame();
    const manager = Object.assign(Object.create(SaveManager.prototype), {
        game, saveKey: 'dogeminer_ce_save', backupKey: 'dogeminer_ce_backup',
        saveGame(showNotification = true) {
            saveCalls.push(showNotification);
            return SaveManager.prototype.saveGame.call(this, showNotification);
        }
    });
    context.window.saveManager = manager;
    const loot = () => {
        const el = { dataset: {}, style: {}, getBoundingClientRect: () => rect };
        container.appendChild(el);
        return el;
    };
    return { game, manager, animations, timers, flashes, saveCalls, amount, counter,
        container, children, storage, loot,
        get introCount() { return page.introCount; },
        hideContainer() { page.showContainer = false; } };
}

// First claim unlocks the HUD, but it shows zero until the diamond lands.
const first = createPage();
first.game.updateDiamondCounter();
assert.equal(first.counter.style.display, 'none');
const firstLoot = first.loot();
first.game.collectDiamond(firstLoot);
assert.equal(first.game.dogediamonds, 1, 'The diamond is spendable immediately');
assert.equal(first.game.dogediamondsEverObtained, 1);
assert.equal(first.counter.style.display, 'flex');
assert.equal(first.amount.textContent, '0', 'First-claim HUD unlock must not reveal the flight');
assert.equal(first.game.pendingDiamondDisplayAmount, 1);
assert.equal(first.game.activeEffectCount, 1);
assert.equal(first.introCount, 1, 'First-ever claim shows the diamond explainer once');
assert.deepEqual(first.saveCalls, [false], 'Claim must save immediately without a notification');
const claimSave = JSON.parse(first.storage.get(first.manager.saveKey));
assert.equal(claimSave.dogediamonds, 1);
assert.equal(claimSave.dogediamondsEverObtained, 1);
assert.equal(first.storage.get(first.manager.backupKey), first.storage.get(first.manager.saveKey));
assert.equal(Object.hasOwn(claimSave, 'pendingDiamondDisplayAmount'), false,
    'Animation state must never be serialized as gameplay state');
const inFlightSnapshot = first.manager.createSaveData();
assert.equal(inFlightSnapshot.dogediamonds, 1, 'Real createSaveData keeps credited diamonds during flight');
assert.equal(first.manager.saveGame(false), true);
assert.equal(JSON.parse(first.storage.get(first.manager.saveKey)).dogediamonds, 1);

// A second click on the still-attached loot cannot claim or save it again.
first.game.collectDiamond(firstLoot);
assert.equal(first.game.dogediamonds, 1);
assert.equal(first.game.dogediamondsEverObtained, 1);
assert.equal(first.animations.length, 1);
assert.equal(first.saveCalls.length, 2);
assert.equal(first.introCount, 1);
first.game.updateDiamondCounter();
assert.equal(first.amount.textContent, '0', 'Ordinary HUD updates keep the flight withheld');

// Refresh while in flight: real constructor + SaveManager.loadGame restore the claim.
const reloaded = createPage(first.storage);
assert.equal(reloaded.game.pendingDiamondDisplayAmount, 0, 'Fresh-page display bookkeeping starts at zero');
assert.equal(reloaded.manager.loadGame(), true);
assert.equal(reloaded.game.dogediamonds, 1);
assert.equal(reloaded.game.dogediamondsEverObtained, 1);
assert.equal(reloaded.game.pendingDiamondDisplayAmount, 0);
assert.equal(reloaded.amount.textContent, '1', 'Reload immediately shows the already-saved diamond');
assert.equal(reloaded.animations.length, 0);

first.animations[0].onfinish();
assert.equal(first.amount.textContent, '1');
assert.equal(first.game.pendingDiamondDisplayAmount, 0);
assert.equal(first.game.activeEffectCount, 0);
assert.deepEqual(first.flashes, ['green']);

// Independent overlapping claims settle in reverse order while purchases remain live.
const concurrent = createPage();
concurrent.game.dogediamonds = 100;
concurrent.game.dogediamondsEverObtained = 100;
concurrent.game.collectDiamond(concurrent.loot());
concurrent.game.collectDiamond(concurrent.loot());
assert.equal(concurrent.game.dogediamonds, 102);
assert.equal(concurrent.amount.textContent, '100');
assert.equal(concurrent.game.pendingDiamondDisplayAmount, 2);
assert.equal(concurrent.game.activeEffectCount, 2);
concurrent.game.updateDiamondCounter();
assert.equal(concurrent.amount.textContent, '100');
concurrent.animations[1].onfinish();
assert.equal(concurrent.amount.textContent, '101', 'Only the second flight has landed');
assert.equal(concurrent.game.pendingDiamondDisplayAmount, 1);
assert.equal(concurrent.game.activeEffectCount, 1);
assert.equal(concurrent.animations[0].item.parentNode, concurrent.container);
assert.equal(concurrent.animations[1].item.parentNode, null);
concurrent.game.dogediamonds -= 101;
concurrent.game.updateDiamondCounter();
assert.equal(concurrent.game.dogediamonds, 1);
assert.equal(concurrent.amount.textContent, '0', 'Spending updates without revealing the outstanding flight');
concurrent.timers.filter(timer => timer.delay === 900)[0].callback();
assert.equal(concurrent.amount.textContent, '1', 'Fallback reveals the remaining flight');
assert.equal(concurrent.game.pendingDiamondDisplayAmount, 0);
assert.equal(concurrent.game.activeEffectCount, 0);
concurrent.timers.filter(timer => timer.delay === 900)[1].callback();
concurrent.animations[0].onfinish();
assert.equal(concurrent.amount.textContent, '1', 'Fallback and late finish cannot settle twice');
assert.deepEqual(concurrent.flashes, ['green', 'green']);

// Spending the newly claimed diamond before arrival never makes the HUD negative.
const spent = createPage();
spent.game.collectDiamond(spent.loot());
spent.game.dogediamonds -= 1;
spent.game.updateDiamondCounter();
assert.equal(spent.amount.textContent, '0');
spent.animations[0].onfinish();
assert.equal(spent.amount.textContent, '0');
assert.equal(spent.game.pendingDiamondDisplayAmount, 0);

// Cancellation, its recursive cancel hook, fallback, and late finish are idempotent.
const canceled = createPage();
canceled.game.collectDiamond(canceled.loot());
canceled.animations[0].cancel();
assert.equal(canceled.amount.textContent, '1');
assert.equal(canceled.game.pendingDiamondDisplayAmount, 0);
assert.equal(canceled.game.activeEffectCount, 0);
assert.equal(canceled.animations[0].item.parentNode, null);
canceled.timers.find(timer => timer.delay === 900).callback();
canceled.animations[0].onfinish();
canceled.animations[0].cancel();
assert.equal(canceled.amount.textContent, '1');
assert.deepEqual(canceled.flashes, ['green']);

const missing = createPage();
missing.hideContainer();
missing.game.collectDiamond(missing.loot());
assert.equal(missing.game.dogediamonds, 1);
assert.equal(missing.amount.textContent, '1', 'No animation container means immediate display');
assert.equal(missing.game.pendingDiamondDisplayAmount, 0);
assert.equal(missing.game.activeEffectCount, 0);
assert.equal(missing.animations.length, 0);
assert.equal(JSON.parse(missing.storage.get(missing.manager.saveKey)).dogediamonds, 1);
console.log('PASS: diamond arrival display, immediate real save/backup, fresh-page reload, duplicate claim guard, overlapping flights, spending, cancellation, fallback, and absent-container recovery.');
