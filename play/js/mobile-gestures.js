// Source Sc/OL/RH: fast horizontal inventory browsing and downward panel close.
(function () {
    'use strict';
    const installed=new WeakMap();
    function classify(dx,dy,ms){
        return {horizontal:ms<300?(dx < -100?'left':dx > 100?'right':null):null,
            closePanel:ms>100&&ms<400&&dy>100};
    }
    function navigate(game,modal,direction,current){
        const tiles=[...modal.querySelectorAll('.inventory-item-tile')];if(!tiles.length)return false;
        const focused=current||game._inventoryTooltipCard||document.activeElement;
        let index=tiles.indexOf(focused);if(index<0)index=Math.max(0,tiles.findIndex(tile=>tile.classList.contains('equipped')));
        const tile=tiles[Math.max(0,Math.min(tiles.length-1,index+(direction==='left'?1:-1)))];
        tile.focus({preventScroll:true});tile.scrollIntoView({block:'nearest',behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
        if(tile!==focused)game.playSound?.('swipe',{volume:.2});
        game._showInventoryTooltip(tile);return true;
    }
    function install(game,ui){
        if(installed.has(game))return installed.get(game);
        const pointers=new Set();let gesture=null,multi=false,suppress=null;
        const blocked=()=>!game.isMobileDevice()||game.isStoryOpen||game.isBetaReportOpen||game.isOfflineReportOpen||game.isUpdateNotesOpen||game.isMysteryBoxOpen||game._sunDogeFusion||game.isIntroPlaying||game.isCutscenePlaying||game.isTransitioning||game._dogebagReveal||game.isPlacingHelpers||game._helperDrag;
        const reset=()=>{pointers.clear();gesture=null;multi=false;suppress=null;};
        const down=event=>{
            suppress=null;pointers.add(event.pointerId);
            if(pointers.size>1){multi=true;gesture=null;return;}
            if(multi||blocked()||event.button>0)return;
            const target=event.target;if(!target?.closest)return;
            // Mining-origin gestures and direct controls never become navigation.
            if(target.closest('#click-overlay,#rock-container,#character-container,.helper-sprite,input,select,textarea,[contenteditable="true"]'))return;
            const modal=document.querySelector('#pickaxe-modal.active,#fortune-modal.active');
            if(modal?.classList.contains('popup-exiting'))return;
            if(modal){
                if(!modal.contains(target)&&!target.closest('#inventory-item-tooltip'))return;
                if(target.closest('button:not(.inventory-item-tile),a'))return;
                gesture={x:event.clientX,y:event.clientY,at:performance.now(),modal,current:game._inventoryTooltipCard,id:event.pointerId,target};
            }else if(ui.mobileMenuOpen&&target.closest('#mobile-panel-tabs,#mobile-menu-toggle')){
                gesture={x:event.clientX,y:event.clientY,at:performance.now(),id:event.pointerId,target};
            }
        };
        const end=event=>{
            const start=gesture;pointers.delete(event.pointerId);if(!pointers.size)multi=false;
            if(!start||start.id!==event.pointerId)return;gesture=null;
            if(blocked())return;
            const action=classify(event.clientX-start.x,event.clientY-start.y,performance.now()-start.at);
            let handled=false;
            if(start.modal?.classList.contains('active')&&action.horizontal)handled=navigate(game,start.modal,action.horizontal,start.current);
            else if(!start.modal&&action.closePanel&&ui.mobileMenuOpen){ui.closeMobileMenu();handled=true;}
            if(handled){event.preventDefault();suppress={at:performance.now(),target:start.target};}
        };
        const cancel=event=>{pointers.delete(event.pointerId);gesture=null;if(!pointers.size)multi=false;};
        const click=event=>{
            if(!suppress||performance.now()-suppress.at>=500||event.detail===0)return;
            const from=suppress.target,to=event.target;
            if(to!==from&&!from.contains?.(to)&&!to?.contains?.(from))return;
            suppress=null;event.preventDefault();event.stopImmediatePropagation();
        };
        const drag=event=>{if(gesture?.modal)event.preventDefault();};
        const handlers=[['pointerdown',down],['pointerup',end],['pointercancel',cancel],['lostpointercapture',cancel],['click',click],['dragstart',drag]];
        for(const [type,fn]of handlers)document.addEventListener(type,fn,true);
        window.addEventListener('blur',reset);window.addEventListener('resize',reset);
        const detach=()=>{for(const [type,fn]of handlers)document.removeEventListener(type,fn,true);window.removeEventListener('blur',reset);window.removeEventListener('resize',reset);installed.delete(game);reset();};
        installed.set(game,detach);return detach;
    }
    window.DogeMinerMobileGestures=Object.freeze({classify,navigate,install});
})();
