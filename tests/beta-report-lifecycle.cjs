// Exercise the production report/game/save handshake, including durable failure,
// imports, startup ordering and controller isolation. No game DOM or audio runs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sourceRoot = path.resolve(__dirname, '../play/js');
const pendingReport = fingerprint => ({ version: 'dm2-beta-1', fingerprint, createdAt: 1,
    acknowledged: false, itemChanges: [], rockChanges: [] });

function createPage({ boot = true, playing = true, report = pendingReport('lifecycle') } = {}) {
    const storage = new Map();
    const timers = [];
    const shown = [];
    const intro = [];
    const notices = [];
    const damage = [];
    const fault = { key: null };
    const ui = { open: false, closes: 0 };
    const context = {
        window: { innerWidth: 1280, innerHeight: 800, addEventListener() {} },
        navigator: {},
        document: { readyState: 'loading', body: { dataset: {}, classList: { add() {}, remove() {}, toggle() {} } },
            getElementById() { return null; }, addEventListener() {} },
        console: { log() {}, warn() {}, error() {} },
        setTimeout(callback, delay) { timers.push({ callback, delay }); },
        localStorage: {
            getItem(key) { return storage.get(key) ?? null; },
            setItem(key, value) {
                if (fault.key === key) { fault.key = null; throw new Error('Durable save rejected'); }
                storage.set(key, String(value));
            },
            removeItem(key) { storage.delete(key); }
        }
    };
    vm.createContext(context);
    for (const file of ['game', 'save']) vm.runInContext(fs.readFileSync(path.join(sourceRoot, `${file}.js`), 'utf8'), context);
    const Game = vm.runInContext('DogeMinerGame', context);
    const SaveManager = vm.runInContext('SaveManager', context);
    const game = Object.assign(Object.create(Game.prototype), {
        balanceVersion: 'dm2-beta-1', betaMigrationReport: report, _bootComplete: boot,
        isPlaying: playing, isBetaReportOpen: false, isIntroPlaying: false, isCutscenePlaying: false,
        isTransitioning: false, isRockRegenerating: false, _introAfterBetaReport: false,
        isMouseDown: true, isSpaceDown: true, _helperRockElapsed: 190,
        currentLevel: 'earth', timelineNumber: 1, totalClicks: 3, dogecoins: 99, totalMined: 100,
        clickTimes: [], lastClickTime: 0, maxCPS: 20, musicEnabled: false,
        getPlanetMiningDPS() { return 20; },
        applyRockDamage(value) { damage.push(value); },
        swingPickaxe() { throw new Error('Mining reached through the report'); },
        startSwing() { throw new Error('Swing reached through the report'); },
        showNotification(message) { notices.push(message); },
        playDogeIntro(space) { intro.push({ space, reportOpen: ui.open, playing: this.isPlaying }); },
        updateUI() {}, updateMobileHelperBar() {}, isMobileDevice() { return false; }, syncBackgroundImages() {}
    });
    const manager = Object.assign(Object.create(SaveManager.prototype), {
        game, saveKey: 'save', backupKey: 'backup', migrationReceiptKey: 'receipts', _saveBlocked: false,
        _loadInProgress: false, createSaveData() {
            return { balanceVersion: this.game.balanceVersion, currentLevel: this.game.currentLevel,
                betaMigrationReport: this.game.betaMigrationReport };
        }
    });
    context.window.game = game;
    context.window.saveManager = manager;
    context.window.BetaBalanceReport = {
        show(report, options) { shown.push({ report, options }); ui.open = true; return {}; },
        close() { ui.open = false; ui.closes++; }, isOpen() { return ui.open; }
    };
    const acknowledge = (index = shown.length - 1) => {
        const result = shown[index].options.onAcknowledge();
        if (result === true) ui.open = false;
        return result;
    };
    const flushTimers = delay => {
        const ready = timers.filter(timer => delay === undefined || timer.delay === delay);
        for (const timer of ready) { timers.splice(timers.indexOf(timer), 1); timer.callback(); }
    };
    return { context, game, manager, storage, timers, shown, intro, notices, damage, fault, ui, acknowledge, flushTimers };
}

