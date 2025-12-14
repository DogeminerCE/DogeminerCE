// DogeMiner: Community Edition - Save/Load System
class SaveManager {
    constructor(game) {
        this.game = game;
        this.saveKey = 'dogeminer_ce_save';
        this.backupKey = 'dogeminer_ce_backup';
        this.autoSaveInterval = 30000; // 30 seconds
        this.lastSave = Date.now();
        
        this.setupAutoSave();
        this.setupSaveFunctions();
        this.setupSettingsListeners();
    }
    
    setupAutoSave() {
        setInterval(() => {
            this.autoSave();
        }, this.autoSaveInterval);
        
        // Save before page unload
        window.addEventListener('beforeunload', () => {
            this.saveGame();
        });
    }
    
    setupSaveFunctions() {
        window.saveGame = () => {
            this.saveGame();
        };
        
        window.loadGame = () => {
            this.loadGame();
        };
        
        window.exportSave = () => {
            this.exportSave();
        };
        
        window.importSave = () => {
            this.importSave();
        };
        
        window.resetGame = () => {
            this.resetGame();
        };
    }
    
    setupSettingsListeners() {
        // Listen for notifications setting changes
        const notificationsCheckbox = document.getElementById('notifications-enabled');
        if (notificationsCheckbox) {
            notificationsCheckbox.addEventListener('change', (e) => {
                this.game.notificationsEnabled = e.target.checked;
                // Play check sound
                if (window.audioManager) {
                    window.audioManager.playSound('check');
                }
                // Trigger auto-save to save settings (don't show notification)
                this.saveGame(false);
            });
        }
        
        // Listen for auto-save setting changes
        const autoSaveCheckbox = document.getElementById('auto-save-enabled');
        if (autoSaveCheckbox) {
            autoSaveCheckbox.addEventListener('change', (e) => {
                this.game.autoSaveEnabled = e.target.checked;
                // Play check sound
                if (window.audioManager) {
                    window.audioManager.playSound('check');
                }
                // Trigger auto-save to save settings (don't show notification)
                this.saveGame(false);
            });
        }
    }
    
    saveGame(showNotification = true) {
        try {
            const saveData = this.createSaveData();
            const saveString = JSON.stringify(saveData);
            
            // Save to localStorage
            localStorage.setItem(this.saveKey, saveString);
            
            // Create backup
            localStorage.setItem(this.backupKey, saveString);
            
            this.lastSave = Date.now();
            
            // Only show notification if requested and notifications are enabled
            if (showNotification && this.game.notificationsEnabled) {
                this.game.showNotification('Game saved successfully!');
            }
            
            console.log('Game saved:', saveData);
            return true;
        } catch (error) {
            console.error('Error saving game:', error);
            if (this.game.notificationsEnabled) {
                this.game.showNotification('Error saving game!');
            }
            return false;
        }
    }
    
    loadGame() {
        try {
            const saveString = localStorage.getItem(this.saveKey);
            if (!saveString) {
                this.game.showNotification('No save data found!');
                return false;
            }
            
            const saveData = JSON.parse(saveString);
            this.applySaveData(saveData);
            
            // Notification handled by main.js
            console.log('Game loaded:', saveData);
            return true;
        } catch (error) {
            console.error('Error loading game:', error);
            
            // Try to load backup
            if (this.loadBackup()) {
                this.game.showNotification('Loaded from backup save!');
                return true;
            }
            
            this.game.showNotification('Error loading game!');
            return false;
        }
    }
    
    loadBackup() {
        try {
            const backupString = localStorage.getItem(this.backupKey);
            if (!backupString) return false;
            
            const saveData = JSON.parse(backupString);
            this.applySaveData(saveData);
            
            console.log('Loaded from backup:', saveData);
            return true;
        } catch (error) {
            console.error('Error loading backup:', error);
            return false;
        }
    }
    
