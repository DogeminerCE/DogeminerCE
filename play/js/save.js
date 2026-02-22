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
        window.saveGame = (showNotification) => {
            this.saveGame(showNotification);
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

        window.repairSave = () => {
            this.repairSave();
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

        // Listen for controller indicators setting changes
        const controllerIndicatorsCheckbox = document.getElementById('controller-indicators-enabled');
        if (controllerIndicatorsCheckbox) {
            controllerIndicatorsCheckbox.addEventListener('change', (e) => {
                if (window.controllerManager) {
                    window.controllerManager.setShowIndicators(e.target.checked);
                }
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
        // Note: helpersOnCursor is NOT saved - they stay in memory during placement
        // If the page is closed mid-placement, they are lost (intentional - no incomplete placements in saves)

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

        // Only sync placedHelpers to planet arrays if NOT transitioning
        // During transitions, currentLevel and placedHelpers can be temporarily out of sync
        // which would cause helpers to be saved to the wrong planet
        if (!this.game.isTransitioning) {
            if (this.game.currentLevel === 'earth') {
                this.game.earthPlacedHelpers = [...currentPlaced];
            } else if (this.game.currentLevel === 'moon') {
                this.game.moonPlacedHelpers = [...currentPlaced];
            } else if (this.game.currentLevel === 'mars') {
                this.game.marsPlacedHelpers = [...currentPlaced];
            } else if (this.game.currentLevel === 'jupiter') {
                this.game.jupiterPlacedHelpers = [...currentPlaced];
            } else if (this.game.currentLevel === 'titan') {
                this.game.titanPlacedHelpers = [...currentPlaced];
            }
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
            pickaxeInventory: this.game.pickaxeInventory,
            equippedPickaxeId: this.game.equippedPickaxeId,
            maxPickaxeDPC: this.game.maxPickaxeDPC,
            fortuneInventory: this.game.fortuneInventory,
            rocksBroken: this.game.rocksBroken,
            upgrades: this.game.upgrades || {},
            helperUpgradeLevels: this.game.helperUpgradeLevels || {},
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
                autoSaveEnabled: this.game.autoSaveEnabled !== false,
                controllerIndicators: window.controllerManager ? window.controllerManager.showIndicators !== false : true
            },
            cutscenes: {
                moonLaunch: !!this.game.hasPlayedMoonLaunch
            },
            unlockedLevels: this.game.unlockedLevels ? Array.from(this.game.unlockedLevels) : ['earth'],
            HasPlayed_v0_04: this.game.HasPlayed_v0_04
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

        // Update data-planet attribute for CSS targeting
        document.body.dataset.planet = this.game.currentLevel;

        this.game.HasPlayed_v0_04 = saveData.HasPlayed_v0_04 || false;

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
        this.game.pickaxeInventory = Array.isArray(saveData.pickaxeInventory) ? saveData.pickaxeInventory : [this.game.defaultPickaxe];
        this.game.equippedPickaxeId = saveData.equippedPickaxeId || 'default_normal_pickaxe';
        this.game.maxPickaxeDPC = saveData.maxPickaxeDPC || 1;
        this.game.fortuneInventory = Array.isArray(saveData.fortuneInventory) ? saveData.fortuneInventory : [];
        this.game.rocksBroken = saveData.rocksBroken || 0;
        // Recalculate rock HP based on rocks broken
        this.game.rockMaxHP = this.game.getRockHP(this.game.rockBaseHP, this.game.rocksBroken);
        this.game.rockCurrentHP = this.game.rockMaxHP;
        this.game.recalculatePlayerStats();

        // Apply equipped pickaxe sprite to DOM
        const equipped = this.game.getEquippedPickaxe();
        const pickaxeImg = document.getElementById('pickaxe');
        if (equipped && pickaxeImg) {
            pickaxeImg.src = equipped.idleSprite;
            pickaxeImg.classList.remove('pickaxe-scale-half', 'pickaxe-shift-right');
            const sp = equipped.idleSprite || '';
            if (sp.includes('cleaver')) {
                pickaxeImg.classList.add('pickaxe-scale-half');
            }
            const largeWeaponPatterns = [
                'axe', 'hammer', 'sword', 'drill', 'shotgun', 'm4.',
                'rocket', 'nuke', 'staff', 'scepter', 'gpu', 'sligpu',
                'fryingpan', 'bigboot', 'eguitar', 'cod.', 'felps',
                'barbell', 'poolnoodle', 'record'
            ];
            if (largeWeaponPatterns.some(p => sp.includes(p))) {
                pickaxeImg.classList.add('pickaxe-shift-right');
            }
        }
        this.game.upgrades = saveData.upgrades || {};
        this.game.helperUpgradeLevels = saveData.helperUpgradeLevels || {};

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
            // Old save format: sort helpers to correct planets based on their type
            const helperToPlanet = {
                // Earth helpers
                'miningShibe': 'earth', 'dogeKennels': 'earth', 'streamerKittens': 'earth',
                'spaceRocket': 'earth', 'timeMachineRig': 'earth',
                // Moon helpers
                'moonShibe': 'moon', 'moonBase': 'moon', 'landerShibe': 'moon', 'marsRocket': 'moon',
                // Mars helpers
                'partyShibe': 'mars', 'djKittenz': 'mars', 'spaceBass': 'mars',
                'curiosiDoge': 'mars', 'marsBase': 'mars', 'jupiterRocket': 'mars',
                // Jupiter helpers
                'cloudDancer': 'jupiter', 'stormChaser': 'jupiter', 'gasGiant': 'jupiter',
                'cloudBase': 'jupiter', 'superShibe': 'jupiter', 'dogeAirShip': 'jupiter',
                'flyingDoggo': 'jupiter', 'tardogeis': 'jupiter',
                'dogeStar': 'jupiter', 'titanRocket': 'jupiter',
                // Titan helpers
                'titanBase': 'titan', 'roboShibe': 'titan', 'titanMiner': 'titan',
                'timeTravelDRex': 'titan', 'altarOfTheSunDoge': 'titan'
            };

            saveData.placedHelpers.forEach(helper => {
                if (!helper || !helper.type) return;
                const planet = helperToPlanet[helper.type] || 'earth';
                if (planet === 'moon') rawMoon.push(helper);
                else if (planet === 'mars') rawMars.push(helper);
                else if (planet === 'jupiter') rawJupiter.push(helper);
                else if (planet === 'titan') rawTitan.push(helper);
                else rawEarth.push(helper);
            });
            console.log('Migrated old save: sorted helpers to correct planets by type');
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

        // Restore unlockedLevels from saved array
        if (Array.isArray(saveData.unlockedLevels) && saveData.unlockedLevels.length > 0) {
            this.game.unlockedLevels = new Set(saveData.unlockedLevels);
        } else {
            // Fallback: infer from game state
            this.game.unlockedLevels = new Set(['earth']);
            if (this.game.hasPlayedMoonLaunch || this.game.moonHelpers?.length > 0) {
                this.game.unlockedLevels.add('moon');
            }
            if (this.game.marsHelpers?.length > 0) {
                this.game.unlockedLevels.add('mars');
            }
            if (this.game.jupiterHelpers?.length > 0) {
                this.game.unlockedLevels.add('jupiter');
            }
            if (this.game.titanHelpers?.length > 0) {
                this.game.unlockedLevels.add('titan');
            }
        }

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

        // Restore controller indicators preference
        const controllerIndicatorsEnabled = saveData.settings?.controllerIndicators !== false;
        const controllerIndicatorsCheckbox = document.getElementById('controller-indicators-enabled');
        if (controllerIndicatorsCheckbox) controllerIndicatorsCheckbox.checked = controllerIndicatorsEnabled;
        if (window.controllerManager) {
            window.controllerManager.setShowIndicators(controllerIndicatorsEnabled);
        }

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

        // Check for cross-planet helpers and notify player
        this.checkForCrossPlanetHelpers();
    }

    // Detect if any helpers are on the wrong planet and notify player
    checkForCrossPlanetHelpers() {
        const helperToPlanet = {
            // Earth helpers
            'miningShibe': 'earth', 'dogeKennels': 'earth', 'streamerKittens': 'earth',
            'spaceRocket': 'earth', 'timeMachineRig': 'earth', 'infiniteDogebility': 'earth',
            // Moon helpers
            'moonShibe': 'moon', 'moonBase': 'moon', 'landerShibe': 'moon', 'marsRocket': 'moon',
            // Mars helpers
            'partyShibe': 'mars', 'djKittenz': 'mars', 'spaceBass': 'mars',
            'curiosiDoge': 'mars', 'marsBase': 'mars', 'jupiterRocket': 'mars',
            // Jupiter helpers
            'cloudDancer': 'jupiter', 'stormChaser': 'jupiter', 'gasGiant': 'jupiter',
            'cloudBase': 'jupiter', 'superShibe': 'jupiter', 'dogeAirShip': 'jupiter',
            'flyingDoggo': 'jupiter', 'tardogeis': 'jupiter',
            'dogeStar': 'jupiter', 'titanRocket': 'jupiter',
            // Titan helpers
            'titanBase': 'titan', 'roboShibe': 'titan', 'titanMiner': 'titan',
            'timeTravelDRex': 'titan', 'altarOfTheSunDoge': 'titan'
        };

        const planetArrays = {
            'earth': this.game.earthPlacedHelpers || [],
            'moon': this.game.moonPlacedHelpers || [],
            'mars': this.game.marsPlacedHelpers || [],
            'jupiter': this.game.jupiterPlacedHelpers || [],
            'titan': this.game.titanPlacedHelpers || []
        };

        let misplacedCount = 0;

        // Scan each planet's array for misplaced helpers
        Object.keys(planetArrays).forEach(planet => {
            const helpers = planetArrays[planet];
            if (!Array.isArray(helpers)) return;

            helpers.forEach(helper => {
                if (!helper || !helper.type) return;
                const correctPlanet = helperToPlanet[helper.type];
                if (correctPlanet && correctPlanet !== planet) {
                    misplacedCount++;
                }
            });
        });

        if (misplacedCount > 0) {
            console.warn(`Detected ${misplacedCount} helpers on wrong planets!`);
            // Show notification after a short delay to let UI initialize
            setTimeout(() => {
                this.game.showNotification(`⚠️ Save issue detected! ${misplacedCount} helpers on wrong planets. Go to Settings > Repair Save to fix.`, 8000);
            }, 2000);
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
        // Note: createSaveData() handles the isTransitioning check for placed helpers
        // to prevent them from being saved to the wrong planet

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
            reader.onload = async (e) => {
                try {
                    const saveData = JSON.parse(e.target.result);

                    if (this.validateSaveData(saveData)) {
                        const ok = await gameConfirm('This will overwrite your current save. Continue?', {
                            title: 'Import Save'
                        });
                        if (ok) {
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
        const ok1 = await gameConfirm('Are you sure you want to reset your game? This cannot be undone!', {
            title: 'Reset Game'
        });
        if (ok1) {
            const ok2 = await gameConfirm('This will permanently delete all your progress. Are you absolutely sure?', {
                title: 'Final Warning'
            });
            if (ok2) {
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
                this.game.helperUpgradeLevels = {};
                this.game.pickaxeInventory = [this.game.defaultPickaxe];
                this.game.equippedPickaxeId = 'default_normal_pickaxe';
                this.game.maxPickaxeDPC = 1;
                this.game.fortuneInventory = [];
                this.game.rocksBroken = 0;
                this.game.recalculatePlayerStats();
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
                pickaxes: saveData.pickaxeInventory?.length || 0
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
    async repairSave() {
        const ok = await gameConfirm('This will attempt to repair corrupted save data.\n\nRepairs include:\n• Spreading out stacked helpers\n• Adding missing helper names\n• Moving helpers to correct planets\n• Fixing invalid data\n\nProceed?', {
            title: 'Repair Save'
        });
        if (!ok) {
            return false;
        }

        try {
            let repairsMade = 0;
            const repairLog = [];

            // Repair placed helpers that are stacked on top of each other
            const repairPlacedHelpers = (helpers, planetName) => {
                if (!Array.isArray(helpers)) return [];

                let localRepairs = 0;
                const positionMap = new Map(); // Track positions to find duplicates

                helpers.forEach((helper, index) => {
                    if (!helper) return;

                    // Ensure valid properties
                    if (helper.x === undefined || helper.x === null) {
                        helper.x = 50 + (index % 10) * 40;
                        localRepairs++;
                    }
                    if (helper.y === undefined || helper.y === null) {
                        helper.y = 400 + Math.floor(index / 10) * 40;
                        localRepairs++;
                    }

                    // Add missing name based on type
                    if (!helper.name && helper.type) {
                        helper.name = this.getHelperNameFromType(helper.type);
                        localRepairs++;
                    }

                    // Check for stacked helpers (same x/y)
                    const posKey = `${Math.round(helper.x)}_${Math.round(helper.y)}`;
                    if (positionMap.has(posKey)) {
                        // Spread out this helper
                        const offset = positionMap.get(posKey);
                        helper.x += (offset % 5) * 30 + 20;
                        helper.y += Math.floor(offset / 5) * 30 + 20;
                        positionMap.set(posKey, offset + 1);
                        localRepairs++;
                    } else {
                        positionMap.set(posKey, 1);
                    }

                    // Ensure valid ID
                    if (!helper.id) {
                        helper.id = Date.now() + Math.random() + index;
                        localRepairs++;
                    }
                });

                if (localRepairs > 0) {
                    repairLog.push(`${planetName}: Fixed ${localRepairs} issues`);
                }
                repairsMade += localRepairs;

                return helpers.filter(h => h !== null && h !== undefined);
            };

            // Repair helpers in current memory
            this.game.earthPlacedHelpers = repairPlacedHelpers(this.game.earthPlacedHelpers || [], 'Earth');
            this.game.moonPlacedHelpers = repairPlacedHelpers(this.game.moonPlacedHelpers || [], 'Moon');
            this.game.marsPlacedHelpers = repairPlacedHelpers(this.game.marsPlacedHelpers || [], 'Mars');
            this.game.jupiterPlacedHelpers = repairPlacedHelpers(this.game.jupiterPlacedHelpers || [], 'Jupiter');
            this.game.titanPlacedHelpers = repairPlacedHelpers(this.game.titanPlacedHelpers || [], 'Titan');

            // Also repair current placedHelpers
            this.game.placedHelpers = repairPlacedHelpers(this.game.placedHelpers || [], 'Current');

            // === NEW: Cross-planet helper repair ===
            // Define which helper types belong to which planets
            const helperToPlanet = {
                // Earth helpers
                'miningShibe': 'earth', 'dogeKennels': 'earth', 'streamerKittens': 'earth',
                'spaceRocket': 'earth', 'timeMachineRig': 'earth', 'infiniteDogebility': 'earth',
                // Moon helpers
                'moonShibe': 'moon', 'moonBase': 'moon', 'landerShibe': 'moon', 'marsRocket': 'moon',
                // Mars helpers
                'partyShibe': 'mars', 'djKittenz': 'mars', 'spaceBass': 'mars',
                'curiosiDoge': 'mars', 'marsBase': 'mars', 'jupiterRocket': 'mars',
                // Jupiter helpers
                'cloudDancer': 'jupiter', 'stormChaser': 'jupiter', 'gasGiant': 'jupiter',
                'cloudBase': 'jupiter', 'superShibe': 'jupiter', 'dogeAirShip': 'jupiter',
                'flyingDoggo': 'jupiter', 'tardogeis': 'jupiter',
                'dogeStar': 'jupiter', 'titanRocket': 'jupiter',
                // Titan helpers
                'titanBase': 'titan', 'roboShibe': 'titan', 'titanMiner': 'titan',
                'timeTravelDRex': 'titan', 'altarOfTheSunDoge': 'titan'
            };

            // Helper arrays by planet
            const planetArrays = {
                'earth': this.game.earthPlacedHelpers,
                'moon': this.game.moonPlacedHelpers,
                'mars': this.game.marsPlacedHelpers,
                'jupiter': this.game.jupiterPlacedHelpers,
                'titan': this.game.titanPlacedHelpers
            };

            // Track helpers to move
            const helpersToMove = [];

            // Scan each planet's array for misplaced helpers
            Object.keys(planetArrays).forEach(planet => {
                const helpers = planetArrays[planet];
                if (!Array.isArray(helpers)) return;

                for (let i = helpers.length - 1; i >= 0; i--) {
                    const helper = helpers[i];
                    if (!helper || !helper.type) continue;

                    const correctPlanet = helperToPlanet[helper.type];
                    if (correctPlanet && correctPlanet !== planet) {
                        // This helper is on the wrong planet!
                        helpersToMove.push({
                            helper: helper,
                            fromPlanet: planet,
                            toPlanet: correctPlanet
                        });
                        helpers.splice(i, 1); // Remove from wrong planet
                    }
                }
            });

            // Move helpers to correct planets
            let movedCount = 0;
            helpersToMove.forEach(({ helper, fromPlanet, toPlanet }) => {
                const targetArray = planetArrays[toPlanet];
                if (targetArray) {
                    targetArray.push(helper);
                    repairLog.push(`Moved ${helper.name || helper.type} from ${fromPlanet} to ${toPlanet}`);
                    movedCount++;
                }
            });

            if (movedCount > 0) {
                repairsMade += movedCount;
                repairLog.push(`Total cross-planet helpers fixed: ${movedCount}`);
            }

            // Update the game arrays with the fixed versions
            this.game.earthPlacedHelpers = planetArrays['earth'];
            this.game.moonPlacedHelpers = planetArrays['moon'];
            this.game.marsPlacedHelpers = planetArrays['mars'];
            this.game.jupiterPlacedHelpers = planetArrays['jupiter'];
            this.game.titanPlacedHelpers = planetArrays['titan'];

            // Also update current placedHelpers based on currentLevel
            if (this.game.currentLevel === 'moon') {
                this.game.placedHelpers = this.game.moonPlacedHelpers;
            } else if (this.game.currentLevel === 'mars') {
                this.game.placedHelpers = this.game.marsPlacedHelpers;
            } else if (this.game.currentLevel === 'jupiter') {
                this.game.placedHelpers = this.game.jupiterPlacedHelpers;
            } else if (this.game.currentLevel === 'titan') {
                this.game.placedHelpers = this.game.titanPlacedHelpers;
            } else {
                this.game.placedHelpers = this.game.earthPlacedHelpers;
            }
            // === END: Cross-planet helper repair ===

            // Clean up helpers array (remove null entries, ensure required fields)
            if (Array.isArray(this.game.helpers)) {
                const originalCount = this.game.helpers.length;
                this.game.helpers = this.game.helpers.filter(h => h && h.type);
                if (this.game.helpers.length !== originalCount) {
                    const removed = originalCount - this.game.helpers.length;
                    repairLog.push(`Removed ${removed} invalid helper entries`);
                    repairsMade += removed;
                }
            }

            // Clear any stuck placement state
            if (this.game.helpersOnCursor && this.game.helpersOnCursor.length > 0) {
                repairLog.push(`Cleared ${this.game.helpersOnCursor.length} stuck helpers on cursor`);
                repairsMade += this.game.helpersOnCursor.length;
                this.game.helpersOnCursor = [];
            }
            this.game.isPlacingHelpers = false;

            // Recalculate DPS
            this.game.updateDPS();

            // Save the repaired data
            this.saveGame(false);

            // Clear and rebuild helper sprites
            this.game.clearAllHelperSprites();
            this.game.placedHelpers.forEach(helper => {
                this.game.createHelperSprite(helper);
            });

            // Show result
            if (repairsMade > 0) {
                const message = `Save repaired!\n\n${repairLog.join('\n')}\n\nTotal fixes: ${repairsMade}\n\nThe game will now refresh.`;
                await gameAlert(message, { title: 'Repair Complete' });
                this.game.showNotification(`Repaired ${repairsMade} issues!`);
                // Auto-refresh after repair
                setTimeout(() => {
                    location.reload();
                }, 500);
            } else {
                this.game.showNotification('No issues found in save data.');
            }

            return true;
        } catch (error) {
            console.error('Error repairing save:', error);
            await gameAlert('Error repairing save: ' + error.message, { title: 'Repair Error' });
            return false;
        }
    }

    // Helper to get display name from helper type
    getHelperNameFromType(type) {
        const nameMap = {
            'miningShibe': 'Mining Shibe',
            'dogeKennels': 'Doge Kennels',
            'streamerKittens': 'Streamer Kittens',
            'spaceRocket': 'Space Rocket',
            'timeMachineRig': 'Time Machine Mining Rig',
            'moonShibe': 'Moon Shibe',
            'moonBase': 'Moon Base',
            'landerShibe': 'Lander Shibe',
            'partyShibe': 'Party Shibe',
            'djKittenz': 'DJ Kittenz',
            'spaceBass': 'Space Bass',
            'curiosiDoge': 'CuriosiDoge',
            'marsBase': 'Mars Base',
            'cloudDancer': 'Cloud Dancer',
            'stormChaser': 'Storm Chaser',
            'gasGiant': 'Gas Giant',
            'cloudBase': 'Cloud Base',
            'infiniteDogebility': 'Infinite Dogebility',
            'titanBase': 'Titan Base',
            'dogeStar': 'DogeStar',
            'timeTravelDRex': 'Time Travel D-Rex',
            'altarOfTheSunDoge': 'Altar of the Sun Doge'
        };
        return nameMap[type] || type;
    }
}

// Global save manager instance
let saveManager;