for (const config of [{ boot: false }, { report: null }, { report: { ...pendingReport('acknowledged'), acknowledged: true } }]) {
    const page = createPage(config);
    assert.equal(page.game.showPendingBetaMigrationReport(), false);
    assert.equal(page.shown.length, 0, 'No report before boot, for fresh games, or after acknowledgment');
    assert.equal(page.game.isPlaying, true);
    assert.equal(page.game.isMouseDown, true, 'A skipped report does not change input state');
}

const pending = createPage();
pending.game._introAfterBetaReport = true;
pending.storage.set('save', 'old-main');
pending.storage.set('backup', 'old-backup');
pending.storage.set('receipts', '{}');
assert.equal(pending.game.showPendingBetaMigrationReport(), true);
assert.equal(pending.game.isPlaying, false);
assert.equal(pending.game.isBetaReportOpen, true);
assert.equal(pending.game.isMouseDown, false);
assert.equal(pending.game.isSpaceDown, false);
assert.equal(pending.game._helperRockElapsed, 0);
pending.game.processClick();
pending.game.handleRockClick();
pending.game.advanceHelperRockMining(1000);
assert.equal(pending.game.totalClicks, 3);
assert.equal(pending.game.dogecoins, 99);
assert.deepEqual(pending.damage, [], 'Neither direct input nor helper ticks mine behind the report');
pending.game.showPendingBetaMigrationReport();
assert.equal(pending.shown.length, 1, 'Repeated report checks reuse the existing view');

pending.fault.key = 'save';
assert.equal(pending.acknowledge(), false, 'Use the real SaveManager acknowledgment/transaction failure');
assert.equal(pending.game.betaMigrationReport.acknowledged, false);
assert.equal(pending.game.isPlaying, false);
assert.equal(pending.game.isBetaReportOpen, true);
assert.equal(pending.ui.open, true);
assert.equal(pending.storage.get('save'), 'old-main');
assert.equal(pending.storage.get('backup'), 'old-backup');
assert.equal(pending.storage.get('receipts'), '{}');
assert.equal(pending.timers.length, 0, 'Failed acknowledgment cannot start the intro');

assert.equal(pending.acknowledge(), true);
assert.equal(JSON.parse(pending.storage.get('save')).betaMigrationReport.acknowledged, true);
assert.equal(pending.game.betaMigrationReport.acknowledged, true);
assert.equal(pending.game.isPlaying, true);
assert.equal(pending.game.isBetaReportOpen, false);
assert.equal(pending.ui.open, false);
assert.equal(pending.intro.length, 0, 'The intro is queued until the report has closed');
pending.flushTimers(0);
assert.deepEqual(pending.intro, [{ space: false, reportOpen: false, playing: true }]);
pending.game.advanceHelperRockMining(199);
assert.deepEqual(pending.damage, []);
pending.game.advanceHelperRockMining(1);
assert.deepEqual(pending.damage, [10], 'Helper mining resumes without the pre-report elapsed debt');
pending.game.showPendingBetaMigrationReport();
assert.equal(pending.shown.length, 1, 'A saved acknowledgment never opens again');

const pausedImport = createPage({ playing: false });
pausedImport.game.currentLevel = 'titan';
assert.equal(pausedImport.game.showPendingBetaMigrationReport(), true);
assert.equal(pausedImport.acknowledge(), true);
assert.equal(pausedImport.game.isPlaying, false, 'An import into a paused game remains paused afterward');
assert.equal(pausedImport.timers.length, 0);
pausedImport.game.advanceHelperRockMining(1000);
assert.deepEqual(pausedImport.damage, []);

