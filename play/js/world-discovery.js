// Saved planetary discovery and collectible clues. Earned equipment/currency is
// outside this ledger; pending clues and stories commit together before display.
(function () {
    'use strict';
    const PLANETS = ['earth', 'moon', 'mars', 'jupiter', 'titan'];
    const timelineOf = value => Math.max(1, Math.floor(Number.isFinite(value) ? value : 1));
    const count = (save, category, type) => (save[category] || []).filter(helper => helper?.type === type).length;
    const ARTIFACTS = { blueprint: {delay:500,story:'foundbp',label:'Blueprints',radius:90,image:'../assets/SpritesheetsSrc/story/story/blueprints.webp',
        eligible:game=>game.currentLevel==='titan'&&(count(game,'titanHelpers','roboShibe')>0||count(game,'titanHelpers','heavyDogeWalker')>0)}, moon: { delay: 800, story: 'moon2', label: 'Treasure map',
        eligible: game => count(game, 'moonHelpers', 'moonShibe') > 5 && count(game, 'moonHelpers', 'dogeCar') > 2 },
        mars: { delay: 1500, story: 'marsdraw', label: 'Crude drawing',
            eligible: game => count(game, 'marsHelpers', 'curiosiDoge') > 2 || count(game, 'marsHelpers', 'djKittenz') > 1 } };
    const ROUTES = { mars: { delay: 1500, marker: 'marsunlock', story: 'moon3', helper: 'marsRocket',
        eligible: game => count(game, 'moonHelpers', 'landerShibe') >= 1 },
        jupiter: { firstDelay: 1250, delay: 1550, marker: 'jupiterun', firstStory: 'mars2', story: 'mars3',
            helper: 'jupiterRocket', sound: 'select1', eligible: game => count(game, 'marsHelpers', 'spaceBass') > 0 } };
    const EVENTS = { rig: { delay: 1250, marker: 'rigsunlock', story: 'timemachine', helper: 'timeMachineRig', sound: 'select1',
        eligible: game => count(game, 'marsHelpers', 'partyShibe') >= 25 || count(game, 'marsHelpers', 'spaceBass') >= 2
            || [game.currentLevel, ...(game.worldDiscovery?.visited || [])].some(planet => PLANETS.indexOf(planet) > 2) },
        titanSensor: { delay: 500, marker: 'findtit', story: 'titan1', known: 'titan', sound: 'select1', replayWhenReady: true,
            eligible: game => (game.helperUpgradeLevels?.cloudBase || 0) >= 1 },
        titanRoute: { delay: 500, marker: 'unltitan', story: 'titan2', known: 'titan', unlock: 'titan',
            immediateStory: true, startSound: 'select1', replayWhenReady: true,
            eligible: game => count(game, 'jupiterHelpers', 'dogeStar') > 0 } };
    const contactEligible = (game, now) => count(game, 'helpers', 'timeMachineRig') > 0
        && Number.isFinite(game._storyLocationStartedAt) && game._storyLocationStartedAt + 11000 < now
        && !game.worldDiscovery?.events?.contacted;
    function earnedAccess(game, planet) {
        const owns = (category, type) => (game[category] || []).some(helper => helper?.type === type);
        return planet === 'earth' || (planet === 'moon' && owns('helpers', 'spaceRocket'))
            || (planet === 'mars' && owns('moonHelpers', 'marsRocket'))
            || (planet === 'jupiter' && owns('marsHelpers', 'jupiterRocket'))
            || (planet === 'titan' && owns('jupiterHelpers', 'dogeStar') && game.worldDiscovery?.events?.titanRoute?.stage === 'ready');
    }
    const route = () => ({ stage: 'unseen', startedAt: 0, firstQueued: false });
    const artifact = () => ({ stage: 'unseen', readyAt: 0, planet: 'earth', x: .5, y: .5 });
    function fresh(timeline = 1) {
        return { version: 1, timeline: timelineOf(timeline), known: ['earth', 'moon'], unlocked: ['earth'], visited: ['earth'],
            routes: { mars: route(), jupiter: route() }, artifacts: { moon: artifact(), mars: artifact(), blueprint: artifact() },
            events: { rig: route(), titanSensor: route(), titanRoute: route(), contacted: false } };
    }
    function legacy(save) {
        const state = fresh(save.timelineNumber), current = PLANETS.includes(save.currentLevel) ? save.currentLevel : 'earth';
        const owned = planet => (save[planet === 'earth' ? 'helpers' : `${planet}Helpers`] || []).length > 0;
        const has = (category, type) => count(save, category, type) > 0;
        const access = { earth: true, moon: has('helpers', 'spaceRocket') || owned('moon'),
            mars: has('moonHelpers', 'marsRocket') || owned('mars'),
            jupiter: has('marsHelpers', 'jupiterRocket') || owned('jupiter'),
            titan: (has('jupiterHelpers', 'dogeStar') && (save.helperUpgradeLevels?.cloudBase || 0) >= 1) || owned('titan') };
        for (const planet of PLANETS) {
            if (access[planet] || planet === current) state.unlocked.push(planet);
            if (owned(planet) || planet === current) state.visited.push(planet);
        }
        state.unlocked = [...new Set(state.unlocked)]; state.visited = [...new Set(state.visited)];
        state.known = [...new Set([...state.known, ...state.unlocked])];
        for (const planet of ['mars', 'jupiter']) {
            const seen = save.storyProgress?.seen || [];
            if (state.unlocked.includes(planet) || seen.includes(planet === 'mars' ? 'marsunlock' : 'jupiterun')) {
                state.routes[planet].stage = 'ready';
                if (!state.known.includes(planet)) state.known.push(planet);
            }
        }
        // Keep rigs already owned, or already purchasable under CE's previous
        // Jupiter rule. New timelines use the source invention criteria below.
        if (has('helpers', 'timeMachineRig') || access.jupiter || access.titan || ['jupiter', 'titan'].includes(current)
            || save.storyProgress?.seen?.includes('rigsunlock')) state.events.rig.stage = 'ready';
        state.events.contacted = Boolean(save.storyProgress?.seen?.includes('dia') || (has('helpers', 'timeMachineRig')
            && (timelineOf(save.timelineNumber) > 1 || save.diaMissionSeenOnce || save.hasReachedJupiterEver
                || access.jupiter || access.titan || ['jupiter', 'titan'].includes(current))));
        if (state.unlocked.includes('titan') || save.storyProgress?.seen?.some(id => ['findtit', 'titan1'].includes(id))) {
            state.events.titanSensor.stage = 'ready';
            if (!state.known.includes('titan')) state.known.push('titan');
        }
        if (state.unlocked.includes('titan') || save.storyProgress?.seen?.some(id => ['unltitan', 'titan2'].includes(id))) {
            state.events.titanRoute.stage = 'ready';
            if (!state.known.includes('titan')) state.known.push('titan');
            if (!state.unlocked.includes('titan')) state.unlocked.push('titan');
        }
        if(window.DogeMinerLateProgression?.normalize(save.lateProgression,save).reallyhardium||save.storyProgress?.seen?.some(id=>['foundbp','figurebp'].includes(id)))
            state.artifacts.blueprint={...artifact(),stage:'collected',planet:'titan'};
        return state;
    }
    function planetList(value, label) {
        if (!Array.isArray(value) || value.length > 5 || value.some(planet => !PLANETS.includes(planet))) throw new Error(`Invalid ${label} locations.`);
        return [...new Set(value)];
    }
    function normalize(raw, save = {}) {
        if (raw == null) return legacy(save);
        const timeline = timelineOf(save.timelineNumber);
        if (raw.version !== 1 || raw.timeline !== timeline) throw new Error('This world-discovery version or timeline is not supported.');
        if (raw.events != null && (typeof raw.events !== 'object' || Array.isArray(raw.events))) throw new Error('Invalid progression events.');
        const result = fresh(timeline);
        result.visited = planetList(raw.visited, 'visited'); result.unlocked = planetList(raw.unlocked, 'unlocked'); result.known = planetList(raw.known, 'known');
        const current = PLANETS.includes(save.currentLevel) ? save.currentLevel : 'earth';
        result.visited = [...new Set(['earth', ...result.visited, current])];
        result.unlocked = [...new Set(['earth', ...result.unlocked, ...result.visited])];
        result.known = [...new Set(['earth', 'moon', ...result.known, ...result.unlocked])];
        for (const planet of ['mars', 'jupiter']) {
            const item = raw.routes?.[planet] || route();
            if (!['unseen', 'waiting', 'ready'].includes(item.stage) || !Number.isFinite(item.startedAt) || item.startedAt < 0
                || typeof item.firstQueued !== 'boolean') throw new Error('Invalid route discovery.');
            result.routes[planet] = { stage: item.stage, startedAt: Math.min(item.startedAt, Date.now()), firstQueued: item.firstQueued };
        }
        let inheritedEvents;
        const inheritEvents = () => inheritedEvents ||= legacy(save).events;
        for (const key of Object.keys(EVENTS)) {
            // Optional fields extend existing v1 saves without resetting their
            // known planets, clues or waiting discoveries.
            let item = raw.events?.[key];
            if (!item) {
                item = { ...inheritEvents()[key] };
                if (key === 'rig' && result.unlocked.some(planet => ['jupiter', 'titan'].includes(planet))) item.stage = 'ready';
                if (['titanSensor', 'titanRoute'].includes(key) && result.unlocked.includes('titan')) item.stage = 'ready';
            }
            if (!['unseen', 'waiting', 'ready'].includes(item.stage) || !Number.isFinite(item.startedAt) || item.startedAt < 0
                || typeof item.firstQueued !== 'boolean') throw new Error('Invalid progression event.');
            result.events[key] = { stage: item.stage, startedAt: Math.min(item.startedAt, Date.now()), firstQueued: item.firstQueued };
            if (item.stage === 'ready' && EVENTS[key].known && !result.known.includes(EVENTS[key].known)) result.known.push(EVENTS[key].known);
            if (item.stage === 'ready' && EVENTS[key].unlock && !result.unlocked.includes(EVENTS[key].unlock)) result.unlocked.push(EVENTS[key].unlock);
        }
        const contacted = raw.events && Object.hasOwn(raw.events, 'contacted') ? raw.events.contacted : inheritEvents().contacted;
        if (typeof contacted !== 'boolean') throw new Error('Invalid D.I.A. contact state.');
        result.events.contacted = contacted;
        for (const planet of Object.keys(ARTIFACTS)) {
            let item = raw.artifacts?.[planet] || (planet==='blueprint'?legacy(save).artifacts.blueprint:artifact());
            if(planet==='blueprint'&&['unseen','waiting'].includes(item.stage)&&window.DogeMinerLateProgression?.normalize(save.lateProgression,save).reallyhardium)
                item={...artifact(),stage:'collected',planet:'titan'};
            if (!['unseen', 'waiting', 'field', 'collected'].includes(item.stage) || !Number.isFinite(item.readyAt) || item.readyAt < 0
                || !PLANETS.includes(item.planet) || ![item.x, item.y].every(value => Number.isFinite(value) && value >= 0 && value <= 1)) throw new Error('Invalid discovery artifact.');
            result.artifacts[planet] = { stage: item.stage, readyAt: Math.min(item.readyAt, Date.now() + ARTIFACTS[planet].delay),
                planet: item.planet, x: item.x, y: item.y };
        }
        return result;
    }
    const proto = DogeMinerGame.prototype;
    proto.getWorldDiscoveryForSave = function () { return normalize(this.worldDiscovery, this); };
    proto.resetWorldDiscoveryPresentation = function () {
        this._worldEpoch = (this._worldEpoch || 0) + 1;
        for (const view of this._worldArtifactViews?.values() || []) view.close();
        this._worldArtifactViews = new Map();
        this._worldRenderedPlanet = null;
    };
    proto.restoreWorldDiscovery = function (save = {}) {
        const state = normalize(save.worldDiscovery, save);
        this.resetWorldDiscoveryPresentation(); this.worldDiscovery = state;
        this._worldCheckMs = 1000; this._worldRetryAt = 0;
    };
    proto.nextTimelineWorldDiscovery = function (nextTimeline) { return fresh(nextTimeline); };
    proto._commitWorldDiscovery = function (next, { stories = [], seen = [], render = true, spawning = [] } = {}) {
        try { next = normalize(next, this); } catch (error) { console.error('Invalid world discovery:', error); return false; }
        const oldWorld = this.worldDiscovery, oldStories = this.storyProgress, draft = this.getStoryProgressForSave();
        for (const id of seen) if (!draft.seen.includes(id)) draft.seen.push(id);
        for (const id of stories) if (window.DogeMinerStories.get(id) && !draft.seen.includes(id) && !draft.pending.includes(id) && !this._storySkipped?.has(id)) draft.pending.push(id);
        this.worldDiscovery = next; this.storyProgress = draft;
        try {
            if (window.saveManager?.commitWorldDiscovery?.() !== true) throw new Error('World discovery could not be saved.');
            this._worldRetryAt = 0;
        } catch (error) {
            this.worldDiscovery = oldWorld; this.storyProgress = oldStories; this._worldRetryAt = Date.now() + 1000;
            console.error('Could not save world discovery:', error); return false;
        }
        try { this.updateUI?.(); this.syncWorldDiscoveryUI?.(); if (render) this.renderWorldArtifacts?.(spawning); }
        catch (error) { console.error('World discovery display refresh failed:', error); }
        return true;
    };
    proto.isWorldPlanetUnlocked = function (planet) { return Boolean(this.worldDiscovery?.unlocked.includes(planet) || earnedAccess(this, planet)); };
    proto.isWorldPlanetKnown = function (planet) { return Boolean(this.worldDiscovery?.known.includes(planet) || this.isWorldPlanetUnlocked(planet)); };
    proto.isWorldTravelAllowed = function () {
        return this.worldDiscovery?.artifacts?.blueprint?.stage!=='waiting'&&![...Object.values(this.worldDiscovery?.routes || {}), ...Object.values(this.worldDiscovery?.events || {})]
            .some(item => item?.stage === 'waiting');
    };
    proto.isWorldHelperAvailable = function (type) {
        const event = Object.entries(EVENTS).find(([, definition]) => definition.helper === type);
        if (event) return this.worldDiscovery?.events[event[0]].stage === 'ready';
        const entry = Object.entries(ROUTES).find(([, definition]) => definition.helper === type);
        return !entry || this.worldDiscovery?.routes[entry[0]].stage === 'ready';
    };
    proto.syncWorldDiscoveryUI = function () {
        const ui = window.uiManager; if (!ui) return;
        ui.updatePlanetTabVisibility(); ui?.updateShopContent();
        if (this.isMobileDevice()) ui?.updateMobileShopContent();
    };
    function finishEvent(next, key, stories) {
        const definition = EVENTS[key];next.events[key].stage = 'ready';stories.push(definition.story);
        if (definition.known && !next.known.includes(definition.known)) next.known.push(definition.known);
        if (definition.unlock && !next.unlocked.includes(definition.unlock)) next.unlocked.push(definition.unlock);
    }
    proto.advanceWorldDiscovery = function (deltaMs) {
        if (!this._bootComplete || !this.isPlaying || document.hidden || Date.now() < (this._worldRetryAt || 0)) return;
        if (this.isStoryOpen) {
            // DM2's DogeStar callback completes after 500ms even while its own
            // introduction is open. It grants no items and never dismisses it.
            const item = this.worldDiscovery?.events?.titanRoute;
            if (this._activeStory?.id === 'titan2' && item?.stage === 'waiting' && Date.now() >= item.startedAt + 500) {
                const next = this.getWorldDiscoveryForSave(), stories = [];
                finishEvent(next, 'titanRoute', stories);this._commitWorldDiscovery(next, { stories });
            }
            return;
        }
        this._worldCheckMs = (this._worldCheckMs || 0) + Math.max(0, Math.min(1000, deltaMs || 0));
        const check = this._worldCheckMs >= 1000, state = this.worldDiscovery;
        const pending = state && [...Object.values(state.artifacts), ...Object.values(state.routes), ...Object.values(state.events || {})].some(item => item?.stage === 'waiting');
        const changedPlanet = this._worldRenderedPlanet !== this.currentLevel;
        if (!check && !pending && !changedPlanet) return;
        if (!this.canPresentStory()) return;
        if (check) this._worldCheckMs %= 1000;
        const next = this.getWorldDiscoveryForSave(), now = Date.now(), spawning = [], stories = [], seen = [];
        let changed = !state || !state.visited.includes(this.currentLevel);
        if (check) for (const planet of PLANETS) if (earnedAccess(this, planet) && !next.unlocked.includes(planet)) {
            next.unlocked.push(planet); if (!next.known.includes(planet)) next.known.push(planet); changed = true;
        }
        for (const [key, definition] of Object.entries(ROUTES)) {
            const item = next.routes[key];
            if (check && item.stage === 'unseen' && definition.eligible(this)) {
                if (this.storyProgress?.seen.includes(definition.marker) || next.unlocked.includes(key)) item.stage = 'ready';
                else { item.stage = 'waiting'; item.startedAt = now; seen.push(definition.marker); }
                if (!next.known.includes(key)) next.known.push(key);
                changed = true;
            }
            if (item.stage === 'waiting') {
                if (definition.firstStory && !item.firstQueued && now >= item.startedAt + definition.firstDelay) {
                    item.firstQueued = true; stories.push(definition.firstStory); changed = true;
                } else if (now >= item.startedAt + definition.delay && (!definition.firstStory
                    || (item.firstQueued && !this.storyProgress?.pending.includes(definition.firstStory)))) {
                    // The source's second deferred callback waits behind the first
                    // popup. A durable dismissal removes it from the pending queue.
                    item.stage = 'ready'; stories.push(definition.story); changed = true;
                }
            }
        }
        for (const [key, definition] of Object.entries(EVENTS)) {
            const item = next.events[key];
            if (check && item.stage === 'unseen' && definition.eligible(this)) {
                item.stage = 'waiting';item.startedAt = now;seen.push(definition.marker);changed = true;
                if (definition.immediateStory) stories.push(definition.story);
            }
            if (item.stage === 'waiting' && now >= item.startedAt + definition.delay) {
                finishEvent(next, key, stories);changed = true;
            }
            if (check && item.stage === 'ready' && definition.replayWhenReady && definition.eligible(this)
                && !this.storyProgress?.seen.includes(definition.story) && !this.storyProgress?.pending.includes(definition.story)
                && !this._storySkipped?.has(definition.story)) { stories.push(definition.story);changed = true; }
        }
        if (check && contactEligible(this, now)) { next.events.contacted = true;stories.push('dia');changed = true; }
        for (const [key, definition] of Object.entries(ARTIFACTS)) {
            const item = next.artifacts[key];
            if (check && item.stage === 'unseen' && definition.eligible(this)) {
                item.stage = 'waiting'; item.readyAt = now + definition.delay; changed = true;
            }
            if (item.stage === 'waiting' && now >= item.readyAt) {
                const point = this.getWorldArtifactLanding(definition.radius);
                Object.assign(item, { stage: 'field', readyAt: 0, planet: this.currentLevel, x: point.x, y: point.y });
                spawning.push(key); changed = true;
            }
        }
        if (changed) {
            if (this._commitWorldDiscovery(next, { spawning, stories, seen })) {
                for (const [key, definition] of Object.entries(ROUTES)) {
                    if (definition.sound && next.routes[key].stage === 'ready' && state?.routes[key].stage === 'waiting') window.audioManager?.playSound(definition.sound);
                }
                for (const [key, definition] of Object.entries(EVENTS)) {
                    if (definition.sound && next.events[key].stage === 'ready' && state?.events?.[key].stage === 'waiting') window.audioManager?.playSound(definition.sound);
                    if (definition.startSound && next.events[key].stage === 'waiting' && state?.events?.[key].stage === 'unseen') window.audioManager?.playSound(definition.startSound);
                }
            }
        }
        else if (changedPlanet) this.renderWorldArtifacts();
    };
    function trajectory({ phone, platformX, platformY, rockX, rockY }, random = Math.random) {
        let angle, radius;
        if (phone) { angle = 230 + 90 * random(); radius = 100 + 90 * random(); }
        else { radius = 115 + 70 * random(); angle = 150 + 110 * random(); }
        const radians = angle * Math.PI / 180;
        return phone ? { fromX: rockX, fromY: rockY + 10, x: rockX + Math.floor(Math.cos(radians) * radius) - 12,
            y: rockY + Math.floor(Math.sin(radians) * radius) + 23 }
            : { fromX: rockX - 20, fromY: rockY, x: platformX + Math.floor(Math.cos(radians) * radius + 100),
                y: platformY + 190 + Math.floor(Math.sin(radians) * radius + 50) };
    }
    function fitLanding({ width, height, hudBottom = 0, visibleTop = 0, radius = 35 }, point) {
        const bottom = Math.max(radius, height - Math.max(75,radius+10)), top = Math.min(bottom, Math.max(125, hudBottom + Math.max(40,radius), visibleTop + radius));
        return { x: Math.max(radius, Math.min(width - radius, point.x)), y: Math.max(top, Math.min(bottom, point.y)) };
    }
    proto.clampWorldArtifactPoint = function (point,radius=35) {
        const field = document.getElementById('left-panel'), bounds = field.getBoundingClientRect(), scale = bounds.width / field.offsetWidth || 1;
        const hud = document.getElementById('stats-display')?.getBoundingClientRect();
        const visibleBottom = Math.min(field.offsetHeight, (window.innerHeight - bounds.top) / scale);
        return fitLanding({ width: field.offsetWidth, height: visibleBottom, visibleTop: Math.max(0, -bounds.top / scale),
            hudBottom: hud ? (hud.bottom - bounds.top) / scale : 0,radius }, point);
    };
    proto.getWorldArtifactLanding = function (radius=35) {
        const field = document.getElementById('left-panel'), bounds = field.getBoundingClientRect();
        const scale = bounds.width / field.offsetWidth || 1;
        const rock = document.getElementById('main-rock').getBoundingClientRect();
        const platform = document.getElementById('character-container').getBoundingClientRect();
        const point = trajectory({ phone: this.isMobileDevice(), platformX: (platform.left - bounds.left) / scale,
            platformY: (platform.top - bounds.top) / scale, rockX: (rock.left + rock.width / 2 - bounds.left) / scale,
            rockY: (rock.top + rock.height / 2 - bounds.top) / scale });
        const fitted = this.clampWorldArtifactPoint(point,radius);
        return { x: fitted.x / field.offsetWidth, y: fitted.y / field.offsetHeight };
    };
    proto.renderWorldArtifacts = function (spawning = []) {
        this._worldArtifactViews ||= new Map(); this._worldRenderedPlanet = this.currentLevel;
        const state = this.worldDiscovery;
        for (const [key, view] of this._worldArtifactViews) {
            const item = state?.artifacts[key];
            if ((!item || item.planet !== this.currentLevel || item.stage !== 'field') && !view.claimed) { view.close(); this._worldArtifactViews.delete(key); }
        }
        for (const [key, definition] of Object.entries(ARTIFACTS)) {
            const item = state?.artifacts[key];
            if (!item || item.stage !== 'field' || item.planet !== this.currentLevel) continue;
            const existing = this._worldArtifactViews.get(key);
            if (existing) existing.position();
            else this._worldArtifactViews.set(key, this._showWorldArtifact(key, definition, item, spawning.includes(key)));
        }
    };
    proto.collectWorldArtifact = function (key, token) {
        const definition = ARTIFACTS[key], view = this._worldArtifactViews?.get(key), item = this.worldDiscovery?.artifacts[key];
        if (!definition || !view || view.token !== token || token.epoch !== this._worldEpoch || token.timeline !== (this.timelineNumber || 1)
            || token.planet !== this.currentLevel || item?.stage !== 'field' || item.planet !== this.currentLevel || this.isStoryOpen || !this.canPresentStory()) return false;
        const next = this.getWorldDiscoveryForSave(); next.artifacts[key].stage = 'collected';
        if (!this._commitWorldDiscovery(next, { stories: [definition.story], render: false })) { view.showError(); return false; }
        view.claim(); window.audioManager?.playSound('grab_bag2'); return true;
    };
    class ArtifactView {
        constructor(game, key, definition, item, spawning) {
            this.game = game; this.key = key; this.item = item;this.definition=definition; this.animations = [];
            this.token = { epoch: game._worldEpoch, timeline: game.timelineNumber || 1, planet: game.currentLevel };
            const node = this.node = document.createElement('button'); node.type = 'button'; node.className = 'world-artifact';
            node.dataset.artifact = key; node.setAttribute('aria-label', `Collect ${definition.label.toLowerCase()}`);
            const bob = document.createElement('span'); bob.className = 'world-artifact-bob';
            const art = document.createElement('img'); art.className = 'world-artifact-art'; art.src = definition.image||'../assets/general/icons/map.webp'; art.alt = ''; art.draggable = false;
            bob.append(art); node.append(bob); node.addEventListener('click', event => { event.stopPropagation(); game.collectWorldArtifact(key, this.token); });
            document.getElementById('left-panel').append(node); this.position();
            this.hover = window.LootMotion?.hover(node, art);
            if (spawning && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
                const field = node.parentElement.getBoundingClientRect(), rock = document.getElementById('main-rock').getBoundingClientRect();
                const scale = field.width / node.parentElement.offsetWidth || 1, phone = game.isMobileDevice();
                const x = (rock.left + rock.width / 2 - field.left) / scale - (phone ? 0 : 20) - item.x * node.parentElement.offsetWidth;
                const y = (rock.top + rock.height / 2 - field.top) / scale + (phone ? 10 : 0) - item.y * node.parentElement.offsetHeight;
                const animation = window.LootMotion?.sample(node, 800, t => { const ease = t === 1 ? 1 : 1 - 2 ** (-10 * t);
                    return { transform: `translate(${x * (1 - ease)}px,${y * (1 - ease)}px)`, opacity: 1 - (1 - Math.min(1, t * 4)) ** 2 }; });
                if (animation) this.animations.push(animation);
            }
        }
        position() {
            const field = this.node.parentElement;
            if (field) {
                const point = this.game.clampWorldArtifactPoint({ x: this.item.x * field.offsetWidth, y: this.item.y * field.offsetHeight },this.definition.radius);
                const half=this.key==='blueprint'?60:30;
                this.node.style.left = `${point.x - half}px`; this.node.style.top = `${point.y - half}px`;
            }
        }
        showError() { this.node.setAttribute('aria-label', 'Could not save. Collect again to retry.');this.node.title = 'Could not save. Try again.';this.node.classList.add('world-artifact-retry'); }
        claim() {
            this.claimed = true; this.node.disabled = true; this.hover?.detach();
            const style = getComputedStyle(this.node), transform = style.transform === 'none' ? '' : style.transform, opacity = Number(style.opacity);
            for (const animation of this.animations) animation.cancel();
            const motion = window.LootMotion?.sample(this.node, 200, t => { const ease = 1 - (1 - t) ** 2;
                return { transform: `${transform} scale(${1 + .75 * ease})`, opacity: opacity * (1 - ease) }; }, () => this.close());
            if (motion) this.animations.push(motion); else this.close();
        }
        close() { if (this.closed) return;this.closed = true;this.hover?.detach();for (const animation of this.animations) animation.cancel();this.node.remove();
            if (this.game._worldArtifactViews?.get(this.key) === this) this.game._worldArtifactViews.delete(this.key); }
    }
    proto._showWorldArtifact = function (...args) { return new ArtifactView(this, ...args); };
    window.addEventListener?.('resize', () => window.game?.renderWorldArtifacts?.());
    const stories = window.DogeMinerStories;
    stories.registerNarrative({id:'foundbp',title:'BLUEPRINTS?',
        body:"How strange! It's written in an alien language. What could these <blue>BLUEPRINTS</blue> be for? Someone get an archeologist or something!",
        image:'../assets/SpritesheetsSrc/story/story/blueprints.webp',eligible:()=>false});
    stories.registerNarrative({ id: 'timemachine', title: 'TIME MINER',
        body: 'Top scientists on <earth>EARTH</earth> have recently invented an experimental <dark>TIME TRAVEL MINING RIG</dark> that <i>could</i> help with mining.\n ',
        image: '../assets/helpers/rigs/rigs-idle-0.webp', eligible: () => false });
    stories.registerNarrative({ id: 'dia', title: 'DOGE INTELLIGENCE AGENCY', titleSize: 'medium',
        body: '<i>“Wow! Such greetings. The <ltblue>DIA</ltblue> has been following your career very closely. We have a much important job for someone of your caliber. Contact us on this <dark>DOGETALKIE</dark> if you are interested.”</i>',
        image: '../assets/SpritesheetsSrc/story/story/dia.webp', eligible: () => false });
    stories.registerNarrative({ id: 'titan1', title: 'Sensing Something',
        body: 'An unexpected find has arisen from your <orange>CLOUD BASE</orange> sensor arrays. They have detected a massive object of almost pure <green>ĐOGECOIN</green>. But not on <jupiter>JUPITER</jupiter>! These readings seem to indicate that <goldorange>TITAN</goldorange>, a moon of <ltblue>SATURN</ltblue>, is the source.',
        image: '../assets/general/titan.webp', eligible: () => false });
    stories.registerNarrative({ id: 'titan2', title: "IT'S BEAUTIFUL",
        body: 'The construction of your <orange>DOGESTAR</orange> is... complete. Such work. Much marvelous. The space station can travel short distances within the solar system. Perhaps going to <goldorange>TITAN</goldorange>, the <green>ĐOGECOIN</green> rich moon of <ltblue>SATURN</ltblue>, would be an adventure.',
        image: '../assets/SpritesheetsSrc/story/story/titan1.webp', eligible: () => false });
    stories.registerNarrative({ id: 'moon1', title: 'SUCH ACHIEVEMENT',
        body: 'Wow, you landed on <blue>THE MOON</blue>!\nSet up a <blue>MOON BASE</blue> to begin mining operations.',
        image: '../assets/SpritesheetsSrc/story/story/moonbase.webp', eligible: game => game.currentLevel === 'moon' });
    stories.registerNarrative({ id: 'moon2', title: 'A MAP!', body: 'You found a <dark>TREASURE MAP</dark>. The map points to a red dot.',
        image: '../assets/SpritesheetsSrc/story/story/map_red_dot.webp', eligible: game => game.worldDiscovery?.artifacts.moon.stage === 'collected' });
    stories.registerNarrative({ id: 'moon3', title: 'OCEANS?',
        body: 'A <orange>LANDER SHIBE</orange> has returned from scouting <red>MARS</red> and claims to have spotted oceans of <green>ĐOGECOINS</green>. A <red>MARS ROCKET</red> is now available.',
        image: '../assets/SpritesheetsSrc/story/story/oceans_on_mars.webp', eligible: () => false });
    stories.registerNarrative({ id: 'mars1', title: 'THE PARTY PLANET',
        body: 'You made it to <red>MARS</red>! You see no oceans of <green>ĐOGECOINS</green>, but the vibe is great. A <red>MARS BASE</red> could get the <orange>PARTY SHIBES</orange> started.',
        image: '../assets/SpritesheetsSrc/story/story/mars_party.webp', eligible: game => game.currentLevel === 'mars' });
    stories.registerNarrative({ id: 'marsdraw', title: 'THATS ODD',
        body: "You found a <dark>CRUDE DRAWING</dark>. It doesn't look like anything to you.",
        image: '../assets/SpritesheetsSrc/story/story/map_crude.webp', eligible: game => game.worldDiscovery?.artifacts.mars.stage === 'collected' });
    stories.registerNarrative({ id: 'mars2', title: 'GOOD VIBRATIONS',
        body: 'The booming vibrations of the <dark>SPACE BASS</dark> have scattered the outer clouds of <jupiter>JUPITER</jupiter> to reveal massive subclouds of <green>ĐOGECOINS</green>.',
        image: '../assets/SpritesheetsSrc/story/story/vibrations_jupiter.webp', eligible: () => false });
    stories.registerNarrative({ id: 'mars3', title: 'THE BIGGEST YET',
        body: 'Top scientists have designed a rocket powerful enough to get to <jupiter>JUPITER</jupiter>. The <orangered>JUPITER ROCKET</orangered> costs <orange>50 MILLION</orange> <green>ĐOGECOINS</green>.',
        image: '../assets/SpritesheetsSrc/story/story/jupiter_rocket.webp', eligible: () => false });
    stories.registerNarrative({ id: 'jupiter1', title: 'CLOUD MINER',
        body: 'The clouds of <jupiter>JUPITER</jupiter> are a natural formation of gas-like <green>ĐOGECOINS</green>. Mining the clouds might be easier than mining solid matter!',
        image: '../assets/SpritesheetsSrc/story/story/cloud_miner.webp', eligible: game => game.currentLevel === 'jupiter' });
    window.DogeMinerWorldDiscovery = Object.freeze({ fresh, legacy, normalize, count, trajectory, fitLanding, contactEligible, artifacts: ARTIFACTS, routes: ROUTES, events: EVENTS, planets: Object.freeze([...PLANETS]) });
})();
