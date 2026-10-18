// DogeMiner CE - Fortune Factory & Template System
// Handles loading fortune templates from folder-based assets, parsing .txt files,
// and generating unique fortune instances with rarity-weighted drops.

class FortuneFactory {
    constructor() {
        // All parsed fortune templates, keyed by template ID
        this.templates = {};
        // Core stats that affect gameplay (from PlayerStats interface)
        this.coreStats = new Set([
            'luck', 'lootfind', 'wow', 'critchance',
            'dpcmultiplier', 'helperdpsmultiplier', 'rocketcostreduction',
            'dps', 'helperdps', 'criticalchance', 'spacerocketcosts', 'mysterybonus', 'holidayspirit'
        ]);
        this.loaded = false;
    }

    async loadTemplates() {
        this.loadErrors = [];
        const basePath = 'assets/general/icons/Fortunes';

        // Load standard drop fortunes
        const loadPromises = FORTUNE_MANIFEST.map(folderName =>
            this._loadTemplate(basePath + '/' + encodeURIComponent(folderName), folderName)
                .then(template => {
                    if (template) {
                        const templateId = this._sanitizeId(folderName === 'Dogefinity Stone 2 Electric Bugaloo' ? folderName : template.name);
                        template.id = templateId;

                        const nameUpper = template.name.toUpperCase();
                        if (nameUpper.includes('MOON') || nameUpper === 'MYSTERY BOX') {
                            template.planetRestriction = 'moon';
                        } else if (nameUpper.includes('MARS')) {
                            template.planetRestriction = 'mars';
                        } else {
                            template.planetRestriction = null;
                        }
                        this.templates[templateId] = template;
                    }
                })
                .catch(err => {
                    (this.loadErrors ||= []).push(String(err));
                    console.warn(`Failed to load fortune template: ${folderName}`, err);
                })
        );
        
        // Load SPECIAL Patreons/Ko-fi fortunes explicitly
        loadPromises.push(
            this._loadTemplate(basePath + '/Protected Non Seasonal/Badge of Patronage', 'Badge of Patronage')
            .then(template => {
                 if (template) {
                     const templateId = this._sanitizeId(template.name);
                     template.id = templateId;
                     template.planetRestriction = null;
                     template.isSoulbound = true; // Special soulbound flag
                     // Add to templates so it can be generated, but it won't be rolled normally
                     // because it's not in the regular logic
                     this.templates[templateId] = template;
                 }
            })
        );

        loadPromises.push(
            this._loadTemplate(basePath + '/Protected Non Seasonal/Super Fortune', 'Super Fortune')
            .then(template => {
                 if (template) {
                     const templateId = 'super_fortune';
                     template.id = templateId;
                     template.planetRestriction = null;
                     template.isSuperFortune = true;
                     template.isProtected = true;
                     this.templates[templateId] = template;
                 }
            })
        );

        await Promise.all(loadPromises);

        window.DogeMinerSeasonal?.installTemplates('fortune', this);
        this.loaded = true;
        console.log(`FortuneFactory: Loaded ${Object.keys(this.templates).length} templates.`);
    }

    /**
     * Loads a single fortune template from its folder.
     */
    async _loadTemplate(folderPath, folderName) {
        // Fetch the .txt file (named after the folder)
        const dataFiles = {
            'Filled Bottle': 'Filled Potion',
            'Ancient Munitions Shell': 'Ancient Munititons Shell',
            'Dogefinity Stone 2 Electric Bugaloo': 'A Dogfinity Stone',
            'Silver Mars Fortune': 'Silver Moon Fortune'
        };
        const dataFile = dataFiles[folderName] || folderName;
        const txtPath = `${folderPath}/${encodeURIComponent(dataFile)}.txt`;
        let txtContent;
        try {
            const response = await fetch(txtPath);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            txtContent = await response.text();
        } catch (err) {
            console.warn(`Could not fetch ${txtPath}`, err);
            (this.loadErrors ||= []).push(txtPath);
            return null;
        }

        // Parse the txt content
        const template = this._parseTxt(txtContent);
        if (!template.name) { (this.loadErrors ||= []).push(txtPath); return null; }

        const spriteName = FORTUNE_SPRITES[folderName];
        if (spriteName) {
            template.sprite = `${folderPath}/${spriteName}`;
        } else if (folderName === 'Badge of Patronage') {
            template.sprite = `${folderPath}/patreonbadge.webp`;
        } else {
            // Fallback
            template.sprite = 'assets/general/dogecoin_70x70.webp';
        }

        template.folderName = folderName;
        if (window.DogeMinerBalance) {
            const definition = window.DogeMinerBalance.getDefinition('fortune', template);
            template.balanceDefinitionId = definition.id;
            template.balanceSourceMatched = definition.sourceMatched;
            template.rarity = definition.rarity;
        }
        return template;
    }

