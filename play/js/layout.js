// Explicit CE layout profiles; Auto keeps the existing responsive layout.
(function(root){
    'use strict';
    const MODES=['auto','desktop','tablet','phone'];
    const PROFILES={desktop:{width:1200,height:590,left:630,right:510},tablet:{width:1024,height:700,left:639,right:380}};
    function normalize(raw,legacy){
        if(raw!=null&&(raw.version!==1||!MODES.includes(raw.mode)))throw new Error('This layout setting is not supported.');
        const imported=legacy?.sourceSettings?.layout;
        return {version:1,mode:raw?.mode||(MODES.includes(imported)?imported:'auto')};
    }
    // CSS media queries otherwise keep responding to the physical phone while
    // its owner explicitly chooses a desktop/tablet canvas. Other conditions
    // (motion, pointer, orientation, height) continue to use the actual device.
    // Kept separate so the adapter is testable without a DOM/CSSOM.
    function adaptMedia(text,width){
        return text.replace(/\(\s*(min|max)-width\s*:\s*([\d.]+)px\s*\)/gi,(_all,side,n)=>{
            const matches=side.toLowerCase()==='min'?width>=Number(n):width<=Number(n);
            return matches?'(min-width:0px)':'(min-width:100000px)';
        });
    }
    let originalSheet=null,profileStyle=null;
    const cache=new Map();
    function cssFor(width){
        if(cache.has(width))return cache.get(width);
        const link=document.querySelector('link[href^="styles.css"]');
        originalSheet=link?.sheet;if(!originalSheet)throw new Error('Layout styles are still loading. Try again.');
        function serialize(rules){return [...rules].map(rule=>{
            if(rule.type===4)return '@media '+adaptMedia(rule.conditionText,width)+'{'+serialize(rule.cssRules)+'}';
            if(rule.cssRules?.length&&rule.type!==7&&rule.type!==1){const head=rule.cssText.slice(0,rule.cssText.indexOf('{'));return head+'{'+serialize(rule.cssRules)+'}';}
            return rule.cssText;
        }).join('\n');}
        const css=serialize(originalSheet.cssRules);cache.set(width,css);return css;
    }
    function sync(game){
        for(const id of ['layout-mode','mobile-layout-mode','layout-quick-mode']){
            const input=document.getElementById(id);if(!input)continue;input.value=game.layoutPreference?.mode||'auto';
            if(!input.dataset.layoutBound){input.dataset.layoutBound='1';input.addEventListener('change',()=>game.setLayoutMode(input.value));}
        }
    }
    function apply(game){
        const mode=game.layoutPreference?.mode||'auto',profile=PROFILES[mode],container=document.getElementById('game-container');
        if(!container)return;
        document.body.dataset.layout=mode;document.body.classList.toggle('force-mobile',mode==='phone');
        const virtualWidth=profile?.width||(mode==='phone'?Math.min(768,root.innerWidth):0);
        if(virtualWidth){
            const css=cssFor(virtualWidth);
            if(!profileStyle){profileStyle=document.createElement('style');profileStyle.id='ce-layout-styles';document.head.append(profileStyle);}
            profileStyle.textContent=css;originalSheet.disabled=true;
        }else{
            if(originalSheet)originalSheet.disabled=false;profileStyle?.remove();profileStyle=null;
        }
        if(profile){
            const scale=Math.min(1,(root.innerWidth-12)/profile.width,(root.innerHeight-48)/profile.height);
            Object.assign(container.style,{width:profile.width+'px',maxWidth:'none',height:profile.height+'px',top:'20px',left:'50%',transform:'translateX(-50%) scale('+Math.max(.1,scale)+')',transformOrigin:'center top',flexDirection:'row',paddingTop:'0'});
            const left=document.getElementById('left-panel'),right=document.getElementById('right-panel');
            if(left)Object.assign(left.style,{width:profile.left+'px',height:'100%',flex:'none'});
            if(right)Object.assign(right.style,{width:profile.right+'px',display:'flex'});
        }else{
            for(const key of ['width','maxWidth','height','top','left','transform','transformOrigin','flexDirection','paddingTop'])container.style[key]='';
            for(const id of ['left-panel','right-panel']){const el=document.getElementById(id);if(el)for(const key of ['width','height','flex','display'])el.style[key]='';}
        }
        let quick=document.getElementById('layout-quick-control');
        if(profile&&!quick){
            quick=document.createElement('label');quick.id='layout-quick-control';quick.append(document.createTextNode('Layout '));
            const select=document.createElement('select');select.id='layout-quick-mode';select.setAttribute('aria-label','Game layout');
            for(const value of MODES){const option=document.createElement('option');option.value=value;option.textContent=value[0].toUpperCase()+value.slice(1);select.append(option);}quick.append(select);document.body.append(quick);
        }
        if(quick)quick.hidden=!profile;
        sync(game);game.updateMobileHelperBar?.();
        if(mode==='phone')window.uiManager?.updateMobileShopContent?.();
        game.clearHiddenEgg?.();game.renderSeasonal?.();
    }
    root.DogeMinerLayout=Object.freeze({normalize,apply,sync,adaptMedia,modes:Object.freeze(MODES),profiles:PROFILES});
    if(typeof DogeMinerGame==='undefined')return;
    const proto=DogeMinerGame.prototype;
    proto.getLayoutForSave=function(){return normalize(this.layoutPreference);};
    proto.restoreLayout=function(raw,legacy){
        this.layoutPreference=normalize(raw,legacy);
        if(raw==null&&!legacy?.sourceSettings?.layout&&localStorage.getItem('forceMobileUI')==='1')this.layoutPreference.mode='phone';
        apply(this);
    };
    proto.setLayoutMode=function(mode){
        if(!MODES.includes(mode))return false;
        const before=this.getLayoutForSave();this.layoutPreference={version:1,mode};
        if(window.saveManager?.commitStoryProgress?.()!==true){this.layoutPreference=before;sync(this);return false;}
        try{apply(this);}catch(error){this.layoutPreference=before;window.saveManager?.commitStoryProgress?.();apply(this);this.showNotification(error.message);return false;}
        return true;
    };
    const mobile=proto.isMobileDevice;
    proto.isMobileDevice=function(){const mode=this.layoutPreference?.mode;return mode==='phone'?true:PROFILES[mode]?false:mobile.call(this);};
    root.addEventListener('resize',()=>{if(root.game?.layoutPreference)apply(root.game);});
})(window);
