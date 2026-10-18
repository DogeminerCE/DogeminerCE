// DogeMiner: Community Edition - Audio Manager using Howler.js
class AudioManager {
    constructor() {
        this.musicEnabled = true;
        this.soundEnabled = true;
        this.rockSoundsEnabled = true;
        this.backgroundAudioEnabled = true;
        this.currentTrack = null;
        this.introSound = null;
        this.loopSound = null;
        this.moonLoop = null;
        this.marsLoop = null;
        this.jupiterLoop = null;
        this.titanLoop = null;
        this.soundEffects = {};
        this.currentMusicPlanet = null;
    }

    init() {
        // Check if Howler.js is loaded
        if (typeof Howl === 'undefined') {
            console.error('Howler.js library not loaded! Audio will be disabled.');
            this.musicEnabled = false;
            this.soundEnabled = false;
            return;
        }

        try {
            // Load only Earth music and sound effects at startup
            // Other planet music is loaded on-demand to save memory
            this.loadLevel1Music();

            // Load sound effects
            this.loadSoundEffects();

            // Listen for settings changes
            this.setupSettingsListeners();
            this.setupAudioFocusListeners();
        } catch (error) {
            console.error('Error initializing audio:', error);
            console.error('Audio will be disabled');
            this.musicEnabled = false;
            this.soundEnabled = false;
        }
    }

