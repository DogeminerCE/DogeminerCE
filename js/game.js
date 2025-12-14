// DogeMiner: Community Edition - Main Game Logic
class DogeMinerGame {
    constructor() {
        this.dogecoins = 0;
        this.totalMined = 0;
        this.totalClicks = 0;
        this.dps = 0;
        this.highestDps = 0;
        this.currentLevel = 'earth';
        this.helpers = [];
        this.upgrades = [];
        this.pickaxes = [];
        this.currentPickaxe = 'standard';
        
        // Game state
        this.isPlaying = false;
        this.lastSave = Date.now();
        this.autoSaveInterval = 30000; // 30 seconds
        this.startTime = Date.now();
        this.totalPlayTime = 0;
        
        // Input state tracking
        this.isMouseDown = false;
        this.isSpaceDown = false;
        this.swingTimeout = null;
        
        // Animation and effects
        this.clickEffects = [];
        this.particles = [];
        
        // Background rotation
        this.backgrounds = [
            'backgrounds/bg1.jpg',
            'backgrounds/bg3.jpg',
            'backgrounds/bg4.jpg',
            'backgrounds/bg5.jpg',
            'backgrounds/bg6.jpg',
            'backgrounds/bg7.jpg',
            'backgrounds/bg9.jpg',
            'backgrounds/bg-new.jpg'
        ];
        this.currentBackgroundIndex = 0;
        this.backgroundRotationInterval = null;
        
        // Blink animation
        this.blinkInterval = null;
        
        // rkn spawn
        this.rickInterval = null;
        this.rickVisible = false;
        this.rickSprites = [
            'assets/general/rm/r1.png',
            'assets/general/rm/r2.png',
            'assets/general/rm/r3.png',
            'assets/general/rm/r4.png'
        ];
        this.currentRickSprite = 0;
        this.rickAnimationDirection = 1; // 1 for forward, -1 for backward
        this.rickAnimationComplete = false;
        
        // Initialize game data
        this.initializeGameData();
        this.setupEventListeners();
        this.startGameLoop();
        this.startBackgroundRotation();
        this.startBlinking();
        this.startRickSpawn();
    }
    
    initializeGameData() {
        // Helper definitions
        this.helperTypes = {
            shibe: {
                name: 'Shibe',
                baseCost: 10,
                baseDps: 1,
                icon: 'assets/helpers/helpers/shibes/shibes-idle-0.png',
                description: 'A loyal mining companion'
            },
            kitten: {
                name: 'Kitten',
                baseCost: 50,
                baseDps: 5,
                icon: 'assets/helpers/helpers/kittens/kittens-idle-0.png',
                description: 'Cute but effective miner'
            },
            kennel: {
                name: 'Kennel',
                baseCost: 200,
                baseDps: 20,
                icon: 'assets/helpers/helpers/kennels/kennels-idle-0.png',
                description: 'Houses multiple shibes'
            },
            rocket: {
                name: 'Rocket',
                baseCost: 1000,
                baseDps: 100,
                icon: 'assets/helpers/helpers/rockets/rockets-idle-0.png',
                description: 'Advanced mining technology'
            },
            marsbase: {
                name: 'Mars Base',
                baseCost: 5000,
                baseDps: 500,
                icon: 'assets/helpers/helpers/marsbase/marsbase-idle-0.png',
                description: 'Interplanetary mining facility'
            }
        };
        
        // Pickaxe definitions
        this.pickaxeTypes = {
            standard: {
                name: 'Standard Pickaxe',
                cost: 0,
                multiplier: 1,
                icon: 'assets/items/items/pickaxes/standard.png',
                description: 'Basic mining tool'
            },
            stronger: {
                name: 'Stronger Pickaxe',
                cost: 100,
                multiplier: 2,
                icon: 'assets/items/items/pickaxes/stronger.png',
                description: 'More powerful mining'
            },
            golden: {
                name: 'Golden Pickaxe',
                cost: 500,
                multiplier: 5,
                icon: 'assets/items/items/pickaxes/golden.png',
                description: 'Luxury mining equipment'
            },
            rocketaxe: {
                name: 'Rocket Pickaxe',
                cost: 2000,
                multiplier: 10,
                icon: 'assets/items/items/pickaxes/rocketaxe.png',
                description: 'Space-age mining technology'
            }
        };
        
        // Level definitions
        this.levels = {
            earth: {
                name: 'Earth',
                background: 'assets/backgrounds/bg/bg1.jpg',
                rock: 'assets/general/rocks/earth.png',
                unlockCost: 0,
                description: 'Start your mining journey on Earth'
            },
            moon: {
                name: 'Moon',
                background: 'assets/backgrounds/bg/bgmoon01.jpg',
                rock: 'assets/general/rocks/moon.png',
                unlockCost: 10000,
                description: 'Mine in low gravity'
            },
            mars: {
                name: 'Mars',
                background: 'assets/backgrounds/bg/bg4.jpg',
                rock: 'assets/general/rocks/mars.png',
                unlockCost: 100000,
                description: 'Red planet mining operations'
            },
            jupiter: {
                name: 'Jupiter',
                background: 'assets/backgrounds/bg/bgjup01.jpg',
                rock: 'assets/general/rocks/jupiter.png',
                unlockCost: 1000000,
                description: 'Gas giant mining'
            }
        };
    }
    
