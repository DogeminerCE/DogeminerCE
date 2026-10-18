// Local checkpoint controls are never part of the game runtime or native payload.
(function () {
    'use strict';
    if (!['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)
        || !window.CEParityTesting?.active || window.CEParityTesting.error) return;
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

        this.frameRequest = requestAnimationFrame(() => this.update());
    }
    stop() {
        cancelAnimationFrame(this.frameRequest);
        this.fpsElement?.remove();
        this.fpsElement = null;
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
            window.performanceMonitor.stop();
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
        position:fixed; bottom:20px; left:10px; background:#25231fee; color:#fff;
        padding:12px; border:1px solid #b99a59; border-radius:8px; font-family:monospace;
        font-size:12px; z-index:10000; width:330px; max-width:calc(100vw - 44px);
        max-height:calc(100dvh - 70px); overflow-y:auto; box-sizing:border-box;
    `;

    debugConsole.innerHTML = `
        <details class="legacy-debug-tools"><summary>Current game tools</summary>
        <button onclick="game.dogecoins += 1000">+1000 Coins</button>
        <button onclick="game.dogecoins += 10000">+10000 Coins</button>
        <button onclick="game.dogecoins = 40000000000000000; game.updateUI();" style="background: #ff6b6b; color: white;">+40 Quadrillion Coins</button>
        <button onclick="game.dps += 100">+100 DPS</button>
        <button onclick="game.rotateBackground()">Rotate Background</button>
        <button onclick="game.forceRickSpawn()">Spawn Rick</button>
        <button onclick="game.createDogebag()">Spawn Dogebag</button>
        <button onclick="game.mysteryBoxTimerRemaining = 0; game.startMysteryBoxTimer()">Skip Mystery Box Timer</button>
        <button onclick="game.spawnBonusCoin()">Spawn Bonus Coin</button>
        <button onclick="debugLevelUpBonusCoin()">Preview next Bonus tier</button>
        <button onclick="game.createDiamondLoot()">Spawn Dogediamond</button>
        <button onclick="game.dogediamonds += 5; game.dogediamondsEverObtained += 5; game.updateDiamondCounter(); game.updateUI();">+5 Dogediamonds</button>
        <button onclick="window.timeTravelManager && timeTravelManager.openMissionBrief(true)">Open D.I.A. Mission</button>
        <button onclick="debugGrantAllPickaxes()">Grant all Pickaxes</button>
        <button onclick="debugGrantAllFortunes()">Grant all Fortunes</button>
        <button onclick="saveManager.repairSave()">Repair Save</button>
        </details>
        <button class="debug-close" onclick="toggleDebugMode()">Close Debug · Ctrl+\\</button>
    `;

    debugConsole._cleanup = window.ParityCheckpointTests?.mount(debugConsole);
    document.documentElement.appendChild(debugConsole);
}

function removeDebugConsole() {
    const debugConsole = document.getElementById('debug-console');
    if (debugConsole) {
        debugConsole._cleanup?.();
        debugConsole.remove();
    }
}

function debugLevelUpBonusCoin() {
    if (!window.game) return;
    const g = window.game;
    const tiers = g.getBonusCoinTiers();
    g._bonusCoinPreviewLevel = ((g._bonusCoinPreviewLevel || 0) % (tiers.length - 1)) + 1;
    const tier = tiers[g._bonusCoinPreviewLevel];
    g._removeBonusCoinEl();
    const playing = g.isPlaying; g.isPlaying = true;
    try { g.spawnBonusCoin({ tier }); } finally { g.isPlaying = playing; }
    g.showNotification(`Preview: ${tier.name} · eight seconds to claim`);
}

function debugGrantAllPickaxes() {
    if (!window.game || !window.game.pickaxeFactory || !window.game.pickaxeFactory.loaded) {
        console.error('Pickaxe factory not loaded');
        return;
    }
    const factory = window.game.pickaxeFactory;
    let count = 0;
    for (const templateId of Object.keys(factory.templates)) {
        const pickaxe = factory.generatePickaxe(
            templateId,
            window.game.maxPickaxeDPC,
            window.game.playerStats.wow
        );
        if (pickaxe) {
            window.game.addPickaxeToInventory(pickaxe);
            count++;
        }
    }
    window.game.showNotification(`Granted ${count} pickaxes!`);
    console.log(`Debug: Granted ${count} pickaxes to inventory`);
}

function debugGrantAllFortunes() {
    if (!window.game || !window.game.fortuneFactory || !window.game.fortuneFactory.loaded) {
        console.error('Fortune factory not loaded');
        return;
    }
    const factory = window.game.fortuneFactory;
    let count = 0;
    let lastFortune = null;
    for (const templateId of Object.keys(factory.templates)) {
        if (templateId === 'badge_of_patronage') continue;
        const template = factory.templates[templateId];
        if (!template) continue;

        const instanceId = `fortune_${templateId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const stats = factory._rollStats(template.statTemplates, window.game.playerStats.luck, window.game.playerStats.lootFind);

        const fortune = {
            instanceId,
            templateId,
            name: template.name,
            rarity: template.rarity,
            description: template.description,
            stats,
            sprite: template.sprite
        };

        window.game.fortuneInventory.push(fortune);
        lastFortune = fortune;
        count++;
    }
    window.game.recalculatePlayerStats();
    if (lastFortune && typeof window.game.setLatestObtainedFortune === 'function') {
        window.game.setLatestObtainedFortune(lastFortune);
    }
    window.game.showNotification(`Granted ${count} fortunes!`);
    console.log(`Debug: Granted ${count} fortunes to inventory`);
}

    Object.assign(window, { toggleDebugMode, debugLevelUpBonusCoin, debugGrantAllPickaxes, debugGrantAllFortunes });
    document.addEventListener('keydown', event => {
        if (event.ctrlKey && (event.code === 'Backslash' || event.key === '\\')) {
            event.preventDefault();
            toggleDebugMode();
        }
    });
})();
