// Ctrl+\ scenarios for the sequential DM2 parity checkpoints.
(function () {
    'use strict';
    const active = () => window.CEParityTesting?.active === true && !window.CEParityTesting.error;
    const PLANETS = ['earth', 'moon', 'mars', 'jupiter', 'titan'];
    const LAST_SOURCE = 'parity:last-offline-source';
    const FEATURES = [['moon-goal', 'First Moon goal'], ['first-bonus', 'First Bonus Coin'],
        ['return-2', 'Timeline 2 return'], ['return-3', 'Timeline 3 return'], ['return-4', 'Timeline 4 return'],
        ['return-5', 'Later timeline return'], ['newsdoge', 'NewsDoge report'], ['story-settings', 'Story and hint settings']];
    const DISCOVERY_FEATURES = [['moon-arrival', 'Moon arrival'], ['moon-map', 'Moon treasure map'],
        ['mars-route', 'Discover Mars'], ['mars-arrival', 'Mars arrival'], ['mars-drawing', 'Mars crude drawing'],
        ['jupiter-route', 'Discover Jupiter'], ['jupiter-arrival', 'Jupiter arrival']];
    const DISCOVERY_STORIES = ['moon1', 'moon2', 'moon3', 'mars1', 'marsdraw', 'mars2', 'mars3', 'jupiter1'];
    const PROGRESSION_STORIES = ['timemachine', 'dia', 'titan1', 'titan2'];
    const PROGRESSION_FEATURES = [['story-settings', 'Settings & Supporter'], ['newsdoge', 'NewsDoge report'],
        ['popup-layout', 'Popup position & zoom'], ['rig-invention', 'Time Machine Rig invention'],
        ['dia-contact', 'First D.I.A. contact'], ['titan-sensors', 'Discover Titan'], ['titan-route', 'DogeStar route to Titan']];
    const INVENTORY_FEATURES = [['newsdoge', 'NewsDoge size & motion'], ['popup-layout', 'Popup zoom in & out'],
        ['inventory-unread', 'New item badges'], ['inventory-totals', 'Complete stat totals'],
        ['inventory-explanations', 'Stat explanations'], ['inventory-colors', 'Attribute colors'],
        ['mystery-fortunes', 'Restored Mystery fortunes']];
    const FIELD_FEATURES = [['bag-gather', 'Bag gathers loose coins'], ['diamond-stacks', 'Persistent diamond stacks'],
        ['coin-expiry', 'Coin warning & expiry'], ['bag-overflow', 'Large Dogebag opening']];
    const HELPER_LOOT_FEATURES = [['diamond-layers', 'Diamond stack layering'], ['field-motion', 'Coin motion & hover'],
        ['helper-pickup', 'Nearby helper pickup'], ['helper-seeking', 'Helpers seek coins']];
    const AUTOMATION_FEATURES = [['auto-unlock', 'Prestige auto-pickup unlock'], ['auto-drops', 'Automatic loot & equip'],
        ['auto-settings', 'Auto-pickup setting'], ['buy-max', 'Hold for Buy Max']];
    const SHOP_DETAILS_FEATURES=[['auto-drops','Automatic loot & equip'],['buy-max','Buy Max motion & icon'],
        ['helper-income','Boosted helper DPS'],['helper-breakdown','Helper DPS breakdown']];
    const MINING_FEEDBACK_FEATURES=[['record-crit','Record critical hit'],['ordinary-crit','Ordinary critical hit'],
        ['saved-crit','Saved critical record'],['balance-flight','Balance on coin arrival']];
    const CHECKPOINT15_FEATURES=[['stats-first','First-game Statistics'],['stats-compact','Statistics after travel'],
        ['stats-history','Timeline history'],['upgrade-hover','Upgrade card hover']];
    const CHECKPOINT16_FEATURES=[['upgrade-hover','Softer card hover'],['stats-history','Scrollable timeline history'],
        ['returning-save','Returning save'],['unfinished-story-news','New story & NewsDoge']];
    const HELPER_PERSONALITY_FEATURES=[['helper-hover','Helper outline & name fade'],['helper-groups','Grouped helper names'],
        ['moon-names','Moon Shibe nicknames'],['super-names','Super Shibe nicknames']];
    const FIELD_PERSONALITY_FEATURES=[['mining-chatter','Mining phrases'],['helper-conversation','Helper conversations'],
        ['held-conversation','Held & dropped phrases'],['helper-cadence','Helper animation timing']];
    const BUTTON_FEATURES=[['mining-chatter','Mining text spread'],['button-shop','Shop button motion'],
        ['button-report','Welcome Back buttons'],['button-story','Story & close buttons']];
    const NOTIFICATION_FEATURES=[['motion-notice','Reduce Motion notice'],['found-upgrade-notice','Found upgrade notification'],
        ['story-notice','Story notification'],['notification-timer','Notification dismissal']];
    const BACKGROUND_FEATURES=[['background-moon','Moon backgrounds'],['background-mars','Mars backgrounds'],
        ['background-jupiter','Jupiter backgrounds'],['background-titan','Titan backgrounds']];
    const HUD_AUDIO_FEATURES=[['bonus-hud','Bonus HUD & expiry'],['smooth-income','Smooth passive income'],
        ['mining-audio','Mining sound setting'],['background-audio','Background audio setting']];
    const PERFORMANCE_GESTURE_FEATURES=[['less-effects','Less Effects'],['frame-cap','48 FPS cap'],
        ['inventory-swipes','Inventory swipes'],['panel-swipes','Panel swipe & mining guard']];
    const LAUNCH_EVOLUTION_FEATURES=[['doge-gate-price','Doge Gate price'],['mystery-evolution','Mystery Box evolution'],
        ['moon-launch','Moon launch introduction'],['moon-skip','Moon playback & skip']];
    const LATE_UPGRADE_FEATURES=[['altar-yoga','Altar awakening & payments'],['titan-blueprints','Titan blueprints'],
        ['reallyhardium','Reallyhardium unlocks'],['upgrade-transform','Upgrade transformation']];
    const TOOL_FEATURES=[['tool-dual','Dual-wielding'],['tool-fusion','SunDoge fusion'],
        ['tool-drills','Hold-to-mine drills'],['tool-profiles','Tool motion & sound profiles']];
    const ENCOUNTER_FEATURES=[['cate-thief','Cate Thief'],['rick-visit','Rick visit'],['rock-capacity','Rock capacity'],['updates-discovery','Updates & discovery']];
    const CLOUD_FEATURES=[['cloud-local','Keep newer local progress'],['cloud-newer','Restore newer cloud progress'],['cloud-reward','Cloud waits for rewards'],['cloud-invalid','Reject invalid cloud save']];
    const IMPORT_FEATURES=[['import-basic','DM2 first-timeline save'],['import-late','DM2 protected rewards & history'],['import-backup','UTF16 import & backups'],['import-invalid','Reject damaged DM2 save']];
    const LANDING_FEATURES=[['landing-new','Landing: new game'],['landing-continue','Landing: saved game'],['import-late','DM2 protected rewards & history'],['import-invalid','Reject damaged DM2 save']];
    const SEASONAL_FEATURES=[['holiday-easter','Easter scene & hidden egg'],['holiday-halloween','Halloween scene & drops'],['holiday-xmas','Christmas scene & music'],['holiday-complete','Ninth egg & golden reward']];
    const LAYOUT_FEATURES=[['layout-desktop','Desktop layout'],['layout-tablet','Tablet layout'],['layout-phone','Phone layout'],['layout-codes','Keyboard secrets']];
    const REVIEW_FEATURES=[['updates-discovery','Full Beta patch notes'],['rick-visit','Rick visit & tool alignment'],['rock-capacity','99 Dogebags & rock capacity'],['holiday-complete','Ninth egg & golden reward']];
    const VERIFICATION_FEATURES=[['verify-input','Settings, inputs & Rick timer'],['verify-mission','Full D.I.A. mission'],['verify-worlds','Planet scenes & holiday cycle'],['verify-recovery','Ninth egg, saved reward & reload']];
    const POLISH_FEATURES=[['polish-settings','Compact settings & patch notes'],['polish-mission','D.I.A. with controller or touch'],['polish-rewards','Mission reward controls'],['polish-phone','Phone inventory & drawer']];
    const fullReview=()=>new URLSearchParams(location.search).get('allChanges')==='1';
    // The latest sandbox exposes the whole review history, including the early
    // transaction/clock actions. Older checkpoint URLs keep their focused menus.
    const REVIEW_GROUPS = [
        {label:"63–65 · Mobile & controller",features:POLISH_FEATURES},
        {label:"Latest review", features:REVIEW_FEATURES},
        {label:"6 \u00b7 Goals & return stories", features:FEATURES},
        {label:"7 \u00b7 Planet discoveries", features:DISCOVERY_FEATURES},
        {label:"8 \u00b7 Rig, contact & Titan", features:PROGRESSION_FEATURES},
        {label:"9 \u00b7 Inventory & motion", features:INVENTORY_FEATURES},
        {label:"10 \u00b7 Field loot", features:FIELD_FEATURES},
        {label:"11 \u00b7 Helper loot", features:HELPER_LOOT_FEATURES},
        {label:"12 \u00b7 Auto loot & Buy Max", features:AUTOMATION_FEATURES},
        {label:"13 \u00b7 Shop details", features:SHOP_DETAILS_FEATURES},
        {label:"14 \u00b7 Mining feedback", features:MINING_FEEDBACK_FEATURES},
        {label:"15 \u00b7 Statistics & upgrades", features:CHECKPOINT15_FEATURES},
        {label:"16 \u00b7 Return & history", features:CHECKPOINT16_FEATURES},
        {label:"17 \u00b7 Helper names & hover", features:HELPER_PERSONALITY_FEATURES},
        {label:"18 \u00b7 Field personality", features:FIELD_PERSONALITY_FEATURES},
        {label:"19 \u00b7 Mining text & buttons", features:BUTTON_FEATURES},
        {label:"20 \u00b7 Notifications", features:NOTIFICATION_FEATURES},
        {label:"21 \u00b7 Planet backgrounds", features:BACKGROUND_FEATURES},
        {label:"22\u201324 \u00b7 HUD, income & audio", features:HUD_AUDIO_FEATURES},
        {label:"25\u201327 \u00b7 Performance & swipes", features:PERFORMANCE_GESTURE_FEATURES},
        {label:"28\u201330 \u00b7 Gate, evolution & launch", features:LAUNCH_EVOLUTION_FEATURES},
        {label:"31\u201335 \u00b7 Late progression & upgrades", features:LATE_UPGRADE_FEATURES},
        {label:"36\u201340 \u00b7 Tools & fusion", features:TOOL_FEATURES},
        {label:"41\u201345 \u00b7 Visitors, rocks & updates", features:ENCOUNTER_FEATURES},
        {label:"46 \u00b7 Cloud reconciliation", features:CLOUD_FEATURES},
        {label:"47 \u00b7 DM2 import", features:IMPORT_FEATURES},
        {label:"48 \u00b7 Landing page", features:LANDING_FEATURES},
        {label:"49\u201352 \u00b7 Seasons & eggs", features:SEASONAL_FEATURES},
        {label:"53\u201355 \u00b7 Layout & secrets", features:LAYOUT_FEATURES},
        {label:'More helper names & upgrades',features:[['party-names','Party Shibe nicknames'],['dj-names','DJ Kittenz nicknames'],['upgrade-hover-mars','Mars upgrade cards']]},
        {label:"1 \u00b7 Income & Searchdoge", action:true, features:[["offline-hour", "Offline: 1 hour"], ["offline-cap", "Offline: 72h / cap"], ["offline-short", "Offline: 4m / no credit"], ["offline-zero", "Offline: zero DPS"], ["offline-refresh", "Offline + refresh"], ["offline-replay", "Replay last snapshot"], ["beta-offline", "Beta \u2192 welcome back"], ["search-first", "Search: first timeline"], ["search-prestige", "Search: timeline 2"], ["search-planets", "Search: two planets"], ["search-find", "Force next discovery"], ["search-fill", "Fill found slots"], ["search-step", "Step search 3s"], ["coin-hover", "Coin hover sample"]]},
        {label:"2 \u00b7 Prestige rewards", action:true, features:[["prestige-million", "Load 1M coins \u00b7 8 pickaxes"], ["prestige-cap", "Load 1T coins \u00b7 first badge cap"], ["prestige-paw", "Paw only \u00b7 zero helpers"], ["prestige-planets", "Helpers on all five planets"], ["prestige-timeline-2", "Badge: timeline 2"], ["prestige-timeline-10", "Badge: timeline 10"], ["prestige-timeline-11", "Badge: timeline 11"], ["prestige-preservation", "Preserve earned Alpha rewards"], ["prestige-quote", "View mission quote"], ["prestige-choices", "View badge choices"], ["prestige-review", "Review rewards \u00b7 skip cutscene"]]},
        {label:"3 \u00b7 Bonus Coins & Rick", action:true, features:[["bonus-earth", "Load Earth \u00b7 tier 1"], ["bonus-mars", "Load Mars reached \u00b7 no bases"], ["bonus-titan", "Load Titan reached \u00b7 tiers 1\u20135"], ["bonus-timeline-2", "Load timeline 2 \u00b7 Earth + Omega"], ["bonus-early", "Load nine Shibes \u00b7 early offer"], ["bonus-weighted", "Spawn weighted coin"], ["bonus-tier", "Spawn selected tier"], ["bonus-roll", "Step two-minute check"], ["bonus-high-roll", "High roll \u00b7 build odds"], ["bonus-success", "Force successful check"], ["bonus-expire", "Expire current buff"], ["rick-near", "Load Rick \u00b7 nearby groups"], ["rick-remove", "Remove Rick"]]},
        {label:"4 \u00b7 Timelines & Fortunes", action:true, features:[["history-first", "Load first tracked run"], ["history-legacy", "Load veteran Alpha save"], ["history-many", "Load 30 completed timelines"], ["history-stacked", "Load existing protected stacks"], ["history-view", "View timeline history"], ["history-inventory", "View Fortune inventory"], ["history-step", "Add 1K earned coins + 10s"], ["history-choice", "Play mission choice"], ["history-review", "Review rewards \u00b7 selected choice"], ["history-fail", "Fail next mission save once"]]},
        {label:"5 \u00b7 Stories & royalties", action:true, features:[["story-four", "Load four DJs \u00b7 blocked"], ["story-short", "Load five DJs \u00b7 729s"], ["story-ready", "Load five DJs \u00b7 730s"], ["story-timeline-2", "Load timeline 2 \u00b7 five DJs"], ["story-claimed", "Load claimed royalty reward"], ["story-suppressed", "Load stories suppressed"], ["story-pending", "Load saved pending story"], ["story-offline", "Queue behind Welcome Back"], ["story-delay", "Pass arrival delay"], ["story-time", "Add one mining second"], ["story-check", "Step story check"], ["story-fail", "Fail next story completion once"], ["stories-toggle", "Toggle story popups"]]},
    ];
    const reviewChoices = () => [...new Map(REVIEW_GROUPS.flatMap(group=>group.features).map(pair=>[pair[0],pair])).values()];
    const featureChoices = () => fullReview()&&window.CEParityTesting?.checkpoint>=56 ? reviewChoices() : window.CEParityTesting?.checkpoint >= 63 ? POLISH_FEATURES : window.CEParityTesting?.checkpoint >= 58 ? VERIFICATION_FEATURES : window.CEParityTesting?.checkpoint >= 56 ? REVIEW_FEATURES : window.CEParityTesting?.checkpoint >= 53 ? LAYOUT_FEATURES : window.CEParityTesting?.checkpoint >= 49 ? SEASONAL_FEATURES : window.CEParityTesting?.checkpoint >= 48 ? LANDING_FEATURES : window.CEParityTesting?.checkpoint >= 47 ? IMPORT_FEATURES : window.CEParityTesting?.checkpoint >= 46 ? CLOUD_FEATURES : window.CEParityTesting?.checkpoint >= 41 ? ENCOUNTER_FEATURES
        : window.CEParityTesting?.checkpoint >= 36 ? TOOL_FEATURES
        : window.CEParityTesting?.checkpoint >= 31 ? LATE_UPGRADE_FEATURES
        : window.CEParityTesting?.checkpoint >= 28 ? LAUNCH_EVOLUTION_FEATURES
        : window.CEParityTesting?.checkpoint >= 25 ? PERFORMANCE_GESTURE_FEATURES
        : window.CEParityTesting?.checkpoint >= 22 ? HUD_AUDIO_FEATURES
        : window.CEParityTesting?.checkpoint === 21 ? BACKGROUND_FEATURES
        : window.CEParityTesting?.checkpoint === 20 ? NOTIFICATION_FEATURES
        : window.CEParityTesting?.checkpoint === 19 ? BUTTON_FEATURES
        : window.CEParityTesting?.checkpoint === 18 ? FIELD_PERSONALITY_FEATURES
        : window.CEParityTesting?.checkpoint === 17 ? HELPER_PERSONALITY_FEATURES
        : window.CEParityTesting?.checkpoint === 16 ? CHECKPOINT16_FEATURES
        : window.CEParityTesting?.checkpoint === 15 ? CHECKPOINT15_FEATURES
        : window.CEParityTesting?.checkpoint === 14 ? MINING_FEEDBACK_FEATURES
        : window.CEParityTesting?.checkpoint === 13 ? SHOP_DETAILS_FEATURES
        : window.CEParityTesting?.checkpoint === 12 ? AUTOMATION_FEATURES
        : window.CEParityTesting?.checkpoint === 11 ? HELPER_LOOT_FEATURES
        : window.CEParityTesting?.checkpoint === 10 ? FIELD_FEATURES
        : window.CEParityTesting?.checkpoint === 9 ? INVENTORY_FEATURES
        : window.CEParityTesting?.checkpoint === 8 ? PROGRESSION_FEATURES
        : window.CEParityTesting?.checkpoint === 7 ? DISCOVERY_FEATURES : FEATURES;
    let selectedFeature = 'moon-goal';
    let lastResult = 'Choose a preset, then inspect the game. Ctrl+\\ toggles these tools.';

    function scenarioSave({ planet = 'earth', timeline = 1, zeroDps = false } = {}) {
        const g = window.game;
        delete g._seasonalPreview;localStorage.removeItem('parity:seasonal-event');
        const data = { ...window.saveManager.createSaveData(), ...window.CEParityTesting.freshSave(),
            currentLevel: planet, timelineNumber: timeline, dm2Import:null, importReceipt:null, betaMigrationReport: null, offlineEarningsReport: null,
            timelineProgress: null, worldDiscovery: null, lateProgression:null, seasonal:null,
            lootAutomation: { version:1, unlocked:timeline > 1, enabled:false, pendingUnlock:false, remainingMs:0 },
            // Older checkpoint scenes stay focused on their own feature.
            storyProgress: { version: 1, timeline, seen: ['tothemoon', 'bonus', 'newtimeline', 'newtimeline3', 'newtimeline4', 'newtimeline5'], pending: [], extraDps: 0 },
            searchdogeDiscovery: null, helperUpgradeOffers: {}, helperUpgradeLevels: {}, upgrades: {},
            pickaxeInventory: [g.defaultPickaxe], equippedPickaxeId: g.defaultPickaxe.instanceId, maxPickaxeDPC: 1,
            fortuneInventory: [], latestObtainedFortune: null, inventoryUnread: { pickaxe: 0, fortune: 0 }, isSupporter: false,
            dogediamonds: 5, dogediamondsEverObtained: 5, searchdogeSlot3Unlocked: false,
            diaMissionSeenOnce: false, hasReachedJupiterEver: false, hasSeenDogebagIntro: true,
            mysteryBoxObtained: false, mysteryBoxEvolutionPending: false, mysteryBoxOpenCount: 0, mysteryBoxCycle: 0,
            mysteryBoxTimerRemaining: 0, mysteryBoxLastSaveTime: Date.now(),
            bonusCoinBuffMultiplier: 1, bonusCoinBuffEndTime: 0, bonusCoinLevel: 1, bonusCoinSeenLevel: 1,
            bonusCoinMaxPlanetLevel: PLANETS.indexOf(planet) + 1, bonusCoinBuffTier: 0,
            bonusCoinClaimCount: 0, bonusCoinEarlyOffered: false,
            dogebagStacks: {}, diamondStacks: {}, placedHelpers: [], rocksBroken: 0, rockLevel: 1,
            lastPickaxeDropTime: 0, prizesSinceLastPickaxe: 0, unlockedLevels: [...PLANETS], hasPlayedMoonLaunch: true,
            cutscenes: { moonLaunch: true },
            planetRockData: Object.fromEntries(PLANETS.map(name => [name, { rocksBroken: 0, rockLevel: 1, currentHP: null, maxHP: null }])) };
        for (const name of PLANETS) data[`${name}PlacedHelpers`] = [];
        if (!zeroDps) {
            const types = { earth: ['miningShibe', 'dogeKennels', 'slaveLaborCamp', 'spaceRocket'],
                moon: ['moonBase', 'landerShibe'], mars: ['marsBase', 'partyShibe'],
                jupiter: ['cloudBase', 'flyingDoge'], titan: ['titanBase', 'roboShibe'] };
            const category = { earth: 'helpers', moon: 'moonHelpers', mars: 'marsHelpers', jupiter: 'jupiterHelpers', titan: 'titanHelpers' }[planet];
            data[category] = types[planet].filter(type => window.shopManager.getCurrentHelperUpgradeInfo(type))
                .map(type => ({ type, dps: window.shopManager.getCurrentHelperUpgradeInfo(type).dps }));
            // Four Earth candidates demonstrate that the badge counts slots.
            if (planet === 'earth' && data.helpers.length < 4) {
                data.helpers = Object.keys(window.shopManager.shopData.helpers).filter(type => window.shopManager.getNextHelperUpgrade(type))
                    .slice(0, 4).map(type => ({ type, dps: window.shopManager.getCurrentHelperUpgradeInfo(type).dps }));
            }
        }
        return data;
    }

    function apply(data, { discovery = false, legacyHistory = false } = {}) {
        clearInterval(window.game?._checkpointPerformanceTimer);
        clearInterval(window.game?._checkpointLateTimer);
        document.getElementById('parity-frame-demo')?.remove();
        document.documentElement.classList.remove('parity-helper-field-preview');
        // Historical previews remain focused on their own feature. This only
        // edits sandbox fixtures; production saves never pass through here.
        if (!legacyHistory && data.storyProgress) data.storyProgress.completionHistoryVersion=1;
        if (!discovery && !legacyHistory) {
            const progress = data.storyProgress;
            const world = window.DogeMinerWorldDiscovery.legacy(data);
            // Quiet extra narratives after deriving earned access; synthetic
            // seen IDs must not invent Titan access in older preview scenes.
            progress.seen = [...new Set([...progress.seen, ...DISCOVERY_STORIES, ...PROGRESSION_STORIES])];
            for (const item of Object.values(world.artifacts)) item.stage = 'collected';
            for (const item of Object.values(world.routes)) item.stage = 'ready';
            data.worldDiscovery = world;
        }
        const g = window.game;
        for (const timer of g._checkpointAutoDropsTimers || []) clearTimeout(timer);
        g._checkpointAutoDropsTimers = [];
        clearTimeout(g._checkpointHelperDetailsTimer);
        clearTimeout(g._checkpointPolishTimer);
        clearTimeout(g._checkpointHistoryDemoTimer);
        clearTimeout(g._checkpointPersonalityTimer);
        clearTimeout(g._checkpointButtonTimer);
        clearInterval(g._checkpointChatterTimer);g._checkpointChatterTimer=null;
        for (const method of ['beginHeldHelperChatter','endHeldHelperChatter']) {
            const key = '_checkpointOriginal_' + method;
            if (g[key]) { g[method] = g[key]; delete g[key]; }
        }
        if (g._checkpointOriginalBagRoll) {
            g.generateDogebagContents = g._checkpointOriginalBagRoll; delete g._checkpointOriginalBagRoll;
        }
        g.resetStoryPresentation?.();
        g._hideInventoryTooltip();
        for (const id of ['pickaxe-modal', 'fortune-modal']) document.getElementById(id)?.classList.remove('active');
        g._inventoryUi ||= {};
        for (const kind of ['pickaxe', 'fortune']) {
            document.getElementById(`${kind}-stats-sidebar`)?.classList.remove('mobile-open');
            g._inventoryUi[kind] = { search: '', rarity: '', sort: 'newest' };
            for (const [field, value] of [['search', ''], ['rarity', ''], ['sort', 'newest']]) {
                const input = document.getElementById(`${kind}-${field}`); if (input) input.value = value;
            }
        }
        if (window.saveManager._checkpointOriginalStoryCommit) {
            window.saveManager.commitStoryProgress = window.saveManager._checkpointOriginalStoryCommit;
            delete window.saveManager._checkpointOriginalStoryCommit;
        }
        if (window.saveManager._checkpointOriginalCommit) {
            window.saveManager.commitTimelineReset = window.saveManager._checkpointOriginalCommit;
            delete window.saveManager._checkpointOriginalCommit;
        }
        const travel = window.timeTravelManager;
        travel?._teardownCutscene(); travel?.closeMissionBrief();
        if (travel) { travel._payout = null; travel._payoutContext = null; travel._missionChoice = null; }
        for (const id of ['dia-warning-modal', 'drill-modal']) document.getElementById(id)?.classList.remove('active');
        document.getElementById('mission-passed')?.remove();
        for (const id of ['character-container', 'pickaxe']) {
            const node = document.getElementById(id);
            if (node) { node.classList.remove('doge-intro', 'pickaxe-intro'); node.style.visibility = ''; node.style.transform = ''; }
        }
        g.closeOfflineEarningsReport();
        window.BetaBalanceReport.close(); g.isBetaReportOpen = false; g._shownBetaMigrationReport = null;
        g._introAfterBetaReport = false; g.isIntroPlaying = false; g.isCutscenePlaying = false; g.isPlaying = true;
        g.isMouseDown = false; g.isSpaceDown = false; g.clickTimes = []; g.lastClickTime = 0;
        clearTimeout(g.swingTimeout); g.swingTimeout = null; g._currentIdleSpritePath = null;
        document.getElementById('pickaxe')?.classList.remove('swing-down', 'pickaxe-intro');
        g._expireBonusCoinBuff({silent:true}); g._removeBonusCoinEl();
        window.saveManager.applySaveData(data);
        document.getElementById('mystery-box-btn').style.display = g.mysteryBoxObtained&&!g.mysteryBoxEvolutionPending ? '' : 'none';
        if (!window.saveManager.saveGame(false)) throw new Error('The test preset could not be saved.');
        const character = document.getElementById('main-character');
        if (character) character.src = g._getCharacterSprite();
        g.updateRockSprite(); g.updateUI();
        window.uiManager.updateUpgradeContent();
        window.uiManager.updateMobileUpgradesContent();
        window.CEParityTesting.mute();
    }

    function prestigePreset(name) {
        const g = window.game;
        const timeline = { 'prestige-timeline-2': 2, 'prestige-timeline-10': 10, 'prestige-timeline-11': 11 }[name] || 1;
        const data = scenarioSave({ timeline, zeroDps: true });
        data.dogecoins = name === 'prestige-cap' ? 1e12 : name === 'prestige-paw' ? 0 : 1e6;
        data.totalMined = data.dogecoins;
        data.dogediamonds = 500; data.dogediamondsEverObtained = 600;
        data.diaMissionSeenOnce = true; data.hasReachedJupiterEver = true;
        const starter = timeline > 1 || name === 'prestige-paw' ? TimeTravelManager.createStartingPaw() : { ...g.defaultPickaxe };
        data.pickaxeInventory = [starter]; data.equippedPickaxeId = starter.instanceId;
        if (name !== 'prestige-paw') {
            const template = Object.values(g.pickaxeFactory.templates).find(item => item.rarity?.toLowerCase() === 'legendary');
            for (let i = 0; i < 7; i++) {
                const pick = template ? g.pickaxeFactory.generatePickaxe(template.id, 1, 0, { planet: 'earth', timeline }, () => .5) : { ...g.defaultPickaxe, rarity: 'legendary' };
                data.pickaxeInventory.push({ ...pick, instanceId: `parity-legendary-${i}` });
            }
        }
        function helpers(planet, type, count) {
            const key = { earth: 'helpers', moon: 'moonHelpers', mars: 'marsHelpers', jupiter: 'jupiterHelpers', titan: 'titanHelpers' }[planet];
            const info = window.shopManager.getCurrentHelperUpgradeInfo(type);
            const placed = data[`${planet}PlacedHelpers`];
            const x = 120 + new Set(placed.map(helper => helper.type)).size * 70;
            for (let index = 0; index < count; index++) {
                const name = `${info.name} ${index + 1}`;
                data[key].push({ type, name, dps: info.dps });
                // Use ordinary saved CE groups so a 1,000-helper quote remains
                // inexpensive to inspect; every owned member still counts.
                placed.push({ type, name, dps: info.dps, x, y: 520, isMining: false,
                    id: 1e9 + PLANETS.indexOf(planet) * 1e6 + placed.length,
                    groupId: `parity-${planet}-${type}` });
            }
        }
        if (name === 'prestige-planets') {
            for (const row of [['earth', 'miningShibe', 3], ['earth', 'dogeKennels', 7], ['moon', 'moonBase', 11],
                ['mars', 'marsBase', 8], ['jupiter', 'cloudBase', 13], ['titan', 'titanBase', 4]]) helpers(...row);
        } else if (name !== 'prestige-paw') helpers('earth', 'miningShibe',
            name === 'prestige-cap' || name.startsWith('prestige-timeline-') ? 1000 : 10);
        if (name === 'prestige-preservation') {
            const patron = g.fortuneFactory.generateSpecialFortune('badge_of_patronage');
            if (!patron) throw new Error('The Badge of Patronage template could not be loaded.');
            data.fortuneInventory = [
                { instanceId: 'parity-old-badge', templateId: 'dia_badge_luck', name: 'D.I.A. Badge (Luck)',
                    rarity: 'rare', isDiaBadge: true, isProtected: true, sprite: 'assets/general/diabadge.webp',
                    stats: [{ name: 'luck', displayName: 'Luck', indicator: '+%', value: 2000 }] },
                { ...patron, instanceId: 'parity-patron' },
                { instanceId: 'parity-alpha-super', templateId: 'super_fortune', name: 'Super Fortune',
                    rarity: 'legendary', isSuperFortune: true, isProtected: true,
                    sprite: 'assets/general/icons/Fortunes/Protected Non Seasonal/Super Fortune/superfortune.webp',
                    stats: [{ name: 'luck', balanceKey: 'luck', displayName: 'Luck', indicator: '+%', value: 999 },
                        { name: 'dps', balanceKey: 'persec', displayName: 'DPS', indicator: '+', value: 123456 }] }
            ];
        }
        apply(data); g.isPlaying = false;
        window.timeTravelManager.computePayout();
        lastResult = `${name.replace('prestige-', '')}: test save loaded and PAUSED for exact payout checks. Choose Resume mining to play; no refresh needed. Starts with 500 earned diamonds.`;
    }

    function repairLegacyPresetStarter() {
        const g = window.game;
        const index = g.pickaxeInventory.findIndex(item => item && item.instanceId === 'timeline_paw' && item.isPaw
            && item.name === g.defaultPickaxe.name && item.idleSprite === g.defaultPickaxe.idleSprite);
        if (index < 0) return;
        const old = g.pickaxeInventory[index];
        const starter = (g.timelineNumber || 1) > 1 || (g.pickaxeInventory.length === 1 && g.dogecoins === 0)
            ? TimeTravelManager.createStartingPaw() : { ...g.defaultPickaxe };
        g.pickaxeInventory[index] = starter;
        if (g.equippedPickaxeId === old.instanceId) g.equipPickaxe(starter.instanceId);
        window.saveManager.saveGame(false);
    }

    function updateTestBanner() {
        const banner = document.getElementById('parity-test-banner');
        if (!banner || !active()) return;
        const state = window.game?.isPlaying ? 'MINING' : 'PAUSED';
        const text = window.innerWidth <= 768
            ? `CHECKPOINT ${window.CEParityTesting.checkpoint} · ${state} · MUTED · CLOUD OFF · CTRL+\\`
            : `CHECKPOINT ${window.CEParityTesting.checkpoint} TEST SAVE · ${state} · MUTED · CLOUD OFF · CTRL+\\ TOOLS`;
        if (banner.textContent !== text) banner.textContent = text;
    }

    function bonusPreset(name) {
        const timeline = name === 'bonus-timeline-2' ? 2 : 1;
        const max = { 'bonus-mars': 3, 'bonus-titan': 5 }[name] || 1;
        const data = scenarioSave({ timeline, zeroDps: true });
        data.unlockedLevels = PLANETS.slice(0, max); data.bonusCoinMaxPlanetLevel = max;
        data.hasPlayedMoonLaunch = max > 1; data.cutscenes.moonLaunch = max > 1;
        const count = name === 'bonus-early' ? 9 : 1;
        for (let index = 0; index < count; index++) {
            const helper = { type: 'miningShibe', name: `Bonus tester ${index + 1}`,
                dps: window.shopManager.getCurrentHelperUpgradeInfo('miningShibe').dps };
            data.helpers.push(helper);
            data.earthPlacedHelpers.push({ ...helper, id: 3e9 + index, x: 120 + (index % 3) * 40,
                y: 155 + Math.floor(index / 3) * 35, isMining: false });
        }
        apply(data); window.game.isPlaying = false;
        lastResult = name === 'bonus-early' ? 'Nine Mining Shibes, no previous bonus. Resume mining: the early coin appears within one second and lasts eight seconds.'
            : `Paused · eligible tiers ${window.game.getUnlockedBonusCoinTiers().map(tier => tier.level).join(', ')}. Spawn a weighted coin or test a selected tier. Claims work while the mining simulation is paused.`;
    }

    function rickPreset() {
        const g = window.game, field = document.getElementById('left-panel');
        const data = scenarioSave({ zeroDps: true });
        data.unlockedLevels = ['earth']; data.bonusCoinEarlyOffered = true;
        const center = { x: Math.max(110, field.offsetWidth * .43), y: Math.min(240, field.offsetHeight * .4) };
        const radius = g.getRickAuraRadius();
        function add(type, count, x, y, groupId) {
            const dps = window.shopManager.getCurrentHelperUpgradeInfo(type).dps;
            for (let index = 0; index < count; index++) {
                const helper = { type, dps, name: `${groupId} ${index + 1}` };
                data.helpers.push(helper);
                data.earthPlacedHelpers.push({ ...helper, id: 4e9 + data.earthPlacedHelpers.length,
                    x, y, groupId, isMining: false });
            }
        }
        add('miningShibe', 4, center.x + 55, center.y - 15, 'Near Shibes');
        add('miningShibe', 2, Math.min(field.offsetWidth - 40, center.x + radius + 55), center.y - 15, 'Far Shibes');
        add('dogeKennels', 1, center.x - 100, center.y - 30, 'Near Kennel');
        // Unplaced helpers contribute ordinary income, never the nearby aura.
        for (let index = 0; index < 2; index++) data.helpers.push({ type: 'miningShibe', name: `Unplaced ${index + 1}`,
            dps: window.shopManager.getCurrentHelperUpgradeInfo('miningShibe').dps });
        apply(data); g.dropRick(center.x - 30, center.y - 30); g.isPlaying = false;
        lastResult = 'Paused Rick sample · 30s visit. Drag Rick or the near ×4 group: green strokes and DPS update immediately. Unplaced/far helpers receive no aura. Reload or load another preset to clear Rick.';
    }

    function historyPreset(name) {
        const g = window.game, timeline = name === 'history-many' ? 31 : name === 'history-legacy' ? 5 : name === 'history-stacked' ? 2 : 1;
        const data = scenarioSave({ timeline, zeroDps: true });
        data.dogecoins = 1e6; data.totalMined = timeline === 1 ? 2e6 : 9e12;
        data.totalClicks = 1234; data.dogediamonds = 500; data.dogediamondsEverObtained = 500;
        data.diaMissionSeenOnce = true; data.bonusCoinEarlyOffered = true;
        data.statistics = { ...data.statistics, totalPlayTime: 172800, startTime: Date.now() };
        const starter = timeline > 1 ? TimeTravelManager.createStartingPaw() : { ...g.defaultPickaxe };
        data.pickaxeInventory = [starter]; data.equippedPickaxeId = starter.instanceId;
        const patron = g.fortuneFactory.generateSpecialFortune('badge_of_patronage');
        const ordinary = g.fortuneFactory.generateSpecialFortune('bronze_doge_fortune');
        if (!patron || !ordinary) throw new Error('The source Fortune templates have not loaded. Reload this test tab.');
        const apples = [20, 25, 30].map((luck, index) => ({ instanceId: `history-apple-${index}`, templateId: 'poisoned_apple',
            balanceDefinitionId: 'apple', name: 'Poisoned Apple', rarity: 'improved', isProtected: true, isSeasonal: true,
            sprite: 'assets/general/icons/Fortunes/Protected Seasonal/Halloween/Poisoned Apple/poisonedapple.webp',
            description: 'An earned seasonal Fortune retained across timelines.',
            stats: [{ name: 'luck', balanceKey: 'luck', displayName: 'Luck', indicator: '+%', value: luck },
                { name: 'lootfind', balanceKey: 'loot', displayName: 'Loot Find', indicator: '+%', value: 20 + index * 5 },
                { name: 'holidayspirit', balanceKey: 'spirit', displayName: 'Holiday Spirit', indicator: '+', value: 120 + index * 100 }] }));
        data.fortuneInventory = [{ ...patron, instanceId: 'history-patron-1' }, { ...patron, instanceId: 'history-patron-2' },
            ...apples, { ...ordinary, instanceId: 'history-normal' }];
        if (timeline > 1) {
            data.fortuneInventory.push({ instanceId: 'history-alpha-super', templateId: 'super_fortune', name: 'Super Fortune', rarity: 'legendary',
                isSuperFortune: true, isProtected: true,
                sprite: 'assets/general/icons/Fortunes/Protected Non Seasonal/Super Fortune/superfortune.webp',
                stats: [{ name: 'luck', balanceKey: 'luck', displayName: 'Luck', indicator: '+%', value: 999 },
                    { name: 'dps', balanceKey: 'persec', displayName: 'DPS', indicator: '+', value: 123456 }] });
        }
        if (name === 'history-stacked') {
            data.fortuneInventory = TimeTravelManager.consolidateFortunes(data.fortuneInventory);
            data.fortuneInventory.push({ ...patron, instanceId: 'history-patron-3' }, { ...apples[0], instanceId: 'history-apple-extra' });
        }
        if (name !== 'history-legacy') {
            data.timelineProgress = { version: 1, trackingStartedTimeline: 1,
                current: { timeline, earnedCoins: 2e6, minedAtSync: data.totalMined, playTimeMs: 65000, estimated: false },
                completed: Array.from({ length: timeline - 1 }, (_, index) => ({ timeline: index + 1, coins: (index + 1) * 1e6,
                    earnedCoins: (index + 2) * 2e6, playTimeMs: (index + 1) * 65000,
                    choice: index % 2 ? 'go_home' : 'attack', badge: ['luck', 'wow', 'loot'][index % 3], diamonds: index + 2,
                    completedAt: Date.now() - (timeline - index) * 3600000, estimated: false })) };
        }
        apply(data); g.isPlaying = false; window.timeTravelManager.computePayout();
        lastResult = name === 'history-legacy' ? 'Veteran Alpha sample: lifetime totals retained, earlier history unavailable, current-run income marked as a known lower bound.'
            : 'Paused history/merge sample. View the inventory before reviewing rewards, then inspect combined copies and the saved timeline record.';
    }

    function storyPreset(name) {
        const g = window.game, timeline = name === 'story-timeline-2' ? 2 : 1;
        const data = scenarioSave({ planet: 'mars', timeline, zeroDps: true });
        data.helpers = []; data.moonHelpers = []; data.marsHelpers = [];
        data.unlockedLevels = ['earth', 'moon', 'mars']; data.hasPlayedMoonLaunch = true;
        data.bonusCoinMaxPlanetLevel = 3; data.bonusCoinSeenLevel = 6; data.bonusCoinEarlyOffered = true;
        data.hasSeenDogebagIntro = true;
        data.pickaxeInventory = [timeline > 1 ? TimeTravelManager.createStartingPaw() : { ...g.defaultPickaxe }];
        data.equippedPickaxeId = data.pickaxeInventory[0].instanceId;
        const count = name === 'story-four' ? 4 : 5;
        data.marsHelpers.push({ type: 'marsBase', name: 'Royalty test base', dps: window.shopManager.getCurrentHelperUpgradeInfo('marsBase').dps });
        data.marsPlacedHelpers.push({ ...data.marsHelpers[0], id: 5e9, x: 80, y: 175, isMining: false });
        for (let index = 0; index < count; index++) {
            const helper = { type: 'djKittenz', name: `Royalty DJ ${index + 1}`, dps: window.shopManager.getCurrentHelperUpgradeInfo('djKittenz').dps };
            data.marsHelpers.push(helper);
            data.marsPlacedHelpers.push({ ...helper, id: 5e9 + index + 1, x: 170, y: 205, groupId: 'royalty-djs', isMining: false });
        }
        data.timelineProgress = { version: 1, trackingStartedTimeline: timeline,
            current: { timeline, earnedCoins: data.totalMined, minedAtSync: data.totalMined, playTimeMs: name === 'story-short' ? 729000 : 730000, estimated: false }, completed: [] };
        data.storyProgress = { version: 1, timeline, seen: [], pending: [], extraDps: 0 };
        if (name === 'story-claimed') Object.assign(data.storyProgress, { seen: ['hitsong', 'hitsng'], extraDps: window.DogeMinerStories.royaltyAmount(timeline) });
        if (name === 'story-pending' || name === 'story-offline') data.storyProgress.pending = ['hitsong'];
        if (name === 'story-suppressed') data.settings.storiesEnabled = false;
        if (name === 'story-offline') data.timestamp = Date.now() - 3600000;
        apply(data); g.isPlaying = false;
        if (name === 'story-offline') {
            g.isPlaying = true; g.showPendingOfflineEarningsReport(); revealTestView();
            lastResult = 'The existing Welcome Back receipt goes first. Closing it allows the queued royalty story. Its 800 DPS is granted only on the saved story completion.';
        } else lastResult = `${count} DJs · timeline ${timeline} · PAUSED. Resume to use the real 8.2s arrival gate, or pass that delay and Step story check. ${name === 'story-short' ? 'Add one mining second to reach 730s.' : name === 'story-claimed' ? 'Royalties are already earned; further checks cannot pay again.' : name === 'story-suppressed' ? 'Stories are suppressed; completion still saves the reward.' : name === 'story-pending' ? 'Reload to resume the saved pending story.' : ''}`;
    }

    function revealTestView() { if (document.getElementById('debug-console')) window.toggleDebugMode(); }

    function previewDiscovery(scene) {
        const g = window.game, arrival = { 'moon-arrival': ['earth', 'moon', 'moon1'],
            'mars-arrival': ['moon', 'mars', 'mars1'], 'jupiter-arrival': ['mars', 'jupiter', 'jupiter1'] }[scene];
        const planet = arrival?.[0] || (scene.startsWith('moon') || scene === 'mars-route' ? 'moon' : 'mars');
        const data = scenarioSave({ planet, zeroDps: true });
        data.dogecoins = 1e9; data.totalMined = 1e9;
        data.bonusCoinMaxPlanetLevel = 5; data.bonusCoinSeenLevel = 5; data.bonusCoinEarlyOffered = true;
        data.settings = { ...data.settings, soundEnabled: false, musicEnabled: false, autoPlaceHelpers: true,
            storiesEnabled: true, hintsEnabled: true, newsEnabled: false, notificationsEnabled: false };
        const activeStories = arrival ? [arrival[2]] : { 'moon-map': ['moon2'], 'mars-route': ['moon3'],
            'mars-drawing': ['marsdraw'], 'jupiter-route': ['mars2', 'mars3'] }[scene];
        data.storyProgress = { version: 1, timeline: 1, seen: ['tothemoon', 'bonus',
            ...DISCOVERY_STORIES.filter(id => !activeStories.includes(id))], pending: [], extraDps: 0 };
        const max = PLANETS.indexOf(arrival?.[1] || planet);
        data.unlockedLevels = PLANETS.slice(0, max + 1); data.hasPlayedMoonLaunch = true; data.cutscenes.moonLaunch = true;
        function own(location, type, amount = 1, place = false) {
            const category = location === 'earth' ? 'helpers' : `${location}Helpers`, info = window.shopManager.getCurrentHelperUpgradeInfo(type);
            const field = document.getElementById('left-panel'), groups = new Set(data[`${location}PlacedHelpers`].map(item => item.type)).size;
            for (let index = 0; index < amount; index++) {
                const helper = { type, dps: info.dps, name: `${info.name} ${index + 1}` }; data[category].push(helper);
                if (place) data[`${location}PlacedHelpers`].push({ ...helper, id: 7e9 + PLANETS.indexOf(location) * 1e6 + data[category].length,
                    x: 65 + groups * 65, y: Math.max(180, field.offsetHeight * .32) + groups * 20,
                    isMining: false, ...(amount > 1 ? { groupId: `discovery-${type}` } : {}) });
            }
        }
        own('earth', 'spaceRocket');
        if (max >= 2) own('moon', 'marsRocket');
        if (max >= 3) own('mars', 'jupiterRocket');
        if (scene === 'moon-map') { own('moon', 'moonBase', 1, true); own('moon', 'moonShibe', 6, true); own('moon', 'dogeCar', 3, true); }
        if (scene === 'mars-route') { own('moon', 'moonBase', 1, true); own('moon', 'landerShibe', 1, true); }
        if (scene === 'mars-drawing') { own('mars', 'marsBase', 1, true); own('mars', 'curiosiDoge', 3, true); }
        if (scene === 'jupiter-route') { own('mars', 'marsBase', 1, true); own('mars', 'spaceBass', 1, true); }
        const world = window.DogeMinerWorldDiscovery.legacy(data);
        for (const [key, item] of Object.entries(world.artifacts)) if (scene !== `${key === 'moon' ? 'moon-map' : 'mars-drawing'}`) item.stage = 'collected';
        data.worldDiscovery = world;
        window.notificationManager?.clearAll(); apply(data, { discovery: true }); g.isPlaying = true;
        if (window.uiManager.mobileMenuOpen) window.uiManager.toggleMobileMenu();
        if (g.isMobileDevice()) window.uiManager.switchMobileTab('shop'); else window.switchMainTab('shop');
        window.uiManager.updateMobilePlanetDisplay(); g.syncWorldDiscoveryUI();
        selectedFeature = scene; localStorage.setItem('parity:feature', scene); revealTestView();
        if (arrival) {
            window.switchPlanet(arrival[1]);
            lastResult = 'Travel opens the arrival message. Close it to see the destination, then show the feature again to replay.';
        } else if (scene === 'moon-map' || scene === 'mars-drawing') {
            g.advanceWorldDiscovery(1000);
            lastResult = 'Watch the clue drop beside the rock. Hover, click/tap or press controller X to collect it and read its story. Refresh before collection to check recovery.';
        } else {
            g.advanceWorldDiscovery(1000);
            lastResult = scene === 'mars-route' ? 'The Lander discovers Mars. Close OCEANS?, then buy the Mars Rocket and select Mars to travel.'
                : 'Space Bass discovers Jupiter. Close GOOD VIBRATIONS, then THE BIGGEST YET. The rocket stays locked until the first message is closed; buy it to travel.';
        }
    }

    function previewProgression(scene) {
        const g = window.game;
        if (scene === 'popup-layout') {
            run('beta-offline', { planet: 'mars' });
            g.notificationsEnabled = false;window.notificationManager?.clearAll();
            g.showPendingBetaMigrationReport();
            lastResult = 'Review the compact Beta roundup, then Welcome Back. Close each to see the zoom out. Both follow the game panels when resized.';
        } else {
            const planet = scene === 'dia-contact' ? 'earth' : scene === 'rig-invention' ? 'mars' : 'jupiter';
            const target = { 'rig-invention': 'timemachine', 'dia-contact': 'dia', 'titan-sensors': 'titan1', 'titan-route': 'titan2' }[scene];
            const data = scenarioSave({ planet, zeroDps: true });
            data.dogecoins = data.totalMined = 1e15;
            data.settings = { ...data.settings, soundEnabled: false, musicEnabled: false, autoPlaceHelpers: true,
                storiesEnabled: true, hintsEnabled: true, newsEnabled: false, notificationsEnabled: false };
            data.storyProgress = { version: 1, timeline: 1, seen: ['tothemoon', 'bonus', ...DISCOVERY_STORIES,
                ...PROGRESSION_STORIES.filter(id => id !== target)], pending: [], extraDps: 0 };
            const max = PLANETS.indexOf(planet);
            data.unlockedLevels = PLANETS.slice(0, max + 1);data.hasPlayedMoonLaunch = true;data.cutscenes.moonLaunch = true;
            function own(location, type, amount = 1, place = false) {
                const category = location === 'earth' ? 'helpers' : `${location}Helpers`;
                const info = window.shopManager.getCurrentHelperUpgradeInfo(type);
                for (let index = 0; index < amount; index++) {
                    const helper = { type, dps: info.dps, name: `${info.name} ${index + 1}` };data[category].push(helper);
                    if (place) data[`${location}PlacedHelpers`].push({ ...helper, id: 8e9 + data[category].length,
                        x: 80, y: Math.max(200, document.getElementById('left-panel').offsetHeight * .38),
                        isMining: false, ...(amount > 1 ? { groupId: `progression-${type}` } : {}) });
                }
            }
            if (max >= 1) own('earth', 'spaceRocket');
            if (max >= 2) own('moon', 'marsRocket');
            if (max >= 3) own('mars', 'jupiterRocket');
            if (scene === 'rig-invention') { own('mars', 'marsBase');own('mars', 'partyShibe', 25, true); }
            if (scene === 'dia-contact') own('earth', 'timeMachineRig', 1, true);
            if (scene.startsWith('titan-')) own('jupiter', 'cloudBase', 1, true);
            if (scene === 'titan-sensors') data.helperUpgradeLevels.cloudBase = 1;
            if (scene === 'titan-route') own('jupiter', 'dogeStar');
            const world = window.DogeMinerWorldDiscovery.fresh(1);
            world.unlocked = PLANETS.slice(0, max + 1);world.visited = [...world.unlocked];
            world.known = [...new Set(['earth', 'moon', ...world.unlocked])];
            if (max >= 2) world.routes.mars.stage = 'ready';
            if (max >= 3) world.routes.jupiter.stage = 'ready';
            if (scene !== 'rig-invention') world.events.rig.stage = 'ready';
            for (const item of Object.values(world.artifacts)) item.stage = 'collected';
            data.worldDiscovery = world;
            // Keep this private preview focused while helpers demonstrate the
            // real count gates; no unrelated rock loot interrupts the story.
            data.planetRockData[planet] = { rocksBroken: 0, rockLevel: 1, currentHP: 1e12, maxHP: 1e12 };
            data.bonusCoinMaxPlanetLevel = data.bonusCoinSeenLevel = 5;data.bonusCoinEarlyOffered = true;
            window.notificationManager?.clearAll();apply(data, { discovery: true });
            if (window.uiManager.mobileMenuOpen) window.uiManager.toggleMobileMenu();
            if (g.isMobileDevice()) window.uiManager.switchMobileTab('shop');else window.switchMainTab('shop');
            g.isPlaying = true;
            if (scene === 'dia-contact') g._storyLocationStartedAt = Date.now() - 11001;
            g.advanceWorldDiscovery(1000);g.advanceStoryEvents(500);
            lastResult = scene === 'rig-invention' ? '25 Party Shibes trigger the invention. Close TIME MINER, then return to Earth to see the rig unlocked before Jupiter.'
                : scene === 'dia-contact' ? 'The arrival clock has passed eleven seconds. Close the introduction, then click the Dogetalkie to open the mission brief.'
                : scene === 'titan-sensors' ? 'Sensor Package discovers Titan. Close the story and click/tap its locked planet tab.'
                : 'DogeStar opens the Titan route without Sensor Package. Close the story, then select Titan to travel.';
        }
        selectedFeature = scene;localStorage.setItem('parity:feature', scene);revealTestView();
    }

    function previewInventory(scene) {
        const g = window.game, data = scenarioSave({ zeroDps: true });
        data.settings = { ...data.settings, newsEnabled: false, notificationsEnabled: false };
        const context = { planet: 'earth', highestPlanet: 'earth', tier: 1, wow: 50, timeline: 1 };
        const fortune = (id, rng = () => .5) => {
            const template = Object.values(g.fortuneFactory.templates).find(item => item.balanceDefinitionId === id);
            if (!template) throw new Error(`Missing fortune ${id}`);
            return g.fortuneFactory.generateFromTemplate(template.id, context, rng);
        };
        const pickaxe = id => {
            const template = Object.values(g.pickaxeFactory.templates).find(item => item.balanceDefinitionId === id);
            if (!template) throw new Error(`Missing pickaxe ${id}`);
            return g.pickaxeFactory.generatePickaxe(template.id, 100, 50, context, () => .5);
        };
        const restored = ['map2', 'redgem', 'greengem', 'largegem'].map(id => fortune(id));
        if (scene !== 'inventory-unread') {
            data.fortuneInventory = [...restored];
            const staff = pickaxe('staff'); data.pickaxeInventory.push(staff); data.equippedPickaxeId = staff.instanceId;
            const extra = fortune('map2', () => 0); extra.instanceId += '-discipline'; data.fortuneInventory.push(extra);
        }
        if (scene === 'inventory-colors') {
            data.fortuneInventory = [{ ...restored[1], instanceId: 'attribute-preview', name: 'Attribute preview',
                description: 'Test fixture showing the source attribute palette.',
                stats: ['highground', 'discipline', 'dancing', 'morale', 'mystery', 'wow', 'rockets'].map(balanceKey => {
                    const m = window.DogeMinerBalance.getAttributeMetadata({ balanceKey });
                    return { balanceKey, name: balanceKey, displayName: m.title, value: 42,
                        indicator: m.suffix === '%' ? '-%' : m.value === '%' ? '+%' : '+' };
                }) }];
        }
        if (scene === 'mystery-fortunes') {
            data.fortuneInventory = restored; data.mysteryBoxObtained = true; data.mysteryBoxCycle = 10;
            data.mysteryBoxTimerRemaining = 0;
        }
        window.notificationManager?.clearAll(); apply(data); g.isPlaying = false;
        if (window.uiManager.mobileMenuOpen) window.uiManager.toggleMobileMenu();
        if (g.isMobileDevice()) window.uiManager.switchMobileTab('shop'); else window.switchMainTab('shop');
        if (scene === 'inventory-unread') {
            for (const id of ['3', '9']) g.grantDogebagReward({ type: 'pickaxe', item: pickaxe(id) });
            for (const item of restored.slice(0, 2)) g.grantDogebagReward({ type: 'fortune', item });
            lastResult = 'Two new pickaxes and two fortunes. Open each inventory to clear only its badge; reload to verify the counts stay cleared.';
        } else {
            g.openFortuneModal();
            document.querySelector('#fortune-modal .switcher-modal-content').scrollTop = 0;
            document.getElementById('fortune-stats-sidebar').scrollTop = 0;
            if (['inventory-totals', 'inventory-explanations'].includes(scene)) {
                document.getElementById('fortune-stats-sidebar').classList.add('mobile-open');
                if (scene === 'inventory-explanations') {
                    const details = document.querySelector('#fortune-stats-content details'); details.open = true;
                    requestAnimationFrame(() => details.scrollIntoView({ block: 'center' }));
                }
            }
            if (scene === 'inventory-colors') {
                requestAnimationFrame(() => g._showInventoryTooltip(document.querySelector('#fortune-grid .inventory-item-tile')));
            }
            lastResult = scene === 'mystery-fortunes' ? 'Inspect the four restored fortunes. Close inventory, then open the ready Mystery Box to review its two-item animation.'
                : scene === 'inventory-colors' ? 'Hover/tap Attribute preview: Higher Ground is sand, Discipline/Dancing blue, Helper Morale cyan and Mystery dark blue.'
                : scene === 'inventory-explanations' ? 'Stats Explained is expanded. Review Wow, Loot Find and critical hits; Mystery stays cryptic.'
                : 'Review Mystery, Staff total DPS and summed flavor attributes. The sidebar scrolls; flavor stats are labeled separately.';
        }
        window.saveManager.saveGame(false); selectedFeature = scene; localStorage.setItem('parity:feature', scene); revealTestView();
    }

    function previewFieldLoot(scene) {
        const g = window.game, data = scenarioSave({ zeroDps: true });
        data.settings = { ...data.settings, newsEnabled: false, notificationsEnabled: false };
        data.helpers = [{ type: 'spaceRocket', dps: 9, name: 'Checkpoint Rocket' }];
        data.unlockedLevels = ['earth', 'moon']; data.hasSeenDogebagIntro = false;
        if (scene === 'diamond-stacks') data.diamondStacks = { earth: 3, moon: 7 };
        apply(data); g.isPlaying = false; window.notificationManager?.clearAll();
        if (window.uiManager.mobileMenuOpen) window.uiManager.toggleMobileMenu();
        if (g.isMobileDevice()) window.uiManager.switchMobileTab('shop'); else window.switchMainTab('shop');
        if (scene === 'diamond-stacks') {
            g.createDiamondLoot();
            lastResult = 'Four unclaimed diamonds on Earth and seven on Moon. Travel or refresh before collecting; click/tap or controller X claims the stack once.';
        } else if (scene === 'coin-expiry' || scene === 'bag-gather') {
            for (const [index, amount] of [21, 32, 47].entries()) {
                g.createCoinPile(amount, g.getCoinPileSprite(20), 20, index, 3);
            }
            {
                const panel = document.getElementById('left-panel').getBoundingClientRect();
                const field = document.getElementById('rock-container'), rect = field.getBoundingClientRect();
                const ratio = rect.width / field.offsetWidth || 1;
                document.querySelectorAll('.coin-pile').forEach((node, index) => {
                    const x = panel.left + panel.width * (.4 + .2 * index);
                    const y = Math.min(panel.bottom, innerHeight - (innerWidth <= 768 ? 80 : 0)) - 50 - (index % 2) * 20;
                    node._coinSpawn?.cancel(); node._coinBob?.cancel();
                    node.style.left = (x-rect.left)/ratio+'px'; node.style.top = (y-rect.top)/ratio+'px';
                    node.style.transform = 'translate(-50%,-50%)'; node.style.opacity = '1';
                    node._fieldLanded = true; node._helperGrabAt = (g._helperLootClock || 0) + 1800;
                });
            }
            if (scene === 'bag-gather') {
                // Hold this demonstration's coins so the reviewer can inspect
                // the interaction. The separate expiry preview uses real timing.
                document.querySelectorAll('.coin-pile').forEach(node => clearTimeout(node._coinTimer));
                g.createDogebag();
                lastResult = 'Click a coin to collect just that pile. Opening the Dogebag gathers all remaining coins into the counter. Preview coins wait for review.';
            } else lastResult = 'Watch the real six-second warning and roughly three-second disappearance. Show the feature again to replay.';
        } else {
            const rewards = [], context = { planet: 'earth', highestPlanet: 'earth', tier: 1, wow: 50, timeline: 1 };
            const fortunes = Object.values(g.fortuneFactory.templates).filter(item => !item.isSoulbound && !item.isSuperFortune && !item.isProtected);
            const picks = Object.values(g.pickaxeFactory.templates).filter(item => !item.isStaffOfSundoge);
            for (let index = 0; index < 24; index++) {
                const pick = index % 4 === 0;
                const item = pick ? g.pickaxeFactory.generatePickaxe(picks[index % picks.length].id, 100, 50, context, () => .5)
                    : g.fortuneFactory.generateFromTemplate(fortunes[index % fortunes.length].id, context, () => .5);
                item.instanceId += `-checkpoint-overflow-${index}`;
                rewards.push({ type: pick ? 'pickaxe' : 'fortune', item });
            }
            rewards.splice(1, 0, { type: 'coins', amount: 1234 }, { type: 'coins', amount: 4567 }, { type: 'diamonds', amount: 2 });
            g._checkpointOriginalBagRoll = g.generateDogebagContents;
            const original = g.generateDogebagContents;
            g.generateDogebagContents = function (...args) {
                const reward = rewards.shift();
                if (!rewards.length) { this.generateDogebagContents = original; delete this._checkpointOriginalBagRoll; }
                return reward || original.apply(this, args);
            };
            g.dogebagStacks = { earth: { 0: rewards.length } }; g._dogebagFieldPlanet = null; g.syncDogebagField();
            lastResult = 'Open the 27-bag pile: 24 items plus consolidated currency. The tray shows 10 item minis on desktop or 4 on phone, then +N. All items remain reviewable.';
        }
        window.saveManager.saveGame(false); selectedFeature = scene; localStorage.setItem('parity:feature', scene); revealTestView();
    }

    function previewHelperLoot(scene) {
        if (scene === 'diamond-layers') {
            previewFieldLoot('diamond-stacks');
            // This fixture owns a rocket for Moon travel; keep its restored
            // sprite visible in short landscape panels as well.
            const g = window.game, field = document.getElementById('helper-container'), r = field.getBoundingClientRect();
            const ratio = r.width / field.offsetWidth || 1;
            const height = (Math.min(r.bottom, innerHeight - (innerWidth <= 768 ? 70 : 0)) - r.top) / ratio;
            for (const helper of g.placedHelpers) { helper.x = Math.max(20, field.offsetWidth - 90); helper.y = Math.max(110, Math.min(130, height - 85)); }
            g.refreshHelperField(); window.saveManager.saveGame(false);
            lastResult = 'Both tinted copies sit behind the main diamond, with source-scaled offsets and count placement. Earth has four, Moon seven.';
        } else {
            const g = window.game, data = scenarioSave({ zeroDps: true });
            data.settings.storiesEnabled = false; data.settings.newsEnabled = false; data.settings.notificationsEnabled = false;
            apply(data); g.isPlaying = false; window.notificationManager?.clearAll();
            if (window.uiManager.mobileMenuOpen) window.uiManager.toggleMobileMenu();
            if (g.isMobileDevice()) window.uiManager.switchMobileTab('shop'); else window.switchMainTab('shop');
            if (scene === 'field-motion') {
                for (const [index, percent] of [10, 35, 70].entries()) g.createCoinPile(30 + index * 20, g.getCoinPileSprite(percent), percent);
                lastResult = 'Coins ease out from the rock, settle into a gentle bob and share the bag hover lift/lean on desktop. These use ordinary expiry.';
            } else {
                const field = document.getElementById('helper-container'), r = field.getBoundingClientRect(), ratio = r.width / field.offsetWidth || 1;
                const visibleHeight = (Math.min(r.bottom, innerHeight - (innerWidth <= 768 ? 70 : 0)) - r.top) / ratio;
                document.documentElement.classList.add('parity-helper-field-preview');
                const phone = innerWidth <= 768;
                const platform = document.getElementById('platform').getBoundingClientRect();
                const x = phone ? 30 : Math.max(35, Math.min(75, field.offsetWidth * .18));
                const y = phone ? Math.max(140, Math.min(visibleHeight - 60, (platform.bottom - r.top) / ratio + 20)) : Math.max(140, visibleHeight - 190);
                const grouped = scene === 'helper-seeking', names = grouped ? ['Pixel', 'Orbit', 'Waffles'] : ['Pixel'];
                const helper = g.getHelperData('miningShibe');
                g.helpers = names.map(name => ({ type: 'miningShibe', name, dps: helper.baseDps }));
                g.placedHelpers = names.map((name, index) => ({ id: 11e9 + index, type: 'miningShibe', name, helper,
                    dps: helper.baseDps, x, y, ...(grouped ? { groupId: 'checkpoint-seeking' } : {}) }));
                g.refreshHelperField();
                const fieldRect = document.getElementById('rock-container').getBoundingClientRect();
                const rockScale = fieldRect.width / document.getElementById('rock-container').offsetWidth || 1;
                for (let index = 0; index < (grouped ? 1 : 3); index++) {
                    const node = g.createCoinPile(50, g.getCoinPileSprite(20), 20);
                    node._coinSpawn?.cancel(); node.style.transform = 'translate(-50%,-50%)'; node.style.opacity = '1';
                    const targetX = r.left + (x + 15 + (grouped ? 60 : 22)) * ratio;
                    const targetY = r.top + (y + 15 + (grouped ? 0 : (index - 1) * 7)) * ratio;
                    node.style.left = (targetX - fieldRect.left) / rockScale + 'px'; node.style.top = (targetY - fieldRect.top) / rockScale + 'px';
                    node._fieldLanded = true; node._helperGrabAt = (g._helperLootClock || 0) + 1800;
                    // Let the seeking demonstration remain available for review.
                    if (grouped) clearTimeout(node._coinTimer);
                }
                g.rockMaxHP = g.rockCurrentHP = 1e30; g.isRockRegenerating = false; g._helperLootPoll = 0; g.isPlaying = true;
                lastResult = grouped ? 'Watch the grouped Shibes hop toward the coin, then collect it. Pixel, Orbit and Waffles stay in the group; ungroup to inspect them. Preview coin waits for review.'
                    : 'After the normal landing delay, the Shibe dips to collect nearby piles, one each poll. Reopen this preview to replay.';
            }
            window.saveManager.saveGame(false);
        }
        selectedFeature = scene; localStorage.setItem('parity:feature', scene); revealTestView();
    }

    function previewAutomation(scene) {
        const g = window.game, data = scenarioSave({ timeline:scene === 'buy-max' ? 1 : 2, zeroDps:true });
        data.settings.storiesEnabled = false; data.settings.newsEnabled = false;
        data.bonusCoinSeenLevel = 6; data.bonusCoinEarlyOffered = true;
        if (scene !== 'auto-unlock') data.settings.notificationsEnabled = false;
        if (scene === 'auto-unlock') data.lootAutomation = null;
        else if (scene !== 'buy-max') data.lootAutomation.enabled = true;
        if (scene === 'buy-max') { data.dogecoins = data.totalMined = 2200; data.settings.autoPlaceHelpers = false; }
        apply(data); window.notificationManager?.clearAll();
        g.rockMaxHP = g.rockCurrentHP = 1e30; g.isRockRegenerating = false;
        if (window.uiManager.mobileMenuOpen) window.uiManager.toggleMobileMenu();
        if (scene === 'auto-settings' || scene === 'buy-max') {
            const tab = scene === 'auto-settings' ? 'settings' : 'shop';
            if (g.isMobileDevice()) { window.uiManager.switchMobileTab(tab); window.uiManager.toggleMobileMenu(); }
            else window.switchMainTab(tab);
            g.syncAutoPickupSettings();
            if (scene === 'buy-max') g.isPlaying = false;
        } else if (scene === 'auto-drops') {
            // This demonstration contains only newly dropped, automatically claimed bags.
            const context = {planet:'earth',timeline:2,wow:50,highestPlanet:'earth',tier:1};
            const template = g.pickaxeFactory.templates.earth_golden_pickaxe;
            const pick = g.pickaxeFactory.generatePickaxe(template.id,100,50,context,()=>.5);
            const fortuneTemplate = g.fortuneFactory.templates.bronze_doge_fortune;
            const fortune = g.fortuneFactory.generateFromTemplate(fortuneTemplate.id,context,()=>.5);
            const rewards = [{type:'pickaxe',item:pick},{type:'fortune',item:fortune},{type:'coins',amount:250},{type:'diamonds',amount:2}];
            g._checkpointOriginalBagRoll = g.generateDogebagContents;
            const original = g.generateDogebagContents;
            g.generateDogebagContents = function(...args) {
                const reward = rewards.shift();
                if (!rewards.length) { this.generateDogebagContents = original; delete this._checkpointOriginalBagRoll; }
                return reward || original.apply(this,args);
            };
            g.createDogebag();
            const epoch=g._currencyFlightEpoch||0;
            for(let index=1;index<4;index++) g._checkpointAutoDropsTimers.push(setTimeout(()=>{
                if(epoch===(g._currencyFlightEpoch||0)&&selectedFeature===scene)g.createDogebag();
            },index*1200));
            g.createCoinPile(77,g.getCoinPileSprite(20),20); g.createDiamondLoot();
        }
        const messages = {
            'auto-unlock':'Timeline 2: wait seven active seconds for the real unlock notification. Auto-pickup then turns on; Settings can turn it off.',
            'auto-drops':'New loot collects automatically. The new pickaxe equips, items fly to inventory, and currencies fly to their counters. Every demo bag clears. Reopen to replay.',
            'auto-settings':'Toggle Auto-Pickup Loot, then refresh: the choice stays saved. Desktop and phone use the same option. Supporter remains reachable below.',
            'buy-max':'Hold a helper buy button for half a second, slide up into BUY MAX and release. Or release on the original button for one, then click the briefly lingering option.'
        };
        lastResult = messages[scene]; window.saveManager.saveGame(false);
        selectedFeature=scene;localStorage.setItem('parity:feature',scene);revealTestView();
    }

    function previewHelperShopDetails(scene) {
        const planet=scene==='helper-breakdown'?'mars':'earth',g=window.game,data=scenarioSave({planet,zeroDps:true});
        data.settings.storiesEnabled=false;data.settings.newsEnabled=false;data.settings.notificationsEnabled=false;
        const type=planet==='mars'?'marsBase':'miningShibe',category=planet==='mars'?'marsHelpers':'helpers';
        data.helperUpgradeLevels={[type]:1};data[category]=Array.from({length:3},()=>({type,dps:window.shopManager.getCurrentHelperUpgradeInfo(type).dps}));
        const field=document.getElementById('helper-container'),rect=field.getBoundingClientRect(),ratio=rect.width/field.offsetWidth||1;
        const visibleHeight=(Math.min(rect.bottom,innerHeight-(g.isMobileDevice()?70:0))-rect.top)/ratio;
        data[planet+'PlacedHelpers']=data[category].map((h,i)=>({...h,id:13e9+i,name:'Income preview '+(i+1),groupId:'checkpoint-income',
            x:Math.max(15,field.offsetWidth-145),y:Math.max(20,Math.min(field.offsetHeight-145,visibleHeight-145))}));
        const fortune=g.fortuneFactory.generateFromTemplate('bronze_doge_fortune',{planet,timeline:1,wow:1},()=>.5);
        fortune.instanceId='checkpoint-helper-income';fortune.stats=[{name:'income',balanceKey:'income',displayName:'Helper DPS',indicator:'+%',value:100}];
        data.fortuneInventory=[fortune];data.latestObtainedFortune={name:fortune.name,sprite:fortune.sprite};
        data.bonusCoinSeenLevel=6;data.bonusCoinEarlyOffered=true;
        apply(data);g.isPlaying=false;window.notificationManager?.clearAll();
        if(g.isMobileDevice()){window.uiManager.updateMobileShopContent();window.uiManager.switchMobileTab('shop');if(!window.uiManager.mobileMenuOpen)window.uiManager.toggleMobileMenu();}
        else window.switchMainTab('shop');
        g.updateHelperShopDps();selectedFeature=scene;localStorage.setItem('parity:feature',scene);window.saveManager.saveGame(false);revealTestView();
        if(scene==='helper-breakdown')g._checkpointHelperDetailsTimer=setTimeout(()=>{
            if(selectedFeature!==scene)return;
            const anchor=[...document.querySelectorAll('[data-helper-dps]')].find(n=>n.dataset.helperDps===type&&n.getClientRects().length);
            if(anchor){
                const epoch=g._currencyFlightEpoch||0;anchor.scrollIntoView({block:'nearest',behavior:'instant'});
                requestAnimationFrame(()=>requestAnimationFrame(()=>{
                    if(selectedFeature===scene&&epoch===(g._currencyFlightEpoch||0)&&anchor.isConnected)g.showHelperDpsDetails(anchor);
                }));
            }
        },400);
        lastResult=scene==='helper-breakdown'?'Source total, upgraded base and stat-added DPS. Click the gray DPS line to reopen; click outside or press Escape to dismiss.'
            :'Each gray DPS line includes earned Helper DPS boosts and the active Bonus Coin multiplier. Click it to see total, base and stats; the preview is paused.';
    }

    function previewMiningFeedback(scene) {
        const g=window.game,data=scenarioSave({zeroDps:true});
        data.settings.storiesEnabled=false;data.settings.newsEnabled=false;data.settings.notificationsEnabled=false;
        data.bonusCoinSeenLevel=6;data.bonusCoinEarlyOffered=true;
        data.dogecoins=1000;data.totalMined=data.dogecoins;
        const pick={...g.defaultPickaxe,instanceId:'checkpoint-crit-pick',baseDPC:100,
            stats:[{name:'crit',displayName:'Critical Chance',indicator:'+%',value:100}]};
        data.pickaxeInventory=[pick];data.equippedPickaxeId=pick.instanceId;
        data.records={highestcrit:['ordinary-crit','saved-crit'].includes(scene)?2500:0};
        data.planetRockData={earth:{rocksBroken:0,rockLevel:1,currentHP:100000,maxHP:100000}};
        apply(data);g.isPlaying=scene!=='saved-crit';window.notificationManager?.clearAll();
        if(g.isMobileDevice()){
            if(scene==='saved-crit'){window.uiManager.switchMobileTab('achievements');if(!window.uiManager.mobileMenuOpen)window.uiManager.toggleMobileMenu();}
            else if(window.uiManager.mobileMenuOpen)window.uiManager.toggleMobileMenu();
        }else {window.switchMainTab(scene==='saved-crit'?'achievements':'shop');if(scene==='saved-crit')document.getElementById('stats-content').classList.add('active');}
        selectedFeature=scene;localStorage.setItem('parity:feature',scene);window.saveManager.saveGame(false);revealTestView();
        lastResult=scene==='saved-crit'?'Highest Critical Hit is 2.50K in Statistics. Refresh to verify the saved record.'
            :scene==='ordinary-crit'?'Click the rock. This guaranteed 250 critical hit is below the saved 2.50K record, so it uses the ordinary pop.'
            :scene==='balance-flight'?'Click the rock. The wallet is already credited while the HUD waits for the coin to land.'
            :'Click the rock. The first guaranteed 250 critical hit sets a record: 30% larger, dark finish, short recoil. Equal hits use the ordinary pop.';
    }

    function previewStatisticsAndUpgrades(scene) {
        const stats=scene.startsWith('stats-'),timeline=scene==='stats-history'?31:stats&&scene!=='stats-first'?3:1;
        const planet=scene==='upgrade-hover-mars'?'mars':'earth',g=window.game,data=scenarioSave({planet,timeline,zeroDps:true});
        data.settings.storiesEnabled=false;data.settings.newsEnabled=false;data.settings.notificationsEnabled=false;
        data.bonusCoinSeenLevel=6;data.bonusCoinEarlyOffered=true;
        data.dogecoins=stats?3e6:1e12;data.totalMined=9e12;data.highestDps=123456;data.records={highestcrit:1337};
        if(stats){
            data.timelineProgress={version:1,trackingStartedTimeline:1,current:{timeline,earnedCoins:2840000,
                minedAtSync:data.totalMined,playTimeMs:21000,estimated:false},completed:Array.from({length:timeline-1},(_,i)=>({
                    timeline:i+1,coins:(i+1)*1e6,earnedCoins:(i+2)*2e6,playTimeMs:(i+1)*65000,
                    choice:i%2?'go_home':'attack',badge:['luck','wow','loot'][i%3],diamonds:i+2}))};
        }else{
            const types=planet==='mars'?['marsBase','partyShibe']:['miningShibe','dogeKennels'];
            data[planet==='earth'?'helpers':planet+'Helpers']=types.flatMap(type=>Array.from({length:3},()=>({type,dps:window.shopManager.shopData[planet==='earth'?'helpers':planet+'Helpers'][type].baseDps})));
            data.helperUpgradeLevels={};data.helperUpgradeOffers={[planet]:[...types,null]};
            const field=document.getElementById('helper-container'),rect=field.getBoundingClientRect(),ratio=rect.width/field.offsetWidth||1;
            const visibleHeight=(Math.min(rect.bottom,innerHeight-(g.isMobileDevice()?70:0))-rect.top)/ratio;
            data[planet+'PlacedHelpers']=data[planet==='earth'?'helpers':planet+'Helpers'].map((h,i)=>({...h,
                id:15e9+i,name:'Upgrade preview '+(i+1),groupId:'checkpoint-upgrade-'+h.type,
                x:Math.max(15,field.offsetWidth-170-types.indexOf(h.type)*100),
                y:Math.max(20,Math.min(field.offsetHeight-150,visibleHeight-150))}));
        }
        apply(data);g.isPlaying=false;window.notificationManager?.clearAll();
        const tab=stats?'achievements':'upgrades';
        if(g.isMobileDevice()){
            if(stats)window.uiManager.updateMobileAchievementsContent();else window.uiManager.updateMobileUpgradesContent();
            window.uiManager.switchMobileTab(tab);if(!window.uiManager.mobileMenuOpen)window.uiManager.toggleMobileMenu();
        }else {window.switchMainTab(tab);if(stats)document.getElementById('stats-content').classList.add('active');}
        if(stats)for(const n of document.querySelectorAll('#timeline-history,#mobile-timeline-history')){n._timelineLimit=20;n._timelineKey=null;}
        selectedFeature=scene;localStorage.setItem('parity:feature',scene);window.saveManager.saveGame(false);revealTestView();
        const epoch=g._currencyFlightEpoch||0;
        g._checkpointPolishTimer=setTimeout(()=>{
            if(selectedFeature!==scene||(g._currencyFlightEpoch||0)!==epoch)return;
            for(const n of document.querySelectorAll('#achievements-tab,#upgrades-tab,#upgrades-container,#mobile-achievements-content,#mobile-upgrades-content,#mobile-upgrades-container,#mobile-content'))n.scrollTop=0;
            g.updateTimelineHistoryUI();window.uiManager.updateMobileStats();
        },400);
        lastResult=scene==='stats-first'?'Statistics without future feature spoilers. The browser tab keeps the game name.'
            :scene==='stats-compact'?'Current timeline stays first; lifetime stats use compact rows, including Highest Critical Hit.'
            :scene==='stats-history'?'Current timeline stays above lifetime totals. Scroll to expand completed runs or show20 earlier timelines.'
            :'Hover an upgrade card: subtle2px lift, soft shadow and11% highlight. Move away to settle; the empty Searchdoge slot stays still. Phone cards remain static.';
    }

    function previewReturningHistory(scene) {
        const g=window.game,data=scenarioSave({planet:'jupiter',zeroDps:true});
        data.settings={...data.settings,storiesEnabled:true,newsEnabled:true,notificationsEnabled:false};
        data.dogecoins=1e12;data.totalMined=9e12;data.statistics={totalPlayTime:7200,startTime:Date.now()};
        data.bonusCoinClaimCount=3;data.bonusCoinEarlyOffered=true;data.bonusCoinSeenLevel=6;data.bonusCoinMaxPlanetLevel=4;
        data.diaMissionSeenOnce=true;data.hasReachedJupiterEver=true;data.helperUpgradeLevels={};
        data.helperUpgradeOffers={};data.unlockedLevels=['earth','moon','mars','jupiter'];
        const own=(type,n)=>Array.from({length:n},()=>({type,dps:g.getHelperData(type)?.baseDps||0}));
        data.helpers=[...own('miningShibe',3),...own('dogeKennels',1),...own('spaceRocket',1),...own('timeMachineRig',1)];
        data.moonHelpers=[...own('moonShibe',7),...own('dogeCar',3),...own('marsRocket',1)];
        data.marsHelpers=[...own('partyShibe',6),...own('curiosiDoge',3),...own('djKittenz',4),...own('jupiterRocket',1)];
        data.jupiterHelpers=[...own('cloudBase',2),...own('superShibe',2)];
        const field=document.getElementById('helper-container'),r=field.getBoundingClientRect(),scale=r.width/field.offsetWidth||1;
        const height=(Math.min(r.bottom,innerHeight-(g.isMobileDevice()?70:0))-r.top)/scale;
        data.jupiterPlacedHelpers=data.jupiterHelpers.map((h,i)=>({...h,id:16e9+i,name:'Return preview '+(i+1),groupId:'history-'+h.type,
            x:Math.max(15,field.offsetWidth-170-(h.type==='cloudBase'?100:0)),y:Math.max(20,Math.min(field.offsetHeight-150,height-150))}));
        delete data.storyProgress;delete data.worldDiscovery;delete data.timelineProgress;
        apply(data,{legacyHistory:true});g.isPlaying=true;g.isIntroPlaying=false;window.notificationManager?.clearAll();
        window.uiManager.updateMobilePlanetDisplay();
        if(g.isMobileDevice()){window.uiManager.updateMobileShopContent();window.uiManager.switchMobileTab('shop');if(window.uiManager.mobileMenuOpen)window.uiManager.toggleMobileMenu();}
        else window.switchMainTab('shop');
        selectedFeature=scene;localStorage.setItem('parity:feature',scene);window.saveManager.saveGame(false);revealTestView();
        if(scene==='unfinished-story-news'){
            // A new sensor upgrade and then a third Super Shibe cross genuinely
            // unfinished milestones; they use the ordinary story/news pipeline.
            g.checkNewsDoge(Date.now(),()=>0);g.helperUpgradeLevels.cloudBase=1;g.updateDPS();g.updateUI();
            const epoch=g._currencyFlightEpoch||0;
            const afterStory=()=>{
                if(selectedFeature!==scene||(g._currencyFlightEpoch||0)!==epoch)return;
                if(!g.storyProgress.seen.includes('titan1')){g._checkpointHistoryDemoTimer=setTimeout(afterStory,300);return;}
                g.checkNewsDoge(Date.now(),()=>0);g.buyHelper('superShibe');g.checkNewsDoge(Date.now(),()=>0);
            };
            g._checkpointHistoryDemoTimer=setTimeout(afterStory,300);
        }
        lastResult=scene==='returning-save'?'Existing Moon/Mars/Jupiter discoveries stay completed. Stories and NewsDoge are enabled; no old introduction backlog.'
            :'A new sensor upgrade discovers Titan. Close that popup; buying the third Super Shibe then triggers a relevant NewsDoge report.';
    }

    function previewHelperPersonality(scene) {
        const g=window.game,planet=scene==='moon-names'?'moon':scene==='super-names'?'jupiter':scene==='party-names'||scene==='dj-names'?'mars':'earth';
        const type=scene==='moon-names'?'moonShibe':scene==='super-names'?'superShibe':scene==='party-names'?'partyShibe':scene==='dj-names'?'djKittenz':'miningShibe';
        const category=planet==='earth'?'helpers':`${planet}Helpers`,data=scenarioSave({planet,zeroDps:true});
        data.settings={...data.settings,storiesEnabled:false,newsEnabled:false,notificationsEnabled:false,autoPlaceHelpers:true};
        data.dogecoins=1e12;data.totalMined=1e12;
        const base={moon:'moonBase',mars:'marsBase',jupiter:'cloudBase'}[planet];
        const records=[{type,name:'Saved '+(planet==='earth'?'Jerry':'nickname')},{type,name:g.getHelperData(type).name}];
        if(scene==='helper-groups')records.push({type,name:'Saved Terry'});
        if(base)records.push({type:base,name:g.getHelperData(base).name});
        else if(scene==='helper-hover')records.push({type:'dogeKennels',name:'Doge Kennels'});
        data[category]=records.map(h=>({...h,dps:g.getHelperData(h.type).baseDps}));
        data[`${planet}PlacedHelpers`]=records.map((h,i)=>({...h,dps:g.getHelperData(h.type).baseDps,id:17e9+i,x:160+i*30,y:300,
            ...(scene==='helper-groups'?{groupId:'checkpoint17-group'}:{})}));
        apply(data);g.isPlaying=false;g.isIntroPlaying=false;window.notificationManager?.clearAll();
        window.uiManager.updateMobilePlanetDisplay();
        if(g.isMobileDevice()){
            window.uiManager.updateMobileShopContent();window.uiManager.switchMobileTab('shop');
            if(window.uiManager.mobileMenuOpen)window.uiManager.toggleMobileMenu();
        } else window.switchMainTab('shop');
        document.documentElement.classList.add('parity-helper-field-preview');
        if(scene.endsWith('-names')){
            g.buyHelper(type);
            // Phone purchases normally use the grouped bar. Reconstruct their
            // saved field record so this private name preview is inspectable.
            if(g.isMobileDevice())window.saveManager.applySaveData(JSON.parse(JSON.stringify(window.saveManager.createSaveData())));
        }
        const field=document.getElementById('helper-container'),r=field.getBoundingClientRect(),ratio=r.width/field.offsetWidth||1;
        const visible=(Math.min(r.bottom,innerHeight-(g.isMobileDevice()?85:8))-r.top)/ratio;
        let nameIndex=0;
        g.placedHelpers.forEach((h,i)=>{
            const size=g.getHelperDisplaySize(h.type),y=Math.max(110,Math.min(field.offsetHeight-size-30,visible-size-35));
            let x=field.offsetWidth-(g.isMobileDevice()?130:220)+i*18;
            h.y=y+(scene==='helper-hover'?i*5:0);
            if(scene==='helper-groups')x=field.offsetWidth-(g.isMobileDevice()?90:150);
            if(scene.endsWith('-names')){
                x=g.isMobileDevice()?field.offsetWidth*.67-size/2:field.offsetWidth-355+nameIndex*100;
                if(h.type===type)nameIndex++;
                else {x=field.offsetWidth-size-40;h.y=Math.max(110,y-100);}
            }
            h.x=Math.max(18,Math.min(field.offsetWidth-size-20,x));
        });
        g.refreshHelperField();
        if(g.isMobileDevice()&&scene.endsWith('-names')){
            const newest=String(g.placedHelpers.at(-1).id);
            for(const sprite of document.querySelectorAll('.placed-helper'))if(sprite.dataset.helperId!==newest)sprite.style.visibility='hidden';
        }
        g.updateUI(true);window.saveManager.saveGame(false);
        selectedFeature=scene;localStorage.setItem('parity:feature',scene);revealTestView();
        if(g.isMobileDevice()||scene.endsWith('-names')){
            const record=scene.endsWith('-names')?g.placedHelpers.at(-1):g.placedHelpers[0],epoch=g._helperFieldEpoch;
            g._checkpointPersonalityTimer=setTimeout(()=>{
                if(epoch===g._helperFieldEpoch)document.querySelector(`.helper-sprite[data-helper-id="${record.id}"]`)?.focus({preventScroll:true});
            },650);
        }
        lastResult=scene==='helper-hover'?'Hover helpers: crisp amber outline and immediate name. Move away; the name fades for one second before the helper settles behind the others.'
            :scene==='helper-groups'?'Hover the group, then Ungroup: every saved member name is retained. Keyboard focus also shows names.'
            :'The newest helper has a personal nickname. The saved nickname and old type label stay unchanged. Purchases and refresh keep each new name.';
    }

    function previewFieldPersonality(scene) {
        const g=window.game,planet=scene==='helper-conversation'?'mars':'earth',data=scenarioSave({planet,zeroDps:true});
        data.settings={...data.settings,storiesEnabled:false,newsEnabled:false,notificationsEnabled:false};
        const types=scene==='helper-conversation'?['marsBase','partyShibe','djKittenz']
            :scene==='helper-cadence'?['miningShibe','miningShibe','timeMachineRig','infiniteDogebility']
            :scene==='held-conversation'?['miningShibe']:[];
        const category=planet==='earth'?'helpers':`${planet}Helpers`;
        data[category]=types.map((type,i)=>({type,name:i?'Saved helper '+(i+1):'Saved Jerry',dps:g.getHelperData(type).baseDps}));
        data[`${planet}PlacedHelpers`]=data[category].map((h,i)=>({...h,id:18e9+i,x:150+i*90,y:320}));
        data.planetRockData[planet]={rocksBroken:0,rockLevel:1,currentHP:1e12,maxHP:1e12};
        apply(data);g.isPlaying=true;g.isIntroPlaying=false;
        document.documentElement.classList.add('parity-helper-field-preview');
        window.uiManager.updateMobilePlanetDisplay();
        if(g.isMobileDevice()) {window.uiManager.updateMobileShopContent();window.uiManager.switchMobileTab('shop');if(window.uiManager.mobileMenuOpen)window.uiManager.toggleMobileMenu();}
        else window.switchMainTab('shop');
        const field=document.getElementById('helper-container'),r=field.getBoundingClientRect(),ratio=r.width/field.offsetWidth||1;
        const available=(Math.min(r.bottom,innerHeight-(g.isMobileDevice()?95:20))-r.top)/ratio;
        g.placedHelpers.forEach((h,i)=>{
            const size=g.getHelperDisplaySize(h.type),cols=g.isMobileDevice()?2:types.length;
            h.x=Math.max(25,Math.min(field.offsetWidth-size-20,field.offsetWidth*(g.isMobileDevice()?.55:.33)+(i%cols)*78));
            h.y=Math.max(135,Math.min(available-size-25,available-100-Math.floor(i/cols)*100));
        });
        g.refreshHelperField();g.updateUI(true);g.clearFieldChatter();
        if(scene==='helper-cadence'){
            // Representative source-valid draws keep every frame cycle visible
            // within a short review, including the slow machines.
            const rates=[.082,.11,.024,.03];
            g.placedHelpers.forEach((h,i)=>{
                const sprite=document.querySelector(`.placed-helper[data-helper-id="${h.id}"]`);
                g.stopHelperAnimation(sprite);sprite._helperRestSpeed=rates[i];
                sprite._helperAnimationPhase=0;g.startHelperAnimation(h,sprite);
            });
        }
        const speak=()=>{
            if(!g.canShowFieldChatter())return;
            if(scene==='mining-chatter')g.rollMiningChatter(()=>.1);
            if(scene==='helper-conversation'){
                const h=g.placedHelpers.find(h=>window.DogeMinerFieldPersonality.family(h.type));
                const sprite=h&&document.querySelector(`.placed-helper[data-helper-id="${h.id}"]`);
                if(sprite)g.showFieldPhrase(window.DogeMinerFieldPersonality.phrase(g,window.DogeMinerFieldPersonality.family(h.type)),{sprite});
            }
        };
        if(scene==='held-conversation'){
            let grabs=0;
            for(const method of ['beginHeldHelperChatter','endHeldHelperChatter'])g['_checkpointOriginal_'+method]=g[method];
            g.beginHeldHelperChatter=function(drag){const held=++grabs%2===1;this._checkpointOriginal_beginHeldHelperChatter(drag,()=>held?.1:.9);};
            g.endHeldHelperChatter=function(drag,cancelled){this._checkpointOriginal_endHeldHelperChatter(drag,cancelled,()=>.1);};
        }
        selectedFeature=scene;localStorage.setItem('parity:feature',scene);revealTestView();
        g._checkpointPersonalityTimer=setTimeout(speak,500);
        window.saveManager.saveGame(false);
        lastResult=scene==='mining-chatter'?'Mine normally: phrases spread around Doge using DM2’s circular placement, with a 20% chance per accepted ordinary hit and no mining-text cap.'
            :scene==='helper-conversation'?'One example phrase starts this scene. Party Shibe and DJ Kittenz then speak at DM2’s natural random cadence.'
            :scene==='held-conversation'?'First grab: hold briefly for a phrase. Next grab: drop for a phrase. Repeat to compare; names and sway remain intact.'
            :'All four helpers should animate within two seconds: Shibes mine at different speeds; the rig and drive cycle more slowly. Grab one to compare held speed.';
    }

    function previewButtons(scene) {
        const g=window.game;
        if(scene==='button-shop'){
            const data=scenarioSave({zeroDps:true});
            data.settings={...data.settings,storiesEnabled:false,newsEnabled:false,notificationsEnabled:false};
            apply(data);g.isPlaying=true;
            if(g.isMobileDevice()){
                window.uiManager.switchMobileTab('shop');
                if(!window.uiManager.mobileMenuOpen)window.uiManager.toggleMobileMenu();
                g._checkpointButtonTimer=setTimeout(()=>document.querySelector('#mobile-shop-content .shop-buy-btn')?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'}),400);
            }else window.switchMainTab('shop');
        }else if(scene==='button-report'){
            run('offline-hour');g.showPendingOfflineEarningsReport();
        }else previewFeature('moon-goal');
        selectedFeature=scene;localStorage.setItem('parity:feature',scene);revealTestView();
        window.DogeMinerButtonMotion.refresh();
        lastResult=scene==='button-shop'?'Hover, press and release a buy button. A short tap buys once; hold still opens Buy Max. Colors and prices stay planet matched.'
            :scene==='button-report'?'Watch the buttons pop in. Hover, hold and release CLAIM: coins use their normal flight, and the report closes once. Tab/Enter and touch work too.'
            :'The story buttons pop in with the panel. Hover, hold and release CLOSE or the desktop cross. The existing zoom-out and saved acknowledgment still run once.';
    }

    function previewNotifications(scene) {
        const g=window.game,data=scenarioSave({zeroDps:scene!=='found-upgrade-notice'});
        data.settings={...data.settings,storiesEnabled:false,newsEnabled:false,notificationsEnabled:true};
        apply(data);window.notificationManager.clearAll();window.notificationManager.layout();
        document.querySelectorAll('[data-notification-target-helper]').forEach(n=>{delete n.dataset.notificationTargetHelper;n.removeAttribute('tabindex');});
        if(g.isMobileDevice()){window.uiManager.switchMobileTab('shop');if(window.uiManager.mobileMenuOpen)window.uiManager.toggleMobileMenu();}
        else window.switchMainTab('shop');
        if(scene==='motion-notice')window.DogeMinerMotionNotice.preview(window.notificationManager);
        else if(scene==='found-upgrade-notice'){
            g.isPlaying=true;const clock=g.searchdogeDiscovery.planets[g.currentLevel];
            g.searchdogeDiscovery.runTimeMs=161000;clock.sinceFoundMs=17001;clock.pauseMs=0;
            if(g.tryFindSearchdogeUpgrade({random:()=>0})!=='found')throw new Error('Upgrade discovery could not trigger.');
        }else if(scene==='story-notice')g.showStoryNews({id:'upgfast2k',title:'FASTER!',info:'Your experience is showing',details:'SearchDoges now sniff out upgrades <green>MUCH fast!</green>!'});
        else window.notificationManager.showEvent({title:'INFO',info:'Notifications close automatically',details:'This message closes after 4.5 seconds.'});
        selectedFeature=scene;localStorage.setItem('parity:feature',scene);revealTestView();
        lastResult=scene==='motion-notice'?'This previews the detected Reduce Motion notice without changing your system setting. Click the message to dismiss it.'
            :scene==='found-upgrade-notice'?'A real saved Searchdoge discovery created this notice. Click the message to open the exact upgrade slot.'
            :scene==='story-notice'?'The existing FASTER story follow-up now uses the source frame, title, details and green text. No reward is granted by this preview.'
            :'Notifications now stay for 4.5 seconds. Click a message to dismiss or open its action. Other notifications and normal mining continue.';
    }

    function previewBackgrounds(scene) {
        const planet=scene.slice(11),g=window.game,data=scenarioSave({planet,zeroDps:true});
        data.unlockedLevels=[...PLANETS];data.hasPlayedMoonLaunch=true;data.cutscenes.moonLaunch=true;
        data.settings={...data.settings,storiesEnabled:false,newsEnabled:false,notificationsEnabled:true};
        data.worldDiscovery=window.DogeMinerWorldDiscovery.legacy(data);
        for(const key of ['known','unlocked','visited'])data.worldDiscovery[key]=[...PLANETS];
        for(const item of Object.values(data.worldDiscovery.artifacts))item.stage='collected';
        for(const item of Object.values(data.worldDiscovery.routes))item.stage='ready';
        apply(data,{discovery:true});window.notificationManager.clearAll();
        for(const name of PLANETS.slice(1))document.body.classList.toggle(name==='moon'?'moon-theme':'planet-'+name,planet===name);
        window.uiManager.updateMobilePlanetDisplay?.();
        g.setPlanetBackgrounds(planet,{reset:true});g.startBackgroundRotation();g.isPlaying=true;
        selectedFeature=scene;localStorage.setItem('parity:feature',scene);revealTestView();
        lastResult='Backgrounds fade every ten seconds. B advances immediately on desktop. All five planets are unlocked here; choose Earth to review its pool. Saving is silent.';
    }

    function previewHudAudio(scene) {
        const g=window.game,data=scenarioSave({zeroDps:true});
        data.settings={...data.settings,storiesEnabled:false,newsEnabled:false,rockSoundsEnabled:scene!=='mining-audio',backgroundAudioEnabled:scene!=='background-audio'};
        data.dogecoins=100;data.totalMined=100;
        data.helpers=[{type:'timeMachineRig',dps:window.shopManager.getCurrentHelperUpgradeInfo('timeMachineRig').dps}];
        apply(data);window.notificationManager.clearAll();g.setValueUpdateRate(20);g.isPlaying=true;
        if(scene==='bonus-hud')g.activateBonusCoin({...g.getBonusCoinTiers()[1],duration:8});
        const settings=scene.endsWith('audio');
        if(g.isMobileDevice()) {
            window.uiManager.switchMobileTab(settings?'settings':'shop');
            if(window.uiManager.mobileMenuOpen!==settings)window.uiManager.toggleMobileMenu();
        } else window.switchMainTab(settings?'settings':'shop');
        selectedFeature=scene;localStorage.setItem('parity:feature',scene);revealTestView();
        lastResult=scene==='bonus-hud'?'The Golden Bonus lasts eight seconds in this preview. Watch the hourglass, tenth-second timer, active DPS icon, pulses and BONUS FADED exit. Normal Golden Bonuses last 60 seconds.'
            :scene==='smooth-income'?'Passive income now updates smoothly. Click the rock: its coins still wait until they land. Your existing update-rate choice stays unchanged outside this private preview.'
            :scene==='mining-audio'?'Mute Rock Sounds is checked. Toggle it to inspect the saved setting. This sandbox keeps all audio muted; production keeps loot/UI effects and music independent.'
            :'Sound in Background is unchecked. Blur/focus or hide/show the tab to exercise its policy. This sandbox stays muted throughout; music resumes at its existing position.';
    }

    function previewPerformanceGestures(scene) {
        const g=window.game,data=scenarioSave({zeroDps:true});
        data.settings={...data.settings,storiesEnabled:false,newsEnabled:false,lessEffects:scene==='less-effects',limitFps:scene==='frame-cap'};
        data.dogecoins=data.totalMined=100;
        data.helpers=[{type:'miningShibe',dps:window.shopManager.getCurrentHelperUpgradeInfo('miningShibe').dps}];
        if(scene==='inventory-swipes'){
            const context={planet:'earth',highestPlanet:'earth',tier:1,wow:50,timeline:1};
            for(const id of ['3','9']){
                const template=Object.values(g.pickaxeFactory.templates).find(item=>item.balanceDefinitionId===id);
                data.pickaxeInventory.push(g.pickaxeFactory.generatePickaxe(template.id,100,50,context,()=>.5));
            }
        }
        apply(data);window.notificationManager.clearAll();g.isPlaying=true;
        const settings=['less-effects','frame-cap'].includes(scene);
        if(g.isMobileDevice()){
            window.uiManager.switchMobileTab(settings?'settings':'shop');
            if(window.uiManager.mobileMenuOpen!==(scene!=='inventory-swipes'))window.uiManager.toggleMobileMenu();
        }else window.switchMainTab(settings?'settings':'shop');
        if(scene==='inventory-swipes'){
            g.openPickaxeModal();g.isPlaying=false;
        }else if(scene==='frame-cap'){
            const demo=document.createElement('div');demo.id='parity-frame-demo';
            demo.innerHTML='<img src="assets/general/dogecoin_70x70.webp" alt=""><span></span>';
            document.getElementById('left-panel').append(demo);
            let previous=window.DogeMinerFrameClock.inspect().frames,at=performance.now();
            const paint=()=>{const now=performance.now(),current=window.DogeMinerFrameClock.inspect().frames;
                demo.querySelector('span').textContent=(g.limitFps?'48 FPS cap':'Native refresh')+' · '+Math.round((current-previous)*1000/Math.max(1,now-at))+' world FPS';previous=current;at=now;};
            demo.querySelector('span').textContent='48 FPS cap';g._checkpointPerformanceTimer=setInterval(paint,2000);
        }
        selectedFeature=scene;localStorage.setItem('parity:feature',scene);revealTestView();
        lastResult=scene==='less-effects'?'Toggle Less Effects in Settings and click the rock. Income and damage stay the same; new particles and currency flights disappear. Existing flights still finish.'
            :scene==='frame-cap'?'Watch the moving coin and world-FPS readout. Toggle Limit FPS (48) in Settings: world animation changes rate while cursor/controller input remains native.'
            :scene==='inventory-swipes'?'On a phone or narrow window, swipe left/right across the open grid or item details to browse without equipping. Edges clamp; taps and existing inventory controls still work.'
            :'On a phone or narrow window, swipe down on the panel tab strip/toggle to close it. Content still scrolls normally; swipes starting on Doge/rock never become navigation.';
    }

    function previewLaunchEvolution(scene) {
        const g=window.game,data=scenarioSave({planet:scene==='doge-gate-price'||scene==='mystery-evolution'?'moon':'earth',zeroDps:true});
        data.settings={...data.settings,storiesEnabled:true,newsEnabled:false,lessEffects:false,limitFps:false};
        data.storyProgress.seen.push('hitsong');data.dogecoins=0;data.totalMined=0;
        if(scene==='doge-gate-price'){
            data.dogecoins=123456789;data.totalMined=data.dogecoins;
            data.moonHelpers=[{type:'moonBase',dps:12}];data.jupiterHelpers=[{type:'cloudBase',dps:45}];
            apply(data);g.isPlaying=false;
            if(g.isMobileDevice()){window.uiManager.switchMobileTab('shop');if(!window.uiManager.mobileMenuOpen)window.uiManager.toggleMobileMenu();}
            else window.switchMainTab('shop');
            lastResult='Exactly 123,456,789 coins. Buy one Doge Gate; the wallet reaches zero. The display remains abbreviated like other shop prices.';
        }else if(scene==='mystery-evolution'){
            apply(data);g.isPlaying=true;window.switchMainTab?.('shop');window.uiManager.closeMobileMenu?.();
            g.grantDogebagReward({type:'fortune',item:g.fortuneFactory.generateFromTemplate('mystery_box')});
            window.saveManager.saveGame(false);
            lastResult='Mystery fortune earned and saved. Wait 4.5 seconds for its evolution story; the box button arrives at 6.5 seconds. Close the story, then open the box.';
        }else{
            data.cutscenes.moonLaunch=false;data.hasPlayedMoonLaunch=false;
            data.helpers=[{type:'spaceRocket',dps:9}];
            apply(data);g.isPlaying=false;g.playMoonLaunchCutscene();
            if(scene==='moon-skip')window.DogeMinerMoonLaunch.initiate(g);
            lastResult=scene==='moon-skip'?'Try play/pause and volume. After four seconds, SKIP asks for confirmation. Keep Watching returns to the video; Very Understand continues to the Moon.'
                :'Press the rocket screen to begin. Video stays muted in this private sandbox. The launch is only marked watched on completion or confirmed skip.';
        }
        selectedFeature=scene;localStorage.setItem('parity:feature',scene);revealTestView();
    }
    function previewLateUpgrade(scene){
        const g=window.game,planet=scene==='upgrade-transform'?'earth':'titan',data=scenarioSave({planet,zeroDps:true});
        data.settings={...data.settings,soundEnabled:false,musicEnabled:false,storiesEnabled:true,newsEnabled:false,lessEffects:false,limitFps:false,autoPlaceHelpers:true};
        data.lateProgression=window.DogeMinerLateProgression.fresh(1);data.dogecoins=scene==='reallyhardium'?1e25:scene==='upgrade-transform'?1000:0;data.totalMined=data.dogecoins;data.dogediamonds=40;
        const active={ 'altar-yoga':['foundup1'],'titan-blueprints':['foundbp'],reallyhardium:['figurebp'],'upgrade-transform':[] }[scene];
        data.storyProgress.seen=[...new Set([...data.storyProgress.seen,...DISCOVERY_STORIES,...PROGRESSION_STORIES,...['foundup1','foundbp','figurebp'].filter(id=>!active.includes(id))])];
        function own(type,count,place=false){
            const key=planet==='earth'?'helpers':'titanHelpers',info=window.shopManager.getCurrentHelperUpgradeInfo(type);
            const field=document.getElementById('left-panel');
            for(let i=0;i<count;i++){
                data[key].push({type,dps:info.dps,name:'Retained '+(i+1)});
                if(place){const record={id:35000+i,type,dps:info.dps,name:'Retained '+(i+1),x:185+Math.max(0,i-1)*80,y:Math.max(190,field.offsetHeight-100),isMining:true};
                    if(scene==='upgrade-transform'&&i<2){record.groupId='checkpoint-35-group';record.x=185;}
                    data[planet+'PlacedHelpers'].push(record);}
            }
        }
        if(scene==='upgrade-transform'){own('miningShibe',6,true);data.helperUpgradeOffers={earth:['miningShibe',null,null]};}
        else{
            own('titanBase',1);
            if(scene==='altar-yoga'){own('altarOfTheSunDoge',1,true);data.helperUpgradeOffers={titan:['altarOfTheSunDoge',null,null]};}
            else own('roboShibe',1,true);
            if(scene==='reallyhardium'){
                own('altarOfTheSunDoge',1);data.helperUpgradeLevels={altarOfTheSunDoge:2,miningShibe:7};data.lateProgression.yoga=true;
                data.helpers=[{type:'miningShibe',dps:200,name:'Retained Earth helper'}];data.helperUpgradeOffers={earth:['miningShibe',null,null]};
            }
        }
        data.placedHelpers=data[planet+'PlacedHelpers'];data.worldDiscovery=window.DogeMinerWorldDiscovery.legacy(data);
        data.worldDiscovery.artifacts.blueprint={stage:scene==='reallyhardium'?'collected':'unseen',readyAt:0,planet:'titan',x:.45,y:.7};
        apply(data,{discovery:true});window.notificationManager.clearAll();g.isPlaying=scene!=='upgrade-transform';
        g._storyLocationPlanet=planet;g._storyLocationStartedAt=Date.now()-(scene==='altar-yoga'?5000:scene==='reallyhardium'?1200:0);
        if(scene==='altar-yoga'||scene==='upgrade-transform'){
            if(g.isMobileDevice()){window.uiManager.switchMobileTab('upgrades');if(!window.uiManager.mobileMenuOpen)window.uiManager.toggleMobileMenu();}
            else window.switchMainTab('upgrades');
            window.uiManager.updateUpgradeContent();window.uiManager.updateMobileUpgradesContent();
        }else{window.uiManager.closeMobileMenu?.();window.switchMainTab('shop');}
        if(scene==='altar-yoga')g._checkpointLateTimer=setInterval(()=>{
            if(g.currentLevel!=='titan'||g.helperUpgradeLevels.altarOfTheSunDoge!==1||!g.lateProgression.yoga||!g.storyProgress.seen.includes('foundup1')||g.isStoryOpen||window.DogeMinerUpgradePresentation.isTypeBusy(g,'altarOfTheSunDoge'))return;
            clearInterval(g._checkpointLateTimer);g.helperUpgradeOffers.titan=['altarOfTheSunDoge',null,null];
            window.uiManager.updateUpgradeContent();window.uiManager.updateMobileUpgradesContent();window.saveManager.saveGame(false);
        },100);
        selectedFeature=scene;localStorage.setItem('parity:feature',scene);revealTestView();
        lastResult=scene==='altar-yoga'?'Buy the 15-diamond upgrade. Close the awakening story; this private preview prepares the next found offer so you can buy the 25-diamond upgrade.'
            :scene==='titan-blueprints'?'A Robo Shibe triggers the blueprint after 500ms. Collect the visible blueprint to see its story. Refresh preserves an uncollected blueprint.'
            :scene==='reallyhardium'?'Altar stage2 and the blueprint trigger the research breakthrough story. The 27 late tiers unlock before closing it. Earth has a prepared late upgrade to inspect.'
            :'Buy the found upgrade. APPLYING, staggered texture/sway changes, DONE, then searching. Six named helpers include a retained group; phones show the helper-bar animation.';
    }
    function previewTools(scene) {
        const g=window.game,data=scenarioSave({planet:'earth',zeroDps:true});
        Object.assign(data,window.DogeMinerTools.discoveryState());
        data.dogecoins=0;data.totalMined=0;data.rockLevel=1;
        const make=(type,index)=>{
            if(type==='paw')return {...TimeTravelManager.createStartingPaw(),instanceId:'tool-preview-paw'};
            const template=Object.values(g.pickaxeFactory.templates).find(t=>t.balanceDefinitionId===type);
            if(!template)throw Error('Tool preview template unavailable: '+type);
            const item=g.pickaxeFactory.generatePickaxe(template.id,20,0,{planet:'earth',timeline:1},()=>.5);
            item.instanceId='tool-preview-'+type+'-'+index;
            if(type!=='staff') {item.baseDPC=5;item.stats=[];}
            return item;
        };
        const ids=scene==='tool-dual'?['1','1']:scene==='tool-fusion'?['staff','staff']
            :scene==='tool-drills'?['drill','goldendrill','smalldrill']:['paw','carbine','shotgun','lightaxe','staff'];
        data.pickaxeInventory=ids.map(make);data.equippedPickaxeId=data.pickaxeInventory[0].instanceId;
        if(scene==='tool-fusion')data.pickaxeInventory.forEach((item,i)=>item.stats.find(s=>s.balanceKey==='dpsp').value=i?14:10);
        data.maxPickaxeDPC=20;data.planetRockData.earth={rocksBroken:0,rockLevel:1,maxHP:100000,currentHP:100000};
        apply(data);g.isPlaying=true;g.isIntroPlaying=false;g._bootComplete=true;g.equipPickaxe(data.equippedPickaxeId);g.syncToolRig();
        g.rockMaxHP=100000;g.rockCurrentHP=100000;g.updateRockHealthDisplay();
        selectedFeature=scene;localStorage.setItem('parity:feature',scene);revealTestView();
        lastResult=scene==='tool-dual'?'Mine with the paired pickaxes. Hits alternate hands; the source 40% double attack uses both.'
            :scene==='tool-fusion'?'Watch the two staffs fuse into one legendary staff: 0 DPC and +140% DPS. The result saves before the discovery toast.'
            :scene==='tool-drills'?'Hold the rock, Space or controller A to drill. Release to stop. The inventory contains all three drill types.'
            :'Mine with the Paw, then select the carbine, shotgun, light-blade or staff from Pickaxes to compare their motion and profiles. This preview stays muted.';
    }
    function previewEncounters(scene) {
        const g=window.game,data=scenarioSave({planet:'earth',zeroDps:scene!=='cate-thief'});
        data.settings={...data.settings,soundEnabled:false,musicEnabled:false,storiesEnabled:true,newsEnabled:false};
        data.encounters={version:1,caught:0,missed:0,stolen:0,rickReferences:['rmref','rmref2','rmref3'],rickClockMs:0,rickTargetMs:900000};
        Object.assign(data,window.DogeMinerTools.discoveryState());data.diamondDiscoverySeen=true;
        data.totalClicks=100;data.dogecoins=100000;data.totalMined=100000;
        if(scene==='rock-capacity')data.dogebagStacks={earth:{0:99}};
        if(scene==='updates-discovery'){data.dogediamonds=0;data.dogediamondsEverObtained=0;data.diamondDiscoverySeen=false;}
        apply(data);g.isPlaying=true;g.isIntroPlaying=false;g._bootComplete=true;
        window.notificationManager.clearAll();window.uiManager.closeMobileMenu?.();window.switchMainTab('shop');
        selectedFeature=scene;localStorage.setItem('parity:feature',scene);revealTestView();
        if(scene==='cate-thief')g.spawnCateThief();
        if(scene==='rick-visit')g.spawnRick({autoJump:true});
        if(scene==='rock-capacity'){g.rockCurrentHP=0;g.updateRockHealthDisplay();g.regenerateRock();}
        if(scene==='updates-discovery'){g.createDiamondLoot();window.DogeMinerReleaseNotes.open();}
        window.saveManager.saveGame(false);
        lastResult=scene==='cate-thief'?'Catch the thief before it finishes stealing. One named Streamer Kitten is freed and saved before its story. This source encounter is desktop-only.'
            :scene==='rick-visit'?'Watch the portal, Rick mining and his 30-second timer. Drag him to move his helper buff.'
            :scene==='rock-capacity'?'A full stack holds the next rock. Open the 99-bag stack to make room; replacement then follows the source delay.'
            :'Close the patch notes, then collect the visible diamond for its first-discovery cue. The version label reopens patch notes.';
    }
    function previewCloud(scene) {
        const g=window.game,data=scenarioSave({planet:'earth',zeroDps:true});
        data.settings={...data.settings,soundEnabled:false,musicEnabled:false,storiesEnabled:false,newsEnabled:false};
        data.dogecoins=500;data.totalMined=10000;
        apply(data);g.isPlaying=true;g.isIntroPlaying=false;g._bootComplete=true;
        window.saveManager.saveGame(false);window.notificationManager.clearAll();
        const cloud=Object.assign(Object.create(window.DogeMinerCloudSave.Manager.prototype),{currentUser:{uid:'checkpoint-only'},_accountEpoch:1});
        const remote=JSON.parse(JSON.stringify(window.saveManager.createSaveData()));
        remote.timestamp=Date.now()+1000;remote.totalMined=scene==='cloud-local'?9000:20000;remote.dogecoins=scene==='cloud-local'?50000:750;
        if(scene==='cloud-invalid')remote.pickaxeInventory=[{baseDPC:-1}];
        if(scene==='cloud-reward'){
            g.restoreDogebagStacks({earth:{0:1}});g.openDogebagModal(document.querySelector('.dogebag-stack'));g.openDogebagContents();
        }
        window._checkpointCloud=cloud;
        const result=cloud._receiveCloud({gameData:remote},cloud._ticket(),false);
        selectedFeature=scene;localStorage.setItem('parity:feature',scene);revealTestView();
        lastResult=scene==='cloud-local'?'The cloud wallet is 50,000, but this device has earned more. The local 500-coin wallet is retained.'
            :scene==='cloud-newer'?'The validated cloud save has earned more. Its 750-coin wallet is saved locally; the previous save is retained for recovery.'
            :scene==='cloud-reward'?'Finish or close the bag rewards. The incoming cloud save waits, then is compared again against the latest earned progress.'
            :'The incoming cloud pickaxe is invalid. Your local inventory and 500-coin wallet stay usable.';
        return result;
    }
    function importSample(timeline=3) {
        return {version:4,timeline,coins:12345,alltimecoins:50000,clicks:77,diamonds:9,alltimediamonds:40,level:2,
            pickaxes:[[1,[['click',123],['loot',4]]],['staff',[['click',0],['dpsp',14]]]],equipped:{pick:1},
            fortunes:[['super1',[['luck',777]]],['dialoot',[['loot',75]]],['rainbowegg',[['spirit',25]]]],
            helpers:[[1,2,3,1,1],[7,1,2,2,1]],helperpositions:[[1,1,[[200,300,0,1],[210,300,1,0]]]],
            rocks:[[1,40],[2,3]],rockvalues:[20,30],fieldloot:{1:{bags:[99,1,0,0],diamonds:2}},
            seen:['tothemoon','moon1'],visited:{locations:[1,2]},unlocked:{locations:[1,2],upgradeslots:[1,1,1]},
            timelinecoins:[10,20],timelinealltimecoins:[100,200],timelineplayeds:[30,40],kitlerstats:[0,1],timeplayed:50,mbtot:12,mbnum:8};
    }
    async function previewImport(scene) {
        const data=scenarioSave({planet:'earth',zeroDps:true});data.dogecoins=500;data.totalMined=10000;data.dm2Import=null;
        apply(data);window.game.isPlaying=true;window.game.isIntroPlaying=false;window.game._bootComplete=true;
        window.notificationManager.clearAll();window.saveManager.saveGame(false);
        const raw=importSample(scene==='import-basic'?1:3);
        if(scene==='import-basic'){raw.fortunes=[[1,[['luck',5]]]];raw.pickaxes=[[1,[['click',25]]]];raw.equipped.pick=0;}
        if(scene==='import-invalid')raw.helpers=[[1,-5,0,1,1]];
        const source=JSON.stringify(raw),text=scene==='import-backup'?window.DogeMinerLZString.compressToUTF16(source):window.DogeMinerLZString.compressToBase64(source);
        selectedFeature=scene;localStorage.setItem('parity:feature',scene);revealTestView();
        lastResult=scene==='import-invalid'?'The damaged source helper count is rejected; the 500-coin CE save is retained.'
            :'Review the actual import confirmation. Cancel keeps the 500-coin CE save; confirm converts exact rolls, progress and field loot, with both originals retained.';
        try {await window.saveManager.importSaveText(text);} catch(error){window.game.showNotification(error.message);}
    }
    function previewSeason({season='easter',planet='earth',count=0,golden=false,items=false,inventory='pickaxe'}={}) {
        if(!active())throw new Error('Open the checkpoint sandbox to preview seasons.');
        if(!['none','easter','halloween','xmas'].includes(season)||!PLANETS.includes(planet)||!Number.isInteger(count)||count<0||count>9)throw new Error('Choose a season, planet and egg count from 0 to 9.');
        const g=window.game,data=scenarioSave({planet,timeline:2});
        data.seasonal={version:1,enabled:true,easter:{found:window.DogeMinerSeasonal.eggs.slice(0,count),count,golden:count===9&&!!golden}};
        data.storyProgress.seen.push('eastr21');
        if(data.seasonal.easter.golden)data.storyProgress.seen.push('eggz21');
        if(items&&season!=='none'){
            const pool=window.DogeMinerSeasonal.pools[season],catalog=window.DogeMinerDM2ImportData.catalog;
            data.pickaxeInventory.push(...pool.pickaxe.map(id=>g.pickaxeFactory.generatePickaxe(catalog.pickaxe[id].templateId,100,0,{planet},()=>.5)));
            data.fortuneInventory=pool.fortune.map(id=>g.fortuneFactory.generateFromTemplate(catalog.fortune[id].templateId,{planet},()=>.5));
            data.equippedPickaxeId=data.pickaxeInventory[1].instanceId;
        }
        localStorage.setItem('parity:seasonal-event',season);g._seasonalPreview=season;
        apply(data);g.isPlaying=true;g.isIntroPlaying=false;g.isStoryOpen=false;g._bootComplete=true;window.notificationManager.clearAll();
        g.startSeasonal();g.renderSeasonal();window.saveManager.saveGame(false);revealTestView();
        if(items&&season!=='none')g[inventory==='fortune'?'openFortuneModal':'openPickaxeModal']();
        lastResult=(season==='none'?'Ordinary season':season+' on '+planet)+' · '+count+'/9 hidden eggs. '+(items?'All seasonal items are in both inventories. ':'')+(count===9&&!golden?'The real golden-reward story is ready.':'Egg progress is saved in this private tab.');
        return {season:window.DogeMinerSeasonal.active(g),count,golden:data.seasonal.easter.golden};
    }

    async function previewEggLocation(id) {
        if(!active())throw new Error('Open the checkpoint sandbox to preview hidden eggs.');
        const eggs=window.DogeMinerSeasonal.eggs;
        if(!eggs.includes(id))throw new Error('Choose a hidden-egg location.');
        const g=window.game;previewSeason({season:'easter',planet:typeof id==='number'?PLANETS[id-1]:g.currentLevel});
        if(id==='inv1')g.openPickaxeModal();
        else if(id==='inv2')g.openFortuneModal();
        else if(typeof id==='string'){
            const tab=id==='setting'?'settings':'upgrades';
            if(g.isMobileDevice()){window.uiManager.switchMobileTab(tab);if(!window.uiManager.mobileMenuOpen)window.uiManager.toggleMobileMenu();}
            else window.switchMainTab(tab);
        }
        // Mobile tabs animate before adding their active/visible class. Wait for
        // the real host rather than trying to spawn into the outgoing panel.
        let spawned=false;
        for(let attempt=0;attempt<25&&!spawned;attempt++){
            spawned=g.spawnHiddenEgg(id);if(!spawned)await new Promise(resolve=>setTimeout(resolve,40));
        }
        if(!spawned)throw new Error('The egg location is not visible. Reopen Test tools and try again.');
        if(typeof id==='string'&&g.isMobileDevice())await new Promise(resolve=>setTimeout(resolve,300));
        document.querySelector('.seasonal-hidden-egg')?.scrollIntoView({block:'nearest',inline:'nearest'});
        lastResult='Hidden egg at '+({setting:'Settings',inv1:'Pickaxes',inv2:'Fortunes',upgrade:'Upgrades'}[id]||PLANETS[id-1])+'. Collect it through the real saved hunt.';
        return true;
    }

    function previewVerification(scene){
        const g=window.game;
        if(scene==='verify-input'){
            run('rick-near');g.isPlaying=true;g.isIntroPlaying=false;
            const pool=Object.values(g.pickaxeFactory.templates).filter(t=>!t.season&&!t.isPaw).slice(0,4);
            g.pickaxeInventory.push(...pool.map(t=>g.pickaxeFactory.generatePickaxe(t.id,100)));
            if(g.isMobileDevice()){window.uiManager.switchMobileTab('settings');if(!window.uiManager.mobileMenuOpen)window.uiManager.toggleMobileMenu();}else window.switchMainTab('settings');
            localStorage.setItem('ce-release-notes',JSON.stringify({lastSeenBuild:'beta-parity-previous',opened:false,seenUpdate:null}));
            window.DogeMinerReleaseNotes.check({force:true});
            window.saveManager.saveGame(false);revealTestView();
            lastResult='Layout sits directly above Value Update Rate. Rick expires after 30 real seconds, including loss of focus. Try Space in inventory search, dropdowns and dialogs; it must not mine. Open Pickaxes to swipe/browse. Type DOGE; layout codes are removed.';
        }else if(scene==='verify-mission'){
            historyPreset('history-first');g.diaMissionSeenOnce=false;window.saveManager.saveGame(false);window.timeTravelManager.openMissionBrief(true);revealTestView();
            lastResult='Play the first mission from the brief through either Attack or Go Home, then all rewards and the saved timeline return. Both choices reach impact. The first mission cannot skip; repeats retain the answered choice and protected rewards.';
        }else if(scene==='verify-worlds'){
            const index=Number(localStorage.getItem('parity:review-season-index')||0)%4,season=['none','easter','halloween','xmas'][index];
            previewSeason({season,count:season==='easter'?8:0,items:season!=='none'});g.closePickaxeModal();g.closeFortuneModal();g.isPlaying=true;
            localStorage.setItem('parity:review-season-index',String(index+1));
            lastResult=(season==='none'?'Ordinary':season)+' scene. Visit all five planets, inspect rock/bag/diamond layers and source holiday items in both inventories. Show this preview again cycles Ordinary → Easter → Halloween → Christmas.';
        }else if(scene==='verify-recovery'){
            previewFeature('holiday-complete');lastResult='Collect the ninth egg, finish the golden reward and reload. Count9, golden artwork and the saved reward must remain. Private cloud/mission/write-failure scenarios are covered in checkpoint62 evidence.';
        }else throw new Error('Choose a verification scene.');
        selectedFeature=scene;localStorage.setItem('parity:feature',scene);
    }

    function previewPolish(scene) {
        const g=window.game;
        if(scene==='polish-settings') {
            previewFeature('story-settings');
            localStorage.setItem('ce-release-notes',JSON.stringify({lastSeenBuild:'beta-parity-previous',opened:false,seenUpdate:null}));
            window.DogeMinerReleaseNotes.check({force:true});
            lastResult='All post-travel settings are unlocked. Layout and Value Update Rate are compact and aligned; the desktop Supporter button is visible without scrolling. Read NEW PATCH NOTES, close and reload: only the version remains. Controller: D-pad moves, left/right changes dropdowns, A activates and B returns to the field.';
        } else if(scene==='polish-mission') {
            previewVerification('verify-mission');
            lastResult='Play the first D.I.A. mission with controller, keyboard or touch. A reveals a line separately from accepting it; D-pad selects replies and badges, B goes back or cancels the warning. First missions cannot skip. Both Cateland choices and all rewards use the real flow.';
        } else if(scene==='polish-rewards') {
            historyPreset('history-first');run('history-review');
            lastResult='Review the three real mission rewards. Each action activates once; a held controller button cannot carry into the next reward. Complete them to save one timeline record. The return story uses the same controller report controls.';
        } else if(scene==='polish-phone') {
            g.setLayoutMode('phone');previewPerformanceGestures('inventory-swipes');
            lastResult='Phone layout on any window. Browse or swipe the real inventory, close it and open Settings. Controls have larger touch targets, a compact dropdown pair, Supporter access and more usable landscape drawer space. Select Automatic to return.';
        } else throw new Error('Choose a polish scene.');
        selectedFeature=scene;localStorage.setItem('parity:feature',scene);revealTestView();
    }

    function previewFeature(scene) {
        if(scene.startsWith('polish-'))return previewPolish(scene);
        if(scene.startsWith('verify-'))return previewVerification(scene);
        if(scene.startsWith('layout-')){
            const data=scenarioSave({zeroDps:true});data.layout={version:1,mode:scene==='layout-codes'?'auto':scene.slice(7)};
            apply(data);window.game.isPlaying=true;window.game.isIntroPlaying=false;window.game.isCutscenePlaying=false;window.game._bootComplete=true;window.notificationManager.clearAll();
            window.game.timelineProgress.current.playTimeMs=scene==='layout-codes'?58000:120000;window.game.renderSeasonal?.();window.saveManager.saveGame(false);
            selectedFeature=scene;localStorage.setItem('parity:feature',scene);revealTestView();lastResult=scene==='layout-codes'?'Type DOGE for a message with a voluntary original-site link. Web builds no longer include IDDQD/Konami layout effects; wide layout is reserved for native versions.':'The saved '+scene.slice(7)+' profile uses CE content. Desktop/tablet fit inside this viewport; the bottom Layout selector always lets you return to Automatic. Counts and rewards are unchanged.';return;
        }
        if(scene.startsWith('holiday-')){
            const event=scene==='holiday-complete'?'easter':scene.slice(8),data=scenarioSave({zeroDps:false,timeline:2});
            data.seasonal={version:1,enabled:true,easter:{found:scene==='holiday-complete'?[2,3,4,5,'setting','inv1','inv2','upgrade']:[],count:scene==='holiday-complete'?8:0,golden:false}};
            data.fortuneInventory=[{instanceId:'seasonal-spirit-fixture',name:'Holiday Spirit preview',rarity:'rare',isProtected:true,stats:[{balanceKey:'spirit',name:'holidayspirit',displayName:'Holiday Spirit',indicator:'+',value:400}],sprite:'assets/general/dogecoin_70x70.webp'}];
            data.storyProgress.seen.push('eastr21');localStorage.setItem('parity:seasonal-event',event);window.game._seasonalPreview=event;
            apply(data);window.game.isPlaying=true;window.game.isIntroPlaying=false;window.game.isStoryOpen=false;window.notificationManager.clearAll();
            window.game.startSeasonal();window.game.renderSeasonal();window.saveManager.saveGame(false);revealTestView();
            if(event==='easter')window.game.spawnHiddenEgg(1);
            selectedFeature=scene;localStorage.setItem('parity:feature',scene);lastResult=scene==='holiday-complete'?'Collect the actual ninth egg, then review the saved golden-reward story. Reload keeps the result.':'Private '+event+' scene. Seasonal pools are active; post-prestige Holiday Events in Settings disables the theme and bonus without removing earned items.';return;
        }
        if(scene.startsWith('landing-')){
            if(scene==='landing-continue'){
                const data=scenarioSave({zeroDps:true});data.dogecoins=500;data.totalMined=10000;
                apply(data);window.saveManager.saveGame(false);
            }
            const url=new URL('../',location.href);url.searchParams.set('parityTest','checkpoint-'+window.CEParityTesting.checkpoint);
            if(scene==='landing-new')url.searchParams.set('landingFixture','new');
            window.location.href=url.href;return;
        }
        if(IMPORT_FEATURES.some(([id])=>id===scene))return previewImport(scene);
        if(CLOUD_FEATURES.some(([id])=>id===scene))return previewCloud(scene);
        if(ENCOUNTER_FEATURES.some(([id])=>id===scene))return previewEncounters(scene);
        if(TOOL_FEATURES.some(([id])=>id===scene))return previewTools(scene);
        if(LATE_UPGRADE_FEATURES.some(([id])=>id===scene))return previewLateUpgrade(scene);
        if(LAUNCH_EVOLUTION_FEATURES.some(([id])=>id===scene))return previewLaunchEvolution(scene);
        if(PERFORMANCE_GESTURE_FEATURES.some(([id])=>id===scene))return previewPerformanceGestures(scene);
        if(HUD_AUDIO_FEATURES.some(([id])=>id===scene))return previewHudAudio(scene);
        if(BACKGROUND_FEATURES.some(([id])=>id===scene))return previewBackgrounds(scene);
        if(NOTIFICATION_FEATURES.some(([id])=>id===scene))return previewNotifications(scene);
        if(['button-shop','button-report','button-story'].includes(scene))return previewButtons(scene);
        if(FIELD_PERSONALITY_FEATURES.some(([id])=>id===scene))return previewFieldPersonality(scene);
        if(HELPER_PERSONALITY_FEATURES.some(([id])=>id===scene)||['party-names','dj-names'].includes(scene))return previewHelperPersonality(scene);
        if(['returning-save','unfinished-story-news'].includes(scene))return previewReturningHistory(scene);
        if(CHECKPOINT15_FEATURES.some(([id])=>id===scene)||scene==='upgrade-hover-mars')return previewStatisticsAndUpgrades(scene);
        if(MINING_FEEDBACK_FEATURES.some(([id])=>id===scene))return previewMiningFeedback(scene);
        if(['helper-income','helper-breakdown'].includes(scene))return previewHelperShopDetails(scene);
        if (AUTOMATION_FEATURES.some(([id]) => id === scene)) return previewAutomation(scene);
        if (HELPER_LOOT_FEATURES.some(([id]) => id === scene)) return previewHelperLoot(scene);
        if (FIELD_FEATURES.some(([id]) => id === scene)) return previewFieldLoot(scene);
        if (INVENTORY_FEATURES.some(([id]) => id === scene) && !['newsdoge', 'popup-layout'].includes(scene)) return previewInventory(scene);
        if (['popup-layout', 'rig-invention', 'dia-contact', 'titan-sensors', 'titan-route'].includes(scene)) return previewProgression(scene);
        if (DISCOVERY_FEATURES.some(([id]) => id === scene)) return previewDiscovery(scene);
        if (!FEATURES.some(([id]) => id === scene)) throw new Error('Choose a feature to preview.');
        const g = window.game, timeline = scene.startsWith('return-') ? Number(scene.slice(-1)) : scene === 'story-settings' ? 3 : 1;
        const data = scenarioSave({ timeline, zeroDps: true });
        data.dogecoins = ['moon-goal', 'newsdoge'].includes(scene) ? 0 : 1000; data.totalMined = data.dogecoins; data.totalClicks = 0;
        data.unlockedLevels = ['earth']; data.bonusCoinMaxPlanetLevel = 1;
        data.bonusCoinSeenLevel = 0;
        data.hasPlayedMoonLaunch = timeline > 1; data.cutscenes.moonLaunch = timeline > 1;
        data.storyProgress = { version: 1, timeline, seen: ['first-bonus', 'newsdoge'].includes(scene) ? ['tothemoon']
            : scene === 'story-settings' ? ['newtimeline3'] : [], pending: [], extraDps: 0 };
        data.settings = { ...data.settings, hintsEnabled: true, storiesEnabled: true, newsEnabled: true };
        const starter = timeline > 1 ? TimeTravelManager.createStartingPaw() : { ...g.defaultPickaxe };
        data.pickaxeInventory = [starter]; data.equippedPickaxeId = starter.instanceId;
        if (scene === 'first-bonus') {
            for (let index = 0; index < 9; index++) {
                const helper = { type: 'miningShibe', name: `Bonus tester ${index + 1}`, dps: .2 };
                data.helpers.push(helper);
                data.earthPlacedHelpers.push({ ...helper, id: 6e9 + index, x: 120 + index % 3 * 40,
                    y: 155 + Math.floor(index / 3) * 35, isMining: false });
            }
        }
        window.notificationManager?.clearAll();
        apply(data); g.isPlaying = true;
        if (scene !== 'story-settings') {
            if (window.uiManager.mobileMenuOpen) window.uiManager.toggleMobileMenu();
            if (g.isMobileDevice()) window.uiManager.switchMobileTab('shop');
            else window.switchMainTab('shop');
        }
        selectedFeature = scene; localStorage.setItem('parity:feature', scene);
        revealTestView();
        if (scene.startsWith('return-')) {
            document.getElementById('character-container').style.visibility = 'hidden';
            document.getElementById('pickaxe').style.visibility = 'hidden';
            g.beginTimelineReturn();
            lastResult = 'Close the return message to see Doge arrive. Each timeline uses its own source message.';
        } else if (scene === 'newsdoge') {
            g.checkNewsDoge();
            g.dogecoins += 475; g.totalMined += 475; g.updateUI();
            g.checkNewsDoge(Date.now(), () => 0); window.saveManager.saveGame(false);
            lastResult = 'Crossed the real 475-earned-coin trigger. Watch NewsDoge report, then click the reporter to see the reaction.';
        } else if (scene === 'story-settings') {
            if (g.isMobileDevice()) {
                window.uiManager.switchMobileTab('settings');
                if (!window.uiManager.mobileMenuOpen) window.uiManager.toggleMobileMenu();
            } else window.switchMainTab('settings');
            lastResult = 'Timeline 3 unlocks separate Story Popups and News switches. Show Hints is independent.';
        } else {
            g.advanceStoryEvents(500);
            lastResult = scene === 'first-bonus' ? 'Collect the Bonus Coin when it appears. Its first claim opens the explanation.'
                : 'Close the goal dialog, then watch the rocket card and mining hint. Click the rock to clear the hint.';
        }
    }

    function run(name, { planet = 'earth', badge = 'luck', tier = 1, choice = 'attack', scene = selectedFeature } = {}) {
        if (!active()) throw new Error('Open the checkpoint sandbox to run presets.');
        const g = window.game;
        if (name === 'feature-preview') {
            previewFeature(scene);
        } else if (['story-four', 'story-short', 'story-ready', 'story-timeline-2', 'story-claimed', 'story-suppressed', 'story-pending', 'story-offline'].includes(name)) {
            storyPreset(name);
        } else if (name === 'story-delay') {
            g._storyLocationPlanet = g.currentLevel; g._storyLocationStartedAt = Date.now() - 8201;
            lastResult = 'Arrival delay passed for this test session. Step story check uses the real helper/time/focus conditions.';
        } else if (name === 'story-time') {
            const playing = g.isPlaying; g.isPlaying = true;
            try { g.advanceTimelineProgress(1000); } finally { g.isPlaying = playing; }
            window.saveManager.saveGame(false); lastResult = 'Added one active mining second through the real clock.';
        } else if (name === 'story-check') {
            const playing = g.isPlaying; g.isPlaying = true;
            try { g.advanceStoryEvents(500); } finally { g.isPlaying = playing; }
            if (g.isStoryOpen) revealTestView();
            lastResult = g.isStoryOpen ? 'Production story is open. Close to save its one royalty reward.'
                : g.storyProgress?.seen.includes('hitsng') ? 'Royalties are saved. Repeated checks cannot grant another reward.'
                : 'No story opened: inspect the helper count, 730s clock, arrival delay, focus or competing interaction.';
        } else if (name === 'stories-toggle') {
            g.storiesEnabled = g.storiesEnabled === false; window.saveManager.saveGame(false);
            lastResult = g.storiesEnabled ? 'Story popups enabled for this test save.' : 'Story popups suppressed. Completion effects still run; Welcome Back stays visible.';
        } else if (name === 'story-fail') {
            const save = window.saveManager;
            if (!save._checkpointOriginalStoryCommit) save._checkpointOriginalStoryCommit = save.commitStoryProgress;
            save.commitStoryProgress = function () {
                const active = g._activeStory;
                if (active && !g.storyProgress.pending.includes(active.id)) {
                    save.commitStoryProgress = save._checkpointOriginalStoryCommit; delete save._checkpointOriginalStoryCommit; return false;
                }
                return save._checkpointOriginalStoryCommit.call(save);
            };
            lastResult = 'The next story completion fails once. Its queue save still works. Close the story to see TRY AGAIN with the original reward state intact.';
        } else if (['history-first', 'history-legacy', 'history-many', 'history-stacked'].includes(name)) {
            historyPreset(name);
        } else if (name === 'history-view') {
            if (g.isMobileDevice()) {
                window.uiManager.switchMobileTab('achievements');
                if (!window.uiManager.mobileMenuOpen) window.uiManager.toggleMobileMenu();
            } else window.switchMainTab('achievements');
            g.updateTimelineHistoryUI(); revealTestView(); lastResult = 'Timeline records are in Statistics, below lifetime totals.';
        } else if (name === 'history-inventory') {
            g.openFortuneModal(); revealTestView(); lastResult = 'Protected copies keep their source artwork. After prestige, ×N tiles show combined earned totals.';
        } else if (name === 'history-step') {
            const playing = g.isPlaying; g.isPlaying = true;
            try { for (let index = 0; index < 10; index++) g.advanceTimelineProgress(1000); }
            finally { g.isPlaying = playing; }
            g.dogecoins += 1000; g.totalMined += 1000; g.updateUI(); window.saveManager.saveGame(false);
            lastResult = 'Added 1,000 earned coins and advanced ten active seconds through the real timeline clock.';
        } else if (name === 'history-fail') {
            const save = window.saveManager;
            if (!save._checkpointOriginalCommit) save._checkpointOriginalCommit = save.commitTimelineReset;
            save.commitTimelineReset = function () {
                save.commitTimelineReset = save._checkpointOriginalCommit; delete save._checkpointOriginalCommit; return false;
            };
            lastResult = 'The next mission save fails once. Finish reward review to test TRY AGAIN and verify that your original inventory/history remain intact.';
        } else if (name === 'history-choice') {
            const travel = window.timeTravelManager;
            if (g.isCutscenePlaying) throw new Error('Finish the active reward review or load another preset first.');
            travel.computePayout(); travel._chosenBadge = badge;
            travel.startCutscene(); travel._clearTimers(); travel._stopAllLoops();
            travel._cateland(); travel._clearTimers(); travel._skipAllowed = true; travel._showChoice();
            revealTestView(); lastResult = 'Production Attack/Go Home choice. Choose one, then Skip to the real reward review.';
        } else if (['bonus-earth', 'bonus-mars', 'bonus-titan', 'bonus-timeline-2', 'bonus-early'].includes(name)) {
            bonusPreset(name);
        } else if (name === 'bonus-weighted' || name === 'bonus-tier') {
            g._removeBonusCoinEl();
            const playing = g.isPlaying; g.isPlaying = true;
            try { g.spawnBonusCoin(name === 'bonus-tier' ? { tier: g.getBonusCoinTiers()[Number(tier)] || g.getBonusCoinTiers()[1] } : {}); }
            finally { g.isPlaying = playing; }
            lastResult = `${g._bonusCoinFieldTier?.name}: click within eight seconds. The selected-tier control deliberately bypasses unlocks for testing.`;
            if (document.getElementById('debug-console')) window.toggleDebugMode();
        } else if (name === 'bonus-roll' || name === 'bonus-high-roll' || name === 'bonus-success') {
            const playing = g.isPlaying; g.isPlaying = true;
            let result;
            try { result = g.rollForBonusCoin(name === 'bonus-high-roll' ? { random: () => .999999999 }
                : name === 'bonus-success' ? { random: () => 0 } : {}); }
            finally { g.isPlaying = playing; }
            lastResult = `Two-minute check: ${result}. Next eligible chance ${Math.round((g._bonusCoinSpawnChance ?? .22) * 100)}%.`;
            if (result === 'spawned' && document.getElementById('debug-console')) window.toggleDebugMode();
        } else if (name === 'bonus-expire') {
            g._expireBonusCoinBuff(); window.saveManager.saveGame(false); lastResult = 'Expired the active buff through the production cleanup path.';
        } else if (name === 'rick-near') {
            rickPreset();
        } else if (name === 'rick-remove') {
            g.despawnRick(); lastResult = 'Rick removed. Aura DPS returns to zero immediately.';
        } else if (['prestige-million', 'prestige-cap', 'prestige-paw', 'prestige-planets', 'prestige-timeline-2',
            'prestige-timeline-10', 'prestige-timeline-11', 'prestige-preservation'].includes(name)) {
            prestigePreset(name);
        } else if (name === 'prestige-quote' || name === 'prestige-choices' || name === 'prestige-review' || name === 'history-review') {
            const travel = window.timeTravelManager;
            if (g.isCutscenePlaying) throw new Error('Finish the current mission rewards or load another preset first.');
            travel.computePayout();
            if (name === 'prestige-review' || name === 'history-review') {
                travel.closeMissionBrief();
                travel._chosenBadge = ['luck', 'wow', 'loot'].includes(badge) ? badge : 'luck';
                travel._missionChoice = name === 'history-review' && ['attack', 'go_home'].includes(choice) ? choice : null;
                travel._rewardsShown = false;
                g.isPlaying = false; g.isCutscenePlaying = true;
                travel._showRewards();
                lastResult = 'Production reward review. Complete all OK buttons to save the payout and next timeline.';
            } else {
                travel.openMissionBrief(true);
                travel._step = name === 'prestige-choices' ? travel._script.length - 1 : 5;
                travel._renderStep(); travel._finishTyping?.();
                lastResult = 'Production D.I.A. preview. Canceling or reloading before completion grants nothing.';
            }
            if (typeof debugMode !== 'undefined' && debugMode) window.toggleDebugMode();
        } else if (name === 'coin-hover') {
            g.createCoinPile(100, g.getCoinPileSprite(20), 20);
            lastResult = 'Hover the rock coin to see the shared lift, wobble, pointer lean and settle. Click to collect normally.';
        } else if (name === 'offline-replay') {
            const saved = localStorage.getItem(LAST_SOURCE);
            if (!saved) throw new Error('Run an offline preset first.');
            apply(JSON.parse(saved));
            lastResult = `Replayed the same snapshot. Its one credit is ${g.formatNumber(g.offlineEarningsReport?.amount || 0)}; saved wallet ${g.formatNumber(g.dogecoins)}.`;
        } else if (name.startsWith('offline-') || name === 'beta-offline') {
            const durations = { 'offline-hour': 3600000, 'offline-cap': 72 * 3600000,
                'offline-short': 4 * 60000, 'offline-zero': 3600000, 'offline-refresh': 3600000, 'beta-offline': 3600000 };
            const data = scenarioSave({ planet, zeroDps: name === 'offline-zero' });
            data.timestamp -= durations[name];
            if (name === 'beta-offline') data.betaMigrationReport = { version: 'dm2-beta-1',
                fingerprint: `parity-beta-${Date.now()}`, createdAt: Date.now(), acknowledged: false,
                totalsBefore: { dpc: 200, dps: 1500, luck: 50, wow: 75, critChance: .5 },
                totalsAfter: { dpc: 1, dps: 150, luck: 0, wow: 0, critChance: 0 }, itemChanges: [], rockChanges: [] };
            localStorage.setItem(LAST_SOURCE, JSON.stringify(data));
            apply(data);
            const award = g.offlineEarningsReport?.amount || 0;
            lastResult = `${name === 'offline-cap' ? '72h away (24h cap)' : name === 'offline-short' ? '4m away (below threshold)' : '1h away'}: +${g.formatNumber(award)} coins, already saved.`;
            if (name === 'offline-refresh') window.location.reload();
            else g.scheduleOfflineEarningsReport(500);
        } else if (name === 'search-planets') {
            const data = scenarioSave();
            data.moonHelpers = [{ type: 'moonBase', dps: window.shopManager.getCurrentHelperUpgradeInfo('moonBase').dps }];
            data.helperUpgradeOffers = { earth: ['miningShibe', null, null], moon: ['moonBase', null, null] };
            data.searchdogeDiscovery = window.DogeMinerSearchdoge.normalize(null, 1, 161000);
            Object.assign(data.searchdogeDiscovery.planets.earth, { attempts: 3, sinceFoundMs: 8000 });
            Object.assign(data.searchdogeDiscovery.planets.moon, { attempts: 1, sinceFoundMs: 12000 });
            apply(data);
            window.switchMainTab('upgrades');
            lastResult = 'Earth and Moon each have a found offer and a different saved search clock. Use the planet tabs, then reload.';
        } else if (name === 'search-first' || name === 'search-prestige') {
            const timeline = name === 'search-prestige' ? 2 : 1;
            apply(scenarioSave({ timeline }));
            if (timeline === 1) {
                g.searchdogeDiscovery.runTimeMs = 161000;
                g.searchdogeDiscovery.planets.earth.sinceFoundMs = 17001;
                window.saveManager.saveGame(false);
            }
            window.switchMainTab('upgrades');
            lastResult = timeline > 1 ? 'Timeline 2: first guaranteed discovery after 9s; later searches every 6s at the 3s check cadence.'
                : 'First timeline: eligible now. Wait for 3s checks and rising odds, or use Force next discovery.';
        } else if (name === 'search-find' || name === 'search-fill') {
            const limit = g.searchdogeSlot3Unlocked ? 3 : 2;
            for (let i = 0; i < (name === 'search-fill' ? limit : 1); i++) {
                const clock = g.searchdogeDiscovery.planets[g.currentLevel];
                g.searchdogeDiscovery.runTimeMs = Math.max(161000, g.searchdogeDiscovery.runTimeMs);
                clock.sinceFoundMs = 17001; clock.pauseMs = 0;
                const playing = g.isPlaying; g.isPlaying = true;
                try { g.tryFindSearchdogeUpgrade({ random: () => 0 }); } finally { g.isPlaying = playing; }
            }
            lastResult = `Found ${window.uiManager.updateUpgradeTabCount()} offer(s). Buy one and watch that slot return to searching.`;
        } else if (name === 'search-step') {
            const playing = g.isPlaying; g.isPlaying = true;
            try { for (let i = 0; i < 3; i++) g.advanceSearchdogeDiscovery(1000); } finally { g.isPlaying = playing; }
            window.saveManager.saveGame(false);
            lastResult = 'Advanced three seconds through the production search clock.';
        } else if (name === 'pause') {
            if (g.isBetaReportOpen || g.isOfflineReportOpen || g.isStoryOpen || g.isIntroPlaying || g.isCutscenePlaying || g.isTransitioning
                || g._dogebagReveal || document.querySelector('.dia-mission-modal.active, .dia-warning-modal.active, .switcher-modal.active')) {
                throw new Error('Close the active report or finish the transition before resuming mining.');
            }
            g.isPlaying = !g.isPlaying;
            g.isMouseDown = false; g.isSpaceDown = false; g.clickTimes = []; g.endSwing();
            lastResult = g.isPlaying ? 'Mining resumed. Rock clicks and helper income work immediately.' : 'Simulation paused for exact checks. Choose Resume mining to play.';
        } else if (name === 'reload') {
            window.saveManager.saveGame(false); window.location.reload();
        } else if (name === 'fresh') {
            if (window.CEParityTesting.checkpoint >= 6) previewFeature(selectedFeature);
            else if (window.CEParityTesting.checkpoint === 5) storyPreset('story-ready');
            else if (window.CEParityTesting.checkpoint === 4) historyPreset('history-first');
            else if (window.CEParityTesting.checkpoint === 3) bonusPreset('bonus-earth');
            else { apply(scenarioSave()); lastResult = 'Fresh checkpoint scene: four eligible helper types, two searching slots, five diamonds.'; }
        } else throw new Error('Unknown checkpoint preset');
        updateTestBanner();
        return { message: lastResult, coins: g.dogecoins, credit: g.offlineEarningsReport?.amount || 0,
            found: window.uiManager.updateUpgradeTabCount(), payout: window.timeTravelManager?._payout };
    }

    function mountReview(container,section) {
        container.style.zIndex='22002';
        const make=(tag,text,parent=section)=>{const el=document.createElement(tag);if(text)el.textContent=text;parent.append(el);return el;};
        const result=make('p','');result.className='parity-test-result';result.setAttribute('role','status');
        const render=()=>{result.textContent=lastResult;updateTestBanner();};
        const button=(text,action,parent=section)=>{const el=make('button',text,parent);el.type='button';el.addEventListener('click',async()=>{el.disabled=true;try{await action();}catch(error){lastResult=error.message;}finally{el.disabled=false;render();}});return el;};
        const select=(text,key,options,parent=section)=>{const label=make('label',text+' ',parent),el=make('select','',label);el.dataset[key]='';for(const [value,name]of options){const option=make('option',name,el);option.value=value;}return el;};
        const details=(text,open=false)=>{const el=make('details');el.open=open;make('summary',text,el);return el;};
        const seasons=details('Seasons · scenes, items & all nine eggs',true);
        make('p','Each preview replaces only this temporary test save. Choose 9 eggs with Golden reward unchecked to play the completion story.',seasons);
        let saved={};try{saved=JSON.parse(localStorage.getItem('parity:season-controls'))||{};}catch{}
        const season=select('Season','paritySeason',[['none','Ordinary / no event'],['easter','Easter'],['halloween','Halloween'],['xmas','Christmas']],seasons);
        const planet=select('Planet','paritySeasonPlanet',PLANETS.map(id=>[id,id[0].toUpperCase()+id.slice(1)]),seasons);
        const eggs=select('Eggs found','parityEggCount',Array.from({length:10},(_,i)=>[String(i),i+' / 9']),seasons);
        season.value=['none','easter','halloween','xmas'].includes(saved.season)?saved.season:'easter';planet.value=PLANETS.includes(saved.planet)?saved.planet:window.game.currentLevel;eggs.value=String(Number.isInteger(saved.count)&&saved.count>=0&&saved.count<=9?saved.count:0);
        const goldenLabel=make('label','',seasons),golden=make('input','',goldenLabel);golden.type='checkbox';golden.dataset.parityGolden='';golden.checked=!!saved.golden;goldenLabel.append(document.createTextNode(' Golden reward earned (9 eggs)'));
        const options=()=>({season:season.value,planet:planet.value,count:Number(eggs.value),golden:!golden.disabled&&golden.checked});
        const remember=()=>{golden.disabled=eggs.value!=='9';localStorage.setItem('parity:season-controls',JSON.stringify(options()));};
        for(const el of [season,planet,eggs,golden])el.addEventListener('change',remember);remember();
        button('Show season',()=>previewSeason(options()),seasons).dataset.parityScenario='season-preview';
        button('Next background',()=>{if((window.game._seasonalPreview||'none')!==season.value||window.game.currentLevel!==planet.value)previewSeason(options());window.game.rotateBackground();revealTestView();lastResult='Next '+season.value+' background · '+window.game.backgrounds[window.game.currentBackgroundIndex];},seasons);
        for(const kind of ['pickaxe','fortune'])button('Show all '+(kind==='pickaxe'?'seasonal pickaxes':'seasonal fortunes'),()=>{if(season.value==='none')throw new Error('Choose Easter, Halloween or Christmas first.');return previewSeason({...options(),items:true,inventory:kind});},seasons);
        const location=select('Hidden egg location','parityEggLocation',window.DogeMinerSeasonal.eggs.map(id=>[String(id),typeof id==='number'?PLANETS[id-1]:{setting:'Settings',inv1:'Pickaxe inventory',inv2:'Fortune inventory',upgrade:'Upgrades'}[id]]),seasons);
        button('Show hidden egg',()=>previewEggLocation(/^\d$/.test(location.value)?Number(location.value):location.value),seasons);
        button('Play ninth egg → golden reward',()=>run('feature-preview',{scene:'holiday-complete'}),seasons);

        const category=select('Change category','parityCategory',[['all','All changes'],...REVIEW_GROUPS.map((group,index)=>[String(index),group.label])]);
        const searchLabel=make('label','Search changes '),search=make('input','',searchLabel);search.type='search';search.placeholder='Rick, inventory, cloud, story…';search.dataset.paritySearch='';
        const feature=select('Preview','parityFeature',[]),matches=make('p','');matches.className='parity-match-count';
        const draw=()=>{
            const previous=feature.value||selectedFeature,query=search.value.trim().toLowerCase(),seen=new Set();feature.replaceChildren();
            REVIEW_GROUPS.forEach((group,index)=>{
                if(category.value!=='all'&&category.value!==String(index))return;
                const entries=group.features.filter(([id,name])=>!seen.has(id)&&(group.label+' '+name+' '+id).toLowerCase().includes(query));
                if(!entries.length)return;
                const optgroup=make('optgroup','',feature);optgroup.label=group.label;
                for(const [id,name]of entries){if(seen.has(id))continue;seen.add(id);const option=make('option',name,optgroup);option.value=id;option.dataset.action=String(!!group.action);}
            });
            if(seen.has(previous))feature.value=previous;
            selectedFeature=feature.value;show.disabled=!seen.size;matches.textContent=seen.size+' preview'+(seen.size===1?'':'s')+' available';
        };
        const parameters=details('Options for income, prestige & Bonus Coin previews');
        const reportPlanet=select('Report planet','parityPlanet',PLANETS.map(id=>[id,id]),parameters);
        const badge=select('Reward badge','parityBadge',[['luck','Luck'],['wow','Wow'],['loot','Loot Find']],parameters);
        const choice=select('Mission choice','parityMissionChoice',[['attack','Attack'],['go_home','Go home']],parameters);
        const tier=select('Bonus Coin tier','parityBonusTier',window.game.getBonusCoinTiers().slice(1).map(t=>[String(t.level),t.level+' · +'+Math.round(t.boost*100)+'% / '+t.duration+'s']),parameters);
        const show=button('Show selected change',async()=>{
            const id=feature.value,action=feature.selectedOptions[0]?.dataset.action==='true';
            selectedFeature=id;localStorage.setItem('parity:feature',id);
            await run(action?id:'feature-preview',{scene:id,planet:reportPlanet.value,badge:badge.value,choice:choice.value,tier:Number(tier.value)});
            revealTestView();
        });show.dataset.parityScenario='feature-preview';
        feature.addEventListener('change',()=>{selectedFeature=feature.value;});category.addEventListener('change',draw);search.addEventListener('input',draw);draw();
        const session=details('Test session');
        button('Pause / resume mining',()=>run('pause'),session);button('Reload test save',()=>run('reload'),session);
        // Keep status last so errors remain visible after any expanded group.
        section.append(result);render();container.prepend(section);
        const timer=setInterval(render,1000);return()=>clearInterval(timer);
    }

    function mount(container) {
        const section = document.createElement('section');
        section.className = 'parity-checkpoint-tools';
        const checkpoint = window.CEParityTesting?.checkpoint || 45;
        let renderView = () => {};
        const title = document.createElement('h3'); title.textContent = checkpoint >= 69 ? 'Beta v0.1 · Release review' : checkpoint >= 63 ? 'Checkpoints 63–65 · Mobile & Controller' : checkpoint >= 58 ? 'Checkpoints 58–62 · Verification' : checkpoint >= 56 ? 'Beta Review' : checkpoint >= 53 ? 'Checkpoints 53–55 · Layouts & Secrets' : checkpoint >= 49 ? 'Checkpoints 49–52 · Holidays & Egg Hunt' : checkpoint >= 48 ? 'Checkpoint 48 · Start, Continue & Import' : checkpoint >= 47 ? 'Checkpoint 47 · DM2 Save Import' : checkpoint >= 46 ? 'Checkpoint 46 · Cloud Save Safety' : checkpoint >= 41 ? 'Checkpoints 41–45 · Visitors & Discovery' : checkpoint >= 36 ? 'Checkpoints 36–40 · Tools & Fusion' : ['','Checkpoint 1 · Income & Searchdoge',
            'Checkpoint 2 · Prestige rewards','Checkpoint 3 · Bonus Coins & Rick', 'Checkpoint 4 · Timelines & Fortunes', 'Checkpoint 5 · Stories & Royalties', 'Checkpoint 6 · Goals & Return Stories', 'Checkpoint 7 · Planet Discoveries', 'Checkpoint 8 · Rig, Contact & Titan', 'Checkpoint 9 · Inventory & Motion', 'Checkpoint 10 · Field Loot', 'Checkpoint 11 · Helper Loot', 'Checkpoint 12 · Auto Loot & Buy Max', 'Checkpoint 13 · Shop Details', 'Checkpoint 14 · Mining Feedback', 'Checkpoint 15 · Statistics & Upgrades', 'Checkpoint 16 · Return & Review', 'Checkpoint 17 · Helper Hover & Names', 'Checkpoint 18 · Field Personality', 'Checkpoint 19 · Mining Text & Buttons', 'Checkpoint 20 · Notifications & Motion Notice', 'Checkpoint 21 · Planet Backgrounds', 'Checkpoints 22–24 · HUD, Income & Audio', 'Checkpoints 22–24 · HUD, Income & Audio', 'Checkpoints 22–24 · HUD, Income & Audio', 'Checkpoints 25–27 · Performance & Swipes', 'Checkpoints 25–27 · Performance & Swipes', 'Checkpoints 25–27 · Performance & Swipes', 'Checkpoints 28–30 · Gate, Evolution & Launch', 'Checkpoints 28–30 · Gate, Evolution & Launch', 'Checkpoints 28–30 · Gate, Evolution & Launch', 'Checkpoints 31–35 · Late Progression & Upgrades', 'Checkpoints 31–35 · Late Progression & Upgrades', 'Checkpoints 31–35 · Late Progression & Upgrades', 'Checkpoints 31–35 · Late Progression & Upgrades', 'Checkpoints 31–35 · Late Progression & Upgrades'][checkpoint]; section.appendChild(title);
        function button(label, action, parent = section) {
            const node = document.createElement('button'); node.type = 'button'; node.textContent = label;
            node.addEventListener('click', () => {
                try { action(); renderView(); } catch (error) { lastResult = error.message; renderView(); }
            }); parent.appendChild(node); return node;
        }
        if (!active()) {
            const info = document.createElement('p'); info.textContent = 'Run checkpoint presets in a separate muted test tab.'; section.appendChild(info);
            button('Open checkpoint sandbox', () => window.CEParityTesting.openSandbox());
            container.prepend(section); return () => {};
        }
        const info = document.createElement('p'); info.textContent = 'Temporary test save · muted · cloud off'; section.appendChild(info);
        if (checkpoint >= 56 && fullReview()) {
            container.querySelector('.legacy-debug-tools')?.remove();
            return mountReview(container,section);
        }
        if (checkpoint >= 6) {
            container.querySelector('.legacy-debug-tools')?.remove();
            const label = document.createElement('label'); label.textContent = 'Feature ';
            const select = document.createElement('select'); select.dataset.parityFeature = '';
            for (const [id, text] of featureChoices()) {
                const option = document.createElement('option'); option.value = id; option.textContent = text; select.appendChild(option);
            }
            select.value = selectedFeature;
            select.addEventListener('change', () => { selectedFeature = select.value; });
            label.appendChild(select); section.appendChild(label);
            const preview = button('Show feature', () => run('feature-preview', { scene: select.value }));
            preview.dataset.parityScenario = 'feature-preview';
            const result = document.createElement('p'); result.className = 'parity-test-result'; result.setAttribute('role', 'status');
            result.textContent = lastResult; section.appendChild(result);
            renderView = () => { result.textContent = lastResult; updateTestBanner(); };
            const timer = setInterval(updateTestBanner, 1000);
            container.prepend(section); return () => clearInterval(timer);
        }
        const pauseButton = button('Resume mining', () => run('pause'));
        pauseButton.dataset.parityScenario = 'pause';
        function group(label, open) {
            const node = document.createElement('details'); node.open = open;
            const summary = document.createElement('summary'); summary.textContent = label;
            node.appendChild(summary); section.appendChild(node); return node;
        }
        const stories = group('Checkpoint 5 · Stories & Royalties', checkpoint === 5);
        const storyHelp = document.createElement('p');
        storyHelp.textContent = 'Paused Mars scenes. Five DJs, 730s in this timeline and >8.2s since arrival unlock the story. Close it to save the flat DPS once.'; stories.appendChild(storyHelp);
        const storyToggle = button('Suppress story popups', () => run('stories-toggle'), stories);
        storyToggle.dataset.parityScenario = 'stories-toggle';
        for (const [text, id] of [['Load four DJs · blocked', 'story-four'], ['Load five DJs · 729s', 'story-short'],
            ['Load five DJs · 730s', 'story-ready'], ['Load timeline 2 · five DJs', 'story-timeline-2'],
            ['Load claimed royalty reward', 'story-claimed'], ['Load stories suppressed', 'story-suppressed'],
            ['Load saved pending story', 'story-pending'], ['Queue behind Welcome Back', 'story-offline'],
            ['Pass arrival delay', 'story-delay'], ['Add one mining second', 'story-time'],
            ['Step story check', 'story-check'], ['Fail next story completion once', 'story-fail']]) {
            const node = button(text, () => run(id), stories); node.dataset.parityScenario = id;
        }
        const records = group('Checkpoint 4 · Timelines & Fortunes', checkpoint === 4);
        const recordsHelp = document.createElement('p');
        recordsHelp.textContent = 'Scenes load paused. Earned copies combine only when the mission is saved. Lifetime totals stay intact.'; records.appendChild(recordsHelp);
        function selector(label, attribute, options) {
            const row = document.createElement('label'); row.textContent = label + ' ';
            const select = document.createElement('select'); select.dataset[attribute] = '';
            for (const [value, text] of options) { const option = document.createElement('option'); option.value = value; option.textContent = text; select.appendChild(option); }
            row.appendChild(select); records.appendChild(row); return select;
        }
        const recordChoice = selector('Mission choice', 'parityMissionChoice', [['attack', 'Attack'], ['go_home', 'Go home']]);
        const recordBadge = selector('Reward badge', 'parityRecordBadge', [['luck', 'Luck'], ['wow', 'Wow'], ['loot', 'Loot Find']]);
        for (const [text, id] of [['Load first tracked run', 'history-first'], ['Load veteran Alpha save', 'history-legacy'],
            ['Load 30 completed timelines', 'history-many'], ['Load existing protected stacks', 'history-stacked'],
            ['View timeline history', 'history-view'], ['View Fortune inventory', 'history-inventory'],
            ['Add 1K earned coins + 10s', 'history-step'], ['Play mission choice', 'history-choice'],
            ['Review rewards · selected choice', 'history-review'], ['Fail next mission save once', 'history-fail']]) {
            const node = button(text, () => run(id, { choice: recordChoice.value, badge: recordBadge.value }), records); node.dataset.parityScenario = id;
        }
        const bonus = group('Checkpoint 3 · Bonus Coins & Rick', checkpoint === 3);
        const bonusHelp = document.createElement('p');
        bonusHelp.textContent = 'Scenes load paused. Coin actions close these tools for the 8s claim window. Rick visits last 30s; drag him or a group to compare DPS.'; bonus.appendChild(bonusHelp);
        const tierLabel = document.createElement('label'); tierLabel.textContent = 'Preview tier ';
        const tierSelect = document.createElement('select'); tierSelect.dataset.parityBonusTier = '';
        for (const tier of window.game.getBonusCoinTiers().slice(1)) {
            const option = document.createElement('option'); option.value = tier.level;
            option.textContent = `${tier.level} · +${Math.round(tier.boost * 100)}% / ${tier.duration}s`; tierSelect.appendChild(option);
        }
        tierLabel.appendChild(tierSelect); bonus.appendChild(tierLabel);
        for (const [text, id] of [['Load Earth · tier 1', 'bonus-earth'], ['Load Mars reached · no bases', 'bonus-mars'],
            ['Load Titan reached · tiers 1–5', 'bonus-titan'], ['Load timeline 2 · Earth + Omega', 'bonus-timeline-2'],
            ['Load nine Shibes · early offer', 'bonus-early'], ['Spawn weighted coin', 'bonus-weighted'],
            ['Spawn selected tier', 'bonus-tier'], ['Step two-minute check', 'bonus-roll'],
            ['High roll · build odds', 'bonus-high-roll'], ['Force successful check', 'bonus-success'],
            ['Expire current buff', 'bonus-expire'], ['Load Rick · nearby groups', 'rick-near'], ['Remove Rick', 'rick-remove']]) {
            const node = button(text, () => run(id, { tier: tierSelect.value }), bonus); node.dataset.parityScenario = id;
        }
        const prestige = group('Checkpoint 2 · Prestige rewards', checkpoint === 2);
        const explanation = document.createElement('p');
        explanation.textContent = 'These buttons replace the test save and pause mining to compare D.I.A. payouts. Choose Resume mining above to play.';
        prestige.appendChild(explanation);
        const badgeLabel = document.createElement('label'); badgeLabel.textContent = 'Reward badge ';
        const badgeSelect = document.createElement('select'); badgeSelect.dataset.parityBadge = '';
        for (const [value, text] of [['luck', 'Luck'], ['wow', 'Wow'], ['loot', 'Loot Find']]) {
            const option = document.createElement('option'); option.value = value; option.textContent = text; badgeSelect.appendChild(option);
        }
        badgeLabel.appendChild(badgeSelect); prestige.appendChild(badgeLabel);
        for (const [text, id] of [['Load 1M coins · 8 pickaxes', 'prestige-million'], ['Load 1T coins · first badge cap', 'prestige-cap'],
            ['Paw only · zero helpers', 'prestige-paw'], ['Helpers on all five planets', 'prestige-planets'],
            ['Badge: timeline 2', 'prestige-timeline-2'], ['Badge: timeline 10', 'prestige-timeline-10'],
            ['Badge: timeline 11', 'prestige-timeline-11'], ['Preserve earned Alpha rewards', 'prestige-preservation'],
            ['View mission quote', 'prestige-quote'], ['View badge choices', 'prestige-choices'],
            ['Review rewards · skip cutscene', 'prestige-review']]) {
            const node = button(text, () => run(id, { badge: badgeSelect.value }), prestige); node.dataset.parityScenario = id;
        }
        const income = group('Checkpoint 1 · Income & Searchdoge', checkpoint === 1);
        const label = document.createElement('label'); label.textContent = 'Offline report planet ';
        const theme = document.createElement('select');
        for (const planet of PLANETS) { const option = document.createElement('option'); option.value = planet;
            option.textContent = planet[0].toUpperCase() + planet.slice(1); theme.appendChild(option); }
        label.appendChild(theme); income.appendChild(label);
        for (const [text, id] of [['Offline: 1 hour', 'offline-hour'], ['Offline: 72h / cap', 'offline-cap'],
            ['Offline: 4m / no credit', 'offline-short'], ['Offline: zero DPS', 'offline-zero'],
            ['Offline + refresh', 'offline-refresh'], ['Replay last snapshot', 'offline-replay'],
            ['Beta → welcome back', 'beta-offline'], ['Search: first timeline', 'search-first'],
            ['Search: timeline 2', 'search-prestige'], ['Search: two planets', 'search-planets'], ['Force next discovery', 'search-find'],
            ['Fill found slots', 'search-fill'], ['Step search 3s', 'search-step'],
            ['Coin hover sample', 'coin-hover']]) {
            const node = button(text, () => run(id, { planet: theme.value }), income); node.dataset.parityScenario = id;
        }
        for (const [text, id] of [['Reload test save', 'reload'], ['Fresh checkpoint scene', 'fresh']]) {
            const node = button(text, () => run(id)); node.dataset.parityScenario = id;
        }
        const result = document.createElement('p'); result.className = 'parity-test-result'; result.setAttribute('role', 'status'); section.appendChild(result);
        const stats = document.createElement('pre'); stats.className = 'parity-test-stats'; section.appendChild(stats);
        function render() {
            if (!active() || !window.game) return;
            updateTestBanner();
            result.textContent = lastResult;
            const g = window.game, state = g.searchdogeDiscovery, clock = state?.planets[g.currentLevel];
            pauseButton.textContent = g.isPlaying ? 'Pause simulation' : 'Resume mining';
            storyToggle.textContent = g.storiesEnabled === false ? 'Enable story popups' : 'Suppress story popups';
            if (checkpoint === 5) {
                const run = g.getCurrentTimelineStats(), state = g.getStoryProgressForSave();
                stats.textContent = `${g.isPlaying ? 'Running' : 'Paused'} · ${g.currentLevel} · timeline ${g.timelineNumber}\n`
                    + `DJs ${g.marsHelpers.filter(helper => helper.type === 'djKittenz').length} / 5 · time ${Math.floor(run.playTimeMs / 1000)} / 730s\n`
                    + `Arrival gate ${Math.max(0, Math.ceil((g._storyLocationStartedAt + 8201 - Date.now()) / 1000))}s · stories ${g.storiesEnabled === false ? 'suppressed' : 'shown'}\n`
                    + `Pending ${state.pending.join(', ') || '—'} · seen ${state.seen.join(', ') || '—'}\n`
                    + `Royalty +${g.formatNumber(g.getStoryDPS())} · DPS ${g.formatNumber(g.dps)} · offline ${g.formatNumber(g.getOfflineDPS())}`;
                return;
            }
            if (checkpoint === 4) {
                const run = g.getCurrentTimelineStats(), records = g.timelineProgress?.completed || [];
                const copies = g.fortuneInventory.reduce((sum, item) => sum + TimeTravelManager.fortuneCopies(item), 0);
                stats.textContent = `${g.isPlaying ? 'Running' : 'Paused'} · timeline ${g.timelineNumber}\n`
                    + `Earned ${run.estimated ? 'at least ' : ''}${g.formatNumber(run.earnedCoins)} · ${g.formatTime(Math.floor(run.playTimeMs / 1000))}\n`
                    + `Lifetime mined ${g.formatNumber(g.totalMined)}\n`
                    + `Completed records ${records.length} · diamonds ${g.dogediamonds}\n`
                    + `Fortune tiles ${g.fortuneInventory.length} · earned copies ${copies}`;
                return;
            }
            if (checkpoint === 3) {
                stats.textContent = `${g.isPlaying ? 'Running' : 'Paused'} · ${g.currentLevel} · timeline ${g.timelineNumber}\n`
                    + `Pool ${g.getUnlockedBonusCoinTiers().map(tier => tier.level).join('/')} · next chance ${Math.round((g._bonusCoinSpawnChance ?? .22) * 100)}%\n`
                    + `Next check ${Math.max(0, Math.ceil((g._bonusCoinNextCheckTime - Date.now()) / 1000))}s · claims ${g.bonusCoinClaimCount || 0}\n`
                    + `Field tier ${g._bonusCoinFieldTier?.level || '—'} · buff ${g.bonusCoinBuffTier || '—'} / ${Math.max(0, Math.ceil((g.bonusCoinBuffEndTime - Date.now()) / 1000))}s\n`
                    + `DPS ${g.formatNumber(g.dps)} · permanent ${g.formatNumber(g.getOfflineDPS())}\n`
                    + `Rick base bonus +${g.formatNumber(g.getRickAuraBaseDPS())} · radius ${Math.round(g.getRickAuraRadius())}`;
                return;
            }
            const rules = window.DogeMinerSearchdoge.config(g.timelineNumber);
            const chance = rules.chances[Math.min(clock?.attempts || 0, rules.chances.length - 1)];
            stats.textContent = `${g.isPlaying ? 'Running' : 'Paused'} · ${g.currentLevel} · timeline ${g.timelineNumber}\n`
                + `Coins ${g.formatNumber(g.dogecoins)} · permanent DPS ${g.formatNumber(g.getOfflineDPS())}\n`
                + `Search play time ${Math.floor((state?.runTimeMs || 0) / 1000)}s · misses ${clock?.attempts || 0}\n`
                + `Since found ${Math.floor((clock?.sinceFoundMs || 0) / 1000)}s · next chance ${Math.min(100, Math.round(chance * 100))}%`;
            const p = window.timeTravelManager?._payout;
            if (p) stats.textContent += `\n${window.timeTravelManager._payoutApplied ? 'Completed' : g.isPlaying ? 'Last quote' : 'Quoted'}: ${p.coinDiamonds} coin + ${p.pickaxeDiamonds} pickaxe = ${p.total} diamonds\nBadge +${g.formatNumber(p.badgeStat)} · owned diamonds ${g.dogediamonds}`;
        }
        renderView = render; render(); const timer = setInterval(render, 1000);
        container.prepend(section); return () => clearInterval(timer);
    }

    function initialize() {
        if (!active()) return;
        window.CEParityTesting.mute();
        if (window.CEParityTesting.checkpoint >= 6) {
            const savedFeature = localStorage.getItem('parity:feature'), choices = featureChoices();
            selectedFeature = choices.some(([id]) => id === savedFeature) ? savedFeature : choices[0][0];
            if (!localStorage.getItem('parity:feature')) window.game.isPlaying = false;
            lastResult = 'Choose a preview or open Seasons. Test tools and Ctrl+\\ reopen this menu.';
        }
        if(window.CEParityTesting.checkpoint>=56){
            const launcher=document.createElement('button');launcher.id='parity-tools-launcher';launcher.type='button';launcher.textContent='Test tools';
            launcher.addEventListener('click',()=>window.toggleDebugMode());document.documentElement.append(launcher);
        }
        repairLegacyPresetStarter();
        const banner = document.createElement('div'); banner.id = 'parity-test-banner';
        banner.dataset.checkpoint = String(window.CEParityTesting.checkpoint);
        document.documentElement.appendChild(banner);
        updateTestBanner();
        const signIn = document.getElementById('sign-in-section');
        if (signIn) signIn.textContent = 'Cloud saving is disabled in the checkpoint sandbox.';
    }
    window.ParityCheckpointTests = Object.freeze({ run, mount, initialize, previewSeason, previewEggLocation, reviewGroups: REVIEW_GROUPS });
})();
