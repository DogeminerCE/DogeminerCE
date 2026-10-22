// DogeMiner: Community Edition - Main Initialization
const startGameWhenReady = () => initializeGame();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startGameWhenReady);
} else {
    // Fallback loader inserts scripts after DOM is ready, so boot immediately in that case.
    startGameWhenReady();
}

// Prevent context menu on right click everywhere
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

async function initializeGame() {
    try {
        if (window.CEParityTesting?.active && window.CEParityTesting.error) throw new Error(window.CEParityTesting.error);
        window.CEParityTesting?.mute?.();
        showLoadingScreen();
        updateLoadingInfo('Initializing game engine...');
        if (['DogeMinerSaveReconciliation', 'DogeMinerDM2Import', 'DogeMinerDM2ImportData', 'DogeMinerLZString', 'DogeMinerLandingSave', 'DogeMinerSeasonal', 'DogeMinerLayout', 'DogeMinerSecrets'].some(name => !window[name])
            || typeof DogeMinerGame.prototype.getSeasonalForSave !== 'function' || typeof DogeMinerGame.prototype.getLayoutForSave !== 'function'
            || !window.DogeMinerReleaseNotes || !window.DogeMinerRockReplacement || !window.DogeMinerRickVisitor || !window.DogeMinerEncounters || !window.DogeMinerToolAudio || !window.DogeMinerToolProfiles || !window.DogeMinerDrills || !window.DogeMinerSunDogeFusion || !window.DogeMinerTools || !window.DogeMinerUpgradePresentation || !window.DogeMinerLateProgression || !window.DogeMinerMoonLaunch || !window.DogeMinerMobileGestures || !window.DogeMinerFrameClock || !window.DogeMinerPerformance || !window.DogeMinerBonusHud || !window.DogeMinerMotionNotice || !window.DogeMinerEventNotifications || !window.DogeMinerButtonMotion || !window.DogeMinerFieldPersonality || !window.DogeMinerHelperNames || !window.DogeMinerHelperShopDetails || !window.DogeMinerBulkShop || !window.DogeMinerLootAutomation || !window.DogeMinerHelperLoot || !window.DogeMinerFieldLoot || !window.PopupPresentation || !window.DogeMinerBalance || !window.BetaSaveMigration || !window.BetaBalanceReport || !window.WelcomeBackReport || !window.DogeMinerOfflineEarnings || !window.DogeMinerTimelineHistory || !window.DogeMinerStories || !window.DogeMinerStoryHistory || !window.DogeMinerNewsDoge || !window.DogeMinerWorldDiscovery || !window.DogeMinerSearchdoge || !window.LootMotion || typeof DogeMinerGame.prototype.scheduleOfflineEarningsReport !== 'function' || typeof DogeMinerGame.prototype.animateMysteryBoxOpening !== 'function') {
            throw new Error('Game balance or loot presentation files could not be loaded. Your existing save has not been changed; please refresh.');
        }

        // Initialize game instance
        game = new DogeMinerGame();
        game.isPlaying = false;

        // Set initial planet attribute for CSS targeting
        document.body.dataset.planet = game.currentLevel;

        // Initialize and load both item factories concurrently
        updateLoadingInfo('Loading item templates...');
        game.pickaxeFactory = new PickaxeFactory();
        game.fortuneFactory = new FortuneFactory();
        try {
            await Promise.all([
                game.pickaxeFactory.loadTemplates(),
                game.fortuneFactory.loadTemplates()
            ]);
            if (game.pickaxeFactory.loadErrors?.length || game.fortuneFactory.loadErrors?.length) {
                throw new Error('Item data could not be loaded completely. Your existing save has not been changed; please refresh.');
            }
            // Pass active sprite set to game for click animation
            game._activeSpritePaths = game.pickaxeFactory.templatesWithActiveSprite;
        } catch (err) {
            console.error('Failed to load item templates:', err);
            throw err;
        }

        updateLoadingInfo('Setting up shop system...');

        // Initialize shop manager first (needed by UI manager)
        shopManager = new ShopManager(game);
        window.shopManager = shopManager; // Make available immediately
        updateLoadingInfo('Building user interface...');

        // Initialize UI manager (depends on shop manager)
        uiManager = new UIManager(game);
        window.uiManager = uiManager; // Expose early for save/load routines
        updateLoadingInfo('Loading audio system...');

        // Initialize audio manager
        try {
            audioManager = new AudioManager();
            audioManager.init();
            window.audioManager = audioManager; // Make available for SaveManager
        } catch (error) {
            console.error('Failed to initialize audio manager:', error);
            console.warn('Game will continue without audio');
            // Create a dummy audio manager so the game doesn't break
            audioManager = {
                musicEnabled: false,
                soundEnabled: false,
                playSound: () => { },
                playBackgroundMusic: () => { },
                stopBackgroundMusic: () => { },
                pauseBackgroundMusic: () => { },
                resumeBackgroundMusic: () => { },
                switchToMoonMusic: () => { },
                switchToMarsMusic: () => { },
                switchToJupiterMusic: () => { },
                switchToTitanMusic: () => { },
                switchToEarthMusic: () => { }
            };
            window.audioManager = audioManager;
        }
        updateLoadingInfo('Initializing save system...');

        saveManager = new SaveManager(game);
        window.saveManager = saveManager;
        updateLoadingInfo('Preparing notifications...');

        notificationManager = new NotificationManager(game);

        // Time Travel / D.I.A. mission system
        try {
            window.timeTravelManager = new TimeTravelManager(game);
        } catch (error) {
            console.warn('Time Travel system unavailable:', error);
        }

        // Initialize controller support (Xbox gamepad / any standard gamepad)
        updateLoadingInfo('Setting up controller support...');
        try {
            controllerManager = new ControllerManager(game, uiManager, shopManager);
            window.controllerManager = controllerManager;
        } catch (error) {
            console.warn('Controller support unavailable:', error);
        }

        updateLoadingInfo('Loading game data...');

        // Try to load existing save
        let saveLoaded = saveManager.loadGame();
        const landingImport = await window.DogeMinerLandingSave?.consume(saveManager);
        if (landingImport?.imported) saveLoaded = true;
        else if (landingImport?.error) notificationManager.showError(landingImport.error.message);
        if (saveManager.loadError) throw saveManager.loadError;
        if (!saveLoaded) {
            // No save found, start new game
            notificationManager.showInfo('Welcome to DogeminerCE!');
        } else {
            // Make sure character sprite and rock are correctly set based on current level
            const mainCharacter = document.getElementById('main-character');
            const mainRock = document.getElementById('main-rock');
            const platform = document.getElementById('platform');

            if (mainCharacter && mainRock && game) {
                // Set correct character sprite
                if (game.currentLevel === 'earth') {
                    mainCharacter.src = 'assets/general/character/standard.webp';
                    mainRock.src = 'assets/general/rocks/earth.webp';
                    if (platform) {
                        platform.src = '../assets/quickUI/dogeplatform.webp';
                    }
                    document.body.classList.remove('moon-theme');
                    document.body.classList.remove('planet-mars');
                    document.body.classList.remove('planet-jupiter');
                    document.body.classList.remove('planet-titan');
                } else if (game.currentLevel === 'moon') {
                    mainCharacter.src = 'assets/general/character/spacehelmet.webp';
                    mainRock.src = 'assets/general/rocks/moon.webp';
                    if (platform) {
                        platform.src = '../assets/quickUI/dogeplatformmoon.webp';
                    }
                    document.body.classList.remove('planet-mars');
                    document.body.classList.remove('planet-jupiter');
                    document.body.classList.remove('planet-titan');

                    // Make sure moon is unlocked in UI
                    if (uiManager) {
                        uiManager.hideMoonLocked();
                    }
                } else if (game.currentLevel === 'mars') {
                    mainCharacter.src = 'assets/general/character/party.webp';
                    mainRock.src = 'assets/general/rocks/mars.webp';
                    if (platform) {
                        platform.src = '../assets/quickUI/marsdogeplatform.webp';
                    }
                    document.body.classList.remove('moon-theme');
                    document.body.classList.remove('planet-jupiter');
                    document.body.classList.remove('planet-titan');
                    document.body.classList.add('planet-mars');
                } else if (game.currentLevel === 'jupiter') {
                    // Jupiter reuses the space suit but swaps to the dedicated platform art.
                    mainCharacter.src = 'assets/general/character/spacehelmet.webp';
                    mainRock.src = 'assets/general/rocks/jupiter.webp';
                    if (platform) {
                        platform.src = '../assets/quickUI/jupiterdogeplatform.webp';
                    }
                    document.body.classList.remove('moon-theme');
                    document.body.classList.remove('planet-mars');
                    document.body.classList.remove('planet-titan');
                    document.body.classList.add('planet-jupiter');
                } else if (game.currentLevel === 'titan') {
                    // Titan uses the space helmet like Jupiter and Moon
                    mainCharacter.src = 'assets/general/character/spacehelmet.webp';
                    mainRock.src = 'assets/general/rocks/titan.webp';
                    if (platform) {
                        // Titan uses its own platform
                        platform.src = '../assets/quickUI/titandogeplatform.webp';
                    }
                    document.body.classList.remove('moon-theme');
                    document.body.classList.remove('planet-mars');
                    document.body.classList.remove('planet-jupiter');
                    document.body.classList.add('planet-titan');
                }

                // Make sure the background DOM nodes reflect the resolved pool for this load-in planet.
                game.setPlanetBackgrounds(game.currentLevel, { reset: true });

                // Force update shop content and planet tabs if on Moon, Mars, Jupiter, or Titan
                if ((game.currentLevel === 'moon' || game.currentLevel === 'mars' || game.currentLevel === 'jupiter' || game.currentLevel === 'titan') && uiManager) {
                    uiManager.initializePlanetTabs?.();
                    setTimeout(() => {
                        uiManager.updateShopContent();
                    }, 100); // Short delay to ensure UI is ready
                }
            }
        }

        // Populate the mobile/forced-mobile bar before dismissing the loader.
        game.updateMobileHelperBar();

        // CloudSaveManager will be initialized by cloud-save.js
        updateLoadingInfo('Finalizing...');

        updateLoadingInfo('Ready!');

        // Hide loading screen after a short delay
        setTimeout(() => {
            hideLoadingScreen();
            game.isPlaying = true;
            // Make game and managers globally available
            window.game = game;
            window.uiManager = uiManager;
            // window.shopManager already assigned above
            window.saveManager = saveManager;
            window.notificationManager = notificationManager;
            // window.audioManager already assigned above

            // Let returning Alpha players review their saved changes before gameplay.
            window.DogeMinerPerformance.bind(game);
            window.DogeMinerMobileGestures.install(game,uiManager);
            game._bootComplete = true;
            if (!game.layoutPreference) game.restoreLayout?.(null);
            game.startSeasonal?.();
            window.DogeMinerMotionNotice.start(game, notificationManager);
            game._introAfterBetaReport = !!game.betaMigrationReport && !game.betaMigrationReport.acknowledged;
            if (!game.showPendingBetaMigrationReport()) {
                game.playDogeIntro(game.currentLevel !== 'earth');
            }

            game.scheduleOfflineEarningsReport?.();
            window.ParityCheckpointTests?.initialize();

            // Start background music only if enabled
            if (audioManager && game && game.musicEnabled) {
                audioManager.playBackgroundMusic();
            }

            // Force update UI one last time to ensure everything is rendered
            game.updateUI();
            if (game.isMobileDevice()) {
                game.updateMobileHelperBar();
            }

            notificationManager.showSuccess('Game loaded successfully!');
        }, 500);

    } catch (error) {
        if (game) game.isPlaying = false;
        console.error('Error initializing game:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Error name:', error.name);
        hideLoadingScreen();
        alert('Error initializing game: ' + (error.message || error.toString()) + '. Please check console and refresh.');
    }
}

