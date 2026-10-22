// Alpha migrations must be repeatable, preserve earned/fixed items, and commit
// the full report and rescued rocks before any ordinary autosave can run.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sourceRoot = path.resolve(__dirname, '../play/js');
const plain = value => JSON.parse(JSON.stringify(value));

function contextFor(storage = new Map(), fault = {}) {
    const classes = { add() {}, remove() {}, toggle() {} };
    const context = {
        window: {},
        console: { log() {}, warn() {}, error() {} },
        document: { body: { dataset: {}, classList: classes }, getElementById() { return null; } },
        setTimeout() {},
        localStorage: {
            getItem(key) { return storage.get(key) ?? null; },
            setItem(key, value) {
                if (fault.key === key) throw new Error('Storage commit rejected');
                storage.set(key, String(value));
            },
            removeItem(key) { storage.delete(key); }
        }
    };
    vm.createContext(context);
    for (const file of ['game', 'balance-data', 'balance', 'beta-migration', 'save']) {
        vm.runInContext(fs.readFileSync(path.join(sourceRoot, `${file}.js`), 'utf8'), context);
    }
    context.SaveManager = vm.runInContext('SaveManager', context);
    context.Game = vm.runInContext('DogeMinerGame', context);
    return { context, storage, fault, migration: context.window.BetaSaveMigration };
}

const stat = (name, value, indicator = '+%', isCore = true) => ({ name, displayName: name, value, indicator, isCore });
function alphaSave() {
    return {
        version: '1.0.0', timestamp: 1800000000000,
        dogecoins: 123456, totalMined: 7890123, totalClicks: 4567,
        dps: 12345, currentLevel: 'moon', timelineNumber: 3,
        lastPickaxeDropTime: 1700000000900, prizesSinceLastPickaxe: 5,
        mysteryBoxLastKind: 'fortune',
        maxPickaxeDPC: 9e18, equippedPickaxeId: 'staff_1700000000500_1',
        helpers: [], moonHelpers: [], marsHelpers: [], jupiterHelpers: [], titanHelpers: [],
        pickaxeInventory: [
            { instanceId: 'timeline_paw', templateId: 'timeline_start_paw', name: 'Paw', isPaw: true, baseDPC: 1, stats: [], idleSprite: 'paw.webp' },
            { instanceId: 'earth_stronger_pickaxe_1700000000100_1', templateId: 'earth_stronger_pickaxe',
                name: 'Stronger Pickaxe', planetOfOrigin: 'earth', rarity: 'common', baseDPC: 1e8,
                stats: [stat('lootfind', 8000), stat('discipline', 90, '+', false)], idleSprite: 'same-sprite.webp' },
            { instanceId: 'staff_1700000000500_1', templateId: 'jupiter_staff_of_the_sundoge',
                name: 'Staff of the SunDoge', isStaffOfSundoge: true, planetOfOrigin: 'jupiter', rarity: 'epic',
                baseDPC: 999999, stats: [stat('dps', 0.1)], idleSprite: 'staff.webp' },
            { instanceId: 'custom_1700000000550_1', templateId: 'my_custom_pickaxe', name: 'My Custom Pickaxe',
                baseDPC: 9e18, stats: [stat('wow', 999999)], idleSprite: 'custom.webp' }
        ],
        fortuneInventory: [
            { instanceId: 'super_fortune_1600000000000', templateId: 'super_fortune', name: 'Super Fortune',
                isSuperFortune: true, isProtected: true, stats: [stat('wow', 5000), stat('luck', 7000)] },
            { instanceId: 'fortune_balance_1700000000200_1', templateId: 'fortune_of_balance', name: 'Fortune of Balance',
                rarity: 'improved', stats: [stat('luck', 20000), stat('wow', 30000), stat('mysterybonus', 50000, '+')],
                sprite: 'balance.webp', description: 'keep this description' },
            { instanceId: 'patron_1700000000300_1', templateId: 'badge_of_patronage', name: 'Badge of Patronage', isSoulbound: true,
                stats: [stat('patronage', 100, '+', false), stat('lootfind', 15), stat('luck', 15), stat('wow', 15)] },
            { instanceId: 'flight_1700000000400_1', templateId: 'fortune_of_rocket_flight', name: 'Fortune of Rocket Flight',
                stats: [stat('spacerocketcosts', 5, '-%'), stat('lootfind', 16), stat('mysterybonus', 42, '+')] },
            { instanceId: 'dia_badge_wow_1600000000010', templateId: 'dia_badge_wow', name: 'D.I.A. Badge (Wow)',
                isDiaBadge: true, isProtected: true, stats: [stat('wow', 123)] },
            { instanceId: 'dia_badge_wow_1600000000020', templateId: 'dia_badge_wow', name: 'D.I.A. Badge (Wow)',
                isDiaBadge: true, isProtected: true, stats: [stat('wow', 234)] }
        ],
        planetRockData: {
            earth: { rocksBroken: 987654, maxHP: 1e90, currentHP: 5e89 },
            moon: { rocksBroken: 765432, maxHP: 1e100, currentHP: 2.5e99 }
        },
        statistics: {}, settings: { soundEnabled: false, musicEnabled: false }, unlockedLevels: ['earth', 'moon']
    };
}

