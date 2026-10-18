// Mystery Box shares Dogebag receipts/cards, with its own source shake/jump/lid phases.
(function () {
    'use strict';
    const proto=DogeMinerGame.prototype;
    const valid=(game,view)=>game._dogebagReveal===view&&view.epoch===(game._currencyFlightEpoch||0);
    const later=(view,fn,ms)=>view.timers.push(setTimeout(fn,ms));
    // Source mbfound -> mbevolve-story -> mbevolve-init -> fw entry. Ownership
    // is saved with the loot; only the interactive presentation waits.
    const evolutionTiming=Object.freeze({found:1500,story:3000,init:1000,entry:1000,fade:250});
    const initBox=proto.initMysteryBox, travelAllowed=proto.isWorldTravelAllowed;
    proto.noteMysteryBoxFound=function(){
        if(this.mysteryBoxObtained)return;
        this.mysteryBoxEvolutionPending=true;this._mysteryEvolution=null;
    };
    proto.initMysteryBox=function(){
        const button=document.getElementById('mystery-box-btn');
        if(!this.mysteryBoxObtained||this.mysteryBoxEvolutionPending||this._mysteryEntryAt){
            if(button)button.style.display='none';return;
        }
        if(button){button.style.opacity='';button.style.pointerEvents='';}
        initBox.call(this);
    };
    proto.isWorldTravelAllowed=function(){
        return !this.mysteryBoxEvolutionPending&&(!travelAllowed||travelAllowed.call(this));
    };
    proto.advanceMysteryBoxEvolution=function(){
        const now=Date.now();
        if(!this._bootComplete||!this.isPlaying||document.hidden||this.isCutscenePlaying||this.isTransitioning
            ||this.isBetaReportOpen||this.isOfflineReportOpen||this._dogebagReveal||this._helperDrag
            ||this.isPlacingHelpers||this.helpersOnCursor?.length)return;
        if(this._mysteryEntryAt&&now>=this._mysteryEntryAt){
            this._mysteryEntryAt=0;this.initMysteryBox();
            const button=document.getElementById('mystery-box-btn');
            if(!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
                button?.animate?.([{opacity:0},{opacity:1}],{duration:evolutionTiming.fade,easing:'ease-out'});
        }
        if(!this.mysteryBoxObtained||!this.mysteryBoxEvolutionPending||!this.storyProgress)return;
        const remembered=this.storyProgress.seen.includes('mbevolve');
        const queued=this.storyProgress.pending.includes('mbevolve');
        this._mysteryEvolution ||= {phase:remembered||queued?'init':'found',at:now+(remembered||queued?evolutionTiming.init:evolutionTiming.found)};
        const state=this._mysteryEvolution;
        if(now<state.at||(this.isStoryOpen&&this._activeStory?.id!=='mbevolve'))return;
        if(state.phase==='found')this._mysteryEvolution={phase:'story',at:now+evolutionTiming.story};
        else if(state.phase==='story'){
            if(!remembered&&!queued&&!this.queueStory('mbevolve'))return;
            this._mysteryEvolution={phase:'init',at:now+evolutionTiming.init};
        }else{
            this.mysteryBoxEvolutionPending=false;
            let saved=false;
            try{saved=window.saveManager?.commitStoryProgress?.()===true;}catch(error){console.error('Could not save Mystery Box evolution:',error);}
            if(!saved){this.mysteryBoxEvolutionPending=true;state.at=now+1000;return;}
            this._mysteryEvolution=null;this._mysteryEntryAt=now+evolutionTiming.entry;
        }
    };
    const evolutionBody='Your <blue>Mystery Box</blue> is evolving!';
    window.DogeMinerStories?.registerNarrative({id:'mbevolve',title:'Huh?',body:evolutionBody,
        image:'assets/general/mysterybox_big.webp',sound:'short_sparkle'});
    window.DogeMinerMysteryEvolution=Object.freeze({timing:evolutionTiming});
    proto.getMysteryBoxTimerRemaining=function(){return this._mysteryBoxReadyAt?Math.max(0,this._mysteryBoxReadyAt-Date.now()):Math.max(0,this.mysteryBoxTimerRemaining||0);};
    proto.startMysteryBoxTimer=function(){
        clearInterval(this._mysteryBoxInterval);this._mysteryBoxReadyAt=Date.now()+Math.max(0,this.mysteryBoxTimerRemaining||0);
        const tick=()=>{
            this.mysteryBoxTimerRemaining=this.getMysteryBoxTimerRemaining();this.mysteryBoxLastSaveTime=Date.now();
            const ready=this.mysteryBoxTimerRemaining===0,button=document.getElementById('mystery-box-btn'),timer=document.getElementById('mbox-sidebar-timer');
            button?.classList.toggle('mystery-box-ready',ready);
            if(timer)timer.textContent=ready?'OPEN!':this._formatMs(this.mysteryBoxTimerRemaining);
            if(this._dogebagReveal?.kind==='mystery'&&!this._dogebagReveal.opened)this.updateMysteryBoxPrompt();
            if(ready){clearInterval(this._mysteryBoxInterval);this._mysteryBoxInterval=null;}
        };
        tick();if(this.mysteryBoxTimerRemaining>0)this._mysteryBoxInterval=setInterval(tick,1000);
    };
    proto.updateMysteryBoxPrompt=function(){
        const view=this._dogebagReveal;if(view?.kind!=='mystery'||view.opened)return;
        const ready=this.getMysteryBoxTimerRemaining()<=0,opening=window.DogeMinerBalance.getMysteryBoxOpening(this),bonus=this.isSupporter||opening.rewards===2;
        const modal=document.getElementById('dogebag-modal');modal.dataset.mysteryState=ready?'ready':'waiting';
        document.getElementById('mystery-loot-status').textContent=ready?'The Mystery Box wants to open!':"The Mystery Box doesn't want to open yet";
        document.getElementById('mystery-loot-timer').textContent=ready?'':'Opens in '+this._formatMs(this.getMysteryBoxTimerRemaining());
        document.getElementById('mystery-loot-bonus').textContent=bonus?(this.isSupporter?'Supporter: 2X rewards':'Open for 2X rewards!'):'Open '+opening.opensUntilBonus+' more for 2X rewards';
        document.getElementById('mystery-loot-open').hidden=!ready;
        if(ready&&!view.readyShake){
            view.readyShake=true;const image=document.getElementById('dogebag-burst-bag'),M=window.LootMotion;
            const run=()=>{if(!valid(this,view)||view.opened)return;M.sample(image,750,t=>({transform:'translateX('+M.shake(t,5)+'px)'}),()=>later(view,run,1500));};run();
        }
    };
    proto.openMysteryBoxModal=function(){
        if(!this.mysteryBoxObtained||this.mysteryBoxEvolutionPending||this._mysteryEntryAt||this.isStoryOpen||this._dogebagReveal||this.isBetaReportOpen||this.isTransitioning)return;
        const modal=document.getElementById('dogebag-modal');if(!modal)return;
        this.releaseHeldHelpers?.(true);this.playSound('inventoryOpen');
        const view=this._dogebagReveal={kind:'mystery',options:{planet:this.currentLevel,dropType:1},bags:[],opened:false,
            epoch:this._currencyFlightEpoch||0,rewards:[],reviewed:new Set(),selected:0,coins:0,diamonds:0,nodes:[],timers:[],previousFocus:document.activeElement};
        modal.dataset.lootKind='mystery';modal.classList.remove('closing','mystery-review');modal.classList.add('active');
        modal.style.setProperty('--bag-color','#495dff');
        document.getElementById('dogebag-burst-title').textContent='MYSTERY BOX';
        document.getElementById('dogebag-burst-bag').src='assets/general/mysterybox_big.webp';
        document.getElementById('dogebag-burst-count').textContent='';
        document.getElementById('dogebag-burst-stage').classList.remove('finished');
        Object.assign(document.getElementById('dogebag-burst-stage').style,{opacity:'',transform:''});
        document.getElementById('dogebag-state-prompt').hidden=true;document.getElementById('dogebag-state-reveal').hidden=true;
        document.getElementById('dogebag-reward-tray').replaceChildren();document.getElementById('mystery-loot-prompt').hidden=false;
        this.layoutDogebagBackdrops(view);view.resize=()=>{this.layoutDogebagBackdrops(view);this.layoutDogebagTray(view);};window.addEventListener('resize',view.resize);
        view.keyHandler=event=>{
            event.stopImmediatePropagation();if(event.key==='Escape'){event.preventDefault();this.closeDogebagModal();}
            else if(event.key==='Tab'){
                const controls=[...modal.querySelectorAll('button')].filter(button=>!button.disabled&&button.getClientRects().length),index=controls.indexOf(document.activeElement);
                if(controls.length&&(index<0||event.shiftKey&&index===0||!event.shiftKey&&index===controls.length-1)){event.preventDefault();controls[event.shiftKey?controls.length-1:0].focus();}
            }
        };
        document.addEventListener('keydown',view.keyHandler,true);this.updateMysteryBoxPrompt();
        const open=document.getElementById('mystery-loot-open');(open.hidden?modal.querySelector('.dogebag-burst-close'):open)?.focus({preventScroll:true});
    };
    proto.openMysteryBoxRewards=function(){
        const view=this._dogebagReveal;
        if(view?.kind!=='mystery'||view.opened||!this.mysteryBoxObtained||this.getMysteryBoxTimerRemaining()>0)return;
        view.opened=true;
        const opening=window.DogeMinerBalance.getMysteryBoxOpening(this),count=this.isSupporter?2:opening.rewards;
        // DM2 rolls both before crediting either: the first reward cannot change the second's Wow/DPC.
        for(let index=0;index<count;index++){
            const reward=this._rollMysteryBoxReward({forceFortune:index===1&&view.rewards[0]?.type==='pickaxe'});
            if(reward)view.rewards.push(reward);
        }
        for(const reward of view.rewards)this.grantDogebagReward(reward);
        this._pendingMysteryBoxRewards=null;
        this.mysteryBoxOpenCount=(this.mysteryBoxOpenCount||0)+1;this.mysteryBoxCycle=opening.nextCycle;
        this.mysteryBoxTimerRemaining=opening.cooldown;this.mysteryBoxLastSaveTime=Date.now();this.startMysteryBoxTimer();
        window.saveManager?.saveGame(false);this.updateUI();
        document.getElementById('mystery-loot-prompt').hidden=true;
        document.getElementById('dogebag-modal').dataset.mysteryState='opening';
        document.getElementById('dogebag-burst-title').textContent='MYSTERY BOX CONTAINED:';
        this.presentDogebagRewards(view);
    };
    proto.animateMysteryBoxOpening=function(view){
        const stage=document.getElementById('dogebag-burst-stage'),image=document.getElementById('dogebag-burst-bag'),M=window.LootMotion;
        image.getAnimations().forEach(animation=>animation.cancel());
        M.sample(image,750,t=>({transform:'translateX('+M.shake(t,15)+'px)'}));
        later(view,()=>{if(valid(this,view))M.sample(stage,500,t=>{const u=M.quadInOut(t)*2,k=u<1?1-(1-u)*(1-u):(2-u)*(2-u);return{transform:'translateX(-50%) translateY('+(-30*k)+'px)'};});},900);
        later(view,()=>{
            if(!valid(this,view))return;
            image.src='assets/general/mysterybox_big_open.webp';
            const rays=document.createElement('div');rays.className='mystery-loot-rays';stage.prepend(rays);view.nodes.push(rays);
            M.sample(rays,250,t=>({transform:'scale('+(3*t)+')',opacity:.35*t}));
        },1150);
        view.rewards.forEach((reward,index)=>later(view,()=>{if(valid(this,view)){this.playSound(reward.type==='pickaxe'?'receivePickaxe':'collectItem');this.flyDogebagReceipt(view,index);}},index===0?1400:2050));
        later(view,()=>{
            if(!valid(this,view))return;
            const from=stage.getBoundingClientRect();document.getElementById('dogebag-modal').classList.add('mystery-review');
            const to=stage.getBoundingClientRect(),dx=from.left+from.width/2-to.left-to.width/2,dy=from.top+from.height/2-to.top-to.height/2,sx=from.width/to.width,sy=from.height/to.height;
            M.sample(stage,480,t=>{const k=1-(1-t)*(1-t);return{transform:'translateX(-50%) translate('+(dx*(1-k))+'px,'+(dy*(1-k))+'px) scale('+(sx+(1-sx)*k)+','+(sy+(1-sy)*k)+')',opacity:.75-.35*k};});
        },(view.rewards.length>1?2050:1400)+350);
        later(view,()=>{if(valid(this,view)){document.getElementById('dogebag-modal').dataset.mysteryState='review';this.finishDogebagBurst(view);}},(view.rewards.length>1?2050:1400)+840);
    };
    proto.mysteryBoxEquip=function(){if(this._dogebagReveal?.kind==='mystery')this.dogebagEquip();};
    proto.closeMysteryBoxModal=function(){if(this._dogebagReveal?.kind==='mystery')this.closeDogebagModal();document.getElementById('mystery-box-modal')?.classList.remove('active');};
})();
