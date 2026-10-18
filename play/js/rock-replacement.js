// Active source zm/c_:250ms capacity polling, then500ms replacement.
(function(){
    'use strict';const proto=DogeMinerGame.prototype;
    function full(stacks,planet){return [0,1,2,3].some(quality=>(stacks?.[planet]?.[quality]||0)>=99);}
    proto.isRockLootBlocked=function(planet=this.currentLevel){return full(this.dogebagStacks,planet);};
    proto.resetRockReplacement=function(){const job=this._rockReplacement;if(job){clearTimeout(job.timer);job.hint?.remove();}this._rockReplacement=null;};
    proto.regenerateRock=function(){
        if(this.isRockRegenerating)return;this.resetRockReplacement();
        const planet=this.currentLevel,epoch=this._rockStateEpoch||0,storyEpoch=this._storyEpoch||0,brokenLevel=this.rockLevel||1;
        this.isRockRegenerating=true;this.rocksBroken++;this.rockLevel=brokenLevel+1;
        this.rollRockThresholdLoot(5,this.rockLevel);
        const next={rocksBroken:this.rocksBroken,rockLevel:this.rockLevel,maxHP:this.getRockHP(this.getPlanetRockBaseHP(planet),this.rockLevel-1,planet)};next.currentHP=next.maxHP;this.planetRockData[planet]=next;
        const job=this._rockReplacement={planet,next,epoch,storyEpoch,timer:null,hint:null};
        const valid=()=>this._rockReplacement===job&&(this._rockStateEpoch||0)===epoch&&(this._storyEpoch||0)===storyEpoch&&this.currentLevel===planet&&this.planetRockData[planet]===next;
        const poll=()=>{
            if(!valid()){if(this._rockReplacement===job)this.resetRockReplacement();return;}
            if(this.isRockLootBlocked(planet)){
                if(!job.hint){const host=document.getElementById('left-panel');if(host){job.hint=document.createElement('div');job.hint.className='rock-capacity-hint';job.hint.setAttribute('role','status');job.hint.textContent='Loot capacity at maximum! Please open some bags…';host.append(job.hint);}}
                job.timer=setTimeout(poll,250);return;
            }
            job.hint?.remove();job.hint=null;
            job.timer=setTimeout(()=>{
                if(!valid()){if(this._rockReplacement===job)this.resetRockReplacement();return;}
                next.maxHP=this.getRockHP(this.getPlanetRockBaseHP(planet),next.rockLevel-1,planet);next.currentHP=next.maxHP;
                this.rockMaxHP=next.maxHP;this.rockCurrentHP=next.currentHP;this.lastDamageThresholdPercent=100;this.isRockRegenerating=false;this._rockReplacement=null;
                this.updateRockSprite();this.updateRockHealthDisplay();
            },500);
        };
        job.timer=setTimeout(poll,250);
    };
    window.DogeMinerRockReplacement=Object.freeze({full});
})();
