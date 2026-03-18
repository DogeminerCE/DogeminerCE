// DogeMiner: Community Edition - UI Management
class UIManager {
    constructor(game) {
        this.game = game;
        this.activePanel = 'shop-tab'; // Shop tab is active by default
        this.currentShopTab = 'helpers';
        this.mobileMenuOpen = false; // Track mobile menu state
        this.activeMobileTab = 'shop'; // Track active mobile tab
        this.boundHandleBuyButtonClick = this.handleBuyButtonClick.bind(this);
        this.boundMobileBuyButtonClick = this.handleMobileBuyClick.bind(this);

        try {
            this.setupUI();
            this.initializePlanetTabs(); // Initialize planet tabs based on saved state
            this.setupMobileUI(); // Setup mobile-specific UI functionality
        } catch (error) {
            console.error('Error in UIManager constructor:', error);
            console.error('Error details:', error.message, error.stack);
            throw error; // Re-throw to be caught by main.js
        }
    }

    setupUI() {
        this.setupPanels();
        this.setupShop();
        this.setupStats();
        this.setupLoading();
    }

    setupPanels() {
        // Main tab switching functionality
        window.switchMainTab = (tabName) => {
            // Check if this tab is already active
            const currentTab = this.activePanel.replace('-tab', '');
            const isTabAlreadyActive = currentTab === tabName;

            if (isTabAlreadyActive) return;

            // Define tab order for swipe direction
            const tabOrder = ['shop', 'upgrades', 'achievements', 'settings'];
            const currentIndex = tabOrder.indexOf(currentTab);
            const targetIndex = tabOrder.indexOf(tabName);
            const isMovingRight = targetIndex > currentIndex;

            // Get current and target tab elements
            const currentTabElement = document.getElementById(currentTab + '-tab');
            const targetTabElement = document.getElementById(tabName + '-tab');

            if (!currentTabElement || !targetTabElement) return;

            // Update tab buttons
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
                // Match button by onclick attribute (works for both DOM clicks and controller calls)
                if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(tabName)) {
                    btn.classList.add('active');
                }
            });

            // Add slide-out animation to current tab
            if (isMovingRight) {
                currentTabElement.classList.add('slide-out-left');
            } else {
                currentTabElement.classList.add('slide-out-right');
            }

            // After animation, switch tabs
            setTimeout(() => {
                // Remove all active classes and animation classes
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active', 'slide-out-left', 'slide-out-right', 'slide-in-left', 'slide-in-right');
                });

                // Add new active tab with slide-in animation
                targetTabElement.classList.add('active');
                if (isMovingRight) {
                    targetTabElement.classList.add('slide-in-right');
                } else {
                    targetTabElement.classList.add('slide-in-left');
                }

                // Remove animation classes after animation completes
                setTimeout(() => {
                    targetTabElement.classList.remove('slide-in-right', 'slide-in-left');
                }, 300);
            }, 50); // Small delay to let slide-out start

            // Set active panel
            this.activePanel = tabName + '-tab';

            // Play sound
            if (window.audioManager) {
                audioManager.playSound('swipe');
            }

            // Update shop content if switching to shop
            if (tabName === 'shop') {
                this.updateShopContent();
            }

            // Update upgrade content if switching to upgrades
            if (tabName === 'upgrades') {
                this.updateUpgradeContent();
            }
        };

        // Planet tab switching with loading transition
        window.switchPlanet = (planetName) => {
            // Don't allow switching if already on this planet or if transition is in progress
            if (this.game.currentLevel === planetName || this.game.isTransitioning) return;

            // Check if Moon is locked (no Space Rockets owned)
            if (planetName === 'moon') {
                const spaceRocketCount = this.game.helpers.filter(h => h.type === 'spaceRocket').length;

                if (spaceRocketCount === 0) {
                    // Play locked sound
                    if (window.audioManager) {
                        audioManager.playSound('uhoh');
                    }

                    // Show locked overlay
                    this.showMoonLocked();
                    return; // Don't switch planets
                }
            }

            if (planetName === 'mars' && !this.isMarsUnlocked()) {
                if (window.audioManager) {
                    audioManager.playSound('uhoh');
                }
                window.notificationManager?.showWarning?.('LOCKED: Requires Lander Shibe');
                return;
            }

            if (planetName === 'jupiter') {
                if (!this.isMarsUnlocked()) {
                    if (window.audioManager) {
                        audioManager.playSound('uhoh');
                    }
                    window.notificationManager?.showWarning?.('LOCKED: Requires Mars');
                    return;
                }

                if (!this.isJupiterUnlocked()) {
                    if (window.audioManager) {
                        audioManager.playSound('uhoh');
                    }
                    window.notificationManager?.showWarning?.('LOCKED: Requires Jupiter Rocket');
                    return;
                }
            }

            if (planetName === 'titan') {
                if (!this.isJupiterUnlocked()) {
                    if (window.audioManager) {
                        audioManager.playSound('uhoh');
                    }
                    window.notificationManager?.showWarning?.('LOCKED: Requires Jupiter');
                    return;
                }

                if (!this.isTitanUnlocked()) {
                    if (window.audioManager) {
                        audioManager.playSound('uhoh');
                    }
                    // Show specific missing requirement
                    if (!this.playerHasDogeStar()) {
                        window.notificationManager?.showWarning?.('LOCKED: Requires DogeStar');
                    } else if (!this.playerHasCloudBaseSensorPackage()) {
                        window.notificationManager?.showWarning?.('LOCKED: Requires Cloud Base Sensor Package');
                    }
                    return;
                }
            }

            // Update planet tab buttons
            const targetElement = event && event.target ? event.target.closest('.planet-tab') : document.querySelector(`.planet-tab[data-planet="${planetName}"]`);

            document.querySelectorAll('.planet-tab').forEach(btn => {
                btn.classList.remove('active');
            });

            if (targetElement) {
                targetElement.classList.add('active');
            }

            // Set transitioning flag
            this.game.isTransitioning = true;

            // Show loading screen with appropriate message
            const loadingInfo = document.getElementById('loading-info');
            if (loadingInfo) {
                if (planetName === 'earth') {
                    loadingInfo.textContent = 'Returning to Earth...';
                } else if (planetName === 'moon') {
                    loadingInfo.textContent = 'Launching to Moon...';
                } else if (planetName === 'mars') {
                    loadingInfo.textContent = 'Launching to Mars...';
                } else if (planetName === 'jupiter') {
                    // Ensure Jupiter travel displays the correct destination.
                    loadingInfo.textContent = 'Launching to Jupiter...';
                } else if (planetName === 'titan') {
                    // Provide placeholder copy while Titan content is under construction.
                    loadingInfo.textContent = 'Charting a course to Titan...';
                }
            }

            // Show loading screen with fade
            window.showLoadingScreen(true);

            // Use timeout to ensure loading screen is visible before processing
            setTimeout(() => {
                // First save the current state
                if (this.game.currentLevel === 'earth') {
                    // Save earth placed helpers
                    this.game.earthPlacedHelpers = [...this.game.placedHelpers];
                } else if (this.game.currentLevel === 'moon') {
                    // Save moon placed helpers
                    this.game.moonPlacedHelpers = [...this.game.placedHelpers];
                } else if (this.game.currentLevel === 'mars') {
                    // Save mars placed helpers
                    this.game.marsPlacedHelpers = [...this.game.placedHelpers];
                } else if (this.game.currentLevel === 'jupiter') {
                    this.game.jupiterPlacedHelpers = [...this.game.placedHelpers];
                } else if (this.game.currentLevel === 'titan') {
                    // Save titan placed helpers when leaving Titan
                    this.game.titanPlacedHelpers = [...this.game.placedHelpers];
                }

                // Save current planet's rock health state
                if (this.game.planetRockData && this.game.planetRockData[this.game.currentLevel]) {
                    this.game.planetRockData[this.game.currentLevel] = {
                        rocksBroken: this.game.rocksBroken,
                        currentHP: this.game.rockCurrentHP,
                        maxHP: this.game.rockMaxHP
                    };
                }

                // Clear the current helpers from the screen
                this.game.clearAllHelperSprites();

                // Update game state to reflect planet change
                this.game.currentLevel = planetName;

                // Load the new planet's rock health state
                if (this.game.planetRockData && this.game.planetRockData[planetName]) {
                    const rockData = this.game.planetRockData[planetName];
                    this.game.rocksBroken = rockData.rocksBroken || 0;
                    this.game.rockBaseHP = this.game.getPlanetRockBaseHP(planetName);
                    
                    if (rockData.maxHP !== null && rockData.currentHP !== null) {
                        this.game.rockMaxHP = rockData.maxHP;
                        this.game.rockCurrentHP = rockData.currentHP;
                    } else {
                        // First time visiting this planet
                        this.game.rockMaxHP = this.game.rockBaseHP;
                        this.game.rockCurrentHP = this.game.rockBaseHP;
                    }
                }
                
                // Update rock UI
                if (this.game.updateRockHealthDisplay) {
                    this.game.updateRockHealthDisplay();
                }

                // Clear upgrade caches so they refresh for the new planet
                this._cachedUpgrades = null;
                this._cachedMobileUpgrades = null;

                // Set data-planet attribute on body for CSS targeting
                document.body.dataset.planet = planetName;

                // Update mobile display
                this.updateMobilePlanetDisplay();

                // Load the appropriate placed helpers
                if (planetName === 'earth') {
                    this.game.placedHelpers = [...this.game.earthPlacedHelpers];
                } else if (planetName === 'moon') {
                    this.game.placedHelpers = [...this.game.moonPlacedHelpers];
                } else if (planetName === 'mars') {
                    this.game.placedHelpers = [...(this.game.marsPlacedHelpers || [])];
                } else if (planetName === 'jupiter') {
                    this.game.placedHelpers = [...(this.game.jupiterPlacedHelpers || [])];
                } else if (planetName === 'titan') {
                    // Load titan placed helpers when switching to Titan
                    this.game.placedHelpers = [...(this.game.titanPlacedHelpers || [])];
                }

                // Update the character sprite
                if (planetName === 'earth') {
                    // Earth character
                    this.updateCharacter('standard');
                } else if (planetName === 'moon') {
                    // Moon character with spacesuit
                    this.updateCharacter('spacehelmet');
                } else if (planetName === 'mars') {
                    this.updateCharacter('party');
                } else if (planetName === 'jupiter') {
                    // Use moon suit on Jupiter per requirements
                    this.updateCharacter('spacehelmet');
                } else if (planetName === 'titan') {
                    // Titan uses space helmet like Jupiter and Moon
                    this.updateCharacter('spacehelmet');
                }

                // Update the rock image
                const rockElement = document.getElementById('main-rock');
                const platform = document.getElementById('platform');
                if (planetName === 'earth') {
                    document.getElementById('main-rock').src = 'assets/general/rocks/earth.png';
                    if (platform) {
                        platform.src = '../assets/quickUI/dogeplatform.png';
                    }
                    document.body.classList.remove('moon-theme');
                    document.body.classList.remove('planet-mars');
                    document.body.classList.remove('planet-jupiter');
                    document.body.classList.remove('planet-titan');
                    if (window.audioManager) {
                        audioManager.playBackgroundMusic();
                    }
                } else if (planetName === 'moon') {
                    rockElement.src = 'assets/general/rocks/moon.png';
                    if (platform) {
                        platform.src = '../assets/quickUI/dogeplatformmoon.png';
                    }
                    document.body.classList.add('moon-theme');
                    document.body.classList.remove('planet-mars');
                    document.body.classList.remove('planet-jupiter');
                    document.body.classList.remove('planet-titan');
                    if (window.audioManager) {
                        audioManager.playBackgroundMusic();
                    }
                } else if (planetName === 'mars') {
                    rockElement.src = 'assets/general/rocks/mars.png';
                    if (platform) {
                        platform.src = '../assets/quickUI/marsdogeplatform.png';
                    }
                    document.body.classList.remove('moon-theme');
                    document.body.classList.add('planet-mars');
                    document.body.classList.remove('planet-jupiter');
                    document.body.classList.remove('planet-titan');
                    if (window.audioManager) {
                        audioManager.playBackgroundMusic();
                    }
                } else if (planetName === 'jupiter') {
                    rockElement.src = 'assets/general/rocks/jupiter.png';
                    if (platform) {
                        // Jupiter uses its own platform art so the scene matches the new assets.
                        platform.src = '../assets/quickUI/jupiterdogeplatform.png';
                    }
                    document.body.classList.remove('moon-theme');
                    document.body.classList.remove('planet-mars');
                    document.body.classList.remove('planet-titan');
                    document.body.classList.add('planet-jupiter');
                    if (window.audioManager) {
                        audioManager.playBackgroundMusic();
                    }
                } else if (planetName === 'titan') {
                    // Titan uses its own rock and platform
                    rockElement.src = 'assets/general/rocks/titan.png';
                    if (platform) {
                        platform.src = '../assets/quickUI/titandogeplatform.png';
                    }
                    document.body.classList.remove('moon-theme');
                    document.body.classList.remove('planet-mars');
                    document.body.classList.remove('planet-jupiter');
                    document.body.classList.add('planet-titan');
                    if (window.audioManager) {
                        audioManager.playBackgroundMusic();
                    }
                }

                // Update backgrounds with the correct pool
                if (planetName === 'earth') {
                    // Earth backgrounds
                    this.game.backgrounds = [
                        'backgrounds/bg1.jpg',
                        'backgrounds/bg3.jpg',
                        'backgrounds/bg4.jpg',
                        'backgrounds/bg5.jpg',
                        'backgrounds/bg6.jpg',
                        'backgrounds/bg7.jpg',
                        'backgrounds/bg9.jpg',
                        'backgrounds/bg-new.jpg'
                    ];
                } else if (planetName === 'moon') {
                    // Moon backgrounds (same as earth since DOM only has 8 background elements)
                    this.game.backgrounds = [
                        'backgrounds/bg1.jpg',
                        'backgrounds/bg3.jpg',
                        'backgrounds/bg4.jpg',
                        'backgrounds/bg5.jpg',
                        'backgrounds/bg6.jpg',
                        'backgrounds/bg7.jpg',
                        'backgrounds/bg9.jpg',
                        'backgrounds/bg-new.jpg'
                    ];
                } else if (planetName === 'mars') {
                    this.game.backgrounds = [
                        'backgrounds/bg6.jpg',
                        'assets/backgrounds/bg101.jpg',
                        'assets/backgrounds/bg102.jpg',
                        'assets/backgrounds/bg103.jpg',
                        'assets/backgrounds/bg104.jpg',
                        'assets/backgrounds/bg105.jpg',
                        'backgrounds/bg-new.jpg'
                    ];
                } else if (planetName === 'jupiter') {
                    this.game.backgrounds = [
                        'assets/backgrounds/bgjup01.jpg',
                        'assets/backgrounds/bgjup02.jpg',
                        'assets/backgrounds/bgjup03.jpg',
                        'assets/backgrounds/dogewow.jpg'
                    ];
                } else if (planetName === 'titan') {
                    // Titan uses its own background set for atmospheric effect
                    this.game.backgrounds = [
                        'assets/backgrounds/titan02.jpg',
                        'assets/backgrounds/titan03.jpg',
                        'assets/backgrounds/titan04.jpg',
                        'assets/backgrounds/titan05.jpg'
                    ];
                }
                this.game.currentBackgroundIndex = 0;

                // Sync background image DOM nodes to match the newly selected planet.
                this.game.syncBackgroundImages?.(true);

                // Update the shop to show the appropriate helpers
                this.updateShopContent();
                this.updateUpgradeContent();
                this.updatePlanetTabVisibility();

                // Delay a bit to simulate loading
                setTimeout(() => {
                    // Recreate helper sprites for the current planet
                    this.game.recreateHelperSprites();

                    // Hide loading screen
                    window.hideLoadingScreen();

                    // Reset transitioning flag
                    this.game.isTransitioning = false;

                    // Trigger landing animation depending on destination
                    const characterContainer = document.getElementById('character-container');
                    if (characterContainer) {
                        characterContainer.style.visibility = 'hidden';
                    }

                    setTimeout(() => {
                        if (characterContainer) {
                            characterContainer.style.visibility = 'visible';
                        }

                        // Play drop-in intro animation for all planets to maintain consistency
                        const forceIntro = planetName === 'moon' || planetName === 'earth' || planetName === 'mars' || planetName === 'jupiter' || planetName === 'titan';
                        if (forceIntro) {
                            this.game.playDogeIntro(true);
                        }
                    }, 300);

                }, 1000); // 1 second delay
            }, 500); // Short delay to ensure loading screen appears

            console.log(`Switched to ${planetName}`);
        };

        // Scroll wheel functionality for tab switching (shop and upgrade only)
        this.setupScrollWheelTabs();

        // Shop sub-tab switching
        window.switchShopTab = (tabName) => {
            this.currentShopTab = tabName;

            // Update sub-tab buttons in shop
            document.querySelectorAll('.shop-tabs .sub-tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');

            // Update shop content
            this.updateShopContent();
        };

        // Achievements sub-tab switching
        window.switchAchievementsTab = (tabName) => {
            // Update sub-tab buttons in achievements
            document.querySelectorAll('.achievements-tabs .sub-tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');

            // Update achievements content
            document.querySelectorAll('.achievements-sub-content').forEach(content => {
                content.classList.remove('active');
            });

            if (tabName === 'achievements') {
                document.getElementById('achievements-content').classList.add('active');
            } else if (tabName === 'stats') {
                document.getElementById('stats-content').classList.add('active');
            }
        };

    }

    setupShop() {
        this.updateShopContent();
    }

    updateShopContent() {
        if (!this.game) {
            console.warn('updateShopContent called before game was ready');
            return;
        }

        this.updatePlanetTabVisibility();

        const shopContent = document.getElementById('shop-content');
        if (!shopContent) {
            console.error('shop-content element not found!');
            return;
        }

        // Log the current planet to help debug shop issues
        console.log(`Updating shop content for planet: ${this.game.currentLevel}`);

        // Clear existing content
        shopContent.innerHTML = '';

        // Render the correct helpers based on current planet
        this.renderHelperShop(shopContent);

        // Update shop prices to reflect current planet's helpers
        this.game.updateShopPrices();
    }

    renderHelperShop(container) {
        container.innerHTML = ''; // Clear container completely

        if (!this.game) {
            console.warn('renderHelperShop called before game was ready');
            return;
        }

        // Choose which helpers to display based on current planet
        const helperCategory = this.game.getHelperCategoryForLevel(this.game.currentLevel);
        console.log(`Rendering shop with helper category: ${helperCategory} for planet: ${this.game.currentLevel}`);

        if (!window.shopManager.shopData[helperCategory]) {
            console.error(`Shop data for ${helperCategory} is missing!`);
            return;
        }

        const helperEntries = Object.entries(window.shopManager.shopData[helperCategory]);
        const moonHelpers = Array.isArray(this.game.moonHelpers) ? this.game.moonHelpers : [];
        const marsHelpers = Array.isArray(this.game.marsHelpers) ? this.game.marsHelpers : [];
        const jupiterHelpers = Array.isArray(this.game.jupiterHelpers) ? this.game.jupiterHelpers : [];
        const moonBaseOwned = moonHelpers.some(helper => helper.type === 'moonBase');
        const marsBaseOwned = marsHelpers.some(helper => helper.type === 'marsBase');
        const jupiterBaseOwned = jupiterHelpers.some(helper => helper.type === 'cloudBase');
        const landerShibeOwned = moonHelpers.some(helper => helper.type === 'landerShibe');
        const jupiterReached = this.isJupiterUnlocked();

        // Create 6 helper items (2x3 grid)
        for (let i = 0; i < 6; i++) {
            const item = document.createElement('div');
            item.className = 'shop-grid-item';

            if (i < helperEntries.length) {
                const [type, helper] = helperEntries[i];
                // Choose the correct helper array based on current planet
                const helperArray = this.game.getHelperArrayForLevel(this.game.currentLevel);
                const owned = helperArray.filter(h => h.type === type).length;
                const cost = Math.floor(helper.baseCost * Math.pow(1.15, owned));
                const canAfford = this.game.dogecoins >= cost;

                // Get upgrade-based info for helpers (applies to all levels with upgrades)
                let displayName = helper.name;
                let displayDesc = helper.description;
                let displayDps = helper.baseDps;
                let displayIcon = helper.icon;

                if (window.shopManager) {
                    const upgradeInfo = window.shopManager.getCurrentHelperUpgradeInfo(type);
                    if (upgradeInfo) {
                        displayName = upgradeInfo.name;
                        displayDps = upgradeInfo.dps;
                        if (upgradeInfo.shopDesc) {
                            displayDesc = upgradeInfo.shopDesc;
                        }
                    }
                    // Get upgrade-level sprite
                    const upgradeLevel = this.game.helperUpgradeLevels?.[type] || 0;
                    const spritePaths = this.game.getHelperSpritePaths(type, upgradeLevel);
                    if (spritePaths && spritePaths.idle) {
                        displayIcon = spritePaths.idle;
                    }
                }

                let lockReason = null;
                if (this.game.currentLevel === 'earth') {
                    // Time Machine Mining Rig and Infinite Dogebility Drive unlock when Jupiter is reached
                    if (type === 'timeMachineRig' && !jupiterReached) {
                        lockReason = 'notInvented';
                    }
                    else if (type === 'infiniteDogebility' && !jupiterReached) {
                        lockReason = 'furtherProgress';
                    }
                } else if (this.game.currentLevel === 'moon') {
                    if (type !== 'moonBase' && !moonBaseOwned) {
                        lockReason = 'moonBase';
                    } else if (type === 'marsRocket' && !landerShibeOwned) {
                        lockReason = 'landerShibe';
                    } else if (type === 'dogeGate' && !jupiterReached) {
                        lockReason = 'furtherProgress';
                    }
                } else if (this.game.currentLevel === 'mars') {
                    if (type !== 'marsBase' && !marsBaseOwned) {
                        lockReason = 'marsBase';
                    }
                    const spaceBassOwned = marsHelpers.some(helper => helper.type === 'spaceBass');
                    if (type === 'jupiterRocket' && !spaceBassOwned) {
                        lockReason = 'spaceBass';
                    }
                } else if (this.game.currentLevel === 'jupiter') {
                    if (type !== 'cloudBase' && !jupiterBaseOwned) {
                        lockReason = 'cloudBase';
                    }
                } else if (this.game.currentLevel === 'titan') {
                    const titanHelpers = Array.isArray(this.game.titanHelpers) ? this.game.titanHelpers : [];
                    const titanBaseOwned = titanHelpers.some(helper => helper.type === 'titanBase');
                    if (type !== 'titanBase' && !titanBaseOwned) {
                        lockReason = 'titanBase';
                    }
                }
                const isLocked = lockReason !== null;


                // Calculate button width based on price length
                const priceText = this.game.formatNumber(cost);
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

                const buttonDisabled = (!canAfford || isLocked) ? 'disabled' : '';
                let lockText = 'REQUIRES MOON BASE';
                if (lockReason === 'landerShibe') lockText = 'REQUIRES LANDER SHIBE';
                else if (lockReason === 'marsBase') lockText = 'REQUIRES MARS BASE';
                else if (lockReason === 'spaceBass') lockText = 'REQUIRES SPACE BASS';
                else if (lockReason === 'cloudBase') lockText = 'REQUIRES CLOUD BASE';
                else if (lockReason === 'titanBase') lockText = 'REQUIRES TITAN BASE';
                else if (lockReason === 'furtherProgress') lockText = 'REQUIRES FURTHER PROGRESS';
                else if (lockReason === 'notInvented') lockText = 'HAS NOT BEEN INVENTED YET.';

                const lockOverlayHtml = isLocked ? `
                    <div class="helper-lock-overlay">
                        <div class="helper-lock-icon" aria-hidden="true"></div>
                        <div class="helper-lock-text">LOCKED</div>
                        <div class="helper-lock-subtext">${lockText}</div>
                    </div>
                ` : '';

                // Determine font size class based on name length to prevent cut-off
                let titleSizeClass = '';
                if (displayName.length > 22) {
                    titleSizeClass = 'title-xs';
                } else if (displayName.length > 18) {
                    titleSizeClass = 'title-sm';
                }

                item.innerHTML = `
                    <div class="shop-item-quantity">#${owned}</div>
                    <div class="shop-item-title ${titleSizeClass}">${displayName}</div>
                    <div class="shop-item-dps">${displayDps} ĐPS</div>
                    <div class="shop-item-sprite">
                        <img src="${displayIcon}" alt="${displayName}">
                    </div>
                    <div class="shop-item-description">${displayDesc}</div>
                    <button class="shop-buy-btn${isLocked ? ' locked' : ''}" data-helper-type="${type}" 
                            ${buttonDisabled} style="width: ${buttonWidth};">
                        <img src="assets/general/dogecoin_70x70.png" alt="DogeCoin" class="buy-btn-icon">
                        <span class="buy-btn-price">${priceText}</span>
                    </button>
                    ${lockOverlayHtml}
                `;

                if (isLocked) {
                    item.classList.add('helper-locked');
                }
            } else {
                // Empty slot
                item.innerHTML = `
                    <div class="shop-item-empty">
                        <div class="empty-text">Coming Soon!</div>
                    </div>
                `;
            }

            container.appendChild(item);
        }

        // Add event listeners to all buy buttons
        this.setupShopButtonListeners();
    }

    // Render upgrade button for Earth helpers that have upgrades available
    renderUpgradeButton(helperType, owned) {
        // Only show upgrade button if player owns at least one of this helper
        if (owned < 1) return '';

        // Only show for Earth helpers (upgrades not yet implemented for other planets)
        if (this.game.currentLevel !== 'earth') return '';

        const nextUpgrade = window.shopManager?.getNextHelperUpgrade(helperType);
        if (!nextUpgrade) return ''; // Max level reached or no upgrades

        const canAfford = window.shopManager?.canAffordHelperUpgrade(helperType);
        const currentLevel = window.shopManager?.getHelperUpgradeLevel(helperType) || 0;
        const priceText = this.game.formatNumber(nextUpgrade.price);

        return `
            <button class="shop-upgrade-btn${canAfford ? '' : ' unaffordable'}" 
                    data-upgrade-type="${helperType}" 
                    ${canAfford ? '' : 'disabled'}>
                <span class="upgrade-label">⬆ Lvl ${currentLevel + 1}: ${nextUpgrade.upgradeName}</span>
                <span class="upgrade-price">${priceText}</span>
            </button>
        `;
    }

    setupShopButtonListeners() {
        // Add event listeners to all buy buttons
        // Desktop helper cards render inside #shop-content, so bind listeners to that node.
        const shopContainer = document.getElementById('shop-content');
        if (!shopContainer) return;

        // Buy buttons
        const buyButtons = shopContainer.querySelectorAll('.shop-buy-btn[data-helper-type]');
        buyButtons.forEach((button) => {
            // Remove any existing listeners to prevent duplicates
            button.removeEventListener('click', this.boundHandleBuyButtonClick);
            // Add new listener
            button.addEventListener('click', this.boundHandleBuyButtonClick);
        });

        // Upgrade buttons
        const upgradeButtons = shopContainer.querySelectorAll('.shop-upgrade-btn[data-upgrade-type]');
        upgradeButtons.forEach((button) => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const helperType = button.getAttribute('data-upgrade-type');
                if (helperType && window.shopManager) {
                    window.shopManager.buyHelperUpgrade(helperType);
                    // Re-render shop to update UI
                    this.updateShopContent();
                }
            });
        });
    }

    handleBuyButtonClick(event) {
        const button = event.currentTarget;
        const helperType = button.getAttribute('data-helper-type');

        if (helperType && window.game) {
            // Buy the helper based on the current planet
            const success = window.game.buyHelper(helperType);

            if (success) {
                // Trigger chromatic aberration effect on successful purchase
                window.game.createChromaticAberrationEffect(button);

                // Update shop display immediately
                this.updateShopDisplay();

                // Special handling for Earth helpers
                if (window.game.currentLevel === 'earth') {
                    // If this is the first Space Rocket purchase, unlock the Moon
                    if (helperType === 'spaceRocket') {
                        const spaceRocketCount = window.game.helpers.filter(h => h.type === 'spaceRocket').length;
                        if (spaceRocketCount === 1) {
                            // This is the first Space Rocket purchase
                            this.hideMoonLocked();
                        }
                    }
                }
            } else {
                console.log('Failed to buy helper - insufficient funds');
            }
        } else {
            console.error('Helper type or game not found:', helperType, !!window.game);
        }
    }

    handleMobileBuyClick(event) {
        event.preventDefault();

        const button = event.currentTarget;
        const helperType = button?.getAttribute('data-helper-type');

        if (!helperType || !window.game) {
            console.error('Mobile helper type or game not found:', helperType, !!window.game);
            return;
        }

        if (button.disabled || button.classList.contains('locked')) {
            return;
        }

        const success = window.game.buyHelper(helperType);

        if (success) {
            window.game.createChromaticAberrationEffect?.(button);
            this.updateMobileShopContent();
            this.updateMobileStats?.();
        } else {
            console.log('Failed to buy helper on mobile - insufficient funds or locked');
        }
    }

    updateShopDisplay() {
        // Prices and availability update automatically, so rebuild instantly to avoid distracting fades.
        const shopContainer = document.getElementById('shop-content');
        if (!shopContainer) {
            return;
        }

        this.updateShopContent();
    }

    renderPickaxeShop(container) {
        Object.entries(this.game.pickaxeTypes).forEach(([type, pickaxe]) => {
            const owned = this.game.pickaxes.includes(type);
            const canBuy = !owned && this.game.dogecoins >= pickaxe.cost;

            const item = document.createElement('div');
            item.className = 'shop-item';

            item.innerHTML = `
                <div class="shop-item-header">
                    <div class="shop-item-title">${pickaxe.name}</div>
                    <div class="shop-item-price">${owned ? 'Owned' : 'D ' + this.game.formatNumber(pickaxe.cost)}</div>
                </div>
                <div class="shop-item-content">
                    <div class="shop-item-icon">
                        <img src="${pickaxe.icon}" alt="${pickaxe.name}">
                    </div>
                    <div class="shop-item-details">
                        <p>${pickaxe.description}</p>
                        <div class="shop-item-stats">Multiplier: ${pickaxe.multiplier}x ${owned ? '| ✓ Owned' : ''}</div>
                    </div>
                </div>
                <div class="shop-item-footer">
                    <button class="buy-btn" onclick="game.buyPickaxe('${type}')" 
                            ${!canBuy ? 'disabled' : ''}>
                        ${owned ? 'Owned' : 'Buy!'}
                    </button>
                </div>
            `;

            container.appendChild(item);
        });
    }

    setupStats() {
        // Stats are updated in the main game loop
    }

    setupLoading() {
        // Loading screen management
        window.updateLoadingProgress = (progress) => {
            const progressBar = document.getElementById('loading-progress');
            progressBar.style.width = progress + '%';
        };
    }

    updateShop() {
        if (this.activePanel === 'shop-panel') {
            this.updateShopContent();
        }
    }


    showLevelUpNotification(levelName) {
        const notification = document.createElement('div');
        notification.className = 'level-up-notification';
        notification.innerHTML = `
            <div class="level-up-content">
                <h3>🚀 Level Up!</h3>
                <p>Welcome to ${levelName}!</p>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
            z-index: 10000;
            text-align: center;
            animation: levelUpSlide 4s ease-in-out forwards;
        `;

        // Add animation keyframes if not already added
        if (!document.getElementById('levelup-animation')) {
            const style = document.createElement('style');
            style.id = 'levelup-animation';
            style.textContent = `
                @keyframes levelUpSlide {
                    0% { transform: translateX(-50%) translateY(-100px); opacity: 0; }
                    20% { transform: translateX(-50%) translateY(0); opacity: 1; }
                    80% { transform: translateX(-50%) translateY(0); opacity: 1; }
                    100% { transform: translateX(-50%) translateY(-100px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    showAchievement(title, description) {
        const achievement = document.createElement('div');
        achievement.className = 'achievement-notification';
        achievement.innerHTML = `
            <div class="achievement-content">
                <h4>🏆 ${title}</h4>
                <p>${description}</p>
            </div>
        `;

        // Style the achievement notification
        achievement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #ffd700, #ffed4e);
            color: #000;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
            z-index: 10000;
            text-align: center;
            animation: achievementPop 3s ease-in-out forwards;
        `;

        // Add animation keyframes if not already added
        if (!document.getElementById('achievement-animation')) {
            const style = document.createElement('style');
            style.id = 'achievement-animation';
            style.textContent = `
                @keyframes achievementPop {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                    20% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
                    30% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(achievement);

        setTimeout(() => {
            achievement.remove();
        }, 3000);
    }

    updateBackground(levelName) {
        if (this.game && typeof this.game.updateRockSprite === 'function') {
            const rockImage = document.getElementById('main-rock');
            if (rockImage) {
                rockImage.style.opacity = '1';
                this.game.updateRockSprite();
            }
        } else {
            const rockImage = document.getElementById('main-rock');
            if (!rockImage) return;

            const level = this.game.levels[levelName];
            if (!level) return;

            const targetSrc = level.rock;
            const currentAttr = rockImage.getAttribute('src') || '';

            if (currentAttr === targetSrc || rockImage.src.endsWith(targetSrc)) {
                rockImage.style.opacity = '1';
                return;
            }

            rockImage.src = targetSrc;
            rockImage.style.opacity = '1';
        }
    }

    updateCharacter(characterType = 'standard') {
        const characterImage = document.getElementById('main-character');
        if (!characterImage) return;

        // Check if the current character is already correct to avoid unnecessary updates
        const currentSrc = characterImage.src;
        const targetSrc = `assets/general/character/${characterType}.png`;

        // Only update if the source has changed (avoid unnecessary reloading)
        if (!currentSrc.endsWith(targetSrc)) {
            console.log(`Updating character sprite to: ${characterType}`);

            // Create a new image to preload
            const preloadImage = new Image();
            preloadImage.onload = () => {
                // Once loaded, update the main character
                characterImage.src = targetSrc;
            };
            preloadImage.onerror = () => {
                console.error(`Failed to load character sprite: ${targetSrc}`);
            };
            preloadImage.src = targetSrc;
        }
    }

    showComboEffect(comboCount) {
        const comboElement = document.createElement('div');
        comboElement.className = 'combo-effect';
        comboElement.textContent = `${comboCount}x COMBO!`;

        comboElement.style.cssText = `
            position: fixed;
            top: 30%;
            left: 50%;
            transform: translateX(-50%);
            color: #ffd700;
            font-size: 48px;
            font-weight: bold;
            text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
            z-index: 10000;
            pointer-events: none;
            animation: comboPop 2s ease-out forwards;
        `;

        // Add animation keyframes if not already added
        if (!document.getElementById('combo-animation')) {
            const style = document.createElement('style');
            style.id = 'combo-animation';
            style.textContent = `
                @keyframes comboPop {
                    0% { transform: translateX(-50%) scale(0); opacity: 0; }
                    50% { transform: translateX(-50%) scale(1.2); opacity: 1; }
                    100% { transform: translateX(-50%) scale(1); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(comboElement);

        setTimeout(() => {
            comboElement.remove();
        }, 2000);
    }

    setupScrollWheelTabs() {
        // Define the scrollable tabs (shop and upgrades only)
        this.scrollableTabs = ['shop', 'upgrades'];

        // Add wheel event listener to the right panel
        const rightPanel = document.getElementById('right-panel');
        if (rightPanel) {
            rightPanel.addEventListener('wheel', (e) => {
                // Only handle scroll if we're on a scrollable tab
                const currentTab = this.activePanel.replace('-tab', '');
                if (this.scrollableTabs.includes(currentTab)) {
                    e.preventDefault(); // Prevent default scrolling

                    // Get current tab index
                    const currentTabIndex = this.scrollableTabs.indexOf(currentTab);

                    // Determine scroll direction
                    const scrollUp = e.deltaY < 0;

                    let newTabIndex;
                    if (scrollUp) {
                        // Scroll up - go to previous tab
                        newTabIndex = Math.max(0, currentTabIndex - 1);
                    } else {
                        // Scroll down - go to next tab
                        newTabIndex = Math.min(this.scrollableTabs.length - 1, currentTabIndex + 1);
                    }

                    // Switch to the new tab
                    const newTab = this.scrollableTabs[newTabIndex];
                    this.switchToTab(newTab);
                }
            });
        }
    }

    switchToTab(tabName) {
        // Check if this tab is already active
        const currentTab = this.activePanel.replace('-tab', '');
        const isTabAlreadyActive = currentTab === tabName;

        // Update tab buttons - find the correct button by data attribute or onclick
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            // Check if this button corresponds to the tab we want
            if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(tabName)) {
                btn.classList.add('active');
            }
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        const targetTab = document.getElementById(tabName + '-tab');
        if (targetTab) {
            targetTab.classList.add('active');
        }

        // Set active panel
        this.activePanel = tabName + '-tab';

        // Only play sound if switching to a different tab
        if (!isTabAlreadyActive && window.audioManager) {
            audioManager.playSound('swipe');
        }

        // Update shop content if switching to shop
        if (tabName === 'shop') {
            this.updateShopContent();
        }

        // Update upgrade content if switching to upgrade
        if (tabName === 'upgrades') {
            this.updateUpgradeContent();
        }
    }

    updateUpgradeContent(fadeInSectionIndex) {
        // Get all available helper upgrades for Earth helpers the player owns
        const availableUpgrades = this.getAvailableHelperUpgrades();

        // Only shuffle once - store the order to prevent changes on scroll
        if (!this._cachedUpgrades || this._cachedUpgrades.length !== availableUpgrades.length) {
            this._cachedUpgrades = availableUpgrades.sort(() => Math.random() - 0.5).slice(0, 3);
        }
        const displayUpgrades = this._cachedUpgrades;

        // Populate the 3 upgrade sections
        const upgradeSections = document.querySelectorAll('.upgrade-section');
        upgradeSections.forEach((section, index) => {
            if (index < displayUpgrades.length) {
                const upgrade = displayUpgrades[index];
                const canAfford = this.game.dogecoins >= upgrade.price;
                const priceText = this.game.formatNumber(upgrade.price);

                // Get sprite path for the upgraded helper
                const spritePaths = this.game.getHelperSpritePaths(upgrade.helperType, upgrade.nextLevel);
                const helperSprite = spritePaths?.idle || 'assets/helpers/shibes/shibes-idle-0.png';

                // Calculate total DPS (new DPS * helper count)
                const totalDps = upgrade.newDps * upgrade.helperCount;
                const dpsIncrease = (upgrade.newDps - upgrade.currentDps).toFixed(1);

                // Replace entire section content with the upgrade
                section.innerHTML = `
                    <div class="upgrade-item-full">
                        <div class="upgrade-helper-sprite">
                            <img src="${helperSprite}" alt="${upgrade.helperName}">
                        </div>
                        <div class="upgrade-content">
                            <div class="upgrade-header">
                                <div class="upgrade-name">${upgrade.upgradeName}</div>
                                <div class="upgrade-dps-row">
                                    <div class="upgrade-total-dps">${this.game.formatNumber(totalDps)} ĐPS</div>
                                    <div class="upgrade-dps-increase">+${dpsIncrease} ĐPS per helper</div>
                                </div>
                            </div>
                            <div class="upgrade-description">${upgrade.upgradeDesc}</div>
                            <div class="upgrade-footer">
                                <button class="shop-buy-btn upgrade-buy-btn${canAfford ? '' : ' disabled'}" 
                                        data-upgrade-helper="${upgrade.helperType}"
                                        ${canAfford ? '' : 'disabled'}>
                                    <img src="assets/general/dogecoin_70x70.png" alt="DogeCoin" class="buy-btn-icon">
                                    <span class="buy-btn-price">${priceText}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                section.classList.add('has-upgrade');
            } else {
                // No upgrade available - show "Looking for Upgrades" state
                section.innerHTML = `
                    <div class="upgrade-empty-state">
                        <div class="upgrade-empty-text">LOOKING FOR UPGRADES...</div>
                        <div class="searchdog-container-centered">
                            <img class="searchdog" src="assets/general/searchdog_1.png" alt="Searchdog" data-section="${index}">
                        </div>
                    </div>
                `;
                section.classList.remove('has-upgrade');
            }

            // Only add fade-in animation to the specific section that was just purchased
            if (fadeInSectionIndex !== undefined && index === fadeInSectionIndex) {
                section.classList.add('upgrade-fade-in');
                // Remove the class after animation completes so it can be reused
                setTimeout(() => {
                    section.classList.remove('upgrade-fade-in');
                }, 400);
            }
        });

        // Attach event listeners for upgrade buy buttons
        this.setupUpgradeBuyListeners();
    }

    getAvailableHelperUpgrades() {
        const upgrades = [];

        console.log('getAvailableHelperUpgrades called');
        console.log('shopManager:', window.shopManager);
        console.log('currentLevel:', this.game.currentLevel);

        if (!window.shopManager) {
            console.log('No shopManager found');
            return upgrades;
        }

        // Get the helper array for the current level
        let helperArray = [];
        const currentLevel = this.game.currentLevel;

        if (currentLevel === 'earth') {
            helperArray = this.game.helpers || [];
        } else if (currentLevel === 'moon') {
            helperArray = this.game.moonHelpers || [];
        } else if (currentLevel === 'mars') {
            helperArray = this.game.marsHelpers || [];
        } else if (currentLevel === 'jupiter') {
            helperArray = this.game.jupiterHelpers || [];
        } else if (currentLevel === 'titan') {
            helperArray = this.game.titanHelpers || [];
        }

        console.log('Helpers array for level:', helperArray);

        const ownedHelperTypes = new Set(helperArray.map(h => h.type));
        console.log('Owned helper types:', [...ownedHelperTypes]);

        // Check each owned helper type for available upgrades
        ownedHelperTypes.forEach(helperType => {
            const nextUpgrade = window.shopManager.getNextHelperUpgrade(helperType);
            console.log('Checking helper type:', helperType, 'nextUpgrade:', nextUpgrade);

            if (nextUpgrade) {
                const currentInfo = window.shopManager.getCurrentHelperUpgradeInfo(helperType);
                const helperCount = helperArray.filter(h => h.type === helperType).length;

                upgrades.push({
                    helperType: helperType,
                    helperName: currentInfo.name,
                    nextLevel: nextUpgrade.level,
                    upgradeName: nextUpgrade.upgradeName,
                    upgradeDesc: nextUpgrade.upgradeDesc,
                    price: nextUpgrade.price,
                    currentDps: currentInfo.dps,
                    newDps: nextUpgrade.dps,
                    helperCount: helperCount
                });
            }
        });

        console.log('Final available upgrades:', upgrades);
        return upgrades;
    }

    setupUpgradeBuyListeners() {
        const upgradeButtons = document.querySelectorAll('.upgrade-buy-btn[data-upgrade-helper]');
        upgradeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const helperType = button.getAttribute('data-upgrade-helper');
                if (helperType && window.shopManager) {
                    const success = window.shopManager.buyHelperUpgrade(helperType);
                    if (success) {
                        // Find the upgrade section that contains this button
                        const section = button.closest('.upgrade-section');
                        if (section) {
                            // Get the section index
                            const allSections = document.querySelectorAll('.upgrade-section');
                            let sectionIndex = -1;
                            allSections.forEach((sec, idx) => {
                                if (sec === section) sectionIndex = idx;
                            });

                            // Add fade-out class for animation
                            section.classList.add('upgrade-fade-out');

                            // Wait for animation to complete, then update content
                            setTimeout(() => {
                                section.classList.remove('upgrade-fade-out');
                                // Pass the section index to only fade-in that one
                                this.updateUpgradeContent(sectionIndex);
                            }, 500);
                        } else {
                            // Fallback if section not found
                            this.updateUpgradeContent();
                        }
                    }
                }
            });
        });
    }

    showMoonLocked() {
        // Find the moon tab button
        const moonTab = document.querySelector('.planet-tab[onclick*="moon"]');
        if (!moonTab) return;

        // Check if locked overlay already exists
        let lockedOverlay = moonTab.querySelector('.planet-tab-locked');
        if (!lockedOverlay) {
            // Create locked overlay
            lockedOverlay = document.createElement('div');
            lockedOverlay.className = 'planet-tab-locked';
            lockedOverlay.textContent = 'LOCKED';
            moonTab.appendChild(lockedOverlay);
        }

        // Show the overlay
        lockedOverlay.style.display = 'block';

        // Auto-hide after 2 seconds
        setTimeout(() => {
            this.hideMoonLocked();
        }, 2000);
    }

    hideMoonLocked() {
        const lockedOverlay = document.querySelector('.planet-tab-locked');
        if (lockedOverlay) {
            lockedOverlay.style.display = 'none';
        }
    }

    // Initialize planet tabs based on saved state
    initializePlanetTabs() {
        if (!this.game || !this.game.currentLevel) {
            return;
        }

        this.updatePlanetTabVisibility();

        // Update planet tab buttons to match current level
        document.querySelectorAll('.planet-tab').forEach(btn => {
            btn.classList.remove('active');

            const tabPlanet = btn.dataset.planet || btn.querySelector('img')?.alt?.toLowerCase() || '';
            if (tabPlanet.toLowerCase() === this.game.currentLevel) {
                btn.classList.add('active');
            }
        });

        if (this.game.hasPlayedMoonLaunch) {
            this.hideMoonLocked();
        }

        const shopPanel = document.getElementById('shop-panel');
        if (shopPanel && (this.activePanel === 'shop-panel' || shopPanel.style.display === 'block')) {
            console.log(`Updating shop content to match current planet: ${this.game.currentLevel}`);
            this.updateShopContent();
        }

        console.log(`Planet tabs initialized to: ${this.game.currentLevel}`);
    }

    playerHasHelperType(helperType) {
        if (!this.game) return false;

        const helperLists = [
            this.game.helpers,
            this.game.moonHelpers,
            this.game.marsHelpers,
            this.game.earthPlacedHelpers,
            this.game.moonPlacedHelpers,
            this.game.marsPlacedHelpers
        ];

        return helperLists.some(list =>
            Array.isArray(list) && list.some(helper => helper && helper.type === helperType)
        );
    }

    playerHasMarsRocket() {
        return this.playerHasHelperType('marsRocket');
    }

    playerHasJupiterRocket() {
        return this.playerHasHelperType('jupiterRocket');
    }

    isMarsUnlocked() {
        const marsRocketOwned = this.playerHasMarsRocket();

        if (marsRocketOwned && this.game && !this.game.hasPlayedMoonLaunch) {
            this.game.hasPlayedMoonLaunch = true;
        }

        const moonUnlocked = this.game?.hasPlayedMoonLaunch || marsRocketOwned;
        if (!moonUnlocked) {
            return false;
        }

        return marsRocketOwned;
    }

    isJupiterUnlocked() {
        return this.playerHasJupiterRocket();
    }

    playerHasDogeStar() {
        // Check if player owns at least one DogeStar (final Jupiter helper)
        const jupiterHelpers = this.game.jupiterHelpers || [];
        const hasDogeStar = jupiterHelpers.some(helper => helper && helper.type === 'dogeStar');
        return hasDogeStar;
    }

    playerHasCloudBaseSensorPackage() {
        // Check if player has the Sensor Package upgrade for Cloud Base (level >= 1)
        const cloudBaseLevel = this.game.helperUpgradeLevels?.cloudBase || 0;
        return cloudBaseLevel >= 1;
    }

    isTitanUnlocked() {
        // Titan requires owning DogeStar AND having Sensor Package upgrade for Cloud Base
        return this.playerHasDogeStar() && this.playerHasCloudBaseSensorPackage();
    }

    updatePlanetTabVisibility() {
        const marsTab = document.querySelector('.planet-tab[data-planet="mars"]');
        if (marsTab) {
            const marsUnlocked = this.isMarsUnlocked();
            marsTab.style.display = marsUnlocked ? '' : 'none';
            marsTab.disabled = !marsUnlocked;

            if (!marsUnlocked && marsTab.classList.contains('active')) {
                marsTab.classList.remove('active');
                const fallbackTab = document.querySelector('.planet-tab[data-planet="earth"]');
                fallbackTab?.classList.add('active');
            }
        }

        const jupiterTab = document.querySelector('.planet-tab[data-planet="jupiter"]');
        if (jupiterTab) {
            const jupiterUnlocked = this.isJupiterUnlocked();
            jupiterTab.style.display = jupiterUnlocked ? '' : 'none';
            jupiterTab.disabled = !jupiterUnlocked;

            if (!jupiterUnlocked && jupiterTab.classList.contains('active')) {
                jupiterTab.classList.remove('active');
                const fallbackTab = document.querySelector('.planet-tab[data-planet="earth"]');
                fallbackTab?.classList.add('active');
            }
        }

        const titanTab = document.querySelector('.planet-tab[data-planet="titan"]');
        if (titanTab) {
            const titanUnlocked = this.isTitanUnlocked();
            titanTab.style.display = titanUnlocked ? '' : 'none';
            titanTab.disabled = !titanUnlocked;

            if (!titanUnlocked && titanTab.classList.contains('active')) {
                titanTab.classList.remove('active');
                const fallbackTab = document.querySelector('.planet-tab[data-planet="earth"]');
                fallbackTab?.classList.add('active');
            }
        }

        // Also update mobile planet tabs
        this.updateMobilePlanetTabs();
    }

    // Mobile UI Setup - Handles mobile-specific functionality
    setupMobileUI() {
        try {
            // Setup mobile menu toggle button
            const mobileToggleBtn = document.getElementById('mobile-menu-toggle');
            const mobileTabs = document.querySelectorAll('.mobile-tab-btn');

            // Setup toggle button
            if (mobileToggleBtn) {
                mobileToggleBtn.addEventListener('click', () => this.toggleMobileMenu());
            }

            // Setup tab buttons
            mobileTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    const tabName = e.currentTarget.dataset.tab;
                    if (tabName) {
                        this.switchMobileTab(tabName);
                    }
                });
            });

            // Setup Mobile Planet Menu
            const planetToggle = document.getElementById('mobile-planet-toggle');
            const planetMenu = document.getElementById('mobile-planet-menu');
            const closePlanetMenuBtn = document.getElementById('close-planet-menu');
            const mobilePlanetTabs = document.querySelectorAll('.mobile-planet-tab');

            if (planetToggle && planetMenu) {
                planetToggle.addEventListener('click', () => {
                    planetMenu.classList.add('open');
                });
            }

            if (closePlanetMenuBtn && planetMenu) {
                closePlanetMenuBtn.addEventListener('click', () => {
                    planetMenu.classList.remove('open');
                });
            }

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (planetMenu && planetMenu.classList.contains('open') &&
                    !planetMenu.contains(e.target) &&
                    !planetToggle.contains(e.target)) {
                    planetMenu.classList.remove('open');
                }
            });

            // Setup mobile planet tabs
            mobilePlanetTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    const planet = e.currentTarget.dataset.planet;
                    if (planet && !e.currentTarget.disabled) {
                        // Use arrow function or bind to ensure 'this' refers to UIManager
                        // switchPlanet is defined on window in setupPanels
                        window.switchPlanet(planet);
                        planetMenu.classList.remove('open');

                        // Update toggle icon and text
                        const toggleIcon = document.getElementById('mobile-current-planet-icon');
                        const toggleText = document.getElementById('mobile-planet-name');
                        if (toggleIcon) {
                            toggleIcon.src = `assets/general/${planet}.png`;
                        }
                        if (toggleText) {
                            toggleText.textContent = planet.charAt(0).toUpperCase() + planet.slice(1);
                        }

                        // Update active state in menu
                        mobilePlanetTabs.forEach(t => t.classList.remove('active'));
                        e.currentTarget.classList.add('active');
                    }
                });
            });

            // Initialize toggle icon and text based on current planet
            this.updateMobilePlanetDisplay();

            // Add a delayed update to ensure game state is fully loaded
            setTimeout(() => {
                this.updateMobilePlanetDisplay();
            }, 500);

            // Update mobile stats every second
            setInterval(() => {
                this.updateMobileStats();
            }, 1000);

            // Initialize mobile shop content if on mobile - defer to allow shopManager to initialize
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    this.updateMobileShopContent();
                }, 100);
            }

            // Update mobile content on window resize
            window.addEventListener('resize', () => {
                if (window.innerWidth <= 768) {
                    this.updateMobileShopContent();
                }
            });

        } catch (e) {
            console.error('Error setting up mobile UI:', e);
        }
    }

    // Update mobile planet tabs based on unlock status
    updateMobilePlanetTabs() {
        const mobilePlanetTabs = document.querySelectorAll('.mobile-planet-tab');
        mobilePlanetTabs.forEach(tab => {
            const planet = tab.dataset.planet;
            let isUnlocked = false;

            switch (planet) {
                case 'earth':
                    isUnlocked = true;
                    break;
                case 'moon':
                    isUnlocked = this.game.unlockedLevels.has('moon');
                    break;
                case 'mars':
                    isUnlocked = this.isMarsUnlocked();
                    break;
                case 'jupiter':
                    isUnlocked = this.isJupiterUnlocked();
                    break;
                case 'titan':
                    isUnlocked = this.isTitanUnlocked();
                    break;
            }

            tab.disabled = !isUnlocked;
            const lockOverlay = tab.querySelector('.mobile-lock-overlay');
            if (lockOverlay) {
                lockOverlay.style.display = isUnlocked ? 'none' : 'block';
            }
        });
    }

    // Update mobile planet display (icon and text)
    updateMobilePlanetDisplay() {
        if (!this.game || !this.game.currentLevel) return;

        const toggleIcon = document.getElementById('mobile-current-planet-icon');
        const toggleText = document.getElementById('mobile-planet-name');
        const mobilePlanetTabs = document.querySelectorAll('.mobile-planet-tab');

        if (toggleIcon) {
            toggleIcon.src = `assets/general/${this.game.currentLevel}.png`;
        }
        if (toggleText) {
            toggleText.textContent = this.game.currentLevel.charAt(0).toUpperCase() + this.game.currentLevel.slice(1);
        }

        // Update active state in menu
        mobilePlanetTabs.forEach(t => {
            if (t.dataset.planet === this.game.currentLevel) {
                t.classList.add('active');
            } else {
                t.classList.remove('active');
            }
        });

        // Also update menu theming
        const planetMenu = document.getElementById('mobile-planet-menu');
        if (planetMenu) {
            // Remove existing planet classes
            planetMenu.classList.remove('planet-earth', 'planet-moon', 'planet-mars', 'planet-jupiter', 'planet-titan');
            // Add current planet class (assuming CSS uses .planet-name structure on body, but here we scope it to menu if needed)
            // Actually, the CSS uses body classes like .planet-mars. 
            // But for the menu styling to work if it's outside the body class scope (it isn't, it's in body), 
            // we just need to ensure body class is updated. switchPlanet does that via game logic usually.
            // But let's ensure the menu itself has a class if we used that in CSS.
            // Looking at CSS: .planet-mars #mobile-planet-menu. So it relies on body class.
        }
    }

    // Toggle mobile menu open/closed
    toggleMobileMenu() {
        const mobileMenu = document.getElementById('mobile-bottom-menu');
        const toggleIcon = document.getElementById('mobile-toggle-icon');
        const toggleBtn = document.getElementById('mobile-menu-toggle');

        if (!mobileMenu || !toggleIcon || !toggleBtn) return;

        this.mobileMenuOpen = !this.mobileMenuOpen;

        if (this.mobileMenuOpen) {
            // Open menu
            mobileMenu.classList.add('open');
            toggleBtn.classList.add('menu-open');
            toggleIcon.src = 'assets/general/btn_down.png';

            // Update mobile content when opening
            this.updateMobileShopContent();
        } else {
            // Close menu
            mobileMenu.classList.remove('open');
            toggleBtn.classList.remove('menu-open');
            toggleIcon.src = 'assets/general/btn_up.png';
        }
    }

    // Force close mobile menu (used during cutscenes/planet transitions)
    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobile-bottom-menu');
        const toggleIcon = document.getElementById('mobile-toggle-icon');
        const toggleBtn = document.getElementById('mobile-menu-toggle');

        if (!mobileMenu) return;

        // Force the menu state to closed
        this.mobileMenuOpen = false;
        mobileMenu.classList.remove('open');
        if (toggleBtn) toggleBtn.classList.remove('menu-open');
        if (toggleIcon) toggleIcon.src = 'assets/general/btn_up.png';
    }

    // Switch between mobile tabs
    switchMobileTab(tabName) {
        // Check if this tab is already active
        if (this.activeMobileTab === tabName) return;

        // Define tab order for swipe direction
        const tabOrder = ['shop', 'upgrades', 'achievements', 'settings'];
        const currentIndex = tabOrder.indexOf(this.activeMobileTab);
        const targetIndex = tabOrder.indexOf(tabName);
        const isMovingRight = targetIndex > currentIndex;

        // Get current and target tab content elements
        const currentTabContent = document.getElementById(`mobile-${this.activeMobileTab}-tab`);
        const targetTabContent = document.getElementById(`mobile-${tabName}-tab`);

        // Update active tab state
        this.activeMobileTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`.mobile-tab-btn[data-tab="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Animation logic
        if (currentTabContent && targetTabContent) {
            // Add slide-out animation to current tab
            if (isMovingRight) {
                currentTabContent.classList.add('slide-out-left');
            } else {
                currentTabContent.classList.add('slide-out-right');
            }

            // After animation, switch tabs
            setTimeout(() => {
                // Remove all active classes and animation classes from all tabs
                document.querySelectorAll('.mobile-tab-content').forEach(content => {
                    content.classList.remove('active', 'slide-out-left', 'slide-out-right', 'slide-in-left', 'slide-in-right');
                });

                // Add new active tab with slide-in animation
                targetTabContent.classList.add('active');
                if (isMovingRight) {
                    targetTabContent.classList.add('slide-in-right');
                } else {
                    targetTabContent.classList.add('slide-in-left');
                }

                // Remove animation classes after animation completes
                setTimeout(() => {
                    targetTabContent.classList.remove('slide-in-right', 'slide-in-left');
                }, 300);
            }, 50); // Small delay to let slide-out start
        } else {
            // Fallback if elements not found (shouldn't happen)
            document.querySelectorAll('.mobile-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            if (targetTabContent) {
                targetTabContent.classList.add('active');
            }
        }

        // Update content based on active tab
        if (tabName === 'shop') {
            this.updateMobileShopContent();
        } else if (tabName === 'upgrades') {
            this.updateMobileUpgradesContent();
        } else if (tabName === 'achievements') {
            this.updateMobileAchievementsContent();
        } else if (tabName === 'settings') {
            this.updateMobileSettingsContent();
        }

        // Play sound
        if (window.audioManager) {
            audioManager.playSound('swipe');
        }
    }

    // Update mobile shop content with horizontal scrolling
    updateMobileShopContent() {
        if (!this.game) return;

        const mobileShopContent = document.getElementById('mobile-shop-content');
        if (!mobileShopContent) return;

        // Check if shopManager is ready
        if (!window.shopManager || !window.shopManager.shopData) {
            console.warn('Shop manager not ready yet, skipping mobile shop update');
            return;
        }

        // Clear existing content
        mobileShopContent.innerHTML = '';

        // Get helper category for current level
        const helperCategory = this.game.getHelperCategoryForLevel(this.game.currentLevel);

        if (!window.shopManager.shopData[helperCategory]) {
            console.error(`Shop data for ${helperCategory} is missing!`);
            return;
        }

        const helperEntries = Object.entries(window.shopManager.shopData[helperCategory]);
        const helperArray = this.game.getHelperArrayForLevel(this.game.currentLevel);

        // Create shop items (same logic as desktop but different layout)
        for (let i = 0; i < 6; i++) {
            const item = document.createElement('div');
            item.className = 'shop-grid-item';

            if (i < helperEntries.length) {
                const [type, helper] = helperEntries[i];
                const owned = helperArray.filter(h => h.type === type).length;
                const cost = Math.floor(helper.baseCost * Math.pow(1.15, owned));
                const canAfford = this.game.dogecoins >= cost;

                // Check if helper is locked (same logic as desktop)
                let lockReason = null;
                const moonHelpers = Array.isArray(this.game.moonHelpers) ? this.game.moonHelpers : [];
                const marsHelpers = Array.isArray(this.game.marsHelpers) ? this.game.marsHelpers : [];
                const jupiterHelpers = Array.isArray(this.game.jupiterHelpers) ? this.game.jupiterHelpers : [];
                const moonBaseOwned = moonHelpers.some(h => h.type === 'moonBase');
                const marsBaseOwned = marsHelpers.some(h => h.type === 'marsBase');
                const jupiterBaseOwned = jupiterHelpers.some(h => h.type === 'cloudBase');
                const landerShibeOwned = moonHelpers.some(h => h.type === 'landerShibe');
                const jupiterReached = this.isJupiterUnlocked();

                if (this.game.currentLevel === 'earth') {
                    // Time Machine Mining Rig and Infinite Dogebility Drive unlock when Jupiter is reached
                    if (type === 'timeMachineRig' && !jupiterReached) {
                        lockReason = 'notInvented';
                    }
                    // Infinite Dogebility Drive requires further progress
                    else if (type === 'infiniteDogebility' && !jupiterReached) {
                        lockReason = 'furtherProgress';
                    }
                } else if (this.game.currentLevel === 'moon') {
                    if (type !== 'moonBase' && !moonBaseOwned) {
                        lockReason = 'moonBase';
                    } else if (type === 'marsRocket' && !landerShibeOwned) {
                        lockReason = 'landerShibe';
                    } else if (type === 'dogeGate' && !jupiterReached) {
                        lockReason = 'furtherProgress';
                    }
                } else if (this.game.currentLevel === 'mars') {
                    if (type !== 'marsBase' && !marsBaseOwned) {
                        lockReason = 'marsBase';
                    }
                    const spaceBassOwned = marsHelpers.some(h => h.type === 'spaceBass');
                    if (type === 'jupiterRocket' && !spaceBassOwned) {
                        lockReason = 'spaceBass';
                    }
                } else if (this.game.currentLevel === 'jupiter') {
                    if (type !== 'cloudBase' && !jupiterBaseOwned) {
                        lockReason = 'cloudBase';
                    }
                } else if (this.game.currentLevel === 'titan') {
                    const titanHelpers = Array.isArray(this.game.titanHelpers) ? this.game.titanHelpers : [];
                    const titanBaseOwned = titanHelpers.some(h => h.type === 'titanBase');
                    if (type !== 'titanBase' && !titanBaseOwned) {
                        lockReason = 'titanBase';
                    }
                }
                const isLocked = lockReason !== null;

                const priceText = this.game.formatNumber(cost);
                const buttonDisabled = (!canAfford || isLocked) ? 'disabled' : '';

                // Get upgrade-based info for Earth helpers (same as desktop)
                let displayName = helper.name;
                let displayDesc = helper.description;
                let displayDps = helper.baseDps;
                let displayIcon = helper.icon;

                if (window.shopManager) {
                    const upgradeInfo = window.shopManager.getCurrentHelperUpgradeInfo(type);
                    if (upgradeInfo) {
                        displayName = upgradeInfo.name;
                        displayDps = upgradeInfo.dps;
                        if (upgradeInfo.shopDesc) {
                            displayDesc = upgradeInfo.shopDesc;
                        }
                    }
                    // Get upgrade-level sprite
                    const upgradeLevel = this.game.helperUpgradeLevels?.[type] || 0;
                    const spritePaths = this.game.getHelperSpritePaths(type, upgradeLevel);
                    if (spritePaths && spritePaths.idle) {
                        displayIcon = spritePaths.idle;
                    }
                }

                // Build lock text based on lock reason
                let lockText = 'REQUIRES MOON BASE';
                if (lockReason === 'landerShibe') lockText = 'REQUIRES LANDER SHIBE';
                else if (lockReason === 'marsBase') lockText = 'REQUIRES MARS BASE';
                else if (lockReason === 'spaceBass') lockText = 'REQUIRES SPACE BASS';
                else if (lockReason === 'cloudBase') lockText = 'REQUIRES CLOUD BASE';
                else if (lockReason === 'titanBase') lockText = 'REQUIRES TITAN BASE';
                else if (lockReason === 'furtherProgress') lockText = 'REQUIRES FURTHER PROGRESS';
                else if (lockReason === 'notInvented') lockText = 'HAS NOT BEEN INVENTED YET.';

                const lockOverlayHtml = isLocked ? `
                    <div class="helper-lock-overlay">
                        <div class="helper-lock-icon" aria-hidden="true"></div>
                        <div class="helper-lock-text">LOCKED</div>
                        <div class="helper-lock-subtext">${lockText}</div>
                    </div>
                ` : '';

                item.innerHTML = `
                    <div class="shop-item-quantity">#${owned}</div>
                    <div class="shop-item-title">${displayName}</div>
                    <div class="shop-item-dps">${displayDps} ĐPS</div>
                    <div class="shop-sprite-description-container">
                        <div class="shop-item-sprite">
                            <img src="${displayIcon}" alt="${displayName}">
                        </div>
                        <div class="shop-item-info">
                            <div class="shop-item-description ${displayDesc.length > 75 ? 'long-description' : ''}">${displayDesc}</div>
                            <button class="shop-buy-btn${isLocked ? ' locked' : ''}" data-helper-type="${type}" ${buttonDisabled}>
                                <img src="assets/general/dogecoin_70x70.png" alt="DogeCoin" class="buy-btn-icon">
                                <span class="buy-btn-price">${priceText}</span>
                            </button>
                        </div>
                    </div>
                    ${lockOverlayHtml}
                `;

                if (isLocked) {
                    item.classList.add('helper-locked');
                }

                // Add click listener to buy button using shared handler to avoid duplicate stacking
                const buyBtn = item.querySelector('.shop-buy-btn');
                if (buyBtn) {
                    buyBtn.removeEventListener('click', this.boundMobileBuyButtonClick);
                    buyBtn.addEventListener('click', this.boundMobileBuyButtonClick);
                }
            } else {
                // Empty slot
                item.innerHTML = `
                    <div class="shop-item-empty">
                        <div class="empty-text">Coming Soon!</div>
                    </div>
                `;
            }

            mobileShopContent.appendChild(item);
        }
    }

    // Update mobile upgrades content
    updateMobileUpgradesContent(fadeInSectionIndex) {
        const mobileUpgradesContainer = document.getElementById('mobile-upgrades-container');
        if (!mobileUpgradesContainer) return;

        // Get all available helper upgrades for the current level's helpers
        const availableUpgrades = this.getAvailableHelperUpgrades();

        // Only shuffle once - store the order to prevent changes on scroll
        if (!this._cachedMobileUpgrades || this._cachedMobileUpgrades.length !== availableUpgrades.length) {
            this._cachedMobileUpgrades = availableUpgrades.sort(() => Math.random() - 0.5).slice(0, 3);
        }
        const displayUpgrades = this._cachedMobileUpgrades;

        // Build HTML for upgrade sections
        let html = '<div class="mobile-upgrade-sections">';

        for (let i = 0; i < 3; i++) {
            if (i < displayUpgrades.length) {
                const upgrade = displayUpgrades[i];
                const canAfford = this.game.dogecoins >= upgrade.price;
                const priceText = this.game.formatNumber(upgrade.price);

                // Get sprite path for the upgraded helper
                const spritePaths = this.game.getHelperSpritePaths(upgrade.helperType, upgrade.nextLevel);
                const helperSprite = spritePaths?.idle || 'assets/helpers/shibes/shibes-idle-0.png';

                // Calculate total DPS (new DPS * helper count)
                const totalDps = upgrade.newDps * upgrade.helperCount;
                const dpsIncrease = (upgrade.newDps - upgrade.currentDps).toFixed(1);

                html += `
                    <div class="mobile-upgrade-section${fadeInSectionIndex === i ? ' mobile-upgrade-fade-in' : ''}" data-section-index="${i}">
                        <div class="mobile-upgrade-item">
                            <div class="mobile-upgrade-helper-sprite">
                                <img src="${helperSprite}" alt="${upgrade.helperName}">
                            </div>
                            <div class="mobile-upgrade-content">
                                <div class="mobile-upgrade-header">
                                    <div class="mobile-upgrade-name">${upgrade.upgradeName}</div>
                                    <div class="mobile-upgrade-total-dps">${this.game.formatNumber(totalDps)} ĐPS</div>
                                </div>
                                <div class="mobile-upgrade-description">${upgrade.upgradeDesc}</div>
                                <div class="mobile-upgrade-footer">
                                    <button class="shop-buy-btn mobile-upgrade-buy-btn${canAfford ? '' : ' disabled'}" 
                                            data-upgrade-helper="${upgrade.helperType}"
                                            data-section-index="${i}"
                                            ${canAfford ? '' : 'disabled'}>
                                        <img src="assets/general/dogecoin_70x70.png" alt="DogeCoin" class="buy-btn-icon">
                                        <span class="buy-btn-price">${priceText}</span>
                                    </button>
                                    <div class="mobile-upgrade-dps-increase">+${dpsIncrease} ĐPS per helper</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // No upgrade available - show "Looking for Upgrades" state
                html += `
                    <div class="mobile-upgrade-section mobile-upgrade-empty" data-section-index="${i}">
                        <div class="mobile-upgrade-empty-state">
                            <div class="mobile-upgrade-empty-text">LOOKING FOR UPGRADES...</div>
                            <div class="searchdog-container-centered">
                                <img class="searchdog" src="assets/general/searchdog_1.png" alt="Searchdog">
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        html += '</div>';
        mobileUpgradesContainer.innerHTML = html;

        // Attach event listeners for mobile upgrade buy buttons
        this.setupMobileUpgradeBuyListeners();

        // Remove fade-in class after animation completes
        if (fadeInSectionIndex !== undefined) {
            setTimeout(() => {
                const section = mobileUpgradesContainer.querySelector(`[data-section-index="${fadeInSectionIndex}"]`);
                if (section) {
                    section.classList.remove('mobile-upgrade-fade-in');
                }
            }, 400);
        }
    }

    // Setup mobile upgrade buy button listeners
    setupMobileUpgradeBuyListeners() {
        const upgradeButtons = document.querySelectorAll('.mobile-upgrade-buy-btn[data-upgrade-helper]');
        upgradeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const helperType = button.getAttribute('data-upgrade-helper');
                const sectionIndex = parseInt(button.getAttribute('data-section-index'), 10);

                if (helperType && window.shopManager) {
                    const success = window.shopManager.buyHelperUpgrade(helperType);
                    if (success) {
                        // Find the upgrade section that contains this button
                        const section = button.closest('.mobile-upgrade-section');
                        if (section) {
                            // Add fade-out class for animation
                            section.classList.add('mobile-upgrade-fade-out');

                            // Wait for animation to complete, then update content
                            setTimeout(() => {
                                section.classList.remove('mobile-upgrade-fade-out');
                                // Clear cached upgrades to get fresh list
                                this._cachedMobileUpgrades = null;
                                // Pass the section index to only fade-in that one
                                this.updateMobileUpgradesContent(sectionIndex);
                                // Also update mobile shop and helper bar
                                this.updateMobileShopContent();
                                this.game.updateMobileHelperBar();
                            }, 500);
                        } else {
                            this._cachedMobileUpgrades = null;
                            this.updateMobileUpgradesContent();
                            this.updateMobileShopContent();
                            this.game.updateMobileHelperBar();
                        }
                    }
                }
            });
        });
    }

    // Update mobile achievements content
    updateMobileAchievementsContent() {
        const mobileAchievementsContent = document.getElementById('mobile-achievements-content');
        if (!mobileAchievementsContent) return;

        // Display comprehensive stats matching desktop
        mobileAchievementsContent.innerHTML = `
            <div class="mobile-content-wrapper">
                <h3 class="mobile-section-header">Statistics</h3>
                <div class="mobile-stats-list">
                    <div class="stat-row">
                        <span class="stat-label">Total Dogecoins:</span>
                        <span id="mobile-total-mined" class="stat-value">0</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Current Balance:</span>
                        <span id="mobile-current-balance" class="stat-value">0</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Total Clicks:</span>
                        <span id="mobile-total-clicks" class="stat-value">0</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Current DPS:</span>
                        <span id="mobile-current-dps" class="stat-value">0</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Highest DPS:</span>
                        <span id="mobile-highest-dps" class="stat-value">0</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Helpers Owned:</span>
                        <span id="mobile-helpers-owned" class="stat-value">0</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Current Level:</span>
                        <span id="mobile-current-level" class="stat-value">Earth</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Play Time:</span>
                        <span id="mobile-play-time" style="font-weight: 700; font-size: 14px;">0:00:00</span>
                    </div>
                </div>
            </div>
        `;

        // Update stat values if game exists
        if (this.game) {
            const mobileTotalMined = document.getElementById('mobile-total-mined');
            const mobileCurrentBalance = document.getElementById('mobile-current-balance');
            const mobileTotalClicks = document.getElementById('mobile-total-clicks');
            const mobileCurrentDps = document.getElementById('mobile-current-dps');
            const mobileHighestDps = document.getElementById('mobile-highest-dps');
            const mobileHelpersOwned = document.getElementById('mobile-helpers-owned');
            const mobileCurrentLevel = document.getElementById('mobile-current-level');
            const mobilePlayTime = document.getElementById('mobile-play-time');

            if (mobileTotalMined) mobileTotalMined.textContent = this.game.formatNumber(Math.floor(this.game.totalMined || 0));
            if (mobileCurrentBalance) mobileCurrentBalance.textContent = this.game.formatNumber(Math.floor(this.game.dogecoins || 0));
            if (mobileTotalClicks) mobileTotalClicks.textContent = this.game.formatNumber(this.game.totalClicks || 0);
            if (mobileCurrentDps) mobileCurrentDps.textContent = this.game.formatNumber(this.game.dps || 0) + ' Đ/s';
            if (mobileHighestDps) mobileHighestDps.textContent = this.game.formatNumber(this.game.highestDps || 0) + ' Đ/s';

            const totalHelpers = (this.game.helpers?.length || 0) +
                (this.game.moonHelpers?.length || 0) +
                (this.game.marsHelpers?.length || 0) +
                (this.game.jupiterHelpers?.length || 0) +
                (this.game.titanHelpers?.length || 0);
            if (mobileHelpersOwned) mobileHelpersOwned.textContent = totalHelpers;

            if (mobileCurrentLevel) {
                const levelName = this.game.currentLevel?.charAt(0).toUpperCase() + this.game.currentLevel?.slice(1) || 'Earth';
                mobileCurrentLevel.textContent = levelName;
            }

            if (mobilePlayTime) {
                // Calculate current play time from session start plus total accumulated time
                const currentPlayTime = Math.floor((Date.now() - this.game.startTime) / 1000) + this.game.totalPlayTime;
                const hours = Math.floor(currentPlayTime / 3600);
                const minutes = Math.floor((currentPlayTime % 3600) / 60);
                const seconds = Math.floor(currentPlayTime % 60);
                mobilePlayTime.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }
    }

    // Update mobile stats (called regularly when achievements tab is open)
    updateMobileStats() {
        if (!this.game || this.activeMobileTab !== 'achievements') return;

        const mobileTotalMined = document.getElementById('mobile-total-mined');
        const mobileCurrentBalance = document.getElementById('mobile-current-balance');
        const mobileTotalClicks = document.getElementById('mobile-total-clicks');
        const mobileCurrentDps = document.getElementById('mobile-current-dps');
        const mobileHighestDps = document.getElementById('mobile-highest-dps');
        const mobileHelpersOwned = document.getElementById('mobile-helpers-owned');
        const mobilePlayTime = document.getElementById('mobile-play-time');

        if (mobileTotalMined) mobileTotalMined.textContent = this.game.formatNumber(Math.floor(this.game.totalMined || 0));
        if (mobileCurrentBalance) mobileCurrentBalance.textContent = this.game.formatNumber(Math.floor(this.game.dogecoins || 0));
        if (mobileTotalClicks) mobileTotalClicks.textContent = this.game.formatNumber(this.game.totalClicks || 0);
        if (mobileCurrentDps) mobileCurrentDps.textContent = this.game.formatNumber(this.game.dps || 0) + ' Đ/s';
        if (mobileHighestDps) mobileHighestDps.textContent = this.game.formatNumber(this.game.highestDps || 0) + ' Đ/s';

        const totalHelpers = (this.game.helpers?.length || 0) +
            (this.game.moonHelpers?.length || 0) +
            (this.game.marsHelpers?.length || 0) +
            (this.game.jupiterHelpers?.length || 0) +
            (this.game.titanHelpers?.length || 0);
        if (mobileHelpersOwned) mobileHelpersOwned.textContent = totalHelpers;

        if (mobilePlayTime) {
            const currentPlayTime = Math.floor((Date.now() - this.game.startTime) / 1000) + this.game.totalPlayTime;
            const hours = Math.floor(currentPlayTime / 3600);
            const minutes = Math.floor((currentPlayTime % 3600) / 60);
            const seconds = Math.floor(currentPlayTime % 60);
            mobilePlayTime.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // Update mobile settings content
    updateMobileSettingsContent() {
        const mobileSettingsContent = document.getElementById('mobile-settings-content');
        if (!mobileSettingsContent || !this.game) return;

        const soundChecked = this.game.soundEnabled ? 'checked' : '';
        const musicChecked = this.game.musicEnabled ? 'checked' : '';
        const notificationsChecked = this.game.notificationsEnabled ? 'checked' : '';
        const autoSaveChecked = this.game.autoSaveEnabled ? 'checked' : '';

        // Display complete settings options matching desktop
        mobileSettingsContent.innerHTML = `
            <div class="mobile-content-wrapper">
                <h3 class="mobile-section-header">Game Settings</h3>
                <div class="mobile-settings-list">
                    <label class="setting-item">
                        <input type="checkbox" id="mobile-sound-enabled" ${soundChecked}>
                        <span class="setting-label">Sound Effects</span>
                    </label>
                    <label class="setting-item">
                        <input type="checkbox" id="mobile-music-enabled" ${musicChecked}>
                        <span class="setting-label">Background Music</span>
                    </label>
                    <label class="setting-item">
                        <input type="checkbox" id="mobile-notifications-enabled" ${notificationsChecked}>
                        <span class="setting-label">Notifications</span>
                    </label>
                    <label class="setting-item">
                        <input type="checkbox" id="mobile-auto-save-enabled" ${autoSaveChecked}>
                        <span class="setting-label">Auto Save</span>
                    </label>
                    <label class="setting-item">
                        <input type="checkbox" id="mobile-force-mobile-ui" ${localStorage.getItem('forceMobileUI') === '1' ? 'checked' : ''}>
                        <span class="setting-label">Force Mobile UI</span>
                    </label>
                    <label class="setting-item" style="margin-top: 10px; display: flex; flex-direction: column; align-items: flex-start; gap: 5px; cursor: default;">
                        <span class="setting-label">Value Update Rate</span>
                        <select id="mobile-value-update-rate" style="padding: 5px; border-radius: 4px; border: 1px solid rgba(0,0,0,0.3); background: #eee; width: 100%; font-family: 'DogeSans', sans-serif;">
                            <option value="0" ${localStorage.getItem('valueUpdateRate') === '0' ? 'selected' : ''}>Instant (Per Frame)</option>
                            <option value="100" ${localStorage.getItem('valueUpdateRate') === '100' ? 'selected' : ''}>100ms</option>
                            <option value="1000" ${(localStorage.getItem('valueUpdateRate') === '1000' || !localStorage.getItem('valueUpdateRate')) ? 'selected' : ''}>1 Second (Default)</option>
                            <option value="5000" ${localStorage.getItem('valueUpdateRate') === '5000' ? 'selected' : ''}>5 Seconds</option>
                        </select>
                    </label>
                </div>
                
                <h3 class="mobile-section-header">Cloud Save</h3>
                <div id="mobile-cloud-save-section" style="margin-bottom: 15px;">
                    <div id="mobile-user-info" style="display: none;">
                        <p id="mobile-user-name" style="font-size: 13px; margin-bottom: 8px;">Signed in as: </p>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <button onclick="saveToCloud()" style="width: 100%; padding: 10px; background: linear-gradient(to bottom, rgba(240, 220, 130, 0.95) 50%, rgba(255, 235, 150, 0.95) 50%); border: 2px solid #d4af37; border-radius: 6px; color: #8b4513; font-weight: 700; font-size: 13px; font-family: 'DogeSans', sans-serif;">Save to Cloud</button>
                            <button onclick="loadFromCloud()" style="width: 100%; padding: 10px; background: linear-gradient(to bottom, rgba(240, 220, 130, 0.95) 50%, rgba(255, 235, 150, 0.95) 50%); border: 2px solid #d4af37; border-radius: 6px; color: #8b4513; font-weight: 700; font-size: 13px; font-family: 'DogeSans', sans-serif;">Load from Cloud</button>
                            <button onclick="signOutUser()" style="width: 100%; padding: 10px; background: linear-gradient(to bottom, rgba(240, 220, 130, 0.95) 50%, rgba(255, 235, 150, 0.95) 50%); border: 2px solid #d4af37; border-radius: 6px; color: #8b4513; font-weight: 700; font-size: 13px; font-family: 'DogeSans', sans-serif;">Sign Out</button>
                        </div>
                    </div>
                    <div id="mobile-sign-in-section">
                        <button onclick="signInWithGoogle()" class="google-signin-btn" style="width: 100%; padding: 10px 16px; background: white; border: 1px solid #dadce0; border-radius: 4px; color: #3c4043; font-weight: 500; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);">
                            <svg class="google-icon" viewBox="0 0 24 24" style="width: 18px; height: 18px;">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span>Sign in with Google</span>
                        </button>
                        <p style="font-size: 11px; opacity: 0.7; margin-top: 6px; line-height: 1.3;">Sign in to save your progress in the cloud!</p>
                    </div>
                </div>

                <h3 style="margin-bottom: 10px; border-bottom: 2px solid #d4af37; padding-bottom: 6px; font-size: 16px;">Local Save/Load</h3>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button onclick="saveGame()" style="width: 100%; padding: 10px; background: linear-gradient(to bottom, rgba(240, 220, 130, 0.95) 50%, rgba(255, 235, 150, 0.95) 50%); border: 2px solid #d4af37; border-radius: 6px; color: #8b4513; font-weight: 700; font-size: 13px; font-family: 'DogeSans', sans-serif;">Save Game</button>
                    <button onclick="loadGame()" style="width: 100%; padding: 10px; background: linear-gradient(to bottom, rgba(240, 220, 130, 0.95) 50%, rgba(255, 235, 150, 0.95) 50%); border: 2px solid #d4af37; border-radius: 6px; color: #8b4513; font-weight: 700; font-size: 13px; font-family: 'DogeSans', sans-serif;">Load Game</button>
                    <button onclick="exportSave()" style="width: 100%; padding: 10px; background: linear-gradient(to bottom, rgba(240, 220, 130, 0.95) 50%, rgba(255, 235, 150, 0.95) 50%); border: 2px solid #d4af37; border-radius: 6px; color: #8b4513; font-weight: 700; font-size: 13px; font-family: 'DogeSans', sans-serif;">Export Save</button>
                    <button onclick="importSave()" style="width: 100%; padding: 10px; background: linear-gradient(to bottom, rgba(240, 220, 130, 0.95) 50%, rgba(255, 235, 150, 0.95) 50%); border: 2px solid #d4af37; border-radius: 6px; color: #8b4513; font-weight: 700; font-size: 13px; font-family: 'DogeSans', sans-serif;">Import Save</button>
                    <button onclick="repairSave()" style="width: 100%; padding: 10px; background: linear-gradient(to bottom, rgba(255, 180, 80, 0.95) 50%, rgba(230, 150, 50, 0.95) 50%); border: 2px solid #c90; border-radius: 6px; color: #333; font-weight: 700; font-size: 13px; font-family: 'DogeSans', sans-serif;">Repair Save</button>
                    <button onclick="resetGame()" style="width: 100%; padding: 10px; background: linear-gradient(to bottom, rgba(220, 100, 100, 0.95) 50%, rgba(200, 80, 80, 0.95) 50%); border: 2px solid #a00; border-radius: 6px; color: white; font-weight: 700; font-size: 13px; font-family: 'DogeSans', sans-serif;">Reset Game</button>
                </div>
            </div>
        `;

        // Attach event listeners
        const soundCheckbox = document.getElementById('mobile-sound-enabled');
        if (soundCheckbox) {
            soundCheckbox.checked = this.game.soundEnabled; // Ensure initial state is correct
            soundCheckbox.addEventListener('change', (e) => {
                this.game.soundEnabled = e.target.checked;
                if (window.audioManager) {
                    window.audioManager.soundEnabled = this.game.soundEnabled;
                }
                if (window.saveGame) window.saveGame(false);

                // Sync desktop checkbox
                const desktopCheckbox = document.getElementById('sound-enabled');
                if (desktopCheckbox) desktopCheckbox.checked = e.target.checked;
            });
        }

        const musicCheckbox = document.getElementById('mobile-music-enabled');
        if (musicCheckbox) {
            musicCheckbox.checked = this.game.musicEnabled; // Ensure initial state is correct
            musicCheckbox.addEventListener('change', (e) => {
                this.game.musicEnabled = e.target.checked;
                if (window.audioManager) {
                    window.audioManager.musicEnabled = this.game.musicEnabled;
                    if (this.game.musicEnabled) {
                        window.audioManager.playBackgroundMusic();
                    } else {
                        window.audioManager.stopMusic();
                    }
                }
                if (window.saveGame) window.saveGame(false);

                // Sync desktop checkbox
                const desktopCheckbox = document.getElementById('music-enabled');
                if (desktopCheckbox) desktopCheckbox.checked = e.target.checked;
            });
        }

        const notificationsCheckbox = document.getElementById('mobile-notifications-enabled');
        if (notificationsCheckbox) {
            notificationsCheckbox.checked = this.game.notificationsEnabled; // Ensure initial state is correct
            notificationsCheckbox.addEventListener('change', (e) => {
                this.game.notificationsEnabled = e.target.checked;
                if (window.saveGame) window.saveGame(false);

                // Sync desktop checkbox
                const desktopCheckbox = document.getElementById('notifications-enabled');
                if (desktopCheckbox) desktopCheckbox.checked = e.target.checked;
            });
        }

        const autoSaveCheckbox = document.getElementById('mobile-auto-save-enabled');
        if (autoSaveCheckbox) {
            autoSaveCheckbox.checked = this.game.autoSaveEnabled; // Ensure initial state is correct
            autoSaveCheckbox.addEventListener('change', (e) => {
                this.game.autoSaveEnabled = e.target.checked;
                if (window.saveGame) window.saveGame(false);

                // Sync desktop checkbox
                const desktopCheckbox = document.getElementById('auto-save-enabled');
                if (desktopCheckbox) desktopCheckbox.checked = e.target.checked;
            });
        }

        const forceMobileCheckbox = document.getElementById('mobile-force-mobile-ui');
        if (forceMobileCheckbox) {
            forceMobileCheckbox.addEventListener('change', (e) => {
                if (window.toggleForceMobileUI) {
                    window.toggleForceMobileUI(e.target.checked);
                }
                // Sync desktop checkbox
                const desktopCheckbox = document.getElementById('force-mobile-ui');
                if (desktopCheckbox) desktopCheckbox.checked = e.target.checked;
            });
        }

        const valueUpdateRateSelect = document.getElementById('mobile-value-update-rate');
        if (valueUpdateRateSelect) {
            valueUpdateRateSelect.addEventListener('change', (e) => {
                if (typeof window.game !== 'undefined' && window.game && window.game.setValueUpdateRate) {
                    window.game.setValueUpdateRate(parseInt(e.target.value));
                }
                // Sync desktop select
                const desktopSelect = document.getElementById('value-update-rate');
                if (desktopSelect) desktopSelect.value = e.target.value;
            });
        }

        // Update cloud save UI based on user sign-in state
        const userInfo = document.getElementById('user-info');
        const mobileUserInfo = document.getElementById('mobile-user-info');
        const mobileSignInSection = document.getElementById('mobile-sign-in-section');

        if (userInfo && userInfo.style.display !== 'none') {
            // User is signed in
            if (mobileUserInfo) mobileUserInfo.style.display = 'block';
            if (mobileSignInSection) mobileSignInSection.style.display = 'none';
            const userName = document.getElementById('user-name')?.textContent;
            const mobileUserName = document.getElementById('mobile-user-name');
            if (mobileUserName && userName) {
                mobileUserName.textContent = userName;
            }
        } else {
            // User is not signed in
            if (mobileUserInfo) mobileUserInfo.style.display = 'none';
            if (mobileSignInSection) mobileSignInSection.style.display = 'block';
        }
    }
}
// Global UI manager instance
let uiManager;