    loadSoundEffects() {
        this.soundEffects.cate_dying=new Howl({src:['../assets/SoundsSrc/main/cate_dying.wav'],volume:.5});
        // Load swipe sound for tab switching - paths adjusted for play/ directory serving
        this.soundEffects.swipe = new Howl({
            src: ['../assets/SoundsSrc/main/swipe3.wav'],
            volume: 0.5
        });

        // Load ching sound for purchasing
        this.soundEffects.ching = new Howl({
            src: ['../assets/SoundsSrc/main/ching.wav'],
            volume: 0.5
        });

        // Load uhoh sound for locked content
        this.soundEffects.uhoh = new Howl({
            src: ['../assets/SoundsSrc/main/uhoh.wav'],
            volume: 0.5
        });

        // DM2's tab-scoped helper DPS hint entrance.
        this.soundEffects.notification = new Howl({
            src: ['../assets/SoundsSrc/main/notification.mp3'], volume: 0.5
        });

        // Load check sound for settings toggles
        this.soundEffects.check = new Howl({
            src: ['../assets/SoundsSrc/main/check.wav'],
            volume: 0.5
        });

        this.soundEffects.biblip = new Howl({
            src: ['../assets/SoundsSrc/main/biblip.wav'],
            volume: 0.5
        });

        this.soundEffects.news1 = new Howl({
            src: ['../assets/SoundsSrc/main/news1.mp3'], volume: 0.25
        });

        // Load pick sounds for rock hitting (normal pickaxes)
        this.soundEffects.pick = [];
        for (let i = 1; i <= 6; i++) {
            this.soundEffects.pick.push(new Howl({
                src: [`../assets/SoundsSrc/main/pick${i}.wav`],
                volume: 0.375  // 75% of 0.5
            }));
        }

        // Inventory open (pop)
        this.soundEffects.inventoryOpen = new Howl({
            src: ['../assets/SoundsSrc/main/pop1.wav'],
            volume: 0.5
        });

        // Inventory close (swipe)
        this.soundEffects.inventoryClose = new Howl({
            src: ['../assets/SoundsSrc/main/swipe_fast_low.wav'],
            volume: 0.5
        });

        // DM2 PopupBox default exit sound (source gain 0.3).
        this.soundEffects.swipe_fast_low = new Howl({
            src: ['../assets/SoundsSrc/main/swipe_fast_low.wav'],
            volume: 0.3
        });

        // DM2 story popup entrance.
        this.soundEffects.nice_popup = new Howl({
            src: ['../assets/SoundsSrc/main/nice_popup.wav'],
            volume: 0.5
        });

        // Dogebag appears from rock
        this.soundEffects.woof = new Howl({
            src: ['../assets/SoundsSrc/main/woof.mp3'],
            volume: 0.6
        });

        // Rock damage stage sounds (escalating intensity)
        this.soundEffects.rockhitSmallest = new Howl({
            src: ['../assets/SoundsSrc/main/rockhit_smallest.wav'],
            volume: 0.25
        });

        this.soundEffects.rockhitSmall = new Howl({
            src: ['../assets/SoundsSrc/main/rockhit_small.wav'],
            volume: 0.25
        });

        this.soundEffects.rockhitMedium = new Howl({
            src: ['../assets/SoundsSrc/main/rockhit_medium.wav'],
            volume: 0.25
        });

        this.soundEffects.rockhitLarge = new Howl({
            src: ['../assets/SoundsSrc/main/rockhit_large.wav'],
            volume: 0.25
        });

        // Critical hit
        this.soundEffects.hitHard = new Howl({
            src: ['../assets/SoundsSrc/main/hit_hard.wav'],
            volume: 0.5
        });

        // Grab helper to move it
        this.soundEffects.grabHelper = new Howl({
            src: ['../assets/SoundsSrc/main/grab_helper.wav'],
            volume: 0.5
        });

        // Collect small coin pile
        this.soundEffects.coinsSmall = new Howl({
            src: ['../assets/SoundsSrc/main/coins_small.wav'],
            volume: 0.5
        });

        // Collect medium/large coin pile
        this.soundEffects.getCoins = new Howl({
            src: ['../assets/SoundsSrc/main/get_coins.mp3'],
            volume: 0.5
        });

        // Bonus Coin spawn appearance (plays once, then triggers coinLoop)
        this.soundEffects.coinAppear = new Howl({
            src: ['../assets/SoundsSrc/main/coin_appear.mp3'],
            volume: 0.5,
            loop: false,
            onend: () => {
                const g = (typeof window !== 'undefined' && window.game) ? window.game : null;
                if (g && g._bonusCoinEl) {
                    this.playSound('coinLoop');
                }
            }
        });

        // Bonus Coin ambient loop (loops while coin remains on screen)
        this.soundEffects.coinLoop = new Howl({
            src: ['../assets/SoundsSrc/main/coin_loop.mp3'],
            volume: 0.5,
            loop: true
        });

        // Dogebag loot (coins only, not pickaxe/fortune)
        this.soundEffects.receiveStash = new Howl({
            src: ['../assets/SoundsSrc/main/receive_stash.mp3'],
            volume: 0.5
        });

        // Gas Carbine hit sounds (pew)
        this.soundEffects.pew = [];
        for (let i = 1; i <= 4; i++) {
            this.soundEffects.pew.push(new Howl({
                src: [`../assets/SoundsSrc/main/pew${i}.wav`],
                volume: 0.375
            }));
        }

        // Light-blade Pickaxe hit sounds (lasersword)
        this.soundEffects.lasersword = [];
        for (let i = 1; i <= 2; i++) {
            this.soundEffects.lasersword.push(new Howl({
                src: [`../assets/SoundsSrc/main/lasersword${i}.wav`],
                volume: 0.375
            }));
        }

        // Hit ground (hit rock at 0%)
        this.soundEffects.hitGround = new Howl({
            src: ['../assets/SoundsSrc/main/hit_ground.wav'],
            volume: 0.5
        });

        // Equip pickaxe from inventory
        this.soundEffects.pickup = new Howl({
            src: ['../assets/SoundsSrc/main/pickup_1.wav'],
            volume: 0.5
        });

        // Click on dogebag in world
        this.soundEffects.grabBag = new Howl({
            src: ['../assets/SoundsSrc/main/grab_bag2.wav'],
            volume: 0.5
        });

        this.soundEffects.grab_bag2 = this.soundEffects.grabBag;
        this.soundEffects.select1 = new Howl({ src: ['../assets/SoundsSrc/main/select1.wav'], volume: 0.15 });

        // Dogebag modal opens — item collect fanfare
        this.soundEffects.collectItem = new Howl({
            src: ['../assets/SoundsSrc/main/collect_item_1.wav'],
            volume: 0.6
        });

        // Receive a pickaxe or fortune from a dogebag
        this.soundEffects.receivePickaxe = new Howl({
            src: ['../assets/SoundsSrc/main/receive_pickaxe.mp3'],
            volume: 0.6
        });

        this.soundEffects.notification_soft3 = new Howl({
            src: ['../assets/SoundsSrc/main/notification_soft3.wav'], volume: 0.6
        });

        // Special story popup (DM2's Mystery Box evolution).
        this.soundEffects.short_sparkle = new Howl({
            src: ['../assets/SoundsSrc/main/short_sparkle.wav'],
            volume: 0.6
        });

        // Fortune-specific loot sound
        this.soundEffects.longSparkle = new Howl({
            src: ['../assets/SoundsSrc/main/long_sparkle.wav'],
            volume: 0.6
        });
    }

