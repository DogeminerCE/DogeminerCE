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
            'dps', 'helperdps', 'criticalchance', 'higherground', 'spacerocketcosts'
        ]);
        this.loaded = false;
    }

    async loadTemplates() {
        const basePath = 'assets/general/icons/Fortunes';

        // Load standard drop fortunes
        const loadPromises = FORTUNE_MANIFEST.map(folderName =>
            this._loadTemplate(basePath + '/' + encodeURIComponent(folderName), folderName)
                .then(template => {
                    if (template) {
                        const templateId = this._sanitizeId(template.name);
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

        await Promise.all(loadPromises);

        this.loaded = true;
        console.log(`FortuneFactory: Loaded ${Object.keys(this.templates).length} templates.`);
    }

    /**
     * Loads a single fortune template from its folder.
     */
    async _loadTemplate(folderPath, folderName) {
        // Fetch the .txt file (named after the folder)
        const txtPath = `${folderPath}/${encodeURIComponent(folderName)}.txt`;
        let txtContent;
        try {
            const response = await fetch(txtPath);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            txtContent = await response.text();
        } catch (err) {
            console.warn(`Could not fetch ${txtPath}`, err);
            return null;
        }

        // Parse the txt content
        const template = this._parseTxt(txtContent);

        const spriteName = FORTUNE_SPRITES[folderName];
        if (spriteName) {
            template.sprite = `${folderPath}/${spriteName}`;
        } else if (folderName === 'Badge of Patronage') {
            template.sprite = `${folderPath}/patreonbadge.png`;
        } else {
            // Fallback
            template.sprite = 'assets/general/dogecoin_70x70.png';
        }

        template.folderName = folderName;
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
        const template = this.templates[templateId];
        if (!template) return null;

        const instanceId = `fortune_${templateId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        
        // Soulbound fortunes ignore player luck modifiers, passing 0s explicitly
        let stats = [];
        if (templateId === 'badge_of_patronage') {
            stats = [
                { name: 'patronage', displayName: 'Patronage', indicator: '+', isCore: false, value: 100 },
                { name: 'lootfind', displayName: 'Loot Find', indicator: '+%', isCore: true, value: 15 },
                { name: 'luck', displayName: 'Luck', indicator: '+%', isCore: true, value: 15 },
                { name: 'wow', displayName: 'Wow', indicator: '+%', isCore: true, value: 15 }
            ];
        } else {
            const useBaseStats = template.isSoulbound;
            stats = this._rollStats(template.statTemplates, useBaseStats ? 0 : 500, useBaseStats ? 0 : 5000, useBaseStats);
        }

        return {
            instanceId,
            templateId,
            name: template.name,
            rarity: template.rarity,
            description: template.description,
            stats,
            sprite: template.sprite,
            isSoulbound: template.isSoulbound || false
        };
    }

    /**
     * Generates a unique fortune instance from a randomly selected template.
     * @param {number} playerLootFind - The player's Loot Find stat
     * @param {number} playerLuck - The player's Luck stat
     * @param {string} currentPlanet - The current planet (for planet-restricted fortunes)
     * @param {string[]} excludeIds - Template IDs to exclude from the drop pool
     * @returns {Object} A unique fortune instance
     */
    generateFortune(playerLootFind = 0, playerLuck = 0, currentPlanet = 'earth', excludeIds = []) {
        const templateId = this.rollTemplate(playerLootFind, currentPlanet, excludeIds);
        if (!templateId) return null;

        const template = this.templates[templateId];
        if (!template) return null;

        // Generate unique instance ID
        const instanceId = `fortune_${templateId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

        // Roll stats based on Luck + Loot Find (NOT Wow)
        const stats = this._rollStats(template.statTemplates, playerLuck, playerLootFind, false);

        return {
            instanceId,
            templateId,
            name: template.name,
            rarity: template.rarity,
            description: template.description,
            stats,
            sprite: template.sprite
        };
    }

    /**
     * Rolls a random fortune template weighted by rarity and player's Loot Find.
     * Filters out planet-restricted fortunes that don't match the current planet.
     */
    rollTemplate(playerLootFind = 0, currentPlanet = 'earth', excludeIds = []) {
        const planetKey = currentPlanet.toLowerCase();
        const templateIds = Object.keys(this.templates).filter(id => {
            // Exclude explicitly excluded template IDs
            if (excludeIds.includes(id)) return false;
            const template = this.templates[id];
            
            // NEVER natural roll soulbound/special fortunes
            if (template.isSoulbound) return false;

            // If fortune has a planet restriction, only include it on that planet
            if (template.planetRestriction) {
                return template.planetRestriction === planetKey;
            }
            return true; // No restriction, available everywhere
        });
        if (templateIds.length === 0) return null;

        // Rarity weights (higher = rarer)
        const rarityWeights = {
            common: 100,
            improved: 200,
            rare: 500,
            epic: 1000,
            legendary: 2500
        };

        // Build weighted pool
        const weighted = templateIds.map(templateId => {
            const template = this.templates[templateId];
            const baseThreshold = rarityWeights[template.rarity] || 100;
            const effectiveThreshold = baseThreshold / (1 + (playerLootFind / 100));
            const weight = 1000 / effectiveThreshold;
            return { templateId, weight };
        });

        // Weighted random selection
        const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
        let roll = Math.random() * totalWeight;

        for (const entry of weighted) {
            roll -= entry.weight;
            if (roll <= 0) {
                return entry.templateId;
            }
        }

        return weighted[weighted.length - 1].templateId;
    }

    /**
     * Rolls random numerical values for all stats on a fortune.
     * Fortune stats scale with Luck + Loot Find (NOT Wow like pickaxes).
     */
    _rollStats(statTemplates, playerLuck = 0, playerLootFind = 0, useBaseStatsOnly = false) {
        // Combined scaling factor from luck and loot find
        // Use a logarithmic curve to decisively prevent explosive infinite stat loops
        const scaleFactor = useBaseStatsOnly ? 1 : (1 + Math.log2(1 + (playerLuck / 50) + (playerLootFind / 500)));

        return statTemplates.map(st => {
            let value;

            if (st.fixedValue !== null && st.fixedValue !== undefined) {
                value = st.fixedValue;
            } else if (st.indicator === '+%') {
                // Percentage stats: roll 1-25%, scaled by luck+lootFind
                const baseRoll = 1 + Math.random() * 24;
                value = baseRoll * scaleFactor;
                value = Math.round(value * 10) / 10;
            } else if (st.indicator === '+') {
                // Flat additive stats: roll 1-100, scaled by luck+lootFind
                const baseRoll = 1 + Math.floor(Math.random() * 99);
                value = Math.floor(baseRoll * scaleFactor);
            } else if (st.indicator === '-%') {
                // Percentage reduction stats (if not fixed)
                const baseRoll = 1 + Math.floor(Math.random() * 9);
                value = Math.floor(baseRoll * scaleFactor);
            } else if (st.indicator === '-') {
                // Reduction stats: roll 1-50, stored as positive, displayed with -
                const baseRoll = 1 + Math.floor(Math.random() * 49);
                value = Math.floor(baseRoll * scaleFactor);
            }

            // Apply multiplier if present (e.g., Unknown Fortune x4000)
            if (st.multiplier) {
                value = Math.floor(value * st.multiplier);
            }

            return {
                name: st.name,
                displayName: st.displayName,
                indicator: st.indicator,
                isCore: st.isCore,
                value: value
            };
        });
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
// Pre-built list of all fortune folders (standard drop pool).
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
    'Fortune of Günther',
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
    'Fortune of the Ð',
    'Glowing piece of Wood-Gold',
    'Golden Doge Fortune',
    'Golden Mars Fortune',
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
    'A Dogfinity Stone': 'stone1.png',
    'A Pristine Snowflake': 'snow.png',
    'A Wizards Hat': 'wizardhat.png',
    'An empty parchment': 'emptypaper.png',
    'Ancient Munitions Shell': 'shell.png',
    'Ancient Star Chart': 'ancientchart.png',
    'Antique Doge Fortune': 'bronzecoin.png',
    'Book of Memes': 'bookofmemes.png',
    'Broken Record Fortune': 'brokenrecord.png',
    'Bronze Doge Fortune': 'bronze.png',
    'Bronze Mars Fortune': 'bronze.png',
    'Bronze Moon Fortune': 'bronze.png',
    'Cake of Jelly': 'jelly.png',
    'Chunk of Molten Rock': 'chunk.png',
    'Coinminator': 'coinminator.png',
    'Collar of Stone Fortune': 'collar.png',
    'Diamond Doge Fortune': 'diamonddarkcoin.png',
    'Diamond Rocket Fortune': 'diamondrockets.png',
    'Dimensional Ripping Planet Pin': 'goldplanet3.png',
    'Disco Fortune': 'disco.png',
    'Dogefinity Stone': 'stone.png',
    'Dogefinity Stone 2 Electric Bugaloo': 'stone2.png',
    'Emerald Doge Fortune': 'emerald.png',
    'Empty Bottle': 'emptypotion.png',
    'Empty Salt Shaker': 'emptysaltshaker.png',
    'Enchanted Yellow Gem': 'yellowgem.png',
    'Equation Matrix Fortune': 'emcdoge.png',
    'Filled Bottle': 'fullpotion.png',
    'Fortification Fortune': 'dogeshield.png',
    'Fortune of Balance': 'balance.png',
    'Fortune of Blue Flames': 'blueflame.png',
    'Fortune of Cunning': 'shiny.png',
    'Fortune of Derp': 'derp.png',
    'Fortune of Diesel': 'diesel.png',
    'Fortune of Euphoria': 'fedora.png',
    'Fortune of Fast Interwebs': 'cable.png',
    'Fortune of Günther': 'gunther.png',
    'Fortune of Harmony': 'harmony.png',
    'Fortune of Insulation': 'insulation.png',
    'Fortune of Might': 'flaminghammer.png',
    'Fortune of Obedience': 'obedience.png',
    'Fortune of Radiation': 'nuclear.png',
    'Fortune of Rocket Flight': 'shinyrocket.png',
    'Fortune of The Brofist': 'brofist.png',
    'Fortune of Unstoppable Signals': 'signal.png',
    'Fortune of Vengeance': 'rips.png',
    'Fortune of Woof': 'woof.png',
    'Fortune of the AstroDoge': 'nasaicon.png',
    'Fortune of the Baller': 'shades.png',
    'Fortune of the Lion': 'snooplion.png',
    'Fortune of the Pickaxe': 'axes.png',
    'Fortune of the Planet': 'ringplanet.png',
    'Fortune of the Shibe': 'cuteshibe.png',
    'Fortune of the Sweet': 'lollipop.png',
    'Fortune of the Watchers': 'illuminati.png',
    'Fortune of the Ð': 'bigbling.png',
    'Glowing piece of Wood-Gold': 'goldwood.png',
    'Golden Doge Fortune': 'gold.png',
    'Golden Mars Fortune': 'gold.png',
    'Golden Rocket Fortune': 'goldrockets.png',
    'Golden Scales': 'goldscales.png',
    'Harder Scales': 'reallyscales.png',
    'Hero Cape': 'cape.png',
    'Kirk of the Mountain': 'kirk.png',
    'Kitten Tribute Fortune': 'kittens.png',
    'Laser Fortune': 'lasers.png',
    'Magic Golden Bean': 'bean.png',
    'Magic Planet Pin': 'goldplanet1.png',
    'Molten Ball of Lava': 'mball.png',
    'Mysterious Diamond Box': 'diamondmystery.png',
    'Mystery Box': 'mysterybox.png',
    'Mythic DogeDragon Sigil': 'dogedragon.png',
    'Needle Fortune of Healing': 'syringe.png',
    'Old Worn Coin': 'worncoin.png',
    'Party Fortune': 'raveglasses.png',
    'Pencil-size Specialized Drill': 'smalldrill.png',
    'Piece of Candy': 'candy.png',
    'Ring of D-struction': 'ring2.png',
    'Ring of Doge': 'ring.png',
    'Ring of Good Boyes': 'ring3.png',
    'Sagan of the Universe': 'sagan.png',
    'Screaming Man Fortune': 'screaming.png',
    'Silver Doge Fortune': 'silver.png',
    'Silver Mars Fortune': 'silver.png',
    'Silver Moon Fortune': 'silver.png',
    'Snoop Fortune': 'snoop.png',
    'Special Doge Fortune': 'specialdarkcoin.png',
    'Special Non-Gold Bars': 'specialbars.png',
    'Star Doge Fortune': 'olie.png',
    'Stormy Magic Planet Pin': 'goldplanet2.png',
    'Strange Purple Essence': 'essence.png',
    'Supreme Doge Fortune': 'darkcoin.png',
    'The Camera': 'camera.png',
    'Unknown Fortune': 'question.png',
    'Very Golden Doge Fortune': 'goldendarkcoin.png',
    'Very Large Diamond': 'bigdiamond.png',
    'Wizard Robe': 'robe.png'
};
