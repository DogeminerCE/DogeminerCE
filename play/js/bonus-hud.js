// Source Bonus Coin row and feedback; saved buffs remain owned by the game.
(function(){
    'use strict';
    const states=new WeakMap();
    const hourglass='<svg class="bcb-hourglass" viewBox="-.75 -.75 12.5 14.5" aria-hidden="true"><g fill="#c9fcd0" stroke="#9e671e" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"><path d="M1 2H10L5.5 6.5Z M1 11H10L5.5 6.5Z"/><path d="M0 0H11V2H0Z M0 11H11V13H0Z"/></g></svg>';
    function formatDuration(ms){
        const value=Number(ms);if(!Number.isFinite(value)||value<=0)return '0.0 s';
        const tenths=Math.ceil(value/100),seconds=Math.floor(tenths/10);
        return seconds+'.'+(tenths-seconds*10)+' s';
    }
    function state(game){if(!states.has(game))states.set(game,{active:false,key:null});return states.get(game);}
    function rows(){return{wallet:document.getElementById('dogecoin-amount')?.parentElement,
        dps:document.getElementById('dps-amount')?.parentElement};}
    function setActive(game,active,s){
        const {wallet,dps}=rows(),icon=dps?.querySelector('.stat-icon');
        wallet?.classList.toggle('bonus-wallet-active',active);
        if(icon){const src='assets/general/persec_icon'+(active?'_bonus':'')+'.webp';if(icon.getAttribute('src')!==src)icon.src=src;}
        if(s.tinted===active&&s.planet===game.currentLevel)return;
        s.tinted=active;s.planet=game.currentLevel;
        const amount=document.getElementById('dps-amount');if(!amount)return;
        amount.style.backgroundColor='';
        if(active){const color=getComputedStyle(amount).backgroundColor.match(/[\d.]+/g);
            if(color?.length>=3)amount.style.backgroundColor=`rgba(${[254,244,204].map((t,i)=>Math.round(Number(color[i])*t/255)).join(',')},${color[3]??1})`;}
    }
    function render(game){
        const s=state(game),now=Date.now(),end=game.bonusCoinBuffEndTime;
        const active=game.bonusCoinBuffMultiplier>1&&Number.isFinite(end)&&end>now;
        setActive(game,active,s);
        if(!active){document.getElementById('bonus-coin-buff')?.remove();s.active=false;s.key=null;return;}
        const key=[game.bonusCoinClaimCount,end,game.bonusCoinBuffMultiplier,game.bonusCoinBuffTier].join(':');
        if(s.key!==key){
            s.revealAt=s.active?now+500:now;s.key=key;s.active=true;
            document.getElementById('bonus-coin-buff')?.remove();
        }
        if(now<s.revealAt)return;
        let node=document.getElementById('bonus-coin-buff');
        if(!node){const parent=document.getElementById('stats-display');if(!parent)return;
            node=document.createElement('div');node.id='bonus-coin-buff';node.className='bonus-coin-buff';
            node.innerHTML='<img class="bcb-icon" alt=""><div class="bcb-details"><span class="bcb-mult"></span><div class="bcb-timer">'+hourglass+'<span class="bcb-time"></span></div></div>';
            parent.append(node);}
        const tier=game.getBonusCoinTiers()[game.bonusCoinBuffTier]||game.getCurrentBonusCoinTier();
        const boost=Math.round((game.bonusCoinBuffMultiplier-1)*100),src=`assets/general/Bonus Coins/${tier.sprite}`;
        const icon=node.querySelector('.bcb-icon');if(icon.getAttribute('src')!==src)icon.src=src;
        node.querySelector('.bcb-mult').textContent='+'+boost+'%';
        node.querySelector('.bcb-time').textContent=formatDuration(end-now);
        node.title=`${tier.name}: +${boost}% DPS and mining damage`;
    }
    function showFeedback(game,text){
        if(!game._bootComplete||game.isCutscenePlaying||game.isTransitioning)return;
        const s=state(game);clearTimeout(s.feedbackTimer);s.feedback?.remove();
        const parent=rows().dps;if(!parent)return;
        const node=document.createElement('div');node.className='bonus-hud-feedback';node.textContent=text;
        node.setAttribute('role','status');parent.append(node);s.feedback=node;
        s.feedbackTimer=setTimeout(()=>{node.remove();if(s.feedback===node)s.feedback=null;},1110);
    }
    function clear(game){
        const s=state(game);clearTimeout(s.feedbackTimer);s.feedback?.remove();
        document.getElementById('bonus-coin-buff')?.remove();setActive(game,false,s);states.delete(game);
    }
    window.DogeMinerBonusHud=Object.freeze({render,showFeedback,clear,formatDuration});
})();