    /**
     * Parses a fortune data.txt file.
     * Format:
     *   NAME:
     *   Fortune of Balance
     *
     *   RARITY:
     *   Improved
     *
     *   DESCRIPTION:
     *   A mysterious artifact imbued with some kind of magical power.
     *
     *   STATS:
     *   +% Loot Find
     *   - Sadness
     */
    _parseTxt(content) {
        const template = {
            name: '',
            rarity: 'common',
            description: '',
            statTemplates: []
        };

        // Normalize line endings and remove BOM
        const lines = content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

        let currentSection = null;
        let foundStats = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Section headers (without quotes, unlike pickaxes)
            if (line.toUpperCase() === 'NAME:') {
                currentSection = 'name';
                continue;
            } else if (line.toUpperCase() === 'RARITY:' && !foundStats) {
                currentSection = 'rarity';
                continue;
            } else if (line.toUpperCase() === 'DESCRIPTION:') {
                currentSection = 'description';
                continue;
            } else if (line.toUpperCase() === 'STATS:' || line.toUpperCase() === 'STAT:') {
                currentSection = 'stats';
                foundStats = true;
                continue;
            }

            // Skip empty lines between sections
            if (line === '' && currentSection !== 'stats') {
                currentSection = null;
                continue;
            }
            if (line === '' && currentSection === 'stats') {
                continue;
            }

            // Parse content based on current section
            switch (currentSection) {
                case 'name':
                    template.name = line;
                    currentSection = null;
                    break;

                case 'rarity':
                    template.rarity = line.toLowerCase();
                    currentSection = null;
                    break;

                case 'description':
                    template.description = line;
                    currentSection = null;
                    break;

                case 'stats':
                    // Check for multiplier modifier lines: ^ x4000 (Multiply base by 4000)
                    const multiplierMatch = line.match(/^\^\s*x(\d+)/i);
                    if (multiplierMatch && template.statTemplates.length > 0) {
                        // Apply multiplier to the last parsed stat
                        template.statTemplates[template.statTemplates.length - 1].multiplier = parseInt(multiplierMatch[1], 10);
                        break;
                    }
                    // Parse stat lines like "+% Luck", "+ DPS", "- Sadness"
                    const statParsed = this._parseStatLine(line);
                    if (statParsed) {
                        template.statTemplates.push(statParsed);
                    }
                    break;
            }
        }

