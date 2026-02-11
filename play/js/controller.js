// DogeMiner: Community Edition - Xbox Controller Support
// Uses the Gamepad API for native controller input — no virtual cursor.

// ── Xbox Button Icon SVGs ────────────────────────────────────────────────────
// Inline SVGs for Xbox-style button prompts. Colours match the official Xbox
// face button palette. Each function returns a self-contained SVG string that
// can be dropped into innerHTML.

const CONTROLLER_ICONS = {
    // Face buttons
    A: `<svg class="ctrl-icon ctrl-a" viewBox="0 0 32 32" width="24" height="24"><circle cx="16" cy="16" r="14" fill="#107C10"/><text x="16" y="22" text-anchor="middle" font-size="16" font-weight="bold" fill="#fff" font-family="DogeSans,sans-serif">A</text></svg>`,
    B: `<svg class="ctrl-icon ctrl-b" viewBox="0 0 32 32" width="24" height="24"><circle cx="16" cy="16" r="14" fill="#E81123"/><text x="16" y="22" text-anchor="middle" font-size="16" font-weight="bold" fill="#fff" font-family="DogeSans,sans-serif">B</text></svg>`,
    X: `<svg class="ctrl-icon ctrl-x" viewBox="0 0 32 32" width="24" height="24"><circle cx="16" cy="16" r="14" fill="#0078D7"/><text x="16" y="22" text-anchor="middle" font-size="16" font-weight="bold" fill="#fff" font-family="DogeSans,sans-serif">X</text></svg>`,
    Y: `<svg class="ctrl-icon ctrl-y" viewBox="0 0 32 32" width="24" height="24"><circle cx="16" cy="16" r="14" fill="#FFB900"/><text x="16" y="22" text-anchor="middle" font-size="16" font-weight="bold" fill="#fff" font-family="DogeSans,sans-serif">Y</text></svg>`,

    // Bumpers / triggers
    LB: `<svg class="ctrl-icon ctrl-lb" viewBox="0 0 40 24" width="32" height="20"><rect x="1" y="1" width="38" height="22" rx="6" fill="#333" stroke="#aaa" stroke-width="1.5"/><text x="20" y="17" text-anchor="middle" font-size="13" font-weight="bold" fill="#fff" font-family="DogeSans,sans-serif">LB</text></svg>`,
    RB: `<svg class="ctrl-icon ctrl-rb" viewBox="0 0 40 24" width="32" height="20"><rect x="1" y="1" width="38" height="22" rx="6" fill="#333" stroke="#aaa" stroke-width="1.5"/><text x="20" y="17" text-anchor="middle" font-size="13" font-weight="bold" fill="#fff" font-family="DogeSans,sans-serif">RB</text></svg>`,
    LT: `<svg class="ctrl-icon ctrl-lt" viewBox="0 0 40 24" width="32" height="20"><rect x="1" y="1" width="38" height="22" rx="6" fill="#444" stroke="#aaa" stroke-width="1.5"/><text x="20" y="17" text-anchor="middle" font-size="13" font-weight="bold" fill="#fff" font-family="DogeSans,sans-serif">LT</text></svg>`,
    RT: `<svg class="ctrl-icon ctrl-rt" viewBox="0 0 40 24" width="32" height="20"><rect x="1" y="1" width="38" height="22" rx="6" fill="#444" stroke="#aaa" stroke-width="1.5"/><text x="20" y="17" text-anchor="middle" font-size="13" font-weight="bold" fill="#fff" font-family="DogeSans,sans-serif">RT</text></svg>`,

    // D-Pad
    DPAD_UP: `<svg class="ctrl-icon ctrl-dpad" viewBox="0 0 24 24" width="18" height="18"><polygon points="12,4 4,16 20,16" fill="#ccc"/></svg>`,
    DPAD_DOWN: `<svg class="ctrl-icon ctrl-dpad" viewBox="0 0 24 24" width="18" height="18"><polygon points="12,20 4,8 20,8" fill="#ccc"/></svg>`,

    // Menu / Start
    MENU: `<svg class="ctrl-icon ctrl-menu" viewBox="0 0 32 24" width="24" height="18"><rect x="6" y="5" width="20" height="2.5" rx="1" fill="#ccc"/><rect x="6" y="10.5" width="20" height="2.5" rx="1" fill="#ccc"/><rect x="6" y="16" width="20" height="2.5" rx="1" fill="#ccc"/></svg>`,

    // Left stick
    LSTICK: `<svg class="ctrl-icon ctrl-lstick" viewBox="0 0 32 32" width="20" height="20"><circle cx="16" cy="16" r="12" fill="none" stroke="#aaa" stroke-width="2"/><circle cx="16" cy="16" r="5" fill="#666"/></svg>`,
};

