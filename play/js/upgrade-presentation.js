// DM2 WR/Ao: staggered texture fade/tada, APPLYING... then DONE. Receipt state
// is already durable before this module starts. It never awards or spends.
(function(){
    'use strict';
    const config=Object.freeze({stagger:100,staggerSpan:1200,swap:100,done:500,settle:1200,doneFade:1000,mobileDelay:500});
    const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
    let serial=0;
    const jobs=g=>g._helperUpgradePresentations ||= new Map();
    const valid=(g,job)=>jobs(g).get(job.id)===job&&job.epoch===(g._helperUpgradePresentationEpoch||0)&&job.planet===g.currentLevel;
    const later=(g,job,ms,fn)=>job.timers.push(setTimeout(()=>{if(valid(g,job))fn();},ms));
    const quad=t=>1-(1-t)*(1-t);
    const mix=(a,b,t)=>a+(b-a)*quad(Math.max(0,Math.min(1,t)));
    function profileAt(ms){
        const scale=ms<=300?mix(1,.6,ms/300):ms<=500?mix(.6,1.2,(ms-300)/200):ms<=1000?1.2:mix(1.2,1,(ms-1000)/200);
        let rotate;
        if(ms<=200)rotate=mix(0,-9,ms/200);
        else if(ms<900){const segment=Math.min(5,Math.floor((ms-200)/(700/6))),from=segment===0?-9:segment%2===0?-10:10,to=segment%2===0?10:-10;rotate=mix(from,to,(ms-200-segment*700/6)/(700/6));}
        else rotate=mix(-10,0,(ms-900)/100);
        const opacity=ms<=100?mix(1,0,ms/100):mix(0,1,(ms-100)/100);
        return {scale,rotate:rotate+'deg',opacity};
    }
    const keyframes=Array.from({length:121},(_,i)=>({...profileAt(i*10),offset:i/120}));
    function refresh(g){window.uiManager?.updateUpgradeContent?.();if(g.isMobileDevice?.())window.uiManager?.updateMobileUpgradesContent?.();}
    function capture(g,type,next){
        const slot=g.helperUpgradeOffers?.[g.currentLevel]?.indexOf(type)??-1;
        const ui=window.uiManager,offer=ui?.getAvailableHelperUpgrades?.().find(row=>row.helperType===type);
        return {slot,offer,cards:offer?{desktop:ui.renderHelperUpgradeCard(offer,false,slot),mobile:ui.renderHelperUpgradeCard(offer,true,slot)}:{}};
    }
    function getSlot(g,index){return [...jobs(g).values()].find(j=>j.planet===g.currentLevel&&j.slot===index);}
    function renderSlot(ui,section,index,mobile=false){
        const job=getSlot(ui.game,index);
        if(!job){section.classList.remove('helper-upgrade-applying','helper-upgrade-done');delete section.dataset.upgradePresentation;section.removeAttribute('aria-busy');return false;}
        const marker=job.id+':'+job.phase;
        if(section.dataset.upgradePresentation!==marker){
            section.innerHTML=(job.cards[mobile?'mobile':'desktop']||'')+'<div class="helper-upgrade-progress" role="status">'+(job.phase==='done'?'DONE.':'APPLYING...')+'</div>';
            section.dataset.upgradePresentation=marker;
            if(mobile&&job.phase==='applying'){
                const preview=section.querySelector?.('.mobile-upgrade-helper-sprite img');
                if(preview){
                    preview.src=ui.game.getHelperSpritePaths(job.type,Math.max(0,job.level-1)).idle;
                    const entry={node:preview,type:job.type,mobile:true,preview:true};job.entries.push(entry);
                    const elapsed=Math.max(0,(window.performance?.now?.()||0)-job.startedAt);
                    transform(ui.game,job,entry,Math.max(0,config.mobileDelay-elapsed));
                }
            }
            for(const button of section.querySelectorAll('button'))button.disabled=true;
        }
        section.classList.add('has-upgrade','helper-upgrade-applying');section.classList.toggle('helper-upgrade-done',job.phase==='done');
        section.setAttribute('aria-busy',String(job.phase==='applying'));return true;
    }
    function finishNode(g,entry){
        if(entry.finished)return;entry.finished=true;entry.animation?.cancel();
        const node=entry.node;node.classList.remove('helper-upgrade-transforming');
        if(!node.isConnected)return;
        const paths=g.getHelperSpritePaths(entry.type,g.helperUpgradeLevels?.[entry.type]||0);
        node.src=paths.idle;
        if(entry.preview)return;
        if(entry.mobile){node.dataset.idleSrc=paths.idle;node.dataset.miningSrc=paths.mining;window.DogeMinerFieldPersonality?.animate(g,{type:entry.type},node,true);}
        else g.startHelperAnimation?.(entry.record,node);
    }
    function transform(g,job,entry,delay){
        const node=entry.node;node.classList.add('helper-upgrade-transforming');g.stopHelperAnimation?.(node);
        if(!reduced()&&node.animate)entry.animation=node.animate(keyframes,{duration:config.settle,delay,easing:'linear',fill:'both'});
        later(g,job,reduced()?0:delay+config.swap,()=>{
            if(!node.isConnected)return;const paths=g.getHelperSpritePaths(entry.type,job.level);node.src=paths.idle;
            if(entry.preview)return;
            if(entry.mobile){node.dataset.idleSrc=paths.idle;node.dataset.miningSrc=paths.mining;window.DogeMinerFieldPersonality?.animate(g,{type:entry.type},node,true);}
            else g.startHelperAnimation?.(entry.record,node);
        });
        later(g,job,reduced()?0:delay+config.settle,()=>finishNode(g,entry));
    }
    function begin(g,type,next,receipt={}){
        g.releaseHeldHelpers?.(true);g.hideHelperGroupAction?.();
        const job={id:String(++serial),type,level:next.level,planet:g.currentLevel,epoch:g._helperUpgradePresentationEpoch||0,
            startedAt:window.performance?.now?.()||0,slot:receipt.slot??-1,cards:receipt.cards||{},phase:'applying',timers:[],entries:[]};jobs(g).set(job.id,job);
        for(const record of g.placedHelpers||[]){
            if(record.type!==type)continue;
            const node=document.querySelector(`.helper-sprite[data-helper-id="${record.id}"]`);
            if(node&&!job.entries.some(e=>e.node===node))job.entries.push({node,record,type,mobile:false});
        }
        const desktop=job.entries.length,step=desktop>1?Math.min(config.stagger,config.staggerSpan/(desktop-1)):0;
        const icon=document.querySelector(`#mobile-helper-bar [data-helper-type="${type}"] .mobile-helper-icon`);
        if(icon&&g.isMobileDevice?.())job.entries.push({node:icon,type,mobile:true});
        job.entries.forEach((entry,i)=>transform(g,job,entry,entry.mobile?config.mobileDelay:i*step));
        const doneAt=Math.max(config.done+(desktop?step*(desktop-1):0),g.isMobileDevice?.()?config.mobileDelay+config.done:0);
        later(g,job,doneAt,()=>{job.phase='done';refresh(g);});
        later(g,job,doneAt+config.doneFade,()=>{for(const entry of job.entries)finishNode(g,entry);jobs(g).delete(job.id);refresh(g);});
        refresh(g);return job;
    }
    function reset(g){
        g._helperUpgradePresentationEpoch=(g._helperUpgradePresentationEpoch||0)+1;
        for(const job of jobs(g).values()){for(const timer of job.timers)clearTimeout(timer);for(const entry of job.entries)finishNode(g,entry);}jobs(g).clear();
    }
    const proto=DogeMinerGame.prototype;
    proto.resetUpgradePresentation=function(){reset(this);};
    proto.hasApplyingHelperUpgrade=function(){return [...jobs(this).values()].some(j=>j.planet===this.currentLevel&&j.phase==='applying');};
    window.DogeMinerUpgradePresentation=Object.freeze({config,profileAt,capture,begin,getSlot,renderSlot,reset,
        isTypeBusy:(g,type)=>[...jobs(g).values()].some(j=>j.planet===g.currentLevel&&j.type===type)});
})();