// Global functions for UI interactions
function switchMainTab(tabName) {
    if (uiManager) {
        uiManager.switchMainTab(tabName);
    }
}

function switchAchievementsTab(tabName) {
    if (uiManager) {
        uiManager.switchAchievementsTab(tabName);
    }
}

function switchMobileTab(tabName) {
    if (uiManager) {
        uiManager.switchMobileTab(tabName);
    }
}



function saveGame() {
    if (saveManager) {
        saveManager.saveGame();
    }
}

function loadGame() {
    if (saveManager) {
        saveManager.loadGame();
    }
}

function exportSave() {
    if (saveManager) {
        saveManager.exportSave();
    }
}

function importSave() {
    if (saveManager) {
        saveManager.importSave();
    }
}

// Pickaxe & Fortune modal functions
function openPickaxeModal() {
    if (window.game) {
        window.game.openPickaxeModal();
    }
}

function closePickaxeModal() {
    if (window.game) {
        window.game.closePickaxeModal();
    }
}

function openFortuneModal() {
    if (window.game) {
        window.game.openFortuneModal();
    }
}

function closeFortuneModal() {
    if (window.game) {
        window.game.closeFortuneModal();
    }
}

window.openSupporterModal = function() {
    // Fill the ID if logged in
    const input = document.getElementById('supporter-save-id-display');
    if (input) {
        if (window.firebase && window.firebase.auth && window.firebase.auth.currentUser) {
            input.value = window.firebase.auth.currentUser.uid;
        } else {
            input.value = "Please sign into Cloud Save first...";
        }
    }
    const modal = document.getElementById('supporter-modal');
    if (modal) {
        const donateContent = document.getElementById('supporter-donate-content');
        const perksContent = document.getElementById('supporter-perks-content');
        const title = modal.querySelector('.modal-title');

        if (window.game && window.game.isSupporter) {
            // Show perks overview, hide donation content
            if (donateContent) donateContent.style.display = 'none';
            if (perksContent) perksContent.style.display = 'block';
            if (title) title.textContent = 'SUPPORTER PERKS ACTIVE';
        } else {
            // Show donation content, hide perks overview
            if (donateContent) donateContent.style.display = 'block';
            if (perksContent) perksContent.style.display = 'none';
            if (title) title.textContent = 'BECOME A SUPPORTER';
        }

        modal.classList.add('active');
    }
};

