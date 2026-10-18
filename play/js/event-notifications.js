// Source notification actions navigate only; discovery/rewards stay with saves.
(function(){
    'use strict';
    const proto=DogeMinerGame.prototype;
    proto.showFoundUpgradeNotification=function(helperType){
        const manager=window.notificationManager,next=window.shopManager?.getNextHelperUpgrade(helperType);
        if(!manager||!next)return null;
        const planet=this.currentLevel,level=next.level,epoch=this._currencyFlightEpoch||0;
        return manager.showEvent({id:'upgnotif',title:'UPGRADE',info:'Found New Upgrade',
            icon:next.upgradeIcon||this.getHelperSpritePaths(helperType,level).idle,
            actionLabel:'View found upgrade',onClick:()=>{
                if(this.currentLevel!==planet||(this._currencyFlightEpoch||0)!==epoch
                    ||window.shopManager.getNextHelperUpgrade(helperType)?.level!==level
                    ||this.isStoryOpen||this.isBetaReportOpen||this.isOfflineReportOpen||this.isCutscenePlaying||this.isTransitioning)return;
                const slot=(this.helperUpgradeOffers?.[planet]||[]).indexOf(helperType);if(slot<0)return;
                const ui=window.uiManager,mobile=this.isMobileDevice();
                if(mobile){ui.switchMobileTab('upgrades');if(!ui.mobileMenuOpen)ui.toggleMobileMenu();ui.updateMobileUpgradesContent();}
                else{window.switchMainTab('upgrades');ui.updateUpgradeContent();}
                // CE switches its desktop tab after a 50ms exit. Focus only
                // once the destination is visible, and recheck saved context.
                setTimeout(()=>{
                    if(this.currentLevel!==planet||(this._currencyFlightEpoch||0)!==epoch
                        ||this.helperUpgradeOffers?.[planet]?.[slot]!==helperType)return;
                    const node=document.querySelectorAll(mobile?'.mobile-upgrade-section':'.upgrade-section')[slot];
                    if(node?.isConnected&&node.getClientRects().length){node.tabIndex=-1;node.dataset.notificationTargetHelper=helperType;node.focus({preventScroll:true});node.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});}
                },80);
            }});
    };
    window.DogeMinerEventNotifications=Object.freeze({sourceDefaultDuration:6000});
})();