    createSaveData() {
        const serializePlacedHelper = (helper) => {
            if (!helper) return null;
            const saveHelper = {
                type: helper.type,
                x: helper.x ?? 0,
                y: helper.y ?? 0,
                id: helper.id ?? (Date.now() + Math.random()),
                isMining: !!helper.isMining
            };

            if (helper.name) {
                saveHelper.name = helper.name;
            }

            return saveHelper;
        };

        const currentPlaced = Array.isArray(this.game.placedHelpers) ? this.game.placedHelpers : [];

        if (this.game.currentLevel === 'earth') {
            this.game.earthPlacedHelpers = [...currentPlaced];
        } else if (this.game.currentLevel === 'moon') {
            this.game.moonPlacedHelpers = [...currentPlaced];
        } else if (this.game.currentLevel === 'mars') {
            this.game.marsPlacedHelpers = [...currentPlaced];
        } else if (this.game.currentLevel === 'jupiter') {
            this.game.jupiterPlacedHelpers = [...currentPlaced];
        } else if (this.game.currentLevel === 'titan') {
            // Save titan placed helpers when creating save data from Titan planet
            this.game.titanPlacedHelpers = [...currentPlaced];
        }

        const earthPlacedHelpers = Array.isArray(this.game.earthPlacedHelpers)
            ? this.game.earthPlacedHelpers.map(serializePlacedHelper).filter(Boolean)
            : [];

        const moonPlacedHelpers = Array.isArray(this.game.moonPlacedHelpers)
            ? this.game.moonPlacedHelpers.map(serializePlacedHelper).filter(Boolean)
            : [];

        const marsPlacedHelpers = Array.isArray(this.game.marsPlacedHelpers)
            ? this.game.marsPlacedHelpers.map(serializePlacedHelper).filter(Boolean)
            : [];

        const jupiterPlacedHelpers = Array.isArray(this.game.jupiterPlacedHelpers)
            ? this.game.jupiterPlacedHelpers.map(serializePlacedHelper).filter(Boolean)
            : [];

        const titanPlacedHelpers = Array.isArray(this.game.titanPlacedHelpers)
            ? this.game.titanPlacedHelpers.map(serializePlacedHelper).filter(Boolean)
            : [];

        const helperData = currentPlaced.map(serializePlacedHelper).filter(Boolean);

        return {
            version: '1.0.0',
            timestamp: Date.now(),
            dogecoins: this.game.dogecoins,
            totalMined: this.game.totalMined,
            totalClicks: this.game.totalClicks,
            dps: this.game.dps,
            highestDps: this.game.highestDps,
            currentLevel: this.game.currentLevel,
            helpers: this.game.helpers,
            moonHelpers: this.game.moonHelpers,
            marsHelpers: this.game.marsHelpers,
            jupiterHelpers: this.game.jupiterHelpers, // Keep Jupiter helper ownership synced across reloads.
            titanHelpers: this.game.titanHelpers, // Keep Titan helper ownership synced across reloads.
            pickaxes: this.game.pickaxes,
            currentPickaxe: this.game.currentPickaxe,
            upgrades: this.game.upgrades || {},
            placedHelpers: helperData,
            earthPlacedHelpers,
            moonPlacedHelpers,
            marsPlacedHelpers,
            jupiterPlacedHelpers,
            titanPlacedHelpers,
            statistics: {
                totalPlayTime: this.game.totalPlayTime || 0,
                highestDps: this.game.highestDps || 0,
                helpersBought: this.game.helpersBought || 0,
                pickaxesBought: this.game.pickaxesBought || 0,
                achievements: this.game.achievements || [],
                startTime: this.game.startTime || Date.now()
            },
            settings: {
                soundEnabled: this.game.soundEnabled !== false,
                musicEnabled: this.game.musicEnabled !== false,
                notificationsEnabled: this.game.notificationsEnabled !== false,
                autoSaveEnabled: this.game.autoSaveEnabled !== false
            },
            cutscenes: {
                moonLaunch: !!this.game.hasPlayedMoonLaunch
            }
        };
    }