window.closeSupporterModal = function() {
    const modal = document.getElementById('supporter-modal');
    if (modal) modal.classList.remove('active');
};

window.copySupporterSaveId = function() {
    const input = document.getElementById('supporter-save-id-display');
    if (!input || input.value === "Please sign into Cloud Save first...") {
        if (window.notificationManager) {
            window.notificationManager.showWarning("You must sign into Cloud Save first!");
        }
        return;
    }

    // Select and copy
    input.select();
    input.setSelectionRange(0, 99999); /* For mobile devices */

    navigator.clipboard.writeText(input.value).then(() => {
        if (window.notificationManager) {
            window.notificationManager.showSuccess("Cloud Save ID copied to clipboard!");
        }
    }).catch(err => {
        console.error('Failed to copy ID: ', err);
        // Fallback for older browsers
        try {
            document.execCommand("copy");
            if (window.notificationManager) {
                window.notificationManager.showSuccess("Cloud Save ID copied to clipboard!");
            }
        } catch (e) {
            if (window.notificationManager) window.notificationManager.showError("Failed to copy automatically.");
        }
    });
};

function toggleStatsSidebar(inventoryType) {
    const sidebar = document.getElementById(`${inventoryType}-stats-sidebar`);
    if (sidebar) {
        sidebar.classList.toggle('mobile-open');
    }
}