    setupSettingsListeners() {
        for (const [id, key, inverse] of this.audioPreferences()) {
            document.getElementById(id)?.addEventListener('change', event => {
                this.setAudioPreference(key, inverse ? !event.target.checked : event.target.checked);
            });
        }
    }

    audioPreferences() {
        return [['sound-enabled','soundEnabled',false], ['music-enabled','musicEnabled',false],
            ['mute-rock-sounds','rockSoundsEnabled',true], ['background-audio-enabled','backgroundAudioEnabled',false]];
    }

    syncAudioSettings() {
        for (const [id,key,inverse] of this.audioPreferences()) {
            for (const prefix of ['', 'mobile-']) {
                const input = document.getElementById(prefix + id);
                if (input) input.checked = inverse ? !this[key] : this[key];
            }
        }
    }

    setAudioPreference(key, value) {
        if (!this.audioPreferences().some(([,name]) => name === key)) return false;
        const previous = this[key], previousGame = window.game?.[key];
        this[key] = !!value;
        if (window.game) window.game[key] = this[key];
        let saved = true;
        try { if (window.saveManager) saved = window.saveManager.saveGame(false) !== false; }
        catch (_) { saved = false; }
        if (!saved) {
            this[key] = previous;
            if (window.game) window.game[key] = previousGame;
        }
        this.syncAudioSettings();
        this.applyAudioPolicy();
        if (key === 'musicEnabled' && saved) {
            if (this.musicEnabled && !this._audioSuspended) this.playBackgroundMusic();
            else this.stopMusic();
        }
        if (saved) this.playSound('check');
        return saved;
    }

    setupAudioFocusListeners() {
        if (this._focusListenersInstalled) return;
        this._focusListenersInstalled = true;
        this._windowFocused = document.hasFocus?.() !== false;
        window.addEventListener('blur', () => { this._windowFocused = false; this.applyAudioPolicy(); });
        window.addEventListener('focus', () => { this._windowFocused = true; this.applyAudioPolicy(); });
        document.addEventListener('visibilitychange', () => this.applyAudioPolicy());
        this.applyAudioPolicy();
    }

    isBackgroundMuted() {
        return this.backgroundAudioEnabled === false && (document.hidden || this._windowFocused === false);
    }

    isMiningSound(name) {
        return ['pick','pew','lasersword','hitHard','hitGround'].includes(name) || /^rockhit/.test(name);
    }

    applyMediaPolicy(media, cinematic = false) {
        if (!media) return;
        this._mediaOriginalMutes ||= new WeakMap();
        if (!this._mediaOriginalMutes.has(media)) this._mediaOriginalMutes.set(media, !!media.muted);
        const enabled = cinematic ? window.game?.soundEnabled !== false : this.soundEnabled;
        media.muted = this._mediaOriginalMutes.get(media) || !!window.CEParityTesting?.active || this.isBackgroundMuted() || !enabled;
    }

    applyAudioPolicy() {
        const background = this.isBackgroundMuted() || !!this._audioSuspended;
        for (const media of Object.values(window.timeTravelManager?._sounds || {})) this.applyMediaPolicy(media);
        this.applyMediaPolicy(window.game?.cutsceneVideo, true);
        // Keep each track's position and never alter an external/global mute.
        for (const track of [this.introSound,this.loopSound,this.moonLoop,this.marsLoop,this.jupiterLoop,this.titanLoop,this.holidayLoop]) {
            track?.mute?.(background || !this.musicEnabled);
        }
        for (const [name,effect] of Object.entries(this.soundEffects)) {
            const muted = background || !this.soundEnabled || (this.rockSoundsEnabled === false && this.isMiningSound(name));
            for (const sound of Array.isArray(effect) ? effect : [effect]) sound?.mute?.(muted);
        }
    }

