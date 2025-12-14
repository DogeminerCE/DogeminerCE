// DogeMiner: Community Edition - Main Initialization
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});

// Prevent context menu on right click everywhere
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

async function initializeGame() {
    try {
        showLoadingScreen();
        updateLoadingInfo('Initializing game engine...');
        
        // Initialize game instance
        game = new DogeMinerGame();
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
        audioManager = new AudioManager();
        audioManager.init();
        window.audioManager = audioManager; // Make available for SaveManager
        updateLoadingInfo('Initializing save system...');
        
        saveManager = new SaveManager(game);
        updateLoadingInfo('Preparing notifications...');
        
        notificationManager = new NotificationManager(game);
        updateLoadingInfo('Loading game data...');
        
        // Try to load existing save
        const saveLoaded = saveManager.loadGame();
        if (!saveLoaded) {
            // No save found, start new game
            notificationManager.showInfo('Welcome to DogeMiner: Community Edition!');
        } else {
            // Make sure character sprite and rock are correctly set based on current level
            const mainCharacter = document.getElementById('main-character');
            const mainRock = document.getElementById('main-rock');
            const platform = document.getElementById('platform');
            
            if (mainCharacter && mainRock && game) {
                // Set correct character sprite
                if (game.currentLevel === 'earth') {
                    mainCharacter.src = 'assets/general/character/standard.png';
                    mainRock.src = 'assets/general/rocks/earth.png';
                    if (platform) {
                        platform.src = '../assets/quickUI/dogeplatform.png';
                    }
                    document.body.classList.remove('moon-theme');
                    document.body.classList.remove('planet-mars');
                    document.body.classList.remove('planet-jupiter');
                    document.body.classList.remove('planet-titan');
                    game.backgrounds = [
                        'backgrounds/bg1.jpg',
                        'backgrounds/bg3.jpg',
                        'backgrounds/bg4.jpg',
                        'backgrounds/bg5.jpg',
                        'backgrounds/bg6.jpg',
                        'backgrounds/bg7.jpg',
                        'backgrounds/bg9.jpg',
                        'backgrounds/bg-new.jpg'
                    ];
                } else if (game.currentLevel === 'moon') {
                    mainCharacter.src = 'assets/general/character/spacehelmet.png';
                    mainRock.src = 'assets/general/rocks/moon.png';
                    if (platform) {
                        platform.src = '../assets/quickUI/dogeplatformmoon.png';
                    }
                    document.body.classList.remove('planet-mars');
                    document.body.classList.remove('planet-jupiter');
                    document.body.classList.remove('planet-titan');
                    
                    // Make sure moon is unlocked in UI
                    if (uiManager) {
                        uiManager.hideMoonLocked();
                    }
                } else if (game.currentLevel === 'mars') {
                    mainCharacter.src = 'assets/general/character/party.png';
                    mainRock.src = 'assets/general/rocks/mars.png';
                    if (platform) {
                        platform.src = '../assets/quickUI/marsdogeplatform.png';
                    }
                    document.body.classList.remove('moon-theme');
                    document.body.classList.remove('planet-jupiter');
                    document.body.classList.remove('planet-titan');
                    document.body.classList.add('planet-mars');
                    game.backgrounds = [
                        'backgrounds/bg6.jpg',
                        'assets/backgrounds/bg101.jpg', // Mars extras live under play/assets/backgrounds/
                        'assets/backgrounds/bg102.jpg',
                        'assets/backgrounds/bg103.jpg',
                        'assets/backgrounds/bg104.jpg',
                        'assets/backgrounds/bg105.jpg',
                        'backgrounds/bg-new.jpg'
                    ];
                } else if (game.currentLevel === 'jupiter') {
                    // Jupiter reuses the space suit but swaps to the dedicated platform art.
                    mainCharacter.src = 'assets/general/character/spacehelmet.png';
                    mainRock.src = 'assets/general/rocks/jupiter.png';
                    if (platform) {
                        platform.src = '../assets/quickUI/jupiterdogeplatform.png';
                    }
                    document.body.classList.remove('moon-theme');
                    document.body.classList.remove('planet-mars');
                    document.body.classList.remove('planet-titan');
                    document.body.classList.add('planet-jupiter');
                    game.backgrounds = [
                        'assets/backgrounds/bgjup01.jpg',
                        'assets/backgrounds/bgjup02.jpg',
                        'assets/backgrounds/bgjup03.jpg',
                        'assets/backgrounds/dogewow.jpg'
                    ];
                } else if (game.currentLevel === 'titan') {
                    // Titan uses the space helmet like Jupiter and Moon
                    mainCharacter.src = 'assets/general/character/spacehelmet.png';
                    mainRock.src = 'assets/general/rocks/titan.png';
                    if (platform) {
                        // Titan uses its own platform
                        platform.src = '../assets/quickUI/titandogeplatform.png';
                    }
                    document.body.classList.remove('moon-theme');
                    document.body.classList.remove('planet-mars');
                    document.body.classList.remove('planet-jupiter');
                    document.body.classList.add('planet-titan');
                    game.backgrounds = [
                        'assets/backgrounds/titan02.jpg',
                        'assets/backgrounds/titan03.jpg',
                        'assets/backgrounds/titan04.jpg',
                        'assets/backgrounds/titan05.jpg'
                    ];
                }

                // Make sure the background DOM nodes reflect the resolved pool for this load-in planet.
                game.syncBackgroundImages?.(true);
                
                // Force update shop content and planet tabs if on Moon, Mars, Jupiter, or Titan
                if ((game.currentLevel === 'moon' || game.currentLevel === 'mars' || game.currentLevel === 'jupiter' || game.currentLevel === 'titan') && uiManager) {
                    uiManager.initializePlanetTabs?.();
                    setTimeout(() => {
                        uiManager.updateShopContent();
                    }, 100); // Short delay to ensure UI is ready
                }
            }
        }
        
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
            
            // Play doge intro animation
            if (game.currentLevel === 'earth') {
                game.playDogeIntro();
            } else {
                game.playDogeIntro(true);
            }
            
            // Start background music only if enabled
            if (audioManager && game && game.musicEnabled) {
                audioManager.playBackgroundMusic();
            }
            
            notificationManager.showSuccess('Game loaded successfully!');
        }, 500);
        
    } catch (error) {
        console.error('Error initializing game:', error);
        hideLoadingScreen();
        alert('Error initializing game. Please refresh the page.');
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
        'assets/backgrounds/bg/bg1.jpg',
        'assets/backgrounds/bg/bgmoon01.jpg',
        'assets/backgrounds/bg/bg4.jpg',
        'assets/backgrounds/bg/bgjup01.jpg',
        
        // Rocks
        'assets/general/rocks/earth.png',
        'assets/general/rocks/moon.png',
        'assets/general/rocks/mars.png',
        'assets/general/rocks/jupiter.png',
        
        // Characters
        'assets/general/character/standard.png',
        'assets/general/character/happydoge.png',
        'assets/general/character/spacehelmet.png',
        
        // Icons
        'assets/general/dogecoin_70x70.png',
        'assets/general/persec_icon.png',
        'assets/general/logo.png',
        
        // Helper icons
        'assets/helpers/helpers/shibes/shibes-idle-0.png',
        'assets/helpers/helpers/kittens/kittens-idle-0.png',
        'assets/helpers/helpers/kennels/kennels-idle-0.png',
        'assets/helpers/helpers/rockets/rockets-idle-0.png',
        'assets/helpers/helpers/marsbase/marsbase-idle-0.png',
        
        // Pickaxe icons
        'assets/items/items/pickaxes/standard.png',
        'assets/items/items/pickaxes/stronger.png',
        'assets/items/items/pickaxes/golden.png',
        'assets/items/items/pickaxes/rocketaxe.png'
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

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fpsElement = null;
    }
    
    start() {
        this.fpsElement = document.createElement('div');
        this.fpsElement.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: #fff;
            padding: 5px 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
        `;
        document.body.appendChild(this.fpsElement);
        
        this.update();
    }
    
    update() {
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            if (this.fpsElement) {
                this.fpsElement.textContent = `FPS: ${this.fps}`;
            }
        }
        
        requestAnimationFrame(() => this.update());
    }
}

// Debug mode
let debugMode = false;

function toggleDebugMode() {
    debugMode = !debugMode;
    
    if (debugMode) {
        // Enable debug features
        if (!window.performanceMonitor) {
            window.performanceMonitor = new PerformanceMonitor();
            window.performanceMonitor.start();
        }
        
        // Add debug console
        addDebugConsole();
        
        console.log('Debug mode enabled');
    } else {
        // Disable debug features
        if (window.performanceMonitor) {
            window.performanceMonitor.fpsElement?.remove();
            window.performanceMonitor = null;
        }
        
        removeDebugConsole();
        
        console.log('Debug mode disabled');
    }
}

function addDebugConsole() {
    const debugConsole = document.createElement('div');
    debugConsole.id = 'debug-console';
    debugConsole.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: #fff;
        padding: 10px;
        border-radius: 5px;
        font-family: monospace;
        font-size: 12px;
        z-index: 10000;
        max-width: 300px;
    `;
    
    debugConsole.innerHTML = `
        <div>Debug Console</div>
        <button onclick="game.dogecoins += 1000">+1000 Coins</button>
        <button onclick="game.dogecoins += 10000">+10000 Coins</button>
        <button onclick="game.dogecoins = 40000000000000000; game.updateUI();" style="background: #ff6b6b; color: white;">+40 Quadrillion Coins</button>
        <button onclick="game.dps += 100">+100 DPS</button>
        <button onclick="game.rotateBackground()">Rotate Background</button>
        <button onclick="game.forceRickSpawn()">Spawn Rick</button>
        <button onclick="saveManager.repairSave()">Repair Save</button>
        <button onclick="toggleDebugMode()">Close Debug</button>
    `;
    
    document.body.appendChild(debugConsole);
}

function removeDebugConsole() {
    const debugConsole = document.getElementById('debug-console');
    if (debugConsole) {
        debugConsole.remove();
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Toggle debug mode with Ctrl+\
    if (e.ctrlKey && e.key === '\\') {
        e.preventDefault();
        toggleDebugMode();
    }
    
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
    
    if (notificationManager) {
        notificationManager.showError('An error occurred. Check console for details.');
    }
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    
    if (notificationManager) {
        notificationManager.showError('An error occurred. Check console for details.');
    }
});

// Service Worker registration (for PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Global variables are now properly declared at the top of the file
