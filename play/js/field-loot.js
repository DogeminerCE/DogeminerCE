// Loose field loot. Item ownership and wallet commits precede visual flights.
(function () {
    'use strict';
    const proto = DogeMinerGame.prototype;
    const planets = ['earth', 'moon', 'mars', 'jupiter', 'titan'];
    function normalizeDiamonds(saved) {
        return Object.fromEntries(planets.map(planet => [planet, Number.isFinite(saved?.[planet])
            ? Math.max(0, Math.min(999, Math.floor(saved[planet]))) : 0]));
    }
    const coinWarningDelay = rng => 6001 + Math.floor(666 * rng());
    // JT/KT use centered sprites; scale their offsets with the 38px texture.
    const diamondScale = 23 / 38;
    const diamondCopies = [{ x: 19, y: -11, angle: .21, tint: 180 / 255, from: 3 },
        { x: -17, y: -6, angle: -.17, tint: 214 / 255, from: 2 }];
    function dispose(node) {
        clearTimeout(node._coinTimer); node._coinWarning?.cancel(); node._lootHover?.detach();
        node._coinSpawn?.cancel(); node._coinBob?.cancel();
        node.getAnimations?.({ subtree: true }).forEach(animation => animation.cancel()); node.remove();
    }
    proto.scheduleCoinExpiry = function (pile) {
        pile._fieldPlanet = this.currentLevel; pile._fieldEpoch = this._currencyFlightEpoch || 0;
        pile._coinTimer = setTimeout(() => {
            if (!pile.isConnected || pile.dataset.collected) return;
            pile.dataset.expiring = 'true';
            const frames = matchMedia('(prefers-reduced-motion:reduce)').matches ? [{ opacity: 1 }, { opacity: 0 }]
                : Array.from({ length: 19 }, (_, index) => ({ offset: index / 18, opacity: index === 0 || index % 2 ? 1 : 0 }));
            pile._coinWarning = pile.animate(frames, { duration: 3000, fill: 'forwards', easing: 'linear' });
            pile._coinTimer = setTimeout(() => dispose(pile), 3030);
        }, coinWarningDelay(Math.random));
    };
    proto.resetFieldLootPresentation = function () {
        document.querySelectorAll('.coin-pile,.diamond-loot,.diamond-field-flight').forEach(dispose);
        this._fieldLootLocation = null;
    };
    proto.syncFieldLoot = function () {
        const location = `${this.currentLevel}:${this._currencyFlightEpoch || 0}`;
        if (this._fieldLootLocation === location) return;
        this.resetFieldLootPresentation(); this._fieldLootLocation = location;
        const count = this.diamondStacks?.[this.currentLevel] || 0;
        if (count) this.renderDiamondStack(count);
    };
    proto.restoreDiamondStacks = function (saved) {
        this.diamondStacks = normalizeDiamonds(saved); this._fieldLootLocation = null;
    };
    proto.getDiamondStacksForSave = function () { return normalizeDiamonds(this.diamondStacks); };
    proto.spawnFieldCoin = function (pile) {
        const p = this.getDogebagRestPosition('coin'); pile._rest = p;
        pile.style.animation = 'none'; pile.style.left = p.x + 'px'; pile.style.top = p.y + 'px';
        pile.style.setProperty('--pile-end-x', '0px'); pile.style.setProperty('--pile-end-y', '0px');
        const landed = () => {
            if (!pile.isConnected || pile.dataset.collected) return;
            pile._fieldLanded = true;
            pile._helperGrabAt = (this._helperLootClock || 0) + 1800;
            if (!matchMedia('(prefers-reduced-motion:reduce)').matches) {
                const frames = Array.from({ length: 61 }, (_, i) => ({ translate: `0px ${2.1 * (1 - Math.cos(i / 60 * 2 * Math.PI)) / 2}px` }));
                pile._coinBob = pile.animate(frames, { duration: 4400, iterations: Infinity, easing: 'linear' });
            }
        };
        pile._coinSpawn = window.LootMotion.sample(pile, matchMedia('(prefers-reduced-motion:reduce)').matches ? 150 : 800, t => {
            const ease = t === 1 ? 1 : 1 - 2 ** (-10 * t);
            return { transform: `translate(calc(-50% + ${(p.fromX - p.x) * (1 - ease)}px),calc(-50% + ${(p.fromY - p.y) * (1 - ease)}px))`, opacity: Math.min(1, t * 4) };
        }, landed);
    };
    proto.updateDiamondStack = function (node, count, animate = false) {
        node.dataset.count = String(count);
        node.setAttribute('aria-label', `${count} unclaimed ${count === 1 ? 'Dogediamond' : 'Dogediamonds'}`);
        node.querySelectorAll('.diamond-pile-copy').forEach((image, index) => { image.hidden = count < 3 - index; });
        const badge = node.querySelector('.diamond-stack-count'); badge.hidden = count < 2; badge.textContent = 'x' + count;
        if (animate) badge.animate([{ scale: 1.5 }, { scale: 1 }], { duration: 350, easing: 'ease-out' });
    };
    proto.renderDiamondStack = function (count, spawning = false) {
        const field = document.getElementById('rock-container'); if (!field) return;
        const node = document.createElement('div'); node.className = 'diamond-loot diamond-stack';
        node.style.setProperty('--pile-end-x', '0px'); node.style.setProperty('--pile-end-y', '0px');
        node._fieldPlanet = this.currentLevel; node._fieldEpoch = this._currencyFlightEpoch || 0;
        node.setAttribute('role', 'button'); node.tabIndex = 0;
        const body = document.createElement('div'); body.className = 'diamond-pile-body';
        for (const { x, y, angle, tint } of [...diamondCopies, { x: 0, y: 0, angle: 0, tint: 1 }]) {
            const image = document.createElement('img'); image.src = 'assets/general/icons/diamond_loot.webp'; image.alt = ''; image.draggable = false;
            image.className = tint === 1 ? 'diamond-pile-main' : 'diamond-pile-copy';
            if (tint !== 1) { image.style.transform = `translate(${x * diamondScale}px,${y * diamondScale}px) rotate(${angle}rad)`; image.style.filter = `brightness(${tint})`; }
            body.append(image);
        }
        const badge = document.createElement('span'); badge.className = 'diamond-stack-count'; node.append(body, badge);
        const collect = event => { event.stopPropagation(); this.collectDiamond(node); };
        node.addEventListener('click', collect);
        node.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); collect(event); } });
        field.append(node); this.positionDiamondStack(node); this.updateDiamondStack(node, count);
        if (innerWidth > 768) node._lootHover = window.LootMotion?.hover(node, body);
        if (spawning) this.animateDiamondArrival(node, node);
        return node;
    };
    proto.positionDiamondStack = function (node) {
        const position = this.getDogebagRestPosition('diamond'); node._rest = position;
        node.style.left = position.x + 'px'; node.style.top = position.y + 'px'; return position;
    };
    proto.animateDiamondArrival = function (stack, node) {
        const p = stack._rest, first = stack === node;
        node.style.left = p.x + 'px'; node.style.top = p.y + 'px';
        window.LootMotion.sample(node, 800, t => {
            const ease = t === 1 ? 1 : 1 - 2 ** (-10 * t);
            return { transform: `translate(calc(-50% + ${(p.fromX-p.x)*(1-ease)}px),calc(-50% + ${(p.fromY-p.y)*(1-ease)}px))`, opacity: Math.min(1, t * 4) };
        }, () => {
            if (!first) node.remove();
            if (stack.isConnected && !stack.dataset.collected) this.updateDiamondStack(stack, this.diamondStacks?.[stack._fieldPlanet] || 0, true);
        });
    };
    proto.createDiamondLoot = function () {
        this.syncFieldLoot(); this.diamondStacks ||= normalizeDiamonds();
        const count = this.diamondStacks[this.currentLevel] || 0;
        // DM2 sends excess drops directly to the wallet once its 999 stack is full.
        if (count >= 999) return this.claimFieldDiamonds(1);
        this.diamondStacks = { ...this.diamondStacks, [this.currentLevel]: count + 1 };
        window.saveManager?.commitFieldLoot();
        const stack = document.querySelector('.diamond-stack:not([data-collected])');
        if (!stack) this.renderDiamondStack(count + 1, true);
        else {
            const image = document.createElement('img'); image.src = 'assets/general/icons/diamond_loot.webp'; image.alt = '';
            const flight = document.createElement('div'); flight.className = 'diamond-loot diamond-field-flight'; flight.append(image);
            document.getElementById('rock-container').append(flight); this.animateDiamondArrival(stack, flight);
        }
        return true;
    };
    proto.claimFieldDiamonds = function (amount, node = null) {
        if (!(amount > 0) || !Number.isFinite(this.dogediamonds + amount) || !Number.isFinite(this.dogediamondsEverObtained + amount)) return false;
        const before = { dogediamonds: this.dogediamonds, dogediamondsEverObtained: this.dogediamondsEverObtained, diamondStacks: this.diamondStacks };
        if (node) this.diamondStacks = { ...this.diamondStacks, [this.currentLevel]: Math.max(0,(this.diamondStacks[this.currentLevel] || 0)-amount) };
        this.dogediamonds += amount; this.dogediamondsEverObtained += amount;
        if (!window.saveManager?.commitFieldLoot()) { Object.assign(this, before); return false; }
        const consumed = node && !this.diamondStacks[this.currentLevel];
        if (consumed) { node.dataset.collected = 'true'; node.style.pointerEvents = 'none'; node._lootHover?.detach(); }
        const rect = node?.getBoundingClientRect();
        this.createFloatingDiamond(amount, rect ? { clientX: rect.left + rect.width/2, clientY: rect.top + rect.height/2 } : null);
        this.playSound('longSparkle'); this.updateUI();
        if (node && !consumed) this.updateDiamondStack(node,this.diamondStacks[this.currentLevel]);
        if (consumed) { node.style.animation = 'coinPileCollect .3s ease-out forwards'; setTimeout(() => dispose(node), 300); }
        if (before.dogediamondsEverObtained === 0) this.showDiamondIntro();
        return true;
    };
    proto.collectDiamond = function (node) {
        if (!node?.isConnected || node.dataset.collected || node._fieldPlanet !== this.currentLevel
            || node._fieldEpoch !== (this._currencyFlightEpoch || 0)) return false;
        return this.claimFieldDiamonds(this.diamondStacks?.[this.currentLevel] || 0, node);
    };
    proto.collectLooseCoinPiles = function (piles = document.querySelectorAll('.coin-pile')) {
        const eligible = [...piles].filter(pile => pile.parentNode && !pile.dataset.collected
            && (!pile._fieldPlanet || pile._fieldPlanet === this.currentLevel)
            && (pile._fieldEpoch === undefined || pile._fieldEpoch === (this._currencyFlightEpoch || 0)));
        const claims = eligible.map(pile => ({ pile, amount: Number(pile.dataset.amount) }))
            .filter(claim => Number.isFinite(claim.amount) && claim.amount > 0);
        if (!claims.length) return false;
        const before = { dogecoins: this.dogecoins, totalMined: this.totalMined };
        const amount = claims.reduce((sum, claim) => sum + claim.amount, 0);
        if (!Number.isFinite(before.dogecoins + amount) || !Number.isFinite(before.totalMined + amount)) return false;
        this.dogecoins += amount; this.totalMined += amount;
        if (!window.saveManager?.commitFieldLoot()) { Object.assign(this, before); return false; }
        for (const { pile, amount } of claims) {
            const rect = pile.getBoundingClientRect();
            pile.dataset.collected = 'true'; pile.style.pointerEvents = 'none';
            clearTimeout(pile._coinTimer); pile._coinWarning?.cancel(); pile._lootHover?.detach();
            pile._coinSpawn?.cancel(); pile._coinBob?.cancel();
            // A click during expulsion should collect at its visible position.
            const field = pile.parentElement;
            if (field?.getBoundingClientRect) {
                const area = field.getBoundingClientRect(), ratio = area.width / (field.offsetWidth || area.width) || 1;
                pile.style.left = (rect.left + rect.width / 2 - area.left) / ratio + 'px';
                pile.style.top = (rect.top + rect.height / 2 - area.top) / ratio + 'px';
            }
            this.createFloatingCoin(amount, { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 }, false);
            pile.style.animation = 'coinPileCollect .3s ease-out forwards';
            setTimeout(() => pile.remove(), 300);
            this.playSound(pile.classList.contains('pile-small') ? 'coinsSmall' : 'getCoins');
        }
        this.updateUI(); return true;
    };
    proto.collectCoinPile = function (pile) { return this.collectLooseCoinPiles([pile]); };
    const openBag = proto.openDogebagModal;
    proto.openDogebagModal = function (bag) {
        const before = this._dogebagReveal;
        openBag.call(this, bag);
        if (this._dogebagReveal && this._dogebagReveal !== before) this.collectLooseCoinPiles();
    };
    window.addEventListener?.('resize', () => {
        const node = document.querySelector('.diamond-stack:not([data-collected])');
        if (node) window.game?.positionDiamondStack(node);
        document.querySelectorAll('.coin-pile:not([data-collected])').forEach(pile => {
            if (!pile._fieldLanded || !window.game) return;
            const p = window.game.getDogebagRestPosition('coin', pile._rest?.polar); pile._rest = p;
            pile.style.left = p.x + 'px'; pile.style.top = p.y + 'px';
        });
    });
    window.DogeMinerFieldLoot = Object.freeze({ coinWarningDelay, coinRemovalDelay: 3030, normalizeDiamonds, diamondCopies, diamondScale });
})();
