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
                    icon: 'assets/helpers/shibes/shibes-idle-0.png',
                    miningSprite: 'assets/helpers/shibes/shibes-mine-0.png',
                    description: 'Very kind shibe to mine much dogecoin.',
                    category: 'basic'
                },
                dogeKennels: {
                    name: 'Doge Kennels',
                    baseCost: 400,
                    baseDps: 2,
                    icon: 'assets/helpers/kennels/kennels-idle-0.png',
                    miningSprite: 'assets/helpers/kennels/kennels-mine-0.png',
                    description: 'Wow very efficiency, entire kennels to mine dogecoin.',
                    category: 'basic'
                },
                streamerKittens: {
                    name: 'Streamer Kittens',
                    baseCost: 1800,
                    baseDps: 4,
                    icon: 'assets/helpers/kittens/kittens-idle-0.png',
                    miningSprite: 'assets/helpers/kittens/kittens-mine-0.png',
                    description: 'Kittens to stream cute videos to the internet for dogecoin.',
                    category: 'basic'
                },
                spaceRocket: {
                    name: 'Space Rocket',
                    baseCost: 50000,
                    baseDps: 9,
                    icon: 'assets/helpers/rockets/rockets-idle-0.png',
                    miningSprite: 'assets/helpers/rockets/rockets-mine-0.png',
                    description: 'A rocket to fly to the moon.',
                    category: 'advanced'
                },
                timeMachineRig: {
                    name: 'Time Machine Mining Rig',
                    baseCost: 9999999,
                    baseDps: 66,
                    icon: 'assets/helpers/rigs/rigs-idle-0.png',
                    miningSprite: 'assets/helpers/rigs/rigs-mine-0.png',
                    description: 'Mines into the future where infinite dogecoins exist.',
                    category: 'advanced'
                },
                infiniteDogebility: {
                    name: 'Infinite Dogebility Drive',
                    baseCost: 9999999999,
                    baseDps: 999,
                    icon: 'assets/helpers/dogebility/dogebility-idle-0.png',
                    miningSprite: 'assets/helpers/dogebility/dogebility-mine-0.png',
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
                    icon: 'assets/helpers/bases/bases-idle-0.png',
                    miningSprite: 'assets/helpers/bases/bases-mine-0.png',
                    description: 'A base on the moon to extract much dogecoin.',
                    category: 'moon'
                },
                moonShibe: {
                    name: 'Moon Shibe',
                    baseCost: 10000,
                    baseDps: 9,
                    icon: 'assets/helpers/moonshibe/moonshibe-idle-0.png',
                    miningSprite: 'assets/helpers/moonshibe/moonshibe-mine-0.png',
                    description: 'Astronaut moon shibe to mine much dogecoin.',
                    category: 'moon'
                },
                dogeCar: {
                    name: 'Doge Car',
                    baseCost: 35000,
                    baseDps: 12,
                    icon: 'assets/helpers/dogecar/dogecar-idle-0.png',
                    miningSprite: 'assets/helpers/dogecar/dogecar-mine-0.png',
                    description: 'Wow! Much fast doge car with such doge driver. Very Wise. How it mines, no one knows.',
                    category: 'moon'
                },
                landerShibe: {
                    name: 'Lander Shibe',
                    baseCost: 420000,
                    baseDps: 20,
                    icon: 'assets/helpers/landershibe/landershibe-idle-0.png',
                    miningSprite: 'assets/helpers/landershibe/landershibe-mine-0.png',
                    description: 'Lander shibe explores other planets and moons in pursuit of dogecoin.',
                    category: 'moon'
                },
                marsRocket: {
                    name: 'Mars Rocket',
                    baseCost: 2500000,
                    baseDps: 50,
                    icon: 'assets/helpers/marsrocket/marsrocket-idle-0.png',
                    miningSprite: 'assets/helpers/marsrocket/marsrocket-mine-0.png',
                    description: 'A rocket to fly to Mars, much red planet, such adventure.',
                    category: 'moon'
                },
                dogeGate: {
                    name: 'Doge Gate',
                    baseCost: 123000000,
                    baseDps: 155,
                    icon: 'assets/helpers/dogegate/dogegate-idle-0.png',
                    miningSprite: 'assets/helpers/dogegate/dogegate-mine-0.png',
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
                    icon: 'assets/helpers/marsbase/marsbase-idle-0.png',
                    miningSprite: 'assets/helpers/marsbase/marsbase-mine-0.png',
                    description: 'A base on Mars to mine ludicrous amounts of Dogecoin.',
                    category: 'mars'
                },
                partyShibe: {
                    name: 'Party Shibe',
                    baseCost: 100000,
                    baseDps: 26,
                    icon: 'assets/helpers/partyshibe/partyshibe-idle-0.png',
                    miningSprite: 'assets/helpers/partyshibe/partyshibe-mine-0.png',
                    description: 'Cool space rave party shibes to rave much dogecoin.',
                    category: 'mars'
                },
                curiosiDoge: {
                    name: 'CuriousiDoge',
                    baseCost: 400000,
                    baseDps: 30,
                    icon: 'assets/helpers/curiosidoge/curiosidoge-idle-0.png',
                    miningSprite: 'assets/helpers/curiosidoge/curiosidoge-mine-0.png',
                    description: 'Much curious Doge to explore Mars riches.',
                    category: 'mars'
                },
                djKittenz: {
                    name: 'DJ Kittenz',
                    baseCost: 1000000,
                    baseDps: 45,
                    icon: 'assets/helpers/djkittenz/djkittenz-idle-0.png',
                    miningSprite: 'assets/helpers/djkittenz/djkittenz-mine-0.png',
                    description: 'Very music creation. DJ Kittenz specializes in House music.',
                    category: 'mars'
                },
                spaceBass: {
                    name: 'Space Bass',
                    baseCost: 8000000,
                    baseDps: 70,
                    icon: 'assets/helpers/spacebass/spacebass-idle-0.png',
                    miningSprite: 'assets/helpers/spacebass/spacebass-mine-0.png',
                    description: 'It is said to vibrate the essence of gravity itself.',
                    category: 'mars'
                },
                jupiterRocket: {
                    name: 'Jupiter Rocket',
                    baseCost: 50000000,
                    baseDps: 100,
                    icon: 'assets/helpers/juprocket/juprocket-idle-0.png',
                    miningSprite: 'assets/helpers/juprocket/juprocket-mine-0.png',
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
                    icon: 'assets/helpers/jupiterbase/jupiterbase-idle-0.png',
                    miningSprite: 'assets/helpers/jupiterbase/jupiterbase-mine-0.png',
                    description: 'A flying base in the clouds of Jupiter.',
                    category: 'jupiter'
                },
                superShibe: {
                    name: 'Super Shibe',
                    baseCost: 1000000,
                    baseDps: 50,
                    icon: 'assets/helpers/supershibe/supershibe-idle-0.png',
                    miningSprite: 'assets/helpers/supershibe/supershibe-mine-0.png',
                    description: 'A scary-strong shibe. Probably on steroids.',
                    category: 'jupiter'
                },
                dogeAirShip: {
                    name: 'Doge Air Ship',
                    baseCost: 15000000,
                    baseDps: 80,
                    icon: 'assets/helpers/airship/airship-idle-0.png',
                    miningSprite: 'assets/helpers/airship/airship-mine-0.png',
                    description: 'A flying ship with eager astro shibes.',
                    category: 'jupiter'
                },
                flyingDoggo: {
                    name: 'Flying Doggo',
                    baseCost: 35000000,
                    baseDps: 120,
                    icon: 'assets/helpers/flyingdoge/flyingdoge-idle-0.png',
                    miningSprite: 'assets/helpers/flyingdoge/flyingdoge-mine-0.png',
                    description: 'It comes wif two sub-woofers.',
                    category: 'jupiter'
                },
                tardogeis: {
                    name: 'TARDogeIS',
                    baseCost: 55000000,
                    baseDps: 150,
                    icon: 'assets/helpers/tardogeis/tardogeis-idle-0.png',
                    miningSprite: 'assets/helpers/tardogeis/tardogeis-mine-0.png',
                    description: 'Time and Relative Doge in Space exists everywhere at the same time. Sort of.',
                    category: 'jupiter'
                },
                dogeStar: {
                    name: 'DogeStar',
                    baseCost: 699999999,
                    baseDps: 420,
                    icon: 'assets/helpers/dogestar/dogestar-idle-0.png',
                    miningSprite: 'assets/helpers/dogestar/dogestar-mine-0.png',
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
                    icon: 'assets/helpers/titanbase/titanbase-idle-0.png',
                    miningSprite: 'assets/helpers/titanbase/titanbase-mine-0.png',
                    description: 'A base on Titan to mine dogecoins and manufacture robots.',
                    category: 'titan'
                },
                // Helper 2: Robo Shibe - Automated mining unit designed for Titan's harsh environment
                roboShibe: {
                    name: 'Robo Shibe',
                    baseCost: 455000000,
                    baseDps: 195,
                    icon: 'assets/helpers/roboshibe/roboshibe-idle-0.png',
                    miningSprite: 'assets/helpers/roboshibe/roboshibe-mine-0.png',
                    description: 'A robotic shibe to mine the riches on Titan.',
                    category: 'titan'
                },
                // Helper 3: Heavy Doge Walker - Large cargo and mining vehicle
                heavyDogeWalker: {
                    name: 'Heavy Doge Walker',
                    baseCost: 2000000000,
                    baseDps: 400,
                    icon: 'assets/helpers/walker/walker-idle-0.png',
                    miningSprite: 'assets/helpers/walker/walker-mine-0.png',
                    description: 'Large vehicle. Much cargo, Very carry.',
                    category: 'titan'
                },
                // Helper 4: Coin Seeker 5000 - Advanced robotic mining predator
                coinSeeker5000: {
                    name: 'Coin Seeker 5000',
                    baseCost: 4500000000,
                    baseDps: 500,
                    icon: 'assets/helpers/seeker/seeker-idle-0.png',
                    miningSprite: 'assets/helpers/seeker/seeker-mine-0.png',
                    description: 'Advanced robotic dogecoin seeking predator.',
                    category: 'titan'
                },
                // Helper 5: Time Travel D-Rex - Half terrifying, half amazing dinosaur from the past
                timeTravelDRex: {
                    name: 'Time Travel D-Rex',
                    baseCost: 8000000000,
                    baseDps: 620,
                    icon: 'assets/helpers/trex/trex-idle-0.png',
                    miningSprite: 'assets/helpers/trex/trex-mine-0.png',
                    description: 'Half terrifying, half amazing. Rawr.',
                    category: 'titan'
                },
                // Helper 6: Altar of the SunDoge - Sacred structure for enlightened mining
                altarOfTheSunDoge: {
                    name: 'Altar of the SunDoge',
                    baseCost: 100000000000,
                    baseDps: 1200,
                    icon: 'assets/helpers/altarofthesundoge/altarofthesundoge-idle-0.png',
                    miningSprite: 'assets/helpers/altarofthesundoge/altarofthesundoge-mine-0.png',
                    description: 'An altar of calling to an enlightened Doge above our WOW.',
                    category: 'titan'
                }
            },

            pickaxes: {
                standard: {
                    name: 'Standard Pickaxe',
                    cost: 0,
                    multiplier: 1,
                    icon: 'assets/items/pickaxes/standard.png',
                    description: 'Basic mining tool',
                    unlocked: true
                },
                stronger: {
                    name: 'Stronger Pickaxe',
                    cost: 100,
                    multiplier: 2,
                    icon: 'assets/items/pickaxes/stronger.png',
                    description: 'More powerful mining',
                    unlocked: true
                },
                golden: {
                    name: 'Golden Pickaxe',
                    cost: 500,
                    multiplier: 5,
                    icon: 'assets/items/pickaxes/golden.png',
                    description: 'Luxury mining equipment',
                    unlocked: true
                },
                rocketaxe: {
                    name: 'Rocket Pickaxe',
                    cost: 2000,
                    multiplier: 10,
                    icon: 'assets/items/pickaxes/rocketaxe.png',
                    description: 'Space-age mining technology',
                    unlocked: true
                },
                diamond: {
                    name: 'Diamond Pickaxe',
                    cost: 10000,
                    multiplier: 25,
                    icon: 'assets/items/pickaxes/diasword.png',
                    description: 'Crystal-clear mining power',
                    unlocked: true
                },
                nuke: {
                    name: 'Nuclear Pickaxe',
                    cost: 50000,
                    multiplier: 100,
                    icon: 'assets/items/pickaxes/nuke.png',
                    description: 'Explosive mining capability',
                    unlocked: true
                }
            },

            upgrades: {
                clickPower: {
                    name: 'Click Power',
                    baseCost: 50,
                    effect: 'Increases click power by 1',
                    icon: 'assets/general/icons/click.png',
                    description: 'Make each click more powerful',
                    maxLevel: 100
                },
                autoClicker: {
                    name: 'Auto Clicker',
                    baseCost: 1000,
                    effect: 'Automatically clicks every second',
                    icon: 'assets/general/icons/auto.png',
                    description: 'Automate your clicking',
                    maxLevel: 10
                },
                criticalChance: {
                    name: 'Critical Hit',
                    baseCost: 5000,
                    effect: '10% chance for 2x damage',
                    icon: 'assets/general/icons/critical.png',
                    description: 'Chance for critical hits',
                    maxLevel: 20
                },
                helperEfficiency: {
                    name: 'Helper Efficiency',
                    baseCost: 10000,
                    effect: 'Increases all helper DPS by 10%',
                    icon: 'assets/general/icons/efficiency.png',
                    description: 'Make helpers more efficient',
                    maxLevel: 50
                }
            },

            // Helper upgrades - levels 1+ are purchasable upgrades
            helperUpgrades: {
                miningShibe: [
                    { level: 0, name: 'Mining Shibe', dps: 0.2, shopDesc: 'Very kind shibe to mine much dogecoin.' },
                    { level: 1, name: 'Mining Shibe', dps: 0.7, price: 1000, upgradeName: 'Euphoria', upgradeDesc: 'Replace the Mining Shibe with Fedoras for increased tipping.', shopDesc: 'Very enlightened shibe to mine much dogecoin.' },
                    { level: 2, name: 'Mining Shibe', dps: 1, price: 3500, upgradeName: 'Golden Pickaxes', upgradeDesc: 'Replace the Mining Shibe pickaxes with Golden Pickaxes.', shopDesc: 'Very enlightened shibe to mine much dogecoin. With golden pickaxes.' },
                    { level: 3, name: 'Mining Shibe', dps: 2, price: 32500, upgradeName: 'Salary Raise', upgradeDesc: 'Raise the Mining Shibes salaries, which will lead to better work ethics.', shopDesc: 'Well-paid, happy shibe to mine much dogecoin.' },
                    { level: 4, name: 'Rapping Shibe', dps: 5, price: 4500000, upgradeName: 'Rapper Shibes', upgradeDesc: 'Mining Shibes become Rapper Shibes, to bring da bling!', shopDesc: 'A rapping shibe makes mostest dogecoin.' },
                    { level: 5, name: 'Space Shibe', dps: 19, price: 25000000, upgradeName: 'Space Shibes', upgradeDesc: 'Make shibes space-worthy with astronaut helmets.', shopDesc: 'A space shibe to mine much dogecoin.' },
                    { level: 6, name: 'Space Shibe w/Gold Helmet', dps: 35, price: 55000000, upgradeName: 'Gold Helmet Upgrade', upgradeDesc: 'Use Gold instead of plywood for better protection.', shopDesc: 'A space shibe to mine much dogecoin.' },
                    { level: 7, name: 'Space Shibe w/Diamond Helmet', dps: 69, price: 55000000, upgradeName: 'Diamond Helmet Upgrade', upgradeDesc: 'Make space shibes truly magnificent with diamond helmets.', shopDesc: 'A space shibe to mine mucherer dogecoin.' }
                ],
                dogeKennels: [
                    { level: 0, name: 'Doge Kennels', dps: 2, shopDesc: 'Wow very efficiency, entire kennels to mine dogecoin.' },
                    { level: 1, name: 'Axequipped Kennels', dps: 3.2, price: 1100, upgradeName: 'More Axes', upgradeDesc: 'Supply the kennels with more pickaxes to use for mining.', shopDesc: 'Wow very efficiency. Entire kennels to mine Dogecoin. With many axes.' },
                    { level: 2, name: 'Pink Kennels', dps: 4.3, price: 4000, upgradeName: 'Paint Job', upgradeDesc: 'Repaint the Kennels to a more friendlier color. Much happy.', shopDesc: 'Wow very efficiency. Entire Kennels to mine Dogecoin. In style.' },
                    { level: 3, name: 'Rocket Kennels', dps: 5, price: 42000, upgradeName: 'Micro-Rockets', upgradeDesc: 'Attach micro-rockets to the kennels. To the moon!', shopDesc: 'WOOOW very efficiency, entire kennels to mine Dogecoin with ROCKET POWER!' },
                    { level: 4, name: 'Free Running Doges', dps: 7, price: 125000, upgradeName: 'Release the Doge', upgradeDesc: 'Who let the Doge out? Dismantle kennels, creating Free Running Doges.', shopDesc: 'Wow very freedom, free running Doges mine much more Dogecoin than not free running!' },
                    { level: 5, name: 'Jet-Pack Doges', dps: 11, price: 3000000, upgradeName: 'Jet Packs', upgradeDesc: 'Supply the Kennels with jet packs.', shopDesc: 'Equipped with Jet Packs, Doges travel very fast to mine much Dogecoin!' },
                    { level: 6, name: 'Space Doges', dps: 20, price: 30000000, upgradeName: 'Safety First', upgradeDesc: 'Give the Jet-Pack-Doges space helmets. For safety.', shopDesc: 'Equipped with Jet Packs & Space Helmets, Doges travel very fast to mine much Dogecoin!' },
                    { level: 7, name: 'Space Doges', dps: 33, price: 80000000, upgradeName: 'Golden Improvement', upgradeDesc: 'Space Doges get a golden improvement for increased income.', shopDesc: 'Space Doges travel very fast to mine much Dogecoin in space!' },
                    { level: 8, name: 'Space Doges', dps: 61, price: 151000000, upgradeName: 'Diamond Improvement', upgradeDesc: 'Give Space Doges a diamond-based improvement.', shopDesc: 'Space Doges travel very fast to mine much Dogecoin in space!' }
                ],
                streamerKittens: [
                    { level: 0, name: 'Streamer Kittens', dps: 4, shopDesc: 'Kittens to stream cute videos to the internet for dogecoin.' },
                    { level: 1, name: 'Streamer Kittens HD', dps: 7, price: 4200, upgradeName: 'High Quality Pussy-cat', upgradeDesc: 'Upgrade the kittens webcam to HD for better streams.', shopDesc: 'Many kittens to stream cute HD videos to the internet for Dogecoin.' },
                    { level: 2, name: 'Streamer Kitten Gang', dps: 9, price: 99000, upgradeName: 'More Kittens', upgradeDesc: 'Increase the cute-level with more kittens.', shopDesc: 'Many kittens to stream cute HD videos to the internet for Dogecoin.' },
                    { level: 3, name: 'Speedy Kitten Streamers', dps: 12, price: 392000, upgradeName: 'High-Speed Interwebs', upgradeDesc: 'Connects the kittens PC to the global Doge Fiber network.', shopDesc: 'Many kittens to stream cute HD videos to the internet for dogecoin at high speeds.' },
                    { level: 4, name: 'Enlightened Kittens', dps: 18, price: 3250000, upgradeName: 'Intelligence', upgradeDesc: 'Enlighten the kittens.', shopDesc: 'Enlightened kittens creates amaze podcasts for very much dogecoin.' },
                    { level: 5, name: 'Stock Kittens', dps: 21, price: 6500000, upgradeName: 'Stock Kittens', upgradeDesc: 'Teach the kittens how to effectively trade in dogecoin stocks for profit.', shopDesc: 'Stock kittens invest dogecoin in dogecoin for more dogecoin. Such profit!' },
                    { level: 6, name: 'Space-Proof Kittens', dps: 23, price: 82000000, upgradeName: 'Catstronaut', upgradeDesc: 'Give the kittens space helmets. It helps them feel safe.', shopDesc: 'Space-Proof Kittens invest dogecoin in dogecoin for much dogecoin. (Space capable)' },
                    { level: 7, name: 'Space-Hardened Kittens', dps: 45, price: 169000000, upgradeName: 'Goldened Helmets', upgradeDesc: 'Improved kitty-helmets for improved kittyness.', shopDesc: 'Space-Hardened Kittens Invest dogecoin in dogecoin for much dogecoin. (Space skilled)' },
                    { level: 8, name: 'Catstronaut Kittens', dps: 70, price: 290000000, upgradeName: 'Diamond Helmets', upgradeDesc: 'Really strong helmets for all kitten catstronauts.', shopDesc: 'Catstronaut Kittens invest dogecoin in dogecoin for so much dogecoin. (Space masters)' }
                ],
                spaceRocket: [
                    { level: 0, name: 'Space Rocket', dps: 9, shopDesc: 'A rocket to fly to the moon.' },
                    { level: 1, name: 'Space Rocket', dps: 11, price: 52000, upgradeName: 'Blue-Flame', upgradeDesc: 'Upgrade the rocket engine with blue-flame rockets.', shopDesc: 'A rocket to fly to the moon with blue flame.' },
                    { level: 2, name: 'Warp Rocket', dps: 14, price: 1500000, upgradeName: 'Warp Drive', upgradeDesc: 'Upgrade the rocket with a warp drive engine for superfast travel.', shopDesc: 'A warp drive rocket to travel to the moon to find much dogecoin.' },
                    { level: 3, name: 'Shiny Rocket', dps: 23, price: 500000000, upgradeName: 'Hull Upgrade', upgradeDesc: 'Upgrade the hull of the Space Rocket. Shiny.', shopDesc: 'A shiny space rocket to find much dogecoin in space.' },
                    { level: 4, name: 'Olie Rocket', dps: 28, price: 600000000, upgradeName: 'Olie Upgrade', upgradeDesc: 'Lets all find dogecoin together. Okay? Upgrade to olie-style doge rocket.', shopDesc: 'Awesome rocket for doge to travel to the moon to find much dogecoin.' },
                    { level: 5, name: 'Space-Olie Rocket', dps: 48, price: 1000000000, upgradeName: 'Space Helmets', upgradeDesc: 'Give Pilot-Doge a space helmet to increase time spent in space.', shopDesc: 'Awesome rocket for space doge to travel to moon to find dogecoin.' },
                    { level: 6, name: 'Gold-Olie Rocket', dps: 79, price: 1300000000, upgradeName: 'Golden Helmet', upgradeDesc: 'If it\'s not gold, it\'s not good enough. Unless it\'s better.', shopDesc: 'Awesome rocket for golden doge to travel to the moon to find dogecoin.' },
                    { level: 7, name: 'Diamond-Olie Rocket', dps: 159, price: 1600000000, upgradeName: 'Diamond Helmet', upgradeDesc: 'This helmet is better. It\'s not cheap, but really really strong.', shopDesc: 'Awesome rocket for diamond doge to travel to the moon to find dogecoin.' }
                ],
                timeMachineRig: [
                    { level: 0, name: 'Time Machine Mining Rig', dps: 66, shopDesc: 'Mines into the future where infinite dogecoins exist.' },
                    { level: 1, name: 'Flying Time Machine Mining Rig', dps: 88, price: 24200000, upgradeName: 'Roads?', upgradeDesc: 'Where doge is going, he doesn\'t need roads. Gives the Time Machine Mining Rig flight capabilities.', shopDesc: 'Mines into the future where infinite dogecoins exist. While flying.' },
                    { level: 2, name: 'Golden Flying Time Machine', dps: 122, price: 72000000, upgradeName: 'Bling Bling', upgradeDesc: 'Paints the Flying Time Machine Mining Rig golden.', shopDesc: 'Mining the essence of space, backwards and forwards through time, in style.' },
                    { level: 3, name: 'Diamond Flying Time Machine', dps: 178, price: 240000000, upgradeName: 'Diamond Bling', upgradeDesc: 'Put diamond paint on the Golden Flying Time Machine Mining Rig.', shopDesc: 'Mining the essence of space, backwards and forwards through time, in REAL style.' }
                ],
                infiniteDogebility: [
                    { level: 0, name: 'Infinite Dogebility Drive', dps: 999, shopDesc: 'A ship that instantaneously travels to any place in the Universe. Result? Many Dogecoins.' },
                    { level: 1, name: 'Infinite Delivery Drive', dps: 1950, price: 20000000000, upgradeName: 'Delivery Service', upgradeDesc: 'The Infinite Dogebility Drive ship will now deliver packages across the universe in exchange for more dogecoins.', shopDesc: 'A ship that instantaneously delivers packages to any place in the universe. Result? Amazon.' },
                    { level: 2, name: 'Infinite Delivery Drive w/Crew', dps: 3456, price: 45000000000, upgradeName: 'Hire a Crew', upgradeDesc: 'A miner\'s goal is simple. Find a crew, get dogecoins, keep mining.', shopDesc: 'A crew on a ship that instantaneously delivers packages to any place in the universe.' },
                    { level: 3, name: 'Upside-Down Infinite Delivery', dps: 4210, price: 75000000000, upgradeName: 'Upside Doge', upgradeDesc: 'Silly Doge drives the ship upside down.', shopDesc: 'A weird crew on a ship instantaneously delivers packages to any place in the universe.' },
                    { level: 4, name: 'Golden Infinite Delivery', dps: 5420, price: 150000000000, upgradeName: 'The Upside of Gold', upgradeDesc: 'Shiny golden plating for the Infinite Dogebility Drive.', shopDesc: 'A weird crew on a ship instantaneously delivers packages to any place in the universe.' },
                    { level: 5, name: 'Diamond Infinite Delivery', dps: 6900, price: 300000000000, upgradeName: 'The Cost of Diamonds', upgradeDesc: 'Very shiny diamond plating for the Infinite Dogebility Drive.', shopDesc: 'A weird crew on a ship that instantaneously delivers packages to any place in the universe.' }
                ],
                // Moon Helper Upgrades
                moonBase: [
                    { level: 0, name: 'Moon Base', dps: 12, shopDesc: 'A base on the moon to extract much dogecoin.' },
                    { level: 1, name: 'Improved Moon Base', dps: 15, price: 60000, upgradeName: 'Excavator Assistance', upgradeDesc: 'Add a doge-excavator to assist the moon base.', shopDesc: 'A base on the moon to extract much dogecoin.' },
                    { level: 2, name: 'Improved Moon Base', dps: 17, price: 315000, upgradeName: 'More Axes v2', upgradeDesc: 'Add more axes to the moon base.', shopDesc: 'A base on the moon to extract much dogecoin. With axes & excavator.' },
                    { level: 3, name: 'Golden Moon Base', dps: 29, price: 2250000, upgradeName: 'Gold-Coated Base', upgradeDesc: 'Coat the Moon Base and excavator in gold for increased income.', shopDesc: 'A golden base on the moon to extract much dogecoin. Much shiny.' },
                    { level: 4, name: 'Diamond Moon Base', dps: 90, price: 65000000, upgradeName: 'Diamond-coated Base', upgradeDesc: 'Replace the gold coating with pure diamond instead. Somehow really good.', shopDesc: 'A diamond base on the moon to extract much dogecoin. Much improved.' }
                ],
                moonShibe: [
                    { level: 0, name: 'Moon Shibe', dps: 9, shopDesc: 'Astronaut moon shibe to mine much dogecoin.' },
                    { level: 1, name: 'Moon Shibe', dps: 13, price: 54000, upgradeName: 'Suit Up', upgradeDesc: 'Give the Moon Shibe a full space suit to wear. Very safer.', shopDesc: 'Space-suited astronaut moon shibe to mine much dogecoin.' },
                    { level: 2, name: 'Moon Shibe', dps: 15, price: 290000, upgradeName: 'Head-Mounted Pickaxes', upgradeDesc: 'Put Micro-Pickaxes © on the helmet of the Moon Shibe.', shopDesc: 'Astronaut Moon Shibe to mine much dogecoin. With Micro-Pickaxes ©' },
                    { level: 3, name: 'Golden Moon Shibe', dps: 19, price: 2000000, upgradeName: 'Gold-Suit Up', upgradeDesc: 'Replace the Moon Shibes space suit with a golden space suit.', shopDesc: 'Golden moon shibe to mine much dogecoin. Shiny!' },
                    { level: 4, name: 'Diamond Moon Shibe!', dps: 49, price: 24000000, upgradeName: 'Diamond-Suit Up', upgradeDesc: 'Replace the Moon Shibes space suit with a diamond space suit.', shopDesc: 'Diamond moon shibe to mine much dogecoin. Shiny!' }
                ],
                dogeCar: [
                    { level: 0, name: 'Doge Car', dps: 12, shopDesc: 'Wow! Much fast doge car with such doge driver. Very Wise. How it mines, no one knows.' },
                    { level: 1, name: 'Doge Car', dps: 15, price: 64500, upgradeName: 'Shade Miner', upgradeDesc: 'Give the Doge Driver of the Doge Car some cool shades.', shopDesc: 'Wow! Much fast doge car with such COOL doge driver. Very Wise.' },
                    { level: 2, name: 'Doge Tank', dps: 20, price: 400000, upgradeName: 'Tank', upgradeDesc: 'Replace the Doge Car wheels with tank tracks, better traction on the moon.', shopDesc: 'Much traction Doge Tank with such cool doge driver. Very Wise.' },
                    { level: 3, name: 'Doge Tank', dps: 24, price: 5000000, upgradeName: 'Roof Miner', upgradeDesc: 'Attach a giant GPU-Pickaxe to the roof of the Doge Tank.', shopDesc: 'WOW mining tanky doge car mines bestest dogecoin. Very Wise.' },
                    { level: 4, name: 'Golden Doge Tank', dps: 75, price: 30000000, upgradeName: 'Gold Miner', upgradeDesc: 'Replace the Doge Tanks exterior with gold for much mining power.', shopDesc: 'WOW mining tanky doge car mines bestest dogecoin. Very shine.' },
                    { level: 5, name: 'Diamond Doge Tank', dps: 159, price: 99000000, upgradeName: 'Diamond Miner', upgradeDesc: 'Replace the Doge Tanks exterior with diamond for superior mining.', shopDesc: 'WOW mining tanky doge car mines bestest dogecoin. Most shibe.' }
                ],
                landerShibe: [
                    { level: 0, name: 'Lander Shibe', dps: 20, shopDesc: 'Lander shibe explores other planets and moons in pursuit of dogecoin.' },
                    { level: 1, name: 'Lander Shibe', dps: 24, price: 550000, upgradeName: 'Candy-Lander Shibe', upgradeDesc: 'Upgrade the Lander Shibe to a Candy-Lander Shibe. Such Improvement', shopDesc: 'Candy-Lander shibe explores other planets and moons in pursuit of dogecoin.' },
                    { level: 2, name: 'Double-Lander Shibe', dps: 26, price: 4000000, upgradeName: 'Double-Lander Shibe', upgradeDesc: 'Upgrade the Lander Shibe to a Double-Lander Shibe.', shopDesc: 'Double-Lander shibe explores other planets and moons in the solar system in pursuit of dogecoin.' },
                    { level: 3, name: 'Triple-Lander Shibe', dps: 35, price: 75000000, upgradeName: 'Triple-Lander Shibe', upgradeDesc: 'Upgrade the Double-Lander Shibe to a Triple-Lander Shibe.', shopDesc: 'Triple-Lander shibe explores other planets and moons in the solar system in pursuit of dogecoin.' },
                    { level: 4, name: 'Diamond Triple-Lander', dps: 105, price: 175000000, upgradeName: 'Diamond for the Lander', upgradeDesc: 'Diamond plating for the Triple-Lander Shibe makes it super shiny.', shopDesc: 'Triple-Lander shibe explores other planets and moons in the solar system in pursuit of dogecoin.' }
                ],
                marsRocket: [
                    { level: 0, name: 'Mars Rocket', dps: 50, shopDesc: 'A rocket to fly to Mars, much red planet, such adventure.' },
                    { level: 1, name: 'Golden Mars Rocket', dps: 90, price: 22500000, upgradeName: 'Golden Rocket Plating', upgradeDesc: 'Replace the Mars Rocket paper plating with gold. Much improved.', shopDesc: 'A golden rocket to fly to Mars.' },
                    { level: 2, name: 'Diamond Mars Rocket', dps: 150, price: 85000000, upgradeName: 'Diamond Rocket Plating', upgradeDesc: 'Replace the Mars Rocket gold plating with Diamond: Very improved.', shopDesc: 'A diamond rocket to fly to Mars.' }
                ],
                dogeGate: [
                    { level: 0, name: 'Doge Gate', dps: 155, shopDesc: 'A Doge Gate for instant galaxy-wide dogecoin transfers.' },
                    { level: 1, name: 'Golden Doge Gate', dps: 575, price: 6900000000, upgradeName: 'Golden Gate', upgradeDesc: 'Gold plated Doge Gates.', shopDesc: 'A golden Doge Gate for instant, galaxy-wide dogecoin transfers.' },
                    { level: 2, name: 'Diamond Doge Gate', dps: 1875, price: 9900000000, upgradeName: 'Diamond Gate', upgradeDesc: 'Diamond plated Doge Gates. Yeah.', shopDesc: 'A diamond Doge Gate for instant, galaxy-wide dogecoin transfers.' }
                ],
                // Mars Helper Upgrades
                marsBase: [
                    { level: 0, name: 'Mars Base', dps: 23, shopDesc: 'A base on Mars to mine ludicrous amounts of Dogecoin.' },
                    { level: 1, name: '2x Mars Base', dps: 31, price: 750000, upgradeName: 'Double Mars Bases', upgradeDesc: 'Double the amount of Mars bases with smaller bases. Efficiency is key.', shopDesc: 'Two bases on Mars to mine ludicrous amounts of Dogecoin.' },
                    { level: 2, name: '4x Mars Base', dps: 38, price: 6000000, upgradeName: 'Quad Mars Base', upgradeDesc: 'Quadruple the amount of Mars bases.', shopDesc: 'Four bases on mars to mine ludicrous amounts of Dogecoin.' },
                    { level: 3, name: '36x Mars Base', dps: 47, price: 400000000, upgradeName: 'Heckin-Ton of Bases', upgradeDesc: 'A heckin lot of Mars Bases. 36 to be exact.', shopDesc: 'A lot of bases on Mars to mine silly amounts of Dogecoin.' },
                    { level: 4, name: '36x Goldy Mars Bases', dps: 99, price: 800000000, upgradeName: 'Spray It With Gold', upgradeDesc: 'Spray the 36x Mars Bases with gold for extra shine.', shopDesc: 'A lot of goldy bases on Mars to mine muchest dogecoins.' },
                    { level: 5, name: '36x Diamondy Mars Bases', dps: 280, price: 1600000000, upgradeName: 'Apply To Outside Only', upgradeDesc: 'Expensive diamond coating for the 36x Mars Bases.', shopDesc: 'Shiny bases on Mars to mine ridiculous amounts of Dogecoin.' }
                ],
                partyShibe: [
                    { level: 0, name: 'Party Shibe', dps: 26, shopDesc: 'Cool space rave party shibes to rave much dogecoin.' },
                    { level: 1, name: 'Rave Shibe', dps: 35, price: 610000, upgradeName: 'Proper Raving', upgradeDesc: 'Give the Party Shibe some glowsticks instead of pickaxes.', shopDesc: 'Cool space rave party shibes to rave much Dogecoin. With glowsticks.' },
                    { level: 2, name: 'DW Rave Shibe', dps: 40, price: 1250000, upgradeName: 'Dual-Wielding Ravers', upgradeDesc: 'Additional glowsticks for Rave Shibes.', shopDesc: 'Cool space rave party shibes to rave much dogecoin.' },
                    { level: 3, name: 'Sugar-Rushed Shibe', dps: 78, price: 38000000, upgradeName: 'Sugar Baby', upgradeDesc: 'Give the shibes lots of sugary treats to speed them up.', shopDesc: 'Cool sugary rave party shibes to rave much dogecoin.' },
                    { level: 4, name: 'Shiny E-Shibe', dps: 139, price: 99000000, upgradeName: 'Shiny Shibe', upgradeDesc: 'Give the shibes shiny golden shirts for higher blingability.', shopDesc: 'Cool shiny space rave party shibe to race much dogecoin.' },
                    { level: 5, name: 'Very Shiny E-Shibe', dps: 199, price: 320000000, upgradeName: 'Shinier Shibe', upgradeDesc: 'Give the shibes shiny diamond shirts for even more bling.', shopDesc: 'Cool shiny space rave party shibe to rave much dogecoin.' }
                ],
                curiosiDoge: [
                    { level: 0, name: 'CuriosiDoge', dps: 30, shopDesc: 'Much curious Doge to explore Mars riches.' },
                    { level: 1, name: 'CuriosiDoge', dps: 38, price: 620000, upgradeName: 'Party Mode', upgradeDesc: 'Engage Party Mode for CuriousiDoge.', shopDesc: 'Much curious Doge to explore Mars riches. Party mode.' },
                    { level: 2, name: 'CuriosiDoge', dps: 48, price: 2250000, upgradeName: 'Party Hydra', upgradeDesc: 'The Party Hydra upgrade gives CuriosiDoge a lot more heads.', shopDesc: 'Much curious Doge to explore Mars riches. Party hydra.' }
                ],
                djKittenz: [
                    { level: 0, name: 'DJ Kittenz', dps: 45, shopDesc: 'Very music creation. DJ Kittenz specializes in House music.' },
                    { level: 1, name: 'DJ Kittenz', dps: 57, price: 1450000, upgradeName: 'D.I.S.C.O.', upgradeDesc: 'It\'s disco time.', shopDesc: 'Very music creation. Now playing disco.' },
                    { level: 2, name: 'DJ Kittenz', dps: 75, price: 37500000, upgradeName: 'Swag Upgrade', upgradeDesc: 'Give DJ Kittenz some fresh swag.', shopDesc: 'Very music creation. Now playing hiphop.' },
                    { level: 3, name: 'DJ Kittenz', dps: 99, price: 120000000, upgradeName: 'Wash-Oops', upgradeDesc: 'Accidentally color DJ Kittenz swag purple in the washer.', shopDesc: 'Very music creation. Now playing: EDM.' },
                    { level: 4, name: 'DJ Kittenz', dps: 133, price: 290000000, upgradeName: 'Golden Hits', upgradeDesc: 'Enter the golden disco era with DJ Kittenz.', shopDesc: 'Very music creation. Now playing: Golden Hits.' },
                    { level: 5, name: 'DJ Kittenz', dps: 200, price: 525000000, upgradeName: 'Diamond Hits?', upgradeDesc: 'There\'s a diamond disco era. Feat. DJ Kittenz', shopDesc: 'Very music creation. Now playing: Diamond Hits.' }
                ],
                spaceBass: [
                    { level: 0, name: 'Space Bass', dps: 70, shopDesc: 'It is said to vibrate the essence of gravity itself.' },
                    { level: 1, name: 'Golden Space Bass', dps: 122, price: 265000000, upgradeName: 'Golden Bass', upgradeDesc: 'Give the Space Bass the Golden Bass upgrade for extra bling.', shopDesc: 'Golden vibrations. In space.' },
                    { level: 2, name: 'Diamond Space Bass', dps: 229, price: 565000000, upgradeName: 'Diamond Bass', upgradeDesc: 'Give the Space Bass the Diamond Bass upgrade for very shine.', shopDesc: 'Diamond vibrations in space.' }
                ],
                jupiterRocket: [
                    { level: 0, name: 'Jupiter Rocket', dps: 100, shopDesc: 'A rocket to fly to Jupiter.' },
                    { level: 1, name: 'Golden Jupiter Rocket', dps: 200, price: 125000000, upgradeName: 'Golden Rocket Plating', upgradeDesc: 'Replace the Jupiter Rocket wooden plating with gold. Much improved.', shopDesc: 'A golden rocket to fly to Jupiter.' },
                    { level: 2, name: 'Diamond Jupiter Rocket', dps: 298, price: 240000000, upgradeName: 'Diamond Rocket Plating', upgradeDesc: 'Replace the Jupiter Rocket gold plating with diamond. Very improved.', shopDesc: 'A diamond rocket to fly to Jupiter.' }
                ],
                // Jupiter Helper Upgrades
                cloudBase: [
                    { level: 0, name: 'Cloud Base', dps: 100, shopDesc: 'A flying base in the clouds of Jupiter.' },
                    { level: 1, name: 'Cloud Base', dps: 139, price: 30000000, upgradeName: 'Sensor Package', upgradeDesc: 'Improve the scanning capabilities of the Cloud Base.', shopDesc: 'A flying base in the clouds of Jupiter.' },
                    { level: 2, name: 'Smart Cloud Base', dps: 169, price: 100000000, upgradeName: 'AI Package', upgradeDesc: 'An artificial intelligence control system for the Cloud Base.', shopDesc: 'A flying base in the clouds of Jupiter.' },
                    { level: 3, name: 'Smart Golden Cloud Base', dps: 310, price: 285000000, upgradeName: 'What Else But Gold', upgradeDesc: 'Gold plating for the Cloud Base increases its power.', shopDesc: 'A golden flying base in the clouds of Jupiter.' },
                    { level: 4, name: 'Smart Diamond Cloud Base', dps: 446, price: 780000000, upgradeName: 'Are Those Real Diamonds?', upgradeDesc: 'Diamond plating for the Cloud Base, much shiny.', shopDesc: 'A diamond flying base in the clouds of Jupiter.' }
                ],
                superShibe: [
                    { level: 0, name: 'Super Shibe', dps: 55, shopDesc: 'Strong shibes who fly around mining everything.' },
                    { level: 1, name: 'Juiced Super Shibe', dps: 79, price: 35000000, upgradeName: 'Cloud Juice', upgradeDesc: 'Adds some of Jupiters gasses to the Super Shibe\'s protein shakes.', shopDesc: 'Scary-strong shibe enhanced with Jupiter Juice.' },
                    { level: 2, name: 'Juiced Super Shibe', dps: 140, price: 77000000, upgradeName: 'Helmet Factor Two', upgradeDesc: 'Shiny golden helmet for the Super Shibes.', shopDesc: 'Scary-strong shibe enhanced with Jupiter juice and golden helmet.' },
                    { level: 3, name: 'Juiced Super Shibe', dps: 209, price: 180000000, upgradeName: 'We Can Do Better', upgradeDesc: 'Very hard diamond helmet for the Super Shibes.', shopDesc: 'Scary-strong shibe enhanced with Jupiter juice and diamond helmet.' }
                ],
                dogeAirShip: [
                    { level: 0, name: 'Doge Air Ship', dps: 90, shopDesc: 'A slow flying ship piloted by astro shibes.' },
                    { level: 1, name: 'Doge Rocket Ship', dps: 140, price: 160000000, upgradeName: 'Rockets Beats Balloons', upgradeDesc: 'Replace balloons with rockets because ..awesome.', shopDesc: 'A very fast flying ship piloted by astro shibes.' },
                    { level: 2, name: 'Doge Rocket Ship', dps: 180, price: 220000000, upgradeName: 'Golden Rockets', upgradeDesc: 'Replace the metal of the rockets with gold.', shopDesc: 'A very fast flying ship piloted by astro shibes.' },
                    { level: 3, name: 'Doge Rocket Ship', dps: 230, price: 350000000, upgradeName: 'Diamond Rockets', upgradeDesc: 'Replace the metal of the rockets with diamonds.', shopDesc: 'A very fast flying ship piloted by astro shibes.' }
                ],
                flyingDoggo: [
                    { level: 0, name: 'Flying Doggo', dps: 110, shopDesc: 'It comes wif two sub-woofers.' },
                    { level: 1, name: 'Flying Doggo', dps: 140, price: 65000000, upgradeName: 'Doggo Bling', upgradeDesc: 'Give the Flying Doggo some bling-bling.', shopDesc: 'It comes wif two sub-woofers.' },
                    { level: 2, name: 'Rocket-Boosted Flying Doggo', dps: 165, price: 100000000, upgradeName: 'Gotta Go Fast', upgradeDesc: 'Attach rocket boosters on top of the Flying Doggo.', shopDesc: 'It comes wif two sub-woofers.' },
                    { level: 3, name: 'Gold-Rocketed Flying Doggo', dps: 260, price: 280000000, upgradeName: 'Gotta Go Faster', upgradeDesc: 'Replace the Flying Doggos rockets with shiny golden ones.', shopDesc: 'It comes wif two sub-woofers. Goldified.' },
                    { level: 4, name: 'Diamond-Rocketed Flying Doggo', dps: 485, price: 510000000, upgradeName: 'Gotta Go Really Fast', upgradeDesc: 'Replace the Flying Doggos rockets with shinier diamond ones.', shopDesc: 'It comes wif two sub-woofers. Diamondfied.' }
                ],
                tardogeis: [
                    { level: 0, name: 'TARDogeIS', dps: 150, shopDesc: 'Time and Relative Doge in Space exists everywhere at the same time. Sort of.' },
                    { level: 1, name: 'TARDogeIS', dps: 192, price: 195000000, upgradeName: 'Rockets Equals Wow', upgradeDesc: 'Add rockets to the TARDogeIS for better maneuverability.', shopDesc: 'Time and Relative Doge in Space exists everywhere at the same time. Sort of.' },
                    { level: 2, name: 'TARDogeIS', dps: 300, price: 300000000, upgradeName: 'Better, Faster Rockets', upgradeDesc: 'Golden rockets for the TARDogeIS for much speed.', shopDesc: 'Time and Relative Doge in Space exists everywhere at the same time. Sort of.' },
                    { level: 3, name: 'TARDogeIS', dps: 499, price: 480000000, upgradeName: 'Hard Rock Ets', upgradeDesc: 'Diamond rockets for the TARDogeIS for super hard shinyness.', shopDesc: 'Time and Relative Doge in Space exists everywhere at the same time. Sort of.' }
                ],
                dogeStar: [
                    { level: 0, name: 'DogeStar', dps: 600, shopDesc: 'A space station the size of a small moon, equipped with a mining laser.' },
                    { level: 1, name: 'Golden DogeStar', dps: 920, price: 7500000000, upgradeName: 'That\'s Gold Jerry!', upgradeDesc: 'Replace the hull of the DogeStar with golden plates.', shopDesc: 'A golden space station the size of a small moon, equipped with a mining laser.' },
                    { level: 2, name: 'Diamond DogeStar', dps: 2770, price: 12500000000, upgradeName: 'Are Those Diamonds Jerry?!', upgradeDesc: 'Replace the hull of the DogeStar with diamond plates.', shopDesc: 'A diamond space station the size of a small moon, equipped with a mining laser.' }
                ],
                // Titan Helper Upgrades
                titanBase: [
                    { level: 0, name: 'Titan Base', dps: 165, shopDesc: 'A base on Titan to mine dogecoins and manufacture robots.' },
                    { level: 1, name: 'Golden Titan Base', dps: 400, price: 1000000000, upgradeName: 'Golden Plates', upgradeDesc: 'Replace the plating of the Titan Base with gold plates.', shopDesc: 'A golden base on Titan to mine dogecoins and manufacture robots.' },
                    { level: 2, name: 'Diamond Titan Base', dps: 700, price: 2000000000, upgradeName: 'Diamond Plates', upgradeDesc: 'Replace the plating of the Titan Base with diamond plates.', shopDesc: 'A diamond base on Titan to mine dogecoins and manufacture robots.' }
                ],
                roboShibe: [
                    { level: 0, name: 'Robo Shibe', dps: 195, shopDesc: 'A robotic shibe to mine the riches on Titan.' },
                    { level: 1, name: 'Smart-ish Robo Shibe', dps: 852, price: 195000000, upgradeName: 'Deeper Learning', upgradeDesc: 'Machine-Learning chip for the Robo Shibe to make it smarter.', shopDesc: 'A smart-ish robotic shibe to mine Titan\'s Riches.' },
                    { level: 2, name: 'Superintelligent Robo Shibe', dps: 502, price: 295000000, upgradeName: 'SuperIntelligence', upgradeDesc: 'Upgrade the Robo Shibe AI chip to make it superintelligent.', shopDesc: 'A superintelligent robotic shibe to mine Titan\'s Riches.' },
                    { level: 3, name: 'Superintelligent Golden Shibe', dps: 895, price: 620000000, upgradeName: 'Super-Gold', upgradeDesc: 'Goldifies the Robo Shibe.', shopDesc: 'A superintelligent robotic shibe to mine Titan\'s Riches.' },
                    { level: 4, name: 'Superintelligent Diamond Shibe', dps: 1337, price: 1337000000, upgradeName: 'Super-Hard', upgradeDesc: 'Diamond body for the Robo Shibe.', shopDesc: 'A superintelligent robotic shibe to mine Titan\'s Riches.' }
                ],
                heavyDogeWalker: [
                    { level: 0, name: 'Heavy Doge Walker', dps: 400, shopDesc: 'Large vehicle. Much cargo, Very carry.' },
                    { level: 1, name: 'Heavy Doge Hoverer', dps: 850, price: 7200000000, upgradeName: 'Advanced Hover Tech', upgradeDesc: 'Turn the Heavy Doge Walker into a hovercraft.', shopDesc: 'Large hovercraft. Much cargo. Very hover.' },
                    { level: 2, name: 'Heavy Diamond Doge Hoverer', dps: 1700, price: 20100000000, upgradeName: 'Advanced Diamond Tech', upgradeDesc: 'Put shiny diamond tech on the Heavy Doge Hoverer.', shopDesc: 'Large hovercraft. Much cargo. Very diamond.' }
                ],
                coinSeeker5000: [
                    { level: 0, name: 'Coin Seeker 5000', dps: 500, shopDesc: 'Advanced robotic dogecoin seeking predator.' },
                    { level: 1, name: 'Coin Seeker 6000', dps: 900, price: 6400000000, upgradeName: 'Golden Backpack', upgradeDesc: 'Give the Coin Seeker 5000 a backpack to carry much dogecoins.', shopDesc: 'Advanced robotic dogecoin seeking predator. With backpack.' },
                    { level: 2, name: 'Coin Seeker 7000', dps: 1800, price: 23500000000, upgradeName: 'Needs More Gold', upgradeDesc: 'Polish the Coin Seeker so it can seek out more coins.', shopDesc: 'Advanced robotic dogecoin seeking predator. Extra shiny.' },
                    { level: 3, name: 'Coin Seeker 8000', dps: 3420, price: 34000000000, upgradeName: 'Switch To Diamond', upgradeDesc: 'Switch out the Coin Seeker body for a diamond hull.', shopDesc: 'Advanced robotic dogecoin seeking predator. Extra expensive.' }
                ],
                timeTravelDRex: [
                    { level: 0, name: 'Time Travel D-Rex', dps: 620, shopDesc: 'Half terrifying, half amazing. Rawr.' },
                    { level: 1, name: 'Time Travel Laser D-Rex', dps: 1100, price: 9000000000, upgradeName: 'Freakin Lazorz', upgradeDesc: 'Equip the Time Travel D-Rex with freakin Lazorz man.', shopDesc: 'Half terrifying, half amazing, with lazors.' },
                    { level: 2, name: 'Rocket Boosted Time Travel Laser D-Rex', dps: 1850, price: 17000000000, upgradeName: 'Rocketrex', upgradeDesc: 'Rocket upgrade for D-Rex, Because faster.', shopDesc: 'Mostly terrifying, yet amazing.' },
                    { level: 3, name: 'Xtra Rocket Boosted Time Travel Laser D-Rex', dps: 2950, price: 20000000000, upgradeName: 'More Rocket', upgradeDesc: 'More rocket for Time Travel D-Rex, Pffaaaiuuueuu.', shopDesc: '100% terrifying.' },
                    { level: 4, name: 'Smart Rocket Time Travel Laser D-Rex', dps: 8650, price: 50000000000, upgradeName: 'Clever Girl', upgradeDesc: 'Implant the D-Rex with a cybernetic implant to make it smart.', shopDesc: '1000% terrifying.' }
                ],
                altarOfTheSunDoge: [
                    { level: 0, name: 'Altar of the SunDoge', dps: 1200, shopDesc: 'An altar of calling to an enlightened Doge above our WOW.' },
                    { level: 1, name: 'Awakened Altar of the SunDoge', dps: 1900, price: 200000000000, upgradeName: 'Awaken the Inner SunDoge', upgradeDesc: 'Awaken the altar by coating it in exceedingly hot Titan magma.', shopDesc: 'An awakened altar of calling to an enlightened Doge above our WOW.' },
                    { level: 2, name: 'Shiny Awakened Altar of the SunDoge', dps: 4999, price: 600000000000, upgradeName: 'Cover Me With Diamonds!', upgradeDesc: 'Show your loyalty to the SunDoge by coating the Altar with Diamonds. Very shiny.', shopDesc: 'A very shiny awakened altar of calling to an enlightened Doge above our WOW. Much loyalty. Very Sun.' }
                ]
            }
        };
    }

    getHelperCost(helperType, owned) {
        const helper = this.shopData.helpers[helperType];
        if (!helper) return Infinity;

        let cost = helper.baseCost * Math.pow(1.15, owned);
        if (this.game && this.game.isSupporter) {
            cost *= 0.95;
        }

        if (this.game && helperType === 'spaceRocket' && this.game.playerStats && this.game.playerStats.rocketCostReduction > 0) {
            cost *= (1 - this.game.playerStats.rocketCostReduction);
        }

        return Math.floor(cost);
    }

    canAffordHelper(helperType) {
        const owned = this.game.helpers.filter(h => h.type === helperType).length;
        const cost = this.getHelperCost(helperType, owned);
        return this.game.dogecoins >= cost;
    }

    canAffordPickaxe(pickaxeType) {
        const pickaxe = this.shopData.pickaxes[pickaxeType];
        if (!pickaxe) return false;

        return this.game.dogecoins >= pickaxe.cost && !this.game.pickaxes.includes(pickaxeType);
    }

    canAffordUpgrade(upgradeType) {
        const upgrade = this.shopData.upgrades[upgradeType];
        if (!upgrade) return false;

        const level = this.game.upgrades[upgradeType] || 0;
        if (level >= upgrade.maxLevel) return false;

        const cost = Math.floor(upgrade.baseCost * Math.pow(1.5, level));
        return this.game.dogecoins >= cost;
    }

    buyHelper(helperType) {
        if (!this.canAffordHelper(helperType)) {
            this.game.showNotification('Not enough Dogecoins!');
            return false;
        }

        const owned = this.game.helpers.filter(h => h.type === helperType).length;
        const cost = this.getHelperCost(helperType, owned);
        const helper = this.shopData.helpers[helperType];

        this.game.dogecoins -= cost;
        this.game.helpers.push({
            type: helperType,
            name: helper.name,  // Store the display name from shop data
            dps: helper.baseDps,
            owned: owned + 1
        });

        this.game.updateDPS();
        this.game.showNotification(`Bought ${helper.name} for ${this.game.formatNumber(cost)} Dogecoins!`);
        this.game.playSound('check.wav');

        return true;
    }

    buyPickaxe(pickaxeType) {
        if (!this.canAffordPickaxe(pickaxeType)) {
            this.game.showNotification('Cannot buy this pickaxe!');
            return false;
        }

        const pickaxe = this.shopData.pickaxes[pickaxeType];

        this.game.dogecoins -= pickaxe.cost;
        this.game.pickaxes.push(pickaxeType);
        this.game.currentPickaxe = pickaxeType;

        this.game.showNotification(`Bought ${pickaxe.name}!`);
        this.game.playSound('check.wav');

        return true;
    }

    buyUpgrade(upgradeType) {
        if (!this.canAffordUpgrade(upgradeType)) {
            this.game.showNotification('Cannot buy this upgrade!');
            return false;
        }

        const upgrade = this.shopData.upgrades[upgradeType];
        const level = this.game.upgrades[upgradeType] || 0;
        const cost = Math.floor(upgrade.baseCost * Math.pow(1.5, level));

        this.game.dogecoins -= cost;
        this.game.upgrades[upgradeType] = level + 1;

        this.game.showNotification(`Bought ${upgrade.name} Level ${level + 1}!`);
        this.game.playSound('check.wav');

        return true;
    }

    // Helper upgrade methods
    getHelperUpgradeLevel(helperType) {
        return this.game.helperUpgradeLevels?.[helperType] || 0;
    }

    getHelperUpgradeData(helperType) {
        return this.shopData.helperUpgrades?.[helperType] || null;
    }

    getNextHelperUpgrade(helperType) {
        const upgrades = this.getHelperUpgradeData(helperType);
        if (!upgrades) return null;

        const currentLevel = this.getHelperUpgradeLevel(helperType);
        const nextLevel = currentLevel + 1;

        if (nextLevel >= upgrades.length) return null; // Max level reached
        return upgrades[nextLevel];
    }

    getCurrentHelperUpgradeInfo(helperType) {
        const upgrades = this.getHelperUpgradeData(helperType);
        if (!upgrades) return null;

        const currentLevel = this.getHelperUpgradeLevel(helperType);
        return upgrades[currentLevel] || upgrades[0];
    }

    canAffordHelperUpgrade(helperType) {
        const nextUpgrade = this.getNextHelperUpgrade(helperType);
        if (!nextUpgrade) return false;
        return this.game.dogecoins >= nextUpgrade.price;
    }

    hasHelperUpgradeAvailable(helperType) {
        return this.getNextHelperUpgrade(helperType) !== null;
    }

    buyHelperUpgrade(helperType) {
        const nextUpgrade = this.getNextHelperUpgrade(helperType);
        if (!nextUpgrade) {
            this.game.showNotification('Max upgrade level reached!');
            return false;
        }

        if (!this.canAffordHelperUpgrade(helperType)) {
            this.game.showNotification('Not enough dogecoins!');
            return false;
        }

        // Deduct cost
        this.game.dogecoins -= nextUpgrade.price;

        // Increment upgrade level
        if (!this.game.helperUpgradeLevels) {
            this.game.helperUpgradeLevels = {};
        }
        this.game.helperUpgradeLevels[helperType] = (this.game.helperUpgradeLevels[helperType] || 0) + 1;

        // Update DPS for all placed helpers of this type
        console.log('=== buyHelperUpgrade calling updateHelperSpritesByType ===');
        console.log('helperType:', helperType);
        console.log('this.game:', this.game);
        console.log('this.game.updateHelperSpritesByType:', this.game.updateHelperSpritesByType);
        this.game.updateHelperSpritesByType(helperType);

        // Recalculate total DPS
        this.game.updateDPS();
        this.game.updateUI();
        this.game.updateShopPrices();

        // Play ching sound (same as buying a helper)
        if (window.audioManager) {
            window.audioManager.playSound('ching');
        }

        return true;
    }

    getShopItems(category) {
        return this.shopData[category] || {};
    }

    getUnlockedItems(category) {
        const items = this.getShopItems(category);
        const unlocked = {};

        Object.entries(items).forEach(([key, item]) => {
            if (this.isItemUnlocked(key, category)) {
                unlocked[key] = item;
            }
        });

        return unlocked;
    }

    isItemUnlocked(itemKey, category) {
        switch (category) {
            case 'helpers':
                // All helpers are unlocked by default
                return true;

            case 'pickaxes':
                const pickaxe = this.shopData.pickaxes[itemKey];
                return pickaxe && pickaxe.unlocked;

            case 'upgrades':
                // Unlock upgrades based on progress
                return this.isUpgradeUnlocked(itemKey);

            default:
                return false;
        }
    }

    isUpgradeUnlocked(upgradeType) {
        // Unlock upgrades based on game progress
        switch (upgradeType) {
            case 'clickPower':
                return this.game.totalMined >= 100;
            case 'autoClicker':
                return this.game.totalMined >= 1000;
            case 'criticalChance':
                return this.game.totalMined >= 5000;
            case 'helperEfficiency':
                return this.game.helpers.length >= 3;
            default:
                return false;
        }
    }

    updateShopDisplay() {
        // This will be called by the UI manager to refresh shop displays
        if (uiManager && uiManager.activePanel === 'shop-panel') {
            uiManager.updateShopContent();
        }
    }

    getHelperStats(helperType) {
        const helper = this.shopData.helpers[helperType];
        const owned = this.game.helpers.filter(h => h.type === helperType).length;
        const totalDps = helper.baseDps * owned;

        return {
            owned,
            totalDps,
            nextCost: this.getHelperCost(helperType, owned)
        };
    }

    getUpgradeStats(upgradeType) {
        const upgrade = this.shopData.upgrades[upgradeType];
        const level = this.game.upgrades[upgradeType] || 0;
        const nextCost = Math.floor(upgrade.baseCost * Math.pow(1.5, level));

        return {
            level,
            nextCost,
            maxLevel: upgrade.maxLevel,
            isMaxLevel: level >= upgrade.maxLevel
        };
    }

    // Special offers and limited-time items
    getSpecialOffers() {
        const offers = [];

        // Example: Double DPS weekend
        if (this.isWeekend()) {
            offers.push({
                type: 'doubleDps',
                name: 'Weekend Boost',
                description: 'All helpers produce 2x DPS!',
                icon: 'assets/general/icons/weekend.png',
                active: true
            });
        }

        return offers;
    }

    isWeekend() {
        const day = new Date().getDay();
        return day === 0 || day === 6; // Sunday or Saturday
    }

    applySpecialOffers() {
        const offers = this.getSpecialOffers();
        let multiplier = 1;

        offers.forEach(offer => {
            if (offer.active) {
                switch (offer.type) {
                    case 'doubleDps':
                        multiplier *= 2;
                        break;
                }
            }
        });

        return multiplier;
    }
}

// Global shop manager instance
let shopManager;