function makeGame(environment) {
    const game = {
        defaultPickaxe: { instanceId: 'default_normal_pickaxe', name: 'Normal Pickaxe', templateId: 'earth_normal_pickaxe', baseDPC: 1, stats: [] },
        pickaxeFactory: { templates: {} }, fortuneFactory: { templates: {} },
        playerStats: {}, placedHelpers: [], helpersOnCursor: [], soundEnabled: false,
        getPlanetRockBaseHP() { return 10; },
        getRockHP(base, level) { return base * (level + 1); },
        getBalancedRockMigration(planet, old) {
            const oldRatio = old.maxHP > 0 ? old.currentHP / old.maxHP : 1;
            return { rocksBroken: old.rocksBroken || 0, rockLevel: 3, maxHP: 30,
                currentHP: Math.max(1, Math.ceil(30 * oldRatio)), reason: 'Challenge rescued; lifetime rock count retained.' };
        },
        getEquippedPickaxe() { return this.pickaxeInventory.find(item => item.instanceId === this.equippedPickaxeId) || this.defaultPickaxe; },
        getPickaxeDPC() { return this.getEquippedPickaxe().baseDPC; },
        recalculatePlayerStats() { this.playerStats = { luck: 1, wow: 2, lootFind: 3, critChance: 0 }; },
        getPlacedHelperKey: environment.context.Game.prototype.getPlacedHelperKey,
        applyPlanetTheme: environment.context.Game.prototype.applyPlanetTheme,
        recreateHelperSprites() {}, updateShopPrices() {}, updateDPS() { this.dps = 999; }, updateUI() {},
        updateRockHealthDisplay() {}, initMysteryBox() {}, showNotification() {},
        showPendingBetaMigrationReport() { this.reportCalls = (this.reportCalls || 0) + 1; },
        setLatestObtainedFortune(item) { this.latestObtainedFortune = { name: item.name, sprite: item.sprite }; }
    };
    const manager = Object.assign(Object.create(environment.context.SaveManager.prototype), {
        game, saveKey: 'dogeminer_ce_save', backupKey: 'dogeminer_ce_backup',
        alphaBackupKey: 'dogeminer_ce_alpha_backup_dm2-beta-1',
        migrationReceiptKey: 'dogeminer_ce_beta_migration_receipts',
        _loadInProgress: false, _saveBlocked: false, loadError: null
    });
    return { game, manager };
}

