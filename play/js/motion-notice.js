// Explain the detected accessibility preference; never override it.
(function(){
    'use strict';
    let running=null;
    const key=()=>window.CEParityTesting?.active?'ce-parity-motion-notice-dismissed':'dogeminer-ce-motion-notice-dismissed';
    function show(manager,onDismiss){
        return manager.showEvent({id:'reduced-motion',type:'info',title:'REDUCED MOTION',
            info:'Some game animations are reduced.',
            details:'Turn off Reduce Motion in your device’s accessibility settings for the full animation experience.',
            stay:true,system:true,silent:true,onEnd:reason=>{if(['activate','close'].includes(reason))onDismiss?.();}});
    }
    function start(game,manager){
        running?.stop();
        const media=window.matchMedia('(prefers-reduced-motion: reduce)');let node=null,dismissed=false;
        try{dismissed=sessionStorage.getItem(key())==='1';}catch{}
        const acknowledge=()=>{dismissed=true;try{sessionStorage.setItem(key(),'1');}catch{}};
        const update=()=>{
            if(!media.matches){if(node)manager.removeNotification(node,'preference');node=null;dismissed=false;try{sessionStorage.removeItem(key());}catch{}return;}
            if(!dismissed)node=show(manager,acknowledge);
        };
        media.addEventListener('change',update);update();
        running={stop(){media.removeEventListener('change',update);if(node)manager.removeNotification(node,'clear');}};
        return running;
    }
    window.DogeMinerMotionNotice=Object.freeze({start,preview:manager=>show(manager)});
})();