        return template;
    }

    /**
     * Parses a single stat line like "+% Luck", "+ DPS", "- Sadness"
     * Returns { name, displayName, indicator, isCore }
     */
    _parseStatLine(line) {
        let indicator, statName;

        // Check for fixed numeric values: "+10% DPS", "+1 Defuse Kit", or "-5% Rocket Costs"
        const fixedPercentMatch = line.match(/^\+(\d+)%\s+(.+)$/);
        const fixedMinusPercentMatch = line.match(/^\-(\d+)%\s+(.+)$/);
        const fixedFlatMatch = line.match(/^\+(\d+)\s+(.+)$/);

        let fixedValue = null;

        if (fixedPercentMatch) {
            indicator = '+%';
            statName = fixedPercentMatch[2].trim();
            fixedValue = parseInt(fixedPercentMatch[1], 10);
        } else if (fixedMinusPercentMatch) {
            indicator = '-%';
            statName = fixedMinusPercentMatch[2].trim();
            fixedValue = parseInt(fixedMinusPercentMatch[1], 10);
        } else if (fixedFlatMatch) {
            indicator = '+';
            statName = fixedFlatMatch[2].trim();
            fixedValue = parseInt(fixedFlatMatch[1], 10);
        } else if (line.startsWith('+%')) {
            indicator = '+%';
            statName = line.substring(2).trim();
        } else if (line.startsWith('-%')) {
            indicator = '-%';
            statName = line.substring(2).trim();
        } else if (line.startsWith('+')) {
            indicator = '+';
            statName = line.substring(1).trim();
        } else if (line.startsWith('-')) {
            indicator = '-';
            statName = line.substring(1).trim();
        } else {
            // Non-stat line (e.g., "This fortune copies every stat...")
            return null;
        }

        if (!statName) return null;

        // Normalize stat name for core checking
        const normalizedName = statName.toLowerCase().replace(/\s+/g, '');
        const isCore = this.coreStats.has(normalizedName);

        // Core mappings
        if (normalizedName === 'spacerocketcosts') {
            // Internally handled essentially the same as rocketcostreduction,
            // but mapped correctly for user display. 
        }

        return {
            name: normalizedName,
            displayName: statName,
            indicator,
            isCore,
            fixedValue
        };
    }

    /**
     * Bypasses RNG drops and spawns an explicit template ID.
     */
    generateSpecialFortune(templateId) {
        return this.generateFromTemplate(templateId, window.DogeMinerBalance.getRollContext(window.game || {}));
    }

    /** Legacy selection signature; Luck/Loot Find affect selection, never stat magnitude. */
    generateFortune(playerLootFind = 0, playerLuck = 0, currentPlanet = 'earth', excludeIds = [], rollContext = null) {
        const templateId = this.rollTemplate(playerLootFind, currentPlanet, excludeIds);
        return templateId ? this.generateFromTemplate(templateId, {...window.DogeMinerBalance.getRollContext(window.game || {}, currentPlanet), ...(rollContext || {})}) : null;
    }

    /** Generate a selected natural/Mystery Box prize using the shared numerical rules. */
    generateFromTemplate(templateId, rollContext = null, rng = Math.random) {
        const template = this.templates[templateId];
        if (!template) return null;
        const balance = window.DogeMinerBalance;
        if (!balance) throw new Error('DM2 balance rules must load before FortuneFactory.');
        const context = {...balance.getRollContext(window.game || {}), ...(rollContext || {})};
        const definition = balance.getDefinition('fortune', template);
        return {
            instanceId: `fortune_${templateId}_${Date.now()}_${Math.floor(rng() * 10000)}`,
            templateId, name: template.name, rarity: definition.rarity, description: template.description,
            stats: balance.rollStats('fortune', template, context, rng), sprite: template.sprite,
            planetOfOrigin: context.planet, isSoulbound: Boolean(template.isSoulbound),
            isProtected: Boolean(template.isProtected || definition.protected),
            isSuperFortune: Boolean(template.isSuperFortune),
            balanceVersion: balance.VERSION, balanceDefinitionId: definition.id,
            balanceOrigin: balance.describeOrigin(context, definition)
        };
    }

    /**
     * Rolls a random fortune template weighted by rarity and player's Loot Find.
     * Filters out planet-restricted fortunes that don't match the current planet.
     */
    rollTemplate(playerLootFind = 0, currentPlanet = 'earth', excludeIds = []) {
        const game = {...(window.game || {}), fortuneFactory: this};
        return window.DogeMinerBalance.selectNaturalTemplate(game, 'fortune', {planet: currentPlanet, lootFind: playerLootFind, excludeIds});
    }

    /** Compatibility adapter: old Luck/Loot parameters no longer change fortune stats. */
    _rollStats(statTemplates, playerLuck = 0, playerLootFind = 0, useBaseStatsOnly = false, template = null, rollContext = null, rng = Math.random) {
        const balance = window.DogeMinerBalance;
        const context = {...balance.getRollContext(window.game || {}), ...(rollContext || {})};
        return balance.rollStats('fortune', template || Object.values(this.templates).find(candidate => candidate.statTemplates === statTemplates) || {statTemplates, isSoulbound: useBaseStatsOnly}, context, rng);
    }

    formatStatForDisplay(stat) {
        if (stat.indicator === '+%') {
            return `+${stat.value}% ${stat.displayName}`;
        } else if (stat.indicator === '+') {
            return `+${stat.value} ${stat.displayName}`;
        } else if (stat.indicator === '-%') {
            return `-${stat.value}% ${stat.displayName}`;
        } else if (stat.indicator === '-') {
            return `-${stat.value} ${stat.displayName}`;
        }
        return `${stat.value} ${stat.displayName}`;
    }

    /**
     * Sanitizes a name into a valid ID string
     */
    _sanitizeId(name) {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    }
}

// ============================================================
// FORTUNE MANIFEST
// Loaded standard and Mystery-only folders; source pools govern eligibility.
// Protected and Seasonal fortunes are excluded.
// ============================================================

