// Timed references, active-focus repeat clock and Rick's temporary field personality.
(function(){
    'use strict';
    const proto=DogeMinerGame.prototype,refs=[['rmref',900,3950],['rmref2',2125,6500],['rmref3',5150,2500]];
    const randomDelay=(random=Math.random)=>480000+420000*random();
    // DM2: 120×110 head at .55; tool scale=(110/150)×.78 inside that miner.
    const pickScale=110/150*.78*.55;
    function pose(rick,reduced=false){
        const rig=rick.rig||rick.sprite;
        rig.style.left=rick.x+'px';rig.style.top=rick.y+'px';rig.style.scale=rick.facing?'1 1':'-1 1';
        const cycle=rick.ageMs%390,angle=cycle<150?35-105*(cycle/150)**3:cycle<220?-70+105*(1-(1-(cycle-150)/70)**2):35;
        rick.pick.style.left=(30+10*pickScale)+'px';rick.pick.style.top=(30+65*pickScale)+'px';
        rick.pick.style.transform=`translate(-50%,-75%) rotate(${reduced?35:angle}deg)`;
    }
    const phrases=[...['such ','very ','wow ','many '].flatMap(prefix=>['shibe','mine','help','helper','strong','mining'].map(word=>prefix+word)), 'am helping','such helper','mine faster','together strong','i help','good mine','nice place','we mine','am helper lol','am helping','me shibe too','such mine','wow','nice','mhm mhm very good','good work','good mining'];
    function reference(seconds,maxlevel,seen){return refs.find(([id,at])=>!seen.includes(id)&&seconds>at&&(id!=='rmref'||maxlevel===1))||null;}
    function safe(game){return game.isPlaying&&!game.isIntroPlaying&&!game.isTransitioning&&!game.isCutscenePlaying&&!game.isStoryOpen&&!game.isBetaReportOpen&&!game.isOfflineReportOpen&&!document.hidden&&document.hasFocus?.()!==false;}
    function eligible(game){return safe(game)&&!game.rickVisible&&!game.placedRick&&!game.isDraggingRick&&!game._dogebagReveal&&!document.querySelector('.dogebag-field-flight,.dogebag-stack:not(.dogebag-settled)')&&!document.querySelector('.modal.active,.switcher-modal.active,.dialog-overlay.active');}
    proto.resetRickVisitor=function(){
        this._rickIncomeExpiry=null;
        this._rickPortalFlow=null;this._rickReference=null;this.despawnRick?.({animate:false});
        this._rickCursorCleanup?.();this.removeRickCursorSprite?.();this.isDraggingRick=false;this.rickVisible=false;
        for(const id of ['rick-portal','rick-doge','rick-cursor-zone','rick-cursor-sprite'])document.getElementById(id)?.remove();
        for(const portal of document.querySelectorAll?.('.rick-exit-portal')||[])portal.remove();
        for(const node of document.querySelectorAll?.('.rick-field-rig,.rick-helper,.rick-field-pickaxe,#placed-rick-timer,#placed-rick-tooltip,#placed-rick-zone')||[])node.remove();
        for(const key of ['rickStepTimeout','rickRetractTimeout','rickClickDropTimeout']){clearTimeout(this[key]);this[key]=null;}
    };
    proto.startRickSpawn=function(){clearTimeout(this.rickInterval);this.rickInterval=null;this._rickSchedule||={elapsed:0,target:randomDelay()};};
    proto.scheduleNextRick=function(){this._rickSchedule={elapsed:0,target:randomDelay()};};
    const spawn=proto.spawnRick;
    proto.spawnRick=function({autoJump=false}={}){
        if(!eligible(this))return false;
        this._rickAutoJump=autoJump;spawn.call(this);
        const portal=document.getElementById('rick-portal');
        if(portal){Object.assign(portal.style,{width:'52px',height:'154px',right:'30px',bottom:'130px'});}
        const head=document.getElementById('rick-doge');
        if(head)Object.assign(head.style,{width:'68px',height:'101px',right:'40px',bottom:'158.5px',opacity:'0',pointerEvents:'none'});
        this._rickPortalFlow={elapsed:0,planet:this.currentLevel,timeline:this.timelineNumber,autoJump};return true;
    };
    proto.animateRick=function(){};
    const hide=proto.hideRick;
    proto.hideRick=function(...args){this._rickPortalFlow=null;return hide.apply(this,args);};
    const drop=proto.dropRick;
    proto.dropRick=function(...args){
        if(this.placedRick)return false;
        this._rickPortalFlow=null;drop.apply(this,args);const rick=this.placedRick;if(!rick)return false;
        clearInterval(rick.miningInterval);clearInterval(rick.timerInterval);rick.miningInterval=null;rick.timerInterval=null;
        this._rickIncomeExpiry=null;
        rick.timeline=this.timelineNumber;rick.remainingMs=30000;rick.expiresAt=Date.now()+30000;rick.ageMs=0;rick.nextWander=1100+1500*Math.random();rick.nextPhrase=1500+2000*Math.random();rick.facing=true;
        const pick=document.createElement('img');pick.className='rick-field-pickaxe';pick.alt='';
        const pool=Object.values(this.pickaxeFactory?.templates||{}).filter(t=>!t.isPaw&&!t.name?.toLowerCase().includes('paw'));
        pick.src=pool.length?pool[Math.floor(Math.random()*pool.length)].idleSprite:this.getEquippedPickaxe().idleSprite;
        const size=()=>{pick.style.width=(pick.naturalWidth*pickScale)+'px';pick.style.height=(pick.naturalHeight*pickScale)+'px';};
        pick.addEventListener('load',size,{once:true});if(pick.complete)size();
        rick.sprite.parentElement.append(pick);rick.pick=pick;rick.sprite.src='assets/general/rm/rickdoge_smol.png';
        rick.sprite.classList.remove('place-bounce');pose(rick,window.DogeMinerTools.reduced());
        return true;
    };
    proto.isRickVisitExpired=function(rick=this.placedRick,now=Date.now()){
        return !!rick&&Number.isFinite(rick.expiresAt)&&now>=rick.expiresAt+(rick.held?10000:0);
    };
    proto.expireRickVisitor=function(now=Date.now()){
        const rick=this.placedRick;if(!this.isRickVisitExpired(rick,now))return false;
        const at=rick.expiresAt+(rick.held?10000:0),extraDps=Math.max(0,this.dps-this.calculateTotalDPS({includeRick:false}));
        this.despawnRick({animate:safe(this)});
        // The next income interval may straddle the deadline. Preserve only its
        // earned prefix, including after a suspended animation/background tab.
        this._rickIncomeExpiry={at,extraDps};return true;
    };
    proto.getRickPassiveIncome=function(elapsed){
        const now=Date.now();this.expireRickVisitor(now);
        const receipt=this._rickIncomeExpiry;this._rickIncomeExpiry=null;
        const beforeExpiry=receipt?Math.max(0,Math.min(elapsed,receipt.at-(now-elapsed))):0;
        return (this.dps*elapsed+(receipt?.extraDps||0)*beforeExpiry)/1000;
    };
    proto.advanceRickVisitor=function(elapsed){
        const dt=Math.max(0,Math.min(2000,elapsed));if(!this._rickSchedule)this.startRickSpawn();
        const visitor=this.placedRick;
        if(visitor){
            if(visitor.planet!==this.currentLevel||(visitor.timeline!==undefined&&visitor.timeline!==this.timelineNumber)){this.despawnRick({animate:false});return;}
            visitor.remainingMs=Number.isFinite(visitor.expiresAt)?visitor.expiresAt-Date.now():visitor.remainingMs-Math.max(0,elapsed);
            if(this.expireRickVisitor())return;
            if(!Number.isFinite(visitor.expiresAt)&&visitor.remainingMs<=0&&(!visitor.held||visitor.remainingMs<=-10000)){this.despawnRick({animate:safe(this)});return;}
            const seconds=Math.max(0,Math.ceil(visitor.remainingMs/1000)),label=`⏱ ${seconds}s`;
            if(visitor.timerBadge.textContent!==label)visitor.timerBadge.textContent=label;
            visitor.timerBadge.classList.toggle('low-time',seconds<=5);
        }
        if(!safe(this))return;
        this._rickSchedule.elapsed+=dt;
        if(this.isDraggingRick){this._rickPortalFlow=null;return;}
        const rick=this.placedRick;
        if(rick){
            if(rick.planet!==this.currentLevel||(rick.timeline!==undefined&&rick.timeline!==this.timelineNumber)){this.despawnRick({animate:false});return;}
            rick.ageMs+=dt;
            if(!rick.held&&rick.ageMs>=rick.nextWander&&!rick.move){
                if(Math.random()<.45)rick.facing=!rick.facing;
                const x=rick.x+(rick.facing?1:-1)*(.35+.65*Math.random())*18,y=rick.y+(2*Math.random()-1)*8;
                const to=this.findNearestValidSpot?.(x,y,60)||{x,y};
                rick.move={from:{x:rick.x,y:rick.y},to,elapsed:0};rick.nextWander=rick.ageMs+1100+1500*Math.random();
            }
            if(rick.move&&!rick.held){
                const move=rick.move;move.elapsed+=Math.min(100,dt);const p=Math.min(1,move.elapsed/120),t=(1-Math.cos(Math.PI*p))/2;
                rick.x=move.from.x+(move.to.x-move.from.x)*t;rick.y=move.from.y+(move.to.y-move.from.y)*t;
                if(p===1){rick.move=null;this.updateDPS();}
            }
            pose(rick,window.DogeMinerTools.reduced());
            for(const [node,x,y]of[[rick.timerBadge,rick.x+30,rick.y-20],[rick.tooltip,rick.x+30,rick.y-42],[rick.zoneEl,rick.x+30,rick.y+30]]){node.style.left=x+'px';node.style.top=y+'px';}
            if(Math.floor(rick.ageMs/390)!==Math.floor((rick.ageMs-dt)/390))window.audioManager?.playToolVoice?.('pickaxe',{volume:.05});
            if(rick.ageMs>=rick.nextPhrase){this.showFieldPhrase?.(phrases[Math.floor(Math.random()*phrases.length)],{sprite:rick.sprite});rick.nextPhrase=rick.ageMs+5000+7000*Math.random();}
            this.positionHelperChatter?.(rick.sprite,rick.x,rick.y);return;
        }
        const flow=this._rickPortalFlow;
        if(flow){
            if(flow.planet!==this.currentLevel||flow.timeline!==this.timelineNumber){this.hideRick();return;}
            flow.elapsed+=dt;const node=document.getElementById('rick-doge'),portal=document.getElementById('rick-portal');
            if(!node||!portal){this.hideRick();return;}
            portal.style.opacity='1';portal.style.scale=window.DogeMinerTools.reduced()?'1':Math.min(1,flow.elapsed/500);
            node.style.opacity=flow.elapsed>=1500?'1':'0';
            node.style.pointerEvents=flow.elapsed>=1500?'auto':'none';
            const appeared=Math.max(0,flow.elapsed-1500),frame=Math.min(3,Math.floor(appeared/(1000/18)));
            node.src=this.rickSprites[frame];
            const readyAt=1500+4*1000/18+(flow.autoJump?650:1300);
            if(flow.elapsed>=readyAt){
                if(flow.autoJump){const host=document.getElementById('left-panel'),rect=node.getBoundingClientRect(),h=host.getBoundingClientRect(),ratio=h.width/host.offsetWidth;const x=(rect.x+rect.width/2-h.x)/ratio-30,y=(rect.y+rect.height/2-h.y)/ratio-30;this.hideRick();this.dropRick(x,y);}
                else{const reverse=3-Math.min(3,Math.floor((flow.elapsed-readyAt)/(1000/18)));node.src=this.rickSprites[reverse];if(reverse===0)this.hideRick();}
            }
            if(flow.elapsed>8000)this.hideRick();return;
        }
        if(!eligible(this))return;
        const clock=this.timelineProgress,seconds=clock?(clock.current.playTimeMs+(clock.completed||[]).reduce((s,r)=>s+(r.playTimeMs||0),0))/1000:(this.totalPlayTime||0)+(Date.now()-(this.startTime||Date.now()))/1000;
        const maxlevel=Math.max(1,...['earth','moon','mars','jupiter','titan'].map((p,i)=>this.unlockedLevels?.has(p)?i+1:0));
        const state=this.encounters||window.DogeMinerEncounters.normalize();
        if(!this._rickReference){const first=reference(seconds,maxlevel,state.rickReferences);if(first)this._rickReference={id:first[0],remaining:first[2]};}
        if(this._rickReference){
            this._rickReference.remaining-=dt;if(this._rickReference.remaining>0)return;
            const before=this.encounters;this.encounters={...state,rickReferences:[...state.rickReferences,this._rickReference.id]};
            if(window.saveManager?.commitEncounterProgress?.()!==true){this.encounters=before;this._rickReference.remaining=1000;return;}
            this._rickReference=null;this.spawnRick({autoJump:false});return;
        }
        if(state.rickReferences.length&&seconds>500&&this._rickSchedule.elapsed>=this._rickSchedule.target){this.scheduleNextRick();this.spawnRick({autoJump:Math.random()<.9});}
    };
    const despawn=proto.despawnRick;
    proto.despawnRick=function(...args){this._rickIncomeExpiry=null;const clock=this._rickSchedule;const result=despawn.apply(this,args);if(clock)this._rickSchedule=clock;return result;};
    window.DogeMinerRickVisitor=Object.freeze({reference,randomDelay,phrases,pose,pickScale});
})();
