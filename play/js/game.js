// DogeMiner: Community Edition - Main Game Logic
class DogeMinerGame {
    constructor() {
        this.dogecoins = 0;
        this.totalMined = 0;
        this.totalClicks = 0;
        this.dps = 0;
        this.highestDps = 0;
        this.records = { highestcrit: 0 };
        this.balanceVersion = window.DogeMinerBalance?.VERSION || 'dm2-beta-1';
        this.betaMigrationReport = null;
        this.currentLevel = 'earth';
        this.helpers = [];
        this.moonHelpers = [];
        this.marsHelpers = [];
        this.jupiterHelpers = [];
        this.titanHelpers = [];
        this.earthPlacedHelpers = [];
        this.moonPlacedHelpers = [];
        this.marsPlacedHelpers = [];
        this.jupiterPlacedHelpers = [];
        this.titanPlacedHelpers = [];

        // Name lists for helpers
        this.miningShibeNames = [
            'Jerry', 'Terry', 'Larry', 'Barry', 'Carrie', 'Perry', 'Gary', 'Harry', 'Marie', 'Sporklin',
            'Lafite', 'Dimi', 'RKN little helper', 'Ed', 'Jared', 'Dennis', 'Betty', 'Leonard', 'James', 'Jimmy',
            'Timmy', 'Mary', 'Martha', 'Linda', 'Jimothy', 'Scout', 'Barley', 'Cherry', 'Vader', 'Mochatitan',
            'Babylion122', 'rkn', 'Raspy', 'Melon', 'News', 'Rick', 'Sam', 'Josiah', 'Ren', 'Creedoo',
            'Cottage', 'Cheese', 'Bikini', 'Silver', 'Sorrel', 'Kyle', 'DwellingStars', 'Done', 'Peanut', 'Fry',
            'Bruno', 'Charlie', 'Emmet', 'Lucy', 'Vincent', 'tothestars693', 'Cherie', 'Crush', 'RockMelon', 'HoneyMelon', 'Karvão', 'NinjaJayBird', 'Ava', 'Pandie',
        ];

        this.helperNames = {
            'miningShibe': 'Mining Shibe',
            'dogeKennels': 'Doge Kennels',
            'streamerKittens': 'Streamer Kittens',
            'spaceRocket': 'Space Rocket',
            'timeMachineRig': 'Time Machine Mining Rig',
            'infiniteDogebility': 'Infinite Dogebility Drive',
            'moonBase': 'Moon Base',
            'moonShibe': 'Moon Shibe',
            'dogeCar': 'Doge Car',
            'landerShibe': 'Lander Shibe',
            'marsRocket': 'Mars Rocket',
            'dogeGate': 'Doge Gate',
            'marsBase': 'Mars Base',
            'partyShibe': 'Party Shibe',
            'curiosiDoge': 'CuriosiDoge',
            'djKittenz': 'DJ Kittenz',
            'spaceBass': 'Space Bass',
            'jupiterRocket': 'Jupiter Rocket',
            'cloudBase': 'Cloud Base',
            'superShibe': 'Super Shibe',
            'dogeAirShip': 'Doge Air Ship',
            'flyingDoggo': 'Flying Doggo',
            'tardogeis': 'TARDogeIS',
            'dogeStar': 'DogeStar'
        };

        // Game state
        this.isPlaying = false;
        this.isPlacingHelpers = false;
        this.lastSave = Date.now();
        this.autoSaveInterval = 30000; // 30 seconds
        this.startTime = Date.now();
        this.totalPlayTime = 0;

        // Settings
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.rockSoundsEnabled = true;
        this.backgroundAudioEnabled = true;
        this.lessEffects = false;
        this.limitFps = false;
        this.notificationsEnabled = true;
        this.hintsEnabled = true;
        this.storiesEnabled = true;
        this.newsEnabled = true;
        this.autoSaveEnabled = true;

        // Cutscenes
        this.hasPlayedMoonLaunch = false;
        this.isCutscenePlaying = false;
        this.isTransitioning = false; // Flag for planet transitions
        this.cutsceneOverlay = null;
        this.cutsceneVideo = null;
        this.cutsceneSkipButton = null;
        this.cutsceneSkipTimeout = null;

        // Input state tracking
        this.isMouseDown = false;
        this.isSpaceDown = false;
        this.swingTimeout = null;

        // Mouse position tracking
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;


        // Click rate limiting (max 15 CPS like original DogeMiner 2)
        this.maxCPS = 15;
        this.clickTimes = [];
        this.lastClickTime = 0;

        // Animation and effects with limits
        this.clickEffects = [];
        this.particles = [];
        this.activeEffectCount = 0;
        this.pendingCoinDisplayAmount = 0;
        this.pendingDiamondDisplayAmount = 0;
        this.activeParticleCount = 0;
        this.maxEffects = 20; // Limit concurrent effects
        this.maxParticles = 50; // Limit concurrent particles

        // Helper placement system
        this.helperBeingPlaced = null;
        this.helperSpriteBeingPlaced = null;
        this.placedHelpers = [];
        this.helpersOnCursor = []; // Array to hold multiple helpers being placed
        this.selectedHelperIds = new Set(); // Set of currently selected helper IDs (desktop marquee)
        this.helperUpgradeLevels = {}; // Tracks upgrade level per helper type (e.g., { miningShibe: 3 })
        this.helperUpgradeOffers = {}; // Three fixed Searchdoge slots per planet.

        // Background rotation
        this.backgrounds = this.getPlanetBackgrounds(this.currentLevel);
        this._backgroundPlanet = this.currentLevel;
        this.currentBackgroundIndex = 0;
        this.backgroundRotationInterval = null;

        // Blinking animation
        this.blinkInterval = null;

        // Level definitions for UI updates
        this.levels = {
            earth: {
                name: 'Earth',
                background: 'assets/backgrounds/bg1.webp',
                rock: 'assets/general/rocks/earth.webp',
                character: 'assets/general/character/standard.webp'
            },
            moon: {
                name: 'Moon',
                background: 'assets/backgrounds/bgmoon01.webp',
                rock: 'assets/general/rocks/moon.webp',
                character: 'assets/general/character/spacehelmet.webp'
            },
            mars: {
                name: 'Mars',
                background: 'assets/backgrounds/bg101.webp',
                rock: 'assets/general/rocks/mars.webp',
                character: 'assets/general/character/party.webp'
            },
            jupiter: {
                name: 'Jupiter',
                background: 'assets/backgrounds/bgjup01.webp',
                rock: 'assets/general/rocks/jupiter.webp',
                character: 'assets/general/character/spacehelmet.webp'
            },
            titan: {
                name: 'Titan',
                background: 'assets/backgrounds/titan02.webp',
                rock: 'assets/general/rocks/titan.webp',
                character: 'assets/general/character/spacehelmet.webp'
            }
        };

        // Unlock system
        this.unlockedLevels = new Set(['earth']);
        this.unlockedAchievements = new Set();

        // Uncleared save flag for future rewards
        this.HasPlayed_v0_04 = true;

        // Planet-specific rock health tracking map
        this.planetRockData = {
            earth: { rocksBroken: 0, rockLevel: 1, currentHP: null, maxHP: null },
            moon: { rocksBroken: 0, rockLevel: 1, currentHP: null, maxHP: null },
            mars: { rocksBroken: 0, rockLevel: 1, currentHP: null, maxHP: null },
            jupiter: { rocksBroken: 0, rockLevel: 1, currentHP: null, maxHP: null },
            titan: { rocksBroken: 0, rockLevel: 1, currentHP: null, maxHP: null }
        };

        // Active rock health system (HP-based) for the current planet
        this.rocksBroken = 0; // Initialize global before setting base HP
        this.rockLevel = 1;
        this.rockBaseHP = this.getPlanetRockBaseHP('earth');
        this.rockMaxHP = this.rockBaseHP;
        this.rockCurrentHP = this.rockBaseHP;
        this.lastDamageThresholdPercent = 100; // Tracks 75%, 50%, 25% for coin pile expulsion
        this.isRockRegenerating = false;
        this.lastCritHit = false; // For UI feedback
        this._helperRockElapsed = 0;
        this.lastPickaxeDropTime = 0;
        this.prizesSinceLastPickaxe = 0;

        // Pickaxe & Fortune System
        this.pickaxeFactory = null; // Initialized async in main.js
        this.fortuneFactory = null; // Initialized async in main.js
        this.pickaxeInventory = []; // Array of generated pickaxe instances
        this.equippedPickaxeId = null; // instanceId of equipped pickaxe
        this.maxPickaxeDPC = 1; // Tracks highest DPC for linear progression

        // Default starting pickaxe (generated in-place, not from factory)
        this.defaultPickaxe = {
            instanceId: 'default_normal_pickaxe',
            templateId: 'earth_normal_pickaxe',
            name: 'Normal Pickaxe',
            rarity: 'common',
            description: 'Normal yet faithful.',
            planetOfOrigin: 'earth',
            baseDPC: 1,
            stats: [],
            idleSprite: 'assets/items/pickaxes/Earth/Normal Pickaxe/standard.webp',
            isStaffOfSundoge: false,
            specialInstructions: ''
        };
        this.pickaxeInventory.push(this.defaultPickaxe);
        this.equippedPickaxeId = this.defaultPickaxe.instanceId;

        // Fortune system
        this.fortuneInventory = []; // Array of fortune instances
        this.inventoryUnread = { pickaxe: 0, fortune: 0 };
        this.ownedFortunes = []; // Legacy compat
        this.latestObtainedFortune = null; // { name, sprite } for fortune button preview
        this.moonDogebagCount = 0; // Tracks how many Moon Dogebags have been opened
        this.mysteryBoxEvolutionPending = false;
        this.mysteryBoxObtained = false; // Whether the Mystery Box has been granted
        this.mysteryBoxOpenCount = 0; // Total times opened
        this.mysteryBoxTimerRemaining = 0; // ms remaining on cooldown
        this.mysteryBoxLastSaveTime = 0; // Date.now() when last saved/closed
        this._mysteryBoxInterval = null; // setInterval ref

        // Bonus Coin system — a coin that periodically appears on the mining area.
        // Clicking it grants a temporary boost to BOTH total DPS and DPC. The coin
        // Reached planets expand a weighted pool; timeline 2 adds the best tier.
        this.bonusCoinLevel = 1;        // Highest eligible tier, for unlock notifications
        this.bonusCoinMaxPlanetLevel = 1; // Highest reached planet in this timeline
        this.bonusCoinSeenLevel = 0;    // Highest tier the player has been notified about
        this.bonusCoinBuffMultiplier = 1;   // Active buff multiplier (1 = no buff)
        this.bonusCoinBuffEndTime = 0;      // Date.now() when the active buff expires
        this.bonusCoinBuffTier = 0;         // Claimed tier, independent of later unlocks
        this.bonusCoinClaimCount = 0;       // Lifetime claims (not reset by prestige)
        this.bonusCoinEarlyOffered = false;
        this._bonusCoinSpawnChance = 0.22;  // Runtime odds, as in DM2's n0
        this._bonusCoinSpawnInterval = null;
        this._bonusCoinEarlyCheckMs = 0;
        this._bonusCoinDespawnTimeout = null; // on-screen lifetime timer
        this._bonusCoinBuffInterval = null; // countdown/expiry ticker
        this._bonusCoinEl = null;           // the on-screen clickable coin element

        // Dogediamonds — a rare premium currency used to buy non-direct upgrades.
        // Dropped from breaking rocks (3% lucky drop) and guaranteed within the first
        // 10 rocks for players who have never obtained one.
        this.dogediamonds = 0;              // current spendable balance
        this.dogediamondsEverObtained = 0;  // lifetime total (drives the first-find popup + counter visibility)
        this.searchdogeSlot3Unlocked = false; // 3rd upgrade ("Searchdoge") slot, unlocked for 1 Dogediamond

        // Time Travel / D.I.A. mission (prestige). Each completed mission advances the timeline.
        this.timelineNumber = 1;
        this.lateProgression = window.DogeMinerLateProgression?.fresh(1);
        this.diaMissionSeenOnce = false; // first mission can't be skipped (story moment)
        this.hasReachedJupiterEver = false; // sticky planet progress for the Dogetalkie unlock

        // Inventory UI state (shared desktop + mobile)
        this._inventoryUi = {
            pickaxe: { search: '', rarity: '', sort: 'newest' },
            fortune: { search: '', rarity: '', sort: 'newest' }
        };
        this._inventoryUiBound = { pickaxe: false, fortune: false };

        // Player stats (recalculated from equipped pickaxe + fortunes)
        this.playerStats = {
            luck: 0,
            lootFind: 0,
            wow: 0,
            critChance: 0,
            dpcMultiplier: 1,
            helperDpsMultiplier: 1,
            totalDpsMultiplier: 1,
            flatHelperDps: 0,
            pickaxeFlatDps: 0,
            fortuneFlatDps: 0,
            mysteryBonus: 0,
            rocketCostReduction: 0
        };
        this.rockMaxHP = this.getRockHP(this.rockBaseHP, 0);
        this.rockCurrentHP = this.rockMaxHP;

        // Rock progression
        this.rocksBroken = 0;

        // UI state flags

        // Rick Doge system
        this.rickInterval = null;
        this.rickVisible = false;
        this.placedRick = null;
        this.isDraggingRick = false;

        // DPS interval for performance
        this.dpsInterval = null;
        this.rickSprites = [
            'assets/general/rm/r1.webp',
            'assets/general/rm/r2.webp',
            'assets/general/rm/r3.webp',
            'assets/general/rm/r4.webp'
        ];
        this.currentRickSprite = 0;
        this.rickAnimationDirection = 1; // 1 for forward, -1 for backward
        this.rickAnimationComplete = false;

        // Initialize game data
        this.initializeGameData();
        this.setupEventListeners();
        this.startGameLoop();
        this.startBackgroundRotation();
        this.startBlinking();
        this.startRickSpawn();
        this.startSearchdogAnimation();

        // Track global mouse position
        this.addGlobalMouseTracking();

        // Ensure the DOM background images match the initial planet selection.
        this.syncBackgroundImages(true);

        // Intro animation state
        this.isIntroPlaying = false;

        // Cutscene DOM bindings
        this.setupCutsceneSystem();

        // Marquee selection for PC/Desktop (disabled on Mobile)
        this.initMarqueeSelection();
        this.initializeHelperPresentation?.();
    }

    showPendingBetaMigrationReport() {
        const report = this.betaMigrationReport;
        if (!this._bootComplete) return false;
        const wasPlaying = this.isBetaReportOpen ? this._betaReportResumePlaying : this.isPlaying;
        const resume = () => {
            this.isBetaReportOpen = false;
            this._shownBetaMigrationReport = null;
            this.isPlaying = wasPlaying;
            if (this._introAfterBetaReport) {
                this._introAfterBetaReport = false;
                setTimeout(() => this.playDogeIntro(this.currentLevel !== 'earth'), 0);
            }
        };
        if (!report || report.acknowledged) {
            if (this.isBetaReportOpen) {
                window.BetaBalanceReport?.close();
                resume();
            }
            return false;
        }
        if (this.isBetaReportOpen && this._shownBetaMigrationReport === report) return true;
        if (!window.BetaBalanceReport) throw new Error('The Beta balance report could not be loaded.');
        this._betaReportResumePlaying = wasPlaying;
        this._shownBetaMigrationReport = report;
        this.isBetaReportOpen = true;
        this.isPlaying = false;
        this.isMouseDown = false;
        this.isSpaceDown = false;
        this._helperRockElapsed = 0;
        try {
            window.BetaBalanceReport.show(report, {
                planet: this.currentLevel,
                onAcknowledge: () => {
                    if (this.betaMigrationReport !== report) return false;
                    if (window.saveManager?.acknowledgeBetaMigration() !== true) return false;
                    resume();
                    return true;
                }
            });
        } catch (error) {
            this.isBetaReportOpen = false;
            this.isPlaying = wasPlaying;
            throw error;
        }
        return true;
    }

    isMobileDevice() {
        return window.innerWidth <= 768 || document.body.classList.contains('force-mobile') || ('ontouchstart' in window && navigator.maxTouchPoints > 1 && window.innerWidth <= 1024);
    }

    clearHelperSelection() {
        if (this.selectedHelperIds) {
            this.selectedHelperIds.clear();
            this.updateHelperSelectionStyles();
        }
    }

    updateHelperSelectionStyles() {
        const allSprites = document.querySelectorAll('#helper-container .helper-sprite');
        allSprites.forEach(sprite => {
            const idAttr = sprite.getAttribute('data-helper-id');
            if (!idAttr) return;
            const numId = Number(idAttr);
            if (this.selectedHelperIds && (this.selectedHelperIds.has(idAttr) || (numId && this.selectedHelperIds.has(numId)))) {
                sprite.classList.add('helper-selected');
            } else {
                sprite.classList.remove('helper-selected');
            }
        });
    }