const FORTUNE_MANIFEST = [
    'A Dogfinity Stone',
    'A Pristine Snowflake',
    'A Wizards Hat',
    'An empty parchment',
    'Ancient Munitions Shell',
    'Ancient Star Chart',
    'Antique Doge Fortune',
    'Book of Memes',
    'Broken Record Fortune',
    'Bronze Doge Fortune',
    'Bronze Mars Fortune',
    'Bronze Moon Fortune',
    'Cake of Jelly',
    'Chunk of Molten Rock',
    'Coinminator',
    'Collar of Stone Fortune',
    'Diamond Doge Fortune',
    'Diamond Rocket Fortune',
    'Dimensional Ripping Planet Pin',
    'Disco Fortune',
    'Dogefinity Stone',
    'Dogefinity Stone 2 Electric Bugaloo',
    'Emerald Doge Fortune',
    'Empty Bottle',
    'Empty Salt Shaker',
    'Dogecoin Mining Site Map',
    'Enchanted Red Gem',
    'Enchanted Green Gem',
    'Huge Enchanted Green Gem',
    'Enchanted Yellow Gem',
    'Equation Matrix Fortune',
    'Filled Bottle',
    'Fortification Fortune',
    'Fortune of Balance',
    'Fortune of Blue Flames',
    'Fortune of Cunning',
    'Fortune of Derp',
    'Fortune of Diesel',
    'Fortune of Euphoria',
    'Fortune of Fast Interwebs',
    'Fortune of Gunther',
    'Fortune of Harmony',
    'Fortune of Insulation',
    'Fortune of Might',
    'Fortune of Obedience',
    'Fortune of Radiation',
    'Fortune of Rocket Flight',
    'Fortune of The Brofist',
    'Fortune of Unstoppable Signals',
    'Fortune of Vengeance',
    'Fortune of Woof',
    'Fortune of the AstroDoge',
    'Fortune of the Baller',
    'Fortune of the Lion',
    'Fortune of the Pickaxe',
    'Fortune of the Planet',
    'Fortune of the Shibe',
    'Fortune of the Sweet',
    'Fortune of the Watchers',
    'Fortune of the D',
    'Glowing piece of Wood-Gold',
    'Golden Doge Fortune',
    'Golden Mars Fortune',
    'Golden Moon Fortune',
    'Golden Rocket Fortune',
    'Golden Scales',
    'Harder Scales',
    'Hero Cape',
    'Kirk of the Mountain',
    'Kitten Tribute Fortune',
    'Laser Fortune',
    'Magic Golden Bean',
    'Magic Planet Pin',
    'Molten Ball of Lava',
    'Mysterious Diamond Box',
    'Mystery Box',
    'Mythic DogeDragon Sigil',
    'Needle Fortune of Healing',
    'Old Worn Coin',
    'Party Fortune',
    'Pencil-size Specialized Drill',
    'Piece of Candy',
    'Ring of D-struction',
    'Ring of Doge',
    'Ring of Good Boyes',
    'Sagan of the Universe',
    'Screaming Man Fortune',
    'Silver Doge Fortune',
    'Silver Mars Fortune',
    'Silver Moon Fortune',
    'Snoop Fortune',
    'Special Doge Fortune',
    'Special Non-Gold Bars',
    'Star Doge Fortune',
    'Stormy Magic Planet Pin',
    'Strange Purple Essence',
    'Supreme Doge Fortune',
    'The Camera',
    'Unknown Fortune',
    'Very Golden Doge Fortune',
    'Very Large Diamond',
    'Wizard Robe'
];

// ============================================================
// FORTUNE SPRITES
// Maps fortune folder names to their sprite filenames.
// ============================================================

