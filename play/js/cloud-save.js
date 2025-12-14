// Cloud Save Manager for DogeMiner CE
class CloudSaveManager {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.init();
    }

    waitForGameReady(callback, attempts = 0) {
        const isGameReady = typeof window.game !== 'undefined' && window.game !== null;

        if (isGameReady) {
            callback?.();
            return;
        }

        if (attempts > 100) {
            console.warn('Game failed to initialize in time for cloud load.');
            return;
        }

        setTimeout(() => this.waitForGameReady(callback, attempts + 1), 100);
    }

    async init() {
        // Wait for Firebase to be available
        if (typeof window.firebase === 'undefined') {
            console.log('Waiting for Firebase to initialize...');
            setTimeout(() => this.init(), 100);
            return;
        }

        // Listen for authentication state changes
        window.firebase.onAuthStateChanged(window.firebase.auth, (user) => {
            this.currentUser = user;
            this.updateUI();
            
            // Automatically load from cloud when user signs in
            if (user) {
                this.waitForGameReady(() => this.loadFromCloudSilent());
            }
        });

        this.isInitialized = true;
        console.log('Cloud Save Manager initialized');
    }

    updateUI() {
        const userInfo = document.getElementById('user-info');
        const signInSection = document.getElementById('sign-in-section');
        const userName = document.getElementById('user-name');
        const localSection = document.getElementById('local-save-section');
        const localButtons = document.getElementById('local-save-buttons');
        const cloudLocalActions = document.getElementById('cloud-local-actions');

        if (this.currentUser) {
            // User is signed in
            userInfo.style.display = 'block';
            signInSection.style.display = 'none';
            userName.textContent = `Signed in as: ${this.currentUser.displayName || this.currentUser.email}`;

            if (cloudLocalActions && localButtons && localButtons.parentElement !== cloudLocalActions) {
                cloudLocalActions.appendChild(localButtons);
            }

            if (localSection) {
                localSection.style.display = 'none';
            }
        } else {
            // User is not signed in
            userInfo.style.display = 'none';
            signInSection.style.display = 'block';

            if (localSection && localButtons && localButtons.parentElement !== localSection) {
                localSection.appendChild(localButtons);
            }

            if (localSection) {
                localSection.style.display = '';
            }
        }
    }

    async signInWithGoogle() {
        try {
            if (!this.isInitialized) {
                if (window.notificationManager) {
                    window.notificationManager.showWarning('Firebase is still initializing. Please wait a moment.');
                }
                return;
            }

            if (window.notificationManager) {
                window.notificationManager.showInfo('Signing in with Google...');
            }
            
            const result = await window.firebase.signInWithPopup(
                window.firebase.auth, 
                window.firebase.provider
            );
            
            this.currentUser = result.user;
            if (window.notificationManager) {
                window.notificationManager.showSuccess(`Welcome, ${this.currentUser.displayName}!`);
            }
            
            // Refresh the page to ensure correct planet UI state
            window.location.reload();
            
        } catch (error) {
            console.error('Sign in error:', error);
            if (window.notificationManager) {
                window.notificationManager.showError('Failed to sign in. Please try again.');
            }
        }
    }

    async signOutUser() {
        try {
            await window.firebase.signOut(window.firebase.auth);
            this.currentUser = null;
            if (window.notificationManager) {
                window.notificationManager.showInfo('Signed out successfully');
            }
        } catch (error) {
            console.error('Sign out error:', error);
            if (window.notificationManager) {
                window.notificationManager.showError('Failed to sign out');
            }
        }
    }

    async saveToCloud() {
        if (!this.currentUser) {
            if (window.notificationManager) {
                window.notificationManager.showWarning('Please sign in first');
            }
            return;
        }

        try {
            if (window.notificationManager) {
                window.notificationManager.showInfo('Saving to cloud...');
            }
            
            // Get current game state
            const gameData = this.getGameState();
            console.log('Manual save - gameData:', gameData);
            
            if (gameData === null) {
                if (window.notificationManager) {
                    window.notificationManager.showError('Cannot save: Game not initialized');
                }
                return;
            }
            
            // Save to Firestore
            const userDocRef = window.firebase.doc(window.firebase.db, 'users', this.currentUser.uid);
            await window.firebase.setDoc(userDocRef, {
                gameData: gameData,
                lastSaved: new Date().toISOString(),
                version: '1.0.0'
            }, { merge: true });

            if (window.notificationManager) {
                window.notificationManager.showSuccess('Game saved to cloud successfully!');
            }
            
        } catch (error) {
            console.error('Cloud save error:', error);
            if (window.notificationManager) {
                window.notificationManager.showError('Failed to save to cloud. Please try again.');
            }
        }
    }

    async saveToCloudSilent() {
        if (!this.currentUser) {
            return;
        }

        try {
            // Get current game state
            const gameData = this.getGameState();
            console.log('Silent save - gameData:', gameData);
            
            if (gameData === null) {
                console.error('Cannot save to cloud: gameData is null');
                return;
            }
            
            // Save to Firestore silently
            const userDocRef = window.firebase.doc(window.firebase.db, 'users', this.currentUser.uid);
            await window.firebase.setDoc(userDocRef, {
                gameData: gameData,
                lastSaved: new Date().toISOString(),
                version: '1.0.0'
            }, { merge: true });

            console.log('Game auto-saved to cloud');
            
        } catch (error) {
            console.error('Silent cloud save error:', error);
        }
    }

    async deleteCloudSave() {
        if (!this.currentUser) {
            console.log('No user signed in, skipping cloud save deletion');
            return;
        }

        try {
            // Delete the user's save data from Firestore
            const userDocRef = window.firebase.doc(window.firebase.db, 'users', this.currentUser.uid);
            await window.firebase.deleteDoc(userDocRef);
            console.log('Cloud save deleted successfully');
            
        } catch (error) {
            console.error('Failed to delete cloud save:', error);
        }
    }

    async loadFromCloud() {
        if (!this.currentUser) {
            if (window.notificationManager) {
                window.notificationManager.showWarning('Please sign in first');
            }
            return;
        }

        try {
            if (window.notificationManager) {
                window.notificationManager.showInfo('Loading from cloud...');
            }
            
            // Get data from Firestore
            const userDocRef = window.firebase.doc(window.firebase.db, 'users', this.currentUser.uid);
            const docSnap = await window.firebase.getDoc(userDocRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.gameData) {
                    this.loadGameState(data.gameData);
                    if (window.notificationManager) {
                        window.notificationManager.showSuccess('Game loaded from cloud successfully!');
                    }
                } else {
                    if (window.notificationManager) {
                        window.notificationManager.showWarning('No save data found in cloud');
                    }
                }
            } else {
                if (window.notificationManager) {
                    window.notificationManager.showWarning('No save data found in cloud');
                }
            }
            
        } catch (error) {
            console.error('Cloud load error:', error);
            if (window.notificationManager) {
                window.notificationManager.showError('Failed to load from cloud. Please try again.');
            }
        }
    }

    async loadFromCloudSilent() {
        if (!this.currentUser) {
            return;
        }

        try {
            // Get data from Firestore
            const userDocRef = window.firebase.doc(window.firebase.db, 'users', this.currentUser.uid);
            const docSnap = await window.firebase.getDoc(userDocRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.gameData) {
                    this.loadGameState(data.gameData);
                    console.log('Game auto-loaded from cloud');
                }
            }
            
        } catch (error) {
            console.error('Silent cloud load error:', error);
        }
    }

    getGameState() {
        // Get the current game instance
        console.log('Getting game state...');
        console.log('window.game exists:', typeof window.game !== 'undefined');
        console.log('window.game is null:', window.game === null);
        console.log('window.game is undefined:', window.game === undefined);
        console.log('window.game type:', typeof window.game);
        console.log('window.game:', window.game);
        console.log('window.game.dogecoins:', window.game?.dogecoins);
        
        // Wait a bit for game to be ready if it's not available yet
        if (typeof window.game === 'undefined' || window.game === null || window.game === undefined) {
            console.log('Game not available yet, waiting...');
            return null;
        }
        
        const gameData = {
            dogecoins: window.game.dogecoins || 0,
            dps: window.game.dps || 0,
            helpers: window.game.helpers || {},
            upgrades: window.game.upgrades || {},
            totalMined: window.game.totalMined || 0,
            totalClicks: window.game.totalClicks || 0,
            currentLevel: window.game.currentLevel || 'earth',
            currentPickaxe: window.game.currentPickaxe || 'standard',
            playTime: window.game.playTime || 0,
            highestDps: window.game.highestDps || 0,
            achievements: window.game.achievements || {},
            settings: {
                soundEnabled: window.game.soundEnabled !== false,
                musicEnabled: window.game.musicEnabled !== false,
                notificationsEnabled: window.game.notificationsEnabled !== false,
                autoSaveEnabled: window.game.autoSaveEnabled !== false
            }
        };
        console.log('Game data to save:', gameData);
        return gameData;
    }

    loadGameState(gameData) {
        // Load the game state into the current game instance
        if (typeof window.game !== 'undefined' && window.game && gameData) {
            window.game.dogecoins = gameData.dogecoins || 0;
            window.game.dps = gameData.dps || 0;
            window.game.helpers = gameData.helpers || {};
            window.game.upgrades = gameData.upgrades || {};
            window.game.totalMined = gameData.totalMined || 0;
            window.game.totalClicks = gameData.totalClicks || 0;
            window.game.currentLevel = gameData.currentLevel || 'earth';
            window.game.currentPickaxe = gameData.currentPickaxe || 'standard';
            window.game.playTime = gameData.playTime || 0;
            window.game.highestDps = gameData.highestDps || 0;
            window.game.achievements = gameData.achievements || {};
            
            // Load settings
            if (gameData.settings) {
                window.game.soundEnabled = gameData.settings.soundEnabled !== undefined ? gameData.settings.soundEnabled : true;
                window.game.musicEnabled = gameData.settings.musicEnabled !== undefined ? gameData.settings.musicEnabled : true;
                window.game.notificationsEnabled = gameData.settings.notificationsEnabled !== undefined ? gameData.settings.notificationsEnabled : true;
                window.game.autoSaveEnabled = gameData.settings.autoSaveEnabled !== undefined ? gameData.settings.autoSaveEnabled : true;
            }

            // Apply planet-specific visuals
            const body = document.body;
            if (body) {
                if (window.game.currentLevel === 'moon') {
                    body.classList.add('moon-theme');
                } else {
                    body.classList.remove('moon-theme');
                }
            }

            const mainCharacter = document.getElementById('main-character');
            const mainRock = document.getElementById('main-rock');
            const platform = document.getElementById('platform');

            if (mainCharacter && mainRock) {
                if (window.game.currentLevel === 'moon') {
                    mainCharacter.src = 'assets/general/character/spacehelmet.png';
                    mainRock.src = 'assets/general/rocks/moon.png';
                    if (platform) {
                        platform.src = '../assets/quickUI/dogeplatformmoon.png';
                    }
                } else {
                    mainCharacter.src = 'assets/general/character/standard.png';
                    mainRock.src = 'assets/general/rocks/earth.png';
                    if (platform) {
                        platform.src = '../assets/quickUI/dogeplatform.png';
                    }
                }
            }

            // Update UI
            window.game.updateUI();
            window.game.updateDPS();

            // Update settings checkboxes
            document.getElementById('sound-enabled').checked = window.game.soundEnabled;
            document.getElementById('music-enabled').checked = window.game.musicEnabled;
            document.getElementById('notifications-enabled').checked = window.game.notificationsEnabled;
            document.getElementById('auto-save-enabled').checked = window.game.autoSaveEnabled;

            if (window.uiManager) {
                window.uiManager.updateBackground(window.game.currentLevel);
                window.uiManager.initializePlanetTabs?.();
                if (window.game.currentLevel === 'moon') {
                    window.uiManager.hideMoonLocked?.();
                    window.uiManager.updateShopContent?.();
                }
            }
        }
    }
}

// Global functions for HTML onclick handlers
let cloudSaveManager;

function signInWithGoogle() {
    if (window.cloudSaveManager) {
        window.cloudSaveManager.signInWithGoogle();
    } else if (cloudSaveManager) {
        cloudSaveManager.signInWithGoogle();
    } else {
        console.error('CloudSaveManager not initialized');
    }
}

function signOutUser() {
    if (window.cloudSaveManager) {
        window.cloudSaveManager.signOutUser();
    } else if (cloudSaveManager) {
        cloudSaveManager.signOutUser();
    } else {
        console.error('CloudSaveManager not initialized');
    }
}

function saveToCloud() {
    if (window.cloudSaveManager) {
        window.cloudSaveManager.saveToCloud();
    } else if (cloudSaveManager) {
        cloudSaveManager.saveToCloud();
    } else {
        console.error('CloudSaveManager not initialized');
    }
}

function loadFromCloud() {
    if (window.cloudSaveManager) {
        window.cloudSaveManager.loadFromCloud();
    } else if (cloudSaveManager) {
        cloudSaveManager.loadFromCloud();
    } else {
        console.error('CloudSaveManager not initialized');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    cloudSaveManager = new CloudSaveManager();
    window.cloudSaveManager = cloudSaveManager;
});

