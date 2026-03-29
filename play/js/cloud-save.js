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

            if (gameData === null) {
                if (window.notificationManager) {
                    window.notificationManager.showError('Cannot save: Game not initialized');
                }
                return;
            }

            // Stripping isSupporter from the cloud-specific payload to prevent client-side clobbering 
            // of the root-level Source of Truth (which is managed by Ko-Fi/Manual edits).
            if (gameData && typeof gameData === 'object') {
                delete gameData.isSupporter;
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
            
            // Stripping isSupporter from the cloud-specific payload to prevent client-side clobbering 
            // of the root-level Source of Truth (which is managed by Ko-Fi/Manual edits).
            if (gameData && typeof gameData === 'object') {
                delete gameData.isSupporter;
            }

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
            // Only clear gameData, PRESERVE supporter fields (isSupporter, totalTipAmount, eligibleForGameKey)
            // These are set by the Ko-Fi webhook and represent real-money purchases that must never be wiped.
            const userDocRef = window.firebase.doc(window.firebase.db, 'users', this.currentUser.uid);
            await window.firebase.setDoc(userDocRef, {
                gameData: null,
                lastSaved: null,
                version: null
            }, { merge: true });
            console.log('Cloud save data cleared (supporter status preserved)');

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
                
                // Ko-Fi Supporter Sync
                if (data.isSupporter && window.game) {
                    window.game.setSupporterStatus(true);
                }

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
                
                // Ko-Fi Supporter Sync
                if (data.isSupporter && window.game) {
                    window.game.setSupporterStatus(true);
                }

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
        if (typeof window.game !== 'undefined' && window.game && window.saveManager) {
            return window.saveManager.createSaveData();
        }
        console.error('saveManager is not available to create game state');
        return null;
    }

    loadGameState(gameData) {
        if (typeof window.game !== 'undefined' && window.game && window.saveManager && gameData) {
            window.saveManager.applySaveData(gameData);
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
const initCloudSave = () => {
    if (!cloudSaveManager) {
        cloudSaveManager = new CloudSaveManager();
        window.cloudSaveManager = cloudSaveManager;
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCloudSave);
} else {
    initCloudSave();
}

