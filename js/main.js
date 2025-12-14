// DogeMiner: Community Edition - Main Initialization
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});

async function initializeGame() {
    try {
        showLoadingScreen();
        updateLoadingProgress(10);
        
        // Initialize game instance
        game = new DogeMinerGame();
        updateLoadingProgress(30);
        
        // Initialize managers
        uiManager = new UIManager(game);
        updateLoadingProgress(50);
        
        shopManager = new ShopManager(game);
        updateLoadingProgress(70);
        
        saveManager = new SaveManager(game);
        updateLoadingProgress(80);
        
        notificationManager = new NotificationManager(game);
        updateLoadingProgress(90);
        
        // Try to load existing save
        if (!saveManager.loadGame()) {
            // No save found, start new game
            notificationManager.showInfo('Welcome to DogeMiner: Community Edition!');
        }
        
        updateLoadingProgress(100);
        
        // Hide loading screen after a short delay
        setTimeout(() => {
            hideLoadingScreen();
            game.isPlaying = true;
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

function switchShopTab(tabName) {
    if (uiManager) {
        uiManager.switchShopTab(tabName);
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
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        loadingScreen.classList.remove('hidden');
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

function updateLoadingProgress(progress) {
    const progressBar = document.getElementById('loading-progress');
    if (progressBar) {
        progressBar.style.width = progress + '%';
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
    // Toggle debug mode with F12
    if (e.key === 'F12') {
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

// Export for debugging
window.game = game;
window.uiManager = uiManager;
window.shopManager = shopManager;
window.saveManager = saveManager;
window.notificationManager = notificationManager;
