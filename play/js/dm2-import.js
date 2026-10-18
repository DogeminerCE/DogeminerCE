// Read-only conversion. Applying a reviewed draft is owned by SaveManager.
(function () {
    'use strict';
    const PLANETS=['earth','moon','mars','jupiter','titan'];
    const clone=value=>JSON.parse(JSON.stringify(value));
    function number(value,label,fallback=0,integer=false){
        if(value===undefined)return fallback;
        if(!Number.isFinite(value)||value<0||(integer&&!Number.isSafeInteger(value)))throw new Error('Invalid '+label+'.');
        return value;
    }
    function array(value,label){if(value===undefined)return [];if(!Array.isArray(value))throw new Error('Invalid '+label+'.');return value;}
    function fingerprint(text){let a=2166136261,b=5381;for(let i=0;i<text.length;i++){a=Math.imul(a^text.charCodeAt(i),16777619);b=Math.imul(b,33)^text.charCodeAt(i);}return(a>>>0).toString(16).padStart(8,'0')+(b>>>0).toString(16).padStart(8,'0');}
    function header(raw){
        if(!raw||typeof raw!=='object'||Array.isArray(raw))return false;
        return Number.isInteger(raw.version)&&raw.version>=1&&raw.version<=4&&Number.isInteger(raw.timeline)&&raw.timeline>=1&&Number.isFinite(raw.alltimecoins)&&raw.alltimecoins>=0;
    }
    function decode(text){
        if(typeof text!=='string'||!text.length||text.length>10*1024*1024)throw new Error('Choose a save file smaller than 10 MB.');
        const raw=text.replace(/^\uFEFF/,'');
        const attempts=[['JSON',()=>raw],['DM2 Base64',()=>window.DogeMinerLZString.decompressFromBase64(raw.trim())],['DM2 UTF16',()=>window.DogeMinerLZString.decompressFromUTF16(raw)],['URI JSON',()=>decodeURIComponent(raw.trim())]];
        for(const [encoding,read]of attempts){
            try{
                const content=read();if(typeof content!=='string'||content.length>64*1024*1024)continue;
                const data=JSON.parse(content);if(data&&typeof data==='object'&&!Array.isArray(data))return{data,encoding};
            }catch(_){}
        }
        throw new Error('This file is not a readable CE or Dogeminer 2 save.');
    }
    function item(kind,row,index,hash,notes){
        if(!Array.isArray(row)||row.length<2||!['string','number'].includes(typeof row[0]))throw new Error('Invalid '+kind+' entry.');
        const id=String(row[0]),data=window.DogeMinerDM2ImportData,definition=Object.hasOwn(data.catalog[kind],id)?data.catalog[kind][id]:null;
        const meta=definition||{templateId:'dm2_'+kind+'_'+id,name:'Imported '+kind+' '+id,rarity:'common',sprite:'assets/general/dogecoin_70x70.webp',protected:kind==='fortune'};
        if(!definition)notes.add('Unrecognized item IDs keep their original stats and a placeholder icon.');
        const stats=[];let dpc=0;
        for(const stat of array(row[1],'item stats')){
            if(!Array.isArray(stat)||typeof stat[0]!=='string'||stat[0].length>100||!Number.isFinite(stat[1]))throw new Error('Invalid item stat.');
            const [key,value]=stat;if(key==='click'&&kind==='pickaxe'){dpc=number(value,'pickaxe DPC');continue;}
            const attribute=window.DogeMinerBalance.getAttributeMetadata({balanceKey:key});
            const core=['luck','loot','wow','crit','income','dps','persec','dpsp','rockets','mystery','spirit'].includes(key);
            stats.push({name:key,balanceKey:key,displayName:attribute.title||key,value,indicator:attribute.value==='%'?'+%':attribute.value==='ps'?'- %':attribute.value==='-'?'-':'+',isCore:core,category:attribute.type||'tertiary'});
        }
        const result={instanceId:'dm2_'+hash+'_'+kind+'_'+index,templateId:meta.templateId,name:meta.name,description:meta.description||'Imported from Dogeminer 2.',rarity:meta.rarity,stats,balanceVersion:window.DogeMinerBalance.VERSION,balanceDefinitionId:id,planetOfOrigin:meta.planet||'earth',sourceDm2Stats:clone(row[1]),sourceDm2Id:id};
        if(kind==='pickaxe')Object.assign(result,{baseDPC:dpc,idleSprite:meta.sprite,isPaw:id==='paw',isStaffOfSundoge:['staff','staffascended'].includes(id)});
        else Object.assign(result,{sprite:meta.sprite,isProtected:!!meta.protected,isSeasonal:!!meta.season,isSoulbound:id==='pbdg',isSuperFortune:/^super\d*$/.test(id),isDiaBadge:/^dia(?:loot|luck|wow)$/.test(id)});
        return result;
    }
    function convert(raw,{now=Date.now(),text=JSON.stringify(raw),field={width:626,height:586},reviewOnly=false}={}){
        if(!header(raw))throw new Error('This is not a supported Dogeminer 2 save (versions 1–4).');
        if(raw.layout==='desktop')field={width:626,height:586};
        if(raw.layout==='tablet')field={width:635,height:696};
        const data=window.DogeMinerDM2ImportData,hash=fingerprint(text),notes=new Set(),timeline=number(raw.timeline,'timeline',1,true);
        if(timeline>10000)throw new Error('This timeline count exceeds the supported import range.');
        if(raw.onmission)throw new Error('Finish your D.I.A. mission in Dogeminer 2, then export again.');
        const save={version:'1.0.0',balanceVersion:window.DogeMinerBalance.VERSION,timestamp:now,timelineNumber:timeline,
            dogecoins:number(raw.coins,'Dogecoins'),totalMined:number(raw.alltimecoins,'lifetime earnings'),totalClicks:number(raw.clicks,'clicks',0,true),
            dogediamonds:number(raw.diamonds,'Dogediamonds'),dogediamondsEverObtained:number(raw.alltimediamonds,'earned Dogediamonds',number(raw.diamonds,'Dogediamonds')),
            currentLevel:PLANETS[number(raw.level,'planet',1,true)-1],pickaxeInventory:[],fortuneInventory:[],helperUpgradeLevels:{},helperUpgradeOffers:{},
            planetRockData:{},dogebagStacks:{},diamondStacks:{},settings:{soundEnabled:raw.sounds!==false,musicEnabled:raw.music!==false,rockSoundsEnabled:raw.rocksounds!==false,backgroundAudioEnabled:raw.inactivesnds!==false,lessEffects:raw.gfx===false,limitFps:raw.limitfps===true,storiesEnabled:raw.popups!==false,hintsEnabled:raw.hints!==false,newsEnabled:raw.news!==false,autoSaveEnabled:true,autoPlaceHelpers:true},
            records:{highestcrit:number(raw.records?.highestcrit,'record critical hit')},statistics:{totalPlayTime:0,startTime:now,helpersBought:0,pickaxesBought:0,achievements:[]},
            hasSeenDogebagIntro:true,cutscenes:{moonLaunch:raw.done?.seenmoonvideo===true},diaMissionSeenOnce:timeline>1||raw.contacted===true,hasReachedJupiterEver:false,
            mysteryBoxObtained:raw.mbfound===true,mysteryBoxOpenCount:number(raw.mbtot,'Mystery Box count',0,true),mysteryBoxTimerRemaining:number(raw.mb,'Mystery Box timer'),mysteryBoxLastSaveTime:now,
            searchdogeSlot3Unlocked:raw.unlocked?.upgradeslots?.[2]===1,bonusCoinSeenLevel:number(raw.maxbonuscoin,'Bonus Coin discovery'),
            dualWieldDiscovered:raw.dualWieldDiscovered===true,sundogeFusionDiscovered:raw.sundogeFusionDiscovered===true,sundogeDiscoveryPending:raw.sundogeDiscoveryPending===true,
        };
        if(!save.currentLevel)throw new Error('This save uses a planet that CE does not support.');
        save.pickaxeInventory=array(raw.pickaxes,'pickaxes').map((row,i)=>item('pickaxe',row,i,hash,notes));
        save.fortuneInventory=array(raw.fortunes,'fortunes').map((row,i)=>item('fortune',row,i,hash,notes));
        if(!save.pickaxeInventory.length)throw new Error('The source save has no pickaxe.');
        const equipped=number(raw.equipped?.pick,'equipped pickaxe index',save.pickaxeInventory.length-1,true);
        save.equippedPickaxeId=save.pickaxeInventory[Math.min(equipped,save.pickaxeInventory.length-1)].instanceId;
        save.maxPickaxeDPC=Math.max(1,...save.pickaxeInventory.map(p=>p.baseDPC));
        save.mysteryBoxObtained ||= save.fortuneInventory.some(f=>f.sourceDm2Id==='mysterybox');
        save.mysteryBoxCycle=number(raw.mbnum,'Mystery Box cycle',0,true);if(save.mysteryBoxCycle>10)throw new Error('Invalid Mystery Box cycle.');
        const categories=['helpers','moonHelpers','marsHelpers','jupiterHelpers','titanHelpers'];
        for(const [i,planet]of PLANETS.entries()){save[categories[i]]=[];save[planet+'PlacedHelpers']=[];save.dogebagStacks[planet]={};}
        let helpers=0;
        for(const row of array(raw.helpers,'helpers')){
            if(!Array.isArray(row)||row.length<4)throw new Error('Invalid helper entry.');
            const def=Object.hasOwn(data.helpers,row[0])?data.helpers[row[0]]:null,count=number(row[1],'helper count',0,true),tier=number(row[2],'helper upgrade tier',0,true);
            if(!def){if(count)throw new Error('Helper '+row[0]+' is not supported; the original save was kept.');continue;}
            if(helpers+count>100000)throw new Error('This save has too many helpers to import in this browser.');
            const planet=PLANETS[number(row[3],'helper planet',1,true)-1];if(!planet||categories[PLANETS.indexOf(planet)]!==def.category)throw new Error('A source helper is assigned to an unsupported planet.');
            helpers+=count;save.helperUpgradeLevels[def.type]=tier;
            for(let i=0;i<count;i++)save[def.category].push({type:def.type,name:def.name,dps:tier?def.upgrades[Math.min(tier,def.upgrades.length)-1]??def.dps:def.dps,owned:i+1});
        }
        const sourceSize=raw.layout==='phone'?[370,536]:raw.layout==='tablet'?[639,700]:[770,756];
        for(const row of array(raw.helperpositions,'helper positions')){
            if(!Array.isArray(row)||!Array.isArray(row[2]))throw new Error('Invalid helper positions.');
            const planet=PLANETS[row[0]-1],def=data.helpers[row[1]];if(!planet||!def)throw new Error('Unsupported helper position.');
            const owned=save[def.category].filter(h=>h.type===def.type),positions=save[planet+'PlacedHelpers'];
            if(row[2].length>owned.length)throw new Error('The source save places more helpers than it owns.');
            for(const [i,p]of row[2].entries()){
                if(!Array.isArray(p)||!Number.isFinite(p[0])||!Number.isFinite(p[1]))throw new Error('Invalid helper position.');
                const size=['miningShibe','moonShibe','partyShibe','roboShibe'].includes(def.type)?30:['moonBase','landerShibe','marsBase','cloudBase','dogeStar','titanBase','altarOfTheSunDoge'].includes(def.type)?90:['superShibe','tardogeis','timeTravelDRex'].includes(def.type)?72:def.type==='infiniteDogebility'?69:60;
                const name=typeof p[3]==='string'?p[3]:(p[3]>0?data[def.names]?.[p[3]]||null:null);
                const record={type:def.type,id:'dm2_'+hash+'_'+row[0]+'_'+row[1]+'_'+i,x:Math.max(10,Math.min(field.width-size-10,p[0]/sourceSize[0]*field.width-size/2)),y:Math.max(60,Math.min(field.height-size-10,p[1]/sourceSize[1]*field.height-size/2)),isMining:true,...(name?{name}:{}),sourceDm2Position:clone(p)};
                positions.push(record);
            }
        }
        save.placedHelpers=save[save.currentLevel+'PlacedHelpers'];
        save.statistics.helpersBought=helpers;
        save.statistics.pickaxesBought=save.pickaxeInventory.length;
        for(const row of array(raw.foundupgrades,'found upgrades')){const planet=PLANETS[row?.[0]-1],def=data.helpers[row?.[1]];if(!planet||!def)throw new Error('Invalid found upgrade.');const offers=save.helperUpgradeOffers[planet]||=[null,null,null];const free=offers.findIndex(x=>x===null);if(free>=0&&!offers.includes(def.type))offers[free]=def.type;}
        const seen=array(raw.seen,'seen stories');if(seen.some(id=>typeof id!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(id))||seen.length>2048)throw new Error('Invalid seen-story history.');
        save.storyProgress={version:1,timeline,seen:[...new Set(seen)],pending:[],extraDps:number(raw.extrapersec,'story DPS'),completionHistoryVersion:1};
        save.lateProgression={version:1,timeline,yoga:seen.includes('foundup1')||(save.helperUpgradeLevels.altarOfTheSunDoge||0)>=1,reallyhardium:seen.includes('figurebp')};
        if(save.lateProgression.reallyhardium)save.lateProgression.yoga=true;
        for(const [planet,entry]of Object.entries(raw.fieldloot||{})){
            const name=PLANETS[Number(planet)-1];if(!name)throw new Error('Unsupported field-loot planet.');
            const bags=array(entry?.bags,'field bag counts');if(bags.length>4)throw new Error('Invalid field bag quality.');
            bags.forEach((n,i)=>{n=number(n,'field bag count',0,true);if(n>100000)throw new Error('This bag stack exceeds CE’s supported save range.');if(n)save.dogebagStacks[name][i]=n;});
            const diamonds=number(entry?.diamonds,'field diamond count',0,true);if(diamonds>999)throw new Error('This diamond stack exceeds CE’s supported save range.');if(diamonds)save.diamondStacks[name]=diamonds;
        }
        const rocks=new Map(array(raw.rocks,'rocks').map(row=>{if(!Array.isArray(row)||!PLANETS[row[0]-1])throw new Error('Invalid rock entry.');return[row[0],number(row[1],'rock level',1,true)];}));
        const pick=save.pickaxeInventory[Math.min(equipped,save.pickaxeInventory.length-1)];
        const income=save.fortuneInventory.reduce((sum,f)=>sum+f.stats.filter(s=>s.balanceKey==='income').reduce((n,s)=>n+s.value/100,0),1);
        const baseDps=save[categories[PLANETS.indexOf(save.currentLevel)]].reduce((n,h)=>n+h.dps,0)*income+pick.stats.filter(s=>s.balanceKey==='dps').reduce((n,s)=>n+s.value,0);
        for(const [i,planet]of PLANETS.entries()){
            const level=Math.max(1,rocks.get(i+1)||1),hp=number(raw.rockvalues?.[i],'rock HP',0);
            const computed=Math.ceil((data.rockBase[i+1]+Math.ceil(2.5*baseDps+Math.ceil(2*pick.baseDPC)))*Math.pow(1.1,level-1));
            if(!Number.isFinite(computed))throw new Error('Source rock durability exceeds the supported range.');
            const maxHP=Math.max(1,hp,computed);save.planetRockData[planet]={rocksBroken:level-1,rockLevel:level,currentHP:hp||maxHP,maxHP};
        }
        save.rocksBroken=number(raw.rocksbroken,'rocks broken',0,true);save.rockLevel=save.planetRockData[save.currentLevel].rockLevel;
        const completed=[];let playSeconds=number(raw.timeplayed,'play time');
        for(let i=0;i<timeline-1;i++){
            const earned=number(raw.timelinealltimecoins?.[i],'past earnings'),seconds=number(raw.timelineplayeds?.[i],'past play time');
            save.totalMined+=earned;playSeconds+=seconds;
            completed.push({timeline:i+1,coins:number(raw.timelinecoins?.[i],'past wallet'),earnedCoins:earned,playTimeMs:seconds*1000,choice:raw.kitlerstats?.[i]===0?'attack':raw.kitlerstats?.[i]===1?'go_home':null,badge:null,diamonds:0,completedAt:0,estimated:true});
        }
        if(!Number.isFinite(save.totalMined)||!Number.isFinite(playSeconds*1000))throw new Error('Source totals exceed the supported range.');
        save.statistics.totalPlayTime=playSeconds;
        save.timelineProgress={version:1,trackingStartedTimeline:1,completed,current:{timeline,earnedCoins:raw.alltimecoins,playTimeMs:number(raw.timeplayed,'play time')*1000,minedAtSync:save.totalMined,estimated:false}};
        save.lootAutomation={version:1,unlocked:timeline>1,enabled:timeline>1&&raw.autopickup===true,pendingUnlock:false,remainingMs:0};
        save.encounters={version:1,caught:raw.done?.caughtcate?1:0,missed:number(raw.missedcates,'missed thieves',0,true),stolen:0,rickReferences:seen.filter(id=>['rmref','rmref2','rmref3'].includes(id)),rickClockMs:0,rickTargetMs:900000};
        notes.add('Current CE progress and the original import are backed up before replacement.');
        notes.add('Stored item rolls are preserved. Import does not award elapsed offline time.');
        notes.add('Rock levels and remaining HP are retained; maximum HP is reconstructed from saved mining power.');
        if(timeline>1)notes.add('Historical mission choices are retained; unavailable badge/reward dates stay unknown.');
        if(!raw.layout)notes.add('Automatic source layout has no saved dimensions; helper positions use the desktop coordinate profile.');
        if(window.DogeMinerSeasonal)window.DogeMinerSeasonal.hunt(raw.easter);
        save.dm2Import={version:1,fingerprint:hash,sourceVersion:raw.version,convertedAt:now,sourceSettings:{layout:raw.layout||false,holidays:raw.holidays!==false,volume:raw.volume,musicvolume:raw.musicvolume},easter:clone(raw.easter||{eh:0,fg:0,found:[]}),sourceHelperPositions:clone(raw.helperpositions||[]),notes:[...notes]};
        for(const key of ['known','unlocked','visited'])for(const location of array(raw[key]?.locations,key+' planets'))if(!Number.isInteger(location)||location<1||location>5)throw new Error('Unsupported '+key+' planet.');
        if(reviewOnly)return {format:'Dogeminer 2',fingerprint:hash,summary:{timeline,coins:save.dogecoins,diamonds:save.dogediamonds,helpers,pickaxes:save.pickaxeInventory.length,fortunes:save.fortuneInventory.length},notes:[...notes]};
        save.worldDiscovery=window.DogeMinerWorldDiscovery.legacy(save);
        const locations=(values,label)=>array(values,label).map(n=>{if(!Number.isInteger(n)||n<1||n>5)throw new Error('Unsupported '+label+'.');return PLANETS[n-1];});
        save.worldDiscovery.known=[...new Set(['earth','moon',...locations(raw.known?.locations,'known planets'),...save.worldDiscovery.known])];
        save.worldDiscovery.unlocked=[...new Set(['earth',save.currentLevel,...locations(raw.unlocked?.locations,'unlocked planets'),...save.worldDiscovery.unlocked])];
        save.worldDiscovery.visited=[...new Set(['earth',save.currentLevel,...locations(raw.visited?.locations,'visited planets')])];
        if(array(raw.helpersunlocked,'unlocked helpers').includes(6))save.worldDiscovery.events.rig.stage='ready';
        if(raw.contacted===true)save.worldDiscovery.events.contacted=true;
        for(const [key,fieldKey,story]of[['moon','tmap','moon2'],['mars','drawing','marsdraw'],['blueprint','bp','foundbp']])if(raw.found?.[fieldKey]){
            const artifact=save.worldDiscovery.artifacts[key];artifact.stage=seen.includes(story)?'collected':'field';artifact.readyAt=0;
        }
        save.unlockedLevels=[...save.worldDiscovery.unlocked];save.hasReachedJupiterEver=save.worldDiscovery.visited.some(p=>['jupiter','titan'].includes(p));
        window.BetaSaveMigration.validate(save);
        window.DogeMinerStories?.normalize(save.storyProgress,timeline);
        window.DogeMinerWorldDiscovery.normalize(save.worldDiscovery,save);
        window.DogeMinerLateProgression?.normalize(save.lateProgression,save);
        return {saveData:save,format:'Dogeminer 2',fingerprint:hash,summary:{timeline,coins:save.dogecoins,diamonds:save.dogediamonds,helpers,pickaxes:save.pickaxeInventory.length,fortunes:save.fortuneInventory.length},notes:[...notes]};
    }
    function prepare(text,options={}){
        const {data,encoding}=decode(text);
        if(header(data)||typeof data.version==='number')return {...convert(data,{...options,text}),encoding};
        window.BetaSaveMigration.validate(data);
        window.DogeMinerLayout?.normalize(data.layout,data.dm2Import);
        window.DogeMinerSeasonal?.normalize(data.seasonal,data.dm2Import);
        if(data.balanceVersion&&data.balanceVersion!==window.DogeMinerBalance.VERSION)throw new Error('This CE balance version is not supported.');
        return {saveData:clone(data),format:'CE',encoding,fingerprint:fingerprint(text),summary:{timeline:data.timelineNumber||1,coins:data.dogecoins,pickaxes:data.pickaxeInventory?.length||0,fortunes:data.fortuneInventory?.length||0},notes:['Your current CE progress and the original import are backed up before replacement.']};
    }
    function inspect(text){const result=prepare(text,{reviewOnly:true});const {saveData,...review}=result;return review;}
    function receipt(raw){if(raw==null)return null;if(raw.version!==1||typeof raw.fingerprint!=='string'||!Array.isArray(raw.notes))throw new Error('Unsupported DM2 import receipt.');return clone(raw);}
    function requestReceipt(raw){if(raw==null)return null;if(raw.version!==1||typeof raw.requestId!=='string'||typeof raw.fingerprint!=='string'||!/^[-a-zA-Z0-9_]{1,200}$/.test(raw.requestId)||!/^[a-f0-9]{16}$/.test(raw.fingerprint))throw new Error('Unsupported import receipt.');return clone(raw);}
    async function review(message,options){
        const controller=window.controllerManager;
        if(!controller)return gameConfirm(message,options);
        if(controller._dialogOpen)throw new Error('Close the current dialog before importing.');
        const previous=document.activeElement,modal=document.getElementById('controller-dialog');
        const key=event=>{
            event.stopImmediatePropagation();
            if(event.key==='Escape'){event.preventDefault();controller._closeDialog(false);}
            else if(event.key==='Tab'){
                const choices=[...modal.querySelectorAll('button,[tabindex="0"]')].filter(n=>!n.disabled&&n.getClientRects().length);
                const index=choices.indexOf(document.activeElement),next=(index+(event.shiftKey?-1:1)+choices.length)%choices.length;
                if(choices.length){event.preventDefault();choices[next].focus();}
            }
        };
        window.game?.releaseDrill?.();if(window.game){window.game.isMouseDown=false;window.game.isSpaceDown=false;window.game.endSwing?.();}
        const result=controller.showDialog(message,options);document.addEventListener('keydown',key,true);
        document.getElementById('controller-dialog-confirm')?.focus({preventScroll:true});
        try{return await result;}finally{document.removeEventListener('keydown',key,true);if(previous?.isConnected)previous.focus?.({preventScroll:true});}
    }
    window.DogeMinerDM2Import=Object.freeze({decode,header,convert,prepare,inspect,fingerprint,receipt,requestReceipt,review});
})();