    loadLevel1Music() {
        // Create intro sound - path adjusted for play/ directory serving
        this.introSound = new Howl({
            src: ['../assets/SoundsSrc/musiclevel1/music_intro.mp3'],
            loop: false,
            autoplay: false,
            volume: 0.5,
            onend: () => {
                // When intro ends, play the loop
                if (this.musicEnabled) {
                    this.loopSound.play();
                }
            }
        });

        // Create loop sound - path adjusted for play/ directory serving
        this.loopSound = new Howl({
            src: ['../assets/SoundsSrc/musiclevel1/music.mp3'],
            loop: true,
            autoplay: false,
            volume: 0.5
        });
        this.applyAudioPolicy();
    }

    loadMoonMusic() {
        this.moonLoop = new Howl({
            src: ['../assets/SoundsSrc/musiclevel2/music.mp3'],
            loop: true,
            autoplay: false,
            volume: 0.5
        });
        this.applyAudioPolicy();
    }

    loadMarsMusic() {
        this.marsLoop = new Howl({
            src: ['../assets/SoundsSrc/musiclevel3/music.mp3'],
            loop: true,
            autoplay: false,
            volume: 0.5
        });
        this.applyAudioPolicy();
    }

    loadJupiterMusic() {
        // Jupiter uses musiclevel4 for atmospheric background music
        this.jupiterLoop = new Howl({
            src: ['../assets/SoundsSrc/musiclevel4/music.mp3'],
            loop: true,
            autoplay: false,
            volume: 0.5
        });
        this.applyAudioPolicy();
    }

    loadTitanMusic() {
        // Titan uses musiclevel5 compiled audiosprite for ambient soundscape
        this.titanLoop = new Howl({
            src: ['../assets/SoundsSrc/musiclevel5/compiled/audiosprite_level5.mp3'],
            loop: true,
            autoplay: false,
            volume: 0.5
        });
        this.applyAudioPolicy();
    }

    isPlaying(sound) {
        return !!(sound && typeof sound.playing === 'function' && sound.playing());
    }

    playBackgroundMusic() {
        if (!this.musicEnabled || this._audioSuspended) return;

        const currentLevel = window.game?.currentLevel || 'earth';

        if (window.DogeMinerSeasonal?.active(window.game) === 'xmas') {
            const path = '../assets/SoundsSrc/musiclevelxmas/level' + (['earth','moon','mars','jupiter','titan'].indexOf(currentLevel)+1) + '/music.mp3';
            if (this._holidayMusicPath === path && this.isPlaying(this.holidayLoop)) return;
            this.stopMusic();
            if (this._holidayMusicPath !== path) {
                this.holidayLoop?.unload?.();
                this.holidayLoop = new Howl({src:[path],loop:true,autoplay:false,volume:this.musicVolume??0.5});
                this._holidayMusicPath = path;
            }
            this.currentMusicPlanet = currentLevel;
            this.applyAudioPolicy();this.holidayLoop?.play();return;
        }

        if (this.currentMusicPlanet === currentLevel) {
            if (currentLevel === 'moon' && this.isPlaying(this.moonLoop)) {
                return;
            }
            if (currentLevel === 'mars' && this.isPlaying(this.marsLoop)) {
                return;
            }
            if (currentLevel === 'jupiter' && this.isPlaying(this.jupiterLoop)) {
                return;
            }
            if (currentLevel === 'titan' && this.isPlaying(this.titanLoop)) {
                return;
            }
            if (currentLevel === 'earth' && (this.isPlaying(this.introSound) || this.isPlaying(this.loopSound))) {
                return;
            }
        }

        // Stop any currently playing music
        this.stopMusic();

        this.currentMusicPlanet = currentLevel;

        if (currentLevel === 'moon') {
            if (!this.moonLoop) this.loadMoonMusic();
            if (this.moonLoop) {
                this.moonLoop.play();
            }
        } else if (currentLevel === 'mars') {
            if (!this.marsLoop) this.loadMarsMusic();
            if (this.marsLoop) {
                this.marsLoop.play();
            }
        } else if (currentLevel === 'jupiter') {
            if (!this.jupiterLoop) this.loadJupiterMusic();
            if (this.jupiterLoop) {
                this.jupiterLoop.play();
            }
        } else if (currentLevel === 'titan') {
            if (!this.titanLoop) this.loadTitanMusic();
            if (this.titanLoop) {
                this.titanLoop.play();
            }
        } else {
            // Play intro first, then loop (Earth)
            if (this.introSound) {
                this.introSound.play();
            }
        }
    }

