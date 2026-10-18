// Saved performance choices, independent of the OS reduced-motion preference.
(function () {
    'use strict';
    const preferences = [['less-effects', 'lessEffects'], ['limit-fps', 'limitFps']];
    const appliedCaps=new WeakMap();
    function sync(game) {
        for (const [id,key] of preferences) for (const prefix of ['', 'mobile-']) {
            const input=document.getElementById(prefix+id); if(input)input.checked=game[key]===true;
        }
    }
    function apply(game) {
        document.body.classList.toggle('less-effects',game.lessEffects===true);
        const limited=game.limitFps===true;
        window.DogeMinerFrameClock?.configure(limited);
        if(appliedCaps.get(game)!==limited&&game.dpsUpdateRate!==undefined)game.setupDpsInterval?.();
        appliedCaps.set(game,limited);
        sync(game);
    }
    function set(game,key,value) {
        if(!preferences.some(([,name])=>name===key))return false;
        const previous=game[key];game[key]=!!value;
        let saved=true;
        try { if(window.saveManager)saved=window.saveManager.saveGame(false)!==false; }
        catch(_){saved=false;}
        if(!saved)game[key]=previous;
        apply(game);
        return saved;
    }
    function bind(game,prefix='') {
        for(const [id,key] of preferences){
            const input=document.getElementById(prefix+id);
            if(!input||input.dataset.performanceBound)continue;
            input.dataset.performanceBound='true';
            input.addEventListener('change',()=>set(game,key,input.checked));
        }
        sync(game);
    }
    window.DogeMinerPerformance=Object.freeze({apply,set,bind,sync});
})();