function getControllerIcon(button) {
    return CONTROLLER_ICONS[button] || '';
}

// ── Standard Gamepad Button Indices (Xbox layout) ────────────────────────────
const GP = {
    A: 0,
    B: 1,
    X: 2,
    Y: 3,
    LB: 4,
    RB: 5,
    LT: 6,
    RT: 7,
    SELECT: 8,   // View / Back
    START: 9,     // Menu / Start
    L3: 10,       // Left stick click
    R3: 11,       // Right stick click
    DPAD_UP: 12,
    DPAD_DOWN: 13,
    DPAD_LEFT: 14,
    DPAD_RIGHT: 15,
};

// Axis indices
const AXIS = {
    LEFT_X: 0,
    LEFT_Y: 1,
    RIGHT_X: 2,
    RIGHT_Y: 3,
};

// ── Xbox Browser Detection ───────────────────────────────────────────────────

function isXboxBrowser() {
    const ua = navigator.userAgent || '';
    return /Xbox/i.test(ua);
}

/**
 * On Xbox Edge the system injects a virtual cursor that is undesirable for our
 * focus-based navigation.  We override it by requesting full-screen-like input
 * behaviour and adding CSS that hides the cursor.
 */
function disableXboxVirtualCursor() {
    // The Xbox Edge browser supports navigator.getGamepads() and exposes a
    // "virtual cursor" that floats around the page.  To disable it we:
    //   1. Set the body to be non-scrollable (we handle scrolling ourselves).
    //   2. Disable the cursor via CSS.
    //   3. Prevent default on mouse events coming from the virtual cursor.

    document.documentElement.style.setProperty('-ms-overflow-style', 'none');
    document.body.style.cursor = 'none';
    document.body.classList.add('xbox-mode');

    // The virtual cursor fires synthetic pointer events.  We swallow them so
    // they don't accidentally click random things.
    const swallowVirtualPointer = (e) => {
        // Real taps on touch screens should still work; only block when we know
        // the controller manager is active and the event looks synthetic (no
        // pressure / "mouse" pointer type while a gamepad is connected).
        if (
            window.controllerManager &&
            window.controllerManager.isActive &&
            e.pointerType === 'mouse'
        ) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    document.addEventListener('pointerdown', swallowVirtualPointer, true);
    document.addEventListener('pointermove', swallowVirtualPointer, true);
    document.addEventListener('pointerup', swallowVirtualPointer, true);
}

// ── Controller Manager ───────────────────────────────────────────────────────

class ControllerManager {
    constructor(game, uiManager, shopManager) {
        this.game = game;
        this.ui = uiManager;
        this.shop = shopManager;

        // State
        this.isActive = false;           // True when a gamepad is connected / Xbox detected
        this.controllerMode = false;     // True once prompts are visible
        this.showIndicators = true;      // User preference for button indicators
        this.gamepadIndex = null;        // Index of active gamepad
        this.prevButtons = [];           // Previous frame button states
        this.prevAxes = [];              // Previous frame axis states

        // Focus system
        this.focusContext = 'mining';    // 'mining' | 'shop' | 'upgrades' | 'settings' | 'modal'
        this.focusIndex = 0;            // Index within current focusable list
        this.scrollCooldown = 0;        // Prevents rapid-fire scrolling

        // Repeat-fire for mining
        this.miningHeld = false;
        this.miningRepeatTimer = null;

        // Analog stick dead zone
        this.DEAD_ZONE = 0.35;

        // Navigation repeat delay (ms)
        this.NAV_COOLDOWN = 180;

        // Panel tab order
        this.panelTabs = ['shop', 'upgrades', 'achievements', 'settings'];
        this.currentPanelIndex = 0;

        // Planet tab order
        this.planetTabs = ['earth', 'moon', 'mars', 'jupiter', 'titan'];
        this.currentPlanetIndex = 0;

        // Prompt elements (created lazily)
        this._promptElements = {};

        // Coin pile observer — attaches X-button icons to new coin piles
        this._coinPileObserver = null;

        // Bind the loop
        this._pollLoop = this._pollLoop.bind(this);

        // Listen for gamepad events
        window.addEventListener('gamepadconnected', (e) => this._onConnect(e));
        window.addEventListener('gamepaddisconnected', (e) => this._onDisconnect(e));

        // If running on Xbox, activate immediately
        if (isXboxBrowser()) {
            disableXboxVirtualCursor();
            this._hideXboxGoogleSignIn();
            this._activateControllerMode();
        }

        // Start polling even before a connection event — some browsers don't
        // fire the event until a button is pressed.
        this._animFrame = requestAnimationFrame(this._pollLoop);
    }

    // ── Connection Handling ──────────────────────────────────────────────

    _onConnect(e) {
        console.log(`Gamepad connected: ${e.gamepad.id} [index ${e.gamepad.index}]`);
        this.gamepadIndex = e.gamepad.index;
        this.isActive = true;
        this._activateControllerMode();
    }

    _onDisconnect(e) {
        console.log(`Gamepad disconnected: ${e.gamepad.id}`);
        if (e.gamepad.index === this.gamepadIndex) {
            // Only deactivate if we are NOT on Xbox — on Xbox the controller
            // may briefly disconnect during suspend/resume.
            if (!isXboxBrowser()) {
                this.isActive = false;
                this.gamepadIndex = null;
                this._deactivateControllerMode();
            }
        }
    }

    // ── Controller Mode Activation ───────────────────────────────────────

    _activateControllerMode() {
        if (this.controllerMode) return;
        this.controllerMode = true;
        document.body.classList.add('controller-mode');
        this._syncPanelIndex();
        this._syncPlanetIndex();
        this._createPrompts();
        this._updateFocus();

        if (window.notificationManager) {
            notificationManager.showInfo('🎮 Controller connected! Use A to mine.');
        }
    }

    _deactivateControllerMode() {
        if (!this.controllerMode) return;
        this.controllerMode = false;
        document.body.classList.remove('controller-mode');
        this._removePrompts();
        this._clearFocusHighlight();

        if (window.notificationManager) {
            notificationManager.showInfo('Controller disconnected.');
        }
    }

    // ── Main Poll Loop ───────────────────────────────────────────────────

    _pollLoop() {
        this._animFrame = requestAnimationFrame(this._pollLoop);

        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        let gp = null;

        // Try to find the active gamepad
        if (this.gamepadIndex !== null && gamepads[this.gamepadIndex]) {
            gp = gamepads[this.gamepadIndex];
        } else {
            // Scan for any connected gamepad (covers browsers that don't fire events)
            for (let i = 0; i < gamepads.length; i++) {
                if (gamepads[i]) {
                    gp = gamepads[i];
                    this.gamepadIndex = i;
                    if (!this.isActive) {
                        this.isActive = true;
                        this._activateControllerMode();
                    }
                    break;
                }
            }
        }

        if (!gp) return;

        // Build button state snapshot
        const buttons = gp.buttons.map(b => ({
            pressed: b.pressed,
            value: b.value,
        }));
        const axes = gp.axes.slice();

        // Detect "just pressed" (edge trigger)
        const justPressed = (index) => {
            return buttons[index] && buttons[index].pressed &&
                !(this.prevButtons[index] && this.prevButtons[index].pressed);
        };

        // Detect held
        const isHeld = (index) => {
            return buttons[index] && buttons[index].pressed;
        };

        // ── Handle input ─────────────────────────────────────────────────

        // A Button — Mine or confirm
        if (justPressed(GP.A)) {
            this._handleA();
        }
        // A held — rapid mining (when not browsing shop/upgrades/settings/modal)
        const canMineHeld = this.focusContext !== 'shop' && this.focusContext !== 'upgrades' && this.focusContext !== 'settings' && this.focusContext !== 'modal';
        if (isHeld(GP.A) && canMineHeld) {
            if (!this.miningHeld) {
                this.miningHeld = true;
                this._startMiningRepeat();
            }
        } else {
            if (this.miningHeld) {
                this.miningHeld = false;
                this._stopMiningRepeat();
            }
        }

        // B Button — Back / Close
        if (justPressed(GP.B)) {
            this._handleB();
        }

        // X Button — Collect nearest coin pile
        if (justPressed(GP.X)) {
            this._handleX();
        }

        // Y Button — Toggle pickaxe modal
        if (justPressed(GP.Y)) {
            this._handleY();
        }

        // LB / RB — Cycle panel tabs
        if (justPressed(GP.LB)) {
            this._cyclePanelTab(-1);
        }
        if (justPressed(GP.RB)) {
            this._cyclePanelTab(1);
        }

        // LT / RT — Cycle planet tabs
        if (buttons[GP.LT] && buttons[GP.LT].value > 0.5 &&
            !(this.prevButtons[GP.LT] && this.prevButtons[GP.LT].value > 0.5)) {
            this._cyclePlanetTab(-1);
        }
        if (buttons[GP.RT] && buttons[GP.RT].value > 0.5 &&
            !(this.prevButtons[GP.RT] && this.prevButtons[GP.RT].value > 0.5)) {
            this._cyclePlanetTab(1);
        }

        // D-Pad / Left Stick — Navigate focus
        if (this.scrollCooldown > 0) {
            this.scrollCooldown -= 16; // ~1 frame at 60fps
        } else {
            let moveY = 0;
            let moveX = 0;

            if (justPressed(GP.DPAD_UP) || (Math.abs(axes[AXIS.LEFT_Y]) > this.DEAD_ZONE && axes[AXIS.LEFT_Y] < -this.DEAD_ZONE)) {
                moveY = -1;
            }
            if (justPressed(GP.DPAD_DOWN) || (Math.abs(axes[AXIS.LEFT_Y]) > this.DEAD_ZONE && axes[AXIS.LEFT_Y] > this.DEAD_ZONE)) {
                moveY = 1;
            }
            if (justPressed(GP.DPAD_LEFT) || (Math.abs(axes[AXIS.LEFT_X]) > this.DEAD_ZONE && axes[AXIS.LEFT_X] < -this.DEAD_ZONE)) {
                moveX = -1;
            }
            if (justPressed(GP.DPAD_RIGHT) || (Math.abs(axes[AXIS.LEFT_X]) > this.DEAD_ZONE && axes[AXIS.LEFT_X] > this.DEAD_ZONE)) {
                moveX = 1;
            }

            if (moveY !== 0 || moveX !== 0) {
                this._navigate(moveX, moveY);
                this.scrollCooldown = this.NAV_COOLDOWN;
            }
        }

        // Start / Menu — Quick save
        if (justPressed(GP.START)) {
            if (window.saveManager) {
                saveManager.saveGame();
            }
        }

        // Store state for next frame
        this.prevButtons = buttons;
        this.prevAxes = axes;
    }

    // ── Button Handlers ──────────────────────────────────────────────────

    _handleA() {
        if (this.focusContext === 'mining') {
            // Mine the rock
            if (this.game) {
                this.game.processClick();
            }
        } else if (this.focusContext === 'shop' || this.focusContext === 'upgrades') {
            // Buy the focused item
            this._buyFocusedItem();
        } else if (this.focusContext === 'settings') {
            // Toggle the focused setting
            this._toggleFocusedSetting();
        } else if (this.focusContext === 'modal') {
            // Select focused modal item
            this._selectModalItem();
        } else {
            // On non-interactive tabs (achievements), A still mines
            if (this.game) {
                this.game.processClick();
            }
        }
    }

    _handleB() {
        // Close any open modal first
        const pickaxeModal = document.getElementById('pickaxe-modal');
        const fortuneModal = document.getElementById('fortune-modal');

        if (pickaxeModal && pickaxeModal.classList.contains('active')) {
            if (window.game) window.game.closePickaxeModal();
            this.focusContext = 'mining';
            this._updateFocus();
            return;
        }
        if (fortuneModal && fortuneModal.classList.contains('active')) {
            if (window.game) window.game.closeFortuneModal();
            this.focusContext = 'mining';
            this._updateFocus();
            return;
        }

        // Otherwise return focus to mining
        this.focusContext = 'mining';
        this.focusIndex = 0;
        this._updateFocus();
    }

    _handleX() {
        // Collect nearest coin pile
        if (this.game && typeof this.game.collectNearestCoinPile === 'function') {
            this.game.collectNearestCoinPile();
        }
    }

    _handleY() {
        // Toggle pickaxe modal
        const pickaxeModal = document.getElementById('pickaxe-modal');
        if (pickaxeModal && pickaxeModal.classList.contains('active')) {
            if (window.game) window.game.closePickaxeModal();
            this.focusContext = 'mining';
        } else {
            if (window.game) window.game.openPickaxeModal();
            this.focusContext = 'modal';
            this.focusIndex = 0;
        }
        this._updateFocus();
    }

    // ── Mining Repeat (A held) ───────────────────────────────────────────

    _startMiningRepeat() {
        this._stopMiningRepeat();
        // Fire at the game's max CPS rate (~15 times/sec = 67ms)
        this.miningRepeatTimer = setInterval(() => {
            if (this.game && this.focusContext === 'mining') {
                this.game.processClick();
            }
        }, 67);
    }

    _stopMiningRepeat() {
        if (this.miningRepeatTimer) {
            clearInterval(this.miningRepeatTimer);
            this.miningRepeatTimer = null;
        }
    }

    // ── Tab Cycling ──────────────────────────────────────────────────────

    _syncPanelIndex() {
        if (this.ui) {
            const current = this.ui.activePanel.replace('-tab', '');
            const idx = this.panelTabs.indexOf(current);
            if (idx >= 0) this.currentPanelIndex = idx;
        }
    }

    _syncPlanetIndex() {
        if (this.game) {
            const idx = this.planetTabs.indexOf(this.game.currentLevel);
            if (idx >= 0) this.currentPlanetIndex = idx;
        }
    }

    _cyclePanelTab(direction) {
        this._syncPanelIndex();
        this.currentPanelIndex = (this.currentPanelIndex + direction + this.panelTabs.length) % this.panelTabs.length;
        const tabName = this.panelTabs[this.currentPanelIndex];

        // Use the global switchMainTab or mobile variant
        if (window.innerWidth <= 768) {
            if (window.switchMobileTab) switchMobileTab(tabName);
        } else {
            if (window.switchMainTab) switchMainTab(tabName);
        }

        // Update focus context — shop/upgrades/settings get their own context so
        // D-Pad can navigate items.  Other tabs keep 'mining' so A still mines.
        if (tabName === 'shop') {
            this.focusContext = 'shop';
        } else if (tabName === 'upgrades') {
            this.focusContext = 'upgrades';
        } else if (tabName === 'settings') {
            this.focusContext = 'settings';
        } else {
            this.focusContext = 'mining';
        }
        this.focusIndex = 0;

        // Defer focus update so the DOM has time to switch
        setTimeout(() => this._updateFocus(), 100);
    }

    _cyclePlanetTab(direction) {
        this._syncPlanetIndex();

        // Find next unlocked planet
        let attempts = 0;
        let newIndex = this.currentPlanetIndex;
        do {
            newIndex = (newIndex + direction + this.planetTabs.length) % this.planetTabs.length;
            attempts++;
        } while (attempts < this.planetTabs.length && !this._isPlanetUnlocked(this.planetTabs[newIndex]));

        if (this._isPlanetUnlocked(this.planetTabs[newIndex])) {
            this.currentPlanetIndex = newIndex;
            const planetName = this.planetTabs[newIndex];
            if (window.switchPlanet) {
                switchPlanet(planetName);
            }
        }
    }

    _isPlanetUnlocked(planet) {
        if (planet === 'earth') return true;

        // Check the planet tab button's disabled state
        const tab = document.querySelector(`.planet-tab[data-planet="${planet}"]`);
        if (tab) return !tab.disabled && !tab.classList.contains('locked');

        // Also check mobile planet tabs
        const mobileTab = document.querySelector(`.mobile-planet-tab[data-planet="${planet}"]`);
        if (mobileTab) return !mobileTab.disabled;

        return false;
    }

    // ── Focus Navigation ─────────────────────────────────────────────────

    _navigate(moveX, moveY) {
        if (this.focusContext === 'mining') {
            // D-Pad switches context to the active panel tab if it supports focus
            if (moveY !== 0 || moveX > 0) {
                this._syncPanelIndex();
                const tabName = this.panelTabs[this.currentPanelIndex];
                if (tabName === 'shop') {
                    this.focusContext = 'shop';
                } else if (tabName === 'upgrades') {
                    this.focusContext = 'upgrades';
                } else if (tabName === 'settings') {
                    this.focusContext = 'settings';
                } else {
                    // Achievements has no focusable items — stay on mining
                    return;
                }
                this.focusIndex = 0;
                this._updateFocus();
            }
            return;
        }

        if (this.focusContext === 'modal') {
            const items = this._getModalFocusables();
            if (items.length === 0) return;
            if (moveY > 0 || moveX > 0) this.focusIndex++;
            if (moveY < 0 || moveX < 0) this.focusIndex--;
            this.focusIndex = Math.max(0, Math.min(this.focusIndex, items.length - 1));
            this._updateFocus();
            return;
        }

        // Settings: true 2-column navigation based on DOM columns
        if (this.focusContext === 'settings') {
            const items = this._getFocusableItems();
            if (items.length === 0) return;

            const container = document.getElementById('settings-tab');
            const columns = container ? container.querySelectorAll('.settings-column') : [];

            // Split items into left and right column groups
            const leftCol = [];
            const rightCol = [];
            items.forEach(item => {
                if (columns[0] && columns[0].contains(item)) leftCol.push(item);
                else rightCol.push(item);
            });

            const currentItem = items[this.focusIndex];
            const inLeftCol = leftCol.includes(currentItem);
            const currentColItems = inLeftCol ? leftCol : rightCol;
            const colIdx = currentColItems.indexOf(currentItem);

            if (moveX > 0 && inLeftCol && rightCol.length > 0) {
                // Move to right column, same row or nearest
                const targetIdx = Math.min(colIdx, rightCol.length - 1);
                this.focusIndex = items.indexOf(rightCol[targetIdx]);
            } else if (moveX < 0) {
                if (!inLeftCol && leftCol.length > 0) {
                    // Move to left column, same row or nearest
                    const targetIdx = Math.min(colIdx, leftCol.length - 1);
                    this.focusIndex = items.indexOf(leftCol[targetIdx]);
                } else {
                    // Already in left column — go back to mining
                    this.focusContext = 'mining';
                    this.focusIndex = 0;
                    this._updateFocus();
                    return;
                }
            } else if (moveY !== 0) {
                // Move within current column
                let newIdx = colIdx + (moveY > 0 ? 1 : -1);
                newIdx = Math.max(0, Math.min(newIdx, currentColItems.length - 1));
                this.focusIndex = items.indexOf(currentColItems[newIdx]);
            }

            this.focusIndex = Math.max(0, Math.min(this.focusIndex, items.length - 1));
            this._updateFocus();
            if (items[this.focusIndex]) {
                items[this.focusIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            return;
        }

        // Shop / Upgrades
        const items = this._getFocusableItems();
        if (items.length === 0) return;

        // Grid-aware navigation: shop uses a 2-column grid, so D-pad
        // up/down should jump by the number of columns.
        const cols = this.focusContext === 'shop' ? 2 : 1;

        if (moveY > 0) this.focusIndex += cols;
        if (moveY < 0) this.focusIndex -= cols;
        if (moveX > 0 && cols > 1) this.focusIndex++;
        if (moveX < 0) {
            if (cols > 1) {
                // In a grid, left moves one column left unless already at col 0
                if (this.focusIndex % cols > 0) {
                    this.focusIndex--;
                } else {
                    // At left edge of grid — go back to mining
                    this.focusContext = 'mining';
                    this.focusIndex = 0;
                    this._updateFocus();
                    return;
                }
            } else {
                // Single-column list — left always goes back to mining
                this.focusContext = 'mining';
                this.focusIndex = 0;
                this._updateFocus();
                return;
            }
        }

        this.focusIndex = Math.max(0, Math.min(this.focusIndex, items.length - 1));
        this._updateFocus();

        // Scroll the focused item into view
        if (items[this.focusIndex]) {
            items[this.focusIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    _getFocusableItems() {
        if (this.focusContext === 'shop') {
            const isMobile = window.innerWidth <= 768;
            const container = isMobile
                ? document.getElementById('mobile-shop-content')
                : document.getElementById('shop-content');
            if (!container) return [];
            // Shop items use .shop-grid-item class
            return Array.from(container.querySelectorAll('.shop-grid-item'));
        }
        if (this.focusContext === 'upgrades') {
            const isMobile = window.innerWidth <= 768;
            const container = isMobile
                ? document.getElementById('mobile-upgrades-container')
                : document.getElementById('upgrades-container');
            if (!container) return [];
            // Upgrade sections that have actual content
            return Array.from(container.querySelectorAll('.upgrade-section.has-upgrade'));
        }
        if (this.focusContext === 'settings') {
            const container = document.getElementById('settings-tab');
            if (!container) return [];
            // Checkboxes + buttons in the settings tab (filter out hidden ones)
            return Array.from(container.querySelectorAll('.setting-item, .setting-btn, .google-signin-btn'))
                .filter(el => el.offsetParent !== null);
        }
        return [];
    }

    _getModalFocusables() {
        const pickaxeModal = document.getElementById('pickaxe-modal');
        if (pickaxeModal && pickaxeModal.classList.contains('active')) {
            return Array.from(pickaxeModal.querySelectorAll('.switcher-card, .pickaxe-card'));
        }
        const fortuneModal = document.getElementById('fortune-modal');
        if (fortuneModal && fortuneModal.classList.contains('active')) {
            return Array.from(fortuneModal.querySelectorAll('.switcher-card, .fortune-card'));
        }
        return [];
    }

    _updateFocus() {
        this._clearFocusHighlight();

        if (this.focusContext === 'mining') {
            const rock = document.getElementById('rock-container');
            if (rock) rock.classList.add('controller-focus');
            return;
        }

        if (this.focusContext === 'modal') {
            const items = this._getModalFocusables();
            if (items[this.focusIndex]) {
                items[this.focusIndex].classList.add('controller-focus');
                items[this.focusIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            return;
        }

        const items = this._getFocusableItems();
        if (items[this.focusIndex]) {
            items[this.focusIndex].classList.add('controller-focus');
        }
    }

    _clearFocusHighlight() {
        document.querySelectorAll('.controller-focus').forEach(el => {
            el.classList.remove('controller-focus');
        });
    }

    // ── Item Purchasing ──────────────────────────────────────────────────

    _buyFocusedItem() {
        const items = this._getFocusableItems();
        const el = items[this.focusIndex];
        if (!el) return;

        // Upgrade sections need special handling for the fade animation
        if (this.focusContext === 'upgrades') {
            this._buyUpgradeWithAnimation(el);
            return;
        }

        // Try to find and click the buy button inside the focused card
        const buyBtn = el.querySelector('.buy-btn, .buy-button, [class*="buy"]');
        if (buyBtn) {
            buyBtn.click();
            return;
        }

        // Fallback: click the element itself (some cards are fully clickable)
        el.click();
    }

    _buyUpgradeWithAnimation(section) {
        const buyBtn = section.querySelector('.upgrade-buy-btn[data-upgrade-helper]');
        if (!buyBtn) return;

        const helperType = buyBtn.getAttribute('data-upgrade-helper');
        if (!helperType || !window.shopManager) return;

        const success = window.shopManager.buyHelperUpgrade(helperType);
        if (!success) return;

        // Determine the section index so the UI can fade-in just that slot
        const allSections = document.querySelectorAll('.upgrade-section');
        let sectionIndex = -1;
        allSections.forEach((sec, idx) => {
            if (sec === section) sectionIndex = idx;
        });

        // Fade-out, then refresh and fade-in (mirrors the mouse click path)
        section.classList.add('upgrade-fade-out');
        setTimeout(() => {
            section.classList.remove('upgrade-fade-out');
            if (window.uiManager) {
                window.uiManager.updateUpgradeContent(sectionIndex);
            }
            // Re-apply focus after DOM replacement
            this._updateFocus();
        }, 500);
    }

    _selectModalItem() {
        const items = this._getModalFocusables();
        const el = items[this.focusIndex];
        if (!el) return;
        el.click();
    }

    _toggleFocusedSetting() {
        const items = this._getFocusableItems();
        const el = items[this.focusIndex];
        if (!el) return;

        // If it's a setting-item with a checkbox, toggle the checkbox
        const checkbox = el.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            return;
        }

        // If it's a button (setting-btn or google-signin-btn), click it
        if (el.classList.contains('setting-btn') || el.classList.contains('google-signin-btn') || el.tagName === 'BUTTON') {
            el.click();
            return;
        }

        // Fallback: click the element
        el.click();
    }

    // ── Xbox-specific UI ─────────────────────────────────────────────────

    _hideXboxGoogleSignIn() {
        // On Xbox browsers, hide the Google sign-in section since it would be
        // clunky to sign in with Google on a console platform.
        const signInSection = document.getElementById('sign-in-section');
        if (signInSection) {
            signInSection.style.display = 'none';
            // Add an Xbox-specific message in its place
            const notice = document.createElement('p');
            notice.className = 'cloud-info';
            notice.textContent = 'Cloud save via Google is not available on Xbox. Use local save instead.';
            signInSection.parentNode.appendChild(notice);
        }
    }

    // ── Controller Prompt UI ─────────────────────────────────────────────

    _createPrompts() {
        if (!this.showIndicators) return;

        // Mining prompt — positioned over the rock (top-left area)
        this._addPrompt('rock-container', 'A', 'Mine', 'prompt-mine');

        // Coin pile X-icon — watch for coin piles being added to the DOM
        this._startCoinPileObserver();

        // Panel tab prompts
        const panelTabsEl = document.getElementById('panel-tabs');
        if (panelTabsEl) {
            this._addPromptToElement(panelTabsEl, 'LB', '', 'prompt-lb', 'left');
            this._addPromptToElement(panelTabsEl, 'RB', '', 'prompt-rb', 'right');
        }

        // Planet tab prompts
        const planetTabsEl = document.getElementById('planet-tabs');
        if (planetTabsEl) {
            this._addPromptToElement(planetTabsEl, 'LT', '', 'prompt-lt', 'left');
            this._addPromptToElement(planetTabsEl, 'RT', '', 'prompt-rt', 'right');
        }

        // Pickaxe button prompt
        this._addPrompt('pickaxe-btn', 'Y', '', 'prompt-pickaxe');

        // Save prompt on settings
        this._addPrompt('settings-tab-btn', 'MENU', 'Save', 'prompt-save');
    }

    _addPrompt(containerId, button, label, promptId, position = 'bottom') {
        const container = document.getElementById(containerId);
        if (!container) return;
        this._addPromptToElement(container, button, label, promptId, position);
    }

    _addPromptToElement(element, button, label, promptId, position = 'bottom') {
        // Avoid duplicates
        if (this._promptElements[promptId]) return;

        const prompt = document.createElement('div');
        prompt.className = `controller-prompt controller-prompt-${position}`;
        prompt.id = promptId;
        prompt.innerHTML = `${getControllerIcon(button)}${label ? `<span class="prompt-label">${label}</span>` : ''}`;

        // Make the parent relatively positioned if not already
        const pos = getComputedStyle(element).position;
        if (pos === 'static') {
            element.style.position = 'relative';
        }

        element.appendChild(prompt);
        this._promptElements[promptId] = prompt;
    }

    _removePrompts() {
        Object.values(this._promptElements).forEach(el => {
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
        this._promptElements = {};

        // Remove X icons from any existing coin piles
        document.querySelectorAll('.coin-pile .coin-pile-x-prompt').forEach(el => el.remove());

        this._stopCoinPileObserver();
    }

    // ── Coin Pile X-Icon Observer ─────────────────────────────────────────

    _startCoinPileObserver() {
        this._stopCoinPileObserver();

        const rockContainer = document.getElementById('rock-container');
        if (!rockContainer) return;

        // Tag any existing coin piles
        rockContainer.querySelectorAll('.coin-pile').forEach(pile => {
            this._addCoinPileIcon(pile);
        });

        // Watch for new coin piles being added
        this._coinPileObserver = new MutationObserver((mutations) => {
            if (!this.controllerMode || !this.showIndicators) return;
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1 && node.classList.contains('coin-pile')) {
                        this._addCoinPileIcon(node);
                    }
                }
            }
        });

        this._coinPileObserver.observe(rockContainer, { childList: true });
    }

    _stopCoinPileObserver() {
        if (this._coinPileObserver) {
            this._coinPileObserver.disconnect();
            this._coinPileObserver = null;
        }
    }

    _addCoinPileIcon(pile) {
        // Don't add duplicates
        if (pile.querySelector('.coin-pile-x-prompt')) return;

        const icon = document.createElement('div');
        icon.className = 'coin-pile-x-prompt';
        icon.innerHTML = getControllerIcon('X');
        pile.appendChild(icon);
    }

    // ── Settings Toggle ──────────────────────────────────────────────────

    setShowIndicators(enabled) {
        this.showIndicators = enabled;
        if (enabled && this.controllerMode) {
            this._createPrompts();
        } else {
            this._removePrompts();
        }
    }

    // ── Cleanup ──────────────────────────────────────────────────────────

    destroy() {
        if (this._animFrame) cancelAnimationFrame(this._animFrame);
        this._stopMiningRepeat();
        this._removePrompts();
        this._clearFocusHighlight();
        this._stopCoinPileObserver();
        document.body.classList.remove('controller-mode', 'xbox-mode');
    }
}

// Global instance placeholder
let controllerManager;
