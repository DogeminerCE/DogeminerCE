// Source holiday calendar, saved hunt progress and event-only item pools.
(function(root){
    'use strict';
    const EGGS=[1,2,3,4,5,'setting','inv1','inv2','upgrade'];
    const POOLS={
        easter:{pickaxe:['bunny','basket','candlepick','islandstatue'],fortune:['stonedoge','easterfire','easterfntn','eggbskt','bronzeegg','easterisland','flowerbasket','rainbowegg','silveregg']},
        halloween:{pickaxe:['batwand','wand','broom'],fortune:['apple','witchrune','mummy','monster','brain']},
        xmas:{pickaxe:['redcane','pinkcane','xmastree'],fortune:['xmascoin','babydoge','danktruck','dogecola','dogegrinch','elfdoge','santashobbe']}
    };
    const BACKGROUNDS={easter:['easterbg3','bg1','easterbg','bg-new','easterbg2'],halloween:Array.from({length:9},(_,i)=>'halloween_'+String(i+1).padStart(3,'0')),xmas:['wintermoon','winter2','winter3','winter4','winter5']};
    function calendar(date=new Date(),hash=root.location?.hash||''){
        if(hash.includes('noholiday'))return 0;
        const m=date.getMonth(),d=date.getDate();
        return (m===2&&d>=31)||(m===3&&d<=8)?'easter':m===9&&d>=24?'halloween':m===11&&d>=15?'xmas':0;
    }
    function hunt(raw){
        if(raw==null)return {found:[],count:0,golden:false};
        const found=raw.found??[],count=raw.count??raw.eh??0,golden=raw.golden??(raw.fg===1);
        if(!Array.isArray(found)||found.some(id=>!EGGS.includes(id))||new Set(found).size!==found.length
            ||!Number.isInteger(count)||count<0||count>9||count<found.length||typeof golden!=='boolean'
            ||(raw.fg!=null&&![0,1].includes(raw.fg))||(golden&&count!==9))throw new Error('Easter hunt progress is invalid.');
        return {found:[...found],count,golden};
    }
    function normalize(raw,legacy){
        if(raw!=null&&(raw.version!==1||typeof raw.enabled!=='boolean'))throw new Error('This holiday-progress version is not supported.');
        return {version:1,enabled:raw?.enabled??legacy?.sourceSettings?.holidays!==false,easter:hunt(raw?.easter??legacy?.easter)};
    }
    function active(game={},date){
        if(game.seasonal?.enabled===false||(!game.seasonal&&game.dm2Import?.sourceSettings?.holidays===false))return 0;
        // Deterministic event previews exist only in opt-in, private test storage.
        if(root.CEParityTesting?.active){
            const preview=game._seasonalPreview||root.localStorage?.getItem?.('parity:seasonal-event');
            if(preview==='none')return 0;if(Object.hasOwn(POOLS,preview))return preview;
        }
        return calendar(date);
    }
    function ids(game,kind){return POOLS[active(game)]?.[kind]||[];}
    function backgrounds(game){return BACKGROUNDS[active(game)]?.map(name=>'assets/backgrounds/'+name+'.webp')||null;}
    function income(game){
        const event=active(game);if(!event)return {multiplier:1,flat:0};
        const spirit=Number(game.playerStats?.holidaySpirit)||0,away=game.currentLevel&&game.currentLevel!=='earth';
        const eggs=game.seasonal?.easter||hunt(game.dm2Import?.easter);
        return {flat:away&&spirit>1?Math.round(Math.sqrt(spirit)):0,
            multiplier:event==='easter'&&eggs.count>0?Number((1+eggs.count/100).toFixed(2))*(eggs.golden?2:1):1};
    }
    function installTemplates(kind,factory){
        for(const [season,pools]of Object.entries(POOLS))for(const id of pools[kind]){
            const item=root.DogeMinerDM2ImportData?.catalog?.[kind]?.[id];
            if(!item)throw new Error('Missing holiday item '+id);
            factory.templates[item.templateId]={id:item.templateId,name:item.name,description:item.description||'',rarity:item.rarity,
                balanceDefinitionId:id,season,planetOfOrigin:'universal',isProtected:kind==='fortune',
                ...(kind==='pickaxe'?{idleSprite:item.sprite}:{sprite:item.sprite})};
        }
    }
    root.DogeMinerSeasonal=Object.freeze({calendar,normalize,hunt,active,ids,backgrounds,income,installTemplates,eggs:Object.freeze(EGGS),pools:POOLS});
})(window);