// A cloud/import replacement must show the currently loaded progress and cannot
// let an old dialog acknowledge the new report or lose the original play state.
const replaced = createPage();
replaced.game.showPendingBetaMigrationReport();
replaced.game.betaMigrationReport = pendingReport('replacement');
replaced.game.showPendingBetaMigrationReport();
assert.equal(replaced.shown.length, 2);
assert.equal(replaced.shown[1].report.fingerprint, 'replacement');
assert.equal(replaced.acknowledge(0), false);
assert.equal(replaced.game.betaMigrationReport.acknowledged, false);
assert.equal(replaced.game.isPlaying, false);
assert.equal(replaced.acknowledge(1), true);
assert.equal(replaced.game.isPlaying, true, 'Replacement retains the play state from before the first report');
const removed = createPage({ playing: false });
removed.game.showPendingBetaMigrationReport();
removed.game.betaMigrationReport = null;
assert.equal(removed.game.showPendingBetaMigrationReport(), false);
assert.equal(removed.ui.closes, 1);
assert.equal(removed.game.isBetaReportOpen, false);
assert.equal(removed.game.isPlaying, false);

async function testStartup({ loadError = null, hasReport = false, missingDependency = null } = {}) {
    const page = createPage({ boot: false, report: hasReport ? pendingReport('startup') : null });
    const info = [];
    const success = [];
    const alerts = [];
    const context = page.context;
    let loadCalls = 0;
    for(const name of ['DogeMinerSaveReconciliation', 'DogeMinerDM2Import', 'DogeMinerDM2ImportData', 'DogeMinerLZString', 'DogeMinerLandingSave', 'DogeMinerSeasonal', 'DogeMinerLayout', 'DogeMinerSecrets']) context.window[name]={};
    context.window.DogeMinerLandingSave={async consume(){return {imported:false};}};
    context.window.DogeMinerOfflineEarnings = {};
    context.window.DogeMinerTimelineHistory = {};
    context.window.DogeMinerStories = {};
    context.window.DogeMinerStoryHistory = {};
    context.window.DogeMinerHelperNames = {};
    context.window.DogeMinerFieldPersonality = {};
    context.window.DogeMinerButtonMotion = {};
    context.window.DogeMinerMotionNotice={start(){}};
    context.window.DogeMinerEventNotifications={};
    context.window.DogeMinerBonusHud={};
    context.window.DogeMinerPerformance={bind(){}};
    context.window.DogeMinerFrameClock={};
    context.window.DogeMinerDrills={};
    context.window.DogeMinerToolProfiles={};
    context.window.DogeMinerToolAudio={};
    context.window.DogeMinerEncounters={};
    context.window.DogeMinerRickVisitor={};
    context.window.DogeMinerReleaseNotes={};
    context.window.DogeMinerRockReplacement={};
    context.window.DogeMinerTools={};
    context.window.DogeMinerSunDogeFusion={};
    context.window.DogeMinerUpgradePresentation={};
    context.window.DogeMinerLateProgression={};
    context.window.DogeMinerMoonLaunch={};
    context.window.DogeMinerMobileGestures={install(){}};
    context.window.DogeMinerNewsDoge = {};
    context.window.DogeMinerWorldDiscovery = {};
    context.window.DogeMinerSearchdoge = {};
    context.window.WelcomeBackReport = {};
    context.window.PopupPresentation = {};
    context.window.DogeMinerBalance = {};
    context.window.LootMotion = {};
    context.window.DogeMinerFieldLoot = {};
    context.window.DogeMinerHelperLoot = {};
    context.window.DogeMinerLootAutomation = {};
    context.window.DogeMinerBulkShop = {};
    context.window.DogeMinerHelperShopDetails = {};
    context.window.BetaSaveMigration = {};
    context.BootGame = function () { return page.game; };
    context.BootGame.prototype.animateMysteryBoxOpening = function() {};
    context.BootGame.prototype.scheduleOfflineEarningsReport = function() {};
    context.BootGame.prototype.getSeasonalForSave=function(){};context.BootGame.prototype.getLayoutForSave=function(){};
    if(missingDependency==='seasonal-runtime')delete context.BootGame.prototype.getSeasonalForSave;
    else if(missingDependency==='layout-runtime')delete context.BootGame.prototype.getLayoutForSave;
    else if (missingDependency) delete context.window[missingDependency];
    context.BootSaveManager = function () { return page.manager; };
    page.manager.loadGame = () => { loadCalls++; return hasReport; };
    page.manager.loadError = loadError;
    context.PickaxeFactory = class { async loadTemplates() {} };
    context.FortuneFactory = class { async loadTemplates() {} };
    context.ShopManager = class {};
    context.UIManager = class {};
    context.AudioManager = class { init() {} };
    context.NotificationManager = class { showInfo(message) { info.push(message); } showSuccess(message) { success.push(message); } };
    context.TimeTravelManager = class {};
    context.ControllerManager = class {};
    context.alert = message => alerts.push(message);
    vm.runInContext('DogeMinerGame = BootGame; SaveManager = BootSaveManager;', context);
    vm.runInContext(fs.readFileSync(path.join(sourceRoot, 'main.js'), 'utf8'), context);
    await vm.runInContext('initializeGame()', context);
    assert.equal(page.shown.length, 0, 'Save loading cannot show a report before boot finishes');
    if (missingDependency) {
        assert.equal(loadCalls, 0, 'Missing income/discovery files stop boot before save access');
        assert.equal(page.game._bootComplete, false);
        assert.equal(page.timers.some(timer => timer.delay === 500), false);
        assert.equal(alerts.length, 1);
        assert.match(alerts[0], /could not be loaded/);
        return;
    }
    if (loadError) {
        assert.equal(page.game.isPlaying, false);
        assert.equal(page.game._bootComplete, false);
        assert.equal(page.timers.some(timer => timer.delay === 500), false, 'A rejected save cannot schedule successful boot');
        assert.equal(info.length, 0, 'A rejected migration is not treated as a fresh game');
        assert.equal(success.length, 0);
        assert.equal(alerts.length, 1);
        assert.match(alerts[0], /Migration storage failed/);
    } else {
        page.flushTimers(500);
        assert.equal(page.game._bootComplete, true);
        assert.equal(success.length, 1);
        assert.equal(alerts.length, 0);
        if (hasReport) {
            assert.equal(page.shown.length, 1);
            assert.equal(page.game.isPlaying, false);
            assert.equal(page.intro.length, 0);
            assert.equal(page.acknowledge(), true);
            page.flushTimers(0);
            assert.equal(page.intro.length, 1);
            assert.equal(page.intro[0].reportOpen, false);
        } else {
            assert.equal(page.shown.length, 0);
            assert.equal(info.length, 1);
            assert.equal(page.intro.length, 1);
            assert.equal(page.game.isPlaying, true);
        }
    }
}

