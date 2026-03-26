// DogeMiner CE - Pickaxe Factory & Template System
// Handles loading pickaxe templates from folder-based assets, parsing data.txt files,
// and generating unique pickaxe instances with the linear progression system.

class PickaxeFactory {
    constructor() {
        // All parsed pickaxe templates, keyed by template ID (folder path)
        this.templates = {};
        // Templates grouped by planet for drop pool selection
        this.templatesByPlanet = {
            earth: [],
            moon: [],
            mars: [],
            jupiter: [],
            titan: [],
            universal: []
        };
        // Core stats that affect gameplay (from PlayerStats interface)
        this.coreStats = new Set([
            'luck', 'lootfind', 'wow', 'critchance',
            'dpcmultiplier', 'helperdpsmultiplier', 'rocketcostreduction',
            'dps', 'higherground'
        ]);
        this.loaded = false;
        // Set of template IDs that have active (-use.png) sprites
        this.templatesWithActiveSprite = new Set();
    }

    /**
     * Loads all pickaxe templates from the folder structure.
     * Scans /assets/items/pickaxes/{Planet}/{PickaxeName}/ directories.
     */
    async loadTemplates() {
        const planets = ['Earth', 'Moon', 'Mars', 'Jupiter', 'Titan', 'Universal'];
        const basePath = 'assets/items/pickaxes';

        for (const planet of planets) {
            const planetKey = planet.toLowerCase();
            try {
                // Fetch the planet directory listing
                const pickaxeFolders = await this._fetchDirectoryListing(basePath, planet);

                const folderPromises = pickaxeFolders.map(folder =>
                    this._loadTemplate(basePath, planet, folder)
                        .then(template => {
                            if (template) {
                                const templateId = `${planetKey}_${this._sanitizeId(template.name)}`;
                                template.id = templateId;
                                template.planetOfOrigin = planetKey;
                                this.templates[templateId] = template;
                                this.templatesByPlanet[planetKey].push(templateId);
                            }
                        })
                        .catch(err => {
                            console.warn(`Failed to load pickaxe template: ${planet}/${folder}`, err);
                        })
                );
                await Promise.all(folderPromises);
            } catch (err) {
                console.warn(`Failed to scan pickaxe planet folder: ${planet}`, err);
            }
        }

        this.loaded = true;
        this._buildActiveSpriteSet();
        console.log(`PickaxeFactory: Loaded ${Object.keys(this.templates).length} templates across ${planets.length} planets.`);
    }

    /**
     * Fetches the list of subdirectories in a planet folder.
     * Since we can't do real directory listings in a static server,
     * we use a manifest approach - scanning known folders.
     */
    async _fetchDirectoryListing(basePath, planet) {
        // We need a manifest of pickaxe folders. We'll build this from a pre-generated list.
        // This is populated by scanPickaxeFolders() which reads from the known folder structure.
        return PICKAXE_MANIFEST[planet] || [];
    }

    /**
     * Loads a single pickaxe template from its folder.
     */
    async _loadTemplate(basePath, planet, folderName) {
        const folderPath = `${basePath}/${planet}/${folderName}`;

        // Find the .txt file (named after the folder)
        const txtPath = `${folderPath}/${folderName}.txt`;
        let txtContent;
        try {
            const response = await fetch(txtPath);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            txtContent = await response.text();
        } catch (err) {
            console.warn(`Could not fetch ${txtPath}, trying alternate names...`, err);
            // Some files have slightly different names, try fetching any .txt
            return null;
        }

        // Parse the txt content
        const template = this._parseTxt(txtContent);

        // Find the sprite (the .png file in the folder)
        // We'll try the known sprite names from our manifest
        const spriteName = PICKAXE_SPRITES[`${planet}/${folderName}`];
        if (spriteName) {
            template.idleSprite = `${folderPath}/${spriteName}`;
        } else {
            // Fallback: guess common names
            template.idleSprite = `${folderPath}/${folderName.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`;
        }

        template.folderPath = folderPath;
        return template;
    }