    setupEventListeners() {
        // Rock clicking
        const rockContainer = document.getElementById('rock-container');
        const clickOverlay = document.getElementById('click-overlay');
        
        // Mouse events
        clickOverlay.addEventListener('mousedown', (e) => {
            this.isMouseDown = true;
            this.handleRockClick(e);
            this.startSwing();
        });
        
        document.addEventListener('mouseup', () => {
            this.isMouseDown = false;
            this.endSwing();
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.repeat) {
                e.preventDefault();
                this.isSpaceDown = true;
                this.handleRockClick();
                this.startSwing();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.isSpaceDown = false;
                this.endSwing();
            }
        });
        
        // Auto-save
        setInterval(() => {
            this.saveGame();
        }, this.autoSaveInterval);
    }
    
    handleRockClick(event = null) {
        if (!this.isPlaying) return;
        
        this.totalClicks++;
        
        // Pickaxe swing animation
        this.swingPickaxe();
        
        // Doge bounce animation
        this.bounceDoge();
        
        // Award dogecoins for each hit
        const coinsPerHit = this.getClickPower();
        this.dogecoins += coinsPerHit;
        this.totalMined += coinsPerHit;
        
        // Create floating coin effect
        this.createFloatingCoin(coinsPerHit);
        
        // Visual effects for hitting rock
        this.createClickEffect(event);
        this.createParticleEffect(event);
        
        this.updateUI();
        
        // Sound effect (if available)
        this.playSound('pick1.wav');
        
        // Achievement checks (disabled for now)
        // this.checkAchievements();
    }
    
    getClickPower() {
        const basePower = 1; // 1% per hit like DogeMiner 2
        const pickaxeMultiplier = this.pickaxeTypes[this.currentPickaxe].multiplier;
        return basePower * pickaxeMultiplier;
    }
    
    swingPickaxe() {
        // Pickaxe state is now managed by updatePickaxeState()
        // This method is kept for compatibility but doesn't do the timeout anymore
    }
    
    bounceDoge() {
        const doge = document.getElementById('main-character');
        if (!doge) return;
        
        // Add bounce class
        doge.classList.add('bounce');
        
        // Remove bounce class after animation completes
        setTimeout(() => {
            doge.classList.remove('bounce');
        }, 200);
    }
    
    startSwing() {
        const pickaxe = document.getElementById('pickaxe');
        if (!pickaxe) return;
        
        // Always start the swing immediately
        pickaxe.classList.add('swinging');
        
        // Clear any existing timeout since we're starting a new swing
        if (this.swingTimeout) {
            clearTimeout(this.swingTimeout);
            this.swingTimeout = null;
        }
    }
    
    endSwing() {
        const pickaxe = document.getElementById('pickaxe');
        if (!pickaxe) return;
        
        // Only end swing if neither input is currently held
        if (!this.isMouseDown && !this.isSpaceDown) {
            // Clear any existing timeout first
            if (this.swingTimeout) {
                clearTimeout(this.swingTimeout);
                this.swingTimeout = null;
            }
            
            // Small delay to ensure swing is visible on quick taps
            this.swingTimeout = setTimeout(() => {
                // Double-check that inputs are still not held when timeout fires
                if (!this.isMouseDown && !this.isSpaceDown) {
                    pickaxe.classList.remove('swinging');
                }
                this.swingTimeout = null;
            }, 30); // Just 30ms - enough to see the swing but fast enough for rapid clicks
        }
    }
    
    createParticleEffect(event) {
        const container = document.getElementById('particle-container');
        if (!container) return;
        
        // Get rock position for particle origin
        const rock = document.getElementById('main-rock');
        const rockRect = rock.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Calculate position relative to particle container
        const x = rockRect.left + rockRect.width / 2 - containerRect.left;
        const y = rockRect.top + rockRect.height / 2 - containerRect.top;
        
        // Create 5-8 particles (random amount)
        const particleCount = 5 + Math.floor(Math.random() * 4); // 5-8 particles
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('img');
            particle.src = 'assets/general/rocks/earth_particle.png';
            particle.className = 'earth-particle';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            
            // Random direction and distance for more realistic effect
            const angle = Math.random() * Math.PI * 2; // Random angle
            const distance = 40 + Math.random() * 30; // 40-70px distance
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            
            particle.style.setProperty('--dx', dx + 'px');
            particle.style.setProperty('--dy', dy + 'px');
            
            container.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 600); // Slightly faster animation
        }
    }
    
    // Coin explosion removed - simplified mining
    
    createClickEffect(event) {
        const rock = document.getElementById('main-rock');
        rock.classList.add('shake');
        setTimeout(() => {
            rock.classList.remove('shake');
        }, 300);
        
        // Particle effect
        if (event) {
            const rect = event.target.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            this.createParticles(x, y);
        }
    }
    
    createParticles(x, y) {
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.position = 'absolute';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.background = '#ffd700';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '1000';
            
            document.getElementById('mining-area').appendChild(particle);
            
            // Animate particle
            const angle = (Math.PI * 2 * i) / 5;
            const velocity = 50 + Math.random() * 50;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            particle.animate([
                { transform: 'translate(0, 0)', opacity: 1 },
                { transform: `translate(${vx}px, ${vy}px)`, opacity: 0 }
            ], {
                duration: 1000,
                easing: 'ease-out'
            }).onfinish = () => {
                particle.remove();
            };
        }
    }
    
    createFloatingCoin(amount) {
        // Get the floating coins container
        const container = document.getElementById('floating-coins');
        if (!container) return;
        
        // Get rock position
        const rock = document.getElementById('main-rock');
        const rockRect = rock.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Calculate position relative to container
        const startX = rockRect.left + rockRect.width / 2 - containerRect.left;
        const startY = rockRect.top + rockRect.height / 2 - containerRect.top;
        
        // Create DogeCoin
        const coin = document.createElement('img');
        coin.src = 'assets/general/dogecoin_70x70.png';
        coin.className = 'dogecoin-effect';
        coin.style.position = 'absolute';
        coin.style.left = startX + 'px';
        coin.style.top = startY + 'px';
        coin.style.width = '35px';
        coin.style.height = '35px';
        coin.style.transform = 'translate(-50%, -50%)';
        coin.style.zIndex = '20';
        
        // Create +amount text
        const text = document.createElement('div');
        text.className = 'dogecoin-text';
        text.textContent = '+' + amount;
        text.style.position = 'absolute';
        text.style.left = (startX + 40) + 'px';
        text.style.top = startY + 'px';
        text.style.color = '#ffd700';
        text.style.fontWeight = '900';
        text.style.fontSize = '20px';
        text.style.fontFamily = 'DogeSans, sans-serif';
        text.style.textShadow = '2px 2px 0px #ffffff, -2px -2px 0px #ffffff, 2px -2px 0px #ffffff, -2px 2px 0px #ffffff';
        text.style.transform = 'translate(-50%, -50%)';
        text.style.zIndex = '21';
        
        // Add to container
        container.appendChild(coin);
        container.appendChild(text);
        
        // Animate coin
        coin.animate([
            { transform: 'translate(-50%, -50%) scale(1.2)', opacity: 1 },
            { transform: 'translate(-50%, -150px) scale(0.4)', opacity: 0 }
        ], {
            duration: 1500,
            easing: 'ease-out',
            fill: 'forwards'
        });
        
        // Animate text
        text.animate([
            { transform: 'translate(-50%, -50%)', opacity: 1 },
            { transform: 'translate(-50%, -150px)', opacity: 0 }
        ], {
            duration: 1500,
            easing: 'ease-out',
            fill: 'forwards'
        });
        
        // Remove after animation
        setTimeout(() => {
            if (coin.parentNode) coin.parentNode.removeChild(coin);
            if (text.parentNode) text.parentNode.removeChild(text);
        }, 1500);
    }
    
    buyHelper(helperType) {
        const helper = this.helperTypes[helperType];
        const owned = this.helpers.filter(h => h.type === helperType).length;
        const cost = Math.floor(helper.baseCost * Math.pow(1.15, owned));
        
        if (this.dogecoins >= cost) {
            this.dogecoins -= cost;
            this.helpers.push({
                type: helperType,
                dps: helper.baseDps,
                owned: owned + 1
            });
            
            this.updateDPS();
            this.updateUI();
            this.showNotification(`Bought ${helper.name} for ${this.formatNumber(cost)} Dogecoins!`);
            this.playSound('check.wav');
            
            return true;
        }
        return false;
    }
    
    buyPickaxe(pickaxeType) {
        const pickaxe = this.pickaxeTypes[pickaxeType];
        
        if (this.dogecoins >= pickaxe.cost && !this.pickaxes.includes(pickaxeType)) {
            this.dogecoins -= pickaxe.cost;
            this.pickaxes.push(pickaxeType);
            this.currentPickaxe = pickaxeType;
            
            this.updateUI();
            this.showNotification(`Bought ${pickaxe.name}!`);
            this.playSound('check.wav');
            
            return true;
        }
        return false;
    }
    
    updateDPS() {
        this.dps = this.helpers.reduce((total, helper) => {
            return total + helper.dps;
        }, 0);
        
        // Update highest DPS
        if (this.dps > this.highestDps) {
            this.highestDps = this.dps;
        }
    }
    
    startGameLoop() {
        this.isPlaying = true;
        
        const gameLoop = () => {
            if (this.isPlaying) {
                // Passive income from helpers
                if (this.dps > 0) {
                    const passiveIncome = this.dps / 60; // DPS per frame (60 FPS)
                    this.dogecoins += passiveIncome;
                    this.totalMined += passiveIncome;
                }
                
                this.updateUI();
                this.updateHelpers();
            }
            
            requestAnimationFrame(gameLoop);
        };
        
        gameLoop();
    }
    
    startBackgroundRotation() {
        // Start background rotation every 15 seconds
        this.backgroundRotationInterval = setInterval(() => {
            this.rotateBackground();
        }, 15000);
    }
    
    rotateBackground() {
        // Remove active class from current background
        const currentImage = document.getElementById(`background-image-${this.currentBackgroundIndex + 1}`);
        if (currentImage) {
            currentImage.classList.remove('active');
        }
        
        // Move to next background
        this.currentBackgroundIndex = (this.currentBackgroundIndex + 1) % this.backgrounds.length;
        
        // Add active class to new background
        const nextImage = document.getElementById(`background-image-${this.currentBackgroundIndex + 1}`);
        if (nextImage) {
            nextImage.classList.add('active');
        }
        
        console.log(`Background rotated to: ${this.backgrounds[this.currentBackgroundIndex]}`);
    }
    
    startBlinking() {
        // Start blinking every 10 seconds
        this.blinkInterval = setInterval(() => {
            this.blinkDoge();
        }, 10000);
    }
    
    blinkDoge() {
        const doge = document.getElementById('main-character');
        if (!doge) return;
        
        // Store original src
        const originalSrc = doge.src;
        
        // Change to closed eyes
        doge.src = 'assets/general/character/closed_eyes.png';
        
        // Blink for 200ms
        setTimeout(() => {
            doge.src = originalSrc;
        }, 200);
    }
    
    startRickSpawn() {
        // Rick spawns every 3-5 minutes (180-300 seconds)
        const spawnTime = 180000 + Math.random() * 120000; // 3-5 minutes
        this.rickInterval = setTimeout(() => {
            this.spawnRick();
        }, spawnTime);
    }
    
    spawnRick() {
        if (this.rickVisible) return; // Don't spawn if already visible
        
        this.rickVisible = true;
        this.currentRickSprite = 0;
        this.rickAnimationDirection = 1;
        this.rickAnimationComplete = false;
        
        // Create portal background
        const portal = document.createElement('img');
        portal.id = 'rick-portal';
        portal.src = 'assets/general/rm/portal.png';
        portal.style.position = 'absolute';
        portal.style.bottom = '170px'; // Moved up 150px
        portal.style.right = '10px'; // Moved to the right
        portal.style.width = '80px';
        portal.style.height = '80px';
        portal.style.zIndex = '24';
        portal.style.opacity = '0';
        portal.style.transition = 'opacity 0.5s ease';
        
        // Create Rick element
        const rick = document.createElement('img');
        rick.id = 'rick-doge';
        rick.src = this.rickSprites[0];
        rick.className = 'rick-doge';
        rick.style.position = 'absolute';
        rick.style.bottom = '170px'; // Moved up 150px
        rick.style.right = '20px';
        rick.style.width = '80px';
        rick.style.height = '80px';
        rick.style.zIndex = '25';
        rick.style.cursor = 'default'; // Remove pointer cursor
        rick.style.transition = 'opacity 0.3s ease';
        rick.style.objectFit = 'contain'; // Fix stretching
        
        document.getElementById('left-panel').appendChild(portal);
        document.getElementById('left-panel').appendChild(rick);
        
        // Fade in portal
        setTimeout(() => {
            portal.style.opacity = '1';
        }, 100);
        
        // Animate through sprites
        this.animateRick();
        
        // Auto-hide after 8 seconds (faster fade out)
        setTimeout(() => {
            this.hideRick();
        }, 8000);
    }
    
    animateRick() {
        if (!this.rickVisible || this.rickAnimationComplete) return;
        
        const rick = document.getElementById('rick-doge');
        if (!rick) return;
        
        // Check if we've completed the full sequence (back to R1)
        if (this.currentRickSprite === 0 && this.rickAnimationDirection === -1) {
            this.rickAnimationComplete = true;
            // Fade out immediately when animation completes
            setTimeout(() => {
                this.hideRick();
            }, 500); // Small delay to show final frame
            return; // Stop animation immediately
        }
        
        // Move to next sprite based on direction
        this.currentRickSprite += this.rickAnimationDirection;
        
        // Check if we've reached R4 (index 3)
        if (this.currentRickSprite === 3) {
            // Pause at R4 for 2 seconds
            rick.src = this.rickSprites[this.currentRickSprite];
            this.rickAnimationDirection = -1; // Start going backward
            setTimeout(() => {
                this.animateRick();
            }, 2000); // 2 second pause
            return;
        }
        
        rick.src = this.rickSprites[this.currentRickSprite];
        
        // Continue animation every 500ms
        setTimeout(() => {
            this.animateRick();
        }, 500);
    }
    
    // Rick click functionality removed - no longer gives coins
    
    hideRick() {
        const rick = document.getElementById('rick-doge');
        const portal = document.getElementById('rick-portal');
        
        if (rick) {
            rick.style.opacity = '0';
            setTimeout(() => {
                if (rick.parentNode) {
                    rick.parentNode.removeChild(rick);
                }
            }, 300);
        }
        
        // Portal stays visible for 0.4 seconds after Rick fades
        if (portal) {
            setTimeout(() => {
                portal.style.opacity = '0';
                setTimeout(() => {
                    if (portal.parentNode) {
                        portal.parentNode.removeChild(portal);
                    }
                }, 400); // 0.4 seconds
            }, 300); // Wait for Rick to fade first
        }
        
        this.rickVisible = false;
    }
    
    scheduleNextRick() {
        // Schedule next Rick spawn
        const spawnTime = 180000 + Math.random() * 120000; // 3-5 minutes
        this.rickInterval = setTimeout(() => {
            this.spawnRick();
        }, spawnTime);
    }
    
    // Debug method to force Rick spawn
    forceRickSpawn() {
        this.hideRick(); // Hide current Rick if visible
        this.spawnRick();
    }
    
    stopBackgroundRotation() {
        if (this.backgroundRotationInterval) {
            clearInterval(this.backgroundRotationInterval);
            this.backgroundRotationInterval = null;
        }
    }
    
    updateHelpers() {
        // Animate helpers
        this.helpers.forEach(helper => {
            // Helper animation logic would go here
        });
    }
    
    updateUI() {
        // Update dogecoin display
        document.getElementById('dogecoin-amount').textContent = 'D ' + this.formatNumber(Math.floor(this.dogecoins));
        document.getElementById('dps-amount').textContent = this.formatNumber(this.dps);
        document.getElementById('total-mined').textContent = this.formatNumber(Math.floor(this.totalMined));
        document.getElementById('total-clicks').textContent = this.formatNumber(this.totalClicks);
        document.getElementById('helpers-owned').textContent = this.helpers.length;
        document.getElementById('current-level').textContent = this.levels[this.currentLevel].name;
        
        // Update play time
        const currentPlayTime = Math.floor((Date.now() - this.startTime) / 1000) + this.totalPlayTime;
        document.getElementById('play-time').textContent = this.formatTime(currentPlayTime);
        document.getElementById('highest-dps').textContent = this.formatNumber(this.highestDps);
        
        // Rock health system removed - simplified mining
    }
    
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }
    
    formatNumber(num) {
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return Math.floor(num).toString();
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.getElementById('notifications').appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    playSound(soundFile) {
        // Sound implementation would go here
        // For now, we'll just log the sound
        console.log('Playing sound:', soundFile);
    }
    
    checkAchievements() {
        // Achievement system disabled - will be implemented with custom achievements later
        // if (this.totalClicks === 100) {
        //     this.showNotification('Achievement: 100 Clicks!');
        // }
        // if (this.totalMined >= 1000) {
        //     this.showNotification('Achievement: 1000 Dogecoins Mined!');
        // }
    }
    
    saveGame() {
        const saveData = {
            dogecoins: this.dogecoins,
            totalMined: this.totalMined,
            totalClicks: this.totalClicks,
            dps: this.dps,
            currentLevel: this.currentLevel,
            helpers: this.helpers,
            pickaxes: this.pickaxes,
            currentPickaxe: this.currentPickaxe,
            timestamp: Date.now()
        };
        
        localStorage.setItem('dogeminer_save', JSON.stringify(saveData));
        this.lastSave = Date.now();
    }
    
    loadGame() {
        const saveData = localStorage.getItem('dogeminer_save');
        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                this.dogecoins = data.dogecoins || 0;
                this.totalMined = data.totalMined || 0;
                this.totalClicks = data.totalClicks || 0;
                this.dps = data.dps || 0;
                this.currentLevel = data.currentLevel || 'earth';
                this.helpers = data.helpers || [];
                this.pickaxes = data.pickaxes || ['standard'];
                this.currentPickaxe = data.currentPickaxe || 'standard';
                
                this.updateDPS();
                this.updateUI();
                this.showNotification('Game loaded successfully!');
                return true;
            } catch (e) {
                console.error('Error loading save data:', e);
                this.showNotification('Error loading save data!');
                return false;
            }
        }
        return false;
    }
    
    resetGame() {
        if (confirm('Are you sure you want to reset your game? This cannot be undone!')) {
            localStorage.removeItem('dogeminer_save');
            location.reload();
        }
    }
}

// Global game instance
let game;