    initMarqueeSelection() {
        const leftPanel = document.getElementById('left-panel');
        if (!leftPanel) return;

        let isMarqueeActive = false;
        let marqueeStartPos = { x: 0, y: 0 };
        let marqueeBox = null;
        let hasMovedThreshold = false;

        leftPanel.addEventListener('mousedown', (e) => {
            // Disabled completely on mobile devices
            if (this.isMobileDevice()) return;

            // Ignore right clicks or active placement mode
            if (this.isPlacingHelpers || e.button !== 0) return;

            const target = e.target;
            // Ignore clicks on existing helpers, buttons, dialogs, rock, etc.
            if (target.closest('.helper-sprite, #main-character, #character-shadow, #rock-container, #pickaxe-container, #news-container, .switcher-modal, #topright-hud, .dialog, button, a')) {
                return;
            }

            const panelRect = leftPanel.getBoundingClientRect();
            marqueeStartPos = {
                x: e.clientX - panelRect.left,
                y: e.clientY - panelRect.top
            };

            isMarqueeActive = true;
            hasMovedThreshold = false;

            if (!e.shiftKey) {
                this.clearHelperSelection();
            }

            const handleMouseMove = (moveEvt) => {
                if (!isMarqueeActive) return;

                const currentX = moveEvt.clientX - panelRect.left;
                const currentY = moveEvt.clientY - panelRect.top;
                const dx = currentX - marqueeStartPos.x;
                const dy = currentY - marqueeStartPos.y;

                if (!hasMovedThreshold && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
                    hasMovedThreshold = true;
                    if (!marqueeBox) {
                        marqueeBox = document.createElement('div');
                        marqueeBox.className = 'marquee-select-box';
                        const container = document.getElementById('helper-container') || leftPanel;
                        container.appendChild(marqueeBox);
                    }
                }

                if (!hasMovedThreshold || !marqueeBox) return;

                const left = Math.min(marqueeStartPos.x, currentX);
                const top = Math.min(marqueeStartPos.y, currentY);
                const width = Math.abs(dx);
                const height = Math.abs(dy);

                marqueeBox.style.left = left + 'px';
                marqueeBox.style.top = top + 'px';
                marqueeBox.style.width = width + 'px';
                marqueeBox.style.height = height + 'px';

                const boxRect = marqueeBox.getBoundingClientRect();

                const sprites = document.querySelectorAll('#helper-container .helper-sprite:not(.attached-to-mouse)');
                sprites.forEach(sprite => {
                    const idAttr = sprite.getAttribute('data-helper-id');
                    if (!idAttr) return;
                    const spriteRect = sprite.getBoundingClientRect();

                    const intersects = !(
                        spriteRect.right < boxRect.left ||
                        spriteRect.left > boxRect.right ||
                        spriteRect.bottom < boxRect.top ||
                        spriteRect.top > boxRect.bottom
                    );

                    const numId = Number(idAttr);
                    const helperId = numId || idAttr;

                    if (intersects) {
                        this.selectedHelperIds.add(helperId);
                        if (numId) this.selectedHelperIds.add(idAttr);
                    } else if (!moveEvt.shiftKey) {
                        this.selectedHelperIds.delete(helperId);
                        if (numId) this.selectedHelperIds.delete(idAttr);
                    }
                });

                this.updateHelperSelectionStyles();
            };

            const handleMouseUp = () => {
                isMarqueeActive = false;
                if (marqueeBox) {
                    marqueeBox.remove();
                    marqueeBox = null;
                }
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });
    }

    setupCutsceneSystem() { window.DogeMinerMoonLaunch.setup(this); }

    playMoonLaunchCutscene() { return window.DogeMinerMoonLaunch.open(this); }

    closeCutscene() { return window.DogeMinerMoonLaunch.requestSkip(this); }

    addGlobalMouseTracking() {
        // Track mouse position globally for cursor sprite positioning
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // Track touch position for mobile devices
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                this.mouseX = touch.clientX;
                this.mouseY = touch.clientY;
            }
        }, { passive: true });
    }

    initializeGameData() {
        // Helper definitions will be loaded from shop.js
        // Pickaxe and level systems will be implemented later
    }

    setupEventListeners() {
        // Rock clicking
        const rockContainer = document.getElementById('rock-container');
        const clickOverlay = document.getElementById('click-overlay');
        const dogeContainer = document.getElementById('character-container');

        const handleMiningMouseDown = (e) => {
            if (!this.canUseMiningInput(e)) return;
            this.isMouseDown = true;
            this.processClick(e);
        };

        const handleDogeMouseDown = (e) => {
            const mainCharacter = document.getElementById('main-character');
            const characterShadow = document.getElementById('character-shadow');
            const target = e.target;

            if (target === mainCharacter || target === characterShadow) {
                const clickOverlay = document.getElementById('click-overlay');
                if (clickOverlay) {
                    const rect = clickOverlay.getBoundingClientRect();
                    const simulatedEvent = {
                        ...e,
                        target: clickOverlay,
                        currentTarget: clickOverlay,
                        clientX: e.clientX,
                        clientY: e.clientY,
                        preventDefault: () => e.preventDefault()
                    };
                    this.processClick(simulatedEvent);
                    return;
                }
            }

            handleMiningMouseDown(e);
        };

        // Mouse events with click rate limiting
        if (clickOverlay) {
            clickOverlay.addEventListener('mousedown', handleMiningMouseDown);
        }

        if (dogeContainer) {
            dogeContainer.addEventListener('mousedown', handleDogeMouseDown);
        }

        document.addEventListener('mouseup', () => {
            this.isMouseDown = false;
            this.endSwing();
        });

        // Keyboard events with click rate limiting
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.repeat && this.canUseMiningInput(e)) {
                e.preventDefault();
                this.isSpaceDown = true;
                this.processClick();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space' && this.isSpaceDown) {
                e.preventDefault();
                this.isSpaceDown = false;
                this.endSwing();
            }
        });

        window.addEventListener('blur', () => this.releaseMiningInput());
        document.addEventListener('visibilitychange', () => { if (document.hidden) this.releaseMiningInput(); });

        // Auto-save is now handled by SaveManager
    }

    releaseMiningInput() {
        this.isMouseDown = false; this.isSpaceDown = false;
        this.releaseDrill?.(); this.endSwing();
    }

    canUseMiningInput(event = null) {
        if (!this.isPlaying || this.isIntroPlaying || this.isCutscenePlaying || this.isTransitioning || this.isBetaReportOpen || this.isOfflineReportOpen || this.isStoryOpen || this.isUpdateNotesOpen || this._dogebagReveal || this.isMysteryBoxOpen || this._sunDogeFusion || document.hidden || document.hasFocus?.() === false) return false;
        const control = 'input,textarea,select,button,a,[contenteditable="true"],[role="textbox"],[role="button"]';
        if ((event?.target || document.activeElement)?.closest?.(control)) return false;
        return !document.querySelector?.('.modal.active,.switcher-modal.active,.dialog-overlay.active,.dia-mission-modal.active,.dia-warning-modal.active,#controller-dialog.active,#mission-passed,#mission-cutscene');
    }

    handleRockClick(event = null, hitOptions = {}) {
        if (!this.canUseMiningInput(event)) return;
        if (this.isRockRegenerating) { this.playToolGround?.(); return; }

        this.totalClicks++;
        this.rollMiningChatter?.(Math.random, hitOptions.textChance ?? .2);
        this.clearStartingHint?.();

        const doubleAttack = this.rollDualAttack?.() === true;
        this.prepareToolAttack?.(doubleAttack);
        this._lastToolDouble = doubleAttack;
        if (!hitOptions.drill) { this.swingPickaxe(); this.bounceDoge(); }

        // Calculate damage with crit chance
        const { damage, isCrit } = this.calculateClickDamage();
        this.lastCritHit = isCrit;

        // Coins earned = damage dealt (DPC acts as both damage AND income)
        const coinsPerHit = Math.min(damage * (hitOptions.strength ?? 1) * (doubleAttack ? 2 : 1), Math.max(0, this.rockCurrentHP));
        const isRecordCrit = this.recordCriticalHit(coinsPerHit, isCrit);
        this.dogecoins += coinsPerHit;
        this.totalMined += coinsPerHit;

        if (coinsPerHit > 0 && this.activeEffectCount < this.maxEffects) {
            this.createFloatingCoin(coinsPerHit, event, isCrit, isRecordCrit);
            this.createClickEffect(event);
        }
        if (this.activeParticleCount < this.maxParticles) {
            this.createParticleEffect(event);
        }

        this.applyRockDamage(coinsPerHit);

        // Swap to active sprite on click
        this.showActivePickaxeSprite();

        this.updateUI();

        if (this.playToolHit) { this.playToolHit(isCrit, hitOptions); return; }
        // Context-sensitive hit sound
        if (this.rockCurrentHP <= 0 && !this.isRockRegenerating) {
            // Rock already dead — bonk sound
            this.playSound('hitGround');
        } else if (isCrit && hitOptions.critSound !== false) {
            // Critical hit
            this.playSound('hitHard');
        } else if (hitOptions.hitSound !== false) {
            // Check equipped pickaxe for custom hit sounds
            const equipped = this.getEquippedPickaxe();
            const pickaxeName = equipped ? equipped.name : '';
            if (pickaxeName === 'Gas Carbine') {
                this.playSound('pew');
            } else if (pickaxeName === 'Light-blade Pickaxe') {
                this.playSound('lasersword');
            } else {
                this.playSound('pick');
            }
        }
    }

    processClick(event = null) {
        const now = Date.now();
        if (!this.canUseMiningInput(event)) {
            return;
        }

        if (this.isDrillEquipped?.()) { this.pressDrill?.(event); return; }
        this.clickTimes = this.clickTimes.filter(time => now - time < 1000);

        if (this.clickTimes.length >= this.maxCPS) {
            return;
        }

        if (now - this.lastClickTime < 70) {
            return;
        }

        this.clickTimes.push(now);
        this.lastClickTime = now;

        this.handleRockClick(event);
        this.startSwing();
    }

    restoreMiningRecords(records) {
        this.records = records && typeof records === 'object' && !Array.isArray(records) ? { ...records } : {};
        if (!Number.isFinite(this.records.highestcrit) || this.records.highestcrit < 0) this.records.highestcrit = 0;
    }

    getMiningRecordsForSave() {
        this.restoreMiningRecords(this.records);
        return { ...this.records };
    }

    recordCriticalHit(amount, isCrit) {
        if (!this.records) this.restoreMiningRecords(null);
        const record = isCrit && Number.isFinite(amount) && amount > this.records.highestcrit;
        if (record) this.records.highestcrit = amount;
        return !!record;
    }

    getClickPower() {
        return this.getPickaxeDPC();
    }

    /**
     * Calculates click damage with crit chance and multipliers
     * Returns { damage, isCrit }
     */
    calculateClickDamage() {
        const equipped = this.getEquippedPickaxe();
        let baseDPC = equipped ? equipped.baseDPC : 1;

        if (baseDPC === 0) {
            return { damage: 0, isCrit: false };
        }

        // Timeline-start Paw: "Under no circumstances can the Paw be more than 1."
        // No multipliers, buffs, or crits apply while digging with bare paws.
        if (equipped && equipped.isPaw) {
            return { damage: 1, isCrit: false };
        }

        let damage = baseDPC * this.playerStats.dpcMultiplier * (this.isSupporter ? 1.05 : 1)
            * (this.bonusCoinBuffMultiplier || 1);

        // Apply critical hit
        const chance = this.playerStats.critChance || 0;
        const isCrit = chance > 0 && Math.random() <= chance;
        if (isCrit) {
            let criticalMultiplier = 2.5;
            if (chance >= 1) {
                if (chance >= 3) {
                    if (Math.random() <= chance - 3) criticalMultiplier = 4;
                } else if (chance >= 2) {
                    if (Math.random() <= chance - 2) criticalMultiplier = 3.5;
                } else if (Math.random() <= chance - 1) {
                    criticalMultiplier = 3;
                }
            }
            damage = Math.ceil(damage * criticalMultiplier);
        }
        return { damage: Math.max(1, damage), isCrit };
    }

    /**
     * Calculates rock HP based on rocks broken (scaling difficulty)
     */
    getRockHP(baseHP, difficultySteps, planet = this.currentLevel) {
        const equippedDPC = Math.max(0, Number(this.getEquippedPickaxe()?.baseDPC) || 0);
        const localDPS = this.getPlanetMiningDPS(planet);
        const base = Math.max(1, Number(baseHP) || this.getPlanetRockBaseHP(planet));
        const steps = Math.max(0, Math.floor(Number(difficultySteps) || 0));
        const hp = (base + Math.ceil(2.5 * localDPS + Math.ceil(2 * equippedDPC))) * Math.pow(1.1, steps);
        // Finite storage prevents a damaged/corrupt difficulty value from making rocks immortal.
        let maximum = Math.min(Number.MAX_VALUE, Math.ceil(hp));
        if (this.getRockType(steps + 1) === 9) maximum = Math.min(Number.MAX_VALUE, Math.round(maximum + maximum / 7));
        return Math.max(1, maximum);
    }

    /**
     * Returns the base starting HP for the rock relative to the planet's difficulty.
     */
    getPlanetRockBaseHP(planet) {
        switch (planet) {
            case 'earth': return 60;
            case 'moon': return 3000;
            case 'mars': return 155000;
            case 'jupiter': return 450000;
            case 'titan': return 2500000;
            default: return 60;
        }
    }

    getBalancedRockMigration(planet, saved = {}) {
        const rocksBroken = Math.max(0, Math.floor(Number(saved.rocksBroken) || 0));
        const oldLevel = Math.max(1, Math.floor(Number(saved.rockLevel) || rocksBroken + 1));
        const base = this.getPlanetRockBaseHP(planet);
        const firstHP = this.getRockHP(base, 0, planet);
        const pickaxe = this.getEquippedPickaxe();
        const clickDPC = pickaxe?.isPaw ? 1 : Math.max(0, (Number(pickaxe?.baseDPC) || 0)
            * (this.playerStats.dpcMultiplier || 1) * (this.isSupporter ? 1.05 : 1));
        const helperDamagePerSecond = this.getPlanetMiningDPS(planet) * 5 / (this.timelineNumber > 1 ? 3 : 2);
        // A one-time rescue gives a migrated player a rock no worse than the base rock
        // or roughly one minute of modest active mining. Lifetime breaks stay intact.
        const targetHP = Math.max(firstHP, (clickDPC * 5 + helperDamagePerSecond) * 60);
        const affordableLevel = Math.max(1, Math.floor(Math.log(targetHP / firstHP) / Math.log(1.1)) + 1);
        let rockLevel = Math.min(oldLevel, affordableLevel);
        let maxHP = this.getRockHP(base, rockLevel - 1, planet);
        while (rockLevel > 1 && maxHP > targetHP) {
            rockLevel--;
            maxHP = this.getRockHP(base, rockLevel - 1, planet);
        }
        const oldMax = Number(saved.maxHP);
        const oldCurrent = Number(saved.currentHP);
        const fraction = Number.isFinite(oldMax) && oldMax > 0 && Number.isFinite(oldCurrent) && oldCurrent > 0
            ? Math.max(0, Math.min(1, oldCurrent / oldMax)) : 1;
        return {
            rocksBroken, rockLevel, maxHP, currentHP: Math.max(1, Math.ceil(maxHP * fraction)),
            reason: rockLevel < oldLevel ? 'Excessive Alpha rock difficulty reduced; lifetime breaks preserved.'
                : 'Rock durability recalculated for your Beta mining power.'
        };
    }

    applyRockDamage(amount) {
        if (this.isRockRegenerating || !Number.isFinite(amount) || amount <= 0) return;
        this.rockCurrentHP = Math.max(0, this.rockCurrentHP - amount);
        this.updateRockSprite();
        this.updateRockHealthDisplay();
        if (this.rockCurrentHP <= 0) this.regenerateRock();
        else this.checkCoinPileExpulsion();
    }

    advanceHelperRockMining(elapsedMs) {
        if (!this.isPlaying || this.isIntroPlaying || this.isTransitioning || this.isCutscenePlaying
            || this.isBetaReportOpen || this.isStoryOpen || this.isRockRegenerating) {
            this._helperRockElapsed = 0;
            return;
        }
        // Match DM2's 200ms mining ticks; do not convert background-tab time into a loot burst.
        this._helperRockElapsed = (this._helperRockElapsed || 0) + Math.max(0, Math.min(1000, elapsedMs));
        const ticks = Math.min(5, Math.floor(this._helperRockElapsed / 200));
        this._helperRockElapsed %= 200;
        for (let i = 0; i < ticks && !this.isRockRegenerating; i++) {
            this.applyRockDamage(this.getPlanetMiningDPS(this.currentLevel) / (this.timelineNumber > 1 ? 3 : 2));
            this.playHelperRockHit?.();
        }
    }

    /**
     * Gets the current rock health as a percentage (0-100)
     */
    getRockHealthPercent() {
        if (this.rockMaxHP <= 0) return 0;
        return Math.round((this.rockCurrentHP / this.rockMaxHP) * 100);
    }

    /**
     * Shows the active pickaxe sprite briefly during click animation
     */
    showActivePickaxeSprite() {
        const equipped = this.getEquippedPickaxe();
        if (!equipped) return;

        const pickaxeImg = document.getElementById('pickaxe');
        if (!pickaxeImg) return;

        // Check if this pickaxe has an active sprite (idle sprite with -use suffix)
        const idlePath = equipped.idleSprite;
        const activePath = idlePath.replace(/\.webp$/, '-use.webp');

        // Only swap if active sprite seems likely to exist
        // (we know the pattern: filename-use.webp)
        if (this._activeSpritePaths && this._activeSpritePaths.has(equipped.templateId)) {
            pickaxeImg.src = activePath;
            this._currentIdleSpritePath = idlePath;
        }
    }

    swingPickaxe() {
        // Pickaxe state is now managed by updatePickaxeState()
        // This method is kept for compatibility but doesn't do the timeout anymore
    }

    bounceDoge() {
        if (this.isIntroPlaying || this.isCutscenePlaying || this.isTransitioning) return;
        const doge = document.getElementById('main-character');
        if (!doge) return;

        const hadFloat = doge.classList.contains('float');
        if (hadFloat) {
            doge.classList.remove('float');
        }

        doge.classList.add('bounce');

        setTimeout(() => {
            doge.classList.remove('bounce');
            if (hadFloat) {
                doge.classList.add('float');
            }
        }, 200);
    }

    /**
     * Temporarily swaps Doge to the happy sprite for 1 second.
     * Used when a dogebag/crate spawns from the rock.
     */
    _showHappyDoge() {
        const doge = document.getElementById('main-character');
        if (!doge) return;

        // Determine the correct happy sprite for the current planet
        let happySprite;
        switch (this.currentLevel) {
            case 'earth':
                happySprite = 'assets/general/character/happydoge.webp';
                break;
            case 'mars':
                happySprite = 'assets/general/character/happy_party.webp';
                break;
            case 'moon':
            case 'jupiter':
            case 'titan':
            default:
                happySprite = 'assets/general/character/happy_space.webp';
                break;
        }

        // Set to happy sprite
        doge.src = happySprite;

        // Clear any existing happy-doge timeout so rapid spawns don't conflict
        if (this._happyDogeTimeout) {
            clearTimeout(this._happyDogeTimeout);
        }

        // Swap back after 1 second to the correct idle sprite for this planet
        this._happyDogeTimeout = setTimeout(() => {
            doge.src = this._getCharacterSprite();
            this._happyDogeTimeout = null;
        }, 1000);
    }

    /**
     * Returns the correct idle character sprite for the current planet.
     */
    _getCharacterSprite() {
        switch (this.currentLevel) {
            case 'earth': return 'assets/general/character/standard.webp';
            case 'moon':
            case 'jupiter':
            case 'titan': return 'assets/general/character/spacehelmet.webp';
            case 'mars': return 'assets/general/character/party.webp';
            default: return 'assets/general/character/standard.webp';
        }
    }

    // ========== ROCK HEALTH SYSTEM ==========

    /**
     * Updates the rock sprite based on current health percentage
     */
    updateRockSprite() {
        const rock = document.getElementById('main-rock');
        if (!rock) return;

        const planet = this.currentLevel;
        const healthPercent = this.getRockHealthPercent();
        let spriteSuffix = '';

        // Determine which damage sprite to use based on health percentage
        if (healthPercent > 90) {
            spriteSuffix = ''; // Original sprite
        } else if (healthPercent > 75) {
            spriteSuffix = '_dmg_small1';
        } else if (healthPercent > 50) {
            spriteSuffix = '_dmg_small2';
        } else if (healthPercent > 25) {
            spriteSuffix = '_dmg_medium1';
        } else if (healthPercent > 0) {
            spriteSuffix = '_dmg_medium2';
        } else {
            spriteSuffix = '_dmg_large1';
        }

        // Build the sprite path
        const spritePath = spriteSuffix === ''
            ? `assets/general/rocks/${planet}.webp`
            : `assets/general/rocks/${planet}${spriteSuffix}.webp`;

        // Only update and trigger smoke if sprite actually changed
        if (rock.src !== spritePath && !rock.src.endsWith(spritePath)) {
            rock.src = spritePath;
            // Don't trigger smoke on initial load or regeneration to 100%
            if (healthPercent < 100 || spriteSuffix !== '') {
                this.createRockSmokeEffect();

                // Play escalating rock damage sounds at each threshold
                if (healthPercent <= 0) {
                    this.playSound('rockhitLarge');      // 0% — rock breaks
                } else if (healthPercent <= 25) {
                    this.playSound('rockhitMedium');     // 25% threshold
                } else if (healthPercent <= 50) {
                    this.playSound('rockhitMedium');     // 50% threshold
                } else if (healthPercent <= 75) {
                    this.playSound('rockhitSmall');      // 75% threshold
                } else if (healthPercent <= 90) {
                    this.playSound('rockhitSmallest');   // 90% threshold
                }
            }
        }
    }

    /**
     * Creates a smoke effect over the rock when it changes damage state
     */
    createRockSmokeEffect() {
        if (this.lessEffects) return;
        const rockContainer = document.getElementById('rock-container');
        if (!rockContainer) return;

        // Create 3 smoke sprites with different rotations
        for (let i = 0; i < 3; i++) {
            const smoke = document.createElement('img');
            smoke.src = 'assets/general/cartoonsmoke.webp';
            smoke.className = 'rock-smoke';
            smoke.alt = '';
            smoke.draggable = false;

            // Set initial rotation offset for each smoke
            const rotationOffset = i * 120; // 0, 120, 240 degrees
            smoke.style.setProperty('--smoke-rotation-start', `${rotationOffset}deg`);

            // Slight position variation for each
            const offsetX = (i - 1) * 15; // -15, 0, 15
            smoke.style.setProperty('--smoke-offset-x', `${offsetX}px`);

            rockContainer.appendChild(smoke);

            // Remove after animation completes (0.8s animation)
            setTimeout(() => {
                if (smoke.parentNode) {
                    smoke.parentNode.removeChild(smoke);
                }
            }, 900);
        }
    }

    /**
     * Regenerates the rock after it's been destroyed
     */
    regenerateRock() {
        if (this.isRockRegenerating) return;
        const planet = this.currentLevel;
        const epoch = this._rockStateEpoch || 0;
        const brokenLevel = this.rockLevel || 1;
        this.isRockRegenerating = true;
        this.rocksBroken++;
        this.rockLevel = brokenLevel + 1;
        this.rollRockThresholdLoot(5, this.rockLevel);
        const next = {
            rocksBroken: this.rocksBroken, rockLevel: this.rockLevel,
            maxHP: this.getRockHP(this.getPlanetRockBaseHP(planet), this.rockLevel - 1, planet)
        };
        next.currentHP = next.maxHP;
        this.planetRockData[planet] = next;
        setTimeout(() => {
            // Saves may replace the record. Imports and timeline resets invalidate the callback.
            const current = this.planetRockData[planet];
            if ((this._rockStateEpoch || 0) !== epoch || current?.rockLevel !== next.rockLevel) return;
            current.maxHP = this.getRockHP(this.getPlanetRockBaseHP(planet), current.rockLevel - 1, planet);
            current.currentHP = current.maxHP;
            if (this.currentLevel !== planet) return;
            this.rockMaxHP = current.maxHP;
            this.rockCurrentHP = current.currentHP;
            this.lastDamageThresholdPercent = 100;
            this.isRockRegenerating = false;
            this.updateRockSprite();
            this.updateRockHealthDisplay();
        }, 500);
    }

    checkCoinPileExpulsion() {
        const percent = this.rockMaxHP > 0 ? this.rockCurrentHP / this.rockMaxHP * 100 : 0;
        const threshold = percent < 25 ? 25 : percent < 51 ? 51 : percent < 75 ? 75 : percent < 90 ? 90 : 100;
        if (threshold >= (this.lastDamageThresholdPercent ?? 100) || threshold === 100) return;
        this.lastDamageThresholdPercent = threshold;
        this.rollRockThresholdLoot({90: 1, 75: 2, 51: 3, 25: 4}[threshold]);
    }

    getRockType(level = this.rockLevel || 1) {
        const span = window.DogeMinerBalanceData?.maxRockLevel || 10;
        const types = window.DogeMinerBalanceData?.rockTypeCount || 36;
        const value = Math.max(1, Math.floor(level));
        return Math.floor((value - 1) / span) >= types ? value - types * span : (value % span) || span;
    }

    getTotalRockBreaks() {
        return ['earth', 'moon', 'mars', 'jupiter', 'titan'].reduce((sum, planet) => sum
            + (planet === this.currentLevel ? this.rocksBroken || 0 : this.planetRockData?.[planet]?.rocksBroken || 0), 0);
    }

    rollRockThresholdLoot(stage, level = this.rockLevel || 1) {
        const totalBroken = this.getTotalRockBreaks();
        if (stage === 5 && this.timelineNumber === 1) {
            if (totalBroken === 2) { this.createDogebag(); return; }
            if (totalBroken === 1 || totalBroken === 3 || totalBroken === 4) { this.expelBalancedCoinPile(0); return; }
            if (totalBroken === 20 && this.dogediamondsEverObtained === 0) { this.createDiamondLoot(); return; }
        }
        if (stage === 5 && this.getRockType(level) === 10) {
            this.createDogebag(); this.expelBalancedCoinPile(0);
            if (Math.random() < 0.35) this.expelBalancedCoinPile(0);
            return;
        }
        const rates = [[20,20,15,15,1],[-1,-1,5,10,4],[-1,-1,-1,0,6],[-1,-1,-1,-1,10],[-1,-1,-1,-1,1],[20,20,20,20,7]];
        const luck = 1 + Math.max(0, this.playerStats.luck || 0) / 100;
        const loot = 1 + Math.max(0, this.playerStats.lootFind || 0) / 100;
        const type = this.getRockType(level), tier = Math.floor((level - 1) / 10);
        const weights = rates.map((row, index) => {
            const rate = row[stage - 1];
            if (rate < 0) return index === 3 && stage === 4 && (luck >= 4 || loot >= 4) ? Math.round(loot) : 0;
            if (index === 3) return rate * loot + luck;
            if (index === 5) return Math.max(0, (rate - tier - 2 * type) * (2 - loot));
            return rate;
        });
        let roll = Math.random() * weights.reduce((sum, value) => sum + Math.max(0, value), 0);
        for (let index = 0; index < weights.length; index++) {
            if (weights[index] <= 0) continue;
            roll -= weights[index];
            if (roll >= 0) continue;
            if (index <= 2) this.expelBalancedCoinPile(index);
            else if (index === 3) this.createDogebag();
            else if (index === 4) this.createDiamondLoot();
            return;
        }
    }

    expelBalancedCoinPile(size) {
        const maximum = this.rockMaxHP || this.getRockHP(this.getPlanetRockBaseHP(this.currentLevel), (this.rockLevel || 1) - 1);
        const offset = {earth: 1, moon: 500, mars: 5000, jupiter: 25000, titan: 1}[this.currentLevel] || 1;
        const amount = Math.ceil([0.04, 0.09, 0.16][size] * maximum + [3, 4, 10][size] * Math.random()) + offset;
        const sprite = ['assets/general/icons/small_stack_1.webp', 'assets/general/icons/medium_stack_1.webp', 'assets/general/icons/large_stack_1.webp'][size];
        this.createCoinPile(amount, sprite, [20, 35, 80][size]);
    }

    /**
     * Expels 1-3 coin piles near the rock using power-based formula
     */
    expelCoinPiles() {
        // Determine pile count: 40% = 1, 50% = 2, 10% = 3
        const rand = Math.random();
        let pileCount;
        if (rand < 0.4) {
            pileCount = 1;
        } else if (rand < 0.9) {
            pileCount = 2;
        } else {
            pileCount = 3;
        }

        for (let i = 0; i < pileCount; i++) {
            // Pick a highly visually-skewed weighted percentage (1-75)
            const percentage = this.getWeightedCoinPercentage();
            const sprite = this.getCoinPileSprite(percentage);

            // Bind the actual Dogecoin payout directly to this visual size percentage!
            // E.g. 5% (Small) -> 0.17x variance. 75% (Large) -> 1.2x variance.
            const variance = 0.1 + (percentage / 75) * 1.1;
            const maxDrop = this.calculateCoinDrop();
            const amount = Math.max(1, Math.floor(maxDrop * variance));

            // Stagger the pile creation slightly
            setTimeout(() => {
                this.createCoinPile(amount, sprite, percentage, i, pileCount);
            }, i * 100);
        }
    }

    /**
     * Returns a weighted random percentage (1-75%), with higher values being less likely
     */
    getWeightedCoinPercentage() {
        // Use exponential distribution to favor lower percentages
        // Roll a random value and square it to skew towards lower values
        const roll = Math.random();
        const skewed = roll * roll; // Squares favor lower values
        const percentage = Math.floor(skewed * 74) + 1; // Range: 1-75
        return percentage;
    }

    /**
     * Returns appropriate sprite path based on coin percentage
     */
    getCoinPileSprite(percentage) {
        let sprites;

        if (percentage <= 10) {
            sprites = [
                'assets/general/icons/small_stack_1.webp',
                'assets/general/icons/small_stack_2.webp',
                'assets/general/icons/small_stack_3.webp'
            ];
        } else if (percentage <= 24) {
            sprites = [
                'assets/general/icons/medium_stack_1.webp',
                'assets/general/icons/medium_stack_2.webp'
            ];
        } else if (percentage <= 45) {
            sprites = [
                'assets/general/icons/medium_stack_3.webp',
                'assets/general/icons/medium_stack_4.webp'
            ];
        } else {
            sprites = [
                'assets/general/icons/large_stack_1.webp',
                'assets/general/icons/large_stack_2.webp'
            ];
        }

        return sprites[Math.floor(Math.random() * sprites.length)];
    }

    /**
     * Creates a clickable coin pile element near the rock
     * index & total arguments help segment horizontal space so multiple piles don't stack
     */
    createCoinPile(amount, spritePath, percentage = 50, index = 0, total = 1) {
        const rockContainer = document.getElementById('rock-container');
        if (!rockContainer) return;

        const pile = document.createElement('div');
        pile.className = 'coin-pile';

        // Add size class based on percentage
        // Small: 1-24% (small_stack and medium_stack_1/2)
        // Medium: 25-45% (medium_stack_3/4)
        // Large: 46-75% (large_stack) - default size
        if (percentage <= 24) {
            pile.classList.add('pile-small');
        } else if (percentage <= 45) {
            pile.classList.add('pile-medium');
        }

        const img = document.createElement('img');
        img.src = spritePath;
        img.alt = 'Coin Pile';
        img.draggable = false;
        pile.appendChild(img);

        // Store the amount on the element
        pile.dataset.amount = amount;

        // Add click handler to collect
        pile.addEventListener('click', (e) => {
            e.stopPropagation();
            this.collectCoinPile(pile, amount);
        });

        // Add to DOM
        rockContainer.appendChild(pile);
        if (window.innerWidth > 768) pile._lootHover = window.LootMotion?.hover(pile, img);

        this.spawnFieldCoin(pile);

        this.scheduleCoinExpiry?.(pile);
        return pile;
    }

    /**
     * Collects a coin pile and adds coins to the player
     */
    collectCoinPile(pile, amount) {
        if (!pile.parentNode || pile.dataset.collected) return; // Prevent double collection

        // Mark as collected to prevent any further interaction
        pile.dataset.collected = "true";
        pile.style.pointerEvents = 'none';
        pile._lootHover?.detach();

        // Add coins
        this.dogecoins += amount;
        this.totalMined += amount;

        // Play sound based on pile size
        if (pile.classList.contains('pile-small')) {
            this.playSound('coinsSmall');
        } else {
            this.playSound('getCoins');
        }

        // Show curved floating coin + text animation into total Dogecoin balance
        const rect = pile.getBoundingClientRect();
        this.createFloatingCoin(amount, {
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2
        }, false);

        // Remove pile with animation
        pile.style.animation = 'coinPileCollect 0.3s ease-out forwards';
        setTimeout(() => {
            if (pile.parentNode) pile.parentNode.removeChild(pile);
        }, 300);

        // Update UI
        this.updateUI();
    }

    /**
     * Collects the nearest coin pile (used by controller X button)
     */
    collectNearestCoinPile() {
        const rockContainer = document.getElementById('rock-container');
        if (!rockContainer) return;

        const piles = rockContainer.querySelectorAll('.coin-pile');
        if (piles.length === 0) return;

        // Find the pile closest to the centre of the rock
        const rock = document.getElementById('main-rock');
        if (!rock) return;
        const rockRect = rock.getBoundingClientRect();
        const cx = rockRect.left + rockRect.width / 2;
        const cy = rockRect.top + rockRect.height / 2;

        let closest = null;
        let closestDist = Infinity;

        piles.forEach(pile => {
            const r = pile.getBoundingClientRect();
            const px = r.left + r.width / 2;
            const py = r.top + r.height / 2;
            const dist = Math.hypot(px - cx, py - cy);
            if (dist < closestDist) {
                closestDist = dist;
                closest = pile;
            }
        });

        if (closest) {
            const amount = parseInt(closest.dataset.amount, 10) || 0;
            this.collectCoinPile(closest, amount);
        }
    }

    /**
     * Updates the rock health percentage display
     */
    updateRockHealthDisplay() {
        const healthText = document.getElementById('rock-health-text');
        if (healthText) {
            healthText.textContent = Math.max(0, this.getRockHealthPercent()) + '%';
        }
    }

    // ========== END ROCK HEALTH SYSTEM ==========

    // ========== LOOT & DOGEBAG SYSTEM ==========

    /**
     * Calculates coin drop amount using power-based formula.
     * baseDPC * 50, modified by lootFind and luck.
     */
    calculateCoinDrop() {
        const equipped = this.getEquippedPickaxe();
        const baseDPC = equipped ? equipped.baseDPC : 1;
        const baseDrop = baseDPC * 15;
        // Moderate luck impact: log2 curve preserves excitement without breaking math
        const luckMult = Math.max(0, Math.log2(1 + (this.playerStats.luck / 10)));
        const multiplier = 1 + (this.playerStats.lootFind / 100) + luckMult;
        return Math.max(1, Math.floor(baseDrop * multiplier));
    }

    // ===================== DOGEDIAMONDS =====================

    /**
     * Rolls whether a Dogediamond should drop when a rock is destroyed.
     * 3% lucky drop, plus a guaranteed drop within the first 10 rocks for players
     * who have never obtained one (mirrors the Dogebag first-drop guarantee).
     */
    rollDiamondDrop() {
        // Guarantee the player's very first Dogediamond within their first 10 rock breaks
        if (this.dogediamondsEverObtained === 0 && this.rocksBroken >= 10) {
            return true;
        }
        return Math.random() < 0.03; // 3% lucky drop
    }

    /**
     * Creates a single clickable Dogediamond that disperses from the rock.
     * Mirrors the coin-pile drop/despawn behavior.
     */
    createDiamondLoot() {
        const rockContainer = document.getElementById('rock-container');
        if (!rockContainer) return;

        const diamond = document.createElement('div');
        diamond.className = 'diamond-loot';

        const img = document.createElement('img');
        img.src = 'assets/general/icons/diamond_loot.webp';
        img.alt = 'Dogediamond';
        img.draggable = false;
        diamond.appendChild(img);

        // Disperse to a random spot below the rock, avoiding the central HP text
        let finalOffsetX = (Math.random() - 0.5) * 220;
        let finalOffsetY = 80 + Math.random() * 80;
        if (Math.abs(finalOffsetX) < 70 && finalOffsetY < 150) {
            finalOffsetY = 150 + Math.random() * 40;
        }
        diamond.style.setProperty('--pile-end-x', `${finalOffsetX}px`);
        diamond.style.setProperty('--pile-end-y', `${finalOffsetY}px`);
        diamond.style.left = '50%';
        diamond.style.top = '50%';

        diamond.addEventListener('click', (e) => {
            e.stopPropagation();
            this.collectDiamond(diamond);
        });

        rockContainer.appendChild(diamond);
        diamond.style.animation = 'coinPileDisperse 0.4s ease-out forwards';

        // Linger longer than coins (these are rare) before warning + despawn
        setTimeout(() => {
            if (diamond.parentNode) {
                diamond.style.animation = 'coinPileWarning 5s linear forwards';
                setTimeout(() => {
                    if (diamond.parentNode) {
                        diamond.style.animation = 'coinPileFade 0.5s ease-out forwards';
                        setTimeout(() => { if (diamond.parentNode) diamond.parentNode.removeChild(diamond); }, 500);
                    }
                }, 5000);
            }
        }, 12000);
    }

    /**
     * Collects a dropped Dogediamond into the player's balance.
     * On the very first one ever obtained, shows the explainer popup.
     */
    collectDiamond(el) {
        if (!el.parentNode || el.dataset.collected) return; // prevent double-collect
        el.dataset.collected = 'true';
        el.style.pointerEvents = 'none';

        const isFirstEver = this.dogediamondsEverObtained === 0;
        this.dogediamonds += 1;
        this.dogediamondsEverObtained += 1;
        // Persist the actual claim immediately, even while its HUD animation is in flight.
        if (window.saveManager) window.saveManager.saveGame(false);

        this.playSound('longSparkle');

        // Show curved floating diamond animation into Dogediamond counter
        const rect = el.getBoundingClientRect();
        this.createFloatingDiamond(1, {
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2
        });
        this.updateUI();

        el.style.animation = 'coinPileCollect 0.3s ease-out forwards';
        setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 300);

        if (isFirstEver) {
            this.showDiamondIntro();
        }
    }

    /**
     * Updates the Dogediamond counter (top-right of the left panel).
     * Hidden until the player has obtained their first diamond.
     */
    updateDiamondCounter() {
        const counter = document.getElementById('diamond-counter');
        if (!counter) return;
        const unlocked = this.dogediamondsEverObtained > 0;
        counter.style.display = unlocked ? 'flex' : 'none';
        const amountEl = document.getElementById('diamond-amount');
        const visibleBalance = Math.max(0, this.dogediamonds - (this.pendingDiamondDisplayAmount || 0));
        if (amountEl) amountEl.textContent = this.formatCounterAmount(visibleBalance);
    }

    /** Opens the first-find Dogediamonds explainer popup. */
    showDiamondIntro() {
        const modal = document.getElementById('diamond-intro-modal');
        if (!modal) return;
        this.playSound('inventoryOpen');
        modal.classList.add('active');
    }

    closeDiamondIntro() {
        const modal = document.getElementById('diamond-intro-modal');
        if (modal) modal.classList.remove('active');
    }

    /** Unlocks the 3rd Searchdoge upgrade slot for 1 Dogediamond. */
    unlockSearchdogeSlot3() {
        if (this.searchdogeSlot3Unlocked) return;
        if (this.dogediamonds < 1) {
            this.showNotification('Not enough Dogediamonds!');
            return;
        }
        this.dogediamonds -= 1;
        this.flashDiamondAmount('red');
        this.searchdogeSlot3Unlocked = true;
        this.playSound('longSparkle');
        this.showNotification('3rd Searchdoge slot unlocked!');
        this.updateDiamondCounter();
        this.updateUI();
        if (window.uiManager) {
            if (typeof window.uiManager.updateUpgradeContent === 'function') window.uiManager.updateUpgradeContent();
            if (typeof window.uiManager.updateMobileUpgradesContent === 'function') window.uiManager.updateMobileUpgradesContent();
        }
    }

    // =================== END DOGEDIAMONDS ===================

    /**
     * Rolls whether a dogebag should drop at the current threshold.
     * Base 10% chance, scaled by luck.
     */
    rollDogebagDrop() {
        // Guarantee the player's first dogebag drops within their very first 4 rock breaks
        // Failsafe triggers if they have no items by the time they hit rock #4 (rocksBroken >= 3)
        if (this.currentLevel === 'earth' && this.rocksBroken >= 3 && this.pickaxeInventory.length <= 1 && this.fortuneInventory.length === 0) {
            return true;
        }

        const baseChance = 0.05; // 5% base
        // Scale logarithmically to prevent infinite 100% drops
        const luckMultiplier = 1 + Math.log2(1 + this.playerStats.luck / 50);
        // Hard-cap the absolute maximum drop rate to 30%
        const chance = Math.min(0.30, baseChance * luckMultiplier);
        return Math.random() < chance;
    }

    /**
     * Determines what's inside a dogebag: pickaxe, fortune, or coins.
     * Then creates the dogebag element on the ground.
     */
    generateDogebagContents(options = {}) {
        const balance = window.DogeMinerBalance;
        const context = balance.getRollContext(this);
        const pool = balance.getNaturalLootPool(this, {planet: options.planet || this.currentLevel,
            ...(options.dropType === undefined ? {} : {dropType: options.dropType})});
        if (this.currentLevel === 'moon' && !this.mysteryBoxObtained) {
            const template = Object.values(this.fortuneFactory?.templates || {}).find(item => item.name === 'Mystery Box');
            if (template) {
                this.prizesSinceLastPickaxe++;
                return {type: 'fortune', item: this.fortuneFactory.generateFromTemplate(template.id, {...context, dropType: 3})};
            }
        }
        const cooldown = this.timelineNumber > 2 ? 12000 : this.timelineNumber === 2 ? 25000 : 45000;
        const pickAllowed = !this.lastPickaxeDropTime || Date.now() - this.lastPickaxeDropTime > cooldown;
        const loot = Math.max(1, (1 + (this.playerStats.lootFind || 0) / 100) / 3);
        const luck = Math.max(1, (1 + (this.playerStats.luck || 0) / 100) / 6);
        const candidates = pool.candidates.filter(entry => entry.kind !== 'pickaxe' || pickAllowed).map(entry => ({
            ...entry, weight: entry.weight * loot + luck * (entry.kind === 'pickaxe' && this.prizesSinceLastPickaxe > 3 && entry.quality < 4 ? 3 : 1)
        }));
        const entryCount = pool.candidates.length + (pool.weights.coins >= 0 ? 1 : 0) + (pool.weights.diamonds >= 0 ? 1 : 0);
        if (pool.weights.coins >= 0) candidates.push({kind: 'coins', weight: pool.weights.coins + Math.round(3 * entryCount) + 2});
        if (pool.weights.diamonds >= 0) candidates.push({kind: 'diamonds', weight: pool.weights.diamonds});
        let roll = Math.random() * candidates.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);
        let prize;
        for (const entry of candidates) {
            if (entry.weight <= 0) continue;
            roll -= entry.weight;
            if (roll < 0) { prize = entry; break; }
        }
        const rollContext = {...context, dropType: pool.dropType};
        if (prize?.kind === 'pickaxe') {
            const item = this.pickaxeFactory.generatePickaxe(prize.templateId, this.maxPickaxeDPC, this.playerStats.wow, rollContext);
            if (item) {
                this.lastPickaxeDropTime = Date.now();
                this.prizesSinceLastPickaxe = 0;
                return {type: 'pickaxe', item};
            }
        } else if (prize?.kind === 'fortune') {
            const item = this.fortuneFactory.generateFromTemplate(prize.templateId, rollContext);
            if (item) { this.prizesSinceLastPickaxe++; return {type: 'fortune', item}; }
        } else if (prize?.kind === 'diamonds') {
            this.prizesSinceLastPickaxe++;
            return {type: 'diamonds', amount: 1 + Math.round((balance.planetIndex(pool.planet || this.currentLevel) + 1) / 2.5)};
        }
        this.prizesSinceLastPickaxe++;
        return {type: 'coins', amount: Math.max(1, Math.round(this.rockMaxHP * (0.5 + Math.random())))};
    }

    /**
 * Creates a dogebag element in the world near the rock.
 */
    createDogebag() {
        const rockContainer = document.getElementById('rock-container');
        if (!rockContainer) return;

        // Freeze the bag's planet and quality, then roll against current ownership
        // when opened. Unopened bags cannot reserve duplicate natural items.
        const pool = window.DogeMinerBalance?.getNaturalLootPool(this, {planet: this.currentLevel});

        // Planet-specific bag info
        const bagInfo = this.getDogebagInfo();

        const bag = document.createElement('div');
        bag.className = 'dogebag-drop';

        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'dogebag-img-wrapper';

        const img = document.createElement('img');
        img.src = bagInfo.sprite;
        img.alt = bagInfo.name;
        img.draggable = false;

        imgWrapper.appendChild(img);
        bag.appendChild(imgWrapper);

        // Position similar to coin piles but dispersed further (approx 35% further spread)
        let finalOffsetX = (Math.random() - 0.5) * 320; // Was 240
        let finalOffsetY = 90 + Math.random() * 110;    // Was 80 + rand(80)

        // Prevent spawning in the direct center where the health percentage text is
        // Instead of splitting them left and right (which creates an awkward gap), 
        // we'll push them downwards if they land in the central column where the text is.
        if (Math.abs(finalOffsetX) < 70 && finalOffsetY < 150) {
            finalOffsetY = 150 + Math.random() * 40; // Push them down safely below the text
        }

        bag.style.setProperty('--pile-end-x', `${finalOffsetX}px`);
        bag.style.setProperty('--pile-end-y', `${finalOffsetY}px`);
        bag.style.left = '50%';
        bag.style.top = '50%';

        bag._dogebagRollOptions = {planet: this.currentLevel, dropType: pool?.dropType || 0};
        bag._dogebagInfo = bagInfo;

        // Click handler
        bag.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openDogebagModal(bag);
        });

        rockContainer.appendChild(bag);
        this.playSound('woof');

        // Show happy Doge sprite for 1 second
        this._showHappyDoge();


    }

    /**
     * Returns the sprite path and display name for the current planet's dogebag variant.
     */
    getDogebagInfo() {
        switch (this.currentLevel) {
            case 'moon':
                return { sprite: 'assets/general/icons/mooncrate.webp', name: 'Moon Crate' };
            case 'mars':
                return { sprite: 'assets/general/icons/marschest.webp', name: 'Mars Chest' };
            case 'jupiter':
                return { sprite: 'assets/general/icons/cloudcache.webp', name: 'Cloud Cache' };
            case 'titan':
                return { sprite: 'assets/general/icons/titanbox.webp', name: 'Titan Depot' };
            default:
                return { sprite: 'assets/general/icons/dogebag.webp', name: 'Dogebag' };
        }
    }

    /**
     * Opens the dogebag modal (State 1: prompt)
     */
    // ==========================================
    // MYSTERY BOX SYSTEM
    // ==========================================

    /**
     * Initializes the Mystery Box button and timer if obtained.
     * Called on save load or when first obtained from Moon Dogebag.
     */
    initMysteryBox() {
        if (!this.mysteryBoxObtained) return;

        const btn = document.getElementById('mystery-box-btn');
        if (btn) btn.style.display = ''; // Reveal button

        // Compute elapsed offline time if applicable
        if (this.mysteryBoxLastSaveTime && this.mysteryBoxTimerRemaining > 0) {
            const elapsed = Date.now() - this.mysteryBoxLastSaveTime;
            this.mysteryBoxTimerRemaining = Math.max(0, this.mysteryBoxTimerRemaining - elapsed);
        }

        this.startMysteryBoxTimer();
    }

    /**
     * Starts the 1-second countdown interval.
     */
    startMysteryBoxTimer() {
        // Clear existing just in case
        if (this._mysteryBoxInterval) clearInterval(this._mysteryBoxInterval);

        const tick = () => {
            if (this.mysteryBoxTimerRemaining <= 0) {
                this.mysteryBoxTimerRemaining = 0;
                clearInterval(this._mysteryBoxInterval);
                this._mysteryBoxInterval = null;

                // Add glowing ready state 
                const btn = document.getElementById('mystery-box-btn');
                if (btn && !btn.classList.contains('mystery-box-ready')) {
                    btn.classList.add('mystery-box-ready');
                    const btnIcon = document.getElementById('mystery-box-btn-icon');
                    if (btnIcon) {
                        btnIcon.style.animationDelay = `-${(Date.now() % 1800) / 1000}s`;
                    }
                }

                const sidebarTimer = document.getElementById('mbox-sidebar-timer');
                if (sidebarTimer) sidebarTimer.textContent = 'OPEN!';

                // If modal is currently open, update it
                const statusEl = document.getElementById('mbox-status-text');
                if (statusEl && statusEl.textContent.includes('doesn\'t want to open')) {
                    this.openMysteryBoxModal(); // Re-render as Ready
                }
            } else {
                this.mysteryBoxTimerRemaining -= 1000;

                // Update open modal timer if visible
                const timerEl = document.getElementById('mbox-timer-text');
                if (timerEl) {
                    timerEl.textContent = `Opens in: ${this._formatMs(this.mysteryBoxTimerRemaining)}`;
                }

                // Update sidebar button timer
                const sidebarTimer = document.getElementById('mbox-sidebar-timer');
                if (sidebarTimer) {
                    sidebarTimer.textContent = this._formatMs(this.mysteryBoxTimerRemaining);
                }
            }
        };

        // If already ready, just tick once to apply glow. Otherwise start interval
        if (this.mysteryBoxTimerRemaining <= 0) {
            tick();
        } else {
            // Remove glow if it somehow had it
            const btn = document.getElementById('mystery-box-btn');
            if (btn) btn.classList.remove('mystery-box-ready');
            this._mysteryBoxInterval = setInterval(tick, 1000);
        }
    }

    /**
     * Formats milliseconds into MM:SS
     */
    _formatMs(ms) {
        const totalSeconds = Math.ceil(ms / 1000);
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    /** Rolls Mystery Box pools using DM2's alternating reward-kind rules. */
    _rollMysteryBoxReward(options = {}) {
        const balance = window.DogeMinerBalance;
        if (!balance) return null;
        const prize = balance.rollMysteryPrize(this, options);
        if (!prize.candidate) return null;
        const context = { ...balance.getRollContext(this), dropType: prize.dropType };
        const item = prize.kind === 'pickaxe'
            ? this.pickaxeFactory.generatePickaxe(prize.candidate.templateId, this.maxPickaxeDPC, this.playerStats.wow, context)
            : this.fortuneFactory.generateFromTemplate(prize.candidate.templateId, context);
        if (!item) return null;
        this.mysteryBoxLastKind = prize.nextPreviousKind;
        return { type: prize.kind, item };
    }

    openDogebagModal(bagElement) {
        this._currentDogebag = bagElement;
        this.playSound('grabBag');

        const modal = document.getElementById('dogebag-modal');
        const prompt = document.getElementById('dogebag-state-prompt');
        const reveal = document.getElementById('dogebag-state-reveal');

        if (!modal || !prompt || !reveal) return;

        // Update modal to show the correct planet-specific bag
        const bagInfo = bagElement._dogebagInfo || { sprite: 'assets/general/icons/dogebag.webp', name: 'Dogebag' };
        const modalIcon = prompt.querySelector('.dogebag-modal-icon');
        const modalTitle = prompt.querySelector('.modal-title');
        const modalSubtitle = prompt.querySelector('.modal-subtitle');
        if (modalIcon) modalIcon.src = bagInfo.sprite;
        if (modalTitle) modalTitle.textContent = `A ${bagInfo.name.toUpperCase()}!`;
        if (modalSubtitle) modalSubtitle.textContent = `A ${bagInfo.name} is a magical container that may contain special items!`;

        // Update reveal title too
        const revealTitle = reveal.querySelector('.modal-title');
        if (revealTitle) revealTitle.textContent = `${bagInfo.name.toUpperCase()} CONTAINED:`;

        // Remove the bag from world
        if (bagElement && bagElement.parentNode) {
            bagElement.parentNode.removeChild(bagElement);
        }

        // Show the modal
        modal.classList.add('active');

        // Trigger drop-in animation — reset the class and styles so it replays every open
        const modalContent = modal.querySelector('.dogebag-modal-content');
        if (modalContent) {
            modalContent.classList.remove('dogebag-dropping');
            modalContent.style.transition = '';
            modalContent.style.opacity = '';
            modalContent.style.transform = '';
            void modalContent.offsetWidth; // Force reflow so CSS sees the resets
            modalContent.classList.add('dogebag-dropping');
        }

        // Play the collect sound alongside the drop-in
        this.playSound('collectItem');

        if (this.hasSeenDogebagIntro) {
            // Veteran player: skip the "A Dogebag!" prompt and go straight to the reveal
            prompt.style.display = 'none';
            reveal.style.display = 'none'; // openDogebagContents will unhide it
            this.openDogebagContents();
        } else {
            // First time ever — show the intro prompt, then mark as seen
            prompt.style.display = '';
            reveal.style.display = 'none';
            this.hasSeenDogebagIntro = true;
            // Persist the flag immediately
            if (window.saveManager) {
                window.saveManager.saveGame(false);
            }
        }
    }

    /**
     * Opens the dogebag contents (State 2: reveal)
     * Called when user clicks OPEN button
     */
    openDogebagContents() {
        const prompt = document.getElementById('dogebag-state-prompt');
        const reveal = document.getElementById('dogebag-state-reveal');
        if (!prompt || !reveal) return;

        prompt.style.display = 'none';
        reveal.style.display = '';

        const bag = this._currentDogebag;
        if (bag && !bag._dogebagContents) bag._dogebagContents = this.generateDogebagContents(bag._dogebagRollOptions);
        const contents = bag?._dogebagContents;
        if (!contents) {
            this.closeDogebagModal();
            return;
        }


        if (contents.type === 'pickaxe') {
            this._renderDogebagPickaxe(contents.item);
        } else if (contents.type === 'fortune') {
            this._renderDogebagFortune(contents.item);
        } else if (contents.type === 'diamonds') {
            this._renderDogebagCoins(contents.amount);
            const icon = document.getElementById('dogebag-item-icon');
            const name = document.getElementById('dogebag-item-name');
            const description = document.getElementById('dogebag-item-description');
            if (icon) icon.src = 'assets/general/diamond.webp';
            if (name) name.textContent = `${this.formatNumber(contents.amount)} Dogediamonds`;
            if (description) description.textContent = 'Rare Dogediamonds for your next adventure!';
            this._dogebagPendingItem = {type: 'diamonds', amount: contents.amount};
        } else {
            this._renderDogebagCoins(contents.amount);
        }
    }

    /**
     * Renders pickaxe reveal in dogebag modal
     */
    _renderDogebagPickaxe(pickaxe) {
        const icon = document.getElementById('dogebag-item-icon');
        const name = document.getElementById('dogebag-item-name');
        const rarity = document.getElementById('dogebag-item-rarity');
        const desc = document.getElementById('dogebag-item-description');
        const dpcContainer = document.getElementById('dogebag-item-dpc');
        const dpcValue = document.getElementById('dogebag-dpc-value');
        const statsContainer = document.getElementById('dogebag-item-stats');
        const actions = document.getElementById('dogebag-actions');

        if (icon) icon.src = pickaxe.idleSprite;
        if (name) name.textContent = pickaxe.name;
        if (rarity) {
            rarity.textContent = pickaxe.rarity.toUpperCase();
            rarity.className = `dogebag-item-rarity rarity-${pickaxe.rarity}`;
        }
        if (desc) desc.textContent = pickaxe.description;
        if (dpcContainer) dpcContainer.style.display = '';
        if (dpcValue) dpcValue.textContent = this.formatNumber(pickaxe.baseDPC);

        // Stats
        if (statsContainer && this.pickaxeFactory) {
            statsContainer.innerHTML = '';
            pickaxe.stats.forEach(stat => {
                const line = document.createElement('div');
                line.className = `item-card-stat-line ${stat.isCore ? 'stat-core' : 'stat-cosmetic'}`;
                line.textContent = this.pickaxeFactory.formatStatForDisplay(stat);
                statsContainer.appendChild(line);
            });
        }

        // Actions: EQUIP + LOOT
        if (actions) {
            actions.innerHTML = `
                <button class="dogebag-action-btn equip-btn" onclick="dogebagEquip()">EQUIP</button>
                <button class="dogebag-action-btn loot-btn" onclick="dogebagLoot()">LOOT</button>
            `;
        }

        // Store for action handlers
        this._dogebagPendingItem = { type: 'pickaxe', item: pickaxe };
    }

    /**
     * Renders fortune reveal in dogebag modal
     */
    _renderDogebagFortune(fortune) {
        // Similar to pickaxe but without DPC and only LOOT button
        const icon = document.getElementById('dogebag-item-icon');
        const name = document.getElementById('dogebag-item-name');
        const rarity = document.getElementById('dogebag-item-rarity');
        const desc = document.getElementById('dogebag-item-description');
        const dpcContainer = document.getElementById('dogebag-item-dpc');
        const statsContainer = document.getElementById('dogebag-item-stats');
        const actions = document.getElementById('dogebag-actions');

        if (icon) icon.src = fortune.sprite || 'assets/general/dogecoin_70x70.webp';
        if (name) name.textContent = fortune.name;
        if (rarity) {
            rarity.textContent = fortune.rarity.toUpperCase();
            rarity.className = `dogebag-item-rarity rarity-${fortune.rarity}`;
        }
        if (desc) desc.textContent = fortune.description;
        if (dpcContainer) dpcContainer.style.display = 'none';

        // Render fortune stats with proper formatting
        if (statsContainer && fortune.stats && this.fortuneFactory) {
            statsContainer.innerHTML = '';
            fortune.stats.forEach(stat => {
                const line = document.createElement('div');
                line.className = `dogebag-stat-line ${this._inventoryStatClass(stat)}`;
                line.style.color = window.DogeMinerBalance.getAttributeMetadata(stat).color;
                line.textContent = this.fortuneFactory.formatStatForDisplay(stat);
                statsContainer.appendChild(line);
            });
        }

        if (actions) {
            actions.innerHTML = `
                <button class="dogebag-action-btn loot-btn" onclick="dogebagLoot()">LOOT</button>
            `;
        }

        this._dogebagPendingItem = { type: 'fortune', item: fortune };
    }

    /**
     * Renders coin reveal in dogebag modal
     */
    _renderDogebagCoins(amount) {
        const icon = document.getElementById('dogebag-item-icon');
        const name = document.getElementById('dogebag-item-name');
        const rarity = document.getElementById('dogebag-item-rarity');
        const desc = document.getElementById('dogebag-item-description');
        const dpcContainer = document.getElementById('dogebag-item-dpc');
        const statsContainer = document.getElementById('dogebag-item-stats');
        const actions = document.getElementById('dogebag-actions');

        if (icon) icon.src = 'assets/general/dogecoin_70x70.webp';
        if (name) {
            name.textContent = this.formatNumber(amount) + ' Dogecoins';
            name.className = 'dogebag-item-name dogebag-coin-reveal';
        }
        if (rarity) {
            rarity.textContent = '';
            rarity.className = 'dogebag-item-rarity';
        }
        if (desc) desc.textContent = 'A generous stash of dogecoins!';
        if (dpcContainer) dpcContainer.style.display = 'none';
        if (statsContainer) statsContainer.innerHTML = '';

        if (actions) {
            actions.innerHTML = `
                <button class="dogebag-action-btn loot-btn" onclick="dogebagLoot()">LOOT</button>
            `;
        }

        this._dogebagPendingItem = { type: 'coins', amount };
    }

    /**
     * Handles EQUIP action from dogebag modal (pickaxes only)
     */
    dogebagEquip() {
        const pending = this._dogebagPendingItem;
        if (!pending || pending.type !== 'pickaxe') return;

        this.addPickaxeToInventory(pending.item);
        this.equipPickaxe(pending.item.instanceId);
        this.playSound('receivePickaxe');
        if (window.saveManager) window.saveManager.saveGame(false);
        this.closeDogebagModal();
    }

    /**
     * Handles LOOT action from dogebag modal
     */
    dogebagLoot() {
        const pending = this._dogebagPendingItem;
        if (!pending) return;

        if (pending.type === 'pickaxe') {
            this.addPickaxeToInventory(pending.item);
            this.showNotification(`${pending.item.name} added to inventory!`);
            this.playSound('receivePickaxe');
        } else if (pending.type === 'fortune') {
            this.addFortuneToInventory(pending.item);
            if (pending.item.name === 'Mystery Box') {
                this.noteMysteryBoxFound?.();
                this.mysteryBoxObtained = true;
                this.initMysteryBox();
            }
            this.setLatestObtainedFortune(pending.item);
            this.recalculatePlayerStats();
            this.showNotification(`${pending.item.name} fortune acquired!`);
            this.playSound('longSparkle');
        } else if (pending.type === 'coins') {
            this.dogecoins += pending.amount;
            this.totalMined += pending.amount;
            this.flashDogecoinAmount('green');
            this.showNotification(`+${this.formatNumber(pending.amount)} Dogecoins!`);
            this.updateUI();
            this.playSound('receiveStash');
        } else if (pending.type === 'diamonds') {
            const first = this.dogediamondsEverObtained === 0;
            this.dogediamonds += pending.amount;
            this.dogediamondsEverObtained += pending.amount;
            const rect = document.getElementById('dogebag-item-icon')?.getBoundingClientRect();
            this.createFloatingDiamond(pending.amount, rect ? {clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2} : null);
            this.updateUI();
            this.playSound('longSparkle');
            if (first) setTimeout(() => this.showDiamondIntro(), 300);
        }

        window.saveManager?.saveGame(false);
        this.closeDogebagModal();
    }

    /**
     * Closes the dogebag modal with a fade-out on the content
     */
    closeDogebagModal() {
        const modal = document.getElementById('dogebag-modal');
        if (!modal) {
            this._currentDogebag = null;
            this._dogebagPendingItem = null;
            return;
        }

        const modalContent = modal.querySelector('.dogebag-modal-content');
        if (modalContent) {
            // Strip the drop-in animation (its fill-mode:both pins opacity:1)
            modalContent.classList.remove('dogebag-dropping');
            // Force the browser to flush the animation removal
            void modalContent.offsetWidth;
            // Fade the content out and slide up via inline transition
            modalContent.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            modalContent.style.opacity = '0';
            modalContent.style.transform = 'translateY(-60px)';
        }

        // After the content fades, dismiss the backdrop
        // (We leave the inline opacity at 0 so it doesn't pop back in before the backdrop finishes fading.
        // It gets cleaned up on the next open.)
        setTimeout(() => {
            modal.classList.remove('active');
        }, 250);

        this._currentDogebag = null;
        this._dogebagPendingItem = null;
    }

    // ========== END LOOT & DOGEBAG SYSTEM ==========

    // ========== PICKAXE & FORTUNE SYSTEM ==========

    /**
     * Gets the currently equipped pickaxe instance
     */
    getEquippedPickaxe() {
        return this.pickaxeInventory.find(p => p.instanceId === this.equippedPickaxeId) || this.defaultPickaxe;
    }

    /**
     * Opens the pickaxe selection modal
     */
    openPickaxeModal() {
        this.releaseMiningInput();
        const modal = document.getElementById('pickaxe-modal');
        if (modal) {
            this.markInventoryRead('pickaxe');
            const subtitle = modal.querySelector('.modal-subtitle');
            if (subtitle) subtitle.textContent = this._inventoryTouchMode() ? 'TAP TO EQUIP' : 'CLICK TO EQUIP';
            modal.classList.add('active');
            this._bindInventoryToolbar('pickaxe');
            this.updateStatsSidebar('pickaxe');
            this.renderPickaxeGrid();
            this.playSound('inventoryOpen');
        }
    }

    /**
     * Closes the pickaxe selection modal
     */
    closePickaxeModal() {
        this._hideInventoryTooltip();
        const modal = document.getElementById('pickaxe-modal');
        if (modal) {
            modal.classList.remove('active');
            this.playSound('inventoryClose');
        }
    }

    /**
     * Opens the fortune selection modal
     */
    openFortuneModal() {
        this.releaseMiningInput();
        const modal = document.getElementById('fortune-modal');
        if (modal) {
            this.markInventoryRead('fortune');
            modal.classList.add('active');
            this._bindInventoryToolbar('fortune');
            this.updateStatsSidebar('fortune');
            this.renderFortuneGrid();
            this.playSound('inventoryOpen');
        }
    }

    /**
     * Closes the fortune selection modal
     */
    closeFortuneModal() {
        this._hideInventoryTooltip();
        const modal = document.getElementById('fortune-modal');
        if (modal) {
            modal.classList.remove('active');
            this.playSound('inventoryClose');
        }
    }

    /**
     * Refreshes the custom user stats sidebar inside grids dynamically
     */
    getOtherItemStatTotals() {
        const covered = new Set(['click', 'luck', 'loot', 'wow', 'crit', 'income', 'dps', 'persec', 'dpsp',
            'mystery', 'rockets', 'dpcmultiplier', 'flathelperdps', 'helperdpsmult']);
        const totals = new Map();
        const add = (item, kind) => {
            for (const stat of item?.stats || []) {
                const key = window.DogeMinerBalance.statKey(stat, kind);
                if (covered.has(key) || !Number.isFinite(Number(stat.value))) continue;
                const percent = String(stat.indicator || '').includes('%');
                const id = `${key}:${percent}`;
                if (!totals.has(id)) totals.set(id, { key, label: stat.displayName || stat.name || key, value: 0, percent });
                // Consolidated fortunes already store the sum, not a per-copy roll.
                totals.get(id).value += String(stat.indicator || '').startsWith('-') ? -Math.abs(Number(stat.value)) : Number(stat.value);
            }
        };
        add(this.getEquippedPickaxe(), 'pickaxe');
        for (const fortune of this.fortuneInventory || []) add(fortune, 'fortune');
        return [...totals.values()];
    }

    updateStatsSidebar(inventoryType) {
        const contentContainer = document.getElementById(`${inventoryType}-stats-content`);
        if (!contentContainer) return;

        const formatPercent = (val) => `${(val * 100).toFixed(1)}%`;
        const formatMult = (val) => `x${val.toFixed(2)}`;
        const statList = [
            { label: 'Luck', value: `+${(this.playerStats.luck || 0).toFixed(1)}%` },
            { label: 'Loot Find', value: `+${(this.playerStats.lootFind || 0).toFixed(1)}%` },
            { label: 'Wow', value: `+${(this.playerStats.wow || 0).toFixed(1)}%` },
            { label: 'Critical Chance', value: formatPercent(this.playerStats.critChance || 0) },
            { label: 'Base DPC Mult.', value: formatMult(this.playerStats.dpcMultiplier || 1) },
            { label: 'Helper DPS Mult.', value: formatMult(this.playerStats.helperDpsMultiplier || 1) },
            { label: 'Total DPS Mult.', value: formatMult(this.playerStats.totalDpsMultiplier || 1) },
            { label: 'Flat DPS Bonus', value: `+${Math.floor(this.playerStats.flatHelperDps || 0)}` },
            { label: 'Mystery Bonus', value: `+${this.formatNumber(this.playerStats.mysteryBonus || 0)}` },
            { label: 'Space Rocket Costs', value: `-${Math.abs((this.playerStats.rocketCostReduction || 0) * 100).toFixed(1)}%` }
        ];

        if (this.getStoryDPS?.() > 0) statList.push({ label: 'Royalty DPS', value: `+${this.formatNumber(this.getStoryDPS())}` });
        contentContainer.replaceChildren();
        const row = stat => {
            const node = document.createElement('div'); node.className = 'stat-sidebar-item';
            const label = document.createElement('span'); label.className = 'stat-sidebar-label'; label.textContent = stat.label;
            const value = document.createElement('span'); value.className = 'stat-sidebar-value'; value.textContent = stat.value;
            node.append(label, value); contentContainer.append(node);
        };
        statList.forEach(row);
        const other = this.getOtherItemStatTotals();
        if (other.length) {
            const title = document.createElement('p'); title.className = 'inventory-other-stats-title'; title.textContent = 'OTHER ITEM STATS';
            const hint = document.createElement('p'); hint.className = 'inventory-other-stats-hint'; hint.textContent = 'Flavor attributes · no mining effect';
            contentContainer.append(title, hint);
            other.forEach(stat => row({ label: stat.label,
                value: `${stat.value < 0 ? '−' : '+'}${this.formatNumber(Math.abs(stat.value))}${stat.percent ? '%' : ''}` }));
        }

        const explained = document.createElement('div');
        explained.innerHTML = `<details class="inventory-stats-explained">
            <summary>STATS EXPLAINED</summary>
            <p>Your equipped pickaxe and all collected fortunes contribute to these totals.</p>
            <p><strong>Luck</strong> improves general good fortune, including Dogebags and their coin rewards.</p>
            <p><strong>Loot Find</strong> increases your chance of finding loot.</p>
            <p><strong>Wow</strong> improves the stats rolled on new loot.</p>
            <p><strong>Critical Chance</strong> gives a chance to mine a 2.5× hit. Higher totals can strengthen critical hits.</p>
            <p><strong>DPC / DPS</strong> show your mining and helper bonuses.</p>
            <p><strong>Mystery Bonus</strong> · ???</p>
        </details>`;
        contentContainer.append(...explained.childNodes);
    }

    /**
     * Renders the pickaxe cards in the modal grid
     */
    renderPickaxeGrid() {
        this._renderInventoryGrid('pickaxe', this.pickaxeInventory);
    }

    renderFortuneGrid() {
        this._renderInventoryGrid('fortune', this.fortuneInventory);
    }

    _renderInventoryGrid(kind, inventory) {
        const grid = document.getElementById(`${kind}-grid`);
        if (!grid) return;
        this._hideInventoryTooltip();
        grid.replaceChildren();
        const filtered = this._getFilteredInventory(kind, inventory);
        this._updateInventoryCount(kind, filtered.length, inventory.length);
        if (!filtered.length) {
            const message = document.createElement('p');
            message.className = 'no-items-message';
            message.textContent = inventory.length ? `No matching ${kind === 'pickaxe' ? 'pickaxes' : 'fortunes'}.`
                : `No ${kind === 'pickaxe' ? 'pickaxes' : 'fortunes'} available yet!`;
            grid.appendChild(message);
        }
        filtered.forEach(item => {
            const card = document.createElement('button');
            const equipped = kind === 'pickaxe' && this.equippedPickaxeId === item.instanceId;
            const rarity = this._inventoryRarity(item);
            card.type = 'button';
            card.className = `item-card inventory-item-tile inventory-item-${kind} rarity-${rarity}${equipped ? ' equipped' : ''}`;
            card.dataset.inventoryId = item.instanceId;
            card._inventoryItem = item;
            card._inventoryKind = kind;
            const copies = kind === 'fortune' ? (item.consolidatedCopies || 1) : 1;
            card.setAttribute('aria-label', `${item.name}${copies > 1 ? `, ${copies} combined copies` : ''}, ${rarity} ${kind}${equipped ? ', equipped' : ''}. ${kind === 'pickaxe' ? 'Equip and view stats' : 'View stats'}.`);
            if (kind === 'pickaxe') card.setAttribute('aria-pressed', String(equipped));
            const icon = document.createElement('img');
            icon.src = kind === 'pickaxe' ? item.idleSprite : item.sprite || 'assets/general/dogecoin_70x70.webp';
            icon.alt = '';
            icon.className = 'item-card-icon';
            const name = document.createElement('span');
            name.className = 'item-card-name';
            name.textContent = item.name;
            card.append(icon, name);
            if (copies > 1) {
                const count = document.createElement('span');
                count.className = 'inventory-copy-count'; count.textContent = `×${this.formatNumber(copies)}`;
                card.appendChild(count);
            }
            if (equipped || item.isProtected || item.isSoulbound || item.shield) {
                const badge = document.createElement('span');
                badge.className = 'inventory-item-badge';
                badge.textContent = equipped ? 'EQUIPPED' : 'PROTECTED';
                card.appendChild(badge);
            }
            card.addEventListener('pointerenter', event => {
                if (event.pointerType !== 'touch' && !this._inventoryTouchMode()) this._showInventoryTooltip(card);
            });
            card.addEventListener('pointermove', event => {
                if (event.pointerType === 'touch' || this._inventoryTouchMode()) return;
                const bounds = card.getBoundingClientRect();
                card.style.setProperty('--item-tilt-x', `${-(event.clientY - bounds.top - bounds.height / 2) / bounds.height * 14}deg`);
                card.style.setProperty('--item-tilt-y', `${(event.clientX - bounds.left - bounds.width / 2) / bounds.width * 14}deg`);
            });
            card.addEventListener('pointerleave', event => {
                card.style.removeProperty('--item-tilt-x');
                card.style.removeProperty('--item-tilt-y');
                if (!this._inventoryTouchMode() && !this._inventoryTooltip?.contains(event.relatedTarget)) {
                    this._scheduleInventoryTooltipHide(card);
                }
            });
            card.addEventListener('focus', () => this._showInventoryTooltip(card));
            card.addEventListener('blur', event => {
                if (this._inventoryTooltip?.contains(event.relatedTarget)) return;
                this._hideInventoryTooltip(card);
            });
            card.addEventListener('click', () => {
                const restoreFocus = document.activeElement === card;
                if (kind === 'pickaxe') this.equipPickaxe(item.instanceId, {volume:.3});
                else this.playSound('select2', {volume:.3});
                const current = [...grid.querySelectorAll('.inventory-item-tile')].find(tile => tile._inventoryItem === item);
                if (current) {
                    if (restoreFocus) current.focus({ preventScroll: true });
                    this._showInventoryTooltip(current);
                }
            });
            grid.appendChild(card);
        });
        // Controller navigation marks cards with a class rather than DOM focus.
        this._inventoryFocusObservers ||= {};
        if (!this._inventoryFocusObservers[kind]) {
            const observer = new MutationObserver(() => {
                const focused = grid.querySelector('.inventory-item-tile.controller-focus');
                if (focused && focused !== this._inventoryTooltipCard) this._showInventoryTooltip(focused);
                else if (!focused && this._inventoryTooltipCard?.classList.contains('controller-focus') === false
                    && document.body.classList.contains('controller-mode')) this._hideInventoryTooltip();
            });
            observer.observe(grid, { subtree: true, attributes: true, attributeFilter: ['class'] });
            this._inventoryFocusObservers[kind] = observer;
        }
    }

    _inventoryRarity(item) {
        return ['common', 'improved', 'rare', 'epic', 'legendary'].includes(item.rarity) ? item.rarity : 'common';
    }

    _inventoryTouchMode() {
        return window.innerWidth <= 768 || window.matchMedia('(hover: none)').matches;
    }

    _inventoryStatClass(stat) {
        return `inventory-stat-${window.DogeMinerBalance.getAttributeMetadata(stat).tag.slice(4)}`;
    }

    _inventoryStatText(kind, stat) {
        const indicator = stat.indicator || '';
        const sign = indicator.startsWith('-') ? '-' : indicator.startsWith('+') ? '+' : '';
        const percent = indicator.includes('%') ? '%' : '';
        const value = Number.isFinite(stat.value) && Math.abs(stat.value) < 1000 ? String(stat.value) : this.formatNumber(stat.value);
        return `${sign}${value}${percent} ${stat.displayName || stat.name || ''}`;
    }

    _showInventoryTooltip(card) {
        const modal = card.closest('.switcher-modal');
        if (!modal?.classList.contains('active')) return;
        this._hideInventoryTooltip();
        let tooltip = this._inventoryTooltip;
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'inventory-item-tooltip';
            tooltip.setAttribute('role', 'tooltip');
            document.body.appendChild(tooltip);
            this._inventoryTooltip = tooltip;
            window.addEventListener('resize', () => this._positionInventoryTooltip());
            document.addEventListener('scroll', () => this._positionInventoryTooltip(), true);
            document.addEventListener('pointerdown', event => {
                if (!tooltip.contains(event.target) && !event.target.closest('.inventory-item-tile')) this._hideInventoryTooltip();
            });
            document.addEventListener('keydown', event => {
                if (event.key === 'Escape') this._hideInventoryTooltip();
            });
            tooltip.addEventListener('focusout', event => {
                if (event.relatedTarget !== this._inventoryTooltipCard
                    && !tooltip.contains(event.relatedTarget)) this._hideInventoryTooltip();
            });
            tooltip.addEventListener('pointerenter', () => clearTimeout(this._inventoryTooltipHideTimer));
            tooltip.addEventListener('pointerleave', event => {
                if (!this._inventoryTouchMode() && !this._inventoryTooltipCard?.contains(event.relatedTarget)) {
                    this._scheduleInventoryTooltipHide(this._inventoryTooltipCard);
                }
            });
        }
        const item = card._inventoryItem;
        const kind = card._inventoryKind;
        tooltip.setAttribute('role', this._inventoryTouchMode() ? 'dialog' : 'tooltip');
        tooltip.setAttribute('aria-label', `${item.name} details`);
        tooltip.className = `inventory-item-tooltip rarity-${this._inventoryRarity(item)}${this._inventoryTouchMode() ? ' touch-details' : ''}`;
        tooltip.replaceChildren();
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'inventory-tooltip-close';
        close.setAttribute('aria-label', 'Close item details');
        close.textContent = '×';
        close.addEventListener('click', () => {
            if (this._inventoryTooltipCard?.isConnected) this._inventoryTooltipCard.focus({ preventScroll: true });
            this._hideInventoryTooltip();
        });
        const rarity = document.createElement('div');
        rarity.className = 'inventory-tooltip-rarity';
        rarity.textContent = `${this._inventoryRarity(item)} ${kind}`;
        const name = document.createElement('div');
        name.className = 'inventory-tooltip-name';
        name.textContent = item.name;
        tooltip.append(close, rarity, name);
        if (kind === 'pickaxe') {
            const dpc = document.createElement('div');
            dpc.className = 'inventory-tooltip-dpc';
            const coin = document.createElement('img');
            coin.src = 'assets/general/dogecoin_70x70.webp';
            coin.alt = 'Base Dogecoins per click';
            const value = document.createElement('span');
            value.textContent = this.formatNumber(item.baseDPC);
            dpc.append(coin, value);
            const delta = item.baseDPC - (this.getEquippedPickaxe()?.baseDPC || 0);
            if (Number.isFinite(delta)) {
                const comparison = document.createElement('span');
                comparison.className = `inventory-dpc-comparison ${delta > 0 ? 'increase' : delta < 0 ? 'decrease' : 'equal'}`;
                comparison.textContent = delta === 0 ? '±0' : `${delta > 0 ? '▲ +' : '▼ −'}${this.formatNumber(Math.abs(delta))}`;
                comparison.setAttribute('aria-label', `${delta === 0 ? 'Same base DPC' : `${this.formatNumber(Math.abs(delta))} ${delta > 0 ? 'more' : 'less'} base DPC`} than equipped pickaxe`);
                dpc.appendChild(comparison);
            }
            tooltip.appendChild(dpc);
        }
        const description = document.createElement('div');
        description.className = 'inventory-tooltip-description';
        description.textContent = item.description || (kind === 'fortune' ? 'A mysterious artifact imbued with some kind of magical power.' : '');
        tooltip.appendChild(description);
        if (kind === 'fortune' && item.consolidatedCopies > 1) {
            const combined = document.createElement('p');
            combined.className = 'inventory-consolidation-note';
            combined.textContent = `${this.formatNumber(item.consolidatedCopies)} earned copies combined. All bonuses are included below.`;
            tooltip.appendChild(combined);
        }
        const stats = document.createElement('div');
        stats.className = 'inventory-tooltip-stats';
        for (const stat of item.stats || []) {
            const line = document.createElement('div');
            line.className = `inventory-tooltip-stat ${kind === 'pickaxe' ? 'inventory-stat-green' : this._inventoryStatClass(stat)}`;
            line.textContent = `${kind === 'pickaxe' ? 'Equip: ' : ''}${this._inventoryStatText(kind, stat)}`;
            stats.appendChild(line);
        }
        tooltip.appendChild(stats);
        const hint = document.createElement('div');
        hint.className = 'inventory-tooltip-hint';
        hint.textContent = kind === 'fortune' ? 'PASSIVE · No equip needed'
            : card.classList.contains('equipped') ? 'EQUIPPED' : this._inventoryTouchMode() ? 'TAP TO EQUIP' : 'CLICK TO EQUIP';
        tooltip.appendChild(hint);
        tooltip.hidden = false;
        this._inventoryTooltipCard = card;
        card.setAttribute('aria-describedby', tooltip.id);
        this._positionInventoryTooltip();
    }

    _hideInventoryTooltip(card) {
        if (card && card !== this._inventoryTooltipCard) return;
        clearTimeout(this._inventoryTooltipHideTimer);
        this._inventoryTooltipCard?.removeAttribute('aria-describedby');
        this._inventoryTooltipCard = null;
        if (this._inventoryTooltip) this._inventoryTooltip.hidden = true;
    }

    _scheduleInventoryTooltipHide(card) {
        clearTimeout(this._inventoryTooltipHideTimer);
        this._inventoryTooltipHideTimer = setTimeout(() => {
            if (!card || this._inventoryTooltipCard !== card || document.activeElement === card
                || card.classList.contains('controller-focus') || this._inventoryTooltip?.contains(document.activeElement)
                || this._inventoryTooltip?.matches(':hover')) return;
            this._hideInventoryTooltip(card);
        }, 120);
    }

    _positionInventoryTooltip() {
        const card = this._inventoryTooltipCard;
        const tooltip = this._inventoryTooltip;
        if (!card || !tooltip || tooltip.hidden) return;
        if (!card.isConnected || !card.closest('.switcher-modal.active')) return this._hideInventoryTooltip();
        tooltip.classList.toggle('touch-details', this._inventoryTouchMode());
        tooltip.setAttribute('role', this._inventoryTouchMode() ? 'dialog' : 'tooltip');
        const margin = 10;
        const bounds = card.getBoundingClientRect();
        const width = tooltip.offsetWidth;
        const height = tooltip.offsetHeight;
        let left = bounds.right + 8;
        let top = bounds.top;
        if (this._inventoryTouchMode()) {
            left = (window.innerWidth - width) / 2;
            top = window.innerHeight - height - margin;
        } else if (left + width > window.innerWidth - margin) {
            left = bounds.left - width - 8;
            if (left < margin) {
                left = bounds.left;
                top = bounds.bottom + 8;
            }
        }
        tooltip.style.left = `${Math.max(margin, Math.min(left, window.innerWidth - width - margin))}px`;
        tooltip.style.top = `${Math.max(margin, Math.min(top, window.innerHeight - height - margin))}px`;
    }

    _bindInventoryToolbar(kind) {
        if (!kind || this._inventoryUiBound[kind]) return;

        const search = document.getElementById(`${kind}-search`);
        const rarity = document.getElementById(`${kind}-rarity`);
        const sort = document.getElementById(`${kind}-sort`);
        if (!search || !rarity || !sort) return;

        // Initialize UI controls from state
        const st = this._inventoryUi[kind];
        search.value = st.search || '';
        rarity.value = st.rarity || '';
        sort.value = st.sort || 'newest';

        const apply = () => {
            const next = this._inventoryUi[kind];
            next.search = (search.value || '').trim();
            next.rarity = rarity.value || '';
            next.sort = sort.value || 'newest';
            if (kind === 'pickaxe') this.renderPickaxeGrid();
            if (kind === 'fortune') this.renderFortuneGrid();
        };

        search.addEventListener('input', apply);
        rarity.addEventListener('change', apply);
        sort.addEventListener('change', apply);

        this._inventoryUiBound[kind] = true;
    }

    _updateInventoryCount(kind, shown, total) {
        const el = document.getElementById(`${kind}-count`);
        if (!el) return;
        if (!total) {
            el.textContent = '';
            return;
        }
        const label = kind === 'pickaxe' ? 'Pickaxes' : 'Fortunes';
        const found = shown === total ? `${total}` : `${shown}/${total}`;
        el.textContent = `Found ${found}/??? ${label}`;
    }

    _getFilteredInventory(kind, list) {
        const st = this._inventoryUi[kind] || { search: '', rarity: '', sort: 'newest' };
        const q = (st.search || '').toLowerCase();
        const rarity = st.rarity || '';

        let out = Array.isArray(list) ? list.slice() : [];

        if (q) {
            out = out.filter(it => (it?.name || '').toLowerCase().includes(q));
        }
        if (rarity) {
            out = out.filter(it => (it?.rarity || '').toLowerCase() === rarity);
        }

        const rarityRank = { common: 1, improved: 2, rare: 3, epic: 4, legendary: 5 };
        const byName = (a, b) => (a?.name || '').localeCompare((b?.name || ''), undefined, { sensitivity: 'base' });
        const byRarityDesc = (a, b) => (rarityRank[(b?.rarity || '').toLowerCase()] || 0) - (rarityRank[(a?.rarity || '').toLowerCase()] || 0) || byName(a, b);

        switch (st.sort) {
            case 'nameAsc':
                out.sort(byName);
                break;
            case 'rarityDesc':
                out.sort(byRarityDesc);
                break;
            case 'dpcDesc':
                if (kind === 'pickaxe') {
                    out.sort((a, b) => (b?.baseDPC || 0) - (a?.baseDPC || 0) || byRarityDesc(a, b));
                }
                break;
            case 'newest':
            default:
                // Inventory arrays append newest; render newest first
                out.reverse();
                break;
        }

        return out;
    }

    /**
     * Equips a pickaxe by instanceId
     */
    equipPickaxe(instanceId, { sound = true, volume = 1 } = {}) {
        const pickaxe = this.pickaxeInventory.find(p => p.instanceId === instanceId);
        if (!pickaxe) return;

        this.equippedPickaxeId = instanceId;
        this.renderPickaxeGrid();
        this.recalculatePlayerStats();
        this.updateStatsSidebar('pickaxe');

        // Update pickaxe sprite in game
        const pickaxeImg = document.getElementById('pickaxe');
        if (pickaxeImg) {
            pickaxeImg.src = pickaxe.idleSprite;

            // Apply per-sprite scale/position adjustments
            pickaxeImg.classList.remove('pickaxe-scale-half', 'pickaxe-shift-right', 'pickaxe-scale-baguette', 'pickaxe-paw');
            const spritePath = (pickaxe.idleSprite || '').split('/').pop().toLowerCase();
            if (pickaxe.isPaw) {
                // The bare Paw sits behind Doge and only shows when mining
                pickaxeImg.classList.remove('pickaxe-intro');
                pickaxeImg.classList.add('pickaxe-paw');
                pickaxeImg.style.opacity = '';
            } else if (spritePath.includes('cleaver')) {
                pickaxeImg.classList.add('pickaxe-scale-half');
            } else if (spritePath.includes('baguette')) {
                pickaxeImg.classList.add('pickaxe-scale-baguette');
            }
            // Large weapons that need upscaling + repositioning
            const largeWeaponPatterns = [
                'axe', 'hammer', 'sword', 'drill', 'shotgun', 'm4.',
                'rocket', 'nuke', 'staff', 'scepter', 'gpu', 'sligpu',
                'fryingpan', 'bigboot', 'eguitar', 'cod.', 'felps',
                'barbell', 'poolnoodle', 'record'
            ];
            if (!pickaxe.isPaw && largeWeaponPatterns.some(p => spritePath.includes(p))) {
                pickaxeImg.classList.add('pickaxe-shift-right');
            }
        }

        if (sound) this.playSound('pickup', {volume});

        // Update pickaxe button preview
        const btnPreview = document.getElementById('pickaxe-btn-preview');
        if (btnPreview) {
            btnPreview.src = pickaxe.idleSprite;
        }
    }

    /**
     * Updates "latest obtained fortune" state + button preview.
     * This is intentionally separate from fortuneInventory ordering.
     */
    setLatestObtainedFortune(fortune) {
        if (!fortune) return;
        const sprite = fortune.sprite || '';
        const name = fortune.name || '';
        if (!sprite && !name) return;

        this.latestObtainedFortune = { name, sprite };

        const img = document.getElementById('fortune-btn-preview');
        if (img) {
            img.src = sprite || '';
            img.alt = name ? `${name} (Fortune)` : 'Fortunes';
            if (sprite) {
                img.classList.remove('fortune-icon-placeholder');
                img.style.visibility = '';
            } else {
                img.classList.add('fortune-icon-placeholder');
                img.style.visibility = 'hidden';
            }
        }
    }

    /**
     * Adds a new pickaxe to the inventory
     */
    addPickaxeToInventory(pickaxe) {
        this.pickaxeInventory.push(pickaxe);
        this.markInventoryUnread('pickaxe');
        // Update maxDPC tracker (skip zeroDPC pickaxes like Staff of SunDoge)
        if (pickaxe.baseDPC > 0 && pickaxe.baseDPC > this.maxPickaxeDPC) {
            this.maxPickaxeDPC = pickaxe.baseDPC;
        }
    }

    addFortuneToInventory(fortune, unread = true) {
        this.fortuneInventory.push(fortune);
        if (unread) this.markInventoryUnread('fortune');
    }

    restoreInventoryUnread(saved) {
        this.inventoryUnread = {};
        for (const kind of ['pickaxe', 'fortune']) {
            const value = saved?.[kind];
            const owned = (this[`${kind}Inventory`] || []).reduce((sum, item) => sum + Math.max(1, Number(item.consolidatedCopies) || 1), 0);
            this.inventoryUnread[kind] = Number.isFinite(value) ? Math.max(0, Math.min(owned, Math.floor(value))) : 0;
        }
        this.updateInventoryUnread();
    }

    markInventoryUnread(kind) {
        this.inventoryUnread ||= { pickaxe: 0, fortune: 0 };
        this.inventoryUnread = { ...this.inventoryUnread, [kind]: Math.min(Number.MAX_SAFE_INTEGER, (this.inventoryUnread[kind] || 0) + 1) };
        this.updateInventoryUnread();
    }

    markInventoryRead(kind) {
        if (!this.inventoryUnread?.[kind]) return;
        const before = this.inventoryUnread;
        this.inventoryUnread = { ...before, [kind]: 0 };
        // A rejected write leaves the badge available to retry on the next visit.
        if (window.saveManager && !window.saveManager.saveGame(false)) this.inventoryUnread = before;
        this.updateInventoryUnread();
    }

    updateInventoryUnread() {
        for (const kind of ['pickaxe', 'fortune']) {
            const badge = document.getElementById(`${kind}-unread`);
            if (!badge) continue;
            const count = this.inventoryUnread?.[kind] || 0;
            if (badge._unreadCount === count) continue;
            badge._unreadCount = count;
            const text = count > 99 ? '99+' : String(count);
            if (badge.textContent !== text) badge.textContent = text;
            badge.hidden = count === 0;
            document.getElementById(`${kind}-btn`)?.setAttribute('aria-label', `${kind === 'pickaxe' ? 'Pickaxes' : 'Fortunes'}${count ? `, ${count} new ${count === 1 ? 'item' : 'items'}` : ''}`);
        }
    }

    /**
     * Sets Supporter status, grants soulbound perks and triggers updates
     */
    setSupporterStatus(isSupporter, silent = false) {
        if (!isSupporter) return; // Right now we only enable it
        if (!this.isSupporter) {
            this.isSupporter = true;
            console.log('Supporter status activated! Granting unified perks + Badge of Patronage.');
        }

        // Hide "Become a Supporter" button
        const supporterSection = document.getElementById('supporter-settings-section');
        if (supporterSection) supporterSection.style.display = 'none';

        // Show Global Supporter UI Indicator
        const supporterStat = document.getElementById('supporter-stat-display');
        if (supporterStat) supporterStat.style.display = 'flex';

        // Grant Soulbound Fortune if Factory loaded and player doesn't have it
        if (this.fortuneFactory && this.fortuneFactory.loaded) {
            const hasBadge = this.fortuneInventory.some(f => f.templateId === 'badge_of_patronage' || f.name === 'Badge of Patronage');
            if (!hasBadge) {
                console.log('Supporter verified: Injecting Soulbound Badge of Patronage');
                const badge = this.fortuneFactory.generateSpecialFortune('badge_of_patronage');
                if (badge) {
                    this.addFortuneToInventory(badge, !silent);
                    this.setLatestObtainedFortune(badge);

                    if (!silent) {
                        this.showNotification('Badge of Patronage Secured!');
                        this.playSound('longSparkle');
                        if (typeof this.showFloatingText === 'function') {
                            this.showFloatingText('Supporter Perks Activated!', window.innerWidth / 2, window.innerHeight / 2, '#f96854', 36);
                        }
                    }
                }
            }
        }

        this.recalculatePlayerStats();
        if (typeof this.updateShopPrices === 'function') {
            this.updateShopPrices();
        }
    }

    /**
     * Gets the current DPC based on equipped pickaxe and player stats
     */
    getPickaxeDPC() {
        const pickaxe = this.getEquippedPickaxe();
        if (pickaxe?.isPaw) return 1;
        let val = pickaxe ? pickaxe.baseDPC * this.playerStats.dpcMultiplier : 1;
        if (this.isSupporter) {
            val *= 1.05; // 5% increased DPC for supporters
        }
        return Math.floor(val);
    }

    /**
     * Recalculates all player stats from equipped pickaxe + all fortunes
     */
    recalculatePlayerStats() {
        this.playerStats = {
            luck: 0, lootFind: 0, wow: 0, critChance: 0,
            dpcMultiplier: 1, helperDpsMultiplier: 1, totalDpsMultiplier: 1,
            flatHelperDps: 0, pickaxeFlatDps: 0, fortuneFlatDps: 0,
            mysteryBonus: 0, holidaySpirit: 0, rocketCostReduction: 0
        };
        const equipped = this.getEquippedPickaxe();
        for (const stat of equipped?.stats || []) this._applyStatToPlayer(stat, 'pickaxe');
        for (const fortune of this.fortuneInventory || []) {
            // Fixed bonuses and earned merged fortunes are read without rewriting their rolls.
            for (const stat of fortune.stats || []) this._applyStatToPlayer(stat, 'fortune');
        }
        this.playerStats.flatHelperDps = this.playerStats.pickaxeFlatDps + this.playerStats.fortuneFlatDps;
        this.playerStats.rocketCostReduction = Math.min(0.6, Math.max(0, this.playerStats.rocketCostReduction));
        if (this.isSupporter) this.playerStats.totalDpsMultiplier *= 1.05;
        this.updateDPS();
        this.updateUI();
    }

    getHelperCost(baseCost, ownedCount, helperType = null) {
        const isRocket = ['spaceRocket', 'marsRocket', 'jupiterRocket', 'titanRocket'].includes(helperType);
        const discount = isRocket ? Math.max(0.4, 1 - (this.playerStats.rocketCostReduction || 0)) : 1;
        const effectiveCount = isRocket && ownedCount > 16
            ? Math.max(16, Math.floor(ownedCount * 1.15 * discount)) : ownedCount;
        const cost = baseCost * Math.pow(1.15, effectiveCount) * (this.isSupporter ? 0.95 : 1) * discount;
        return isRocket ? Math.ceil(cost) : Math.floor(cost);
    }

    _applyStatToPlayer(stat, source = 'fortune') {
        if (!stat || !Number.isFinite(Number(stat.value))) return;
        const value = Number(stat.value);
        const key = String(stat.balanceKey || stat.name || '').toLowerCase().replace(/[^a-z]/g, '');
        if (['luck', 'wow'].includes(key)) this.playerStats[key] += value;
        else if (['loot', 'lootfind'].includes(key)) this.playerStats.lootFind += value;
        else if (['crit', 'critchance', 'criticalchance'].includes(key)) this.playerStats.critChance += value / 100;
        else if (['spirit','holidayspirit'].includes(key)) this.playerStats.holidaySpirit += value;
        else if (['mystery', 'mysterybonus', 'mysterybonuss'].includes(key)) this.playerStats.mysteryBonus += value;
        else if (key === 'dpcmultiplier') this.playerStats.dpcMultiplier += stat.indicator?.includes('%') ? value / 100 : value;
        else if (['rockets', 'spacerocketcosts', 'rocketcostreduction'].includes(key)) this.playerStats.rocketCostReduction += value / 100;
        else if (key === 'dpsp' || (source === 'pickaxe' && key === 'dps' && stat.indicator?.includes('%'))) {
            this.playerStats.totalDpsMultiplier += value / 100;
        } else if (['income', 'helperdps', 'helperdpsmultiplier', 'helperdpsmult'].includes(key)
            || (source === 'fortune' && key === 'dps' && stat.indicator?.includes('%'))) {
            this.playerStats.helperDpsMultiplier += value / 100;
        } else if (['dps', 'persec', 'flathelperdps'].includes(key)) {
            this.playerStats[source === 'pickaxe' ? 'pickaxeFlatDps' : 'fortuneFlatDps'] += value;
        }
        // Higher Ground and other flavor attributes have no DM2 mining consumer.
    }

    getMysteryDPS() {
        if (this.currentLevel === 'earth') return 0;
        const amount = this.playerStats.mysteryBonus || 0;
        const timeline = Math.max(1, Number(this.timelineNumber) || 1);
        return amount >= 420133769 ? 6969 * timeline : amount >= 121111 ? 420 * timeline : 0;
    }

    getBalanceSnapshot() {
        const equipped = this.getEquippedPickaxe();
        return {
            ...this.playerStats,
            dpc: equipped?.isPaw ? 1 : this.getPickaxeDPC() * (this.bonusCoinBuffMultiplier || 1),
            dps: this.dps || 0,
            mysteryDps: this.getMysteryDPS()
        };
    }

    // ========== END PICKAXE & FORTUNE SYSTEM ==========

    playDogeIntro(force = false) {
        if ((this.isTransitioning || this.isCutscenePlaying) && !force) return;
        if (this.isIntroPlaying && !force) return;

        const characterContainer = document.getElementById('character-container');
        const pickaxe = document.getElementById('pickaxe');
        if (!characterContainer) return;

        characterContainer.style.visibility = 'hidden';
        characterContainer.style.transform = 'translateY(-520px)';

        this.isIntroPlaying = true;

        const doge = document.getElementById('main-character');
        if (doge) {
            if (this.currentLevel === 'earth') {
                doge.src = 'assets/general/character/standard.webp';
            } else if (this.currentLevel === 'moon') {
                doge.src = 'assets/general/character/spacehelmet.webp';
            } else if (this.currentLevel === 'mars') {
                doge.src = 'assets/general/character/party.webp';
            } else if (this.currentLevel === 'jupiter') {
                doge.src = 'assets/general/character/spacehelmet.webp';
            }
            doge.classList.remove('float');
        }

        characterContainer.classList.remove('doge-intro');
        if (pickaxe) pickaxe.classList.remove('pickaxe-intro');

        const introEpoch = this._storyEpoch ||= 1;
        setTimeout(() => {
            if (introEpoch !== this._storyEpoch) return;
            characterContainer.style.visibility = 'visible';

            const restartAnimation = (element, className) => {
                element.classList.remove(className);
                void element.offsetWidth;
                element.classList.add(className);
            };

            restartAnimation(characterContainer, 'doge-intro');
            setTimeout(() => {
                if (introEpoch !== this._storyEpoch) return;
                characterContainer.classList.remove('doge-intro');
                characterContainer.style.transform = '';
            }, 2600);

            const equipped = this.getEquippedPickaxe();
            if (pickaxe && (!equipped || !equipped.isPaw)) {
                restartAnimation(pickaxe, 'pickaxe-intro');
                setTimeout(() => {
                    if (introEpoch !== this._storyEpoch) return;
                    pickaxe.classList.remove('pickaxe-intro');
                }, 1800);
            }

            const introDuration = 1000;
            const squashDuration = 350;
            const startDelay = 500;
            setTimeout(() => {
                if (introEpoch !== this._storyEpoch) return;
                this.isIntroPlaying = false;
                const idleDoge = document.getElementById('main-character');
                if (idleDoge) {
                    idleDoge.classList.add('float');
                }
            }, startDelay + introDuration + squashDuration);
        }, 50);
    }

    startSwing() {
        if (this.isIntroPlaying || this.isCutscenePlaying || this.isTransitioning) return;
        const pickaxe = document.getElementById('pickaxe');
        if (!pickaxe) return;

        const now = Date.now();
        const diff = now - (this.lastRealSwing || 0);
        this.lastRealSwing = now;

        // DM2 swing timing: fast chain-clicks = 34ms, fresh clicks = 68ms
        const swingTime = (diff < 200) ? 34 : 68;
        this._currentSwingDuration = swingTime;
        this._swingStartTime = now;

        pickaxe.style.transition = `transform ${swingTime}ms ease-in, opacity 25ms ease-in`;
        pickaxe.classList.remove('pickaxe-intro');
        pickaxe.classList.add('swing-down');

        // Clear any pending return timeout
        if (this.swingTimeout) {
            clearTimeout(this.swingTimeout);
            this.swingTimeout = null;
        }
    }

    endSwing() {
        if (this.isMouseDown || this.isSpaceDown) return;

        const pickaxe = document.getElementById('pickaxe');
        if (!pickaxe) return;

        // Clear any existing pending return
        if (this.swingTimeout) {
            clearTimeout(this.swingTimeout);
            this.swingTimeout = null;
        }

        // Calculate how long the swing has been active
        const elapsed = Date.now() - (this._swingStartTime || 0);
        const remaining = (this._currentSwingDuration || 34) - elapsed;

        if (remaining > 0) {
            // Swing hasn't finished yet — delay the return so it completes fully
            this.swingTimeout = setTimeout(() => {
                this._doSwingReturn(pickaxe);
            }, remaining);
        } else {
            // Swing already completed, return immediately
            this._doSwingReturn(pickaxe);
        }
    }

    _doSwingReturn(pickaxe) {
        if (this.isMouseDown || this.isSpaceDown) return;

        // DM2 unpick time: MINIMUM_SWING_TIME * 4 = 136ms
        pickaxe.style.transition = 'transform 136ms ease-out, opacity 60ms ease-out';
        pickaxe.classList.remove('swing-down');

        // Revert to idle sprite
        if (this._currentIdleSpritePath) {
            pickaxe.src = this._currentIdleSpritePath;
        }

        this.swingTimeout = null;
    }

    // Rock health system removed - simplified mining

    createParticleEffect(event) {
        if (this.lessEffects) return;
        const container = document.getElementById('particle-container');
        if (!container) return;

        // Get rock position for particle origin
        const rock = document.getElementById('main-rock');
        const rockRect = rock.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Calculate position relative to particle container
        const x = rockRect.left + rockRect.width / 2 - containerRect.left;
        const y = rockRect.top + rockRect.height / 2 - containerRect.top;

        // Create 5-8 particles (random amount)
        const particleCount = 5 + Math.floor(Math.random() * 4); // 5-8 particles

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('img');
            particle.src = 'assets/general/rocks/earth_particle.webp';
            particle.className = 'earth-particle';
            if (this.currentLevel === 'moon') {
                particle.classList.add('moon-particle');
            } else if (this.currentLevel === 'mars') {
                particle.classList.add('mars-particle');
            } else if (this.currentLevel === 'jupiter') {
                particle.classList.add('jupiter-particle');
            } else if (this.currentLevel === 'titan') {
                particle.classList.add('titan-particle');
            }
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';

            // Random direction and distance for more realistic effect
            const angle = Math.random() * Math.PI * 2; // Random angle
            const distance = 40 + Math.random() * 30; // 40-70px distance
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;

            particle.style.setProperty('--dx', dx + 'px');
            particle.style.setProperty('--dy', dy + 'px');

            container.appendChild(particle);
            this.activeParticleCount++;

            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
                this.activeParticleCount = Math.max(0, this.activeParticleCount - 1);
            }, 600); // Slightly faster animation
        }
    }

    // Coin explosion removed - simplified mining

    createClickEffect(event) {
        const rock = document.getElementById('main-rock');
        rock.classList.add('shake');
        setTimeout(() => {
            rock.classList.remove('shake');
        }, 300);

    }


    flashDogecoinAmount(type = 'green') {
        const el = document.getElementById('dogecoin-amount');
        if (!el) return;
        const cls = type === 'red' ? 'flash-red' : 'flash-green';
        el.classList.remove('flash-green', 'flash-red');
        void el.offsetWidth; // Force CSS reflow to re-trigger animation
        el.classList.add(cls);

        if (type === 'green') {
            const statIcon = document.querySelector('.stat-item:first-child .stat-icon');
            if (statIcon) {
                statIcon.animate([
                    { transform: 'scale(1.08)' },
                    { transform: 'scale(1)' }
                ], { duration: 250, easing: 'ease-out' });
            }
        }
    }

    createFloatingCoin(amount, event = null, isCrit = false, isRecord = false) {
        if (this.lessEffects) { this.updateDogecoinCounter(); this.flashDogecoinAmount('green'); return; }
        isRecord = isCrit && isRecord;
        // Get the floating coins container
        const container = document.getElementById('floating-coins');
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        let startX, startY;

        if (event && event.clientX !== undefined) {
            // Use mouse/touch position
            startX = event.clientX - containerRect.left;
            startY = event.clientY - containerRect.top;
        } else {
            // Fall back to rock position for keyboard/gamepad clicks
            const rock = document.getElementById('main-rock');
            if (!rock) return;
            const rockRect = rock.getBoundingClientRect();
            startX = rockRect.left + rockRect.width / 2 - containerRect.left;
            startY = rockRect.top + rockRect.height / 2 - containerRect.top;
        }

        // Target: Total Dogecoin Counter in top stats HUD
        const targetEl = document.querySelector('.stat-item:first-child .stat-icon') || document.getElementById('dogecoin-amount');
        let targetX = containerRect.width / 2;
        let targetY = 50;
        if (targetEl) {
            const targetRect = targetEl.getBoundingClientRect();
            targetX = targetRect.left + targetRect.width / 2 - containerRect.left;
            targetY = targetRect.top + targetRect.height / 2 - containerRect.top;
        }

        // Create item containing both coin icon + text
        const item = document.createElement('div');
        item.className = 'floating-coin-item' + (isCrit ? ' is-crit' : '') + (isRecord ? ' is-record-crit' : '');
        item.style.position = 'absolute';
        item.style.left = '0px';
        item.style.top = '0px';
        item.style.willChange = 'transform, opacity';
        item.style.pointerEvents = 'none';

        const coinImg = document.createElement('img');
        coinImg.src = window.DogeMinerSeasonal?.active(this)==='xmas' ? 'assets/general/xmasdogecoin_70x70.webp' : 'assets/general/dogecoin_70x70.webp';
        coinImg.className = 'floating-coin-img';

        const textSpan = document.createElement('span');
        textSpan.className = 'floating-coin-text';
        textSpan.textContent = isCrit ? 'CRIT! +' + this.formatNumber(amount) : '+' + this.formatNumber(amount);

        // Keep record recoil separate from the existing currency flight.
        const pop = document.createElement('span');
        pop.className = 'floating-coin-pop';
        pop.appendChild(coinImg);
        pop.appendChild(textSpan);
        item.appendChild(pop);
        container.appendChild(item);
        let recoil;
        if (isRecord && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            // DM2's 210ms record pivot/rotation samples (pivot offsets render inverted).
            const samples = [[0,0,0,0],[.028,4.5,1.8,-.035],[.055,-3,-1.2,.026],[.08,0,0,0],
                [.11,0,0,0],[.133,2.8,1.1,-.02],[.159,-1.6,-.6,.012],[.21,0,0,0]];
            recoil = pop.animate(samples.map(([time,x,y,angle]) => ({ offset:time/.21,
                transform:`rotate(${angle}rad) translate(${-x}px, ${-y}px)` })),
                { duration:210, easing:'linear' });
        }

        // Generate curved trajectory keyframes:
        // Phase 1 (0% -> 22%): Rise straight up ~45px with a springy pop
        // Phase 2 (22% -> 100%): Curve upward into total Dogecoin counter, travelling under DPS
        const frames = [];
        const steps = 28;
        const spreadX = (Math.random() - 0.5) * 20;
        const peakX = startX + spreadX;
        const peakY = startY - 45;

        // Quadratic bezier control point for outward curving flight
        const curveOffset = (peakX < targetX) ? -35 : 35;
        const cpX = peakX + (targetX - peakX) * 0.25 + curveOffset;
        const cpY = Math.min(peakY, targetY + (peakY - targetY) * 0.35);

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            let x, y, scale, opacity;

            if (t < 0.22) {
                const p = t / 0.22;
                const easeP = Math.sin(p * Math.PI / 2);
                x = startX + spreadX * easeP;
                y = startY - 45 * easeP;
                scale = 0.65 + 0.5 * easeP; // 0.65 -> 1.15
                opacity = Math.min(1, p * 2.5);
            } else {
                const p = (t - 0.22) / 0.78;
                // Ease-in acceleration into the counter
                const easeP = p * p * (3 - 2 * p);
                const u = easeP;
                const invU = 1 - u;
                x = invU * invU * peakX + 2 * invU * u * cpX + u * u * targetX;
                y = invU * invU * peakY + 2 * invU * u * cpY + u * u * targetY;
                scale = 1.15 - 0.65 * u; // 1.15 -> 0.5
                opacity = u > 0.85 ? (1 - (u - 0.85) / 0.15) : 1;
            }

            if (isRecord) scale *= 1.3;
            frames.push({
                transform: `translate(calc(${x.toFixed(1)}px - 50%), calc(${y.toFixed(1)}px - 50%)) scale(${scale.toFixed(3)})`,
                opacity: opacity.toFixed(3)
            });
        }

        const anim = item.animate(frames, {
            duration: 800,
            easing: 'linear',
            fill: 'forwards'
        });

        this.activeEffectCount++;
        // Balance is already credited; withhold only its visual display during flight.
        this.pendingCoinDisplayAmount = (this.pendingCoinDisplayAmount || 0) + amount;

        const flightEpoch = this._currencyFlightEpoch || 0;
        let isCleanedUp = false;
        const cleanup = () => {
            if (isCleanedUp) return;
            isCleanedUp = true;
            try { anim.cancel(); recoil?.cancel(); } catch (e) {}
            if (item.parentNode) {
                item.parentNode.removeChild(item);
            }
            if ((this._currencyFlightEpoch || 0) !== flightEpoch) return;
            this.activeEffectCount = Math.max(0, this.activeEffectCount - 1);
            this.pendingCoinDisplayAmount = Math.max(0, (this.pendingCoinDisplayAmount || 0) - amount);
            this.updateDogecoinCounter();
            // Flash green as coin absorbs into total dogecoins
            this.flashDogecoinAmount('green');
        };

        anim.onfinish = cleanup;
        setTimeout(cleanup, 900);
    }

    flashDiamondAmount(type = 'green') {
        const el = document.getElementById('diamond-amount');
        if (!el) return;
        const cls = type === 'red' ? 'flash-red' : 'flash-green';
        el.classList.remove('flash-green', 'flash-red');
        void el.offsetWidth; // Force CSS reflow
        el.classList.add(cls);

        if (type === 'green') {
            const icon = document.querySelector('.diamond-counter-icon');
            if (icon) {
                icon.animate([
                    { transform: 'scale(1.08)' },
                    { transform: 'scale(1)' }
                ], { duration: 250, easing: 'ease-out' });
            }
        }
    }

    createFloatingDiamond(amount = 1, event = null) {
        if (this.lessEffects) { this.updateDiamondCounter(); this.flashDiamondAmount('green'); return; }
        // Get the floating coins container
        const container = document.getElementById('floating-coins');
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        let startX, startY;

        if (event && event.clientX !== undefined) {
            // Use mouse/touch/element position
            startX = event.clientX - containerRect.left;
            startY = event.clientY - containerRect.top;
        } else if (event && typeof event.x === 'number' && typeof event.y === 'number') {
            startX = event.x;
            startY = event.y;
        } else {
            // Fall back to rock position
            const rock = document.getElementById('main-rock');
            if (!rock) return;
            const rockRect = rock.getBoundingClientRect();
            startX = rockRect.left + rockRect.width / 2 - containerRect.left;
            startY = rockRect.top + rockRect.height / 2 - containerRect.top;
        }

        // Reveal the first-claim target before measuring its position, keeping the old amount.
        const counter = document.getElementById('diamond-counter');
        if (counter && this.dogediamondsEverObtained > 0) counter.style.display = 'flex';

        // Target: Dogediamond Counter in top-right HUD
        const targetEl = document.querySelector('.diamond-counter-icon') || document.getElementById('diamond-amount') || document.getElementById('diamond-counter');
        let targetX = containerRect.width - 60;
        let targetY = 35;
        if (targetEl) {
            const targetRect = targetEl.getBoundingClientRect();
            targetX = targetRect.left + targetRect.width / 2 - containerRect.left;
            targetY = targetRect.top + targetRect.height / 2 - containerRect.top;
        }

        // Create item containing diamond icon + text
        const item = document.createElement('div');
        item.className = 'floating-coin-item floating-diamond-item';
        item.style.position = 'absolute';
        item.style.left = '0px';
        item.style.top = '0px';
        item.style.willChange = 'transform, opacity';
        item.style.pointerEvents = 'none';

        const diamondImg = document.createElement('img');
        diamondImg.src = 'assets/general/diamond.webp';
        diamondImg.className = 'floating-diamond-img';

        const textSpan = document.createElement('span');
        textSpan.className = 'floating-diamond-text';
        textSpan.textContent = '+' + this.formatNumber(amount);

        item.appendChild(diamondImg);
        item.appendChild(textSpan);
        container.appendChild(item);

        // Generate curved trajectory keyframes to top-right diamond counter
        const frames = [];
        const steps = 28;
        const spreadX = (Math.random() - 0.5) * 16;
        const peakX = startX + spreadX;
        const peakY = startY - 45;

        // Quadratic bezier control point for outward curving flight
        const curveOffset = (peakX < targetX) ? -30 : 30;
        const cpX = peakX + (targetX - peakX) * 0.25 + curveOffset;
        const cpY = Math.min(peakY, targetY + (peakY - targetY) * 0.35);

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            let x, y, scale, opacity;

            if (t < 0.22) {
                const p = t / 0.22;
                const easeP = Math.sin(p * Math.PI / 2);
                x = startX + spreadX * easeP;
                y = startY - 45 * easeP;
                scale = 0.65 + 0.5 * easeP; // 0.65 -> 1.15
                opacity = Math.min(1, p * 2.5);
            } else {
                const p = (t - 0.22) / 0.78;
                // Ease-in acceleration into the counter
                const easeP = p * p * (3 - 2 * p);
                const u = easeP;
                const invU = 1 - u;
                x = invU * invU * peakX + 2 * invU * u * cpX + u * u * targetX;
                y = invU * invU * peakY + 2 * invU * u * cpY + u * u * targetY;
                scale = 1.15 - 0.65 * u; // 1.15 -> 0.5
                opacity = u > 0.85 ? (1 - (u - 0.85) / 0.15) : 1;
            }

            frames.push({
                transform: `translate(calc(${x.toFixed(1)}px - 50%), calc(${y.toFixed(1)}px - 50%)) scale(${scale.toFixed(3)})`,
                opacity: opacity.toFixed(3)
            });
        }

        const anim = item.animate(frames, {
            duration: 800,
            easing: 'linear',
            fill: 'forwards'
        });

        this.activeEffectCount++;
        this.pendingDiamondDisplayAmount = (this.pendingDiamondDisplayAmount || 0) + amount;
        this.updateDiamondCounter();

        const flightEpoch = this._currencyFlightEpoch || 0;
        let isCleanedUp = false;
        const cleanup = () => {
            if (isCleanedUp) return;
            isCleanedUp = true;
            try { anim.cancel(); } catch (e) {}
            if (item.parentNode) {
                item.parentNode.removeChild(item);
            }
            if ((this._currencyFlightEpoch || 0) !== flightEpoch) return;
            this.activeEffectCount = Math.max(0, this.activeEffectCount - 1);
            this.pendingDiamondDisplayAmount = Math.max(0, (this.pendingDiamondDisplayAmount || 0) - amount);
            this.updateDiamondCounter();
            // Flash diamond counter in green on arrival
            this.flashDiamondAmount('green');
        };

        anim.onfinish = cleanup;
        anim.oncancel = cleanup;
        setTimeout(cleanup, 900);
    }

    getHelperCategoryForLevel(level = this.currentLevel) {
        switch (level) {
            case 'moon':
                return 'moonHelpers';
            case 'mars':
                return 'marsHelpers';
            case 'jupiter':
                return 'jupiterHelpers';
            case 'titan':
                return 'titanHelpers';
            default:
                return 'helpers';
        }
    }

    getHelperArrayForLevel(level = this.currentLevel) {
        switch (level) {
            case 'moon':
                return this.moonHelpers;
            case 'mars':
                return this.marsHelpers;
            case 'jupiter':
                return this.jupiterHelpers;
            case 'titan':
                return this.titanHelpers;
            default:
                return this.helpers;
        }
    }

    buyHelper(helperType) {
        if (this.isCutscenePlaying || this.isStoryOpen) return false;
        if (this.isWorldHelperAvailable?.(helperType) === false) return false;

        if (!this._bulkBuying) {
        console.log('=== buyHelper called ===');
        console.log('Helper type:', helperType);
        console.log('isPlacingHelpers:', this.isPlacingHelpers);
        console.log('Current placementQueue length:', this.placementQueue?.length || 0);
        console.log('helpersOnCursor length:', this.helpersOnCursor?.length || 0);
        console.log('Current level:', this.currentLevel);
        console.log('Stack trace:', new Error().stack);
        }

        const helperCategory = this.getHelperCategoryForLevel();
        const helperData = window.shopManager?.shopData?.[helperCategory]?.[helperType];
        if (!helperData) {
            console.error('Helper type not found:', helperType, 'in category', helperCategory);
            return false;
        }

        if (this.currentLevel === 'moon' && helperType !== 'moonBase') {
            const hasMoonBase = (this.moonHelpers || []).some(h => h.type === 'moonBase');
            if (!hasMoonBase) {
                this.showNotification?.('LOCKED: Requires Moon Base');
                return false;
            }
        }

        if (this.currentLevel === 'mars' && helperType !== 'marsBase') {
            const hasMarsBase = (this.marsHelpers || []).some(h => h.type === 'marsBase');
            if (!hasMarsBase) {
                this.showNotification?.('LOCKED: Requires Mars Base');
                return false;
            }

            // Jupiter Rocket requires Space Bass
            if (helperType === 'jupiterRocket') {
                const hasSpaceBass = (this.marsHelpers || []).some(h => h.type === 'spaceBass');
                if (!hasSpaceBass) {
                    this.showNotification?.('LOCKED: Requires Space Bass');
                    return false;
                }
            }
        }

        if (this.currentLevel === 'jupiter' && helperType !== 'cloudBase') {
            const hasCloudBase = (this.jupiterHelpers || []).some(h => h.type === 'cloudBase');
            if (!hasCloudBase) {
                this.showNotification?.('LOCKED: Requires Cloud Base');
                return false;
            }
        }

        if (this.currentLevel === 'titan' && helperType !== 'titanBase') {
            const hasTitanBase = (this.titanHelpers || []).some(h => h.type === 'titanBase');
            if (!hasTitanBase) {
                this.showNotification?.('LOCKED: Requires Titan Base');
                return false;
            }
        }

        const helperArray = this.getHelperArrayForLevel();
        const owned = helperArray.filter(h => h.type === helperType).length;
        const cost = this.getHelperCost(helperData.baseCost, owned, helperType);

        if (this.dogecoins < cost) {
            return false;
        }

        this.dogecoins -= cost;
        if (!this._bulkBuying) this.flashDogecoinAmount('red');

        if (window.audioManager && !this._bulkBuying) {
            window.audioManager.playSound('ching');
        }

        const purchasedHelper = {
            type: helperType,
            helper: helperData,
            dps: helperData.baseDps,
            name: this.getHelperName(helperType)
        };
        helperArray.push(purchasedHelper);

        // Recalculate total DPS with the newly purchased helper counted.
        if (!this._bulkBuying) this.updateDPS();

        this.addHelperToCursor(helperType, helperData, true, purchasedHelper);
        if (!this._bulkBuying) { this.updateShopPrices(); this.updateUI(); }

        if (window.uiManager && !this._bulkBuying) {
            const level = this.currentLevel;
            const hasPlayedMoonLaunch = this.hasPlayedMoonLaunch;

            uiManager.updateBackground?.(level);
            uiManager.initializePlanetTabs?.();

            if (hasPlayedMoonLaunch) {
                uiManager.hideMoonLocked?.();
            }

            requestAnimationFrame(() => {
                uiManager.updateShopContent?.();
            });
        }

        return true;
    }

    addHelperToCursor(helperType, helper, shouldStartPlacement = true, ownedEntry = null) {
        // Check if on mobile - auto-place helpers instead of manual placement
        const isMobile = window.innerWidth <= 768;

        if (isMobile && shouldStartPlacement) {
            // Auto-place helper around Doge on mobile
            this.autoPlaceHelperMobile(helperType, helper);
            return;
        }

        // Calculate random offsets for this helper's position in the stack
        const index = this.helpersOnCursor.length;
        let randomOffsetX = 0;
        let randomOffsetY = 0;

        // Only add random offsets for helpers beyond the first one
        if (index > 0) {
            randomOffsetX = (Math.random() - 0.5) * 8;
            randomOffsetY = (Math.random() - 0.5) * 6;
        }

        // Add helper to the cursor stack with pre-calculated random offsets
        this.helpersOnCursor.push({
            type: helperType,
            helper: helper,
            dps: helper.baseDps,
            name: ownedEntry?.name || helper.name || this.getHelperName(helperType),
            randomOffsetX: randomOffsetX,
            randomOffsetY: randomOffsetY
        });

        // If this is the first helper, start the placement system
        // But only if shouldStartPlacement is true (not for drag-and-drop)
        console.log('helpersOnCursor.length:', this.helpersOnCursor.length, 'isPlacingHelpers:', this.isPlacingHelpers, 'shouldStartPlacement:', shouldStartPlacement);
        if (this.helpersOnCursor.length === 1 && shouldStartPlacement) {
            this.startHelperPlacement();
        } else {
            // Update the existing cursor sprites to show the new stack
            this.updateCursorSprites();
        }
    }

    // Auto-place helper for mobile users - adds to grouped helper bar
    autoPlaceHelperMobile(helperType, helper) {
        // On mobile, we don't place individual sprites around Doge
        // Instead, we track helper counts and update the grouped helper bar

        // The helper is already added to the helpers array in buyHelper()
        if (this._bulkBuying) return;
        // Just update DPS, UI, and the mobile helper bar
        this.updateDPS();
        this.updateUI();
        this.updateMobileHelperBar();

        console.log(`[Mobile] Added ${helperType} to helper bar`);

        // Check for spaceRocket to trigger moon cutscene
        if (helperType === 'spaceRocket' && !this.hasPlayedMoonLaunch) {
            setTimeout(() => {
                this.playMoonLaunchCutscene();
            }, 200);
        }
    }

    // Update the mobile helper bar with grouped helper counts
    updateMobileHelperBar() {
        const helperBar = document.getElementById('mobile-helper-bar');
        if (!helperBar) return;
        if (!this.isMobileDevice()) {
            if (this.mobileHelperAnimationInterval) clearInterval(this.mobileHelperAnimationInterval);
            this.mobileHelperAnimationInterval = null;
            window.DogeMinerFieldPersonality?.clearMobile(this);
            return;
        }

        // Get current level's helper array and shop data
        const helperArray = this.getHelperArrayForLevel();
        const helperCategory = this.getHelperCategoryForLevel();
        const shopData = window.shopManager?.shopData?.[helperCategory];

        if (!shopData) return;

        // Count helpers by type
        const helperCounts = {};
        helperArray.forEach(helper => {
            helperCounts[helper.type] = (helperCounts[helper.type] || 0) + 1;
        });

        // Determine valid categories for current level
        const validCategories = this.getValidHelperCategories();

        // Get all helper types from shop
        const allHelperTypes = Object.keys(shopData);

        // 1. Identify valid types for current view
        const validTypes = allHelperTypes.filter(type => {
            const data = shopData[type];
            return data && (!data.category || validCategories.includes(data.category));
        });

        // 2. Remove invalid items from DOM (cleanup old planet helpers)
        Array.from(helperBar.children).forEach(child => {
            if (!validTypes.includes(child.dataset.helperType)) {
                child.remove();
            }
        });

        // 3. Update or create items
        validTypes.forEach(helperType => {
            const count = helperCounts[helperType] || 0;
            const helperData = shopData[helperType];

            // Calculate cost for next purchase
            const nextCost = this.getHelperCost(helperData.baseCost, count, helperType);
            const canAfford = this.dogecoins >= nextCost;

            // Check if item exists
            let item = helperBar.querySelector(`.mobile-helper-item[data-helper-type="${helperType}"]`);
            let isNew = false;

            if (!item) {
                isNew = true;
                // Create helper item container
                item = document.createElement('div');
                item.className = 'mobile-helper-item';
                item.dataset.helperType = helperType;

                // Create count badge
                const countBadge = document.createElement('span');
                countBadge.className = 'mobile-helper-count';

                // Create helper icon
                const icon = document.createElement('img');
                icon.className = 'mobile-helper-icon';

                // Get upgrade-aware sprites
                const upgradeLevel = this.helperUpgradeLevels[helperType] || 0;
                const spritePaths = this.getHelperSpritePaths(helperType, upgradeLevel);
                const idleSprite = spritePaths?.idle || helperData.icon;
                const miningSprite = spritePaths?.mining || helperData.miningSprite || helperData.icon;

                // Store sprites for animation
                icon.dataset.idleSrc = idleSprite;
                icon.dataset.miningSrc = miningSprite;
                icon.dataset.isMining = 'false';
                // Set initial source
                icon.src = idleSprite;
                icon.alt = helperData.name || helperType;

                item.appendChild(countBadge);
                item.appendChild(icon);
                helperBar.appendChild(item);

                // Add tap handler to open shop and scroll to this helper
                item.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent ensuring container click doesn't close it instantly
                    this.openMobileShopToHelper(helperType);
                });
            }

            // Update content (for both new and existing items)

            // Update affordability class
            if (canAfford) {
                item.classList.add('affordable');
            } else {
                item.classList.remove('affordable');
            }

            // Update count text
            const badge = item.querySelector('.mobile-helper-count');
            if (badge) {
                badge.textContent = count;
            }

            // Update sprites for existing items (in case of upgrade)
            if (!isNew) {
                const icon = item.querySelector('.mobile-helper-icon');
                if (icon && !icon.classList.contains('helper-upgrade-transforming')) {
                    const upgradeLevel = this.helperUpgradeLevels[helperType] || 0;
                    const spritePaths = this.getHelperSpritePaths(helperType, upgradeLevel);
                    const idleSprite = spritePaths?.idle || helperData.icon;
                    const miningSprite = spritePaths?.mining || helperData.miningSprite || helperData.icon;

                    icon.dataset.idleSrc = idleSprite;
                    icon.dataset.miningSrc = miningSprite;
                    // Update current src based on mining state
                    const currentSprite = icon.dataset.isMining === 'true' ? miningSprite : idleSprite;
                    if (icon.getAttribute('src') !== currentSprite) icon.src = currentSprite;
                }
            }
        });

        // Add click listener to the bar itself to open menu if clicking empty space
        if (!helperBar.dataset.hasClickListener) {
            helperBar.addEventListener('click', () => {
                if (window.uiManager && !uiManager.mobileMenuOpen) {
                    uiManager.toggleMobileMenu();
                    uiManager.switchMobileTab('shop');
                }
            });
            helperBar.dataset.hasClickListener = 'true';
        }

        // Start animation loop if not already running
        this.startMobileHelperAnimations();
    }

    startMobileHelperAnimations() {
        window.DogeMinerFieldPersonality?.syncMobile(this);
    }

    // Get valid helper categories for current level
    getValidHelperCategories() {
        switch (this.currentLevel) {
            case 'moon':
                return ['moon'];
            case 'mars':
                return ['mars'];
            case 'jupiter':
                return ['jupiter'];
            case 'titan':
                return ['titan'];
            default: // Earth
                return ['basic', 'advanced'];
        }
    }

    // Open mobile shop pull-up menu and scroll to specific helper
    openMobileShopToHelper(helperType) {
        // Open the pull-up menu if not already open
        if (window.uiManager && !uiManager.mobileMenuOpen) {
            uiManager.toggleMobileMenu();
        }

        // Switch to shop tab
        if (window.uiManager) {
            uiManager.switchMobileTab('shop');
        }

        // After a short delay for menu to open, scroll to the helper
        setTimeout(() => {
            const helperElement = document.querySelector(`[data-helper-type="${helperType}"]`);
            if (helperElement) {
                helperElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Flash highlight effect
                helperElement.style.animation = 'pulse 0.5s ease 2';
                setTimeout(() => {
                    helperElement.style.animation = '';
                }, 1000);
            }
        }, 350);
    }

    startHelperPlacement() {
        // Set flag to prevent drag-and-drop during placement
        console.log('=== Starting helper placement ===');
        console.log('Queue length before placement:', this.placementQueue?.length || 0);
        console.log('helpersOnCursor length:', this.helpersOnCursor?.length || 0);
        console.log('Setting isPlacingHelpers to true');
        this.isPlacingHelpers = true;

        // Create sprites for all helpers on cursor
        this.createCursorSprites();

        // Add mouse move and click listeners for placement
        this.addHelperPlacementListeners();
    }

    createCursorSprites() {
        // Clear any existing cursor sprites
        this.clearCursorSprites();

        // Get current mouse position for initial positioning
        const leftPanel = document.getElementById('left-panel');
        const rect = leftPanel.getBoundingClientRect();

        // Create sprites for each helper on cursor with stacking offset
        this.helpersOnCursor.forEach((helperData, index) => {
            // Get upgrade-level sprite for this helper type
            const upgradeLevel = this.helperUpgradeLevels?.[helperData.type] || 0;
            const spritePaths = this.getHelperSpritePaths(helperData.type, upgradeLevel);

            const helperSprite = document.createElement('img');
            helperSprite.src = spritePaths.idle || helperData.helper.icon;
            helperSprite.className = 'helper-sprite attached-to-mouse';
            helperSprite.style.opacity = '0.7';
            helperSprite.dataset.stackIndex = index;

            // Add special classes for different helper types
            if (helperData.type === 'spaceRocket') {
                helperSprite.classList.add('rocket');
            } else if (helperData.type === 'miningShibe' || helperData.type === 'moonShibe' || helperData.type === 'partyShibe' || helperData.type === 'roboShibe') {
                helperSprite.classList.add('shibe');
            } else if (helperData.type === 'infiniteDogebility') {
                helperSprite.classList.add('dogebility');
            } else if (helperData.type === 'moonBase') {
                helperSprite.classList.add('moon-base');
            } else if (helperData.type === 'marsBase') {
                helperSprite.classList.add('mars-base');
            } else if (helperData.type === 'cloudBase') {
                helperSprite.classList.add('jupiter-base');
                helperSprite.classList.add('cloud-base');
            } else if (helperData.type === 'dogeAirShip') {
                helperSprite.classList.add('doge-air-ship');
            } else if (helperData.type === 'flyingDoggo') {
                helperSprite.classList.add('flying-doggo');
            } else if (helperData.type === 'superShibe') {
                helperSprite.classList.add('super-shibe');
            } else if (helperData.type === 'tardogeis') {
                helperSprite.classList.add('tardogeis');
            } else if (helperData.type === 'dogeStar') {
                helperSprite.classList.add('dogestar');
            } else if (helperData.type === 'marsRocket') {
                helperSprite.classList.add('mars-rocket');
            } else if (helperData.type === 'landerShibe') {
                helperSprite.classList.add('lander-shibe');
            } else if (helperData.type === 'titanBase') {
                helperSprite.classList.add('titan-base');
            } else if (helperData.type === 'altarOfTheSunDoge') {
                helperSprite.classList.add('altar-of-sundoge');
            } else if (helperData.type === 'timeTravelDRex') {
                helperSprite.classList.add('time-travel-drex');
            }

            // Position the sprite immediately at current cursor position
            let helperSize = 60;
            if (helperSprite.classList.contains('shibe')) {
                helperSize = 30;
            } else if (helperSprite.classList.contains('moon-base') || helperSprite.classList.contains('lander-shibe') || helperSprite.classList.contains('mars-base') || helperSprite.classList.contains('titan-base') || helperSprite.classList.contains('altar-of-sundoge')) {
                helperSize = 90; // 1.5x helpers
            } else if (helperSprite.classList.contains('dogebility')) {
                helperSize = 69;
            } else if (helperSprite.classList.contains('time-travel-drex')) {
                helperSize = 72; // 1.2x helper
            }
            const offset = helperSize / 2;

            let stackOffsetX = 0;
            let stackOffsetY = 0;

            // Only add stacking offset for helpers beyond the first one
            if (index > 0) {
                // Create loose horizontal formation with max 2 rows
                const helpersPerRow = 8; // More helpers per row for looser feel
                const row = Math.floor(index / helpersPerRow);
                const col = index % helpersPerRow;
                const spacing = 15; // Closer horizontal spacing
                const rowSpacing = 20; // Closer vertical spacing

                // Use pre-calculated random offsets to prevent jiggling
                const randomOffsetX = helperData.randomOffsetX;
                const randomOffsetY = helperData.randomOffsetY;

                stackOffsetX = (col - (helpersPerRow - 1) / 2) * spacing + randomOffsetX;
                stackOffsetY = row * rowSpacing + randomOffsetY;
            }

            // Position relative to left panel, centered on current cursor position
            const x = this.mouseX - rect.left - offset + stackOffsetX;
            const y = this.mouseY - rect.top - offset + stackOffsetY;

            helperSprite.style.left = x + 'px';
            helperSprite.style.top = y + 'px';

            document.getElementById('helper-container').appendChild(helperSprite);
        });
    }

    updateCursorSprites() {
        // Recreate all cursor sprites to show the updated stack
        this.createCursorSprites();
    }

    clearCursorSprites() {
        // Remove all existing cursor sprites
        const existingSprites = document.querySelectorAll('.helper-sprite.attached-to-mouse');
        existingSprites.forEach(sprite => sprite.remove());
    }

    addHelperPlacementListeners() {
        const handleMouseMove = (e) => {
            if (this.helpersOnCursor.length > 0) {
                const leftPanel = document.getElementById('left-panel');
                const rect = leftPanel.getBoundingClientRect();

                // Update position of all cursor sprites with stacking offset
                const cursorSprites = document.querySelectorAll('.helper-sprite.attached-to-mouse');
                cursorSprites.forEach((sprite, index) => {
                    let helperSize = 60;
                    if (sprite.classList.contains('shibe')) {
                        helperSize = 30;
                    } else if (sprite.classList.contains('moon-base') || sprite.classList.contains('lander-shibe') || sprite.classList.contains('titan-base') || sprite.classList.contains('altar-of-sundoge')) {
                        helperSize = 90; // 1.5x helpers
                    } else if (sprite.classList.contains('dogebility')) {
                        helperSize = 69;
                    } else if (sprite.classList.contains('time-travel-drex')) {
                        helperSize = 72; // 1.2x helper
                    }
                    const offset = helperSize / 2; // Center the sprite

                    let stackOffsetX = 0;
                    let stackOffsetY = 0;

                    // Only add stacking offset for helpers beyond the first one
                    if (index > 0 && this.helpersOnCursor[index]) {
                        // Create loose horizontal formation to match cursor stacking
                        const helpersPerRow = 8; // More helpers per row for looser feel
                        const row = Math.floor(index / helpersPerRow);
                        const col = index % helpersPerRow;
                        const spacing = 15; // Closer horizontal spacing
                        const rowSpacing = 20; // Closer vertical spacing

                        // Use pre-calculated random offsets to prevent jiggling
                        const randomOffsetX = this.helpersOnCursor[index].randomOffsetX;
                        const randomOffsetY = this.helpersOnCursor[index].randomOffsetY;

                        stackOffsetX = (col - (helpersPerRow - 1) / 2) * spacing + randomOffsetX;
                        stackOffsetY = row * rowSpacing + randomOffsetY;
                    }

                    // Position relative to left panel, centered on cursor with bunch offset
                    const x = e.clientX - rect.left - offset + stackOffsetX;
                    const y = e.clientY - rect.top - offset + stackOffsetY;

                    sprite.style.left = x + 'px';
                    sprite.style.top = y + 'px';
                });
            }
        };

        const handleClick = (e) => {
            if (this.helpersOnCursor.length > 0) {
                const leftPanel = document.getElementById('left-panel');
                const rect = leftPanel.getBoundingClientRect();

                // Use the first helper's size for collision detection
                const firstHelper = this.helpersOnCursor[0];
                let helperSize = 60;
                if (firstHelper.type === 'miningShibe' || firstHelper.type === 'moonShibe' || firstHelper.type === 'partyShibe' || firstHelper.type === 'roboShibe') {
                    helperSize = 30;
                } else if (firstHelper.type === 'moonBase' || firstHelper.type === 'landerShibe' || firstHelper.type === 'titanBase' || firstHelper.type === 'altarOfTheSunDoge') {
                    helperSize = 90; // 1.5x helpers
                } else if (firstHelper.type === 'infiniteDogebility') {
                    helperSize = 69;
                } else if (firstHelper.type === 'timeTravelDRex') {
                    helperSize = 72; // 1.2x helper
                }
                const offset = helperSize / 2;

                // Use the same positioning logic as mouse move
                const x = e.clientX - rect.left - offset;
                const y = e.clientY - rect.top - offset;

                // Check if position is valid (not overlapping with existing helpers or mining area)
                if (this.isValidHelperPosition(x, y, helperSize)) {
                    this.placeAllHelpersOnCursor(x, y);
                }
            }
        };

        const handleRightClick = (e) => {
            e.preventDefault();
            this.cancelHelperPlacement();
        };

        // Touch event handlers for mobile support
        const handleTouchMove = (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
            }
        };

        const handleTouchEnd = (e) => {
            if (e.changedTouches.length > 0) {
                const touch = e.changedTouches[0];
                handleClick({ clientX: touch.clientX, clientY: touch.clientY });
            }
        };

        // Add listeners (both mouse and touch)
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('click', handleClick);
        document.addEventListener('contextmenu', handleRightClick);
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);

        // Store references for cleanup
        this.placementListeners = {
            mousemove: handleMouseMove,
            click: handleClick,
            contextmenu: handleRightClick,
            touchmove: handleTouchMove,
            touchend: handleTouchEnd
        };
    }

    placeAllHelpersOnCursor(x, y) {
        // First, calculate all helper positions in the stack
        const helperPositions = [];
        let shouldPlayMoonLaunch = false;
        this.helpersOnCursor.forEach((helperData, index) => {
            let placeX = x;
            let placeY = y;

            // Only add stacking offset for helpers beyond the first one
            if (index > 0) {
                // Create loose horizontal formation to match cursor stacking
                const helpersPerRow = 8; // More helpers per row for looser feel
                const row = Math.floor(index / helpersPerRow);
                const col = index % helpersPerRow;
                const spacing = 15; // Closer horizontal spacing
                const rowSpacing = 20; // Closer vertical spacing

                // Use pre-calculated random offsets to match cursor positioning
                const randomOffsetX = helperData.randomOffsetX || 0;
                const randomOffsetY = helperData.randomOffsetY || 0;

                placeX = x + (col - (helpersPerRow - 1) / 2) * spacing + randomOffsetX;
                placeY = y + row * rowSpacing + randomOffsetY;
            }

            helperPositions.push({
                x: placeX,
                y: placeY,
                type: helperData.type
            });
            if (helperData.type === 'spaceRocket' && !this.hasPlayedMoonLaunch) {
                shouldPlayMoonLaunch = true;
            }
        });

        // Check if the entire stack collides with Doge and find the best direction to move
        const stackAdjustment = this.adjustStackForDogeCollision(helperPositions);

        // Apply stack adjustment to all helper positions
        helperPositions.forEach((pos, index) => {
            pos.x += stackAdjustment.x;
            pos.y += stackAdjustment.y;
        });

        // Check boundaries and adjust positions to keep helpers within the panel
        this.adjustStackForBoundaries(helperPositions);

        // Place all helpers with adjustments applied
        this.helpersOnCursor.forEach((helperData, index) => {
            let placeX = helperPositions[index].x;
            let placeY = helperPositions[index].y;

            // Create the placed helper object
            const placedHelper = {
                ...helperData,
                x: placeX,
                y: placeY,
                id: Date.now() + Math.random() + index, // Unique ID
                isMining: false,
                name: helperData.name || this.getHelperName(helperData.type)
            };

            // Add to placed helpers array
            this.placedHelpers.push(placedHelper);

            // Create the actual helper sprite
            this.createHelperSprite(placedHelper);
        });

        // Clear the cursor stack
        console.log('Clearing helpersOnCursor after successful placement, length was:', this.helpersOnCursor.length);
        this.helpersOnCursor = [];
        this.clearCursorSprites();

        // Clean up placement listeners
        this.finishHelperPlacement();

        // Clear placement flag
        console.log('Clearing isPlacingHelpers flag after successful placement (first)');
        // Don't clear here - let finishHelperPlacement handle it

        // Update UI and DPS
        this.updateDPS();
        this.updateUI();
        this.updateShopPrices();

        if (shouldPlayMoonLaunch) {
            // Allow placement animations/UI updates to settle before playing the cutscene
            setTimeout(() => {
                this.playMoonLaunchCutscene();
            }, 200);
        }
    }

    updateHelperSpritesByType(helperType) {
        console.log('=== updateHelperSpritesByType ===');
        console.log('helperType:', helperType);
        console.log('placedHelpers length:', this.placedHelpers?.length);
        console.log('helperUpgradeLevels:', JSON.stringify(this.helperUpgradeLevels));

        let foundCount = 0;
        let matchCount = 0;

        // Iterate through all placed helpers to find matching types
        this.placedHelpers.forEach((placedHelper, index) => {
            console.log(`Helper ${index}: type=${placedHelper.type}, id=${placedHelper.id}, isMining=${placedHelper.isMining}`);
            if (placedHelper.type === helperType) {
                matchCount++;
                const helperSprite = document.querySelector(`img[data-helper-id="${placedHelper.id}"]`);
                console.log(`  Match found! Sprite element:`, helperSprite);
                if (helperSprite) {
                    foundCount++;
                    console.log(`  Current src: ${helperSprite.src}`);
                    console.log(`  Animation interval: ${helperSprite.dataset.animationInterval}`);

                    // Stop existing animation
                    this.stopHelperAnimation(helperSprite);
                    console.log(`  After stop - interval: ${helperSprite.dataset.animationInterval}`);

                    // Get new sprite path based on current upgrade level
                    const upgradeLevel = this.helperUpgradeLevels?.[helperType] || 0;
                    const spritePaths = this.getHelperSpritePaths(helperType, upgradeLevel);
                    console.log(`  New upgrade level: ${upgradeLevel}`);
                    console.log(`  New sprite paths:`, spritePaths);

                    // Update sprite source
                    helperSprite.src = spritePaths.idle;
                    console.log(`  Set src to: ${spritePaths.idle}`);

                    // Restart animation loop with new sprites if it was mining
                    if (placedHelper.isMining) {
                        console.log(`  Restarting animation (isMining=true)`);
                        this.startHelperAnimation(placedHelper, helperSprite);
                        console.log(`  After restart - interval: ${helperSprite.dataset.animationInterval}`);
                    } else {
                        console.log(`  NOT restarting animation (isMining=false)`);
                    }
                } else {
                    console.log(`  WARNING: Could not find sprite element!`);
                }
            }
        });

        console.log(`Summary: ${matchCount} matches, ${foundCount} sprites found`);

    }

    adjustStackForDogeCollision(helperPositions) {
        const leftPanel = document.getElementById('left-panel');
        if (!leftPanel) return { x: 0, y: 0 };
        const panelRect = leftPanel.getBoundingClientRect();

        const miningArea = document.getElementById('mining-area');
        let areaLeft, areaRight, areaTop, areaBottom;

        if (miningArea) {
            const mRect = miningArea.getBoundingClientRect();
            areaLeft = mRect.left - panelRect.left - 15;
            areaRight = mRect.right - panelRect.left + 15;
            areaTop = mRect.top - panelRect.top - 15;
            areaBottom = mRect.bottom - panelRect.top + 15;
        } else {
            const dogeX = (panelRect.width / 2) - 20;
            const dogeY = (panelRect.height / 2) + 50;
            areaLeft = dogeX - 100;
            areaRight = dogeX + 100;
            areaTop = dogeY - 80;
            areaBottom = dogeY + 80;
        }

        let hasCollision = false;
        let minMoveLeft = 0;
        let minMoveRight = 0;
        let minMoveUp = 0;
        let minMoveDown = 0;

        helperPositions.forEach((pos) => {
            const helperSize = pos.type === 'miningShibe' ? 30 : 60;
            const helperLeft = pos.x;
            const helperRight = pos.x + helperSize;
            const helperTop = pos.y;
            const helperBottom = pos.y + helperSize;

            if (helperRight > areaLeft && helperLeft < areaRight &&
                helperBottom > areaTop && helperTop < areaBottom) {

                hasCollision = true;

                const moveLeft = Math.abs(helperRight - areaLeft) + 15;
                const moveRight = Math.abs(areaRight - helperLeft) + 15;
                const moveUp = Math.abs(helperBottom - areaTop) + 15;
                const moveDown = Math.abs(areaBottom - helperTop) + 15;

                minMoveLeft = Math.max(minMoveLeft, moveLeft);
                minMoveRight = Math.max(minMoveRight, moveRight);
                minMoveUp = Math.max(minMoveUp, moveUp);
                minMoveDown = Math.max(minMoveDown, moveDown);
            }
        });

        if (hasCollision) {
            const minMovement = Math.min(minMoveLeft, minMoveRight, minMoveUp, minMoveDown);
            if (minMovement === minMoveLeft) {
                return { x: -minMoveLeft, y: 0 };
            } else if (minMovement === minMoveRight) {
                return { x: minMoveRight, y: 0 };
            } else if (minMovement === minMoveUp) {
                return { x: 0, y: -minMoveUp };
            } else {
                return { x: 0, y: minMoveDown };
            }
        }
        return { x: 0, y: 0 };
    }

    adjustStackForBoundaries(helperPositions) {
        const leftPanel = document.getElementById('left-panel');
        if (!leftPanel) return;
        const panelRect = leftPanel.getBoundingClientRect();

        const panelLeft = 10;
        const panelRight = panelRect.width - 10;
        const panelTop = 10;
        const panelBottom = panelRect.height - 10;

        let minAdjustX = 0;
        let minAdjustY = 0;
        let maxNegativeAdjustX = 0;
        let maxNegativeAdjustY = 0;

        helperPositions.forEach((pos) => {
            const helperSize = pos.type === 'miningShibe' ? 30 : 60;
            const helperLeft = pos.x;
            const helperRight = pos.x + helperSize;
            const helperTop = pos.y;
            const helperBottom = pos.y + helperSize;

            if (helperLeft < panelLeft) {
                minAdjustX = Math.max(minAdjustX, panelLeft - helperLeft);
            }
            if (helperRight > panelRight) {
                maxNegativeAdjustX = Math.min(maxNegativeAdjustX, panelRight - helperRight);
            }
            if (helperTop < panelTop) {
                minAdjustY = Math.max(minAdjustY, panelTop - helperTop);
            }
            if (helperBottom > panelBottom) {
                maxNegativeAdjustY = Math.min(maxNegativeAdjustY, panelBottom - helperBottom);
            }
        });

        const finalAdjustX = minAdjustX + maxNegativeAdjustX;
        const finalAdjustY = minAdjustY + maxNegativeAdjustY;

        helperPositions.forEach((pos) => {
            pos.x += finalAdjustX;
            pos.y += finalAdjustY;
        });
    }

    adjustPositionForDogeCollision(x, y, helperType) {
        // Get Doge's position and size
        const leftPanel = document.getElementById('left-panel');
        const panelRect = leftPanel.getBoundingClientRect();

        // Doge is centered in the mining area
        // Mining area is positioned at calc(50% + 50px) from top and calc(50% - 20px) from left
        const dogeX = (panelRect.width / 2) - 20; // Center minus 20px offset
        const dogeY = (panelRect.height / 2) + 50; // Center plus 50px offset
        const dogeWidth = 120; // Doge width from CSS
        const dogeHeight = 120; // Approximate height (assuming square-ish)

        // Get helper size
        const helperSize = helperType === 'miningShibe' ? 30 : 60;

        // Check if helper overlaps with Doge
        const helperLeft = x;
        const helperRight = x + helperSize;
        const helperTop = y;
        const helperBottom = y + helperSize;

        const dogeLeft = dogeX - dogeWidth / 2;
        const dogeRight = dogeX + dogeWidth / 2;
        const dogeTop = dogeY - dogeHeight / 2;
        const dogeBottom = dogeY + dogeHeight / 2;

        // Check for collision
        if (helperRight > dogeLeft && helperLeft < dogeRight &&
            helperBottom > dogeTop && helperTop < dogeBottom) {

            // Calculate distances to edges to find the best direction to move
            const distanceLeft = Math.abs(helperRight - dogeLeft);
            const distanceRight = Math.abs(helperLeft - dogeRight);
            const distanceTop = Math.abs(helperBottom - dogeTop);
            const distanceBottom = Math.abs(helperTop - dogeBottom);

            const minDistance = Math.min(distanceLeft, distanceRight, distanceTop, distanceBottom);

            // Move helper to the closest non-colliding position
            if (minDistance === distanceLeft) {
                // Move left
                x = dogeLeft - helperSize - 5; // 5px buffer
            } else if (minDistance === distanceRight) {
                // Move right
                x = dogeRight + 5; // 5px buffer
            } else if (minDistance === distanceTop) {
                // Move up
                y = dogeTop - helperSize - 5; // 5px buffer
            } else {
                // Move down
                y = dogeBottom + 5; // 5px buffer
            }
        }

        return { x, y };
    }

    isIndividualPositionValid(x, y, helperSize = 60) {
        const leftPanel = document.getElementById('left-panel');
        if (!leftPanel) return true;

        const margin = 10;
        if (x < margin || y < margin ||
            x + helperSize > leftPanel.offsetWidth - margin ||
            y + helperSize > leftPanel.offsetHeight - margin) {
            return false;
        }

        // Top-left HUD / Pickaxes / Fortunes buttons (approx 220px wide, 110px high)
        if (x < 220 && y < 110) {
            return false;
        }

        // Top-right HUD / Timeline / Diamonds (approx 220px wide from right edge, 75px high)
        if (x + helperSize > leftPanel.offsetWidth - 220 && y < 75) {
            return false;
        }

        // Mining Area (Doge & Rock)
        const miningArea = document.getElementById('mining-area');
        if (miningArea) {
            const mRect = miningArea.getBoundingClientRect();
            const pRect = leftPanel.getBoundingClientRect();
            const mLeft = mRect.left - pRect.left - 10;
            const mRight = mRect.right - pRect.left + 10;
            const mTop = mRect.top - pRect.top - 10;
            const mBottom = mRect.bottom - pRect.top + 10;

            if (x + helperSize > mLeft && x < mRight &&
                y + helperSize > mTop && y < mBottom) {
                return false;
            }
        }

        return true;
    }

    findNearestValidSpot(x, y, helperSize = 60) {
        if (this.isIndividualPositionValid(x, y, helperSize)) {
            return { x, y };
        }

        const maxSearchRadius = 350;
        const stepSize = 15;

        for (let radius = stepSize; radius <= maxSearchRadius; radius += stepSize) {
            for (let a = 0; a < 360; a += 30) {
                const rad = (a * Math.PI) / 180;
                const testX = x + Math.cos(rad) * radius;
                const testY = y + Math.sin(rad) * radius;

                if (this.isIndividualPositionValid(testX, testY, helperSize)) {
                    return { x: testX, y: testY };
                }
            }
        }

        const leftPanel = document.getElementById('left-panel');
        const pWidth = leftPanel ? leftPanel.offsetWidth : 600;
        const pHeight = leftPanel ? leftPanel.offsetHeight : 600;
        return { x: Math.max(20, pWidth - helperSize - 30), y: Math.max(20, pHeight - helperSize - 30) };
    }

    isValidHelperPosition(x, y, helperSize = 60) {
        const margin = 10;

        // Check bounds of left panel
        const leftPanel = document.getElementById('left-panel');
        if (x < margin || y < margin ||
            x + helperSize > leftPanel.offsetWidth - margin ||
            y + helperSize > leftPanel.offsetHeight - margin) {
            return false;
        }

        // Check if overlapping with mining area (character and rock)
        const miningArea = document.getElementById('mining-area');
        const miningRect = miningArea.getBoundingClientRect();
        const leftPanelRect = leftPanel.getBoundingClientRect();

        const miningX = miningRect.left - leftPanelRect.left;
        const miningY = miningRect.top - leftPanelRect.top;

        if (x + helperSize > miningX && x < miningX + miningRect.width &&
            y + helperSize > miningY && y < miningY + miningRect.height) {
            return false;
        }

        // Check if overlapping with existing helpers
        for (const placedHelper of this.placedHelpers) {
            const distance = Math.sqrt(
                Math.pow(x - placedHelper.x, 2) + Math.pow(y - placedHelper.y, 2)
            );
            if (distance < helperSize + margin) {
                return false;
            }
        }

        return true;
    }

    findValidPlacementSpot(x, y, helperSize = 60) {
        // First check if original position is valid
        if (this.isValidHelperPosition(x, y, helperSize)) {
            return { x, y };
        }

        // Search in spiral pattern
        const maxSearchRadius = 200; // Maximum distance to search
        const stepSize = 20; // Distance between search points

        for (let radius = stepSize; radius <= maxSearchRadius; radius += stepSize) {
            // Check 8 points at this radius (like a compass)
            const angles = [0, 45, 90, 135, 180, 225, 270, 315];
            for (const angleDeg of angles) {
                const angleRad = (angleDeg * Math.PI) / 180;
                const testX = x + Math.cos(angleRad) * radius;
                const testY = y + Math.sin(angleRad) * radius;

                if (this.isValidHelperPosition(testX, testY, helperSize)) {
                    return { x: testX, y: testY };
                }
            }
        }

        // If no valid spot found in spiral, try corners of the panel as fallback
        const leftPanel = document.getElementById('left-panel');
        if (leftPanel) {
            const margin = 20;
            const fallbackPositions = [
                { x: margin, y: margin },
                { x: leftPanel.offsetWidth - helperSize - margin, y: margin },
                { x: margin, y: leftPanel.offsetHeight - helperSize - margin },
                { x: leftPanel.offsetWidth - helperSize - margin, y: leftPanel.offsetHeight - helperSize - margin },
                { x: leftPanel.offsetWidth / 2 - helperSize / 2, y: margin },
                { x: leftPanel.offsetWidth / 2 - helperSize / 2, y: leftPanel.offsetHeight - helperSize - margin }
            ];

            for (const pos of fallbackPositions) {
                if (this.isValidHelperPosition(pos.x, pos.y, helperSize)) {
                    return pos;
                }
            }
        }

        console.warn('No valid placement spot found, using default position');
        return { x: 50, y: 450 };
    }

    placeHelper(x, y) {
        // Create the placed helper object
        const placedHelper = {
            ...this.helperBeingPlaced,
            x: x,
            y: y,
            id: Date.now() + Math.random(), // Unique ID
            isMining: false
        };

        // Add to placed helpers array
        this.placedHelpers.push(placedHelper);

        // Helper is already added to this.helpers array in buyHelper(), no need to add again

        // Create the actual helper sprite
        this.createHelperSprite(placedHelper);

        // Clean up placement
        this.finishHelperPlacement();

        // Clear placement flag
        console.log('Clearing isPlacingHelpers flag after successful placement (second)');
        // Don't clear here - let finishHelperPlacement handle it

        // Update DPS and UI
        this.updateDPS();
        this.updateUI();

        // Add mouse tracking for fly effect
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    }

    // Chromatic aberration effect for buy helper buttons
    createChromaticAberrationEffect(button) {
        const animationLib = window.gsap;
        if (!animationLib) {
            // GSAP unavailable – bail out gracefully so purchases still work
            return null;
        }
        // Simple and compatible chromatic aberration effect
        const tl = animationLib.timeline();

        // Get all elements within the button (including dogecoin logo and price text)
        const buttonElements = [button, ...button.querySelectorAll('*')];

        // Create the chromatic aberration effect using CSS filters and transforms
        tl.to(buttonElements, {
            filter: "hue-rotate(20deg) saturate(2) brightness(1.3) contrast(1.2)",
            transform: "scale(1.02)",
            duration: 0.08,
            ease: "power2.out"
        })
            .to(buttonElements, {
                filter: "hue-rotate(-20deg) saturate(1.5) brightness(1.1)",
                transform: "scale(0.98) translateX(2px)",
                duration: 0.06,
                ease: "power2.inOut"
            })
            .to(buttonElements, {
                filter: "hue-rotate(0deg) saturate(1) brightness(1)",
                transform: "scale(1) translateX(0px)",
                duration: 0.1,
                ease: "power2.out"
            });

        return tl;
    }


    getRandomMiningShibeName() {
        return this.miningShibeNames[Math.floor(Math.random() * this.miningShibeNames.length)];
    }

    getHelperName(helperType) {
        if (helperType === 'miningShibe' && this.miningShibeNames?.length) {
            return this.getRandomMiningShibeName();
        }
        const personal = window.DogeMinerHelperNames?.allocate(helperType);
        return personal || this.helperNames?.[helperType] || this.getHelperData(helperType)?.name || helperType;
    }

    createHelperSprite(placedHelper) {
        if (!placedHelper || !placedHelper.type) {
            console.error('Invalid helper data provided to createHelperSprite:', placedHelper);
            return;
        }

        // Make sure we have a valid helper reference
        if (!placedHelper.helper || !placedHelper.helper.icon) {
            // Try to get helper data based on current level and type
            const helperCategory = this.getHelperCategoryForLevel();
            if (window.shopManager && window.shopManager.shopData && window.shopManager.shopData[helperCategory]) {
                placedHelper.helper = window.shopManager.shopData[helperCategory][placedHelper.type] || this.getHelperData(placedHelper.type);
            } else {
                // Fallback to generic helper data
                placedHelper.helper = this.getHelperData(placedHelper.type);
            }
        }

        // Determine sprite path - use upgrade-level sprites for Earth helpers
        let spritePath = placedHelper.helper.icon;
        const upgradeLevel = this.helperUpgradeLevels?.[placedHelper.type] || 0;
        const spritePaths = this.getHelperSpritePaths(placedHelper.type, upgradeLevel);
        if (spritePaths && spritePaths.idle) {
            spritePath = spritePaths.idle;
        }

        const helperSprite = document.createElement('img');
        helperSprite.src = spritePath;
        helperSprite.className = 'helper-sprite';
        helperSprite.style.left = placedHelper.x + 'px';
        helperSprite.style.top = placedHelper.y + 'px';
        helperSprite.dataset.helperId = placedHelper.id;

        // Add special classes for different helper types
        if (placedHelper.type === 'spaceRocket') {
            helperSprite.classList.add('rocket');
        } else if (placedHelper.type === 'miningShibe' || placedHelper.type === 'moonShibe' || placedHelper.type === 'partyShibe' || placedHelper.type === 'roboShibe') {
            helperSprite.classList.add('shibe');
        } else if (placedHelper.type === 'infiniteDogebility') {
            helperSprite.classList.add('dogebility');
        } else if (placedHelper.type === 'moonBase') {
            helperSprite.classList.add('moon-base');
        } else if (placedHelper.type === 'marsRocket') {
            helperSprite.classList.add('mars-rocket');
        } else if (placedHelper.type === 'landerShibe') {
            helperSprite.classList.add('lander-shibe');
        } else if (placedHelper.type === 'marsBase') {
            helperSprite.classList.add('mars-base');
        } else if (placedHelper.type === 'cloudBase') {
            helperSprite.classList.add('jupiter-base');
            helperSprite.classList.add('cloud-base');
        } else if (placedHelper.type === 'dogeAirShip') {
            helperSprite.classList.add('doge-air-ship');
        } else if (placedHelper.type === 'flyingDoggo') {
            helperSprite.classList.add('flying-doggo');
        } else if (placedHelper.type === 'superShibe') {
            helperSprite.classList.add('super-shibe');
        } else if (placedHelper.type === 'tardogeis') {
            helperSprite.classList.add('tardogeis');
        } else if (placedHelper.type === 'dogeStar') {
            helperSprite.classList.add('dogestar');
        } else if (placedHelper.type === 'spaceBass') {
            helperSprite.classList.add('space-bass');
        } else if (placedHelper.type === 'jupiterRocket') {
            helperSprite.classList.add('jupiter-rocket');
        } else if (placedHelper.type === 'titanBase') {
            helperSprite.classList.add('titan-base');
        } else if (placedHelper.type === 'altarOfTheSunDoge') {
            helperSprite.classList.add('altar-of-sundoge');
        } else if (placedHelper.type === 'timeTravelDRex') {
            helperSprite.classList.add('time-travel-drex');
        }

        // Add bounce animation class
        helperSprite.classList.add('place-bounce');

        // Add placed-helper class to enable hover effects
        helperSprite.classList.add('placed-helper');

        // Add name tooltip as a separate element
        const nameTooltip = document.createElement('div');
        nameTooltip.className = 'helper-name-tooltip';
        let helperName = placedHelper.name
            || placedHelper.helper?.name
            || this.getHelperName(placedHelper.type);

        nameTooltip.textContent = helperName;
        nameTooltip.dataset.helperId = placedHelper.id;

        // Position tooltip relative to helper with dynamic centering
        let centerOffset = 30; // Default centering offset (half of 60px)
        let verticalOffset = 22; // Default vertical offset

        // Adjust centering and vertical positioning for different helper types
        if (placedHelper.type === 'infiniteDogebility') {
            centerOffset = 35; // Dogebility drive (69px): ~half width
        } else if (placedHelper.type === 'timeMachineRig') {
            centerOffset = 30;
        } else if (placedHelper.type === 'streamerKittens') {
            centerOffset = 30;
            verticalOffset = 18;
        } else if (placedHelper.type === 'spaceRocket' || placedHelper.type === 'marsRocket') {
            centerOffset = 30;
            verticalOffset = 10; // Rockets: moved up
        } else if (placedHelper.type === 'dogeKennels') {
            centerOffset = 30;
        } else if (placedHelper.type === 'miningShibe' || placedHelper.type === 'moonShibe' || placedHelper.type === 'partyShibe' || placedHelper.type === 'roboShibe') {
            centerOffset = 15; // Small shibes (30px): ~half width
        } else if (placedHelper.type === 'moonBase') {
            centerOffset = 45; // Moon Base (90px): ~half width
            verticalOffset = 30; // Larger helper needs more vertical offset
        } else if (placedHelper.type === 'landerShibe') {
            centerOffset = 45; // Lander Shibe (90px): ~half width
            verticalOffset = 28; // Larger helper needs more vertical offset
        } else if (placedHelper.type === 'marsBase') {
            centerOffset = 45; // Mars Base matches moon base sizing
            verticalOffset = 30;
        } else if (placedHelper.type === 'cloudBase') {
            centerOffset = 45; // Cloud Base uses 1.5x sizing
            verticalOffset = 30;
        } else if (placedHelper.type === 'superShibe' || placedHelper.type === 'tardogeis') {
            centerOffset = 36; // 1.2x helpers (72px)
            verticalOffset = 26;
        } else if (placedHelper.type === 'dogeStar') {
            centerOffset = 45; // DogeStar matches 90px sizing
            verticalOffset = 32;
        } else if (placedHelper.type === 'dogeCar') {
            centerOffset = 30;
            verticalOffset = 28; // Doge Car: needs more vertical offset
        } else if (placedHelper.type === 'titanBase' || placedHelper.type === 'altarOfTheSunDoge') {
            // Titan Base and Altar of SunDoge are 1.5x (90px)
            centerOffset = 45;
            verticalOffset = 30;
        } else if (placedHelper.type === 'timeTravelDRex') {
            // Time Travel D-Rex is 1.2x (72px)
            centerOffset = 36;
            verticalOffset = 26;
        }

        nameTooltip.style.left = (placedHelper.x + centerOffset) + 'px'; // Center horizontally
        nameTooltip.style.top = (placedHelper.y - verticalOffset) + 'px'; // Above the helper
        nameTooltip.style.transform = 'translateX(-50%)'; // Center the tooltip text


        document.getElementById('helper-container').appendChild(nameTooltip);

        document.getElementById('helper-container').appendChild(helperSprite);

        // Add drag-and-drop functionality
        this.addDragAndDropToHelper(helperSprite, placedHelper, nameTooltip);

        // Remove bounce animation class after animation completes
        setTimeout(() => {
            helperSprite.classList.remove('place-bounce');
        }, 600); // Match animation duration

        // Start mining animation after a short delay (only if not already mining from save load)
        if (!placedHelper.isMining) {
            setTimeout(() => {
                this.startHelperMining(placedHelper);
            }, 1000);
        }
    }

    addDragAndDropToHelper(helperSprite, placedHelper, nameTooltip) {
        let isDragging = false;
        let isGroupDragging = false;
        let hasMoved = false;
        let pickedUpHelper = null;
        let dragStartX = 0;
        let dragStartY = 0;
        let groupItems = [];

        helperSprite.style.cursor = 'grab';

        const startDrag = (e) => {
            if (this.isPlacingHelpers) {
                console.log('BLOCKED: Drag attempt during placement');
                if (e.preventDefault) e.preventDefault();
                return false;
            }

            const isMobile = this.isMobileDevice();
            const hId = placedHelper.id;
            const numId = Number(hId);
            const isAlreadyInGroup = this.selectedHelperIds && this.selectedHelperIds.size > 1 && (this.selectedHelperIds.has(hId) || (numId && this.selectedHelperIds.has(numId)));

            // Group drag ONLY if player has multi-selected 2+ helpers via marquee box
            if (!isMobile && e.clientX !== undefined && isAlreadyInGroup) {
                isGroupDragging = true;
                isDragging = true;
                hasMoved = false;
                dragStartX = e.clientX;
                dragStartY = e.clientY;
                groupItems = [];

                const processed = new Set();
                this.selectedHelperIds.forEach(id => {
                    const num = Number(id);
                    const ph = this.placedHelpers.find(p => p.id === id || p.id === num || String(p.id) === String(id));
                    if (ph && !processed.has(ph.id)) {
                        processed.add(ph.id);
                        const sprite = document.querySelector(`.helper-sprite[data-helper-id="${ph.id}"]`);
                        const tooltip = document.querySelector(`.helper-name-tooltip[data-helper-id="${ph.id}"]`);

                        let centerOffset = 30;
                        let verticalOffset = 22;
                        const t = ph.type;
                        if (t === 'infiniteDogebility') centerOffset = 35;
                        else if (t === 'streamerKittens') { centerOffset = 30; verticalOffset = 18; }
                        else if (t === 'spaceRocket' || t === 'marsRocket') { centerOffset = 30; verticalOffset = 10; }
                        else if (t === 'miningShibe' || t === 'moonShibe' || t === 'partyShibe' || t === 'roboShibe') centerOffset = 15;
                        else if (t === 'moonBase' || t === 'landerShibe' || t === 'marsBase' || t === 'cloudBase' || t === 'titanBase' || t === 'altarOfTheSunDoge' || t === 'dogeStar') { centerOffset = 45; verticalOffset = 30; }
                        else if (t === 'superShibe' || t === 'tardogeis' || t === 'timeTravelDRex') { centerOffset = 36; verticalOffset = 26; }
                        else if (t === 'dogeCar') { centerOffset = 30; verticalOffset = 28; }

                        groupItems.push({
                            ph,
                            sprite,
                            tooltip,
                            initialX: ph.x,
                            initialY: ph.y,
                            centerOffset,
                            verticalOffset
                        });
                        this.stopHelperMining(ph);
                    }
                });

                this.playSound('grabHelper');
                if (e.preventDefault) e.preventDefault();
                return;
            }

            // Single helper pickup: clear selection, zero overlay, exact original behavior
            if (!isMobile && !e.shiftKey) {
                this.clearHelperSelection();
            }

            // Single helper drag
            if (e.preventDefault) e.preventDefault();
            isDragging = true;
            isGroupDragging = false;
            hasMoved = false;
            pickedUpHelper = null;
            helperSprite.style.cursor = 'grabbing';
            this.playSound('grabHelper');

            this.stopHelperMining(placedHelper);
        };

        const handleMove = (e) => {
            if (isGroupDragging) {
                if (!hasMoved) hasMoved = true;
                const dx = e.clientX - dragStartX;
                const dy = e.clientY - dragStartY;
                groupItems.forEach(item => {
                    const nx = item.initialX + dx;
                    const ny = item.initialY + dy;
                    if (item.sprite) {
                        item.sprite.style.left = nx + 'px';
                        item.sprite.style.top = ny + 'px';
                    }
                    if (item.tooltip) {
                        item.tooltip.style.left = (nx + item.centerOffset) + 'px';
                        item.tooltip.style.top = (ny - item.verticalOffset) + 'px';
                    }
                });
                return;
            }

            if (isDragging && !hasMoved) {
                hasMoved = true;
                pickedUpHelper = this.pickupHelper(placedHelper, helperSprite, nameTooltip, e);
            }
        };

        const endDrag = (clientX, clientY) => {
            if (isGroupDragging) {
                const dx = clientX - dragStartX;
                const dy = clientY - dragStartY;

                groupItems.forEach(item => {
                    const rawX = item.initialX + dx;
                    const rawY = item.initialY + dy;
                    const helperSize = item.ph.type === 'miningShibe' ? 30 : 60;

                    const validPos = this.findNearestValidSpot(rawX, rawY, helperSize);
                    const needsEasing = (Math.abs(validPos.x - rawX) > 1 || Math.abs(validPos.y - rawY) > 1);

                    if (needsEasing) {
                        if (item.sprite) item.sprite.classList.add('ease-relocate');
                        if (item.tooltip) item.tooltip.classList.add('ease-relocate');
                    }

                    item.ph.x = validPos.x;
                    item.ph.y = validPos.y;

                    if (item.sprite) {
                        item.sprite.style.left = validPos.x + 'px';
                        item.sprite.style.top = validPos.y + 'px';
                    }

                    if (item.tooltip) {
                        item.tooltip.style.left = (validPos.x + item.centerOffset) + 'px';
                        item.tooltip.style.top = (validPos.y - item.verticalOffset) + 'px';
                    }

                    if (needsEasing) {
                        setTimeout(() => {
                            if (item.sprite) item.sprite.classList.remove('ease-relocate');
                            if (item.tooltip) item.tooltip.classList.remove('ease-relocate');
                        }, 380);
                    }

                    this.startHelperMining(item.ph);
                });

                this.updateDPS();
                this.updateUI();
                if (window.saveManager) window.saveManager.saveGame(false);

                isDragging = false;
                isGroupDragging = false;
                hasMoved = false;
                groupItems = [];
                return;
            }

            if (isDragging && pickedUpHelper) {
                const leftPanel = document.getElementById('left-panel');
                const panelRect = leftPanel.getBoundingClientRect();

                const helperSize = pickedUpHelper.type === 'miningShibe' ? 30 : 60;
                const offset = helperSize / 2;

                const x = clientX - panelRect.left - offset;
                const y = clientY - panelRect.top - offset;

                this.dropPickedUpHelper(pickedUpHelper, x, y);
            }

            isDragging = false;
            hasMoved = false;
            pickedUpHelper = null;
            helperSprite.style.cursor = 'grab';
        };

        // Mouse events
        helperSprite.addEventListener('mousedown', startDrag);

        document.addEventListener('mousemove', (e) => {
            handleMove(e);
        });

        document.addEventListener('mouseup', (e) => {
            endDrag(e.clientX, e.clientY);
        });

        // Touch events for mobile support
        helperSprite.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                // Update mouse position for touch
                this.mouseX = touch.clientX;
                this.mouseY = touch.clientY;
                startDrag(e);
            }
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (isDragging && e.touches.length > 0) {
                const touch = e.touches[0];
                // Update mouse position for touch
                this.mouseX = touch.clientX;
                this.mouseY = touch.clientY;
                handleMove({ clientX: touch.clientX, clientY: touch.clientY });
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (e.changedTouches.length > 0) {
                const touch = e.changedTouches[0];
                endDrag(touch.clientX, touch.clientY);
            }
        });
    }

    pickupHelper(placedHelper, helperSprite, nameTooltip, event) {
        // Update mouse coordinates from event if provided
        if (event) {
            this.mouseX = event.clientX;
            this.mouseY = event.clientY;
        }

        // Store the original name for preservation
        const originalName = placedHelper.name;

        // Remove helper from placed helpers array
        const helperIndex = this.placedHelpers.findIndex(helper => helper.id === placedHelper.id);
        if (helperIndex !== -1) {
            this.placedHelpers.splice(helperIndex, 1);
        } else {
            // Orphaned sprite with no backing data (e.g. ghost left behind by a
            // timeline reset): delete it outright instead of reviving it onto
            // the cursor, where dropping it would re-save it
            helperSprite.remove();
            if (nameTooltip) nameTooltip.remove();
            return;
        }

        // Remove sprite and tooltip from DOM
        helperSprite.remove();
        nameTooltip.remove();

        // Preserve the helper's name and add it back to cursor stack
        const helperWithPreservedName = {
            ...placedHelper.helper,
            name: originalName // Preserve the original name
        };

        // Add to cursor but DON'T start placement mode (drag-and-drop handles placement)
        this.addHelperToCursor(placedHelper.type, helperWithPreservedName, false);

        // Still need to create cursor sprites for drag-and-drop to work
        this.createCursorSprites();

        // Add mousemove listener to make the helper follow the cursor during drag
        const mousemoveHandler = (e) => {
            const leftPanel = document.getElementById('left-panel');
            const rect = leftPanel.getBoundingClientRect();
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;

            // Update cursor sprites position
            const cursorSprites = document.querySelectorAll('.helper-sprite.attached-to-mouse');
            cursorSprites.forEach((sprite, index) => {
                const helperData = this.helpersOnCursor[index];
                let helperSize = 60;
                if (sprite.classList.contains('shibe')) {
                    helperSize = 30;
                } else if (sprite.classList.contains('titan-base') || sprite.classList.contains('altar-of-sundoge')) {
                    helperSize = 90;
                } else if (sprite.classList.contains('time-travel-drex')) {
                    helperSize = 72;
                }
                const offset = helperSize / 2;

                let stackOffsetX = 0;
                let stackOffsetY = 0;

                if (index > 0) {
                    const randomOffsetX = helperData.randomOffsetX;
                    const randomOffsetY = helperData.randomOffsetY;
                    const helpersPerRow = 8;
                    const row = Math.floor(index / helpersPerRow);
                    const col = index % helpersPerRow;
                    const spacing = 15;
                    const rowSpacing = 20;

                    stackOffsetX = (col - (helpersPerRow - 1) / 2) * spacing + randomOffsetX;
                    stackOffsetY = row * rowSpacing + randomOffsetY;
                }

                const x = e.clientX - rect.left - offset + stackOffsetX;
                const y = e.clientY - rect.top - offset + stackOffsetY;

                sprite.style.left = x + 'px';
                sprite.style.top = y + 'px';
            });
        };

        document.addEventListener('mousemove', mousemoveHandler);

        // Touch handler for mobile drag support
        const touchmoveHandler = (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                const leftPanel = document.getElementById('left-panel');
                const rect = leftPanel.getBoundingClientRect();
                this.mouseX = touch.clientX;
                this.mouseY = touch.clientY;

                // Update cursor sprites position
                const cursorSprites = document.querySelectorAll('.helper-sprite.attached-to-mouse');
                cursorSprites.forEach((sprite, index) => {
                    const helperData = this.helpersOnCursor[index];
                    let helperSize = 60;
                    if (sprite.classList.contains('shibe')) {
                        helperSize = 30;
                    } else if (sprite.classList.contains('titan-base') || sprite.classList.contains('altar-of-sundoge')) {
                        helperSize = 90;
                    } else if (sprite.classList.contains('time-travel-drex')) {
                        helperSize = 72;
                    }
                    const offset = helperSize / 2;

                    let stackOffsetX = 0;
                    let stackOffsetY = 0;

                    if (index > 0 && helperData) {
                        const randomOffsetX = helperData.randomOffsetX || 0;
                        const randomOffsetY = helperData.randomOffsetY || 0;
                        const helpersPerRow = 8;
                        const row = Math.floor(index / helpersPerRow);
                        const col = index % helpersPerRow;
                        const spacing = 15;
                        const rowSpacing = 20;

                        stackOffsetX = (col - (helpersPerRow - 1) / 2) * spacing + randomOffsetX;
                        stackOffsetY = row * rowSpacing + randomOffsetY;
                    }

                    const x = touch.clientX - rect.left - offset + stackOffsetX;
                    const y = touch.clientY - rect.top - offset + stackOffsetY;

                    sprite.style.left = x + 'px';
                    sprite.style.top = y + 'px';
                });
            }
        };

        document.addEventListener('touchmove', touchmoveHandler, { passive: false });

        // Store the handlers so we can remove them later
        this.dragMousemoveHandler = mousemoveHandler;
        this.dragTouchmoveHandler = touchmoveHandler;

        // Update UI
        this.updateDPS();
        this.updateUI();
        this.updateShopPrices();

        // Return helper data for dropping
        return {
            type: placedHelper.type,
            helper: helperWithPreservedName,
            originalName: originalName
        };
    }

    dropPickedUpHelper(pickedUpHelper, x, y) {
        // Remove the mousemove handler if it exists
        if (this.dragMousemoveHandler) {
            document.removeEventListener('mousemove', this.dragMousemoveHandler);
            this.dragMousemoveHandler = null;
        }

        // Remove the touchmove handler if it exists (mobile drag support)
        if (this.dragTouchmoveHandler) {
            document.removeEventListener('touchmove', this.dragTouchmoveHandler);
            this.dragTouchmoveHandler = null;
        }

        // Clear the cursor stack since we're placing the picked up helper
        this.helpersOnCursor = [];
        this.clearCursorSprites();

        // Create helper positions array for collision detection
        const helperPositions = [{
            x: x,
            y: y,
            type: pickedUpHelper.type
        }];

        // Check for Doge collision and adjust position
        const stackAdjustment = this.adjustStackForDogeCollision(helperPositions);

        // Apply stack adjustment
        helperPositions.forEach((pos, index) => {
            pos.x += stackAdjustment.x;
            pos.y += stackAdjustment.y;
        });

        // Check boundaries and adjust positions
        this.adjustStackForBoundaries(helperPositions);

        // Create the placed helper object
        const placedHelper = {
            type: pickedUpHelper.type,
            helper: pickedUpHelper.helper,
            dps: pickedUpHelper.helper.baseDps,
            x: helperPositions[0].x,
            y: helperPositions[0].y,
            id: Date.now() + Math.random(),
            isMining: false,
            name: pickedUpHelper.originalName // Reassign the original name
        };

        // Add to placed helpers array
        this.placedHelpers.push(placedHelper);

        // Create the actual helper sprite
        this.createHelperSprite(placedHelper);

        // Update UI and DPS
        this.updateDPS();
        this.updateUI();
        this.updateShopPrices();
    }

    startHelperMining(placedHelper) {
        const helperSprite = document.querySelector(`img[data-helper-id="${placedHelper.id}"]`);
        if (helperSprite) {
            // Start 3fps animation between idle and mining sprites
            this.startHelperAnimation(placedHelper, helperSprite);
            placedHelper.isMining = true;
        }
    }

    stopHelperMining(placedHelper) {
        const helperSprite = document.querySelector(`img[data-helper-id="${placedHelper.id}"]`);
        if (helperSprite) {
            // Stop animation and reset to idle sprite (use current upgrade level)
            this.stopHelperAnimation(helperSprite);
            const upgradeLevel = this.helperUpgradeLevels?.[placedHelper.type] || 0;
            const spritePaths = this.getHelperSpritePaths(placedHelper.type, upgradeLevel);
            helperSprite.src = spritePaths.idle;
            placedHelper.isMining = false;
        }
    }

    startHelperAnimation(placedHelper, helperSprite) {
        window.DogeMinerFieldPersonality?.animate(this, placedHelper, helperSprite);
    }

    stopHelperAnimation(helperSprite) {
        window.DogeMinerFieldPersonality?.stop(this, helperSprite);
    }

    finishHelperPlacement() {
        console.log('=== Finishing helper placement ===');
        console.log('Remaining queue length:', this.placementQueue?.length || 0);
        console.log('helpersOnCursor length:', this.helpersOnCursor?.length || 0);
        console.log('isPlacingHelpers before clear:', this.isPlacingHelpers);

        // Remove placement sprite
        if (this.helperSpriteBeingPlaced) {
            this.helperSpriteBeingPlaced.remove();
            this.helperSpriteBeingPlaced = null;
        }

        // Remove event listeners (both mouse and touch)
        if (this.placementListeners) {
            document.removeEventListener('mousemove', this.placementListeners.mousemove);
            document.removeEventListener('click', this.placementListeners.click);
            document.removeEventListener('contextmenu', this.placementListeners.contextmenu);
            document.removeEventListener('touchmove', this.placementListeners.touchmove);
            document.removeEventListener('touchend', this.placementListeners.touchend);
            this.placementListeners = null;
        }

        // Clear placement state
        this.helperBeingPlaced = null;

        // SOLUTION 2: Clear all state after placement
        console.log('Clearing all placement state');
        this.isPlacingHelpers = false;
        this.placementQueue = [];
        this.currentPlacementType = null;
        this.currentPlacementIndex = 0;

        // Remove any lingering click handlers
        document.body.style.cursor = 'default';

        console.log('Placement state cleared - isPlacingHelpers:', this.isPlacingHelpers);
    }

    cancelHelperPlacement() {
        // Refund the cost for all helpers on cursor
        this.helpersOnCursor.forEach(helperData => {
            const helper = window.shopManager.shopData.helpers[helperData.type];
            const owned = this.helpers.filter(h => h.type === helperData.type).length;
            const cost = Math.floor(helper.baseCost * Math.pow(1.15, owned - 1));
            this.dogecoins += cost;

            // Remove the helper from the helpers array
            const helperIndex = this.helpers.findIndex(h => h.type === helperData.type);
            if (helperIndex !== -1) {
                this.helpers.splice(helperIndex, 1);
            }
        });

        // Clear the cursor stack
        this.helpersOnCursor = [];
        this.clearCursorSprites();

        // Clear the placement flag
        console.log('Clearing isPlacingHelpers flag after cancellation');
        this.isPlacingHelpers = false;

        this.finishHelperPlacement();
        this.updateUI();
        this.updateShopPrices();
    }

    // Pickaxe system will be implemented later

    getRickAuraRadius(width = document.getElementById('left-panel')?.offsetWidth) {
        return width > 0 ? Math.max(70, Math.min(240, width * 0.18)) : 70;
    }

    getRickAuraBaseDPS() {
        const rick = this.placedRick;
        return rick?.active && !this.isRickVisitExpired?.(rick) && (!rick.planet || rick.planet === this.currentLevel)
            && rick.sprite?.isConnected !== false ? (this._rickAuraBaseDps || 0) : 0;
    }

    updateRickAura() {
        const boostedCountsByType = {};
        const boostedSprites = new Set();
        const radius = this.getRickAuraRadius();
        let baseDps = 0;
        if (this.placedRick?.active && !this.isRickVisitExpired?.(this.placedRick) && (!this.placedRick.planet || this.placedRick.planet === this.currentLevel)
            && this.placedRick.sprite?.isConnected !== false) {
            const rx = this.placedRick.x + 30;
            const ry = this.placedRick.y + 30;
            const category = { earth: 'helpers', moon: 'moonHelpers', mars: 'marsHelpers', jupiter: 'jupiterHelpers', titan: 'titanHelpers' }[this.currentLevel];
            const owned = new Map();
            for (const helper of this[category] || []) owned.set(helper.type, (owned.get(helper.type) || 0) + 1);
            const held = new Set();
            for (const item of this._helperDrag?.items || []) {
                for (const member of this.getHelperGroupMembers?.(item.record) || [item.record]) held.add(member);
            }
            const strengths = new Map();
            const spritesById = new Map(Array.from(document.querySelectorAll('.helper-sprite[data-helper-id]'), sprite => [sprite.dataset.helperId, sprite]));
            for (const helper of this.placedHelpers || []) {
                if (helper.destroyed || helper.dragging || held.has(helper)) continue;
                const count = boostedCountsByType[helper.type] || 0;
                if (count >= (owned.get(helper.type) || 0)) continue;
                // CE stores top-left positions; DM2 measures between sprite centers.
                const size = this.getHelperDisplaySize?.(helper.type) || (helper.type === 'miningShibe' ? 30 : 60);
                const dx = helper.x + size / 2 - rx;
                const dy = helper.y + size / 2 - ry;
                if (dx * dx + dy * dy <= radius * radius) {
                    if (!strengths.has(helper.type)) strengths.set(helper.type,
                        window.shopManager?.getCurrentHelperUpgradeInfo(helper.type)?.dps ?? helper.dps ?? helper.helper?.dps ?? 0);
                    const strength = strengths.get(helper.type);
                    if (Number.isFinite(strength)) baseDps += strength;
                    boostedCountsByType[helper.type] = count + 1;
                    const representative = this.getHelperGroupMembers?.(helper)?.[0] || helper;
                    const sprite = spritesById.get(String(representative.id));
                    if (sprite && boostedSprites.size < 40) boostedSprites.add(sprite);
                }
            }
            const zone = this.placedRick.zoneEl;
            if (zone) { zone.style.width = `${radius * 2}px`; zone.style.height = `${radius * 2}px`; }
        }
        // Change highlights only when helpers enter or leave the buff radius.
        for (const sprite of this._rickBoostedSprites || []) {
            if (!boostedSprites.has(sprite)) sprite.classList.remove('rick-boosted');
        }
        for (const sprite of boostedSprites) {
            if (!this._rickBoostedSprites?.has(sprite)) sprite.classList.add('rick-boosted');
        }
        this._rickBoostedSprites = boostedSprites;
        this._rickBoostedCounts = boostedCountsByType;
        this._rickAuraBaseDps = Number.isFinite(baseDps) && baseDps > 0 ? baseDps * 2 : 0;
    }

    updateDPS() {
        this.updateRickAura();
        this.refreshBonusCoinLevel();
        this.dps = this.calculateTotalDPS();
        if (this.dps > this.highestDps) this.highestDps = this.dps;
    }

    getOfflineDPS() {
        return this.calculateTotalDPS({ includeTemporary: false });
    }

    calculateTotalDPS({ includeTemporary = true, includeRick = true } = {}) {
        // Resolve each upgrade tier once per helper type, rather than once per
        // owned instance. Late-game collections can contain thousands of helpers.
        const ownedByType = new Map();
        for (const category of ['helpers', 'moonHelpers', 'marsHelpers', 'jupiterHelpers', 'titanHelpers']) {
            for (const helper of this[category] || []) {
                if (!ownedByType.has(helper.type)) ownedByType.set(helper.type, []);
                ownedByType.get(helper.type).push(helper);
            }
        }
        let baseDpsTotal = 0;
        for (const [type, helpers] of ownedByType) {
            const dps = window.shopManager?.getCurrentHelperUpgradeInfo(type)?.dps;
            baseDpsTotal += dps != null ? dps * helpers.length
                : helpers.reduce((total, helper) => total + (helper.dps || 0), 0);
        }
        if (includeTemporary && includeRick) baseDpsTotal += this.getRickAuraBaseDPS();
        const bonus = includeTemporary ? (this.bonusCoinBuffMultiplier || 1) : 1;
        const helperMultiplier = Number(((this.playerStats.helperDpsMultiplier || 1) * bonus).toFixed(2));
        const holiday = window.DogeMinerSeasonal?.income(this) || { multiplier:1, flat:0 };
        return ((baseDpsTotal * helperMultiplier + (this.playerStats.flatHelperDps || 0) + (this.getStoryDPS?.() || 0) + this.getMysteryDPS()) * holiday.multiplier + holiday.flat)
            * (this.playerStats.totalDpsMultiplier || 1);
    }

    getPlanetMiningDPS(planet = this.currentLevel) {
        const category = { earth: 'helpers', moon: 'moonHelpers', mars: 'marsHelpers', jupiter: 'jupiterHelpers', titan: 'titanHelpers' }[planet];
        const helpers = this[category] || [];
        const byType = new Map();
        for (const helper of helpers) {
            if (!byType.has(helper.type)) byType.set(helper.type, []);
            byType.get(helper.type).push(helper);
        }
        let base = 0;
        for (const [type, owned] of byType) {
            const strength = window.shopManager?.getCurrentHelperUpgradeInfo(type)?.dps;
            base += owned.reduce((total, helper) => total + (strength ?? helper.dps ?? helper.baseDps ?? 0), 0);
        }
        if (planet === this.currentLevel) base += this.getRickAuraBaseDPS();
        const multiplier = Number(((this.playerStats?.helperDpsMultiplier || 1) * (this.bonusCoinBuffMultiplier || 1)).toFixed(2));
        return base * multiplier + (this.playerStats?.pickaxeFlatDps || 0);
    }

    // ===================== BONUS COIN SYSTEM =====================

    /**
     * Tier table for the Bonus Coin. Index = tier level. As the player progresses
     * the coin gets smaller and the temporary DPS/DPC boost gets larger.
     */
    getBonusCoinTiers() {
        return [
            null, // index 0 unused
            { level: 1, name: 'Golden Bonus',               sprite: 'level 1.webp',     boost: 0.50, duration: 60,  speed: 0.50, weight: 40, size: 96, color: '#ffcc33' },
            { level: 2, name: 'Moon Coin',                  sprite: 'level 2.webp',     boost: 0.60, duration: 60,  speed: 0.45, weight: 25, size: 86, color: '#4aa8ff' },
            { level: 3, name: 'Pristine Bonus',             sprite: 'level 3.webp',     boost: 0.70, duration: 75,  speed: 0.40, weight: 15, size: 76, color: '#ffb838' },
            { level: 4, name: 'Ultra Pristine Bonus',       sprite: 'level 4.webp',     boost: 0.90, duration: 90,  speed: 0.35, weight: 10, size: 66, color: '#3f7bff' },
            { level: 5, name: 'Hyperultra Pristine Bonus',  sprite: 'level 5.webp',     boost: 1.10, duration: 105, speed: 0.30, weight: 6,  size: 58, color: '#9b59ff' },
            { level: 6, name: 'Super Ultra Omega Bonus',    sprite: 'level 5 alt.webp', boost: 1.50, duration: 120, speed: 0.25, weight: 4,  size: 50, color: '#cf57ff' }
        ];
    }

    getCurrentBonusCoinTier() {
        return this.getUnlockedBonusCoinTiers().at(-1);
    }

    getBonusCoinPlanetLevel() {
        const current = ['earth', 'moon', 'mars', 'jupiter', 'titan'].indexOf(this.currentLevel) + 1;
        return Math.max(1, Math.min(5, Math.floor(Number(this.bonusCoinMaxPlanetLevel)) || 1), current);
    }

    getUnlockedBonusCoinTiers() {
        const tiers = this.getBonusCoinTiers();
        const pool = tiers.slice(1, this.getBonusCoinPlanetLevel() + 1);
        if (Math.floor(Number(this.timelineNumber)) >= 2) pool.push(tiers[6]);
        return pool;
    }

    selectBonusCoinTier({ random = Math.random } = {}) {
        const pool = this.getUnlockedBonusCoinTiers();
        let roll = random() * pool.reduce((sum, tier) => sum + tier.weight, 0);
        for (const tier of pool) {
            roll -= tier.weight;
            if (roll <= 0) return tier;
        }
        return pool.at(-1);
    }

    /** DM2 cb/r0/a0/s0: reached planets, then timeline 2's extra weighted tier. */
    refreshBonusCoinLevel() {
        this.bonusCoinMaxPlanetLevel = this.getBonusCoinPlanetLevel();
        this.bonusCoinLevel = this.getCurrentBonusCoinTier().level;

        if (this.bonusCoinSeenLevel === 0) {
            // First sync after load — establish a baseline without notifying.
            this.bonusCoinSeenLevel = this.bonusCoinLevel;
        } else if (this.bonusCoinLevel > this.bonusCoinSeenLevel) {
            this.bonusCoinSeenLevel = this.bonusCoinLevel;
            const tier = this.getCurrentBonusCoinTier();
            this.showNotification(`New Bonus Coin unlocked: ${tier.name}!`);
            this.playSound('longSparkle');
        }
    }

    canRunBonusCoinEvents() {
        return Boolean(this._bootComplete && this.isPlaying && !document.hidden && !this.isCutscenePlaying
            && !this.isTransitioning && !this.isIntroPlaying && !this.isBetaReportOpen && !this.isOfflineReportOpen && !this.isStoryOpen);
    }

    /** DM2 checks every two minutes, independently of claims and field expiry. */
    scheduleBonusCoinSpawn() {
        if (this._bonusCoinSpawnInterval != null) clearInterval(this._bonusCoinSpawnInterval);
        this._bonusCoinNextCheckTime = Date.now() + 120000;
        this._bonusCoinSpawnInterval = setInterval(() => {
            this._bonusCoinNextCheckTime = Date.now() + 120000;
            this.rollForBonusCoin();
        }, 120000);
    }

    resetBonusCoinSpawnCycle() {
        this._bonusCoinSpawnChance = 0.22;
        this._bonusCoinEarlyCheckMs = 0;
        if (this._bonusCoinSpawnInterval != null) this.scheduleBonusCoinSpawn();
    }

    rollForBonusCoin({ random = Math.random } = {}) {
        if (!this.canRunBonusCoinEvents()) return 'paused';
        const chance = this._bonusCoinSpawnChance ?? 0.22;
        if (random() < chance) {
            // DM2 leaves the odds alone if a field coin already exists.
            if (this._bonusCoinEl) return 'occupied';
            if (!this.spawnBonusCoin({ tier: this.selectBonusCoinTier({ random }) })) return 'unavailable';
            this._bonusCoinSpawnChance = 0.22;
            return 'spawned';
        }
        this._bonusCoinSpawnChance = Math.min(chance + 0.22, 1);
        return 'miss';
    }

    advanceBonusCoinEvents(deltaMs) {
        if (!this.canRunBonusCoinEvents()) return;
        // Check the early-game trigger once a second; suspended frames cannot
        // create a queue of offline offers.
        const elapsed = Number.isFinite(deltaMs) ? Math.max(0, Math.min(deltaMs, 1000)) : 0;
        this._bonusCoinEarlyCheckMs = (this._bonusCoinEarlyCheckMs || 0) + elapsed;
        if (this._bonusCoinEarlyCheckMs >= 1000) {
            this._bonusCoinEarlyCheckMs %= 1000;
            this.tryOfferEarlyBonusCoin();
        }
    }

    tryOfferEarlyBonusCoin() {
        if (!this.canRunBonusCoinEvents()) return 'paused';
        if (this.bonusCoinEarlyOffered || this.bonusCoinClaimCount > 0 || !(this.dogecoins > 10)
            || (this.helpers || []).filter(helper => helper.type === 'miningShibe').length < 9) return 'ineligible';
        this.bonusCoinEarlyOffered = true;
        // An ordinary coin already on the field also satisfies this first offer.
        if (!this._bonusCoinEl) this.spawnBonusCoin();
        window.saveManager?.saveGame(false);
        return 'offered';
    }

    /** Spawns a clickable Bonus Coin somewhere in the mining area. */
    spawnBonusCoin({ tier: requestedTier } = {}) {
        if (!this.isPlaying || this.isCutscenePlaying || this.isTransitioning || this.isIntroPlaying || this._bonusCoinEl) {
            return false;
        }
        const leftPanel = document.getElementById('left-panel');
        if (!leftPanel) return false;

        // Freeze the rolled offer. Unlocking another tier while this coin is
        // on the field must not change what clicking it awards.
        const tier = Object.freeze({ ...(requestedTier || this.selectBonusCoinTier()) });
        const coin = document.createElement('img');
        coin.src = `assets/general/Bonus Coins/${tier.sprite}`;
        coin.className = 'bonus-coin-spawn';
        coin.alt = tier.name;
        coin.style.width = tier.size + 'px';
        coin.style.setProperty('--bc-color', tier.color);

        // Position in the panel's logical coordinates, including scaled desktop layouts.
        const margin = 40;
        const x = margin + Math.random() * Math.max(1, leftPanel.offsetWidth - margin * 2 - tier.size);
        const y = margin + Math.random() * Math.max(1, leftPanel.offsetHeight - margin * 2 - tier.size);
        coin.style.left = x + 'px';
        coin.style.top = y + 'px';

        let claimed = false;
        const claim = (e) => {
            if (e) { e.stopPropagation(); e.preventDefault(); }
            if (claimed || this._bonusCoinEl !== coin || this.isTransitioning || this.isCutscenePlaying
                || this.isIntroPlaying || this.isBetaReportOpen || this.isOfflineReportOpen || this.isStoryOpen) return;
            claimed = true;
            clearTimeout(this._bonusCoinDespawnTimeout);
            this._bonusCoinDespawnTimeout = null;
            this._stopBonusCoinAudio();
            // Play the 3D spin animation before removing the coin
            if (this._bonusCoinEl) {
                this._bonusCoinEl.style.animation = 'bonus-coin-spin 0.6s ease-in forwards';
                // Remove after animation completes
                setTimeout(() => this._removeBonusCoinEl(coin), 600);
            }
            this.activateBonusCoin(tier);
        };
        coin.addEventListener('click', claim);
        coin.addEventListener('touchstart', claim, { passive: false });

        leftPanel.appendChild(coin);
        this._bonusCoinEl = coin;
        this._bonusCoinFieldTier = tier;
        this._startBonusCoinAudio();

        // Flies away if not clicked within its on-screen lifetime.
        this._bonusCoinDespawnTimeout = setTimeout(() => {
            this._removeBonusCoinEl(coin);
        }, 8000);
        return coin;
    }

    _startBonusCoinAudio() {
        this._stopBonusCoinAudio();
        this.playSound('coinAppear');
    }

    _stopBonusCoinAudio() {
        this.stopSound('coinAppear');
        this.stopSound('coinLoop');
    }

    _removeBonusCoinEl(expected = this._bonusCoinEl) {
        if (expected !== this._bonusCoinEl) return;
        if (this._bonusCoinDespawnTimeout) { clearTimeout(this._bonusCoinDespawnTimeout); this._bonusCoinDespawnTimeout = null; }
        if (this._bonusCoinEl) { this._bonusCoinEl.remove(); this._bonusCoinEl = null; }
        this._bonusCoinFieldTier = null;
        this._stopBonusCoinAudio();
    }

    /** A new claim replaces the previous buff; multipliers never stack. */
    activateBonusCoin(tier = this.selectBonusCoinTier()) {
        this.bonusCoinClaimCount = (this.bonusCoinClaimCount || 0) + 1;
        this.bonusCoinEarlyOffered = true;
        this.bonusCoinBuffTier = tier.level;
        this.bonusCoinBuffMultiplier = 1 + tier.boost;
        this.bonusCoinBuffEndTime = Date.now() + tier.duration * 1000;
        this.updateDPS();
        this.updateUI(true);
        this._startBonusCoinBuffTicker();
        this._renderBonusCoinBuffIndicator();
        window.DogeMinerBonusHud?.showFeedback(this, 'BONUS ACTIVATED!');
        window.saveManager?.saveGame(false);
        this.playSound('getCoins');
    }

    _startBonusCoinBuffTicker() {
        if (this._bonusCoinBuffInterval) clearInterval(this._bonusCoinBuffInterval);
        this._bonusCoinBuffInterval = setInterval(() => {
            if (this.bonusCoinBuffEndTime - Date.now() <= 0) {
                this._expireBonusCoinBuff();
            } else {
                this._renderBonusCoinBuffIndicator();
            }
        }, 100);
    }

    _expireBonusCoinBuff({ silent = false } = {}) {
        const hadBonus = this.bonusCoinBuffMultiplier > 1;
        this.bonusCoinBuffTier = 0;
        this.bonusCoinBuffMultiplier = 1;
        this.bonusCoinBuffEndTime = 0;
        if (this._bonusCoinBuffInterval) { clearInterval(this._bonusCoinBuffInterval); this._bonusCoinBuffInterval = null; }
        this.updateDPS();
        this.updateUI(true);
        this._renderBonusCoinBuffIndicator();
        if (hadBonus && !silent) window.DogeMinerBonusHud?.showFeedback(this, 'BONUS FADED');
    }

    /** Restores an in-progress buff after a page reload / save load. */
    resumeBonusCoinBuff() {
        if (this.bonusCoinBuffMultiplier > 1 && this.bonusCoinBuffEndTime > Date.now()) {
            this.updateDPS();
            this.updateUI(true);
            this._startBonusCoinBuffTicker();
            this._renderBonusCoinBuffIndicator();
        } else {
            this._expireBonusCoinBuff({ silent: true });
        }
    }

    _renderBonusCoinBuffIndicator() {
        window.DogeMinerBonusHud?.render(this);
    }

    // =================== END BONUS COIN SYSTEM ===================


    // Get sprite paths for a helper type at a specific upgrade level
    getHelperSpritePaths(helperType, upgradeLevel = 0) {
        // Repeated upgrades retain the final finite sprite, as in Dogeminer 2.
        upgradeLevel = window.shopManager?.getHelperSpriteLevel(helperType, upgradeLevel) ?? upgradeLevel;
        const spriteMap = {
            // Earth helpers
            miningShibe: { folder: 'shibes', prefix: 'shibes' },
            dogeKennels: { folder: 'kennels', prefix: 'kennels' },
            streamerKittens: { folder: 'kittens', prefix: 'kittens' },
            spaceRocket: { folder: 'rockets', prefix: 'rockets' },
            timeMachineRig: { folder: 'rigs', prefix: 'rigs' },
            infiniteDogebility: { folder: 'dogebility', prefix: 'dogebility' },
            // Moon helpers
            moonBase: { folder: 'bases', prefix: 'bases' },
            moonShibe: { folder: 'moonshibe', prefix: 'moonshibe' },
            dogeCar: { folder: 'dogecar', prefix: 'dogecar' },
            landerShibe: { folder: 'landershibe', prefix: 'landershibe' },
            marsRocket: { folder: 'marsrocket', prefix: 'marsrocket' },
            dogeGate: { folder: 'dogegate', prefix: 'dogegate' },
            // Mars helpers
            marsBase: { folder: 'marsbase', prefix: 'marsbase' },
            partyShibe: { folder: 'partyshibe', prefix: 'partyshibe' },
            curiosiDoge: { folder: 'curiosidoge', prefix: 'curiosidoge' },
            djKittenz: { folder: 'djkittenz', prefix: 'djkittenz' },
            spaceBass: { folder: 'spacebass', prefix: 'spacebass' },
            jupiterRocket: { folder: 'juprocket', prefix: 'juprocket' },
            // Jupiter helpers
            cloudBase: { folder: 'jupiterbase', prefix: 'jupiterbase' },
            superShibe: { folder: 'supershibe', prefix: 'supershibe' },
            dogeAirShip: { folder: 'airship', prefix: 'airship' },
            flyingDoggo: { folder: 'flyingdoge', prefix: 'flyingdoge' },
            tardogeis: { folder: 'tardogeis', prefix: 'tardogeis' },
            dogeStar: { folder: 'dogestar', prefix: 'dogestar' },
            // Titan helpers
            titanBase: { folder: 'titanbase', prefix: 'titanbase' },
            roboShibe: { folder: 'roboshibe', prefix: 'roboshibe' },
            heavyDogeWalker: { folder: 'walker', prefix: 'walker' },
            coinSeeker5000: { folder: 'seeker', prefix: 'seeker' },
            timeTravelDRex: { folder: 'trex', prefix: 'trex' },
            altarOfTheSunDoge: { folder: 'altarofthesundoge', prefix: 'altarofthesundoge' }
        };

        const info = spriteMap[helperType];
        if (!info) {
            // Return default for other helper types (assumes lowercase folder/prefix matching helperType)
            const lowerType = helperType.toLowerCase();
            return {
                idle: `assets/helpers/${lowerType}/${lowerType}-idle-0.webp`,
                mining: `assets/helpers/${lowerType}/${lowerType}-mine-0.webp`
            };
        }

        return {
            idle: `assets/helpers/${info.folder}/${info.prefix}-idle-${upgradeLevel}.webp`,
            mining: `assets/helpers/${info.folder}/${info.prefix}-mine-${upgradeLevel}.webp`
        };
    }

    updateShopPrices() {
        this.updateHelperShopDps?.();
        window.uiManager?.updateHelperUpgradeAffordability();
        // Update shop prices and quantities without rebuilding the entire shop
        const shopItems = document.querySelectorAll('.shop-grid-item');
        shopItems.forEach((item, index) => {
            const quantityElement = item.querySelector('.shop-item-quantity');
            const priceElement = item.querySelector('.buy-btn-price');
            const buyButton = item.querySelector('.shop-buy-btn[data-helper-type]');

            if (quantityElement && priceElement && buyButton) {
                // Get helper type from the button's data attribute
                const helperType = buyButton.getAttribute('data-helper-type');
                if (helperType) {
                    // Get the correct helper category based on current planet
                    const helperCategory = this.getHelperCategoryForLevel();
                    const shopCategory = window.shopManager?.shopData?.[helperCategory];
                    const helper = shopCategory?.[helperType];
                    if (helper) {
                        const helperArray = this.getHelperArrayForLevel();
                        const owned = helperArray.filter(h => h.type === helperType).length;
                        const cost = this.getHelperCost(helper.baseCost, owned, helperType);
                        const canAfford = this.dogecoins >= cost;

                        // Update quantity
                        quantityElement.textContent = `#${owned}`;

                        // Update price
                        const priceText = this.formatNumber(cost);
                        priceElement.textContent = priceText;

                        // Recalculate button width based on new price length
                        const priceLength = priceText.length;
                        let buttonWidth = '45%'; // Default width

                        // Scale button width based on price length
                        if (priceLength >= 12) {
                            buttonWidth = '90%'; // Extremely long prices (trillions+)
                        } else if (priceLength >= 10) {
                            buttonWidth = '85%'; // Very long prices (billions)
                        } else if (priceLength >= 8) {
                            buttonWidth = '75%'; // Long prices (millions)
                        } else if (priceLength >= 6) {
                            buttonWidth = '65%'; // Medium-long prices (hundreds of thousands)
                        } else if (priceLength >= 4) {
                            buttonWidth = '55%'; // Medium prices (thousands)
                        } else {
                            buttonWidth = '45%'; // Short prices (hundreds)
                        }

                        // Update button width
                        buyButton.style.width = buttonWidth;

                        // A price refresh must retain progression and discovery locks.
                        const canBuy = canAfford && !buyButton.classList.contains('locked') && this.isWorldHelperAvailable?.(helperType) !== false;
                        if (canBuy) {
                            buyButton.disabled = false;
                            buyButton.style.opacity = '1';
                        } else {
                            buyButton.disabled = true;
                            buyButton.style.opacity = '0.7';
                        }
                    }
                }
            }
        });
    }

    startGameLoop() {
        this.isPlaying = true;
        this.lastGameLoopTime = performance.now();

        // Bonus Coin: restore any in-progress buff and begin the spawn cycle.
        this.resumeBonusCoinBuff();
        this.scheduleBonusCoinSpawn();

        // Source sQ:20ms elapsed-time income. Keep explicit CE rate choices.
        this.dpsUpdateRate = this.getValueUpdateRate();

        this.setupDpsInterval();

        const gameLoop = (timestamp) => {
            if (!this.lastGameLoopTime) this.lastGameLoopTime = timestamp;
            const dt = timestamp - this.lastGameLoopTime;
            this.lastGameLoopTime = timestamp;

            if (this.isPlaying) {
                this.advanceTimelineProgress?.(dt);
                this.advanceWorldDiscovery?.(dt);
                this.advanceLateProgression?.();
                this.advanceMoonLaunch?.();
                this.advanceStoryEvents?.(dt);
                this.advanceNewsDoge?.(dt);
                this.advanceSearchdogeDiscovery?.(dt);
                this.advanceBonusCoinEvents(dt);
                this.advanceHelperRockMining(dt);

                // If set to instant (0), add continuous DPS per frame
                if (this.dpsUpdateRate === 0 && this.dps > 0) {
                    this.creditPassiveIncome(dt, timestamp, true);
                }

                this.updateHelpers();
            }

            this.advanceRickVisitor?.(dt);
            this.advanceCateThief?.(dt);
            this.advanceTools?.(dt);
            this.advanceHelperLoot?.(dt);
            this.advanceLootAutomation?.(dt);
            if(window.DogeMinerFrameClock)window.DogeMinerFrameClock.request(gameLoop);
            else requestAnimationFrame(gameLoop);
        };

        if(window.DogeMinerFrameClock)window.DogeMinerFrameClock.request(gameLoop);
        else requestAnimationFrame(gameLoop);
    }

    setupDpsInterval() {
        if (this.dpsInterval) {
            clearInterval(this.dpsInterval);
            this.dpsInterval = null;
        }

        this.resetPassiveIncomeClock();
        if (this.dpsUpdateRate > 0) {
            this.dpsInterval = setInterval(() => {
                const now = performance.now();
                const elapsed = Math.max(0, now - this._lastPassiveIncomeTick);
                this._lastPassiveIncomeTick = now;
                if (this.isPlaying && this.dps > 0) {
                    this.creditPassiveIncome(elapsed, now);
                }
            }, this.dpsUpdateRate===20&&this.limitFps?72:this.dpsUpdateRate);
        }
    }

    getValueUpdateRate() {
        const saved = localStorage.getItem('valueUpdateRate');
        const rate = Number(saved);
        return saved !== null && [0, 20, 100, 1000, 5000].includes(rate) ? rate : 20;
    }

    resetPassiveIncomeClock() {
        this._lastPassiveIncomeTick = performance.now();
        this._lastPassiveCounterPaint = -Infinity;
        this._lastPassiveUiPaint = this._lastPassiveIncomeTick;
    }

    creditPassiveIncome(elapsed, now = performance.now(), instant = false) {
        if (!Number.isFinite(elapsed) || elapsed <= 0 || !Number.isFinite(this.dps) || this.dps <= 0) return;
        const earned = this.getRickPassiveIncome?.(elapsed) ?? this.dps * elapsed / 1000;
        this.dogecoins += earned;
        this.totalMined += earned;
        // Source P$ throttles counter painting50ms. The existing arrival ledger
        // stays authoritative; passive gains never reveal coins still in flight.
        if (instant || now - this._lastPassiveCounterPaint >= 50) {
            this.updateDogecoinCounter();
            this._lastPassiveCounterPaint = now;
        }
        // Shop scans/stat panels must not run on the smooth income clock.
        if (now - this._lastPassiveUiPaint >= Math.max(1000, this.dpsUpdateRate || 0)) {
            this.updateUI();
            this._lastPassiveUiPaint = now;
        }
    }

    setValueUpdateRate(ms) {
        if (![0, 20, 100, 1000, 5000].includes(ms)) return false;
        this.dpsUpdateRate = ms;
        localStorage.setItem('valueUpdateRate', ms);
        for (const id of ['value-update-rate', 'mobile-value-update-rate']) {
            const select = document.getElementById(id); if (select) select.value = String(ms);
        }
        this.setupDpsInterval();
        return true;
    }

    getPlanetBackgrounds(planet = this.currentLevel) {
        // Source Pr ordinary pools, in order; local WebP copies of the same art.
        const pools = {
            earth: ['bg1','bg-new','bg3','bg5','bg6','bg7','bg4','bg9'],
            moon: ['bg003','bg001','bg3','bg-new','bg5','bg1','bg6','bgmoon01'],
            mars: ['bg101','bg102','bg103','bg104','bg105','bg6','bg-new'],
            jupiter: ['bgjup01','bgjup02','bgjup03','dogewow'],
            titan: ['titan02','titan03','titan04','titan05']
        };
        return (Object.hasOwn(pools, planet) ? pools[planet] : pools.earth).map(name => `assets/backgrounds/${name}.webp`);
    }

    setPlanetBackgrounds(planet = this.currentLevel, { reset = false } = {}) {
        const changed = this._backgroundPlanet !== planet;
        this.backgrounds = this.getPlanetBackgrounds(planet);
        if (reset || !Number.isInteger(this.currentBackgroundIndex)) this.currentBackgroundIndex = 0;
        else if (changed) this.currentBackgroundIndex = this.currentBackgroundIndex >= this.backgrounds.length - 1 ? 0 : this.currentBackgroundIndex + 1;
        this._backgroundPlanet = planet;
        return this.syncBackgroundImages(true);
    }

    startBackgroundRotation() {
        this.stopBackgroundRotation();
        // Source MP schedules one change every ten seconds, without catch-up.
        this.backgroundRotationInterval = setInterval(() => {
            if (!this.isPlaying || document.hidden || this.isCutscenePlaying || this.isTransitioning) return;
            this.rotateBackground();
        }, 10000);
    }

    rotateBackground() {
        if (!this.backgrounds?.length) return Promise.resolve(false);
        this.currentBackgroundIndex = (this.currentBackgroundIndex + 1) % this.backgrounds.length;
        return this.syncBackgroundImages();
    }

    syncBackgroundImages(forceActive = false) {
        const container = document.getElementById('background-container');
        const nodes = container ? [...container.querySelectorAll('.background-image')] : [];
        if (nodes.length < 2 || !this.backgrounds?.length) return Promise.resolve(false);
        if (!Number.isInteger(this.currentBackgroundIndex) || this.currentBackgroundIndex < 0 || this.currentBackgroundIndex >= this.backgrounds.length) this.currentBackgroundIndex = 0;
        const src = this.backgrounds[this.currentBackgroundIndex];
        const request = this._backgroundRequest = (this._backgroundRequest || 0) + 1;
        const planet = this.currentLevel;
        if (src === this._backgroundSrc) {
            container.dataset.planet = planet;
            return Promise.resolve(true);
        }
        this._backgroundCache ||= new Map();
        if (!this._backgroundCache.has(src)) {
            const pending = new Promise(resolve => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = () => { this._backgroundCache.delete(src); resolve(false); };
                image.src = src;
            });
            this._backgroundCache.set(src, pending);
        }
        // Keep the old frame until the replacement has loaded. A late image
        // from an old planet/import must never replace the current scene.
        return this._backgroundCache.get(src).then(ready => {
            if (!ready || request !== this._backgroundRequest || planet !== this.currentLevel) return false;
            const previous = nodes.find(node => node.classList.contains('active'));
            const next = nodes.find(node => node !== previous);
            const instant = !this._backgroundSrc || (forceActive && !this._bootComplete) || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
            clearTimeout(this._backgroundFadeTimer);
            for (const node of nodes) node.classList.remove('active', 'background-previous');
            if (previous && !instant) previous.classList.add('background-previous');
            next.style.transition = 'none'; next.style.opacity = '0'; next.src = src;
            next.getBoundingClientRect();
            next.style.transition = instant ? 'none' : ''; next.style.opacity = '';
            next.classList.add('active');
            this._backgroundSrc = src;
            container.dataset.planet = planet;
            container.dataset.background = src;
            if (previous && !instant) this._backgroundFadeTimer = setTimeout(() => {
                previous.style.transition = 'none';
                previous.classList.remove('background-previous');
            }, 4000);
            return true;
        });
    }

    startBlinking() {
        // Start blinking every 10 seconds
        this.blinkInterval = setInterval(() => {
            this.blinkDoge();
        }, 10000);
    }

    blinkDoge() {
        const doge = document.getElementById('main-character');
        if (!doge) return;
        if (this.currentLevel === 'mars') {
            return;
        }

        // Store original src
        const originalSrc = doge.src;

        // Choose the correct closed eyes sprite based on current planet
        let closedEyesSprite;
        if (this.currentLevel === 'earth') {
            closedEyesSprite = 'assets/general/character/closed_eyes.webp';
        } else if (this.currentLevel === 'moon') {
            closedEyesSprite = 'assets/general/character/closed_space.webp';
        } else if (this.currentLevel === 'mars') {
            // Mars uses party sprite with happy variant for blinking
            closedEyesSprite = 'assets/general/character/happy_party.webp';
        } else if (this.currentLevel === 'jupiter') {
            // Jupiter uses space helmet sprite like the Moon
            closedEyesSprite = 'assets/general/character/closed_space.webp';
        } else if (this.currentLevel === 'titan') {
            // Titan uses space helmet (eyes open), blink with closed_space (eyes closed)
            closedEyesSprite = 'assets/general/character/closed_space.webp';
        } else {
            // Default fallback
            closedEyesSprite = 'assets/general/character/closed_eyes.webp';
        }

        // Change to closed eyes
        doge.src = closedEyesSprite;

        // Blink for 200ms
        setTimeout(() => {
            doge.src = originalSrc;
        }, 200);
    }

    startSearchdogAnimation() {
        // Store reference to avoid multiple intervals
        if (this.searchdogAnimationInterval) return;

        let isFrame1 = true;

        // Alternate between the two frames every 1000ms (1 second) for all searchdogs
        // Re-query elements on each frame to catch dynamically added searchdogs
        this.searchdogAnimationInterval = setInterval(() => {
            const searchdogs = document.querySelectorAll('.searchdog');
            searchdogs.forEach(searchdog => {
                if (searchdog) {
                    searchdog.src = isFrame1
                        ? 'assets/general/searchdog_2.webp'
                        : 'assets/general/searchdog_1.webp';
                }
            });
            isFrame1 = !isFrame1;
        }, 1000);
    }

    startRickSpawn() {
        if (this.rickInterval) clearTimeout(this.rickInterval);
        // Slightly rarer spawn interval: 5 to 8 minutes (300,000 to 480,000 ms)
        const spawnTime = 300000 + Math.random() * 180000;
        this.rickInterval = setTimeout(() => {
            this.spawnRick();
        }, spawnTime);
    }

    spawnRick() {
        if (this.rickVisible || this.placedRick?.active || this.isDraggingRick) return;

        this.rickVisible = true;
        this.currentRickSprite = 0;
        this.rickAnimationDirection = 1;
        this.rickAnimationComplete = false;

        const leftPanel = document.getElementById('left-panel');
        if (!leftPanel) return;

        // Clean up any stale elements and timeouts
        if (this.rickStepTimeout) clearTimeout(this.rickStepTimeout);
        if (this.rickRetractTimeout) clearTimeout(this.rickRetractTimeout);
        if (this.rickClickDropTimeout) clearTimeout(this.rickClickDropTimeout);

        document.getElementById('rick-portal')?.remove();
        document.getElementById('rick-doge')?.remove();
        document.getElementById('rick-cursor-sprite')?.remove();

        // Create portal background
        const portal = document.createElement('img');
        portal.id = 'rick-portal';
        portal.src = 'assets/general/rm/portal.webp';
        portal.style.position = 'absolute';
        portal.style.bottom = '170px';
        portal.style.right = '10px';
        portal.style.width = '80px';
        portal.style.height = '80px';
        portal.style.zIndex = '24';
        portal.style.opacity = '0';
        portal.style.transition = 'opacity 0.5s ease';
        portal.style.pointerEvents = 'none';

        // Create Rick element
        const rick = document.createElement('img');
        rick.id = 'rick-doge';
        rick.src = this.rickSprites[0];
        rick.className = 'rick-doge';
        rick.style.position = 'absolute';
        rick.style.bottom = '170px';
        rick.style.right = '20px';
        rick.style.width = '80px';
        rick.style.height = '80px';
        rick.style.zIndex = '35';
        rick.style.cursor = 'grab';
        rick.style.pointerEvents = 'auto';
        rick.style.transition = 'opacity 0.3s ease';
        rick.style.objectFit = 'contain';
        rick.draggable = false;

        leftPanel.appendChild(portal);
        leftPanel.appendChild(rick);

        // Attach drag/click listener right away so player can grab him anytime during emergence
        this.enableRickPortalDrag(rick);

        // Fade in portal
        setTimeout(() => {
            portal.style.opacity = '1';
        }, 100);

        // Animate through portal emergence sprites
        this.animateRick();
    }

    animateRick() {
        if (!this.rickVisible || this.rickAnimationComplete || this.isDraggingRick || this.placedRick) return;

        const rick = document.getElementById('rick-doge');
        if (!rick) return;

        // Check if we've completed the full retraction sequence (back to R1)
        if (this.currentRickSprite === 0 && this.rickAnimationDirection === -1) {
            this.rickAnimationComplete = true;
            setTimeout(() => {
                this.hideRick();
            }, 500);
            return;
        }

        // Move to next sprite based on direction
        this.currentRickSprite += this.rickAnimationDirection;

        // Reached R4 (fully emerged from the portal)
        if (this.currentRickSprite === 3) {
            rick.src = this.rickSprites[3];
            rick.classList.add('ready-to-grab');

            // Pause at R4 for 3.5 seconds before retracting into portal if not grabbed
            this.rickRetractTimeout = setTimeout(() => {
                if (!this.isDraggingRick && !this.placedRick && this.rickVisible) {
                    rick.classList.remove('ready-to-grab');
                    this.rickAnimationDirection = -1;
                    this.animateRick();
                }
            }, 3500);
            return;
        }

        rick.src = this.rickSprites[this.currentRickSprite];

        // Animate through emergence / retraction sprites
        this.rickStepTimeout = setTimeout(() => {
            this.animateRick();
        }, 400);
    }

    enableRickPortalDrag(rick) {
        const handleStart = (e) => {
            if (this.isPlacingHelpers) return;
            if (e.button !== undefined && e.button !== 0) return;
            if (e.preventDefault) e.preventDefault();
            e.stopPropagation();

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            this.startRickDragFromPortal(clientX, clientY);
        };

        rick.addEventListener('mousedown', handleStart);
        rick.addEventListener('touchstart', handleStart, { passive: false });
    }

    startRickDragFromPortal(clientX, clientY) {
        // A fading emergence sprite no longer owns the visitor after handoff.
        if (!this.rickVisible || this.placedRick || this.isDraggingRick) return false;
        this._rickPortalFlow = null;
        if (this.rickInterval) clearTimeout(this.rickInterval);
        if (this.rickStepTimeout) clearTimeout(this.rickStepTimeout);
        if (this.rickRetractTimeout) clearTimeout(this.rickRetractTimeout);

        this.isDraggingRick = true;
        this.rickHasMoved = false;
        this.rickDragStartPos = { x: clientX, y: clientY };
        this.playSound('grabHelper');

        // Fade and remove spawn portal and initial element
        const portal = document.getElementById('rick-portal');
        const rick = document.getElementById('rick-doge');
        if (portal) {
            portal.style.opacity = '0';
            setTimeout(() => { if (portal.parentNode) portal.remove(); }, 300);
        }
        if (rick) {
            rick.remove();
        }
        this.rickVisible = false;

        // Create cursor sprite using rick.png
        this.createRickCursorSprite(clientX, clientY);
        this.attachRickCursorListeners();
    }

    createRickCursorSprite(clientX, clientY) {
        this.removeRickCursorSprite();

        const leftPanel = document.getElementById('left-panel');
        if (!leftPanel) return;
        const rect = leftPanel.getBoundingClientRect();
        const container = document.getElementById('helper-container') || leftPanel;
        const ratio = rect.width / (leftPanel.offsetWidth || rect.width) || 1;

        const x = ((clientX ?? (rect.left + rect.width / 2)) - rect.left) / ratio - 30;
        const y = ((clientY ?? (rect.top + rect.height / 2)) - rect.top) / ratio - 30;

        // Preview DPS zone follows cursor
        const cursorZone = document.createElement('div');
        cursorZone.id = 'rick-cursor-zone';
        cursorZone.className = 'rick-dps-zone';
        cursorZone.style.left = (x + 30) + 'px';
        cursorZone.style.top = (y + 30) + 'px';
        cursorZone.style.zIndex = '4';
        cursorZone.style.opacity = '0.85';
        cursorZone.style.width = cursorZone.style.height = `${this.getRickAuraRadius() * 2}px`;

        const sprite = document.createElement('img');
        sprite.id = 'rick-cursor-sprite';
        sprite.src = 'assets/general/rm/rickdoge_smol.png';
        sprite.className = 'helper-sprite attached-to-mouse rick-helper';
        sprite.style.width = '60px';
        sprite.style.height = '60px';
        sprite.style.opacity = '0.9';
        sprite.style.zIndex = '35';
        sprite.style.pointerEvents = 'none';
        sprite.style.left = x + 'px';
        sprite.style.top = y + 'px';

        container.appendChild(cursorZone);
        container.appendChild(sprite);
    }

    removeRickCursorSprite() {
        this._rickCursorCleanup?.();
        document.getElementById('rick-cursor-zone')?.remove();
        document.getElementById('rick-cursor-sprite')?.remove();
    }

    attachRickCursorListeners() {
        this._rickCursorCleanup?.();
        const leftPanel = document.getElementById('left-panel');
        if (!leftPanel) return;
        const sprite = document.getElementById('rick-cursor-sprite');
        const zone = document.getElementById('rick-cursor-zone');
        let rect = leftPanel.getBoundingClientRect();
        let ratio = rect.width / (leftPanel.offsetWidth || rect.width) || 1;
        let frame = null;
        let point = this.rickDragStartPos;
        const refreshBounds = () => { rect = leftPanel.getBoundingClientRect(); ratio = rect.width / (leftPanel.offsetWidth || rect.width) || 1; };
        const render = () => {
            frame = null;
            if (!point || !this.isDraggingRick) return;
            const x = (point.x - rect.left) / ratio - 30;
            const y = (point.y - rect.top) / ratio - 30;
            if (sprite) sprite.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            if (zone) zone.style.transform = `translate3d(${x + 30}px, ${y + 30}px, 0) translate(-50%, -50%)`;
        };
        for (const element of [sprite, zone]) {
            if (!element) continue;
            element.style.left = '0px';
            element.style.top = '0px';
            element.style.willChange = 'transform';
        }
        render();
        const onMove = (e) => {
            if (!this.isDraggingRick) return;
            if (e.touches && e.cancelable) e.preventDefault();
            const source = e.touches ? e.touches[0] : e;
            this.mouseX = source.clientX;
            this.mouseY = source.clientY;
            point = { x: source.clientX, y: source.clientY };
            if (this.rickDragStartPos && Math.hypot(point.x - this.rickDragStartPos.x, point.y - this.rickDragStartPos.y) > 8) this.rickHasMoved = true;
            if (frame === null) frame = requestAnimationFrame(render);
        };
        const drop = (e) => {
            const source = e.changedTouches ? e.changedTouches[0] : e;
            const clientX = source.clientX ?? point?.x ?? this.mouseX;
            const clientY = source.clientY ?? point?.y ?? this.mouseY;
            refreshBounds();
            cleanup();
            this.isDraggingRick = false;
            this.removeRickCursorSprite();
            this.dropRick((clientX - rect.left) / ratio - 30, (clientY - rect.top) / ratio - 30);
        };
        const onUp = (e) => { if (this.isDraggingRick && this.rickHasMoved) drop(e); };
        const onClickDrop = (e) => { if (this.isDraggingRick) drop(e); };
        const onCancel = (e) => { if (this.isDraggingRick) drop(e); };
        const cleanup = () => {
            if (frame !== null) cancelAnimationFrame(frame);
            frame = null;
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onUp);
            document.removeEventListener('touchcancel', onCancel);
            window.removeEventListener('resize', refreshBounds);
            window.removeEventListener('scroll', refreshBounds, true);
            leftPanel.removeEventListener('click', onClickDrop);
            if (this.rickClickDropTimeout) clearTimeout(this.rickClickDropTimeout);
            this._rickCursorCleanup = null;
        };
        this._rickCursorCleanup = cleanup;
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onUp);
        document.addEventListener('touchcancel', onCancel);
        window.addEventListener('resize', refreshBounds);
        window.addEventListener('scroll', refreshBounds, true);
        this.rickClickDropTimeout = setTimeout(() => leftPanel.addEventListener('click', onClickDrop, { once: true }), 120);
    }

    dropRick(rawX, rawY) {
        if (this.placedRick) return false;
        this.isDraggingRick = false;
        this.removeRickCursorSprite();
        const leftPanel = document.getElementById('left-panel');
        if (!leftPanel) return;
        const helperContainer = document.getElementById('helper-container') || leftPanel;

        // Clamp inside left panel bounds
        const maxX = leftPanel.offsetWidth - 70;
        const maxY = leftPanel.offsetHeight - 70;
        const clampedX = Math.max(15, Math.min(maxX, rawX));
        const clampedY = Math.max(60, Math.min(maxY, rawY));

        const validPos = this.findNearestValidSpot ? this.findNearestValidSpot(clampedX, clampedY, 60) : { x: clampedX, y: clampedY };
        const x = validPos.x;
        const y = validPos.y;

        // Create placed Rick sprite
        const sprite = document.createElement('img');
        sprite.id = 'placed-rick-helper';
        sprite.src = 'assets/general/rm/rickdoge_smol.png';
        sprite.className = 'helper-sprite placed-helper rick-helper place-bounce';
        sprite.style.left = x + 'px';
        sprite.style.top = y + 'px';
        sprite.style.zIndex = '12';
        sprite.style.cursor = 'grab';
        sprite.style.pointerEvents = 'auto';

        // Create Countdown Timer Badge above Rick (starts upon placement)
        let remainingSeconds = 30;
        const timerBadge = document.createElement('div');
        timerBadge.id = 'placed-rick-timer';
        timerBadge.className = 'rick-timer-badge';
        timerBadge.innerHTML = `⏱️ ${remainingSeconds}s`;
        timerBadge.style.left = (x + 30) + 'px';
        timerBadge.style.top = (y - 20) + 'px';

        // Create Name Tooltip "rkn" (appears above timer on hover)
        const tooltip = document.createElement('div');
        tooltip.id = 'placed-rick-tooltip';
        tooltip.className = 'helper-name-tooltip';
        tooltip.textContent = 'rkn';
        tooltip.style.left = (x + 30) + 'px';
        tooltip.style.top = (y - 42) + 'px';
        tooltip.style.transform = 'translateX(-50%)';

        // Create DPS Zone Aura
        const zoneEl = document.createElement('div');
        zoneEl.id = 'placed-rick-zone';
        zoneEl.className = 'rick-dps-zone';
        zoneEl.style.left = (x + 30) + 'px';
        zoneEl.style.top = (y + 30) + 'px';

        helperContainer.appendChild(zoneEl);
        helperContainer.appendChild(timerBadge);
        helperContainer.appendChild(tooltip);
        const rig = document.createElement('div');
        rig.className = 'rick-field-rig';
        rig.style.left = x + 'px'; rig.style.top = y + 'px';
        sprite.style.left = '0px'; sprite.style.top = '0px';
        rig.appendChild(sprite); helperContainer.appendChild(rig);

        // Hover tooltip events
        sprite.addEventListener('mouseenter', () => { tooltip.style.opacity = '1'; });
        sprite.addEventListener('mouseleave', () => { tooltip.style.opacity = '0'; });

        // Rick 3fps animation loop (rickidle.png <-> rickmine.png)
        let isIdle = true;
        const miningInterval = setInterval(() => {
            if (isIdle) {
                sprite.src = 'assets/general/rm/rickmine.png';
            } else {
                sprite.src = 'assets/general/rm/rickidle.png';
            }
            isIdle = !isIdle;
        }, 333);

        // Countdown timer interval (starts on placement, ticks every second)
        const timerInterval = setInterval(() => {
            remainingSeconds--;
            if (remainingSeconds <= 0) {
                clearInterval(timerInterval);
                this.despawnRick();
                return;
            }
            timerBadge.innerHTML = `⏱️ ${remainingSeconds}s`;
            if (remainingSeconds <= 5) {
                timerBadge.classList.add('low-time');
            }
        }, 1000);

        // Allow repositioning Rick while active
        const cleanupDrag = this.addDragToPlacedRick(sprite, tooltip, timerBadge, zoneEl);

        this.placedRick = {
            active: true,
            planet: this.currentLevel,
            x: x,
            y: y,
            sprite: sprite,
            rig: rig,
            tooltip: tooltip,
            timerBadge: timerBadge,
            zoneEl: zoneEl,
            cleanupDrag: cleanupDrag,
            miningInterval: miningInterval,
            timerInterval: timerInterval,
            placedTime: Date.now()
        };

        // Update DPS and UI
        this.updateDPS();
        this.updateUI();
    }

    addDragToPlacedRick(sprite, tooltip, timerBadge, zoneEl) {
        let isDragging = false;
        let dragStartX = 0, dragStartY = 0, initX = 0, initY = 0;
        let ratio = 1;
        let frame = null;
        let pendingPosition = null;
        let lastBuffUpdate = -Infinity;
        let buffDirty = false;
        const position = (x, y) => {
            const rig = this.placedRick.rig || sprite;
            rig.style.left = x + 'px';
            rig.style.top = y + 'px';
            if (tooltip) {
                tooltip.style.left = (x + 30) + 'px';
                tooltip.style.top = (y - 42) + 'px';
            }
            if (timerBadge) {
                timerBadge.style.left = (x + 30) + 'px';
                timerBadge.style.top = (y - 20) + 'px';
            }
            if (zoneEl) {
                zoneEl.style.left = (x + 30) + 'px';
                zoneEl.style.top = (y + 30) + 'px';
            }
            this.placedRick.x = x;
            this.placedRick.y = y;
        };
        const render = (timestamp) => {
            frame = null;
            if (!isDragging || !this.placedRick?.active) return;
            if (pendingPosition) {
                position(pendingPosition.x, pendingPosition.y);
                pendingPosition = null;
                buffDirty = true;
            }
            // Follow the pointer at display speed; recompute the buff at 20Hz.
            // Flush the final move even if the player pauses before releasing.
            if (buffDirty && timestamp - lastBuffUpdate >= 50) {
                this.updateDPS();
                lastBuffUpdate = timestamp;
                buffDirty = false;
            }
            if (buffDirty) frame = requestAnimationFrame(render);
        };
        const onStart = (e) => {
            if (this.isPlacingHelpers || !this.placedRick?.active) return;
            if (e.button !== undefined && e.button !== 0) return;
            if (e.cancelable) e.preventDefault();
            isDragging = true;
            this.placedRick.held = true; this.placedRick.move = null;
            const source = e.touches ? e.touches[0] : e;
            dragStartX = source.clientX;
            dragStartY = source.clientY;
            initX = this.placedRick.x;
            initY = this.placedRick.y;
            const panel = document.getElementById('left-panel');
            ratio = panel ? panel.getBoundingClientRect().width / (panel.offsetWidth || 1) || 1 : 1;
            lastBuffUpdate = -Infinity;
            sprite.style.cursor = 'grabbing';
            this.playSound('grabHelper');
        };
        const onMove = (e) => {
            if (!isDragging || !this.placedRick?.active) return;
            if (e.touches && e.cancelable) e.preventDefault();
            const source = e.touches ? e.touches[0] : e;
            pendingPosition = { x: initX + (source.clientX - dragStartX) / ratio, y: initY + (source.clientY - dragStartY) / ratio };
            if (frame === null) frame = requestAnimationFrame(render);
        };
        const onEnd = () => {
            if (!isDragging) return;
            if (frame !== null) cancelAnimationFrame(frame);
            frame = null;
            isDragging = false;
            if (this.placedRick) this.placedRick.held = false;
            sprite.style.cursor = 'grab';
            const leftPanel = document.getElementById('left-panel');
            if (leftPanel && this.placedRick?.active) {
                this.playSound('grabHelper',{volume:.1});
                if (pendingPosition) position(pendingPosition.x, pendingPosition.y);
                const valid = this.findNearestValidSpot ? this.findNearestValidSpot(this.placedRick.x, this.placedRick.y, 60) : this.placedRick;
                position(Math.max(15, Math.min(leftPanel.offsetWidth - 70, valid.x)), Math.max(60, Math.min(leftPanel.offsetHeight - 70, valid.y)));
                this.updateDPS();
                this.updateUI();
            }
            pendingPosition = null;
            buffDirty = false;
        };
        const cleanup = () => {
            isDragging = false;
            if (frame !== null) cancelAnimationFrame(frame);
            sprite.removeEventListener('mousedown', onStart);
            sprite.removeEventListener('touchstart', onStart);
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onEnd);
            document.removeEventListener('touchcancel', onEnd);
            window.removeEventListener('blur', onEnd);
        };
        sprite.addEventListener('mousedown', onStart);
        sprite.addEventListener('touchstart', onStart, { passive: false });
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
        document.addEventListener('touchcancel', onEnd);
        window.addEventListener('blur', onEnd);
        return cleanup;
    }

    despawnRick({ animate = true } = {}) {
        if (!this.placedRick) return;

        const rick = this.placedRick;
        rick.cleanupDrag?.();
        this.placedRick = null;

        if (rick.miningInterval) clearInterval(rick.miningInterval);
        if (rick.timerInterval) clearInterval(rick.timerInterval);
        if (rick.despawnTimeout) clearTimeout(rick.despawnTimeout);

        if (!animate) {
            for (const node of [rick.rig || rick.sprite, rick.tooltip, rick.timerBadge, rick.zoneEl]) node?.remove();
            this.updateDPS(); this.updateUI(true);
            this.scheduleNextRick();
            return;
        }
        if (rick.tooltip) rick.tooltip.remove();
        if (rick.timerBadge) {
            rick.timerBadge.style.transition = 'opacity 0.3s ease';
            rick.timerBadge.style.opacity = '0';
            setTimeout(() => { if (rick.timerBadge?.parentNode) rick.timerBadge.remove(); }, 300);
        }
        if (rick.zoneEl) {
            rick.zoneEl.style.transition = 'opacity 0.4s ease';
            rick.zoneEl.style.opacity = '0';
            setTimeout(() => { if (rick.zoneEl?.parentNode) rick.zoneEl.remove(); }, 400);
        }

        // Recalculate DPS without Rick boost
        this.updateDPS();
        this.updateUI();

        // Spawn exit portal directly under Rick
        const leftPanel = document.getElementById('left-panel');
        const helperContainer = document.getElementById('helper-container') || leftPanel;
        const portal = document.createElement('img');
        portal.className = 'rick-exit-portal';
        portal.src = 'assets/general/rm/portal.webp';
        portal.style.left = (rick.x + 30) + 'px';
        portal.style.top = (rick.y + 40) + 'px';

        helperContainer.appendChild(portal);

        // Rick jumps in animation
        if (rick.sprite) {
            (rick.rig || rick.sprite).classList.add('rick-jumping-in');
            this.playSound('short_sparkle', {volume:.3});
            this.playSound('swipe_fast_low', {volume:.25});

            setTimeout(() => {
                (rick.rig || rick.sprite).remove();

                // Close and fade portal
                portal.classList.add('rick-portal-close');
                setTimeout(() => {
                    if (portal.parentNode) portal.remove();
                }, 350);
            }, 500);
        } else {
            if (portal.parentNode) portal.remove();
        }

        // Schedule the next Rick spawn
        this.scheduleNextRick();
    }

    hideRick() {
        if (this.rickStepTimeout) clearTimeout(this.rickStepTimeout);
        if (this.rickRetractTimeout) clearTimeout(this.rickRetractTimeout);

        const rick = document.getElementById('rick-doge');
        const portal = document.getElementById('rick-portal');

        if (rick) {
            rick.style.pointerEvents = 'none';
            rick.style.opacity = '0';
            setTimeout(() => {
                if (rick.parentNode) {
                    rick.parentNode.removeChild(rick);
                }
            }, 300);
        }

        if (portal) {
            setTimeout(() => {
                portal.style.opacity = '0';
                setTimeout(() => {
                    if (portal.parentNode) {
                        portal.parentNode.removeChild(portal);
                    }
                }, 400);
            }, 300);
        }

        this.rickVisible = false;
        this.scheduleNextRick();
    }

    scheduleNextRick() {
        this.startRickSpawn();
    }

    // Debug method to force Rick spawn
    forceRickSpawn() {
        if (this.placedRick) {
            this.despawnRick();
        }
        if (this.rickInterval) clearTimeout(this.rickInterval);
        if (this.rickStepTimeout) clearTimeout(this.rickStepTimeout);
        if (this.rickRetractTimeout) clearTimeout(this.rickRetractTimeout);
        if (this.rickClickDropTimeout) clearTimeout(this.rickClickDropTimeout);

        document.getElementById('rick-doge')?.remove();
        document.getElementById('rick-portal')?.remove();
        this.removeRickCursorSprite();

        this.rickVisible = false;
        this.isDraggingRick = false;

        this.spawnRick();
    }

    stopBackgroundRotation() {
        if (this.backgroundRotationInterval) {
            clearInterval(this.backgroundRotationInterval);
            this.backgroundRotationInterval = null;
        }
    }

    stopGame() {
        this.isPlaying = false;

        // Clear all intervals
        if (this.dpsInterval) {
            clearInterval(this.dpsInterval);
            this.dpsInterval = null;
        }
        if (this.backgroundRotationInterval) {
            clearInterval(this.backgroundRotationInterval);
            this.backgroundRotationInterval = null;
        }
        if (this.blinkInterval) {
            clearInterval(this.blinkInterval);
            this.blinkInterval = null;
        }
        if (this.rickInterval) {
            clearInterval(this.rickInterval);
            this.rickInterval = null;
        }
    }

    updateHelpers() {
        // Animate helpers
        this.helpers.forEach(helper => {
            // Helper animation logic would go here
        });
    }

    getVisibleDogecoinBalance() {
        const offline = this.offlineEarningsReport;
        const unclaimedOffline = offline && !offline.acknowledged ? offline.amount : 0;
        return Math.max(0, this.dogecoins - (this.pendingCoinDisplayAmount || 0) - unclaimedOffline);
    }

    updateDogecoinCounter() {
        document.getElementById('dogecoin-amount').textContent = this.formatCounterAmount(this.getVisibleDogecoinBalance());
    }

    updateUI(skipShopPrices = false) {
        // Pending mined coins become visible when their individual flight lands.
        this.updateDogecoinCounter();
        document.getElementById('dps-amount').textContent = this.formatCounterAmount(this.dps, true);
        this.updateDiamondCounter();
        this.updateInventoryUnread();
        this.updatePlanetSummary?.();
        this.syncDogebagField?.();
        this.syncFieldLoot?.();
        window.uiManager?.updateUpgradeTabCount?.();
        if (window.timeTravelManager) window.timeTravelManager.updateDogetalkieButton();

        // Update shop prices and quantities without rebuilding the entire shop (unless skipped)
        if (!skipShopPrices) {
            this.updateShopPrices();
        }

        document.getElementById('total-mined').textContent = this.formatNumber(Math.floor(this.totalMined));
        document.getElementById('total-clicks').textContent = this.formatNumber(this.totalClicks);
        const totalHelpersOwned =
            (this.helpers?.length || 0) +
            (this.moonHelpers?.length || 0) +
            (this.marsHelpers?.length || 0) +
            (this.jupiterHelpers?.length || 0); // Sum helpers across planets for an accurate counter.
        document.getElementById('helpers-owned').textContent = totalHelpersOwned;
        const activeLevelName = this.levels?.[this.currentLevel]?.name || this.currentLevel; // Match stats banner to current planet
        document.getElementById('current-level').textContent = activeLevelName;

        // Calculate current play time from session start plus total accumulated time.
        const currentPlayTime = Math.floor((Date.now() - this.startTime) / 1000) + this.totalPlayTime;
        document.getElementById('play-time').textContent = this.formatTime(currentPlayTime);
        document.getElementById('highest-dps').textContent = this.formatNumber(this.highestDps);
        const highestCrit = document.getElementById('highest-crit');
        if (highestCrit) highestCrit.textContent = this.formatNumber(this.records?.highestcrit || 0);
        this.updateTimelineHistoryUI?.();

        // Update mobile helper bar if on mobile
        if (this.isMobileDevice()) {
            this.updateMobileHelperBar();
        }

        // Rock health system removed - simplified mining
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    // HUD currencies use grouping; DPS keeps decimals instead of being floored.
    // Compact late-game amounts so the counters continue to fit small screens.
    formatCounterAmount(num, isDps = false) {
        if (num >= (isDps ? 1000 : 1000000)) return this.formatNumber(num);
        this._counterFormatters ??= {
            currency: new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }),
            dps: new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
        };
        return this._counterFormatters[isDps ? 'dps' : 'currency'].format(isDps ? num : Math.floor(num));
    }

    formatNumber(num) {
        if (!Number.isFinite(num)) return String(num);
        const magnitude = Math.abs(num);
        if (magnitude < 1e3) return Math.floor(num).toString();
        // Short-scale units: quadrillions use Q, quintillions Qi, and so on.
        const suffixes = ['', 'K', 'M', 'B', 'T', 'Q', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
        let tier = Math.floor(Math.log10(magnitude) / 3);
        if (tier >= suffixes.length) return num.toExponential(2);
        let scaled = num / (10 ** (tier * 3));
        // Carry rounding into the next unit instead of displaying 1000.00T, etc.
        if (Number(Math.abs(scaled).toFixed(2)) >= 1000) {
            tier += 1;
            if (tier >= suffixes.length) return num.toExponential(2);
            scaled = num / (10 ** (tier * 3));
        }
        return scaled.toFixed(2) + suffixes[tier];
    }

    showNotification(message, duration = 3000) {
        // Check if notifications are enabled
        if (this.notificationsEnabled === false) {
            return;
        }

        if (window.notificationManager) {
            return window.notificationManager.show(message, 'info', duration);
        }

        const container = document.getElementById('notifications');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        container.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('slide-out');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }

    playSound(soundFile, options) {
        // Use audio manager if available
        if (window.audioManager) {
            return window.audioManager.playSound(soundFile, options);
        }
    }

    stopSound(soundFile) {
        if (window.audioManager) {
            audioManager.stopSound(soundFile);
        }
    }

    checkAchievements() {
        // Achievement system - empty for now, ready for custom achievements
    }


    saveGame() {
        // Save current helpers to the appropriate array before saving game state
        if (this.currentLevel === 'earth') {
            this.earthPlacedHelpers = [...(this.earthPlacedHelpers || [])];
        } else if (this.currentLevel === 'moon') {
            this.moonPlacedHelpers = [...(this.moonPlacedHelpers || [])];
        } else if (this.currentLevel === 'mars') {
            this.marsPlacedHelpers = [...(this.marsPlacedHelpers || [])];
        } else if (this.currentLevel === 'jupiter') {
            this.jupiterPlacedHelpers = [...(this.jupiterPlacedHelpers || [])];
        }

        const saveData = {
            dogecoins: this.dogecoins,
            totalMined: this.totalMined,
            totalClicks: this.totalClicks,
            dps: this.dps,
            currentLevel: this.currentLevel,
            helpers: this.helpers,
            moonHelpers: this.moonHelpers,
            earthPlacedHelpers: this.earthPlacedHelpers,
            moonPlacedHelpers: this.moonPlacedHelpers,
            hasPlayedMoonLaunch: this.hasPlayedMoonLaunch,
            timestamp: Date.now()
        };

        localStorage.setItem('dogeminer_save', JSON.stringify(saveData));
        this.lastSave = Date.now();
    }

    loadGame() {
        const saveData = localStorage.getItem('dogeminer_save');
        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                this.dogecoins = data.dogecoins || 0;
                this.totalMined = data.totalMined || 0;
                this.totalClicks = data.totalClicks || 0;
                this.dps = data.dps || 0;
                this.currentLevel = data.currentLevel || 'earth';
                this.helpers = data.helpers || [];
                this.moonHelpers = data.moonHelpers || [];
                this.earthPlacedHelpers = data.earthPlacedHelpers || [];
                this.moonPlacedHelpers = data.moonPlacedHelpers || [];
                this.hasPlayedMoonLaunch = data.hasPlayedMoonLaunch || false;

                // Set placed helpers based on current level
                if (this.currentLevel === 'earth') {
                    this.placedHelpers = [...this.earthPlacedHelpers];
                } else if (this.currentLevel === 'moon') {
                    this.placedHelpers = [...this.moonPlacedHelpers];
                } else if (this.currentLevel === 'mars') {
                    this.placedHelpers = [...this.marsPlacedHelpers];
                } else if (this.currentLevel === 'jupiter') {
                    this.placedHelpers = [...this.jupiterPlacedHelpers];
                }

                // Update character and rock based on current level
                this.updateUI();
                // Notification handled by main.js
                return true;
            } catch (e) {
                console.error('Error loading save data:', e);
                this.showNotification('Error loading save data!');
                return false;
            }
        }
        return false;
    }

    getHelperData(helperType) {
        // First check if we have a ShopManager available with full helper data
        if (window.shopManager && window.shopManager.shopData) {
            // Try earth helpers first
            if (window.shopManager.shopData.helpers && window.shopManager.shopData.helpers[helperType]) {
                return window.shopManager.shopData.helpers[helperType];
            }

            // Then try moon helpers
            if (window.shopManager.shopData.moonHelpers && window.shopManager.shopData.moonHelpers[helperType]) {
                return window.shopManager.shopData.moonHelpers[helperType];
            }

            // Then try mars helpers
            if (window.shopManager.shopData.marsHelpers && window.shopManager.shopData.marsHelpers[helperType]) {
                return window.shopManager.shopData.marsHelpers[helperType];
            }
        }

        // Fallback to hardcoded helper data if not found in ShopManager
        // Return complete helper data based on type
        const earthHelpers = {
            'miningShibe': {
                baseDps: 0.2,
                icon: 'assets/helpers/shibes/shibes-idle-0.webp',
                miningSprite: 'assets/helpers/shibes/shibes-mine-0.webp',
                name: 'Mining Shibe'
            },
            'dogeKennels': {
                baseDps: 2,
                icon: 'assets/helpers/kennels/kennels-idle-0.webp',
                miningSprite: 'assets/helpers/kennels/kennels-mine-0.webp',
                name: 'Doge Kennels'
            },
            'streamerKittens': {
                baseDps: 4,
                icon: 'assets/helpers/kittens/kittens-idle-0.webp',
                miningSprite: 'assets/helpers/kittens/kittens-mine-0.webp',
                name: 'Streamer Kittens'
            },
            'spaceRocket': {
                baseDps: 9,
                icon: 'assets/helpers/rockets/rockets-idle-0.webp',
                miningSprite: 'assets/helpers/rockets/rockets-mine-0.webp',
                name: 'Space Rocket'
            },
            'timeMachineRig': {
                baseDps: 20,
                icon: 'assets/helpers/rigs/rigs-idle-0.webp',
                miningSprite: 'assets/helpers/rigs/rigs-mine-0.webp',
                name: 'Time Machine Mining Rig'
            },
            'infiniteDogebility': {
                baseDps: 50,
                icon: 'assets/helpers/dogebility/dogebility-idle-0.webp',
                miningSprite: 'assets/helpers/dogebility/dogebility-mine-0.webp',
                name: 'Infinite Dogebility'
            }
        };

        const moonHelpers = {
            'moonBase': {
                baseDps: 12,
                icon: 'assets/helpers/bases/bases-idle-0.webp',
                miningSprite: 'assets/helpers/bases/bases-mine-0.webp',
                name: 'Moon Base'
            },
            'moonShibe': {
                baseDps: 9,
                icon: 'assets/helpers/moonshibe/moonshibe-idle-0.webp',
                miningSprite: 'assets/helpers/moonshibe/moonshibe-mine-0.webp',
                name: 'Moon Shibe'
            },
            'dogeCar': {
                baseDps: 12,
                icon: 'assets/helpers/dogecar/dogecar-idle-0.webp',
                miningSprite: 'assets/helpers/dogecar/dogecar-mine-0.webp',
                name: 'Doge Car'
            },
            'landerShibe': {
                baseDps: 20,
                icon: 'assets/helpers/landershibe/landershibe-idle-0.webp',
                miningSprite: 'assets/helpers/landershibe/landershibe-mine-0.webp',
                name: 'Lander Shibe'
            },
            'marsRocket': {
                baseDps: 50,
                icon: 'assets/helpers/marsrocket/marsrocket-idle-0.webp',
                miningSprite: 'assets/helpers/marsrocket/marsrocket-mine-0.webp',
                name: 'Mars Rocket'
            },
            'dogeGate': {
                baseDps: 155,
                icon: 'assets/helpers/dogegate/dogegate-idle-0.webp',
                miningSprite: 'assets/helpers/dogegate/dogegate-mine-0.webp',
                name: 'Doge Gate'
            }
        };

        // Check both helper types
        if (earthHelpers[helperType]) {
            return earthHelpers[helperType];
        }

        if (moonHelpers[helperType]) {
            return moonHelpers[helperType];
        }

        // Default fallback
        return earthHelpers['miningShibe'];
    }

    recreateHelperSprites() {
        // Clear existing helper sprites
        const existingSprites = document.querySelectorAll('.helper-sprite');
        existingSprites.forEach(sprite => { if (!sprite.classList.contains('rick-helper')) sprite.remove(); });

        const existingTooltips = document.querySelectorAll('.helper-tooltip');
        existingTooltips.forEach(tooltip => tooltip.remove());

        // Recreate all helper sprites
        this.placedHelpers.forEach(placedHelper => {
            this.createHelperSprite(placedHelper);
        });

        // Restart animations for all helpers
        this.startAllHelperAnimations();
    }

    startAllHelperAnimations() {
        // Start animations for all placed helpers
        this.placedHelpers.forEach(placedHelper => {
            if (placedHelper.isMining && placedHelper.helper) {
                const helperSprite = document.querySelector(`img[data-helper-id="${placedHelper.id}"]`);
                if (helperSprite && placedHelper.helper.miningSprite) {
                    this.startHelperAnimation(placedHelper, helperSprite);
                }
            }
        });
    }

    clearAllHelperSprites() {
        // Clear all helper sprites from the DOM
        const existingSprites = document.querySelectorAll('.helper-sprite');
        existingSprites.forEach(sprite => { if (!sprite.classList.contains('rick-helper')) sprite.remove(); });

        const existingTooltips = document.querySelectorAll('.helper-tooltip');
        existingTooltips.forEach(tooltip => tooltip.remove());

        const existingNameTooltips = document.querySelectorAll('.helper-name-tooltip');
        existingNameTooltips.forEach(tooltip => { if (tooltip.id !== 'placed-rick-tooltip') tooltip.remove(); });
    }
}

// Global game instance
let game;