    /**
     * Parses a pickaxe data.txt file.
     * Format:
     *   "NAME"
     *   Normal Pickaxe
     *   
     *   "RARITY"
     *   Common
     *   
     *   "DESCRIPTION"
     *   Normal yet faithful.
     *   
     *   "STATS"
     *   +% Luck
     *   + Discipline
     *   - Sadness
     */
    _parseTxt(content) {
        const template = {
            name: '',
            rarity: 'common',
            description: '',
            statTemplates: [],
            specialInstructions: '',
            isStaffOfSundoge: false,
            zeroDPC: false
        };

        // Normalize line endings
        const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

        let currentSection = null;
        let descriptionLines = [];
        let statsStarted = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Section headers
            if (line === '"NAME"') {
                currentSection = 'name';
                continue;
            } else if (line === '"RARITY"') {
                currentSection = 'rarity';
                continue;
            } else if (line === '"DESCRIPTION"') {
                currentSection = 'description';
                descriptionLines = [];
                continue;
            } else if (line === '"STATS"') {
                currentSection = 'stats';
                statsStarted = true;
                continue;
            }

            // Skip empty lines between sections (but not within description)
            if (line === '' && currentSection !== 'description') {
                if (currentSection === 'stats') {
                    // Empty line in stats section is okay, just skip
                    continue;
                }
                currentSection = null;
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
                    if (line === '') {
                        // End of description
                        template.description = descriptionLines.join(' ');
                        currentSection = null;
                    } else {
                        descriptionLines.push(line);
                    }
                    break;

                case 'stats':
                    // Parse stat lines like "+% Luck", "+ Discipline", "- Sadness"
                    // Also handle special cases like "+1 Defuse Kit", "+10% DPS"
                    const statParsed = this._parseStatLine(line);
                    if (statParsed) {
                        template.statTemplates.push(statParsed);
                    }
                    break;

                default:
                    // Lines outside of sections - could be special instructions
                    // Check for stat-like lines without a STATS header (some files miss it)
                    if (!statsStarted && (line.startsWith('+') || line.startsWith('-'))) {
                        const statParsed = this._parseStatLine(line);
                        if (statParsed) {
                            template.statTemplates.push(statParsed);
                        }
                    } else if (line.startsWith('*')) {
                        // Special instructions (e.g., Staff of Sundoge)
                        template.specialInstructions += line + ' ';
                        if (line.includes('0 DOGE PER CLICK') || line.includes('0 DPC')) {
                            template.zeroDPC = true;
                            template.isStaffOfSundoge = true;
                        }
                    }
                    break;
            }
        }

        // Handle description that wasn't terminated by empty line
        if (descriptionLines.length > 0 && !template.description) {
            template.description = descriptionLines.join(' ');
        }