    applySaveData(saveData) {
        if (!this.validateSaveData(saveData)) {
            throw new Error('Invalid save data');
        }

        this.game.dogecoins = saveData.dogecoins || 0;
        this.game.totalMined = saveData.totalMined || 0;
        this.game.totalClicks = saveData.totalClicks || 0;
        this.game.dps = saveData.dps || 0;
        this.game.highestDps = saveData.highestDps || 0;
        this.game.currentLevel = saveData.currentLevel || 'earth';
        this.game.isTransitioning = false;

        this.game.helpers = Array.isArray(saveData.helpers)
            ? saveData.helpers.map(helper => ({ ...helper }))
            : [];
        this.game.moonHelpers = Array.isArray(saveData.moonHelpers)
            ? saveData.moonHelpers.map(helper => ({ ...helper }))
            : [];
        this.game.marsHelpers = Array.isArray(saveData.marsHelpers)
            ? saveData.marsHelpers.map(helper => ({ ...helper }))
            : [];
        this.game.jupiterHelpers = Array.isArray(saveData.jupiterHelpers)
            ? saveData.jupiterHelpers.map(helper => ({ ...helper }))
            : []; // Preserve Jupiter helper ownership for reloads.
        this.game.titanHelpers = Array.isArray(saveData.titanHelpers)
            ? saveData.titanHelpers.map(helper => ({ ...helper }))
            : []; // Preserve Titan helper ownership for reloads.
        this.game.pickaxes = saveData.pickaxes || ['standard'];
        this.game.currentPickaxe = saveData.currentPickaxe || 'standard';
        this.game.upgrades = saveData.upgrades || {};

        const rebuildPlacedHelpers = (helpersArray = [], planet = 'earth') => {
            if (!Array.isArray(helpersArray)) return [];

            let shopCategory;
            if (planet === 'moon') {
                shopCategory = window.shopManager?.shopData?.moonHelpers;
            } else if (planet === 'mars') {
                shopCategory = window.shopManager?.shopData?.marsHelpers;
            } else if (planet === 'jupiter') {
                shopCategory = window.shopManager?.shopData?.jupiterHelpers;
            } else if (planet === 'titan') {
                shopCategory = window.shopManager?.shopData?.titanHelpers;
            } else {
                shopCategory = window.shopManager?.shopData?.helpers;
            }

            return helpersArray
                .map(savedHelper => {
                    if (!savedHelper) return null;

                    // Only use helpers that exist in the current planet's shop category
                    const shopHelperData = shopCategory?.[savedHelper.type];
                    if (!shopHelperData) {
                        // Helper type doesn't exist on this planet, skip it
                        console.warn(`Skipping helper type '${savedHelper.type}' on ${planet} - not found in shop category`);
                        return null;
                    }

                    const helper = {
                        type: savedHelper.type,
                        x: savedHelper.x ?? 0,
                        y: savedHelper.y ?? 0,
                        id: savedHelper.id ?? (Date.now() + Math.random()),
                        isMining: !!savedHelper.isMining,
                        helper: shopHelperData,
                        dps: shopHelperData?.baseDps || 0
                    };

                    const rawName = savedHelper.name;
                    if (rawName && rawName !== savedHelper.type) {
                        helper.name = rawName;
                    } else if (shopHelperData?.name) {
                        helper.name = shopHelperData.name;
                    }

                    return helper;
                })
                .filter(Boolean);
        };

        let rawEarth = Array.isArray(saveData.earthPlacedHelpers) ? saveData.earthPlacedHelpers : [];
        let rawMoon = Array.isArray(saveData.moonPlacedHelpers) ? saveData.moonPlacedHelpers : [];
        let rawMars = Array.isArray(saveData.marsPlacedHelpers) ? saveData.marsPlacedHelpers : [];
        let rawJupiter = Array.isArray(saveData.jupiterPlacedHelpers) ? saveData.jupiterPlacedHelpers : [];
        let rawTitan = Array.isArray(saveData.titanPlacedHelpers) ? saveData.titanPlacedHelpers : [];

        if (!rawEarth.length && !rawMoon.length && !rawMars.length && !rawJupiter.length && !rawTitan.length && Array.isArray(saveData.placedHelpers)) {
            const savedLevel = saveData.currentLevel || 'earth';
            if (savedLevel === 'moon') {
                rawMoon = saveData.placedHelpers;
            } else if (savedLevel === 'mars') {
                rawMars = saveData.placedHelpers;
            } else if (savedLevel === 'jupiter') {
                rawJupiter = saveData.placedHelpers;
            } else if (savedLevel === 'titan') {
                rawTitan = saveData.placedHelpers;
            } else {
                rawEarth = saveData.placedHelpers;
            }
        }

        this.game.earthPlacedHelpers = rebuildPlacedHelpers(rawEarth, 'earth');
        this.game.moonPlacedHelpers = rebuildPlacedHelpers(rawMoon, 'moon');
        this.game.marsPlacedHelpers = rebuildPlacedHelpers(rawMars, 'mars');
        this.game.jupiterPlacedHelpers = rebuildPlacedHelpers(rawJupiter, 'jupiter');
        this.game.titanPlacedHelpers = rebuildPlacedHelpers(rawTitan, 'titan');

        const helperListsForUnlock = [
            this.game.helpers,
            this.game.moonHelpers,
            this.game.marsHelpers,
            this.game.jupiterHelpers,
            this.game.titanHelpers,
            this.game.earthPlacedHelpers,
            this.game.moonPlacedHelpers,
            this.game.marsPlacedHelpers,
            this.game.jupiterPlacedHelpers,
            this.game.titanPlacedHelpers
        ]; // Include all planet helpers when checking unlock prerequisites.

        const hasMarsRocket = helperListsForUnlock.some(list =>
            Array.isArray(list) && list.some(helper => helper && helper.type === 'marsRocket')
        );

        if (hasMarsRocket) {
            this.game.hasPlayedMoonLaunch = true;
        }

        // Add missing helpers (owned but not placed) - spawn them in a clump for manual placement
        const spawnMissingHelpers = (ownedHelpers, placedHelpers, planet) => {
            if (!Array.isArray(ownedHelpers) || !Array.isArray(placedHelpers)) return placedHelpers;

            // Count how many of each type are already placed
            const placedCounts = {};
            placedHelpers.forEach(helper => {
                placedCounts[helper.type] = (placedCounts[helper.type] || 0) + 1;
            });

            // Count how many of each type are owned
            const ownedCounts = {};
            ownedHelpers.forEach(helper => {
                ownedCounts[helper.type] = (ownedCounts[helper.type] || 0) + 1;
            });

            // Get shop category for this planet
            let shopCategory;
            if (planet === 'moon') {
                shopCategory = window.shopManager?.shopData?.moonHelpers;
            } else if (planet === 'mars') {
                shopCategory = window.shopManager?.shopData?.marsHelpers;
            } else if (planet === 'jupiter') {
                shopCategory = window.shopManager?.shopData?.jupiterHelpers;
            } else if (planet === 'titan') {
                shopCategory = window.shopManager?.shopData?.titanHelpers;
            } else {
                shopCategory = window.shopManager?.shopData?.helpers;
            }

            // Spawn missing helpers in a clump (bottom-left of panel, away from rock)
            const baseX = 120; // Far left side of panel
            const baseY = 520; // Bottom area, below the rock
            let spawnIndex = 0;

            for (const [type, ownedCount] of Object.entries(ownedCounts)) {
                const placedCount = placedCounts[type] || 0;
                const missingCount = ownedCount - placedCount;

                if (missingCount > 0) {
                    const helperData = shopCategory?.[type];
                    if (helperData) {
                        for (let i = 0; i < missingCount; i++) {
                            // Create clump pattern with small random offsets
                            const offsetX = (Math.random() - 0.5) * 80;
                            const offsetY = (Math.random() - 0.5) * 80;
                            
                            placedHelpers.push({
                                type: type,
                                x: baseX + offsetX,
                                y: baseY + offsetY,
                                id: Date.now() + Math.random(),
                                isMining: false,
                                helper: helperData,
                                dps: helperData.baseDps
                            });
                            spawnIndex++;
                        }
                    }
                }
            }

            return placedHelpers;
        };

        this.game.earthPlacedHelpers = spawnMissingHelpers(this.game.helpers, this.game.earthPlacedHelpers, 'earth');
        this.game.moonPlacedHelpers = spawnMissingHelpers(this.game.moonHelpers, this.game.moonPlacedHelpers, 'moon');
        this.game.marsPlacedHelpers = spawnMissingHelpers(this.game.marsHelpers, this.game.marsPlacedHelpers, 'mars');
        this.game.jupiterPlacedHelpers = spawnMissingHelpers(this.game.jupiterHelpers, this.game.jupiterPlacedHelpers, 'jupiter');
        this.game.titanPlacedHelpers = spawnMissingHelpers(this.game.titanHelpers, this.game.titanPlacedHelpers, 'titan');

        if (this.game.currentLevel === 'moon') {
            this.game.placedHelpers = [...this.game.moonPlacedHelpers];
        } else if (this.game.currentLevel === 'mars') {
            this.game.placedHelpers = [...this.game.marsPlacedHelpers];
        } else if (this.game.currentLevel === 'jupiter') {
            this.game.placedHelpers = [...this.game.jupiterPlacedHelpers];
        } else if (this.game.currentLevel === 'titan') {
            // Load Titan placed helpers when on Titan to prevent Earth helpers from appearing
            this.game.placedHelpers = [...this.game.titanPlacedHelpers];
        } else {
            this.game.placedHelpers = [...this.game.earthPlacedHelpers];
        }

        const body = document.body;
        if (body) {
            const level = this.game.currentLevel;
            document.body.classList.toggle('moon-theme', level === 'moon');
            document.body.classList.toggle('planet-mars', level === 'mars');
            document.body.classList.toggle('planet-jupiter', level === 'jupiter');
            document.body.classList.toggle('planet-titan', level === 'titan');
        }

        this.game.recreateHelperSprites();
        this.game.updateShopPrices();

        this.game.totalPlayTime = saveData.statistics?.totalPlayTime || 0;
        this.game.helpersBought = saveData.statistics?.helpersBought || 0;
        this.game.pickaxesBought = saveData.statistics?.pickaxesBought || 0;
        this.game.achievements = saveData.statistics?.achievements || [];
        this.game.startTime = saveData.statistics?.startTime || Date.now();

        this.game.soundEnabled = saveData.settings?.soundEnabled !== false;
        this.game.musicEnabled = saveData.settings?.musicEnabled !== false;
        this.game.notificationsEnabled = saveData.settings?.notificationsEnabled !== false;
        this.game.autoSaveEnabled = saveData.settings?.autoSaveEnabled !== false;
        this.game.hasPlayedMoonLaunch = saveData.cutscenes?.moonLaunch || false;

        if (window.audioManager) {
            window.audioManager.soundEnabled = this.game.soundEnabled;
            window.audioManager.musicEnabled = this.game.musicEnabled;
        }

        const soundCheckbox = document.getElementById('sound-enabled');
        const musicCheckbox = document.getElementById('music-enabled');
        const notificationsCheckbox = document.getElementById('notifications-enabled');
        const autoSaveCheckbox = document.getElementById('auto-save-enabled');

        if (soundCheckbox) soundCheckbox.checked = this.game.soundEnabled;
        if (musicCheckbox) musicCheckbox.checked = this.game.musicEnabled;
        if (notificationsCheckbox) notificationsCheckbox.checked = this.game.notificationsEnabled;
        if (autoSaveCheckbox) autoSaveCheckbox.checked = this.game.autoSaveEnabled;

        this.game.updateDPS();
        this.game.updateUI();

        if (window.uiManager) {
            if (this.game.currentLevel === 'moon') {
                document.body.classList.add('moon-theme');
                document.body.classList.remove('planet-mars');
                document.body.classList.remove('planet-jupiter');
            } else if (this.game.currentLevel === 'mars') {
                document.body.classList.add('planet-mars');
                document.body.classList.remove('moon-theme');
                document.body.classList.remove('planet-jupiter');
            } else if (this.game.currentLevel === 'jupiter') {
                document.body.classList.add('planet-jupiter');
                document.body.classList.remove('moon-theme');
                document.body.classList.remove('planet-mars');
            } else {
                document.body.classList.remove('moon-theme');
                document.body.classList.remove('planet-mars');
                document.body.classList.remove('planet-jupiter');
            }

            uiManager.updateBackground(this.game.currentLevel);
            if (this.game.marsHelpers.length && !this.game.moonHelpers.some(helper => helper.type === 'marsRocket')) {
                const hasMarsRocketInMarsHelpers = this.game.marsHelpers.some(helper => helper.type === 'marsRocket');
                if (hasMarsRocketInMarsHelpers) {
                    this.game.hasPlayedMoonLaunch = true;
                    this.game.moonHelpers.push(...this.game.marsHelpers.filter(helper => helper.type === 'marsRocket'));
                }
            }

            uiManager.initializePlanetTabs?.();
            uiManager.updatePlanetTabVisibility?.();

            if (this.game.hasPlayedMoonLaunch) {
                uiManager.hideMoonLocked?.();
            }

            uiManager.updateShopContent?.();
        }
    }

