// Cloud Save Manager for DogeMiner CE
class CloudSaveManager {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this._accountEpoch = 0;
        this._pendingCloud = null;
        this.init();
    }

    waitForGameReady(callback, attempts = 0) {
        const isGameReady = window.game?._bootComplete && window.saveManager && !window.saveManager._loadInProgress;

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
            this._accountEpoch++;
            this._pendingCloud = null;
            clearTimeout(this._cloudRetry);
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
            userName.textContent = `Signed in as: ${this.currentUser.displayName || this.currentUser.email || 'Player'}`;

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
        // Auth can change while Phone settings stay open; update the existing
        // controls without rebuilding the form or losing its scroll/focus.
        const mobileUserInfo = document.getElementById('mobile-user-info');
        const mobileSignIn = document.getElementById('mobile-sign-in-section');
        const mobileUserName = document.getElementById('mobile-user-name');
        if (mobileUserInfo) mobileUserInfo.style.display = this.currentUser ? 'block' : 'none';
        if (mobileSignIn) mobileSignIn.style.display = this.currentUser ? 'none' : 'block';
        if (mobileUserName) mobileUserName.textContent = this.currentUser ? `Signed in as: ${this.currentUser.displayName || this.currentUser.email || 'Player'}` : '';
        if (typeof isXboxBrowser === 'function' && isXboxBrowser()) window.controllerManager?._hideXboxOnlyElements();
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

    async saveToCloud() { return this._saveCloud(false); }
    async saveToCloudSilent() { return this._saveCloud(true); }

    _ticket() {
        return { uid:this.currentUser?.uid, epoch:this._accountEpoch, game:window.game,
            field:window.game?._currencyFlightEpoch || 0 };
    }
    _current(ticket) {
        return !!ticket.uid && ticket.uid === this.currentUser?.uid && ticket.epoch === this._accountEpoch &&
            ticket.game === window.game && ticket.field === (window.game?._currencyFlightEpoch || 0);
    }
    _notify(silent, kind, message) { if (!silent) window.notificationManager?.[kind]?.(message); }
    _localCandidate() {
        if (window.saveManager?._saveBlocked) return null;
        const raw = this.getGameState();
        const save = raw && JSON.parse(JSON.stringify(raw));
        // createSaveData stamps the act of serializing; compare the last durable
        // save time instead, so merely checking cannot win a timestamp tie.
        if (save) save.timestamp = window.saveManager.lastSave;
        return save;
    }
    async _saveCloud(silent) {
        const ticket = this._ticket(), policy = window.DogeMinerSaveReconciliation;
        if (!ticket.uid) { this._notify(silent,'showWarning','Please sign in first'); return 'signed-out'; }
        if (this._cloudWrite || this._cloudRead || this._pendingCloud || window.saveManager?._loadInProgress) return 'busy';
        const candidate = this._localCandidate();
        if (!policy?.valid(candidate, window.saveManager)) return 'invalid-local';
        this._cloudWrite = true;
        try {
            const ref = window.firebase.doc(window.firebase.db,'users',ticket.uid);
            const result = await window.firebase.runTransaction(window.firebase.db, async transaction => {
                const snapshot = await transaction.get(ref);
                if (!this._current(ticket) || window.saveManager._saveBlocked) return {status:'stale'};
                const data = snapshot.exists() ? snapshot.data() : {};
                const remote = data.gameData;
                // A malformed remote payload is kept for recovery, not silently
                // replaced by a fresh local game during startup.
                if (remote && !policy.valid(remote, window.saveManager)) return {status:'invalid-cloud'};
                if (policy.compare(remote, candidate) > 0) return {status:'cloud-newer', data};
                const payload = JSON.parse(JSON.stringify(candidate));
                delete payload.isSupporter;
                transaction.set(ref,{gameData:payload,lastSaved:new Date().toISOString(),version:'1.0.0'},{merge:true});
                return {status:'saved'};
            });
            if (!this._current(ticket)) return 'stale';
            if (result.status === 'cloud-newer') this._receiveCloud(result.data,ticket,silent);
            else if (result.status === 'saved') this._notify(silent,'showSuccess','Game saved to cloud successfully!');
            else if (result.status === 'invalid-cloud') this._notify(silent,'showError','Cloud save could not be validated. Both saves were kept.');
            return result.status;
        } catch (error) {
            console.error('Cloud save error:',error);
            if (this._current(ticket)) this._notify(silent,'showError','Failed to save to cloud. Your local progress was kept.');
            return 'error';
        } finally { this._cloudWrite = false; }
    }

    async deleteCloudSave() {
        if (!this.currentUser) {
            console.log('No user signed in, skipping cloud save deletion');
            return;
        }

        this._accountEpoch++; this._pendingCloud = null; clearTimeout(this._cloudRetry);
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

    async loadFromCloud() { return this._loadCloud(false); }
    async loadFromCloudSilent() { return this._loadCloud(true); }

    async _loadCloud(silent) {
        const ticket = this._ticket();
        if (!ticket.uid) { this._notify(silent,'showWarning','Please sign in first'); return 'signed-out'; }
        if (this._cloudRead || this._cloudWrite) return 'busy';
        this._cloudRead = true;
        try {
            const ref = window.firebase.doc(window.firebase.db,'users',ticket.uid);
            const snapshot = await window.firebase.getDoc(ref);
            if (!this._current(ticket)) return 'stale';
            if (!snapshot.exists()) { this._notify(silent,'showInfo','No save data found in cloud'); return 'empty'; }
            return this._receiveCloud(snapshot.data(),ticket,silent);
        } catch (error) {
            console.error('Cloud load error:',error);
            if (this._current(ticket)) this._notify(silent,'showError','Failed to load from cloud. Your local progress was kept.');
            return 'error';
        } finally { this._cloudRead = false; }
    }
    _receiveCloud(data,ticket,silent) {
        if (!this._current(ticket)) return 'stale';
        // Account-owned perks are separate from progress selection and payloads.
        if (data.isSupporter === true) window.game.setSupporterStatus(true);
        if (!data.gameData) { this._notify(silent,'showInfo','No save data found in cloud'); return 'empty'; }
        const policy = window.DogeMinerSaveReconciliation, manager = window.saveManager;
        if (!policy?.valid(data.gameData,manager)) {
            this._notify(silent,'showError','Cloud save could not be validated. Your local progress was kept.'); return 'invalid-cloud';
        }
        if (policy.busy(window.game) || manager._loadInProgress) {
            this._pendingCloud = {data,ticket,silent};
            clearTimeout(this._cloudRetry);
            this._cloudRetry = setTimeout(() => {
                const pending = this._pendingCloud; this._pendingCloud = null;
                if (pending) this._receiveCloud(pending.data,pending.ticket,pending.silent);
            },500);
            this._notify(silent,'showInfo','Cloud save checked. It will be compared after the current reward or event closes.');
            return 'deferred';
        }
        const local = this._localCandidate(), localValid = policy.valid(local,manager);
        if (localValid && policy.compare(data.gameData,local) <= 0) {
            this._notify(silent,'showInfo','This device already has the latest progress.'); return 'local';
        }
        const flags = {blocked:manager._saveBlocked,error:manager.loadError};
        try {
            manager.applySaveData(data.gameData,{persist:true,recovery:{key:'dogeminer_ce_before_cloud_v1',value:local ? JSON.stringify(local) : localStorage.getItem(manager.saveKey) || 'null'}});
            if (data.isSupporter === true) window.game.setSupporterStatus(true);
            this._notify(silent,'showSuccess','Newer cloud progress loaded and saved on this device.');
            return 'cloud';
        } catch (error) {
            // applySaveData rolls back the live object and the atomic storage
            // write. Restore its field presentation and prior autosave status.
            if (localValid) {
                try { manager._applySaveData(local); } catch (_) { /* Keep the existing recovery snapshot. */ }
            }
            manager._saveBlocked = flags.blocked; manager.loadError = flags.error;
            console.error('Cloud progress was not applied:',error);
            this._notify(silent,'showError','Cloud progress could not be saved. Your local progress was kept.');
            return 'error';
        }
    }
    getGameState() {
        return window.game && window.saveManager ? window.saveManager.createSaveData() : null;
    }
    loadGameState(gameData) {
        return this._receiveCloud({gameData},this._ticket(),false);
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

window.DogeMinerCloudSave = Object.freeze({Manager:CloudSaveManager});

// Initialize when DOM is loaded
const initCloudSave = () => {
    if (!cloudSaveManager) {
        cloudSaveManager = new CloudSaveManager();
        window.cloudSaveManager = cloudSaveManager;
    }
};

if (!window.CEParityTesting?.active) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initCloudSave);
    else initCloudSave();
}