    stopMusic() {
        this.holidayLoop?.stop?.();
        if (this.introSound) {
            this.introSound.stop();
        }
        if (this.loopSound) {
            this.loopSound.stop();
        }
        if (this.moonLoop) {
            this.moonLoop.stop();
        }
        if (this.marsLoop) {
            this.marsLoop.stop();
        }
        if (this.jupiterLoop) {
            this.jupiterLoop.stop();
        }
        if (this.titanLoop) {
            this.titanLoop.stop();
        }
        this.currentMusicPlanet = null;
    }

    setMusicVolume(volume) {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        this.musicVolume = clampedVolume;
        this.holidayLoop?.volume?.(clampedVolume);
        if (this.introSound) {
            this.introSound.volume(clampedVolume);
        }
        if (this.loopSound) {
            this.loopSound.volume(clampedVolume);
        }
        if (this.moonLoop) {
            this.moonLoop.volume(clampedVolume);
        }
        if (this.marsLoop) {
            this.marsLoop.volume(clampedVolume);
        }
        if (this.jupiterLoop) {
            this.jupiterLoop.volume(clampedVolume);
        }
        if (this.titanLoop) {
            this.titanLoop.volume(clampedVolume);
        }
    }

    setSoundVolume(volume) {
        // Store volume for future sound effects
        this.soundVolume = Math.max(0, Math.min(1, volume));
    }

    // Play a sound effect
    playSound(soundName, options = {}) {
        if (!this.soundEnabled || this._audioSuspended || this.isBackgroundMuted() || (this.rockSoundsEnabled === false && this.isMiningSound(soundName))) return;

        const sound = this.soundEffects[soundName];
        if (sound) {
            // If it's an array (like pick sounds), pick a random one
            if (Array.isArray(sound)) {
                const randomIndex = Math.floor(Math.random() * sound.length);
                sound[randomIndex].play();
            } else {
                sound.play();
            }
        }
    }

    // Stop a specific sound effect
    stopSound(soundName) {
        const sound = this.soundEffects[soundName];
        if (sound) {
            if (Array.isArray(sound)) {
                sound.forEach(s => s && typeof s.stop === 'function' && s.stop());
            } else if (typeof sound.stop === 'function') {
                sound.stop();
            }
        }
    }

    suspendAllAudio() {
        if (this._audioSuspended) return;
        this._audioSuspended = true;
        this._wasMusicEnabled = this.musicEnabled;
        this._wasSoundEnabled = this.soundEnabled;
        this.stopMusic();
        this.musicEnabled = false;
        this.soundEnabled = false;
        this.stopAllSoundEffects();
    }

    resumeAudio() {
        this._audioSuspended = false;
        if (typeof this._wasMusicEnabled === 'boolean') {
            this.musicEnabled = this._wasMusicEnabled;
        }
        if (typeof this._wasSoundEnabled === 'boolean') {
            this.soundEnabled = this._wasSoundEnabled;
        }
        delete this._wasMusicEnabled;
        delete this._wasSoundEnabled;
        this.applyAudioPolicy();
        if (this.musicEnabled) {
            this.playBackgroundMusic();
        }
    }

    stopAllSoundEffects() {
        Object.values(this.soundEffects).forEach(effect => {
            if (Array.isArray(effect)) {
                effect.forEach(sound => {
                    if (sound && typeof sound.stop === 'function') {
                        sound.stop();
                    }
                });
            } else if (effect && typeof effect.stop === 'function') {
                effect.stop();
            }
        });
    }
}

// Global audio manager instance
let audioManager;
