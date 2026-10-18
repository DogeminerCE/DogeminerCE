// Source hold-to-Buy-Max gesture and 600ms purchase burst, using CE prices/placement.
(function () {
    'use strict';
    const requestWorldFrame=callback=>window.DogeMinerFrameClock?window.DogeMinerFrameClock.request(callback):requestAnimationFrame(callback);
    const cancelWorldFrame=id=>window.DogeMinerFrameClock?window.DogeMinerFrameClock.cancel(id):cancelAnimationFrame(id);
    const proto = DogeMinerGame.prototype;
    const config = Object.freeze({ holdMs:500, chargeDelayMs:160, holdSlop:14, pickRise:8, pickRiseTouch:12, lingerMs:1600, maxPerGesture:100, burstMs:600 });
    const sound = (name, volume, rate=1) => {
        const audio=window.audioManager, clip=audio?.soundEffects?.[name==='pop1'?'inventoryOpen':name];
        if(!audio?.soundEnabled || !clip?.play)return;
        const id=clip.play(); if(volume!==undefined)clip.volume?.(volume,id);clip.rate?.(rate,id);
    };
    const label = count => count >= 2 ? `BUY ${count} (MAX)` : 'BUY MAX';
    const burstPlan = count => { const steps = Math.max(1,Math.min(count,Math.round(config.burstMs/45))); return { steps, interval:steps>1?config.burstMs/(steps-1):0 }; };
    proto.canBulkBuyHelper = function (type) {
        const data = window.shopManager?.shopData?.[this.getHelperCategoryForLevel()]?.[type];
        if (!data || this.isCutscenePlaying || this.isStoryOpen || this.isBetaReportOpen || this.isTransitioning || this.isWorldHelperAvailable?.(type) === false) return false;
        const base = {moon:'moonBase',mars:'marsBase',jupiter:'cloudBase',titan:'titanBase'}[this.currentLevel], owned = this.getHelperArrayForLevel();
        if (base && type !== base && !owned.some(h=>h.type===base)) return false;
        if (type==='jupiterRocket' && !owned.some(h=>h.type==='spaceBass')) return false;
        return true;
    };
    proto.quoteMaxHelpers = function (type, limit = config.maxPerGesture) {
        if (!this.canBulkBuyHelper(type) || !Number.isFinite(this.dogecoins)) return {count:0,cost:0};
        const data = window.shopManager.shopData[this.getHelperCategoryForLevel()][type], owned = this.getHelperArrayForLevel().filter(h=>h.type===type).length;
        let count=0,cost=0;
        for (;count<Math.min(config.maxPerGesture,Math.max(0,Math.floor(limit)));count++) {
            const next=this.getHelperCost(data.baseCost,owned+count,type);
            if (!(next>0) || !Number.isFinite(next) || cost+next>this.dogecoins) break;
            cost+=next;
        }
        return {count,cost};
    };
    proto.cancelHelperBuyBursts = function () {
        for (const job of this._helperBuyBursts?.values() || []) {job.ended=true;clearTimeout(job.timer);}
        this._helperBuyBursts = new Map();
    };
    proto.buyMaxHelpers = function (type, requested = this.quoteMaxHelpers(type).count) {
        const quantity=Math.min(config.maxPerGesture,Math.max(0,Math.floor(requested)));
        if (!quantity || !this.canBulkBuyHelper(type)) return 0;
        // Finish any pending field restoration before registering the new burst.
        this.syncFieldLoot?.();
        this._helperBuyBursts ||= new Map();
        const old=this._helperBuyBursts.get(type); if(old){old.ended=true;clearTimeout(old.timer);}
        const {steps,interval}=burstPlan(quantity), job={type,level:this.currentLevel,epoch:this._currencyFlightEpoch||0,bought:0,spent:0,wave:0,ended:false};
        this._helperBuyBursts.set(type,job);
        const end=()=>{
            if(job.ended)return;job.ended=true;clearTimeout(job.timer);if(this._helperBuyBursts.get(type)===job)this._helperBuyBursts.delete(type);
            if(job.launch && job.bought>0)setTimeout(()=>{
                if(job.epoch===(this._currencyFlightEpoch||0)&&this.currentLevel==='earth'&&!this.hasPlayedMoonLaunch&&this.helpers.some(h=>h.type==='spaceRocket'))this.playMoonLaunchCutscene();
            },540);
        };
        const step=()=>{
            if(job.ended || job.level!==this.currentLevel || job.epoch!==(this._currencyFlightEpoch||0) || !this.canBulkBuyHelper(type))return end();
            const n=Math.ceil((quantity-job.bought)/(steps-job.wave)), before={...this}, category=this.getHelperCategoryForLevel();
            this[category]=[...this[category]];this.placedHelpers=[...this.placedHelpers];
            let bought=0,failed=false;this._bulkBuying=true;
            try {
                for(let i=0;i<n;i++){if(!this.buyHelper(type))break;bought++;}
                this.updateDPS();
                if(bought && !(window.saveManager?.commitHelperPurchase?.() ?? window.saveManager?.commitFieldLoot?.()))throw Error('Purchase could not be saved.');
            } catch(error) {
                for(const key of Object.keys(this))if(!Object.hasOwn(before,key))delete this[key];Object.assign(this,before);failed=true;bought=0;
                this.refreshHelperField();this.showNotification?.('Purchase could not be saved. Try again.');
            } finally {this._bulkBuying=false;}
            if(bought&&type==='spaceRocket'&&!before.helpers.some(h=>h.type==='spaceRocket'))job.launch=true;
            job.bought+=bought;job.spent+=before.dogecoins-this.dogecoins;job.wave++;
            this.updateUI(true);this.updateShopPrices();this.updateMobileHelperBar?.();
            if(bought){this.flashDogecoinAmount('red');sound('ching',undefined,1+.6*(steps>1?(job.wave-1)/(steps-1):0));}
            if(failed || bought<n || job.bought>=quantity || job.wave>=steps)return end();
            job.timer=setTimeout(step,interval);
        };
        step();return quantity;
    };
    const reset=proto.resetFieldLootPresentation;
    proto.resetFieldLootPresentation=function(...args){this.cancelHelperBuyBursts();dismiss('retract',true);return reset.apply(this,args);};

    let gesture=null,suppressed=null;
    const departing=new Set();
    const host=target=>target?.closest?.('.shop-buy-btn[data-helper-type]');
    const particleColors=Object.freeze(['#ff5a5f','#ffb400','#00a699','#7b61ff','#3ec1f3','#61d134']);
    const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
    const reduced=()=>window.matchMedia?.('(prefers-reduced-motion:reduce)').matches===true;
    // Source lS: substep the spring so motion follows elapsed time at any refresh rate.
    function spring(value,target,stiffness,damping,dt){
        const elapsed=Math.min(Math.max(dt,0),.064);if(!elapsed)return value;
        const steps=Math.ceil(240*elapsed),step=elapsed/steps;
        for(let i=0;i<steps;i++){value.v+=(stiffness*(target-value.x)-damping*value.v)*step;value.x+=value.v*step;}
        return value;
    }
    function bodyFrame({open,velocity,arm=0,squash=0,leanX=0,leanY=0,time=0,armed=false,stale=false,reduced=false,height=58,gap=24,shift=0,fireAge=null}){
        const amount=Math.max(0,open),pressed=clamp(arm,0,1.3),stretch=reduced?0:clamp(.035*velocity,-.28,.28);
        const idle=reduced||stale||armed?0:.015*Math.sin(7*time),grow=1+.08*pressed;
        const frame={sx:amount*grow*(1-.45*stretch)*(1+idle)*(1-.6*squash),sy:amount*grow*(1+stretch)*(1-idle)*(1+squash),
            cx:shift*Math.min(1,amount)+leanX,cy:-(gap+height/2)*open+leanY,labelAlpha:clamp(1.6*open-.4,0,1),opacity:1};
        if(fireAge!==null){const t=clamp(fireAge/.2,0,1);frame.sx=frame.sy=1+.35*t;frame.opacity=1-t;}
        return frame;
    }
    function chevrons({age=0,open=1,arm=0,cx=0,cy=-44,sy=1,height=40,stale=false,reduced=false}){
        if(stale||reduced)return[];
        const start=-4,end=cy+height/2*sy+4,u=clamp(arm,0,1),alpha=clamp(open,0,1)*(1-u);
        if(end>=start||alpha<=.01)return[];
        return [0,1].map(i=>{const phase=(age/.6+i/3)%1;return{x:cx*phase,y:start+(end-start)*Math.min(1,phase+.5*u),opacity:(.3+.7*Math.sin(Math.PI*phase))*alpha};});
    }
    function removeView(state){
        cancelWorldFrame(state.frame);clearTimeout(state.safety);state.root?.remove();departing.delete(state);
    }
    function dismiss(kind='retract',immediate=false){
        if(immediate)for(const old of [...departing])removeView(old);
        const state=gesture;if(!state)return;
        gesture=null;clearTimeout(state.charge);clearTimeout(state.open);clearTimeout(state.expiry);clearInterval(state.quoteTimer);
        state.button?.classList.remove('buy-max-charging');
        if(!state.root||immediate)return removeView(state);
        state.phase='exit';state.exit=kind;state.exitAge=0;state.root.classList.add('buy-max-leaving');state.root.setAttribute('aria-hidden','true');state.action.tabIndex=-1;
        state.armed=kind==='fire';state.pointerPosition=null;state.action.classList.toggle('armed',kind==='fire');departing.add(state);
        if(kind==='fire'&&!reduced()){
            const colors=particleColors;
            state.particles=Array.from({length:18},(_,i)=>{
                const spread=2*(i/17-.5),node=document.createElement('span'),size=4+3*Math.random();
                node.className='buy-max-particle';Object.assign(node.style,{width:size+'px',height:size+'px',background:colors[i%colors.length]});state.root.append(node);
                return{node,x:state.shift+spread*176*.35,y:state.restCY+10*(Math.random()-.5),vx:140*spread+120*(Math.random()-.5),vy:-180-220*Math.random(),rot:Math.random()*Math.PI,vr:14*(Math.random()-.5),age:0,ttl:.55+.35*Math.random()};
            });
        }
        if(kind==='nope')state.leanX.v+=320;
        state.safety=setTimeout(()=>removeView(state),1600);
    }
    function place(state){
        const r=state.button.getBoundingClientRect(),width=176,height=58,gap=state.touch?28:24,above=r.top>=height+gap+6;
        const center=r.left+r.width/2,fit=clamp(center,width/2+6,innerWidth-width/2-6);
        state.anchorX=center;state.anchorY=above?r.top:r.bottom;state.direction=above?1:-1;state.shift=fit-center;state.height=height;state.gap=gap;state.restCY=-(gap+height/2);
        Object.assign(state.root.style,{left:center-width/2+'px',top:state.anchorY+'px'});
        state.root.classList.toggle('below',!above);
    }
    function animateView(state){
        if(!state.root.isConnected)return removeView(state);
        const now=performance.now(),dt=Math.max(0,Math.min(.064,(now-state.lastFrame)/1000));state.lastFrame=now;
        const exiting=state.phase==='exit',r=reduced();state.age+=dt;if(exiting)state.exitAge+=dt;
        const heldNope=exiting&&state.exit==='nope'&&state.exitAge<.28;
        const target=exiting&&state.exit!=='fire'&&!heldNope?0:1,stiffness=exiting&&state.exit==='fire'?1800:420;
        const pointer=state.pointerPosition,dx=pointer?pointer.x-(state.anchorX+state.shift):0,dy=pointer?pointer.y-(state.anchorY+state.direction*state.restCY):0;
        for(const [value,to,k,damp]of [[state.reveal,target,stiffness,exiting?2*Math.sqrt(stiffness):17],[state.arm,state.armed&&!state.stale?1:0,504,22.1],[state.squash,0,900,30],
            [state.leanX,clamp(.3*dx,-15,15),336,17],[state.leanY,clamp(.3*dy,-9,9),336,17]]){
            if(r){value.x=to;value.v=0;}else spring(value,to,k,damp,dt);
        }
        const frame=bodyFrame({open:state.reveal.x,velocity:state.reveal.v,arm:state.arm.x,squash:state.squash.x,leanX:state.leanX.x,leanY:state.leanY.x,time:now/1000,
            armed:state.armed,stale:state.stale,reduced:r,height:state.height,gap:state.gap,shift:state.shift,fireAge:exiting&&state.exit==='fire'?state.exitAge:null});
        const half=88*frame.sx,center=state.anchorX+frame.cx;
        frame.cx+=clamp(center,half+4,Math.max(half+4,innerWidth-half-4))-center;
        state.action.style.transform=`translate(${frame.cx}px,${state.direction*frame.cy}px) scale(${frame.sx},${frame.sy})`;
        state.action.style.opacity=String(frame.opacity*(state.stale ? .6 : state.phase==='linger'&&!state.armed ? .85 : 1));
        state.action.querySelector('.buy-max-label').style.opacity=String(frame.labelAlpha);
        const cues=exiting?[]:chevrons({age:state.age,open:state.reveal.x,arm:state.arm.x,cx:frame.cx,cy:frame.cy,sy:frame.sy,height:state.height,stale:state.stale,reduced:r});
        state.cues.forEach((node,i)=>{const cue=cues[i];node.hidden=!cue;if(cue)Object.assign(node.style,{left:(88+cue.x-8)+'px',top:(state.direction*cue.y-6)+'px',opacity:String(cue.opacity)});});
        state.particles=(state.particles||[]).filter(p=>{
            p.age+=dt;p.vy+=900*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
            Object.assign(p.node.style,{translate:`${88+p.x}px ${state.direction*p.y}px`,rotate:p.rot+'rad',opacity:String(1-p.age/p.ttl)});
            if(p.age>=p.ttl){p.node.remove();return false;}return true;
        });
        if(exiting&&!state.particles.length&&!heldNope&&(state.exit==='fire'?state.exitAge>.2:state.reveal.x<.03&&Math.abs(state.reveal.v)<1.5))return removeView(state);
        state.frame=requestWorldFrame(()=>animateView(state));
    }
    function refresh(state){
        if(gesture!==state)return;
        if(state.level!==window.game?.currentLevel || state.epoch!==(window.game?._currencyFlightEpoch||0))return dismiss();
        const quote=window.game.quoteMaxHelpers(state.type);state.quote=quote;
        state.action.querySelector('.buy-max-label').textContent=label(quote.count);
        state.stale=quote.count<2;state.action.querySelector('.buy-max-price-value').textContent=state.stale?'Need two affordable helpers':window.game.formatNumber(quote.cost);
        state.action.querySelector('.buy-max-price-icon').hidden=state.stale;
        state.action.setAttribute('aria-disabled',String(quote.count<2));
    }
    function open(state,forced=false){
        if(gesture!==state||state.phase!=='holding')return;
        clearTimeout(state.charge);clearTimeout(state.open);state.button.classList.remove('buy-max-charging');state.phase='open';state.forced=forced;state.openedAt=performance.now();
        const root=state.root=document.createElement('div');root.className='buy-max-popover';
        const button=state.action=document.createElement('button');button.className='shop-buy-btn buy-max-action';button.type='button';
        const title=document.createElement('span');title.className='buy-max-label';const price=document.createElement('small');price.className='buy-max-price';
        const icon=document.createElement('img');icon.className='buy-max-price-icon';icon.src='assets/general/dogecoin_70x70.webp';icon.alt='Dogecoin';
        const value=document.createElement('span');value.className='buy-max-price-value';price.append(icon,value);button.append(title,price);
        const theme=getComputedStyle(state.button);button.style.background=theme.background;button.style.color=theme.color;button.style.borderColor=theme.borderColor;root.style.setProperty('--buy-max-border',theme.borderTopColor);
        root.append(button);state.cues=[0,1].map(()=>{const cue=document.createElement('span');cue.className='buy-max-cue';cue.setAttribute('aria-hidden','true');root.append(cue);return cue;});
        document.body.append(root);place(state);refresh(state);
        state.reveal={x:0,v:forced?6:2};state.arm={x:0,v:0};state.squash={x:0,v:0};state.leanX={x:0,v:0};state.leanY={x:0,v:0};state.age=forced?1:0;state.lastFrame=performance.now();
        animateView(state);
        if(!forced)sound('pop1',.4);
        state.quoteTimer=setInterval(()=>refresh(state),200);
        button.addEventListener('pointerenter',()=>{if(state.phase==='linger'){clearTimeout(state.expiry);state.armed=true;state.action.classList.add('armed');}});
        button.addEventListener('pointerleave',()=>{if(gesture===state&&state.phase==='linger'){state.armed=false;state.action.classList.remove('armed');clearTimeout(state.expiry);state.expiry=setTimeout(()=>dismiss(),config.lingerMs);}});
        button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();purchase(state);});
    }
    function purchase(state){
        if(gesture!==state)return;const quote=window.game.quoteMaxHelpers(state.type);if(quote.count<2){sound('uhoh',.3);dismiss('nope');return;}
        const type=state.type;dismiss('fire');suppressed={type,until:performance.now()+650};window.game.buyMaxHelpers(type,quote.count);
    }
    function linger(state){state.phase='linger';state.armed=false;state.pointerPosition=null;state.action.classList.remove('armed');state.expiry=setTimeout(()=>dismiss(),config.lingerMs);}
    document.addEventListener('pointerdown',event=>{
        if(event.button>0 || event.target.closest?.('.buy-max-popover'))return;
        const button=host(event.target);if(!button||button.disabled)return;
        suppressed=null;dismiss();const state=gesture={button,type:button.dataset.helperType,level:window.game?.currentLevel,epoch:window.game?._currencyFlightEpoch||0,
            x:event.clientX,y:event.clientY,pointer:event.pointerId,touch:event.pointerType==='touch',phase:'holding'};
        state.charge=setTimeout(()=>{if(gesture===state)button.classList.add('buy-max-charging');},config.chargeDelayMs);
        state.open=setTimeout(()=>open(state),config.holdMs);
    },true);
    document.addEventListener('pointermove',event=>{
        const state=gesture;if(!state||state.pointer!==event.pointerId||state.phase==='linger')return;
        const dx=event.clientX-state.x,dy=event.clientY-state.y,r=state.button.getBoundingClientRect(),rise=state.touch?config.pickRiseTouch:config.pickRise;
        if(state.phase==='holding'){
            if(event.clientY<r.top&&Math.abs(event.clientX-(r.left+r.width/2))<=r.width/2+16&&-dy>=rise)open(state,true);
            else if(dx*dx+Math.max(0,dy)**2>config.holdSlop**2){suppressed={type:state.type,until:performance.now()+650};dismiss();return;}
        }
        if(state.phase==='open'){
            const box=state.action.getBoundingClientRect();state.pointerPosition={x:event.clientX,y:event.clientY};
            state.armed=event.clientX>=box.left-16&&event.clientX<=box.right+16&&(state.direction===1?event.clientY>=box.top-16&&event.clientY<state.anchorY:event.clientY<=box.bottom+16&&event.clientY>state.anchorY)&&-dy>=rise;
            if(state.armed!==state.wasArmed)state.squash.v+=state.armed?-3.5:1.5;
            if(state.armed&&!state.wasArmed)sound(state.quote.count<2?'swipe_fast_low':'biblip',.3);state.wasArmed=state.armed;
            state.action.classList.toggle('armed',state.armed);if(event.cancelable)event.preventDefault();
        }
    },{capture:true,passive:false});
    document.addEventListener('pointerup',event=>{
        const state=gesture;if(!state||state.pointer!==event.pointerId||state.phase==='linger')return;
        if(state.phase==='holding')return dismiss();
        if(state.armed&&(!state.forced||performance.now()-state.openedAt>=120)){event.preventDefault();event.stopPropagation();purchase(state);}
        else {
            const r=state.button.getBoundingClientRect(),onButton=event.clientX>=r.left&&event.clientX<=r.right&&event.clientY>=r.top&&event.clientY<=r.bottom;
            linger(state);
            // The moving bubble can pass under the pointer during entry. Resolve
            // source release-on-button explicitly instead of relying on DOM click targeting.
            if(onButton){event.preventDefault();event.stopPropagation();state.button.click();suppressed={type:state.type,until:performance.now()+650};}
        }
    },true);
    document.addEventListener('pointercancel',()=>{if(gesture)suppressed={type:gesture.type,until:performance.now()+650};dismiss();},true);
    document.addEventListener('click',event=>{const b=host(event.target);if(b&&suppressed?.type===b.dataset.helperType&&performance.now()<suppressed.until){event.preventDefault();event.stopImmediatePropagation();}},true);
    document.addEventListener('keydown',event=>{
        if(event.key==='Escape'&&gesture){suppressed={type:gesture.type,until:performance.now()+650};event.preventDefault();event.stopImmediatePropagation();dismiss();return;}
        const button=host(event.target);if(event.key!=='Enter'||!event.shiftKey||!button||button.disabled)return;
        event.preventDefault();event.stopImmediatePropagation();dismiss();const r=button.getBoundingClientRect();
        const state=gesture={button,type:button.dataset.helperType,level:window.game.currentLevel,epoch:window.game._currencyFlightEpoch||0,x:r.left+r.width/2,y:r.top+r.height/2,phase:'holding'};
        open(state);linger(state);state.action.focus({preventScroll:true});
    },true);
    document.addEventListener('pointerover',event=>{const button=host(event.target);if(button){button.title='Hold for Buy Max';button.setAttribute('aria-keyshortcuts','Shift+Enter');}},true);
    document.addEventListener('scroll',event=>{if(gesture&&event.target!==gesture.action)dismiss();},true);
    window.addEventListener('blur',()=>dismiss());window.addEventListener('resize',()=>dismiss());
    window.DogeMinerBulkShop=Object.freeze({config,label,burstPlan,dismiss,spring,bodyFrame,chevrons,particleColors});
})();
