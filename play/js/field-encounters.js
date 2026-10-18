// Source Cate Thief encounter; wallet changes and rescued helpers commit together.
(function(){
    'use strict';
    const proto=DogeMinerGame.prototype;
    function normalize(raw,save={}){
        const state=raw==null?{version:1,caught:save.cateminers||0,missed:save.missedcates||0,stolen:0}:raw;
        if(state.version!==1||['caught','missed','stolen'].some(k=>!Number.isFinite(state[k])||state[k]<0)||['caught','missed'].some(k=>!Number.isSafeInteger(state[k])))throw Error('Unsupported encounter progress.');
        const references=state.rickReferences??[];
        if(!Array.isArray(references)||references.some(id=>!['rmref','rmref2','rmref3'].includes(id)))throw Error('Unsupported Rick references.');
        const clock=state.rickClockMs??0,target=state.rickTargetMs??0;
        if(!Number.isFinite(clock)||clock<0||!Number.isFinite(target)||(target!==0&&(target<480000||target>900000)))throw Error('Unsupported Rick clock.');
        return {version:1,caught:state.caught,missed:state.missed,stolen:state.stolen,rickReferences:[...new Set(references)],rickClockMs:clock,rickTargetMs:target};
    }
    function firstEligible(game){const progress=game.storyProgress;return game.dogecoins>3000&&(game.helpers||[]).filter(h=>h.type==='streamerKittens').length>1&&!progress?.seen?.includes('cateminer_kittens')&&!progress?.pending?.includes('cateminer_kittens');}
    function roll(clicks,previous,random,date=new Date()){
        const april=date.getMonth()===3&&date.getDate()===1;
        return random()<(april?.25:.05)&&clicks>(previous??clicks)+(april?2:15);
    }
    proto.getEncountersForSave=function(){return normalize({...normalize(this.encounters),...(this._rickSchedule?{rickClockMs:this._rickSchedule.elapsed,rickTargetMs:this._rickSchedule.target}:{})});};
    proto.restoreEncounterProgress=function(save={}){this.encounters=normalize(save.encounters,save);this._rickReference=null;this._rickSchedule={elapsed:this.encounters.rickClockMs,target:this.encounters.rickTargetMs||480000+420000*Math.random()};};
    proto.resetCateThief=function(){this._cateThief?.node?.remove();this._cateThief=null;this._lastCateClicks=null;this._cateIntroTimer=null;this._cateIntroOffered=false;this._cateIntroTimeline=null;};
    proto.tryOfferCateThief=function({random=Math.random,date=new Date()}={}){
        const eligible=roll(this.totalClicks,this._lastCateClicks,random,date);this._lastCateClicks=this.totalClicks;
        return eligible?this.spawnCateThief():false;
    };
    proto.spawnCateThief=function(){
        if(this._cateThief||this.isMobileDevice?.()||!this.canPresentTool?.())return false;
        const host=document.getElementById('left-panel');if(!host)return false;
        const node=document.createElement('button');node.type='button';node.className='cate-thief';node.setAttribute('aria-label','Catch the Cate Thief');
        const image=document.createElement('img');image.alt='';node.append(image);
        const placed=(this.placedHelpers||[]).find(h=>!h.groupId)||this.placedHelpers?.[0];
        const x=placed?placed.x-20:251+Math.round(50*Math.random()),y=placed?placed.y-45:130+Math.round(30*Math.random());
        node.style.left=Math.max(12,Math.min(host.offsetWidth-72,x))+'px';node.style.top=Math.max(100,Math.min(host.offsetHeight-80,y))+'px';
        const prefix=this.currentLevel==='earth'?'cateminer':'cateminer-space';image.src=`assets/general/${prefix}_idle.webp`;
        const caption=document.createElement('span');caption.textContent='INTRUDER ALERT';node.append(caption);
        node.addEventListener('pointerdown',event=>{event.preventDefault();event.stopPropagation();if(event.button===0)this.finishCateThief(true);});
        node.addEventListener('click',event=>{event.stopPropagation();this.finishCateThief(true);});host.append(node);
        this._cateThief={node,image,prefix,planet:this.currentLevel,timeline:this.timelineNumber,budget:240*Math.max(0,this.dps||0),elapsed:0,frameMs:0,loss:0,retryAt:0};
        if(!window.DogeMinerTools.reduced())node.animate?.([{translate:`${host.offsetWidth}px 0`},{translate:'0 0'}],{duration:500,easing:'ease-out'});
        this.stealCateCoins();return true;
    };
    proto.stealCateCoins=function(){
        const thief=this._cateThief;if(!thief)return false;
        if(thief.budget<=0)return this.finishCateThief(false);
        const nominal=Math.ceil(Math.max(0,this.dps||0)/2),amount=Math.min(this.dogecoins,nominal),before=this.encounters;
        const next=normalize(before);next.stolen+=amount;
        if(!Number.isFinite(next.stolen))return false;
        this.dogecoins-=amount;this.encounters=next;
        if(window.saveManager?.commitEncounterProgress?.()!==true){this.dogecoins+=amount;this.encounters=before;return false;}
        thief.budget-=nominal;thief.loss+=amount;this.flashDogecoinAmount?.('red');this.updateUI?.();return true;
    };
    proto.finishCateThief=function(caught){
        const thief=this._cateThief;if(!thief||thief.finishing)return false;thief.finishing=true;
        const before={encounters:this.encounters,helpers:this.helpers,earthPlacedHelpers:this.earthPlacedHelpers,placedHelpers:this.placedHelpers,storyProgress:this.storyProgress};
        const next=normalize(this.encounters);next[caught?'caught':'missed']++;
        this.encounters=next;let placed=null;
        if(caught){
            const helper=window.shopManager?.shopData?.helpers?.streamerKittens;
            if(!helper){this.encounters=before.encounters;thief.finishing=false;return false;}
            const owned={type:'streamerKittens',helper,dps:helper.baseDps??helper.baseDPS??4,name:this.getHelperName('streamerKittens')};
            this.helpers=[...(this.helpers||[]),owned];
            if(this.currentLevel==='earth'){
                const position=this.findHelperClusterPosition?.('streamerKittens')||{x:160,y:280};
                placed={...owned,...position,id:Date.now()+Math.random(),isMining:true};
                this.placedHelpers=[...(this.placedHelpers||[]),placed];this.earthPlacedHelpers=this.placedHelpers;
            } else this.earthPlacedHelpers=[...(this.earthPlacedHelpers||[]),{...owned,x:160,y:280,id:Date.now()+Math.random(),isMining:true}];
            const progress=this.getStoryProgressForSave();
            if(!progress.seen.includes('cateminer_kittens')&&!progress.pending.includes('cateminer_kittens'))progress.pending.push('cateminer_kittens');
            this.storyProgress=progress;
        }
        let saved=false;try{this.updateDPS?.();saved=window.saveManager?.commitEncounterProgress?.()===true;}catch(error){console.error(error);}
        if(!saved){Object.assign(this,before);this.updateDPS?.();thief.finishing=false;return false;}
        this._cateThief=null;thief.node.disabled=true;
        if(caught){window.audioManager?.playSound('cate_dying');if(placed)this.createHelperSprite?.(placed);this.showNotification?.(`THIEF STOPPED · LOST ${this.formatNumber(thief.loss)} DOGECOINS.`);}
        if(window.DogeMinerTools.reduced())thief.node.remove();
        else{const motion=thief.node.animate?.([{scale:1,opacity:1},{scale:0,opacity:0}],{duration:1000,easing:'ease-in'});if(motion)motion.onfinish=()=>thief.node.remove();else thief.node.remove();}
        window.uiManager?.updateShopContent?.();this.updateUI?.();return true;
    };
    proto.advanceCateThief=function(elapsed){
        if(this._cateIntroTimeline!==this.timelineNumber){this._cateIntroTimeline=this.timelineNumber;this._cateIntroTimer=null;this._cateIntroOffered=false;}
        const thief=this._cateThief;
        if(!thief){
            if(this.isMobileDevice?.()||!this.canPresentTool?.())return;
            if(!this._cateIntroOffered&&this._cateIntroTimer===null&&firstEligible(this))this._cateIntroTimer=4200;
            if(this._cateIntroTimer!==null&&this._cateIntroTimer!==undefined){this._cateIntroTimer-=Math.max(0,Math.min(1000,elapsed));if(this._cateIntroTimer<=0){this._cateIntroTimer=null;this._cateIntroOffered=true;this.spawnCateThief();}}
            return;
        }
        if(thief.planet!==this.currentLevel||thief.timeline!==this.timelineNumber){this.resetCateThief();return;}
        if(!this.canPresentTool?.())return;
        const dt=Math.max(0,Math.min(1000,elapsed));thief.elapsed+=dt;thief.frameMs+=dt;
        thief.image.src=`assets/general/${thief.prefix}_${Math.floor(thief.frameMs/(1000/9))%2?'mine':'idle'}.webp`;
        if(thief.elapsed>=1000){thief.elapsed%=1000;this.stealCateCoins();}
    };
    const bonus=proto.rollForBonusCoin;
    proto.rollForBonusCoin=function(options={}){const result=bonus.call(this,options);if(this.canRunBonusCoinEvents())this.tryOfferCateThief(options);return result;};
    window.DogeMinerStories.registerNarrative({id:'cateminer_kittens',title:'Cate Thief',body:'You caught a thieving <dark>CATE MINER</dark>! You freed a part of its labor force.\nReceived <green>1x</green> <dark>Streamer Kittens</dark>!',image:'../assets/SpritesheetsSrc/story/story/cateminer_kittens.webp',eligible:()=>false});
    window.DogeMinerEncounters=Object.freeze({normalize,roll,firstEligible});
})();