// Dogebag modal functions
function openDogebagContents() {
    if (window.game) {
        window.game.openDogebagContents();
    }
}

function dogebagEquip() {
    if (window.game) {
        window.game.dogebagEquip();
    }
}

function closeDogebagModal() {
    if (window.game) window.game.closeDogebagModal();
}

function dogebagLoot() {
    if (window.game) {
        window.game.dogebagLoot();
    }
}

function toggleForceMobileUI(enabled) {
    if (window.game?.setLayoutMode) return window.game.setLayoutMode(enabled ? 'phone' : 'auto');
    if (enabled) {
        document.body.classList.add('force-mobile');
    } else {
        document.body.classList.remove('force-mobile');
    }
    localStorage.setItem('forceMobileUI', enabled ? '1' : '0');
    if (window.game && window.shopManager) {
        game.updateMobileHelperBar();
        if (enabled) {
            window.uiManager?.updateMobileShopContent();
            if (window.uiManager?.activeMobileTab === 'upgrades') uiManager.updateMobileUpgradesContent();
        }
    }

    // Sync both checkboxes
    const desktop = document.getElementById('force-mobile-ui');
    const mobile = document.getElementById('mobile-force-mobile-ui');
    if (desktop) desktop.checked = enabled;
    if (mobile) mobile.checked = enabled;
}

function toggleDisableController(disabled) {
    if (window.controllerManager) {
        window.controllerManager.setDisabledByUser(disabled);
    }
}

// Restore force mobile UI setting on load
(function () {
    if (localStorage.getItem('forceMobileUI') === '1') {
        document.body.classList.add('force-mobile');
        const cb = document.getElementById('force-mobile-ui');
        if (cb) cb.checked = true;
    }
    
    // Restore value update rate dropdown
    const updateRate = window.game?.getValueUpdateRate?.() ?? localStorage.getItem('valueUpdateRate') ?? '20';
    if (updateRate !== null) {
        const select = document.getElementById('value-update-rate');
        if (select) select.value = updateRate;
    }
})();

function resetGame() {
    if (saveManager) {
        saveManager.resetGame();
    }
}

