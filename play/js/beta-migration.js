// One-time Alpha -> Beta balance migration. Item rolls are replayed once using
// a stable seed; acquisition details missing from Alpha saves are disclosed.
(function (root) {
    'use strict';

    const PLANETS = ['earth', 'moon', 'mars', 'jupiter', 'titan'];
    const BASE_TIERS = { earth: 1, moon: 2, mars: 3, jupiter: 4, titan: 6 };
    const clone = value => JSON.parse(JSON.stringify(value));
    const normalize = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const statKey = stat => normalize(stat.name || stat.displayName);
    const numeric = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
    const currentVersion = () => root.DogeMinerBalance?.VERSION || 'dm2-beta-1';

    function stableJSON(value) {
        if (Array.isArray(value)) return `[${value.map(stableJSON).join(',')}]`;
        if (value && typeof value === 'object') {
            return `{${Object.keys(value).sort().filter(key => value[key] !== undefined)
                .map(key => `${JSON.stringify(key)}:${stableJSON(value[key])}`).join(',')}}`;
        }
        return JSON.stringify(value);
    }

    function hash(value) {
        let result = 2166136261;
        for (let i = 0; i < value.length; i++) {
            result ^= value.charCodeAt(i);
            result = Math.imul(result, 16777619);
        }
        return (result >>> 0).toString(16).padStart(8, '0');
    }

    function seededRandom(seed) {
        let state = parseInt(hash(seed), 16);
        return () => {
            state += 0x6D2B79F5;
            let value = state;
            value = Math.imul(value ^ (value >>> 15), value | 1);
            value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
            return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
        };
    }

    function validate(save) {
        if (!save || typeof save !== 'object' || Array.isArray(save)) throw new Error('Invalid save data');
        for (const key of ['dogecoins', 'totalMined', 'totalClicks']) {
            if (!Number.isFinite(save[key]) || save[key] < 0) throw new Error(`Invalid save ${key}`);
        }
        if (!save.version || !Number.isFinite(save.timestamp)) throw new Error('Invalid save header');
        for (const kind of ['pickaxe', 'fortune']) {
            const inventory = save[`${kind}Inventory`];
            if (inventory !== undefined && !Array.isArray(inventory)) throw new Error(`Invalid ${kind} inventory`);
            for (const item of inventory || []) {
                if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error(`Invalid ${kind} item`);
                if (kind === 'pickaxe' && (!Number.isFinite(item.baseDPC) || item.baseDPC < 0)) {
                    throw new Error('Invalid pickaxe DPC');
                }
                if (item.stats !== undefined && !Array.isArray(item.stats)) throw new Error('Invalid item stats');
                for (const stat of item.stats || []) {
                    if (!stat || !Number.isFinite(stat.value)) throw new Error('Invalid item stat value');
                }
            }
        }
        return true;
    }

    function preservedReason(kind, item, definition) {
        if (item.instanceId === 'default_normal_pickaxe' || item.instanceId === 'timeline_paw' || item.isPaw) {
            return 'Starting pickaxe: fixed 1 DPC and existing stats preserved.';
        }
        if (item.isSuperFortune || item.templateId === 'super_fortune' || item.name === 'Super Fortune') {
            return 'Earned Super Fortune bonuses preserved. Alpha did not save the original combined items.';
        }
        if (item.templateId === 'badge_of_patronage' || item.name === 'Badge of Patronage') {
            return 'Patron fortune: fixed stats preserved exactly.';
        }
        if (item.isDiaBadge || String(item.name || '').startsWith('D.I.A. Badge')) {
            return 'Earned D.I.A. badge bonuses preserved.';
        }
        if (item.isProtected || item.isSoulbound || item.isSeasonal || item.protected || definition?.protected) {
            return 'Protected or soulbound item: existing stats preserved.';
        }
        if (!definition || definition.sourceMatched === false) {
            return 'This custom or unrecognized item keeps its existing values.';
        }
        // A fixed fortune has no DPC roll or other variable gameplay stats.
        if (kind === 'fortune' && definition.fixed) return 'Fixed fortune: existing stats preserved exactly.';
        return null;
    }

    function acquiredAt(item) {
        for (const key of ['acquiredAt', 'obtainedAt', 'generatedAt', 'createdAt']) {
            if (Number.isFinite(item[key]) && item[key] > 0) return item[key];
        }
        const timestamp = String(item.instanceId || '').match(/(?:^|_)(\d{12,14})(?:_|$)/);
        return timestamp ? Number(timestamp[1]) : null;
    }

    function sumWow(items) {
        return items.reduce((total, item) => total + (item.stats || []).reduce((value, stat) =>
            value + (statKey(stat) === 'wow' ? numeric(stat.value) : 0), 0), 0);
    }

    function oldTotals(save) {
        const pickaxes = save.pickaxeInventory || [];
        const fortunes = save.fortuneInventory || [];
        const equipped = pickaxes.find(item => item.instanceId === save.equippedPickaxeId) || pickaxes[0];
        const stats = {
            luck: 0, lootFind: 0, wow: 0, critChance: 0.05, dpcMultiplier: 1,
            helperDpsMultiplier: 1, flatHelperDps: 0, rocketCostReduction: 0, mysteryBonus: 0
        };
        const keys = {
            luck: 'luck', higherground: 'luck', lootfind: 'lootFind', wow: 'wow',
            critchance: 'critChance', criticalchance: 'critChance', dpcmultiplier: 'dpcMultiplier',
            helperdpsmultiplier: 'helperDpsMultiplier', helperdps: 'helperDpsMultiplier',
            dps: 'helperDpsMultiplier', rocketcostreduction: 'rocketCostReduction', spacerocketcosts: 'rocketCostReduction'
        };
        for (const item of [equipped, ...fortunes].filter(Boolean)) {
            for (const stat of item.stats || []) {
                if (statKey(stat) === 'mysterybonus') stats.mysteryBonus += numeric(stat.value);
                if (!stat.isCore) continue;
                const key = keys[statKey(stat)];
                if (!key) continue;
                const value = numeric(stat.value);
                if (stat.indicator === '+%') {
                    stats[key] += ['critChance', 'dpcMultiplier', 'helperDpsMultiplier'].includes(key) ? value / 100 : value;
                } else if (stat.indicator === '+') {
                    if (key === 'helperDpsMultiplier') stats.flatHelperDps += value;
                    else stats[key] += value;
                } else if (stat.indicator === '-%') stats[key] += value / 100;
                else if (stat.indicator === '-') stats[key] += value;
            }
        }
        if (equipped?.isStaffOfSundoge) {
            stats.helperDpsMultiplier += numeric(equipped.stats?.find(stat => statKey(stat) === 'dps')?.value);
        }
        if (save.isSupporter) stats.helperDpsMultiplier *= 1.05;
        return {
            ...stats,
            dpc: equipped?.isPaw ? 1 : Math.floor(numeric(equipped?.baseDPC, 1) * stats.dpcMultiplier
                * (save.isSupporter ? 1.05 : 1)) * numeric(save.bonusCoinBuffMultiplier, 1),
            dps: numeric(save.dps),
            mysteryDps: 0,
            dpsSource: 'Your income when your Alpha progress was last saved.'
        };
    }

    function statChanges(before, after, fixedReasons = new Map()) {
        const remaining = after.map((stat, index) => ({ stat, index, used: false }));
        const exactMatches = new Map();
        // Reserve every unchanged duplicate before pairing altered values. An
        // earlier changed Karma row must not consume a later unchanged Karma.
        before.forEach((oldStat, index) => {
            const found = remaining.find(entry => !entry.used && statKey(entry.stat) === statKey(oldStat)
                && entry.stat.indicator === oldStat.indicator && entry.stat.value === oldStat.value);
            if (found) {
                found.used = true;
                exactMatches.set(index, found);
            }
        });
        const changes = [];
        for (const [oldIndex, oldStat] of before.entries()) {
            const matching = remaining.filter(entry => !entry.used && statKey(entry.stat) === statKey(oldStat));
            const found = exactMatches.get(oldIndex)
                || matching.find(entry => entry.stat.indicator === oldStat.indicator) || matching[0];
            if (found) found.used = true;
            const newStat = found?.stat;
            const unchanged = newStat && oldStat.value === newStat.value && oldStat.indicator === newStat.indicator;
            const reason = fixedReasons.get(oldStat);
            changes.push({
                name: oldStat.name || newStat?.name,
                displayName: newStat?.displayName || oldStat.displayName || oldStat.name,
                indicator: newStat?.indicator || oldStat.indicator,
                beforeIndicator: oldStat.indicator,
                afterIndicator: newStat?.indicator || null,
                before: oldStat.value,
                after: newStat?.value ?? null,
                status: !newStat ? 'removed' : unchanged ? (reason ? 'preserved' : 'unchanged') : 'changed',
                ...(reason ? { reason } : {})
            });
        }
        for (const entry of remaining.filter(entry => !entry.used)) {
            changes.push({
                name: entry.stat.name,
                displayName: entry.stat.displayName || entry.stat.name,
                indicator: entry.stat.indicator,
                beforeIndicator: null,
                afterIndicator: entry.stat.indicator,
                before: null,
                after: entry.stat.value,
                status: 'added'
            });
        }
        return changes;
    }

    function prepare(rawSave, { game, now = Date.now() } = {}) {
        validate(rawSave);
        const save = clone(rawSave);
        const version = currentVersion();
        if (save.balanceVersion === version) return { saveData: save, migrated: false };
        if (save.balanceVersion) throw new Error(`Unsupported balance version: ${save.balanceVersion}`);
        const balance = root.DogeMinerBalance;
        if (!balance) throw new Error('Beta balance definitions are unavailable; the Alpha save was not changed.');
        const report = {
            version,
            fingerprint: hash(stableJSON(rawSave)),
            createdAt: now,
            acknowledged: false,
            itemChanges: [],
            rockChanges: [],
            notes: [
                'Some Alpha items did not record when or where they were found, or which pickaxe and helpers you had at the time. Their new values use the history and progress available in your save.',
                'Your earned Super Fortune and protected bonuses stay with you. Each item from your current timeline is balanced once, in the order it was found when that history is available.',
                'You keep your currencies, owned items, equipped pickaxe, and lifetime rock totals.'
            ],
            totalsBefore: oldTotals(save),
            originalMaxPickaxeDPC: numeric(save.maxPickaxeDPC, 1),
            earnedProgress: {
                dogecoins: save.dogecoins,
                dogediamonds: numeric(save.dogediamonds),
                totalMined: save.totalMined,
                totalClicks: save.totalClicks,
                timelineNumber: numeric(save.timelineNumber, 1)
            }
        };
        save.pickaxeInventory ||= game?.defaultPickaxe ? [clone(game.defaultPickaxe)] : [];
        save.fortuneInventory ||= [];
        const entries = [];
        for (const kind of ['pickaxe', 'fortune']) {
            save[`${kind}Inventory`].forEach((item, index) => {
                const factory = game?.[`${kind}Factory`];
                const factoryTemplate = factory?.templates?.[item.templateId];
                // Alpha once gave both Dogfinity Stone variants the same template
                // ID. Their original sprite identifies the actual earned variant.
                const template = factoryTemplate ? { ...factoryTemplate, ...item,
                    statTemplates: factoryTemplate.statTemplates || item.statTemplates } : item;
                const definition = balance.getDefinition(kind, template);
                entries.push({ kind, item, index, template, definition, before: clone(item),
                    time: acquiredAt(item), preserve: preservedReason(kind, item, definition) });
            });
        }
        // Fixed/protected fortunes existed before current timeline rolls when
        // their acquisition history is unavailable. Their stats are never rerolled.
        const baseline = entries.filter(entry => entry.kind === 'fortune' && entry.preserve).map(entry => entry.item);
        let fortuneWow = sumWow(baseline);
        let replayEquipped = save.pickaxeInventory.find(item => item.instanceId === 'timeline_paw'
            || item.instanceId === 'default_normal_pickaxe') || { baseDPC: 1, stats: [] };
        let maxDPC = 1;
        let inferredPlanet = 'earth';
        let highestPlanet = 'earth';
        const chronological = [...entries].sort((a, b) => {
            if (a.time !== null && b.time !== null && a.time !== b.time) return a.time - b.time;
            if (a.time !== null && b.time === null) return 1;
            if (a.time === null && b.time !== null) return -1;
            return a.index - b.index || a.kind.localeCompare(b.kind);
        });
        for (const entry of chronological) {
            const { kind, item, before, template } = entry;
            const fixedReasons = new Map();
            const history = item.balanceOrigin || item.balanceRollContext || item.rollContext || item.acquisitionContext;
            const contextNotes = [];
            const origin = PLANETS.includes(item.planetOfOrigin) ? item.planetOfOrigin
                : PLANETS.includes(template.planetRestriction) ? template.planetRestriction : null;
            let planet = PLANETS.includes(history?.planet) ? history.planet : origin || inferredPlanet;
            if (!history?.planet) contextNotes.push(origin ? 'The planet where this item was found was estimated from its origin.' : 'The planet where this item was found was estimated from your earlier items.');
            if (PLANETS.indexOf(planet) > PLANETS.indexOf(highestPlanet)) highestPlanet = planet;
            inferredPlanet = planet;
            const tier = Number.isFinite(history?.tier) ? history.tier : BASE_TIERS[highestPlanet];
            if (!Number.isFinite(history?.tier)) contextNotes.push('Your helpers when this item was found were not recorded; its estimated planet progression was used.');
            const timeline = Number.isFinite(history?.timeline) ? history.timeline : numeric(save.timelineNumber, 1);
            if (!Number.isFinite(history?.timeline)) contextNotes.push('Your saved timeline was used.');
            const wow = fortuneWow + sumWow([replayEquipped]);
            const context = { wow, timeline, planet, highestPlanet: history?.highestPlanet || highestPlanet, tier,
                dropType: numeric(history?.dropType, 1), reconstructed: history?.reconstructed === true || !history || contextNotes.length > 0,
                acquisitionOrder: entry.time !== null ? 'Instance timestamp' : 'Inventory order', notes: contextNotes };
            if (!entry.preserve) {
                item.rarity = entry.definition.rarity;
                const seedIdentity = item.instanceId || `${item.templateId || item.name}:${entry.index}`;
                const rng = seededRandom(`${version}:${kind}:${seedIdentity}`);
                if (kind === 'pickaxe') {
                    item.baseDPC = balance.rollDPC({ ...context, template, rarity: entry.definition.rarity, maxDPC }, rng);
                    if (!Number.isFinite(item.baseDPC) || item.baseDPC < 0) throw new Error(`Invalid rebalanced DPC for ${item.name}`);
                }
                const rolled = balance.rollStats(kind, template, context, rng);
                if (!Array.isArray(rolled)) throw new Error(`Unable to rebalance ${item.name || kind}`);
                const used = new Set();
                for (const oldStat of before.stats || []) {
                    if (!balance.isFixedStat(kind, template, oldStat)) continue;
                    let value = oldStat.value;
                    let reason = 'Fixed stat preserved; it does not scale with Wow.';
                    if (kind === 'pickaxe' && (item.isStaffOfSundoge || /Staff of (?:the )?SunDoge/i.test(item.name || ''))
                        && statKey(oldStat) === 'dps' && oldStat.indicator === '+%' && value === 0.1) {
                        value = balance.getFixedStatValue?.(kind, template, oldStat) ?? 10;
                        reason = "Alpha stored the Staff's fixed +10% DPS incorrectly; its intended bonus is now applied.";
                    }
                    const index = rolled.findIndex((stat, index) => !used.has(index) && statKey(stat) === statKey(oldStat));
                    if (index >= 0) {
                        used.add(index);
                        rolled[index] = { ...rolled[index], ...clone(oldStat), value, isFixed: true };
                    } else rolled.push({ ...clone(oldStat), value, isFixed: true });
                    fixedReasons.set(oldStat, reason);
                }
                item.stats = rolled;
                for (const stat of item.stats) {
                    if (!Number.isFinite(stat.value)) throw new Error(`Invalid rebalanced stat for ${item.name}`);
                }
                item.balanceMigration = { version, context: clone(context), seeded: true };
                item.balanceVersion = version;
                item.balanceDefinitionId = entry.definition.id;
                item.balanceOrigin = { ...clone(context), rarity: entry.definition.rarity,
                    definitionId: entry.definition.id, sourceMatched: true };
                if (kind === 'fortune') fortuneWow += sumWow([item]);
            } else {
                for (const stat of before.stats || []) fixedReasons.set(stat, entry.preserve);
            }
            if (kind === 'pickaxe' && item.baseDPC > maxDPC) {
                // Unmatched custom items stay owned but must not carry their old
                // inflated maximum into the verified DM2 roll progression.
                if (!entry.preserve || entry.preserve.startsWith('Starting pickaxe')) {
                    maxDPC = item.baseDPC;
                    replayEquipped = item;
                }
            }
            const beforeStats = before.stats || [];
            const afterStats = item.stats || [];
            const changes = statChanges(beforeStats, afterStats, fixedReasons);
            const changed = (kind === 'pickaxe' && before.baseDPC !== item.baseDPC)
                || before.rarity !== item.rarity
                || changes.some(change => ['added', 'removed', 'changed'].includes(change.status));
            report.itemChanges.push({
                kind, instanceId: item.instanceId, name: item.name || 'Unnamed item',
                oldRarity: before.rarity || 'common', newRarity: item.rarity || 'common',
                ...(kind === 'pickaxe' ? { oldDPC: before.baseDPC, newDPC: item.baseDPC } : {}),
                statsBefore: beforeStats, statsAfter: clone(afterStats), statChanges: changes,
                status: entry.preserve ? 'preserved' : changed ? 'changed' : 'unchanged',
                ...(entry.preserve ? { preservedReason: entry.preserve } : {}), context
            });
        }
        // Unknown custom items remain owned and equipable, but cannot seed future
        // verified rolls with the old inflated Alpha maximum.
        save.maxPickaxeDPC = maxDPC;
        report.newMaxPickaxeDPC = save.maxPickaxeDPC;
        save.balanceVersion = version;
        save.betaMigrationReport = report;
        return { saveData: save, migrated: true, report,
            originalRockData: clone(rawSave.planetRockData || {
                earth: { rocksBroken: numeric(rawSave.rocksBroken), currentHP: null, maxHP: null }
            }) };
    }

    function rebalanceRocks(game, report, originalRockData = null) {
        for (const planet of PLANETS) {
            const old = { ...((originalRockData || game.planetRockData)?.[planet]
                || { rocksBroken: 0, currentHP: null, maxHP: null }) };
            const balanced = typeof game.getBalancedRockMigration === 'function'
                ? game.getBalancedRockMigration(planet, old)
                : (() => {
                    const rockLevel = Math.max(1, numeric(old.rockLevel, numeric(old.rocksBroken) + 1));
                    const maxHP = game.getRockHP(game.getPlanetRockBaseHP(planet), rockLevel - 1, planet);
                    const fraction = Number.isFinite(old.maxHP) && old.maxHP > 0 && Number.isFinite(old.currentHP)
                        ? Math.min(1, Math.max(0, old.currentHP / old.maxHP)) : 1;
                    return { rocksBroken: numeric(old.rocksBroken), rockLevel, maxHP,
                        currentHP: Math.max(1, Math.ceil(maxHP * fraction)), reason: 'Rock durability recalculated with the Beta formula; damage progress preserved.' };
                })();
            if (!balanced || !Number.isFinite(balanced.maxHP) || balanced.maxHP <= 0
                || !Number.isFinite(balanced.currentHP) || balanced.currentHP < 0) {
                throw new Error(`Unable to rebalance ${planet} rock; Alpha save was not replaced.`);
            }
            const newData = { rocksBroken: numeric(old.rocksBroken), rockLevel: balanced.rockLevel,
                maxHP: balanced.maxHP, currentHP: Math.min(balanced.maxHP, balanced.currentHP) };
            game.planetRockData[planet] = newData;
            report.rockChanges.push({ planet, oldMaxHP: old.maxHP ?? null, oldCurrentHP: old.currentHP ?? null,
                newMaxHP: newData.maxHP, newCurrentHP: newData.currentHP,
                rocksBrokenBefore: numeric(old.rocksBroken), rocksBrokenAfter: newData.rocksBroken,
                oldRockLevel: numeric(old.rockLevel, numeric(old.rocksBroken) + 1), newRockLevel: newData.rockLevel,
                reason: balanced.reason || 'Rock durability recalculated with the Beta formula.' });
        }
        const active = game.planetRockData[game.currentLevel];
        game.rocksBroken = active.rocksBroken;
        game.rockLevel = active.rockLevel;
        game.rockMaxHP = active.maxHP;
        game.rockCurrentHP = active.currentHP;
        game.lastDamageThresholdPercent = active.maxHP > 0 ? 100 * active.currentHP / active.maxHP : 100;
        report.totalsAfter = snapshot(game);
        return report;
    }

    function snapshot(game) {
        if (typeof game.getBalanceSnapshot === 'function') return game.getBalanceSnapshot();
        return { ...(game.playerStats || {}), dpc: typeof game.getPickaxeDPC === 'function'
            ? game.getPickaxeDPC() : typeof game.getCurrentDPC === 'function'
            ? game.getCurrentDPC() : typeof game.getDPC === 'function' ? game.getDPC()
                : game.getEquippedPickaxe?.()?.baseDPC || 1,
            dps: numeric(game.dps), mysteryDps: game.getMysteryDPS?.() || 0 };
    }

    root.BetaSaveMigration = { prepare, rebalanceRocks, snapshot, validate, oldTotals, statChanges, seededRandom, currentVersion };
})(typeof window !== 'undefined' ? window : globalThis);