const env = contextFor();
const raw = alphaSave();
const original = plain(raw);
const first = env.migration.prepare(raw, { now: 1 });
const second = env.migration.prepare(raw, { now: 2 });
assert.deepEqual(raw, original, 'Pure migration must not mutate the supplied Alpha object');
assert.deepEqual(plain(first.saveData.pickaxeInventory), plain(second.saveData.pickaxeInventory));
assert.deepEqual(plain(first.saveData.fortuneInventory), plain(second.saveData.fortuneInventory));
assert.equal(first.saveData.equippedPickaxeId, raw.equippedPickaxeId, 'Equipped ID is stable even when Staff DPC becomes zero');
assert.equal(first.saveData.pickaxeInventory[1].baseDPC < 1000, true, 'Replay starts at the starter rather than the Alpha maximum');
assert.equal(first.saveData.maxPickaxeDPC < 1000, true, 'Unmatched custom DPC does not seed future verified rolls');
assert.equal(first.saveData.pickaxeInventory[2].baseDPC, 0);
assert.equal(first.saveData.pickaxeInventory[2].stats[0].value, 10, 'Staff percentage units are explicitly corrected');
assert.deepEqual(plain(first.saveData.pickaxeInventory[3]), raw.pickaxeInventory[3], 'Custom item is never deleted or guessed');
for (const index of [0, 2, 3, 4, 5]) {
    assert.deepEqual(plain(first.saveData.fortuneInventory[index]), raw.fortuneInventory[index], 'Fixed/protected earned stats preserved exactly');
}
const variableReport = first.report.itemChanges.find(item => item.name === 'Stronger Pickaxe');
assert.equal(variableReport.context.wow, 5372, 'Preserved carryover Wow is the single replay baseline');
assert.equal(variableReport.context.reconstructed, true);
assert.equal(variableReport.statChanges.some(change => change.status === 'removed'), true);
assert.equal(first.report.itemChanges.length, raw.pickaxeInventory.length + raw.fortuneInventory.length, 'Every item is represented');
assert.deepEqual(plain(env.migration.prepare(first.saveData).saveData), plain(first.saveData), 'Versioned load is idempotent');
assert.equal(env.migration.prepare(first.saveData).migrated, false);
const duplicateChanges = env.migration.statChanges([stat('karma', 420, '+'), stat('karma', 69, '+')],
    [stat('karma', 69, '+'), stat('karma', 1337, '+')]);
assert.equal(duplicateChanges[0].after, 1337, 'Changed duplicate must not steal a later unchanged value');
assert.equal(duplicateChanges[1].status, 'unchanged');
assert.equal(duplicateChanges[1].before, 69);
assert.equal(duplicateChanges[1].after, 69);

// Legacy factories gave both stones one template ID; the saved sprite must win.
const stones = alphaSave();
stones.fortuneInventory.push({ instanceId: 'stone_1700000000600_1', templateId: 'a_dogfinity_stone',
    name: 'A Dogfinity Stone', rarity: 'epic', sprite: 'old/folder/stone2.webp', stats: [stat('wow', 999)] });
const stoneGame = makeGame(env).game;
stoneGame.fortuneFactory.templates.a_dogfinity_stone = {
    id: 'a_dogfinity_stone', name: 'A Dogfinity Stone', sprite: 'new/folder/stone1.webp', statTemplates: []
};
const migratedStone = env.migration.prepare(stones, { game: stoneGame }).saveData.fortuneInventory.at(-1);
assert.equal(migratedStone.sprite, 'old/folder/stone2.webp');
assert.equal(migratedStone.balanceDefinitionId,
    env.context.window.DogeMinerBalance.getDefinition('fortune', { name: 'A Dogfinity Stone', sprite: 'stone2.webp' }).id);