        return template;
    }

    /**
     * Parses a single stat line like "+% Luck", "+ Discipline", "- Sadness"
     * Returns { name, displayName, indicator, isCore, fixedValue? }
     */
    _parseStatLine(line) {
        // Match patterns: "+% StatName", "+ StatName", "- StatName"
        // Also: "+10% DPS", "+1 Defuse Kit"
        // Also handle modifiers like "(5*Calculated value)"
        let indicator, statName, fixedValue = null, multiplier = null;

        // Check for fixed numeric values: "+10% DPS" or "+1 Defuse Kit"
        const fixedPercentMatch = line.match(/^\+(\d+)%\s+(.+)$/);
        const fixedFlatMatch = line.match(/^\+(\d+)\s+(.+)$/);

        if (fixedPercentMatch) {
            indicator = '+%';
            fixedValue = parseFloat(fixedPercentMatch[1]) / 100;
            statName = fixedPercentMatch[2].trim();
        } else if (fixedFlatMatch) {
            indicator = '+';
            fixedValue = parseInt(fixedFlatMatch[1], 10);
            statName = fixedFlatMatch[2].trim();
        } else if (line.startsWith('+%')) {
            indicator = '+%';
            statName = line.substring(2).trim();
        } else if (line.startsWith('+')) {
            indicator = '+';
            statName = line.substring(1).trim();
        } else if (line.startsWith('-')) {
            indicator = '-';
            statName = line.substring(1).trim();
        } else {
            return null;
        }

        if (!statName) return null;

        // Check for multiplier modifiers like "(5*Calculated value)"
        const multiplierMatch = statName.match(/\((\d+)\*Calculated value\)/i);
        if (multiplierMatch) {
            multiplier = parseInt(multiplierMatch[1], 10);
            statName = statName.replace(/\s*\(\d+\*Calculated value\)/i, '').trim();
        }

        // Check for fixed-not-wow note
        const isFixedNotWow = line.includes('(Fixed, not affected by Wow)');
        if (isFixedNotWow) {
            statName = statName.replace(/\s*\(Fixed, not affected by Wow\)/i, '').trim();
        }

        // Normalize stat name for core checking
        const normalizedName = statName.toLowerCase().replace(/\s+/g, '');
        const isCore = this.coreStats.has(normalizedName);

        return {
            name: normalizedName,
            displayName: statName,
            indicator,
            isCore,
            fixedValue,
            multiplier,
            isFixedNotWow
        };
    }

    /**
     * Generates a unique pickaxe instance from a template.
     * Uses the linear progression system: NewDPC = CurrentMaxDPC * 1.15
     * 
     * @param {string} templateId - The template to generate from
     * @param {number} currentMaxDPC - The player's current highest pickaxe DPC
     * @param {number} playerWow - The player's current Wow stat (affects stat rolls)
     * @returns {Object} A unique pickaxe instance
     */
    generatePickaxe(templateId, currentMaxDPC, playerWow = 0) {
        const template = this.templates[templateId];
        if (!template) {
            console.error(`Unknown pickaxe template: ${templateId}`);
            return null;
        }

        // Calculate DPC using linear progression
        let baseDPC;
        if (template.zeroDPC) {
            baseDPC = 0;
        } else {
            // Apply a base exponential multiplier and a healthy flat additive boost
            const multiplier = 1.15 + (Math.random() * 0.15); // 1.15x to 1.30x
            const flatBoost = 3 + Math.floor(Math.random() * 8); // +3 to +10 flat
            
            baseDPC = Math.floor((currentMaxDPC * multiplier) + flatBoost);

            // Scale heavily by the rarity of the roll to make rare drops wildly exciting
            const rarityScales = {
                common: 1.0,
                improved: 1.3,
                rare: 1.8,
                epic: 2.5,
                legendary: 4.0
            };
            const rScale = rarityScales[template.rarity] || 1.0;
            
            baseDPC = Math.floor(baseDPC * rScale);

            // Ensure it's always an upgrade (at least +1)
            if (baseDPC <= currentMaxDPC && currentMaxDPC > 0) {
                baseDPC = currentMaxDPC + 1;
            }
        }

        // Generate unique instance ID
        const instanceId = `${templateId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

        // Roll stats
        const stats = this._rollStats(template.statTemplates, playerWow);

        return {
            instanceId,
            templateId,
            name: template.name,
            rarity: template.rarity,
            description: template.description,
            planetOfOrigin: template.planetOfOrigin,
            baseDPC,
            stats,
            idleSprite: template.idleSprite,
            isStaffOfSundoge: template.isStaffOfSundoge,
            specialInstructions: template.specialInstructions
        };
    }

    /**
     * Rolls random numerical values for all stats on a pickaxe.
     * Core stats affect gameplay; cosmetic stats are for flavor.
     * 
     * @param {Array} statTemplates - The stat templates from the txt file
     * @param {number} playerWow - Player's Wow stat for scaling
     * @returns {Array} Array of { name, displayName, indicator, isCore, value }
     */
    _rollStats(statTemplates, playerWow) {
        return statTemplates.map(st => {
            let value;

            if (st.fixedValue !== null && st.fixedValue !== undefined) {
                // Fixed value stats (e.g., "+10% DPS") - not affected by Wow
                value = st.fixedValue;
            } else if (st.isFixedNotWow) {
                // Explicitly marked as not affected by Wow
                value = st.fixedValue || 0.1;
            } else {
                // Roll a random value based on indicator type
                if (st.indicator === '+%') {
                    // Percentage stats: roll 1-25%, scaled logarithmically by Wow
                    const baseRoll = 1 + Math.random() * 24;
                    value = baseRoll * (1 + Math.random() * Math.log2(1 + (playerWow || 0) / 10));
                    value = Math.round(value * 10) / 10; // Round to 1 decimal
                } else if (st.indicator === '+') {
                    // Flat additive stats: roll 1-100, scaled logarithmically by Wow
                    const baseRoll = 1 + Math.floor(Math.random() * 99);
                    value = Math.floor(baseRoll * (1 + Math.random() * Math.log2(1 + (playerWow || 0) / 10)));
                } else if (st.indicator === '-') {
                    // Reduction stats: roll 1-50 (stored as positive, displayed with -)
                    const baseRoll = 1 + Math.floor(Math.random() * 49);
                    value = Math.floor(baseRoll * (1 + Math.random() * Math.log2(1 + (playerWow || 0) / 10)));
                }

                // Apply multiplier if present (e.g., "5*Calculated value")
                if (st.multiplier) {
                    value *= st.multiplier;
                }
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

    /**
     * Gets the drop pool for a specific planet.
     * Includes that planet's pickaxes + Universal pickaxes.
     */
    getDropPool(planet) {
        const planetKey = planet.toLowerCase();
        const pool = [...(this.templatesByPlanet[planetKey] || [])];
        // Always include Universal pickaxes
        if (planetKey !== 'universal') {
            pool.push(...(this.templatesByPlanet.universal || []));
        }
        return pool;
    }

    /**
     * Rolls a random pickaxe template from a planet's drop pool,
     * weighted by rarity and player's Loot Find stat.
     */
    rollTemplate(planet, playerLootFind = 0) {
        const pool = this.getDropPool(planet);
        if (pool.length === 0) return null;

        // Rarity weights (higher = rarer)
        const rarityWeights = {
            common: 100,
            improved: 200,
            rare: 500,
            epic: 1000,
            legendary: 2500
        };

        // Build weighted pool: lower effective threshold = more likely
        const weighted = pool.map(templateId => {
            const template = this.templates[templateId];
            const baseThreshold = rarityWeights[template.rarity] || 100;
            // Loot Find reduces threshold, making rarer items more accessible
            const effectiveThreshold = baseThreshold / (1 + (playerLootFind / 100));
            // Convert to probability weight (inverse of threshold)
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

        // Fallback to last entry
        return weighted[weighted.length - 1].templateId;
    }

    /**
     * Formats a stat for display in the UI.
     * e.g., { indicator: '+%', value: 15.5, displayName: 'Luck' } → "+15.5% Luck"
     * e.g., { indicator: '-', value: 20, displayName: 'Sadness' } → "-20 Sadness"
     */
    formatStatForDisplay(stat) {
        if (stat.indicator === '+%') {
            return `+${stat.value}% ${stat.displayName}`;
        } else if (stat.indicator === '+') {
            return `+${stat.value} ${stat.displayName}`;
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

    /**
     * Builds the set of template IDs that have active sprites.
     * Active sprites follow the pattern: idle_sprite_name-use.png
     */
    _buildActiveSpriteSet() {
        // Known templates with active (-use.png) sprites
        const activeSpriteKeys = [
            'Earth/Pickaxe Rick',
            'Jupiter/Gas Carbine',
            'Mars/F.E.L.P.S',
            'Mars/Party Pickaxe',
            'Moon/Cod of Duty',
            'Universal/Crude Rocket-Axe',
            'Universal/Nitro-Fueled Rocket-Axe',
            'Universal/Pump Shotgun',
            'Universal/Rocket Powered GPU-Pickaxe',
            'Universal/Rocket-Powered Battle-Axe'
        ];

        for (const key of activeSpriteKeys) {
            const parts = key.split('/');
            const planet = parts[0].toLowerCase();
            const folder = parts[1];
            // Find the template with matching folder path
            for (const [id, template] of Object.entries(this.templates)) {
                if (template.folderPath && template.folderPath.includes(folder)) {
                    this.templatesWithActiveSprite.add(id);
                    break;
                }
            }
        }
    }
}

// ============================================================
// PICKAXE MANIFEST
// Pre-built list of all pickaxe folders and their sprite filenames.
// This is necessary because static HTTP servers cannot list directories.
// ============================================================

const PICKAXE_MANIFEST = {
    'Earth': [
        'Normal Pickaxe', 'Crude Stick-Axe', 'Fashioned Bone-Axe', 'Fashioned Coin-Axe',
        'Stronger Pickaxe', 'Bronze Pickaxe', 'Improved Bone-Axe', 'Lucky Pickaxe',
        'Golden Pickaxe', 'Potted Cactus', 'Lucky Golden Pickaxe', 'Golden Bone-Axe',
        'Pickaxe Rick', 'T.A.R.P.I.S'
    ],
    'Moon': [
        'Blue Pickaxe', 'Cod of Duty', 'Das Big Boot', 'Moon Rock-Axe',
        'Purple Lollipop', 'Used Rocket'
    ],
    'Mars': [
        'Broken Record-Axe', 'Cool Glowstick', 'F.E.L.P.S', 'Golden Record-Axe',
        'Green Lollipop', 'Martian Pickaxe', 'Party Pickaxe', 'Pool Noodle',
        'Red Lollipop', 'Smelly Glowstick', 'Sticky Glowstick', 'Strange Glowstick',
        'Superheated Magmastick'
    ],
    'Jupiter': [
        'Cloud-Axe', 'Gas Carbine', 'Gold-Bronzed Dagger', 'Huge Drill',
        'Huge Golden Drill', 'Scepter De La Sol', 'Staff of the SunDoge'
    ],
    'Titan': [
        'Axe of Greatness', 'Axe of Magnificence', 'Hammer of Boom',
        'Hammer of Destruction', 'Hammer of Smashing', 'Modern High-Tech Pickaxe',
        'The Diamond Avenger', 'The Golden Avenger', 'The Superior Avenger',
        'Ancient Golden Axe', 'Light-blade Pickaxe'
    ],
    'Universal': [
        'Barbell', 'Battle-Axe', 'Crude Rocket-Axe', 'Dual GPU-Pickaxe',
        'Dual GPU-Pickaxe OC', 'Electric Guitar', "Firefighter's Axe",
        'GPU-Pickaxe', 'Gold-Bronze Pickaxe', 'Gold-Tipped FireAxe',
        'Golden Meat Cleaver', 'Improved Saw-Axe', 'Improvised Saw-Axe',
        'Large Frying Pan', 'Live Rocket', 'Loaded Barbell', 'Meat Cleaver',
        'Nitro-Fueled Rocket-Axe', 'Nuclear-Tipped Rocket', 'Pump Shotgun',
        'Rocket Powered GPU-Pickaxe', 'Rocket-Powered Battle-Axe',
        'Sharpened Battle-Axe', 'Unstable Drill', 'Very Improved Saw-Axe',
        'Very Loaded Barbell'
    ]
};

// Sprite filename mapping for pickaxes whose sprite doesn't match a simple pattern.
// Format: 'Planet/FolderName' → 'sprite_filename.png'
const PICKAXE_SPRITES = {
    // Earth
    'Earth/Normal Pickaxe': 'standard.png',
    'Earth/Crude Stick-Axe': 'sticks.png',
    'Earth/Fashioned Bone-Axe': 'boneaxe.png',
    'Earth/Fashioned Coin-Axe': 'brokencoin.png',
    'Earth/Stronger Pickaxe': 'stronger.png',
    'Earth/Bronze Pickaxe': 'yellowbronze.png',
    'Earth/Improved Bone-Axe': 'boneaxe.png',
    'Earth/Lucky Pickaxe': 'stronger.png',
    'Earth/Golden Pickaxe': 'golden.png',
    'Earth/Potted Cactus': 'cactus.png',
    'Earth/Lucky Golden Pickaxe': 'golden.png',
    'Earth/Golden Bone-Axe': 'goldenbone.png',
    'Earth/Pickaxe Rick': 'pickaxerick.png',
    'Earth/T.A.R.P.I.S': 'tarpis.png',
    // Moon
    'Moon/Blue Pickaxe': 'bluepick.png',
    'Moon/Cod of Duty': 'cod.png',
    'Moon/Das Big Boot': 'bigboot.png',
    'Moon/Moon Rock-Axe': 'moonrock.png',
    'Moon/Purple Lollipop': 'lollipaxe.png',
    'Moon/Used Rocket': 'usedrocket.png',
    // Mars
    'Mars/Broken Record-Axe': 'record.png',
    'Mars/Cool Glowstick': 'blueglowstick.png',
    'Mars/F.E.L.P.S': 'felps.png',
    'Mars/Golden Record-Axe': 'goldenrecord.png',
    'Mars/Green Lollipop': 'lollipaxe_green.png',
    'Mars/Martian Pickaxe': 'marspick.png',
    'Mars/Party Pickaxe': 'partypickaxe.png',
    'Mars/Pool Noodle': 'poolnoodle.png',
    'Mars/Red Lollipop': 'lollipaxe_red.png',
    'Mars/Smelly Glowstick': 'greenglowstick.png',
    'Mars/Sticky Glowstick': 'blueglowstick.png',
    'Mars/Strange Glowstick': 'greenglowstick.png',
    'Mars/Superheated Magmastick': 'magmastick.png',
    // Jupiter
    'Jupiter/Cloud-Axe': 'hardenedcloud.png',
    'Jupiter/Gas Carbine': 'm4.png',
    'Jupiter/Gold-Bronzed Dagger': 'dagger.png',
    'Jupiter/Huge Drill': 'hugedrill.png',
    'Jupiter/Huge Golden Drill': 'goldendrill.png',
    'Jupiter/Scepter De La Sol': 'sunscepter.png',
    'Jupiter/Staff of the SunDoge': 'magicstaff.png',
    // Titan
    'Titan/Axe of Greatness': 'bigaxe.png',
    'Titan/Axe of Magnificence': 'bigaxe2.png',
    'Titan/Hammer of Boom': 'goldenhammer.png',
    'Titan/Hammer of Destruction': 'bighammer2.png',
    'Titan/Hammer of Smashing': 'bighammer.png',
    'Titan/Modern High-Tech Pickaxe': 'modernaxe.png',
    'Titan/The Diamond Avenger': 'diasword.png',
    'Titan/The Golden Avenger': 'goldsword.png',
    'Titan/The Superior Avenger': 'supersword.png',
    'Titan/Ancient Golden Axe': 'ancientaxe.png',
    'Titan/Light-blade Pickaxe': 'lightaxe.png',
    // Universal
    'Universal/Barbell': 'barbell_empty.png',
    'Universal/Battle-Axe': 'axe.png',
    'Universal/Crude Rocket-Axe': 'cruderocket.png',
    'Universal/Dual GPU-Pickaxe': 'sligpu.png',
    'Universal/Dual GPU-Pickaxe OC': 'sligpu_oc.png',
    'Universal/Electric Guitar': 'eguitar.png',
    "Universal/Firefighter's Axe": 'fireaxe.png',
    'Universal/GPU-Pickaxe': 'gpu.png',
    'Universal/Gold-Bronze Pickaxe': 'yellowbronze.png',
    'Universal/Gold-Tipped FireAxe': 'fireaxegold.png',
    'Universal/Golden Meat Cleaver': 'cleavergold.png',
    'Universal/Improved Saw-Axe': 'sawaxe2.png',
    'Universal/Improvised Saw-Axe': 'sawaxe.png',
    'Universal/Large Frying Pan': 'fryingpan.png',
    'Universal/Live Rocket': 'rocket.png',
    'Universal/Loaded Barbell': 'barbell_halfweights.png',
    'Universal/Meat Cleaver': 'cleaver.png',
    'Universal/Nitro-Fueled Rocket-Axe': 'rocketaxe.png',
    'Universal/Nuclear-Tipped Rocket': 'nuke.png',
    'Universal/Pump Shotgun': 'shotgun.png',
    'Universal/Rocket Powered GPU-Pickaxe': 'gpurocket.png',
    'Universal/Rocket-Powered Battle-Axe': 'rocketaxe.png',
    'Universal/Sharpened Battle-Axe': 'axe.png',
    'Universal/Unstable Drill': 'smalldrill.png',
    'Universal/Very Improved Saw-Axe': 'sawaxe3.png',
    'Universal/Very Loaded Barbell': 'barbell_weights.png'
};