const FORTUNE_SPRITES = {
    'A Dogfinity Stone': 'stone1.webp',
    'A Pristine Snowflake': 'snow.webp',
    'A Wizards Hat': 'wizardhat.webp',
    'An empty parchment': 'emptypaper.webp',
    'Ancient Munitions Shell': 'shell.webp',
    'Ancient Star Chart': 'ancientchart.webp',
    'Antique Doge Fortune': 'bronzecoin.webp',
    'Book of Memes': 'bookofmemes.webp',
    'Broken Record Fortune': 'brokenrecord.webp',
    'Bronze Doge Fortune': 'bronze.webp',
    'Bronze Mars Fortune': 'bronze.webp',
    'Bronze Moon Fortune': 'bronze.webp',
    'Cake of Jelly': 'jelly.webp',
    'Chunk of Molten Rock': 'chunk.webp',
    'Coinminator': 'coinminator.webp',
    'Collar of Stone Fortune': 'collar.webp',
    'Diamond Doge Fortune': 'diamonddarkcoin.webp',
    'Diamond Rocket Fortune': 'diamondrockets.webp',
    'Dimensional Ripping Planet Pin': 'goldplanet3.webp',
    'Disco Fortune': 'disco.webp',
    'Dogefinity Stone': 'stone.webp',
    'Dogefinity Stone 2 Electric Bugaloo': 'stone2.webp',
    'Emerald Doge Fortune': 'emerald.webp',
    'Empty Bottle': 'emptypotion.webp',
    'Empty Salt Shaker': 'emptysaltshaker.webp',
    'Dogecoin Mining Site Map': 'map2.webp',
    'Enchanted Red Gem': 'redgem.webp',
    'Enchanted Green Gem': 'greengem.webp',
    'Huge Enchanted Green Gem': 'largegem.webp',
    'Enchanted Yellow Gem': 'yellowgem.webp',
    'Equation Matrix Fortune': 'emcdoge.webp',
    'Filled Bottle': 'fullpotion.webp',
    'Fortification Fortune': 'dogeshield.webp',
    'Fortune of Balance': 'balance.webp',
    'Fortune of Blue Flames': 'blueflame.webp',
    'Fortune of Cunning': 'shiny.webp',
    'Fortune of Derp': 'derp.webp',
    'Fortune of Diesel': 'diesel.webp',
    'Fortune of Euphoria': 'fedora.webp',
    'Fortune of Fast Interwebs': 'cable.webp',
    'Fortune of Gunther': 'gunther.webp',
    'Fortune of Harmony': 'harmony.webp',
    'Fortune of Insulation': 'insulation.webp',
    'Fortune of Might': 'flaminghammer.webp',
    'Fortune of Obedience': 'obedience.webp',
    'Fortune of Radiation': 'nuclear.webp',
    'Fortune of Rocket Flight': 'shinyrocket.webp',
    'Fortune of The Brofist': 'brofist.webp',
    'Fortune of Unstoppable Signals': 'signal.webp',
    'Fortune of Vengeance': 'rips.webp',
    'Fortune of Woof': 'woof.webp',
    'Fortune of the AstroDoge': 'nasaicon.webp',
    'Fortune of the Baller': 'shades.webp',
    'Fortune of the Lion': 'snooplion.webp',
    'Fortune of the Pickaxe': 'axes.webp',
    'Fortune of the Planet': 'ringplanet.webp',
    'Fortune of the Shibe': 'cuteshibe.webp',
    'Fortune of the Sweet': 'lollipop.webp',
    'Fortune of the Watchers': 'illuminati.webp',
    'Fortune of the D': 'bigbling.webp',
    'Glowing piece of Wood-Gold': 'goldwood.webp',
    'Golden Doge Fortune': 'gold.webp',
    'Golden Mars Fortune': 'gold.webp',
    'Golden Moon Fortune': 'gold.webp',
    'Golden Rocket Fortune': 'goldrockets.webp',
    'Golden Scales': 'goldscales.webp',
    'Harder Scales': 'reallyscales.webp',
    'Hero Cape': 'cape.webp',
    'Kirk of the Mountain': 'kirk.webp',
    'Kitten Tribute Fortune': 'kittens.webp',
    'Laser Fortune': 'lasers.webp',
    'Magic Golden Bean': 'bean.webp',
    'Magic Planet Pin': 'goldplanet1.webp',
    'Molten Ball of Lava': 'mball.webp',
    'Mysterious Diamond Box': 'diamondmystery.webp',
    'Mystery Box': 'mysterybox.webp',
    'Mythic DogeDragon Sigil': 'dogedragon.webp',
    'Needle Fortune of Healing': 'syringe.webp',
    'Old Worn Coin': 'worncoin.webp',
    'Party Fortune': 'raveglasses.webp',
    'Pencil-size Specialized Drill': 'smalldrill.webp',
    'Piece of Candy': 'candy.webp',
    'Ring of D-struction': 'ring2.webp',
    'Ring of Doge': 'ring.webp',
    'Ring of Good Boyes': 'ring3.webp',
    'Sagan of the Universe': 'sagan.webp',
    'Screaming Man Fortune': 'screaming.webp',
    'Silver Doge Fortune': 'silver.webp',
    'Silver Mars Fortune': 'silver.webp',
    'Silver Moon Fortune': 'silver.webp',
    'Snoop Fortune': 'snoop.webp',
    'Special Doge Fortune': 'specialdarkcoin.webp',
    'Special Non-Gold Bars': 'specialbars.webp',
    'Star Doge Fortune': 'olie.webp',
    'Stormy Magic Planet Pin': 'goldplanet2.webp',
    'Strange Purple Essence': 'essence.webp',
    'Supreme Doge Fortune': 'darkcoin.webp',
    'The Camera': 'camera.webp',
    'Unknown Fortune': 'question.webp',
    'Very Golden Doge Fortune': 'goldendarkcoin.webp',
    'Very Large Diamond': 'bigdiamond.webp',
    'Wizard Robe': 'robe.webp'
};