// Exercise the real SaveManager load/apply path, including legacy helpers/settings.
const rawString = JSON.stringify(raw);
env.storage.set('dogeminer_ce_save', rawString);
const loaded = makeGame(env);
loaded.game.pendingCoinDisplayAmount = 100;
loaded.game.pendingDiamondDisplayAmount = 5;
loaded.game._currencyFlightEpoch = 1;
loaded.game._rockStateEpoch = 4;
loaded.game.activeEffectCount = 9;
loaded.game.isRockRegenerating = true;
assert.equal(loaded.manager.loadGame(), true);
const saved = JSON.parse(env.storage.get('dogeminer_ce_save'));
assert.equal(saved.balanceVersion, 'dm2-beta-1');
assert.equal(saved.betaMigrationReport.acknowledged, false);
assert.equal(saved.betaMigrationReport.rockChanges.length, 5);
assert.equal(saved.planetRockData.moon.rocksBroken, raw.planetRockData.moon.rocksBroken);
assert.equal(saved.planetRockData.moon.rockLevel, 3);
assert.equal(saved.planetRockData.moon.currentHP, 8, 'Partial damage is preserved after the rescue');
assert.equal(saved.rockLevel, 3);
assert.equal(saved.lastPickaxeDropTime, raw.lastPickaxeDropTime);
assert.equal(saved.prizesSinceLastPickaxe, 5);
assert.equal(saved.mysteryBoxLastKind, 'fortune');
assert.equal(loaded.game.pendingCoinDisplayAmount, 0);
assert.equal(loaded.game.pendingDiamondDisplayAmount, 0);
assert.equal(loaded.game._currencyFlightEpoch, 2, 'Load invalidates the previous state\'s flight callbacks');
assert.equal(loaded.game._rockStateEpoch, 5, 'Load invalidates stale rock regeneration callbacks');
assert.equal(loaded.game.activeEffectCount, 0);
assert.equal(loaded.game.isRockRegenerating, false);
assert.equal(saved.fortuneInventory.length, raw.fortuneInventory.length, 'Duplicate earned DIA IDs remain owned');
assert.equal(env.storage.get(loaded.manager.alphaBackupKey), rawString);
assert.equal(loaded.manager.saveGame(false), true);
assert.equal(env.storage.get(loaded.manager.alphaBackupKey), rawString, 'Ordinary autosave cannot overwrite the original Alpha backup');

const reload = makeGame(env);
assert.equal(reload.manager.loadGame(), true);
assert.equal(reload.game.betaMigrationReport.acknowledged, false, 'Refresh must retain the pending popup');
assert.equal(reload.game.planetRockData.moon.rockLevel, 3, 'Refresh cannot undo challenge compression');
assert.equal(reload.manager.acknowledgeBetaMigration(), true);
assert.equal(JSON.parse(env.storage.get('dogeminer_ce_save')).betaMigrationReport.acknowledged, true);
assert.equal(reload.game.betaMigrationReport.acknowledged, true);
reload.manager.applySaveData(raw);
assert.equal(reload.game.betaMigrationReport.acknowledged, true, 'Importing the same Alpha save keeps its prior acknowledgment');
assert.equal(env.storage.get(reload.manager.alphaBackupKey), rawString);
assert.deepEqual(plain(reload.game.pickaxeInventory), plain(loaded.game.pickaxeInventory), 'Repeated Alpha import cannot reroll the item values');

// Saving during the shatter animation must keep the already-created next rock.
const inRegeneration = makeGame(env);
inRegeneration.manager.loadGame();
inRegeneration.game.planetRockData.moon = { rocksBroken: 8, rockLevel: 9, maxHP: 1234, currentHP: 1234 };
inRegeneration.game.isRockRegenerating = true;
inRegeneration.game.rockCurrentHP = 0;
inRegeneration.game.rockMaxHP = 999;
const regenerationSave = inRegeneration.manager.createSaveData();
assert.equal(regenerationSave.planetRockData.moon.currentHP, 1234, 'Autosave cannot replace the next rock with the destroyed active rock');
assert.equal(regenerationSave.planetRockData.moon.rockLevel, 9);

