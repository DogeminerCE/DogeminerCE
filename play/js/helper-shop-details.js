// Source per-helper shop income and tab-scoped DPS hints. No reward/stat mutation.
(function () {
    'use strict';
    const proto=DogeMinerGame.prototype;
    const themes={"earth":["#fffae7","#dea435","#111111"],"moon":["#c2e2fd","#6697d8","#163586"],"mars":["#9c4242","#5f1812","#efeede"],"jupiter":["#fffae7","#dea435","#111111"],"titan":["#fdd99c","#91641a","#734600"]};
    let active=null;
    const closing=new Set();
    function calculate(base,incomeMultiplier=1,bonus=1){
        const multiplier=Number((incomeMultiplier*bonus).toFixed(2)),total=base*multiplier;
        return {base,multiplier,total,added:total-base};
    }
    function short(game,value){return value>100?game.formatNumber(value):exact(value);}
    // Source _K(value,1) trims, rather than rounds, its single decimal place.
    function exact(value){
        const billions=value>1e13;if(billions)value/=1e9;if(!Number.isFinite(value))return 'Infinity';
        value=Math.round(1e7*value)/1e7;
        const fraction=Math.round(1e7*(value-Math.floor(value)))/1e7,digit=(fraction.toString()+'0000000').slice(2,3);
        return Math.floor(value).toLocaleString('en-US',{maximumFractionDigits:0})+(parseInt(digit,10)?'.'+digit:'')+(billions?' Billion':'');
    }
    proto.getHelperShopDps=function(type){
        const helper=window.shopManager?.getCurrentHelperUpgradeInfo(type),fallback=this.getHelperData?.(type);
        if(!helper&&!fallback)return null;
        const base=helper?.dps??fallback.baseDps;
        if(!Number.isFinite(base)||base<0)return null;
        const data=calculate(base,this.playerStats?.helperDpsMultiplier??1,this.bonusCoinBuffMultiplier??1);
        return {...data,name:helper?.name||fallback.name,type};
    };
    function close(immediate=false){
        if(immediate)for(const old of [...closing]){old.exit?.cancel();old.node.remove();closing.delete(old);}
        const view=active;if(!view)return;active=null;clearInterval(view.timer);view.animation?.cancel();view.anchor.removeAttribute('aria-describedby');view.anchor.setAttribute('aria-expanded','false');
        if(immediate||!view.node.animate){view.node.remove();return;}
        view.node.style.pointerEvents='none';view.node.setAttribute('aria-hidden','true');view.animation?.cancel();
        const animation=view.node.animate([{scale:'1 1',opacity:1},{scale:'.05 1',opacity:0}],{duration:matchMedia('(prefers-reduced-motion:reduce)').matches?100:200,easing:'ease-in',fill:'forwards'});
        view.exit=animation;closing.add(view);
        const remove=()=>{view.node.remove();closing.delete(view);};animation.onfinish=remove;setTimeout(remove,250);
    }
    function layout(view){
        const box=view.anchor.getBoundingClientRect(),hint=view.node,margin=8;
        const width=hint.offsetWidth,height=hint.offsetHeight,center=box.left+box.width/2;
        const left=Math.max(margin,Math.min(innerWidth-width-margin,center-width/2));
        const preferred=box.bottom+9,top=preferred+height<=innerHeight-margin?preferred:Math.max(margin,box.top-height-9);
        Object.assign(hint.style,{left:left+'px',top:top+'px'});
    }
    function render(view,data){
        const signature=JSON.stringify([data.name,data.base,data.total]);if(signature===view.signature)return;view.signature=signature;
        view.node.replaceChildren();
        const title=document.createElement('strong');title.textContent=data.name;
        const total=document.createElement('strong');total.textContent=exact(data.total)+' ĐPS';view.node.append(title,total);
        if(data.added>0){
            const base=document.createElement('em');base.textContent=exact(data.base)+' BASE ĐPS';
            const added=document.createElement('em');added.className='helper-dps-added';added.textContent='+'+exact(data.added)+' ĐPS FROM STATS';view.node.append(base,added);
        }
        layout(view);
    }
    proto.updateHelperShopDps=function(){
        const cache=new Map();
        for(const anchor of document.querySelectorAll('[data-helper-dps]')){
            const type=anchor.dataset.helperDps;if(!cache.has(type))cache.set(type,this.getHelperShopDps(type));const data=cache.get(type);if(!data)continue;
            const text=short(this,data.total)+' ĐPS';if(anchor.textContent!==text)anchor.textContent=text;
            const label=data.name+': '+text+' per helper. Show breakdown.';if(anchor.getAttribute('aria-label')!==label)anchor.setAttribute('aria-label',label);
        }
        if(active){
            if(this.isCutscenePlaying||this.isStoryOpen||this.isBetaReportOpen||this.isOfflineReportOpen||document.querySelector('.switcher-modal.active,.dia-mission-modal.active,.dia-warning-modal.active')||!active.anchor.isConnected||active.planet!==this.currentLevel||active.epoch!==(this._currencyFlightEpoch||0)||this.hintsEnabled===false||!active.anchor.getClientRects().length)return close(true);
            const data=cache.get(active.anchor.dataset.helperDps);if(data)render(active,data);else close(true);
        }
    };
    proto.showHelperDpsDetails=function(anchor){
        if(this.hintsEnabled===false||!anchor?.isConnected)return false;
        const data=this.getHelperShopDps(anchor.dataset.helperDps);if(!data)return false;
        if(active?.anchor===anchor){close();return false;}close(true);
        const node=document.createElement('div');node.id='helper-dps-details';node.className='helper-dps-details';node.setAttribute('role','tooltip');
        const colors=themes[this.currentLevel]||themes.earth;
        node.style.setProperty('--hint-fill',colors[0]);node.style.setProperty('--hint-stroke',colors[1]);node.style.setProperty('--hint-color',colors[2]);
        document.body.append(node);active={node,anchor,planet:this.currentLevel,epoch:this._currencyFlightEpoch||0};
        active.timer=setInterval(()=>this.updateHelperShopDps(),200);
        anchor.setAttribute('aria-expanded','true');anchor.setAttribute('aria-describedby',node.id);render(active,data);
        if(node.animate)active.animation=node.animate([{scale:'.7',opacity:0},{scale:'1',opacity:1}],{duration:matchMedia('(prefers-reduced-motion:reduce)').matches?160:700,easing:'cubic-bezier(.34,1.56,.64,1)'});
        window.audioManager?.playSound('notification');return true;
    };
    const reset=proto.resetFieldLootPresentation;
    proto.resetFieldLootPresentation=function(...args){close(true);return reset.apply(this,args);};
    document.addEventListener('click',event=>{
        const anchor=event.target.closest?.('[data-helper-dps]');
        if(anchor){event.stopPropagation();window.game?.showHelperDpsDetails(anchor);}else close();
    });
    document.addEventListener('pointerdown',event=>{if(active&&!event.target.closest?.('[data-helper-dps],.helper-dps-details'))close();},true);
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&active){event.preventDefault();event.stopImmediatePropagation();close();}},true);
    document.addEventListener('scroll',()=>close(true),true);window.addEventListener('resize',()=>close(true));window.addEventListener('blur',()=>close(true));
    window.DogeMinerHelperShopDetails=Object.freeze({calculate,short,exact,themes,close});
})();
