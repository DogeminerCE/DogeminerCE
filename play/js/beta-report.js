// Shared first-Beta and Welcome Back reports. SaveManager owns acknowledgment.
(function () {
    'use strict';

    let activeReport = null;
    const fullNumber = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

    function el(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = String(text);
        return element;
    }

    function amount(value) {
        if (value === null || value === undefined) return '—';
        if (typeof value !== 'number') return String(value);
        if (!Number.isFinite(value)) return '—';
        if (Math.abs(value) < 1e6) return fullNumber.format(value);
        const units = ['', 'K', 'M', 'B', 'T', 'Q', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
        let tier = Math.floor(Math.log10(Math.abs(value)) / 3);
        if (tier >= units.length) return value.toExponential(2);
        let scaled = value / (10 ** (tier * 3));
        if (Number(Math.abs(scaled).toFixed(2)) >= 1000) {
            tier++;
            if (tier >= units.length) return value.toExponential(2);
            scaled = value / (10 ** (tier * 3));
        }
        return `${scaled.toFixed(2)}${units[tier]}`;
    }

    class BalanceReportView {
        constructor(report, options) {
            this.report = report;
            this.options = options;
            this.previousFocus = document.activeElement;
            this.previousOverflow = document.body.style.overflow;
            this.inertElements = [...document.body.children].map(element => ({ element, inert: element.inert }));
            this.overlay = el('div', 'beta-balance-overlay');
            this.overlay.id = options.kind === 'offline' ? 'offline-earnings-report' : 'beta-balance-report';
            this.panel = el('section', 'beta-balance-panel');
            this.panel.setAttribute('role', 'dialog');
            this.panel.setAttribute('aria-modal', 'true');
            this.panel.setAttribute('aria-labelledby', `${this.overlay.id}-title`);
            this.overlay.appendChild(this.panel);
            this.build();
            for (const { element } of this.inertElements) element.inert = true;
            document.body.style.overflow = 'hidden';
            // Keep the backdrop outside scaling; the shared presenter anchors the card to the panels.
            document.documentElement.appendChild(this.overlay);
            this.layout = () => {
                const viewport = window.visualViewport;
                this.overlay.style.left = `${viewport?.offsetLeft || 0}px`;
                this.overlay.style.top = `${viewport?.offsetTop || 0}px`;
                this.overlay.style.width = `${viewport?.width || window.innerWidth}px`;
                this.overlay.style.height = `${viewport?.height || window.innerHeight}px`;
                this.overlay.style.setProperty('--beta-viewport-height', `${viewport?.height || window.innerHeight}px`);
                window.PopupPresentation?.refresh();
            };
            this.layout();
            window.PopupPresentation?.mount(this.overlay);
            window.addEventListener('resize', this.layout);
            window.visualViewport?.addEventListener('resize', this.layout);
            window.visualViewport?.addEventListener('scroll', this.layout);
            this.keyHandler = event => this.handleKey(event);
            this.focusHandler = event => {
                if (!this.overlay.contains(event.target)) this.title.focus({ preventScroll: true });
            };
            document.addEventListener('keydown', this.keyHandler, true);
            document.addEventListener('focusin', this.focusHandler, true);
            this.title.focus({ preventScroll: true });
        }

        build() {
            this.overlay.dataset.planet = this.options.planet || this.report.planet || document.body.dataset.planet || 'earth';
            const header = el('header', 'beta-balance-header');
            const offline = this.options.kind === 'offline';
            this.overlay.dataset.reportKind = offline ? 'offline' : 'beta';
            this.actionLabel = offline ? 'CLOSE' : 'CONTINUE MINING';
            this.title = el('h2', 'beta-balance-title', offline ? 'WELCOME BACK CAPTAIN' : 'Welcome to Beta!');
            this.title.id = `${this.overlay.id}-title`;
            this.title.tabIndex = -1;
            header.appendChild(this.title);
            if (!offline) header.appendChild(el('p', 'beta-balance-eyebrow', 'YOUR BALANCE UPDATE'));
            this.panel.appendChild(header);
            if (offline) {
                const emblem = el('img', 'offline-earnings-emblem');
                emblem.src = 'assets/general/icon_225x225.webp';
                emblem.alt = '';
                emblem.setAttribute('aria-hidden', 'true');
                this.panel.appendChild(emblem);
            }

            const body = el('div', 'beta-balance-body');
            if (offline) {
                body.classList.add('offline-earnings-body');
                const message = el('p', 'offline-earnings-copy');
                const amountText = el('strong', 'offline-earnings-amount', amount(this.report.amount));
                amountText.title = fullNumber.format(this.report.amount);
                const lineBreak = el('br', 'offline-earnings-linebreak');
                message.append(document.createTextNode('While you were gone, your helpers mined'), lineBreak,
                    document.createTextNode(' a total of '), amountText, document.createTextNode(' '),
                    el('strong', 'offline-earnings-currency', 'ĐOGECOINS'), document.createTextNode('.'));
                const rate = el('p', 'offline-earnings-copy');
                rate.append(document.createTextNode('Helpers mine at '),
                    el('strong', 'offline-earnings-rule', '30% efficiency'), document.createTextNode(' up to '),
                    el('strong', 'offline-earnings-rule', '24 hours'), document.createTextNode(' after you leave.'));
                body.append(message, rate);
            } else {
                const before = this.report.totalsBefore || {};
                const after = this.report.totalsAfter || {};
                const definitions = [
                    ['dpc', 'Per click'], ['dps', 'Per second'], ['luck', 'Luck'], ['wow', 'Wow'],
                    ['lootFind', 'Loot Find', 'percent'], ['critChance', 'Critical chance', 'fraction'],
                    ['mysteryBonus', 'Mystery Bonus'], ['flatHelperDps', 'Flat DPS'],
                    ['helperDpsMultiplier', 'Helper DPS bonus', 'multiplier'],
                    ['totalDpsMultiplier', 'Total DPS bonus', 'multiplier'],
                    ['rocketCostReduction', 'Rocket discount', 'fraction']
                ];
                const grid = el('div', 'beta-balance-stat-grid');
                grid.setAttribute('aria-label', 'Changes to your active stats');
                const transform = (value, mode) => typeof value !== 'number' ? null
                    : mode === 'fraction' ? value * 100 : mode === 'multiplier' ? (value - 1) * 100 : value;
                for (const [key, label, mode] of definitions) {
                    const oldValue = transform(before[key], mode);
                    const newValue = transform(after[key], mode);
                    if (oldValue === newValue || (oldValue === null && (newValue === null || newValue === 0))) continue;
                    const direction = newValue === null || (oldValue !== null && newValue < oldValue) ? 'down' : 'up';
                    const row = el('div', `beta-balance-stat beta-balance-stat-${direction}`);
                    const suffix = mode ? '%' : '';
                    const value = number => number === null ? '—' : `${amount(number)}${suffix}`;
                    row.append(el('span', 'beta-balance-stat-name', label),
                        el('span', 'beta-balance-stat-before', value(oldValue)),
                        el('span', 'beta-balance-stat-direction', direction === 'up' ? '↑' : '↓'),
                        el('strong', 'beta-balance-stat-after', value(newValue)));
                    row.setAttribute('aria-label', `${label}: ${value(oldValue)} to ${value(newValue)}, ${direction === 'up' ? 'increased' : 'decreased'}`);
                    grid.appendChild(row);
                }
                if (!grid.children.length) grid.appendChild(el('p', 'beta-balance-unchanged', 'Your active stats stayed the same.'));
                body.appendChild(grid);
            }
            this.panel.appendChild(body);
            const footer = el('footer', 'beta-balance-footer');
            this.error = el('p', 'beta-balance-error');
            this.error.setAttribute('role', 'alert');
            this.error.hidden = true;
            this.continueButton = el('button', 'beta-balance-continue', this.actionLabel);
            this.continueButton.type = 'button';
            this.continueButton.addEventListener('click', () => this.acknowledge());
            footer.append(this.error, this.continueButton);
            this.panel.appendChild(footer);
            this.closeButton = el('button', 'beta-balance-close');
            // The web font in CE omits DM2's private-use close glyph. Draw the
            // same crisp red/white cross without relying on a missing glyph.
            this.closeButton.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M12 12 36 36M36 12 12 36" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round"/><path d="M12 12 36 36M36 12 12 36" fill="none" stroke="#e11a1a" stroke-width="8" stroke-linecap="round"/></svg>';
            this.closeButton.type = 'button';
            this.closeButton.setAttribute('aria-label', 'Close report');
            this.closeButton.addEventListener('click', () => this.acknowledge());
            this.panel.appendChild(this.closeButton);
        }

        focusables() {
            return [...this.panel.querySelectorAll('button, input, select, summary, [tabindex="0"]')]
                .filter(element => !element.disabled && !element.closest('[hidden]') && element.getClientRects().length > 0);
        }

        handleKey(event) {
            // Keep the game's hotkeys behind this dialog; Escape never acknowledges.
            event.stopImmediatePropagation();
            if (event.key === 'Escape') {
                event.preventDefault();
                return;
            }
            if (event.key !== 'Tab') return;
            const focusables = this.focusables();
            const index = focusables.indexOf(document.activeElement);
            if (!focusables.length) {
                event.preventDefault();
                this.title.focus();
            } else if (event.shiftKey && index <= 0) {
                event.preventDefault();
                focusables[focusables.length - 1].focus();
            } else if (!event.shiftKey && (index === -1 || index === focusables.length - 1)) {
                event.preventDefault();
                focusables[0].focus();
            }
        }

        async acknowledge() {
            if (this.saving) return;
            const source = this.panel.querySelector('.offline-earnings-amount') || this.continueButton;
            const rect = source.getBoundingClientRect();
            const origin = { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
            this.saving = true;
            this.error.hidden = true;
            this.continueButton.disabled = true;
            this.closeButton.disabled = true;
            this.continueButton.textContent = 'SAVING…';
            try {
                if (typeof this.options.onAcknowledge !== 'function') throw new Error('No acknowledgment handler');
                const saved = await this.options.onAcknowledge(this.report);
                if (this.closed) return;
                if (saved !== true) throw new Error('Acknowledgment was not saved');
                this.close({ animate: true });
                window.audioManager?.playSound('swipe_fast_low');
                this.options.onAcknowledged?.(this.report, origin);
            } catch (error) {
                if (this.closed) return;
                console.error('Beta balance acknowledgment failed:', error);
                this.error.textContent = 'Your acknowledgment could not be saved. Please try again.';
                this.error.hidden = false;
                this.continueButton.disabled = false;
                this.closeButton.disabled = false;
                this.continueButton.textContent = this.actionLabel;
                this.saving = false;
                this.continueButton.focus({ preventScroll: true });
            }
        }

        close({ animate = false } = {}) {
            if (this.closed) return;
            this.closed = true;
            document.removeEventListener('keydown', this.keyHandler, true);
            document.removeEventListener('focusin', this.focusHandler, true);
            window.removeEventListener('resize', this.layout);
            window.visualViewport?.removeEventListener('resize', this.layout);
            window.visualViewport?.removeEventListener('scroll', this.layout);
            if (animate && window.PopupPresentation) window.PopupPresentation.close(this.overlay);
            else if (window.PopupPresentation) window.PopupPresentation.remove(this.overlay);
            else this.overlay.remove();
            for (const { element, inert } of this.inertElements) if (element.isConnected) element.inert = inert;
            document.body.style.overflow = this.previousOverflow;
            if (activeReport === this) activeReport = null;
            if (this.previousFocus?.isConnected && typeof this.previousFocus.focus === 'function') this.previousFocus.focus({ preventScroll: true });
        }
    }

    function reportAPI(kind) { return {
        show(report, options = {}) {
            if (!report || report.acknowledged) {
                if (activeReport?.options.kind === kind) activeReport.close();
                return false;
            }
            if (activeReport?.report === report && activeReport.options.kind === kind) return activeReport.overlay;
            activeReport?.close();
            window.PopupPresentation?.finishClosing();
            activeReport = new BalanceReportView(report, { ...options, kind });
            return activeReport.overlay;
        },
        close() { if (activeReport?.options.kind === kind) activeReport.close(); },
        isOpen() { return !!activeReport && activeReport.options.kind === kind; }
    }; }
    window.BetaBalanceReport = reportAPI('beta');
    window.WelcomeBackReport = reportAPI('offline');
})();
