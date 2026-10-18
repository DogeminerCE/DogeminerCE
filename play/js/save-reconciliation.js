// Compare earned progress, never spendable wallet balances or account perks.
(function () {
    'use strict';
    function valid(save, manager) {
        try {
            if (!save || typeof save !== 'object' || Array.isArray(save)) return false;
            if (!manager.validateSaveData(save)) return false;
            window.BetaSaveMigration?.validate(save);
            if (!Number.isFinite(save.timestamp) || save.timestamp < 0) return false;
            if (save.timelineNumber !== undefined && (!Number.isSafeInteger(save.timelineNumber) || save.timelineNumber < 1)) return false;
            if (save.balanceVersion && save.balanceVersion !== window.DogeMinerBalance?.VERSION) return false;
            window.DogeMinerTools?.discoveryState(save);
            window.DogeMinerEncounters?.normalize(save.encounters, save);
            window.DogeMinerLootAutomation?.normalize(save.lootAutomation, save.timelineNumber);
            window.DogeMinerLateProgression?.normalize(save.lateProgression, save);
            window.DogeMinerLayout?.normalize(save.layout,save.dm2Import);
            window.DogeMinerSeasonal?.normalize(save.seasonal,save.dm2Import);
            window.DogeMinerDM2Import?.receipt(save.dm2Import);
            window.DogeMinerDM2Import?.requestReceipt(save.importReceipt);
            return true;
        } catch (_) { return false; }
    }
    function compare(a, b) {
        if (!a) return b ? -1 : 0;
        if (!b) return 1;
        for (const [x,y] of [[a.timelineNumber || 1,b.timelineNumber || 1], [a.totalMined,b.totalMined], [a.timestamp,b.timestamp]]) {
            if (x !== y) return x > y ? 1 : -1;
        }
        return 0;
    }
    function busy(game) {
        return !game || game.isTransitioning || game.isCutscenePlaying || game.isIntroPlaying || game.isStoryOpen ||
            game.isBetaReportOpen || game.isOfflineReportOpen || game.isBetaMigrationReportOpen || game.isUpdateNotesOpen ||
            window.controllerManager?._dialogOpen ||
            game._dogebagReveal || game._sunDogeFusion || game.isDraggingRick || game.isPlacingHelpers || game._helperDrag;
    }
    window.DogeMinerSaveReconciliation = Object.freeze({valid, compare, busy});
})();
