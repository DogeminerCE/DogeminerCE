// Adapt the source event scenes and hidden-egg locations to CE's retained UI.
(function(){
    'use strict';
    const rules=window.DogeMinerSeasonal,proto=DogeMinerGame.prototype;
    const art='../assets/SpritesheetsSrc/';
    proto.getSeasonalForSave=function(){return rules.normalize(this.seasonal,this.dm2Import);};
    proto.restoreSeasonal=function(raw,legacy){
        this.resetSeasonalPresentation();this.seasonal=rules.normalize(raw,legacy);this.holiday=rules.active(this);
    };
    proto.resetSeasonalPresentation=function(){
        this._seasonalEpoch=(this._seasonalEpoch||0)+1;clearInterval(this._seasonalTimer);this._seasonalTimer=null;
        clearTimeout(this._eggExpiry);this._eggExpiry=null;this._seasonalEgg=null;
        for(const el of document.querySelectorAll('.seasonal-scene,.seasonal-hidden-egg'))el.remove();
    };
    function image(parent,cls,path){
        if(!parent)return;
        let node=parent.querySelector('.'+cls);if(!node){node=document.createElement('img');node.className='seasonal-scene '+cls;node.alt='';node.setAttribute('aria-hidden','true');parent.append(node);}
        if(node.getAttribute('src')!==art+path)node.src=art+path;
        return node;
    }
    proto.renderSeasonal=function(){
        const event=rules.active(this),character=document.getElementById('main-character'),container=document.getElementById('character-container');
        this.holiday=event;document.body.dataset.holiday=event||'';
        const counter=document.querySelector('#stats-display .stat-icon');if(counter)counter.src='assets/general/'+(event==='xmas'?'xmas':event==='easter'?'easter':'')+'dogecoin_70x70.webp';
        for(const node of document.querySelectorAll('.seasonal-scene'))node.hidden=true;
        if(character){
            const originals={earth:'standard',moon:'spacehelmet',mars:'party',jupiter:'spacehelmet',titan:'spacehelmet'};
            const santa=this.currentLevel==='earth'?'earthsanta':this.currentLevel==='mars'?'partysanta':'spacesanta';
            const ordinary='assets/general/character/'+(originals[this.currentLevel]||'standard')+'.webp';
            if(event==='xmas'){if(!this._happyDogeTimeout)character.src=art+'xmas/xmas/'+santa+'.webp';character.dataset.seasonalCharacter='1';}
            else if(character.dataset.seasonalCharacter){character.src=ordinary;delete character.dataset.seasonalCharacter;}
        }
        if(event==='easter'||event==='halloween'){
            const path=event==='easter'?'easter/easter/ears.webp':'halloween/halloween/hat.webp';
            const hat=image(container,'seasonal-accessory',path);if(hat){
                hat.hidden=false;hat.dataset.event=event;
                const ratio=(character?.clientWidth||120)/(character?.naturalWidth||150),cx=(character?.offsetLeft||0)+(character?.clientWidth||120)/2,cy=(character?.offsetTop||0)+(character?.clientHeight||120)/2;
                const width=event==='easter'?173*.8*ratio:236*.75*ratio,height=event==='easter'?113*.8*ratio:189*.75*ratio;
                const x=event==='easter'?cx+11*ratio-width/2:cx-(this.currentLevel==='mars'?80:75)*ratio;
                const y=event==='easter'?cy-(this.currentLevel==='moon'?94:87)*ratio-height/2:cy-(this.currentLevel==='earth'?151:this.currentLevel==='mars'?168:161)*ratio;
                Object.assign(hat.style,{width:width+'px',left:x+'px',top:y+'px'});
            }
        }
        if(event){
            const rock=document.getElementById(event==='halloween'?'planet-summary':'rock-container'),paths={easter:'easter/easter/rock_grass.webp',halloween:'halloween/halloween/location-wrapper.webp',xmas:'xmas/xmas/'+(this.currentLevel==='titan'?'snow_titanrock':'snow_rocks')+'.webp'};
            const overlay=image(rock,'seasonal-rock',paths[event]);if(overlay)overlay.hidden=false;
            if(event==='xmas'){const snow=image(document.getElementById('planet-summary'),'seasonal-platform','xmas/xmas/snow_earthcap.webp');if(snow)snow.hidden=false;}
        }
        let count=document.getElementById('seasonal-egg-progress');
        if(event==='easter'&&this.seasonal?.easter.count){
            if(!count){
                count=document.createElement('button');count.id='seasonal-egg-progress';count.className='seasonal-scene';count.type='button';
                const icons=document.createElement('img');icons.alt='';count.append(icons);
                document.getElementById('left-panel')?.append(count);
                count.addEventListener('click',()=>this.showNotification(count.getAttribute('aria-label')));
            }
            const eggs=Math.min(9,this.seasonal.easter.count),src=art+'easter/easter/count'+eggs+'.webp',icons=count.firstElementChild;
            count.dataset.phone=String(this.isMobileDevice?.()===true);
            if(icons.getAttribute('src')!==src)icons.src=src;
            icons.width=154;icons.height=eggs===9?75:35;
            const description=eggs+'/9 Easter eggs'+(this.seasonal.easter.golden?' · Golden egg earned':'')+' · '+Math.round((rules.income(this).multiplier-1)*100)+'% event DPS bonus';
            count.hidden=false;count.setAttribute('aria-label',description);count.title=description;
            // Keep the source offset when it fits. CE's centered phone balance
            // is wider than DM2's; move the strip below it when they intersect.
            if(count.getBoundingClientRect){
                count.style.top='';const rect=count.getBoundingClientRect(),stats=document.getElementById('stats-display');
                if(stats&&[...stats.querySelectorAll('.stat-item')].some(item=>{const r=item.getBoundingClientRect();return r.width&&rect.left<r.right&&rect.right>r.left&&rect.top<r.bottom&&rect.bottom>r.top;}))count.style.top=(stats.offsetTop+stats.offsetHeight+6)+'px';
            }
        }
        this.syncSeasonalSettings();
    };
    proto.syncSeasonalSettings=function(){
        for(const id of ['holidays-enabled','mobile-holidays-enabled']){
            const input=document.getElementById(id);if(!input)continue;input.checked=this.seasonal?.enabled!==false;
            input.closest('.setting-item').hidden=(this.timelineNumber||1)<=1;
            if(!input.dataset.seasonalBound){input.dataset.seasonalBound='1';input.addEventListener('change',()=>this.setHolidaysEnabled(input.checked));}
        }
    };
    proto.setHolidaysEnabled=function(enabled){
        const before=this.getSeasonalForSave();this.seasonal={...before,enabled:!!enabled};
        if(window.saveManager?.commitStoryProgress?.()!==true){this.seasonal=before;this.syncSeasonalSettings();return false;}
        this.refreshSeasonal();return true;
    };
    proto.refreshSeasonal=function(){
        if(!this.seasonal)this.seasonal=rules.normalize(null,this.dm2Import);
        const previous=this.holiday;this.holiday=rules.active(this);this.renderSeasonal();
        if(previous!==this.holiday){this.clearHiddenEgg();this.setPlanetBackgrounds?.(this.currentLevel,{reset:true});this.updateDPS?.();window.audioManager?.stopMusic();window.audioManager?.playBackgroundMusic();}
    };
    proto.startSeasonal=function(){
        if(this._seasonalTimer)return;
        this.refreshSeasonal();this._nextEggAt=Date.now()+55000;
        this._seasonalTimer=setInterval(()=>{
            if(!this._bootComplete)return;this.refreshSeasonal();
            if(rules.active(this)!=='easter'||!this.isPlaying||this.isTransitioning||this.isCutscenePlaying||this.isIntroPlaying)return;
            if(Date.now()>=this._nextEggAt){this._nextEggAt=Date.now()+55000;this.spawnHiddenEgg();}
        },1000);
    };
    proto.clearHiddenEgg=function(){clearTimeout(this._eggExpiry);this._eggExpiry=null;this._seasonalEgg=null;document.querySelector('.seasonal-hidden-egg')?.remove();};
    function eggHost(game,id){
        const field=document.getElementById('left-panel');
        if(typeof id==='number')return ['earth','moon','mars','jupiter','titan'][id-1]===game.currentLevel?field:null;
        const hosts={setting:['#settings-tab.active','#mobile-settings-tab.active'],inv1:['#pickaxe-modal.active .switcher-modal-content'],inv2:['#fortune-modal.active .switcher-modal-content'],upgrade:['#upgrades-tab.active','#mobile-upgrades-tab.active']};
        for(const selector of hosts[id]||[]){const el=document.querySelector(selector);if(el&&el.getBoundingClientRect().width>0)return el;}
        return null;
    }
    proto.spawnHiddenEgg=function(wanted){
        if(rules.active(this)!=='easter'||this.seasonal.easter.count>=9||this._seasonalEgg||this.isStoryOpen||this._dogebagReveal)return false;
        const eligible=rules.eggs.filter(id=>!this.seasonal.easter.found.includes(id)&&eggHost(this,id));
        const id=wanted??eligible[Math.floor(Math.random()*eligible.length)];if(!eligible.includes(id))return false;
        const host=eggHost(this,id),button=document.createElement('button');button.className='seasonal-hidden-egg';button.type='button';button.setAttribute('aria-label','Collect hidden Easter egg');button.dataset.egg=String(id);
        const img=document.createElement('img');img.src=art+'easter/easter/icons/dogecoin_egg_75.png';img.alt='';button.append(img);
        const grey=document.createElement('img');grey.src=art+'easter/easter/icons/dogecoin_egg_greyscale.webp';grey.alt='';grey.style.opacity=String(1-this.seasonal.easter.count/10);grey.className='seasonal-egg-mask';button.append(grey);host.append(button);
        this._seasonalEgg={id,button,epoch:this._seasonalEpoch};button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();this.collectHiddenEgg(id);});
        // Avoid a held mining gesture when a mouse/touch presses the hidden egg.
        for(const event of ['pointerdown','mousedown','touchstart'])button.addEventListener(event,e=>e.stopPropagation());
        this._eggExpiry=setTimeout(()=>this.clearHiddenEgg(),30000);return true;
    };
    proto.collectHiddenEgg=function(id){
        const egg=this._seasonalEgg,before=this.getSeasonalForSave();
        if(!egg||egg.id!==id||egg.epoch!==this._seasonalEpoch||rules.active(this)!=='easter'||before.easter.found.includes(id)||before.easter.count>=9)return false;
        this.seasonal={...before,easter:{...before.easter,found:[...before.easter.found,id],count:before.easter.count+1}};
        if(window.saveManager?.commitStoryProgress?.()!==true){this.seasonal=before;this.updateDPS?.();return false;}
        this.clearHiddenEgg();this.updateDPS();this.renderSeasonal();this.playSound?.('friendlytwinkle');
        this.showNotification('Easter egg found! +1% event DPS.');return true;
    };
    const ordinaryCharacter=proto._getCharacterSprite;
    proto._getCharacterSprite=function(){return rules.active(this)==='xmas'?art+'xmas/xmas/'+(this.currentLevel==='earth'?'earthsanta':this.currentLevel==='mars'?'partysanta':'spacesanta')+'.webp':ordinaryCharacter.call(this);};
    const intro=proto.playDogeIntro;proto.playDogeIntro=function(...args){const result=intro.apply(this,args);this.renderSeasonal();return result;};
    const blink=proto.blinkDoge;proto.blinkDoge=function(...args){if(rules.active(this)!=='xmas')return blink.apply(this,args);};
    const happy=proto._showHappyDoge;proto._showHappyDoge=function(...args){
        if(rules.active(this)!=='xmas')return happy.apply(this,args);
        const node=document.getElementById('main-character');if(!node)return;
        node.src=this._getCharacterSprite().replace('.webp','_happy.webp');clearTimeout(this._happyDogeTimeout);
        this._happyDogeTimeout=setTimeout(()=>{node.src=this._getCharacterSprite();this._happyDogeTimeout=null;},1000);
    };
    const originalBackgrounds=proto.getPlanetBackgrounds;
    proto.getPlanetBackgrounds=function(planet){return rules.backgrounds(this)||originalBackgrounds.call(this,planet);};
    const originalSetBackgrounds=proto.setPlanetBackgrounds;
    proto.setPlanetBackgrounds=function(...args){this.clearHiddenEgg();const result=originalSetBackgrounds.apply(this,args);this.renderSeasonal();return result;};
    // Golden reward flag and story completion are one atomic save operation.
    const commit=proto._commitStoryProgress;
    proto._commitStoryProgress=function(next){
        const before=this.seasonal;
        if(next.seen.includes('eggz21')&&!this.storyProgress?.seen.includes('eggz21')&&this.seasonal?.easter.count===9)this.seasonal={...this.seasonal,easter:{...this.seasonal.easter,golden:true}};
        const ok=commit.call(this,next);if(!ok){this.seasonal=before;this.updateDPS?.();}else this.renderSeasonal();return ok;
    };
    window.DogeMinerStories.registerNarrative({id:'eastr21',title:'EGGS, BUNNIES & WOW',body:'The Easter event is live! Find seasonal items and hunt for nine hidden Easter eggs across the planets, Settings, both inventories and Upgrades.',image:art+'easter/easter/easterstory.webp',eligible:game=>rules.active(game)==='easter'});
    window.DogeMinerStories.registerNarrative({id:'eggz21',title:'EGG HUNTER',body:'You found every hidden Easter egg and discovered a GIANT GOLDEN EGG! Your Easter income multiplier is doubled.',image:art+'easter/easter/icons/dogecoin_egg_large.webp',eligible:game=>rules.active(game)==='easter'&&game.seasonal?.easter.count===9&&!game.seasonal.easter.golden});
})();
