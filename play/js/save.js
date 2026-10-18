// DogeMiner: Community Edition - Save/Load System
class SaveManager {
    constructor(game) {
        this.game = game;
        this.saveKey = 'dogeminer_ce_save';
        this.backupKey = 'dogeminer_ce_backup';
        this.alphaBackupKey = 'dogeminer_ce_alpha_backup_dm2-beta-1';
        this.migrationReceiptKey = 'dogeminer_ce_beta_migration_receipts';
        this.offlineReceiptKey = 'dogeminer_ce_offline_earnings_receipts';
        this.loadError = null;
        this._saveBlocked = false;
        this._loadInProgress = false;
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

        for (const [id, key] of [['hints', 'hintsEnabled'], ['stories', 'storiesEnabled'], ['news', 'newsEnabled']]) {
            document.getElementById(`${id}-enabled`)?.addEventListener('change', event => {
                this.game.setStoryPreference(key, event.target.checked);
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
        // A failed migration must never let the fresh constructor overwrite Alpha.
        if (this._saveBlocked || this._loadInProgress) return false;
        try {
            const saveData = this.createSaveData();
            const saveString = JSON.stringify(saveData);

            // Save to localStorage
            localStorage.setItem(this.saveKey, saveString);

            // Create backup
            localStorage.setItem(this.backupKey, saveString);

            this.lastSave = Date.now();

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

    // Prestige commits its inventory, currencies and timeline record together.
    commitTimelineReset() { return this._commitProgressTransaction('mission rewards'); }

    commitStoryProgress() { return this._commitProgressTransaction('story progress'); }
    commitWorldDiscovery() { return this._commitProgressTransaction('world discovery'); }
    commitFieldLoot() { return this._commitProgressTransaction('field loot'); }
    commitHelperPurchase() { return this._commitProgressTransaction('helper purchases'); }
    commitHelperUpgrade() { return this._commitProgressTransaction('helper upgrade'); }
    commitLateProgression() { return this._commitProgressTransaction('late-game progression'); }
    commitToolProgress() { return this._commitProgressTransaction('tool progression'); }
    commitEncounterProgress() { return this._commitProgressTransaction('field encounters'); }

    _commitProgressTransaction(label) {
        if (this._saveBlocked || this._loadInProgress) return false;
        try {
            const json = JSON.stringify(this.createSaveData());
            this._writeStorageTransaction([[this.backupKey, json], [this.saveKey, json]]);
            this.lastSave = Date.now();
            return true;
        } catch (error) {
            console.error(`Could not save ${label}:`, error);
            return false;
        }
    }

    loadGame() {
        try {
            const saveString = localStorage.getItem(this.saveKey);
            if (!saveString) {
                this.loadError = null;
                this._saveBlocked = false;
                this.game.balanceVersion = window.DogeMinerBalance?.VERSION || null;
                this.game.betaMigrationReport = null;
                this.game.offlineEarningsReport = null;
                this.game.closeOfflineEarningsReport?.();
                this.game.showNotification('No save data found!');
                return false;
            }

            const saveData = JSON.parse(saveString);
            this.applySaveData(saveData, { originalString: saveString });

            // Notification handled by main.js
            console.log('Game loaded:', saveData);
            return true;
        } catch (error) {
            console.error('Error loading game:', error);
            this.loadError = error;
            this._saveBlocked = true;

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
            this.applySaveData(saveData, { originalString: backupString });

            console.log('Loaded from backup:', saveData);
            return true;
        } catch (error) {
            console.error('Error loading backup:', error);
            this.loadError ||= error;
            this._saveBlocked = true;
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

            if (typeof helper.groupId === 'string') saveHelper.groupId = helper.groupId;
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

        // Ensure the current active rock health is saved before serializing
        if (this.game.planetRockData && this.game.currentLevel && !this.game.isRockRegenerating) {
            this.game.planetRockData[this.game.currentLevel] = {
                rocksBroken: this.game.rocksBroken,
                rockLevel: this.game.rockLevel || (this.game.rocksBroken + 1),
                currentHP: this.game.rockCurrentHP,
                maxHP: this.game.rockMaxHP
            };
        }

        return {
            version: '1.0.0',
            balanceVersion: this.game.balanceVersion || window.DogeMinerBalance?.VERSION || null,
            betaMigrationReport: this.game.betaMigrationReport || null,
            offlineEarningsReport: this.game.offlineEarningsReport || null,
            timestamp: Date.now(),
            layout: this.game.getLayoutForSave?.() || null,
            seasonal: this.game.getSeasonalForSave?.() || null,
            dm2Import: this.game.dm2Import || null,
            importReceipt: this.game.importReceipt || null,
            dogecoins: this.game.dogecoins,
            planetRockData: this.game.planetRockData,
            dogebagStacks: this.game.getDogebagStacksForSave?.() || {},
            diamondStacks: this.game.getDiamondStacksForSave?.() || {},
            lootAutomation: this.game.getLootAutomationForSave?.() || null,
            totalMined: this.game.totalMined,
            totalClicks: this.game.totalClicks,
            dps: this.game.dps,
            highestDps: this.game.highestDps,
            records: this.game.getMiningRecordsForSave?.() || { highestcrit: 0 },
            encounters:this.game.getEncountersForSave?.() || null,
            currentLevel: this.game.currentLevel,
            helpers: this.game.helpers,
            moonHelpers: this.game.moonHelpers,
            marsHelpers: this.game.marsHelpers,
            jupiterHelpers: this.game.jupiterHelpers, // Keep Jupiter helper ownership synced across reloads.
            titanHelpers: this.game.titanHelpers, // Keep Titan helper ownership synced across reloads.
            pickaxeInventory: this.game.pickaxeInventory,
            equippedPickaxeId: this.game.equippedPickaxeId,
            ...(window.DogeMinerTools?.discoveryState(this.game) || {}),
            maxPickaxeDPC: this.game.maxPickaxeDPC,
            fortuneInventory: this.game.fortuneInventory,
            latestObtainedFortune: this.game.latestObtainedFortune || null,
            inventoryUnread: { ...(this.game.inventoryUnread || { pickaxe: 0, fortune: 0 }) },
            lastPickaxeDropTime: Number.isFinite(this.game.lastPickaxeDropTime) ? Math.max(0, this.game.lastPickaxeDropTime) : 0,
            prizesSinceLastPickaxe: Number.isFinite(this.game.prizesSinceLastPickaxe) ? Math.max(0, Math.floor(this.game.prizesSinceLastPickaxe)) : 0,
            moonDogebagCount: this.game.moonDogebagCount || 0,
            mysteryBoxObtained: this.game.mysteryBoxObtained || false,
            mysteryBoxEvolutionPending: this.game.mysteryBoxEvolutionPending === true,
            mysteryBoxOpenCount: this.game.mysteryBoxOpenCount || 0,
            mysteryBoxCycle: window.DogeMinerBalance?.getMysteryBoxOpening?.(this.game)?.cycle ?? (this.game.mysteryBoxOpenCount || 0) % 11,
            mysteryBoxLastKind: this.game.mysteryBoxLastKind === 'fortune' ? 'fortune' : 'pickaxe',
            mysteryBoxTimerRemaining: this.game.getMysteryBoxTimerRemaining?.() ?? this.game.mysteryBoxTimerRemaining ?? 0,
            mysteryBoxLastSaveTime: Date.now(),
            bonusCoinLevel: this.game.bonusCoinLevel || 1,
            bonusCoinMaxPlanetLevel: this.game.getBonusCoinPlanetLevel?.() || 1,
            bonusCoinBuffTier: this.game.bonusCoinBuffTier || 0,
            bonusCoinClaimCount: this.game.bonusCoinClaimCount || 0,
            bonusCoinEarlyOffered: this.game.bonusCoinEarlyOffered === true,
            bonusCoinSeenLevel: this.game.bonusCoinSeenLevel || 0,
            bonusCoinBuffMultiplier: this.game.bonusCoinBuffMultiplier || 1,
            bonusCoinBuffEndTime: this.game.bonusCoinBuffEndTime || 0,
            dogediamonds: this.game.dogediamonds || 0,
            dogediamondsEverObtained: this.game.dogediamondsEverObtained || 0,
            searchdogeSlot3Unlocked: this.game.searchdogeSlot3Unlocked || false,
            timelineNumber: this.game.timelineNumber || 1,
            timelineProgress: this.game.getTimelineProgressForSave?.() || null,
            storyProgress: this.game.getStoryProgressForSave?.() || null,
            worldDiscovery: this.game.getWorldDiscoveryForSave?.() || null,
            lateProgression: this.game.getLateProgressionForSave?.() || null,
            diaMissionSeenOnce: this.game.diaMissionSeenOnce || false,
            hasReachedJupiterEver: this.game.hasReachedJupiterEver || false,
            rocksBroken: this.game.rocksBroken,
            rockLevel: this.game.rockLevel || (this.game.rocksBroken + 1),
            upgrades: this.game.upgrades || {},
            helperUpgradeLevels: this.game.helperUpgradeLevels || {},
            helperUpgradeOffers: this.game.helperUpgradeOffers || {},
            searchdogeDiscovery: this.game.getSearchdogeDiscoveryForSave?.() || null,
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
                rockSoundsEnabled: this.game.rockSoundsEnabled !== false,
                backgroundAudioEnabled: this.game.backgroundAudioEnabled !== false,
                lessEffects: this.game.lessEffects === true,
                limitFps: this.game.limitFps === true,
                notificationsEnabled: this.game.notificationsEnabled !== false,
                storiesEnabled: this.game.storiesEnabled !== false,
                hintsEnabled: this.game.hintsEnabled !== false,
                newsEnabled: this.game.newsEnabled !== false,
                autoSaveEnabled: this.game.autoSaveEnabled !== false,
                autoPlaceHelpers: this.game.autoPlaceHelpers !== false,
                controllerIndicators: window.controllerManager ? window.controllerManager.showIndicators !== false : true
            },
            cutscenes: {
                moonLaunch: !!this.game.hasPlayedMoonLaunch
            },
            unlockedLevels: this.game.unlockedLevels ? Array.from(this.game.unlockedLevels) : ['earth'],
            HasPlayed_v0_04: this.game.HasPlayed_v0_04,
            hasSeenDogebagIntro: this.game.hasSeenDogebagIntro || false,
            isSupporter: this.game.isSupporter || false
        };
    }

    applySaveData(rawSaveData, options = {}) {
        try {
            return this._prepareAndApplySaveData(rawSaveData, options);
        } catch (error) {
            // Preparation and original-backup errors happen before live mutation,
            // but they must still stop startup autosave from replacing Alpha.
            this.loadError = error;
            this._saveBlocked = true;
            this._loadInProgress = false;
            throw error;
        }
    }

    _prepareAndApplySaveData(rawSaveData, { originalString, persist = false, recovery = null, importOriginal = null } = {}) {
        if (!this.validateSaveData(rawSaveData)) throw new Error('Invalid save data');
        const migration = window.BetaSaveMigration;
        if (window.DogeMinerBalance && !migration) {
            throw new Error('Beta save migration is unavailable; the existing save was not changed.');
        }
        const prepared = migration
            ? migration.prepare(rawSaveData, { game: this.game })
            : { saveData: JSON.parse(JSON.stringify(rawSaveData)), migrated: false };
        const history = window.DogeMinerStoryHistory?.prepare(prepared.saveData) || { saveData:prepared.saveData, changed:false };
        const saveData = history.saveData;
        window.DogeMinerTools?.discoveryState(saveData);
        window.DogeMinerEncounters?.normalize(saveData.encounters,saveData);
        window.DogeMinerLayout?.normalize(saveData.layout,saveData.dm2Import);
        window.DogeMinerSeasonal?.normalize(saveData.seasonal, saveData.dm2Import);
        window.DogeMinerDM2Import?.receipt(saveData.dm2Import);
        window.DogeMinerDM2Import?.requestReceipt(saveData.importReceipt);
        const previousState = { ...this.game };
        const previousKeys = new Set(Object.keys(this.game));
        const alphaBackupKey = this.alphaBackupKey || 'dogeminer_ce_alpha_backup_dm2-beta-1';
        const receiptKey = this.migrationReceiptKey || 'dogeminer_ce_beta_migration_receipts';
        let receipts = {};
        if (prepared.migrated) {
            // Keep the full original independently of the ordinary rolling backup.
            // Even a failed migration leaves this original intact and recoverable.
            if (localStorage.getItem(alphaBackupKey) === null) {
                localStorage.setItem(alphaBackupKey, originalString || JSON.stringify(rawSaveData));
            }
            try { receipts = JSON.parse(localStorage.getItem(receiptKey) || '{}') || {}; }
            catch (_) { receipts = {}; }
            const receipt = receipts[prepared.report.fingerprint];
            if (receipt?.version === prepared.report.version) {
                prepared.report.createdAt = receipt.createdAt;
                prepared.report.acknowledged = receipt.acknowledged === true;
                if (receipt.acknowledgedAt) prepared.report.acknowledgedAt = receipt.acknowledgedAt;
            }
        }
        this._loadInProgress = true;
        try {
            this.game.balanceVersion = saveData.balanceVersion || window.DogeMinerBalance?.VERSION || null;
            this.game.betaMigrationReport = saveData.betaMigrationReport || null;
            this._applySaveData(saveData);
            const offlineCredit = this._prepareOfflineCredit(rawSaveData);
            if (prepared.migrated) {
                migration.rebalanceRocks(this.game, prepared.report, prepared.originalRockData);
                this.game.updateRockHealthDisplay?.();
            }
            if (prepared.migrated || offlineCredit || history.changed || persist) {
                const finalData = this.createSaveData();
                migration?.validate(finalData);
                const finalString = JSON.stringify(finalData);
                const writes = [];
                if (recovery) writes.push([recovery.key, recovery.value]);
                if (importOriginal && localStorage.getItem(importOriginal.key) === null) writes.push([importOriginal.key, importOriginal.value]);
                const historyBackupKey = 'dogeminer_ce_story_history_original_v1';
                if (history.changed && localStorage.getItem(historyBackupKey) === null) {
                    writes.push([historyBackupKey, originalString || JSON.stringify(rawSaveData)]);
                }
                if (prepared.migrated) {
                    receipts[prepared.report.fingerprint] = {
                        version: prepared.report.version,
                        createdAt: prepared.report.createdAt,
                        acknowledged: prepared.report.acknowledged,
                        ...(prepared.report.acknowledgedAt ? { acknowledgedAt: prepared.report.acknowledgedAt } : {})
                    };
                    writes.push([receiptKey, JSON.stringify(receipts)]);
                }
                if (offlineCredit) writes.push([this.offlineReceiptKey || 'dogeminer_ce_offline_earnings_receipts', JSON.stringify(offlineCredit.receipts)]);
                writes.push([this.backupKey, finalString], [this.saveKey, finalString]);
                this._writeStorageTransaction(writes);
                this.lastSave = Date.now();
            } else {
                this.lastSave = rawSaveData.timestamp;
            }
            this.loadError = null;
            this._saveBlocked = false;
        } catch (error) {
            for (const key of Object.keys(this.game)) {
                if (!previousKeys.has(key)) delete this.game[key];
            }
            Object.assign(this.game, previousState);
            window.DogeMinerBonusHud?.clear(this.game);
        this.game.resetPassiveIncomeClock?.();
        window.DogeMinerSecrets?.reset(this.game);
        this.game.resetRockReplacement?.();
        this.game.resetCateThief?.();
        window.DogeMinerReleaseNotes?.close({immediate:true});
        this.game.resetToolPresentation?.();
        this.game.resetUpgradePresentation?.();
        this.game.resetMoonLaunchPresentation?.();
        this.game.resetStoryPresentation?.();
            this.loadError = error;
            this._saveBlocked = true;
            throw error;
        } finally {
            this._loadInProgress = false;
        }
        this.game.closeOfflineEarningsReport?.();
        this.game.showPendingBetaMigrationReport?.();
        this.game.scheduleOfflineEarningsReport?.();
        return saveData;
    }

    _prepareOfflineCredit(snapshot) {
        const offline = window.DogeMinerOfflineEarnings;
        if (!offline) return null;
        const key = this.offlineReceiptKey || 'dogeminer_ce_offline_earnings_receipts';
        let receipts;
        try { receipts = offline.readReceipts(JSON.parse(localStorage.getItem(key) || '[]')); }
        catch (_) { receipts = []; }
        const pending = this.game.offlineEarningsReport;
        const acknowledged = pending && receipts.find(receipt => receipt.id === pending.id && receipt.acknowledged);
        if (acknowledged) this.game.offlineEarningsReport = { ...pending, acknowledged: true };
        const credit = offline.prepare(snapshot, this.game.getOfflineDPS?.() ?? this.game.dps, receipts);
        if (!credit) return null;
        const coins = this.game.dogecoins + credit.report.amount;
        const total = this.game.totalMined + credit.report.amount;
        if (!Number.isFinite(coins) || !Number.isFinite(total)) throw new Error('Offline earnings exceed the supported balance.');
        this.game.dogecoins = coins;
        this.game.totalMined = total;
        this.game.offlineEarningsReport = credit.report;
        this.game.updateUI();
        return credit;
    }

    acknowledgeOfflineEarnings(id) {
        const report = this.game.offlineEarningsReport;
        if (!report || report.id !== id || this._saveBlocked || this._loadInProgress) return false;
        if (report.acknowledged) return true;
        try {
            const acknowledged = { ...report, acknowledged: true };
            const key = this.offlineReceiptKey || 'dogeminer_ce_offline_earnings_receipts';
            let receipts;
            try { receipts = window.DogeMinerOfflineEarnings.readReceipts(JSON.parse(localStorage.getItem(key) || '[]')); }
            catch (_) { receipts = []; }
            receipts = [...receipts.filter(receipt => receipt.id !== id), acknowledged].slice(-64);
            const data = this.createSaveData();
            data.offlineEarningsReport = acknowledged;
            const json = JSON.stringify(data);
            this._writeStorageTransaction([[key, JSON.stringify(receipts)], [this.backupKey, json], [this.saveKey, json]]);
            this.game.offlineEarningsReport = acknowledged;
            this.lastSave = Date.now();
            return true;
        } catch (error) {
            console.error('Could not acknowledge offline earnings:', error);
            return false;
        }
    }

    _writeStorageTransaction(entries) {
        const originals = entries.map(([key]) => [key, localStorage.getItem(key)]);
        try {
            for (const [key, value] of entries) localStorage.setItem(key, value);
        } catch (error) {
            // localStorage writes are individually atomic. Restore already written
            // companion keys if quota or another storage failure rejects the commit.
            for (const [key, original] of originals) {
                try {
                    if (original === null) localStorage.removeItem(key);
                    else localStorage.setItem(key, original);
                } catch (restoreError) { console.error('Could not restore save storage:', restoreError); }
            }
            throw error;
        }
    }

    acknowledgeBetaMigration() {
        const report = this.game.betaMigrationReport;
        if (!report || report.acknowledged) return true;
        if (this._saveBlocked || this._loadInProgress) return false;
        const acknowledgedAt = Date.now();
        const acknowledged = { ...report, acknowledged: true, acknowledgedAt };
        try {
            const saveData = this.createSaveData();
            saveData.betaMigrationReport = acknowledged;
            const saveString = JSON.stringify(saveData);
            const receiptKey = this.migrationReceiptKey || 'dogeminer_ce_beta_migration_receipts';
            let receipts = {};
            try { receipts = JSON.parse(localStorage.getItem(receiptKey) || '{}') || {}; } catch (_) { }
            if (report.fingerprint) receipts[report.fingerprint] = {
                version: report.version, createdAt: report.createdAt, acknowledged: true, acknowledgedAt
            };
            this._writeStorageTransaction([
                [receiptKey, JSON.stringify(receipts)], [this.backupKey, saveString], [this.saveKey, saveString]
            ]);
            this.game.betaMigrationReport = acknowledged;
            this.lastSave = Date.now();
            return true;
        } catch (error) {
            console.error('Could not acknowledge Beta balance report:', error);
            this.game.showNotification('Unable to save the balance report confirmation. Please try again.');
            return false;
        }
    }

    _applySaveData(saveData) {
        if (!this.validateSaveData(saveData)) {
            throw new Error('Invalid save data');
        }

        window.DogeMinerLayout?.normalize(saveData.layout,saveData.dm2Import);
        window.DogeMinerSeasonal?.normalize(saveData.seasonal, saveData.dm2Import);
        window.DogeMinerLootAutomation?.normalize(saveData.lootAutomation, saveData.timelineNumber);
        window.DogeMinerLateProgression?.normalize(saveData.lateProgression,saveData);

        // A loaded balance already includes claimed currency; previous-page
        // display flights must not withhold any part of the restored amount.
        this.game.resetRockReplacement?.();
        this.game.resetCateThief?.();
        window.DogeMinerReleaseNotes?.close({immediate:true});
        this.game.resetToolPresentation?.();
        this.game.resetUpgradePresentation?.();
        this.game.resetMoonLaunchPresentation?.();
        this.game.resetStoryPresentation?.();
        this.game.resetDogebagPresentation?.();
        this.game.resetFieldLootPresentation?.();
        this.game.resetRickVisitor?.();
        this.game.despawnRick?.({ animate: false });
        this.game._removeBonusCoinEl?.();
        this.game.resetBonusCoinSpawnCycle?.();
        this.game._currencyFlightEpoch = (this.game._currencyFlightEpoch || 0) + 1;
        this.game._rockStateEpoch = (this.game._rockStateEpoch || 0) + 1;
        this.game.activeEffectCount = 0;
        this.game.isRockRegenerating = false;
        this.game.pendingCoinDisplayAmount = 0;
        this.game.pendingDiamondDisplayAmount = 0;
        this.game.offlineEarningsReport = window.DogeMinerOfflineEarnings?.normalizeReport(saveData.offlineEarningsReport) || null;
        this.game.restoreEncounterProgress?.(saveData);
        this.game.dm2Import = window.DogeMinerDM2Import?.receipt(saveData.dm2Import) || null;
        this.game.importReceipt = window.DogeMinerDM2Import?.requestReceipt(saveData.importReceipt) || null;
        this.game.restoreSeasonal?.(saveData.seasonal, saveData.dm2Import);
        this.game.dogecoins = saveData.dogecoins || 0;
        this.game.totalMined = saveData.totalMined || 0;
        this.game.totalClicks = saveData.totalClicks || 0;
        this.game.dps = saveData.dps || 0;
        this.game.highestDps = saveData.highestDps || 0;
        this.game.restoreMiningRecords?.(saveData.records);
        this.game.currentLevel = saveData.currentLevel || 'earth';
        this.game.restoreDogebagStacks?.(saveData.dogebagStacks || {});
        this.game.isTransitioning = false;

        this.game.helperUpgradeOffers = {};
        for (const planet of ['earth', 'moon', 'mars', 'jupiter', 'titan']) {
            const slots = saveData.helperUpgradeOffers?.[planet];
            if (Array.isArray(slots)) {
                this.game.helperUpgradeOffers[planet] = Array.from({ length: 3 }, (_, i) => typeof slots[i] === 'string' ? slots[i] : null);
            }
        }

        // Update data-planet attribute for CSS targeting
        document.body.dataset.planet = this.game.currentLevel;

        this.game.HasPlayed_v0_04 = saveData.HasPlayed_v0_04 || false;
        this.game.hasSeenDogebagIntro = saveData.hasSeenDogebagIntro || false;
        this.game.isSupporter = saveData.isSupporter || false;
        
        // Ensure Supporter UI state is immediately restored
        if (this.game.isSupporter) {
            const supporterSection = document.getElementById('supporter-settings-section');
            if (supporterSection) supporterSection.style.display = 'none';
            const supporterBadge = document.getElementById('supporter-stat-display');
            if (supporterBadge) supporterBadge.style.display = 'block';
        }

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
        Object.assign(this.game, window.DogeMinerTools?.discoveryState(saveData));
        this.game.maxPickaxeDPC = saveData.maxPickaxeDPC || 1;
        this.game.fortuneInventory = Array.isArray(saveData.fortuneInventory) ? saveData.fortuneInventory : [];
        this.game.restoreDiamondStacks?.(saveData.diamondStacks);
        this.game.latestObtainedFortune = saveData.latestObtainedFortune || null;
        this.game.restoreInventoryUnread?.(saveData.inventoryUnread);
        this.game.lastPickaxeDropTime = Number.isFinite(saveData.lastPickaxeDropTime)
            ? Math.max(0, Math.min(Date.now(), saveData.lastPickaxeDropTime)) : 0;
        this.game.prizesSinceLastPickaxe = Number.isFinite(saveData.prizesSinceLastPickaxe)
            ? Math.max(0, Math.floor(saveData.prizesSinceLastPickaxe)) : 0;

        // Migrate old .png/.jpg sprite paths to .webp (post-WebP conversion)
        this._migrateSpritePaths(this.game.pickaxeInventory);
        this._migrateSpritePaths(this.game.fortuneInventory);
        this._patchCorruptedFortunes(this.game.fortuneInventory);

        // Retroactive fix: merge duplicate D.I.A. Badges of the same type into one
        // (their stat values add together). Saves from before the merge rule could
        // hold e.g. two "D.I.A. Badge (Loot)" fortunes.
        if (!saveData.balanceVersion) this._mergeDuplicateDiaBadges(this.game.fortuneInventory);
        if (this.game.latestObtainedFortune) {
            this._migrateSpritePaths([this.game.latestObtainedFortune]);
        }
        this.game.moonDogebagCount = saveData.moonDogebagCount || 0;
        this.game.mysteryBoxObtained = saveData.mysteryBoxObtained || false;
        this.game.mysteryBoxEvolutionPending = saveData.mysteryBoxEvolutionPending === true;
        this.game._mysteryEvolution = null; this.game._mysteryEntryAt = 0;
        this.game.mysteryBoxOpenCount = saveData.mysteryBoxOpenCount || 0;
        this.game.mysteryBoxCycle = Number.isInteger(saveData.mysteryBoxCycle) && saveData.mysteryBoxCycle >= 0 && saveData.mysteryBoxCycle <= 10 ? saveData.mysteryBoxCycle : this.game.mysteryBoxOpenCount % 11;
        this.game._mysteryBoxReadyAt = null;
        this.game.mysteryBoxLastKind = saveData.mysteryBoxLastKind === 'fortune' ? 'fortune' : 'pickaxe';
        this.game.mysteryBoxTimerRemaining = saveData.mysteryBoxTimerRemaining || 0;

        // Bonus Coin state
        this.game.bonusCoinLevel = saveData.bonusCoinLevel || 1;
        this.game.bonusCoinSeenLevel = saveData.bonusCoinSeenLevel || 0;
        this.game.bonusCoinBuffMultiplier = saveData.bonusCoinBuffMultiplier || 1;
        this.game.bonusCoinBuffEndTime = saveData.bonusCoinBuffEndTime || 0;
        this.game.bonusCoinBuffTier = saveData.bonusCoinBuffTier || 0;
        this.game.bonusCoinClaimCount = Number.isFinite(saveData.bonusCoinClaimCount)
            ? Math.max(0, Math.floor(saveData.bonusCoinClaimCount))
            : (this.game.bonusCoinBuffMultiplier > 1 && this.game.bonusCoinBuffEndTime > Date.now() ? 1 : 0);
        this.game.bonusCoinEarlyOffered = saveData.bonusCoinEarlyOffered === true || this.game.bonusCoinClaimCount > 0;

        // Dogediamonds state
        this.game.dogediamonds = saveData.dogediamonds || 0;
        this.game.dogediamondsEverObtained = saveData.dogediamondsEverObtained || 0;
        this.game.searchdogeSlot3Unlocked = saveData.searchdogeSlot3Unlocked || false;
        this.game.timelineNumber = saveData.timelineNumber || 1;
        this.game.restoreTimelineProgress?.(saveData);
        this.game.restoreStoryProgress?.(saveData);
        this.game.restoreWorldDiscovery?.(saveData);
        this.game.restoreSearchdogeDiscovery?.(saveData);
        this.game.diaMissionSeenOnce = saveData.diaMissionSeenOnce || false;
        this.game.hasReachedJupiterEver = saveData.hasReachedJupiterEver || false;
        if (typeof this.game.updateDiamondCounter === 'function') this.game.updateDiamondCounter();
        if (window.timeTravelManager) window.timeTravelManager.updateDogetalkieButton();

        // Retroactive Mystery Box unlock for older saves
        if (!this.game.mysteryBoxObtained && Array.isArray(this.game.fortuneInventory)) {
            if (this.game.fortuneInventory.some(f => f && f.name === 'Mystery Box')) {
                this.game.mysteryBoxObtained = true;
                this.game.mysteryBoxTimerRemaining = 0; // ready immediately
            }
        }
        
        // Timer countdown based on offline time
        if (saveData.mysteryBoxLastSaveTime && this.game.mysteryBoxTimerRemaining > 0) {
            const elapsed = Date.now() - saveData.mysteryBoxLastSaveTime;
            this.game.mysteryBoxTimerRemaining = Math.max(0, this.game.mysteryBoxTimerRemaining - elapsed);
        }

        this.game.mysteryBoxLastSaveTime = Date.now();

        if (saveData.planetRockData) {
            this.game.planetRockData = saveData.planetRockData;
        } else {
            // Legacy migration: funnel old global rocks broken into earth, initialize others
            this.game.planetRockData = {
                earth: { rocksBroken: saveData.rocksBroken || 0, currentHP: null, maxHP: null },
                moon:  { rocksBroken: 0, rockLevel: 1, currentHP: null, maxHP: null },
                mars:  { rocksBroken: 0, rockLevel: 1, currentHP: null, maxHP: null },
                jupiter: { rocksBroken: 0, rockLevel: 1, currentHP: null, maxHP: null },
                titan: { rocksBroken: 0, rockLevel: 1, currentHP: null, maxHP: null }
            };
        }

        // Load active level rock properties
        const level = this.game.currentLevel;
        const activeRockData = this.game.planetRockData[level] || { rocksBroken: 0, rockLevel: 1, currentHP: null, maxHP: null };
        this.game.rocksBroken = Number.isFinite(activeRockData.rocksBroken)
            ? Math.max(0, Math.floor(activeRockData.rocksBroken)) : 0;
        this.game.rockLevel = Number.isFinite(activeRockData.rockLevel) && activeRockData.rockLevel >= 1
            ? Math.floor(activeRockData.rockLevel) : this.game.rocksBroken + 1;
        activeRockData.rockLevel = this.game.rockLevel;
        this.game.rockBaseHP = this.game.getPlanetRockBaseHP(level);
        const needsFreshActiveRock = !Number.isFinite(activeRockData.maxHP) || activeRockData.maxHP <= 0
            || !Number.isFinite(activeRockData.currentHP) || activeRockData.currentHP <= 0;
        if (!needsFreshActiveRock) {
            this.game.rockMaxHP = activeRockData.maxHP;
            this.game.rockCurrentHP = Math.min(activeRockData.maxHP, activeRockData.currentHP);
        } else {
            // An interrupted rock-regeneration animation may have saved 0 HP.
            // Restore safe temporary health, then calculate a fresh rock after
            // all stats, helpers, upgrades, and settings have been restored.
            this.game.rockMaxHP = this.game.rockBaseHP;
            this.game.rockCurrentHP = this.game.rockBaseHP;
        }
        this.game.recalculatePlayerStats();

        // Re-trigger supporter setup AFTER fortune inventory has been restored
        // This ensures the badge check runs against the loaded inventory, not an empty array
        if (this.game.isSupporter) {
            const hadBadgeBefore = this.game.fortuneInventory.some(f => f.templateId === 'badge_of_patronage' || f.name === 'Badge of Patronage');
            this.game.setSupporterStatus(true, true); // silent=true to suppress sounds on routine load
            // If the badge was just re-injected (wasn't in saved inventory), persist it immediately
            if (!hadBadgeBefore) {
                this.saveGame(false);
            }
        }

        // Apply equipped pickaxe sprite to DOM
        const equipped = this.game.getEquippedPickaxe();
        const pickaxeImg = document.getElementById('pickaxe');
        if (equipped && pickaxeImg) {
            const fallbackSprite = 'assets/items/pickaxes/Earth/Normal Pickaxe/standard.webp';
            const equippedSprite = equipped.idleSprite || equipped.sprite || fallbackSprite;
            
            pickaxeImg.src = equippedSprite;
            pickaxeImg.classList.remove('pickaxe-scale-half', 'pickaxe-shift-right', 'pickaxe-scale-baguette', 'pickaxe-paw');
            const sp = equippedSprite.split('/').pop().toLowerCase();
            if (equipped.isPaw) {
                // The bare Paw sits behind Doge and only shows when mining
                pickaxeImg.classList.remove('pickaxe-intro');
                pickaxeImg.classList.add('pickaxe-paw');
            } else if (sp.includes('cleaver')) {
                pickaxeImg.classList.add('pickaxe-scale-half');
            } else if (sp.includes('baguette')) {
                pickaxeImg.classList.add('pickaxe-scale-baguette');
            }
            const largeWeaponPatterns = [
                'axe', 'hammer', 'sword', 'drill', 'shotgun', 'm4.',
                'rocket', 'nuke', 'staff', 'scepter', 'gpu', 'sligpu',
                'fryingpan', 'bigboot', 'eguitar', 'cod.', 'felps',
                'barbell', 'poolnoodle', 'record'
            ];
            if (!equipped.isPaw && largeWeaponPatterns.some(p => sp.includes(p))) {
                pickaxeImg.classList.add('pickaxe-shift-right');
            }
            // Update pickaxe button preview
            const btnPreview = document.getElementById('pickaxe-btn-preview');
            if (btnPreview) {
                btnPreview.src = equippedSprite;
            }
        }

        // Restore fortune button preview (latest obtained)
        if (typeof this.game.setLatestObtainedFortune === 'function') {
            if (this.game.latestObtainedFortune && (this.game.latestObtainedFortune.sprite || this.game.latestObtainedFortune.name)) {
                this.game.setLatestObtainedFortune(this.game.latestObtainedFortune);
            } else if (Array.isArray(this.game.fortuneInventory) && this.game.fortuneInventory.length > 0) {
                // Back-compat: if older save has no explicit latest, use last-added fortune.
                this.game.setLatestObtainedFortune(this.game.fortuneInventory[this.game.fortuneInventory.length - 1]);
            }
        }
        this.game.upgrades = saveData.upgrades || {};
        this.game.helperUpgradeLevels = saveData.helperUpgradeLevels || {};
        this.game.restoreLateProgression?.(saveData);

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
                        ...(typeof savedHelper.groupId === 'string' ? { groupId: savedHelper.groupId } : {}),
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
                        // Purchases made through the phone bar retain the same
                        // name when a desktop field is reconstructed later.
                        const placedNames = new Map();
                        for (const record of placedHelpers.filter(h => h.type === type && h.name)) {
                            placedNames.set(record.name, (placedNames.get(record.name) || 0) + 1);
                        }
                        const names = ownedHelpers.filter(h => h.type === type && h.name).map(h => h.name).filter(name => {
                            const used = placedNames.get(name) || 0;
                            if (used) { placedNames.set(name, used - 1); return false; }
                            return true;
                        });
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
                                dps: helperData.baseDps,
                                name: names.shift() || helperData.name
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

        this.game.restoreLootAutomation?.(saveData.lootAutomation, saveData.timelineNumber);
        this.game.soundEnabled = saveData.settings?.soundEnabled !== false;
        this.game.musicEnabled = saveData.settings?.musicEnabled !== false;
        this.game.rockSoundsEnabled = saveData.settings?.rockSoundsEnabled !== false;
        this.game.backgroundAudioEnabled = saveData.settings?.backgroundAudioEnabled !== false;
        this.game.lessEffects = saveData.settings?.lessEffects === true;
        this.game.limitFps = saveData.settings?.limitFps === true;
        window.DogeMinerPerformance?.apply(this.game);
        this.game.notificationsEnabled = saveData.settings?.notificationsEnabled !== false;
        this.game.storiesEnabled = saveData.settings?.storiesEnabled !== false;
        this.game.hintsEnabled = saveData.settings?.hintsEnabled !== false;
        this.game.newsEnabled = saveData.settings?.newsEnabled !== false;
        this.game.syncStorySettings?.();
        this.game.autoSaveEnabled = saveData.settings?.autoSaveEnabled !== false;
        this.game.autoPlaceHelpers = saveData.settings?.autoPlaceHelpers !== false;
        const placementCheckbox = document.getElementById('auto-place-helpers');
        if (placementCheckbox) placementCheckbox.checked = this.game.autoPlaceHelpers;
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

        // Legacy saves recorded reached/unlocked planets, but no per-run Bonus
        // Coin maximum. Infer that once; future timelines explicitly reset it.
        const planets = ['earth', 'moon', 'mars', 'jupiter', 'titan'];
        this.game.bonusCoinMaxPlanetLevel = Number.isFinite(saveData.bonusCoinMaxPlanetLevel)
            ? Math.max(1, Math.min(5, Math.floor(saveData.bonusCoinMaxPlanetLevel)))
            : Math.max(1, ...Array.from(this.game.unlockedLevels, planet => planets.indexOf(planet) + 1));
        if (!this.game.bonusCoinBuffTier && this.game.bonusCoinBuffMultiplier > 1) {
            const tiers = this.game.getBonusCoinTiers?.() || [];
            // Alpha's old multipliers identify its claimed tier even if a later
            // planet unlocked before this save. Keep that icon with the old buff.
            const legacyTier = [1.5, 1.6, 1.7, 1.8, 1.9, 2].findIndex(multiplier => Math.abs(multiplier - this.game.bonusCoinBuffMultiplier) < 1e-9) + 1;
            this.game.bonusCoinBuffTier = legacyTier || tiers.find(tier => tier && Math.abs(1 + tier.boost - this.game.bonusCoinBuffMultiplier) < 1e-9)?.level
                || Math.max(1, Math.min(6, this.game.bonusCoinLevel));
        }

        if (window.audioManager) {
            window.audioManager.soundEnabled = this.game.soundEnabled;
            window.audioManager.musicEnabled = this.game.musicEnabled;
            window.audioManager.rockSoundsEnabled = this.game.rockSoundsEnabled;
            window.audioManager.backgroundAudioEnabled = this.game.backgroundAudioEnabled;
            window.audioManager.applyAudioPolicy?.();
            window.audioManager.syncAudioSettings?.();
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
        this.game.resumeBonusCoinBuff?.();
        if (needsFreshActiveRock) {
            const computedHP = this.game.getRockHP(this.game.rockBaseHP, this.game.rockLevel - 1, level);
            this.game.rockMaxHP = Number.isFinite(computedHP) && computedHP > 0
                ? computedHP : Math.max(1, this.game.rockBaseHP);
            this.game.rockCurrentHP = this.game.rockMaxHP;
            this.game.planetRockData[level] = { ...activeRockData,
                rocksBroken: this.game.rocksBroken, rockLevel: this.game.rockLevel,
                maxHP: this.game.rockMaxHP, currentHP: this.game.rockCurrentHP };
        }
        this.game.restoreLayout?.(saveData.layout,saveData.dm2Import);
        this.game.setPlanetBackgrounds?.(this.game.currentLevel, { reset: true });
        if (this.game._bootComplete) this.game.startSeasonal?.();
        this.game.updateUI();
        if (this.game.updateRockHealthDisplay) {
            this.game.updateRockHealthDisplay();
        }

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

        if (typeof this.game.initMysteryBox === 'function') {
            this.game.initMysteryBox();
        }
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

    /**
     * Migrates old .png/.jpg sprite paths to .webp in inventory items.
     * Called during save loading to handle saves from before the WebP conversion.
     */
    _migrateSpritePaths(items) {
        if (!Array.isArray(items)) return;
        for (const item of items) {
            if (!item || typeof item !== 'object') continue;
            
            // Migrate all string properties that look like image paths
            for (const key of Object.keys(item)) {
                if (typeof item[key] === 'string' && /\.(png|jpg|jpeg)$/i.test(item[key])) {
                    item[key] = item[key].replace(/\.(png|jpg|jpeg)$/i, '.webp');
                }
            }

            // Restore canonical Patron artwork without changing earned stats.
            if (item.templateId === 'badge_of_patronage' || item.name === 'Badge of Patronage') {
                item.sprite = 'assets/general/icons/Fortunes/Protected Non Seasonal/Badge of Patronage/patreonbadge.webp';
            }

            // Migrate Super Fortune sprite path to the Protected Non Seasonal path
            if (item.isSuperFortune || item.templateId === 'super_fortune' || item.name === 'Super Fortune') {
                item.sprite = 'assets/general/icons/Fortunes/Protected Non Seasonal/Super Fortune/superfortune.webp';
            }
        }
    }

    /**
     * Patches previously saved fortunes that had internal corrupted ASCII due to file encoding issues
     */
    /**
     * Merges duplicate D.I.A. Badges of the same type (name) into a single badge
     * whose stat value is the sum. Mutates the inventory array in place.
     */
    _mergeDuplicateDiaBadges(inventory) {
        if (!Array.isArray(inventory)) return;
        const isBadge = f => f && (f.isDiaBadge || (typeof f.name === 'string' && f.name.startsWith('D.I.A. Badge')));
        const byName = {};
        const toRemove = [];
        inventory.forEach(f => {
            if (!isBadge(f)) return;
            const keeper = byName[f.name];
            if (!keeper) {
                byName[f.name] = f;
            } else {
                const add = (f.stats && f.stats[0] && f.stats[0].value) || 0;
                if (keeper.stats && keeper.stats[0]) keeper.stats[0].value += add;
                toRemove.push(f);
            }
        });
        if (toRemove.length > 0) {
            toRemove.forEach(f => {
                const idx = inventory.indexOf(f);
                if (idx !== -1) inventory.splice(idx, 1);
            });
            console.log(`[Retroactive Fix] Merged ${toRemove.length} duplicate D.I.A. Badge(s)`);
        }
    }

    _patchCorruptedFortunes(inventory) {
        if (!Array.isArray(inventory)) return;
        inventory.forEach(item => {
            if (!item || !item.name) return;
            // Gunther patch
            if (item.name.includes('GAnther') || item.name.includes('Gunther')) {
                item.name = 'Fortune of Günther';
                item.templateId = 'fortune_of_g_nther';
            } 
            // the D patch
            else if (item.name.includes('A?') || item.name.includes('of the D')) {
                item.name = 'Fortune of the Đ';
                item.templateId = 'fortune_of_the_';
            }
        });
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

        if (!Number.isFinite(saveData.dogecoins) || saveData.dogecoins < 0) {
            return false;
        }

        if (!Number.isFinite(saveData.totalMined) || saveData.totalMined < 0) {
            return false;
        }

        if (!Number.isFinite(saveData.totalClicks) || saveData.totalClicks < 0) {
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

    async importSaveText(text, { confirm = true, requestId = null } = {}) {
        const importer = window.DogeMinerDM2Import;
        if (!importer) throw new Error('Save conversion is unavailable. Your save was not changed.');
        if (this._loadInProgress || this.game.isTransitioning || this.game.isCutscenePlaying) throw new Error('Finish the current event before importing.');
        const panel = document.getElementById('left-panel');
        const draft = importer.prepare(text,{field:{width:panel?.offsetWidth || 626,height:panel?.offsetHeight || 586}});
        const summary = draft.summary;
        const message = `${draft.format} save · Timeline ${summary.timeline}\n${this.game.formatNumber(summary.coins)} Dogecoins · ${summary.pickaxes} pickaxes · ${summary.fortunes} fortunes` +
            (summary.helpers === undefined ? '' : ` · ${summary.helpers} helpers`) + '\n\n' + draft.notes.join('\n') + '\n\nReplace your current progress?';
        if (confirm && !await importer.review(message,{title:'Import '+draft.format+' Save'})) return false;
        draft.saveData.importReceipt = importer.requestReceipt({version:1,requestId:requestId || draft.fingerprint+'_'+Date.now(),fingerprint:draft.fingerprint});
        const before = this.createSaveData(), flags = {blocked:this._saveBlocked,error:this.loadError};
        try {
            this.applySaveData(draft.saveData,{originalString:text,persist:true,
                recovery:{key:'dogeminer_ce_before_import_v1',value:flags.blocked ? localStorage.getItem(this.saveKey) || JSON.stringify(before) : JSON.stringify(before)},
                importOriginal:{key:'dogeminer_ce_import_original_'+draft.fingerprint,value:text}});
            this.game.showNotification(draft.format+' save imported successfully!');
            return true;
        } catch (error) {
            try { this._applySaveData(before); } catch (_) {}
            this._saveBlocked=flags.blocked; this.loadError=flags.error;
            throw error;
        }
    }

    importSave() {
        const input = document.createElement('input'); input.type='file'; input.accept='.json,.doge,.txt';
        input.onchange = async event => {
            const file=event.target.files[0];if(!file)return;
            try { await this.importSaveText(await file.text()); }
            catch(error){console.error('Error importing save:',error);this.game.showNotification(error.message || 'Could not import this save. Your progress was kept.');}
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

                // Reset game state directly
                this.game.resetDogebagPresentation?.();
                this.game.resetFieldLootPresentation?.();
                this.game.resetDogebagStacks?.();
                this.game.restoreDiamondStacks?.(null);
                this.game._currencyFlightEpoch = (this.game._currencyFlightEpoch || 0) + 1;
                this.game._rockStateEpoch = (this.game._rockStateEpoch || 0) + 1;
                this.game.activeEffectCount = 0;
                this.game.isRockRegenerating = false;
                this.game.pendingCoinDisplayAmount = 0;
                this.game.pendingDiamondDisplayAmount = 0;
                this.game.encounters=window.DogeMinerEncounters?.normalize();
                this.game.restoreLayout?.({version:1,mode:'auto'});
                this.game.restoreSeasonal?.(null);
                this.game.dm2Import = null;
                this.game.importReceipt = null;
                this.game.dogecoins = 0;
                this.game.totalMined = 0;
                this.game.timelineNumber = 1;
                this.game.timelineProgress = null;
                        this.game.resetRockReplacement?.();
                this.game.resetCateThief?.();
                window.DogeMinerReleaseNotes?.close({immediate:true});
                this.game.resetToolPresentation?.();
                this.game.resetUpgradePresentation?.();
                this.game.resetMoonLaunchPresentation?.();
                this.game.resetStoryPresentation?.();
                this.game.storyProgress = null;
                this.game.worldDiscovery = null;
                this.game.storiesEnabled = true;
                this.game.hintsEnabled = true;
                this.game.newsEnabled = true;
                this.game.syncStorySettings?.();
                this.game.diaMissionSeenOnce = false;
                this.game.totalClicks = 0;
                this.game.restoreMiningRecords?.(null);
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
                this.game.lateProgression = window.DogeMinerLateProgression?.fresh(1);
                this.game.helperUpgradeOffers = {};
                this.game.searchdogeDiscovery = null;
                this.game.pickaxeInventory = [this.game.defaultPickaxe];
                this.game.equippedPickaxeId = 'default_normal_pickaxe';
                Object.assign(this.game, window.DogeMinerTools?.discoveryState());
                this.game.maxPickaxeDPC = 1;
                this.game.fortuneInventory = [];
                this.game.restoreInventoryUnread?.(null);
                
                // Preserve supporter status across resets — this represents a real-money purchase
                // The badge will be re-granted automatically by setSupporterStatus on next load
                const wasSupporter = this.game.isSupporter;
                this.game.latestObtainedFortune = null;
                this.game.lastPickaxeDropTime = 0;
                this.game.prizesSinceLastPickaxe = 0;
                this.game.moonDogebagCount = 0;
                this.game.mysteryBoxObtained = false;
                this.game.mysteryBoxEvolutionPending = false;
                this.game._mysteryEvolution = null; this.game._mysteryEntryAt = 0;
                this.game.mysteryBoxOpenCount = 0;
                this.game.mysteryBoxCycle = 0;
                this.game._mysteryBoxReadyAt = null;
                this.game.mysteryBoxLastKind = 'pickaxe';
                this.game.mysteryBoxTimerRemaining = 0;
                this.game.mysteryBoxLastSaveTime = 0;

                this.game.resetRickVisitor?.();
                this.game.despawnRick?.({ animate: false });

                // Reset Bonus Coin progression and clear any active buff / on-screen coin
                this.game.bonusCoinLevel = 1;
                this.game.bonusCoinMaxPlanetLevel = 1;
                this.game.bonusCoinBuffTier = 0;
                this.game.bonusCoinClaimCount = 0;
                this.game.bonusCoinEarlyOffered = false;
                this.game.resetBonusCoinSpawnCycle?.();
                this.game.bonusCoinSeenLevel = 0;
                this.game.bonusCoinBuffMultiplier = 1;
                this.game.bonusCoinBuffEndTime = 0;
                if (typeof this.game._expireBonusCoinBuff === 'function') this.game._expireBonusCoinBuff({ silent: true });
                if (typeof this.game._removeBonusCoinEl === 'function') this.game._removeBonusCoinEl();

                // Reset Dogediamonds
                this.game.dogediamonds = 0;
                this.game.dogediamondsEverObtained = 0;
                this.game.searchdogeSlot3Unlocked = false;
                if (typeof this.game.updateDiamondCounter === 'function') this.game.updateDiamondCounter();

                const mboxBtn = document.getElementById('mystery-box-btn');
                if (mboxBtn) mboxBtn.style.display = 'none';
                
                // Clear the fortune button preview image
                const fortunePreviewImg = document.getElementById('fortune-btn-preview');
                if (fortunePreviewImg) {
                    fortunePreviewImg.src = '';
                    fortunePreviewImg.alt = 'Fortunes';
                    fortunePreviewImg.classList.add('fortune-icon-placeholder');
                    fortunePreviewImg.style.visibility = 'hidden';
                }
                
                this.game.rocksBroken = 0;
                this.game.rockLevel = 1;
                this.game.balanceVersion = window.DogeMinerBalance?.VERSION || null;
                this.game.betaMigrationReport = null;
                this.game.offlineEarningsReport = null;
                this.game.closeOfflineEarningsReport?.();
                this.loadError = null;
                this._saveBlocked = false;
                this.game.planetRockData = {
                    earth: { rocksBroken: 0, rockLevel: 1, currentHP: null, maxHP: null },
                    moon:  { rocksBroken: 0, rockLevel: 1, currentHP: null, maxHP: null },
                    mars:  { rocksBroken: 0, rockLevel: 1, currentHP: null, maxHP: null },
                    jupiter: { rocksBroken: 0, rockLevel: 1, currentHP: null, maxHP: null },
                    titan: { rocksBroken: 0, rockLevel: 1, currentHP: null, maxHP: null }
                };
                
                this.game.rockBaseHP = this.game.getPlanetRockBaseHP('earth');
                this.game.rockMaxHP = this.game.rockBaseHP;
                this.game.rockCurrentHP = this.game.rockBaseHP;
                this.game.lastDamageThresholdPercent = 100;
                this.game.recalculatePlayerStats();
                this.game.currentLevel = 'earth';
                this.game.autoPlaceHelpers = true;
                this.game.restoreLootAutomation?.(null, 1);
                const placementCheckbox = document.getElementById('auto-place-helpers');
                if (placementCheckbox) placementCheckbox.checked = true;
                this.game.hasPlayedMoonLaunch = false;
                this.game.hasSeenDogebagIntro = false;
                this.game.isCutscenePlaying = false;
                this.game.autoSaveEnabled = false; // Prevent interval auto-save from misfiring
                
                // Restore supporter flag immediately so it gets baked into the fresh save
                if (wasSupporter) {
                    this.game.isSupporter = true;
                }

                // Unconditionally write a fresh local save containing the 0-state
                this.saveGame(false);

                // Overwrite the cloud save with the 0-state to act as a fallback, then issue deletion
                if (window.cloudSaveManager && window.cloudSaveManager.currentUser) {
                    await window.cloudSaveManager.saveToCloudSilent();
                    await window.cloudSaveManager.deleteCloudSave();
                }

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
