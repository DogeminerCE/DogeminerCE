// Pure balance rules pinned to the audited DM2 browser 2.15.0 build.
// All percentage stat values use percentage points: +10% is stored as 10.
(function (root) {
    'use strict';

    const VERSION = 'dm2-beta-1';
    const PLANETS = ['earth', 'moon', 'mars', 'jupiter', 'titan'];
    const RARITIES = ['common', 'improved', 'rare', 'epic', 'legendary'];
    const SECONDARY_LIMITS = [1, 1, 2, 3, 3];
    const TIER_BOUNDS = [[12, 100], [115, 1000], [1100, 5000], [6000, 9000], [10000, 17500], [40000, 70000], [80000, 200000]];
    const DPC_MULTIPLIERS = [1.10, 1.11, 1.12, 1.13, 1.16];
    const FORTUNE_KEYS = [
        ['luck', 'loot', 'mystery', 'happy', 'love', 'discipline'],
        ['income', 'luck', 'loot', 'love', 'mystery', 'wow', 'happy', 'sad', 'discipline', 'highground', 'dancing'],
        ['income', 'persec', 'luck', 'loot', 'mystery', 'wow', 'angry', 'morale'],
        ['income', 'persec', 'luck', 'loot', 'wow'],
        ['income', 'persec', 'luck', 'loot', 'wow']
    ];
    const FORTUNE_RANGES = [
        {luck: [3, 6], loot: [3, 6], wow: [3, 6], income: [1, 4], persec: [1, 4], fun: [1, 30]},
        {luck: [2, 8], loot: [2, 8], wow: [1, 8], income: [1, 4], persec: [1, 4], fun: [4, 35]},
        {luck: [7, 14], loot: [7, 14], wow: [7, 14], income: [2, 5], persec: [2, 5], fun: [9, 100]},
        {luck: [15, 30], loot: [15, 20], wow: [15, 20], income: [5, 7], persec: [5, 7], fun: [30, 420]},
        {luck: [19, 25], loot: [19, 40], wow: [19, 30], income: [6, 8], persec: [6, 8], fun: [30, 1000]}
    ];
    // [CE name, display label, indicator, DM2 category, mechanically consumed].
    const ATTRIBUTES = {
        click: ['click', 'DPC', '+', 'primary', true],
        luck: ['luck', 'Luck', '+%', 'secondary', true],
        wow: ['wow', 'Wow', '+%', 'secondary', true],
        loot: ['lootfind', 'Loot Find', '+%', 'secondary', true],
        crit: ['criticalchance', 'Critical Chance', '+%', 'secondary', true],
        income: ['helperdps', 'Helper DPS', '+%', 'secondary', true],
        dps: ['dps', 'DPS', '+', 'primary', true],
        persec: ['dps', 'DPS', '+', 'secondary', true],
        dpsp: ['dps', 'DPS', '+%', 'primary', true],
        rockets: ['spacerocketcosts', 'Space Rocket Costs', '-%', 'secondary', true],
        mystery: ['mysterybonus', 'Mystery Bonus', '+', 'tertiary', true],
        highground: ['higherground', 'Higher Ground', '+%', 'tertiary', false],
        defkit: ['defusekit', 'Defuse Kit', '+', 'primary', false],
        karma: ['karma', 'Karma', '+', 'tertiary', false],
        gains: ['gainz', 'Gainz', '+', 'tertiary', false],
        happy: ['happiness', 'Happiness', '+', 'tertiary', false],
        love: ['love', '♥', '+%', 'tertiary', false],
        sad: ['sadness', 'Sadness', '-', 'tertiary', false],
        angry: ['angriness', 'Angriness', '+%', 'tertiary', false],
        freedom: ['freedom', 'Freedom', '+', 'tertiary', false],
        discipline: ['discipline', 'Discipline', '+', 'tertiary', false],
        dancing: ['dancingskills', 'Dancing Skills', '+', 'tertiary', false],
        lives: ['lives', 'Lives', '+', 'tertiary', false],
        morale: ['helpermorale', 'Helper Morale', '+%', 'secondary', false],
        spirit: ['holidayspirit', 'Holiday Spirit', '+', 'tertiary', true],
        charity: ['charity', 'Charity', '+', 'tertiary', false],
        cooking: ['cookingskills', 'Cooking Skills', '+', 'tertiary', false],
        patronage: ['patronage', 'Patronage', '+', 'primary', false],
        away: ['maxawayminingtime', 'Max Away Mining Time', '+%', 'secondary', false],
        cat: ['kittensincomebonus', 'Kittens Income Bonus', '+', 'secondary', false],
        power: ['pickaxepower', 'Pickaxe Power', '+%', 'secondary', false],
        upgrade: ['upgradescoutingskill', 'Upgrade Scouting Skill', '+%', 'secondary', false],
        poison: ['poisondamage', 'Poison Damage', '+', 'secondary', false]
    };

    function normalize(value) {
        return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[Đđ]/g, 'd').toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    function number(value, fallback = 0) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }
    function planetIndex(value) {
        if (typeof value === 'number') return Math.max(0, Math.min(4, Math.floor(value) - 1));
        const index = PLANETS.indexOf(String(value || '').toLowerCase());
        return index < 0 ? 0 : index;
    }
    function planetName(value) { return PLANETS[planetIndex(value)]; }
    function qualityOf(value) {
        if (typeof value === 'number') return Math.max(0, Math.min(4, Math.floor(value)));
        return Math.max(0, RARITIES.indexOf(String(value || 'common').toLowerCase()));
    }
    function timelineOf(value) { return Math.max(1, Math.floor(number(value, 1))); }

    const aliases = {
        bronzemarsfortunes: 'bronzemarsfortune', bronzemoonfortunes: 'bronzemoonfortune',
        filledpotion: 'filledbottle', fortuneofthed: 'fortuneofthed',
        staffofsundoge: 'staffofthesundoge', superfortune: 'superfortune'
    };
    const indices = {pickaxe: new Map(), fortune: new Map()};
    for (const kind of ['pickaxe', 'fortune']) {
        for (const definition of (root.DogeMinerBalanceData?.definitions?.[kind] || [])) {
            indices[kind].set(normalize(definition.name), definition);
            indices[kind].set(normalize(definition.id), definition);
            indices[kind].set(normalize(kind + definition.id), definition);
        }
    }
    const statAliases = {
        lootfind: 'loot', criticalchance: 'crit', critchance: 'crit', helperdps: 'income', helperdpsmultiplier: 'income',
        mysterybonus: 'mystery', mysterybonuss: 'mystery', higherground: 'highground', spacerocketcosts: 'rockets',
        rocketcostreduction: 'rockets', defusekit: 'defkit', gainz: 'gains', happiness: 'happy', sadness: 'sad',
        angriness: 'angry', dancingskills: 'dancing', helpermorale: 'morale', holidayspirit: 'spirit',
        cookingskills: 'cooking', cookingskill: 'cooking', heart: 'love'
    };
    function statKey(stat, kind = 'fortune', item = {}) {
        if (stat?.balanceKey) return stat.balanceKey;
        const key = normalize(stat?.name || stat?.displayName || stat);
        if (key === 'dps') return stat?.indicator === '+%' ? 'dpsp' : kind === 'fortune' ? 'persec' : 'dps';
        if (!key && /♥|❤/.test(stat?.displayName || stat?.name || '')) return 'love';
        return statAliases[key] || key;
    }
    function getAttributeMetadata(stat, kind = 'fortune') {
        const key = statKey(stat, kind), metadata = root.DogeMinerBalanceData?.attributeMetadata?.[key];
        const tag = metadata?.tag || 'itemlight';
        return { key, ...metadata, tag, color: root.DogeMinerBalanceData?.attributeColors?.[tag] || '#ffffff' };
    }
    function rawDefinition(kind, item) {
        const values = typeof item === 'string' || typeof item === 'number' ? [item] : [item?.balanceDefinitionId, item?.name, item?.templateId, item?.id, item?.folderName];
        if (item?.sprite) {
            const asset = String(item.sprite).split('/').pop().replace(/\.[^.]+$/, '');
            const matches = (root.DogeMinerBalanceData?.definitions?.[kind] || []).filter(definition => normalize(definition.name) === normalize(item.name));
            const found = matches.find(definition => definition.assetKey === asset);
            if (found) return found;
        }
        for (const value of values) {
            const key = normalize(value);
            const found = indices[kind]?.get(aliases[key] || key);
            if (found) return found;
        }
        // CE template IDs prepend their planet, while public names omit it.
        for (const value of values) {
            const key = normalize(value).replace(/^(earth|moon|mars|jupiter|titan|universal)/, '');
            const found = indices[kind]?.get(aliases[key] || key);
            if (found) return found;
        }
        return null;
    }
    function fixedValueFor(kind, item, key, definition) {
        if (normalize(item?.name || '') === 'badgeofpatronage' || normalize(item?.templateId || '') === 'badgeofpatronage' || definition?.id === 'pbdg') {
            return key === 'patronage' ? 100 : ['loot', 'luck', 'wow'].includes(key) ? 15 : undefined;
        }
        if (key === 'defkit') return 1;
        if (definition?.fixed && definition.attributes?.[key]) return definition.attributes[key].min;
        const stored = (item?.stats || []).find(stat => statKey(stat, kind, item) === key);
        const explicit = (item?.statTemplates || []).find(stat => statKey(stat, kind, item) === key);
        if (explicit && explicit.fixedValue !== undefined && explicit.fixedValue !== null) return number(explicit.fixedValue);
        if (stored?.isFixed && stored.fixedValue !== undefined) return number(stored.fixedValue);
        return undefined;
    }
    function getDefinition(kind, item = {}) {
        kind = kind === 'pickaxes' ? 'pickaxe' : kind === 'fortunes' ? 'fortune' : kind;
        const publicDefinition = rawDefinition(kind, item);
        const quality = publicDefinition ? publicDefinition.quality : qualityOf(item?.rarity);
        const attributes = {};
        for (const [key, range] of Object.entries(publicDefinition?.attributes || {})) attributes[key] = {...range};
        const definition = {
            id: publicDefinition?.id || item?.templateId || item?.id || normalize(item?.name || item),
            name: publicDefinition?.name || item?.name || String(item),
            quality, rarity: RARITIES[quality], attributes,
            fixed: Boolean(publicDefinition?.fixed || publicDefinition?.id === 'pbdg' || item?.isSoulbound),
            zeroDPC: Boolean(publicDefinition?.zeroDPC || item?.zeroDPC || item?.isStaffOfSundoge),
            protected: Boolean(publicDefinition?.protected),
            fusionOnly: Boolean(publicDefinition?.fusionOnly),
            sourceMatched: Boolean(publicDefinition),
            defaultAttributes: kind === 'fortune' && Object.keys(attributes).length === 0,
            stats: []
        };
        if (!publicDefinition && kind === 'pickaxe') {
            // CE-only items use DM2 quality ranges while keeping their declared stat identities.
            for (const stat of item?.statTemplates || item?.stats || []) {
                const key = statKey(stat, kind, item);
                const ranges = FORTUNE_RANGES[quality];
                const range = ranges[key === 'dps' ? 'persec' : key] || ranges.fun;
                attributes[key] = {min: range[0], max: range[1]};
            }
        }
        for (const [key, range] of Object.entries(attributes)) {
            if (key === 'click') continue;
            definition.stats.push(makeStat(key, range.min, range, fixedValueFor(kind, item, key, definition)));
        }
        return definition;
    }
    function makeStat(key, value, range = {}, fixedValue) {
        const meta = ATTRIBUTES[key] || [key, key, '+', 'tertiary', false];
        return {
            name: meta[0], displayName: meta[1], indicator: meta[2], isCore: meta[4], value,
            balanceKey: key, category: meta[3], min: range.min, max: range.max,
            ...(fixedValue !== undefined ? {isFixed: true, fixedValue} : {})
        };
    }

    // The round/+1 endpoint behavior is intentional: the public game can roll max + 1.
    function weakRandomInt(min, max, wow = 0, timeline = 1, rng = Math.random) {
        min = number(min, 1); max = number(max, min); wow = Math.max(0, number(wow)); timeline = timelineOf(timeline);
        let low = min, high = max;
        if (wow > 0) {
            if (max === 1) low = high = 1;
            else {
                const exponent = timeline > 10 ? 10 : timeline === 1 ? 2 : timeline;
                const offset = Math.round(Math.log(Math.pow(wow, exponent)) + timeline);
                low += offset; high += offset;
            }
        }
        return Math.max(1, Math.round(rng() * (high - low + 1) + low));
    }
    function randomInt(min, max, wow = 0, timeline = 1, rng = Math.random) {
        min = number(min, 1); max = number(max, min); wow = Math.max(0, number(wow)); timeline = timelineOf(timeline);
        if (wow <= 0) return Math.floor(rng() * (max - min + 1) + min);
        if (max === 1) return Math.round(rng() + 1);
        const shiftTimeline = timeline > 10 ? 10 : timeline === 1 ? 0 : timeline;
        const effectiveTimeline = timeline > 10 ? 20 : timeline;
        const divisor = wow > 900 ? 1 : wow > 500 ? 2 : wow > 400 ? 2.5 : wow > 300 ? 3 : wow > 200 ? 3.5 : wow > 100 ? 5 : 6;
        const offset = 25 * shiftTimeline + Math.floor((30 + effectiveTimeline) * Math.log(Math.pow(wow, 1.2)) / divisor);
        return Math.round(rng() * (max - min + 1) + min + offset);
    }
    function allHelpers(game = {}) {
        return ['helpers', 'moonHelpers', 'marsHelpers', 'jupiterHelpers', 'titanHelpers'].flatMap(key => Array.isArray(game[key]) ? game[key] : []);
    }
    function highestPlanetOf(game = {}) {
        let index = Math.max(planetIndex(game.currentLevel), planetIndex(game.highestPlanet || game.highestLevel || game.maxLevelReached || game.maxlevel));
        for (const planet of Array.from(game.unlockedLevels || [])) index = Math.max(index, planetIndex(planet));
        return PLANETS[index];
    }
    function getTier(game = {}) {
        const highest = planetIndex(highestPlanetOf(game));
        const helpers = allHelpers(game);
        const has = (...types) => helpers.some(helper => types.includes(helper.type) && number(helper.count, 1) > 0);
        if (highest === 4) return has('johnnySilverpaw', 'timeTravelDRex') ? 7 : has('heavyDogeWalker', 'coinSeeker5000') ? 6.5 : 6;
        if (highest === 3) return has('infiniteDogebility') ? 6 : has('dogeStar') ? 5 : has('flyingDoggo') ? 4.5 : 4;
        if (highest === 2) return has('djKittenz') ? 3.5 : 3;
        if (highest === 1) return has('landerShibe') ? 2.5 : 2;
        return has('streamerKittens') ? 1.5 : 1;
    }
    function getRollContext(game = {}, planet = game.currentLevel) {
        return {
            wow: Math.max(0, number(game.playerStats?.wow)), timeline: timelineOf(game.timelineNumber || game.timeline),
            planet: planetName(planet), highestPlanet: highestPlanetOf(game), tier: getTier(game)
        };
    }
    function rollDPC(context = {}, rng = Math.random) {
        const template = context.template || {};
        const definition = getDefinition('pickaxe', template);
        if (template.isPaw || definition.id === 'paw') return 1;
        if (definition.zeroDPC) return 0;
        const maxDPC = Math.max(1, number(context.maxDPC, 1));
        const timeline = timelineOf(context.timeline), wow = Math.max(0, number(context.wow));
        if (timeline === 1 && maxDPC < 3) return 3;
        const rawTier = Math.max(1, Math.min(7, number(context.tier, planetIndex(context.highestPlanet || context.planet) + 1)));
        const tier = Math.floor(rawTier);
        let [min, max] = TIER_BOUNDS[tier - 1];
        if (rawTier !== tier) min += Math.round((max - min) / 2);
        if (!definition.fixed) { min = randomInt(min, min, wow, timeline, rng); max = randomInt(max, max, wow, timeline, rng); }
        const planet = planetIndex(context.planet) + 1, highest = planetIndex(context.highestPlanet || context.planet) + 1;
        if (min > maxDPC && planet !== 1 && highest !== 1) return min;
        const quality = qualityOf(context.rarity === undefined ? definition.quality : context.rarity);
        const multiplier = planet < tier && number(context.dropType, 1) < 2 && timeline !== 1 && planet !== 1 && highest !== 1 ? 1.03 : DPC_MULTIPLIERS[quality];
        let next = Math.ceil(min * multiplier);
        if (next >= max) next = max + Math.ceil(15 * rng() + 1) * multiplier;
        if (next <= maxDPC) next = (maxDPC + Math.ceil(15 * rng() + 1)) * multiplier + timeline * multiplier * 2;
        return Math.round(next);
    }
    function getFixedStatValue(kind, item, stat) {
        const definition = getDefinition(kind, item);
        const key = statKey(stat, kind, item);
        const fixed = fixedValueFor(kind, item, key, definition);
        if (fixed !== undefined) return fixed;
        if (stat?.isFixed || stat?.isFixedNotWow || item?.isSuperFortune || item?.isDiaBadge || item?.isSoulbound) return number(stat?.fixedValue ?? stat?.value);
        return undefined;
    }
    function isFixedStat(kind, item, stat) { return getFixedStatValue(kind, item, stat) !== undefined; }
    function rollStats(kind, template = {}, context = {}, rng = Math.random) {
        const definition = getDefinition(kind, template);
        const attributes = {...definition.attributes};
        if (definition.defaultAttributes) {
            const ranges = FORTUNE_RANGES[definition.quality];
            const locationOffset = [2, 5, 8, 11, 17][planetIndex(context.planet)];
            for (const key of FORTUNE_KEYS[definition.quality]) {
                const range = ranges[key] || ranges.fun;
                const offset = ranges[key] ? locationOffset : 0;
                attributes[key] = {min: range[0] + offset, max: range[1] + offset};
            }
        }
        const primary = [], secondary = [], tertiary = [];
        for (const [key, range] of Object.entries(attributes)) {
            if (key === 'click') continue;
            const fixed = fixedValueFor(kind, template, key, definition);
            const value = fixed !== undefined ? fixed : weakRandomInt(range.min, range.max, context.wow, context.timeline, rng);
            const stat = makeStat(key, value, range, fixed);
            (stat.category === 'primary' ? primary : stat.category === 'secondary' ? secondary : tertiary).push(stat);
        }
        // Preserve declared non-scaling stats even if the normal quality limit is exceeded.
        function trim(stats, limit) {
            while (stats.length > limit) {
                const candidates = stats.map((stat, index) => stat.isFixed ? -1 : index).filter(index => index >= 0);
                if (!candidates.length) break;
                stats.splice(candidates[Math.min(candidates.length - 1, Math.floor(rng() * candidates.length))], 1);
            }
        }
        trim(secondary, SECONDARY_LIMITS[definition.quality]); trim(tertiary, 1);
        return primary.concat(secondary, tertiary);
    }
    function describeOrigin(context, definition) {
        return {...context, rarity: definition.rarity, definitionId: definition.id, sourceMatched: definition.sourceMatched};
    }

    function getFactoryLookup(game = {}) {
        const lookup = {pickaxe: new Map(), fortune: new Map()};
        for (const kind of ['pickaxe', 'fortune']) {
            const factory = kind === 'pickaxe' ? game.pickaxeFactory : game.fortuneFactory;
            for (const [templateId, template] of Object.entries(factory?.templates || {})) {
                const definition = getDefinition(kind, template);
                if (definition.sourceMatched) lookup[kind].set(String(definition.id), {templateId, template, definition});
            }
        }
        return lookup;
    }
    function getBagInfo(game = {}, options = {}) {
        const planet = planetName(options.planet || game.currentLevel);
        const planetNumber = planetIndex(planet) + 1;
        const pools = root.DogeMinerBalanceData?.loot?.['level' + planetNumber] || {};
        const lookup = getFactoryLookup(game);
        const owned = {
            pickaxe: new Set((game.pickaxeInventory || []).map(item => String(getDefinition('pickaxe', item).id))),
            fortune: new Set((game.fortuneInventory || []).map(item => String(getDefinition('fortune', item).id)))
        };
        function candidatesAt(dropType) {
            const pool = pools['bag' + dropType];
            if (!pool) return [];
            const candidates = [];
            for (const [kind, ids, weightPrefix] of [['pickaxe', pool.pickaxes || [], 'picks'], ['fortune', pool.fortunes || [], 'fortunes']]) {
                for (const id of [...ids, ...(root.DogeMinerSeasonal?.ids(game, kind) || [])]) {
                    const mapped = lookup[kind].get(String(id));
                    if (!mapped || owned[kind].has(String(id)) || mapped.definition.fusionOnly) continue;
                    const weight = number(pool.weights?.[weightPrefix + mapped.definition.quality]);
                    candidates.push({kind, type: kind, dm2Id: id, templateId: mapped.templateId, template: mapped.template, quality: mapped.definition.quality, rarity: mapped.definition.rarity, weight, dropType, planet});
                }
            }
            return candidates;
        }
        let dropType = Math.max(0, Math.min(3, Math.floor(number(options.dropType))));
        let candidates = candidatesAt(dropType);
        if (options.dropType === undefined || options.advanceWhenEmpty) {
            while (!candidates.length && dropType < 3) candidates = candidatesAt(++dropType);
        }
        const pool = pools['bag' + dropType];
        return {planet, dropType, candidates, weights: {...(pool?.weights || {})}, empty: candidates.length === 0};
    }
    function getNaturalLootPool(game, options) { return getBagInfo(game, options); }

    const MYSTERY_FORTUNE_IDS = ['reallyscales', 'essence', 'map2', 'redgem', 'yellowgem', 'greengem', 'largegem'];
    // Public DM2 Uw (readable bundle lines 24104–24140). Only reached locations,
    // uniform prize selection, repeat items allowed, and no Luck/Loot weighting.
    function getMysteryLootPool(game = {}, options = {}, rng = Math.random) {
        const highest = planetIndex(highestPlanetOf(game)) + 1;
        const selectedPlanet = options.planet ? planetName(options.planet)
            : PLANETS[(highest > 1 ? Math.round(rng() * (highest - 1) + 1) : 1) - 1];
        const dropType = options.dropType === undefined ? Math.round(3 * rng()) : Math.max(0, Math.min(3, Math.floor(number(options.dropType))));
        const previousKind = options.previousKind || game.mysteryBoxLastKind || 'pickaxe';
        const nextPreviousKind = options.kind || (previousKind === 'pickaxe' ? 'fortune' : rng() > 0.6 ? 'pickaxe' : 'fortune');
        const kind = options.forceFortune ? 'fortune' : nextPreviousKind;
        const pool = root.DogeMinerBalanceData?.loot?.['level' + (planetIndex(selectedPlanet) + 1)]?.['bag' + dropType];
        const ids = [...(pool?.[kind + 's'] || []), ...(root.DogeMinerSeasonal?.ids(game, kind) || []), ...(kind === 'fortune' ? MYSTERY_FORTUNE_IDS : [])];
        const lookup = getFactoryLookup(game);
        const candidates = [];
        for (const id of ids) {
            if (String(id) === 'mysterybox') continue;
            const mapped = lookup[kind]?.get(String(id));
            if (!mapped || mapped.definition.fusionOnly) continue;
            candidates.push({kind, type: kind, dm2Id: id, templateId: mapped.templateId, template: mapped.template,
                quality: mapped.definition.quality, rarity: mapped.definition.rarity, weight: 1, dropType, planet: selectedPlanet});
        }
        return {kind, type: kind, planet: selectedPlanet, dropType, previousKind, nextPreviousKind,
            allowRepeats: true, candidates, weights: candidates.map(() => 1), empty: candidates.length === 0};
    }
    function rollMysteryPrize(game, options = {}, rng = Math.random) {
        const pool = getMysteryLootPool(game, options, rng);
        const candidate = pool.candidates[Math.floor(rng() * pool.candidates.length)] || null;
        return {...pool, candidate};
    }
    // DM2 qw: ten normal opens, then a double open; 20m + 30s per cycle step.
    function getMysteryBoxOpening(game = {}) {
        const saved=Number(game.mysteryBoxCycle);
        const cycle=Number.isInteger(saved)&&saved>=0&&saved<=10?saved:Math.max(0,Math.floor(number(game.mysteryBoxOpenCount)))%11;
        const nextCycle=cycle===10?0:cycle+1;
        return {cycle,nextCycle,rewards:cycle===10?2:1,cooldown:1200000+30000*nextCycle,opensUntilBonus:10-cycle};
    }
    function selectNaturalTemplate(game, kind, options = {}, rng = Math.random) {
        const pool = getNaturalLootPool(game, options);
        const excluded = new Set(options.excludeIds || []);
        const loot = Math.max(1, (1 + number(options.lootFind ?? game?.playerStats?.lootFind) / 100) / 3);
        const luck = Math.max(1, (1 + number(game?.playerStats?.luck) / 100) / 6);
        const candidates = pool.candidates.filter(candidate => candidate.kind === kind && !excluded.has(candidate.templateId));
        const total = candidates.reduce((sum, candidate) => sum + candidate.weight * loot + luck, 0);
        let remaining = rng() * total;
        for (const candidate of candidates) {
            remaining -= candidate.weight * loot + luck;
            if (remaining <= 0) return candidate.templateId;
        }
        return candidates[candidates.length - 1]?.templateId || null;
    }

    root.DogeMinerBalance = Object.freeze({
        VERSION, SOURCE_VERSION: root.DogeMinerBalanceData?.sourceVersion || '2.15.0', PLANETS, RARITIES,
        weakRandomInt, randomInt, rollDPC, getTier, getRollContext, getDefinition, rollStats,
        isFixedStat, getFixedStatValue, statKey, getAttributeMetadata, normalize, planetIndex, planetName, qualityOf, highestPlanetOf, describeOrigin,
        getBagInfo, getNaturalLootPool, getMysteryLootPool, rollMysteryPrize, getMysteryBoxOpening, selectNaturalTemplate
    });
})(typeof window !== 'undefined' ? window : globalThis);
