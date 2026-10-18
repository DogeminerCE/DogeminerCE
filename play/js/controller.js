// DogeMiner: Community Edition - Xbox Controller Support
// Uses the Gamepad API for navigation and a shared Kenney gameplay cursor.

// ── Xbox Button Icon SVGs ────────────────────────────────────────────────────
// Inline SVGs for Xbox-style button prompts. Colours match the official Xbox
// face button palette. Each function returns a self-contained SVG string that
// can be dropped into innerHTML.

const CONTROLLER_ICONS = {
    // Face buttons
    A: `<img class="ctrl-icon" src="assets/Xbox%20Series/XboxSeriesX_A.webp" width="24" height="24" alt="A">`,
    B: `<img class="ctrl-icon" src="assets/Xbox%20Series/XboxSeriesX_B.webp" width="24" height="24" alt="B">`,
    X: `<img class="ctrl-icon" src="assets/Xbox%20Series/XboxSeriesX_X.webp" width="24" height="24" alt="X">`,
    Y: `<img class="ctrl-icon" src="assets/Xbox%20Series/XboxSeriesX_Y.webp" width="24" height="24" alt="Y">`,

    // Bumpers / triggers
    LB: `<img class="ctrl-icon" src="assets/Xbox%20Series/XboxSeriesX_LB.webp" height="20" alt="LB">`,
    RB: `<img class="ctrl-icon" src="assets/Xbox%20Series/XboxSeriesX_RB.webp" height="20" alt="RB">`,
    LT: `<img class="ctrl-icon" src="assets/Xbox%20Series/XboxSeriesX_LT.webp" height="20" alt="LT">`,
    RT: `<img class="ctrl-icon" src="assets/Xbox%20Series/XboxSeriesX_RT.webp" height="20" alt="RT">`,

    // D-Pad
    DPAD_UP: `<img class="ctrl-icon" src="assets/Xbox%20Series/XboxSeriesX_Dpad_Up.webp" height="20" alt="D-Pad Up">`,
    DPAD_DOWN: `<img class="ctrl-icon" src="assets/Xbox%20Series/XboxSeriesX_Dpad_Down.webp" height="20" alt="D-Pad Down">`,
    DPAD_LEFT: `<img class="ctrl-icon" src="assets/Xbox%20Series/XboxSeriesX_Dpad_Left.webp" height="20" alt="D-Pad Left">`,
    DPAD_RIGHT: `<img class="ctrl-icon" src="assets/Xbox%20Series/XboxSeriesX_Dpad_Right.webp" height="20" alt="D-Pad Right">`,

    // Menu / View
    MENU: `<img class="ctrl-icon" src="assets/Xbox%20Series/XboxSeriesX_Menu.webp" height="20" alt="Menu">`,

    // Left stick
    LSTICK: `<img class="ctrl-icon" src="assets/Xbox%20Series/XboxSeriesX_Left_Stick.webp" height="24" alt="LS">`,
    
    // Right stick
    RSTICK: `<img class="ctrl-icon" src="assets/Xbox%20Series/XboxSeriesX_Right_Stick.webp" height="24" alt="RS">`,
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

        // Virtual cursor state
        this.vcActive = false;
        this.vcX = window.innerWidth / 2;
        this.vcY = window.innerHeight / 2;
        this.vcHideTimeout = null;
        this.vcElement = null;
        this.vcPrompt = null;
        this.vcToggledOn = false;

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

        // In-game dialog state (replaces browser confirm/alert)
        this._dialogOpen = false;
        this._dialogResolve = null;
        this._dialogFocusIdx = 0;   // 0 = Confirm, 1 = Cancel

        // Bind the loop
        this._pollLoop = this._pollLoop.bind(this);

        // Disabled-by-user flag (persisted via localStorage)
        this._disabledByUser = localStorage.getItem('controllerDisabled') === 'true';

        // Listen for gamepad events
        window.addEventListener('gamepadconnected', (e) => this._onConnect(e));
        window.addEventListener('gamepaddisconnected', (e) => this._onDisconnect(e));

        // If running on Xbox, activate immediately
        if (isXboxBrowser()) {
            disableXboxVirtualCursor();
            this._hideXboxOnlyElements();
            this._activateControllerMode();
        } else {
            // Restore checkbox state on non-Xbox
            const cb = document.getElementById('disable-controller');
            if (cb) cb.checked = this._disabledByUser;
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
        this.game?.releaseDrill?.();
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

        // If user disabled controller input, skip everything
        if (this._disabledByUser) return;
        if (document.hidden || document.hasFocus?.() === false) {
            this.game?.releaseMiningInput?.();
            this._waitForFocusRelease = true;
            return;
        }

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

        if (!gp) { if (this.game?._drill?.input === 'controller') this.game.releaseDrill?.(); return; }

        // Build button state snapshot
        const buttons = gp.buttons.map(b => ({
            pressed: b.pressed,
            value: b.value,
        }));
        const axes = gp.axes.slice();

        // A held button from another window must be released before any game
        // action, purchase or menu toggle can be triggered on focus return.
        if (this._waitForFocusRelease) {
            this.prevButtons = buttons; this.prevAxes = axes;
            if (buttons.some(button => button.pressed) || axes.some(axis => Math.abs(axis) > .3)) return;
            this._waitForFocusRelease = false;
        }

        // Detect "just pressed" (edge trigger)
        const justPressed = (index) => {
            return buttons[index] && buttons[index].pressed &&
                !(this.prevButtons[index] && this.prevButtons[index].pressed);
        };

        // Detect held
        const isHeld = (index) => {
            return buttons[index] && buttons[index].pressed;
        };

        // Detect "just released"
        const justReleased = (index) => {
            return this.prevButtons[index] && this.prevButtons[index].pressed &&
                !(buttons[index] && buttons[index].pressed);
        };

        if (this.game?._drill?.input === 'controller' && (!buttons[GP.A]?.pressed || this.focusContext !== 'mining' || this._dialogOpen || this.game.isStoryOpen || this.game.isBetaReportOpen || this.game.isOfflineReportOpen || this.game.isUpdateNotesOpen)) this.game.releaseDrill?.();

        // ── Handle input ─────────────────────────────────────────────────

        // A confirmation opened by another modal always owns input first
        if (this._dialogOpen) {
            this._handleDialogInput(justPressed, GP, axes);
            this.prevButtons = buttons;
            this.prevAxes = axes;
            return;
        }

        // Report controls stay separate from mining, travel, dialogs and purchases.
        if (this.game.isBetaReportOpen || this.game.isOfflineReportOpen || this.game.isStoryOpen || this.game.isUpdateNotesOpen) {
            this._handleBetaReportInput(buttons, axes);
            return;
        }
        this._betaReportElement = null;
        this._betaReportLastFrame = null;
        if (this.game._dogebagReveal) {
            this._handleDogebagInput(buttons, axes);
            return;
        }
        this._dogebagInputView = null;


        // D.I.A. owns its brief, nested warning, decision and rewards. No
        // mining, purchases, tab changes or moon controls may run behind it.
        const mission = this._missionInputRoot();
        if (mission) {
            this._handleMissionInput(mission, buttons, axes);
            return;
        }
        this._missionInputView = null;
        const menuModal = ['supporter-modal', 'pickaxe-modal', 'fortune-modal', 'mystery-box-modal']
            .map(id => document.getElementById(id)).find(root => root?.classList.contains('active'));
        if (menuModal) {
            this._handleMenuModalInput(menuModal, buttons, axes);
            return;
        }
        if (this._menuModalReturn) {
            Object.assign(this, this._menuModalReturn);
            this._menuModalReturn = null;
            this._updateFocus();
        }
        this._menuModalInputView = null;

        // Moon launch owns initiation, playback and the skip confirmation.
        if (this.game && this.game.isCutscenePlaying) {
            this.game.handleMoonLaunchController?.(justPressed, GP);
            this.prevButtons = buttons;
            this.prevAxes = axes;
            return;
        }

        if (justPressed(GP.A)) {
            this._handleA();
        }
        if (justReleased(GP.A)) {
            if (this.game && typeof this.game.endSwing === 'function' && this.focusContext === 'mining') {
                this.game.endSwing();
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

        // Y Button — Toggle inventories focus
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

        // Virtual Cursor (Right Stick logic)
        let rx = axes[AXIS.RIGHT_X] || 0;
        let ry = axes[AXIS.RIGHT_Y] || 0;
        let rightStickActive = Math.abs(rx) > this.DEAD_ZONE || Math.abs(ry) > this.DEAD_ZONE;
        
        let shouldProcessCursor = this.vcToggledOn || (this.game && this.game.isPlacingHelpers);

        if (shouldProcessCursor) {
            if (rightStickActive) {
                this._handleRightStick(rx, ry);
            } else if (this.game && this.game.isPlacingHelpers && (!this.vcElement || this.vcPrompt.style.display === 'none')) {
                // Wake up prompt automatically for helper placement mode
                this._handleRightStick(0, 0);
            }
        }

        // LT / RT — Interaction logic
        if (buttons[GP.LT] && buttons[GP.LT].value > 0.5 &&
            !(this.prevButtons[GP.LT] && this.prevButtons[GP.LT].value > 0.5)) {
            this._cyclePlanetTab(-1);
        }
        if (buttons[GP.RT] && buttons[GP.RT].value > 0.5 &&
            !(this.prevButtons[GP.RT] && this.prevButtons[GP.RT].value > 0.5)) {
            if ((this.game && this.game.isPlacingHelpers) || this.vcActive) {
                this._simulateVirtualClick(true);
            } else {
                this._cyclePlanetTab(1);
            }
        }
        
        // RT released for drag drop
        if ((!buttons[GP.RT] || buttons[GP.RT].value <= 0.5) &&
            (this.prevButtons[GP.RT] && this.prevButtons[GP.RT].value > 0.5)) {
            if (this.vcActive || (this.game && this.game.isPlacingHelpers)) {
                this._simulateVirtualClick(false);
            }
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

        // Start / Menu — Toggle Fortunes Inventory
        if (justPressed(GP.START)) {
            // Can toggle from mining or inside the modal
            if (this.focusContext === 'mining' || this.focusContext === 'modal') {
                this._handleMenuButton();
            }
        }

        // Select / View — Toggle Cursor Mode
        if (justPressed(GP.SELECT)) {
            this._toggleCursorMode();
        }

        // Store state for next frame
        this.prevButtons = buttons;
        this.prevAxes = axes;
    }

    // ── Button Handlers ──────────────────────────────────────────────────

    _handleBetaReportInput(buttons, axes) {
        const report = document.getElementById(this.game.isUpdateNotesOpen ? 'release-notes' : this.game.isStoryOpen ? 'story-popup'
            : this.game.isOfflineReportOpen ? 'offline-earnings-report' : 'beta-balance-report');
        const now = Date.now();
        try {
            // Seed the opening frame: a button held while mining cannot confirm.
            if (!report || this._betaReportElement !== report) {
                this._betaReportElement = report;
                this._betaReportLastFrame = now;
                return;
            }
            const justPressed = index => buttons[index]?.pressed && !this.prevButtons[index]?.pressed;
            if (this.game.isUpdateNotesOpen && justPressed(GP.B)) { window.DogeMinerReleaseNotes.close(); return; }
            const deadZone = this.DEAD_ZONE || 0.35;
            const axisPressed = (axis, direction) => direction * (axes[axis] || 0) > deadZone
                && direction * (this.prevAxes[axis] || 0) <= deadZone;
            const focusables = [...report.querySelectorAll('button, input, select, summary, [tabindex="0"]')]
                .filter(element => !element.disabled && !element.closest('[hidden]') && element.getClientRects().length > 0);
            const focused = document.activeElement;
            const body = report.querySelector('.beta-balance-body');
            const elapsed = Math.max(0, Math.min(50, now - (this._betaReportLastFrame ?? now)));
            if (body && Math.abs(axes[AXIS.RIGHT_Y] || 0) > deadZone) {
                body.scrollTop += Math.round(axes[AXIS.RIGHT_Y] * elapsed * 0.8);
            }

            const previous = justPressed(GP.LB) || justPressed(GP.DPAD_UP) || axisPressed(AXIS.LEFT_Y, -1);
            const next = justPressed(GP.RB) || justPressed(GP.DPAD_DOWN) || axisPressed(AXIS.LEFT_Y, 1);
            const left = justPressed(GP.DPAD_LEFT) || axisPressed(AXIS.LEFT_X, -1);
            const right = justPressed(GP.DPAD_RIGHT) || axisPressed(AXIS.LEFT_X, 1);
            if (!previous && !next && focusables.includes(focused) && focused?.tagName === 'SELECT' && (left || right)) {
                const count = focused.options.length;
                if (count) {
                    focused.selectedIndex = (focused.selectedIndex + (right ? 1 : -1) + count) % count;
                    focused.dispatchEvent(new Event('change', { bubbles: true }));
                }
                return;
            }
            if (previous || next || left || right) {
                if (focusables.length) {
                    const index = focusables.indexOf(focused);
                    const direction = next || right ? 1 : -1;
                    const target = index < 0 ? (direction > 0 ? 0 : focusables.length - 1)
                        : (index + direction + focusables.length) % focusables.length;
                    focusables[target].focus();
                }
                return;
            }
            // A activates only a focused action or item; search/filter focus never
            // acknowledges. B and every other game action intentionally stay idle.
            if (justPressed(GP.A) && focusables.includes(focused)
                && (focused.tagName === 'BUTTON' || focused.tagName === 'SUMMARY')) focused.click();
        } finally {
            this._betaReportLastFrame = now;
            this.prevButtons = buttons;
            this.prevAxes = axes;
        }
    }

    _handleMenuModalInput(root, buttons, axes) {
        const controls = this._visibleControls(root, 'button, input, select, a[href], [tabindex="0"]');
        try {
            if (this._menuModalInputView !== root) {
                this._menuModalReturn ||= { focusContext: this.focusContext, focusIndex: this.focusIndex };
                this._menuModalInputView = root;
                this.game?.releaseMiningInput?.();
                (controls.includes(document.activeElement) ? document.activeElement : controls[0])?.focus({ preventScroll: true });
                return;
            }
            const pressed = index => buttons[index]?.pressed && !this.prevButtons[index]?.pressed;
            if (pressed(GP.B)) {
                if (root.id === 'supporter-modal') window.closeSupporterModal?.();
                else if (root.id === 'pickaxe-modal') this.game.closePickaxeModal();
                else if (root.id === 'fortune-modal') this.game.closeFortuneModal();
                else this.game.closeMysteryBoxModal?.();
                return;
            }
            const axis = direction => direction * (axes[AXIS.LEFT_Y] || 0) > this.DEAD_ZONE
                && direction * (this.prevAxes[AXIS.LEFT_Y] || 0) <= this.DEAD_ZONE;
            const previous = pressed(GP.LB) || pressed(GP.DPAD_UP) || pressed(GP.DPAD_LEFT) || axis(-1);
            const next = pressed(GP.RB) || pressed(GP.DPAD_DOWN) || pressed(GP.DPAD_RIGHT) || axis(1);
            if ((previous || next) && controls.length) {
                const current = controls.indexOf(document.activeElement), direction = next ? 1 : -1;
                const index = current < 0 ? (next ? 0 : controls.length - 1)
                    : (current + direction + controls.length) % controls.length;
                controls[index].focus({ preventScroll: true });
                controls[index].scrollIntoView({ block: 'nearest', inline: 'nearest' });
            } else if (pressed(GP.A) && controls.includes(document.activeElement)) {
                if (document.activeElement.tagName === 'SELECT') {
                    const select = document.activeElement;
                    const options = [...select.options].filter(option => !option.disabled && !option.hidden);
                    if (options.length) {
                        select.value = options[(options.indexOf(select.selectedOptions[0]) + 1) % options.length].value;
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                } else if (document.activeElement.tagName !== 'INPUT' || document.activeElement.type === 'checkbox') document.activeElement.click();
            }
            if (pressed(GP.SELECT)) this._toggleCursorMode();
            if (this.vcToggledOn) {
                this._handleRightStick(axes[AXIS.RIGHT_X] || 0, axes[AXIS.RIGHT_Y] || 0);
                const target = document.elementFromPoint(this.vcX, this.vcY);
                if (pressed(GP.RT) && root.contains(target)) this._simulateVirtualClick(true);
            }
            if (this.prevButtons[GP.RT]?.pressed && !buttons[GP.RT]?.pressed) this._simulateVirtualClick(false);
        } finally { this.prevButtons = buttons; this.prevAxes = axes; }
    }

    _missionInputRoot() {
        for (const id of ['dia-warning-modal', 'dia-mission-modal', 'mission-cutscene', 'mission-passed']) {
            const root = document.getElementById(id);
            if (root && (root.classList.contains('active') || id === 'mission-cutscene' || id === 'mission-passed')) return root;
        }
        return null;
    }

    _handleMissionInput(root, buttons, axes) {
        const controls = this._visibleControls(root);
        const now = Date.now();
        try {
            // Every new step/action set consumes its opening frame. A held to
            // finish a line, choose a badge or accept a reward cannot carry on.
            const changed = this._missionInputView !== root || controls.length !== this._missionControls?.length
                || controls.some((control, index) => control !== this._missionControls[index]);
            if (changed) {
                this.game?.releaseMiningInput?.();
                this._missionInputView = root;
                this._missionControls = controls;
                const preferred = root.id === 'dia-warning-modal' ? controls.find(el => el.id === 'dia-warning-no')
                    : controls.find(el => el.matches('.dia-badge-card.selected, .dia-btn-right, #cs-attack, #mp-ok'));
                (preferred || controls[0])?.focus({ preventScroll: true });
                return;
            }
            const pressed = index => buttons[index]?.pressed && !this.prevButtons[index]?.pressed;
            const axisPressed = (axis, direction) => direction * (axes[axis] || 0) > this.DEAD_ZONE
                && direction * (this.prevAxes[axis] || 0) <= this.DEAD_ZONE;
            if (pressed(GP.B)) {
                if (root.id === 'dia-warning-modal') document.getElementById('dia-warning-no')?.click();
                else if (root.id === 'dia-mission-modal') window.timeTravelManager?._back();
                return;
            }
            // Reveal a sentence separately from accepting the next reply.
            if (root.id === 'dia-mission-modal' && window.timeTravelManager?._finishTyping && pressed(GP.A)) {
                window.timeTravelManager._finishTyping();
                return;
            }
            if (pressed(GP.START)) {
                controls.find(el => el.id === 'dia-skip-btn' || el.id === 'mission-cutscene-skip')?.click();
                return;
            }
            const previous = pressed(GP.LB) || pressed(GP.DPAD_UP) || pressed(GP.DPAD_LEFT)
                || axisPressed(AXIS.LEFT_Y, -1) || axisPressed(AXIS.LEFT_X, -1);
            const next = pressed(GP.RB) || pressed(GP.DPAD_DOWN) || pressed(GP.DPAD_RIGHT)
                || axisPressed(AXIS.LEFT_Y, 1) || axisPressed(AXIS.LEFT_X, 1);
            if ((previous || next) && controls.length) {
                const current = controls.indexOf(document.activeElement), direction = next ? 1 : -1;
                const index = current < 0 ? (next ? 0 : controls.length - 1)
                    : (current + direction + controls.length) % controls.length;
                controls[index].focus({ preventScroll: true });
                controls[index].scrollIntoView({ block: 'nearest', inline: 'nearest' });
            } else if (pressed(GP.A) && controls.includes(document.activeElement)) document.activeElement.click();
            const scroll = root.querySelector('.dia-mission-card, .mp-body, .dia-warning-card');
            if (scroll && Math.abs(axes[AXIS.RIGHT_Y] || 0) > this.DEAD_ZONE) {
                scroll.scrollTop += axes[AXIS.RIGHT_Y] * Math.min(50, now - (this._missionInputAt ?? now)) * .8;
            }
        } finally {
            this._missionInputAt = now;
            this.prevButtons = buttons;
            this.prevAxes = axes;
        }
    }

    _handleDogebagInput(buttons, axes) {
        try {
            const view = this.game._dogebagReveal;
            if (this._dogebagInputView !== view) {this._dogebagInputView = view; return;}
            const justPressed = index => buttons[index]?.pressed && !this.prevButtons[index]?.pressed;
            const modal = document.getElementById('dogebag-modal');
            const controls = [...(modal?.querySelectorAll('button') || [])]
                .filter(button => !button.disabled && button.getClientRects().length);
            if (justPressed(GP.B) || view?.kind === 'mystery' && justPressed(GP.START)) {this.game.closeDogebagModal(); return;}
            const direction = justPressed(GP.LB) || justPressed(GP.DPAD_UP) ? -1
                : justPressed(GP.RB) || justPressed(GP.DPAD_DOWN) ? 1 : 0;
            if (direction && controls.length) {
                const index = controls.indexOf(document.activeElement);
                const next = index < 0 ? (direction > 0 ? 0 : controls.length - 1) : (index + direction + controls.length) % controls.length;
                controls[next].focus();
            }
            if (justPressed(GP.A) && controls.includes(document.activeElement)) document.activeElement.click();
            if (this.vcToggledOn || Math.abs(axes[AXIS.RIGHT_X] || 0) > this.DEAD_ZONE || Math.abs(axes[AXIS.RIGHT_Y] || 0) > this.DEAD_ZONE) {
                this._handleRightStick(axes[AXIS.RIGHT_X] || 0, axes[AXIS.RIGHT_Y] || 0);
            }
            if (justPressed(GP.RT)) this._simulateVirtualClick(true);
            if (this.prevButtons[GP.RT]?.pressed && !buttons[GP.RT]?.pressed) this._simulateVirtualClick(false);
        } finally {this.prevButtons = buttons; this.prevAxes = axes;}
    }

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
        } else if (this.focusContext === 'inventories') {
            const items = this._getFocusableItems();
            if (items[this.focusIndex]) {
                items[this.focusIndex].click();

            }
        } else {
            // On non-interactive tabs (achievements), A still mines
            if (this.game) {
                this.game.processClick();
            }
        }
    }

    _toggleCursorMode() {
        this.vcToggledOn = !this.vcToggledOn;
        
        const standardPrompts = document.querySelectorAll('.controller-prompt:not(#vc-prompt-container)');
        standardPrompts.forEach(p => {
            if (this.vcToggledOn) {
                p.style.setProperty('opacity', '0', 'important');
            } else {
                p.style.removeProperty('opacity');
            }
        });

        if (this.vcToggledOn) {
            this._handleRightStick(0, 0);
        } else {
            this._hideVirtualCursor();
        }
    }

    _handleB() {
        // Close any open modal first
        const pickaxeModal = document.getElementById('pickaxe-modal');
        const fortuneModal = document.getElementById('fortune-modal');
        const supporterModal = document.getElementById('supporter-modal');

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
        if (supporterModal && supporterModal.classList.contains('active')) {
            if (window.closeSupporterModal) window.closeSupporterModal();
            this.focusContext = 'mining';
            this._updateFocus();
            return;
        }

        // Otherwise return focus to the field, closing a Phone drawer first.
        if (this._isPhoneLayout() && this.ui?.mobileMenuOpen) this.ui.closeMobileMenu();
        this.focusContext = 'mining';
        this.focusIndex = 0;
        this._updateFocus();
    }

    _handleX() {
        if (!window.game) return;
        const rockContainer = document.getElementById('rock-container');
        if (!rockContainer) return;

        // Priority 1: Collect dogebag
        const dogebags = rockContainer.querySelectorAll('.dogebag-drop');
        if (dogebags.length > 0) {
            dogebags[0].click();

            return;
        }

        // Collect discovery clues before ordinary coin piles.
        const clue = document.querySelector('.world-artifact:not(:disabled)');
        if (clue) { clue.click(); return; }

        const diamond = rockContainer.querySelector('.diamond-stack:not([data-collected])');
        if (diamond) { diamond.click(); return; }

        // Priority 3: Collect nearest coin pile
        if (typeof window.game.collectNearestCoinPile === 'function') {
            window.game.collectNearestCoinPile();
        }
    }

    _handleY() {
        // Toggle inventory buttons focus
        if (this.focusContext === 'inventories') {
            this.focusContext = 'mining';
        } else {
            this.focusContext = 'inventories';
            this.focusIndex = 0;
        }
        this._updateFocus();
    }

    _handleMenuButton() {
        // Only allow opening if mystery box is obtained
        if (!window.game || !window.game.mysteryBoxObtained) return;

        // Toggle mystery box modal
        const mysteryBoxModal = document.getElementById('mystery-box-modal');
        if (mysteryBoxModal && mysteryBoxModal.classList.contains('active')) {
            if (window.game && window.game.closeMysteryBoxModal) window.game.closeMysteryBoxModal();
            this.focusContext = 'mining';
        } else {
            if (window.game && window.game.openMysteryBoxModal) window.game.openMysteryBoxModal();
            // The active-modal route owns focus and remembers the field context.
        }
        this._updateFocus();
    }

    // ── Tab Cycling ──────────────────────────────────────────────────────

    _isPhoneLayout() {
        return this.game?.isMobileDevice?.() ?? (window.innerWidth <= 768);
    }

    _syncPanelIndex() {
        if (this.ui) {
            const current = this._isPhoneLayout() ? this.ui.activeMobileTab : this.ui.activePanel?.replace('-tab', '');
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
        if (this._isPhoneLayout()) {
            this.ui?.switchMobileTab(tabName);
            if (this.ui && !this.ui.mobileMenuOpen) this.ui.toggleMobileMenu();
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

        if (this.game?.isWorldTravelAllowed?.() === false || this.game?.isTransitioning) return;
        if (newIndex !== this.currentPlanetIndex && this._isPlanetUnlocked(this.planetTabs[newIndex])) {
            this.currentPlanetIndex = newIndex;
            const planetName = this.planetTabs[newIndex];
            if (window.switchPlanet) {
                switchPlanet(planetName);
            }
        }
    }

    _isPlanetUnlocked(planet) {
        if (typeof this.game?.isWorldPlanetUnlocked === 'function') return this.game.isWorldPlanetUnlocked(planet);
        if (planet === 'earth') return true;

        // Check the planet tab button's disabled state
        const tab = document.querySelector(`.planet-tab[data-planet="${planet}"]`);
        if (tab) return !tab.disabled && tab.getAttribute('aria-disabled') !== 'true' && !tab.classList.contains('locked');

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
                if (this._isPhoneLayout() && this.ui && !this.ui.mobileMenuOpen) {
                    this.ui.toggleMobileMenu();
                    setTimeout(() => this._updateFocus(), 100);
                } else this._updateFocus();
            }
            return;
        }

        if (this.focusContext === 'inventories') {
            const items = this._getFocusableItems();
            if (items.length === 0) return;
            // Left/right only — matches horizontal layout of Pickaxe/Fortune buttons
            if (moveX > 0) this.focusIndex++;
            if (moveX < 0) this.focusIndex--;
            this.focusIndex = Math.max(0, Math.min(this.focusIndex, items.length - 1));
            this._updateFocus();
            return;
        }

        if (this.focusContext === 'modal') {
            const items = this._getModalFocusables();
            if (items.length === 0) return;
            
            const cols = this._getGridColumns(items);

            if (moveY > 0) this.focusIndex += cols;
            if (moveY < 0) this.focusIndex -= cols;
            if (moveX > 0) this.focusIndex++;
            if (moveX < 0) this.focusIndex--;

            this.focusIndex = Math.max(0, Math.min(this.focusIndex, items.length - 1));
            this._updateFocus();
            return;
        }

        // Settings: true 2-column navigation based on DOM columns
        if (this.focusContext === 'settings') {
            const items = this._getFocusableItems();
            if (items.length === 0) return;

            const currentControl = items[this.focusIndex];
            if (currentControl?.tagName === 'SELECT' && moveX) {
                this._changeSettingSelect(currentControl, moveX);
                return;
            }
            if (this._isPhoneLayout()) {
                this.focusIndex = Math.max(0, Math.min(this.focusIndex + (moveY || moveX), items.length - 1));
                this._updateFocus();
                return;
            }
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

        // Phone shop cards page horizontally; upgrade actions are a single
        // ordered list so both currency choices and slot unlocks are reachable.
        if (this._isPhoneLayout() || this.focusContext === 'upgrades') {
            const delta = moveX || moveY;
            if (moveX < 0 && this.focusIndex === 0) { this.focusContext = 'mining'; this._updateFocus(); return; }
            this.focusIndex = Math.max(0, Math.min(this.focusIndex + delta, items.length - 1));
            this._updateFocus();
            items[this.focusIndex]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            return;
        }
        const cols = this._getGridColumns(items);

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

    _getGridColumns(items) {
        if (items.length < 2) return 1;
        const firstTop = items[0].getBoundingClientRect().top;
        let cols = 1;
        // Count how many items belong on the first visible row horizontally
        // We use a small threshold in case there is slight alignment drift
        for (let i = 1; i < items.length; i++) {
            if (Math.abs(items[i].getBoundingClientRect().top - firstTop) < 10) {
                cols++;
            } else {
                break;
            }
        }
        return Math.max(1, cols);
    }

    _getFocusableItems() {
        if (this.focusContext === 'shop') {
            const isMobile = this._isPhoneLayout();
            const container = isMobile
                ? document.getElementById('mobile-shop-content')
                : document.getElementById('shop-content');
            if (!container) return [];
            // Shop items use .shop-grid-item class
            return Array.from(container.querySelectorAll('.shop-grid-item')).filter(el => el.getClientRects().length && el.querySelector('.shop-buy-btn'));
        }
        if (this.focusContext === 'upgrades') {
            const isMobile = this._isPhoneLayout();
            const container = isMobile
                ? document.getElementById('mobile-upgrades-tab')
                : document.getElementById('upgrades-tab');
            if (!container) return [];
            // Route actual action buttons through their normal purchase handlers.
            return this._visibleControls(container, '.upgrade-buy-btn, .mobile-upgrade-buy-btn, .searchdoge-unlock-btn');
        }
        if (this.focusContext === 'settings') {
            const container = document.getElementById(this._isPhoneLayout() ? 'mobile-settings-tab' : 'settings-tab');
            return this._visibleControls(container, '.setting-item input, .setting-item select, button, a[href]');
        }
        if (this.focusContext === 'inventories') {
            return [
                document.getElementById('pickaxe-btn'),
                document.getElementById('fortune-btn')
            ].filter(Boolean);
        }
        return [];
    }

    _getModalFocusables() {
        const pickaxeModal = document.getElementById('pickaxe-modal');
        if (pickaxeModal && pickaxeModal.classList.contains('active')) {
            // We use .item-card as that's the class assigned during renderPickaxeGrid and renderFortuneGrid
            return Array.from(pickaxeModal.querySelectorAll('.switcher-card, .item-card'));
        }
        const fortuneModal = document.getElementById('fortune-modal');
        if (fortuneModal && fortuneModal.classList.contains('active')) {
            return Array.from(fortuneModal.querySelectorAll('.switcher-card, .item-card'));
        }
        // Supporter modal
        const supporterModal = document.getElementById('supporter-modal');
        if (supporterModal && supporterModal.classList.contains('active')) {
            return Array.from(supporterModal.querySelectorAll('button, a')).filter(b => b.offsetParent !== null);
        }
        // Shared Dogebag / Mystery Box controls, including prompt and receipt actions.
        const dogebagModal = document.getElementById('dogebag-modal');
        if (dogebagModal?.classList.contains('active')) {
            return Array.from(dogebagModal.querySelectorAll('button')).filter(button => !button.disabled && button.getClientRects().length);
        }
        // Mystery Box modal — only target action buttons, not structural ones
        const mysteryBoxModal = document.getElementById('mystery-box-modal');
        if (mysteryBoxModal && mysteryBoxModal.classList.contains('active')) {
            return Array.from(mysteryBoxModal.querySelectorAll('.mbox-action-btn')).filter(b => b.offsetParent !== null);
        }
        return [];
    }

    _updateFocus() {
        this._clearFocusHighlight();

        if (this.focusContext === 'mining') {
            if (document.activeElement?.closest('#settings-tab, #mobile-settings-tab')) document.activeElement.blur();
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
            const item = items[this.focusIndex];
            item.classList.add('controller-focus');
            if (this.focusContext === 'settings' || this.focusContext === 'upgrades') {
                item.focus({ preventScroll: true });
                item.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            }
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

        if (this.focusContext === 'upgrades') {
            if (!el.disabled && el.getAttribute('aria-disabled') !== 'true') el.click();
            return;
        }

        // Try to find and click the buy button inside the focused card
        const buyBtn = el.querySelector('.shop-buy-btn, .buy-btn, .buy-button');
        if (buyBtn) {
            buyBtn.click();
            return;
        }

        // Fallback: click the element itself (some cards are fully clickable)
        el.click();
    }

    _buyUpgradeWithAnimation(section) {
        // Prefer coins when affordable; the diamond alternative is available
        // to controller users when the coin button is disabled.
        const buyBtn = section.querySelector('.upgrade-buy-btn[data-upgrade-helper]:not(:disabled)');
        if (!buyBtn) return;

        const helperType = buyBtn.getAttribute('data-upgrade-helper');
        if (!helperType || !window.shopManager) return;

        const success = window.shopManager.buyHelperUpgrade(helperType, buyBtn.dataset.upgradeCurrency || 'dogecoins', Number(buyBtn.dataset.upgradeLevel));
        if (!success) return;
        window.uiManager?.updateHelperUpgradeAffordability();

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
        // After clicking, the modal content may change (e.g. dogebag OPEN → reveal).
        // Refresh focus to pick up newly visible buttons.
        setTimeout(() => {
            this.focusIndex = 0;
            this._updateFocus();
        }, 100);
    }

    _visibleControls(root, selector = 'button, input, select, summary, [tabindex="0"]') {
        return Array.from(root?.querySelectorAll(selector) || []).filter(el =>
            !el.disabled && !el.closest('[hidden], .disabled, .dia-btns-hidden') && el.getClientRects().length
            && el.checkVisibility?.({ checkOpacity: true, checkVisibilityCSS: true }) !== false);
    }

    _changeSettingSelect(select, direction = 1) {
        const options = [...select.options].filter(option => !option.disabled && !option.hidden);
        if (!options.length) return;
        const current = options.indexOf(select.selectedOptions[0]);
        select.value = options[(current + Math.sign(direction) + options.length) % options.length].value;
        const key = select.id.replace(/^mobile-/, '');
        select.dispatchEvent(new Event('change', { bubbles: true }));
        // Layout can replace the active form. Follow the same setting into it.
        if (key === 'layout-mode') {
            if (this._isPhoneLayout()) {
                this.ui?.switchMobileTab('settings');
                if (this.ui && !this.ui.mobileMenuOpen) this.ui.toggleMobileMenu();
            } else window.switchMainTab?.('settings');
            setTimeout(() => {
                if (this.focusContext !== 'settings') return;
                const items = this._getFocusableItems();
                const index = items.findIndex(item => item.id.replace(/^mobile-/, '') === key);
                this.focusIndex = Math.max(0, index);
                this._updateFocus();
            }, 100);
        }
    }

    _toggleFocusedSetting() {
        const el = this._getFocusableItems()[this.focusIndex];
        if (!el) return;
        if (el.tagName === 'SELECT') this._changeSettingSelect(el);
        else el.click(); // Native input activation fires exactly one change event.
    }

    // ── Xbox-specific UI ─────────────────────────────────────────────────

    _hideXboxOnlyElements() {
        document.body.classList.add('xbox-browser');
        for (const id of ['sign-in-section', 'mobile-sign-in-section', 'user-info', 'mobile-user-info', 'supporter-settings-section', 'mobile-supporter-settings-section', 'supporter-stat-display', 'controller-disable-setting']) {
            const element = document.getElementById(id);
            if (element) element.style.display = 'none';
        }
        const mobileDisable = document.getElementById('mobile-disable-controller');
        if (mobileDisable) mobileDisable.closest('.setting-item').style.display = 'none';
        for (const [host, id] of [['sign-in-section', 'xbox-cloud-notice'], ['mobile-cloud-save-section', 'mobile-xbox-cloud-notice']]) {
            const element = document.getElementById(host);
            if (!element || document.getElementById(id)) continue;
            const notice = document.createElement('p');
            notice.id = id; notice.className = 'cloud-info';
            notice.textContent = 'Cloud save via Google is not available on Xbox. Use local save instead.';
            (host === 'sign-in-section' ? element.parentNode : element).appendChild(notice);
        }
    }

    // ── Disable Controller Setting ───────────────────────────────────────

    setDisabledByUser(disabled) {
        this._disabledByUser = disabled;
        for (const id of ['disable-controller', 'mobile-disable-controller']) { const box = document.getElementById(id); if (box) box.checked = disabled; }
        localStorage.setItem('controllerDisabled', disabled ? 'true' : 'false');
        if (disabled) {
            this._deactivateControllerMode();
        } else if (this.isActive) {
            this._activateControllerMode();
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
        
        // Mystery Box button prompt (Menu Button)
        this._addPrompt('mystery-box-btn', 'MENU', '', 'prompt-mysterybox');
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
        document.querySelectorAll('.coin-pile-x-prompt').forEach(el => el.remove());

        this._stopCoinPileObserver();
    }

    // ── Coin Pile X-Icon Observer ─────────────────────────────────────────

    _startCoinPileObserver() {
        this._stopCoinPileObserver();

        const rockContainer = document.getElementById('rock-container');
        if (!rockContainer) return;

        // Tag any existing coin piles and dogebags
        rockContainer.querySelectorAll('.coin-pile, .dogebag-drop, .diamond-stack').forEach(pile => {
            this._addCoinPileIcon(pile);
        });

        // Watch for new coin piles or dogebags being added
        this._coinPileObserver = new MutationObserver((mutations) => {
            if (!this.controllerMode || !this.showIndicators) return;
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1 && (node.classList.contains('coin-pile') || node.classList.contains('dogebag-drop') || node.classList.contains('diamond-stack'))) {
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
        for (const id of ['controller-indicators-enabled', 'mobile-controller-indicators-enabled']) { const box = document.getElementById(id); if (box) box.checked = enabled; }
        if (enabled && this.controllerMode) {
            this._createPrompts();
            if (this.vcActive && this.vcPrompt) {
                this.vcPrompt.style.display = 'flex';
                this.vcPrompt.style.setProperty('opacity', '1', 'important');
            }
        } else {
            this._removePrompts();
            if (this.vcPrompt) {
                this.vcPrompt.style.setProperty('opacity', '0', 'important');
                setTimeout(() => {
                    if (!this.showIndicators) this.vcPrompt.style.display = 'none';
                }, 400);
            }
        }
    }

    // ── In-game Dialog System ─────────────────────────────────────────────

    /**
     * Show an in-game dialog. Returns a Promise that resolves to true/false.
     * @param {string} message - Text body
     * @param {object} opts
     * @param {string} opts.title - Heading (default 'Confirm')
     * @param {boolean} opts.alertOnly - If true, shows only an OK button
     * @param {string} opts.confirmText - Custom confirm button label
     * @param {string} opts.cancelText  - Custom cancel button label
     */
    showDialog(message, opts = {}) {
        return new Promise(resolve => {
            const overlay = document.getElementById('controller-dialog');
            const titleEl = document.getElementById('controller-dialog-title');
            const msgEl = document.getElementById('controller-dialog-message');
            const confirmBtn = document.getElementById('controller-dialog-confirm');
            const cancelBtn = document.getElementById('controller-dialog-cancel');
            if (!overlay) { resolve(false); return; }

            titleEl.textContent = opts.title || 'Confirm';
            msgEl.textContent = message;
            confirmBtn.textContent = opts.confirmText || (opts.alertOnly ? 'OK' : 'Confirm');
            cancelBtn.textContent = opts.cancelText || 'Cancel';

            overlay.classList.toggle('alert-mode', !!opts.alertOnly);
            overlay.classList.add('active');

            this._dialogOpen = true;
            this._dialogResolve = resolve;
            this._dialogFocusIdx = 0;
            this._updateDialogFocus();

            // Mouse/touch fallback
            const onConfirm = () => { cleanup(); this._closeDialog(true); };
            const onCancel = () => { cleanup(); this._closeDialog(false); };
            confirmBtn.addEventListener('click', onConfirm);
            cancelBtn.addEventListener('click', onCancel);

            const cleanup = () => {
                confirmBtn.removeEventListener('click', onConfirm);
                cancelBtn.removeEventListener('click', onCancel);
            };
            this._dialogCleanup = cleanup;
        });
    }

    _closeDialog(result) {
        const overlay = document.getElementById('controller-dialog');
        if (overlay) {
            overlay.classList.remove('active', 'alert-mode');
        }
        this._dialogOpen = false;
        if (this._dialogCleanup) {
            this._dialogCleanup();
            this._dialogCleanup = null;
        }
        if (this._dialogResolve) {
            this._dialogResolve(result);
            this._dialogResolve = null;
        }
    }

    _updateDialogFocus() {
        const confirmBtn = document.getElementById('controller-dialog-confirm');
        const cancelBtn = document.getElementById('controller-dialog-cancel');
        if (!confirmBtn || !cancelBtn) return;

        confirmBtn.classList.toggle('controller-focus', this._dialogFocusIdx === 0);
        cancelBtn.classList.toggle('controller-focus', this._dialogFocusIdx === 1);
    }

    _handleDialogInput(justPressed, GP, axes) {
        // A = select focused button
        if (justPressed(GP.A)) {
            if (this._dialogFocusIdx === 0) {
                this._closeDialog(true);
            } else {
                this._closeDialog(false);
            }
            return;
        }

        // B = cancel / dismiss
        if (justPressed(GP.B)) {
            this._closeDialog(false);
            return;
        }

        // D-pad or analog stick left/right to switch between confirm and cancel
        const overlay = document.getElementById('controller-dialog');
        const isAlertMode = overlay && overlay.classList.contains('alert-mode');
        if (!isAlertMode) {
            let moveX = 0;
            // D-pad
            if (justPressed(GP.DPAD_LEFT)) moveX = -1;
            if (justPressed(GP.DPAD_RIGHT)) moveX = 1;
            // Analog stick (check if just crossed dead zone)
            if (axes && Math.abs(axes[AXIS.LEFT_X]) > this.DEAD_ZONE) {
                const prevAxisX = this.prevAxes[AXIS.LEFT_X] || 0;
                if (Math.abs(prevAxisX) <= this.DEAD_ZONE) {
                    moveX = axes[AXIS.LEFT_X] > 0 ? 1 : -1;
                }
            }
            if (moveX !== 0) {
                this._dialogFocusIdx = this._dialogFocusIdx === 0 ? 1 : 0;
                this._updateDialogFocus();
            }
        }
    }

    // ── Virtual Cursor & Drag-and-Drop ───────────────────────────────────

    _initVirtualCursor() {
        if (!this.vcElement) {
            this.vcElement = document.createElement('img');
            this.vcElement.id = 'controller-virtual-cursor';
            this.vcElement.src = window.GameCursor?.paths.default || 'assets/cursors/kenney/outline/pointer_b.png';
            this.vcElement.alt = 'Virtual Cursor';
            this.vcElement.style.position = 'fixed';
            this.vcElement.style.zIndex = '999999';
            this.vcElement.style.pointerEvents = 'none';
            this.vcElement.style.display = 'none';
            this.vcElement.style.setProperty('opacity', '1', 'important');
            this.vcElement.style.setProperty('transition', 'opacity 0.4s ease', 'important');
            this.vcElement.style.width = '32px';
            this.vcElement.style.height = '32px';
            
            // Tooltip container attached to the cursor
            this.vcPrompt = document.createElement('div');
            this.vcPrompt.id = 'vc-prompt-container';
            this.vcPrompt.className = 'controller-prompt'; // Without -bottom to prevent conflicting bottom: -28px rules
            this.vcPrompt.style.position = 'fixed';
            this.vcPrompt.style.zIndex = '999999';
            this.vcPrompt.style.pointerEvents = 'none';
            this.vcPrompt.style.display = 'none';
            this.vcPrompt.style.setProperty('opacity', '1', 'important');
            this.vcPrompt.style.setProperty('transition', 'opacity 0.4s ease', 'important');
            this.vcPrompt.style.whiteSpace = 'nowrap';
            // Use margin to reliably offset tooltip, bypassing any global transforms
            this.vcPrompt.style.marginLeft = '26px';
            this.vcPrompt.style.marginTop = '32px';
            
            document.body.appendChild(this.vcElement);
            document.body.appendChild(this.vcPrompt);
            
            this.vcX = window.innerWidth / 2;
            this.vcY = window.innerHeight / 2;
            this.vcFadeTimeout = null;
        }
    }

    _handleRightStick(rx, ry) {
        if (!this.vcElement) {
            this._initVirtualCursor();
            if (this.game) {
                this.vcX = this.game.mouseX || window.innerWidth / 2;
                this.vcY = this.game.mouseY || window.innerHeight / 2;
            }
        }
        
        let shouldShowCursor = false;
        if (this.game?._dogebagReveal) {
            shouldShowCursor = true;
            this._updateVirtualCursorPrompt('RT', 'Select');
        } else if (this.game && this.game.isPlacingHelpers) {
            shouldShowCursor = true;
            this._updateVirtualCursorPrompt('RT', 'Place');
        } else if (this.game && (this.game._helperDrag || (this.game.helpersOnCursor && this.game.helpersOnCursor.length > 0))) {
            shouldShowCursor = true;
            this._updateVirtualCursorPrompt('RT', 'Drop');
        } else {
            shouldShowCursor = true;
            this._updateVirtualCursorPrompt('RT', 'Move Helper');
        }
        
        this.vcActive = true;
        
        // Ensure opacity is ready for appearing
        if (this.vcFadeTimeout) {
            clearTimeout(this.vcFadeTimeout);
            this.vcFadeTimeout = null;
        }
        
        // Show the cursor synchronously
        this.vcElement.style.display = shouldShowCursor ? 'block' : 'none';
        
        // Only show prompt if indicators are enabled
        if (this.showIndicators) {
            this.vcPrompt.style.display = 'flex';
        } else {
            this.vcPrompt.style.display = 'none';
        }
        
        // Small delay before setting opacity so the browser registers the transition from display block
        requestAnimationFrame(() => {
            if (this.vcElement) this.vcElement.style.setProperty('opacity', '1', 'important');
            if (this.showIndicators && this.vcPrompt) {
                this.vcPrompt.style.setProperty('opacity', '1', 'important');
            }
        });
        
        const speed = 18;
        if (Math.abs(rx) > this.DEAD_ZONE) this.vcX += rx * speed;
        if (Math.abs(ry) > this.DEAD_ZONE) this.vcY += ry * speed;
        
        this.vcX = Math.max(0, Math.min(window.innerWidth, this.vcX));
        this.vcY = Math.max(0, Math.min(window.innerHeight, this.vcY));
        
        this.vcElement.style.left = this.vcX + 'px';
        this.vcElement.style.top = this.vcY + 'px';
        
        this.vcPrompt.style.left = this.vcX + 'px';
        this.vcPrompt.style.top = this.vcY + 'px';
        
        // Keep the game's mouse tracking up-to-date
        const moveEvt = new MouseEvent('mousemove', {
            clientX: this.vcX,
            clientY: this.vcY,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(moveEvt);
        window.GameCursor?.updateVirtualCursor(this, this.game);

        if (!this.vcToggledOn) {
            if (this.vcHideTimeout) clearTimeout(this.vcHideTimeout);
            this.vcHideTimeout = setTimeout(() => {
                this._hideVirtualCursor();
            }, 5000);
        }
    }
    
    _updateVirtualCursorPrompt(button, label) {
        if (this.vcPrompt) {
            const rtHtml = `${getControllerIcon(button)}<span class="prompt-label" style="text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000; margin-right: 12px;">${label}</span>`;
            const rsHtml = `${getControllerIcon('RSTICK')}<span class="prompt-label" style="text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;">Move Cursor</span>`;
            this.vcPrompt.innerHTML = rtHtml + rsHtml;
        }
    }
    
    _hideVirtualCursor() {
        this.vcActive = false;
        
        // Use setProperty with !important to cleanly override .controller-mode .controller-prompt
        if (this.vcElement) this.vcElement.style.setProperty('opacity', '0', 'important');
        if (this.vcPrompt) this.vcPrompt.style.setProperty('opacity', '0', 'important');
        
        this.vcFadeTimeout = setTimeout(() => {
            if (!this.vcActive) {
                if (this.vcElement) this.vcElement.style.display = 'none';
                if (this.vcPrompt) this.vcPrompt.style.display = 'none';
            }
        }, 500); // 0.5s transition
        
        if (this.game && !this.game.isPlacingHelpers && (this.game._helperDrag || (this.game.helpersOnCursor && this.game.helpersOnCursor.length > 0))) {
            this._simulateVirtualClick(false);
        }
    }
    
    _simulateVirtualClick(isDown) {
        window.GameCursor?.setPressed(isDown);
        if (!isDown) {
            document.dispatchEvent(new MouseEvent('mouseup', {clientX:this.vcX,clientY:this.vcY,bubbles:true,cancelable:true,view:window}));
            this._updateVirtualCursorPrompt('RT', 'Move Helper');
            return;
        }
        const target = document.elementFromPoint(this.vcX, this.vcY) || document.body;
        const options = {clientX:this.vcX,clientY:this.vcY,bubbles:true,cancelable:true,view:window};
        if (this.game?.isPlacingHelpers) {
            document.dispatchEvent(new MouseEvent('click', options));
            return;
        }
        target.dispatchEvent(new MouseEvent('mousedown', options));
        if (!this.game?._helperDrag) target.dispatchEvent(new MouseEvent('click', options));
        this._updateVirtualCursorPrompt('RT', 'Drop');
    }

    // ── Cleanup ──────────────────────────────────────────────────────────

    destroy() {
        if (this._animFrame) cancelAnimationFrame(this._animFrame);
        this._stopMiningRepeat();
        this._removePrompts();
        this._clearFocusHighlight();
        this._stopCoinPileObserver();
        if (this._dialogOpen) this._closeDialog(false);
        document.body.classList.remove('controller-mode', 'xbox-mode');
    }
}

// ── Global Dialog Helpers ─────────────────────────────────────────────────────
// These functions check if a controller is active and use the in-game dialog;
// otherwise they fall back to native browser confirm/alert.

function gameConfirm(message, opts = {}) {
    if (window.controllerManager && window.controllerManager.controllerMode) {
        return window.controllerManager.showDialog(message, opts);
    }
    // Fallback to native browser confirm (returns boolean wrapped in a Promise)
    return Promise.resolve(confirm(message));
}

function gameAlert(message, opts = {}) {
    if (window.controllerManager && window.controllerManager.controllerMode) {
        return window.controllerManager.showDialog(message, { ...opts, alertOnly: true });
    }
    alert(message);
    return Promise.resolve(true);
}

// Global instance placeholder
let controllerManager;