// Interrupted/invalid Beta rocks load fresh health using fully restored progress.
for (const invalid of [{ maxHP: 100, currentHP: 0 }, { maxHP: null, currentHP: null },
    { maxHP: 0, currentHP: 1 }, { maxHP: NaN, currentHP: NaN }]) {
    const interruptedSave = plain(saved);
    Object.assign(interruptedSave.planetRockData.moon, invalid);
    const interrupted = makeGame(env);
    interrupted.manager.applySaveData(interruptedSave);
    assert.ok(Number.isFinite(interrupted.game.rockMaxHP) && interrupted.game.rockMaxHP > 0);
    assert.equal(interrupted.game.rockCurrentHP, interrupted.game.rockMaxHP);
    assert.equal(interrupted.game.isRockRegenerating, false);
    assert.equal(interrupted.game.planetRockData.moon.currentHP, interrupted.game.rockMaxHP);
}

// A failed acknowledgment leaves the visible pending report and saved marker intact.
const pending = makeGame(env);
pending.manager.loadGame();
pending.game.betaMigrationReport = { ...pending.game.betaMigrationReport, acknowledged: false };
env.fault.key = pending.manager.saveKey;
assert.equal(pending.manager.acknowledgeBetaMigration(), false);
assert.equal(pending.game.betaMigrationReport.acknowledged, false);
env.fault.key = null;

// Reject corrupt numeric inventories before backing up or touching the save.
const corrupt = alphaSave();
corrupt.pickaxeInventory[1].stats[0].value = NaN;
assert.throws(() => env.migration.prepare(corrupt), /Invalid item stat value/);
const rejectedEnv = contextFor();
const rejected = makeGame(rejectedEnv);
rejected.game.dogecoins = 42;
assert.throws(() => rejected.manager.applySaveData(corrupt), /Invalid item stat value/);
assert.ok(rejected.manager.loadError, 'Preparation failures are exposed to startup/import callers');
assert.equal(rejected.manager._saveBlocked, true);
assert.equal(rejected.manager._loadInProgress, false);
assert.equal(rejected.game.dogecoins, 42, 'Preparation failure leaves live balances untouched');
assert.equal(rejectedEnv.storage.size, 0, 'Preparation failure stamps no version and writes no backup/receipt');
const failureEnv = contextFor();
const beforeFailure = JSON.stringify(alphaSave());
failureEnv.storage.set('dogeminer_ce_save', beforeFailure);
failureEnv.fault.key = 'dogeminer_ce_save';
const failure = makeGame(failureEnv);
assert.equal(failure.manager.loadGame(), false);
assert.equal(failure.manager._saveBlocked, true);
assert.ok(failure.manager.loadError);
assert.equal(failure.manager.saveGame(false), false, 'A failed load cannot autosave constructor defaults over Alpha');
assert.equal(failureEnv.storage.get('dogeminer_ce_save'), beforeFailure, 'Failed commit leaves the original primary save untouched');
assert.equal(failureEnv.storage.get(failure.manager.alphaBackupKey), beforeFailure);
assert.equal(failureEnv.storage.has(failure.manager.backupKey), false, 'Companion backup write is rolled back on commit failure');
assert.equal(failure.game.balanceVersion, undefined, 'Failure cannot leave a live Beta version stamp');

const freshEnv = contextFor();
const fresh = makeGame(freshEnv);
assert.equal(fresh.manager.loadGame(), false);
assert.equal(fresh.manager.loadError, null, 'No saved game is distinct from a failed load');
assert.equal(fresh.manager._saveBlocked, false);
assert.equal(fresh.game.balanceVersion, 'dm2-beta-1');
assert.equal(fresh.game.betaMigrationReport, null, 'Fresh Beta players never receive an Alpha migration popup');
console.log('PASS: deterministic Alpha replay, fixed/Super/Patron/custom preservation, Staff units, equipped IDs, all-item reports, original backup, rock rescue persistence, duplicate imports, durable acknowledgment, and rejected/failed-save protection.');
