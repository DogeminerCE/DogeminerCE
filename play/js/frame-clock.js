// DM2 tU: optional48fps world ticker, with real elapsed time and uncapped input.
(function () {
    'use strict';
    const callbacks=new Map(),animations=new Map();
    let nextId=0,frame=null,limited=false,last=null,observer=null,scanNeeded=false,frames=0;
    const period=1000/48;
    const root=()=>document.getElementById('game-container');
    function ensure(){if(frame===null&&(callbacks.size||animations.size||scanNeeded))frame=requestAnimationFrame(tick);}
    function scan(now){
        scanNeeded=false;
        for(const animation of root()?.getAnimations?.({subtree:true})||[]){
            if(animations.has(animation)||animation.playState!=='running'||animation.playbackRate<=0)continue;
            const time=Number(animation.currentTime)||0;
            animations.set(animation,{time,at:now,rate:animation.playbackRate});animation.pause();
        }
    }
    function tick(now){
        frame=null;
        if(limited&&scanNeeded)scan(now);
        if(limited&&last!==null&&now-last+1e-6<period){ensure();return;}
        last=limited&&last!==null?last+Math.floor((now-last+1e-6)/period)*period:now;frames++;
        if(limited)for(const [animation,state] of animations){
            if(animation.playState==='idle'||animation.playState==='finished'){animations.delete(animation);continue;}
            const time=state.time+Math.max(0,now-state.at)*state.rate;
            const end=animation.effect?.getComputedTiming?.().endTime;
            if(Number.isFinite(end)&&time>=end){animations.delete(animation);try{animation.finish();}catch(_){animation.currentTime=end;animation.play();}}
            else animation.currentTime=time;
        }
        const ready=[...callbacks];
        for(const [id,callback] of ready){if(!callbacks.has(id))continue;callbacks.delete(id);try{callback(now);}catch(error){setTimeout(()=>{throw error;},0);}}
        ensure();
    }
    function request(callback){const id=++nextId;callbacks.set(id,callback);ensure();return id;}
    function cancel(id){callbacks.delete(id);if(!callbacks.size&&!animations.size&&!scanNeeded&&frame!==null){cancelAnimationFrame(frame);frame=null;}}
    function configure(enabled){
        enabled=!!enabled;if(enabled===limited)return;
        limited=enabled;last=null;
        if(limited){
            scanNeeded=true;
            if(typeof MutationObserver!=='undefined'&&root()){
                observer=new MutationObserver(()=>{scanNeeded=true;ensure();});
                observer.observe(root(),{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
            }
        }else{
            observer?.disconnect();observer=null;scanNeeded=false;
            for(const animation of animations.keys())if(animation.playState==='paused')animation.play();
            animations.clear();
        }
        ensure();
    }
    window.DogeMinerFrameClock=Object.freeze({request,cancel,configure,
        inspect:()=>({limited,frames,queued:callbacks.size,animations:animations.size})});
})();
