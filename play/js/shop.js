// DogeMiner: Community Edition - Shop Management
class ShopManager {
    constructor(game) {
        this.game = game;
        this.shopData = this.initializeShopData();
    }

    initializeShopData() {
        return {
            helpers: {
                miningShibe: {
                    name: 'Mining Shibe',
                    baseCost: 20,
                    baseDps: 0.2,
                    icon: 'assets/helpers/shibes/shibes-idle-0.webp',
                    miningSprite: 'assets/helpers/shibes/shibes-mine-0.webp',
                    description: 'Very kind shibe to mine much dogecoin.',
                    category: 'basic'
                },
                dogeKennels: {
                    name: 'Doge Kennels',
                    baseCost: 400,
                    baseDps: 2,
                    icon: 'assets/helpers/kennels/kennels-idle-0.webp',
                    miningSprite: 'assets/helpers/kennels/kennels-mine-0.webp',
                    description: 'Wow very efficiency, entire kennels to mine dogecoin.',
                    category: 'basic'
                },
                streamerKittens: {
                    name: 'Streamer Kittens',
                    baseCost: 1800,
                    baseDps: 4,
                    icon: 'assets/helpers/kittens/kittens-idle-0.webp',
                    miningSprite: 'assets/helpers/kittens/kittens-mine-0.webp',
                    description: 'Kittens to stream cute videos to the internet for dogecoin.',
                    category: 'basic'
                },
                spaceRocket: {
                    name: 'Space Rocket',
                    baseCost: 50000,
                    baseDps: 9,
                    icon: 'assets/helpers/rockets/rockets-idle-0.webp',
                    miningSprite: 'assets/helpers/rockets/rockets-mine-0.webp',
                    description: 'A rocket to fly to the moon.',
                    category: 'advanced'
                },
                timeMachineRig: {
                    name: 'Time Machine Mining Rig',
                    baseCost: 9999999,
                    baseDps: 66,
                    icon: 'assets/helpers/rigs/rigs-idle-0.webp',
                    miningSprite: 'assets/helpers/rigs/rigs-mine-0.webp',
                    description: 'Mines into the future where infinite dogecoins exist.',
                    category: 'advanced'
                },
                infiniteDogebility: {
                    name: 'Infinite Dogebility Drive',
                    baseCost: 9999999999,
                    baseDps: 999,
                    icon: 'assets/helpers/dogebility/dogebility-idle-0.webp',
                    miningSprite: 'assets/helpers/dogebility/dogebility-mine-0.webp',
                    description: 'A ship that instantaneously travels to any place in the Universe. Result? Many Dogecoins.',
                    category: 'advanced'
                }
            },

            // Moon helpers
            moonHelpers: {
                moonBase: {
                    name: 'Moon Base',
                    baseCost: 29999,
                    baseDps: 12,
                    icon: 'assets/helpers/bases/bases-idle-0.webp',
                    miningSprite: 'assets/helpers/bases/bases-mine-0.webp',
                    description: 'A base on the moon to extract much dogecoin.',
                    category: 'moon'
                },
                moonShibe: {
                    name: 'Moon Shibe',
                    baseCost: 10000,
                    baseDps: 9,
                    icon: 'assets/helpers/moonshibe/moonshibe-idle-0.webp',
                    miningSprite: 'assets/helpers/moonshibe/moonshibe-mine-0.webp',
                    description: 'Astronaut moon shibe to mine much dogecoin.',
                    category: 'moon'
                },
                dogeCar: {
                    name: 'Doge Car',
                    baseCost: 35000,
                    baseDps: 12,
                    icon: 'assets/helpers/dogecar/dogecar-idle-0.webp',
                    miningSprite: 'assets/helpers/dogecar/dogecar-mine-0.webp',
                    description: 'Wow! Much fast doge car with such doge driver. Very Wise. How it mines, no one knows.',
                    category: 'moon'
                },
                landerShibe: {
                    name: 'Lander Shibe',
                    baseCost: 420000,
                    baseDps: 20,
                    icon: 'assets/helpers/landershibe/landershibe-idle-0.webp',
                    miningSprite: 'assets/helpers/landershibe/landershibe-mine-0.webp',
                    description: 'Lander shibe explores other planets and moons in pursuit of dogecoin.',
                    category: 'moon'
                },
                marsRocket: {
                    name: 'Mars Rocket',
                    baseCost: 2500000,
                    baseDps: 50,
                    icon: 'assets/helpers/marsrocket/marsrocket-idle-0.webp',
                    miningSprite: 'assets/helpers/marsrocket/marsrocket-mine-0.webp',
                    description: 'A rocket to fly to Mars, much red planet, such adventure.',
                    category: 'moon'
                },
                dogeGate: {
                    name: 'Doge Gate',
                    baseCost: 123456789,
                    baseDps: 155,
                    icon: 'assets/helpers/dogegate/dogegate-idle-0.webp',
                    miningSprite: 'assets/helpers/dogegate/dogegate-mine-0.webp',
                    description: 'A Doge Gate for instant galaxy-wide dogecoin transfers.',
                    category: 'moon'
                }
            },

            // Mars helpers
            marsHelpers: {
                marsBase: {
                    name: 'Mars Base',
                    baseCost: 500000,
                    baseDps: 23,
                    icon: 'assets/helpers/marsbase/marsbase-idle-0.webp',
                    miningSprite: 'assets/helpers/marsbase/marsbase-mine-0.webp',
                    description: 'A base on Mars to mine ludicrous amounts of Dogecoin.',
                    category: 'mars'
                },
                partyShibe: {
                    name: 'Party Shibe',
                    baseCost: 100000,
                    baseDps: 26,
                    icon: 'assets/helpers/partyshibe/partyshibe-idle-0.webp',
                    miningSprite: 'assets/helpers/partyshibe/partyshibe-mine-0.webp',
                    description: 'Cool space rave party shibes to rave much dogecoin.',
                    category: 'mars'
                },
                curiosiDoge: {
                    name: 'CuriousiDoge',
                    baseCost: 400000,
                    baseDps: 30,
                    icon: 'assets/helpers/curiosidoge/curiosidoge-idle-0.webp',
                    miningSprite: 'assets/helpers/curiosidoge/curiosidoge-mine-0.webp',
                    description: 'Much curious Doge to explore Mars riches.',
                    category: 'mars'
                },
                djKittenz: {
                    name: 'DJ Kittenz',
                    baseCost: 1000000,
                    baseDps: 45,
                    icon: 'assets/helpers/djkittenz/djkittenz-idle-0.webp',
                    miningSprite: 'assets/helpers/djkittenz/djkittenz-mine-0.webp',
                    description: 'Very music creation. DJ Kittenz specializes in House music.',
                    category: 'mars'
                },
                spaceBass: {
                    name: 'Space Bass',
                    baseCost: 8000000,
                    baseDps: 70,
                    icon: 'assets/helpers/spacebass/spacebass-idle-0.webp',
                    miningSprite: 'assets/helpers/spacebass/spacebass-mine-0.webp',
                    description: 'It is said to vibrate the essence of gravity itself.',
                    category: 'mars'
                },
                jupiterRocket: {
                    name: 'Jupiter Rocket',
                    baseCost: 50000000,
                    baseDps: 100,
                    icon: 'assets/helpers/juprocket/juprocket-idle-0.webp',
                    miningSprite: 'assets/helpers/juprocket/juprocket-mine-0.webp',
                    description: 'A rocket to fly to Jupiter.',
                    category: 'mars'
                }
            },

            // Jupiter helpers sourced from /jupiterhelpers reference
            jupiterHelpers: {
                cloudBase: {
                    name: 'Cloud Base',
                    baseCost: 20000000,
                    baseDps: 45,
                    icon: 'assets/helpers/jupiterbase/jupiterbase-idle-0.webp',
                    miningSprite: 'assets/helpers/jupiterbase/jupiterbase-mine-0.webp',
                    description: 'A flying base in the clouds of Jupiter.',
                    category: 'jupiter'
                },
                superShibe: {
                    name: 'Super Shibe',
                    baseCost: 1000000,
                    baseDps: 50,
                    icon: 'assets/helpers/supershibe/supershibe-idle-0.webp',
                    miningSprite: 'assets/helpers/supershibe/supershibe-mine-0.webp',
                    description: 'A scary-strong shibe. Probably on steroids.',
                    category: 'jupiter'
                },
                dogeAirShip: {
                    name: 'Doge Air Ship',
                    baseCost: 15000000,
                    baseDps: 80,
                    icon: 'assets/helpers/airship/airship-idle-0.webp',
                    miningSprite: 'assets/helpers/airship/airship-mine-0.webp',
                    description: 'A flying ship with eager astro shibes.',
                    category: 'jupiter'
                },
                flyingDoggo: {
                    name: 'Flying Doggo',
                    baseCost: 35000000,
                    baseDps: 120,
                    icon: 'assets/helpers/flyingdoge/flyingdoge-idle-0.webp',
                    miningSprite: 'assets/helpers/flyingdoge/flyingdoge-mine-0.webp',
                    description: 'It comes wif two sub-woofers.',
                    category: 'jupiter'
                },
                tardogeis: {
                    name: 'TARDogeIS',
                    baseCost: 55000000,
                    baseDps: 150,
                    icon: 'assets/helpers/tardogeis/tardogeis-idle-0.webp',
                    miningSprite: 'assets/helpers/tardogeis/tardogeis-mine-0.webp',
                    description: 'Time and Relative Doge in Space exists everywhere at the same time. Sort of.',
                    category: 'jupiter'
                },
                dogeStar: {
                    name: 'DogeStar',
                    baseCost: 699999999,
                    baseDps: 420,
                    icon: 'assets/helpers/dogestar/dogestar-idle-0.webp',
                    miningSprite: 'assets/helpers/dogestar/dogestar-mine-0.webp',
                    description: 'A space station the size of a small moon, equipped with a mining laser.',
                    category: 'jupiter'
                }
            },
            titanHelpers: {
                // Helper 1: Titan Base - Foundation structure for manufacturing and mining operations
                titanBase: {
                    name: 'Titan Base',
                    baseCost: 500000000,
                    baseDps: 165,
                    icon: 'assets/helpers/titanbase/titanbase-idle-0.webp',
                    miningSprite: 'assets/helpers/titanbase/titanbase-mine-0.webp',
                    description: 'A base on Titan to mine dogecoins and manufacture robots.',
                    category: 'titan'
                },
                // Helper 2: Robo Shibe - Automated mining unit designed for Titan's harsh environment
                roboShibe: {
                    name: 'Robo Shibe',
                    baseCost: 455000000,
                    baseDps: 195,
                    icon: 'assets/helpers/roboshibe/roboshibe-idle-0.webp',
                    miningSprite: 'assets/helpers/roboshibe/roboshibe-mine-0.webp',
                    description: 'A robotic shibe to mine the riches on Titan.',
                    category: 'titan'
                },
                // Helper 3: Heavy Doge Walker - Large cargo and mining vehicle
                heavyDogeWalker: {
                    name: 'Heavy Doge Walker',
                    baseCost: 2000000000,
                    baseDps: 400,
                    icon: 'assets/helpers/walker/walker-idle-0.webp',
                    miningSprite: 'assets/helpers/walker/walker-mine-0.webp',
                    description: 'Large vehicle. Much cargo, Very carry.',
                    category: 'titan'
                },
                // Helper 4: Coin Seeker 5000 - Advanced robotic mining predator
                coinSeeker5000: {
                    name: 'Coin Seeker 5000',
                    baseCost: 4500000000,
                    baseDps: 498,
                    icon: 'assets/helpers/seeker/seeker-idle-0.webp',
                    miningSprite: 'assets/helpers/seeker/seeker-mine-0.webp',
                    description: 'Advanced robotic dogecoin seeking predator.',
                    category: 'titan'
                },
                // Helper 5: Time Travel D-Rex - Half terrifying, half amazing dinosaur from the past
                timeTravelDRex: {
                    name: 'Time Travel D-Rex',
                    baseCost: 8000000000,
                    baseDps: 620,
                    icon: 'assets/helpers/trex/trex-idle-0.webp',
                    miningSprite: 'assets/helpers/trex/trex-mine-0.webp',
                    description: 'Half terrifying, half amazing. Rawr.',
                    category: 'titan'
                },
                // Helper 6: Altar of the SunDoge - Sacred structure for enlightened mining
                altarOfTheSunDoge: {
                    name: 'Altar of the SunDoge',
                    baseCost: 100000000000,
                    baseDps: 1200,
                    icon: 'assets/helpers/altarofthesundoge/altarofthesundoge-idle-0.webp',
                    miningSprite: 'assets/helpers/altarofthesundoge/altarofthesundoge-mine-0.webp',
                    description: 'An altar of calling to an enlightened Doge above our WOW.',
                    category: 'titan'
                }
            },

            pickaxes: {
                standard: {
                    name: 'Standard Pickaxe',
                    cost: 0,
                    multiplier: 1,
                    icon: 'assets/items/pickaxes/Earth/Normal Pickaxe/standard.webp',
                    description: 'Basic mining tool',
                    unlocked: true
                },
                stronger: {
                    name: 'Stronger Pickaxe',
                    cost: 100,
                    multiplier: 2,
                    icon: 'assets/items/pickaxes/Earth/Stronger Pickaxe/stronger.webp',
                    description: 'More powerful mining',
                    unlocked: true
                },
                golden: {
                    name: 'Golden Pickaxe',
                    cost: 500,
                    multiplier: 5,
                    icon: 'assets/items/pickaxes/Earth/Golden Pickaxe/golden.webp',
                    description: 'Luxury mining equipment',
                    unlocked: true
                },
                rocketaxe: {
                    name: 'Rocket Pickaxe',
                    cost: 2000,
                    multiplier: 10,
                    icon: 'assets/items/pickaxes/Universal/Rocket-Powered Battle-Axe/rocketaxe.webp',
                    description: 'Space-age mining technology',
                    unlocked: true
                },
                diamond: {
                    name: 'Diamond Pickaxe',
                    cost: 10000,
                    multiplier: 25,
                    icon: 'assets/items/pickaxes/Titan/The Diamond Avenger/diasword.webp',
                    description: 'Crystal-clear mining power',
                    unlocked: true
                },
                nuke: {
                    name: 'Nuclear Pickaxe',
                    cost: 50000,
                    multiplier: 100,
                    icon: 'assets/items/pickaxes/Universal/Nuclear-Tipped Rocket/nuke.webp',
                    description: 'Explosive mining capability',
                    unlocked: true
                }
            },

            upgrades: {
                clickPower: {
                    name: 'Click Power',
                    baseCost: 50,
                    effect: 'Increases click power by 1',
                    icon: 'assets/general/icons/axes.webp',
                    description: 'Make each click more powerful',
                    maxLevel: 100
                },
                autoClicker: {
                    name: 'Auto Clicker',
                    baseCost: 1000,
                    effect: 'Automatically clicks every second',
                    icon: 'assets/helpers/shibes/shibes-idle-0.webp',
                    description: 'Automate your clicking',
                    maxLevel: 10
                },
                criticalChance: {
                    name: 'Critical Hit',
                    baseCost: 5000,
                    effect: '10% chance for 2x damage',
                    icon: 'assets/general/icons/goldenaxes.webp',
                    description: 'Chance for critical hits',
                    maxLevel: 20
                },
                helperEfficiency: {
                    name: 'Helper Efficiency',
                    baseCost: 10000,
                    effect: 'Increases all helper DPS by 10%',
                    icon: 'assets/general/icons/helmets-gold.webp',
                    description: 'Make helpers more efficient',
                    maxLevel: 50
                }
            },

            // Helper upgrades - levels 1+ are purchasable upgrades
            helperUpgrades: {
                miningShibe: [
                    { level: 0, name: 'Mining Shibe', dps: 0.2, shopDesc: 'Very kind shibe to mine much dogecoin.' },
                    { level: 1, name: 'Mining Shibe', upgradeIcon: 'assets/general/icons/fedora.webp', dps: 0.7, price: 1000, diamondPrice: 1, upgradeName: 'Euphoria', upgradeDesc: 'Replace the Mining Shibe helmets with fedoras for increased tipping.', shopDesc: 'Very enlightened shibe to mine much dogecoin.' },
                    { level: 2, name: 'Mining Shibe', upgradeIcon: 'assets/general/icons/goldenaxes.webp', dps: 1, price: 3500, diamondPrice: 1, upgradeName: 'Golden Pickaxes', upgradeDesc: 'Replace the Mining Shibe pickaxes with Golden Pickaxes.', shopDesc: 'Very enlightened shibe to mine much dogecoin. With golden pickaxes.' },
                    { level: 3, name: 'Mining Shibe', upgradeIcon: 'assets/general/icons/greenarrow.webp', dps: 2, price: 32500, diamondPrice: 1, upgradeName: 'Salary Raise', upgradeDesc: 'Raise the Mining Shibes salaries, which will lead to better work ethics.', shopDesc: 'Well-paid, happy shibe to mine much dogecoin.' },
                    { level: 4, name: 'Rapping Shibe', upgradeIcon: 'assets/general/icons/bling.webp', dps: 5, price: 4500000, diamondPrice: 1, upgradeName: 'Rapper Shibes', upgradeDesc: 'Mining Shibes become Rapper Shibes, to bring da bling!', shopDesc: 'A rapping shibe makes mostest dogecoin.' },
                    { level: 5, name: 'Space Shibe', upgradeIcon: 'assets/general/icons/spacehelmets.webp', dps: 19, price: 25000000, diamondPrice: 2, upgradeName: 'Space Shibes', upgradeDesc: 'Make shibes space-worthy with astronaut helmets.', shopDesc: 'A space shibe to mine much dogecoin.' },
                    { level: 6, name: 'Space Shibe w/Gold Helmet', upgradeIcon: 'assets/general/icons/helmets-gold.webp', dps: 35, price: 55000000, diamondPrice: 3, upgradeName: 'Gold Helmet Upgrade', upgradeDesc: 'Use Gold instead of plywood for better protection.', shopDesc: 'A space shibe to mine much dogecoin.' },
                    { level: 7, name: 'Space Shibe w/Diamond Helmet', upgradeIcon: 'assets/general/icons/helmets-diamond.webp', dps: 69, price: 55000000, diamondPrice: 3, upgradeName: 'Diamond Helmet Upgrade', upgradeDesc: 'Make space shibes truly magnificent with diamond helmets.', shopDesc: 'A space shibe to mine mucherer dogecoin.' },
                    {"level": 8, "name": "Really Hard Space Shibe", "upgradeIcon": "assets/general/icons/helmets-special.webp", "dps": 130, "price": 250000000, "diamondPrice": 5, "upgradeName": "Reallyhardium Coating", "upgradeDesc": "A super-strong version of space helmets.", "shopDesc": "A space shibe to mine muchest dogecoin.", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                dogeKennels: [
                    { level: 0, name: 'Doge Kennels', dps: 2, shopDesc: 'Wow very efficiency, entire kennels to mine dogecoin.' },
                    { level: 1, name: 'Axequipped Kennels', upgradeIcon: 'assets/general/icons/axes.webp', dps: 3.2, price: 1100, diamondPrice: 1, upgradeName: 'More Axes', upgradeDesc: 'Supply the kennels with more pickaxes to use for mining.', shopDesc: 'Wow very efficiency. Entire kennels to mine Dogecoin. With many axes.' },
                    { level: 2, name: 'Pink Kennels', upgradeIcon: 'assets/general/icons/paint.webp', dps: 4.3, price: 4000, diamondPrice: 1, upgradeName: 'Paint Job', upgradeDesc: 'Repaint the Kennels to a more friendlier color. Much happy.', shopDesc: 'Wow very efficiency. Entire Kennels to mine Dogecoin. In style.' },
                    { level: 3, name: 'Rocket Kennels', upgradeIcon: 'assets/general/icons/rocket.webp', dps: 5, price: 42000, diamondPrice: 1, upgradeName: 'Micro-Rockets', upgradeDesc: 'Attach micro-rockets to the kennels. To the moon!', shopDesc: 'WOOOW very efficiency, entire kennels to mine Dogecoin with ROCKET POWER!' },
                    { level: 4, name: 'Free Running Doges', upgradeIcon: 'assets/general/icons/boltcutter.webp', dps: 7, price: 125000, diamondPrice: 1, upgradeName: 'Release the Doge', upgradeDesc: 'Who let the Doge out? Dismantle kennels, creating Free Running Doges.', shopDesc: 'Wow very freedom, free running Doges mine much more Dogecoin than not free running!' },
                    { level: 5, name: 'Jet-Pack Doges', upgradeIcon: 'assets/general/icons/jetpack.webp', dps: 11, price: 3000000, diamondPrice: 1, upgradeName: 'Jet Packs', upgradeDesc: 'Supply the Kennels with jet packs.', shopDesc: 'Equipped with Jet Packs, Doges travel very fast to mine much Dogecoin!' },
                    { level: 6, name: 'Space Doges', upgradeIcon: 'assets/general/icons/spacehelmets.webp', dps: 20, price: 30000000, diamondPrice: 3, upgradeName: 'Safety First', upgradeDesc: 'Give the Jet-Pack-Doges space helmets. For safety.', shopDesc: 'Equipped with Jet Packs & Space Helmets, Doges travel very fast to mine much Dogecoin!' },
                    { level: 7, name: 'Space Doges', upgradeIcon: 'assets/general/icons/helmets-gold.webp', dps: 33, price: 80000000, diamondPrice: 4, upgradeName: 'Golden Improvement', upgradeDesc: 'Space Doges get a golden improvement for increased income.', shopDesc: 'Space Doges travel very fast to mine much Dogecoin in space!' },
                    { level: 8, name: 'Space Doges', upgradeIcon: 'assets/general/icons/helmets-diamond.webp', dps: 61, price: 151000000, diamondPrice: 5, upgradeName: 'Diamond Improvement', upgradeDesc: 'Give Space Doges a diamond-based improvement.', shopDesc: 'Space Doges travel very fast to mine much Dogecoin in space!' },
                    {"level": 9, "name": "Really Hard Space Doges", "upgradeIcon": "assets/general/icons/helmets-special.webp", "dps": 150, "price": 320000000, "diamondPrice": 7, "upgradeName": "Reallyhardium-coating", "upgradeDesc": "Coat the Space Doges gear with the strongest metal known to doge.", "shopDesc": "Space doges travel very fast to mine much dogecoin in space!", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                streamerKittens: [
                    { level: 0, name: 'Streamer Kittens', dps: 4, shopDesc: 'Kittens to stream cute videos to the internet for dogecoin.' },
                    { level: 1, name: 'Streamer Kittens HD', upgradeIcon: 'assets/general/icons/camera.webp', dps: 7, price: 4200, diamondPrice: 1, upgradeName: 'High Quality Pussy-cat', upgradeDesc: 'Upgrade the kittens webcam to HD for better streams.', shopDesc: 'Many kittens to stream cute HD videos to the internet for Dogecoin.' },
                    { level: 2, name: 'Streamer Kitten Gang', upgradeIcon: 'assets/general/icons/kittens.webp', dps: 9, price: 99000, diamondPrice: 1, upgradeName: 'More Kittens', upgradeDesc: 'Increase the cute-level with more kittens.', shopDesc: 'Many kittens to stream cute HD videos to the internet for Dogecoin.' },
                    { level: 3, name: 'Speedy Kitten Streamers', upgradeIcon: 'assets/general/icons/cable.webp', dps: 12, price: 392000, diamondPrice: 1, upgradeName: 'High-Speed Interwebs', upgradeDesc: 'Connects the kittens PC to the global Doge Fiber network.', shopDesc: 'Many kittens to stream cute HD videos to the internet for dogecoin at high speeds.' },
                    { level: 4, name: 'Enlightened Kittens', upgradeIcon: 'assets/general/icons/int.webp', dps: 18, price: 3250000, diamondPrice: 1, upgradeName: 'Intelligence', upgradeDesc: 'Enlighten the kittens.', shopDesc: 'Enlightened kittens creates amaze podcasts for very much dogecoin.' },
                    { level: 5, name: 'Stock Kittens', upgradeIcon: 'assets/general/icons/stocks.webp', dps: 21, price: 6500000, diamondPrice: 2, upgradeName: 'Stock Kittens', upgradeDesc: 'Teach the kittens how to effectively trade in dogecoin stocks for profit.', shopDesc: 'Stock kittens invest dogecoin in dogecoin for more dogecoin. Such profit!' },
                    { level: 6, name: 'Space-Proof Kittens', upgradeIcon: 'assets/general/icons/spacehelmets.webp', dps: 23, price: 82000000, diamondPrice: 3, upgradeName: 'Catstronaut', upgradeDesc: 'Give the kittens space helmets. It helps them feel safe.', shopDesc: 'Space-Proof Kittens invest dogecoin in dogecoin for much dogecoin. (Space capable)' },
                    { level: 7, name: 'Space-Hardened Kittens', upgradeIcon: 'assets/general/icons/helmets-gold.webp', dps: 45, price: 169000000, diamondPrice: 4, upgradeName: 'Goldened Helmets', upgradeDesc: 'Improved kitty-helmets for improved kittyness.', shopDesc: 'Space-Hardened Kittens Invest dogecoin in dogecoin for much dogecoin. (Space skilled)' },
                    { level: 8, name: 'Catstronaut Kittens', upgradeIcon: 'assets/general/icons/helmets-diamond.webp', dps: 70, price: 290000000, diamondPrice: 5, upgradeName: 'Diamond Helmets', upgradeDesc: 'Really strong helmets for all kitten catstronauts.', shopDesc: 'Catstronaut Kittens invest dogecoin in dogecoin for so much dogecoin. (Space masters)' },
                    {"level": 9, "name": "Really Hard Catstronauts", "upgradeIcon": "assets/general/icons/helmets-special.webp", "dps": 169, "price": 399000000, "diamondPrice": 7, "upgradeName": "Reallyhardium Catstronauts", "upgradeDesc": "Not a whole kitten, just the important part, like a helmet. Duh.", "shopDesc": "Really Hard Catstronauts invest very much dogecoin in dogecoin the most dogecoin profit.", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                spaceRocket: [
                    { level: 0, name: 'Space Rocket', dps: 9, shopDesc: 'A rocket to fly to the moon.' },
                    { level: 1, name: 'Space Rocket', upgradeIcon: 'assets/general/icons/blueflame.webp', dps: 11, price: 52000, diamondPrice: 1, upgradeName: 'Blue-Flame', upgradeDesc: 'Upgrade the rocket engine with blue-flame rockets.', shopDesc: 'A rocket to fly to the moon with blue flame.' },
                    { level: 2, name: 'Warp Rocket', upgradeIcon: 'assets/general/icons/emcdoge.webp', dps: 14, price: 1500000, diamondPrice: 2, upgradeName: 'Warp Drive', upgradeDesc: 'Upgrade the rocket with a warp drive engine for superfast travel.', shopDesc: 'A warp drive rocket to travel to the moon to find much dogecoin.' },
                    { level: 3, name: 'Shiny Rocket', upgradeIcon: 'assets/general/icons/shiny.webp', dps: 23, price: 500000000, diamondPrice: 3, upgradeName: 'Hull Upgrade', upgradeDesc: 'Upgrade the hull of the Space Rocket. Shiny.', shopDesc: 'A shiny space rocket to find much dogecoin in space.' },
                    { level: 4, name: 'Olie Rocket', upgradeIcon: 'assets/general/icons/olie.webp', dps: 28, price: 600000000, diamondPrice: 4, upgradeName: 'Olie Upgrade', upgradeDesc: 'Lets all find dogecoin together. Okay? Upgrade to olie-style doge rocket.', shopDesc: 'Awesome rocket for doge to travel to the moon to find much dogecoin.' },
                    { level: 5, name: 'Space-Olie Rocket', upgradeIcon: 'assets/general/icons/spacehelmet.webp', dps: 48, price: 1000000000, diamondPrice: 5, upgradeName: 'Space Helmets', upgradeDesc: 'Give Pilot-Doge a space helmet to increase time spent in space.', shopDesc: 'Awesome rocket for space doge to travel to moon to find dogecoin.' },
                    { level: 6, name: 'Gold-Olie Rocket', upgradeIcon: 'assets/general/icons/goldbars.webp', dps: 79, price: 1300000000, diamondPrice: 5, upgradeName: 'Golden Helmet', upgradeDesc: 'If it\'s not gold, it\'s not good enough. Unless it\'s better.', shopDesc: 'Awesome rocket for golden doge to travel to the moon to find dogecoin.' },
                    { level: 7, name: 'Diamond-Olie Rocket', upgradeIcon: 'assets/general/icons/diamond-d.webp', dps: 159, price: 1600000000, diamondPrice: 6, upgradeName: 'Diamond Helmet', upgradeDesc: 'This helmet is better. It\'s not cheap, but really really strong.', shopDesc: 'Awesome rocket for diamond doge to travel to the moon to find dogecoin.' },
                    {"level": 8, "name": "Really Hard Rocket", "upgradeIcon": "assets/general/icons/specialbars.webp", "dps": 215, "price": 300000000, "diamondPrice": 7, "upgradeName": "Reallyhardium Helmet", "upgradeDesc": "The best protection, is Reallyhardium protection. Patent pending.", "shopDesc": "Awesome rocket for reallyhard doge to travel to the moon to find dogecoin.", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                timeMachineRig: [
                    { level: 0, name: 'Time Machine Mining Rig', dps: 66, shopDesc: 'Mines into the future where infinite dogecoins exist.' },
                    { level: 1, name: 'Flying Time Machine Mining Rig', upgradeIcon: 'assets/general/icons/dedogerean.webp', dps: 88, price: 24200000, diamondPrice: 3, upgradeName: 'Roads?', upgradeDesc: 'Where doge is going, he doesn\'t need roads. Gives the Time Machine Mining Rig flight capabilities.', shopDesc: 'Mines into the future where infinite dogecoins exist. While flying.' },
                    { level: 2, name: 'Golden Flying Time Machine', upgradeIcon: 'assets/general/icons/goldenrig.webp', dps: 122, price: 72000000, diamondPrice: 3, upgradeName: 'Bling Bling', upgradeDesc: 'Paints the Flying Time Machine Mining Rig golden.', shopDesc: 'Mining the essence of space, backwards and forwards through time, in style.' },
                    { level: 3, name: 'Diamond Flying Time Machine', upgradeIcon: 'assets/general/icons/diamondrig.webp', dps: 178, price: 240000000, diamondPrice: 6, upgradeName: 'Diamond Bling', upgradeDesc: 'Put diamond paint on the Golden Flying Time Machine Mining Rig.', shopDesc: 'Mining the essence of space, backwards and forwards through time, in REAL style.' },
                    {"level": 4, "name": "Really Hard Flying Time Machine Mining Rig", "upgradeIcon": "assets/general/icons/specialrig.webp", "dps": 300, "price": 800000000, "diamondPrice": 8, "upgradeName": "Hyper-Bling", "upgradeDesc": "Use Reallyhardium paint on the Diamond Flying Time Machine Mining Rig.", "shopDesc": "Mining the essence of space, backwards and forwards through time, in wow.", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                infiniteDogebility: [
                    { level: 0, name: 'Infinite Dogebility Drive', dps: 999, shopDesc: 'A ship that instantaneously travels to any place in the Universe. Result? Many Dogecoins.' },
                    { level: 1, name: 'Infinite Delivery Drive', upgradeIcon: 'assets/general/icons/package.webp', dps: 1950, price: 20000000000, diamondPrice: 15, upgradeName: 'Delivery Service', upgradeDesc: 'The Infinite Dogebility Drive ship will now deliver packages across the universe in exchange for more dogecoins.', shopDesc: 'A ship that instantaneously delivers packages to any place in the universe. Result? Amazon.' },
                    { level: 2, name: 'Infinite Delivery Drive w/Crew', upgradeIcon: 'assets/general/icons/kerbal.webp', dps: 3456, price: 45000000000, diamondPrice: 30, upgradeName: 'Hire a Crew', upgradeDesc: 'A miner\'s goal is simple. Find a crew, get dogecoins, keep mining.', shopDesc: 'A crew on a ship that instantaneously delivers packages to any place in the universe.' },
                    { level: 3, name: 'Upside-Down Infinite Delivery', upgradeIcon: 'assets/general/icons/upsidedoge.webp', dps: 4210, price: 75000000000, diamondPrice: 40, upgradeName: 'Upside Doge', upgradeDesc: 'Silly Doge drives the ship upside down.', shopDesc: 'A weird crew on a ship instantaneously delivers packages to any place in the universe.' },
                    { level: 4, name: 'Golden Infinite Delivery', upgradeIcon: 'assets/general/icons/goldbars.webp', dps: 5420, price: 150000000000, diamondPrice: 50, upgradeName: 'The Upside of Gold', upgradeDesc: 'Shiny golden plating for the Infinite Dogebility Drive.', shopDesc: 'A weird crew on a ship instantaneously delivers packages to any place in the universe.' },
                    { level: 5, name: 'Diamond Infinite Delivery', upgradeIcon: 'assets/general/icons/diamond-d.webp', dps: 6900, price: 300000000000, diamondPrice: 60, upgradeName: 'The Cost of Diamonds', upgradeDesc: 'Very shiny diamond plating for the Infinite Dogebility Drive.', shopDesc: 'A weird crew on a ship that instantaneously delivers packages to any place in the universe.' },
                    {"level": 6, "name": "Rly Hard Infinite Delivery Crew", "upgradeIcon": "assets/general/icons/specialbars.webp", "dps": 15000, "price": 2222000000000, "diamondPrice": 99, "upgradeName": "Hype Me Up", "upgradeDesc": "Reallyhardium plating for the Infinite Dogebility Drive is not cheap.", "shopDesc": "A weird crew on a ship that instantaneously delivers packages to any place in the universe.", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                // Moon Helper Upgrades
                moonBase: [
                    { level: 0, name: 'Moon Base', dps: 12, shopDesc: 'A base on the moon to extract much dogecoin.' },
                    { level: 1, name: 'Improved Moon Base', upgradeIcon: 'assets/general/icons/excavator.webp', dps: 15, price: 60000, diamondPrice: 1, upgradeName: 'Excavator Assistance', upgradeDesc: 'Add a doge-excavator to assist the moon base.', shopDesc: 'A base on the moon to extract much dogecoin.' },
                    { level: 2, name: 'Improved Moon Base', upgradeIcon: 'assets/general/icons/manyaxes.webp', dps: 17, price: 315000, diamondPrice: 1, upgradeName: 'More Axes v2', upgradeDesc: 'Add more axes to the moon base.', shopDesc: 'A base on the moon to extract much dogecoin. With axes & excavator.' },
                    { level: 3, name: 'Golden Moon Base', upgradeIcon: 'assets/general/icons/goldbars.webp', dps: 29, price: 2250000, diamondPrice: 3, upgradeName: 'Gold-Coated Base', upgradeDesc: 'Coat the Moon Base and excavator in gold for increased income.', shopDesc: 'A golden base on the moon to extract much dogecoin. Much shiny.' },
                    { level: 4, name: 'Diamond Moon Base', upgradeIcon: 'assets/general/icons/diamond-d.webp', dps: 90, price: 65000000, diamondPrice: 5, upgradeName: 'Diamond-coated Base', upgradeDesc: 'Replace the gold coating with pure diamond instead. Somehow really good.', shopDesc: 'A diamond base on the moon to extract much dogecoin. Much improved.' },
                    {"level": 5, "name": "Really Hard Moon Base", "upgradeIcon": "assets/general/icons/special-d.webp", "dps": 260, "price": 300000000, "diamondPrice": 7, "upgradeName": "Reallyhardium Coat", "upgradeDesc": "The best a Moon Base could get.", "shopDesc": "A base on the moon to extract much dogecoin. The best.", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                moonShibe: [
                    { level: 0, name: 'Moon Shibe', dps: 9, shopDesc: 'Astronaut moon shibe to mine much dogecoin.' },
                    { level: 1, name: 'Moon Shibe', upgradeIcon: 'assets/general/icons/suitup.webp', dps: 13, price: 54000, diamondPrice: 1, upgradeName: 'Suit Up', upgradeDesc: 'Give the Moon Shibe a full space suit to wear. Very safer.', shopDesc: 'Space-suited astronaut moon shibe to mine much dogecoin.' },
                    { level: 2, name: 'Moon Shibe', upgradeIcon: 'assets/general/icons/axes.webp', dps: 15, price: 290000, diamondPrice: 2, upgradeName: 'Head-Mounted Pickaxes', upgradeDesc: 'Put Micro-Pickaxes © on the helmet of the Moon Shibe.', shopDesc: 'Astronaut Moon Shibe to mine much dogecoin. With Micro-Pickaxes ©' },
                    { level: 3, name: 'Golden Moon Shibe', upgradeIcon: 'assets/general/icons/goldbars.webp', dps: 19, price: 2000000, diamondPrice: 3, upgradeName: 'Gold-Suit Up', upgradeDesc: 'Replace the Moon Shibes space suit with a golden space suit.', shopDesc: 'Golden moon shibe to mine much dogecoin. Shiny!' },
                    { level: 4, name: 'Diamond Moon Shibe!', upgradeIcon: 'assets/general/icons/diamond-d.webp', dps: 49, price: 24000000, diamondPrice: 4, upgradeName: 'Diamond-Suit Up', upgradeDesc: 'Replace the Moon Shibes space suit with a diamond space suit.', shopDesc: 'Diamond moon shibe to mine much dogecoin. Shiny!' },
                    {"level": 5, "name": "Really Hard Moon Shibe", "upgradeIcon": "assets/general/icons/special-d.webp", "dps": 230, "price": 210000000, "diamondPrice": 6, "upgradeName": "Hyper-Suit Up", "upgradeDesc": "Replace the Moon Shibes space suit with a Reallyhardium suit.", "shopDesc": "Really hard moon shibe to mine much dogecoin. Shiny!", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                dogeCar: [
                    { level: 0, name: 'Doge Car', dps: 12, shopDesc: 'Wow! Much fast doge car with such doge driver. Very Wise. How it mines, no one knows.' },
                    { level: 1, name: 'Doge Car', upgradeIcon: 'assets/general/icons/shades.webp', dps: 15, price: 64500, diamondPrice: 1, upgradeName: 'Shade Miner', upgradeDesc: 'Give the Doge Driver of the Doge Car some cool shades.', shopDesc: 'Wow! Much fast doge car with such COOL doge driver. Very Wise.' },
                    { level: 2, name: 'Doge Tank', upgradeIcon: 'assets/general/icons/tracks.webp', dps: 20, price: 400000, diamondPrice: 1, upgradeName: 'Tank', upgradeDesc: 'Replace the Doge Car wheels with tank tracks, better traction on the moon.', shopDesc: 'Much traction Doge Tank with such cool doge driver. Very Wise.' },
                    { level: 3, name: 'Doge Tank', upgradeIcon: 'assets/general/icons/gpupick.webp', dps: 24, price: 5000000, diamondPrice: 2, upgradeName: 'Roof Miner', upgradeDesc: 'Attach a giant GPU-Pickaxe to the roof of the Doge Tank.', shopDesc: 'WOW mining tanky doge car mines bestest dogecoin. Very Wise.' },
                    { level: 4, name: 'Golden Doge Tank', upgradeIcon: 'assets/general/icons/goldbars.webp', dps: 75, price: 30000000, diamondPrice: 3, upgradeName: 'Gold Miner', upgradeDesc: 'Replace the Doge Tanks exterior with gold for much mining power.', shopDesc: 'WOW mining tanky doge car mines bestest dogecoin. Very shine.' },
                    { level: 5, name: 'Diamond Doge Tank', upgradeIcon: 'assets/general/icons/diamond-d.webp', dps: 159, price: 99000000, diamondPrice: 5, upgradeName: 'Diamond Miner', upgradeDesc: 'Replace the Doge Tanks exterior with diamond for superior mining.', shopDesc: 'WOW mining tanky doge car mines bestest dogecoin. Most shibe.' },
                    {"level": 6, "name": "Really Hard Doge Tank", "upgradeIcon": "assets/general/icons/specialbars.webp", "dps": 255, "price": 250000000, "diamondPrice": 7, "upgradeName": "Reallyhardium Miner", "upgradeDesc": "Replace the Doge Tanks exterior with Reallyhardium. Wow.", "shopDesc": "WOW mining tanky doge car mines bestest dogecoin. Wow!", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                landerShibe: [
                    { level: 0, name: 'Lander Shibe', dps: 20, shopDesc: 'Lander shibe explores other planets and moons in pursuit of dogecoin.' },
                    { level: 1, name: 'Lander Shibe', upgradeIcon: 'assets/general/icons/lollipop.webp', dps: 24, price: 550000, diamondPrice: 1, upgradeName: 'Candy-Lander Shibe', upgradeDesc: 'Upgrade the Lander Shibe to a Candy-Lander Shibe. Such Improvement', shopDesc: 'Candy-Lander shibe explores other planets and moons in pursuit of dogecoin.' },
                    { level: 2, name: 'Double-Lander Shibe', upgradeIcon: 'assets/general/icons/landerleg.webp', dps: 26, price: 4000000, diamondPrice: 1, upgradeName: 'Double-Lander Shibe', upgradeDesc: 'Upgrade the Lander Shibe to a Double-Lander Shibe.', shopDesc: 'Double-Lander shibe explores other planets and moons in the solar system in pursuit of dogecoin.' },
                    { level: 3, name: 'Triple-Lander Shibe', upgradeIcon: 'assets/general/icons/landerlegs.webp', dps: 35, price: 75000000, diamondPrice: 3, upgradeName: 'Triple-Lander Shibe', upgradeDesc: 'Upgrade the Double-Lander Shibe to a Triple-Lander Shibe.', shopDesc: 'Triple-Lander shibe explores other planets and moons in the solar system in pursuit of dogecoin.' },
                    { level: 4, name: 'Diamond Triple-Lander', upgradeIcon: 'assets/general/icons/diamond-d.webp', dps: 105, price: 175000000, diamondPrice: 5, upgradeName: 'Diamond for the Lander', upgradeDesc: 'Diamond plating for the Triple-Lander Shibe makes it super shiny.', shopDesc: 'Triple-Lander shibe explores other planets and moons in the solar system in pursuit of dogecoin.' },
                    {"level": 5, "name": "Rly Hard Triple-Lander", "upgradeIcon": "assets/general/icons/specialbars.webp", "dps": 268, "price": 340000000, "diamondPrice": 7, "upgradeName": "Really Hardened Lander", "upgradeDesc": "Reallyhardium plating for the Triple-Lander Shibe makes it really hard.", "shopDesc": "Triple-Lander shibe explores other planets and moons in the solar system in pursuit of dogecoin.", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                marsRocket: [
                    { level: 0, name: 'Mars Rocket', dps: 50, shopDesc: 'A rocket to fly to Mars, much red planet, such adventure.' },
                    { level: 1, name: 'Golden Mars Rocket', upgradeIcon: 'assets/general/icons/goldrockets.webp', dps: 90, price: 22500000, diamondPrice: 3, upgradeName: 'Golden Rocket Plating', upgradeDesc: 'Replace the Mars Rocket paper plating with gold. Much improved.', shopDesc: 'A golden rocket to fly to Mars.' },
                    { level: 2, name: 'Diamond Mars Rocket', upgradeIcon: 'assets/general/icons/diamondrockets.webp', dps: 150, price: 85000000, diamondPrice: 5, upgradeName: 'Diamond Rocket Plating', upgradeDesc: 'Replace the Mars Rocket gold plating with Diamond: Very improved.', shopDesc: 'A diamond rocket to fly to Mars.' },
                    {"level": 3, "name": "Really Hard Mars Rocket", "upgradeIcon": "assets/general/icons/specialrockets.webp", "dps": 275, "price": 355000000, "diamondPrice": 7, "upgradeName": "Reallyhardium Rocket Plating", "upgradeDesc": "Replace the Mars Rocket diamond plating with Reallyhardium. Wow.", "shopDesc": "A Reallyhardium rocket to fly to Mars.", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                dogeGate: [
                    { level: 0, name: 'Doge Gate', dps: 155, shopDesc: 'A Doge Gate for instant galaxy-wide dogecoin transfers.' },
                    { level: 1, name: 'Golden Doge Gate', upgradeIcon: 'assets/general/icons/goldbars.webp', dps: 575, price: 6900000000, diamondPrice: 5, upgradeName: 'Golden Gate', upgradeDesc: 'Gold plated Doge Gates.', shopDesc: 'A golden Doge Gate for instant, galaxy-wide dogecoin transfers.' },
                    { level: 2, name: 'Diamond Doge Gate', upgradeIcon: 'assets/general/icons/diamond-d.webp', dps: 1875, price: 9900000000, diamondPrice: 8, upgradeName: 'Diamond Gate', upgradeDesc: 'Diamond plated Doge Gates. Yeah.', shopDesc: 'A diamond Doge Gate for instant, galaxy-wide dogecoin transfers.' },
                    {"level": 3, "name": "Really Hard Doge Gate", "upgradeIcon": "assets/general/icons/specialbars.webp", "dps": 3575, "price": 30000000000, "diamondPrice": 13, "upgradeName": "Really Hard Gate", "upgradeDesc": "Reallyhardium-plated Doge Gates.", "shopDesc": "A really hard Doge Gate for instant galaxy-wide dogecoin transfers.", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                // Mars Helper Upgrades
                marsBase: [
                    { level: 0, name: 'Mars Base', dps: 23, shopDesc: 'A base on Mars to mine ludicrous amounts of Dogecoin.' },
                    { level: 1, name: '2x Mars Base', upgradeIcon: 'assets/general/icons/2x.webp', dps: 31, price: 750000, diamondPrice: 1, upgradeName: 'Double Mars Bases', upgradeDesc: 'Double the amount of Mars bases with smaller bases. Efficiency is key.', shopDesc: 'Two bases on Mars to mine ludicrous amounts of Dogecoin.' },
                    { level: 2, name: '4x Mars Base', upgradeIcon: 'assets/general/icons/4x.webp', dps: 38, price: 6000000, diamondPrice: 2, upgradeName: 'Quad Mars Base', upgradeDesc: 'Quadruple the amount of Mars bases.', shopDesc: 'Four bases on mars to mine ludicrous amounts of Dogecoin.' },
                    { level: 3, name: '36x Mars Base', upgradeIcon: 'assets/general/icons/36x.webp', dps: 47, price: 400000000, diamondPrice: 4, upgradeName: 'Heckin-Ton of Bases', upgradeDesc: 'A heckin lot of Mars Bases. 36 to be exact.', shopDesc: 'A lot of bases on Mars to mine silly amounts of Dogecoin.' },
                    { level: 4, name: '36x Goldy Mars Bases', upgradeIcon: 'assets/general/icons/goldbars.webp', dps: 99, price: 800000000, diamondPrice: 6, upgradeName: 'Spray It With Gold', upgradeDesc: 'Spray the 36x Mars Bases with gold for extra shine.', shopDesc: 'A lot of goldy bases on Mars to mine muchest dogecoins.' },
                    { level: 5, name: '36x Diamondy Mars Bases', upgradeIcon: 'assets/general/icons/diamond-d.webp', dps: 280, price: 1600000000, diamondPrice: 10, upgradeName: 'Apply To Outside Only', upgradeDesc: 'Expensive diamond coating for the 36x Mars Bases.', shopDesc: 'Shiny bases on Mars to mine ridiculous amounts of Dogecoin.' },
                    {"level": 6, "name": "36x Rly Hard Mars Bases", "upgradeIcon": "assets/general/icons/special-d.webp", "dps": 520, "price": 2100000000, "diamondPrice": 10, "upgradeName": "Don't Spill Any", "upgradeDesc": "Replace the diamond coating of the Mars Bases with Reallyhardium.", "shopDesc": "Reallyhardium coated bases on Mars to mine all the dogecoins.", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                partyShibe: [
                    { level: 0, name: 'Party Shibe', dps: 26, shopDesc: 'Cool space rave party shibes to rave much dogecoin.' },
                    { level: 1, name: 'Rave Shibe', upgradeIcon: 'assets/general/icons/greenline.webp', dps: 35, price: 610000, diamondPrice: 1, upgradeName: 'Proper Raving', upgradeDesc: 'Give the Party Shibe some glowsticks instead of pickaxes.', shopDesc: 'Cool space rave party shibes to rave much Dogecoin. With glowsticks.' },
                    { level: 2, name: 'DW Rave Shibe', upgradeIcon: 'assets/general/icons/greencross.webp', dps: 40, price: 1250000, diamondPrice: 2, upgradeName: 'Dual-Wielding Ravers', upgradeDesc: 'Additional glowsticks for Rave Shibes.', shopDesc: 'Cool space rave party shibes to rave much dogecoin.' },
                    { level: 3, name: 'Sugar-Rushed Shibe', upgradeIcon: 'assets/general/icons/candypile.webp', dps: 78, price: 38000000, diamondPrice: 3, upgradeName: 'Sugar Baby', upgradeDesc: 'Give the shibes lots of sugary treats to speed them up.', shopDesc: 'Cool sugary rave party shibes to rave much dogecoin.' },
                    { level: 4, name: 'Shiny E-Shibe', upgradeIcon: 'assets/general/icons/d-d.webp', dps: 139, price: 99000000, diamondPrice: 5, upgradeName: 'Shiny Shibe', upgradeDesc: 'Give the shibes shiny golden shirts for higher blingability.', shopDesc: 'Cool shiny space rave party shibe to race much dogecoin.' },
                    { level: 5, name: 'Very Shiny E-Shibe', upgradeIcon: 'assets/general/icons/diamond-d.webp', dps: 199, price: 320000000, diamondPrice: 7, upgradeName: 'Shinier Shibe', upgradeDesc: 'Give the shibes shiny diamond shirts for even more bling.', shopDesc: 'Cool shiny space rave party shibe to rave much dogecoin.' },
                    {"level": 6, "name": "Most Shiny E-Shibe", "upgradeIcon": "assets/general/icons/special-d.webp", "dps": 428, "price": 900000000, "diamondPrice": 9, "upgradeName": "Shiniest Shibe", "upgradeDesc": "Give the shibes shiniest Reallyhardium shirts for the most bling, ever.", "shopDesc": "Coolest shiny space rave party shibe to rave much dogecoin.", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                curiosiDoge: [
                    { level: 0, name: 'CuriosiDoge', dps: 30, shopDesc: 'Much curious Doge to explore Mars riches.' },
                    { level: 1, name: 'CuriosiDoge', upgradeIcon: 'assets/general/icons/partysticks.webp', dps: 38, price: 620000, diamondPrice: 1, upgradeName: 'Party Mode', upgradeDesc: 'Engage Party Mode for CuriousiDoge.', shopDesc: 'Much curious Doge to explore Mars riches. Party mode.' },
                    { level: 2, name: 'CuriosiDoge', upgradeIcon: 'assets/general/icons/partyhydra.webp', dps: 48, price: 2250000, diamondPrice: 2, upgradeName: 'Party Hydra', upgradeDesc: 'The Party Hydra upgrade gives CuriosiDoge a lot more heads.', shopDesc: 'Much curious Doge to explore Mars riches. Party hydra.' },
                    {"level": 3, "name": "CuriousiDoge", "upgradeIcon": "assets/general/icons/shinyrocket.webp", "dps": 59, "price": 49900000, "diamondPrice": 4, "upgradeName": "Rocket Mode", "upgradeDesc": "Replace CuriosiDoge wheels with rockets. Much more curiousi-able.", "shopDesc": "Much curious Doge to explore Mars riches. Rocket party hydra.", "repeatable": true}
                ],
                djKittenz: [
                    { level: 0, name: 'DJ Kittenz', dps: 45, shopDesc: 'Very music creation. DJ Kittenz specializes in House music.' },
                    { level: 1, name: 'DJ Kittenz', upgradeIcon: 'assets/general/icons/disco.webp', dps: 57, price: 1450000, diamondPrice: 1, upgradeName: 'D.I.S.C.O.', upgradeDesc: 'It\'s disco time.', shopDesc: 'Very music creation. Now playing disco.' },
                    { level: 2, name: 'DJ Kittenz', upgradeIcon: 'assets/general/icons/greenswag.webp', dps: 75, price: 37500000, diamondPrice: 3, upgradeName: 'Swag Upgrade', upgradeDesc: 'Give DJ Kittenz some fresh swag.', shopDesc: 'Very music creation. Now playing hiphop.' },
                    { level: 3, name: 'DJ Kittenz', upgradeIcon: 'assets/general/icons/purpleswag.webp', dps: 99, price: 120000000, diamondPrice: 4, upgradeName: 'Wash-Oops', upgradeDesc: 'Accidentally color DJ Kittenz swag purple in the washer.', shopDesc: 'Very music creation. Now playing: EDM.' },
                    { level: 4, name: 'DJ Kittenz', upgradeIcon: 'assets/general/icons/goldendarkcoin.webp', dps: 133, price: 290000000, diamondPrice: 5, upgradeName: 'Golden Hits', upgradeDesc: 'Enter the golden disco era with DJ Kittenz.', shopDesc: 'Very music creation. Now playing: Golden Hits.' },
                    { level: 5, name: 'DJ Kittenz', upgradeIcon: 'assets/general/icons/diamonddarkcoin.webp', dps: 200, price: 525000000, diamondPrice: 7, upgradeName: 'Diamond Hits?', upgradeDesc: 'There\'s a diamond disco era. Feat. DJ Kittenz', shopDesc: 'Very music creation. Now playing: Diamond Hits.' },
                    {"level": 6, "name": "DJ Kittenz", "upgradeIcon": "assets/general/icons/specialdarkcoin.webp", "dps": 440, "price": 900000000, "diamondPrice": 9, "upgradeName": "Really Hard Hits", "upgradeDesc": "Hype up DJ Kittenz with the hardest hits ever.", "shopDesc": "Very music creation. Now playing: Best Hits.", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                spaceBass: [
                    { level: 0, name: 'Space Bass', dps: 70, shopDesc: 'It is said to vibrate the essence of gravity itself.' },
                    { level: 1, name: 'Golden Space Bass', upgradeIcon: 'assets/general/icons/goldbars.webp', dps: 122, price: 265000000, diamondPrice: 4, upgradeName: 'Golden Bass', upgradeDesc: 'Give the Space Bass the Golden Bass upgrade for extra bling.', shopDesc: 'Golden vibrations. In space.' },
                    { level: 2, name: 'Diamond Space Bass', upgradeIcon: 'assets/general/icons/diamond-d.webp', dps: 229, price: 565000000, diamondPrice: 7, upgradeName: 'Diamond Bass', upgradeDesc: 'Give the Space Bass the Diamond Bass upgrade for very shine.', shopDesc: 'Diamond vibrations in space.' },
                    {"level": 3, "name": "Really Hard Space Bass", "upgradeIcon": "assets/general/icons/special-d.webp", "dps": 450, "price": 1000000000, "diamondPrice": 9, "upgradeName": "Really Hard Vibrations", "upgradeDesc": "Give the Space Bass the Reallyhardium Bass upgrade.", "shopDesc": "Really hard vibrations in space. Vibration reach unmeasurable.", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                jupiterRocket: [
                    { level: 0, name: 'Jupiter Rocket', dps: 100, shopDesc: 'A rocket to fly to Jupiter.' },
                    { level: 1, name: 'Golden Jupiter Rocket', upgradeIcon: 'assets/general/icons/goldrockets.webp', dps: 200, price: 125000000, diamondPrice: 4, upgradeName: 'Golden Rocket Plating', upgradeDesc: 'Replace the Jupiter Rocket wooden plating with gold. Much improved.', shopDesc: 'A golden rocket to fly to Jupiter.' },
                    { level: 2, name: 'Diamond Jupiter Rocket', upgradeIcon: 'assets/general/icons/diamondrockets.webp', dps: 298, price: 240000000, diamondPrice: 6, upgradeName: 'Diamond Rocket Plating', upgradeDesc: 'Replace the Jupiter Rocket gold plating with diamond. Very improved.', shopDesc: 'A diamond rocket to fly to Jupiter.' },
                    {"level": 3, "name": "Really Hard Jupiter Rocket", "upgradeIcon": "assets/general/icons/specialrockets.webp", "dps": 498, "price": 1500000000, "diamondPrice": 9, "upgradeName": "Reallyhardium Rocket Plating", "upgradeDesc": "Replace the Jupiter Rocket diamond plating with Reallyhardium. Wow.", "shopDesc": "A really hard rocket to fly to Jupiter.", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                // Jupiter Helper Upgrades
                cloudBase: [
                    { level: 0, name: 'Cloud Base', dps: 45, shopDesc: 'A flying base in the clouds of Jupiter.' },
                    { level: 1, name: 'Cloud Base', upgradeIcon: 'assets/general/icons/signal.webp', dps: 139, price: 30000000, diamondPrice: 2, upgradeName: 'Sensor Package', upgradeDesc: 'Improve the scanning capabilities of the Cloud Base.', shopDesc: 'A flying base in the clouds of Jupiter.' },
                    { level: 2, name: 'Smart Cloud Base', upgradeIcon: 'assets/general/icons/cpus.webp', dps: 169, price: 100000000, diamondPrice: 3, upgradeName: 'AI Package', upgradeDesc: 'An artificial intelligence control system for the Cloud Base.', shopDesc: 'A flying base in the clouds of Jupiter.' },
                    { level: 3, name: 'Smart Golden Cloud Base', upgradeIcon: 'assets/general/icons/goldbars.webp', dps: 310, price: 285000000, diamondPrice: 4, upgradeName: 'What Else But Gold', upgradeDesc: 'Gold plating for the Cloud Base increases its power.', shopDesc: 'A golden flying base in the clouds of Jupiter.' },
                    { level: 4, name: 'Smart Diamond Cloud Base', upgradeIcon: 'assets/general/icons/diamond-d.webp', dps: 446, price: 780000000, diamondPrice: 6, upgradeName: 'Are Those Real Diamonds?', upgradeDesc: 'Diamond plating for the Cloud Base, much shiny.', shopDesc: 'A diamond flying base in the clouds of Jupiter.' },
                    {"level": 5, "name": "Smart Super Cloud Base", "upgradeIcon": "assets/general/icons/specialbars.webp", "dps": 1333, "price": 1500000000, "diamondPrice": 9, "upgradeName": "Reallyhardium Package", "upgradeDesc": "The ultimate plating for the Cloud Base. Super shiny.", "shopDesc": "A super shiny flying base in the clouds of Jupiter.", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                superShibe: [
                    { level: 0, name: 'Super Shibe', dps: 50, shopDesc: 'Strong shibes who fly around mining everything.' },
                    { level: 1, name: 'Juiced Super Shibe', upgradeIcon: 'assets/general/icons/int.webp', dps: 79, price: 35000000, diamondPrice: 3, upgradeName: 'Cloud Juice', upgradeDesc: 'Adds some of Jupiters gasses to the Super Shibe\'s protein shakes.', shopDesc: 'Scary-strong shibe enhanced with Jupiter Juice.' },
                    { level: 2, name: 'Juiced Super Shibe', upgradeIcon: 'assets/general/icons/helmets-gold.webp', dps: 140, price: 77000000, diamondPrice: 4, upgradeName: 'Helmet Factor Two', upgradeDesc: 'Shiny golden helmet for the Super Shibes.', shopDesc: 'Scary-strong shibe enhanced with Jupiter juice and golden helmet.' },
                    { level: 3, name: 'Juiced Super Shibe', upgradeIcon: 'assets/general/icons/helmets-diamond.webp', dps: 209, price: 180000000, diamondPrice: 6, upgradeName: 'We Can Do Better', upgradeDesc: 'Very hard diamond helmet for the Super Shibes.', shopDesc: 'Scary-strong shibe enhanced with Jupiter juice and diamond helmet.' },
                    {"level": 4, "name": "Rly Hard Juiced Super Shibe", "upgradeIcon": "assets/general/icons/helmets-special.webp", "dps": 1000, "price": 850000000, "diamondPrice": 8, "upgradeName": "The Best Protection", "upgradeDesc": "A super strong Reallyhardium helmet for the Super Shibes.", "shopDesc": "Scary-strong shibe enhanced with Jupiter juice and amazing helmet.", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                dogeAirShip: [
                    { level: 0, name: 'Doge Air Ship', dps: 80, shopDesc: 'A slow flying ship piloted by astro shibes.' },
                    { level: 1, name: 'Doge Rocket Ship', upgradeIcon: 'assets/general/icons/rockets.webp', dps: 140, price: 160000000, diamondPrice: 5, upgradeName: 'Rockets Beats Balloons', upgradeDesc: 'Replace balloons with rockets because ..awesome.', shopDesc: 'A very fast flying ship piloted by astro shibes.' },
                    { level: 2, name: 'Doge Rocket Ship', upgradeIcon: 'assets/general/icons/goldrockets.webp', dps: 180, price: 220000000, diamondPrice: 6, upgradeName: 'Golden Rockets', upgradeDesc: 'Replace the metal of the rockets with gold.', shopDesc: 'A very fast flying ship piloted by astro shibes.' },
                    { level: 3, name: 'Doge Rocket Ship', upgradeIcon: 'assets/general/icons/diamondrockets.webp', dps: 230, price: 350000000, diamondPrice: 7, upgradeName: 'Diamond Rockets', upgradeDesc: 'Replace the metal of the rockets with diamonds.', shopDesc: 'A very fast flying ship piloted by astro shibes.' },
                    {"level": 4, "name": "Really Hard Rocket Ship", "upgradeIcon": "assets/general/icons/specialrockets.webp", "dps": 1150, "price": 950000000, "diamondPrice": 10, "upgradeName": "Reallyhardiumated Rockets", "upgradeDesc": "Replace the metal of the rockets with Reallyhardium.", "shopDesc": "A very, very fast flying ship piloted by astro shibes.", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                flyingDoggo: [
                    { level: 0, name: 'Flying Doggo', dps: 120, shopDesc: 'It comes wif two sub-woofers.' },
                    { level: 1, name: 'Flying Doggo', upgradeIcon: 'assets/general/icons/bling.webp', dps: 140, price: 65000000, diamondPrice: 3, upgradeName: 'Doggo Bling', upgradeDesc: 'Give the Flying Doggo some bling-bling.', shopDesc: 'It comes wif two sub-woofers.' },
                    { level: 2, name: 'Rocket-Boosted Flying Doggo', upgradeIcon: 'assets/general/icons/shinyrockets.webp', dps: 165, price: 100000000, diamondPrice: 4, upgradeName: 'Gotta Go Fast', upgradeDesc: 'Attach rocket boosters on top of the Flying Doggo.', shopDesc: 'It comes wif two sub-woofers.' },
                    { level: 3, name: 'Gold-Rocketed Flying Doggo', upgradeIcon: 'assets/general/icons/goldrockets.webp', dps: 260, price: 280000000, diamondPrice: 5, upgradeName: 'Gotta Go Faster', upgradeDesc: 'Replace the Flying Doggos rockets with shiny golden ones.', shopDesc: 'It comes wif two sub-woofers. Goldified.' },
                    { level: 4, name: 'Diamond-Rocketed Flying Doggo', upgradeIcon: 'assets/general/icons/diamondrockets.webp', dps: 485, price: 510000000, diamondPrice: 7, upgradeName: 'Gotta Go Really Fast', upgradeDesc: 'Replace the Flying Doggos rockets with shinier diamond ones.', shopDesc: 'It comes wif two sub-woofers. Diamondfied.' },
                    {"level": 5, "name": "Super-Fast Hard Flying Doggo", "upgradeIcon": "assets/general/icons/specialrockets.webp", "dps": 1200, "price": 1000000000, "diamondPrice": 9, "upgradeName": "Is This Legal?", "upgradeDesc": "Replace the Flying Doggos rockets with superfast Reallyhardium ones.", "shopDesc": "It comes wif two sub-woofers.", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                tardogeis: [
                    { level: 0, name: 'TARDogeIS', dps: 150, shopDesc: 'Time and Relative Doge in Space exists everywhere at the same time. Sort of.' },
                    { level: 1, name: 'TARDogeIS', upgradeIcon: 'assets/general/icons/rocket.webp', dps: 192, price: 195000000, diamondPrice: 5, upgradeName: 'Rockets Equals Wow', upgradeDesc: 'Add rockets to the TARDogeIS for better maneuverability.', shopDesc: 'Time and Relative Doge in Space exists everywhere at the same time. Sort of.' },
                    { level: 2, name: 'TARDogeIS', upgradeIcon: 'assets/general/icons/goldrocket.webp', dps: 300, price: 300000000, diamondPrice: 6, upgradeName: 'Better, Faster Rockets', upgradeDesc: 'Golden rockets for the TARDogeIS for much speed.', shopDesc: 'Time and Relative Doge in Space exists everywhere at the same time. Sort of.' },
                    { level: 3, name: 'TARDogeIS', upgradeIcon: 'assets/general/icons/diamondrockets.webp', dps: 499, price: 480000000, diamondPrice: 7, upgradeName: 'Hard Rock Ets', upgradeDesc: 'Diamond rockets for the TARDogeIS for super hard shinyness.', shopDesc: 'Time and Relative Doge in Space exists everywhere at the same time. Sort of.' },
                    {"level": 4, "name": "TARDogeIS", "upgradeIcon": "assets/general/icons/specialrockets.webp", "dps": 1399, "price": 1150000000, "diamondPrice": 10, "upgradeName": "These Rockets Go To 11", "upgradeDesc": "Reallyhardium rockets for the TARDogeIS.", "shopDesc": "Time and Relative Doge in Space exists everywhere at the same time. Sort of.", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                dogeStar: [
                    { level: 0, name: 'DogeStar', dps: 420, shopDesc: 'A space station the size of a small moon, equipped with a mining laser.' },
                    { level: 1, name: 'Golden DogeStar', upgradeIcon: 'assets/general/icons/goldbars.webp', dps: 920, price: 7500000000, diamondPrice: 6, upgradeName: 'That\'s Gold Jerry!', upgradeDesc: 'Replace the hull of the DogeStar with golden plates.', shopDesc: 'A golden space station the size of a small moon, equipped with a mining laser.' },
                    { level: 2, name: 'Diamond DogeStar', upgradeIcon: 'assets/general/icons/diamond-d.webp', dps: 2770, price: 12500000000, diamondPrice: 10, upgradeName: 'Are Those Diamonds Jerry?!', upgradeDesc: 'Replace the hull of the DogeStar with diamond plates.', shopDesc: 'A diamond space station the size of a small moon, equipped with a mining laser.' },
                    {"level": 3, "name": "Really Hard DogeStar", "upgradeIcon": "assets/general/icons/specialbars.webp", "dps": 4820, "price": 20000000000, "diamondPrice": 13, "upgradeName": "What IS that Jerry?", "upgradeDesc": "Replace the hull of the DogeStar with Reallyhardium. Strongu.", "shopDesc": "A really hard station the size of a small moon, equipped with a mining laser.", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                // Titan Helper Upgrades
                titanBase: [
                    { level: 0, name: 'Titan Base', dps: 165, shopDesc: 'A base on Titan to mine dogecoins and manufacture robots.' },
                    { level: 1, name: 'Golden Titan Base', upgradeIcon: 'assets/general/icons/goldbars.webp', dps: 400, price: 1000000000, diamondPrice: 4, upgradeName: 'Golden Plates', upgradeDesc: 'Replace the plating of the Titan Base with gold plates.', shopDesc: 'A golden base on Titan to mine dogecoins and manufacture robots.' },
                    { level: 2, name: 'Diamond Titan Base', upgradeIcon: 'assets/general/icons/diamond-d.webp', dps: 700, price: 2000000000, diamondPrice: 7, upgradeName: 'Diamond Plates', upgradeDesc: 'Replace the plating of the Titan Base with diamond plates.', shopDesc: 'A diamond base on Titan to mine dogecoins and manufacture robots.' },
                    {"level": 3, "name": "Really Hard Titan Base", "upgradeIcon": "assets/general/icons/specialbars.webp", "dps": 1800, "price": 4000000000, "diamondPrice": 9, "upgradeName": "Reallyhardium Plates", "upgradeDesc": "Replace the plating of the Titan Base with Reallyhardium plates.", "shopDesc": "A Reallyhardium base on Titan to mine dogecoins and manufacture robots. Wow.", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                roboShibe: [
                    { level: 0, name: 'Robo Shibe', dps: 195, shopDesc: 'A robotic shibe to mine the riches on Titan.' },
                    { level: 1, name: 'Smart-ish Robo Shibe', upgradeIcon: 'assets/general/icons/cpus.webp', dps: 352, price: 195000000, diamondPrice: 4, upgradeName: 'Deeper Learning', upgradeDesc: 'Machine-Learning chip for the Robo Shibe to make it smarter.', shopDesc: 'A smart-ish robotic shibe to mine Titan\'s Riches.' },
                    { level: 2, name: 'Superintelligent Robo Shibe', upgradeIcon: 'assets/general/icons/cpus.webp', dps: 502, price: 295000000, diamondPrice: 4, upgradeName: 'SuperIntelligence', upgradeDesc: 'Upgrade the Robo Shibe AI chip to make it superintelligent.', shopDesc: 'A superintelligent robotic shibe to mine Titan\'s Riches.' },
                    { level: 3, name: 'Superintelligent Golden Shibe', upgradeIcon: 'assets/general/icons/goldbars.webp', dps: 895, price: 620000000, diamondPrice: 5, upgradeName: 'Super-Gold', upgradeDesc: 'Goldifies the Robo Shibe.', shopDesc: 'A superintelligent robotic shibe to mine Titan\'s Riches.' },
                    { level: 4, name: 'Superintelligent Diamond Shibe', upgradeIcon: 'assets/general/icons/diamond-d.webp', dps: 1337, price: 1337000000, diamondPrice: 7, upgradeName: 'Super-Hard', upgradeDesc: 'Diamond body for the Robo Shibe.', shopDesc: 'A superintelligent robotic shibe to mine Titan\'s Riches.' },
                    {"level": 5, "name": "Superintelligent Rly Hard Shibe", "upgradeIcon": "assets/general/icons/specialbars.webp", "dps": 3337, "price": 2337000000, "diamondPrice": 10, "upgradeName": "Super Duper", "upgradeDesc": "Reallyhardium body for the Robo Shibe.", "shopDesc": "A superintelligent robotic shibe to mine Titan's Riches", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                heavyDogeWalker: [
                    { level: 0, name: 'Heavy Doge Walker', dps: 400, shopDesc: 'Large vehicle. Much cargo, Very carry.' },
                    { level: 1, name: 'Heavy Doge Hoverer', upgradeIcon: 'assets/general/icons/pad.webp', dps: 850, price: 7200000000, diamondPrice: 4, upgradeName: 'Advanced Hover Tech', upgradeDesc: 'Turn the Heavy Doge Walker into a hovercraft.', shopDesc: 'Large hovercraft. Much cargo. Very hover.' },
                    { level: 2, name: 'Heavy Diamond Doge Hoverer', upgradeIcon: 'assets/general/icons/diamond-d.webp', dps: 1700, price: 20100000000, diamondPrice: 7, upgradeName: 'Advanced Diamond Tech', upgradeDesc: 'Put shiny diamond tech on the Heavy Doge Hoverer.', shopDesc: 'Large hovercraft. Much cargo. Very diamond.' },
                    {"level": 3, "name": "Really Hard Doge Hoverer", "upgradeIcon": "assets/general/icons/special-d.webp", "dps": 3500, "price": 39000000000, "diamondPrice": 12, "upgradeName": "Reallyhardium Advantages", "upgradeDesc": "Upgrade the tech of the Heavy Doge Hoverer to maximum overdrive.", "shopDesc": "Large hovercraft. Much cargo. Very, very wow.", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                coinSeeker5000: [
                    { level: 0, name: 'Coin Seeker 5000', dps: 498, shopDesc: 'Advanced robotic dogecoin seeking predator.' },
                    { level: 1, name: 'Coin Seeker 6000', upgradeIcon: 'assets/general/icons/goldpack.webp', dps: 900, price: 6400000000, diamondPrice: 4, upgradeName: 'Golden Backpack', upgradeDesc: 'Give the Coin Seeker 5000 a backpack to carry much dogecoins.', shopDesc: 'Advanced robotic dogecoin seeking predator. With backpack.' },
                    { level: 2, name: 'Coin Seeker 7000', upgradeIcon: 'assets/general/icons/goldbars.webp', dps: 1800, price: 23500000000, diamondPrice: 5, upgradeName: 'Needs More Gold', upgradeDesc: 'Polish the Coin Seeker so it can seek out more coins.', shopDesc: 'Advanced robotic dogecoin seeking predator. Extra shiny.' },
                    { level: 3, name: 'Coin Seeker 8000', upgradeIcon: 'assets/general/icons/diamond-d.webp', dps: 3420, price: 34000000000, diamondPrice: 7, upgradeName: 'Switch To Diamond', upgradeDesc: 'Switch out the Coin Seeker body for a diamond hull.', shopDesc: 'Advanced robotic dogecoin seeking predator. Extra expensive.' },
                    {"level": 4, "name": "Coin Seeker 9000+", "upgradeIcon": "assets/general/icons/specialbars.webp", "dps": 4400, "price": 6400000000, "diamondPrice": 11, "upgradeName": "I Want To Be", "upgradeDesc": "The very best hull for the Coin Seeker, made out of Reallyhardium.", "shopDesc": "Advanced robotic dogecoin seeking predator, the best of its kind.", "repeatable": true, "requiresAwakenedAltar": true}
                ],
                timeTravelDRex: [
                    { level: 0, name: 'Time Travel D-Rex', dps: 620, shopDesc: 'Half terrifying, half amazing. Rawr.' },
                    { level: 1, name: 'Time Travel Laser D-Rex', upgradeIcon: 'assets/general/icons/lasers.webp', dps: 1100, price: 9000000000, diamondPrice: 4, upgradeName: 'Freakin Lazorz', upgradeDesc: 'Equip the Time Travel D-Rex with freakin Lazorz man.', shopDesc: 'Half terrifying, half amazing, with lazors.' },
                    { level: 2, name: 'Rocket Boosted Time Travel Laser D-Rex', upgradeIcon: 'assets/general/icons/shinyrocket.webp', dps: 1850, price: 17000000000, diamondPrice: 5, upgradeName: 'Rocketrex', upgradeDesc: 'Rocket upgrade for D-Rex, Because faster.', shopDesc: 'Mostly terrifying, yet amazing.' },
                    { level: 3, name: 'Xtra Rocket Boosted Time Travel Laser D-Rex', upgradeIcon: 'assets/general/icons/shinyrockets.webp', dps: 2950, price: 20000000000, diamondPrice: 6, upgradeName: 'More Rocket', upgradeDesc: 'More rocket for Time Travel D-Rex, Pffaaaiuuueuu.', shopDesc: '100% terrifying.' },
                    { level: 4, name: 'Smart Rocket Time Travel Laser D-Rex', upgradeIcon: 'assets/general/icons/cpus.webp', dps: 3650, price: 50000000000, diamondPrice: 12, upgradeName: 'Clever Girl', upgradeDesc: 'Implant the D-Rex with a cybernetic implant to make it smart.', shopDesc: '1000% terrifying.', repeatable: true, requiresAwakenedAltar: true }
                ],
                altarOfTheSunDoge: [
                    { level: 0, name: 'Altar of the SunDoge', dps: 1200, shopDesc: 'An altar of calling to an enlightened Doge above our WOW.' },
                    { level: 1, name: 'Awakened Altar of the SunDoge', upgradeIcon: 'assets/general/icons/mball.webp', dps: 1900, price: 200000000000, diamondPrice: 15, upgradeName: 'Awaken the Inner SunDoge', upgradeDesc: 'Awaken the altar by coating it in exceedingly hot Titan magma.', shopDesc: 'An awakened altar of calling to an enlightened Doge above our WOW.' },
                    { level: 2, name: 'Shiny Awakened Altar of the SunDoge', upgradeIcon: 'assets/general/icons/diamond-d.webp', dps: 4999, price: 600000000000, diamondPrice: 25, upgradeName: 'Cover Me With Diamonds!', upgradeDesc: 'Show your loyalty to the SunDoge by coating the Altar with Diamonds. Very shiny.', shopDesc: 'A very shiny awakened altar of calling to an enlightened Doge above our WOW. Much loyalty. Very Sun.' }
                ]
            }
        };
    }

    getHelperCost(helperType, owned) {
        const helper = ['helpers', 'moonHelpers', 'marsHelpers', 'jupiterHelpers', 'titanHelpers']
            .map(category => this.shopData[category]?.[helperType]).find(Boolean);
        if (!helper) return Infinity;
        return this.game.getHelperCost(helper.baseCost, owned, helperType);
    }

    canAffordHelper(helperType) {
        const category = this.game.getHelperCategoryForLevel();
        const helper = this.shopData[category]?.[helperType];
        if (!helper || this.game.isWorldHelperAvailable?.(helperType) === false) return false;
        const owned = this.getHelperCounts(this.game.getHelperArrayForLevel()).get(helperType) || 0;
        return this.game.dogecoins >= this.game.getHelperCost(helper.baseCost, owned, helperType);
    }

    // Keep the legacy entry point on the same purchase, placement and save path
    // as keyboard, touch and controller purchases.
    buyHelper(helperType) {
        return this.game.buyHelper(helperType);
    }

    // Helper upgrade methods
    getHelperUpgradeLevel(helperType) {
        const level = this.game.helperUpgradeLevels?.[helperType];
        return Number.isSafeInteger(level) && level >= 0 ? level : 0;
    }

    getHelperUpgradeData(helperType) {
        return this.shopData.helperUpgrades?.[helperType] || null;
    }

    getNextHelperUpgrade(helperType) {
        const upgrades = this.getHelperUpgradeData(helperType);
        if (!upgrades) return null;

        const currentLevel = this.getHelperUpgradeLevel(helperType);
        const nextLevel = currentLevel + 1;

        return this.isHelperUpgradeUnlocked(helperType, nextLevel) ? this.getHelperUpgradeAtLevel(helperType, nextLevel) : null;
    }

    isHelperUpgradeUnlocked(helperType, level = this.getHelperUpgradeLevel(helperType) + 1) {
        if(window.DogeMinerLateProgression)return window.DogeMinerLateProgression.isUnlocked(this.game,helperType,level);
        // Main startup requires the progression module; this branch supports
        // catalog-only consumers without manufacturing the old global unlock.
        return !this.getHelperUpgradeData(helperType)?.at(-1)?.requiresAwakenedAltar;

    }

    getCurrentHelperUpgradeInfo(helperType) {
        const upgrades = this.getHelperUpgradeData(helperType);
        if (!upgrades) return null;

        const currentLevel = this.getHelperUpgradeLevel(helperType);
        return this.getHelperUpgradeAtLevel(helperType, currentLevel) || upgrades[0];
    }

    getHelperUpgradeAtLevel(helperType, level) {
        const upgrades = this.getHelperUpgradeData(helperType);
        if (!upgrades || !Number.isSafeInteger(level) || level < 0) return null;
        if (level < upgrades.length) return upgrades[level];

        const terminal = upgrades[upgrades.length - 1];
        if (!terminal.repeatable) return null;
        const tier = level - terminal.level;
        const curious = helperType === 'curiosiDoge';
        const suffix = this.formatUpgradeTier(tier + 1);
        const coinStep = terminal.price * (curious ? 1.18 : 1.01) + terminal.price / (curious ? 5 : 20);
        const dpsStep = terminal.dps * (curious ? 1.01 : 1.05) + terminal.diamondPrice / (curious ? 2 : 1);
        const diamondStep = 1 + Math.round(terminal.diamondPrice / 4) + (curious ? 1 : 0);
        // The reference accumulates each step before rounding. Multiplying the
        // step by the tier rounds half-boundaries differently for some helpers.
        let price = 0;
        let dps = 0;
        for (let step = 0; step < tier; step++) {
            price += coinStep;
            dps += dpsStep;
        }
        return {
            ...terminal,
            level,
            name: `${terminal.name} ${suffix}`,
            upgradeName: `${terminal.upgradeName} ${suffix}`,
            upgradeDesc: 'An improved version of the current upgrade.',
            price: Math.round(price),
            dps: Math.round(dps),
            diamondPrice: terminal.diamondPrice + Math.round(diamondStep * tier + (curious && tier > 1 ? 1 : 0)),
            spriteLevel: terminal.level
        };
    }

    formatUpgradeTier(value) {
        // Roman numerals match the reference. Very large tiers use a compact
        // thousands count rather than allocating a string with millions of Ms.
        const thousands = Math.floor(value / 1000);
        let result = thousands > 20 ? `${thousands}×M` : 'M'.repeat(thousands);
        let remainder = value % 1000;
        for (const [amount, numeral] of [[900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]) {
            while (remainder >= amount) {
                result += numeral;
                remainder -= amount;
            }
        }
        return result;
    }

    getHelperSpriteLevel(helperType, level) {
        const upgrades = this.getHelperUpgradeData(helperType);
        if (!upgrades) return 0;
        return Math.min(Number.isSafeInteger(level) && level >= 0 ? level : 0, upgrades.length - 1);
    }

    getHelperCounts(helpers) {
        // A snapshot belongs to one synchronous refresh; purchases, imports and
        // planet changes can replace helper arrays without cache invalidation.
        const groups = helpers ? [helpers] : ['helpers', 'moonHelpers', 'marsHelpers', 'jupiterHelpers', 'titanHelpers']
            .map(key => this.game[key] || []);
        const counts = new Map();
        for (const group of groups) for (const helper of group) {
            const type = helper.type;
            counts.set(type, (counts.get(type) || 0) + 1);
        }
        return counts;
    }

    getOwnedHelperCount(helperType, counts) {
        if (counts) return counts.get(helperType) || 0;
        let count = 0;
        for (const key of ['helpers', 'moonHelpers', 'marsHelpers', 'jupiterHelpers', 'titanHelpers']) {
            for (const helper of this.game[key] || []) if (helper.type === helperType) count++;
        }
        return count;
    }

    canAffordHelperUpgrade(helperType, currency = 'dogecoins', counts) {
        const nextUpgrade = this.getNextHelperUpgrade(helperType);
        if (!nextUpgrade || this.getOwnedHelperCount(helperType, counts) < 1) return false;
        const price = currency === 'dogecoins' ? nextUpgrade.price : currency === 'dogediamonds' ? nextUpgrade.diamondPrice : undefined;
        return Number.isFinite(price) && price > 0 && this.game[currency] >= price;
    }

    hasHelperUpgradeAvailable(helperType) {
        return this.getNextHelperUpgrade(helperType) !== null;
    }

    buyHelperUpgrade(helperType, currency = 'dogecoins', expectedLevel) {
        if(window.DogeMinerUpgradePresentation?.isTypeBusy(this.game,helperType))return false;
        const nextUpgrade = this.getNextHelperUpgrade(helperType);
        if (!nextUpgrade) {
            this.game.showNotification(this.isHelperUpgradeUnlocked(helperType) ? 'Max upgrade level reached!' : 'Discover the required Robo-Yoga or Reallyhardium milestone to unlock this upgrade.');
            return false;
        }

        // Both buttons buy the same next level. A stale card must not charge
        // either currency for a level that has already been purchased.
        if (expectedLevel !== undefined && expectedLevel !== nextUpgrade.level) return false;
        if (this.getOwnedHelperCount(helperType) < 1) return false;
        if (!this.canAffordHelperUpgrade(helperType, currency)) {
            this.game.showNotification(currency === 'dogediamonds' ? 'Not enough Dogediamonds!' : 'Not enough Dogecoins!');
            return false;
        }

        const receipt=window.DogeMinerUpgradePresentation?.capture(this.game,helperType,nextUpgrade);
        const g=this.game,before={...g};
        g[currency]-=currency==='dogediamonds'?nextUpgrade.diamondPrice:nextUpgrade.price;
        g.helperUpgradeLevels={...(g.helperUpgradeLevels||{}),[helperType]:nextUpgrade.level};
        // Consume the actual found offer in the same durable purchase.
        g.helperUpgradeOffers={...(g.helperUpgradeOffers||{})};
        const slots=g.helperUpgradeOffers[g.currentLevel];
        if(Array.isArray(slots))g.helperUpgradeOffers[g.currentLevel]=slots.map(type=>type===helperType?null:type);
        if(g.searchdogeDiscovery)g.searchdogeDiscovery=JSON.parse(JSON.stringify(g.searchdogeDiscovery));
        g.delaySearchdogeDiscovery?.();
        let saved=false;
        try{
            g.updateDPS();
            const save=window.saveManager;
            saved=typeof save?.commitHelperUpgrade==='function'?save.commitHelperUpgrade()===true:save?.saveGame(false)===true;
        }catch(error){console.error('Could not save helper upgrade:',error);}
        if(!saved){
            for(const key of Object.keys(g))if(!Object.hasOwn(before,key))delete g[key];
            Object.assign(g,before);g.updateDPS();g.showNotification?.('Your upgrade could not be saved. Please try again.');return false;
        }
        if(currency==='dogediamonds'){g.flashDiamondAmount?.('red');g.updateDiamondCounter?.();}
        else g.flashDogecoinAmount?.('red');
        if(window.DogeMinerUpgradePresentation)window.DogeMinerUpgradePresentation.begin(g,helperType,nextUpgrade,receipt);
        else g.updateHelperSpritesByType(helperType);
        g.updateUI();g.updateShopPrices();
        window.audioManager?.playSound(currency==='dogediamonds'?'notification_soft3':'ching');
        window.uiManager?.updateUpgradeTabCount?.();

        return true;
    }

}

// Global shop manager instance
let shopManager;
