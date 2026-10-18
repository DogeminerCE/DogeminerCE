// Welcome-back presentation is a receipt for an already committed credit.
// It never grants currency, including when reopened after a refresh.
(function () {
    'use strict';
    const proto = DogeMinerGame.prototype;

    proto.closeOfflineEarningsReport = function () {
        clearTimeout(this._offlineReportTimer);
        this._offlineReportTimer = null;
        window.WelcomeBackReport?.close();
        if (this.isOfflineReportOpen) this.isPlaying = this._offlineReportResumePlaying;
        this.isOfflineReportOpen = false;
        this._shownOfflineReport = null;
    };

    proto.scheduleOfflineEarningsReport = function (delay = 3000) {
        clearTimeout(this._offlineReportTimer);
        this._offlineReportTimer = null;
        const report = this.offlineEarningsReport;
        if (!this._bootComplete || !report || report.acknowledged || this.isOfflineReportOpen) return;
        this._offlineReportTimer = setTimeout(() => {
            this._offlineReportTimer = null;
            if (this.offlineEarningsReport !== report || report.acknowledged) return;
            if (!this.showPendingOfflineEarningsReport()) this.scheduleOfflineEarningsReport(500);
        }, delay);
    };

    proto.showPendingOfflineEarningsReport = function () {
        const report = this.offlineEarningsReport;
        if (!this._bootComplete || !report || report.acknowledged) return false;
        if (this.isOfflineReportOpen) return true;
        if (this.isBetaReportOpen || this.isStoryOpen || this.isIntroPlaying || this.isCutscenePlaying || this.isTransitioning
            || this._dogebagReveal || window.controllerManager?._dialogOpen || document.querySelector('.modal.active, .dialog-overlay.active, .dia-mission-modal.active, .dia-warning-modal.active, #controller-dialog.active')) return false;
        if (!window.WelcomeBackReport) throw new Error('The welcome-back report could not be loaded.');
        this._offlineReportResumePlaying = this.isPlaying;
        this._shownOfflineReport = report;
        this.isOfflineReportOpen = true;
        this.isPlaying = false;
        this.isMouseDown = false;
        this.isSpaceDown = false;
        this._helperRockElapsed = 0;
        try {
            window.WelcomeBackReport.show(report, {
                planet: this.currentLevel,
                onAcknowledge: () => {
                    if (this.offlineEarningsReport !== report) return false;
                    if (window.saveManager?.acknowledgeOfflineEarnings(report.id) !== true) return false;
                    this.isOfflineReportOpen = false;
                    this._shownOfflineReport = null;
                    this.isPlaying = this._offlineReportResumePlaying;
                    return true;
                },
                onAcknowledged: (_, origin) => {
                    if (this.offlineEarningsReport?.id !== report.id || !this.offlineEarningsReport.acknowledged) return;
                    // The wallet was committed at load. Reuse the normal coin
                    // flight solely to release its withheld HUD amount on arrival.
                    this.createFloatingCoin(report.amount, origin);
                    this.updateDogecoinCounter();
                }
            });
        } catch (error) {
            this.isOfflineReportOpen = false;
            this.isPlaying = this._offlineReportResumePlaying;
            throw error;
        }
        return true;
    };
})();