function testController() {
    let now = 0;
    const clicks = [];
    const scroll = { scrollTop: 0 };
    const context = { window: {}, navigator: {}, document: { activeElement: null },
        Date: { now: () => now }, Event: class { constructor(type, options) { this.type = type; Object.assign(this, options); } },
        requestAnimationFrame() { return 1; }, console };
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(path.join(sourceRoot, 'controller.js'), 'utf8'), context);
    const Controller = vm.runInContext('ControllerManager', context);
    const GP = vm.runInContext('GP', context);
    const input = (tagName, name, { hidden = false, disabled = false } = {}) => ({ tagName, name, disabled,
        closest() { return hidden ? {} : null; }, getClientRects() { return [{}]; },
        focus() { context.document.activeElement = this; }, click() { clicks.push(name); } });
    const search = input('INPUT', 'search');
    const filter = Object.assign(input('SELECT', 'filter'), { options: [{}, {}, {}], selectedIndex: 0,
        changes: 0, dispatchEvent(event) { assert.equal(event.type, 'change'); this.changes++; } });
    const summary = input('SUMMARY', 'item');
    const hidden = input('SUMMARY', 'hidden', { hidden: true });
    const disabled = input('BUTTON', 'disabled', { disabled: true });
    const button = input('BUTTON', 'continue');
    const controls = [search, filter, summary, hidden, disabled, button];
    let report = { querySelectorAll() { return controls; }, querySelector() { return scroll; } };
    context.document.getElementById = () => report;
    const manager = Object.assign(Object.create(Controller.prototype), { game: { isBetaReportOpen: true },
        prevButtons: [], prevAxes: [], DEAD_ZONE: 0.35, gamepadIndex: 0, isActive: true });
    let buttons = [];
    let axes = [];
    const frame = (pressed = [], nextAxes = [0, 0, 0, 0]) => {
        now += 16;
        buttons = Array.from({ length: 16 }, (_, index) => ({ pressed: pressed.includes(index), value: pressed.includes(index) ? 1 : 0 }));
        axes = nextAxes;
        manager._handleBetaReportInput(buttons, axes);
        assert.equal(manager.prevButtons, buttons);
        assert.equal(manager.prevAxes, axes);
    };
    button.focus();
    frame([GP.A, GP.B]);
    frame([GP.A]);
    assert.deepEqual(clicks, [], 'Opening/held A and B never acknowledge');
    frame();
    frame([GP.RB]);
    assert.equal(context.document.activeElement, search, 'Focus wraps and skips hidden/disabled controls');
    frame();
    frame([GP.A]);
    assert.deepEqual(clicks, [], 'A while searching cannot acknowledge');
    frame();
    frame([GP.DPAD_DOWN]);
    assert.equal(context.document.activeElement, filter);
    frame();
    frame([GP.DPAD_RIGHT]);
    assert.equal(filter.selectedIndex, 1);
    frame();
    frame([GP.DPAD_LEFT]);
    assert.equal(filter.selectedIndex, 0);
    assert.equal(filter.changes, 2);
    frame();
    frame([GP.A]);
    assert.deepEqual(clicks, [], 'A on a filter does not acknowledge');
    frame();
    frame([GP.RB]);
    assert.equal(context.document.activeElement, summary);
    frame();
    frame([GP.A]);
    assert.deepEqual(clicks, ['item'], 'A opens the focused item');
    frame();
    frame([GP.RB]);
    assert.equal(context.document.activeElement, button);
    frame();
    frame([GP.B]);
    assert.deepEqual(clicks, ['item']);
    frame();
    frame([GP.A]);
    assert.deepEqual(clicks, ['item', 'continue'], 'Only A on Continue requests acknowledgment');
    frame();
    frame([], [0, 0, 0, 1]);
    assert.equal(scroll.scrollTop > 0, true, 'Right stick scrolls the report body');
    report = { querySelectorAll() { return controls; }, querySelector() { return scroll; } };
    frame([GP.A]);
    assert.deepEqual(clicks, ['item', 'continue'], 'A held into a replacement report is seeded again');

    // Exercise the real poll routing while every ordinary action would fail.
    manager._disabledByUser = false;
    context.navigator.getGamepads = () => [{ buttons, axes }];
    for (const name of ['_handleA', '_handleB', '_handleX', '_handleY', '_cyclePanelTab', '_cyclePlanetTab', '_handleRightStick', '_simulateVirtualClick']) {
        manager[name] = () => { throw new Error(`Game action ${name} reached behind report`); };
    }
    buttons = buttons.map(button => ({ ...button, pressed: true, value: 1 }));
    manager._pollLoop();
    assert.equal(manager.prevButtons.every(button => button.pressed), true);
    manager.game.isBetaReportOpen = false; manager.game.isStoryOpen = true;
    manager._pollLoop();
    assert.equal(manager.prevButtons.every(button => button.pressed), true, 'Story popup isolates all controller actions');
}

