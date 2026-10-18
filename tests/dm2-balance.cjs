const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const sandbox = {
    console,
    game: {currentLevel: 'earth', timelineNumber: 1, unlockedLevels: new Set(['earth']), playerStats: {wow: 0}, helpers: [], pickaxeInventory: [], fortuneInventory: []},
    fetch: async url => {
        const filename = path.join(root, 'play', decodeURIComponent(url));
        return fs.existsSync(filename) ? {ok: true, text: async () => fs.readFileSync(filename, 'utf8')} : {ok: false, status: 404};
    }
};
sandbox.window = sandbox;
vm.createContext(sandbox);
for (const file of ['balance-data.js', 'balance.js', 'pickaxe-factory.js', 'fortune-factory.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, 'play/js', file), 'utf8'), sandbox, {filename: file});
}
const balance = sandbox.DogeMinerBalance;
const rng = () => 0.5;

// Golden results from the pinned public DM2 functions, including their unusual endpoint rounding.
assert.equal(balance.weakRandomInt(4, 9, 0, 1, () => 0.999), 10);
assert.equal(balance.weakRandomInt(4, 9, 100, 1, () => 0), 14);
assert.equal(balance.weakRandomInt(4, 9, 100, 5, () => 0), 32);
assert.equal(balance.rollDPC({maxDPC: 1, planet: 'earth', highestPlanet: 'earth', tier: 1, timeline: 1, rarity: 'legendary'}, rng), 3);
assert.equal(balance.rollDPC({maxDPC: 100, planet: 'earth', highestPlanet: 'earth', tier: 1, timeline: 1, rarity: 'common'}, rng), 122);
assert.equal(balance.rollDPC({maxDPC: 100, planet: 'earth', highestPlanet: 'earth', tier: 1, timeline: 1, rarity: 'epic'}, rng), 125);
assert.equal(balance.rollDPC({maxDPC: 100, planet: 'moon', highestPlanet: 'moon', tier: 2, timeline: 2, rarity: 'common'}, rng), 115);
assert.equal(balance.rollDPC({template: {name: 'Staff of the SunDoge'}, maxDPC: 100, planet: 'titan', tier: 7}, rng), 0);
assert.equal(balance.getTier({currentLevel: 'earth', unlockedLevels: new Set(['earth', 'titan']), titanHelpers: [{type: 'timeTravelDRex'}]}), 7);
assert.equal(balance.getTier({currentLevel: 'moon', unlockedLevels: new Set(['moon']), moonHelpers: [{type: 'landerShibe'}]}), 2.5);

// Fixed item values remain fixed under extreme Wow and later timelines.
const extreme = {wow: 1e12, timeline: 35, planet: 'titan'};
const patron = balance.rollStats('fortune', {name: 'Badge of Patronage'}, extreme, rng);
assert.deepEqual(Array.from(patron, s => s.value), [100, 15, 15, 15]);
assert.ok(patron.every(s => s.isFixed));
const flight = balance.rollStats('fortune', {name: 'Fortune of Rocket Flight'}, extreme, rng);
assert.equal(flight.find(s => s.balanceKey === 'rockets').value, 5);
assert.equal(balance.getFixedStatValue('pickaxe', {name: 'Staff of the SunDoge'}, {name: 'dps', indicator: '+%', value: 0.1}), 10);
assert.equal(balance.rollStats('pickaxe', {name: 'Staff of the SunDoge'}, extreme, rng)[0].value, 10);
const diamond = balance.rollStats('pickaxe', {name: 'The Diamond Avenger'}, {wow: 100, timeline: 1, planet: 'titan'}, rng);
assert.ok(diamond.filter(s => s.category === 'secondary').length <= 3);
assert.ok(diamond.filter(s => s.category === 'tertiary').length <= 1);
assert.equal(balance.getDefinition('fortune', {name: 'Filled Potion'}).id, 'fullbottle');
assert.equal(balance.getDefinition('fortune', {name: 'Bronze Moon Fortunes'}).sourceMatched, true);
assert.equal(balance.getDefinition('pickaxe', 2).name, 'Stronger Pickaxe');
for(let cycle=0;cycle<=10;cycle++) {
    const opening=balance.getMysteryBoxOpening({mysteryBoxCycle:cycle});
    assert.equal(opening.rewards,cycle===10?2:1);
    assert.equal(opening.nextCycle,cycle===10?0:cycle+1);
    assert.equal(opening.cooldown,cycle===10?1200000:1200000+30000*(cycle+1));
}
assert.equal(balance.getMysteryBoxOpening({mysteryBoxOpenCount:11}).cycle,0);
assert.equal(balance.getMysteryBoxOpening({mysteryBoxOpenCount:10}).rewards,2);

(async () => {
    sandbox.game.pickaxeFactory = vm.runInContext('new PickaxeFactory()', sandbox);
    sandbox.game.fortuneFactory = vm.runInContext('new FortuneFactory()', sandbox);
    await sandbox.game.pickaxeFactory.loadTemplates();
    await sandbox.game.fortuneFactory.loadTemplates();
    const templates = Object.values(sandbox.game.pickaxeFactory.templates);
    const missing = templates.filter(t => !balance.getDefinition('pickaxe', t).sourceMatched).map(t => t.name);
    assert.deepEqual(Array.from(missing), ['Baguette of Sporklin']);
    assert.equal(Object.values(sandbox.game.fortuneFactory.templates).filter(t => !balance.getDefinition('fortune', t).sourceMatched).length, 0);
    const staffTemplate = templates.find(t => t.name === 'Staff of the SunDoge');
    const staff = sandbox.game.pickaxeFactory.generatePickaxe(staffTemplate.id, 100, 1e12, extreme, rng);
    assert.equal(staff.baseDPC, 0);
    assert.equal(staff.stats[0].value, 10);
    assert.equal(staff.balanceVersion, balance.VERSION);
    const protectedPatron = sandbox.game.fortuneFactory.generateSpecialFortune('badge_of_patronage');
    assert.deepEqual(Array.from(protectedPatron.stats, s => s.value), [100, 15, 15, 15]);
    assert.match(protectedPatron.sprite, /Badge of Patronage\/patreonbadge\.webp$/);
    assert.ok(fs.existsSync(path.join(root, 'play', decodeURIComponent(protectedPatron.sprite))));
    assert.ok(Object.values(sandbox.game.fortuneFactory.templates).some(t => t.name === 'Filled Potion'));

    // Every item referenced by all twenty source bag pools must be obtainable.
    // Checking only loaded templates previously missed Golden Moon Fortune.
    for (const planet of balance.PLANETS) for (let dropType=0; dropType<4; dropType++) {
        const sourcePool=sandbox.DogeMinerBalanceData.loot['level'+(balance.planetIndex(planet)+1)]['bag'+dropType];
        const actual=balance.getNaturalLootPool(sandbox.game,{planet,dropType});
        for (const [kind,key] of [['pickaxe','pickaxes'],['fortune','fortunes']]) for (const id of sourcePool[key])
            assert.ok(actual.candidates.some(item=>item.kind===kind&&String(item.dm2Id)===String(id)),`${planet} bag ${dropType}: missing ${kind} ${id}`);
    }
    const goldenMoon=Object.values(sandbox.game.fortuneFactory.templates).find(t=>t.name==='Golden Moon Fortune');
    assert.ok(goldenMoon);assert.equal(goldenMoon.balanceDefinitionId,'10');assert.equal(goldenMoon.rarity,'epic');
    assert.equal(goldenMoon.planetRestriction,'moon');assert.ok(fs.existsSync(path.join(root,'play',decodeURIComponent(goldenMoon.sprite))));
    const moonGame={...sandbox.game,currentLevel:'moon',pickaxeInventory:[],fortuneInventory:[]};
    for (let dropType=0; dropType<2; dropType++) {
        for (const entry of balance.getNaturalLootPool(moonGame,{planet:'moon',dropType}).candidates) {
            if(entry.kind==='fortune'&&String(entry.dm2Id)==='10')continue;
            (entry.kind==='pickaxe'?moonGame.pickaxeInventory:moonGame.fortuneInventory).push(entry.template);
        }
    }
    const waitingMoon=balance.getNaturalLootPool(moonGame,{planet:'moon'});
    assert.equal(waitingMoon.dropType,1,'Moon stays at the blue tier until Golden Moon Fortune is owned');
    assert.deepEqual(Array.from(waitingMoon.candidates,item=>String(item.dm2Id)),['10']);
    const rolledMoon=sandbox.game.fortuneFactory.generateFromTemplate(goldenMoon.id,{planet:'moon',dropType:1,wow:100,timeline:1});
    assert.equal(rolledMoon.name,'Golden Moon Fortune');assert.equal(rolledMoon.rarity,'epic');
    assert.ok(rolledMoon.stats.length>0&&rolledMoon.stats.every(stat=>Number.isFinite(stat.value)));
    moonGame.fortuneInventory.push(rolledMoon);
    assert.equal(balance.getNaturalLootPool(moonGame,{planet:'moon'}).dropType,2,'Collecting the missing Moon fortune unlocks the next bag tier');

    // Public pools resolve only installed assets, omit owned items and advance on depletion.
    const firstBag = balance.getNaturalLootPool(sandbox.game, {planet: 'earth'});
    assert.equal(firstBag.dropType, 0);
    assert.ok(firstBag.candidates.length > 0);
    assert.ok(firstBag.candidates.every(c => (c.kind === 'pickaxe' ? sandbox.game.pickaxeFactory : sandbox.game.fortuneFactory).templates[c.templateId]));
    for (const candidate of firstBag.candidates) {
        (candidate.kind === 'pickaxe' ? sandbox.game.pickaxeInventory : sandbox.game.fortuneInventory).push(candidate.template);
    }
    const nextBag = balance.getNaturalLootPool(sandbox.game, {planet: 'earth'});
    assert.ok(nextBag.dropType > 0);
    assert.ok(nextBag.candidates.every(c => !firstBag.candidates.some(previous => previous.kind === c.kind && previous.dm2Id === c.dm2Id)));
    const mystery = balance.getMysteryLootPool(sandbox.game, {planet: 'earth', dropType: 0, previousKind: 'pickaxe'}, rng);
    assert.equal(mystery.kind, 'fortune');
    assert.equal(mystery.allowRepeats, true);
    assert.ok(mystery.candidates.some(c => firstBag.candidates.some(previous => previous.kind === c.kind && previous.dm2Id === c.dm2Id)));
    assert.ok(mystery.candidates.every(c => c.dm2Id !== 'mysterybox' && c.weight === 1));
    assert.ok(mystery.candidates.some(c => c.dm2Id === 'reallyscales'));
    const mysteryFixture = require('./fixtures/dm2-inventory.json');
    for (const expected of mysteryFixture.fortunes) {
        const template = Object.values(sandbox.game.fortuneFactory.templates).find(t => t.balanceDefinitionId === expected.id);
        assert.ok(template, expected.id + ' loaded');
        assert.equal(template.name, expected.name); assert.equal(template.description, expected.desc);
        assert.equal(balance.getDefinition('fortune', template).quality, expected.quality);
        assert.ok(fs.existsSync(path.join(root, 'play', decodeURIComponent(template.sprite))));
        const rolled = sandbox.game.fortuneFactory.generateFromTemplate(template.id, {planet:'titan',wow:420,timeline:3}, rng);
        assert.ok(rolled.stats.length > 0 && rolled.stats.every(stat => Number.isFinite(stat.value)), expected.id + ' uses source default stat rolls');
    }
    for (const planet of balance.PLANETS) for (let dropType=0; dropType<4; dropType++) {
        const pool = balance.getMysteryLootPool(sandbox.game, {planet,dropType,forceFortune:true}, rng);
        const natural = balance.getNaturalLootPool({...sandbox.game,pickaxeInventory:[],fortuneInventory:[]}, {planet,dropType});
        for (const id of mysteryFixture.mysteryOnly) assert.ok(pool.candidates.some(c=>String(c.dm2Id)===id), planet + ':' + dropType + ':' + id);
        for (const item of mysteryFixture.fortunes) assert.ok(!natural.candidates.some(c=>c.kind==='fortune'&&String(c.dm2Id)===item.id), item.id + ' stays Mystery-only');
    }

    const pickMystery = balance.rollMysteryPrize(sandbox.game, {planet: 'earth', dropType: 3, previousKind: 'fortune'}, () => 0.8);
    assert.equal(pickMystery.kind, 'pickaxe');
    assert.equal(pickMystery.nextPreviousKind, 'pickaxe');
    assert.ok(pickMystery.candidate);
    const forced = balance.getMysteryLootPool(sandbox.game, {planet: 'earth', dropType: 3, previousKind: 'fortune', forceFortune: true}, () => 0.8);
    assert.equal(forced.kind, 'fortune');
    // DM2 remembers the pre-override kind, even when a two-prize box forces a fortune.
    assert.equal(forced.nextPreviousKind, 'pickaxe');
    console.log(`DM2 balance parity passed; ${templates.length} pickaxe and ${Object.keys(sandbox.game.fortuneFactory.templates).length} fortune templates loaded.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