// Loading screen functions
function showLoadingScreen(useFade = false) {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        loadingScreen.classList.remove('hidden', 'fade-out');

        if (useFade) {
            loadingScreen.classList.remove('fade-in');
            loadingScreen.style.opacity = '0';
            // Force reflow to allow transition to restart
            void loadingScreen.offsetWidth;
            loadingScreen.classList.add('fade-in');
            requestAnimationFrame(() => {
                loadingScreen.style.removeProperty('opacity');
            });
        } else {
            loadingScreen.classList.remove('fade-in');
            loadingScreen.style.opacity = '1';
        }
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.remove('fade-in');
        loadingScreen.classList.add('fade-out');

        // Remove inline opacity on next frame so CSS transition can take over
        requestAnimationFrame(() => {
            loadingScreen.style.removeProperty('opacity');
        });

        const fadeDuration = parseFloat(getComputedStyle(loadingScreen).getPropertyValue('--loading-fade-duration') || '1.5');
        const timeout = isNaN(fadeDuration) ? 1500 : fadeDuration * 1000;

        setTimeout(() => {
            loadingScreen.style.display = 'none';
            loadingScreen.classList.remove('fade-out');
            loadingScreen.style.opacity = '';
        }, timeout);
    }
}

function updateLoadingInfo(info) {
    const loadingInfo = document.getElementById('loading-info');
    if (loadingInfo) {
        loadingInfo.textContent = info;
    }
}

// Asset preloading
async function preloadAssets() {
    const assets = [
        // Backgrounds
        'assets/backgrounds/bg1.webp',
        'assets/backgrounds/bgmoon01.webp',
        'assets/backgrounds/bg4.webp',
        'assets/backgrounds/bgjup01.webp',

        // Rocks
        'assets/general/rocks/earth.webp',
        'assets/general/rocks/moon.webp',
        'assets/general/rocks/mars.webp',
        'assets/general/rocks/jupiter.webp',

        // Characters
        'assets/general/character/standard.webp',
        'assets/general/character/happydoge.webp',
        'assets/general/character/spacehelmet.webp',

        // Icons
        'assets/general/dogecoin_70x70.webp',
        'assets/general/persec_icon.webp',
        'assets/general/logo.webp',

        // Helper icons
        'assets/helpers/shibes/shibes-idle-0.webp',
        'assets/helpers/kittens/kittens-idle-0.webp',
        'assets/helpers/kennels/kennels-idle-0.webp',
        'assets/helpers/rockets/rockets-idle-0.webp',
        'assets/helpers/marsbase/marsbase-idle-0.webp',


        // Pickaxe icons
        'assets/items/pickaxes/Earth/Normal Pickaxe/standard.webp',
        'assets/items/pickaxes/Earth/Stronger Pickaxe/stronger.webp',
        'assets/items/pickaxes/Earth/Golden Pickaxe/golden.webp',
        'assets/items/pickaxes/Universal/Rocket-Powered Battle-Axe/rocketaxe.webp'
    ];

    const loadPromises = assets.map(asset => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(asset);
            img.onerror = () => reject(asset);
            img.src = asset;
        });
    });

    try {
        await Promise.all(loadPromises);
        console.log('All assets preloaded successfully');
    } catch (error) {
        console.warn('Some assets failed to load:', error);
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Quick save with Ctrl+S
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveGame();
    }

    // Quick load with Ctrl+L
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        loadGame();
    }

    // Toggle shop with S
    if (e.key === 's' && !e.ctrlKey) {
        switchMainTab('shop');
    }

    // Toggle upgrades with U
    if (e.key === 'u') {
        switchMainTab('upgrades');
    }

    // Toggle achievements with A
    if (e.key === 'a') {
        switchMainTab('achievements');
    }

    // Rotate background with B
    if (e.key === 'b') {
        if (game) {
            game.rotateBackground();
        }
    }
});

// Error handling
window.addEventListener('error', (e) => {
    console.error('Game error:', e.error);
    console.error('Error message:', e.message);
    console.error('Error filename:', e.filename);
    console.error('Error line:', e.lineno, 'col:', e.colno);
    console.error('Full event:', e);

    if (notificationManager) {
        notificationManager.showError('An error occurred: ' + (e.message || 'Unknown error'));
    }
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    console.error('Promise:', e.promise);

    if (notificationManager) {
        notificationManager.showError('Promise error: ' + (e.reason?.message || e.reason));
    }
});
