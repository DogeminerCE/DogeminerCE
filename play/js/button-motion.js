// DM2 shared-button profiles, adapted to DOM controls. Input and transactions
// stay with their existing owners; this module never clicks or prevents input.
(function () {
    'use strict';
    const popup = Object.freeze({enabled:true,hoverLift:3,hoverScale:1.04,hoverMs:260,hoverBounce:2.5,
        pressScale:.9,pressMs:80,releaseStyle:'Back',releaseMs:450,releaseBounce:3,releaseWobble:.35,
        leaveMs:300,popInEnabled:true,popInFrom:.6,popInMs:500,popInBounce:2.2});
    const buy = Object.freeze({...popup,hoverLift:2,hoverScale:1.02,hoverMs:220,hoverBounce:1.5,
        pressScale:.95,releaseStyle:'Elastic',releaseMs:320,releaseBounce:1.8,releaseWobble:.5,
        leaveMs:260,popInFrom:.85,popInMs:350,popInBounce:1.5});
    const profiles = Object.freeze({popup,buy});
    const buySelector = '.shop-buy-btn:not(.buy-max-action),.shop-upgrade-btn,.searchdoge-unlock-btn';
    const popupSelector = '.beta-balance-continue,.beta-balance-close,.dia-btn,.dia-warning-btn,.switcher-btn,.controller-dialog-box button';
    const selector = buySelector + ',' + popupSelector;
    const states = new Map();
    const rest = {k:1,lift:0};
    const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
    const disabled = node => node.disabled || node.matches('[aria-disabled="true"],.disabled,.locked,.unaffordable') || !!node.closest('[inert]');
    function ease(name, t) {
        if (t === 0 || t === 1) return t;
        if (name === 'power2.out') return 1 - (1-t)**3;
        const amount = Number(name.match(/\((?:1,\s*)?([\d.]+)\)/)?.[1]);
        if (name.startsWith('elastic')) return 2**(-10*t)*Math.sin((t-amount/4)*2*Math.PI/amount)+1;
        const x = t-1;return x*x*((amount+1)*x+amount)+1;
    }
    const releaseEase = p => p.releaseStyle === 'Elastic' ? `elastic.out(1, ${p.releaseWobble})` : `back.out(${p.releaseBounce})`;
    function spec(profile, action, releasing = false) {
        const p = profiles[profile];
        if (action === 'hover') return {k:p.hoverScale,lift:p.hoverLift,ms:p.hoverMs,ease:`back.out(${p.hoverBounce})`};
        if (action === 'press') return {k:p.pressScale,lift:0,ms:p.pressMs,ease:'power2.out'};
        if (action === 'release') return {k:p.hoverScale,lift:p.hoverLift,ms:p.releaseMs,ease:releaseEase(p)};
        if (action === 'popin') return {...rest,ms:p.popInMs,ease:`back.out(${p.popInBounce})`};
        return {...rest,ms:releasing?p.releaseMs:p.leaveMs,ease:releasing?releaseEase(p):`back.out(${p.hoverBounce})`};
    }
    const transform = (state,value) => `${state.anchor?'translate(-50%,50%) ':''}translateY(${-value.lift}px) scale(${value.k})`;
    function current(state) {
        if(!state.animation||!state.frames)return state.value;
        const t=Math.max(0,Math.min(1,((state.animation.currentTime||0)-state.delay)/state.ms));
        const at=t*(state.frames.length-1),i=Math.floor(at),a=state.frames[i],b=state.frames[Math.min(i+1,state.frames.length-1)];
        return {k:a.k+(b.k-a.k)*(at-i),lift:a.lift+(b.lift-a.lift)*(at-i)};
    }
    function cancel(state, settle = false) {
        state.animation?.cancel();state.animation = null;
        if (settle) {state.value={...rest};state.node.style.transform=transform(state,rest);state.phase = 'rest';state.pressed = false;state.activated = false;}
    }
    function animate(state, action, delay = 0) {
        const {node,profile} = state;
        if (!node.isConnected || reduced() || disabled(node)) {cancel(state,true);return;}
        const from = {...current(state)};
        const end = spec(profile,action,state.phase === 'release');
        cancel(state);state.phase = action;
        if (action === 'popin') {from.k = profiles[profile].popInFrom;from.lift = 0;}
        // Dense source easing samples are interpolated by Web Animations at
        // the display rate. Compose the centered anchor before scale/lift so
        // report buttons keep their layout throughout the animation.
        const steps = Math.ceil(end.ms/8);
        state.frames=Array.from({length:steps+1},(_,i)=>{
            const t=i/steps,k=ease(end.ease,t);
            return {k:from.k+(end.k-from.k)*k,lift:from.lift+(end.lift-from.lift)*k};
        });
        state.ms=end.ms;state.delay=delay;
        const frames=state.frames.map((value,i)=>({offset:i/steps,transform:transform(state,value)}));
        const animation = node.animate(frames,{duration:end.ms,delay,fill:'both',easing:'linear'});
        state.animation = animation;
        animation.onfinish = () => {
            if (state.animation !== animation) return;
            state.value={k:end.k,lift:end.lift};node.style.transform=transform(state,state.value);
            state.animation = null;state.activated = false;
            state.phase = action === 'leave' || action === 'popin' ? 'rest' : action === 'release' ? 'hover' : action;
            animation.cancel();
        };
    }
    function target(event) {return event.target?.closest?.(selector);}
    function mount(node) {
        if (!node || !node.matches(selector) || states.has(node)) return states.get(node);
        const key = node.matches('.shop-buy-btn[data-helper-type]')
            ? (node.closest('#mobile-shop-content')?'mobile:':'desktop:')+node.dataset.helperType : null;
        const state = {node,key,anchor:node.matches('.beta-balance-continue')&&node.dataset.flowButton!=='true',value:{...rest},profile:node.matches(buySelector)?'buy':'popup',phase:'rest',pressed:false,visible:false};
        states.set(node,state);node.classList.add('dm2-button-motion');node.style.transform=transform(state,rest);return state;
    }
    function visible(node) {return !!node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden' && !node.closest('.popup-exiting,.closing');}
    function sync() {
        for (const node of document.querySelectorAll(selector)) mount(node);
        for (const [node,state] of states) {
            if (!node.isConnected) {
                // CE replaces shop DOM after buying. Carry only the feedback
                // for that same helper/control across the redraw, not a press
                // or a transaction. The shop still owns the updated price.
                const replacement=state.key && (['press','release'].includes(state.phase)||state.phase==='leave'&&state.activated)
                    && [...states.values()].find(s=>s.node.isConnected&&s.key===state.key);
                if(replacement&&!disabled(replacement.node)){
                    replacement.pointer=state.pointer;replacement.activated=true;
                    cancel(replacement);replacement.value={k:profiles.buy.pressScale,lift:0};
                    animate(replacement,'release');
                    if(state.pointer!=='mouse')animate(replacement,'leave');
                }
                cancel(state,true);states.delete(node);continue;
            }
            const shown = visible(node);
            if (shown && !state.visible && state.profile === 'popup') animate(state,'popin',node.matches('.beta-balance-close')?350:0);
            if (!shown || disabled(node)) cancel(state,true);
            state.visible = shown;
        }
    }
    function hover(event, leaving = false) {
        if (event.pointerType === 'touch') return;
        const node = target(event);
        if (!node || node.contains(event.relatedTarget)) return;
        const state = mount(node);if(!leaving&&state.phase==='release')return;
        if (!state.pressed) animate(state,leaving?'leave':'hover');
    }
    function down(event) {
        if (event.button != null && event.button !== 0 || event.isPrimary === false) return;
        const state = mount(target(event));
        if (!state || disabled(state.node) || state.pressed) return;
        state.activated = false;state.suppressClickMotion = false;state.pressed = true;state.pointer = event.pointerType || 'mouse';
        state.pointerId = event.pointerId;animate(state,'press');
    }
    function up(event, cancelled = false) {
        const node = target(event);
        for (const state of states.values()) if (state.pressed) {
            if (event.pointerId != null && state.pointerId != null && event.pointerId !== state.pointerId) continue;
            state.pressed = false;state.suppressClickMotion = !cancelled;
            const inside = !cancelled && node === state.node;state.activated=inside;
            animate(state,inside?'release':'leave');
            // Touch and keyboard have no persistent hover destination.
            if (inside && state.pointer !== 'mouse') animate(state,'leave');
        }
    }
    function key(event, pressed) {
        if (![' ','Enter'].includes(event.key) || event.repeat) return;
        const state = mount(target(event));if (!state || disabled(state.node)) return;
        if (pressed) {state.suppressClickMotion = false;state.pressed = true;state.pointer = 'keyboard';animate(state,'press');}
        else if (state.pressed) {state.pressed = false;state.activated=true;state.suppressClickMotion = true;animate(state,'release');animate(state,'leave');}
    }
    function reset() {for (const state of states.values()) cancel(state,true);}
    document.addEventListener('pointerover',event=>hover(event),true);
    document.addEventListener('pointerout',event=>hover(event,true),true);
    document.addEventListener('pointerdown',down,true);
    document.addEventListener('pointerup',event=>up(event),true);
    document.addEventListener('pointercancel',event=>up(event,true),true);
    // CE's controller sends mouse events. Deduplication by pressed state leaves
    // the ordinary pointer→mouse compatibility sequence with one motion owner.
    document.addEventListener('mousedown',down,true);
    document.addEventListener('mouseup',event=>up(event),true);
    document.addEventListener('keydown',event=>key(event,true),true);
    document.addEventListener('keyup',event=>key(event,false),true);
    document.addEventListener('click',event=>{
        const state = mount(target(event));
        if (state?.suppressClickMotion) {state.suppressClickMotion = false;return;}
        if (state && !disabled(state.node) && state.phase !== 'release') {
            state.pressed=false;state.activated=true;if(event.detail===0)state.pointer='keyboard';
            animate(state,'release');if (event.detail === 0) animate(state,'leave');
        }
    },true);
    document.addEventListener('focusout',event=>{const state=states.get(target(event));if(state){state.pressed=false;animate(state,'leave');}},true);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
    window.addEventListener('blur',reset);
    window.addEventListener('scroll',()=>{for(const state of states.values())if(state.pressed){state.pressed=false;animate(state,'leave');}},true);
    window.matchMedia?.('(prefers-reduced-motion: reduce)').addEventListener?.('change',reset);
    // Ignore style mutations produced by our own animations and currency ticks.
    new MutationObserver(records=>{
        const includesControl=node=>node.nodeType===1&&(node.matches(selector)||!!node.querySelector(selector));
        if(records.some(r=>r.type==='childList'?[...r.addedNodes,...r.removedNodes].some(includesControl):includesControl(r.target)))sync();
    }).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden','disabled','inert','aria-disabled']});
    sync();
    window.DogeMinerButtonMotion = Object.freeze({profiles,spec,ease,refresh:sync,reset});
})();
