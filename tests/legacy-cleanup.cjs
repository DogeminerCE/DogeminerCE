const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const timers = new Map(), intervals = new Map(), nodes = new Map(), themes = new Set();
let nextTimer = 0;
const context = {window: {}, console, document: {
    body: {dataset: {}, classList: {toggle(name, on) { if (on) themes.add(name); else themes.delete(name); }}},
    getElementById: id => nodes.get(id) || null, querySelectorAll: () => []
}, setTimeout(fn) { const id = ++nextTimer; timers.set(id, fn); return id; },
clearTimeout: id => timers.delete(id),
setInterval(fn) { const id = ++nextTimer; intervals.set(id, fn); return id; }, clearInterval: id => intervals.delete(id)};
vm.createContext(context);
for (const name of ['game', 'shop', 'ui']) vm.runInContext(fs.readFileSync(`play/js/${name}.js`, 'utf8'), context);
const {Game, Shop, UI} = vm.runInContext('({Game: DogeMinerGame, Shop: ShopManager, UI: UIManager})', context);
const game = Object.assign(Object.create(Game.prototype), {currentLevel: 'earth', helpers: [], moonHelpers: [],
    marsHelpers: [], jupiterHelpers: [], titanHelpers: [], placedHelpers: [], dogecoins: 1e30,
    playerStats: {helperDpsMultiplier: 1}, getRickAuraBaseDPS: () => 0, getMysteryDPS: () => 0});
const shop = new Shop(game), ui = Object.assign(Object.create(UI.prototype), {game});
context.window.shopManager = shop;
function image(src) { return {src, getAttribute(name) { return this[name]; }, style: {}}; }
const character = image('assets/general/character/standard.webp');
nodes.set('main-character', character); nodes.set('platform', image(''));
nodes.set('main-rock', image('saved-damaged-rock.webp'));
game.updateRockSprite = () => {}; game.setPlanetBackgrounds = () => {};

// A scene change during a blink must own the final character, even if the old
// callback has already been queued. Repeated starts/blinks have one owner.
game.startBlinking(); game.startBlinking(); assert.equal(intervals.size, 1);
game.blinkDoge(); const stale = timers.values().next().value;
game.blinkDoge(); assert.equal(timers.size, 1);
game.currentLevel = 'moon'; ui.syncPlanetScene(); stale();
assert.equal(character.src, 'assets/general/character/spacehelmet.webp');
assert.equal(timers.size, 0);
game.blinkDoge(); const afterReplacement = timers.values().next().value;
character.src = 'custom-character.webp'; afterReplacement();
assert.equal(character.src, 'custom-character.webp', 'Blink cannot overwrite another presentation');
timers.clear();
const scenes = [
    ['earth', 'standard', 'dogeplatform', null], ['moon', 'spacehelmet', 'dogeplatformmoon', 'moon-theme'],
    ['mars', 'party', 'marsdogeplatform', 'planet-mars'], ['jupiter', 'spacehelmet', 'jupiterdogeplatform', 'planet-jupiter'],
    ['titan', 'spacehelmet', 'titandogeplatform', 'planet-titan']
];
for (const [planet, sprite, platform, theme] of scenes) {
    game.currentLevel = planet; ui.syncPlanetScene();
    assert.equal(character.src, `assets/general/character/${sprite}.webp`);
    assert.equal(nodes.get('platform').src, `../assets/quickUI/${platform}.webp`);
    assert.deepEqual([...themes], theme ? [theme] : []);
    assert.equal(context.document.body.dataset.planet, planet);
    assert.equal(game.getPlacedHelperKey(), `${planet}PlacedHelpers`);
    assert.equal(nodes.get('main-rock').src, 'saved-damaged-rock.webp', 'Scene restoration delegates to live rock state');
}
game.currentLevel = 'earth'; ui.syncPlanetScene(); game.blinkDoge(); game.stopGame();
assert.equal(timers.size, 0); assert.equal(intervals.size, 0);
assert.equal(character.src, 'assets/general/character/standard.webp');

// A rebuild goes through extension cleanup before any replacement is created.
const order = [];
game.clearAllHelperSprites = () => order.push('clear');
game.createHelperSprite = h => order.push(h.id);
game.startAllHelperAnimations = () => order.push('animate');
game.placedHelpers = [{id: 1}, {id: 2}]; game.recreateHelperSprites();
assert.deepEqual(order, ['clear', 1, 2, 'animate']);

// Historical values intentionally differ between income multiplication and
// per-instance mining addition. These exact doubles came from the prior build.
game.currentLevel = 'earth';
game.helpers = Array.from({length: 10000}, () => ({type: 'miningShibe', dps: 999}));
context.window.shopManager = {getCurrentHelperUpgradeInfo: () => ({dps: .1})};
assert.equal(game.calculateTotalDPS(), 1000);
assert.equal(game.getPlanetMiningDPS(), 1000.0000000001588);
game.helpers = [{type:'custom', dps: 0, baseDps: 7}, {type:'custom', dps: null, baseDps: 8},
    {type:'other', dps: 3}, {type:'custom', dps: .1}, {type:'custom', dps: .2}];
context.window.shopManager = {getCurrentHelperUpgradeInfo: () => null};
assert.equal(game.calculateTotalDPS(), 3.3);
assert.equal(game.getPlanetMiningDPS(), 11.299999999999999);
context.window.shopManager = shop;

// Legacy callers cannot use the old Earth-only mutation path to bypass world
// gates, a story, wallet checks, placement or save handling.
game.helpers = []; game.moonHelpers = []; game.currentLevel = 'moon';
assert.equal(shop.canAffordHelper('miningShibe'), false);
assert.equal(shop.canAffordHelper('unconfigured'), false);
assert.equal(shop.canAffordHelper('moonShibe'), true);
const coins = game.dogecoins;
assert.equal(shop.buyHelper('moonShibe'), false, 'Moon Base is still required');
assert.equal(game.dogecoins, coins); assert.equal(game.moonHelpers.length, 0);
game.isStoryOpen = true;
assert.equal(shop.buyHelper('moonBase'), false);
let calls = 0;
game.buyHelper = type => { calls++; assert.equal(type, 'moonBase'); return 'authoritative-result'; };
assert.equal(shop.buyHelper('moonBase'), 'authoritative-result'); assert.equal(calls, 1);
console.log('PASS: scene/blink ownership, interval idempotency, field rebuild cleanup, exact fractional DPS and authoritative legacy helper purchases.');