    validateSaveData(saveData) {
        if (!saveData || typeof saveData !== 'object') {
            return false;
        }

        const requiredFields = ['version', 'timestamp', 'dogecoins'];
        for (const field of requiredFields) {
            if (!(field in saveData)) {
                return false;
            }
        }

        if (typeof saveData.dogecoins !== 'number' || saveData.dogecoins < 0) {
            return false;
        }

        if (typeof saveData.totalMined !== 'number' || saveData.totalMined < 0) {
            return false;
        }

        if (typeof saveData.totalClicks !== 'number' || saveData.totalClicks < 0) {
            return false;
        }

        return true;
    }

    autoSave() {
        if (this.game.autoSaveEnabled !== false) {
            this.saveGame();

            if (window.cloudSaveManager && window.cloudSaveManager.currentUser && window.game != null) {
                window.cloudSaveManager.saveToCloudSilent();
            }
        }
    }

    exportSave() {
        try {
            const saveData = this.createSaveData();
            const saveString = JSON.stringify(saveData, null, 2);

            const blob = new Blob([saveString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `dogeminer_ce_save_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            URL.revokeObjectURL(url);

            this.game.showNotification('Save exported successfully!');
            return true;
        } catch (error) {
            console.error('Error exporting save:', error);
            this.game.showNotification('Error exporting save!');
            return false;
        }
    }

    importSave() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const saveData = JSON.parse(e.target.result);
                    
                    if (this.validateSaveData(saveData)) {
                        if (confirm('This will overwrite your current save. Continue?')) {
                            this.applySaveData(saveData);
                            this.saveGame();
                            this.game.showNotification('Save imported successfully!');
                        }
                    } else {
                        this.game.showNotification('Invalid save file!');
                    }
                } catch (error) {
                    console.error('Error importing save:', error);
                    this.game.showNotification('Error importing save!');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    async resetGame() {
        if (confirm('Are you sure you want to reset your game? This cannot be undone!')) {
            if (confirm('This will permanently delete all your progress. Are you absolutely sure?')) {
                // Clear all possible save data
                localStorage.removeItem(this.saveKey);
                localStorage.removeItem(this.backupKey);
                localStorage.removeItem('dogeminer_save'); // Remove old save key
                
                // Clear any other dogeminer-related keys
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.toLowerCase().includes('dogeminer')) {
                        localStorage.removeItem(key);
                    }
                }
                
                // Delete cloud save if user is signed in to prevent restore on reload
                if (window.cloudSaveManager && window.cloudSaveManager.currentUser) {
                    await window.cloudSaveManager.deleteCloudSave();
                }
                
                // Reset game state directly
                this.game.dogecoins = 0;
                this.game.totalMined = 0;
                this.game.totalClicks = 0;
                this.game.dps = 0;
                this.game.helpers = [];
                this.game.moonHelpers = [];
                this.game.marsHelpers = [];
                this.game.jupiterHelpers = [];
                this.game.titanHelpers = [];
                this.game.earthPlacedHelpers = [];
                this.game.moonPlacedHelpers = [];
                this.game.marsPlacedHelpers = [];
                this.game.jupiterPlacedHelpers = [];
                this.game.titanPlacedHelpers = [];
                this.game.placedHelpers = [];
                this.game.helpersOnCursor = [];
                this.game.placementQueue = [];
                this.game.isPlacingHelpers = false;
                this.game.upgrades = [];
                this.game.pickaxes = [];
                this.game.currentPickaxe = 'standard';
                this.game.currentLevel = 'earth';
                this.game.hasPlayedMoonLaunch = false;
                this.game.isCutscenePlaying = false;
                
                // Clear all helper sprites from the DOM
                this.game.clearAllHelperSprites();
                
                // Update UI immediately
                this.game.updateUI();
                this.game.updateDPS();
                
                // Show notification
                this.game.showNotification('Game reset successfully!');
                
                // Reload after a short delay to ensure UI updates
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }
        }
    }
    
    getSaveInfo() {
        const saveString = localStorage.getItem(this.saveKey);
        if (!saveString) return null;
        
        try {
            const saveData = JSON.parse(saveString);
            return {
                version: saveData.version,
                timestamp: saveData.timestamp,
                dogecoins: saveData.dogecoins,
                totalMined: saveData.totalMined,
                totalClicks: saveData.totalClicks,
                helpers: saveData.helpers?.length || 0,
                pickaxes: saveData.pickaxes?.length || 0
            };
        } catch (error) {
            console.error('Error reading save info:', error);
            return null;
        }
    }
    
    // Cloud save functionality (placeholder for future implementation)
    async saveToCloud() {
        // This would integrate with a cloud service
        console.log('Cloud save not implemented yet');
        return false;
    }
    
    async loadFromCloud() {
        // This would integrate with a cloud service
        console.log('Cloud load not implemented yet');
        return false;
    }
    
    // Save validation and repair
    repairSave() {
        try {
            const saveString = localStorage.getItem(this.saveKey);
            if (!saveString) return false;
            
            const saveData = JSON.parse(saveString);
            
            // Repair common issues
            if (!saveData.helpers) saveData.helpers = [];
            if (!saveData.pickaxes) saveData.pickaxes = ['standard'];
            if (!saveData.upgrades) saveData.upgrades = {};
            if (!saveData.statistics) saveData.statistics = {};
            if (!saveData.settings) saveData.settings = {};
            
            // Ensure minimum values
            saveData.dogecoins = Math.max(0, saveData.dogecoins || 0);
            saveData.totalMined = Math.max(0, saveData.totalMined || 0);
            saveData.totalClicks = Math.max(0, saveData.totalClicks || 0);
            
            // Save repaired data
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            
            this.game.showNotification('Save data repaired!');
            return true;
        } catch (error) {
            console.error('Error repairing save:', error);
            return false;
        }
    }
}

// Global save manager instance
let saveManager;
