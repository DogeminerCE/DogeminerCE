const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const badges = Array.from({ length: 2 }, () => ({ dataset: {}, hidden: true, textContent: '', animations: [],
    parentElement: { setAttribute(key, value) { this[key] = value; } },
    animate(frames, options) { const animation = { frames, options, canceled: false, cancel() { this.canceled = true; } };
        this.animations.push(animation); return animation; } }));
let reduced = false;
const context = { window: { matchMedia: () => ({ matches: reduced }), shopManager: {
    getNextHelperUpgrade(type) { return type === 'locked' ? null : { price: 1e99 }; } } },
    document: { querySelectorAll: () => badges }, console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../play/js/ui.js'), 'utf8'), context);
const UI = vm.runInContext('UIManager', context);
const game = { currentLevel: 'earth', searchdogeSlot3Unlocked: false,
    helperUpgradeOffers: { earth: [null, null, null], moon: ['moon', null, null] },
    getHelperArrayForLevel() { return this.currentLevel === 'earth'
        ? ['a', 'b', 'c', 'd', 'locked'].map(type => ({ type })) : [{ type: 'moon' }]; } };
const ui = Object.assign(Object.create(UI.prototype), { game });
assert.equal(ui.updateUpgradeTabCount(), 0, 'Four eligible helpers are zero found offers');
for (const badge of badges) assert.equal(badge.hidden, true);
game.helperUpgradeOffers.earth = ['a', null, null];
assert.equal(ui.updateUpgradeTabCount(), 1);
for (const badge of badges) {
    assert.equal(badge.hidden, false); assert.equal(badge.textContent, '1');
    assert.equal(badge.animations.length, 1); assert.equal(badge.animations[0].options.duration, 215);
    assert.equal(badge.parentElement['aria-label'], 'Upgrades, 1 found');
}
ui.updateUpgradeTabCount();
assert.equal(badges[0].animations.length, 1, 'Unchanged frame updates do not restart animation');
game.helperUpgradeOffers.earth = ['a', 'b', 'c'];
assert.equal(ui.updateUpgradeTabCount(), 2, 'The locked third slot does not count');
assert.equal(badges[0].animations.length, 2);
game.searchdogeSlot3Unlocked = true;
assert.equal(ui.updateUpgradeTabCount(), 3);
game.helperUpgradeOffers.earth = ['a', 'a', 'missing'];
assert.equal(ui.updateUpgradeTabCount(), 1, 'Duplicate or unowned stale offers cannot inflate the badge');
game.helperUpgradeOffers.earth = ['locked', null, null];
assert.equal(ui.updateUpgradeTabCount(), 0, 'Progression-locked offers do not count');
const hiding = badges[0]._countAnimation;
assert.equal(hiding.options.duration, 220);
assert.equal(badges[0].hidden, false, 'The badge completes its shrink before hiding');
game.helperUpgradeOffers.earth = ['b', null, null];
ui.updateUpgradeTabCount();
assert.equal(hiding.canceled, true);
hiding.onfinish();
assert.equal(badges[0].hidden, false, 'A stale hide callback cannot erase a newly found count');
game.helperUpgradeOffers.earth = [null, null, null];
ui.updateUpgradeTabCount();
for (const badge of badges) { badge._countAnimation.onfinish(); assert.equal(badge.hidden, true); }
game.currentLevel = 'moon';
assert.equal(ui.updateUpgradeTabCount(), 1, 'Count follows only the current planet');
reduced = true;
game.helperUpgradeOffers.moon = [null, null, null];
ui.updateUpgradeTabCount();
assert.equal(badges[0].hidden, true, 'Reduced motion changes the count without animation');
console.log('Upgrade count: found slots, affordability independence, mobile/desktop, show/pop/hide and stale-animation guards pass.');
