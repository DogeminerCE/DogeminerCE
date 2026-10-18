// DM2 iM/We/JT: interactive loot hover and sampled source easing, without glows.
(function () {
    'use strict';
    const requestWorldFrame=callback=>window.DogeMinerFrameClock?window.DogeMinerFrameClock.request(callback):requestAnimationFrame(callback);
    const cancelWorldFrame=id=>window.DogeMinerFrameClock?window.DogeMinerFrameClock.cancel(id):cancelAnimationFrame(id);
    const back = (t,s=3) => 1+(t-1)*(t-1)*((s+1)*(t-1)+s);
    const elastic = (t,a=1,p=.5) => {
        if(t===0||t===1)return t;
        const shift=p/(2*Math.PI)*Math.asin(1/a);
        return a*Math.pow(2,-10*t)*Math.sin((t-shift)*2*Math.PI/p)+1;
    };
    function sample(node,duration,value,done) {
        const frames=Array.from({length:61},(_,i)=>value(i/60));
        const animation=node.animate?.(frames,{duration,easing:'linear',fill:'forwards'});
        if(animation){animation.onfinish=()=>{if(node.isConnected!==false)Object.assign(node.style,frames.at(-1));animation.cancel?.();done?.();};return animation;}
        Object.assign(node.style,frames.at(-1));done?.();return null;
    }
    function hover(root,target) {
        const state={up:0,lean:0,wob:0},jobs=new Map();let frame=null,over=false,dead=false;
        const paint=()=>{target.style.transform='translateY('+(-7*state.up)+'px) rotate('+(state.lean+state.wob)+'rad) scale('+(1+.08*state.up)+')';};
        const tween=(key,to,ms,ease)=>{jobs.set(key,{from:state[key],to,start:performance.now(),ms,ease});if(!frame)frame=requestWorldFrame(tick);};
        let wobbleAt=0;
        const tick=()=>{
            frame=null;if(dead||!root.isConnected)return;
            const now=performance.now();
            for(const [key,job] of jobs){const t=Math.min(1,(now-job.start)/job.ms);state[key]=job.from+(job.to-job.from)*job.ease(t);if(t===1)jobs.delete(key);}
            if(over&&wobbleAt){
                const elapsed=now-wobbleAt,phases=[[70,0,.1],[110,.1,-.07],[110,-.07,.035],[140,.035,0]];let span=0;
                state.wob=0;
                for(const [ms,from,to] of phases){if(elapsed<span+ms){const t=Math.max(0,(elapsed-span)/ms),e=span===0?Math.sin(t*Math.PI/2):(1-Math.cos(t*Math.PI))/2;state.wob=from+(to-from)*e;break;}span+=ms;}
                if(elapsed>=430)wobbleAt=0;
            }
            paint();if(jobs.size||wobbleAt)frame=requestWorldFrame(tick);
        };
        const enter=event=>{if(dead||over||event.pointerType&&event.pointerType!=='mouse')return;over=true;wobbleAt=performance.now()||.001;tween('up',1,170,t=>back(t,3));};
        const move=event=>{if(!over||dead)return;const rect=root.getBoundingClientRect(),ratio=rect.width/(root.offsetWidth||rect.width)||1;tween('lean',Math.max(-1,Math.min(1,(event.clientX-rect.left-rect.width/2)/ratio/55))*.11,260,t=>1-(1-t)*(1-t));};
        const leave=()=>{over=false;wobbleAt=0;for(const key of ['up','lean','wob'])tween(key,0,420,t=>elastic(t,1,.5));};
        root.addEventListener('mouseenter',enter);root.addEventListener('mousemove',move);root.addEventListener('mouseleave',leave);
        root.addEventListener('focus',enter);root.addEventListener('blur',leave);
        return {state,reset(){cancelWorldFrame(frame);frame=null;jobs.clear();over=false;wobbleAt=0;state.up=state.lean=state.wob=0;paint();},
            detach(){this.reset();dead=true;for(const [type,fn] of [['mouseenter',enter],['mousemove',move],['mouseleave',leave],['focus',enter],['blur',leave]])root.removeEventListener?.(type,fn);}};
    }
    const quadInOut=t=>t<.5?2*t*t:1-2*(1-t)*(1-t);
    function shake(t,amplitude=15){
        const x=[0,amplitude,-amplitude,amplitude,-amplitude,amplitude,-amplitude,0],u=quadInOut(t)*7,index=Math.min(6,Math.floor(u)),v=Math.min(1,u-index),ease=1-(1-v)*(1-v);
        return x[index]+(x[index+1]-x[index])*ease;
    }
    window.LootMotion={back,elastic,sample,hover,shake,quadInOut};
})();
