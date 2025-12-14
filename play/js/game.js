// DogeMiner: Community Edition - Main Game Logic
class DogeMinerGame {
    constructor() {
        this.dogecoins = 0;
        this.totalMined = 0;
        this.totalClicks = 0;
        this.dps = 0;
        this.highestDps = 0;
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
            'Babylion122', 'rkn', 'Raspy', 'Melon', 'News', 'Rick', 'Sam', 'Josiah', 'Miya', 'Creedoo',
            'Cottage', 'Cheese', 'Bikini', 'Silver', 'Sorrel', 'Kyle', 'DwellingStars', 'Done', 'Peanut', 'Fry',
            'Bruno', 'Charlie', 'Emmet', 'Lucy', 'Vincent', 'tothestars693', 'Cherie', 'Crush', 'RockMelon', 'HoneyMelon', 'Karvão',
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
        this.notificationsEnabled = true;
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
        this.maxEffects = 20; // Limit concurrent effects
        this.maxParticles = 50; // Limit concurrent particles
        
        // Helper placement system
        this.helperBeingPlaced = null;
        this.helperSpriteBeingPlaced = null;
        this.placedHelpers = [];
        this.helpersOnCursor = []; // Array to hold multiple helpers being placed // Array of placed helper objects with positions
        
        // Background rotation
        this.backgrounds = [
            'backgrounds/bg1.jpg',
            'backgrounds/bg3.jpg',
            'backgrounds/bg4.jpg',
            'backgrounds/bg5.jpg',
            'backgrounds/bg6.jpg',
            'backgrounds/bg7.jpg',
            'backgrounds/bg9.jpg',
            'backgrounds/bg-new.jpg'
        ];
        this.currentBackgroundIndex = 0;
        this.backgroundRotationInterval = null;
        
        // Blinking animation
        this.blinkInterval = null;
        
        // Level definitions for UI updates
        this.levels = {
            earth: {
                name: 'Earth',
                background: 'assets/backgrounds/bg/bg1.jpg',
                rock: 'assets/general/rocks/earth.png',
                character: 'assets/general/character/standard.png'
            },
            moon: {
                name: 'Moon',
                background: 'assets/backgrounds/bg/bgmoon01.jpg',
                rock: 'assets/general/rocks/moon.png',
                character: 'assets/general/character/spacehelmet.png'
            },
            mars: {
                name: 'Mars',
                background: 'assets/backgrounds/bg/bgmars01.jpg',
                rock: 'assets/general/rocks/mars.png',
                character: 'assets/general/character/party.png'
            },
            jupiter: {
                name: 'Jupiter',
                background: 'assets/backgrounds/bg/bgmars01.jpg',
                rock: 'assets/general/rocks/jupiter.png',
                character: 'assets/general/character/spacehelmet.png'
            },
            titan: {
                name: 'Titan',
                background: 'assets/backgrounds/titan02.jpg',
                rock: 'assets/general/rocks/titan.png',
                character: 'assets/general/character/spacehelmet.png'
            }
        };
        
        // Unlock system
        this.unlockedLevels = new Set(['earth']);
        this.unlockedAchievements = new Set();
        
        // UI state flags
        
        // Rick Doge system
        this.rickInterval = null;
        this.rickVisible = false;
        
        // DPS interval for performance
        this.dpsInterval = null;
        this.rickSprites = [
            'assets/general/rm/r1.png',
            'assets/general/rm/r2.png',
            'assets/general/rm/r3.png',
            'assets/general/rm/r4.png'
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
    }
    
    setupCutsceneSystem() {
        this.cutsceneOverlay = document.getElementById('cutscene-overlay');
        this.cutsceneVideo = document.getElementById('cutscene-video');
        this.cutsceneSkipButton = document.getElementById('cutscene-skip');
        
        if (!this.cutsceneOverlay || !this.cutsceneVideo || !this.cutsceneSkipButton) {
            console.warn('Cutscene elements not found in DOM. Creating fallback overlay.');
            this.cutsceneOverlay = document.createElement('div');
            this.cutsceneOverlay.id = 'cutscene-overlay';
            this.cutsceneOverlay.className = 'cutscene-overlay';
            
            this.cutsceneVideo = document.createElement('video');
            this.cutsceneVideo.id = 'cutscene-video';
            this.cutsceneVideo.className = 'cutscene-video';
            this.cutsceneVideo.setAttribute('playsinline', '');
            
            this.cutsceneSkipButton = document.createElement('button');
            this.cutsceneSkipButton.id = 'cutscene-skip';
            this.cutsceneSkipButton.className = 'cutscene-skip hidden';
            this.cutsceneSkipButton.textContent = 'SKIP';
            
            this.cutsceneOverlay.appendChild(this.cutsceneVideo);
            this.cutsceneOverlay.appendChild(this.cutsceneSkipButton);
            document.body.appendChild(this.cutsceneOverlay);
        }
        
        this.cutsceneSkipButton.addEventListener('click', () => {
            this.closeCutscene();
        });
        
        this.cutsceneVideo.addEventListener('ended', () => {
            this.closeCutscene();
        });
    }
    
    playMoonLaunchCutscene() {
        if (this.hasPlayedMoonLaunch || this.isCutscenePlaying) return;
        if (!this.cutsceneOverlay || !this.cutsceneVideo) return;
        
        this.isCutscenePlaying = true;
        this.hasPlayedMoonLaunch = true;
        this.isMouseDown = false;
        this.isSpaceDown = false;
        
        console.log('[Cutscene] Starting Moon Launch cutscene');
        console.log('[Cutscene] Audio manager available:', !!window.audioManager);
        if (window.audioManager) {
            audioManager.suspendAllAudio();
        }
        
        this.cutsceneVideo.src = '../assets/The Moon Launch.mp4';
        this.cutsceneVideo.currentTime = 0;
        this.cutsceneVideo.pause();
        console.log('[Cutscene] Overlay active');
        this.cutsceneOverlay.classList.add('active');
        document.body.classList.add('cutscene-active');
        
        if (this.cutsceneSkipTimeout) {
            clearTimeout(this.cutsceneSkipTimeout);
            this.cutsceneSkipTimeout = null;
        }
        this.cutsceneSkipButton.classList.add('hidden');
        this.cutsceneSkipTimeout = setTimeout(() => {
            this.cutsceneSkipButton.classList.remove('hidden');
            console.log('[Cutscene] Skip button shown');
        }, 5000);
        
        const playPromise = this.cutsceneVideo.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
                console.warn('Cutscene playback was blocked, showing skip button immediately.');
                this.cutsceneSkipButton.classList.remove('hidden');
            });
        }
    }
    
    closeCutscene() {
        if (!this.isCutscenePlaying) return;
        this.isCutscenePlaying = false;
        console.log('[Cutscene] Closing Moon Launch cutscene');
        
        if (this.cutsceneVideo) {
            this.cutsceneVideo.pause();
            this.cutsceneVideo.currentTime = 0;
        }
        if (this.cutsceneOverlay) {
            this.cutsceneOverlay.classList.remove('active');
        }
        document.body.classList.remove('cutscene-active');
        
        if (this.cutsceneSkipTimeout) {
            clearTimeout(this.cutsceneSkipTimeout);
            this.cutsceneSkipTimeout = null;
        }
        this.cutsceneSkipButton?.classList.add('hidden');
        
        if (window.audioManager) {
            audioManager.resumeAudio();
        }
        
        // After moon launch cutscene, switch to moon
        if (this.hasPlayedMoonLaunch && this.currentLevel !== 'moon') {
            console.log('[Cutscene] Switching to moon after cutscene');
            // Use a timeout to ensure UI is updated before planet switch
            setTimeout(() => {
                // Find and click the moon tab
                const moonTab = document.querySelector('.planet-tab[onclick*="moon"]');
                if (moonTab) {
                    moonTab.click();
                } else {
                    // Fallback if moon tab can't be found: call switchPlanet directly
                    if (window.switchPlanet) {
                        window.switchPlanet('moon');
                    }
                }
            }, 500);
        }
        
        this.updateUI();
    }
    
    addGlobalMouseTracking() {
        // Track mouse position globally for cursor sprite positioning
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
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
            if (e.code === 'Space' && !e.repeat) {
                e.preventDefault();
                this.isSpaceDown = true;
                this.processClick();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.isSpaceDown = false;
                this.endSwing();
            }
        });
        
        // Auto-save is now handled by SaveManager
    }
    
    handleRockClick(event = null) {
        if (!this.isPlaying || this.isIntroPlaying || this.isCutscenePlaying || this.isTransitioning) return;

        this.totalClicks++;

        this.swingPickaxe();
        this.bounceDoge();

        const coinsPerHit = this.getClickPower();
        this.dogecoins += coinsPerHit;
        this.totalMined += coinsPerHit;

        if (this.clickEffects.length < this.maxEffects) {
            this.createFloatingCoin(coinsPerHit, event);
            this.createClickEffect(event);
        }
        if (this.particles.length < this.maxParticles) {
            this.createParticleEffect(event);
        }

        this.updateUI();
        this.playSound('pick');
    }

    processClick(event = null) {
        const now = Date.now();
        if (this.isIntroPlaying || this.isCutscenePlaying || this.isTransitioning) {
            return;
        }

        this.clickTimes = this.clickTimes.filter(time => now - time < 1000);

        if (this.clickTimes.length >= this.maxCPS) {
            return;
        }

        if (now - this.lastClickTime < 66) {
            return;
        }

        this.clickTimes.push(now);
        this.lastClickTime = now;

        this.handleRockClick(event);
        this.startSwing();
    }

    getClickPower() {
        const basePower = 1; // 1% per hit like DogeMiner 2
        return basePower;
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
                doge.src = 'assets/general/character/standard.png';
            } else if (this.currentLevel === 'moon') {
                doge.src = 'assets/general/character/spacehelmet.png';
            } else if (this.currentLevel === 'mars') {
                doge.src = 'assets/general/character/party.png';
            } else if (this.currentLevel === 'jupiter') {
                doge.src = 'assets/general/character/spacehelmet.png';
            }
            doge.classList.remove('float');
        }

        characterContainer.classList.remove('doge-intro');
        if (pickaxe) pickaxe.classList.remove('pickaxe-intro');

        setTimeout(() => {
            characterContainer.style.visibility = 'visible';

            const restartAnimation = (element, className) => {
                element.classList.remove(className);
                void element.offsetWidth;
                element.classList.add(className);
            };

            restartAnimation(characterContainer, 'doge-intro');
            setTimeout(() => {
                characterContainer.classList.remove('doge-intro');
                characterContainer.style.transform = '';
            }, 2600);

            if (pickaxe) {
                restartAnimation(pickaxe, 'pickaxe-intro');
                setTimeout(() => {
                    pickaxe.classList.remove('pickaxe-intro');
                }, 1800);
            }

            const introDuration = 1000;
            const squashDuration = 350;
            const startDelay = 500;
            setTimeout(() => {
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

        // Always start the swing immediately
        pickaxe.classList.remove('pickaxe-intro');
        pickaxe.classList.remove('swinging');
        void pickaxe.offsetWidth; // Force reflow so animation can restart
        pickaxe.classList.add('swinging');

        // Clear any existing timeout since we're starting a new swing
        if (this.swingTimeout) {
            clearTimeout(this.swingTimeout);
            this.swingTimeout = null;
        }
    }

    endSwing() {
        const pickaxe = document.getElementById('pickaxe');
        if (!pickaxe) return;

        if (!this.isMouseDown && !this.isSpaceDown) {
            if (this.swingTimeout) {
                clearTimeout(this.swingTimeout);
                this.swingTimeout = null;
            }

            this.swingTimeout = setTimeout(() => {
                if (!this.isMouseDown && !this.isSpaceDown) {
                    pickaxe.classList.remove('swinging');
                }
                this.swingTimeout = null;
            }, 150); // Allow swing animation to complete before resetting
        }
    }
    
    // Rock health system removed - simplified mining
    
    createParticleEffect(event) {
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
            particle.src = 'assets/general/rocks/earth_particle.png';
            particle.className = 'earth-particle';
            if (this.currentLevel === 'moon') {
                particle.classList.add('moon-particle');
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
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
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
    
    
    createFloatingCoin(amount, event = null) {
        // Get the floating coins container
        const container = document.getElementById('floating-coins');
        if (!container) return;
        
        let startX, startY;
        
        if (event && event.clientX !== undefined) {
            // Use mouse position for mouse clicks
            const containerRect = container.getBoundingClientRect();
            startX = event.clientX - containerRect.left;
            startY = event.clientY - containerRect.top;
        } else {
            // Fall back to rock position for keyboard clicks
            const rock = document.getElementById('main-rock');
            const rockRect = rock.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            startX = rockRect.left + rockRect.width / 2 - containerRect.left;
            startY = rockRect.top + rockRect.height / 2 - containerRect.top;
        }
        
        // Create DogeCoin image
        const coin = document.createElement('img');
        coin.src = 'assets/general/dogecoin_70x70.png';
        coin.className = 'dogecoin-effect';
        coin.style.position = 'absolute';
        coin.style.left = startX + 'px';
        coin.style.top = startY + 'px';
        coin.style.width = '35px';
        coin.style.height = '35px';
        coin.style.transform = 'translate(-50%, -50%)';
        coin.style.zIndex = '20';
        
        // Create +amount text
        const text = document.createElement('div');
        text.className = 'dogecoin-text';
        text.textContent = '+' + amount;
        text.style.position = 'absolute';
        text.style.left = (startX + 40) + 'px';
        text.style.top = startY + 'px';
        text.style.color = 'rgb(180, 155, 60)';
        text.style.fontWeight = '900';
        text.style.fontSize = '20px';
        text.style.fontFamily = 'DogeSans, sans-serif';
        text.style.textShadow = '2px 2px 0px #ffffff, -2px -2px 0px #ffffff, 2px -2px 0px #ffffff, -2px 2px 0px #ffffff';
        text.style.transform = 'translate(-50%, -50%)';
        text.style.zIndex = '21';
        
        // Add to container
        container.appendChild(coin);
        container.appendChild(text);
        
        // Animate coin
        coin.animate([
            { transform: 'translate(-50%, -50%) scale(1.2)', opacity: 1 },
            { transform: 'translate(-50%, -150px) scale(0.4)', opacity: 0 }
        ], {
            duration: 1500,
            easing: 'ease-out',
            fill: 'forwards'
        });
        
        // Animate text
        text.animate([
            { transform: 'translate(-50%, -50%)', opacity: 1 },
            { transform: 'translate(-50%, -150px)', opacity: 0 }
        ], {
            duration: 1500,
            easing: 'ease-out',
            fill: 'forwards'
        });
        
        // Remove after animation
        setTimeout(() => {
            if (coin.parentNode) coin.parentNode.removeChild(coin);
            if (text.parentNode) text.parentNode.removeChild(text);
        }, 1500);
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
        if (this.isCutscenePlaying) return false;

        console.log('=== buyHelper called ===');
        console.log('Helper type:', helperType);
        console.log('isPlacingHelpers:', this.isPlacingHelpers);
        console.log('Current placementQueue length:', this.placementQueue?.length || 0);
        console.log('helpersOnCursor length:', this.helpersOnCursor?.length || 0);
        console.log('Current level:', this.currentLevel);
        console.log('Stack trace:', new Error().stack);

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
        const cost = Math.floor(helperData.baseCost * Math.pow(1.15, owned));

        if (this.dogecoins < cost) {
            return false;
        }

        this.dogecoins -= cost;

        if (window.audioManager) {
            window.audioManager.playSound('ching');
        }

        helperArray.push({
            type: helperType,
            helper: helperData,
            dps: helperData.baseDps
        });

        // Recalculate total DPS with the newly purchased helper counted.
        this.updateDPS();

        this.addHelperToCursor(helperType, helperData);
        this.updateShopPrices();
        this.updateUI();

        if (window.uiManager) {
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
    
    addHelperToCursor(helperType, helper, shouldStartPlacement = true) {
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
            const helperSprite = document.createElement('img');
            helperSprite.src = helperData.helper.icon;
            helperSprite.className = 'helper-sprite attached-to-mouse';
            helperSprite.style.opacity = '0.7';
            helperSprite.dataset.stackIndex = index;
            
            // Add special classes for different helper types
            if (helperData.type === 'spaceRocket') {
                helperSprite.classList.add('rocket');
            } else if (helperData.type === 'miningShibe' || helperData.type === 'moonShibe') {
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
                if (firstHelper.type === 'miningShibe' || firstHelper.type === 'moonShibe') {
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
        
        // Add listeners
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('click', handleClick);
        document.addEventListener('contextmenu', handleRightClick);
        
        // Store references for cleanup
        this.placementListeners = {
            mousemove: handleMouseMove,
            click: handleClick,
            contextmenu: handleRightClick
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
                name: helperData.helper?.name || helperData.name || this.getHelperName(helperData.type) // Use helper data name
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
    
    adjustStackForDogeCollision(helperPositions) {
        // Get Doge's position and size
        const leftPanel = document.getElementById('left-panel');
        const panelRect = leftPanel.getBoundingClientRect();
        
        // Doge is centered in the mining area
        // Mining area is positioned at calc(50% + 50px) from top and calc(50% - 20px) from left
        const dogeX = (panelRect.width / 2) - 20; // Center minus 20px offset
        const dogeY = (panelRect.height / 2) + 50; // Center plus 50px offset
        const dogeWidth = 120; // Doge width from CSS
        const dogeHeight = 120; // Approximate height (assuming square-ish)
        
        // Expand Doge's collision area to prevent helpers from being placed too close
        // Use different buffer sizes for different directions
        const leftRightBuffer = 40; // Larger buffer for left/right to prevent placement behind Doge
        const upDownBuffer = 20; // Smaller buffer for up/down to prevent excessive movement
        
        const dogeLeft = dogeX - dogeWidth / 2 - leftRightBuffer;
        const dogeRight = dogeX + dogeWidth / 2 + leftRightBuffer;
        const dogeTop = dogeY - dogeHeight / 2 - upDownBuffer;
        const dogeBottom = dogeY + dogeHeight / 2 + upDownBuffer;
        
        // Check if any individual helper collides with Doge's expanded area (including buffer zone)
        let hasCollision = false;
        let minMoveLeft = 0;
        let minMoveRight = 0;
        let minMoveUp = 0;
        let minMoveDown = 0;
        
        helperPositions.forEach((pos, index) => {
            const helperSize = pos.type === 'miningShibe' ? 30 : 60;
            const helperLeft = pos.x;
            const helperRight = pos.x + helperSize;
            const helperTop = pos.y;
            const helperBottom = pos.y + helperSize;
            
            // Check if this helper collides with Doge's expanded area (including buffer zone)
            if (helperRight > dogeLeft && helperLeft < dogeRight && 
                helperBottom > dogeTop && helperTop < dogeBottom) {
                
                hasCollision = true;
                
                // Calculate how much this helper needs to move in each direction
                const moveLeft = Math.abs(helperRight - dogeLeft) + 30; // 30px buffer for more distance
                const moveRight = Math.abs(helperLeft - dogeRight) + 30; // 30px buffer for more distance
                const moveUp = Math.abs(helperBottom - dogeTop) + 10; // 10px buffer (reverted to original)
                const moveDown = Math.abs(helperTop - dogeBottom) + 10; // 10px buffer (reverted to original)
                
                // Track the maximum movement needed in each direction
                minMoveLeft = Math.max(minMoveLeft, moveLeft);
                minMoveRight = Math.max(minMoveRight, moveRight);
                minMoveUp = Math.max(minMoveUp, moveUp);
                minMoveDown = Math.max(minMoveDown, moveDown);
            }
        });
        
        if (hasCollision) {
            // Find the direction that requires the least movement for the entire stack
            const minMovement = Math.min(minMoveLeft, minMoveRight, minMoveUp, minMoveDown);
            
            // Apply the adjustment to the entire stack
            if (minMovement === minMoveLeft) {
                // Move entire stack left
                return { x: -minMoveLeft, y: 0 };
            } else if (minMovement === minMoveRight) {
                // Move entire stack right
                return { x: minMoveRight, y: 0 };
            } else if (minMovement === minMoveUp) {
                // Move entire stack up
                return { x: 0, y: -minMoveUp };
            } else {
                // Move entire stack down
                return { x: 0, y: minMoveDown };
            }
        }
        // No collision, no adjustment needed
        return { x: 0, y: 0 };
    }

    adjustStackForBoundaries(helperPositions) {
        // Get the left panel dimensions
        const leftPanel = document.getElementById('left-panel');
        const panelRect = leftPanel.getBoundingClientRect();
        
        // Panel boundaries with some padding
        const panelLeft = 10; // 10px padding from left edge
        const panelRight = panelRect.width - 10; // 10px padding from right edge
        const panelTop = 10; // 10px padding from top edge
        const panelBottom = panelRect.height - 10; // 10px padding from bottom edge
        
        // Find the minimum adjustment needed to keep all helpers within bounds
        let minAdjustX = 0;
        let minAdjustY = 0;
        let maxNegativeAdjustX = 0; // Track the most negative adjustment needed
        
        helperPositions.forEach((pos, index) => {
            const helperSize = pos.type === 'miningShibe' ? 30 : 60;
            const helperLeft = pos.x;
            const helperRight = pos.x + helperSize;
            const helperTop = pos.y;
            const helperBottom = pos.y + helperSize;
            
            // Check if helper is outside panel boundaries
            if (helperLeft < panelLeft) {
                // Helper is too far left, need to move right
                const adjustRight = panelLeft - helperLeft;
                minAdjustX = Math.max(minAdjustX, adjustRight);
            }
            
            if (helperRight > panelRight) {
                // Helper is too far right, need to move left
                const adjustLeft = helperRight - panelRight;
                maxNegativeAdjustX = Math.min(maxNegativeAdjustX, -adjustLeft);
            }
            
            if (helperTop < panelTop) {
                // Helper is too far up, need to move down
                const adjustDown = panelTop - helperTop;
                minAdjustY = Math.max(minAdjustY, adjustDown);
            }
            
            if (helperBottom > panelBottom) {
                // Helper is too far down, need to move up
                const adjustUp = helperBottom - panelBottom;
                minAdjustY = Math.min(minAdjustY, -adjustUp); // Negative adjustment to move up
            }
        });
        
        // Apply the boundary adjustment to all helpers
        const finalAdjustX = minAdjustX + maxNegativeAdjustX;
        helperPositions.forEach((pos, index) => {
            pos.x += finalAdjustX;
            pos.y += minAdjustY;
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
        // Simple and compatible chromatic aberration effect
        const tl = gsap.timeline();
        
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
        if (helperType === 'miningShibe') {
            return this.getRandomMiningShibeName();
        }
        return this.helperNames[helperType] || helperType;
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
        
        const helperSprite = document.createElement('img');
        helperSprite.src = placedHelper.helper.icon; // Use icon as idle sprite
        helperSprite.className = 'helper-sprite';
        helperSprite.style.left = placedHelper.x + 'px';
        helperSprite.style.top = placedHelper.y + 'px';
        helperSprite.dataset.helperId = placedHelper.id;
        
        // Add special classes for different helper types
        if (placedHelper.type === 'spaceRocket') {
            helperSprite.classList.add('rocket');
        } else if (placedHelper.type === 'miningShibe' || placedHelper.type === 'moonShibe') {
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
        const helperName = placedHelper.name
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
        } else if (placedHelper.type === 'miningShibe' || placedHelper.type === 'moonShibe') {
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
        
        // Add hover events for tooltip visibility
        helperSprite.addEventListener('mouseenter', () => {
            nameTooltip.style.opacity = '1';
        });
        
        helperSprite.addEventListener('mouseleave', () => {
            nameTooltip.style.opacity = '0';
        });
        
        // Add drag-and-drop functionality
        this.addDragAndDropToHelper(helperSprite, placedHelper, nameTooltip);
        
        // Remove bounce animation class after animation completes
        setTimeout(() => {
            helperSprite.classList.remove('place-bounce');
        }, 600); // Match animation duration
        
        // Start mining animation after a short delay
        setTimeout(() => {
            this.startHelperMining(placedHelper);
        }, 1000);
    }
    
    addDragAndDropToHelper(helperSprite, placedHelper, nameTooltip) {
        let isDragging = false;
        let hasMoved = false;
        let pickedUpHelper = null;
        
        // Make helper draggable
        helperSprite.style.cursor = 'grab';
        
        helperSprite.addEventListener('mousedown', (e) => {
            // Prevent drag-and-drop ONLY during helper placement (buy mode)
            // Don't block during normal drag-and-drop (helpers can be on cursor for dragging)
            console.log('Drag mousedown - isPlacingHelpers:', this.isPlacingHelpers);
            if (this.isPlacingHelpers) {
                console.log('BLOCKED: Drag attempt during placement');
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }
            
            e.preventDefault();
            isDragging = true;
            hasMoved = false;
            pickedUpHelper = null;
            helperSprite.style.cursor = 'grabbing';
            
            // Stop mining animation
            this.stopHelperMining(placedHelper);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging && !hasMoved) {
                // First movement - pick up the helper immediately
                hasMoved = true;
                pickedUpHelper = this.pickupHelper(placedHelper, helperSprite, nameTooltip);
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (isDragging && pickedUpHelper) {
                // Drop the helper at current mouse position, centered on cursor
                const leftPanel = document.getElementById('left-panel');
                const panelRect = leftPanel.getBoundingClientRect();
                
                // Calculate centered position
                const helperSize = pickedUpHelper.type === 'miningShibe' ? 30 : 60;
                const offset = helperSize / 2; // Center the helper on cursor
                
                const x = e.clientX - panelRect.left - offset;
                const y = e.clientY - panelRect.top - offset;
                
                this.dropPickedUpHelper(pickedUpHelper, x, y);
            }
            
            isDragging = false;
            hasMoved = false;
            pickedUpHelper = null;
            helperSprite.style.cursor = 'grab';
        });
    }
    
    pickupHelper(placedHelper, helperSprite, nameTooltip) {
        // Store the original name for preservation
        const originalName = placedHelper.name;
        
        // Remove helper from placed helpers array
        const helperIndex = this.placedHelpers.findIndex(helper => helper.id === placedHelper.id);
        if (helperIndex !== -1) {
            this.placedHelpers.splice(helperIndex, 1);
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
        
        // Store the handler so we can remove it later
        this.dragMousemoveHandler = mousemoveHandler;
        
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
            // Stop animation and reset to idle sprite
            this.stopHelperAnimation(helperSprite);
            helperSprite.src = placedHelper.helper.icon;
            placedHelper.isMining = false;
        }
    }
    
    startHelperAnimation(placedHelper, helperSprite) {
        let isIdle = true;
        
        // Use 1fps for time machine rig and dogebility drive (less eye strain)
        // Use 3fps for all other helpers
        const isSlowAnimation = placedHelper.type === 'timeMachineRig' || placedHelper.type === 'infiniteDogebility';
        const animationInterval = isSlowAnimation ? 1000 : 333; // 1fps = 1000ms, 3fps = 333ms
        
        
        const intervalId = setInterval(() => {
            if (isIdle) {
                helperSprite.src = placedHelper.helper.miningSprite || placedHelper.helper.icon;
            } else {
                helperSprite.src = placedHelper.helper.icon;
            }
            isIdle = !isIdle;
        }, animationInterval);
        
        // Store interval ID for cleanup
        helperSprite.dataset.animationInterval = intervalId;
    }
    
    stopHelperAnimation(helperSprite) {
        const intervalId = helperSprite.dataset.animationInterval;
        if (intervalId) {
            clearInterval(parseInt(intervalId));
            helperSprite.dataset.animationInterval = '';
        }
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
        
        // Remove event listeners
        if (this.placementListeners) {
            document.removeEventListener('mousemove', this.placementListeners.mousemove);
            document.removeEventListener('click', this.placementListeners.click);
            document.removeEventListener('contextmenu', this.placementListeners.contextmenu);
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
    
    updateDPS() {
        // Calculate Earth helpers DPS
        const earthDPS = this.helpers.reduce((total, helper) => {
            return total + helper.dps;
        }, 0);
        
        // Calculate Moon helpers DPS
        const moonDPS = this.moonHelpers.reduce((total, helper) => {
            return total + helper.dps;
        }, 0);
        
        // Calculate Mars, Jupiter, and Titan helpers DPS
        const marsDPS = this.marsHelpers.reduce((total, helper) => total + helper.dps, 0);
        const jupiterDPS = this.jupiterHelpers.reduce((total, helper) => total + helper.dps, 0);
        const titanDPS = this.titanHelpers.reduce((total, helper) => total + helper.dps, 0);

        this.dps = earthDPS + moonDPS + marsDPS + jupiterDPS + titanDPS;
        
        // Update highest DPS
        if (this.dps > this.highestDps) {
            this.highestDps = this.dps;
        }
    }
    
    updateShopPrices() {
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
                        const cost = Math.floor(helper.baseCost * Math.pow(1.15, owned));
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
                        
                        // Update button state using the refreshed affordability check
                        if (canAfford) {
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
        
        // DPS updates every second for better performance
        this.dpsInterval = setInterval(() => {
            if (this.isPlaying && this.dps > 0) {
                this.dogecoins += this.dps;
                this.totalMined += this.dps;
                this.updateUI();
            }
        }, 1000);
        
        const gameLoop = () => {
            if (this.isPlaying) {
                this.updateHelpers();
            }
            
            requestAnimationFrame(gameLoop);
        };
        
        gameLoop();
    }
    
    startBackgroundRotation() {
        // Start background rotation every 15 seconds
        this.backgroundRotationInterval = setInterval(() => {
            this.rotateBackground();
        }, 15000);
    }
    
    rotateBackground() {
        // Remove active class from current background
        const currentImage = document.getElementById(`background-image-${this.currentBackgroundIndex + 1}`);
        if (currentImage) {
            currentImage.classList.remove('active');
        }
        
        // Move to next background
        this.currentBackgroundIndex = (this.currentBackgroundIndex + 1) % this.backgrounds.length;
        
        // Add active class to new background
        const nextImage = document.getElementById(`background-image-${this.currentBackgroundIndex + 1}`);
        if (nextImage) {
            nextImage.classList.add('active');
        }
        
        console.log(`Background rotated to: ${this.backgrounds[this.currentBackgroundIndex]}`);
    }

    // Keep the DOM background elements aligned with the active planet's background pool.
    syncBackgroundImages(forceActive = false) {
        const container = document.getElementById('background-container');
        if (!container) {
            return;
        }

        const imageNodes = Array.from(container.querySelectorAll('.background-image'));
        if (!imageNodes.length) {
            return;
        }

        let pool = Array.isArray(this.backgrounds) ? [...this.backgrounds] : [];
        if (!pool.length) {
            return;
        }

        if (pool.length > imageNodes.length) {
            pool = pool.slice(0, imageNodes.length);
        }

        if (this.currentBackgroundIndex >= pool.length) {
            this.currentBackgroundIndex = 0;
        }

        imageNodes.forEach((img, idx) => {
            if (idx < pool.length) {
                const desiredSrc = pool[idx];
                const currentSrc = img.getAttribute('src') || '';
                if (!currentSrc.endsWith(desiredSrc)) {
                    img.src = desiredSrc;
                }
                img.style.display = '';

                if (forceActive) {
                    if (idx === this.currentBackgroundIndex) {
                        img.classList.add('active');
                    } else {
                        img.classList.remove('active');
                    }
                }
            } else {
                img.style.display = 'none';
                if (forceActive) {
                    img.classList.remove('active');
                }
            }
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
            closedEyesSprite = 'assets/general/character/closed_eyes.png';
        } else if (this.currentLevel === 'moon') {
            closedEyesSprite = 'assets/general/character/closed_space.png';
        } else if (this.currentLevel === 'mars') {
            // Mars uses party sprite with happy variant for blinking
            closedEyesSprite = 'assets/general/character/happy_party.png';
        } else if (this.currentLevel === 'jupiter') {
            // Jupiter uses space helmet sprite like the Moon
            closedEyesSprite = 'assets/general/character/closed_space.png';
        } else if (this.currentLevel === 'titan') {
            // Titan uses space helmet (eyes open), blink with closed_space (eyes closed)
            closedEyesSprite = 'assets/general/character/closed_space.png';
        } else {
            // Default fallback
            closedEyesSprite = 'assets/general/character/closed_eyes.png';
        }
        
        // Change to closed eyes
        doge.src = closedEyesSprite;
        
        // Blink for 200ms
        setTimeout(() => {
            doge.src = originalSrc;
        }, 200);
    }
    
    startSearchdogAnimation() {
        const searchdogs = document.querySelectorAll('.searchdog');
        if (searchdogs.length === 0) return;
        
        let isFrame1 = true;
        
        // Alternate between the two frames every 1000ms (1 second) for all searchdogs
        setInterval(() => {
            searchdogs.forEach(searchdog => {
                if (searchdog) {
                    searchdog.src = isFrame1 
                        ? 'assets/general/searchdog_2.png' 
                        : 'assets/general/searchdog_1.png';
                }
            });
            isFrame1 = !isFrame1;
        }, 1000);
    }
    
    startRickSpawn() {
        // Rick spawns every 3-5 minutes (180-300 seconds)
        const spawnTime = 180000 + Math.random() * 120000; // 3-5 minutes
        this.rickInterval = setTimeout(() => {
            this.spawnRick();
        }, spawnTime);
    }
    
    spawnRick() {
        if (this.rickVisible) return; // Don't spawn if already visible
        
        this.rickVisible = true;
        this.currentRickSprite = 0;
        this.rickAnimationDirection = 1;
        this.rickAnimationComplete = false;
        
        // Create portal background
        const portal = document.createElement('img');
        portal.id = 'rick-portal';
        portal.src = 'assets/general/rm/portal.png';
        portal.style.position = 'absolute';
        portal.style.bottom = '170px'; // Moved up 150px
        portal.style.right = '10px'; // Moved to the right
        portal.style.width = '80px';
        portal.style.height = '80px';
        portal.style.zIndex = '24';
        portal.style.opacity = '0';
        portal.style.transition = 'opacity 0.5s ease';
        
        // Create Rick element
        const rick = document.createElement('img');
        rick.id = 'rick-doge';
        rick.src = this.rickSprites[0];
        rick.className = 'rick-doge';
        rick.style.position = 'absolute';
        rick.style.bottom = '170px'; // Moved up 150px
        rick.style.right = '20px';
        rick.style.width = '80px';
        rick.style.height = '80px';
        rick.style.zIndex = '25';
        rick.style.cursor = 'default'; // Remove pointer cursor
        rick.style.transition = 'opacity 0.3s ease';
        rick.style.objectFit = 'contain'; // Fix stretching
        
        document.getElementById('left-panel').appendChild(portal);
        document.getElementById('left-panel').appendChild(rick);
        
        // Fade in portal
        setTimeout(() => {
            portal.style.opacity = '1';
        }, 100);
        
        // Animate through sprites
        this.animateRick();
        
        // Auto-hide after 8 seconds (faster fade out)
        setTimeout(() => {
            this.hideRick();
        }, 8000);
    }
    
    animateRick() {
        if (!this.rickVisible || this.rickAnimationComplete) return;
        
        const rick = document.getElementById('rick-doge');
        if (!rick) return;
        
        // Check if we've completed the full sequence (back to R1)
        if (this.currentRickSprite === 0 && this.rickAnimationDirection === -1) {
            this.rickAnimationComplete = true;
            // Fade out immediately when animation completes
            setTimeout(() => {
                this.hideRick();
            }, 500); // Small delay to show final frame
            return; // Stop animation immediately
        }
        
        // Move to next sprite based on direction
        this.currentRickSprite += this.rickAnimationDirection;
        
        // Check if we've reached R4 (index 3)
        if (this.currentRickSprite === 3) {
            // Pause at R4 for 2 seconds
            rick.src = this.rickSprites[this.currentRickSprite];
            this.rickAnimationDirection = -1; // Start going backward
            setTimeout(() => {
                this.animateRick();
            }, 2000); // 2 second pause
            return;
        }
        
        rick.src = this.rickSprites[this.currentRickSprite];
        
        // Continue animation every 500ms
        setTimeout(() => {
            this.animateRick();
        }, 500);
    }
    
    // Rick click functionality removed - no longer gives coins
    
    hideRick() {
        const rick = document.getElementById('rick-doge');
        const portal = document.getElementById('rick-portal');
        
        if (rick) {
            rick.style.opacity = '0';
            setTimeout(() => {
                if (rick.parentNode) {
                    rick.parentNode.removeChild(rick);
                }
            }, 300);
        }
        
        // Portal stays visible for 0.4 seconds after Rick fades
        if (portal) {
            setTimeout(() => {
                portal.style.opacity = '0';
                setTimeout(() => {
                    if (portal.parentNode) {
                        portal.parentNode.removeChild(portal);
                    }
                }, 400); // 0.4 seconds
            }, 300); // Wait for Rick to fade first
        }
        
        this.rickVisible = false;
    }
    
    scheduleNextRick() {
        // Schedule next Rick spawn
        const spawnTime = 180000 + Math.random() * 120000; // 3-5 minutes
        this.rickInterval = setTimeout(() => {
            this.spawnRick();
        }, spawnTime);
    }
    
    // Debug method to force Rick spawn
    forceRickSpawn() {
        this.hideRick(); // Hide current Rick if visible
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
    
    updateUI(skipShopPrices = false) {
        // Update dogecoin display
        document.getElementById('dogecoin-amount').textContent = this.formatNumber(Math.floor(this.dogecoins));
        document.getElementById('dps-amount').textContent = this.formatNumber(this.dps);
        
        // Dynamic DPS logo positioning based on text length
        const dpsIcon = document.querySelector('.stat-item:nth-child(2) .stat-icon');
        const dpsText = document.getElementById('dps-amount');
        if (dpsIcon && dpsText) {
            const textLength = dpsText.textContent.length;
            // Adjust logo position based on text length
            if (textLength >= 4) {
                dpsIcon.style.transform = 'translateX(-15px)'; // Move further left for longer text
            } else if (textLength >= 3) {
                dpsIcon.style.transform = 'translateX(-10px)'; // Move left for medium text
            } else {
                dpsIcon.style.transform = 'translateX(0px)'; // Default position for short text
            }
        }
        
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
    
    formatNumber(num) {
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return Math.floor(num).toString();
    }
    
    showNotification(message) {
        // Check if notifications are enabled
        if (this.notificationsEnabled === false) {
            return;
        }
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.getElementById('notifications').appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    playSound(soundFile) {
        // Use audio manager if available
        if (window.audioManager) {
            audioManager.playSound(soundFile);
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
    
    resetGame() {
        if (confirm('Are you sure you want to reset your game? This cannot be undone!')) {
            localStorage.removeItem('dogeminer_save');
            location.reload();
        }
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
                icon: 'assets/helpers/shibes/shibes-idle-0.png',
                miningSprite: 'assets/helpers/shibes/shibes-mine-0.png',
                name: 'Mining Shibe'
            },
            'dogeKennels': { 
                baseDps: 2, 
                icon: 'assets/helpers/kennels/kennels-idle-0.png',
                miningSprite: 'assets/helpers/kennels/kennels-mine-0.png',
                name: 'Doge Kennels'
            },
            'streamerKittens': { 
                baseDps: 4, 
                icon: 'assets/helpers/kittens/kittens-idle-0.png',
                miningSprite: 'assets/helpers/kittens/kittens-mine-0.png',
                name: 'Streamer Kittens'
            },
            'spaceRocket': { 
                baseDps: 9, 
                icon: 'assets/helpers/rockets/rockets-idle-0.png',
                miningSprite: 'assets/helpers/rockets/rockets-mine-0.png',
                name: 'Space Rocket'
            },
            'timeMachineRig': { 
                baseDps: 20, 
                icon: 'assets/helpers/rigs/rigs-idle-0.png',
                miningSprite: 'assets/helpers/rigs/rigs-mine-0.png',
                name: 'Time Machine Mining Rig'
            },
            'infiniteDogebility': { 
                baseDps: 50, 
                icon: 'assets/helpers/dogebility/dogebility-idle-0.png',
                miningSprite: 'assets/helpers/dogebility/dogebility-mine-0.png',
                name: 'Infinite Dogebility'
            }
        };
        
        const moonHelpers = {
            'moonBase': {
                baseDps: 12,
                icon: 'assets/helpers/bases/bases-idle-0.png',
                miningSprite: 'assets/helpers/bases/bases-mine-0.png',
                name: 'Moon Base'
            },
            'moonShibe': {
                baseDps: 9,
                icon: 'assets/helpers/moonshibe/moonshibe-idle-0.png',
                miningSprite: 'assets/helpers/moonshibe/moonshibe-mine-0.png',
                name: 'Moon Shibe'
            },
            'dogeCar': {
                baseDps: 12,
                icon: 'assets/helpers/dogecar/dogecar-idle-0.png',
                miningSprite: 'assets/helpers/dogecar/dogecar-mine-0.png',
                name: 'Doge Car'
            },
            'landerShibe': {
                baseDps: 20,
                icon: 'assets/helpers/landershibe/landershibe-idle-0.png',
                miningSprite: 'assets/helpers/landershibe/landershibe-mine-0.png',
                name: 'Lander Shibe'
            },
            'marsRocket': {
                baseDps: 50,
                icon: 'assets/helpers/marsrocket/marsrocket-idle-0.png',
                miningSprite: 'assets/helpers/marsrocket/marsrocket-mine-0.png',
                name: 'Mars Rocket'
            },
            'dogeGate': {
                baseDps: 155,
                icon: 'assets/helpers/dogegate/dogegate-idle-0.png',
                miningSprite: 'assets/helpers/dogegate/dogegate-mine-0.png',
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
        existingSprites.forEach(sprite => sprite.remove());
        
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
        existingSprites.forEach(sprite => sprite.remove());
        
        const existingTooltips = document.querySelectorAll('.helper-tooltip');
        existingTooltips.forEach(tooltip => tooltip.remove());
        
        const existingNameTooltips = document.querySelectorAll('.helper-name-tooltip');
        existingNameTooltips.forEach(tooltip => tooltip.remove());
    }
}

// Global game instance
let game;
