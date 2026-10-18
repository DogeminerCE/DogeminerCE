// Source late-game milestones mapped onto CE's retained Altar helper.
(function(){
    'use strict';
    const yogaWave=Object.freeze([["cloudBase", 2], ["cloudBase", 3], ["cloudBase", 4], ["roboShibe", 2], ["roboShibe", 3], ["roboShibe", 4], ["timeTravelDRex", 4], ["altarOfTheSunDoge", 2]].map(Object.freeze));
    const metalWave=Object.freeze([["miningShibe", 8], ["dogeKennels", 9], ["streamerKittens", 9], ["spaceRocket", 8], ["moonBase", 5], ["timeMachineRig", 4], ["moonShibe", 5], ["dogeCar", 6], ["landerShibe", 5], ["marsBase", 6], ["infiniteDogebility", 6], ["partyShibe", 6], ["djKittenz", 6], ["spaceBass", 3], ["marsRocket", 3], ["jupiterRocket", 3], ["cloudBase", 5], ["superShibe", 4], ["dogeStar", 3], ["dogeGate", 3], ["flyingDoggo", 5], ["dogeAirShip", 4], ["tardogeis", 4], ["roboShibe", 5], ["heavyDogeWalker", 3], ["coinSeeker5000", 4], ["titanBase", 3]].map(Object.freeze));
    const fresh=(timeline=1)=>({version:1,timeline:Math.max(1,Math.floor(timeline||1)),yoga:false,reallyhardium:false});
    function normalize(raw,save={}){
        const state=fresh(save.timelineNumber);
        if(raw==null){
            const levels=save.helperUpgradeLevels||{};
            state.yoga=(levels.altarOfTheSunDoge||0)>=1||yogaWave.some(([type,level])=>(levels[type]||0)>=level);
            state.reallyhardium=metalWave.some(([type,level])=>(levels[type]||0)>=level);
            if(state.reallyhardium)state.yoga=true;
            return state;
        }
        if(raw.version!==1||raw.timeline!==state.timeline||typeof raw.yoga!=='boolean'||typeof raw.reallyhardium!=='boolean')
            throw new Error('This late-game progression version or state is not supported.');
        if(raw.reallyhardium&&!raw.yoga)throw new Error('Reallyhardium progression requires its prior milestone.');
        return {...state,yoga:raw.yoga,reallyhardium:raw.reallyhardium};
    }
    const proto=DogeMinerGame.prototype;
    proto.getLateProgressionForSave=function(){return normalize(this.lateProgression||fresh(this.timelineNumber),this);};
    proto.restoreLateProgression=function(save={}){
        this.lateProgression=normalize(save.lateProgression,save);this._lateRetryAt=0;
        // Retire only milestones supported by already purchased legacy tiers.
        if(save.lateProgression==null&&this.storyProgress){
            const finished=[...(this.lateProgression.yoga?['foundup1']:[]),...(this.lateProgression.reallyhardium?['foundbp','figurebp']:[])];
            this.storyProgress={...this.storyProgress,seen:[...new Set([...this.storyProgress.seen,...finished])],pending:this.storyProgress.pending.filter(id=>!finished.includes(id))};
        }
    };
    proto.hasFoundBlueprint=function(){return ['field','collected'].includes(this.worldDiscovery?.artifacts?.blueprint?.stage);};
    proto.nextTimelineLateProgression=function(timeline){return fresh(timeline);};
    function yogaEligible(game,now){return (game.helperUpgradeLevels?.altarOfTheSunDoge||0)>=1
        &&game._storyLocationPlanet===game.currentLevel&&Number.isFinite(game._storyLocationStartedAt)&&game._storyLocationStartedAt+5500<now;}
    function isYogaUnlocked(game,type,level){return !yogaWave.some(([key,tier])=>key===type&&level>=tier)||game.lateProgression?.yoga===true;}
    function metalEligible(game,now){return (game.helperUpgradeLevels?.altarOfTheSunDoge||0)>=2
        &&['field','collected'].includes(game.worldDiscovery?.artifacts?.blueprint?.stage)
        &&game._storyLocationPlanet===game.currentLevel&&Number.isFinite(game._storyLocationStartedAt)&&game._storyLocationStartedAt+1300<now;}
    function isUnlocked(game,type,level){
        if(metalWave.some(([key,tier])=>key===type&&level>=tier))return game.lateProgression?.reallyhardium===true;
        return isYogaUnlocked(game,type,level);
    }
    proto.commitLateProgression=function(next,story){
        try{next=normalize(next,this);}catch(error){console.error(error);return false;}
        const before=this.lateProgression,oldStories=this.storyProgress,draft=this.getStoryProgressForSave();
        if(story&&!draft.seen.includes(story)&&!draft.pending.includes(story)&&!this._storySkipped?.has(story))draft.pending.push(story);
        this.lateProgression=next;this.storyProgress=draft;
        let saved=false;try{saved=window.saveManager?.commitLateProgression?.()===true;}catch(error){console.error('Could not save late-game milestone:',error);}
        if(!saved){this.lateProgression=before;this.storyProgress=oldStories;this._lateRetryAt=Date.now()+1000;return false;}
        this._lateRetryAt=0;try{this.updateUI?.();window.uiManager?.updateUpgradeContent?.();
        if(this.isMobileDevice?.())window.uiManager?.updateMobileUpgradesContent?.();
        window.uiManager?.updateUpgradeTabCount?.();}catch(error){console.error('Late-game display refresh failed:',error);}return true;
    };
    proto.advanceLateProgression=function(){
        if(!this.lateProgression||Date.now()<(this._lateRetryAt||0)||!this.canPresentStory?.())return;
        if(!this.lateProgression.yoga&&yogaEligible(this,Date.now()))this.commitLateProgression({...this.lateProgression,yoga:true},'foundup1');
        if(!this.lateProgression.reallyhardium&&metalEligible(this,Date.now()))
            this.commitLateProgression({...this.lateProgression,yoga:true,reallyhardium:true},'figurebp');
    };
    window.DogeMinerStories.registerNarrative({id:'foundup1',title:'NEW UPGRADES AVAILABLE',
        body:"The <orange>awakened Altar</orange> has enlightened Titan's super-intelligent Shibes. Their research has unlocked new upgrades.",
        image:'assets/helpers/altarofthesundoge/altarofthesundoge-mine-1.webp',eligible:()=>false});
    window.DogeMinerStories.registerNarrative({id:'figurebp',title:'TITAN RESEARCH BREAKTHROUGH!',
        body:"Inspired by the <orange>awakened Altar</orange>, Titan's super-intelligent Shibes have used the mysterious blueprints to develop a new metal: <green>REALLYHARDIUM</green>. Their breakthrough has unlocked new upgrades.",
        image:'assets/helpers/altarofthesundoge/altarofthesundoge-mine-2.webp',eligible:()=>false});
    window.DogeMinerLateProgression=Object.freeze({fresh,normalize,yogaWave,metalWave,yogaEligible,isYogaUnlocked,metalEligible,isUnlocked});
})();