(async () => {
    await testStartup({ loadError: new Error('Migration storage failed') });
    for (const missingDependency of ['DogeMinerSaveReconciliation', 'DogeMinerDM2Import', 'DogeMinerDM2ImportData', 'DogeMinerLZString', 'DogeMinerLandingSave', 'DogeMinerSeasonal', 'DogeMinerLayout', 'DogeMinerSecrets', 'seasonal-runtime', 'layout-runtime', 'DogeMinerReleaseNotes', 'DogeMinerRockReplacement', 'DogeMinerRickVisitor', 'DogeMinerEncounters', 'DogeMinerToolAudio', 'DogeMinerToolProfiles', 'DogeMinerDrills', 'DogeMinerSunDogeFusion', 'DogeMinerTools', 'DogeMinerUpgradePresentation', 'DogeMinerLateProgression', 'DogeMinerMoonLaunch', 'DogeMinerMobileGestures', 'DogeMinerFrameClock', 'DogeMinerPerformance', 'DogeMinerBonusHud', 'DogeMinerMotionNotice', 'DogeMinerEventNotifications', 'DogeMinerButtonMotion', 'DogeMinerFieldPersonality', 'DogeMinerOfflineEarnings', 'DogeMinerTimelineHistory', 'DogeMinerStories', 'DogeMinerStoryHistory', 'DogeMinerHelperNames', 'DogeMinerWorldDiscovery', 'PopupPresentation', 'DogeMinerNewsDoge', 'DogeMinerSearchdoge', 'DogeMinerFieldLoot', 'DogeMinerHelperLoot', 'DogeMinerLootAutomation', 'DogeMinerBulkShop', 'DogeMinerHelperShopDetails', 'WelcomeBackReport']) await testStartup({ missingDependency });
    await testStartup();
    await testStartup({ hasReport: true });
    const index = fs.readFileSync(path.join(sourceRoot, '../index.html'), 'utf8');
    const block = index.match(/const gameScripts\s*=\s*\[([\s\S]*?)\];/)[1];
    const scripts = [...block.matchAll(/'([^']+)'/g)].map(match => match[1].split('?')[0]);
    for (const [dependency, consumer] of [['js/balance-data.js', 'js/balance.js'], ['js/balance.js', 'js/beta-migration.js'],
        ['js/beta-migration.js', 'js/save.js'], ['js/popup-presentation.js', 'js/beta-report.js'], ['js/beta-report.js', 'js/main.js'], ['js/save.js', 'js/main.js'], ['js/game.js', 'js/timeline-history.js'], ['js/timeline-history.js', 'js/stories.js'], ['js/stories.js', 'js/world-discovery.js'], ['js/newsdoge.js', 'js/story-history.js'], ['js/story-history.js', 'js/save.js'], ['js/world-discovery.js', 'js/newsdoge.js'], ['js/newsdoge.js', 'js/save.js'], ['js/controller.js', 'js/main.js'], ['js/game.js','js/layout.js'], ['js/dm2-import-data.js','js/seasonal.js'], ['js/seasonal.js','js/pickaxe-factory.js'], ['js/stories.js','js/seasonal-runtime.js'], ['js/seasonal-runtime.js','js/save.js'], ['js/timeline-history.js','js/secret-codes.js'], ['js/landing-save.js','js/main.js']]) {
        assert.equal(scripts.indexOf(dependency) >= 0 && scripts.indexOf(dependency) < scripts.indexOf(consumer), true,
            `${dependency} must load before ${consumer}`);
    }
    assert.equal(new Set(scripts).size, scripts.length, 'Boot scripts are not loaded twice');
    assert.match(index, /for \(const script of gameScripts\)[\s\S]*?await appendScript\(script\)/, 'Dependencies are awaited in order');
    testController();
    console.log('Beta report lifecycle, startup failure guard, durable acknowledgment, replacement and controller isolation passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });

// A successful manual save stays silent; storage failures remain visible.
const quietSave=createPage();quietSave.game.notificationsEnabled=true;
assert.equal(quietSave.manager.saveGame(),true);assert.deepEqual(quietSave.notices,[]);
assert.equal(quietSave.storage.get('save'),quietSave.storage.get('backup'));
quietSave.fault.key='save';assert.equal(quietSave.manager.saveGame(),false);
assert.deepEqual(quietSave.notices,['Error saving game!']);
